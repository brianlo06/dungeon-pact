/**
 * The Ultimate cinematic schema.
 *
 * A cinematic is a short authored film made of shots. It is presentation in
 * the strictest sense this project has: it is played *after* the server has
 * resolved the Ultimate, it is handed that result as beats, and all it decides
 * is when each of those beats is shown and how. If a cinematic never played,
 * the board would be exactly as correct.
 *
 * Time. A shot's own cues are placed at fractions of the shot (`at`, 0…1), so
 * the FAST cut can shorten a shot without re-authoring it; accents that must
 * stay short in absolute terms — a one-frame flash, a hit-stop — carry their
 * length in milliseconds. Every millisecond is presentation time on the
 * combat's one clock: replay speed, pause, frame step and hit-stop reach a
 * cinematic exactly as they reach a round.
 *
 * Space. A shot either takes place on its own isolated stage (`cinematic`),
 * where presentation copies of the caster, its targets and its allies are
 * placed wherever the composition wants them, or over the real battlefield
 * (`battlefield`), where effects are anchored to where the stage has actually
 * placed each unit. Nothing in either space moves a unit on the board.
 *
 * World units. The isolated stage is a 1600×900 box, scaled to cover the
 * screen. `x` runs right, `y` runs down, and an actor's position is its
 * ground point, where its feet are.
 */

export type ShotKind =
  | "extreme-close-up"
  | "face-close-up"
  | "detail"
  | "low-angle"
  | "profile"
  | "dutch"
  | "wide-hero"
  | "over-the-shoulder"
  | "target"
  | "projectile-follow"
  | "impact"
  | "aftermath"
  | "call"
  | "return";

/** Which presentation a cue belongs to. Absent means both. */
export type CinematicMode = "full" | "fast";

/** How big the target is, which is how a shot re-frames for it. */
export type Framing = "normal" | "large" | "boss";

export type Ease =
  | "linear"
  | "in"
  | "out"
  | "inOut"
  /** Holds, then snaps: a whip. */
  | "snap"
  /** Overshoots its end and settles back. */
  | "back";

/** A camera position: the world point at the centre of the frame. */
export interface CameraKey {
  x: number;
  y: number;
  /** 1 frames the whole 1600×900 world; 3 is a third of it. */
  zoom: number;
  /** Degrees; a Dutch angle. */
  rotate?: number;
}

export interface CameraMove {
  from: CameraKey;
  to?: CameraKey;
  ease?: Ease;
}

export type TransitionKind =
  /** Nothing: the next frame is the next shot. The default. */
  | "cut"
  /** The camera travels from the last shot's framing, and the shots cross. */
  | "blend"
  /** A smeared pan: streaks across the frame hide the change. */
  | "whip"
  /** A white frame. */
  | "flash"
  /** A black frame. */
  | "black"
  /** Something passes in front of the lens; the cut happens behind it. */
  | "occlusion"
  /** The picture opens from, or closes to, a point. */
  | "iris";

export interface Transition {
  kind: TransitionKind;
  /** Presentation milliseconds the transition spans. */
  ms?: number;
  /** For a whip or an occlusion: which way it crosses the frame. */
  dir?: 1 | -1;
  /** For an occlusion: what crosses. */
  object?: "cape" | "shield" | "debris" | "chain" | "embers";
}

/** Who an actor cue places. */
export type ActorRole =
  | "caster"
  /** The primary target. */
  | "target"
  /** Every target the Ultimate reached, the primary first. */
  | "targets"
  /** The caster's allies, not the caster. */
  | "allies";

export type ActorLook =
  | "lit"
  /** Filled flat black: a figure against a light. */
  | "silhouette"
  /** Dark, with a coloured edge on one side. */
  | "rim"
  /** Faint, as if remembered. */
  | "ghost";

