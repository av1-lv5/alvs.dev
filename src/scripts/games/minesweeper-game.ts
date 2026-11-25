import {
  DEFAULT_MINE_DIFFICULTY,
  chordCell,
  createMineBoard,
  mineCellsCleared,
  mineConfig,
  mineSafeCells,
  parseMineBoard,
  remainingMines,
  revealCell,
  toggleFlag,
  type MineBoard,
} from "../../lib/games/minesweeper";
import { gridCellName, nextGridCell } from "../../lib/games/navigation";
import { element } from "./types";
import type { PuzzleAdapter, PuzzleContext } from "./puzzle-types";

/** Long enough to be deliberate, short enough not to feel stuck. */
const LONG_PRESS = 450;

type Mode = "reveal" | "flag";
type MoveKind = "reveal" | "flag" | "chord";

export class MinesweeperGame implements PuzzleAdapter {
  private board: MineBoard | null = null;
  private config = mineConfig(DEFAULT_MINE_DIFFICULTY)!;
  private mode: Mode = "reveal";
  private active = false;
  private focus = 0;
  private cells: HTMLButtonElement[];
  private marks: HTMLElement[];
  private values: HTMLElement[];
  private grid: HTMLElement;
  private minesStat: HTMLElement;
  private modeToggle: HTMLButtonElement;
  private pressTimer?: ReturnType<typeof setTimeout>;
  private pressed = -1;
  private suppressClick = false;
  private longPressFired = false;

