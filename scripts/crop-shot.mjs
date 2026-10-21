/**
 * Screenshot ONE element of a live page: `node scripts/crop-shot.mjs <url> <out.png> <selector> [w] [h]`.
 * For checking a scene or a frame up close, where a full-page shot is too small to read.
 */
import { chromium } from "playwright";
const [url, out, sel, w, h] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w || 1280, height: +h || 900 } });
await p.goto(url);
await p.waitForTimeout(2500);
const el = await p.$(sel);
await el.scrollIntoViewIfNeeded();
await p.waitForTimeout(1500);
await el.screenshot({ path: out });
await b.close();
