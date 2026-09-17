import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * The Bailiff's entrance, in sound: procedure. Three knocks on a heavy door,
 * boots that stop, paper sliding over stone, a lock turned from the far side,
 * and the rap of an iron-bound tipstaff on a court floor — dry, wooden, loud,
 * and exactly once. No chains (the Collector's), no wax (the Notary's).
 *
 * The motif is a summons read out: a monotone on E, four syllables, and a
 * drop of a fourth to B on the last — "you are called".
 */

/** A knuckle-and-baton knock on thick oak. */
function knock(c: AudioContext, o: AudioNode, t: number, gain = 0.2) {
  crash(c, o, t, { seconds: 0.05, gain: gain * 1.4, type: "bandpass", freq: 320, q: 1.5 });
  hit(c, o, t, { type: "sine", from: 140, to: 90, gain, attack: 0.002, decay: 0.16 });
  crash(c, o, t + 0.005, { seconds: 0.02, gain: gain * 0.6, freq: 1800, q: 2 });
}

/** A boot on stone. */
function step(c: AudioContext, o: AudioNode, t: number, gain = 0.06) {
  crash(c, o, t, { seconds: 0.05, gain, type: "lowpass", freq: 500, q: 1 });
  crash(c, o, t + 0.02, { seconds: 0.03, gain: gain * 0.5, freq: 2200, q: 1.5 });
}

/** A low brass tone, for the office. */
function brass(c: AudioContext, o: AudioNode, t: number, midi: number, seconds: number, gain = 0.06) {
  swell(c, o, t, { type: "sawtooth", freq: hz(midi), gain, attack: 0.03, hold: seconds * 0.6, release: seconds * 0.4, cutoff: 900 });
  swell(c, o, t, { type: "square", freq: hz(midi - 12), gain: gain * 0.4, attack: 0.03, hold: seconds * 0.6, release: seconds * 0.4, cutoff: 400 });
}

export const voices: Record<string, Voice> = {
  /** On the board: three knocks. */
  "bli-knocks": {
    bus: "sfx",
    render: (c, o, t) => {
      knock(c, o, t, 0.4);
      knock(c, o, t + 0.14, 0.4);
      knock(c, o, t + 0.28, 0.5);
    },
  },
  /** The hall of served doors: boots coming along it. */
  "bli-hall": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 5; i++) step(c, o, t + 0.05 + i * 0.19, 0.04 + i * 0.012);
      swell(c, o, t, { type: "sawtooth", freq: 44, gain: 0.04, attack: 0.3, hold: 0.4, release: 0.4, cutoff: 200 });
    },
  },
  /** The quiet: the boots stop, and paper slides under the door. */
  "bli-slide": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.32, gain: 0.07, freq: 2600, q: 0.7, sweepTo: 1800 });
    },
  },
  "bli-stop": {
    bus: "sfx",
    render: (c, o, t) => step(c, o, t, 0.35),
  },
  /** The lock turned from the far side, and the door swung in. */
  "bli-door": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.6, freq: 2400, q: 5 });
      hit(c, o, t + 0.04, { type: "triangle", from: 520, gain: 0.2, decay: 0.12 });
      crash(c, o, t + 0.14, { seconds: 0.5, gain: 0.6, freq: 420, q: 4, sweepTo: 260 });
      brass(c, o, t + 0.3, 40, 0.6, 0.14);
    },
  },
  /**
   * The rap: the staff's iron foot on the floor — a hard wooden crack
   * (transient), the sub (weight), the room answering (body), and a brass
   * chord under it: the court is in session.
   */
  "bli-rap": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.04, gain: 1.0, type: "bandpass", freq: 900, q: 1.2 });
      hit(c, o, t, { type: "sine", from: 110, to: 36, gain: 1.2, attack: 0.002, decay: 0.55 });
      crash(c, o, t + 0.02, { seconds: 0.6, gain: 0.2, type: "lowpass", freq: 600, q: 0.7, sweepTo: 200 });
      knock(c, o, t + 0.22, 0.08);
      knock(c, o, t + 0.44, 0.03);
      brass(c, o, t + 0.02, 40, 1.1, 0.08);
      brass(c, o, t + 0.02, 47, 1.1, 0.05);
    },
  },
  /** A writ served: paper snapped through the air and slapped on. */
  "bli-serve": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.2, gain: 0.3, freq: 1800, q: 1, sweepTo: 3600 });
      crash(c, o, t + 0.22, { seconds: 0.05, gain: 0.6, type: "bandpass", freq: 1400, q: 1.5 });
      hit(c, o, t + 0.22, { type: "sine", from: 180, to: 90, gain: 0.25, decay: 0.12 });
    },
  },
  /** Torn off and served back: a rip, a throw, a slap on the Bailiff. */
  "bli-return": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.12, gain: 0.4, freq: 3000, q: 0.9, sweepTo: 1500 });
      crash(c, o, t + 0.1, { seconds: 0.16, gain: 0.25, freq: 1500, q: 1, sweepTo: 3600 });
      crash(c, o, t + 0.28, { seconds: 0.05, gain: 0.6, type: "bandpass", freq: 1100, q: 1.5 });
      hit(c, o, t + 0.28, { type: "sine", from: 150, to: 70, gain: 0.3, decay: 0.14 });
    },
  },
  /** The motif: a summons read out. E, E, E, E, then B below, held. */
  "bli-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 4; i++) brass(c, o, t + i * 0.13, 52, 0.1, 0.06);
      brass(c, o, t + 0.55, 47, 0.8, 0.08);
    },
  },
  /** The return: the door pulled to. */
  "bli-shut": {
    bus: "sfx",
    render: (c, o, t) => {
      knock(c, o, t, 0.2);
      crash(c, o, t + 0.02, { seconds: 0.2, gain: 0.1, type: "lowpass", freq: 400, q: 0.8 });
    },
  },
};
