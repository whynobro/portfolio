/**
 * Size gate for the single-file build.
 *
 *   node scripts/size.mjs
 *
 * The whole site ships as one dist/index.html with fonts and images inlined as
 * base64 (which costs ~33% over binary), so size has to be watched actively
 * rather than checked once at the end. Exceeding the budget is a signal to move
 * a case study into its own file, not to quietly ship a 3 MB page.
 */
import { stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";

const BUDGET_BYTES = 900 * 1024;
const FILE = "dist/index.html";

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

let info;
try {
  info = await stat(FILE);
} catch {
  console.error(`No ${FILE} — run \`npm run build\` first.`);
  process.exit(1);
}

const raw = info.size;
const gzipped = gzipSync(await readFile(FILE)).length;
const pct = ((raw / BUDGET_BYTES) * 100).toFixed(0);

console.log(`${FILE}`);
console.log(`  raw     ${kb(raw)}  (${pct}% of ${kb(BUDGET_BYTES)} budget)`);
console.log(`  gzipped ${kb(gzipped)}`);

if (raw > BUDGET_BYTES) {
  console.error(`\nOVER BUDGET by ${kb(raw - BUDGET_BYTES)}.`);
  process.exit(1);
}
console.log(`\nWithin budget (${kb(BUDGET_BYTES - raw)} headroom).`);
