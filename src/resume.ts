/**
 * The two document buttons: the one-page resume and the two-page CV.
 *
 * The PDFs are IMPORTED rather than written into the markup as paths so the
 * bundler content-hashes them: the filename then changes whenever the document
 * does, which is what lets it be cached hard without serving a stale resume.
 * `?url` gives the resolved asset URL instead of parsing the PDF as a module.
 *
 * Both are COMMITTED COPIES of what `scripts/make-cv-onepage.mjs` and
 * `scripts/make-cv-en.mjs --only=us` generate: regenerating a resume does not
 * change the site until the new PDF is copied over the file here.
 *
 * The `download` filename is set here as well as the href, because it is what
 * the reader finds in their downloads folder: "Resume" is the one-pager and
 * "CV" the long form, the same names the generators use.
 */
import resumeUrl from "./assets/docs/resume.pdf?url";
import cvUrl from "./assets/docs/cv.pdf?url";

const DOCS = {
  resume: { url: resumeUrl, file: "Michael-Fischbach-Resume.pdf" },
  cv: { url: cvUrl, file: "Michael-Fischbach-CV.pdf" },
} as const;

type DocKind = keyof typeof DOCS;

export function initResume(): void {
  for (const link of document.querySelectorAll<HTMLAnchorElement>("a[data-doc]")) {
    const doc = DOCS[link.dataset["doc"] as DocKind];
    if (!doc) continue;
    link.href = doc.url;
    link.download = doc.file;
  }
}
