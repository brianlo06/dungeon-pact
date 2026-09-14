import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Compound Interest's sounds. Copper, leather and teeth — nothing brass,
 * nothing wooden, no paper, no bell — and one sound that belongs to it alone:
 * the bite, a tooth closing on soft metal, whose ring bends downward as the
 * metal gives.
 *
 * The motif is the film's idea as a rhythm: four notes, D3 F3 A3 D4, where
 * each note is a group of repeats and the group doubles — one, two, four,
 * eight — so the tune arrives faster than it started and sprays at the end.
 * The tone is a dry stopped pipe: a triangle with a click on the attack and
 * almost no tail, which is nothing like Foreclosure's struck coins.
 */

/** A dry stopped-pipe note: a click, the tone, and a fifth under it. */
function pipe(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.09, decay = 0.13) {
  const f = hz(midi);
  crash(c, o, t, { seconds: 0.008, gain: gain * 0.9, type: "highpass", freq: 3800, q: 0.7 });
  hit(c, o, t, { type: "triangle", from: f, gain, attack: 0.002, decay });
  hit(c, o, t, { type: "sine", from: f * 1.5, gain: gain * 0.28, attack: 0.003, decay: decay * 0.7 });
}

/** One coin: a small dry tick with a copper ring behind it. */
function tick(c: AudioContext, o: AudioNode, t: number, gain = 0.12, pitch = 0) {
  crash(c, o, t, { seconds: 0.01, gain: gain * 1.6, type: "highpass", freq: 5200, q: 0.8 });
  hit(c, o, t, { type: "sine", from: 2450 * 2 ** (pitch / 12), gain: gain * 0.5, attack: 0.001, decay: 0.05 });
  hit(c, o, t + 0.002, { type: "sine", from: 1630 * 2 ** (pitch / 12), gain: gain * 0.3, attack: 0.001, decay: 0.09 });
}

/** Loose coin moving against itself: a handful, a pouch, a slope of shingle. */
function shingle(c: AudioContext, o: AudioNode, t: number, seconds: number, gain = 0.2) {
  crash(c, o, t, { seconds, gain: gain * 0.5, type: "bandpass", freq: 3400, sweepTo: 1800, q: 1.1 });
  const n = Math.max(3, Math.round(seconds * 26));
  for (let i = 0; i < n; i++) {
    const k = i / n;
    tick(c, o, t + k * seconds * (0.9 + (i % 3) * 0.05), gain * 0.16 * (1 - k * 0.5), (i % 5) * 2 - 4);
  }
}

