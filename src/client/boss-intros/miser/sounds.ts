import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * The Miser's entrance, in sound: coin on coin in a stone pit, a nail on a
 * wall, and a throat. Nothing rings like the Broker's struck brass: these are
 * dull, heaped, handled coins — a slide, a chink, a pour — and the one thing
 * that sings in the pit is the Miser's own croak.
 *
 * The motif is a count under the breath: four low croaked notes, G, F♯, G,
 * then D below, held — the sound of a number being kept.
 */

/** One dull coin on coin: a short chink, no long ring. */
function chink(c: AudioContext, o: AudioNode, t: number, gain = 0.08, pitch = 1) {
  crash(c, o, t, { seconds: 0.02, gain: gain * 1.4, freq: 4200 * pitch, q: 5 });
  hit(c, o, t, { type: "sine", from: 2600 * pitch, gain: gain * 0.5, decay: 0.06 });
  hit(c, o, t, { type: "sine", from: 3900 * pitch, gain: gain * 0.25, decay: 0.04 });
}

/** A heap shifting: many coins sliding over each other for `seconds`. */
function slide(c: AudioContext, o: AudioNode, t: number, seconds: number, gain = 0.05) {
  let at = 0;
  let i = 0;
  while (at < seconds && i < 70) {
    chink(c, o, t + at, gain * (0.5 + ((i * 13) % 7) / 10), 0.8 + ((i * 7) % 5) / 10);
    at += 0.012 + ((i * 17) % 9) * 0.004;
    i++;
  }
  crash(c, o, t, { seconds, gain: gain * 1.2, freq: 3000, q: 0.7 });
}

/** The Miser's throat: a wet, low, wavering croak. */
function croak(c: AudioContext, o: AudioNode, t: number, midi: number, seconds: number, gain = 0.085) {
  swell(c, o, t, { type: "sawtooth", freq: hz(midi), gain, attack: 0.03, hold: seconds * 0.6, release: seconds * 0.4, cutoff: 520 });
  swell(c, o, t, { type: "square", freq: hz(midi) * 0.5, gain: gain * 0.5, attack: 0.03, hold: seconds * 0.5, release: seconds * 0.4, cutoff: 300, detune: 18 });
}

export const voices: Record<string, Voice> = {
  /** The party's purses, heard: a chink from every pocket. */
  "msr-purse": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 7; i++) chink(c, o, t + i * 0.045 + ((i * 11) % 3) * 0.01, 0.2, 0.9 + (i % 3) * 0.08);
    },
  },
  /** A pad-tipped finger scratching one tally mark into stone. */
  "msr-scratch": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.14, gain: 0.18, freq: 1800, q: 2.5, sweepTo: 900 });
      crash(c, o, t + 0.02, { seconds: 0.1, gain: 0.08, type: "highpass", freq: 5000, q: 0.8 });
    },
  },
  /** One coin rolling on the stone floor, circling, and falling flat. */
  "msr-roll": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 14; i++) crash(c, o, t + i * 0.03, { seconds: 0.012, gain: 0.04 + i * 0.002, freq: 2400 - i * 60, q: 6 });
      for (let i = 0; i < 9; i++) chink(c, o, t + 0.45 + 0.1 * (1 - (i / 9) ** 0.6), 0.05 * (1 - i / 9), 1.1);
    },
  },
  /** The heap heaving as something under it gets up. */
  "msr-heave": {
    bus: "sfx",
    render: (c, o, t) => {
      slide(c, o, t, 0.7, 0.05);
      swell(c, o, t, { type: "sawtooth", freq: 52, gain: 0.07, attack: 0.2, hold: 0.3, release: 0.4, cutoff: 200 });
    },
  },
  /**
   * The hand comes down on the hoard: a flat slap (transient), a sub (weight),
   * a burst of coins thrown up and rattling down (body), and the croak after.
   */
  "msr-slam": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.06, gain: 1.0, type: "lowpass", freq: 1200, q: 0.7 });
      hit(c, o, t, { type: "sine", from: 90, to: 36, gain: 1.15, attack: 0.002, decay: 0.6 });
      slide(c, o, t + 0.02, 0.5, 0.1);
      crash(c, o, t + 0.02, { seconds: 0.6, gain: 0.3, freq: 3600, q: 0.6, sweepTo: 1200 });
      croak(c, o, t + 0.35, 43, 0.5, 0.05);
    },
  },
  /** Gold poured through the air from the party's purses onto its back. */
  "msr-stream": {
    bus: "sfx",
    render: (c, o, t) => {
      slide(c, o, t, 0.8, 0.2);
      swell(c, o, t, { type: "triangle", freq: hz(79), gain: 0.02, attack: 0.3, hold: 0.3, release: 0.3, cutoff: 3000 });
    },
  },
  /** The motif: a count kept under the breath. G, F♯, G, then D below, held. */
  "msr-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      croak(c, o, t, 55, 0.14);
      croak(c, o, t + 0.17, 54, 0.14);
      croak(c, o, t + 0.34, 55, 0.14);
      croak(c, o, t + 0.54, 50, 0.7, 0.1);
    },
  },
};
