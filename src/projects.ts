import { t } from "./i18n";
import type { TranslationKey } from "./i18n/en";
import { registerProjectRenderer, registerProjectRoutes } from "./router";

/**
 * The project rooms, reached by clicking a work on the wall.
 *
 * One container (`#view-project`) is re-rendered per slug rather than seven
 * blocks of markup: the alternative is six more copies of the frame structure
 * in index.html, each needing its own `data-i18n` defaults, which is exactly
 * the kind of duplication the dictionaries exist to prevent. The awards room
 * is built the same way and for the same reason.
 *
 * The trade-off, shared with the awards room: these rooms need JavaScript,
 * where the wall itself is readable as plain HTML. The wall carries every
 * work's title, description and figures, so the no-JS document is still a
 * complete portfolio — a room only adds depth.
 */

type Shot = {
  /** Image stem in src/assets/img; .avif and .jpg are both expected. */
  img: string;
  w: number;
  h: number;
  altKey: TranslationKey;
  capKey?: TranslationKey;
};

type Spec = { labelKey: TranslationKey; valueKey: TranslationKey; measured?: boolean };

type Project = {
  slug: string;
  titleKey: TranslationKey;
  ledeKey: TranslationKey;
  hero: Shot;
  /** The plate beside the hero: role, tools, materials, result. */
  specs: Spec[];
  sections: { hKey: TranslationKey; bodyKeys: TranslationKey[] }[];
  gallery: Shot[];
};

