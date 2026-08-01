/**
 * Builds the favicon set and the social preview card.
 *
 *   node scripts/make-icons.mjs
 *
 * The mark is the Chameleon Ramps silhouette in ink on the gallery's wall
 * colour. It was chosen against an "MF" monogram by rendering BOTH at 16px and
 * looking: the serif monogram turns to grey mush at tab size, the silhouette
 * survives. A favicon lives at 16px, so that is the size that decides it.
 *
 * Everything lands in `src/assets/img/` so the bundler hashes it like any other
 * asset. The one exception is the social card, which must be an ABSOLUTE URL in
 * the meta tags (crawlers do not resolve relative paths), so it is emitted to
 * `public/` under a stable name and referenced as michaelfischbach.dev/og.png.
 */
import sharp from "sharp";

const SRC = "src/assets/img/ramps-mark.png";
const IMG = "src/assets/img";
const PUB = "public";

const WALL = "#f7f4ee"; // --wall
const INK = "#1a1a1a"; // --ink
const GILT = "#b08d4f"; // --gilt

/** The silhouette recoloured, on a padded square of wall. */
async function tile(size, colour, pad) {
  const inner = size - pad * 2;
  const mask = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  // The source is a black silhouette, so it works as a mask: paint a solid
  // colour and keep only where the mark is opaque.
  const painted = await sharp({
    create: { width: inner, height: inner, channels: 4, background: colour },
  })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  return sharp({ create: { width: size, height: size, channels: 4, background: WALL } })
    .composite([{ input: painted, top: pad, left: pad }])
    .png()
    .toBuffer();
}

// --- favicons -------------------------------------------------------------
// 32px is what most browsers actually show; 180px is Apple's home-screen icon,
// which is composited on its own rounded tile so it gets no padding of its own.
await sharp(await tile(512, INK, 56)).toFile(`${IMG}/icon.png`);
await sharp(await tile(180, INK, 18)).toFile(`${IMG}/icon-apple.png`);

// --- social preview card --------------------------------------------------
// 1200x630 is the size Open Graph consumers crop to. Kept deliberately plain:
// the mark, the name, and what this is. Text is drawn as SVG so there is no
// font file to embed and nothing to load.
// The text column stops at x=820 and the mark sits beyond it: at 1200px wide
// there is no room for a full-width subtitle AND the silhouette, and the first
// attempt ran the two into each other and clipped both.
const card = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${WALL}"/>
  <rect x="0" y="0" width="1200" height="8" fill="${GILT}"/>
  <text x="90" y="285" font-family="Georgia, 'Times New Roman', serif" font-size="76"
        fill="${INK}">Michael Fischbach</text>
  <text x="90" y="345" font-family="Georgia, 'Times New Roman', serif" font-size="34"
        font-style="italic" fill="#6b6155">Mechanical engineering</text>
  <text x="90" y="390" font-family="Georgia, 'Times New Roman', serif" font-size="34"
        font-style="italic" fill="#6b6155">Cal Poly San Luis Obispo</text>
  <rect x="90" y="428" width="120" height="3" fill="${GILT}"/>
  <text x="90" y="486" font-family="'Courier New', monospace" font-size="24"
        fill="#6b6155" letter-spacing="2">CAD TO PART · CNC · PRODUCTION SOFTWARE</text>
</svg>`);

const markForCard = await tile(240, INK, 0);
await sharp(card)
  .composite([{ input: markForCard, top: 195, left: 900 }])
  .png()
  .toFile(`${PUB}/og.png`);

console.log("wrote icon.png, icon-apple.png, public/og.png");
