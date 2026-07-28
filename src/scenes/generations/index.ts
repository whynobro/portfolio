import type { SceneContext, SceneFactory, SceneModule } from "../types";
import { subscribe, unsubscribe } from "../../lib/raf";

/**
 * Chameleon Ramps — iteration convergence.
 *
 * Each product went through 4–6 prototype generations. Two quantities move in
 * opposite directions across those generations: scrap rate falls as the casting
 * process is refined, and dimensional consistency rises.
 *
 * The shape of the pair is the actual argument — most of the gain lands in the
 * first three generations, and the curve flattens after that. Knowing when
 * iteration has stopped paying is the skill being claimed, not "I iterate".
 */

const COL = {
  bg: "#12171f",
  line: "#232b38",
  lineBright: "#38455a",
  text: "#e6ebf2",
  mute: "#6b7788",
  accent: "#4c8dff",
  measured: "#f2a03d",
};

/** Per generation: [scrap %, dimensional consistency %] */
const GENERATIONS: Array<[number, number]> = [
  [42, 51],
  [31, 68],
  [19, 81],
  [12, 89],
  [9, 93],
  [8, 94],
];

function createScene(): SceneModule {
  let canvas: HTMLCanvasElement | null = null;
  let c: CanvasRenderingContext2D | null = null;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let reveal = 0;
  let animating = false;
  let tick: ((dt: number) => void) | null = null;

  function draw(): void {
    // Bound to a local so the nested `series` closure keeps the narrowing.
    const ctx = c;
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COL.bg;
    ctx.fillRect(0, 0, w, h);

    const padL = Math.max(28, w * 0.09);
    const padR = Math.max(28, w * 0.09);
    const padT = Math.max(24, h * 0.18);
    const padB = Math.max(26, h * 0.18);
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const baseY = padT + plotH;

    const n = GENERATIONS.length;
    const xOf = (i: number) => padL + (plotW / (n - 1)) * i;
    const yOf = (pct: number) => baseY - (pct / 100) * plotH;

    const shown = animating ? Math.min(reveal, n) : n;

    // ---- Generation gridlines -------------------------------------------
    ctx.strokeStyle = COL.line;
    ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      const x = xOf(i);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, baseY);
      ctx.stroke();
    }

    // ---- Two series ------------------------------------------------------
    const series = (idx: 0 | 1, color: string, dashed: boolean) => {
      ctx.beginPath();
      for (let i = 0; i < shown; i++) {
        const pt = GENERATIONS[i];
        if (!pt) continue;
        const x = xOf(i);
        const y = yOf(pt[idx]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.75;
      if (dashed) ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < shown; i++) {
        const pt = GENERATIONS[i];
        if (!pt) continue;
        ctx.beginPath();
        ctx.arc(xOf(i), yOf(pt[idx]), 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    };

    series(1, COL.accent, false); // consistency, rising
    series(0, COL.measured, true); // scrap, falling

    // ---- Axis + generation labels ---------------------------------------
    ctx.strokeStyle = COL.lineBright;
    ctx.beginPath();
    ctx.moveTo(padL, baseY);
    ctx.lineTo(padL + plotW, baseY);
    ctx.stroke();

    ctx.fillStyle = COL.mute;
    ctx.font = `400 8px "IBM Plex Mono", monospace`;
    ctx.textAlign = "center";
    for (let i = 0; i < n; i++) {
      ctx.fillText(`G${i + 1}`, xOf(i), baseY + 13);
    }

    // ---- Legend ----------------------------------------------------------
    ctx.textAlign = "left";
    ctx.font = `400 8px "IBM Plex Mono", monospace`;
    ctx.fillStyle = COL.accent;
    ctx.fillText("CONSISTENCY", padL, padT - 10);
    ctx.fillStyle = COL.measured;
    ctx.fillText("SCRAP", padL + plotW * 0.55, padT - 10);
  }

  return {
    mount(sc: SceneContext) {
      dpr = sc.dpr;
      canvas = document.createElement("canvas");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      sc.root.appendChild(canvas);
      c = canvas.getContext("2d");

      this.resize?.(sc.root.clientWidth, sc.root.clientHeight);

      if (!sc.reducedMotion) {
        tick = (dt) => {
          reveal += dt * 1.6;
          if (reveal > GENERATIONS.length + 2.5) reveal = 0;
          draw();
        };
        animating = subscribe(tick);
        if (!animating) tick = null;
      }
      draw();
    },

    resize(width, height) {
      if (!canvas || !c) return;
      w = Math.max(1, Math.round(width));
      h = Math.max(1, Math.round(height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    },

    renderStatic() {
      animating = false;
      draw();
    },

    dispose() {
      if (tick) unsubscribe(tick);
      tick = null;
      animating = false;
      canvas?.remove();
      canvas = null;
      c = null;
    },
  };
}

const factory: SceneFactory = createScene;
export default factory;
