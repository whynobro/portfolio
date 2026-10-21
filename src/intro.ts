import { clearFrame, createFrame, createMeshRaster, projectPoint, type Frame, type View } from "./lib/mesh-raster";

/**
 * The opening: the putter goes from a drawing to a part, under a night sky.
 *
 *   SKY    stars fade in; a shooting star crosses
 *   DRAW   the CAD model draws itself as a white line drawing, with its real
 *          dimensions (from the STL: 114.3 × 63.3 × 25.4 mm)
 *   STOCK  a block of 6061 materialises around the drawing
 *   CUT    the block is cut down layer by layer while the cutter traces its
 *          path, and the part emerges from it
 *   DAWN   the sky warms into the gallery wall and the page is revealed
 *
 * The head script in index.html decides whether it plays at all: only on the
 * landing route, once per browser session, never in screenshot mode and never
 * for a reader who asked for reduced motion. Any click, key, scroll or the
 * Skip button jumps to the end. The page underneath is fully built and usable
 * the whole time; the intro only covers it.
 *
 * TOOLPATH: until the posted G-code from the Fusion CAM setups is in
 * assets-src/putter/, the cutter follows contour rings around the part as an
 * illustration rather than the machine's real path.
 */

const T = { draw: [0.3, 1.3], dims: [0.9, 1.4], stock: [1.25, 1.55], cut: [1.55, 3.15], spin: 3.15, dawn: [3.5, 4.2], end: 4.2 };
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

