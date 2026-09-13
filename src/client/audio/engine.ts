import type { SfxName } from "../../shared/presentation";
import { crash, hit, hz, swell, type Voice } from "./synth";
import { FOLDER_VOICES } from "./ultimate-voices";

/**
 * Combat audio.
 *
 * Every sound here is **synthesised at runtime**, not sampled. That is a
 * deliberate licensing decision as much as a technical one: the project's rule
 * is that no asset ships without a known licence, and a sound this file builds
 * out of oscillators and noise has exactly one author. Nothing is downloaded,
 * nothing is bundled, and `ASSET_LICENSES.md` has nothing new to track.
 *
 * These are development-grade sounds with a production shape. When recorded
 * assets arrive they replace the `render` function per name and nothing else
 * changes — the mixer, the categories and every call site stay as they are.
 */

export type Bus = "master" | "music" | "sfx" | "ui" | "ambience";

const DEFAULT_LEVELS: Record<Bus, number> = {
  master: 0.7,
  music: 0.5,
  sfx: 0.85,
  ui: 0.6,
  ambience: 0.35,
};



/*
 * Ultimate voices. Longer, lower and layered where the combat palette is
 * short: an Ultimate's impact is a transient, a sub drop, a metal body and a
 * tail, each doing one job, so the moment is felt as well as heard. The
 * motifs are three or four notes each, the character's signature rather than
 * a score, and they are original.
 */
