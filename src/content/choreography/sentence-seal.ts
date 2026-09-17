import { creature } from "./kit";

/**
 * A seal does not act. It sets, and then it is enforced.
 */
export default creature({
  unit: { basic: "self", anchors: { hit: { at: [50, 55] } } },
  abilities: { },
});
