/**
 * English strings — the source of truth.
 *
 * Flat dotted keys, not nested objects: nesting breaks the exhaustiveness check
 * in de.ts into per-branch checks and makes keys harder to grep.
 *
 * Every string here also appears inline in index.html as the default, so the
 * page is a complete, readable English document even if JavaScript never runs.
 */
export const en = {
  // Accessibility
  "a11y.skip": "Skip to content",
  "a11y.langGroup": "Language",
  "a11y.langEn": "Switch to English",
  "a11y.langDe": "Auf Deutsch umschalten",

  // Navigation
  "nav.work": "Work",
  "nav.about": "About",
  "nav.contact": "Contact",

  // Hero
  "hero.eyebrow": "Mechanical Engineering",
  "hero.line1": "I design parts and build the systems",
  "hero.line2": "that test them.",
  "hero.school": "Cal Poly San Luis Obispo",
  "hero.honors": "Honors Program",
  "hero.visa": "US citizen · EU internship visa eligible",

  "cta.work": "View work",
  "cta.contact": "Contact",

  // Measured-figures strip
  "strip.tolerance": "mm tolerance held",
  "strip.cost": "unit cost reduction",
  "strip.products": "products to market",
  "strip.tests": "tests passing in production",

  // Work
  "work.label": "Selected work",

  "proj.putter.title": "CNC-Milled Aluminium Putter",
  "proj.wave.title": "Wave Energy Converter",
  "proj.wave.spec1": "Bridgeport mill",
  "proj.wave.spec2": "Rack & pinion",
  "proj.wave.spec3": "1st place",
  "proj.ramps.title": "Chameleon Ramps",
  "proj.ramps.spec1": "Since 2019",
  "proj.ramps.spec2": "40+ products",
  "proj.ramps.spec3": "$30k revenue",
  "proj.bot.title": "Autonomous Execution System",
  "proj.bot.spec3": "Options live · futures demo",

  "footer.location": "Malibu, California",
} as const;

export type TranslationKey = keyof typeof en;
/** Every key must exist in every language. Enforced by `satisfies` in de.ts. */
export type Dict = Record<TranslationKey, string>;