const ULTIMATE_VOICES = {
  /** The call: a guild bell struck once, deep, with a breath drawn under it. */
  "ult-call": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 74, to: 52, gain: 0.5, decay: 1.4 });
      for (const [i, f] of [311, 523, 741, 1047].entries())
        hit(c, o, t + i * 0.004, {
          type: "sine",
          from: f,
          gain: 0.08 / (i + 1),
          attack: 0.004,
          decay: 1.1 - i * 0.18,
        });
      crash(c, o, t, { seconds: 0.5, gain: 0.08, freq: 500, sweepTo: 2400, q: 0.7 });
    },
  },
  /** The shield bites the floor: clank, sub, and a ring that will not stop. */
  "ult-plant": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 96, to: 34, gain: 0.7, decay: 0.55 });
      hit(c, o, t, { type: "square", from: 1180, to: 620, gain: 0.16, decay: 0.3 });
      hit(c, o, t + 0.003, { type: "square", from: 1710, to: 900, gain: 0.1, decay: 0.24 });
      crash(c, o, t, { seconds: 0.36, gain: 0.42, freq: 2600, sweepTo: 500, q: 0.8 });
      crash(c, o, t + 0.02, { seconds: 0.5, gain: 0.14, type: "lowpass", freq: 700, sweepTo: 120 });
      hit(c, o, t + 0.01, { type: "sine", from: 1180, gain: 0.05, attack: 0.01, decay: 1.6 });
      hit(c, o, t + 0.01, { type: "sine", from: 1772, gain: 0.03, attack: 0.01, decay: 1.2 });
    },
  },
  /** Power coming up through the floor. */
  "ult-rise": {
    bus: "sfx",
    render: (c, o, t) => {
      const osc = c.createOscillator();
      const f = c.createBiquadFilter();
      const g = c.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(55, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.9);
      f.type = "lowpass";
      f.frequency.setValueAtTime(180, t);
      f.frequency.exponentialRampToValueAtTime(2400, t + 0.9);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      osc.connect(f).connect(g).connect(o);
      osc.start(t);
      osc.stop(t + 1.15);
      crash(c, o, t, { seconds: 0.95, gain: 0.07, freq: 300, sweepTo: 4200, q: 0.9 });
    },
  },
  /** The Vanguard's motif: a fifth and an octave, like a held horn. */
  "motif-vanguard": {
    bus: "sfx",
    render: (c, o, t) => {
      const notes: [number, number, number][] = [
        [50, 0, 0.34],
        [57, 0.2, 0.34],
        [62, 0.4, 0.7],
      ];
      for (const [pitch, at, hold] of notes) {
        swell(c, o, t + at, { freq: hz(pitch), gain: 0.07, attack: 0.08, hold, release: 0.5, cutoff: 1600 });
        swell(c, o, t + at, { freq: hz(pitch), gain: 0.05, attack: 0.08, hold, release: 0.5, cutoff: 1200, detune: 9 });
        swell(c, o, t + at, { type: "triangle", freq: hz(pitch - 12), gain: 0.06, attack: 0.06, hold, release: 0.4 });
      }
    },
  },
  /** The quiet: one note held in the shield. */
  "ult-hum": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sine", freq: 220, gain: 0.05, attack: 0.18, hold: 0.2, release: 0.3 });
      swell(c, o, t, { type: "sine", freq: 331, gain: 0.025, attack: 0.22, hold: 0.16, release: 0.3 });
    },
  },
  /** A glint: light catching a visor. */
  "ult-tick": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 3400, gain: 0.08, decay: 0.12 });
      hit(c, o, t + 0.02, { type: "sine", from: 5100, gain: 0.04, decay: 0.1 });
    },
  },
  "ult-whoosh": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.5, gain: 0.3, freq: 380, sweepTo: 3200, q: 0.9 });
      crash(c, o, t + 0.2, { seconds: 0.35, gain: 0.16, type: "lowpass", freq: 900, sweepTo: 200 });
    },
  },
  /**
   * The impact, in layers: a click so it has an edge, a sub that drops out
   * from under it, a metal body, and a crack of noise.
   */
  "ult-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.035, gain: 0.7, type: "highpass", freq: 2400, q: 0.5 });
      hit(c, o, t, { type: "sine", from: 130, to: 26, gain: 0.95, attack: 0.002, decay: 0.8 });
      hit(c, o, t, { type: "triangle", from: 260, to: 60, gain: 0.35, decay: 0.4 });
      hit(c, o, t + 0.004, { type: "square", from: 760, to: 300, gain: 0.18, decay: 0.45 });
      crash(c, o, t, { seconds: 0.7, gain: 0.55, freq: 1800, sweepTo: 180, q: 0.6 });
    },
  },
  /** What the room does after: a low roll that takes a second to die. */
  "ult-boom": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 1.3, gain: 0.34, type: "lowpass", freq: 260, sweepTo: 60, q: 0.4 });
      hit(c, o, t, { type: "sine", from: 48, to: 30, gain: 0.4, attack: 0.03, decay: 1.2 });
    },
  },
  /** A ward rising: a warm chord, opening. */
  "ult-ward": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, p] of [62, 66, 69, 74].entries())
        swell(c, o, t + i * 0.05, { type: "sine", freq: hz(p), gain: 0.06, attack: 0.1, hold: 0.25, release: 0.9 });
      crash(c, o, t, { seconds: 0.8, gain: 0.05, freq: 3000, sweepTo: 7000, q: 0.5 });
    },
  },
  "ult-tail": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 880, gain: 0.04, attack: 0.02, decay: 1.8 });
      hit(c, o, t, { type: "sine", from: 1318, gain: 0.025, attack: 0.02, decay: 1.4 });
    },
  },
  /** The meter filling: a lantern lighting, for the hero whose it is. */
  "ult-ready": {
    bus: "ui",
    render: (c, o, t) => {
      for (const [i, p] of [69, 76, 81].entries())
        hit(c, o, t + i * 0.07, { type: "sine", from: hz(p), gain: 0.1, attack: 0.01, decay: 0.5 });
      crash(c, o, t, { seconds: 0.4, gain: 0.04, freq: 4000, sweepTo: 8000, q: 0.6 });
    },
  },
  /* The Breaker: a forge, not a hall. */
  "ult-forge": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 1.0, gain: 0.26, type: "lowpass", freq: 700, sweepTo: 300, q: 0.5 });
      swell(c, o, t, { freq: 41, gain: 0.14, attack: 0.1, hold: 0.4, release: 0.5, cutoff: 400 });
      for (let i = 0; i < 10; i++)
        crash(c, o, t + 0.05 + i * 0.07, { seconds: 0.03, gain: 0.05, freq: 3000 + ((i * 977) % 3000), q: 6 });
    },
  },
  "ult-grind": {
    bus: "sfx",
    render: (c, o, t) =>
      crash(c, o, t, { seconds: 0.45, gain: 0.16, freq: 900, sweepTo: 3600, q: 7 }),
  },
  /** The Breaker's motif: three hammer blows, each closer than the last. */
  "motif-breaker": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, at] of [0, 0.3, 0.48, 0.58].entries()) {
        hit(c, o, t + at, { type: "square", from: 1240 - i * 60, to: 700, gain: 0.12, decay: 0.22 });
        hit(c, o, t + at, { type: "sine", from: 110, to: 45, gain: 0.3, decay: 0.28 });
        crash(c, o, t + at, { seconds: 0.12, gain: 0.2, freq: 2800, sweepTo: 900 });
      }
      swell(c, o, t + 0.58, { freq: hz(38), gain: 0.1, attack: 0.05, hold: 0.25, release: 0.5, cutoff: 900 });
      swell(c, o, t + 0.58, { freq: hz(45), gain: 0.07, attack: 0.05, hold: 0.25, release: 0.5, cutoff: 900 });
    },
  },
  "ult-shatter": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 12; i++)
        crash(c, o, t + 0.01 + i * 0.03, {
          seconds: 0.08 + (i % 3) * 0.04,
          gain: 0.14,
          freq: 1400 + ((i * 1733) % 4200),
          q: 2.5,
        });
      hit(c, o, t, { type: "square", from: 520, to: 180, gain: 0.16, decay: 0.5 });
    },
  },
  /* The Arcanist: a storm borrowed against a page. */
  /** Thunder a long way off: a low roll with no crack in it. */
  "ult-thunder-far": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 1.4, gain: 0.26, type: "lowpass", freq: 180, sweepTo: 70, q: 0.3 });
      crash(c, o, t + 0.25, { seconds: 1.0, gain: 0.16, type: "lowpass", freq: 260, sweepTo: 90, q: 0.3 });
    },
  },
  /** Pages tearing loose and fluttering up. */
  "ult-pages": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 9; i++)
        crash(c, o, t + i * 0.045 + (i % 3) * 0.01, {
          seconds: 0.05 + (i % 2) * 0.03,
          gain: 0.09,
          type: "highpass",
          freq: 2200 + ((i * 523) % 2400),
          q: 0.7,
        });
      crash(c, o, t, { seconds: 0.25, gain: 0.08, freq: 1200, sweepTo: 3800, q: 1.2 });
    },
  },
  /** A downpour arriving all at once. */
  "ult-rain": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 1.3, gain: 0.22, type: "highpass", freq: 1400, q: 0.4 });
      crash(c, o, t, { seconds: 1.1, gain: 0.14, freq: 700, sweepTo: 500, q: 0.5 });
      for (let i = 0; i < 12; i++)
        hit(c, o, t + 0.05 + ((i * 97) % 100) / 100, { type: "sine", from: 2400 + ((i * 331) % 1600), gain: 0.02, decay: 0.03 });
    },
  },
  /** One drop, in silence. */
  "ult-drip": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 1400, to: 2600, gain: 0.12, attack: 0.002, decay: 0.09 });
      hit(c, o, t + 0.03, { type: "sine", from: 900, gain: 0.03, decay: 0.3 });
    },
  },
  /** The Arcanist's motif: a minor arpeggio climbing into a held, trembling note. */
  "motif-arcanist": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, p] of [57, 60, 64, 69].entries())
        swell(c, o, t + i * 0.11, { type: "triangle", freq: hz(p), gain: 0.06, attack: 0.03, hold: 0.12, release: 0.5, cutoff: 3000 });
      swell(c, o, t + 0.44, { type: "sine", freq: hz(76), gain: 0.05, attack: 0.08, hold: 0.45, release: 0.6, detune: 12 });
      swell(c, o, t + 0.44, { type: "sine", freq: hz(76), gain: 0.04, attack: 0.08, hold: 0.45, release: 0.6, detune: -12 });
    },
  },
  /** Electricity gathering in a raised hand. */
  "ult-charge-arc": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sawtooth", from: 80, to: 1800, gain: 0.07, attack: 0.3, decay: 0.45 });
      for (let i = 0; i < 10; i++)
        crash(c, o, t + 0.04 * i, { seconds: 0.02, gain: 0.05 + i * 0.006, freq: 3000 + i * 300, q: 8 });
    },
  },
  /** The bolt: a crack with a split in it, and the sky answering. */
  "ult-bolt": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.04, gain: 0.8, type: "highpass", freq: 3000, q: 0.4 });
      crash(c, o, t + 0.012, { seconds: 0.3, gain: 0.5, freq: 4200, sweepTo: 700, q: 0.7 });
      hit(c, o, t, { type: "sawtooth", from: 1600, to: 60, gain: 0.25, decay: 0.35 });
      hit(c, o, t, { type: "sine", from: 110, to: 30, gain: 0.8, decay: 0.9 });
      crash(c, o, t + 0.06, { seconds: 1.4, gain: 0.3, type: "lowpass", freq: 320, sweepTo: 60, q: 0.3 });
    },
  },
  /** Chain Shock running down the line: a zap for each jump. */
  "ult-chain": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 4; i++) {
        hit(c, o, t + i * 0.08, { type: "square", from: 1900 - i * 180, to: 300, gain: 0.08, decay: 0.09 });
        crash(c, o, t + i * 0.08, { seconds: 0.07, gain: 0.14, type: "highpass", freq: 2600, q: 0.8 });
      }
    },
  },
} satisfies Record<string, Voice>;

