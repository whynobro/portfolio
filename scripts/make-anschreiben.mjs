/**
 * Renders the German cover letter (Anschreiben) for the HWA AG application.
 *
 *   node scripts/make-anschreiben.mjs
 *
 * Writes `Michael-Fischbach-Anschreiben.pdf` to the repo root (gitignored).
 *
 * German cover-letter conventions this follows, which differ from a US one:
 *   - DIN 5008 layout: sender block, recipient block, date right-aligned,
 *     subject line in bold WITHOUT the word "Betreff", then "Sehr geehrte...".
 *   - ONE page. A two-page Anschreiben reads as not knowing the form.
 *   - "Mit freundlichen Grüßen", never a US-style "Sincerely".
 *   - The subject line names the exact post and the start date, because these
 *     are sorted by post before anyone reads the prose.
 *
 * Register per docs/german.md: short declarative sentences. Long subordinate
 * clauses are exactly where non-native German gives itself away, so the letter
 * stays terse on purpose, which also suits an engineering reader.
 *
 * Every claim here is carried by the CV and the portfolio: the single setup,
 * the 15,78 $ unit cost, the 1. Platz, the 1553 tests, the 40+ products. The
 * letter argues from them rather than restating the CV.
 */
import { chromium } from "playwright";

const OUT = "Michael-Fischbach-Anschreiben.pdf";

const html = `<!doctype html><meta charset="utf-8">
<style>
  /* One page is not a preference here: a two-page Anschreiben reads as not
   * knowing the form. The margins and leading are set so the whole letter
   * lands on a single sheet with room to breathe. */
  @page { size: A4; margin: 16mm 20mm 14mm }
  * { box-sizing: border-box }
  body {
    margin: 0; font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 9.8pt; line-height: 1.42; color: #1a1a1a;
  }
  .sender { font-size: 8.6pt; line-height: 1.38; margin: 0 0 9mm; color: #333 }
  .sender b { color: #1a1a1a; font-size: 9.2pt }
  .to { margin: 0 0 7mm; line-height: 1.38; font-size: 9.4pt }
  .date { text-align: right; margin: 0 0 7mm; font-size: 9.2pt }
  .subject { font-weight: 700; margin: 0 0 5.5mm; font-size: 10.2pt; line-height: 1.35 }
  p { margin: 0 0 3.4mm; text-align: justify; hyphens: auto }
  .close { margin: 5mm 0 0 }
  .sig { margin: 6mm 0 0; font-size: 9.8pt }
  .enc { margin: 5.5mm 0 0; font-size: 8.4pt; color: #444 }
  a { color: #1a1a1a }
</style>

<p class="sender">
  <b>Michael Fischbach</b><br>
  Malibu, Kalifornien, USA<br>
  +1 805 703 8250 · mef126906@icloud.com<br>
  michaelfischbach.dev
</p>

<p class="to">
  <!-- Address taken from HWA's own imprint (hwaag.com/en/imprint), not from
       memory: a first draft had it wrong. -->
  HWA AG<br>
  Personalabteilung<br>
  Benzstraße 8<br>
  71563 Affalterbach<br>
  Deutschland
</p>

<p class="date">Malibu, den 1. August 2026</p>

<p class="subject">
  Bewerbung um das Praktikum im Bereich Gesamtfahrzeugentwicklung<br>
  Beginn Februar/März 2027
</p>

<p>Sehr geehrte Damen und Herren,</p>

<p>
  seit sechs Jahren nehme ich Bauteile von der Skizze bis zum fertigen Objekt: konstruieren, fertigen,
  messen und herausfinden, wo das Modell falsch lag. Genau diesen Zyklus führt die HWA AG in der
  Gesamtfahrzeugentwicklung, vom Entwurf über den Prototypenbau bis zur Erprobung auf der Strecke.
  Deshalb bewerbe ich mich um das Praktikum ab Februar/März 2027.
</p>

<p>
  Am deutlichsten zeigt das mein Abschlussprojekt: ein Putterkopf aus dem Vollen, konstruiert für die
  Fertigung in <b>einer einzigen Aufspannung</b>. Diese Randbedingung hat die Geometrie bestimmt, denn jedes
  Merkmal musste ohne Umspannen erreichbar bleiben. Jedes Umspannen kostet einen Arbeitsgang und
  gefährdet den Bezugspunkt. Vor dem Aluminiumteil habe ich die Geometrie an PLA-Prototypen abgesichert
  und die Stückkosten auf 15,78 $ modelliert. Die Arbeit war eine von acht aus über vierzig, die zur
  Abschlusspräsentation ausgewählt wurden.
</p>

<p>
  Konstruieren heißt für mich, die Entscheidung an der Messung zu prüfen. Beim Wellenenergie-Wandler
  belegte unser Fünferteam den <b>1. Platz</b> mit der höchsten gemessenen Leistung von drei Teams; alle
  Bauteile haben wir maßhaltig auf der Bridgeport-Fräsmaschine selbst gefertigt. Dieselbe Haltung prägt
  meine Software: Mein autonomes Ausführungssystem läuft mit 1553 Tests im Produktivbetrieb, und die
  Parameter habe ich nach ihrem <b>ungünstigsten</b> Ergebnis über zwei getrennte Zeiträume gewählt, nicht
  nach ihrem besten.
</p>

<p>
  Verantwortung für ein Produkt kenne ich aus der Praxis. Mein 2019 gegründetes Unternehmen Chameleon
  Ramps hat über 40 Produkte in Serie gebracht; das dafür entwickelte Gießverfahren senkt den
  Materialausschuss um rund 30 %. Termine, Kosten und Ausschuss sind für mich keine abstrakten Größen.
</p>

<p>
  Nach Deutschland zu gehen ist für mich kein Umbruch: Ich bin in einer Familie der US-Luftwaffe
  aufgewachsen und neunmal umgezogen. Ich lerne Deutsch und werde bis zum Praktikumsbeginn deutlich
  weiter sein; als US-Staatsbürger ist ein studienbezogener Aufenthaltstitel möglich. Meine Arbeiten
  sind unter <b>michaelfischbach.dev</b> einsehbar, zwei davon im Browser bedienbar. Über ein Gespräch
  würde ich mich sehr freuen.
</p>

<p class="close">Mit freundlichen Grüßen</p>
<p class="sig">Michael Fischbach</p>

<p class="enc">Anlagen: Lebenslauf, Portfolio</p>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log(`wrote ${OUT}`);
