import type { UltimateDef } from "../ultimates";

/**
 * Arcanist · Tidecaller — "The tide arrives whether you are ready or not."
 *
 * UNDERTOW. The Tidecaller has been holding the whole sea back with one open
 * hand; it lets go. Not a bolt and not a burst: the sea's weight on every
 * enemy at once, the whole line Wet and dragged Weak for two rounds, the
 * target's plan gone under, and anyone who was already standing in water
 * when the tide turned (Wet before the cast — the Tidecaller's own Riptide
 * the round before) dragged under with it: interrupted, and struck again
 * through armour.
 *
 * Where Debt of Thunder spends the Wet it lays on one target, Undertow
 * spends nothing and controls everything. Its damage is spread thin across
 * the whole side rather than piled on one; its power is the two rounds in
 * which every enemy hits for a third less, and the WINDUPs it takes away.
 * The film is `src/content/cinematics/undertow.ts`; the storyboard is
 * `docs/ultimates/undertow.md`.
 */
export const ultimate: UltimateDef = {
  id: "undertow",
  heroId: "arcanist",
  evolution: "arc-tidecaller",
  name: "Undertow",
  epithet: "You were never on dry land.",
  description:
    "Let the sea go: 12 arcane on the target and its WINDUP broken, 10 arcane on every enemy, and every enemy Wet for 3 rounds and Weak for 2. Any enemy already Wet when the tide turns is dragged under too: interrupted and 6 more through armour. +2 Mana.",
  target: "enemy",
  effects: [
    {
      kind: "enemies",
      effects: [
        {
          // Already standing in the water when it turned: dragged under first.
          kind: "conditional",
          status: "wet",
          effects: [
            { kind: "interrupt" },
            { kind: "damage", amount: 6, damageType: "arcane", pierce: true },
          ],
        },
        { kind: "damage", amount: 10, damageType: "arcane" },
        { kind: "status", status: "wet", stacks: 1, duration: 3 },
        { kind: "status", status: "weak", stacks: 1, duration: 2 },
      ],
    },
    { kind: "damage", amount: 12, damageType: "arcane" },
    { kind: "interrupt" },
    { kind: "resource", amount: 2 },
  ],
  cost: 100,
  speed: 6,
  presentation: {
    cinematic: "undertow",
    theme: "arcane",
    accent: "#4a7dff",
    voice: {
      activation: "Mind your feet.",
      impact: "Let go.",
      after: "Twice a day. Nobody's ever ready.",
    },
  },
};