const clamp = (x: number): number => Math.max(0, Math.min(1, x));
const span = (t: number, [a, b]: number[]): number => clamp((t - a!) / (b! - a!));
const ease = (x: number): number => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const mix = (a: number[], b: number[], k: number): string =>
  `rgb(${a.map((v, i) => Math.round(v + (b[i]! - v) * k)).join(",")})`;

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
  const out: number[] = [];
  for (const e of map.values()) {
    const [n0, n1] = e.n;
    // Abs: the STL's winding is not trusted (see mesh-raster.ts).
    const fold = !n1 || Math.abs(n0![0]! * n1[0]! + n0![1]! * n1[1]! + n0![2]! * n1[2]!) < 0.97;
    if (fold) out.push(v[e.a]!, v[e.a + 1]!, v[e.a + 2]!, v[e.b]!, v[e.b + 1]!, v[e.b + 2]!);
  }
  // Drawn in order along the part's length, so the drawing sweeps end to end.
  const segs: number[][] = [];
  for (let i = 0; i < out.length; i += 6) segs.push(out.slice(i, i + 6));
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

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // The part renders into its own smaller buffer: rasterising the whole
  // viewport at 2x would be millions of pixels per frame for a part that
  // covers a fraction of it.
  const rdpr = Math.min(dpr, 1.5);
  const off = document.createElement("canvas");
  const og = off.getContext("2d");
  let W = 0, H = 0, frame: Frame | null = null;

  let seed = 11;
  const rand = (): number => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const stars = Array.from({ length: 220 }, () => ({ x: rand(), y: rand(), r: rand(), tw: rand() * 6 }));
  const sparks: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

  let part: ReturnType<typeof createMeshRaster> | null = null;
  let edges: Float32Array | null = null;
  const box = createMeshRaster(stockBox(HY + 0.02));

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
  }
  resize();
  window.addEventListener("resize", resize);

  // The mesh is its own chunk: the sky starts drawing at once, and the clock
  // for the drawing waits for the part to arrive.
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

  function sky(time: number, dawn: number): void {
    const grad = g!.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, mix(NIGHT_TOP, WALL, dawn));
    grad.addColorStop(1, mix(NIGHT_LOW, WALL, dawn));
    g!.fillStyle = grad;
    g!.fillRect(0, 0, W, H);
    const fade = clamp(time / 0.6) * (1 - dawn);
    for (const s of stars) {
      g!.globalAlpha = fade * (0.25 + 0.6 * s.r) * (0.7 + 0.3 * Math.sin(time * 2 + s.tw));
      g!.fillStyle = "#fff";
      const sz = s.r > 0.9 ? 1.8 : 1;
      g!.fillRect(s.x * W, s.y * H, sz, sz);
    }
    g!.globalAlpha = 1;
    // Shooting stars: a short bright streak with a fading tail.
    for (const [at, y0] of [[0.25, 0.18], [2.1, 0.08]] as const) {
      const k = (time - at) / 0.7;
      if (k < 0 || k > 1) continue;
      const x = W * (0.15 + k * 0.6), y = H * (y0 + k * 0.18);
      const tail = g!.createLinearGradient(x, y, x - 140, y - 42);
      tail.addColorStop(0, `rgba(255,255,255,${(1 - k) * 0.95})`);
      tail.addColorStop(1, "rgba(255,255,255,0)");
      g!.strokeStyle = tail;
      g!.lineWidth = 1.6;
      g!.beginPath();
      g!.moveTo(x, y);
      g!.lineTo(x - 140, y - 42);
      g!.stroke();
    }
  }

  function draw(now: number): void {
    const clock = (now - start) / 1000;
    const t = ready ? (now - t0) / 1000 : 0;
    const dawn = ease(span(t, T.dawn));
    g!.setTransform(dpr, 0, 0, dpr, 0, 0);
    sky(clock, dawn);
    if (!ready || !part || !edges || !frame || !og) return;

    const side = off.width / rdpr;
    const scale = side * 0.74;
    const view: View = { angle: 3.3 + t * 0.22, tilt: -0.55, scale, cx: side / 2, cy: side / 2 };
    const ox = (W - side) / 2, oy = (H - side) / 2 - H * 0.02;
    const P = (x: number, y: number, z: number): number[] => {
      const p = projectPoint(view, x, y, z, 1);
      return [p[0] + ox, p[1] + oy];
    };

    // ---- The solid: stock block, then the part emerging from it ----------
    const stockIn = span(t, T.stock);
    const cutK = span(t, T.cut);
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
      g!.globalAlpha = ease(stockIn);
      g!.drawImage(off, ox, oy, side, side);
      g!.globalAlpha = 1;
    }

    // ---- The drawing: feature edges, then dimensions ----------------------
    const drawK = span(t, T.draw);
    const lineAlpha = (1 - ease(span(t, [T.stock[0]!, T.cut[0]! + 0.2]))) * (1 - dawn);
    if (drawK > 0 && lineAlpha > 0) {
      const n = Math.floor((edges.length / 6) * ease(drawK));
      g!.strokeStyle = LINE + 0.85 * lineAlpha + ")";
      g!.lineWidth = 1.25;
      g!.beginPath();
      for (let i = 0; i < n; i++) {
        const o = i * 6;
        const a = P(edges[o]!, edges[o + 1]!, edges[o + 2]!);
        const b = P(edges[o + 3]!, edges[o + 4]!, edges[o + 5]!);
        g!.moveTo(a[0]!, a[1]!);
        g!.lineTo(b[0]!, b[1]!);
      }
      g!.stroke();

      const dimK = ease(span(t, T.dims)) * lineAlpha;
      if (dimK > 0) {
        const d = 0.07;
        dimension(P(-HX - d, -HY, -HZ), P(-HX - d, -HY, HZ), "114.3", dimK);
        dimension(P(-HX, -HY, HZ + d), P(HX, -HY, HZ + d), "63.3", dimK);
        dimension(P(HX + d, -HY, HZ), P(HX + d, HY, HZ), "25.4", dimK);
      }
    }

    // ---- The cutter and its path on the current layer ---------------------
    if (cutK > 0 && cutK < 1) {
      const { pt, upto } = along(LAYER_PATH, clamp(inLayer));
      g!.strokeStyle = ACCENT + "0.9)";
      g!.lineWidth = 1.5;
      g!.beginPath();
      const s0 = P(LAYER_PATH[0]![0]!, cutY, LAYER_PATH[0]![1]!);
      g!.moveTo(s0[0]!, s0[1]!);
      for (let i = 1; i <= upto; i++) {
        const q = P(LAYER_PATH[i]![0]!, cutY, LAYER_PATH[i]![1]!);
        g!.lineTo(q[0]!, q[1]!);
      }
      const tip = P(pt[0]!, cutY, pt[1]!);
      g!.lineTo(tip[0]!, tip[1]!);
      g!.stroke();

      // End mill: a shank above the tip, and a hot spot where it cuts.
      const up = P(pt[0]!, cutY + 0.3, pt[1]!);
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
      for (let k = 0; k < 3; k++) {
        sparks.push({ x: tip[0]!, y: tip[1]!, vx: (rand() - 0.5) * 220, vy: -rand() * 160, life: 0.35 });
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]!;
      s.life -= 1 / 60;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      s.x += s.vx / 60;
      s.y += s.vy / 60;
      s.vy += 520 / 60;
      g!.fillStyle = `rgba(255, 236, 190, ${s.life * 2.4})`;
      g!.fillRect(s.x, s.y, 2, 2);
    }

    // ---- The caption: what stage this is ---------------------------------
    if (label) {
      const stage = t < T.stock[0]! ? 0 : t < T.cut[0]! ? 1 : t < T.spin ? 2 : 3;
      const text = ["01 · CAD · Fusion 360", "02 · Stock · Aluminium 6061", "03 · CAM · 3-axis Haas", "04 · Part · $18.56 per unit"][stage]!;
      if (label.textContent !== text) label.textContent = text;
      label.style.opacity = String(1 - dawn);
    }

    if (t >= T.end) finish(false);
  }

  function dimension(a: number[], b: number[], text: string, k: number): void {
    const mx = a[0]! + (b[0]! - a[0]!) * k, my = a[1]! + (b[1]! - a[1]!) * k;
    g!.strokeStyle = ACCENT + "0.95)";
    g!.lineWidth = 1;
    g!.beginPath();
    g!.moveTo(a[0]!, a[1]!);
    g!.lineTo(mx, my);
    g!.stroke();
    // Ticks at both ends, square to the line.
    const dx = b[0]! - a[0]!, dy = b[1]! - a[1]!, l = Math.hypot(dx, dy) || 1;
    const nx = (-dy / l) * 5, ny = (dx / l) * 5;
    for (const p of [a, [mx, my]]) {
      g!.beginPath();
      g!.moveTo(p[0]! - nx, p[1]! - ny);
      g!.lineTo(p[0]! + nx, p[1]! + ny);
      g!.stroke();
    }
    if (k > 0.9) {
      g!.font = `500 ${Math.max(11, Math.min(14, W * 0.011))}px "IBM Plex Mono", ui-monospace, monospace`;
      g!.fillStyle = `rgba(150, 210, 235, ${(k - 0.9) * 10})`;
      g!.textAlign = "center";
      g!.textBaseline = "middle";
      g!.fillText(`${text} mm`, (a[0]! + b[0]!) / 2 + nx * 3.2, (a[1]! + b[1]!) / 2 + ny * 3.2);
    }
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
    const remove = (): void => {
      host!.remove();
      delete root.dataset["intro"];
    };
    if (instant) return remove();
    host!.classList.add("intro--out");
    window.setTimeout(remove, 450);
  }

  for (const ev of ["pointerdown", "keydown", "wheel", "touchstart"] as const) {
    window.addEventListener(ev, onSkip, { capture: true, passive: true });
  }
  skip?.addEventListener("click", onSkip);
}
