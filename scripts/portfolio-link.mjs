/**
 * The portfolio link, shared by every document generator.
 *
 * Every resume and cover letter DISPLAYS the same short `michaelfischbach.dev`,
 * because that is the address worth advertising and a subpath in print reads as
 * clutter.
 *
 * Both targets are now the site root. The `/general/` build is being retired
 * and the root becomes the general, employer-neutral portfolio, so every
 * document links there. The two names are kept so generators that import
 * either one keep working, and so a future per-employer target has a slot.
 *
 * Kept in its own module rather than in make-cv-en.mjs because that file builds
 * three PDFs on import: anything importing a constant from it would generate
 * resumes as a side effect.
 */

/** What the reader sees. The same on every document, deliberately. */
export const PORTFOLIO_TEXT = "michaelfischbach.dev";

/** For documents that name HWA. Same target as the general link. */
export const PORTFOLIO_HWA = "https://michaelfischbach.dev";

/** For everything else: the site root, the general portfolio. */
export const PORTFOLIO_GENERAL = "https://michaelfischbach.dev";
