/**
 * Renders the VIBE CODING CLUB resume: the software-and-shipping subset.
 *
 *   node scripts/make-cv-vibeclub.mjs
 *
 * Writes `Michael-Fischbach-Resume-VibeClub.pdf` to the repo root (gitignored).
 *
 * WHY A SEPARATE SCRIPT. Same reason `make-cv-onepage.mjs` is separate from
 * `make-cv-en.mjs`: this document differs in CONTENT, not just in an objective
 * line. The mechanical one-pager leads with a $15.78 unit cost and a HAAS
 * fixture; this one leads with three shipped software systems. Bending the
 * shared template to also express "and swap the whole projects section" would
 * make the common case harder to read.
 *
 * THE AUDIENCE is a student club, not a recruiter. That changes two things:
 *
 *   1. The reader is a peer who has vibe-coded something themselves and can
 *      tell a prompted toy from a system that survived contact with reality.
 *      So the argument is never "I used AI", which everyone in the room can
 *      say. It is what the AI-built thing then had to withstand: real money,
 *      real users, a regression suite, a VPS that runs whether or not anyone
 *      is watching. That is the only part a peer cannot claim cheaply.
 *   2. There is no ATS. A club reads the page as a human, so the lead is an
 *      objective that names the three artifacts and their live URLs, rather
 *      than the keyword-dense identity line a job posting would want.
 *
 * WHAT LEADS, and why: SMC Trading Bot first. It is the only entry where being
 * vibe-coded is itself the interesting engineering claim, because the honest
 * version of "I prompted a system that trades real money" is a story about the
 * guardrails, not the prompting. Campus Native second (shipped, live, paying
 * path, a team). Portfolio third (small, but it is the thing the reader will
 * click, and it demonstrates taste rather than scale).
 *
 * WHAT WAS CUT. The wave converter, the water distribution network, the
 * Net-Zero container, the Doorknob-Inator, the Haas certification and the CAD
 * skills block: all real, none of them evidence for this room. The putter
 * survives as a single line under PROJECTS because "also machines aluminum"
 * makes a software page memorable in a club of pure-software applicants,
 * whereas a full DFM entry would just be the wrong resume.
 *
 * FIGURES come from `docs/resume-inventory.md`, which is the authority. Note
 * the corrections dated 2026-09-18 that `make-cv-onepage.mjs` has NOT yet
 * picked up and this file has:
 *   - Chameleon Ramps revenue is $26,500, NOT $50,000+.
 *   - Chameleon Ramps waste reduction is ~45%, NOT ~30%.
 *   - The clearance is Top Secret SUBMITTED AND IN PROCESS, SCI eligible.
 *     Never "Active Secret", never "granted", never without "(In Process)".
 *
 * REPO FACTS (counted 2026-09-18 from the working trees, not from memory):
 *   smc-trade-bot  444 Python files, ~271k lines, 280 commits, live on a VPS.
 *   campusguide    Next.js + TypeScript, 209 source files, 35 pages,
 *                  9 API routes, 15 Prisma models, Stripe, Supabase, 164 commits.
 * The resume states the ones a reader can check or that carry an argument, and
 * leaves the rest here. A line count is not an achievement.
 *
 * The test count stays at 2,015 (the inventory's figure). The tree currently
 * greps to ~2,588 `def test_`, but a grep is not a passing suite, and the
 * inventory rule applies either way: NEVER state the count bare. It only means
 * something attached to the consequence, that a misread alert becomes a real
 * order.
 */
import { chromium } from "playwright";
import { PORTFOLIO_GENERAL, PORTFOLIO_TEXT } from "./portfolio-link.mjs";

