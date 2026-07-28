/**
 * Hash router.
 *
 * The whole site is one HTML file, so "pages" are sections that show and hide.
 * Hash routing (rather than the History API) is deliberate: it is the only
 * scheme that also works when the file is opened from file://, which is a
 * requirement here — the built page has to survive being emailed as an
 * attachment.
 */

export type Route = { id: string; title: string };

const ROUTES: Record<string, Route> = {
  "": { id: "view-home", title: "Michael Fischbach — Mechanical Engineering" },
  "/": { id: "view-home", title: "Michael Fischbach — Mechanical Engineering" },
  "/work": { id: "view-home", title: "Work — Michael Fischbach" },
  "/work/cnc": { id: "view-cnc", title: "CNC-Milled Putter — Michael Fischbach" },
  "/work/wave": { id: "view-wave", title: "Wave Energy Converter — Michael Fischbach" },
  "/work/ramps": { id: "view-ramps", title: "Chameleon Ramps — Michael Fischbach" },
  "/work/bot": { id: "view-bot", title: "Execution System — Michael Fischbach" },
  "/about": { id: "view-about", title: "About — Michael Fischbach" },
  "/contact": { id: "view-contact", title: "Contact — Michael Fischbach" },
};

function currentPath(): string {
  // "#/work/cnc" -> "/work/cnc"; query strings are stripped so ?shots=1 and
  // ?lang=de can sit alongside a route without breaking the lookup.
  const raw = location.hash.replace(/^#/, "");
  return raw.split("?")[0] ?? "";
}

function show(route: Route, opts: { focus: boolean }): void {
  for (const view of document.querySelectorAll<HTMLElement>("[data-view]")) {
    view.hidden = view.id !== route.id;
  }
  document.title = route.title;

  // Anchors highlight the section they point at.
  const path = currentPath();
  for (const a of document.querySelectorAll<HTMLAnchorElement>(".masthead__nav a")) {
    const href = a.getAttribute("href")?.replace(/^#/, "") ?? "";
    const active = href !== "/" && path.startsWith(href);
    a.toggleAttribute("data-active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }

  if (!opts.focus) return;

  // Move focus to the new view so screen-reader and keyboard users are not
  // left at the top of a document whose content silently changed.
  const target = document.getElementById(route.id);
  if (target) {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

function resolve(): Route {
  return ROUTES[currentPath()] ?? ROUTES[""]!;
}

export function initRouter(): void {
  // The first render must not steal focus or scroll — the visitor has not
  // navigated anywhere yet.
  show(resolve(), { focus: false });
  window.addEventListener("hashchange", () => show(resolve(), { focus: true }));
}
