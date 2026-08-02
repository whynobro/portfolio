# Resume inventory, everything that could go on a resume

**Purpose: this is the SUPERSET, not a resume.** No single document uses all of
it. When Michael asks for a resume for a specific internship, select from here
against that posting and leave the rest out. A resume that includes everything
says nothing.

Read this file before drafting. It is the source of truth for figures; the
older PDFs on the Desktop are not (see "Facts that were wrong" at the end).

Rendering is a separate concern: `scripts/make-cv-en.mjs` holds the layout and
the two current variants. This file holds the *content pool*.

---

## How to use this when drafting

1. **Read the posting for its verbs.** "Konstruktion", "test bench", "CFD",
   "manufacturing support", "data analysis" each pull a different subset.
2. **Pick ONE lead identity** from §1, not three.
3. **Choose 3–4 projects** from §4, not all seven. Ordering is the argument.
4. **Choose bullets within each project** from the pools in §4, each project
   lists more bullets than any one resume should use.
5. **Cut skills** in §5 to what the posting names plus what the chosen projects
   evidence. An unevidenced skill line is noise.
6. **Never shrink type to fit; cut content instead.** 10pt on the two-page
   documents, 9.6pt on the one-pager, and that is the floor. (This mistake has
   been made once already.)

**The one-pager already exists** (`scripts/make-cv-onepage.mjs`) and is the
default send. It keeps only work carrying a checkable number: the putter,
the wave converter, Chameleon Ramps and the execution system, with Ramps moved
up into EXPERIENCE. If a posting wants a different four, start from that script
rather than the two-page one.

### Selection cheatsheet

| Posting emphasis | Lead with | Projects |
| --- | --- | --- |
| Manufacturing / machining / production | Putter | Putter, Wave, Ramps |
| Design / CAD / product development | Putter or Ramps | Putter, Ramps, Doorknob |
| Simulation / CFD / analysis | Water distribution | Water, Wave, Net-Zero |
| Software / data / automation | Execution system | Execution system, Campus Native, Ramps |
| Business / operations / startup | Ramps or Campus Native | Ramps, Campus Native, Execution system |
| Sustainability / energy | Wave | Wave, Net-Zero, Water |
| Motorsport / vehicle development | Putter | Putter, Wave, Execution system |

---

## 1. Identity lines

Pick one. These are mutually exclusive framings, not stackable.

- Mechanical Engineering student (Cal Poly Honors, 3.78 GPA) seeking a
  mechanical design or manufacturing internship.
