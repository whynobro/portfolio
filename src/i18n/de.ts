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
  "game.ttt.status.draw": "Unentschieden: das bestmögliche Ergebnis",
  "game.ttt.status.aiWins": "Michael gewinnt",
  "game.ttt.status.demo": "Spielt gegen sich selbst. Feld wählen zum Übernehmen",
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
    "Konstruktion, Berechnung und Fertigung: jede Arbeit mit ihrer Aufgabe und ihrem Messergebnis.",

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
  "proj.campus.title": "Campus Native",
  "proj.campus.body":
    "Ein produktiver Marktplatz für studentisch geführte Campus-Touren: sechzehn Datenmodelle und Zahlungsabwicklung. Doppelbuchungen verhindert eine Datenbank-Bedingung, nicht die Anwendungslogik.",
  "proj.campus.meta": "im Produktivbetrieb",
  "proj.water.title": "Wasserverteilungssystem",
  "proj.water.body":
    "Ein Wasserverteilungsnetz mit natürlichem Gefälle für eine ländliche Gemeinde in Nicaragua: Quellvermessung, Standortwahl des Tanks und Leitungsführung wurden aus dem Gelände abgeleitet statt aus einem Standardschema übernommen.",
  "proj.water.meta": "Nicaragua",
  "proj.water.meta2": "mit natürlichem Gefälle",

  // ---- Die Projekträume ---------------------------------------------------
  "case.eyebrow": "Aus der Sammlung",
  "case.back": "Zurück zur Sammlung",
  "case.spec.role": "Rolle",
  "case.spec.tools": "Werkzeuge",
  "case.spec.material": "Werkstoff",
  "case.spec.scope": "Umfang",
  "case.spec.result": "Ergebnis",
  "case.h.brief": "Die Aufgabe",
  "case.h.approach": "Das Vorgehen",
  "case.h.result": "Das Messergebnis",

  // CNC-Putter
  "case.putter.lede":
    "Ein Putterkopf aus einem einzigen Block 6061, konstruiert für die Fertigung in einer einzigen Aufspannung.",
  "case.putter.role": "Konstruktion, CAM und Zerspanung",
  "case.putter.tools": "Fusion 360 · 4-Achs-HAAS",
  "case.putter.material": "Aluminium 6061",
  "case.putter.result": "15,78 $ pro Einheit",
  "case.putter.brief":
    "Ein einjähriges Abschlussprojekt: ein Produkt von der ersten Skizze bis zum fertigen Objekt, einschließlich der Kosten einer Serienfertigung.",
  "case.putter.approach1":
    "Der Kopf wird auf einer 4-Achs-HAAS aus dem Vollen gefräst. Die einzige Aufspannung war die prägende Randbedingung: Jedes Merkmal muss ohne Umspannen erreichbar sein. Jedes Umspannen kostet einen Arbeitsgang und gefährdet den Bezugspunkt.",
  "case.putter.approach2":
    "Die Schöpfgeometrie folgt derselben Überlegung. Sie macht den Putter zu einem eigenen Objekt statt zu einer Kopie, und sie musste mit den vorhandenen Werkzeugen zerspanbar sein, nicht nur darstellbar.",
  "case.putter.outcome":
    "Die kalkulierten Stückkosten in lagerorientierter Fertigung liegen bei 15,78 $, gegenüber 50–150 $ im Handel bei den Vergleichsmarken. Die Arbeit war eine von acht Präsentationen aus über vierzig und wurde vor mehr als 300 Zuhörern gezeigt.",

  // Chameleon Ramps
  "case.ramps.lede":
    "Ein 2019 gegründetes Unternehmen für Betongussprodukte, bis heute aktiv: vierzig Konstruktionen von CAD bis zum versandfertigen Objekt.",
  "case.ramps.role": "Gründer · Konstruktion und Fertigung",
  "case.ramps.tools": "CAD · Formenbau · Betonguss",
  "case.ramps.material": "Gussbeton",
  "case.ramps.result": "50.000 $ Umsatz",
  "case.ramps.brief":
    "Skate-Hindernisse im Miniaturformat, gegossen statt gedruckt, haltbar genug für die Tasche und den Außeneinsatz.",
  "case.ramps.approach1":
    "Jedes Produkt beginnt als CAD-Modell, wird zur Form und erst dann zur Serie. Die Form ist die eigentliche Aufgabe: Aushebeschräge, Wandstärke und Entformung entscheiden, ob eine Geometrie vierzigmal entsteht oder nur einmal.",
  "case.ramps.approach2":
    "Das Gießverfahren wurde über mehrere Jahre selbst entwickelt. Erst das machte die Produktreihe möglich. Beton verzeiht bei Mischung und Aushärtung wenig, und jedes Produkt, das hielt, lieferte den Hinweis für das nächste.",
  "case.ramps.outcome":
    "Seit 2019 sind über vierzig Produkte auf den Markt gegangen, bei rund 50.000 $ Umsatz. Das Unternehmen läuft weiter.",

  // Wellenenergie-Wandler
  "case.wave.lede":
    "Ein Zahnstangen-Ritzel-Generator, der die Hubbewegung einer Welle in Drehung und die Drehung in Strom wandelt.",
  "case.wave.role": "Konstruktion und Fertigung",
  "case.wave.tools": "Fusion 360 · AutoCAD · Bridgeport-Fräse",
  "case.wave.material": "Stahl und Aluminium, spanend gefertigt",
  "case.wave.result": "1. Platz",
  "case.wave.brief":
    "Drei Teams, eine Aufgabe: die größte elektrische Leistung aus Wellenbewegung. Verglichen wurde gemessen, nicht argumentiert.",
  "case.wave.approach1":
    "Ein Schwimmer treibt eine senkrechte Zahnstange, die Zahnstange dreht ein Ritzel, das Ritzel den Generator. Der Aufbau ist bewusst einfach: Jede weitere Stufe zwischen Welle und Anker verliert Energie durch Reibung.",
  "case.wave.approach2":
    "Alle Bauteile entstanden im Eigenbau auf einer Bridgeport-Fräse. Die Toleranzen mussten also solche sein, die sich tatsächlich einhalten ließen. Ein klemmender Zahnstangentrieb wandelt gar nichts.",
  "case.wave.outcome":
    "Die Maschine erreichte die höchste gemessene Leistung aller Teams und gewann den 1. Platz.",

  // Ausführungssystem
  "case.bot.lede":
    "Ein Python-System, das Live-Meldungen liest, ihre Handelbarkeit prüft und ohne menschlichen Eingriff ausführt.",
  "case.bot.role": "Architektur und Umsetzung",
  "case.bot.tools": "Python · SQLite · systemd auf einem VPS",
  "case.bot.scope": "Optionen live · Futures im Demobetrieb",
  "case.bot.result": "1553 Tests",
  "case.bot.brief":
    "Aus einem Strom formloser, von Menschen geschriebener Meldungen werden korrekte Orders. Oder gar keine.",
  "case.bot.approach1":
    "Der Parser ist der schwierige Teil: Die Eingabe ist Fließtext von Menschen unter Zeitdruck, und ein falsch gelesener Strike ist eine reale Order auf das Falsche. Jeder Kanal hat seine eigene Grammatik. Maßgeblich ist der Ausführungsstand des Brokers, nie der Text der Meldung.",
  "case.bot.approach2":
    "Die Parameter wurden nach ihrem schlechtesten Ergebnis aus zwei disjunkten Validierungsfenstern gewählt, nicht nach ihrem besten. Die beste Anpassung ist der Weg, auf dem ein im Backtest hervorragendes System im Markt Geld verliert.",
  "case.bot.outcome":
    "1553 Tests laufen in der Produktivsuite durch. Optionen laufen live, Futures gegen einen Paper-Broker. Die Betriebsanzeige oben ist reine Telemetrie: Die Steuerung liegt woanders.",

  // Campus Native
  "case.campus.lede":
    "Ein Marktplatz für Campus-Führungen durch aktuelle Studierende, im Produktivbetrieb und mit echten Buchungen.",
  "case.campus.role": "Gründer · Produkt und Entwicklung",
  "case.campus.tools": "Next.js · PostgreSQL · Stripe",
  "case.campus.scope": "16 Datenmodelle",
  "case.campus.result": "Im Produktivbetrieb",
  "case.campus.brief":
    "Die offizielle Campus-Führung folgt einem Skript. Studieninteressierte wollen die Version von jemandem, der ihr Fach studiert.",
  "case.campus.approach1":
    "Sechzehn Datenmodelle tragen Hochschulen, Guides, Verfügbarkeiten, Buchungen und Auszahlungen. Guides werden nach Studienfach und Interessen zugeordnet: Genau diese Zuordnung ist der Grund, eine Person zu buchen und nicht einen Termin.",
  "case.campus.approach2":
    "Doppelbuchungen verhindert eine Bedingung in der Datenbank, keine Prüfung in der Anwendung. Prüfungen in der Anwendung verlieren das Rennen, sobald zwei Personen gleichzeitig buchen. Nur die Datenbank kann die Frage genau einmal entscheiden.",
  "case.campus.outcome":
    "Die Seite läuft unter campusnative.com und bildet Buchung und Zahlung vollständig ab.",

  // Wasserverteilung
  "case.water.lede":
    "Ein Wasserverteilungsnetz mit natürlichem Gefälle für eine ländliche Gemeinde in Nicaragua, aus dem Gelände heraus geführt.",
  "case.water.role": "Konstruktion und Berechnung · Abschlusspräsentation",
  "case.water.tools": "Autodesk CFD · Geländevermessung",
  "case.water.scope": "Cerro de Agua, Nicaragua",
  "case.water.result": "1 von 5 Vortragenden",
  "case.water.brief":
    "Sauberes Wasser von der Quelle zur Gemeinde, ohne Pumpe. Die Arbeit muss also das Gelände übernehmen.",
  "case.water.approach1":
    "Der Standort des Tanks bestimmt alles Nachgelagerte: zu tief, und am Ende des Netzes fehlt der Druck; zu hoch, und die Leitung von der Quelle wird zum Problem. Der Standort ergab sich aus der Vermessung, nicht aus einem Standardschema.",
  "case.water.approach2":
    "Leitungsführung und Durchmesser wurden aus der verfügbaren Druckhöhe an jedem Abzweig bestimmt. Die Rohrkosten waren Teil der Auslegung, kein nachträglicher Zusatz.",
  "case.water.outcome":
    "Die Arbeit wurde Vertretern der Stadt Cerro de Agua sowie der Schulleitung und Alumni aus der Ingenieurbranche vorgestellt. Ich war einer von fünf Vortragenden aus einem Kurs von vierzig.",

  // Alternativtexte und Bildunterschriften
  "alt.putter.hero": "Der fertige Putterkopf aus Aluminium auf dem Grün",
  "alt.putter.cam": "Der CAM-Aufbau in Fusion 360, Werkzeugbahnen über dem Modell",
  "alt.putter.machining": "Der Kopf im Schraubstock während der Bearbeitung, Späne auf der Vorrichtung",
  "alt.putter.inhand": "Der fertige Kopf in der Hand, mit Blick auf die Schöpfgeometrie",
  "alt.putter.inuse": "Der Putter im Einsatz auf dem Westlake Golf Course",
  "alt.putter.drawing": "Die bemaßte technische Zeichnung",
  "cap.putter.cam": "Werkzeugbahnen in Fusion 360: der Aufbau, den die eine Aufspannung erfüllen musste.",
  "cap.putter.machining": "Während der Bearbeitung auf der 4-Achs-HAAS.",
  "cap.putter.inhand": "Die Schöpffläche, das Merkmal, um das die Geometrie gebaut ist.",
  "cap.putter.inuse": "Im Einsatz auf dem Westlake Golf Course.",
  "cap.putter.drawing": "Die Zeichnung, nach der gefertigt wurde.",

  "alt.ramps.hero": "Beachside Bank aus Gussbeton auf nassem Fels",
  "alt.ramps.quarter": "Eine Quarter Pipe aus Gussbeton vor Blattwerk",
  "alt.ramps.alt1": "Ein Hindernis aus Gussbeton aus der Produktreihe",
  "alt.ramps.alt2": "Ein Hindernis aus Gussbeton aus der Produktreihe",
  "cap.ramps.quarter": "Die Quarter Pipe: die Form, die sich am schwersten entformen lässt.",
  "cap.ramps.alt1": "Aus der aktuellen Produktreihe.",
  "cap.ramps.alt2": "Aus der aktuellen Produktreihe.",

  "alt.wave.hero": "Der innere Mechanismus des Wellenenergie-Wandlers",
  "alt.wave.base": "Grundplatte und Lagerung des Wandlers",
  "cap.wave.base": "Die Grundplatte, im Eigenbau auf der Bridgeport gefertigt.",

  "alt.bot.hero": "Die Betriebsanzeige: Broker-Verbindung und ausgeführte Orders",

  "alt.campus.hero": "Der Marktplatz Campus Native, live unter campusnative.com",

  "alt.water.hero": "Das Verteilungssystem auf der Geländevermessung",
  "alt.water.map": "Das Netzschema: Quelle, zwei Tanks und dasselbe Netz mit Druckangaben",
  "cap.water.map": "Das Netz, und dasselbe Netz mit dem Druck an jedem Knoten.",

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
  "award.bridge.title": "1. Platz: Nudelbrücken-Konstruktion",
  "award.bridge.issuer": "Cal Poly College of Engineering",
  "award.bridge.body":
    "Größte tragfähige Spannweite aus zwanzig 12-Zoll-Stücken und drei Fuß Klebeband. Die Konstruktion nutzt die Druckfestigkeit des Materials gegen seine geringe Schubfestigkeit und gewann mit 38,5 % Vorsprung auf den zweiten Platz.",
  "award.capstone.title": "Capstone-Finalist: CNC-gefräster Putter",
  "award.capstone.issuer": "Oaks Christian School, Institute of Engineering",
  "award.capstone.body":
    "Eine von acht Präsentationen, ausgewählt aus über vierzig Capstone-Projekten, vorgestellt vor mehr als 300 Alumni, Fachleuten und Studierenden.",
  "award.wave.title": "1. Platz: Wellenenergie-Wandler",
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
