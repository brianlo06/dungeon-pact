import type { Rig } from "./animation";

/**
 * Rigs for the Miser, the Rivet Sniper and the Coin Leech.
 *
 * Enemies face the party, which is to their left, and the root transform is
 * not mirrored for them. So in these rigs *forward is negative x* and leaning
 * into a blow is a *negative* rotation; the pull-back before a strike goes the
 * other way. (The root pivots at the unit's ground point.)
 */

/**
 * The Miser: it does not want to get up. Its idle is counting — the hand taps
 * the stacks, the head follows each coin, and every so often it looks up at
 * the party as if they owed it something. Its strikes are the hand — the big
 * four-fingered toad's hand that is its silhouette: held up over its head
 * through a wind-up, then brought over the top and raked out at the party at
 * full stretch, the hump following a beat late and the coin shawl lagging
 * behind that. Hit, it barely shifts — the coins on its back take it — and
 * the hand is left wherever it was, so a flinch never breaks a held wind-up.
 *
 * The arm pivots at the shoulder with the hand below and in front of it, so a
 * *positive* rotation of `hand` swings it forward and up towards the party;
 * past about 100 degrees it is overhead, behind the eye.
 */
const miser: Rig = {
  idle: {
    duration: 5400,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.35, y: -0.006, rotate: -0.5, squash: 1.004 },
      { at: 0.7, y: 0.002, rotate: 0.4 },
      { at: 1, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      // Three taps, a pause, then it looks up at who it is counting for.
      hand: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.06, rotate: 4, y: -0.012 },
        { at: 0.12, rotate: -1, y: 0.006 },
        { at: 0.18, rotate: 4, y: -0.012 },
        { at: 0.24, rotate: -1, y: 0.006 },
        { at: 0.3, rotate: 4, y: -0.012 },
        { at: 0.36, rotate: -1, y: 0.006 },
        { at: 0.5, rotate: 1, y: 0 },
        { at: 0.62, rotate: 7, y: -0.02 },
        { at: 0.8, rotate: 6, y: -0.018 },
        { at: 1, rotate: 0, y: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.08, rotate: -3 },
        { at: 0.2, rotate: -2 },
        { at: 0.32, rotate: -3.5 },
        { at: 0.45, rotate: -1 },
        { at: 0.62, rotate: 7 },
        { at: 0.82, rotate: 6 },
        { at: 1, rotate: 0 },
      ],
      // The throat sac fills and empties; it mutters when it looks up.
      jaw: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.3, rotate: 0, scale: 1.03 },
        { at: 0.56, rotate: 0, scale: 1 },
        { at: 0.66, rotate: -4 },
        { at: 0.71, rotate: -1 },
        { at: 0.76, rotate: -4 },
        { at: 0.86, rotate: 0 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      shawl: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.4, rotate: 0.6, y: -0.004 },
        { at: 0.75, rotate: -0.4 },
        { at: 1, rotate: 0, y: 0 },
      ],
      body: [
        { at: 0, squash: 1 },
        { at: 0.4, squash: 1.008 },
        { at: 1, squash: 1 },
      ],
      stacks: [
        { at: 0, y: 0 },
        { at: 0.07, y: 0.004 },
        { at: 0.12, y: 0 },
        { at: 0.19, y: 0.004 },
        { at: 0.24, y: 0 },
        { at: 0.31, y: 0.004 },
        { at: 0.36, y: 0 },
      ],
    },
  },
  /**
   * A plain blow: scoop, draw back, fling a fistful of gold. The director
   * plays `signature` for both of the Miser's strikes, so this is the
   * fallback for anything else that asks for an attack.
   */
  attack: {
    duration: 920,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1, scale: 1 },
      { at: 0.14, x: -0.01, rotate: -2, squash: 1.02 },
      { at: 0.34, x: 0.04, rotate: 4, squash: 1.06, y: 0.01 },
      { at: 0.48, x: -0.1, rotate: -5, squash: 0.94, scale: 1.03, y: -0.01 },
      { at: 0.62, x: -0.07, rotate: -3, squash: 0.98 },
      { at: 0.82, x: -0.02, rotate: -1 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, y: 0 },
    ],
    parts: {
      // Scooped down into the heap, then thrown out level at the party:
      // high enough to fling, never so high the hand covers its own face.
      hand: [
        { at: 0, rotate: 0, x: 0, y: 0 },
        { at: 0.14, rotate: -6, y: 0.012 },
        { at: 0.34, rotate: -32, x: 0.01, y: 0 },
        { at: 0.48, rotate: 22, x: -0.025, y: 0.01 },
        { at: 0.62, rotate: 16, x: -0.02, y: 0.01 },
        { at: 0.82, rotate: 5, x: -0.005 },
        { at: 1, rotate: 0, x: 0, y: 0 },
      ],
      head: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.14, rotate: -5 },
        { at: 0.34, rotate: 7, x: 0.01 },
        { at: 0.48, rotate: -6, x: -0.02 },
        { at: 0.7, rotate: -2, x: -0.01 },
        { at: 1, rotate: 0, x: 0 },
      ],
      jaw: [
        { at: 0, rotate: 0 },
        { at: 0.34, rotate: -6 },
        { at: 0.48, rotate: -20 },
        { at: 0.64, rotate: -12 },
        { at: 0.86, rotate: -2 },
        { at: 1, rotate: 0 },
      ],
      // The coin shawl is heavy and lags the body in both directions.
      shawl: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -2.5 },
        { at: 0.56, rotate: 3.5 },
        { at: 0.74, rotate: -1.5 },
        { at: 1, rotate: 0 },
      ],
      body: [
        { at: 0, squash: 1 },
        { at: 0.34, squash: 1.03 },
        { at: 0.5, squash: 0.98 },
        { at: 1, squash: 1 },
      ],
      stacks: [
        { at: 0, y: 0, rotate: 0 },
        { at: 0.16, y: 0.012, rotate: -2 },
        { at: 0.3, y: 0, rotate: 1 },
        { at: 1, y: 0, rotate: 0 },
      ],
    },
  },
  /**
   * Crushing levy held in the air: the hand goes up over its head, fingers
   * spread, and stays there, flexing, while the head glares down at the party
   * and the jaw works. The threat is the held pose, as the Collector's. The
   * hand is lifted clear above the head with daylight under the fingers, and
   * held a little forward so the palm does not sit on the coin crest either:
   * filled black, the raised hand, the eye and the crest are three separate
   * shapes rather than one knot, for as long as the wind-up is held.
   */
  windup: {
    duration: 1300,
    loop: true,
    poses: [
      { at: 0, y: -0.01, scale: 1.015, flash: 0, rotate: 1 },
      { at: 0.5, y: -0.018, scale: 1.03, flash: 0.22, rotate: 2 },
      { at: 1, y: -0.01, scale: 1.015, flash: 0, rotate: 1 },
    ],
    parts: {
      hand: [
        { at: 0, rotate: 110, x: -0.02, y: -0.11 },
        { at: 0.5, rotate: 116, x: -0.016, y: -0.12 },
        { at: 1, rotate: 110, x: -0.02, y: -0.11 },
      ],
      head: [
        { at: 0, rotate: -7, x: -0.01 },
        { at: 0.5, rotate: -9, x: -0.014 },
        { at: 1, rotate: -7, x: -0.01 },
      ],
      jaw: [
        { at: 0, rotate: -3 },
        { at: 0.25, rotate: -9 },
        { at: 0.5, rotate: -3 },
        { at: 0.75, rotate: -9 },
        { at: 1, rotate: -3 },
      ],
      shawl: [
        { at: 0, scale: 1.01, rotate: 0.5 },
        { at: 0.5, scale: 1.03, rotate: 1, y: -0.006 },
        { at: 1, scale: 1.01, rotate: 0.5 },
      ],
      body: [
        { at: 0, squash: 0.99 },
        { at: 0.5, squash: 0.98 },
        { at: 1, squash: 0.99 },
      ],
    },
  },
  /**
   * Crushing levy, and the Weight of wealth blow: it rises off the heap with
   * the hand still up, then brings it over the top and rakes it out at the
   * party, the arm at full stretch and the whole body lunging behind it. At
   * impact the hand is further towards the party than anywhere else in its
   * repertoire — well past the held wind-up — so it reads as reaching them,
   * not as slapping its own gold. It starts from the held wind-up pose, since
   * that is what comes before the levy; from idle (Weight of wealth) the
   * animator eases it up into the same place.
   */
  signature: {
    duration: 1240,
    poses: [
      { at: 0, x: 0, y: -0.012, rotate: 1.5, scale: 1.02 },
      {
        at: 0.22,
        x: 0.04,
        y: -0.035,
        rotate: 5,
        scale: 1.05,
        squash: 0.96,
        flash: 0.2,
      },
      { at: 0.38, x: 0.05, y: -0.04, rotate: 6, scale: 1.06, flash: 0.45 },
      {
        at: 0.5,
        x: -0.12,
        y: 0.01,
        rotate: -7,
        scale: 1.04,
        squash: 1.08,
        flash: 0.6,
      },
      { at: 0.66, x: -0.08, rotate: -4, squash: 1.02, flash: 0.2 },
      { at: 1, x: 0, y: 0, rotate: 0, scale: 1, squash: 1, flash: 0 },
    ],
    parts: {
      hand: [
        { at: 0, rotate: 113, x: -0.018, y: -0.115 },
        { at: 0.24, rotate: 124, x: 0.012, y: -0.13 },
        { at: 0.38, rotate: 130, x: 0.014, y: -0.135 },
        // Over the top and out: the rake lands at full reach.
        { at: 0.5, rotate: 16, x: -0.07, y: 0.005 },
        { at: 0.6, rotate: 8, x: -0.07, y: 0.02 },
        { at: 0.78, rotate: 3, x: -0.025, y: 0.008 },
        { at: 1, rotate: 0, x: 0, y: 0 },
      ],
      jaw: [
        { at: 0, rotate: -6 },
        { at: 0.3, rotate: -14 },
        { at: 0.5, rotate: -24 },
        { at: 0.72, rotate: -8 },
        { at: 1, rotate: 0 },
      ],
      // The head goes back as the hand goes up, and the gape follows the
      // hand out, high enough that the arm passes under the jaw.
      head: [
        { at: 0, rotate: -8, x: -0.012 },
        { at: 0.3, rotate: 6, x: 0.004 },
        { at: 0.5, rotate: 2, x: -0.02, y: -0.012 },
        { at: 0.7, rotate: -1, x: -0.01 },
        { at: 1, rotate: 0, x: 0, y: 0 },
      ],
      shawl: [
        { at: 0, rotate: 0.8, scale: 1.02 },
        { at: 0.3, rotate: -3, scale: 1.03 },
        { at: 0.56, rotate: 5, scale: 1.02 },
        { at: 0.78, rotate: -2, scale: 1 },
        { at: 1, rotate: 0 },
      ],
      // The heap shifts under it as its weight comes forward.
      stacks: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.5, rotate: 0, x: 0 },
        { at: 0.58, rotate: -5, x: -0.012 },
        { at: 0.8, rotate: 2 },
        { at: 1, rotate: 0, x: 0 },
      ],
      hoard: [
        { at: 0, y: 0 },
        { at: 0.5, y: 0 },
        { at: 0.56, y: -0.012 },
        { at: 0.7, y: 0 },
      ],
      body: [
        { at: 0, squash: 0.99 },
        { at: 0.38, squash: 0.97 },
        { at: 0.52, squash: 1.04 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Its gold takes the blow: it hunkers down into the shawl. */
  block: {
    duration: 620,
    poses: [
      { at: 0, y: 0, squash: 1, rotate: 0 },
      { at: 0.22, y: 0.012, squash: 1.06, rotate: 1 },
      { at: 0.55, y: 0.006, squash: 1.03, rotate: 0.5 },
      { at: 1, y: 0, squash: 1, rotate: 0 },
    ],
    parts: {
      shawl: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.2, rotate: -2, scale: 1.04 },
        { at: 0.5, rotate: 1, scale: 1.02 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      head: [
        { at: 0, x: 0, y: 0, rotate: 0 },
        { at: 0.24, x: 0.02, y: 0.02, rotate: 5 },
        { at: 0.7, x: 0.01, y: 0.01, rotate: 2 },
        { at: 1, x: 0, y: 0, rotate: 0 },
      ],
      // No hand track: whatever the hand is doing — counting, or held up
      // over a wind-up — it keeps doing through the blow.
      jaw: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: -3 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt: {
    duration: 320,
    poses: [
      // A boss barely moves when hit, and this one is sitting on its money.
      { at: 0, x: 0, flash: 0.85 },
      { at: 0.2, x: 0.03, rotate: 1.5, squash: 0.98, flash: 0.5 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      // The figure holds; the coins on its back jingle and the head flinches.
      shawl: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: 3 },
        { at: 0.6, rotate: -2 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: 6 },
        { at: 1, rotate: 0 },
      ],
      jaw: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: -9 },
        { at: 0.6, rotate: -2 },
        { at: 1, rotate: 0 },
      ],
      // No hand track, like the Collector's key: a flinch played over a held
      // wind-up must not knock the raised hand out of it.
    },
  },
  /** It slumps forward over its hoard, reaching for the stacks to the last. */
  defeat: {
    duration: 1400,
    poses: [
      { at: 0, rotate: 0, y: 0, flash: 1 },
      { at: 0.2, rotate: 3, y: -0.02, flash: 0.7 },
      { at: 0.55, rotate: -9, y: 0.03, flash: 0.3 },
      { at: 1, rotate: -16, y: 0.08, scale: 0.95, flash: 0 },
    ],
    parts: {
      hand: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 16 },
        { at: 1, rotate: -14, y: 0.03 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: 8 },
        { at: 1, rotate: -16, y: 0.03 },
      ],
      jaw: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: -18 },
        { at: 1, rotate: -12 },
      ],
      shawl: [
        { at: 0, rotate: 0, y: 0 },
        { at: 1, rotate: -5, y: 0.03 },
      ],
      // The stacks go over.
      stacks: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.5, rotate: -6 },
        { at: 1, rotate: -24, x: -0.03, y: 0.01 },
      ],
    },
  },
};

