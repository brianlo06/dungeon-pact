import type { UltimateDef } from "../ultimates";

export const ultimate: UltimateDef = {
  id: "hundredth-mark",
  heroId: "ranger",
  name: "The Hundredth Mark",
  epithet: "Every one of them, marked. This one, finished.",
  description:
    "Mark every enemy, then loose a precision shot for 24 that ignores armour and cashes in the target's Mark. The others stay Marked for the party.",
  target: "enemy",
  effects: [
    {
      kind: "enemies",
      effects: [
        {
          kind: "status",
          status: "marked",
          stacks: 1,
          duration: 3,
        },
      ],
    },
    {
      kind: "damage",
      amount: 24,
      precision: true,
      pierce: true,
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 16,
  presentation: {
    theme: "precision",
    accent: "#c7f08a",
  },
};
