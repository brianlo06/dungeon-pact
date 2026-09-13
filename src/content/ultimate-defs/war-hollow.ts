import type { UltimateDef } from "../ultimates";

/**
 * Warden · Hollow Druid — "The green remembers what was taken."
 *
 * The Warden's Green Reckoning is the kit at its gentlest: every ally healed,
 * lifted and cleansed, and a slow poison left on the rest. The Hollow Druid
 * traded the healing dew for Drown, and its Ultimate heals nobody. It is
 * grief with a direction: one enemy is drowned — hurt, soaked, and left too
 * heavy with it to hit hard for two rounds (Wet and Weak) — and the water it
 * was drowned in runs out under the whole enemy line.
 *
 * Mourning Water remembers. Anything the party has already soaked is taken
 * further: the chosen enemy, if it was Wet already, is held under for 10
 * more; every other enemy that was Wet is dragged down with it, Weak this
 * round. Everything else is left Wet. So it is a team play twice over: the
 * Warden's own Drown, the Arcanist's rain and the Tidecaller set it up, and
 * it leaves a whole line soaked for the party's lightning (Chain Shock).
 *
 * Conditionals come before the water is laid, so only what was already wet
 * counts. The others take no damage; the film's cast is the one it drowns,
 * and the rest of the line is drawn off the board.
 */
export const ultimate: UltimateDef = {
  id: "mourning-water",
  heroId: "warden",
  evolution: "war-hollow",
  name: "Mourning Water",
  epithet: "One tear, with everything the green lost in it.",
  description:
    "Drown one enemy: 24, Wet, and Weak for 2 rounds — 10 more if it was already Wet. The water runs under the whole line: every other enemy is Wet, and any that already were are Weak this round. +2 Growth.",
  target: "enemy",
  effects: [
    {
      // Held under longer, if the party had already soaked it.
      kind: "conditional",
      status: "wet",
      effects: [{ kind: "damage", amount: 10 }],
    },
    {
      kind: "damage",
      amount: 24,
    },
    {
      kind: "status",
      status: "wet",
      stacks: 1,
      duration: 3,
    },
    {
      kind: "status",
      status: "weak",
      stacks: 1,
      duration: 2,
    },
    {
      kind: "enemies",
      others: true,
      effects: [
        {
          // Already wet: dragged down with it.
          kind: "conditional",
          status: "wet",
          effects: [{ kind: "status", status: "weak", stacks: 1, duration: 1 }],
        },
        { kind: "status", status: "wet", stacks: 1, duration: 2 },
      ],
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 10,
  presentation: {
    cinematic: "mourning-water",
    theme: "growth",
    accent: "#a9bf62",
    voice: {
      activation: "Everything you took… it kept.",
      impact: "Hold it. We had to.",
      after: "Heavy, isn't it. It doesn't dry.",
    },
  },
};
