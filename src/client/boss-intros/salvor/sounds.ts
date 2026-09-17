import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * The Salvor's entrance, in sound: a flooded cistern. Drips with a long
 * hollow tail, hull metal groaning under water, a bubble, a gulp — and when it
 * comes up, the sheet of water off it and plates clicking shut like shells.
 * No surf and no wave (Breakwater's), and nothing heard from under the water
 * (Undertow's): everything is the surface, heard from the air.
 *
 * The motif is a diver's bell, rung under water: a low C, the E♭ above,
 * then down to B and held — a bell that sank.
 */

/** A drip in a big stone room: a plink and a soft repeat off the vault. */
function drip(c: AudioContext, o: AudioNode, t: number, gain = 0.06, pitch = 1) {
  hit(c, o, t, { type: "sine", from: 1500 * pitch, to: 900 * pitch, gain, decay: 0.06 });
  hit(c, o, t + 0.21, { type: "sine", from: 1500 * pitch, to: 900 * pitch, gain: gain * 0.3, decay: 0.08 });
  hit(c, o, t + 0.43, { type: "sine", from: 1500 * pitch, to: 900 * pitch, gain: gain * 0.1, decay: 0.1 });
}

/** Hull plate groaning: a slow, bending low tone. */
function groan(c: AudioContext, o: AudioNode, t: number, seconds: number, gain = 0.08) {
  swell(c, o, t, { type: "sawtooth", freq: 58, gain, attack: seconds * 0.4, hold: seconds * 0.2, release: seconds * 0.4, cutoff: 260, detune: -40 });
  crash(c, o, t, { seconds, gain: gain * 0.6, freq: 240, q: 4, sweepTo: 160 });
}

/** A bell heard through water: a muffled strike with a slow beat. */
function bell(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.07, ring = 0.8) {
  swell(c, o, t, { type: "triangle", freq: hz(midi), gain, attack: 0.01, hold: 0.02, release: ring, cutoff: 900 });
  swell(c, o, t, { type: "sine", freq: hz(midi) * 2.02, gain: gain * 0.3, attack: 0.01, hold: 0.01, release: ring * 0.5, cutoff: 1400, detune: 8 });
}

export const voices: Record<string, Voice> = {
  /** On the board: a drip in the dark, and something big shifting under the floor. */
  "svi-drip": {
    bus: "sfx",
    render: (c, o, t) => {
      drip(c, o, t, 0.3);
      groan(c, o, t + 0.1, 0.9, 0.4);
    },
  },
  /** The Wreck Pool: water lapping on stone, a wreck settling, the lamp moving below. */
  "svi-pool": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 4; i++) crash(c, o, t + i * 0.22, { seconds: 0.18, gain: 0.05, type: "lowpass", freq: 700, q: 1.2 });
      drip(c, o, t + 0.5, 0.05, 1.2);
      groan(c, o, t + 0.1, 0.8, 0.06);
    },
  },
  /** One bubble reaching the surface. */
  "svi-bubble": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 380, to: 1100, gain: 0.05, attack: 0.005, decay: 0.07 });
    },
  },
  /** The shield taken under: a snatch and a gulp. */
  "svi-gulp": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.12, gain: 0.25, type: "lowpass", freq: 900, q: 1, sweepTo: 300 });
      hit(c, o, t + 0.05, { type: "sine", from: 260, to: 90, gain: 0.2, decay: 0.16 });
    },
  },
  /** It comes up: water sheeting off a great weight, and the hull groan. */
  "svi-rise": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.7, gain: 0.3, freq: 1400, q: 0.5, sweepTo: 600 });
      for (let i = 0; i < 12; i++) drip(c, o, t + 0.25 + i * 0.04, 0.03, 0.8 + (i % 4) * 0.15);
      groan(c, o, t, 0.8, 0.12);
    },
  },
  /**
   * The gaff comes down on the ledge: iron on stone (transient), the sub
   * (weight), a column of water thrown up and falling back (body).
   */
  "svi-haul": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.05, gain: 0.6, type: "highpass", freq: 1500, q: 0.7 });
      hit(c, o, t, { type: "sine", from: 92, to: 34, gain: 0.85, attack: 0.002, decay: 0.65 });
      crash(c, o, t + 0.01, { seconds: 0.25, gain: 0.4, type: "lowpass", freq: 1200, q: 0.6 });
      crash(c, o, t + 0.2, { seconds: 0.7, gain: 0.35, freq: 2200, q: 0.4, sweepTo: 700 });
      bell(c, o, t + 0.02, 36, 0.12, 1.2);
    },
  },
  /** Plates climbing out of the water and clicking shut on its back, one, two, three. */
  "svi-plates": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.3, gain: 0.12, type: "lowpass", freq: 900, q: 1 });
      for (let i = 0; i < 3; i++) {
        const at = t + 0.3 + i * 0.13;
        crash(c, o, at, { seconds: 0.03, gain: 0.7, freq: 2600 - i * 200, q: 3 });
        hit(c, o, at, { type: "triangle", from: 420 - i * 30, gain: 0.28, decay: 0.12 });
      }
    },
  },
  /** The motif: a bell that sank. C, E♭, then B below, held. */
  "svi-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      bell(c, o, t, 48, 0.1, 0.4);
      bell(c, o, t + 0.2, 51, 0.1, 0.4);
      bell(c, o, t + 0.42, 47, 0.13, 1.2);
    },
  },
  /** The return: water settling back. */
  "svi-settle": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.45, gain: 0.14, type: "lowpass", freq: 800, q: 0.8 });
      drip(c, o, t + 0.2, 0.08);
    },
  },
};
