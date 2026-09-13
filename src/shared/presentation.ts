/**
 * Presentation metadata.
 *
 * Content says how a thing *looks*; it may never say what a thing *does*. There
 * is no field here that the engine reads, and there is no number here that can
 * reach a result. If every value in this file were wrong, the fight would play
 * out identically and only look worse.
 *
 * Every field is optional and every consumer falls back, so content can be
 * upgraded one entry at a time and an old save keeps rendering.
 */

/** Named presets rather than raw numbers, so the look stays consistent. */
export type Footprint =
  | "small" // a swarm creature, smaller than a person
  | "person" // the default
  | "heavy" // an armoured frontliner
  | "container" // an object with health
  | "boss" // a named threat
  | "boss-large"; // a named threat that has to dominate the frame

/** Which rig or sheet a combatant animates with. */
export type SpriteSet = string;

/**
 * Clips an animation player can be asked for. Missing clips fall back.
 *
 * The choreography clips — `approach`, `retreat`, `aim` and `release` — are
 * what a combatant plays while it crosses the stage and while it draws and
 * looses a shot. Each falls back to something every rig has (see
 * `Animator.resolve`), so a creature nobody has animated for travel still
 * crosses the stage rather than sliding rigidly.
 */
export type ClipName =
  | "idle"
  | "anticipate"
  | "attack"
  | "cast"
  | "hurt"
  | "block"
  | "down"
  | "revive"
  | "victory"
  | "windup"
  | "signature"
  | "defeat"
  /** A travel loop towards the target: a run, a charge, a sprint. */
  | "approach"
  /** A travel loop back home: a jog, or backing away on guard. */
  | "retreat"
  /** One-shot that ends holding a drawn or charged pose: a bow at full draw. */
  | "aim"
  /** One-shot from the held aim: the loose, and the recovery. */
  | "release"
  /**
   * An Ultimate's own performance: poses no ordinary action plays, so a
   * cinematic never has to overload `attack`. A rig without one idles.
   */
  | `ult:${string}`;

/** The reusable effect vocabulary. Adding one means adding a renderer for it. */
export type VfxName =
  | "impact"
  | "slash"
  | "cast"
  | "projectile"
  | "heal"
  | "barrier"
  | "interrupt"
  | "seize"
  | "reclaim"
  | "guard-metal"
  | "arcane-rune"
  | "precision-line"
  | "growth"
  | "contract"
  | "resonance"
  | "blood"
  | "distortion";

/** Sound categories, resolved against the synthesised palette. */
export type SfxName =
  | "swing-light"
  | "swing-heavy"
  | "impact-light"
  | "impact-heavy"
  | "impact-metal"
  | "shield-raise"
  | "shield-block"
  | "cast-arcane"
  | "cast-nature"
  | "heal"
  | "interrupt"
  | "chain"
  | "lock"
  | "vault-hit"
  | "vault-break"
  | "coin"
  | "step"
  | "down"
  | "revive"
  | "boss-groan"
  | "boss-stamp"
  | "miser-croak"
  | "miser-coin"
  /** Choreography: a bowstring creaking as it is drawn. */
  | "bow-draw"
  /** The string snapping forward on release. */
  | "bow-release"
  /** An arrow passing through the air. */
  | "arrow-whoosh"
  /** One heavy footfall; the choreographer spaces these along a charge. */
  | "footstep-heavy"
  /** Power gathering before a spell or a charged shot. */
  | "charge-rise"
  /** Something thrown or fired leaving its source. */
  | "projectile-release";

export type CameraPreset =
  | "neutral"
  | "hero"
  | "target"
  | "action"
  | "boss"
  | "signature"
  | "intercept"
  | "payoff";

/** How hard an impact reads. Drives hit-stop, shake, flash and recoil together. */
export type ImpactWeight = "light" | "normal" | "heavy" | "signature";

/** The visual family a class or creature belongs to. Drives effect styling. */
export type VfxTheme =
  | "guard"
  | "arcane"
  | "precision"
  | "growth"
  | "contract"
  | "resonance"
  | "blood"
  | "sway"
  | "foundry";

/** What a combatant looks like and how it moves. */
export interface UnitPresentation {
  spriteSet?: SpriteSet;
  footprint?: Footprint;
  theme?: VfxTheme;
  /** Seconds one idle loop takes. Varied per creature so a line never syncs. */
  idlePeriod?: number;
  /** Ground shadow strength, 0 none … 1 hard. */
  shadow?: number;
  /** Clips this unit actually has. Anything absent uses the generic rig. */
  clips?: Partial<Record<ClipName, string>>;
  /*
   * How it performs a move is annotated in `content/choreography/<id>.ts`,
   * one file per creature, so annotating two creatures never touches the
   * same file. See `docs/CHOREOGRAPHY.md`.
   */
}

/**
 * What an Ultimate looks like. The cinematic is named, never inferred from
 * the Ultimate's id, so two Ultimates may share one and a new Ultimate with
 * no cinematic of its own falls back to the generic one rather than failing.
 */
