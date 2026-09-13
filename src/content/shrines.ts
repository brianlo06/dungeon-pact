/**
 * A shrine's two bargains, shared by the engine that applies them and the
 * screen that offers them. Both give Power for the rest of the run; one is paid
 * in the hero's own maximum health, the other in the party's gold.
 */
export const OFFERINGS = {
  blood: { power: 3, maxHp: -10, gold: 0 },
  gold: { power: 2, maxHp: 0, gold: 150 },
} as const;
export type Offering = keyof typeof OFFERINGS | "leave";
