import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * The Open Mind: sounds.
 *
 * Close and cold, inside a head. No glass, no wood, no music box: those are
 * the Hall of Mirrors'. The Mindflayer's family is pressure and pitch. There
 * is a drone felt more than heard, thin sine tones that tune themselves onto
 * one frequency, and the pin: a click so high and short it is nearly a
 * pressure change, which every note of its motif starts on. When the thought
 * goes through, a cluster of tones that were nearly in tune bends apart.
 */

/** The pin: an ultrasonic-feeling click, a hair of noise and a tiny ping. */
function pin(c: AudioContext, o: AudioNode, t: number, gain: number) {
  crash(c, o, t, { seconds: 0.012, gain, type: "highpass", freq: 6500, q: 0.7 });
  hit(c, o, t, { type: "sine", from: 5200, to: 4700, gain: gain * 0.35, attack: 0.001, decay: 0.05 });
}

/** A struck sine with a faint fifth above it and a slow, uneasy vibrato of detune. */
function tone(c: AudioContext, o: AudioNode, t: number, midi: number, gain: number, decay: number) {
  hit(c, o, t, { type: "sine", from: hz(midi), to: hz(midi) * 0.996, gain, attack: 0.006, decay });
  hit(c, o, t + 0.004, { type: "sine", from: hz(midi) * 1.502, gain: gain * 0.18, attack: 0.01, decay: decay * 0.6 });
  hit(c, o, t, { type: "triangle", from: hz(midi - 12), gain: gain * 0.25, attack: 0.02, decay: decay * 0.8 });
}

