import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Command Performance: sounds.
 *
 * A puppet theatre after hours: everything in it is wood and string. No glass
 * or music box (the Hall of Mirrors'), no pin or drone (the Open Mind's), no
 * wings or whistle (Eyespot's). The family is hollow wood (the crossbar, the
 * puppet's feet, the boards), taut gut (the strings biting and yanked), and a
 * wooden bar instrument for the motif. The signature is the yank: a gut string
 * snapped taut, its pitch jumping, with the crossbar's clack on it.
 */

/** A seeded jitter, so a scatter of ticks is the same on every render. */
function jitter(seed: number) {
  let r = seed * 9301 + 49297;
  return () => ((r = (r * 9301 + 49297) % 233280) / 233280);
}

/** A hollow wooden knock: a short falling triangle, a bar overtone and a click. */
function wood(c: AudioContext, o: AudioNode, t: number, freq: number, gain: number, decay = 0.09) {
  hit(c, o, t, { type: "triangle", from: freq * 1.45, to: freq, gain, attack: 0.002, decay });
  hit(c, o, t, { type: "sine", from: freq * 2.76, gain: gain * 0.35, attack: 0.002, decay: decay * 0.6 });
  crash(c, o, t, { seconds: 0.018, gain: gain * 0.9, type: "bandpass", freq: freq * 3.2, q: 2.5 });
}

/** A note on a wooden bar: the fundamental, the bar's bright fourth harmonic, and the mallet. */
function bar(c: AudioContext, o: AudioNode, t: number, midi: number, gain: number, decay: number) {
  const f = hz(midi);
  hit(c, o, t, { type: "sine", from: f, gain, attack: 0.003, decay });
  hit(c, o, t, { type: "sine", from: f * 4, gain: gain * 0.22, attack: 0.002, decay: decay * 0.25 });
  hit(c, o, t, { type: "triangle", from: f * 2, gain: gain * 0.12, attack: 0.002, decay: decay * 0.4 });
  crash(c, o, t, { seconds: 0.02, gain: gain * 0.6, type: "bandpass", freq: 2600, q: 2 });
}

/** A plucked gut string: bright, bending, dying fast. */
function gut(c: AudioContext, o: AudioNode, t: number, from: number, to: number, gain: number, decay = 0.22) {
  hit(c, o, t, { type: "sawtooth", from, to, gain: gain * 0.45, attack: 0.002, decay: decay * 0.5 });
  hit(c, o, t, { type: "triangle", from, to, gain, attack: 0.002, decay });
  crash(c, o, t, { seconds: 0.012, gain: gain * 0.7, type: "highpass", freq: 3000, q: 0.7 });
}

/** Wood under strain: a run of dry friction ticks, slowing. */
function creak(c: AudioContext, o: AudioNode, t: number, seconds: number, gain: number, seed = 1) {
  const rand = jitter(seed);
  const count = Math.round(seconds * 40);
  for (let i = 0; i < count; i++) {
    const k = i / count;
    const at = t + seconds * (k * k * 0.6 + k * 0.4) + rand() * 0.006;
    crash(c, o, at, { seconds: 0.012 + rand() * 0.01, gain: gain * (0.5 + rand() * 0.6), type: "bandpass", freq: 380 + rand() * 360, q: 5 });
  }
  hit(c, o, t, { type: "sine", from: 150, to: 120, gain: gain * 0.1, attack: seconds * 0.4, decay: seconds });
}

export const voices: Record<string, Voice> = {
  /** The call: two clacks of the crossbar lifted, and three strings running down out of the dark. */
  "perf-call": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sine", freq: hz(38), gain: 0.3, attack: 0.12, hold: 0.2, release: 0.6, cutoff: 400 });
      wood(c, o, t, 820, 0.34);
      wood(c, o, t + 0.09, 700, 0.3);
      for (let i = 0; i < 3; i++)
        hit(c, o, t + 0.12 + i * 0.035, { type: "sine", from: 2600 - i * 200, to: 600, gain: 0.05, attack: 0.01, decay: 0.26 });
      crash(c, o, t + 0.12, { seconds: 0.3, gain: 0.05, type: "bandpass", freq: 3200, sweepTo: 900, q: 3 });
    },
  },
  /** The snip: the shard's edge along the strings, the cut, the twang of the ends, and the doll landing far below. */
  "perf-snip": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.2, gain: 0.05, type: "bandpass", freq: 3200, sweepTo: 6400, q: 4 });
      crash(c, o, t + 0.22, { seconds: 0.014, gain: 0.34, type: "highpass", freq: 4500, q: 0.8 });
      crash(c, o, t + 0.238, { seconds: 0.01, gain: 0.22, type: "highpass", freq: 6000, q: 0.8 });
      hit(c, o, t + 0.222, { type: "sine", from: 5200, to: 4700, gain: 0.05, attack: 0.002, decay: 0.12 });
      gut(c, o, t + 0.23, 1250, 620, 0.1, 0.34);
      gut(c, o, t + 0.24, 1660, 900, 0.06, 0.26);
      wood(c, o, t + 0.5, 1300, 0.05, 0.05);
      wood(c, o, t + 0.56, 1050, 0.035, 0.05);
      wood(c, o, t + 0.6, 1480, 0.02, 0.04);
    },
  },
  /**
   * The Puppeteer's motif, on a wooden bar: D4, up to A4, down to F4, and
   * then a leap to C♯5, held and never resolved, under a plucked low D. A
   * marionette's walk whose last step lands where it was always going to.
   */
  "perf-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes: [number, number, number, number][] = [
        [0, 62, 0.22, 0.34],
        [0.15, 69, 0.2, 0.3],
        [0.37, 65, 0.2, 0.34],
        [0.52, 73, 0.22, 1.1],
      ];
      for (const [at, midi, gain, decay] of notes) bar(c, o, t + at, midi, gain, decay);
      gut(c, o, t, hz(38), hz(38) * 0.995, 0.12, 0.5);
      gut(c, o, t + 0.52, hz(37), hz(37) * 0.995, 0.1, 0.8);
    },
  },
  /** The strings biting: three short taut plucks rising, each with a tick of the hook. */
  "perf-hook": {
    bus: "sfx",
    render: (c, o, t) => {
      [76, 79, 83].forEach((midi, i) => {
        gut(c, o, t + i * 0.05, hz(midi) * 0.96, hz(midi), 0.09, 0.16);
        crash(c, o, t + i * 0.05, { seconds: 0.01, gain: 0.12, type: "bandpass", freq: 4200, q: 3 });
      });
    },
  },
  /** Marionette steps: hollow wooden feet set down on the boards, and the joints creaking between. */
  "perf-walk": {
    bus: "sfx",
    render: (c, o, t) => {
      [0.17, 0.34, 0.51].forEach((at, i) => {
        wood(c, o, t + at, 300 + i * 30, 0.32, 0.12);
        wood(c, o, t + at + 0.022, 520 + i * 20, 0.12, 0.05);
      });
      creak(c, o, t + 0.02, 0.14, 0.05, 3);
      creak(c, o, t + 0.2, 0.12, 0.04, 5);
    },
  },
  /** The quiet: the strings holding a weight. One slow creak, a faint beat of two taut tones, a knuckle on the bar. */
  "perf-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 196, gain: 0.02, attack: 0.18, decay: 0.55 });
      hit(c, o, t, { type: "sine", from: 197.6, gain: 0.016, attack: 0.2, decay: 0.55 });
      creak(c, o, t + 0.08, 0.34, 0.035, 9);
      wood(c, o, t + 0.46, 980, 0.04, 0.04);
    },
  },
  /** The signature: a gut string snapped taut, its pitch leaping, and the crossbar's clack on it. */
  "perf-yank": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sawtooth", from: 95, to: 420, gain: 0.2, attack: 0.002, decay: 0.16 });
      hit(c, o, t, { type: "triangle", from: 190, to: 840, gain: 0.26, attack: 0.002, decay: 0.12 });
      crash(c, o, t, { seconds: 0.1, gain: 0.25, type: "bandpass", freq: 700, sweepTo: 3200, q: 2 });
      wood(c, o, t + 0.004, 1100, 0.34, 0.07);
    },
  },
  /**
   * The impact, in layers: a dry crack of wood (transient); a sub drop; the
   * body, splintering, a scatter of tiny crackles over a torn noise band; and
   * the tail, a lowpassed room with two strings left ringing a semitone
   * apart.
   */
  "perf-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.022, gain: 0.75, type: "highpass", freq: 2600, q: 0.6 });
      wood(c, o, t, 520, 0.5, 0.08);
      hit(c, o, t, { type: "sine", from: 130, to: 30, gain: 0.9, attack: 0.002, decay: 0.8 });
      hit(c, o, t, { type: "triangle", from: 240, to: 70, gain: 0.24, attack: 0.002, decay: 0.26 });
      crash(c, o, t + 0.004, { seconds: 0.4, gain: 0.42, type: "bandpass", freq: 1400, sweepTo: 320, q: 0.9 });
      const rand = jitter(21);
      for (let i = 0; i < 14; i++) {
        const at = t + 0.01 + Math.pow(i / 14, 1.4) * 0.34;
        crash(c, o, at, { seconds: 0.012 + rand() * 0.012, gain: 0.3 * (1 - i / 16), type: "bandpass", freq: 1600 + rand() * 3600, q: 2.2 });
      }
      crash(c, o, t + 0.02, { seconds: 1.1, gain: 0.24, type: "lowpass", freq: 280, sweepTo: 50, q: 0.4 });
      hit(c, o, t + 0.05, { type: "sine", from: hz(62), gain: 0.035, attack: 0.01, decay: 1.2 });
      hit(c, o, t + 0.05, { type: "sine", from: hz(63), gain: 0.028, attack: 0.01, decay: 1.1 });
    },
  },
  /** The swing going on through the rest: two heavy knocks, and splinters. */
  "perf-knock": {
    bus: "sfx",
    render: (c, o, t) => {
      [0, 0.12].forEach((at, i) => {
        wood(c, o, t + at, 360 - i * 40, 0.36, 0.1);
        hit(c, o, t + at, { type: "sine", from: 110, to: 45, gain: 0.3, attack: 0.002, decay: 0.2 });
        crash(c, o, t + at + 0.004, { seconds: 0.12, gain: 0.16, type: "bandpass", freq: 2400, sweepTo: 900, q: 1.5 });
      });
    },
  },
  /** The drop curtain falling: a rush of heavy cloth and its hem landing. */
  "perf-drape": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.22, gain: 0.12, type: "lowpass", freq: 900, sweepTo: 300, q: 0.5 });
      hit(c, o, t + 0.12, { type: "sine", from: 90, to: 50, gain: 0.25, attack: 0.004, decay: 0.2 });
      crash(c, o, t + 0.12, { seconds: 0.08, gain: 0.1, type: "lowpass", freq: 500, q: 0.6 });
    },
  },
  /** The curtain hauled up: its wooden rings rattling along the rod, and the cloth. */
  "perf-rise": {
    bus: "sfx",
    render: (c, o, t) => {
      const rand = jitter(7);
      for (let i = 0; i < 7; i++) wood(c, o, t + i * 0.035 + rand() * 0.01, 1700 + rand() * 700, 0.05, 0.035);
      crash(c, o, t, { seconds: 0.36, gain: 0.08, type: "bandpass", freq: 400, sweepTo: 1100, q: 0.6 });
    },
  },
  /** Release: the motif's last two notes, softer and slower, and one clack of the bar. */
  "perf-after": {
    bus: "sfx",
    render: (c, o, t) => {
      bar(c, o, t, 65, 0.1, 0.4);
      bar(c, o, t + 0.28, 73, 0.11, 1.0);
      wood(c, o, t + 0.6, 800, 0.06, 0.05);
    },
  },
};
