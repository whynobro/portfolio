import { clearFrame, createFrame, createMeshRaster, projectPoint, type Frame, type View } from "./lib/mesh-raster";

/**
 * The opening: a montage of the work under a night sky, ~13 s, skippable.
 *
 *   PUTTER  the CAD model draws itself with its real dimensions, a block of
 *           6061 forms around it and is cut down until the part emerges
 *   WERC    the lunar rover docks at the charging wall and charges (model)
 *   RAMPS   the product photograph, with orders and countries counting up
 *   WAVE    the rack drives the pinion as the float rides the swell
 *   BOT     an options alert is parsed and turned into an order
 *   FINALE  every work on the wall lights up around the name, then the name
 *           hands off to the page (see HANDOFF below)
 *
 * The head script in index.html decides whether it plays at all: landing
 * route only, once per browser session, never in screenshot mode and never
 * with reduced motion. Any click, key, scroll or the Skip button ends it, and
 * the page underneath is built and usable the whole time.
 *
 * HANDOFF is being decided between two mock-ups, picked by `data-hero` on
 * <html> (the head script reads `?hero=night`):
 *   dawn   the sky warms into the gallery wall while the name glides onto the
 *          page's own heading, so the cover lifts with nothing jumping;
 *   night  the entrance itself is night (styles in chrome.css), so the cover
 *          lifts onto the same sky and only the montage's objects dissolve.
 *
 * TOOLPATH: until posted G-code from the Fusion CAM setups exists, the cutter
 * follows contour rings around the part as an illustration.
 */

/**
 * Pace. Every window below is in "story seconds" and is multiplied by this,
 * so the whole montage slows or quickens together. 1.45 after the first cut
 * proved too quick to follow (2026-10-23).
 */
const PACE = 1.45;
const at = (r: readonly number[]): [number, number] => [r[0]! * PACE, r[1]! * PACE];

// Scene windows, seconds after the putter mesh arrives.
const S = {
  putter: at([0.3, 4.2]),
  werc: at([3.9, 6.5]),
  ramps: at([6.2, 8.3]),
  wave: at([8.0, 9.7]),
  bot: at([9.4, 11.1]),
  finale: at([10.8, 13.4]),
};
const P = { draw: at([0.3, 1.4]), dims: at([0.9, 1.5]), stock: at([1.4, 1.7]), cut: at([1.7, 3.5]) };
const HANDOFF = at([12.3, 13.3]);
const END = HANDOFF[1] + 0.35;
const LAYERS = 6;

// Model extents, in the mesh's unit-cube coordinates (114.3 mm = 1.0).
const HX = 63.26 / 114.3 / 2;
const HY = 25.4 / 114.3 / 2;
const HZ = 0.5;
const MARGIN = 0.03;

const NIGHT_TOP = [4, 6, 11];
const NIGHT_LOW = [20, 26, 40];
const WALL = [247, 245, 241];
const LINE = "rgba(205, 228, 255, ";
const ACCENT = "rgba(37, 150, 190, ";
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const SERIF = '"Cormorant Garamond", Georgia, serif';

const clamp = (x: number): number => Math.max(0, Math.min(1, x));
const span = (t: number, r: readonly number[]): number => clamp((t - r[0]!) / (r[1]! - r[0]!));
const ease = (x: number): number => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
const mix = (a: number[], b: number[], k: number): string =>
  `rgb(${a.map((v, i) => Math.round(v + (b[i]! - v) * k)).join(",")})`;
/** A scene's opacity: fades in over its first `f` seconds and out over its last. */
const presence = (t: number, r: readonly number[], f = 0.35): number =>
  Math.min(clamp((t - r[0]!) / f), clamp((r[1]! - t) / f));

/** Edges where the surface folds (or ends): the lines a drawing would show. */
function featureEdges(v: Float32Array): Float32Array {
  const map = new Map<string, { a: number; b: number; n: number[][] }>();
  const key = (i: number): string =>
    `${Math.round(v[i]! * 1e4)},${Math.round(v[i + 1]! * 1e4)},${Math.round(v[i + 2]! * 1e4)}`;
  for (let t = 0; t < v.length / 9; t++) {
    const o = t * 9;
    const ux = v[o + 3]! - v[o]!, uy = v[o + 4]! - v[o + 1]!, uz = v[o + 5]! - v[o + 2]!;
    const wx = v[o + 6]! - v[o]!, wy = v[o + 7]! - v[o + 1]!, wz = v[o + 8]! - v[o + 2]!;
    let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    for (const [p, q] of [[0, 1], [1, 2], [2, 0]] as const) {
      const i = o + p * 3, j = o + q * 3;
      const ki = key(i), kj = key(j);
      const k = ki < kj ? ki + "|" + kj : kj + "|" + ki;
      const e = map.get(k);
      if (e) e.n.push([nx, ny, nz]);
      else map.set(k, { a: i, b: j, n: [[nx, ny, nz]] });
    }
  }
  const segs: number[][] = [];
  for (const e of map.values()) {
    const [n0, n1] = e.n;
    // Abs: the STL's winding is not trusted (see mesh-raster.ts).
    const fold = !n1 || Math.abs(n0![0]! * n1[0]! + n0![1]! * n1[1]! + n0![2]! * n1[2]!) < 0.97;
    if (fold) segs.push([v[e.a]!, v[e.a + 1]!, v[e.a + 2]!, v[e.b]!, v[e.b + 1]!, v[e.b + 2]!]);
  }
  // Drawn in order along the part's length, so the drawing sweeps end to end.
  segs.sort((a, b) => a[2]! + a[5]! - (b[2]! + b[5]!));
  return new Float32Array(segs.flat());
}

