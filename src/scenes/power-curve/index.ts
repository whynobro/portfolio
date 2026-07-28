import type { SceneContext, SceneFactory, SceneModule } from "../types";
import { subscribe, unsubscribe } from "../../lib/raf";

/**
 * Wave energy converter — measured power output.
 *
 * A rack-and-pinion generator converts wave oscillation into rotation. Output
 * rises with wave frequency until mechanical losses dominate, so the curve has
 * a peak rather than climbing indefinitely.
 *
 * The bars are the competing teams' best measured output; the curve is this
 * build's sweep. The claim being made visually is "highest measured wattage of
 * any team", so the reader sees the margin instead of being told about it.
 */

const COL = {
  bg: "#12171f",
  line: "#232b38",
  lineBright: "#38455a",
  dim: "#97a3b4",
  mute: "#6b7788",
  accent: "#4c8dff",
  measured: "#f2a03d",
};

/** Competing teams' peak output, watts. Ours is the last entry. */
const FIELD = [0.42, 0.55, 0.38, 0.61, 0.49];
const OURS = 0.83;

function createScene(): SceneModule {
  let canvas: HTMLCanvasElement | null = null;
  let c: CanvasRenderingContext2D | null = null;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let sweep = 0;
  let animating = false;
  let tick: ((dt: number) => void) | null = null;

  /** Power vs normalised wave frequency. Peaks then falls off. */
  const power = (x: number) => {
    const p = Math.exp(-Math.pow((x - 0.58) / 0.28, 2));
    return p * OURS;
  };

  function draw(): void {
    // Bound to a local so nested closures keep the null-narrowing.
    const ctx = c;
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COL.bg;
    ctx.fillRect(0, 0, w, h);

    const padL = Math.max(30, w * 0.1);
    const padR = Math.max(16, w * 0.06);
    const padT = Math.max(22, h * 0.16);
    const padB = Math.max(24, h * 0.16);
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const baseY = padT + plotH;

    const yMax = 1.0;
    const yOf = (watt: number) => baseY - (watt / yMax) * plotH;
    const xOf = (t: number) => padL + t * plotW;

    // ---- Gridlines: low contrast so they never compete with the data ----
    ctx.strokeStyle = COL.line;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
    }

    // ---- The field: competing teams as faint bars ------------------------
    // Evenly distributed across the full plot width so the curve's peak is
    // read against the whole field, not against a cluster on one side.
    const slot = plotW / (FIELD.length + 1);
    const bw = Math.max(6, slot * 0.42);
    FIELD.forEach((watt, i) => {
      const x = padL + slot * (i + 1) - bw / 2;
      ctx.fillStyle = "rgba(151,163,180,0.20)";
      ctx.fillRect(x, yOf(watt), bw, baseY - yOf(watt));
    });

    ctx.fillStyle = COL.mute;
    ctx.font = `400 8px "IBM Plex Mono", monospace`;
    ctx.textAlign = "left";
    ctx.fillText("COMPETING TEAMS", padL, baseY + 13);

    // ---- Our curve ------------------------------------------------------
    const progress = animating ? Math.min(sweep, 1) : 1;
    ctx.beginPath();
    for (let px = 0; px <= plotW * progress; px++) {
      const t = px / plotW;
      const y = yOf(power(t));
      if (px === 0) ctx.moveTo(xOf(t), y);
      else ctx.lineTo(xOf(t), y);
    }
    ctx.strokeStyle = COL.accent;
    ctx.lineWidth = 1.75;
    ctx.stroke();

    // ---- Peak marker: the measured result -------------------------------
    if (progress > 0.6) {
      const px = xOf(0.58);
      const py = yOf(OURS);

      ctx.beginPath();
      ctx.setLineDash([2, 3]);
      ctx.moveTo(padL, py);
      ctx.lineTo(px, py);
      ctx.strokeStyle = COL.measured;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = COL.measured;
      ctx.fill();

      ctx.fillStyle = COL.measured;
      ctx.font = `500 10px "IBM Plex Mono", monospace`;
      ctx.textAlign = "left";
      ctx.fillText("PEAK OUTPUT", px + 8, py - 4);
    }

    // ---- Axes ------------------------------------------------------------
    ctx.strokeStyle = COL.lineBright;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, baseY);
    ctx.lineTo(padL + plotW, baseY);
    ctx.stroke();

    ctx.fillStyle = COL.mute;
    ctx.font = `400 8px "IBM Plex Mono", monospace`;
    ctx.textAlign = "right";
    ctx.fillText("W", padL - 6, padT + 8);
    ctx.textAlign = "left";
    ctx.fillText("WAVE FREQUENCY", padL, padT - 8);
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
          sweep += dt * 0.5;
          if (sweep > 2.2) sweep = 0; // pause at full, then redraw
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
