/**
 * The synthesis primitives every sound in the game is built from: shaped
 * noise, a decaying tone, a filtered burst and a held swell. Kept apart from
 * the mixer so a sound can be written in its own file — an Ultimate's sounds
 * live beside that Ultimate — without importing the mixer that plays it.
 */

export interface Voice {
  bus: "music" | "sfx" | "ui" | "ambience";
  render: (ctx: AudioContext, out: AudioNode, at: number) => void;
}

/**
 * White noise is white noise: a buffer need not be generated afresh for every
 * hit. Filling one sample at a time on each impact put tens of thousands of
 * random numbers on the main thread at exactly the moment a replay lands its
 * blows. Buffers are made once per length, a few variants each, and handed out
 * in turn so a flurry of hits does not repeat one waveform.
 */
const NOISE_VARIANTS = 3;
const noiseCache = new WeakMap<BaseAudioContext, Map<number, AudioBuffer[]>>();
let noiseTurn = 0;

/** Shaped noise: the backbone of impacts, chains and steam. */
export function noise(ctx: AudioContext, seconds: number) {
  // Lengths are bucketed to 50ms so a handful of buffers covers every sound.
  const frames = Math.max(
    1,
    Math.ceil((ctx.sampleRate * Math.ceil(seconds * 20)) / 20),
  );
  let byLength = noiseCache.get(ctx);
  if (!byLength) noiseCache.set(ctx, (byLength = new Map()));
  let variants = byLength.get(frames);
  if (!variants) {
    variants = Array.from({ length: NOISE_VARIANTS }, () => {
      const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
      return buffer;
    });
    byLength.set(frames, variants);
  }
  const source = ctx.createBufferSource();
  source.buffer = variants[noiseTurn++ % NOISE_VARIANTS];
  return source;
}

/** One decaying envelope, the shape almost every percussive sound wants. */
export function hit(
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
export function crash(
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

/** A note, by MIDI pitch. */
export const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

/** A held, swelling tone with a soft attack: brass, or a choir of iron. */
export function swell(
  ctx: AudioContext,
  out: AudioNode,
  at: number,
  {
    type = "sawtooth" as OscillatorType,
    freq,
    gain = 0.1,
    attack = 0.12,
    hold = 0.3,
    release = 0.5,
    cutoff = 1400,
    detune = 0,
  }: {
    type?: OscillatorType;
    freq: number;
    gain?: number;
    attack?: number;
    hold?: number;
    release?: number;
    cutoff?: number;
    detune?: number;
  },
) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  osc.detune.value = detune;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(cutoff * 0.4, at);
  filter.frequency.exponentialRampToValueAtTime(cutoff, at + attack + hold * 0.5);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + attack);
  amp.gain.setValueAtTime(gain, at + attack + hold);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + attack + hold + release);
  osc.connect(filter).connect(amp).connect(out);
  osc.start(at);
  osc.stop(at + attack + hold + release + 0.05);
}

