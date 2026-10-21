/**
 * Renders the three English CVs (the LONG documents, at most two pages).
 *
 *   node scripts/make-cv-en.mjs              all three
 *   node scripts/make-cv-en.mjs --only=us    just the domestic one
 *   node scripts/make-cv-en.mjs --only=intl  just the abroad one
 *   node scripts/make-cv-en.mjs --only=hwa   just the HWA one
 *
 * Writes to the repo root (gitignored: build outputs, not sources):
 *
 *   Michael-Fischbach-CV.pdf           US applications
 *   Michael-Fischbach-CV-Abroad.pdf    internships outside the US
 *   Michael-Fischbach-CV-HWA.pdf       the HWA AG application
 *
 * NAMED "CV", NOT "RESUME": these are the two-page long-form documents;
 * `make-cv-onepage.mjs` builds the one-page RESUME, the default send. The
 * filename is the only thing telling them apart in a downloads folder.
 *
 * The three differ only in the objective, the header's second line and the
 * portfolio target (now the site root for all three, see
 * `scripts/portfolio-link.mjs`). Everything else is shared so the figures
 * cannot drift apart.
 *
 * The site serves a MANUAL copy of the US one:
 *
 *   Michael-Fischbach-CV.pdf -> src/assets/docs/cv.pdf
 *
 * CONTENT AUTHORITY. Entries and figures follow the master content pool
 * (Career/Resumes, Master Resume, 2026-10-16) and the current one-page resume
 * (2026-10-17), with the corrections of 2026-10-21 applied on top: GPA 3.79
 * (transcript 3.786), Expected May 2028, coursework split into completed and
 * in progress (Dynamics is not taken yet, so it is absent), and the wave
 * converter's 120 V stated as the 1:12 prototype with 360 V as the full-scale
 * projection.
 *
 * The master's rules bind this file:
 *   - Clearance is "in process" / "submitted" and "SCI eligible". Never
 *     "Active Secret", never granted, never past tense.
 *   - Haas is "online coursework completed", never "Haas Certified Machinist".
 *   - WERC efficiency and gap figures are TARGETS, never results.
 *   - Dean's List and President's Honors List never appear together; this
 *     file uses President's alone.
 *   - The Chameleon Ramps sponsorship program is never "managed a team of 7".
 *   - The putter cost is two dollar figures, never a percentage.
 *   - The bot's test count never appears bare, and no account state is shown.
 *
 * CUT for length (two pages max), per the master's guidance for a mechanical
 * design/manufacturing document: the SMC Trading Bot (weakest entry for
 * mechanical roles), Ashersells (cut for pure mechanical), and Rowing (needs
 * dates and level before it goes on a sent document). Restore from the master
 * for a software or operations posting.
 *
 * LAYOUT: centred name, a rule under each section heading, entries indented
 * from the rule with the date flush right, Times New Roman at 10.5pt (the
 * floor). If it runs long, cut content; never shrink the type.
 */
import { chromium } from "playwright";
import { PORTFOLIO_GENERAL, PORTFOLIO_HWA, PORTFOLIO_TEXT } from "./portfolio-link.mjs";

/** The objective, header line and portfolio target are the ONLY per-variant copy. */
const VARIANTS = {
  us: {
    out: "Michael-Fischbach-CV.pdf",
    eligibility: "Top Secret Clearance (In Process) | SCI Eligible | Malibu, CA",
    portfolio: PORTFOLIO_GENERAL,
    objective: `Mechanical Engineering student (Cal Poly Honors, 3.79 GPA) seeking a
      mechanical design or manufacturing internship. Hands-on CAD-to-part experience across
      3-axis CNC machining, prototyping, tolerance analysis, and iterative real-world testing.
      Ran an independent manufacturing business from 2019 to 2026, so the
      design-workshop-testing loop is something owned end to end rather than observed.`,
  },
  intl: {
    out: "Michael-Fischbach-CV-Abroad.pdf",
    eligibility: "Malibu, CA | U.S. Citizen | eligible for study-related internship visas",
    portfolio: PORTFOLIO_GENERAL,
    objective: `Mechanical Engineering student (Cal Poly Honors, 3.79 GPA) seeking an
      international mechanical design or manufacturing internship. Hands-on CAD-to-part
      experience across 3-axis CNC machining, prototyping, tolerance analysis, and iterative
      real-world testing. Ran an independent manufacturing business from 2019 to 2026, so the
      design-workshop-testing loop is something owned end to end rather than observed. Grew up
      in a U.S. Air Force family across nine relocations, and settles into new teams and
      countries quickly.`,
  },
  /** The HWA AG application CV. Names the posting, so it is the only one that does. */
  hwa: {
    out: "Michael-Fischbach-CV-HWA.pdf",
    eligibility: "Malibu, CA | U.S. Citizen (eligible for EU internship visa)",
    portfolio: PORTFOLIO_HWA,
    objective: `Mechanical Engineering student (Cal Poly Honors, 3.79 GPA) seeking the
      <b>Praktikum im Bereich Gesamtfahrzeugentwicklung</b> at HWA AG (Affalterbach, from
      Feb/March 2027). Hands-on CAD-to-part experience across 3-axis CNC machining,
      prototyping, tolerance analysis, and iterative real-world testing, the same
      design-workshop-testing loop HWA runs on the EVO and its customer racing programs.
      Eligible to intern in Germany.`,
  },
};

