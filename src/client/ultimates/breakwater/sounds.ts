import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Breakwater's sounds. Cold where the Lantern Wall is warm and the Breaker is
 * hot: an iron shield knocked with a gauntlet, glassy held tones, and a wave
 * that is noise and metal rather than water. All original synthesis.
 */
export const voices: Record<string, Voice> = {
  /** The call: two knocks of a gauntlet on the shield, and a cold open fifth. */
  "breakwater-knock": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const at of [0, 0.13]) {
        hit(c, o, t + at, { type: "sine", from: 120, to: 58, gain: at ? 0.55 : 0.42, decay: 0.3 });
        hit(c, o, t + at, { type: "square", from: 540, to: 300, gain: 0.08, decay: 0.12 });
        crash(c, o, t + at, { seconds: 0.09, gain: 0.3, type: "bandpass", freq: 900, q: 1.4 });
      }
      swell(c, o, t + 0.16, { type: "triangle", freq: hz(45), gain: 0.07, attack: 0.2, hold: 0.5, release: 1.2, cutoff: 900 });
      swell(c, o, t + 0.16, { type: "triangle", freq: hz(52), gain: 0.05, attack: 0.25, hold: 0.45, release: 1.2, cutoff: 900 });
    },
  },
  /** The tally: metal ticks across the shield, each a little sooner than the last. */
  "breakwater-tally": {
    bus: "sfx",
    render: (c, o, t) => {
      let at = 0;
      for (let i = 0; i < 9; i++) {
        const pitch = 2400 + ((i * 7) % 5) * 260;
        hit(c, o, t + at, { type: "sine", from: pitch, to: pitch * 0.92, gain: 0.07 + i * 0.006, decay: 0.09 });
        hit(c, o, t + at, { type: "triangle", from: 180 + i * 6, to: 110, gain: 0.12, decay: 0.06 });
        at += 0.07 - i * 0.004;
      }
      // All of them at once: a low ring from the whole shield.
      hit(c, o, t + at + 0.05, { type: "sine", from: 311, gain: 0.08, attack: 0.01, decay: 1.1 });
      hit(c, o, t + at + 0.05, { type: "sine", from: 467, gain: 0.05, attack: 0.01, decay: 0.9 });
    },
  },
  /**
   * Breakwater's motif: a low fall of a fourth, a step back up, and a held
   * note that does not resolve — patience, not triumph.
   */
  "breakwater-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes: [number, number, number][] = [
        [50, 0, 0.26],
        [45, 0.24, 0.26],
        [47, 0.46, 0.2],
        [50, 0.64, 0.8],
      ];
      for (const [pitch, at, hold] of notes) {
        swell(c, o, t + at, { freq: hz(pitch - 12), gain: 0.08, attack: 0.07, hold, release: 0.45, cutoff: 700 });
        swell(c, o, t + at, { type: "triangle", freq: hz(pitch), gain: 0.06, attack: 0.05, hold, release: 0.5, cutoff: 1800 });
      }
      hit(c, o, t + 0.64, { type: "sine", from: hz(74), gain: 0.04, attack: 0.02, decay: 1.4 });
    },
  },
  /** The tide rising: a roar of noise climbing, iron grinding in it. */
  "breakwater-surge": {
    bus: "sfx",
    render: (c, o, t) => {
      const source = c.createOscillator();
      const f = c.createBiquadFilter();
      const g = c.createGain();
      source.type = "sawtooth";
      source.frequency.setValueAtTime(38, t);
      source.frequency.exponentialRampToValueAtTime(62, t + 0.9);
      f.type = "lowpass";
      f.frequency.setValueAtTime(120, t);
      f.frequency.exponentialRampToValueAtTime(900, t + 0.9);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.8);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
      source.connect(f).connect(g).connect(o);
      source.start(t);
      source.stop(t + 1.1);
      crash(c, o, t, { seconds: 1.0, gain: 0.18, type: "lowpass", freq: 300, sweepTo: 2600, q: 0.6 });
      crash(c, o, t + 0.3, { seconds: 0.7, gain: 0.06, type: "bandpass", freq: 3200, sweepTo: 1800, q: 2 });
    },
  },
  /** The quiet: one glassy note, two partials beating slowly against each other. */
  "breakwater-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sine", freq: 1244, gain: 0.03, attack: 0.12, hold: 0.28, release: 0.35 });
      swell(c, o, t, { type: "sine", freq: 1247.5, gain: 0.025, attack: 0.14, hold: 0.26, release: 0.35 });
      swell(c, o, t, { type: "sine", freq: 93, gain: 0.03, attack: 0.1, hold: 0.3, release: 0.3 });
    },
  },
  /** Leather and iron: the grip tightening. */
  "breakwater-grip": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.12, gain: 0.1, type: "bandpass", freq: 1400, q: 5 });
      crash(c, o, t + 0.05, { seconds: 0.08, gain: 0.07, type: "bandpass", freq: 1900, q: 6 });
      hit(c, o, t + 0.1, { type: "sine", from: 2900, gain: 0.03, decay: 0.2 });
    },
  },
  /**
   * The break, in layers: a transient; a sub that drops; the shield ringing
   * like a struck bell of iron (inharmonic partials, long); the wave's noise
   * body cut off hard; and a rain of steel shards falling after.
   */
  "breakwater-break": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.8, type: "highpass", freq: 2200, q: 0.5 });
      hit(c, o, t, { type: "sine", from: 110, to: 24, gain: 1, attack: 0.002, decay: 0.9 });
      for (const [f, g, d] of [
        [233, 0.14, 1.6],
        [587, 0.08, 1.3],
        [811, 0.06, 1.1],
        [1377, 0.035, 0.8],
      ])
        hit(c, o, t + 0.004, { type: "sine", from: f, gain: g, attack: 0.003, decay: d });
      crash(c, o, t, { seconds: 0.45, gain: 0.6, type: "lowpass", freq: 2400, sweepTo: 200, q: 0.5 });
      for (let i = 0; i < 12; i++) {
        const at = 0.12 + i * 0.045 + ((i * 37) % 11) * 0.006;
        hit(c, o, t + at, { type: "square", from: 3000 + ((i * 53) % 7) * 240, to: 1800, gain: 0.03, decay: 0.05 });
      }
    },
  },
  /** Everything going back: a reversed swell, then three answering blows. */
  "breakwater-return": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.18, gain: 0.25, type: "bandpass", freq: 600, sweepTo: 3600, q: 0.8 });
      for (const [i, at] of [0.13, 0.2, 0.26].entries()) {
        hit(c, o, t + at, { type: "sine", from: 150 - i * 20, to: 40, gain: 0.6, attack: 0.002, decay: 0.35 });
        hit(c, o, t + at, { type: "square", from: 900 - i * 90, to: 400, gain: 0.08, decay: 0.2 });
        crash(c, o, t + at, { seconds: 0.2, gain: 0.3, freq: 1600, sweepTo: 300, q: 0.7 });
      }
    },
  },
  /** After: the fifth again, lower, and the shield still faintly ringing. */
  "breakwater-hold": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "triangle", freq: hz(38), gain: 0.07, attack: 0.15, hold: 0.4, release: 1.1, cutoff: 700 });
      swell(c, o, t + 0.05, { type: "triangle", freq: hz(45), gain: 0.05, attack: 0.18, hold: 0.35, release: 1.1, cutoff: 800 });
      hit(c, o, t + 0.08, { type: "sine", from: 233, gain: 0.04, attack: 0.02, decay: 1.6 });
    },
  },
};
