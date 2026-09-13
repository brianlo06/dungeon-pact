import type { SfxName } from "../../shared/presentation";

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

interface Voice {
  bus: Exclude<Bus, "master">;
  render: (ctx: AudioContext, out: AudioNode, at: number) => void;
}

/** Shaped noise: the backbone of impacts, chains and steam. */
function noise(ctx: AudioContext, seconds: number) {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

/** One decaying envelope, the shape almost every percussive sound wants. */
function hit(
  ctx: AudioContext,
  out: AudioNode,
  at: number,
  {
    type = "sine" as OscillatorType,
    from,
    to,
    gain = 0.5,
    attack = 0.004,
    decay = 0.18,
  }: {
    type?: OscillatorType;
    from: number;
    to?: number;
    gain?: number;
    attack?: number;
    decay?: number;
  },
) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  if (to !== undefined)
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), at + decay);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  osc.connect(amp).connect(out);
  osc.start(at);
  osc.stop(at + decay + 0.02);
}

/** A filtered noise burst: metal, stone, steam, breakage. */
function crash(
  ctx: AudioContext,
  out: AudioNode,
  at: number,
  {
    seconds = 0.22,
    gain = 0.4,
    type = "bandpass" as BiquadFilterType,
    freq = 1800,
    q = 1.2,
    sweepTo,
  }: {
    seconds?: number;
    gain?: number;
    type?: BiquadFilterType;
    freq?: number;
    q?: number;
    sweepTo?: number;
  },
) {
  const source = noise(ctx, seconds);
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, at);
  if (sweepTo)
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(60, sweepTo),
      at + seconds,
    );
  filter.Q.value = q;
  amp.gain.setValueAtTime(gain, at);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
  source.connect(filter).connect(amp).connect(out);
  source.start(at);
  source.stop(at + seconds + 0.02);
}

/**
 * The palette. Each entry is one recognisable sound, built from the two
 * primitives above. The Collector's family is deliberately low and mechanical;
 * the Strongbox's is locks and iron; the Vanguard's is armour and impact.
 */
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
  private lastAt = new Map<SfxName, number>();

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

  play(name: SfxName, delay = 0) {
    const ctx = this.ensure();
    const voice = VOICES[name];
    if (!ctx || !voice || ctx.state !== "running") return;
    const now = ctx.currentTime + delay;
    // Identical sounds inside 40ms are one event, not eight.
    const last = this.lastAt.get(name) ?? -1;
    if (now - last < 0.04) return;
    this.lastAt.set(name, now);
    const bus = this.buses.get(voice.bus);
    if (!bus) return;
    try {
      voice.render(ctx, bus, now);
    } catch {
      // A sound must never be able to take the fight down.
    }
  }
}

export const mixer = new Mixer();
export const SFX_NAMES = Object.keys(VOICES) as SfxName[];
