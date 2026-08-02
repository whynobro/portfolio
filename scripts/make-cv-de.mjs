/**
 * Renders the German CV (Lebenslauf).
 *
 *   node scripts/make-cv-de.mjs
 *
 * Writes `Michael-Fischbach-Lebenslauf.pdf` to the repo root (gitignored: a
 * build output, not a source).
 *
 * The site also SERVES this document: the resume button hands a German reader
 * the Lebenslauf instead of the American resume. That copy is committed at
 * `src/assets/docs/resume-de.pdf` so the bundler can content-hash it. Nothing
 * copies it automatically, so after changing anything here, re-run this script
 * and copy the result over that file, or the site keeps serving the old one.
 *
 * Terminology follows `docs/german.md` exactly, which is the project's only
 * defence against there being NO NATIVE-SPEAKER REVIEW IN THE LOOP:
 * Konstruktion (never "Design"), Fertigung, Zerspanung, Toleranzkettenanalyse,
 * Form- und Lagetoleranzen, Gesamtfahrzeugentwicklung (HWA's own word for the
 * post). Established anglicisms are left alone, because German engineers say
 * CNC, CAD, Python and Backtesting and translating them reads as
 * overcorrection.
 *
 * Numbers follow German convention: 3,78 rather than 3.78, 50.000 $ rather
 * than $50,000, and a space before the percent sign.
 *
 * Deliberately NOT a translation of the English file: a Lebenslauf is its own
 * genre. It is reverse-chronological, it leads with a Kurzprofil rather than an
 * American "objective", and the personal details a German reader expects
 * (nationality, work-permit status) are stated plainly rather than buried.
 * There is no photograph and no date-and-signature line: both are traditional,
 * both are now optional, and omitting the photo is what AGG-conscious German
 * employers increasingly prefer.
 */
import { chromium } from "playwright";

const OUT = "Michael-Fischbach-Lebenslauf.pdf";

