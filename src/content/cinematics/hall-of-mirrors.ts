import type { Cinematic } from "../../shared/cinematic";

/**
 * HALL OF MIRRORS — the Beguiler's Ultimate.
 *
 * The idea: the Beguiler never lays a finger on anyone — it shows every enemy
 * its own painted smile on the face beside it, and when it pulls the strings
 * the line turns round and strikes itself, and the mirror the lie was told in
 * breaks.
 *
 * Rhythm: identity (the smile) → stakes and target (the Beguiler in every
 * mirror, the real line among them) → escalation (the smile on every face) →
 * anticipation, quiet (the strings drawn taut in silence) → impact (the yank;
 * the line turned on itself; the lens breaks) → release (the broken glass
 * falls away off the real board, and every real enemy wears the smile).
 *
 * It shares nothing with the other films: no lantern, forge or storm, no
 * charge, ram or bolt, no star or shockwave. Its space is a room of surfaces
 * that lie; its impact is the screen itself breaking; and the Beguiler is
 * never in the same place as its victims — only in their glass.
 *
 * The storyboard is `docs/ultimates/hall-of-mirrors.md`.
 */

const VIOLET = "#c9a3ff";
const GREEN = "#c7f06a";
const PALE = "#f1e8ff";
const NIGHT = "#08050d";
const BARS = 0.11;