/**
 * The Rivet Sniper: patient, then violent. Its idle is aiming — the barrel
 * drifts and corrects, the head stays glued to the sight, the ears twitch.
 * When it fires, nothing moves for a beat, then the gun kicks up and back into
 * its shoulder, the body rocks, and it settles and re-aims. Hit, it is small
 * and light and it gets knocked about.
 *
 * The gun pivots at the stock with the muzzle far to the left, so a
 * *positive* rotation of `gun` lifts the muzzle.
 */
const sniper: Rig = {
  idle: {
    duration: 3300,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.5, y: -0.008, squash: 0.995 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      // Aim drifts and is corrected: a slow wander, a small snap back.
      gun: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 1.4 },
        { at: 0.36, rotate: 0.2 },
        { at: 0.7, rotate: -1.1 },
        { at: 0.76, rotate: -0.1 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 1.6 },
        { at: 0.36, rotate: 0.4 },
        { at: 0.7, rotate: -1.2 },
        { at: 0.76, rotate: 0 },
        { at: 0.86, rotate: 3.5 },
        { at: 0.9, rotate: 0 },
        { at: 1, rotate: 0 },
      ],
      body: [
        { at: 0, squash: 1, rotate: 0 },
        { at: 0.5, squash: 1.02, rotate: 0.6 },
        { at: 1, squash: 1, rotate: 0 },
      ],
      brazier: [
        { at: 0, rotate: 0 },
        { at: 0.45, rotate: 1.2 },
        { at: 1, rotate: 0 },
      ],
      belt: [
        { at: 0, rotate: 0 },
        { at: 0.4, rotate: -3 },
        { at: 0.8, rotate: 2 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Back-row rivet: settle, hold, fire, kick, re-aim. */
  attack: {
    duration: 620,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.26, x: 0.01, rotate: 0, squash: 1.05, y: 0.01 },
      { at: 0.38, x: 0.01, squash: 1.06, y: 0.012 },
      { at: 0.46, x: 0.08, rotate: 5, squash: 0.94, flash: 0.35 },
      { at: 0.62, x: 0.05, rotate: 3, flash: 0.1 },
      { at: 1, x: 0, rotate: 0, squash: 1, y: 0, flash: 0 },
    ],
    parts: {
      gun: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.26, rotate: -0.6, x: -0.01 },
        { at: 0.38, rotate: -0.6, x: -0.01 },
        { at: 0.46, rotate: 14, x: 0.06 },
        { at: 0.6, rotate: 8, x: 0.03 },
        { at: 0.84, rotate: 1.5, x: 0 },
        { at: 1, rotate: 0, x: 0 },
      ],
      head: [
        { at: 0, rotate: 0, x: 0 },
        { at: 0.38, rotate: -2, x: -0.01 },
        { at: 0.48, rotate: 12, x: 0.03 },
        { at: 0.7, rotate: 3 },
        { at: 1, rotate: 0, x: 0 },
      ],
      body: [
        { at: 0, rotate: 0 },
        { at: 0.38, rotate: -2 },
        { at: 0.5, rotate: 6 },
        { at: 1, rotate: 0 },
      ],
      brazier: [
        { at: 0, rotate: 0, y: 0 },
        { at: 0.5, rotate: 7, y: -0.02 },
        { at: 0.72, rotate: -3, y: 0 },
        { at: 1, rotate: 0 },
      ],
      belt: [
        { at: 0, rotate: 0 },
        { at: 0.52, rotate: 12 },
        { at: 0.76, rotate: -6 },
        { at: 1, rotate: 0 },
      ],
      legs: [
        { at: 0, squash: 1 },
        { at: 0.38, squash: 1.04 },
        { at: 0.52, squash: 0.97 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Kill shot held: dead still on the sight, the whole thing drawn tight. */
  windup: {
    duration: 1600,
    loop: true,
    poses: [
      { at: 0, y: 0.008, squash: 1.04, flash: 0 },
      { at: 0.5, y: 0.01, squash: 1.05, flash: 0.25 },
      { at: 1, y: 0.008, squash: 1.04, flash: 0 },
    ],
    parts: {
      gun: [
        { at: 0, rotate: -0.4, x: -0.01 },
        { at: 1, rotate: -0.4, x: -0.01 },
      ],
      head: [
        { at: 0, rotate: -3, x: -0.015 },
        { at: 1, rotate: -3, x: -0.015 },
      ],
      belt: [
        { at: 0, rotate: 0 },
        { at: 0.5, rotate: 2 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** Take aim: it tucks in behind the gun. */
  block: {
    duration: 520,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.3, y: 0.02, squash: 1.1 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      head: [
        { at: 0, y: 0, rotate: 0 },
        { at: 0.3, y: 0.04, rotate: -4 },
        { at: 1, y: 0, rotate: 0 },
      ],
      gun: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -3 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt: {
    duration: 360,
    poses: [
      // Small and light: it gets knocked back off its aim.
      { at: 0, x: 0, flash: 0.9 },
      { at: 0.18, x: 0.13, rotate: 8, squash: 0.88, flash: 0.55 },
      { at: 0.46, x: -0.03, rotate: -3, squash: 1.04 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      gun: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: -12 },
        { at: 0.5, rotate: 5 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: 14 },
        { at: 0.6, rotate: -4 },
        { at: 1, rotate: 0 },
      ],
      brazier: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: 10 },
        { at: 0.6, rotate: -5 },
        { at: 1, rotate: 0 },
      ],
      belt: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 16 },
        { at: 0.7, rotate: -8 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /** It goes over backwards and the gun noses into the floor. */
  defeat: {
    duration: 900,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.25, rotate: -6, y: -0.03, flash: 0.5 },
      { at: 1, rotate: 64, y: 0.14, x: 0.06, scale: 0.92, flash: 0 },
    ],
    parts: {
      gun: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 6 },
        { at: 1, rotate: -40, y: 0.06 },
      ],
      head: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 24 },
      ],
      brazier: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 30 },
      ],
      legs: [
        { at: 0, squash: 1 },
        { at: 1, squash: 0.8 },
      ],
    },
  },
};

