import { PAIR_COLUMNS } from "./rules";

/** Spoken name for a cell in a grid of `columns` columns. */
export function gridCellName(cell: number, columns: number): string {
  return `Row ${Math.floor(cell / columns) + 1}, column ${(cell % columns) + 1}`;
}

/** Cell an arrow/Home/End key moves to, wrapping at the grid edges; null otherwise. */
export function nextGridCell(
  cell: number,
  key: string,
  columns: number,
  count: number,
): number | null {
  if (!Number.isInteger(cell) || cell < 0 || cell >= count || columns < 1) {
    return null;
  }
  const rows = Math.ceil(count / columns);
  const row = Math.floor(cell / columns);
  const column = cell % columns;
  const wrapRow = (target: number) =>
    ((target + rows) % rows) * columns + column;

  let next: number;
  switch (key) {
    case "ArrowLeft":
      next = row * columns + ((column + columns - 1) % columns);
      break;
    case "ArrowRight":
      next = row * columns + ((column + 1) % columns);
      break;
    case "ArrowUp":
      next = wrapRow(row - 1);
      break;
    case "ArrowDown":
      next = wrapRow(row + 1);
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = count - 1;
      break;
    default:
      return null;
  }
  return next < count ? next : null;
}

/** Spoken name for a pattern tile. The tiles carry no visible numbers. */
export function tileName(tile: number): string {
  return gridCellName(tile, 3);
}

/** Tile an arrow/Home/End key moves to in the pattern grid; null otherwise. */
export function nextPatternTile(tile: number, key: string): number | null {
  return nextGridCell(tile, key, 3, 9);
}

/** Spoken name for a pairs card. */
export function cardName(cell: number): string {
  return gridCellName(cell, PAIR_COLUMNS);
}
