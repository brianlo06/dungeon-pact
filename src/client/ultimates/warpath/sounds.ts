import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Warpath's sounds. Wind over open snow, boots breaking the crust, a low
 * war-horn — and the one sound only this film has: a roar inside a closed
 * helm, a throat through the steel's own ring.
 *
 * The motif is original and four notes long, each on a heavy footfall in
 * snow: A2, C3, B2, then down to E2 — a trudge. Not the Vanguard's
 * fifth-and-octave horn, not the Breaker's anvils, not the Warcaller's drum.
 * Its E comes back, struck, in the body of the impact.
 */

/** Seeded, so a sound is the same every time it plays. */
function rng(seed: number) {
  let a = seed * 9301 + 49297;
  return () => (a = (a * 9301 + 49297) % 233280) / 233280;
}

/** Wind: low noise swelling and sagging, and a thin whistle over it. */
function wind(c: AudioContext, o: AudioNode, t: number, seconds: number, gain: number, rise = 1) {
  crash(c, o, t, { seconds, gain, type: "lowpass", freq: 380, sweepTo: 380 + 420 * rise, q: 0.7 });
  crash(c, o, t + seconds * 0.1, { seconds: seconds * 0.9, gain: gain * 0.5, type: "bandpass", freq: 900, sweepTo: 1500, q: 1.1 });
  crash(c, o, t + seconds * 0.3, { seconds: seconds * 0.7, gain: gain * 0.14, type: "bandpass", freq: 2600, sweepTo: 3400, q: 9 });
}

/** A boot through snow crust: a squeak, a crunch, and the weight settling. */
function crunch(c: AudioContext, o: AudioNode, t: number, gain = 0.4, seed = 1) {
  const r = rng(seed);
  for (let i = 0; i < 6; i++)
    crash(c, o, t + i * 0.012 + r() * 0.008, { seconds: 0.03 + r() * 0.03, gain: gain * (0.5 + r() * 0.5), freq: 1400 + r() * 2600, q: 2 + r() * 4 });
  crash(c, o, t + 0.02, { seconds: 0.16, gain: gain * 0.6, type: "lowpass", freq: 700, sweepTo: 220, q: 0.8 });
  hit(c, o, t + 0.03, { type: "sine", from: 90, to: 48, gain: gain * 0.7, attack: 0.004, decay: 0.16 });
}

/** A low war-horn: two reeds a hair apart, a buzz into the note, a sub under it. */
function horn(c: AudioContext, o: AudioNode, t: number, midi: number, { gain = 0.09, hold = 0.14, release = 0.28 } = {}) {
  crash(c, o, t, { seconds: 0.05, gain: gain * 0.5, freq: hz(midi) * 3, q: 3 });
  swell(c, o, t, { type: "sawtooth", freq: hz(midi), gain, attack: 0.05, hold, release, cutoff: 820, detune: -9 });
  swell(c, o, t + 0.006, { type: "sawtooth", freq: hz(midi), gain: gain * 0.75, attack: 0.06, hold, release, cutoff: 620, detune: 11 });
  swell(c, o, t, { type: "triangle", freq: hz(midi - 12), gain: gain * 0.8, attack: 0.04, hold, release: release * 0.8, cutoff: 400 });
}

/** Steel rung: a closed helm's partials, a little out of true. */
function helmRing(c: AudioContext, o: AudioNode, t: number, gain: number, ring = 0.5) {
  for (const [f, level, len] of [
    [1180, 1, ring],
    [1740, 0.6, ring * 0.7],
    [2630, 0.4, ring * 0.5],
    [3390, 0.25, ring * 0.35],
  ] as const)
    hit(c, o, t, { type: "sine", from: f, gain: gain * level, attack: 0.003, decay: len });
}

