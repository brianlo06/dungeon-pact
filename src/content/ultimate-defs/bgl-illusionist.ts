import type { UltimateDef } from "../ultimates";

/**
 * Beguiler · Illusionist — "Be somewhere else when it lands."
 *
 * The Hall of Mirrors is control: every enemy strikes its own side and the
 * Beguiler never has to be anywhere. The Illusionist traded Seed of doubt for
 * Mirrorstep (strike, leave it open, step behind Barrier), so its Ultimate
 * turns nobody. It is evasion and misdirection. The Beguiler's robe is a
 * swarm of moths wearing its shape, every wing painted with its one green
 * eye, and the enemy commits to a place the Beguiler no longer is:
 *
 *  - the target lunges at the eye it was watching, and its lunge carries it
 *    into the front line (`move`), where the party's melee can reach it;
 *  - the Beguiler, already behind it, cuts it where its guard is not: 18
 *    arcane through armour, and it is left Vulnerable;
 *  - the moths blow across the whole line and settle over every enemy's
 *    eyes: each is Weak this round, swinging at wings;
 *  - and the Illusionist steps behind 20 Barrier, somewhere else.
 *
 * A team play: the target is dragged into the front and left Vulnerable for
 * the party's blows this round and next, and the whole enemy round lands
 * Weak. It reads what the kit already leaves: a Mark on the target now sits
 * in the front for a melee Exploit, and a second Vulnerable source stacks
 * its duration.
 *
 * Every other enemy takes a 0-base sliver on purpose. A film's cast is the
 * enemies an Ultimate damaged (`cinematic/segments.ts`), and Weak alone logs
 * no beat, so without it the film could show only the one enemy, never the
 * moths settling on the rest.
 */
export const ultimate: UltimateDef = {
  id: "eyespot",
  heroId: "beguiler",
  evolution: "bgl-illusionist",
  name: "Eyespot",
  epithet: "Watch the eye. I'm not behind it.",
  description:
    "The target lunges at a robe of moths and is carried into the front line, then cut from behind for 18 arcane through armour and left Vulnerable. The moths settle over every enemy's eyes: all are Weak this round. The Illusionist steps behind 20 Barrier.",
  target: "enemy",
  effects: [
    {
      kind: "move",
      row: "front",
    },
    {
      kind: "damage",
      amount: 18,
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
      kind: "enemies",
      effects: [
        { kind: "status", status: "weak", stacks: 1, duration: 1 },
        // The moths brushing past: the Illusionist's power, no more.
        { kind: "damage", amount: 0, damageType: "arcane" },
      ],
      others: true,
    },
    {
      kind: "status",
      status: "weak",
      stacks: 1,
      duration: 1,
    },
    {
      kind: "status",
      status: "barrier",
      stacks: 20,
      duration: 2,
      self: true,
    },
  ],
  cost: 100,
  speed: 20,
  presentation: {
    cinematic: "eyespot",
    theme: "sway",
    accent: "#f3e7c4",
    voice: {
      activation: "Keep your eyes on mine.",
      impact: "Wrong eye.",
      after: "Swing all you like. They're only wings.",
    },
  },
};
