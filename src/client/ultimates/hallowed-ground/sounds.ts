import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Hallowed Ground's sounds. A reed organ, iron on stone, and the soot going
 * off the floor — nothing blown, nothing sung, no bell, no drum. The
 * signature is the sound only this film has: the shod foot of a standard
 * dragged the length of a stone floor, grinding and slowly rising, with grit
 * in it; and the knock of that foot grounded.
 *
 * The motif is original and rises: F3, B♭3, C4 on the organ as the line is
 * drawn, and the fourth note, F4, lands as an F major chord with the ninth
 * in it on the grounding. Not the Anthem's horn and answer, the Din's drum
 * and bell, or the Elegy's falling voice.
 */

/**
 * A reed-organ note: two sawtooths a few cents apart through a soft low-pass,
 * a sine an octave down for the wind, a slow attack and a long release.
 */
function reed(
  c: AudioContext,
  o: AudioNode,
  t: number,
  midi: number,
  { gain = 0.05, attack = 0.14, hold = 0.3, release = 0.6, cutoff = 1100 } = {},
) {
  const f = hz(midi);
  swell(c, o, t, { type: "sawtooth", freq: f, gain, attack, hold, release, cutoff, detune: -5 });
  swell(c, o, t + 0.01, { type: "sawtooth", freq: f, gain: gain * 0.85, attack: attack * 1.1, hold, release, cutoff: cutoff * 0.8, detune: 6 });
  swell(c, o, t, { type: "sine", freq: f / 2, gain: gain * 0.9, attack: attack * 1.3, hold, release: release * 1.1, cutoff: 600 });
  // The wind in the bellows.
  crash(c, o, t, { seconds: attack + hold * 0.5, gain: gain * 0.5, type: "lowpass", freq: 700, q: 0.5 });
}

/** The shod foot of the standard knocked on stone: wood, iron and the stone under it. */
function knock(c: AudioContext, o: AudioNode, t: number, gain = 0.4) {
  crash(c, o, t, { seconds: 0.05, gain: gain * 0.9, type: "highpass", freq: 2600, q: 0.6 });
  hit(c, o, t + 0.002, { type: "triangle", from: 640, to: 210, gain: gain * 0.6, attack: 0.001, decay: 0.07 });
  hit(c, o, t + 0.003, { type: "square", from: 1900, to: 900, gain: gain * 0.12, attack: 0.001, decay: 0.05 });
  hit(c, o, t + 0.004, { type: "sine", from: 140, to: 62, gain: gain * 0.8, attack: 0.003, decay: 0.16 });
  crash(c, o, t + 0.01, { seconds: 0.22, gain: gain * 0.35, type: "lowpass", freq: 520, sweepTo: 120, q: 0.6 });
}

/** Grit: a few grains skittering after a scrape. */
function grit(c: AudioContext, o: AudioNode, t: number, n: number, gain: number, seed: number) {
  let a = seed;
  const rand = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++)
    crash(c, o, t + rand() * 0.5, { seconds: 0.012 + rand() * 0.025, gain: gain * (0.5 + rand() * 0.5), freq: 2200 + rand() * 4200, q: 4 });
}

