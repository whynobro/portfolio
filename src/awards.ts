import { t } from "./i18n";
import type { TranslationKey } from "./i18n/en";

/**
 * The awards room, reached only from the badge in the header.
 *
 * Rendered from data rather than written into the markup so the list stays
 * ordered and every string routes through the copy table. The noodle bridge is
 * here rather than on the gallery wall: a real achievement, but too slight to
 * hang as a work.
 */

type Award = {
  titleKey: TranslationKey;
  issuerKey: TranslationKey;
  date: string;
  bodyKey: TranslationKey;
  /** Measured results get the same emphasis they receive on a work's label. */
  figure?: string;
};

// Ranked by weight, not date, per docs/resume-inventory.md. The Dean's List
// is not listed beside the President's Honors List, which already contains it.
const AWARDS: Award[] = [
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
    figure: "1st of 5",
  },
  {
    titleKey: "award.presidents.title",
    issuerKey: "award.presidents.issuer",
    date: "2026",
    bodyKey: "award.presidents.body",
  },
  {
    titleKey: "award.honors.title",
    issuerKey: "award.honors.issuer",
    date: "2026",
    bodyKey: "award.honors.body",
  },
  {
    titleKey: "award.bridge.title",
    issuerKey: "award.bridge.issuer",
    date: "2025",
    bodyKey: "award.bridge.body",
    figure: "+38.5%",
  },
  {
    titleKey: "award.eagle.title",
    issuerKey: "award.eagle.issuer",
    date: "2025",
    bodyKey: "award.eagle.body",
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
}
