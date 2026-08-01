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
 * NEITHER IS A TRANSLATION OF THE OTHER, and that is the point. The first
 * draft wrote the German and translated it, on the reasoning that
 * docs/german.md says to author German first. That rule is about LAYOUT:
 * German runs ~30% longer, so sizing to it prevents overflow. Applied to
 * prose it does the opposite of help, and the English came out carrying German
 * structure: a fronted "for six years I have taken parts...", a literal
 * "abstract quantities" for "keine abstrakten Größen", and a lowercase opening
 * after the salutation, which is a German convention and simply an error in
 * English.
 *
 * So each is now written natively: same argument, same order, same evidence,
 * but each sounds like someone who thinks in that language. They are parallel
 * in substance, not in syntax.
 *
 * German register per docs/german.md: short declarative sentences. Long
 * subordinate clauses are exactly where non-native German gives itself away.
 *
 * Every claim is carried by the CV and the portfolio: the single setup, the
 * unit cost, the 1st place, the 1553 tests, the 40+ products. The letter argues
 * from them rather than restating the CV.
 *
 * The portfolio URL appears TWICE on purpose, once in the opening paragraph
 * and once at the close, and both are real <a href> links rather than bold
 * text. A URL a reader has to retype is a URL that does not get visited, and
 * the closing paragraph alone is the one a busy reader skims.
 *
 * The portfolio is deliberately NOT an enclosure. It is the live site, and
 * the point is that the reader visits it: the wall carries photographs, a
 * rotating 3D part and two playable pieces, none of which survive being
 * flattened into a PDF. So the enclosures line names only the documents that
 * genuinely travel with the application (CV, transcript), and the portfolio is
 * named twice in the body as a link instead. An enclosures line that promises
 * a document the reader cannot find is worse than no line at all.
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
  <a href="https://michaelfischbach.dev">michaelfischbach.dev</a>
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
  Ich baue gern Dinge. Skizze, CAD-Modell, Prototyp, und wieder von vorn. Mit fünfzehn habe ich daraus
  ein Unternehmen gemacht und seitdem nicht damit aufgehört; sechs dieser Arbeiten sind unter
  <a href="https://michaelfischbach.dev"><b>michaelfischbach.dev</b></a> zu sehen. An der HWA AG reizt
  mich, dass der ganze Kreis an einem Ort stattfindet: vom Entwurf über den Prototypenbau bis zur
  Erprobung auf der Strecke, und die Strecke sagt einem, ob man richtig lag. Genau dort möchte ich mein
  Praktikum machen, ab Februar oder März 2027.
</p>

<p>
  In meinem Abschlussprojekt habe ich einen Putterkopf aus einem einzigen Block Aluminium gefräst,
  konstruiert für die Fertigung in <b>einer einzigen Aufspannung</b>. Diese eine Randbedingung hat das
  ganze Bauteil geprägt: Jedes Merkmal musste ohne Umspannen erreichbar sein, denn jedes Umspannen
  kostet einen Arbeitsgang und gefährdet den Bezugspunkt. Ich habe so lange PLA-Prototypen gefräst, bis
  die Geometrie stimmte, und erst dann das Aluminium. Die Stückkosten liegen bei <b>15,78 $</b> gegenüber
  50 bis 150 $ im Handel. Die Arbeit war eine von acht aus über vierzig, die vorgestellt wurden.
</p>

<p>
  Ich messe lieber, als zu vermuten. Unser Fünferteam hat einen Wellenenergie-Wandler gebaut und jedes
  Bauteil maßhaltig auf der Bridgeport-Fräsmaschine selbst gefertigt; er belegte den <b>1. Platz</b> mit
  der höchsten gemessenen Leistung von drei Teams. In der Software halte ich es genauso. Mein
  Handelssystem läuft im Produktivbetrieb hinter 1553 Tests, und die Parameter habe ich nach ihrem
  <b>ungünstigsten</b> Ergebnis über zwei getrennte Zeiträume gewählt, nicht nach ihrem besten. Eine Zahl,
  die nur an einem guten Tag hält, ist keine Zahl, der ich traue.
