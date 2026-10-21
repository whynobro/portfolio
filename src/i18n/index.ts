import { en, type TranslationKey } from "./en";

/**
 * Look up a string in the copy table.
 *
 * The site is English only. It used to ship in German as well, with a toggle
 * and a dictionary per language; the German version was retired with the
 * 2026-10 makeover. What survives is the one table in `en.ts`, because the
 * rooms, the awards list and the scenes are BUILT from strings rather than
 * written into the markup, and keeping their copy in one place still beats
 * scattering it through the renderers.
 *
 * The static shell (`index.html`) carries its own text and is not swept: it is
 * the no-JS document, and there is nothing left to swap it for.
 */
export function t(key: TranslationKey): string {
  return en[key];
}
