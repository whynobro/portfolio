/**
 * Exports the WERC docking animation as an MP4, for sending to people.
 *
 *   node scripts/make-werc-video.mjs [out.mp4]     # dev server must be running
 *
 * The scene is drawn live on a canvas, so there is no video to copy. This
 * renders one full cycle frame by frame: the page's clock is replaced with a
 * fake one that advances exactly 1/30 s per frame, so the capture is smooth
 * and identical every run no matter how slow the screenshotting is. One cycle
 * starts and ends with the rover off at the left, so the clip loops cleanly.
 *
 * Needs an ffmpeg binary: `pip install imageio-ffmpeg` provides one.
 */
import { chromium } from "playwright";
import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const OUT = process.argv[2] ?? "Michael-Fischbach-WERC-Docking.mp4";
const FPS = 30;
const SECONDS = 18.4; // one cycle of PHASES in src/scenes/werc/index.ts
const W = 1920;
const H = 822; // 21:9, even for H.264

const ffmpeg = execFileSync("python", ["-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"])
  .toString()
  .trim();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

// A clock that only moves when told to, so every frame is exactly 1/FPS apart.
await page.addInitScript(() => {
  let now = 0;
  let queue = [];
  performance.now = () => now;
  window.requestAnimationFrame = (cb) => (queue.push(cb), queue.length);
  window.cancelAnimationFrame = () => {};
  window.__step = (ms) => {
    now += ms;
    const run = queue;
    queue = [];
    for (const cb of run) cb(now);
  };
});

await page.goto("http://localhost:5173/#/work/werc");
// The stage fills the viewport, and nothing else is drawn over it.
await page.addStyleTag({
  content: `.case__stage{position:fixed!important;inset:0!important;inline-size:100vw!important;
    block-size:100vh!important;aspect-ratio:auto!important;z-index:9999;box-shadow:none!important}
    .masthead{display:none!important}`,
});
await page.waitForSelector(".case__stage canvas");
await page.evaluate(() => window.dispatchEvent(new Event("resize")));
await page.waitForTimeout(800);

const dir = await mkdtemp(path.join(tmpdir(), "werc-"));
const frames = Math.round(SECONDS * FPS);
for (let i = 0; i < frames; i++) {
  await page.evaluate((ms) => window.__step(ms), 1000 / FPS);
  const data = await page.evaluate(() => document.querySelector(".case__stage canvas").toDataURL("image/png"));
  await writeFile(path.join(dir, `f${String(i).padStart(4, "0")}.png`), data.split(",")[1], "base64");
}
await browser.close();

await new Promise((resolve, reject) => {
  const p = spawn(ffmpeg, [
    "-y", "-framerate", String(FPS), "-i", path.join(dir, "f%04d.png"),
    "-vf", `scale=${W}:${H}`, "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-crf", "18", "-preset", "slow", "-movflags", "+faststart", OUT,
  ], { stdio: "inherit" });
  p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
});
await rm(dir, { recursive: true, force: true });
console.log(`wrote ${OUT}: ${frames} frames, ${SECONDS}s at ${FPS} fps, ${W}x${H}`);
