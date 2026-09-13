import type { UltimateDef } from "../ultimates";

/**
 * Beguiler · Mindflayer — "Doubt is slower than a hole in the thinking."
 *
 * The Beguiler's Hall of Mirrors never touches anyone: it shows every enemy a
 * lie and lets the line turn on itself. The Mindflayer traded that subtlety
 * away (Mind spike for Ill whisper), and its Ultimate does the opposite of
 * the lie. It turns nobody. It goes straight through one mind: a psychic
 * wound that no armour stops, the plan the target was winding up broken out
 * of its head (WINDUP interrupted), and the mind left open (Vulnerable).
 *
 * The same thought passes on through every other enemy. That costs a closed
 * mind little. A mind the party has already opened is the Mindflayer's whole
 * trade: every enemy that is Vulnerable when it lands is holed as well, and
 * loses its windup too. So it is a team play. The Beguiler's own Mind spike
 * and Unpick the seam, the Breaker, the Aegis Knight and the Broker all leave
 * Vulnerable enemies behind, and Vulnerable multiplies the hit it pays out.
 *
 * Every enemy takes at least the passing sliver on purpose. A film's cast is
 * the enemies an Ultimate *damaged* (`cinematic/segments.ts`), so without it
 * the film could only ever show the one mind, never the thought passing on.
 */
export const ultimate: UltimateDef = {
  id: "open-mind",
  heroId: "beguiler",
  evolution: "bgl-mindflayer",
  name: "The Open Mind",
  epithet: "Doubt goes the long way round. I don't.",
  description:
    "Drive one thought straight through an enemy: 24 arcane through armour, its WINDUP broken, and it is left Vulnerable. The thought passes on through every other enemy, and any mind already Vulnerable is holed too: 10 more arcane and its WINDUP broken.",
  target: "enemy",
  effects: [
    {
      kind: "interrupt",
    },
    {
      kind: "damage",
      amount: 24,
      damageType: "arcane",
      pierce: true,
    },
    {
      kind: "status",
      status: "vulnerable",
      stacks: 1,
      duration: 2,
    },
    {
      kind: "enemies",
      others: true,
      effects: [
        {
          // A mind the party already opened: holed, and its plan broken.
          kind: "conditional",
          status: "vulnerable",
          effects: [
            { kind: "damage", amount: 10, damageType: "arcane", pierce: true },
            { kind: "interrupt" },
          ],
        },
        // The thought passing through a closed one: the Mindflayer's power, no more.
        { kind: "damage", amount: 0, damageType: "arcane", pierce: true },
      ],
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 18,
  presentation: {
    cinematic: "open-mind",
    theme: "sway",
    accent: "#c7f06a",
    voice: {
      activation: "Hold still. I only need the one thought.",
      impact: "There. Now it's open.",
      after: "Try to remember what you were about to do.",
    },
  },
};
