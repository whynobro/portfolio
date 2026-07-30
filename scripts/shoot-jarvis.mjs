/**
 * Captures the execution system's operator dashboard for the gallery wall.
 *
 *   node scripts/shoot-jarvis.mjs
 *
 * The dashboard is a LIVE REAL-MONEY display, reached over Tailscale. What is
 * worth hanging is the system working — the broker link, the order lifecycle,
 * contracts filling at a price — and NOT the account behind it. So the capture
 * is composed to exclude account state rather than to retouch it:
 *
 *   - The arc reactor and the P&L trajectory are `<canvas>`, drawn from the
 *     day's P&L. Their colour alone discloses the result, and no DOM edit can
 *     reach pixels, so their panels are removed from the frame entirely.
 *   - The realized / total / unreal / cash readouts and the per-analyst P&L and
 *     win-rate rows are dropped for the same reason.
 *   - The Order History table stays as it is. Contract, side, quantity, FILLED
 *     and the fill price are the execution record; a fill price is public option
 *     market data, not a balance.
 *
 * Nothing is rewritten to read better than it is. An edited P&L on a portfolio
 * is a fabricated financial record, and the label's actual claims (1553 tests,
 * options live) are verifiable without help from a screenshot.
 *
 * Output: assets-src/smc-bot/jarvis-<name>.png, ready for prep-images.mjs.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const URL = "https://smcbot.tail416145.ts.net/";
const OUT = "assets-src/smc-bot";

/**
 * Runs in the page. Strips every panel and readout that carries account state,
 * leaving the status chrome and the order lifecycle.
 */
function compose() {
  const drop = (sel) => document.querySelectorAll(sel).forEach((el) => el.remove());

  // The two canvases and their panels: P&L by colour as much as by number.
  drop(".panel.reactor");
  drop("#arc");
  drop("#pnl");
  for (const h of document.querySelectorAll("h2")) {
    if (/trajectory/i.test(h.textContent ?? "")) h.closest(".panel")?.remove();
  }

  // The analyst panel is P&L, win rate and budget by definition — its heading
  // says so. Stripping those rows leaves six cards reading "OPEN 0", which
  // photographs as a broken panel, so the whole panel goes.
  document.getElementById("analysts")?.closest(".panel")?.remove();

  // The empty-market placeholder reads as a broken panel rather than a quiet
  // one. Drop the open-positions panel when there is nothing in it.
  const posBody = document.getElementById("positions");
  if (posBody && /scanning|no open/i.test(posBody.textContent ?? "")) {
    posBody.closest(".panel")?.remove();
  }

  // The activity log is raw library logging: it carries the Discord control
  // channel id and gateway session ids, and reads as a stack trace rather than
  // as an instrument.
  document.getElementById("log")?.closest(".panel")?.remove();

  // Any straggling currency outside the order table (a budget cell, a footer).
  const table = document.getElementById("trades")?.closest("table");
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walk.nextNode()) {
    const n = walk.currentNode;
    if (table?.contains(n)) continue;
    if (/[+-]?\$[\d,]+(\.\d\d)?/.test(n.nodeValue ?? "")) hits.push(n);
  }
  for (const n of hits) n.nodeValue = (n.nodeValue ?? "").replace(/[+-]?\$[\d,]+(\.\d\d)?/g, "—");
}

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({
    // 1180 wide keeps the order table's nine columns intact while leaving the
    // composed frame close to 3:2 — the wall's aspect — so the letterbox
    // prep-images adds is a thin band rather than a quarter of the window.
    viewport: { width: 1180, height: 900 },
    // The wall shows this at ~700px wide; 2x keeps the monospace type crisp.
    deviceScaleFactor: 2,
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  // The order table is filled by a poll after first paint, so wait for a row
  // rather than a fixed delay — an empty table is the one thing not worth
  // photographing.
  await page.waitForFunction(
    () => /FILLED|WORKING|CANCEL/i.test(document.getElementById("trades")?.textContent ?? ""),
    { timeout: 20000 },
  );
  // The connection pill flaps to a red LINK LOST between polls when the page has
  // been idle. A dropped broker link is not what this piece is about, so wait
  // for the link to read OK before the shutter opens.
  await page.waitForFunction(
    () => /ok/i.test(document.getElementById("conn")?.textContent ?? ""),
    { timeout: 30000 },
  );
  await page.evaluate(compose);
  await page.addStyleTag({
    content: `*{animation:none !important;transition:none !important}
              body{padding-bottom:0 !important}`,
  });
  await page.waitForTimeout(200);

  // Removing three panels leaves the viewport taller than what is left, and
  // `fullPage` then pads the frame with empty wall. Clip to the content's own
  // height so the piece is filled edge to edge.
  const h = await page.evaluate(() => {
    const foot = document.querySelector(".foot");
    return Math.ceil((foot?.getBoundingClientRect().bottom ?? document.body.scrollHeight) + 18);
  });

  const out = path.join(OUT, "jarvis-operator.png");
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1180, height: h } });
  console.log(`wrote ${out}`);
  await ctx.close();
} finally {
  await browser.close();
}