const VOICES: Record<SfxName, Voice> = {
  "swing-light": {
    bus: "sfx",
    render: (c, o, t) =>
      crash(c, o, t, {
        seconds: 0.13,
        gain: 0.16,
        freq: 2600,
        sweepTo: 900,
        q: 0.8,
      }),
  },
  "swing-heavy": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, {
        seconds: 0.2,
        gain: 0.22,
        freq: 1500,
        sweepTo: 420,
        q: 0.7,
      });
      hit(c, o, t, {
        type: "triangle",
        from: 180,
        to: 70,
        gain: 0.12,
        decay: 0.16,
      });
    },
  },
  "impact-light": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, {
        type: "triangle",
        from: 320,
        to: 120,
        gain: 0.32,
        decay: 0.14,
      });
      crash(c, o, t, { seconds: 0.1, gain: 0.22, freq: 2200 });
    },
  },
  "impact-heavy": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 150, to: 44, gain: 0.5, decay: 0.3 });
      crash(c, o, t, { seconds: 0.24, gain: 0.3, freq: 1100, sweepTo: 260 });
    },
  },
  "impact-metal": {
    bus: "sfx",
    render: (c, o, t) => {
      // Two close partials give iron its ring without a sample.
      hit(c, o, t, {
        type: "square",
        from: 1180,
        to: 640,
        gain: 0.14,
        decay: 0.26,
      });
      hit(c, o, t + 0.004, {
        type: "square",
        from: 1630,
        to: 880,
        gain: 0.1,
        decay: 0.2,
      });
      crash(c, o, t, { seconds: 0.18, gain: 0.26, freq: 3200, sweepTo: 1400 });
    },
  },
  "shield-raise": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, {
        seconds: 0.16,
        gain: 0.18,
        freq: 900,
        sweepTo: 2200,
        q: 0.9,
      });
      hit(c, o, t + 0.06, {
        type: "triangle",
        from: 300,
        to: 420,
        gain: 0.12,
        decay: 0.16,
      });
    },
  },
  "shield-block": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, {
        type: "square",
        from: 880,
        to: 420,
        gain: 0.2,
        decay: 0.22,
      });
      crash(c, o, t, { seconds: 0.16, gain: 0.34, freq: 2600, sweepTo: 800 });
      hit(c, o, t, { type: "sine", from: 120, to: 60, gain: 0.28, decay: 0.2 });
    },
  },
  "cast-arcane": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, {
        type: "sine",
        from: 420,
        to: 1500,
        gain: 0.16,
        attack: 0.05,
        decay: 0.34,
      });
      hit(c, o, t + 0.05, {
        type: "sine",
        from: 640,
        to: 2100,
        gain: 0.1,
        attack: 0.05,
        decay: 0.3,
      });
    },
  },
  "cast-nature": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, {
        type: "triangle",
        from: 260,
        to: 700,
        gain: 0.16,
        attack: 0.06,
        decay: 0.36,
      });
      crash(c, o, t, {
        seconds: 0.3,
        gain: 0.08,
        freq: 700,
        sweepTo: 1800,
        q: 0.6,
      });
    },
  },
  heal: {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, f] of [523, 659, 784].entries())
        hit(c, o, t + i * 0.05, {
          type: "sine",
          from: f,
          gain: 0.13,
          attack: 0.02,
          decay: 0.3,
        });
    },
  },
  interrupt: {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, {
        seconds: 0.1,
        gain: 0.42,
        freq: 4200,
        sweepTo: 600,
        q: 0.6,
      });
      hit(c, o, t, {
        type: "sawtooth",
        from: 620,
        to: 90,
        gain: 0.24,
        decay: 0.18,
      });
    },
  },
  chain: {
    bus: "sfx",
    render: (c, o, t) => {
      // Links, not a rattle: three sharp metal ticks in quick succession.
      for (let i = 0; i < 4; i++)
        crash(c, o, t + i * 0.035, {
          seconds: 0.05,
          gain: 0.16,
          freq: 3000 + i * 420,
          q: 3,
        });
    },
  },
  lock: {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.05, gain: 0.28, freq: 2400, q: 4 });
      hit(c, o, t + 0.03, {
        type: "square",
        from: 260,
        to: 150,
        gain: 0.2,
        decay: 0.1,
      });
    },
  },
  "vault-hit": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 110, to: 50, gain: 0.4, decay: 0.34 });
      hit(c, o, t, {
        type: "square",
        from: 700,
        to: 380,
        gain: 0.12,
        decay: 0.3,
      });
      crash(c, o, t, { seconds: 0.2, gain: 0.24, freq: 1800, sweepTo: 500 });
    },
  },
  "vault-break": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 90, to: 38, gain: 0.55, decay: 0.7 });
      crash(c, o, t, {
        seconds: 0.55,
        gain: 0.42,
        freq: 3400,
        sweepTo: 300,
        q: 0.5,
      });
      for (let i = 0; i < 6; i++)
        crash(c, o, t + 0.05 + i * 0.055, {
          seconds: 0.09,
          gain: 0.16,
          freq: 2200 + Math.random() * 2400,
          q: 2.5,
        });
      // The payoff chord, so getting your gear back sounds like a reward.
      for (const [i, f] of [392, 523, 659, 784].entries())
        hit(c, o, t + 0.16 + i * 0.04, {
          type: "sine",
          from: f,
          gain: 0.12,
          attack: 0.02,
          decay: 0.5,
        });
    },
  },
  coin: {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "square", from: 2100, gain: 0.08, decay: 0.1 });
      hit(c, o, t + 0.04, {
        type: "square",
        from: 2800,
        gain: 0.06,
        decay: 0.12,
      });
    },
  },
  step: {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 90, to: 50, gain: 0.18, decay: 0.1 });
      crash(c, o, t, { seconds: 0.07, gain: 0.1, freq: 900 });
    },
  },
  down: {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 200, to: 44, gain: 0.4, decay: 0.5 });
      crash(c, o, t + 0.05, {
        seconds: 0.3,
        gain: 0.22,
        freq: 700,
        sweepTo: 180,
      });
    },
  },
  revive: {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, f] of [330, 440, 554, 659].entries())
        hit(c, o, t + i * 0.07, {
          type: "sine",
          from: f,
          gain: 0.14,
          attack: 0.03,
          decay: 0.45,
        });
      crash(c, o, t, {
        seconds: 0.4,
        gain: 0.07,
        freq: 400,
        sweepTo: 2600,
        q: 0.6,
      });
    },
  },
  "boss-groan": {
    bus: "sfx",
    render: (c, o, t) => {
      // Low, slow and mechanical. The Collector should be felt, not heard.
      hit(c, o, t, {
        type: "sawtooth",
        from: 58,
        to: 40,
        gain: 0.3,
        attack: 0.08,
        decay: 0.9,
      });
      hit(c, o, t, {
        type: "sine",
        from: 86,
        to: 62,
        gain: 0.22,
        attack: 0.1,
        decay: 0.8,
      });
      crash(c, o, t, {
        seconds: 0.7,
        gain: 0.09,
        type: "lowpass",
        freq: 420,
        sweepTo: 120,
      });
    },
  },
  "boss-stamp": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 120, to: 36, gain: 0.6, decay: 0.45 });
      crash(c, o, t, { seconds: 0.26, gain: 0.3, freq: 1400, sweepTo: 200 });
      hit(c, o, t + 0.02, {
        type: "square",
        from: 320,
        to: 150,
        gain: 0.16,
        decay: 0.2,
      });
    },
  },
  /*
   * The Miser's voice. Where the Collector is machinery, this is something
   * alive and wet: a toad's croak, rough and slow, over a trickle of coins
   * running off a heap.
   */
  "miser-croak": {
    bus: "sfx",
    render: (c, o, t) => {
      for (const [i, f] of [64, 67].entries())
        hit(c, o, t + i * 0.01, {
          type: "sawtooth",
          from: f,
          to: 46,
          gain: 0.2,
          attack: 0.06,
          decay: 0.7,
        });
      // The croak's rattle: short pulses of low noise, slowing down.
      for (let i = 0; i < 7; i++)
        crash(c, o, t + 0.05 + i * (0.06 + i * 0.012), {
          seconds: 0.05,
          gain: 0.14,
          type: "lowpass",
          freq: 380,
        });
      for (let i = 0; i < 9; i++)
        hit(c, o, t + 0.15 + Math.random() * 0.8, {
          type: "square",
          from: 2300 + Math.random() * 1200,
          gain: 0.035,
          decay: 0.07,
        });
    },
  },
  /*
   * Choreography cues, timed by the choreographer to what the figures do: a
   * bow's creak across the draw and its snap at the release, the arrow's
   * rush through the air, a heavy charge's footfalls, power gathering before
   * a spell, and anything thrown leaving the hand.
   */
  "bow-draw": {
    bus: "sfx",
    render: (c, o, t) => {
      // A creak is a narrow, slowly rising resonance with a grain to it.
      crash(c, o, t, {
        seconds: 0.42,
        gain: 0.08,
        freq: 520,
        sweepTo: 1250,
        q: 9,
      });
      for (let i = 0; i < 5; i++)
        crash(c, o, t + 0.04 + i * 0.07, {
          seconds: 0.03,
          gain: 0.05,
          freq: 900 + i * 110,
          q: 12,
        });
    },
  },
  "bow-release": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, {
        type: "triangle",
        from: 560,
        to: 170,
        gain: 0.22,
        decay: 0.13,
      });
      crash(c, o, t, { seconds: 0.05, gain: 0.26, freq: 3400, q: 2 });
    },
  },
  "arrow-whoosh": {
    bus: "sfx",
    render: (c, o, t) =>
      crash(c, o, t, {
        seconds: 0.24,
        gain: 0.12,
        freq: 2400,
        sweepTo: 620,
        q: 1.4,
      }),
  },
  "footstep-heavy": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 78, to: 40, gain: 0.26, decay: 0.12 });
      crash(c, o, t, {
        seconds: 0.08,
        gain: 0.1,
        type: "lowpass",
        freq: 520,
      });
    },
  },
  "charge-rise": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, {
        type: "sine",
        from: 190,
        to: 880,
        gain: 0.12,
        attack: 0.18,
        decay: 0.48,
      });
      crash(c, o, t, {
        seconds: 0.46,
        gain: 0.05,
        freq: 500,
        sweepTo: 2600,
        q: 0.8,
      });
    },
  },
  "projectile-release": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, {
        seconds: 0.14,
        gain: 0.16,
        freq: 2600,
        sweepTo: 900,
        q: 1,
      });
      hit(c, o, t, {
        type: "triangle",
        from: 380,
        to: 720,
        gain: 0.1,
        decay: 0.1,
      });
    },
  },
  /** A riveting rifle: a dry crack, a low thump, and a metal ring after. */
  "rivet-fire": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.09, gain: 0.42, freq: 3000, q: 0.7 });
      hit(c, o, t, { type: "sine", from: 210, to: 52, gain: 0.4, decay: 0.2 });
      hit(c, o, t + 0.02, {
        type: "square",
        from: 1450,
        to: 980,
        gain: 0.06,
        decay: 0.3,
      });
    },
  },
  /** Furnace breath through a horn: a roar that swells and breaks up. */
  "flame-roar": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, {
        seconds: 0.55,
        gain: 0.34,
        type: "lowpass",
        freq: 1400,
        sweepTo: 320,
        q: 0.6,
      });
      crash(c, o, t + 0.03, {
        seconds: 0.4,
        gain: 0.12,
        freq: 2600,
        sweepTo: 900,
        q: 1.1,
      });
      hit(c, o, t, { type: "sawtooth", from: 90, to: 55, gain: 0.08, decay: 0.45 });
    },
  },
  /** Air pulled in through leather: a slow, rising hush. */
  "bellows-draw": {
    bus: "sfx",
    render: (c, o, t) =>
      crash(c, o, t, {
        seconds: 0.6,
        gain: 0.1,
        freq: 380,
        sweepTo: 1500,
        q: 1.4,
      }),
  },
  /** A weld: short crackling bursts over a hiss. */
  "weld-hiss": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.5, gain: 0.05, freq: 5200, q: 0.9 });
      for (let i = 0; i < 6; i++)
        crash(c, o, t + 0.03 + i * 0.075, {
          seconds: 0.025,
          gain: 0.12,
          freq: 3800 + (i % 3) * 700,
          q: 3,
        });
    },
  },
  /** A spell landing: a glassy crack over a soft low bloom. */
  "arcane-burst": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 1900, to: 620, gain: 0.14, decay: 0.22 });
      hit(c, o, t, { type: "triangle", from: 260, to: 90, gain: 0.2, decay: 0.26 });
      crash(c, o, t, { seconds: 0.16, gain: 0.18, freq: 4200, sweepTo: 1600, q: 1 });
    },
  },
  /** A coin slapped down on the counter, spinning until it settles. */
  "miser-coin": {
    bus: "sfx",
    render: (c, o, t) => {
      hit(c, o, t, { type: "sine", from: 130, to: 44, gain: 0.5, decay: 0.4 });
      crash(c, o, t, { seconds: 0.18, gain: 0.24, freq: 2400, sweepTo: 700 });
      // The spin: ticks closing up as the coin wobbles flat.
      let at = t + 0.08;
      for (let i = 0; i < 16; i++) {
        const gap = 0.1 * Math.pow(0.84, i);
        at += gap;
        hit(c, o, at, {
          type: "square",
          from: 2600 + i * 60,
          gain: 0.07 * (1 - i / 20),
          decay: 0.05,
        });
      }
    },
  },
};

