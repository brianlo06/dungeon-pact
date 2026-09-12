export type ScoreId =
  "foundry" | "cistern" | "archive" | "battle" | "boss" | "auction" | "victory";
/** Original eight-bar motifs, MIDI pitches; -1 is a rest. No downloaded samples. */
export const scores: Record<
  ScoreId,
  { bpm: number; bass: number[]; melody: number[] }
> = {
  foundry: {
    bpm: 84,
    bass: [38, 38, 34, 36, 38, 41, 36, 33],
    melody: [62, -1, 65, 69, 67, -1, 65, 62, 60, -1, 62, 65, 64, 60, 57, -1],
  },
  cistern: {
    bpm: 68,
    bass: [40, 36, 43, 38, 40, 36, 35, 38],
    melody: [64, -1, 71, 66, -1, 67, 62, -1, 64, 67, -1, 71, 69, -1, 66, 62],
  },
  archive: {
    bpm: 76,
    bass: [45, 41, 40, 43, 45, 41, 38, 40],
    melody: [69, 68, -1, 64, 65, -1, 72, 71, 69, -1, 65, 64, 62, 64, 68, -1],
  },
  battle: {
    bpm: 116,
    bass: [38, 38, 41, 36, 38, 34, 36, 33],
    melody: [62, 69, 65, 62, 67, 65, 60, 64, 62, 69, 74, 72, 69, 65, 64, 61],
  },
  boss: {
    bpm: 126,
    bass: [33, 34, 33, 38, 33, 41, 34, 33],
    melody: [57, 58, 64, -1, 65, 64, 58, 57, 69, 70, 64, 65, 62, 58, 57, -1],
  },
  auction: {
    bpm: 94,
    bass: [45, 40, 43, 38, 41, 40, 38, 40],
    melody: [69, -1, 72, 76, -1, 71, 67, 74, 65, 69, -1, 72, 68, -1, 71, 64],
  },
  victory: {
    bpm: 88,
    bass: [38, 43, 45, 38, 41, 43, 45, 38],
    melody: [62, 66, 69, -1, 74, 73, 69, 66, 67, 71, 74, -1, 76, 74, 69, 62],
  },
};
export function selectScore(
  scene: string,
  biome = "foundry",
  boss = false,
): ScoreId {
  if (scene === "COMBAT") return boss ? "boss" : "battle";
  if (scene === "AUCTION" || scene === "SHOP") return "auction";
  if (scene === "COMPLETE") return "victory";
  return biome === "cistern" || biome === "archive" ? biome : "foundry";
}
export function scoreNotes(id: ScoreId, step: number) {
  const score = scores[id],
    bar = Math.floor(step / 8) % 8;
  const notes: {
    pitch: number;
    duration: number;
    gain: number;
    type: OscillatorType;
  }[] = [];
  const beat = 60 / score.bpm;
  if (step % 8 === 0)
    notes.push({
      pitch: score.bass[bar],
      duration: beat * 3.6,
      gain: 0.09,
      type: "triangle",
    });
  if (step % 2 === 0) {
    const pitch = score.melody[Math.floor(step / 2) % score.melody.length];
    if (pitch >= 0)
      notes.push({ pitch, duration: beat * 0.8, gain: 0.07, type: "sine" });
  }
  if (step % 4 === 2)
    notes.push({
      pitch: score.bass[bar] + 19,
      duration: beat * 0.7,
      gain: 0.025,
      type: "triangle",
    });
  if ((id === "battle" || id === "boss") && step % 2 === 0)
    notes.push({
      pitch: step % 4 === 0 ? 26 : 38,
      duration: 0.09,
      gain: 0.12,
      type: "triangle",
    });
  return notes;
}

/** A short lookahead schedules against audio time, never animation/replay time. */
export class ScorePlayer {
  private bus: GainNode;
  private timer?: ReturnType<typeof setInterval>;
  private voices = new Set<OscillatorNode>();
  private id: ScoreId = "foundry";
  private step = 0;
  private next = 0;
  constructor(private ctx: AudioContext) {
    this.bus = ctx.createGain();
    this.bus.gain.value = 0;
    this.bus.connect(ctx.destination);
  }
  set(id: ScoreId, volume: number, active: boolean) {
    this.bus.gain.setTargetAtTime(
      active ? volume : 0,
      this.ctx.currentTime,
      0.08,
    );
    if (!active || this.id !== id) this.stop();
    this.id = id;
    if (!active || this.timer) return;
    this.step = 0;
    this.next = this.ctx.currentTime + 0.04;
    this.tick();
    this.timer = setInterval(() => this.tick(), 80);
  }
  private tick() {
    // Returning from a suspended context must not schedule a backlog.
    if (this.next < this.ctx.currentTime - 0.2)
      this.next = this.ctx.currentTime + 0.04;
    while (this.next < this.ctx.currentTime + 0.16) {
      for (const note of scoreNotes(this.id, this.step)) {
        const osc = this.ctx.createOscillator(),
          gain = this.ctx.createGain();
        osc.type = note.type;
        osc.frequency.value = 440 * 2 ** ((note.pitch - 69) / 12);
        gain.gain.setValueAtTime(0, this.next);
        gain.gain.linearRampToValueAtTime(note.gain, this.next + 0.015);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          this.next + note.duration,
        );
        osc.connect(gain).connect(this.bus);
        this.voices.add(osc);
        osc.onended = () => {
          this.voices.delete(osc);
          osc.disconnect();
          gain.disconnect();
        };
        osc.start(this.next);
        osc.stop(this.next + note.duration + 0.02);
      }
      this.step = (this.step + 1) % 64;
      this.next += 30 / scores[this.id].bpm;
    }
  }
  private stop() {
    clearInterval(this.timer);
    this.timer = undefined;
    for (const osc of this.voices) osc.stop();
    this.voices.clear();
  }
}
