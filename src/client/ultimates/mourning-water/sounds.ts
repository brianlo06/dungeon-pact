import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Mourning Water's sounds. Water and glass and breath — no wood, no
 * heartbeat, no bells, no thunder, no rain — and one sound that is only this
 * film's: a single drop falling into still water in a hollow, pitched down so
 * far it sounds like something much heavier than a tear, and answered twice
 * by the hollow a moment later.
 *
 * The motif is four notes on the rim of a glass, falling: A, G, E, and a long
 * B under them that does not resolve — a lament that stops on the wrong note.
 */

/** A drop into still water: the bubble's rising pitch (the plink), a soft body, and a hollow answer. */
function drop(c: AudioContext, o: AudioNode, t: number, { gain = 0.3, low = 1, echo = true } = {}) {
  hit(c, o, t, { type: "sine", from: 420 * low, to: 1350 * low, gain, attack: 0.002, decay: 0.09 });
  hit(c, o, t, { type: "sine", from: 150 * low, to: 90 * low, gain: gain * 0.6, attack: 0.003, decay: 0.12 });
  crash(c, o, t, { seconds: 0.05, gain: gain * 0.25, type: "highpass", freq: 3200, q: 0.6 });
  if (echo)
    for (const [i, d] of [0.19, 0.4].entries())
      hit(c, o, t + d, { type: "sine", from: 420 * low * 0.98, to: 1320 * low, gain: gain * (0.3 - i * 0.13), attack: 0.004, decay: 0.08 });
}

/** A glass rim rubbed: a pure tone, a faint inharmonic ring above it, and the slow beat of two not quite in tune. */
function glass(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.05, hold = 0.2, release = 0.6) {
  swell(c, o, t, { type: "sine", freq: hz(midi), gain, attack: 0.035, hold, release, cutoff: 6000 });
  swell(c, o, t, { type: "sine", freq: hz(midi), gain: gain * 0.6, attack: 0.05, hold, release, cutoff: 6000, detune: 7 });
  hit(c, o, t, { type: "sine", from: hz(midi) * 2.76, gain: gain * 0.28, attack: 0.01, decay: hold + release * 0.4 });
}

