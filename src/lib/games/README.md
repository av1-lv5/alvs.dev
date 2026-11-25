# Games

## Structure

- `registry.ts`: metadata, route slugs, instructions, and game-specific prompts. `kind` is `"memory"` or `"puzzle"`; the derived `GameId`, `MemoryGameId`, and `PuzzleGameId` keep both adapter maps exhaustive.
- `rules.ts`: pure rules. Randomness is injectable.
- `minesweeper.ts`: pure Minesweeper rules: safe opening, flood fill, chording, win and loss. Randomness is injectable.
- `shikaku.ts`: pure Shikaku rules: rectangle placement, a bounded unique-solution solver, and a partition generator. Randomness is injectable.
- `navigation.ts`: pattern grid movement (arrow/Home/End keys) and the spoken name for a tile.
- `session.ts`: cancellable timing and guarded device-local record storage.
- `puzzle.ts`: puzzle record keys, resume envelope, and `m:ss` time formatting.
- `sound.ts`: opt-in Web Audio tones, shared across boards.
- `src/components/games/GamePlayer.astro`: shared site-integrated frame (stat row, toolbar, status, primary action, settings, help panel, responsive layout). It renders `memory-game` or `puzzle-game` from the registry `kind`.
- `src/components/games/DifficultyPicker.astro`: shared quiet difficulty choice (easy · medium · hard) for puzzle boards, used only before a game and after one.
- `src/components/games/game-parts.ts`: maps each game ID to its `Board`, optional `Settings` and toolbar `Tools`, the live stat labels it adds to the frame, and its hub `Preview`. The exhaustive type requires an entry for every game ID.
- `src/components/games/boards/*.astro` and `previews/*.astro`: one board (markup and styles), optional settings and toolbar tool, and hub preview per game.
- `src/styles/games.css`: styles shared by the frame and all boards (control and cell tokens, primary button, toolbar controls, hidden/visually-hidden helpers). Scoped styles in the player cannot reach board components, so anything shared lives here.
- `src/styles/previews.css`: styles shared by all hub previews. Scoped styles in a preview cannot be reached from the hub either, so the tilt, hover language, cell treatment and glyph scale live here.
- `src/scripts/games/memory-game.ts`: session lifecycle, levels, records, sound preference, and visibility handling.
- `src/scripts/games/types.ts`: memory board adapter contract and callbacks.
- `src/scripts/games/adapters.ts`: maps memory game IDs to board adapters.
- `src/scripts/games/puzzle-game.ts`: puzzle session lifecycle, clock, records, resume, and visibility handling.
- `src/scripts/games/puzzle-types.ts`: puzzle adapter contract and callbacks.
- `src/scripts/games/puzzle-adapters.ts`: maps puzzle game IDs to board adapters.
- `src/scripts/games/{pattern,number,pairs,odd,chimp}-game.ts`: game-specific presentation and input.
- `src/scripts/games/minesweeper-game.ts`: minefield input, long-press and right-click flags, and chording.
- `src/scripts/games/shikaku-game.ts`: rectangle dragging with pointer capture, tap to remove, and keyboard corner-to-corner drawing.

The index lives at `/games/` and shows each game's personal best (a level for memory games, the fastest time on the listed difficulty for puzzles; hidden when none). The static `[game].astro` route derives individual game pages from the registry.

## Session contract

`ready → watch → recall → success → watch` or `recall → over → watch`. Every phase names its own action: Start, Replay, Next, Try again, Continue.

The player explicitly advances from success, with no answer deadline. A best is the highest **completed** level, not the current attempt. Successful levels save immediately. Stored values are versioned and validated; failure to store does not interrupt play.

**Resuming a run.** The run is saved to device storage (`avi:games:v1:run:<id>`, versioned) when a round starts and again when a level is cleared, and removed when the run ends in a wrong answer or the visitor chooses Start over. A saved record is `{ v: 1, level, done, challenge }`: `done: false` is a round left mid-way, which replays the same challenge from the start; `done: true` is a cleared level, which continues to the next one. On load, a saved run shows “Welcome back” with “Continue” and a Start over button instead of “Start”. A first round left unfinished is not offered, because nothing was earned. Adapters implement `snapshot()` and `restore(challenge, level)`; `restore` validates stored data with the pure `parsePattern`/`parseNumber` rules and returns false for anything that doesn't match the level, in which case the saved run is discarded. If storage is unavailable, play works as before without resuming.

The Pause button appears during watch and recall and does the same thing as leaving the tab: it moves to `paused` and relabels the primary action “Replay”. Start over takes its place in the toolbar only on the welcome-back screen, so a double tap on Pause can never reset a run.

Leaving the tab during watch/recall transitions to `paused`. Pending clock promises settle as cancelled, inputs are disabled, and audio stops. Replay shows the **same** challenge from the start, without a penalty. Removing the element aborts listeners and disposes timers/audio.

