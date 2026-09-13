import { area, creature } from "./kit";
import type { AbilityPresentation } from "../../shared/presentation";

/**
 * The Living Bellows breathes on a whole row. It draws a long, audible breath
 * — the pleats swell, the handles spread, the snout lifts — and then empties
 * everything at once: a cone of flame thrown out of the horn that opens
 * across every hero the engine burned. One breath, one arrival: every target
 * flinches, takes its number and loses its health at the same instant, and
 * nobody is visited one by one.
 */
const BREATH: AbilityPresentation = {
  delivery: "cone",
  charge: "long",
  weight: "heavy",
  theme: "foundry",
  timing: { anticipation: 0 },
  projectile: {
    visual: "cone",
    trajectory: "beam",
    duration: 280,
    trail: false,
    onArrival: "stick",
    impact: "impact",
  },
  sounds: { charge: "bellows-draw", release: "flame-roar" },
};

export default creature({
  unit: {
    basic: "area",
    anchors: {
      /** The mouth of the horn, riding the snout that lifts and thrusts. */
      muzzle: { at: [4, 61.5], part: "snout" },
      hit: { at: [49, 60] },
    },
  },
  abilities: {
    /** Scorching exhale (legacy). */
    exhale: area(BREATH),
    /** Furnace blast, the breath it winds up for. */
    blast: area({ ...BREATH, projectile: { ...BREATH.projectile, duration: 320 } }),
  },
});
