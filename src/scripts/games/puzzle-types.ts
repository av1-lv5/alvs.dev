import type { GameClock } from "../../lib/games/session";
import type { GameSound } from "../../lib/games/sound";

export interface PuzzleContext {
  root: HTMLElement;
  clock: GameClock;
  sound: GameSound;
  events: AbortSignal;
  announce: (text: string) => void;
  progress: (text: string) => void;
  /** The visitor made their first move; start the clock. Repeated calls are safe. */
  begin: () => void;
  /** Save the in-progress board and elapsed time. No-op outside play. */
  save: () => void;
  /** The puzzle ended. Called once, while the board is still in play. */
  finish: (outcome: "solved" | "lost", detail: string) => void;
}

/** Puzzle games implement only their board, rules, and input. */
export interface PuzzleAdapter {
  /** A fresh board for `difficulty`. */
  prepare(difficulty: string): void;
  /** The current board, in a form `restore` can read back. */
  snapshot(): unknown;
  /** Reinstates a saved board for `difficulty`. False if it isn't valid. */
  restore(challenge: unknown, difficulty: string): boolean;
  /** Back to the idle preview for `difficulty`, with no board in play. */
  reset(difficulty: string): void;
  enable(): void;
  disable(): void;
  dispose(): void;
}
