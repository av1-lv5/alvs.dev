export const GAMES = [
  {
    id: "pattern",
    title: "Remember the pattern",
    shortTitle: "Pattern",
    description: "A familiar little grid. An increasingly unfamiliar sequence.",
    instruction: "Watch the tiles light up. Tap them back in the same order.",
    rule: "Each level repeats the whole sequence, then adds one tile. One wrong tap ends the run.",
    notes: [
      "Tap or click a tile to answer. With a keyboard, move with `↑ ↓ ← →` and choose with `Enter` or `Space`. “Watch at my pace” advances the sequence with the button below the grid.",
    ],
  },
  {
    id: "number",
    title: "Remember the number",
    shortTitle: "Number",
    description: "Here one moment. In your head the next. Hopefully.",
    instruction: "Memorize the number. Type it back after it disappears.",
    rule: "Start with one digit. Each correct answer adds another, with a little more time to look. One wrong answer ends the run.",
    notes: [
      "Type the answer with the number keys and press `Enter` to check it.",
    ],
  },
  {
    id: "pairs",
    title: "Match the pairs",
    shortTitle: "Pairs",
    description:
      "Sixteen cards, eight pairs, and one memory doing all the work.",
    instruction: "Flip two cards at a time. Find every matching pair.",
    rule: "Each level is a fresh 4×4 board of 8 pairs. Every two cards you flip is one try, match or miss. Clear the board before the tries run out.",
    notes: [
      "Low levels show the board before it turns face down; that head start shrinks each level, then stops. Tap or click a card to flip it. With a keyboard, move with `↑ ↓ ← →` and flip with `Enter` or `Space`.",
    ],
  },
  {
    id: "odd",
    title: "Find the odd one",
    shortTitle: "Odd one out",
    description: "A grid of identical marks. One is facing the wrong way.",
    instruction:
      "One mark is turned. Remember where, then tap the cell once the grid clears.",
    rule: "Each level shows a square grid of identical marks with one turned at an angle. When the grid clears, tap the cell that was turned. The grid grows and the look gets shorter; one wrong tap ends the run.",
    notes: [
      "Tap or click a cell to answer. With a keyboard, move with `↑ ↓ ← →` and choose with `Enter` or `Space`.",
    ],
  },
  {
    id: "chimp",
    title: "Beat the chimp",
    shortTitle: "Chimp test",
    description: "A scattered grid of numbers. One tap and they all disappear.",
    instruction:
      "Study the numbers. Tap 1, and the rest vanish. Then tap 2, 3, 4… in order.",
    rule: "The first level places four numbers in a 5×5 grid; every level adds one. Your first tap hides every number, and you continue in ascending order from memory. A wrong tap costs one of three strikes for the run and shows the layout again before you carry on.",
    notes: [
      "Tap or click a cell to answer. With a keyboard, move with `↑ ↓ ← →` and choose with `Enter` or `Space`.",
    ],
  },
] as const;

export type GameId = (typeof GAMES)[number]["id"];
