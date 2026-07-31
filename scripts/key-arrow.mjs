/**
 * Keys the red arrow out of its painted checkerboard.
 *
 *   node scripts/key-arrow.mjs
 *
 * The source Michael found (`assets-src/curved red arrow.png`) advertises
 * transparency it does not have: the checkerboard is PAINTED INTO THE PIXELS.
 * Sampling it reports `alphaMin` 236 — nothing in the file is actually clear —
 * and the three most common colours are two greys (254 and 237, the check) and
 * the arrow's red. Used as-is it ships a grey tiled box beside the toy, which
 * is exactly the failure the "zoom in and see if the squares scale" test in
 * CLAUDE.md exists to catch.
 *
 * The art is flat red on uniform grey, so it keys cleanly on redness rather
 * than on a colour distance to one sampled background: a pixel belongs to the
 * arrow when red beats both other channels by a wide margin. Everything else
 * becomes fully transparent, and the result is cropped to the arrow's own
 * bounding box so the asset carries no dead margin.
 *
 * `prep-images.mjs` reads the output of this script, not the original.
 */
import sharp from "sharp";

const SRC = "assets-src/curved red arrow.png";
const OUT = "assets-src/misc/arrow-red.png";

/** How far red must beat the other channels for a pixel to be the arrow. */
const REDNESS = 60;

/** The arrow is renormalised to one flat red rather than the source's JPEG-ish spread. */
const INK = [230, 30, 35];

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const out = Buffer.alloc(w * h * 4, 0);

let minX = w;
let minY = h;
let maxX = 0;
let maxY = 0;
let kept = 0;

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r - Math.max(g, b) <= REDNESS) continue;

    out[i] = INK[0];
    out[i + 1] = INK[1];
    out[i + 2] = INK[2];
    out[i + 3] = 255;
    kept++;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}

if (!kept) throw new Error(`no arrow pixels found in ${SRC} — has the source changed?`);

await sharp(out, { raw: { width: w, height: h, channels: 4 } })
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const alpha = await sharp(OUT).extractChannel(3).stats();
console.log(
  `${OUT}  ${maxX - minX + 1}x${maxY - minY + 1}  ` +
    `kept ${kept} px  alpha ${alpha.channels[0].min}..${alpha.channels[0].max}`,
);
