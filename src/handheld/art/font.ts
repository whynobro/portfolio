/**
 * Pocket Gallery bitmap fonts. No web font: every glyph is a hand-drawn grid
 * of 'X' (ink) and '.' (blank), drawn with fillRect so it stays crisp at any
 * integer canvas scale.
 *
 * Legibility of digits is the first requirement ("1 of 5" must never read as
 * "1 of S"), so confusable pairs are drawn to differ in SHAPE, not one pixel:
 *   0 slashed, O plain;     1 flag + full foot, l flagged stem, I serifs
 *   5 square top bar, S round;     8 round both ends, B flat left side
 *   2 round top, Z flat top;       6 curved top, b straight ascender
 *   9 closed bowl at cap height, g bowl at x-height with a descender
 *
 * Metrics (FONT): 10 rows. Row 0 is accent space (e-acute), caps and digits
 * span rows 1-7, x-height rows 3-7, descenders rows 8-9. `baseline` is the
 * row index of the first row BELOW the letters (8). `y` in drawText is the top
 * of row 0.
 *
 * FONT_SMALL is uppercase only: lowercase keys point at the same glyphs, so no
 * engine-side uppercasing is needed. Caps span rows 1-5, row 0 and row 6 hold
 * the `$` stroke and the comma tail. `baseline` is 6.
 */

export interface Glyph {
  w: number;
  rows: string[];
}

export interface BitmapFont {
  h: number;
  baseline: number;
  spacing: number;
  lineHeight: number;
  glyphs: Record<string, Glyph>;
}

/** Key of the visible fallback glyph (a box) for characters a font lacks. */
export const MISSING = "�";

type Def = [top: number, rows: string[]];
const d = (top: number, ...rows: string[]): Def => [top, rows];

function build(h: number, defs: Record<string, Def>): Record<string, Glyph> {
  const out: Record<string, Glyph> = {};
  for (const [ch, [top, rows]] of Object.entries(defs)) {
    const w = (rows[0] ?? "").length;
    const blank = ".".repeat(w);
    const full: string[] = [];
    for (let y = 0; y < h; y++) full.push(rows[y - top] ?? blank);
    out[ch] = { w, rows: full };
  }
  return out;
}

// ---------------------------------------------------------------- FONT ----

