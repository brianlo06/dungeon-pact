import { creature, spell } from "./kit";

/**
 * The Wraith writes: every move it makes is a gesture over its ledger.
 */
export default creature({
  unit: { basic: "spell", anchors: { muzzle: { at: [26, 40], part: "ledger" }, hit: { at: [50, 50] } } },
  abilities: { entry: spell({ charge: "long", theme: "contract" }), interest: spell({ charge: "short", theme: "contract" }), grasp: spell({ charge: "short" }) },
});
