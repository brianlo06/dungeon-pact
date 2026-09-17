import type { Cinematic, CinematicMode, Framing } from "../../shared/cinematic";
import type { UltimateSegment } from "./segments";
import { layout, type Timeline } from "./timeline";

/** The Battle Lab's switches. The game never sets any of them. */
export interface CinematicDebug {
  vfx: boolean;
  lighting: boolean;
  shake: boolean;
  bounds: boolean;
  anchors: boolean;
  stage: boolean;
  markers: boolean;
}

export const NO_DEBUG: CinematicDebug = {
  vfx: true,
  lighting: true,
  shake: true,
  bounds: false,
  anchors: false,
  stage: false,
  markers: false,
};

/**
 * One Ultimate being played: the timeline, when it started on the clock, and
 * the few things the director and the screen both touch while it runs.
 *
 * The director owns the timing — it fires the cues, reveals the results and
 * ends the run. The screen owns the pixels — it reads the clock and this
 * object each frame and writes transforms. Neither renders React per frame.
 */
export class CinematicRun {
  private static keys = 0;
  readonly key = ++CinematicRun.keys;
  readonly timeline: Timeline;
  /** Camera shake still to decay, in frame fractions. */
  shake = 0;
  /** The shot the director last entered. */
  shot = 0;
  /** The last timing marker passed, for the lab. */
  marker: string | null = null;
  /** Presentation time of the last cue fired, relative to `start`. */
  fired = -1;
  /** Which of the segment's beats have been shown, by index. */
  readonly revealed = new Set<number>();
  done = false;

  constructor(
    readonly segment: UltimateSegment,
    readonly cinematic: Cinematic,
    readonly mode: CinematicMode,
    readonly framing: Framing,
    /** Clock time the run started. */
    public start: number,
    readonly reduced = false,
  ) {
    this.timeline = layout(cinematic, mode, framing);
  }

  get duration() {
    return this.timeline.duration;
  }

  /** Milliseconds into the run at clock time `now`, clamped to its length. */
  at(now: number) {
    return Math.max(0, Math.min(this.duration, now - this.start));
  }
}
