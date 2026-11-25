/** Pure Shikaku rules: no DOM, timers, storage, or audio. Randomness is injectable. */

export const SHIKAKU_DIFFICULTIES = [
  { id: "easy", label: "Easy", rows: 5, columns: 5 },
  { id: "medium", label: "Medium", rows: 7, columns: 7 },
  { id: "hard", label: "Hard", rows: 9, columns: 9 },
] as const;

export type ShikakuDifficulty = (typeof SHIKAKU_DIFFICULTIES)[number]["id"];

export const DEFAULT_SHIKAKU_DIFFICULTY = SHIKAKU_DIFFICULTIES[0].id;

export interface ShikakuConfig {
  rows: number;
  columns: number;
}

/** Board dimensions for a difficulty; null for anything else. */
export function shikakuConfig(difficulty: string): ShikakuConfig | null {
  const entry = SHIKAKU_DIFFICULTIES.find((item) => item.id === difficulty);
  return entry ? { rows: entry.rows, columns: entry.columns } : null;
}

/** A rectangle by its top-left corner and extent. */
export interface ShikakuRect {
  top: number;
  left: number;
  height: number;
  width: number;
}

export interface ShikakuBoard extends ShikakuConfig {
  /** One value per cell: 0 for no clue, otherwise the area the clue needs. */
  clues: number[];
  /** Placed rectangles. A cell belongs to at most one. */
  rects: ShikakuRect[];
}

/** A generated puzzle, with the partition it was built from. */
export interface ShikakuPuzzle extends ShikakuConfig {
  clues: number[];
  solution: ShikakuRect[];
}

export function rectArea(rect: ShikakuRect): number {
  return rect.height * rect.width;
}

export function sameRect(a: ShikakuRect, b: ShikakuRect): boolean {
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.height === b.height &&
    a.width === b.width
  );
}

function rectInBounds(rect: ShikakuRect, config: ShikakuConfig): boolean {
  return (
    Number.isInteger(rect.top) &&
    Number.isInteger(rect.left) &&
    Number.isInteger(rect.height) &&
    Number.isInteger(rect.width) &&
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.height >= 1 &&
    rect.width >= 1 &&
    rect.top + rect.height <= config.rows &&
    rect.left + rect.width <= config.columns
  );
}

function rectsOverlap(a: ShikakuRect, b: ShikakuRect): boolean {
  return (
    a.left < b.left + b.width &&
    b.left < a.left + a.width &&
    a.top < b.top + b.height &&
    b.top < a.top + a.height
  );
}

/** The rectangle between two cells, inclusive. */
export function rectBetween(
  anchor: number,
  focus: number,
  columns: number,
): ShikakuRect {
  const anchorRow = Math.floor(anchor / columns);
  const anchorColumn = anchor % columns;
  const focusRow = Math.floor(focus / columns);
  const focusColumn = focus % columns;
  return {
    top: Math.min(anchorRow, focusRow),
    left: Math.min(anchorColumn, focusColumn),
    height: Math.abs(anchorRow - focusRow) + 1,
    width: Math.abs(anchorColumn - focusColumn) + 1,
  };
}

/** The placed rectangle containing `cell`, or -1. */
export function rectAt(board: ShikakuBoard, cell: number): number {
  const row = Math.floor(cell / board.columns);
  const column = cell % board.columns;
  return board.rects.findIndex(
    (rect) =>
      row >= rect.top &&
      row < rect.top + rect.height &&
      column >= rect.left &&
      column < rect.left + rect.width,
  );
}

export function cellAt(
  board: ShikakuBoard,
  row: number,
  column: number,
): number {
  return row * board.columns + column;
}

export interface RectCheck {
  area: number;
  clueCount: number;
  /** The single clue inside, or 0 when the rectangle holds none or several. */
  clue: number;
}

export function checkRect(board: ShikakuBoard, rect: ShikakuRect): RectCheck {
  const area = rectArea(rect);
  let clueCount = 0;
  let clue = 0;
  for (let row = rect.top; row < rect.top + rect.height; row += 1) {
    for (let column = rect.left; column < rect.left + rect.width; column += 1) {
      const value = board.clues[cellAt(board, row, column)];
      if (value > 0) {
        clueCount += 1;
        clue = value;
      }
    }
  }
  return { area, clueCount, clue: clueCount === 1 ? clue : 0 };
}

