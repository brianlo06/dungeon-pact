import type { MapNode, RunState } from "../shared/model";

/**
 * Floors.
 *
 * A run used to be one route of seven chambers that ended at whichever boss
 * the dice picked — and a friend playtest finished the whole game in one
 * sitting and asked where the rest of it was. A run became two floors, each a
 * shorter route of its own that ends at its own boss: the Collector under the
 * Foundry, then the Miser in his Counting House below the Cistern.
 *
 * A run is now three floors, and each floor draws its boss from a pool of its
 * own when the floor is built, so two runs down the same stairs need not meet
 * the same creditors. Rooms created before this (`bossVersion` missing) keep
 * two floors and their fixed bosses, and draw nothing new from the dice.
 *
 * A floor is its own map, so depth restarts at zero on the way down. Anything
 * that means "how far into the run" — which encounters are allowed, which
 * mentor teaches — reads `runDepth` instead, or floor two would reopen the
 * entry fights of floor one.
 */
export const FLOORS = 3;
/** Floors in a run that began before boss pools: the Collector, then the Miser. */
export const LEGACY_FLOORS = 2;
/**
 * The bosses a run from before floors drew between. Frozen: a saved room of
 * that age must not meet a boss added since, or its dice would fall
 * differently from the moment it entered the vault.
 */
export const LEGACY_BOSSES = ["collector", "miser"];
/** Chambers on one floor, boss included. */
export const FLOOR_DEPTH = 6;

type Biome = NonNullable<MapNode["biome"]>;

export interface FloorDef {
  /** The region the whole floor stands in. */
  biome: Biome;
  /** What the floor is called on the map. */
  title: string;
  /** The line under it, before the party has chosen a chamber. */
  heading: string;
  /** Which mentor teaches here: one per floor, rising down the run. */
  tier: 1 | 2 | 3;
  /** Boss ids; one is drawn when the floor is built. */
  bosses: string[];
}

/**
 * The run, floor by floor. Each boss belongs to the floor whose region made
 * it: the foundry's creditors, the cistern's, and the archive's.
 */
export const floors: FloorDef[] = [
  {
    biome: "foundry",
    title: "THE EMBER FOUNDRY",
    heading: "Into the Foundry.",
    tier: 1,
    bosses: ["collector", "assayer"],
  },
  {
    biome: "cistern",
    title: "THE DROWNED CISTERN",
    heading: "Further down, where it floods.",
    tier: 2,
    bosses: ["miser", "salvor"],
  },
  {
    biome: "archive",
    title: "THE LEDGER ARCHIVE",
    heading: "Below the water, where the debts are kept.",
    tier: 3,
    bosses: ["notary"],
  },
];

/** How many floors this run goes down. */
export function floorsIn(s: Pick<RunState, "floor" | "bossVersion">) {
  if (s.floor === undefined) return 1;
  return s.bossVersion === 1 ? FLOORS : LEGACY_FLOORS;
}

/** This floor's definition, for a run with boss pools. */
export function floorDef(s: Pick<RunState, "floor">): FloorDef {
  return floors[Math.min(floors.length, Math.max(1, s.floor ?? 1)) - 1];
}

/** How far into the whole run a chamber is, across floors. */
export function runDepth(s: Pick<RunState, "floor">, depth: number) {
  return s.floor === undefined ? depth : (s.floor - 1) * FLOOR_DEPTH + depth;
}
