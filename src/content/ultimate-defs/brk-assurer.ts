import type { UltimateDef } from "../ultimates";

/**
 * Broker · Assurer — "Everyone is covered. Read the small print later."
 *
 * The Broker's Foreclosure takes: it strikes one enemy, seizes the guard it
 * stood behind, banks 30 gold and hands a sliver of the proceeds out as
 * Barrier. The Assurer traded Underwrite (one ally, 26 Barrier, 40 gold) for
 * Indemnity (a whole row, 22 Barrier, 40 gold), and stopped taking at all. Its
 * Ultimate touches no enemy and makes no money. It spends the party's money on
 * the party:
 *
 *  - the premium: 40 team gold, first;
 *  - the cover: every ally, the Assurer included, 30 Barrier;
 *  - a clause for the insured: any notice served on them (Marked) is struck
 *    out, so the Collector's "Enforce the notice" finds nothing to enforce;
 *  - the commission: 2 Credit, enough for an Indemnity next round.
 *
 * The small print is real, and it is the play. The cover is written until the
 * end of the round (duration 1). An Ultimate resolves before anyone acts, so it
 * holds against everything the enemy does this round and is gone at the round's
 * end: it is bought for the round the party can see coming, the one with the
 * Collector's "Close the account", a Furnace blast or a Crushing levy wound up
 * on the board. That is a choice the party makes together, against the other
 * answer to a windup, which is to break it. Cover that lands on an ally already
 * holding a longer Barrier joins it and lasts as long as that does.
 *
 * The treasury is the other clause. An Ultimate is never refused for want of
 * gold: the effect pipeline takes what the treasury holds (`Math.min`), so a
 * party short of 40 pays everything it has and is still covered in full. The
 * premium is felt later, at the shop, the tuition and the revival, which cost
 * gold too. And gold is what the Miser shields itself with, so paying the
 * premium before that fight thins its armour; its "Audit the shielded" strips
 * the cover back off. It reads small print too.
 *
 * With the Vanguard it is a guard play: a protector holding 30 Barrier takes
 * the hits it intercepts for nothing, and the Vanguard earns charge on every
 * point its Barrier blocks.
 */
export const ultimate: UltimateDef = {
  id: "small-print",
  heroId: "broker",
  evolution: "brk-assurer",
  name: "The Small Print",
  epithet: "Full cover. Terms and conditions apply.",
  description:
    "Spend 40 team gold to cover the whole party, you included: 30 Barrier each, and any Mark served on them struck out. Gain 2 Credit. The small print: the cover lapses at the end of this round, and a short treasury pays whatever it holds.",
  target: "self",
  effects: [
    {
      kind: "gold",
      amount: -40,
    },
    {
      kind: "allies",
      self: true,
      effects: [
        {
          kind: "removeStatus",
          status: "marked",
        },
        {
          kind: "status",
          status: "barrier",
          stacks: 30,
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
  speed: 12,
  presentation: {
    cinematic: "small-print",
    theme: "contract",
    accent: "#8b95ff",
    voice: {
      activation: "Gather round, all of you. Sign here, and here, and here.",
      impact: "Covered! Every last one of you!",
      after: "Cover lapses when the round ends. It's all in the small print.",
    },
  },
};
