import { crash, hit, hz, swell, type Voice } from "../../audio/synth";
import { LOOSES } from "./poses";

/**
 * Proof Shot's sounds. Wind, steel and distance: no gut plucked (the
 * Hundredth Mark), no damped bar in mud (False Footing), no chime tubes
 * (Sunblind), no horn, drum or coins — and one sound only this film has: an
 * arrow punched through plate, a bright hard crack with a short ring behind
 * it, and a second, smaller one with the dry split of a shaft in it.
 *
 * The motif is four proof plates rung at increasing distance: a hammer on a
 * hung breastplate, D3, then F3, A3 and D4, each further off — softer,
 * duller, a little later — until the fourth is almost only its room.
 */

/** A hung plate struck: a tick, the plate's inharmonic partials, and its short room. `far` dulls and delays it. */
function plate(c: AudioContext, o: AudioNode, t: number, midi: number, gain: number, far: number) {
  const f = hz(midi);
  const dull = 1 - far * 0.75;
  crash(c, o, t, { seconds: 0.014, gain: gain * 0.9 * dull, type: "bandpass", freq: 3600 - far * 2200, q: 1.2 });
  hit(c, o, t, { type: "triangle", from: f, gain: gain * 0.7, attack: 0.002, decay: 0.55 + far * 0.4 });
  hit(c, o, t, { type: "sine", from: f * 2.42, gain: gain * 0.45 * dull, attack: 0.002, decay: 0.3 });
  hit(c, o, t, { type: "sine", from: f * 3.9, gain: gain * 0.2 * dull, attack: 0.002, decay: 0.16 });
  hit(c, o, t, { type: "sine", from: f * 1.006, gain: gain * 0.5, attack: 0.004, decay: 0.5 + far * 0.5 });
  // Its room: the further the plate, the more of it is echo.
  crash(c, o, t + 0.03 + far * 0.05, { seconds: 0.25 + far * 0.35, gain: gain * (0.12 + far * 0.3), type: "lowpass", freq: 1600 - far * 1100, q: 0.5 });
}

/** Wind: low, broad noise that rises and falls. */
function wind(c: AudioContext, o: AudioNode, t: number, seconds: number, gain: number, from: number, to: number) {
  crash(c, o, t, { seconds, gain, type: "bandpass", freq: from, sweepTo: to, q: 0.4 });
  crash(c, o, t + seconds * 0.15, { seconds: seconds * 0.8, gain: gain * 0.5, type: "lowpass", freq: 500, sweepTo: 240, q: 0.5 });
}

/** A bowstring let go, flat: a snap, a low thrum, and the arrow hissing away level. */
function snap(c: AudioContext, o: AudioNode, t: number, gain = 0.2) {
  crash(c, o, t, { seconds: 0.016, gain: gain * 0.9, type: "highpass", freq: 2400, q: 0.8 });
  hit(c, o, t, { type: "triangle", from: 140, to: 98, gain: gain * 0.9, attack: 0.002, decay: 0.15 });
  hit(c, o, t, { type: "sine", from: 290, to: 200, gain: gain * 0.25, attack: 0.002, decay: 0.08 });
  crash(c, o, t + 0.008, { seconds: 0.2, gain: gain * 0.3, type: "bandpass", freq: 3000, sweepTo: 5200, q: 2.5 });
}