Adapters prepare a challenge only once per new level; `watch()` may repeat after a pause. They accept input only during recall and call `resolve()` once. `resolve()` transitions the shared session synchronously to guard against double submissions. Settings marked `data-game-setting` are hidden and locked while a round is in play. Pattern defaults to automatic playback. “Watch at my pace” keeps its cue in the existing status area and reuses the same primary button below the grid: “Next tile,” then “Start my turn.” Focus stays on that button throughout playback, so Enter/Space and repeated taps need no travel. The cue persists until explicit advancement. Adapters control playback actions through `context.playbackAction()` and optional `advance()`; automatic playback hides that action. Cancellation settles a pending advancement promise. Held Enter/Space does not skip steps or rounds.

Pairs keeps the same lifecycle but reframes it: `watch()` is a single timed look at the whole board on a new level, shrinking each level until it disappears, and it never repeats for a replayed or resumed board, so leaving and coming back gains nothing. Pausing clears any face-up card, which keeps Pause from becoming a free look. A try is one attempt (two flipped cards), and running out ends the run. `snapshot()`/`restore()` carry the board, the pairs already found, and tries left.

Odd one out shows a full grid of identical marks during `watch()`, with one mark turned, then clears the whole grid for recall. Clearing rather than straightening the mark matters: an animated return to upright would point at the answer. The visitor taps the cell that held the turned mark, and the answer state shows the grid again with that mark turned. `snapshot()`/`restore()` carry the grid size, the cell, and the angle.

Chimp keeps its numbers visible for a self-paced study phase inside `recall()`: the first correct tap hides them, and the rest of the round is blind. `watch()` only resets the round and hides the board. A wrong tap costs one of three run-level strikes and briefly reveals the layout for a re-read; the third strike resolves the round. `snapshot()`/`restore()` carry the layout and the strikes at the start of the round.

## Puzzle mode

Puzzle games share a second, smaller session in `src/scripts/games/puzzle-game.ts` and implement `PuzzleAdapter` from `puzzle-types.ts`. The memory contract is untouched, so the five memory games keep their storage keys and saved runs.

**States.** `ready → playing → solved | lost`, plus `paused`. `ready` is a blank board at the chosen difficulty with the settings showing; `playing` means one board is in play, and the settings row is hidden; `solved` and `lost` keep the finished board visible. Choosing another difficulty from `ready`, `solved` or `lost` returns to `ready` with a fresh blank board at the new size. The difficulty choice stays locked while a saved board waits to resume.

**Clock and pausing.** The clock starts on the first move and is shown as tabular monospace. Under a minute it shows tenths (`0:02.5`), because whole seconds read as `0:00`; the same format applies to Best. Pausing stops the clock, disables the board, and covers it, so a pause is never free thinking time. Leaving the tab or hiding the page pauses the same way. Solved and lost stop the clock for good.

**Records.** Best is the fastest solve per difficulty: `avi:games:v1:best:<id>:<difficulty>` stores whole milliseconds. The hub shows the registry's `best.difficulty` for each puzzle and labels the row with that difficulty, and the frame's Best stat carries it too (`Best · easy`), because times across board sizes are not comparable. `readPuzzleBest`/`savePuzzleBest` wrap the existing guarded readers.

**Resuming.** After the first move, each move that leaves the board in play and each pause writes `avi:games:v1:puzzle:<id>` with `{ v: 1, difficulty, elapsed, board }`. On load a valid record restores the board and elapsed time behind the pause cover, and offers “Continue” and “Start over”. The difficulty choice stays locked and faded, so changing it cannot silently discard a saved board. A corrupt or mismatched record is ignored and removed. Storage failure only costs resume and records; play continues.

**Adding a puzzle.** Add a registry entry with `kind: "puzzle"` and a `best` difficulty, pure rules with injectable randomness, a board that opts its cells into `game-cell`, a settings control that uses `DifficultyPicker`, a `stats` label for its live counter (e.g. `["Mines"]`), a preview, and a `PuzzleAdapter`: `prepare(difficulty)`, `snapshot()`, `restore(challenge, difficulty)`, `reset(difficulty)`, `enable()`, `disable()`, `dispose()`. Call `context.begin()` on the first real move, `context.save()` after every move that leaves the board in play, and `context.finish("solved" | "lost", detail)` once when it ends. Validate stored boards in `restore` with the pure rules and return false for anything that does not fit the difficulty.

**Shikaku.** A grid of clue numbers is divided into rectangles: each holds exactly one clue, and its area equals that clue. Because any complete division is a win, `isSolved` checks the placed rectangles rather than comparing them with the generated partition. Generation shuffles a random guillotine partition, places one clue per rectangle, and keeps the puzzle only if a backtracking solver finds exactly one solution; the search is node-capped so a hard board stays quick. Rectangles are drawn by dragging from corner to corner and removed with a tap; invalid ones get a dashed outline and a spoken reason. The idle board shows the clues and no rectangles, so it reads as a board not yet started.

**Minesweeper.** The first reveal is safe and opens its neighbours; numbers count the adjacent mines, and a revealed number chords once its flags match. Right-click or a long-press marks a cell, and so does the toolbar's Flag toggle, which is the same control shape as Sound and carries a 2px accent underline while it is on. In flag mode a faint ghost flag previews the mark on the hovered or keyboard-focused hidden cell, and an already flagged cell dims under the pointer to show that the mark would come off. The idle board is an empty field; the hub preview is a small five-by-five field whose numbers are derived from its own mine set.

