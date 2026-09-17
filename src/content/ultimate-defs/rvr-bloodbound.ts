import type { UltimateDef } from "../ultimates";

/**
 * Reaver · Bloodbound — "The debt runs both ways now."
 *
 * Red Ledger pays: 14 HP, spent on 40 through armour and a slash across the
 * target's row. The Bloodbound traded Blood price for **Blood pact** (lose
 * 10, deal 40 through armour, and take 14 back): the only Reaver whose blood
 * comes home. Its Ultimate is that pact sworn on the cleaver itself, so the
 * blade runs both ways:
 *
 *  - the Reaver's blood goes out along it: **12 HP paid**;
 *  - and into the enemy, under the armour: **30 through armour**;
 *  - the enemy's comes back up it: the Reaver **takes back 26**, and **12
 *    more** if the party had already opened that enemy (Vulnerable) before
 *    the pact was sworn: an open wound pays back faster;
 *  - and a pact binds both parties: the enemy is left **Vulnerable for two
 *    rounds**, and the Reaver **Vulnerable this round**;
 *  - **+2 Fury**.
 *
 * How it differs from Red Ledger, in what it does: no row is struck; the
 * Reaver ends the cast with more health than it started (a net 14, or 26 on
 * an open enemy), where Red Ledger always leaves it 14 down; and it leaves
 * one enemy open to the whole party for two rounds, at the price of standing
 * open itself for one. Red Ledger is a price and a burst. Give and Take is an
 * exchange: blood out, blood back, and both of them open afterwards.
 *
 * It is not A Good Hiding either (no Barrier, no Weak, no Empowered, no blow
 * invited): nothing is absorbed, it is traded.
 *
 * The team play runs both ways too. Every ally's blow on the bound enemy
 * lands a quarter harder for two rounds (an Exploit or a Chain Shock on it
 * included); an enemy the party has already opened (Drag them down, the
 * Breaker, the Broker, Mind spike, Proof Shot) pays the Reaver back more.
 * And the Reaver standing open for a round is a Reaver being hit, which is
 * how a Reaver fills its meter (hurt ×1.8) — or a Vanguard's guard link
 * turned into Pact Charge.
 */
export const ultimate: UltimateDef = {
  id: "give-and-take",
  heroId: "reaver",
  evolution: "rvr-bloodbound",
  name: "Give and Take",
  epithet: "Every drop I spend comes home.",
  description:
    "Swear a pact on the cleaver: lose 12 HP, deal 30 through armour, and take 26 back (38 if the enemy was already Vulnerable). The enemy is left Vulnerable for two rounds; the Reaver is Vulnerable this round. +2 Fury.",
  target: "enemy",
  effects: [
    {
      // Blood out.
      kind: "damage",
      amount: 12,
      self: true,
    },
    {
      // Into the enemy, under whatever it wears.
      kind: "damage",
      amount: 30,
      pierce: true,
    },
    {
      // An open wound pays back faster. Read before the pact opens it.
      kind: "conditional",
      status: "vulnerable",
      effects: [{ kind: "heal", amount: 12, self: true }],
    },
    {
      // Blood back.
      kind: "heal",
      amount: 26,
      self: true,
    },
    {
      // Both parties to a pact are bound by it.
      kind: "status",
      status: "vulnerable",
      stacks: 1,
      duration: 2,
    },
    {
      kind: "status",
      status: "vulnerable",
      stacks: 1,
      duration: 1,
      self: true,
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 10,
  presentation: {
    cinematic: "give-and-take",
    theme: "blood",
    accent: "#e0466f",
    voice: {
      activation: "I bleed, you bleed.",
      impact: "Your turn.",
      after: "Square.",
    },
  },
};
