# Engineering portfolio — Michael Fischbach

An **art-gallery** portfolio: warm off-white walls, works hung in a carved gilt
frame, serif captions. English only, addressed to no particular employer, aimed
at mechanical engineering internships (summer 2027).

Live: <https://michaelfischbach.dev> · repo `whynobro/portfolio` (the github.io
URL still redirects, but the custom domain is the one to quote).

History: until 2026-10 the root was the HWA AG application site, with German
and a `/general/` variant. That era's rules are archived in
`docs/archive/claude-md-hwa-era.md`; read it only for the HWA snapshot.

## Maintaining this file

Line cap: **350**. Over cap, move something OUT to `docs/` in the same commit;
never raise the cap. Operative rules and current config only; narratives and
fix history go in `docs/`.

## Invariants

- **Three URLs, one artifact, and none may break.**
  - `/` is this site, built from `main`.
  - `/hwa/` is the site exactly as submitted with the HWA application, rebuilt
    in CI from the git tag **`hwa-submitted`** (2a65ae9), `noindex`, canonical
    to itself. Never move or delete that tag; never commit its build output.
  - `/general/` is `public/general/index.html`, a redirect to the root that
    keeps the `#/route`. Every non-HWA resume sent before 2026-10 links there,
    so it must keep forwarding. CI asserts all three.
- **The root names no employer.** CI fails if any html/js/css outside
  `dist/hwa/` contains `HWA`, `Affalterbach`, `complete-vehicle` or
  `Lebenslauf` (case-sensitive, text files only: a case-insensitive sweep hits
  bytes inside AVIFs).
- **The shell must stay small; photographs stay OUT of it.** `dist/index.html`
  (~35 KB) plus a content-hashed `dist/assets/`. CI fails past 100 KB. Assets
  live in `src/assets/` and are referenced **relatively** so the bundler hashes
  them; under 4 KB they inline.
- **`public/` holds only files that need a FIXED name**: `CNAME` (Pages drops
  the custom domain without it; no trailing newline), `og.png` (link-preview
  card, named absolutely in `index.html`), and `general/index.html` (the
  redirect). Nothing else joins them.
- **Gilt (`--gilt`) is the accent; `--measured` (oxblood) marks measured
  results and nothing else.** A model prediction or a status is NOT measured:
  the WERC room uses a `Status` row with no `measured` flag. The
  one sanctioned colour exception is the tic-tac-toe board (red/green marks).
- **WERC figures are model predictions until the bench is built and tested.**
  Every place that quotes 1 kW / 87% / 25 W / 78% says "model" or "target";
  the scene's readout carries "MODEL VALUES · NOT TO SCALE". Full scale: 1 kW
  across 100 mm (75–150), 80% required. Bench: 25 W across 25 mm, 70% required.
- **Reduced motion suppresses autonomous motion only.** Every scene paints a
  full static frame via `renderStatic()` and stays interactive on input.
- **Claims on labels must be true and, where testable, tested.** "Unbeatable"
  tic-tac-toe is backed by `npm run verify:ttt` (exhaustive play).
- **Every room must stay reachable on a phone.** `.masthead__inner` and
  `.masthead__nav` both wrap; never fix an overflow by removing a route.
- **The bot's dashboard is a live real-money display**: no capture may publish
  account state (P&L, balances, win rates, account ID), and no figure is ever
  retouched. The test count never appears bare, only with its consequence
  (every fill spends real money). Re-measure before quoting it:
  `python -m pytest tests/ -q` in `C:\Users\micha\smc-trade-bot`.
- **Clearance stays off the web pages.** It is on the PDF resumes only.

## Resumes

- **The site serves two COMMITTED COPIES** via `src/resume.ts` (buttons are
  `a[data-doc="resume"|"cv"]`):
  - `src/assets/docs/resume.pdf` ← `Michael-Fischbach-Resume-1Page.pdf` from
    `node scripts/make-cv-onepage.mjs`, downloads as `Michael-Fischbach-Resume.pdf`;
  - `src/assets/docs/cv.pdf` ← `Michael-Fischbach-CV.pdf` from
    `node scripts/make-cv-en.mjs --only=us`, downloads as `Michael-Fischbach-CV.pdf`.

  Regenerating does NOT update the site until the PDF is copied over.
