import type { HatId, OutfitId, ProjectId, ToolId } from "./art/types";

/**
 * Everything Pocket Gallery SAYS. The figures are the site's own (src/i18n/en.ts,
 * the case.* keys); a battle move quotes one, so a change to a figure on the
 * site must be made here too. WERC lines say "model" wherever the site does.
 */

export type MoveType =
  | "CONTROLS" | "POWER" | "MACHINING" | "CAD" | "BUSINESS" | "DESIGN"
  | "ENERGY" | "TEAM" | "SOFTWARE" | "MARKETS";

export const TYPE_COLORS: Record<MoveType, string> = {
  CONTROLS: "#2596be",
  POWER: "#c98a1f",
  MACHINING: "#6f7a87",
  CAD: "#5866b8",
  BUSINESS: "#3a8a55",
  DESIGN: "#b4527a",
  ENERGY: "#c4632c",
  TEAM: "#7d62ad",
  SOFTWARE: "#3a7484",
  MARKETS: "#5f8433",
};

export interface Move {
  name: string;
  type: MoveType;
  /** Dialogue pages, each wrapped to the text box. */
  lines: string[];
  superEffective?: boolean;
}

export interface GameProject {
  id: ProjectId;
  /** The site room's slug, for VIEW ROOM. */
  slug: string;
  name: string;
  short: string;
  trainer: string;
  types: [MoveType, MoveType];
  intro: string;
  win: string;
  rematch: string;
  moves: Move[];
  /** What the work hits back with after each question. Flavour, but any figure must still be true. */
  counters: { name: string; line: string }[];
}

