/**
 * Proves the tic-tac-toe engine cannot be beaten.
 *
 *   node scripts/verify-tictactoe.mjs
 *
 * The site claims the machine is unbeatable. That is a testable claim, so it is
 * tested rather than asserted: play out EVERY possible game against it — the
 * human trying all legal moves at every turn, both as first and second player —
 * and assert the machine never loses.
 *
 * The engine is duplicated here rather than imported because the source is
 * TypeScript and this runs as plain node. scripts/verify-tictactoe.test asserts
 * the two stay in step by comparing chosen moves across random positions.
 */

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const AI = "O";
const HUMAN = "X";

function winner(b) {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}
const isFull = (b) => b.every(Boolean);

function minimax(b, turn, depth, alpha, beta) {
  const w = winner(b);
  if (w) return w === AI ? 10 - depth : depth - 10;
  if (isFull(b)) return 0;

  if (turn === AI) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = AI;
      best = Math.max(best, minimax(b, HUMAN, depth + 1, alpha, beta));
      b[i] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
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

function bestMove(b, turn) {
  let bestScore = turn === AI ? -Infinity : Infinity;
  let choice = -1;
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = turn;
    const s = minimax(b, turn === AI ? HUMAN : AI, 0, -Infinity, Infinity);
    b[i] = null;
    if (turn === AI ? s > bestScore : s < bestScore) {
      bestScore = s;
      choice = i;
    }
  }
  return choice;
}

let games = 0;
let humanWins = 0;
let aiWins = 0;
let draws = 0;

/** Exhaustively explore every human choice; the machine always plays its best. */
function play(board, turn) {
  const w = winner(board);
  if (w) {
    games++;
    if (w === HUMAN) humanWins++;
    else aiWins++;
    return;
  }
  if (isFull(board)) {
    games++;
    draws++;
    return;
  }

  if (turn === AI) {
    const i = bestMove(board, AI);
    board[i] = AI;
    play(board, HUMAN);
    board[i] = null;
    return;
  }

  // The human tries every legal square.
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    board[i] = HUMAN;
    play(board, AI);
    board[i] = null;
  }
}

for (const first of [HUMAN, AI]) {
  const label = first === HUMAN ? "human moves first" : "machine moves first";
  games = humanWins = aiWins = draws = 0;
  const t0 = Date.now();
  play(Array(9).fill(null), first);
  console.log(
    `${label.padEnd(20)} games:${String(games).padStart(6)}  ` +
      `machine:${String(aiWins).padStart(5)}  draws:${String(draws).padStart(5)}  ` +
      `human:${humanWins}   (${Date.now() - t0}ms)`,
  );
  if (humanWins > 0) {
    console.error(`\nFAIL — the machine lost ${humanWins} game(s). It is not unbeatable.`);
    process.exit(1);
  }
}

console.log("\nPASS — the machine never loses under exhaustive play.");
