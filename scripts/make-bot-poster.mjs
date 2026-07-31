/**
 * Draws the execution system's capstone-style poster, in both languages.
 *
 *   node scripts/make-bot-poster.mjs
 *
 * The other two posters on the site are documents Michael already had. This
 * work never had one, so it is drawn here: same 4:3 poster proportions and the
 * same section grammar (abstract, process, challenges, conclusion) as the
 * capstone posters it hangs beside, over a dark space ground rather than the
 * school's green.
 *
 * Everything is VECTOR, written as SVG and rasterised by sharp. Two reasons:
 * a poster full of stock space photography would be decoration on an
 * engineering wall, and vector keeps two more full-width posters near 200 KB
 * each instead of the 787 KB the photo-dense putter poster costs.
 *
 * The content is read from the real system (smc_bot/), not invented:
 *   ingestion/discord_source.py -> parser.py -> skip_filter.py + risk_manager.py
 *   -> sizer.py -> brokers/webull.py
 * The code excerpts are literal quotations from skip_filter.py and sizer.py.
 * The Discord panel is a SYNTHETIC alert in Discord's visual idiom, labelled as
 * an example: real alerts are another author's content and a real channel id is
 * configuration, neither of which belongs on a public page.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT = "assets-src/smc-bot";

/* Poster geometry: 4:3, matching the two capstone posters it hangs beside. */
const W = 3456;
const H = 2592;

/* ---- The space palette -------------------------------------------------- */
const C = {
  void: "#05060f",
  deep: "#0b0a1f",
  purple: "#2a1b5e",
  purpleLit: "#4c2fa8",
  blue: "#1b3a8f",
  cyan: "#38bdf8",
  ink: "#e8e9f5",
  inkMute: "#a9adcc",
  panel: "#0f1128",
  panelEdge: "#2b2f5c",
  accent: "#8b5cf6",
  green: "#34d399",
  amber: "#fbbf24",
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Wraps text to a pixel width using an average-glyph estimate. Good enough for
 * a poster: every block below is sized with slack, and German is measured with
 * the same ruler it will be drawn with.
 */
function wrap(text, maxWidth, fontSize) {
  const perChar = fontSize * 0.5;
  const max = Math.floor(maxWidth / perChar);
  const out = [];
  for (const para of String(text).split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      if (!line.length) line = word;
      else if ((line + " " + word).length <= max) line += " " + word;
      else {
        out.push(line);
        line = word;
      }
    }
    out.push(line);
  }
  return out;
}

/** Height a text block will occupy, so the next element can be placed under it. */
function blockHeight(text, width, size, lh = 1.42) {
  return wrap(text, width, size).length * size * lh;
}

function textBlock(x, y, text, { size = 34, fill = C.inkMute, width = 900, lh = 1.42 } = {}) {
  const lines = wrap(text, width, size);
  return lines
    .map(
      (l, i) =>
        `<text x="${x}" y="${y + i * size * lh}" font-family="Inter, 'Segoe UI', system-ui, sans-serif" font-size="${size}" fill="${fill}">${esc(l)}</text>`,
    )
    .join("");
}

/** A section heading in a filled capsule, the capstone posters' own device. */
function heading(x, y, w, label) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="62" rx="31"
          fill="url(#capsule)" stroke="${C.accent}" stroke-width="1.5" opacity="0.95"/>
    <text x="${x + w / 2}" y="${y + 42}" text-anchor="middle"
          font-family="Inter, 'Segoe UI', system-ui, sans-serif" font-size="34"
          font-weight="600" letter-spacing="1.5" fill="${C.ink}">${esc(label)}</text>`;
}

function panel(x, y, w, h, r = 18) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"
            fill="${C.panel}" stroke="${C.panelEdge}" stroke-width="2"/>`;
}

/** Deterministic starfield: no Math.random, so the poster rebuilds identically. */
function starfield(count) {
  let s = "";
  let seed = 20260731;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < count; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = rnd() * 2.1 + 0.35;
    const o = rnd() * 0.6 + 0.15;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${o.toFixed(2)}"/>`;
  }
  return s;
}

/* ---- The pipeline diagram ------------------------------------------------
 * Six stages, the shape of the system: an alert arrives, is read, is parsed,
 * is gated, is sized, and only then becomes an order.
 */
