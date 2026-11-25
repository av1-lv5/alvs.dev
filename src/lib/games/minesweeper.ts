/** Pure Minesweeper rules: no DOM, timers, storage, or audio. Randomness is injectable. */

export const MINE_DIFFICULTIES = [
  { id: "easy", label: "Easy", rows: 9, columns: 9, mines: 10 },
  { id: "medium", label: "Medium", rows: 12, columns: 12, mines: 24 },
  { id: "hard", label: "Hard", rows: 16, columns: 16, mines: 40 },
] as const;

export type MineDifficulty = (typeof MINE_DIFFICULTIES)[number]["id"];

export const DEFAULT_MINE_DIFFICULTY = MINE_DIFFICULTIES[0].id;

export interface MineConfig {
  rows: number;
  columns: number;
  mines: number;
}

/** Board dimensions for a difficulty; null for anything else. */
export function mineConfig(difficulty: string): MineConfig | null {
  const entry = MINE_DIFFICULTIES.find((item) => item.id === difficulty);
  return entry
    ? { rows: entry.rows, columns: entry.columns, mines: entry.mines }
    : null;
}

export type MineStatus = "playing" | "won" | "lost";

export interface MineBoard extends MineConfig {
  /** null until the first reveal places the mines. -1 is a mine. */
  values: number[] | null;
  revealed: boolean[];
  flagged: boolean[];
  status: MineStatus;
  /** The mine that ended the game, or -1. */
  hit: number;
}

/** Cells touching `cell`, without wrapping at the grid edges. */
export function mineNeighbours(
  cell: number,
  rows: number,
  columns: number,
): number[] {
  const row = Math.floor(cell / columns);
  const column = cell % columns;
  const neighbours: number[] = [];
  for (
    let nextRow = Math.max(0, row - 1);
    nextRow <= Math.min(rows - 1, row + 1);
    nextRow += 1
  ) {
    for (
      let nextColumn = Math.max(0, column - 1);
      nextColumn <= Math.min(columns - 1, column + 1);
      nextColumn += 1
    ) {
      const index = nextRow * columns + nextColumn;
      if (index !== cell) neighbours.push(index);
    }
  }
  return neighbours;
}

export function createMineBoard(config: MineConfig): MineBoard {
  const total = config.rows * config.columns;
  return {
    rows: config.rows,
    columns: config.columns,
    mines: config.mines,
    values: null,
    revealed: Array.from({ length: total }, () => false),
    flagged: Array.from({ length: total }, () => false),
    status: "playing",
    hit: -1,
  };
}

function copyBoard(board: MineBoard): MineBoard {
  return {
    ...board,
    values: board.values ? [...board.values] : null,
    revealed: [...board.revealed],
    flagged: [...board.flagged],
  };
}

/** Places mines so `safeCell` and every cell touching it stay clear. */
export function placeMines(
  board: MineBoard,
  safeCell: number,
  random: () => number = Math.random,
): MineBoard {
  const total = board.rows * board.columns;
  const blocked = new Set([
    safeCell,
    ...mineNeighbours(safeCell, board.rows, board.columns),
  ]);
  const candidates: number[] = [];
  for (let cell = 0; cell < total; cell += 1) {
    if (!blocked.has(cell)) candidates.push(cell);
  }
  if (candidates.length < board.mines) {
    throw new Error("Not enough cells for a safe opening");
  }
  for (let index = 0; index < board.mines; index += 1) {
    const remaining = candidates.length - index;
    const offset = Math.min(remaining - 1, Math.floor(random() * remaining));
    const swap = index + offset;
    [candidates[index], candidates[swap]] = [
      candidates[swap],
      candidates[index],
    ];
  }
  const mineCells = new Set(candidates.slice(0, board.mines));
  const values = Array.from({ length: total }, (_, cell) =>
    mineCells.has(cell)
      ? -1
      : mineNeighbours(cell, board.rows, board.columns).filter((neighbour) =>
          mineCells.has(neighbour),
        ).length,
  );
  return { ...board, values };
}

/** Reveals `cell`. The first reveal places the mines, keeping that cell and its neighbours safe. */
export function revealCell(
  board: MineBoard,
  cell: number,
  random: () => number = Math.random,
): MineBoard {
  if (board.status !== "playing") return board;
  const total = board.rows * board.columns;
  if (!Number.isInteger(cell) || cell < 0 || cell >= total) return board;
  if (board.revealed[cell] || board.flagged[cell]) return board;
  const placed = board.values ? board : placeMines(board, cell, random);
  return openCells(placed, [cell]);
}

/** Flags or unflags an unrevealed cell. */
export function toggleFlag(board: MineBoard, cell: number): MineBoard {
  if (board.status !== "playing") return board;
  if (!Number.isInteger(cell) || cell < 0 || cell >= board.revealed.length)
    return board;
  if (board.revealed[cell]) return board;
  const next = copyBoard(board);
  next.flagged[cell] = !next.flagged[cell];
  return next;
}

