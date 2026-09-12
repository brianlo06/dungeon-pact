import { area, creature, spell, support } from "./kit";

/**
 * The Herald. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "spell", anchors: { muzzle: { at: [73, 39] }, hit: { at: [50, 52] } } },
  abilities: {
    rally: spell({ delivery: "shockwave", charge: "short", theme: "resonance" }),
    anthem: support({ delivery: "bloom", charge: "long", theme: "resonance" }),
    cadence: area({ delivery: "shockwave", theme: "resonance" }),
  },
});
