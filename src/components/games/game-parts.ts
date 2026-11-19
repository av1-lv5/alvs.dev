import type { GameId } from "../../lib/games/registry";
import ChimpBoard from "./boards/ChimpBoard.astro";
import NumberBoard from "./boards/NumberBoard.astro";
import OddBoard from "./boards/OddBoard.astro";
import PairsBoard from "./boards/PairsBoard.astro";
import PatternBoard from "./boards/PatternBoard.astro";
import PatternSettings from "./boards/PatternSettings.astro";
import ChimpPreview from "./previews/ChimpPreview.astro";
import NumberPreview from "./previews/NumberPreview.astro";
import OddPreview from "./previews/OddPreview.astro";
import PairsPreview from "./previews/PairsPreview.astro";
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
  pairs: {
    Board: PairsBoard,
    Settings: undefined,
    Preview: PairsPreview,
  },
  odd: {
    Board: OddBoard,
    Settings: undefined,
    Preview: OddPreview,
  },
  chimp: {
    Board: ChimpBoard,
    Settings: undefined,
    Preview: ChimpPreview,
  },
} satisfies Record<
  GameId,
  { Board: unknown; Settings: unknown; Preview: unknown }
>;
