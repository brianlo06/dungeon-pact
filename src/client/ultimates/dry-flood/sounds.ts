import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Dry Flood: sounds.
 *
 * Fire is air. Almost every sound here is breath of one kind or another: the
 * hollow whump of a flame taking hold (air pulled in and let go at once), the
 * roar of fire running (a wide band of noise), the crackle of dry things
 * catching, and, in the quiet, the air being drawn up the steps towards the
 * fire and then nothing at all. Its tones *flutter*, the way a flame does. No
 * thunder, no rain, no pages (Debt of Thunder's), no reversed sounds or
 * shutters (Still Life's), no anvils or forge roar (Gatebreaker's).
 */

/** A fixed scatter, so a crackle sounds the same every time it plays. */
function scatter(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

/** Dry things catching: short bright ticks of noise, unevenly spaced. */
function crackle(c: AudioContext, o: AudioNode, t: number, seconds: number, count: number, gain: number, seed = 7) {
  const rand = scatter(seed);
  for (let i = 0; i < count; i++) {
    const at = t + rand() * seconds;
    const g = gain * (0.35 + rand() * 0.65);
    crash(c, o, at, { seconds: 0.012 + rand() * 0.02, gain: g, type: "highpass", freq: 2200 + rand() * 2600, q: 0.7 });
    if (rand() < 0.3) crash(c, o, at + 0.006, { seconds: 0.03, gain: g * 0.5, type: "bandpass", freq: 900 + rand() * 600, q: 2 });
  }
}

/**
 * A swell of noise with a shaped rise: `crash` only decays, so the rise is
 * built from overlapping bursts, each louder than the last.
 */
function rise(c: AudioContext, o: AudioNode, t: number, seconds: number, gain: number, from: number, to: number, type: BiquadFilterType = "lowpass") {
  const steps = Math.max(4, Math.round(seconds / 0.035));
  for (let i = 0; i < steps; i++) {
    const k = (i + 1) / steps;
    crash(c, o, t + seconds * (i / steps), {
      seconds: 0.09,
      gain: gain * k * k,
      type,
      freq: from + (to - from) * k,
      q: 0.8,
    });
  }
}

/** The whump of a flame taking hold: air drawn in, let go in one breath. */
function whump(c: AudioContext, o: AudioNode, t: number, gain: number) {
  rise(c, o, t, 0.07, gain * 0.5, 300, 900);
  crash(c, o, t + 0.07, { seconds: 0.32, gain: gain * 0.7, type: "lowpass", freq: 900, sweepTo: 180, q: 0.7 });
  hit(c, o, t + 0.07, { type: "sine", from: 95, to: 42, gain: gain * 0.7, attack: 0.006, decay: 0.28 });
  crash(c, o, t + 0.08, { seconds: 0.4, gain: gain * 0.22, type: "bandpass", freq: 520, sweepTo: 300, q: 1.1 });
}

/**
 * A note that flutters like a flame: a reedy tone through a lowpass, its
 * loudness shaken by a fast tremolo that slows as the note dies.
 */
function flutter(c: AudioContext, o: AudioNode, t: number, midi: number, seconds: number, gain: number, sag = 0) {
  const osc = c.createOscillator();
  const filter = c.createBiquadFilter();
  const amp = c.createGain();
  const trem = c.createGain();
  const lfo = c.createOscillator();
  const depth = c.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(hz(midi), t);
  if (sag) osc.frequency.linearRampToValueAtTime(hz(midi) * (1 - sag), t + seconds);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1300, t);
  filter.frequency.exponentialRampToValueAtTime(500, t + seconds);
  filter.Q.value = 2;
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.025);
  amp.gain.setValueAtTime(gain, t + seconds * 0.4);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  lfo.frequency.setValueAtTime(13, t);
  lfo.frequency.linearRampToValueAtTime(6, t + seconds);
  depth.gain.value = 0.45;
  trem.gain.value = 0.6;
  lfo.connect(depth).connect(trem.gain);
  osc.connect(filter).connect(trem).connect(amp).connect(o);
  osc.start(t);
  lfo.start(t);
  osc.stop(t + seconds + 0.05);
  lfo.stop(t + seconds + 0.05);
  hit(c, o, t, { type: "triangle", from: hz(midi - 12), gain: gain * 0.35, attack: 0.02, decay: seconds * 0.9 });
}

