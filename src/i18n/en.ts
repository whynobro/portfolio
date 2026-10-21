/**
 * The site's copy for everything BUILT from strings: the rooms, the awards
 * list and the scenes. The static shell (index.html) carries its own text.
 *
 * Flat dotted keys, not nested, so they stay easy to grep. Figures follow the
 * master resume (2026-10-16) and the Oct 2026 transcript; see
 * docs/resume-inventory.md before changing one.
 */
export const en = {
  // Interactive works. The two boards are shown unframed and uncaptioned, so
  // the titles survive only as accessible names for the regions.
  "game.ttt.status.thinking": "Thinking…",
  "game.ttt.status.yourTurn": "Your move",
  "game.ttt.status.draw": "Draw: the best result available",
  "game.ttt.status.aiWins": "Michael wins",
  "game.ttt.status.demo": "Playing itself. Take a square to interrupt",
  "game.ttt.reset": "New game",
  "game.ring.button": "Press to pump",
  "game.ring.score": "Score",
  "game.ring.side": "Side jets",

  // {n} and {total} are substituted in src/progress.ts.
  "work.progress": "{n} of {total} viewed",
  "work.progressDone": "Completed · all {total} viewed",

  "proj.werc.title": "Lunar Rover Wireless Charger",
  "proj.putter.title": "CNC-Milled Aluminium Putter",
  "proj.ramps.title": "Chameleon Ramps",
  "proj.wave.title": "Wave Energy Converter",
  "proj.bot.title": "SMC Trading Bot",
  "proj.campus.title": "Campus Native",
  "proj.water.title": "Water Distribution System",
  "proj.door.title": "Doorknob-Inator",

  // ---- The project rooms -------------------------------------------------
  "case.eyebrow": "From the collection",
  "case.back": "Back to the collection",
  "case.spec.role": "Role",
  "case.spec.tools": "Tools",
  "case.spec.material": "Material",
  "case.spec.scope": "Scope",
  "case.spec.result": "Result",
  "case.spec.status": "Status",
  "case.h.brief": "The brief",
  "case.h.approach": "The approach",
  "case.h.result": "What it measured",
  "case.h.status": "Where it stands",
  "case.link.ramps": "Visit chameleonramps.com",
  "case.link.campus": "Visit campusnative.com",

  // WERC: every performance figure is a MODEL prediction until the bench is
  // built and tested, and the copy must keep saying so.
  "case.werc.lede":
    "A 1 kW capacitive charger for a lunar rover at the South Pole: the rover parks itself nose-first against a charging wall, and power crosses a 100 mm gap through metal plates with no contact at all.",
  "case.werc.role": "Team lead, 12-person team · controls and integration",
  "case.werc.tools": "Python circuit model · GaN inverter at 6.78 MHz · lidar and capacitance sensing",
  "case.werc.scope": "NASA Artemis task, WERC 2027 · 1 kW full scale, 25 W bench",
  "case.werc.status": "Concept and model · bench build Jan 2027",
  "case.werc.brief":
    "NASA's Artemis surface team asked for a way to recharge a lunar terrain vehicle at the South Pole with no astronaut plugging in a cable: at least 1 kW DC, through abrasive charged dust, from 54 °C in sunlight down to -203 °C in shadow, with a rover that approaches, charges and leaves on its own.",
  "case.werc.approach1":
    "Our answer is a vertical charging wall. Two pairs of thin aluminium plates, one set on the station and one on the rover's nose, couple through an electric field at 6.78 MHz. Vertical faces shed dust instead of collecting it, the gap is set by how far away the rover stops rather than by its ground clearance, and the station plates are oversized so a sloppy park costs nothing. All the heavy electronics stay on the station, so the rover carries only 8.6 kg.",
  "case.werc.approach2":
    "The plates do three jobs. Before any power flows, the station probes them at under 20 V and reads four small capacitances: the gap from their mean, the rover's yaw from their difference. That steers the rover's last few centimetres in, then sets a switched-capacitor tuning bank. Without that measure-then-tune step the model swings from 0.6 to 2.6 kW as the gap changes, so it is also the main overcurrent protection.",
  "case.werc.outcome":
    "Nothing here is measured yet. The team's circuit model predicts 1.0 kW at 87% efficiency against an 80% requirement, held across gaps of 75 to 150 mm, and 25 W at 78% for the bench prototype that has to fit a 31 × 11 × 11 in cold-test cooler. The bench is built in January, the 30% review is due December 31, and the contest runs in April 2027 in Las Cruces.",
  "werc.aria":
    "Animation: a lunar rover drives up to a charging wall, aligns on the plates and charges across the gap.",
  "cap.werc.scene":
    "The docking sequence the controls subteam owns, drawn from the report: lidar approach, fine alignment on plate capacitance, pre-tune, then charge.",
  "alt.werc.full": "Side and top views of the full-scale charging wall on a FLIP-class rover, drawn to scale",
  "cap.werc.full": "Full scale, to scale: the receiver on the rover's nose, the station wall and the bump stops.",
  "alt.werc.bench": "Isometric drawing of the bench prototype: a small rover and charging wall inside the cooler envelope",
  "cap.werc.bench": "The bench prototype has to fit the 31 × 11 × 11 in cooler used for the cold test.",
  "alt.werc.system": "System diagram with the modelled power balance from the Moon Base bus to the rover battery",
  "cap.werc.system": "Where every watt goes, in the model: 1,149 W in, 1,000 W out, 149 W to the radiators.",
  "alt.werc.retune": "Plot of modelled output against gap, lateral offset and yaw, with the tuning bank retuned and frozen",
  "cap.werc.retune": "Why the plates are measured first: retuned, output holds at 1.0 kW; frozen, it swings from 0.6 to 2.6 kW.",
  "alt.werc.states": "The charge state machine, from idle through alignment and charging to disengage, with its fault path",
  "cap.werc.states": "The charge sequence and its fault path. Any fault drops to a safe state and retries from fine alignment.",
  "alt.werc.coupler": "Coupler geometry: the station face, the layer stack-up and the plate gap at 10 degrees of yaw",
  "cap.werc.coupler": "The coupler: station plates 200 mm wider than the receiver, so lateral offset barely changes coupling.",

  // CNC putter
  "case.putter.lede":
    "A putter head cut from a block of 6061 on a 3-axis Haas in two operations, with a cost model behind it.",
  "case.putter.role": "Design, CAD, CAM and machining",
  "case.putter.tools": "Fusion 360 · 3-axis Haas · adaptive toolpaths",
  "case.putter.material": "Aluminium 6061",
  "case.putter.result": "$18.56 per unit",
  "case.putter.brief":
    "A year-long capstone: take a product from a first sketch to a finished object, and account for what it would cost to make more than one.",
  "case.putter.approach1":
    "The head is milled from solid 6061 in two operations with adaptive toolpaths. Twelve PLA prototypes came first, printed to check the shape, the weight and the fixturing before any aluminium was cut. The 3-degree loft is set by a 3D-printed shim under the part rather than a tilted fixture.",
  "case.putter.approach2":
    "The scooping cavity is the feature that makes the putter its own object rather than a copy, and its undercuts are what drove the toolpath strategy: it had to be cuttable with the tools available, not only renderable.",
  "case.putter.outcome":
    "The modelled unit cost is $18.56, against $250 retail for the putter it was compared with. The work was one of eight capstone finalists chosen from more than forty, presented at Capstone Night to over 200 alumni and hundreds of students.",

  // Chameleon Ramps
  "case.ramps.lede":
    "A cast-concrete product company I founded and ran from 2019 to 2026: forty designs taken from CAD to a shipped object.",
  "case.ramps.role": "Founder and CEO · design and production",
  "case.ramps.tools": "Fusion 360 · 3D-printed prototypes · mould-making · casting",
  "case.ramps.material": "Cast concrete",
  "case.ramps.result": "$39,600 over 627 orders",
  "case.ramps.brief":
    "Miniature skate obstacles, cast rather than printed, that survive being thrown in a bag and used outdoors.",
  "case.ramps.approach1":
    "Each product starts as a Fusion 360 model and goes through four to six printed prototype generations before it becomes a mould. The mould is the real design problem: draft, wall thickness and how the piece releases decide whether a shape can be made forty times or only once. The quarter pipe was the hardest to release and drove a redesign of the draft angles.",
  "case.ramps.approach2":
    "The moulding process was developed in-house and cut material waste by about 40%. A sponsorship programme with seven creators grew revenue by 30%, and a co-designed collaboration with Recycled Ramps followed.",
  "case.ramps.outcome":
    "Over forty products went to market, $39,600 in revenue across 627 orders, shipped to 15 countries.",

  // Wave energy converter
  "case.wave.lede":
    "A rack-and-pinion generator that turns the up-and-down of a wave into rotation, and rotation into current.",
  "case.wave.role": "Team lead, team of five · design and manufacture",
  "case.wave.tools": "Fusion 360 · AutoCAD · Bridgeport mill",
  "case.wave.material": "Machined steel and aluminium",
  "case.wave.result": "120 V at 1:12 scale",
  "case.wave.brief":
    "Five teams, one problem: get the most electrical power out of wave oscillation. The comparison was measured, not argued.",
  "case.wave.approach1":
    "A float drives a vertical rack; the rack turns two pinion stages; the pinions drive the generators. The mechanism is deliberately plain, because every extra stage between the wave and the armature is another place to lose energy to friction.",
  "case.wave.approach2":
    "Every component was machined in-house on a Bridgeport mill, which meant the tolerances had to be ones we could actually hold. A rack and pinion that binds converts nothing at all. The first gear ratio was wrong: the 50 rpm motor could not turn against it, so the design moved to 100 rpm.",
  "case.wave.outcome":
    "The 1:12-scale prototype produced 120 volts, 15 per motor, which projects to 360 volts built full size. It took first place of five teams.",

  // SMC Trading Bot
  "case.bot.lede":
    "A Python system that reads options alerts as they are posted, decides whether each one is tradeable, and places the order on a real brokerage account with no human in the loop.",
  "case.bot.role": "Architecture and implementation",
  "case.bot.tools": "Python · Webull and Tradovate APIs · SQLite · systemd on a VPS",
  "case.bot.scope": "Options live on a funded account · futures on a demo account",
  "case.bot.result": "2,015 tests guarding a live account",
  "case.bot.brief":
    "Take a stream of informal, human-written options alerts and turn it into orders that are correct, or into nothing at all. The money is real, so the second outcome has to be as reliable as the first.",
  "case.bot.approach1":
    "The parser is the hard part: the input is prose written by people in a hurry, and a misread strike is a real order for the wrong contract. Each of the nine analyst channels has its own grammar, so each one is pinned by tests against real messages before it is allowed near the account. Position size comes from a fixed budget and a hard contract cap, never from how confident an alert sounds, and anything ambiguous is skipped rather than guessed.",
  "case.bot.approach2":
    "What an alert says will happen and what the brokerage actually fills are different facts, and only the second is real. State is rebuilt from broker fills on every cycle, so a missed message or a partial fill cannot leave the system believing in a position it does not hold. Parameters were chosen on their worst case across two disjoint validation windows rather than their best on either: picking the best fit is how a system that looks excellent in a backtest loses money in the market.",
  "case.bot.outcome":
    "The options lane runs live against a funded Webull account, 24/7 on a VPS; the futures lane runs autonomously on a Tradovate demo account. Because every fill spends real money, the whole order path is held by a regression suite of 2,015 tests. The operator display above is read-only telemetry: the controls live elsewhere.",

  // Campus Native
  "case.campus.lede":
    "A marketplace for campus tours led by current students, live in production and taking real bookings.",
  "case.campus.role": "Founder and CEO · led a 4-person intern team",
  "case.campus.tools": "Next.js · PostgreSQL · Stripe",
  "case.campus.scope": "16 data models",
  "case.campus.result": "Live in production",
  "case.campus.brief":
    "The official campus tour is a script. Prospective students want the version from someone studying what they want to study.",
  "case.campus.approach1":
    "Sixteen data models carry universities, guides, availability, bookings and payouts. Guides set their own rates and are matched to visitors by major and interest, because that match is the entire reason to book a person rather than a slot. I recruited four interns across engineering, marketing and content, set their priorities and led the build of the listing and booking flow.",
  "case.campus.approach2":
    "Double-booking is prevented by a constraint in the database, not by a check in the application. Application-level checks lose the race the moment two people press the button at once; the database is the only place the answer can be decided exactly once.",
  "case.campus.outcome":
    "The site is live at campusnative.com and handles the booking and payment path end to end.",

  // Water distribution
  "case.water.lede":
    "A gravity-fed water distribution network for a rural community in Nicaragua, routed from the terrain itself.",
  "case.water.role": "Design and analysis · final presenter",
  "case.water.tools": "Autodesk CFD · geospatial survey · cost analysis",
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

  // Doorknob-Inator
  "case.door.lede":
    "A low-cost lever adapter that lets residents with one hand, or no hands, open the round knobs in Cal Poly's Red Brick dorms.",
  "case.door.role": "Design and CAD, team of four · Cal Poly ME 128",
  "case.door.tools": "Fusion 360 · FDM printing (PLA and TPU)",
  "case.door.material": "PLA base, TPU head",
  "case.door.status": "Final print fitted to a dorm knob",
  "case.door.brief":
    "A round knob needs grip and wrist torque. Someone with one hand, or carrying something, or without hands at all, cannot open it, and the Red Brick dorms are full of them.",
  "case.door.approach1":
    "A lever multiplies torque, so the brief became: how short can the arm be and still turn the knob with a push from a forearm or an elbow. The design also had to cost little enough to fit on every handle in a building, and look like something a resident would actually leave on the door.",
  "case.door.approach2":
    "It went through three generations: a flexible cup mock-up, a TPU design with flexible arms that gripped the knob, and the final PLA base with a TPU head, with each collet sized to the knob and rubber inlays for grip.",
  "case.door.outcome":
    "The final print fits a Red Brick knob. Presented to the ME 128 class and instructor.",

  // Alt text and captions for the rooms
  "alt.putter.hero": "The finished aluminium putter head on the green",
  "alt.putter.cad": "The finished putter head modelled in CAD, shaded",
  "alt.putter.cam": "The CAM simulation: toolpaths, cutter and stock",
  "alt.putter.machining": "The head in the vise mid-cut, chips on the fixture",
  "alt.putter.loft": "The part tilted on a pink 3D-printed shim in the vise, set up to cut the loft angle",
  "alt.putter.inuse": "The putter in use at Westlake Golf Course",
  "alt.putter.drawing": "The dimensioned engineering drawing",
  "cap.putter.cad": "The model, before any of it existed in metal.",
  "alt.putter.poster": "The CNC Milled Putter capstone poster: abstract, process, challenges and conclusion",
  "cap.putter.poster": "Presented at Capstone Night, Oaks Christian School: one of eight finalists chosen from more than forty, to over 200 alumni and hundreds of students.",
  "putter.aria": "The putter head in three dimensions, turning. Drag, or use the arrow keys, to turn it.",
  "cap.putter.stl": "The part itself, rendered live from the capstone's own model. Drag to turn it.",
  "cap.putter.cam": "The CAM simulation: adaptive toolpaths, stock and cutter.",
  "cap.putter.machining": "Mid-cut on the 3-axis Haas.",
  "cap.putter.loft": "Cutting the 3-degree loft angle: the part sits on a 3D-printed shim rather than in a tilted fixture.",
  "cap.putter.inuse": "In use at Westlake Golf Course.",
  "cap.putter.drawing": "The drawing the part was cut from.",

  "alt.ramps.hero": "Beachside Bank, cast concrete, on wet rock",
  "alt.ramps.quarter": "A cast-concrete quarter pipe against foliage",
  "alt.ramps.alt1": "A cast-concrete obstacle from the range",
  "alt.ramps.alt2": "A cast-concrete obstacle from the range",
  "cap.ramps.quarter": "The quarter pipe: the hardest mould in the range to release.",
  "cap.ramps.alt1": "From the range.",
  "cap.ramps.alt2": "From the range.",
  "alt.ramps.range":
    "The full range of cast-concrete obstacles laid out together: ledges, banks, quarter pipes and blocks",
  "cap.ramps.range": "The range in one frame: forty designs, all cast in-house.",
  "alt.ramps.chameleon": "A chameleon resting on one of the concrete ramps, with a fingerboard for scale",
  "cap.ramps.chameleon": 'The company\'s namesake, "Lucky", and a fingerboard for scale.',

  "cap.wave.inside": "The built prototype: the rack and its housing.",
  "alt.wave.hero": "The wave energy converter's internal mechanism",
  "alt.wave.base": "The converter's base and mounting",
  "cap.wave.base": "The base, machined in-house on the Bridgeport.",
  "alt.wave.section": "A cutaway of the housing: the rack running between two pinion stages",
  "alt.wave.poster": "The Based-Sea WEC capstone poster: task, strategy, problems and conclusions",
  "cap.wave.poster": "Presented at Capstone Night, Oaks Christian School, May 2023.",

  "alt.bot.poster": "A poster of the trading bot: the path an options alert takes from Discord to an order placed at the brokerage, with the parser, safety and sizing stages",
  "cap.bot.poster": "The system drawn as a poster: an alert's path from a chat message to a placed order.",
  "alt.bot.hero": "The operator display: broker link status and filled orders",
  "alt.bot.live":
    "The operator display running live: the broker link, the analyst grid and the open options positions",
  "cap.bot.live": "The display on the day the system first ran live against the broker.",

  "alt.campus.guides":
    "The marketplace listing guides at Cal Poly, each with their major, rating and rate per tour",
  "cap.campus.guides": "Guides listed at Cal Poly, with the rate each one sets for a tour.",
  "alt.campus.hero": "The Campus Native marketplace, live at campusnative.com",

  "alt.water.hero": "The distribution system on the site survey",
  "alt.water.map": "The network schematic: source, two tanks, and the same network labelled with pressures",
  "cap.water.map": "The network, and the same network with the pressure at every node.",

  "alt.door.hero": "The final Doorknob-Inator design in CAD: a black lever clamped around a brass knob",
  "alt.door.installed": "The printed adapter fitted to a dorm door knob",
  "cap.door.installed": "The final print, fitted to a Red Brick knob.",
  "alt.door.print": "The printed final adapter, black PLA base with red TPU grip inserts",
  "cap.door.print": "The final print: PLA base, TPU head.",
  "alt.door.first": "The first CAD design: a TPU lever with flexible arms around the knob",
  "cap.door.first": "Generation two: flexible TPU arms that grip the knob.",
  "alt.door.mockup": "The first mock-up: a flexible cup taped to a long handle, held against a knob",
  "cap.door.mockup": "Generation one: a cup and a long handle, to find the lever length.",

  // Awards
  "award.capstone.title": "Capstone Finalist: CNC Milled Putter",
  "award.capstone.issuer": "Oaks Christian School, Institute of Engineering",
  "award.capstone.body":
    "One of eight finalists chosen from more than forty capstone students, presented to over 200 alumni and industry professionals and hundreds of students.",
  "award.wave.title": "1st Place: Wave Energy Converter",
  "award.wave.issuer": "Oaks Christian School, Institute of Engineering",
  "award.wave.body":
    "First of five teams on measured output, converting wave oscillation to electrical power through a rack-and-pinion mechanism.",
  "award.presidents.title": "President's Honors List",
  "award.presidents.issuer": "California Polytechnic State University, San Luis Obispo",
  "award.presidents.body":
    "Awarded for reaching the Dean's List in all three quarters of the 2025–26 academic year.",
  "award.honors.title": "Cal Poly Honors Program",
  "award.honors.issuer": "California Polytechnic State University, San Luis Obispo",
  "award.honors.body":
    "Selective research-track programme built around enriched coursework, faculty-mentored research and interdisciplinary work.",
  "award.bridge.title": "1st Place: Noodle Bridge Design",
  "award.bridge.issuer": "Cal Poly College of Engineering",
  "award.bridge.body":
    "Longest structurally sound span from twenty 12-inch pieces and three feet of tape. The design worked the material's compressive strength against its poor shear resistance, and won by a 38.5% margin over second place.",
  "award.eagle.title": "Eagle Scout",
  "award.eagle.issuer": "Boy Scouts of America",
  "award.eagle.body": "Eagle rank; Senior Patrol Leader; fifteen years in the programme.",
} as const;

export type TranslationKey = keyof typeof en;
