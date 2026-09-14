import type { Cinematic } from "../../shared/cinematic";

/**
 * LIVING BONE — the Lifebinder's Ultimate (Warden · Lifebinder).
 *
 * The idea, in one sentence: the Warden's antlers are the one bone that
 * grows back, so the Lifebinder breaks a tine off its own crown and grafts
 * it to the one it will not lose — a piece of living bone that takes, buds,
 * and keeps growing where the Warden put it.
 *
 * Only the Lifebinder could have it. The Warden is drawn with antlers up
 * through its hood in the same wood colour as its staff, bone already half a
 * branch; the path's title is an absolute, and its Lifebind is the heal
 * pushed past mending into keeping one ally alive. So: one life bound, not
 * everyone touched, and a price paid out of the Warden's own body.
 *
 * The space is the shedding ground: a clearing at the end of winter under a
 * flat white sky, dead bracken, a black hedgerow, and every crown the Warden
 * ever shed lying bone-white in the bracken. Bone, juniper (the cold green
 * of new growth), bracken copper, and one bead of velvet-blood at the break.
 *
 * Rhythm: identity (the hand closes on the crown) → stakes (the shedding
 * ground, the party across it; title) → the quiet (the face bracing, eyes
 * shut; a nod; music gone) → impact (the snap: the tine wrenched free, the
 * stump, the bead, the cost shown) → target (the graft: the tine pressed to
 * the one it binds, the light running in, the bud taking, the numbers) →
 * release (the real board: the grafted tine budding on the bound one). The
 * quiet face is directly before the loudest shot, and the loudest shot is
 * the Warden hurting itself, so the gift after it is the release.
 *
 * It shares nothing with the Warden's other films: no roots, web, ground
 * cut away, heartbeat or eyes opening; no tear, cupped hand, black water or
 * mere. Its signature is a piece of the hero's own body broken off and
 * given.
 *
 * The storyboard, with every shot's purpose and the engine limits it works
 * around, is `docs/ultimates/living-bone.md`.
 */

const JUNIPER = "#7fc4a4";
const BONE = "#ece3cf";
const PALE = "#e4ece5";
const DUSK = "#0d1411";
const BARS = 0.1;