const html = `<!doctype html><meta charset="utf-8">
<style>
  @page { size: A4; margin: 16mm 15mm }
  * { box-sizing: border-box }
  body {
    margin: 0; font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 9.4pt; line-height: 1.42; color: #1a1a1a;
  }
  h1 { font-size: 21pt; margin: 0 0 1mm; font-weight: 700; letter-spacing: .01em }
  .contact { font-size: 8.6pt; color: #333; margin: 0 0 5mm; line-height: 1.5 }
  .contact a { color: #1a1a1a; text-decoration: none }
  h2 {
    font-size: 9pt; text-transform: uppercase; letter-spacing: .1em;
    border-bottom: 1.1px solid #1a1a1a; padding-bottom: 1.1mm;
    margin: 5mm 0 2.6mm; font-weight: 700;
  }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm }
  .role { font-weight: 700; font-size: 9.8pt }
  .when { font-size: 8.5pt; color: #444; white-space: nowrap }
  .org { font-style: italic; color: #333; font-size: 9pt; margin: .4mm 0 1.2mm }
  ul { margin: 0 0 2.8mm; padding-left: 4.2mm }
  li { margin: 0 0 1mm; padding-left: .6mm }
  .kurz { margin: 0 0 1mm; text-align: justify }
  /* Two real columns rather than an inline-block label: German runs long, and
   * "Fertigung" and "Methoden" both wrap, which made the continuation line run
   * back under the label instead of staying in the value column. */
  .skills p {
    margin: 0 0 1.3mm; display: grid;
    grid-template-columns: 27mm 1fr; column-gap: 2mm; align-items: baseline;
  }
  .block { break-inside: avoid; page-break-inside: avoid }
</style>

<h1>Michael Fischbach</h1>
<p class="contact">
  Malibu, Kalifornien, USA · +1 805 703 8250 · mef126906@icloud.com<br>
  <a href="https://michaelfischbach.dev">michaelfischbach.dev</a> ·
  <a href="https://www.linkedin.com/in/michael-fischbach/">LinkedIn</a><br>
  US-Staatsbürger · Aufenthaltstitel für ein studienbezogenes Praktikum in Deutschland möglich
</p>

<h2>Kurzprofil</h2>
<p class="kurz">
  Maschinenbaustudent an der California Polytechnic State University (Honors-Programm, Notendurchschnitt 3,78 von 4,0)
  mit Praxis von der Konstruktion bis zum gefertigten Bauteil: CAD, Toleranzkettenanalyse, Zerspanung auf einer
  3-Achs-HAAS und Erprobung am realen Teil. Bewerbung um das <b>Praktikum im Bereich Gesamtfahrzeugentwicklung</b>
  bei der HWA AG in Affalterbach, Beginn Februar/März 2027. Seit 2019 führe ich ein eigenes Fertigungsunternehmen und
  kenne den Zyklus aus Konstruktion, Werkstatt und Erprobung aus eigener Verantwortung.
</p>

<h2>Ausbildung</h2>
<div class="block">
  <div class="row">
    <span class="role">California Polytechnic State University, San Luis Obispo</span>
    <span class="when">09/2025 – 06/2029</span>
  </div>
  <p class="org">B.Sc. Maschinenbau, Honors-Programm · Notendurchschnitt 3,78 von 4,0 · Dean's List in allen drei Quartalen</p>
  <ul>
    <li>Forschungsorientiertes Honors-Programm; „Learn by Doing“ mit Fertigung, CNC-Zerspanung und Konstruktion ab dem ersten Studienjahr</li>
    <li>Mehrteilige Baugruppen konstruiert und gefertigt (Kolben, Malteserkreuz, CNC-gefräster Schraubendreher) mit vollständiger Toleranzkettenanalyse und Form- und Lagetoleranzen</li>
  </ul>
</div>
<div class="block">
  <div class="row">
    <span class="role">Oaks Christian School – Institute of Engineering</span>
    <span class="when">09/2022 – 06/2025</span>
  </div>
  <p class="org">Ingenieurzweig: sechs mehrmonatige Konstruktionsprojekte · Notendurchschnitt 3,92 (unbewichtet) / 4,10 (gewichtet)</p>
</div>

<h2>Projekte in Konstruktion und Fertigung</h2>
<div class="block">
  <div class="row">
    <span class="role">CNC-gefräster Golfputter – vom CAD-Modell zum Bauteil</span>
    <span class="when">2024 – 2025</span>
  </div>
  <p class="org">3-Achs-HAAS · Fusion 360 · fertigungsgerechte Konstruktion</p>
  <ul>
    <li>Putterkopf aus dem Vollen (Aluminium 6061) konstruiert und in <b>einer einzigen Aufspannung</b> gefräst; die Geometrie zuvor an PLA-Prototypen abgesichert</li>
    <li>Fertigungsgerechte Konstruktion und Kostenanalyse: 15,78 $ Stückkosten im Modell gegenüber 50–150 $ im Handel</li>
    <li>Einer von acht Finalisten aus über vierzig Studierenden; Vorstellung von Bauteil und Prozess vor mehr als 200 Alumni und Fachleuten</li>
  </ul>
</div>
<div class="block">
  <div class="row">
    <span class="role">Wellenenergie-Wandler – Zahnstangen-Ritzel-Generator</span>
    <span class="when">2023</span>
  </div>
  <p class="org">Bridgeport-Fräsmaschine · Fusion 360 · Strömungsmechanik</p>
  <ul>
    <li>Generator zur Wandlung von Wellenbewegung in elektrische Energie im Fünferteam konstruiert; alle Bauteile maßhaltig auf der Bridgeport-Fräsmaschine gefertigt</li>
    <li><b>1. Platz</b> mit der höchsten gemessenen Leistung von drei Teams: 15 V je Motor im Maßstab 1:12, hochgerechnet 360 V</li>
    <li>Strömungsmechanische und energetische Auslegung; vollständige Baugruppe in Fusion 360 und AutoCAD mit Toleranzdokumentation</li>
  </ul>
</div>
<div class="block">
  <div class="row">
    <span class="role">Chameleon Ramps – Produktentwicklung und Fertigung</span>
    <span class="when">2019 – heute</span>
  </div>
  <p class="org">Fusion 360 · Gießverfahren · iterativer Prototypenbau</p>
  <ul>
    <li>Über sechs Jahre mehr als 40 Produkte konstruiert und ein eigenes Gießverfahren entwickelt, das den Materialausschuss um rund 30 % senkt</li>
    <li>Systematischer Zyklus aus Konstruktion, Erprobung und Überarbeitung über vier bis sechs Prototypengenerationen je Produkt; über 50.000 $ Umsatz</li>
  </ul>
</div>
<div class="block">
  <div class="row">
    <span class="role">Autonomes Ausführungssystem</span>
    <span class="when">2025 – heute</span>
  </div>
  <p class="org">Python · Echtzeitdaten · SQLite · Backtesting</p>
  <ul>
    <li>Python-System, das Echtzeitdaten verarbeitet und Entscheidungen über eine externe Schnittstelle ausführt, mit Risikogrenzen, Zustandspersistenz und eigenem Backtesting</li>
    <li><b>1553 Tests</b> laufen im Produktivbetrieb; Parameter nach ihrem <b>ungünstigsten</b> Ergebnis über zwei getrennte Validierungszeiträume gewählt, nicht nach ihrem besten</li>
  </ul>
</div>

<h2>Berufserfahrung</h2>
<div class="block">
  <div class="row"><span class="role">Gründer und Geschäftsführer</span><span class="when">06/2026 – heute</span></div>
  <p class="org">Campus Native · San Luis Obispo, Kalifornien</p>
  <ul><li>Digitalen Marktplatz aufgebaut und betrieben; Leitung eines vierköpfigen Teams aus Entwicklung, Marketing und Redaktion</li></ul>
</div>
<div class="block">
  <div class="row"><span class="role">Digital Media Manager</span><span class="when">03/2023 – heute</span></div>
  <p class="org">All Domain Integration (ADI), Luft- und Raumfahrttechnik · remote</p>
  <ul><li>Seit über drei Jahren für ein Ingenieurbüro der Luft- und Raumfahrt tätig: Betreuung der Website, SEO und digitale Kommunikation</li></ul>
</div>
<div class="block">
  <div class="row"><span class="role">Gesellschafter</span><span class="when">05/2023 – 07/2024</span></div>
  <p class="org">Ashersells LLC · Malibu, Kalifornien</p>
  <ul><li>Mitaufbau des operativen Geschäfts auf über 500.000 $ Jahresumsatz; Python-Automatisierung für Logistik und Auftragsabwicklung</li></ul>
</div>

<h2>Fachkenntnisse</h2>
<div class="skills block">
  <p><b>CAD / CAE:</b> Fusion 360 (über 6 Jahre, mehr als 40 Konstruktionen), SolidWorks, AutoCAD, Autodesk CFD</p>
  <p><b>Fertigung:</b> 3-Achs-HAAS, Bridgeport-Fräsmaschine, Drehmaschine, FDM-/SLA-Druck, Gießen von Beton und Verbundwerkstoffen</p>
  <p><b>Methoden:</b> Form- und Lagetoleranzen, Toleranzkettenanalyse, fertigungs- und montagegerechte Konstruktion, Prototypenbau, Kostenmodellierung</p>
  <p><b>Software:</b> Python, HTML/CSS, Git</p>
  <p><b>Sprachen:</b> Englisch (Muttersprache), Deutsch (Grundkenntnisse, im Aufbau)</p>
</div>

<h2>Engagement und persönliches Profil</h2>
<div class="block">
  <ul>
    <li><b>Honors-Programm der Cal Poly</b> – Aufnahme Herbst 2026; forschungsorientiertes Auswahlprogramm mit fachlicher Betreuung</li>
    <li><b>Eagle Scout</b> – Boy Scouts of America (2025), höchster Rang; zwei Jahre Senior Patrol Leader, 15 Jahre im Verband</li>
    <li><b>Dean's List</b> – Cal Poly, alle drei Quartale 2025/26</li>
    <li><b>International mobil</b> – Familie der US-Luftwaffe; neun Umzüge über sieben Bundesstaaten, rasche Einarbeitung in neue Teams</li>
    <li><b>Ehrenamt</b> – seit 2021 vierzehntägige Essensausgabe für Wohnungslose</li>
  </ul>
</div>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: OUT, format: "A4", printBackground: true });
await browser.close();
console.log(`wrote ${OUT}`);
