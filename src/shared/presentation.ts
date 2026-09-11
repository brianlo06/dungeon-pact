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

/** Clips an animation player can be asked for. Missing clips fall back. */
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
  | "defeat";

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
  | "miser-coin";

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
