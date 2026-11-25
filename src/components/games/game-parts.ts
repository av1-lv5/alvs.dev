import type { GameId } from "../../lib/games/registry";
import ChimpBoard from "./boards/ChimpBoard.astro";
import MinesweeperBoard from "./boards/MinesweeperBoard.astro";
import MinesweeperSettings from "./boards/MinesweeperSettings.astro";
import MinesweeperTools from "./boards/MinesweeperTools.astro";
import NumberBoard from "./boards/NumberBoard.astro";
import OddBoard from "./boards/OddBoard.astro";
import PairsBoard from "./boards/PairsBoard.astro";
import PatternBoard from "./boards/PatternBoard.astro";
import PatternSettings from "./boards/PatternSettings.astro";
import ShikakuBoard from "./boards/ShikakuBoard.astro";
import ShikakuSettings from "./boards/ShikakuSettings.astro";
import ChimpPreview from "./previews/ChimpPreview.astro";
import MinesweeperPreview from "./previews/MinesweeperPreview.astro";
import NumberPreview from "./previews/NumberPreview.astro";
import OddPreview from "./previews/OddPreview.astro";
import PairsPreview from "./previews/PairsPreview.astro";
import PatternPreview from "./previews/PatternPreview.astro";
import ShikakuPreview from "./previews/ShikakuPreview.astro";

/** Board, optional settings and toolbar tools, live stat labels (in order) and
 *  hub preview per game. A new GameId fails to type-check until it has an
 *  entry here. */
export const GAME_PARTS = {
  pattern: {
    Board: PatternBoard,
    Settings: PatternSettings,
    Tools: undefined,
    stats: [] as const,
    Preview: PatternPreview,
  },
  number: {
    Board: NumberBoard,
    Settings: undefined,
    Tools: undefined,
    stats: [] as const,
    Preview: NumberPreview,
  },
  pairs: {
    Board: PairsBoard,
    Settings: undefined,
    Tools: undefined,
    stats: ["Pairs", "Tries"] as const,
    Preview: PairsPreview,
  },
  odd: {
    Board: OddBoard,
    Settings: undefined,
    Tools: undefined,
    stats: [] as const,
    Preview: OddPreview,
  },
  chimp: {
    Board: ChimpBoard,
    Settings: undefined,
    Tools: undefined,
    stats: ["Tapped", "Strikes"] as const,
    Preview: ChimpPreview,
  },
  minesweeper: {
    Board: MinesweeperBoard,
    Settings: MinesweeperSettings,
    Tools: MinesweeperTools,
    stats: ["Mines"] as const,
    Preview: MinesweeperPreview,
  },
  shikaku: {
    Board: ShikakuBoard,
    Settings: ShikakuSettings,
    Tools: undefined,
    stats: ["Cells"] as const,
    Preview: ShikakuPreview,
  },
} satisfies Record<
  GameId,
  {
    Board: unknown;
    Settings: unknown;
    Tools: unknown;
    stats: readonly string[];
    Preview: unknown;
  }
>;
