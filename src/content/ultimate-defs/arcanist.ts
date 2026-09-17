import type { UltimateDef } from "../ultimates";

export const ultimate: UltimateDef = {
  id: "debt-of-thunder",
  heroId: "arcanist",
  name: "Debt of Thunder",
  epithet: "Borrow the storm. Pay it back all at once.",
  description:
    "Drown every enemy in Wet, then call a 26 lightning strike on the target that sets off Chain Shock — and leaves the rest soaked for whoever follows.",
  target: "enemy",
  effects: [
    {
      kind: "enemies",
      effects: [
        {
          kind: "status",
          status: "wet",
          stacks: 1,
          duration: 3,
        },
      ],
    },
    {
      kind: "damage",
      amount: 26,
      damageType: "lightning",
    },
    {
      kind: "resource",
      amount: 3,
    },
  ],
  cost: 100,
  speed: 10,
  presentation: {
    cinematic: "debt-of-thunder",
    theme: "arcane",
    accent: "#8fd3ff",
    voice: {
      activation: "Put the storm on my account.",
      impact: "Due. Now.",
      after: "The rest of you can pay the interest.",
    },
  },
};
