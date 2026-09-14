import type { Cinematic } from "../../shared/cinematic";

/**
 * A GOOD HIDING — the Reaver · Ironhide's Ultimate.
 *
 * The idea, in one sentence: the Ironhide has stopped paying in blood, so it
 * beats its own chest in a tannery loft, spreads its arms and lets the enemy
 * hit it flush, and the blow does not burst off it but sinks in, pressed into
 * the hide like a mallet into leather, and comes back out through the cleaver
 * as a good hiding.
 *
 * Only the Ironhide could have it: *Stop bleeding. Start absorbing.* Its
 * pain is still its fuel (a Reaver's charge comes from being hurt), it has
 * only stopped inflicting it on itself; its Ironrend leaves it Barrier, and
 * its drawing is the one bare, scarred body in the party, with a brow like a
 * shelf of bone to take a blow on. A hide is skin worked until it stops
 * tearing; a good hiding is a beating.
 *
 * Rhythm: identity (the fist on the chest, dust off the hide, the arms
 * opened) → stakes (the real enemy's blow, from behind it; title) → the blow
 * taken (the face as it lands: head back, brow shelf down, eyes open; the dent
 * closes into the chest; the grin) → quiet (the two of them in profile between
 * the hanging hides, which swing to rest) → impact (an iron two-tone frame,
 * the cleaver down, the dent driven into the enemy, every hide jumping) →
 * release (the iron set over the real Ironhide, a slack dent over the enemy).
 *
 * It shares nothing with Red Ledger: no pit, sand, top light, stakes, blood,
 * bandage, stroke or mark written on anyone, no black impact frame, and its
 * quiet is not a face in the dark. Nor with the other films that take a blow:
 * no shield, ward, wall, wave, paper, snow, trench, forge or gate. The
 * Ironhide is not in front of anyone; it is the body the blow is spent on.
 * The storyboard is `docs/ultimates/good-hiding.md`.
 */

/** The accent: cold iron, only ever the blow kept in the hide. */
const IRON = "#a9b7c1";
/** Limewash: the slat light and the dust. */
const LIME = "#e6e0cf";
const TIMBER = "#140d09";
const BARS = 0.11;