function pipeline(x, y, w, stages) {
  const n = stages.length;
  const gap = 26;
  const boxW = (w - gap * (n - 1)) / n;
  const boxH = 250;
  let out = "";

  stages.forEach((st, i) => {
    const bx = x + i * (boxW + gap);
    const isLast = i === n - 1;
    out += `
      <rect x="${bx}" y="${y}" width="${boxW}" height="${boxH}" rx="16"
            fill="url(#stage)" stroke="${isLast ? C.green : C.accent}" stroke-width="2.5"/>
      <circle cx="${bx + 34}" cy="${y + 36}" r="17" fill="${isLast ? C.green : C.accent}" opacity="0.22"/>
      <text x="${bx + 34}" y="${y + 46}" text-anchor="middle" font-family="'IBM Plex Mono', monospace"
            font-size="24" font-weight="700" fill="${isLast ? C.green : C.cyan}">${i + 1}</text>
      <text x="${bx + 62}" y="${y + 46}" font-family="Inter, 'Segoe UI', system-ui, sans-serif"
            font-size="30" font-weight="600" fill="${C.ink}">${esc(st.title)}</text>
      <line x1="${bx + 20}" y1="${y + 66}" x2="${bx + boxW - 20}" y2="${y + 66}"
            stroke="${C.panelEdge}" stroke-width="1.5"/>
      ${textBlock(bx + 20, y + 100, st.body, { size: 23, width: boxW - 40, fill: C.inkMute, lh: 1.36 })}
      <text x="${bx + 20}" y="${y + boxH - 20}" font-family="'IBM Plex Mono', monospace"
            font-size="20" fill="${C.cyan}" opacity="0.85">${esc(st.module)}</text>`;

    if (!isLast) {
      const ax = bx + boxW + gap / 2;
      out += `<path d="M ${ax - 9} ${y + boxH / 2 - 11} L ${ax + 9} ${y + boxH / 2} L ${ax - 9} ${y + boxH / 2 + 11} Z"
                fill="${C.accent}"/>`;
    }
  });
  return out;
}

/** A Discord-styled example alert. Synthetic, and captioned as such. */
function discordPanel(x, y, w, h, L) {
  return `
    ${panel(x, y, w, h)}
    <rect x="${x}" y="${y}" width="${w}" height="52" rx="18" fill="#1e1f36"/>
    <rect x="${x}" y="${y + 34}" width="${w}" height="18" fill="#1e1f36"/>
    <circle cx="${x + 30}" cy="${y + 26}" r="9" fill="${C.accent}"/>
    <text x="${x + 50}" y="${y + 34}" font-family="'IBM Plex Mono', monospace" font-size="22"
          fill="${C.inkMute}"># ${esc(L.discordChannel)}</text>
    <circle cx="${x + 44}" cy="${y + 104}" r="24" fill="${C.blue}"/>
    <text x="${x + 44}" y="${y + 112}" text-anchor="middle" font-family="Inter, sans-serif"
          font-size="22" font-weight="700" fill="${C.ink}">A</text>
    <text x="${x + 80}" y="${y + 98}" font-family="Inter, sans-serif" font-size="25"
          font-weight="600" fill="${C.cyan}">analyst</text>
    <text x="${x + 190}" y="${y + 98}" font-family="Inter, sans-serif" font-size="20"
          fill="${C.inkMute}">${esc(L.discordToday)}</text>
    <text x="${x + 80}" y="${y + 136}" font-family="'IBM Plex Mono', monospace" font-size="27"
          fill="${C.ink}">SPY 585c 0DTE @ 1.42</text>
    <text x="${x + 80}" y="${y + 172}" font-family="'IBM Plex Mono', monospace" font-size="27"
          fill="${C.ink}">lotto, risky, small size</text>
    <text x="${x + 24}" y="${y + h - 24}" font-family="Inter, sans-serif" font-size="21"
          fill="${C.amber}" opacity="0.9">${esc(L.discordNote)}</text>`;
}

