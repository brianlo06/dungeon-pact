import { crash, hit, hz, swell, type Voice } from "../../audio/synth";
import { LOOSES } from "./poses";

/**
 * Sunblind's sounds. Heat, plaster and a rooftop wind chime — no gut string
 * plucked for a motif, no damped wood, no mud, no glass, no bells — and one
 * sound that is only this film's: the volley falling out of the sun, a soft
 * rush of many fletchings pitched downward that thickens as it comes and
 * cuts dead at the impact.
 *
 * The motif is four struck tubes of a wind chime on a roof: long, bright and
 * inharmonic, B5, F♯6, E6, then a low B4 left ringing. The Hundredth Mark's
 * call is plucked; False Footing's is a damped bar; Foreclosure's coins are
 * short. These ring for seconds.
 */

/** A struck metal tube: a tick, then the tube's inharmonic partials ringing out. */
function chime(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.06, ring = 2.2) {
  const f = hz(midi);
  crash(c, o, t, { seconds: 0.012, gain: gain * 0.8, type: "bandpass", freq: 5200, q: 1.5 });
  hit(c, o, t, { type: "sine", from: f, gain, attack: 0.002, decay: ring });
  hit(c, o, t, { type: "sine", from: f * 2.76, gain: gain * 0.45, attack: 0.002, decay: ring * 0.45 });
  hit(c, o, t, { type: "sine", from: f * 5.4, gain: gain * 0.2, attack: 0.002, decay: ring * 0.2 });
  hit(c, o, t, { type: "sine", from: f * 1.003, gain: gain * 0.5, attack: 0.004, decay: ring * 0.8 });
}

/** The heat off the roof: a high, faint shimmer of detuned tones and air. */
function shimmer(c: AudioContext, o: AudioNode, t: number, seconds: number, gain = 0.012) {
  for (const [i, f] of [2350, 3120, 3960].entries())
    swell(c, o, t + i * 0.03, { type: "sine", freq: f, gain, attack: seconds * 0.45, hold: seconds * 0.2, release: seconds * 0.35, cutoff: 9000, detune: (i - 1) * 14 });
  crash(c, o, t, { seconds, gain: gain * 2.2, type: "highpass", freq: 6500, q: 0.4 });
}

/** A bowstring let go: a snap, a low thrum, and the arrow hissing away upward. */
function snap(c: AudioContext, o: AudioNode, t: number, gain = 0.2) {
  crash(c, o, t, { seconds: 0.018, gain: gain * 0.9, type: "highpass", freq: 2600, q: 0.8 });
  hit(c, o, t, { type: "triangle", from: 150, to: 104, gain: gain * 0.9, attack: 0.002, decay: 0.14 });
  hit(c, o, t, { type: "sine", from: 300, to: 210, gain: gain * 0.25, attack: 0.002, decay: 0.08 });
  crash(c, o, t + 0.01, { seconds: 0.22, gain: gain * 0.35, type: "bandpass", freq: 2600, sweepTo: 6400, q: 2.5 });
}

/** Fletchings in the air: a run of soft, falling ticks, `n` of them over `seconds`, thickening. */
function fletch(c: AudioContext, o: AudioNode, t: number, seconds: number, n: number, from: number, to: number, gain: number) {
  for (let i = 0; i < n; i++) {
    const k = i / n;
    // Closer together, louder and lower as the volley comes down.
    const at = t + seconds * (1 - (1 - k) * (1 - k));
    const f = from + (to - from) * k;
    crash(c, o, at, { seconds: 0.03, gain: gain * (0.25 + 0.75 * k), type: "bandpass", freq: f * (0.9 + ((i * 37) % 10) / 50), q: 3.5 });
  }
}

/** A head biting plaster: a dry thock and a spit of grit. */
function thock(c: AudioContext, o: AudioNode, t: number, gain = 0.2) {
  crash(c, o, t, { seconds: 0.02, gain, type: "bandpass", freq: 1900, q: 1.4 });
  hit(c, o, t, { type: "sine", from: 420, to: 170, gain: gain * 0.7, attack: 0.001, decay: 0.06 });
  crash(c, o, t + 0.01, { seconds: 0.06, gain: gain * 0.3, type: "highpass", freq: 4200, q: 0.6 });
}

