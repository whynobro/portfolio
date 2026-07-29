/**
 * English strings — the source of truth.
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
  "game.ttt.status.draw": "Draw — the best result available",
  "game.ttt.status.aiWins": "Michael wins",
  "game.ttt.status.demo": "Playing itself — take a square to interrupt",
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
    "Design, analysis and fabrication — each piece shown with what it was built to do and what it measured.",

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
  "proj.container.title": "Net-Zero Shipping Container",
  "proj.container.body":
    "An L-shaped modular dwelling for a real client, designed for net-zero CO₂ and ADA accessibility, taken from brief to deliverable.",
  "proj.container.meta": "Apricot Lane Farms",
  "proj.campus.title": "Campus Native",
  "proj.campus.body":
    "A production marketplace for student-led campus tours: sixteen data models and payment handling, with double-booking prevented by a database constraint rather than application logic.",
  "proj.campus.meta": "live in production",
  "proj.water.title": "Water Distribution System",
  "proj.water.body":
    "A gravity-fed distribution network for a rural community in Nicaragua: source survey, tank siting and pipe routing worked out from the terrain rather than from a standard layout.",
  "proj.water.meta": "Nicaragua",
  "proj.water.meta2": "gravity-fed",

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
  "award.bridge.title": "1st Place — Noodle Bridge Design",
  "award.bridge.issuer": "Cal Poly College of Engineering",
  "award.bridge.body":
    "Longest structurally sound span from twenty 12-inch pieces and three feet of tape. The design worked the material's compressive strength against its poor shear resistance, and won by a 38.5% margin over second place.",
  "award.capstone.title": "Capstone Finalist — CNC Milled Putter",
  "award.capstone.issuer": "Oaks Christian School, Institute of Engineering",
  "award.capstone.body":
    "One of eight presentations chosen from more than forty capstone students, presented to an audience of 300+ alumni, industry professionals and students.",
  "award.wave.title": "1st Place — Wave Energy Converter",
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
