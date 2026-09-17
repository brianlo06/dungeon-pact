import { area, creature, melee, self } from "./kit";

/**
 * The Notary. It presses rather than swings: every blow is the stamp brought
 * down in place, so its row strike is a shockwave out of the floor where the
 * matrix lands, and the pressing is the same move held longer and heavier.
 */
export default creature({
  unit: {
    basic: "melee",
    locomotion: "heavyWalk",
    speed: 0.6,
    reach: 48,
    anchors: { weapon: { at: [19, 60], part: "stamp" }, hit: { at: [47, 52] } },
  },
  abilities: {
    /** Attest: the stamp brought down on one hero. */
    attest: melee({ charge: "long", weight: "heavy", theme: "contract" }),
    /** Strike from the record: a row struck out. */
    "strike-record": area({ delivery: "shockwave", charge: "long", weight: "heavy", theme: "contract" }),
    /** Press the seals: the wound-up stamp, landing where the wax will be. */
    press: self({ charge: "long", weight: "signature", theme: "contract" }),
  },
});
