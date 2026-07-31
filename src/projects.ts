import { getLang, t } from "./i18n";
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
 * complete portfolio; a room only adds depth.
 */

/**
 * `aspect` is the frame the picture hangs in, and it must match the shape of
 * the photograph. Everything used to hang in a 3:2 landscape frame, which meant
 * `object-fit: cover` threw away HALF of every portrait photograph (all six
 * putter shots and both wave shots are 3:4) and a third of every square one
 * (the whole ramps range). A framer cuts the mat to the picture; so does this.
 */
type Aspect =
  | "frame--photo" // 3:4, what a phone shoots
  | "frame--portrait" // 4:5
  | "frame--square"
  | "frame--slide" // 4:3, slides and drawings
  | "frame--landscape" // 3:2
  | "frame--wide";

type Shot = {
  /** Image stem in src/assets/img; .avif and .jpg are both expected. */
  img: string;
  w: number;
  h: number;
  aspect: Aspect;
  altKey: TranslationKey;
  capKey?: TranslationKey;
};

type Spec = { labelKey: TranslationKey; valueKey: TranslationKey; measured?: boolean };

type Project = {
  slug: string;
  titleKey: TranslationKey;
  ledeKey: TranslationKey;
  /**
   * The company's mark, shown beside the room's title. Only the two works that
   * ARE companies carry one; the rest are projects and have no mark to show.
   */
  mark?: string;
  hero: Shot;
  /** The plate beside the hero: role, tools, materials, result. */
  specs: Spec[];
  sections: { hKey: TranslationKey; bodyKeys: TranslationKey[] }[];
  gallery: Shot[];
  /** A live site the work IS, rather than a description of one. */
  link?: { href: string; labelKey: TranslationKey };
  /**
   * A document shown full width at the foot of the room, where the gallery's
   * three-up prints would make it unreadable.
   */
  poster?: Shot;
  /**
   * A poster that exists in BOTH languages as two separate images, with a tab
   * to switch between them. The bot's poster is drawn rather than scanned, so
   * unlike the capstone posters it could be set in German as well; the tab
   * changes only the poster, not the site.
   */
  posterPair?: {
    en: Shot;
    de: Shot;
    capKey: TranslationKey;
    hintKey: TranslationKey;
  };
  /**
   * A scene id from the scene registry, mounted under the hero. The putter has
   * one: its own STL, turning, which is the only place on the site where a part
   * can be inspected rather than looked at.
   */
  scene?: { id: string; capKey: TranslationKey };
};

