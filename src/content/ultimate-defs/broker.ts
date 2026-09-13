import type { UltimateDef } from "../ultimates";

export const ultimate: UltimateDef = {
  id: "foreclosure",
  heroId: "broker",
  name: "Foreclosure",
  epithet: "Collateral is whatever you were standing behind.",
  description:
    "Seize the target's Barrier, hit it for 26 and leave it Vulnerable. The proceeds — 30 team gold — underwrite 8 Barrier for every ally.",
  target: "enemy",
  effects: [
    {
      kind: "removeStatus",
      status: "barrier",
    },
    {
      kind: "damage",
      amount: 26,
    },
    {
      kind: "status",
      status: "vulnerable",
      stacks: 1,
      duration: 2,
    },
    {
      kind: "gold",
      amount: 30,
    },
    {
      kind: "allies",
      self: true,
      effects: [
        {
          kind: "status",
          status: "barrier",
          stacks: 8,
          duration: 2,
        },
      ],
    },
  ],
  cost: 100,
  speed: 10,
  presentation: {
    theme: "contract",
    accent: "#f3d487",
  },
};
