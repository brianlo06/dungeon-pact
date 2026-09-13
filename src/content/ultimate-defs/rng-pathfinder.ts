import type { UltimateDef } from "../ultimates";

/**
 * Ranger · Pathfinder — "Know the ground and it stops being their ground."
 *
 * The Ranger's Hundredth Mark is the killing shot: every enemy marked, and
 * one arrow through armour that cashes the Mark in. The Pathfinder traded
 * the Quarry sign for Snare (8, Mark, Weak) and a heavier, steadier body
 * (+16 HP, +2 guard), so its Ultimate looses no arrow. It has read the
 * ground the enemy is standing on, and the enemy's own next step springs
 * what it laid there:
 *
 *  - the target is snared: 16 precision (a Mark already on it is cashed in,
 *    EXPLOIT), then Marked again and hobbled, Weak for two rounds;
 *  - the whole field is snare line: every other enemy stumbles and is Weak
 *    this round;
 *  - any enemy the party had already Marked, the target included — quarry
 *    already tracked — goes down mid-stride as well: its WINDUP is broken;
 *  - +2 Focus.
 *
 * It is the base Ultimate turned inside out. The Hundredth Mark is offence:
 * 24 through armour and Marks for the party to spend. False Footing is the
 * party kept safe on ground it has read: every enemy blow this round a third
 * lighter, the one that mattered hobbled for two, and windups broken where
 * the party has already found its quarry. A team play both ways: a Mark left
 * by a Ranger, a Snare or a Hunter's sign sets up the trip, and the Mark it
 * leaves on the target is an Exploit for the next precision hit.
 *
 * Weighed head to head (every Ranger playing one Ultimate's effects, every
 * Ranger party in every 2nd composition, 10 seeds, 820 runs): Hundredth Mark
 * 93%, False Footing 94%. Breaking every target's windup outright measured
 * 96%, so the trip is kept for quarry the party has tracked.
 *
 * Every other enemy takes a 0-base, non-precision sliver on purpose: a film's
 * cast is the enemies an Ultimate damaged (`cinematic/segments.ts`), and Weak
 * alone logs no beat. Non-precision, so it never spends the party's Marks.
 */
export const ultimate: UltimateDef = {
  id: "false-footing",
  heroId: "ranger",
  evolution: "rng-pathfinder",
  name: "False Footing",
  epithet: "Every step you took here, I took first.",
  description:
    "The target's own next step springs a snare: 16 precision (cashing any Mark), then it is Marked and Weak for 2 rounds. Every other enemy stumbles on the snare line and is Weak this round. Any enemy already Marked, the target included, goes down mid-stride: its WINDUP is broken. +2 Focus.",
  target: "enemy",
  effects: [
    {
      // Quarry the party already tracked goes down mid-stride: its plan is
      // lost. Read before the snare bites, because the bite spends the Mark.
      kind: "conditional",
      status: "marked",
      effects: [{ kind: "interrupt" }],
    },
    {
      kind: "damage",
      amount: 16,
      precision: true,
    },
    {
      kind: "status",
      status: "marked",
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
          // A quarry the party already tracked: tripped, and its plan lost.
          kind: "conditional",
          status: "marked",
          effects: [{ kind: "interrupt" }],
        },
        { kind: "status", status: "weak", stacks: 1, duration: 1 },
        // The snare line catching a foot: the Pathfinder's power, no more.
        { kind: "damage", amount: 0 },
      ],
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 18,
  presentation: {
    cinematic: "false-footing",
    theme: "precision",
    accent: "#f2a93b",
    voice: {
      activation: "Hold on. Let me read you.",
      impact: "Watch your step!",
      after: "Stay on my prints. Nothing out there bites.",
    },
  },
};
