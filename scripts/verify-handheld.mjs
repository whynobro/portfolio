/**
 * Checks Pocket Gallery against the site and against itself.
 *
 *   node scripts/verify-handheld.mjs
 *
 * 1. Every figure a battle move quotes ($18.56, 87%, 627...) appears in the
 *    site's own copy (src/i18n/en.ts), or in FACTS below with its source. The
 *    game is a second place the figures live; this keeps it from drifting.
 * 2. Every sprite in every art module is a well-formed grid with a complete
 *    palette.
 * 3. The map: rows match its size, every trainer/clerk/start stands on open
 *    floor, each trainer has open sight tiles in front of it, every trainer
 *    and work is reachable from the start, and nothing a trainer stands on is
 *    another trainer's only way through.
 *
 * Exits 1 on any failure.
 */
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Figures that are true but are not in en.ts, each with where it comes from. */
const FACTS = {
  "12": "12 PLA prototypes: CLAUDE.md Works table (cnc)",
  "1": "ordinal or count words (1st, one of) are not figures",
};

const fails = [];
const load = async (entry) => {
  const out = await build({ entryPoints: [resolve(entry)], bundle: true, write: false, format: "esm", platform: "neutral", target: "es2022" });
  const url = "data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64");
  return import(url);
};

// ---- 1. figures ------------------------------------------------------------
const en = readFileSync("src/i18n/en.ts", "utf8").replace(/ /g, " ");
const enDigits = en.replace(/,(?=\d{3})/g, "");
const { PROJECTS } = await load("src/handheld/data.ts");
let figures = 0;
for (const p of PROJECTS) {
  for (const m of p.moves) {
    for (const line of m.lines) {
      for (const raw of line.match(/\d[\d,.]*\d|\d/g) ?? []) {
        const n = raw.replace(/,(?=\d{3})/g, "").replace(/\.$/, "");
        figures++;
        if (FACTS[n]) continue;
        const re = new RegExp(`(^|[^\\d.])${n.replace(/\./g, "\\.")}(?![\\d])`);
        if (!re.test(enDigits)) fails.push(`figure "${raw}" in ${p.id} / ${m.name} is not in src/i18n/en.ts: "${line}"`);
      }
    }
  }
}
if (!PROJECTS.find((p) => p.id === "werc")?.moves.every((m) => m.type !== "POWER" || m.lines.join(" ").includes("model"))) {
  fails.push("a WERC POWER move quotes a figure without saying it is a model value");
}

// ---- 2. sprites ---------------------------------------------------------------
const SLOTS = ["skin", "skinShade", "hair", "hairShade", "top", "topShade", "topLight", "bottom", "bottomShade", "shoe", "outline"];
let sprites = 0;
const isSprite = (v) => v && typeof v === "object" && typeof v.w === "number" && Array.isArray(v.rows) && v.pal;
function walk(v, path, depth) {
  if (depth > 6 || v == null) return;
  if (isSprite(v)) {
    sprites++;
    if (v.rows.length !== v.h) fails.push(`${path}: ${v.rows.length} rows, h=${v.h}`);
    v.rows.forEach((r, y) => {
      if (r.length !== v.w) fails.push(`${path}: row ${y} is ${r.length} wide, w=${v.w}`);
      for (const ch of r) if (ch !== "." && !(ch in v.pal)) return fails.push(`${path}: row ${y} char '${ch}' missing from pal`);
    });
    for (const [k, c] of Object.entries(v.pal)) {
      if (c.startsWith("$") ? !SLOTS.includes(c.slice(1)) : !/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(c)) fails.push(`${path}: pal '${k}' = "${c}" is not a colour or slot`);
    }
    return;
  }
  if (typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k, depth + 1);
}
for (const mod of ["monsters", "people", "battle", "tiles", "font"]) {
  try {
    walk(await load(`src/handheld/art/${mod}.ts`), mod, 0);
  } catch (e) {
    fails.push(`art/${mod}.ts failed to load: ${e.message}`);
  }
}

// ---- 3. the map ------------------------------------------------------------------
const { GALLERY: m } = await load("src/handheld/art/map.ts");
const { PROPS, TILES } = await load("src/handheld/art/tiles.ts");
const open = (x, y) => (m.solid[y] ?? "")[x] === ".";
if (m.solid.length !== m.h || m.floor.length !== m.h) fails.push(`map: solid/floor rows do not match h=${m.h}`);
m.solid.forEach((r, y) => r.length !== m.w && fails.push(`map: solid row ${y} is ${r.length} wide`));
m.floor.forEach((r, y) => {
  if (r.length !== m.w) fails.push(`map: floor row ${y} is ${r.length} wide`);
  for (const ch of r) if (!m.legend[ch] || !TILES[m.legend[ch]]) return fails.push(`map: floor row ${y} char '${ch}' has no tile`);
});
for (const p of m.props) if (!PROPS[p.id]) fails.push(`map: prop "${p.id}" is not in PROPS`);
const people = [["start", m.start], ["clerk", m.clerk], ...Object.entries(m.trainers)];
const occupied = new Set(people.map(([, p]) => `${p[0]},${p[1]}`));
// The clerk stands behind the counter, on a tile the player cannot enter.
for (const [who, p] of people) if (who !== "clerk" && !open(p[0], p[1])) fails.push(`map: ${who} stands on a blocked tile (${p[0]},${p[1]})`);
const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
for (const [id, [x, y, d]] of Object.entries(m.trainers)) {
  const [dx, dy] = D[d];
  let lane = 0;
  for (let i = 1; i <= 3 && open(x + dx * i, y + dy * i) && !occupied.has(`${x + dx * i},${y + dy * i}`); i++) lane++;
  if (lane < 2) fails.push(`map: trainer ${id} has only ${lane} open sight tile(s)`);
}
// Reachability from the start, walking around every person but the player.
const seen = new Set([`${m.start[0]},${m.start[1]}`]);
const queue = [[m.start[0], m.start[1]]];
while (queue.length) {
  const [x, y] = queue.shift();
  for (const [dx, dy] of Object.values(D)) {
    const k = `${x + dx},${y + dy}`;
    if (seen.has(k) || !open(x + dx, y + dy) || occupied.has(k)) continue;
    seen.add(k);
    queue.push([x + dx, y + dy]);
  }
}
const adjacentReached = (x, y) => Object.values(D).some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`));
for (const [id, [x, y]] of Object.entries(m.trainers)) if (!adjacentReached(x, y)) fails.push(`map: trainer ${id} cannot be reached`);
for (const [id, [x, y]] of Object.entries(m.works)) if (!adjacentReached(x, y)) fails.push(`map: work ${id} cannot be inspected from any reachable tile`);
for (const [what, [x, y]] of [["counter", m.counter], ["sign", m.sign], ["exit", m.exit]]) if (!adjacentReached(x, y)) fails.push(`map: ${what} cannot be reached`);

console.log(`${figures} figures, ${sprites} sprites, ${m.w}x${m.h} map, ${seen.size} reachable tiles`);
if (fails.length) {
  console.error("FAIL\n" + fails.join("\n"));
  process.exit(1);
}
console.log("OK");
