import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Hammer Price's sounds. Hardwood, lacquer, card and a small pipe organ —
 * no coin, no brass, no paper, no bell, no horn, no drum — and one sound that
 * belongs to this film alone: the rap, a hardwood sale hammer on its sound
 * block, a dry crack with a short hollow knock under it and no ring at all.
 *
 * The motif is an auctioneer's call played on a saleroom organ, and it is
 * original: three chords climbing a whole step at a time, C, D, E — going
 * once, going twice — and then, instead of the next step up, a low F under a
 * held pedal A: gone. Blown, with a chiff of air on every attack.
 */

/** The rap: a tone for the crack (noise this short peaks anywhere), a hollow block, a thump. */
function rap(c: AudioContext, o: AudioNode, t: number, gain = 0.3, big = 1) {
  hit(c, o, t, { type: "square", from: 3600 / big, to: 1400 / big, gain: gain * 0.35, attack: 0.001, decay: 0.012 });
  hit(c, o, t, { type: "triangle", from: 820 / big, to: 520 / big, gain: gain * 0.9, attack: 0.001, decay: 0.05 * big });
  hit(c, o, t + 0.002, { type: "sine", from: 460 / big, to: 300 / big, gain: gain * 0.6, attack: 0.002, decay: 0.07 * big });
  hit(c, o, t, { type: "sine", from: 150 / big, to: 70 / big, gain: gain * 0.5, attack: 0.002, decay: 0.09 * big });
}

/** One organ chord: stops at 8', 4' and a quint, with a chiff of air. */
function organ(c: AudioContext, o: AudioNode, t: number, notes: number[], gain = 0.03, hold = 0.12, release = 0.18) {
  crash(c, o, t, { seconds: 0.05, gain: gain * 0.8, freq: 2400, sweepTo: 1400, q: 1.8 });
  for (const midi of notes) {
    const f = hz(midi);
    swell(c, o, t, { type: "sine", freq: f, gain, attack: 0.02, hold, release, cutoff: 3000 });
    swell(c, o, t, { type: "sine", freq: f * 2, gain: gain * 0.45, attack: 0.018, hold, release: release * 0.8, cutoff: 4000 });
    swell(c, o, t, { type: "triangle", freq: f * 3, gain: gain * 0.16, attack: 0.02, hold: hold * 0.8, release: release * 0.6, cutoff: 5000 });
  }
}

/** A paddle slapped down against a chair back: card and wood, a tone for the edge. */
function slap(c: AudioContext, o: AudioNode, t: number, gain = 0.05, pitch = 1) {
  crash(c, o, t, { seconds: 0.04, gain: gain * 0.7, freq: 1100 * pitch, sweepTo: 600 * pitch, q: 1.1 });
  hit(c, o, t + 0.01, { type: "triangle", from: 540 * pitch, to: 300 * pitch, gain: gain * 0.6, attack: 0.001, decay: 0.03 });
}