export type RectProblem = "ok" | "area" | "none" | "multiple";

/** A rectangle is valid when it holds exactly one clue and its area matches. */
export function rectProblem(
  board: ShikakuBoard,
  rect: ShikakuRect,
): RectProblem {
  const { area, clueCount, clue } = checkRect(board, rect);
  if (clueCount === 0) return "none";
  if (clueCount > 1) return "multiple";
  return area === clue ? "ok" : "area";
}

/**
 * Places a rectangle, dropping every rectangle it overlaps. Placing the same
 * rectangle again, with nothing else in the way, changes nothing.
 */
export function placeRect(
  board: ShikakuBoard,
  rect: ShikakuRect,
): ShikakuBoard {
  const placed = { ...rect };
  if (!rectInBounds(placed, board)) return board;
  const identical = board.rects.find((existing) => sameRect(existing, placed));
  if (identical) {
    const others = board.rects.filter((existing) => existing !== identical);
    if (!others.some((existing) => rectsOverlap(existing, placed))) {
      return board;
    }
  }
  const kept = board.rects.filter(
    (existing) => !rectsOverlap(existing, placed),
  );
  return { ...board, rects: [...kept, placed] };
}

export function removeRectAt(board: ShikakuBoard, cell: number): ShikakuBoard {
  const index = rectAt(board, cell);
  if (index < 0) return board;
  return {
    ...board,
    rects: board.rects.filter((_, position) => position !== index),
  };
}

export function coveredCount(board: ShikakuBoard): number {
  return board.rects.reduce((total, rect) => total + rectArea(rect), 0);
}

export function clueCount(board: ShikakuBoard): number {
  return board.clues.reduce((total, value) => total + (value > 0 ? 1 : 0), 0);
}

/** Every cell covered once, and every rectangle valid. */
export function isSolved(board: ShikakuBoard): boolean {
  const total = board.rows * board.columns;
  const coverage = new Uint8Array(total);
  for (const rect of board.rects) {
    if (!rectInBounds(rect, board)) return false;
    if (rectProblem(board, rect) !== "ok") return false;
    for (let row = rect.top; row < rect.top + rect.height; row += 1) {
      for (
        let column = rect.left;
        column < rect.left + rect.width;
        column += 1
      ) {
        const cell = cellAt(board, row, column);
        if (coverage[cell]) return false;
        coverage[cell] = 1;
      }
    }
  }
  return coverage.every((cell) => cell === 1);
}

export function createShikakuBoard(puzzle: ShikakuPuzzle): ShikakuBoard {
  return {
    rows: puzzle.rows,
    columns: puzzle.columns,
    clues: [...puzzle.clues],
    rects: [],
  };
}

/* ---------------------------------------------------------------- generator */

/** Every `height × width` with the given area, both orientations included. */
const factorPairsCache = new Map<number, Array<[number, number]>>();

function factorPairs(area: number): Array<[number, number]> {
  const cached = factorPairsCache.get(area);
  if (cached) return cached;
  const pairs: Array<[number, number]> = [];
  for (let height = 1; height <= area; height += 1) {
    if (area % height !== 0) continue;
    pairs.push([height, area / height]);
  }
  factorPairsCache.set(area, pairs);
  return pairs;
}

const SOLVER_NODE_LIMIT = 12000;
const GENERATION_ATTEMPTS = 240;
const CLUE_ATTEMPTS = 5;

interface ClueCell {
  cell: number;
  row: number;
  column: number;
  value: number;
}

/**
 * Counts solutions, stopping at `limit`. Any partition of the grid into
 * clue-sized rectangles counts, not only the generated one.
 */
