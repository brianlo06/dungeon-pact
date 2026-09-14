import type { UltimateDef } from "../ultimates";

/**
 * Ranger · Sharpshooter — "Armour is just a slower target."
 *
 * The Ranger's Hundredth Mark is a choice: a Mark on every enemy, and one
 * arrow through armour that cashes the target's in. The Sharpshooter traded
 * True shot for Piercing shot (22 through armour, +1 Focus) and took +3
 * power: the kit of someone who does not choose between targets but goes
 * through whatever the one it chose is wearing. So its Ultimate lays no
 * Marks for anyone and touches no other enemy. It is two shots at one
 * target from the far end of the range, and the second goes through the
 * hole the first one made:
 *
 *  - the target's Barrier is stripped: the plate it trusted comes off first;
 *  - **the proof shot**: 12 precision through armour (a Mark the party left
 *    on the target is cashed: EXPLOIT), and the arrow standing in the target
 *    is its **Mark**;
 *  - **the second shot**: 12 precision through armour into the same hole,
 *    which cashes that Mark: a second EXPLOIT, always;
 *  - the armour has a hole in it now: the target is **Vulnerable for 2
 *    rounds** for the whole party;
 *  - +2 Focus (one per shot, as Piercing shot earns it).
 *
 * It differs from the Hundredth Mark in what it does. The base Ultimate marks
 * everything and finishes one; this one marks nothing for the party, reaches
 * no second enemy, strips Barrier, strikes twice, and leaves an opening on
 * one target instead of Marks on all of them. It is not False Footing (snare,
 * Weak, windups broken) nor Sunblind (a row volley, the whole side
 * Vulnerable, fastest): nobody else is touched, and at speed 4 it resolves
 * *after* most other Ultimates, so it lands on whatever the party has
 * already opened. A team play through the reaction system both ways: a
 * Quarry sign, a Snare or a Hunter's sign on the target is a third Exploit
 * the proof shot cashes, and the Vulnerable it leaves is a quarter more on
 * every blow the party lands there for two rounds.
 *
 * Both shots are precision: the first spends the party's Mark on purpose
 * (the Sharpshooter is the one who cashes it), and the second spends its own.
 */
export const ultimate: UltimateDef = {
  id: "proof-shot",
  heroId: "ranger",
  evolution: "rng-sharpshooter",
  name: "Proof Shot",
  epithet: "One to prove the plate. One to go through it.",
  description:
    "Strip the target's Barrier, then two shots from the far end of the range: 12 precision through armour, the arrow standing in it as a Mark, and 12 more through the same hole (EXPLOIT). The armour has a hole in it now: the target is Vulnerable for 2 rounds. +2 Focus. Resolves after most other Ultimates.",
  target: "enemy",
  effects: [
    {
      // The plate comes off first: nothing the shot has to chew through.
      kind: "removeStatus",
      status: "barrier",
    },
    {
      // The proof shot: through the armour; a Mark already there is cashed.
      kind: "damage",
      amount: 12,
      precision: true,
      pierce: true,
    },
    {
      // The arrow standing in the target is the mark the second shot finds.
      kind: "status",
      status: "marked",
      stacks: 1,
      duration: 1,
    },
    {
      // The second shot, through the same hole: EXPLOIT.
      kind: "damage",
      amount: 12,
      precision: true,
      pierce: true,
    },
    {
      // A hole in the armour: open to the whole party for two rounds.
      kind: "status",
      status: "vulnerable",
      stacks: 1,
      duration: 2,
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 4,
  presentation: {
    cinematic: "proof-shot",
    theme: "precision",
    accent: "#6a9bff",
    voice: {
      activation: "Stay there. It's a long way. You won't hear it.",
      impact: "Clean through.",
      after: "See? Armour's just something slower to hit.",
    },
  },
};
