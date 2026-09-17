import type { Cinematic } from "../../shared/cinematic";

/**
 * EYESPOT — the Beguiler · Illusionist's Ultimate.
 *
 * The idea: the Illusionist's robe is a swarm of moths wearing its shape,
 * every wing painted with its one green eye, so the enemy lunges at the eye
 * it has been watching, the robe bursts into wings around nobody, and the
 * Beguiler, already behind it, cuts it with a sliver of moon.
 *
 * Rhythm, a conjuror's: the pledge (the wink: "keep your eyes on mine") →
 * the turn (the real line watches the Beguiler, and moths open a hundred
 * green eyes all over its robe; title) → quiet (the enemy picks one eye and
 * draws back; nothing moves) → the prestige (it lunges, the robe bursts
 * around nothing, the cut lands from behind) → release (moths over every
 * real enemy's eyes, the target cut and in the front, the Beguiler in a veil
 * of wings).
 *
 * It shares nothing with the Hall of Mirrors or the Open Mind: no glass, no
 * mirror, no hall, no reflection, no smile, no maze, no mind, no strings
 * pulled and nobody turned. It is the one film under a moon, out in the open;
 * its light is cream moonlight, not violet or green; its signature is wings,
 * and its blow is a crescent. The film misdirects its audience as the
 * Beguiler does the enemy: nothing before the impact says the figure in the
 * robe is not the Beguiler but the eye that glances away in the close-up.
 *
 * The storyboard is `docs/ultimates/eyespot.md`.
 */

const MOON = "#f3e7c4";
const NIGHT = "#0b0a1c";
const BARS = 0.11;
/** One swarm: the same moths close the close-up and open the next shot. */
const SWARM = 23;