export const hallOfMirrors: Cinematic = {
  id: "hall-of-mirrors",
  heroId: "beguiler",
  motif: "hom-motif",
  shots: [
    /* 0 · CALL — the shard comes up, and the glass of the screen cracks. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the Beguiler lifts its mirror to them, the board dims to violet, and a crack runs across the glass you are watching through.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [NIGHT, 0], letterbox: 0 },
      toLighting: { tint: [NIGHT, 0.64], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:lift" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: VIOLET },
        { kind: "hom-crack", at: 0.3, until: 1, anchor: "caster", color: VIOLET, seed: 5 },
      ],
      sound: [{ at: 0, sfx: "hom-call" }],
      duck: [{ at: 0, level: 0.3, ms: 4400 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · SMILE — face close-up: the head goes over, the eye lights. */
    {
      id: "smile",
      kind: "face-close-up",
      purpose:
        "Identity. The face it is about to lend everyone: the porcelain half-mask, the smile too wide, the head tilting past where a neck stops, and the green eye lighting behind it.",
      space: "cinematic",
      ms: 620,
      fastMs: 380,
      transition: { kind: "black", ms: 50 },
      camera: {
        from: { x: 790, y: 430, zoom: 2.55, rotate: 7 },
        to: { x: 800, y: 430, zoom: 2.85, rotate: 4 },
        ease: "out",
      },
      background: "hall-of-mirrors",
      lighting: { exposure: 0.16, under: [GREEN, 0.08], rim: [VIOLET, 0.55, 1], vignette: 0.78, letterbox: BARS },
      toLighting: { exposure: 0.26, under: [GREEN, 0.16], rim: [VIOLET, 0.9, 1], vignette: 0.66, letterbox: BARS },
      actors: [
        { role: "caster", at: [800, 900], size: 760, clip: "ult:smile", then: "ult:smile", look: "rim", rim: VIOLET },
      ],
      vfx: [
        { kind: "hom-eye", at: 0.42, until: 1, follow: "caster", x: 48, y: -481, scale: 0.8, color: GREEN, layer: "front" },
        { kind: "glint", at: 0.1, until: 0.34, follow: "caster", x: -150, y: -560, scale: 0.7, color: VIOLET, layer: "front" },
        { kind: "hom-glitter", at: 0, until: 1, x: 820, y: 420, scale: 0.8, color: VIOLET, seed: 3, layer: "front" },
      ],
      sound: [{ at: 0.42, sfx: "hom-eye" }],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.42, label: "the eye" }],
    },

    /* 2 · HALL — wide: the real line in a room of mirrors, and the Beguiler in all of them. */
    {
      id: "hall",
      kind: "target",
      purpose:
        "Stakes and target. The real enemy line stands in a hall of mirrors and looks round: the Beguiler is not in the room, but it is in every glass.",
      space: "cinematic",
      ms: 900,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1080, y: 470, zoom: 1.18 },
        to: { x: 1010, y: 480, zoom: 1.27, rotate: -1 },
        ease: "inOut",
      },
      background: "hall-of-mirrors",
      lighting: { exposure: 0.5, under: [GREEN, 0.2], back: [VIOLET, 0.3], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.66, under: [GREEN, 0.28], back: [VIOLET, 0.4], vignette: 0.45, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [820, 780],
          spread: [235, -10],
          size: 290,
          face: -1,
          look: "lit",
          z: 2,
          react: [{ at: 0.3, clip: "anticipate", then: "idle" }],
        },
      ],
      vfx: [
        {
          kind: "hom-panes",
          at: 0,
          until: 1,
          x: 1055,
          y: 730,
          layer: "back",
          seed: 29,
          params: { count: 7, gap: 235, w: 190, h: 500, fig: 400, stagger: 0.07 },
        },
        { kind: "hom-glitter", at: 0, until: 1, x: 900, y: 460, scale: 1.8, color: VIOLET, seed: 8, layer: "front" },
      ],
      sound: [
        { at: 0.06, sfx: "hom-motif" },
        { at: 0.45, sfx: "hom-whisper" },
      ],
      text: [
        { kind: "name", at: 0.34, until: 1, text: "$name", x: 0.06, y: 0.22 },
        { kind: "epithet", at: 0.44, until: 1, text: "$epithet", x: 0.06, y: 0.32 },
      ],
      markers: [{ at: 0.34, label: "title" }],
      framing: {
        boss: {
          camera: {
            from: { x: 960, y: 500, zoom: 1.12 },
            to: { x: 910, y: 505, zoom: 1.2, rotate: -1 },
            ease: "inOut",
          },
          actors: [
            {
              role: "target",
              at: [1120, 800],
              size: 290,
              face: -1,
              look: "lit",
              z: 2,
              react: [{ at: 0.3, clip: "anticipate", then: "idle" }],
            },
          ],
        },
      },
    },

    /* 3 · MASKS — Dutch along the line: the smile lands on every face. */
    {
      id: "masks",
      kind: "dutch",
      purpose:
        "Escalation. One after another the porcelain smile is thrown over each enemy, so each one sees the Beguiler in the one beside it — and flinches from it.",
      space: "cinematic",
      ms: 480,
      fastMs: 300,
      transition: { kind: "cut" },
      camera: {
        from: { x: 990, y: 590, zoom: 1.85, rotate: -8 },
        to: { x: 1170, y: 600, zoom: 2.0, rotate: -11 },
        ease: "linear",
      },
      background: "hall-of-mirrors",
      lighting: { exposure: 0.34, under: [GREEN, 0.35], back: [VIOLET, 0.25], vignette: 0.62, letterbox: BARS },
      toLighting: { exposure: 0.28, under: [GREEN, 0.55], back: [VIOLET, 0.35], vignette: 0.7, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [820, 780],
          spread: [235, -10],
          size: 330,
          face: -1,
          look: "lit",
          z: 2,
          react: [{ at: 0.35, clip: "block" }],
        },
      ],
      vfx: [
        { kind: "hom-mask", at: 0.08, until: 1, each: "targets", color: VIOLET, rotate: -8, layer: "front" },
        { kind: "hom-glitter", at: 0, until: 1, x: 1050, y: 560, scale: 1, color: GREEN, seed: 21, layer: "front" },
      ],
      sound: [{ at: 0.06, sfx: "hom-chime" }],
      text: [
        { kind: "name", at: 0.05, until: 1, text: "$name", x: 0.06, y: 0.22, mode: "fast" },
      ],
      markers: [{ at: 0.08, label: "masks" }],
      framing: {
        boss: {
          // Nobody its size beside it: the smile lands on its own reflection.
          camera: {
            from: { x: 1060, y: 590, zoom: 1.3, rotate: -7 },
            to: { x: 1090, y: 595, zoom: 1.38, rotate: -10 },
            ease: "linear",
          },
          actors: [
            { role: "target", at: [860, 850], size: 290, face: -1, look: "lit", z: 2, react: [{ at: 0.35, clip: "block" }] },
          ],
          vfx: [
            {
              kind: "hom-panes",
              at: 0,
              until: 1,
              x: 1320,
              y: 860,
              layer: "back",
              params: { count: 1, w: 340, h: 600, fig: 500, who: "target", masked: true, face: 1, stagger: 0, my: 37, maskAt: 0.12 },
            },
            { kind: "hom-glitter", at: 0, until: 1, x: 1100, y: 560, scale: 1.2, color: GREEN, seed: 21, layer: "front" },
          ],
        },
      },
    },

    /* 4 · STRINGS — detail: silence, and the control drawn back. */
    {
      id: "strings",
      kind: "detail",
      purpose:
        "Anticipation, by subtraction. The music drops out; the long fingers tilt the bar back, the strings draw taut, and the little doll turns once on them.",
      space: "cinematic",
      ms: 520,
      fastMs: 340,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1020, y: 588, zoom: 1.74, rotate: 5 },
        to: { x: 1024, y: 592, zoom: 1.84, rotate: 3 },
        ease: "linear",
      },
      background: "hall-of-mirrors",
      lighting: { exposure: 0.07, back: ["#241536", 0.4], rim: [VIOLET, 0.8, 1], vignette: 0.88, letterbox: 0.15 },
      toLighting: { exposure: 0.05, back: ["#241536", 0.3], rim: [VIOLET, 1, 1], vignette: 0.9, letterbox: 0.15 },
      actors: [
        { role: "caster", at: [800, 900], size: 760, clip: "ult:pull", then: "ult:pull", look: "rim", rim: VIOLET },
      ],
      vfx: [
        { kind: "hom-glitter", at: 0, until: 1, x: 1010, y: 640, scale: 0.7, color: VIOLET, seed: 17, layer: "front", params: { still: true } },
        // The pluck: light runs down the taut string to the doll.
        { kind: "glint", at: 0.8, until: 1, follow: "caster", x: 160, y: -330, scale: 0.55, color: VIOLET, layer: "front" },
      ],
      duck: [{ at: 0, level: 0.06, ms: 520 }],
      sound: [
        { at: 0.08, sfx: "hom-creak" },
        { at: 0.82, sfx: "hom-pluck" },
      ],
      markers: [{ at: 0.82, label: "taut" }],
    },

    /* 5 · TURN — the yank; the line turns on itself; the lens breaks. */
    {
      id: "turn",
      kind: "impact",
      purpose:
        "Impact. The yank, and the glass of the screen breaks — and behind it the line has turned its back on the party: each one lunges into the smiling face in front of it, and each smile breaks as the blow lands.",
      space: "cinematic",
      ms: 760,
      fastMs: 540,
      transition: { kind: "cut" },
      camera: {
        from: { x: 975, y: 590, zoom: 1.62, rotate: 6 },
        to: { x: 1000, y: 585, zoom: 1.46, rotate: 3 },
        ease: "out",
      },
      background: "hall-of-mirrors",
      lighting: { exposure: 0.85, back: [VIOLET, 0.3], under: [GREEN, 0.4], rim: [VIOLET, 1, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.6, back: [VIOLET, 0.35], under: [GREEN, 0.25], rim: [VIOLET, 0.6, 1], vignette: 0.45, letterbox: BARS },
      actors: [
        { role: "caster", at: [600, 890], size: 440, clip: "ult:yank", look: "silhouette", z: 3 },
        {
          role: "targets",
          at: [880, 810],
          spread: [170, -10],
          size: 350,
          face: 1,
          look: "lit",
          z: 2,
          // They go for the face in front of them; the blows land together.
          react: [
            { at: 0.02, clip: "attack" },
            { at: 0.46, clip: "hurt" },
          ],
          shove: { at: 0.46, by: [50, -4] },
          toTilt: 5,
        },
      ],
      vfx: [
        { kind: "hom-glare", at: 0, until: 0.36, x: 900, y: 600, color: VIOLET, layer: "back" },
        { kind: "hom-mask", at: 0, until: 0.46, each: "targets", color: VIOLET, rotate: 8, layer: "front", params: { held: true } },
        { kind: "hom-mask", at: 0.46, until: 0.9, each: "targets", color: VIOLET, rotate: 8, layer: "front", params: { broken: true } },
        { kind: "hom-burst", at: 0.03, until: 0.75, follow: "target", x: 0, y: -170, scale: 1.1, seed: 3, layer: "front" },
        { kind: "hom-burst", at: 0.46, until: 1, each: "targets", x: 60, y: -150, scale: 0.55, seed: 9, layer: "front" },
        { kind: "hom-shatter", at: 0.03, until: 1, layer: "screen", seed: 7, params: { cx: 0.42, cy: 0.5 } },
      ],
      screen: [
        { kind: "two-tone", at: 0, ms: 70, color: VIOLET, mode: "full" },
        { kind: "invert", at: 0, ms: 50, mode: "fast" },
        { kind: "flash", at: 0, ms: 70, amount: 0.4, color: PALE, mode: "fast" },
        { kind: "flash", at: 0.46, ms: 60, amount: 0.25, color: PALE },
        { kind: "chromatic", at: 0.05, ms: 160, amount: 1 },
      ],
      stop: [{ at: 0.04, ms: 140 }],
      shake: [
        { at: 0.04, amount: 0.034 },
        { at: 0.46, amount: 0.02 },
      ],
      sound: [
        { at: 0, sfx: "hom-yank" },
        { at: 0.03, sfx: "hom-impact" },
        { at: 0.46, sfx: "impact-heavy" },
      ],
      reveal: [{ at: 0.04, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.06, until: 0.95, text: "$damage", x: 0.27, y: 0.22, rotate: -6 },
        { kind: "voice", at: 0.5, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.04, label: "contact" },
        { at: 0.46, label: "they strike each other" },
      ],
      framing: {
        boss: {
          // A boss has no one its size to turn on: it turns on the smiling
          // thing in the glass, and the blow goes into nothing.
          camera: {
            from: { x: 1000, y: 545, zoom: 1.34, rotate: 6 },
            to: { x: 1020, y: 540, zoom: 1.24, rotate: 3 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [480, 900], size: 380, clip: "ult:yank", look: "silhouette", z: 3 },
            {
              role: "target",
              at: [870, 860],
              size: 290,
              face: 1,
              look: "lit",
              z: 2,
              react: [
                { at: 0.02, clip: "attack" },
                { at: 0.1, clip: "hurt" },
              ],
              shove: { at: 0.46, by: [40, 0] },
              toTilt: 3,
            },
          ],
          vfx: [
            { kind: "hom-glare", at: 0, until: 0.36, x: 900, y: 600, color: VIOLET, layer: "back" },
            {
              kind: "hom-panes",
              at: 0,
              until: 0.46,
              x: 1320,
              y: 860,
              layer: "back",
              params: { count: 1, w: 340, h: 600, fig: 500, who: "target", masked: true, held: true, face: 1, my: 37, maskAt: -1 },
            },
            {
              kind: "hom-panes",
              at: 0.46,
              until: 1,
              x: 1320,
              y: 860,
              layer: "back",
              params: { count: 1, w: 340, h: 600, fig: 500, who: "target", broken: true, held: true },
            },
            { kind: "hom-burst", at: 0.03, until: 0.75, follow: "target", x: -20, y: -260, scale: 1, seed: 3, layer: "front" },
            { kind: "hom-burst", at: 0.46, until: 1, x: 1320, y: 560, scale: 1.8, seed: 11, layer: "front" },
            { kind: "hom-shatter", at: 0.03, until: 1, layer: "screen", seed: 7, params: { cx: 0.42, cy: 0.5 } },
          ],
        },
      },
    },

    /* 6 · FALL — back on the board: the broken lens falls away; every enemy wears the smile. */
    {
      id: "fall",
      kind: "return",
      purpose:
        "Release. The broken glass falls off the real battlefield piece by piece, the Beguiler bows, and over every real enemy hangs a small crooked smile: this round, they are each other's problem.",
      space: "battlefield",
      ms: 660,
      fastMs: 460,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [NIGHT, 0.45], letterbox: BARS },
      toLighting: { tint: [NIGHT, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:bow" }],
      vfx: [
        { kind: "hom-fall", at: 0, until: 1, layer: "screen", seed: 7, params: { cx: 0.42, cy: 0.52 } },
        { kind: "hom-mask", at: 0.1, until: 1, anchor: "targets", stagger: 60, color: VIOLET, params: { small: true } },
      ],
      sound: [
        { at: 0, sfx: "hom-tinkle" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.1, label: "beguiled" }],
    },
  ],
};
