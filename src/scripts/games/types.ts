import type { GameClock } from "../../lib/games/session";
import type { GameSound } from "../../lib/games/sound";

export interface GameContext {
  root: HTMLElement;
  clock: GameClock;
  sound: GameSound;
  events: AbortSignal;
  announce: (text: string) => void;
  progress: (text: string) => void;
  playbackAction: (label: string | null) => void;
  resolve: (correct: boolean, detail: string) => void;
}

/** New games implement only their own board, rules, and watch/recall behavior. */
export interface GameAdapter {
  reset(): void;
  prepare(level: number): void;
  /** The current challenge, in a form `restore` can read back. */
  snapshot(): unknown;
  /** Reinstates a saved challenge for `level`. False if it isn't valid. */
  restore(challenge: unknown, level: number): boolean;
  watch(): Promise<boolean>;
  advance?(): void;
  recall(): void;
  disable(): void;
  dispose(): void;
}

export function element<T extends HTMLElement = HTMLElement>(
  root: HTMLElement,
  selector: string,
): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Missing game element: ${selector}`);
  return found;
}
