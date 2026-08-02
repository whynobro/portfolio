/**
 * Renders the GENERAL-PURPOSE American resume.
 *
 *   node scripts/make-cv-en.mjs
 *
 * Writes `Michael-Fischbach-Resume.pdf` to the repo root (gitignored: a build
 * output, not a source).
 *
 * There are now three documents, and they are three different genres:
 *
 *   src/assets/docs/resume.pdf     the HWA application resume. Names the
 *                                  Praktikum im Bereich Gesamtfahrzeugentwicklung,
 *                                  Affalterbach, Feb/March 2027, and states
 *                                  eligibility to intern in Germany. This is
 *                                  what the site serves to English readers,
 *                                  because the site exists for that application.
 *   src/assets/docs/resume-de.pdf  the Lebenslauf (`make-cv-de.mjs`).
 *   THIS FILE                      the general resume: same corrected facts,
 *                                  but no employer named and no visa line, so
 *                                  it suits any US employer.
 *
 * This one is deliberately NOT wired into the site. The site is the HWA
 * portfolio; handing its reader a generic resume would be a downgrade. It
 * exists for applications that are not HWA.
 *
 * FACTS ARE LOAD-BEARING. Every figure below is the corrected one from
 * CLAUDE.md, which supersedes the older resume PDFs still floating around the
 * Desktop. The ones that were wrong in earlier copies:
 *
 *   3-axis HAAS, not 4-axis   (confirmed against the capstone poster 2026-08-01)
 *   $50,000+ ramps revenue    (resume said $25k, LinkedIn $30k)
 *   1553 tests passing        (resume said 190, and "paper trading")
 *   200+ alumni, several hundred students (was "300+")
 *
 * The Net-Zero shipping container is deliberately absent: removed at Michael's
 * request 2026-07-29.
 */
import { chromium } from "playwright";

const OUT = "Michael-Fischbach-Resume.pdf";

