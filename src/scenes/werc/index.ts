import type { SceneContext, SceneModule } from "../types";
import { subscribe, unsubscribe } from "../../lib/raf";

/**
 * The WERC lunar charger's docking sequence, animated.
 *
 * A side view at the lunar South Pole: a FLIP-class rover drives up to the
 * charging wall on lidar, creeps the last stretch in on plate capacitance,
 * pre-tunes, charges across the gap, cleans the station face and backs away.
 * The phases and every number on the readout come from the team's report
 * (WERC 2027 Task 4, Oct 2026). They are MODEL values, and the readout says
 * so: nothing has been built yet.
 *
 * Drawn on a 2D canvas like the other scenes. Not to scale: at true scale the
 * 100 mm gap would be under two pixels on the wall, so the gap is widened to
 * stay visible and the readout carries the real figure.
 */

/** `num` is the state's number in the report's state machine. */
type Phase = { num: number; name: string; dur: number };

// Durations in seconds. Names follow the report's charge state machine.
const PHASES: Phase[] = [
  { num: 2, name: "APPROACH", dur: 4.2 },
  { num: 3, name: "COARSE ALIGN", dur: 1.0 },
  { num: 4, name: "FINE ALIGN", dur: 2.0 },
  { num: 5, name: "HANDSHAKE", dur: 0.8 },
  { num: 6, name: "PRE-TUNE", dur: 0.9 },
  { num: 7, name: "SOFT START", dur: 0.9 },
  { num: 8, name: "CHARGE", dur: 4.6 },
  { num: 10, name: "RAMP DOWN", dur: 0.8 },
  { num: 11, name: "EDS CLEAN", dur: 1.0 },
  { num: 12, name: "DISENGAGE", dur: 2.2 },
];
const CYCLE = PHASES.reduce((s, p) => s + p.dur, 0);
const STARTS = PHASES.map((_, i) => PHASES.slice(0, i).reduce((s, p) => s + p.dur, 0));

/** The frame painted when there is no animation: mid-charge, field live. */
const STATIC_T = STARTS[6]! + 2.6;

const C = {
  skyTop: "#04060b",
  skyLow: "#141a28",
  ground: "#565249",
  groundFar: "#3a3832",
  shadow: "rgba(0, 0, 0, 0.55)",
  station: "#2f6fd0",
  stationFace: "#5d9bf0",
  rover: "#d9d4c8",
  roverDark: "#8f897c",
  receiver: "#2fb39a",
  field: "150, 205, 255",
  hud: "#e9e3d6",
  hudMute: "rgba(233, 227, 214, 0.55)",
  gilt: "#d8b45a",
  sun: "#fff6dc",
};

function phaseAt(t: number): { i: number; p: number } {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (t >= STARTS[i]!) return { i, p: Math.min(1, (t - STARTS[i]!) / PHASES[i]!.dur) };
  }
  return { i: 0, p: 0 };
}

const ease = (x: number): number => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

