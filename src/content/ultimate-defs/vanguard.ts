import type { UltimateDef } from "../ultimates";

export const ultimate: UltimateDef = {
  id: "lantern-wall",
  heroId: "vanguard",
  name: "Lantern Wall",
  epithet: "Nothing reaches them. Not this round.",
  description:
    "Plant the guild's lantern: every ally gains 12 Barrier and the Vanguard takes their next direct hit this round. Then charge the target for 20, break its WINDUP and leave it Vulnerable.",
  target: "enemy",
  effects: [
    {
      kind: "allies",
      effects: [
        {
          kind: "protect",
          barrier: 6,
        },
        {
          kind: "status",
          status: "barrier",
          stacks: 12,
          duration: 2,
        },
      ],
    },
    {
      kind: "status",
      status: "barrier",
      stacks: 8,
      duration: 2,
      self: true,
    },
    {
      kind: "damage",
      amount: 20,
    },
    {
      kind: "interrupt",
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
  speed: 20,
  presentation: {
    cinematic: "lantern-wall",
    theme: "guard",
    accent: "#ffcf6b",
    voice: {
      activation: "Behind me.",
      impact: "Not one step further!",
      after: "Still standing. All of us.",
    },
  },
};
