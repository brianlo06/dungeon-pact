import type { UltimateDef } from "../ultimates";

/**
 * Vanguard · Warlord — "Fight louder. They follow the noise."
 *
 * The Lantern Wall is a Vanguard standing still so nothing reaches the party:
 * a ward on everyone, a guard link on everyone, and a charge out and back.
 * The Warlord traded Shieldbreaker for Warcry and stopped standing still. Its
 * Ultimate guards nobody. It goes first, into ground nobody else could cross,
 * and the party follows it there:
 *
 *  - it strikes the enemy it chose for 22 and leaves it **Marked** and
 *    **Vulnerable**: the end of its trail, open to every blow that follows;
 *  - the whole party, the Warlord included, **comes forward into the front
 *    line** in its tracks, each with 8 Barrier for the ground they took;
 *  - and it gains 2 Resolve.
 *
 * A team play through the reach rules and the reactions. From the front row
 * a melee hero may strike a Marked enemy even behind a screen of front-line
 * enemies, so a Reaver's or another Vanguard's blow can follow the Warlord all
 * the way to a sniper at the back; a Ranger's precision cashes the Mark as an
 * Exploit, on a Vulnerable target. The cost is the Vanguard's own identity:
 * with the whole party in the front row, the enemy's blows are no longer all
 * aimed at the one who was built to take them. It gives no guard link and no
 * interrupt, where the Lantern Wall gives both and moves nobody.
 */
export const ultimate: UltimateDef = {
  id: "warpath",
  heroId: "vanguard",
  evolution: "van-warlord",
  name: "Warpath",
  epithet: "Walk where I walked.",
  description:
    "Break a trail to an enemy and strike it for 22, leaving it Marked and Vulnerable. The whole party follows into the front line with 8 Barrier each, close enough to reach the Marked enemy through any screen. +2 Resolve.",
  target: "enemy",
  effects: [
    {
      kind: "damage",
      amount: 22,
    },
    {
      kind: "status",
      status: "marked",
      stacks: 1,
      duration: 2,
    },
    {
      kind: "status",
      status: "vulnerable",
      stacks: 1,
      duration: 2,
    },
    {
      kind: "allies",
      self: true,
      effects: [
        {
          kind: "move",
          row: "front",
        },
        {
          kind: "status",
          status: "barrier",
          stacks: 8,
          duration: 2,
        },
      ],
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 14,
  presentation: {
    cinematic: "warpath",
    theme: "guard",
    accent: "#e0664a",
    voice: {
      activation: "In my tracks. All of you.",
      impact: "HERE!",
      after: "The front is wherever I'm standing.",
    },
  },
};
