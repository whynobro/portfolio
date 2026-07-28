/**
 * English strings — the source of truth.
 *
 * Flat dotted keys, not nested objects: nesting breaks the exhaustiveness check
 * in de.ts into per-branch checks and makes keys harder to grep.
 *
 * Every string here also appears inline in index.html as the default, so the
 * page is a complete, readable English document even if JavaScript never runs.
 */
export const en = {
  // Accessibility
  "a11y.skip": "Skip to content",
  "a11y.langGroup": "Language",
  "a11y.langEn": "Switch to English",
  "a11y.langDe": "Auf Deutsch umschalten",

  // Navigation
  "nav.work": "Work",
  "nav.about": "About",
  "nav.contact": "Contact",

  // Hero
  "hero.eyebrow": "Mechanical Engineering",
  "hero.line1": "I design parts and build the systems",
  "hero.line2": "that test them.",
  "hero.school": "Cal Poly San Luis Obispo",
  "hero.honors": "Honors Program",
  "hero.visa": "US citizen · EU internship visa eligible",

  "cta.work": "View work",
  "cta.contact": "Contact",

  // Measured-figures strip
  "strip.tolerance": "mm tolerance held",
  "strip.cost": "unit cost reduction",
  "strip.products": "products to market",
  "strip.tests": "tests passing in production",

  // Work
  "work.label": "Selected work",

  "proj.putter.title": "CNC-Milled Aluminium Putter",
  "proj.wave.title": "Wave Energy Converter",
  "proj.wave.spec1": "Bridgeport mill",
  "proj.wave.spec2": "Rack & pinion",
  "proj.wave.spec3": "1st place",
  "proj.ramps.title": "Chameleon Ramps",
  "proj.ramps.spec1": "Since 2019",
  "proj.ramps.spec2": "40+ products",
  "proj.ramps.spec3": "$50k revenue",
  "proj.bot.title": "Autonomous Execution System",
  "proj.bot.spec3": "Options live · futures demo",

  "footer.location": "Malibu, California",

  // ---- Case studies: shared ----
  "case.back": "← Back to work",
  "case.brief": "Brief",
  "case.iterations": "Iterations",
  "case.result": "Measured result",

  // ---- CNC putter ----
  "case.cnc.kicker": "CAD to finished part",
  "case.cnc.lede":
    "A putter head machined from 6061 aluminium on a 4-axis HAAS, taken from first sketch to a finished part with a full tolerance stack-up and a manufacturing cost model behind it.",
  "case.cnc.figureAlt": "Tolerance stack-up: worst case ±0.14 mm, RSS ±0.08 mm",
  "case.cnc.caption":
    "Assembly stack-up across three toleranced features. Worst case ±0.14 mm; RSS ±0.08 mm.",
  "case.cnc.brief":
    "Design a putter with a geometry that could not be produced by casting, then actually manufacture it. The constraint that shaped everything: it had to be machinable in a single 4-axis setup, because a second setup introduces a re-fixturing error that the face flatness could not absorb.",
  "case.cnc.iterations":
    "Three PLA prototypes preceded any aluminium. Printing first was a deliberate cost decision: a failed print costs an hour and a few grams, a failed aluminium run costs a billet and most of a day on the machine. The first print showed the heel-toe weight distribution was wrong, and the second showed the face insert pocket left too little material at the sole. Only the third geometry was cut in metal.",
  "case.cnc.s1": "Material",
  "case.cnc.s2": "Machine",
  "case.cnc.s2v": "4-axis HAAS, single setup",
  "case.cnc.s3": "Stack-up",
  "case.cnc.s4": "Modelled unit cost",
  "case.cnc.s5": "Retail comparison",
  "case.cnc.s6": "Recognition",
  "case.cnc.s6v": "1 of 8 finalists from 40+; presented to 300+",

  // ---- Wave energy ----
  "case.wave.kicker": "Energy conversion",
  "case.wave.lede":
    "A rack-and-pinion generator converting wave oscillation into electrical power, with every component machined to tolerance on a Bridgeport mill.",
  "case.wave.figureAlt": "Measured power output against competing teams",
  "case.wave.caption":
    "Output against wave frequency. Bars show competing teams' peak measured output.",
  "case.wave.brief":
    "Convert the vertical motion of a wave into usable electrical output. Rack and pinion was chosen over a turbine because wave motion is slow and reciprocating: a turbine wants continuous rotation, while a rack converts linear travel directly and tolerates the direction reversal at the top and bottom of each cycle.",
  "case.wave.iterations":
    "The first build lost most of its energy to friction in the rack guide. Backlash between rack and pinion also meant the direction reversal at each stroke end wasted travel before the gear re-engaged. Tightening the guide tolerance and reducing that backlash mattered more to the final number than any change to the generator itself.",
  "case.wave.s1": "Mechanism",
  "case.wave.s1v": "Rack and pinion, reciprocating",
  "case.wave.s2": "Manufacturing",
  "case.wave.s2v": "Bridgeport mill, all components in-house",
  "case.wave.s3": "Output",
  "case.wave.s3v": "Highest measured wattage in the field",
  "case.wave.s4": "Placement",
  "case.wave.s4v": "1st place",

  // ---- Chameleon Ramps ----
  "case.ramps.kicker": "Product design and manufacturing",
  "case.ramps.lede":
    "A cast-concrete product company founded in 2019: 40+ designs taken from Fusion 360 through mould-making to a shipped product, with the casting process developed in-house.",
  "case.ramps.figureAlt":
    "Scrap rate falling and dimensional consistency rising across six prototype generations",
  "case.ramps.caption":
    "Scrap and consistency across six generations. Most of the gain lands by G3.",
  "case.ramps.brief":
    "Produce miniature concrete obstacles with sharp, repeatable edges, at a unit cost that supports a real price. Concrete is unforgiving at small scale: the aggregate is coarse relative to the part, and edges either fail to fill or break during demoulding.",
  "case.ramps.iterations":
    "Every product ran four to six generations. The recurring failure was edge chipping at demould, which is a mould draft and cure-time problem rather than a mix problem — a fact that took several generations of changing the mix to establish. Adding draft to the mould walls and extending cure before demoulding cut scrap far more than any mix change. The curve flattens after the third generation; continuing to iterate past that point would have cost more than it returned.",
  "case.ramps.s1": "Operating since",
  "case.ramps.s2": "Designs",
  "case.ramps.s2v": "40+ unique products, Fusion 360",
  "case.ramps.s3": "Scrap reduction",
  "case.ramps.s3v": "42% → 8% across six generations",
  "case.ramps.s4": "Revenue",

  // ---- Execution system ----
  "case.bot.kicker": "Systems engineering and validation",
  "case.bot.lede":
    "A Python system that ingests live data, parses it into structured orders and executes them through a broker API, with risk limits and state that survives a restart. Included here for the validation method rather than the domain.",
  "case.bot.figureAlt":
    "Stop levels ranked by worst-case result across two disjoint validation windows",
  "case.bot.caption":
    "Each candidate measured in two disjoint windows. Selection is on the worse of the two.",
  "case.bot.h1": "Why this belongs in a mechanical portfolio",
  "case.bot.why":
    "The engineering content is the validation method, not the trading. A parameter was chosen by its worst result across two disjoint test windows rather than its best or its average. That is the same discipline as qualifying a part against its worst operating condition instead of its nominal one: the −35% setting produced higher combined output and was still rejected, because its worst window was weaker than the −30% setting's.",
  "case.bot.h2": "Safety by construction",
  "case.bot.safety":
    "Failure modes are blocked structurally rather than by procedure. The process refuses to start if its environment configuration is inconsistent, instead of starting and behaving unexpectedly. It will only act on positions it opened itself, determined by a database lookup rather than by inferring ownership from an identifier's shape. Both are the software equivalent of a poka-yoke fixture: make the wrong state impossible to reach rather than documenting that it should be avoided.",
  "case.bot.s1": "Test suite",
  "case.bot.s1v": "1553 passing",
  "case.bot.s2": "Status",
  "case.bot.s2v": "Options live; futures in demo",
  "case.bot.s3": "Validation",
  "case.bot.s3v": "Two disjoint windows, selected on worst case",
  "case.bot.s4": "Stack",

  // ---- About ----
  "about.title": "Profile",
  "about.p1":
    "I am a mechanical engineering student at Cal Poly San Luis Obispo, in the Honors Program, with a 3.78 GPA and Dean's List in all three quarters of my first year. I have been designing and manufacturing physical products since 2019, when I started a cast-concrete product company that is still running.",
  "about.p2":
    "What I care about is the loop between a drawing and a measurement: design it, make it, test it, find out where the model was wrong, change it. That applies equally to a part on a mill and to a system in production, which is why both appear in this portfolio.",
  "about.p3":
    "I grew up in an Air Force family and moved nine times across seven states and territories. Relocating to a new country for an internship is normal to me rather than daunting. I am a US citizen and eligible for a German study-related internship residence permit.",
  "about.capabilities": "Capabilities",
  "about.manufacturing": "Manufacturing",
  "about.manufacturingV":
    "4-axis HAAS CNC, Bridgeport mill, lathe, FDM/SLA printing, concrete casting",
  "about.methods": "Methods",
  "about.methodsV": "GD&T, tolerance stack-up, DFM/DFA, iterative prototyping, cost modelling",
  "about.software": "Software",
  "about.languages": "Languages",
  "about.languagesV": "English (native), German (learning)",

  // ---- Contact ----
  "contact.title": "Get in touch",
  "contact.lede": "Available for a mechanical engineering internship. Open to relocation.",
  "contact.email": "Email",
  "contact.phone": "Phone",
  "contact.location": "Location",
  "contact.locationV": "Malibu, California",
  "contact.work": "Work authorisation",
  "contact.workV": "US citizen; eligible for an EU internship visa",
} as const;

export type TranslationKey = keyof typeof en;
/** Every key must exist in every language. Enforced by `satisfies` in de.ts. */
export type Dict = Record<TranslationKey, string>;
