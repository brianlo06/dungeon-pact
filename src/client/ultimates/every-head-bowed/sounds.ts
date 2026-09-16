import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Every Head Bowed's sounds. A field at dusk, a lantern on a chain, and a
 * reed organ of the kind a hedge-priest would pump in a barn — no bells,
 * whistles, glass, water or bone.
 *
 * The signature is the field turning: thousands of dry heads on stiff necks
 * all moving at once, a long hiss of grains sweeping through the rows. The
 * impact is the same sound falling: the field going down all together.
 *
 * The motif is four notes on the reed organ, D, F, E and then a drop of a
 * seventh to a held low A with its fifth droning under it: it climbs, turns,
 * and goes down further than it came up.
 */

/** A small seeded generator, so a sound is the same every time it renders. */
function seeded(seed: number) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** One held note on a small reed organ: two reeds a hair apart, a soft bellows swell, a little buzz. */
function reed(c: AudioContext, o: AudioNode, t: number, midi: number, hold: number, gain = 0.06) {
  swell(c, o, t, { type: "sawtooth", freq: hz(midi), gain, attack: 0.07, hold, release: 0.22, cutoff: 1500, detune: -7 });
  swell(c, o, t, { type: "sawtooth", freq: hz(midi), gain: gain * 0.8, attack: 0.09, hold, release: 0.2, cutoff: 1300, detune: 8 });
  swell(c, o, t, { type: "square", freq: hz(midi - 12), gain: gain * 0.28, attack: 0.1, hold, release: 0.2, cutoff: 700 });
  // The bellows: a breath of air under the reeds.
  crash(c, o, t, { seconds: hold + 0.25, gain: gain * 0.35, type: "bandpass", freq: 900, q: 0.8 });
}

/** Stiff heads turning on their necks: a sweep of dry grains through the rows. */
function rustle(c: AudioContext, o: AudioNode, t: number, seconds: number, gain: number, seed: number, fall = false) {
  const rand = seeded(seed);
  const grains = Math.round(seconds * 70);
  for (let i = 0; i < grains; i++) {
    const k = i / grains;
    // Swells up and away; a fall is all at the front.
    const env = fall ? Math.pow(1 - k, 1.6) : Math.sin(Math.PI * Math.min(1, k * 1.15));
    const at = t + k * seconds + rand() * 0.012;
    crash(c, o, at, { seconds: 0.02 + rand() * 0.03, gain: gain * (0.35 + rand() * 0.65) * env, freq: 1800 + rand() * 3800, q: 2.5 + rand() * 4 });
  }
  crash(c, o, t, { seconds, gain: gain * 0.4, type: "bandpass", freq: fall ? 1400 : 700, sweepTo: fall ? 300 : 1800, q: 0.6 });
}

/** Field crickets: short trains of high chirps. `stop` cuts the last train off halfway. */
function crickets(c: AudioContext, o: AudioNode, t: number, seconds: number, gain: number, stop = false) {
  const rand = seeded(19);
  const trains = Math.floor(seconds / 0.24);
  for (let n = 0; n < trains; n++) {
    const pulses = stop && n === trains - 1 ? 2 : 4;
    const freq = n % 2 ? 4700 : 5100;
    for (let p = 0; p < pulses; p++)
      crash(c, o, t + n * 0.24 + rand() * 0.02 + p * 0.026, { seconds: 0.016, gain: gain * (0.6 + rand() * 0.4), freq, q: 14 });
  }
}

/** The lantern's chain: small links ticking, a creak of the hook. */
function chain(c: AudioContext, o: AudioNode, t: number, gain = 1) {
  for (const [i, at] of [0, 0.05, 0.13, 0.2].entries())
    crash(c, o, t + at, { seconds: 0.025, gain: 0.07 * gain, freq: 3800 + i * 500, q: 9 });
  hit(c, o, t + 0.02, { type: "triangle", from: 520, to: 430, gain: 0.03 * gain, attack: 0.01, decay: 0.2 });
}

