import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Green Reckoning's sounds. Earth, wood and breath — no bells, no metal, no
 * glass, no storm — and one sound that is only the Warden's: a heartbeat heard
 * through the ground, low and muffled, the way a thing with its ear to the
 * soil would hear it.
 *
 * The motif is that heartbeat made into a tune on a hollow log: two notes a
 * fifth apart in the rhythm of a heart (lub-dub), a pause, a step up, and a
 * held note an octave over the first with breath in it. Minor, slow, old.
 */

/** A struck hollow log: a soft knock, a woody body that drops a little, a short ring. */
function log(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.12, ring = 0.4) {
  crash(c, o, t, { seconds: 0.03, gain: gain * 0.8, freq: 900, q: 1.4 });
  hit(c, o, t, { type: "triangle", from: hz(midi) * 1.04, to: hz(midi), gain, attack: 0.004, decay: ring });
  hit(c, o, t, { type: "sine", from: hz(midi + 19), gain: gain * 0.18, attack: 0.002, decay: ring * 0.3 });
}

/** One heartbeat through the ground: lub (lower, louder), dub. */
function heart(c: AudioContext, o: AudioNode, t: number, gain = 1) {
  hit(c, o, t, { type: "sine", from: 70, to: 42, gain: 0.42 * gain, attack: 0.01, decay: 0.16 });
  crash(c, o, t, { seconds: 0.09, gain: 0.12 * gain, type: "lowpass", freq: 180, q: 0.7 });
  hit(c, o, t + 0.19, { type: "sine", from: 62, to: 40, gain: 0.3 * gain, attack: 0.01, decay: 0.13 });
  crash(c, o, t + 0.19, { seconds: 0.07, gain: 0.08 * gain, type: "lowpass", freq: 160, q: 0.7 });
}

export const voices: Record<string, Voice> = {
  /** The call: one heartbeat under the floor, and the moss drawing breath. */
  "green-heart": {
    bus: "sfx",
    render: (c, o, t) => {
      heart(c, o, t + 0.04, 1);
      crash(c, o, t, { seconds: 0.5, gain: 0.05, freq: 2400, sweepTo: 900, q: 0.6 });
    },
  },
  /** The palm on the earth: a soft, heavy press, and moss crushed under it. */
  "green-press": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 110, to: 48, gain: 0.34, attack: 0.006, decay: 0.24 });
      crash(c, o, t, { seconds: 0.2, gain: 0.2, type: "lowpass", freq: 420, sweepTo: 120, q: 0.6 });
      for (let i = 0; i < 6; i++)
        crash(c, o, t + 0.02 + i * 0.025, { seconds: 0.03, gain: 0.05, freq: 3000 + i * 300, q: 2 });
    },
  },
  /** Roots running into the soil: wood creaking, and grit trickling after. */
  "green-roots": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.55, gain: 0.08, freq: 260, sweepTo: 520, q: 7 });
      for (let i = 0; i < 9; i++)
        crash(c, o, t + 0.03 + i * 0.05 + (i % 3) * 0.01, { seconds: 0.028, gain: 0.05 + (i % 2) * 0.02, freq: 500 + ((i * 131) % 400), q: 9 });
      crash(c, o, t + 0.15, { seconds: 0.5, gain: 0.04, freq: 5200, sweepTo: 2600, q: 0.8 });
    },
  },
  /** The motif: the heartbeat, on a hollow log. */
  "green-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      log(c, o, t, 50, 0.16, 0.45);
      log(c, o, t + 0.17, 57, 0.12, 0.35);
      log(c, o, t + 0.5, 53, 0.13, 0.4);
      log(c, o, t + 0.68, 62, 0.14, 1);
      // Breath in the held note: a reed, not a horn.
      swell(c, o, t + 0.68, { type: "triangle", freq: hz(62), gain: 0.035, attack: 0.08, hold: 0.3, release: 0.5, detune: 5 });
      crash(c, o, t + 0.68, { seconds: 0.7, gain: 0.03, freq: hz(86), q: 5 });
      swell(c, o, t, { type: "sine", freq: hz(38), gain: 0.05, attack: 0.3, hold: 0.4, release: 0.6 });
    },
  },
  /** Every heart on the web, answering under the wide shot. */
  "green-hearts": {
    bus: "sfx",
    render: (c, o, t) => {
      heart(c, o, t, 0.7);
      heart(c, o, t + 0.52, 0.6);
      // The faint one, late.
      heart(c, o, t + 0.86, 0.18);
    },
  },
  /** The quiet: two heartbeats, a gap, one that barely comes; then a breath drawn in. */
  "green-listen": {
    bus: "sfx",
    render: (c, o, t) => {
      heart(c, o, t, 0.8);
      heart(c, o, t + 0.2, 0.12);
      crash(c, o, t + 0.34, { seconds: 0.26, gain: 0.05, type: "bandpass", freq: 900, sweepTo: 1800, q: 0.7 });
    },
  },
  /** The eyes opening: the breath in catching, and every leaf on the field turning at once. */
  "green-open": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.18, gain: 0.14, freq: 1400, sweepTo: 6000, q: 0.6 });
      hit(c, o, t + 0.05, { type: "sine", from: hz(74), to: hz(86), gain: 0.05, attack: 0.06, decay: 0.2 });
    },
  },
  /**
   * The reckoning, in layers: roots snapping up through stone (the
   * transient), the ground dropping away (the sub), the earth heaving (the
   * body), and a rush of leaves and a held green chord (the tail).
   */
  "green-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.035, gain: 0.8, type: "highpass", freq: 2200, q: 0.5 });
      for (let i = 0; i < 5; i++)
        crash(c, o, t + 0.004 + i * 0.012, { seconds: 0.03, gain: 0.3, freq: 700 + i * 260, q: 6 });
      hit(c, o, t, { type: "sine", from: 120, to: 26, gain: 1, attack: 0.002, decay: 0.85 });
      hit(c, o, t + 0.004, { type: "triangle", from: 180, to: 70, gain: 0.34, decay: 0.3 });
      crash(c, o, t + 0.006, { seconds: 0.5, gain: 0.5, type: "lowpass", freq: 520, sweepTo: 70, q: 0.5 });
      crash(c, o, t + 0.05, { seconds: 1.1, gain: 0.14, freq: 4200, sweepTo: 1800, q: 0.5 });
      for (const [i, m] of [50, 57, 62, 69].entries())
        swell(c, o, t + 0.06 + i * 0.02, { type: "sine", freq: hz(m), gain: 0.03, attack: 0.08, hold: 0.25, release: 0.8 });
    },
  },
  /** The rot taking the enemy: a wet, low hiss, and something giving way. */
  "green-rot": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.7, gain: 0.16, freq: 380, sweepTo: 160, q: 3 });
      for (let i = 0; i < 7; i++)
        hit(c, o, t + 0.05 + i * 0.07 + (i % 2) * 0.02, { type: "sine", from: 190 - i * 9, to: 90, gain: 0.07, attack: 0.01, decay: 0.08 });
      hit(c, o, t, { type: "sawtooth", from: 55, to: 44, gain: 0.05, attack: 0.05, decay: 0.6 });
    },
  },
  /** On the board after: a soft knock of wood for each ally, settling. */
  "green-grown": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, m] of [62, 69, 74].entries()) log(c, o, t + i * 0.09, m, 0.06, 0.6);
      crash(c, o, t, { seconds: 0.6, gain: 0.03, freq: 5000, sweepTo: 7000, q: 0.5 });
    },
  },
};
