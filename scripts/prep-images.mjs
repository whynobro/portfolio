/**
 * Prepares raster assets for the single-file build.
 *
 *   node scripts/prep-images.mjs            # process the whole manifest
 *   node scripts/prep-images.mjs headshot   # one entry by name
 *
 * Everything is base64-inlined into one HTML file, which costs ~33% over the
 * binary size, so source images cannot ship as-is: several of the product
 * photographs are over 3 MB against a 900 KB budget for the entire page.
 *
 * Each entry renders at roughly 2x its display width so it stays sharp on a
 * retina screen, then AVIF (with a JPEG fallback for the few corporate browsers
 * that still lack AVIF).
 */
import sharp from "sharp";
import { stat, mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = "src/assets/img";
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

/**
 * width: the rendered pixel width (already 2x the intended display size).
 * fit "cover" + position bias the crop toward the subject.
 */
const MANIFEST = [
  {
    name: "headshot",
    src: "assets-src/headshot-original.png",
    width: 900,
    height: 1125,
    grayscale: true,
    quality: 76,
  },

  // --- CNC putter: the strongest sequence, CAD -> cut -> part -> course ---
  // Hero: the finished aluminium head on the green.
  { name: "putter-hero", src: "assets-src/putter/converted/IMG_9594.jpg", width: 1500, height: 1125, quality: 72 },
  { name: "putter-green", src: "assets-src/putter/converted/IMG_9596.jpg", width: 1200, height: 1500, quality: 70 },
  // In the vise, mid-cut, chips on the fixture.
  { name: "putter-machining", src: "assets-src/putter/converted/IMG_9580.jpg", width: 1400, quality: 70 },
  // The scooping geometry, held.
  { name: "putter-inhand", src: "assets-src/putter/converted/IMG_9582.jpg", width: 1400, quality: 70 },
  // Fusion 360 tool setup — evidence of the CAM work behind the part.
  { name: "putter-cam", src: "assets-src/putter/converted/IMG_9035.jpg", width: 1400, quality: 68 },
  // In use at Westlake Golf Course.
  { name: "putter-inuse", src: "assets-src/putter/converted/IMG_4440.jpg", width: 1400, quality: 70 },
  { name: "cnc-drawing", src: "assets-src/putter/capstone-drawing.jpeg", width: 1600, quality: 78 },

  // --- Chameleon Ramps: real product photography ---
  { name: "ramps-bank", src: "assets-src/ramps/p4.jpg", width: 1600, height: 1600, quality: 72 },
  { name: "ramps-quarter", src: "assets-src/ramps/p9.jpg", width: 1600, height: 1600, quality: 72 },
  { name: "ramps-alt1", src: "assets-src/ramps/p5.jpg", width: 1100, height: 1100, quality: 68 },
  { name: "ramps-alt2", src: "assets-src/ramps/p8.jpg", width: 1100, height: 1100, quality: 68 },

  // --- Wave energy converter ---
  { name: "wave-inside", src: "assets-src/wave/wave-inside.jpg", width: 1200, quality: 72 },
  { name: "wave-base", src: "assets-src/wave/wave-base.jpg", width: 1000, quality: 72 },

  // --- Nicaragua water distribution ---
  { name: "water-site", src: "assets-src/nicaragua/system-on-site.png", width: 1400, quality: 70 },

  // --- SMC execution system ---
  { name: "bot-display", src: "assets-src/smc-bot/jarvis-display.jpg", width: 1200, quality: 70 },
];

const only = process.argv[2];
await mkdir(OUT, { recursive: true });

let total = 0;
for (const item of MANIFEST) {
  if (only && item.name !== only) continue;

  let srcBytes;
  try {
    srcBytes = (await stat(item.src)).size;
  } catch {
    console.log(`skip ${item.name} — missing ${item.src}`);
    continue;
  }

  const resize = { width: item.width, fit: "cover", position: sharp.strategy.attention };
  if (item.height) resize.height = item.height;

  let pipe = sharp(item.src).resize(resize);
  if (item.grayscale) pipe = pipe.grayscale().linear(1.06, -6);

  const avifPath = path.join(OUT, `${item.name}.avif`);
  const jpgPath = path.join(OUT, `${item.name}.jpg`);

  await pipe.clone().avif({ quality: item.quality ?? 58, effort: 6 }).toFile(avifPath);
  await pipe.clone().jpeg({ quality: 76, mozjpeg: true }).toFile(jpgPath);

  const a = (await stat(avifPath)).size;
  total += a;
  console.log(
    `${item.name.padEnd(14)} ${kb(srcBytes).padStart(10)} -> ${kb(a).padStart(9)} avif` +
      `  (inlined ~${kb(a * 1.34)})`,
  );
}

console.log(`\nAVIF total: ${kb(total)}  (inlined ~${kb(total * 1.34)} inlined)`);