export const livingBone: Cinematic = {
  id: "living-bone",
  heroId: "warden",
  motif: "bone-motif",
  shots: [
    /* 0 · CALL — the round stops; the Warden reaches for its own crown. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round's rhythm: the real battlefield pales towards bone and the bars close; the Warden lifts its head and raises the open hand towards its own crown, the lantern swinging once.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [PALE, 0], letterbox: 0 },
      toLighting: { tint: [PALE, 0.42], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:bone-turn", then: "ult:bone-turn" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: JUNIPER },
        { kind: "bone-board", at: 0, until: 1, anchor: "caster", params: { mode: "call" } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.3, sfx: "bone-tap" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4600 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · CROWN — extreme close-up: the hand closes on the forward tine. */
    {
      id: "crown",
      kind: "extreme-close-up",
      purpose:
        "Identity. Tight on the front antler: the healing hand comes up under the forward tine and closes on it, three drawn stages of a fist on bone; the head tips into the grip. Only this Warden takes hold of this.",
      space: "cinematic",
      ms: 620,
      fastMs: 400,
      transition: { kind: "black", ms: 50 },
      camera: {
        from: { x: 905, y: 395, zoom: 2.3, rotate: -8 },
        to: { x: 915, y: 385, zoom: 2.55, rotate: -6 },
        ease: "out",
      },
      background: "bone-shedding",
      lighting: { exposure: 0.62, rim: [JUNIPER, 0.55, 1], vignette: 0.7, letterbox: BARS },
      toLighting: { exposure: 0.7, rim: [JUNIPER, 0.8, 1], vignette: 0.62, letterbox: BARS },
      actors: [
        {
          role: "caster",
          at: [700, 1200],
          size: 1000,
          clip: "ult:bone-grip",
          then: "ult:bone-grip",
          look: "rim",
          rim: JUNIPER,
          root: false,
        },
      ],
      vfx: [
        { kind: "bone-crown", at: 0, until: 1, params: { graspFrom: 0, graspTo: 1, graspA: 0.36, graspB: 0.6, tine: 0, bead: 0 } },
        { kind: "glint", at: 0.62, until: 0.8, x: 1048, y: 410, scale: 0.5, color: BONE, layer: "front" },
        { kind: "motes", at: 0, until: 1, x: 900, y: 420, scale: 0.7, color: JUNIPER, layer: "front", seed: 21, params: { still: true } },
      ],
      sound: [
        { at: 0.36, sfx: "bone-creak" },
        { at: 0.12, sfx: "bone-motif", mode: "fast" },
      ],
      text: [
        { kind: "voice", at: 0.15, until: 0.9, text: "$voice.activation" },
        { kind: "name", at: 0.05, until: 1, text: "$name", x: 0.06, y: 0.7, mode: "fast" },
      ],
      markers: [{ at: 0.6, label: "gripped" }],
    },

    /* 2 · SHEDDING GROUND — wide: the clearing, every crown it ever shed, the party across it. */
    {
      id: "ground",
      kind: "wide-hero",
      purpose:
        "Stakes. The shedding ground, wide and level: the Warden at the left with its fist on its crown, the party standing across the clearing, and every old crown it ever dropped lying in the bracken between them. Title.",
      space: "cinematic",
      ms: 900,
      transition: { kind: "cut" },
      camera: {
        from: { x: 780, y: 560, zoom: 1.06 },
        to: { x: 840, y: 556, zoom: 1.0 },
        ease: "out",
      },
      background: "bone-shedding",
      lighting: { exposure: 0.82, rim: [JUNIPER, 0.6, 1], vignette: 0.45, letterbox: BARS },
      toLighting: { exposure: 0.9, rim: [JUNIPER, 0.75, 1], vignette: 0.4, letterbox: BARS },
      actors: [
        { role: "allies", at: [1010, 726], spread: [185, -8], size: 290, clip: "idle", look: "rim", rim: JUNIPER, z: 2 },
        { role: "caster", at: [340, 748], size: 310, clip: "ult:bone-grip", then: "ult:bone-grip", look: "rim", rim: JUNIPER, z: 3 },
      ],
      vfx: [
        { kind: "bone-crown", at: 0, until: 1, params: { graspFrom: 1, graspTo: 1, tine: 0, bead: 0 } },
        { kind: "bone-ground", at: 0, until: 1, layer: "front", seed: 3 },
        { kind: "motes", at: 0, until: 1, x: 800, y: 560, scale: 2, color: JUNIPER, layer: "front", seed: 5, params: { still: true } },
      ],
      sound: [{ at: 0.05, sfx: "bone-motif" }],
      text: [
        { kind: "name", at: 0.3, until: 1, text: "$name", x: 0.06, y: 0.72 },
        { kind: "epithet", at: 0.4, until: 1, text: "$epithet", x: 0.06, y: 0.81 },
      ],
      markers: [{ at: 0.3, label: "title" }],
    },

    /* 3 · BRACE — the quiet: the face under the antlers, eyes shut, deciding. */
    {
      id: "brace",
      kind: "face-close-up",
      purpose:
        "The quiet. On the face under the antlers, between the two beams: the brow knits and drops, the shut lids press, the mouth sets thin — the Warden bracing for a pain it has chosen — and then one small nod. Nothing moves but the face and the fingers whitening.",
      space: "cinematic",
      ms: 600,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: {
        from: { x: 752, y: 484, zoom: 3.0, rotate: 0 },
        to: { x: 752, y: 482, zoom: 3.08, rotate: 0 },
        ease: "linear",
      },
      background: "bone-shedding",
      lighting: { exposure: 0.16, rim: [JUNIPER, 0.7, 1], vignette: 0.88, letterbox: 0.14 },
      toLighting: { exposure: 0.12, rim: [JUNIPER, 0.85, 1], vignette: 0.92, letterbox: 0.15 },
      actors: [
        {
          role: "caster",
          at: [700, 1100],
          size: 900,
          clip: "ult:bone-brace",
          then: "ult:bone-brace",
          look: "rim",
          rim: JUNIPER,
          root: false,
        },
      ],
      vfx: [
        { kind: "bone-crown", at: 0, until: 1, params: { graspFrom: 1, graspTo: 1, tine: 0, bead: 0 } },
        { kind: "motes", at: 0, until: 1, x: 760, y: 480, scale: 0.6, color: JUNIPER, layer: "front", seed: 9, params: { still: true } },
      ],
      duck: [{ at: 0, level: 0.03, ms: 600 }],
      sound: [{ at: 0.05, sfx: "bone-hush" }],
      markers: [
        { at: 0.7, label: "braced" },
        { at: 0.84, label: "the nod" },
      ],
    },

    /* 4 · SNAP — impact: the tine wrenched off the crown, on a drawn frame. */
    {
      id: "snap",
      kind: "impact",
      purpose:
        "Impact. High and close on the crown against the sky: the fist wrenches down and the forward tine leaves the antler on a two-tone frame — the stump on the beam, the tine free in the fist, a bead of velvet-blood at the break, splinters. The Warden's own cost, on its own frame.",
      space: "cinematic",
      ms: 600,
      fastMs: 440,
      transition: { kind: "cut" },
      camera: {
        from: { x: 930, y: 400, zoom: 2.2, rotate: 6 },
        to: { x: 918, y: 418, zoom: 2.02, rotate: 2 },
        ease: "out",
      },
      background: "bone-shedding",
      lighting: { exposure: 1, tint: [BONE, 0.3], back: [BONE, 0.6], rim: [JUNIPER, 1, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.74, tint: [BONE, 0], back: [PALE, 0.2], rim: [JUNIPER, 0.75, 1], vignette: 0.5, letterbox: BARS },
      actors: [
        {
          role: "caster",
          at: [760, 1150],
          size: 950,
          clip: "ult:bone-snap",
          then: "ult:bone-snap",
          look: "rim",
          rim: JUNIPER,
        },
      ],
      vfx: [
        { kind: "bone-crown", at: 0, until: 1, params: { graspFrom: 1, graspTo: 1, tineAt: 0.06, beadAt: 0.14, bead: 0 } },
        { kind: "motes", at: 0.08, until: 1, x: 930, y: 400, scale: 1.4, color: JUNIPER, layer: "front", seed: 13 },
      ],
      screen: [
        { kind: "two-tone", at: 0.05, ms: 70 },
        { kind: "flash", at: 0.15, ms: 90, amount: 0.45, color: BONE },
      ],
      stop: [{ at: 0.06, ms: 150 }],
      shake: [
        { at: 0.06, amount: 0.03 },
        { at: 0.3, amount: 0.01 },
      ],
      sound: [{ at: 0.05, sfx: "bone-snap" }],
      reveal: [{ at: 0.06, reveal: "impact" }],
      markers: [{ at: 0.06, label: "snap" }],
    },

    /* 5 · GRAFT — over the shoulder: the tine pressed to the one it binds. */
    {
      id: "graft",
      kind: "over-the-shoulder",
      purpose:
        "Target and result. Past the Warden's crown, one tine short, to the party: the Warden crosses to the one it binds and presses the tine to their chest; the fist opens and leaves it there, the light runs from the hand into the figure, the bud takes, and the numbers land. If they were down, they come up as it takes.",
      space: "cinematic",
      ms: 700,
      fastMs: 480,
      transition: { kind: "whip", ms: 120, dir: 1 },
      camera: {
        from: { x: 770, y: 520, zoom: 1.42 },
        to: { x: 812, y: 512, zoom: 1.5 },
        ease: "out",
      },
      background: "bone-shedding",
      lighting: { exposure: 0.62, back: [JUNIPER, 0.2], rim: [JUNIPER, 0.7, 1], vignette: 0.55, letterbox: BARS },
      toLighting: { exposure: 0.86, back: [JUNIPER, 0.55], rim: [JUNIPER, 0.9, 1], vignette: 0.45, letterbox: BARS },
      actors: [
        { role: "allies", at: [1010, 736], spread: [160, -8], size: 310, clip: "idle", look: "ghost", z: 2 },
        {
          role: "caster",
          at: [560, 760],
          to: [700, 752],
          ease: "out",
          size: 340,
          clip: "ult:bone-give",
          then: "ult:bone-give",
          look: "rim",
          rim: JUNIPER,
          z: 3,
        },
      ],
      vfx: [
        { kind: "bone-crown", at: 0, until: 1, params: { graspFrom: 1, graspTo: 0, graspA: 0.5, graspB: 0.64, tine: 1, bead: 1, releaseAt: 0.52 } },
        { kind: "bone-thread", at: 0, until: 1, layer: "front", params: { press: 0.5 } },
        { kind: "motes", at: 0.5, until: 1, x: 1000, y: 560, scale: 1.4, color: JUNIPER, layer: "front", seed: 27 },
      ],
      sound: [{ at: 0.48, sfx: "bone-graft" }],
      // Revealed early so the film can read who the pops land on, before the press.
      reveal: [{ at: 0.3, reveal: "ward" }],
      text: [{ kind: "voice", at: 0.56, until: 1, text: "$voice.impact" }],
      markers: [
        { at: 0.5, label: "pressed" },
        { at: 0.62, label: "it takes" },
      ],
    },

    /* 6 · TAKEN — the real board: the grafted tine budding on the bound one. */
    {
      id: "taken",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield: the grafted tine on the bound ally's chest, budding, juniper rising off it; a bead at the real Warden's crown as its hand comes down. Where the bone went, and what it is doing there.",
      space: "battlefield",
      ms: 760,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [DUSK, 0.3], letterbox: BARS },
      toLighting: { tint: [DUSK, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:bone-rest" }],
      vfx: [{ kind: "bone-board", at: 0, until: 1, anchor: "caster", params: { mode: "after" } }],
      sound: [
        { at: 0.05, sfx: "bone-taken" },
        { at: 0.45, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.15, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.05, label: "taken" }],
    },
  ],
};
