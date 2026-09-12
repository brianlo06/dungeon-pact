import { creature, melee } from "./kit";

/**
 * The Coin Leech. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "melee", locomotion: "dash", speed: 2.1, reach: 22 },
  abilities: { tithe: melee({ charge: "short", theme: "contract" }) },
});
