/**
 * A trace of what a replay did and when, for the Battle Lab and the browser
 * tests. Development only: nothing in the game installs a tracer, and every
 * emitter is a single `if (tracer)` when none is installed.
 *
 * Times are presentation-clock milliseconds (see `clock.ts`), taken in the
 * frame the thing happened in — not the time it was scheduled for — so a
 * trace can show that a hit was never shown before the blow or the arrow that
 * caused it, at any playback speed.
 */
export type TraceKind =
  /** A round's replay began. `detail` is its planned duration. */
  | "round"
  /** The replay finished, or was skipped. */
  | "end"
  | "skip"
  /** An actor entered a choreography phase. */
  | "phase"
  /**
   * A rig passed a marker of the clip it is drawing: a strike's `contact`
   * (the weapon meeting the target) or a shot's `release`.
   */
  | "contact"
  | "release"
  /** A projectile left, and reached its target. */
  | "spawn"
  | "arrive"
  /**
   * The director presented a beat: the number, the health change, the
   * target's reaction, the effect, the hit-stop and the sound, all at once.
   */
  | "beat";

export interface TraceEvent {
  kind: TraceKind;
  /** Presentation-clock time of the frame it happened in. */
  t: number;
  /** When it was scheduled for, where that differs from `t`. */
  due?: number;
  unit?: string;
  /** The other unit: a projectile's target, a beat's target. */
  to?: string;
  /** A phase name, a clip name, a beat kind. */
  name?: string;
  amount?: number;
  /** A beat's health after it. */
  hp?: number;
  /** Stage pixels, for a projectile's position on arrival. */
  x?: number;
  y?: number;
  /** For a beat: the actor of the move that shows it. Otherwise free text. */
  detail?: string;
}

export type Tracer = (e: TraceEvent) => void;
