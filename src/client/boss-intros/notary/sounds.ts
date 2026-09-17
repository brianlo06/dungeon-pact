import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * The Notary's entrance, in sound: a quiet room made loud. A desk bell, a
 * match, candle flames, wax dropping, and the press — a heavy brass matrix
 * coming down on wax on wood, a dull, final, *wet* thump, nothing that rings
 * like the Collector's iron or the Broker's gold.
 *
 * The motif is an attestation, three even notes and a cadence: A, A, A, then
 * D below — "so witnessed".
 */

/** A small brass desk bell. */
function desk(c: AudioContext, o: AudioNode, t: number, gain = 0.08) {
  hit(c, o, t, { type: "sine", from: 2350, gain, attack: 0.002, decay: 0.9 });
  hit(c, o, t, { type: "sine", from: 2350 * 2.71, gain: gain * 0.25, attack: 0.002, decay: 0.3 });
  crash(c, o, t, { seconds: 0.01, gain: gain * 1.5, freq: 5000, q: 6 });
}

/** A candle catching: a soft breathy puff. */
function catchFlame(c: AudioContext, o: AudioNode, t: number, gain = 0.06) {
  crash(c, o, t, { seconds: 0.18, gain, type: "bandpass", freq: 900, q: 0.6, sweepTo: 2200 });
}

/** A low choir-ish tone, bowed, for the witnessing. */
function drone(c: AudioContext, o: AudioNode, t: number, midi: number, seconds: number, gain = 0.05) {
  swell(c, o, t, { type: "sawtooth", freq: hz(midi), gain, attack: seconds * 0.3, hold: seconds * 0.4, release: seconds * 0.3, cutoff: 700 });
  swell(c, o, t, { type: "triangle", freq: hz(midi + 7), gain: gain * 0.6, attack: seconds * 0.35, hold: seconds * 0.35, release: seconds * 0.3, cutoff: 900 });
}

export const voices: Record<string, Voice> = {
  /** On the board: the desk bell, and a witness candle lit over every hero. */
  "nti-bell": {
    bus: "sfx",
    render: (c, o, t) => {
      desk(c, o, t, 0.35);
      for (let i = 0; i < 4; i++) catchFlame(c, o, t + 0.12 + i * 0.07, 0.2);
    },
  },
  /** The Sealing Room: a vast quiet, paper settling, the drone of it. */
  "nti-room": {
    bus: "sfx",
    render: (c, o, t) => {
      drone(c, o, t, 38, 1.1, 0.05);
      for (let i = 0; i < 5; i++) crash(c, o, t + 0.1 + i * 0.19, { seconds: 0.08, gain: 0.03, freq: 3000, q: 0.8 });
    },
  },
  /** One drop of wax, forming, falling, and landing on paper. */
  "nti-drop": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 420, to: 180, gain: 0.08, decay: 0.08 });
      crash(c, o, t, { seconds: 0.05, gain: 0.08, type: "lowpass", freq: 900, q: 1 });
    },
  },
  /** The Notary drawn up: robes, a long breath, candles flaring. */
  "nti-rise": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.5, gain: 0.18, freq: 1200, q: 0.5, sweepTo: 2600 });
      drone(c, o, t, 33, 0.9, 0.08);
      catchFlame(c, o, t + 0.45, 0.15);
    },
  },
  /**
   * The press: brass on wax on wood — a dull slap (transient), a sub
   * (weight), wax squeezed out (body), and the desk bell ringing on its own
   * from the blow.
   */
  "nti-press": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.07, gain: 0.9, type: "lowpass", freq: 700, q: 0.8 });
      hit(c, o, t, { type: "sine", from: 80, to: 30, gain: 1.1, attack: 0.002, decay: 0.7 });
      crash(c, o, t + 0.02, { seconds: 0.3, gain: 0.4, type: "bandpass", freq: 500, q: 1.2, sweepTo: 220 });
      desk(c, o, t + 0.05, 0.12);
      drone(c, o, t + 0.05, 26, 1.2, 0.1);
    },
  },
  /** Three seals standing up out of the wax, their fuses counting down, and enforced. */
  "nti-seals": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 3; i++) crash(c, o, t + i * 0.07, { seconds: 0.12, gain: 0.25, type: "lowpass", freq: 600, q: 1 });
      for (let i = 0; i < 3; i++) hit(c, o, t + 0.3 + i * 0.15, { type: "sine", from: hz(69 - i * 5), gain: 0.1, decay: 0.15 });
      crash(c, o, t + 0.78, { seconds: 0.25, gain: 0.4, freq: 1500, q: 0.8, sweepTo: 400 });
    },
  },
  /** The motif: so witnessed. A, A, A, then D below. */
  "nti-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 3; i++) desk(c, o, t + i * 0.16, 0.035);
      drone(c, o, t, 45, 0.5, 0.05);
      drone(c, o, t + 0.48, 38, 0.8, 0.08);
    },
  },
  /** The return: candles guttering. */
  "nti-gutter": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 3; i++) catchFlame(c, o, t + i * 0.08, 0.2);
    },
  },
};
