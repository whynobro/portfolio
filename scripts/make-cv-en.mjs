/**
 * Renders the three English resumes.
 *
 *   node scripts/make-cv-en.mjs              all three
 *   node scripts/make-cv-en.mjs --only=us    just the domestic one
 *   node scripts/make-cv-en.mjs --only=intl  just the abroad one
 *   node scripts/make-cv-en.mjs --only=hwa   just the HWA one
 *
 * Writes to the repo root (gitignored: build outputs, not sources):
 *
 *   Michael-Fischbach-Resume.pdf           US applications
 *   Michael-Fischbach-Resume-Abroad.pdf    internships outside the US
 *   Michael-Fischbach-Resume-HWA.pdf       the HWA AG application
 *
 * All three differ in exactly two places, the objective and the
 * work-eligibility line, and are otherwise the same document. Everything else
 * is shared so the figures cannot drift apart between them, which is the whole
 * point of generating rather than hand-editing three PDFs.
 *
 * The US and abroad versions name NO employer. Only the HWA one does, and only
 * it is served by the site: copy `Michael-Fischbach-Resume-HWA.pdf` over
 * `src/assets/docs/resume.pdf` after regenerating, exactly as the Lebenslauf
 * requires. Nothing does that automatically. Do not point the site at the
 * other two.
 *
 * LAYOUT follows the existing `resume.pdf` deliberately: centred name, a rule
 * under each section heading, entries indented from that rule with the date
 * flush right. An earlier pass here invented a different layout and then shrank
 * the type to 8.1pt to force one page, which is how you get a resume nobody
 * wants to read. Type size is fixed at a readable 10pt and the document runs to
 * two pages if it needs to. Two readable pages beat one dense one.
 *
 * FACTS ARE LOAD-BEARING. Figures are the corrected ones from CLAUDE.md, which
 * supersede older resume PDFs still floating around:
 *
 *   3-axis HAAS, not 4-axis   (confirmed against the capstone poster 2026-08-01)
 *   $50,000+ ramps revenue    (an older resume said $25k, LinkedIn $30k)
 *   1553 tests passing        (an older resume said 190, and "paper trading")
 *   200+ alumni, several hundred students (was "300+")
 *
 * The putter's cost saving is stated as "$15.78 vs. $50-150 retail" and NEVER
 * as a percentage. The old "(533% reduction)" was arithmetically impossible: a
 * reduction cannot exceed 100%, and 533% was the markup running the other way.
 * Retired 2026-08-02. Do not reintroduce it in any form.
 *
 * The Net-Zero shipping container is deliberately absent: removed 2026-07-29.
 */
import { chromium } from "playwright";

/** The objective and eligibility line are the ONLY per-variant copy. */
const VARIANTS = {
  us: {
    out: "Michael-Fischbach-Resume.pdf",
    eligibility: "Malibu, CA",
    objective: `Mechanical Engineering student (Cal Poly Honors, 3.78 GPA) seeking a
      mechanical design or manufacturing internship. Hands-on CAD-to-part experience across
      3-axis CNC machining, prototyping, tolerance analysis, and iterative real-world testing.
      Has run an independent manufacturing business since 2019, so the design-workshop-testing
      loop is something owned end to end rather than observed.`,
  },
  intl: {
    out: "Michael-Fischbach-Resume-Abroad.pdf",
    eligibility: "Malibu, CA | U.S. Citizen | eligible for study-related internship visas",
    objective: `Mechanical Engineering student (Cal Poly Honors, 3.78 GPA) seeking an
      international mechanical design or manufacturing internship. Hands-on CAD-to-part
      experience across 3-axis CNC machining, prototyping, tolerance analysis, and iterative
      real-world testing. Has run an independent manufacturing business since 2019, so the
      design-workshop-testing loop is something owned end to end rather than observed. Grew up
      in a U.S. Air Force family across nine relocations, and settles into new teams and
      countries quickly.`,
  },
  /**
   * The HWA application resume. This one IS served by the site, so its output
   * must be copied over `src/assets/docs/resume.pdf` after regenerating (the
   * same manual step the Lebenslauf has).
   *
   * It was a hand-made ReportLab PDF with no generator until 2026-08-02, which
   * is why retiring one wrong figure from it meant rebuilding it here. Keeping
   * it in this file means the three English resumes now share one template and
   * one set of figures.
   */
  hwa: {
    out: "Michael-Fischbach-Resume-HWA.pdf",
    eligibility: "Malibu, CA | U.S. Citizen (eligible for EU internship visa)",
    objective: `Mechanical Engineering student (Cal Poly Honors, 3.78 GPA) seeking the
      <b>Praktikum im Bereich Gesamtfahrzeugentwicklung</b> at HWA AG (Affalterbach, from
      Feb/March 2027). Hands-on CAD-to-part experience across 3-axis CNC machining,
      prototyping, tolerance analysis, and iterative real-world testing, the same
      design-workshop-testing loop HWA runs on the EVO and its customer racing programs.
      Eligible to intern in Germany.`,
  },
};

