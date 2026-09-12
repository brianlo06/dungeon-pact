import { creature, projectile, support } from "./kit";

/**
 * The Broker. Not annotated yet: every move it makes is on the generic
 * defaults (see `docs/CHOREOGRAPHY.md`, "Generic defaults"). Annotate its
 * unit and its abilities here, and nowhere else.
 */
export default creature({
  unit: { basic: "projectile", anchors: { muzzle: { at: [70, 48] }, hit: { at: [50, 52] } } },
  abilities: {
    appraise: projectile({ charge: "short", theme: "contract" }),
    invest: projectile({ charge: "long", weight: "heavy", theme: "contract" }),
    insure: support({ delivery: "bloom", theme: "contract" }),
  },
});
