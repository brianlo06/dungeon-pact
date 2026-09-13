import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Still Life: sounds.
 *
 * Time run the wrong way. Almost every sound in the film is played
 * *backwards*: a tone or a breath that swells up out of nothing and is cut
 * dead at its loudest, which is what any sound does when the tape runs in
 * reverse. No thunder, no rain, no pages (those are Debt of Thunder's), no
 * ticking and no bells. The one forward sound is the shutter's dry double
 * click, and the film's last notes, which finally play the right way round.
 */

/**
 * A reversed tone: it rises from nothing over `rise` seconds and stops dead.
 * `hit`'s attack is the swell and its decay ends a hair after the peak.
 */
function back(c: AudioContext, o: AudioNode, t: number, midi: number, gain: number, rise: number) {
  hit(c, o, t, { type: "sine", from: hz(midi), gain, attack: rise, decay: rise + 0.018 });
  hit(c, o, t, { type: "triangle", from: hz(midi - 12), gain: gain * 0.3, attack: rise, decay: rise + 0.02 });
  hit(c, o, t + rise * 0.3, { type: "sine", from: hz(midi) * 2.003, gain: gain * 0.12, attack: rise * 0.7, decay: rise * 0.7 + 0.015 });
}

/** A reversed breath: filtered noise rising into a cut, as a shutter draws in. */
function inhale(c: AudioContext, o: AudioNode, t: number, seconds: number, gain: number, freq: number) {
  // `crash` only decays, so the rise is built from short bursts, each louder
  // and brighter than the last, overlapping into one swell.
  const steps = Math.max(4, Math.round(seconds / 0.03));
  for (let i = 0; i < steps; i++) {
    const k = (i + 1) / steps;
    crash(c, o, t + seconds * (i / steps), {
      seconds: 0.06,
      gain: gain * k * k,
      type: "bandpass",
      freq: freq * (0.5 + k * 0.8),
      q: 0.9,
    });
  }
}

/** The shutter: two dry clicks a hair apart, and a tiny ring of the spark. */
function shutter(c: AudioContext, o: AudioNode, t: number, gain: number) {
  crash(c, o, t, { seconds: 0.014, gain, type: "highpass", freq: 3200, q: 0.6 });
  hit(c, o, t, { type: "square", from: 1900, to: 900, gain: gain * 0.08, attack: 0.001, decay: 0.012 });
  crash(c, o, t + 0.034, { seconds: 0.012, gain: gain * 0.7, type: "highpass", freq: 2600, q: 0.6 });
  hit(c, o, t + 0.034, { type: "sine", from: hz(88), gain: gain * 0.05, attack: 0.002, decay: 0.16 });
}

export const voices: Record<string, Voice> = {
  /** The call: a low reversed swell that snaps shut on the shutter; the room stops. */
  "still-call": {
    bus: "sfx",
    render: (c, o, t) => {
      back(c, o, t, 43, 0.22, 0.34);
      inhale(c, o, t + 0.04, 0.3, 0.12, 900);
      shutter(c, o, t + 0.34, 0.5);
      swell(c, o, t + 0.36, { type: "sine", freq: hz(67), gain: 0.03, attack: 0.02, hold: 0.2, release: 0.8, cutoff: 2000 });
    },
  },
  /** The signature: a still taken. A short reversed breath snapping shut. */
  "still-take": {
    bus: "sfx",
    render: (c, o, t) => {
      inhale(c, o, t, 0.12, 0.16, 2400);
      back(c, o, t, 83, 0.035, 0.12);
      shutter(c, o, t + 0.12, 0.42);
    },
  },
  /**
   * The Chronomancer's motif: E5, B4, C5, then G4 held, every note played
   * backwards, rising out of nothing into its cut. A question asked in reverse.
   */
  "still-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes: [number, number, number][] = [
        [0, 76, 0.16],
        [0.2, 71, 0.16],
        [0.4, 72, 0.2],
        [0.66, 67, 0.46],
      ];
      for (const [at, midi, rise] of notes) back(c, o, t + at, midi, 0.13, rise);
      swell(c, o, t + 0.7, { type: "sine", freq: hz(43), gain: 0.07, attack: 0.3, hold: 0.1, release: 0.05, cutoff: 400 });
    },
  },
  /** Stills pulled off the line: a long reversed rush, and the sleeve closing on them. */
  "still-gather": {
    bus: "sfx",
    render: (c, o, t) => {
      inhale(c, o, t, 0.42, 0.22, 1300);
      for (const [at, midi] of [
        [0.1, 79],
        [0.2, 76],
        [0.3, 74],
      ] as const)
        back(c, o, t + at, midi, 0.05, 0.12);
      crash(c, o, t + 0.43, { seconds: 0.05, gain: 0.25, type: "lowpass", freq: 700, q: 0.6 });
      hit(c, o, t + 0.43, { type: "sine", from: 110, to: 60, gain: 0.25, attack: 0.002, decay: 0.12 });
    },
  },
  /**
   * The quiet: one thin held tone, very quiet, for most of the shot; then the
   * breath drawn in backwards, up into the cut, that the impact lands on.
   */
  "still-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sine", freq: hz(91), gain: 0.012, attack: 0.05, hold: 0.28, release: 0.08, cutoff: 6000 });
      inhale(c, o, t + 0.3, 0.26, 0.2, 700);
      back(c, o, t + 0.3, 55, 0.12, 0.26);
    },
  },
  "still-hush-fast": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sine", freq: hz(91), gain: 0.012, attack: 0.04, hold: 0.16, release: 0.06, cutoff: 6000 });
      inhale(c, o, t + 0.2, 0.18, 0.2, 700);
      back(c, o, t + 0.2, 55, 0.12, 0.18);
    },
  },
  /**
   * Every still arriving at once, in layers: the shutter's click and a hard
   * crack (transient), a sub dropping out (weight), four reversed tones cut
   * together on the same instant (the body: the stills, all their moments
   * landing on one), and the roof coming down, a lowpassed room and a long
   * falling ring (tail).
   */
  "still-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      shutter(c, o, t, 0.9);
      crash(c, o, t, { seconds: 0.05, gain: 0.8, type: "highpass", freq: 2400, q: 0.5 });
      hit(c, o, t, { type: "sine", from: 140, to: 26, gain: 1, attack: 0.002, decay: 0.95 });
      hit(c, o, t, { type: "triangle", from: 300, to: 70, gain: 0.32, attack: 0.002, decay: 0.34 });
      crash(c, o, t + 0.004, { seconds: 0.35, gain: 0.3, type: "bandpass", freq: 900, sweepTo: 200, q: 1.1 });
      for (const [f, g] of [
        [311, 0.1],
        [370, 0.09],
        [466, 0.07],
        [587, 0.05],
      ] as const)
        hit(c, o, t, { type: "sine", from: f, to: f * 0.5, gain: g, attack: 0.003, decay: 0.7 });
      // The roof: stone on stone, a few landings after the hit, then the room.
      for (const [at, g] of [
        [0.16, 0.34],
        [0.24, 0.26],
        [0.31, 0.3],
        [0.4, 0.2],
      ] as const) {
        crash(c, o, t + at, { seconds: 0.18, gain: g, type: "lowpass", freq: 520, q: 0.7 });
        hit(c, o, t + at, { type: "sine", from: 90, to: 40, gain: g * 0.6, attack: 0.002, decay: 0.2 });
      }
      crash(c, o, t + 0.03, { seconds: 1.4, gain: 0.26, type: "lowpass", freq: 300, sweepTo: 50, q: 0.4 });
      hit(c, o, t + 0.05, { type: "sine", from: hz(79), to: hz(67), gain: 0.04, attack: 0.02, decay: 1.3 });
    },
  },
  /** Each other enemy's own still arriving: smaller shutters, one a beat. */
  "still-echo": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 3; i++) {
        shutter(c, o, t + i * 0.07, 0.36 - i * 0.07);
        hit(c, o, t + i * 0.07, { type: "sine", from: 110 - i * 10, to: 40, gain: 0.26 - i * 0.06, attack: 0.002, decay: 0.26 });
      }
    },
  },
  /** Release: the motif's last two notes, played forwards at last, and let ring. */
  "still-after": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [at, midi, decay] of [
        [0, 72, 0.6],
        [0.24, 67, 1.3],
      ] as const) {
        hit(c, o, t + at, { type: "sine", from: hz(midi), gain: 0.1, attack: 0.006, decay });
        hit(c, o, t + at, { type: "triangle", from: hz(midi - 12), gain: 0.03, attack: 0.02, decay: decay * 0.8 });
      }
      shutter(c, o, t, 0.12);
    },
  },
};
