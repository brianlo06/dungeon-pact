import type { ActorCue, Cinematic, VfxCue } from "../../shared/cinematic";

/**
 * MOURNING WATER — the Warden · Hollow Druid's Ultimate.
 *
 * The idea, in one sentence: the Hollow Druid weeps without opening its eyes
 * — one tear, heavy with everything the green has lost, falls into the open
 * hand that used to heal — and when that hand closes, the black water the
 * tear became closes over the one who took it.
 *
 * Only the Hollow Druid could have it. The Warden is drawn with its eyes shut
 * and its healing hand open; the path gave up the healing dew for Drown. So
 * the film is that hand doing the one thing it never does, closing, and the
 * mere doing it too, at the size of the enemy: the fingers curl in the quiet,
 * and the water curls over the target in the same shape on the impact.
 *
 * The space is the mere in the hollow: a drowned dell at night full of black,
 * still water, weeping willows on the far bank, duckweed and floating leaves
 * the only green left. Mere black, willow, the tear's cold white, and a dull
 * duckweed green; the lantern's amber is the one warm light, and it goes out.
 *
 * Rhythm: identity (the face breaks, eyes shut; a tear) → escalation (the tear
 * lands in the palm, which fills with far more water than a tear) → stakes and
 * target (the mere, wide: rings run from the spill to the real target, which
 * braces as the water climbs it; title) → the quiet (the raised hand closing
 * on the far-off enemy; the lantern out; nothing else moves) → impact (the
 * mere closes over it in the shape of the hand) → release (the real board:
 * the drowned standing in black water that hangs off it; the rest soaked).
 *
 * It shares nothing with Green Reckoning: no roots, no heartbeat, no ground
 * cut away, no sap and rot, and the eyes never open — the face acts with them
 * shut. Nor with Debt of Thunder's rain and storm or Breakwater's wave: this
 * water is still, and it closes rather than falls.
 *
 * The storyboard, with every shot's purpose, its framing and the engine limits
 * it works around, is `docs/ultimates/mourning-water.md`.
 */

const WEED = "#a9bf62";
const PALE = "#e6f3ec";
const COLD = "#9fc4b8";
const NIGHT = "#030807";
const BARS = 0.11;

/** The water in front of every figure standing in the mere. */
const shallows = (params: VfxCue["params"] = {}): VfxCue => ({
  kind: "mourn-shallows",
  at: 0,
  until: 1,
  layer: "front",
  params,
});

/** The drowning, as the target is placed in the impact, and how it reacts. */
const drowned = (at: [number, number], size: number, shove: number, tilt: number): ActorCue => ({
  role: "target",
  at,
  size,
  face: -1,
  look: "lit",
  z: 2,
  react: [{ at: 0.09, clip: "hurt" }],
  shove: { at: 0.08, by: [10, shove] },
  toTilt: tilt,
});

/** The wide on the mere: the Warden at the left, the target standing in the water. */
const mereActors = (target: [number, number], size: number): ActorCue[] => [
  { role: "caster", at: [350, 770], size: 300, clip: "ult:mourn-pour", then: "ult:mourn-pour", look: "rim", rim: COLD, z: 3 },
  {
    role: "target",
    at: target,
    size,
    face: -1,
    look: "lit",
    z: 2,
    react: [{ at: 0.56, clip: "anticipate", then: "idle" }],
  },
];
const mereVfx = (rise: number): VfxCue[] => [
  { kind: "mourn-lens", at: 0, until: 0.32, layer: "screen", params: { mode: "open", cx: 0.25, cy: 0.79 } },
  // As the water climbs the target, the lantern gutters and goes out.
  { kind: "mourn-grasp", at: 0, until: 1, params: { from: 0, to: 0, mote: 0, lampFrom: 1, lampTo: 0, la: 0.7, lb: 0.95 } },
  shallows({ depth: 0.12, rise, ra: 0.5, rb: 1 }),
  { kind: "mourn-rings", at: 0.02, until: 1, layer: "front", params: { ox: 0.3, oy: -0.1, flat: 0.1 } },
  { kind: "mourn-spill", at: 0, until: 1, layer: "front", params: { hx: 0.3, hy: 0.5, wy: 0.1 } },
];

