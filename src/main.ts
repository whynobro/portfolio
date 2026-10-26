/**
 * Boot entry: styles, router, scene runtime.
 */
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/frame.css";
import "./styles/chrome.css";
import "./styles/games.css";
import "./styles/case.css";
import "./styles/handheld.css";
import { initRouter } from "./router";
import { initScenes } from "./scenes/runtime";
import { initAwards } from "./awards";
import { initProjects } from "./projects";
import { initResume } from "./resume";
import { initHandheld } from "./handheld/tile";

function boot(): void {
  initAwards();
  // The document buttons are in the static markup, so this does not care
  // about the router.
  initResume();
  // Before the router: it asks the projects module to resolve `/work/<slug>`
  // on the very first render, which happens inside initRouter.
  initProjects();
  initRouter();
  initScenes();
  initHandheld();
  document.documentElement.dataset["booted"] = "1";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
