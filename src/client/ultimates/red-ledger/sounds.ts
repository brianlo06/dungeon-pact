import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Red Ledger's sounds. Skin, cloth, sand, one heart and a heavy blade —
 * nothing bright, nothing ringing for long, no brass and no storm — and the
 * one sound that is this film's alone: the entry, a fist dragged across skin
 * over a single heartbeat.
 *
 * The motif is a tuned war-drum under a bowed low string: D3, F3, then a
 * fall to C♯3 with a D2 thump under it. Pay, pay, collect.
 */

/** One heartbeat: the lub and the dub, felt more than heard. */
function beat(c: AudioContext, o: AudioNode, t: number, gain = 0.5) {
  hit(c, o, t, { type: "sine", from: 70, to: 38, gain, attack: 0.006, decay: 0.16 });
  hit(c, o, t + 0.17, { type: "sine", from: 58, to: 34, gain: gain * 0.7, attack: 0.006, decay: 0.2 });
  crash(c, o, t, { seconds: 0.06, gain: gain * 0.08, type: "lowpass", freq: 240, q: 0.7 });
}

/** A tuned drum under a bowed string: struck, then drawn out. */
function drum(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.2, hold = 0.2) {
  hit(c, o, t, { type: "sine", from: hz(midi) * 1.6, to: hz(midi), gain, attack: 0.003, decay: 0.34 });
  crash(c, o, t, { seconds: 0.05, gain: gain * 0.5, type: "lowpass", freq: 700, q: 0.8 });
  swell(c, o, t + 0.01, { type: "sawtooth", freq: hz(midi), gain: gain * 0.28, attack: 0.07, hold, release: 0.35, cutoff: 520, detune: -6 });
  swell(c, o, t + 0.01, { type: "sawtooth", freq: hz(midi), gain: gain * 0.2, attack: 0.09, hold, release: 0.35, cutoff: 480, detune: 7 });
}

export const voices: Record<string, Voice> = {
  /** The call: the dragged blade scraping up off the floor. */
  "ledger-scrape": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.34, gain: 0.42, freq: 1500, sweepTo: 3200, q: 4 });
      crash(c, o, t + 0.02, { seconds: 0.3, gain: 0.26, type: "lowpass", freq: 500, sweepTo: 200, q: 0.6 });
      hit(c, o, t + 0.3, { type: "triangle", from: 190, to: 150, gain: 0.07, decay: 0.3 });
    },
  },
  /** The clench: a bandage creaking tight, and the heart under it. */
  "ledger-clench": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 6; i++)
        crash(c, o, t + i * 0.05 + (i % 2) * 0.012, { seconds: 0.04, gain: 0.05 + i * 0.008, freq: 520 + i * 40, q: 7 });
      beat(c, o, t + 0.12, 0.45);
    },
  },
  /** The entry: a coarse rasp of a fist across skin, over one heartbeat. */
  "ledger-entry": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.26, gain: 0.3, freq: 900, sweepTo: 360, q: 1.6 });
      crash(c, o, t + 0.01, { seconds: 0.22, gain: 0.12, type: "highpass", freq: 2400, q: 0.5 });
      hit(c, o, t, { type: "sawtooth", from: 96, to: 70, gain: 0.05, attack: 0.02, decay: 0.24 });
      beat(c, o, t + 0.05, 0.55);
    },
  },
  /** Across the pit: the blade dragged through sand, and heavy feet. */
  "ledger-drag": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.9, gain: 0.08, freq: 1100, sweepTo: 700, q: 2.5 });
      for (const dt of [0.05, 0.42, 0.78]) {
        hit(c, o, t + dt, { type: "sine", from: 110, to: 50, gain: 0.26, decay: 0.16 });
        crash(c, o, t + dt, { seconds: 0.08, gain: 0.08, type: "lowpass", freq: 900, q: 0.6 });
      }
    },
  },
  /** The motif: pay, pay, collect. */
  "ledger-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      drum(c, o, t, 50, 0.2, 0.12);
      drum(c, o, t + 0.24, 53, 0.2, 0.12);
      drum(c, o, t + 0.52, 49, 0.24, 0.42);
      hit(c, o, t + 0.52, { type: "sine", from: hz(38) * 1.8, to: hz(38), gain: 0.4, attack: 0.004, decay: 0.6 });
    },
  },
  /** The quiet: one slow heartbeat, and then nothing. */
  "ledger-heart": {
    bus: "sfx",
    render: (c, o, t) => {
      beat(c, o, t, 0.36);
      swell(c, o, t, { type: "sine", freq: 41, gain: 0.02, attack: 0.1, hold: 0.1, release: 0.3 });
    },
  },
  /** A single drop leaving the fist, in the silence. */
  "ledger-drop": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 1400, to: 700, gain: 0.05, attack: 0.002, decay: 0.07 });
      crash(c, o, t, { seconds: 0.03, gain: 0.05, freq: 2200, q: 6 });
    },
  },
  /**
   * The collection, in layers: a dry chop (transient), a sub that falls away,
   * the cleaver's heavy body going into something (thock) with the notched
   * blade ringing short, and the room after it.
   */
  "ledger-cut": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.035, gain: 0.8, type: "highpass", freq: 2600, q: 0.6 });
      hit(c, o, t, { type: "sine", from: 120, to: 26, gain: 0.78, attack: 0.002, decay: 0.8 });
      hit(c, o, t + 0.004, { type: "triangle", from: 260, to: 90, gain: 0.42, decay: 0.16 });
      crash(c, o, t + 0.004, { seconds: 0.2, gain: 0.5, freq: 420, sweepTo: 140, q: 1.8 });
      hit(c, o, t + 0.01, { type: "square", from: 587, to: 560, gain: 0.03, decay: 0.34 });
      hit(c, o, t + 0.01, { type: "sine", from: 1240, to: 1190, gain: 0.05, decay: 0.3 });
      crash(c, o, t + 0.02, { seconds: 1.2, gain: 0.24, type: "lowpass", freq: 260, sweepTo: 50, q: 0.4 });
    },
  },
  /** The copies entered on the row: short, heavy stamps, closing up. */
  "ledger-stamps": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, dt] of [0, 0.07, 0.13].entries()) {
        hit(c, o, t + dt, { type: "sine", from: 150 - i * 12, to: 44, gain: 0.34, attack: 0.002, decay: 0.18 });
        crash(c, o, t + dt, { seconds: 0.05, gain: 0.26, freq: 1300 - i * 150, q: 1.4 });
      }
    },
  },
  /** On the board: the blade let back down onto the floor, and the motif, low. */
  "ledger-settle": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.12, gain: 0.3, freq: 1700, q: 3 });
      hit(c, o, t, { type: "sine", from: 140, to: 60, gain: 0.3, decay: 0.2 });
      drum(c, o, t + 0.18, 50, 0.08, 0.1);
      drum(c, o, t + 0.36, 49, 0.09, 0.3);
    },
  },
};
