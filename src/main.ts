/**
 * Boot entry: styles, i18n, router, scene runtime.
 */
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import { initI18n } from "./i18n";
import { initRouter } from "./router";
import { initScenes } from "./scenes/runtime";

function boot(): void {
  // Order matters. Language first so any scene that reads a label at mount
  // gets the right one; the router next so hidden views are hidden before the
  // IntersectionObserver decides what is on screen.
  initI18n();
  initRouter();
  initScenes();
  document.documentElement.dataset["booted"] = "1";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
