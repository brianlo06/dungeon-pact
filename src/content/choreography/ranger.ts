import { ARROW, bow, creature } from "./kit";

/**
 * The Ranger never closes the distance: it turns to its target, raises the
 * bow, draws — the string comes back, the limbs bend, the arrow is on the
 * string — holds, and looses. The arrow is a real projectile from the drawn
 * arrow's position at the moment of release, and nothing lands until it
 * does.
 *
 * The muzzle rides the `arrow` part, a little behind the head of the drawn
 * arrow (the shaft runs 35,64 → 62,70 as drawn), so the shot leaves exactly
 * where the arrow was when the string let go.
 */
export default creature({
  unit: {
    locomotion: "run",
    basic: "bow",
    anchors: {
      muzzle: { at: [55, 68], part: "arrow" },
      hit: { at: [50, 50] },
    },
  },
  abilities: {
    /**
     * True shot. A precision shot: when it exploits a mark (the engine says
     * so with an EXPLOIT beat) the mark flashes on the target before the
     * release. Otherwise it is a plain draw.
     */
    arrow: bow({ charge: "marked" }),
    /** Quarry sign lays a mark with an arrow; Snare also bites. */
    mark: bow({ delivery: "sigil", charge: "short" }),
    /**
     * Split the sky strikes a whole row, so it looses one arrow per target
     * the engine hit — high, so they come down together.
     */
    volley: bow({
      charge: "long",
      projectile: { ...ARROW, arc: 0.32, speed: 1.6 },
    }),
    /** Pinning shot: a snap shot. */
    suppress: bow({ charge: "short" }),
  },
  named: {
    /** The Sharpshooter's shot ignores armour: a long draw, a flat fast arrow. */
    "Piercing shot": bow({
      charge: "long",
      projectile: { ...ARROW, arc: 0.02, speed: 2.8 },
    }),
  },
});
