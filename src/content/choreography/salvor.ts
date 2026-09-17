import { area, creature, melee, self } from "./kit";

/**
 * The Salvor. It hauls rather than walks: the gaff reaches out over the floor,
 * and the volley is its loose plates thrown off the hump over a whole row.
 */
export default creature({
  unit: {
    basic: "melee",
    locomotion: "heavyWalk",
    speed: 0.5,
    reach: 64,
    anchors: { weapon: { at: [8, 16], part: "hook" }, hit: { at: [52, 58] } },
  },
  abilities: {
    /** Gaff hook: the pole brought down on one hero. */
    gaff: melee({ charge: "short", weight: "heavy", theme: "guard" }),
    /** Rust volley: plates thrown off the hump over a row. */
    volley: area({ delivery: "shockwave", charge: "long", weight: "signature", theme: "guard" }),
    /** Grind the wreck: the hump dragged across a row. */
    grind: area({ delivery: "shockwave", charge: "short", weight: "heavy", theme: "guard" }),
    /** Growing a plate. */
    encrust: self({ charge: "long", weight: "heavy", theme: "guard" }),
  },
});