export const PROJECTS: GameProject[] = [
  {
    id: "werc",
    slug: "werc",
    name: "LUNAR CHARGER",
    short: "CHARGER",
    trainer: "ROVER CREW",
    types: ["CONTROLS", "POWER"],
    intro: "Our rover has to recharge itself at the lunar South Pole. No cables!",
    win: "That's the whole plan. The bench gets built in January.",
    rematch: "Back for another look at the charger?",
    counters: [{ name: "MOON DUST", line: "Charged dust clings to you. The vertical plates shed it, though." }, { name: "COLD SNAP", line: "Lunar shadow chills you to the bone." }, { name: "FIELD LINES", line: "You feel a tingle at 6.78 MHz." }],
    moves: [
      { name: "TEAM LEAD", type: "CONTROLS", lines: ["MICHAEL leads the 12-person team, on controls and integration.", "NASA Artemis task, WERC 2027."] },
      { name: "SELF-PARK", type: "CONTROLS", lines: ["The rover parks itself nose-first against a charging wall.", "Four small capacitances steer its last few centimetres in."] },
      { name: "1 kW MODEL", type: "POWER", lines: ["The model predicts 1.0 kW across a 100 mm gap at 87%.", "Required: 80%. Nothing here is measured yet."] },
      { name: "BENCH TARGET", type: "POWER", lines: ["Bench prototype: 25 W at 78%, also a model value.", "It has to fit a cold-test cooler. Built January 2027."] },
    ],
  },
  {
    id: "cnc",
    slug: "cnc",
    name: "CNC PUTTER",
    short: "PUTTER",
    trainer: "MACHINIST",
    types: ["MACHINING", "CAD"],
    intro: "I cut this putter out of solid aluminium. Want to see?",
    win: "Every chip of it came off a Haas. Thanks for looking!",
    rematch: "Want to see the putter again?",
    counters: [{ name: "CHIP SPRAY", line: "Hot aluminium chips fly at you!" }, { name: "COOLANT", line: "You are soaked in coolant." }, { name: "MIRROR FINISH", line: "The machined face dazzles you!" }],
    moves: [
      { name: "TWO OPS", type: "MACHINING", lines: ["Cut from a block of 6061 on a 3-axis Haas, in two operations."] },
      { name: "PROTOTYPES", type: "CAD", lines: ["Twelve PLA prototypes came before the metal one."] },
      { name: "COST CUT", type: "MACHINING", superEffective: true, lines: ["Modelled unit cost: $18.56.", "The retail putter it was compared with: $250."] },
      { name: "FINALIST", type: "CAD", lines: ["One of 8 capstone finalists chosen from 40+.", "Presented at Capstone Night to over 200 alumni."] },
    ],
  },
  {
    id: "ramps",
    slug: "ramps",
    name: "CHAMELEON RAMPS",
    short: "RAMPS",
    trainer: "SHOPKEEPER",
    types: ["BUSINESS", "DESIGN"],
    intro: "Seven years of cast-concrete ramps, 2019 to 2026. Take a look!",
    win: "From CAD to a shipped object, forty times over.",
    rematch: "Back to browse the ramps?",
    counters: [{ name: "CONCRETE DROP", line: "A cast-concrete ramp lands on your foot." }, { name: "TONGUE LASH", line: "The chameleon's tongue snaps at you!" }, { name: "COLOUR SHIFT", line: "It changes colour. You lose track of it." }],
    moves: [
      { name: "PRODUCT LINE", type: "DESIGN", lines: ["Over 40 designs, each taken from CAD to a shipped object."] },
      { name: "REVENUE", type: "BUSINESS", superEffective: true, lines: ["$39,600 in revenue across 627 orders."] },
      { name: "WASTE CUT", type: "DESIGN", lines: ["An in-house moulding process cut material waste by about 40%."] },
      { name: "WORLDWIDE", type: "BUSINESS", lines: ["Orders shipped to 15 countries."] },
    ],
  },
  {
    id: "wave",
    slug: "wave",
    name: "WAVE ENERGY",
    short: "WAVE",
    trainer: "SAILOR",
    types: ["ENERGY", "TEAM"],
    intro: "We turned the up-and-down of a wave into volts. Ready?",
    win: "First of five teams, on measured output. Not bad, right?",
    rematch: "Ride the wave one more time?",
    counters: [{ name: "SPLASH", line: "A wave soaks you to the knees." }, { name: "UNDERTOW", line: "The float drags you up and down." }, { name: "SURGE", line: "A generator spins up and zaps you!" }],
    moves: [
      { name: "TEAM LEAD", type: "TEAM", lines: ["MICHAEL led a team of five, from design to manufacture."] },
      { name: "RACK+PINION", type: "ENERGY", lines: ["A float drives a rack. The rack turns two pinion stages.", "The pinions drive the generators."] },
      { name: "120 VOLTS", type: "ENERGY", lines: ["The 1:12-scale prototype made 120 V, 15 V per motor.", "Built full size, that projects to 360 V."] },
      { name: "FIRST PLACE", type: "TEAM", superEffective: true, lines: ["First place of five teams, on measured output."] },
    ],
  },
  {
    id: "bot",
    slug: "bot",
    name: "SMC BOT",
    short: "BOT",
    trainer: "TRADER",
    types: ["SOFTWARE", "MARKETS"],
    intro: "My bot places real trades on its own. No human in the loop.",
    win: "Correct orders, or nothing at all. That's the rule.",
    rematch: "The bot never sleeps. Another look?",
    counters: [{ name: "FLASH FILL", line: "An order fills before you can blink." }, { name: "STOP LOSS", line: "It cuts its losses. And your HP." }, { name: "SKIP", line: "It skips anything ambiguous. Including your guard." }],
    moves: [
      { name: "PARSER", type: "SOFTWARE", lines: ["It reads options alerts as they post, and decides if each one is tradeable."] },
      { name: "LIVE ORDERS", type: "MARKETS", lines: ["Options run live on a funded Webull account, 24/7.", "Futures run on a Tradovate demo account."] },
      { name: "TEST SUITE", type: "SOFTWARE", lines: ["Every fill spends real money, so a regression suite holds the whole order path."] },
      { name: "WORST CASE", type: "MARKETS", lines: ["Parameters were picked on their worst case, never their best."] },
    ],
  },
  {
    id: "campus",
    slug: "campus",
    name: "CAMPUS NATIVE",
    short: "CAMPUS",
    trainer: "GUIDE",
    types: ["SOFTWARE", "BUSINESS"],
    intro: "Campus tours led by real students. It's live right now!",
    win: "Book a person, not a slot. See you on campus!",
    rematch: "Want the tour again?",
    counters: [{ name: "WALKING TOUR", line: "You walk the whole campus. Your feet hurt." }, { name: "BOOKED UP", line: "Every slot is taken. You wait in line." }, { name: "PIN DROP", line: "A giant map pin drops on you!" }],
    moves: [
      { name: "FOUNDER", type: "BUSINESS", lines: ["MICHAEL founded it, and led a 4-person intern team."] },
      { name: "MATCHMAKER", type: "SOFTWARE", lines: ["Guides are matched to visitors by major and interest."] },
      { name: "NO DOUBLES", type: "SOFTWARE", lines: ["The database itself blocks double-booking, not the app."] },
      { name: "LIVE SITE", type: "BUSINESS", lines: ["Live at campusnative.com, booking and payment end to end."] },
    ],
  },
];