export const voices: Record<string, Voice> = {
  /** The call: the light turns hard — a hot shimmer rising, and one far chime. */
  "sb-glare": {
    bus: "sfx",
    render: (c, o, t) => {
      shimmer(c, o, t, 0.5, 0.014);
      crash(c, o, t, { seconds: 0.4, gain: 0.05, type: "bandpass", freq: 2000, sweepTo: 7000, q: 0.6 });
      chime(c, o, t + 0.12, 83, 0.025, 1.4);
    },
  },
  /**
   * The eclipse: the glare's shimmer, a rustle of the hood as the head comes
   * across, and the shimmer cut to a hush as the sun goes behind it.
   */
  "sb-eclipse": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, f] of [2350, 3120].entries())
        swell(c, o, t + i * 0.02, { type: "sine", freq: f, gain: 0.01, attack: 0.05, hold: 0.24, release: 0.04, cutoff: 9000 });
      crash(c, o, t, { seconds: 0.32, gain: 0.03, type: "highpass", freq: 6500, q: 0.4 });
      for (let i = 0; i < 5; i++) crash(c, o, t + 0.12 + i * 0.035, { seconds: 0.05, gain: 0.03, type: "bandpass", freq: 1100 + i * 90, q: 2 });
      crash(c, o, t + 0.32, { seconds: 0.35, gain: 0.05, type: "lowpass", freq: 700, sweepTo: 200, q: 0.5 });
    },
  },
  /** The motif: four struck tubes of a rooftop wind chime, B5, F♯6, E6, and a low B4 left ringing. */
  "sb-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes: [number, number, number][] = [
        [0, 83, 0.07],
        [0.16, 90, 0.05],
        [0.3, 88, 0.055],
        [0.52, 71, 0.09],
      ];
      for (const [dt, midi, gain] of notes) chime(c, o, t + dt, midi, gain, midi < 80 ? 3 : 2);
    },
  },
  /** The bow drawn on the roof edge: a creak of wood and string. */
  "sb-draw": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 6; i++) crash(c, o, t + i * 0.05, { seconds: 0.04, gain: 0.03, type: "bandpass", freq: 420 + i * 60, q: 9 });
      hit(c, o, t + 0.1, { type: "triangle", from: 190, to: 230, gain: 0.03, attack: 0.08, decay: 0.3 });
    },
  },
  /** Four arrows in one breath: four string snaps, each arrow hissing away upward. */
  "sb-loose": {
    bus: "sfx",
    render: (c, o, t) => {
      LOOSES.forEach((k, i) => snap(c, o, t + (k * 560) / 1000, 0.2 - i * 0.02));
    },
  },
  /** The sun flaring across the lens: a bright rushing sizzle. */
  "sb-flare": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.34, gain: 0.08, type: "bandpass", freq: 1800, sweepTo: 8500, q: 0.9 });
      swell(c, o, t, { type: "sine", freq: 4200, gain: 0.012, attack: 0.18, hold: 0.04, release: 0.12, cutoff: 9000 });
    },
  },
  /**
   * The quiet: heat off the roof, and the volley falling out of the sun so
   * softly it is almost nothing — fletchings, thickening, coming down.
   */
  "sb-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.6, gain: 0.012, type: "highpass", freq: 7200, q: 0.4 });
      fletch(c, o, t + 0.05, 0.55, 26, 3400, 1900, 0.028);
      swell(c, o, t, { type: "sine", freq: hz(35), gain: 0.012, attack: 0.25, hold: 0.15, release: 0.25 });
    },
  },
  /** The signature: the volley arriving out of the sun, a falling rush of fletchings that cuts at the bite. */
  "sb-fall": {
    bus: "sfx",
    render: (c, o, t) => {
      fletch(c, o, t, 0.06, 12, 2600, 1200, 0.09);
      crash(c, o, t, { seconds: 0.07, gain: 0.16, type: "bandpass", freq: 4200, sweepTo: 1100, q: 1.1 });
    },
  },
  /**
   * The volley lands, in layers: a run of dry thocks as the heads bite
   * plaster (transient), a sub drop, a crack of plaster and a spray of chips
   * (body), and chalk dust sifting down with the chime's low B4 ringing (tail).
   */
  "sb-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 7; i++) thock(c, o, t + i * 0.022 + ((i * 7) % 3) * 0.004, 0.34 - i * 0.025);
      hit(c, o, t, { type: "sine", from: 130, to: 30, gain: 0.95, attack: 0.002, decay: 0.7 });
      crash(c, o, t, { seconds: 0.03, gain: 0.7, type: "highpass", freq: 2800, q: 0.6 });
      crash(c, o, t + 0.005, { seconds: 0.26, gain: 0.45, type: "lowpass", freq: 2600, sweepTo: 360, q: 1 });
      hit(c, o, t + 0.004, { type: "triangle", from: 240, to: 110, gain: 0.22, decay: 0.2 });
      for (let i = 0; i < 9; i++) crash(c, o, t + 0.12 + i * 0.05, { seconds: 0.03, gain: 0.05 - i * 0.004, type: "bandpass", freq: 3200 + ((i * 53) % 7) * 250, q: 3 });
      crash(c, o, t + 0.05, { seconds: 1.1, gain: 0.07, type: "lowpass", freq: 1400, sweepTo: 240, q: 0.4 });
      chime(c, o, t + 0.16, 71, 0.04, 2.6);
    },
  },
  /** On the board: the motif's last two tubes, soft, and dust settling. */
  "sb-after": {
    bus: "sfx",
    render: (c, o, t) => {
      chime(c, o, t, 88, 0.035, 1.8);
      chime(c, o, t + 0.22, 71, 0.05, 2.6);
      crash(c, o, t, { seconds: 0.7, gain: 0.02, type: "lowpass", freq: 1000, sweepTo: 300, q: 0.4 });
    },
  },
};
