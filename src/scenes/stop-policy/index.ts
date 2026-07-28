import type { SceneContext, SceneFactory, SceneModule } from "../types";
import { subscribe, unsubscribe } from "../../lib/raf";

/**
 * Stop-policy selection by worst-case floor (maximin).
 *
 * A stop level was validated across TWO DISJOINT three-month windows rather
 * than one combined backtest. Each candidate therefore has two results, and the
 * one that matters is the WORSE of the two — a policy that is only profitable
 * in the friendlier window has not been shown to work.
 *
 *   no stop  loses money in both windows
 *   -30%     best worst-case floor          <- deployed
 *   -35%     higher combined, weaker floor
 *
 * -35% wins on total P&L and still loses the argument. That is the same
 * reasoning as qualifying a part against its worst operating condition instead
 * of its average one, which is why this belongs in a mechanical portfolio.
 */

const COL = {
  bg: "#12171f",
  line: "#232b38",
  lineBright: "#38455a",
  text: "#e6ebf2",
  dim: "#97a3b4",
  mute: "#6b7788",
  accent: "#4c8dff",
  measured: "#f2a03d",
  loss: "#e0574a",
};

/** [label, window A $, window B $] — real study results. */
const CANDIDATES: Array<[string, number, number]> = [
  ["NONE", -980, -584],
  ["-20%", 610, 545],
  ["-30%", 1830, 720],
  ["-35%", 2766, 386],
  ["-45%", 1420, 505],
  ["-60%", 890, 430],
];

const DEPLOYED = 2; // index of -30%

function createScene(): SceneModule {
  let canvas: HTMLCanvasElement | null = null;
  let c: CanvasRenderingContext2D | null = null;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let highlight = DEPLOYED;
  let elapsed = 0;
  let animating = false;
  let tick: ((dt: number) => void) | null = null;

  function draw(): void {
    // Bound to a local so nested closures keep the null-narrowing.
    const ctx = c;
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COL.bg;
    ctx.fillRect(0, 0, w, h);

    const padL = Math.max(28, w * 0.08);
    const padR = Math.max(14, w * 0.05);
    const padT = Math.max(24, h * 0.17);
    const padB = Math.max(26, h * 0.18);
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const values = CANDIDATES.flatMap(([, a, b]) => [a, b]);
    const maxV = Math.max(...values);
    const minV = Math.min(...values);
    const range = maxV - minV;
    const zeroY = padT + (maxV / range) * plotH;
    const yOf = (v: number) => padT + ((maxV - v) / range) * plotH;

    const slot = plotW / CANDIDATES.length;
    const barW = slot * 0.3;

    // ---- Zero line: the only reference that matters here ---------------
    ctx.strokeStyle = COL.lineBright;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, zeroY);
    ctx.lineTo(padL + plotW, zeroY);
    ctx.stroke();

    CANDIDATES.forEach(([label, a, b], i) => {
      const x = padL + slot * i + slot * 0.5;
      const isOn = i === highlight;
      const floor = Math.min(a, b);

      // Two bars per candidate: one per validation window.
      [a, b].forEach((v, j) => {
        const bx = x - barW - 1 + j * (barW + 2);
        const top = v >= 0 ? yOf(v) : zeroY;
        const height = Math.abs(yOf(v) - zeroY);

        if (v < 0) ctx.fillStyle = isOn ? COL.loss : "rgba(224,87,74,0.35)";
        else if (isOn) ctx.fillStyle = j === 0 ? COL.accent : "rgba(76,141,255,0.55)";
        else ctx.fillStyle = "rgba(151,163,180,0.20)";

        ctx.fillRect(bx, top, barW, Math.max(height, 1));
      });

      // Mark the worst-case floor — the number the decision is made on.
      if (isOn && floor > 0) {
        const fy = yOf(floor);
        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        ctx.moveTo(padL, fy);
        ctx.lineTo(padL + plotW, fy);
        ctx.strokeStyle = COL.measured;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Sits above the dashed rule at the left edge, clear of the bars.
        ctx.fillStyle = COL.measured;
        ctx.font = `500 9px "IBM Plex Mono", monospace`;
        ctx.textAlign = "left";
        ctx.fillText(`WORST CASE $${floor}`, padL, fy - 5);
      }

      // Single draw per label. Drawing a "bold" pass over a regular one
      // overstrikes rather than emboldening, which is what made the selected
      // label unreadable.
      ctx.fillStyle = isOn ? COL.measured : COL.mute;
      ctx.font = `${isOn ? 500 : 400} 9px "IBM Plex Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(label, x, padT + plotH + 15);
    });

    // ---- Caption ---------------------------------------------------------
    ctx.fillStyle = COL.mute;
    ctx.font = `400 8px "IBM Plex Mono", monospace`;
    ctx.textAlign = "left";
    ctx.fillText("STOP LEVEL / TWO DISJOINT WINDOWS", padL, padT - 10);
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
        // Walk the candidates so the comparison reads as a sweep, then settle
        // on the deployed one.
        tick = (dt) => {
          elapsed += dt;
          if (elapsed > 1.1) {
            elapsed = 0;
            highlight = (highlight + 1) % CANDIDATES.length;
            draw();
          }
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
      highlight = DEPLOYED; // the poster frame shows the chosen policy
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
