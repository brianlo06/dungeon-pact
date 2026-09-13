import type { Cinematic } from "../../shared/cinematic";

/**
 * THE OPEN MIND — the Beguiler · Mindflayer's Ultimate.
 *
 * The idea: every mind is a labyrinth, and doubt, the Beguiler's old way in,
 * walks it the long way round; the Mindflayer's one green eye narrows to a
 * pin and puts a single thought straight through the walls, into the plan
 * coiled at the centre, and on through every mind the party left open.
 *
 * Rhythm: identity (the eye focuses) → stakes and target (every enemy's mind
 * over its head, doubt winding the long way in the target's; title) →
 * escalation (inside the target's mind: straight through every wall) →
 * anticipation, quiet (the plan winding tighter in silence, the needle's
 * point a hair away) → impact (through: the hole, the coil broken, the same
 * thought through every other mind) → release (every real enemy's mind,
 * holed).
 *
 * It shares nothing with the Hall of Mirrors: no glass, no mirror, no hall, no
 * reflection, no smile, no strings pulled and nobody turned on anybody. Where
 * that film's Beguiler tilts its head too far, this one holds it level; where
 * that film breaks the screen, this one makes one small clean hole.
 *
 * The storyboard is `docs/ultimates/open-mind.md`.
 */

const GREEN = "#c7f06a";
const PALE = "#f2ffd2";
const AMBER = "#ffb347";
const WALL = "#b7a9cf";
const NIGHT = "#07060b";
const BARS = 0.11;

/** The one labyrinth: the target's mind in the wide, the room it bores through, the hole. */
const MIND = 11;

