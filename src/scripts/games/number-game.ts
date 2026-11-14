import {
  checkNumber,
  createNumber,
  numberWatchDuration,
  parseNumber,
} from "../../lib/games/rules";
import { element, type GameAdapter, type GameContext } from "./types";

export class NumberGame implements GameAdapter {
  private target = "";
  private active = false;
  private form: HTMLFormElement;
  private input: HTMLInputElement;
  private watchPanel: HTMLElement;
  private number: HTMLElement;
  private preview: HTMLElement;
  private error: HTMLElement;
  private timer: HTMLElement;
  private animation?: Animation;

  constructor(private context: GameContext) {
    const root = context.root;
    this.form = element(root, "[data-number-form]");
    this.input = element(root, "[data-answer]");
    this.watchPanel = element(root, "[data-number-watch]");
    this.number = element(root, "[data-number]");
    this.preview = element(root, "[data-number-preview]");
    this.error = element(root, "[data-input-error]");
    this.timer = element(root, "[data-timer]");
    this.form.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        if (!this.active) return;
        const answer = this.input.value.trim();
        if (!/^\d+$/.test(answer)) {
          this.error.textContent = answer
            ? "Use digits 0–9 only."
            : "Type the number before checking.";
          this.input.setAttribute("aria-invalid", "true");
          this.input.focus();
          return;
        }
        const correct = checkNumber(this.target, answer);
        this.disable();
        this.form.hidden = true;
        this.watchPanel.hidden = false;
        element(this.context.root, "[data-number-label]").textContent = correct
          ? "That's the number."
          : "The number was";
        this.number.textContent = this.target;
        this.timer.parentElement!.hidden = true;
        this.context.resolve(
          correct,
          correct
            ? `${this.target.length} ${this.target.length === 1 ? "digit, right where you left it" : "digits, right where you left them"}.`
            : `The number was ${this.target}. You entered ${answer}.`,
        );
      },
      { signal: context.events },
    );
    this.input.addEventListener(
      "input",
      () => {
        this.error.textContent = "";
        this.input.removeAttribute("aria-invalid");
      },
      { signal: context.events },
    );
  }

  reset() {
    this.disable();
    this.target = "";
    this.number.textContent = "";
    this.form.hidden = true;
    this.watchPanel.hidden = true;
    this.preview.hidden = false;
  }

  prepare(level: number) {
    this.target = createNumber(level);
    this.input.value = "";
    this.error.textContent = "";
    this.input.removeAttribute("aria-invalid");
    this.sizeFor(level);
  }

  snapshot() {
    return this.target;
  }

  restore(challenge: unknown, level: number) {
    const target = parseNumber(challenge, level);
    if (!target) return false;
    this.target = target;
    this.sizeFor(level);
    this.disable();
    return true;
  }

  private sizeFor(level: number) {
    this.number.style.fontSize = `${Math.max(1, Math.min(3.5, 18 / level))}rem`;
  }

  async watch() {
    this.disable();
    this.context.playbackAction(null);
    this.input.value = "";
    this.error.textContent = "";
    this.input.removeAttribute("aria-invalid");
    this.preview.hidden = true;
    this.form.hidden = true;
    this.watchPanel.hidden = false;
    element(this.context.root, "[data-number-label]").textContent =
      "Remember this";
    this.number.textContent = this.target;
    this.timer.parentElement!.hidden = false;
    const duration = numberWatchDuration(this.target.length);
    this.animation = this.timer.animate(
      [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }],
      { duration, easing: "linear", fill: "forwards" },
    );
    this.context.announce(`Remember: ${this.target.split("").join(" ")}.`);
    return this.context.clock.wait(duration);
  }

  recall() {
    this.animation?.cancel();
    this.active = true;
    this.watchPanel.hidden = true;
    this.number.textContent = "";
    this.form.hidden = false;
    this.input.disabled = false;
    this.input.focus({ preventScroll: true });
  }

  disable() {
    this.active = false;
    this.input.disabled = true;
    this.animation?.cancel();
  }

  dispose() {
    this.disable();
  }
}
