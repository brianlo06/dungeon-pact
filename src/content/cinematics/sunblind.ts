import type { ActorCue, Cinematic, VfxCue } from "../../shared/cinematic";

/**
 * SUNBLIND — the Ranger · Gloomstalker's Ultimate.
 *
 * The idea, in one sentence: the Gloomstalker puts the low sun at its back
 * and looses a volley out of the glare, where every enemy is squinting and
 * nothing can be seen, so the only warning the row ever gets is the arrows'
 * own shadows racing across the white roof to its feet a heartbeat before the
 * arrows that cast them.
 *
 * Only the Gloomstalker could have it: "They should not get to see it
 * coming." It traded the Ranger's patience and visibility for speed and
 * concealment, and a kid does not hide in the dark, where everyone looks for
 * a thief. It hides where nobody can bear to look. The enemy is looking at
 * the light, which is where the kid is; and what the row sees last is not the
 * kid and not the arrows, but their shadows.
 *
 * The space is the white roofs of a hill town in the afternoon glare: the
 * brightest film there is, where the only dark things are shadows cast by a
 * hard sun. Plaster, bleached sky, cobalt shade, and one colour, sun lemon.
 *
 * Rhythm: identity (the kid rises into the sun: the squint opens in the
 * shade of its own hood, a grin) → stakes and target (the roofscape: the row
 * on the terrace squinting into the sun, and in the sun a kid drawing a bow;
 * title) → escalation (from below, four arrows loosed into the sky in one
 * breath; the sun flares across the lens) → the quiet (at the row's feet,
 * the glare stopped down: thin shadows sliding over the plaster towards them)
 * → impact (the arrows standing in the ends of their shadows, all along the
 * row) → release (the real board: every enemy in a hard pool of sun with its
 * shadow thrown long, the struck row stuck round with arrows).
 *
 * It shares nothing with the Hundredth Mark (fog, birch wood, sight lines,
 * quarry signs, one arrow's silent flight) or False Footing (peat mud at
 * dusk, tracks, a snare, midges), and none of the dark quiets other films
 * own: it never goes dark and never shows a figure against a night sky.
 *
 * The storyboard, with every shot's purpose, framing and the engine limits it
 * works around, is `docs/ultimates/sunblind.md`.
 */

const LEMON = "#ffe45c";
const GLARE = "#fff6d8";
/** The white roof's light, bounced up under everything. */
const BOUNCE = "#f3e6c4";
const BARS = 0.1;
/** The clip's four looses, in milliseconds into the low angle (`ult:sb-volley`, 560ms). */
const LOOSE_MS = [0.16, 0.4, 0.64, 0.88].map((k) => Math.round(k * 560)).join(",");

/* ── The wide ──────────────────────────────────────────────────────────── */

const KID: ActorCue = { role: "caster", at: [362, 432], size: 210, clip: "ult:sb-rise", then: "ult:sb-rise", look: "silhouette", z: 1 };
const wideActors = (row: [number, number], size: number, spread: [number, number]): ActorCue[] => [
  KID,
  { role: "targets", at: row, size, face: -1, look: "lit", spread, z: 2, react: [{ at: 0.5, clip: "anticipate", then: "idle" }] },
];
const wideVfx = (): VfxCue[] => [
  { kind: "sb-cast", at: 0, until: 1, layer: "back", params: { len: 2.1, flat: 0.22, o: 0.72 } },
  // The sun behind the kid, and its glare eating the kid's edges in front.
  { kind: "sb-sun", at: 0, until: 1, x: 340, y: 318, layer: "back", seed: 3, params: { r: 84, core: 1, glow: 1 } },
  { kind: "sb-sun", at: 0, until: 1, x: 340, y: 318, layer: "front", seed: 4, params: { r: 84, core: 0, glow: 0.3, spokes: 10 } },
  { kind: "sb-heat", at: 0, until: 1, layer: "screen", seed: 23, params: { count: 8 } },
];

/* ── The quiet ─────────────────────────────────────────────────────────── */

const quietActors = (row: [number, number], size: number, spread: [number, number]): ActorCue[] => [
  { role: "targets", at: row, size, face: -1, look: "lit", spread, z: 2 },
];
const quietVfx = (from: number): VfxCue[] => [
  { kind: "sb-cast", at: 0, until: 1, layer: "back", params: { len: 2.1, flat: 0.22, o: 0.72 } },
  { kind: "sb-shadows", at: 0, until: 1, layer: "back", seed: 31, params: { from, gap: 0.14 } },
  { kind: "sb-flare", at: 0, until: 0.3, layer: "screen", seed: 41, params: { mode: "out" } },
];

