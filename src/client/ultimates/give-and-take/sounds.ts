import { crash, hit, hz, swell, type Voice } from "../../audio/synth";

/**
 * Give and Take's sounds. Steel, linen, wind over a down, and one sound that
 * is this film's alone: **the edge drawn**, a palm drawn along a blade, a steel
 * whisper whose pitch climbs as it goes out; and its answer in the take, the
 * same whisper falling as the blood comes back.
 *
 * No drum and no heartbeat (Red Ledger), no mallet, leather or swallow (A Good
 * Hiding), no horn, bell, music box, marimba, chime, reed, pipe or voice. The
 * motif is a bowed saw, a blade made to sing, over a low bowed drone: E4, B♭4,
 * E4, then E3 under it. Out a tritone and back: a tune that runs both ways.
 */

/** A bowed saw: a sine with a slow swell, a scoop up into the note and a wide, slow vibrato. */
function saw(c: AudioContext, o: AudioNode, t: number, midi: number, gain = 0.1, seconds = 0.4) {
  const f = hz(midi);
  const osc = c.createOscillator();
  const lfo = c.createOscillator();
  const depth = c.createGain();
  const amp = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(f * 0.94, t);
  osc.frequency.exponentialRampToValueAtTime(f, t + 0.09);
  lfo.frequency.value = 5.2;
  depth.gain.value = f * 0.012;
  lfo.connect(depth).connect(osc.frequency);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.08);
  amp.gain.setValueAtTime(gain, t + seconds * 0.6);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(amp).connect(o);
  osc.start(t);
  lfo.start(t);
  osc.stop(t + seconds + 0.02);
  lfo.stop(t + seconds + 0.02);
  // The saw's metallic edge: a faint octave and a breath of bow noise.
  hit(c, o, t + 0.02, { type: "sine", from: f * 2, to: f * 2, gain: gain * 0.12, attack: 0.08, decay: seconds * 0.8 });
  crash(c, o, t, { seconds: seconds * 0.7, gain: gain * 0.25, freq: f * 3, q: 6 });
}

/** A palm drawn along a blade: steel whisper, the pitch rising (out) or falling (back). */
function drawn(c: AudioContext, o: AudioNode, t: number, seconds: number, rising: boolean, gain = 0.3) {
  const lo = 1700;
  const hi = 5200;
  crash(c, o, t, { seconds, gain, freq: rising ? lo : hi, sweepTo: rising ? hi : lo, q: 9 });
  crash(c, o, t + 0.01, { seconds: seconds * 0.9, gain: gain * 0.45, freq: rising ? lo * 1.5 : hi * 0.8, sweepTo: rising ? hi * 1.2 : lo * 0.8, q: 14 });
  crash(c, o, t, { seconds: seconds * 0.8, gain: gain * 0.2, type: "lowpass", freq: 500, q: 0.7 });
}

/** Wind over a bare down: a low, moving hiss. */
function wind(c: AudioContext, o: AudioNode, t: number, seconds: number, gain = 0.06) {
  crash(c, o, t, { seconds, gain, freq: 420, sweepTo: 700, q: 0.8 });
  crash(c, o, t + seconds * 0.3, { seconds: seconds * 0.7, gain: gain * 0.6, freq: 900, sweepTo: 520, q: 2.5 });
}

/** A wooden post straining on its pin. */
function creak(c: AudioContext, o: AudioNode, t: number, gain = 0.05) {
  for (let i = 0; i < 6; i++)
    crash(c, o, t + i * 0.045 + (i % 2) * 0.008, { seconds: 0.05, gain: gain * (0.7 + (i % 3) * 0.2), freq: 300 + i * 22, q: 11 });
}

