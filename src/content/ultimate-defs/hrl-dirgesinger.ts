import type { UltimateDef } from "../ultimates";

/**
 * Herald · Dirgesinger — "A funeral song, sung early."
 *
 * The Herald's whole class is two promises: the party hits harder, and it
 * shrugs off what the dungeon does to it. Anthem of the Unpaid keeps both by
 * singing to the party: every ally Empowered, warded, cleansed. Into the Din
 * keeps them by striking for the party. The Dirgesinger traded Counterpoint's
 * Barrier for Dirge, a song that takes a row's afflictions away and turns
 * the grief into resolve, and its Ultimate turns the song round: it is not
 * sung *to* the party at all. It is sung *for an enemy*, as if it had
 * already fallen.
 *
 *  - the enemy it is sung for is mourned ahead of time: **Vulnerable for three
 *    rounds** (the whole length of the song, a round longer than any other
 *    Vulnerable), so every ally's blow on it lands a quarter harder until it
 *    goes; and **Weak for two**, because it fights like something already
 *    buried;
 *  - the first note costs it **12 through armour** (the Herald's rallying note
 *    always drew blood), sung onto a mind already opened, so ×1.25;
 *  - the party lays its own griefs down in the same grave: **every ally, the
 *    Dirgesinger and the downed included, sheds Burn, Poison, Weak and
 *    Vulnerable** — Dirge, for everyone at once;
 *  - **+2 Verse**;
 *  - **speed 22**: sung early. It resolves before every other Ultimate queued
 *    that round, so the grave is already open when theirs land.
 *
 * What it does, not only its numbers: it is the first Herald Ultimate aimed at
 * an enemy that gives the party nothing to swing with. No Empowered, no
 * Barrier, no courage for a round. It makes the *target* the thing the party
 * is better against, for three rounds, and makes it hit the party softer for
 * two. Anthem of the Unpaid touches no enemy; Into the Din opens its enemy
 * for two rounds and lends the party Empowered for one.
 *
 * Team play: sung early, so an ally's Ultimate the same round lands on
 * Vulnerable (Red Ledger's 40, Gatebreaker, Debt of Thunder's bolt and its
 * Chain Shock); a Ranger's Exploit on the mourned is a quarter heavier for
 * three rounds; and Weak on the target takes a boss's windup down by a third
 * the same round the Vanguard or the Aegis Knight has to take it.
 */
export const ultimate: UltimateDef = {
  id: "elegy-for-the-standing",
  heroId: "herald",
  evolution: "hrl-dirgesinger",
  name: "Elegy for the Standing",
  epithet: "Mourned while it's still on its feet.",
  description:
    "Sing an enemy's funeral before it falls: it takes 12 through armour, is left Vulnerable for three rounds and Weak for two. The whole party lays its griefs down with it, the downed too: Burn, Poison, Weak and Vulnerable cleared. +2 Verse. Sung early: it resolves before other Ultimates.",
  target: "enemy",
  effects: [
    // Mourned first, so the first note already lands on an open grave.
    {
      kind: "status",
      status: "vulnerable",
      stacks: 1,
      duration: 3,
    },
    {
      kind: "damage",
      amount: 12,
      pierce: true,
    },
    {
      kind: "status",
      status: "weak",
      stacks: 1,
      duration: 2,
    },
    {
      kind: "allies",
      self: true,
      downed: true,
      effects: [
        { kind: "removeStatus", status: "burn" },
        { kind: "removeStatus", status: "poison" },
        { kind: "removeStatus", status: "weak" },
        { kind: "removeStatus", status: "vulnerable" },
      ],
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 22,
  presentation: {
    cinematic: "elegy-for-the-standing",
    theme: "resonance",
    accent: "#c6b4e8",
    voice: {
      activation: "This one's for you. Sorry it's early.",
      impact: "Lie down. The song's over.",
      after: "We've done our grieving. Now finish it.",
    },
  },
};
