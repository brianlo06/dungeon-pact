import type { UltimateDef } from "../ultimates";

/**
 * Vanguard · Aegis Knight — "Stand still. Let it break on you."
 *
 * The Lantern Wall spreads Barrier over the party and then charges one
 * threat. The Aegis Knight does neither: it never moves and never shares its
 * guard out. Every blow meant for an ally this round is drawn onto the Knight
 * itself (a guard link on each of them, paid for in the Knight's own Barrier),
 * every enemy's blows are blunted before they land (Weak, this round), and
 * what breaks on the shield comes back — a little to every enemy, and in full
 * to the one it answers, which is left open for the party.
 *
 * The fortress is the Knight's body, not a ward on each ally, which is what
 * the path traded its speed for.
 */
export const ultimate: UltimateDef = {
  id: "breakwater",
  heroId: "vanguard",
  evolution: "van-aegis",
  name: "Breakwater",
  epithet: "Everything that comes here breaks.",
  description:
    "The Aegis Knight takes every ally's next direct hit this round, with 14 Barrier and 10 more per ally. Every enemy is Weak this round and takes 6 back; the enemy it answers takes 14 more through armour and is left Vulnerable.",
  target: "enemy",
  effects: [
    {
      kind: "allies",
      effects: [{ kind: "protect", barrier: 10 }],
    },
    {
      kind: "status",
      status: "barrier",
      stacks: 14,
      duration: 2,
      self: true,
    },
    {
      kind: "enemies",
      effects: [
        { kind: "damage", amount: 6 },
        { kind: "status", status: "weak", stacks: 1, duration: 1 },
      ],
    },
    {
      kind: "damage",
      amount: 14,
      pierce: true,
    },
    {
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
  speed: 16,
  presentation: {
    cinematic: "breakwater",
    theme: "guard",
    accent: "#7fe6c3",
    voice: {
      activation: "Let it come.",
      impact: "It breaks. I don't.",
      after: "Again, if you like.",
    },
  },
};