export const voices: Record<string, Voice> = {
  /** The call: the blade brought up, and the fist laid on it — a ring the hand damps. */
  "give-ring": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t + 0.05, { seconds: 0.24, gain: 0.2, freq: 1300, sweepTo: 2600, q: 3 });
      hit(c, o, t + 0.3, { type: "triangle", from: 740, to: 736, gain: 0.12, attack: 0.002, decay: 0.26 });
      hit(c, o, t + 0.3, { type: "sine", from: 1860, to: 1850, gain: 0.05, attack: 0.002, decay: 0.2 });
      crash(c, o, t + 0.3, { seconds: 0.05, gain: 0.18, type: "lowpass", freq: 600, q: 0.8 });
    },
  },
  /**
   * The oath, in FULL: linen coming off, the palm laid on steel, and the edge
   * drawn. The draw starts 180ms into the clip, whichever cut this is.
   */
  "give-oath": {
    bus: "sfx",
    render: (c, o, t) => {
      for (let i = 0; i < 5; i++)
        crash(c, o, t + i * 0.03, { seconds: 0.05, gain: 0.05, type: "highpass", freq: 1800 + i * 200, q: 0.6 });
      hit(c, o, t + 0.12, { type: "triangle", from: 520, to: 516, gain: 0.08, attack: 0.002, decay: 0.12 });
      crash(c, o, t + 0.12, { seconds: 0.04, gain: 0.16, type: "lowpass", freq: 400, q: 0.8 });
      drawn(c, o, t + 0.17, 0.28, true, 0.3);
    },
  },
  /** The motif: E4, B♭4, E4, and E3 under — out and back. */
  "give-motif": {
    bus: "sfx",
    render: (c, o, t) => {
      swell(c, o, t, { type: "sawtooth", freq: hz(40), gain: 0.03, attack: 0.2, hold: 0.5, release: 0.4, cutoff: 300 });
      saw(c, o, t + 0.02, 64, 0.1, 0.3);
      saw(c, o, t + 0.28, 70, 0.11, 0.3);
      saw(c, o, t + 0.54, 64, 0.1, 0.5);
      saw(c, o, t + 0.54, 52, 0.07, 0.6);
    },
  },
  /** The crossroads: wind over the down. */
  "give-wind": {
    bus: "sfx",
    render: (c, o, t) => wind(c, o, t, 0.9, 0.06),
  },
  /** The quiet: the wind cut off, one creak of the fingerpost, and nothing. */
  "give-hush": {
    bus: "sfx",
    render: (c, o, t) => {
      creak(c, o, t + 0.12, 0.05);
      hit(c, o, t + 0.1, { type: "sine", from: hz(76), to: hz(76), gain: 0.012, attack: 0.1, decay: 0.4 });
    },
  },
  /**
   * The give, in layers: a cleaver's crack (transient), a sub that falls away,
   * the blade's ring and a wet thock (body), and the wind rushing back in over
   * the down (tail).
   */
  "give-impact": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.03, gain: 0.85, type: "highpass", freq: 2600, q: 0.6 });
      hit(c, o, t, { type: "sine", from: 120, to: 26, gain: 0.8, attack: 0.002, decay: 0.8 });
      hit(c, o, t + 0.004, { type: "triangle", from: 230, to: 90, gain: 0.42, decay: 0.16 });
      crash(c, o, t + 0.003, { seconds: 0.1, gain: 0.5, type: "lowpass", freq: 700, sweepTo: 160, q: 1 });
      hit(c, o, t + 0.01, { type: "triangle", from: 988, to: 980, gain: 0.08, attack: 0.002, decay: 0.7 });
      hit(c, o, t + 0.01, { type: "sine", from: 2480, to: 2470, gain: 0.03, attack: 0.002, decay: 0.5 });
      crash(c, o, t + 0.06, { seconds: 0.9, gain: 0.12, freq: 380, sweepTo: 900, q: 0.7 });
      crash(c, o, t + 0.02, { seconds: 1.0, gain: 0.2, type: "lowpass", freq: 220, sweepTo: 45, q: 0.4 });
    },
  },
  /** The take: the edge drawn again, falling — the blood coming back — and a long breath in. */
  "give-take": {
    bus: "sfx",
    render: (c, o, t) => {
      drawn(c, o, t + 0.06, 0.34, false, 0.26);
      crash(c, o, t + 0.2, { seconds: 0.4, gain: 0.07, type: "bandpass", freq: 520, sweepTo: 900, q: 0.7 });
      saw(c, o, t + 0.36, 70, 0.04, 0.3);
    },
  },
  /** On the board: the blade let down on chalk, and the motif's last two notes, soft. */
  "give-settle": {
    bus: "sfx",
    render: (c, o, t) => {
      crash(c, o, t, { seconds: 0.09, gain: 0.22, freq: 1700, q: 3 });
      hit(c, o, t, { type: "sine", from: 140, to: 60, gain: 0.22, decay: 0.16 });
      saw(c, o, t + 0.2, 70, 0.05, 0.28);
      saw(c, o, t + 0.44, 64, 0.06, 0.55);
    },
  },
};
