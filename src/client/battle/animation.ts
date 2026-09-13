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

/**
 * Moments in a clip that the choreographer times the fight by, as fractions
 * of the clip. Authored from the art: `contact` is where the weapon meets the
 * target — several, for a clip that strikes more than once — and `release`
 * is where a shot or a spell leaves. A clip without them has them derived
 * (see `contactTimes`), so this is a correction, never a requirement.
 */
export interface ClipMarkers {
  contact?: number | number[];
  release?: number;
}

export interface Clip {
  markers?: ClipMarkers;
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

/**
 * When a clip strikes, as fractions of its length, for a figure facing
 * `facing` (+1 right, −1 left).
 *
 * Authored `contact` markers win. Otherwise contact is where the whole figure
 * is furthest forward — the peak of the lunge, which is where every strike in
 * the game is drawn to land — provided it goes forward far enough to count as
 * a lunge at all. A clip that does not lunge (a cast, a shot) lands on its
 * brightest flash, and one with neither on its middle.
 */
export function contactTimes(clip: Clip, facing: 1 | -1 = 1): number[] {
  const authored = clip.markers?.contact;
  if (authored !== undefined)
    return (Array.isArray(authored) ? authored : [authored]).map((t) =>
      Math.max(0, Math.min(1, t)),
    );
  return [derivedContact(clip, facing)];
}

/** The lunge peak, then the flash peak, then the middle. */
export function derivedContact(clip: Clip, facing: 1 | -1 = 1): number {
  const STEPS = 200;
  let forward = 0;
  let at = -1;
  let flash = 0;
  let lit = -1;
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const p = sample(clip, t);
    if (p.x * facing > forward + 1e-6) {
      forward = p.x * facing;
      at = t;
    }
    if (p.flash > flash + 1e-6) {
      flash = p.flash;
      lit = t;
    }
  }
  if (at >= 0 && forward >= LUNGE) return at;
  if (lit >= 0 && flash >= 0.15) return lit;
  return 0.5;
}

/** How far forward, in figure widths, a clip must carry a figure to lunge. */
export const LUNGE = 0.03;

/** Where a clip lets a shot go: authored, else its first contact. */
export function releaseTime(clip: Clip, facing: 1 | -1 = 1): number {
  return clip.markers?.release ?? contactTimes(clip, facing)[0];
}

/** How far forward, in figure widths, a clip carries the figure at `t`. */
export const forwardAt = (clip: Clip, t: number, facing: 1 | -1 = 1) =>
  sample(clip, t).x * facing;

export function poseToTransform(p: Required<Omit<Pose, "at">>) {
  return (
    `translate(${(p.x * 100).toFixed(2)}%, ${(p.y * 100).toFixed(2)}%) ` +
    `rotate(${p.rotate.toFixed(2)}deg) ` +
    `scale(${(p.scale * p.squash).toFixed(4)}, ${(p.scale / p.squash).toFixed(4)})`
  );
}

/**
 * The clips that deliver a move, whose markers a trace reports. A flinch or a
 * crouch has a derived "contact" too — its middle — that is not a blow.
 */
const DELIVERS = new Set<ClipName>(["attack", "signature", "cast", "block", "release"]);

/** Contact times per clip and facing, for tracing. */
const CONTACTS = new WeakMap<Clip, { left?: number[]; right?: number[] }>();

type Sampled = Required<Omit<Pose, "at">>;
const REST: Sampled = { x: 0, y: 0, scale: 1, rotate: 0, squash: 1, flash: 0 };

interface Playing {
  clip: Clip;
  name: ClipName;
  start: number;
  /** Plays this many times faster than authored; 1 for nearly everything. */
  rate: number;
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
  // The short way round. A strike that carries its sword through a full
  // turn ends at 360°, which is drawn exactly as 0°; easing from there into
  // the next clip by plain arithmetic spun the blade backwards through a
  // whole circle on every hand-off.
  rotate: b.rotate - wrap(b.rotate - a.rotate) * (1 - k),
  squash: lerp(a.squash, b.squash, k),
  flash: b.flash,
});
/** An angle difference folded into −180…180 degrees. */
const wrap = (d: number) => d - 360 * Math.round(d / 360);

