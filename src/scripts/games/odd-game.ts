import { gridCellName, nextGridCell } from "../../lib/games/navigation";
import {
  createOddChallenge,
  oddPeekDuration,
  parseOddChallenge,
  type OddChallenge,
} from "../../lib/games/rules";
import { element, type GameAdapter, type GameContext } from "./types";

/** The board renders the largest grid once and hides the cells it doesn't need. */
const IDLE_COLUMNS = 3;

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export class OddGame implements GameAdapter {
  private challenge?: OddChallenge;
  private level = 1;
  private active = false;
  private cells: HTMLButtonElement[];
  private grid: HTMLElement;

  constructor(private context: GameContext) {
    const root = context.root;
    this.grid = element(root, "[data-odd-grid]");
    this.cells = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-odd-cell]"),
    );
    for (const [cell, button] of this.cells.entries()) {
      button.addEventListener("click", () => this.choose(cell), {
        signal: context.events,
      });
    }
    root.addEventListener("keydown", (event) => this.move(event), {
      signal: context.events,
    });
  }

  reset() {
    this.challenge = undefined;
    this.level = 1;
    this.grid.setAttribute("aria-hidden", "true");
    this.layout(IDLE_COLUMNS);
    this.clearMarks();
    this.disable();
    for (const [index, cell] of this.cells.entries()) {
      cell.classList.toggle("is-shown", index < IDLE_COLUMNS ** 2);
    }
    // A small turned mark in the middle previews the whole idea.
    this.cells[4].classList.add("is-turned");
  }

  prepare(level: number) {
    this.level = level;
    this.challenge = createOddChallenge(level);
    this.grid.removeAttribute("aria-hidden");
    this.layout(this.challenge.columns);
    this.clearMarks();
    this.disable();
  }

  snapshot() {
    return this.challenge ? { ...this.challenge } : null;
  }

  restore(challenge: unknown, level: number) {
    const parsed = parseOddChallenge(challenge, level);
    if (!parsed) return false;
    this.level = level;
    this.challenge = parsed;
    this.grid.removeAttribute("aria-hidden");
    this.layout(parsed.columns);
    this.clearMarks();
    this.disable();
    return true;
  }

  async watch() {
    if (!this.challenge) return false;
    this.disable();
    this.context.playbackAction(null);
    this.clearMarks();
    this.grid.removeAttribute("aria-hidden");
    this.layout(this.challenge.columns);
    for (const cell of this.cells) {
      if (!cell.hidden) cell.classList.add("is-shown");
    }
    const { cell, columns, rotation } = this.challenge;
    const odd = this.cells[cell];
    odd.style.setProperty("--odd-rotation", `${rotation}deg`);
    odd.classList.add("is-turned");
    // A screen reader gets the position spoken once, during the look; the
    // labels themselves never reveal it.
    this.context.announce(
      `One mark is turned at ${lowerFirst(gridCellName(cell, columns))}.`,
    );
    const seen = await this.context.clock.wait(oddPeekDuration(this.level));
    this.clearMarks();
    return seen;
  }

  recall() {
    if (!this.challenge) return;
    this.active = true;
    for (const [index, cell] of this.cells.entries()) {
      cell.disabled = cell.hidden;
      cell.tabIndex = !cell.hidden && index === 0 ? 0 : -1;
    }
    this.cells[0].focus({ preventScroll: true });
    this.context.progress(
      `${this.challenge.columns} × ${this.challenge.columns}. Which one was turned?`,
    );
  }

  private choose(cell: number) {
    if (!this.active || !this.challenge) return;
    this.active = false;
    const { cell: expected, columns, rotation } = this.challenge;
    const correct = cell === expected;
    this.disable();
    this.reveal(expected, cell, correct, rotation);
    this.context.resolve(
      correct,
      correct
        ? `It was ${lowerFirst(gridCellName(expected, columns))}.`
        : `It was ${lowerFirst(
            gridCellName(expected, columns),
          )}. You tapped ${lowerFirst(gridCellName(cell, columns))}.`,
    );
  }

  private reveal(
    expected: number,
    chosen: number,
    correct: boolean,
    rotation: number,
  ) {
    for (const cell of this.cells) {
      if (!cell.hidden) cell.classList.add("is-shown");
    }
    this.cells[expected].style.setProperty("--odd-rotation", `${rotation}deg`);
    this.cells[expected].classList.add("is-turned");
    if (correct) {
      this.cells[expected].classList.add("is-found");
    } else {
      this.cells[chosen].classList.add("is-wrong");
      this.cells[expected].classList.add("is-expected");
    }
  }

  private move(event: KeyboardEvent) {
    if (!this.active || !this.challenge) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (
      !(target instanceof HTMLButtonElement) ||
      !target.hasAttribute("data-odd-cell")
    ) {
      return;
    }
    const { columns } = this.challenge;
    const next = nextGridCell(
      Number(target.dataset.oddCell),
      event.key,
      columns,
      columns * columns,
    );
    if (next === null) return;
    event.preventDefault();
    for (const [index, cell] of this.cells.entries()) {
      if (!cell.hidden) cell.tabIndex = index === next ? 0 : -1;
    }
    this.cells[next].focus({ preventScroll: true });
  }

  /** Resize the grid and name each cell for the current column count. */
  private layout(columns: number) {
    const count = columns * columns;
    this.grid.style.setProperty("--odd-columns", String(columns));
    for (const [index, cell] of this.cells.entries()) {
      cell.hidden = index >= count;
      cell.setAttribute("aria-label", gridCellName(index, columns));
    }
  }

  private clearMarks() {
    for (const cell of this.cells) {
      cell.classList.remove(
        "is-shown",
        "is-turned",
        "is-found",
        "is-wrong",
        "is-expected",
      );
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
