# German — terminology and layout

Read this before writing or editing any German string. There is **no
native-speaker review in the loop**, so the conventions here and the
`satisfies Dict` check in `src/i18n/de.ts` are the only safety net.

Strings live in `src/i18n/de.ts`. `en.ts` is the source of truth; a key missing
from `de.ts` fails `tsc --noEmit`, and CI runs that before it builds.

## Terminology

The words below are the ones most likely to be got wrong by translating
literally. A German engineering lead will notice.

| English | German | Note |
| --- | --- | --- |
| design (engineering) | **Konstruktion** | Never `Design` — that means visual styling. |
| design (a part), to | **konstruieren** | |
| tolerance stack-up | **Toleranzkettenanalyse** | |
| GD&T | **Form- und Lagetoleranzen** | |
| manufacturing | **Fertigung** | |
| machining / milling | **Zerspanung** / **Fräsen** | |
| dimensional consistency | **Maßhaltigkeit** | |
| scrap | **Ausschuss** | |
| test rig | **Prüfstand** | |
| production run | **Serienfertigung** | `Kleinserie` for low volume. |
| prototype tooling | **Prototypenbau** | |
| complete-vehicle development | **Gesamtfahrzeugentwicklung** | Matches the HWA job title exactly — use their wording. |

**Leave established anglicisms alone.** German engineers say CNC, CAD, Python,
Live, Futures, Backtesting, Next.js. Translating them reads as overcorrection.

**Mirror HWA's own vocabulary** where their site has it (`Prototypenbau`,
`Homologation`, `Gesamtfahrzeugentwicklung`). Matching an employer's own terms
is the cheapest way to sound native.

## Register

Keep sentences **short and declarative**. Long subordinate clauses are exactly
where non-native German goes wrong, and a terse spec-sheet register suits a
gallery of engineering work anyway.

## Numbers

German convention, not English:

| English | German |
| --- | --- |
| `$50,000` | `50.000 $` |
| `42%` | `42 %` (space before the sign) |
| `±0.05 mm` | `±0,05 mm` |
| `3.78` | `3,78` |

## Layout

German runs **~30% longer** than English. That length difference is the single
most common source of layout bugs in this project.

- **Author the German string first**, then the English, and size the layout for
  the German.
- **Reserve height on anything that changes**: `min-block-size` on labels,
  captions and status lines; `min-inline-size` on nav items and the language
  toggle. Without it, switching language shifts the page.
- **`text-wrap: balance` is harmful at narrow widths.** Balancing line lengths
  against long compounds in a 390px box resolves to roughly one word per line
  and eats the first screen. Apply it only from 768px up.
- **Do not rely on `text-wrap: pretty`** — Safari and Firefox lack support, so
  it cannot be the fix for anything.
- **Grid children need an explicit `grid-column` at every breakpoint.** Without
  one they take a single column of the mobile grid (~67px), which is how the
  hero once collapsed to one word per line.

## Verifying

```sh
npx tsc --noEmit                          # a missing key fails here
npm run shots -- --lang=de --viewport=mobile
```

**390px German is the worst case.** Read the `.de.mobile.` screenshot back
before calling any visible change done; comparing it against the matching
`.en.` shot is what catches shifted layout.
