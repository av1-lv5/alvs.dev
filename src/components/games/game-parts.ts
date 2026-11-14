import type { GameId } from "../../lib/games/registry";
import NumberBoard from "./boards/NumberBoard.astro";
import PatternBoard from "./boards/PatternBoard.astro";
import PatternSettings from "./boards/PatternSettings.astro";
import NumberPreview from "./previews/NumberPreview.astro";
import PatternPreview from "./previews/PatternPreview.astro";

/** Board, optional settings control and hub preview per game. A new GameId
 * fails to type-check until it has an entry here. */
export const GAME_PARTS = {
  pattern: {
    Board: PatternBoard,
    Settings: PatternSettings,
    Preview: PatternPreview,
  },
  number: {
    Board: NumberBoard,
    Settings: undefined,
    Preview: NumberPreview,
  },
} satisfies Record<
  GameId,
  { Board: unknown; Settings: unknown; Preview: unknown }
>;
