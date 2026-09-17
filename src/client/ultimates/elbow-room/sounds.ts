import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Elbow Room's sounds. A lane: timber, plaster, cobbles, sawdust, and an
 * accordion somewhere up it.
 *
 * The motif is that accordion, each interval wider than the last — B♭2, D♭3
 * (a minor third up), A♭3 (a fifth up), then a swing down to B♭1 — the
 * bellows opening wide. The signature sound is **the rattle**: the cleaver
 * carried on the shoulder, its end clattering along the shutters as the
 * Butcher walks, like a stick dragged along railings. No drum, no heartbeat,
 * no mallet on a string, no bowed saw, no organ, no horn, no bell.
 */

/** One accordion note: two reeds a hair apart, a reed an octave down, and the bellows' breath. */
function reed(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.05, hold = 0.18, release = 0.22) {
  swell(c, o, t, { type: "sawtooth", freq: hz(midi), gain, attack: 0.025, hold, release, cutoff: 2200, detune: 9 });
  swell(c, o, t, { type: "sawtooth", freq: hz(midi), gain: gain * 0.8, attack: 0.03, hold, release, cutoff: 1800, detune: -8 });
  swell(c, o, t, { type: "square", freq: hz(midi - 12), gain: gain * 0.35, attack: 0.03, hold, release, cutoff: 900 });
  crash(c, o, t, { seconds: hold + 0.06, gain: gain * 0.25, freq: 1200, q: 0.8 });
}

/** A hard wooden knock. */
function knock(c: AudioContext, o: AudioNode, t: number, gain = 0.2, pitch = 1) {
  crash(c, o, t, { seconds: 0.035, gain, freq: 1500 * pitch, q: 5 });
  hit(c, o, t, { type: "triangle", from: 260 * pitch, to: 150 * pitch, gain: gain * 0.6, attack: 0.001, decay: 0.05 });
}

/** Plaster letting go: a short dry crumble. */
function crumble(c: AudioContext, o: AudioNode, t: number, gain = 0.12, n = 6) {
  for (let i = 0; i < n; i++)
    crash(c, o, t + i * 0.022 + (i % 3) * 0.007, { seconds: 0.04, gain: gain * (1 - i / (n + 2)), freq: 900 + ((i * 370) % 1400), q: 2 });
  crash(c, o, t, { seconds: 0.2, gain: gain * 0.5, type: "lowpass", freq: 700, sweepTo: 240, q: 0.6 });
}

/** The cleaver's end dragged along shutters: clacks, quickening, over `seconds`. */
function rattle(c: AudioContext, o: AudioNode, t: number, seconds: number, gain = 0.1) {
  const n = Math.round(seconds * 16);
  let at = 0;
  for (let i = 0; i < n; i++) {
    const gap = (seconds / n) * (1.25 - (i / n) * 0.5);
    knock(c, o, t + at, gain * (0.7 + ((i * 7) % 5) * 0.08), 0.9 + ((i * 3) % 4) * 0.06);
    at += gap;
  }
}

/** A heavy boot on cobbles. */
function step(c: AudioContext, o: AudioNode, t: number, gain = 0.14) {
  hit(c, o, t, { type: "sine", from: 90, to: 50, gain, attack: 0.003, decay: 0.09 });
  crash(c, o, t, { seconds: 0.05, gain: gain * 0.5, freq: 700, q: 1.2 });
}

