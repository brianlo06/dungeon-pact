import type { UltimateDef } from "../ultimates";

export const ultimate: UltimateDef = {
  id: "hall-of-mirrors",
  heroId: "beguiler",
  name: "Hall of Mirrors",
  epithet: "Which of you is real? None of you, now.",
  description:
    "Every enemy strikes its own side this round. The target takes 14 arcane as the glass breaks.",
  target: "enemy",
  effects: [
    {
      kind: "enemies",
      effects: [
        {
          kind: "status",
          status: "confused",
          stacks: 1,
          duration: 1,
        },
      ],
    },
    {
      kind: "damage",
      amount: 14,
      damageType: "arcane",
    },
  ],
  cost: 100,
  speed: 20,
  presentation: {
    theme: "sway",
    accent: "#c9a3ff",
  },
};
