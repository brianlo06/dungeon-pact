import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * The Small Print's sounds. Paper, card, a nib and a pocket watch — nothing
 * metal struck, no coin, no bell, no horn, no voice, no storm — and one sound
 * only this film has: the crease, a stiff sheet snapped taut and folded in one
 * movement, a dry crack with a card-stock thock under it.
 *
 * The motif is plucked strings with a nib's click on each attack, and it is
 * original: F4, A4, C5 rising — covered, covered, covered — then a B4 that
 * does not resolve. The sly one.
 */

/** A plucked string: a nib click, a bright pluck that dies fast, a body under it. */
function pluck(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.1, ring = 0.5) {
  const f = hz(midi);
  // The nib: a tone, not noise, so the click is the same every time.
  hit(c, o, t, { type: "square", from: 5200, to: 3800, gain: gain * 0.12, attack: 0.001, decay: 0.012 });
  hit(c, o, t, { type: "triangle", from: f * 1.004, to: f, gain, attack: 0.002, decay: ring });
  hit(c, o, t, { type: "sine", from: f * 2, gain: gain * 0.35, attack: 0.002, decay: ring * 0.4 });
  hit(c, o, t + 0.003, { type: "sine", from: f / 2, gain: gain * 0.4, attack: 0.004, decay: ring * 0.7 });
}

/** One leaf of card turning over: a soft flap of air with a tick of the edge. */
function flap(c: AudioContext, o: AudioNode, t: number, gain = 0.1, bright = 1) {
  crash(c, o, t, { seconds: 0.06, gain, freq: 1400 * bright, sweepTo: 700 * bright, q: 0.9 });
  // The edge landing: a tone, so a run of flaps never spikes.
  hit(c, o, t + 0.035, { type: "triangle", from: 2600, to: 1500, gain: gain * 0.35, attack: 0.001, decay: 0.014 });
}

/** The crease: a crack of paper pulled taut, and a stiff card folding under it. */
function crease(c: AudioContext, o: AudioNode, t: number, gain = 1) {
  crash(c, o, t, { seconds: 0.028, gain: 0.8 * gain, type: "highpass", freq: 2600, q: 0.6 });
  crash(c, o, t + 0.004, { seconds: 0.07, gain: 0.5 * gain, freq: 3200, sweepTo: 1200, q: 2.4 });
  crash(c, o, t + 0.012, { seconds: 0.11, gain: 0.35 * gain, freq: 520, sweepTo: 240, q: 1.6 });
  hit(c, o, t + 0.01, { type: "triangle", from: 180, to: 90, gain: 0.3 * gain, attack: 0.002, decay: 0.12 });
}

/** A pocket watch tick. */
function tick(c: AudioContext, o: AudioNode, t: number, gain = 0.12) {
  hit(c, o, t, { type: "square", from: 4400, to: 2900, gain: gain * 0.5, attack: 0.001, decay: 0.01 });
  hit(c, o, t + 0.002, { type: "sine", from: 3100, gain: gain * 0.4, attack: 0.001, decay: 0.025 });
}

