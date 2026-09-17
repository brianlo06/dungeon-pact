import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Living Bone's sounds. Bone, breath and dry wood — no bells, no metal, no
 * water, no earth heaving — and one sound that is only the Lifebinder's: a
 * bone whistle, the kind cut from a shed antler, breathy and a little sharp,
 * which carries the motif.
 *
 * The motif is four notes on that whistle: a low call, a step up, a fall
 * back, and a long held note a fifth above the first with the breath
 * showing in it. Not the base film's heartbeat on a hollow log, not the
 * Hollow Druid's falling glass.
 */

/** One note on a bone whistle: a breathy triangle with a little chiff at the start. */
function whistle(c: AudioContext, o: AudioNode, t: number, midi: number, hold: number, gain = 0.09) {
  crash(c, o, t, { seconds: 0.05, gain: gain * 0.5, freq: hz(midi) * 4, q: 3 });
  swell(c, o, t, { type: "triangle", freq: hz(midi), gain, attack: 0.03, hold, release: 0.14, cutoff: 3200, detune: 4 });
  swell(c, o, t + 0.01, { type: "sine", freq: hz(midi + 12), gain: gain * 0.25, attack: 0.04, hold, release: 0.1 });
  // Breath under the note.
  crash(c, o, t, { seconds: hold + 0.2, gain: gain * 0.28, type: "bandpass", freq: hz(midi) * 2.02, q: 9 });
}

/** Bone under a grip: a dry creak, a few grains of it. */
function creak(c: AudioContext, o: AudioNode, t: number, gain = 1) {
  for (let i = 0; i < 6; i++)
    crash(c, o, t + i * 0.022, { seconds: 0.03, gain: 0.05 * gain, freq: 1100 + i * 210, q: 12 });
  hit(c, o, t, { type: "triangle", from: 260, to: 210, gain: 0.05 * gain, attack: 0.01, decay: 0.16 });
}

export const voices: Record<string, Voice> = {
  /** The call: a knuckle on antler, dry and close, twice. */
  "bone-tap": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const at of [0, 0.16]) {
        crash(c, o, t + at, { seconds: 0.03, gain: 0.3, freq: 2600, q: 1.2 });
        hit(c, o, t + at, { type: "triangle", from: 640, to: 320, gain: 0.16, attack: 0.002, decay: 0.09 });
      }
    },
  },
  /** The grip: the hand closing on bone, the lantern's chain ticking still. */
  "bone-creak": {
    bus: "sfx",
    render: (c, o, t) => {
      creak(c, o, t, 1);
      creak(c, o, t + 0.28, 0.6);
      for (const at of [0.1, 0.23, 0.33]) crash(c, o, t + at, { seconds: 0.02, gain: 0.06, freq: 5200, q: 4 });
    },
  },
  /** The motif: four notes on a bone whistle. */
  "bone-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      whistle(c, o, t, 57, 0.16, 0.11);
      whistle(c, o, t + 0.24, 62, 0.14, 0.1);
      whistle(c, o, t + 0.46, 60, 0.12, 0.095);
      whistle(c, o, t + 0.7, 64, 0.5, 0.12);
      swell(c, o, t, { type: "sine", freq: hz(33), gain: 0.05, attack: 0.3, hold: 0.5, release: 0.6 });
    },
  },
  /** The quiet: a breath drawn in and held; the grip creaking twice, far apart. */
  "bone-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.4, gain: 0.05, type: "bandpass", freq: 700, sweepTo: 1500, q: 0.8 });
      creak(c, o, t + 0.12, 0.5);
      creak(c, o, t + 0.42, 0.35);
      swell(c, o, t, { type: "sine", freq: hz(76), gain: 0.012, attack: 0.2, hold: 0.3, release: 0.2 });
    },
  },
  /**
   * The snap, in layers: bone breaking (a dry crack, the transient), the
   * floor of it (the sub), the crown jolting (a wooden body), and the ring a
   * broken bone keeps (the tail), with a breath knocked out under it.
   */
  "bone-snap": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.78, type: "highpass", freq: 2600, q: 0.6 });
      for (let i = 0; i < 4; i++)
        crash(c, o, t + 0.005 + i * 0.011, { seconds: 0.025, gain: 0.35, freq: 1500 + i * 500, q: 8 });
      hit(c, o, t, { type: "sine", from: 110, to: 28, gain: 0.88, attack: 0.002, decay: 0.7 });
      hit(c, o, t + 0.003, { type: "triangle", from: 420, to: 130, gain: 0.3, attack: 0.002, decay: 0.16 });
      crash(c, o, t + 0.006, { seconds: 0.35, gain: 0.4, type: "lowpass", freq: 700, sweepTo: 90, q: 0.6 });
      hit(c, o, t + 0.02, { type: "sine", from: hz(86), to: hz(85), gain: 0.08, attack: 0.004, decay: 0.9 });
      hit(c, o, t + 0.02, { type: "sine", from: hz(93), gain: 0.03, attack: 0.004, decay: 0.5 });
      crash(c, o, t + 0.06, { seconds: 0.5, gain: 0.09, type: "bandpass", freq: 900, sweepTo: 400, q: 1.2 });
    },
  },
  /** The graft: the press, then the tine taking — a rising breathy chord on the whistle, and a creak of growth. */
  "bone-graft": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 140, to: 60, gain: 0.3, attack: 0.006, decay: 0.2 });
      crash(c, o, t, { seconds: 0.12, gain: 0.14, type: "lowpass", freq: 500, sweepTo: 200, q: 0.7 });
      for (const [i, m] of [57, 64, 69, 76].entries())
        swell(c, o, t + 0.1 + i * 0.07, { type: "triangle", freq: hz(m), gain: 0.05, attack: 0.1, hold: 0.35, release: 0.7, cutoff: 2600, detune: 3 });
      crash(c, o, t + 0.12, { seconds: 0.5, gain: 0.05, freq: 900, sweepTo: 2400, q: 6 });
      crash(c, o, t + 0.3, { seconds: 0.9, gain: 0.04, freq: 3800, sweepTo: 6000, q: 0.6 });
    },
  },
  /** On the board after: the motif's last note again, quietly, and a breath let out. */
  "bone-taken": {
    bus: "sfx",
    render: (c, o, t) => {
      whistle(c, o, t, 64, 0.4, 0.05);
      whistle(c, o, t + 0.02, 69, 0.4, 0.03);
      crash(c, o, t + 0.1, { seconds: 0.5, gain: 0.03, type: "bandpass", freq: 1200, sweepTo: 600, q: 0.7 });
    },
  },
};
