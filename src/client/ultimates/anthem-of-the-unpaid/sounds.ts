import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Anthem of the Unpaid's sounds. Breath, a brass horn, voices and cloth —
 * nothing struck, nothing broken, nothing electric — and one sound only this
 * film has: every voice snapping taut at once, like a flag cracking open in a
 * sudden wind, under the chord.
 *
 * The motif is a question and its answer, and it is original: a horn asks A3;
 * the party answers E4, then F♯4; and the last note is all of them together on
 * a D major chord with D5 on top. Blown, then sung, then both.
 */

/** A sung vowel: a buzzing source through two formant bands, swelled. */
function sing(
  c: AudioContext,
  o: AudioNode,
  t: number,
  midi: number,
  { gain = 0.05, attack = 0.08, hold = 0.3, release = 0.4, vowel = "ah", vibrato = 5 }: {
    gain?: number;
    attack?: number;
    hold?: number;
    release?: number;
    vowel?: "ah" | "oh";
    vibrato?: number;
  } = {},
) {
  const f = hz(midi);
  const src = c.createOscillator();
  src.type = "sawtooth";
  src.frequency.setValueAtTime(f * 0.985, t);
  src.frequency.exponentialRampToValueAtTime(f, t + attack);
  const lfo = c.createOscillator();
  const depth = c.createGain();
  lfo.frequency.value = vibrato;
  depth.gain.setValueAtTime(0, t);
  depth.gain.linearRampToValueAtTime(f * 0.008, t + attack + hold * 0.6);
  lfo.connect(depth).connect(src.frequency);
  const amp = c.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + attack);
  amp.gain.setValueAtTime(gain, t + attack + hold);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  const [f1, f2] = vowel === "ah" ? [760, 1180] : [520, 900];
  for (const [freq, q, g] of [
    [f1, 6, 1],
    [f2, 8, 0.55],
  ] as const) {
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
}

/** A horn note: a lip buzz into the note, a brass swell with its octave. */
function horn(c: AudioContext, o: AudioNode, t: number, midi: number, { gain = 0.1, hold = 0.4, release = 0.45 } = {}) {
  crash(c, o, t, { seconds: 0.05, gain: gain * 0.9, freq: hz(midi) * 3, q: 3 });
  hit(c, o, t, { type: "sawtooth", from: hz(midi - 1), to: hz(midi), gain: gain * 0.5, attack: 0.01, decay: 0.08 });
  swell(c, o, t, { type: "sawtooth", freq: hz(midi), gain, attack: 0.06, hold, release, cutoff: 1500, detune: -4 });
  swell(c, o, t + 0.01, { type: "sawtooth", freq: hz(midi), gain: gain * 0.6, attack: 0.08, hold, release, cutoff: 1100, detune: 7 });
  swell(c, o, t + 0.02, { type: "square", freq: hz(midi + 12), gain: gain * 0.18, attack: 0.1, hold: hold * 0.8, release, cutoff: 2400 });
}

