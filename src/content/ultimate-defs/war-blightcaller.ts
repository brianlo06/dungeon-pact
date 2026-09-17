import type { UltimateDef } from "../ultimates";

/**
 * Warden · Blightcaller — "Growth, pointed the other way."
 *
 * Green Reckoning is the Warden's kit as a sweep: every ally healed a little,
 * cleansed and lifted, and a slow poison left on every enemy. The Blightcaller
 * traded Briar prison for Blight — a whole row poisoned twice as hard — and
 * its Ultimate gives the party nothing directly. It takes the one light the
 * party carries down into the dirt, and everything that grows follows it.
 *
 * Every Head Bowed is aimed at an enemy row. Each enemy in it is bitten for
 * 10 through armour (the blight's first bite, like the poison after it,
 * ignores Guard), Poisoned 10 a round for three rounds, and bent over, Weak,
 * for the round it is called. Anything in the row that was already Poisoned
 * rots through: Vulnerable for two rounds, so the party's direct hits on it —
 * a cleaver, an Exploit, a Chain Shock — land a quarter harder. The Warden's
 * own Blight sets that up, and so does anyone else's poison. +2 Growth.
 *
 * The rot-through check comes before the new Poison lands, so only a row that
 * was already rotting counts.
 */
export const ultimate: UltimateDef = {
  id: "every-head-bowed",
  heroId: "warden",
  evolution: "war-blightcaller",
  name: "Every Head Bowed",
  epithet: "What turns to the light will follow it down.",
  description:
    "Blight an enemy row: each takes 10 through armour, is Poisoned 10 for 3 rounds and Weak this round. Any already Poisoned rots through: Vulnerable for 2 rounds. +2 Growth.",
  target: "enemyRow",
  effects: [
    {
      kind: "enemies",
      row: true,
      effects: [
        {
          // Already rotting: it goes through.
          kind: "conditional",
          status: "poison",
          effects: [{ kind: "status", status: "vulnerable", stacks: 1, duration: 2 }],
        },
        { kind: "damage", amount: 10, pierce: true },
        { kind: "status", status: "poison", stacks: 10, duration: 3 },
        { kind: "status", status: "weak", stacks: 1, duration: 1 },
      ],
    },
    { kind: "resource", amount: 2 },
  ],
  cost: 100,
  speed: 10,
  presentation: {
    cinematic: "every-head-bowed",
    theme: "growth",
    accent: "#d9a13c",
    voice: {
      activation: "Look up, little ones. Here is your light.",
      impact: "And follow it down.",
      after: "Heads bowed. It's warm in the dirt.",
    },
  },
};
