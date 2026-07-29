/**
 * Turns the ornate gold frame reference into a border-image-ready PNG.
 *
 *   node scripts/prep-frame.mjs
 *
 * Two problems with the source that this script exists to solve:
 *
 *  1. It is a JPEG of what was originally a transparent PNG, so the "empty"
 *     centre is a baked grey checkerboard. That has to become real alpha or the
 *     artwork cannot show through.
 *  2. The moulding is not centred in the canvas — it sits inset and slightly
 *     off to one side — so a symmetric crop cuts the right and bottom edges
 *     off entirely. Bounds are detected rather than assumed.
 *
 * Gold is strongly saturated toward red/yellow; the checkerboard is neutral
 * grey. Saturation is therefore a reliable way to tell moulding from
 * background.
 */
import sharp from "sharp";
import { stat } from "node:fs/promises";

const SRC = "73ce0659b90f22a12773e4f5a773b5e1.jpg";
const OUT = "src/assets/img/frame-gold.png";
// 3x is enough: only the moulding band is ever drawn (the centre is cut out),
// and 4x pushed the PNG to 879 KB for no visible gain at render size.
const SCALE = 3;

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const isGold = (x, y) => {
  const i = (y * W + x) * C;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max > 60 && (max - min) / max > 0.25 && r >= b;
};

// --- outer bounds of the moulding ---------------------------------------
const colCount = (x) => {
  let n = 0;
  for (let y = 0; y < H; y++) if (isGold(x, y)) n++;
  return n;
};
const rowCount = (y) => {
  let n = 0;
  for (let x = 0; x < W; x++) if (isGold(x, y)) n++;
  return n;
};

const cols = [...Array(W).keys()].map(colCount);
const rows = [...Array(H).keys()].map(rowCount);
const x0 = cols.findIndex((n) => n > H * 0.25);
const x1 = W - 1 - [...cols].reverse().findIndex((n) => n > H * 0.25);
const y0 = rows.findIndex((n) => n > W * 0.25);
const y1 = H - 1 - [...rows].reverse().findIndex((n) => n > W * 0.25);

const fw = x1 - x0 + 1;
const fh = y1 - y0 + 1;

// --- moulding thickness -------------------------------------------------
// Walk inward and find where the gold stops being dense. Sampling a band of
// rows/columns rather than a single line, because the ornament has gaps that
// would fool a single-pixel probe.
function thickness(scan) {
  for (let d = 0; d < Math.min(fw, fh) / 2; d++) {
    let hits = 0;
    let tries = 0;
    for (let s = 0.25; s <= 0.75; s += 0.05) {
      tries++;
      if (scan(d, s)) hits++;
    }
    if (hits / tries < 0.35) return d;
  }
  return Math.round(Math.min(fw, fh) * 0.1);
}

const tL = thickness((d, s) => isGold(x0 + d, Math.round(y0 + fh * s)));
const tR = thickness((d, s) => isGold(x1 - d, Math.round(y0 + fh * s)));
const tT = thickness((d, s) => isGold(Math.round(x0 + fw * s), y0 + d));
const tB = thickness((d, s) => isGold(Math.round(x0 + fw * s), y1 - d));

// One inset for all four sides keeps the CSS simple and the corners square;
// use the largest so no ornament is clipped.
const t = Math.max(tL, tR, tT, tB, 6);

console.log(`source ${W}x${H}`);
console.log(`frame  ${fw}x${fh} at (${x0},${y0})`);
console.log(`moulding thickness  L${tL} R${tR} T${tT} B${tB}  -> using ${t}`);

// --- build --------------------------------------------------------------
const outW = fw * SCALE;
const outH = fh * SCALE;
const inset = t * SCALE;

const cropped = await sharp(SRC)
  .extract({ left: x0, top: y0, width: fw, height: fh })
  .resize(outW, outH, { kernel: sharp.kernel.lanczos3 })
  .ensureAlpha()
  .raw()
  .toBuffer();

// Two cleanups in one pass over the pixels:
//  - knock the checkerboard centre out to real transparency
//  - drop the neutral-grey checkerboard residue that survives around the
//    outer edge, which otherwise shows as pale speckle against the wall
const px = Buffer.from(cropped);
for (let y = 0; y < outH; y++) {
  for (let x = 0; x < outW; x++) {
    const i = (y * outW + x) * 4;
    const inCentre =
      x >= inset && x < outW - inset && y >= inset && y < outH - inset;
    if (inCentre) {
      px[i + 3] = 0;
      continue;
    }
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    // Near-neutral and bright: checkerboard, not gilding.
    if (sat < 0.16 && max > 150) px[i + 3] = 0;
  }
}

await sharp(px, { raw: { width: outW, height: outH, channels: 4 } })
  // Palette-quantised: the moulding is a narrow range of golds, so 128 colours
  // is visually lossless here and cuts the file by roughly 5x. Alpha edges are
  // what make a full-colour PNG expensive.
  .png({ compressionLevel: 9, palette: true, colours: 128, dither: 0.5 })
  .toFile(OUT);

const size = (await stat(OUT)).size;
console.log(`\n${OUT}  ${outW}x${outH}  ${(size / 1024).toFixed(1)} KB`);
console.log(`CSS: border-image-slice: ${inset} fill; border-image-width: ${t}px;`);