const PROJECTS: Project[] = [
  {
    slug: "cnc",
    titleKey: "proj.putter.title",
    ledeKey: "case.putter.lede",
    hero: { img: "putter-hero", w: 1500, h: 1125, altKey: "alt.putter.hero" },
    specs: [
      { labelKey: "case.spec.role", valueKey: "case.putter.role" },
      { labelKey: "case.spec.tools", valueKey: "case.putter.tools" },
      { labelKey: "case.spec.material", valueKey: "case.putter.material" },
      { labelKey: "case.spec.result", valueKey: "case.putter.result", measured: true },
    ],
    sections: [
      { hKey: "case.h.brief", bodyKeys: ["case.putter.brief"] },
      { hKey: "case.h.approach", bodyKeys: ["case.putter.approach1", "case.putter.approach2"] },
      { hKey: "case.h.result", bodyKeys: ["case.putter.outcome"] },
    ],
    gallery: [
      { img: "putter-cam", w: 1400, h: 1050, altKey: "alt.putter.cam", capKey: "cap.putter.cam" },
      {
        img: "putter-machining",
        w: 1400,
        h: 1050,
        altKey: "alt.putter.machining",
        capKey: "cap.putter.machining",
      },
      {
        img: "putter-inhand",
        w: 1400,
        h: 1050,
        altKey: "alt.putter.inhand",
        capKey: "cap.putter.inhand",
      },
      {
        img: "putter-inuse",
        w: 1400,
        h: 1050,
        altKey: "alt.putter.inuse",
        capKey: "cap.putter.inuse",
      },
      {
        img: "cnc-drawing",
        w: 1600,
        h: 1100,
        altKey: "alt.putter.drawing",
        capKey: "cap.putter.drawing",
      },
    ],
  },

  {
    slug: "ramps",
    titleKey: "proj.ramps.title",
    ledeKey: "case.ramps.lede",
    hero: { img: "ramps-bank", w: 1600, h: 1600, altKey: "alt.ramps.hero" },
    specs: [
      { labelKey: "case.spec.role", valueKey: "case.ramps.role" },
      { labelKey: "case.spec.tools", valueKey: "case.ramps.tools" },
      { labelKey: "case.spec.material", valueKey: "case.ramps.material" },
      { labelKey: "case.spec.result", valueKey: "case.ramps.result", measured: true },
    ],
    sections: [
      { hKey: "case.h.brief", bodyKeys: ["case.ramps.brief"] },
      { hKey: "case.h.approach", bodyKeys: ["case.ramps.approach1", "case.ramps.approach2"] },
      { hKey: "case.h.result", bodyKeys: ["case.ramps.outcome"] },
    ],
    gallery: [
      {
        img: "ramps-quarter",
        w: 1600,
        h: 1600,
        altKey: "alt.ramps.quarter",
        capKey: "cap.ramps.quarter",
      },
      { img: "ramps-alt1", w: 1100, h: 1100, altKey: "alt.ramps.alt1", capKey: "cap.ramps.alt1" },
      { img: "ramps-alt2", w: 1100, h: 1100, altKey: "alt.ramps.alt2", capKey: "cap.ramps.alt2" },
    ],
  },

  {
    slug: "wave",
    titleKey: "proj.wave.title",
    ledeKey: "case.wave.lede",
    hero: { img: "wave-inside", w: 1200, h: 900, altKey: "alt.wave.hero" },
    specs: [
      { labelKey: "case.spec.role", valueKey: "case.wave.role" },
      { labelKey: "case.spec.tools", valueKey: "case.wave.tools" },
      { labelKey: "case.spec.material", valueKey: "case.wave.material" },
      { labelKey: "case.spec.result", valueKey: "case.wave.result", measured: true },
    ],
    sections: [
      { hKey: "case.h.brief", bodyKeys: ["case.wave.brief"] },
      { hKey: "case.h.approach", bodyKeys: ["case.wave.approach1", "case.wave.approach2"] },
      { hKey: "case.h.result", bodyKeys: ["case.wave.outcome"] },
    ],
    gallery: [
      { img: "wave-base", w: 1000, h: 750, altKey: "alt.wave.base", capKey: "cap.wave.base" },
    ],
  },

  {
    slug: "bot",
    titleKey: "proj.bot.title",
    ledeKey: "case.bot.lede",
    hero: { img: "bot-display", w: 1800, h: 1200, altKey: "alt.bot.hero" },
    specs: [
      { labelKey: "case.spec.role", valueKey: "case.bot.role" },
      { labelKey: "case.spec.tools", valueKey: "case.bot.tools" },
      { labelKey: "case.spec.scope", valueKey: "case.bot.scope" },
      { labelKey: "case.spec.result", valueKey: "case.bot.result", measured: true },
    ],
    sections: [
      { hKey: "case.h.brief", bodyKeys: ["case.bot.brief"] },
      { hKey: "case.h.approach", bodyKeys: ["case.bot.approach1", "case.bot.approach2"] },
      { hKey: "case.h.result", bodyKeys: ["case.bot.outcome"] },
    ],
    gallery: [],
  },

  {
    slug: "campus",
    titleKey: "proj.campus.title",
    ledeKey: "case.campus.lede",
    hero: { img: "campus-logo", w: 1500, h: 1000, altKey: "alt.campus.hero" },
    specs: [
      { labelKey: "case.spec.role", valueKey: "case.campus.role" },
      { labelKey: "case.spec.tools", valueKey: "case.campus.tools" },
      { labelKey: "case.spec.scope", valueKey: "case.campus.scope" },
      { labelKey: "case.spec.result", valueKey: "case.campus.result", measured: true },
    ],
    sections: [
      { hKey: "case.h.brief", bodyKeys: ["case.campus.brief"] },
      { hKey: "case.h.approach", bodyKeys: ["case.campus.approach1", "case.campus.approach2"] },
      { hKey: "case.h.result", bodyKeys: ["case.campus.outcome"] },
    ],
    gallery: [],
  },

  {
    slug: "water",
    titleKey: "proj.water.title",
    ledeKey: "case.water.lede",
    hero: { img: "water-site", w: 1400, h: 788, altKey: "alt.water.hero" },
    specs: [
      { labelKey: "case.spec.role", valueKey: "case.water.role" },
      { labelKey: "case.spec.tools", valueKey: "case.water.tools" },
      { labelKey: "case.spec.scope", valueKey: "case.water.scope" },
      { labelKey: "case.spec.result", valueKey: "case.water.result", measured: true },
    ],
    sections: [
      { hKey: "case.h.brief", bodyKeys: ["case.water.brief"] },
      { hKey: "case.h.approach", bodyKeys: ["case.water.approach1", "case.water.approach2"] },
      { hKey: "case.h.result", bodyKeys: ["case.water.outcome"] },
    ],
    gallery: [
      { img: "water-1", w: 1400, h: 1050, altKey: "alt.water.map", capKey: "cap.water.map" },
    ],
  },
];

