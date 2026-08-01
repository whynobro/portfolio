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
  //
  // Every one of these is a 3:4 PORTRAIT photograph off a phone. They used to
  // be forced into a landscape window, which threw away half of each frame, so
  // no height is given here: omitting it keeps the source's own shape, and the
  // room hangs each one in a portrait frame to match.
  { name: "putter-hero", src: "assets-src/putter/converted/IMG_9594.jpg", width: 1400, quality: 72 },
  { name: "putter-green", src: "assets-src/putter/converted/IMG_9596.jpg", width: 1200, quality: 70 },
  // In the vise, mid-cut, chips on the fixture.
  { name: "putter-machining", src: "assets-src/putter/converted/IMG_9580.jpg", width: 1200, quality: 64 },
  // The part tilted on a 3D-printed shim to cut the 3-degree loft angle. The
  // photograph that was here (IMG_9582, the head held in one hand) was captioned
  // as the scooping face, which it was not: this one shows an actual fixturing
  // decision, which is the more interesting picture anyway.
  { name: "putter-loft", src: "assets-src/putter/converted/IMG_9591.jpg", width: 1400, quality: 70 },
  // The CAM simulation itself, exported from Fusion rather than photographed
  // off a monitor: the toolpaths, the stock and the cutter in one frame. The
  // photograph this replaced carried screen moiré and showed a tool dialogue
  // rather than the strategy.
  {
    name: "putter-cam",
    src: "assets-src/putter/cad-drawing-v2.png",
    width: 1400,
    height: 1218,
    fit: "contain",
    background: "#ffffff",
    quality: 76,
  },
  // The finished model, shaded, before any of it existed in metal.
  {
    name: "putter-cad",
    src: "assets-src/putter/cad-model.png",
    width: 1200,
    height: 874,
    fit: "contain",
    background: "#ffffff",
    quality: 76,
  },
  // In use at Westlake Golf Course.
  { name: "putter-inuse", src: "assets-src/putter/converted/IMG_4440.jpg", width: 1200, quality: 62 },
  // The capstone poster, exported from the PPTX at 4x slide size via
  // PowerPoint. Like the wave one it hangs full width at the foot of the room
  // and has to stay READABLE, so it keeps far more resolution and a much higher
  // quality than a photograph: dense text on white is where AVIF's usual
  // settings smear the letterforms.
  {
    name: "putter-poster",
    src: "assets-src/putter/capstone-poster.png",
    width: 2600,
    quality: 88,
  },
  // A drawing, so `contain`: cropping the title block off a drawing is worse
  // than a little padding. LOW RESOLUTION at source (660x432), wants re-export.
  {
    name: "cnc-drawing",
    src: "assets-src/putter/capstone-drawing.jpeg",
    width: 1600,
    height: 1067,
    fit: "contain",
    background: "#ffffff",
    quality: 80,
  },

  // --- Chameleon Ramps: real product photography, all SQUARE at source ---
  { name: "ramps-bank", src: "assets-src/ramps/p4.jpg", width: 1400, height: 1400, quality: 72 },
  { name: "ramps-quarter", src: "assets-src/ramps/p9.jpg", width: 1400, height: 1400, quality: 72 },
  { name: "ramps-alt1", src: "assets-src/ramps/p5.jpg", width: 1200, height: 1200, quality: 70 },
  { name: "ramps-alt2", src: "assets-src/ramps/p8.jpg", width: 1200, height: 1200, quality: 70 },

  // The whole range in one frame, which no single product shot can show: forty
  // designs is the claim on the label, and this is the evidence for it.
  // Quality runs LOW for a photograph: the frame is half gravel and half
  // foliage, both fine high-frequency texture that AVIF spends enormously on
  // (405 KB at 72, against ~110 KB for the other plates). None of that detail
  // is the subject, and at 56 the ramps themselves are indistinguishable.
  { name: "ramps-range", src: "assets-src/ramps/full-range.jpg", width: 1400, height: 1050, quality: 56 },
  // The brand's namesake on one of the ramps, with a fingerboard for scale.
  // Square at source (750x797), so it keeps the gallery's square window.
  { name: "ramps-chameleon", src: "assets-src/ramps/chameleon-on-ramp.jpg", width: 1100, height: 1100, quality: 74 },

  // --- Profile room: three photographs in a row, all cropped to 3:2 ---
  //
  // Sizes are identical on purpose. The row is one grid with three equal
  // tracks, so any difference in aspect ratio would show as a ragged bottom
  // edge; cropping them all to 3:2 here is what makes the row read as a set.
  { name: "about-1", src: "assets-src/about/alaska.jpg", width: 1200, height: 800, quality: 72 },
  { name: "about-2", src: "assets-src/about/beach.jpg", width: 1200, height: 800, quality: 72 },
  { name: "about-3", src: "assets-src/about/surf.jpg", width: 1200, height: 800, quality: 72 },

  // --- Wave energy converter: both 3:4 portrait, both LOW RESOLUTION ---
  // 600x800 and 360x480 at source. Held at their own size rather than upscaled,
  // since enlarging them only makes the softness bigger. Both want re-shooting.
  { name: "wave-inside", src: "assets-src/wave/wave-inside.jpg", width: 600, quality: 78 },
  { name: "wave-base", src: "assets-src/wave/wave-base.jpg", width: 360, quality: 80 },
  // The cutaway of the mechanism: the rack running down between the two pinion
  // stages, which is the whole idea and the one thing no photograph shows.
  {
    name: "wave-section",
    src: "assets-src/wave/cross-section-clipart.jpg",
    width: 1189,
    fit: "contain",
    background: "#ffffff",
    quality: 80,
  },
  // The capstone poster, rendered from the PDF at 200dpi. It hangs at the foot
  // of the room and has to stay READABLE at full width, so it keeps far more
  // resolution than a photograph would and a much higher quality: this is dense
  // black text on white, where AVIF's usual settings smear the serifs.
  {
    name: "wave-poster",
    src: "assets-src/wave/capstone-poster.png",
    width: 2600,
    quality: 88,
  },
  // Deliberately NOT here: assets-src/wave/wave-diagram.jpg. The source is a
  // 2.6 KB clip-art sketch and upscales to a blurry mess — the wave room shows
  // two real photographs instead. Worth asking Michael for the CAD.

  // --- Nicaragua water distribution ---
  // Also a slide, so also `contain`: the attention crop sliced its heading in
  // half ("bicación del ... nque") exactly as it did on water-1 below.
  {
    name: "water-site",
    src: "assets-src/nicaragua/system-on-site.png",
    width: 1400,
    height: 933,
    fit: "contain",
    background: "#ffffff",
    quality: 72,
  },
  // The presentation slide showing the sequence: source, catchment, tank, tap.
  // `contain` because it is a slide, not a photograph — an attention crop cut
  // the heading off mid-word and dropped the last step out of the frame.
  {
    name: "water-1",
    src: "assets-src/nicaragua/layout-slide.png",
    width: 1400,
    height: 1050,
    fit: "contain",
    background: "#ffffff",
    quality: 72,
  },

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
  // The guides listing: the marketplace with real guides, real rates and the
  // brand's own furniture (masthead, filter, cards). This is the screen that
  // shows the thing works, where the home page only shows that it exists.
  // `contain` on the site's own warm off-white, since the capture is 1537x718
  // and a crop to 3:2 would take the masthead or the cards.
  {
    name: "campus-guides",
    src: "assets-src/campus-native/guides-listing.png",
    width: 1600,
    height: 1067,
    fit: "contain",
    background: "#fdfbf5",
    quality: 80,
  },

  // --- The arrow pointing at the ring toss ---
  //
  // Michael's source is a stock PNG whose transparency is FAKE: the checkerboard
  // is painted into the pixels (alphaMin 236, so nothing is actually clear), and
  // shipping it would have put a grey tiled box beside the toy. It is keyed in
  // `scripts/key-arrow.mjs` — flat red on uniform grey keys cleanly — and that
  // output is what this entry reads. Keeps its alpha, like the brand marks.
  {
    name: "arrow-red",
    src: "assets-src/misc/arrow-red.png",
    width: 300,
    fit: "contain",
    alpha: true,
    quality: 80,
  },

  // --- Brand marks, shown beside the company names ---
  //
  // These are the only entries that keep their ALPHA: they sit inline against
  // the wall next to a heading, so a flattened mark would paint a white (or
  // off-white) tile beside the type. `contain` because a mark has to be shown
  // whole, and no `background`, which is what keeps the transparency: the
  // manifest's `flatten` step is what a padded background would otherwise
  // trigger, and flattening is exactly what a logo here must not do.
  //
  // PNG rather than AVIF/JPEG for the fallback, since the JPEG in the pair has
  // no alpha at all and would be the halo this avoids.
  {
    name: "ramps-mark",
    src: "assets-src/ramps/logo-mark.png",
    width: 320,
    fit: "contain",
    alpha: true,
    quality: 82,
  },
  {
    name: "campus-mark",
    src: "assets-src/campus-native/logo-transparent.png",
    width: 320,
    fit: "contain",
    alpha: true,
    quality: 82,
  },

  // --- SMC execution system ---
  // The two poster languages, drawn by scripts/make-bot-poster.mjs. Vector art
  // rather than photography, so these compress far below the photo-dense
  // capstone posters while staying readable at full width.
  {
    name: "bot-poster-en",
    src: "assets-src/smc-bot/bot-poster.en.png",
    width: 2600,
    quality: 82,
  },
  {
    name: "bot-poster-de",
    src: "assets-src/smc-bot/bot-poster.de.png",
    width: 2600,
    quality: 82,
  },
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
  // The operator display as it ran on the day the system first went live, shot
  // off the screen rather than composed by the capture script. PORTRAIT at
  // source (1179x1958) because it is a phone frame, so `contain` onto a 4:5
  // window: a `cover` crop to the room's usual landscape would throw away the
  // analyst grid and the position table, which is the half worth showing.
  // Padded with the dashboard's own ground so the letterbox is invisible.
  {
    name: "bot-live",
    src: "assets-src/smc-bot/jarvis.jpg",
    width: 1100,
    height: 1375,
    fit: "contain",
    background: "#05080d",
    quality: 76,
  },
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
  // A mark that has to keep its alpha falls back to PNG, not JPEG: JPEG has no
  // alpha channel, so the fallback would ship the very white box the
  // transparent source exists to avoid.
  const fallbackPath = path.join(OUT, `${item.name}.${item.alpha ? "png" : "jpg"}`);

  await pipe.clone().avif({ quality: item.quality ?? 58, effort: 6 }).toFile(avifPath);
  if (item.alpha) {
    await pipe.clone().png({ compressionLevel: 9, palette: true }).toFile(fallbackPath);
  } else {
    await pipe.clone().jpeg({ quality: 76, mozjpeg: true }).toFile(fallbackPath);
  }

  const a = (await stat(avifPath)).size;
  total += a;
  console.log(
    `${item.name.padEnd(14)} ${kb(srcBytes).padStart(10)} -> ${kb(a).padStart(9)} avif` +
      `  (inlined ~${kb(a * 1.34)})`,
  );
}

console.log(`\nAVIF total: ${kb(total)}  (inlined ~${kb(total * 1.34)} inlined)`);