export const voices: Record<string, Voice> = {
  /** On the board: the standard's foot knocks the floor, and the organ draws breath under it. */
  "hallow-knock": {
    bus: "sfx",
    render: (c, o, t) => {
      knock(c, o, t, 0.45);
      reed(c, o, t + 0.02, 41, { gain: 0.03, attack: 0.3, hold: 0.3, release: 0.7, cutoff: 700 });
    },
  },
  /** The close-up: the motif's first two notes, F3 and B♭3, on the reed organ. */
  "hallow-motif-a": {
    bus: "sfx",
    render: (c, o, t) => {
      reed(c, o, t + 0.06, 53, { gain: 0.055, attack: 0.16, hold: 0.22, release: 0.5 });
      reed(c, o, t + 0.4, 58, { gain: 0.06, attack: 0.14, hold: 0.32, release: 0.6 });
      swell(c, o, t, { type: "sine", freq: hz(29), gain: 0.028, attack: 0.3, hold: 0.5, release: 0.6, cutoff: 300 });
    },
  },
  /**
   * The line: iron scoring stone — a long grinding scrape whose band climbs
   * as the standard is dragged, a thin screech riding it, grit, and the foot
   * knocked down onto the floor at the start.
   */
  "hallow-scrape": {
    bus: "sfx",
    render: (c, o, t) => {
      knock(c, o, t, 0.3);
      // The grind: two noise bands, one climbing, one under it.
      crash(c, o, t + 0.04, { seconds: 0.86, gain: 0.34, type: "bandpass", freq: 520, sweepTo: 1650, q: 1.6 });
      crash(c, o, t + 0.04, { seconds: 0.86, gain: 0.26, type: "bandpass", freq: 260, sweepTo: 700, q: 1.1 });
      crash(c, o, t + 0.1, { seconds: 0.8, gain: 0.14, type: "highpass", freq: 3200, q: 0.7 });
      // The screech: a thin tone wobbling as the iron catches and slips.
      const src = c.createOscillator();
      src.type = "triangle";
      src.frequency.setValueAtTime(1180, t + 0.06);
      src.frequency.linearRampToValueAtTime(1560, t + 0.9);
      const lfo = c.createOscillator();
      const depth = c.createGain();
      lfo.frequency.value = 11;
      depth.gain.value = 70;
      lfo.connect(depth).connect(src.frequency);
      const amp = c.createGain();
      amp.gain.setValueAtTime(0.0001, t + 0.06);
      amp.gain.exponentialRampToValueAtTime(0.035, t + 0.2);
      amp.gain.setValueAtTime(0.035, t + 0.72);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.92);
      src.connect(amp).connect(o);
      src.start(t + 0.06);
      lfo.start(t + 0.06);
      src.stop(t + 0.95);
      lfo.stop(t + 0.95);
      grit(c, o, t + 0.3, 12, 0.08, 41);
    },
  },
  /** The line: the motif's third note, C4, held over the scrape, and the wind under it. */
  "hallow-motif-b": {
    bus: "sfx",
    render: (c, o, t) => {
      reed(c, o, t + 0.02, 60, { gain: 0.06, attack: 0.18, hold: 0.5, release: 0.6 });
      reed(c, o, t + 0.04, 53, { gain: 0.03, attack: 0.2, hold: 0.5, release: 0.6, cutoff: 800 });
      swell(c, o, t, { type: "sine", freq: hz(29), gain: 0.03, attack: 0.3, hold: 0.6, release: 0.5, cutoff: 300 });
    },
  },
  /** The quiet: the embers in the groove ticking as they cool, and nothing else. */
  "hallow-ember": {
    bus: "sfx",
    render: (c, o, t) => {
      let a = 97;
      const rand = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
      for (let i = 0; i < 9; i++) {
        const at = t + 0.04 + i * 0.055 + rand() * 0.04;
        hit(c, o, at, { type: "sine", from: 3200 + rand() * 2400, to: 900, gain: 0.05 * (1 - i / 12), attack: 0.001, decay: 0.02 });
      }
      crash(c, o, t, { seconds: 0.5, gain: 0.03, type: "lowpass", freq: 400, q: 0.4 });
    },
  },
  /**
   * The grounding, in layers: the shod foot on stone and the hiss of the
   * line igniting (transient), a sub drop, the fourth note as an F major
   * chord with the ninth on the organ and a low iron ring (body), and the
   * long white hiss of the soot going off the floor (tail).
   */
  "hallow-strike": {
    bus: "sfx",
    render: (c, o, t) => {
      // Transient: the knock, hard, and the ignition.
      knock(c, o, t, 1.0);
      crash(c, o, t + 0.006, { seconds: 0.09, gain: 0.7, type: "highpass", freq: 4200, q: 0.5 });
      hit(c, o, t, { type: "triangle", from: 300, to: 110, gain: 0.5, attack: 0.001, decay: 0.08 });
      // Sub.
      hit(c, o, t, { type: "sine", from: 120, to: 30, gain: 1.0, attack: 0.002, decay: 0.8 });
      hit(c, o, t + 0.01, { type: "triangle", from: 70, to: 36, gain: 0.35, attack: 0.004, decay: 0.5 });
      // Body: the chord, F3 A3 C4 F4 G4, and the iron ring.
      for (const [i, p] of [53, 57, 60, 65, 67].entries())
        reed(c, o, t + 0.015 + i * 0.012, p, { gain: i === 3 ? 0.075 : 0.05, attack: 0.05, hold: 0.55, release: 1.1, cutoff: 1300 });
      hit(c, o, t + 0.004, { type: "sine", from: 2140, to: 2100, gain: 0.08, attack: 0.002, decay: 0.7 });
      hit(c, o, t + 0.004, { type: "sine", from: 3390, to: 3350, gain: 0.04, attack: 0.002, decay: 0.45 });
      // Tail: the soot lifting off the whole floor, a long white hiss falling.
      crash(c, o, t + 0.04, { seconds: 1.5, gain: 0.3, type: "bandpass", freq: 5200, sweepTo: 900, q: 0.5 });
      crash(c, o, t + 0.1, { seconds: 1.2, gain: 0.16, type: "lowpass", freq: 1200, sweepTo: 180, q: 0.4 });
      grit(c, o, t + 0.2, 18, 0.05, 313);
    },
  },
  /** On the board after: the chord let go, one last knock of the foot, the hiss dying. */
  "hallow-settle": {
    bus: "sfx",
    render: (c, o, t) => {
      reed(c, o, t + 0.02, 53, { gain: 0.035, attack: 0.12, hold: 0.25, release: 0.7 });
      reed(c, o, t + 0.03, 65, { gain: 0.03, attack: 0.12, hold: 0.25, release: 0.7 });
      knock(c, o, t + 0.34, 0.16);
      crash(c, o, t, { seconds: 0.9, gain: 0.05, type: "bandpass", freq: 3000, sweepTo: 700, q: 0.5 });
    },
  },
};