/* ── The impact ────────────────────────────────────────────────────────── */

const struck = (row: [number, number], size: number, spread: [number, number], shove: [number, number], tilt: number): ActorCue => ({
  role: "targets",
  at: row,
  size,
  face: -1,
  look: "lit",
  spread,
  z: 2,
  react: [{ at: 0.08, clip: "hurt" }],
  shove: { at: 0.08, by: shove },
  tilt: 0,
  toTilt: tilt,
});
/** Far off in the sun, the kid is there if you look: the volley's arrival is its `contact`. */
const FAR_KID: ActorCue = { role: "caster", at: [470, 432], size: 120, clip: "ult:sb-after", then: "ult:sb-after", look: "silhouette", z: 1 };
const volleyVfx = (size: number): VfxCue[] => [
  { kind: "sb-cast", at: 0, until: 1, layer: "back", params: { len: 2, flat: 0.22, o: 0.72 } },
  { kind: "sb-sun", at: 0, until: 1, x: 466, y: 368, layer: "back", seed: 5, params: { r: 52, core: 1 } },
  { kind: "sb-sun", at: 0, until: 1, x: 466, y: 368, layer: "front", seed: 6, params: { r: 52, core: 0, glow: 0.3, spokes: 10 } },
  { kind: "sb-volley", at: 0, until: 1, layer: "front", seed: 17, params: { land: 0.02, step: 0.035, angle: 56, size } },
];

