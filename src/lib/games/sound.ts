/** Small, synthesized sounds. No downloads, autoplay, or required audio cues. */
export class GameSound {
  enabled = false;
  private context?: AudioContext;
  private oscillators = new Set<OscillatorNode>();

  unlock() {
    if (!this.enabled) return;
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
    } catch {
      // The visual game still works when audio isn't available.
    }
  }

  play(kind: "tile" | "win" | "lose", tile = 0) {
    if (!this.enabled || this.context?.state !== "running") return;
    const context = this.context;
    const notes =
      kind === "win"
        ? [523, 659, 784]
        : kind === "lose"
          ? [220, 165]
          : [330 * 2 ** (tile / 12)];
    for (const [index, frequency] of notes.entries()) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.09;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.065, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      this.oscillators.add(oscillator);
      oscillator.onended = () => {
        this.oscillators.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(start);
      oscillator.stop(start + 0.2);
    }
  }

  stop() {
    for (const oscillator of this.oscillators) {
      try {
        oscillator.stop();
      } catch {
        /* Already stopped. */
      }
    }
    this.oscillators.clear();
  }

  dispose() {
    this.stop();
    void this.context?.close().catch(() => {});
  }
}