- Honors Mechanical Engineering student at Cal Poly SLO | CEO/Founder of
  Chameleon Ramps & Campus Native. *(Michael's own LinkedIn-style headline.)*
- Mechanical engineering student who has run a manufacturing business since
  2019. *(Leads with the unusual thing, useful when competing against
  coursework-only applicants.)*

**Reusable objective clauses** (mix into any of the above):

- Hands-on CAD-to-part experience across 3-axis CNC machining, prototyping,
  tolerance analysis, and iterative real-world testing.
- Has run an independent manufacturing business since 2019, so the
  design-workshop-testing loop is something owned end to end rather than
  observed.
- Grew up in a U.S. Air Force family across nine relocations, and settles into
  new teams and countries quickly. *(Abroad only.)*
- With a business mindset, optimising cost is always at the front of the
  decision process, though building trust goes further than saving pennies per
  unit. *(Michael's own phrasing; good for startup/ops roles.)*

---

## 2. Contact & eligibility

| Field | Value |
| --- | --- |
| Phone | 805-703-8250 |
| Email | `mef126906@icloud.com` |
| Portfolio | michaelfischbach.dev |
| LinkedIn | linkedin.com/in/michael-fischbach |
| Location | Malibu, CA |

**Eligibility lines** · include only when relevant:

- *(US roles)* omit entirely.
- *(Abroad)* U.S. Citizen | eligible for study-related internship visas
- *(Germany specifically)* U.S. Citizen, eligible for a German study-related
  internship residence permit

---

## 3. Education

**California Polytechnic State University, San Luis Obispo** · Sep 2025 – Jun 2029
B.S. Mechanical Engineering, Honors Program | GPA 3.78 | Dean's List: Fall, Winter, Spring

Bullet pool:

- Honors research-track program; Learn by Doing curriculum with hands-on
  manufacturing, CNC machining, and design from first year
- Built multi-component mechanisms (piston, Geneva wheel, CNC-machined
  screwdriver) with full tolerance stack-up analysis and GD&T

**Oaks Christian School, Institute of Engineering** · Sep 2022 – Jun 2025
Engineering Pathway: 6 multi-month applied design projects | GPA 3.92 UW / 4.10 W

Bullet pool:

- Project-based curriculum covering the primary topics of a university
  engineering program, plus the industry design-review process
- Mastered industry software and prototyping tools across six multi-month
  builds

> Drop the high school entirely once there is more university content to carry
> the page. It earns its place now because four of the seven projects are from
> it.

---

## 4. Projects

Each entry lists **more bullets than any one resume should use**. Pick by
posting. `[M]` marks a measured, defensible figure: these are the ones worth
the space.

### 4.1 CNC-Milled Golf Putter: full CAD-to-part build

`2024 – 2025 · Oaks Christian capstone · 3-Axis HAAS CNC, Fusion 360, DFM`

The strongest manufacturing story. Default pick for anything touching
machining, production or hardware.

- Designed and machined a novel putter geometry from 6061 aluminium on a 3-axis
  HAAS CNC; ran iterative PLA prototypes to validate geometry before the final
  aluminium production part
- Machined in **a single fixture**, which is what forced the geometry decisions
- Performed DFM and cost analysis: modelled warehouse-scale unit cost at
  **$15.78** vs. $50–150 retail `[M]`
  > State the two numbers, never a percentage. The retired "533% cost
  > reduction" was arithmetically wrong: $15.78 against $100 is an 84%
  > reduction, and 533% is the markup running the other way. A reduction cannot
  > exceed 100%, which is exactly the kind of thing an engineer reading a
  > resume notices. "Roughly 6× cheaper" is the safe multiplier phrasing.
- Selected **1 of 8 finalists from 40+ students**; presented the build and
  process at Capstone Night to 200+ alumni and industry professionals and
  several hundred students `[M]`
- Designed a scooping cavity whose undercuts drove the toolpath strategy
- Cut the 3-degree loft angle on a 3D-printed shim rather than a tilted fixture

### 4.2 Wave Energy Converter: rack & pinion generator

`Aug – Dec 2023 · Oaks Christian · Bridgeport mill, Fusion 360, fluid dynamics`

Best pick for energy, sustainability, or "designed and built a test rig".

- Designed and machined a wave-oscillation-to-electrical-power generator with a
  **five-person team**; manufactured all components to tolerance on a Bridgeport
  mill
- Took **1st place** with the highest measured output of three teams:
  **15 V per motor at 1:12 scale, 360 V scaled** `[M]`
- Applied fluid dynamics and energy-transfer analysis; modelled the full
  assembly in Fusion 360 and AutoCAD with tolerance documentation
- One rack driving two pinion stages, which is the whole design idea

### 4.3 Chameleon Ramps: product design & manufacturing

`2019 – Present · founder · Fusion 360, casting, iterative prototyping`

The business/ownership story. Strongest evidence of sustained independent work.

- Six-year iterative development program: designed **40+ unique products** and
  developed proprietary casting techniques, reducing material waste **~30%** `[M]`
- Ran a systematic design-test-refine loop across 4–6 prototype generations per
  product; **1358 orders fulfilled** and **$50,000+ in revenue** `[M]`
- Cast concrete range produced entirely in-house, mould design included
- The quarter pipe was the hardest mould in the range to release, which drove a
  redesign of the draft angles

### 4.4 Autonomous Execution System (SMC bot)

`2025 – Present · Python, real-time data, SQLite, backtesting`

For software, data, automation or "systems thinking" postings.

- Built an autonomous Python system that ingests real-time data feeds and
  executes decisions through an external API, with risk limits, state
  persistence, and a custom backtesting harness
- **1553 tests passing** in production; parameters selected on their **worst
  case** across two disjoint validation windows rather than their best `[M]`
- Options live, futures in demo
- Runs 24/7 on a VPS; parses unstructured alerts into structured orders
- Backtested against polygon.io historical data

> **Never publish account state**: no P&L, cash balance, per-analyst win rates,
> or account ID. The "+137% backtest" figure in Michael's own notes is a
> backtest, not realised return. Do not put it on a resume. The defensible
> claims are the test count, the live/demo status, and the worst-case parameter
> selection.

### 4.5 Water Distribution System: Cerro de Agua, Nicaragua

`Mar – Jun 2023 · Oaks Christian · Autodesk CFD, geospatial analysis`

The analysis/simulation entry, and the only one with a real external client.
Underused: not on the current resumes at all.

- Designed a gravity-fed water distribution network for a village in Nicaragua,
  including tank siting from a site survey
- **1 of 5 main presenters** selected from 40 classmates `[M]`
- Problem identification, fluid dynamics, design integration, geospatial
  systems, and cost analysis
- Presented to city officials in Cerro de Agua, school administration, and
  alumni working in engineering, for feedback

### 4.6 Campus Native

`Jun 2026 – Present · founder · live at campusnative.com`

Software product + operations. Overlaps with §6 experience; use as a project
OR a job, not both.

- Founded and operate a digital marketplace connecting students with campus
  tour guides, live at campusnative.com
- Lead a 4-person intern team across engineering, marketing, and content
- Guides set their own rates; the platform handles listing and booking

### 4.7 Net-Zero Shipping Container: Apricot Lane Farms

`Mar – May 2024 · Oaks Christian · Autodesk CFD, AutoCAD`

Real client, sustainability framing. **Removed from the portfolio site** at
Michael's request (2026-07-29), but still legitimate resume content.

- Designed an L-shaped shipping-container unit for a real client with net-zero
  CO2 emissions and ADA accessibility as constraints
- Project management, modelling, and direct customer communication
- CFD-informed passive-energy analysis and material optimisation

### 4.8 Doorknob-Inator

`Nov – Dec 2025 · Cal Poly IME-129`

Assistive design. Slight as a work, but the **only** university-era design
project here, and the only accessibility one. Use when the posting mentions
human-centred or assistive design.

- Designed a product to help someone with a disability interact more easily
  with the world
- Presented to the IME-129 class and instructor

---

## 5. Skills

Cut to what the posting names plus what the chosen projects evidence.

| Category | Items |
| --- | --- |
| CAD / CAE | Fusion 360 (6+ years, 40+ designs), SolidWorks, AutoCAD, Autodesk CFD |
| Manufacturing | 3-axis HAAS CNC machining, Bridgeport mill, lathe, FDM/SLA 3D printing, carbon-analog composite & concrete casting |
| Methods | GD&T, tolerance stack-up analysis, DFM/DFA, rapid iterative prototyping, design-test-refine, cost modelling |
| Software | Python, HTML/CSS, Git |
| Languages | English (native); German (beginner, actively learning) |

Situational additions, only when true for the target and evidenced:

- CNC programming and operation (putter)
- Geospatial systems (Nicaragua)
- Energy systems (wave converter)
- Mould design and casting process development (ramps)
- Backtesting and quantitative validation (execution system)

---

## 6. Experience

**CEO & Founder, Campus Native** · San Luis Obispo, CA · Jun 2026 – Present

- Founded and operate a digital marketplace; lead a 4-person intern team across
  engineering, marketing, and content

**Digital Media Manager, All Domain Integration (ADI), Aerospace Engineering** · Remote · Mar 2023 – Present

- 3+ year engagement with an aerospace engineering firm: website management,
  SEO strategy, and digital communications

> **Keep this for anything aerospace or defence.** The function is marketing,
> but "three years working with an aerospace engineering firm" is a door-opener
> for that industry and gives an interviewer something to ask about. It is the
> first cut for a pure mechanical-design posting, and only then.

**Business Partner, Ashersells LLC** · Malibu, CA · May 2023 – Jul 2024

- Helped scale operations to **$500,000+ annual revenue**; built Python
  automation for logistics and order processing `[M]`

> **The Python automation is the reason to keep this**, not the revenue. The
> $500,000 is the company's, not something Michael engineered, and a sharp
> reader will ask which part was his. Lead the bullet with the automation for
> software or operations postings. Cut for pure mechanical design.
>
> **Both ADI and Ashersells are cut from the current one-pager.** That was a
> call made for a mechanical-design target, where they lose to a $15.78 unit
> cost and 1553 tests. It is NOT a permanent judgement: for an aerospace,
> software or operations posting, put them back.

**Founder, Chameleon Ramps** · 2019 – Present

- See §4.3. List as experience rather than a project when the posting is
  business- or operations-flavoured.

---

## 7. Awards & honours

**Ranked by how hard they are to dismiss**, which is not the order they appear
on LinkedIn. Take from the top; stop when the space runs out.

| # | Award | Issuer | Date | Why it ranks there |
| --- | --- | --- | --- | --- |
| 1 | Capstone Finalist (putter) | Oaks Christian | 2025 | **1 of 8 from 40+** `[M]`. Judged, competitive, and the work is engineering. The strongest thing here. |
| 2 | 1st Place, Wave Energy Converter | Oaks Christian | 2023 | **1st of 3 teams, highest measured output** `[M]`. A win with a number behind it. |
| 3 | President's Honors List | Cal Poly SLO | 2026 | Requires **Dean's List three consecutive quarters** `[M]`. Rarer than Dean's List and it supersedes it: never list both. |
| 4 | Cal Poly Honors Program | Cal Poly SLO | 2026 | Selective admission to a research-track program. |
| 5 | 1st Place, Noodle Bridge Design | Cal Poly SLO | Nov 2025 | Won by **38.5%** `[M]`, and the reasoning is real. But see the caveat below. |
| 6 | Eagle Scout | Boy Scouts of America | 2025 | ~6% of scouts. Character rather than engineering, universally recognised, cheap in space. |
| 7 | Dean's List | Cal Poly SLO | 2025–26 | 3 × 3.50+ GPA `[M]`. Use ONLY if President's List is not stated. |
| — | Institute of Engineering | Oaks Christian | 2025 | A curriculum, not an award. Belongs under education if anywhere. |
| — | Dean's List | Oaks Christian | 2022 | High school. Drop. |
| — | Malibu Optimist Club Winner | Our Lady of Malibu | 2020 | Middle school. Drop. |

**The noodle bridge caveat.** It is the most *quotable* award (a 38.5% margin
is concrete) but not the most *impressive* one, and the two get confused. It is
a first-year class competition using pool noodles, and an experienced reader
sees coursework. The putter capstone makes the same kind of claim, competitive
selection judged by outsiders, with far more weight. **Lead with the capstone
finalist; the bridge is a good fifth item, not a good first.**

Where it earns its place: an interview hook, or a posting that explicitly wants
structural or load analysis. Long form, when the space is worth it: built the
longest structurally sound bridge from 20 noodles and 3' of tape, using
load-dispersion that traded a noodle's compressive strength against its shear
resistance.

**Never list Dean's List and President's Honors List together.** The second is
awarded *for* earning the first three times, so listing both reads as padding
one achievement into two lines.

---

## 8. Leadership, activities & personal

- **Eagle Scout** · Boy Scouts of America (2025); Eagle rank, Senior Patrol
  Leader 2 years; 15 years in the program
- **Rowing** · *(Michael flagged this as resume-worthy; needs dates, level and
  any results before it can be used.)*
- **Internationally mobile** · U.S. Air Force family; **9 relocations across 7
  states and territories** (Colorado Springs CO; Albuquerque NM; Honolulu HI ×2;
  Thousand Oaks, Malibu, Palisades, Manhattan Beach, Malibu CA); adapts quickly
  to new environments and teams
- **Community service** · 4+ years bimonthly meal service to the unhoused
  community; 2021–present

---

## 9. Facts that were wrong on older resumes

Older PDFs still exist on the Desktop and in circulation. **Use the right-hand
column.** If a draft disagrees with this table, the draft is wrong.

| Claim | Wrong version | Correct |
| --- | --- | --- |
| Putter machine | 4-axis HAAS | **3-axis HAAS** (confirmed against the capstone poster, 2026-08-01) |
| Ramps revenue | $25,000+ / $30,000 | **$50,000+** |
| Ramps orders | *(absent)* | **1358 orders** |
| Execution system tests | 190 tests | **1553 tests passing** |
| Execution system status | paper trading | **options live, futures in demo** |
| Capstone Night audience | 300+ / 250 | **200+ alumni and industry professionals, several hundred students** |
| Putter cost saving | "533% cost reduction" | **$15.78 vs $50–150 retail** (a reduction cannot exceed 100%; retired 2026-08-02) |

**Do not publish**: any account state from the execution system (P&L, balances,
win rates, account ID), and never present its backtest figure as realised
return.
