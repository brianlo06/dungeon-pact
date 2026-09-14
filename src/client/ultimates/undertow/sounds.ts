import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Undertow: sounds.
 *
 * The sea leaving, and the sea coming back. Its signature is the *drag*: a
 * wave drawing back over shingle, a rattle of stones thinning out under a
 * falling hiss, the sound of water going away. Its voice is breath over the
 * mouth of a bottle, hollow and slow, with a vibrato that never quite holds
 * a note still. Under the surface everything is lowpassed to a rumble with
 * bubbles chirping up through it. No thunder or rain (Debt of Thunder's), no
 * flutter or crackle (Dry Flood's), no reversed sounds (Still Life's), no
 * drips, rings or a bell (Mourning Water's), nothing glassy (Breakwater's).
 */

/** A fixed scatter, so a rattle sounds the same every time it plays. */
function scatter(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

/**
 * Shingle: stones knocking as the water pulls back through them. Short
 * bandpass ticks whose spacing opens out as the water thins, so the rattle
 * runs down to single stones.
 */
function rattle(c: AudioContext, o: AudioNode, t: number, seconds: number, gain: number, seed: number, dense = 1) {
  const rand = scatter(seed);
  let at = 0;
  let i = 0;
  while (at < seconds) {
    const k = at / seconds;
    const g = gain * (0.4 + rand() * 0.6) * (1 - k * 0.7);
    crash(c, o, t + at, { seconds: 0.008 + rand() * 0.016, gain: g, type: "bandpass", freq: 1500 + rand() * 3000, q: 2.5 + rand() * 2 });
    if (rand() < 0.35) crash(c, o, t + at + 0.004, { seconds: 0.02, gain: g * 0.5, type: "bandpass", freq: 600 + rand() * 500, q: 3 });
    at += (0.012 + k * k * 0.09 + rand() * 0.02) / dense;
    i++;
  }
}

/** The drag: the hiss of water pulling back, falling in pitch, with shingle in it. */
function drag(c: AudioContext, o: AudioNode, t: number, seconds: number, gain: number, seed = 5) {
  crash(c, o, t, { seconds, gain: gain * 0.7, type: "bandpass", freq: 1500, sweepTo: 260, q: 0.6 });
  crash(c, o, t + 0.02, { seconds: seconds * 0.8, gain: gain * 0.35, type: "lowpass", freq: 700, sweepTo: 140, q: 0.7 });
  rattle(c, o, t + 0.03, seconds * 0.9, gain * 0.5, seed);
}

/** A bubble: a chirp going up as it rises. */
function bubble(c: AudioContext, o: AudioNode, t: number, gain: number, from = 380) {
  hit(c, o, t, { type: "sine", from, to: from * 3.2, gain, attack: 0.004, decay: 0.05 });
}

function bubbles(c: AudioContext, o: AudioNode, t: number, seconds: number, count: number, gain: number, seed: number) {
  const rand = scatter(seed);
  for (let i = 0; i < count; i++) bubble(c, o, t + rand() * seconds, gain * (0.4 + rand() * 0.6), 260 + rand() * 360);
}

/**
 * The blown voice: breath over a bottle's mouth. A sine fundamental with a
 * soft triangle an octave up, a band of breath-noise at the pitch, a slow
 * attack, and a vibrato that wanders.
 */
function blow(c: AudioContext, o: AudioNode, t: number, midi: number, seconds: number, gain: number, vib = 5) {
  const f = hz(midi);
  const osc = c.createOscillator();
  const up = c.createOscillator();
  const amp = c.createGain();
  const lfo = c.createOscillator();
  const depth = c.createGain();
  osc.type = "sine";
  up.type = "triangle";
  osc.frequency.setValueAtTime(f, t);
  up.frequency.setValueAtTime(f * 2, t);
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(vib, t);
  lfo.frequency.linearRampToValueAtTime(vib * 0.7, t + seconds);
  depth.gain.setValueAtTime(0, t);
  depth.gain.linearRampToValueAtTime(f * 0.012, t + seconds * 0.5);
  lfo.connect(depth);
  depth.connect(osc.frequency);
  depth.connect(up.frequency);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.09);
  amp.gain.setValueAtTime(gain, t + seconds * 0.55);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  const upAmp = c.createGain();
  upAmp.gain.value = 0.22;
  osc.connect(amp);
  up.connect(upAmp).connect(amp);
  amp.connect(o);
  osc.start(t);
  up.start(t);
  lfo.start(t);
  osc.stop(t + seconds + 0.05);
  up.stop(t + seconds + 0.05);
  lfo.stop(t + seconds + 0.05);
  // The breath in it.
  crash(c, o, t, { seconds: seconds * 0.9, gain: gain * 0.5, type: "bandpass", freq: f, q: 14 });
  crash(c, o, t, { seconds: 0.12, gain: gain * 0.35, type: "bandpass", freq: 900, q: 0.8 });
}

/** The motif's four notes: G3, D4, C4, then F4 held. A swell that does not resolve. */
const MOTIF: [number, number, number][] = [
  [0, 55, 0.24],
  [0.2, 62, 0.24],
  [0.4, 60, 0.26],
  [0.62, 65, 0.9],
];

export const voices: Record<string, Voice> = {
  /** The call: the sea's first pull away, the ground giving under it. The round stops. */
  "tide-call": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 80, to: 38, gain: 0.5, attack: 0.01, decay: 0.42 });
      drag(c, o, t + 0.04, 0.55, 0.5, 3);
    },
  },
  /** The signature: the water drawing back through the shingle. */
  "tide-drag": {
    bus: "sfx",
    render: (c, o, t) => {
      drag(c, o, t, 0.95, 0.45, 11);
    },
  },
  /**
   * The strain: a low held tone rising under its own weight, the arm's
   * creak in it, and the far drag going on.
   */
  "tide-strain": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sawtooth", freq: hz(43), gain: 0.09, attack: 0.3, hold: 0.5, release: 0.4, cutoff: 900, detune: -6 });
      swell(c, o, t + 0.05, { type: "sawtooth", freq: hz(43) * 1.005, gain: 0.07, attack: 0.35, hold: 0.45, release: 0.4, cutoff: 700, detune: 7 });
      swell(c, o, t, { type: "sine", freq: hz(31), gain: 0.12, attack: 0.4, hold: 0.5, release: 0.4, cutoff: 300 });
      const rand = scatter(17);
      for (let i = 0; i < 9; i++) {
        const at = 0.1 + rand() * 1.0;
        crash(c, o, t + at, { seconds: 0.03 + rand() * 0.05, gain: 0.05 + rand() * 0.05, type: "bandpass", freq: 500 + rand() * 500, q: 6 });
      }
      crash(c, o, t + 0.2, { seconds: 1.0, gain: 0.08, type: "bandpass", freq: 900, sweepTo: 300, q: 0.7 });
    },
  },
  /** The Tidecaller's motif. */
  "tide-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [at, midi, len] of MOTIF) blow(c, o, t + at, midi, len, 0.11, at > 0.5 ? 4.5 : 6);
      swell(c, o, t + 0.6, { type: "sine", freq: hz(41), gain: 0.05, attack: 0.25, hold: 0.3, release: 0.4, cutoff: 260 });
    },
  },
  /**
   * The quiet: the seabed bare. A fish flapping twice on the sand, water
   * trickling out of it somewhere, and then nothing at all.
   */
  "tide-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t + 0.05, { seconds: 0.03, gain: 0.14, type: "bandpass", freq: 520, q: 1.2 });
      crash(c, o, t + 0.16, { seconds: 0.025, gain: 0.1, type: "bandpass", freq: 600, q: 1.2 });
      const rand = scatter(23);
      for (let i = 0; i < 14; i++) crash(c, o, t + 0.05 + rand() * 0.4, { seconds: 0.01, gain: 0.02 + rand() * 0.02, type: "highpass", freq: 3200 + rand() * 1800, q: 0.7 });
      hit(c, o, t, { type: "sine", from: hz(38), gain: 0.03, attack: 0.15, decay: 0.4 });
    },
  },
  "tide-hush-fast": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t + 0.04, { seconds: 0.03, gain: 0.14, type: "bandpass", freq: 520, q: 1.2 });
      crash(c, o, t + 0.12, { seconds: 0.025, gain: 0.1, type: "bandpass", freq: 600, q: 1.2 });
      hit(c, o, t, { type: "sine", from: hz(38), gain: 0.03, attack: 0.1, decay: 0.28 });
    },
  },
  /**
   * The sea back, in layers: a slap and a click (transient); a sub dropping
   * (weight); a wide band of noise sweeping down, a low push, the whole
   * flat filling at once (body); and, as the film goes under, a rumble with
   * bubbles chirping up through it (tail).
   */
  "tide-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.55, type: "highpass", freq: 3000, q: 0.5 });
      crash(c, o, t, { seconds: 0.09, gain: 0.55, type: "bandpass", freq: 720, q: 0.9 });
      hit(c, o, t, { type: "square", from: 900, to: 200, gain: 0.07, attack: 0.001, decay: 0.03 });
      hit(c, o, t, { type: "sine", from: 115, to: 26, gain: 1, attack: 0.002, decay: 0.9 });
      crash(c, o, t + 0.004, { seconds: 0.7, gain: 0.45, type: "lowpass", freq: 1600, sweepTo: 180, q: 0.6 });
      crash(c, o, t + 0.01, { seconds: 0.6, gain: 0.35, type: "bandpass", freq: 420, sweepTo: 90, q: 0.8 });
      swell(c, o, t + 0.01, { type: "sine", freq: 48, gain: 0.25, attack: 0.05, hold: 0.3, release: 0.5, cutoff: 200 });
      crash(c, o, t + 0.06, { seconds: 1.6, gain: 0.22, type: "lowpass", freq: 260, sweepTo: 50, q: 0.4 });
      bubbles(c, o, t + 0.25, 1.0, 10, 0.06, 31);
    },
  },
  /** Under the surface: the world lowpassed to a rumble, pressure, bubbles. */
  "tide-under": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 1.2, gain: 0.3, type: "lowpass", freq: 220, sweepTo: 90, q: 0.5 });
      swell(c, o, t, { type: "sine", freq: 44, gain: 0.12, attack: 0.2, hold: 0.5, release: 0.5, cutoff: 200 });
      swell(c, o, t + 0.1, { type: "sine", freq: 61, gain: 0.05, attack: 0.3, hold: 0.4, release: 0.4, cutoff: 200 });
      bubbles(c, o, t + 0.05, 0.9, 8, 0.05, 43);
    },
  },
  /** Release: the drag again, softer, and the motif's last two notes. */
  "tide-after": {
    bus: "sfx",
    render: (c, o, t) => {
      drag(c, o, t + 0.05, 0.8, 0.3, 53);
      blow(c, o, t + 0.12, 60, 0.3, 0.07, 6);
      blow(c, o, t + 0.4, 65, 0.9, 0.07, 4.5);
    },
  },
};
