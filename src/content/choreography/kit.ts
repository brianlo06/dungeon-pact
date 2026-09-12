import type {
  AbilityPresentation,
  CreatureChoreography,
  ProjectileLook,
} from "../../shared/presentation";

/**
 * Builders for choreography annotations.
 *
 * Every file in this folder is one creature's annotation and nothing else, so
 * two creatures can be annotated at once without touching the same file.
 * These helpers only fill in the fields each archetype usually wants; every
 * one can be overridden, and everything is optional. None of it can change a
 * result — see `docs/CHOREOGRAPHY.md`.
 */

export const creature = (c: CreatureChoreography): CreatureChoreography => c;

/** An arrow: fast, low arc, nose along its path, sticks where it lands. */
export const ARROW: ProjectileLook = {
  visual: "arrow",
  trajectory: "arc",
  arc: 0.06,
  speed: 2.1,
  rotate: "tangent",
  trail: true,
  onArrival: "stick",
  impact: "slash",
};

/** A thrown or conjured bolt: straight, glowing, bursts on arrival. */
export const BOLT: ProjectileLook = {
  visual: "bolt",
  trajectory: "linear",
  speed: 1.7,
  rotate: "tangent",
  trail: true,
  onArrival: "burst",
  impact: "impact",
};

/** A mote of healing, drifting to its ally on a soft curve. */
export const MOTE: ProjectileLook = {
  visual: "mote",
  trajectory: "homing",
  arc: 0.18,
  speed: 1.1,
  rotate: "none",
  trail: true,
  onArrival: "burst",
  impact: "heal",
};

const merge = (
  base: AbilityPresentation,
  o: AbilityPresentation,
): AbilityPresentation => ({
  ...base,
  ...o,
  projectile: base.projectile || o.projectile
    ? { ...base.projectile, ...o.projectile }
    : undefined,
});

export const melee = (o: AbilityPresentation = {}) =>
  merge({ archetype: "melee" }, o);
export const lunge = (o: AbilityPresentation = {}) =>
  merge({ archetype: "lunge" }, o);
export const bow = (o: AbilityPresentation = {}) =>
  merge({ archetype: "bow", projectile: ARROW }, o);
export const projectile = (o: AbilityPresentation = {}) =>
  merge({ archetype: "projectile", projectile: BOLT }, o);
export const spell = (o: AbilityPresentation = {}) =>
  merge({ archetype: "spell", delivery: "bolt", projectile: BOLT }, o);
export const area = (o: AbilityPresentation = {}) =>
  merge({ archetype: "area", delivery: "eruption" }, o);
export const self = (o: AbilityPresentation = {}) =>
  merge({ archetype: "self" }, o);
export const support = (o: AbilityPresentation = {}) =>
  merge({ archetype: "support", delivery: "mote", projectile: MOTE }, o);