export function countShikakuSolutions(board: ShikakuBoard, limit = 2): number {
  const { rows, columns } = board;
  const total = rows * columns;
  const clues: ClueCell[] = [];
  for (let cell = 0; cell < total; cell += 1) {
    const value = board.clues[cell] ?? 0;
    if (value <= 0) continue;
    clues.push({
      cell,
      row: Math.floor(cell / columns),
      column: cell % columns,
      value,
    });
  }
  if (clues.length === 0) return 0;
  if (clues.reduce((sum, clue) => sum + clue.value, 0) !== total) return 0;

  const clueAt = new Int16Array(total).fill(-1);
  for (const [index, clue] of clues.entries()) clueAt[clue.cell] = index;

  const covered = new Uint8Array(total);
  const used = new Uint8Array(clues.length);
  let solutions = 0;
  let nodes = 0;

  const fits = (
    top: number,
    left: number,
    height: number,
    width: number,
    clueIndex: number,
  ): boolean => {
    for (let row = top; row < top + height; row += 1) {
      for (let column = left; column < left + width; column += 1) {
        const cell = row * columns + column;
        if (covered[cell]) return false;
        const other = clueAt[cell];
        if (other >= 0 && other !== clueIndex) return false;
      }
    }
    return true;
  };

  const paint = (
    top: number,
    left: number,
    height: number,
    width: number,
    value: number,
  ): void => {
    for (let row = top; row < top + height; row += 1) {
      for (let column = left; column < left + width; column += 1) {
        covered[row * columns + column] = value;
      }
    }
  };

  const search = (): void => {
    if (solutions >= limit || nodes > SOLVER_NODE_LIMIT) return;
    let target = -1;
    for (let cell = 0; cell < total; cell += 1) {
      if (!covered[cell]) {
        target = cell;
        break;
      }
    }
    if (target < 0) {
      solutions += 1;
      return;
    }
    nodes += 1;
    const targetRow = Math.floor(target / columns);
    const targetColumn = target % columns;

    for (let index = 0; index < clues.length; index += 1) {
      if (used[index]) continue;
      const clue = clues[index];
      for (const [height, width] of factorPairs(clue.value)) {
        if (height > rows || width > columns) continue;
        const topMin = Math.max(
          0,
          clue.row - height + 1,
          targetRow - height + 1,
        );
        const topMax = Math.min(clue.row, targetRow, rows - height);
        const leftMin = Math.max(
          0,
          clue.column - width + 1,
          targetColumn - width + 1,
        );
        const leftMax = Math.min(clue.column, targetColumn, columns - width);
        for (let top = topMin; top <= topMax; top += 1) {
          for (let left = leftMin; left <= leftMax; left += 1) {
            if (!fits(top, left, height, width, index)) continue;
            paint(top, left, height, width, 1);
            used[index] = 1;
            search();
            paint(top, left, height, width, 0);
            used[index] = 0;
            if (solutions >= limit || nodes > SOLVER_NODE_LIMIT) return;
          }
        }
      }
    }
  };

  search();
  return solutions;
}

interface Cut {
  vertical: boolean;
  at: number;
}

/** Cuts that leave both halves at least two cells, so no 1×1 appears. */
function cutsFor(rect: ShikakuRect): Cut[] {
  const cuts: Cut[] = [];
  for (let at = 1; at < rect.height; at += 1) {
    if (at * rect.width < 2) continue;
    if ((rect.height - at) * rect.width < 2) continue;
    cuts.push({ vertical: false, at });
  }
  for (let at = 1; at < rect.width; at += 1) {
    if (at * rect.height < 2) continue;
    if ((rect.width - at) * rect.height < 2) continue;
    cuts.push({ vertical: true, at });
  }
  return cuts;
}

function splitRect(rect: ShikakuRect, cut: Cut): [ShikakuRect, ShikakuRect] {
  if (cut.vertical) {
    return [
      { ...rect, width: cut.at },
      { ...rect, left: rect.left + cut.at, width: rect.width - cut.at },
    ];
  }
  return [
    { ...rect, height: cut.at },
    { ...rect, top: rect.top + cut.at, height: rect.height - cut.at },
  ];
}