export interface UltimatePresentation {
  /** A key into the cinematic registry (`content/cinematics`). */
  cinematic?: string;
  theme?: VfxTheme;
  /** The one colour the Ultimate owns: its aura, its meter, its title. */
  accent?: string;
  /**
   * Optional lines, shown as subtitles; a recorded line would play in the
   * same slot. None of these are required for anything to work.
   */
  voice?: { activation?: string; impact?: string; after?: string };
}

/** What an action looks like when it is performed. */
export interface AbilityPresentation {
  clip?: ClipName;
  castVfx?: VfxName;
  travelVfx?: VfxName;
  impactVfx?: VfxName;
  castSfx?: SfxName;
  impactSfx?: SfxName;
  camera?: CameraPreset;
  weight?: ImpactWeight;
  theme?: VfxTheme;
  /** Show the ability's name across the stage when it fires. */
  announce?: boolean;
  /** How the move is performed; absent means the choreographer infers it. */
  archetype?: Archetype;
  /** For spells and support: how the effect reaches its target. */
  delivery?: Delivery;
  /** What travels, for projectile, bow and spell moves. */
  projectile?: ProjectileLook;
  /**
   * How long the build-up is held. `long` is a power shot — a longer draw and
   * a brighter aim; `marked` flashes the target's mark before release, and
   * only when the move actually exploited one (an `EXPLOIT` beat); `short` is
   * a snap shot.
   */
  charge?: Charge;
  /** Overrides the unit's own locomotion for this move: a pounce is a leap. */
  locomotion?: Locomotion;
  timing?: TimingHints;
}

/* ------------------------------------------------------------ choreography -- */

/*
 * Choreography metadata.
 *
 * The same rule as everything above: this says how a move *looks*, never what
 * it does. Every multi-hit, every row impact and every projectile the stage
 * shows comes from the beats the engine resolved; metadata only chooses how
 * each of those is drawn. An arrow volley is drawn only for a move that hit a
 * whole row, and a second bite only for a move that bit twice.
 */

/** How a move is performed. */
export type Archetype =
  /** Cross the stage to an attack point beside the target, strike, go home. */
  | "melee"
  /** A short lunge towards the target, never leaving its own ground. */
  | "lunge"
  /** Face, raise, draw, hold, loose; an arrow flies and lands. */
  | "bow"
  /** Something thrown or fired: a rivet, an ember, a coin. */
  | "projectile"
  /** A spell built in the hand and launched; `delivery` says how it lands. */
  | "spell"
  /** A continuous line from the caster to the target. */
  | "beam"
  /** One impact across a whole row: an eruption, a shockwave. */
  | "area"
  /** Performed on itself, in place: a brace, a fortify. */
  | "self"
  /** Aimed at an ally: a heal, a barrier. */
  | "support";

/** How a spell or a support move reaches its target. */
export type Delivery =
  /** A bolt or orb that travels from the caster's hand. */
  | "bolt"
  /** A strike that falls on the target from above. */
  | "fromAbove"
  /** A beam held between caster and target. */
  | "beam"
  /** The ground under the target is marked, then erupts. */
  | "eruption"
  /** A wave that runs along the ground from the caster. */
  | "shockwave"
  /** A sigil forms on the target, then bursts. */
  | "sigil"
  /** Light blooms on the target where it stands. */
  | "bloom"
  /** A mote of healing travels from the caster to the ally. */
  | "mote";

/** How a combatant gets across the stage. Each falls back to `run`. */
export type Locomotion =
  | "run"
  | "dash"
  | "heavyWalk"
  | "charge"
  | "hop"
  | "leap"
  | "crawl"
  | "slither"
  | "fly"
  | "lunge"
  | "teleport";

export type Charge = "short" | "normal" | "long" | "marked";

/** The shapes a projectile can be drawn as. The projectile layer draws each. */
export type ProjectileVisual =
  | "arrow"
  | "bolt"
  | "orb"
  | "mote"
  | "ember"
  | "rivet"
  | "shard"
  | "wave";

/** The path a projectile takes. */
export type Trajectory =
  | "linear"
  | "arc"
  | "homing"
  | "beam"
  | "ground"
  | "fromAbove";

export interface ProjectileLook {
  visual?: ProjectileVisual;
  trajectory?: Trajectory;
  /** Stage widths per second. Ignored when `duration` is given. */
  speed?: number;
  /** Milliseconds of flight, at 1×. */
  duration?: number;
  /** Arc height as a fraction of the flight's length. */
  arc?: number;
  /** `tangent` points it along its path (arrows), `spin` turns it. */
  rotate?: "tangent" | "spin" | "none";
  trail?: boolean;
  /** What happens to it when it lands. */
  onArrival?: "stick" | "vanish" | "burst";
  /** The effect at the target on arrival. */
  impact?: VfxName;
}

/** Nudges to a move's timing. Milliseconds at 1×; all optional. */
export interface TimingHints {
  anticipation?: number;
  /** How long the aim or charge is held before release. */
  hold?: number;
  /** Multiplies travel time: below 1 is faster. */
  travel?: number;
  /** How long the actor stays at the attack point after the strike. */
  linger?: number;
}

