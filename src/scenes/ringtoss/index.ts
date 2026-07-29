import type { SceneContext, SceneFactory, SceneModule } from "../types";
import { subscribe, unsubscribe } from "../../lib/raf";

/**
 * Water ring toss — the handheld toy, simulated.
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

const COL = {
  body: "#c8352a",
  bodyDark: "#8e2018",
  bodyLight: "#e05244",
  water: "#cfe6f2",
  waterDeep: "#9cc9de",
  glass: "#eef7fb",
  peg: "#e8e2d6",
  pegDark: "#b9b0a0",
  ink: "#14110e",
};

const RING_COLOURS = ["#e8b33a", "#3f9d54", "#2f6fb5", "#d1483c", "#8a56a8"];

type Ring = {
  x: number;
  y: number;
  px: number;
  py: number;
  r: number;
  colour: string;
  /** Index of the peg this ring is seated on, or -1. */
  onPeg: number;
};

type Peg = { x: number; y: number; r: number; h: number };

function createScene(): SceneModule {
  let canvas: HTMLCanvasElement | null = null;
  let c: CanvasRenderingContext2D | null = null;
  let button: HTMLButtonElement | null = null;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let tick: ((dt: number) => void) | null = null;
  let pumping = 0; // seconds of jet remaining
  let rings: Ring[] = [];
  let pegs: Peg[] = [];
  let bubbles: { x: number; y: number; v: number; r: number }[] = [];

  // Chamber geometry in canvas units, recomputed on resize.
  let box = { x: 0, y: 0, w: 0, h: 0 };

  function layout(): void {
    // The toy: a tall rounded chamber over a red base with a button.
    const baseH = h * 0.26;
    const cw = Math.min(w * 0.52, (h - baseH) * 0.78);
    box = {
      x: (w - cw) / 2,
      y: h * 0.06,
      w: cw,
      h: h - baseH - h * 0.1,
    };

    const pegR = box.w * 0.035;
    const pegH = box.h * 0.3;
    const floor = box.y + box.h;
    pegs = [
      { x: box.x + box.w * 0.3, y: floor, r: pegR, h: pegH },
      { x: box.x + box.w * 0.7, y: floor, r: pegR, h: pegH },
    ];
  }

  function seed(): void {
    const ringR = box.w * 0.1;
    rings = RING_COLOURS.map((colour, i) => {
      const x = box.x + box.w * (0.22 + 0.14 * i);
      const y = box.y + box.h - ringR - 4;
      return { x, y, px: x, py: y, r: ringR, colour, onPeg: -1 };
    });
    bubbles = [];
  }

  function step(dt: number): void {
    const g = 900; // px/s^2
    const buoyancy = -640; // rings are slightly buoyant
    const damping = 0.986;
    const floor = box.y + box.h;

    for (const ring of rings) {
      // A seated ring stays put: the real toy's rings rest on the peg.
      if (ring.onPeg >= 0) continue;

      const vx = (ring.x - ring.px) * damping;
      const vy = (ring.y - ring.py) * damping;

      let ax = 0;
      let ay = g + buoyancy;

      // Quadratic drag — water resists much more strongly than air, which is
      // what makes the rings drift rather than fall.
      const speed = Math.hypot(vx, vy) / Math.max(dt, 1e-4);
      const dragK = 0.0026;
      ax -= vx * speed * dragK;
      ay -= vy * speed * dragK;

      // The jet: a plume rising from the nozzle at the base centre. Force falls
      // off with horizontal distance so rings above the nozzle lift hardest.
      if (pumping > 0) {
        const nozzleX = box.x + box.w * 0.5;
        const dx = ring.x - nozzleX;
        const spread = box.w * 0.42;
        const falloff = Math.max(0, 1 - Math.abs(dx) / spread);
        const depth = Math.max(0, (ring.y - box.y) / box.h);
        ay -= 5200 * falloff * depth;
        ax += dx * 5.5 * falloff; // pushes rings outward as it rises
      }

      ring.px = ring.x;
      ring.py = ring.y;
      ring.x += vx + ax * dt * dt;
      ring.y += vy + ay * dt * dt;

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

        // Seated if the ring's centre is close to the peg axis and it is
        // falling near the tip — the real toy's win condition.
        const overAxis = Math.abs(ring.x - peg.x) < ring.r * 0.55;
        const nearTip = ring.y > tipY - ring.r && ring.y < tipY + peg.h * 0.7;
        if (overAxis && nearTip && ring.y - ring.py > -0.4) {
          ring.onPeg = pi;
          ring.x = peg.x;
          ring.y = tipY + peg.h * 0.45;
          ring.px = ring.x;
          ring.py = ring.y;
          break;
        }

        // Otherwise the peg shaft is a solid obstacle.
        const dx = ring.x - peg.x;
        const withinShaft = ring.y > tipY && ring.y < peg.y;
        if (withinShaft && Math.abs(dx) < peg.r + ring.r * 0.25) {
          const push = (peg.r + ring.r * 0.25) * Math.sign(dx || 1);
          ring.x = peg.x + push;
          ring.px = ring.x + (ring.x - ring.px) * rest;
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
    if (pumping > 0 && bubbles.length < 40) {
      bubbles.push({
        x: box.x + box.w * (0.42 + Math.sin(pumping * 40) * 0.08),
        y: box.y + box.h - 4,
        v: 90 + (bubbles.length % 7) * 14,
        r: 1.5 + (bubbles.length % 4),
      });
    }
    for (const b of bubbles) b.y -= b.v * dt;
    bubbles = bubbles.filter((b) => b.y > box.y);

    if (pumping > 0) pumping = Math.max(0, pumping - dt);
  }

  function draw(): void {
    const ctx = c;
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fbfaf7";
    ctx.fillRect(0, 0, w, h);

    const r = Math.min(box.w, box.h) * 0.12;

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
    for (const ring of rings) {
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
      ctx.lineWidth = ring.r * 0.42;
      ctx.strokeStyle = ring.colour;
      ctx.stroke();
      // A highlight arc so the rings read as glossy plastic.
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r, Math.PI * 1.05, Math.PI * 1.5);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = ring.r * 0.16;
      ctx.stroke();
    }

    // --- chamber glass edge ---
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, [r, r, r * 0.3, r * 0.3]);
    ctx.strokeStyle = "rgba(20,17,14,0.28)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- the red body ---
    const baseY = box.y + box.h;
    const baseH = h - baseY - h * 0.03;
    const baseW = box.w * 1.34;
    const baseX = (w - baseW) / 2;

    const bodyGrad = ctx.createLinearGradient(baseX, 0, baseX + baseW, 0);
    bodyGrad.addColorStop(0, COL.bodyDark);
    bodyGrad.addColorStop(0.35, COL.bodyLight);
    bodyGrad.addColorStop(1, COL.body);

    ctx.beginPath();
    ctx.roundRect(baseX, baseY - 6, baseW, baseH + 6, [8, 8, 14, 14]);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // The pump button, pressed while the jet runs.
    const bx = baseX + baseW * 0.5;
    const by = baseY + baseH * 0.52;
    const br = Math.min(baseW, baseH) * 0.17;
    ctx.beginPath();
    ctx.arc(bx, by + (pumping > 0 ? 2 : 0), br, 0, Math.PI * 2);
    ctx.fillStyle = pumping > 0 ? "#f0d9a8" : "#f7ead0";
    ctx.fill();
    ctx.strokeStyle = "rgba(20,17,14,0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function pump(): void {
    pumping = 0.42;
    // A press also frees any seated ring near the jet, so the toy can be played
    // continuously rather than locking up once rings are on.
    for (const ring of rings) {
      if (ring.onPeg >= 0 && Math.random() < 0.35) ring.onPeg = -1;
    }
  }

  return {
    mount(sc: SceneContext) {
      dpr = sc.dpr;

      const wrap = document.createElement("div");
      wrap.className = "ring";

      canvas = document.createElement("canvas");
      canvas.className = "ring__canvas";
      wrap.appendChild(canvas);
      c = canvas.getContext("2d");

      button = document.createElement("button");
      button.type = "button";
      button.className = "ring__button";
      button.textContent = (sc.t as unknown as (k: string) => string)("game.ring.button");
      button.addEventListener("click", pump);
      wrap.appendChild(button);

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
      sc.root.dataset["ready"] = "1";
    },

    resize(width, height) {
      if (!canvas || !c) return;
      w = Math.max(1, Math.round(width));
      h = Math.max(1, Math.round(height));
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
      canvas?.remove();
      canvas = null;
      c = null;
      button = null;
    },
  };
}

const factory: SceneFactory = createScene;
export default factory;