/** The stock block, its top face at `top`: 12 triangles. */
function stockBox(top: number): Float32Array {
  const x0 = -HX - MARGIN, x1 = HX + MARGIN, y0 = -HY - 0.004, y1 = top, z0 = -HZ - MARGIN, z1 = HZ + MARGIN;
  const c = [
    [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
    [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
  ];
  const quads = [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0]];
  const out: number[] = [];
  for (const [a, b, cc, d] of quads) out.push(...c[a!]!, ...c[b!]!, ...c[cc!]!, ...c[a!]!, ...c[cc!]!, ...c[d!]!);
  return new Float32Array(out);
}

/** One contour ring around the part at a given inset, as a closed polyline. */
function ring(inset: number): number[][] {
  const x = HX + MARGIN - inset, z = HZ + MARGIN - inset;
  return [[-x, -z], [x, -z], [x, z], [-x, z], [-x, -z]];
}
const LAYER_PATH = [...ring(0.012), ...ring(0.006)];

/** A point a fraction `f` of the way along a polyline. */
function along(path: number[][], f: number): { pt: number[]; upto: number } {
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const l = Math.hypot(path[i]![0]! - path[i - 1]![0]!, path[i]![1]! - path[i - 1]![1]!);
    lens.push(l);
    total += l;
  }
  let d = f * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]!) {
      const k = d / lens[i]!;
      const a = path[i]!, b = path[i + 1]!;
      return { pt: [a[0]! + (b[0]! - a[0]!) * k, a[1]! + (b[1]! - a[1]!) * k], upto: i };
    }
    d -= lens[i]!;
  }
  return { pt: path[path.length - 1]!, upto: path.length - 2 };
}

// The wall's pictures, for the ramps scene and the finale. Resolved at build
// time so the bundler hashes them; the browser already caches them for the page.
const IMAGES = import.meta.glob<string>("./assets/img/*.avif", { eager: true, query: "?url", import: "default" });
const WALL_WORKS = ["werc-still", "putter-hero", "ramps-bank", "wave-inside", "bot-display", "campus-logo", "water-site", "door-final-cad"];
/** Pictures used by a scene but not hung in the finale. */
const EXTRA_PICS = ["ramps-site"];

const ALERT = "BTO SPY 590C 11/21 @ 1.35";
const BOT_LINES = [
  "parse   buy to open · SPY · 590 call · exp 11/21 · limit 1.35",
  "risk    size from fixed budget · contract cap ok",
  "order   placed · state rebuilt from broker fills",
];

