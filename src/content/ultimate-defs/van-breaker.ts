import type { UltimateDef } from "../ultimates";

export const ultimate: UltimateDef = {
  id: "gatebreaker",
  heroId: "vanguard",
  evolution: "van-breaker",
  name: "Gatebreaker",
  epithet: "The wall learns to move forward.",
  description:
    "Ride the shield through an enemy row: strip its Barrier, deal 24 through armour, break WINDUPs, drag it into the front line and leave it Vulnerable. The Breaker drops its own guard to do it.",
  target: "enemyRow",
  effects: [
    {
      kind: "enemies",
      row: true,
      effects: [
        {
          kind: "removeStatus",
          status: "barrier",
        },
        {
          kind: "damage",
          amount: 24,
          pierce: true,
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
          kind: "move",
          row: "front",
        },
      ],
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
      amount: 3,
    },
  ],
  cost: 100,
  speed: 14,
  presentation: {
    cinematic: "gatebreaker",
    theme: "foundry",
    accent: "#ff6a3a",
    voice: {
      activation: "Open it.",
      impact: "BREACH!",
      after: "Walls were only ever doors.",
    },
  },
};
