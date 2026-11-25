export const GAMES = [
  {
    id: "pattern",
    kind: "memory",
    title: "Remember the pattern",
    shortTitle: "Pattern",
    description: "Remember the order. It keeps growing.",
    instruction: "Watch the tiles, then tap them back in order.",
    rule: "Every level repeats the sequence and adds a tile. One wrong tap ends the run.",
    notes: [
      "Tap or click a tile. Keys: `↑ ↓ ← →` move, `Enter` or `Space` chooses. “Watch at my pace” advances with the button below the grid.",
    ],
  },
  {
    id: "number",
    kind: "memory",
    title: "Remember the number",
    shortTitle: "Number",
    description: "One glance. Then hold it in your head.",
    instruction: "Memorize it, then type it back.",
    rule: "Each correct answer adds a digit and a little more time to look. One wrong answer ends the run.",
    notes: ["Type the answer and press `Enter`."],
  },
  {
    id: "pairs",
    kind: "memory",
    title: "Match the pairs",
    shortTitle: "Pairs",
    description: "Eight pairs. Turn two cards at a time.",
    instruction: "Flip two cards. Find every pair.",
    rule: "Eight pairs on a 4×4 board. Every two flips is a try. Clear it before your tries run out.",
    notes: [
      "Keys: `↑ ↓ ← →` move, `Enter` or `Space` flips. Low levels show the board first.",
    ],
  },
  {
    id: "odd",
    kind: "memory",
    title: "Find the odd one",
    shortTitle: "Odd one out",
    description: "One mark in the grid faces the wrong way.",
    instruction: "One mark is turned. Find it once the grid clears.",
    rule: "When the grid clears, tap the cell that was turned. The grid grows and the look gets shorter. One wrong tap ends the run.",
    notes: ["Keys: `↑ ↓ ← →` move, `Enter` or `Space` chooses."],
  },
  {
    id: "chimp",
    kind: "memory",
    title: "Beat the chimp",
    shortTitle: "Chimp test",
    description: "Numbers scatter, then hide. Tap them in order.",
    instruction: "Tap 1 and the rest vanish. Then carry on in order.",
    rule: "Four numbers to start, one more each level. A wrong tap costs a strike and shows the layout again.",
    notes: ["Keys: `↑ ↓ ← →` move, `Enter` or `Space` chooses."],
  },
  {
    id: "minesweeper",
    kind: "puzzle",
    title: "Clear the minefield",
    shortTitle: "Minesweeper",
    description: "Numbers count the mines. One wrong step ends it.",
    instruction: "Reveal every safe cell. Numbers count nearby mines.",
    rule: "Your first reveal is always safe. Numbers count the mines touching a cell; empty cells open their neighbours. Reveal every safe cell to win. One mine ends it.",
    notes: [
      "Right-click, long-press or the Flag button marks a cell. Keys: arrows move, `Enter` reveals, `F` flags.",
    ],
    best: { difficulty: "easy", label: "easy" },
  },
  {
    id: "shikaku",
    kind: "puzzle",
    title: "Divide the grid",
    shortTitle: "Shikaku",
    description: "Give every number a rectangle of its own size.",
    instruction: "Draw a rectangle around each number, matching its area.",
    rule: "Every cell belongs to one rectangle. Each holds one number and covers exactly that many cells. Any complete division wins.",
    notes: [
      "Drag corner to corner; tap a rectangle to remove it. Keys: `Enter` sets a corner, `Escape` cancels, `Delete` removes.",
    ],
    best: { difficulty: "easy", label: "easy" },
  },
] as const;

export type GameId = (typeof GAMES)[number]["id"];

export type MemoryGameId = Extract<
  (typeof GAMES)[number],
  { kind: "memory" }
>["id"];

export type PuzzleGameId = Extract<
  (typeof GAMES)[number],
  { kind: "puzzle" }
>["id"];
