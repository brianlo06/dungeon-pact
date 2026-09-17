import { creature, melee, support } from "./kit";

/**
 * The Tender works with its hands: plating and reinforcing are support gestures, never strikes.
 */
export default creature({
  unit: { basic: "spell", anchors: { hit: { at: [50, 55] } } },
  abilities: { plate: support({ charge: "normal", theme: "guard" }), reinforce: support({ charge: "short", theme: "guard" }), scour: melee({ charge: "short" }) },
});
