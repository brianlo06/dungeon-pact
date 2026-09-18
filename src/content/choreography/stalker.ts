import { creature, melee, self } from "./kit";

/**
 * The Stalker crosses the stage fast, strikes once, and is somewhere else next round.
 */
export default creature({
  unit: { locomotion: "dash", speed: 2.4, basic: "melee", turnToReturn: true, reach: 22, anchors: { weapon: { at: [20, 46], part: "arm" }, hit: { at: [48, 52] } } },
  abilities: { footnote: melee({ charge: "short", weight: "light" }), sidenote: self({ charge: "short" }) },
});
