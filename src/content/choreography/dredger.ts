import { creature, melee, support } from "./kit";

/**
 * The Dredger works a chain: it hooks the party, and hauls its own crew around.
 */
export default creature({
  unit: { locomotion: "heavyWalk", speed: 1.1, basic: "melee", reach: 30, anchors: { weapon: { at: [18, 44], part: "chain" }, hit: { at: [46, 56] } } },
  abilities: { dredge: melee({ charge: "long", weight: "heavy" }), drag: support({ charge: "normal" }), shove: support({ charge: "normal" }) },
});