export const voices: Record<string, Voice> = {
  /** The call: the neck cracked, the knuckles, a timber creak as the lane leans in. */
  "elbow-crack": {
    bus: "sfx",
    render: (c, o, t) => {
      // Clicks are tones, not noise: a noise burst this short spikes through the filter.
      for (const [dt, f] of [[0.12, 2600], [0.16, 3100], [0.26, 2300]]) hit(c, o, t + dt, { type: "square", from: f, to: f * 0.7, gain: 0.05, attack: 0.001, decay: 0.018 });
      for (let i = 0; i < 6; i++) crash(c, o, t + 0.05 + i * 0.07, { seconds: 0.06, gain: 0.04, freq: 330 + i * 24, q: 10 });
      hit(c, o, t + 0.34, { type: "sine", from: 120, to: 60, gain: 0.18, decay: 0.12 });
    },
  },
  /** The head cracked on the beam, and plaster coming down. */
  "elbow-bump": {
    bus: "sfx",
    render: (c, o, t) => {
      knock(c, o, t, 0.34, 0.7);
      hit(c, o, t, { type: "sine", from: 140, to: 70, gain: 0.2, decay: 0.12 });
      crumble(c, o, t + 0.04, 0.08, 7);
    },
  },
  /** The rattle, walking up the lane: the blade's end along the shutters, and the boots. */
  "elbow-rattle": {
    bus: "sfx",
    render: (c, o, t) => {
      rattle(c, o, t + 0.05, 0.8, 0.13);
      for (let i = 0; i < 4; i++) step(c, o, t + 0.04 + i * 0.26);
    },
  },
  "elbow-rattle-fast": {
    bus: "sfx",
    render: (c, o, t) => {
      rattle(c, o, t + 0.03, 0.42, 0.13);
      for (let i = 0; i < 2; i++) step(c, o, t + 0.03 + i * 0.24);
    },
  },
  /** The motif: B♭2, D♭3, A♭3, and the swing down to B♭1. */
  "elbow-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      reed(c, o, t, 46, 0.085, 0.1, 0.12);
      reed(c, o, t + 0.17, 49, 0.085, 0.1, 0.12);
      reed(c, o, t + 0.34, 56, 0.09, 0.12, 0.16);
      reed(c, o, t + 0.56, 34, 0.11, 0.24, 0.4);
      reed(c, o, t + 0.56, 46, 0.04, 0.24, 0.4);
    },
  },
  /** The wind-up: the straps creaking as it turns, a breath in, and the point biting the post. */
  "elbow-wind": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 5; i++) crash(c, o, t + i * 0.045, { seconds: 0.05, gain: 0.05, freq: 420 + i * 40, q: 8 });
      crash(c, o, t + 0.02, { seconds: 0.26, gain: 0.08, type: "bandpass", freq: 500, sweepTo: 1100, q: 0.9 });
      knock(c, o, t + 0.265, 0.3, 0.6);
      hit(c, o, t + 0.265, { type: "sine", from: 110, to: 60, gain: 0.2, decay: 0.1 });
      crumble(c, o, t + 0.28, 0.07, 5);
    },
  },
  /** The quiet: one drip off the eaves, and a cat's growl too low to be sure of. */
  "elbow-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t + 0.2, { type: "sine", from: 1900, to: 850, gain: 0.03, attack: 0.001, decay: 0.07 });
      swell(c, o, t + 0.06, { type: "sawtooth", freq: 62, gain: 0.012, attack: 0.08, hold: 0.18, release: 0.14, cutoff: 260 });
    },
  },
  /** The swing coming round: a long low whump of air. */
  "elbow-swing": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.16, gain: 1.6, type: "lowpass", freq: 260, sweepTo: 1300, q: 0.9 });
      crash(c, o, t + 0.02, { seconds: 0.12, gain: 0.8, freq: 600, sweepTo: 2200, q: 1.4 });
    },
  },
  /**
   * The impact, in layers: a wooden crack and the cleaver's chop
   * (transient); a sub drop; the whump of the swing and plaster giving way
   * along a wall (body); and plaster and sawdust pattering down, a shutter
   * banging twice (tail).
   */
  "elbow-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.8, type: "highpass", freq: 2200, q: 0.6 });
      knock(c, o, t + 0.002, 0.5, 0.8);
      hit(c, o, t, { type: "sine", from: 120, to: 26, gain: 0.95, attack: 0.002, decay: 0.8 });
      crash(c, o, t + 0.004, { seconds: 0.18, gain: 0.5, type: "lowpass", freq: 520, sweepTo: 140, q: 0.8 });
      hit(c, o, t + 0.004, { type: "triangle", from: 210, to: 80, gain: 0.35, decay: 0.16 });
      crumble(c, o, t + 0.03, 0.16, 9);
      crumble(c, o, t + 0.11, 0.09, 7);
      crash(c, o, t + 0.05, { seconds: 1.0, gain: 0.16, type: "lowpass", freq: 300, sweepTo: 50, q: 0.4 });
      for (let i = 0; i < 10; i++)
        crash(c, o, t + 0.18 + i * 0.05 + (i % 3) * 0.012, { seconds: 0.03, gain: 0.04 - i * 0.003, freq: 2400 + ((i * 530) % 1600), q: 3 });
      knock(c, o, t + 0.34, 0.14, 0.75);
      knock(c, o, t + 0.47, 0.09, 0.8);
    },
  },
  /** On the board: sawdust settling, and the motif's last two notes, soft. */
  "elbow-settle": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 8; i++)
        crash(c, o, t + i * 0.035, { seconds: 0.03, gain: 0.03 - i * 0.003, freq: 2800 + ((i * 410) % 1400), q: 3 });
      reed(c, o, t + 0.12, 56, 0.05, 0.08, 0.12);
      reed(c, o, t + 0.3, 46, 0.06, 0.2, 0.4);
    },
  },
};
