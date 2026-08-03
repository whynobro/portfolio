/**
 * Renders the APPLE PRODUCT DESIGN resume, one page.
 *
 *   node scripts/make-cv-apple.mjs
 *
 * Writes `Michael-Fischbach-Resume-Apple.pdf` to the repo root (gitignored).
 *
 * WHY A SEPARATE SCRIPT, again. `make-cv-en.mjs` holds three variants that
 * differ in two strings. `make-cv-onepage.mjs` differs in which entries exist.
 * This one differs in the ARGUMENT it makes: Apple's Product Design postings
 * name CAD, tolerance analysis, GD&T and design-for-manufacturing explicitly,
 * so the document is ordered to answer that posting line by line rather than to
 * present the strongest work in the abstract.
 *
 * WHAT CHANGED from the one-pager, and why each:
 *
 *   Putter moved to the TOP of projects.  It is the only entry that is
 *                              simultaneously CAD, DFM, tolerance work and a
 *                              finished metal part. Apple's posting asks for
 *                              exactly that stack, so it leads.
 *   Doorknob-Inator ADDED.     Cut from the one-pager for having no measured
 *                              outcome, and that is still true. It earns its
 *                              place here because Apple Product Design is a
 *                              human-centred design organisation and this is
 *                              the only assistive-design work in the inventory.
 *                              One line, no invented figure.
 *   Execution system CUT.      1553 tests is a strong number but it argues
 *                              software, and the space buys a stronger
 *                              tolerance-analysis line for this reader. It goes
 *                              back in for any posting that names programming.
 *   Campus Native CUT.         Marketplace operations is not product design.
 *   Coursework line RESTORED.  The piston / Geneva wheel / CNC screwdriver
 *                              builds carry "tolerance stack-up and GD&T" as
 *                              UNIVERSITY work. The posting names GD&T; the
 *                              one-pager dropped this line for space, and here
 *                              it is worth more than what it displaces.
 *   Python KEPT in skills.     The iPhone posting names Matlab/Python. It is
 *                              evidenced by the execution system even with that
 *                              entry cut, and by the Ashersells automation.
 *
 * NX HONESTY. The iPhone req prefers NX. Michael has not used NX and this
 * document does not claim it, in any hedged form. Fusion 360 at 6+ years and
 * 40+ shipped designs is the real claim, and a CAD-tool gap is a training
 * matter that no undergraduate is expected to arrive without.
 *
 * FIGURES come from `docs/resume-inventory.md`, which is the authority. The
 * putter cost is two dollar figures and NEVER a percentage: the retired "533%
 * reduction" was arithmetically impossible. The machine is 3-axis, not 4.
 */
import { chromium } from "playwright";
import { PORTFOLIO_GENERAL, PORTFOLIO_TEXT } from "./portfolio-link.mjs";

const OUT = "Michael-Fischbach-Resume-Apple.pdf";

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
  <a class="link" href="${PORTFOLIO_GENERAL}">${PORTFOLIO_TEXT}</a><br>Malibu, CA
</p>

<h2>OBJECTIVE</h2>
<p class="objective">
  Mechanical Engineering student (Cal Poly Honors, 3.78 GPA) seeking a Product Design
  Engineering internship. Takes parts from CAD to finished metal: 3-axis CNC machining,
  GD&amp;T and tolerance stack-up analysis, design for manufacturing. Has designed and sold
  40+ manufactured products since 2019, so the design-prototype-production loop is owned
  rather than observed.
</p>

<h2>EDUCATION</h2>
<div class="entry">
  <div class="row">
    <span class="role">California Polytechnic State University, San Luis Obispo</span>
    <span class="when">Sep 2025 – Jun 2029</span>
  </div>
  <p class="org">B.S. Mechanical Engineering, Honors Program | GPA: 3.78</p>
  <!-- Restored from the one-pager. The posting names GD&T explicitly, and this
       is the only place university-level tolerance work appears. -->
  <ul>
    <li>Built multi-component mechanisms (piston, Geneva wheel, CNC-machined screwdriver) with full tolerance stack-up analysis and GD&amp;T</li>
  </ul>
</div>

<h2>EXPERIENCE</h2>
<div class="entry">
  <div class="row"><span class="role">Founder</span><span class="when">2019 – Present</span></div>
  <p class="org"><a class="site" href="https://www.chameleonramps.com">Chameleon Ramps</a><span class="right">Malibu, CA</span></p>
  <ul>
    <li>Designed <b>40+ products</b> over six years; developed a proprietary casting process, mould design included, that cut material waste ~30%</li>
    <li>Ran a design-test-refine loop across 4–6 prototype generations per product; <b>1358 orders fulfilled</b>, <b>$50,000+ revenue</b></li>
  </ul>
</div>

<h2>ENGINEERING PROJECTS</h2>
<div class="entry">
  <div class="row">
    <span class="role">CNC Milled Golf Putter – Full CAD-to-Part Build</span>
    <span class="when">2024 – 2025</span>
  </div>
  <p class="org">3-Axis HAAS CNC, Fusion 360, DFM, Tolerance Analysis</p>
  <ul>
    <li>Designed and machined a novel putter geometry from 6061 aluminum in a <b>single fixture</b>; the constraint drove the geometry, including a scooping cavity whose undercuts set the toolpath strategy. Validated on iterative PLA prototypes before cutting the production part</li>
    <li>DFM and cost analysis: modeled unit cost at <b>$15.78</b> against $50–150 retail. Selected <b>1 of 8 finalists from 40+ students</b>; presented at Capstone Night to 200+ alumni and industry professionals</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Wave Energy Converter – Rack &amp; Pinion Generator</span>
    <span class="when">2023</span>
  </div>
  <p class="org">Bridgeport Mill, Fusion 360, AutoCAD, Fluid Dynamics</p>
  <ul>
    <li>Designed and machined a wave-oscillation-to-power generator with a five-person team; all components manufactured to tolerance in-house</li>
    <li><b>1st of three teams</b> on measured output: 15 V per motor at 1:12 scale, 360 V scaled</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Doorknob-Inator – Assistive Product Design</span>
    <span class="when">2025</span>
  </div>
  <p class="org">Cal Poly IME-129, Human-Centered Design</p>
  <ul>
    <li>Designed a product enabling a person with a disability to interact more easily with everyday hardware</li>
  </ul>
</div>

<h2>TECHNICAL SKILLS</h2>
<div class="skills">
  <p><b>CAD / CAE:</b> Fusion 360 (6+ years, 40+ designs), SolidWorks, AutoCAD, Autodesk CFD</p>
  <p><b>Manufacturing:</b> 3-axis HAAS CNC machining and programming, Bridgeport mill, lathe, FDM/SLA 3D printing, composite &amp; concrete casting, mould design</p>
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
console.log(`wrote ${OUT}`);
