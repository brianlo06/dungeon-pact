import type { ClipName } from "../../shared/presentation";

/**
 * The animation player.
 *
 * A combatant is told `play("attack")` and does not care how that is
 * implemented. Two implementations exist behind one interface:
 *
 *  - **rigs**, which key transforms over time. These work today, with no
 *    artwork at all, and are how bosses will keep working later: a cutout rig
 *    gives weight that would otherwise cost dozens of hand-drawn frames.
 *  - **sheets**, which step through frames of a strip. Nothing uses one yet;
 *    the path exists so the first real sprite sheet is a content change rather
 *    than an engineering project.
 *
 * Nothing here re-renders React. The player writes transforms straight to the
 * node, driven by one shared clock, because sixty React renders a second to
 * move a sprite is the cost this whole design exists to avoid.
 */

/** One keyed pose. Missing fields hold their previous value. */
export interface Pose {
  /** Fraction of the clip, 0…1. */
  at: number;
  /** Horizontal offset in multiples of the unit's own width. */
  x?: number;
  /** Vertical offset; negative is up. */
  y?: number;
  scale?: number;
  /** Degrees. Kept small: this is weight, not cartwheeling. */
  rotate?: number;
  /** Squash and stretch, as a multiplier on width. */
  squash?: number;
  /** 0…1, multiplied into the sprite's own brightness. */
  flash?: number;
}

export interface Clip {
  poses: Pose[];
  /** Milliseconds for one pass. */
  duration: number;
  loop?: boolean;
  /** A looping clip that may be cut off mid-way by anything else. */
  interruptible?: boolean;
}

export type Rig = Partial<Record<ClipName, Clip>>;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Sample a clip at a fraction of its length. */
export function sample(clip: Clip, t: number): Required<Omit<Pose, "at">> {
  const base = { x: 0, y: 0, scale: 1, rotate: 0, squash: 1, flash: 0 };
  const poses = clip.poses;
  if (!poses.length) return base;
  let a = poses[0];
  let b = poses[poses.length - 1];
  for (let i = 0; i < poses.length - 1; i++) {
    if (t >= poses[i].at && t <= poses[i + 1].at) {
      a = poses[i];
      b = poses[i + 1];
      break;
    }
  }
  const span = b.at - a.at;
  const k = span <= 0 ? 0 : (t - a.at) / span;
  // Ease each segment so poses settle rather than sliding linearly.
  const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
  const pick = (key: keyof Omit<Pose, "at">) =>
    lerp(a[key] ?? base[key], b[key] ?? base[key], e);
  return {
    x: pick("x"),
    y: pick("y"),
    scale: pick("scale"),
    rotate: pick("rotate"),
    squash: pick("squash"),
    flash: pick("flash"),
  };
}

export function poseToTransform(p: Required<Omit<Pose, "at">>) {
  return (
    `translate(${(p.x * 100).toFixed(2)}%, ${(p.y * 100).toFixed(2)}%) ` +
    `rotate(${p.rotate.toFixed(2)}deg) ` +
    `scale(${(p.scale * p.squash).toFixed(4)}, ${(p.scale / p.squash).toFixed(4)})`
  );
}

interface Playing {
  clip: Clip;
  name: ClipName;
  start: number;
  /** Where to go when a one-shot finishes. */
  then: ClipName;
}

/**
 * One combatant's animation state. Created per unit, ticked by the stage's
 * shared loop, and disposed with the element.
 */
export class Animator {
  private node: HTMLElement | null = null;
  private playing: Playing | null = null;
  private rig: Rig;
  /** Every unit starts its idle at a different point so no line breathes in sync. */
  private phase: number;
  private speed = 1;

  constructor(rig: Rig, phase = Math.random()) {
    this.rig = rig;
    this.phase = phase;
    this.play("idle");
  }

  attach(node: HTMLElement | null) {
    this.node = node;
  }
  setRig(rig: Rig) {
    this.rig = rig;
  }
  setSpeed(n: number) {
    this.speed = Math.max(0.05, n);
  }

  /**
   * Ask for a clip. A missing clip falls back to a generic one rather than
   * throwing, so content can be upgraded a clip at a time and a typo never
   * takes the fight down.
   */
  play(name: ClipName, then: ClipName = "idle") {
    const clip = this.rig[name] ?? GENERIC[name] ?? GENERIC.idle!;
    const current = this.playing;
    // A one-shot in progress is not interrupted by an idle request.
    if (
      current &&
      !current.clip.loop &&
      name === "idle" &&
      performance.now() - current.start < current.clip.duration
    )
      return;
    this.playing = {
      clip,
      name,
      start: performance.now(),
      then,
    };
  }

