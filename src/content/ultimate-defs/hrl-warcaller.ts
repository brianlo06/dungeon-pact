import type { UltimateDef } from "../ultimates";

/**
 * Herald · Warcaller — "Lead from where it is loudest."
 *
 * The Herald's Anthem is a song the whole party sings: nothing is struck, and
 * the courage it gives lasts, wards and cleanses. The Warcaller traded its
 * rallying note for a strike (Warcall) and stopped standing behind the party,
 * so its Ultimate gives nothing from behind. It walks out alone to the enemy
 * and hits it — Empowered by its own courage first — hard enough that the
 * whole field hears the blow ring, and that sound is the call:
 *
 *  - the Warcaller is Empowered for three rounds, and the blow already is;
 *  - the enemy it strikes takes 24 and is left Vulnerable, rung open, so the
 *    party's blows land harder on the exact enemy the Warcaller chose;
 *  - every ally who hears it shakes off Weak and hits 30% harder — this round
 *    only: the charge that follows the blow, not a song that lingers;
 *  - and it gains 2 Verse.
 *
 * A focused volley, not a lasting blessing: an Empowered party striking a
 * Vulnerable target the same round (×1.3 × 1.25), with no Barrier and no
 * cleanse of Vulnerable, where Anthem of the Unpaid touches no enemy at all.
 * It reads the reactions the rest of the kit leaves: an ally's Exploit or
 * Chain Shock on that target this round is Empowered and lands on Vulnerable,
 * and a Vulnerable left by a guard or a drag stacks with the blow.
 */
export const ultimate: UltimateDef = {
  id: "into-the-din",
  heroId: "herald",
  evolution: "hrl-warcaller",
  name: "Into the Din",
  epithet: "Follow the sound of the blow.",
  description:
    "Walk out ahead of the party and strike an enemy for 24, already Empowered, leaving it Vulnerable. Every ally who hears the blow shakes off Weak and hits 30% harder this round. The Warcaller stays Empowered for three rounds and gains 2 Verse.",
  target: "enemy",
  effects: [
    {
      kind: "status",
      status: "empowered",
      stacks: 1,
      duration: 3,
      self: true,
    },
    {
      kind: "damage",
      amount: 24,
    },
    {
      kind: "status",
      status: "vulnerable",
      stacks: 1,
      duration: 2,
    },
    {
      kind: "allies",
      effects: [
        {
          kind: "removeStatus",
          status: "weak",
        },
        {
          kind: "status",
          status: "empowered",
          stacks: 1,
          duration: 1,
        },
      ],
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 16,
  presentation: {
    cinematic: "into-the-din",
    theme: "resonance",
    accent: "#f1e6cc",
    voice: {
      activation: "Loudest spot in the fight? That's mine.",
      impact: "THAT's the signal!",
      after: "Follow the noise. I'm already here.",
    },
  },
};
