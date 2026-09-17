import { creature } from "./kit";

/**
 * A plate does not act. It sits, sets, and answers for its host.
 */
export default creature({
  unit: { basic: "self", anchors: { hit: { at: [50, 60] } } },
  abilities: { },
});
