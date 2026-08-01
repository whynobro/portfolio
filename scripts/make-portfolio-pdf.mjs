/**
 * Renders the live portfolio to a single PDF, for application forms that want
 * a FILE rather than a link.
 *
 *   node scripts/make-portfolio-pdf.mjs            # English, from the live site
 *   node scripts/make-portfolio-pdf.mjs --lang=de  # German
 *   node scripts/make-portfolio-pdf.mjs --base=http://localhost:4173
 *
 * Writes `Michael-Fischbach-Portfolio.<lang>.pdf` to the repo root (gitignored;
 * it is a build output, not a source).
 *
 * Each room is printed as its own page in the order the wall hangs them. The
 * hash router means every room shares one document, so pages are captured one
 * route at a time and concatenated rather than printed in a single pass.
 *
 * Print-specific handling that matters:
 *   - `?shots=1` force-mounts the canvas scenes and paints a static frame, so
 *     the toys appear instead of two empty boxes.
 *   - Lazy images are scrolled into view first; a print pass does NOT trigger
 *     `loading="lazy"` on its own and the plates would come out blank.
 *   - The masthead, footer and language toggle are hidden: they are navigation
 *     for a site, and on paper they are furniture repeated on every page.
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.slice(k.length + 3) : d;
};

const LANG = arg("lang", "en");
const BASE = arg("base", "https://michaelfischbach.dev");
const OUT = `Michael-Fischbach-Portfolio.${LANG}.pdf`;

/** The wall's own order: the entrance, then each room, then the awards. */
const ROUTES = [
  "",
  "#/work/cnc",
  "#/work/ramps",
  "#/work/wave",
  "#/work/bot",
  "#/work/campus",
  "#/work/water",
  "#/awards",
  "#/about",
];

// Chrome's print path ignores `loading="lazy"`, so every image is walked into
// view and awaited before the page is printed.
const SETTLE = `
  (async () => {
    const imgs = [...document.querySelectorAll('img')];
    for (const img of imgs) {
      img.loading = 'eager';
      if (img.dataset.src && !img.src) img.src = img.dataset.src;
    }
    window.scrollTo(0, 0);
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
    await Promise.all(imgs.filter(i => !i.complete).map(i => new Promise(res => {
      i.addEventListener('load', res, { once: true });
      i.addEventListener('error', res, { once: true });
      setTimeout(res, 3000);
    })));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  })()
`;

// Site chrome is navigation; on paper it is repeated furniture. The room's own
// "back to the collection" link goes too, for the same reason.
const PRINT_CSS = `
  .masthead, .colophon, .skip-link, .lang, .case__back, .work__back { display: none !important; }
  [data-view] { padding-block-start: 0 !important; }
  .section { break-inside: avoid; }
  .frame, .case__plate, figure { break-inside: avoid; page-break-inside: avoid; }
  h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
  body { background: #f7f4ee !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
`;

/**
 * The cover.
 *
 * Its job is to make the LIVE SITE the obvious next click: the pages that
 * follow are a printed record of an interactive portfolio, and the two toys and
 * the turning putter do not survive being flattened. The URL is stated twice,
 * once as a heading and once as a real PDF link annotation, because a reader
 * with the file open on a laptop will click it and a reader holding a printout
 * will type it.
 */
const COVER = {
  en: {
    kicker: "ENGINEERING PORTFOLIO",
    name: "Michael Fischbach",
    role: "Mechanical Engineering · Cal Poly San Luis Obispo",
    lead: "This document is a printed record of an interactive portfolio.",
    cta: "The live version is at",
    note: "Two of the pieces are playable and one turns in 3D; none of that survives print. Everything else, the photographs, the drawings and the figures, is reproduced here in full.",
    contents: "Contents",
    rooms: [
      "CNC-milled putter",
      "Chameleon Ramps",
      "Wave energy converter",
      "Autonomous execution system",
      "Campus Native",
      "Water distribution system",
      "Awards",
      "About",
    ],
  },
  de: {
    kicker: "INGENIEUR-PORTFOLIO",
    name: "Michael Fischbach",
    role: "Maschinenbau · Cal Poly San Luis Obispo",
    lead: "Dieses Dokument ist die gedruckte Fassung eines interaktiven Portfolios.",
    cta: "Die Live-Fassung finden Sie unter",
    note: "Zwei der Arbeiten sind spielbar, eine dreht sich in 3D; im Druck geht das verloren. Alles Übrige, die Fotografien, die Zeichnungen und die Kennzahlen, ist hier vollständig wiedergegeben.",
    contents: "Inhalt",
    rooms: [
      "CNC-gefräster Putter",
      "Chameleon Ramps",
      "Wellenenergie-Wandler",
      "Autonomes Ausführungssystem",
      "Campus Native",
      "Wasserverteilungssystem",
      "Auszeichnungen",
      "Profil",
    ],
  },
}[LANG];

