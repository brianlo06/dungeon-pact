import type { UltimateDef } from "../ultimates";

/**
 * Reaver · Butcher — "Wider swings. Fewer problems."
 *
 * Red Ledger pays: the Reaver loses 14 HP on purpose and spends it on one
 * enormous cut through armour, with a slash across the target's row. The
 * Butcher traded Frenzy for **Butchery** (lose 8 HP, tear a whole row for 26)
 * and took +4 power: it stopped aiming at one enemy and started swinging at
 * everything within reach. So its Ultimate is that swing at its widest, and
 * it is not paid for at all:
 *
 *  - one swing, wall to wall: **every enemy in the chosen row takes 30**
 *    (39 at the Butcher's power, before Guard), all of them alike;
 *  - it clears the row: **every one of them is knocked into the back line**.
 *    A front row swept back leaves nothing in front to screen anything, so
 *    for the rest of the fight (until something drags them forward again)
 *    the party's melee can reach every enemy;
 *  - anything in that row the party had already opened (**Vulnerable**) is
 *    knocked clean off its feet: its **WINDUP is broken**, and the blow lands
 *    a quarter harder on it, as it does on anything Vulnerable;
 *  - **+2 Fury**.
 *
 * How it differs from Red Ledger, in what it does: no HP is paid, nothing goes
 * through armour, and there is no one target the swing favours. Red Ledger is
 * a price and a burst on one enemy; Elbow Room is a sweep that moves a whole
 * formation. How it differs from Gatebreaker (the other row Ultimate that
 * moves a row): Gatebreaker drags the enemy *forward* into the party and
 * leaves it Vulnerable; Elbow Room throws it *back*, out of the way, and
 * cashes a Vulnerable that is already there rather than making one.
 *
 * The team play is the space it makes and the Vulnerable it cashes. A front
 * row swept back opens the whole enemy side to a Vanguard's charge, the
 * Reaver's own Rend, a Warden's staff; a row the party opened first (Drag them
 * down, Gatebreaker, Seed of doubt, Foreclosure, Sunblind) loses its windups
 * to it. Its row damage stacks with the party's Chain Shock and Exploits on
 * the same row the round it lands, since it resolves before them.
 *
 * Speed 6: a big swing, wound up.
 */
export const ultimate: UltimateDef = {
  id: "elbow-room",
  heroId: "reaver",
  evolution: "rvr-butcher",
  name: "Elbow Room",
  epithet: "Stand well back.",
  description:
    "One swing, wall to wall: every enemy in a row takes 30 and is knocked into the back line, so nothing screens the enemy from the party's melee. Anything in it already Vulnerable is knocked off its feet: its WINDUP is broken. +2 Fury.",
  target: "enemyRow",
  effects: [
    {
      kind: "enemies",
      row: true,
      effects: [
        {
          // Already opened: off its feet before the blade even arrives.
          kind: "conditional",
          status: "vulnerable",
          effects: [{ kind: "interrupt" }],
        },
        {
          kind: "damage",
          amount: 30,
        },
        {
          // Swept back out of the way.
          kind: "move",
          row: "back",
        },
      ],
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 6,
  presentation: {
    cinematic: "elbow-room",
    theme: "blood",
    accent: "#5fd9c4",
    voice: {
      activation: "Bit tight in here.",
      impact: "MAKE ROOM!",
      after: "That's better.",
    },
  },
};
