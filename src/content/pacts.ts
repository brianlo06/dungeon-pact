/**
 * The starting pact.
 *
 * Two numbers that have to agree in three places — the engine that applies
 * them, the screen that offers them and the simulator that measures them — so
 * they live here rather than in any of the three.
 *
 * The Gilded purse is paid per hero who swears it. It used to be a flat sum
 * against a per-hero health price, which made it a bargain for a duo and a
 * mistake for a quartet: the same gold bought four heroes less than it bought
 * two while costing twice the health. Playtesters put it plainly — there was
 * no reason to pick it. Paying by the head puts the two pacts within a few
 * points of each other at every party size, measured with `--pact=`.
 */

/** The Gilded pact's purse, per hero who swears it. */
export const WEALTH_PER_HERO = 120;
/** What the Gilded pact costs each hero in maximum HP. */
export const WEALTH_MAX_HP = 6;
/** What the Unbroken pact grants each hero in maximum HP. */
export const VITALITY_MAX_HP = 10;

/** What a party of this size would carry in if it swore the Gilded pact. */
export const gildedPurse = (treasury: number, party: number) =>
  treasury + WEALTH_PER_HERO * party;