const PROJECTS: Project[] = [
  {
    slug: "cnc",
    titleKey: "proj.putter.title",
    ledeKey: "case.putter.lede",
    hero: { img: "putter-hero", w: 1400, h: 1867, aspect: "frame--photo", altKey: "alt.putter.hero" },
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
    scene: { id: "putter", capKey: "cap.putter.stl" },
    poster: {
      img: "putter-poster",
      w: 2600,
      h: 1950,
      aspect: "frame--slide",
      altKey: "alt.putter.poster",
      capKey: "cap.putter.poster",
    },
    gallery: [
      {
        img: "putter-cad",
        w: 1200,
        h: 874,
        aspect: "frame--slide",
        altKey: "alt.putter.cad",
        capKey: "cap.putter.cad",
      },
      {
        img: "putter-cam",
        w: 1400,
        h: 1218,
        aspect: "frame--slide",
        altKey: "alt.putter.cam",
        capKey: "cap.putter.cam",
      },
      {
        img: "putter-machining",
        w: 1400,
        h: 1867, aspect: "frame--photo",
        altKey: "alt.putter.machining",
        capKey: "cap.putter.machining",
      },
      {
        img: "putter-loft",
        w: 1400,
        h: 1867, aspect: "frame--photo",
        altKey: "alt.putter.loft",
        capKey: "cap.putter.loft",
      },
      {
        img: "putter-inuse",
        w: 1400,
        h: 1867, aspect: "frame--photo",
        altKey: "alt.putter.inuse",
        capKey: "cap.putter.inuse",
      },
      {
        img: "cnc-drawing",
        w: 1600,
        h: 1067, aspect: "frame--landscape",
        altKey: "alt.putter.drawing",
        capKey: "cap.putter.drawing",
      },
    ],
  },

  {
    slug: "ramps",
    titleKey: "proj.ramps.title",
    ledeKey: "case.ramps.lede",
    mark: "ramps-mark",
    hero: { img: "ramps-bank", w: 1400, h: 1400, aspect: "frame--square", altKey: "alt.ramps.hero" },
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
    link: { href: "https://www.chameleonramps.com", labelKey: "case.link.ramps" },
    gallery: [
      {
        img: "ramps-quarter",
        w: 1400,
        h: 1400, aspect: "frame--square",
        altKey: "alt.ramps.quarter",
        capKey: "cap.ramps.quarter",
      },
      { img: "ramps-alt1", w: 1200, h: 1200, aspect: "frame--square", altKey: "alt.ramps.alt1", capKey: "cap.ramps.alt1" },
      { img: "ramps-alt2", w: 1200, h: 1200, aspect: "frame--square", altKey: "alt.ramps.alt2", capKey: "cap.ramps.alt2" },
    ],
  },

  {
    slug: "wave",
    titleKey: "proj.wave.title",
    ledeKey: "case.wave.lede",
    // The cutaway leads, not a photograph: it is the only picture that shows
    // what the machine actually DOES, and the two photographs of the built
    // prototype are both low-resolution phone shots that read poorly at hero
    // size. They follow it as prints.
    hero: {
      img: "wave-section",
      w: 1189,
      h: 657,
      aspect: "frame--landscape",
      altKey: "alt.wave.section",
    },
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
      {
        img: "wave-inside",
        w: 600,
        h: 800,
        aspect: "frame--photo",
        altKey: "alt.wave.hero",
        capKey: "cap.wave.inside",
      },
      { img: "wave-base", w: 360, h: 480, aspect: "frame--photo", altKey: "alt.wave.base", capKey: "cap.wave.base" },
    ],
    poster: {
      img: "wave-poster",
      w: 2600,
      h: 1950,
      aspect: "frame--slide",
      altKey: "alt.wave.poster",
      capKey: "cap.wave.poster",
    },
  },

  {
    slug: "bot",
    titleKey: "proj.bot.title",
    ledeKey: "case.bot.lede",
    hero: { img: "bot-display", w: 1800, h: 1200, aspect: "frame--landscape", altKey: "alt.bot.hero" },
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
    posterPair: {
      en: { img: "bot-poster-en", w: 2600, h: 1950, aspect: "frame--slide", altKey: "alt.bot.poster" },
      de: { img: "bot-poster-de", w: 2600, h: 1950, aspect: "frame--slide", altKey: "alt.bot.poster" },
      capKey: "cap.bot.poster",
      hintKey: "cap.bot.posterHint",
    },
  },

  {
    slug: "campus",
    titleKey: "proj.campus.title",
    ledeKey: "case.campus.lede",
    mark: "campus-mark",
    hero: { img: "campus-logo", w: 1500, h: 1000, aspect: "frame--landscape", altKey: "alt.campus.hero" },
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
    link: { href: "https://www.campusnative.com", labelKey: "case.link.campus" },
    gallery: [],
  },

  {
    slug: "water",
    titleKey: "proj.water.title",
    ledeKey: "case.water.lede",
    hero: { img: "water-site", w: 1400, h: 933, aspect: "frame--landscape", altKey: "alt.water.hero" },
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
      { img: "water-1", w: 1400, h: 933, aspect: "frame--slide", altKey: "alt.water.map", capKey: "cap.water.map" },
    ],
  },
];