export const voices: Record<string, Voice> = {
  /** The call: the chain runs up as the staff lifts, the lamp's glass knocks once. */
  "bowed-chain": {
    bus: "sfx",
    render: (c, o, t) => {
      chain(c, o, t, 1.2);
      chain(c, o, t + 0.22, 0.8);
      hit(c, o, t + 0.3, { type: "sine", from: hz(91), gain: 0.03, attack: 0.003, decay: 0.5 });
    },
  },
  /** The signature: the field turning its faces to the light. */
  "bowed-turn": {
    bus: "sfx",
    render: (c, o, t) => {
      rustle(c, o, t, 0.75, 0.09, 7);
      swell(c, o, t, { type: "sine", freq: hz(38), gain: 0.03, attack: 0.3, hold: 0.2, release: 0.4 });
    },
  },
  /** The motif: four reed-organ notes, and the low drone the last one lands on. */
  "bowed-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      reed(c, o, t, 62, 0.16, 0.055);
      reed(c, o, t + 0.22, 65, 0.14, 0.055);
      reed(c, o, t + 0.42, 64, 0.12, 0.05);
      reed(c, o, t + 0.62, 57, 0.62, 0.065);
      reed(c, o, t + 0.64, 52, 0.58, 0.03);
    },
  },
  /** Under the wide: dusk in a field. */
  "bowed-dusk": {
    bus: "sfx",
    render: (c, o, t) => crickets(c, o, t, 1.0, 0.035),
  },
  /** The quiet: the crickets stop mid-chirr; a breath goes out; the chain, once, as the lantern starts down. */
  "bowed-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      crickets(c, o, t, 0.26, 0.022, true);
      crash(c, o, t + 0.3, { seconds: 0.42, gain: 0.04, type: "bandpass", freq: 900, sweepTo: 420, q: 0.7 });
      chain(c, o, t + 0.45, 0.45);
      swell(c, o, t, { type: "sine", freq: hz(45), gain: 0.012, attack: 0.25, hold: 0.25, release: 0.2 });
    },
  },
  /**
   * The bow, in layers: the lantern's iron foot in the dirt (the transient),
   * the ground taking it (the sub), the whole field falling at once (the
   * body: a rushing, crunching collapse of dry heads), and seed pattering
   * down with the lamp's glass still ringing (the tail).
   */
  "bowed-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.035, gain: 0.7, type: "highpass", freq: 2200, q: 0.7 });
      hit(c, o, t, { type: "triangle", from: 880, to: 260, gain: 0.28, attack: 0.002, decay: 0.12 });
      hit(c, o, t, { type: "sine", from: 96, to: 27, gain: 0.9, attack: 0.002, decay: 0.75 });
      crash(c, o, t + 0.004, { seconds: 0.3, gain: 0.45, type: "lowpass", freq: 900, sweepTo: 110, q: 0.7 });
      rustle(c, o, t + 0.005, 0.5, 0.26, 23, true);
      const rand = seeded(41);
      for (let i = 0; i < 26; i++) {
        const at = 0.12 + Math.pow(rand(), 1.4) * 0.9;
        crash(c, o, t + at, { seconds: 0.012, gain: 0.07 * (1 - at / 1.1), freq: 2400 + rand() * 2600, q: 5 });
      }
      hit(c, o, t + 0.01, { type: "sine", from: hz(93), to: hz(92), gain: 0.05, attack: 0.004, decay: 1.0 });
      hit(c, o, t + 0.01, { type: "sine", from: hz(98), gain: 0.02, attack: 0.004, decay: 0.6 });
    },
  },
  /** On the board after: the motif's low note, quiet, and seed still dropping. */
  "bowed-after": {
    bus: "sfx",
    render: (c, o, t) => {
      reed(c, o, t, 57, 0.4, 0.03);
      reed(c, o, t + 0.02, 52, 0.4, 0.018);
      const rand = seeded(59);
      for (let i = 0; i < 10; i++) crash(c, o, t + 0.1 + rand() * 0.6, { seconds: 0.012, gain: 0.03, freq: 2600 + rand() * 2000, q: 5 });
    },
  },
};