const page = (v) => `<!doctype html><meta charset="utf-8">
<title>Michael Fischbach, CV</title>
<style>
  @page { size: Letter; margin: 11mm 13mm }
  * { box-sizing: border-box }
  body {
    margin: 0; font-family: "Times New Roman", Times, serif;
    font-size: 10.5pt; line-height: 1.28; color: #000;
  }
  h1 {
    font-size: 20pt; margin: 0 0 1.2mm; font-weight: 700;
    text-align: center; letter-spacing: .01em;
  }
  .contact { font-size: 9.5pt; text-align: center; margin: 0 0 1.2mm; line-height: 1.3 }
  /* Own centred block rather than a <br> inside .contact, so it can take a
     real margin: set to the h1's 1.2mm so the two header gaps match. */
  .location { font-size: 9.5pt; text-align: center; margin: 0 0 2.6mm; line-height: 1.3 }
  /* Real anchors (clickable /Annots in the PDF), BLACK with an underline so
   * the document prints as one colour while the underline marks the links. */
  .contact a { color: #000; text-decoration: underline }
  /* The phone is underlined to match the links beside it but is NOT an
   * anchor: tel: does nothing in the desktop PDF readers a recruiter uses.
   * NOTE: no backticks in this block, the whole page is a template literal. */
  .contact .tel { text-decoration: underline }
  /* The two companies link to their live sites, shown by domain. */
  a.site { color: #000; text-decoration: underline }
  h2 {
    font-size: 11.5pt; font-weight: 700; margin: 2.6mm 0 1.1mm;
    border-bottom: 1px solid #000; padding-bottom: .6mm;
  }
  .entry { margin: 0 0 1.7mm 4mm; break-inside: avoid; page-break-inside: avoid }
  h2 { break-after: avoid; page-break-after: avoid }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 8mm }
  .role { font-weight: 700; font-size: 11pt }
  .when { font-size: 10pt; white-space: nowrap }
  .org { font-style: italic; font-size: 10pt; margin: .2mm 0 .6mm }
  .org .right { float: right; font-style: italic }
  ul { margin: 0; padding: 0; list-style: none }
  li { margin: 0 0 .5mm; padding-left: 3.2mm; text-indent: -3.2mm }
  li::before { content: "• " }
  .objective { margin: 0 0 1mm }
  .skills p { margin: 0 0 .5mm }
  .profile { margin-left: 4mm }
  .interests { margin: 0 0 0 4mm }
  .interests .i { white-space: nowrap }
</style>

<h1>Michael Fischbach</h1>
<p class="contact">
  <span class="tel">805-703-8250</span> |
  <a href="mailto:mef126906@icloud.com">mef126906@icloud.com</a> |
  <a href="https://www.linkedin.com/in/mefisch/">www.linkedin.com/in/mefisch</a> |
  <a href="${v.portfolio}">${PORTFOLIO_TEXT}</a>
</p>
<p class="location">${v.eligibility}</p>

<h2>OBJECTIVE</h2>
<p class="objective">${v.objective}</p>

<h2>EDUCATION</h2>
<div class="entry">
  <div class="row">
    <span class="role">California Polytechnic State University, San Luis Obispo</span>
    <span class="when">Sep 2025 – Expected May 2028</span>
  </div>
  <p class="org">B.S. Mechanical Engineering, Honors Program | GPA: 3.79 | Cal Poly Golf Engineers &amp; Agentic Engineering</p>
  <p class="org">Coursework: Subtractive Manufacturing (IME 145/146), Materials Joining, Materials Engineering with lab; in progress (Fall 2026): Statics, Design Using Solid Modeling (SolidWorks), Applied Programming for ME</p>
  <ul>
    <li>Honors research-track program; Learn by Doing curriculum with hands-on manufacturing, CNC machining, and design from first year</li>
    <li>Built multi-component mechanisms (piston, Geneva wheel, CNC-machined screwdriver) with tolerance stack-up analysis and GD&amp;T</li>
    <li>Designed a low-cost, accessible door handle for one-handed users in Cal Poly's Red Brick dorms; PLA base, TPU head</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Oaks Christian School – Institute of Engineering</span>
    <span class="when">Sep 2022 – Jun 2025</span>
  </div>
  <p class="org">Engineering Pathway: 6 multi-month applied design projects | GPA: 3.92 UW / 4.10 W<span class="right">Malibu, CA</span></p>
</div>

<h2>EXPERIENCE</h2>
<div class="entry">
  <div class="row">
    <span class="role">WERC Design Contest Team Lead – NASA Artemis Wireless Capacitive Charger</span>
    <span class="when">2026 – Present</span>
  </div>
  <p class="org">Cal Poly SLO<span class="right">San Luis Obispo, CA</span></p>
  <ul>
    <li>Lead a 12-person graduate/undergraduate team developing a 1 kW capacitive charger for NASA's Artemis lunar rover</li>
    <li>Set schedule and integrate power, coupler, controls, and structures; develop plate-based alignment sensing for rover docking</li>
    <li>Targets: 80%+ efficiency across a 100 mm gap at full scale, 25 W at 70%+ on the bench; dust, vacuum, -203°C to 54°C</li>
  </ul>
</div>
<!-- The clearance leads in bold: the one sanctioned content exception to
     "bold is structure". Submitted / in process only, never granted. -->
<div class="entry">
  <div class="row"><span class="role">Mechanical Engineering Intern</span><span class="when">2025 – Present</span></div>
  <p class="org">All Domain Integration (ADI) – Aerospace Engineering<span class="right">Remote</span></p>
  <ul>
    <li><b>SCI eligible · Submitted for Top Secret clearance</b></li>
    <li>Support mission systems engineers on Space Force and Air Force efforts as part of a SETA contractor team</li>
    <li>Use locally hosted large language models (LLMs) to analyze satellite sensor data and draw knowledge-based conclusions</li>
  </ul>
</div>
<div class="entry">
  <div class="row"><span class="role">Founder &amp; CEO</span><span class="when">2019 – 2026</span></div>
  <p class="org">Chameleon Ramps · <a class="site" href="https://www.chameleonramps.com">chameleonramps.com</a><span class="right">Malibu, CA</span></p>
  <ul>
    <li>Designed 40+ concrete fingerboard obstacles ($10–$50 each); proprietary molding process cut material waste ~40%</li>
    <li>Generated $39,600 in revenue across 627 orders by running a design-test-refine loop of 4–6 prototype generations per product, modeling in Fusion 360 and 3D printing prototypes to build robust, reusable molds for repeat production</li>
    <li>Grew revenue 30% via a 7-creator sponsorship program; co-designed Recycled Ramps collaboration; shipped to 15 countries</li>
    <li>Cast concrete range produced entirely in-house, mold design included; the quarter pipe was the hardest mold to release, which drove a redesign of the draft angles</li>
  </ul>
</div>
<div class="entry">
  <div class="row"><span class="role">CEO &amp; Founder</span><span class="when">Jun 2026 – Present</span></div>
  <p class="org">Campus Native · <a class="site" href="https://www.campusnative.com">campusnative.com</a><span class="right">San Luis Obispo, CA</span></p>
  <ul>
    <li>Founded and ran a digital marketplace connecting students with campus tour guides</li>
    <li>Recruited a 4-person intern team across engineering, marketing, and content; set their priorities, reviewed their work, led the build of the listing and booking flow</li>
  </ul>
</div>

<h2>ENGINEERING PROJECTS</h2>
<div class="entry">
  <div class="row">
    <span class="role">CNC-Milled Golf Putter – Full CAD-to-Part Build</span>
    <span class="when">2025</span>
  </div>
  <p class="org">3-axis Haas CNC, Fusion 360, DFM · Oaks Christian capstone</p>
  <ul>
    <li>Designed and machined a novel putter from 6061 in two ops with adaptive toolpaths validated with 12 PLA prototypes</li>
    <li>Designed a scooping cavity whose undercuts drove the toolpath strategy; cut the 3-degree loft angle on a 3D-printed shim</li>
    <li>Modeled unit cost at $18.56 vs. $250 retail; 1 of 8 finalists (40+ students), presented to 200+ alumni at Capstone Night</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Wave Energy Converter – Team Lead</span>
    <span class="when">2023</span>
  </div>
  <p class="org">Bridgeport mill, Fusion 360, fluid dynamics · Oaks Christian</p>
  <ul>
    <li>Led a five-person team to a 1st place win of five teams, designing and machining a 1:12-scale rack-and-pinion wave energy converter, with all parts made to tolerance in-house</li>
    <li>Prototype produced 120 V at 1:12 scale (15 V per motor), projecting 360 V at full scale</li>
    <li>Applied fluid dynamics and energy-transfer analysis; modeled the full assembly in Fusion 360 and AutoCAD</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Apricot Lane Farms – Net-Zero Carbon Shipping Container Space</span>
    <span class="when">Mar – May 2024</span>
  </div>
  <p class="org">AutoCAD, Autodesk CFD, Project Management · Oaks Christian</p>
  <ul>
    <li>Selected as 1 of 3 students to design a net-zero carbon workspace for Apricot Lane Farms; farm chose the L-shaped design</li>
    <li>Analyzed structural integrity of container walls with cutouts and roof overhang; assessed solar needs with the farmers</li>
    <li>Drafted the floor plan in AutoCAD with an ADA-accessible restroom and incinerating toilet; built a 1:10-scale model</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Water Distribution System – Cerro de Agua, Nicaragua</span>
    <span class="when">Mar – Jun 2023</span>
  </div>
  <p class="org">Autodesk CFD, Geospatial Analysis, Cost Analysis · Oaks Christian</p>
  <ul>
    <li>Designed a gravity-fed water distribution network for a village in Nicaragua, including tank siting from a site survey</li>
    <li>Selected 1 of 5 main presenters from 40 classmates; presented to Cerro de Agua city officials, school administration, and engineering alumni</li>
  </ul>
</div>

<h2>TECHNICAL SKILLS</h2>
<div class="skills">
  <p><b>CAD / CAE:</b> Fusion 360 (6+ years, 55+ designs), SolidWorks (2+ years, CSWA), AutoCAD, Autodesk CFD</p>
  <p><b>Manufacturing:</b> 3-axis Haas CNC machining, Bridgeport mill, lathe, FDM/SLA 3D printing, composite &amp; concrete casting</p>
  <p><b>Methods:</b> GD&amp;T (ASME Y14.5), DFM, tolerance stack-up analysis, iterative prototyping, design-test-refine, cost modeling</p>
  <p><b>AI:</b> Claude Code, Codex, and Gemini via agentic workflows in Antigravity IDE</p>
  <p><b>Software:</b> Python, Git, MATLAB, Linux, HTML/CSS</p>
  <p><b>Certification:</b> Haas CNC Certification Program – Basic Mill Operator, online coursework completed (Haas Automation, 2026)</p>
  <p><b>Languages:</b> English (native); German (beginner, actively learning)</p>
</div>

<h2>AWARDS</h2>
<ul class="profile">
  <li><b>Capstone Finalist (CNC putter)</b> – 1 of 8 from 40+ students, Oaks Christian, 2025</li>
  <li><b>1st Place, Wave Energy Converter</b> – 1st of 5 teams, Oaks Christian, 2023</li>
  <li><b>President's Honors List</b> – Cal Poly SLO, 2026; awarded for Dean's List three consecutive quarters</li>
  <li><b>Cal Poly Honors Program</b> – selective research-track admission, 2026</li>
  <li><b>1st Place, Noodle Bridge Design</b> – Cal Poly SLO, Nov 2025; won by a 38.5% margin</li>
</ul>

<h2>LEADERSHIP &amp; ACTIVITIES</h2>
<ul class="profile">
  <li><b>Eagle Scout</b> – Boy Scouts of America (2025); Senior Patrol Leader; 15 years in the program</li>
  <li><b>Internationally Mobile</b> – U.S. Air Force family; 9 relocations across 7 states and territories</li>
  <li><b>Volunteering</b> – Meal Outreach, St. Aidan's Church (5+ years)</li>
</ul>

<h2>INTERESTS</h2>
<p class="interests"><span class="i">Backpacking – 500 mi</span> | <span class="i">Weightlifting – 355 lb squat</span> | <span class="i">Poker – 3rd of 126, Cal Poly tournament</span> | <span class="i">Watercolor/Drawing – 3 contest wins</span></p>`;

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
