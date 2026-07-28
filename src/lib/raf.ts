/**
 * One requestAnimationFrame loop for the whole page.
 *
 * Per-scene loops are the usual approach and the usual cause of a phone getting
 * hot: four scenes means four independent loops that never coordinate. Here a
 * single loop drives every subscriber, cancels itself when nobody is listening,
 * and pauses when the tab is hidden.
 */

type Tick = (dtSeconds: number) => void;

const subscribers = new Set<Tick>();
let frame = 0;
let last = 0;

/** Hard cap on simultaneously animating scenes. */
const MAX_ACTIVE = 2;

function loop(now: number): void {
  // Clamp dt: after a tab switch the real delta can be minutes, which would
  // make any physics or easing jump violently on the first frame back.
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  for (const fn of subscribers) fn(dt);

  frame = subscribers.size > 0 ? requestAnimationFrame(loop) : 0;
}

function start(): void {
  if (frame || subscribers.size === 0 || document.hidden) return;
  last = performance.now();
  frame = requestAnimationFrame(loop);
}

function stop(): void {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

/** Returns true if the caller got a slot; false if the budget is full. */
export function subscribe(fn: Tick): boolean {
  if (subscribers.size >= MAX_ACTIVE) return false;
  subscribers.add(fn);
  start();
  return true;
}

export function unsubscribe(fn: Tick): void {
  subscribers.delete(fn);
  if (subscribers.size === 0) stop();
}

export function activeCount(): number {
  return subscribers.size;
}

// A background tab must not burn a recruiter's battery.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
  else start();
});
