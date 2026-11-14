/** Pure rules: no DOM, timers, storage, or audio. Randomness is injectable. */
export function extendPattern(
  pattern: readonly number[],
  random: () => number = Math.random,
): number[] {
  return [...pattern, Math.floor(random() * 9)];
}

/** A stored pattern is only trusted if it has one tile per level. */
export function parsePattern(value: unknown, level: number): number[] | null {
  if (!Array.isArray(value) || value.length !== level) return null;
  return value.every((tile) => Number.isInteger(tile) && tile >= 0 && tile <= 8)
    ? [...value]
    : null;
}

export function checkPatternStep(
  pattern: readonly number[],
  index: number,
  tile: number,
): "wrong" | "correct" | "complete" {
  if (index < 0 || index >= pattern.length || pattern[index] !== tile) {
    return "wrong";
  }
  return index === pattern.length - 1 ? "complete" : "correct";
}

export function createNumber(
  digits: number,
  random: () => number = Math.random,
): string {
  // Strings preserve long answers without JavaScript's integer rounding.
  return Array.from({ length: digits }, (_, index) =>
    String(
      index === 0 ? 1 + Math.floor(random() * 9) : Math.floor(random() * 10),
    ),
  ).join("");
}

/** A stored number is only trusted if it has one digit per level. */
export function parseNumber(value: unknown, level: number): string | null {
  return typeof value === "string" &&
    value.length === level &&
    /^[1-9]\d*$/.test(value)
    ? value
    : null;
}

export function checkNumber(expected: string, answer: string): boolean {
  return /^\d+$/.test(answer) && expected === answer;
}

export function numberWatchDuration(digits: number): number {
  return 1600 + digits * 650;
}
