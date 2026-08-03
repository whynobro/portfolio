/**
 * Renders the ONE-PAGE resume: the strongest subset, on a single sheet.
 *
 *   node scripts/make-cv-onepage.mjs
 *   node scripts/make-cv-onepage.mjs --lang=intl   (adds the visa line)
 *
 * Writes `Michael-Fischbach-Resume-1Page.pdf` to the repo root (gitignored).
 *
 * WHY A SEPARATE SCRIPT from `make-cv-en.mjs`. The three variants there differ
 * only in their objective and eligibility line, so they share one template.
 * This document differs in its CONTENT: it drops whole entries. Bending the
 * shared template to also express "and omit these six blocks" would have made
 * the common case harder to read for the sake of the rare one.
 *
 * WHAT WAS CUT, and why. The brief was "as hard to reject as possible", which
 * means every line has to earn its space against a reader skimming for reasons
 * to say no. Cut:
 *
 *   Oaks Christian School      The university block now carries the education
 *                              claim. A 2025 high-school GPA next to a college
 *                              GPA reads as padding.
 *   ADI (digital media)        Real work, but marketing at an aerospace firm
 *                              is not engineering evidence. On a two-page
 *                              resume it shows range; on one page it dilutes.
 *   Ashersells LLC             Same reasoning. The $500k is someone else's
 *                              revenue and the role was commercial.
 *   Doorknob-Inator            A class project with no measured outcome.
 *   Water distribution         Strong, but the same "designed and analysed"
 *                              ground the wave converter covers with a 1st
 *                              place attached.
 *   Community service,         True and good, but neither survives a cut
 *   Eagle Scout detail         against a machining figure.
 *
 * WHAT SURVIVED. Four projects, each carrying a number a reader can check:
 * $15.78 unit cost, 1st place / highest measured output, 1358 orders and
 * $50,000+, 1553 tests. Plus the three awards that are competitive rather than
 * participatory. Chameleon Ramps is listed under EXPERIENCE rather than
 * projects, because "has run a manufacturing company for six years" is the
 * single least-rejectable fact here and belongs where a reader looks for jobs.
 *
 * FIGURES come from `docs/resume-inventory.md`, which is the authority. Note
 * the putter cost saving is stated as two dollar figures and NEVER as a
 * percentage: the retired "533% reduction" was arithmetically impossible.
 */
import { chromium } from "playwright";
import { PORTFOLIO_GENERAL, PORTFOLIO_TEXT } from "./portfolio-link.mjs";

const OUT = "Michael-Fischbach-Resume-1Page.pdf";
const intl = process.argv.includes("--lang=intl");

/**
 * The abroad line carries German on it rather than in the skills block: the
 * skills block is three single lines and a fourth item tips "Methods" into
 * wrapping, which costs a whole line on a page with none to spare.
 */
const eligibility = intl
  ? "Malibu, CA | U.S. Citizen, eligible for study-related internship visas | German: beginner, actively learning"
  : "Malibu, CA";

