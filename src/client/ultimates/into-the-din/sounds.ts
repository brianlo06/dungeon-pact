import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Into the Din's sounds. The noise of a fight, a war drum, low brass, a
 * heartbeat — and one sound only this film has: an enemy rung like a great
 * bell by the blow, the din of the whole field struck into one note.
 *
 * The motif is original and four notes long, and its last note is not played
 * but struck: a drum and a low brass stab on D3, D3, F3 as the Warcaller walks
 * out, and C4 is the bell of the blow. Nothing sung, nothing blown on a horn.
 */

/** A brass stab: a hard buzz into the note, gone quickly. */
function stab(c: AudioContext, o: AudioNode, t: number, midi: number, { gain = 0.09, hold = 0.12, release = 0.22 } = {}) {
  crash(c, o, t, { seconds: 0.03, gain: gain * 0.8, freq: hz(midi) * 4, q: 2 });
  swell(c, o, t, { type: "sawtooth", freq: hz(midi), gain, attack: 0.012, hold, release, cutoff: 1300, detune: -6 });
  swell(c, o, t + 0.004, { type: "sawtooth", freq: hz(midi), gain: gain * 0.7, attack: 0.016, hold, release, cutoff: 900, detune: 8 });
  swell(c, o, t, { type: "square", freq: hz(midi - 12), gain: gain * 0.35, attack: 0.02, hold: hold * 0.8, release, cutoff: 600 });
}

/** A war drum: a skin slapped, a pitched thump, and the shell's boom. */
function drum(c: AudioContext, o: AudioNode, t: number, gain = 0.5) {
  crash(c, o, t, { seconds: 0.05, gain: gain * 0.5, freq: 900, q: 0.8 });
  hit(c, o, t, { type: "sine", from: 150, to: 52, gain, attack: 0.002, decay: 0.34 });
  hit(c, o, t + 0.004, { type: "triangle", from: 96, to: 60, gain: gain * 0.4, attack: 0.003, decay: 0.22 });
}

/**
 * A bell struck. Its partials are a bell's, not a string's — hum an octave
 * down, the strike note, a minor third, a fifth, the octave and above — and
 * each rings at its own length, two of them a hair apart so the ring beats.
 */
function bell(c: AudioContext, o: AudioNode, t: number, midi: number, { gain = 0.2, ring = 2.2 } = {}) {
  const f = hz(midi);
  const partials: [number, number, number][] = [
    [0.5, 0.55, ring * 1.15],
    [1, 1, ring],
    [1.004, 0.5, ring * 0.9],
    [1.19, 0.42, ring * 0.7],
    [1.5, 0.3, ring * 0.55],
    [2, 0.36, ring * 0.5],
    [2.51, 0.18, ring * 0.32],
    [2.99, 0.14, ring * 0.25],
    [4.1, 0.08, ring * 0.16],
  ];
  for (const [ratio, level, seconds] of partials)
    hit(c, o, t, { type: "sine", from: f * ratio, gain: gain * level, attack: 0.002, decay: seconds });
}

/** Clatter: metal on metal, a few at a time, scattered through `seconds`. */
function clatter(c: AudioContext, o: AudioNode, t: number, seconds: number, gain: number, seed = 1) {
  let a = seed * 9301 + 49297;
  const rand = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
  const n = Math.round(seconds * 16);
  for (let i = 0; i < n; i++) {
    const at = t + rand() * seconds;
    const g = gain * (0.4 + rand() * 0.6) * (0.5 + (at - t) / seconds);
    crash(c, o, at, { seconds: 0.03 + rand() * 0.05, gain: g, freq: 1800 + rand() * 4200, q: 3 + rand() * 6 });
    if (rand() < 0.35) hit(c, o, at, { type: "square", from: 900 + rand() * 1800, gain: g * 0.12, attack: 0.001, decay: 0.05 });
  }
}

