import type { UltimateDef } from "../ultimates";

/**
 * Broker · Usurer — "Every wound is somebody's asset."
 *
 * The Broker's Foreclosure takes once: it strips the guard the enemy stood
 * behind, hits it for 26, banks 30 gold and pays a sliver of the proceeds out
 * as Barrier. It is a seizure, settled inside the round it happens in. The
 * Usurer traded Appraise (14 and 10 gold) for Tithe (14, 20 gold and 7 healing
 * for itself), so the path's whole idea is that harm is income — and its
 * Ultimate is not a seizure at all. It is a loan:
 *
 *  - **the principal**: one bitten copper pressed into the target, 20 damage;
 *  - **the interest**: Poison 6 for three rounds — the debt keeps running
 *    after the film is over, through Guard, whatever the target does next;
 *  - **the collection**: every enemy on the field that is already carrying a
 *    debt — Poisoned, Burning or Vulnerable — pays on it. Each such debt is
 *    worth 8 team gold and 3 Regeneration for two rounds to every hero, the
 *    Usurer included. The target's own fresh Poison is the first of them, so
 *    the party is always paid something;
 *  - **the Usurer's cut**: 20 gold, 8 healing for itself, 2 Credit.
 *
 * It differs from Foreclosure in what it does, not in its numbers: nothing is
 * stripped, nobody is shielded, and most of what it is worth is not paid at
 * the moment it resolves. Foreclosure is a blow that pays now; this is a blow
 * that pays every round, out of wounds the party has already opened.
 *
 * It is a team play in both directions. The Warden's Poison, the Pyromancer's
 * Burn and every Vulnerable the Vanguard, the Reaver or a Magnate leaves on
 * the line are all accounts the Usurer can collect on, and each one it
 * collects on pays the whole party — so the round before this Ultimate is
 * worth spending on afflictions. Afterwards, the Poison it leaves is an
 * account the *next* Usurer cast collects on again, and a Ranger's Exploit or
 * an Arcanist's Chain Shock still lands on a target too busy bleeding copper
 * to guard it. The Regeneration goes onto standing heroes at the end of each
 * round, which is the same clock the Poison ticks on: the enemy's wound and
 * the party's mending are paid out of the same purse, in the same beat.
 *
 * Why Regeneration and not healing: healing now is the Warden's Ultimate, and
 * an interest payment that arrived all at once would not be interest. It also
 * keeps the Usurer's Ultimate out of the bot's "hold it for a party in
 * trouble" bucket, which is where the Warden's sits.
 *
 * Balance (`scripts/ultimate-report.ts 4 --sample=6`, 324 runs, same machine,
 * against the same sample with this path still on Foreclosure) is in
 * `docs/ultimates/compound-interest.md`.
 */
export const ultimate: UltimateDef = {
  id: "compound-interest",
  heroId: "broker",
  evolution: "brk-usurer",
  name: "Compound Interest",
  epithet: "The wound is the loan. The interest is ours.",
  description:
    "Press one copper into the target: 20 damage and Poison 6 for three rounds, and 20 team gold. Then collect: every enemy that is Poisoned, Burning or Vulnerable pays 8 more gold and 3 Regeneration (2 rounds) to every hero, you included. Heal yourself 8 and gain 2 Credit.",
  target: "enemy",
  effects: [
    // The principal, and the interest that runs on after it.
    {
      kind: "damage",
      amount: 20,
    },
    {
      kind: "status",
      status: "poison",
      stacks: 6,
      duration: 3,
    },
    {
      kind: "gold",
      amount: 20,
    },
    // The collection. Every account on the field, the one just opened
    // included: a debt is a wound somebody else is paying for.
    {
      kind: "enemies",
      effects: [
        {
          kind: "conditional",
          status: "poison",
          effects: [
            { kind: "gold", amount: 8 },
            {
              kind: "allies",
              self: true,
              effects: [
                { kind: "status", status: "regen", stacks: 3, duration: 2 },
              ],
            },
          ],
        },
        {
          kind: "conditional",
          status: "burn",
          effects: [
            { kind: "gold", amount: 8 },
            {
              kind: "allies",
              self: true,
              effects: [
                { kind: "status", status: "regen", stacks: 3, duration: 2 },
              ],
            },
          ],
        },
        {
          kind: "conditional",
          status: "vulnerable",
          effects: [
            { kind: "gold", amount: 8 },
            {
              kind: "allies",
              self: true,
              effects: [
                { kind: "status", status: "regen", stacks: 3, duration: 2 },
              ],
            },
          ],
        },
      ],
    },
    // The Usurer's own cut: it never lends what it cannot live on.
    {
      kind: "heal",
      amount: 8,
      self: true,
    },
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 11,
  presentation: {
    cinematic: "compound-interest",
    theme: "contract",
    accent: "#e08a3c",
    voice: {
      activation: "A little something on account. You'll hardly feel it.",
      impact: "And it compounds!",
      after: "Every round that hurts, the pact gets paid. Terms are terms.",
    },
  },
};
