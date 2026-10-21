# Resume inventory, everything that could go on a resume

> **Figures updated 2026-10-21.** The master resume (Oct 16, in Documents/Career/Resumes)
> and the Oct 2026 transcript now win over any figure below that disagrees. Current
> values: GPA **3.79**; graduation **expected May 2028**; Ramps **$39,600 / 627 orders /
> ~40% waste / 15 countries / 2019–2026**; putter **$18.56 vs $250 retail, two ops, 12 PLA
> prototypes**; wave **1st of 5 teams, 120 V at 1:12 (15 V/motor), 360 V projected**; WERC
> team lead (12 people), targets only; ADI Mechanical Engineering Intern. Dynamics is not
> yet taken (Spring 2027). The portfolio link on every document points at the root.
> Bot tests: **2,208 passing** (measured 2026-10-21).


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
6. **Bold is structure only** (2026-09-14): entry titles, skills labels, award
   labels, plus the Secret clearance as the single content exception.
   Never bold a figure inside a sentence.
7. **Never shrink type to fit; cut content instead.** Times New Roman at
   10.5pt on every English document, and that is the floor. (This mistake has
   been made once already.)

**Naming** (2026-09-14): the ONE-PAGE document is the **Resume**
(`Michael-Fischbach-Resume-1Page.pdf`) and the two-page long-form document is
the **CV** (`Michael-Fischbach-CV.pdf`, `-CV-Abroad`, `-CV-HWA`). They used to
both be called Resume, which made attaching the wrong one easy.

**The one-pager already exists** (`scripts/make-cv-onepage.mjs`) and is the
default send. It keeps only work carrying a checkable number: the putter,
the wave converter, Chameleon Ramps and the execution system, with Ramps moved
up into EXPERIENCE. If a posting wants a different four, start from that script
rather than the two-page one.

**The one-pager has NO objective section** (removed 2026-09-14). It asserted
what the page proves below it: GPA and honors are in EDUCATION, and "CAD to
finished metal, 3-axis CNC, tolerance analysis" restates the putter entry. The
space went to the coursework bullet, the Campus Native intern team, and the
putter's single-fixture consequence. The CV keeps its objective.

**Cut from the one-pager on 2026-09-14** to make room for the clearance and the
Haas certification, in cut order: the noodle bridge award (ranked #5 here and
reads as first-year coursework), the SMC bot's broker plumbing (Webull /
Tradovate / SQLite detail, least relevant to a mechanical posting), and two
lines of the objective that merely asserted what Chameleon Ramps evidences
directly below it. The page is now ~97.5% full. Anything added needs something
cut; measure with `node tmp/measure-fit.mjs`.

### Selection cheatsheet

| Posting emphasis | Lead with | Projects |
| --- | --- | --- |
| Manufacturing / machining / production | Putter | Putter, Wave, Ramps |
| Design / CAD / product development | Putter or Ramps | Putter, Ramps, Doorknob |
| Simulation / CFD / analysis | Water distribution | Water, Wave, Net-Zero |
| Software / data / automation | Execution system | Execution system, Campus Native, Ramps |
| Business / operations / startup | Ramps or Campus Native | Ramps (+ sponsored-athlete channel, §4.3), Campus Native, Execution system |
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
| LinkedIn | linkedin.com/in/mefisch |
| Chameleon Ramps | <https://www.chameleonramps.com> |
| Campus Native | <https://www.campusnative.com> |
| Location | Malibu, CA |

Every resume hyperlinks LinkedIn, the portfolio, and both company names, in
**black, underlined** (changed from `#0563c1` blue on 2026-09-11). They are
still real clickable anchors; the underline is what marks them. The phone
number is underlined to match but is deliberately NOT a link: a tel: URL does
nothing in a desktop PDF reader.

