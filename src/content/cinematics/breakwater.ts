import type { Cinematic } from "../../shared/cinematic";

/**
 * BREAKWATER — the Aegis Knight's Ultimate.
 *
 * The idea: the Aegis Knight's shield remembers every blow that ever broke on
 * it; it stands perfectly still while the enemy's whole onslaught comes down
 * on it like a wave, and the wave breaks — and every blow the shield
 * remembers goes back.
 *
 * Gameplay it shows: every ally's next hit drawn onto the Knight (the party
 * untouched behind the shield as the wave breaks; the Knight's mark over each
 * of them after), every enemy Weak (the tide is all of them; a snapped blade
 * over each on the board), a little back to every enemy and the rest to the
 * one it answers.
 *
 * Rhythm: identity (the dents light) → stakes (the tide rises behind the real
 * enemy line) → quiet (the crest hangs over a still silhouette) → impact (it
 * breaks; the Knight does not move) → payback (the blows go back) → release.
 *
 * It shares nothing with the Lantern Wall or the Gatebreaker: its space is
 * neither a hall nor a forge, its camera holds still where theirs travel, it
 * never charges, and its hero is the one thing in the film that does not
 * move when struck. The storyboard is `docs/ultimates/breakwater.md`.
 */

const VERD = "#7fe6c3";
const PALE = "#e8f4ee";
const INK = "#05080a";
const BARS = 0.11;

