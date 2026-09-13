import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * False Footing's sounds. Snow, cord and breath — no gut string, no glass, no
 * water, no bells — and one sound that is only this film's: a cord ripping up
 * out of crusted snow, a fast run of crunches along its length that ends in
 * a taut twang.
 *
 * The motif is four footfalls, tuned: struck and damped like a wooden bar
 * muffled in snow, A3, E4, D4 and a low A2 thud, in an uneven stride with a
 * limp in it. The Hundredth Mark's call is plucked and rises to an octave;
 * this one is struck and comes down to the ground.
 */

/** One step in dry snow: a squeak-crunch of packed crystals. */
function crunch(c: AudioContext, o: AudioNode, t: number, gain = 0.2, pitch = 1) {
  crash(c, o, t, { seconds: 0.07, gain, type: "bandpass", freq: 2400 * pitch, sweepTo: 1300 * pitch, q: 1.4 });
  for (let i = 0; i < 4; i++)
    crash(c, o, t + 0.012 + i * 0.017, { seconds: 0.025, gain: gain * (0.5 - i * 0.08), type: "bandpass", freq: (3400 - i * 300) * pitch, q: 6 });
  hit(c, o, t, { type: "sine", from: 140 * pitch, to: 70 * pitch, gain: gain * 0.5, decay: 0.08 });
}

/** A struck, damped wooden bar: a click, a short woody body, an octave above it. */
function bar(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.1, ring = 0.28) {
  crash(c, o, t, { seconds: 0.015, gain: gain * 0.9, type: "bandpass", freq: 1800, q: 1.2 });
  hit(c, o, t, { type: "sine", from: hz(midi), gain, attack: 0.002, decay: ring });
  hit(c, o, t, { type: "sine", from: hz(midi) * 3.93, gain: gain * 0.18, attack: 0.002, decay: ring * 0.25 });
  hit(c, o, t, { type: "triangle", from: hz(midi) * 2, gain: gain * 0.25, attack: 0.002, decay: ring * 0.5 });
}

/** Breath out into cold air: soft, breathy noise. */
function exhale(c: AudioContext, o: AudioNode, t: number, gain = 0.05, seconds = 0.26) {
  crash(c, o, t, { seconds, gain, type: "bandpass", freq: 1500, sweepTo: 700, q: 0.7 });
  crash(c, o, t, { seconds: seconds * 0.7, gain: gain * 0.5, type: "highpass", freq: 4500, q: 0.5 });
}

