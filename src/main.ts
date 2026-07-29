/**
 * Boot entry: styles, i18n, router, scene runtime.
 */
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/frame.css";
import { initI18n } from "./i18n";
import { initScenes } from "./scenes/runtime";

function boot(): void {
  initI18n();
  initScenes();
  document.documentElement.dataset["booted"] = "1";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
