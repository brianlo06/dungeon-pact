import type { Cinematic } from "../../shared/cinematic";

/**
 * THE HUNDREDTH MARK — the Ranger's Ultimate.
 *
 * The idea, in one sentence: the Ranger sees every shot it could take — a
 * hundred possible lines, each leaving a quarry sign on the enemy it would
 * hit — and then lets ninety-nine of them go and looses the one.
 *
 * "One mark. A hundred possibilities." The marks are the point: every enemy
 * in the real line is marked, because every one of them was a shot the kid
 * could have taken, and those marks stay for the party. One is finished.
 *
 * The space is the wood the Ranger learned in — first light, ground fog, and
 * birch trunks scored with a kid's tally marks, lit as it counts. Pale where
 * the other films are dark: figures are ink against fog.
 *
 * Rhythm, varied: identity (the draw, to the cheek) → stakes (a hundred lines
 * across the whole line, a sign on each, title) → decision (the face: seeing
 * all of it, choosing one; the lines go out) → the loose, hidden in a white
 * frame → the quiet (the arrow in flight, in silence, in slowed time, the fog
 * parting) → impact (the sign cashed in) → release (the marks left on the
 * real board). The quietest shot is the arrow's flight, and the loudest is
 * where it ends.
 *
 * It shares nothing with the Vanguard's, Breaker's or Arcanist's films: no
 * charge, no ram, no sky; its close-up acts with a face; its signature effect
 * is lines and signs, not light, force or weather; its space is bright.
 */

const LIME = "#c7f08a";
const HOT = "#f2ffd9";
const FOG = "#dfe6d4";
const BARS = 0.1;