const bySlug = new Map(PROJECTS.map((p) => [p.slug, p]));

/**
 * Every AVIF in the folder, resolved AT BUILD TIME.
 *
 * This has to be a glob rather than `./src/assets/img/${name}.avif` built at
 * runtime: the bundler only inlines assets it can see statically, so a template
 * literal produced a path to a file that does not exist in a single-file build.
 * The rooms rendered with empty frames and the build quietly stopped being
 * self-contained. `eager` returns the data URI directly.
 *
 * AVIF only, deliberately. Globbing the JPEG fallbacks as well doubled the
 * page: every fallback is roughly the weight of the AVIF it backs up, and the
 * rooms would carry both for every plate. The wall keeps its `<picture>`
 * fallbacks in markup, so a browser without AVIF still gets the whole
 * portfolio; it loses only the photographs inside a room.
 */
const IMAGES = import.meta.glob<string>("./assets/img/*.avif", {
  eager: true,
  query: "?url",
  import: "default",
});

function src(stem: string): string {
  const url = IMAGES[`./assets/img/${stem}.avif`];
  if (!url) console.error(`missing image: ${stem}.avif`);
  return url ?? "";
}

/** Builds one framed picture, matching the wall's frame > mat > window nesting. */
function framed(shot: Shot): HTMLElement {
  const frame = document.createElement("div");
  frame.className = `frame ${shot.aspect}`;

  const mat = document.createElement("div");
  mat.className = "frame__mat";

  const win = document.createElement("div");
  win.className = "frame__win";

  const img = document.createElement("img");
  img.src = src(shot.img);
  img.width = shot.w;
  img.height = shot.h;
  img.alt = t(shot.altKey);
  img.loading = "lazy";
  img.decoding = "async";

  win.append(img);
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
  const title = el("h1", "case__title display", t(project.titleKey));

  // A work that IS a company shows its mark beside the room's title. The mark
  // is decorative here: the heading names the company immediately after it, so
  // announcing the logo as well would only repeat that to a screen reader.
  let heading: HTMLElement = title;
  if (project.mark) {
    const wrap = el("div", "case__name");
    const logo = document.createElement("img");
    logo.className = "case__mark";
    logo.src = src(project.mark);
    logo.alt = "";
    logo.decoding = "async";
    wrap.append(logo, title);
    heading = wrap;
  }

  head.append(el("span", "eyebrow", t("case.eyebrow")), heading, el("p", "case__lede", t(project.ledeKey)));

  // The picture holds one column; the plate and the whole article share the
  // other. Keeping the text in the same grid as the work is what stops the
  // right-hand side of the room being empty wall for its entire height.
  const top = el("div", "case__top");

  /*
   * The picture column holds the hero AND anything shown with it, as one grid
   * cell. Appending the turning part straight to the grid made it the SECOND
   * cell, which pushed the whole description down into row two and left the
   * text no longer beside the work it describes.
   */
  const pictures = el("div", "case__pictures");
  pictures.append(framed(project.hero));
  top.append(pictures);

  const column = el("div", "case__column");

  const plate = el("dl", "plate");
  for (const spec of project.specs) {
    plate.append(el("dt", "plate__k", t(spec.labelKey)));
    const value = el("dd", "plate__v", t(spec.valueKey));
    // The oxblood is reserved for measured results, so only the result row
    // carries it, the same rule the labels on the wall follow.
    if (spec.measured) value.setAttribute("data-measured", "");
    plate.append(value);
  }
  column.append(plate);

  const body = el("div", "case__body");
  for (const section of project.sections) {
    body.append(el("h2", "case__h", t(section.hKey)));
    for (const key of section.bodyKeys) body.append(el("p", "case__p", t(key)));
  }
  // The turning part sits under the hero, in the picture column, so the room
  // reads as one work seen two ways rather than as a gallery with a gadget in
  // it. The scene runtime mounts it when the view is revealed.
  if (project.scene) {
    const figure = document.createElement("figure");
    figure.className = "case__scene";

    const stage = document.createElement("div");
    stage.className = "putter";
    stage.dataset["scene"] = project.scene.id;
    figure.append(stage);

    const caption = document.createElement("figcaption");
    caption.className = "case__caption case__caption--scene";
    caption.textContent = t(project.scene.capKey);
    figure.append(caption);
    pictures.append(figure);
  }

  // A live site is evidence, not a claim: the two rooms whose work IS a running
  // product link straight to it, under the text that describes it.
  if (project.link) {
    const link = document.createElement("a");
    link.className = "case__link";
    link.href = project.link.href;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = t(project.link.labelKey);
    column.append(link);
  }

  column.append(body);
  top.append(column);

  host.replaceChildren(back, head, top);

  if (project.gallery.length) {
    // The rest of the sequence hangs UNFRAMED, with a plain white border and
    // its caption. Only the hero gets the carved moulding: a gilt frame around
    // every supporting photograph spends the gesture until it means nothing,
    // and the room reads as a wall of frames rather than as one work.
    const gallery = el("div", "case__gallery");
    for (const shot of project.gallery) {
      const figure = document.createElement("figure");
      figure.className = "case__plate";

      const img = document.createElement("img");
      img.className = "case__img";
      img.src = src(shot.img);
      img.width = shot.w;
      img.height = shot.h;
      img.alt = t(shot.altKey);
      img.loading = "lazy";
      img.decoding = "async";
      figure.append(img);

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

  // The poster hangs full width at the foot: it is a document to be READ, and
  // at a third of the width in the print grid its body text would be unusable.
  if (project.poster) {
    const shot = project.poster;
    const figure = document.createElement("figure");
    figure.className = "case__poster";

    const img = document.createElement("img");
    img.className = "case__img";
    img.src = src(shot.img);
    img.width = shot.w;
    img.height = shot.h;
    img.alt = t(shot.altKey);
    img.loading = "lazy";
    img.decoding = "async";
    figure.append(img);

    if (shot.capKey) {
      const caption = document.createElement("figcaption");
      caption.className = "case__caption case__caption--poster";
      caption.textContent = t(shot.capKey);
      figure.append(caption);
    }
    host.append(figure);
  }

  /*
   * A poster that exists in both languages, with a tab to switch between them.
   *
   * The tab is deliberately INDEPENDENT of the site's own language switch: a
   * German-speaking reader may still want the English poster beside an English
   * CV, and an English reader may want to see that the German exists. It opens
   * on whichever language the site is in, then follows the reader's choice.
   */
  if (project.posterPair) {
    const pair = project.posterPair;
    const figure = document.createElement("figure");
    figure.className = "case__poster";

    const tabs = el("div", "poster-tabs");
    const hint = el("p", "poster-tabs__hint", t(pair.hintKey));

    const img = document.createElement("img");
    img.className = "case__img";
    img.loading = "lazy";
    img.decoding = "async";

    const show = (lang: "en" | "de"): void => {
      const shot = lang === "de" ? pair.de : pair.en;
      img.src = src(shot.img);
      img.width = shot.w;
      img.height = shot.h;
      img.alt = t(shot.altKey);
      for (const b of tabs.querySelectorAll("button")) {
        b.setAttribute("aria-pressed", String(b.dataset["posterLang"] === lang));
      }
    };

    for (const lang of ["en", "de"] as const) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "poster-tabs__btn";
      btn.dataset["posterLang"] = lang;
      btn.textContent = lang.toUpperCase();
      btn.addEventListener("click", () => show(lang));
      tabs.append(btn);
    }

    figure.append(tabs, hint, img);

    const caption = document.createElement("figcaption");
    caption.className = "case__caption case__caption--poster";
    caption.textContent = t(pair.capKey);
    figure.append(caption);

    show(getLang());
    host.append(figure);
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
