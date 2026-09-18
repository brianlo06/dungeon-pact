import { area, creature, melee } from "./kit";

/**
 * The Engine never travels. It hammers in place while the gauge climbs, and the vent goes off where it stands.
 */
export default creature({
  unit: { basic: "self", anchors: { hit: { at: [50, 55] } } },
  abilities: { build: melee({ charge: "long", weight: "heavy", theme: "foundry" }), vent: area({ charge: "long", theme: "foundry" }) },
});