export interface ActorCue {
  role: ActorRole;
  /** Ground point at the start of the shot, world units. */
  at: [number, number];
  /** Ground point at the end of the shot. */
  to?: [number, number];
  ease?: Ease;
  /**
   * Height of a person-sized figure, world units. A creature's footprint
   * multiplies it, so a boss is bigger than a hound in the same shot.
   */
  size: number;
  toSize?: number;
  /** +1 faces right, the way heroes are drawn; −1 faces left. */
  face?: 1 | -1;
  /** A rig clip, started when the shot starts (or at `clipAt`). */
  clip?: string;
  clipAt?: number;
  /** What the clip hands over to when it finishes. */
  then?: string;
  look?: ActorLook;
  /** Rim colour, for `look: "rim"`. */
  rim?: string;
  /** For `targets` and `allies`: the gap between figures, world units. */
  spread?: [number, number];
  /** Paint order among actors. Higher is nearer. */
  z?: number;
  /** Timed reactions inside the shot: a brace, a flinch. */
  react?: { at: number; clip: string; then?: string }[];
  /**
   * Knockback, world units, applied from `at` over the shot's remainder: a
   * blow carries a target backwards.
   */
  shove?: { at: number; by: [number, number] };
  /** Rotate the figure, degrees; a body flung. */
  tilt?: number;
  /** Rotate the figure at the shot's end. */
  toTilt?: number;
}

/** Temporary lighting. Nothing here outlives its shot. */
export interface Lighting {
  /** Brightness of the scene behind the actors, 0 black … 1 as drawn. */
  exposure?: number;
  toExposure?: number;
  /** A colour laid over everything, and how strongly. */
  tint?: [string, number];
  /** Light from below, the colour of whatever is on the floor. */
  under?: [string, number];
  /** A glow behind the actors, which turns them towards silhouettes. */
  back?: [string, number];
  /** A coloured edge on the caster; +1 lights its right side. */
  rim?: [string, number, (1 | -1)?];
  /** Darkening at the frame's edge, 0 … 1. */
  vignette?: number;
  /** Letterbox bars, fraction of the frame height each. */
  letterbox?: number;
}

export type BackgroundId =
  /** Transparent: the real battlefield shows through. */
  | "battlefield"
  /** Flat dark: nothing but the actors. */
  | "void"
  /** The Vanguard's: an endless hall of guild lanterns. */
  | "lantern-vault"
  /** The Breaker's: a forge wall and a vault gate. */
  | "breach-forge"
  /** Any Ultimate without its own: a field of its accent colour. */
  | "pact-sigil"
  /** The Arcanist's: a drowned hall under a storm with a promissory seal in it. */
  | "storm-ledger"
  /** An Ultimate's own, from its folder's `background.tsx`. */
  | (string & {});

export type VfxKind =
  /** Light running through cracks in the floor from a point. */
  | "floor-cracks"
  /** A puff of dust at the ground. */
  | "dust"
  /** Motes drifting upward; frozen when `still`. */
  | "motes"
  /** Guild lanterns igniting down the hall. */
  | "lanterns"
  /** The target, reflected in the shield. */
  | "reflection"
  /** A streak of light behind something moving fast. */
  | "trail"
  /** Lines racing past the frame. */
  | "speed-lines"
  /** A ring of force expanding from a point. */
  | "shockwave"
  /** A hard-edged starburst: an impact drawn, not simulated. */
  | "impact-star"
  /** Flying shards. */
  | "debris"
  /** A hex lattice of lantern light raised over an ally. */
  | "ward-dome"
  /** A glow gathering on a point, contracting before it bursts. */
  | "gather"
  /** Showering sparks. */
  | "sparks"
  /** Molten seams opening along an edge. */
  | "molten-seam"
  /** Embers drifting inward to a point, then blown out. */
  | "embers"
  /** A great iron gate, whole and then broken. */
  | "vault-gate"
  /** The caster's aura on the battlefield when the Ultimate is called. */
  | "call-aura"
  /** A glint on metal. */
  | "glint"
  /** The visor lighting from within. */
  | "visor"
  /** A foreground object crossing the lens, for an occlusion. */
  | "occluder"
  /** Rain across the frame, driven sideways by wind. */
  | "rain"
  /** A bolt from the sky to a point; it redraws itself as it lives. */
  | "lightning"
  /** Arcs jumping from the first target to every other. */
  | "arcs"
  /** Water running off a figure: a Wet target. */
  | "wet"
  /** Pages tearing out of a book and climbing. */
  | "pages"
  /** Drops hanging off an edge, or falling from it. */
  | "drops"
  /** A seal written in the sky: rings, ticks, a star. */
  | "rune-circle"
  /** An Ultimate's own, from its folder's `vfx.tsx`. */
  | (string & {});

