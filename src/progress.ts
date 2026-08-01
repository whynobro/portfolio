/**
 * "N of six viewed" under the collection's lede.
 *
 * A quiet record of how much of the wall a visitor has actually walked. It is
 * driven by `markSeen()`, called from the projects module as each room renders,
 * so it counts rooms that were OPENED rather than works that scrolled past.
 *
 * The bar is presentational: the count beside it carries the same information
 * as text, and the whole thing is `aria-hidden` because a progressbar role
 * announcing itself on every navigation is noise, not help.
 */
import { t } from "./i18n";

const KEY = "mf.seen";

/**
 * Slugs seen this session, plus whatever a previous visit left behind.
 *
 * Held in memory as well as in storage because storage can be unavailable
 * (private mode, or a `file://` document in some browsers): the counter still
 * works for the current visit, it simply forgets afterwards.
 */
let seen = new Set<string>();
/** Total rooms on the wall, set by initProgress from the project data. */
let total = 0;
/** Whether the completion burst has already run this visit. */
let celebrated = false;

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    // Storage is user-writable and survives deploys, so it is treated as
    // untrusted input: anything that is not an array of strings is discarded
    // rather than trusted into the Set.
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((s): s is string => typeof s === "string"));
  } catch {
    return new Set();
  }
}

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...seen]));
  } catch {
    // Storage full or blocked. The in-memory Set still carries this visit.
  }
}

function paint(): void {
  const root = document.getElementById("work-progress");
  if (!root || total <= 0) return;

  // Only rooms that are actually on the wall count, so a slug left in storage
  // by an older build cannot push the bar past full.
  const done = Math.min(seen.size, total);
  const pct = Math.round((done / total) * 100);
  const complete = done >= total;

  const fill = root.querySelector<HTMLElement>(".progress__fill");
  const label = root.querySelector<HTMLElement>(".progress__label");
  if (fill) fill.style.inlineSize = `${pct}%`;
  if (label) {
    const key = complete ? "work.progressDone" : "work.progress";
    label.textContent = t(key).replace("{n}", String(done)).replace("{total}", String(total));
  }
  root.dataset["complete"] = complete ? "1" : "0";
}

/**
 * A small burst over the collection's heading, once, when the last room has
 * been seen and the visitor comes back to the wall.
 *
 * Canvas rather than DOM nodes: a few dozen absolutely-positioned elements
 * animating at once thrash layout on the page that also carries six carved
 * frames. The canvas is removed when the run finishes, so nothing is left
 * behind to composite.
 */
function confetti(host: HTMLElement): void {
  const canvas = document.createElement("canvas");
  canvas.className = "progress__confetti";
  // Decorative and transient: never announced, never focusable.
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const rect = host.getBoundingClientRect();
  if (!ctx || rect.width <= 0) {
    canvas.remove();
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = rect.width;
  const h = rect.height;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // The site's own palette, not party colours: the accent, its two stops, and
  // the gold of the frames.
  const colours = ["#2596be", "#6fc4de", "#17698a", "#c9a227", "#be5d25"];
  const pieces = Array.from({ length: 44 }, (_, i) => ({
    x: w * (0.5 + (Math.random() - 0.5) * 0.5),
    y: h * 0.55,
    vx: (Math.random() - 0.5) * 260,
    vy: -180 - Math.random() * 220,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 12,
    size: 4 + Math.random() * 4,
    colour: colours[i % colours.length] ?? "#2596be",
  }));

  let last = performance.now();
  let elapsed = 0;

  function frame(now: number): void {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    elapsed += dt;
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    for (const p of pieces) {
      p.vy += 900 * dt; // gravity
      p.vx *= 0.99;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;

      // Fades over the last third rather than vanishing on a frame boundary.
      ctx.globalAlpha = Math.max(0, Math.min(1, (1.9 - elapsed) / 0.7));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.colour;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    if (elapsed < 1.9) requestAnimationFrame(frame);
    else canvas.remove();
  }

  requestAnimationFrame(frame);
}

/**
 * Fires the burst when the visitor lands on the collection having seen every
 * room. Called by the router's collection route rather than by `markSeen`: the
 * sixth room is opened INSIDE that room, and the celebration belongs on the
 * wall the visitor comes back to.
 */
export function celebrateIfComplete(): void {
  const root = document.getElementById("work-progress");
  if (!root || total <= 0 || seen.size < total) return;
  // Once per visit: crossing the wall repeatedly should not keep firing it.
  if (celebrated) return;
  celebrated = true;

  // Reduced motion suppresses autonomous motion. The bar still reads
  // "Completed", which is the information; the burst is decoration.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const intro = root.closest<HTMLElement>(".intro") ?? root;
  confetti(intro);
}

/** Records a room as visited and repaints. Safe to call repeatedly. */
export function markSeen(slug: string): void {
  if (seen.has(slug)) {
    paint();
    return;
  }
  seen.add(slug);
  save();
  paint();
}

export function initProgress(slugs: string[]): void {
  total = slugs.length;
  const known = new Set(slugs);
  // Drop anything that is no longer a work, so a renamed or removed slug does
  // not sit in storage inflating the count forever.
  seen = new Set([...load()].filter((s) => known.has(s)));
  save();
  paint();
  // The label is built from a translated string, so it has to be rebuilt when
  // the language changes: applyLang's DOM sweep replaces text nodes it owns,
  // and this one is composed here.
  document.addEventListener("i18n:change", paint);
}