/**
 * The mixer. Buses exist so a player can turn music down without losing the
 * information that combat sounds carry.
 */
class Mixer {
  private ctx: AudioContext | null = null;
  private buses = new Map<Bus, GainNode>();
  private levels: Record<Bus, number> = { ...DEFAULT_LEVELS };
  private muted = false;
  /** Rate limit: a row attack must not fire eight identical hits at once. */
  private lastAt = new Map<string, number>();

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = this.levels.master;
    master.connect(ctx.destination);
    this.buses.set("master", master);
    for (const bus of ["music", "sfx", "ui", "ambience"] as const) {
      const node = ctx.createGain();
      node.gain.value = this.levels[bus];
      node.connect(master);
      this.buses.set(bus, node);
    }
    this.ctx = ctx;
    return ctx;
  }

  /** Browsers require a gesture before audio starts. */
  unlock() {
    const ctx = this.ensure();
    if (ctx?.state === "suspended") void ctx.resume();
  }

  setLevel(bus: Bus, value: number) {
    this.levels[bus] = Math.max(0, Math.min(1, value));
    const node = this.buses.get(bus);
    if (node) node.gain.value = this.muted ? 0 : this.levels[bus];
  }
  level(bus: Bus) {
    return this.levels[bus];
  }
  setMuted(value: boolean) {
    this.muted = value;
    const master = this.buses.get("master");
    if (master) master.gain.value = value ? 0 : this.levels.master;
  }

  play(name: SfxName | UltimateSfx, delay = 0, into?: AudioNode) {
    const ctx = this.ensure();
    const voice =
      (VOICES as Record<string, Voice>)[name] ??
      (ULTIMATE_VOICES as Record<string, Voice>)[name] ??
      FOLDER_VOICES[name];
    if (!ctx || !voice || ctx.state !== "running") return;
    const now = ctx.currentTime + delay;
    // Identical sounds inside 40ms are one event, not eight.
    const last = this.lastAt.get(name) ?? -1;
    if (now - last < 0.04) return;
    this.lastAt.set(name, now);
    const bus = into ?? this.buses.get(voice.bus);
    if (!bus) return;
    try {
      voice.render(ctx, bus, now);
    } catch {
      // A sound must never be able to take the fight down.
    }
  }

  /**
   * A group of sounds that can be silenced together: an Ultimate's, so a skip
   * does not leave its tail ringing over the board it skipped to. Sounds
   * already scheduled keep their timing; the channel fades them out.
   */
  channel(): { play: (name: string) => void; stop: () => void } {
    const ctx = this.ensure();
    const sfx = this.buses.get("sfx");
    if (!ctx || !sfx) return { play: () => {}, stop: () => {} };
    const gain = ctx.createGain();
    gain.connect(sfx);
    let open = true;
    return {
      play: (name) => {
        if (open) this.play(name as SfxName, 0, gain);
      },
      stop: () => {
        if (!open) return;
        open = false;
        gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
        setTimeout(() => gain.disconnect(), 400);
      },
    };
  }

  /**
   * Build every buffer the named voices will need, into a muted graph, so the
   * first Ultimate a player sees does not stop to fill them.
   */
  prewarm(names: readonly string[]) {
    const ctx = this.ensure();
    if (!ctx) return;
    const silent = ctx.createGain();
    silent.gain.value = 0;
    for (const name of names) {
      const voice =
        (VOICES as Record<string, Voice>)[name] ??
        (ULTIMATE_VOICES as Record<string, Voice>)[name] ??
      FOLDER_VOICES[name];
      try {
        voice?.render(ctx, silent, ctx.currentTime);
      } catch {
        // Warming is best effort.
      }
    }
  }
}

export const mixer = new Mixer();
export const SFX_NAMES = Object.keys(VOICES) as SfxName[];
export type UltimateSfx = string;
/** Every Ultimate sound: the shared ones here, and each Ultimate's own. */
export const ULTIMATE_SFX = [
  ...Object.keys(ULTIMATE_VOICES),
  ...Object.keys(FOLDER_VOICES),
];
