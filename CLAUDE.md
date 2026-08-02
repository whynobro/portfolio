# Engineering portfolio — Michael Fischbach

An **art-gallery** portfolio: warm off-white walls, works hung in a carved gilt
frame, serif captions. Targets the HWA AG opening **Praktikant im Bereich
Gesamtfahrzeugentwicklung** (Affalterbach, start Feb/March 2027). Other versions
fork from this one later; every content decision optimises for that reader.

Live: <https://michaelfischbach.dev> · repo `whynobro/portfolio`
(the github.io URL still redirects, but the custom domain is the one to quote)

## Invariants

- **The shell must stay small; photographs stay OUT of it.** The build is
  `dist/index.html` (~25 KB, 6 KB gzip) plus a content-hashed `dist/assets/`.
  CI fails if `index.html` grows past 100 KB, which is what a stray re-inline
  looks like. Put assets in `src/assets/` and reference them **relatively**
  (`./src/assets/img/x.avif`) so the bundler hashes and rewrites them; anything
  in `public/` is copied verbatim and skips that. Assets under 4 KB still inline
  (a request costs more than the base64 tax at that size).

  `public/` holds exactly two files, and both are there because something
  outside the build needs them at a FIXED name a content hash would break:

  - `CNAME` — GitHub Pages reads the custom domain from a literal file at the
    root of the artifact. **Without it Pages drops the custom domain on the
    next deploy** and the site reverts to the github.io URL. No trailing
    newline.
  - `og.png` — the link-preview card. A crawler fetches it before running any
    JavaScript and does not resolve relative paths, so `index.html` names it
    as an absolute `https://michaelfischbach.dev/og.png`.

  Nothing else may join them: every other asset belongs in `src/assets/` where
  it gets hashed.

  SUPERSEDED (2026-07-31): the build was ONE inlined file, openable from
  `file://`. That cost **7.1 MB gzip of blocking payload before first paint**:
  base64 defeats `loading="lazy"` (bytes already in the document), defeats
  per-asset caching, and adds 33% over binary. Splitting cut first paint to
  ~90 KB gzip (79x) and total bytes 9.5 MB to 5.9 MB, with **no image
  re-encoded**. The portfolio ships as a LINK, so `file://` bought nothing.
  Cost: a lone `index.html` on a USB stick or as a mail attachment no longer
  renders its photographs (zip the folder instead).
- **Every German string is compile-checked.** `de.ts` ends `satisfies Dict`, so
  a missing or misspelled key fails `tsc --noEmit`. Never weaken this — there is
  **no native-speaker review in the loop**, so the type system is the only net.
  Terminology, number format and the layout rules German forces: `docs/german.md`.
- **Gilt (`--gilt`) is the accent; `--measured` (oxblood) marks measured results
  and nothing else.** That scarcity is what makes the numbers land. The one
  sanctioned exception is the tic-tac-toe board: its marks are red and green, to
  Michael's reference image, because the toy should read as a real game.
- **Reduced motion suppresses autonomous motion only.** Every scene must still
  paint a full static frame via `renderStatic()` and stay interactive on input.
- **Claims on labels must be true and, where testable, tested.** The
  "unbeatable" tic-tac-toe label is backed by `npm run verify:ttt`, which plays
  every possible game from both sides and asserts the machine never loses.
- **Every room must stay reachable on a phone.** The masthead once hid Work,
  About and Contact below 560px to stop the German bar overflowing, which left
  `#/about` with no route in at all on the device most recruiters open the link
  on. The overflow was never the nav's fault: English fits at 390px, and German
  went over by 21px because of the wordmark plus "Auszeichnungen". Both
  `.masthead__inner` AND `.masthead__nav` wrap, so German takes a second line
  instead of losing its navigation. Never fix an overflow by removing a route.
- **The resume button follows the site's language.** English serves
  `src/assets/docs/resume.pdf`; German serves `resume-de.pdf`, the Lebenslauf
  built by `scripts/make-cv-de.mjs`. These are two documents in different
  genres, not one translated, so a German reader must never be handed the
  English one. `src/resume.ts` sets both the `href` and the `download`
  filename, and re-points them on `i18n:change`. **`resume-de.pdf` is a
  committed copy**: regenerating the Lebenslauf does NOT update the site until
  the new PDF is copied over it.
