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

const mounted = new WeakMap<HTMLElement, SceneModule>();
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

  const viewObserver = new MutationObserver((records) => {
    for (const rec of records) {
      const view = rec.target as HTMLElement;
      if (view.hidden) continue;
      for (const el of view.querySelectorAll<HTMLElement>("[data-scene]")) {
        void mount(el).then(() => remeasure(el));
      }
    }
  });
  for (const view of document.querySelectorAll<HTMLElement>("[data-view]")) {
    viewObserver.observe(view, { attributes: true, attributeFilter: ["hidden"] });
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
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) void mount(el);
        else if (entry.boundingClientRect.top > window.innerHeight * 2) unmount(el);
      }
    },
    { rootMargin: "200px 0px 200px 0px" },
  );

  for (const el of nodes) io.observe(el);

  // Resize is debounced and observed per container: window.resize misses
  // container-driven changes and fires on mobile URL-bar collapse.
  let resizeTimer = 0;
  const ro = new ResizeObserver((entries) => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const scene = mounted.get(el);
        const box = entry.contentRect;
        scene?.resize?.(box.width, box.height);
      }
    }, 100);
  });
  for (const el of nodes) ro.observe(el);
}
