/**
 * Prepares raster assets for the single-file build.
 *
 *   node scripts/prep-images.mjs <source-image>
 *
 * Everything ends up base64-inlined in one HTML file, which costs ~33% over the
 * binary size, so source images cannot be shipped as-is: the headshot alone is
 * 1.65 MB, or ~2.2 MB inlined, against a 900 KB budget for the whole page.
 *
 * The portrait is rendered at 2x its 240px display width (480px) so it stays
 * sharp on retina, converted to AVIF, and desaturated at build time rather than
 * with a CSS filter — baking it in means the browser does no per-frame work and
 * the file compresses better.
 */
import sharp from "sharp";
import { stat } from "node:fs/promises";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/prep-images.mjs <source-image>");
  process.exit(1);
}

const OUT_DIR = "public/img";
const DISPLAY_WIDTH = 240;
const OUT_WIDTH = DISPLAY_WIDTH * 2;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

const before = (await stat(src)).size;

// 4:5 portrait crop, anchored high so the crop favours the face over the
// jacket when the source is squarer than the target box.
const base = sharp(src)
  .resize(OUT_WIDTH, Math.round(OUT_WIDTH * 1.25), {
    fit: "cover",
    position: sharp.strategy.attention,
  })
  .grayscale()
  .linear(1.06, -6); // slight contrast lift, matches the old CSS filter

const avif = path.join(OUT_DIR, "headshot.avif");
const jpg = path.join(OUT_DIR, "headshot.jpg");

await base.clone().avif({ quality: 62, effort: 6 }).toFile(avif);
// JPEG fallback: AVIF is universally supported in current browsers, but a
// recruiter on a locked-down corporate machine may be on an old build.
await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(jpg);

const aAvif = (await stat(avif)).size;
const aJpg = (await stat(jpg)).size;

console.log(`source        ${kb(before)}`);
console.log(`headshot.avif ${kb(aAvif)}  (inlined ≈ ${kb(aAvif * 1.34)})`);
console.log(`headshot.jpg  ${kb(aJpg)}  (fallback)`);
