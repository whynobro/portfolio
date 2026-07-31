import type { SceneContext, SceneFactory, SceneModule } from "../types";
import { subscribe, unsubscribe } from "../../lib/raf";

/**
 * Unbeatable tic-tac-toe.
 *
 * Minimax with alpha-beta pruning over the full game tree. Tic-tac-toe is small
 * enough (at most 9! = 362,880 orderings, far fewer after pruning) to search
 * exhaustively, so the machine plays perfectly: it cannot lose, and the best
 * result available to an opponent is a draw. That claim is tested exhaustively
 * in scripts/verify-tictactoe.mjs rather than merely asserted here.
 *
 * Depth is folded into the score so the machine prefers a win in fewer moves
 * and a loss in more. Without that it plays "lazily", it sees a forced win as
 * equal whether it takes two moves or five, which looks like a bug to anyone
 * watching.
 *
 * Rendered as real <button>s rather than canvas so the board is keyboard
 * playable and screen-reader legible.
 */

type Player = "X" | "O";
type Cell = Player | null;
type Board = Cell[];

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

/** The machine is O; a human visitor plays X. */
const AI: Player = "O";
const HUMAN: Player = "X";

export function winner(b: Board): { player: Player; line: number[] } | null {
  for (const line of LINES) {
    const [a, c, d] = line as [number, number, number];
    const v = b[a];
    if (v && v === b[c] && v === b[d]) return { player: v, line };
  }
  return null;
}

export function isFull(b: Board): boolean {
  return b.every((c) => c !== null);
}

/**
 * Score a position from the machine's point of view.
 * +10 - depth for a machine win, depth - 10 for a loss, 0 for a draw.
 */
function minimax(b: Board, turn: Player, depth: number, alpha: number, beta: number): number {
  const w = winner(b);
  if (w) return w.player === AI ? 10 - depth : depth - 10;
  if (isFull(b)) return 0;

  if (turn === AI) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = AI;
      best = Math.max(best, minimax(b, HUMAN, depth + 1, alpha, beta));
      b[i] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break; // this branch cannot improve on one already found
    }
    return best;
  }

  let best = Infinity;
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = HUMAN;
    best = Math.min(best, minimax(b, AI, depth + 1, alpha, beta));
    b[i] = null;
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

/** The machine's move. Exported so the verification script can drive it. */
export function bestMove(b: Board, turn: Player = AI): number {
  let bestScore = turn === AI ? -Infinity : Infinity;
  let choice = -1;
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = turn;
    const score = minimax(b, turn === AI ? HUMAN : AI, 0, -Infinity, Infinity);
    b[i] = null;
    if (turn === AI ? score > bestScore : score < bestScore) {
      bestScore = score;
      choice = i;
    }
  }
  return choice;
}

const SVG_NS = "http://www.w3.org/2000/svg";

function mark(kind: Player): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("ttt__mark", kind === "X" ? "ttt__mark--x" : "ttt__mark--o");

  if (kind === "X") {
    for (const d of ["M22 22 L78 78", "M78 22 L22 78"]) {
      const p = document.createElementNS(SVG_NS, "path");
      p.setAttribute("d", d);
      svg.appendChild(p);
    }
  } else {
    const c = document.createElementNS(SVG_NS, "circle");
    c.setAttribute("cx", "50");
    c.setAttribute("cy", "50");
    c.setAttribute("r", "27");
    svg.appendChild(c);
  }
  return svg;
}