export const voices: Record<string, Voice> = {
  /** The policy drawn out of the coat, and a fold flicked open. */
  "print-rustle": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.22, gain: 0.12, freq: 2400, sweepTo: 1200, q: 0.7 });
      flap(c, o, t + 0.2, 0.16, 1.2);
      crash(c, o, t + 0.24, { seconds: 0.016, gain: 0.25, type: "highpass", freq: 5000, q: 0.7 });
    },
  },
  /** A thumb riffling down a thick fan-fold: flaps, faster and faster. */
  "print-riffle": {
    bus: "sfx",
    render: (c, o, t) => {
      let at = 0.04;
      for (let i = 0; i < 11; i++) {
        flap(c, o, t + at, 0.06 + i * 0.008, 1 + i * 0.05);
        at += Math.max(0.018, 0.07 * (1 - i / 11) ** 1.4);
      }
    },
  },
  /** A sheet turning over the lens: a long swish of air through paper. */
  "print-turn": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.26, gain: 0.22, freq: 700, sweepTo: 2600, q: 0.8 });
      crash(c, o, t + 0.2, { seconds: 0.02, gain: 0.2, type: "highpass", freq: 4200, q: 0.7 });
    },
  },
  /** The policy running out behind the party, leaf after leaf. */
  "print-unfold": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 12; i++) flap(c, o, t + i * 0.045, 0.11 + (i % 3) * 0.02, 0.9 + (i % 4) * 0.08);
    },
  },
  /** The motif: F4, A4, C5 — covered, covered, covered — and a B4 that will not resolve. */
  "print-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      pluck(c, o, t, 65, 0.1, 0.45);
      pluck(c, o, t + 0.14, 69, 0.1, 0.45);
      pluck(c, o, t + 0.28, 72, 0.11, 0.55);
      pluck(c, o, t + 0.5, 71, 0.1, 1.1);
      swell(c, o, t + 0.5, { type: "triangle", freq: hz(47), gain: 0.04, attack: 0.05, hold: 0.25, release: 0.5, cutoff: 800 });
    },
  },
  /** The quiet: the watch on its chain, four ticks, and a breath through the nose. */
  "print-tick": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 4; i++) tick(c, o, t + i * 0.13, 0.13 - i * 0.015);
      crash(c, o, t + 0.36, { seconds: 0.18, gain: 0.05, freq: 900, sweepTo: 500, q: 1.4 });
    },
  },
  /** The same, for FAST's shorter quiet. */
  "print-tick-fast": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 3; i++) tick(c, o, t + i * 0.1, 0.13 - i * 0.02);
      crash(c, o, t + 0.24, { seconds: 0.12, gain: 0.045, freq: 900, sweepTo: 500, q: 1.4 });
    },
  },
  /**
   * The impact, in layers: the crease (transient), a sub that drops away, the
   * screens slapping upright one after another (body), and the paper settling
   * under a carbon chord (tail).
   */
  "print-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crease(c, o, t, 1.15);
      hit(c, o, t, { type: "sine", from: 120, to: 28, gain: 1, attack: 0.002, decay: 0.75 });
      for (let i = 0; i < 4; i++) {
        const at = t + 0.02 + i * 0.035;
        crash(c, o, at, { seconds: 0.09, gain: 0.42 - i * 0.05, type: "lowpass", freq: 900, sweepTo: 260, q: 0.8 });
        hit(c, o, at, { type: "triangle", from: 150 - i * 12, to: 70, gain: 0.3 - i * 0.04, attack: 0.002, decay: 0.16 });
      }
      crash(c, o, t + 0.05, { seconds: 0.9, gain: 0.07, freq: 2200, sweepTo: 900, q: 0.6 });
      for (const [m, g] of [
        [53, 0.05],
        [60, 0.04],
        [65, 0.035],
        [69, 0.03],
      ] as const)
        swell(c, o, t + 0.04, { type: "triangle", freq: hz(m), gain: g, attack: 0.02, hold: 0.25, release: 0.8, cutoff: 1800 });
      crash(c, o, t + 0.01, { seconds: 0.9, gain: 0.22, type: "lowpass", freq: 240, sweepTo: 50, q: 0.4 });
    },
  },
  /** On the board: a card screen standing up at each of the party, climbing. */
  "print-stand": {
    bus: "sfx",
    render: (c, o, t) => {
      [65, 69, 72, 77].forEach((m, i) => {
        const at = t + i * 0.07;
        crash(c, o, at, { seconds: 0.05, gain: 0.14, type: "lowpass", freq: 1100, sweepTo: 400, q: 0.8 });
        pluck(c, o, at + 0.01, m, 0.07, 0.35);
      });
    },
  },
};
