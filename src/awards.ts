import { t } from "./i18n";
import type { TranslationKey } from "./i18n/en";

/**
 * The awards room, reached only from the badge in the header.
 *
 * Rendered from data rather than written into the markup so the list stays
 * ordered by date and every string routes through the dictionary. Two entries
 * (the noodle bridge and the Institute of Engineering) are here rather than on
 * the gallery wall; they are real achievements but too slight to hang as works.
 */

type Award = {
  titleKey: TranslationKey;
  issuerKey: TranslationKey;
  date: string;
  bodyKey: TranslationKey;
  /** Measured results get the same emphasis they receive on a work's label. */
  figure?: string;
};

const AWARDS: Award[] = [
  {
    titleKey: "award.honors.title",
    issuerKey: "award.honors.issuer",
    date: "2026",
    bodyKey: "award.honors.body",
  },
  {
    titleKey: "award.presidents.title",
    issuerKey: "award.presidents.issuer",
    date: "2026",
    bodyKey: "award.presidents.body",
  },
  {
    titleKey: "award.deans.title",
    issuerKey: "award.deans.issuer",
    date: "2025–26",
    bodyKey: "award.deans.body",
    figure: "3 × 3.50+",
  },
  {
    titleKey: "award.bridge.title",
    issuerKey: "award.bridge.issuer",
    date: "2025",
    bodyKey: "award.bridge.body",
    figure: "+38.5%",
  },
  {
    titleKey: "award.capstone.title",
    issuerKey: "award.capstone.issuer",
    date: "2025",
    bodyKey: "award.capstone.body",
    figure: "1 of 8",
  },
  {
    titleKey: "award.wave.title",
    issuerKey: "award.wave.issuer",
    date: "2023",
    bodyKey: "award.wave.body",
    figure: "1st",
  },
  {
    titleKey: "award.eagle.title",
    issuerKey: "award.eagle.issuer",
    date: "2025",
    bodyKey: "award.eagle.body",
  },
  {
    titleKey: "award.ioe.title",
    issuerKey: "award.ioe.issuer",
    date: "2025",
    bodyKey: "award.ioe.body",
  },
];

function render(): void {
  const host = document.getElementById("awards-list");
  if (!host) return;

  host.replaceChildren(
    ...AWARDS.map((a) => {
      const row = document.createElement("article");
      row.className = "award";

      const fig = document.createElement("div");
      fig.className = "award__figure mono";
      fig.textContent = a.figure ?? "";

      const main = document.createElement("div");

      const h = document.createElement("h2");
      h.className = "award__title";
      h.textContent = t(a.titleKey);

      const meta = document.createElement("p");
      meta.className = "award__meta";
      meta.textContent = `${t(a.issuerKey)} · ${a.date}`;

      const body = document.createElement("p");
      body.className = "award__body";
      body.textContent = t(a.bodyKey);

      main.append(h, meta, body);
      row.append(fig, main);
      return row;
    }),
  );
}

export function initAwards(): void {
  render();
  // Re-render on language change: the list is built from strings, not markup,
  // so applyLang's DOM sweep would not otherwise reach it.
  document.addEventListener("i18n:change", render);
}
