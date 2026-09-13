import type { UltimateDef } from "../ultimates";

/**
 * Beguiler · Puppeteer — "You were always going to do this for me."
 *
 * The Hall of Mirrors is doubt spread thin: every enemy is shown a lie and the
 * whole line turns on itself, and the Beguiler lays a finger on nobody. The
 * Puppeteer traded that for Puppetry, one enemy made to strike its own side,
 * and its Ultimate is the whole act worked on one body. It turns nobody else.
 * It takes the one it chose on strings and uses it:
 *
 *  - the puppet is walked downstage, into the front line (`move`), where the
 *    party's melee can reach it past any screen;
 *  - it is swung through its own side like a weight on a line: 12 arcane to
 *    every other enemy, delivered by a body the enemy paid for;
 *  - if the party had already opened it (Vulnerable: Puppetry, Seed of doubt,
 *    Unpick the seam, Mind spike, the Breaker, the Broker), that opening is
 *    dragged into everything it hits: every other enemy is left Vulnerable;
 *  - and it is left hanging on the strings: 10 arcane through armour, left
 *    Vulnerable, and still working for the Beguiler this round (Confused, so
 *    its own blow, at its own strength, lands on its own side).
 *
 * How it differs from the Hall of Mirrors, in what it does: that Ultimate
 * confuses every enemy and cuts each for a sliver; this one confuses exactly
 * one, and spends it. Its damage to the rest is real and immediate, not
 * whatever the line happens to do to itself, and its team play is a plan
 * across two rounds: Puppetry (or any Vulnerable) now, Command Performance
 * next, and the whole enemy side is open for the party's blows.
 *
 * Its confusion is the tail of the act, not its centre: one body's own blow,
 * which is the only way the effect system lets an enemy's own strength be
 * used against its side (every damage effect is sized by the caster). It
 * earns the Beguiler's control charge once, where the Hall of Mirrors can
 * earn it from every enemy.
 *
 * Every other enemy is struck on purpose, and a film's cast is the enemies
 * an Ultimate damaged (`cinematic/segments.ts`), so the film can show the
 * swing going through the whole line.
 */
export const ultimate: UltimateDef = {
  id: "command-performance",
  heroId: "beguiler",
  evolution: "bgl-puppeteer",
  name: "Command Performance",
  epithet: "Places. You already know your part.",
  description:
    "Take one enemy on strings: it is walked into the front line and swung through its own side, 12 arcane to every other enemy. Then it is left hanging: 10 arcane through armour, Vulnerable, and still striking its own side this round. If it was already Vulnerable, everything it hits is left Vulnerable too.",
  target: "enemy",
  effects: [
    {
      kind: "move",
      row: "front",
    },
    {
      // The swing: the puppet's body through every other enemy.
      kind: "enemies",
      others: true,
      effects: [{ kind: "damage", amount: 12, damageType: "arcane" }],
    },
    {
      // A body the party already opened opens whatever it is swung into.
      kind: "conditional",
      status: "vulnerable",
      effects: [
        {
          kind: "enemies",
          others: true,
          effects: [{ kind: "status", status: "vulnerable", stacks: 1, duration: 2 }],
        },
      ],
    },
    {
      kind: "damage",
      amount: 10,
      damageType: "arcane",
      pierce: true,
    },
    {
      kind: "status",
      status: "vulnerable",
      stacks: 1,
      duration: 2,
    },
    {
      // Still on the strings: its own blow this round goes to its own side.
      kind: "status",
      status: "confused",
      stacks: 1,
      duration: 1,
    },
  ],
  cost: 100,
  speed: 20,
  presentation: {
    cinematic: "command-performance",
    theme: "sway",
    accent: "#ffb45c",
    voice: {
      activation: "Up you get. You're in the next act.",
      impact: "There. Just as we rehearsed.",
      after: "Arms up. I haven't said you can stop.",
    },
  },
};
