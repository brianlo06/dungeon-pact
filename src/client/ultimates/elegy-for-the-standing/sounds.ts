import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Elegy for the Standing's sounds. One voice singing low, a drone under it,
 * and earth — nothing blown, nothing struck on metal, no bell. The signature
 * is the sound only a graveside has: a spadeful of clay landing on wood, the
 * dull knock under the weight of it.
 *
 * The motif is original and four notes long, and it only falls: E4, D4, C4 on
 * a closed "oo", then the last note, A3, sung full as the earth goes in.
 * Not the Anthem's horn and answer, not the Din's drum and bell.
 */

type Vowel = "oo" | "ah" | "mm";

const FORMANTS: Record<Vowel, [number, number, number][]> = {
  // [centre, q, level]
  oo: [
    [320, 7, 1],
    [800, 9, 0.35],
  ],
  ah: [
    [720, 6, 1],
    [1120, 8, 0.5],
    [2500, 10, 0.12],
  ],
  mm: [
    [260, 5, 1],
    [1900, 12, 0.05],
  ],
};

/**
 * A sung note: a buzzing source through a vowel's formant bands, with a slow
 * vibrato that only arrives once the note is held, and a little breath on it.
 */
function voice(
  c: AudioContext,
  o: AudioNode,
  t: number,
  midi: number,
  { gain = 0.05, attack = 0.09, hold = 0.3, release = 0.45, vowel = "oo" as Vowel, fall = 0 } = {},
) {
  const f = hz(midi);
  const src = c.createOscillator();
  src.type = "sawtooth";
  src.frequency.setValueAtTime(f * 1.012, t);
  src.frequency.exponentialRampToValueAtTime(f, t + attack);
  // A falling tail: grief lets the note go down as it leaves.
  if (fall) src.frequency.setValueAtTime(f, t + attack + hold);
  if (fall) src.frequency.exponentialRampToValueAtTime(f * (1 - fall), t + attack + hold + release);
  const lfo = c.createOscillator();
  const depth = c.createGain();
  lfo.frequency.value = 4.6;
  depth.gain.setValueAtTime(0, t);
  depth.gain.linearRampToValueAtTime(f * 0.011, t + attack + hold * 0.8);
  lfo.connect(depth).connect(src.frequency);
  const amp = c.createGain();
  // Narrow formant bands keep only a sliver of the source: made up here.
  const level = gain * (vowel === "ah" ? 2.6 : 3.4);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(level, t + attack);
  amp.gain.setValueAtTime(level, t + attack + hold);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  for (const [freq, q, g] of FORMANTS[vowel]) {
    const band = c.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = freq;
    band.Q.value = q;
    const bg = c.createGain();
    bg.gain.value = g;
    src.connect(band).connect(bg).connect(amp);
  }
  amp.connect(o);
  const end = t + attack + hold + release + 0.05;
  src.start(t);
  lfo.start(t);
  src.stop(end);
  lfo.stop(end);
  // Breath on the voice.
  crash(c, o, t, { seconds: attack + hold * 0.6, gain: gain * 0.35, freq: 1800, q: 0.9 });
}

/** The drone under the song: two soft, slightly beating sines and a triangle an octave down. */
function drone(c: AudioContext, o: AudioNode, t: number, midi: number, seconds: number, gain = 0.03) {
  swell(c, o, t, { type: "sine", freq: hz(midi), gain, attack: 0.25, hold: seconds * 0.6, release: seconds * 0.4, cutoff: 900 });
  swell(c, o, t + 0.02, { type: "sine", freq: hz(midi) * 1.004, gain: gain * 0.7, attack: 0.3, hold: seconds * 0.55, release: seconds * 0.45, cutoff: 900 });
  swell(c, o, t, { type: "triangle", freq: hz(midi - 12), gain: gain * 0.8, attack: 0.3, hold: seconds * 0.6, release: seconds * 0.4, cutoff: 400 });
}

/** A spadeful of clay landing on wood: the grains, the weight and the knock. */
function clod(c: AudioContext, o: AudioNode, t: number, gain = 0.3) {
  crash(c, o, t, { seconds: 0.16, gain: gain * 0.9, type: "lowpass", freq: 900, sweepTo: 240, q: 0.7 });
  crash(c, o, t + 0.01, { seconds: 0.09, gain: gain * 0.4, freq: 2200, q: 1.1 });
  hit(c, o, t + 0.004, { type: "triangle", from: 190, to: 120, gain: gain * 0.75, attack: 0.002, decay: 0.12 });
  hit(c, o, t + 0.006, { type: "sine", from: 96, to: 60, gain: gain * 0.6, attack: 0.003, decay: 0.2 });
  // Grains still running after it.
  let a = Math.floor(t * 1000) % 997;
  const rand = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 7; i++)
    crash(c, o, t + 0.05 + rand() * 0.3, { seconds: 0.02 + rand() * 0.03, gain: gain * 0.1 * (1 - i / 8), freq: 2600 + rand() * 3000, q: 4 });
}