const coverHtml = `<!doctype html><meta charset="utf-8">
<style>
  @page { size: A4; margin: 0 }
  html, body { margin: 0; padding: 0 }
  body {
    width: 210mm; height: 297mm; box-sizing: border-box;
    padding: 34mm 26mm; background: #f7f4ee; color: #1a1a1a;
    font-family: Georgia, "Times New Roman", serif;
    display: flex; flex-direction: column;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .rule { height: 3px; background: #b08d4f; width: 46mm; margin: 0 0 9mm }
  .kicker {
    font-family: "Courier New", monospace; font-size: 8.5pt;
    letter-spacing: .22em; color: #6b6155; margin: 0 0 5mm;
  }
  h1 { font-size: 30pt; margin: 0 0 2.5mm; font-weight: 600; letter-spacing: .01em }
  .role { font-size: 12pt; font-style: italic; color: #6b6155; margin: 0 0 14mm }
  .lead { font-size: 11.5pt; line-height: 1.5; margin: 0 0 7mm; max-width: 132mm }
  .cta { font-size: 10.5pt; color: #6b6155; margin: 0 0 1.5mm }
  .url {
    font-family: "Courier New", monospace; font-size: 15pt; color: #7a5c1e;
    margin: 0 0 12mm; letter-spacing: .01em;
  }
  .note { font-size: 9.5pt; line-height: 1.55; color: #6b6155; max-width: 132mm; margin: 0 0 auto }
  .contents { margin-top: 12mm }
  .contents h2 {
    font-family: "Courier New", monospace; font-size: 8.5pt; letter-spacing: .18em;
    color: #6b6155; font-weight: normal; margin: 0 0 4mm; text-transform: uppercase;
  }
  ol { margin: 0; padding: 0; list-style: none; columns: 2; column-gap: 14mm }
  li { font-size: 10pt; padding: 1.6mm 0; color: #1a1a1a; break-inside: avoid }
  li span { color: #b08d4f; font-family: "Courier New", monospace; font-size: 8.5pt; margin-right: 3mm }
  .foot {
    margin-top: 10mm; padding-top: 4mm; border-top: 1px solid #ddd5c7;
    font-family: "Courier New", monospace; font-size: 8pt; color: #6b6155;
    display: flex; justify-content: space-between;
  }
</style>
<div class="rule"></div>
<p class="kicker">${COVER.kicker}</p>
<h1>${COVER.name}</h1>
<p class="role">${COVER.role}</p>
<p class="lead">${COVER.lead}</p>
<p class="cta">${COVER.cta}</p>
<p class="url"><a href="https://michaelfischbach.dev" style="color:#7a5c1e;text-decoration:none">michaelfischbach.dev</a></p>
<p class="note">${COVER.note}</p>
<div class="contents">
  <h2>${COVER.contents}</h2>
  <ol>${COVER.rooms.map((r, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span>${r}</li>`).join("")}</ol>
