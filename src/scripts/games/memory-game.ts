import {
  GameClock,
  bestStorageKey,
  clearRun,
  readBest,
  readRun,
  runStorageKey,
  saveBest,
  saveRun,
  type SavedRun,
} from "../../lib/games/session";
import { GameSound } from "../../lib/games/sound";
import { GAMES } from "../../lib/games/registry";
import { GAME_ADAPTERS } from "./adapters";
import { element, type GameAdapter, type GameContext } from "./types";

type Phase = "ready" | "watch" | "recall" | "success" | "over" | "paused";

class MemoryGame extends HTMLElement {
  private clock = new GameClock();
  private sound = new GameSound();
  private events?: AbortController;
  private adapter?: GameAdapter;
  private phase: Phase = "ready";
  private level = 1;
  private best = 0;
  private score = 0;
  private savedBest = 0;
  private storage?: Storage;
  private bestKey = "";
  private runKey = "";
  private game?: (typeof GAMES)[number];
  private resume?: SavedRun;

  connectedCallback() {
    if (this.events) return;
    this.events = new AbortController();
    const game = GAMES.find((entry) => entry.id === this.dataset.game);
    if (!game) {
      this.heading(
        "This game isn't available.",
        "Return to All games and choose another.",
      );
      return;
    }
    const signal = this.events.signal;
    this.game = game;
    this.bestKey = bestStorageKey(game.id);
    this.runKey = runStorageKey(game.id);
    try {
      this.storage = localStorage;
      this.best = readBest(this.storage, this.bestKey);
      this.sound.enabled = this.storage.getItem("avi:games:v1:sound") === "on";
    } catch {
      this.storage = undefined;
    }
    this.savedBest = this.best;
    element(this, "[data-best]").textContent = this.best
      ? String(this.best)
      : "—";
    this.updateSound();
    const context: GameContext = {
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
      playbackAction: (label) => {
        if (this.phase === "watch") this.action(label);
      },
      resolve: (correct, detail) => this.resolve(correct, detail),
    };
    this.adapter = new GAME_ADAPTERS[game.id](context);
    this.setPhase("ready");
    this.restoreRun();
    element<HTMLButtonElement>(this, "[data-action]").disabled = false;
    element<HTMLButtonElement>(this, "[data-sound]").disabled = false;
    element(this, "[data-pause-button]").addEventListener(
      "click",
      () => {
        if (this.phase === "watch" || this.phase === "recall") {
          this.pause();
          // The Pause button disappears, so hand focus to what replaces it.
          element(this, "[data-action]").focus({ preventScroll: true });
        }
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
        if (this.phase === "watch") {
          this.adapter!.advance?.();
          return;
        }
        if (this.phase === "recall") return;
        if (this.phase === "paused") {
          void this.startRound(true);
          return;
        }
        if (this.phase === "ready" && this.resume) {
          this.continueRun(this.resume);
          return;
        }
        if (this.phase === "ready" || this.phase === "over") {
          this.level = 1;
          this.score = 0;
          this.adapter!.reset();
        } else {
          this.level++;
        }
        void this.startRound(false);
      },
      { signal },
    );
    this.addEventListener(
      "keydown",
      (event) => {
        // Holding an activation key must not skip steps or start the next round.
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
        if (
          document.hidden &&
          (this.phase === "watch" || this.phase === "recall")
        )
          this.pause();
      },
      { signal },
    );
    window.addEventListener(
      "pagehide",
      () => {
        if (this.phase === "watch" || this.phase === "recall") this.pause();
        this.sound.stop();
      },
      { signal },
    );
  }

  private async startRound(replay: boolean) {
    this.clock.cancel();
    if (!replay) {
      this.adapter!.prepare(this.level);
      this.persist(false);
    }
    this.setPhase("watch");
    element(this, "[data-level]").textContent = String(this.level);
    element(this, "[data-pause]").hidden = true;
    this.heading("Watch closely.");
    if (!(await this.adapter!.watch()) || this.phase !== "watch") return;
    this.setPhase("recall");
    this.heading("Your turn.");
    this.action(null);
    element(this, "[data-announcer]").textContent = "";
    this.adapter!.recall();
  }