const page = (v) => `<!doctype html><meta charset="utf-8">
<title>Michael Fischbach — Resume</title>
<style>
  @page { size: Letter; margin: 14mm 15mm }
  * { box-sizing: border-box }
  body {
    margin: 0; font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 10pt; line-height: 1.4; color: #000;
  }
  h1 {
    font-size: 21pt; margin: 0 0 2mm; font-weight: 700;
    text-align: center; letter-spacing: .01em;
  }
  .contact { font-size: 9pt; text-align: center; margin: 0 0 4mm; line-height: 1.45 }
  /* Real anchors, so Chromium writes /Annots link objects into the PDF and the
   * reader can click them. Left in the body colour rather than browser blue:
   * a resume that renders blue underlines looks like a web page. The URL text
   * itself is the affordance for anyone reading it on paper. */
  .contact a { color: inherit; text-decoration: none }
  h2 {
    font-size: 11pt; font-weight: 700; margin: 4mm 0 1.6mm;
    border-bottom: 1.2px solid #000; padding-bottom: 1mm;
  }
  /* Entries sit indented from the section rule, which is what gives this
   * layout its structure. The date rides flush right on the title line. */
  .entry { margin: 0 0 2.6mm 5mm; break-inside: avoid; page-break-inside: avoid }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 8mm }
  .role { font-weight: 700; font-size: 10.5pt }
  .when { font-size: 9.5pt; white-space: nowrap }
  .org { font-style: italic; font-size: 9.5pt; margin: .3mm 0 1mm }
  .org .right { float: right; font-style: italic }
  ul { margin: 0; padding: 0; list-style: none }
  li { margin: 0 0 .9mm; padding-left: 3.4mm; text-indent: -3.4mm }
  li::before { content: "• " }
  .objective { margin: 0 0 1mm }
  .skills p { margin: 0 0 1mm }
  .profile { margin-left: 5mm }
</style>

<h1>Michael Fischbach</h1>
<p class="contact">
  805-703-8250 | <a href="mailto:mef126906@icloud.com">mef126906@icloud.com</a> |
  <a href="https://www.linkedin.com/in/michael-fischbach/">LinkedIn</a> |
  <a href="https://michaelfischbach.dev">michaelfischbach.dev</a><br>${v.eligibility}
</p>

<h2>OBJECTIVE</h2>
<p class="objective">${v.objective}</p>

<h2>EDUCATION</h2>
<div class="entry">
  <div class="row">
    <span class="role">California Polytechnic State University, San Luis Obispo</span>
    <span class="when">Sep 2025 – Jun 2029</span>
  </div>
  <p class="org">B.S. Mechanical Engineering, Honors Program | GPA: 3.78 | Dean's List: Fall, Winter, Spring</p>
  <ul>
    <li>Honors research-track program; Learn by Doing curriculum with hands-on manufacturing, CNC machining, and design from first year</li>
    <li>Built multi-component mechanisms (piston, Geneva wheel, CNC-machined screwdriver) with full tolerance stack-up analysis and GD&amp;T</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Oaks Christian School – Institute of Engineering</span>
    <span class="when">Sep 2022 – Jun 2025</span>
  </div>
  <p class="org">Engineering Pathway: 6 multi-month applied design projects | GPA: 3.92 UW / 4.10 W</p>
</div>

<h2>TECHNICAL SKILLS</h2>
<div class="skills">
  <p><b>CAD / CAE:</b> Fusion 360 (6+ years, 40+ designs), SolidWorks, AutoCAD, Autodesk CFD</p>
  <p><b>Manufacturing:</b> 3-axis HAAS CNC machining, Bridgeport mill, lathe, FDM/SLA 3D printing, carbon-analog composite &amp; concrete casting</p>
  <p><b>Methods:</b> GD&amp;T, tolerance stack-up analysis, DFM/DFA, rapid iterative prototyping, design-test-refine, cost modeling</p>
  <p><b>Software:</b> Python, HTML/CSS, Git</p>
  <p><b>Languages:</b> English (native); German (beginner, actively learning)</p>
</div>

<h2>MANUFACTURING &amp; PROTOTYPING PROJECTS</h2>
<div class="entry">
  <div class="row">
    <span class="role">CNC Milled Golf Putter – Full CAD-to-Part Build</span>
    <span class="when">2024 – 2025</span>
  </div>
  <p class="org">3-Axis HAAS CNC, Fusion 360, DFM</p>
  <ul>
    <li>Designed and machined a novel putter geometry from 6061 aluminum on a 3-axis HAAS CNC; ran iterative PLA prototypes to validate geometry before the final aluminum production part</li>
    <li>Performed DFM and cost analysis: modeled warehouse-scale unit cost at $15.78 vs. $50–150 retail</li>
    <li>Selected 1 of 8 finalists from 40+ students; presented the build and process at Capstone Night to 200+ alumni and industry professionals and several hundred students</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Wave Energy Converter – Rack &amp; Pinion Generator</span>
    <span class="when">2023</span>
  </div>
  <p class="org">Bridgeport Mill, Fusion 360, Fluid Dynamics</p>
  <ul>
    <li>Designed and machined a wave-oscillation-to-electrical-power generator with a five-person team; manufactured all components to tolerance on a Bridgeport mill</li>
    <li>Took 1st place with the highest measured output of three teams: 15 V per motor at 1:12 scale, 360 V scaled</li>
    <li>Applied fluid dynamics and energy-transfer analysis; modeled the full assembly in Fusion 360 and AutoCAD with tolerance documentation</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Chameleon Ramps – Product Design &amp; Manufacturing</span>
    <span class="when">2019 – Present</span>
  </div>
  <p class="org">Fusion 360, Casting, Iterative Prototyping</p>
  <ul>
    <li>6-year iterative development program: designed 40+ unique products and developed proprietary casting techniques, reducing material waste ~30%</li>
    <li>Ran a systematic design-test-refine loop across 4–6 prototype generations per product; 1358 orders fulfilled and $50,000+ in revenue</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Autonomous Execution System</span>
    <span class="when">2025 – Present</span>
  </div>
  <p class="org">Python, Real-Time Data, SQLite, Backtesting</p>
  <ul>
    <li>Built an autonomous Python system that ingests real-time data feeds and executes decisions through an external API, with risk limits, state persistence, and a custom backtesting harness</li>
    <li><b>1553 tests passing</b> in production; parameters selected on their worst case across two disjoint validation windows rather than their best</li>
  </ul>
</div>

<h2>EXPERIENCE</h2>
<div class="entry">
  <div class="row"><span class="role">CEO &amp; Founder</span><span class="when">Jun 2026 – Present</span></div>
  <p class="org">Campus Native<span class="right">San Luis Obispo, CA</span></p>
  <ul><li>Founded and operate a digital marketplace; lead a 4-person intern team across engineering, marketing, and content</li></ul>
</div>
<div class="entry">
  <div class="row"><span class="role">Digital Media Manager</span><span class="when">Mar 2023 – Present</span></div>
  <p class="org">All Domain Integration (ADI) – Aerospace Engineering<span class="right">Remote</span></p>
  <ul><li>3+ year engagement with an aerospace engineering firm: website management, SEO strategy, and digital communications</li></ul>
</div>
<div class="entry">
  <div class="row"><span class="role">Business Partner</span><span class="when">May 2023 – Jul 2024</span></div>
  <p class="org">Ashersells LLC<span class="right">Malibu, CA</span></p>
  <ul><li>Helped scale operations to $500,000+ annual revenue; built Python automation for logistics and order processing</li></ul>
</div>

<h2>LEADERSHIP &amp; INTERNATIONAL PROFILE</h2>
<ul class="profile">
  <li><b>Cal Poly Honors Program</b> – Admitted Fall 2026; selective research-focused program with faculty mentorship</li>
  <li><b>Eagle Scout</b> – Boy Scouts of America (2025); Eagle rank, Senior Patrol Leader 2 years; 15 years leadership</li>
  <li><b>Dean's List</b> – Cal Poly SLO, all three quarters (Fall / Winter / Spring 2025–26)</li>
  <li><b>1st Place, Noodle Bridge Competition</b> – won by a 38.5% margin</li>
  <li><b>Internationally Mobile</b> – U.S. Air Force family; 9 relocations across 7 states and territories; adapts quickly to new environments and teams</li>
  <li><b>Community Service</b> – 4+ years bimonthly meal service to unhoused community; 2021–present</li>
</ul>`;

const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];
const picked = only ? { [only]: VARIANTS[only] } : VARIANTS;
if (only && !VARIANTS[only]) {
  console.error(`unknown variant "${only}" (expected: ${Object.keys(VARIANTS).join(", ")})`);
  process.exit(1);
}

const browser = await chromium.launch();
for (const [name, v] of Object.entries(picked)) {
  const tab = await browser.newPage();
  await tab.setContent(page(v), { waitUntil: "load" });
  await tab.pdf({ path: v.out, format: "Letter", printBackground: true });
  await tab.close();
  console.log(`wrote ${v.out} (${name})`);
}
await browser.close();
