import { creature, projectile } from "./kit";
import type { ProjectileLook } from "../../shared/presentation";

/**
 * The Rivet Sniper never moves its feet. It settles into the stock and goes
 * dead still on the sight while the rivet heats — the glow gathers at the
 * muzzle — then fires: a flash at the barrel, the crack, and a red-hot rivet
 * flying flat and fast from where the barrel actually is. Only after the
 * shot has left does the gun kick up and back into its shoulder. Nothing
 * lands until the rivet does.
 *
 * Kill shot is the move it winds up for. If the wind-up is broken the engine
 * never reports the shot, so nothing is aimed, heated or fired: the
 * choreographer only ever performs a move that has a `cast` beat.
 */
const RIVET: ProjectileLook = {
  visual: "rivet",
  trajectory: "linear",
  speed: 2.4,
  rotate: "tangent",
  trail: true,
  onArrival: "burst",
  impact: "impact",
  muzzleFlash: true,
};

export default creature({
  unit: {
    basic: "projectile",
    anchors: {
      /** The flared muzzle, riding the gun so a kick carries it. */
      muzzle: { at: [1.5, 50], part: "gun" },
      hit: { at: [68, 52] },
    },
  },
  abilities: {
    /** Back-row rivet (legacy). */
    rivet: projectile({
      charge: "long",
      theme: "foundry",
      timing: { anticipation: 0 },
      projectile: RIVET,
      sounds: { charge: "weld-hiss", release: "rivet-fire", travel: "arrow-whoosh", impact: "impact-metal" },
    }),
    /** Kill shot: the wound-up shot, held longer and landing harder. */
    killshot: projectile({
      charge: "long",
      weight: "heavy",
      theme: "foundry",
      timing: { anticipation: 0 },
      projectile: { ...RIVET, speed: 3 },
      sounds: { charge: "charge-rise", release: "rivet-fire", travel: "arrow-whoosh", impact: "impact-heavy" },
    }),
  },
});
