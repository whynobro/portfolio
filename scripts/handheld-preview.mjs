/**
 * Contact sheet for Pocket Gallery art: bundles one art module, draws every
 * exported Sprite (found anywhere inside its exports) at a chosen scale with
 * its export path as a label, and validates the grids.
 *
 *   node scripts/handheld-preview.mjs src/handheld/art/monsters.ts out.png [--scale=4] [--bg=#f7f5f1]
 *
 * Exported functions named draw* are called as fn(ctx, 0) on a 256x192 canvas
 * and shown too (battle backdrops and the like). `$slot` colours resolve from
 * the default look below, or from --look=<exportName> when the module exports
 * a Record of looks (its first entry is used).
 *
 * Prints PROBLEMS (bad row counts, bad widths, characters missing from the
 * palette, unresolved slots) and exits 1 if there are any.
 */
import { build } from "esbuild";
import { chromium } from "playwright";
import { resolve } from "node:path";

const [entry, out = "handheld-preview.png", ...rest] = process.argv.slice(2);
if (!entry) {
  console.error("usage: node scripts/handheld-preview.mjs <module.ts> <out.png> [--scale=4] [--bg=#hex]");
  process.exit(2);
}
const opt = Object.fromEntries(rest.map((a) => a.replace(/^--/, "").split("=")));
const scale = Number(opt.scale ?? 4);
const bg = opt.bg ?? "#f7f5f1";

const bundle = await build({
  entryPoints: [resolve(entry)],
  bundle: true,
  write: false,
  format: "iife",
  globalName: "ART",
  platform: "browser",
  target: "es2022",
});
const code = bundle.outputFiles[0].text;

const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:${bg};font:11px monospace">
<div id="sheet" style="display:flex;flex-wrap:wrap;gap:14px;padding:14px;align-items:flex-end;width:1500px"></div>
<script>${code}</script>
<script>
const DEFAULT_LOOK = { skin:"#f0c29a", skinShade:"#d09a72", hair:"#4a3022", hairShade:"#2e1d14", top:"#e8e2d4",
  topShade:"#b9b1a0", topLight:"#ffffff", bottom:"#3a4252", bottomShade:"#262c38", shoe:"#2a2420", outline:"#1d1a24" };
let look = DEFAULT_LOOK;
const lookName = ${JSON.stringify(opt.look ?? "")};
if (lookName && ART[lookName]) { const first = Object.values(ART[lookName])[0]; if (first) look = { ...DEFAULT_LOOK, ...first }; }
const problems = [];
const isSprite = (v) => v && typeof v === "object" && typeof v.w === "number" && typeof v.h === "number" && Array.isArray(v.rows) && v.pal;
function check(name, s) {
  if (s.rows.length !== s.h) problems.push(name + ": " + s.rows.length + " rows, h=" + s.h);
  s.rows.forEach((r, y) => {
    if (r.length !== s.w) problems.push(name + ": row " + y + " is " + r.length + " wide, w=" + s.w);
    for (const ch of r) if (ch !== "." && !(ch in s.pal)) { problems.push(name + ": row " + y + " char '" + ch + "' not in pal"); break; }
  });
  for (const [k, v] of Object.entries(s.pal)) if (v.startsWith("$") && !(v.slice(1) in look)) problems.push(name + ": pal '" + k + "' slot " + v + " unknown");
}
function draw(s) {
  const c = document.createElement("canvas"); c.width = s.w; c.height = s.h;
  const g = c.getContext("2d");
  s.rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const ch = r[x]; if (ch === ".") continue;
    let col = s.pal[ch]; if (!col) continue; if (col.startsWith("$")) col = look[col.slice(1)] || "#ff00ff"; g.fillStyle = col; g.fillRect(x, y, 1, 1); } });
  c.style.width = s.w * ${scale} + "px"; c.style.height = s.h * ${scale} + "px"; c.style.imageRendering = "pixelated";
  return c;
}
function add(label, node) {
  const fig = document.createElement("figure"); fig.style.margin = "0";
  const cap = document.createElement("figcaption"); cap.textContent = label;
  fig.append(node, cap); document.getElementById("sheet").append(fig);
}
function walk(v, path, depth) {
  if (depth > 6 || v == null) return;
  if (isSprite(v)) { check(path, v); add(path, draw(v)); return; }
  if (typeof v === "function" && /^draw/.test(path.split(".").pop())) {
    const c = document.createElement("canvas"); c.width = 256; c.height = 192;
    try { v(c.getContext("2d"), 0); } catch (e) { problems.push(path + " threw: " + e.message); }
    c.style.width = 256 * 2 + "px"; c.style.imageRendering = "pixelated"; add(path + "()", c); return;
  }
  if (typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, path ? path + "." + k : k, depth + 1);
}
walk(ART, "", 0);
window.__problems = problems;
</script>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1528, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.setContent(html);
const problems = await page.evaluate(() => window.__problems);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
const all = [...errors.map((e) => "page error: " + e), ...problems];
console.log(all.length ? "PROBLEMS\n" + all.join("\n") : "OK: no problems");
console.log("wrote " + out);
process.exit(all.length ? 1 : 0);