const bySlug = new Map(PROJECTS.map((p) => [p.slug, p]));

/** Builds one framed picture, matching the wall's frame > mat > window nesting. */
function framed(shot: Shot, aspect: string): HTMLElement {
  const frame = document.createElement("div");
  frame.className = `frame ${aspect}`;

  const mat = document.createElement("div");
  mat.className = "frame__mat";

  const win = document.createElement("div");
  win.className = "frame__win";

  const picture = document.createElement("picture");
  const source = document.createElement("source");
  source.srcset = `./src/assets/img/${shot.img}.avif`;
  source.type = "image/avif";

  const img = document.createElement("img");
  img.src = `./src/assets/img/${shot.img}.jpg`;
  img.width = shot.w;
  img.height = shot.h;
  img.alt = t(shot.altKey);
  img.loading = "lazy";
  img.decoding = "async";

  picture.append(source, img);
  win.append(picture);
  mat.append(win);
  frame.append(mat);
  return frame;
}

function el(tag: string, cls: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function render(slug: string): void {
  const host = document.getElementById("view-project");
  const project = bySlug.get(slug);
  if (!host || !project) return;

  const back = document.createElement("a");
  back.className = "case__back";
  back.href = "#/work";
  back.textContent = t("case.back");

  const head = el("div", "case__head");
  head.append(
    el("span", "eyebrow", t("case.eyebrow")),
    el("h1", "case__title display", t(project.titleKey)),
    el("p", "case__lede", t(project.ledeKey)),
  );

  // Hero and plate: the picture large, the specification beside it.
  const top = el("div", "case__top");
  top.append(framed(project.hero, "frame--landscape"));

  const plate = el("dl", "plate");
  for (const spec of project.specs) {
    plate.append(el("dt", "plate__k", t(spec.labelKey)));
    const value = el("dd", "plate__v", t(spec.valueKey));
    // The oxblood is reserved for measured results, so only the result row
    // carries it — the same rule the labels on the wall follow.
    if (spec.measured) value.setAttribute("data-measured", "");
    plate.append(value);
  }
  top.append(plate);

  const body = el("div", "case__body");
  for (const section of project.sections) {
    body.append(el("h2", "case__h", t(section.hKey)));
    for (const key of section.bodyKeys) body.append(el("p", "case__p", t(key)));
  }

  host.replaceChildren(back, head, top, body);

  if (project.gallery.length) {
    const gallery = el("div", "case__gallery");
    for (const shot of project.gallery) {
      const figure = document.createElement("figure");
      figure.className = "case__plate";
      figure.append(framed(shot, "frame--landscape"));
      if (shot.capKey) {
        const caption = document.createElement("figcaption");
        caption.className = "case__caption";
        caption.textContent = t(shot.capKey);
        figure.append(caption);
      }
      gallery.append(figure);
    }
    host.append(gallery);
  }

  const foot = el("div", "case__foot");
  const backFoot = document.createElement("a");
  backFoot.className = "case__back";
  backFoot.href = "#/work";
  backFoot.textContent = t("case.back");
  foot.append(backFoot);
  host.append(foot);

  host.dataset["slug"] = slug;
}

export function initProjects(): void {
  registerProjectRoutes((slug) => {
    const project = bySlug.get(slug);
    return project ? t(project.titleKey) : undefined;
  });
  registerProjectRenderer(render);

  // Re-render on a language change, the way the awards room does: the room is
  // built from strings, so applyLang's DOM sweep would not otherwise reach it.
  document.addEventListener("i18n:change", () => {
    const host = document.getElementById("view-project");
    const slug = host?.dataset["slug"];
    if (host && !host.hidden && slug) render(slug);
  });
}
