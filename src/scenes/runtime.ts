import { REGISTRY } from "./registry";
import type { SceneModule } from "./types";
import { t } from "../i18n";
import type { TranslationKey } from "../i18n/en";

/**
 * Mounts scenes lazily as they scroll into view and disposes them on the way
 * out, so a long page never has more than a couple of live canvases.
 *
 * In screenshot mode (?shots=1) every scene mounts immediately and paints one
 * static frame, then marks itself data-ready="1". That gives the capture script
 * a deterministic signal instead of a fixed delay, which is the difference
 * between reliable full-page screenshots and half-drawn ones.
 */

// A Map, not a WeakMap: it is swept for scenes whose element has left the
// document (a project room re-renders its whole view) so their animation
// loop does not keep running against a detached canvas.
const mounted = new Map<HTMLElement, SceneModule>();
const loading = new WeakSet<HTMLElement>();

const shotsMode = (): boolean => document.documentElement.dataset["shots"] === "1";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function mount(el: HTMLElement): Promise<void> {
  if (mounted.has(el) || loading.has(el)) return;

  const id = el.dataset["scene"];
  const load = id ? REGISTRY[id] : undefined;
  if (!load) {
    // No implementation yet: still report ready so the screenshot loop is not
    // held up by a placeholder tile.
    el.dataset["ready"] = "1";
    return;
  }

  loading.add(el);
  try {
    const mod = await load();
    // The view can be hidden (or the room re-rendered) while the module loads.
    // Mounting anyway left a live scene in a hidden view, holding one of the
    // four animation slots, with nothing left to dispose it. Screenshot mode
    // mounts hidden views on purpose, so it is exempt.
    if (!shotsMode() && (!el.isConnected || el.closest<HTMLElement>("[data-view]")?.hidden)) {
      return;
    }
    const scene = mod.default();

    const still = shotsMode() || prefersReducedMotion();
    scene.mount({
      root: el,
      t: (key: TranslationKey) => t(key),
      reducedMotion: still,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });

    if (still) scene.renderStatic?.();

    mounted.set(el, scene);
    el.dataset["ready"] = "1";
  } catch (err) {
    console.error(`scene "${id}" failed to mount`, err);
    el.dataset["ready"] = "1"; // never block a capture on a broken scene
  } finally {
    loading.delete(el);
  }
}

function unmount(el: HTMLElement): void {
  const scene = mounted.get(el);
  if (!scene) return;
  scene.dispose();
  mounted.delete(el);
}

export function initScenes(): void {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
  if (!nodes.length) return;

  // A scene inside a hidden view measures 0x0 at mount, so its canvas backing
  // store would be 1px. Re-measure whenever a view is shown, the router
  // toggles `hidden`, and only then does the element have a real box.
  const remeasure = (el: HTMLElement): void => {
    const scene = mounted.get(el);
    if (!scene) return;
    const box = el.getBoundingClientRect();
    if (box.width > 0 && box.height > 0) scene.resize?.(box.width, box.height);
  };

  // Filled in below outside screenshot mode. A project room builds new scene
  // elements every time it renders, long after this function ran, so each one
  // is handed to the observers as it appears: without that, a room's scene
  // never heard about a resize and drew its old backing store squashed into
  // the new box.
  let io: IntersectionObserver | null = null;
  let ro: ResizeObserver | null = null;
  const tracked = new WeakSet<HTMLElement>();
  const track = (el: HTMLElement): void => {
    if (tracked.has(el)) return;
    tracked.add(el);
    io?.observe(el);
    ro?.observe(el);
  };
  const untrack = (el: HTMLElement): void => {
    io?.unobserve(el);
    ro?.unobserve(el);
  };

  // Watches `hidden` AND the views' children. Going from one room straight to
  // another (address bar, history) re-renders #view-project without ever
  // hiding it, so watching `hidden` alone left the new room's stage empty.
  const viewObserver = new MutationObserver((records) => {
    for (const el of [...mounted.keys()]) {
      if (!el.isConnected) {
        unmount(el);
        untrack(el);
      }
    }
    const views = new Set(records.map((rec) => rec.target as HTMLElement));
    for (const view of views) {
      if (view.hidden) {
        // A hidden view's scenes stop animating; they remount when it returns.
        for (const el of view.querySelectorAll<HTMLElement>("[data-scene]")) unmount(el);
        continue;
      }
      for (const el of view.querySelectorAll<HTMLElement>("[data-scene]")) {
        track(el);
        void mount(el).then(() => remeasure(el));
      }
    }
  });
  for (const view of document.querySelectorAll<HTMLElement>("[data-view]")) {
    viewObserver.observe(view, { attributes: true, attributeFilter: ["hidden"], childList: true });
  }

  // Screenshot mode: mount everything now, no observer, no animation.
  // Mount, then remeasure on the next frame, at mount time the element may
  // still be inside a view the router has not revealed yet.
  if (shotsMode()) {
    // `data-ready` is only set after the remeasure, so the capture script
    // cannot photograph a scene that mounted at 0x0 and has not been sized yet.
    for (const el of nodes) delete el.dataset["ready"];
    void Promise.all(nodes.map(mount)).then(() => {
      requestAnimationFrame(() => {
        for (const el of nodes) {
          remeasure(el);
          el.dataset["ready"] = "1";
        }
      });
    });
    return;
  }

  // Asymmetric margins give hysteresis: a scene mounts slightly before it is
  // visible and is not torn down the instant it leaves, so scrolling back and
  // forth across a boundary doesn't thrash mount/dispose.
  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) void mount(el);
        else if (
          entry.boundingClientRect.top > window.innerHeight * 2 ||
          entry.boundingClientRect.bottom < -window.innerHeight
        )
          unmount(el);
      }
    },
    { rootMargin: "200px 0px 200px 0px" },
  );

  // Resize is debounced and observed per container: window.resize misses
  // container-driven changes and fires on mobile URL-bar collapse. Sizes are
  // collected across the debounce rather than taken from the last callback
  // alone, which dropped any element that resized only in an earlier one.
  let resizeTimer = 0;
  const pending = new Map<HTMLElement, DOMRectReadOnly>();
  ro = new ResizeObserver((entries) => {
    for (const entry of entries) pending.set(entry.target as HTMLElement, entry.contentRect);
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      for (const [el, box] of pending) mounted.get(el)?.resize?.(box.width, box.height);
      pending.clear();
    }, 100);
  });

  for (const el of nodes) track(el);
}
