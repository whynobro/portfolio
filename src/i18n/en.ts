/**
 * English strings: the source of truth.
 *
 * Flat dotted keys, not nested: nesting breaks the exhaustiveness check in
 * de.ts into per-branch checks and makes keys harder to grep.
 *
 * Every string here also appears inline in index.html as the default, so the
 * page is a complete, readable English document even if JavaScript never runs.
 */
export const en = {
  // Accessibility
  "a11y.skip": "Skip to content",
  "a11y.langGroup": "Language",
  "a11y.awards": "Awards and honours",

  // Navigation
  "nav.work": "Work",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.awards": "Awards",

  // Entrance
  "home.eyebrow": "Permanent collection",
  "home.role": "Mechanical engineering · Cal Poly San Luis Obispo",
  "home.bio1":
    "I design parts and build the systems that test them. Six years of taking products from a sketch to a finished object: CAD, tolerance analysis, machining, and the measurement that says whether the model was right.",
  "home.bio2":
    "I started a cast-concrete product company in 2019 and still run it. I grew up in an Air Force family and moved nine times across seven states, so relocating for an internship is normal rather than daunting.",

  "fact.gpa": "GPA · Honors Program",
  "fact.tol": "mm tolerance held",
  "fact.products": "products to market",
  "fact.tests": "tests in production",

  "cta.work": "View the collection",
  "cta.contact": "Contact",

  // Interactive works. The two boards are shown unframed and uncaptioned, so
  // the titles survive only as accessible names for the regions.
  "game.ttt.title": "Unbeatable Tic-Tac-Toe",
  "game.ttt.status.thinking": "Thinking…",
  "game.ttt.status.yourTurn": "Your move",
  "game.ttt.status.draw": "Draw: the best result available",
  "game.ttt.status.aiWins": "Michael wins",
  "game.ttt.status.demo": "Playing itself. Take a square to interrupt",
  "game.ttt.reset": "New game",
  "game.ring.title": "Water Ring Toss",
  "game.ring.button": "Press to pump",
  "game.ring.expand": "Fullscreen",
  "game.ring.score": "Score",
  "game.ring.side": "Side jets",
  "game.ring.scored": "ringed",

  // The collection
  "work.eyebrow": "The collection",
  "work.title": "Works in Mechanical Engineering",
  "work.lede":
    "Design, analysis and fabrication: each piece shown with what it was built to do and what it measured.",

  "proj.putter.title": "CNC-Milled Aluminium Putter",
  "proj.putter.body":
    "A putter head machined from 6061 on a 4-axis HAAS in a single setup, with a cost model behind it. One of eight finalists from over forty.",
  "proj.ramps.title": "Chameleon Ramps",
  "proj.ramps.body":
    "A cast-concrete product company founded in 2019: forty designs taken from CAD through mould-making to a shipped product, with the casting process developed in-house.",
  "proj.wave.title": "Wave Energy Converter",
  "proj.wave.body":
    "A rack-and-pinion generator turning wave oscillation into electrical power, every component machined in-house on a Bridgeport mill.",
  "proj.wave.meta": "1st place",
  "proj.bot.title": "Autonomous Execution System",
  "proj.bot.body":
    "A Python system that ingests live data and executes autonomously, with parameters chosen on their worst case across two disjoint validation windows rather than their best.",
  "proj.bot.meta": "options live",
  "proj.campus.title": "Campus Native",
  "proj.campus.body":
    "A production marketplace for student-led campus tours: sixteen data models and payment handling, with double-booking prevented by a database constraint rather than application logic.",
  "proj.campus.meta": "live in production",
  "proj.water.title": "Water Distribution System",
  "proj.water.body":
    "A gravity-fed distribution network for a rural community in Nicaragua: source survey, tank siting and pipe routing worked out from the terrain rather than from a standard layout.",
  "proj.water.meta": "Nicaragua",
  "proj.water.meta2": "gravity-fed",

  // ---- The project rooms -------------------------------------------------
  // Shared furniture: the plate's row labels and the three section headings
  // every room uses, so a room costs only its own prose.
  "case.eyebrow": "From the collection",
  "case.back": "Back to the collection",
  "case.spec.role": "Role",
  "case.spec.tools": "Tools",
  "case.spec.material": "Material",
  "case.spec.scope": "Scope",
  "case.spec.result": "Result",
  "case.h.brief": "The brief",
  "case.h.approach": "The approach",
  "case.h.result": "What it measured",

  // CNC putter
  "case.putter.lede":
    "A putter head cut from a single block of 6061, designed so the whole part comes off the machine in one setup.",
  "case.putter.role": "Design, CAM and machining",
  "case.putter.tools": "Fusion 360 · 4-axis HAAS",
  "case.putter.material": "Aluminium 6061",
  "case.putter.result": "$15.78 per unit",
  "case.putter.brief":
    "A year-long capstone: take a product from a first sketch to a finished object, and account for what it would cost to make more than one.",
  "case.putter.approach1":
    "The head is milled from solid 6061 on a 4-axis HAAS. Designing for a single setup was the constraint that shaped the geometry: every feature has to be reachable without unclamping the part, because each re-fixture is another chance to lose the datum and another operation to pay for.",
  "case.putter.approach2":
    "The scooping face came out of the same thinking. It is the feature that makes the putter its own object rather than a copy, and it had to be cuttable with the tools available rather than only renderable.",
  "case.putter.outcome":
    "The modelled unit cost in warehouse-style manufacturing is $15.78, against a $50–150 retail range for the brands the design was compared with. The work was one of eight capstone presentations chosen from more than forty, shown to an audience of over 300.",

  // Chameleon Ramps
  "case.ramps.lede":
    "A cast-concrete product company founded in 2019 and still running: forty designs taken from CAD to a shipped object.",
  "case.ramps.role": "Founder · design and production",
  "case.ramps.tools": "CAD · mould-making · casting",
  "case.ramps.material": "Cast concrete",
  "case.ramps.result": "$50k revenue",
  "case.ramps.brief":
    "Miniature skate obstacles, cast rather than printed, that survive being thrown in a bag and used outdoors.",
  "case.ramps.approach1":
    "Each product starts as a CAD model, becomes a mould, and only then becomes a run of parts. The mould is the real design problem: draft, wall thickness and how the piece releases decide whether a shape can be made forty times or only once.",
  "case.ramps.approach2":
    "The casting process was developed in-house over several years, which is what made the range possible. Concrete is unforgiving about cure and mix, and every product that survived taught the next one something about both.",
  "case.ramps.outcome":
    "Over forty products have gone to market since 2019, with about $50k in revenue. The company still runs.",

  // Wave energy converter
  "case.wave.lede":
    "A rack-and-pinion generator that turns the up-and-down of a wave into rotation, and rotation into current.",
  "case.wave.role": "Design and manufacture",
  "case.wave.tools": "Fusion 360 · AutoCAD · Bridgeport mill",
  "case.wave.material": "Machined steel and aluminium",
  "case.wave.result": "1st place",
  "case.wave.brief":
    "Three teams, one problem: get the most electrical power out of wave oscillation. The comparison was measured, not argued.",
  "case.wave.approach1":
    "A float drives a vertical rack; the rack turns a pinion; the pinion drives the generator. The mechanism is deliberately plain, because every extra stage between the wave and the armature is another place to lose energy to friction.",
  "case.wave.approach2":
    "Every component was machined in-house on a Bridgeport mill, which meant the tolerances had to be ones we could actually hold. A rack and pinion that binds converts nothing at all.",
  "case.wave.outcome":
    "The machine produced the highest measured wattage of the competing teams and took first place.",

  // Execution system
  "case.bot.lede":
    "A Python system that reads live alerts, decides whether they are tradeable, and executes without a human in the loop.",
  "case.bot.role": "Architecture and implementation",
  "case.bot.tools": "Python · SQLite · systemd on a VPS",
  "case.bot.scope": "Options live · futures in demo",
  "case.bot.result": "1553 tests",
  "case.bot.brief":
    "Take a stream of informal, human-written alerts and turn it into orders that are correct, or into nothing at all.",
  "case.bot.approach1":
    "The parser is the hard part: the input is prose written by people in a hurry, and a misread strike is a real order for the wrong thing. Every channel has its own grammar, and the state that matters is what the broker reports as filled, never what the alert said would happen.",
  "case.bot.approach2":
    "Parameters were chosen on their worst case across two disjoint validation windows rather than their best on either. Picking the best fit is how a system that looks excellent in a backtest loses money in the market.",
  "case.bot.outcome":
    "1553 tests pass in the production suite. The options lane runs live, the futures lane runs against a paper broker, and the operator display above is read-only telemetry, and the controls live elsewhere.",

  // Campus Native
  "case.campus.lede":
    "A marketplace for campus tours led by current students, live in production and taking real bookings.",
  "case.campus.role": "Founder · product and engineering",
  "case.campus.tools": "Next.js · PostgreSQL · Stripe",
  "case.campus.scope": "16 data models",
  "case.campus.result": "Live in production",
  "case.campus.brief":
    "The official campus tour is a script. Prospective students want the version from someone studying what they want to study.",
  "case.campus.approach1":
    "Sixteen data models carry universities, guides, availability, bookings and payouts. Guides are matched to visitors by major and interest, because that match is the entire reason to book a person rather than a slot.",
  "case.campus.approach2":
    "Double-booking is prevented by a constraint in the database, not by a check in the application. Application-level checks lose the race the moment two people press the button at once; the database is the only place the answer can be decided exactly once.",
  "case.campus.outcome":
    "The site is live at campusnative.com and handles the booking and payment path end to end.",

  // Water distribution
  "case.water.lede":
    "A gravity-fed water distribution network for a rural community in Nicaragua, routed from the terrain itself.",
  "case.water.role": "Design and analysis · final presenter",
  "case.water.tools": "Autodesk CFD · geospatial survey",
  "case.water.scope": "Cerro de Agua, Nicaragua",
  "case.water.result": "1 of 5 presenters",
  "case.water.brief":
    "Get clean water from a source to a community without a pump, which means the landscape has to do the work.",
  "case.water.approach1":
    "The tank site sets everything downstream: too low and the far end of the network has no pressure, too high and the run from the source becomes the problem instead. Siting it came out of the survey rather than a standard layout.",
  "case.water.approach2":
    "Pipe routing and diameters were worked from the head available at each branch, with the cost of the pipe treated as part of the design rather than as an afterthought.",
  "case.water.outcome":
    "The work was presented to city officials in Cerro de Agua alongside school administration and alumni working in engineering. I was one of five main presenters from a class of forty.",

  // Alt text and captions for the rooms
  "alt.putter.hero": "The finished aluminium putter head on the green",
  "alt.putter.cam": "The Fusion 360 CAM setup, toolpaths over the model",
  "alt.putter.machining": "The head in the vise mid-cut, chips on the fixture",
  "alt.putter.inhand": "The finished head held, showing the scooping geometry",
  "alt.putter.inuse": "The putter in use at Westlake Golf Course",
  "alt.putter.drawing": "The dimensioned engineering drawing",
  "cap.putter.cam": "Toolpaths in Fusion 360: the setup the single fixture had to satisfy.",
  "cap.putter.machining": "Mid-cut on the 4-axis HAAS.",
  "cap.putter.inhand": "The scooping face, the feature the geometry was built around.",
  "cap.putter.inuse": "In use at Westlake Golf Course.",
  "cap.putter.drawing": "The drawing the part was cut from.",

  "alt.ramps.hero": "Beachside Bank, cast concrete, on wet rock",
  "alt.ramps.quarter": "A cast-concrete quarter pipe against foliage",
  "alt.ramps.alt1": "A cast-concrete obstacle from the range",
  "alt.ramps.alt2": "A cast-concrete obstacle from the range",
  "cap.ramps.quarter": "The quarter pipe: the hardest mould in the range to release.",
  "cap.ramps.alt1": "From the current range.",
  "cap.ramps.alt2": "From the current range.",

  "alt.wave.hero": "The wave energy converter's internal mechanism",
  "alt.wave.base": "The converter's base and mounting",
  "cap.wave.base": "The base, machined in-house on the Bridgeport.",

  "alt.bot.hero": "The operator display: broker link status and filled orders",

  "alt.campus.hero": "The Campus Native marketplace, live at campusnative.com",

  "alt.water.hero": "The distribution system on the site survey",
  "alt.water.map": "The network schematic: source, two tanks, and the same network labelled with pressures",
  "cap.water.map": "The network, and the same network with the pressure at every node.",

  // Awards
  "awards.eyebrow": "Honours",
  "awards.title": "Awards & Recognition",

  "award.honors.title": "Cal Poly Honors Program",
  "award.honors.issuer": "California Polytechnic State University, San Luis Obispo",
  "award.honors.body":
    "Selective programme built around enriched coursework, faculty-mentored research and interdisciplinary work.",
  "award.presidents.title": "President's Honors List",
  "award.presidents.issuer": "California Polytechnic State University, San Luis Obispo",
  "award.presidents.body":
    "Awarded for reaching the Dean's List in three consecutive quarters within one academic year.",
  "award.deans.title": "Dean's List",
  "award.deans.issuer": "California Polytechnic State University, San Luis Obispo",
  "award.deans.body":
    "Fall, Winter and Spring 2025–26, for maintaining a minimum 3.50 GPA across all units.",
  "award.bridge.title": "1st Place: Noodle Bridge Design",
  "award.bridge.issuer": "Cal Poly College of Engineering",
  "award.bridge.body":
    "Longest structurally sound span from twenty 12-inch pieces and three feet of tape. The design worked the material's compressive strength against its poor shear resistance, and won by a 38.5% margin over second place.",
  "award.capstone.title": "Capstone Finalist: CNC Milled Putter",
  "award.capstone.issuer": "Oaks Christian School, Institute of Engineering",
  "award.capstone.body":
    "One of eight presentations chosen from more than forty capstone students, presented to an audience of 300+ alumni, industry professionals and students.",
  "award.wave.title": "1st Place: Wave Energy Converter",
  "award.wave.issuer": "Oaks Christian School, Institute of Engineering",
  "award.wave.body":
    "Highest measured wattage of any competing team, converting wave oscillation to electrical power through a rack-and-pinion mechanism.",
  "award.eagle.title": "Eagle Scout",
  "award.eagle.issuer": "Boy Scouts of America",
  "award.eagle.body": "Eagle rank; Senior Patrol Leader for two years.",
  "award.ioe.title": "Institute of Engineering",
  "award.ioe.issuer": "Oaks Christian School",
  "award.ioe.body":
    "Four-year project-based engineering programme covering university-level topics alongside industry software, prototyping tools and the design-review process.",

  // About
  "about.title": "Profile",
  "about.p1":
    "I am a mechanical engineering student at Cal Poly San Luis Obispo, in the Honors Program, with a 3.78 GPA and Dean's List in all three quarters of my first year.",
  "about.p2":
    "What interests me is the loop between a drawing and a measurement: design it, make it, test it, find out where the model was wrong, change it. That applies to a part on a mill and to a system in production, which is why both appear here.",
  "about.p3":
    "I grew up in an Air Force family and moved nine times across seven states. I am a US citizen and eligible for a German study-related internship residence permit.",

  // Contact
  "contact.title": "Get in touch",
  "contact.lede": "Available for a mechanical engineering internship. Open to relocation.",

  // Footer
  "footer.role": "Mechanical Engineer",
  "footer.email": "Email",
} as const;

export type TranslationKey = keyof typeof en;
/** Every key must exist in every language. Enforced by `satisfies` in de.ts. */
export type Dict = Record<TranslationKey, string>;