export const hundredthMark: Cinematic = {
  id: "hundredth-mark",
  heroId: "ranger",
  motif: "hundredth-motif",
  shots: [
    /* 0 · CALL — the fog comes onto the real board, and the Ranger's eyes find every enemy. */
    {
      id: "call",
      kind: "call",
      purpose:
        "The round stops: fog washes over the real battlefield, the Ranger nocks, and a reticle flickers over every enemy in the line.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [FOG, 0], letterbox: 0 },
      toLighting: { tint: [FOG, 0.32], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:nock" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: LIME },
        { kind: "hundredth-board", at: 0, until: 1, anchor: "targets", color: LIME, params: { mode: "spot" } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.3, sfx: "hundredth-nock" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4600 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · NOCK — extreme close-up: the string comes back to the cheek. */
    {
      id: "nock",
      kind: "extreme-close-up",
      purpose:
        "Identity. The one gesture that is the Ranger: a kid's hand drawing a red-fletched arrow back along the jaw until the string touches the cheek.",
      space: "cinematic",
      ms: 580,
      fastMs: 360,
      transition: { kind: "black", ms: 50 },
      camera: {
        from: { x: 820, y: 740, zoom: 2.2, rotate: -8 },
        to: { x: 900, y: 750, zoom: 2.45, rotate: -5 },
        ease: "out",
      },
      background: "hundredth-wood",
      lighting: { exposure: 0.5, rim: [LIME, 0.5, 1], vignette: 0.65, letterbox: BARS },
      toLighting: { exposure: 0.62, rim: [LIME, 0.75, 1], vignette: 0.55, letterbox: BARS },
      actors: [{ role: "caster", at: [720, 1300], size: 1000, clip: "ult:nock", then: "ult:sight", look: "lit" }],
      vfx: [
        { kind: "hundredth-fog", at: 0, until: 1, layer: "front", seed: 3 },
        { kind: "glint", at: 0.68, until: 0.95, follow: "caster", x: 290, y: -480, scale: 0.8, color: LIME, layer: "front" },
      ],
      sound: [
        { at: 0.02, sfx: "hundredth-nock" },
        { at: 0.18, sfx: "hundredth-draw" },
      ],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.72, label: "anchor" }],
    },

    /* 2 · SIGHT — wide: a hundred lines across the whole line, and a sign on each. */
    {
      id: "sight",
      kind: "wide-hero",
      purpose:
        "Stakes, and the marking. At full draw, a hundred possible shots fan out across the fog; every real enemy in the line is found by some of them and signed, the target last. The tally marks in the trees light as it counts.",
      space: "cinematic",
      ms: 1000,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 520, zoom: 1.2 },
        to: { x: 840, y: 505, zoom: 1.3, rotate: 0.8 },
        ease: "inOut",
      },
      background: "hundredth-wood",
      lighting: { exposure: 0.85, rim: [LIME, 0.6, 1], vignette: 0.4, letterbox: BARS },
      toLighting: { exposure: 0.95, rim: [LIME, 0.9, 1], vignette: 0.35, letterbox: BARS },
      actors: [
        {
          role: "target",
          at: [1010, 720],
          size: 230,
          face: -1,
          look: "silhouette",
          z: 1,
          react: [{ at: 0.1 + 0.78 * 0.8, clip: "anticipate", then: "idle" }],
        },
        { role: "caster", at: [330, 930], size: 560, clip: "ult:sight", then: "ult:sight", look: "rim", rim: LIME, z: 3 },
      ],
      vfx: [
        { kind: "lanterns", at: 0.15, until: 0.95 },
        { kind: "hundredth-tag", at: 0, until: 1, anchor: "targets" },
        { kind: "hundredth-lineup", at: 0.1, until: 0.9, layer: "back", params: { rows: "all" } },
        { kind: "hundredth-lines", at: 0.1, until: 0.9, layer: "front", seed: 100 },
        { kind: "hundredth-fog", at: 0, until: 1, layer: "front", seed: 5 },
        { kind: "hundredth-fog", at: 0.88, until: 1, layer: "screen", seed: 8, params: { wipe: "in" } },
      ],
      sound: [
        { at: 0.04, sfx: "hundredth-motif" },
        { at: 0.33, sfx: "hundredth-tally" },
      ],
      text: [
        { kind: "name", at: 0.3, until: 1, text: "$name", x: 0.06, y: 0.2 },
        { kind: "epithet", at: 0.4, until: 1, text: "$epithet", x: 0.06, y: 0.29 },
      ],
      markers: [
        { at: 0.3, label: "title" },
        { at: 0.1 + 0.8 * 0.78, label: "target marked" },
      ],
      framing: {
        boss: {
          camera: {
            from: { x: 820, y: 500, zoom: 1.12 },
            to: { x: 850, y: 490, zoom: 1.2, rotate: 0.8 },
            ease: "inOut",
          },
          actors: [
            {
              role: "target",
              at: [1060, 760],
              size: 190,
              face: -1,
              look: "silhouette",
              z: 1,
              react: [{ at: 0.1 + 0.78 * 0.8, clip: "anticipate", then: "idle" }],
            },
            { role: "caster", at: [330, 930], size: 560, clip: "ult:sight", then: "ult:sight", look: "rim", rim: LIME, z: 3 },
          ],
        },
      },
    },

    /* 3 · CHOOSE — face close-up: all of it, then one. */
    {
      id: "choose",
      kind: "face-close-up",
      purpose:
        "The decision. Under the hood the kid's eyes go wide on every shot there is — then ninety-nine lines go out one by one, the eyes narrow to the last, and the brow comes down.",
      space: "cinematic",
      ms: 560,
      fastMs: 340,
      transition: { kind: "cut" },
      camera: {
        from: { x: 880, y: 640, zoom: 2.35 },
        to: { x: 870, y: 638, zoom: 2.55 },
        ease: "linear",
      },
      background: "hundredth-wood",
      lighting: { exposure: 0.34, rim: [LIME, 0.9, 1], vignette: 0.8, letterbox: 0.14 },
      toLighting: { exposure: 0.22, rim: [LIME, 1, 1], vignette: 0.9, letterbox: 0.15 },
      actors: [{ role: "caster", at: [700, 1250], size: 1000, clip: "ult:choose", then: "ult:choose", look: "rim", rim: LIME }],
      vfx: [
        { kind: "hundredth-lines", at: 0, until: 1, layer: "front", seed: 101, params: { let: true, spread: 30, ox: 0.064, oy: 0.758, angle: 4 } },
        { kind: "hundredth-fog", at: 0, until: 0.16, layer: "screen", seed: 8, params: { wipe: "out" } },
      ],
      duck: [{ at: 0, level: 0.12, ms: 560 }],
      sound: [{ at: 0.1, sfx: "hundredth-hold" }],
      markers: [{ at: 0.68, label: "one" }],
    },

    /* 4 · FLIGHT — the quiet: the one arrow, slowed, in silence, through the fog. */
    {
      id: "flight",
      kind: "projectile-follow",
      purpose:
        "The quiet. The loose is a white frame and a snap; then silence, and the arrow crossing the fog in slowed time along the one line left, past the ghosts of the other ninety-nine, towards the sign on the target.",
      space: "cinematic",
      ms: 620,
      fastMs: 380,
      transition: { kind: "flash", ms: 60 },
      camera: {
        from: { x: 330, y: 600, zoom: 2.3, rotate: 2 },
        to: { x: 1230, y: 600, zoom: 2.0, rotate: 0 },
        ease: "in",
      },
      background: "hundredth-wood",
      lighting: { exposure: 0.6, vignette: 0.55, letterbox: BARS },
      toLighting: { exposure: 0.7, vignette: 0.45, letterbox: BARS },
      actors: [
        {
          role: "target",
          at: [1400, 800],
          size: 380,
          face: -1,
          look: "lit",
          z: 1,
          react: [{ at: 0.86, clip: "anticipate" }],
        },
      ],
      vfx: [
        { kind: "hundredth-sign", at: 0, until: 1, follow: "target", color: LIME, layer: "front", params: { mode: "hold" } },
        { kind: "hundredth-lines", at: 0, until: 1, layer: "back", seed: 103, params: { ghost: true, fx: -200, fy: 640, spread: 14 } },
        { kind: "hundredth-fog", at: 0, until: 1, layer: "front", seed: 9, params: { part: true } },
        { kind: "hundredth-arrow", at: 0, until: 1, layer: "front", color: LIME, params: { x1: 150, y1: 620, x2: 1340, y2: 620, len: 170, aim: true, short: 0.1 } },
      ],
      duck: [{ at: 0, level: 0.02, ms: 620 }],
      sound: [
        { at: 0, sfx: "hundredth-loose" },
        { at: 0.3, sfx: "hundredth-whistle" },
      ],
      markers: [{ at: 0, label: "loose" }],
      framing: {
        large: {
          camera: {
            from: { x: 330, y: 580, zoom: 2.1, rotate: 2 },
            to: { x: 1180, y: 560, zoom: 1.7, rotate: 0 },
            ease: "in",
          },
        },
        boss: {
          camera: {
            from: { x: 330, y: 520, zoom: 1.9, rotate: 2 },
            to: { x: 1120, y: 470, zoom: 1.25, rotate: 0 },
            ease: "in",
          },
          actors: [
            { role: "target", at: [1400, 860], size: 380, face: -1, look: "lit", z: 1, react: [{ at: 0.86, clip: "anticipate" }] },
          ],
        },
      },
    },

    /* 5 · IMPACT — the sign cashed in. */
    {
      id: "impact",
      kind: "impact",
      purpose:
        "Impact. One inverted frame with the sign closing on the target at the size of the screen; the arrow buries itself in the mark, the mark breaks, and the hit comes back through armour — the Ranger still in its follow-through at the far end of the line.",
      space: "cinematic",
      ms: 740,
      fastMs: 540,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 560, zoom: 1.42, rotate: -3 },
        to: { x: 780, y: 555, zoom: 1.3, rotate: -1.5 },
        ease: "out",
      },
      background: "hundredth-wood",
      lighting: { exposure: 1, tint: [HOT, 0.25], rim: [LIME, 1, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.75, tint: [HOT, 0], rim: [LIME, 0.6, 1], vignette: 0.42, letterbox: BARS },
      actors: [
        { role: "caster", at: [330, 900], size: 500, clip: "ult:after", then: "ult:after", look: "rim", rim: LIME, z: 2 },
        {
          role: "target",
          at: [1050, 810],
          size: 470,
          face: -1,
          z: 1,
          react: [{ at: 0.04, clip: "hurt" }],
          shove: { at: 0.04, by: [34, -4] },
          toTilt: 5,
        },
      ],
      vfx: [
        { kind: "hundredth-lines", at: 0, until: 0.85, layer: "front", seed: 102, params: { one: true } },
        { kind: "hundredth-arrow", at: 0.03, until: 1, follow: "target", layer: "front", params: { stuck: true, len: 200 } },
        { kind: "hundredth-sign", at: 0, until: 1, follow: "target", layer: "front", params: { mode: "shatter", size: 0.5 } },
        { kind: "sparks", at: 0.04, until: 0.6, follow: "target", x: -40, y: -260, scale: 1.1, color: LIME, seed: 12, layer: "front" },
        { kind: "hundredth-reticle", at: 0, until: 0.4, layer: "screen", params: { px: 0.68, py: 0.44, pierce: true } },
      ],
      screen: [
        { kind: "invert", at: 0.03, ms: 60 },
        { kind: "flash", at: 0.1, ms: 90, amount: 0.6, color: HOT },
        { kind: "chromatic", at: 0.04, ms: 140, amount: 0.8 },
      ],
      stop: [{ at: 0.04, ms: 150 }],
      shake: [
        { at: 0.04, amount: 0.03 },
        { at: 0.3, amount: 0.01 },
      ],
      sound: [
        { at: 0.03, sfx: "hundredth-impact" },
        { at: 0.05, sfx: "hundredth-break" },
      ],
      reveal: [{ at: 0.04, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.06, until: 0.9, text: "$damage", x: 0.45, y: 0.25, rotate: -4 },
        { kind: "voice", at: 0.3, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: 0.04, label: "hit" }],
      framing: {
        large: {
          camera: {
            from: { x: 800, y: 530, zoom: 1.3, rotate: -3 },
            to: { x: 790, y: 525, zoom: 1.2, rotate: -1.5 },
            ease: "out",
          },
        },
        boss: {
          camera: {
            from: { x: 820, y: 470, zoom: 1.08, rotate: -2.5 },
            to: { x: 810, y: 465, zoom: 1.0, rotate: -1 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [300, 920], size: 440, clip: "ult:after", then: "ult:after", look: "rim", rim: LIME, z: 2 },
            {
              role: "target",
              at: [1110, 870],
              size: 400,
              face: -1,
              z: 1,
              react: [{ at: 0.04, clip: "hurt" }],
              shove: { at: 0.04, by: [14, 0] },
              toTilt: 2,
            },
          ],
        },
      },
    },

    /* 6 · LEFT — the real board: a sign on every enemy but the one. */
    {
      id: "left",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield, the fog lifts off the fight and the marks stay: a quarry sign on every enemy still standing, left for the party, and the broken one falling off the target.",
      space: "battlefield",
      ms: 760,
      fastMs: 480,
      transition: { kind: "flash", ms: 70 },
      background: "battlefield",
      lighting: { tint: [FOG, 0.28], letterbox: BARS },
      toLighting: { tint: [FOG, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:lower" }],
      vfx: [{ kind: "hundredth-board", at: 0, until: 1, anchor: "targets", color: LIME, params: { mode: "left" } }],
      sound: [
        { at: 0.06, sfx: "hundredth-left" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.06, label: "marks left" }],
    },
  ],
};
