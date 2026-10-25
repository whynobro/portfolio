/**
 * A z-buffered software rasteriser for a triangle mesh, on a 2D canvas.
 *
 * Shared by the turning putter (src/scenes/putter) and the opening intro
 * (src/intro.ts). Not WebGL: at a few thousand triangles and a few hundred
 * pixels this runs well inside a frame, and there is no shader pipeline,
 * context-loss path or fallback to ship. A painter's sort cannot draw the
 * putter's scoop cavity (its triangles interleave in depth), so depth is
 * tested per PIXEL.
 *
 * Several meshes can be drawn into one frame (the intro draws the stock block
 * around the part) by sharing a `Frame` and calling `draw` for each; the
 * z-buffer resolves which one is in front.
 */

/** Orthographic view: rotate about Y, tilt about X, then scale and centre. */
export type View = { angle: number; tilt: number; scale: number; cx: number; cy: number };

/** One fixed lamp, upper left and slightly in front, normalised. */
const LX = -0.42, LY = -0.66, LZ = 0.62;

export type Frame = { image: ImageData; zbuf: Float32Array; w: number; h: number };

export function createFrame(ctx: CanvasRenderingContext2D, w: number, h: number): Frame {
  return { image: ctx.createImageData(w, h), zbuf: new Float32Array(w * h), w, h };
}

export function clearFrame(f: Frame): void {
  f.image.data.fill(0);
  f.zbuf.fill(Infinity);
}

/** Project one model-space point to device pixels with the same transform. */
export function projectPoint(v: View, x: number, y: number, z: number, dpr: number): [number, number, number] {
  const cos = Math.cos(v.angle), sin = Math.sin(v.angle);
  const ct = Math.cos(v.tilt), st = Math.sin(v.tilt);
  const rx = x * cos + z * sin;
  const rz = z * cos - x * sin;
  const ry = y * ct - rz * st;
  const fz = y * st + rz * ct;
  // NEGATED Y: the screen's Y runs down.
  return [(v.cx + rx * v.scale) * dpr, (v.cy - ry * v.scale) * dpr, fz];
}

export type MeshRaster = {
  /** Replace the vertices (same triangle count or not); used for the stock block. */
  setVertices(verts: Float32Array): void;
  /** Project and shade every triangle for this view. */
  setView(v: View, dpr: number): void;
  /** Rasterise into the frame. `tone` scales the base colour (1 = aluminium). */
  draw(f: Frame, tone?: [number, number, number]): void;
};

export function createMeshRaster(initial: Float32Array): MeshRaster {
  let verts = initial;
  let triCount = verts.length / 9;
  let shade = new Float32Array(triCount);
  let spec = new Float32Array(triCount);
  let visible = new Uint8Array(triCount);
  let proj = new Float32Array(triCount * 9);

  function alloc(): void {
    triCount = verts.length / 9;
    shade = new Float32Array(triCount);
    spec = new Float32Array(triCount);
    visible = new Uint8Array(triCount);
    proj = new Float32Array(triCount * 9);
  }

  return {
    setVertices(next) {
      verts = next;
      if (next.length / 9 !== triCount) alloc();
    },

    setView(v, dpr) {
      const cos = Math.cos(v.angle), sin = Math.sin(v.angle);
      const ct = Math.cos(v.tilt), st = Math.sin(v.tilt);
      for (let t = 0; t < triCount; t++) {
        const base = t * 9;
        for (let k = 0; k < 3; k++) {
          const i = base + k * 3;
          const x = verts[i]!, y = verts[i + 1]!, z = verts[i + 2]!;
          const rx = x * cos + z * sin;
          const rz = z * cos - x * sin;
          proj[i] = (v.cx + rx * v.scale) * dpr;
          proj[i + 1] = (v.cy - (y * ct - rz * st) * v.scale) * dpr;
          proj[i + 2] = y * st + rz * ct;
        }

        // Face normal for flat shading.
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
         * Light BOTH sides of every face: the STL's winding is not reliable
         * enough to trust for facing, and lighting only the front left the
         * scoop cavity pure black, reading as a hole through the part.
         */
        shade[t] = 0.18 + Math.abs(rnx * LX + rny * LY + rnz * LZ) * 0.82;
        // Blinn-Phong highlight against a viewer down Z: a machined face reads
        // as METAL only once it catches a hot, tight highlight.
        const hz = LZ + 1;
        const hl = Math.hypot(LX, LY, hz);
        spec[t] = (Math.abs(rnx * LX + rny * LY + rnz * hz) / hl) ** 48;

        // Back-face culling from the screen-space winding; the Y flip above
        // reverses it, so front faces come out positive.
        const wind =
          (proj[base + 3]! - proj[base]!) * (proj[base + 7]! - proj[base + 1]!) -
          (proj[base + 4]! - proj[base + 1]!) * (proj[base + 6]! - proj[base]!);
        visible[t] = wind > 0 ? 1 : 0;
      }
    },

    draw(f, tone = [0.98, 1, 1.05]) {
      const { w, h, zbuf } = f;
      const px = f.image.data;
      for (let t = 0; t < triCount; t++) {
        if (!visible[t]) continue;
        const o = t * 9;
        const x0 = proj[o]!, y0 = proj[o + 1]!, z0 = proj[o + 2]!;
        const x1 = proj[o + 3]!, y1 = proj[o + 4]!, z1 = proj[o + 5]!;
        const x2 = proj[o + 6]!, y2 = proj[o + 7]!, z2 = proj[o + 8]!;

        const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2)));
        const maxX = Math.min(w - 1, Math.ceil(Math.max(x0, x1, x2)));
        const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
        const maxY = Math.min(h - 1, Math.ceil(Math.max(y0, y1, y2)));
        if (minX > maxX || minY > maxY) continue;

        const area = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
        if (area === 0) continue;
        const inv = 1 / area;

        const hi = spec[t]! * 120;
        const base = 52 + shade[t]! * 168;
        const cr = Math.min(255, Math.round(base * tone[0] + hi));
        const cg = Math.min(255, Math.round(base * tone[1] + hi));
        const cb = Math.min(255, Math.round(base * tone[2] + hi));

        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            const sx = x + 0.5, sy = y + 0.5;
            const w0 = ((x1 - sx) * (y2 - sy) - (y1 - sy) * (x2 - sx)) * inv;
            const w1 = ((x2 - sx) * (y0 - sy) - (y2 - sy) * (x0 - sx)) * inv;
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
    },
  };
}
