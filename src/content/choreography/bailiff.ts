import { area, creature, melee } from "./kit";

/**
 * The Bailiff walks up to the one it has come for. Collect and the serving
 * are both delivered in person with the staff; garnishing is a sweep across a
 * row.
 */
export default creature({
  unit: {
    basic: "melee",
    locomotion: "heavyWalk",
    speed: 0.7,
    reach: 56,
    anchors: { weapon: { at: [9, 22], part: "staff" }, hit: { at: [52, 58] } },
  },
  abilities: {
    /** Collect: the staff brought down on the carrier. */
    collect: melee({ charge: "long", weight: "heavy", theme: "contract" }),
    /** Serving a lien: the writ delivered in person. */
    "serve-lien": melee({ charge: "long", weight: "signature", theme: "contract" }),
    /** Garnish wages: a sweep across a row. */
    garnish: area({ delivery: "shockwave", charge: "short", weight: "heavy", theme: "contract" }),
  },
});
