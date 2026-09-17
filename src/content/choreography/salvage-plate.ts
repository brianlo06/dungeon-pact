import { creature, support } from "./kit";

/** A soft plate never moves; when it hardens it goes to the Salvor. */
export default creature({
  unit: { basic: "self", anchors: { hit: { at: [50, 60] } } },
  abilities: {
    harden: support({ charge: "short", weight: "heavy", theme: "guard" }),
  },
});