export const voices: Record<string, Voice> = {
  /** The call: the spark scraped like a match, and the catch. The round stops. */
  "dry-call": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.05, gain: 0.18, type: "bandpass", freq: 2600, q: 1.4 });
      crash(c, o, t + 0.05, { seconds: 0.08, gain: 0.24, type: "bandpass", freq: 3200, sweepTo: 1800, q: 1.2 });
      whump(c, o, t + 0.13, 0.5);
      crackle(c, o, t + 0.22, 0.3, 6, 0.08, 3);
    },
  },
  /** The signature: a flame taking hold in the glove. */
  "dry-catch": {
    bus: "sfx",
    render: (c, o, t) => {
      whump(c, o, t, 0.55);
      crackle(c, o, t + 0.08, 0.3, 5, 0.07, 11);
    },
  },
  /** The spark poured over the lip: a falling rush of fire, crackling. */
  "dry-pour": {
    bus: "sfx",
    render: (c, o, t) => {
      whump(c, o, t, 0.4);
      rise(c, o, t + 0.02, 0.18, 0.18, 500, 1100, "bandpass");
      crash(c, o, t + 0.2, { seconds: 0.5, gain: 0.2, type: "bandpass", freq: 1000, sweepTo: 420, q: 0.8 });
      crackle(c, o, t + 0.05, 0.55, 12, 0.08, 19);
    },
  },
  /**
   * The Pyromancer's motif: A3, E4, F4, then D4 held and guttering out, every
   * note fluttering like a flame. A rising question that sags at its end.
   */
  "dry-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes: [number, number, number, number][] = [
        [0, 57, 0.2, 0],
        [0.18, 64, 0.2, 0],
        [0.36, 65, 0.26, 0],
        [0.6, 62, 0.7, 0.03],
      ];
      for (const [at, midi, len, sag] of notes) flutter(c, o, t + at, midi, len, 0.11, sag);
      swell(c, o, t + 0.55, { type: "sine", freq: hz(38), gain: 0.06, attack: 0.2, hold: 0.25, release: 0.3, cutoff: 300 });
    },
  },
  /** The fire starting down the steps, far off: a roar coming. */
  "dry-roar": {
    bus: "sfx",
    render: (c, o, t) => {
      rise(c, o, t, 0.8, 0.2, 200, 700);
      swell(c, o, t, { type: "sine", freq: 46, gain: 0.08, attack: 0.6, hold: 0.2, release: 0.2, cutoff: 200 });
      crackle(c, o, t + 0.3, 0.5, 6, 0.04, 23);
    },
  },
  /** Running with the front: the roar, and a whump at every step it takes. */
  "dry-run": {
    bus: "sfx",
    render: (c, o, t) => {
      rise(c, o, t, 0.5, 0.26, 400, 1400, "bandpass");
      for (let i = 0; i < 6; i++) {
        // The steps come faster as the fire does.
        const at = 0.5 * (1 - Math.pow(1 - (i + 1) / 7, 1.8));
        whump(c, o, t + at, 0.18 + i * 0.03);
      }
      crackle(c, o, t, 0.55, 14, 0.07, 31);
    },
  },
  /**
   * The quiet: the air drawn up the steps past the row towards the fire, a
   * long soft breath in, and then nothing at all before the flood.
   */
  "dry-draw": {
    bus: "sfx",
    render: (c, o, t) => {
      rise(c, o, t, 0.36, 0.5, 180, 520);
      crackle(c, o, t + 0.02, 0.2, 2, 0.03, 41);
      hit(c, o, t, { type: "sine", from: hz(38), gain: 0.03, attack: 0.1, decay: 0.34 });
    },
  },
  "dry-draw-fast": {
    bus: "sfx",
    render: (c, o, t) => {
      rise(c, o, t, 0.26, 0.5, 180, 520);
      hit(c, o, t, { type: "sine", from: hz(38), gain: 0.03, attack: 0.08, decay: 0.24 });
    },
  },
  /**
   * The flood through the row, in layers: a dry crack and a click
   * (transient); a sub dropping out (weight); the roar of fire filling the
   * basin, a wide band sweeping down, and the whump of it all catching at
   * once (body); crackle over a long low rumble (tail).
   */
  "dry-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.045, gain: 0.6, type: "highpass", freq: 2600, q: 0.5 });
      hit(c, o, t, { type: "square", from: 1500, to: 300, gain: 0.09, attack: 0.001, decay: 0.03 });
      hit(c, o, t, { type: "sine", from: 130, to: 28, gain: 1, attack: 0.002, decay: 0.9 });
      hit(c, o, t, { type: "triangle", from: 240, to: 60, gain: 0.3, attack: 0.002, decay: 0.3 });
      crash(c, o, t + 0.003, { seconds: 0.6, gain: 0.42, type: "bandpass", freq: 1300, sweepTo: 200, q: 0.7 });
      crash(c, o, t + 0.01, { seconds: 0.5, gain: 0.34, type: "lowpass", freq: 1100, sweepTo: 160, q: 0.6 });
      whump(c, o, t + 0.02, 0.5);
      crackle(c, o, t + 0.1, 1.1, 22, 0.08, 53);
      crash(c, o, t + 0.05, { seconds: 1.5, gain: 0.24, type: "lowpass", freq: 320, sweepTo: 50, q: 0.4 });
      hit(c, o, t + 0.04, { type: "sine", from: 55, to: 38, gain: 0.3, attack: 0.05, decay: 1.2 });
    },
  },
  /** Release: the row still crackling, the sleeve's hiss, the motif's last two notes. */
  "dry-after": {
    bus: "sfx",
    render: (c, o, t) => {
      crackle(c, o, t, 0.9, 12, 0.06, 61);
      crash(c, o, t + 0.18, { seconds: 0.26, gain: 0.06, type: "highpass", freq: 3800, q: 0.5 });
      crash(c, o, t + 0.34, { seconds: 0.3, gain: 0.05, type: "highpass", freq: 3400, q: 0.5 });
      flutter(c, o, t + 0.1, 65, 0.3, 0.07);
      flutter(c, o, t + 0.36, 62, 0.9, 0.07, 0.03);
    },
  },
};
