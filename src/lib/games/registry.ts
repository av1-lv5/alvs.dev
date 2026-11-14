export const GAMES = [
  {
    id: "pattern",
    title: "Remember the pattern",
    shortTitle: "Pattern",
    description: "A familiar little grid. An increasingly unfamiliar sequence.",
    instruction: "Watch the tiles light up. Tap them back in the same order.",
    rule: "Each level repeats the whole sequence, then adds one tile. One wrong tap ends the run.",
    notes: [
      "Tap or click the tiles to answer. With a keyboard, move between tiles with the arrow keys, then press Enter or Space to choose one. Turn on “Watch at my pace” to advance the sequence yourself using the button below the grid. Enter or Space advances it without moving focus.",
    ],
  },
  {
    id: "number",
    title: "Remember the number",
    shortTitle: "Number",
    description: "Here one moment. In your head the next. Hopefully.",
    instruction: "Memorize the number. Type it back after it disappears.",
    rule: "Start with one digit. Each correct answer adds another, with a little more time to look. One wrong answer ends the run.",
    notes: [],
  },
] as const;

export type GameId = (typeof GAMES)[number]["id"];
