import type { TranslationKey } from "./en";

/**
 * The strings that change in the `general` build.
 *
 * Only the entrance's second bio paragraph differs. In the HWA build it names
 * the posting ("the complete-vehicle development internship at HWA AG") and
 * ends on Affalterbach; addressed to no particular employer that sentence has
 * to go, but the paragraph's job stays: what kind of work he wants, and the
 * moving story that makes relocation credible.
 *
 * Everything else in the dictionaries is already employer-neutral, including
 * the work-permit line and the contact lede, so nothing else is patched here.
 *
 * This table drives BOTH substitutions and is the only place the general copy
 * lives: `vite.config.ts` reads it at build time to rewrite the matching
 * `data-i18n` elements in the HTML shell, and `variant-dict.ts` applies it to
 * the dictionaries. Keeping one source for both is what stops the no-JS
 * document and the hydrated one from disagreeing.
 *
 * Typed against real `TranslationKey`s, so a key renamed in en.ts fails
 * `tsc --noEmit` here rather than silently ceasing to apply.
 */
export type Overrides = Partial<Record<TranslationKey, string>>;

export const generalOverrides: { en: Overrides; de: Overrides } = {
  en: {
    "home.bio2":
      "The work I like best is where a drawing becomes a part and the measurement gets the last word, on the whole machine rather than one component of it. I grew up in an Air Force family and moved nine times across seven states, so relocating for the right work is normal rather than daunting.",
  },
  de: {
    "home.bio2":
      "Am liebsten arbeite ich an der Stelle, an der eine Zeichnung zum Bauteil wird und die Messung das letzte Wort hat: an der gesamten Maschine, nicht nur an einem Bauteil davon. Ich bin in einer Air-Force-Familie aufgewachsen und neunmal über sieben Bundesstaaten umgezogen. Ein Umzug für die richtige Stelle ist für mich normal.",
  },
};
