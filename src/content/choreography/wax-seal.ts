import { area, creature } from "./kit";

/** A wax seal never moves. When it is enforced every hero feels it at once. */
export default creature({
  unit: { basic: "self", anchors: { hit: { at: [50, 56] } } },
  abilities: {
    enforce: area({ delivery: "shockwave", charge: "long", weight: "signature", theme: "contract" }),
  },
});
