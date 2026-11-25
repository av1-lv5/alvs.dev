import { bestStorageKey, readBest, saveBest } from "./session";

/** Puzzle records are times, so best is the fastest solve per difficulty. */
const MAX_PUZZLE_TIME = 24 * 60 * 60 * 1000;

export function puzzleBestStorageKey(
  gameId: string,
  difficulty: string,
): string {
  return `${bestStorageKey(gameId)}:${difficulty}`;
}

export function readPuzzleBest(
  storage: Pick<Storage, "getItem">,
  gameId: string,
  difficulty: string,
): number {
  return readBest(storage, puzzleBestStorageKey(gameId, difficulty));
}

export function savePuzzleBest(
  storage: Pick<Storage, "setItem">,
  gameId: string,
  difficulty: string,
  time: number,
): boolean {
  return saveBest(storage, puzzleBestStorageKey(gameId, difficulty), time);
}

/** `m:ss`, with minutes growing past 59 rather than wrapping into hours.
 *  Under a minute the tenths matter, so the clock shows them: `0:02.5`. */
export function formatPuzzleTime(ms: number): string {
  const value = Math.max(0, Math.floor(ms));
  if (value < 60_000) {
    // Floor to tenths, so 59.99s reads 0:59.9 and never rounds up to 1:00.
    const tenths = Math.floor(value / 100) / 10;
    return `0:${tenths.toFixed(1).padStart(4, "0")}`;
  }
  const seconds = Math.floor(value / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * A puzzle left mid-play. The board belongs to the game: its adapter validates
 * it with the pure rules, not `readPuzzleRun`.
 */
export interface SavedPuzzleRun {
  v: 1;
  difficulty: string;
  elapsed: number;
  board: unknown;
}

export function puzzleRunStorageKey(gameId: string): string {
  return `avi:games:v1:puzzle:${gameId}`;
}

export function readPuzzleRun(
  storage: Pick<Storage, "getItem">,
  key: string,
): SavedPuzzleRun | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const { v, difficulty, elapsed, board } = value as Record<string, unknown>;
    if (
      v !== 1 ||
      typeof difficulty !== "string" ||
      difficulty.length < 1 ||
      difficulty.length > 24 ||
      typeof elapsed !== "number" ||
      !Number.isSafeInteger(elapsed) ||
      elapsed < 0 ||
      elapsed > MAX_PUZZLE_TIME ||
      !board ||
      typeof board !== "object"
    ) {
      return null;
    }
    return { v, difficulty, elapsed, board };
  } catch {
    return null;
  }
}

export function savePuzzleRun(
  storage: Pick<Storage, "setItem">,
  key: string,
  run: Omit<SavedPuzzleRun, "v">,
): boolean {
  try {
    storage.setItem(key, JSON.stringify({ v: 1, ...run }));
    return true;
  } catch {
    return false;
  }
}

export function clearPuzzleRun(
  storage: Pick<Storage, "removeItem">,
  key: string,
): void {
  try {
    storage.removeItem(key);
  } catch {
    /* A stale record is validated again on the next read. */
  }
}