/** How the choreographer asks for a clip: when it starts, and how fast. */
export interface PlayOptions {
  /**
   * The time the clip starts, on the animator's clock — usually a moment
   * the director scheduled and has just reached. Starting from the schedule
   * rather than from the frame that noticed it keeps a strike's contact
   * exactly where the director put its hit.
   */
  at?: number;
  /** Replace whatever is playing, even a one-shot that has not finished. */
  force?: boolean;
  /** Play faster (above 1) or slower than authored. Never for strikes. */
  rate?: number;
  /**
   * The choreography offset has just taken over where the last clip had
   * carried the figure — a bite that lunged forward and runs on from there
   * — so the ease out of that clip starts from no horizontal offset, rather
   * than carrying the figure forward twice.
   */
  absorb?: boolean;
}

/**
 * The clips that travel. Each falls back to one every rig can play, so a
 * creature with no run cycle still bobs across the floor instead of sliding.
 */
const TRAVEL_FALLBACK: Partial<Record<ClipName, ClipName>> = {
  retreat: "approach",
  aim: "anticipate",
};

/**
 * What a request for a clip actually plays on a rig.
 *
 * Most missing clips fall back to the generic rig. Two do not. A `windup`
 * is authored or it does not exist: the generic one is a pulse, and every
 * ordinary enemy pulsing whenever it announced a wind-up would be noise, so
 * a creature without one keeps its idle. A `signature` without one is the
 * creature's ordinary `attack` — its own strike, not the generic lunge. The
 * choreographer times hits with this same function, so it plans with the
 * clip the animator will play.
 */
export function resolveClip(
  rig: Rig,
  name: ClipName,
): { name: ClipName; clip: Clip } {
  const own = rig[name];
  if (own) return { name, clip: own };
  if (name === "windup") return resolveClip(rig, "idle");
  if (name === "signature") return resolveClip(rig, "attack");
  // A rig that authors a run but no retreat runs home too; one with a
  // draw-and-hold falls back to its own anticipation before the generic.
  const near = TRAVEL_FALLBACK[name];
  if (near && rig[near]) return { name, clip: rig[near]! };
  const generic = GENERIC[name];
  if (generic) return { name, clip: generic };
  return { name: "idle", clip: rig.idle ?? GENERIC.idle! };
}

