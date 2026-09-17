import type { Effect } from "../../shared/model";
import type { UltimateDef } from "../ultimates";

/**
 * Arcanist · Chronomancer — "A moment taken from them is a moment given to you."
 *
 * The Arcanist's Debt of Thunder is a storm spent at once: Wet everywhere and
 * one bolt called in. The Chronomancer traded that raw storm (Break focus for
 * Stillness, and four points of speed) for time, and its Ultimate spends none
 * of it. It takes moments and gives them away:
 *
 *  - **taken**: the target's next moment. Its WINDUP is broken, and 22 arcane
 *    through armour lands on it, every moment it lost arriving at once;
 *  - **held**: every enemy is touched by the stopped moment, and whatever the
 *    party has already laid on it (Wet, Marked, Vulnerable, Weak, Burn,
 *    Poison) is held for three rounds from now, not left to run out;
 *  - **given**: every ally, the Chronomancer too, keeps the Empowered and
 *    Regeneration it has for as long;
 *  - and it gains 2 Mana.
 *
 * It waits, on purpose. At speed 0 it resolves after every other Ultimate
 * queued that round, so what an ally's Ultimate lays down in the same window
 * — a Herald's Anthem, a Ranger's marks, a Warden's regrowth, the Arcanist's
 * own Cloudburst from last round — is there to be held.
 *
 * Nothing here turns an enemy on its own side. Stillness does that; the
 * Ultimate is about time, not control. Its team play is the reactions:
 * a held Wet is a Chain Shock the party can still set off two rounds later,
 * a held Mark an Exploit, a held Vulnerable every blow a quarter harder.
 *
 * Holding re-applies each status at one stack (the least the effect system
 * accepts): a status capped at one stack is unchanged, and Burn, Poison and
 * Regeneration gain a single stack. Every enemy takes a 0-base arcane sliver
 * because a film's cast is the enemies an Ultimate damaged
 * (`cinematic/segments.ts`), and the film shows every enemy's moment held.
 */

/** A status already on the unit, kept for `rounds` from now. */
const hold = (status: "wet" | "marked" | "vulnerable" | "weak" | "burn" | "poison" | "empowered" | "regen", rounds: number): Effect => ({
  kind: "conditional",
  status,
  effects: [{ kind: "status", status, stacks: 1, duration: rounds }],
});

/** How long a held status lasts: this round, and two more. */
const HELD = 3;

export const ultimate: UltimateDef = {
  id: "still-life",
  heroId: "arcanist",
  evolution: "arc-chronomancer",
  name: "Still Life",
  epithet: "Whatever you were about to do, I'll keep.",
  description:
    "Take an enemy's next moment: its WINDUP broken and 22 arcane through armour. Everything the party laid on every enemy (Wet, Mark, Vulnerable, Weak, Burn, Poison) is held for three rounds, and every ally keeps its Empowered and Regeneration as long. Resolves after every other Ultimate. +2 Mana.",
  target: "enemy",
  effects: [
    { kind: "interrupt" },
    { kind: "damage", amount: 22, damageType: "arcane", pierce: true },
    {
      kind: "enemies",
      effects: [
        hold("wet", HELD),
        hold("marked", HELD),
        hold("vulnerable", HELD),
        hold("weak", HELD),
        hold("burn", HELD),
        hold("poison", HELD),
      ],
    },
    {
      // The stopped moment touches every other enemy: the Chronomancer's power, no more.
      kind: "enemies",
      others: true,
      effects: [{ kind: "damage", amount: 0, damageType: "arcane", pierce: true }],
    },
    {
      kind: "allies",
      self: true,
      effects: [hold("empowered", HELD), hold("regen", HELD)],
    },
    { kind: "resource", amount: 2 },
  ],
  cost: 100,
  speed: 0,
  presentation: {
    cinematic: "still-life",
    theme: "arcane",
    accent: "#ffb870",
    voice: {
      activation: "Hold still. This won't take a moment.",
      impact: "There. Have it back.",
      after: "Take your time. I made some.",
    },
  },
};
