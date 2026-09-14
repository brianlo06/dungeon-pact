import type { Cinematic } from "../../shared/cinematic";

/**
 * ELEGY FOR THE STANDING — the Herald · Dirgesinger's Ultimate.
 *
 * The idea, in one sentence: the Dirgesinger sings an enemy's funeral while it
 * is still standing, and sings it so well that the enemy's own shadow believes
 * it — the shadow lies down in the grave dug for it, and on the last note the
 * earth closes over the shadow and leaves the enemy on its feet with nothing
 * under it.
 *
 * Only the Dirgesinger could have it. The Herald is the one who tells people
 * what they are worth; the Dirgesinger says it in the past tense. Its banner
 * dips the way colours are dipped to the dead, its lilac flag is the colour of
 * half-mourning, and its laurel is what is laid on a grave. The song is never
 * drawn: it is seen in what it does to the one it is for.
 *
 * Gameplay it shows: the enemy mourned (Vulnerable for three rounds, Weak for
 * two, 12 through armour, revealed as the earth goes in) and the party's
 * griefs laid down with it (a laurel leaf settling on every real ally).
 *
 * Rhythm: identity (the open face closing over the song; a laurel leaf comes
 * loose) → stakes (the graveside: the Herald and the real party mourning the
 * real enemy, which is alive and looking at them, while its shadow lies down
 * note by note; title) → quiet (at the head of the grave, on the ground: the
 * shadow laid out towards the lens, the leaf on it, the enemy tiny at its
 * feet) → impact (the negative; the banner driven in as a stake; the earth
 * thrown in) → release (the board: the enemy standing on a fresh grave).
 *
 * It shares nothing with Anthem of the Unpaid or Into the Din: no horn, no
 * ribbons, no rings of sound, no strokes of noise, no ridge at dusk, no field
 * between the lines; no gold, no rose, no bone-and-sable heraldry. Nor with
 * Mourning Water (no tear, no water) or Still Life (nothing held, no prints).
 * The storyboard is `docs/ultimates/elegy-for-the-standing.md`.
 */

const LILAC = "#c6b4e8";
const PEWTER = "#24262b";
const PALE = "#ecebe3";
const BONE = "#efe9dc";
const BARS = 0.1;

/**
 * The graveside and the burial, laid out from probed positions (world units).
 * `STAKE` is where the banner's point goes into the ground on the held frame,
 * which is where the shadow's head is laid.
 */
const WIDE = { caster: [470, 840] as [number, number], target: [1250, 770] as [number, number], reach: 790 };
const BURY = {
  caster: [430, 830] as [number, number],
  target: [1210, 820] as [number, number],
  /** The head of the grave, where the banner's point goes in (probed). */
  stake: 470,
  /** The earth is thrown in from here rightwards, clear of the singer. */
  earth: 560,
};

