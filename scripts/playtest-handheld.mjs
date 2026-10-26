/**
 * Plays Pocket Gallery end to end in a real browser and asserts what happened.
 *
 *   npm run dev                                   # must already be running
 *   node scripts/playtest-handheld.mjs [url] [outDir]
 *
 * Drives the game through window.__pocket (state + activate) and the keyboard,
 * waiting on game state rather than on timers, then checks: a full battle pays
 * out and marks the work seen, the shop sells and equips, Esc closes the
 * dialog, progress survives a reload, reduced motion plays without errors, and
 * the phone layout opens. Screenshots of each step land in outDir.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:5173/?shots=1";
const out = process.argv[3] ?? "screenshots/local/handheld";
mkdirSync(out, { recursive: true });

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

const browser = await chromium.launch();
const errors = [];

async function open(page) {
  await page.goto(url);
  await page.waitForTimeout(800);
  await page.locator("[data-handheld]").click();
  await page.waitForFunction(() => !!window.__pocket, null, { timeout: 15000 });
}
const state = (page) => page.evaluate(() => window.__pocket.state());
const sleep = (page, ms) => page.waitForTimeout(ms);

/** Press A through dialogue until `done(state)` holds. */
async function until(page, done, { act, limit = 60000 } = {}) {
  const t0 = Date.now();
  for (;;) {
    const s = await state(page);
    if (done(s)) return s;
    if (Date.now() - t0 > limit) throw new Error("timed out in state " + JSON.stringify(s));
    if (act && (await act(s))) {
      await sleep(page, 150);
      continue;
    }
    if (s.dialog && !s.typing && !s.busy) await page.keyboard.press("z");
    await sleep(page, 120);
  }
}

let lowestHp = 1;
let zeroHp = false;
async function winBattle(page, id, shots) {
  await page.evaluate((k) => window.__pocket.activate(k), `work-${id}`);
  let moves = 0;
  await until(page, (s) => s.scene === "world" && s.mode === "walk" && !s.dialog, {
    act: async (s) => {
      if (s.myHp !== null) {
        lowestHp = Math.min(lowestHp, s.myHp);
        if (s.myHp <= 0) zeroHp = true;
      }
      if (!s.menu) return false;
      await page.evaluate((k) => window.__pocket.activate(k), `move-${moves}`);
      if (shots && moves === 0) {
        await sleep(page, 380);
        await page.screenshot({ path: `${out}/${shots}-attack.png` });
        await sleep(page, 450);
        await page.screenshot({ path: `${out}/${shots}-hit.png` });
      }
      moves++;
      return true;
    },
  });
  return moves;
}

