/**
 * Renders the opening (src/intro.ts) to an MP4 for review or sharing.
 *
 *   node scripts/make-intro-video.mjs [out.mp4] [width] [height]   # dev server running
 *
 * Same fake-clock technique as make-werc-video.mjs: the page's clock advances
 * exactly 1/30 s per captured frame, so the result is smooth however slow the
 * capture is. Needs `pip install imageio-ffmpeg` for the ffmpeg binary.
 */
import { chromium } from "playwright";
import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const OUT = process.argv[2] ?? "Michael-Fischbach-Intro.mp4";
const W = +(process.argv[3] ?? 1920);
const H = +(process.argv[4] ?? 1080);
const FPS = 30;
const SECONDS = 14.4; // the whole montage and its hand-off, with a beat of the page after

const ffmpeg = execFileSync("python", ["-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"])
  .toString()
  .trim();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.addInitScript(() => {
  let now = 0;
  let queue = [];
  performance.now = () => now;
  window.requestAnimationFrame = (cb) => (queue.push(cb), queue.length);
  window.cancelAnimationFrame = () => {};
  // Timers follow the fake clock too, so the fade-out removal lands on time.
  const timers = [];
  window.setTimeout = (fn, ms) => (timers.push({ at: now + (ms || 0), fn }), timers.length);
  window.__step = (ms) => {
    now += ms;
    for (const t of timers.splice(0)) (t.at <= now ? t.fn() : timers.push(t));
    const run = queue;
    queue = [];
    for (const cb of run) cb(now);
  };
});
await page.goto(process.env.URL || "http://localhost:5173/"); // URL=...?hero=night for that mock-up
await page.waitForTimeout(2500); // let the mesh chunk arrive; the clock is frozen

const dir = await mkdtemp(path.join(tmpdir(), "intro-"));
const frames = Math.round(SECONDS * FPS);
for (let i = 0; i < frames; i++) {
  await page.evaluate((ms) => window.__step(ms), 1000 / FPS);
  // CSS transitions run on real time, so the fade is driven by the frame count.
  await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, "0")}.png`) });
}
await browser.close();

await new Promise((resolve, reject) => {
  const p = spawn(ffmpeg, [
    "-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(dir, "f%04d.png"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-movflags", "+faststart", OUT,
  ], { stdio: "inherit" });
  p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
});
await rm(dir, { recursive: true, force: true });
console.log(`wrote ${OUT}: ${frames} frames at ${W}x${H}`);
