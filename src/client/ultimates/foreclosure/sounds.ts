import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Foreclosure's sounds. Brass and coin, leather and a counting-house floor —
 * nothing wooden, nothing glass, no storm and no string — and one sound that
 * belongs to it alone: a coin spun on brass, whirring faster and lower as it
 * wobbles down, and then nothing at all.
 *
 * The motif is struck coins: C, E♭, D, then G a fifth below — short, short,
 * short, long. A pleased tut-tut. The partials are a struck plate's, not a
 * bell's, so it rings like money.
 */

/** A struck coin or brass plate: a click, the note, and two inharmonic partials. */
function coin(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.1, ring = 0.6) {
  const f = hz(midi);
  crash(c, o, t, { seconds: 0.012, gain: gain * 1.4, type: "highpass", freq: 5200, q: 0.7 });
  hit(c, o, t, { type: "sine", from: f, gain, attack: 0.002, decay: ring });
  hit(c, o, t, { type: "sine", from: f * 2.76, gain: gain * 0.45, attack: 0.002, decay: ring * 0.55 });
  hit(c, o, t, { type: "sine", from: f * 5.4, gain: gain * 0.22, attack: 0.002, decay: ring * 0.3 });
}

/**
 * A coin spun on brass for `length` seconds: the rattle speeds up and drops in
 * pitch as it lies over, ends on one clack, and then there is nothing.
 */
function spin(c: AudioContext, o: AudioNode, t: number, length: number) {
  let at = 0;
  let i = 0;
  while (at < length && i < 90) {
    const k = at / length;
    const gap = (0.045 * (1 - k) ** 1.6 + 0.004) * (length / 0.52);
    crash(c, o, t + at, { seconds: 0.012, gain: 0.05 + 0.07 * k, freq: 5200 - 3600 * k, q: 6 });
    if (i % 3 === 0) hit(c, o, t + at, { type: "sine", from: 2400 - 1500 * k, gain: 0.012, decay: 0.03 });
    at += Math.max(0.004, gap);
    i++;
  }
  coin(c, o, t + length, 96, 0.05, 0.12);
}

