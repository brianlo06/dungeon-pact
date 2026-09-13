export interface Settings {
  master: number;
  music: number;
  sfx: number;
  ui: number;
  ambient: number;
  muted: boolean;
  reducedMotion: boolean;
  /**
   * How Ultimates play: the whole film, the condensed cut, or the whole film
   * the first time a player sees each one and the condensed cut after.
   */
  cinematics: "full" | "fast" | "first";
}
export const defaultSettings: Settings = {
  master: 0.5,
  music: 0.25,
  sfx: 0.6,
  ui: 0.35,
  ambient: 0.2,
  muted: false,
  reducedMotion: false,
  cinematics: "full",
};
class AudioManager {
  private ctx: AudioContext | null = null;
  private ambience: { gain: GainNode; voices: OscillatorNode[] } | null = null;
  private scene = "";
  private biome = "foundry";
  private boss = false;
  private score: ScorePlayer | null = null;
  settings = defaultSettings;
  unlock() {
    this.ctx ??= new AudioContext();
    void this.ctx.resume();
    this.setScene(this.scene, this.biome, this.boss);
  }
  /** Two quiet original tones: no asset downloads or perpetual timer loop. */
  setScene(scene: string, biome = "foundry", boss = false) {
    this.scene = scene;
    this.biome = biome;
    this.boss = boss;
    if (!this.ctx) return;
    const ctx = this.ctx;
    this.score ??= new ScorePlayer(ctx);
    this.score.set(
      selectScore(scene, biome, boss),
      this.settings.master * this.settings.music,
      !!scene &&
        !document.hidden &&
        !this.settings.muted &&
        this.settings.music > 0 &&
        this.settings.master > 0,
    );
    if (!this.ambience) {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      const voices = [0, 1].map(() => {
        const voice = ctx.createOscillator();
        voice.type = "sine";
        voice.connect(gain);
        voice.start();
        return voice;
      });
      this.ambience = { gain, voices };
    }
    const frequency =
      scene === "COMBAT"
        ? 55
        : scene === "AUCTION" || scene === "SHOP"
          ? 82.4
          : 65.4;
    this.ambience.voices.forEach((voice, i) =>
      voice.frequency.setTargetAtTime(
        frequency * (i ? 1.502 : 1),
        ctx.currentTime,
        0.6,
      ),
    );
    const volume =
      this.settings.muted || !scene || document.hidden
        ? 0
        : this.settings.master * this.settings.ambient * 0.035;
    this.ambience.gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.15);
  }
  /** Dip the music under a moment that needs the room, then bring it back. */
  duck(level: number, seconds: number) {
    this.score?.duck(level, seconds);
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
import { ScorePlayer, selectScore } from "./audio/score";