export const voices: Record<string, Voice> = {
  /** The call: a low drone swells, and a thin tone slides down onto one pitch. */
  "mind-call": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sine", freq: 49, gain: 0.3, attack: 0.18, hold: 0.25, release: 0.7, cutoff: 400 });
      swell(c, o, t, { type: "triangle", freq: 98.6, gain: 0.05, attack: 0.2, hold: 0.2, release: 0.6, cutoff: 500 });
      hit(c, o, t + 0.02, { type: "sine", from: 2900, to: hz(91), gain: 0.06, attack: 0.05, decay: 0.34 });
      hit(c, o, t + 0.36, { type: "sine", from: hz(91), gain: 0.045, attack: 0.004, decay: 0.5 });
      pin(c, o, t + 0.36, 0.12);
      crash(c, o, t, { seconds: 0.45, gain: 0.05, type: "bandpass", freq: 700, sweepTo: 2400, q: 2 });
    },
  },
  /** The eye narrowing: a whistle falling in and closing to a single point. */
  "mind-pin": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 1500, to: 3400, gain: 0.05, attack: 0.1, decay: 0.26 });
      hit(c, o, t + 0.2, { type: "sine", from: 3400, gain: 0.04, attack: 0.004, decay: 0.34 });
      pin(c, o, t + 0.2, 0.14);
    },
  },
  /**
   * The Mindflayer's motif: G5, D5, E♭5, then A4 held. Each note starts on
   * the pin. A question that lands a tritone away from where it should.
   */
  "mind-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes: [number, number, number][] = [
        [0, 79, 0.34],
        [0.16, 74, 0.34],
        [0.32, 75, 0.4],
        [0.52, 69, 1.1],
      ];
      for (const [at, midi, decay] of notes) {
        pin(c, o, t + at, 0.07);
        tone(c, o, t + at, midi, 0.1, decay);
      }
      swell(c, o, t + 0.52, { type: "sine", freq: hz(45), gain: 0.07, attack: 0.12, hold: 0.3, release: 0.6, cutoff: 500 });
    },
  },
  /** Doubt taking the long way: soft ticks that hesitate and slow down. */
  "mind-doubt": {
    bus: "sfx",
    render: (c, o, t) => {
      let at = t;
      for (let i = 0; i < 6; i++) {
        crash(c, o, at, { seconds: 0.03, gain: 0.2 - i * 0.02, type: "bandpass", freq: 1500 - i * 90, q: 4 });
        hit(c, o, at, { type: "sine", from: 900 - i * 40, gain: 0.03, attack: 0.002, decay: 0.05 });
        at += 0.06 + i * 0.03 + (i % 2) * 0.02;
      }
    },
  },
  /** Straight through seven walls, faster each time, over a rising whine. */
  "mind-bore": {
    bus: "sfx",
    render: (c, o, t) => bore(c, o, t, 0.58),
  },
  "mind-bore-fast": {
    bus: "sfx",
    render: (c, o, t) => bore(c, o, t, 0.36),
  },
  /**
   * The quiet: a thin ringing that fades out, and under it two soft, low
   * pulses: somebody else's heartbeat, close.
   */
  "mind-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 5920, to: 5880, gain: 0.022, attack: 0.02, decay: 0.5 });
      for (const at of [0.08, 0.3]) {
        hit(c, o, t + at, { type: "sine", from: 70, to: 46, gain: 0.26, attack: 0.012, decay: 0.16 });
        crash(c, o, t + at, { seconds: 0.08, gain: 0.04, type: "lowpass", freq: 180, q: 0.5 });
      }
    },
  },
  /** The signature: the pin, drawn up into a whistle as the thought goes in. */
  "mind-spike": {
    bus: "sfx",
    render: (c, o, t) => {
      pin(c, o, t, 0.5);
      hit(c, o, t, { type: "sine", from: 1900, to: 6200, gain: 0.12, attack: 0.002, decay: 0.07 });
      hit(c, o, t + 0.003, { type: "square", from: 3100, to: 7400, gain: 0.02, attack: 0.002, decay: 0.05 });
    },
  },
  /**
   * Through, in layers: the pin's click (transient), a sub dropping out from
   * under it, a cluster of nearly-tuned tones bending apart (the body: a
   * thought coming undone), and a lowpassed room and a falling ring (tail).
   */
  "mind-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.025, gain: 0.85, type: "highpass", freq: 3800, q: 0.5 });
      hit(c, o, t, { type: "sine", from: 150, to: 27, gain: 1, attack: 0.002, decay: 0.9 });
      hit(c, o, t, { type: "triangle", from: 360, to: 90, gain: 0.3, attack: 0.002, decay: 0.3 });
      for (const [f, to, g] of [
        [466, 330, 0.11],
        [494, 311, 0.1],
        [698, 523, 0.07],
        [740, 466, 0.06],
        [988, 622, 0.04],
      ] as const)
        hit(c, o, t + 0.01, { type: "sine", from: f, to, gain: g, attack: 0.004, decay: 0.9 });
      crash(c, o, t + 0.005, { seconds: 0.4, gain: 0.22, type: "bandpass", freq: 1200, sweepTo: 300, q: 1.5 });
      crash(c, o, t + 0.02, { seconds: 1.3, gain: 0.28, type: "lowpass", freq: 320, sweepTo: 55, q: 0.4 });
      hit(c, o, t + 0.06, { type: "sine", from: 2600, to: 900, gain: 0.04, attack: 0.02, decay: 1.2 });
    },
  },
  /** The same thought through every other mind: quick, smaller pins, rising. */
  "mind-echo": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 3; i++) {
        pin(c, o, t + i * 0.07, 0.22 - i * 0.04);
        hit(c, o, t + i * 0.07, { type: "sine", from: 120 - i * 10, to: 40, gain: 0.3 - i * 0.07, attack: 0.002, decay: 0.3 });
        hit(c, o, t + i * 0.07, { type: "sine", from: hz(81 + i * 3), to: hz(76 + i * 3), gain: 0.04, attack: 0.004, decay: 0.3 });
      }
    },
  },
  /** Release: the motif's first two notes, slower and lower, and they fade. */
  "mind-after": {
    bus: "sfx",
    render: (c, o, t) => {
      pin(c, o, t, 0.05);
      tone(c, o, t, 67, 0.11, 0.6);
      pin(c, o, t + 0.28, 0.04);
      tone(c, o, t + 0.28, 62, 0.1, 1.1);
    },
  },
};

/**
 * Seven punches through a shot `span` seconds long, landing where the needle
 * meets each wall. The needle eases in (cubic) from outside the rim, so the
 * walls come at these shares of the shot, each sooner after the last, under
 * a whine that rises the whole way.
 */
const WALLS = [0.505, 0.646, 0.742, 0.818, 0.883, 0.939, 0.989];
function bore(c: AudioContext, o: AudioNode, t: number, span: number) {
  hit(c, o, t, { type: "sine", from: 500, to: 3600, gain: 0.05, attack: span * 0.9, decay: span + 0.04 });
  WALLS.forEach((k, i) => {
    const at = t + span * k;
    pin(c, o, at, 0.12 + i * 0.02);
    hit(c, o, at, { type: "sine", from: 180 + i * 30, to: 60, gain: 0.16 + i * 0.02, attack: 0.002, decay: 0.09 });
    crash(c, o, at, { seconds: 0.04, gain: 0.07, type: "bandpass", freq: 900 + i * 180, q: 3 });
  });
}
