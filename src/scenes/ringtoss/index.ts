import type { SceneContext, SceneFactory, SceneModule } from "../types";
import { subscribe, unsubscribe } from "../../lib/raf";

/**
 * Water ring toss, the handheld toy, simulated.
 *
 * Rings are Verlet particles. Verlet rather than Euler because it stays stable
 * under the stiff positional corrections used for collisions: position is
 * derived from the previous two positions, so a correction implicitly adjusts
 * velocity too and the system does not gain energy the way an explicit
 * integrator does.
 *
 *   x' = x + (x - x_prev) * damping + a * dt^2
 *
 * Forces per ring: gravity, buoyancy (rings are slightly buoyant, so they drift
 * up slowly when still), quadratic drag through the water, and an impulse from
 * the jet when the button is pressed. Collisions resolve against the chamber
 * walls and the pegs positionally, with restitution applied by scaling the
 * implied velocity.
 */

/* Taken from the reference toy: a flat, saturated red shell around a pale blue
 * tank, drawn as a toy rather than as a rendered object. */
const COL = {
  body: "#f5231b",
  bodyDark: "#c8140f",
  bodyLight: "#ff5b4a",
  water: "#7fd4f0",
  waterDeep: "#5cc3e8",
  glass: "#8fdcf5",
  peg: "#e8e2d6",
  pegDark: "#b9b0a0",
  ink: "#14110e",
};

const RING_COLOURS = ["#e8b33a", "#3f9d54", "#2f6fb5", "#d1483c", "#8a56a8", "#2fa8a0"];

type Ring = {
  x: number;
  y: number;
  px: number;
  py: number;
  r: number;
  colour: string;
  /** Index of the peg this ring is seated on, or -1. */
  onPeg: number;
  /**
   * Orientation. The simulation stays 2D, it is the only tractable thing on a
   * flat canvas, but a real ring is a disc in space, so it is drawn as an
   * ellipse whose minor axis is the disc seen edge-on.
   *
   * `spin` is the disc's angle about the screen normal (which way the ellipse
   * points) and `tilt` is its angle out of the screen plane: 0 is edge-on, and
   * pi/2 is face-on. A tumbling ring carries angular velocity in both; a seated
   * ring is driven to face-on so it lies flat around its peg.
   */
  spin: number;
  spinV: number;
  tilt: number;
  tiltV: number;
  /** Height up the peg once seated, so stacked rings rest on each other. */
  seatDepth: number;
  /** What landing this ring on a peg is worth. */
  points: number;
};

/**
 * Rings a single peg will hold. Six rings over two pegs at three each, so the
 * board fills exactly and can be cleared completely.
 */
const PEG_CAPACITY = 3;

/** Point values, one per ring, so some are worth chasing more than others. */
const RING_POINTS = [10, 25, 50, 15, 30, 20];

/**
 * How far off edge-on a ring settles once it is threaded on a peg, in radians.
 *
 * The ellipse's minor axis is r * |sin(tilt)|, so this is what keeps a seated
 * ring a visible disc: at 0 it collapses to a line. 0.42 foreshortens it to
 * about 41% of its radius, steep enough to read as threaded on the peg rather
 * than floating in front of it.
 */
const SEAT_LEAN = 0.42;

type Peg = { x: number; y: number; r: number; h: number };