const OUT = "Michael-Fischbach-Resume-VibeClub.pdf";

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
  .location { font-size: 9.5pt; text-align: center; margin: 0 0 2.2mm; line-height: 1.3 }
  /* Links are BLACK with an underline, per the house style: still real anchors
     so Chromium writes clickable /Annots, but the page prints as one colour.
     The phone is underlined to match but is NOT an anchor: a tel: URL does
     nothing in the desktop PDF readers people actually use. */
  .contact a { color: #000; text-decoration: underline }
  .contact a.link { color: #000; text-decoration: underline }
  .contact .tel { text-decoration: underline }
  a.site { color: #000; text-decoration: underline }
  a.site.plain { text-decoration: none }
  /* Section spacing is TIGHTER than the mechanical one-pager's (2.4mm/1.5mm):
     this page carries five sections of denser prose, and the space came out of
     the gaps rather than out of a bullet. Type size is untouched at 10.5pt,
     which is the floor and is not negotiable, per docs/resume-inventory.md. */
  h2 {
    font-size: 11.5pt; font-weight: 700; margin: 1.9mm 0 .8mm;
    border-bottom: 1px solid #000; padding-bottom: .5mm;
  }
  .entry { margin: 0 0 1.2mm 4mm; break-inside: avoid }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 8mm }
  .role { font-weight: 700; font-size: 11pt }
  .when { font-size: 10pt; white-space: nowrap }
  .org { font-style: italic; font-size: 10pt; margin: .2mm 0 .5mm }
  .org .right { float: right; font-style: italic }
  ul { margin: 0; padding: 0; list-style: none }
  li { margin: 0 0 .3mm; padding-left: 3.2mm; text-indent: -3.2mm }
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
<p class="location">San Luis Obispo, CA</p>

<!-- The one-pager has no objective, because a recruiter reads the entries and
     an objective there only restated them. This page keeps one, for a reader
     who is deciding in about eight seconds whether this person builds things.
     It names the three live URLs, because a club can click them during the
     meeting, and it states the AI-assisted method plainly instead of leaving
     the reader to guess how one student shipped three systems. -->
<p class="objective">
  Mechanical engineering student who ships software. I build prompt-first, then make the result
  survive something real: an options bot trading a funded brokerage account, and a marketplace
  taking live payments. Here to build with people who work the same way.
</p>

<h2>SOFTWARE PROJECTS</h2>
<div class="entry">
  <div class="row">
    <span class="role">SMC Trading Bot – Autonomous Options Execution</span>
    <span class="when">2025 – Present</span>
  </div>
  <p class="org">Python, Broker APIs, SQLite, Backtesting, 24/7 on a systemd VPS</p>
  <ul>
    <li>Vibe-coded end to end with Claude Code: ~271k lines of Python across 444 files, built by prompting rather than by hand, running live today</li>
    <li>Parses unstructured alerts from nine analyst channels, each with its own grammar, and places live orders against a funded Webull account with risk limits, sizing, and state reconciled from broker fills rather than the alert text</li>
    <li>A misread alert becomes a real order, so every parse and order path is pinned by a regression suite of 2,015 tests before it reaches the live account, and strategy parameters were chosen on their worst case across two disjoint validation windows rather than their best. This is the part the AI does not do for you: prompting is fast, the guardrails are the work</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Campus Native – Student Tour-Guide Marketplace</span>
    <span class="when">Jun 2026 – Present</span>
  </div>
  <p class="org">Next.js, TypeScript, Prisma/Postgres, Supabase, Stripe · <a class="site" href="https://www.campusnative.com">campusnative.com</a></p>
  <ul>
    <li>Founded and shipped a two-sided marketplace connecting prospective students with current-student campus tour guides; live, with guides setting their own rates</li>
    <li>Built the listing and booking flow across 35 pages and 15 data models, with Stripe payments, Supabase auth, and Leaflet maps; 209 TypeScript files, also AI-assisted from the first commit</li>
    <li>Recruited a 4-person intern team across engineering, marketing, and content; set priorities, reviewed their work</li>
  </ul>
</div>
<div class="entry">
  <div class="row">
    <span class="role">Engineering Portfolio – michaelfischbach.dev</span>
    <span class="when">2026</span>
  </div>
  <p class="org">TypeScript, Vite, custom i18n · <a class="site" href="${PORTFOLIO_GENERAL}">${PORTFOLIO_TEXT}</a></p>
  <ul>
    <li>Bilingual (EN/DE) portfolio shipping two variants from one codebase via a build-time Vite plugin. This resume is generated by a script in that repo, rendered through headless Chromium</li>
  </ul>
</div>

<h2>EXPERIENCE</h2>
<div class="entry">
  <div class="row"><span class="role">Founder</span><span class="when">2019 – Present</span></div>
  <p class="org">Chameleon Ramps · <a class="site" href="https://www.chameleonramps.com">chameleonramps.com</a><span class="right">Malibu, CA</span></p>
  <ul>
    <li>Have run a manufacturing business since 2019: 40+ products designed, a proprietary casting process that cut material waste ~45%, 1358 orders fulfilled, $26,500 in revenue</li>
  </ul>
</div>
<div class="entry">
  <div class="row"><span class="role">Data Analyst</span><span class="when">Mar 2023 – Present</span></div>
  <p class="org">All Domain Integration (ADI) – Aerospace Engineering<span class="right">Remote</span></p>
  <ul>
    <li><b>Top Secret Clearance (In Process) | SCI Eligible</b>, sponsored by ADI for work on a classified contract; track and report traffic and user-behavior data in Google Analytics</li>
  </ul>
</div>
<!-- Ashersells is CUT here, though it is a Python-automation entry and this is a
     software page. Two reasons: the SMC bot and Campus Native already carry the
     "wrote automation that ran a business" claim with far bigger numbers, and
     the $500,000 is the company's revenue rather than anything Michael built,
     which is the one soft figure on an otherwise checkable page. Put it back if
     this ever needs a fourth software entry. -->

<h2>EDUCATION</h2>
<!-- Collapsed to a single entry with no bullets. On the mechanical one-pager
     education carries a coursework bullet, because a CAD/CNC reader cares what
     he has built in class. A club does not: the three shipped systems above are
     the evidence, and the GPA is here only so the page is not missing it. -->
<div class="entry">
  <div class="row">
    <span class="role">Cal Poly San Luis Obispo — B.S. Mechanical Engineering, Honors</span>
    <span class="when">Sep 2025 – May 2029</span>
  </div>
  <p class="org">GPA: 3.78 | Dean's List: Fall, Winter, Spring</p>
</div>

<h2>SKILLS &amp; TOOLS</h2>
<div class="skills">
  <p><b>Languages:</b> Python, TypeScript/JavaScript, HTML/CSS, SQL</p>
  <p><b>Frameworks &amp; infra:</b> Next.js, React, Prisma, Postgres, Supabase, Stripe, Tailwind, Vite, Playwright, systemd/VPS deployment, Git</p>
  <p><b>AI-assisted development:</b> Claude Code daily driver; prompt-first builds, agent orchestration, regression suites and safety invariants as the guardrail on generated code</p>
  <p><b>Mechanical:</b> Fusion 360 (6+ years, 40+ designs), 3-axis HAAS CNC machining, GD&amp;T</p>
</div>

<h2>AWARDS</h2>
<ul class="awards">
  <li><b>Capstone Finalist</b> – 1 of 8 from 40+ students, 2025 &nbsp;·&nbsp; <b>President's Honors List</b> – Cal Poly, 2026 &nbsp;·&nbsp; <b>Eagle Scout</b>, 2025</li>
</ul>`;

const browser = await chromium.launch();
const tab = await browser.newPage();
await tab.setContent(html, { waitUntil: "load" });
await tab.pdf({ path: OUT, format: "Letter", printBackground: true });
await browser.close();
console.log(`wrote ${OUT}`);