## Adding a game

1. Add metadata to `GAMES` and pure rules where appropriate. Set `kind` to `"memory"` or `"puzzle"` so the right session and adapter map apply.
2. Add a board component (and a `Settings` control and toolbar `Tools` if the game has them) under `components/games/boards/`, a hub preview under `previews/` that uses the shared `preview-*` classes, and register them in `game-parts.ts` with the labels for any live stat the frame should show. Put anything shared with other boards in `styles/games.css`, and anything shared with other previews in `styles/previews.css`. Extra help text goes in the registry's `notes`, which renders under the help panel's Controls row; wrap key names in backticks to render them as chips, and keep each note to a sentence or two, because the panel answers four labelled questions (Goal, Controls, Pausing, Best) rather than printing a block of prose.
3. Implement `GameAdapter` for memory games or `PuzzleAdapter` (see above) for puzzles. Use the supplied clock and abort signal rather than untracked timers/listeners.
4. Register the adapter in `GAME_ADAPTERS` or `PUZZLE_ADAPTERS`; their exhaustive types require an implementation for every game of that kind.
5. No route or sitemap entry is needed: the static `[game].astro` route and the hub both derive the page from `GAMES`, and only `/games/` is listed in `src/data/sitemap.ts`.

Game rules do not depend on storage, sound, the DOM, or a transport. Future multiplayer should add a separate authoritative session/transport layer, not treat client-side records as trusted scores. Authentication, matchmaking, rooms, and networking are intentionally not implemented yet.

## Visual and interaction language

Keep each game focused on itself: no cross-game suggestions, storage notices, or repeated encouragement/input hints. The one exception is the paused and welcome-back states, which say the run is saved because the visitor needs that to leave with confidence. Keep the single instruction, necessary state/progress, and result/error feedback. The hub does not need a closing footnote.

**Hub previews.** All seven tilt as one plane at −7°, straighten on hover, and change nothing else; that rule lives once in `previews.css` with the cell stroke, radius, gap and glyph scale. A preview declares only its column count and cell size.

Use the existing `PageLayout`, Geist/Geist Mono, theme tokens, blue accent, and eight-pixel radius. Numbers use tabular monospace. Labels are sentence case in the UI font; nothing in the games uses all caps or letterspaced small caps. The arena has one border; game mechanics provide the decoration. Status and action slots reserve space so the grid stays still between phases. The primary action has a consistent width and a minimum 48px touch height.

**One frame, one rhythm.** Every game shows the same stat row in the same order: the game's own counters first (Mines; Cells; Pairs and Tries; Tapped and Strikes), then Level or Time, then Best. Each stat is a small label over a tabular value, never a label in line with its value. Toolbar controls are one shape: icon plus label on desktop, icon only under 769px, always a 44px target. One idiom marks a current choice everywhere, a 2px accent underline: the selected difficulty and a pressed toolbar toggle. Board cells take their stroke, radius, fill and focus ring from `--game-cell-*` tokens in `games.css`; a board declares only what makes it different. Feedback uses explicit words and shape, never color alone. On wide screens the arena is a board column and a side rail that starts every group on one left edge (12–20px apart); on narrow screens it stacks. Feedback uses explicit words and shape, never color or audio alone. Sound defaults off. Pattern tiles are deliberately unnumbered and have no number shortcuts, because numbers would turn a spatial memory game into a number-sequence one. Grid input supports pointer and a single Tab stop with arrow/Home/End navigation and native Enter/Space activation. Tiles are named by row and column for assistive technology, never by number on screen. Nothing marks "your turn" on the arena except the status words. Number answers use strings, a numeric mobile keyboard, and Enter submission. No celebratory motion moves the board; reduced motion still disables decorative transitions.

## Checks

Run `pnpm build` and targeted TypeScript checking. Browser checks should include both themes, 320/390px mobile and desktop, correct and incorrect answers, multi-level progression, rapid/repeated input, empty/non-digit answers, sound persistence, best persistence, tab-switch replay, unavailable storage, and resuming: pause mid-round and reload, clear a level and reload, fail a round and reload (no resume offered), Start over, and a corrupted `avi:games:v1:run:<id>` value (ignored). For pairs, also check that a mismatch stays readable, that the peek never repeats for a replayed board, and that running out of tries mid-reveal lands on the run-over screen. Check both automatic and self-paced playback: measure board/action coordinates across phases, verify focus remains on the primary button between steps, exercise Tab/arrows/Enter/Space (and confirm the 1–9 keys do nothing), and pause/replay while waiting for advancement. For puzzles, check that the first reveal and its neighbours are clear, flood fill and chording, a wrong flag on chording, win and loss rendering, the clock starting on the first move and stopping on pause/hidden/solve, the difficulty lock during play, Continue/Start over after a reload at each difficulty, a corrupted `avi:games:v1:puzzle:<id>` value (ignored), and that a mobile 320px hard board stays usable through its horizontal scroll. Physical-device input (including long-press flagging) and actual VoiceOver/NVDA speech timing still need manual testing.
