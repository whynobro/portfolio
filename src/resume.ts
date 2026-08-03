/**
 * The resume button's href.
 *
 * The PDFs are IMPORTED rather than written into the markup as paths so the
 * bundler content-hashes them: the filename then changes whenever the document
 * does, which is what lets it be cached hard without serving a stale resume.
 *
 * `?url` gives the resolved asset URL (a hashed path in the build, a
 * dev-server path under `npm run dev`) instead of trying to parse the PDF as a
 * module. Both sit above the 4 KB inline threshold, so they emit as their own
 * files and download as real PDFs rather than data: URIs.
 *
 * There are two documents, not one document translated. `resume.pdf` is the
 * American resume; `resume-de.pdf` is the Lebenslauf built by
 * `scripts/make-cv-de.mjs`, which is its own genre (reverse-chronological, a
 * Kurzprofil instead of an objective, nationality and work-permit status
 * stated plainly). A German reader gets the German one, so the button follows
 * the site's language rather than offering both and making them choose.
 *
 * English also follows the BUILD. `resume.pdf` is the HWA application resume:
 * it names the Praktikum, Affalterbach and Feb/March 2027, which is right for
 * the site that application links to and wrong for a general one. The general
 * build serves the US resume instead. German is unaffected: the Lebenslauf
 * names no employer.
 *
 * The English PDF is imported through the `@resume-en` alias, which
 * `vite.config.ts` points at `resume.pdf` or `resume-general.pdf` by mode. A
 * ternary over two imports would not do: `?url` emits an asset for every import
 * it sees, so the dead branch would still copy the HWA resume into the general
 * build, where it would be a live URL nobody intended to publish.
 */
import { getLang } from "./i18n";
import resumeEnUrl from "@resume-en?url";
import resumeDeUrl from "./assets/docs/resume-de.pdf?url";

/** The filename the reader ends up with in their downloads folder. */
const DOCS = {
  en: { url: resumeEnUrl, file: "Michael-Fischbach-CV.pdf" },
  de: { url: resumeDeUrl, file: "Michael-Fischbach-Lebenslauf.pdf" },
} as const;

function apply(): void {
  const doc = DOCS[getLang()];
  for (const link of document.querySelectorAll<HTMLAnchorElement>("a[data-resume]")) {
    link.href = doc.url;
    link.download = doc.file;
  }
}

export function initResume(): void {
  apply();
  // Re-point on a language switch; the label itself is swapped by `data-i18n`.
  document.addEventListener("i18n:change", apply);
}