export const voices: Record<string, Voice> = {
  /** The call: one deep drop in a still place, and the hollow answering it. */
  "mourn-drip": {
    bus: "sfx",
    render: (c, o, t) => {
      drop(c, o, t + 0.02, { gain: 0.26, low: 0.7 });
      crash(c, o, t + 0.05, { seconds: 0.9, gain: 0.03, type: "bandpass", freq: 320, q: 4 });
    },
  },
  /** The tear: a breath caught twice in the throat, and one high glass note hanging. */
  "mourn-breath": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.22, gain: 0.07, type: "bandpass", freq: 1300, sweepTo: 800, q: 0.9 });
      crash(c, o, t + 0.26, { seconds: 0.16, gain: 0.05, type: "bandpass", freq: 1100, sweepTo: 700, q: 0.9 });
      glass(c, o, t + 0.1, 88, 0.014, 0.35, 0.5);
    },
  },
  /**
   * The signature: the tear landing in the palm. The plink pitched far down,
   * a sub under it for the weight, the palm-water slapping, and the hollow
   * answering twice.
   */
  "mourn-drop": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 170, to: 560, gain: 0.5, attack: 0.002, decay: 0.16 });
      hit(c, o, t, { type: "sine", from: 90, to: 38, gain: 0.55, attack: 0.004, decay: 0.34 });
      crash(c, o, t, { seconds: 0.07, gain: 0.22, type: "highpass", freq: 2600, q: 0.6 });
      crash(c, o, t + 0.01, { seconds: 0.3, gain: 0.14, type: "lowpass", freq: 700, sweepTo: 160, q: 0.8 });
      for (const [i, d] of [0.22, 0.47].entries())
        hit(c, o, t + d, { type: "sine", from: 168, to: 540, gain: 0.16 - i * 0.07, attack: 0.004, decay: 0.14 });
      crash(c, o, t + 0.04, { seconds: 1.3, gain: 0.05, type: "bandpass", freq: 260, q: 5 });
    },
  },
  /** The drop on the glass: a tap and a small splash. */
  "mourn-lens": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.2, type: "highpass", freq: 4000, q: 0.7 });
      drop(c, o, t + 0.005, { gain: 0.12, low: 1.4, echo: false });
    },
  },
  /** The motif: A, G, E on a glass rim, falling, and a long B under them. */
  "mourn-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      glass(c, o, t, 69, 0.07, 0.12, 0.45);
      glass(c, o, t + 0.2, 67, 0.065, 0.1, 0.45);
      glass(c, o, t + 0.4, 64, 0.07, 0.14, 0.5);
      glass(c, o, t + 0.64, 59, 0.08, 0.5, 1.1);
      // The held note sags, just, as it dies.
      hit(c, o, t + 0.64, { type: "sine", from: hz(47), to: hz(46.6), gain: 0.05, attack: 0.08, decay: 1.5 });
      drop(c, o, t + 0.9, { gain: 0.05, low: 1.2 });
    },
  },
  /** Under the wide: the mere taking the rings, drips far off. */
  "mourn-rings": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.8, gain: 0.05, type: "lowpass", freq: 500, sweepTo: 200, q: 1.2 });
      drop(c, o, t + 0.3, { gain: 0.06, low: 1.1, echo: false });
      drop(c, o, t + 0.55, { gain: 0.04, low: 0.9, echo: false });
    },
  },
  /** The quiet: one far drip, a knuckle creaking shut, and a low breath of air under it. */
  "mourn-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      drop(c, o, t + 0.05, { gain: 0.07, low: 1.25 });
      for (let i = 0; i < 3; i++)
        crash(c, o, t + 0.24 + i * 0.07, { seconds: 0.025, gain: 0.05, type: "bandpass", freq: 850 + i * 90, q: 11 });
      swell(c, o, t, { type: "sine", freq: 46, gain: 0.05, attack: 0.2, hold: 0.25, release: 0.3 });
    },
  },
  /** The mere heaving up round the target, just before it closes. */
  "mourn-rise": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.16, gain: 0.26, type: "bandpass", freq: 260, sweepTo: 1600, q: 0.8 });
      hit(c, o, t, { type: "sine", from: 60, to: 120, gain: 0.25, attack: 0.05, decay: 0.14 });
    },
  },
  /**
   * The impact, in layers: the water's slap (the transient), the drop of the
   * hollow under it (the sub), the heave of the whole mere (the body), and
   * bubbles and a glass chord hanging over the water after (the tail).
   */
  "mourn-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.035, gain: 0.8, type: "highpass", freq: 1800, q: 0.5 });
      crash(c, o, t + 0.004, { seconds: 0.09, gain: 0.34, type: "bandpass", freq: 2400, sweepTo: 900, q: 0.8 });
      hit(c, o, t, { type: "sine", from: 100, to: 26, gain: 1, attack: 0.002, decay: 0.9 });
      hit(c, o, t + 0.004, { type: "triangle", from: 150, to: 48, gain: 0.34, decay: 0.34 });
      crash(c, o, t + 0.008, { seconds: 0.65, gain: 0.5, type: "lowpass", freq: 640, sweepTo: 70, q: 0.6 });
      for (let i = 0; i < 10; i++)
        hit(c, o, t + 0.12 + i * 0.055 + ((i * 7) % 3) * 0.012, { type: "sine", from: 260 + ((i * 53) % 180), to: 700 + ((i * 97) % 400), gain: 0.05, attack: 0.002, decay: 0.05 });
      crash(c, o, t + 0.08, { seconds: 1.3, gain: 0.07, type: "bandpass", freq: 380, q: 3 });
      for (const [i, m] of [59, 64, 69].entries()) glass(c, o, t + 0.12 + i * 0.03, m, 0.03, 0.3, 0.9);
    },
  },
  /** The fist letting go: water falling back into the mere in sheets. */
  "mourn-fall": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.7, gain: 0.2, type: "lowpass", freq: 1400, sweepTo: 240, q: 0.7 });
      crash(c, o, t + 0.05, { seconds: 0.5, gain: 0.07, type: "highpass", freq: 3500, q: 0.5 });
    },
  },
  /** On the board after: drips, and the motif's last note, soft. */
  "mourn-after": {
    bus: "sfx",
    render: (c, o, t) => {
      drop(c, o, t, { gain: 0.08, low: 1, echo: false });
      drop(c, o, t + 0.23, { gain: 0.06, low: 1.3, echo: false });
      drop(c, o, t + 0.51, { gain: 0.05, low: 0.85, echo: false });
      glass(c, o, t + 0.08, 59, 0.04, 0.3, 0.9);
    },
  },
};