export const PROJECT_BY_ID = Object.fromEntries(PROJECTS.map((p) => [p.id, p])) as Record<ProjectId, GameProject>;

/** Coins: first win, rematch win, first look at a work's frame. */
export const REWARD = { win: 100, rematch: 25, inspect: 10 };

export type ItemKind = "hat" | "outfit" | "tool";
export interface Item {
  kind: ItemKind;
  id: HatId | OutfitId | Exclude<ToolId, "none">;
  name: string;
  price: number;
  blurb: string;
}

export const ITEMS: Item[] = [
  { kind: "hat", id: "cap", name: "BALL CAP", price: 0, blurb: "The cyan cap you walked in with." },
  { kind: "hat", id: "beanie", name: "BEANIE", price: 60, blurb: "For cold-test chambers." },
  { kind: "hat", id: "hardhat", name: "HARD HAT", price: 100, blurb: "Shop floor rated." },
  { kind: "hat", id: "propeller", name: "PROPELLER", price: 150, blurb: "Generates no lift. Looks great." },
  { kind: "hat", id: "mortarboard", name: "GRAD CAP", price: 180, blurb: "Class of 2028." },
  { kind: "hat", id: "tophat", name: "TOP HAT", price: 220, blurb: "For capstone night." },
  { kind: "hat", id: "welding", name: "WELD HOOD", price: 260, blurb: "Flipped up, for now." },
  { kind: "outfit", id: "tee", name: "PLAIN TEE", price: 0, blurb: "Comfortable. Classic." },
  { kind: "outfit", id: "hoodie", name: "HOODIE", price: 80, blurb: "Standard issue for late builds." },
  { kind: "outfit", id: "apron", name: "SHOP APRON", price: 120, blurb: "Leather. Chip-proof." },
  { kind: "outfit", id: "hivis", name: "HI-VIS VEST", price: 140, blurb: "You will be seen." },
  { kind: "outfit", id: "labcoat", name: "LAB COAT", price: 200, blurb: "Instantly 20% more credible." },
  { kind: "outfit", id: "flightsuit", name: "FLIGHT SUIT", price: 280, blurb: "Mission orange." },
  { kind: "tool", id: "wrench", name: "WRENCH", price: 50, blurb: "Righty tighty." },
  { kind: "tool", id: "calipers", name: "CALIPERS", price: 120, blurb: "Reads to 0.01 mm." },
  { kind: "tool", id: "solder", name: "IRON", price: 160, blurb: "A soldering iron at 350 C." },
  { kind: "tool", id: "torque", name: "TORQUE KEY", price: 220, blurb: "Clicks at spec. Every time." },
  { kind: "tool", id: "plasma", name: "PLASMA", price: 320, blurb: "A plasma cutter. Handle with care." },
];
