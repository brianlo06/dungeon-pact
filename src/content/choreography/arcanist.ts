import { area, creature, spell } from "./kit";

/**
 * The Arcanist has no staff: its power is in the gloved hand. Every spell is
 * the same gesture at a different size — the hand comes up, the spark in it
 * swells into an orb and holds, and the hand throws it — and what the orb
 * does next is what the ability does.
 *
 * Its clips perform the whole build-up themselves (`anticipation: 0`): the
 * orb forming is drawn on the hand, not waited for in front of the clip. The
 * muzzle rides the `hand` part at the glove's fingertips, where the spark is
 * held — the spark itself is hidden when a weapon replaces it, so the glove
 * is what is always there — and the shot leaves wherever the hand has
 * carried that point at the frame the orb vanishes from it.
 *
 *  - Arcane spark hits one enemy: an orb crosses the stage and bursts on it.
 *  - Storm needle is lightning on one enemy: it comes out of the sky. A Chain
 *    Shock's splash is damage the engine dealt to each of the others, so each
 *    of them is struck at the same moment — nothing more.
 *  - Cloudburst soaks a row but deals no damage, so the engine reports no one
 *    but the target: rain falls on the unit it was cast at.
 *  - Cinder bloom hits a row: the ground under each target it burned glows,
 *    then goes up together.
 *  - Break focus lays a sigil on the wind-up it breaks.
 */
export default creature({
  unit: {
    basic: "spell",
    anchors: {
      /** Where the spark is held, just off the glove's spread fingers. */
      muzzle: { at: [85, 51], part: "hand" },
      hit: { at: [50, 51] },
    },
  },
  abilities: {
    /** Arcane spark, Focused and Siphoning: one orb, one burst. */
    spark: spell({
      charge: "short",
      theme: "arcane",
      timing: { anticipation: 0 },
      projectile: {
        visual: "orb",
        trajectory: "linear",
        speed: 0.6,
        rotate: "none",
        trail: true,
        onArrival: "burst",
        impact: "impact",
      },
      sounds: { charge: "charge-rise", release: "cast-arcane", impact: "arcane-burst" },
    }),
    /** Cloudburst, Deluge, Chilling and the Tidecaller's Riptide. */
    rain: spell({
      delivery: "fromAbove",
      charge: "normal",
      theme: "arcane",
      timing: { anticipation: 0 },
      projectile: {
        visual: "rain",
        /** Rain falls; it does not strike. A fixed, unhurried fall. */
        duration: 380,
        rotate: "none",
        trail: false,
        onArrival: "burst",
        impact: "impact",
      },
      sounds: { charge: "charge-rise", release: "cast-nature" },
    }),
    /** Storm needle, Thunderhead and Grounded: lightning out of the sky. */
    storm: spell({
      delivery: "fromAbove",
      charge: "long",
      weight: "heavy",
      theme: "arcane",
      timing: { anticipation: 0 },
      projectile: {
        visual: "lightning",
        speed: 3.4,
        rotate: "tangent",
        trail: false,
        onArrival: "burst",
        impact: "impact",
      },
      sounds: { charge: "charge-rise", release: "cast-arcane", impact: "arcane-burst" },
    }),
    /** Cinder bloom and the Pyromancer's Immolate: the row's ground erupts. */
    fire: area({
      delivery: "eruption",
      charge: "normal",
      weight: "heavy",
      theme: "arcane",
      timing: { anticipation: 0 },
      sounds: { charge: "charge-rise", release: "cast-arcane", impact: "flame-roar" },
    }),
    /** Break focus and the Chronomancer's Stillness. */
    counterspell: spell({
      delivery: "sigil",
      charge: "short",
      theme: "arcane",
      timing: { anticipation: 0 },
      sounds: { charge: "charge-rise", release: "cast-arcane" },
    }),
  },
});
