import {
  checkPatternStep,
  extendPattern,
  parsePattern,
} from "../../lib/games/rules";
import { element, type GameAdapter, type GameContext } from "./types";
import { nextPatternTile, tileName } from "../../lib/games/navigation";

export class PatternGame implements GameAdapter {
  private pattern: number[] = [];
  private index = 0;
  private active = false;
  private tiles: HTMLButtonElement[];
  private pulses = new Map<number, number>();
  private mode: HTMLInputElement;
  private continuePlayback?: (continuePlayback: boolean) => void;

  constructor(private context: GameContext) {
    this.mode = element(context.root, "[data-paced]");
    this.tiles = Array.from(
      context.root.querySelectorAll<HTMLButtonElement>("[data-tile]"),
    );
    for (const [index, tile] of this.tiles.entries()) {
      tile.addEventListener("click", () => this.choose(index), {
        signal: context.events,
      });
      tile.addEventListener("focus", () => this.focusTile(index, false), {
        signal: context.events,
      });
    }
    context.root.addEventListener(
      "keydown",
      (event) => {
        if (!this.active || event.ctrlKey || event.metaKey || event.altKey)
          return;
        // No number shortcuts: the tiles are unnumbered, and a number would
        // make the pattern easier to hold.
        const target = event.target;
        if (
          target instanceof HTMLButtonElement &&
          target.hasAttribute("data-tile")
        ) {
          const next = nextPatternTile(Number(target.dataset.tile), event.key);
          if (next !== null) {
            event.preventDefault();
            this.focusTile(next);
          }
        }
      },
      { signal: context.events },
    );
  }

  reset() {
    this.pattern = [];
    this.disable();
  }

  prepare() {
    this.pattern = extendPattern(this.pattern);
    this.index = 0;
    this.disable();
  }

  snapshot() {
    return [...this.pattern];
  }

  restore(challenge: unknown, level: number) {
    const pattern = parsePattern(challenge, level);
    if (!pattern) return false;
    this.pattern = pattern;
    this.index = 0;
    this.disable();
    return true;
  }

  async watch() {
    this.index = 0;
    this.disable();
    if (this.mode.checked) return this.watchPaced();
    this.context.playbackAction(null);
    if (!(await this.context.clock.wait(550))) return false;
    for (const tile of this.pattern) {
      this.tiles[tile].classList.add("is-lit");
      this.context.announce(`${tileName(tile)}.`);
      this.context.sound.play("tile", tile);
      // Keep a readable minimum cadence, including with reduced motion.
      if (!(await this.context.clock.wait(540))) return false;
      this.tiles[tile].classList.remove("is-lit");
      if (!(await this.context.clock.wait(260))) return false;
    }
    return true;
  }

  private async watchPaced() {
    for (const [index, tile] of this.pattern.entries()) {
      this.tiles[tile].classList.add("is-lit");
      this.context.progress(`Step ${index + 1} of ${this.pattern.length}`);
      this.context.playbackAction(
        index === this.pattern.length - 1 ? "Start my turn" : "Next tile",
      );
      this.context.sound.play("tile", tile);
      if (
        !(await new Promise<boolean>((resolve) => {
          this.continuePlayback = resolve;
        }))
      )
        return false;
      this.tiles[tile].classList.remove("is-lit");
    }
    return true;
  }

  advance() {
    const advance = this.continuePlayback;
    this.continuePlayback = undefined;
    advance?.(true);
  }

  private focusTile(index: number, moveFocus = true) {
    for (const [tileIndex, tile] of this.tiles.entries()) {
      tile.tabIndex = tileIndex === index ? 0 : -1;
    }
    if (moveFocus) this.tiles[index].focus({ preventScroll: true });
  }

  recall() {
    this.active = true;
    for (const tile of this.tiles) tile.disabled = false;
    this.focusTile(0);
    this.context.progress(`0 of ${this.pattern.length} tiles`);
  }

  private choose(tile: number) {
    if (!this.active) return;
    this.focusTile(tile, false);
    const outcome = checkPatternStep(this.pattern, this.index, tile);
    if (outcome === "wrong") {
      const expected = this.pattern[this.index];
      this.disable();
      this.tiles[tile].classList.add("is-wrong");
      this.tiles[expected].classList.add("is-expected");
      this.context.resolve(
        false,
        `Step ${this.index + 1} of ${this.pattern.length}: the outlined tile was next (${tileName(expected).toLowerCase()}).`,
      );
      return;
    }
    this.context.sound.play("tile", tile);
    this.index++;
    if (outcome === "complete") {
      this.disable();
      this.context.resolve(true, `Level ${this.pattern.length} complete.`);
      return;
    }
    const pulse = (this.pulses.get(tile) ?? 0) + 1;
    this.pulses.set(tile, pulse);
    this.tiles[tile].classList.add("is-lit");
    void this.context.clock.wait(140).then((ok) => {
      if (ok && this.pulses.get(tile) === pulse)
        this.tiles[tile].classList.remove("is-lit");
    });
    this.context.progress(`${this.index} of ${this.pattern.length} tiles`);
  }

  disable() {
    this.active = false;
    this.continuePlayback?.(false);
    this.continuePlayback = undefined;
    for (const tile of this.tiles) {
      tile.disabled = true;
      tile.tabIndex = -1;
      tile.classList.remove("is-lit", "is-wrong", "is-expected");
    }
  }

  dispose() {
    this.disable();
  }
}
