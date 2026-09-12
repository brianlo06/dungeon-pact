import { creature, self, support } from "./kit";

/**
 * The actions every hero shares, and the supplies anyone can carry. A
 * creature's own file wins over this one for the same ability id.
 *
 * "Take the front" and "Fall back" are real row changes resolved by the
 * engine: the settled board puts the hero in its new rank. Their
 * choreography is deliberately `self` — performed where the hero stands —
 * so a temporary choreographic move is never confused with the gameplay one.
 */
export default creature({
  abilities: {
    brace: self(),
    advance: self(),
    retreat: self(),
    revive: support({ delivery: "bloom" }),
  },
});