/** A literal excerpt from the source, set as code. */
function codePanel(x, y, w, h, title, lines) {
  const body = lines
    .map(
      (l, i) =>
        `<text x="${x + 26}" y="${y + 96 + i * 32}" font-family="'IBM Plex Mono', monospace" font-size="24"
           fill="${l.trim().startsWith("#") ? C.inkMute : C.ink}" opacity="${l.trim().startsWith("#") ? 0.7 : 1}"
           xml:space="preserve">${esc(l)}</text>`,
    )
    .join("");
  return `
    ${panel(x, y, w, h)}
    <text x="${x + 26}" y="${y + 46}" font-family="'IBM Plex Mono', monospace" font-size="23"
          fill="${C.cyan}">${esc(title)}</text>
    <line x1="${x + 24}" y1="${y + 62}" x2="${x + w - 24}" y2="${y + 62}" stroke="${C.panelEdge}" stroke-width="1.5"/>
    ${body}`;
}

function figure(x, y, value, label, colour = C.cyan) {
  return `
    <text x="${x}" y="${y}" font-family="'IBM Plex Mono', monospace" font-size="66"
          font-weight="700" fill="${colour}">${esc(value)}</text>
    <text x="${x}" y="${y + 38}" font-family="Inter, sans-serif" font-size="24"
          fill="${C.inkMute}" letter-spacing="1">${esc(label)}</text>`;
}

/* Each column returns SVG and manages its own vertical cursor. */
const HEAD_H = 62;
const GAP_AFTER_HEAD = 34;
const GAP_BLOCK = 58;
const BODY = 31;

function col1(x, y, w, L) {
  let cy = y;
  let out = heading(x, cy, 400, L.h.abstract);
  cy += HEAD_H + GAP_AFTER_HEAD;
  out += textBlock(x, cy + BODY, L.abstract, { size: BODY, width: w, lh: 1.5 });
  cy += blockHeight(L.abstract, w, BODY, 1.5) + GAP_BLOCK;

  out += discordPanel(x, cy, w, 360, L);
  cy += 360 + GAP_BLOCK;

  out += heading(x, cy, 400, L.h.parser);
  cy += HEAD_H + GAP_AFTER_HEAD;
  out += textBlock(x, cy + BODY, L.parser, { size: BODY, width: w, lh: 1.5 });
  return out;
}

function col2(x, y, w, L) {
  let cy = y;
  let out = heading(x, cy, 400, L.h.safety);
  cy += HEAD_H + GAP_AFTER_HEAD;
  out += textBlock(x, cy + BODY, L.safety, { size: BODY, width: w, lh: 1.5 });
  cy += blockHeight(L.safety, w, BODY, 1.5) + GAP_BLOCK;

  out += codePanel(x, cy, w, 300, "smc_bot/skip_filter.py", [
    "_NEGATION_WORDS = {",
    '    "not", "no", "never",',
    "    \"isn't\", \"wasn't\", \"aren't\",",
    "}",
    "# tokens before the match to scan",
    "_NEGATION_WINDOW = 3",
  ]);
  cy += 300 + GAP_BLOCK;

  out += heading(x, cy, 400, L.h.sizing);
  cy += HEAD_H + GAP_AFTER_HEAD;
  out += textBlock(x, cy + BODY, L.sizing, { size: BODY, width: w, lh: 1.5 });
  cy += blockHeight(L.sizing, w, BODY, 1.5) + GAP_BLOCK;

  out += codePanel(x, cy, w, 280, "smc_bot/sizer.py", [
    "def size_position(",
    "    premium_per_contract: float,",
    "    budget_max: float = 520.0,",
    "    max_contracts: int = 50,",
    ") -> dict:",
  ]);
  return out;
}

function col3(x, y, w, L) {
  let cy = y;
  let out = heading(x, cy, 400, L.h.challenge);
  cy += HEAD_H + GAP_AFTER_HEAD;
  out += textBlock(x, cy + BODY, L.challenge, { size: BODY, width: w, lh: 1.5 });
  cy += blockHeight(L.challenge, w, BODY, 1.5) + GAP_BLOCK;

  out += heading(x, cy, 400, L.h.result);
  cy += HEAD_H + GAP_AFTER_HEAD;
  out += textBlock(x, cy + BODY, L.result, { size: BODY, width: w, lh: 1.5 });
  cy += blockHeight(L.result, w, BODY, 1.5) + GAP_BLOCK + 20;

  // The measured figures, two by two.
  out += figure(x, cy, "1553", L.f.tests);
  out += figure(x + 270, cy, "9", L.f.channels, C.accent);
  cy += 130;
  out += figure(x, cy, "27k", L.f.lines, C.accent);
  out += figure(x + 270, cy, "24/7", L.f.uptime, C.green);
  cy += 76;

  out += panel(x, cy, w, 118);
  out += `<circle cx="${x + 40}" cy="${cy + 59}" r="11" fill="${C.green}"/>
    <text x="${x + 66}" y="${cy + 52}" font-family="Inter, sans-serif" font-size="27"
          font-weight="600" fill="${C.ink}">${esc(L.liveLabel)}</text>
    <text x="${x + 66}" y="${cy + 86}" font-family="Inter, sans-serif" font-size="23"
          fill="${C.inkMute}">${esc(L.liveNote)}</text>`;
  return out;
}

