/**
 * The resume button's href.
 *
 * The PDF is IMPORTED rather than written into the markup as a path, so the
 * bundler inlines it as a data: URI and `dist/index.html` stays the single file
 * that opens from `file://`. A plain `href="./assets/docs/resume.pdf"` would
 * emit a second file and break that invariant (and CI, which asserts `dist`
 * holds exactly one file).
 *
 * `?url` gives the resolved asset URL — a data: URI in the build, a dev-server
 * path under `npm run dev` — instead of trying to parse the PDF as a module.
 */
import resumeUrl from "./assets/docs/resume.pdf?url";

export function initResume(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>("a[data-resume]");
  for (const link of links) link.href = resumeUrl;
}
