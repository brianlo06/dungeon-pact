import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * The Assayer's entrance, in sound: fire and heavy vessels. A furnace door
 * grinding on its runners, the roar behind it, a gauge needle ticking, a drop
 * of melt hissing on brick, and a crucible — thick, dull, ceramic-and-iron —
 * that clanks rather than rings. Nothing chains (the Collector's) and no water.
 *
 * The motif is a reading taken: three rising notes and a fall, E, G, B, then
 * B♭ — a scale that almost balances and doesn't.
 */

/** The furnace's breath: filtered noise with a slow low swell under it. */
function roar(c: AudioContext, o: AudioNode, t: number, seconds: number, gain = 0.1) {
  crash(c, o, t, { seconds, gain, type: "lowpass", freq: 420, q: 0.6 });
  crash(c, o, t + seconds * 0.2, { seconds: seconds * 0.8, gain: gain * 0.5, freq: 1600, q: 0.5 });
  swell(c, o, t, { type: "sawtooth", freq: 38, gain: gain * 0.5, attack: seconds * 0.3, hold: seconds * 0.3, release: seconds * 0.4, cutoff: 160 });
}

/** Molten on something cold: a bright hiss that falls. */
function hiss(c: AudioContext, o: AudioNode, t: number, seconds: number, gain = 0.08) {
  crash(c, o, t, { seconds, gain, type: "highpass", freq: 5200, q: 0.7 });
  crash(c, o, t, { seconds: seconds * 0.7, gain: gain * 0.6, freq: 3200, q: 1.2, sweepTo: 1400 });
}

/** A thick vessel struck: a dull clank with a short, low, woody body. */
function vessel(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.1) {
  crash(c, o, t, { seconds: 0.04, gain: gain * 1.8, freq: 900, q: 1.4 });
  hit(c, o, t, { type: "triangle", from: hz(midi), gain, attack: 0.002, decay: 0.28 });
  hit(c, o, t, { type: "sine", from: hz(midi) * 2.76, gain: gain * 0.3, attack: 0.002, decay: 0.12 });
}

export const voices: Record<string, Voice> = {
  /** The furnace door dragged open somewhere off the board, and the heat through it. */
  "asi-door": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.36, gain: 0.6, freq: 700, q: 3, sweepTo: 420 });
      for (let i = 0; i < 8; i++) crash(c, o, t + i * 0.04, { seconds: 0.03, gain: 0.25, freq: 1100 + (i % 3) * 200, q: 4 });
      vessel(c, o, t + 0.34, 36, 0.4);
      roar(c, o, t + 0.3, 0.9, 0.45);
    },
  },
  /** The assay floor: the furnace breathing, and the moulds ticking as they cool. */
  "asi-floor": {
    bus: "sfx",
    render: (c, o, t) => {
      roar(c, o, t, 1.0, 0.08);
      for (let i = 0; i < 5; i++) crash(c, o, t + 0.15 + i * 0.17, { seconds: 0.01, gain: 0.05, freq: 3600 - i * 200, q: 7 });
    },
  },
  /** The gauge needle ticking up a notch. */
  "asi-tick": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.01, gain: 0.07, freq: 4200, q: 9 });
      hit(c, o, t, { type: "sine", from: 1900, gain: 0.015, decay: 0.05 });
    },
  },
  /** One drop of melt on brick. */
  "asi-drip": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 700, to: 320, gain: 0.05, decay: 0.05 });
      hiss(c, o, t + 0.01, 0.4, 0.045);
    },
  },
  /** The kiln taking a breath as it lifts the crucible. */
  "asi-bellows": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.5, gain: 0.2, type: "lowpass", freq: 300, q: 0.8, sweepTo: 900 });
      roar(c, o, t + 0.25, 0.6, 0.14);
    },
  },
  /**
   * The pour lands: the crucible's weight arriving (transient and sub), a
   * slap of melt on brick (body), and the long hiss of it filling the mould.
   */
  "asi-pour": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.07, gain: 0.9, type: "lowpass", freq: 900, q: 0.7 });
      hit(c, o, t, { type: "sine", from: 88, to: 32, gain: 1.2, attack: 0.002, decay: 0.7 });
      crash(c, o, t + 0.01, { seconds: 0.3, gain: 0.5, freq: 1800, q: 0.8, sweepTo: 600 });
      hiss(c, o, t + 0.05, 1.1, 0.26);
      roar(c, o, t + 0.05, 1.0, 0.2);
    },
  },
  /** A blade on the hot crucible, and the crack running through it. */
  "asi-crack": {
    bus: "sfx",
    render: (c, o, t) => {
      vessel(c, o, t, 45, 0.28);
      crash(c, o, t, { seconds: 0.03, gain: 0.35, type: "highpass", freq: 3000, q: 0.8 });
      for (let i = 0; i < 6; i++) crash(c, o, t + 0.06 + i * 0.03 + ((i * 7) % 3) * 0.01, { seconds: 0.02, gain: 0.16, freq: 2400 + i * 300, q: 5 });
      hiss(c, o, t + 0.2, 0.6, 0.12);
    },
  },
  /** The motif: a reading taken. E, G, B, then B♭, held. */
  "asi-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      vessel(c, o, t, 52, 0.09);
      vessel(c, o, t + 0.16, 55, 0.09);
      vessel(c, o, t + 0.32, 59, 0.1);
      swell(c, o, t + 0.5, { type: "triangle", freq: hz(58), gain: 0.1, attack: 0.02, hold: 0.3, release: 0.6, cutoff: 1400 });
      swell(c, o, t + 0.5, { type: "sawtooth", freq: hz(46), gain: 0.03, attack: 0.05, hold: 0.3, release: 0.6, cutoff: 500 });
    },
  },
  /** The return: the melt setting, steam off the brick. */
  "asi-cool": {
    bus: "sfx",
    render: (c, o, t) => hiss(c, o, t, 0.5, 0.1),
  },
};
