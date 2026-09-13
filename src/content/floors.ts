import type { RunState } from "../shared/model";

/**
 * Floors.
 *
 * A run used to be one route of seven chambers that ended at whichever boss
 * the dice picked — and a friend playtest finished the whole game in one
 * sitting and asked where the rest of it was. A run is now two floors, each a
 * shorter route of its own that ends at its own boss: the Collector under the
 * Foundry, then the Miser in his Counting House below the Cistern.
 *
 * A floor is its own map, so depth restarts at zero on the way down. Anything
 * that means "how far into the run" — which encounters are allowed, which
 * mentor teaches — reads `runDepth` instead, or floor two would reopen the
 * entry fights of floor one.
 */
export const FLOORS = 2;
/** Chambers on one floor, boss included. */
export const FLOOR_DEPTH = 6;

/** How far into the whole run a chamber is, across floors. */
export function runDepth(s: Pick<RunState, "floor">, depth: number) {
  return s.floor === undefined ? depth : (s.floor - 1) * FLOOR_DEPTH + depth;
}
