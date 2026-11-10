# Campus Native (removed from the portfolio 2026-11-10)

Taken off the site at Michael's request on 2026-11-10. Everything it had is
kept here so it can be restored without archaeology.

**Restore point:** git tag `campus-native-last` (commit 7f8909a) is the last
commit with Campus Native on the wall, in a room and in Pocket Gallery. For a
full restore, `git diff campus-native-last <removal commit> -- <file>` and
reverse it; the snippets below are the text-level parts.

## What stayed in the repo

- Images: `src/assets/img/campus-logo.*`, `campus-guides.*`, `campus-mark.*`,
  and their `scripts/prep-images.mjs` entries (sources in
  `assets-src/campus-native/`, gitignored). `projects.ts` globs every AVIF, so
  Vite still emits them to `dist/`, but no page references them.
- `scripts/shoot-campus.mjs` (re-shoots campusnative.com).
- The PDF resume and CV still list Campus Native (they are not the site).
- `src/intro.ts` (shelved, imported by nothing) still names `campus-logo` in
  `WALL_WORKS`; fix that if the opening is ever restored.
- `docs/resume-inventory.md` keeps its Campus Native facts.

## What was removed

- Wall tile in `index.html`, the `campus` room in `src/projects.ts`, its
  copy in `src/i18n/en.ts`, its brand tint in `src/styles/case.css` (the
  `brand` field and `data-brand` hook in `projects.ts` stay, unused), and the
  `work-campus` route in `scripts/shots.config.ts`.
- Pocket Gallery: the GUIDE trainer (`data.ts`), its look (`looks.ts`), its
  monster sprites and `PAL_CAMPUS` (`monsters.ts`), its battle sprite
  (`battle.ts`), `frame_campus` and `plinth_campus` (`tiles.ts`), its frame
  and stanchion on the north wall and its spots (`map.ts`), `"campus"` from
  `ProjectId`/`PROJECT_IDS` (`types.ts`), and its `map` overworld extra in
  `EXTRAS` (`game.ts`). Art is in the tag only: too large to copy here.
  Old saves that beat it lose that entry silently (`save.ts` filters unknown
  ids).

## Facts (as shown on the site)

- Founder and CEO; led a 4-person intern team (engineering, marketing, content).
- Next.js, PostgreSQL, Stripe. 16 data models. Live at campusnative.com,
  booking and payment end to end. Double-booking blocked by a database
  constraint, not application logic. Result plate was flagged `measured`.
- Brand colours: forest green #2e4632 (logo), #27453a (site), sand #c8b285.

## Wall tile (`index.html`, last in the Projects section)

```html
            <a class="work" href="#/work/campus">
              <div class="frame frame--landscape">
                <div class="frame__mat">
                  <div class="frame__win">
                    <img
                      src="./src/assets/img/campus-logo.avif"
                      width="1500"
                      height="1000"
                      alt="The Campus Native marketplace, live at campusnative.com"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
              <div class="label">
                <div class="label__rule"></div>
                <div class="label__name">
                  <picture>
                    <source
                      srcset="./src/assets/img/campus-mark.avif"
                      type="image/avif"
                    />
                    <img
                      class="label__mark"
                      src="./src/assets/img/campus-mark.png"
                      alt=""
                      width="320"
                      height="329"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  <h3 class="label__title">
                    Campus Native
                  </h3>
                </div>
                <p class="label__body">
                  A production marketplace for student-led campus tours: sixteen
                  data models and payment handling, with double-booking
                  prevented by a database constraint rather than application
                  logic.
                </p>
                <p class="label__meta">
                  Next.js ·
                  <span>live in production</span>
                </p>
              </div>
            </a>
```

## Room (`src/projects.ts`, last entry of `PROJECTS`)

```ts
  {
    slug: "campus",
    titleKey: "proj.campus.title",
    ledeKey: "case.campus.lede",
    mark: "campus-mark",
    brand: "campus",
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
    gallery: [
      {
        img: "campus-guides",
        w: 1600,
        h: 1067,
        aspect: "frame--landscape",
        altKey: "alt.campus.guides",
        capKey: "cap.campus.guides",
      },
    ],
    galleryInPictures: true,
  },
```

## Copy (`src/i18n/en.ts`)

