/** Spoken name for a tile. The tiles carry no visible numbers. */
export function tileName(tile: number): string {
  return `Row ${Math.floor(tile / 3) + 1}, column ${(tile % 3) + 1}`;
}

/** Tile an arrow/Home/End key moves to, wrapping at the grid edges; null otherwise. */
export function nextPatternTile(tile: number, key: string): number | null {
  if (!Number.isInteger(tile) || tile < 0 || tile > 8) return null;
  const row = Math.floor(tile / 3);
  const column = tile % 3;

  switch (key) {
    case "ArrowLeft":
      return row * 3 + ((column + 2) % 3);
    case "ArrowRight":
      return row * 3 + ((column + 1) % 3);
    case "ArrowUp":
      return ((row + 2) % 3) * 3 + column;
    case "ArrowDown":
      return ((row + 1) % 3) * 3 + column;
    case "Home":
      return 0;
    case "End":
      return 8;
    default:
      return null;
  }
}