export function initIntro(): void {
  const root = document.documentElement;
  const host = document.getElementById("intro");
  if (root.dataset["intro"] !== "play" || !host) return;
  const canvas = host.querySelector("canvas");
  const skip = host.querySelector<HTMLButtonElement>(".intro__skip");
  const label = host.querySelector<HTMLElement>(".intro__label");
  const g = canvas?.getContext("2d");
  if (!canvas || !g) {
    host.remove();
    delete root.dataset["intro"];
    return;
  }
  const night = root.dataset["hero"] === "night";

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // The part renders into its own smaller buffer: rasterising the whole
  // viewport at 2x would be millions of pixels per frame.
  const rdpr = Math.min(dpr, 1.5);
  const off = document.createElement("canvas");
  const og = off.getContext("2d");
  let W = 0, H = 0, frame: Frame | null = null;

  let seed = 11;
  const rand = (): number => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const stars = Array.from({ length: 240 }, () => ({ x: rand(), y: rand(), r: rand(), tw: rand() * 6 }));
  const sparks: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

  const pics = new Map<string, HTMLImageElement>();
  for (const name of [...WALL_WORKS, ...EXTRA_PICS]) {
    const url = IMAGES[`./assets/img/${name}.avif`];
    if (!url) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    pics.set(name, img);
  }

  // The rover scene, mounted off-page and painted frame by frame at the
  // montage's own pace.
  const wercHost = document.createElement("div");
  let werc: { resize?(w: number, h: number): void; renderAt(at: number): void; dispose(): void } | null = null;
  let wercCanvas: HTMLCanvasElement | null = null;
  let wercStart = 0;
  void import("./scenes/werc/index").then((m) => {
    const scene = m.default();
    scene.mount({ root: wercHost, t: () => "", reducedMotion: true, dpr });
    werc = scene;
    wercCanvas = wercHost.querySelector("canvas");
    wercStart = m.WERC_STARTS[2]!; // fine align: the rover is already close
    sizeWerc();
  });

  let part: ReturnType<typeof createMeshRaster> | null = null;
  let edges: Float32Array | null = null;
  const box = createMeshRaster(stockBox(HY + 0.02));

  function panel(aspect: number, widthK = 0.7): { x: number; y: number; w: number; h: number } {
    let w = Math.min(W * widthK, 1100);
    let h = w / aspect;
    if (h > H * 0.6) {
      h = H * 0.6;
      w = h * aspect;
    }
    return { x: (W - w) / 2, y: (H - h) / 2 - H * 0.03, w, h };
  }

  function sizeWerc(): void {
    if (!werc) return;
    const r = panel(21 / 9, 0.8);
    werc.resize?.(r.w, r.h);
  }

  function resize(): void {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas!.width = Math.round(W * dpr);
    canvas!.height = Math.round(H * dpr);
    canvas!.style.width = `${W}px`;
    canvas!.style.height = `${H}px`;
    const side = Math.round(Math.min(W, H) * 0.95 * rdpr);
    off.width = side;
    off.height = side;
    frame = og ? createFrame(og, side, side) : null;
    sizeWerc();
  }
  resize();
  window.addEventListener("resize", resize);

  // The mesh is its own chunk: the sky starts at once, and the montage's
  // clock waits for the part to arrive.
  let t0 = 0;
  let ready = false;
  void import("./scenes/putter/mesh").then((m) => {
    const v = m.vertices();
    part = createMeshRaster(v);
    edges = featureEdges(v);
    ready = true;
    t0 = performance.now();
  });

  const start = performance.now();
  let raf = 0;
  let done = false;

  // ---- Sky ---------------------------------------------------------------
  function sky(clock: number, dawn: number): void {
    const grad = g!.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, mix(NIGHT_TOP, WALL, dawn));
    grad.addColorStop(1, mix(NIGHT_LOW, WALL, dawn));
    g!.fillStyle = grad;
    g!.fillRect(0, 0, W, H);
    const fade = clamp(clock / 0.6) * (1 - dawn);
    for (const s of stars) {
      g!.globalAlpha = fade * (0.25 + 0.6 * s.r) * (0.7 + 0.3 * Math.sin(clock * 2 + s.tw));
      g!.fillStyle = "#fff";
      const sz = s.r > 0.9 ? 1.8 : 1;
      g!.fillRect(s.x * W, s.y * H, sz, sz);
    }
    g!.globalAlpha = 1;
    for (const [at, y0] of [[0.25, 0.18], [3.0, 0.08], [7.4, 0.14], [10.4, 0.06]] as const) {
      const k = (clock - at) / 0.7;
      if (k < 0 || k > 1) continue;
      const x = W * (0.15 + k * 0.6), y = H * (y0 + k * 0.18);
      const tail = g!.createLinearGradient(x, y, x - 140, y - 42);
      tail.addColorStop(0, `rgba(255,255,255,${(1 - k) * 0.95 * (1 - dawn)})`);
      tail.addColorStop(1, "rgba(255,255,255,0)");
      g!.strokeStyle = tail;
      g!.lineWidth = 1.6;
      g!.beginPath();
      g!.moveTo(x, y);
      g!.lineTo(x - 140, y - 42);
      g!.stroke();
    }
  }

  // ---- Putter: drawing, stock, cut ------------------------------------------
  function putter(t: number, a: number): void {
    if (!part || !edges || !frame || !og) return;
    const side = off.width / rdpr;
    const scale = side * 0.74;
    const view: View = { angle: 3.3 + (t / PACE) * 0.22, tilt: -0.55, scale, cx: side / 2, cy: side / 2 };
    const ox = (W - side) / 2, oy = (H - side) / 2 - H * 0.03;
    const pt = (x: number, y: number, z: number): number[] => {
      const p = projectPoint(view, x, y, z, 1);
      return [p[0] + ox, p[1] + oy];
    };

    const stockIn = span(t, P.stock);
    const cutK = span(t, P.cut);
    const layer = Math.min(LAYERS - 1, Math.floor(cutK * LAYERS));
    const inLayer = cutK * LAYERS - layer;
    const top = HY + 0.02;
    const cutY = cutK >= 1 ? -HY - 0.004 : top - ((top + HY) * (layer + ease(clamp(inLayer * 1.25 - 0.1)))) / LAYERS;
    if (stockIn > 0) {
      clearFrame(frame);
      if (cutK > 0) {
        part.setView(view, rdpr);
        part.draw(frame);
      }
      if (cutK < 1) {
        box.setVertices(stockBox(cutY));
        box.setView(view, rdpr);
        box.draw(frame, [0.9, 0.93, 0.98]);
      }
      og.putImageData(frame.image, 0, 0);
      g!.globalAlpha = ease(stockIn) * a;
      g!.drawImage(off, ox, oy, side, side);
      g!.globalAlpha = 1;
    }

    const drawK = span(t, P.draw);
    const lineAlpha = (1 - ease(span(t, [P.stock[0]!, P.cut[0]! + 0.2]))) * a;
    if (drawK > 0 && lineAlpha > 0) {
      const n = Math.floor((edges.length / 6) * ease(drawK));
      g!.strokeStyle = LINE + 0.85 * lineAlpha + ")";
      g!.lineWidth = 1.25;
      g!.beginPath();
      for (let i = 0; i < n; i++) {
        const o = i * 6;
        const p0 = pt(edges[o]!, edges[o + 1]!, edges[o + 2]!);
        const p1 = pt(edges[o + 3]!, edges[o + 4]!, edges[o + 5]!);
        g!.moveTo(p0[0]!, p0[1]!);
        g!.lineTo(p1[0]!, p1[1]!);
      }
      g!.stroke();
      const dimK = ease(span(t, P.dims)) * lineAlpha;
      if (dimK > 0) {
        const d = 0.07;
        dimension(pt(-HX - d, -HY, -HZ), pt(-HX - d, -HY, HZ), "114.3", dimK);
        dimension(pt(-HX, -HY, HZ + d), pt(HX, -HY, HZ + d), "63.3", dimK);
        dimension(pt(HX + d, -HY, HZ), pt(HX + d, HY, HZ), "25.4", dimK);
      }
    }

    if (cutK > 0 && cutK < 1) {
      const { pt: at, upto } = along(LAYER_PATH, clamp(inLayer));
      g!.globalAlpha = a;
      g!.strokeStyle = ACCENT + "0.9)";
      g!.lineWidth = 1.5;
      g!.beginPath();
      const s0 = pt(LAYER_PATH[0]![0]!, cutY, LAYER_PATH[0]![1]!);
      g!.moveTo(s0[0]!, s0[1]!);
      for (let i = 1; i <= upto; i++) {
        const q = pt(LAYER_PATH[i]![0]!, cutY, LAYER_PATH[i]![1]!);
        g!.lineTo(q[0]!, q[1]!);
      }
      const tip = pt(at[0]!, cutY, at[1]!);
      g!.lineTo(tip[0]!, tip[1]!);
      g!.stroke();
      const up = pt(at[0]!, cutY + 0.3, at[1]!);
      const shank = g!.createLinearGradient(tip[0]! - 5, 0, tip[0]! + 5, 0);
      shank.addColorStop(0, "#6d737c");
      shank.addColorStop(0.5, "#e7ebf0");
      shank.addColorStop(1, "#5a6068");
      g!.strokeStyle = shank;
      g!.lineWidth = Math.max(5, scale * 0.028);
      g!.lineCap = "round";
      g!.beginPath();
      g!.moveTo(tip[0]!, tip[1]!);
      g!.lineTo(up[0]!, up[1]!);
      g!.stroke();
      g!.lineCap = "butt";
      const hot = g!.createRadialGradient(tip[0]!, tip[1]!, 0, tip[0]!, tip[1]!, 16);
      hot.addColorStop(0, "rgba(255, 244, 214, 0.95)");
      hot.addColorStop(1, "rgba(37, 150, 190, 0)");
      g!.fillStyle = hot;
      g!.fillRect(tip[0]! - 16, tip[1]! - 16, 32, 32);
      g!.globalAlpha = 1;
      for (let k = 0; k < 3; k++) {
        sparks.push({ x: tip[0]!, y: tip[1]!, vx: (rand() - 0.5) * 220, vy: -rand() * 160, life: 0.35 });
      }
    }
  }

  function dimension(a: number[], b: number[], text: string, k: number): void {
    const mx = a[0]! + (b[0]! - a[0]!) * k, my = a[1]! + (b[1]! - a[1]!) * k;
    g!.strokeStyle = ACCENT + "0.95)";
    g!.lineWidth = 1;
    g!.beginPath();
    g!.moveTo(a[0]!, a[1]!);
    g!.lineTo(mx, my);
    g!.stroke();
    const dx = b[0]! - a[0]!, dy = b[1]! - a[1]!, l = Math.hypot(dx, dy) || 1;
    const nx = (-dy / l) * 5, ny = (dx / l) * 5;
    for (const p of [a, [mx, my]]) {
      g!.beginPath();
      g!.moveTo(p[0]! - nx, p[1]! - ny);
      g!.lineTo(p[0]! + nx, p[1]! + ny);
      g!.stroke();
    }
    if (k > 0.9) {
      g!.font = `500 ${Math.max(11, Math.min(14, W * 0.011))}px ${MONO}`;
      g!.fillStyle = `rgba(150, 210, 235, ${(k - 0.9) * 10})`;
      g!.textAlign = "center";
      g!.textBaseline = "middle";
      g!.fillText(`${text} mm`, (a[0]! + b[0]!) / 2 + nx * 3.2, (a[1]! + b[1]!) / 2 + ny * 3.2);
    }
  }

  /** A hairline around a scene's picture, so it reads as a framed screen. */
  function outline(r: { x: number; y: number; w: number; h: number }, a: number): void {
    g!.strokeStyle = `rgba(205, 228, 255, ${0.28 * a})`;
    g!.lineWidth = 1;
    g!.strokeRect(r.x - 0.5, r.y - 0.5, r.w + 1, r.h + 1);
  }

  // ---- WERC: the docking sequence at 2.4x ----------------------------------
  function wercScene(t: number, a: number): void {
    if (!werc || !wercCanvas) return;
    const r = panel(21 / 9, 0.8);
    werc.renderAt(wercStart + ((t - S.werc[0]) / PACE) * 2.4);
    const z = lerp(0.97, 1, ease(span(t, [S.werc[0], S.werc[0] + 0.6])));
    g!.globalAlpha = a;
    g!.drawImage(wercCanvas, r.x + (r.w * (1 - z)) / 2, r.y + (r.h * (1 - z)) / 2, r.w * z, r.h * z);
    outline(r, a);
    g!.globalAlpha = 1;
  }

  // ---- Ramps: the headline figure, the product and the shop -----------------
  function ramps(t: number, a: number): void {
    const photo = pics.get("ramps-bank");
    const site = pics.get("ramps-site");
    const k = (t - S.ramps[0]) / PACE;
    // Side by side on a wide screen; stacked on a tall one, where side by
    // side left both pictures too small to read.
    const tall = H > W;
    const pw = tall ? W * 0.84 : 0;
    const r = tall
      ? { x: (W - pw) / 2, y: H * 0.26, w: pw, h: pw * 0.62 }
      : panel(16 / 7, 0.84);
    const gap = r.h * 0.06;
    const photoR = tall ? { x: r.x, y: r.y, w: r.w, h: r.h } : { x: r.x, y: r.y, w: r.h, h: r.h };
    g!.save();
    g!.globalAlpha = a;

    // The product photograph, with a slow push in.
    if (photo?.complete && photo.naturalWidth) {
      const zoom = lerp(1, 1.1, clamp(k / 2.1));
      const cr = photoR.w / photoR.h;
      const sw = Math.min(photo.naturalWidth, photo.naturalHeight * cr) / zoom;
      const sh = sw / cr;
      g!.drawImage(photo, (photo.naturalWidth - sw) / 2, (photo.naturalHeight - sh) / 2, sw, sh, photoR.x, photoR.y, photoR.w, photoR.h);
      outline(photoR, 1);
    }

    // The live shop, in a browser window, sliding in beside it.
    if (site?.complete && site.naturalWidth) {
      const slide = ease(clamp((k - 0.35) / 0.6));
      const bw = tall ? r.w : r.w - r.h - gap;
      const bx = (tall ? r.x : r.x + r.h + gap) + (1 - slide) * r.w * 0.08;
      const bar = Math.max(14, (tall ? bw * 0.62 : r.h) * 0.07);
      const bh = tall ? bar + bw * 0.5 : Math.min(r.h, bar + bw * (site.naturalHeight / site.naturalWidth));
      const by = tall ? r.y + r.h + gap : r.y + (r.h - bh) / 2;
      g!.globalAlpha = a * slide;
      g!.fillStyle = "#e9e6df";
      g!.fillRect(bx, by, bw, bar);
      for (let i = 0; i < 3; i++) {
        g!.fillStyle = ["#e0645a", "#e3b341", "#5fc05a"][i]!;
        g!.beginPath();
        g!.arc(bx + bar * (0.6 + i * 0.55), by + bar / 2, bar * 0.18, 0, Math.PI * 2);
        g!.fill();
      }
      g!.fillStyle = "#6f675c";
      g!.font = `500 ${bar * 0.48}px ${MONO}`;
      g!.textAlign = "left";
      g!.textBaseline = "middle";
      g!.fillText("chameleonramps.com", bx + bar * 2.4, by + bar / 2);
      g!.drawImage(site, 0, 0, site.naturalWidth, site.naturalWidth * ((bh - bar) / bw), bx, by + bar, bw, bh - bar);
      outline({ x: bx, y: by, w: bw, h: bh }, 1);
      g!.globalAlpha = a;
    }

    // The headline: revenue counting up, the rest beneath it.
    const c = ease(clamp((k - 0.2) / 1.1));
    const big = Math.max(30, Math.min(W * 0.06, 84));
    const hy = r.y - big * 0.45;
    g!.fillStyle = "#fff";
    g!.font = `600 ${big}px ${SERIF}`;
    g!.textAlign = "center";
    g!.textBaseline = "alphabetic";
    g!.fillText(`$${Math.round(39600 * c).toLocaleString("en-US")} in revenue`, W / 2, hy);
    g!.font = `500 ${Math.max(11, big * 0.2)}px ${MONO}`;
    g!.fillStyle = "rgba(150, 210, 235, 0.95)";
    g!.textBaseline = "top";
    const facts = `${Math.round(627 * c)} ORDERS · ${Math.round(15 * c)} COUNTRIES · 40+ PRODUCTS I DESIGNED`;
    const below = tall ? r.y + r.h + gap * 2 + r.w * 0.5 + Math.max(14, r.w * 0.62 * 0.07) : r.y + r.h + big * 0.35;
    if (tall) {
      // Two lines on a phone: the one-line version runs off the screen.
      g!.fillText(`${Math.round(627 * c)} ORDERS · ${Math.round(15 * c)} COUNTRIES`, W / 2, below);
      g!.fillText("40+ PRODUCTS I DESIGNED", W / 2, below + Math.max(11, big * 0.2) * 1.5);
    } else {
      g!.fillText(facts, W / 2, below);
    }
    g!.restore();
  }

  // ---- Wave: float, rack, pinion, volts ------------------------------------
  function wave(t: number, a: number): void {
    const r = panel(16 / 9, 0.78);
    const u = r.h / 9;
    const k = t - S.wave[0];
    g!.save();
    g!.globalAlpha = a;
    g!.strokeStyle = LINE + "0.85)";
    g!.lineWidth = 1.4;
    const sea = r.y + r.h * 0.72;
    for (let row = 0; row < 3; row++) {
      g!.beginPath();
      for (let x = 0; x <= r.w; x += 6) {
        const y = sea + row * u * 0.45 + Math.sin(x / (u * 1.6) - k * 3 - row) * u * 0.28;
        if (x === 0) g!.moveTo(r.x + x, y);
        else g!.lineTo(r.x + x, y);
      }
      g!.stroke();
    }
    // The float rides the swell; the rack moves with it.
    const fx = r.x + r.w * 0.35;
    const bob = Math.sin(fx / (u * 1.6) - k * 3) * u * 0.28;
    const floatY = sea + bob;
    g!.beginPath();
    g!.ellipse(fx, floatY, u * 0.9, u * 0.45, 0, 0, Math.PI * 2);
    g!.stroke();
    const rackTop = floatY - u * 5.2;
    g!.strokeRect(fx - u * 0.25, rackTop, u * 0.5, u * 4.8);
    for (let y = rackTop + u * 0.2; y < floatY - u * 0.5; y += u * 0.32) {
      g!.beginPath();
      g!.moveTo(fx + u * 0.25, y);
      g!.lineTo(fx + u * 0.45, y + u * 0.08);
      g!.lineTo(fx + u * 0.25, y + u * 0.16);
      g!.stroke();
    }
    // The pinion turns by the rack's travel over its radius.
    const pr = u * 1.1;
    const px = fx + u * 0.45 + pr, py = r.y + r.h * 0.32;
    const ang = bob / pr;
    g!.beginPath();
    for (let i = 0; i <= 48; i++) {
      const th = ang + (i / 48) * Math.PI * 2;
      const rr = i % 4 < 2 ? pr : pr * 0.86;
      const x = px + Math.cos(th) * rr, y = py + Math.sin(th) * rr;
      if (i === 0) g!.moveTo(x, y);
      else g!.lineTo(x, y);
    }
    g!.stroke();
    g!.beginPath();
    g!.arc(px, py, pr * 0.2, 0, Math.PI * 2);
    g!.stroke();
    // Shaft to the generator, and its reading.
    g!.strokeStyle = ACCENT + "0.95)";
    g!.beginPath();
    g!.moveTo(px + pr * 0.2, py);
    g!.lineTo(px + u * 3.2, py);
    g!.stroke();
    g!.strokeRect(px + u * 3.2, py - u * 0.9, u * 2.2, u * 1.8);
    const volts = Math.round(120 * ease(span(t, [S.wave[0] + 0.2 * PACE, S.wave[0] + 1.3 * PACE])));
    g!.fillStyle = "#fff";
    g!.font = `500 ${u * 0.75}px ${MONO}`;
    g!.textAlign = "center";
    g!.textBaseline = "middle";
    g!.fillText(`${volts} V`, px + u * 4.3, py);
    g!.font = `500 ${Math.max(10, u * 0.3)}px ${MONO}`;
    g!.fillStyle = "rgba(233,227,214,0.75)";
    g!.fillText("AT 1:12 SCALE", px + u * 4.3, py + u * 1.3);
    g!.restore();
  }

  // ---- Bot: an alert becomes an order --------------------------------------
  function bot(t: number, a: number): void {
    const r = panel(16 / 9, 0.6);
    const k = (t - S.bot[0]) / PACE;
    g!.save();
    g!.globalAlpha = a;
    g!.fillStyle = "rgba(8, 11, 18, 0.92)";
    g!.fillRect(r.x, r.y, r.w, r.h);
    outline(r, 1);
    const size = Math.max(11, Math.min(18, r.w * 0.022));
    const lh = size * 1.9;
    let y = r.y + size * 2;
    const x = r.x + size * 1.6;
    g!.textAlign = "left";
    g!.textBaseline = "alphabetic";
    g!.font = `500 ${size}px ${MONO}`;
    g!.fillStyle = "rgba(233,227,214,0.5)";
    g!.fillText("#alerts", x, y);
    y += lh;
    const typed = ALERT.slice(0, Math.floor(clamp(k / 0.6) * ALERT.length));
    g!.fillStyle = "#fff";
    g!.fillText(typed + (k < 0.6 && Math.floor(k * 8) % 2 ? "▌" : ""), x, y);
    y += lh * 1.3;
    BOT_LINES.forEach((line, i) => {
      const at = 0.7 + i * 0.3;
      if (k < at) return;
      const head = line.slice(0, 8), rest = line.slice(8);
      g!.fillStyle = ACCENT + "1)";
      g!.fillText(head, x, y);
      g!.fillStyle = i === 2 ? "#8fe3b4" : "rgba(233,227,214,0.92)";
      g!.fillText(rest, x + g!.measureText(head).width, y);
      y += lh;
    });
    g!.textAlign = "right";
    g!.fillStyle = "rgba(233,227,214,0.4)";
    g!.fillText("illustrative alert", r.x + r.w - size * 1.6, r.y + size * 2);
    g!.textAlign = "left";
    if (k > 1.5) {
      g!.fillStyle = "rgba(233,227,214,0.6)";
      g!.fillText("2,208 tests pin this path before it touches the account", x, r.y + r.h - size * 1.4);
    }
    g!.restore();
  }

  // ---- Finale: the whole wall, then the name hands off ----------------------
  /** Where the page's own heading sits: its left edge and text BASELINE, so
   *  the drawn name lands on it exactly and nothing ghosts as the cover lifts. */
  function nameTarget(): { x: number; y: number; size: number } | null {
    const h1 = document.querySelector<HTMLElement>(".entrance__name");
    if (!h1) return null;
    const b = h1.getBoundingClientRect();
    const size = parseFloat(getComputedStyle(h1).fontSize);
    g!.font = `600 ${size}px ${SERIF}`;
    const m = g!.measureText("Michael Fischbach");
    const asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
    return { x: b.left, y: b.top + (b.height - (asc + desc)) / 2 + asc, size };
  }

  function finale(t: number, a: number, hand: number): void {
    const names = WALL_WORKS;
    const cols = W > H ? 4 : 2;
    const rows = Math.ceil(names.length / cols);
    const tw = Math.min((W * 0.8) / cols, 260);
    const th = tw * 0.66;
    const gap = tw * 0.08;
    const gridW = cols * tw + (cols - 1) * gap;
    const gridH = rows * th + (rows - 1) * gap;
    const gx = (W - gridW) / 2;
    const gy = H * 0.5 - gridH / 2 + H * 0.08;
    names.forEach((n, i) => {
      const img = pics.get(n);
      const lit = ease(span(t, [S.finale[0] + (0.1 + i * 0.12) * PACE, S.finale[0] + (0.5 + i * 0.12) * PACE])) * a * (1 - hand);
      if (!img?.complete || !img.naturalWidth || lit <= 0) return;
      const x = gx + (i % cols) * (tw + gap), y = gy + Math.floor(i / cols) * (th + gap);
      const ir = img.naturalWidth / img.naturalHeight, cr = tw / th;
      const sw = ir > cr ? img.naturalHeight * cr : img.naturalWidth;
      const sh = ir > cr ? img.naturalHeight : img.naturalWidth / cr;
      g!.globalAlpha = lit;
      g!.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y + (1 - lit) * 8, tw, th);
      g!.strokeStyle = "rgba(216, 180, 90, 0.85)";
      g!.lineWidth = 2;
      g!.strokeRect(x - 1, y - 1 + (1 - lit) * 8, tw + 2, th + 2);
    });
    g!.globalAlpha = 1;

    // The name: centred above the wall, then gliding onto the page's heading.
    const nameIn = ease(span(t, [S.finale[0] + 0.2 * PACE, S.finale[0] + 0.9 * PACE])) * a;
    const big = Math.min(W * 0.075, 96);
    const target = nameTarget();
    const k = ease(hand);
    const fromX = W / 2, fromY = gy - big * 1.3;
    const size = target ? lerp(big, target.size, k) : big;
    g!.font = `600 ${size}px ${SERIF}`;
    const textW = g!.measureText("Michael Fischbach").width;
    const cx = target ? lerp(fromX - textW / 2, target.x, k) : fromX - textW / 2;
    const cy = target ? lerp(fromY, target.y, k) : fromY;
    g!.textAlign = "left";
    g!.textBaseline = "alphabetic";
    g!.globalAlpha = nameIn;
    g!.fillStyle = night ? "#fff" : mixColor(k);
    g!.fillText("Michael Fischbach", cx, cy);
    g!.font = `italic 400 ${Math.max(14, big * 0.28)}px ${SERIF}`;
    g!.globalAlpha = nameIn * (1 - k);
    g!.fillStyle = "rgba(150, 210, 235, 0.95)";
    g!.textAlign = "center";
    g!.fillText("Mechanical engineering · Cal Poly San Luis Obispo", W / 2, fromY + big * 0.6);
    g!.globalAlpha = 1;
  }
  /** The name's colour on the way down: white on night, the page's ink by dawn. */
  function mixColor(k: number): string {
    return mix([255, 255, 255], [20, 17, 14], k);
  }

  const CAPTIONS: [readonly number[], string][] = [
    [S.putter, "CNC putter · CAD to 6061 on a 3-axis Haas · $18.56 per unit"],
    [S.werc, "NASA Artemis lunar rover charger · team lead · model values"],
    [S.ramps, "Chameleon Ramps · my cast-concrete company · 2019–2026"],
    [S.wave, "Wave energy converter · team lead · 1st of 5 teams"],
    [S.bot, "SMC trading bot · options live, real money"],
    [S.finale, "Michael Fischbach · mechanical engineering"],
  ];

  function draw(now: number): void {
    const clock = (now - start) / 1000;
    const t = ready ? (now - t0) / 1000 : 0;
    const hand = span(t, HANDOFF);
    g!.setTransform(dpr, 0, 0, dpr, 0, 0);
    sky(clock, night ? 0 : ease(hand));
    if (!ready) return;

    const pa = presence(t, S.putter);
    if (pa > 0) putter(t, pa);
    const wa = presence(t, S.werc);
    if (wa > 0) wercScene(t, wa);
    const ra = presence(t, S.ramps);
    if (ra > 0) ramps(t, ra);
    const va = presence(t, S.wave);
    if (va > 0) wave(t, va);
    const ba = presence(t, S.bot);
    if (ba > 0) bot(t, ba);
    const fa = clamp((t - S.finale[0]) / 0.35);
    if (fa > 0) finale(t, fa, hand);

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]!;
      s.life -= 1 / 60;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      s.x += s.vx / 60;
      s.y += s.vy / 60;
      s.vy += 520 / 60;
      g!.fillStyle = `rgba(255, 236, 190, ${s.life * 2.4})`;
      g!.fillRect(s.x, s.y, 2, 2);
    }

    if (label) {
      let text = "";
      let alpha = 0;
      for (const [r, c] of CAPTIONS) {
        const p = presence(t, r, 0.25);
        if (p > alpha) {
          alpha = p;
          text = c;
        }
      }
      if (label.textContent !== text) label.textContent = text;
      label.style.opacity = String(alpha * (1 - hand));
    }

    // The cover lifts once the name has landed on the page's own heading.
    // Driven by the clock rather than a CSS transition, so a recorded preview
    // shows exactly what a browser does.
    const lift = clamp((t - (HANDOFF[1] - 0.15)) / 0.45);
    if (lift > 0) host!.style.opacity = String(1 - lift);
    if (t >= END) finish(true);
  }

  function loop(now: number): void {
    if (done) return;
    draw(now);
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  function onSkip(): void {
    finish(false);
  }

  function finish(instant: boolean): void {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    for (const ev of ["pointerdown", "keydown", "wheel", "touchstart"] as const) {
      window.removeEventListener(ev, onSkip, true);
    }
    window.removeEventListener("resize", resize);
    werc?.dispose();
    const remove = (): void => {
      host!.remove();
      delete root.dataset["intro"];
    };
    if (instant) return remove();
    host!.classList.add("intro--out");
    window.setTimeout(remove, 500);
  }

  for (const ev of ["pointerdown", "keydown", "wheel", "touchstart"] as const) {
    window.addEventListener(ev, onSkip, { capture: true, passive: true });
  }
  skip?.addEventListener("click", onSkip);
}
