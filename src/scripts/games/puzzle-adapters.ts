import type { PuzzleGameId } from "../../lib/games/registry";
import { MinesweeperGame } from "./minesweeper-game";
import { ShikakuGame } from "./shikaku-game";
import type { PuzzleAdapter, PuzzleContext } from "./puzzle-types";

/** Puzzle IDs only: a new `kind: "puzzle"` game fails to type-check until it
 * has an adapter here. Memory adapters live in `adapters.ts`. */
export const PUZZLE_ADAPTERS: Record<
  PuzzleGameId,
  new (context: PuzzleContext) => PuzzleAdapter
> = {
  minesweeper: MinesweeperGame,
  shikaku: ShikakuGame,
};
