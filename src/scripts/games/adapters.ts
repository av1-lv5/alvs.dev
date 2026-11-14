import type { GameId } from "../../lib/games/registry";
import { NumberGame } from "./number-game";
import { PatternGame } from "./pattern-game";
import type { GameAdapter, GameContext } from "./types";

export const GAME_ADAPTERS: Record<
  GameId,
  new (context: GameContext) => GameAdapter
> = {
  pattern: PatternGame,
  number: NumberGame,
};