export const sunblind: Cinematic = {
  id: "sunblind",
  heroId: "ranger",
  motif: "sb-motif",
  shots: [
    /* 0 · CALL — the light turns hard; every enemy's shadow swings out behind it. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the real battlefield bleaches under a hard low light, the Ranger drops low and pulls its hood forward, a glare blooms behind it, and a pool of sun lands under every enemy as its shadow swings out long behind it.",
      space: "battlefield",
      ms: 420,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [GLARE, 0], letterbox: 0 },
      toLighting: { tint: [GLARE, 0.34], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:sb-crouch", then: "ult:sb-crouch" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: LEMON },
        { kind: "sb-sun", at: 0.05, until: 1, anchor: "caster", seed: 9, params: { r: 34, core: 0.8, glow: 0.8 } },
        { kind: "sb-board", at: 0.1, until: 1, anchor: "caster", params: { mode: "field" } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.1, sfx: "sb-glare" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4700 }],
      markers: [{ at: 0.3, label: "down" }],
    },

    /* 1 · ECLIPSE — face close-up: the kid rises in front of the sun. */
    {
      id: "eclipse",
      kind: "face-close-up",
      purpose:
        "Identity. Tight on the kid's face under the hood, squinting hard in the glare with the sun blazing just above it; the head rises across the sun, the glare goes out behind the hood, and in its own shade the eyes open wide and one corner of the mouth goes up.",
      space: "cinematic",
      ms: 620,
      fastMs: 400,
      transition: { kind: "black", ms: 50 },
      camera: {
        from: { x: 760, y: 500, zoom: 2.35 },
        to: { x: 720, y: 470, zoom: 2.5 },
        ease: "out",
      },
      background: "sb-sky",
      lighting: { exposure: 1, under: [BOUNCE, 0.4], rim: [GLARE, 0.5, -1], vignette: 0.25, letterbox: BARS },
      toLighting: { exposure: 0.72, under: [BOUNCE, 0.45], rim: [GLARE, 1, -1], vignette: 0.45, letterbox: BARS },
      actors: [{ role: "caster", at: [880, 1250], to: [760, 1150], ease: "inOut", size: 1000, clip: "ult:sb-eclipse", then: "ult:sb-eclipse", look: "lit", root: false }],
      vfx: [{ kind: "sb-sun", at: 0, until: 1, x: 690, y: 455, layer: "back", seed: 11, params: { r: 62, core: 1 } }],
      sound: [{ at: 0.02, sfx: "sb-eclipse" }],
      text: [
        { kind: "voice", at: 0.2, until: 1, text: "$voice.activation" },
        { kind: "name", at: 0.34, until: 1, text: "$name", x: 0.06, y: 0.2, mode: "fast" },
      ],
      markers: [{ at: 0.55, label: "eclipse" }],
    },

    /* 2 · GLARE — wide: the row squints into the sun, and the kid is in it. */
    {
      id: "glare",
      kind: "target",
      purpose:
        "Stakes and target. Wide over the white roofs: the real row stands on the terrace lit hard from the left, its shadows laid long behind it, squinting into the light — and in the sun over the tall roof at the left, a notch in the glare, a kid stands up and draws a bow. Title.",
      space: "cinematic",
      ms: 1000,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 560, zoom: 1.08 },
        to: { x: 830, y: 552, zoom: 1.12 },
        ease: "inOut",
      },
      background: "sb-roofs",
      lighting: { exposure: 1, under: [BOUNCE, 0.2], back: [GLARE, 0.2], vignette: 0.2, letterbox: BARS },
      toLighting: { exposure: 1, under: [BOUNCE, 0.2], back: [GLARE, 0.2], vignette: 0.22, letterbox: BARS },
      actors: wideActors([950, 822], 270, [310, 16]),
      vfx: wideVfx(),
      sound: [
        { at: 0.04, sfx: "sb-motif" },
        { at: 0.45, sfx: "sb-draw" },
      ],
      text: [
        { kind: "name", at: 0.24, until: 1, text: "$name", x: 0.44, y: 0.2 },
        { kind: "epithet", at: 0.32, until: 1, text: "$epithet", x: 0.44, y: 0.29 },
      ],
      markers: [
        { at: 0.24, label: "title" },
        { at: 0.62, label: "drawn" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 810, y: 545, zoom: 1.02 },
            to: { x: 835, y: 538, zoom: 1.06 },
            ease: "inOut",
          },
          actors: wideActors([1000, 830], 250, [280, 16]),
          vfx: wideVfx(),
        },
        boss: {
          camera: {
            from: { x: 820, y: 520, zoom: 0.96 },
            to: { x: 845, y: 514, zoom: 1 },
            ease: "inOut",
          },
          actors: wideActors([1150, 842], 240, [300, 16]),
          vfx: wideVfx(),
        },
      },
    },

    /* 3 · LOOSE — from below: four arrows into the sky in one breath. */
    {
      id: "loose",
      kind: "low-angle",
      purpose:
        "Escalation. From below the kid on its roof edge, Dutch: the bow tipped up at the white sky, four arrows drawn and loosed in one breath, each climbing out of the bow and gone; then the sun flares across the lens.",
      space: "cinematic",
      ms: 560,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: {
        from: { x: 780, y: 430, zoom: 1.45, rotate: 9 },
        to: { x: 790, y: 410, zoom: 1.5, rotate: 5 },
        ease: "out",
      },
      background: "sb-sky",
      lighting: { exposure: 0.95, under: [BOUNCE, 0.35], rim: [GLARE, 0.9, -1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 1, under: [BOUNCE, 0.35], rim: [GLARE, 1, -1], vignette: 0.3, letterbox: BARS },
      actors: [{ role: "caster", at: [720, 816], size: 760, clip: "ult:sb-volley", then: "ult:sb-after", look: "lit" }],
      vfx: [
        { kind: "sb-sun", at: 0, until: 1, x: 520, y: 330, layer: "back", seed: 13, params: { r: 80, core: 1 } },
        { kind: "sb-loosed", at: 0, until: 1, layer: "front", params: { at: LOOSE_MS, angle: -48, len: 200, speed: 3 } },
        { kind: "sb-flare", at: 0.78, until: 1, layer: "screen", seed: 41, params: { mode: "in" } },
      ],
      sound: [
        { at: 0, sfx: "sb-loose" },
        { at: 0.76, sfx: "sb-flare" },
      ],
      text: [{ kind: "name", at: 0.2, until: 0.8, text: "$name", x: 0.52, y: 0.2, mode: "fast" }],
      markers: [{ at: 0.16, label: "loose" }],
    },

    /* 4 · SHADOWS — the quiet: at the row's feet, thin shadows sliding in. */
    {
      id: "shadows",
      kind: "profile",
      purpose:
        "The quiet. The flare leaves the lens; at roof level on the row's feet, locked off, the glare stopping down: over the white plaster a comb of thin, sharp shadows slides in towards every enemy's feet and slows as it comes, while the row stands still, looking up into the light.",
      space: "cinematic",
      ms: 600,
      fastMs: 400,
      transition: { kind: "cut" },
      camera: { from: { x: 960, y: 790, zoom: 1.6 } },
      background: "sb-roofs",
      lighting: { exposure: 0.85, under: [BOUNCE, 0.15], vignette: 0.45, letterbox: 0.14 },
      toLighting: { exposure: 0.58, under: [BOUNCE, 0.1], vignette: 0.7, letterbox: 0.15 },
      actors: quietActors([1080, 852], 400, [340, 12]),
      vfx: quietVfx(700),
      duck: [{ at: 0, level: 0.03, ms: 600 }],
      sound: [{ at: 0.02, sfx: "sb-hush" }],
      markers: [{ at: 0.9, label: "at their feet" }],
      framing: {
        large: {
          camera: { from: { x: 960, y: 760, zoom: 1.4 } },
          actors: quietActors([1110, 856], 350, [340, 12]),
          vfx: quietVfx(760),
        },
        boss: {
          camera: { from: { x: 960, y: 700, zoom: 1.2 } },
          actors: quietActors([1160, 862], 290, [360, 12]),
          vfx: quietVfx(820),
        },
      },
    },

    /* 5 · VOLLEY — the impact: arrows standing in the ends of their shadows. */
    {
      id: "volley",
      kind: "impact",
      purpose:
        "Impact. On a lemon-and-ink frame, then held in colour: the arrows standing in every enemy of the row and in the plaster round their feet, each with its shadow laid from its base and a streak back up towards the sun, plaster chips and chalk dust thrown up; the row struck and shoved, and far off in the glare the kid. The damage.",
      space: "cinematic",
      ms: 760,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1000, y: 610, zoom: 1.36 },
        to: { x: 990, y: 600, zoom: 1.28 },
        ease: "out",
      },
      background: "sb-roofs",
      lighting: { exposure: 1, tint: [GLARE, 0.12], under: [BOUNCE, 0.2], vignette: 0.2, letterbox: BARS },
      toLighting: { exposure: 0.92, tint: [GLARE, 0], under: [BOUNCE, 0.2], vignette: 0.3, letterbox: BARS },
      actors: [FAR_KID, struck([880, 842], 310, [300, 12], [70, -10], 9)],
      vfx: volleyVfx(0.9),
      screen: [{ kind: "two-tone", at: 0, ms: 40 }],
      stop: [{ at: 0.08, ms: 150 }],
      shake: [
        { at: 0.08, amount: 0.032 },
        { at: 0.3, amount: 0.012 },
      ],
      sound: [
        { at: 0, sfx: "sb-fall" },
        { at: 0.07, sfx: "sb-impact" },
      ],
      reveal: [{ at: 0.08, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.08, until: 0.95, text: "$damage", x: 0.5, y: 0.2, rotate: -4 },
        { kind: "voice", at: 0.4, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: 0.08, label: "lands" }],
      framing: {
        large: {
          camera: {
            from: { x: 990, y: 590, zoom: 1.2 },
            to: { x: 980, y: 582, zoom: 1.13 },
            ease: "out",
          },
          actors: [FAR_KID, struck([940, 846], 290, [270, 12], [44, -6], 5)],
          vfx: volleyVfx(0.8),
        },
        boss: {
          camera: {
            from: { x: 980, y: 560, zoom: 1.06 },
            to: { x: 970, y: 554, zoom: 1 },
            ease: "out",
          },
          actors: [FAR_KID, struck([1010, 852], 240, [290, 12], [22, -4], 2.5)],
          vfx: volleyVfx(0.66),
        },
      },
    },

    /* 6 · SUNSTRUCK — the real board: every enemy in the sun, the row struck. */
    {
      id: "sunstruck",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield, the bleach lifts but the light stays hard on the enemy side: every real enemy stands in a pool of sun with its shadow thrown long behind it, open, and the struck row is stuck round with arrows, each with its shadow. The Ranger stands and pushes its hood back.",
      space: "battlefield",
      ms: 740,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [GLARE, 0.28], letterbox: BARS },
      toLighting: { tint: [GLARE, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:sb-lower" }],
      vfx: [
        { kind: "sb-board", at: 0, until: 1, anchor: "caster", params: { mode: "field", hold: true } },
        { kind: "sb-board", at: 0.04, until: 1, anchor: "targets", stagger: 90, params: { mode: "struck" } },
      ],
      sound: [
        { at: 0.05, sfx: "sb-after" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.1, label: "open" }],
    },
  ],
};
