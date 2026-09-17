import { area, creature, spell } from "./kit";

/**
 * The Maw plants itself and inhales: the Siphon is a long draw that hauls a hero in, and the Crushing jet is a blast down the row.
 */
export default creature({
  unit: { locomotion: "heavyWalk", speed: 1.2, basic: "melee", reach: 26, anchors: { hit: { at: [40, 58] }, muzzle: { at: [16, 52], part: "maw" } } },
  abilities: { siphon: spell({ charge: "long", theme: "guard" }), jet: area({ charge: "normal", theme: "guard" }) },
});
