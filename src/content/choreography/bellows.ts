import { area, creature } from "./kit";

/**
 * The Living Bellows. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "area", anchors: { muzzle: { at: [67, 47] }, hit: { at: [49, 52] } } },
  abilities: { exhale: area({ delivery: "shockwave", charge: "long", weight: "heavy", theme: "foundry" }) },
});