/** Random guillotine partition into varied rectangles, almost never 1×1. */
export function randomPartition(
  config: ShikakuConfig,
  random: () => number,
): ShikakuRect[] {
  const total = config.rows * config.columns;
  const target = Math.max(3, Math.min(24, Math.round(total / 5)));
  const rects: ShikakuRect[] = [
    { top: 0, left: 0, height: config.rows, width: config.columns },
  ];

  while (rects.length < target) {
    const options: number[] = [];
    for (const [index, rect] of rects.entries()) {
      if (cutsFor(rect).length > 0) options.push(index);
      // A 2-cell rectangle may split into two singletons, rarely.
      else if (rectArea(rect) === 2 && random() < 0.05) options.push(index);
    }
    if (options.length === 0) break;
    const index = options[Math.floor(random() * options.length)] ?? options[0];
    const rect = rects[index];
    let cuts = cutsFor(rect);
    if (cuts.length === 0) {
      cuts = [{ vertical: rect.width > 1, at: 1 }];
    }
    const cut = cuts[Math.floor(random() * cuts.length)] ?? cuts[0];
    const [first, second] = splitRect(rect, cut);
    rects.splice(index, 1, first, second);
  }
  return rects;
}

function placeClues(
  rects: ShikakuRect[],
  config: ShikakuConfig,
  random: () => number,
): number[] {
  const clues = Array.from({ length: config.rows * config.columns }, () => 0);
  for (const rect of rects) {
    const row = rect.top + Math.floor(random() * rect.height);
    const column = rect.left + Math.floor(random() * rect.width);
    clues[row * config.columns + column] = rectArea(rect);
  }
  return clues;
}

/**
 * Generates a puzzle with exactly one solution, retrying with fresh partitions
 * and clue positions until the solver agrees. Work is bounded; the last
 * attempt is returned if the budget runs out.
 */
export function generateShikaku(
  config: ShikakuConfig,
  random: () => number = Math.random,
): ShikakuPuzzle {
  let last: ShikakuPuzzle | null = null;
  for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt += 1) {
    const rects = randomPartition(config, random);
    for (let clueAttempt = 0; clueAttempt < CLUE_ATTEMPTS; clueAttempt += 1) {
      const clues = placeClues(rects, config, random);
      const puzzle: ShikakuPuzzle = {
        rows: config.rows,
        columns: config.columns,
        clues,
        solution: rects,
      };
      last = puzzle;
      const probe: ShikakuBoard = {
        rows: config.rows,
        columns: config.columns,
        clues,
        rects: [],
      };
      if (countShikakuSolutions(probe, 2) === 1) return puzzle;
    }
  }
  if (!last) {
    // A 1-cell grid has no valid partition; keep types honest for callers.
    last = {
      rows: config.rows,
      columns: config.columns,
      clues: Array.from({ length: config.rows * config.columns }, () => 1),
      solution: [],
    };
  }
  return last;
}

/* ------------------------------------------------------------------ parsing */

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

/** A stored board is trusted only when its clues and rectangles agree. */
export function parseShikakuBoard(
  value: unknown,
  difficulty: string,
): ShikakuBoard | null {
  const config = shikakuConfig(difficulty);
  if (!config || !value || typeof value !== "object") return null;
  const { rows, columns, clues, rects } = value as Record<string, unknown>;
  if (rows !== config.rows || columns !== config.columns) return null;
  const total = config.rows * config.columns;

  if (!Array.isArray(clues) || clues.length !== total) return null;
  let clueSum = 0;
  for (const item of clues) {
    if (!isInteger(item) || item < 0 || item > total) return null;
    clueSum += item;
  }
  if (clueSum !== total) return null;

  if (!Array.isArray(rects) || rects.length > total) return null;
  const coverage = new Uint8Array(total);
  const parsed: ShikakuRect[] = [];
  for (const item of rects) {
    if (!item || typeof item !== "object") return null;
    const { top, left, height, width } = item as Record<string, unknown>;
    if (!isInteger(top) || !isInteger(left)) return null;
    if (!isInteger(height) || !isInteger(width)) return null;
    if (height < 1 || width < 1) return null;
    if (top < 0 || left < 0) return null;
    if (top + height > config.rows || left + width > config.columns) {
      return null;
    }
    for (let row = top; row < top + height; row += 1) {
      for (let column = left; column < left + width; column += 1) {
        const cell = row * config.columns + column;
        if (coverage[cell]) return null;
        coverage[cell] = 1;
      }
    }
    parsed.push({ top, left, height, width });
  }

  return {
    rows: config.rows,
    columns: config.columns,
    clues: [...clues],
    rects: parsed,
  };
}
