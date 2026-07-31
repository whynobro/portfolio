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
 * fit "cover" + position bias the crop toward the subject; `position` pins that
 * crop explicitly (e.g. "centre") where the heuristic gets it wrong.
 */
const MANIFEST = [
  // The source is LANDSCAPE (1370x1148) and the frame's window is 4:5, so a
  // third of the width is cropped away. `attention` picked that third by
  // entropy and slid it right, which left Michael off-centre with a shoulder
  // cut at the edge and bare wall on the other side. The photograph is already
  // composed centrally, so the crop is pinned to the centre instead.
  {
    name: "headshot",
    src: "assets-src/headshot-original.png",
    width: 900,
    height: 1125,
    position: "centre",
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

  // --- Campus Native ---
  // The live marketplace at campusnative.com, captured by scripts/shoot-campus.mjs
  // and shot at 3:2 so it needs no crop. The logo hung here before, which showed
  // the brand rather than the software the label claims is in production.
  {
    name: "campus-logo",
    src: "assets-src/campus-native/site-home.png",
    width: 1500,
    height: 1000,
    quality: 74,
  },

  // --- SMC execution system ---
  // The operator dashboard, captured by scripts/shoot-jarvis.mjs, which composes
  // the frame to exclude account state. Monospace tabular data on a near-black
  // ground, so quality runs higher than the photographs: AVIF at 70 puts visible
  // mosquito noise around the type, and `contain` keeps the table's right-hand
  // FILL column from being cropped off by an attention crop.
  // The capture is ~2:1 but every frame on the wall is 3:2 and the works
  // subgrid onto shared hanging and caption lines, so a one-off aspect ratio
  // would break the row. `contain` onto a 3:2 canvas letterboxes it on the
  // dashboard's own near-black ground instead — `cover` would crop a quarter off
  // the sides, taking the TIME and FILL columns with it.
  {
    name: "bot-display",
    src: "assets-src/smc-bot/jarvis-operator.png",
    width: 1800,
    height: 1200,
    fit: "contain",
    // Sampled from the capture's own corner, not guessed, so the letterbox is
    // invisible against the dashboard's ground.
    background: "#05080d",
    quality: 82,
  },
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

  // `cover` crops to fill, which is right for photographs. A logo has to be
  // shown whole, so an entry can ask for `contain` and supply the colour to pad
  // with — cropping a mark to a 3:2 window cuts the mark itself.
  const resize = { width: item.width, fit: item.fit ?? "cover" };
  // `attention` finds the subject in a photograph that is off-centre, which is
  // right for the product shots. An entry that is already composed can pin the
  // crop instead — the heuristic has no idea where a face is and will happily
  // trade a shoulder for a patch of textured wall.
  if (resize.fit === "cover") resize.position = item.position ?? sharp.strategy.attention;
  if (item.background) resize.background = item.background;
  if (item.height) resize.height = item.height;

  let pipe = sharp(item.src).resize(resize);
  // A transparent source has to be flattened onto the same colour it is padded
  // with. `resize({background})` only fills the padding, so the mark's own
  // transparent interior came through as black once JPEG dropped the alpha.
  if (item.background) pipe = pipe.flatten({ background: item.background });
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
