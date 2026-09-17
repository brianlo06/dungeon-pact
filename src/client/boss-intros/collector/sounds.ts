import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * The Collector's entrance, in sound: iron, chain and lock. Nothing gold rings
 * here — that is the Broker's — and nothing wooden: a shaft full of hanging
 * iron, a padlock's shackle, and a key the size of a man coming down on a
 * floor grate.
 *
 * The motif is a lock being counted shut: four low tolls, the last one held,
 * D, F, E, then A a fifth below — short, short, short, long.
 */

/** A struck iron bar: a dull clank, a low body, and a short inharmonic ring. */
function iron(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.12, ring = 0.5) {
  const f = hz(midi);
  crash(c, o, t, { seconds: 0.03, gain: gain * 1.6, type: "bandpass", freq: 1400, q: 1.6 });
  hit(c, o, t, { type: "triangle", from: f, gain, attack: 0.002, decay: ring });
  hit(c, o, t, { type: "sine", from: f * 2.41, gain: gain * 0.4, attack: 0.002, decay: ring * 0.45 });
  hit(c, o, t, { type: "sine", from: f * 3.93, gain: gain * 0.18, attack: 0.002, decay: ring * 0.25 });
}

/** A run of chain: many small links knocking, thinning out over `seconds`. */
function chain(c: AudioContext, o: AudioNode, t: number, seconds: number, gain = 0.07) {
  let at = 0;
  let i = 0;
  while (at < seconds && i < 60) {
    const k = at / seconds;
    crash(c, o, t + at, { seconds: 0.018, gain: gain * (1 - k * 0.7), freq: 2600 + (i % 5) * 380, q: 5 });
    at += 0.022 + k * k * 0.07 + ((i * 37) % 11) * 0.002;
    i++;
  }
}

export const voices: Record<string, Voice> = {
  /** The shaft shut behind the party: a portcullis of chain dropping, and the bar. */
  "col-shut": {
    bus: "sfx",
    render: (c, o, t) => {
      chain(c, o, t, 0.34, 0.09);
      crash(c, o, t + 0.32, { seconds: 0.4, gain: 0.5, type: "lowpass", freq: 520, q: 0.8 });
      hit(c, o, t + 0.32, { type: "sine", from: 82, to: 40, gain: 0.55, attack: 0.003, decay: 0.5 });
      iron(c, o, t + 0.33, 38, 0.14, 0.9);
    },
  },
  /** The hoard overhead: chains swaying in the dark, and far off, something settling. */
  "col-hoard": {
    bus: "sfx",
    render: (c, o, t) => {
      chain(c, o, t, 0.9, 0.035);
      chain(c, o, t + 0.35, 0.6, 0.025);
      swell(c, o, t, { type: "sawtooth", freq: 46, gain: 0.05, attack: 0.3, hold: 0.4, release: 0.6, cutoff: 220 });
      iron(c, o, t + 0.62, 45, 0.04, 0.8);
    },
  },
  /** The quiet: one tick of an empty padlock swinging, and nothing. */
  "col-tick": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.012, gain: 0.08, freq: 3400, q: 8 });
      hit(c, o, t, { type: "sine", from: 1320, gain: 0.02, decay: 0.08 });
    },
  },
  /** The shackle dropping open. */
  "col-shackle": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.02, gain: 0.22, freq: 2900, q: 5 });
      iron(c, o, t + 0.015, 76, 0.05, 0.35);
      crash(c, o, t + 0.09, { seconds: 0.015, gain: 0.12, freq: 2200, q: 6 });
    },
  },
  /**
   * The key comes down: a slap of iron on the grate (transient), a sub that
   * drops (weight), the grate's ring and every chain in the shaft snapping
   * taut (body), and the long iron tail.
   */
  "col-slam": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.05, gain: 0.8, type: "highpass", freq: 1800, q: 0.7 });
      hit(c, o, t, { type: "sine", from: 96, to: 34, gain: 0.9, attack: 0.002, decay: 0.7 });
      crash(c, o, t + 0.01, { seconds: 0.5, gain: 0.45, type: "lowpass", freq: 700, q: 0.8, sweepTo: 180 });
      iron(c, o, t + 0.01, 33, 0.2, 1.4);
      for (let i = 0; i < 6; i++)
        crash(c, o, t + 0.05 + i * 0.018, { seconds: 0.03, gain: 0.12, freq: 3000 + i * 320, q: 4 });
      swell(c, o, t + 0.05, { type: "sawtooth", freq: 41, gain: 0.08, attack: 0.02, hold: 0.3, release: 1.1, cutoff: 260 });
    },
  },
  /** The Strongbox set down, and its lid thrown back on its hinge. */
  "col-lid": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.25, gain: 0.35, type: "lowpass", freq: 600, q: 0.9 });
      hit(c, o, t, { type: "sine", from: 70, to: 45, gain: 0.45, decay: 0.3 });
      crash(c, o, t + 0.2, { seconds: 0.14, gain: 0.12, freq: 900, q: 3, sweepTo: 1600 });
      iron(c, o, t + 0.34, 50, 0.08, 0.4);
    },
  },
  /** A chain whipped out and hauled back with something on it. */
  "col-seize": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.18, gain: 0.45, freq: 1600, q: 1.4, sweepTo: 4200 });
      chain(c, o, t + 0.2, 0.3, 0.2);
      iron(c, o, t + 0.5, 62, 0.16, 0.3);
      crash(c, o, t + 0.52, { seconds: 0.2, gain: 0.35, freq: 3800, q: 1.2, sweepTo: 900 });
    },
  },
  /** The motif: a lock counted shut. D, F, E, then A below, held. */
  "col-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      iron(c, o, t, 50, 0.07, 0.35);
      iron(c, o, t + 0.16, 53, 0.07, 0.35);
      iron(c, o, t + 0.32, 52, 0.07, 0.4);
      iron(c, o, t + 0.52, 45, 0.1, 1.3);
      swell(c, o, t + 0.52, { type: "triangle", freq: hz(33), gain: 0.06, attack: 0.05, hold: 0.35, release: 0.8, cutoff: 500 });
    },
  },
  /** The return: the chains drawn back up into the dark. */
  "col-draw": {
    bus: "sfx",
    render: (c, o, t) => {
      chain(c, o, t, 0.45, 0.12);
      crash(c, o, t + 0.05, { seconds: 0.4, gain: 0.18, freq: 1200, q: 1, sweepTo: 3200 });
    },
  },
};