export const breakwater: Cinematic = {
  id: "breakwater",
  heroId: "vanguard",
  motif: "breakwater-motif",
  shots: [
    /* 0 · CALL — the real Knight sets itself, and the Aegis ripples out. */
    {
      id: "call",
      kind: "call",
      purpose: "The round stops: the Aegis Knight sets its feet and shield where it stands, and the shield's outline ripples out.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [INK, 0], letterbox: 0 },
      toLighting: { tint: [INK, 0.62], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:aegis-set" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: VERD },
        { kind: "breakwater-rings", at: 0.15, until: 1, anchor: "caster", color: VERD },
      ],
      sound: [{ at: 0, sfx: "breakwater-knock" }],
      duck: [{ at: 0, level: 0.3, ms: 4400 }],
      markers: [{ at: 0.42, label: "set" }],
    },

    /* 1 · TALLY — detail: the shield's face, and every dent in it lights. */
    {
      id: "tally",
      kind: "detail",
      purpose:
        "Identity. A shield that remembers: across the Knight's scarred shield the dents light one by one — every blow that ever broke on it — and then all at once.",
      space: "cinematic",
      ms: 660,
      fastMs: 400,
      transition: { kind: "black", ms: 140 },
      camera: {
        from: { x: 905, y: 650, zoom: 2.3, rotate: -4 },
        to: { x: 918, y: 690, zoom: 2.5, rotate: 1 },
        ease: "linear",
      },
      background: "breakwater-causeway",
      lighting: { exposure: 0.2, rim: [PALE, 0.7, 1], vignette: 0.8, letterbox: BARS },
      toLighting: { exposure: 0.26, rim: [VERD, 0.9, 1], vignette: 0.72, letterbox: BARS },
      actors: [
        { role: "caster", at: [800, 860], size: 640, clip: "ult:aegis-hold", then: "ult:aegis-hold", look: "rim", rim: PALE },
      ],
      vfx: [
        { kind: "breakwater-tally", at: 0.02, until: 1, follow: "caster", x: 110, y: -178, color: VERD, layer: "front", seed: 3 },
      ],
      sound: [{ at: 0.04, sfx: "breakwater-tally" }],
      text: [{ kind: "voice", at: 0.4, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.06, label: "first dent" },
        { at: 0.82, label: "all of them" },
      ],
    },

    /* 2 · TIDE — the real enemy line, and the wave of blades rising behind it. */
    {
      id: "tide",
      kind: "target",
      purpose:
        "Stakes. Every enemy at once: the real enemy line braces, and behind it their onslaught rises as one wave of ink and blades, curling towards a small, planted Knight.",
      space: "cinematic",
      ms: 920,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 880, y: 480, zoom: 1.12, rotate: 0 },
        to: { x: 900, y: 470, zoom: 1.2, rotate: -1.5 },
        ease: "inOut",
      },
      background: "breakwater-causeway",
      lighting: { exposure: 0.55, back: [PALE, 0.2], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.68, back: [PALE, 0.3], vignette: 0.45, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [1030, 700],
          spread: [210, -16],
          size: 280,
          face: -1,
          look: "lit",
          z: 2,
          react: [{ at: 0.35, clip: "anticipate", then: "block" }],
        },
        { role: "caster", at: [380, 712], size: 300, clip: "ult:aegis-hold", then: "ult:aegis-hold", look: "rim", rim: VERD, z: 1 },
      ],
      vfx: [
        { kind: "breakwater-tide", at: 0, until: 1, x: 800, y: 710, scale: 0.8, color: VERD, layer: "back", seed: 12, params: { mode: "rise" } },
        { kind: "dust", at: 0.3, until: 1, x: 1150, y: 700, scale: 1.4, layer: "front" },
      ],
      sound: [
        { at: 0, sfx: "breakwater-surge" },
        { at: 0.14, sfx: "breakwater-motif" },
      ],
      text: [
        { kind: "name", at: 0.36, until: 1, text: "$name", x: 0.25, y: 0.74 },
        { kind: "epithet", at: 0.46, until: 1, text: "$epithet", x: 0.25, y: 0.83 },
      ],
      markers: [{ at: 0.36, label: "title" }],
      framing: {
        large: {
          camera: {
            from: { x: 880, y: 460, zoom: 1.02 },
            to: { x: 900, y: 450, zoom: 1.08, rotate: -1.5 },
            ease: "inOut",
          },
          actors: [
            { role: "targets", at: [1060, 720], spread: [220, -14], size: 280, face: -1, look: "lit", z: 2, react: [{ at: 0.35, clip: "anticipate", then: "block" }] },
            { role: "caster", at: [360, 724], size: 290, clip: "ult:aegis-hold", then: "ult:aegis-hold", look: "rim", rim: VERD, z: 1 },
          ],
          vfx: [
            { kind: "breakwater-tide", at: 0, until: 1, x: 790, y: 722, scale: 0.92, color: VERD, layer: "back", seed: 12, params: { mode: "rise" } },
          ],
        },
        boss: {
          camera: {
            from: { x: 870, y: 440, zoom: 0.9 },
            to: { x: 890, y: 430, zoom: 0.95, rotate: -1.5 },
            ease: "inOut",
          },
          actors: [
            { role: "targets", at: [1170, 740], spread: [250, -14], size: 280, face: -1, look: "lit", z: 2, react: [{ at: 0.35, clip: "anticipate", then: "block" }] },
            { role: "caster", at: [330, 744], size: 260, clip: "ult:aegis-hold", then: "ult:aegis-hold", look: "rim", rim: VERD, z: 1 },
          ],
          vfx: [
            { kind: "breakwater-tide", at: 0, until: 1, x: 760, y: 742, scale: 1.05, color: VERD, layer: "back", seed: 12, params: { mode: "rise" } },
          ],
        },
      },
    },

    /* 3 · STILL — the quiet: the crest hangs over a motionless silhouette. */
    {
      id: "still",
      kind: "wide-hero",
      purpose:
        "Anticipation by suspension. The wave has not fallen yet: its crest hangs over the Knight's black silhouette, shards stopped in the air, the sound gone to one note, and nothing moves but the cape.",
      space: "cinematic",
      ms: 560,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: {
        // Held dead still: the one shot in the film where the camera does not move.
        from: { x: 760, y: 404, zoom: 1.02, rotate: -2 },
      },
      background: "breakwater-causeway",
      lighting: { exposure: 0.8, back: [PALE, 0.3], vignette: 0.5, letterbox: 0.15 },
      toLighting: { exposure: 0.7, back: [PALE, 0.4], vignette: 0.58, letterbox: 0.15 },
      actors: [
        { role: "caster", at: [620, 640], size: 320, clip: "ult:aegis-hold", then: "ult:aegis-hold", look: "silhouette" },
      ],
      vfx: [
        { kind: "breakwater-tide", at: 0, until: 1, x: 520, y: 644, scale: 0.72, color: VERD, layer: "back", seed: 12, params: { mode: "hang" } },
      ],
      duck: [{ at: 0, level: 0.06, ms: 560 }],
      sound: [
        { at: 0.02, sfx: "breakwater-hush" },
        { at: 0.8, sfx: "breakwater-grip" },
      ],
      text: [{ kind: "name", at: 0.05, until: 1, text: "$name", x: 0.56, y: 0.3, rotate: -3, mode: "fast" }],
      markers: [{ at: 0.8, label: "the grip" }],
    },

    /* 4 · BREAK — the wave comes down on the shield, and breaks. */
    {
      id: "break",
      kind: "impact",
      purpose:
        "Impact. One two-tone frame, a held stop, and the wave breaks on the shield into a plume of steel — the Knight does not move, and the party behind it is not touched.",
      space: "cinematic",
      ms: 700,
      fastMs: 520,
      transition: { kind: "cut" },
      camera: {
        from: { x: 770, y: 560, zoom: 1.55, rotate: 3 },
        to: { x: 760, y: 570, zoom: 1.42, rotate: 1 },
        ease: "out",
      },
      background: "breakwater-causeway",
      lighting: { exposure: 0.62, tint: [VERD, 0.06], rim: [PALE, 1, 1], vignette: 0.4, letterbox: BARS },
      toLighting: { exposure: 0.48, tint: [VERD, 0], rim: [VERD, 0.7, 1], vignette: 0.5, letterbox: BARS },
      actors: [
        {
          role: "allies",
          at: [520, 820],
          spread: [-160, -8],
          size: 400,
          look: "lit",
          z: 1,
          react: [{ at: 0.05, clip: "block" }],
        },
        { role: "caster", at: [820, 830], size: 560, clip: "ult:aegis-brace", then: "ult:aegis-hold", look: "rim", rim: VERD, z: 3 },
      ],
      vfx: [
        { kind: "breakwater-tide", at: 0, until: 0.9, x: 1170, y: 877, scale: 1, color: VERD, layer: "back", seed: 12, params: { mode: "fall" } },
        { kind: "breakwater-break", at: 0.01, until: 1, x: 1010, y: 730, scale: 1, color: VERD, layer: "front", seed: 7 },
        { kind: "sparks", at: 0.02, until: 0.6, x: 1010, y: 640, scale: 1.2, color: PALE, seed: 9, layer: "front" },
      ],
      screen: [
        { kind: "two-tone", at: 0, ms: 70, color: VERD, mode: "full" },
        { kind: "invert", at: 0, ms: 50, mode: "fast" },
        { kind: "flash", at: 0, ms: 90, amount: 0.8, color: PALE, mode: "fast" },
        { kind: "chromatic", at: 0.02, ms: 160, amount: 1 },
      ],
      stop: [{ at: 0.02, ms: 160 }],
      shake: [
        { at: 0.02, amount: 0.04 },
        { at: 0.3, amount: 0.014 },
      ],
      sound: [
        { at: 0, sfx: "breakwater-break" },
        { at: 0.03, sfx: "ult-boom" },
      ],
      reveal: [{ at: 0.03, reveal: "ward" }],
      text: [{ kind: "voice", at: 0.26, until: 1, text: "$voice.impact" }],
      markers: [{ at: 0.02, label: "break" }],
    },

    /* 5 · RETURN — Dutch: every remembered blow goes back through the line. */
    {
      id: "return",
      kind: "dutch",
      purpose:
        "Payback. The shield punches out and everything it held goes back: heater ripples rolling over the real enemy line, and ahead of them the blows themselves, landing on every enemy — and hardest on the one it answers.",
      space: "cinematic",
      ms: 620,
      fastMs: 420,
      transition: { kind: "whip", ms: 110, dir: 1 },
      camera: {
        from: { x: 910, y: 540, zoom: 1.42, rotate: -8 },
        to: { x: 975, y: 530, zoom: 1.32, rotate: -5 },
        ease: "out",
      },
      background: "breakwater-causeway",
      lighting: { exposure: 0.6, rim: [VERD, 0.9, 1], vignette: 0.45, letterbox: BARS },
      toLighting: { exposure: 0.5, rim: [VERD, 0.7, 1], vignette: 0.5, letterbox: BARS },
      actors: [
        { role: "caster", at: [500, 830], size: 460, clip: "ult:aegis-return", clipAt: 0.14, then: "ult:aegis-return", look: "rim", rim: VERD, z: 2 },
        {
          role: "targets",
          at: [1040, 800],
          spread: [200, -14],
          size: 330,
          face: -1,
          z: 1,
          react: [{ at: 0.24, clip: "hurt" }],
          shove: { at: 0.24, by: [120, -6] },
          toTilt: 8,
        },
      ],
      vfx: [
        { kind: "breakwater-return", at: 0.08, until: 1, x: 640, y: 820, color: VERD, layer: "front", seed: 19 },
        { kind: "breakwater-chip", at: 0.22, until: 0.9, each: "targets", color: VERD, layer: "front", seed: 23 },
        { kind: "breakwater-chip", at: 0.24, until: 0.95, follow: "target", scale: 1.8, color: PALE, layer: "front", seed: 31 },
        { kind: "debris", at: 0.24, until: 1, follow: "target", x: 0, y: -140, scale: 1, color: "#9fb0b4", seed: 5, layer: "front" },
      ],
      screen: [
        { kind: "black", at: 0.2, ms: 40 },
        { kind: "flash", at: 0.22, ms: 90, amount: 0.55, color: PALE },
        { kind: "chromatic", at: 0.24, ms: 140, amount: 0.8 },
      ],
      stop: [{ at: 0.24, ms: 110 }],
      shake: [{ at: 0.24, amount: 0.028 }],
      sound: [{ at: 0, sfx: "breakwater-return" }],
      reveal: [{ at: 0.24, reveal: "impact" }],
      text: [{ kind: "impact", at: 0.26, until: 0.92, text: "$damage", x: 0.74, y: 0.28, rotate: -8 }],
      markers: [{ at: 0.24, label: "answered" }],
      framing: {
        large: {
          camera: {
            from: { x: 970, y: 500, zoom: 1.2, rotate: -7 },
            to: { x: 1010, y: 490, zoom: 1.12, rotate: -5 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [500, 810], size: 420, clip: "ult:aegis-return", clipAt: 0.14, then: "ult:aegis-return", look: "rim", rim: VERD, z: 2 },
            { role: "targets", at: [1090, 800], spread: [230, -12], size: 310, face: -1, z: 1, react: [{ at: 0.24, clip: "hurt" }], shove: { at: 0.24, by: [80, -4] }, toTilt: 5 },
          ],
          vfx: [
            { kind: "breakwater-return", at: 0.08, until: 1, x: 630, y: 800, scale: 1.1, color: VERD, layer: "front", seed: 19 },
            { kind: "breakwater-chip", at: 0.22, until: 0.9, each: "targets", scale: 1.3, color: VERD, layer: "front", seed: 23 },
            { kind: "breakwater-chip", at: 0.24, until: 0.95, follow: "target", scale: 2.2, color: PALE, layer: "front", seed: 31 },
            { kind: "debris", at: 0.24, until: 1, follow: "target", x: 0, y: -180, scale: 1.3, color: "#9fb0b4", seed: 5, layer: "front" },
          ],
        },
        boss: {
          camera: {
            from: { x: 960, y: 450, zoom: 0.94, rotate: -6 },
            to: { x: 990, y: 440, zoom: 0.9, rotate: -4 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [470, 770], size: 330, clip: "ult:aegis-return", clipAt: 0.14, then: "ult:aegis-return", look: "rim", rim: VERD, z: 2 },
            { role: "targets", at: [1150, 770], spread: [250, -12], size: 290, face: -1, z: 1, react: [{ at: 0.24, clip: "hurt" }], shove: { at: 0.24, by: [30, 0] }, toTilt: 2 },
          ],
          vfx: [
            { kind: "breakwater-return", at: 0.08, until: 1, x: 590, y: 770, scale: 1.25, color: VERD, layer: "front", seed: 19 },
            { kind: "breakwater-chip", at: 0.22, until: 0.9, each: "targets", scale: 1.6, color: VERD, layer: "front", seed: 23 },
            { kind: "breakwater-chip", at: 0.24, until: 0.95, follow: "target", scale: 2.8, color: PALE, layer: "front", seed: 31 },
            { kind: "debris", at: 0.24, until: 1, follow: "target", x: 0, y: -260, scale: 1.8, color: "#9fb0b4", seed: 5, layer: "front" },
          ],
        },
      },
    },

    /* 6 · HOLD — back on the board: the Knight's mark over the party, snapped blades over the enemy. */
    {
      id: "hold",
      kind: "return",
      purpose:
        "Release. The film hands back, and what it did is on the board: the Knight's mark over every ally whose next blow is its own, a snapped blade over every enemy, and the Knight still set.",
      space: "battlefield",
      ms: 720,
      fastMs: 500,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [INK, 0.45], letterbox: BARS },
      toLighting: { tint: [INK, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:aegis-stand" }],
      vfx: [
        { kind: "breakwater-rings", at: 0, until: 0.8, anchor: "caster", color: VERD },
        { kind: "breakwater-link", at: 0.06, until: 1, anchor: "allies", stagger: 70, color: VERD },
        { kind: "breakwater-snapped", at: 0.1, until: 1, anchor: "targets", stagger: 50, color: VERD },
      ],
      sound: [
        { at: 0.06, sfx: "breakwater-hold" },
        { at: 0.45, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.06, label: "marks" }],
    },
  ],
};