</p>

<p>
  Chameleon Ramps führe ich seit 2019, und das lehrt einen, was die Hochschule nicht lehrt: über 40
  Produkte ausgeliefert, ein selbst entwickeltes Gießverfahren, das den Ausschuss um rund 30 % senkt,
  und Kunden, die es merken, wenn ein Termin rutscht. Kosten und Termine gehen dabei auf meine eigene
  Rechnung.
</p>

<p>
  Vor einem Umzug ist mir nicht bange. Ich bin in einer Familie der US-Luftwaffe aufgewachsen und neunmal
  über sieben Bundesstaaten umgezogen; ein neues Land und ein neues Team sind für mich vertrautes
  Gelände. Deutsch lerne ich derzeit und werde bis Februar deutlich weiter sein. Als US-Staatsbürger
  kann ich einen studienbezogenen Aufenthaltstitel erhalten. Meine Arbeiten sind unter
  <a href="https://michaelfischbach.dev"><b>michaelfischbach.dev</b></a> zu sehen, zwei davon lassen
  sich direkt im Browser bedienen. Über ein Gespräch würde ich mich freuen.
</p>

<p class="close">Mit freundlichen Grüßen</p>
<p class="sig">Michael Fischbach</p>

<p class="enc">Anlagen: Lebenslauf, Notenübersicht (Cal Poly)</p>`;

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
  <a href="https://michaelfischbach.dev">michaelfischbach.dev</a>
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
  What I love is making things. Sketches, 3D models, prototypes, repeat. I started a company doing it at
  fifteen and I have not stopped since; six of those projects are at
  <a href="https://michaelfischbach.dev"><b>michaelfischbach.dev</b></a>. What draws me to HWA is that
  you do the whole loop in one place, from the first design through prototype build to testing on track,
  and the track tells you whether you were right. I would like to spend my internship there, starting
  February or March 2027.
</p>

<p>
  My capstone was a putter head milled from a single block of aluminium. I designed it to come off the
  machine in <b>one setup</b>. That one constraint shaped the whole part: every feature had to be
  reachable without unclamping it, because each re-fixture costs an operation and risks the datum. I cut
  PLA prototypes until the geometry worked, then ran the aluminium. It costs <b>$15.78</b> a unit at
  volume against $50 to $150 at retail. It was one of eight projects chosen from more than forty to
  present.
</p>

<p>
  I would rather measure than assume. Our five-person team built a wave energy converter and machined
  every part to tolerance ourselves on a Bridgeport mill; it took <b>first place</b> with the highest
  measured output of three teams. I work the same way in software. My trading system runs in production
  behind 1553 tests, and I chose its parameters on their <b>worst</b> result across two separate
  validation windows rather than their best, because a number that only holds up on a good day is not a
  number I trust.
</p>

<p>
  Running Chameleon Ramps since 2019 taught me the part school does not. Over 40 products shipped, a
  casting process I developed myself that cuts scrap by about 30%, and customers who notice when a
  deadline slips. I have had to care about cost and schedule with my own money on the line.
</p>

<p>
  Moving does not worry me. I grew up in an Air Force family and have moved nine times across seven
  states, so a new country and a new team is familiar ground rather than a leap. I am learning German
  now and will be a good deal further along by February. As a US citizen I can hold a study-related
  residence permit. My work is at
  <a href="https://michaelfischbach.dev"><b>michaelfischbach.dev</b></a>, and two pieces of it you can
  actually play in the browser. I would be glad to talk.
</p>

<p class="close">Yours sincerely</p>
<p class="sig">Michael Fischbach</p>

<p class="enc">Enclosures: CV, Cal Poly transcript</p>`;

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
