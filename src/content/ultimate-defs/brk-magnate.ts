import type { UltimateDef } from "../ultimates";

/**
 * Broker · Magnate — "Buy the problem. Then break it."
 *
 * The Broker's Foreclosure takes what an enemy stood behind: it strips the
 * guard, strikes for 26, banks 30 gold and pays a sliver of the proceeds out
 * as Barrier. It makes money and hands it round. The Magnate traded Leveraged
 * strike (50 gold for 34) for Hostile bid (50 gold for 44 and Vulnerable): it
 * is the one Broker that pays for a blow. Its Ultimate is not a seizure. It is
 * a purchase, made in a room full of rival bidders, and the lot it buys is the
 * enemy's next move:
 *
 *  - **the bid**: 40 team gold — unless the target is already Vulnerable. A
 *    problem someone else has already broken is a distressed asset, and the
 *    Magnate buys it for nothing (the bid comes straight back). A short
 *    treasury pays whatever it holds; an Ultimate is never refused for want
 *    of gold;
 *  - **the problem, bought out**: the target's WINDUP is broken;
 *  - **the hammer**: 36 through armour, and the target is left Vulnerable for
 *    two rounds;
 *  - **the room, outbid**: every other enemy loses its nerve and is Weak this
 *    round;
 *  - **the commission**: 2 Credit.
 *
 * It differs from Foreclosure in what it does, not only in its numbers:
 * nothing is stripped, nobody is shielded, and the treasury goes *down*. It
 * spends the party's money to take one threat off the board this round and
 * blunt every other one, and it leaves the target open for the party.
 *
 * It is a team play in both directions. Every Vulnerable the Vanguard, the
 * Reaver's Drag them down, a Gloomstalker's volley, a Breaker or the
 * Magnate's own Hostile bid leaves on an enemy makes this Ultimate free; and
 * the Vulnerable it leaves is what the Mindflayer holes, what a Usurer
 * collects on, and 25% more on every hit the party lands this round and next.
 * The Weak on the rest of the room is the party's cover for the round it
 * resolves in: an Ultimate resolves before anyone acts.
 *
 * Order matters in the list below: the refund is read before the Vulnerable
 * this Ultimate writes, so the Magnate only buys cheap what was already
 * broken.
 *
 * Balance (`scripts/ultimate-report.ts 4 --sample=6`, 324 runs, same machine,
 * against the same sample with this path still on Foreclosure) is in
 * `docs/ultimates/hammer-price.md`.
 */
export const ultimate: UltimateDef = {
  id: "hammer-price",
  heroId: "broker",
  evolution: "brk-magnate",
  name: "Hammer Price",
  epithet: "Going once. Going twice. Gone.",
  description:
    "Outbid the room for an enemy: spend 40 team gold — nothing, if it is already Vulnerable — break its WINDUP and bring the hammer down for 36 through armour, leaving it Vulnerable. Every other enemy is outbid and Weak this round. Gain 2 Credit.",
  target: "enemy",
  effects: [
    // A distressed asset: the bid comes back before it is paid.
    {
      kind: "conditional",
      status: "vulnerable",
      effects: [{ kind: "gold", amount: 40 }],
    },
    // The bid.
    {
      kind: "gold",
      amount: -40,
    },
    // The problem, bought out.
    {
      kind: "interrupt",
    },
    // The hammer.
    {
      kind: "damage",
      amount: 36,
      pierce: true,
    },
    {
      kind: "status",
      status: "vulnerable",
      stacks: 1,
      duration: 2,
    },
    // The room, outbid.
    {
      kind: "enemies",
      others: true,
      effects: [{ kind: "status", status: "weak", stacks: 1, duration: 1 }],
    },
    // The commission.
    {
      kind: "resource",
      amount: 2,
    },
  ],
  cost: 100,
  speed: 10,
  presentation: {
    cinematic: "hammer-price",
    theme: "contract",
    accent: "#e05bd8",
    voice: {
      activation: "Do I hear a bid? I do. Mine.",
      impact: "Sold!",
      after: "Bought and broken. The rest of you: paddles down.",
    },
  },
};
