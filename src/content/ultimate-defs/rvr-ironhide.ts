import type { UltimateDef } from "../ultimates";

/**
 * Reaver · Ironhide — "Stop bleeding. Start absorbing."
 *
 * Red Ledger pays: the Reaver opens its own hand, loses 14 HP and spends it
 * on one enormous cut through armour and a slash across the row. The
 * Ironhide gave that trade up (Ironrend for Rend: a blow that leaves it
 * Barrier instead of costing it blood, +26 HP, +2 guard, −2 speed). Its pain
 * still turns into force; it just stopped inflicting the pain on itself. So
 * its Ultimate takes the enemy's blow instead, and keeps it:
 *
 *  - the enemy it faces spends its blow on the Ironhide's hide: any WINDUP it
 *    was holding is broken, and it is left Weak for two rounds, its strength
 *    gone into the hide rather than into the party;
 *  - the blow goes in and stays in: 20 Barrier, and Regeneration 6 for three
 *    rounds (the wound closing, not bleeding);
 *  - and it comes back out: the Ironhide is Empowered this round and next,
 *    and hits the enemy for 22 with it at once (+2 Fury).
 *
 * How it differs from Red Ledger, in what it does: nothing is paid in HP,
 * nothing goes through armour, and no row is struck. Red Ledger is a price
 * and a burst; A Good Hiding is a trade of blows across two rounds. It
 * disarms the one enemy that matters (the bot aims it at the enemy doing the
 * most to the party), keeps the Ironhide standing in front of it, and makes
 * the Ironhide's own plan this round and next land 30% harder: a Blood price
 * or a Frenzy taken out of the new Barrier instead of out of its blood.
 *
 * The team play is Weak and the windup. The whole party takes a third less
 * from that enemy for two rounds, a windup the party could not interrupt is
 * spent, and an Empowered Ironhide's next blow on an enemy the party has made
 * Vulnerable is both. It gives nobody a guard link and wards nobody: the
 * Ironhide is not a wall in front of the party, it is the thing the blow was
 * spent on.
 */
export const ultimate: UltimateDef = {
  id: "good-hiding",
  heroId: "reaver",
  evolution: "rvr-ironhide",
  name: "A Good Hiding",
  epithet: "Every blow you land, I keep.",
  description:
    "Take the enemy's blow on the hide: its WINDUP is broken and it is left Weak for two rounds. The Ironhide keeps the blow as 20 Barrier and Regeneration 6 for three rounds, and gives it back: Empowered this round and next, it strikes for 22 at once and gains 2 Fury.",
  target: "enemy",
  effects: [
    {
      // The blow it was saving is spent on the hide.
      kind: "interrupt",
    },
    {
      // Its strength goes into the Ironhide, not into the party.
      kind: "status",
      status: "weak",
      stacks: 1,
      duration: 2,
    },
    {
      // Kept: the hide takes it, and the wound closes instead of running.
      kind: "status",
      status: "barrier",
      stacks: 20,
      duration: 2,
      self: true,
    },
    {
      kind: "status",
      status: "regen",
      stacks: 6,
      duration: 3,
      self: true,
    },
    {
      // And given back, starting now.
      kind: "status",
      status: "empowered",
      stacks: 1,
      duration: 2,
      self: true,
    },
    {
      kind: "damage",
      amount: 22,
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
