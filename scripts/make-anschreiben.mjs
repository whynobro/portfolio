/**
 * Renders the cover letter for the HWA AG application, in both languages.
 *
 *   node scripts/make-anschreiben.mjs             # German (Anschreiben)
 *   node scripts/make-anschreiben.mjs --lang=en   # English (Cover Letter)
 *
 * Writes `Michael-Fischbach-Anschreiben.pdf` / `-CoverLetter.pdf` to the repo
 * root (gitignored).
 *
 * BOTH follow the German DIN 5008 layout, including the English one: the
 * reader is a German employer, the English copy is the accompanying version of
 * the same letter, and switching to a US block format between the two would
 * make the pair look like two unrelated documents. So: sender block, recipient
 * block, right-aligned date, a bold subject line naming the post and the start
 * date without the word "Betreff"/"Re:", then the salutation.
 *
 * ONE page each. A two-page Anschreiben reads as not knowing the form.
 *
 * The English is NOT a looser rewrite: it is the same argument, sentence for
 * sentence, so a reader comparing the two finds the same claims in the same
 * order. What changes is only what must: "Mit freundlichen Grüßen" becomes
 * "Yours sincerely" (British form, for a European reader), and the numbers
 * switch convention, 15,78 $ to $15.78 and "rund 30 %" to "about 30%".
 *
 * German register per docs/german.md: short declarative sentences. Long
 * subordinate clauses are exactly where non-native German gives itself away.
 *
 * Every claim is carried by the CV and the portfolio: the single setup, the
 * unit cost, the 1st place, the 1553 tests, the 40+ products. The letter argues
 * from them rather than restating the CV.
 */
import { chromium } from "playwright";

const LANG = process.argv.find((a) => a.startsWith("--lang="))?.slice(7) ?? "de";
const OUT =
  LANG === "en"
    ? "Michael-Fischbach-CoverLetter.pdf"
    : "Michael-Fischbach-Anschreiben.pdf";

/* The recipient address is HWA's own, from hwaag.com/en/imprint rather than
 * from memory: a first draft invented a street and would have been wrong on
 * the first thing the reader sees. */
const DE = `
<p class="sender">
  <b>Michael Fischbach</b><br>
  Malibu, Kalifornien, USA<br>
  +1 805 703 8250 · mef126906@icloud.com<br>
  michaelfischbach.dev
</p>

<p class="to">
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

/* The same letter, sentence for sentence, so the pair reads as one document in
 * two languages rather than as two different applications. Only what must
 * change does: the numbers take English convention ($15.78, 30%), and the
 * close is the British "Yours sincerely" rather than a US "Sincerely", for a
 * European reader. */
const EN = `
<p class="sender">
  <b>Michael Fischbach</b><br>
  Malibu, California, USA<br>
  +1 805 703 8250 · mef126906@icloud.com<br>
  michaelfischbach.dev
</p>

<p class="to">
  HWA AG<br>
  Human Resources<br>
  Benzstraße 8<br>
  71563 Affalterbach<br>
  Germany
</p>

<p class="date">Malibu, 1 August 2026</p>

<p class="subject">
  Application for the internship in Complete Vehicle Development<br>
  (Praktikum im Bereich Gesamtfahrzeugentwicklung), starting February/March 2027
</p>

<p>Dear Sir or Madam,</p>

<p>
  for six years I have taken parts from a sketch to a finished object: design, manufacture, measure, and
  find out where the model was wrong. That is the same cycle HWA AG runs in complete vehicle
  development, from the first design through prototype build to testing on track. This is why I am
  applying for the internship starting February/March 2027.
</p>

<p>
  My capstone shows it most clearly: a putter head milled from solid, designed to be manufactured in
  <b>a single setup</b>. That constraint determined the geometry, because every feature had to stay
  reachable without unclamping the part. Each re-fixture costs an operation and risks the datum. Before
  the aluminium part I validated the geometry on PLA prototypes and modelled the unit cost at
  <b>$15.78</b>. The work was one of eight chosen from over forty for the capstone presentation.
</p>

<p>
  To me, designing means testing the decision against the measurement. On the wave energy converter our
  five-person team took <b>first place</b> with the highest measured output of three teams; we
  manufactured every component to tolerance ourselves on a Bridgeport mill. The same attitude runs
  through my software: my autonomous execution system runs with 1553 tests in production, and I selected
  its parameters on their <b>worst</b> result across two disjoint validation windows, not their best.
</p>

<p>
  I know what it means to be responsible for a product. Chameleon Ramps, which I founded in 2019, has
  brought over 40 products to market; the casting process I developed for it cuts material scrap by
  about 30%. Deadlines, cost and scrap are not abstract quantities to me.
</p>

<p>
  Moving to Germany would be no upheaval: I grew up in a US Air Force family and have relocated nine
  times. I am learning German and will be considerably further along by the time the internship begins;
  as a US citizen, a study-related residence permit is possible. My work can be seen at
  <b>michaelfischbach.dev</b>, two pieces of it playable in the browser. I would welcome the chance to
  speak with you.
</p>

<p class="close">Yours sincerely</p>
<p class="sig">Michael Fischbach</p>

<p class="enc">Enclosures: CV, portfolio</p>`;

const BODY = LANG === "en" ? EN : DE;

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

${BODY}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log(`wrote ${OUT}`);
