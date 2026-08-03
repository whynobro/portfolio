/**
 * The portfolio link, shared by every document generator.
 *
 * Every resume and cover letter DISPLAYS the same short `michaelfischbach.dev`,
 * because that is the address worth advertising and a subpath in print reads as
 * clutter. What differs is where the link goes.
 *
 * The site root is the HWA application's landing page: its entrance names the
 * Praktikum im Bereich Gesamtfahrzeugentwicklung and Affalterbach. Sending a
 * reader who is not HWA there hands them a page addressed to somebody else,
 * which reads like a resume sent to the wrong employer. So the documents that
 * name HWA (the HWA resume, the Lebenslauf, the Anschreiben) target the root,
 * and every other document targets `/general/`, the employer-neutral build of
 * the same portfolio.
 *
 * Same visible text, different href. The `/general/` build is described by the
 * variant invariant in CLAUDE.md; it exists precisely so this link has somewhere
 * neutral to point.
 *
 * Kept in its own module rather than in make-cv-en.mjs because that file builds
 * three PDFs on import: anything importing a constant from it would generate
 * resumes as a side effect.
 */

/** What the reader sees. The same on every document, deliberately. */
export const PORTFOLIO_TEXT = "michaelfischbach.dev";

/** For documents that name HWA. The entrance there is addressed to them. */
export const PORTFOLIO_HWA = "https://michaelfischbach.dev";

/** For everything else. The same portfolio, addressed to nobody in particular. */
export const PORTFOLIO_GENERAL = "https://michaelfischbach.dev/general/";
