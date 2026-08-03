/**
 * Renders the cover letter for the Apple Product Design internship.
 *
 *   node scripts/make-cover-apple.mjs
 *
 * Writes `Michael-Fischbach-CoverLetter-Apple.pdf` to the repo root
 * (gitignored).
 *
 * WHY NOT `make-anschreiben.mjs --lang=en`. That script's English copy is
 * deliberately DIN 5008: German sender block, recipient block, right-aligned
 * date, subject line without "Re:". That is correct for HWA, whose reader is a
 * German employer, and wrong here. A US recruiter reading a DIN letter sees a
 * misformatted document, not a European courtesy. This one is US block format:
 * no recipient address block (an online application has no postal destination),
 * date left, plain salutation.
 *
 * WHETHER TO SEND ONE AT ALL. Apple's application form usually takes a resume
 * and optional attachments, and there is a real argument that an unrequested
 * cover letter is noise at a company receiving this volume. It exists because
 * the one thing the resume cannot say is WHY product design specifically, and
 * because Michael's strongest fact (six years running a manufacturing business
 * at 15) is a story rather than a bullet. Attach it if the form has a slot;
 * skip it if the form does not ask. Do not paste it into a "additional
 * information" box.
 *
 * WHAT IT ARGUES, in order:
 *   1. The loop is owned, not observed. Started a company at fifteen.
 *   2. The single-setup putter: a real DFM constraint reasoned through.
 *   3. Measure rather than assume: the wave converter's measured 1st place.
 *   4. Volume manufacturing reality: 1358 orders, scrap reduction, deadlines.
 * It argues FROM the resume's figures rather than restating them.
 *
 * NO NX CLAIM, and no apology for its absence. The letter names Fusion 360 at
 * six years. Claiming or hedging an unused tool is the fastest way to lose a
 * technical reader.
 *
 * NO FABRICATED APPLE FLATTERY. No invented product opinions, no "I have
 * admired Apple since...", no claim about their internal process Michael cannot
 * know. The connection drawn is the real one: tolerance-driven design in
 * aluminium at volume is what both he and they actually do.
 *
 * FIGURES come from `docs/resume-inventory.md`. The putter is 3-axis and its
 * cost is two dollar figures, never a percentage.
 */
import { chromium } from "playwright";

const OUT = "Michael-Fischbach-CoverLetter-Apple.pdf";

const html = `<!doctype html><meta charset="utf-8">
<title>Michael Fischbach — Cover Letter</title>
<style>
  @page { size: Letter; margin: 18mm 20mm 16mm }
  * { box-sizing: border-box }
  body {
    margin: 0; font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 10pt; line-height: 1.46; color: #1a1a1a;
  }
  .sender { font-size: 8.8pt; line-height: 1.4; margin: 0 0 8mm; color: #333 }
  .sender b { color: #1a1a1a; font-size: 9.4pt }
  .date { margin: 0 0 7mm; font-size: 9.4pt }
  .subject { font-weight: 700; margin: 0 0 5.5mm; font-size: 10.4pt; line-height: 1.35 }
  p { margin: 0 0 3.6mm; text-align: justify; hyphens: auto }
  .close { margin: 5mm 0 0 }
  .sig { margin: 6mm 0 0; font-size: 10pt }
  /* Links stay in body colour here, unlike the resume: a letter is prose, and a
   * blue run mid-paragraph pulls the eye off the sentence. The portfolio URL is
   * still a real anchor, so it remains clickable. */
  a { color: #1a1a1a }
</style>

<p class="sender">
  <b>Michael Fischbach</b><br>
  Malibu, California<br>
  805-703-8250 · mef126906@icloud.com<br>
  <a href="https://michaelfischbach.dev">michaelfischbach.dev</a>
</p>

<p class="date">2 August 2026</p>

<p class="subject">Product Design Engineering Internship</p>

<p>Dear Hiring Team,</p>

<p>
  What I like is making things: sketch, CAD model, prototype, repeat. I started a company doing
  it at fifteen and have not stopped since. Six years later Chameleon Ramps has shipped
  <b>1358 orders</b> across <b>40+ products</b> I designed, which means I have spent those years
  on the unglamorous half of product design, the mould that will not release, the draft angle
  that fixes it, the part that has to cost less next month. I am applying for the Product Design
  Engineering internship because that loop is what I want to do at a scale I cannot reach alone.
</p>

<p>
  My capstone was a putter head milled from a single block of 6061 aluminum, and I designed it
  to come off the machine in <b>one setup</b>. That single constraint shaped the entire part:
  every feature had to be reachable without unclamping, because each re-fixture costs an
  operation and puts the datum at risk. The scooping cavity's undercuts drove the toolpath
  strategy, and I cut the three-degree loft on a printed shim rather than build a tilted fixture.
  I ran PLA prototypes until the geometry was right, then cut the aluminum. Modeled at volume
  it comes to <b>$15.78</b> a unit against $50 to $150 at retail. It was selected as one of eight
  projects from more than forty to present.
</p>

<p>
  I would rather measure than assume. Our five-person team built a wave energy converter and
  machined every component to tolerance ourselves on a Bridgeport mill; it took <b>first place</b>
  with the highest measured output of the three teams, at 15 V per motor at 1:12 scale. The
  number is the reason I mention it. A design I like the look of and a design I have measured are
  not the same thing, and only one of them is finished.
</p>

<p>
  I know I am arriving with Fusion 360 rather than NX, six years of it and 40+ designs, and I
  expect to learn your toolchain the way I learned that one. What I am not arriving without is
  the judgment underneath it: GD&amp;T and tolerance stack-ups on university mechanisms, DFM
  reasoning on parts I then had to actually cut, and six years of finding out that a tolerance is
  wrong by holding the part.
</p>

<p>
  My work is at <a href="https://michaelfischbach.dev">michaelfischbach.dev</a>, including the
  putter and its CAM setup. I would be glad to talk.
</p>

<p class="close">Sincerely,</p>
<p class="sig">Michael Fischbach</p>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: OUT, format: "Letter", printBackground: true });
await browser.close();
console.log(`wrote ${OUT}`);