export const voices: Record<string, Voice> = {
  /** On the board: the wind comes up over the fight, and steel scrapes free. */
  "warpath-call": {
    bus: "sfx",
    render: (c, o, t) => {
      wind(c, o, t, 0.9, 0.2, 1.2);
      crash(c, o, t + 0.12, { seconds: 0.26, gain: 0.12, type: "bandpass", freq: 3200, sweepTo: 5400, q: 6 });
      crash(c, o, t + 0.16, { seconds: 0.18, gain: 0.07, type: "bandpass", freq: 2100, sweepTo: 3000, q: 8 });
      helmRing(c, o, t + 0.3, 0.035, 0.4);
    },
  },
  /** Under the close-up and the trail: the blizzard. */
  "warpath-wind": {
    bus: "sfx",
    render: (c, o, t) => {
      wind(c, o, t, 1.7, 0.16, 0.6);
      wind(c, o, t + 0.5, 1.2, 0.08, -0.3);
    },
  },
  /**
   * The roar in the helm: a breath drawn in, then a throat — a buzz through
   * vowel formants — rung through the helm's steel, with the armour rattling
   * under it.
   */
  "warpath-roar": {
    bus: "sfx",
    render: (c, o, t) => {
      // The breath in.
      crash(c, o, t, { seconds: 0.26, gain: 0.08, type: "bandpass", freq: 1600, sweepTo: 2600, q: 1.4 });
      const at = t + 0.24;
      // The throat: a low buzz, and the vowel it is pushed through.
      for (const [f, g] of [
        [98, 0.1],
        [147, 0.06],
      ] as const)
        swell(c, o, at, { type: "sawtooth", freq: f, gain: g, attack: 0.03, hold: 0.36, release: 0.3, cutoff: 1100, detune: -14 });
      for (const [f, g, q] of [
        [560, 0.22, 5],
        [920, 0.16, 6],
        [2400, 0.07, 8],
      ] as const)
        crash(c, o, at, { seconds: 0.62, gain: g, freq: f, sweepTo: f * 0.86, q });
      // Rung through the steel: the helm answers the voice.
      helmRing(c, o, at + 0.01, 0.06, 0.7);
      helmRing(c, o, at + 0.2, 0.03, 0.5);
      // Mail and plate shaken.
      const r = rng(7);
      for (let i = 0; i < 10; i++)
        crash(c, o, at + r() * 0.5, { seconds: 0.025, gain: 0.05 + r() * 0.04, freq: 3000 + r() * 3000, q: 5 });
    },
  },
  /** The motif on the footfalls: A2, C3, B2 on a war-horn, and E2 held. */
  "warpath-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const steps: [number, number, number][] = [
        [0, 45, 0.12],
        [0.25, 48, 0.12],
        [0.5, 47, 0.12],
        [0.75, 40, 0.42],
      ];
      steps.forEach(([at, midi, hold], i) => {
        crunch(c, o, t + at, 0.34, 3 + i);
        horn(c, o, t + at + 0.01, midi, { gain: i === 3 ? 0.11 : 0.085, hold, release: i === 3 ? 0.5 : 0.24 });
      });
    },
  },
  /** One boot in the snow. */
  "warpath-crunch": {
    bus: "sfx",
    render: (c, o, t) => crunch(c, o, t, 0.4, 11),
  },
  /** The quiet: the wind cut dead; one boot creaking in the crust, and the breath held. */
  "warpath-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.12, gain: 0.05, type: "lowpass", freq: 500, sweepTo: 120, q: 0.6 });
      for (let i = 0; i < 7; i++)
        crash(c, o, t + 0.14 + i * 0.03, { seconds: 0.03, gain: 0.05 - i * 0.005, freq: 1900 - i * 90, q: 14 });
      hit(c, o, t + 0.2, { type: "sine", from: 62, to: 50, gain: 0.12, attack: 0.02, decay: 0.2 });
    },
  },
  /** The gust across the lens. */
  "warpath-gust": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.36, gain: 0.26, type: "bandpass", freq: 700, sweepTo: 2600, q: 0.9 });
      crash(c, o, t + 0.05, { seconds: 0.3, gain: 0.1, type: "highpass", freq: 3000, sweepTo: 6000, q: 0.6 });
    },
  },
  /**
   * The blow, in layers: steel cracking into the enemy (transient), a sub
   * drop, a heavy crump of snow with the horn's E struck under it (body), and
   * the wind rushing back in with powder hissing down (tail).
   */
  "warpath-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      // Transient.
      crash(c, o, t, { seconds: 0.03, gain: 1, type: "highpass", freq: 2800, q: 0.6 });
      crash(c, o, t + 0.004, { seconds: 0.08, gain: 0.5, freq: 2200, sweepTo: 900, q: 1.6 });
      helmRing(c, o, t + 0.003, 0.08, 0.35);
      // Sub.
      hit(c, o, t, { type: "sine", from: 110, to: 30, gain: 0.95, attack: 0.002, decay: 0.7 });
      hit(c, o, t + 0.012, { type: "triangle", from: 64, to: 34, gain: 0.35, attack: 0.004, decay: 0.45 });
      // Body: the snow thrown, and the horn struck on the motif's E.
      crash(c, o, t + 0.01, { seconds: 0.5, gain: 0.55, type: "lowpass", freq: 520, sweepTo: 130, q: 0.9 });
      crash(c, o, t + 0.02, { seconds: 0.3, gain: 0.22, freq: 1300, sweepTo: 500, q: 1.2 });
      horn(c, o, t + 0.015, 40, { gain: 0.13, hold: 0.2, release: 0.55 });
      horn(c, o, t + 0.02, 52, { gain: 0.07, hold: 0.16, release: 0.45 });
      // Tail: the wind back, and powder falling.
      wind(c, o, t + 0.18, 1.3, 0.12, 0.8);
      crash(c, o, t + 0.1, { seconds: 1.2, gain: 0.05, type: "highpass", freq: 5200, sweepTo: 3000, q: 0.5 });
    },
  },
  /** On the board after: the motif's last two notes again, soft, and the wind going. */
  "warpath-reprise": {
    bus: "sfx",
    render: (c, o, t) => {
      horn(c, o, t, 47, { gain: 0.045, hold: 0.1, release: 0.22 });
      horn(c, o, t + 0.24, 40, { gain: 0.055, hold: 0.3, release: 0.6 });
      wind(c, o, t, 0.9, 0.05, -0.5);
    },
  },
};
