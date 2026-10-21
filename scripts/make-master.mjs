/**
 * Renders the MASTER RESUME: the superset, on as many pages as it takes.
 *
 *   node scripts/make-master.mjs
 *
 * Writes `Master Resume, Michael Fischbach.pdf` to the repo root (gitignored).
 *
 * WHAT THIS IS, AND WHAT IT IS NOT. Every other generator here produces a
 * document you SEND. This one produces a document you PULL FROM. It is the
 * rendered form of `docs/resume-inventory.md`: every project, every bullet pool,
 * every award, in the house layout, so a targeted resume can be assembled by
 * deleting rather than by rewriting from memory.
 *
 * Never send this document to an employer. A resume that includes everything
 * argues nothing, which is the first line of the inventory and the reason that
 * file exists. The selection cheatsheet on page one is the actual instruction:
 * pick one identity line, three or four projects, and cut the rest.
 *
 * WHY A SEPARATE SCRIPT. `make-cv-en.mjs` renders three variants that differ in
 * two strings, so they share a template. `make-cv-onepage.mjs` is a different
 * SELECTION of the same pool. This is the pool itself, unselected, so it shares
 * the layout and nothing else.
 *
 * LAYOUT is deliberately identical to the other English documents: centred name,
 * ruled section headings, entries indented from the rule with the date flush
 * right, Times New Roman at 10.5pt. That is what makes this plug-and-play: a
 * block lifted from here into a targeted document needs no restyling. Do not
 * shrink the type here either. This document is allowed to run long, which is
 * the whole point, so there is never a reason to compress it.
 *
 * FIGURES come from `docs/resume-inventory.md`, which is the authority. Two were
 * corrected on 2026-09-18 by Michael and are NOT yet fixed in the other two
 * generators:
 *
 *   Clearance     TS submitted and IN PROCESS, SCI eligible. Nothing granted.
 *                 make-cv-en.mjs and make-cv-onepage.mjs still say "Active
 *                 Secret ... granted" and are wrong until edited.
 *   Ramps         $26,500 revenue and ~45% waste reduction (was $50,000+ / ~30%).
 *
 * The putter cost saving is two dollar figures and NEVER a percentage: the
 * retired "533% reduction" was arithmetically impossible. Account state from the
 * trading bot (P&L, balances, win rates, account ID) is never published, and its
 * backtest figure is never presented as realised return.
 *
 * `[M]` in the inventory marks a measured, defensible figure. Those bullets are
 * the ones worth space in a targeted document; they are marked here with a
 * bracketed note in the ALTERNATES blocks rather than in the rendered bullets,
 * so nothing lifted from this page carries editorial marks into a real resume.
 */
import { chromium } from "playwright";
import { PORTFOLIO_GENERAL, PORTFOLIO_TEXT } from "./portfolio-link.mjs";

const OUT = "Master Resume, Michael Fischbach.pdf";

/**
 * Alternate copy that belongs in the pool but must not read as part of the
 * document: identity lines you choose between, bullets held in reserve, and the
 * caveats that stop a line being used wrongly. Rendered small and indented so
 * the page still scans as a resume, with the real content in normal weight.
 */
const note = (s) => `<p class="note">${s}</p>`;

