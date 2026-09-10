export interface Settings {
  master: number;
  music: number;
  sfx: number;
  ui: number;
  ambient: number;
  muted: boolean;
  reducedMotion: boolean;
}
export const defaultSettings: Settings = {
  master: 0.5,
  music: 0.25,
  sfx: 0.6,
  ui: 0.35,
  ambient: 0.2,
  muted: false,
  reducedMotion: false,
};
class AudioManager {
  private ctx: AudioContext | null = null;
  settings = defaultSettings;
  unlock() {
    this.ctx ??= new AudioContext();
    void this.ctx.resume();
  }
  /** Short filtered noise burst: gives impacts a body a pure tone cannot. */
  private noise(level: number, duration: number, freq: number) {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const frames = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++)
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq, t);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.35, t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t);
    src.stop(t + duration);
  }
  cue(kind: "click" | "gold" | "combo" | "damage" | "heal" | "info") {
    if (!this.ctx || this.settings.muted) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    osc.type = kind === "damage" ? "triangle" : "sine";
    const freq = {
      click: 380,
      gold: 950,
      combo: 620,
      damage: 100,
      heal: 520,
      info: 260,
    }[kind];
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(
      kind === "damage" ? 45 : freq * 1.5,
      t + 0.12,
    );
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(
        0.0001,
        this.settings.master *
          (kind === "click" ? this.settings.ui : this.settings.sfx) *
          0.2,
      ),
      t + 0.01,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
    // A hit needs a transient as well as a tone, or the round reads as beeping.
    const volume = this.settings.master * this.settings.sfx;
    if (kind === "damage") this.noise(volume * 0.22, 0.16, 1400);
    if (kind === "combo") this.noise(volume * 0.16, 0.26, 3200);
  }
}
export const audio = new AudioManager();
