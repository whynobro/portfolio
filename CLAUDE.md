# Engineering portfolio — Michael Fischbach

Targets the HWA AG opening **Praktikant im Bereich Gesamtfahrzeugentwicklung**
(Affalterbach, start Feb/March 2027). Other versions get forked from this one
later; every content decision here optimises for that reader.

## Asking Michael for assets

**Michael can source stock PNGs, photographs and reference images on request —
ask whenever one would improve the result instead of working around a poor
source.** He supplied the gold frame this way after the first attempt (a JPEG
with a baked white halo) proved unusable.

When asking, state: the exact filename and folder, the minimum resolution, the
format, and **how he can verify it himself before sending**. For transparency:
zoom in — if the checkerboard squares scale with the zoom it is real alpha; if
they stay fixed it is a picture of a checkerboard and will ship a white halo.

Assets live in `assets-src/` (gitignored), sorted per project:
`putter/ ramps/ wave/ nicaragua/ smc-bot/ campus-native/ brand/ misc/ docs/`.
Anything unsorted goes in `assets-src/inbox/`. Processed output lands in
`src/assets/img/` via `scripts/prep-images.mjs` and `scripts/prep-frame.mjs`.

## Invariants

- **The build must stay ONE file.** `dist/index.html` with everything inlined,
  openable from `file://` with no server. Anything placed in `public/` is copied
  verbatim and silently breaks this — put assets in `src/assets/` and reference
  them relatively so the bundler inlines them. CI fails if `dist` has more than
  one file.
- **Size budget: 900 KB.** `node scripts/size.mjs` enforces it; CI fails over.
  Base64 inlining costs ~33%, so prefer canvas-drawn visuals over photos.
- **Every German string is compile-checked.** `de.ts` uses `satisfies Dict`, so a
  missing or misspelled key fails `tsc --noEmit`. Never weaken this — there is no
  native-speaker review in the loop, so the type system is the only safety net.
- **Amber (`--measured`) marks measured results and nothing else.** Its scarcity
  is what makes the numbers land. Blue is structure; amber is evidence.
- **Reduced motion suppresses autonomous animation only.** Scenes must still
  render their full static frame and stay interactive on user input.

## The screenshot loop

Design changes are verified by reading rendered PNGs back, not by assuming.

```
npm run dev                                  # must already be running
npm run shots                                # every page, EN + DE
npm run shots -- --only=cnc --lang=de        # subset
npm run shots -- --motion=reduce             # prove reduced-motion
```

Output: `screenshots/local/<name>.<lang>.<viewport>.png` (gitignored).

**Rule: no visible change is done until both `.en.` and `.de.` variants have
been read back at desktop and mobile.** German at 390px is the worst case and is
where layout bugs actually surface — a collapsed hero grid and a wrapping visa
caption were both found that way and would not have been caught otherwise.

`?shots=1` makes the page force-mount every scene, paint a static frame, and set
`data-ready="1"` only after the scene has been sized. The capture waits on that
attribute instead of a fixed delay.

## Layout rules that keep German from breaking

German runs ~30% longer than English.

- Author the German string first, then the English, and size the layout for it.
- Reserve height on anything that changes: `min-block-size` on labels and
  captions, `min-inline-size` on nav items and the language toggle.
- `text-wrap: balance` is harmful at narrow widths — against long compounds in a
  390px box it resolves to one word per line. It is applied only from 768px up.
- Do not rely on `text-wrap: pretty`; Safari and Firefox do not support it.

## Terminology (no native reviewer, so be careful)

`Konstruktion` = design-engineering, **never** `Design` (that means styling).
`Toleranzkettenanalyse` (tolerance stack-up), `Form- und Lagetoleranzen` (GD&T),
`Fertigung` (manufacturing), `Maßhaltigkeit` (dimensional consistency),
`Ausschuss` (scrap). Keep sentences short and declarative. Leave established
anglicisms alone (CNC, CAD, Python, Live, Futures). Numbers use German
convention: `30.000 $`, `42 %`, `±0,14 mm`.

## Projects on the wall

Six works, decided with Michael. Sources in `assets-src/<folder>/`.

| Work | Folder | Notes |
|---|---|---|
| CNC-milled putter (capstone) | `putter/` | 11 HEIC photos of the real part — **convert, browsers cannot read HEIC**. Also the capstone drawing (has a mint-green slide background baked in that needs masking on a white wall). |
| Chameleon Ramps | `ramps/` | 11 product photos from chameleonramps.com. `p4` (Beachside Bank on wet rock) and `p9` (quarter pipe against foliage) are the strongest. |
| Wave energy converter | `wave/` | inside / base views + a diagram. **1st place, highest measured wattage.** |
| Net-Zero shipping container | — | Apricot Lane Farms, real client, ADA + net-zero CO₂. No photo yet. |
| Campus Native | `campus-native/` | Transparent logo only; needs a screenshot of the live site. |
| SMC execution system | `smc-bot/` | Jarvis display screenshot. |

Not on the wall but referenced: Nicaragua water system (`nicaragua/`),
Doorknob-Inator, 1st-place noodle bridge (won by 38.5%, has a force–deflection
graph — good material if a seventh work is ever wanted).

## Facts

Sources disagree; these are the current ones. The resume is stale on several
points and should be updated to match.

- Cal Poly SLO, Mechanical Engineering, Honors. GPA 3.78, Dean's List ×3.
- CNC putter: 4-axis HAAS, 6061, $15.78 modelled unit cost vs $50–150 retail,
  1 of 8 finalists from 40+.
- Wave energy converter: **1st place**, highest measured wattage in the field.
- Chameleon Ramps: since 2019, 40+ products, **$50k revenue**.
- Trading bot: **1553 tests passing**, **options live, futures in demo**.
  (Resume says "190 tests, paper trading" — badly understated.)
- US citizen, eligible for a German study-related internship residence permit.

## Commands

```
npm run dev         # vite dev server on :5173
npm run build       # tsc --noEmit && vite build  -> dist/index.html
npm run size        # size budget check
npm run shots       # screenshot loop (dev server must be running)
node scripts/prep-images.mjs <src>   # raster -> sized AVIF + JPEG fallback
```

## Deploy

GitHub Pages via `.github/workflows/deploy.yml` on push to `main`. Custom domain
deferred; `base: "./"` in `vite.config.ts` is relative so it works on a project
page, a user page, or from disk without changes.
