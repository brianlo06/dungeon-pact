import type { UltimateDef } from "../ultimates";

export const ultimate: UltimateDef = {
  id: "anthem-of-the-unpaid",
  heroId: "herald",
  name: "Anthem of the Unpaid",
  epithet: "Every voice in the pact, at once.",
  description:
    "The whole party hits 30% harder this round and the next, gains 8 Barrier and shakes off Weak and Vulnerable.",
  target: "self",
  effects: [
    {
      kind: "allies",
      self: true,
      effects: [
        {
          kind: "status",
          status: "empowered",
          stacks: 1,
          duration: 2,
        },
        {
          kind: "status",
          status: "barrier",
          stacks: 8,
          duration: 2,
        },
        {
          kind: "removeStatus",
          status: "weak",
        },
        {
          kind: "removeStatus",
          status: "vulnerable",
        },
      ],
    },
  ],
  cost: 100,
  speed: 18,
  presentation: {
    theme: "resonance",
    accent: "#ffb3d1",
  },
};
