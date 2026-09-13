import type { Cinematic } from "../../shared/cinematic";

/**
 * COMMAND PERFORMANCE — the Beguiler · Puppeteer's Ultimate.
 *
 * The idea: the Puppeteer cuts the little wooden doll off its own strings,
 * because it has a real one now; it drops the strings from a marionette
 * theatre's bridge onto one enemy, walks it downstage, hoists it, and swings
 * it like a weight on a line through its own side.
 *
 * Rhythm, a performance's: places (the doll cut loose) → casting (the strings
 * fly from the bridge and stand one real enemy up; title) → blocking (it is
 * walked into its own line in marionette steps) → the held pose, quiet (hoisted
 * off the boards against the lamp, nothing moving but one string) → the swing
 * (yanked down through the line; the drawn frame) → curtain call (the drop
 * curtain rises off the real board: the puppet on its strings in the front,
 * the rest struck).
 *
 * It shares nothing with the Hall of Mirrors, the Open Mind or Eyespot: no
 * glass, mirror, hall, reflection or smile on a face; no maze, needle or mind;
 * no moth, eye, moon or robe. Nobody but the puppet is turned, and it is not
 * doubt that turns it. Its space is a theatre, its light a work lamp, its
 * palette umber, raw board and oxblood under lamp amber; its strings are not
 * a doll dangling on a dark ground but long lines drawn between the real
 * figures, taut, working a real enemy; and its blow is a body used as a
 * weight, in splinters.
 *
 * The storyboard is `docs/ultimates/command-performance.md`.
 */

/** The lamp: the only light in the theatre, and it is warm. */
const AMBER = "#ffb45c";
/** The strings' colour, and the drawn frame's: the one thing in the room that is not wood, cloth or lamplight. */
const CARMINE = "#ff5aa5";
const UMBER = "#140c0a";
const BARS = 0.11;

