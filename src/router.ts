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
  "/awards": { id: "view-awards", title: "Awards — Michael Fischbach" },
  "/about": { id: "view-about", title: "About — Michael Fischbach" },
  "/contact": { id: "view-contact", title: "Contact — Michael Fischbach" },
};

/**
 * `/work/<slug>` is resolved by the projects module rather than by the table
 * above: the room is one container rendered from data, so the router asks who
 * lives at a slug and gets back a title, or nothing if the slug is unknown.
 */
type SlugResolver = (slug: string) => string | undefined;
let resolveSlug: SlugResolver = () => undefined;

export function registerProjectRoutes(fn: SlugResolver): void {
  resolveSlug = fn;
}

/**
 * The last work opened from the wall. Returning to `#/work` scrolls it back
 * into view, so leaving a room puts the visitor in front of the piece they
 * clicked rather than at the top of the collection.
 */
let lastSlug: string | null = null;

function currentPath(): string {
  // "#/work/cnc" -> "/work/cnc"; query strings are stripped so ?shots=1 and
  // ?lang=de can sit alongside a route without breaking the lookup.
  const raw = location.hash.replace(/^#/, "");
  return raw.split("?")[0] ?? "";
}

let renderProject: ((slug: string) => void) | null = null;

export function registerProjectRenderer(fn: (slug: string) => void): void {
  renderProject = fn;
}

function show(route: Route, opts: { focus: boolean }): void {
  // The room is filled BEFORE it is revealed: rendering into a visible view
  // shows the previous project's content for a frame.
  const path = currentPath();
  if (route.id === "view-project" && renderProject) {
    renderProject(path.slice("/work/".length));
  }

  for (const view of document.querySelectorAll<HTMLElement>("[data-view]")) {
    view.hidden = view.id !== route.id;
  }
  document.title = route.title;

  // Anchors highlight the section they point at.
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

  // Leaving a room returns the visitor to the piece they clicked rather than to
  // the top of a long wall. Only when arriving at the collection itself, and
  // only once — a later visit to #/work should start at the top.
  if (route.id === "view-home" && path.startsWith("/work") && lastSlug) {
    const work = document.querySelector<HTMLElement>(`a[href="#/work/${lastSlug}"]`);
    lastSlug = null;
    if (work) {
      work.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
      return;
    }
  }

  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

function resolve(): Route {
  const path = currentPath();

  const slug = path.startsWith("/work/") ? path.slice("/work/".length) : null;
  if (slug) {
    const title = resolveSlug(slug);
    // An unknown slug falls through to the collection rather than showing an
    // empty room — a stale link from a CV should land somewhere real.
    if (title) {
      lastSlug = slug;
      return { id: "view-project", title: `${title} — Michael Fischbach` };
    }
    return ROUTES["/work"]!;
  }

  return ROUTES[path] ?? ROUTES[""]!;
}

export function initRouter(): void {
  // The first render must not steal focus or scroll — the visitor has not
  // navigated anywhere yet.
  show(resolve(), { focus: false });
  window.addEventListener("hashchange", () => show(resolve(), { focus: true }));
}
