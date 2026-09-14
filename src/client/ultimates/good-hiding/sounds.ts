import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * A Good Hiding's sounds. Leather, timber, a body being struck, and one
 * sound that is this film's alone: **the swallow**, a blow's thud whose tail
 * is sucked back into it and stops dead, so the blow is heard to go in.
 *
 * No drum and no heartbeat (Red Ledger has those), no horn, no bell. The
 * motif is a tanner's mallet knocking on a low plucked string: G2, B♭2, G2,
 * then down to E♭2. Hit, hit, hit, kept.
 */

/** A fist on a bare chest: a dull low knock with a slap of leather over it. */
function thump(c: AudioContext, o: AudioNode, t: number, gain = 0.4) {
  hit(c, o, t, { type: "sine", from: 105, to: 52, gain, attack: 0.003, decay: 0.13 });
  crash(c, o, t, { seconds: 0.05, gain: gain * 0.5, freq: 520, q: 1.1 });
  crash(c, o, t + 0.004, { seconds: 0.03, gain: gain * 0.22, type: "highpass", freq: 2200, q: 0.5 });
}

/** One note of the motif: a mallet's wooden knock on a plucked low string. */
function knock(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.16, ring = 0.35) {
  hit(c, o, t, { type: "triangle", from: hz(midi) * 1.02, to: hz(midi), gain, attack: 0.002, decay: ring });
  hit(c, o, t, { type: "sine", from: hz(midi + 12), to: hz(midi + 12), gain: gain * 0.25, attack: 0.002, decay: ring * 0.5 });
  crash(c, o, t, { seconds: 0.04, gain: gain * 0.9, freq: 900, q: 3 });
  hit(c, o, t, { type: "square", from: 420, to: 300, gain: gain * 0.08, attack: 0.001, decay: 0.03 });
}

/** A pole creaking under a hide's weight. */
function creak(c: AudioContext, o: AudioNode, t: number, gain = 0.05, seconds = 0.3) {
  for (let i = 0; i < 5; i++)
    crash(c, o, t + i * (seconds / 5) + (i % 2) * 0.01, { seconds: 0.05, gain: gain * (0.7 + (i % 3) * 0.2), freq: 380 + i * 30, q: 9 });
}

export const voices: Record<string, Voice> = {
  /** The call: two blows of the fist on the chest. */
  "hiding-thump": {
    bus: "sfx",
    render: (c, o, t) => {
      thump(c, o, t + 0.12, 0.42);
      thump(c, o, t + 0.37, 0.5);
    },
  },
  /** The dare: one more blow, and the leather creak of the arms opening. */
  "hiding-dare": {
    bus: "sfx",
    render: (c, o, t) => {
      thump(c, o, t + 0.15, 0.52);
      crash(c, o, t + 0.16, { seconds: 0.35, gain: 0.05, type: "lowpass", freq: 600, sweepTo: 200, q: 0.5 });
      creak(c, o, t + 0.36, 0.04, 0.26);
    },
  },
  /** The motif: hit, hit, hit, kept. */
  "hiding-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      knock(c, o, t, 43, 0.21, 0.3);
      knock(c, o, t + 0.22, 46, 0.21, 0.3);
      knock(c, o, t + 0.44, 43, 0.22, 0.3);
      knock(c, o, t + 0.7, 39, 0.26, 0.7);
      swell(c, o, t + 0.7, { type: "sawtooth", freq: hz(39), gain: 0.03, attack: 0.05, hold: 0.2, release: 0.4, cutoff: 380 });
    },
  },
  /** The enemy's blow coming in. */
  "hiding-whoosh": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.26, gain: 0.5, freq: 500, sweepTo: 1600, q: 1.1 });
    },
  },
  /**
   * The swallow. A heavy thud into a body, and instead of ringing out, its
   * tail is drawn back into it — a reversed swell of the same body that
   * stops dead — and then nothing.
   */
  "hiding-swallow": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 130, to: 38, gain: 0.58, attack: 0.002, decay: 0.2 });
      crash(c, o, t, { seconds: 0.07, gain: 0.5, type: "lowpass", freq: 900, q: 0.7 });
      crash(c, o, t + 0.002, { seconds: 0.03, gain: 0.3, freq: 1400, q: 1.2 });
      // Reversed: the body swells back up into the point and is cut.
      swell(c, o, t + 0.05, { type: "sawtooth", freq: 55, gain: 0.08, attack: 0.24, hold: 0.0, release: 0.012, cutoff: 260 });
      crash(c, o, t + 0.05, { seconds: 0.25, gain: 0.1, type: "lowpass", freq: 200, sweepTo: 900, q: 0.8 });
    },
  },
  /** The quiet: the poles settling, and one long breath out through the nose. */
  "hiding-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      creak(c, o, t + 0.02, 0.06, 0.34);
      crash(c, o, t + 0.12, { seconds: 0.44, gain: 0.09, type: "bandpass", freq: 700, sweepTo: 420, q: 0.7 });
    },
  },
  /**
   * The hiding, in layers: a crack (transient), a sub that falls away, a wet
   * leather thwack and the cleaver's thock (body), and the loft's rumble with
   * every hide rattling on its pole (tail).
   */
  "hiding-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.8, type: "highpass", freq: 2400, q: 0.6 });
      hit(c, o, t, { type: "sine", from: 125, to: 28, gain: 0.8, attack: 0.002, decay: 0.75 });
      crash(c, o, t + 0.003, { seconds: 0.12, gain: 0.55, freq: 330, sweepTo: 150, q: 1.4 });
      hit(c, o, t + 0.004, { type: "triangle", from: 240, to: 85, gain: 0.4, decay: 0.15 });
      thump(c, o, t + 0.006, 0.4);
      crash(c, o, t + 0.02, { seconds: 1.1, gain: 0.22, type: "lowpass", freq: 240, sweepTo: 45, q: 0.4 });
      for (let i = 0; i < 6; i++)
        crash(c, o, t + 0.08 + i * 0.055 + (i % 2) * 0.012, { seconds: 0.05, gain: 0.06 - i * 0.007, freq: 700 + (i % 3) * 180, q: 4 });
    },
  },
  /** On the board: the blade let down on the boards, and the motif's last two notes, soft. */
  "hiding-settle": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.1, gain: 0.26, freq: 1500, q: 3 });
      hit(c, o, t, { type: "sine", from: 150, to: 60, gain: 0.26, decay: 0.18 });
      knock(c, o, t + 0.22, 43, 0.07, 0.25);
      knock(c, o, t + 0.44, 39, 0.08, 0.6);
    },
  },
};
