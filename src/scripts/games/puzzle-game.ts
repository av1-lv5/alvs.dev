import {
  clearPuzzleRun,
  formatPuzzleTime,
  puzzleRunStorageKey,
  readPuzzleBest,
  readPuzzleRun,
  savePuzzleBest,
  savePuzzleRun,
  type SavedPuzzleRun,
} from "../../lib/games/puzzle";
import { GAMES } from "../../lib/games/registry";
import { GameClock } from "../../lib/games/session";
import { GameSound } from "../../lib/games/sound";
import { PUZZLE_ADAPTERS } from "./puzzle-adapters";
import type { PuzzleAdapter, PuzzleContext } from "./puzzle-types";
import { element } from "./types";

type Phase = "ready" | "playing" | "solved" | "lost" | "paused";
type GameEntry = Extract<(typeof GAMES)[number], { kind: "puzzle" }>;

/** Four updates a second keep the clock honest without busy work. */
const TICK = 250;

class PuzzleGame extends HTMLElement {
  private clock = new GameClock();
  private sound = new GameSound();
  private events?: AbortController;
  private adapter?: PuzzleAdapter;
  private phase: Phase = "ready";
  private difficulty = "";
  private elapsed = 0;
  private startedAt = 0;
  private running = false;
  private tickToken = 0;
  private moved = false;
  private best = 0;
  private storage?: Storage;
  private runKey = "";
  private game?: GameEntry;
  private resume?: SavedPuzzleRun;