export const voices: Record<string, Voice> = {
  /** The kid dropping onto one knee in the snow. */
  "ff-crunch": {
    bus: "sfx",
    render: (c, o, t) => {
      crunch(c, o, t, 0.22, 0.9);
      crunch(c, o, t + 0.11, 0.3, 0.75);
    },
  },
  /** A fingertip on the rim of the print, and one low note: read. */
  "ff-read": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.3, gain: 0.05, type: "bandpass", freq: 3000, sweepTo: 1800, q: 2.5 });
      for (let i = 0; i < 6; i++)
        crash(c, o, t + 0.03 + i * 0.045, { seconds: 0.02, gain: 0.03, type: "bandpass", freq: 3800 - i * 120, q: 8 });
      bar(c, o, t + 0.26, 57, 0.06, 0.6);
      swell(c, o, t + 0.26, { type: "sine", freq: hz(45), gain: 0.03, attack: 0.08, hold: 0.2, release: 0.4 });
    },
  },
  /** The motif: four footfalls, tuned, with a limp in the stride. */
  "ff-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const steps: [number, number, number][] = [
        [0, 57, 0.09],
        [0.2, 64, 0.08],
        [0.3, 62, 0.08],
        [0.55, 45, 0.12],
      ];
      for (const [dt, midi, gain] of steps) {
        bar(c, o, t + dt, midi, gain, midi < 50 ? 0.7 : 0.32);
        crunch(c, o, t + dt, 0.06, 1.1);
      }
      hit(c, o, t + 0.55, { type: "sine", from: 90, to: 45, gain: 0.12, decay: 0.3 });
      swell(c, o, t + 0.55, { type: "triangle", freq: hz(45), gain: 0.035, attack: 0.05, hold: 0.25, release: 0.6 });
    },
  },
  /** The trail being read: soft crunches travelling away across the field. */
  "ff-trail": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 6; i++) crunch(c, o, t + i * 0.08, 0.1 - i * 0.012, 1.2 - i * 0.05);
    },
  },
  /** The face: breath out, breath out, and then held — the cord creaks in the fist. */
  "ff-breath": {
    bus: "sfx",
    render: (c, o, t) => {
      exhale(c, o, t, 0.06, 0.22);
      exhale(c, o, t + 0.2, 0.05, 0.2);
      for (let i = 0; i < 4; i++)
        crash(c, o, t + 0.36 + i * 0.05, { seconds: 0.03, gain: 0.035, type: "bandpass", freq: 620 + i * 40, q: 10 });
    },
  },
  /** The quiet: no wind, one slow step coming down in the snow, and a held breath. */
  "ff-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.6, gain: 0.02, type: "lowpass", freq: 400, q: 0.5 });
      crunch(c, o, t + 0.34, 0.14, 0.62);
      swell(c, o, t, { type: "sine", freq: hz(33), gain: 0.02, attack: 0.2, hold: 0.2, release: 0.3 });
    },
  },
  /**
   * The signature: the cord ripping up out of the crust along its whole
   * length, ending in a taut twang.
   */
  "ff-rip": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 9; i++)
        crash(c, o, t + i * 0.011, { seconds: 0.03, gain: 0.16 + i * 0.01, type: "bandpass", freq: 2800 - i * 90, q: 3 });
      crash(c, o, t, { seconds: 0.12, gain: 0.14, type: "highpass", freq: 1800, q: 0.7 });
      hit(c, o, t + 0.1, { type: "triangle", from: 150, to: 118, gain: 0.26, attack: 0.002, decay: 0.34 });
      hit(c, o, t + 0.1, { type: "sine", from: 300, to: 236, gain: 0.08, attack: 0.002, decay: 0.2 });
    },
  },
  /**
   * The bite, in layers: the cord's whip-crack, a sub that drops away, the
   * heavy thump of snow and packed ice breaking up, and powder hissing back
   * down.
   */
  "ff-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.025, gain: 0.9, type: "highpass", freq: 3000, q: 0.6 });
      hit(c, o, t, { type: "sine", from: 140, to: 30, gain: 0.95, attack: 0.002, decay: 0.7 });
      crash(c, o, t + 0.005, { seconds: 0.22, gain: 0.5, type: "lowpass", freq: 900, sweepTo: 180, q: 1.1 });
      crunch(c, o, t + 0.01, 0.34, 0.55);
      crunch(c, o, t + 0.05, 0.22, 0.7);
      hit(c, o, t + 0.004, { type: "triangle", from: 220, to: 90, gain: 0.26, decay: 0.18 });
      crash(c, o, t + 0.04, { seconds: 1.1, gain: 0.12, type: "highpass", freq: 3800, sweepTo: 2000, q: 0.4 });
      crash(c, o, t + 0.01, { seconds: 1, gain: 0.22, type: "lowpass", freq: 260, sweepTo: 50, q: 0.4 });
    },
  },
  /** On the board: a cord drawn tight round a foot, for every enemy, and a stake knocked in. */
  "ff-cinch": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, dt] of [0, 0.12, 0.22, 0.3].entries()) {
        crash(c, o, t + dt, { seconds: 0.06, gain: 0.08, type: "bandpass", freq: 700 + i * 60, sweepTo: 1100, q: 7 });
        hit(c, o, t + dt + 0.02, { type: "sine", from: hz(i === 3 ? 45 : 57), gain: 0.04, decay: 0.25 });
      }
      bar(c, o, t + 0.36, 57, 0.045, 0.6);
    },
  },
};
