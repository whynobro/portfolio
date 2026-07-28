import type { SceneContext, SceneFactory, SceneModule } from "../types";
import { subscribe, unsubscribe } from "../../lib/raf";

/**
 * Tolerance stack-up.
 *
 * Three toleranced parts in a stack; the assembly gap is drawn as a
 * distribution with two limits marked:
 *
 *   Worst case  = Σ|tᵢ|            — every part at its extreme, simultaneously
 *   RSS         = √(Σtᵢ²)          — statistical, assumes independent normal
 *                                    variation
 *
 * The point the picture makes is that worst-case is always wider than RSS, so
 * designing to worst-case on every dimension buys a tolerance budget you rarely
 * need — which is exactly the trade-off argument a manufacturing engineer has
 * to make. Values default to the putter's actual stack.
 */

type Part = { nominal: number; tol: number };

const PARTS: Part[] = [
  { nominal: 12.0, tol: 0.05 },
  { nominal: 8.0, tol: 0.03 },
  { nominal: 20.0, tol: 0.06 },
];

const COL = {
  bg: "#12171f",
  line: "#232b38",
  lineBright: "#38455a",
  text: "#e6ebf2",
  dim: "#97a3b4",
  mute: "#6b7788",
  accent: "#4c8dff",
  measured: "#f2a03d",
};

function createScene(): SceneModule {
  let canvas: HTMLCanvasElement | null = null;
  let ctx2d: CanvasRenderingContext2D | null = null;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let phase = 0;
  let animating = false;
  let tick: ((dt: number) => void) | null = null;

  const worstCase = PARTS.reduce((sum, p) => sum + p.tol, 0);
  const rss = Math.sqrt(PARTS.reduce((sum, p) => sum + p.tol * p.tol, 0));

  function draw(): void {
    const c = ctx2d;
    if (!c) return;

    c.clearRect(0, 0, w, h);
    c.fillStyle = COL.bg;
    c.fillRect(0, 0, w, h);

    const padX = Math.max(24, w * 0.08);
    const padY = Math.max(20, h * 0.14);
    const plotW = w - padX * 2;
    const baseY = h - padY;
    const topY = padY;

    // ---- Distribution curves -------------------------------------------
    // Scale so the wider (worst-case) curve fills the plot with a margin.
    const span = worstCase * 1.25;
    const xOf = (mm: number) => padX + plotW / 2 + (mm / span) * (plotW / 2);
    const height = baseY - topY;

    // Gaussian for the RSS case. sigma chosen so ±3σ ≈ the RSS limit, the
    // usual convention when quoting an RSS tolerance.
    const sigma = rss / 3;
    const gauss = (x: number) => Math.exp(-(x * x) / (2 * sigma * sigma));

    c.beginPath();
    for (let px = 0; px <= plotW; px++) {
      const mm = ((px - plotW / 2) / (plotW / 2)) * span;
      const y = baseY - gauss(mm) * height * 0.82;
      if (px === 0) c.moveTo(padX + px, y);
      else c.lineTo(padX + px, y);
    }
    c.strokeStyle = COL.accent;
    c.lineWidth = 1.5;
    c.stroke();

    // Fill under the curve, faint.
    c.lineTo(padX + plotW, baseY);
    c.lineTo(padX, baseY);
    c.closePath();
    c.fillStyle = "rgba(76,141,255,0.10)";
    c.fill();

    // ---- Limit markers ---------------------------------------------------
    const marker = (mm: number, color: string, label: string, up: boolean) => {
      const x = xOf(mm);
      c.beginPath();
      c.setLineDash([3, 3]);
      c.moveTo(x, baseY);
      c.lineTo(x, topY + (up ? 0 : height * 0.3));
      c.strokeStyle = color;
      c.lineWidth = 1;
      c.stroke();
      c.setLineDash([]);

      c.fillStyle = color;
      c.font = `500 10px "IBM Plex Mono", monospace`;
      c.textAlign = mm < 0 ? "right" : "left";
      c.fillText(label, x + (mm < 0 ? -4 : 4), topY + (up ? 10 : height * 0.3 + 10));
    };

    marker(-worstCase, COL.measured, "", true);
    marker(worstCase, COL.measured, `±${worstCase.toFixed(2)} WC`, true);
    marker(-rss, COL.accent, "", false);
    marker(rss, COL.accent, `±${rss.toFixed(2)} RSS`, false);

    // ---- Baseline with tick marks ---------------------------------------
    c.beginPath();
    c.moveTo(padX, baseY);
    c.lineTo(padX + plotW, baseY);
    c.strokeStyle = COL.lineBright;
    c.lineWidth = 1;
    c.stroke();

    c.strokeStyle = COL.line;
    for (let i = 0; i <= 10; i++) {
      const x = padX + (plotW / 10) * i;
      c.beginPath();
      c.moveTo(x, baseY);
      c.lineTo(x, baseY + (i === 5 ? 6 : 3));
      c.stroke();
    }

    // ---- Sampled part, sweeping ------------------------------------------
    // A marker walking the distribution: makes the static chart legible as a
    // process rather than a diagram.
    if (animating) {
      const sample = Math.sin(phase) * rss;
      const x = xOf(sample);
      const y = baseY - gauss(sample) * height * 0.82;
      c.beginPath();
      c.arc(x, y, 3, 0, Math.PI * 2);
      c.fillStyle = COL.measured;
      c.fill();
    }

    // ---- Caption ---------------------------------------------------------
    c.fillStyle = COL.mute;
    c.font = `400 9px "IBM Plex Mono", monospace`;
    c.textAlign = "left";
    c.fillText("TOLERANCE STACK-UP / 3 PARTS", padX, topY - 6);
  }

  return {
    mount(sc: SceneContext) {
      dpr = sc.dpr;
      canvas = document.createElement("canvas");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      sc.root.appendChild(canvas);
      ctx2d = canvas.getContext("2d");

      this.resize?.(sc.root.clientWidth, sc.root.clientHeight);

      if (!sc.reducedMotion) {
        tick = (dt) => {
          phase += dt * 0.9;
          draw();
        };
        animating = subscribe(tick);
        if (!animating) tick = null;
      }
      draw();
    },

    resize(width, height) {
      if (!canvas || !ctx2d) return;
      w = Math.max(1, Math.round(width));
      h = Math.max(1, Math.round(height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      ctx2d = null;
    },
  };
}

const factory: SceneFactory = createScene;
export default factory;
