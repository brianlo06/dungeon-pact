import { area, creature, spell } from "./kit";

/**
 * The Arcanist. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "spell", anchors: { muzzle: { at: [70, 45] }, hit: { at: [50, 51] } } },
  abilities: {
    spark: spell({ charge: "short" }),
    rain: area({ delivery: "fromAbove", charge: "normal" }),
    storm: spell({ charge: "long", weight: "heavy" }),
    fire: area({ delivery: "eruption", weight: "heavy" }),
  },
});
