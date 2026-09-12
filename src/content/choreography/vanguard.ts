import { creature, melee, support } from "./kit";

/**
 * The Vanguard: slow, planted, heavy. It plants its rear foot and raises the
 * sword, charges shield-first, stops at sword's length, brings the sword over
 * the top and down, and backs away behind the shield — it never turns its
 * back on what it just hit.
 *
 * Reach: at contact the blade (wrist at 31,64, 43 long) has come over the
 * top to point forward and a little down; its tip is 44 units in front of
 * the figure's centre. The strike clip's own lunge (a quarter of its width)
 * is added by the choreographer from the clip.
 */
export default creature({
  unit: {
    locomotion: "charge",
    speed: 1.1,
    reach: 44,
    basic: "melee",
    turnToReturn: false,
    anchors: {
      hit: { at: [50, 52] },
      /** The sword's point, as drawn shouldered: it rides the wrist. */
      weapon: { at: [12, 25.5], part: "blade" },
    },
  },
  abilities: {
    /** Shieldbreaker, and the Warlord's Warcry, which keeps the id. */
    bash: melee({ charge: "normal" }),
    /** Foundry slam, and the Breaker's Sunder: the whole row takes it. */
    slam: melee({ charge: "long", delivery: "shockwave" }),
    /** Iron oath / Intercept / Aegis: the shield goes up for an ally. */
    intercept: support({ delivery: "bloom" }),
  },
});