export const goodHiding: Cinematic = {
  id: "good-hiding",
  heroId: "reaver",
  motif: "hiding-motif",
  shots: [
    /* 0 · CALL — a hide being beaten, on the real board. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the real battlefield darkens to timber brown, and the Ironhide sets its cleaver's point on the floor and beats its bare chest twice with its fist, dust coming off the hide.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [TIMBER, 0], letterbox: 0 },
      toLighting: { tint: [TIMBER, 0.62], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:hiding-call" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: IRON },
        { kind: "hiding-dust", at: 0.34, until: 1, anchor: "caster", seed: 3, params: { n: 10, dir: -150, spread: 120, reach: 30, size: 5 } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0, sfx: "hiding-thump" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4700 }],
      markers: [{ at: 0.34, label: "thump" }],
    },

    /* 1 · DARE — detail: one more blow on the chest, and the arms opened. */
    {
      id: "dare",
      kind: "detail",
      purpose:
        "Identity. Close on the scarred chest, the fist and the jaw in a bar of slat light: the fist comes down on the chest once more and pale dust jumps off the hide; then both arms open wide, chin up, teeth showing. Go on. Hit me.",
      space: "cinematic",
      ms: 640,
      fastMs: 400,
      transition: { kind: "black", ms: 60 },
      camera: {
        from: { x: 830, y: 770, zoom: 1.5, rotate: 7 },
        to: { x: 822, y: 764, zoom: 1.6, rotate: 4 },
        ease: "out",
      },
      background: "hiding-loft",
      lighting: { exposure: 0.34, rim: [LIME, 0.5, -1], vignette: 0.66, letterbox: BARS },
      toLighting: { exposure: 0.4, rim: [LIME, 0.6, -1], vignette: 0.6, letterbox: BARS },
      actors: [
        { role: "caster", at: [800, 1300], size: 1000, clip: "ult:hiding-dare", then: "ult:hiding-open", look: "lit", root: false },
      ],
      vfx: [
        { kind: "hiding-dust", at: 0.26, until: 0.9, follow: "caster", x: -20, y: -470, layer: "front", seed: 8, params: { n: 18, dir: -120, spread: 150, reach: 150, size: 12 } },
        { kind: "hiding-slats", at: 0, until: 1, layer: "screen", params: { angle: 104, gap: 34, bar: 18, dark: 0.55, shift: 6 } },
        { kind: "hiding-wipe", at: 0.84, until: 1, layer: "screen", params: { phase: "out" } },
      ],
      sound: [{ at: 0.02, sfx: "hiding-dare" }],
      text: [{ kind: "voice", at: 0.42, until: 0.86, text: "$voice.activation" }],
      markers: [
        { at: 0.26, label: "thump" },
        { at: 0.62, label: "open" },
      ],
    },

    /* 2 · SWING — from behind the real enemy: its blow, at an open Ironhide. */
    {
      id: "swing",
      kind: "target",
      purpose:
        "Stakes. From behind the real enemy, low, in the lit loft: the Ironhide stands open across the boards with its arms wide and its chest out, settling onto its heels, and the enemy throws its blow at it.",
      space: "cinematic",
      ms: 900,
      fastMs: 500,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 560, zoom: 1.18 },
        to: { x: 850, y: 580, zoom: 1.32, rotate: 1 },
        ease: "inOut",
      },
      background: "hiding-loft",
      lighting: { exposure: 0.78, rim: [LIME, 0.4, -1], vignette: 0.48, letterbox: BARS },
      toLighting: { exposure: 0.84, rim: [LIME, 0.45, -1], vignette: 0.44, letterbox: BARS },
      actors: [
        { role: "caster", at: [1100, 800], to: [1086, 802], size: 400, face: -1, clip: "ult:hiding-open", look: "lit", z: 1 },
        {
          role: "target",
          at: [520, 1010],
          to: [560, 1004],
          size: 560,
          face: 1,
          look: "lit",
          z: 3,
          react: [{ at: 0.5, clip: "attack" }],
        },
      ],
      vfx: [
        { kind: "hiding-wipe", at: 0, until: 0.16, layer: "screen", params: { phase: "in" } },
        { kind: "hiding-hides", at: 0, until: 1, layer: "front", seed: 21, params: { mode: "swing", amp: 2.5, at: "1500,180,0.9;1760,150,1" } },
        { kind: "motes", at: 0, until: 1, x: 700, y: 560, scale: 1.5, color: LIME, layer: "back", seed: 4 },
      ],
      sound: [
        { at: 0.04, sfx: "hiding-motif" },
        { at: 0.62, sfx: "hiding-whoosh" },
      ],
      text: [
        { kind: "name", at: 0.2, until: 1, text: "$name", x: 0.34, y: 0.18 },
        { kind: "epithet", at: 0.3, until: 1, text: "$epithet", x: 0.34, y: 0.28 },
      ],
      markers: [
        { at: 0.2, label: "title" },
        { at: 0.5, label: "the blow thrown" },
      ],
      framing: {
        boss: {
          camera: {
            from: { x: 820, y: 500, zoom: 1.0 },
            to: { x: 860, y: 520, zoom: 1.08, rotate: 1 },
            ease: "inOut",
          },
          actors: [
            { role: "caster", at: [1110, 800], to: [1100, 802], size: 360, face: -1, clip: "ult:hiding-open", look: "lit", z: 1 },
            { role: "target", at: [460, 1000], to: [490, 996], size: 440, face: 1, look: "lit", z: 3, react: [{ at: 0.5, clip: "attack" }] },
          ],
        },
      },
    },

    /* 3 · TAKE — face close-up: the blow lands, and goes in. */
    {
      id: "take",
      kind: "face-close-up",
      purpose:
        "The blow taken. On the face and chest as it lands: the head is thrown back, the brow shelf comes down hard over eyes that never close, the chest gives; the dent closes inward into the skin and sets there as iron. Then the head comes forward into it again and the brow lifts into a grin.",
      space: "cinematic",
      ms: 620,
      fastMs: 420,
      transition: { kind: "cut" },
      camera: {
        from: { x: 850, y: 800, zoom: 1.56 },
        to: { x: 852, y: 802, zoom: 1.6 },
        ease: "linear",
      },
      background: "hiding-loft",
      lighting: { exposure: 0.46, rim: [LIME, 0.55, -1], vignette: 0.62, letterbox: 0.13 },
      toLighting: { exposure: 0.4, rim: [LIME, 0.5, -1], vignette: 0.66, letterbox: 0.13 },
      actors: [
        { role: "caster", at: [800, 1500], size: 1200, clip: "ult:hiding-take", then: "ult:hiding-take", look: "lit", root: false },
      ],
      vfx: [
        { kind: "hiding-dent", at: 0.02, until: 1, follow: "caster", x: 30, y: -560, layer: "front", seed: 6, params: { mode: "in", size: 330 } },
        { kind: "hiding-dust", at: 0.03, until: 0.8, follow: "caster", x: 30, y: -560, layer: "front", seed: 13, params: { n: 20, dir: 180, spread: 170, reach: 220, size: 14 } },
        { kind: "hiding-slats", at: 0, until: 1, layer: "screen", params: { angle: 100, gap: 40, bar: 22, dark: 0.5, shift: 12 } },
      ],
      screen: [{ kind: "flash", at: 0.02, ms: 40, color: LIME, amount: 0.35 }],
      stop: [{ at: 0.04, ms: 90 }],
      shake: [{ at: 0.04, amount: 0.014 }],
      sound: [{ at: 0.02, sfx: "hiding-swallow" }],
      reveal: [{ at: 0.06, reveal: "ward" }],
      markers: [
        { at: 0.04, label: "the blow lands" },
        { at: 0.7, label: "the grin" },
      ],
    },

    /* 4 · HANG — the quiet: the two of them, and the hides swinging to rest. */
    {
      id: "hang",
      kind: "profile",
      purpose:
        "The quiet. Eye level between two hanging hides that are still swinging from the blow, the Ironhide and the enemy in profile, both ink against the slat light: the enemy off balance from its own blow, the Ironhide lifting its cleaver slowly up behind the mane. The music is gone; the hides come to rest; one long breath.",
      space: "cinematic",
      ms: 540,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 590, zoom: 1.42 },
        to: { x: 800, y: 590, zoom: 1.43 },
        ease: "linear",
      },
      background: "hiding-loft",
      lighting: { exposure: 0.16, back: [LIME, 0], vignette: 0.86, letterbox: 0.15 },
      toLighting: { exposure: 0.13, back: [LIME, 0], vignette: 0.9, letterbox: 0.15 },
      actors: [
        { role: "caster", at: [590, 800], size: 360, clip: "ult:hiding-raise", then: "ult:hiding-raise", look: "silhouette", z: 2 },
        { role: "target", at: [1020, 800], size: 340, face: -1, look: "silhouette", z: 2, tilt: -7, toTilt: -6, react: [{ at: 0, clip: "idle" }] },
      ],
      vfx: [
        { kind: "hiding-glare", at: 0, until: 1, layer: "back", seed: 52, params: { x: 800, y: 640, scale: 0.8, hold: 0.42 } },
        { kind: "hiding-hides", at: 0, until: 1, layer: "front", seed: 31, params: { mode: "settle", amp: 7, at: "300,250,0.85;1300,240,0.8" } },
        { kind: "motes", at: 0, until: 1, x: 800, y: 520, scale: 1.8, color: LIME, layer: "back", seed: 9, params: { still: true } },
      ],
      duck: [{ at: 0, level: 0.04, ms: 540 }],
      sound: [{ at: 0.02, sfx: "hiding-hush" }],
      markers: [{ at: 0.85, label: "at rest" }],
      framing: {
        boss: {
          camera: {
            from: { x: 800, y: 540, zoom: 1.16 },
            to: { x: 800, y: 540, zoom: 1.17 },
            ease: "linear",
          },
          actors: [
            { role: "caster", at: [520, 800], size: 320, clip: "ult:hiding-raise", then: "ult:hiding-raise", look: "silhouette", z: 2 },
            { role: "target", at: [1080, 810], size: 300, face: -1, look: "silhouette", z: 2, tilt: -4, toTilt: -3, react: [{ at: 0, clip: "idle" }] },
          ],
        },
      },
    },

    /* 5 · HIDING — the impact: the blow given back. */
    {
      id: "hiding",
      kind: "impact",
      purpose:
        "Impact. On an iron two-tone frame the cleaver is already down in the enemy with the Ironhide's whole weight behind it; then, in colour, the dent is driven into the enemy and its dust knocked out of it, the enemy thrown back, and every hide in the loft jumping on its pole.",
      space: "cinematic",
      ms: 820,
      fastMs: 600,
      transition: { kind: "cut" },
      camera: {
        from: { x: 870, y: 610, zoom: 1.38, rotate: -4 },
        to: { x: 890, y: 604, zoom: 1.26, rotate: -1.5 },
        ease: "out",
      },
      background: "hiding-loft",
      lighting: { exposure: 0.95, rim: [LIME, 0.5, -1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.72, rim: [LIME, 0.4, -1], vignette: 0.42, letterbox: BARS },
      actors: [
        {
          role: "target",
          at: [960, 830],
          size: 380,
          face: -1,
          z: 1,
          react: [{ at: 0.04, clip: "hurt" }],
          shove: { at: 0.04, by: [70, -4] },
          toTilt: 9,
        },
        { role: "caster", at: [720, 834], to: [736, 834], ease: "out", size: 450, clip: "ult:hiding-strike", then: "ult:hiding-strike", look: "lit", z: 2 },
      ],
      vfx: [
        { kind: "hiding-glare", at: 0, until: 1, layer: "back", params: { x: 890, y: 640 } },
        { kind: "hiding-hides", at: 0, until: 1, layer: "back", seed: 41, params: { mode: "jump", amp: 9, at: "260,190,0.7;520,160,0.6;1200,170,0.65;1460,200,0.75" } },
        { kind: "hiding-dent", at: 0.04, until: 0.6, follow: "target", x: 40, y: -170, layer: "front", seed: 12, params: { mode: "drive", size: 220 } },
        { kind: "hiding-dust", at: 0.05, until: 0.95, follow: "target", x: 10, y: -180, layer: "front", seed: 15, params: { n: 26, dir: -20, spread: 120, reach: 260, size: 14 } },
      ],
      screen: [
        { kind: "two-tone", at: 0, ms: 70, mode: "full" },
        { kind: "two-tone", at: 0, ms: 50, mode: "fast" },
      ],
      stop: [{ at: 0.04, ms: 150 }],
      shake: [
        { at: 0.04, amount: 0.04 },
        { at: 0.26, amount: 0.012 },
      ],
      sound: [{ at: 0.03, sfx: "hiding-impact" }, { at: 0.05, sfx: "ult-boom" }],
      reveal: [{ at: 0.04, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.04, until: 0.9, text: "$damage", x: 0.3, y: 0.22, rotate: -4 },
        { kind: "voice", at: 0.4, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.04, label: "given back" },
        { at: 0.3, label: "hides jump" },
      ],
      framing: {
        boss: {
          camera: {
            from: { x: 850, y: 540, zoom: 1.14, rotate: -3 },
            to: { x: 866, y: 540, zoom: 1.06, rotate: -1 },
            ease: "out",
          },
          actors: [
            { role: "target", at: [1060, 840], size: 400, face: -1, z: 1, react: [{ at: 0.04, clip: "hurt" }], shove: { at: 0.04, by: [22, 0] }, toTilt: 3 },
            { role: "caster", at: [640, 850], to: [656, 850], ease: "out", size: 460, clip: "ult:hiding-strike", then: "ult:hiding-strike", look: "lit", z: 2 },
          ],
          vfx: [
            { kind: "hiding-glare", at: 0, until: 1, layer: "back", params: { x: 900, y: 560, scale: 1.3 } },
            { kind: "hiding-hides", at: 0, until: 1, layer: "back", seed: 41, params: { mode: "jump", amp: 9, at: "160,120,0.8;420,80,0.7;1320,90,0.75;1580,130,0.85" } },
            { kind: "hiding-dent", at: 0.04, until: 0.6, follow: "target", x: -60, y: -330, layer: "front", seed: 12, params: { mode: "drive", size: 460 } },
            { kind: "hiding-dust", at: 0.05, until: 0.95, follow: "target", x: -40, y: -320, layer: "front", seed: 15, params: { n: 30, dir: -20, spread: 130, reach: 360, size: 18 } },
          ],
        },
      },
    },

    /* 6 · KEPT — the real board: the iron in the hide, the enemy spent. */
    {
      id: "kept",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield: the Ironhide lets its blade down onto the floor and rolls its neck, the iron it kept set over its hide (its Barrier); over the enemy, a slack dent sagging (Weak).",
      space: "battlefield",
      ms: 720,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [TIMBER, 0.44], letterbox: BARS },
      toLighting: { tint: [TIMBER, 0], letterbox: 0 },
      actors: [
        { role: "caster", at: [0, 0], size: 0, clip: "ult:hiding-settle" },
        { role: "target", at: [0, 0], size: 0, clip: "hurt", clipAt: 0.1, then: "idle" },
      ],
      vfx: [
        { kind: "hiding-board", at: 0.02, until: 1, anchor: "caster", seed: 9, params: { mode: "kept" } },
        { kind: "hiding-board", at: 0.1, until: 1, anchor: "targets", seed: 19, params: { mode: "spent" } },
      ],
      sound: [
        { at: 0.04, sfx: "hiding-settle" },
        { at: 0.45, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.1, label: "kept" }],
    },
  ],
};