- **Sources of truth, newest first**: the transcript and one-pager in
  `C:\Users\micha\Documents\Career\Up To Date Files -Michael\`, the master pool
  `C:\Users\micha\Documents\Career\Resumes\Master Resume Michael Fischbach (1).pdf`,
  then `docs/resume-inventory.md` (the superset; SELECT from it, never paste it
  all). Its "Note:" rules are binding (never "Active Secret", never "Haas
  Certified Machinist", never Dean's List beside President's Honors List).
- **Naming**: the one-pager is the RESUME, the two-page long form is the CV.
  `make-cv-en.mjs` renders three CVs from one template (US, Abroad, HWA); only
  US is on the site. `make-cv-onepage.mjs` is a different selection and is
  effectively full: adding a line means cutting one.
- **Type**: Times New Roman 10.5pt is the floor. Never shrink type to fit; cut
  content. **Bold is structure** (entry titles, skill labels, award labels),
  plus the clearance bullet; never figures in running text.
- **Links are real PDF anchors, black and underlined** (never drop the
  underline). LinkedIn shows its full URL (`www.linkedin.com/in/mefisch`). The
  phone is underlined but NOT a link (`.contact .tel`). Chameleon Ramps and
  Campus Native link to their live sites: check both return 200 before
  shipping a resume. Location line is its own centred `.location` block.
- **Portfolio link**: visible text `michaelfischbach.dev`, href from
  `scripts/portfolio-link.mjs` (both constants now point at the root). Verify
  with the `/URI` annotations, not the markup:

  ```sh
  python3 -c "import re,sys; d=open(sys.argv[1],'rb').read(); print(sorted(set(re.findall(rb'/URI\s*\((.*?)\)', d))))" Michael-Fischbach-CV.pdf
  ```

## The frame

The moulding is a photographed carved frame used as a CSS `border-image`.
`scripts/prep-frame.mjs` measures the moulding band from the source's **alpha
channel** and prints the slice value; never guess it.

- **`background` must be `padding-box`**, or white bleeds through the carved
  silhouette's gaps.
- **Shadow must be `filter: drop-shadow`, not `box-shadow`.** Hover animates
  `transform` only.

## Live scenes

`src/scenes/<id>/index.ts`, registered in `registry.ts`, mounted lazily by
`runtime.ts` (`[data-scene]`). `src/lib/raf.ts` caps animating scenes at **4**
(two toys + two live wall frames); `subscribe()` returns false past the cap.
The runtime disposes scenes whose element left the document or whose view is
hidden, and those scrolled far away. It watches each view's `hidden` AND its
children, so a re-rendered room's scene mounts and gets resize events.

- **`dispose()` removes EVERYTHING `mount()` added to the root** (wrapper
  included): every return to a view remounts, and a leftover node stacks.
  Verify with a round trip: the root keeps exactly one child.

- **Putter** (`putter`): the capstone's STL as a quantised mesh
  (`scripts/prep-mesh.mjs`), drawn by a z-buffered software rasteriser on a 2D
  canvas (not WebGL; a painter's sort cannot resolve the scoop cavity). Flat
  Lambert plus a Blinn-Phong highlight for the machined look. Turns on the
  wall tile (decorative: no drag, no tab stop, `pointer-events: none`, since
  the tile is the link) and in the room (drag or arrow keys).
- **WERC** (`werc`): the docking sequence from the report's state machine,
  side view at the lunar South Pole. Wall tile = small teaser; the room shows
  it wide (`wideScene`, 21:9, 16:9 on phones) because the hero frame window is
  only ~250px. Static frame = mid-charge.
- **Wall live frames** are `.frame__scene` over the tile's photograph; the
  photograph stays the no-JS picture and the scene turns opaque only once
  mounted (`[data-ready]`).

## The opening

`src/intro.ts`: a ~22 s montage under a night sky, paced by one `PACE`
constant. Putter (drawing with real dimensions, stock, cut along the REAL
toolpath with the live operation and tool captioned), WERC docking, Ramps
(photo mosaic, then $39,600 headline + product + chameleonramps.com capture),
wave rack-and-pinion, bot alert-to-order (labelled illustrative), then the
finale wall and the name handing off to the page heading (baseline-aligned).
Hand-off mock-ups: dawn (default) or night (`?hero=night`, night entrance in
chrome.css); undecided. The head script gates it: landing route only, once
per session, never with `?shots=1` or reduced motion; a 26 s fallback
uncovers the page if the module never runs (raise it if the montage grows).
Any click, key, scroll or Skip ends it.

The toolpath is `src/scenes/putter/toolpath.ts`, generated by
`node scripts/prep-toolpath.mjs` from `assets-src/putter/putter-op1.nc`
(Haas TM-1P; G-code X along the length, Y mirrored, Z height; chosen by
overlaying the finishing pass on the STL). Previews:
`node scripts/make-intro-video.mjs [out.mp4] [w] [h]` (`URL=...?hero=night`).

## The two playable pieces

Unframed and uncaptioned under the portrait: toys, not works. Their names live
only as `aria-label`s.

- **The box is fixed** (`.playable`), never a fraction of the column.
- **Ring toss sizes from the CANVAS, not the root**, and its forces scale with
  tank height. Pump and jets are drawn on the toy; the `.ring__pump-a11y`
  buttons exist for keyboard and screen readers. `__ring.state()` exposes the
  live simulation for verification.

## The screenshot loop

Design changes are verified by reading rendered PNGs back, never by assuming.

```sh
npm run dev                              # must already be running
npm run shots                            # every route
npm run shots -- --only=landing
npm run shots -- --motion=reduce         # prove reduced-motion
```

Output: `screenshots/local/<name>.en.<viewport>.png` (gitignored). **No visible
change is done until desktop and mobile (390px) have been read back.**
`?shots=1` force-mounts every scene, paints a static frame and sets
`data-ready="1"` only after sizing. `fullPage` capture photographs lazy images
below the fold as EMPTY frames even though they load in a browser; verify in
the DOM (or crop one element with `node scripts/crop-shot.mjs <url> <out> <selector>`)
before "fixing" CSS.

## Asking Michael for assets

Michael sources photographs and references on request: ask instead of working
around a poor source. State filename and folder, minimum resolution, format,
and how to verify it (real alpha: checkerboard squares scale with zoom).

`assets-src/` is gitignored, per project: `putter/ ramps/ wave/ nicaragua/
smc-bot/ campus-native/ werc/ doorknob/ brand/ misc/ docs/`, `inbox/` for
unsorted. `docs/` holds Michael's own bio and project text; read it before
writing copy. Coursework CAD lives in
`C:\Users\micha\OneDrive - Cal Poly\School\` (ME 2248 SolidWorks parts).

## Structure

Single page, hash-routed (`#/work`, `#/about`, `#/awards`, `#/contact`,
`#/work/<slug>`). Hash rather than History API: no server rewrite needed.

