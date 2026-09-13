import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Eyespot: sounds.
 *
 * Out in the open at night, soft and dry. No glass, no music box (the Hall of
 * Mirrors'), no pin or drone (the Open Mind's). The Illusionist's family is
 * breath and wings: a whistled tune that turns up an octave from where you
 * were listening, and the flutter, a dry beating of many small wings made of
 * bandpassed noise ticks, which is the signature. The cut is the one bright
 * thing in it: a thin shing of the shard catching the moon.
 */

/**
 * Wings: `count` soft ticks spread over `seconds`, each a short bandpassed
 * burst, at a wingbeat's uneven pace. A seeded jitter keeps it from sounding
 * like a clock, and every render the same.
 */
function flutter(
  c: AudioContext,
  o: AudioNode,
  t: number,
  { seconds, count, gain, freq = 900, rise = 1, seed = 1 }: { seconds: number; count: number; gain: number; freq?: number; rise?: number; seed?: number },
) {
  let r = seed * 9301 + 49297;
  const rand = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < count; i++) {
    const k = i / Math.max(1, count - 1);
    const at = t + seconds * (k + (rand() - 0.5) * (0.6 / count));
    const f = freq * (0.7 + rand() * 0.6) * (1 + (rise - 1) * k);
    crash(c, o, Math.max(t, at), { seconds: 0.018 + rand() * 0.012, gain: gain * (0.6 + rand() * 0.5), type: "bandpass", freq: f, q: 1.4 });
  }
}

/** A whistled note: a triangle with a slow onset, a breath of noise on its attack, a slight lift into pitch. */
function whistle(c: AudioContext, o: AudioNode, t: number, midi: number, gain: number, decay: number) {
  const f = hz(midi);
  hit(c, o, t, { type: "triangle", from: f * 0.985, to: f, gain, attack: 0.045, decay });
  hit(c, o, t + 0.01, { type: "sine", from: f * 2, gain: gain * 0.12, attack: 0.05, decay: decay * 0.7 });
  crash(c, o, t, { seconds: 0.09, gain: gain * 0.5, type: "bandpass", freq: f * 2, q: 3 });
}

/** The moon: two high sines a few cents apart, beating slowly. */
function moon(c: AudioContext, o: AudioNode, t: number, gain: number, seconds: number) {
  hit(c, o, t, { type: "sine", from: hz(95), gain, attack: seconds * 0.3, decay: seconds });
  hit(c, o, t, { type: "sine", from: hz(95) * 1.004, gain: gain * 0.8, attack: seconds * 0.35, decay: seconds });
}

