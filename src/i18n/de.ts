import type { Dict } from "./en";

/**
 * German strings.
 *
 * `satisfies Dict` makes a missing or misspelled key a COMPILE ERROR, so
 * `npm run build` fails rather than silently shipping an English fallback.
 * With no native reviewer in the loop, that check is the main defence against
 * bilingual rot.
 *
 * Terminology:
 *  - Konstruktion = design-engineering. Never "Design", which means styling.
 *  - Fertigung (manufacturing), Toleranz, Maßhaltigkeit, Ausschuss.
 *  - Short declarative sentences: long subordinate clauses are where
 *    non-native German goes wrong, and a spec-sheet register suits this site.
 *  - Established anglicisms stay (CNC, CAD, Python, Live, Next.js).
 *  - German number convention: 30.000 $, 42 %, ±0,05 mm.
 */
export const de = {
  // Barrierefreiheit
  "a11y.skip": "Zum Inhalt springen",
  "a11y.langGroup": "Sprache",
  "a11y.awards": "Auszeichnungen",

  // Navigation
  "nav.work": "Projekte",
  "nav.about": "Profil",
  "nav.contact": "Kontakt",
  "nav.awards": "Auszeichnungen",

  // Eingang
  "home.eyebrow": "Ständige Sammlung",
  "home.role": "Maschinenbau · Cal Poly San Luis Obispo",
  "home.bio1":
    "Ich konstruiere Bauteile und baue die Systeme, die sie prüfen. Seit sechs Jahren bringe ich Produkte von der Skizze zum fertigen Objekt: CAD, Toleranzanalyse, Fertigung und die Messung, die zeigt, ob das Modell gestimmt hat.",
  "home.bio2":
    "2019 habe ich ein Unternehmen für Betongussprodukte gegründet und führe es bis heute. Ich bin in einer Air-Force-Familie aufgewachsen und neunmal über sieben Bundesstaaten umgezogen. Ein Umzug für ein Praktikum ist für mich normal.",

  "fact.gpa": "GPA · Honors-Programm",
  "fact.tol": "mm Toleranz eingehalten",
  "fact.products": "Produkte in Serie",
  "fact.tests": "Tests im Produktivbetrieb",

  "cta.work": "Sammlung ansehen",
  "cta.contact": "Kontakt",

  // Interaktive Arbeiten
  "game.ttt.title": "Unschlagbares Tic-Tac-Toe",
  "game.ttt.status.thinking": "Berechnet…",
  "game.ttt.status.yourTurn": "Sie sind am Zug",
  "game.ttt.status.draw": "Unentschieden — das bestmögliche Ergebnis",
  "game.ttt.status.aiWins": "Michael gewinnt",
  "game.ttt.status.demo": "Spielt gegen sich selbst — Feld wählen zum Übernehmen",
  "game.ttt.reset": "Neues Spiel",
  "game.ring.title": "Wasser-Ringspiel",
  "game.ring.button": "Zum Pumpen drücken",
  "game.ring.expand": "Vollbild",
  "game.ring.score": "Punkte",
  "game.ring.side": "Seitendüsen",
  "game.ring.scored": "aufgesetzt",

  // Die Sammlung
  "work.eyebrow": "Die Sammlung",
  "work.title": "Arbeiten im Maschinenbau",
  "work.lede":
    "Konstruktion, Berechnung und Fertigung — jede Arbeit mit ihrer Aufgabe und ihrem Messergebnis.",

  "proj.putter.title": "CNC-gefräster Putter aus Aluminium",
  "proj.putter.body":
    "Ein Putterkopf aus 6061, gefräst auf einer 4-Achs-HAAS in einer einzigen Aufspannung, mit hinterlegtem Kostenmodell. Einer von acht Finalisten aus über vierzig.",
  "proj.ramps.title": "Chameleon Ramps",
  "proj.ramps.body":
    "Ein 2019 gegründetes Unternehmen für Betongussprodukte: vierzig Konstruktionen von CAD über den Formenbau bis zum versandfertigen Produkt. Das Gießverfahren wurde selbst entwickelt.",
  "proj.wave.title": "Wellenenergie-Wandler",
  "proj.wave.body":
    "Ein Zahnstangen-Ritzel-Generator, der Wellenbewegung in elektrische Energie wandelt. Alle Bauteile im Eigenbau auf einer Bridgeport-Fräse gefertigt.",
  "proj.wave.meta": "1. Platz",
  "proj.bot.title": "Autonomes Ausführungssystem",
  "proj.bot.body":
    "Ein Python-System, das Live-Daten aufnimmt und autonom ausführt. Die Parameter wurden nach ihrem schlechtesten Ergebnis aus zwei disjunkten Validierungsfenstern gewählt, nicht nach ihrem besten.",
  "proj.bot.meta": "Optionen live",
  "proj.container.title": "Netto-Null-Wohncontainer",
  "proj.container.body":
    "Ein L-förmiges modulares Wohnmodul für einen realen Kunden, ausgelegt auf netto null CO₂ und Barrierefreiheit nach ADA, von der Aufgabenstellung bis zur Übergabe.",
  "proj.container.meta": "Apricot Lane Farms",
  "proj.campus.title": "Campus Native",
  "proj.campus.body":
    "Ein produktiver Marktplatz für studentisch geführte Campus-Touren: sechzehn Datenmodelle und Zahlungsabwicklung. Doppelbuchungen verhindert eine Datenbank-Bedingung, nicht die Anwendungslogik.",
  "proj.campus.meta": "im Produktivbetrieb",
  "proj.water.title": "Wasserverteilungssystem",
  "proj.water.body":
    "Ein Wasserverteilungsnetz mit natürlichem Gefälle für eine ländliche Gemeinde in Nicaragua: Quellvermessung, Standortwahl des Tanks und Leitungsführung wurden aus dem Gelände abgeleitet statt aus einem Standardschema übernommen.",
  "proj.water.meta": "Nicaragua",
  "proj.water.meta2": "mit natürlichem Gefälle",

  // Auszeichnungen
  "awards.eyebrow": "Auszeichnungen",
  "awards.title": "Auszeichnungen & Ehrungen",

  "award.honors.title": "Cal Poly Honors-Programm",
  "award.honors.issuer": "California Polytechnic State University, San Luis Obispo",
  "award.honors.body":
    "Ausgewähltes Programm mit vertiefter Lehre, betreuter Forschung und interdisziplinärer Arbeit.",
  "award.presidents.title": "President's Honors List",
  "award.presidents.issuer": "California Polytechnic State University, San Luis Obispo",
  "award.presidents.body":
    "Verliehen für die Dean's List in drei aufeinanderfolgenden Quartalen eines Studienjahres.",
  "award.deans.title": "Dean's List",
  "award.deans.issuer": "California Polytechnic State University, San Luis Obispo",
  "award.deans.body":
    "Herbst, Winter und Frühjahr 2025–26, für einen GPA von mindestens 3,50 über alle Leistungspunkte.",
  "award.bridge.title": "1. Platz — Nudelbrücken-Konstruktion",
  "award.bridge.issuer": "Cal Poly College of Engineering",
  "award.bridge.body":
    "Größte tragfähige Spannweite aus zwanzig 12-Zoll-Stücken und drei Fuß Klebeband. Die Konstruktion nutzt die Druckfestigkeit des Materials gegen seine geringe Schubfestigkeit und gewann mit 38,5 % Vorsprung auf den zweiten Platz.",
  "award.capstone.title": "Capstone-Finalist — CNC-gefräster Putter",
  "award.capstone.issuer": "Oaks Christian School, Institute of Engineering",
  "award.capstone.body":
    "Eine von acht Präsentationen, ausgewählt aus über vierzig Capstone-Projekten, vorgestellt vor mehr als 300 Alumni, Fachleuten und Studierenden.",
  "award.wave.title": "1. Platz — Wellenenergie-Wandler",
  "award.wave.issuer": "Oaks Christian School, Institute of Engineering",
  "award.wave.body":
    "Höchste gemessene Leistung aller teilnehmenden Teams, gewandelt aus Wellenbewegung über einen Zahnstangen-Ritzel-Antrieb.",
  "award.eagle.title": "Eagle Scout",
  "award.eagle.issuer": "Boy Scouts of America",
  "award.eagle.body": "Eagle-Rang; zwei Jahre Senior Patrol Leader.",
  "award.ioe.title": "Institute of Engineering",
  "award.ioe.issuer": "Oaks Christian School",
  "award.ioe.body":
    "Vierjähriges projektbasiertes Ingenieurprogramm mit Themen auf Hochschulniveau, Industriesoftware, Prototyping und dem Ablauf des Design Review.",

  // Profil
  "about.title": "Profil",
  "about.p1":
    "Ich studiere Maschinenbau an der Cal Poly San Luis Obispo, im Honors-Programm, mit einem GPA von 3,78 und Dean's List in allen drei Quartalen meines ersten Studienjahres.",
  "about.p2":
    "Mich interessiert der Kreis zwischen Zeichnung und Messung: konstruieren, fertigen, prüfen, herausfinden, wo das Modell falsch lag, und ändern. Das gilt für ein Bauteil auf der Fräse wie für ein System im Produktivbetrieb. Deshalb steht hier beides.",
  "about.p3":
    "Ich bin in einer Air-Force-Familie aufgewachsen und neunmal über sieben Bundesstaaten umgezogen. Ich bin US-Staatsbürger; ein studienbezogener Aufenthaltstitel für ein Praktikum in Deutschland ist möglich.",

  // Kontakt
  "contact.title": "Kontakt",
  "contact.lede": "Verfügbar für ein Praktikum im Maschinenbau. Umzug möglich.",

  // Fußzeile
  "footer.role": "Maschinenbauingenieur",
  "footer.email": "E-Mail",
} satisfies Dict;