export interface VfxCue {
  kind: VfxKind;
  /** Lifetime within the shot, fractions. */
  at: number;
  until?: number;
  /**
   * World units in a cinematic shot. With `follow`, an offset from that
   * actor's ground point instead. On the battlefield, see `anchor`.
   */
  x?: number;
  y?: number;
  /** Ride an actor as it moves: a trail behind a charging shield. */
  follow?: "caster" | "target";
  /** One copy on every target the Ultimate reached, each riding its own. */
  each?: "targets";
  scale?: number;
  rotate?: number;
  color?: string;
  /** Deterministic variation: two cues with one seed look alike. */
  seed?: number;
  /** Behind or in front of the actors, or on the glass. */
  layer?: "back" | "front" | "screen";
  /**
   * Battlefield shots only: put the effect on units the stage placed. One
   * copy per unit, staggered by `stagger` milliseconds.
   */
  anchor?: "caster" | "targets" | "allies" | "party";
  stagger?: number;
  /** Anything else a particular effect reads. */
  params?: Record<string, number | string | boolean>;
  mode?: CinematicMode;
}

export type ScreenKind =
  | "flash"
  | "black"
  /** Two flat tones: the frame reduced to light and shadow. */
  | "two-tone"
  | "invert"
  | "chromatic"
  /** Streaks from the centre outward. */
  | "radial"
  | "desaturate";

export interface ScreenCue {
  kind: ScreenKind;
  at: number;
  /** Milliseconds, absolute, so a one-frame accent stays one frame. */
  ms: number;
  amount?: number;
  color?: string;
  mode?: CinematicMode;
}

export interface ShakeCue {
  at: number;
  amount: number;
  mode?: CinematicMode;
}

export interface StopCue {
  at: number;
  /** Hit-stop, presentation milliseconds. */
  ms: number;
}

export interface SoundCue {
  at: number;
  sfx: string;
  mode?: CinematicMode;
}

/** Music and ambience dipping under an important moment. */
export interface DuckCue {
  at: number;
  /** 0 silent … 1 untouched. */
  level: number;
  ms: number;
}

export type TextKind =
  /** The Ultimate's name, large. */
  | "name"
  /** The epithet, under it. */
  | "epithet"
  /** A spoken line, as a subtitle. */
  | "voice"
  /** A word or number punched onto an impact. */
  | "impact";

export interface TextCue {
  kind: TextKind;
  at: number;
  until?: number;
  /**
   * Literal text, or a reference the player fills in: `$name`, `$epithet`,
   * `$voice.activation`, `$voice.impact`, `$voice.after`, `$damage`.
   */
  text: string;
  /** Where on the frame, as fractions of its width and height. */
  x?: number;
  y?: number;
  rotate?: number;
  mode?: CinematicMode;
}

/**
 * When the server's result is shown. `impact` shows every hit, break, fall and
 * status the Ultimate caused; `ward` the Barrier and healing it gave. Anything
 * not yet revealed when the cinematic ends is shown then, so no result can be
 * lost to a skip or to a timeline that forgot to reveal it.
 */
export interface RevealCue {
  at: number;
  reveal: "impact" | "ward" | "all";
}

/** A labelled moment, for the Battle Lab's timing markers. */
export interface MarkerCue {
  at: number;
  label: string;
}

export interface ShotOverride {
  camera?: CameraMove;
  actors?: ActorCue[];
  vfx?: VfxCue[];
}

/**
 * In a `battlefield` shot, actor cues do not place anyone: a clip named there
 * is played by the real unit, where it stands.
 */
export interface Shot {
  id: string;
  kind: ShotKind;
  /** What the shot is for, in the storyboard's words. */
  purpose: string;
  space: "cinematic" | "battlefield";
  /** Presentation milliseconds in FULL. */
  ms: number;
  /** Milliseconds in FAST; 0 or absent drops the shot from FAST. */
  fastMs?: number;
  transition?: Transition;
  camera?: CameraMove;
  background: BackgroundId;
  lighting?: Lighting;
  toLighting?: Lighting;
  actors?: ActorCue[];
  vfx?: VfxCue[];
  screen?: ScreenCue[];
  shake?: ShakeCue[];
  stop?: StopCue[];
  sound?: SoundCue[];
  duck?: DuckCue[];
  text?: TextCue[];
  reveal?: RevealCue[];
  markers?: MarkerCue[];
  /** Re-framing for a larger target. `boss` falls back to `large`. */
  framing?: Partial<Record<Exclude<Framing, "normal">, ShotOverride>>;
}

export interface Cinematic {
  id: string;
  /** Who it was made for, so the lab can show it with the right cast. */
  heroId: string;
  shots: Shot[];
  /** The character's motif, played under the shots that ask for it. */
  motif?: string;
}