```ts
  "proj.campus.title": "Campus Native",
  "case.link.campus": "Visit campusnative.com",
  // Campus Native
  "case.campus.lede":
    "A marketplace for campus tours led by current students, live in production and taking real bookings.",
  "case.campus.role": "Founder and CEO · led a 4-person intern team",
  "case.campus.tools": "Next.js · PostgreSQL · Stripe",
  "case.campus.scope": "16 data models",
  "case.campus.result": "Live in production",
  "case.campus.brief":
    "The official campus tour is a script. Prospective students want the version from someone studying what they want to study.",
  "case.campus.approach1":
    "Sixteen data models carry universities, guides, availability, bookings and payouts. Guides set their own rates and are matched to visitors by major and interest, because that match is the entire reason to book a person rather than a slot. I recruited four interns across engineering, marketing and content, set their priorities and led the build of the listing and booking flow.",
  "case.campus.approach2":
    "Double-booking is prevented by a constraint in the database, not by a check in the application. Application-level checks lose the race the moment two people press the button at once; the database is the only place the answer can be decided exactly once.",
  "case.campus.outcome":
    "The site is live at campusnative.com and handles the booking and payment path end to end.",
  "alt.campus.guides":
    "The marketplace listing guides at Cal Poly, each with their major, rating and rate per tour",
  "cap.campus.guides": "Guides listed at Cal Poly, with the rate each one sets for a tour.",
  "alt.campus.hero": "The Campus Native marketplace, live at campusnative.com",
```

## Brand tint (`src/styles/case.css`)

```css
/* ---- Brand-tinted rooms -------------------------------------------------- */
/*
 * A room whose work IS a company takes that company's palette, by overriding
 * the accent TOKENS rather than by restating any rule: the eyebrow, the plate's
 * rule, the link, the back link and the focus ring all already draw from
 * `--gilt`, so they follow at once and nothing can be missed.
 *
 * Campus Native's colours, read off the mark and the live site rather than
 * guessed: a deep forest green (#2e4632 in the logo, #27453a on the site) and
 * the warm sand it pairs with (#c8b285).
 *
 * `--measured` is deliberately NOT touched. The oxblood means "this figure was
 * measured" everywhere on the site, and a room that recoloured it would be
 * making the one promise the palette is not allowed to break.
 */
[data-brand="campus"] {
  --gilt-hi: #6f8c6a;
  --gilt: #2e4632;
  --gilt-lo: #1e3122;
  /* The sand, for the one place a second brand colour earns its place: the
   * rule under the room's title. */
  --brand-sand: #c8b285;
}
[data-brand="campus"] .case__title {
  color: #24361f;
}
```

## Pocket Gallery trainer (`src/handheld/data.ts`)

```ts
  {
    id: "campus",
    slug: "campus",
    name: "CAMPUS NATIVE",
    short: "CAMPUS",
    trainer: "GUIDE",
    types: ["SOFTWARE", "BUSINESS"],
    intro: "Campus tours led by real students. It's live right now!",
    win: "Book a person, not a slot. See you on campus!",
    rematch: "Want the tour again?",
    counters: [{ name: "WALKING TOUR", line: "You walk the whole campus. Your feet hurt." }, { name: "BOOKED UP", line: "Every slot is taken. You wait in line." }, { name: "PIN DROP", line: "A giant map pin drops on you!" }],
    moves: [
      { name: "FOUNDER", type: "BUSINESS", lines: ["MICHAEL founded it, and led a 4-person intern team."] },
      { name: "MATCHMAKER", type: "SOFTWARE", lines: ["Guides are matched to visitors by major and interest."] },
      { name: "NO DOUBLES", type: "SOFTWARE", lines: ["The database itself blocks double-booking, not the app."] },
      { name: "LIVE SITE", type: "BUSINESS", lines: ["Live at campusnative.com, booking and payment end to end."] },
    ],
  },
```

Look (`src/handheld/art/looks.ts`):

```ts
  campus: {
    look: { ...skin.fair, hair: "#7a3e22", hairShade: "#552813", top: "#2596be", topShade: "#17698a", topLight: "#6fc4de", bottom: "#d8d0bf", bottomShade: "#b3a991", shoe: "#5a4632", outline: OUTLINE },
    hair: "long",
    hat: null,
    outfit: null,
    brief: "GUIDE: campus tour guide in a cyan polo and khakis, holding a folded map.",
  },
```

Map (`src/handheld/art/map.ts`): frame prop, trainer spot, work tile. A
`stanchion_pair` at x 20, y 2 stood under the frame.

```ts
    { id: "frame_campus", x: 19, y: 0 },
    campus: [18, 3, "down"],
    campus: [19, 2],
```

`game.ts` `EXTRAS`: `campus: ["map"]`. Game copy said "Six curators" and
"Six works"; now five.
