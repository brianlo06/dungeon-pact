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
  /**
   * Per-part tracks, for cutout rigs. The root track moves the whole figure;
   * these move named pieces of it independently — a key-arm swinging through a
   * strike, chains lagging behind the body, a ledger swinging on its chain.
   * This is the half of the animation system that gives a boss weight without
   * anybody drawing a frame.
   */
  parts?: Record<string, Pose[]>;
  /** Milliseconds for one pass. */
  duration: number;
  loop?: boolean;
  /** A looping clip that may be cut off mid-way by anything else. */
  interruptible?: boolean;
}

export type Rig = Partial<Record<ClipName, Clip>>;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Sample a track of poses at a fraction of its length. */
export function sampleTrack(
  poses: Pose[],
  t: number,
): Required<Omit<Pose, "at">> {
  const base = { x: 0, y: 0, scale: 1, rotate: 0, squash: 1, flash: 0 };
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

/** Sample a clip's root track. */
export function sample(clip: Clip, t: number) {
  return sampleTrack(clip.poses, t);
}

export function poseToTransform(p: Required<Omit<Pose, "at">>) {
  return (
    `translate(${(p.x * 100).toFixed(2)}%, ${(p.y * 100).toFixed(2)}%) ` +
    `rotate(${p.rotate.toFixed(2)}deg) ` +
    `scale(${(p.scale * p.squash).toFixed(4)}, ${(p.scale / p.squash).toFixed(4)})`
  );
}

type Sampled = Required<Omit<Pose, "at">>;
const REST: Sampled = { x: 0, y: 0, scale: 1, rotate: 0, squash: 1, flash: 0 };

interface Playing {
  clip: Clip;
  name: ClipName;
  start: number;
  /**
   * Where to go when a one-shot finishes. Null means the unit's rest clip,
   * resolved when the one-shot ends rather than when it began, so a flinch
   * taken mid-windup goes back to the held windup — and one taken after the
   * windup was spent goes back to idle.
   */
  then: ClipName | null;
}

/**
 * How long a change of clip eases over, in unscaled milliseconds.
 *
 * A clip starts wherever its first pose is, so without this a figure jumps
 * whenever the new clip does not begin where the old one left it — most
 * visibly when a boss raises its key into a held windup, which would otherwise
 * snap up in one frame. Entering a loop takes its time; entering a one-shot
 * takes a fraction of it, so a flinch still lands on the frame it was asked
 * for. Flash is never eased: a hit is bright at once.
 */
const BLEND_INTO_LOOP = 260;
const BLEND_INTO_ONESHOT = 120;
const blendFor = (clip: Clip) =>
  clip.loop
    ? BLEND_INTO_LOOP
    : Math.min(BLEND_INTO_ONESHOT, clip.duration * 0.2);

interface Blend {
  root: Sampled;
  parts: Map<string, Sampled>;
  start: number;
  length: number;
}

const mix = (a: Sampled, b: Sampled, k: number): Sampled => ({
  x: lerp(a.x, b.x, k),
  y: lerp(a.y, b.y, k),
  scale: lerp(a.scale, b.scale, k),
  rotate: lerp(a.rotate, b.rotate, k),
  squash: lerp(a.squash, b.squash, k),
  flash: b.flash,
});

/**
 * One combatant's animation state. Created per unit, ticked by the stage's
 * shared loop, and disposed with the element.
 */
export class Animator {
  private node: HTMLElement | null = null;
  private parts = new Map<string, SVGElement | HTMLElement>();
  private playing: Playing | null = null;
  private rig: Rig;
  /** Every unit starts its idle at a different point so no line breathes in sync. */
  private phase: number;
  private speed = 1;
  /**
   * The loop this unit returns to between actions: `idle`, or a held
   * `windup` while it has an interruptible move announced. Stored as asked
   * for and resolved against the rig on use, because a rig can arrive after
   * the request does.
   */
  private rest: ClipName = "idle";
  /** The last pose written, so a change of clip can ease out of it. */
  private last: { root: Sampled; parts: Map<string, Sampled> } | null = null;
  private blend: Blend | null = null;

  constructor(rig: Rig, phase = Math.random()) {
    this.rig = rig;
    this.phase = phase;
    this.play("idle");
  }

  /**
   * What a request for a clip actually plays on this rig.
   *
   * Most missing clips fall back to the generic rig. Two do not. A `windup`
   * is authored or it does not exist: the generic one is a pulse, and every
   * ordinary enemy pulsing whenever it announced a wind-up would be noise, so
   * a creature without one keeps its idle. A `signature` without one is the
   * creature's ordinary `attack` — its own strike, not the generic lunge.
   */
  private resolve(name: ClipName): { name: ClipName; clip: Clip } {
    const own = this.rig[name];
    if (own) return { name, clip: own };
    if (name === "windup") return this.resolve("idle");
    if (name === "signature") return this.resolve("attack");
    const generic = GENERIC[name];
    if (generic) return { name, clip: generic };
    return { name: "idle", clip: this.rig.idle ?? GENERIC.idle! };
  }

  /** Begin a clip, easing out of whatever was last on screen. */
  private begin(name: ClipName, clip: Clip, then: ClipName | null) {
    const now = performance.now();
    if (this.last && this.playing)
      this.blend = {
        root: this.last.root,
        parts: new Map(this.last.parts),
        start: now,
        length: blendFor(clip),
      };
    this.playing = { clip, name, start: now, then };
  }

  attach(node: HTMLElement | null) {
    this.node = node;
  }
  /** Register a named piece of a cutout rig. */
  attachPart(name: string, node: SVGElement | HTMLElement | null) {
    if (node) this.parts.set(name, node);
    else this.parts.delete(name);
  }
  setRig(rig: Rig) {
    this.rig = rig;
    // Re-resolve whatever is already playing. A rig can arrive after the
    // animator does — a cutout rig registers its parts from inside the
    // combatant, before the combatant has said which rig it wants — and
    // without this the unit keeps playing the generic clip it started on.
    const state = this.playing;
    if (state) {
      // The rest loop is re-resolved from what was asked for, so a windup
      // requested before the rig arrived is taken up once it does.
      const asked = state.clip.loop ? this.rest : state.name;
      const replacement = this.resolve(asked);
      if (replacement.clip !== state.clip) {
        state.clip = replacement.clip;
        state.name = replacement.name;
        // Looping clips keep their phase; one-shots restart so they are not
        // resumed halfway through a different animation.
        if (!replacement.clip.loop) state.start = performance.now();
      }
    }
  }
  setSpeed(n: number) {
    this.speed = Math.max(0.05, n);
  }

  /**
   * Choose the loop this unit returns to between actions. A looping clip on
   * screen changes over at once; a one-shot in progress is left to finish and
   * hands over to the new rest when it does. A fall that is holding its last
   * pose is never disturbed.
   */
  setRest(name: ClipName) {
    this.rest = name;
    const current = this.playing;
    if (!current || !current.clip.loop) return;
    const next = this.resolve(name);
    if (next.clip === current.clip) return;
    this.begin(next.name, next.clip, null);
  }

  /**
   * Ask for a clip. A missing clip falls back rather than throwing, so content
   * can be upgraded a clip at a time and a typo never takes the fight down.
   * Without `then`, a one-shot hands back to the unit's rest loop.
   */
  play(name: ClipName, then?: ClipName) {
    const { name: resolved, clip } = this.resolve(name);
    const current = this.playing;
    // A clip that ends by holding its last pose — a fall — is not restarted
    // by being asked for again; the fallen do not get up to fall twice.
    if (
      current &&
      current.name === resolved &&
      current.then === resolved &&
      !clip.loop
    )
      return;
    // A one-shot in progress is not interrupted by a request for a loop —
    // idle or a held windup. It hands over to the rest loop when it ends.
    if (
      current &&
      !current.clip.loop &&
      clip.loop &&
      performance.now() - current.start < current.clip.duration / this.speed
    )
      return;
    // Asking for the loop already playing does not restart it.
    if (current && clip.loop && current.clip === clip) return;
    this.begin(resolved, clip, then ?? null);
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
      // One-shots hand back to whatever should follow them: a named clip, or
      // whichever loop the unit is resting in by now.
      const next = state.then ?? this.rest;
      if (next !== state.name) {
        this.play(next);
        if (this.playing !== state) return this.tick(now);
      }
    }
    const clamped = Math.max(0, Math.min(1, t));
    // Ease out of the previous clip, if one just ended.
    const blend = this.blend;
    const k = blend
      ? Math.min(1, (now - blend.start) / (blend.length / this.speed))
      : 1;
    if (blend && k >= 1) this.blend = null;
    const eased = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    const ease = (from: Sampled | undefined, to: Sampled) =>
      blend && k < 1 ? mix(from ?? REST, to, eased) : to;
    const pose = ease(blend?.root, sample(state.clip, clamped));
    const written = new Map<string, Sampled>();
    // A held pose is held through anything that does not move it. While a
    // one-shot plays over a held windup, the parts it has no track for keep
    // doing what the windup does — a boss flinches without lowering its key.
    // Over plain idle they return to rest as before; idle is not a pose.
    const held =
      !state.clip.loop && state.then === null && this.rest !== "idle"
        ? this.resolve(this.rest)
        : null;
    const under =
      held && held.name !== "idle" && held.clip.parts
        ? {
            parts: held.clip.parts,
            t:
              (((now / (held.clip.duration / this.speed) + this.phase) % 1) +
                1) %
              1,
          }
        : null;
    // Cutout parts. A part with no track in this clip returns to rest rather
    // than holding whatever the previous clip left it at.
    if (this.parts.size) {
      for (const [name, node] of this.parts) {
        const track = state.clip.parts?.[name];
        const below = under?.parts[name];
        const p = ease(
          blend?.parts.get(name),
          track
            ? sampleTrack(track, clamped)
            : below
              ? sampleTrack(below, under!.t)
              : REST,
        );
        written.set(name, p);
        node.style.transform = poseToTransform(p);
      }
    }
    this.last = { root: pose, parts: written };
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
    this.last = null;
    this.blend = null;
    this.node = null;
    this.parts.clear();
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
  // No `windup` and no `signature`, deliberately: both are a creature's own
  // or nothing. See `Animator.resolve`.
  defeat: {
    duration: 700,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.3, rotate: 10, y: -0.04, flash: 0.6 },
      { at: 1, rotate: -80, y: 0.16, scale: 0.94, flash: 0 },
    ],
  },
};
