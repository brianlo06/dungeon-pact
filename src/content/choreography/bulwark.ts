import { creature, melee, self } from "./kit";

/**
 * The Iron Bulwark. Phase 1 annotated only what it needs as a target: blows
 * land on the plate, a few units in from the ram's point, and projectiles on
 * the plate's middle. Its own moves (Shield ram, Lock shields) are still on
 * the generic defaults.
 */
export default creature({
  unit: {
    basic: "melee",
    locomotion: "charge",
    speed: 0.9,
    reach: 30,
    strikeInset: 5,
    anchors: {
      hit: { at: [46, 58], part: "shield" },
    },
  },
  abilities: {
    ram: melee({ charge: "long", weight: "heavy", theme: "guard" }),
    lock: self({ weight: "heavy", theme: "guard" }),
  },
});
