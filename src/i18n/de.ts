import type { Dict } from "./en";

/**
 * German strings.
 *
 * `satisfies Dict` makes a missing or misspelled key a COMPILE ERROR, so
 * `npm run build` fails rather than silently shipping an English fallback.
 * That check is the main defense against bilingual rot.
 *
 * Terminology rules followed here:
 *  - Established engineering terms, not literal translations:
 *    Konstruktion (design-engineering) — never "Design", which means styling.
 *    Fertigung (manufacturing), Toleranz, Serienfertigung.
 *  - Short, declarative sentences. Long subordinate clauses are where
 *    non-native German goes wrong, and a terse spec-sheet register suits
 *    this site anyway.
 *  - Established anglicisms stay untranslated (CNC, CAD, Python, Live) —
 *    German engineers use them.
 */
export const de = {
  // Barrierefreiheit
  "a11y.skip": "Zum Inhalt springen",
  "a11y.langGroup": "Sprache",
  "a11y.langEn": "Switch to English",
  "a11y.langDe": "Auf Deutsch umschalten",

  // Navigation
  "nav.work": "Projekte",
  "nav.about": "Profil",
  "nav.contact": "Kontakt",

  // Einstieg
  "hero.eyebrow": "Maschinenbau",
  "hero.line1": "Ich konstruiere Bauteile und baue die Systeme,",
  "hero.line2": "die sie prüfen.",
  "hero.school": "Cal Poly San Luis Obispo",
  "hero.honors": "Honors-Programm",
  "hero.visa": "US-Staatsbürger · Praktikumsvisum EU möglich",

  "cta.work": "Projekte ansehen",
  "cta.contact": "Kontakt",

  // Kennzahlen
  "strip.tolerance": "mm Toleranz eingehalten",
  "strip.cost": "Stückkosten gesenkt",
  "strip.products": "Produkte in Serie",
  "strip.tests": "Tests laufen im Produktivbetrieb",

  // Projekte
  "work.label": "Ausgewählte Projekte",

  "proj.putter.title": "CNC-gefräster Putter aus Aluminium",
  "proj.wave.title": "Wellenenergie-Wandler",
  "proj.wave.spec1": "Bridgeport-Fräse",
  "proj.wave.spec2": "Zahnstange & Ritzel",
  "proj.wave.spec3": "1. Platz",
  "proj.ramps.title": "Chameleon Ramps",
  "proj.ramps.spec1": "Seit 2019",
  "proj.ramps.spec2": "40+ Produkte",
  "proj.ramps.spec3": "50.000 $ Umsatz",
  "proj.bot.title": "Autonomes Ausführungssystem",
  // "Optionen" and "Futures" are the standard German trading terms; "Futures"
  // stays untranslated because German finance uses the English word.
  "proj.bot.spec3": "Optionen live · Futures Demo",

  "footer.location": "Malibu, Kalifornien",
} satisfies Dict;
