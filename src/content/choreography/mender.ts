import { creature, lunge, support } from "./kit";

/**
 * The Kiln Mender repairs by welding. Its clamps reach in towards the ally
 * and work in short bursts while the weld gathers, white-hot, at the lower
 * clamp; on the last burst the clamp throws the weld across the stage, and
 * the repair blooms on the ally the moment it lands — the heal number and
 * the health bar rise then, not when the Mender starts.
 *
 * Its Wrench is a short spiteful lunge: a stride towards the party and back,
 * never a run across the stage.
 *
 * Shots land in the bellows sac, which is what flinches.
 */
export default creature({
  unit: {
    basic: "support",
    anchors: {
      hit: { at: [52, 52], part: "bellows" },
      /** The lower clamp, riding the arm that throws the weld. */
      muzzle: { at: [8, 56], part: "armB" },
    },
  },
  abilities: {
    /** Repair lattice, legacy and tactical (where it is a held wind-up). */
    repair: support({
      delivery: "mote",
      charge: "normal",
      theme: "growth",
      timing: { anticipation: 0 },
      projectile: {
        visual: "weld",
        trajectory: "homing",
        arc: 0.2,
        speed: 0.45,
        rotate: "none",
        trail: true,
        onArrival: "burst",
        impact: "heal",
      },
      sounds: { charge: "weld-hiss", release: "projectile-release" },
    }),
    wrench: lunge({
      charge: "short",
      weight: "light",
      theme: "foundry",
      sounds: { swing: "swing-light", impact: "impact-metal" },
    }),
  },
});
