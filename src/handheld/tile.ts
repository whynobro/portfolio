/**
 * The handheld on the wall is a plain button with a poster of the game on its
 * screen. The game itself (art, engine, overlay) is a separate chunk fetched
 * on first hover or focus and opened on click, so the landing page carries
 * none of it.
 */
let loading: Promise<typeof import("./overlay")> | null = null;
const load = (): Promise<typeof import("./overlay")> => (loading ??= import("./overlay"));

export function initHandheld(): void {
  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-handheld]")) {
    btn.addEventListener("pointerenter", () => void load(), { once: true });
    btn.addEventListener("focus", () => void load(), { once: true });
    btn.addEventListener("click", () => {
      void load().then((m) => m.openHandheld(btn));
    });
  }
}