const html = `<!doctype html><meta charset="utf-8">
<title>Michael Fischbach — Resume</title>
<style>
  /* Letter, not A4: this is the American document.
   * Sized to land on ONE page. A recruiter screening an intern resume expects
   * a single sheet, and the second page here was three bullets of overflow,
   * which reads as not knowing the convention. Tightened rather than cut: the
   * figures are the point of the document. */
  @page { size: Letter; margin: 10mm 12mm }
  * { box-sizing: border-box }
  body {
    margin: 0; font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 8.1pt; line-height: 1.26; color: #1a1a1a;
  }
  h1 { font-size: 15.5pt; margin: 0 0 .6mm; font-weight: 700; letter-spacing: .01em }
  .contact { font-size: 7.6pt; color: #333; margin: 0 0 2.6mm; line-height: 1.4 }
  .contact a { color: #1a1a1a; text-decoration: none }
  h2 {
    font-size: 7.8pt; text-transform: uppercase; letter-spacing: .09em;
    border-bottom: 1px solid #1a1a1a; padding-bottom: .6mm;
    margin: 2.4mm 0 1.3mm; font-weight: 700;
  }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm }
  .role { font-weight: 700; font-size: 8.5pt }
  .when { font-size: 7.5pt; color: #444; white-space: nowrap }
  .org { font-style: italic; color: #333; font-size: 7.9pt; margin: .2mm 0 .6mm }
  ul { margin: 0 0 1.3mm; padding-left: 3.8mm }
  li { margin: 0 0 .45mm; padding-left: .6mm }
  /* Not justified: at this measure justification opens rivers in the summary,
   * and the ragged edge is the lesser problem. */
  .summary { margin: 0 0 .8mm }
  /* Two real columns: the labels wrap otherwise and the continuation line runs
   * back under the label instead of staying in the value column. */
  .skills p {
    margin: 0 0 1.2mm; display: grid;
    grid-template-columns: 26mm 1fr; column-gap: 2mm; align-items: baseline;
  }
  .block { break-inside: avoid; page-break-inside: avoid }
</style>

<h1>Michael Fischbach</h1>
<p class="contact">
  Malibu, CA · +1 805 703 8250 · mef126906@icloud.com<br>
  <a href="https://michaelfischbach.dev">michaelfischbach.dev</a> ·
  <a href="https://www.linkedin.com/in/michael-fischbach/">linkedin.com/in/michael-fischbach</a>
</p>

<h2>Summary</h2>
<p class="summary">
  Mechanical Engineering student at California Polytechnic State University
  (Honors Program, 3.78 GPA) with hands-on experience from CAD model to finished
  part: tolerance stack-up analysis, 3-axis CNC machining, and testing on the
  real component. Running an independent manufacturing business since 2019 has
  meant owning the design-workshop-testing loop end to end rather than
  observing it.
</p>

<h2>Education</h2>
<div class="block">
  <div class="row">
    <span class="role">California Polytechnic State University, San Luis Obispo</span>
    <span class="when">Sep 2025 – Jun 2029</span>
  </div>
  <p class="org">B.S. Mechanical Engineering, Honors Program · GPA 3.78 · Dean's List, all three quarters</p>
  <ul>
    <li>Research-track Honors program; Learn by Doing curriculum with manufacturing, CNC machining, and design from the first year</li>
    <li>Built multi-component mechanisms (piston, Geneva wheel, CNC-machined screwdriver) with full tolerance stack-up analysis and GD&amp;T</li>
  </ul>
</div>
<div class="block">
  <div class="row">
    <span class="role">Oaks Christian School – Institute of Engineering</span>
    <span class="when">Sep 2022 – Jun 2025</span>
  </div>
  <p class="org">Engineering Pathway: six multi-month applied design projects · GPA 3.92 unweighted / 4.10 weighted</p>
</div>

<h2>Design &amp; Manufacturing Projects</h2>
<div class="block">
  <div class="row">
    <span class="role">CNC-Milled Golf Putter – full CAD-to-part build</span>
    <span class="when">2024 – 2025</span>
  </div>
  <p class="org">3-Axis HAAS · Fusion 360 · Design for Manufacturing</p>
  <ul>
    <li>Designed and machined a putter head from 6061 aluminum in <b>a single setup</b>; validated the geometry on PLA prototypes before cutting the production part</li>
    <li>DFM and cost analysis: <b>$15.78</b> modeled unit cost against $50–150 retail</li>
    <li>Selected 1 of 8 finalists from 40+ students; presented the part and process to 200+ alumni and industry professionals, and several hundred students</li>
  </ul>
</div>
<div class="block">
  <div class="row">
    <span class="role">Wave Energy Converter – rack-and-pinion generator</span>
    <span class="when">2023</span>
  </div>
  <p class="org">Bridgeport Mill · Fusion 360 · Fluid Dynamics</p>
  <ul>
    <li>Designed a wave-motion-to-electrical-power generator on a five-person team; machined all components to tolerance on a Bridgeport mill</li>
    <li><b>1st place</b> with the highest measured output of three teams: 15 V per motor at 1:12 scale, 360 V scaled</li>
    <li>Fluid-dynamic and energy-transfer analysis; full assembly modeled in Fusion 360 and AutoCAD with tolerance documentation</li>
  </ul>
</div>
<div class="block">
  <div class="row">
    <span class="role">Chameleon Ramps – product design &amp; manufacturing</span>
    <span class="when">2019 – Present</span>
  </div>
  <p class="org">Fusion 360 · Casting · Iterative Prototyping</p>
  <ul>
    <li>Designed 40+ products over six years and developed a proprietary casting process that cut material waste roughly 30%</li>
    <li>Systematic design-test-refine loop across four to six prototype generations per product; <b>1358 orders fulfilled</b> and <b>$50,000+</b> in revenue</li>
  </ul>
</div>
<div class="block">
  <div class="row">
    <span class="role">Autonomous Execution System</span>
    <span class="when">2025 – Present</span>
  </div>
  <p class="org">Python · Real-Time Data · SQLite · Backtesting</p>
  <ul>
    <li>Built a Python system that ingests real-time data feeds and executes decisions through an external API, with risk limits, state persistence, and a custom backtesting harness</li>
    <li><b>1553 tests passing</b> in production; parameters selected on their <b>worst case</b> across two disjoint validation windows rather than their best</li>
  </ul>
</div>

<h2>Experience</h2>
<div class="block">
  <div class="row"><span class="role">CEO &amp; Founder</span><span class="when">Jun 2026 – Present</span></div>
  <p class="org">Campus Native · San Luis Obispo, CA</p>
  <ul><li>Founded and operate a digital marketplace; lead a four-person team across engineering, marketing, and content</li></ul>
</div>
<div class="block">
  <div class="row"><span class="role">Digital Media Manager</span><span class="when">Mar 2023 – Present</span></div>
  <p class="org">All Domain Integration (ADI), Aerospace Engineering · Remote</p>
  <ul><li>Three-year engagement with an aerospace engineering firm: website management, SEO strategy, and digital communications</li></ul>
</div>
<div class="block">
  <div class="row"><span class="role">Business Partner</span><span class="when">May 2023 – Jul 2024</span></div>
  <p class="org">Ashersells LLC · Malibu, CA</p>
  <ul><li>Helped scale operations past $500,000 in annual revenue; built Python automation for logistics and order processing</li></ul>
</div>

<h2>Technical Skills</h2>
<div class="skills block">
  <p><b>CAD / CAE:</b> Fusion 360 (6+ years, 40+ designs), SolidWorks, AutoCAD, Autodesk CFD</p>
  <p><b>Manufacturing:</b> 3-axis HAAS CNC machining, Bridgeport mill, lathe, FDM/SLA 3D printing, composite and concrete casting</p>
  <p><b>Methods:</b> GD&amp;T, tolerance stack-up analysis, DFM/DFA, rapid iterative prototyping, design-test-refine, cost modeling</p>
  <p><b>Software:</b> Python, HTML/CSS, Git</p>
  <p><b>Languages:</b> English (native), German (beginner, actively learning)</p>
</div>

<h2>Leadership &amp; Awards</h2>
<div class="block">
  <ul>
    <li><b>Cal Poly Honors Program</b> – admitted Fall 2026; selective research-focused program with faculty mentorship</li>
    <li><b>Eagle Scout</b> – Boy Scouts of America (2025); Senior Patrol Leader two years, 15 years in the program</li>
    <li><b>Dean's List</b> – Cal Poly SLO, all three quarters 2025–26 · <b>1st place, noodle bridge competition</b>, won by a 38.5% margin</li>
    <li><b>Internationally mobile</b> – U.S. Air Force family, nine relocations across seven states · community meal service for the unhoused since 2021</li>
  </ul>
</div>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: OUT, format: "Letter", printBackground: true });
await browser.close();
console.log(`wrote ${OUT}`);
