import type { RunState, StatusId, Unit } from "../shared/model";

/**
 * What happened in a fight, for measurement only.
 *
 * The engine reports moments here as it resolves them; nothing listens in the
 * game, and nothing reported changes state, logs or beats, so a replay is
 * exactly what it was. `scripts/simulate.ts` attaches a sink to learn what
 * each creature and encounter actually does over thousands of runs — the way
 * to tell a mechanic that never matters from one the bot never triggers.
 */
export type Probe =
  /** Health a unit lost to another (after Barrier). */
  | { kind: "hit"; actor: Unit; target: Unit; amount: number }
  | { kind: "status"; actor: Unit; target: Unit; status: StatusId; stacks: number }
  /** A unit's row changed because of what someone else did. */
  | { kind: "moved"; actor: Unit; target: Unit }
  | { kind: "spawned"; actor: Unit; object: string }
  | { kind: "interrupted"; actor: Unit; target: Unit }
  | { kind: "cracked"; target: Unit }
  /**
   * A countdown resolved: an object's fuse, a debt, a lien. `source` is the
   * unit that set it, read before the status is lifted — without it nothing
   * can be credited, which is how the first measurement lost every debt.
   */
  | {
      kind: "due";
      unit: Unit;
      what: "object" | "debt" | "lien";
      amount: number;
      source?: string;
    }
  /** A spawned object broken before its fuse ran out. */
  | { kind: "broken"; actor: Unit; target: Unit }
  | { kind: "defeated"; actor: Unit; target: Unit }
  /** Gold an enemy took from the treasury. */
  | { kind: "gold"; actor: Unit; amount: number }
  | { kind: "drained"; actor: Unit; target: Unit; amount: number };

export const probe: { sink?: (s: RunState, p: Probe) => void } = {};
export const emit = (s: RunState, p: Probe) => probe.sink?.(s, p);
