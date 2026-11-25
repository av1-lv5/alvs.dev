import {
  DEFAULT_SHIKAKU_DIFFICULTY,
  cellAt,
  checkRect,
  coveredCount,
  createShikakuBoard,
  generateShikaku,
  isSolved,
  parseShikakuBoard,
  placeRect,
  rectArea,
  rectAt,
  rectBetween,
  rectProblem,
  removeRectAt,
  shikakuConfig,
  type ShikakuBoard,
  type ShikakuConfig,
  type ShikakuRect,
} from "../../lib/games/shikaku";
import { gridCellName, nextGridCell } from "../../lib/games/navigation";
import { element } from "./types";
import type { PuzzleAdapter, PuzzleContext } from "./puzzle-types";

/** The idle board is a small solved example, always the same per size. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export class ShikakuGame implements PuzzleAdapter {
  private board: ShikakuBoard | null = null;
  private config: ShikakuConfig = shikakuConfig(DEFAULT_SHIKAKU_DIFFICULTY) ?? {
    rows: 5,
    columns: 5,
  };
  private active = false;
  private focus = 0;
  /** Keyboard corner; -1 when no rectangle is being drawn. */
  private anchor = -1;
  private dragStart = -1;
  private dragCell = -1;
  private dragging = false;
  private dragMoved = false;
  private pointerId = -1;
  private readonly cells: HTMLButtonElement[];
  private readonly clues: HTMLElement[];
  private readonly grid: HTMLElement;
  private readonly draft: HTMLElement;
  private readonly coveredStat: HTMLElement;
  private readonly sizeLabel: HTMLElement;

  constructor(private context: PuzzleContext) {
    const root = context.root;
    this.grid = element(root, "[data-shikaku-grid]");
    this.coveredStat = element(root, '[data-game-stat="0"]');
    this.sizeLabel = element(root, "[data-shikaku-size]");
    this.cells = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-shikaku-cell]"),
    );
    this.clues = this.cells.map((cell) => element(cell, "[data-shikaku-clue]"));

    this.draft = document.createElement("div");
    this.draft.className = "shikaku-rect shikaku-draft";
    this.draft.dataset.shikakuDraft = "";
    this.draft.setAttribute("aria-hidden", "true");
    this.draft.hidden = true;
    this.grid.append(this.draft);

    this.grid.addEventListener(
      "pointerdown",
      (event) => this.pointerDown(event),
      { signal: context.events },
    );
    this.grid.addEventListener(
      "pointermove",
      (event) => this.pointerMove(event),
      { signal: context.events },
    );
    this.grid.addEventListener("pointerup", (event) => this.pointerUp(event), {
      signal: context.events,
    });
    this.grid.addEventListener("pointercancel", () => this.cancelDrag(), {
      signal: context.events,
    });
    this.grid.addEventListener("lostpointercapture", () => this.cancelDrag(), {
      signal: context.events,
    });
    this.grid.addEventListener("keydown", (event) => this.key(event), {
      signal: context.events,
    });
  }

  prepare(difficulty: string) {
    this.config = shikakuConfig(difficulty) ??
      shikakuConfig(DEFAULT_SHIKAKU_DIFFICULTY) ?? { rows: 5, columns: 5 };
    this.board = createShikakuBoard(generateShikaku(this.config, Math.random));
    this.active = false;
    this.focus = 0;
    this.resetDraft();
    this.layout();
    this.grid.removeAttribute("aria-hidden");
    this.paint();
    this.renderStatus();
  }

  snapshot() {
    if (!this.board) return null;
    return {
      ...this.board,
      clues: [...this.board.clues],
      rects: this.board.rects.map((rect) => ({ ...rect })),
    };
  }

  restore(challenge: unknown, difficulty: string) {
    const parsed = parseShikakuBoard(challenge, difficulty);
    if (!parsed) return false;
    this.board = parsed;
    this.config = { rows: parsed.rows, columns: parsed.columns };
    this.active = false;
    this.resetDraft();
    const firstCovered = parsed.clues.findIndex(
      (clue, cell) => clue > 0 && rectAt(parsed, cell) < 0,
    );
    this.focus = firstCovered >= 0 ? firstCovered : 0;
    this.layout();
    this.grid.removeAttribute("aria-hidden");
    this.paint();
    this.renderStatus();
    return true;
  }

  reset(difficulty: string) {
    this.board = null;
    this.config = shikakuConfig(difficulty) ??
      shikakuConfig(DEFAULT_SHIKAKU_DIFFICULTY) ?? { rows: 5, columns: 5 };
    this.active = false;
    this.focus = 0;
    this.resetDraft();
    this.layout();
    this.grid.setAttribute("aria-hidden", "true");
    this.paintIdle();
    this.renderStatus();
  }

  enable() {
    this.active = true;
    this.paint();
    this.cells[this.focus]?.focus({ preventScroll: true });
  }

  disable() {
    this.active = false;
    this.cancelDrag();
    this.anchor = -1;
    this.paint();
  }

  dispose() {
    this.disable();
  }

  /* ---------------------------------------------------------------- pointer */

  private pointerDown(event: PointerEvent) {
    if (!this.active || !this.board) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (this.dragging) return;
    const cell = this.cellFromTarget(event.target);
    if (cell < 0) return;
    event.preventDefault();
    this.anchor = -1;
    this.dragStart = cell;
    this.dragCell = cell;
    this.dragMoved = false;
    this.dragging = true;
    this.pointerId = event.pointerId;
    this.focus = cell;
    try {
      this.grid.setPointerCapture(event.pointerId);
    } catch {
      /* Capture is an enhancement; the grid still receives events. */
    }
    this.renderDraft();
  }

  private pointerMove(event: PointerEvent) {
    if (!this.dragging || event.pointerId !== this.pointerId) return;
    const cell = this.cellFromPoint(event.clientX, event.clientY);
    if (cell < 0 || cell === this.dragCell) return;
    if (cell !== this.dragStart) this.dragMoved = true;
    this.dragCell = cell;
    this.focus = cell;
    this.renderDraft();
  }

  private pointerUp(event: PointerEvent) {
    if (!this.dragging || event.pointerId !== this.pointerId) return;
    const board = this.board;
    const start = this.dragStart;
    const released = this.cellFromPoint(event.clientX, event.clientY);
    const end = released >= 0 ? released : this.dragCell;
    const moved = this.dragMoved || end !== start;
    this.resetDraft();
    if (!board) return;

    if (!moved) {
      if (rectAt(board, start) >= 0) this.removeAt(start);
      else
        this.commit({
          top: Math.floor(start / board.columns),
          left: start % board.columns,
          height: 1,
          width: 1,
        });
      return;
    }
    this.commit(rectBetween(start, end, board.columns));
  }

  private cancelDrag() {
    if (!this.dragging) return;
    this.resetDraft();
  }

  private resetDraft() {
    this.dragging = false;
    this.dragStart = -1;
    this.dragCell = -1;
    this.dragMoved = false;
    if (this.pointerId >= 0) {
      try {
        if (this.grid.hasPointerCapture(this.pointerId)) {
          this.grid.releasePointerCapture(this.pointerId);
        }
      } catch {
        /* The capture may already be gone. */
      }
      this.pointerId = -1;
    }
    this.draft.hidden = true;
    this.renderSize(null);
  }

  private cellFromTarget(target: EventTarget | null): number {
    if (!(target instanceof Element)) return -1;
    const button = target.closest<HTMLElement>("[data-shikaku-cell]");
    if (!button || !this.grid.contains(button)) return -1;
    return Number(button.dataset.shikakuCell);
  }

  private cellFromPoint(x: number, y: number): number {
    const target = document.elementFromPoint(x, y);
    return this.cellFromTarget(target);
  }

  /* ---------------------------------------------------------------- moves */

  private commit(rect: ShikakuRect) {
    if (!this.active || !this.board) return;
    const next = placeRect(this.board, rect);
    if (next === this.board) return;
    this.context.begin();
    this.board = next;
    this.anchor = -1;
    this.focus = cellAt(next, rect.top, rect.left);
    this.paint();
    this.renderStatus();
    this.announceRect(next, rect);
    if (isSolved(next)) {
      this.context.finish(
        "solved",
        `${next.rects.length} rectangles cover every cell.`,
      );
      return;
    }
    this.context.save();
  }

  private removeAt(cell: number) {
    if (!this.active || !this.board) return;
    const next = removeRectAt(this.board, cell);
    if (next === this.board) {
      this.context.announce(`${this.name(cell)}, no rectangle to remove.`);
      return;
    }
    this.context.begin();
    this.board = next;
    this.paint();
    this.renderStatus();
    this.context.announce(`${this.name(cell)}, rectangle removed.`);
    this.context.save();
  }

  private announceRect(board: ShikakuBoard, rect: ShikakuRect) {
    const area = rectArea(rect);
    const size = `${rect.height} by ${rect.width}`;
    const count = `${area} ${area === 1 ? "cell" : "cells"}`;
    const problem = rectProblem(board, rect);
    const { clueCount, clue } = checkRect(board, rect);
    if (problem === "none") {
      this.context.announce(`${size}, ${count}, no clue inside.`);
    } else if (clueCount > 1) {
      this.context.announce(`${size}, ${count}, ${clueCount} clues inside.`);
    } else if (problem === "area") {
      this.context.announce(`${size}, ${count}, but the clue is ${clue}.`);
    } else {
      this.context.announce(`${size}, ${count}, clue ${clue}.`);
    }
  }

  /* --------------------------------------------------------------- keyboard */

  private key(event: KeyboardEvent) {
    if (!this.active || !this.board) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (
      !(target instanceof HTMLButtonElement) ||
      !target.hasAttribute("data-shikaku-cell")
    ) {
      return;
    }
    const cell = Number(target.dataset.shikakuCell);
    const board = this.board;

    if (event.key === "Escape") {
      if (this.anchor < 0) return;
      event.preventDefault();
      this.anchor = -1;
      this.renderDraft();
      this.context.announce("Rectangle cancelled.");
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      this.removeAt(cell);
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "Spacebar"
    ) {
      event.preventDefault();
      if (event.repeat) return;
      if (this.anchor < 0) {
        this.anchor = cell;
        this.renderDraft();
        this.context.announce(`${this.name(cell)}, corner set.`);
        return;
      }
      const rect = rectBetween(this.anchor, cell, board.columns);
      this.anchor = -1;
      this.commit(rect);
      if (this.active) this.focusCell(cell);
      return;
    }

    const next = nextGridCell(
      cell,
      event.key,
      board.columns,
      board.rows * board.columns,
    );
    if (next === null) return;
    event.preventDefault();
    this.focusCell(next);
  }

  private focusCell(cell: number) {
    this.focus = cell;
    this.paint();
    this.cells[cell]?.focus({ preventScroll: true });
  }

  private name(cell: number): string {
    return gridCellName(cell, this.board?.columns ?? this.config.columns);
  }

  /* --------------------------------------------------------------- painting */

  private layout() {
    const { rows, columns } = this.config;
    const total = rows * columns;
    this.grid.style.setProperty("--shikaku-columns", String(columns));
    this.grid.style.setProperty("--shikaku-rows", String(rows));
    for (const [cell, button] of this.cells.entries()) {
      const visible = cell < total;
      button.hidden = !visible;
      if (!visible) continue;
      button.style.gridRow = String(Math.floor(cell / columns) + 1);
      button.style.gridColumn = String((cell % columns) + 1);
      button.setAttribute("aria-label", gridCellName(cell, columns));
    }
  }

  private paint() {
    const board = this.board;
    if (!board) return;
    this.renderCells(board);
    this.renderOverlays(board);
    this.renderDraft();
  }

  /** The idle board shows the clues and nothing else: a board not yet started. */
  private paintIdle() {
    const preview = createShikakuBoard(
      generateShikaku(
        this.config,
        mulberry32(this.config.rows * 131 + this.config.columns),
      ),
    );
    this.renderCells(preview, true);
    this.renderOverlays(preview, true);
    this.draft.hidden = true;
    this.renderSize(null);
  }

  private renderCells(board: ShikakuBoard, idle = false) {
    const total = board.rows * board.columns;
    for (const [cell, button] of this.cells.entries()) {
      if (cell >= total) {
        this.clues[cell].textContent = "";
        continue;
      }
      const clue = board.clues[cell];
      button.classList.toggle("is-clue", clue > 0);
      button.classList.toggle("is-covered", !idle && rectAt(board, cell) >= 0);
      button.disabled = idle || !this.active;
      button.tabIndex = !idle && this.active && cell === this.focus ? 0 : -1;
      this.clues[cell].textContent = clue > 0 ? String(clue) : "";
      button.setAttribute(
        "aria-label",
        idle ? gridCellName(cell, board.columns) : this.labelFor(board, cell),
      );
    }
  }

  private labelFor(board: ShikakuBoard, cell: number): string {
    const parts = [gridCellName(cell, board.columns)];
    const clue = board.clues[cell];
    if (clue > 0) parts.push(`clue ${clue}`);
    const index = rectAt(board, cell);
    if (index >= 0) {
      const rect = board.rects[index];
      const problem = rectProblem(board, rect);
      parts.push(`in a ${rect.height} by ${rect.width} rectangle`);
      if (problem === "area") parts.push("wrong area");
      else if (problem === "multiple") parts.push("more than one clue");
      else if (problem === "none") parts.push("no clue");
    }
    return parts.join(", ");
  }

  private renderOverlays(board: ShikakuBoard, idle = false) {
    for (const node of Array.from(
      this.grid.querySelectorAll("[data-shikaku-rect]"),
    )) {
      node.remove();
    }
    if (idle) return;
    for (const rect of board.rects) {
      const node = document.createElement("div");
      node.className =
        rectProblem(board, rect) === "ok"
          ? "shikaku-rect is-ok"
          : "shikaku-rect is-invalid";
      node.dataset.shikakuRect = "";
      node.setAttribute("aria-hidden", "true");
      node.style.gridRow = `${rect.top + 1} / span ${rect.height}`;
      node.style.gridColumn = `${rect.left + 1} / span ${rect.width}`;
      this.grid.append(node);
    }
  }

  private draftRect(): ShikakuRect | null {
    const board = this.board;
    if (!board) return null;
    if (this.anchor >= 0) {
      return rectBetween(this.anchor, this.focus, board.columns);
    }
    if (this.dragging && this.dragStart >= 0) {
      return rectBetween(this.dragStart, this.dragCell, board.columns);
    }
    return null;
  }

  private renderDraft() {
    const rect = this.draftRect();
    const board = this.board;
    this.renderSize(rect);
    if (!rect || !board) {
      this.draft.hidden = true;
      return;
    }
    const problem = rectProblem(board, rect);
    this.draft.hidden = false;
    this.draft.classList.toggle("is-invalid", problem !== "ok");
    this.draft.classList.toggle("is-ok", problem === "ok");
    this.draft.style.gridRow = `${rect.top + 1} / span ${rect.height}`;
    this.draft.style.gridColumn = `${rect.left + 1} / span ${rect.width}`;
  }

  private renderSize(rect: ShikakuRect | null) {
    if (!rect || !this.board) {
      this.sizeLabel.textContent = "";
      return;
    }
    const area = rectArea(rect);
    const { clueCount, clue } = checkRect(this.board, rect);
    let note = "";
    if (clueCount === 0) note = " · no clue";
    else if (clueCount > 1) note = ` · ${clueCount} clues`;
    else if (area !== clue) note = ` · clue ${clue}`;
    this.sizeLabel.textContent = `${rect.height}×${rect.width} = ${area}${note}`;
  }

  private renderStatus() {
    const total = this.config.rows * this.config.columns;
    const covered = this.board ? coveredCount(this.board) : 0;
    this.coveredStat.textContent = `${covered} / ${total}`;
  }
}