export const voices: Record<string, Voice> = {
  /** The call: the hem lifting into wings over a low, soft hum. */
  "spot-call": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sine", freq: hz(36), gain: 0.34, attack: 0.16, hold: 0.22, release: 0.6, cutoff: 400 });
      swell(c, o, t + 0.04, { type: "triangle", freq: hz(55), gain: 0.04, attack: 0.2, hold: 0.2, release: 0.5, cutoff: 700 });
      flutter(c, o, t + 0.02, { seconds: 0.46, count: 22, gain: 0.5, freq: 700, rise: 1.8, seed: 3 });
      moon(c, o, t + 0.2, 0.018, 0.9);
    },
  },
  /** The glance and the wink: a breath of a whistle sliding aside, and a soft click of the lid. */
  "spot-wink": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 1450, to: 1850, gain: 0.035, attack: 0.03, decay: 0.12 });
      crash(c, o, t + 0.2, { seconds: 0.012, gain: 0.16, type: "bandpass", freq: 3200, q: 2 });
      hit(c, o, t + 0.2, { type: "sine", from: 2100, to: 1600, gain: 0.03, attack: 0.002, decay: 0.05 });
    },
  },
  /**
   * The Illusionist's motif: C5, G4, then up the octave to C6 and down onto
   * B5, held. It turns up somewhere else, and does not land where it should.
   */
  "spot-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes: [number, number, number, number][] = [
        [0, 72, 0.15, 0.32],
        [0.17, 67, 0.14, 0.34],
        [0.36, 84, 0.12, 0.3],
        [0.5, 83, 0.14, 1.2],
      ];
      for (const [at, midi, gain, decay] of notes) whistle(c, o, t + at, midi, gain, decay);
      swell(c, o, t + 0.5, { type: "sine", freq: hz(47), gain: 0.06, attack: 0.15, hold: 0.25, release: 0.7, cutoff: 500 });
    },
  },
  /** A hundred eyes opening: the flutter thickening, and a tiny twinkle as each eye shows. */
  "spot-open": {
    bus: "sfx",
    render: (c, o, t) => {
      flutter(c, o, t, { seconds: 0.5, count: 28, gain: 0.5, freq: 1100, rise: 1.3, seed: 7 });
      const scale = [79, 81, 84, 86, 88, 91];
      for (let i = 0; i < 9; i++)
        hit(c, o, t + 0.05 + i * 0.05, { type: "sine", from: hz(scale[(i * 5) % scale.length]), gain: 0.018, attack: 0.003, decay: 0.16 });
    },
  },
  /** The swarm crossing the lens: a close rush of wings. */
  "spot-swish": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.26, gain: 0.12, type: "bandpass", freq: 500, sweepTo: 1600, q: 0.8 });
      flutter(c, o, t, { seconds: 0.24, count: 16, gain: 0.7, freq: 600, rise: 1.4, seed: 11 });
    },
  },
  /**
   * The quiet: one slow wingbeat, close, and the moon's faint tone; under it,
   * nothing. The enemy choosing.
   */
  "spot-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      moon(c, o, t, 0.012, 0.6);
      for (const at of [0.2, 0.36]) {
        crash(c, o, t + at, { seconds: 0.09, gain: 0.12, type: "lowpass", freq: 420, q: 0.6 });
        hit(c, o, t + at, { type: "sine", from: 90, to: 60, gain: 0.06, attack: 0.02, decay: 0.12 });
      }
    },
  },
  /** The signature cut, leading the impact: an in-breath of the blade, then the shing. */
  "spot-cut": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.25, type: "highpass", freq: 5000, q: 0.7 });
      hit(c, o, t, { type: "sine", from: 3800, to: 5400, gain: 0.08, attack: 0.002, decay: 0.26 });
      hit(c, o, t + 0.004, { type: "sine", from: 5700, to: 6100, gain: 0.04, attack: 0.002, decay: 0.34 });
      crash(c, o, t, { seconds: 0.14, gain: 0.2, type: "bandpass", freq: 6500, sweepTo: 2500, q: 4 });
    },
  },
  /**
   * The impact, in layers: the shard's transient; a sub drop; the body, a
   * burst of wings torn open (a wide noise band ripped downward, and wings);
   * the tail, a lowpassed room with a falling glint of moonlight.
   */
  "spot-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.022, gain: 0.7, type: "highpass", freq: 3600, q: 0.5 });
      hit(c, o, t, { type: "sine", from: 140, to: 28, gain: 0.9, attack: 0.002, decay: 0.85 });
      hit(c, o, t, { type: "triangle", from: 300, to: 80, gain: 0.26, attack: 0.002, decay: 0.28 });
      crash(c, o, t + 0.004, { seconds: 0.34, gain: 0.5, type: "bandpass", freq: 2600, sweepTo: 420, q: 0.9 });
      flutter(c, o, t + 0.02, { seconds: 0.36, count: 26, gain: 0.34, freq: 1300, rise: 0.6, seed: 5 });
      crash(c, o, t + 0.02, { seconds: 1.2, gain: 0.26, type: "lowpass", freq: 300, sweepTo: 50, q: 0.4 });
      hit(c, o, t + 0.05, { type: "sine", from: hz(95), to: hz(83), gain: 0.05, attack: 0.01, decay: 1.1 });
      hit(c, o, t + 0.05, { type: "sine", from: hz(90), to: hz(78), gain: 0.035, attack: 0.01, decay: 1.0 });
    },
  },
  /** The moths going: wings scattering away, thinning out. */
  "spot-scatter": {
    bus: "sfx",
    render: (c, o, t) => {
      flutter(c, o, t, { seconds: 0.55, count: 30, gain: 0.4, freq: 1500, rise: 0.5, seed: 13 });
      crash(c, o, t, { seconds: 0.5, gain: 0.05, type: "bandpass", freq: 1800, sweepTo: 700, q: 1 });
    },
  },
  /** Release: the motif's last two notes, slower and softer, and a few wings settling. */
  "spot-after": {
    bus: "sfx",
    render: (c, o, t) => {
      whistle(c, o, t, 84, 0.1, 0.5);
      whistle(c, o, t + 0.3, 83, 0.11, 1.1);
      flutter(c, o, t + 0.08, { seconds: 0.4, count: 10, gain: 0.12, freq: 1000, seed: 17 });
    },
  },
};