export const voices: Record<string, Voice> = {
  /** The call: a drawstring pulled, and the pouches shifting on the belt. */
  "usury-open": {
    bus: "sfx",
    render: (c, o, t) => {
      // Leather: a soft low scrape, not a clank.
      crash(c, o, t, { seconds: 0.16, gain: 0.22, type: "bandpass", freq: 900, sweepTo: 420, q: 1.4 });
      shingle(c, o, t + 0.06, 0.3, 0.2);
      hit(c, o, t + 0.04, { type: "sine", from: 96, to: 64, gain: 0.18, attack: 0.004, decay: 0.22 });
    },
  },

  /**
   * The bite. A tooth closes on soft metal: a dull click, and a ring that
   * bends down as the copper gives, stopped short by the jaw holding it.
   */
  "usury-bite": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.018, gain: 0.5, type: "highpass", freq: 2600, q: 0.6 });
      crash(c, o, t, { seconds: 0.05, gain: 0.3, type: "bandpass", freq: 700, sweepTo: 260, q: 1.6 });
      hit(c, o, t + 0.004, { type: "triangle", from: 1840, to: 880, gain: 0.2, attack: 0.002, decay: 0.24 });
      hit(c, o, t + 0.004, { type: "sine", from: 1240, to: 610, gain: 0.12, attack: 0.002, decay: 0.18 });
      hit(c, o, t, { type: "sine", from: 150, to: 70, gain: 0.2, attack: 0.002, decay: 0.16 });
    },
  },

  /** The motif: D3, F3, A3, D4, each note split into twice as many as the last. */
  "usury-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes: [number, number, number][] = [
        // midi, how many repeats, when the group starts
        [50, 1, 0],
        [53, 2, 0.2],
        [57, 4, 0.4],
        [62, 8, 0.6],
      ];
      for (const [midi, count, at] of notes) {
        const gap = 0.16 / count;
        for (let i = 0; i < count; i++)
          pipe(c, o, t + at + i * gap, midi, 0.085 * (1 - i / (count * 2)), count > 4 ? 0.08 : 0.14);
      }
      // The low D the whole thing is borrowed against.
      swell(c, o, t, { type: "triangle", freq: hz(38), gain: 0.05, attack: 0.06, hold: 0.55, release: 0.5, cutoff: 620 });
      swell(c, o, t + 0.6, { type: "sawtooth", freq: hz(50), gain: 0.035, attack: 0.03, hold: 0.2, release: 0.5, cutoff: 900 });
    },
  },

  /** The walls answering: a dry ripple of clicks running away across the crust. */
  "usury-stir": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 34; i++) {
        const k = i / 34;
        tick(c, o, t + k * 0.62 + (i % 3) * 0.004, 0.05 * (1 - k * 0.6), 6 - k * 14);
      }
      crash(c, o, t + 0.05, { seconds: 0.5, gain: 0.08, type: "bandpass", freq: 2600, sweepTo: 900, q: 0.9 });
    },
  },

  /** The loan made: a dull push, a copper scrape, and the coin seating. */
  "usury-press": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.13, gain: 0.3, type: "lowpass", freq: 620, sweepTo: 220, q: 0.6 });
      crash(c, o, t + 0.04, { seconds: 0.12, gain: 0.16, type: "bandpass", freq: 2100, sweepTo: 3400, q: 3 });
      hit(c, o, t + 0.02, { type: "sine", from: 120, to: 52, gain: 0.28, attack: 0.004, decay: 0.2 });
      tick(c, o, t + 0.15, 0.16, -3);
    },
  },

  /** The quiet: one new coin, budding off the first. */
  "usury-tick": { bus: "sfx", render: (c, o, t) => tick(c, o, t, 0.14, 0) },
  /** A hair higher: the second generation, and the third. */
  "usury-tick-up": { bus: "sfx", render: (c, o, t) => tick(c, o, t, 0.13, 5) },

  /**
   * The runaway: the ticks double and double until they are not ticks any
   * more. Ends on the impact, which starts where this stops.
   */
  "usury-run": {
    bus: "sfx",
    render: (c, o, t) => {
      let at = 0;
      let gap = 0.075;
      let i = 0;
      while (at < 0.42 && i < 80) {
        tick(c, o, t + at, 0.05 + 0.06 * (at / 0.42), 8 - (at / 0.42) * 20);
        at += gap;
        gap = Math.max(0.007, gap * 0.82);
        i++;
      }
      crash(c, o, t + 0.18, { seconds: 0.26, gain: 0.14, type: "bandpass", freq: 1800, sweepTo: 3800, q: 0.9 });
    },
  },

  /**
   * The debt called in, in layers: the clatter of a thousand coppers arriving
   * at once, a sub that drops away under it, the dull mass of them landing,
   * and the tail of the shingle sliding back down the sink.
   */
  "usury-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.05, gain: 0.95, type: "highpass", freq: 2400, q: 0.5 });
      crash(c, o, t, { seconds: 0.12, gain: 0.6, type: "bandpass", freq: 1100, sweepTo: 380, q: 1 });
      hit(c, o, t, { type: "sine", from: 132, to: 24, gain: 0.95, attack: 0.002, decay: 0.75 });
      // The mass: a chest of coppers dropped on stone, inharmonic and dull.
      hit(c, o, t + 0.006, { type: "triangle", from: 196, gain: 0.3, attack: 0.002, decay: 0.5 });
      hit(c, o, t + 0.006, { type: "sine", from: 196 * 1.84, gain: 0.16, attack: 0.002, decay: 0.34 });
      hit(c, o, t + 0.006, { type: "sine", from: 196 * 3.1, gain: 0.09, attack: 0.002, decay: 0.2 });
      shingle(c, o, t + 0.1, 0.55, 0.26);
      crash(c, o, t + 0.02, { seconds: 1, gain: 0.24, type: "lowpass", freq: 300, sweepTo: 50, q: 0.4 });
    },
  },

  /** On the board: the crust sheds, and the coppers land on the floor. */
  "usury-drip": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 6; i++) tick(c, o, t + i * 0.11 + (i % 2) * 0.03, 0.09, 4 - i * 3);
      crash(c, o, t + 0.2, { seconds: 0.3, gain: 0.07, type: "bandpass", freq: 2200, sweepTo: 1100, q: 1 });
    },
  },

  /** The pact's cut: a warm copper chord, rising, one step for each round of it. */
  "usury-dividend": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "triangle", freq: hz(50), gain: 0.075, attack: 0.06, hold: 0.26, release: 0.5, cutoff: 880 });
      swell(c, o, t + 0.03, { type: "sine", freq: hz(62), gain: 0.055, attack: 0.07, hold: 0.24, release: 0.5 });
      swell(c, o, t + 0.3, { type: "triangle", freq: hz(57), gain: 0.07, attack: 0.05, hold: 0.24, release: 0.6, cutoff: 1000 });
      swell(c, o, t + 0.33, { type: "sine", freq: hz(69), gain: 0.05, attack: 0.06, hold: 0.22, release: 0.6 });
      tick(c, o, t + 0.02, 0.1, 2);
      tick(c, o, t + 0.32, 0.1, 7);
    },
  },
};
