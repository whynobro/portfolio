import { en, type Dict, type TranslationKey } from "./en";
import { de } from "./de";

export type Lang = "en" | "de";

const DICTS: Record<Lang, Dict> = { en, de };
const STORAGE_KEY = "lang";

let current: Lang = "en";

/** Translate a key. Falls back to the English string, never to a raw key. */
export function t(key: TranslationKey): string {
  return DICTS[current][key] ?? en[key];
}

export function getLang(): Lang {
  return current;
}

function isLang(v: unknown): v is Lang {
  return v === "en" || v === "de";
}

/**
 * Resolve the language the same way the inline <head> script does. Kept in sync
 * deliberately: the head script must run before paint to avoid an EN→DE flash,
 * and this re-derives the same answer once modules load.
 */
function detect(): Lang {
  const q = new URLSearchParams(location.search).get(STORAGE_KEY);
  if (isLang(q)) return q;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* private mode */
  }

  const nav = (navigator.languages ?? [navigator.language]).join(",");
  return /\bde\b|de-/i.test(nav) ? "de" : "en";
}

/**
 * Swap every translated string in the document.
 *
 * Text swaps instantly and without transition, cross-fading a language change
 * makes layout shift more visible, not less.
 */
export function applyLang(lang: Lang): void {
  current = lang;

  const root = document.documentElement;
  root.lang = lang;
  root.dataset["lang"] = lang;

  for (const el of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
    const key = el.dataset["i18n"] as TranslationKey | undefined;
    if (key && key in en) el.textContent = t(key);
  }

  // data-i18n-attr="aria-label:a11y.langGroup, title:some.key"
  for (const el of document.querySelectorAll<HTMLElement>("[data-i18n-attr]")) {
    const spec = el.dataset["i18nAttr"];
    if (!spec) continue;
    for (const pair of spec.split(",")) {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      if (attr && key && key in en) el.setAttribute(attr, t(key as TranslationKey));
    }
  }

  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-lang-btn]")) {
    btn.setAttribute("aria-pressed", String(btn.dataset["langBtn"] === lang));
  }

  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode */
  }

  // Scenes redraw their own labels rather than remounting.
  document.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang } }));
}

export function initI18n(): void {
  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-lang-btn]")) {
    btn.addEventListener("click", () => {
      const next = btn.dataset["langBtn"];
      if (isLang(next) && next !== current) applyLang(next);
    });
  }
  applyLang(detect());
}