export const elegyForTheStanding: Cinematic = {
  id: "elegy-for-the-standing",
  heroId: "herald",
  motif: "elegy-motif-a",
  shots: [
    /* 0 · CALL — someone has started a funeral in the middle of the fight. */
    {
      id: "call",
      kind: "call",
      purpose:
        "The round stops for a funeral: the real battlefield sinks to pewter grey, the Herald bows its head and dips its colours, and behind the real enemy its own shadow stands up out of the floor, its full height, and begins to lean.",
      space: "battlefield",
      ms: 420,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [PEWTER, 0], letterbox: 0 },
      toLighting: { tint: [PEWTER, 0.55], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:elegy-dip" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: LILAC },
        { kind: "elegy-board", at: 0.12, until: 1, anchor: "targets", params: { mode: "rise" } },
      ],
      sound: [{ at: 0, sfx: "elegy-hum" }],
      duck: [{ at: 0, level: 0.3, ms: 4600 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · SUNG — face close-up: the open face closes over the song. */
    {
      id: "sung",
      kind: "face-close-up",
      purpose:
        "Identity. The face the Herald is drawn with — open, earnest, the one that tells you what you're worth — looks down at what it has to sing: the brows lift at the middle, the eyes shut, the mouth rounds on the first note. A leaf of its laurel comes loose and falls past its face.",
      space: "cinematic",
      ms: 660,
      fastMs: 400,
      transition: { kind: "black", ms: 80 },
      camera: {
        from: { x: 826, y: 388, zoom: 2.35 },
        to: { x: 832, y: 398, zoom: 2.5 },
        ease: "out",
      },
      background: "elegy-ground",
      lighting: { exposure: 0.5, rim: [LILAC, 0.55, 1], vignette: 0.55, letterbox: BARS },
      toLighting: { exposure: 0.42, rim: [LILAC, 0.7, 1], vignette: 0.6, letterbox: BARS },
      actors: [
        { role: "caster", at: [760, 1040], size: 1000, clip: "ult:elegy-sing", then: "ult:elegy-sing", look: "lit", rim: LILAC, root: false },
      ],
      vfx: [
        { kind: "elegy-leaf", at: 0, until: 1, x: 812, y: 328, scale: 0.62, layer: "front", params: { from: 0.3, fall: 300, sway: 34, drift: -70 } },
      ],
      sound: [{ at: 0.02, sfx: "elegy-motif-a" }],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.34, label: "leaf" },
        { at: 0.5, label: "sung" },
      ],
    },

    /* 2 · GRAVESIDE — wide: the party mourns an enemy who is still alive. */
    {
      id: "graveside",
      kind: "wide-hero",
      purpose:
        "Stakes. The burying ground: the Herald at the head of an open grave with its colours dipped, singing, and the real party behind it with their heads bowed — for the real enemy standing at the grave's foot, alive and looking at them. Its shadow stands up behind it and, note by note, is laid down full length in the grave.",
      space: "cinematic",
      ms: 920,
      fastMs: 520,
      camera: {
        from: { x: 790, y: 560, zoom: 1.3 },
        to: { x: 804, y: 566, zoom: 1.37 },
        ease: "inOut",
      },
      background: "elegy-ground",
      lighting: { exposure: 0.8, rim: [LILAC, 0.35, 1], vignette: 0.4, letterbox: BARS },
      toLighting: { exposure: 0.72, rim: [LILAC, 0.45, 1], vignette: 0.45, letterbox: BARS },
      actors: [
        {
          role: "target",
          at: WIDE.target,
          size: 300,
          face: -1,
          look: "lit",
          z: 2,
          react: [{ at: 0.5, clip: "anticipate", then: "idle" }],
        },
        { role: "caster", at: WIDE.caster, size: 380, clip: "ult:elegy-mourn", then: "ult:elegy-mourn", look: "lit", rim: LILAC, z: 3 },
        {
          role: "allies",
          at: [300, 730],
          spread: [105, -8],
          size: 270,
          look: "lit",
          z: 1,
          clip: "ult:elegy-bow",
          then: "ult:elegy-bow",
        },
      ],
      vfx: [
        { kind: "elegy-shadow", at: 0, until: 1, layer: "back", params: { mode: "lay", rise: 0.14, notes: "0.04,0.42,0.7", stages: "-20,-54,-90", reach: WIDE.reach } },
      ],
      sound: [{ at: 0.04, sfx: "elegy-motif-b" }],
      text: [
        { kind: "name", at: 0.24, until: 1, text: "$name", x: 0.05, y: 0.13, rotate: -2 },
        { kind: "epithet", at: 0.34, until: 1, text: "$epithet", x: 0.05, y: 0.23 },
      ],
      markers: [
        { at: 0.2, label: "leans" },
        { at: 0.46, label: "falls" },
        { at: 0.72, label: "laid" },
      ],
      // A heavy thing, and a boss, is stood further off and the camera pulled
      // back, so it is whole in the frame with its grave long enough for it.
      framing: {
        large: {
          camera: { from: { x: 830, y: 540, zoom: 1.2 }, to: { x: 844, y: 546, zoom: 1.26 }, ease: "inOut" },
          actors: [
            { role: "target", at: [1320, 780], size: 260, face: -1, look: "lit", z: 2, react: [{ at: 0.5, clip: "anticipate", then: "idle" }] },
            { role: "caster", at: WIDE.caster, size: 370, clip: "ult:elegy-mourn", then: "ult:elegy-mourn", look: "lit", rim: LILAC, z: 3 },
            { role: "allies", at: [300, 730], spread: [105, -8], size: 260, look: "lit", z: 1, clip: "ult:elegy-bow", then: "ult:elegy-bow" },
          ],
          vfx: [
            { kind: "elegy-shadow", at: 0, until: 1, layer: "back", params: { mode: "lay", rise: 0.14, notes: "0.04,0.42,0.7", stages: "-20,-54,-90", reach: 800 } },
          ],
        },
        boss: {
          camera: { from: { x: 880, y: 500, zoom: 1.04 }, to: { x: 894, y: 508, zoom: 1.09 }, ease: "inOut" },
          actors: [
            { role: "target", at: [1360, 800], size: 230, face: -1, look: "lit", z: 2, react: [{ at: 0.5, clip: "anticipate", then: "idle" }] },
            { role: "caster", at: [430, 870], size: 350, clip: "ult:elegy-mourn", then: "ult:elegy-mourn", look: "lit", rim: LILAC, z: 3 },
            { role: "allies", at: [280, 760], spread: [100, -8], size: 250, look: "lit", z: 1, clip: "ult:elegy-bow", then: "ult:elegy-bow" },
          ],
          vfx: [
            { kind: "elegy-shadow", at: 0, until: 1, layer: "back", params: { mode: "lay", rise: 0.14, notes: "0.04,0.42,0.7", stages: "-20,-54,-90", reach: 760 } },
          ],
        },
      },
    },

    /* 3 · LAID OUT — the quiet: the grave from its head, on the ground. */
    {
      id: "laid-out",
      kind: "low-angle",
      purpose:
        "The quiet. On the ground at the head of the grave: the shadow laid out full length towards the lens with the laurel leaf on it, and at its feet, tiny against the white sky, the enemy it belongs to, still standing. Nothing moves but a little earth running off the lip.",
      space: "cinematic",
      ms: 600,
      fastMs: 380,
      camera: {
        from: { x: 800, y: 600, zoom: 1.75 },
        to: { x: 800, y: 603, zoom: 1.78 },
        ease: "linear",
      },
      background: "elegy-ground",
      lighting: { exposure: 0.46, back: [PALE, 0.2], vignette: 0.85, letterbox: 0.13 },
      toLighting: { exposure: 0.24, back: [PALE, 0.16], vignette: 0.92, letterbox: 0.14 },
      actors: [{ role: "target", at: [800, 540], size: 130, face: -1, look: "silhouette", z: 2 }],
      vfx: [
        { kind: "elegy-quiet", at: 0, until: 1, layer: "back", params: { fx: 800, fy: 540, fw: 90, ny: 900, nw: 520 } },
        { kind: "elegy-shadow", at: 0, until: 1, layer: "back", params: { mode: "quiet", leafX: 740, leafY: 860, leafScale: 2.2, persp: 620, tilt: -55, sx: 1.45, sy: 6.2 } },
      ],
      duck: [{ at: 0, level: 0.03, ms: 600 }],
      sound: [{ at: 0.1, sfx: "elegy-trickle" }],
      markers: [{ at: 0.5, label: "still" }],
      // A bigger figure stands further off at the grave's far end, and its
      // shadow is not stretched as far: the frame keeps both whole.
      framing: {
        large: {
          actors: [{ role: "target", at: [800, 520], size: 110, face: -1, look: "silhouette", z: 2 }],
          vfx: [
            { kind: "elegy-quiet", at: 0, until: 1, layer: "back", params: { fx: 800, fy: 520, fw: 100, ny: 900, nw: 520 } },
            { kind: "elegy-shadow", at: 0, until: 1, layer: "back", params: { mode: "quiet", leafX: 740, leafY: 860, leafScale: 2.2, persp: 620, tilt: -55, sx: 1.3, sy: 5.2 } },
          ],
        },
        boss: {
          camera: { from: { x: 800, y: 590, zoom: 1.6 }, to: { x: 800, y: 593, zoom: 1.63 }, ease: "linear" },
          actors: [{ role: "target", at: [800, 470], size: 82, face: -1, look: "lit", z: 2 }],
          vfx: [
            { kind: "elegy-quiet", at: 0, until: 1, layer: "back", params: { fx: 800, fy: 472, fw: 120, ny: 900, nw: 540 } },
            { kind: "elegy-shadow", at: 0, until: 1, layer: "back", params: { mode: "quiet", leafX: 740, leafY: 860, leafScale: 2.2, persp: 660, tilt: -55, sx: 1.2, sy: 4.2 } },
          ],
        },
      },
    },

    /* 4 · BURIED — impact: the last note, and the earth goes in. */
    {
      id: "buried",
      kind: "impact",
      purpose:
        "Impact. The negative: one frame of black with every figure in bone, the shadow and its enemy one shape joined at the feet. Then colour, held: the Herald sings the last note at the sky with its banner driven point first into the ground at the shadow's head, the earth on both sides thrown in over the whole length of the shadow, and the enemy dragged down by its feet. Damage, Vulnerable and Weak land here.",
      space: "cinematic",
      ms: 780,
      fastMs: 560,
      camera: {
        from: { x: 860, y: 640, zoom: 1.55, rotate: -6 },
        to: { x: 875, y: 628, zoom: 1.38, rotate: -2 },
        ease: "out",
      },
      background: "elegy-ground",
      lighting: { exposure: 1, tint: [BONE, 0.14], rim: [LILAC, 0.9, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.62, tint: [BONE, 0], rim: [LILAC, 0.6, 1], vignette: 0.45, letterbox: BARS },
      actors: [
        {
          role: "target",
          at: BURY.target,
          size: 420,
          face: -1,
          z: 2,
          react: [{ at: 0.048, clip: "hurt" }],
          shove: { at: 0.05, by: [10, 34] },
          toTilt: -11,
        },
        { role: "caster", at: BURY.caster, size: 470, clip: "ult:elegy-close", then: "ult:elegy-planted", look: "lit", rim: LILAC, z: 3 },
      ],
      vfx: [
        { kind: "elegy-shadow", at: 0, until: 1, layer: "back", params: { mode: "lay", laid: 1, reach: BURY.stake, bury: 0.06 } },
        { kind: "elegy-clods", at: 0.06, until: 1, layer: "front", seed: 12, params: { x0: BURY.earth, y: BURY.target[1], rise: 420, life: 0.62, count: 90, heap: 230 } },
        { kind: "dust", at: 0.06, until: 0.8, x: 930, y: 845, scale: 3, color: "#3a2b22", seed: 5, layer: "back" },
        { kind: "elegy-negative", at: 0, until: 0.2, layer: "screen", params: { ms: 44 } },
      ],
      stop: [{ at: 0.1, ms: 150 }],
      shake: [
        { at: 0.062, amount: 0.042 },
        { at: 0.3, amount: 0.014 },
      ],
      sound: [
        { at: 0.058, sfx: "elegy-earth" },
        { at: 0.07, sfx: "ult-boom" },
      ],
      reveal: [{ at: 0.06, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.07, until: 0.9, text: "$damage", x: 0.7, y: 0.22, rotate: 4 },
        { kind: "voice", at: 0.36, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: 0.06, label: "contact" }],
      // A boss is framed, not shrunk: the camera pulls back, the singer is
      // smaller against it, and the grave and the earth run its whole length.
      framing: {
        large: {
          camera: { from: { x: 890, y: 620, zoom: 1.4, rotate: -5 }, to: { x: 902, y: 610, zoom: 1.26, rotate: -2 }, ease: "out" },
          actors: [
            { role: "target", at: [1260, 820], size: 380, face: -1, z: 2, react: [{ at: 0.048, clip: "hurt" }], shove: { at: 0.05, by: [8, 26] }, toTilt: -8 },
            { role: "caster", at: BURY.caster, size: 440, clip: "ult:elegy-close", then: "ult:elegy-planted", look: "lit", rim: LILAC, z: 3 },
          ],
          vfx: [
            { kind: "elegy-shadow", at: 0, until: 1, layer: "back", params: { mode: "lay", laid: 1, reach: BURY.stake, bury: 0.06 } },
            { kind: "elegy-clods", at: 0.06, until: 1, layer: "front", seed: 12, params: { x0: BURY.earth, y: 820, rise: 440, life: 0.62, count: 96, heap: 250 } },
            { kind: "dust", at: 0.06, until: 0.8, x: 950, y: 845, scale: 3, color: "#3a2b22", seed: 5, layer: "back" },
            { kind: "elegy-negative", at: 0, until: 0.2, layer: "screen", params: { ms: 44 } },
          ],
        },
        boss: {
          camera: { from: { x: 900, y: 580, zoom: 1.08, rotate: -4 }, to: { x: 914, y: 572, zoom: 1, rotate: -1.5 }, ease: "out" },
          actors: [
            { role: "target", at: [1330, 840], size: 260, face: -1, z: 2, react: [{ at: 0.048, clip: "hurt" }], shove: { at: 0.05, by: [6, 20] }, toTilt: -5 },
            { role: "caster", at: [420, 880], size: 400, clip: "ult:elegy-close", then: "ult:elegy-planted", look: "lit", rim: LILAC, z: 3 },
          ],
          vfx: [
            { kind: "elegy-shadow", at: 0, until: 1, layer: "back", params: { mode: "lay", laid: 1, reach: 460, bury: 0.06 } },
            { kind: "elegy-clods", at: 0.06, until: 1, layer: "front", seed: 12, params: { x0: 560, x1: 1290, y: 840, rise: 520, life: 0.62, count: 110, heap: 300 } },
            { kind: "dust", at: 0.06, until: 0.8, x: 980, y: 866, scale: 3.6, color: "#3a2b22", seed: 5, layer: "back" },
            { kind: "elegy-negative", at: 0, until: 0.2, layer: "screen", params: { ms: 44 } },
          ],
        },
      },
    },

    /* 5 · MOURNED — back on the board. */
    {
      id: "mourned",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield, what it did is where it matters: the real enemy standing on a fresh grave with its shadow sunk in it, a laurel leaf settling on every real ally in turn, and the Herald lifting its banner out of the earth.",
      space: "battlefield",
      ms: 720,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [PEWTER, 0.45], letterbox: BARS },
      toLighting: { tint: [PEWTER, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:elegy-rest" }],
      vfx: [
        { kind: "elegy-board", at: 0, until: 1, anchor: "targets", params: { mode: "grave" } },
        { kind: "elegy-board", at: 0.1, until: 1, anchor: "party", stagger: 110, params: { mode: "laurel" } },
      ],
      sound: [
        { at: 0.06, sfx: "elegy-settle" },
        { at: 0.45, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.06, label: "mourned" }],
    },
  ],
};