/** Steel punched through: a hard bright crack, the plate's ring behind it, and a rattle of chain. */
function punch(c: AudioContext, o: AudioNode, t: number, gain: number) {
  crash(c, o, t, { seconds: 0.012, gain: gain * 1.1, type: "highpass", freq: 3200, q: 0.7 });
  hit(c, o, t, { type: "square", from: 1900, to: 1500, gain: gain * 0.28, attack: 0.001, decay: 0.05 });
  hit(c, o, t + 0.003, { type: "sine", from: 2350, gain: gain * 0.35, attack: 0.001, decay: 0.42 });
  hit(c, o, t + 0.003, { type: "sine", from: 3120, gain: gain * 0.18, attack: 0.001, decay: 0.26 });
  hit(c, o, t + 0.003, { type: "triangle", from: 640, gain: gain * 0.3, attack: 0.001, decay: 0.3 });
  for (let i = 0; i < 6; i++) crash(c, o, t + 0.05 + i * 0.03 + (i % 2) * 0.008, { seconds: 0.02, gain: gain * (0.16 - i * 0.02), type: "bandpass", freq: 3400 + ((i * 47) % 5) * 300, q: 4 });
}

export const voices: Record<string, Voice> = {
  /** The call: a gust across the board, and grit with it. */
  "ps-gust": {
    bus: "sfx",
    render: (c, o, t) => {
      wind(c, o, t, 0.55, 0.16, 380, 900);
      crash(c, o, t + 0.1, { seconds: 0.3, gain: 0.05, type: "highpass", freq: 6000, q: 0.5 });
    },
  },
  /** The wind read: a pinch of grit let go — a dry hiss, a few ticks on the cinder, and the wind that takes it. */
  "ps-grit": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.34, gain: 0.07, type: "highpass", freq: 5200, q: 0.5 });
      for (let i = 0; i < 9; i++) crash(c, o, t + 0.12 + i * 0.03 + ((i * 7) % 3) * 0.006, { seconds: 0.012, gain: 0.05 - i * 0.004, type: "bandpass", freq: 2600 + ((i * 53) % 6) * 400, q: 5 });
      wind(c, o, t, 0.6, 0.07, 300, 700);
    },
  },
  /** The motif: four proof plates rung, each further off — D3, F3, A3, D4. */
  "ps-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes: [number, number, number, number][] = [
        [0, 50, 0.13, 0],
        [0.24, 53, 0.1, 0.35],
        [0.46, 57, 0.08, 0.65],
        [0.66, 62, 0.07, 0.95],
      ];
      for (const [dt, midi, gain, far] of notes) plate(c, o, t + dt, midi, gain, far);
    },
  },
  /** The bow drawn flat: a creak of wood and string, and the wind. */
  "ps-creak": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 6; i++) crash(c, o, t + i * 0.05, { seconds: 0.04, gain: 0.03, type: "bandpass", freq: 400 + i * 55, q: 9 });
      hit(c, o, t + 0.1, { type: "triangle", from: 180, to: 220, gain: 0.03, attack: 0.08, decay: 0.3 });
    },
  },
  /** The breath: let out slowly through a small mouth, then held; the wind behind it. */
  "ps-breath": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t + 0.15, { type: "sine", freq: 210, gain: 0.014, attack: 0.08, hold: 0.06, release: 0.1, cutoff: 800 });
      crash(c, o, t + 0.16, { seconds: 0.22, gain: 0.09, type: "lowpass", freq: 1500, sweepTo: 600, q: 0.6 });
      crash(c, o, t + 0.2, { seconds: 0.16, gain: 0.05, type: "bandpass", freq: 900, sweepTo: 500, q: 1.2 });
      wind(c, o, t, 0.4, 0.05, 500, 300);
    },
  },
  /** Two arrows in one breath: two snaps, flat, and the hisses away. */
  "ps-loose": {
    bus: "sfx",
    render: (c, o, t) => {
      LOOSES.forEach((k, i) => snap(c, o, t + (k * 600) / 1000, 0.22 - i * 0.03));
    },
  },
  /** The quiet: the wind dying, the flag's cloth settling, then nothing but air. */
  "ps-settle": {
    bus: "sfx",
    render: (c, o, t) => {
      wind(c, o, t, 0.4, 0.09, 700, 220);
      // The cloth: two soft flaps, then a slow slump.
      crash(c, o, t + 0.06, { seconds: 0.05, gain: 0.07, type: "lowpass", freq: 900, q: 0.8 });
      crash(c, o, t + 0.16, { seconds: 0.05, gain: 0.05, type: "lowpass", freq: 700, q: 0.8 });
      crash(c, o, t + 0.28, { seconds: 0.18, gain: 0.04, type: "lowpass", freq: 500, sweepTo: 200, q: 0.6 });
      crash(c, o, t + 0.4, { seconds: 0.2, gain: 0.01, type: "highpass", freq: 7000, q: 0.4 });
    },
  },
  /**
   * The proof shot lands, in layers: the punch through the plate
   * (transient), a sub drop, the plate's clang and the thud into the target
   * (body), and the ring dying under a rattle of chain, then the plate
   * hitting the cinder half a second later (tail).
   */
  "ps-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      punch(c, o, t, 0.85);
      hit(c, o, t, { type: "sine", from: 125, to: 30, gain: 0.95, attack: 0.002, decay: 0.7 });
      crash(c, o, t + 0.004, { seconds: 0.24, gain: 0.45, type: "lowpass", freq: 2400, sweepTo: 320, q: 1 });
      hit(c, o, t + 0.004, { type: "triangle", from: 230, to: 100, gain: 0.24, decay: 0.2 });
      hit(c, o, t + 0.01, { type: "sine", from: 1180, gain: 0.16, attack: 0.001, decay: 1.1 });
      hit(c, o, t + 0.01, { type: "sine", from: 1770, gain: 0.08, attack: 0.001, decay: 0.8 });
      crash(c, o, t + 0.05, { seconds: 1, gain: 0.06, type: "lowpass", freq: 1300, sweepTo: 220, q: 0.4 });
      // The plate lands on the cinder.
      hit(c, o, t + 0.48, { type: "triangle", from: 420, to: 300, gain: 0.16, attack: 0.001, decay: 0.12 });
      crash(c, o, t + 0.48, { seconds: 0.09, gain: 0.22, type: "lowpass", freq: 1800, sweepTo: 500, q: 0.8 });
      hit(c, o, t + 0.49, { type: "sine", from: 980, gain: 0.05, attack: 0.001, decay: 0.5 });
      crash(c, o, t + 0.53, { seconds: 0.06, gain: 0.08, type: "lowpass", freq: 1400, q: 0.8 });
    },
  },
  /** The second arrow: a smaller punch, and the dry split of the first's shaft. */
  "ps-second": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.55, type: "bandpass", freq: 2600, q: 1.1 });
      hit(c, o, t, { type: "triangle", from: 620, to: 280, gain: 0.32, attack: 0.001, decay: 0.09 });
      hit(c, o, t + 0.002, { type: "square", from: 900, to: 700, gain: 0.08, attack: 0.001, decay: 0.03 });
      hit(c, o, t, { type: "sine", from: 110, to: 40, gain: 0.5, attack: 0.002, decay: 0.35 });
      crash(c, o, t + 0.003, { seconds: 0.14, gain: 0.28, type: "lowpass", freq: 2000, sweepTo: 400, q: 1 });
      hit(c, o, t + 0.006, { type: "sine", from: 2350, gain: 0.12, attack: 0.001, decay: 0.3 });
      // Splinters pattering down.
      for (let i = 0; i < 6; i++) crash(c, o, t + 0.08 + i * 0.04, { seconds: 0.015, gain: 0.05 - i * 0.006, type: "bandpass", freq: 1800 + ((i * 37) % 4) * 350, q: 4 });
    },
  },
  /** On the board: the motif's last plate, far off, and the wind coming back. */
  "ps-after": {
    bus: "sfx",
    render: (c, o, t) => {
      plate(c, o, t, 62, 0.07, 0.9);
      plate(c, o, t + 0.3, 50, 0.06, 0.6);
      wind(c, o, t + 0.1, 0.7, 0.05, 300, 600);
    },
  },
};