A room is one container (`#view-project`) re-rendered per slug from data in
`src/projects.ts`; `initProjects()` runs BEFORE `initRouter()`. Unknown slugs
fall through to the collection. The wall carries every work's title, text and
figures inline, so the no-JS document is still a complete portfolio. Rooms can
set `galleryLarge` (two-up, click to open full size, for report drawings) and
`wideScene`.

```text
index.html                     the only page; one [data-view] per room; static copy
src/main.ts                    boot: awards -> resume -> projects -> router -> scenes
src/i18n/en.ts                 copy table for everything BUILT from strings (t())
src/router.ts                  view switching, focus management, titles
src/awards.ts                  awards room, ranked by weight
src/projects.ts                the six project rooms, rendered from data
src/resume.ts                  points the Resume and CV buttons at the PDFs
src/scenes/{tictactoe,ringtoss,putter,werc}/   SceneModule implementations
src/styles/                    tokens, base, layout (incl. About .cv), frame, chrome, games, case
public/general/index.html      redirect for old /general/ links
scripts/prep-images.mjs        manifest-driven raster -> AVIF + JPEG fallback
scripts/prep-frame.mjs         frame PNG -> border-image + measured slice
scripts/prep-mesh.mjs          putter STL -> quantised inline mesh
scripts/make-cv-onepage.mjs    the one-page resume (site's Resume button)
scripts/make-cv-en.mjs         the three CVs (US is the site's CV button)
scripts/make-master.mjs        the master content pool PDF (never sent)
scripts/portfolio-link.mjs     the href every document's portfolio link uses
scripts/make-bot-poster.mjs    draws the bot poster from real source
scripts/verify-tictactoe.mjs   exhaustive proof the engine cannot lose
scripts/make-icons.mjs         favicon set + link-preview card
docs/resume-inventory.md       every resume-able fact; SELECT from it
docs/archive/                  HWA-era CLAUDE.md and German terminology
```