/** The impact's effects, with the fist sized for the target's framing. */
const drownVfx = (fist: number): VfxCue[] => [
  { kind: "mourn-grasp", at: 0, until: 1, params: { from: 1, to: 1, lampFrom: 0, lampTo: 0, mote: 0 } },
  { kind: "mourn-glare", at: 0, until: 0.4, follow: "target", layer: "back", scale: fist },
  { kind: "mourn-fist", at: 0, until: 1, follow: "target", layer: "back", scale: fist, params: { part: "back" } },
  shallows({ who: "targets", depth: 0.2 }),
  { kind: "mourn-cling", at: 0.36, until: 1, follow: "target", layer: "front", scale: fist * 1.06, seed: 4, params: { grow: 0.4 } },
  { kind: "mourn-fist", at: 0, until: 1, follow: "target", layer: "front", scale: fist, seed: 9, params: { part: "front" } },
];
const FAR_CASTER: ActorCue = { role: "caster", at: [430, 486], size: 120, clip: "ult:mourn-fist", then: "ult:mourn-fist", look: "silhouette", z: 1 };

export const mourningWater: Cinematic = {
  id: "mourning-water",
  heroId: "warden",
  motif: "mourn-motif",
  shots: [
    /* 0 · CALL — the round stops; the Warden bows, and a black pool spreads under it. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round's rhythm: the real battlefield sinks to mere-black, the Warden bows its head low and draws the open hand in to its chest, and a pool of black water spreads on the floor under it, one ring running out.",
      space: "battlefield",
      ms: 420,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [NIGHT, 0], letterbox: 0 },
      toLighting: { tint: [NIGHT, 0.62], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:mourn-bow", then: "ult:mourn-bow" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: WEED },
        { kind: "mourn-board", at: 0.1, until: 1, anchor: "caster", params: { mode: "call" } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.3, sfx: "mourn-drip" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4700 }],
      markers: [{ at: 0.3, label: "called" }],
    },

    /* 1 · TEAR — face close-up: the brow breaks, eyes shut, and a tear runs. */
    {
      id: "tear",
      kind: "face-close-up",
      purpose:
        "Identity. Under the hood between the antlers, the old face with its eyes shut breaks: the inner ends of the brows lift and knot, the lids press, the mouth sets and gives, the head shudders once — and a tear wells from under the shut lid, runs the cheek over the leaf mark, and drops off the end of the beard.",
      space: "cinematic",
      ms: 700,
      fastMs: 440,
      transition: { kind: "black", ms: 60 },
      camera: {
        from: { x: 752, y: 300, zoom: 3.3 },
        to: { x: 752, y: 306, zoom: 3.55 },
        ease: "out",
      },
      background: "mourn-hollow",
      lighting: { exposure: 0.4, back: [COLD, 0.1], rim: [COLD, 0.6, 1], vignette: 0.75, letterbox: 0.13 },
      toLighting: { exposure: 0.3, back: [COLD, 0.14], rim: [COLD, 0.75, 1], vignette: 0.8, letterbox: 0.13 },
      actors: [
        { role: "caster", at: [700, 900], size: 1000, clip: "ult:mourn-weep", then: "ult:mourn-weep", look: "lit", root: false },
      ],
      vfx: [
        { kind: "mourn-grasp", at: 0, until: 1, params: { from: 0, to: 0, mote: 1 } },
        { kind: "mourn-tear", at: 0, until: 1 },
      ],
      sound: [{ at: 0.2, sfx: "mourn-breath" }],
      text: [{ kind: "voice", at: 0.24, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.3, label: "wells" },
        { at: 0.86, label: "lets go" },
      ],
    },

    /* 2 · PALM — detail: the tear lands in the open hand, which fills and spills. */
    {
      id: "palm",
      kind: "detail",
      purpose:
        "Escalation. The tear falls into the open palm, the hand that heals: a crown of spray, and then far more water than one tear wells up in it, black, brimming, and spills off the fingers in strands — the hand sinking under a weight it was never meant to hold. A drop comes at the lens and bursts.",
      space: "cinematic",
      ms: 560,
      fastMs: 320,
      transition: { kind: "cut" },
      camera: {
        from: { x: 826, y: 600, zoom: 3.9, rotate: -6 },
        to: { x: 830, y: 622, zoom: 4.2, rotate: -3 },
        ease: "out",
      },
      background: "mourn-hollow",
      lighting: { exposure: 0.35, under: [COLD, 0.2], rim: [COLD, 0.7, 1], vignette: 0.7, letterbox: BARS },
      toLighting: { exposure: 0.3, under: [WEED, 0.3], rim: [COLD, 0.8, 1], vignette: 0.72, letterbox: BARS },
      actors: [
        { role: "caster", at: [600, 1000], size: 1000, clip: "ult:mourn-cup", then: "ult:mourn-cup", look: "lit", root: false },
      ],
      vfx: [
        { kind: "mourn-palm", at: 0, until: 1, params: { land: 0.34 } },
        { kind: "mourn-lens", at: 0.78, until: 1, layer: "screen", params: { mode: "hit", cx: 0.25, cy: 0.79, burst: 0.62 } },
      ],
      sound: [
        { at: 0.33, sfx: "mourn-drop" },
        { at: 0.92, sfx: "mourn-lens" },
      ],
      text: [
        { kind: "name", at: 0.4, until: 1, text: "$name", x: 0.06, y: 0.2, mode: "fast" },
      ],
      markers: [{ at: 0.34, label: "lands" }],
    },

    /* 3 · MERE — wide on the water: rings run from the spill to the real target. */
    {
      id: "mere",
      kind: "target",
      purpose:
        "Stakes and target. The mere in the hollow, low over the water: the Warden small at the left, leaning out with its hand over the water and strands falling from it; the rings run across the whole still mere to the real target standing in it, and the water heaps up and climbs its legs as it braces. Title.",
      space: "cinematic",
      ms: 900,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 780, y: 520, zoom: 1.18 },
        to: { x: 820, y: 530, zoom: 1.24 },
        ease: "inOut",
      },
      background: "mourn-hollow",
      lighting: { exposure: 0.7, back: [COLD, 0.12], rim: [COLD, 0.6, 1], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.62, back: [COLD, 0.16], rim: [COLD, 0.7, 1], vignette: 0.56, letterbox: BARS },
      actors: mereActors([1170, 730], 300),
      vfx: mereVfx(0.34),
      sound: [
        { at: 0.02, sfx: "mourn-motif" },
        { at: 0.1, sfx: "mourn-rings" },
      ],
      text: [
        { kind: "name", at: 0.2, until: 1, text: "$name", x: 0.06, y: 0.2 },
        { kind: "epithet", at: 0.3, until: 1, text: "$epithet", x: 0.06, y: 0.29 },
      ],
      markers: [
        { at: 0.2, label: "title" },
        { at: 0.52, label: "reaches it" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 780, y: 500, zoom: 1.08 },
            to: { x: 820, y: 505, zoom: 1.12 },
            ease: "inOut",
          },
          actors: mereActors([1180, 740], 250),
          vfx: mereVfx(0.26),
        },
        boss: {
          camera: {
            from: { x: 800, y: 440, zoom: 0.94 },
            to: { x: 830, y: 445, zoom: 0.98 },
            ease: "inOut",
          },
          actors: mereActors([1190, 760], 215),
          vfx: mereVfx(0.2),
        },
      },
    },

    /* 4 · HOLD — the quiet: the raised hand, huge, closing on the far-off enemy. */
    {
      id: "hold",
      kind: "over-the-shoulder",
      purpose:
        "The quiet. From behind the Warden's raised hand, across the black water, the enemy stands small and far off — and the fingers begin to close round it. The lantern gutters and goes out; the music is gone; nothing moves but the fingers and the water hanging off them.",
      space: "cinematic",
      ms: 600,
      fastMs: 400,
      transition: { kind: "cut" },
      camera: { from: { x: 860, y: 455, zoom: 1.25 } },
      background: "mourn-hollow",
      lighting: { exposure: 0.34, back: [COLD, 0.1], rim: [COLD, 0.8, 1], vignette: 0.85, letterbox: 0.15 },
      toLighting: { exposure: 0.18, back: [COLD, 0.06], rim: [COLD, 0.7, 1], vignette: 0.92, letterbox: 0.15 },
      actors: [
        { role: "caster", at: [240, 1840], size: 2400, clip: "ult:mourn-grasp", then: "ult:mourn-grasp", look: "rim", rim: COLD, z: 3, root: false },
        { role: "target", at: [1060, 610], size: 140, face: -1, look: "lit", z: 1 },
      ],
      vfx: [
        { kind: "mourn-grasp", at: 0, until: 1, params: { from: 0, to: 0.55, a: 0.2, b: 1, lampFrom: 0, lampTo: 0, mote: 0 } },
        shallows({ who: "targets", depth: 0.34 }),
      ],
      duck: [{ at: 0, level: 0.03, ms: 600 }],
      sound: [{ at: 0.02, sfx: "mourn-hush" }],
      markers: [
        { at: 0.4, label: "lamp out" },
        { at: 0.9, label: "closing" },
      ],
    },

    /* 5 · DROWN — the impact: the mere closes over it in the shape of the hand. */
    {
      id: "drown",
      kind: "impact",
      purpose:
        "Impact. On a two-tone frame the mere has closed over the target in the shape of a hand — fingers of black water over its head, the thumb across it, spray off the knuckles — and it squeezes; then it lets go and falls back in sheets, and the target is left dragged down and hanging with water. The Warden, far off, a shape with its fist shut.",
      space: "cinematic",
      ms: 760,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 870, y: 540, zoom: 1.4, rotate: 5 },
        to: { x: 860, y: 530, zoom: 1.3, rotate: 2 },
        ease: "out",
      },
      background: "mourn-hollow",
      lighting: { exposure: 1, tint: [PALE, 0.08], back: [PALE, 0.8], rim: [COLD, 1, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.55, tint: [PALE, 0], back: [COLD, 0.18], rim: [COLD, 0.7, 1], vignette: 0.5, letterbox: BARS },
      actors: [FAR_CASTER, drowned([900, 760], 340, 26, 4)],
      vfx: drownVfx(0.85),
      screen: [
        { kind: "two-tone", at: 0.02, ms: 40 },
        { kind: "flash", at: 0.14, ms: 70, amount: 0.3, color: PALE },
      ],
      // The two-tone frame is over before the stop, so the held frame is in colour.
      stop: [{ at: 0.075, ms: 150 }],
      shake: [
        { at: 0.075, amount: 0.034 },
        { at: 0.34, amount: 0.012 },
      ],
      sound: [
        { at: 0, sfx: "mourn-rise" },
        { at: 0.03, sfx: "mourn-impact" },
        { at: 0.3, sfx: "mourn-fall" },
      ],
      reveal: [{ at: 0.075, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.075, until: 0.95, text: "$damage", x: 0.8, y: 0.2, rotate: -4 },
        { kind: "voice", at: 0.42, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.075, label: "closed" },
        { at: 0.3, label: "lets go" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 880, y: 500, zoom: 1.2, rotate: 5 },
            to: { x: 870, y: 492, zoom: 1.12, rotate: 2 },
            ease: "out",
          },
          actors: [FAR_CASTER, drowned([900, 780], 290, 18, 3)],
          vfx: drownVfx(0.78),
        },
        boss: {
          camera: {
            from: { x: 900, y: 470, zoom: 1.14, rotate: 4 },
            to: { x: 890, y: 462, zoom: 1.06, rotate: 1.5 },
            ease: "out",
          },
          actors: [{ ...FAR_CASTER, at: [420, 480] }, drowned([920, 810], 250, 12, 1.5)],
          vfx: drownVfx(0.62),
        },
      },
    },

    /* 6 · STILL — the real board: the drowned hanging with water, the rest soaked. */
    {
      id: "still",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield the Warden's fist opens as it lowers and its head comes up; the target stands in a black pool with water hanging off it in heavy strands and dripping (Wet, and too heavy with it to strike hard: Weak), and every other enemy is ringed and dripping (Wet), one after another.",
      space: "battlefield",
      ms: 740,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [NIGHT, 0.45], letterbox: BARS },
      toLighting: { tint: [NIGHT, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:mourn-open" }],
      vfx: [
        { kind: "mourn-board", at: 0, until: 1, anchor: "targets", params: { mode: "drowned" } },
        { kind: "mourn-board", at: 0, until: 1, anchor: "caster", params: { mode: "soaked", stagger: 0.1 } },
      ],
      sound: [
        { at: 0.05, sfx: "mourn-after" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.1, label: "soaked" }],
    },
  ],
};
