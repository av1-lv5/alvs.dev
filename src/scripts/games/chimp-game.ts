import { gridCellName, nextGridCell } from "../../lib/games/navigation";
import {
  CHIMP_CELLS,
  CHIMP_COLUMNS,
  CHIMP_STRIKES,
  createChimpChallenge,
  parseChimpChallenge,
  type ChimpChallenge,
} from "../../lib/games/rules";
import { element, type GameAdapter, type GameContext } from "./types";

/** Long enough to re-read the layout, short enough to keep a run moving. */
const STRIKE_FLASH = 900;

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export class ChimpGame implements GameAdapter {
  private challenge?: ChimpChallenge;
  private strikes = CHIMP_STRIKES;
  private tapped = 0;
  private active = false;
  private busy = false;
  private lastCell = -1;
  private cells: HTMLButtonElement[];
  private numbers: HTMLElement[];
  private grid: HTMLElement;
  private tappedStat: HTMLElement;
  private strikesStat: HTMLElement;

  constructor(private context: GameContext) {
    const root = context.root;
    this.grid = element(root, "[data-chimp-grid]");
    this.cells = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-chimp-cell]"),
    );
    this.numbers = this.cells.map((cell) =>
      element(cell, "[data-chimp-number]"),
    );
    this.tappedStat = element(root, '[data-game-stat="0"]');
    this.strikesStat = element(root, '[data-game-stat="1"]');
    for (const [cell, button] of this.cells.entries()) {
      button.addEventListener("click", () => void this.choose(cell), {
        signal: context.events,
      });
    }
    root.addEventListener("keydown", (event) => this.move(event), {
      signal: context.events,
    });
  }

  reset() {
    this.challenge = undefined;
    this.strikes = CHIMP_STRIKES;
    this.tapped = 0;
    this.active = false;
    this.busy = false;
    this.lastCell = -1;
    this.grid.setAttribute("aria-hidden", "true");
    this.grid.classList.remove("is-hidden");
    this.clearMarks();
    this.disable();
    this.paintPreview();
    this.renderStatus();
  }

  prepare(level: number) {
    this.challenge = createChimpChallenge(level, this.strikes);
    this.tapped = 0;
    this.active = false;
    this.busy = false;
    this.lastCell = -1;
    this.grid.removeAttribute("aria-hidden");
    this.clearMarks();
    this.paintChallenge();
    // The layout is only visible once the round is actually open.
    this.setHidden(true);
    this.renderStatus();
    this.disable();
  }

  snapshot() {
    return this.challenge ? { ...this.challenge, strikes: this.strikes } : null;
  }

  restore(challenge: unknown, level: number) {
    const parsed = parseChimpChallenge(challenge, level);
    if (!parsed) return false;
    this.challenge = parsed;
    this.strikes = parsed.strikes;
    this.tapped = 0;
    this.active = false;
    this.busy = false;
    this.lastCell = -1;
    this.grid.removeAttribute("aria-hidden");
    this.clearMarks();
    this.paintChallenge();
    // The welcome-back screen shows an empty board, not a free look.
    this.setHidden(true);
    this.renderStatus();
    this.disable();
    return true;
  }

  async watch() {
    if (!this.challenge) return false;
    this.disable();
    this.context.playbackAction(null);
    this.tapped = 0;
    this.busy = false;
    this.lastCell = -1;
    this.clearMarks();
    this.setHidden(true);
    this.renderStatus();
    return true;
  }

  recall() {
    if (!this.challenge) return;
    this.active = true;
    this.busy = false;
    this.tapped = 0;
    this.lastCell = -1;
    this.clearMarks();
    this.setHidden(false);
    this.renderStatus();
    for (const [index, cell] of this.cells.entries()) {
      cell.disabled = false;
      cell.tabIndex = index === 0 ? 0 : -1;
    }
    this.cells[0].focus({ preventScroll: true });
    this.context.progress("Study the grid. Tap 1 to hide the numbers.");
  }

  private async choose(cell: number) {
    if (!this.active || this.busy || !this.challenge) return;
    // A double tap on the cell just answered would otherwise count as a miss.
    if (cell === this.lastCell) return;
    const { count, positions } = this.challenge;
    const expected = this.tapped + 1;
    const expectedCell = positions[expected - 1];

    if (cell === expectedCell) {
      this.tapped = expected;
      this.lastCell = cell;
      this.context.sound.play("tile", (expected - 1) % 12);
      if (this.tapped === 1) this.setHidden(true);
      this.renderStatus();
      if (this.tapped === count) {
        this.disable();
        this.clearMarks();
        this.setHidden(false);
        this.renderStatus();
        this.context.resolve(true, `${count} numbers, in order.`);
        return;
      }
      this.context.progress(`${this.tapped} of ${count} tapped.`);
      return;
    }

    this.strikes = Math.max(0, this.strikes - 1);
    this.cells[cell].classList.add("is-wrong");
    this.cells[expectedCell].classList.add("is-expected");
    this.renderStatus();
    const location = lowerFirst(gridCellName(expectedCell, CHIMP_COLUMNS));
    const strikeWord = this.strikes === 1 ? "strike" : "strikes";
    this.context.announce(
      this.strikes === 0
        ? `Not that one. Number ${expected} is at ${location}. Out of strikes.`
        : `Not that one. Number ${expected} is at ${location}. ${this.strikes} ${strikeWord} left.`,
    );

    if (this.strikes === 0) {
      this.disable();
      this.setHidden(false);
      this.context.resolve(
        false,
        `Out of strikes at ${count} numbers. Number ${expected} was at ${location}.`,
      );
      return;
    }

    // A miss buys a short look at the layout, then the board hides again.
    this.busy = true;
    this.setHidden(false);
    this.context.progress(`Not that one. ${this.strikes} ${strikeWord} left.`);
    const flashed = await this.context.clock.wait(STRIKE_FLASH);
    if (!flashed || !this.active) return;
    this.busy = false;
    this.clearMarks();
    if (this.tapped > 0) this.setHidden(true);
    this.context.progress(
      this.tapped === 0
        ? "Study the grid. Tap 1 to hide the numbers."
        : `${this.tapped} of ${count} tapped.`,
    );
  }

  private move(event: KeyboardEvent) {
    if (!this.active || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (
      !(target instanceof HTMLButtonElement) ||
      !target.hasAttribute("data-chimp-cell")
    ) {
      return;
    }
    const next = nextGridCell(
      Number(target.dataset.chimpCell),
      event.key,
      CHIMP_COLUMNS,
      CHIMP_CELLS,
    );
    if (next === null) return;
    event.preventDefault();
    for (const [index, cell] of this.cells.entries()) {
      cell.tabIndex = index === next ? 0 : -1;
    }
    this.cells[next].focus({ preventScroll: true });
  }

  private paintPreview() {
    const preview = new Map<number, number>([
      [2, 1],
      [8, 2],
      [16, 3],
      [21, 4],
    ]);
    for (const [cell, button] of this.cells.entries()) {
      const number = preview.get(cell);
      button.classList.toggle("has-number", number !== undefined);
      this.numbers[cell].textContent = number ? String(number) : "";
      button.setAttribute("aria-label", gridCellName(cell, CHIMP_COLUMNS));
    }
  }

  private paintChallenge() {
    if (!this.challenge) return;
    const numbers = this.numberMap();
    for (const [cell, button] of this.cells.entries()) {
      const number = numbers.get(cell);
      button.classList.toggle("has-number", number !== undefined);
      this.numbers[cell].textContent = number ? String(number) : "";
    }
    this.setHidden(false);
    this.renderStatus();
  }

  private numberMap(): Map<number, number> {
    const numbers = new Map<number, number>();
    this.challenge?.positions.forEach((cell, index) =>
      numbers.set(cell, index + 1),
    );
    return numbers;
  }

  /** Hide or reveal every number, and keep the spoken labels in step. */
  private setHidden(hidden: boolean) {
    this.grid.classList.toggle("is-hidden", hidden);
    this.updateLabels(hidden);
  }

  private updateLabels(hidden: boolean) {
    if (!this.challenge) return;
    const numbers = this.numberMap();
    for (const [cell, button] of this.cells.entries()) {
      const name = gridCellName(cell, CHIMP_COLUMNS);
      if (hidden) {
        button.setAttribute("aria-label", name);
        continue;
      }
      const number = numbers.get(cell);
      button.setAttribute(
        "aria-label",
        number ? `${name}, number ${number}` : `${name}, empty`,
      );
    }
  }

  private renderStatus() {
    const count = this.challenge?.count ?? 4;
    this.tappedStat.textContent = `${this.tapped}/${count}`;
    this.strikesStat.textContent = String(this.strikes);
  }

  private clearMarks() {
    for (const cell of this.cells) {
      cell.classList.remove("is-wrong", "is-expected");
    }
  }

  disable() {
    this.active = false;
    for (const cell of this.cells) {
      cell.disabled = true;
      cell.tabIndex = -1;
    }
  }

  dispose() {
    this.disable();
  }
}