export const eyespot: Cinematic = {
  id: "eyespot",
  heroId: "beguiler",
  motif: "spot-motif",
  shots: [
    /* 0 · CALL — a pass of the hand, and the hem lifts into wings. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the Beguiler makes a slow pass of its hand across its body and watches the hand, the board sinks to moonlit night, and its tattered hem lifts off into moths that climb round it.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [NIGHT, 0], letterbox: 0 },
      toLighting: { tint: [NIGHT, 0.62], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:spot-call" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: MOON },
        { kind: "spot-moths", at: 0.1, until: 1, anchor: "caster", seed: 4, params: { mode: "rise", count: 12 } },
      ],
      sound: [{ at: 0, sfx: "spot-call" }],
      duck: [{ at: 0, level: 0.3, ms: 4700 }],
      markers: [{ at: 0.1, label: "wings" }],
    },

    /* 1 · WINK — face close-up from below, the moon behind the horns. */
    {
      id: "wink",
      kind: "face-close-up",
      purpose:
        "Identity, and the one tell. From below, the hood's two horns against a moon too big for the sky; the green eye behind the mask glances aside, to where the Beguiler is going to be, comes back to you, and winks. Then a swarm crosses the lens.",
      space: "cinematic",
      ms: 640,
      fastMs: 400,
      transition: { kind: "black", ms: 50 },
      camera: {
        from: { x: 812, y: 432, zoom: 2.8, rotate: -3 },
        to: { x: 818, y: 414, zoom: 3.05, rotate: -1 },
        ease: "out",
      },
      background: "spot-garden",
      lighting: { exposure: 0.42, back: [MOON, 0.16], vignette: 0.72, letterbox: BARS },
      toLighting: { exposure: 0.5, back: [MOON, 0.2], vignette: 0.66, letterbox: BARS },
      actors: [
        { role: "caster", at: [800, 900], size: 760, clip: "ult:spot-wink", then: "ult:spot-wink", look: "lit", root: false },
      ],
      vfx: [
        { kind: "spot-moon", at: 0, until: 1, x: 660, y: 330, layer: "back", params: { size: 300 } },
        { kind: "spot-moths", at: 0, until: 0.8, x: 700, y: 330, layer: "back", seed: 12, params: { mode: "drift", count: 3, size: 900 } },
        { kind: "spot-moths", at: 0.7, until: 1, layer: "screen", seed: SWARM, params: { mode: "swarm", count: 30, phase: "in" } },
      ],
      sound: [
        { at: 0.12, sfx: "spot-wink" },
        { at: 0.72, sfx: "spot-swish" },
      ],
      text: [{ kind: "voice", at: 0.2, until: 0.72, text: "$voice.activation" }],
      markers: [
        { at: 0.13, label: "glance" },
        { at: 0.4, label: "wink" },
      ],
    },

    /* 2 · A HUNDRED EYES — wide: the real line watches, and the robe opens its eyes. */
    {
      id: "eyes",
      kind: "target",
      purpose:
        "Stakes and target. In a moonlit meadow the real enemy line watches the Beguiler, who beckons; moths land all over its robe and open their wings one after another, a hundred green eyes looking back. Which one is it?",
      space: "cinematic",
      ms: 920,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 900, y: 580, zoom: 1.28 },
        to: { x: 870, y: 585, zoom: 1.33 },
        ease: "inOut",
      },
      background: "spot-garden",
      lighting: { exposure: 0.62, back: [MOON, 0.14], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.7, back: [MOON, 0.18], vignette: 0.46, letterbox: BARS },
      actors: [
        { role: "caster", at: [520, 840], size: 340, clip: "ult:spot-beckon", look: "lit", z: 2 },
        {
          role: "targets",
          at: [960, 820],
          spread: [168, -14],
          size: 290,
          face: -1,
          look: "lit",
          z: 2,
          react: [{ at: 0.3, clip: "anticipate", then: "idle" }],
        },
      ],
      vfx: [
        { kind: "spot-moon", at: 0, until: 1, x: 660, y: 330, layer: "back", params: { size: 300 } },
        { kind: "spot-moths", at: 0, until: 0.22, layer: "screen", seed: SWARM, params: { mode: "swarm", count: 30, phase: "out" } },
        { kind: "spot-coat", at: 0, until: 1, follow: "caster", seed: 5, layer: "front", params: { land: true, openAt: 0.34, openSpan: 0.4 } },
      ],
      sound: [
        { at: 0.06, sfx: "spot-motif" },
        { at: 0.34, sfx: "spot-open" },
      ],
      text: [
        { kind: "name", at: 0.22, until: 0.92, text: "$name", x: 0.56, y: 0.2 },
        { kind: "epithet", at: 0.32, until: 0.92, text: "$epithet", x: 0.56, y: 0.3 },
      ],
      markers: [
        { at: 0.34, label: "eyes open" },
        { at: 0.22, label: "title" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 860, y: 560, zoom: 1.16 },
            to: { x: 830, y: 565, zoom: 1.21 },
            ease: "inOut",
          },
          actors: [
            { role: "caster", at: [420, 850], size: 290, clip: "ult:spot-beckon", look: "lit", z: 2 },
            {
              role: "targets",
              at: [1040, 850],
              spread: [230, -14],
              size: 285,
              face: -1,
              look: "lit",
              z: 2,
              react: [{ at: 0.3, clip: "anticipate", then: "idle" }],
            },
          ],
        },
        boss: {
          camera: {
            from: { x: 840, y: 520, zoom: 1.02 },
            to: { x: 820, y: 525, zoom: 1.07 },
            ease: "inOut",
          },
          actors: [
            { role: "caster", at: [380, 860], size: 290, clip: "ult:spot-beckon", look: "lit", z: 2 },
            {
              role: "targets",
              at: [1180, 860],
              spread: [300, -14],
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

    /* 3 · WHICH EYE — over the target's shoulder: the quiet. */
    {
      id: "which",
      kind: "over-the-shoulder",
      purpose:
        "Anticipation, by subtraction. The music is gone. Past the target, a dark shape drawn back to strike, the Beguiler stands covered in open eyes and does not move; the wings close once, slowly, and open. The enemy is choosing.",
      space: "cinematic",
      ms: 600,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: {
        from: { x: 780, y: 610, zoom: 1.78 },
        to: { x: 772, y: 606, zoom: 1.82 },
        ease: "linear",
      },
      background: "spot-garden",
      lighting: { exposure: 0.2, back: [MOON, 0.1], rim: [MOON, 0.5, -1], vignette: 0.9, letterbox: 0.15 },
      toLighting: { exposure: 0.16, back: [MOON, 0.1], rim: [MOON, 0.55, -1], vignette: 0.92, letterbox: 0.15 },
      actors: [
        { role: "caster", at: [600, 800], size: 320, clip: "ult:spot-still", then: "ult:spot-still", look: "lit", z: 1 },
        {
          role: "target",
          at: [1130, 1010],
          size: 640,
          face: -1,
          look: "silhouette",
          z: 3,
          clip: "anticipate",
          then: "anticipate",
        },
      ],
      vfx: [
        { kind: "spot-moon", at: 0, until: 1, x: 660, y: 330, layer: "back", params: { size: 300 } },
        { kind: "spot-moths", at: 0, until: 0.2, layer: "screen", seed: SWARM, params: { mode: "swarm", count: 30, phase: "out" }, mode: "fast" },
        { kind: "spot-coat", at: 0, until: 1, follow: "caster", seed: 5, layer: "front", params: { held: true, breathe: true } },
      ],
      duck: [{ at: 0, level: 0.04, ms: 600 }],
      sound: [{ at: 0.04, sfx: "spot-hush" }],
      text: [{ kind: "name", at: 0.12, until: 1, text: "$name", x: 0.06, y: 0.22, mode: "fast" }],
      markers: [{ at: 0.5, label: "held" }],
      framing: {
        large: {
          camera: {
            from: { x: 780, y: 590, zoom: 1.64 },
            to: { x: 772, y: 586, zoom: 1.68 },
            ease: "linear",
          },
          actors: [
            { role: "caster", at: [580, 800], size: 320, clip: "ult:spot-still", then: "ult:spot-still", look: "lit", z: 1 },
            { role: "target", at: [1160, 1000], size: 560, face: -1, look: "silhouette", z: 3, clip: "anticipate", then: "anticipate" },
          ],
        },
        boss: {
          camera: {
            from: { x: 760, y: 560, zoom: 1.46 },
            to: { x: 752, y: 556, zoom: 1.5 },
            ease: "linear",
          },
          actors: [
            { role: "caster", at: [540, 790], size: 320, clip: "ult:spot-still", then: "ult:spot-still", look: "lit", z: 1 },
            { role: "target", at: [1180, 1000], size: 470, face: -1, look: "silhouette", z: 3, clip: "anticipate", then: "anticipate" },
          ],
        },
      },
    },

    /* 4 · WRONG EYE — the impact: the robe bursts around nobody, and the cut lands from behind. */
    {
      id: "wrong",
      kind: "impact",
      purpose:
        "Impact. On a cream two-tone frame, against a moon the size of the sky, the target has lunged into the robe: it bursts into moths with nobody inside, and behind the target the Beguiler's shard has already cut a crescent across its back. The target is thrown on into the front, and the moths stream away over the line.",
      space: "cinematic",
      ms: 820,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 830, y: 640, zoom: 1.5 },
        to: { x: 800, y: 630, zoom: 1.38 },
        ease: "out",
      },
      background: "spot-garden",
      lighting: { exposure: 0.95, back: [MOON, 0.3], rim: [MOON, 0.8, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.62, back: [MOON, 0.16], rim: [MOON, 0.5, 1], vignette: 0.5, letterbox: BARS },
      actors: [
        { role: "caster", at: [1190, 880], size: 400, face: -1, clip: "ult:spot-cut", look: "lit", z: 3 },
        {
          role: "target",
          at: [900, 860],
          to: [820, 858],
          ease: "out",
          size: 320,
          face: -1,
          look: "lit",
          z: 2,
          react: [
            { at: 0, clip: "attack" },
            { at: 0.06, clip: "hurt" },
          ],
          shove: { at: 0.05, by: [-70, -6] },
          toTilt: -6,
        },
      ],
      vfx: [
        { kind: "spot-moon", at: 0, until: 1, x: 760, y: 560, layer: "back", params: { size: 820 } },
        { kind: "spot-robe", at: 0, until: 1, x: 620, y: 870, layer: "back", seed: 9, params: { size: 300, burstAt: 0.0 } },
        { kind: "spot-cut", at: 0, until: 1, follow: "target", layer: "front", params: { angle: -24 } },
        { kind: "spot-moths", at: 0.3, until: 1, x: 560, y: 740, layer: "front", seed: 31, params: { mode: "stream", count: 16, size: 260 } },
      ],
      screen: [
        { kind: "two-tone", at: 0, ms: 70 },
        { kind: "chromatic", at: 0.05, ms: 140, amount: 0.7 },
      ],
      stop: [{ at: 0.04, ms: 150 }],
      shake: [
        { at: 0.04, amount: 0.032 },
        { at: 0.34, amount: 0.01 },
      ],
      sound: [
        { at: 0, sfx: "spot-cut" },
        { at: 0.03, sfx: "spot-impact" },
        { at: 0.28, sfx: "spot-scatter" },
      ],
      reveal: [{ at: 0.04, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.04, until: 0.95, text: "$damage", x: 0.62, y: 0.2, rotate: 5 },
        { kind: "voice", at: 0.46, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.04, label: "contact" },
        { at: 0.3, label: "the moths go" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 830, y: 610, zoom: 1.32 },
            to: { x: 800, y: 600, zoom: 1.22 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [1110, 890], size: 390, face: -1, clip: "ult:spot-cut", look: "lit", z: 3 },
            {
              role: "target",
              at: [840, 870],
              to: [805, 868],
              ease: "out",
              size: 300,
              face: -1,
              look: "lit",
              z: 2,
              react: [
                { at: 0, clip: "attack" },
                { at: 0.06, clip: "hurt" },
              ],
              shove: { at: 0.05, by: [-45, -4] },
              toTilt: -4,
            },
          ],
        },
        boss: {
          camera: {
            from: { x: 820, y: 560, zoom: 1.12 },
            to: { x: 800, y: 555, zoom: 1.05 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [1130, 900], size: 380, face: -1, clip: "ult:spot-cut", look: "lit", z: 3 },
            {
              role: "target",
              at: [840, 880],
              to: [825, 880],
              ease: "out",
              size: 290,
              face: -1,
              look: "lit",
              z: 2,
              react: [
                { at: 0, clip: "attack" },
                { at: 0.06, clip: "hurt" },
              ],
              shove: { at: 0.05, by: [-25, 0] },
              toTilt: -2,
            },
          ],
          vfx: [
            { kind: "spot-moon", at: 0, until: 1, x: 740, y: 480, layer: "back", params: { size: 1000 } },
            { kind: "spot-robe", at: 0, until: 1, x: 530, y: 880, layer: "back", seed: 9, params: { size: 290, burstAt: 0.0 } },
            { kind: "spot-cut", at: 0, until: 1, follow: "target", layer: "front", params: { angle: -24 } },
            { kind: "spot-moths", at: 0.3, until: 1, x: 530, y: 760, layer: "front", seed: 31, params: { mode: "stream", count: 16, size: 260 } },
          ],
        },
      },
    },

    /* 5 · WINGS — back on the board. */
    {
      id: "wings",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield the Beguiler lowers its shard as if it had never moved, in a slow veil of moths; over every real enemy's eyes a knot of moths flutters, and the target carries a thin crescent where it was cut.",
      space: "battlefield",
      ms: 700,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [NIGHT, 0.5], letterbox: BARS },
      toLighting: { tint: [NIGHT, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:spot-settle" }],
      vfx: [
        { kind: "spot-moths", at: 0, until: 1, anchor: "targets", stagger: 50, seed: 17, params: { mode: "blind", count: 3 } },
        { kind: "spot-cut", at: 0, until: 1, anchor: "targets", params: { scar: true, angle: -24 } },
        { kind: "spot-moths", at: 0, until: 1, anchor: "caster", seed: 19, params: { mode: "veil", count: 6 } },
      ],
      sound: [
        { at: 0.05, sfx: "spot-after" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.1, label: "wings" }],
    },
  ],
};
