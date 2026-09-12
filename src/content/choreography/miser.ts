import { area, creature, melee } from "./kit";

/**
 * The Miser. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "melee", locomotion: "heavyWalk", speed: 0.7, reach: 42, anchors: { hit: { at: [48, 51] } } },
  abilities: {
    hoard: melee({ charge: "long", weight: "heavy", theme: "contract" }),
    tax: area({ delivery: "shockwave", charge: "long", weight: "signature", theme: "contract" }),
  },
});
