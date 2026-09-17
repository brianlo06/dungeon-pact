import type { UltimateDef } from "../ultimates";

/**
 * Ranger · Gloomstalker — "They should not get to see it coming."
 *
 * The Ranger's Hundredth Mark is patience made visible: a Mark on every
 * enemy, and one arrow through armour that cashes the target's in. The
 * Gloomstalker traded that patience and visibility for speed and
 * concealment (+3 speed, −6 HP, and Shadow volley in place of the Ranger's
 * volley), so its Ultimate hands out no Marks and waits for nothing. It
 * looses a volley out of the low sun behind it, where the whole enemy side
 * is staring into the glare and nobody can see it, and the only warning the
 * row gets is the arrows' own shadows running across the ground to its feet:
 *
 *  - the sun is in every enemy's eyes: **every enemy is Vulnerable this
 *    round**;
 *  - the row the volley falls on is left open longer, **Vulnerable for two
 *    rounds**, and it is open *before* the arrows land, so the volley itself
 *    lands a quarter harder;
 *  - **18 precision** on every enemy in the row, which cashes in every Mark
 *    the party left there (EXPLOIT on each);
 *  - **+2 Focus**;
 *  - **speed 24**: it resolves before every other Ultimate, so whatever the
 *    party calls in the same round lands on a side that is already open.
 *
 * It differs from the Hundredth Mark in what it does. The base Ultimate lays
 * Marks for the party and spends one on a single armour-piercing shot; this
 * one lays no Mark and pierces nothing. It spends the party's Marks across a
 * whole row at once, and what it leaves the party is an opening: every blow
 * this round a quarter harder on every enemy, and on the struck row the next
 * round too. It is not False Footing either: nobody is Weak, no windup is
 * broken, and nothing about it is defence. A team play through the reaction
 * system: a Quarry sign, a Snare or a Hunter's sign on the row is an Exploit
 * the volley cashes, and every other Ultimate and action that round lands on
 * Vulnerable.
 */
export const ultimate: UltimateDef = {
  id: "sunblind",
  heroId: "ranger",
  evolution: "rng-gloomstalker",
  name: "Sunblind",
  epithet: "All they'll ever see is the shadow.",
  description:
    "A volley out of the sun: every enemy is Vulnerable this round, and the chosen row is left Vulnerable for 2 rounds before 18 precision strikes every enemy in it, cashing in any Marks. Resolves before every other Ultimate. +2 Focus.",
  target: "enemyRow",
  effects: [
    {
      // The sun in every enemy's eyes.
      kind: "enemies",
      effects: [{ kind: "status", status: "vulnerable", stacks: 1, duration: 1 }],
    },
    {
      // The row the volley falls on: open first, then struck.
      kind: "enemies",
      row: true,
      effects: [
        { kind: "status", status: "vulnerable", stacks: 1, duration: 2 },
        { kind: "damage", amount: 18, precision: true },
      ],
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 24,
  presentation: {
    cinematic: "sunblind",
    theme: "precision",
    accent: "#ffe45c",
    voice: {
      activation: "Don't look at me. Look at the sun.",
      impact: "Heads down!",
      after: "They never even looked up.",
    },
  },
};
