/** A cancellable clock; cancelling also settles every pending promise. */
export class GameClock {
  private pending = new Map<
    ReturnType<typeof setTimeout>,
    (ok: boolean) => void
  >();

  wait(ms: number): Promise<boolean> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(timer);
        resolve(true);
      }, ms);
      this.pending.set(timer, resolve);
    });
  }

  cancel() {
    for (const [timer, resolve] of this.pending) {
      clearTimeout(timer);
      resolve(false);
    }
    this.pending.clear();
  }
}

/**
 * A run in progress. `done` means `level` is cleared and the next is waiting;
 * otherwise `level` is mid-round and replays from the start. `challenge`
 * belongs to the game: its adapter validates it, not `readRun`.
 */
export interface SavedRun {
  v: 1;
  level: number;
  done: boolean;
  challenge: unknown;
}

const MAX_SAVED_LEVEL = 500;

export function runStorageKey(gameId: string): string {
  return `avi:games:v1:run:${gameId}`;
}

export function readRun(
  storage: Pick<Storage, "getItem">,
  key: string,
): SavedRun | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const { v, level, done, challenge } = value as Record<string, unknown>;
    if (
      v !== 1 ||
      typeof level !== "number" ||
      !Number.isSafeInteger(level) ||
      level < 1 ||
      level > MAX_SAVED_LEVEL ||
      typeof done !== "boolean"
    ) {
      return null;
    }
    return { v, level, done, challenge };
  } catch {
    return null;
  }
}

export function saveRun(
  storage: Pick<Storage, "setItem">,
  key: string,
  run: Omit<SavedRun, "v">,
): boolean {
  try {
    storage.setItem(key, JSON.stringify({ v: 1, ...run }));
    return true;
  } catch {
    return false;
  }
}

export function clearRun(
  storage: Pick<Storage, "removeItem">,
  key: string,
): void {
  try {
    storage.removeItem(key);
  } catch {
    /* A stale record is validated again on the next read. */
  }
}

/** Storage key for a game's best completed level. */
export function bestStorageKey(gameId: string): string {
  return `avi:games:v1:best:${gameId}`;
}

export function readBest(
  storage: Pick<Storage, "getItem">,
  key: string,
): number {
  try {
    const value = Number(storage.getItem(key));
    return Number.isSafeInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveBest(
  storage: Pick<Storage, "setItem">,
  key: string,
  best: number,
) {
  try {
    storage.setItem(key, String(best));
    return true;
  } catch {
    return false;
  }
}