function poster(L) {
  const M = 90; // page margin
  const colGap = 40;
  const colW = (W - M * 2 - colGap * 2) / 3;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="${C.void}"/>
      <stop offset="45%" stop-color="${C.deep}"/>
      <stop offset="100%" stop-color="#080716"/>
    </linearGradient>
    <radialGradient id="nebulaA" cx="0.18" cy="0.12" r="0.5">
      <stop offset="0%" stop-color="${C.purpleLit}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${C.purpleLit}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="nebulaB" cx="0.85" cy="0.3" r="0.45">
      <stop offset="0%" stop-color="${C.blue}" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="${C.blue}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="nebulaC" cx="0.6" cy="0.95" r="0.5">
      <stop offset="0%" stop-color="${C.purple}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="${C.purple}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="capsule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.purple}"/>
      <stop offset="100%" stop-color="${C.blue}"/>
    </linearGradient>
    <linearGradient id="stage" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#14153a"/>
      <stop offset="100%" stop-color="#0d0e24"/>
    </linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.accent}"/>
      <stop offset="50%" stop-color="${C.cyan}"/>
      <stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${starfield(420)}
  <rect width="${W}" height="${H}" fill="url(#nebulaA)"/>
  <rect width="${W}" height="${H}" fill="url(#nebulaB)"/>
  <rect width="${W}" height="${H}" fill="url(#nebulaC)"/>

  <!-- Masthead -->
  <text x="${W / 2}" y="${M + 96}" text-anchor="middle" font-family="Inter, 'Segoe UI', system-ui, sans-serif"
        font-size="96" font-weight="700" fill="${C.ink}" letter-spacing="-1">${esc(L.title)}</text>
  <text x="${W / 2}" y="${M + 158}" text-anchor="middle" font-family="Inter, sans-serif"
        font-size="38" fill="${C.cyan}">${esc(L.subtitle)}</text>
  <text x="${W / 2}" y="${M + 212}" text-anchor="middle" font-family="Inter, sans-serif"
        font-size="30" fill="${C.inkMute}">Michael Fischbach · ${esc(L.byline)}</text>
  <rect x="${M}" y="${M + 240}" width="${W - M * 2}" height="3" fill="url(#rule)"/>

  <!-- The pipeline, full width: the poster's real subject -->
  ${heading(M, M + 285, 470, L.h.flow)}
  ${pipeline(M, M + 370, W - M * 2, L.stages)}

  <!-- Three columns beneath. Each column is FLOWED: every element reports its
       own height and the next one starts under it, so a German block that runs
       three lines longer pushes what follows instead of colliding with it. -->
  ${col1(M, 800, colW, L)}
  ${col2(M + colW + colGap, 800, colW, L)}
  ${col3(M + (colW + colGap) * 2, 800, colW, L)}

  <text x="${M}" y="${H - 46}" font-family="Inter, sans-serif" font-size="23" fill="${C.inkMute}" opacity="0.75">${esc(L.footer)}</text>
  <text x="${W - M}" y="${H - 46}" text-anchor="end" font-family="'IBM Plex Mono', monospace"
        font-size="23" fill="${C.inkMute}" opacity="0.6">Python · SQLite · systemd</text>
