import type { UltimateDef } from "../ultimates";

/**
 * Arcanist · Pyromancer — "Water was always the slower answer."
 *
 * The Arcanist's Debt of Thunder is patience cashed in: Wet on every enemy
 * first, then one bolt that sets off Chain Shock and leaves the rest soaked
 * for the party. The Pyromancer traded Cinder bloom for Immolate, three points
 * of power for eight of its own health, and stopped waiting for the water. Its
 * Ultimate lays nothing down for later and does not strike one target. It
 * sends fire down on a whole row and leaves it burning:
 *
 *  - **the row goes up**: every enemy in the chosen row takes 28 fire and
 *    Burns 8 a round for three rounds (Burn stacks, so a row already burning
 *    from Immolate burns 14);
 *  - **water is the slower answer**: any Wet on those enemies flashes to
 *    steam, 10 more through armour, and the Wet is gone. Where the Arcanist
 *    spends Wet on lightning, the Pyromancer boils it off;
 *  - **the party piles on**: every enemy that is burning, in the row or out of
 *    it, is Vulnerable this round, so the party's blows land a quarter harder
 *    on what the fire has hold of;
 *  - **the price is its own**: the Pyromancer catches too, Burn 3 for two
 *    rounds, on a body already eight health short. A Warden or a Herald can
 *    clear it; nothing else will;
 *  - and it gains 2 Mana.
 *
 * Its team play is the reactions from the other side. A Tidecaller's Riptide,
 * a Debt of Thunder or its own Cloudburst leaves Wet for it to boil; its
 * Vulnerable makes every ally's hit, a Ranger's Exploit included, count for
 * more that round; and what it costs is a cleanse for a healer to spend.
 */
export const ultimate: UltimateDef = {
  id: "dry-flood",
  heroId: "arcanist",
  evolution: "arc-pyromancer",
  name: "Dry Flood",
  epithet: "It runs where the water ran. Faster.",
  description:
    "Send fire down on an enemy row: 28 Fire and Burn 8 for 3 rounds to each, and any Wet on them flashes to steam for 10 more through armour. Every burning enemy is Vulnerable this round. The Pyromancer catches too: Burn 3 for 2 rounds. +2 Mana.",
  target: "enemyRow",
  effects: [
    {
      kind: "enemies",
      row: true,
      effects: [
        {
          // Water was always the slower answer: it boils off first.
          kind: "conditional",
          status: "wet",
          effects: [
            { kind: "removeStatus", status: "wet" },
            { kind: "damage", amount: 10, damageType: "fire", pierce: true },
          ],
        },
        { kind: "damage", amount: 28, damageType: "fire" },
        { kind: "status", status: "burn", stacks: 8, duration: 3 },
      ],
    },
    {
      // Whatever is burning, anywhere on their side, is brittle this round.
      kind: "enemies",
      effects: [
        {
          kind: "conditional",
          status: "burn",
          effects: [{ kind: "status", status: "vulnerable", stacks: 1, duration: 1 }],
        },
      ],
    },
    { kind: "status", status: "burn", stacks: 3, duration: 2, self: true },
    { kind: "resource", amount: 2 },
  ],
  cost: 100,
  speed: 10,
  presentation: {
    cinematic: "dry-flood",
    theme: "arcane",
    accent: "#ff8a2a",
    voice: {
      activation: "Water always took its time.",
      impact: "Done waiting.",
      after: "It'll go out. Eventually.",
    },
  },
};
