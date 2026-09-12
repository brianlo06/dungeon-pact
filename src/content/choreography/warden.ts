import { area, creature, spell, support } from "./kit";

/**
 * The Warden. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "spell", anchors: { muzzle: { at: [72, 43] }, hit: { at: [50, 52] } } },
  abilities: {
    thorn: spell({ delivery: "bolt", charge: "short" }),
    mend: support({ delivery: "mote", charge: "normal" }),
    dew: spell({ delivery: "bolt", charge: "short" }),
    briar: area({ delivery: "eruption", charge: "long" }),
  },
});
