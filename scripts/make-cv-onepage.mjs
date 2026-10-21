/**
 * Renders the ONE-PAGE resume: the strongest subset, on a single sheet.
 *
 *   node scripts/make-cv-onepage.mjs
 *   node scripts/make-cv-onepage.mjs --lang=intl   (adds the visa line)
 *
 * Writes `Michael-Fischbach-Resume-1Page.pdf` to the repo root (gitignored).
 * The site serves a manual copy of it at `src/assets/docs/resume.pdf`.
 *
 * CONTENT AUTHORITY. This page reproduces Michael's current one-page resume
 * (Career/Up To Date Files, Michael-Fischbach-Resume.pdf/.docx, 2026-10-17):
 * same sections, same order, same bullets, with these corrections applied on
 * 2026-10-21, which override that file:
 *
 *   GPA 3.79              transcript shows 3.786 (the Oct 17 file said 3.80)
 *   Expected May 2028     earlier versions said May 2029 or Jun
 *   Coursework            completed vs. in progress stated honestly; Dynamics
 *                         is NOT taken yet (Spring 2027), so it is absent
 *   Wave energy           120 V is the 1:12 prototype (15 V per motor), 360 V
 *                         the full-scale projection; never "full-scale
 *                         performance at 120 V"
 *
 * Rules from the master content pool that bind this page: the clearance is
 * "in process" and "SCI eligible", never granted or "Active Secret"; the Haas
 * line is coursework, never "Haas Certified Machinist"; the WERC efficiency
 * and gap figures are TARGETS, never results; the putter cost is two dollar
 * figures, never a percentage.
 *
 * WHY A SEPARATE SCRIPT from `make-cv-en.mjs`: this document differs in its
 * CONTENT (it drops whole entries), not just its objective.
 *
 * IT IS FULL. At 10.5pt Times it fills the page with little to spare. Anything
 * added needs something cut; never shrink the type to make room.
 */
import { chromium } from "playwright";
import { PORTFOLIO_GENERAL, PORTFOLIO_TEXT } from "./portfolio-link.mjs";

const OUT = "Michael-Fischbach-Resume-1Page.pdf";
const intl = process.argv.includes("--lang=intl");

/**
 * The header's second line: the clearance status (worded exactly as the
 * master requires, never dropping the parenthetical) and, abroad, the visa
 * line.
 */
const eligibility = intl
  ? "Top Secret Clearance (In Process) | SCI Eligible | U.S. Citizen, eligible for study-related internship visas"
  : "Top Secret Clearance (In Process) | SCI Eligible | Malibu, CA";

