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
  }
}
export const audio = new AudioManager();
