import type { Cinematic } from "../../shared/cinematic";

/**
 * LANTERN WALL — the Vanguard's Ultimate.
 *
 * Fantasy: the Vanguard stands between the party and whatever is coming, and
 * for one round that is a law, not a hope. The guild's lantern on the shield
 * is the pact's oldest symbol; planting it lights every lantern the guild has
 * ever hung, and the party stands in that light.
 *
 * Rhythm: identity (the plant) → identity (the wall, the party behind it) →
 * anticipation (silence, the visor) → target (the charge) → impact → release
 * (the wards rise on the real battlefield). The loudest moment is preceded by
 * the quietest, and the wide shot is followed by the tightest.
 *
 * The full storyboard, with every shot's purpose, is `docs/ULTIMATES.md`.
 */

const GOLD = "#ffcf6b";
const BARS = 0.11;

export const lanternWall: Cinematic = {
  id: "lantern-wall",
  heroId: "vanguard",
  motif: "motif-vanguard",
  shots: [
    /* 0 · CALL — on the battlefield, the lantern flares and the world dims. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the rhythm of the round: the caster lights up where it stands and the bars close.",
      space: "battlefield",
      ms: 420,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: ["#07060a", 0], letterbox: 0 },
      toLighting: { tint: ["#07060a", 0.62], letterbox: BARS },
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: GOLD },
      ],
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "block" }],
      sound: [{ at: 0, sfx: "ult-call" }],
      duck: [{ at: 0, level: 0.35, ms: 4200 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · PLANT — extreme close-up: the rim bites the floor. */
    {
      id: "plant",
      kind: "extreme-close-up",
      purpose:
        "Identity. The one gesture that is the Vanguard: the shield planted, the floor answering in lantern light.",
      space: "cinematic",
      ms: 640,
      fastMs: 420,
      transition: { kind: "flash", ms: 70 },
      camera: {
        from: { x: 930, y: 700, zoom: 2.35, rotate: -7 },
        to: { x: 935, y: 712, zoom: 2.7, rotate: -5 },
        ease: "out",
      },
      background: "lantern-vault",
      lighting: {
        exposure: 0.22,
        under: [GOLD, 0],
        rim: [GOLD, 0.5, -1],
        vignette: 0.75,
        letterbox: BARS,
      },
      toLighting: {
        exposure: 0.34,
        under: [GOLD, 0.85],
        rim: [GOLD, 0.8, -1],
        vignette: 0.6,
        letterbox: BARS,
      },
      actors: [
        {
          role: "caster",
          at: [800, 790],
          size: 520,
          clip: "ult:plant",
          look: "rim",
          rim: GOLD,
        },
      ],
      vfx: [
        { kind: "glint", at: 0.02, until: 0.2, x: 905, y: 640, scale: 0.6 },
        {
          kind: "floor-cracks",
          at: 0.19,
          until: 1,
          x: 940,
          y: 806,
          scale: 0.95,
          color: GOLD,
          seed: 3,
          layer: "back",
        },
        { kind: "dust", at: 0.19, until: 0.95, x: 940, y: 806, scale: 0.9, layer: "front" },
        {
          kind: "sparks",
          at: 0.19,
          until: 0.7,
          x: 940,
          y: 800,
          scale: 0.6,
          color: GOLD,
          seed: 1,
          layer: "front",
        },
        { kind: "motes", at: 0.3, until: 1, x: 930, y: 700, scale: 0.6, color: GOLD, layer: "front" },
      ],
      shake: [{ at: 0.2, amount: 0.014 }],
      stop: [{ at: 0.2, ms: 70 }],
      sound: [{ at: 0.18, sfx: "ult-plant" }],
      text: [{ kind: "voice", at: 0.42, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.2, label: "plant contact" }],
    },

    /* 2 · WALL — low-angle wide hero: sword up, the party behind, the threat in the shield. */
    {
      id: "wall",
      kind: "low-angle",
      purpose:
        "Identity and stakes. The whole wall, the people it stands for, and — in the shield — the thing it stands against.",
      space: "cinematic",
      ms: 940,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 560, zoom: 1.28, rotate: 1.5 },
        to: { x: 800, y: 500, zoom: 1.46, rotate: 0 },
        ease: "inOut",
      },
      background: "lantern-vault",
      lighting: {
        exposure: 0.45,
        back: [GOLD, 0.45],
        rim: [GOLD, 0.9, -1],
        under: [GOLD, 0.35],
        vignette: 0.55,
        letterbox: BARS,
      },
      toLighting: {
        exposure: 0.8,
        back: [GOLD, 0.85],
        rim: [GOLD, 1, -1],
        under: [GOLD, 0.2],
        vignette: 0.45,
        letterbox: BARS,
      },
      actors: [
        {
          role: "allies",
          at: [455, 770],
          to: [470, 766],
          spread: [330, -6],
          size: 390,
          look: "silhouette",
          z: 1,
        },
        {
          role: "caster",
          at: [800, 900],
          to: [800, 894],
          size: 700,
          toSize: 720,
          clip: "ult:stand",
          look: "rim",
          rim: GOLD,
          z: 3,
        },
      ],
      vfx: [
        { kind: "lanterns", at: 0, until: 1, layer: "back", color: GOLD },
        {
          kind: "reflection",
          at: 0.18,
          until: 1,
          follow: "caster",
          x: 176,
          y: -262,
          scale: 1.45,
          layer: "front",
        },
        { kind: "motes", at: 0, until: 1, x: 800, y: 600, scale: 2.2, color: GOLD, layer: "front" },
      ],
      sound: [
        { at: 0, sfx: "ult-rise" },
        { at: 0.12, sfx: "motif-vanguard" },
      ],
      text: [
        { kind: "name", at: 0.4, until: 1, text: "$name", x: 0.08, y: 0.62 },
        { kind: "epithet", at: 0.5, until: 1, text: "$epithet", x: 0.08, y: 0.72 },
      ],
      markers: [{ at: 0.4, label: "title" }],
    },

    /* 3 · BREATH — face close-up: silence, the visor lights. */
    {
      id: "breath",
      kind: "face-close-up",
      purpose:
        "Anticipation. Everything stops: the motes freeze, the sound drops to one note, and the Vanguard looks at them.",
      space: "cinematic",
      ms: 560,
      fastMs: 340,
      transition: { kind: "occlusion", ms: 240, dir: -1, object: "cape" },
      camera: {
        from: { x: 752, y: 428, zoom: 3.0, rotate: 2.5 },
        to: { x: 728, y: 452, zoom: 3.35, rotate: 1.5 },
        ease: "linear",
      },
      background: "void",
      lighting: {
        exposure: 0.08,
        back: ["#1b1206", 0.4],
        rim: [GOLD, 0.75, 1],
        vignette: 0.85,
        letterbox: 0.15,
      },
      toLighting: {
        exposure: 0.05,
        back: ["#1b1206", 0.3],
        rim: [GOLD, 0.95, 1],
        vignette: 0.9,
        letterbox: 0.15,
      },
      actors: [
        {
          role: "caster",
          at: [800, 900],
          size: 720,
          clip: "ult:ready",
          then: "ult:ready",
          look: "rim",
          rim: GOLD,
        },
      ],
      vfx: [
        { kind: "motes", at: 0, until: 1, x: 780, y: 440, scale: 0.7, color: GOLD, layer: "front", params: { still: true } },
        { kind: "visor", at: 0.42, until: 1, follow: "caster", x: -41, y: -449, scale: 4.6, rotate: 4, color: GOLD, layer: "front" },
        { kind: "glint", at: 0.86, until: 1, follow: "caster", x: 2, y: -446, scale: 0.9, layer: "front" },
      ],
      duck: [{ at: 0, level: 0.08, ms: 560 }],
      sound: [
        { at: 0.04, sfx: "ult-hum" },
        { at: 0.86, sfx: "ult-tick" },
      ],
      text: [
        { kind: "name", at: 0.05, until: 1, text: "$name", x: 0.08, y: 0.66, mode: "fast" },
      ],
      markers: [{ at: 0.86, label: "the look" }],
    },

    /* 4 · CHARGE — profile, tracking: the wall moves, and the target braces. */
    {
      id: "charge",
      kind: "profile",
      purpose:
        "Target. The real enemy, at its real size, sees it coming and braces; the camera cannot keep up.",
      space: "cinematic",
      ms: 700,
      fastMs: 440,
      transition: { kind: "cut" },
      camera: {
        from: { x: 560, y: 560, zoom: 1.75, rotate: 0 },
        to: { x: 1040, y: 560, zoom: 1.6, rotate: -3 },
        ease: "in",
      },
      background: "lantern-vault",
      lighting: {
        exposure: 0.55,
        rim: [GOLD, 0.8, 1],
        under: [GOLD, 0.25],
        vignette: 0.5,
        letterbox: BARS,
      },
      actors: [
        {
          role: "target",
          at: [1250, 770],
          size: 440,
          face: -1,
          look: "lit",
          z: 1,
          react: [{ at: 0.4, clip: "anticipate", then: "block" }],
        },
        {
          role: "caster",
          at: [330, 770],
          to: [1010, 770],
          ease: "in",
          size: 450,
          clip: "ult:charge",
          look: "rim",
          rim: GOLD,
          z: 2,
        },
      ],
      vfx: [
        { kind: "speed-lines", at: 0.25, until: 1, layer: "screen", color: GOLD, params: { dir: 1 } },
        { kind: "trail", at: 0.1, until: 1, follow: "caster", x: -40, y: -220, scale: 1.3, color: GOLD, layer: "back" },
        { kind: "dust", at: 0.15, until: 1, follow: "caster", x: -60, y: 0, scale: 0.8, layer: "back" },
      ],
      sound: [
        { at: 0, sfx: "footstep-heavy" },
        { at: 0.22, sfx: "footstep-heavy" },
        { at: 0.4, sfx: "footstep-heavy" },
        { at: 0.3, sfx: "ult-whoosh" },
      ],
      markers: [{ at: 0.4, label: "target braces" }],
      framing: {
        large: {
          camera: {
            from: { x: 580, y: 520, zoom: 1.5 },
            to: { x: 1040, y: 520, zoom: 1.38, rotate: -3 },
            ease: "in",
          },
          actors: [
            {
              role: "target",
              at: [1270, 790],
              size: 470,
              face: -1,
              z: 1,
              react: [{ at: 0.4, clip: "anticipate", then: "block" }],
            },
            {
              role: "caster",
              at: [330, 790],
              to: [990, 790],
              ease: "in",
              size: 420,
              clip: "ult:charge",
              look: "rim",
              rim: GOLD,
              z: 2,
            },
          ],
        },
        boss: {
          camera: {
            from: { x: 640, y: 470, zoom: 1.12 },
            to: { x: 1000, y: 450, zoom: 1.04, rotate: -2 },
            ease: "in",
          },
          actors: [
            {
              role: "target",
              at: [1260, 830],
              size: 470,
              face: -1,
              z: 1,
              react: [{ at: 0.4, clip: "anticipate", then: "block" }],
            },
            {
              role: "caster",
              at: [260, 830],
              to: [860, 830],
              ease: "in",
              size: 330,
              clip: "ult:charge",
              look: "rim",
              rim: GOLD,
              z: 2,
            },
          ],
        },
      },
    },

    /* 5 · IMPACT — the blow, drawn: a two-tone frame, the stop, the ring through them. */
    {
      id: "impact",
      kind: "impact",
      purpose:
        "Impact. One frame of pure light and shadow, a held stop, and the force passing clean through the target.",
      space: "cinematic",
      ms: 640,
      fastMs: 500,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1120, y: 585, zoom: 2.35, rotate: -9 },
        to: { x: 1150, y: 575, zoom: 2.05, rotate: -5 },
        ease: "out",
      },
      background: "lantern-vault",
      lighting: {
        exposure: 0.95,
        tint: [GOLD, 0.2],
        rim: [GOLD, 1, 1],
        vignette: 0.35,
        letterbox: BARS,
      },
      toLighting: {
        exposure: 0.5,
        tint: [GOLD, 0],
        rim: [GOLD, 0.6, 1],
        vignette: 0.5,
        letterbox: BARS,
      },
      actors: [
        {
          role: "caster",
          at: [985, 780],
          size: 470,
          clip: "ult:strike",
          look: "rim",
          rim: GOLD,
          z: 2,
        },
        {
          role: "target",
          at: [1230, 780],
          size: 450,
          face: -1,
          z: 1,
          react: [{ at: 0.02, clip: "hurt" }],
          shove: { at: 0.02, by: [150, -6] },
          tilt: 0,
          toTilt: 7,
        },
      ],
      vfx: [
        { kind: "impact-star", at: 0, until: 0.26, x: 1215, y: 590, scale: 0.85, color: GOLD, layer: "front", seed: 2 },
        { kind: "shockwave", at: 0.02, until: 0.7, x: 1260, y: 600, scale: 1.5, color: GOLD, layer: "front" },
        { kind: "debris", at: 0.02, until: 0.95, x: 1230, y: 620, scale: 1.1, color: "#c9b28a", seed: 4, layer: "front" },
        { kind: "sparks", at: 0.02, until: 0.6, x: 1215, y: 590, scale: 1, color: GOLD, seed: 9, layer: "front" },
        { kind: "dust", at: 0.12, until: 1, x: 1260, y: 790, scale: 1.2, layer: "back" },
      ],
      screen: [
        { kind: "two-tone", at: 0, ms: 70, color: GOLD, mode: "full" },
        { kind: "invert", at: 0, ms: 50, mode: "fast" },
        { kind: "flash", at: 0.0, ms: 90, amount: 0.8, color: "#fff4d6", mode: "fast" },
        { kind: "flash", at: 0.11, ms: 110, amount: 0.7, color: "#fff4d6", mode: "full" },
        { kind: "chromatic", at: 0.02, ms: 160, amount: 1 },
        { kind: "radial", at: 0, ms: 240, amount: 1, color: GOLD },
      ],
      stop: [{ at: 0.02, ms: 150 }],
      shake: [
        { at: 0.02, amount: 0.034 },
        { at: 0.32, amount: 0.012 },
      ],
      sound: [
        { at: 0, sfx: "ult-impact" },
        { at: 0.02, sfx: "ult-boom" },
        { at: 0.06, sfx: "impact-metal" },
      ],
      reveal: [{ at: 0.03, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.05, until: 0.85, text: "$damage", x: 0.8, y: 0.3, rotate: -6 },
        { kind: "voice", at: 0.22, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: 0.02, label: "contact" }],
      framing: {
        large: {
          camera: {
            from: { x: 1140, y: 560, zoom: 2.0, rotate: -8 },
            to: { x: 1170, y: 555, zoom: 1.8, rotate: -5 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [980, 800], size: 430, clip: "ult:strike", look: "rim", rim: GOLD, z: 2 },
            {
              role: "target",
              at: [1260, 800],
              size: 440,
              face: -1,
              z: 1,
              react: [{ at: 0.02, clip: "hurt" }],
              shove: { at: 0.02, by: [110, -4] },
              toTilt: 5,
            },
          ],
        },
        boss: {
          camera: {
            from: { x: 1150, y: 500, zoom: 1.5, rotate: -7 },
            to: { x: 1170, y: 490, zoom: 1.36, rotate: -4 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [930, 830], size: 350, clip: "ult:strike", look: "rim", rim: GOLD, z: 2 },
            {
              role: "target",
              at: [1270, 840],
              size: 470,
              face: -1,
              z: 1,
              react: [{ at: 0.02, clip: "hurt" }],
              shove: { at: 0.02, by: [50, 0] },
              toTilt: 2,
            },
          ],
          vfx: [
            { kind: "impact-star", at: 0, until: 0.34, x: 1080, y: 560, scale: 2.4, color: GOLD, layer: "front", seed: 2 },
            { kind: "shockwave", at: 0.02, until: 0.8, x: 1130, y: 560, scale: 4, color: GOLD, layer: "front" },
            { kind: "debris", at: 0.02, until: 0.95, x: 1120, y: 620, scale: 2, color: "#c9b28a", seed: 4, layer: "front" },
            { kind: "sparks", at: 0.02, until: 0.6, x: 1080, y: 560, scale: 2, color: GOLD, seed: 9, layer: "front" },
          ],
        },
      },
    },

    /* 6 · WARD — back on the battlefield: the wards rise over the real party. */
    {
      id: "ward",
      kind: "return",
      purpose:
        "Release. The film hands back to the fight, and what it did is visible where it matters: a ward over every ally.",
      space: "battlefield",
      ms: 760,
      fastMs: 520,
      transition: { kind: "flash", ms: 90 },
      background: "battlefield",
      lighting: { tint: ["#07060a", 0.45], letterbox: BARS },
      toLighting: { tint: ["#07060a", 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:guard" }],
      vfx: [
        { kind: "ward-dome", at: 0.04, until: 1, anchor: "party", stagger: 70, color: GOLD },
        { kind: "motes", at: 0.1, until: 1, anchor: "party", color: GOLD, scale: 0.6 },
      ],
      sound: [
        { at: 0.06, sfx: "ult-ward" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0.08, reveal: "ward" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.08, label: "wards" }],
    },
  ],
};