export const voices: Record<string, Voice> = {
  /** A shop's counter bell, struck once: the target has been priced. */
  "foreclosure-bell": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.02, gain: 0.35, type: "highpass", freq: 4000, q: 0.6 });
      hit(c, o, t, { type: "sine", from: 2093, gain: 0.12, attack: 0.002, decay: 1.3 });
      hit(c, o, t, { type: "sine", from: 2093 * 2.32, gain: 0.05, attack: 0.002, decay: 0.7 });
      hit(c, o, t + 0.004, { type: "sine", from: 2098, gain: 0.05, attack: 0.002, decay: 1.2 });
    },
  },
  /** The appraisal: a considering hum under the breath, and the spectacles set. */
  "foreclosure-appraise": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sawtooth", freq: 118, gain: 0.035, attack: 0.08, hold: 0.18, release: 0.15, cutoff: 700 });
      swell(c, o, t + 0.2, { type: "sawtooth", freq: 104, gain: 0.03, attack: 0.05, hold: 0.12, release: 0.2, cutoff: 600 });
      crash(c, o, t + 0.1, { seconds: 0.02, gain: 0.16, freq: 3600, q: 7 });
    },
  },
  /** A thumb flicks the pan: a coin leaves it with a ping and turns over in the air. */
  "foreclosure-flick": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.02, gain: 0.3, freq: 2400, q: 3 });
      coin(c, o, t + 0.01, 100, 0.07, 0.5);
      for (let i = 0; i < 6; i++)
        hit(c, o, t + 0.06 + i * 0.045, { type: "sine", from: hz(100) * (i % 2 ? 1.02 : 0.99), gain: 0.02 * (1 - i / 6), decay: 0.04 });
    },
  },
  /** The motif: struck coins, a pleased tut-tut. */
  "foreclosure-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      coin(c, o, t, 72, 0.08, 0.35);
      coin(c, o, t + 0.13, 75, 0.08, 0.35);
      coin(c, o, t + 0.26, 74, 0.08, 0.4);
      coin(c, o, t + 0.44, 67, 0.1, 1.1);
      swell(c, o, t + 0.44, { type: "triangle", freq: hz(55), gain: 0.05, attack: 0.04, hold: 0.3, release: 0.6, cutoff: 900 });
      swell(c, o, t + 0.44, { type: "sine", freq: hz(67), gain: 0.03, attack: 0.08, hold: 0.25, release: 0.7 });
    },
  },
  /** One coin landing in a great brass pan, and the beam swinging on its pivot. */
  "foreclosure-drop": {
    bus: "sfx",
    render: (c, o, t) => {
      coin(c, o, t, 88, 0.12, 0.4);
      coin(c, o, t + 0.09, 90, 0.05, 0.2);
      coin(c, o, t + 0.14, 89, 0.03, 0.15);
      // The pan: a big plate, struck from inside.
      hit(c, o, t + 0.01, { type: "sine", from: 196, gain: 0.2, attack: 0.003, decay: 1.4 });
      hit(c, o, t + 0.01, { type: "sine", from: 196 * 2.76, gain: 0.07, attack: 0.003, decay: 0.8 });
      // The beam: a heavy clank and a groan on the pivot.
      crash(c, o, t + 0.05, { seconds: 0.12, gain: 0.35, freq: 700, q: 4 });
      hit(c, o, t + 0.05, { type: "triangle", from: 90, to: 60, gain: 0.25, decay: 0.35 });
      crash(c, o, t + 0.12, { seconds: 0.5, gain: 0.06, freq: 300, sweepTo: 520, q: 12 });
    },
  },
  /**
   * The quiet: a coin spun on brass, wobbling down. The rattle speeds up and
   * drops in pitch as it lies over, and stops dead.
   */
  "foreclosure-spin": { bus: "sfx", render: (c, o, t) => spin(c, o, t, 0.52) },
  /** The same, for the FAST cut's shorter quiet: it still stops as the coin lies flat. */
  "foreclosure-spin-fast": { bus: "sfx", render: (c, o, t) => spin(c, o, t, 0.335) },
  /**
   * The blow, in layers: the ledger's leather slap, a sub that drops away, a
   * struck brass plate (the collateral knocked off), and the room.
   */
  "foreclosure-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.035, gain: 0.9, type: "highpass", freq: 1800, q: 0.5 });
      crash(c, o, t, { seconds: 0.09, gain: 0.55, freq: 900, sweepTo: 300, q: 1.2 });
      hit(c, o, t, { type: "sine", from: 140, to: 26, gain: 1, attack: 0.002, decay: 0.8 });
      hit(c, o, t + 0.004, { type: "sine", from: 311, gain: 0.3, attack: 0.002, decay: 1.2 });
      hit(c, o, t + 0.004, { type: "sine", from: 311 * 2.76, gain: 0.14, attack: 0.002, decay: 0.7 });
      hit(c, o, t + 0.004, { type: "sine", from: 311 * 5.4, gain: 0.06, attack: 0.002, decay: 0.35 });
      crash(c, o, t + 0.01, { seconds: 1.1, gain: 0.28, type: "lowpass", freq: 260, sweepTo: 45, q: 0.4 });
    },
  },
  /** Coin raining out of the collateral as it goes. */
  "foreclosure-coins": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes = [96, 100, 93, 98, 101, 95, 99, 94, 97, 102, 92, 99];
      notes.forEach((n, i) => {
        const at = t + 0.02 + i * 0.055 + ((i * 37) % 11) * 0.004;
        coin(c, o, at, n, 0.035 * (1 - i / 16), 0.25);
      });
    },
  },
  /** The proceeds landing: a coin on each of the party, climbing, then the tail. */
  "foreclosure-paid": {
    bus: "sfx",
    render: (c, o, t) => {
      [67, 72, 74, 75, 79].forEach((n, i) => coin(c, o, t + i * 0.08, n + 12, 0.06, i === 4 ? 0.9 : 0.4));
      swell(c, o, t + 0.3, { type: "sine", freq: hz(79), gain: 0.025, attack: 0.05, hold: 0.2, release: 0.5 });
    },
  },
};
