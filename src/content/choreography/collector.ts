import { area, creature, melee } from "./kit";

/**
 * The Collector. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "melee", locomotion: "heavyWalk", speed: 0.75, reach: 52, anchors: { weapon: { at: [78, 50] }, hit: { at: [48, 50] } } },
  abilities: {
    appraise: melee({ charge: "long", weight: "heavy", theme: "contract" }),
    repossess: area({ delivery: "shockwave", charge: "long", weight: "signature", theme: "contract" }),
  },
});