// ---- Desktop: battle, shop, wardrobe, exit, persistence -----------------------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", (e) => errors.push("desktop: " + e.message));
  page.on("console", (m) => m.type() === "error" && errors.push("desktop console: " + m.text()));
  await open(page);
  await page.screenshot({ path: `${out}/1-open.png` });
  // Some browsers open a dialog with focus on its first button: the game
  // must still hear Z from there.
  await page.locator("[data-exit]").focus();
  const before = (await state(page)).dialog;
  await sleep(page, 900);
  await page.keyboard.press("z");
  await sleep(page, 200);
  check("keys reach the game with Exit focused", (await state(page)).dialog !== before);
  await until(page, (s) => s.mode === "walk" && !s.dialog);

  const moves = await winBattle(page, "cnc", "2-cnc");
  let s = await state(page);
  check("battle: all four moves asked", moves === 4, `moves=${moves}`);
  check("battle: win pays 100 coins", s.coins === 100, `coins=${s.coins}`);
  check("battle: work marked seen", s.beaten.includes("cnc"));
  check("battle: the work hits back (your HP drops)", lowestHp < 0.9, `lowest ${lowestHp}`);
  check("battle: your HP never reaches zero", !zeroHp && lowestHp > 0, `lowest ${lowestHp}`);
  await page.screenshot({ path: `${out}/3-after-battle.png` });

  // Walk to the gift-shop counter: left along the entrance row, then face up.
  await page.keyboard.down("ArrowLeft");
  await page.waitForFunction(() => window.__pocket.state().player.x <= 2, null, { timeout: 10000 }).catch(() => {});
  await page.keyboard.up("ArrowLeft");
  await sleep(page, 250);
  await page.keyboard.press("ArrowUp");
  await sleep(page, 120);
  await page.keyboard.press("z");
  s = await until(page, (st) => st.bottom === "shop" && !st.dialog);
  check("shop: talking to the clerk opens the shop", s.bottom === "shop", JSON.stringify(s.player));
  await page.evaluate(() => {
    window.__pocket.activate("shop-tab-tool");
  });
  await sleep(page, 100);
  await page.evaluate(() => window.__pocket.activate("item-wrench"));
  await sleep(page, 100);
  await page.screenshot({ path: `${out}/4-shop.png` });
  await page.evaluate(() => window.__pocket.activate("shop-buy"));
  s = await until(page, (st) => !st.dialog || st.typing === false, { limit: 5000 });
  s = await state(page);
  check("shop: buying the wrench costs 50", s.coins === 50, `coins=${s.coins}`);
  check("shop: wrench owned and equipped", s.owned.includes("wrench") && s.equip.tool === "wrench", JSON.stringify(s.equip));
  await page.screenshot({ path: `${out}/5-bought.png` });
  await until(page, (st) => !st.dialog);
  await page.keyboard.press("x");
  await until(page, (st) => st.mode === "walk" && !st.dialog && st.bottom === "menu");

  await winBattle(page, "ramps", "6-ramps");
  s = await state(page);
  check("second battle pays out", s.coins === 150, `coins=${s.coins}`);

  await page.keyboard.press("Escape");
  await sleep(page, 300);
  check("Esc closes the game", !(await page.evaluate(() => document.querySelector("dialog.hh")?.open)));
  await page.reload();
  await open(page);
  await sleep(page, 400);
  s = await state(page);
  check("progress survives a reload", s.coins === 150 && s.beaten.length === 2 && s.equip.tool === "wrench", JSON.stringify({ coins: s.coins, beaten: s.beaten }));
  await page.screenshot({ path: `${out}/7-reopened.png` });
  await page.locator("[data-exit]").click();
  await sleep(page, 300);
  check("Exit button closes the game", !(await page.evaluate(() => document.querySelector("dialog.hh")?.open)));
  await page.close();
}

// ---- Regressions from review: B at a choice, keyboard on the mirror, saves, input ----
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", (e) => errors.push("regress: " + e.message));
  // A stale or tampered save: right ids, wrong slots, absurd coins.
  await page.goto(url);
  await page.evaluate(() =>
    localStorage.setItem("pocket-gallery.v1", JSON.stringify({ v: 1, coins: 1e999, owned: ["tee", "cap", "wrench"], equip: { hat: "tee", outfit: "cap", tool: "cap" }, met: [], beaten: [], inspected: [] })),
  );
  await open(page);
  await until(page, (s) => s.mode === "walk" && !s.dialog);
  let s = await state(page);
  check("tampered save: loads with safe equipment", s.equip.hat === "cap" && s.equip.outfit === "tee" && s.equip.tool === "none" && s.coins === 0, JSON.stringify({ e: s.equip, c: s.coins }));

  // B at "Leave the gallery?" must STAY.
  await page.keyboard.down("ArrowDown");
  await page.waitForFunction(() => window.__pocket.state().choice !== null || window.__pocket.state().dialog !== null, null, { timeout: 8000 }).catch(() => {});
  await page.keyboard.up("ArrowDown");
  s = await until(page, (st) => st.choice !== null, { limit: 8000 });
  await page.keyboard.press("x");
  await sleep(page, 600);
  s = await state(page);
  check("B at the leave prompt stays in the game", (await page.evaluate(() => document.querySelector("dialog.hh")?.open)) && s.player.y < 17, JSON.stringify(s.player));
  await until(page, (st) => st.mode === "walk" && !st.dialog);

  // Two activations in one frame start one battle.
  await page.evaluate(() => {
    window.__pocket.activate("work-cnc");
    window.__pocket.activate("work-ramps");
  });
  s = await until(page, (st) => st.menu);
  const head = await page.evaluate(() => [...document.querySelectorAll("[data-mirror] button")].map((b) => b.textContent).join("|"));
  check("double tap starts one battle", head.includes("TWO OPS") && !head.includes("REVENUE"), head.slice(0, 80));

  // Screen-reader mirror: activating a move keeps focus in the mirror, and Z still advances.
  await page.locator('[data-mirror] button[data-key="move-0"]').focus();
  await page.keyboard.press("Enter");
  await sleep(page, 300);
  const inMirror = await page.evaluate(() => !!document.activeElement?.closest("[data-mirror]"));
  check("mirror keeps focus after a move", inMirror);
  s = await until(page, (st) => st.menu, { limit: 20000 });
  check("Z advances text from the mirror", s.menu);

  // B twice, mid-animation, gets you out of a battle you just started.
  await until(page, (st) => st.menu, { limit: 20000 });
  await page.keyboard.press("x");
  await until(page, (st) => st.scene === "world" && st.mode === "walk" && !st.dialog, { limit: 20000 });
  await page.evaluate(() => window.__pocket.activate("work-wave"));
  await page.waitForFunction(() => window.__pocket.state().scene === "battle", null, { timeout: 8000 });
  await sleep(page, 400);
  await page.keyboard.press("x");
  await sleep(page, 150);
  await page.keyboard.press("x");
  const t0 = Date.now();
  await page.waitForFunction(() => { const st = window.__pocket.state(); return st.scene === "world" && st.mode === "walk"; }, null, { timeout: 15000 }).catch(() => {});
  s = await state(page);
  check("B twice in the intro runs back to the room", s.scene === "world" && !s.beaten.includes("wave"), `${s.scene} after ${Date.now() - t0} ms`);
  await until(page, (st) => st.mode === "walk" && !st.dialog);
  await page.evaluate(() => window.__pocket.activate("work-cnc"));
  await until(page, (st) => st.menu);

  // Enter on the on-screen B button runs, not asks.
  await page.locator('[data-btn="B"]').focus();
  await page.keyboard.press("Enter");
  await sleep(page, 400);
  s = await state(page);
  check("Enter on B runs away", (s.dialog ?? "").includes("got away"), s.dialog ?? "no dialog");
  await until(page, (st) => st.scene === "world" && st.mode === "walk" && !st.dialog);
  await page.close();
}

