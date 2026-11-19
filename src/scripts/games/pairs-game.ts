import { cardName, nextGridCell } from "../../lib/games/navigation";
import {
  PAIR_COLUMNS,
  PAIR_COUNT,
  PAIR_EMOJIS,
  createPairBoard,
  pairPeekDuration,
  pairTries,
  parsePairChallenge,
} from "../../lib/games/rules";
import { element, type GameAdapter, type GameContext } from "./types";

const CELLS = PAIR_COUNT * 2;
/** Long enough to read two faces, short enough to keep a run moving. */
const MISMATCH_PAUSE = 880;

export class PairsGame implements GameAdapter {
  private board: number[] = [];
  private matched = new Set<number>();
  private flipped: number[] = [];
  private remaining = 0;
  private level = 1;
  private active = false;
  private busy = false;
  private peeking = false;
  /** Only the first look after a new board shows the peek. */
  private peekReady = false;
  private focusIndex = 0;
  private cells: HTMLButtonElement[];
  private fronts: HTMLElement[];
  private found: HTMLElement;
  private tries: HTMLElement;

  constructor(private context: GameContext) {
    const root = context.root;
    this.found = element(root, "[data-pair-found]");
    this.tries = element(root, "[data-pair-tries]");
    this.cells = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-pair-card]"),
    );
    this.fronts = this.cells.map((cell) => element(cell, "[data-pair-front]"));
    for (const [cell, button] of this.cells.entries()) {
      button.addEventListener("click", () => void this.flip(cell), {
        signal: context.events,
      });
    }
    root.addEventListener("keydown", (event) => this.move(event), {
      signal: context.events,
    });
  }

  reset() {
    this.board = [];
    this.matched = new Set();
    this.flipped = [];
    this.remaining = 0;
    this.peekReady = false;
    this.focusIndex = 0;
    this.disable();
    this.updateStatus();
  }

  prepare(level: number) {
    this.level = level;
    this.board = createPairBoard();
    this.matched = new Set();
    this.flipped = [];
    this.remaining = pairTries(level);
    this.peekReady = true;
    this.focusIndex = 0;
    this.disable();
    this.updateStatus();
  }

  snapshot() {
    return {
      board: [...this.board],
      matched: [...this.matched].sort((a, b) => a - b),
      remaining: this.remaining,
    };
  }

  restore(challenge: unknown, level: number) {
    const saved = parsePairChallenge(challenge);
    if (!saved) return false;
    this.level = level;
    this.board = saved.board;
    this.matched = new Set(saved.matched);
    this.flipped = [];
    // A resumed board is never re-peeked, so leaving and coming back gains nothing.
    this.peekReady = false;
    this.remaining = Math.min(saved.remaining, pairTries(level));
    this.focusIndex = this.nextOpen(-1);
    this.disable();
    this.updateStatus();
    return true;
  }

  async watch() {
    this.disable();
    this.context.playbackAction(null);
    if (!this.peekReady) return true;
    this.peekReady = false;
    const duration = pairPeekDuration(this.level);
    if (duration <= 0) return true;
    this.peeking = true;
    this.paint();
    this.context.announce(`${PAIR_COUNT} pairs. Remember as many as you can.`);
    const shown = await this.context.clock.wait(duration);
    this.peeking = false;
    this.paint();
    return shown;
  }

  recall() {
    this.active = true;
    this.busy = false;
    this.flipped = [];
    this.focusIndex = this.nextOpen(-1);
    this.paint();
    this.cells[this.focusIndex].focus({ preventScroll: true });
    this.report();
  }

  private move(event: KeyboardEvent) {
    if (!this.active || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (
      !(target instanceof HTMLButtonElement) ||
      !target.hasAttribute("data-pair-card")
    ) {
      return;
    }
    const next = nextGridCell(
      Number(target.dataset.pairCard),
      event.key,
      PAIR_COLUMNS,
      CELLS,
    );
    if (next === null) return;
    event.preventDefault();
    this.focusCard(next);
  }

  private focusCard(cell: number) {
    this.focusIndex = cell;
    this.paint();
    this.cells[cell].focus({ preventScroll: true });
  }

  private async flip(cell: number) {
    if (!this.active || this.busy) return;
    if (this.matched.has(cell) || this.flipped.includes(cell)) return;

    this.focusIndex = cell;
    this.flipped.push(cell);
    this.paint();
    this.context.sound.play("tile", cell % 12);
    this.context.announce(
      `${cardName(cell)}, ${PAIR_EMOJIS[this.board[cell]]}.`,
    );
    if (this.flipped.length < 2) return;

    const [first, second] = this.flipped;
    this.remaining = Math.max(0, this.remaining - 1);
    this.updateStatus();

    if (this.board[first] === this.board[second]) {
      this.matched.add(first);
      this.matched.add(second);
      this.flipped = [];
      this.focusIndex = this.nextOpen(cell);
      this.paint();
      if (
        document.activeElement === this.cells[first] ||
        document.activeElement === this.cells[second]
      ) {
        this.cells[this.focusIndex].focus({ preventScroll: true });
      }

      if (this.matched.size === CELLS) {
        this.disable();
        this.context.resolve(
          true,
          `All ${PAIR_COUNT} pairs found with ${this.remaining} ${
            this.remaining === 1 ? "try" : "tries"
          } to spare.`,
        );
        return;
      }
      this.report();
    } else {
      this.busy = true;
      this.cells[first].classList.add("is-wrong");
      this.cells[second].classList.add("is-wrong");
      if (!(await this.context.clock.wait(MISMATCH_PAUSE))) return;
      this.flipped = [];
      this.busy = false;
      this.paint();
    }

    if (this.remaining <= 0) {
      const found = this.matched.size / 2;
      this.disable();
      this.context.resolve(
        false,
        `Out of tries with ${found} of ${PAIR_COUNT} pairs found.`,
      );
    }
  }

  private nextOpen(from: number): number {
    for (let step = 1; step <= CELLS; step += 1) {
      const cell = (from + step + CELLS) % CELLS;
      if (!this.matched.has(cell)) return cell;
    }
    return 0;
  }

  private paint() {
    for (const [cell, button] of this.cells.entries()) {
      const pair = this.board[cell];
      const known = pair !== undefined;
      const matched = this.matched.has(cell);
      const faceUp =
        known && (this.peeking || matched || this.flipped.includes(cell));

      this.fronts[cell].textContent = faceUp ? PAIR_EMOJIS[pair] : "";
      button.classList.toggle("is-face-up", faceUp);
      button.classList.toggle("is-matched", matched);
      button.classList.remove("is-wrong");
      button.disabled = !this.active;
      button.tabIndex =
        this.active && !matched && cell === this.focusIndex ? 0 : -1;
      button.setAttribute("aria-pressed", String(faceUp));
      button.setAttribute(
        "aria-label",
        `${cardName(cell)}, ${
          faceUp
            ? `${PAIR_EMOJIS[pair]}${matched ? ", matched" : ""}`
            : "face down"
        }`,
      );
    }
  }

  private updateStatus() {
    this.found.textContent = String(this.matched.size / 2);
    this.tries.textContent = this.board.length ? String(this.remaining) : "—";
  }

  private report() {
    this.updateStatus();
    this.context.progress(
      `${this.matched.size / 2} of ${PAIR_COUNT} pairs found.`,
    );
  }

  disable() {
    this.active = false;
    this.busy = false;
    this.peeking = false;
    this.flipped = [];
    this.paint();
  }

  dispose() {
    this.disable();
  }
}
