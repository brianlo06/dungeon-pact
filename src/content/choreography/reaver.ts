import { area, creature, melee } from "./kit";

/**
 * The Reaver. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: {
    basic: "melee", locomotion: "dash", speed: 1.55, reach: 38,
    anchors: { weapon: { at: [75, 53] }, hit: { at: [50, 52] } },
  },
  abilities: {
    rend: melee({ charge: "short" }),
    bloodprice: melee({ charge: "long", weight: "signature", theme: "blood" }),
    frenzy: area({ delivery: "shockwave", weight: "heavy", theme: "blood" }),
  },
});