/**
 * One combatant's animation state. Created per unit, ticked by the stage's
 * shared loop, and disposed with the element.
 *
 * Time comes from `clock`, which on the stage is the presentation clock (see
 * `clock.ts`) — the same clock the director schedules hits on — so a clip
 * slows, speeds, pauses and steps with the rest of the replay.
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
  /**
   * What was last written to each node, so an unchanged pose is not written
   * again. A held part or one at rest would otherwise be re-parsed and
   * re-styled every frame for nothing.
   */
  private written = new Map<Element, string>();
  /** The flash filter last written to the root, "" for none. */
  private flash = "";
  /**
   * Reduced motion: every unit holds one static pose — its rest loop's first
   * frame, or the last frame of a fall — and nothing is written again until
   * something asks for a different pose.
   */
  private still = false;
  /** In a still pose, whether something has changed since it was drawn. */
  private dirty = true;
  /** The clip name last reported on the node as `data-clip`. */
  private reported: string | null = null;

  private clock: () => number;

  /**
   * Development only: told the moment the clip on screen passes one of its
   * markers — a strike's contact, a shot's release — in the frame that draws
   * it. `facing` is needed to find a clip's derived contact.
   */
  trace?: (marker: "contact" | "release", clip: ClipName, at: number) => void;
  facing: 1 | -1 = 1;
  private passed: { state: Playing; t: number } | null = null;

  constructor(
    rig: Rig,
    phase = Math.random(),
    clock: () => number = () => performance.now(),
  ) {
    this.rig = rig;
    this.phase = phase;
    this.clock = clock;
    this.play("idle");
  }

  /** How long the clip on screen lasts, in clock time. */
  private length(state: Playing) {
    return state.clip.duration / this.speed / state.rate;
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
    return resolveClip(this.rig, name);
  }

  /** Begin a clip, easing out of whatever was last on screen. */
  private begin(
    name: ClipName,
    clip: Clip,
    then: ClipName | null,
    at = this.clock(),
    rate = 1,
    absorb = false,
  ) {
    if (this.last && this.playing)
      this.blend = {
        root: absorb ? { ...this.last.root, x: 0 } : this.last.root,
        parts: new Map(this.last.parts),
        start: at,
        length: blendFor(clip) / rate,
      };
    this.playing = { clip, name, start: at, then, rate };
    this.dirty = true;
  }

  /**
   * Keep the clip on screen readable from the page, as `data-clip` on the
   * node, for anything that has to know — the browser tests do. Called as
   * each frame is drawn, so it reports what was drawn: a clip asked for and
   * replaced before the next frame — a windup handed to idle and at once to
   * the signature — never appears. Written only when the clip changes.
   */
  private report() {
    const name = this.playing?.name ?? null;
    if (!this.node || name === this.reported) return;
    this.reported = name;
    if (name) this.node.dataset.clip = name;
    else delete this.node.dataset.clip;
  }

  attach(node: HTMLElement | null) {
    this.node = node;
    this.written.clear();
    this.flash = node?.style.filter ?? "";
    this.dirty = true;
    this.reported = null;
  }
  /**
   * Register a named piece of a cutout rig.
   *
   * The animator owns the part's `will-change` as well as its transform: a
   * part it moves gets its own compositor layer, so moving it is a matrix
   * change rather than a repaint of the figure around it. Owning it here
   * covers every part, including those nested inside another part — a jaw in
   * a head, a plume in a snout — which a stylesheet rule on an SVG's direct
   * children silently missed.
   */
  attachPart(name: string, node: SVGElement | HTMLElement | null) {
    const old = this.parts.get(name);
    if (old && old !== node) {
      old.style.willChange = "";
      this.written.delete(old);
    }
    if (node) {
      node.style.willChange = "transform";
      this.parts.set(name, node);
    } else this.parts.delete(name);
    this.dirty = true;
  }
  /** Write a transform, unless it is the one already there. */
  private write(node: SVGElement | HTMLElement, transform: string) {
    if (this.written.get(node) === transform) return;
    this.written.set(node, transform);
    node.style.transform = transform;
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
        if (!replacement.clip.loop) state.start = this.clock();
      }
    }
    this.dirty = true;
  }
  setSpeed(n: number) {
    this.speed = Math.max(0.05, n);
  }
  /** Hold still, for reduced motion, or move again. */
  setStill(still: boolean) {
    if (still === this.still) return;
    this.still = still;
    this.dirty = true;
    this.blend = null;
  }

  /**
   * Choose the loop this unit returns to between actions. A looping clip on
   * screen changes over at once; a one-shot in progress is left to finish and
   * hands over to the new rest when it does. A fall that is holding its last
   * pose is never disturbed.
   */
  setRest(name: ClipName) {
    this.rest = name;
    this.dirty = true;
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
  play(name: ClipName, then?: ClipName, opts: PlayOptions = {}) {
    const { name: resolved, clip } = this.resolve(name);
    const current = this.playing;
    // A flinch never cuts a unit's own blow short. Hit back mid-strike — by
    // thorns, by a counter — it finishes the strike it is drawing, so the
    // blow that the choreography timed its hit to is still seen to land; the
    // hit on it still shows its number, its effect and its sound.
    if (
      resolved === "hurt" &&
      current &&
      !current.clip.loop &&
      DELIVERS.has(current.name) &&
      this.clock() - current.start < this.length(current)
    )
      return;
    // A clip that ends by holding its last pose — a fall — is not restarted
    // by being asked for again; the fallen do not get up to fall twice.
    if (
      current &&
      current.name === resolved &&
      current.then === resolved &&
      !clip.loop &&
      (!opts.force || resolved === "defeat")
    )
      return;
    // A one-shot in progress is not interrupted by a request for a loop —
    // idle or a held windup. It hands over to the rest loop when it ends.
    // The choreographer's requests are the exception: it knows the strike
    // is over, and a run that waited for it would leave a figure sliding.
    if (
      !opts.force &&
      current &&
      !current.clip.loop &&
      clip.loop &&
      this.clock() - current.start < this.length(current)
    )
      return;
    // Asking for the loop already playing does not restart it.
    if (current && clip.loop && current.clip === clip && current.rate === (opts.rate ?? 1))
      return;
    this.begin(
      resolved,
      clip,
      then ?? null,
      opts.at,
      opts.rate ?? 1,
      opts.absorb,
    );
  }

  /**
   * Go back to rest now, whatever is playing — the end of a replay, or a
   * skip. A choreography clip holding a drawn bow or a run cycle would
   * otherwise play on over the settled board. The fallen stay down.
   */
  settle() {
    if (this.lying) return;
    const rest = this.resolve(this.rest);
    const current = this.playing;
    if (current && current.clip === rest.clip) return;
    this.begin(rest.name, rest.clip, null);
  }

  /** Whether the unit is lying where it fell: a fall that holds its last pose. */
  get lying(): boolean {
    const p = this.playing;
    return !!p && p.name === "defeat" && p.then === "defeat";
  }

  /**
   * Lie down or get up, to match the board. It reads the pose actually on
   * screen rather than remembering what it was last told, so it can be asked
   * every time the board changes: asking for the state already shown does
   * nothing, a fall already played by the replay is not played again, and
   * only someone lying down gets up. A unit first seen lying — before it has
   * drawn a single frame — is shown lying rather than falling over in front
   * of someone who has just arrived.
   */
  setDown(down: boolean) {
    if (down === this.lying) return;
    if (!down) {
      this.play("revive");
      return;
    }
    const unseen = !this.last;
    this.play("defeat", "defeat");
    const state = this.playing;
    if (unseen && state) {
      state.start = this.clock() - this.length(state);
      this.blend = null;
    }
  }

  get current(): ClipName | null {
    return this.playing?.name ?? null;
  }

  /**
   * The still pose, for reduced motion. A one-shot is over the moment it is
   * asked for: a fall shows where it ends, anything else hands straight to
   * the rest loop, which shows its first frame. A held windup is therefore
   * the raised key, not idle. Nothing flashes, and nothing is sampled or
   * written again until something changes.
   */
  private hold(now: number): Sampled {
    if (!this.dirty && this.last) return this.last.root;
    this.dirty = false;
    this.blend = null;
    let state = this.playing;
    for (let hops = 0; state && !state.clip.loop && hops < 4; hops++) {
      const next = state.then ?? this.rest;
      if (next === state.name) break;
      const { name, clip } = this.resolve(next);
      this.playing = state = { clip, name, start: now, then: null, rate: 1 };
    }
    this.report();
    const t = state && !state.clip.loop ? 1 : 0;
    const pose = { ...(state ? sample(state.clip, t) : REST), flash: 0 };
    const written = new Map<string, Sampled>();
    for (const [name, node] of this.parts) {
      const track = state?.clip.parts?.[name];
      const p = track ? sampleTrack(track, t) : REST;
      written.set(name, p);
      this.write(node, poseToTransform(p));
    }
    this.last = { root: pose, parts: written };
    if (this.node) {
      this.write(this.node, poseToTransform(pose));
      if (this.flash) {
        this.flash = "";
        this.node.style.filter = "";
      }
    }
    return pose;
  }

  /** Advance and write. Returns the sampled pose so callers can read flash. */
  tick(now: number): Required<Omit<Pose, "at">> {
    if (this.still) return this.hold(now);
    const state = this.playing;
    if (!state) return sample(GENERIC.idle!, 0);
    const length = this.length(state);
    let t = (now - state.start) / length;
    if (this.trace && !state.clip.loop && DELIVERS.has(state.name))
      this.markers(state, t, now);
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
      ? Math.max(
          0,
          Math.min(1, (now - blend.start) / (blend.length / this.speed)),
        )
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
        this.write(node, poseToTransform(p));
      }
    }
    this.last = { root: pose, parts: written };
    this.report();
    if (this.node) {
      this.write(this.node, poseToTransform(pose));
      // Flash is a filter over the whole figure, and a filter on the rig is an
      // offscreen pass every frame, so it is written only while it would show:
      // the tail of an eased flash rounds to the identity long before it
      // reaches zero. On the stage every shape inside is already toned for its
      // depth, so the flash is bracketed by the tone's inverse and the tone,
      // and blows out to the same white the untoned figure would; anywhere
      // without a tone both are empty.
      const brightness = (1 + pose.flash * 1.6).toFixed(2);
      const saturate = (1 + pose.flash).toFixed(2);
      const flash =
        brightness === "1.00" && saturate === "1.00"
          ? ""
          : `var(--untone,) brightness(${brightness}) saturate(${saturate}) var(--tone,)`;
      if (flash !== this.flash) {
        this.flash = flash;
        this.node.style.filter = flash;
      }
    }
    return pose;
  }

  /** Report the markers this frame has carried the clip past. */
  private markers(state: Playing, t: number, now: number) {
    const from = this.passed?.state === state ? this.passed.t : -1e-9;
    this.passed = { state, t };
    if (t <= from) return;
    // A frame landing exactly on a marker counts: the director shows a hit
    // when its time is reached, and so must this, floating point or not.
    const crossed = (m: number) => from < m - 1e-9 && m <= t + 1e-9;
    // Deriving a contact samples the clip 200 times: once per clip is plenty.
    const key = this.facing > 0 ? "right" : "left";
    const known = CONTACTS.get(state.clip);
    const marks = known?.[key] ?? contactTimes(state.clip, this.facing);
    if (!known?.[key]) CONTACTS.set(state.clip, { ...known, [key]: marks });
    // A shot's clip is timed by its release; its arrow's arrival is its hit.
    if (state.name !== "release")
      for (const m of marks)
        if (crossed(m)) this.trace?.("contact", state.name, now);
    const r = state.clip.markers?.release;
    if (r !== undefined && crossed(r)) this.trace?.("release", state.name, now);
  }

  dispose() {
    this.playing = null;
    this.last = null;
    this.blend = null;
    this.node = null;
    this.parts.clear();
    this.written.clear();
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
  /*
   * Travel and shooting, for anything without its own. No x and no tilt:
   * this rig does not know which way the figure faces, and the stage carries
   * it across the floor anyway. A bob is enough to say it is moving under its
   * own power rather than being slid.
   */
  approach: {
    duration: 380,
    loop: true,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.25, y: -0.035, squash: 0.97 },
      { at: 0.5, y: 0, squash: 1.03 },
      { at: 0.75, y: -0.035, squash: 0.97 },
      { at: 1, y: 0, squash: 1 },
    ],
  },
  aim: {
    duration: 320,
    poses: [
      { at: 0, y: 0, squash: 1, scale: 1 },
      { at: 1, y: 0.012, squash: 1.06, scale: 1.02, flash: 0.12 },
    ],
  },
  release: {
    duration: 360,
    markers: { release: 0.15 },
    poses: [
      { at: 0, y: 0.012, squash: 1.06, scale: 1.02, flash: 0.12 },
      { at: 0.15, y: -0.02, squash: 0.95, scale: 1.05, flash: 0.35 },
      { at: 1, y: 0, squash: 1, scale: 1, flash: 0 },
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
/** Going home is the same bob as setting out. */
GENERIC.retreat = GENERIC.approach;
