import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * The Hundredth Mark's sounds. Wood, gut string and a kid's breath — nothing
 * brass, nothing iron, nothing storm — and one sound that belongs to it
 * alone: the tally, a mark cut for every enemy counted, the last one heavier.
 *
 * The motif is a hunter's call: two notes a fourth apart, a step down, and a
 * held note an octave above where it started. Plucked, not blown.
 */

/** A plucked string: a click, a body and a short ring. */
function pluck(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.1, ring = 0.5) {
  crash(c, o, t, { seconds: 0.02, gain: gain * 1.2, type: "highpass", freq: 3200, q: 0.6 });
  hit(c, o, t, { type: "triangle", from: hz(midi), gain, attack: 0.003, decay: ring });
  hit(c, o, t, { type: "sine", from: hz(midi + 12), gain: gain * 0.35, attack: 0.003, decay: ring * 0.6 });
}

export const voices: Record<string, Voice> = {
  /** The bow drawn: wood bending and a string creaking under the hand. */
  "hundredth-draw": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.5, gain: 0.1, freq: 380, sweepTo: 900, q: 9 });
      for (let i = 0; i < 7; i++)
        crash(c, o, t + 0.04 + i * 0.06 + (i % 2) * 0.012, { seconds: 0.025, gain: 0.05 + i * 0.006, freq: 700 + i * 60, q: 11 });
      hit(c, o, t, { type: "sawtooth", from: 70, to: 96, gain: 0.03, attack: 0.2, decay: 0.5 });
    },
  },
  /** The nock clicking onto the string. */
  "hundredth-nock": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.3, freq: 2600, q: 5 });
      hit(c, o, t, { type: "sine", from: 1600, to: 900, gain: 0.06, decay: 0.05 });
    },
  },
  /**
   * The tally: marks cut into the enemy line one after another, closing up,
   * the last heavier — the one that counts.
   */
  "hundredth-tally": {
    bus: "sfx",
    render: (c, o, t) => {
      const at = [0, 0.13, 0.24, 0.33, 0.41];
      for (const [i, dt] of at.entries()) {
        const last = i === at.length - 1;
        crash(c, o, t + dt, { seconds: last ? 0.06 : 0.035, gain: last ? 0.34 : 0.2, freq: 1900 + i * 240, q: 3 });
        hit(c, o, t + dt, { type: "sine", from: hz(84 + i * 2), gain: last ? 0.09 : 0.05, decay: last ? 0.6 : 0.2 });
        if (last) hit(c, o, t + dt, { type: "sine", from: 180, to: 90, gain: 0.3, decay: 0.3 });
      }
    },
  },
  /** The motif: plucked, a hunter's call. */
  "hundredth-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      pluck(c, o, t, 64, 0.1, 0.4);
      pluck(c, o, t + 0.16, 69, 0.1, 0.4);
      pluck(c, o, t + 0.28, 67, 0.09, 0.35);
      pluck(c, o, t + 0.46, 76, 0.11, 0.9);
      swell(c, o, t + 0.46, { type: "sine", freq: hz(76), gain: 0.04, attack: 0.05, hold: 0.35, release: 0.6, detune: 6 });
      swell(c, o, t + 0.46, { type: "triangle", freq: hz(64), gain: 0.035, attack: 0.1, hold: 0.3, release: 0.6 });
    },
  },
  /** The choice: a held breath, and the string at the edge of breaking. */
  "hundredth-hold": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.4, gain: 0.07, freq: 900, sweepTo: 400, q: 0.8 });
      swell(c, o, t, { type: "sine", freq: hz(95), gain: 0.018, attack: 0.25, hold: 0.25, release: 0.2 });
      for (let i = 0; i < 5; i++)
        crash(c, o, t + 0.1 + i * 0.08, { seconds: 0.02, gain: 0.04, freq: 820 + i * 30, q: 12 });
    },
  },
  /** The loose: a gut string let go, a thrum, and nothing after it. */
  "hundredth-loose": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.55, type: "highpass", freq: 2600, q: 0.7 });
      hit(c, o, t, { type: "triangle", from: 196, to: 150, gain: 0.34, attack: 0.002, decay: 0.32 });
      hit(c, o, t + 0.004, { type: "sine", from: 98, to: 80, gain: 0.3, decay: 0.28 });
      crash(c, o, t, { seconds: 0.14, gain: 0.2, freq: 900, sweepTo: 300, q: 1.5 });
    },
  },
  /** The arrow in the silence: a thin whistle, passing. */
  "hundredth-whistle": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 2300, to: 1500, gain: 0.03, attack: 0.18, decay: 0.55 });
      crash(c, o, t, { seconds: 0.55, gain: 0.05, freq: 2800, sweepTo: 1200, q: 6 });
    },
  },
  /**
   * The hit, in layers: the tip's click, a sub that drops away, a wooden
   * body, and the sign breaking like glass over it.
   */
  "hundredth-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.85, type: "highpass", freq: 3400, q: 0.5 });
      hit(c, o, t, { type: "sine", from: 150, to: 28, gain: 0.95, attack: 0.002, decay: 0.75 });
      hit(c, o, t + 0.003, { type: "triangle", from: 420, to: 140, gain: 0.3, decay: 0.2 });
      crash(c, o, t + 0.004, { seconds: 0.18, gain: 0.45, freq: 600, sweepTo: 200, q: 2.2 });
      crash(c, o, t + 0.01, { seconds: 1.1, gain: 0.26, type: "lowpass", freq: 300, sweepTo: 50, q: 0.4 });
    },
  },
  /** The mark cashed in: a pane of light breaking. */
  "hundredth-break": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 9; i++)
        crash(c, o, t + 0.012 + i * 0.022, { seconds: 0.06 + (i % 3) * 0.03, gain: 0.12, freq: 3200 + ((i * 1511) % 4800), q: 4 });
      hit(c, o, t, { type: "sine", from: hz(96), gain: 0.07, decay: 0.7 });
      hit(c, o, t + 0.01, { type: "sine", from: hz(91), gain: 0.05, decay: 0.8 });
    },
  },
  /** The marks left for the party: soft, one for each, settling. */
  "hundredth-left": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, p] of [76, 81, 83, 88].entries())
        hit(c, o, t + i * 0.07, { type: "sine", from: hz(p), gain: 0.05, attack: 0.01, decay: 0.8 });
      crash(c, o, t, { seconds: 0.5, gain: 0.03, freq: 5000, sweepTo: 8000, q: 0.5 });
    },
  },
};
