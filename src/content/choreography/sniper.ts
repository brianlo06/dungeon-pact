import { creature, projectile } from "./kit";

/**
 * The Rivet Sniper. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "projectile", anchors: { muzzle: { at: [75, 47] }, hit: { at: [50, 50] } } },
  abilities: { rivet: projectile({ charge: "long", weight: "heavy", theme: "precision" }) },
});