export default function createWercScene(): SceneModule {
  let root: HTMLElement;
  let canvas: HTMLCanvasElement;
  let g: CanvasRenderingContext2D | null = null;
  let tick: ((dt: number) => void) | null = null;
  let dpr = 1;
  let W = 0;
  let H = 0;
  let t = 0;

  // Stars and craters are seeded so every frame, and every screenshot, matches.
  let seed = 7;
  const rand = (): number => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const stars = Array.from({ length: 90 }, () => ({ x: rand(), y: rand() * 0.62, r: rand() }));
  const craters = Array.from({ length: 7 }, () => ({ x: rand(), y: rand(), w: 0.03 + rand() * 0.07 }));

  /** Rover nose position (fraction of W) and the readouts for time t. */
  function state(time: number) {
    const { i, p } = phaseAt(time);
    const wallX = 0.8;
    const gapVis = 0.026; // drawn gap, widened for legibility
    const dockX = wallX - gapVis;
    const coarseX = dockX - 0.1;
    const startX = 0.02;
    let nose = dockX;
    let gapMm = 100;
    if (i === 0) {
      nose = startX + (coarseX - startX) * ease(p);
      gapMm = Math.round(500 + (1 - ease(p)) * 6500);
    } else if (i === 1) {
      nose = coarseX;
      gapMm = 500;
    } else if (i === 2) {
      nose = coarseX + (dockX - coarseX) * ease(p);
      gapMm = Math.round(500 - 400 * ease(p));
    } else if (i === 9) {
      nose = dockX - (dockX - startX) * ease(p);
      gapMm = Math.round(100 + 6900 * ease(p));
    }
    // Power, in kW of the MODEL: soft start near 22 W, ramp to 1.0 kW.
    let kw = 0;
    if (i === 5) kw = 0.022;
    else if (i === 6) kw = 0.022 + (1 - 0.022) * Math.min(1, p * 4);
    else if (i === 7) kw = 1 - p;
    const battery = i < 6 ? 0.2 : i === 6 ? 0.2 + 0.7 * p : 0.9;
    return { i, p, nose, wallX, gapMm, kw, battery };
  }

  function draw(time: number): void {
    if (!g || !W || !H) return;
    const s = state(time);
    const horizon = H * 0.58;
    const compact = W < 300;

    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Sky and stars.
    const sky = g.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, C.skyTop);
    sky.addColorStop(1, C.skyLow);
    g.fillStyle = sky;
    g.fillRect(0, 0, W, horizon);
    for (const st of stars) {
      g.globalAlpha = 0.25 + st.r * 0.6;
      g.fillStyle = "#fff";
      g.fillRect(st.x * W, st.y * H, st.r > 0.85 ? 1.6 : 1, st.r > 0.85 ? 1.6 : 1);
    }
    g.globalAlpha = 1;

    // The Sun sits on the horizon at the pole: low, white, and the reason
    // camera-only docking fails. Its glow runs along the ground.
    const sunX = W * 0.06;
    const glow = g.createRadialGradient(sunX, horizon, 0, sunX, horizon, W * 0.35);
    glow.addColorStop(0, "rgba(255, 246, 220, 0.35)");
    glow.addColorStop(1, "rgba(255, 246, 220, 0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, W, horizon);
    g.fillStyle = C.sun;
    g.beginPath();
    g.arc(sunX, horizon - H * 0.012, H * 0.022, Math.PI, 0);
    g.fill();

    // Earth hangs low over the horizon from the lunar South Pole.
    const er = Math.max(6, H * 0.055);
    const ex = W * 0.62;
    const ey = horizon - H * 0.2;
    const earth = g.createRadialGradient(ex - er * 0.4, ey - er * 0.4, er * 0.1, ex, ey, er);
    earth.addColorStop(0, "#9fd0ff");
    earth.addColorStop(0.6, "#2f6fb8");
    earth.addColorStop(1, "#0c2344");
    g.fillStyle = earth;
    g.beginPath();
    g.arc(ex, ey, er, 0, Math.PI * 2);
    g.fill();

    // Regolith.
    const ground = g.createLinearGradient(0, horizon, 0, H);
    ground.addColorStop(0, C.groundFar);
    ground.addColorStop(1, C.ground);
    g.fillStyle = ground;
    g.fillRect(0, horizon, W, H - horizon);
    for (const cr of craters) {
      const cx = cr.x * W;
      const cy = horizon + (0.12 + cr.y * 0.75) * (H - horizon);
      g.fillStyle = "rgba(0,0,0,0.18)";
      g.beginPath();
      g.ellipse(cx, cy, cr.w * W, cr.w * W * 0.18, 0, 0, Math.PI * 2);
      g.fill();
    }

    const base = horizon + (H - horizon) * 0.72; // where the wheels sit
    // Pixels per metre on the body, bounded by height so a wide panel does not
    // blow the rover up past the frame.
    const unit = Math.min(W * 0.2, H * 0.34);
    const stationW = W * 0.045;
    const wallLeft = s.wallX * W;

    // Long shadows to the right, away from the low Sun.
    g.fillStyle = C.shadow;
    const roverLen = unit * 2;
    const roverLeft = s.nose * W - roverLen;
    g.beginPath();
    g.moveTo(roverLeft, base);
    g.lineTo(s.nose * W, base);
    g.lineTo(s.nose * W + W * 0.25, base + H * 0.02);
    g.lineTo(roverLeft + W * 0.25, base + H * 0.02);
    g.fill();

    // Station: the charging wall and its electronics box.
    const wallTop = base - unit * 1.1;
    g.fillStyle = "#1f2633";
    g.fillRect(wallLeft + stationW * 0.25, wallTop, stationW, base - wallTop);
    g.fillStyle = "#2a3242";
    g.fillRect(wallLeft + stationW * 0.25, base - unit * 0.45, stationW * 2.2, unit * 0.45);
    // Radiator on top, facing the sky.
    g.fillStyle = "#9aa6b8";
    g.fillRect(wallLeft, wallTop - 3, stationW * 1.6, 3);
    // Station plates (+ above, - below), on the rover-facing side.
    const plateH = unit * 0.27;
    const plateTop1 = base - unit * 0.98;
    const plateTop2 = plateTop1 + plateH + unit * 0.06;
    for (const y of [plateTop1, plateTop2]) {
      g.fillStyle = C.station;
      g.fillRect(wallLeft, y, stationW * 0.3, plateH);
      g.fillStyle = C.stationFace;
      g.fillRect(wallLeft, y, 2, plateH);
    }
    // EDS clean: the dust shield sweeps grains off the station face.
    if (s.i === 8) {
      for (let k = 0; k < 14; k++) {
        const y = plateTop1 + ((k * 37 + s.p * 260) % (plateH * 2 + unit * 0.06));
        g.fillStyle = `rgba(255, 240, 200, ${0.8 - s.p * 0.6})`;
        g.fillRect(wallLeft - 2 - ((k * 13) % 5), y, 2, 2);
      }
    }

    // Rover body, wheels, mast and its receiver panel on the nose.
    const bodyTop = base - unit * 0.95;
    const bodyBot = base - unit * 0.3;
    g.fillStyle = C.roverDark;
    g.fillRect(roverLeft, bodyTop + unit * 0.08, roverLen, bodyBot - bodyTop);
    g.fillStyle = C.rover;
    g.fillRect(roverLeft, bodyTop, roverLen, (bodyBot - bodyTop) * 0.82);
    // Stowed solar array on top.
    g.fillStyle = "#243554";
    g.fillRect(roverLeft + roverLen * 0.08, bodyTop - unit * 0.07, roverLen * 0.7, unit * 0.07);
    // Lidar mast.
    const mastX = roverLeft + roverLen * 0.82;
    g.fillStyle = C.roverDark;
    g.fillRect(mastX, bodyTop - unit * 0.34, 2, unit * 0.34);
    g.fillStyle = C.receiver;
    g.fillRect(mastX - 3, bodyTop - unit * 0.38, 8, 5);
    // Wheels.
    const wheelR = unit * 0.3;
    for (const wx of [roverLeft + roverLen * 0.15, roverLeft + roverLen * 0.85]) {
      g.fillStyle = "#1b1b1b";
      g.beginPath();
      g.arc(wx, base - wheelR, wheelR, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#4a4a4a";
      g.lineWidth = 2;
      g.beginPath();
      g.arc(wx, base - wheelR, wheelR * 0.55, 0, Math.PI * 2);
      g.stroke();
    }
    // Receiver plates on the nose, level with the station's.
    for (const y of [plateTop1 + plateH * 0.1, plateTop2 + plateH * 0.1]) {
      g.fillStyle = C.receiver;
      g.fillRect(s.nose * W - 3, y, 3, plateH * 0.8);
    }

    // Lidar: a fan of beams from the mast to the wall's retroreflectors.
    if (s.i <= 1) {
      const pulse = s.i === 1 ? 0.6 + 0.4 * Math.sin(time * 18) : 0.35;
      g.strokeStyle = `rgba(47, 179, 154, ${pulse})`;
      g.lineWidth = 1;
      for (let k = -2; k <= 2; k++) {
        g.beginPath();
        g.moveTo(mastX + 2, bodyTop - unit * 0.36);
        g.lineTo(wallLeft, wallTop + unit * 0.12 + k * unit * 0.05 + Math.sin(time * 3 + k) * 2);
        g.stroke();
      }
    }

    // Fine alignment: the probe's small field, read as four capacitances.
    if (s.i === 2) {
      g.strokeStyle = `rgba(${C.field}, 0.35)`;
      g.setLineDash([2, 3]);
      for (const y of [plateTop1, plateTop2]) {
        g.beginPath();
        g.moveTo(s.nose * W, y + plateH / 2);
        g.lineTo(wallLeft, y + plateH / 2);
        g.stroke();
      }
      g.setLineDash([]);
    }

    // Handshake: packets over the radio link.
    if (s.i === 3) {
      for (let k = 0; k < 3; k++) {
        const f = (s.p * 2 + k / 3) % 1;
        g.fillStyle = C.gilt;
        g.fillRect(mastX + (wallLeft - mastX) * f, bodyTop - unit * 0.42 - Math.sin(f * Math.PI) * unit * 0.12, 3, 3);
      }
    }

    // The field across the gap: arcs that brighten with power and travel.
    if (s.kw > 0) {
      const strength = Math.min(1, 0.25 + s.kw * 0.75);
      for (const y0 of [plateTop1, plateTop2]) {
        for (let k = 0; k < 6; k++) {
          const y = y0 + plateH * (0.12 + k * 0.15);
          const phase = (time * 6 + k * 0.7) % 1;
          g.strokeStyle = `rgba(${C.field}, ${strength * (0.35 + 0.65 * Math.abs(Math.sin(phase * Math.PI)))})`;
          g.lineWidth = 1.2;
          g.beginPath();
          g.moveTo(s.nose * W, y);
          const mid = (s.nose * W + wallLeft) / 2;
          g.quadraticCurveTo(mid, y + Math.sin(time * 40 + k) * 1.5, wallLeft, y);
          g.stroke();
        }
      }
      // Glow over the gap.
      const gl = g.createRadialGradient(wallLeft - 4, (plateTop1 + plateTop2 + plateH) / 2, 0, wallLeft - 4, (plateTop1 + plateTop2 + plateH) / 2, unit * 0.7);
      gl.addColorStop(0, `rgba(${C.field}, ${0.28 * strength})`);
      gl.addColorStop(1, `rgba(${C.field}, 0)`);
      g.fillStyle = gl;
      g.fillRect(wallLeft - unit, plateTop1 - unit * 0.3, unit * 2, unit * 1.2);
    }

    // Battery gauge on the rover's flank.
    const bx = roverLeft + roverLen * 0.1;
    const by = bodyTop + (bodyBot - bodyTop) * 0.25;
    const bw = roverLen * 0.32;
    const bh = Math.max(5, unit * 0.1);
    g.strokeStyle = "#3a3a3a";
    g.lineWidth = 1;
    g.strokeRect(bx, by, bw, bh);
    g.fillStyle = s.kw > 0.5 ? C.receiver : "#6b8f6a";
    g.fillRect(bx + 1, by + 1, (bw - 2) * s.battery, bh - 2);

    drawHud(s, compact);
  }

  function drawHud(s: ReturnType<typeof state>, compact: boolean): void {
    if (!g) return;
    const pad = Math.max(8, W * 0.02);
    const size = Math.max(9, Math.min(13, W * 0.022));
    g.font = `600 ${size}px "IBM Plex Mono", ui-monospace, monospace`;
    g.textBaseline = "top";

    const phase = PHASES[s.i]!;
    g.fillStyle = C.gilt;
    g.fillText(`${phase.num} · ${phase.name}`, pad, pad);

    const lines = [
      `GAP  ${s.gapMm >= 1000 ? (s.gapMm / 1000).toFixed(1) + " m" : s.gapMm + " mm"}`,
      `P    ${s.kw >= 0.1 ? s.kw.toFixed(2) + " kW" : s.kw > 0 ? Math.round(s.kw * 1000) + " W" : "0"}`,
    ];
    if (!compact) {
      lines.push(`f    6.78 MHz`, `C    ${s.i >= 2 && s.i <= 8 ? "17.75 pF/gap" : "--"}`);
    }
    g.font = `400 ${size}px "IBM Plex Mono", ui-monospace, monospace`;
    g.fillStyle = C.hud;
    lines.forEach((l, k) => g!.fillText(l, pad, pad + (k + 1.4) * size * 1.35));

    if (!compact) {
      // The state machine as a strip of ticks, the live one lit.
      const y = pad + (lines.length + 1.8) * size * 1.35;
      for (let k = 0; k < PHASES.length; k++) {
        g.fillStyle = k === s.i ? C.gilt : k < s.i ? C.hudMute : "rgba(233,227,214,0.18)";
        g.fillRect(pad + k * (size * 1.1), y, size * 0.8, 3);
      }
    }
    g.font = `400 ${Math.max(8, size * 0.8)}px "IBM Plex Mono", ui-monospace, monospace`;
    g.fillStyle = C.hudMute;
    g.textBaseline = "bottom";
    g.fillText("MODEL VALUES · NOT TO SCALE", pad, H - pad * 0.6);
  }

  function size(w: number, h: number): void {
    if (!w || !h) return;
    W = w;
    H = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    g = canvas.getContext("2d");
    draw(tick ? t : STATIC_T);
  }

  return {
    mount(c: SceneContext) {
      root = c.root;
      dpr = c.dpr;
      canvas = document.createElement("canvas");
      canvas.className = "werc__canvas";
      if (!root.closest("a")) {
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", c.t("werc.aria"));
      }
      root.append(canvas);
      const box = root.getBoundingClientRect();
      size(box.width, box.height || box.width / 1.5);

      if (c.reducedMotion) return;
      tick = (dt: number) => {
        t = (t + dt) % CYCLE;
        draw(t);
      };
      if (!subscribe(tick)) tick = null;
    },

    resize(w: number, h: number) {
      size(w, h);
    },

    renderStatic() {
      t = STATIC_T;
      draw(STATIC_T);
    },

    dispose() {
      if (tick) unsubscribe(tick);
      tick = null;
      canvas.remove();
    },
  };
}
