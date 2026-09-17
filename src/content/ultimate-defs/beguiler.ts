import type { UltimateDef } from "../ultimates";

/**
 * Hall of Mirrors — the Beguiler's Ultimate.
 *
 * Every enemy is shown the Beguiler's painted smile on the face beside it,
 * and strikes its own side this round. The glass the lie is told in breaks:
 * a sliver for every enemy, and the worst of it for the target.
 *
 * The sliver is there for the film as much as for the fight. A cinematic's
 * cast is the enemies an Ultimate *hit* (`cinematic/segments.ts`), and
 * confusion alone logs no beat, so without it the film could only ever show
 * the target — never the line it turns on itself. The target's own share was
 * cut from 14 to 10 so what it takes in all is unchanged (power is added to
 * each hit, guard taken from each).
 */
export const ultimate: UltimateDef = {
  id: "hall-of-mirrors",
  heroId: "beguiler",
  name: "Hall of Mirrors",
  epithet: "Which of you is real? None of you, now.",
  description:
    "Every enemy sees the Beguiler in the face beside it: each is cut by the glass and strikes its own side this round. The target takes 10 more arcane as the mirror breaks.",
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
        {
          kind: "damage",
          amount: 0,
          damageType: "arcane",
        },
      ],
    },
    {
      kind: "damage",
      amount: 10,
      damageType: "arcane",
    },
  ],
  cost: 100,
  speed: 20,
  presentation: {
    cinematic: "hall-of-mirrors",
    theme: "sway",
    accent: "#c9a3ff",
    voice: {
      activation: "Look closer. Who is that beside you?",
      impact: "There. It was them all along.",
      after: "Go on. I'll only watch.",
    },
  },
};
