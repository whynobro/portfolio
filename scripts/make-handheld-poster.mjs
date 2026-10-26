/**
 * Draws the poster on the wall tile's little screen from the real game: opens
 * Pocket Gallery, starts the putter battle, waits for the move menu and saves
 * the top screen at native 256x192.
 *
 *   npm run dev                                         # must already be running
 *   node scripts/make-handheld-poster.mjs [url]         # -> src/assets/img/handheld-poster.png
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:5173/?shots=1";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url);
await page.waitForTimeout(800);
await page.locator("[data-handheld]").click();
await page.waitForFunction(() => !!window.__pocket);
const state = () => page.evaluate(() => window.__pocket.state());
const until = async (done) => {
  for (let i = 0; i < 400; i++) {
    const s = await state();
    if (done(s)) return;
    if (s.dialog && !s.typing && !s.busy) await page.keyboard.press("z");
    await page.waitForTimeout(100);
  }
  throw new Error("poster: game never reached the wanted state");
};
await until((s) => s.mode === "walk" && !s.dialog);
await page.evaluate(() => window.__pocket.activate("work-cnc"));
await until((s) => s.menu);
await page.waitForTimeout(300);
const data = await page.evaluate(() => document.querySelector(".hh__screen--top").toDataURL("image/png"));
writeFileSync("src/assets/img/handheld-poster.png", Buffer.from(data.split(",")[1], "base64"));
console.log("wrote src/assets/img/handheld-poster.png");
await browser.close();