function createScene(): SceneModule {
  let canvas: HTMLCanvasElement | null = null;
  let c: CanvasRenderingContext2D | null = null;
  let button: HTMLButtonElement | null = null;
  let sideBtn: HTMLButtonElement | null = null;
  let scoreEl: HTMLElement | null = null;
  let score = 0;
  /** Simulation clock for the jet's sway. */
  let wobble = 0;
  /** Seconds until a full board is flung apart, or 0 when not clearing. */
  let clearIn = 0;
  /** Seconds during which rings cannot seat, after a board is flung apart. */
  let seatLock = 0;
  let tr: (k: string) => string = () => "";
  let w = 0;
  let h = 0;
  let dpr = 1;
  let tick: ((dt: number) => void) | null = null;
  let pumping = 0; // seconds of centre jet remaining
  let sideJet = 0; // seconds of the left/right wall jets remaining
  let rings: Ring[] = [];
  let pegs: Peg[] = [];
  let bubbles: { x: number; y: number; v: number; r: number }[] = [];

  // Chamber geometry in canvas units, recomputed on resize.
  let box = { x: 0, y: 0, w: 0, h: 0 };

  function layout(): void {
    // Proportions taken from the reference photo of the toy: a broad tank,
    // wider than it is tall, set inside a red shell, over a wide base that
    // carries the pump on its right.
    //
    // The chamber floor is derived from the top of the base rather than
    // computed independently. Previously the two were worked out separately and
    // disagreed by a few percent of the height, leaving a band below the floor
    // where rings came to rest outside the glass.
    // The base has to be tall enough to carry a pump button that can actually
    // be hit: it IS the control, so a base that collapses to a few pixels makes
    // the toy unplayable at wall size.
    const baseH = Math.max(h * 0.26, 34);
    const top = h * 0.05;
    const floorY = h - baseH;

    // The tank fills most of the width, as in the reference, rather than being
    // the narrow column it was before.
    const cw = Math.min(w * 0.72, (floorY - top) * 1.5);
    box = {
      x: (w - cw) / 2,
      y: top,
      w: cw,
      h: floorY - top,
    };

    // Two tall pegs standing off the floor, closer together than the tank is
    // wide, the reference shows them well inboard with the rings threaded on.
    // They are tall relative to the tank so there is clear water above the tips
    // for a ring to be lifted into and dropped onto them.
    const pegR = box.w * 0.028;
    const pegH = box.h * 0.5;
    const floor = box.y + box.h;
    // Well apart, so a ring has clear water to fall into around each one. Set
    // close together they effectively formed a single target and the last ring
    // had nowhere to land.
    pegs = [
      { x: box.x + box.w * 0.27, y: floor, r: pegR, h: pegH },
      { x: box.x + box.w * 0.73, y: floor, r: pegR, h: pegH },
    ];
  }

  function seed(): void {
    // Sized so the whole set fits the floor in one row without overlapping:
    // six rings need six diameters plus a hair, and 0.078 * 2 * 6 is just under
    // the tank's width. At the old 0.1 the six would not fit and the outer two
    // were pushed through the glass by the wall correction on the first frame.
    const ringR = box.w * 0.078;
    // Spread across the floor by more than a ring DIAMETER. At the original
    // 0.14 spacing the rings overlapped each other by a third, so on the still
    // frame they merged into a single band of colour rather than reading as
    // separate rings.
    const gap = 0.163;
    const span = gap * (RING_COLOURS.length - 1);
    rings = RING_COLOURS.map((colour, i) => {
      const x = box.x + box.w * (0.5 - span / 2 + gap * i);
      const y = box.y + box.h - ringR - 4;
      return {
        x,
        y,
        px: x,
        py: y,
        r: ringR,
        colour,
        onPeg: -1,
        // FACE-ON at rest. The ellipse's minor axis is r * |sin(tilt)|, so
        // tilt = pi/2 is the full circle and tilt = 0 collapses to a line: a
        // ring seeded near 0 was drawn as the clamped 6%-of-radius sliver and
        // the whole toy read as one horizontal streak. Each ring is off by a
        // little so they do not read as one stamped shape; they turn over about
        // this axis once the water starts moving them.
        spin: 0,
        spinV: 0,
        tilt: Math.PI / 2 + i * 0.05,
        tiltV: 0,
        seatDepth: 0,
        points: RING_POINTS[i] ?? 10,
      };
    });
    bubbles = [];
  }

  function step(dt: number): void {
    // Forces are expressed per tank-height rather than in absolute pixels, so
    // the toy plays the same whether it is 150px on the wall or full screen.
    // With fixed pixel values the rings barely cleared the pegs in the small
    // box and were flung out of the tank in the large one.
    const H = Math.max(1, box.h);
    const g = H * 2.6;
    // Rings are buoyant but NOT neutrally so: with the two nearly cancelling,
    // a ring lifted to the peg tips simply hung there and never came back down
    // to seat. The net is a clear, slow sink once the jet is off.
    const buoyancy = -H * 1.55;
    const damping = 0.986;
    const floor = box.y + box.h;

    for (const ring of rings) {
      // A seated ring stays put, but it still settles: it is driven face-on and
      // its spin bleeds off, so a ring that landed while tumbling comes to rest
      // lying flat around the peg rather than frozen mid-tumble.
      if (ring.onPeg >= 0) {
        // A seated ring STAYS seated. The jet no longer knocks rings back off:
        // a landed ring holding its place is what lets a round build towards a
        // full board, and the board is cleared only once every ring is on.
        //
        // Threaded on the peg, so the ring is seen at a STEEP angle: the peg
        // passes through it and the disc lies close to the screen plane. Not
        // fully edge-on, though — the ellipse's minor axis is r * |sin(tilt)|,
        // so an exactly edge-on ring (tilt = k*pi) collapses to the clamped
        // 6%-of-radius sliver and a seated ring became an invisible line. It
        // settles to a shallow offset off edge-on instead, which still reads as
        // threaded on the peg but stays a visible disc. Measured from the
        // NEAREST edge-on angle rather than an absolute one, since tilt runs
        // continuously and driving it to a fixed value would turn a ring
        // backwards to get there.
        const k = Math.round(ring.tilt / Math.PI);
        // Lean towards the side tilt already favours, so the ring settles the
        // short way round rather than swinging through edge-on to get there.
        const lean = ring.tilt >= k * Math.PI ? SEAT_LEAN : -SEAT_LEAN;
        const edge = k * Math.PI + lean;
        ring.tilt += (edge - ring.tilt) * Math.min(1, dt * 9);
        ring.tiltV *= 0.86;
        ring.spin += (0 - ring.spin) * Math.min(1, dt * 6);
        continue;
      }

      const vx = (ring.x - ring.px) * damping;
      const vy = (ring.y - ring.py) * damping;

      let ax = 0;
      let ay = g + buoyancy;

      // Quadratic drag, water resists much more strongly than air, which is
      // what makes the rings drift rather than fall. Scaled by tank height for
      // the same reason the other forces are.
      const speed = Math.hypot(vx, vy) / Math.max(dt, 1e-4);
      const dragK = 0.55 / H;
      ax -= vx * speed * dragK;
      ay -= vy * speed * dragK;

      // The jets: three plumes rising from nozzles across the floor, one at
      // the centre and one at each side. The side pair is what keeps rings off
      // the glass: a ring pinned against a wall used to sit outside the centre
      // The centre nozzle belongs to the pump; the two wall nozzles belong to
      // the side-jet button, so the two controls do visibly different things.
      // The side pair is also what keeps rings off the glass: a ring pinned
      // against a wall sits outside the centre nozzle's reach, and the nearest
      // wall jet lifts it and pushes it back inward.
      const active: number[] = [];
      if (pumping > 0) active.push(0.5);
      if (sideJet > 0) active.push(0.12, 0.88);

      if (active.length > 0) {
        for (const frac of active) {
          const nozzleX = box.x + box.w * frac;
          const dx = ring.x - nozzleX;
          const spread = box.w * 0.34;
          const falloff = Math.max(0, 1 - Math.abs(dx) / spread);
          if (falloff <= 0) continue;
          // The plume weakens towards the top of the tank as well as with
          // distance, so a ring carried up loses lift and falls back onto the
          // pegs. Without this, holding the pump down parked every ring against
          // the ceiling and nothing ever landed.
          const depth = Math.max(0, (ring.y - box.y) / box.h);
          ay -= H * 11 * falloff * depth * depth;
          // The side jets blow towards the middle. The centre one used to blow
          // rings AWAY from itself (`dx * 5.5`), which drove them past the pegs
          // and into the glass: over fifteen seconds of pumping the rings
          // crossed the peg tips only twice, at x=40 and x=143 with the pegs at
          // 64 and 126, so almost nothing could ever land.
          //
          // It now carries a ring towards the nearer PEG instead. The plume
          // still spreads a ring off the centre line, which is what stops it
          // hovering over the nozzle, but the direction it spreads to is a peg
          // rather than a wall.
          let inward: number;
          if (frac === 0.5) {
            const target = pegs.reduce(
              (best, peg) => (Math.abs(peg.x - ring.x) < Math.abs(best - ring.x) ? peg.x : best),
              pegs[0]?.x ?? nozzleX,
            );
            inward = (target - ring.x) * 4.5;
          } else {
            inward = (box.x + box.w * 0.5 - ring.x) * 5.0;
          }
          ax += inward * falloff;
        }

        // Each jet wanders rather than blowing dead straight. Without this the
        // flow is left/right symmetric, so rings were driven to the same three
        // resting places every time and never drifted over a peg. Driven by the
        // simulation clock, not Math.random, so a run stays reproducible.
        wobble += dt;
        const sway = Math.sin(wobble * 5.2 + ring.r) + Math.sin(wobble * 2.3 + ring.x * 0.05);
        ax += sway * box.w * 1.7;
      }

      ring.px = ring.x;
      ring.py = ring.y;
      ring.x += vx + ax * dt * dt;
      ring.y += vy + ay * dt * dt;

      // --- orientation ---
      //
      // The rings hang in the plane of the screen with their edge towards the
      // viewer, and tumble about their horizontal (x) axis as they are flung, // the way a thrown quoit turns over rather than spinning like a coin on a
      // table. `tilt` IS that rotation about x: it runs continuously rather
      // than being nudged towards a target, so a ring keeps turning over for as
      // long as the water is carrying it.
      const sp = Math.hypot(vx, vy) / Math.max(dt, 1e-4);

      // Vertical motion drives the tumble: a ring shot upward by a jet turns
      // over quickly, and one drifting sideways barely rotates.
      const vyPerSec = vy / Math.max(dt, 1e-4);
      ring.tiltV += -vyPerSec * 0.011 * dt;

      // Viscous damping, the angular counterpart of the drag on the linear
      // motion, water stops a tumble quickly once the jet is off.
      ring.tiltV *= 1 - Math.min(0.9, 1.1 * dt);
      ring.tilt += ring.tiltV * dt;

      // Buoyancy rights a nearly-still ring: a slightly buoyant disc settles
      // face-up, so rings at rest lie flat instead of frozen mid-turn.
      if (sp < 70) {
        const nearest = Math.round(ring.tilt / Math.PI) * Math.PI + Math.PI / 2;
        ring.tilt += (nearest - ring.tilt) * Math.min(1, dt * 1.4);
      }

      // The ring stays in the screen plane, so its long axis does not swing
      // about; only a slight lean, led by sideways drift, to avoid looking
      // mechanically level.
      ring.spin += ((vx / Math.max(dt, 1e-4)) * 0.0006 - ring.spin) * Math.min(1, dt * 3);

      // --- chamber walls ---
      const rest = 0.42;
      if (ring.x - ring.r < box.x) {
        ring.x = box.x + ring.r;
        ring.px = ring.x + (ring.x - ring.px) * rest;
      }
      if (ring.x + ring.r > box.x + box.w) {
        ring.x = box.x + box.w - ring.r;
        ring.px = ring.x + (ring.x - ring.px) * rest;
      }
      if (ring.y + ring.r > floor) {
        ring.y = floor - ring.r;
        ring.py = ring.y + (ring.y - ring.py) * rest;
      }
      if (ring.y - ring.r < box.y) {
        ring.y = box.y + ring.r;
        ring.py = ring.y + (ring.y - ring.py) * rest;
      }

      // --- pegs ---
      for (let pi = 0; pi < pegs.length; pi++) {
        const peg = pegs[pi];
        if (!peg) continue;
        const tipY = peg.y - peg.h;

        // A ring can only go on OVER THE TIP. It is a hoop: to capture the peg
        // its centre has to pass the tip from above while moving downward, the
        // way the real toy works. The seating window used to run most of the
        // way down the shaft, so a ring drifting sideways into the middle of a
        // peg snapped onto it, it appeared to pass straight through the shaft.
        //
        // A peg holds a limited number of rings, and each one seats at its own
        // height. Without both, every ring that met the condition was moved to
        // the same point on the same peg and then skipped by the integrator, so
        // they fused into one frozen stack that could never come apart.
        // The last ring on the board is given a slightly wider mouth. With a
        // uniform window it could be the only one left, circling between two
        // pegs that both already held rings, and the round would never finish.
        const loose = rings.filter((o) => o.onPeg < 0).length;
        const help = loose <= 1 ? 1.35 : 1;

        const seatedHere = rings.filter((o) => o.onPeg === pi).length;
        const dx = ring.x - peg.x;
        const dxPrev = ring.px - peg.x;

        // The mouth is the ring's own hole: the tip must be inside it. The ring
        // is stroked at `r * 0.42`, so the hole's inner edge is about `r * 0.79`
        // and that is where the geometric figure comes from.
        //
        // It also carries a floor measured against the TANK, not the ring. On
        // the wall the toy is 190px wide, which puts `r * 0.8` at about 8px: the
        // rings crossed the tips 20px out and nothing ever seated, because the
        // jet cannot steer a ring to eight pixels. The floor is what keeps the
        // piece playable at the size it actually hangs, and it scales with the
        // tank so fullscreen-sized play is unchanged.
        const mouth = Math.max(ring.r * 0.8 * help, peg.r + 1, box.w * 0.17 * help);
        const overMouth = Math.abs(dx) < mouth;

        // Coming down onto the tip from ABOVE it. The whole column of water
        // above the peg counts, not a thin band at tip height: a ring is lifted
        // well clear by the jet and sinks back quickly, so it was almost never
        // sampled inside a narrow band and the toy became unplayable. What
        // matters for "only from the top" is that the ring approaches from
        // above the tip and is descending, which is exactly this test.
        const falling = ring.y >= ring.py;
        // The ring's CENTRE has to have come down PAST the tip. The window used
        // to close at `tipY + r * 0.9`, which let a ring seat while its centre
        // was still most of a radius ABOVE the tip: it visibly snapped onto the
        // peg before reaching it.
        //
        // Tested as a SPAN across the frame rather than as two thresholds on
        // the current position: the ring was above the tip and now is not. A
        // pair of fixed thresholds fails whenever a fast ring clears both in a
        // single step, which is the common case here, and nothing ever seated.
        // The shaft below is still open for a descent that starts below the
        // tip, so a ring already alongside the peg is not captured by it.
        const crossedTip = ring.py < tipY && ring.y >= tipY;

        if (seatLock <= 0 && seatedHere < PEG_CAPACITY && overMouth && falling && crossedTip) {
          ring.onPeg = pi;
          ring.seatDepth = seatedHere;
          ring.x = peg.x;
          // The ring slides all the way down the peg and rests on the floor,
          // with each later ring stacking on top of the one before, the way
          // the real toy fills a peg from the bottom up.
          ring.y = peg.y - ring.r * 0.5 - seatedHere * ring.r * 0.62;
          ring.px = ring.x;
          ring.py = ring.y;
          score += ring.points;
          showScore();
          break;
        }

        // Otherwise the shaft is solid and the ring's RIM strikes it. A ring is
        // a hoop, so it is blocked when the shaft would cut its band, around
        // |dx| = r, and passes freely when it is centred over the shaft. The
        // old test blocked near |dx| = 0, which is exactly the case that should
        // be open, and left the band free to slide through.
        // Only below the tip: at tip height the ring is either going on or
        // passing over, and blocking there stopped rings from ever lining up.
        const overlapsShaft = ring.y > tipY + ring.r * 1.2 && ring.y - ring.r * 0.35 < peg.y;
        if (overlapsShaft && !overMouth) {
          const reach = mouth + peg.r;
          if (Math.abs(dx) < reach) {
            // Swept test: a fast ring could cross the shaft entirely between
            // frames, so the side it came from decides which way it is pushed
            // back out rather than its position after the fact.
            const side = Math.sign((Math.abs(dxPrev) > 1e-3 ? dxPrev : dx) || 1);
            ring.x = peg.x + reach * side;
            ring.px = ring.x + (ring.x - ring.px) * rest;
          }
        }
      }
    }

    // --- ring/ring separation, so they do not stack in one place ---
    for (let i = 0; i < rings.length; i++) {
      for (let j = i + 1; j < rings.length; j++) {
        const a = rings[i];
        const b = rings[j];
        if (!a || !b || a.onPeg >= 0 || b.onPeg >= 0) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const min = (a.r + b.r) * 0.86;
        if (d > 0 && d < min) {
          const push = (min - d) / 2;
          const nx = dx / d;
          const ny = dy / d;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
        }
      }
    }

    // --- bubbles, purely decorative but driven by the same jet state ---
    // Bubbles rise from whichever nozzles are actually running, so the two
    // controls read differently: the pump plumes up the middle, the side jets
    // up both walls.
    if (pumping > 0 && bubbles.length < 40) {
      bubbles.push({
        x: box.x + box.w * (0.42 + Math.sin(pumping * 40) * 0.08),
        y: box.y + box.h - 4,
        v: 90 + (bubbles.length % 7) * 14,
        r: 1.5 + (bubbles.length % 4),
      });
    }
    if (sideJet > 0 && bubbles.length < 40) {
      for (const frac of [0.12, 0.88]) {
        bubbles.push({
          x: box.x + box.w * frac + Math.sin(sideJet * 40) * box.w * 0.03,
          y: box.y + box.h - 4,
          v: 90 + (bubbles.length % 7) * 14,
          r: 1.5 + (bubbles.length % 4),
        });
      }
    }
    for (const b of bubbles) b.y -= b.v * dt;
    bubbles = bubbles.filter((b) => b.y > box.y);

    if (pumping > 0) pumping = Math.max(0, pumping - dt);
    if (sideJet > 0) sideJet = Math.max(0, sideJet - dt);
    if (seatLock > 0) seatLock = Math.max(0, seatLock - dt);

    // --- board cleared ---
    // With every ring on a peg there is nothing left to play, so the round is
    // held briefly for the score to be read and then the rings are flung off to
    // start again. The score itself carries over: it is a running total.
    if (rings.length > 0 && rings.every((ring) => ring.onPeg >= 0)) {
      if (clearIn === 0) clearIn = 1.6;
      else {
        clearIn -= dt;
        if (clearIn <= 0) {
          clearIn = 0;
          flingAll();
        }
      }
    } else {
      clearIn = 0;
    }
  }

  /**
   * Knock every ring off its peg and scatter it. Deterministic rather than
   * random: each ring is thrown by its index, so a cleared board always breaks
   * up the same way and the scene stays reproducible for the screenshot loop.
   */
  function flingAll(): void {
    // Scaled to the tank, like every other force here: fixed pixel impulses
    // barely moved the rings in the small wall-sized box, so most of them never
    // left their pegs at all.
    const kick = Math.max(1, box.h) * 0.055;
    rings.forEach((ring, i) => {
      ring.onPeg = -1;
      ring.seatDepth = 0;
      const dir = i % 2 === 0 ? -1 : 1;
      // Verlet: displacing the previous position IS applying a velocity.
      ring.px = ring.x + dir * kick * (0.8 + (i % 3) * 0.35);
      ring.py = ring.y + kick * (1.5 + (i % 4) * 0.25);
      ring.tiltV = dir * (9 + i * 2);
    });
    // Seating is suspended briefly, otherwise the rings drop straight back onto
    // the pegs they were just thrown from and the board never looks cleared.
    seatLock = 1.1;
  }

  function showScore(): void {
    if (!scoreEl) return;
    scoreEl.innerHTML = "";
    scoreEl.append(tr("game.ring.score"), " ");
    const b = document.createElement("b");
    b.textContent = String(score);
    scoreEl.appendChild(b);
  }

  function draw(): void {
    const ctx = c;
    if (!ctx) return;

    // Cleared, not filled: the toy is drawn straight onto the gallery wall, so
    // an opaque panel behind it reads as a white box around the piece.
    ctx.clearRect(0, 0, w, h);

    const r = Math.min(box.w, box.h) * 0.08;

    // --- the red shell behind the tank ---
    // In the reference the tank is inset into a red body with a visible bezel
    // all round and a cap bar across the top, so it is drawn first and the
    // water painted into it.
    const bez = Math.min(box.w, box.h) * 0.07;
    ctx.beginPath();
    ctx.roundRect(box.x - bez, box.y - bez, box.w + bez * 2, box.h + bez * 2, r * 1.6);
    ctx.fillStyle = COL.body;
    ctx.fill();

    // The cap bar across the top of the shell.
    ctx.beginPath();
    ctx.roundRect(
      box.x + box.w * 0.16,
      box.y - bez * 2.1,
      box.w * 0.68,
      bez * 1.5,
      bez * 0.5,
    );
    ctx.fillStyle = COL.bodyDark;
    ctx.fill();

    // --- water ---
    const grad = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
    grad.addColorStop(0, COL.glass);
    grad.addColorStop(1, COL.waterDeep);
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, [r, r, r * 0.3, r * 0.3]);
    ctx.fillStyle = grad;
    ctx.fill();

    // --- bubbles ---
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (const b of bubbles) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- pegs ---
    for (const peg of pegs) {
      const tipY = peg.y - peg.h;
      ctx.beginPath();
      ctx.roundRect(peg.x - peg.r, tipY, peg.r * 2, peg.h, peg.r);
      ctx.fillStyle = COL.peg;
      ctx.fill();
      ctx.strokeStyle = COL.pegDark;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // --- rings ---
    //
    // Each ring is a disc in space drawn as an ellipse: the major axis is the
    // true radius and the minor axis is that radius foreshortened by the tilt
    // out of the screen plane, which is what a rotating disc actually does. At
    // tilt = pi/2 it is face-on and the ellipse is a circle; near 0 it is
    // edge-on and collapses to a line.
    for (const ring of rings) {
      const minor = Math.max(ring.r * Math.abs(Math.sin(ring.tilt)), ring.r * 0.06);
      const lw = ring.r * 0.42;

      ctx.save();
      ctx.translate(ring.x, ring.y);
      ctx.rotate(ring.spin);

      ctx.beginPath();
      ctx.ellipse(0, 0, ring.r, minor, 0, 0, Math.PI * 2);
      ctx.lineWidth = lw;
      ctx.strokeStyle = ring.colour;
      ctx.stroke();

      // A highlight along the upper edge so the rings read as glossy plastic.
      ctx.beginPath();
      ctx.ellipse(0, 0, ring.r, minor, 0, Math.PI * 1.05, Math.PI * 1.5);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = ring.r * 0.16;
      ctx.stroke();

      ctx.restore();
    }

    // --- chamber glass edge ---
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, [r, r, r * 0.3, r * 0.3]);
    ctx.strokeStyle = "rgba(20,17,14,0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- the red base ---
    // Wider than the tank and slightly tapered, as in the reference.
    const base = baseBox();
    ctx.beginPath();
    ctx.moveTo(base.x + base.w * 0.03, base.y);
    ctx.lineTo(base.x + base.w * 0.97, base.y);
    ctx.lineTo(base.x + base.w, base.y + base.h);
    ctx.lineTo(base.x, base.y + base.h);
    ctx.closePath();
    ctx.fillStyle = COL.body;
    ctx.fill();

    // The two controls: the centre pump on the right of the base, the side-jet
    // button on the left. Geometry comes from pumpButton()/sideButton() so the
    // hit tests and the drawing cannot disagree.
    const controls: [{ x: number; y: number; r: number }, boolean, string][] = [
      [pumpButton(), pumping > 0, "#fdfbf5"],
      // Tinted blue: it is the water-from-the-sides control, not a second pump.
      [sideButton(), sideJet > 0, "#cfeefb"],
    ];
    for (const [b, live, face] of controls) {
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r * 2.1, b.r * 1.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = COL.bodyDark;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(b.x, b.y + (live ? 2 : 0), b.r, 0, Math.PI * 2);
      ctx.fillStyle = live ? "#e8e2d2" : face;
      ctx.fill();
      ctx.strokeStyle = "rgba(20,17,14,0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  /** The red base under the tank. Shared by the renderer and pumpButton(). */
  function baseBox(): { x: number; y: number; w: number; h: number } {
    const y = box.y + box.h + Math.min(box.w, box.h) * 0.07;
    const bw = box.w * 1.16;
    return { x: (w - bw) / 2, y, w: bw, h: Math.max(1, h - y) };
  }

  /**
   * Where the pump button is drawn on the toy. Both the renderer and the hit
   * test read this, so the thing you click is by construction the thing you
   * see.
   */
  function pumpButton(): { x: number; y: number; r: number } {
    const base = baseBox();
    // On the right of the base, as in the reference, not centred. The radius
    // has a floor: the drawn button is the only pointer control on the toy, so
    // it must stay large enough to hit even in the small wall-sized box.
    return {
      x: base.x + base.w * 0.74,
      y: base.y + base.h * 0.46,
      r: Math.max(9, Math.min(base.w * 0.075, base.h * 0.34)),
    };
  }

  /** The side-jet button, mirroring the pump on the left of the base. */
  function sideButton(): { x: number; y: number; r: number } {
    const base = baseBox();
    const pb = pumpButton();
    return { x: base.x + base.w * 0.26, y: pb.y, r: pb.r };
  }

  function hitsPump(px: number, py: number): boolean {
    const b = pumpButton();
    // A little forgiving: the drawn button is small on a phone.
    return Math.hypot(px - b.x, py - b.y) < b.r * 1.6;
  }

  function hitsSide(px: number, py: number): boolean {
    const b = sideButton();
    return Math.hypot(px - b.x, py - b.y) < b.r * 1.6;
  }

  function pump(): void {
    pumping = 0.42;
    // Freeing seated rings is left to the jet in step(): it lifts a ring off
    // only when the plume actually reaches that peg. Randomly unseating rings
    // here as well made rings pop off pegs the jet was nowhere near.
  }

  /** Fire the two wall jets, which push rings off the glass and inward. */
  function fireSide(): void {
    sideJet = 0.42;
  }

  return {
    mount(sc: SceneContext) {
      dpr = sc.dpr;

      tr = sc.t as unknown as (k: string) => string;

      const wrap = document.createElement("div");
      wrap.className = "ring";

      // Score above the toy, so it is read before the piece.
      scoreEl = document.createElement("p");
      scoreEl.className = "ring__score";
      scoreEl.setAttribute("role", "status");
      scoreEl.setAttribute("aria-live", "polite");
      wrap.appendChild(scoreEl);
      showScore();

      canvas = document.createElement("canvas");
      canvas.className = "ring__canvas";
      wrap.appendChild(canvas);
      c = canvas.getContext("2d");

      // The pump is the button drawn on the toy itself, there is no separate
      // HTML control over the top of it. The canvas carries the hit test, and a
      // visually-hidden button keeps the pump reachable by keyboard and
      // announced to a screen reader.
      canvas.addEventListener("pointerdown", (ev) => {
        const r = canvas!.getBoundingClientRect();
        const px = ev.clientX - r.left;
        const py = ev.clientY - r.top;
        if (hitsPump(px, py)) {
          ev.preventDefault();
          pump();
        } else if (hitsSide(px, py)) {
          ev.preventDefault();
          fireSide();
        }
      });

      button = document.createElement("button");
      button.type = "button";
      button.className = "ring__pump-a11y";
      button.textContent = (sc.t as unknown as (k: string) => string)("game.ring.button");
      button.addEventListener("click", pump);
      wrap.appendChild(button);

      sideBtn = document.createElement("button");
      sideBtn.type = "button";
      sideBtn.className = "ring__pump-a11y";
      sideBtn.textContent = (sc.t as unknown as (k: string) => string)("game.ring.side");
      sideBtn.addEventListener("click", fireSide);
      wrap.appendChild(sideBtn);

      sc.root.appendChild(wrap);

      this.resize?.(sc.root.clientWidth, sc.root.clientHeight);

      if (!sc.reducedMotion) {
        tick = (dt) => {
          // Fixed sub-steps: a variable timestep makes Verlet collision
          // resolution jittery, and a long frame would tunnel rings through
          // the chamber walls.
          const sub = 1 / 120;
          let remaining = Math.min(dt, 0.05);
          while (remaining > 0) {
            step(Math.min(sub, remaining));
            remaining -= sub;
          }
          draw();
        };
        if (!subscribe(tick)) tick = null;
      }
      draw();
      // A handle on the live simulation, used to verify the physics from the
      // screenshot loop: seating, scoring and the two jets are checked against
      // real state rather than by reading pixels out of a canvas.
      (sc.root as unknown as { __ring?: unknown }).__ring = {
        state: () => ({
          score,
          pumping,
          sideJet,
          // Radii are reported too: the seating window is derived from them, so
          // without them the geometry cannot be checked from outside.
          rings: rings.map((r) => ({
            x: Math.round(r.x),
            y: Math.round(r.y),
            r: r.r,
            onPeg: r.onPeg,
          })),
          pegs: pegs.map((p) => ({
            x: Math.round(p.x),
            r: p.r,
            tipY: Math.round(p.y - p.h),
          })),
          pump: pumpButton(),
          side: sideButton(),
        }),
        pump,
        fireSide,
      };

      sc.root.dataset["ready"] = "1";
    },

    resize(width, height) {
      if (!canvas || !c) return;
      // Measured from the CANVAS, not from the root that the runtime reports:
      // the score line above takes part of the root's height, so sizing to the
      // root drew the toy's base, and with it the pump button, past the bottom
      // of the visible canvas, where it could not be clicked.
      //
      // The measurement can come back as ZERO, though, and that is the case
      // that has to be handled rather than clamped. Leaving a project room
      // un-hides this view and the scene is re-measured while the layout for
      // the newly shown box has not been computed yet, so the canvas reports
      // 0 wide. Clamping that to 1 with Math.max wrote a 1px canvas, which
      // stuck: every later pass measured the 1px element and agreed with it,
      // the toy drew as a vertical line, and the degenerate box then threw
      // "roundRect ... Radius value -6.3456 is negative" every frame.
      //
      // A zero measurement is not a size, it means "not laid out yet", so it
      // falls back to the size the runtime reported and, failing that, keeps
      // the size already in use.
      const rect = canvas.getBoundingClientRect();
      const mw = Math.round(rect.width) || Math.round(width) || w;
      const mh = Math.round(rect.height) || Math.round(height) || h;
      // Nothing usable anywhere: leave the last good size in place rather than
      // rebuilding the scene around a degenerate box.
      if (mw <= 0 || mh <= 0) return;
      w = mw;
      h = mh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
      seed();
      draw();
    },

    renderStatic() {
      // A settled arrangement with one ring seated, so the still frame reads as
      // the toy rather than an empty tank.
      layout();
      seed();
      const first = rings[0];
      const peg = pegs[0];
      if (first && peg) {
        first.onPeg = 0;
        first.x = peg.x;
        first.y = peg.y - peg.h + peg.h * 0.45;
        first.px = first.x;
        first.py = first.y;
      }
      for (let i = 0; i < 240; i++) step(1 / 120);
      draw();
    },

    dispose() {
      if (tick) unsubscribe(tick);
      tick = null;
      button?.remove();
      sideBtn?.remove();
      scoreEl?.remove();
      canvas?.remove();
      canvas = null;
      c = null;
      button = null;
      sideBtn = null;
      scoreEl = null;
    },
  };
}

const factory: SceneFactory = createScene;
export default factory;
