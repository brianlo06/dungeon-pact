import type { UltimateDef } from "../ultimates";

/**
 * Reaver · Ironhide — "Stop bleeding. Start absorbing."
 *
 * Red Ledger pays: the Reaver loses 14 HP on purpose and spends it on one
 * enormous cut through armour and a slash across the target's row. The
 * Ironhide gave that trade up (Ironrend for Rend: a blow that leaves it
 * Barrier instead of costing it blood; +26 HP, +2 guard, −2 speed). Its pain
 * still turns into force. It has only stopped inflicting the pain on itself.
 * So its Ultimate takes the enemy's blow instead, and keeps it:
 *
 *  - the enemy it faces spends its strength on the Ironhide's hide and is
 *    left Weak for two rounds: every blow it throws at the party this round
 *    and next lands a third lighter;
 *  - the blow goes in and stays in: the Ironhide gains 16 Barrier;
 *  - and it comes back out: Empowered this round, the Ironhide hits that
 *    enemy for 12 at once, and gains 2 Fury.
 *
 * How it differs from Red Ledger, in what it does: nothing is paid in HP,
 * nothing goes through armour, and no row is struck. Red Ledger is a price
 * and a burst; A Good Hiding is an exchange of blows. It disarms the one
 * enemy that matters (the bot aims it at the enemy doing the most to the
 * party), leaves the Ironhide's hide thicker, and makes its own plan this
 * round land 30% harder: a Blood price or a Frenzy paid out of the new
 * Barrier instead of out of its blood, which is the Ironhide's whole kit.
 *
 * The team play is Weak and Empowered. The whole party takes a third less
 * from that enemy for two rounds, and the Ironhide's Empowered action this
 * round on an enemy the party has made Vulnerable (Drag them down, the
 * Breaker, the Broker, Seed of doubt) is both. It gives nobody a guard link
 * and wards nobody: the Ironhide is not a wall in front of the party, it is
 * the body the enemy's strength was spent on.
 *
 * Its hurt affinity is untouched: nothing here stops the Ironhide being hit,
 * and a Reaver still fills its meter by taking punishment. Speed 4: slow and
 * heavy, like the path.
 */
export const ultimate: UltimateDef = {
  id: "good-hiding",
  heroId: "reaver",
  evolution: "rvr-ironhide",
  name: "A Good Hiding",
  epithet: "Every blow you land, I keep.",
  description:
    "Take an enemy's strength on the hide: it is left Weak for two rounds. The Ironhide keeps the blow as 16 Barrier and gives it back, Empowered this round: it strikes that enemy for 12 at once and gains 2 Fury.",
  target: "enemy",
  effects: [
    {
      // Its strength goes into the hide, not into the party.
      kind: "status",
      status: "weak",
      stacks: 1,
      duration: 2,
    },
    {
      // Kept.
      kind: "status",
      status: "barrier",
      stacks: 16,
      duration: 2,
      self: true,
    },
    {
      // And given back, starting now: the blow below is Empowered too.
      kind: "status",
      status: "empowered",
      stacks: 1,
      duration: 1,
      self: true,
    },
    {
      kind: "damage",
      amount: 12,
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 4,
  presentation: {
    cinematic: "good-hiding",
    theme: "blood",
    accent: "#a9b7c1",
    voice: {
      activation: "Go on. Hit me.",
      impact: "Here. Have it back.",
      after: "Didn't even bleed.",
    },
  },
};