  constructor(private context: PuzzleContext) {
    const root = context.root;
    this.grid = element(root, "[data-mine-grid]");
    this.minesStat = element(root, '[data-game-stat="0"]');
    this.modeToggle = element(root, "[data-mine-mode]");
    this.cells = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-mine-cell]"),
    );
    this.marks = this.cells.map((cell) => element(cell, "[data-mine-mark]"));
    this.values = this.cells.map((cell) => element(cell, "[data-mine-value]"));

    for (const [cell, button] of this.cells.entries()) {
      button.addEventListener("click", () => this.onClick(cell), {
        signal: context.events,
      });
      button.addEventListener(
        "pointerdown",
        (event) => this.press(cell, event),
        { signal: context.events },
      );
    }
    this.grid.addEventListener("pointerup", () => this.clearPress(), {
      signal: context.events,
    });
    this.grid.addEventListener("pointercancel", () => this.clearPress(), {
      signal: context.events,
    });
    this.grid.addEventListener("pointerleave", () => this.clearPress(), {
      signal: context.events,
    });
    this.grid.addEventListener(
      "contextmenu",
      (event) => this.contextMenu(event),
      { signal: context.events },
    );
    this.grid.addEventListener("keydown", (event) => this.key(event), {
      signal: context.events,
    });
    this.modeToggle.addEventListener(
      "click",
      () => this.setMode(this.mode === "flag" ? "reveal" : "flag"),
      { signal: context.events },
    );
  }

  prepare(difficulty: string) {
    this.config =
      mineConfig(difficulty) ?? mineConfig(DEFAULT_MINE_DIFFICULTY)!;
    this.board = createMineBoard(this.config);
    this.mode = "reveal";
    this.focus = 0;
    this.active = false;
    this.clearPress();
    this.layout();
    this.grid.removeAttribute("aria-hidden");
    this.paint();
    this.setMode(this.mode);
    this.renderStatus();
  }

  snapshot() {
    if (!this.board) return null;
    return {
      ...this.board,
      values: this.board.values ? [...this.board.values] : null,
      revealed: [...this.board.revealed],
      flagged: [...this.board.flagged],
    };
  }

  restore(challenge: unknown, difficulty: string) {
    const parsed = parseMineBoard(challenge, difficulty);
    if (!parsed) return false;
    this.board = parsed;
    this.config = {
      rows: parsed.rows,
      columns: parsed.columns,
      mines: parsed.mines,
    };
    this.mode = "reveal";
    const firstCovered = parsed.revealed.findIndex(
      (open, cell) => !open && !parsed.flagged[cell],
    );
    this.focus = firstCovered >= 0 ? firstCovered : 0;
    this.active = false;
    this.clearPress();
    this.layout();
    this.grid.removeAttribute("aria-hidden");
    this.paint();
    this.setMode(this.mode);
    this.renderStatus();
    return true;
  }

  reset(difficulty: string) {
    this.board = null;
    this.config =
      mineConfig(difficulty) ?? mineConfig(DEFAULT_MINE_DIFFICULTY)!;
    this.mode = "reveal";
    this.active = false;
    this.focus = 0;
    this.clearPress();
    this.layout();
    this.grid.setAttribute("aria-hidden", "true");
    this.paintIdle();
    this.setMode(this.mode);
    this.renderStatus();
  }

  enable() {
    this.active = true;
    this.setMode("reveal");
    this.paint();
    this.renderStatus();
    const target = this.cells[this.focus] ?? this.cells[0];
    target?.focus({ preventScroll: true });
  }

  disable() {
    this.active = false;
    this.clearPress();
    this.paint();
  }

  dispose() {
    this.disable();
  }

  private onClick(cell: number) {
    if (this.suppressClick) {
      this.suppressClick = false;
      this.longPressFired = false;
      return;
    }
    this.move(cell, this.mode);
  }

  private move(cell: number, intent: Mode) {
    if (!this.active || !this.board || this.board.status !== "playing") return;
    this.focus = cell;
    const board = this.board;

    if (board.revealed[cell]) {
      // A revealed number stays useful: activating it chords when the flags fit.
      if (!board.values || board.values[cell] <= 0) {
        this.paint();
        return;
      }
      const chording = chordCell(board, cell);
      if (chording === board) {
        this.paint();
        return;
      }
      this.context.begin();
      this.board = chording;
      this.afterMove(cell, "chord");
      return;
    }

    if (intent === "reveal" && board.flagged[cell]) {
      this.paint();
      return;
    }

    this.context.begin();
    this.board =
      intent === "flag"
        ? toggleFlag(board, cell)
        : revealCell(board, cell, Math.random);
    this.afterMove(cell, intent);
  }

  private afterMove(cell: number, kind: MoveKind) {
    const board = this.board!;
    this.paint();
    this.renderStatus();
    this.speak(cell, kind);

    if (board.status === "won") {
      this.context.finish("solved", "Every safe cell cleared.");
      return;
    }
    if (board.status === "lost") {
      const at =
        board.hit >= 0
          ? gridCellName(board.hit, board.columns)
          : gridCellName(cell, board.columns);
      this.context.finish("lost", `A mine at ${at}.`);
      return;
    }

    this.context.save();
  }

  private speak(cell: number, kind: MoveKind) {
    const board = this.board!;
    const name = gridCellName(cell, board.columns);
    if (board.status === "won") {
      this.context.announce("Every safe cell cleared.");
      return;
    }
    if (board.status === "lost") {
      const at = board.hit >= 0 ? gridCellName(board.hit, board.columns) : name;
      this.context.announce(`${at} held a mine.`);
      return;
    }
    if (kind === "flag") {
      this.context.announce(
        `${name}, ${board.flagged[cell] ? "flagged" : "unflagged"}.`,
      );
      return;
    }
    if (kind === "chord") {
      this.context.announce(
        `${mineCellsCleared(board)} of ${mineSafeCells(board)} cells cleared.`,
      );
      return;
    }
    const value = board.values?.[cell] ?? 0;
    this.context.announce(
      value > 0 ? `${name}, ${value} nearby.` : `${name}, empty.`,
    );
  }

  private press(cell: number, event: PointerEvent) {
    if (!this.active || event.pointerType === "mouse" || event.button !== 0)
      return;
    this.clearPress();
    this.suppressClick = false;
    this.longPressFired = false;
    this.pressed = cell;
    this.pressTimer = setTimeout(() => {
      this.pressTimer = undefined;
      if (this.pressed !== cell || !this.active) return;
      this.pressed = -1;
      this.suppressClick = true;
      this.longPressFired = true;
      this.move(cell, "flag");
    }, LONG_PRESS);
  }

  private clearPress() {
    if (this.pressTimer !== undefined) clearTimeout(this.pressTimer);
    this.pressTimer = undefined;
    this.pressed = -1;
  }

  private contextMenu(event: MouseEvent) {
    event.preventDefault();
    if (this.longPressFired) {
      this.longPressFired = false;
      return;
    }
    if (!this.active) return;
    const cell = this.cellAt(event.target);
    if (cell >= 0) this.move(cell, "flag");
  }

  private cellAt(target: EventTarget | null): number {
    if (!(target instanceof Element)) return -1;
    const button = target.closest<HTMLElement>("[data-mine-cell]");
    if (!button || !this.grid.contains(button)) return -1;
    return Number(button.dataset.mineCell);
  }

  private key(event: KeyboardEvent) {
    if (!this.active || !this.board) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (
      !(target instanceof HTMLButtonElement) ||
      !target.hasAttribute("data-mine-cell")
    ) {
      return;
    }
    const cell = Number(target.dataset.mineCell);
    if (event.key === "f" || event.key === "F") {
      event.preventDefault();
      this.move(cell, "flag");
      return;
    }
    const next = nextGridCell(
      cell,
      event.key,
      this.board.columns,
      this.board.rows * this.board.columns,
    );
    if (next === null) return;
    event.preventDefault();
    this.focus = next;
    this.paint();
    this.cells[next].focus({ preventScroll: true });
  }

  private setMode(mode: Mode) {
    this.mode = mode;
    // Drives the ghost flag in the board styles, so the mode shows on the
    // cells themselves and not only on the toggle.
    this.grid.dataset.mode = mode;
    this.modeToggle.setAttribute("aria-pressed", String(mode === "flag"));
  }

  private layout() {
    const { rows, columns } = this.config;
    const total = rows * columns;
    this.grid.style.setProperty("--mine-columns", String(columns));
    for (const [cell, button] of this.cells.entries()) {
      button.hidden = cell >= total;
      button.setAttribute(
        "aria-label",
        cell < total ? gridCellName(cell, columns) : "",
      );
    }
  }

  private paintIdle() {
    const total = this.config.rows * this.config.columns;
    for (const [cell, button] of this.cells.entries()) {
      button.className = "mine-cell game-cell";
      button.disabled = true;
      button.tabIndex = -1;
      if (cell >= total) continue;
      this.marks[cell].textContent = "";
      this.values[cell].textContent = "";
      button.setAttribute(
        "aria-label",
        gridCellName(cell, this.config.columns),
      );
    }
  }

  private paint() {
    if (!this.board) return;
    const board = this.board;
    const lost = board.status === "lost";
    const values = board.values;
    for (const [cell, button] of this.cells.entries()) {
      if (cell >= board.rows * board.columns) continue;
      const open = board.revealed[cell];
      const flagged = board.flagged[cell];
      const mine = lost && values?.[cell] === -1;
      const wrongFlag = lost && flagged && values?.[cell] !== -1;
      const number = open && !flagged && values ? values[cell] : 0;

      button.className = "mine-cell game-cell";
      button.classList.toggle("is-revealed", open);
      button.classList.toggle("is-flagged", flagged && !wrongFlag && !mine);
      button.classList.toggle("is-mine", mine);
      button.classList.toggle("is-wrong", wrongFlag);
      button.classList.toggle("is-hit", lost && board.hit === cell);
      button.classList.toggle("is-number", open && !flagged && number > 0);
      button.disabled = !this.active;
      button.tabIndex = this.active && cell === this.focus ? 0 : -1;

      this.marks[cell].textContent = wrongFlag
        ? "✕"
        : mine
          ? "✸"
          : flagged
            ? "⚑"
            : "";
      this.values[cell].textContent = number > 0 ? String(number) : "";

      const name = gridCellName(cell, board.columns);
      let state = "covered";
      if (wrongFlag) state = "wrong flag";
      else if (mine) state = board.hit === cell ? "mine, hit" : "mine";
      else if (flagged) state = "flagged";
      else if (open)
        state =
          number === 0
            ? "empty"
            : `${number} ${number === 1 ? "mine" : "mines"} nearby`;
      button.setAttribute("aria-label", `${name}, ${state}`);
    }
  }

  /** A lost board shows every mine, so a flag count no longer means anything. */
  private renderStatus() {
    const board = this.board;
    this.minesStat.textContent = !board
      ? String(this.config.mines)
      : board.status === "lost"
        ? "—"
        : String(remainingMines(board));
  }
}
