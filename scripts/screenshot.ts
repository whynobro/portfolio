/**
 * Screenshot loop — renders real pages headlessly so design changes can be
 * eyeballed, by a human or by the agent reading the PNGs back.
 *
 *   npm run shots                        # every shot, both languages
 *   npm run shots -- --only=landing      # subset by name
 *   npm run shots -- --lang=de           # one language
 *   npm run shots -- --viewport=mobile   # one viewport
 *   npm run shots -- --motion=reduce     # prove prefers-reduced-motion works
 *   npm run shots -- --target=prod
 *   npm run shots -- --base=http://localhost:5174
 *
 * The dev server must already be running (this script does NOT start it):
 *   npm run dev
 *
 * Output: screenshots/<target>/<name>.<lang>.<viewport>.png (gitignored).
 * The language lives in the FILENAME, not a subdirectory, so reading
 * landing.en.desktop.png and landing.de.desktop.png back to back is a direct
 * layout diff — which is how German overflow actually gets caught.
 */
import { chromium, type Browser, type Page } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { SHOTS, VIEWPORTS, type Lang, type Shot, type ViewportKey } from "./shots.config.js";

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.split("=").slice(1).join("=");
}

const target = arg("target") ?? "local";
const base =
  arg("base") ??
  (target === "prod"
    ? "https://whynobro.github.io/portfolio"
    : "http://localhost:5173");

const onlyArg = arg("only");
const only = onlyArg ? new Set(onlyArg.split(",").map((s) => s.trim())) : null;

const langArg = arg("lang") as Lang | undefined;
const viewportArg = arg("viewport") as ViewportKey | undefined;
const reduceMotion = arg("motion") === "reduce";

const ALL_LANGS: Lang[] = ["en", "de"];

/**
 * Waits for every declared scene to report a painted static frame. Replaces
 * "wait 1200ms and hope": with lazily-mounted canvas, a fixed delay captures
 * half-drawn scenes or bare posters depending on machine speed.
 */
async function waitForScenes(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () => {
        const scenes = Array.from(document.querySelectorAll("[data-scene]"));
        return scenes.every((el) => (el as HTMLElement).dataset["ready"] === "1");
      },
      undefined,
      { timeout: 8000 },
    )
    .catch(() => {
      console.log("  (warning) scenes did not all report ready — capturing anyway");
    });
}

async function capture(page: Page, shot: Shot, lang: Lang, vp: ViewportKey): Promise<void> {
  // ?shots=1 makes the site force-mount every scene at its static frame and
  // neutralize scroll-reveal state, so a full-page capture is deterministic.
  const url = `${base}/?shots=1&lang=${lang}${shot.route}`;

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForLoadState("load", { timeout: 8000 }).catch(() => {});

  // Without this, self-hosted woff2 produces FOUT captures with wrong German
  // text metrics, and you chase phantom layout bugs.
  await page.evaluate(() => document.fonts.ready).catch(() => {});

  await waitForScenes(page);

  if (shot.scrollTo) {
    await page.locator(shot.scrollTo).scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
  }
  if (shot.act) {
    await shot.act(page).catch((e) => console.log(`  (act failed) ${String(e)}`));
  }

  // Belt and braces: freeze anything still animating.
  await page
    .addStyleTag({
      content:
        "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}",
    })
    .catch(() => {});

  const dir = path.join("screenshots", target);
  await mkdir(dir, { recursive: true });
  const out = path.join(dir, `${shot.name}.${lang}.${vp}.png`);

  try {
    await page.screenshot({
      path: out,
      fullPage: shot.fullPage ?? true,
      timeout: 15000,
      animations: "disabled",
    });
  } catch {
    // Full-page can hang on very tall pages; fall back to the viewport so we
    // still get a shot of the above-the-fold layout.
    await page.screenshot({ path: out, animations: "disabled" }).catch(() => {
      console.log(`  (failed) ${out}`);
    });
  }
  console.log(`  ${out}`);
}

async function run(): Promise<void> {
  const selected = SHOTS.filter((s) => !only || only.has(s.name));
  const langs = langArg ? [langArg] : ALL_LANGS;

  if (!selected.length) {
    console.error(`No shots matched ${onlyArg ? `--only=${onlyArg}` : ""}`);
    process.exit(1);
  }

  console.log(`Target: ${base}`);
  console.log(
    `${selected.length} shot(s) × ${langs.length} lang(s)${reduceMotion ? " [reduced-motion]" : ""}`,
  );

  const browser: Browser = await chromium.launch();
  try {
    for (const lang of langs) {
      // Which viewports this run touches at all.
      const vpKeys = (Object.keys(VIEWPORTS) as ViewportKey[]).filter(
        (k) => !viewportArg || k === viewportArg,
      );

      for (const vp of vpKeys) {
        const shots = selected.filter((s) => {
          const wanted = s.viewports ?? (["desktop", "mobile"] as ViewportKey[]);
          const langOk = !s.langs || s.langs.includes(lang);
          return wanted.includes(vp) && langOk;
        });
        if (!shots.length) continue;

        const ctx = await browser.newContext({
          viewport: VIEWPORTS[vp],
          deviceScaleFactor: 1,
          // Set the OS-level language too, so auto-detection is exercised and
          // not just the explicit ?lang= override.
          locale: lang === "de" ? "de-DE" : "en-US",
          ...(reduceMotion ? { reducedMotion: "reduce" as const } : {}),
        });

        // Persisting to localStorage exercises the real boot path — it proves
        // the stored-preference branch works, not merely the toggle handler.
        await ctx.addInitScript(
          (l: string) => {
            try {
              localStorage.setItem("lang", l);
            } catch {
              /* private mode */
            }
          },
          lang,
        );

        const page = await ctx.newPage();
        for (const shot of shots) {
          await capture(page, shot, lang, vp);
        }
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`Done. See screenshots/${target}/`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