export const voices: Record<string, Voice> = {
  /** The breath drawn in before the horn: noise rising through a narrow band. */
  "anthem-breath": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.42, gain: 0.16, freq: 700, sweepTo: 2400, q: 1.4 });
      crash(c, o, t + 0.05, { seconds: 0.35, gain: 0.06, type: "highpass", freq: 3000, q: 0.5 });
    },
  },
  /** The question: the horn's one note, A3, held and let go. */
  "anthem-horn": {
    bus: "sfx",
    render: (c, o, t) => {
      horn(c, o, t, 57, { gain: 0.12, hold: 0.42, release: 0.55 });
      // The air in the hall of the sky answering it, very far off.
      swell(c, o, t + 0.25, { type: "sine", freq: hz(69), gain: 0.02, attack: 0.2, hold: 0.2, release: 0.6 });
    },
  },
  /**
   * The answers: E4, then F♯4, each a voice coming in a beat after the last,
   * a low hum of the rest of the pact under them.
   */
  "anthem-answer": {
    bus: "sfx",
    render: (c, o, t) => {
      sing(c, o, t + 0.05, 64, { gain: 0.06, hold: 0.3, release: 0.35 });
      sing(c, o, t + 0.1, 52, { gain: 0.025, hold: 0.25, release: 0.3, vowel: "oh" });
      sing(c, o, t + 0.38, 66, { gain: 0.065, hold: 0.28, release: 0.4 });
      sing(c, o, t + 0.42, 54, { gain: 0.025, hold: 0.25, release: 0.35, vowel: "oh" });
      sing(c, o, t + 0.62, 69, { gain: 0.04, hold: 0.12, release: 0.3, vowel: "oh" });
    },
  },
  /** The quiet: a thin, held note fading out, nothing else. */
  "anthem-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sine", freq: hz(78), gain: 0.012, attack: 0.02, hold: 0.05, release: 0.4 });
      swell(c, o, t, { type: "sine", freq: hz(66), gain: 0.01, attack: 0.02, hold: 0.05, release: 0.3 });
    },
  },
  /** The breath before every voice at once: short, sharp and close. */
  "anthem-gasp": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.16, gain: 0.26, freq: 1100, sweepTo: 3600, q: 1.1 });
      crash(c, o, t, { seconds: 0.12, gain: 0.1, type: "highpass", freq: 4200, q: 0.4 });
    },
  },
  /**
   * Every voice at once, in layers: the ribbons cracking taut (two cloth
   * snaps), a sub drop, the chord — brass and voices on D major with D5 on
   * top — and the air ringing after it.
   */
  "anthem-chord": {
    bus: "sfx",
    render: (c, o, t) => {
      // Transient: the crack of cloth in a sudden wind.
      crash(c, o, t, { seconds: 0.04, gain: 0.9, type: "highpass", freq: 2200, q: 0.6 });
      crash(c, o, t + 0.035, { seconds: 0.07, gain: 0.45, freq: 1400, sweepTo: 700, q: 1.4 });
      crash(c, o, t + 0.07, { seconds: 0.03, gain: 0.3, type: "highpass", freq: 3000, q: 0.5 });
      // Sub.
      hit(c, o, t, { type: "sine", from: 130, to: 36, gain: 0.85, attack: 0.003, decay: 0.7 });
      // Body: the chord.
      for (const m of [50, 57, 62]) horn(c, o, t + 0.005, m, { gain: 0.07, hold: 0.55, release: 0.8 });
      for (const [i, m] of [66, 69, 74].entries())
        sing(c, o, t + 0.01 + i * 0.006, m, { gain: 0.05, attack: 0.03, hold: 0.55, release: 0.8 });
      sing(c, o, t + 0.02, 62, { gain: 0.04, attack: 0.03, hold: 0.5, release: 0.7, vowel: "oh" });
      // Tail: air moving, a long way.
      crash(c, o, t + 0.02, { seconds: 1.4, gain: 0.2, type: "lowpass", freq: 900, sweepTo: 120, q: 0.4 });
      crash(c, o, t + 0.1, { seconds: 1.1, gain: 0.05, freq: 5200, sweepTo: 2000, q: 0.7 });
    },
  },
  /** On the board after: the ribbons settling, cloth fluttering softly. */
  "anthem-flutter": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 6; i++)
        crash(c, o, t + i * 0.055 + (i % 2) * 0.015, { seconds: 0.05, gain: 0.07 - i * 0.008, freq: 1600 - i * 120, q: 2 });
    },
  },
  /** The motif, hummed back by the party as the fight resumes: A, E, F♯, D. */
  "anthem-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      sing(c, o, t, 57, { gain: 0.03, attack: 0.03, hold: 0.06, release: 0.12, vowel: "oh" });
      sing(c, o, t + 0.13, 64, { gain: 0.03, attack: 0.03, hold: 0.05, release: 0.1, vowel: "oh" });
      sing(c, o, t + 0.24, 66, { gain: 0.03, attack: 0.03, hold: 0.05, release: 0.1, vowel: "oh" });
      sing(c, o, t + 0.36, 62, { gain: 0.035, attack: 0.04, hold: 0.2, release: 0.45, vowel: "oh" });
      sing(c, o, t + 0.36, 69, { gain: 0.018, attack: 0.05, hold: 0.18, release: 0.4, vowel: "oh" });
    },
  },
};
