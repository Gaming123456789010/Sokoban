let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  try {
    ctx = new AudioContext();
    return ctx;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(v: boolean): boolean {
  muted = v;
  return muted;
}

function tone(freq: number, duration: number, type: OscillatorType, volume = 0.12): void {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  // Resume if suspended (autoplay policy)
  if (c.state === 'suspended') c.resume();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export function sfxMove(): void {
  tone(600, 0.08, 'square', 0.06);
}

export function sfxPush(): void {
  tone(200, 0.12, 'triangle', 0.12);
  setTimeout(() => tone(400, 0.08, 'triangle', 0.08), 50);
}

export function sfxSolve(): void {
  tone(523, 0.15, 'sine', 0.12);
  setTimeout(() => tone(659, 0.15, 'sine', 0.12), 130);
  setTimeout(() => tone(784, 0.25, 'sine', 0.15), 260);
}