// ---- Layout: desktop, short laptop, phone landscape --------------------------------
for (const vp of [{ width: 1366, height: 650 }, { width: 1280, height: 900 }, { width: 844, height: 390 }, { width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport: vp });
  await open(page);
  await sleep(page, 400);
  const m = await page.evaluate(() => {
    const d = document.querySelector("dialog.hh");
    const top = document.querySelector(".hh__screen--top").getBoundingClientRect();
    const bot = document.querySelector(".hh__screen--bottom").getBoundingClientRect();
    const ds = document.querySelector(".hh__ds").getBoundingClientRect();
    const inside = (sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return r.left >= ds.left - 0.5 && r.right <= ds.right + 0.5; };
    return { sx: d.scrollWidth - d.clientWidth, top: Math.round(top.width), bot: Math.round(bot.width), pad: inside(".hh__dpad"), btns: inside(".hh__btns") };
  });
  const name = `${vp.width}x${vp.height}`;
  await page.screenshot({ path: `${out}/layout-${name}.png` });
  check(`layout ${name}: no sideways scroll`, m.sx <= 0, `overflow ${m.sx}px`);
  check(`layout ${name}: screens match and are usable`, m.top === m.bot && m.top >= 180, `top ${m.top} bottom ${m.bot}`);
  check(`layout ${name}: controls inside the shell`, m.pad && m.btns);
  await page.close();
}

// ---- Reduced motion -------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("reduced: " + e.message));
  await open(page);
  await until(page, (s) => s.mode === "walk" && !s.dialog);
  const moves = await winBattle(page, "werc");
  const s = await state(page);
  check("reduced motion: battle completes", moves === 4 && s.coins === 100, `coins=${s.coins}`);
  await ctx.close();
}

// ---- Phone ------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  page.on("pageerror", (e) => errors.push("phone: " + e.message));
  await page.goto(url);
  await page.waitForTimeout(800);
  await page.locator("[data-handheld]").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${out}/8-phone-tile.png` });
  await open(page);
  await sleep(page, 500);
  await page.screenshot({ path: `${out}/9-phone-open.png` });
  const fits = await page.evaluate(() => {
    const d = document.querySelector(".hh__ds")?.getBoundingClientRect();
    return !!d && d.right <= window.innerWidth + 0.5 && d.left >= -0.5;
  });
  check("phone: handheld fits the width", fits);
  const exit = await page.locator("[data-exit]").boundingBox();
  check("phone: Exit is on screen", !!exit && exit.y >= 0 && exit.x + exit.width <= 390);
  await page.close();
}

await browser.close();
for (const e of errors) results.push({ name: "no page errors", ok: false, detail: e });
let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail && !r.ok ? "  (" + r.detail + ")" : ""}`);
}
console.log(failed ? `${failed} failed` : `all ${results.length} passed`);
process.exit(failed ? 1 : 0);
