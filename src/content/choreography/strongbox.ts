import { creature, self } from "./kit";

/**
 * The Strongbox. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "self", anchors: { hit: { at: [50, 55] } } },
  abilities: { seal: self({ charge: "long", weight: "heavy", theme: "contract" }) },
});