HWA-era generators (`make-cv-de.mjs`, `make-anschreiben.mjs`, the Apple and
VibeClub ones) still run offline; none of their output is on the site.

**HEIC:** only the WIC path in `scripts/heic-to-jpg.ps1` decodes Michael's
iPhone photos (sharp's libheif and System.Drawing both fail).

## Works on the wall

Six, in this order: two Featured, then four under "Projects". Sources in `assets-src/<folder>/`.

| Work | Slug | Notes |
| --- | --- | --- |
| Lunar Rover Wireless Charger | `werc` | WERC 2027 Task 4, NASA Artemis. Michael is team lead (12 people) and on Controls. Figures from the technical report (Oct 15 draft) in `assets-src/werc/`; gallery = its figures. All MODEL values. |
| CNC-milled putter | `cnc` | 3-axis Haas, two ops, 12 PLA prototypes, $18.56 vs $250 retail. Live STL on the wall and in the room. |
| Chameleon Ramps | `ramps` | 2019–2026, 40+ products, $39,600 / 627 orders, ~40% waste cut, 15 countries. |
| Wave energy converter | `wave` | Team lead of five, 1st of 5 teams, 120 V at 1:12 (15 V/motor), 360 V projected. Poster prepped at 2600px/q88 to stay readable. |
| SMC Trading Bot | `bot` | Options live on funded Webull, futures on Tradovate demo. See the money rule above. |
| Campus Native | `campus` | Live at campusnative.com; Michael founded it and led a 4-person intern team. |

Deliberately **not** on the wall: the Net-Zero shipping container (removed at
Michael's request, 2026-07-29), the Nicaragua water system and the
Doorknob-Inator (removed 2026-10-25; their images and `prep-images` entries
remain, and both stay on the PDF CVs), and the noodle bridge (awards room only).

## Facts

Current as of 2026-10-21; the master resume and transcript win any conflict.

- Cal Poly SLO, B.S. Mechanical Engineering, Honors Program, Sep 2025 –
  expected May 2028. **GPA 3.79** (transcript: 3.786 Cal Poly, 3.677
  cumulative with transfer). Dean's List F/W/S 2025–26, so President's Honors
  List. Never write 3.80 or 3.78.
- Coursework completed: subtractive manufacturing I/II, materials joining,
  materials engineering + lab, calculus I–III, physics I–III. In progress
  (Fall 2026): statics (ENGR 2211), solid modelling (SolidWorks), applied
  programming. Dynamics is Spring 2027: never list it as taken.
- All Domain Integration: Mechanical Engineering Intern, 2025–present, remote,
  SETA support to Space Force and Air Force mission systems engineers.
- Clearance: Top Secret submitted / in process, SCI eligible. Nothing granted.
- Putter capstone: 1 of 8 finalists from 40+, Capstone Night to 200+ alumni.
- Noodle bridge: 1st place, 38.5% margin. Eagle Scout 2025.
- No CSWA: never taken (confirmed 2026-10-21); keep it off every document.
- US citizen.

## Commands

```sh
npm run dev          # vite dev server on :5173
npm run build        # tsc --noEmit && vite build -> dist/
npm run shots        # screenshot loop (dev server must be running)
npm run verify:ttt   # prove the tic-tac-toe engine never loses
node scripts/prep-images.mjs [name]   # whole manifest, or one entry
node scripts/make-cv-onepage.mjs      # one-page resume -> copy to src/assets/docs/resume.pdf
node scripts/make-cv-en.mjs --only=us # CV -> copy to src/assets/docs/cv.pdf
node scripts/make-master.mjs          # master content pool
node scripts/shoot-jarvis.mjs         # re-shoot the bot dashboard (needs Tailscale)
node scripts/shoot-campus.mjs         # re-shoot campusnative.com
node scripts/make-werc-video.mjs [out.mp4]  # WERC animation as a shareable MP4 (dev server running)
```

## Deploy

GitHub Pages via `.github/workflows/deploy.yml` on push to `main`: typecheck,
build the root, check out `hwa-submitted` into `hwa-src/` and build it into
`dist/hwa/`, then assert shell sizes, the no-employer rule, the `/general/`
redirect, `/hwa/` noindex, and `CNAME` at the root only. `base: "./"` is
relative, which is why the nested build works unchanged.

`.dev` is on the HSTS preload list: HTTPS is mandatory and the certificate must
exist before the site loads at all.