export const voices: Record<string, Voice> = {
  /** The call: one rap, the room called to order. */
  "hammer-rap": { bus: "sfx", render: (c, o, t) => rap(c, o, t, 0.34) },

  /** The nod: a low wooden tock, and the murmur of the room cut off under it. */
  "hammer-nod": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.26, gain: 0.05, freq: 520, sweepTo: 360, q: 0.6 });
      hit(c, o, t + 0.24, { type: "triangle", from: 240, to: 180, gain: 0.16, attack: 0.002, decay: 0.09 });
      hit(c, o, t + 0.24, { type: "sine", from: 120, to: 80, gain: 0.14, attack: 0.003, decay: 0.12 });
    },
  },

  /** The motif: C, D, E — going once, going twice — and a low F under a pedal A: gone. */
  "hammer-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      organ(c, o, t, [60, 64, 67], 0.026, 0.1, 0.14);
      organ(c, o, t + 0.18, [62, 66, 69], 0.026, 0.1, 0.14);
      organ(c, o, t + 0.36, [64, 68, 71], 0.028, 0.12, 0.16);
      organ(c, o, t + 0.58, [53, 57, 60, 65], 0.03, 0.24, 0.5);
      swell(c, o, t + 0.58, { type: "sine", freq: hz(33), gain: 0.05, attack: 0.04, hold: 0.3, release: 0.5, cutoff: 400 });
    },
  },

  /** The room outbid: three waves of paddles going down, each a little further off. */
  "hammer-slaps": {
    bus: "sfx",
    render: (c, o, t) => {
      const waves = [0, 0.25, 0.5];
      waves.forEach((w, n) => {
        for (let i = 0; i < 9; i++) {
          const k = i / 9;
          slap(c, o, t + w + k * 0.12 + ((i * 37) % 7) * 0.003, 0.05 * (1 - n * 0.2) * (1 - k * 0.4), 1 - n * 0.12 + (i % 3) * 0.05);
        }
      });
    },
  },

  /** The same three waves, closer together, for the FAST cut's shorter room. */
  "hammer-slaps-fast": {
    bus: "sfx",
    render: (c, o, t) => {
      [0, 0.13, 0.26].forEach((w, n) => {
        for (let i = 0; i < 6; i++) slap(c, o, t + w + (i / 6) * 0.07, 0.05 * (1 - n * 0.2), 1 - n * 0.12 + (i % 3) * 0.05);
      });
    },
  },

  /** Going twice: the weight of the hammer taken up, a creak, and a low note swelling under it. */
  "hammer-hoist": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.18, gain: 0.08, freq: 900, sweepTo: 1300, q: 5 });
      swell(c, o, t + 0.04, { type: "sawtooth", freq: hz(41), gain: 0.04, attack: 0.3, hold: 0.12, release: 0.12, cutoff: 500 });
      swell(c, o, t + 0.04, { type: "sine", freq: hz(53), gain: 0.03, attack: 0.3, hold: 0.12, release: 0.1 });
    },
  },

  /** The quiet: a handle rattling in a grip that cannot hold it still. Very quiet. */
  "hammer-tremble": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 7; i++)
        hit(c, o, t + i * 0.035 + (i % 2) * 0.008, { type: "triangle", from: 1900 + (i % 3) * 140, to: 1300, gain: 0.018 * (1 - i / 9), attack: 0.001, decay: 0.012 });
    },
  },

  /** The hammer coming over: air torn downward. */
  "hammer-swing": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.12, gain: 0.26, freq: 600, sweepTo: 2200, q: 0.9 });
      hit(c, o, t, { type: "sine", from: 90, to: 50, gain: 0.12, attack: 0.03, decay: 0.1 });
    },
  },

  /**
   * Gone, in layers: the rap at the size of the room (transient), a sub
   * dropping away, the block itself — a big hollow boom with the split
   * running through it (body) — and the splinters coming down in a room that
   * has gone quiet (tail).
   */
  "hammer-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      rap(c, o, t, 0.62, 1.6);
      crash(c, o, t, { seconds: 0.04, gain: 0.5, type: "highpass", freq: 2600, q: 0.5 });
      hit(c, o, t, { type: "sine", from: 118, to: 26, gain: 0.9, attack: 0.002, decay: 0.8 });
      // The block: hollow, wooden, inharmonic, and splitting.
      hit(c, o, t + 0.004, { type: "triangle", from: 172, to: 150, gain: 0.34, attack: 0.002, decay: 0.42 });
      hit(c, o, t + 0.004, { type: "sine", from: 172 * 2.3, to: 172 * 2.1, gain: 0.16, attack: 0.002, decay: 0.28 });
      hit(c, o, t + 0.004, { type: "sine", from: 172 * 3.9, gain: 0.07, attack: 0.002, decay: 0.16 });
      crash(c, o, t + 0.03, { seconds: 0.16, gain: 0.3, freq: 1500, sweepTo: 420, q: 2.4 });
      for (let i = 0; i < 8; i++) slap(c, o, t + 0.16 + i * 0.05 + (i % 3) * 0.013, 0.06 * (1 - i / 10), 1.4 - i * 0.06);
      crash(c, o, t + 0.02, { seconds: 1, gain: 0.2, type: "lowpass", freq: 320, sweepTo: 50, q: 0.4 });
    },
  },

  /** On the board: paddles laid down, one after another, and the tail of the chord. */
  "hammer-down": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 4; i++) slap(c, o, t + i * 0.09, 0.06, 0.9 - i * 0.05);
      organ(c, o, t + 0.1, [41, 48, 53], 0.022, 0.2, 0.6);
    },
  },
};