/**
 * The Coin Leech: quick, and it moves like something with no bones that is
 * about to go for you. Its idle is a strike held back — the arch breathes,
 * the coil tightens, and the head hangs low at the end of the neck, tracking,
 * with a small feint towards the party every loop. It strikes by winding the
 * arch back and up, then throwing the whole column forward with the neck
 * stretching past its length; it latches, holds, and pulls back as the belly
 * swells with what it took.
 *
 * The body is a chain of loose parts rather than a hierarchy, so wherever
 * `upper` swings, `head` is carried with the matching translation — the head
 * joint (36, 44) rotated about the arch's root (72, 50) — to keep the neck
 * closed; any x or y beyond that is the neck stretching. Positive `upper` and
 * `head` rotations rear back and lift the mouth; negative ones drop the arch
 * towards the party.
 */
const leech: Rig = {
  idle: {
    duration: 2600,
    loop: true,
    interruptible: true,
    poses: [
      { at: 0, x: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.25, x: 0.008, y: -0.006, rotate: 0.8, squash: 0.99 },
      { at: 0.5, x: 0, y: 0, rotate: 0, squash: 1 },
      { at: 0.75, x: -0.008, y: -0.004, rotate: -0.8, squash: 1.01 },
      { at: 1, x: 0, y: 0, rotate: 0, squash: 1 },
    ],
    parts: {
      lower: [
        { at: 0, rotate: 0 },
        { at: 0.25, rotate: 1.5 },
        { at: 0.75, rotate: -1.5 },
        { at: 1, rotate: 0 },
      ],
      belly: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.25, rotate: 1.5, scale: 1.02 },
        { at: 0.75, rotate: -1.5, scale: 1 },
        { at: 1, rotate: 0, scale: 1 },
      ],
      upper: [
        { at: 0, rotate: 2 },
        { at: 0.4, rotate: -4 },
        { at: 0.62, rotate: -0.9 },
        { at: 0.9, rotate: 4 },
        { at: 1, rotate: 2 },
      ],
      // Carried by the arch, hanging and tracking; at 0.66 it feints.
      head: [
        { at: 0, rotate: 5, x: 0.0023, y: -0.0125 },
        { at: 0.4, rotate: -6, x: -0.0033, y: 0.0253 },
        { at: 0.62, rotate: -3, x: -0.0009, y: 0.0057 },
        { at: 0.66, rotate: 4, x: -0.016, y: 0.004 },
        { at: 0.72, rotate: -2, x: 0.001, y: 0.004 },
        { at: 0.9, rotate: 7, x: 0.0051, y: -0.025 },
        { at: 1, rotate: 5, x: 0.0023, y: -0.0125 },
      ],
      tail: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 1.5 },
        { at: 0.36, rotate: -1.5 },
        { at: 0.42, rotate: 1 },
        { at: 0.7, rotate: 0.5 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  /**
   * Treasury tithe: the arch winds back and the mouth lifts and flares, then
   * the column is thrown forward, the neck stretching, and it latches, holds,
   * and swallows.
   */
  attack: {
    duration: 600,
    poses: [
      { at: 0, x: 0, rotate: 0, squash: 1 },
      { at: 0.26, x: 0.06, rotate: 5, squash: 0.92, y: 0.012 },
      { at: 0.42, x: -0.28, rotate: -8, squash: 1.08, scale: 1.05 },
      { at: 0.58, x: -0.26, rotate: -7, squash: 1.04, scale: 1.05 },
      { at: 0.74, x: -0.07, rotate: -2, squash: 1.01 },
      { at: 1, x: 0, rotate: 0, squash: 1, scale: 1, y: 0 },
    ],
    parts: {
      upper: [
        { at: 0, rotate: 0 },
        { at: 0.26, rotate: 12 },
        { at: 0.42, rotate: -8 },
        { at: 0.58, rotate: -7 },
        { at: 0.76, rotate: -2 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0, x: 0, y: 0, scale: 1 },
        { at: 0.26, rotate: 20, x: 0.0203, y: -0.0735, scale: 1.06 },
        { at: 0.42, rotate: 10, x: -0.055, y: 0.045, scale: 1.08 },
        { at: 0.5, rotate: 4, x: -0.06, y: 0.05, scale: 1.04 },
        { at: 0.58, rotate: 2, x: -0.045, y: 0.0443, scale: 1.02 },
        { at: 0.76, rotate: -2, x: -0.005, y: 0.0126, scale: 1 },
        { at: 1, rotate: 0, x: 0, y: 0, scale: 1 },
      ],
      // It swallows: the belly bulges after the bite, not before.
      belly: [
        { at: 0, scale: 1, squash: 1 },
        { at: 0.5, scale: 1, squash: 1 },
        { at: 0.72, scale: 1.16, squash: 1.06 },
        { at: 1, scale: 1, squash: 1 },
      ],
      lower: [
        { at: 0, rotate: 0 },
        { at: 0.28, rotate: 3 },
        { at: 0.46, rotate: -4 },
        { at: 1, rotate: 0 },
      ],
      tail: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: -3 },
        { at: 0.46, rotate: 5 },
        { at: 0.7, rotate: -2 },
        { at: 1, rotate: 0 },
      ],
    },
  },
  hurt: {
    duration: 360,
    poses: [
      // No bones and no weight: it whips back from the blow.
      { at: 0, x: 0, flash: 0.9 },
      { at: 0.18, x: 0.12, rotate: 8, squash: 0.88, flash: 0.55 },
      { at: 0.48, x: -0.03, rotate: -3, squash: 1.05 },
      { at: 1, x: 0, rotate: 0, squash: 1, flash: 0 },
    ],
    parts: {
      upper: [
        { at: 0, rotate: 0 },
        { at: 0.2, rotate: 12 },
        { at: 0.5, rotate: -5 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0, x: 0, y: 0 },
        { at: 0.2, rotate: 20, x: 0.0203, y: -0.0735 },
        { at: 0.5, rotate: -9, x: -0.0039, y: 0.0316 },
        { at: 1, rotate: 0, x: 0, y: 0 },
      ],
      tail: [
        { at: 0, rotate: 0 },
        { at: 0.24, rotate: 6 },
        { at: 0.6, rotate: -3 },
        { at: 1, rotate: 0 },
      ],
      belly: [
        { at: 0, squash: 1 },
        { at: 0.2, squash: 0.9 },
        { at: 1, squash: 1 },
      ],
    },
  },
  /** Coiling tight behind its own body, the mouth pulled up out of reach. */
  block: {
    duration: 480,
    poses: [
      { at: 0, y: 0, squash: 1 },
      { at: 0.3, y: 0.02, squash: 1.12 },
      { at: 1, y: 0, squash: 1 },
    ],
    parts: {
      upper: [
        { at: 0, rotate: 0 },
        { at: 0.3, rotate: 8 },
        { at: 1, rotate: 0 },
      ],
      head: [
        { at: 0, rotate: 0, x: 0, y: 0 },
        { at: 0.3, rotate: 14, x: 0.0119, y: -0.0495 },
        { at: 1, rotate: 0, x: 0, y: 0 },
      ],
    },
  },
  /** The column goes slack and topples back onto its coil. */
  defeat: {
    duration: 900,
    poses: [
      { at: 0, rotate: 0, flash: 1 },
      { at: 0.25, rotate: -5, y: -0.03, flash: 0.5 },
      {
        at: 1,
        rotate: 48,
        y: 0.12,
        x: 0.04,
        squash: 1.1,
        scale: 0.92,
        flash: 0,
      },
    ],
    parts: {
      upper: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: 14 },
      ],
      head: [
        { at: 0, rotate: 0, x: 0, y: 0 },
        { at: 1, rotate: 30, x: 0.0252, y: -0.0853 },
      ],
      belly: [
        { at: 0, scale: 1, squash: 1 },
        { at: 1, scale: 0.9, squash: 0.86 },
      ],
      tail: [
        { at: 0, rotate: 0 },
        { at: 1, rotate: -6 },
      ],
    },
  },
};

/** Keyed by sprite set, which is the enemy id: the Coin Leech is `thief`. */
export const DEBT_RIGS: Record<string, Rig> = { miser, sniper, thief: leech };
