// Lightweight WebAudio sound effects - no asset files needed.
let ctx: AudioContext | null = null;
let muted = false;
let coinMuted = false;
let coinVolume = 1; // 0..1
let haptics = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function setMuted(m: boolean) {
  muted = m;
  if (typeof window !== "undefined") localStorage.setItem("vr-muted", String(m));
}

export function isMuted() {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("vr-muted") === "true") muted = true;
  return muted;
}

export function setCoinMuted(m: boolean) {
  coinMuted = m;
  if (typeof window !== "undefined") localStorage.setItem("vr-coin-muted", String(m));
}
export function isCoinMuted() {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("vr-coin-muted") === "true") coinMuted = true;
  return coinMuted;
}
export function setCoinVolume(v: number) {
  coinVolume = Math.max(0, Math.min(1, v));
  if (typeof window !== "undefined") localStorage.setItem("vr-coin-vol", String(coinVolume));
}
export function getCoinVolume() {
  if (typeof window === "undefined") return coinVolume;
  const raw = localStorage.getItem("vr-coin-vol");
  if (raw != null) coinVolume = Math.max(0, Math.min(1, parseFloat(raw)));
  return coinVolume;
}

export function setHapticsEnabled(m: boolean) {
  haptics = m;
  if (typeof window !== "undefined") localStorage.setItem("vr-haptics", String(m));
}
export function isHapticsEnabled() {
  if (typeof window === "undefined") return haptics;
  const raw = localStorage.getItem("vr-haptics");
  if (raw != null) haptics = raw === "true";
  return haptics;
}
export function vibrate(pattern: number | number[]) {
  if (!isHapticsEnabled()) return;
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try { navigator.vibrate(pattern); } catch { /* ignore */ }
  }
}

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  // user override
  const ov = localStorage.getItem("vr-reduced-motion");
  if (ov === "true") return true;
  if (ov === "false") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
export function setReducedMotion(v: boolean) {
  if (typeof window !== "undefined") localStorage.setItem("vr-reduced-motion", String(v));
}

function tone(freq: number, duration = 0.12, type: OscillatorType = "sine", gain = 0.08, ramp = 0) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (ramp) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + ramp), c.currentTime + duration);
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const sfx = {
  buy: () => { tone(660, 0.08, "triangle", 0.08); setTimeout(() => tone(880, 0.12, "triangle", 0.08), 70); },
  use: () => { tone(520, 0.1, "sine", 0.07); setTimeout(() => tone(780, 0.1, "sine", 0.07), 60); },
  coin: () => {
    if (isCoinMuted()) return;
    const v = getCoinVolume();
    if (v <= 0) return;
    tone(900, 0.06, "square", 0.05 * v);
    setTimeout(() => tone(1300, 0.1, "square", 0.05 * v), 50);
  },
  click: () => tone(440, 0.05, "triangle", 0.04),
  work: () => { tone(330, 0.1, "sawtooth", 0.06); setTimeout(() => tone(440, 0.1, "sawtooth", 0.06), 90); },
  play: () => { tone(700, 0.08, "sine", 0.06); setTimeout(() => tone(880, 0.08, "sine", 0.06), 80); setTimeout(() => tone(1100, 0.12, "sine", 0.06), 160); },
  sleep: () => tone(300, 0.4, "sine", 0.06, -120),
  bad: () => tone(180, 0.25, "sawtooth", 0.07, -80),
  good: () => { tone(523, 0.1, "triangle", 0.07); setTimeout(() => tone(659, 0.1, "triangle", 0.07), 90); setTimeout(() => tone(784, 0.15, "triangle", 0.07), 180); },
  event: () => { tone(440, 0.08, "triangle", 0.07); setTimeout(() => tone(660, 0.12, "triangle", 0.07), 100); },
  mission: () => { tone(523, 0.08, "square", 0.06); setTimeout(() => tone(784, 0.08, "square", 0.06), 80); setTimeout(() => tone(1046, 0.16, "square", 0.06), 160); },
};