export const voices: Record<string, Voice> = {
  /** The din coming up over the real board: a roar far off, clatter rising into it. */
  "din-rise": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.7, gain: 0.22, type: "lowpass", freq: 260, sweepTo: 700, q: 0.6 });
      crash(c, o, t + 0.05, { seconds: 0.6, gain: 0.08, freq: 900, sweepTo: 1600, q: 0.8 });
      clatter(c, o, t, 0.55, 0.12, 3);
      drum(c, o, t + 0.3, 0.25);
    },
  },
  /** Under the face and the walk: the fight going on, and a grip taken. */
  "din-bed": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 1.4, gain: 0.12, type: "lowpass", freq: 520, sweepTo: 300, q: 0.5 });
      crash(c, o, t, { seconds: 1.2, gain: 0.04, freq: 1300, q: 0.9 });
      clatter(c, o, t, 1.2, 0.07, 11);
      // Leather drawn tight round the grip.
      for (let i = 0; i < 4; i++) crash(c, o, t + 0.12 + i * 0.028, { seconds: 0.03, gain: 0.08 - i * 0.012, freq: 700 + i * 90, q: 9 });
    },
  },
  /**
   * The motif's first three notes, on the footfalls: drum and brass on D3, D3,
   * then F3 held — the fourth note is the blow.
   */
  "din-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      drum(c, o, t, 0.45);
      stab(c, o, t + 0.005, 50, { gain: 0.085, hold: 0.08, release: 0.16 });
      drum(c, o, t + 0.3, 0.42);
      stab(c, o, t + 0.305, 50, { gain: 0.085, hold: 0.08, release: 0.16 });
      drum(c, o, t + 0.6, 0.5);
      stab(c, o, t + 0.605, 53, { gain: 0.1, hold: 0.3, release: 0.35 });
      stab(c, o, t + 0.61, 41, { gain: 0.05, hold: 0.3, release: 0.35 });
    },
  },
  /** The quiet: two heartbeats and the grip creaking, and nothing else. */
  "din-heart": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const at of [0, 0.34]) {
        hit(c, o, t + at, { type: "sine", from: 70, to: 44, gain: 0.3, attack: 0.008, decay: 0.16 });
        hit(c, o, t + at + 0.13, { type: "sine", from: 60, to: 40, gain: 0.18, attack: 0.008, decay: 0.14 });
      }
      for (let i = 0; i < 5; i++) crash(c, o, t + 0.2 + i * 0.045, { seconds: 0.035, gain: 0.03, freq: 520 + i * 40, q: 12 });
    },
  },
  /**
   * The blow, in layers: the crack of the strike (transient), a sub drop, the
   * bell and a brass stab on C (body — the motif's fourth note), and the bell
   * ringing and beating with the air after it (tail).
   */
  "din-clang": {
    bus: "sfx",
    render: (c, o, t) => {
      // Transient.
      crash(c, o, t, { seconds: 0.035, gain: 1, type: "highpass", freq: 2600, q: 0.6 });
      crash(c, o, t + 0.004, { seconds: 0.09, gain: 0.55, freq: 1900, sweepTo: 800, q: 1.5 });
      // Sub.
      hit(c, o, t, { type: "sine", from: 120, to: 32, gain: 0.95, attack: 0.002, decay: 0.75 });
      hit(c, o, t + 0.01, { type: "triangle", from: 70, to: 38, gain: 0.35, attack: 0.004, decay: 0.5 });
      // Body: the enemy rung, and the brass on the same note.
      bell(c, o, t + 0.002, 60, { gain: 0.34, ring: 2.6 });
      bell(c, o, t + 0.006, 48, { gain: 0.18, ring: 1.8 });
      stab(c, o, t + 0.01, 60, { gain: 0.1, hold: 0.25, release: 0.5 });
      stab(c, o, t + 0.012, 48, { gain: 0.08, hold: 0.25, release: 0.5 });
      // Tail: air, a long way.
      crash(c, o, t + 0.02, { seconds: 1.6, gain: 0.16, type: "lowpass", freq: 1100, sweepTo: 140, q: 0.4 });
      crash(c, o, t + 0.08, { seconds: 1.2, gain: 0.04, freq: 6200, sweepTo: 2600, q: 0.8 });
    },
  },
  /** The ring rolling back over the party, and the party's one shout. */
  "din-surge": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.28, gain: 0.2, freq: 2400, sweepTo: 500, q: 1.3 });
      // A shout of several throats: noise through a vowel, pitched down.
      for (const [i, f] of [620, 700, 540, 780].entries()) {
        crash(c, o, t + 0.08 + i * 0.012, { seconds: 0.22, gain: 0.16, freq: f, sweepTo: f * 0.8, q: 4 });
        crash(c, o, t + 0.08 + i * 0.012, { seconds: 0.2, gain: 0.07, freq: f * 1.6, sweepTo: f * 1.3, q: 6 });
      }
      for (const at of [0.14, 0.26, 0.36]) hit(c, o, t + at, { type: "sine", from: 110, to: 50, gain: 0.3, attack: 0.003, decay: 0.12 });
    },
  },
  /** On the board after: the last two notes again in brass, soft, and the bell still in the air. */
  "din-reprise": {
    bus: "sfx",
    render: (c, o, t) => {
      stab(c, o, t, 53, { gain: 0.045, hold: 0.1, release: 0.2 });
      stab(c, o, t + 0.22, 60, { gain: 0.05, hold: 0.28, release: 0.5 });
      bell(c, o, t + 0.22, 72, { gain: 0.05, ring: 1.2 });
    },
  },
};