- **`resume.pdf` is the HWA application resume, not a general one.** It names
  the Praktikum im Bereich Gesamtfahrzeugentwicklung, Affalterbach and
  Feb/March 2027, and states eligibility to intern in Germany. That is correct
  for this site, which exists for that application. Do not strip the HWA
  framing from it: that would silently weaken the application the whole site is
  built around. It is now generated (`--only=hwa`) rather than hand-made, but
  it is still a **committed copy**: regenerating does NOT update the site until
  the new PDF is copied over `src/assets/docs/resume.pdf`.
- **`scripts/make-cv-en.mjs` renders three resumes from ONE template**, so the
  figures cannot drift apart: `-Resume.pdf` (US), `-Resume-Abroad.pdf`
  (international), `-Resume-HWA.pdf` (the site's). They differ in **exactly two
  strings**, the objective and the eligibility line. Only the HWA one names an
  employer, and only it belongs on the site; handing this portfolio's reader a
  generic resume would be a downgrade.
- **`scripts/make-cv-onepage.mjs` is the one-page resume**, a different
  *selection* rather than a different objective, which is why it is its own
  script. It drops whole entries (the high school, the two non-engineering
  jobs, the Nicaragua system, the Doorknob-Inator) and keeps only work carrying
  a checkable number. Both it and the two-page versions fit their page with
  under 5px to spare, so **any content added to either will overflow**: measure
  after editing, and cut something rather than shrinking the type.
- **Contact links are real PDF anchors, and LinkedIn + the portfolio are
  visibly blue.** They are `<a>` elements, so Chromium writes `/Annots` link
  objects a reader can click, and both carry `class="link"` for `#0563c1`
  underlined (Word's hyperlink colour). This is deliberate and was asked for
  twice: a PDF gives no hover cue and no cursor change, so an unstyled link is
  invisible as a link, and "LinkedIn" in body colour reads as just a word. The
  portfolio link only pays off if a recruiter clicks it. **The email stays in
  body colour** — it is already recognisable as an address, and a third blue
  run turns the centred header into a link bar. LinkedIn shows as the word
  "LinkedIn"; the portfolio keeps its URL visible because it is short and is
  the thing being advertised.
- **A resume targeted at one posting is SELECTED, not assembled.**
  `docs/resume-inventory.md` is the superset of everything that could go on a
  resume: every project with more bullets than any one document should use,
  every award, every framing of the identity line. Read it before drafting a
  targeted resume, pick against the posting, and leave the rest out. Pasting
  the whole inventory in produces a resume that argues nothing. It is also the
  authority on figures: it carries the table of what older PDFs got wrong.
- **A resume is never made to fit by shrinking the type.** An earlier pass here
  invented its own layout and drove the body to 8.1pt to force one page, which
  produced something nobody would read. Every English document uses the same
  layout (centred name, ruled section headings, entries indented from the rule
  with the date flush right) at 10pt for the two-page versions and 9.6pt for
  the one-pager, which is the floor. The one-pager reaches one page by dropping
  whole entries, never by compressing type. Cut content if it must be shorter.

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

## The two playable pieces

They hang **unframed and uncaptioned**, under the portrait in the entrance's
left column. They are toys, not works: a gilt frame around a playable board
claims what the seven pieces on the wall have earned. Their titles stay in the
dictionaries as the `aria-label` for each board, which is the only name a
screen reader now has.

- **The box is fixed** (`.playable`), never a fraction of the column. Each
  scene sizes its canvas from its own box, so a percentage box re-measured on
  every layout pass made the boards visibly jump as they mounted.
- **Ring toss sizes from the CANVAS, not the root.** The score line above and
  the fullscreen control below take part of the root's height; sizing to the
  root drew the toy's base — and the pump button with it — past the bottom of
  the visible canvas, where it could not be clicked.
- **Its forces scale with tank height**, not in absolute pixels, so the physics
  plays the same at 190px on the wall and in fullscreen.
- The pump and the side jets are **drawn on the toy** and hit-tested on the
  canvas; the two `.ring__pump-a11y` buttons exist only for keyboard and
  screen-reader access.
- `__ring.state()` on the scene root exposes the live simulation (seating,
  score, both jets, button geometry) so the physics is verified against real
  state rather than by reading pixels.

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

Single page, hash-routed views (`#/awards`, `#/about`, `#/contact`, and
`#/work/<slug>` for each work's room). Hash rather than History API: it needs
no server-side rewrite rule, so the site stays portable across any static host.

**A room is one container filled from data**, not six blocks of markup:
`#view-project` is re-rendered per slug by `src/projects.ts`. `initProjects()`
must run BEFORE `initRouter()` — the router asks it to resolve `/work/<slug>` on
the very first render. An unknown slug falls through to the collection rather
than showing an empty room, and returning from a room scrolls the work that was
clicked back into view.

Like the awards room, the project rooms need JavaScript where the wall does not.
That is the accepted trade: the wall carries every work's title, description and
figures inline, so the no-JS document is still a complete portfolio.

```text
index.html                     the only page; one [data-view] per room
src/main.ts                    boot: i18n -> awards -> projects -> router -> scenes
src/router.ts                  view switching, focus management, titles
src/awards.ts                  awards room, rendered from data
src/projects.ts                the six project rooms, rendered from data
src/i18n/{en,de}.ts            en.ts is the source of truth
src/resume.ts                  points the resume button at EN or DE by language
src/scenes/{tictactoe,ringtoss}/   SceneModule: mount/resize/dispose/renderStatic
src/styles/                    tokens, base, layout, frame, chrome, games, case
scripts/prep-frame.mjs         frame PNG -> border-image + measured slice
scripts/prep-images.mjs        manifest-driven raster -> AVIF + JPEG fallback
scripts/shoot-jarvis.mjs       live bot dashboard -> a work (composed, see above)
scripts/shoot-campus.mjs       campusnative.com -> a work
scripts/heic-to-jpg.ps1        iPhone HEIC -> JPEG (see note below)
scripts/prep-mesh.mjs          putter STL -> quantised inline mesh
scripts/make-bot-poster.mjs    draws the bot poster, EN + DE, from real source
scripts/verify-tictactoe.mjs   exhaustive proof the engine cannot lose
scripts/make-icons.mjs         favicon set + the link-preview card
scripts/make-portfolio-pdf.mjs the wall exported as a PDF, for application forms
scripts/make-cv-de.mjs         the German Lebenslauf (NOT a translation, see the file)
scripts/make-cv-en.mjs         the three English resumes (US, abroad, HWA) from one template
scripts/make-cv-onepage.mjs    the one-page resume: strongest material only
docs/german.md                 German terminology, numbers, layout rules
docs/resume-inventory.md       every resume-able fact; SELECT from it, never paste it all
```

**HEIC:** sharp's libheif rejects Michael's photos (Live Photos carry 45 refs,
over its limit of 16) and `System.Drawing` reports its missing decoder as "Out
of memory". Only the WIC path in `heic-to-jpg.ps1` works.

## Projects on the wall

Six works. Sources in `assets-src/<folder>/`.

| Work | Folder | Notes |
| --- | --- | --- |
| CNC-milled putter | `putter/` | 11 converted photos, the Fusion CAM export, the STL behind the turning piece, and the capstone poster exported from `CapstonePoster_MichaelFischbach.pptx` (PowerPoint COM, 4x slide size, see the wave row for why posters are prepped at 2600px/q88). Capstone drawing still has a mint-green slide background baked in. The poster's 3-axis HAAS is correct (confirmed 2026-08-01); the site, the resume PDF and both dictionaries were corrected from 4-axis to match. |
| Chameleon Ramps | `ramps/` | 11 product photos. `p4` (Beachside Bank on wet rock) and `p9` (quarter pipe against foliage) are the strongest. |
| Wave energy converter | `wave/` | inside / base views, the cutaway, and the capstone poster rendered from `wec-report.pdf` at 200dpi. The poster hangs full width at the foot of the room and must stay readable, so it is the one image prepped at 2600px / q88. |
| SMC execution system | `smc-bot/` | Poster DRAWN by `scripts/make-bot-poster.mjs` (SVG -> PNG, both languages, ~270 KB each as AVIF): the only poster on the site that is not a scan, so it is the only one that exists in German too, switched by a tab in the room. |
| SMC execution system (capture) | `smc-bot/` | Jarvis operator display, captured from the live dashboard over Tailscale by `scripts/shoot-jarvis.mjs`. **Account figures are never published** — see the rule below. |
| Campus Native | `campus-native/` | The live site at <https://www.campusnative.com>, captured by `scripts/shoot-campus.mjs`. The logo it replaced showed the brand, not the software the label calls live. |
| Water distribution system | `nicaragua/` | Gravity-fed network, tank siting on the site survey. |

Deliberately **not** on the wall: the Net-Zero shipping container (removed at
Michael's request, 2026-07-29), Doorknob-Inator and the noodle bridge (the last
two too slight as works). The noodle bridge lives in the awards room instead.

**The execution system's dashboard is a live real-money display, so no capture
of it may publish account state** — realized/unrealized P&L, cash balance,
per-analyst win rates, the account ID. Shoot the architecture instead (masthead,
link status, position table, analyst grid), and never retouch a figure into a
better one: an edited P&L on a portfolio is a fabricated financial record, which
is a firing-and-rescinded-offer problem rather than a design choice. The
verifiable claims (1553 tests, options live, worst-case parameter selection over
two disjoint windows) are what the label carries.

The putter room carries a **rotating 3D piece** built from the capstone's own
STL. `scripts/prep-mesh.mjs` turns the 427 KB binary STL into a quantised
uint16 mesh (200 KB base64) that the bundler inlines as code; the scene is a
z-buffered software rasteriser on a 2D canvas, NOT WebGL, so there is no shader
pipeline, no context-loss path and nothing to load. A painter's-algorithm sort
was tried first and cannot work here: the scooping cavity's triangles genuinely
interleave in depth, so only a per-pixel test resolves them.

## Facts

Sources disagree; these are current. The resume is stale on several points.

- Cal Poly SLO, Mechanical Engineering, Honors. GPA 3.78, Dean's List ×3.
- CNC putter: 3-axis HAAS, 6061, $15.78 modelled unit cost vs $50–150 retail,
  1 of 8 finalists from 40+, presented at Capstone Night to 200+ alumni and
  hundreds of students (Michael's figure, 2026-07-31; supersedes the earlier
  "300+").
- Wave energy converter: 1st place, highest measured output of three teams.
  **15 V per motor at 1:12 scale, 360 V scaled** (from the capstone poster,
  `assets-src/wave/wec-report.pdf`). A five-person team, so the room says so.
- Chameleon Ramps: since 2019, 40+ products, **1358 orders fulfilled**, **$50k revenue** (resume says $25k,
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
node scripts/make-icons.mjs           # rebuild favicons + og.png
node scripts/make-portfolio-pdf.mjs [--lang=de]  # portfolio as an uploadable PDF
node scripts/make-cv-de.mjs           # the German CV
node scripts/make-cv-en.mjs [--only=us|intl|hwa]  # the three English resumes
node scripts/make-cv-onepage.mjs [--lang=intl]   # the one-page resume
node scripts/make-anschreiben.mjs [--lang=en]   # the cover letter, DE or EN
node scripts/shoot-jarvis.mjs         # re-shoot the bot dashboard (needs Tailscale)
node scripts/shoot-campus.mjs         # re-shoot campusnative.com
```

## Deploy

GitHub Pages via `.github/workflows/deploy.yml` on push to `main`. CI runs
`tsc --noEmit` (catches a missing German key), builds, and asserts the shell
stayed under 100 KB with a `dist/assets/` beside it. `base: "./"` in
`vite.config.ts` is relative, so it works on a project page, a user page, or any
static host unchanged.

Custom domain: **michaelfischbach.dev**. `.dev` is on the HSTS preload list, so
HTTPS is mandatory at browser level and there is no plain-HTTP fallback: the
certificate must be provisioned before the site loads at all.