</div>
<div class="foot"><span>michaelfischbach.dev</span><span>mef126906@icloud.com</span></div>`;

const browser = await chromium.launch();
// deviceScaleFactor stays at 1. At 2 every photograph is rasterised at twice
// the linear size and the document came to 54 MB, over the limit most
// application forms accept. Chrome's PDF export already vectorises text and
// embeds the images at their natural resolution, so print quality does not
// depend on it.
const page = await browser.newPage({
  viewport: { width: 1280, height: 1000 },
  deviceScaleFactor: 1,
});

// The cover is printed first so it becomes page 1 of the merged document.
process.stdout.write("  [cover] ... ");
await page.setContent(coverHtml, { waitUntil: "load" });
await page.pdf({ path: ".pdf-part-cover.pdf", format: "A4", printBackground: true });
process.stdout.write("ok\n");

const parts = [".pdf-part-cover.pdf"];
for (const [i, route] of ROUTES.entries()) {
  const url = `${BASE}/?lang=${LANG}&shots=1${route}`;
  process.stdout.write(`  [${i + 1}/${ROUTES.length}] ${route || "/"} ... `);
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  // The scene runtime sets this once every canvas has been sized and painted.
  await page
    .waitForFunction(() => document.documentElement.dataset.booted === "1", { timeout: 15000 })
    .catch(() => {});
  await page.addStyleTag({ content: PRINT_CSS });
  await page.evaluate(SETTLE);
  await page.waitForTimeout(600);

  const file = `.pdf-part-${i}.pdf`;
  await page.pdf({
    path: file,
    format: "A4",
    printBackground: true,
    margin: { top: "14mm", bottom: "14mm", left: "12mm", right: "12mm" },
    scale: 0.72,
  });
  parts.push(file);
  process.stdout.write("ok\n");
}
await browser.close();

// Concatenate. Playwright writes one PDF per route; they are merged with
// pdf-lib if it is available, and otherwise left as numbered files rather than
// silently producing a document with only the last page in it.
let merged = false;
try {
  const { PDFDocument } = await import("pdf-lib");
  const out = await PDFDocument.create();
  for (const f of parts) {
    const src = await PDFDocument.load(readFileSync(f));
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const p of pages) out.addPage(p);
  }
  writeFileSync(OUT, await out.save());
  for (const f of parts) unlinkSync(f);
  merged = true;
} catch (err) {
  console.error(`\n  merge skipped (${err.message})`);
}

if (merged) {
  // A room whose content ends just past a page break leaves a genuinely blank
  // sheet, which in the middle of a portfolio reads as a mistake. They are
  // stripped by RENDERING each page and measuring ink, rather than by
  // inspecting the content stream: a page can carry drawing operators and
  // still come out white.
  const { execFileSync } = await import("node:child_process");
  const strip = `
import fitz, sys, os, io
src = sys.argv[1]
d = fitz.open(src)

# A page is dropped only when it carries NO text and NO image. Thresholding on
# rendered ink alone was wrong: an awards entry that spilled onto its own page
# is faint but is real content, and deleting it would have quietly removed a
# credential from the document.
blank = [i for i, p in enumerate(d)
         if not p.get_text().strip() and not p.get_images()]
if blank:
    d.delete_pages(blank)

# Chrome embeds every plate as an UNCOMPRESSED raster, so a 1400x1400
# photograph costs 3.8 MB and the document came to 54 MB, past what most
# application forms accept.
#
# rewrite_images re-encodes them in place. Doing this by hand first, with
# update_stream plus hand-set Filter/ColorSpace keys, produced an 8 MB file in
# which EVERY PHOTOGRAPH WAS BLANK: the dictionary no longer described the
# bytes, and viewers drew nothing. That was only visible by reading the
# rendered document back, never from the file size.
#
# 1400px on the long edge is ~180dpi at A4, beyond what print resolves.
before = os.path.getsize(src)
d.rewrite_images(dpi_threshold=200, dpi_target=150, quality=80)
saved = 0

# PyMuPDF refuses a non-incremental save over the file it opened, so it goes to
# a temp path and is moved into place.
tmp = src + ".stripped"
d.save(tmp, garbage=4, deflate=True)
n = d.page_count
d.close()
os.replace(tmp, src)
print(f"{len(blank)} blank page(s) removed; {n} remain; ~{saved//1048576} MB of image data resampled")
`;
  try {
    const msg = execFileSync("python3", ["-c", strip, OUT], { encoding: "utf8" });
    process.stdout.write(`  ${msg.trim()}\n`);
  } catch (err) {
    console.error(`  blank-page strip skipped (${err.message.split("\n")[0]})`);
  }
  const mb = (readFileSync(OUT).length / 1048576).toFixed(1);
  console.log(`\nwrote ${OUT} (${mb} MB)`);
} else {
  console.log(`\nwrote ${parts.length} part files; install pdf-lib to merge:`);
  console.log("  npm i -D pdf-lib");
}
