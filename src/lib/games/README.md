# Games

## Structure

- `registry.ts`: metadata, route slugs, instructions, and game-specific prompts.
- `rules.ts`: pure rules. Randomness is injectable.
- `navigation.ts`: pattern grid movement (arrow/Home/End keys) and the spoken name for a tile.
- `session.ts`: cancellable timing and guarded device-local record storage.
- `sound.ts`: opt-in Web Audio tones, shared across boards.
- `src/components/games/GamePlayer.astro`: shared site-integrated frame (arena header, status, primary action, instructions, responsive layout).
- `src/components/games/game-parts.ts`: maps each game ID to its `Board`, optional `Settings`, and hub `Preview` components. The exhaustive type requires an entry for every game ID.
- `src/components/games/boards/*.astro` and `previews/*.astro`: one board (markup and styles), optional settings control, and hub preview per game.
- `src/styles/games.css`: styles shared by all boards (control tokens, primary button, hidden/visually-hidden helpers). Scoped styles in the player cannot reach board components, so anything a board shares lives here.
- `src/scripts/games/memory-game.ts`: session lifecycle, levels, records, sound preference, and visibility handling.
- `src/scripts/games/types.ts`: board adapter contract and callbacks.
- `src/scripts/games/adapters.ts`: maps game IDs to board adapters.
- `src/scripts/games/{pattern,number}-game.ts`: game-specific presentation and input.

The index lives at `/games/` and shows each game's personal best (read from device storage after load, hidden when none). The static `[game].astro` route derives individual game pages from the registry.

## Session contract

`ready → watch → recall → success → watch` or `recall → over → watch`.

The player explicitly advances from success, with no answer deadline. A best is the highest **completed** level, not the current attempt. Successful levels save immediately. Stored values are versioned and validated; failure to store does not interrupt play.

**Resuming a run.** The run is saved to device storage (`avi:games:v1:run:<id>`, versioned) when a round starts and again when a level is cleared, and removed when the run ends in a wrong answer or the visitor chooses Start over. A saved record is `{ v: 1, level, done, challenge }`: `done: false` is a round left mid-way, which replays the same challenge from the start; `done: true` is a cleared level, which continues to the next one. On load, a saved run shows “Welcome back” with “Continue level N” and a Start over button instead of “Start game”. A first round left unfinished is not offered, because nothing was earned. Adapters implement `snapshot()` and `restore(challenge, level)`; `restore` validates stored data with the pure `parsePattern`/`parseNumber` rules and returns false for anything that doesn't match the level, in which case the saved run is discarded. If storage is unavailable, play works as before without resuming.

The Pause button appears during watch and recall and does the same thing as leaving the tab: it moves to `paused` and shows “Replay round”. Start over takes its place in the toolbar only on the welcome-back screen, so a double tap on Pause can never reset a run.

Leaving the tab during watch/recall transitions to `paused`. Pending clock promises settle as cancelled, inputs are disabled, and audio stops. Replay shows the **same** challenge from the start, without a penalty. Removing the element aborts listeners and disposes timers/audio.

Adapters prepare a challenge only once per new level; `watch()` may repeat after a pause. They accept input only during recall and call `resolve()` once. `resolve()` transitions the shared session synchronously to guard against double submissions. Settings marked `data-game-setting` are locked during watch and recall. Pattern defaults to automatic playback. “Watch at my pace” keeps its cue in the existing status area and reuses the same primary button below the grid: “Next tile,” then “Start my turn.” Focus stays on that button throughout playback, so Enter/Space and repeated taps need no travel. The cue persists until explicit advancement. Adapters control playback actions through `context.playbackAction()` and optional `advance()`; automatic playback hides that action. Cancellation settles a pending advancement promise. Held Enter/Space does not skip steps or rounds.

## Adding a game

1. Add metadata to `GAMES` and pure rules where appropriate.
2. Add a board component (and a `Settings` control if the game has one) under `components/games/boards/`, a hub preview under `previews/`, and register them in `game-parts.ts`. Put anything shared with other boards in `styles/games.css`. Extra help text goes in the registry's `notes`.
3. Implement `GameAdapter`: reset, prepare, snapshot, restore, watch, recall, disable, dispose. Use the supplied clock and abort signal rather than untracked timers/listeners.
4. Register the adapter in `GAME_ADAPTERS`; its exhaustive type requires an implementation for every game ID.
5. No route or sitemap entry is needed: the static `[game].astro` route and the hub both derive the page from `GAMES`, and only `/games/` is listed in `src/data/sitemap.ts`.

Game rules do not depend on storage, sound, the DOM, or a transport. Future multiplayer should add a separate authoritative session/transport layer, not treat client-side records as trusted scores. Authentication, matchmaking, rooms, and networking are intentionally not implemented yet.

## Visual and interaction language

Keep each game focused on itself: no cross-game suggestions, storage notices, or repeated encouragement/input hints. The one exception is the paused and welcome-back states, which say the run is saved because the visitor needs that to leave with confidence. Keep the single instruction, necessary state/progress, and result/error feedback. The hub does not need a closing footnote.

Use the existing `PageLayout`, Geist/Geist Mono, theme tokens, blue accent, and eight-pixel radius. Numbers use tabular monospace. The arena has one border; game mechanics provide the decoration. Status and action slots reserve space so the grid stays still between phases. The primary action has a consistent width and a minimum 48px touch height. Feedback uses explicit words and shape, never color or audio alone. Sound defaults off. Pattern tiles are deliberately unnumbered and have no number shortcuts, because numbers would turn a spatial memory game into a number-sequence one. Grid input supports pointer and a single Tab stop with arrow/Home/End navigation and native Enter/Space activation. Tiles are named by row and column for assistive technology, never by number on screen. Nothing marks "your turn" on the arena except the status words. Number answers use strings, a numeric mobile keyboard, and Enter submission. No celebratory motion moves the board; reduced motion still disables decorative transitions.

## Checks

Run `pnpm build` and targeted TypeScript checking. Browser checks should include both themes, 320/390px mobile and desktop, correct and incorrect answers, multi-level progression, rapid/repeated input, empty/non-digit answers, sound persistence, best persistence, tab-switch replay, unavailable storage, and resuming: pause mid-round and reload, clear a level and reload, fail a round and reload (no resume offered), Start over, and a corrupted `avi:games:v1:run:<id>` value (ignored). Check both automatic and self-paced playback: measure board/action coordinates across phases, verify focus remains on the primary button between steps, exercise Tab/arrows/Enter/Space (and confirm the 1–9 keys do nothing), and pause/replay while waiting for advancement. Physical-device input and actual VoiceOver/NVDA speech timing still need manual testing.
