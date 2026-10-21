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
 *   ADI (digital media)        Cut in Aug 2026 as "marketing, not engineering
 *                              evidence". BACK on the page since 2026-09-14:
 *                              it sponsors the Secret clearance, and the
 *                              title is now Data Analyst.
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
 * $50,000+, 2,015 tests. Plus the three awards that are competitive rather than
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
  @page { size: Letter; margin: 10mm 12mm }
  * { box-sizing: border-box }
  body {
    margin: 0; font-family: "Times New Roman", Times, serif;
    font-size: 10.5pt; line-height: 1.24; color: #000;
  }
  h1 { font-size: 19pt; margin: 0 0 1mm; font-weight: 700; text-align: center }
  .contact { font-size: 9.5pt; text-align: center; margin: 0 0 1mm; line-height: 1.3 }
  /* The location/eligibility line is its OWN centred block, not a <br> inside
     .contact (changed 2026-09-14). As a <br> its spacing was governed by
     line-height and could not be opened up; as a block it takes a real margin,
     set to match the h1's 1mm so name -> links and links -> location are the
     same gap. Centred so a printed copy reads as deliberate. */
  .location { font-size: 9.5pt; text-align: center; margin: 0 0 2.2mm; line-height: 1.3 }
  /* Links are BLACK with an underline (asked for 2026-09-11, superseding the
   * earlier #0563c1 blue). They stay real anchors, so Chromium still writes
   * clickable /Annots into the PDF, and the underline still marks them as
   * links, but the page prints as one colour. The phone number stays plain
   * text: tel: does nothing in a desktop PDF reader. */
  .contact a { color: #000; text-decoration: underline }
  .contact a.link { color: #000; text-decoration: underline }
  /* The phone is underlined to match the three links beside it, but is NOT an
   * anchor: a tel: URL does nothing in the desktop PDF readers a recruiter
   * uses, so linking it would promise a click that silently fails. Styling
   * only, for a consistent header row (asked for 2026-09-14).
   * NOTE: no backticks in this block, the whole page is a template literal. */
  .contact .tel { text-decoration: underline }
  /* The two companies link to their live sites: real and inspectable, which
   * only pays off if a reader clicks through. */
  a.site { color: #000; text-decoration: underline }
  /* Campus Native: clickable but NOT underlined. That entry deliberately shows
     no domain, so an underline marked a link whose target the line never
     states. Ramps keeps its underline because it shows chameleonramps.com. */
  a.site.plain { text-decoration: none }
  h2 {
    font-size: 11.5pt; font-weight: 700; margin: 2.4mm 0 1mm;
    border-bottom: 1px solid #000; padding-bottom: .5mm;
  }
  .entry { margin: 0 0 1.5mm 4mm; break-inside: avoid }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 8mm }
  .role { font-weight: 700; font-size: 11pt }
  .when { font-size: 10pt; white-space: nowrap }
  .org { font-style: italic; font-size: 10pt; margin: .2mm 0 .5mm }
  .org .right { float: right; font-style: italic }
  ul { margin: 0; padding: 0; list-style: none }
  li { margin: 0 0 .45mm; padding-left: 3.2mm; text-indent: -3.2mm }
  li::before { content: "• " }
  .objective { margin: 0 0 1mm }
  .skills p { margin: 0 0 .45mm }
  .awards { margin-left: 4mm }
</style>

<h1>Michael Fischbach</h1>
<p class="contact">
  <span class="tel">805-703-8250</span> |
  <a class="link" href="mailto:mef126906@icloud.com">mef126906@icloud.com</a> |
  <a class="link" href="https://www.linkedin.com/in/mefisch/">www.linkedin.com/in/mefisch</a> |
  <a class="link" href="${PORTFOLIO_GENERAL}">${PORTFOLIO_TEXT}</a>
</p>
<p class="location">${eligibility}</p>

<!-- OBJECTIVE removed 2026-09-14. It asserted what the page already proves:
     the GPA and honors sit in EDUCATION directly below, and "CAD to finished
     metal, 3-axis CNC, tolerance analysis" is the putter entry verbatim. The
     reclaimed space went to coursework and the Campus Native team. If a
     targeted version ever needs one back, take it from the CV, not from here. -->

<h2>EDUCATION</h2>
<div class="entry">
  <div class="row">
    <span class="role">California Polytechnic State University, San Luis Obispo</span>
    <span class="when">Sep 2025 – May 2029</span>
  </div>
  <!-- Dean's List and the coursework bullet were restored from the CV on
       2026-09-14, paid for by cutting OBJECTIVE. Keep this line identical to
       the CV's: a figure that differs between the two documents is the thing a
       reader notices. Graduation is May 2029 (confirmed 2026-09-14, was Jun). -->
  <p class="org">B.S. Mechanical Engineering, Honors Program | GPA: 3.78 | Dean's List: Fall, Winter, Spring</p>
  <ul>
    <li>Built multi-component mechanisms (piston, Geneva wheel, CNC-machined screwdriver) with full tolerance stack-up analysis and GD&amp;T</li>
  </ul>
</div>

<h2>EXPERIENCE</h2>
<div class="entry">
  <div class="row"><span class="role">Founder</span><span class="when">2019 – Present</span></div>
  <p class="org">Chameleon Ramps · <a class="site" href="https://www.chameleonramps.com">chameleonramps.com</a><span class="right">Malibu, CA</span></p>
  <ul>
    <li>Designed 40+ products and developed a proprietary casting process that cut material waste ~30%</li>
    <li>Ran a design-test-refine loop across 4–6 prototype generations per product; 1358 orders fulfilled, $50,000+ revenue</li>
  </ul>
</div>
<div class="entry">
  <div class="row"><span class="role">CEO &amp; Founder</span><span class="when">Jun 2026 – Present</span></div>
  <p class="org"><a class="site plain" href="https://www.campusnative.com">Campus Native</a><span class="right">San Luis Obispo, CA</span></p>
  <ul>
    <li>Founded and ran a digital marketplace connecting students with campus tour guides</li>
    <li>Recruited a 4-person intern team across engineering, marketing, and content; set their priorities, reviewed their work, led the build of the listing and booking flow</li>
  </ul>
</div>
<!-- ADI was cut from this page as "marketing, not engineering evidence". It is
     BACK as of 2026-09-14 for one reason only: it is the sponsor of the
     Secret clearance, and a clearance with no employer attached to it is
     unverifiable and reads as padding. The bullet is the clearance and nothing
     else, which is what earns the line back. Title is Data Analyst as of
     2026-09-14 (was Digital Media Manager). Clearance GRANTED 2026-09-15: it
     is an active SECRET clearance, not Top Secret, and no longer "in process".
     Ashersells stays cut. -->
<div class="entry">
  <div class="row"><span class="role">Data Analyst</span><span class="when">Mar 2023 – Present</span></div>
  <p class="org">All Domain Integration (ADI) – Aerospace Engineering<span class="right">Remote</span></p>
  <ul><li><b>Active Secret security clearance</b> for work on a classified contract</li></ul>
</div>


<h2>ENGINEERING PROJECTS</h2>
<div class="entry">
  <div class="row">
    <span class="role">CNC Milled Golf Putter – Full CAD-to-Part Build</span>
    <span class="when">2024 – 2025</span>
  </div>
  <p class="org">3-Axis HAAS CNC, Fusion 360, DFM</p>
  <ul>
    <li>Designed and machined a novel putter geometry from 6061 aluminum in a single fixture, which drove the toolpath and undercut decisions; validated on PLA prototypes before cutting the production part</li>
    <li>DFM and cost analysis: modeled unit cost at $15.78 against $50–150 retail. Selected 1 of 8 finalists from 40+ students; presented at Capstone Night to 200+ alumni and industry professionals</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Wave Energy Converter – Rack &amp; Pinion Generator</span>
    <span class="when">2023</span>
  </div>
  <p class="org">Bridgeport Mill, Fusion 360, Fluid Dynamics</p>
  <ul>
    <li>Designed and machined a wave-oscillation-to-power generator with a five-person team, all parts made to tolerance in-house</li>
    <li>1st of three teams on measured output: 15 V per motor at 1:12 scale, 360 V scaled</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">SMC Trading Bot – Autonomous Options Execution</span>
    <span class="when">2025 – Present</span>
  </div>
  <p class="org">Python, Options &amp; Futures, Broker APIs, SQLite, Backtesting</p>
  <ul>
    <li>Built a Python system that places live options orders against a funded brokerage account. A misread alert becomes a real order, so every parse and order path is pinned by 2,015 regression tests; parameters selected on their worst case across two disjoint validation windows rather than their best</li>
  </ul>
</div>

<h2>TECHNICAL SKILLS</h2>
<div class="skills">
  <p><b>CAD / CAE:</b> Fusion 360 (6+ years, 40+ designs), SolidWorks, AutoCAD, Autodesk CFD</p>
  <p><b>Manufacturing:</b> 3-axis HAAS CNC machining, Bridgeport mill, lathe, FDM/SLA 3D printing, composite &amp; concrete casting</p>
  <p><b>Methods:</b> GD&amp;T, tolerance stack-up analysis, DFM, iterative prototyping, cost modeling &nbsp;·&nbsp; <b>Software:</b> Python, Git</p>
  <p><b>Certification:</b> Haas CNC Certification Program – Basic Mill Operator, online coursework completed (Haas Automation, 2026)</p>
</div>

<h2>AWARDS</h2>
<ul class="awards">
  <li><b>Capstone Finalist</b> – 1 of 8 from 40+ students, 2025 &nbsp;·&nbsp; <b>1st Place, Wave Energy Converter</b>, 2023</li>
  <li><b>President's Honors List</b> – Cal Poly, 2026 &nbsp;·&nbsp; <b>Cal Poly Honors Program</b> – selective research track</li>
  <li><b>Eagle Scout</b> – Boy Scouts of America, 2025</li>
</ul>`;

const browser = await chromium.launch();
const tab = await browser.newPage();
await tab.setContent(html, { waitUntil: "load" });
await tab.pdf({ path: OUT, format: "Letter", printBackground: true });
await browser.close();
console.log(`wrote ${OUT}${intl ? " (intl)" : ""}`);
