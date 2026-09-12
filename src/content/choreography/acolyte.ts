import { creature, spell } from "./kit";

/**
 * The Ash Acolyte. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "spell", anchors: { muzzle: { at: [69, 42] } } },
  abilities: { ember: spell({ charge: "normal", theme: "foundry" }) },
});
