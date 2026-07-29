# Engineering portfolio — Michael Fischbach

An **art-gallery** portfolio: warm off-white walls, works hung in a carved gilt
frame, serif captions. Targets the HWA AG opening **Praktikant im Bereich
Gesamtfahrzeugentwicklung** (Affalterbach, start Feb/March 2027). Other versions
fork from this one later; every content decision optimises for that reader.

Live: <https://whynobro.github.io/portfolio/> · repo `whynobro/portfolio`

## Invariants

- **The build must stay ONE file.** `dist/index.html`, everything inlined,
  openable from `file://` with no server. Anything in `public/` is copied
  verbatim and silently breaks this — put assets in `src/assets/` and reference
  them **relatively** (`./src/assets/img/x.avif`) so the bundler inlines them.
  CI fails if `dist` holds more than one file.
- **Every German string is compile-checked.** `de.ts` ends `satisfies Dict`, so
  a missing or misspelled key fails `tsc --noEmit`. Never weaken this — there is
  **no native-speaker review in the loop**, so the type system is the only net.
  Terminology, number format and the layout rules German forces: `docs/german.md`.
- **Gilt (`--gilt`) is the accent; `--measured` (oxblood) marks measured results
  and nothing else.** That scarcity is what makes the numbers land.
- **Reduced motion suppresses autonomous motion only.** Every scene must still
  paint a full static frame via `renderStatic()` and stay interactive on input.
- **Claims on labels must be true and, where testable, tested.** The
  "unbeatable" tic-tac-toe label is backed by `npm run verify:ttt`, which plays
  every possible game from both sides and asserts the machine never loses.

## The frame

The moulding is a photographed carved frame used as a CSS `border-image`.
`scripts/prep-frame.mjs` measures the moulding band from the source's **alpha
channel** and prints the slice value — never guess it, or the carved corners
stretch and the ornament clips.

Two failures already fixed here; do not reintroduce them:

- **`background` must be `padding-box`.** A plain background fills the whole
  border box, and the carved silhouette has transparent gaps around the
  ornament, so white bleeds through beside every carving and reads as a pale
  band against the wall.
- **Shadow must be `filter: drop-shadow`, not `box-shadow`.** `box-shadow`
  traces the rectangular border box and draws a hard rectangle past the carved
  edge. Hover animates `transform` only — animating `filter` re-rasterises the
  shadow every frame across six frames.

## The screenshot loop

Design changes are verified by reading rendered PNGs back, never by assuming.

```sh
npm run dev                              # must already be running
npm run shots                            # every route, EN + DE
npm run shots -- --only=landing --lang=de
npm run shots -- --motion=reduce         # prove reduced-motion
```

Output: `screenshots/local/<name>.<lang>.<viewport>.png` (gitignored).

**Rule: no visible change is done until both `.en.` and `.de.` variants have
been read back at desktop and mobile.** German at 390px is the worst case and is
where bugs actually surface — a hero collapsing to one grid column was found
exactly that way.

`?shots=1` force-mounts every scene, paints a static frame, and sets
`data-ready="1"` **only after the scene has been sized**; the capture waits on
that attribute rather than a fixed delay.

**Caveat worth knowing:** `fullPage` capture resizes the viewport, so
`loading="lazy"` images below the fold photograph as empty frames *even though
they load fine in a browser*. The capture scrolls to trigger them first. If a
full-page shot shows blanks, verify in the DOM before "fixing" CSS — that
screenshot has lied once already.

## Asking Michael for assets

**Michael sources stock PNGs, photographs and references on request — ask
whenever one would improve the result instead of working around a poor source.**
The gold frame arrived this way after a first attempt (a JPEG with a baked white
halo) proved unusable.

State: exact filename and folder, minimum resolution, format, and **how he can
verify it before sending**. For transparency: zoom in — if the checkerboard
squares scale with the zoom it is real alpha; if they stay fixed it is a
*picture* of a checkerboard and will ship a halo.

`assets-src/` is gitignored, sorted per project: `putter/ ramps/ wave/
nicaragua/ smc-bot/ campus-native/ brand/ misc/ docs/`, with `inbox/` for
anything unsorted. `docs/` holds Michael's own bio, project list and awards
text — **read those before writing copy**.

