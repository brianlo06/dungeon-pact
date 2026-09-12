import { area, creature, spell } from "./kit";

/**
 * The Beguiler. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "spell", anchors: { muzzle: { at: [69, 41] }, hit: { at: [50, 51] } } },
  abilities: {
    whisper: spell({ charge: "short", theme: "sway" }),
    doubt: spell({ delivery: "sigil", charge: "normal", theme: "sway" }),
    unpick: area({ delivery: "shockwave", charge: "long", theme: "sway" }),
  },
});
