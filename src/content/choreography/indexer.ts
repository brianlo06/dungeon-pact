import { ARROW, MOTE, creature, projectile } from "./kit";

/**
 * The Indexer points. Everything it does is a marking at range.
 */
export default creature({
  unit: { basic: "projectile", anchors: { muzzle: { at: [22, 46], part: "arms" }, hit: { at: [50, 54] } } },
  abilities: { index: projectile({ charge: "normal", theme: "precision", projectile: MOTE }), crossref: projectile({ charge: "short", theme: "precision", projectile: MOTE }), papercut: projectile({ charge: "short", theme: "precision", projectile: ARROW }) },
});
