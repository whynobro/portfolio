/**
 * The resume button's href.
 *
 * The PDF is IMPORTED rather than written into the markup as a path so the
 * bundler content-hashes it: the filename then changes whenever the document
 * does, which is what lets it be cached hard without serving a stale resume.
 *
 * `?url` gives the resolved asset URL (a hashed path in the build, a
 * dev-server path under `npm run dev`) instead of trying to parse the PDF as a
 * module. At 6.6 KB it sits above the 4 KB inline threshold, so it emits as
 * its own file and downloads as a real PDF rather than a data: URI.
 */
import resumeUrl from "./assets/docs/resume.pdf?url";

export function initResume(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>("a[data-resume]");
  for (const link of links) link.href = resumeUrl;
}
