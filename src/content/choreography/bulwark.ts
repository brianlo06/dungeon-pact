import { creature, melee, self } from "./kit";

/**
 * The Iron Bulwark is the Slag Hound's opposite. It rears back onto its heels
 * and tips its weight onto the plate, then trudges across the floor — slower
 * than anything else that moves, every footfall heard, the plate leading and
 * the legs catching up — and drives the ram through its target with a long
 * hold on the blow and a hard shake. It rocks back off the hit, stands there
 * a beat, and backs home without ever turning the plate away.
 *
 * Blows land on the plate, a few units in from the ram's point, and shots on
 * the plate's middle.
 */
export default creature({
  unit: {
    basic: "melee",
    locomotion: "heavyWalk",
    /** Stage widths a second: the Hound runs at 2.6 and the Vanguard at 1.1. */
    speed: 0.32,
    reach: 30,
    strikeInset: 5,
    turnToReturn: false,
    anchors: {
      hit: { at: [46, 58], part: "shield" },
      /** The point of the ram boss, as drawn. */
      weapon: { at: [2, 62], part: "ram" },
    },
  },
  abilities: {
    /** Shield ram, legacy and tactical. */
    ram: melee({
      charge: "long",
      weight: "heavy",
      theme: "guard",
      timing: { anticipation: 440, linger: 260 },
      sounds: { step: "footstep-heavy", swing: "swing-heavy", impact: "impact-metal" },
    }),
    /** Lock shields: a brace performed where it stands, not an attack. */
    brace: self({
      weight: "heavy",
      theme: "guard",
      sounds: { charge: "shield-raise", impact: "lock" },
    }),
  },
});