/**
 * A point on a drawing, in the drawing's own viewBox units, optionally riding
 * a named rig part so it moves with that part: the Ranger's nock rides the
 * `arrow` part, so an arrow leaves wherever the drawn arrow is at release.
 */
export interface Anchor {
  at: [number, number];
  part?: string;
}

/** The named points a choreographer asks a creature for. */
export type AnchorName =
  /** Where a projectile leaves: a nock, a staff tip, a hand, a barrel, a mouth. */
  | "muzzle"
  /** Where a projectile or blow lands on it. Upper torso by default. */
  | "hit"
  /** The striking point of its weapon at contact, for the debug overlay. */
  | "weapon";

/** How a creature performs, whatever the move. */
export interface UnitChoreography {
  locomotion?: Locomotion;
  /** Travel speed in stage widths per second, before pacing. */
  speed?: number;
  /**
   * How far in front of its own centre its weapon lands at contact, in
   * drawing units, not counting how far the strike clip carries the whole
   * figure (the choreographer adds that from the clip itself). Absent means
   * the front of its painted outline.
   */
  reach?: number;
  anchors?: Partial<Record<AnchorName, Anchor>>;
  /** The archetype of its moves at a hostile target when a move names none. */
  basic?: Archetype;
  /**
   * How far inside its painted outline the surface it is struck on sits, in
   * drawing units: an outboard key or a raised arm is not where a sword lands.
   */
  strikeInset?: number;
  /** Whether it turns round to go home (a hound) or backs away (a knight). */
  turnToReturn?: boolean;
  /** How far past the attack point the strike carries it, in drawing units. */
  overshoot?: number;
}

/**
 * One creature's annotations: its own choreography and its abilities', keyed
 * by ability id, which upgrades and class paths keep. `named` is keyed by the
 * ability's name instead, for a class path whose move looks different from
 * the one it replaced.
 */
export interface CreatureChoreography {
  unit?: UnitChoreography;
  abilities?: Record<string, AbilityPresentation>;
  named?: Record<string, AbilityPresentation>;
}

/** Defaults, so nothing has to be annotated to render. */
export const DEFAULT_UNIT: Required<
  Pick<UnitPresentation, "footprint" | "theme" | "idlePeriod" | "shadow">
> = {
  footprint: "person",
  theme: "foundry",
  idlePeriod: 3.4,
  shadow: 0.78,
};

/** Size multiplier per footprint. The only place these numbers live. */
export const FOOTPRINT_SCALE: Record<Footprint, number> = {
  small: 0.9,
  person: 1,
  heavy: 1.18,
  container: 1.3,
  boss: 1.5,
  "boss-large": 1.72,
};

/** Hit-stop, shake and recoil, kept in one table so they stay in sympathy. */
export const IMPACT: Record<
  ImpactWeight,
  { stopMs: number; shake: number; recoil: number; flash: number }
> = {
  light: { stopMs: 35, shake: 0.004, recoil: 0.4, flash: 0.15 },
  normal: { stopMs: 70, shake: 0.009, recoil: 0.7, flash: 0.3 },
  heavy: { stopMs: 110, shake: 0.016, recoil: 1, flash: 0.5 },
  signature: { stopMs: 150, shake: 0.022, recoil: 1.25, flash: 0.75 },
};

/** A theme's default effect and sound, used when an ability names none. */
export const THEME_DEFAULTS: Record<
  VfxTheme,
  { impactVfx: VfxName; castVfx: VfxName; impactSfx: SfxName; castSfx: SfxName }
> = {
  guard: {
    impactVfx: "guard-metal",
    castVfx: "barrier",
    impactSfx: "impact-metal",
    castSfx: "shield-raise",
  },
  arcane: {
    impactVfx: "impact",
    castVfx: "arcane-rune",
    impactSfx: "impact-light",
    castSfx: "cast-arcane",
  },
  precision: {
    impactVfx: "slash",
    castVfx: "precision-line",
    impactSfx: "impact-light",
    castSfx: "swing-light",
  },
  growth: {
    impactVfx: "growth",
    castVfx: "growth",
    impactSfx: "heal",
    castSfx: "cast-nature",
  },
  contract: {
    impactVfx: "contract",
    castVfx: "contract",
    impactSfx: "coin",
    castSfx: "lock",
  },
  resonance: {
    impactVfx: "resonance",
    castVfx: "resonance",
    impactSfx: "impact-light",
    castSfx: "cast-arcane",
  },
  blood: {
    impactVfx: "blood",
    castVfx: "blood",
    impactSfx: "impact-heavy",
    castSfx: "swing-heavy",
  },
  sway: {
    impactVfx: "distortion",
    castVfx: "distortion",
    impactSfx: "impact-light",
    castSfx: "cast-arcane",
  },
  foundry: {
    impactVfx: "impact",
    castVfx: "cast",
    impactSfx: "impact-light",
    castSfx: "swing-light",
  },
};