  connectedCallback() {
    if (this.events) return;
    this.events = new AbortController();
    const game = GAMES.find((entry) => entry.id === this.dataset.game);
    if (!game || game.kind !== "puzzle") {
      this.heading(
        "This puzzle isn't available.",
        "Return to All games and choose another.",
      );
      return;
    }
    const signal = this.events.signal;
    this.game = game;
    this.runKey = puzzleRunStorageKey(game.id);
    this.difficulty =
      this.querySelector<HTMLInputElement>("[data-difficulty]:checked")?.dataset
        .difficulty ?? game.best.difficulty;
    try {
      this.storage = localStorage;
      this.sound.enabled = this.storage.getItem("avi:games:v1:sound") === "on";
    } catch {
      this.storage = undefined;
    }

    const context: PuzzleContext = {
      root: this,
      clock: this.clock,
      sound: this.sound,
      events: signal,
      announce: (text) => {
        element(this, "[data-announcer]").textContent = text;
      },
      progress: (text) => {
        this.detail(text);
      },
      begin: () => this.begin(),
      save: () => this.persist(),
      finish: (outcome, detail) => this.finish(outcome, detail),
    };
    this.adapter = new PUZZLE_ADAPTERS[game.id](context);
    this.refreshBest();
    this.renderTime(0);
    this.updateSound();
    this.setPhase("ready");
    this.adapter.reset(this.difficulty);
    this.restoreRun();
    if (!this.resume) {
      this.heading("Ready when you are.", game.instruction);
      this.action(this.startLabel());
    }
    element<HTMLButtonElement>(this, "[data-sound]").disabled = false;
    element<HTMLButtonElement>(this, "[data-action]").disabled = false;

    element(this, "[data-pause-button]").addEventListener(
      "click",
      () => {
        if (this.phase !== "playing") return;
        this.pause();
      },
      { signal },
    );
    element(this, "[data-restart]").addEventListener(
      "click",
      () => this.startOver(),
      { signal },
    );
    element(this, "[data-action]").addEventListener(
      "click",
      () => {
        this.sound.unlock();
        if (this.phase === "paused") {
          this.resumePlay();
          return;
        }
        if (this.phase === "ready" && this.resume) {
          this.continueRun();
          return;
        }
        this.startNew();
      },
      { signal },
    );
    this.addEventListener(
      "change",
      (event) => {
        const target = event.target;
        if (
          !(target instanceof HTMLInputElement) ||
          !target.hasAttribute("data-difficulty") ||
          !target.checked
        ) {
          return;
        }
        this.difficulty = target.dataset.difficulty ?? this.difficulty;
        this.refreshBest();
        // Before a game, and after one, a new difficulty is a fresh board at
        // its size rather than the old board with a new label.
        if (
          !this.resume &&
          this.phase !== "playing" &&
          this.phase !== "paused"
        ) {
          this.ready();
        }
      },
      { signal },
    );
    this.addEventListener(
      "keydown",
      (event) => {
        // Holding an activation key must not start another puzzle.
        if (event.repeat && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
        }
      },
      { signal },
    );
    element(this, "[data-sound]").addEventListener(
      "click",
      () => {
        this.sound.enabled = !this.sound.enabled;
        if (this.sound.enabled) this.sound.unlock();
        else this.sound.stop();
        try {
          this.storage?.setItem(
            "avi:games:v1:sound",
            this.sound.enabled ? "on" : "off",
          );
        } catch {
          /* Preference is still active for this page. */
        }
        this.updateSound();
      },
      { signal },
    );
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden && this.phase === "playing") this.pause();
      },
      { signal },
    );
    window.addEventListener(
      "pagehide",
      () => {
        if (this.phase === "playing") this.pause();
        this.sound.stop();
      },
      { signal },
    );
  }

  /** The idle, ready state: a blank board at the chosen difficulty. */
  private ready() {
    if (this.storage) clearPuzzleRun(this.storage, this.runKey);
    this.resume = undefined;
    this.elapsed = 0;
    this.running = false;
    this.moved = false;
    this.tickToken += 1;
    this.clock.cancel();
    this.adapter!.reset(this.difficulty);
    this.hideCover();
    this.renderTime(0);
    this.refreshBest();
    this.setPhase("ready");
    this.heading("Ready when you are.", this.game!.instruction);
    this.action(this.startLabel());
  }

  /** A fresh board with the clock waiting for the first move. */
  private startNew() {
    this.clock.cancel();
    this.tickToken += 1;
    this.running = false;
    this.elapsed = 0;
    this.moved = false;
    this.resume = undefined;
    if (this.storage) clearPuzzleRun(this.storage, this.runKey);
    this.adapter!.prepare(this.difficulty);
    this.hideCover();
    this.renderTime(0);
    this.refreshBest();
    this.setPhase("playing");
    this.adapter!.enable();
    this.heading("Your move.", "The clock starts with your first move.");
    this.action(null);
  }

  private begin() {
    if (this.phase !== "playing" || this.running) return;
    this.moved = true;
    this.running = true;
    this.startedAt = performance.now();
    this.detail("");
    void this.tick();
  }

  private async tick() {
    const token = ++this.tickToken;
    while (
      this.phase === "playing" &&
      this.running &&
      token === this.tickToken
    ) {
      if (!(await this.clock.wait(TICK))) return;
      if (token !== this.tickToken) return;
      this.renderTime(this.elapsedNow());
    }
  }

  private elapsedNow() {
    if (!this.running) return this.elapsed;
    return this.elapsed + (performance.now() - this.startedAt);
  }

  private pause() {
    if (this.phase !== "playing") return;
    this.elapsed = this.elapsedNow();
    this.running = false;
    this.tickToken += 1;
    this.clock.cancel();
    this.sound.stop();
    this.adapter!.disable();
    this.renderTime(this.elapsed);
    this.setPhase("paused");
    this.showCover("Saved.");
    this.heading("Paused.");
    this.action("Resume");
    this.persist();
    element(this, "[data-action]").focus({ preventScroll: true });
  }

  private resumePlay() {
    if (this.phase !== "paused") return;
    this.hideCover();
    this.setPhase("playing");
    this.adapter!.enable();
    if (this.moved) {
      this.running = true;
      this.startedAt = performance.now();
      void this.tick();
      this.heading("Back to it.");
    } else {
      this.heading("Your move.", "The clock starts with your first move.");
    }
    this.action(null);
  }

  private finish(outcome: "solved" | "lost", detail: string) {
    if (this.phase !== "playing") return;
    this.elapsed = this.elapsedNow();
    this.running = false;
    this.tickToken += 1;
    this.clock.cancel();
    this.adapter!.disable();
    this.renderTime(this.elapsed);
    if (this.storage) clearPuzzleRun(this.storage, this.runKey);
    this.resume = undefined;
    this.moved = false;
    this.sound.play(outcome === "solved" ? "win" : "lose");

    const time = Math.max(0, Math.floor(this.elapsed));
    if (outcome === "solved") {
      let previous = this.best;
      if (this.storage) {
        const stored = readPuzzleBest(
          this.storage,
          this.game!.id,
          this.difficulty,
        );
        if (stored && (previous === 0 || stored < previous)) previous = stored;
      }
      const record = previous === 0 || time < previous;
      this.best = record ? Math.max(1, time) : previous;
      if (
        record &&
        this.storage &&
        !savePuzzleBest(
          this.storage,
          this.game!.id,
          this.difficulty,
          Math.max(1, time),
        )
      ) {
        this.storage = undefined;
      }
      this.renderBest();
      this.setPhase("solved");
      this.heading(
        record ? "New fastest." : "Solved.",
        detail
          ? `${formatPuzzleTime(time)}. ${detail}`
          : formatPuzzleTime(time),
      );
      this.action("New puzzle");
    } else {
      this.setPhase("lost");
      this.heading(
        "Run over.",
        detail
          ? `${formatPuzzleTime(time)}. ${detail}`
          : formatPuzzleTime(time),
      );
      this.action("Try again");
    }
    this.hideCover();
    element(this, "[data-action]").focus({ preventScroll: true });
  }

  private persist() {
    if (!this.storage || !this.moved) return;
    if (this.phase !== "playing" && this.phase !== "paused") return;
    const saved = savePuzzleRun(this.storage, this.runKey, {
      difficulty: this.difficulty,
      elapsed: Math.floor(this.elapsedNow()),
      board: this.adapter!.snapshot(),
    });
    if (!saved) this.storage = undefined;
  }

  private restoreRun() {
    if (!this.storage) return;
    const run = readPuzzleRun(this.storage, this.runKey);
    if (!run) return;
    if (!this.adapter!.restore(run.board, run.difficulty)) {
      clearPuzzleRun(this.storage, this.runKey);
      return;
    }
    this.resume = run;
    this.difficulty = run.difficulty;
    this.selectDifficulty(run.difficulty);
    this.elapsed = run.elapsed;
    this.refreshBest();
    this.renderTime(run.elapsed);
    this.heading(
      "Welcome back.",
      `${this.difficultyLabel()}, ${formatPuzzleTime(run.elapsed)} on the clock.`,
    );
    this.action("Continue");
    this.showCover("Saved.");
    this.syncControls();
    this.syncSettings();
  }

  private continueRun() {
    if (!this.resume) return;
    this.resume = undefined;
    this.moved = true;
    this.hideCover();
    this.setPhase("playing");
    this.adapter!.enable();
    this.running = true;
    this.startedAt = performance.now();
    void this.tick();
    this.heading("Back to it.");
    this.action(null);
  }

  private startOver() {
    this.ready();
    element(this, "[data-action]").focus({ preventScroll: true });
  }

  private startLabel(): string {
    return `Start ${this.difficultyLabel().toLowerCase()}`;
  }

  private selectDifficulty(difficulty: string) {
    for (const input of Array.from(
      this.querySelectorAll<HTMLInputElement>("[data-difficulty]"),
    )) {
      input.checked = input.dataset.difficulty === difficulty;
    }
  }

  private difficultyLabel(): string {
    const input = this.querySelector<HTMLInputElement>(
      "[data-difficulty]:checked",
    );
    return input?.closest("label")?.textContent?.trim() || this.difficulty;
  }

  private refreshBest() {
    this.best = this.storage
      ? readPuzzleBest(this.storage, this.game!.id, this.difficulty)
      : 0;
    const scope = this.querySelector<HTMLElement>("[data-best-scope]");
    if (scope) scope.textContent = ` · ${this.difficultyLabel().toLowerCase()}`;
    this.renderBest();
  }

  private renderBest() {
    element(this, "[data-best]").textContent = this.best
      ? formatPuzzleTime(this.best)
      : "—";
  }

  private renderTime(ms: number) {
    element(this, "[data-time]").textContent = formatPuzzleTime(ms);
  }

  private syncControls() {
    element(this, "[data-pause-button]").hidden = this.phase !== "playing";
    element(this, "[data-restart]").hidden = !(
      this.phase === "ready" && this.resume
    );
  }

  /** The difficulty is fixed for a puzzle in play, and while one waits to resume. */
  private syncSettings() {
    const locked =
      this.phase === "playing" ||
      this.phase === "paused" ||
      (this.phase === "ready" && !!this.resume);
    for (const setting of Array.from(
      this.querySelectorAll<HTMLInputElement>("[data-game-setting]"),
    )) {
      setting.disabled = locked;
    }
  }

  private showCover(text: string) {
    const cover = element(this, "[data-pause]");
    const label = cover.querySelector("[data-pause-text]");
    if (label) label.textContent = text;
    cover.hidden = false;
  }

  private hideCover() {
    element(this, "[data-pause]").hidden = true;
  }

  private heading(title: string, detail = "") {
    if (title) element(this, "[data-title]").textContent = title;
    this.detail(detail);
  }

  private detail(text: string) {
    const detail = element(this, "[data-detail]");
    detail.textContent = text;
    detail.hidden = !text;
  }

  private action(label: string | null) {
    const button = element<HTMLButtonElement>(this, "[data-action]");
    button.hidden = !label;
    if (label) element(this, "[data-action-label]").textContent = label;
  }

  private setPhase(phase: Phase) {
    this.phase = phase;
    this.dataset.phase = phase;
    this.syncControls();
    this.syncSettings();
  }

  private updateSound() {
    element(this, "[data-sound]").setAttribute(
      "aria-pressed",
      String(this.sound.enabled),
    );
    element(this, "[data-sound-off]").hidden = this.sound.enabled;
    element(this, "[data-sound-on]").hidden = !this.sound.enabled;
  }

  disconnectedCallback() {
    this.events?.abort();
    this.events = undefined;
    this.tickToken += 1;
    this.clock.cancel();
    this.adapter?.dispose();
    this.sound.dispose();
  }
}

if (!customElements.get("puzzle-game"))
  customElements.define("puzzle-game", PuzzleGame);