/**
 * Activating a revealed number whose flag count matches reveals the rest of
 * its neighbours. A wrong flag is found the hard way.
 */
export function chordCell(board: MineBoard, cell: number): MineBoard {
  if (board.status !== "playing" || !board.values) return board;
  if (!Number.isInteger(cell) || cell < 0 || cell >= board.revealed.length)
    return board;
  if (!board.revealed[cell]) return board;
  const value = board.values[cell];
  if (value <= 0) return board;
  const around = mineNeighbours(cell, board.rows, board.columns);
  const flags = around.filter((neighbour) => board.flagged[neighbour]).length;
  if (flags !== value) return board;
  const targets = around.filter(
    (neighbour) => !board.flagged[neighbour] && !board.revealed[neighbour],
  );
  if (targets.length === 0) return board;
  return openCells(board, targets);
}

export function remainingMines(board: MineBoard): number {
  return board.mines - board.flagged.filter(Boolean).length;
}

export function mineSafeCells(board: MineBoard): number {
  return board.rows * board.columns - board.mines;
}

export function mineCellsCleared(board: MineBoard): number {
  return board.revealed.filter(Boolean).length;
}

/** Opens cells in order; a zero spreads to its neighbours, flags block the spread. */
function openCells(board: MineBoard, starts: number[]): MineBoard {
  const next = copyBoard(board);
  const queue = [...starts];
  const seen = new Set<number>();
  let hit = -1;

  while (queue.length > 0) {
    const cell = queue.pop()!;
    if (seen.has(cell)) continue;
    seen.add(cell);
    if (next.revealed[cell] || next.flagged[cell]) continue;
    if (next.values![cell] === -1) {
      hit = cell;
      break;
    }
    next.revealed[cell] = true;
    if (next.values![cell] === 0) {
      for (const neighbour of mineNeighbours(cell, next.rows, next.columns)) {
        if (!next.revealed[neighbour] && !seen.has(neighbour)) {
          queue.push(neighbour);
        }
      }
    }
  }

  if (hit >= 0) return { ...next, status: "lost", hit };
  return settleWin(next);
}

function settleWin(board: MineBoard): MineBoard {
  const total = board.rows * board.columns;
  if (board.revealed.filter(Boolean).length !== total - board.mines) {
    return board;
  }
  // Every safe cell is open, so anything flagged but unopened is a mine.
  const flagged = board.flagged.map(
    (flag, cell) => flag || board.values![cell] === -1,
  );
  return { ...board, flagged, status: "won" };
}

function isBooleanBoard(value: unknown, total: number): value is boolean[] {
  return (
    Array.isArray(value) &&
    value.length === total &&
    value.every((item) => typeof item === "boolean")
  );
}

/** A stored board is trusted only when its shape, counts, and state agree. */
export function parseMineBoard(
  value: unknown,
  difficulty: string,
): MineBoard | null {
  const config = mineConfig(difficulty);
  if (!config || !value || typeof value !== "object") return null;
  const { rows, columns, mines, values, revealed, flagged, status, hit } =
    value as Record<string, unknown>;
  if (
    rows !== config.rows ||
    columns !== config.columns ||
    mines !== config.mines
  ) {
    return null;
  }
  const total = config.rows * config.columns;
  if (!isBooleanBoard(revealed, total) || !isBooleanBoard(flagged, total)) {
    return null;
  }
  if (revealed.some((open, cell) => open && flagged[cell])) return null;
  if (status !== "playing" && status !== "won" && status !== "lost") {
    return null;
  }
  if (
    typeof hit !== "number" ||
    !Number.isInteger(hit) ||
    hit < -1 ||
    hit >= total
  ) {
    return null;
  }

  if (values === null) {
    if (status !== "playing" || hit !== -1) return null;
    if (revealed.some(Boolean)) return null;
    return {
      ...config,
      values: null,
      revealed: [...revealed],
      flagged: [...flagged],
      status,
      hit,
    };
  }

  if (!Array.isArray(values) || values.length !== total) return null;
  let minesSeen = 0;
  for (const item of values) {
    if (!Number.isInteger(item) || item < -1 || item > 8) return null;
    if (item === -1) minesSeen += 1;
  }
  if (minesSeen !== config.mines) return null;
  if (status === "lost" && (hit < 0 || values[hit] !== -1)) return null;
  if (status !== "lost" && hit !== -1) return null;
  // A board in play or won cannot have an open mine.
  if (status !== "lost") {
    for (let cell = 0; cell < total; cell += 1) {
      if (revealed[cell] && values[cell] === -1) return null;
    }
  }
  if (status === "won") {
    const safeOpen = values.reduce<number>(
      (count, value, cell) => count + (value !== -1 && revealed[cell] ? 1 : 0),
      0,
    );
    if (safeOpen !== total - config.mines) return null;
  }

  return {
    ...config,
    values: [...values],
    revealed: [...revealed],
    flagged: [...flagged],
    status: status as MineStatus,
    hit,
  };
}
