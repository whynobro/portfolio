import type { SceneContext, SceneModule } from "../types";
import { vertices } from "./mesh";
import { subscribe, unsubscribe } from "../../lib/raf";

/**
 * The putter head, turning slowly, drawn from the capstone's own STL.
 *
 * Rendered with a painter's-algorithm rasteriser on a 2D canvas rather than
 * WebGL. The model is 8538 triangles at a few hundred pixels: sorting them by
 * depth and filling them is well inside frame budget, and it avoids shipping a
 * shader pipeline, a context-loss path and a fallback for the machines that
 * refuse WebGL. The single-file build stays honest too, since there is nothing
 * to load.
 *
 * Lighting is a single fixed lamp at the upper left, the same direction the
 * gilt frames are lit from, so the piece agrees with the room it hangs in.
 */
export default function createPutterScene(): SceneModule {
  let root: HTMLElement;
  let canvas: HTMLCanvasElement;
  let ctx2d: CanvasRenderingContext2D | null = null;
  let tick: ((dt: number) => void) | null = null;
  let dpr = 1;
  let width = 0;
  let height = 0;

  const verts = vertices();
  const triCount = verts.length / 9;

  // Per-triangle scratch, allocated once: the draw loop must not allocate.
  const depth = new Float32Array(triCount);
  const shade = new Float32Array(triCount);
  const visible = new Uint8Array(triCount);
  const proj = new Float32Array(triCount * 9); // x,y,z per vertex, screen space
  /** Depth buffer and pixel buffer, both reallocated only on resize. */
  let zbuf: Float32Array | null = null;
  let image: ImageData | null = null;

  /**
 * The starting angle presents the scooping face to the viewer. At 0.6 the part
 * showed its plain back edge, which is the one view that says nothing about the
 * design.
 */
let angle = 3.9;
  /** Dragging takes over from the idle turn, and keeps its momentum after. */
  let velocity = 0;
  let dragging = false;
  let lastX = 0;
  let idle = true;

  // A fixed lamp, upper left and slightly in front, normalised.
  const LX = -0.42, LY = -0.66, LZ = 0.62;

  function project(): void {
    const s = Math.min(width, height) * 0.82;
    const cxp = width / 2;
    const cyp = height / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    /*
     * A gentle tilt DOWN onto the part, so the top face and the scooping
     * cavity both read.
     *
     * Negative. With the projection's Y flip in place, a positive tilt raises
     * the camera below the part and shows the floor of the scoop pocket, which
     * is the one surface a putter never presents to anyone.
     */
    const TILT = -0.55;
    const ct = Math.cos(TILT);
    const st = Math.sin(TILT);

    for (let t = 0; t < triCount; t++) {
      const base = t * 9;
      let zsum = 0;
      let zmin = 0;

      // Rotate about Y, then tilt about X, and project orthographically: the
      // part is small relative to the viewing distance, so perspective would be
      // a distortion rather than a cue.
      for (let k = 0; k < 3; k++) {
        const i = base + k * 3;
        const x = verts[i]!;
        const y = verts[i + 1]!;
        const z = verts[i + 2]!;

        const rx = x * cos + z * sin;
        const rz = z * cos - x * sin;
        const ry = y * ct - rz * st;
        const fz = y * st + rz * ct;

        proj[t * 9 + k * 3] = cxp + rx * s;
        // NEGATED: the model is Z-up out of Fusion and the screen's Y runs
        // down, so mapping the rotated height straight to screen Y stood the
        // part on its head. Tilting the other way is not the same fix; that
        // just looks at the underside.
        proj[t * 9 + k * 3 + 1] = cyp - ry * s;
        proj[t * 9 + k * 3 + 2] = fz;
        zsum += fz;
        if (k === 0 || fz < zmin) zmin = fz;
      }
      /*
       * Sort on the NEAREST vertex, biased by the centroid.
       *
       * A pure centroid sort is the textbook painter's algorithm and it fails
       * exactly where this part is interesting: on the scooping cavity's curved
       * wall, neighbouring triangles have almost identical centroid depths, so
       * their order flickers and a fringe of far-side faces shows through the
       * near side. Weighting toward the closest vertex breaks those ties the
       * way the eye expects.
       */
      depth[t] = zmin * 0.7 + (zsum / 3) * 0.3;

      // Face normal from the model vertices, for flat shading.
      const e1x = verts[base + 3]! - verts[base]!;
      const e1y = verts[base + 4]! - verts[base + 1]!;
      const e1z = verts[base + 5]! - verts[base + 2]!;
      const e2x = verts[base + 6]! - verts[base]!;
      const e2y = verts[base + 7]! - verts[base + 1]!;
      const e2z = verts[base + 8]! - verts[base + 2]!;
      let nx = e1y * e2z - e1z * e2y;
      let ny = e1z * e2x - e1x * e2z;
      let nz = e1x * e2y - e1y * e2x;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len; ny /= len; nz /= len;

      const rnx = nx * cos + nz * sin;
      const rnz = nz * cos - nx * sin;
      const rny = ny * ct - rnz * st;

      /*
       * Light BOTH sides of every face.
       *
       * Lighting only the front and clamping the rest to zero left every
       * interior surface pure black, so the part read as a hollow shell rather
       * than as a solid piece of aluminium: the scooping cavity in particular
       * looked like a hole punched through it. The STL's winding is not
       * reliable enough to trust for facing here, so the lamp is applied to the
       * absolute angle and a floor of ambient keeps unlit faces readable.
       */
      const lambert = Math.abs(rnx * LX + rny * LY + rnz * LZ);
      shade[t] = 0.18 + lambert * 0.82;

      /*
       * Back-face culling, from the screen-space winding of the projected
       * triangle.
       *
       * Without it the painter's algorithm still PAINTS the far side of the
       * part: on a curved wall like the scooping cavity, back faces at almost
       * exactly the same depth as the front ones win the sort at random and
       * show through as a ragged fringe along the curve. Culling them first is
       * both the correct fix and roughly half the triangles.
       */
      const o = t * 9;
      const wind =
        (proj[o + 3]! - proj[o]!) * (proj[o + 7]! - proj[o + 1]!) -
        (proj[o + 4]! - proj[o + 1]!) * (proj[o + 6]! - proj[o]!);
      // Flipping the projected Y above reverses screen-space winding, so the
      // sign of this test follows it.
      visible[t] = wind > 0 ? 1 : 0;
    }

  }

  /**
   * Scanline rasteriser with a per-pixel depth buffer.
   *
   * The painter's algorithm was drawing the far wall of the scooping cavity
   * over the near one: on a curved surface, neighbouring triangles differ in
   * centroid depth by less than the error in comparing them, so no sort order
   * is stable and a ragged fringe follows the curve. Sorting cannot fix that,
   * because the triangles genuinely interleave in depth. Testing depth per
   * PIXEL is the thing that actually resolves it, and at this triangle count it
   * still runs comfortably inside a frame.
   */
  function draw(): void {
    if (!ctx2d || !image || !zbuf) return;
    const w = Math.round(width * dpr);
    const h = Math.round(height * dpr);
    const px = image.data;

    px.fill(0);
    zbuf.fill(Infinity);

    for (let t = 0; t < triCount; t++) {
      if (!visible[t]) continue;
      const o = t * 9;

      const x0 = proj[o]! * dpr, y0 = proj[o + 1]! * dpr, z0 = proj[o + 2]!;
      const x1 = proj[o + 3]! * dpr, y1 = proj[o + 4]! * dpr, z1 = proj[o + 5]!;
      const x2 = proj[o + 6]! * dpr, y2 = proj[o + 7]! * dpr, z2 = proj[o + 8]!;

      let minX = Math.max(0, Math.floor(Math.min(x0, x1, x2)));
      let maxX = Math.min(w - 1, Math.ceil(Math.max(x0, x1, x2)));
      let minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
      let maxY = Math.min(h - 1, Math.ceil(Math.max(y0, y1, y2)));
      if (minX > maxX || minY > maxY) continue;

      const areaFull = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
      if (areaFull === 0) continue;
      const inv = 1 / areaFull;

      const lum = shade[t]!;
      const base = 58 + lum * 176;
      const cr = Math.min(255, Math.round(base * 0.99));
      const cg = Math.min(255, Math.round(base));
      const cb = Math.min(255, Math.round(base * 1.04));

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          // Barycentric coordinates at the pixel centre.
          const cxp2 = x + 0.5, cyp2 = y + 0.5;
          const w0 = ((x1 - cxp2) * (y2 - cyp2) - (y1 - cyp2) * (x2 - cxp2)) * inv;
          const w1 = ((x2 - cxp2) * (y0 - cyp2) - (y2 - cyp2) * (x0 - cxp2)) * inv;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;

          const z = w0 * z0 + w1 * z1 + w2 * z2;
          const idx = y * w + x;
          if (z >= zbuf[idx]!) continue;
          zbuf[idx] = z;

          const p4 = idx * 4;
          px[p4] = cr;
          px[p4 + 1] = cg;
          px[p4 + 2] = cb;
          px[p4 + 3] = 255;
        }
      }
    }

    ctx2d.putImageData(image, 0, 0);
  }

  function render(): void {
    project();
    draw();
  }

  function size(w: number, h: number): void {
    if (!w || !h) return;
    width = w;
    height = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx2d = canvas.getContext("2d");
    // No CTM: the rasteriser works in device pixels and writes the backing
    // store directly, and putImageData ignores the transform in any case.
    const bw = canvas.width;
    const bh = canvas.height;
    zbuf = new Float32Array(bw * bh);
    image = ctx2d ? ctx2d.createImageData(bw, bh) : null;
    render();
  }

  return {
    mount(c: SceneContext) {
      root = c.root;
      dpr = c.dpr;

      canvas = document.createElement("canvas");
      canvas.className = "putter__canvas";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", c.t("putter.aria"));
      root.append(canvas);

      const box = root.getBoundingClientRect();
      size(box.width, box.height || box.width * 0.75);

      // Dragging spins the part. Pointer events cover mouse, pen and touch in
      // one path; `touch-action: none` in the stylesheet stops the browser
      // claiming the gesture for a scroll.
      const down = (e: PointerEvent) => {
        dragging = true;
        idle = false;
        lastX = e.clientX;
        canvas.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        // NEGATIVE: dragging right should carry the face nearest the viewer to
        // the right, the way turning a real object in the hand does. Adding the
        // delta spun it against the drag.
        velocity = -dx * 0.01;
        angle += velocity;
        render();
      };
      const up = (e: PointerEvent) => {
        dragging = false;
        canvas.releasePointerCapture?.(e.pointerId);
      };
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);

      // Keyboard: the piece has to be inspectable without a pointer.
      canvas.tabIndex = 0;
      canvas.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { angle += 0.12; idle = false; render(); }
        if (e.key === "ArrowRight") { angle -= 0.12; idle = false; render(); }
      });

      if (c.reducedMotion) {
        render();
        return;
      }

      tick = () => {
        if (dragging) return;
        if (idle) {
          angle += 0.0035;
        } else if (Math.abs(velocity) > 0.0002) {
          // Momentum from the throw, then a slow return to the idle turn.
          angle += velocity;
          velocity *= 0.95;
        } else {
          idle = true;
        }
        render();
      };
      subscribe(tick);
    },

    resize(w: number, h: number) {
      size(w, h);
    },

    renderStatic() {
      render();
    },

    dispose() {
      if (tick) unsubscribe(tick);
      tick = null;
      canvas.remove();
    },
  };
}