const html = `<!doctype html><meta charset="utf-8">
<title>Michael Fischbach — Resume</title>
<style>
  @page { size: Letter; margin: 12mm 14mm }
  * { box-sizing: border-box }
  body {
    margin: 0; font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 9.6pt; line-height: 1.34; color: #000;
  }
  h1 { font-size: 19pt; margin: 0 0 1.6mm; font-weight: 700; text-align: center }
  .contact { font-size: 8.8pt; text-align: center; margin: 0 0 3mm; line-height: 1.45 }
  /* Blue and underlined on purpose: a PDF has no hover cue, so an unstyled
   * link is invisible as a link. #0563c1 is Word's hyperlink colour. The email
   * stays in body colour; see the note in make-cv-en.mjs. */
  .contact a { color: inherit; text-decoration: none }
  .contact a.link { color: #0563c1; text-decoration: underline }
  /* The two companies link to their live sites, same blue as the header: these
   * businesses are real and inspectable, and that only pays off if clicked. */
  a.site { color: #0563c1; text-decoration: underline }
  h2 {
    font-size: 10.2pt; font-weight: 700; margin: 3mm 0 1.3mm;
    border-bottom: 1.2px solid #000; padding-bottom: .8mm;
  }
  .entry { margin: 0 0 2mm 5mm; break-inside: avoid }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 8mm }
  .role { font-weight: 700; font-size: 10pt }
  .when { font-size: 9pt; white-space: nowrap }
  .org { font-style: italic; font-size: 9pt; margin: .2mm 0 .8mm }
  .org .right { float: right; font-style: italic }
  ul { margin: 0; padding: 0; list-style: none }
  li { margin: 0 0 .7mm; padding-left: 3.4mm; text-indent: -3.4mm }
  li::before { content: "• " }
  .objective { margin: 0 0 1mm }
  .skills p { margin: 0 0 .9mm }
  .awards { margin-left: 5mm }
</style>

<h1>Michael Fischbach</h1>
<p class="contact">
  805-703-8250 | <a href="mailto:mef126906@icloud.com">mef126906@icloud.com</a> |
  <a class="link" href="https://www.linkedin.com/in/michael-fischbach/">LinkedIn</a> |
  <a class="link" href="${PORTFOLIO_GENERAL}">${PORTFOLIO_TEXT}</a><br>${eligibility}
</p>

<h2>OBJECTIVE</h2>
<p class="objective">
  Mechanical Engineering student (Cal Poly Honors, 3.78 GPA) seeking a${intl ? "n international" : ""}
  mechanical design or manufacturing internship. Takes parts from CAD to finished metal:
  3-axis CNC machining, tolerance analysis, testing on the real component. Has run a
  manufacturing company since 2019, so the loop is owned rather than observed.
</p>

<h2>EDUCATION</h2>
<div class="entry">
  <div class="row">
    <span class="role">California Polytechnic State University, San Luis Obispo</span>
    <span class="when">Sep 2025 – Jun 2029</span>
  </div>
  <!-- The coursework line (piston, Geneva wheel, CNC-machined screwdriver with
       tolerance stack-up and GD&T) is deliberately absent: the projects below
       evidence machining and GD&T far more strongly than a course list, and it
       was costing the line the awards block needed. -->
  <p class="org">B.S. Mechanical Engineering, Honors Program | GPA: 3.78</p>
</div>

<h2>EXPERIENCE</h2>
<div class="entry">
  <div class="row"><span class="role">Founder</span><span class="when">2019 – Present</span></div>
  <p class="org"><a class="site" href="https://www.chameleonramps.com">Chameleon Ramps</a><span class="right">Malibu, CA</span></p>
  <ul>
    <li>Designed 40+ products over six years and developed a proprietary casting process that cut material waste ~30%</li>
    <li>Ran a design-test-refine loop across 4–6 prototype generations per product; <b>1358 orders fulfilled</b>, <b>$50,000+ revenue</b></li>
  </ul>
</div>
<div class="entry">
  <div class="row"><span class="role">CEO &amp; Founder</span><span class="when">Jun 2026 – Present</span></div>
  <p class="org"><a class="site" href="https://www.campusnative.com">Campus Native</a><span class="right">San Luis Obispo, CA</span></p>
  <ul><li>Founded and operate a digital marketplace; lead a 4-person team across engineering and marketing</li></ul>
</div>
<!-- ADI and Ashersells are deliberately absent here; see the header comment.
     Campus Native survives on one line because "founded a company and leads a
     team" is a hiring signal even without a measured outcome attached. -->


<h2>ENGINEERING PROJECTS</h2>
<div class="entry">
  <div class="row">
    <span class="role">CNC Milled Golf Putter – Full CAD-to-Part Build</span>
    <span class="when">2024 – 2025</span>
  </div>
  <p class="org">3-Axis HAAS CNC, Fusion 360, DFM</p>
  <ul>
    <li>Designed and machined a novel putter geometry from 6061 aluminum in a single fixture; validated on PLA prototypes before cutting the production part</li>
    <li>DFM and cost analysis: modeled unit cost at <b>$15.78</b> against $50–150 retail. Selected <b>1 of 8 finalists from 40+ students</b>; presented at Capstone Night to 200+ alumni and industry professionals</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Wave Energy Converter – Rack &amp; Pinion Generator</span>
    <span class="when">2023</span>
  </div>
  <p class="org">Bridgeport Mill, Fusion 360, Fluid Dynamics</p>
  <ul>
    <li>Designed and machined a wave-oscillation-to-power generator with a five-person team; all components manufactured to tolerance in-house</li>
    <li><b>1st of three teams</b> on measured output: 15 V per motor at 1:12 scale, 360 V scaled</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Autonomous Execution System</span>
    <span class="when">2025 – Present</span>
  </div>
  <p class="org">Python, Real-Time Data, SQLite, Backtesting</p>
  <ul>
    <li>Python system ingesting real-time data and executing through an external API, with risk limits and state persistence; <b>1553 tests passing</b> in production, parameters selected on their worst case across two disjoint validation windows rather than their best</li>
  </ul>
</div>

<h2>TECHNICAL SKILLS</h2>
<div class="skills">
  <p><b>CAD / CAE:</b> Fusion 360 (6+ years, 40+ designs), SolidWorks, AutoCAD, Autodesk CFD</p>
  <p><b>Manufacturing:</b> 3-axis HAAS CNC machining, Bridgeport mill, lathe, FDM/SLA 3D printing, composite &amp; concrete casting</p>
  <p><b>Methods:</b> GD&amp;T, tolerance stack-up analysis, DFM, iterative prototyping, cost modeling &nbsp;·&nbsp; <b>Software:</b> Python, Git</p>
</div>

<h2>AWARDS</h2>
<ul class="awards">
  <li><b>Capstone Finalist</b> – 1 of 8 from 40+ students, 2025 &nbsp;·&nbsp; <b>1st Place, Wave Energy Converter</b>, 2023</li>
  <li><b>President's Honors List</b> – Cal Poly, 2026; Dean's List three consecutive quarters &nbsp;·&nbsp; <b>Cal Poly Honors Program</b></li>
  <li><b>1st Place, Noodle Bridge Design</b> – won by a <b>38.5% margin</b>, 2025 &nbsp;·&nbsp; <b>Eagle Scout</b>, 2025</li>
</ul>`;

const browser = await chromium.launch();
const tab = await browser.newPage();
await tab.setContent(html, { waitUntil: "load" });
await tab.pdf({ path: OUT, format: "Letter", printBackground: true });
await browser.close();
console.log(`wrote ${OUT}${intl ? " (intl)" : ""}`);
