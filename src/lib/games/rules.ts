/** Pure rules: no DOM, timers, storage, or audio. Randomness is injectable. */
export function extendPattern(
  pattern: readonly number[],
  random: () => number = Math.random,
): number[] {
  return [...pattern, Math.floor(random() * 9)];
}

/** A stored pattern is only trusted if it has one tile per level. */
export function parsePattern(value: unknown, level: number): number[] | null {
  if (!Array.isArray(value) || value.length !== level) return null;
  return value.every((tile) => Number.isInteger(tile) && tile >= 0 && tile <= 8)
    ? [...value]
    : null;
}

export function checkPatternStep(
  pattern: readonly number[],
  index: number,
  tile: number,
): "wrong" | "correct" | "complete" {
  if (index < 0 || index >= pattern.length || pattern[index] !== tile) {
    return "wrong";
  }
  return index === pattern.length - 1 ? "complete" : "correct";
}

export function createNumber(
  digits: number,
  random: () => number = Math.random,
): string {
  // Strings preserve long answers without JavaScript's integer rounding.
  return Array.from({ length: digits }, (_, index) =>
    String(
      index === 0 ? 1 + Math.floor(random() * 9) : Math.floor(random() * 10),
    ),
  ).join("");
}

/** A stored number is only trusted if it has one digit per level. */
export function parseNumber(value: unknown, level: number): string | null {
  return typeof value === "string" &&
    value.length === level &&
    /^[1-9]\d*$/.test(value)
    ? value
    : null;
}

export function checkNumber(expected: string, answer: string): boolean {
  return /^\d+$/.test(answer) && expected === answer;
}

export function numberWatchDuration(digits: number): number {
  return 1600 + digits * 650;
}

/** The pairs board is a square grid; the emoji list sets how many pairs it holds. */
export const PAIR_COLUMNS = 4;

/** Emojis in pair order. Always an even cell count on the board. */
export const PAIR_EMOJIS = [
  "🍕",
  "🍓",
  "🌻",
  "🐙",
  "🦊",
  "🎸",
  "🚀",
  "🧩",
] as const;

export const PAIR_COUNT = PAIR_EMOJIS.length;

/** A board of pair indices, two of each, shuffled. */
export function createPairBoard(random: () => number = Math.random): number[] {
  const board = Array.from({ length: PAIR_COUNT * 2 }, (_, cell) =>
    Math.floor(cell / 2),
  );
  for (let index = board.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [board[index], board[swap]] = [board[swap], board[index]];
  }
  return board;
}

export function parsePairBoard(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length !== PAIR_COUNT * 2) return null;
  const counts = new Array<number>(PAIR_COUNT).fill(0);
  for (const pair of value) {
    if (!Number.isInteger(pair) || pair < 0 || pair >= PAIR_COUNT) return null;
    counts[pair] += 1;
  }
  return counts.every((count) => count === 2)
    ? (value as number[]).slice()
    : null;
}

/** A pairs round in progress: the board, the pairs already found, tries left. */
export interface PairChallenge {
  board: number[];
  matched: number[];
  remaining: number;
}

export function parsePairChallenge(value: unknown): PairChallenge | null {
  if (!value || typeof value !== "object") return null;
  const { board, matched, remaining } = value as Record<string, unknown>;
  const parsedBoard = parsePairBoard(board);
  if (!parsedBoard) return null;
  if (
    !Array.isArray(matched) ||
    !matched.every(
      (cell) => Number.isInteger(cell) && cell >= 0 && cell < PAIR_COUNT * 2,
    ) ||
    new Set(matched).size !== matched.length
  ) {
    return null;
  }
  if (
    typeof remaining !== "number" ||
    !Number.isSafeInteger(remaining) ||
    remaining < 0
  ) {
    return null;
  }
  // A saved board only makes sense when every found cell is a whole pair.
  const counts = new Map<number, number>();
  for (const cell of matched as number[]) {
    const pair = parsedBoard[cell];
    counts.set(pair, (counts.get(pair) ?? 0) + 1);
  }
  for (const count of counts.values()) if (count !== 2) return null;
  return {
    board: parsedBoard,
    matched: (matched as number[]).slice().sort((a, b) => a - b),
    remaining,
  };
}

/** Every two flipped cards is one try, whether they match or not. */
export function pairTries(level: number): number {
  return PAIR_COUNT + Math.max(6, 13 - (level - 1));
}

/** The opening look at the whole board; it shrinks with each level, then stops. */
export function pairPeekDuration(level: number): number {
  const peek = 2600 - (level - 1) * 300;
  return peek >= 700 ? peek : 0;
}
