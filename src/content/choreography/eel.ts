import { BOLT, MOTE, creature, projectile } from "./kit";

/**
 * The Eel snaps forward from the water: Soak throws brine, Conduct throws the charge it has been waiting to spend.
 */
export default creature({
  unit: { basic: "projectile", anchors: { muzzle: { at: [20, 46], part: "head" }, hit: { at: [50, 55] } } },
  abilities: { soak: projectile({ charge: "short", theme: "guard", projectile: MOTE }), conduct: projectile({ charge: "long", theme: "arcane", projectile: BOLT }) },
});
