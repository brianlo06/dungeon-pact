import { creature, melee, support } from "./kit";

/**
 * The Kiln Mender. Phase 1 annotated only what it needs as a target: shots
 * land in the bellows sac, which is what flinches. Its own moves (Repair
 * lattice, Wrench) are still on the generic defaults.
 */
export default creature({
  unit: {
    basic: "support",
    anchors: {
      hit: { at: [52, 52], part: "bellows" },
    },
  },
  abilities: {
    repair: support({ delivery: "mote", charge: "normal", theme: "growth" }),
    wrench: melee({ charge: "short", weight: "light" }),
  },
});
