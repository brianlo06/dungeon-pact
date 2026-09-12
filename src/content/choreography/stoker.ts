import { creature, melee } from "./kit";

/**
 * The Cinder Stoker. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "melee", locomotion: "run", speed: 1.45, reach: 24, anchors: { weapon: { at: [75, 55] } } },
  abilities: { tongs: melee({ charge: "short", theme: "foundry" }) },
});
