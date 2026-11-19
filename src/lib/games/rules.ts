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

/** Odd one out: one mark in a square grid is turned a few degrees off upright. */
export interface OddChallenge {
  columns: number;
  cell: number;
  rotation: number;
}

/** Grid width per level: 3×3, then 4×4, then 5×5 for the rest. */
export function oddGridColumns(level: number): number {
  if (level <= 2) return 3;
  if (level <= 5) return 4;
  return 5;
}

export function createOddChallenge(
  level: number,
  random: () => number = Math.random,
): OddChallenge {
  const columns = oddGridColumns(level);
  return {
    columns,
    cell: Math.floor(random() * columns * columns),
    // Far enough from upright to read at a glance, never a half turn.
    rotation: 24 + random() * 32,
  };
}

/** A stored challenge is only trusted if its grid and mark fit the level. */
export function parseOddChallenge(
  value: unknown,
  level: number,
): OddChallenge | null {
  if (!value || typeof value !== "object") return null;
  const { columns, cell, rotation } = value as Record<string, unknown>;
  const expected = oddGridColumns(level);
  if (columns !== expected) return null;
  if (
    typeof cell !== "number" ||
    !Number.isInteger(cell) ||
    cell < 0 ||
    cell >= expected * expected
  ) {
    return null;
  }
  if (
    typeof rotation !== "number" ||
    !Number.isFinite(rotation) ||
    rotation < 10 ||
    rotation > 80
  ) {
    return null;
  }
  return { columns, cell, rotation };
}

/** The look shrinks every level, down to a floor that stays readable at 5×5. */
export function oddPeekDuration(level: number): number {
  return Math.max(900, 2400 - (level - 1) * 170);
}

/** Chimp test: numbers 1..N scattered in a square grid, hidden after the first tap. */
export const CHIMP_COLUMNS = 5;
export const CHIMP_CELLS = CHIMP_COLUMNS * CHIMP_COLUMNS;
export const CHIMP_STRIKES = 3;

export interface ChimpChallenge {
  count: number;
  /** The cell holding number 1, then number 2, and so on. */
  positions: number[];
  /** Strikes left when the round started. */
  strikes: number;
}

/** Level 1 places four numbers; every level adds one until the grid is full. */
export function chimpNumberCount(level: number): number {
  return Math.min(CHIMP_CELLS, level + 3);
}

export function createChimpChallenge(
  level: number,
  strikes: number,
  random: () => number = Math.random,
): ChimpChallenge {
  const count = chimpNumberCount(level);
  const cells = Array.from({ length: CHIMP_CELLS }, (_, cell) => cell);
  // Shuffling the whole board and taking the front keeps positions unique.
  for (let index = cells.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [cells[index], cells[swap]] = [cells[swap], cells[index]];
  }
  return { count, positions: cells.slice(0, count), strikes };
}

export function parseChimpChallenge(
  value: unknown,
  level: number,
): ChimpChallenge | null {
  if (!value || typeof value !== "object") return null;
  const { count, positions, strikes } = value as Record<string, unknown>;
  if (count !== chimpNumberCount(level)) return null;
  if (!Array.isArray(positions) || positions.length !== count) return null;
  const seen = new Set<number>();
  for (const cell of positions) {
    if (
      typeof cell !== "number" ||
      !Number.isInteger(cell) ||
      cell < 0 ||
      cell >= CHIMP_CELLS ||
      seen.has(cell)
    ) {
      return null;
    }
    seen.add(cell);
  }
  if (
    typeof strikes !== "number" ||
    !Number.isInteger(strikes) ||
    strikes < 1 ||
    strikes > CHIMP_STRIKES
  ) {
    return null;
  }
  return { count, positions: (positions as number[]).slice(), strikes };
}