export const commandPerformance: Cinematic = {
  id: "command-performance",
  heroId: "beguiler",
  motif: "perf-motif",
  shots: [
    /* 0 · CALL — the control goes up, and strings drop onto one real enemy. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the Beguiler lifts its control high as if by the scruff, the board sinks to backstage umber, and three strings drop out of the dark onto the one enemy it has picked.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [UMBER, 0], letterbox: 0 },
      toLighting: { tint: [UMBER, 0.62], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:perf-call" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: CARMINE },
        { kind: "perf-drop", at: 0.25, until: 1, anchor: "targets", params: { mode: "drop" } },
      ],
      sound: [{ at: 0, sfx: "perf-call" }],
      duck: [{ at: 0, level: 0.3, ms: 4600 }],
      markers: [{ at: 0.25, label: "strings" }],
    },

    /* 1 · SNIP — detail: the doll is cut loose. */
    {
      id: "snip",
      kind: "detail",
      purpose:
        "Identity. Close on the mask, the control and the shard: the eye glances down at the little wooden doll, the shard comes up across its strings and cuts it loose, the doll drops out of the frame, and the eye comes back up to you. It has a real one now.",
      space: "cinematic",
      ms: 620,
      fastMs: 400,
      transition: { kind: "black", ms: 50 },
      camera: {
        from: { x: 860, y: 470, zoom: 1.95, rotate: 8 },
        to: { x: 870, y: 462, zoom: 2.12, rotate: 5 },
        ease: "out",
      },
      background: "perf-theatre",
      lighting: { exposure: 0.2, rim: [AMBER, 0.7, -1], vignette: 0.74, letterbox: BARS },
      toLighting: { exposure: 0.26, rim: [AMBER, 0.85, -1], vignette: 0.68, letterbox: BARS },
      actors: [
        { role: "caster", at: [800, 900], size: 760, clip: "ult:perf-snip", then: "ult:perf-snip", look: "rim", rim: AMBER, root: false },
      ],
      vfx: [
        { kind: "perf-snip", at: 0.3, until: 0.9, follow: "caster", x: 176, y: -330, scale: 1.3, layer: "front" },
      ],
      sound: [{ at: 0.03, sfx: "perf-snip" }],
      text: [{ kind: "voice", at: 0.46, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.38, label: "snip" }],
    },

    /* 2 · CASTING — past the Beguiler on the bridge: the strings fly and bite. */
    {
      id: "casting",
      kind: "over-the-shoulder",
      purpose:
        "Stakes and target. Past the Beguiler's shoulder at the bridge rail, down onto the stage where the real enemy line stands: the control is thrown like a line, three strings pay out in long curves and bite into one of them, and it is jerked upright on them while the rest look round.",
      space: "cinematic",
      ms: 940,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 820, y: 520, zoom: 1.0, rotate: -2 },
        to: { x: 850, y: 550, zoom: 1.06, rotate: -1 },
        ease: "inOut",
      },
      background: "perf-theatre",
      lighting: { exposure: 0.62, rim: [AMBER, 0.7, 1], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.7, rim: [AMBER, 0.8, 1], vignette: 0.46, letterbox: BARS },
      actors: [
        { role: "caster", at: [360, 880], size: 820, clip: "ult:perf-cast", then: "ult:perf-cast", look: "rim", rim: AMBER, z: 4 },
        {
          role: "targets",
          at: [940, 870],
          spread: [190, -8],
          size: 230,
          face: -1,
          look: "lit",
          z: 2,
          react: [{ at: 0.4, clip: "anticipate", then: "idle" }],
        },
      ],
      vfx: [
        { kind: "perf-strings", at: 0, until: 1, layer: "front", params: { mode: "cast", from: "bar", face: -1, hook: 0.34, leave: 0.2, width: 2.6 } },
        { kind: "perf-rail", at: 0, until: 1, x: -120, y: 600, layer: "front", params: { w: 900, post: 0.7, thick: 54 } },
      ],
      sound: [
        { at: 0.05, sfx: "perf-motif" },
        { at: 0.33, sfx: "perf-hook" },
      ],
      text: [
        { kind: "name", at: 0.3, until: 1, text: "$name", x: 0.34, y: 0.17 },
        { kind: "epithet", at: 0.4, until: 1, text: "$epithet", x: 0.34, y: 0.27 },
      ],
      markers: [
        { at: 0.34, label: "bite" },
        { at: 0.3, label: "title" },
      ],
      framing: {
        boss: {
          camera: {
            from: { x: 840, y: 500, zoom: 0.96, rotate: -2 },
            to: { x: 860, y: 520, zoom: 1.0, rotate: -1 },
            ease: "inOut",
          },
          actors: [
            { role: "caster", at: [330, 880], size: 800, clip: "ult:perf-cast", then: "ult:perf-cast", look: "rim", rim: AMBER, z: 4 },
            {
              role: "targets",
              at: [960, 880],
              spread: [280, -8],
              size: 230,
              face: -1,
              look: "lit",
              z: 2,
              react: [{ at: 0.4, clip: "anticipate", then: "idle" }],
            },
          ],
        },
      },
    },

    /* 3 · BLOCKING — profile: walked into its own line. */
    {
      id: "blocking",
      kind: "profile",
      purpose:
        "Escalation. Level with the boards, the puppet is walked into its own side in marionette steps: lifted, set down, knees going, head lolling, on strings that come down out of the dark, while the rest of the line shies from it.",
      space: "cinematic",
      ms: 520,
      fastMs: 340,
      transition: { kind: "cut" },
      camera: {
        from: { x: 780, y: 640, zoom: 1.34 },
        to: { x: 880, y: 640, zoom: 1.38 },
        ease: "linear",
      },
      background: "perf-theatre",
      lighting: { exposure: 0.55, back: [AMBER, 0.12], vignette: 0.55, letterbox: BARS },
      toLighting: { exposure: 0.5, back: [AMBER, 0.14], vignette: 0.6, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [480, 860],
          spread: [340, -6],
          size: 320,
          face: 1,
          look: "lit",
          z: 2,
          react: [{ at: 0.4, clip: "block" }],
        },
      ],
      vfx: [
        { kind: "perf-strings", at: 0, until: 1, layer: "front", params: { mode: "walk", face: 1, walk: 0.8, steps: 3, flip: true, fx: 470, fy: -200, fs: 50, width: 3.4 } },
      ],
      sound: [{ at: 0, sfx: "perf-walk" }],
      text: [
        { kind: "name", at: 0.05, until: 1, text: "$name", x: 0.06, y: 0.2, mode: "fast" },
      ],
      markers: [{ at: 0.33, label: "step" }],
      framing: {
        boss: {
          // Too heavy to walk: hauled one step.
          camera: {
            from: { x: 800, y: 600, zoom: 1.0 },
            to: { x: 850, y: 600, zoom: 1.04 },
            ease: "linear",
          },
          actors: [
            {
              role: "targets",
              at: [520, 880],
              spread: [440, -6],
              size: 280,
              face: 1,
              look: "lit",
              z: 2,
              react: [{ at: 0.4, clip: "block" }],
            },
          ],
          vfx: [
            { kind: "perf-strings", at: 0, until: 1, layer: "front", params: { mode: "walk", face: 1, walk: 0.3, steps: 1, flip: true, fx: 520, fy: -300, fs: 90, width: 4 } },
          ],
        },
      },
    },

    /* 4 · HELD — low angle: hoisted off the boards, and nothing moves. */
    {
      id: "held",
      kind: "low-angle",
      purpose:
        "Anticipation, by suspension. The music is gone. From the boards, the puppet hangs hoisted in silhouette against the lamp's pool on the backcloth, feet off the floor, the strings taut out of the top of the frame. Nothing moves but one string, trembling with the weight.",
      space: "cinematic",
      ms: 560,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 590, zoom: 1.62 },
        to: { x: 800, y: 588, zoom: 1.64 },
        ease: "linear",
      },
      background: "perf-theatre",
      lighting: { exposure: 0.1, back: [AMBER, 0.2], vignette: 0.9, letterbox: 0.15 },
      toLighting: { exposure: 0.08, back: [AMBER, 0.2], vignette: 0.92, letterbox: 0.15 },
      actors: [
        { role: "target", at: [800, 900], size: 470, face: 1, look: "silhouette", z: 2, clip: "idle" },
      ],
      vfx: [
        { kind: "perf-lamp", at: 0, until: 1, x: 820, y: 420, layer: "back", params: { rx: 560, ry: 430 } },
        { kind: "motes", at: 0, until: 1, x: 800, y: 420, scale: 1.8, color: AMBER, seed: 5, layer: "back", params: { still: true } },
        { kind: "perf-strings", at: 0, until: 1, layer: "front", params: { mode: "hoist", face: 1, lift: 0.22, tilt: -3, fx: 800, fy: -300, fs: 110, width: 3.6 } },
      ],
      duck: [{ at: 0, level: 0.04, ms: 560 }],
      sound: [{ at: 0.02, sfx: "perf-hush" }],
      markers: [{ at: 0.5, label: "held" }],
      framing: {
        large: {
          camera: {
            from: { x: 800, y: 620, zoom: 1.4 },
            to: { x: 800, y: 618, zoom: 1.42 },
            ease: "linear",
          },
          actors: [{ role: "target", at: [800, 880], size: 330, face: 1, look: "silhouette", z: 2, clip: "idle" }],
          vfx: [
            { kind: "perf-lamp", at: 0, until: 1, x: 820, y: 440, layer: "back", params: { rx: 560, ry: 430 } },
            { kind: "motes", at: 0, until: 1, x: 800, y: 440, scale: 1.8, color: AMBER, seed: 5, layer: "back", params: { still: true } },
            { kind: "perf-strings", at: 0, until: 1, layer: "front", params: { mode: "hoist", face: 1, lift: 0.14, tilt: -3, fx: 800, fy: -300, fs: 130, width: 4 } },
          ],
        },
        boss: {
          // Onto its toes, no further: it fills the frame to the waist.
          camera: {
            from: { x: 800, y: 520, zoom: 1.28 },
            to: { x: 800, y: 518, zoom: 1.3 },
            ease: "linear",
          },
          actors: [{ role: "target", at: [800, 890], size: 290, face: 1, look: "silhouette", z: 2, clip: "idle" }],
          vfx: [
            { kind: "perf-lamp", at: 0, until: 1, x: 820, y: 400, layer: "back", params: { rx: 640, ry: 480 } },
            { kind: "motes", at: 0, until: 1, x: 800, y: 420, scale: 2.2, color: AMBER, seed: 5, layer: "back", params: { still: true } },
            { kind: "perf-strings", at: 0, until: 1, layer: "front", params: { mode: "hoist", face: 1, lift: 0.06, tilt: -2, fx: 800, fy: -400, fs: 160, width: 4.6 } },
          ],
        },
      },
    },

    /* 5 · SWING — the impact: yanked down through its own line. */
    {
      id: "swing",
      kind: "impact",
      purpose:
        "Impact. The yank: on an amber two-tone frame the puppet is swung down out of the dark like a weight on a line and into the enemy beside it, a sheaf of string lines fanned along the arc it came by; it goes on through the rest of the line, each struck as it arrives in a burst of splinters and paint, and hangs. The drop curtain falls.",
      space: "cinematic",
      ms: 800,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 880, y: 560, zoom: 1.28, rotate: 3 },
        to: { x: 900, y: 560, zoom: 1.18, rotate: 1 },
        ease: "out",
      },
      background: "perf-theatre",
      lighting: { exposure: 0.95, back: [AMBER, 0.3], rim: [AMBER, 0.8, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.62, back: [AMBER, 0.2], rim: [AMBER, 0.5, 1], vignette: 0.5, letterbox: BARS },
      actors: [
        { role: "caster", at: [430, 570], size: 240, clip: "ult:perf-yank", look: "silhouette", z: 1 },
        {
          role: "targets",
          at: [700, 860],
          spread: [260, -8],
          size: 320,
          face: 1,
          look: "lit",
          z: 2,
          react: [{ at: 0.04, clip: "hurt" }],
        },
      ],
      vfx: [
        { kind: "perf-lamp", at: 0, until: 1, x: 940, y: 640, layer: "back", params: { rx: 900, ry: 520, hot: true } },
        { kind: "perf-rail", at: 0, until: 1, x: -260, y: 520, layer: "front", params: { w: 820, post: 0.52, thick: 26 } },
        { kind: "perf-strings", at: 0, until: 1, layer: "front", params: { mode: "swing", face: 1, px: 600, py: -800, span: 0.42, contact: 0.04, go: 0.46, fx: 600, fy: -800, fs: 40, width: 3 } },
        { kind: "perf-splinters", at: 0, until: 1, layer: "front", seed: 11, params: { count: 16, size: 300 } },
        { kind: "perf-curtain", at: 0.86, until: 1, layer: "screen", params: { phase: "in" } },
      ],
      screen: [
        { kind: "two-tone", at: 0, ms: 70, color: CARMINE },
        { kind: "chromatic", at: 0.05, ms: 90, amount: 0.35 },
      ],
      stop: [{ at: 0.04, ms: 140 }],
      shake: [
        { at: 0.04, amount: 0.034 },
        { at: 0.24, amount: 0.016 },
      ],
      sound: [
        { at: 0, sfx: "perf-yank" },
        { at: 0.03, sfx: "perf-impact" },
        { at: 0.2, sfx: "perf-knock" },
        { at: 0.84, sfx: "perf-drape" },
      ],
      reveal: [{ at: 0.04, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.05, until: 0.86, text: "$damage", x: 0.62, y: 0.2, rotate: 5 },
        { kind: "voice", at: 0.46, until: 0.86, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.04, label: "contact" },
        { at: 0.46, label: "through the line" },
        { at: 0.86, label: "curtain" },
      ],
      framing: {
        boss: {
          // Too heavy to swing: yanked forward and down by its own weight, onto whatever is beside it.
          camera: {
            from: { x: 850, y: 625, zoom: 1.04, rotate: 3 },
            to: { x: 870, y: 625, zoom: 0.97, rotate: 1 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [330, 560], size: 230, clip: "ult:perf-yank", look: "silhouette", z: 1 },
            {
              role: "targets",
              at: [700, 900],
              spread: [360, -8],
              size: 280,
              face: 1,
              look: "lit",
              z: 2,
              react: [{ at: 0.04, clip: "hurt" }],
            },
          ],
          vfx: [
            { kind: "perf-lamp", at: 0, until: 1, x: 860, y: 560, layer: "back", params: { rx: 1000, ry: 600, hot: true } },
            { kind: "perf-rail", at: 0, until: 1, x: -360, y: 512, layer: "front", params: { w: 820, post: 0.6, thick: 26 } },
            { kind: "perf-strings", at: 0, until: 1, layer: "front", params: { mode: "yank", dir: 1, face: 1, px: 520, py: -900, span: 0.4, contact: 0.04, fx: 520, fy: -900, fs: 70, width: 4 } },
            { kind: "perf-splinters", at: 0, until: 1, layer: "front", seed: 11, params: { count: 18, size: 420 } },
            { kind: "perf-curtain", at: 0.86, until: 1, layer: "screen", params: { phase: "in" } },
          ],
        },
      },
    },

    /* 6 · CURTAIN CALL — the curtain rises off the real board. */
    {
      id: "curtain-call",
      kind: "return",
      purpose:
        "Release. The drop curtain is hauled up off the real battlefield: the Beguiler takes a showman's bow over its control, the puppet stands in the front line still hanging on slack strings from the dark, and splinters burst off every other enemy the swing went through.",
      space: "battlefield",
      ms: 720,
      fastMs: 480,
      transition: { kind: "cut" },
      background: "battlefield",
      lighting: { tint: [UMBER, 0.5], letterbox: BARS },
      toLighting: { tint: [UMBER, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:perf-bow" }],
      vfx: [
        { kind: "perf-curtain", at: 0, until: 0.4, layer: "screen", params: { phase: "out" } },
        { kind: "perf-drop", at: 0, until: 1, anchor: "targets", params: { mode: "hang" } },
        { kind: "perf-splinters", at: 0.12, until: 0.9, anchor: "targets", stagger: 70, seed: 17, params: { count: 12, anchored: true } },
      ],
      sound: [
        { at: 0, sfx: "perf-rise" },
        { at: 0.24, sfx: "perf-after" },
        { at: 0.5, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.3, label: "curtain up" }],
    },
  ],
};