  private resolve(correct: boolean, detail: string) {
    if (this.phase !== "recall") return;
    this.clock.cancel();
    this.sound.play(correct ? "win" : "lose");
    if (correct) {
      this.score = this.level;
      const record = this.score > this.best;
      this.best = Math.max(this.best, this.score);
      if (this.storage) {
        // Never overwrite a better record saved by another open tab.
        this.best = Math.max(this.best, readBest(this.storage, this.bestKey));
        if (!saveBest(this.storage, this.bestKey, this.best))
          this.storage = undefined;
      }
      element(this, "[data-best]").textContent = String(this.best);
      this.persist(true);
      this.setPhase("success");
      this.heading(
        record ? "A new little best." : "Nicely remembered.",
        detail,
      );
      this.action("Next level");
    } else {
      // The run has ended, so there is nothing left to continue.
      if (this.storage) clearRun(this.storage, this.runKey);
      this.setPhase("over");
      this.heading(
        this.score > this.savedBest
          ? "Your best just got better."
          : "That's the one that got away.",
        detail,
      );
      this.action("Play again");
      this.savedBest = this.best;
    }
    element(this, "[data-action]").focus({ preventScroll: true });
  }

  private pause() {
    this.clock.cancel();
    this.sound.stop();
    this.adapter!.disable();
    this.setPhase("paused");
    element(this, "[data-pause]").hidden = false;
    this.heading(
      "Round paused.",
      "Replay this round when you're back. Your run is saved.",
    );
    this.action("Replay round");
  }

  private persist(done: boolean) {
    if (!this.storage) return;
    saveRun(this.storage, this.runKey, {
      level: this.level,
      done,
      challenge: this.adapter!.snapshot(),
    });
  }

  private restoreRun() {
    if (!this.storage) return;
    const run = readRun(this.storage, this.runKey);
    if (!run) return;
    // Nothing has been earned in a first round that was left unfinished.
    if (!run.done && run.level === 1) {
      clearRun(this.storage, this.runKey);
      return;
    }
    if (!this.adapter!.restore(run.challenge, run.level)) {
      clearRun(this.storage, this.runKey);
      return;
    }
    this.resume = run;
    const next = run.done ? run.level + 1 : run.level;
    element(this, "[data-level]").textContent = String(next);
    this.heading(
      "Welcome back.",
      run.done
        ? `Level ${run.level} cleared. Level ${next} is next.`
        : `Level ${next} is waiting. The round replays from the start.`,
    );
    this.action(`Continue level ${next}`);
    this.syncControls();
  }

  private continueRun(run: SavedRun) {
    this.resume = undefined;
    this.level = run.done ? run.level + 1 : run.level;
    this.score = run.done ? run.level : run.level - 1;
    this.syncControls();
    // A cleared level needs a new challenge; a mid-way round replays the restored one.
    void this.startRound(!run.done);
  }

  private startOver() {
    if (this.storage) clearRun(this.storage, this.runKey);
    this.resume = undefined;
    this.level = 1;
    this.score = 0;
    this.adapter!.reset();
    element(this, "[data-level]").textContent = "1";
    this.heading("Ready when you are.", this.game!.instruction);
    this.action("Start game");
    this.syncControls();
    element(this, "[data-action]").focus({ preventScroll: true });
  }

  /** Pause belongs to a round in play; Start over to a run waiting to resume. */
  private syncControls() {
    element(this, "[data-pause-button]").hidden = !(
      this.phase === "watch" || this.phase === "recall"
    );
    element(this, "[data-restart]").hidden = !(
      this.phase === "ready" && this.resume
    );
  }

  private heading(title: string, detail = "") {
    element(this, "[data-title]").textContent = title;
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
    if (label) button.textContent = label;
  }

  private setPhase(phase: Phase) {
    this.phase = phase;
    this.dataset.phase = phase;
    this.syncControls();
    for (const setting of Array.from(
      this.querySelectorAll<HTMLInputElement>("[data-game-setting]"),
    )) {
      setting.disabled = phase === "watch" || phase === "recall";
    }
  }

  private updateSound() {
    element(this, "[data-sound]").setAttribute(
      "aria-pressed",
      String(this.sound.enabled),
    );
    element(this, "[data-sound-off]").hidden = this.sound.enabled;
    element(this, "[data-sound-on]").hidden = !this.sound.enabled;
    element(this, "[data-sound-label]").textContent = this.sound.enabled
      ? "Sound on"
      : "Sound off";
  }

  disconnectedCallback() {
    this.events?.abort();
    this.events = undefined;
    this.clock.cancel();
    this.adapter?.dispose();
    this.sound.dispose();
  }
}

if (!customElements.get("memory-game"))
  customElements.define("memory-game", MemoryGame);
