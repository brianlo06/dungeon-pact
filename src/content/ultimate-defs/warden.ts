import type { UltimateDef } from "../ultimates";

export const ultimate: UltimateDef = {
  id: "green-reckoning",
  heroId: "warden",
  name: "Green Reckoning",
  epithet: "Nothing living is beyond hope. Nothing dead stays comfortable.",
  description:
    "Every ally — the downed included — is healed 18, regenerates and is cleared of Burn, Poison and Weak. Every enemy is poisoned for 4 a round.",
  target: "self",
  effects: [
    {
      kind: "allies",
      self: true,
      downed: true,
      effects: [
        {
          kind: "heal",
          amount: 18,
        },
        {
          kind: "status",
          status: "regen",
          stacks: 3,
          duration: 3,
        },
        {
          kind: "removeStatus",
          status: "burn",
        },
        {
          kind: "removeStatus",
          status: "poison",
        },
        {
          kind: "removeStatus",
          status: "weak",
        },
      ],
    },
    {
      kind: "enemies",
      effects: [
        {
          kind: "status",
          status: "poison",
          stacks: 4,
          duration: 3,
        },
      ],
    },
  ],
  cost: 100,
  speed: 12,
  presentation: {
    cinematic: "green-reckoning",
    theme: "growth",
    accent: "#9be38a",
    voice: {
      activation: "Hush. Let me hear your hearts.",
      impact: "Up, all of you. — Not you.",
      after: "It keeps growing. On all of you.",
    },
  },
};
