import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Hall of Mirrors — sounds.
 *
 * Glass and wood. The Beguiler's family is a music box and a mirror: pure,
 * small, pretty tones, each followed by a reflection that is not quite the
 * same note. Nothing here is loud until the glass goes, and then everything
 * is — a click for the edge, a sub for the weight, a body of glass partials,
 * and a long tinkle as it comes down.
 */

/** A music-box tine: a bright sine with a short metallic overtone. */
function tine(c: AudioContext, o: AudioNode, t: number, midi: number, gain: number, decay = 0.7) {
  hit(c, o, t, { type: "sine", from: hz(midi), gain, attack: 0.003, decay });
  hit(c, o, t, { type: "triangle", from: hz(midi + 24), gain: gain * 0.22, attack: 0.002, decay: decay * 0.3 });
}

/** A struck glass: inharmonic partials ringing at different lengths. */
function glassRing(c: AudioContext, o: AudioNode, t: number, base: number, gain: number) {
  for (const [ratio, g, d] of [
    [1, 1, 1.4],
    [2.32, 0.5, 0.9],
    [4.25, 0.3, 0.6],
    [6.63, 0.16, 0.35],
  ] as const)
    hit(c, o, t, { type: "sine", from: base * ratio, gain: gain * g, attack: 0.004, decay: d });
}

export const voices: Record<string, Voice> = {
  /** The call: a wet finger round a glass rim, swelling, and a tap on it. */
  "hom-call": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sine", freq: hz(83), gain: 0.07, attack: 0.25, hold: 0.25, release: 0.7, detune: 6 });
      swell(c, o, t, { type: "sine", freq: hz(83), gain: 0.05, attack: 0.25, hold: 0.25, release: 0.7, detune: -9 });
      glassRing(c, o, t + 0.02, 1320, 0.12);
      hit(c, o, t, { type: "sine", from: 62, to: 44, gain: 0.35, decay: 0.9 });
      crash(c, o, t, { seconds: 0.5, gain: 0.05, freq: 3200, sweepTo: 6400, q: 3 });
    },
  },
  /** The eye opening: a thin, rising glass whistle. */
  "hom-eye": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 1180, to: 2360, gain: 0.07, attack: 0.08, decay: 0.42 });
      hit(c, o, t + 0.05, { type: "sine", from: 1250, to: 2500, gain: 0.04, attack: 0.08, decay: 0.38 });
    },
  },
  /**
   * The Beguiler's motif: a music box, four notes down and a turn back up —
   * and each note answered, a breath later and quieter, a semitone wrong.
   */
  "hom-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes: [number, number][] = [
        [0, 83],
        [0.17, 79],
        [0.34, 80],
        [0.56, 76],
      ];
      for (const [at, midi] of notes) {
        tine(c, o, t + at, midi, 0.11, at > 0.5 ? 1.2 : 0.6);
        // The reflection that lies.
        tine(c, o, t + at + 0.075, midi + (midi % 2 ? 1 : -1), 0.045, 0.5);
      }
      swell(c, o, t + 0.56, { type: "sine", freq: hz(52), gain: 0.06, attack: 0.1, hold: 0.3, release: 0.6, cutoff: 600 });
    },
  },
  /** A whisper passing from mirror to mirror. */
  "hom-whisper": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 4; i++)
        crash(c, o, t + i * 0.12, { seconds: 0.28, gain: 0.07 - i * 0.012, freq: 900 + i * 500, sweepTo: 2600 + i * 400, q: 4 });
    },
  },
  /** A glass-harmonica chord climbing, one note for each face the smile finds. */
  "hom-chime": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, p] of [76, 80, 83, 87].entries()) {
        swell(c, o, t + i * 0.08, { type: "sine", freq: hz(p), gain: 0.045, attack: 0.05, hold: 0.22, release: 0.35, detune: i % 2 ? 14 : -14 });
        glassRing(c, o, t + i * 0.08, hz(p + 12), 0.03);
      }
    },
  },
  /** Wood under strain: the control's bar drawn back. */
  "hom-creak": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 9; i++)
        crash(c, o, t + i * 0.034 + (i % 3) * 0.006, { seconds: 0.03, gain: 0.08 + i * 0.006, freq: 520 + (i % 4) * 70, q: 9 });
      hit(c, o, t, { type: "sawtooth", from: 96, to: 82, gain: 0.03, attack: 0.08, decay: 0.34 });
    },
  },
  /** One string, drawn taut, plucked in silence. */
  "hom-pluck": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.012, gain: 0.25, type: "highpass", freq: 3000, q: 0.6 });
      hit(c, o, t, { type: "triangle", from: hz(69), to: hz(68.6), gain: 0.2, attack: 0.002, decay: 0.8 });
      hit(c, o, t, { type: "sine", from: hz(81), gain: 0.05, attack: 0.002, decay: 0.4 });
    },
  },
  /** The yank: strings snapping tight, and the bar torn up. */
  "hom-yank": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.08, gain: 0.35, type: "highpass", freq: 2200, q: 0.8 });
      hit(c, o, t, { type: "sine", from: 260, to: 1500, gain: 0.14, attack: 0.004, decay: 0.12 });
      hit(c, o, t, { type: "triangle", from: hz(57), gain: 0.12, attack: 0.002, decay: 0.3 });
    },
  },
  /**
   * The break, in layers: an edge, a sub dropping out from under it, a body
   * of glass partials, and the room after.
   */
  "hom-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.8, type: "highpass", freq: 3200, q: 0.5 });
      hit(c, o, t, { type: "sine", from: 140, to: 26, gain: 0.95, attack: 0.002, decay: 0.85 });
      hit(c, o, t, { type: "triangle", from: 300, to: 70, gain: 0.3, decay: 0.35 });
      for (let i = 0; i < 16; i++)
        crash(c, o, t + 0.005 + i * 0.018 + ((i * 7) % 5) * 0.004, {
          seconds: 0.06 + (i % 4) * 0.04,
          gain: 0.16 - i * 0.006,
          freq: 2400 + ((i * 1811) % 5200),
          q: 7,
        });
      glassRing(c, o, t + 0.01, 1760, 0.1);
      glassRing(c, o, t + 0.03, 2093, 0.07);
      crash(c, o, t + 0.02, { seconds: 1.2, gain: 0.3, type: "lowpass", freq: 300, sweepTo: 60, q: 0.4 });
    },
  },
  /** Glass coming down off the frame, piece by piece. */
  "hom-tinkle": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 18; i++) {
        const at = t + ((i * 53) % 90) / 100 + i * 0.008;
        hit(c, o, at, { type: "sine", from: 2200 + ((i * 977) % 3600), gain: 0.05 - i * 0.002, attack: 0.002, decay: 0.12 + (i % 3) * 0.06 });
        if (i % 3 === 0) crash(c, o, at, { seconds: 0.04, gain: 0.05, freq: 5000, q: 5 });
      }
    },
  },
};