const BIG: Record<string, Def> = {
  // Space is blank; 3 wide plus spacing on both sides gives a 5 px word gap.
  " ": d(1, "...", "...", "...", "...", "...", "...", "..."),

  // ---- digits (rows 1-7)
  "0": d(1, ".XXX.", "X...X", "X..XX", "X.X.X", "XX..X", "X...X", ".XXX."),
  "1": d(1, "..X..", ".XX..", "X.X..", "..X..", "..X..", "..X..", "XXXXX"),
  "2": d(1, ".XXX.", "X...X", "....X", "...X.", "..X..", ".X...", "XXXXX"),
  "3": d(1, ".XXX.", "X...X", "....X", "..XX.", "....X", "X...X", ".XXX."),
  "4": d(1, "...X.", "..XX.", ".X.X.", "X..X.", "XXXXX", "...X.", "...X."),
  "5": d(1, "XXXXX", "X....", "XXXX.", "....X", "....X", "X...X", ".XXX."),
  "6": d(1, "..XX.", ".X...", "X....", "XXXX.", "X...X", "X...X", ".XXX."),
  "7": d(1, "XXXXX", "....X", "...X.", "..X..", "..X..", ".X...", ".X..."),
  "8": d(1, ".XXX.", "X...X", "X...X", ".XXX.", "X...X", "X...X", ".XXX."),
  "9": d(1, ".XXX.", "X...X", "X...X", ".XXXX", "....X", "...X.", ".XX.."),

  // ---- capitals (rows 1-7)
  A: d(1, ".XXX.", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"),
  B: d(1, "XXXX.", "X...X", "X...X", "XXXX.", "X...X", "X...X", "XXXX."),
  C: d(1, ".XXX.", "X...X", "X....", "X....", "X....", "X...X", ".XXX."),
  D: d(1, "XXXX.", "X...X", "X...X", "X...X", "X...X", "X...X", "XXXX."),
  E: d(1, "XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "XXXXX"),
  F: d(1, "XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "X...."),
  G: d(1, ".XXX.", "X...X", "X....", "X.XXX", "X...X", "X...X", ".XXXX"),
  H: d(1, "X...X", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"),
  I: d(1, "XXX", ".X.", ".X.", ".X.", ".X.", ".X.", "XXX"),
  J: d(1, "....X", "....X", "....X", "....X", "X...X", "X...X", ".XXX."),
  K: d(1, "X...X", "X..X.", "X.X..", "XX...", "X.X..", "X..X.", "X...X"),
  L: d(1, "X....", "X....", "X....", "X....", "X....", "X....", "XXXXX"),
  M: d(1, "XX...XX", "XX...XX", "X.X.X.X", "X.X.X.X", "X..X..X", "X.....X", "X.....X"),
  N: d(1, "X...X", "XX..X", "XX..X", "X.X.X", "X..XX", "X..XX", "X...X"),
  O: d(1, ".XXX.", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."),
  P: d(1, "XXXX.", "X...X", "X...X", "XXXX.", "X....", "X....", "X...."),
  Q: d(1, ".XXX.", "X...X", "X...X", "X...X", "X.X.X", "X..X.", ".XX.X"),
  R: d(1, "XXXX.", "X...X", "X...X", "XXXX.", "X.X..", "X..X.", "X...X"),
  S: d(1, ".XXX.", "X...X", "X....", ".XXX.", "....X", "X...X", ".XXX."),
  T: d(1, "XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "..X.."),
  U: d(1, "X...X", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."),
  V: d(1, "X...X", "X...X", "X...X", "X...X", ".X.X.", ".X.X.", "..X.."),
  W: d(1, "X.....X", "X.....X", "X.....X", "X..X..X", "X..X..X", "X.X.X.X", ".X...X."),
  X: d(1, "X...X", "X...X", ".X.X.", "..X..", ".X.X.", "X...X", "X...X"),
  Y: d(1, "X...X", "X...X", ".X.X.", "..X..", "..X..", "..X..", "..X.."),
  Z: d(1, "XXXXX", "....X", "...X.", "..X..", ".X...", "X....", "XXXXX"),

  // ---- lowercase
  a: d(3, ".XXX.", "....X", ".XXXX", "X...X", ".XXXX"),
  b: d(1, "X....", "X....", "XXXX.", "X...X", "X...X", "X...X", "XXXX."),
  c: d(3, ".XXX", "X...", "X...", "X...", ".XXX"),
  d: d(1, "....X", "....X", ".XXXX", "X...X", "X...X", "X...X", ".XXXX"),
  e: d(3, ".XXX.", "X...X", "XXXXX", "X....", ".XXXX"),
  f: d(1, ".XX", "X..", "XXX", "X..", "X..", "X..", "X.."),
  g: d(3, ".XXX.", "X...X", "X...X", "X...X", ".XXXX", "....X", ".XXX."),
  h: d(1, "X....", "X....", "XXXX.", "X...X", "X...X", "X...X", "X...X"),
  i: d(1, "X", ".", "X", "X", "X", "X", "X"),
  j: d(1, ".X", "..", ".X", ".X", ".X", ".X", ".X", ".X", "X."),
  k: d(1, "X...", "X...", "X..X", "X.X.", "XX..", "X.X.", "X..X"),
  l: d(1, "XX", ".X", ".X", ".X", ".X", ".X", ".X"),
  m: d(3, "XXX.XX.", "X..X..X", "X..X..X", "X..X..X", "X..X..X"),
  n: d(3, "XXXX.", "X...X", "X...X", "X...X", "X...X"),
  o: d(3, ".XXX.", "X...X", "X...X", "X...X", ".XXX."),
  p: d(3, "XXXX.", "X...X", "X...X", "X...X", "XXXX.", "X....", "X...."),
  q: d(3, ".XXXX", "X...X", "X...X", "X...X", ".XXXX", "....X", "....X"),
  r: d(3, "X.XX", "XX..", "X...", "X...", "X..."),
  s: d(3, ".XXX", "X...", ".XX.", "...X", "XXX."),
  t: d(2, ".X.", "XXX", ".X.", ".X.", ".X.", ".XX"),
  u: d(3, "X...X", "X...X", "X...X", "X..XX", ".XXXX"),
  v: d(3, "X...X", "X...X", "X...X", ".X.X.", "..X.."),
  w: d(3, "X.....X", "X.....X", "X..X..X", "X.X.X.X", ".X...X."),
  x: d(3, "X...X", ".X.X.", "..X..", ".X.X.", "X...X"),
  y: d(3, "X...X", "X...X", "X...X", "X..XX", ".XXXX", "....X", ".XXX."),
  z: d(3, "XXXXX", "...X.", "..X..", ".X...", "XXXXX"),

  // ---- punctuation and symbols
  "!": d(1, "X", "X", "X", "X", "X", ".", "X"),
  '"': d(1, "X.X", "X.X"),
  "#": d(1, ".X.X.", ".X.X.", "XXXXX", ".X.X.", "XXXXX", ".X.X.", ".X.X."),
  $: d(0, "..X..", ".XXXX", "X.X..", "X.X..", ".XXX.", "..X.X", "..X.X", "XXXX.", "..X.."),
  "%": d(1, "XX..X", "XX..X", "...X.", "..X..", ".X...", "X..XX", "X..XX"),
  "&": d(1, ".XX..", "X..X.", "X.X..", ".X...", "X.X.X", "X..X.", ".XX.X"),
  "'": d(1, "X", "X"),
  "(": d(1, "..X", ".X.", "X..", "X..", "X..", "X..", ".X.", "..X"),
  ")": d(1, "X..", ".X.", "..X", "..X", "..X", "..X", ".X.", "X.."),
  "*": d(2, "X.X.X", ".XXX.", "X.X.X"),
  "+": d(3, "..X..", "..X..", "XXXXX", "..X..", "..X.."),
  ",": d(7, ".X", ".X", "X."),
  "-": d(5, "XXX"),
  ".": d(7, "X"),
  "/": d(1, "...X", "...X", "..X.", "..X.", ".X..", ".X..", "X..."),
  ":": d(3, "X", ".", ".", ".", "X"),
  ";": d(3, ".X", "..", "..", "..", ".X", ".X", "X."),
  "<": d(3, "..X", ".X.", "X..", ".X.", "..X"),
  "=": d(4, "XXXXX", ".....", "XXXXX"),
  ">": d(3, "X..", ".X.", "..X", ".X.", "X.."),
  "?": d(1, ".XXX.", "X...X", "....X", "...X.", "..X..", ".....", "..X.."),
  "@": d(1, ".XXX.", "X...X", "X.XXX", "X.X.X", "X.XXX", "X....", ".XXXX"),
  "[": d(1, "XXX", "X..", "X..", "X..", "X..", "X..", "X..", "XXX"),
  "\\": d(1, "X...", ".X..", ".X..", "..X.", "..X.", "...X", "...X"),
  "]": d(1, "XXX", "..X", "..X", "..X", "..X", "..X", "..X", "XXX"),
  "^": d(1, "..X..", ".X.X.", "X...X"),
  _: d(9, "XXXXX"),
  "`": d(1, "X.", ".X"),
  "{": d(1, ".XX", ".X.", ".X.", "X..", "X..", ".X.", ".X.", ".XX"),
  "|": d(1, "X", "X", "X", "X", "X", "X", "X", "X", "X"),
  "}": d(1, "XX.", ".X.", ".X.", "..X", "..X", ".X.", ".X.", "XX."),
  "~": d(4, ".XX.X", "X.XX."),

  // ---- extras
  "↗": d(2, "..XXXX", "....XX", "...X.X", "..X..X", ".X....", "X....."), // up-right arrow
  "▼": d(3, "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."), // down triangle (more text)
  "▶": d(1, "X...", "XX..", "XXX.", "XXXX", "XXX.", "XX..", "X..."), // menu cursor
  "•": d(4, ".X.", "XXX", ".X."), // bullet
  "·": d(5, "X"), // middle dot
  "é": d(0, "...X.", "..X..", ".....", ".XXX.", "X...X", "XXXXX", "X....", ".XXXX"),
  "½": d(1, ".X....X.", "XX...X..", ".X..X...", ".X.X.XX.", "..X....X", ".X....X.", "X....XXX"),
  "×": d(3, "X...X", ".X.X.", "..X..", ".X.X.", "X...X"),
  "‘": d(1, ".X", "X.", "XX"),
  "’": d(1, "XX", ".X", "X."),
  "“": d(1, ".X..X", "X..X.", "XX.XX"),
  "”": d(1, "XX.XX", ".X..X", "X..X."),
  "…": d(7, "X.X.X"),
  [MISSING]: d(1, "XXXXX", "X...X", "X...X", "X...X", "X...X", "X...X", "XXXXX"),
};

export const FONT: BitmapFont = {
  h: 10,
  baseline: 8,
  spacing: 1,
  lineHeight: 14,
  glyphs: build(10, BIG),
};

// ---------------------------------------------------------- FONT_SMALL ----

const SMALL: Record<string, Def> = {
  " ": d(1, "..", "..", "..", "..", ".."),

  // ---- digits (4 wide, rows 1-5)
  "0": d(1, ".XX.", "X.XX", "XX.X", "X..X", ".XX."),
  "1": d(1, "..X.", ".XX.", "..X.", "..X.", ".XXX"),
  "2": d(1, ".XX.", "X..X", "..X.", ".X..", "XXXX"),
  "3": d(1, "XXX.", "...X", ".XX.", "...X", "XXX."),
  "4": d(1, "X..X", "X..X", "XXXX", "...X", "...X"),
  "5": d(1, "XXXX", "X...", "XXX.", "...X", "XXX."),
  "6": d(1, ".XX.", "X...", "XXX.", "X..X", ".XX."),
  "7": d(1, "XXXX", "...X", "..X.", ".X..", ".X.."),
  "8": d(1, ".XX.", "X..X", ".XX.", "X..X", ".XX."),
  "9": d(1, ".XX.", "X..X", ".XXX", "...X", ".XX."),

  // ---- letters (uppercase only)
  A: d(1, ".XX.", "X..X", "XXXX", "X..X", "X..X"),
  B: d(1, "XXX.", "X..X", "XXX.", "X..X", "XXX."),
  C: d(1, ".XXX", "X...", "X...", "X...", ".XXX"),
  D: d(1, "XXX.", "X..X", "X..X", "X..X", "XXX."),
  E: d(1, "XXX", "X..", "XXX", "X..", "XXX"),
  F: d(1, "XXX", "X..", "XX.", "X..", "X.."),
  G: d(1, ".XXX", "X...", "X.XX", "X..X", ".XXX"),
  H: d(1, "X..X", "X..X", "XXXX", "X..X", "X..X"),
  I: d(1, "XXX", ".X.", ".X.", ".X.", "XXX"),
  J: d(1, "..XX", "...X", "...X", "X..X", ".XX."),
  K: d(1, "X..X", "X.X.", "XX..", "X.X.", "X..X"),
  L: d(1, "X..", "X..", "X..", "X..", "XXX"),
  M: d(1, "X...X", "XX.XX", "X.X.X", "X...X", "X...X"),
  N: d(1, "X..X", "XX.X", "X.XX", "X..X", "X..X"),
  O: d(1, ".XX.", "X..X", "X..X", "X..X", ".XX."),
  P: d(1, "XXX.", "X..X", "XXX.", "X...", "X..."),
  Q: d(1, ".XX.", "X..X", "X..X", "X.XX", ".XXX"),
  R: d(1, "XXX.", "X..X", "XXX.", "X.X.", "X..X"),
  S: d(1, ".XXX", "X...", ".XX.", "...X", "XXX."),
  T: d(1, "XXX", ".X.", ".X.", ".X.", ".X."),
  U: d(1, "X..X", "X..X", "X..X", "X..X", ".XX."),
  V: d(1, "X...X", "X...X", ".X.X.", ".X.X.", "..X.."),
  W: d(1, "X...X", "X...X", "X.X.X", "XX.XX", "X...X"),
  X: d(1, "X..X", "X..X", ".XX.", "X..X", "X..X"),
  Y: d(1, "X.X", "X.X", ".X.", ".X.", ".X."),
  Z: d(1, "XXXX", "...X", "..X.", ".X..", "XXXX"),

  // ---- symbols
  "!": d(1, "X", "X", "X", ".", "X"),
  "'": d(1, "X", "X"),
  "(": d(1, ".X", "X.", "X.", "X.", ".X"),
  ")": d(1, "X.", ".X", ".X", ".X", "X."),
  "+": d(2, ".X.", "XXX", ".X."),
  ",": d(5, ".X", "X."),
  "-": d(3, "XXX"),
  ".": d(5, "X"),
  "/": d(1, "..X", "..X", ".X.", "X..", "X.."),
  ":": d(2, "X", ".", "X"),
  "=": d(2, "XXX", "...", "XXX"),
  "?": d(1, ".XX.", "X..X", "..X.", "....", "..X."),
  "&": d(1, ".XX.", "X.X.", ".XX.", "X.XX", ".XXX"),
  "%": d(1, "XX..X", "XX.X.", "..X..", ".X.XX", "X..XX"),
  $: d(0, "..X..", ".XXXX", "X.X..", ".XXX.", "..X.X", "XXXX.", "..X.."),
  "×": d(2, "X.X", ".X.", "X.X"),
  "↗": d(1, "..XXX", "...XX", "..X.X", ".X...", "X...."),
  "▼": d(2, "XXXXX", ".XXX.", "..X.."),
  "▶": d(1, "X..", "XX.", "XXX", "XX.", "X.."),
  "•": d(2, ".X.", "XXX", ".X."),
  "·": d(3, "X"),
  "’": d(1, "X", "X"),
  "…": d(5, "X.X.X"),
  [MISSING]: d(1, "XXX", "X.X", "X.X", "X.X", "XXX"),
};

function smallGlyphs(): Record<string, Glyph> {
  const g = build(7, SMALL);
  for (let c = 65; c <= 90; c++) g[String.fromCharCode(c + 32)] = g[String.fromCharCode(c)] as Glyph;
  g["é"] = g.E as Glyph;
  g["“"] = g["'"] as Glyph;
  g["”"] = g["'"] as Glyph;
  return g;
}

export const FONT_SMALL: BitmapFont = {
  h: 7,
  baseline: 6,
  spacing: 1,
  lineHeight: 9,
  glyphs: smallGlyphs(),
};

// ------------------------------------------------------------- engine ----

function glyphOf(font: BitmapFont, ch: string): Glyph {
  return font.glyphs[ch] ?? font.glyphs[MISSING] as Glyph;
}

/** Pixel width of a single line (no trailing spacing). */
export function measure(font: BitmapFont, text: string): number {
  let w = 0;
  let n = 0;
  for (const ch of text) {
    w += glyphOf(font, ch).w;
    n++;
  }
  return n === 0 ? 0 : w + (n - 1) * font.spacing;
}

/**
 * Draws one line with its top-left at (x, y), one fillRect per horizontal run
 * of ink. With `shadow`, the same pixels are first drawn 1 px right and down
 * in that colour. Returns the pen advance: measure() plus one trailing
 * spacing, so a following run can start at x + the return value.
 */
export function drawText(
  g: CanvasRenderingContext2D,
  font: BitmapFont,
  text: string,
  x: number,
  y: number,
  color: string,
  shadow?: string,
): number {
  const pass = (ox: number, oy: number, fill: string) => {
    g.fillStyle = fill;
    let pen = x + ox;
    for (const ch of text) {
      const gl = glyphOf(font, ch);
      for (let r = 0; r < gl.rows.length; r++) {
        const row = gl.rows[r] ?? "";
        let c = 0;
        while (c < gl.w) {
          if (row[c] !== "X") {
            c++;
            continue;
          }
          let e = c;
          while (e < gl.w && row[e] === "X") e++;
          g.fillRect(pen + c, y + oy + r, e - c, 1);
          c = e;
        }
      }
      pen += gl.w + font.spacing;
    }
  };
  if (shadow) pass(1, 1, shadow);
  pass(0, 0, color);
  return measure(font, text) + (text.length ? font.spacing : 0);
}

/** Greedy word wrap on spaces. "\n" forces a break; over-long words split by glyph. */
export function wrap(font: BitmapFont, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ").filter((s) => s.length > 0)) {
      const tryLine = line ? line + " " + word : word;
      if (measure(font, tryLine) <= maxWidth) {
        line = tryLine;
        continue;
      }
      if (line) lines.push(line);
      line = "";
      let rest = word;
      while (measure(font, rest) > maxWidth) {
        const chars = [...rest];
        let k = 1;
        while (k < chars.length && measure(font, chars.slice(0, k + 1).join("")) <= maxWidth) k++;
        lines.push(chars.slice(0, k).join(""));
        rest = chars.slice(k).join("");
      }
      line = rest;
    }
    lines.push(line);
  }
  return lines;
}
