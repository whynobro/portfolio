/**
 * Boot entry: styles, i18n, router, scene runtime.
 */
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/frame.css";
import "./styles/chrome.css";
import "./styles/games.css";
import "./styles/case.css";
import { initI18n } from "./i18n";
import { initRouter } from "./router";
import { initScenes } from "./scenes/runtime";
import { initAwards } from "./awards";
import { initProjects } from "./projects";

function boot(): void {
  initI18n();
  initAwards();
  // Before the router: it asks the projects module to resolve `/work/<slug>`
  // on the very first render, which happens inside initRouter.
  initProjects();
  initRouter();
  initScenes();
  document.documentElement.dataset["booted"] = "1";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