  get current(): ClipName | null {
    return this.playing?.name ?? null;
  }

  /** Advance and write. Returns the sampled pose so callers can read flash. */
  tick(now: number): Required<Omit<Pose, "at">> {
    const state = this.playing;
    if (!state) return sample(GENERIC.idle!, 0);
    const length = state.clip.duration / this.speed;
    let t = (now - state.start) / length;
    if (state.clip.loop) t = (((t + this.phase) % 1) + 1) % 1;
    else if (t >= 1) {
      t = 1;
      // One-shots hand back to whatever should follow them.
      if (state.then !== state.name) {
        this.play(state.then);
        return this.tick(now);
      }
    }
    const pose = sample(state.clip, Math.max(0, Math.min(1, t)));
    if (this.node) {
      this.node.style.transform = poseToTransform(pose);
      this.node.style.filter = pose.flash
        ? `brightness(${(1 + pose.flash * 1.6).toFixed(2)}) saturate(${(1 + pose.flash).toFixed(2)})`
        : "";
    }
    return pose;
  }

  dispose() {
    this.playing = null;
    this.node = null;
  }
}

/**
 * The fallback rig. Every clip a unit does not define resolves to one of these,
 * which is what lets a creature with no animation at all still anticipate,
 * recoil and fall over rather than sliding around rigidly.
 */
export const GENERIC: Rig = {
  idle: {
    duration: 3400,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.5, y: -0.018, squash: 0.99 },
      { at: 1, y: 0, squash: 1 },
    ],
  },
  anticipate: {
    duration: 200,
    poses: [
      { at: 0, x: 0 },
      { at: 1, x: -0.09, squash: 1.05, rotate: -3 },
    ],
  },
  attack: {
    duration: 460,
    poses: [
      { at: 0, x: 0, rotate: 0 },
      // Anticipation: pull back before going forward. Without this a strike
      // reads as a teleport, however fast the rest of it is.
      { at: 0.3, x: -0.1, rotate: -4, squash: 1.06 },
      { at: 0.45, x: 0.22, rotate: 6, squash: 0.9, scale: 1.05 },
      { at: 0.62, x: 0.16, rotate: 3 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1 },
    ],
  },
  cast: {
    duration: 560,
    poses: [
      { at: 0, y: 0, scale: 1 },
      { at: 0.35, y: -0.05, scale: 1.04, flash: 0.2 },
      { at: 0.6, y: -0.03, scale: 1.02, flash: 0.35 },
      { at: 1, y: 0, scale: 1, flash: 0 },
    ],
  },
  hurt: {
    duration: 340,
    poses: [
      { at: 0, x: 0, flash: 0.8 },
      { at: 0.18, x: 0.1, rotate: 5, squash: 0.92, flash: 0.5 },
      { at: 0.5, x: -0.03, rotate: -2 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
  },
  block: {
    duration: 520,
    poses: [
      { at: 0, x: 0 },
      { at: 0.25, x: -0.04, squash: 1.1, scale: 1.03 },
      { at: 0.55, x: 0.05, squash: 0.95 },
      { at: 1, x: 0, squash: 1, scale: 1 },
    ],
  },
  down: {
    duration: 520,
    poses: [
      { at: 0, rotate: 0, y: 0 },
      { at: 0.4, rotate: -12, y: 0.02 },
      { at: 1, rotate: -68, y: 0.12, squash: 1.15 },
    ],
  },
  revive: {
    duration: 640,
    poses: [
      { at: 0, rotate: -68, y: 0.12, squash: 1.15 },
      { at: 0.55, rotate: 8, y: -0.04, flash: 0.6 },
      { at: 1, rotate: 0, y: 0, squash: 1, flash: 0 },
    ],
  },
  windup: {
    duration: 900,
    loop: true,
    poses: [
      { at: 0, scale: 1, flash: 0 },
      { at: 0.5, scale: 1.05, flash: 0.25, y: -0.02 },
      { at: 1, scale: 1, flash: 0 },
    ],
  },
  defeat: {
    duration: 700,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.3, rotate: 10, y: -0.04, flash: 0.6 },
      { at: 1, rotate: -80, y: 0.16, scale: 0.94, flash: 0 },
    ],
  },
};