const html = `<!doctype html><meta charset="utf-8">
<title>Michael Fischbach, Resume</title>
<style>
  @page { size: Letter; margin: 10mm 12mm }
  * { box-sizing: border-box }
  body {
    margin: 0; font-family: "Times New Roman", Times, serif;
    font-size: 10.5pt; line-height: 1.24; color: #000;
  }
  h1 { font-size: 19pt; margin: 0 0 1mm; font-weight: 700; text-align: center }
  .contact { font-size: 9.5pt; text-align: center; margin: 0 0 1mm; line-height: 1.3 }
  /* Its OWN centred block, not a <br> inside .contact, so it takes a real
     margin matching the h1's 1mm. */
  .location { font-size: 9.5pt; text-align: center; margin: 0 0 2.2mm; line-height: 1.3 }
  /* Links are BLACK with an underline: real anchors (clickable /Annots in the
   * PDF), one print colour, the underline marking them as links. */
  .contact a { color: #000; text-decoration: underline }
  /* The phone is underlined to match the links beside it but is NOT an
   * anchor: tel: does nothing in a desktop PDF reader.
   * NOTE: no backticks in this block, the whole page is a template literal. */
  .contact .tel { text-decoration: underline }
  /* Chameleon Ramps links to its live site. The title line shows no domain,
     so the link is clickable but not underlined: an underline would mark a
     link whose target the line never states. */
  a.site { color: #000; text-decoration: underline }
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
  ul { margin: 0; padding: 0; list-style: none }
  li { margin: 0 0 .45mm; padding-left: 3.2mm; text-indent: -3.2mm }
  li::before { content: "• " }
  .skills p { margin: 0 0 .45mm }
  .interests { text-align: center; margin: 0 }
  .interests p { margin: 0 0 .3mm }
</style>

<h1>Michael Fischbach</h1>
<p class="contact">
  <span class="tel">805-703-8250</span> |
  <a href="mailto:mef126906@icloud.com">mef126906@icloud.com</a> |
  <a href="https://www.linkedin.com/in/mefisch/">www.linkedin.com/in/mefisch</a> |
  <a href="${PORTFOLIO_GENERAL}">${PORTFOLIO_TEXT}</a>
</p>
<p class="location">${eligibility}</p>

<h2>EXPERIENCE</h2>
<div class="entry">
  <div class="row">
    <span class="role">WERC Design Contest Team Lead – NASA Artemis Wireless Capacitive Charger</span>
    <span class="when">2026 – Present</span>
  </div>
  <ul>
    <li>Lead a 12-person graduate/undergraduate team developing a 1 kW capacitive charger for NASA's Artemis lunar rover</li>
    <li>Set schedule and integrate power, coupler, controls, and structures; develop plate-based alignment sensing for rover docking</li>
    <li>Targets: 80%+ efficiency across a 100 mm gap at full scale, 25 W at 70%+ on the bench; dust, vacuum, -203°C to 54°C</li>
  </ul>
</div>
<!-- The clearance leads in bold: the one sanctioned content exception to
     "bold is structure". Submitted / in process only, never granted. -->
<div class="entry">
  <div class="row">
    <span class="role">All Domain Integration – Mechanical Engineering Intern</span>
    <span class="when">2025 – Present</span>
  </div>
  <ul>
    <li><b>SCI eligible · Submitted for Top Secret clearance</b></li>
    <li>Support mission systems engineers on Space Force and Air Force efforts as part of a SETA contractor team</li>
    <li>Use locally hosted large language models (LLMs) to analyze satellite sensor data and draw knowledge-based conclusions</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role"><a class="site plain" href="https://www.chameleonramps.com">Chameleon Ramps</a> – Founder &amp; CEO</span>
    <span class="when">2019 – 2026</span>
  </div>
  <ul>
    <li>Designed 40+ concrete fingerboard obstacles ($10–$50 each); proprietary molding process cut material waste ~40%</li>
    <li>Generated $39,600 in revenue across 627 orders by running a design-test-refine loop of 4–6 prototype generations per product, modeling in Fusion 360 and 3D printing prototypes to build robust, reusable molds for repeat production</li>
    <li>Grew revenue 30% via a 7-creator sponsorship program; co-designed Recycled Ramps collaboration; shipped to 15 countries</li>
  </ul>
</div>

<h2>EDUCATION</h2>
<div class="entry">
  <div class="row">
    <span class="role">California Polytechnic State University, San Luis Obispo</span>
    <span class="when">Sep 2025 – Expected May 2028</span>
  </div>
  <!-- Keep GPA and dates identical to the CV's: a figure that differs between
       the two documents is the thing a reader notices. -->
  <p class="org">B.S. Mechanical Engineering, Honors Program | GPA 3.79 | Cal Poly Golf Engineers &amp; Agentic Engineering</p>
  <p class="org">Coursework: Subtractive Manufacturing, Materials Joining, Materials Engineering; in progress: Statics, Solid Modeling</p>
  <ul>
    <li>Designed a low-cost, accessible door handle for one-handed users in Cal Poly's Red Brick dorms; PLA base, TPU head</li>
    <li>Built multi-component mechanisms (piston, Geneva wheel, CNC-machined screwdriver) with tolerance stack-up and GD&amp;T</li>
  </ul>
</div>

<h2>ENGINEERING PROJECTS</h2>
<div class="entry">
  <div class="row">
    <span class="role">CNC-Milled Golf Putter – Full CAD-to-Part Build</span>
    <span class="when">2025</span>
  </div>
  <p class="org">3-axis Haas CNC, Fusion 360, DFM</p>
  <ul>
    <li>Designed and machined a novel putter from 6061 in two ops with adaptive toolpaths validated with 12 PLA prototypes</li>
    <li>Modeled unit cost at $18.56 vs. $250 retail; 1 of 8 finalists (40+ students), presented to 200+ alumni at Capstone Night</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Apricot Lane Farms – Net-Zero Carbon Shipping Container Space</span>
    <span class="when">2024</span>
  </div>
  <ul>
    <li>Selected as 1 of 3 students to design a net-zero carbon workspace for Apricot Lane Farms; farm chose the L-shaped design</li>
    <li>Analyzed structural integrity of container walls with cutouts and roof overhang; assessed solar power needs with the farmers</li>
    <li>Drafted the floor plan in AutoCAD with an ADA-accessible restroom and incinerating toilet; built a 1:10-scale model</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Wave Energy Converter – Team Lead</span>
    <span class="when">2023</span>
  </div>
  <p class="org">Bridgeport mill, Fusion 360, fluid dynamics</p>
  <ul>
    <li>Led a five-person team to 1st of five teams, designing and machining a 1:12-scale rack-and-pinion converter, all parts made to tolerance in-house; prototype produced 120 V at 1:12 scale (15 V per motor), projecting 360 V at full scale</li>
  </ul>
</div>

<h2>TECHNICAL SKILLS</h2>
<div class="skills">
  <p><b>CAD / CAE:</b> Fusion 360 (6+ years, 55+ designs), SolidWorks (2+ years), AutoCAD, Autodesk CFD</p>
  <p><b>Manufacturing:</b> 3-axis Haas CNC machining, Bridgeport mill, lathe, FDM/SLA 3D printing, composite &amp; concrete casting</p>
  <p><b>Methods:</b> GD&amp;T (ASME Y14.5), DFM, tolerance stack-up analysis, iterative prototyping, cost modeling</p>
  <p><b>AI:</b> Claude Code, Codex, and Gemini via agentic workflows in Antigravity IDE | <b>Software:</b> Python, Git, MATLAB, Linux</p>
  <p><b>Certification:</b> Haas CNC Certification Program – Basic Mill Operator, online coursework completed (Haas Automation, 2026)</p>
</div>

<h2>INTERESTS</h2>
<div class="interests">
  <p><b>Backpacking</b> – 500 mi | <b>Senior Patrol Leader &amp; Eagle Scout</b> – BSA, 2025 | <b>Weightlifting</b> – 355 lb squat</p>
  <p><b>Channel Islands Rowing Club</b> – 8 podium placements | <b>Poker</b> – Cal Poly Poker Tournament 3rd of 126</p>
  <p><b>Watercolor/Drawing</b> – 3 contest wins | <b>Volunteering</b> – Meal Outreach (5+ years, St. Aidan's Church)</p>
</div>`;

const browser = await chromium.launch();
const tab = await browser.newPage();
await tab.setContent(html, { waitUntil: "load" });
await tab.pdf({ path: OUT, format: "Letter", printBackground: true });
await browser.close();
console.log(`wrote ${OUT}${intl ? " (intl)" : ""}`);
