import { useEffect, useMemo } from "react";
import { tempo } from "./tempo";

/**
 * The presentation clock.
 *
 * Everything the stage does over time during a replay — actors crossing the
 * floor, rig clips, projectiles in flight, impacts, numbers, the camera, hit
 * stop, sound — reads one clock. Its time is presentation milliseconds: a clip
 * authored as 620ms lasts 620 of them whatever the playback speed, and the
 * speed control, the capture tempo and the pause button only change how fast
 * that time passes. A strike and the hit it causes are scheduled on the same
 * clock, so they cannot drift apart at any speed; that is the whole fix for
 * hits that used to land before their strikes at 2×, when the beats were
 * scaled by the speed control and the animators were not.
 *
 * Nothing here is gameplay. The engine resolved the round before any of this
 * started, and a clock that never ticked would leave the board correct.
 */
export class PresentationClock {
  /** Presentation milliseconds elapsed. Only ever moves forward. */
  time = 0;
  /** Replay speed: 0.5×, 1×, 2×. Outside a replay the stage runs at 1×. */
  speed = 1;
  /** Capture tempo, read from the document (see `tempo.ts`). */
  tempo = 1;
  paused = false;
  /**
   * Hit-stop still to run, in presentation milliseconds. While it lasts the
   * clock does not advance — the whole scene holds on the blow — but the
   * camera's own motion (the shake) goes on, which is what sells the stop.
   */
  private held = 0;
  /** A step requested while paused, in presentation milliseconds. */
  private pending = 0;

  /** How many presentation milliseconds pass per real one right now. */
  get rate() {
    return this.paused ? 0 : this.speed * this.tempo;
  }

  /** Hold everything still for a hit-stop. Overlapping stops do not add up. */
  hold(ms: number) {
    this.held = Math.max(this.held, ms);
  }

  /** Whether a hit-stop is holding the scene. */
  get frozen() {
    return this.held > 0;
  }

  /** Advance by exactly this much presentation time, even while paused. */
  step(ms: number) {
    this.pending += Math.max(0, ms);
  }

  /**
   * Advance by one frame of real time. Returns how far presentation time
   * moved (`dt`) and how far the scene's free motion may move (`free`) —
   * the same, except during a hit-stop, when `dt` is zero.
   */
  advance(realMs: number): { dt: number; free: number } {
    const real = Math.max(0, Math.min(realMs, 250));
    let free = real * this.rate;
    if (this.pending) {
      free += this.pending;
      this.pending = 0;
      // A step is a deliberate jump; it is never swallowed by a hit-stop.
      this.held = 0;
    }
    let dt = free;
    if (this.held > 0) {
      const used = Math.min(this.held, dt);
      this.held -= used;
      dt -= used;
    }
    this.time += dt;
    return { dt, free };
  }
}

export type FrameTask = (frame: {
  /** Presentation time after this frame's advance. */
  time: number;
  dt: number;
  free: number;
  /** Real `performance.now()`, for anything that must not stop. */
  real: number;
}) => void;

/**
 * One animation frame loop for the whole stage, running its tasks in a fixed
 * order: the clock advances, then the director fires what is due, then the
 * choreography writes where everyone stands, then the animators pose them,
 * then the camera frames the result. Separate loops ran in whatever order
 * they were registered, so a clip asked for this frame could be drawn next.
 */
export class FrameLoop {
  readonly clock = new PresentationClock();
  private tasks: { order: number; run: FrameTask }[] = [];
  private raf = 0;
  private last = 0;

  add(order: number, run: FrameTask) {
    const task = { order, run };
    this.tasks = [...this.tasks, task].sort((a, b) => a.order - b.order);
    this.start();
    return () => {
      this.tasks = this.tasks.filter((t) => t !== task);
      if (!this.tasks.length) this.stop();
    };
  }

  /** Run one frame now, as if `realMs` of real time had passed. For tests. */
  frame(realMs: number, real = this.last + realMs) {
    this.clock.tempo = tempo();
    const { dt, free } = this.clock.advance(realMs);
    this.last = real;
    for (const t of this.tasks) t.run({ time: this.clock.time, dt, free, real });
  }

  private start() {
    if (this.raf || typeof requestAnimationFrame === "undefined") return;
    this.last = performance.now();
    const tick = (now: number) => {
      this.frame(now - this.last, now);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
}

/** Frame-loop order. Lower runs first. */
export const ORDER = {
  director: 10,
  choreography: 20,
  animators: 30,
  projectiles: 40,
  camera: 50,
} as const;

/** The stage's one loop, for as long as the stage is mounted. */
export function useFrameLoop(): FrameLoop {
  const loop = useMemo(() => new FrameLoop(), []);
  useEffect(() => () => loop.stop(), [loop]);
  return loop;
}