export const openMind: Cinematic = {
  id: "open-mind",
  heroId: "beguiler",
  motif: "mind-motif",
  shots: [
    /* 0 · CALL — the control drops, the head comes level, and the minds appear. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the Beguiler lets its control drop and its head comes level, the board sinks to night, and over every real enemy its mind appears, a small labyrinth with a plan coiled in it.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [NIGHT, 0], letterbox: 0 },
      toLighting: { tint: [NIGHT, 0.66], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:mind-drop" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: GREEN },
        { kind: "mind-disc", at: 0.25, until: 1, anchor: "targets", stagger: 60, seed: MIND, params: { small: true } },
      ],
      sound: [{ at: 0, sfx: "mind-call" }],
      duck: [{ at: 0, level: 0.3, ms: 4600 }],
      markers: [{ at: 0.25, label: "minds" }],
    },

    /* 1 · STARE — extreme close-up, dead level: the eye narrows to a pin. */
    {
      id: "stare",
      kind: "extreme-close-up",
      purpose:
        "Identity. The mask, dead level for once, and behind its eye hole the one green eye: it widens, and then narrows to a pin, and the crack in the porcelain lights along its length.",
      space: "cinematic",
      ms: 620,
      fastMs: 400,
      transition: { kind: "black", ms: 60 },
      camera: {
        from: { x: 820, y: 396, zoom: 6.4 },
        to: { x: 823, y: 394, zoom: 7.2 },
        ease: "out",
      },
      background: "void",
      lighting: { exposure: 0.05, vignette: 0.9, letterbox: BARS },
      toLighting: { exposure: 0.1, vignette: 0.86, letterbox: BARS },
      actors: [
        { role: "caster", at: [800, 900], size: 760, clip: "ult:mind-stare", then: "ult:mind-stare", look: "lit" },
      ],
      vfx: [
        { kind: "mind-crack", at: 0.18, until: 1, follow: "caster", x: 31, y: -517, scale: 1.08, color: GREEN, layer: "front" },
        { kind: "mind-pin", at: 0.2, until: 1, follow: "caster", x: 15, y: -500, scale: 0.15, color: GREEN, layer: "front" },
      ],
      sound: [{ at: 0.3, sfx: "mind-pin" }],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.66, label: "the pin" }],
    },

    /* 2 · MINDS — the real line on the floor of the thinking, each mind over its head. */
    {
      id: "minds",
      kind: "target",
      purpose:
        "Stakes and target. The real enemy line stands on the floor of the thinking with its minds turning over its heads. In the target's, doubt winds the long way in; a green gaze comes in from the left and finds it, and the picture closes on it.",
      space: "cinematic",
      ms: 900,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1090, y: 430, zoom: 1.2 },
        to: { x: 1060, y: 500, zoom: 1.3 },
        ease: "inOut",
      },
      background: "mind-floor",
      lighting: { exposure: 0.55, back: [WALL, 0.12], under: [GREEN, 0.08], vignette: 0.55, letterbox: BARS },
      toLighting: { exposure: 0.62, back: [WALL, 0.16], under: [GREEN, 0.12], vignette: 0.5, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [900, 800],
          spread: [235, -14],
          size: 300,
          face: -1,
          look: "lit",
          z: 2,
          react: [{ at: 0.22, clip: "anticipate", then: "idle" }],
        },
      ],
      vfx: [
        { kind: "mind-disc", at: 0, until: 1, each: "targets", seed: MIND, layer: "front", params: { doubt: true, spin: 18 } },
        { kind: "mind-sight", at: 0.42, until: 1, color: GREEN, layer: "front" },
        { kind: "mind-iris", at: 0.8, until: 1, layer: "screen", params: { mode: "close" } },
      ],
      sound: [
        { at: 0.04, sfx: "mind-motif" },
        { at: 0.2, sfx: "mind-doubt" },
      ],
      text: [
        { kind: "name", at: 0.18, until: 0.8, text: "$name", x: 0.06, y: 0.22 },
        { kind: "epithet", at: 0.28, until: 0.8, text: "$epithet", x: 0.06, y: 0.32 },
      ],
      markers: [
        { at: 0.42, label: "the gaze" },
        { at: 0.8, label: "into it" },
      ],
      framing: {
        boss: {
          camera: {
            from: { x: 1010, y: 420, zoom: 0.96 },
            to: { x: 1000, y: 470, zoom: 1.03 },
            ease: "inOut",
          },
          actors: [
            {
              role: "targets",
              at: [1000, 840],
              spread: [300, -14],
              size: 290,
              face: -1,
              look: "lit",
              z: 2,
              react: [{ at: 0.22, clip: "anticipate", then: "idle" }],
            },
          ],
        },
      },
    },

    /* 3 · BORE — top-down in the target's labyrinth: straight through every wall. */
    {
      id: "bore",
      kind: "projectile-follow",
      purpose:
        "Escalation. Inside the target's mind, the whole labyrinth at once: doubt's dotted path is still winding round the outer rings, and the Mindflayer's thought goes the other way, dead straight, punching through every wall it meets, faster and faster, as the camera follows it in towards the plan at the centre.",
      space: "cinematic",
      ms: 580,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 450, zoom: 0.96, rotate: -7 },
        to: { x: 700, y: 452, zoom: 2, rotate: -4 },
        ease: "in",
      },
      background: "void",
      lighting: { exposure: 0.8, vignette: 0.6, under: [GREEN, 0.06], letterbox: BARS },
      toLighting: { exposure: 0.7, vignette: 0.7, under: [GREEN, 0.1], letterbox: BARS },
      vfx: [
        {
          kind: "mind-maze",
          at: 0,
          until: 1,
          x: 800,
          y: 450,
          seed: MIND,
          layer: "back",
          params: { mode: "bore", radius: 380, from: -112, to: -19 },
        },
        { kind: "mind-iris", at: 0, until: 0.3, layer: "screen", params: { mode: "open" } },
      ],
      sound: [
        { at: 0, sfx: "mind-bore", mode: "full" },
        { at: 0, sfx: "mind-bore-fast", mode: "fast" },
      ],
      text: [
        { kind: "name", at: 0.08, until: 1, text: "$name", x: 0.06, y: 0.22, mode: "fast" },
      ],
      markers: [{ at: 0.5, label: "through the walls" }],
    },

    /* 4 · COIL — the quiet: the plan winding tighter, the needle's point a hair away. */
    {
      id: "coil",
      kind: "detail",
      purpose:
        "Anticipation, by subtraction. The music is gone. At the heart of the labyrinth the enemy's plan, an amber coil, winds itself tighter a turn at a time; the needle's point hangs a hair from it, trembling.",
      space: "cinematic",
      ms: 540,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: { from: { x: 776, y: 452, zoom: 5, rotate: -7 } },
      background: "void",
      lighting: { exposure: 0.2, back: ["#2a1a0c", 0.3], vignette: 0.92, letterbox: 0.15 },
      toLighting: { exposure: 0.12, back: ["#2a1a0c", 0.4], vignette: 0.95, letterbox: 0.15 },
      vfx: [
        {
          kind: "mind-maze",
          at: 0,
          until: 1,
          x: 800,
          y: 450,
          seed: MIND,
          layer: "back",
          params: { mode: "heart", radius: 300, from: -19, to: -17.6 },
        },
      ],
      duck: [{ at: 0, level: 0.04, ms: 540 }],
      sound: [{ at: 0.02, sfx: "mind-hush" }],
      markers: [{ at: 0.5, label: "held" }],
    },

    /* 5 · THROUGH — the impact: the thought through the target's mind, and on. */
    {
      id: "through",
      kind: "impact",
      purpose:
        "Impact. On a green two-tone frame the thought goes from the Mindflayer's eye straight through the target's mind: one clean hole, its walls flung outward, its plan snapped. The target is thrown back, and a beat later the same thought holes every other mind in the line.",
      space: "cinematic",
      ms: 780,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1000, y: 580, zoom: 1.36 },
        to: { x: 1020, y: 570, zoom: 1.5 },
        ease: "out",
      },
      background: "mind-floor",
      lighting: { exposure: 0.95, back: [GREEN, 0.35], under: [GREEN, 0.3], rim: [GREEN, 1, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.6, back: [GREEN, 0.15], under: [GREEN, 0.18], rim: [GREEN, 0.7, 1], vignette: 0.5, letterbox: BARS },
      actors: [
        { role: "caster", at: [560, 980], size: 560, clip: "ult:mind-pierce", look: "rim", rim: GREEN, z: 3 },
        {
          role: "targets",
          at: [1000, 840],
          spread: [200, -34],
          size: 300,
          face: -1,
          look: "lit",
          z: 2,
          react: [
            { at: 0.04, clip: "hurt" },
            { at: 0.34, clip: "hurt" },
          ],
          shove: { at: 0.04, by: [70, -6] },
          toTilt: 5,
        },
      ],
      vfx: [
        { kind: "mind-glare", at: 0, until: 0.4, x: 1000, y: 520, color: GREEN, layer: "back" },
        { kind: "mind-spike", at: 0, until: 0.9, color: GREEN, layer: "front" },
        { kind: "mind-hole", at: 0, until: 1, follow: "target", seed: MIND, scale: 0.72, layer: "front" },
        // Every other mind hangs whole until the thought reaches it. Starting
        // before the shot keeps each copy's own stagger (0.04 a figure) from
        // leaving it off the first frames.
        { kind: "mind-hole", at: -0.1, until: 1, each: "targets", seed: MIND, scale: 0.6, layer: "front", params: { echo: true, holeAt: 0.42, angle: -4 } },
      ],
      screen: [
        { kind: "two-tone", at: 0.02, ms: 70, color: GREEN },
        { kind: "flash", at: 0.14, ms: 60, amount: 0.2, color: PALE },
        { kind: "flash", at: 0.34, ms: 60, amount: 0.2, color: GREEN },
        { kind: "chromatic", at: 0.06, ms: 150, amount: 0.8 },
      ],
      stop: [{ at: 0.04, ms: 150 }],
      shake: [
        { at: 0.04, amount: 0.032 },
        { at: 0.34, amount: 0.014 },
      ],
      sound: [
        { at: 0, sfx: "mind-spike" },
        { at: 0.03, sfx: "mind-impact" },
        { at: 0.33, sfx: "mind-echo" },
      ],
      reveal: [{ at: 0.04, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.03, until: 0.95, text: "$damage", x: 0.3, y: 0.22, rotate: -4 },
        { kind: "voice", at: 0.46, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.04, label: "contact" },
        { at: 0.34, label: "the line" },
      ],
      framing: {
        boss: {
          camera: {
            from: { x: 920, y: 520, zoom: 1.05 },
            to: { x: 940, y: 515, zoom: 1.14 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [470, 1010], size: 520, clip: "ult:mind-pierce", look: "rim", rim: GREEN, z: 3 },
            {
              role: "targets",
              at: [1000, 860],
              spread: [300, -20],
              size: 290,
              face: -1,
              look: "lit",
              z: 2,
              react: [
                { at: 0.04, clip: "hurt" },
                { at: 0.34, clip: "hurt" },
              ],
              shove: { at: 0.04, by: [30, 0] },
              toTilt: 2,
            },
          ],
        },
      },
    },

    /* 6 · HOLES — back on the board: every mind hangs holed. */
    {
      id: "holes",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield the Beguiler takes up its control again as if nothing had happened, and over every real enemy its mind hangs with a hole through it and its plan gone; the target's is ringed green: open.",
      space: "battlefield",
      ms: 700,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [NIGHT, 0.5], letterbox: BARS },
      toLighting: { tint: [NIGHT, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:mind-lift" }],
      vfx: [
        { kind: "mind-disc", at: 0, until: 1, anchor: "targets", stagger: 50, seed: MIND, params: { small: true, holed: true, held: true } },
      ],
      sound: [
        { at: 0.05, sfx: "mind-after" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.1, label: "open" }],
    },
  ],
};
