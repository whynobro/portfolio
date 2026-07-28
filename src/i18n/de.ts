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

  // ---- Fallstudien: gemeinsam ----
  "case.back": "← Zurück zu den Projekten",
  "case.brief": "Aufgabe",
  "case.iterations": "Iterationen",
  "case.result": "Messergebnis",

  // ---- CNC-Putter ----
  // "Konstruktion" = design-engineering. "Design" would mean visual styling.
  "case.cnc.kicker": "Von der Konstruktion zum fertigen Bauteil",
  "case.cnc.lede":
    "Ein Putterkopf aus Aluminium 6061, gefräst auf einer 4-Achs-HAAS. Von der ersten Skizze bis zum fertigen Bauteil, mit vollständiger Toleranzkettenanalyse und einem Fertigungskostenmodell.",
  "case.cnc.figureAlt": "Toleranzkette: Worst Case ±0,14 mm, RSS ±0,08 mm",
  "case.cnc.caption":
    "Toleranzkette über drei tolerierte Merkmale. Worst Case ±0,14 mm; RSS ±0,08 mm.",
  "case.cnc.brief":
    "Einen Putter mit einer Geometrie konstruieren, die sich nicht gießen lässt, und ihn anschließend tatsächlich fertigen. Die entscheidende Randbedingung: Fertigung in einer einzigen 4-Achs-Aufspannung. Eine zweite Aufspannung bringt einen Positionierfehler ein, den die Ebenheit der Schlagfläche nicht aufnehmen kann.",
  "case.cnc.iterations":
    "Vor dem ersten Aluminiumteil entstanden drei PLA-Prototypen. Das war eine bewusste Kostenentscheidung: Ein fehlgeschlagener Druck kostet eine Stunde und wenige Gramm, ein fehlgeschlagener Fräsvorgang kostet einen Rohling und fast einen Maschinentag. Der erste Druck zeigte eine falsche Gewichtsverteilung zwischen Ferse und Spitze, der zweite eine zu geringe Restwandstärke an der Sohle. Erst die dritte Geometrie wurde in Metall gefräst.",
  "case.cnc.s1": "Werkstoff",
  "case.cnc.s2": "Maschine",
  "case.cnc.s2v": "4-Achs-HAAS, eine Aufspannung",
  "case.cnc.s3": "Toleranzkette",
  "case.cnc.s4": "Berechnete Stückkosten",
  "case.cnc.s5": "Vergleich Einzelhandel",
  "case.cnc.s6": "Auszeichnung",
  "case.cnc.s6v": "1 von 8 Finalisten aus 40+; Präsentation vor 300+ Zuhörern",

  // ---- Wellenenergie ----
  "case.wave.kicker": "Energiewandlung",
  "case.wave.lede":
    "Ein Zahnstangen-Ritzel-Generator, der Wellenbewegung in elektrische Energie wandelt. Alle Bauteile wurden auf einer Bridgeport-Fräse maßhaltig gefertigt.",
  "case.wave.figureAlt": "Gemessene Leistung im Vergleich zu den anderen Teams",
  "case.wave.caption":
    "Leistung über Wellenfrequenz. Die Balken zeigen die Spitzenleistung der anderen Teams.",
  "case.wave.brief":
    "Die Vertikalbewegung einer Welle in nutzbare elektrische Leistung wandeln. Zahnstange und Ritzel statt Turbine: Wellenbewegung ist langsam und oszillierend. Eine Turbine braucht kontinuierliche Rotation, die Zahnstange wandelt den Linearhub direkt und verträgt die Richtungsumkehr an den Umkehrpunkten.",
  "case.wave.iterations":
    "Der erste Aufbau verlor den Großteil der Energie durch Reibung in der Zahnstangenführung. Zusätzlich führte das Spiel zwischen Zahnstange und Ritzel dazu, dass bei jeder Richtungsumkehr Weg verloren ging, bevor der Eingriff wieder stand. Engere Führungstoleranzen und weniger Spiel brachten mehr als jede Änderung am Generator selbst.",
  "case.wave.s1": "Wirkprinzip",
  "case.wave.s1v": "Zahnstange und Ritzel, oszillierend",
  "case.wave.s2": "Fertigung",
  "case.wave.s2v": "Bridgeport-Fräse, alle Bauteile im Eigenbau",
  "case.wave.s3": "Leistung",
  "case.wave.s3v": "Höchste gemessene Leistung im Teilnehmerfeld",
  "case.wave.s4": "Platzierung",
  "case.wave.s4v": "1. Platz",

  // ---- Chameleon Ramps ----
  "case.ramps.kicker": "Produktkonstruktion und Fertigung",
  "case.ramps.lede":
    "Ein 2019 gegründetes Unternehmen für Betongussprodukte: 40+ Konstruktionen von Fusion 360 über den Formenbau bis zum versandfertigen Produkt. Das Gießverfahren wurde selbst entwickelt.",
  "case.ramps.figureAlt":
    "Ausschussquote sinkt, Maßhaltigkeit steigt über sechs Prototypengenerationen",
  "case.ramps.caption":
    "Ausschuss und Maßhaltigkeit über sechs Generationen. Der Großteil des Fortschritts liegt bis G3.",
  "case.ramps.brief":
    "Miniatur-Betonhindernisse mit scharfen, reproduzierbaren Kanten fertigen, zu Stückkosten, die einen realistischen Preis tragen. Beton verzeiht im Kleinformat wenig: Die Gesteinskörnung ist grob im Verhältnis zum Bauteil, und Kanten füllen entweder nicht vollständig oder brechen beim Entformen.",
  "case.ramps.iterations":
    "Jedes Produkt durchlief vier bis sechs Generationen. Der wiederkehrende Fehler war Kantenausbruch beim Entformen. Das ist ein Problem von Formschräge und Aushärtezeit, nicht der Mischung — was mehrere Generationen an Mischungsversuchen gekostet hat, bis es feststand. Formschräge an den Formwänden und längere Aushärtung vor dem Entformen senkten den Ausschuss deutlich stärker als jede Änderung der Mischung. Ab der dritten Generation flacht die Kurve ab; weitere Iterationen hätten mehr gekostet als eingebracht.",
  "case.ramps.s1": "Aktiv seit",
  "case.ramps.s2": "Konstruktionen",
  "case.ramps.s2v": "40+ eigene Produkte, Fusion 360",
  "case.ramps.s3": "Ausschussreduzierung",
  "case.ramps.s3v": "42 % → 8 % über sechs Generationen",
  "case.ramps.s4": "Umsatz",

  // ---- Ausführungssystem ----
  "case.bot.kicker": "Systems Engineering und Validierung",
  "case.bot.lede":
    "Ein Python-System, das Live-Daten aufnimmt, sie in strukturierte Aufträge übersetzt und über eine Broker-API ausführt, mit Risikogrenzen und neustartfestem Zustand. Hier steht die Validierungsmethode im Vordergrund, nicht die Anwendungsdomäne.",
  "case.bot.figureAlt":
    "Stop-Werte, sortiert nach dem schlechtesten Ergebnis aus zwei disjunkten Validierungsfenstern",
  "case.bot.caption":
    "Jeder Kandidat in zwei disjunkten Fenstern gemessen. Ausgewählt wird nach dem schlechteren Ergebnis.",
  "case.bot.h1": "Warum das in ein Maschinenbau-Portfolio gehört",
  "case.bot.why":
    "Der ingenieurtechnische Gehalt liegt in der Validierungsmethode. Ein Parameter wurde nach seinem schlechtesten Ergebnis aus zwei disjunkten Testfenstern ausgewählt, nicht nach dem besten und nicht nach dem Mittelwert. Das entspricht der Auslegung eines Bauteils gegen seinen ungünstigsten Betriebszustand statt gegen den Nennzustand: Die Einstellung −35 % lieferte in Summe mehr und wurde trotzdem verworfen, weil ihr schlechtestes Fenster unter dem von −30 % lag.",
  "case.bot.h2": "Sicherheit durch Konstruktion",
  "case.bot.safety":
    "Fehlerzustände werden strukturell ausgeschlossen, nicht durch Arbeitsanweisungen. Der Prozess startet nicht, wenn seine Umgebungskonfiguration widersprüchlich ist, statt zu starten und sich unerwartet zu verhalten. Er greift ausschließlich auf Positionen zu, die er selbst eröffnet hat, ermittelt über eine Datenbankabfrage statt über die Form einer Kennung. Beides entspricht einer Poka-Yoke-Vorrichtung: den falschen Zustand unerreichbar machen, statt zu dokumentieren, dass er zu vermeiden ist.",
  "case.bot.s1": "Testsuite",
  "case.bot.s1v": "1553 bestanden",
  "case.bot.s2": "Status",
  "case.bot.s2v": "Optionen live; Futures im Demobetrieb",
  "case.bot.s3": "Validierung",
  "case.bot.s3v": "Zwei disjunkte Fenster, Auswahl nach Worst Case",
  "case.bot.s4": "Technologie",

  // ---- Profil ----
  "about.title": "Profil",
  "about.p1":
    "Ich studiere Maschinenbau an der Cal Poly San Luis Obispo, im Honors-Programm, mit einem GPA von 3,78 und Dean's List in allen drei Quartalen meines ersten Studienjahres. Seit 2019 konstruiere und fertige ich physische Produkte, damals mit der Gründung eines Unternehmens für Betongussprodukte, das bis heute läuft.",
  "about.p2":
    "Mich interessiert der Kreis zwischen Zeichnung und Messung: konstruieren, fertigen, prüfen, herausfinden, wo das Modell falsch lag, und ändern. Das gilt für ein Bauteil auf der Fräse genauso wie für ein System im Produktivbetrieb. Deshalb steht hier beides.",
  "about.p3":
    "Ich bin in einer Air-Force-Familie aufgewachsen und neunmal umgezogen, über sieben Bundesstaaten und Territorien. Ein Umzug ins Ausland für ein Praktikum ist für mich normal. Ich bin US-Staatsbürger, ein studienbezogener Aufenthaltstitel für ein Praktikum in Deutschland ist möglich.",
  "about.capabilities": "Kompetenzen",
  "about.manufacturing": "Fertigung",
  "about.manufacturingV":
    "4-Achs-CNC (HAAS), Bridgeport-Fräse, Drehmaschine, FDM/SLA-Druck, Betonguss",
  "about.methods": "Methoden",
  "about.methodsV":
    "Form- und Lagetoleranzen, Toleranzkettenanalyse, DFM/DFA, iteratives Prototyping, Kostenmodellierung",
  "about.software": "Software",
  "about.languages": "Sprachen",
  "about.languagesV": "Englisch (Muttersprache), Deutsch (im Aufbau)",

  // ---- Kontakt ----
  "contact.title": "Kontakt",
  "contact.lede":
    "Verfügbar für ein Praktikum im Maschinenbau. Umzug innerhalb Europas möglich.",
  "contact.email": "E-Mail",
  "contact.phone": "Telefon",
  "contact.location": "Standort",
  "contact.locationV": "Malibu, Kalifornien",
  "contact.work": "Arbeitserlaubnis",
  "contact.workV": "US-Staatsbürger; Praktikumsvisum für die EU möglich",
} satisfies Dict;