## Structure

Single page, hash-routed views (`#/awards`, `#/about`, `#/contact`); hash rather
than History API because it must work from `file://`.

```text
index.html                     the only page; one [data-view] per room
src/main.ts                    boot: i18n -> awards -> router -> scenes
src/router.ts                  view switching, focus management, titles
src/awards.ts                  awards room, rendered from data
src/i18n/{en,de}.ts            en.ts is the source of truth
src/scenes/{tictactoe,ringtoss}/   SceneModule: mount/resize/dispose/renderStatic
src/styles/                    tokens, base, layout, frame, chrome, games
scripts/prep-frame.mjs         frame PNG -> border-image + measured slice
scripts/prep-images.mjs        manifest-driven raster -> AVIF + JPEG fallback
scripts/heic-to-jpg.ps1        iPhone HEIC -> JPEG (see note below)
scripts/verify-tictactoe.mjs   exhaustive proof the engine cannot lose
docs/german.md                 German terminology, numbers, layout rules
```

**HEIC:** sharp's libheif rejects Michael's photos (Live Photos carry 45 refs,
over its limit of 16) and `System.Drawing` reports its missing decoder as "Out
of memory". Only the WIC path in `heic-to-jpg.ps1` works.

## Projects on the wall

Six works. Sources in `assets-src/<folder>/`.

| Work | Folder | Notes |
| --- | --- | --- |
| CNC-milled putter | `putter/` | 11 converted photos: CAD → in the vise → in hand → on the green. The strongest sequence on the site. Capstone drawing has a mint-green slide background baked in that still needs masking. |
| Chameleon Ramps | `ramps/` | 11 product photos. `p4` (Beachside Bank on wet rock) and `p9` (quarter pipe against foliage) are the strongest. |
| Wave energy converter | `wave/` | inside / base views. 1st place, highest measured wattage. |
| SMC execution system | `smc-bot/` | Jarvis operator display. |
| Net-Zero shipping container | — | Apricot Lane Farms, real client, ADA + net-zero CO₂. **No image yet** — currently borrows the capstone drawing. |
| Campus Native | `campus-native/` | Transparent logo only. **Needs a screenshot of the live site**; currently borrows the Nicaragua map. |

Deliberately **not** on the wall: Doorknob-Inator and the noodle bridge (too
slight as works). The noodle bridge lives in the awards room instead.

Open request: a **putter STL** for a rotating 3D piece in a frame. Not on the
machine — must come from Fusion 360.

## Facts

Sources disagree; these are current. The resume is stale on several points.

- Cal Poly SLO, Mechanical Engineering, Honors. GPA 3.78, Dean's List ×3.
- CNC putter: 4-axis HAAS, 6061, $15.78 modelled unit cost vs $50–150 retail,
  1 of 8 finalists from 40+, presented to 300+.
- Wave energy converter: 1st place, highest measured wattage. **No absolute
  wattage figure yet** — worth asking for.
- Chameleon Ramps: since 2019, 40+ products, **$50k revenue** (resume says $25k,
  LinkedIn $30k; $50k is Michael's current figure).
- Execution system: **1553 tests passing**, **options live, futures in demo**.
  Resume says "190 tests, paper trading" — badly understated.
- Noodle bridge: 1st place, won by a 38.5% margin.
- US citizen, eligible for a German study-related internship residence permit.

## Commands

```sh
npm run dev          # vite dev server on :5173
npm run build        # tsc --noEmit && vite build -> dist/index.html
npm run shots        # screenshot loop (dev server must be running)
npm run verify:ttt   # prove the tic-tac-toe engine never loses
node scripts/prep-images.mjs [name]   # whole manifest, or one entry
node scripts/prep-frame.mjs           # rebuild the frame border-image
```

## Deploy

GitHub Pages via `.github/workflows/deploy.yml` on push to `main`. CI runs
`tsc --noEmit` (catches a missing German key), builds, and asserts `dist`
contains exactly one file. Custom domain deferred; `base: "./"`
in `vite.config.ts` is relative, so it works on a project page, a user page, or
from disk unchanged.
