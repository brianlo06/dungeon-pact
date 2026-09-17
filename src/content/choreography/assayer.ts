import { area, creature, melee, self } from "./kit";

/**
 * The Assayer. It does not walk up to anyone: it reaches with the tongs, and
 * the pour is a wave of metal thrown out over a whole row from the crucible.
 */
export default creature({
  unit: {
    basic: "melee",
    locomotion: "heavyWalk",
    speed: 0.55,
    reach: 60,
    anchors: { weapon: { at: [2, 50], part: "tongs" }, hit: { at: [57, 58] } },
  },
  abilities: {
    /** Tongs: a jab with the crucible's edge. */
    tongs: melee({ charge: "short", weight: "heavy", theme: "foundry" }),
    /** Slag spit: a spray over a row. */
    slag: area({ delivery: "shockwave", charge: "short", weight: "heavy", theme: "foundry" }),
    /** Heating the crucible. */
    assay: self({ charge: "long", weight: "heavy", theme: "foundry" }),
    /** The pour, the move it heats for. */
    pour: area({ delivery: "shockwave", charge: "long", weight: "signature", theme: "foundry" }),
  },
});