</svg>`;
}

/* ---- Copy ---------------------------------------------------------------
 * The German is written to fit the same boxes, not translated phrase by
 * phrase: German runs about a third longer, and a poster has no room to grow.
 */
const EN = {
  title: "Autonomous Execution System",
  subtitle: "From a message in a chat channel to a live order, with no human in the loop",
  byline: "Python · live options execution",
  discordChannel: "alerts",
  discordToday: "today",
  discordNote: "Example in the source format. Real alerts are not reproduced.",
  liveLabel: "Options live · futures on a paper broker",
  liveNote: "Read-only telemetry; controls are not exposed to the web.",
  footer: "Architecture and implementation: Michael Fischbach",
  h: {
    flow: "The path of an alert",
    abstract: "Abstract",
    parser: "The parser",
    safety: "Safety",
    sizing: "Sizing",
    challenge: "Challenges",
    result: "Results",
  },
  stages: [
    { title: "Discord", body: "A channel is watched continuously. Every message is captured with its author, timestamp and edits.", module: "ingestion/discord_source.py" },
    { title: "Reader", body: "Messages are normalised: noise stripped, edits reconciled, replies attached to the alert they answer.", module: "ingestion/_discord_common.py" },
    { title: "Parser", body: "Prose becomes a structured order: ticker, strike, expiry, side, premium. Nine channels, nine grammars.", module: "parser.py" },
    { title: "Safety", body: "Risk language, budget gates and duplicate detection. Anything ambiguous is skipped rather than guessed.", module: "skip_filter.py · risk_manager.py" },
    { title: "Sizing", body: "Contracts are computed from a hard budget and a contract cap, never from conviction in the text.", module: "sizer.py" },
    { title: "Brokerage", body: "The order is placed and then RECONCILED: the broker's fill is the truth, not the alert.", module: "brokers/webull.py" },
  ],
  abstract:
    "A Python system that reads options alerts written in prose by people in a hurry, decides whether each one is tradeable, and executes it against a real brokerage account without a human in the loop. The design problem is not speed. It is deciding, from informal text, whether an order should exist at all, and then proving the order that resulted matches what the broker actually did.",
  parser:
    "Nine analyst channels, each with its own grammar, share one parser. The input is not a protocol: it is human writing, with abbreviations, corrections and edits after the fact. A misread strike is not a bad log line, it is a real order for the wrong contract, so every channel's rules are pinned by tests before they reach production.",
  safety:
    "Alerts carrying risk language are skipped. Detection has to survive negation: \"not risky\" and \"no longer light\" must NOT trigger a skip, so matches are checked against a window of preceding tokens. Budget gates and per-channel caps sit behind that, and anything the parser is unsure of is dropped rather than guessed at.",
  sizing:
    "Position size comes from a fixed budget and a hard contract cap, never from how confident an alert sounds. Every outcome is explicit, including the refusals: an invalid premium, a premium above budget, or a count above the cap each return a named reason rather than a silent zero.",
  challenge:
    "The parser is the hard part, but reconciliation is the subtle one. What an alert says will happen and what the broker actually fills are different facts, and only the second one is real. State is rebuilt from broker fills on every cycle, so a missed message or a partial fill cannot leave the system believing in a position it does not hold.\n\nParameters were chosen on their WORST case across two disjoint validation windows rather than their best on either, because picking the best fit is how a system that looks excellent in a backtest loses money in the market.",
  result:
    "1553 tests pass in the production suite. The options lane runs live against a funded account; the futures lane runs against a paper broker, because the brokerage API has no futures order entry. The operator dashboard is read-only telemetry.",
  f: { tests: "TESTS PASSING", channels: "CHANNELS", lines: "LINES OF PYTHON", uptime: "ON A VPS" },
};

const DE = {
  title: "Autonomes Ausführungssystem",
  subtitle: "Von der Nachricht im Chat-Kanal zur Live-Order, ohne menschlichen Eingriff",
  byline: "Python · Optionen im Live-Betrieb",
  discordChannel: "alerts",
  discordToday: "heute",
  discordNote: "Beispiel im Originalformat. Echte Meldungen werden nicht wiedergegeben.",
  liveLabel: "Optionen live · Futures über Paper-Broker",
  liveNote: "Reine Telemetrie; die Steuerung ist nicht über das Web erreichbar.",
  footer: "Architektur und Umsetzung: Michael Fischbach",
  h: {
    flow: "Der Weg einer Meldung",
    abstract: "Kurzfassung",
    parser: "Der Parser",
    safety: "Absicherung",
    sizing: "Positionsgröße",
    challenge: "Probleme",
    result: "Ergebnisse",
  },
  stages: [
    { title: "Discord", body: "Ein Kanal wird durchgehend überwacht. Jede Nachricht wird mit Autor, Zeitstempel und Änderungen erfasst.", module: "ingestion/discord_source.py" },
    { title: "Reader", body: "Nachrichten werden normalisiert: Rauschen entfernt, Änderungen abgeglichen, Antworten zugeordnet.", module: "ingestion/_discord_common.py" },
    { title: "Parser", body: "Aus Fließtext wird eine Order: Ticker, Strike, Laufzeit, Seite, Prämie. Neun Kanäle, neun Grammatiken.", module: "parser.py" },
    { title: "Absicherung", body: "Risikobegriffe, Budgetgrenzen, Dublettenprüfung. Alles Mehrdeutige wird übersprungen, nicht geraten.", module: "skip_filter.py · risk_manager.py" },
    { title: "Größe", body: "Die Stückzahl folgt einem festen Budget und einer harten Obergrenze, nie dem Ton der Meldung.", module: "sizer.py" },
    { title: "Broker", body: "Die Order geht raus und wird ABGEGLICHEN: maßgeblich ist die Ausführung des Brokers, nicht der Text.", module: "brokers/webull.py" },
  ],
  abstract:
    "Ein Python-System, das Options-Meldungen liest, die Menschen unter Zeitdruck als Fließtext schreiben, ihre Handelbarkeit prüft und sie ohne menschlichen Eingriff auf einem echten Brokerkonto ausführt. Die eigentliche Aufgabe ist nicht Geschwindigkeit. Sie besteht darin, aus formlosem Text zu entscheiden, ob eine Order überhaupt entstehen darf, und danach zu belegen, dass die entstandene Order dem entspricht, was der Broker tatsächlich getan hat.",
  parser:
    "Neun Analystenkanäle mit je eigener Grammatik teilen sich einen Parser. Die Eingabe ist kein Protokoll, sondern menschliche Schrift, mit Abkürzungen, Korrekturen und nachträglichen Änderungen. Ein falsch gelesener Strike ist keine schlechte Logzeile, sondern eine reale Order auf den falschen Kontrakt. Deshalb sichern Tests jede Kanalregel ab, bevor sie produktiv geht.",
  safety:
    "Meldungen mit Risikobegriffen werden übersprungen. Die Erkennung muss Verneinungen aushalten: „nicht riskant\" darf gerade NICHT auslösen. Dafür wird jeder Treffer gegen ein Fenster der vorangehenden Tokens geprüft. Dahinter liegen Budgetgrenzen und Obergrenzen je Kanal. Was der Parser nicht sicher liest, wird verworfen statt geraten.",
  sizing:
    "Die Positionsgröße ergibt sich aus einem festen Budget und einer harten Obergrenze, nie aus dem Nachdruck einer Meldung. Jeder Ausgang ist benannt, auch die Ablehnungen: ungültige Prämie, Prämie über Budget oder Stückzahl über der Grenze liefern jeweils einen Grund statt einer stillen Null.",
  challenge:
    "Der Parser ist der schwierige Teil, der Abgleich der subtile. Was eine Meldung ankündigt und was der Broker tatsächlich ausführt, sind zwei verschiedene Tatsachen, und nur die zweite zählt. Der Zustand wird in jedem Zyklus aus den Broker-Ausführungen neu aufgebaut. So kann eine verpasste Nachricht oder eine Teilausführung das System nicht in dem Glauben lassen, es halte eine Position, die es nicht hat.\n\nDie Parameter wurden nach ihrem SCHLECHTESTEN Ergebnis aus zwei disjunkten Validierungsfenstern gewählt, nicht nach ihrem besten. Die beste Anpassung ist der Weg, auf dem ein im Backtest hervorragendes System im Markt Geld verliert.",
  result:
    "1553 Tests laufen in der Produktivsuite durch. Die Optionen laufen live auf einem gedeckten Konto, die Futures gegen einen Paper-Broker, da die Broker-API keine Futures-Order-Eingabe bietet. Die Betriebsanzeige ist reine Telemetrie.",
  f: { tests: "TESTS BESTANDEN", channels: "KANÄLE", lines: "ZEILEN PYTHON", uptime: "AUF EINEM VPS" },
};

await mkdir(OUT, { recursive: true });

for (const [lang, L] of [
  ["en", EN],
  ["de", DE],
]) {
  const svg = poster(L);
  const out = `${OUT}/bot-poster.${lang}.png`;
  await sharp(Buffer.from(svg), { density: 96 }).png().toFile(out);
  console.log(`wrote ${out}`);
}
