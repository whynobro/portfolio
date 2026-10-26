import { Game, type FullDir, type Region } from "./game";
import { subscribe, unsubscribe } from "../lib/raf";

/**
 * Pocket Gallery opens in a modal <dialog> over the page: the page stays where
 * it was, Esc or the Exit button closes it, and progress is saved on the way
 * out. Only one game exists at a time; reopening resumes it.
 */

const KEYS: Record<string, FullDir> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right",
};

let dlg: HTMLDialogElement | null = null;
let game: Game | null = null;
let tick: ((dt: number) => void) | null = null;
let ownFrame = 0;
let opener: HTMLElement | null = null;

const reduced = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function build(): HTMLDialogElement {
  const el = document.createElement("dialog");
  el.className = "hh";
  el.tabIndex = -1;
  el.setAttribute("aria-labelledby", "hh-title");
  el.innerHTML = `
    <div class="hh__bar">
      <h2 class="hh__title" id="hh-title">Pocket Gallery</h2>
      <p class="hh__keys">Arrows move · Z talks · X backs out</p>
      <button type="button" class="hh__exit" data-exit>Exit <span aria-hidden="true">✕</span></button>
    </div>
    <div class="hh__ds">
      <div class="hh__lid">
        <div class="hh__bezel"><canvas class="hh__screen hh__screen--top" width="256" height="192" role="img" aria-label="The gallery hall"></canvas></div>
        <span class="hh__label" aria-hidden="true">POCKET GALLERY</span>
      </div>
      <div class="hh__hinge" aria-hidden="true"></div>
      <div class="hh__base">
        <div class="hh__dpad" aria-hidden="true">
          <button type="button" tabindex="-1" data-dir="up"></button>
          <button type="button" tabindex="-1" data-dir="left"></button>
          <span></span>
          <button type="button" tabindex="-1" data-dir="right"></button>
          <button type="button" tabindex="-1" data-dir="down"></button>
        </div>
        <div class="hh__bezel"><canvas class="hh__screen hh__screen--bottom" width="256" height="192" aria-hidden="true"></canvas></div>
        <div class="hh__btns">
          <button type="button" class="hh__btn hh__btn--b" data-btn="B" aria-label="B: back">B</button>
          <button type="button" class="hh__btn" data-btn="A" aria-label="A: talk or confirm">A</button>
        </div>
      </div>
    </div>
    <div class="visually-hidden" data-mirror aria-label="Touch screen"></div>
    <p class="visually-hidden" aria-live="polite" data-live></p>`;
  document.body.append(el);
  return el;
}

function wire(el: HTMLDialogElement, g: Game): void {
  el.querySelector("[data-exit]")?.addEventListener("click", () => closeHandheld());
  el.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeHandheld();
  });
  el.addEventListener("keydown", (e) => {
    // Enter and Space on a real button (Exit, the screen-reader mirror) do
    // what that button does; every other key still plays the game.
    const onButton = (e.target as HTMLElement).closest("[data-exit], [data-mirror]");
    if (onButton && (e.key === "Enter" || e.key === " ")) return;
    if ((e.target as HTMLElement).closest("[data-mirror]")) return;
    const dir = KEYS[e.key];
    if (dir) {
      e.preventDefault();
      if (!e.repeat) g.hold(dir, true);
      return;
    }
    if (e.repeat) return;
    if (e.key === "z" || e.key === "Z" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      g.press("A");
    } else if (e.key === "x" || e.key === "X" || e.key === "Backspace") {
      e.preventDefault();
      g.press("B");
    }
  });
  el.addEventListener("keyup", (e) => {
    const dir = KEYS[e.key];
    if (dir) g.hold(dir, false);
  });
  window.addEventListener("blur", () => g.releaseAll());

  for (const b of el.querySelectorAll<HTMLButtonElement>("[data-dir]")) {
    const d = b.dataset["dir"] as FullDir;
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      b.classList.add("is-down");
      g.hold(d, true);
    });
    const up = (): void => {
      b.classList.remove("is-down");
      g.hold(d, false);
    };
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", up);
    b.addEventListener("lostpointercapture", up);
  }
  for (const b of el.querySelectorAll<HTMLButtonElement>("[data-btn]")) {
    const which = b.dataset["btn"] === "B" ? "B" : "A";
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      g.press(which);
    });
    // Keyboard activation of the on-screen button (detail 0) still works.
    b.addEventListener("click", (e) => {
      if (e.detail === 0) g.press(which);
    });
  }
  const top = el.querySelector<HTMLCanvasElement>(".hh__screen--top");
  top?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    g.press("A");
  });
  const bottom = el.querySelector<HTMLCanvasElement>(".hh__screen--bottom");
  bottom?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const r = bottom.getBoundingClientRect();
    g.tap(((e.clientX - r.left) / r.width) * 256, ((e.clientY - r.top) / r.height) * 192);
  });
}

function mirrorRegions(regions: Region[]): void {
  const m = dlg?.querySelector<HTMLElement>("[data-mirror]");
  if (!m) return;
  m.textContent = "";
  for (const r of regions) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = r.label;
    b.addEventListener("click", () => game?.activate(r.key));
    m.append(b);
  }
}

function startLoop(): void {
  if (tick || !game) return;
  const g = game;
  tick = (dt: number) => {
    g.tick(dt);
    g.draw();
  };
  if (!subscribe(tick)) {
    // The shared loop is full (four live scenes): the game owns the screen
    // while it is open, so it runs its own loop rather than not at all.
    let last = performance.now();
    const own = (now: number): void => {
      tick?.(Math.min((now - last) / 1000, 0.05));
      last = now;
      ownFrame = requestAnimationFrame(own);
    };
    ownFrame = requestAnimationFrame(own);
  }
}

function stopLoop(): void {
  if (!tick) return;
  unsubscribe(tick);
  cancelAnimationFrame(ownFrame);
  ownFrame = 0;
  tick = null;
}

export function openHandheld(from?: HTMLElement): void {
  opener = from ?? (document.activeElement as HTMLElement | null);
  if (!dlg) {
    const el = build();
    dlg = el;
    const top = el.querySelector<HTMLCanvasElement>(".hh__screen--top");
    const bottom = el.querySelector<HTMLCanvasElement>(".hh__screen--bottom");
    const live = el.querySelector<HTMLElement>("[data-live]");
    if (!top || !bottom) return;
    game = new Game(top, bottom, {
      reducedMotion: reduced(),
      onExit: () => closeHandheld(),
      onViewRoom: (slug) => {
        closeHandheld();
        window.location.hash = `#/work/${slug}`;
      },
      announce: (text) => {
        if (live) live.textContent = text;
      },
      onRegions: mirrorRegions,
    });
    wire(el, game);
    const g = game;
    (window as unknown as { __pocket: unknown }).__pocket = { state: () => g.state(), activate: (k: string) => g.activate(k) };
    game.start();
  }
  document.documentElement.classList.add("hh-open");
  dlg.showModal();
  dlg.focus();
  startLoop();
}

export function closeHandheld(): void {
  if (!dlg?.open) return;
  game?.saveNow();
  game?.releaseAll();
  stopLoop();
  dlg.close();
  document.documentElement.classList.remove("hh-open");
  opener?.focus();
}