**LinkedIn shows its FULL URL** (`www.linkedin.com/in/mefisch`),
changed 2026-09-14 from the word "LinkedIn". Michael hands out printed copies,
where a hyperlinked word is a dead end: the reader cannot see where it goes and
cannot type it in. The slug changed from `michael-fischbach` to `mefisch` on
2026-09-14; it is a live identifier, so it was corrected on every document
including the Apple resume, the Lebenslauf and the portfolio page. The location/eligibility line sits in its own centred
`.location` block rather than after a `<br>`, so it can carry a real margin
matching the h1's, which is what makes the header's two gaps even. The company
links are the cheapest credibility on the page: a reader who doubts "1358
orders fulfilled" can go look. Check both return 200 before shipping.

**On the one-pager, Chameleon Ramps shows its domain and Campus Native does
not** (Michael's call, 2026-09-14): the Ramps line reads
`Chameleon Ramps · chameleonramps.com`, Campus Native stays a bare linked
company name. This asymmetry is DELIBERATE, do not "fix" it. The domain sits
after the company name on the left because the right-hand slot carries the
location on every EXPERIENCE entry.

**Eligibility lines** · include only when relevant:

- *(US roles)* omit entirely.
- *(Abroad)* U.S. Citizen | eligible for study-related internship visas
- *(Germany specifically)* U.S. Citizen, eligible for a German study-related
  internship residence permit

---

## 3. Education

**California Polytechnic State University, San Luis Obispo** · Sep 2025 – May 2029
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
  developed proprietary casting techniques, reducing material waste **~45%** `[M]`
- Ran a systematic design-test-refine loop across 4–6 prototype generations per
  product; **1358 orders fulfilled** and **$26,500 in revenue** `[M]`

> **Figures corrected 2026-09-18** (confirmed by Michael): revenue is **$26,500**,
> not $50,000+, and the waste reduction is **~45%**, not ~30%. The $50k figure
> entered this file as a correction to an older $25k/$30k and was carried forward
> on trust; Michael's current number is $26,500. `make-cv-en.mjs` and
> `make-cv-onepage.mjs` still render $50,000+ / ~30% and must be updated before
> either is sent.
- Cast concrete range produced entirely in-house, mould design included
- The quarter pipe was the hardest mould in the range to release, which drove a
  redesign of the draft angles

**Sponsored-athlete channel** · 4 recurring partners at a time, rotated over the
six years. Fingerboard creators on Instagram: `@hawaii.fb`, `@abstrakt.fb`,
`@icefingaz`, `@soles.fb`. Product was shipped to them; they produced promotional
content. `@hawaii.fb` was signed at ~3K followers and is now at ~143K.

Preferred phrasing, folded into the revenue bullet rather than given its own:

- …**1358 orders fulfilled** and **$50,000+ in revenue** through a self-built
  sponsored-athlete channel of 4 recurring partners

> **Do not write this as "managed a team of 4."** They were gifted-product
> sponsorships, not reports: no hiring, no pay, no reviews, no schedule. The
> claim does not survive the interview question "how did you handle an
> underperformer", and a stretch here contaminates the figures beside it, which
> are the strongest thing on the page. Michael already has two more defensible
> leadership claims (the Campus Native intern team, Senior Patrol Leader), so a
> third adds nothing.
>
> **Do not claim the 3K → 143K growth as a result.** He signed the creator early;
> the creator grew. Correlation, and a reader spots it immediately.
>
> **This is cover-letter and interview material, not resume material.** Spoken,
> "I picked him at 3K and he's at 143K now" is a good judgment-and-talent-spotting
> story. Compressed to a resume line it reads as inflation. The one thing worth
> the resume space is the *channel*, which shows distribution was built into the
> manufacturing business rather than bolted on. Weakest for pure mechanical-design
> postings; cut it first there. Worth including for business, operations,
> startup, marketing or consumer-product postings.
>
> German/EU CVs are more literal about titles than US ones, so the
> "managed a team" framing lands *worse* abroad, not better. The channel phrasing
> above is the safe version in both markets, no divergence needed.

### 4.4 SMC Trading Bot – Autonomous Options Execution

`2025 – Present · Python, options & futures, broker APIs, SQLite, backtesting`

For software, data, automation or "systems thinking" postings.

**The name is "SMC Trading Bot"** (2026-08-06). It was "Autonomous Execution
System" on every document until then; that name hid what it does, so a reader
could not tell it trades options against a real brokerage. Do not reintroduce
it. The subtitle carries the engineering claim on resumes, where the bare name
means nothing to a recruiter: `SMC Trading Bot – Autonomous Options Execution`.

- Built an autonomous Python system that parses unstructured options alerts and
  places live orders against a **funded Webull brokerage account**, with risk
  limits, position sizing, and state reconciled from broker fills; a second lane
  trades **futures on Tradovate**
- A misread alert becomes a real order, so every parse and order path is pinned
  by a regression suite of **2,015 tests** before it reaches the live account
- Selected strategy parameters on their **worst case** across two disjoint
  validation windows rather than their best, using a custom backtesting harness:
  the best-fit choice is how a system that backtests well loses money live `[M]`
- Options live on real money; futures autonomous on a Tradovate demo account
  (the options brokerage has no futures order entry)
- Runs 24/7 on a VPS; nine analyst channels, each with its own parser grammar

> **Never state the test count bare** (2026-08-06). "2,015 tests passing" means
> nothing to a non-engineer and reads as busywork to an engineer. It only lands
> attached to the consequence: every fill spends real money, so the order path
> is pinned by tests before it reaches the account. Same rule for the wall label
> and the room's Result row.

> **Never publish account state**: no P&L, cash balance, per-analyst win rates,
> or account ID. Naming the *brokers* (Webull, Tradovate) is fine and is
> deliberate; naming the account or its value is not. The "+137% backtest"
> figure in Michael's own notes is a backtest, not realised return. Do not put
> it on a resume. The defensible claims are the test count (in context), the
> live/demo status, and the worst-case parameter selection.

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
- Recruited a 4-person intern team across engineering, marketing, and content;
  sets their priorities, reviews their work, and led the build of the listing
  and booking flow (confirmed with Michael 2026-09-14)

> **This one IS a real management claim, unlike the Chameleon Ramps sponsored
> athletes in §4.3.** He recruited them, assigns and reviews their work, and
> led the product build with them. It survives the "how did you handle an
> underperformer" interview question, which the athlete channel does not. The
> interns are unpaid (credit/equity), so do not imply salaried reports.
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
| Methods | GD&T, tolerance stack-up analysis, DFM, rapid iterative prototyping, design-test-refine, cost modelling |
| Software | Python, HTML/CSS, Git |
| Languages | English (native); German (beginner, actively learning) |

**Certification**

- **Haas CNC Certification Program, Basic Mill Operator** · Haas Automation ·
  2026 · online coursework completed (12 chapters of video + quiz, 100%
  required per quiz to advance)

> **Say "online coursework completed", never "Haas Certified Machinist".** Haas
> awards the *certification* only after an in-person hands-on exam at a Haas
> Factory Outlet, where you demonstrate the concepts on a real machine. Michael
> did the virtual program only. The distinction is one an experienced
> machinist reading the page knows, and it sits directly beside "3-axis HAAS
> CNC machining" in the skills block, so an overclaim here undermines a real
> skill. If he later sits the HFO hands-on exam, this becomes
> "Haas CNC Certification, Basic Mill Operator" with no qualifier.
>
> It pairs well with the putter (machined on a 3-axis HAAS), which is why it is
> worth its line on the one-pager: the certificate and the part corroborate
> each other.

**DFA (Design for Assembly) was removed on 2026-08-02 and should not come
back.** It sat next to DFM as "DFM/DFA" and read as padding one method into
two: nothing in §4 is an assembly-heavy project, so there is no entry a reader
could check it against. DFM is evidenced by the putter several times over. Add
DFA only when a multi-part assembly with a real assembly-cost argument exists
to carry it.

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

**Data Analyst, All Domain Integration (ADI), Aerospace Engineering** · Remote · Mar 2023 – Present

- **Top Secret clearance submitted and in process; SCI eligible** — sponsored by
  ADI for work on a classified contract. Nothing is granted yet.
- 3+ year engagement with an aerospace engineering firm: track and report web
  traffic and user-behavior data in Google Analytics, and turn that data into
  content and search-visibility decisions

> **Title is Data Analyst as of 2026-09-14** (was Digital Media Manager), on
> the English CV and one-pager. It is a title correction, not a role change:
> same work, same Mar 2023 start.
>
> **Do not inflate the analytics work into data engineering.** It is Google
> Analytics: traffic and user-behaviour reporting that feeds content and SEO
> decisions. Pipelines, modelling or "big data" phrasing would not survive
> "walk me through your analysis", and this bullet sits one line under the Top
> Secret clearance, where a soft claim contaminates a hard one. Measured,
> reported, acted on is the honest framing and already reads as analytical
> rather than social-media work.
>
> The German Lebenslauf still says Digital Media Manager with the old
> website/SEO bullet. Michael scoped this change to the English documents;
> update the German one before sending it anywhere.

> **NOTHING IS GRANTED. The TS is submitted and in process; Michael is SCI
> eligible** (confirmed by Michael 2026-09-18, superseding the "Active Secret,
> granted 2026-09-15" entry that stood here). That earlier line was wrong and is
> retired: do not restore it, and do not write "Active Secret", "holds a
> clearance", or any phrasing in the past tense.
>
> **The status word is load-bearing, not the level.** A clearance claim is
> checked directly against DISS, so stating a granted clearance that does not
> exist is a false statement on a federal-contracting matter and ends the
> application. "Top Secret Clearance (In Process) | SCI Eligible" is the approved
> header (Michael's call, 2026-09-18) and the ADI bullet spells it out as
> submitted. Never drop the "(In Process)" qualifier to save space, and never add
> a polygraph. Reword only when the status actually changes.
>
> **`make-cv-en.mjs` and `make-cv-onepage.mjs` still render "Active Secret
> security clearance: granted".** Both are wrong as of 2026-09-18 and must be
> fixed before either document is sent anywhere.
>
> **The clearance is the reason ADI is back on the one-pager**, after being cut
> there as "marketing, not engineering evidence". A clearance with no employer
> attached is unverifiable, so the entry carries it. Lead the bullet with the
> clearance, not the digital-media duties.

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
> cost and 2,015 tests. It is NOT a permanent judgement: for an aerospace,
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
| Clearance | "Active Secret, granted" / "Top Secret" bare | **TS submitted and in process, SCI eligible** (2026-09-18). Nothing granted. |
| Ramps revenue | $50,000+ / $25,000+ / $30,000 / $26,500 | **$39,600** (master, 2026-10-16) |
| Ramps waste cut | ~30% / ~45% | **~40%** (master, 2026-10-16) |
| Ramps orders | 1358 | **627 orders** (master, 2026-10-16) |
| Cal Poly GPA | 3.78 / 3.80 | **3.79** (transcript 3.786, 2026-10-20) |
| Execution system tests | 190 tests | **2,015 tests passing** (2026-08-06) |
| Execution system status | paper trading | **options live, futures in demo** |
| Capstone Night audience | 300+ / 250 | **200+ alumni and industry professionals, several hundred students** |
| Putter cost saving | "533% cost reduction" / $15.78 vs $50–150 | **$18.56 vs $250 retail** (master, 2026-10-16) |
| Cal Poly graduation | Jun 2029 / May 2029 | **Expected May 2028** (master, 2026-10-16) |

**Do not publish**: any account state from the execution system (P&L, balances,
win rates, account ID), and never present its backtest figure as realised
return.