export const voices: Record<string, Voice> = {
  /** On the board: someone has started to hum, low, under the fight. */
  "elegy-hum": {
    bus: "sfx",
    render: (c, o, t) => {
      voice(c, o, t + 0.02, 57, { gain: 0.05, attack: 0.16, hold: 0.28, release: 0.5, vowel: "mm" });
      drone(c, o, t, 45, 1.1, 0.024);
    },
  },
  /** The close-up: the motif's first two notes, E4 and D4, on "oo", over the drone. */
  "elegy-motif-a": {
    bus: "sfx",
    render: (c, o, t) => {
      voice(c, o, t + 0.1, 64, { gain: 0.06, attack: 0.1, hold: 0.2, release: 0.18, vowel: "oo" });
      voice(c, o, t + 0.42, 62, { gain: 0.065, attack: 0.08, hold: 0.28, release: 0.4, vowel: "oo" });
      drone(c, o, t, 45, 0.9, 0.026);
    },
  },
  /**
   * The graveside: D4 held again and let fall to C4 as the shadow goes down,
   * and one clod of earth into the grave when it lies full length.
   */
  "elegy-motif-b": {
    bus: "sfx",
    render: (c, o, t) => {
      voice(c, o, t + 0.02, 62, { gain: 0.06, attack: 0.08, hold: 0.22, release: 0.2, vowel: "oo" });
      voice(c, o, t + 0.36, 60, { gain: 0.07, attack: 0.1, hold: 0.3, release: 0.55, vowel: "oo", fall: 0.012 });
      voice(c, o, t + 0.38, 48, { gain: 0.02, attack: 0.14, hold: 0.28, release: 0.5, vowel: "mm" });
      drone(c, o, t, 45, 1.2, 0.028);
      clod(c, o, t + 0.7, 0.16);
    },
  },
  /** The quiet: a little earth running off the lip of the grave, grain by grain. */
  "elegy-trickle": {
    bus: "sfx",
    render: (c, o, t) => {
      let a = 71;
      const rand = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
      for (let i = 0; i < 16; i++) {
        const at = t + 0.05 + i * 0.028 + rand() * 0.02;
        crash(c, o, at, { seconds: 0.012 + rand() * 0.02, gain: 0.11 * (1 - i / 20), freq: 3000 + rand() * 3500, q: 5 });
      }
      crash(c, o, t, { seconds: 0.55, gain: 0.05, type: "lowpass", freq: 500, q: 0.4 });
    },
  },
  /**
   * The last note and the grave closing, in layers: the sod breaking
   * (transient), a sub drop, the note A3 sung full on an A minor chord with
   * the whole heap landing (body), and soil running in after it with a long
   * grey air (tail).
   */
  "elegy-earth": {
    bus: "sfx",
    render: (c, o, t) => {
      // Transient: the sod tearing, and a hard knock.
      crash(c, o, t, { seconds: 0.05, gain: 0.95, type: "highpass", freq: 1900, q: 0.7 });
      crash(c, o, t + 0.004, { seconds: 0.12, gain: 0.6, freq: 1100, sweepTo: 420, q: 1.3 });
      hit(c, o, t, { type: "triangle", from: 220, to: 90, gain: 0.5, attack: 0.001, decay: 0.09 });
      // Sub.
      hit(c, o, t, { type: "sine", from: 110, to: 30, gain: 1, attack: 0.002, decay: 0.8 });
      hit(c, o, t + 0.012, { type: "triangle", from: 64, to: 34, gain: 0.35, attack: 0.004, decay: 0.55 });
      // Body: the last note, sung full, and the chord under it.
      voice(c, o, t + 0.01, 57, { gain: 0.13, attack: 0.05, hold: 0.45, release: 0.9, vowel: "ah", fall: 0.01 });
      voice(c, o, t + 0.02, 64, { gain: 0.05, attack: 0.08, hold: 0.4, release: 0.8, vowel: "oo" });
      voice(c, o, t + 0.02, 60, { gain: 0.05, attack: 0.08, hold: 0.4, release: 0.8, vowel: "oo" });
      voice(c, o, t + 0.03, 45, { gain: 0.06, attack: 0.1, hold: 0.4, release: 0.9, vowel: "mm" });
      drone(c, o, t, 33, 1.6, 0.05);
      // The heap landing: weight, then clods on wood.
      crash(c, o, t + 0.01, { seconds: 0.5, gain: 0.55, type: "lowpass", freq: 420, sweepTo: 90, q: 0.6 });
      clod(c, o, t + 0.03, 0.55);
      clod(c, o, t + 0.16, 0.34);
      clod(c, o, t + 0.31, 0.24);
      // Tail: the soil running in, and the grey air.
      let a = 313;
      const rand = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
      for (let i = 0; i < 26; i++)
        crash(c, o, t + 0.35 + rand() * 1.1, { seconds: 0.015 + rand() * 0.03, gain: 0.05 * (1 - i / 30), freq: 2400 + rand() * 3600, q: 4 });
      crash(c, o, t + 0.05, { seconds: 1.7, gain: 0.14, type: "lowpass", freq: 900, sweepTo: 120, q: 0.4 });
    },
  },
  /** On the board after: the motif's last note hummed once more, and the grave settling. */
  "elegy-settle": {
    bus: "sfx",
    render: (c, o, t) => {
      voice(c, o, t + 0.04, 57, { gain: 0.04, attack: 0.12, hold: 0.22, release: 0.5, vowel: "mm" });
      clod(c, o, t + 0.28, 0.1);
      clod(c, o, t + 0.5, 0.06);
    },
  },
};
