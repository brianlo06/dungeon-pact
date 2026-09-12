import { creature, melee } from "./kit";

/**
 * The Slag Hound is the opposite of the Vanguard: it crouches, bursts across
 * the floor low and flat far faster than anything else, bites on the way
 * through, carries on past its target, wheels round and runs home. Double
 * bite bites twice — two contacts in one strike, because the engine resolves
 * two hits — and Pounce comes in as one long leap with the shadow left on
 * the floor.
 */
export default creature({
  unit: {
    locomotion: "dash",
    speed: 2.6,
    basic: "melee",
    turnToReturn: true,
    /** How far past its target the bite carries it, in drawing units. */
    overshoot: 30,
    anchors: {
      hit: { at: [52, 55] },
      muzzle: { at: [8, 55], part: "jaw" },
    },
  },
  abilities: {
    /** Searing bite, and the tactical Double bite (two hits, two contacts). */
    bite: melee({ charge: "short" }),
    pounce: melee({ locomotion: "leap", charge: "normal" }),
  },
});
