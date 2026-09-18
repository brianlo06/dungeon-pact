import { MOTE, creature, projectile, spell } from "./kit";

/**
 * The Scribe stays at its desk: the sentence is pressed at range, and the stamp flies.
 */
export default creature({
  unit: { basic: "projectile", anchors: { muzzle: { at: [24, 44], part: "arm" }, hit: { at: [50, 52] } } },
  abilities: { sentence: spell({ charge: "long", theme: "contract" }), stamp: projectile({ charge: "normal", theme: "contract", projectile: MOTE }) },
});
