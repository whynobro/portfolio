import type { Look, Sprite } from "./art/types";

/**
 * Sprites are character grids (see art/types.ts); the engine draws canvases.
 * Baking turns a grid, or a stack of grids, into a canvas once per look, and
 * keeps it: a walking trainer is three cached canvases, not 384 fillRects.
 */

const ids = new WeakMap<Sprite, number>();
let nextId = 1;
const idOf = (s: Sprite): number => {
  let id = ids.get(s);
  if (!id) ids.set(s, (id = nextId++));
  return id;
};

const lookIds = new WeakMap<Look, number>();
let nextLook = 1;
const lookId = (l: Look | undefined): number => {
  if (!l) return 0;
  let id = lookIds.get(l);
  if (!id) lookIds.set(l, (id = nextLook++));
  return id;
};

function rgba(hex: string): [number, number, number, number] {
  const h = hex.slice(1);
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  if (h.length === 3) {
    const e = (i: number) => parseInt((h[i] ?? "0") + (h[i] ?? "0"), 16);
    return [e(0), e(1), e(2), 255];
  }
  return [n(0), n(2), n(4), h.length >= 8 ? n(6) : 255];
}

function paint(data: Uint8ClampedArray, w: number, s: Sprite, look: Look | undefined, ox = 0, oy = 0): void {
  const pal = new Map<string, [number, number, number, number]>();
  for (const [ch, v] of Object.entries(s.pal)) {
    const col = v.startsWith("$") ? (look?.[v.slice(1) as keyof Look] ?? "#ff00ff") : v;
    pal.set(ch, rgba(col));
  }
  for (let y = 0; y < s.rows.length; y++) {
    const row = s.rows[y] ?? "";
    for (let x = 0; x < row.length; x++) {
      const c = pal.get(row[x] ?? ".");
      if (!c) continue;
      const px = x + ox, py = y + oy;
      if (px < 0 || py < 0 || px >= w) continue;
      const i = (py * w + px) * 4;
      const a = c[3] / 255;
      if (a >= 1 || (data[i + 3] ?? 0) === 0) {
        data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = c[3];
      } else {
        // Glass and light: blend over whatever an earlier layer put here.
        data[i] = Math.round(c[0] * a + (data[i] ?? 0) * (1 - a));
        data[i + 1] = Math.round(c[1] * a + (data[i + 1] ?? 0) * (1 - a));
        data[i + 2] = Math.round(c[2] * a + (data[i + 2] ?? 0) * (1 - a));
        data[i + 3] = Math.max(data[i + 3] ?? 0, c[3]);
      }
    }
  }
}

const cache = new Map<string, HTMLCanvasElement>();

/** A stack of same-sized layers (undefined ones skipped), baked for a look. */
export function bake(layers: (Sprite | undefined | null)[], look?: Look): HTMLCanvasElement {
  const real = layers.filter((l): l is Sprite => !!l);
  const key = real.map(idOf).join(",") + "|" + lookId(look);
  const hit = cache.get(key);
  if (hit) return hit;
  const w = Math.max(1, ...real.map((l) => l.w));
  const h = Math.max(1, ...real.map((l) => l.h));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (g) {
    const im = g.createImageData(w, h);
    for (const l of real) paint(im.data, w, l, look);
    g.putImageData(im, 0, 0);
  }
  cache.set(key, c);
  return c;
}

/** A silhouette of a baked canvas in one colour (unseen works, the send-out flash). */
const tinted = new Map<string, HTMLCanvasElement>();
export function tint(src: HTMLCanvasElement, color: string, key: string): HTMLCanvasElement {
  const k = key + color;
  const hit = tinted.get(k);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext("2d");
  if (g) {
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
  }
  tinted.set(k, c);
  return c;
}

export function blit(g: CanvasRenderingContext2D, c: CanvasImageSource & { width: number; height: number }, x: number, y: number, flip = false, k = 1): void {
  x = Math.round(x);
  y = Math.round(y);
  if (flip) {
    g.save();
    g.translate(x + c.width * k, y);
    g.scale(-1, 1);
    g.drawImage(c, 0, 0, c.width * k, c.height * k);
    g.restore();
  } else {
    g.drawImage(c, x, y, c.width * k, c.height * k);
  }
}

/** A rounded DS-style panel drawn with rects only, so edges stay pixel-crisp. */
export function panel(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, border: string, inner?: string): void {
  g.fillStyle = border;
  g.fillRect(x + 2, y, w - 4, h);
  g.fillRect(x, y + 2, w, h - 4);
  g.fillRect(x + 1, y + 1, w - 2, h - 2);
  g.fillStyle = inner ?? fill;
  g.fillRect(x + 2, y + 2, w - 4, h - 4);
  if (inner) {
    g.fillStyle = fill;
    g.fillRect(x + 3, y + 3, w - 6, h - 6);
  }
}

export function shade(hex: string, k: number): string {
  const [r, gg, b] = rgba(hex);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return "#" + [f(r), f(gg), f(b)].map((v) => v.toString(16).padStart(2, "0")).join("");
}