function createScene(): SceneModule {
  let root: HTMLElement | null = null;
  let board: Board = Array(9).fill(null);
  let cells: HTMLButtonElement[] = [];
  let statusEl: HTMLElement | null = null;
  let t: (k: never) => string = () => "";
  let demo = true; // plays itself until the visitor takes a square
  let busy = false;
  let timer = 0;
  let tick: ((dt: number) => void) | null = null;
  let elapsed = 0;
  let reduced = false;

  const say = (key: string) => {
    if (statusEl) statusEl.textContent = (t as unknown as (k: string) => string)(key);
  };

  function paint(): void {
    const w = winner(board);
    cells.forEach((btn, i) => {
      const v = board[i];
      btn.replaceChildren(v ? mark(v) : document.createTextNode(""));
      btn.disabled = v !== null || busy;
      btn.setAttribute(
        "aria-label",
        `${Math.floor(i / 3) + 1}, ${(i % 3) + 1}${v ? `: ${v}` : ""}`,
      );
      btn.classList.toggle("is-win", !!w && w.line.includes(i));
    });
  }

  function reset(startDemo: boolean): void {
    board = Array(9).fill(null);
    busy = false;
    demo = startDemo;
    paint();
    say(demo ? "game.ttt.status.demo" : "game.ttt.status.yourTurn");
  }

  function finish(): boolean {
    const w = winner(board);
    if (w) {
      say(w.player === AI ? "game.ttt.status.aiWins" : "game.ttt.status.draw");
      paint();
      return true;
    }
    if (isFull(board)) {
      say("game.ttt.status.draw");
      paint();
      return true;
    }
    return false;
  }

  function aiMove(): void {
    const i = bestMove(board, AI);
    if (i >= 0) board[i] = AI;
    paint();
    if (!finish()) say(demo ? "game.ttt.status.demo" : "game.ttt.status.yourTurn");
  }

  function onPick(i: number): void {
    if (busy || board[i]) return;

    // First human touch ends the self-play demo and restarts cleanly, so the
    // visitor never inherits a half-played position.
    if (demo) {
      demo = false;
      board = Array(9).fill(null);
    }

    board[i] = HUMAN;
    paint();
    if (finish()) return;

    busy = true;
    say("game.ttt.status.thinking");
    paint();

    // A brief pause before replying: an instant answer reads as a lookup table
    // rather than a search. Skipped under reduced motion.
    window.clearTimeout(timer);
    timer = window.setTimeout(
      () => {
        busy = false;
        aiMove();
      },
      reduced ? 0 : 340,
    );
  }

  return {
    mount(sc: SceneContext) {
      root = sc.root;
      t = sc.t as unknown as (k: never) => string;
      reduced = sc.reducedMotion;

      const wrap = document.createElement("div");
      wrap.className = "ttt";

      const grid = document.createElement("div");
      grid.className = "ttt__grid";
      grid.setAttribute("role", "group");
      grid.setAttribute("aria-label", "Tic-tac-toe board");

      cells = Array.from({ length: 9 }, (_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ttt__cell";
        b.addEventListener("click", () => onPick(i));
        grid.appendChild(b);
        return b;
      });

      const bar = document.createElement("div");
      bar.className = "ttt__bar";

      statusEl = document.createElement("p");
      statusEl.className = "ttt__status";
      // Announced to screen readers without stealing focus.
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", "polite");

      const again = document.createElement("button");
      again.type = "button";
      again.className = "ttt__reset";
      again.textContent = (t as unknown as (k: string) => string)("game.ttt.reset");
      again.addEventListener("click", () => reset(false));

      bar.append(statusEl, again);
      wrap.append(grid, bar);
      sc.root.appendChild(wrap);

      reset(true);

      if (!sc.reducedMotion) {
        // Self-play loop: a move every ~1.1s, restarting a couple of seconds
        // after each game ends.
        tick = (dt) => {
          if (!demo || busy) return;
          elapsed += dt;
          if (elapsed < 1.1) return;
          elapsed = 0;
          if (winner(board) || isFull(board)) reset(true);
          else {
            const turn: Player = board.filter(Boolean).length % 2 === 0 ? HUMAN : AI;
            const i = bestMove(board, turn);
            if (i >= 0) board[i] = turn;
            paint();
            finish();
          }
        };
        if (!subscribe(tick)) tick = null;
      }

      sc.root.dataset["ready"] = "1";
    },

    renderStatic() {
      // A finished, legible position for the screenshot loop and for
      // reduced-motion visitors: a drawn game, which is the honest outcome.
      demo = false;
      board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
      paint();
      say("game.ttt.status.draw");
    },

    dispose() {
      if (tick) unsubscribe(tick);
      tick = null;
      window.clearTimeout(timer);
      root?.replaceChildren();
      cells = [];
      statusEl = null;
      root = null;
    },
  };
}

const factory: SceneFactory = createScene;
export default factory;
