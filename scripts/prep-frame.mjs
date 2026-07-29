/**
 * Prepares the ornate gold frame for use as a CSS border-image.
 *
 *   node scripts/prep-frame.mjs
 *
 * The source is a true cutout PNG: real alpha, fully transparent centre. That
 * means no white halo is possible — the earlier JPEG source had a band of solid
 * white baked between the gilding and the background, which no processing could
 * remove.
 *
 * border-image slices the source into nine pieces: four corners drawn at fixed
 * size, four edges repeated between them, and a discarded centre. The slice
 * inset must land just inside the moulding, so it is MEASURED from the alpha
 * channel rather than guessed — too small stretches the carved corners, too
 * large clips the ornament.
 */
import sharp from "sharp";
import { stat } from "node:fs/promises";

const SRC = "assets-src/brand/frame-gold-source.png";
const OUT = "src/assets/img/frame-gold.png";

// The frame renders up to ~700px wide on a desktop wall; only the moulding band
// is ever drawn. 1400px on the long edge is plenty and keeps the file small.
const TARGET_LONG_EDGE = 1100;

const meta = await sharp(SRC).metadata();
if (!meta.hasAlpha) throw new Error("source has no alpha channel");

// The moulding does not run to the edge of the canvas — there is transparent
// margin around it. Trim that first, or the measured thickness comes out as
// zero and the slice lands in empty space.
const trimmed = await sharp(SRC).ensureAlpha().trim({ threshold: 1 }).toBuffer();
const tMeta = await sharp(trimmed).metadata();
console.log(`trimmed transparent margin: ${meta.width}x${meta.height} -> ${tMeta.width}x${tMeta.height}`);

const scale = TARGET_LONG_EDGE / Math.max(tMeta.width, tMeta.height);
const W = Math.round(tMeta.width * scale);
const H = Math.round(tMeta.height * scale);

const resized = await sharp(trimmed)
  .resize(W, H, { kernel: sharp.kernel.lanczos3 })
  .ensureAlpha()
  .toBuffer();

// --- measure the moulding from the alpha channel -------------------------
const { data, info } = await sharp(resized).raw().toBuffer({ resolveWithObject: true });
const alphaAt = (x, y) => data[(y * info.width + x) * info.channels + 3];

// Walk inward along the centre lines until the frame stops being opaque; that
// is where the transparent window begins.
const midY = Math.round(H / 2);
const midX = Math.round(W / 2);
const OPAQUE = 128;

/**
 * Walk inward and measure the opaque moulding band.
 *
 * A few transparent pixels can survive the trim at the very edge (antialiasing
 * on the outer contour), so skip any leading transparent run before measuring —
 * otherwise the loop exits immediately and reports a thickness of zero.
 */
function bandThickness(sample, limit) {
  let i = 0;
  while (i < limit && sample(i) <= OPAQUE) i++; // skip leading margin
  let n = 0;
  while (i + n < limit && sample(i + n) > OPAQUE) n++; // measure the band
  return i + n;
}

const left = bandThickness((i) => alphaAt(i, midY), Math.floor(W / 2));
const right = bandThickness((i) => alphaAt(W - 1 - i, midY), Math.floor(W / 2));
const top = bandThickness((i) => alphaAt(midX, i), Math.floor(H / 2));
const bottom = bandThickness((i) => alphaAt(midX, H - 1 - i), Math.floor(H / 2));

console.log(`resized to ${W}x${H}`);
console.log(`moulding thickness  L${left} R${right} T${top} B${bottom}`);

// A single inset keeps the CSS simple. Use the largest so no carving is cut,
// plus a small margin for the corner ornaments, which reach further in than the
// straight runs do.
const inset = Math.round(Math.max(left, right, top, bottom) * 1.12);

await sharp(resized).png({ compressionLevel: 9, palette: true, colours: 128, dither: 0.4 }).toFile(OUT);

const size = (await stat(OUT)).size;
console.log(`\n${OUT}  ${W}x${H}  ${(size / 1024).toFixed(1)} KB`);
console.log(`CSS:`);
console.log(`  border-image-slice: ${inset};`);
console.log(`  border-width: ${(inset * (700 / W)).toFixed(1)}px  (at a 700px-wide frame)`);