const html = `<!doctype html><meta charset="utf-8">
<title>Master Resume — Michael Fischbach</title>
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
  .location { font-size: 9.5pt; text-align: center; margin: 0 0 2.6mm; line-height: 1.3 }
  /* Links are BLACK with an underline, matching every other English document:
     real anchors so Chromium writes clickable /Annots, but the page prints as
     one colour. The phone is underlined to match but is NOT an anchor, because
     a tel: URL does nothing in a desktop PDF reader. */
  .contact a, .contact a.link { color: #000; text-decoration: underline }
  .contact .tel { text-decoration: underline }
  a.site { color: #000; text-decoration: underline }
  a.site.plain { text-decoration: none }
  h2 {
    font-size: 11.5pt; font-weight: 700; margin: 2.6mm 0 1.1mm;
    border-bottom: 1px solid #000; padding-bottom: .6mm;
  }
  .entry { margin: 0 0 1.7mm 4mm; break-inside: avoid; page-break-inside: avoid }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 8mm }
  .role { font-weight: 700; font-size: 11pt }
  .when { font-size: 10pt; white-space: nowrap }
  .org { font-style: italic; font-size: 10pt; margin: .2mm 0 .6mm }
  .org .right { float: right; font-style: italic }
  ul { margin: 0; padding: 0; list-style: none }
  li { margin: 0 0 .5mm; padding-left: 3.2mm; text-indent: -3.2mm }
  li::before { content: "• " }
  .skills p { margin: 0 0 .5mm }
  .profile, .awards { margin-left: 4mm }
  /* The editorial layer. Smaller, indented, and clearly not resume copy, so a
     reader of this document can tell instruction from content at a glance. */
  .note {
    font-size: 9pt; line-height: 1.25; margin: .6mm 0 1.2mm 3.2mm;
    padding-left: 2.4mm; border-left: 1.5px solid #888; color: #333;
  }
  .banner {
    border: 1px solid #000; padding: 2mm 2.6mm; margin: 0 0 2.6mm;
    font-size: 9.5pt; line-height: 1.3;
  }
  .banner b { font-size: 10pt }
  table.pick { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 0 0 1mm 4mm }
  table.pick th, table.pick td {
    text-align: left; vertical-align: top; padding: .7mm 2mm .7mm 0;
    border-bottom: .5px solid #bbb;
  }
  table.pick th { font-weight: 700 }
  .flag { font-weight: 700 }
</style>

<h1>Michael Fischbach</h1>
<p class="contact">
  <span class="tel">805-703-8250</span> |
  <a class="link" href="mailto:mef126906@icloud.com">mef126906@icloud.com</a> |
  <a class="link" href="https://www.linkedin.com/in/mefisch/">www.linkedin.com/in/mefisch</a> |
  <a class="link" href="${PORTFOLIO_GENERAL}">${PORTFOLIO_TEXT}</a>
</p>
<p class="location">Top Secret Clearance (In Process) | SCI Eligible &nbsp;·&nbsp; Malibu, CA</p>

<div class="banner">
  <b>MASTER DOCUMENT — DO NOT SEND.</b> This is the content pool, not a resume.
  Build a targeted resume by copying blocks out of it and deleting the rest:
  one identity line, three or four projects, and only the skills the posting
  names or the chosen projects evidence. A resume that includes everything
  argues nothing. Layout here is identical to the one-page resume and the CV, so
  anything lifted needs no restyling. Authority for every figure is
  <i>docs/resume-inventory.md</i>.
</div>

<h2>SELECTION CHEATSHEET</h2>
<table class="pick">
  <tr><th>Posting emphasis</th><th>Lead with</th><th>Projects</th></tr>
  <tr><td>Manufacturing / machining / production</td><td>Putter</td><td>Putter, Wave, Ramps</td></tr>
  <tr><td>Design / CAD / product development</td><td>Putter or Ramps</td><td>Putter, Ramps, Doorknob-Inator</td></tr>
  <tr><td>Simulation / CFD / analysis</td><td>Water distribution</td><td>Water, Wave, Net-Zero</td></tr>
  <tr><td>Software / data / automation</td><td>SMC Trading Bot</td><td>SMC Bot, Campus Native, Ramps</td></tr>
  <tr><td>Business / operations / startup</td><td>Ramps or Campus Native</td><td>Ramps (+ athlete channel), Campus Native, SMC Bot</td></tr>
  <tr><td>Sustainability / energy</td><td>Wave</td><td>Wave, Net-Zero, Water</td></tr>
  <tr><td>Aerospace / defense</td><td>ADI + clearance</td><td>Putter, Wave, SMC Bot</td></tr>
  <tr><td>Assistive / human-centred design</td><td>Doorknob-Inator</td><td>Doorknob-Inator, Ramps, Putter</td></tr>
  <tr><td>Research / lab / mission-driven</td><td>Water distribution</td><td>Water, Wave, Net-Zero</td></tr>
</table>

<h2>IDENTITY LINE — PICK ONE</h2>
${note(`These are mutually exclusive framings, not stackable. Use one, as an
  OBJECTIVE paragraph on a CV-length document; the one-page resume carries none
  at all, because the page below it already proves the claim.
  <br><br>
  <b>1.</b> Mechanical Engineering student (Cal Poly Honors, 3.78 GPA) seeking a
  mechanical design or manufacturing internship.
  <br><b>2.</b> Honors Mechanical Engineering student at Cal Poly SLO | CEO/Founder
  of Chameleon Ramps &amp; Campus Native. <i>(Michael's own headline.)</i>
  <br><b>3.</b> Mechanical engineering student who has run a manufacturing business
  since 2019. <i>(Leads with the unusual thing, against coursework-only applicants.)</i>
  <br><br>
  <b>Clauses to mix in:</b> Hands-on CAD-to-part experience across 3-axis CNC
  machining, prototyping, tolerance analysis, and iterative real-world testing. ·
  Has run an independent manufacturing business since 2019, so the
  design-workshop-testing loop is something owned end to end rather than observed. ·
  Grew up in a U.S. Air Force family across nine relocations, and settles into new
  teams and countries quickly <i>(abroad only)</i>. · With a business mindset,
  optimising cost is always at the front of the decision process, though building
  trust goes further than saving pennies per unit <i>(startup/ops)</i>.
  <br><br>
  <b>Eligibility line</b>, header, include only when relevant: US roles omit entirely ·
  Abroad "U.S. Citizen | eligible for study-related internship visas" · Germany
  "U.S. Citizen, eligible for a German study-related internship residence permit".`)}

<h2>EDUCATION</h2>
<div class="entry">
  <div class="row">
    <span class="role">California Polytechnic State University, San Luis Obispo</span>
    <span class="when">Sep 2025 – May 2029</span>
  </div>
  <p class="org">B.S. Mechanical Engineering, Honors Program | GPA: 3.78 | Dean's List: Fall, Winter, Spring</p>
  <ul>
    <li>Honors research-track program; Learn by Doing curriculum with hands-on manufacturing, CNC machining, and design from first year</li>
    <li>Built multi-component mechanisms (piston, Geneva wheel, CNC-machined screwdriver) with full tolerance stack-up analysis and GD&amp;T</li>
    <li>Cal Poly Golf Engineers</li>
  </ul>
</div>
${note(`The mechanisms bullet is doing real keyword work: piston, Geneva wheel,
  tolerance stack-up and GD&amp;T are exactly what Boeing Mechanical/Structural and
  LLNL DTED screen for. Keep it on every mechanical document even when the
  Doorknob-Inator is promoted to its own PROJECTS entry. Graduation is May 2029,
  confirmed 2026-09-14; older PDFs say Jun.`)}
<div class="entry">
  <div class="row">
    <span class="role">Oaks Christian School – Institute of Engineering</span>
    <span class="when">Sep 2022 – Jun 2025</span>
  </div>
  <p class="org">Engineering Pathway: 6 multi-month applied design projects | GPA: 3.92 UW / 4.10 W</p>
  <ul>
    <li>Project-based curriculum covering the primary topics of a university engineering program, plus the industry design-review process</li>
    <li>Mastered industry software and prototyping tools across six multi-month builds</li>
  </ul>
</div>
${note(`Drop the high school entirely once there is more university content to
  carry the page: a 2025 high-school GPA next to a college GPA reads as padding.
  It still earns its place on longer documents because four of the eight projects
  below came out of it. It is already cut from the one-page resume.`)}

<h2>EXPERIENCE</h2>
<div class="entry">
  <div class="row"><span class="role">Founder</span><span class="when">2019 – Present</span></div>
  <p class="org">Chameleon Ramps · <a class="site" href="https://www.chameleonramps.com">chameleonramps.com</a><span class="right">Malibu, CA</span></p>
  <ul>
    <li>Designed 40+ products and developed a proprietary casting process that cut material waste ~45%</li>
    <li>Ran a design-test-refine loop across 4–6 prototype generations per product; 1358 orders fulfilled, $26,500 revenue</li>
    <li>Cast concrete range produced entirely in-house, mould design included</li>
    <li>Built a sponsored-athlete distribution channel of 4 recurring partners, rotated over six years</li>
  </ul>
</div>
${note(`<span class="flag">Figures corrected 2026-09-18:</span> $26,500 revenue and
  ~45% waste reduction. <i>make-cv-en.mjs</i> and <i>make-cv-onepage.mjs</i> still
  render $50,000+ and ~30% and must be fixed before either is sent.
  <br><br>
  <b>Listed as EXPERIENCE, not a project, on the one-pager</b>, because "has run a
  manufacturing company for six years" is the least-rejectable fact here and
  belongs where a reader looks for jobs. Use it as a PROJECT instead on a CV
  where EXPERIENCE is already full.
  <br><br>
  <b>Never write the athlete channel as "managed a team of 4."</b> They were
  gifted-product sponsorships: no hiring, no pay, no reviews, no schedule. It does
  not survive "how did you handle an underperformer", and a stretch there
  contaminates the figures beside it. Cut the channel bullet first for pure
  mechanical-design postings; keep it for business, ops, startup or consumer
  product. Do not claim the @hawaii.fb 3K → 143K growth as a result: he was signed
  early and grew. Good spoken interview material, reads as inflation on a page.`)}
<div class="entry">
  <div class="row"><span class="role">CEO &amp; Founder</span><span class="when">Jun 2026 – Present</span></div>
  <p class="org"><a class="site plain" href="https://www.campusnative.com">Campus Native</a><span class="right">San Luis Obispo, CA</span></p>
  <ul>
    <li>Founded and ran a digital marketplace connecting students with campus tour guides, live at campusnative.com</li>
    <li>Recruited a 4-person intern team across engineering, marketing, and content; set their priorities, reviewed their work, led the build of the listing and booking flow</li>
    <li>Guides set their own rates; the platform handles listing and booking</li>
  </ul>
</div>
${note(`<b>This IS a real management claim</b>, unlike the Ramps athlete channel:
  he recruited them, assigns and reviews their work, and led the product build. It
  survives the underperformer question. The interns are unpaid (credit/equity), so
  do not imply salaried reports. Use Campus Native as a job OR a project, never
  both on the same document.`)}
<div class="entry">
  <div class="row"><span class="role">Data Analyst</span><span class="when">Mar 2023 – Present</span></div>
  <p class="org">All Domain Integration (ADI) – Aerospace Engineering<span class="right">Remote</span></p>
  <ul>
    <li><b>SCI eligible; Top Secret clearance submitted and in process</b>, sponsored for work on a classified contract</li>
    <li>3+ year engagement with an aerospace engineering firm: track and report web traffic and user-behavior data in Google Analytics, and turn that data into content and search-visibility decisions</li>
  </ul>
</div>
${note(`<span class="flag">NOTHING IS GRANTED</span> (confirmed 2026-09-18). Write
  "submitted and in process" and "SCI eligible", never "Active Secret", never
  "holds", never past tense. A clearance is checked directly against DISS, so a
  granted-sounding claim that does not exist is a false statement on a
  federal-contracting matter and ends the application. The header form Michael
  approved is "Top Secret Clearance (In Process) | SCI Eligible"; never drop the
  parenthetical to save space.
  <br><br>
  <b>The clearance is the reason ADI earns a line at all</b> on a mechanical
  document, and a clearance with no employer attached is unverifiable, so the
  entry carries it. Lead with the clearance, not the digital-media duties.
  <b>Do not inflate the analytics into data engineering</b>: it is Google
  Analytics reporting feeding content and SEO decisions, and "pipelines" or
  "big data" would not survive "walk me through your analysis" one line under a
  clearance claim. Keep this entry for anything aerospace or defense; it is the
  first cut for a pure mechanical-design posting.`)}
<div class="entry">
  <div class="row"><span class="role">Business Partner</span><span class="when">May 2023 – Jul 2024</span></div>
  <p class="org">Ashersells LLC<span class="right">Malibu, CA</span></p>
  <ul>
    <li>Built Python automation for logistics and order processing; helped scale operations to $500,000+ annual revenue</li>
  </ul>
</div>
${note(`<b>The Python automation is the reason to keep this, not the revenue.</b>
  The $500,000 is the company's, not something Michael engineered, and a sharp
  reader will ask which part was his, so the automation leads the bullet. Cut
  entirely for pure mechanical design; keep for software or operations.`)}

<h2>ENGINEERING PROJECTS</h2>
${note(`Eight entries. <b>Choose three or four.</b> Ordering is the argument: the
  first one is what the reader takes as your identity. Each entry below carries
  more bullets than any one resume should use, so cut within the entry too.`)}

<div class="entry">
  <div class="row">
    <span class="role">CNC Milled Golf Putter – Full CAD-to-Part Build</span>
    <span class="when">2024 – 2025</span>
  </div>
  <p class="org">3-Axis HAAS CNC, Fusion 360, DFM · Oaks Christian capstone</p>
  <ul>
    <li>Designed and machined a novel putter geometry from 6061 aluminum in a single fixture, which drove the toolpath and undercut decisions; validated on PLA prototypes before cutting the production part</li>
    <li>Performed DFM and cost analysis: modeled warehouse-scale unit cost at $15.78 vs. $50–150 retail</li>
    <li>Selected 1 of 8 finalists from 40+ students; presented the build and process at Capstone Night to 200+ alumni and industry professionals and several hundred students</li>
    <li>Designed a scooping cavity whose undercuts drove the toolpath strategy</li>
    <li>Cut the 3-degree loft angle on a 3D-printed shim rather than a tilted fixture</li>
  </ul>
</div>
${note(`The strongest manufacturing story and the default pick for anything
  touching machining, production or hardware. <b>State the cost as two dollar
  figures, never a percentage.</b> The retired "533% cost reduction" was
  arithmetically impossible: $15.78 against $100 is an 84% reduction, and 533% is
  the markup running the other way. "Roughly 6× cheaper" is the safe multiplier.
  The machine is a <b>3-axis</b> HAAS, confirmed against the capstone poster;
  older PDFs and notes say 4-axis and are wrong.`)}

<div class="entry">
  <div class="row">
    <span class="role">Wave Energy Converter – Rack &amp; Pinion Generator</span>
    <span class="when">Aug – Dec 2023</span>
  </div>
  <p class="org">Bridgeport Mill, Fusion 360, Fluid Dynamics · Oaks Christian</p>
  <ul>
    <li>Designed and machined a wave-oscillation-to-electrical-power generator with a five-person team; manufactured all components to tolerance in-house on a Bridgeport mill</li>
    <li>Took 1st place with the highest measured output of three teams: 15 V per motor at 1:12 scale, 360 V scaled</li>
    <li>Applied fluid dynamics and energy-transfer analysis; modeled the full assembly in Fusion 360 and AutoCAD with tolerance documentation</li>
    <li>One rack driving two pinion stages, which is the whole design idea</li>
  </ul>
</div>
${note(`Best pick for energy, sustainability, or "designed and built a test rig".
  The measured output is the load-bearing figure: a win with a number behind it.`)}

<div class="entry">
  <div class="row">
    <span class="role">Water Distribution System – Cerro de Agua, Nicaragua</span>
    <span class="when">Mar – Jun 2023</span>
  </div>
  <p class="org">Autodesk CFD, Geospatial Analysis, Cost Analysis · Oaks Christian</p>
  <ul>
    <li>Designed a gravity-fed water distribution network for a village in Nicaragua, including tank siting from a site survey</li>
    <li>Selected 1 of 5 main presenters from 40 classmates; presented to city officials in Cerro de Agua, school administration, and alumni working in engineering</li>
    <li>Problem identification, fluid dynamics, design integration, geospatial systems, and cost analysis</li>
  </ul>
</div>
${note(`<b>The only project with a real external client and the only humanitarian
  one.</b> It is on none of the current resumes, which is a gap: for LLNL, DOE
  SULI, NSF REU, DAAD and anything mission-driven it beats the trading bot
  outright. It is also the analysis/simulation entry, so it leads for CFD postings.`)}

<div class="entry">
  <div class="row">
    <span class="role">Net-Zero Shipping Container – Apricot Lane Farms</span>
    <span class="when">Mar – May 2024</span>
  </div>
  <p class="org">Autodesk CFD, AutoCAD, Project Management · Oaks Christian</p>
  <ul>
    <li>Designed an L-shaped shipping-container unit for a real client with net-zero CO2 emissions and ADA accessibility as binding constraints</li>
    <li>CFD-informed passive-energy analysis and material optimisation</li>
    <li>Ran project management, modelling, and direct customer communication</li>
  </ul>
</div>
${note(`Removed from the portfolio site at Michael's request (2026-07-29) but
  legitimate resume content and still unused. Second real client, and the ADA
  constraint pairs with the Doorknob-Inator for an accessibility narrative.`)}

<div class="entry">
  <div class="row">
    <span class="role">Doorknob-Inator – Accessible One-Handed Door Handle</span>
    <span class="when">Nov – Dec 2025</span>
  </div>
  <p class="org">Fusion 360, FDM (PLA / TPU), User-Driven Design · Cal Poly ME 128</p>
  <ul>
    <li>Designed a lever adapter letting one-handed users and users without hands open Red Brick dorm knobs, sized so the torque required is within reach of a short lever arm</li>
    <li>Iterated three generations against user constraints: flexible-cup mock-up, TPU flexible-arm CAD, then a PLA collet with rubber inlays for grip; sized the collet by test fit</li>
    <li>Designed for low unit cost so the adapter could be fitted to every handle in a building, and for an aesthetic a resident would accept</li>
    <li>Presented to the ME 128 class and instructor; four-person team</li>
  </ul>
</div>
${note(`<b>Promoted from a one-line mention under Education to a full entry.</b>
  It is the only university-era design project, the only accessibility one, and
  the closest thing here to a product-development story: real users, a real
  constraint, dual-material, low cost. Design internships screen for exactly that.
  Use it whenever a posting says human-centred, assistive, accessibility or
  product development. It carries no measured outcome, so it loses to the putter
  for pure machining roles.`)}

<div class="entry">
  <div class="row">
    <span class="role">SMC Trading Bot – Autonomous Options Execution</span>
    <span class="when">2025 – Present</span>
  </div>
  <p class="org">Python, Options &amp; Futures, Broker APIs, SQLite, Backtesting</p>
  <ul>
    <li>Built an autonomous Python system that parses unstructured options alerts and places live orders against a funded Webull brokerage account, with risk limits, position sizing, and state reconciled from broker fills; a second lane trades futures on Tradovate</li>
    <li>A misread alert becomes a real order, so every parse and order path is pinned by a regression suite of 2,015 tests before it reaches the live account</li>
    <li>Selected strategy parameters on their worst case across two disjoint validation windows rather than their best, using a custom backtesting harness: the best-fit choice is how a system that backtests well loses money live</li>
    <li>Runs 24/7 on a VPS; nine analyst channels, each with its own parser grammar</li>
  </ul>
</div>
${note(`<b>Never state the test count bare.</b> "2,015 tests" reads as busywork
  alone; it only lands attached to its consequence, that every fill spends real
  money. <b>Never publish account state</b>: no P&amp;L, balances, win rates or
  account ID, and never present the backtest figure as realised return.
  <br><br>
  <b>Weakest entry for mechanical design roles</b> (no CAD, no manufacturing, no
  physical result) and options trading reads as a personality signal you cannot
  control. Strong for test, QA, automation and data roles, where the reliability
  framing is the point: reframe the lead bullet around test coverage rather than
  trading. For Boeing Mech/Structural, LLNL DTED or PCC, swap it out for the
  Doorknob-Inator or the Nicaragua system.`)}

<div class="entry">
  <div class="row">
    <span class="role">Campus Native – Student Tour-Guide Marketplace</span>
    <span class="when">Jun 2026 – Present</span>
  </div>
  <p class="org">Product &amp; Operations · <a class="site" href="https://www.campusnative.com">campusnative.com</a></p>
  <ul>
    <li>Built and operate a two-sided marketplace matching prospective students with current-student tour guides; led the listing and booking flow</li>
    <li>Recruited and directed a 4-person intern team across engineering, marketing, and content</li>
  </ul>
</div>
${note(`Duplicate of the EXPERIENCE entry above. Use one or the other, never both.
  As a project it suits software/product postings; as a job it suits business and
  operations ones.`)}

<div class="entry">
  <div class="row">
    <span class="role">Chameleon Ramps – Product Design &amp; Manufacturing</span>
    <span class="when">2019 – Present</span>
  </div>
  <p class="org">Fusion 360, Casting, Iterative Prototyping<span class="right"><a class="site" href="https://www.chameleonramps.com">chameleonramps.com</a></span></p>
  <ul>
    <li>Six-year iterative development program: designed 40+ unique products and developed proprietary casting techniques, reducing material waste ~45%</li>
    <li>Ran a systematic design-test-refine loop across 4–6 prototype generations per product; 1358 orders fulfilled and $26,500 in revenue</li>
    <li>The quarter pipe was the hardest mould in the range to release, which drove a redesign of the draft angles</li>
  </ul>
</div>
${note(`Duplicate of the EXPERIENCE entry. Use one placement, not both. The draft-angle
  bullet is the one that reads as engineering rather than commerce; lead with it
  when Ramps is a PROJECT on a design document.`)}

<h2>TECHNICAL SKILLS</h2>
<div class="skills">
  <p><b>CAD / CAE:</b> Fusion 360 (6+ years, 40+ designs), SolidWorks, AutoCAD, Autodesk CFD</p>
  <p><b>Manufacturing:</b> 3-axis HAAS CNC machining, Bridgeport mill, lathe, FDM/SLA 3D printing, carbon-analog composite &amp; concrete casting</p>
  <p><b>Methods:</b> GD&amp;T, tolerance stack-up analysis, DFM, rapid iterative prototyping, design-test-refine, cost modeling</p>
  <p><b>Software:</b> Python, HTML/CSS, Git, MATLAB</p>
  <p><b>Certification:</b> Haas CNC Certification Program – Basic Mill Operator, online coursework completed (Haas Automation, 2026); 12 chapters of CNC safety, setup, and machine operation</p>
  <p><b>Languages:</b> English (native); German (beginner, actively learning)</p>
</div>
${note(`<b>Cut this block to what the posting names plus what the chosen projects
  evidence.</b> An unevidenced skill line is noise.
  <br><br>
  <b>Situational additions</b>, only when true and evidenced: CNC programming and
  operation (putter) · geospatial systems (Nicaragua) · energy systems (wave) ·
  mould design and casting process development (ramps) · backtesting and
  quantitative validation (SMC bot).
  <br><br>
  <b>Say "online coursework completed", never "Haas Certified Machinist."</b> Haas
  awards the certification only after an in-person hands-on exam at a Haas Factory
  Outlet. The distinction is one a machinist reading the page knows, and it sits
  directly beside "3-axis HAAS CNC machining", so an overclaim there undermines a
  real skill.
  <b>DFA was removed 2026-08-02 and should not come back</b>: no entry here is
  assembly-heavy enough to carry it. <b>No CSWA</b>: Michael has not taken it (confirmed 2026-10-21), so it
  stays off every CAD line until he has.`)}

<h2>AWARDS</h2>
<ul class="awards">
  <li><b>Capstone Finalist</b> (CNC putter) – 1 of 8 from 40+ students, Oaks Christian, 2025</li>
  <li><b>1st Place, Wave Energy Converter</b> – 1st of 3 teams, highest measured output, Oaks Christian, 2023</li>
  <li><b>President's Honors List</b> – Cal Poly SLO, 2026; awarded for Dean's List three consecutive quarters</li>
  <li><b>Cal Poly Honors Program</b> – selective research-track admission, 2026</li>
  <li><b>1st Place, Noodle Bridge Design</b> – Cal Poly SLO, Nov 2025; won by a 38.5% margin</li>
  <li><b>Eagle Scout</b> – Boy Scouts of America, 2025</li>
  <li><b>Dean's List</b> – Cal Poly SLO, Fall / Winter / Spring 2025–26</li>
</ul>
${note(`<b>Ranked by how hard they are to dismiss</b>, which is not LinkedIn's
  order. Take from the top and stop when the space runs out.
  <br><br>
  <b>Never list Dean's List and President's Honors List together.</b> The second
  is awarded <i>for</i> earning the first three times, so both reads as padding one
  achievement into two lines. Use President's alone.
  <br><br>
  <b>The noodle bridge caveat:</b> the most quotable award (38.5% is concrete) but
  not the most impressive, and the two get confused. It is a first-year class
  competition with pool noodles and an experienced reader sees coursework. Good
  fifth item, bad first. Long form when the space is worth it: built the longest
  structurally sound bridge from 20 noodles and 3' of tape, trading a noodle's
  compressive strength against its shear resistance.
  <br><br>
  <b>Dropped deliberately:</b> Institute of Engineering (a curriculum, belongs
  under Education), Oaks Christian Dean's List (high school), Malibu Optimist Club
  2020 (middle school).`)}

<h2>LEADERSHIP &amp; ACTIVITIES</h2>
<ul class="profile">
  <li><b>Eagle Scout</b> – Boy Scouts of America (2025); Senior Patrol Leader 2 years; 15 years in the program</li>
  <li><b>Channel Island Rowing Club</b> – 8 podium placements</li>
  <li><b>Internationally Mobile</b> – U.S. Air Force family; 9 relocations across 7 states and territories; adapts quickly to new environments and teams</li>
  <li><b>Community Service</b> – 4+ years bimonthly meal service to the unhoused community; 2021–present</li>
  <li><b>Cal Poly Golf Engineers</b> – member</li>
</ul>
${note(`Eagle Scout is cheap in space and universally recognised, and it doubles as
  a discipline signal for defense postings. <b>Rowing needs dates and level</b>
  before it goes on a sent document; "8 podium placements" is Michael's figure and
  the inventory has been asking for the detail behind it.
  <br><br>
  <b>Still to add when true:</b> Cal Poly Racing or Baja SAE (the internship plan
  ranks a project leadership role there as the highest-value ME extracurricular),
  and an Honors thesis with a named faculty advisor, which is the differentiator
  for NSF REU, DAAD RISE, SULI and LLNL.`)}`;

const browser = await chromium.launch();
const tab = await browser.newPage();
await tab.setContent(html, { waitUntil: "load" });
await tab.pdf({ path: OUT, format: "Letter", printBackground: true });
await browser.close();
console.log(`wrote ${OUT}`);
