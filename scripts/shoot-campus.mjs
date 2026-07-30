/**
 * Captures the Campus Native marketplace for the gallery wall.
 *
 *   node scripts/shoot-campus.mjs
 *
 * The work hung until now was the transparent logo on the mat colour, which
 * shows the brand and not the software. This shoots the live product instead —
 * the claim on the label is "live in production", and a screenshot of the
 * running site is what makes that claim visible rather than asserted.
 *
 * Output: assets-src/campus-native/site-home.png, ready for prep-images.mjs.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const URL = "https://www.campusnative.com/";
const OUT = "assets-src/campus-native";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({
    // 3:2, matching the frame the work hangs in, so nothing is cropped later.
    viewport: { width: 1500, height: 1000 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 });
  // Hero imagery and web fonts land after networkidle on this stack.
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(2500);

  // A cookie banner or a chat bubble is chrome, not product.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const s = getComputedStyle(el);
      if (s.position !== "fixed") continue;
      const txt = (el.textContent ?? "").toLowerCase();
      if (/cookie|consent|accept all|chat/.test(txt)) el.remove();
    }
  });
  await page.addStyleTag({ content: "*{animation:none !important;transition:none !important}" });
  await page.waitForTimeout(200);

  const out = path.join(OUT, "site-home.png");
  await page.screenshot({ path: out, fullPage: false });
  console.log(`wrote ${out}`);
  await ctx.close();
} finally {
  await browser.close();
}
