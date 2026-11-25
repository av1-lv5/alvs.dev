import type { MemoryGameId } from "../../lib/games/registry";
import { ChimpGame } from "./chimp-game";
import { NumberGame } from "./number-game";
import { OddGame } from "./odd-game";
import { PairsGame } from "./pairs-game";
import { PatternGame } from "./pattern-game";
import type { GameAdapter, GameContext } from "./types";

export const GAME_ADAPTERS: Record<
  MemoryGameId,
  new (context: GameContext) => GameAdapter
> = {
  pattern: PatternGame,
  number: NumberGame,
  pairs: PairsGame,
  odd: OddGame,
  chimp: ChimpGame,
};
