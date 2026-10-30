let audioCtx: AudioContext | null = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
}

async function getCtx(): Promise<AudioContext> {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") await audioCtx.resume();
  return audioCtx;
}

function tone(
  ctx: AudioContext,
  type: OscillatorType,
  freqStart: number,
  freqEnd: number,
  duration: number,
  gainPeak: number,
  startTime = ctx.currentTime,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, startTime);
  osc.frequency.linearRampToValueAtTime(freqEnd, startTime + duration);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

export async function synthJump() {
  if (muted) return;
  const ctx = await getCtx();
  tone(ctx, "triangle", 180, 340, 0.12, 0.045);
}

export async function synthDoubleJump() {
  if (muted) return;
  const ctx = await getCtx();
  tone(ctx, "triangle", 300, 540, 0.1, 0.04);
}

export async function synthUnmute() {
  const ctx = await getCtx();
  const t = ctx.currentTime;
  tone(ctx, "sine", 440, 440, 0.08, 0.04, t);
  tone(ctx, "sine", 660, 660, 0.1, 0.04, t + 0.09);
}

export async function synthDeath() {
  if (muted) return;
  const ctx = await getCtx();
  const t = ctx.currentTime;
  tone(ctx, "triangle", 240, 90, 0.22, 0.045, t);
  tone(ctx, "sine", 140, 65, 0.18, 0.025, t + 0.03);
}

export async function synthBest() {
  if (muted) return;
  const ctx = await getCtx();
  const t = ctx.currentTime;
  tone(ctx, "sine", 440, 520, 0.12, 0.035, t);
  tone(ctx, "sine", 660, 780, 0.18, 0.03, t + 0.11);
}
