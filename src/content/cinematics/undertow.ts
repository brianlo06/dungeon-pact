import type { ActorCue, Cinematic, VfxCue } from "../../shared/cinematic";

/**
 * UNDERTOW — the Arcanist · Tidecaller's Ultimate.
 *
 * The idea: the Tidecaller has been holding the whole sea back with one open
 * hand; it pulls the water off the flats where the enemy stands, holds it
 * out at arm's length on the horizon while they stand on the bare seabed,
 * and then lets go, and the loudest moment is seen from under the water that
 * comes back.
 *
 * Rhythm: identity (the open hand over the water's edge, and the sea backing
 * off from it) → stakes and target (the whole flat, the row stranded on the
 * shining sand, the sea going out to the horizon; title) → escalation (the
 * strain: up at the Tidecaller from the sand, the arm shaking, the hat's tip
 * streaming seaward, the horizon banking) → the quiet (the seabed bare,
 * level with the sand: silhouettes, threads of water still draining past
 * their feet, one fish flapping, the line of the sea thickening) → impact
 * (the hand comes down; the sea comes back as a level through the whole
 * frame; the row struck and dragged; the camera goes under the surface) →
 * release (the real board: every enemy standing in water still running out
 * past it; the Tidecaller shaking out its hand).
 *
 * It shares nothing with Debt of Thunder: no rain, no sky seal, no bolt, no
 * chain, no tome, no look under the brim; that film drowns a hall from
 * above, this one empties a shore and refills it from below. Nor with Dry
 * Flood (no spillway, nothing poured, no flood racing downhill), Still Life
 * (nothing frozen), Mourning Water (no still black water, no drop, no hand
 * closing; this water goes out first and drags sideways) or Breakwater (no
 * wave, no crest, no spray, no causeway; the sea comes back as a level, not a
 * breaker, and the film goes under it).
 *
 * The storyboard is `docs/ultimates/undertow.md`; the flats' geometry, shared
 * with the drawing and the water, is `client/ultimates/undertow/flats.ts`.
 */

const COBALT = "#4a7dff";
const FOAM = "#d6e6ff";
const SLATE = "#070a12";
const BARS = 0.11;

/** The row on the flats, watching the water go. */
const stranded = (at: [number, number], size: number, spread: [number, number], look: ActorCue["look"] = "lit", react: ActorCue["react"] = [{ at: 0.2, clip: "anticipate" }, { at: 0.72, clip: "block" }]): ActorCue => ({
  role: "targets",
  at,
  spread,
  size,
  face: -1,
  look,
  z: 2,
  react,
});

/** The row struck by the sea and dragged seaward. */
const struck = (at: [number, number], size: number, spread: [number, number], shove: number, tilt: number): ActorCue => ({
  role: "targets",
  at,
  spread,
  size,
  face: -1,
  look: "lit",
  z: 2,
  react: [
    { at: 0.12, clip: "hurt" },
    { at: 0.5, clip: "hurt" },
  ],
  shove: { at: 0.12, by: [shove, 0] },
  toTilt: tilt,
});

/** The Tidecaller on the beach, letting go. */
const letGo = (size: number): ActorCue => ({ role: "caster", at: [520, 790], size, clip: "ult:tide-release", look: "rim", rim: COBALT, z: 1 });

/** The sea back: the body behind the figures, and the near surface over them. */
const back = (level: number): VfxCue => ({ kind: "tide-return", at: 0, until: 1, layer: "back", seed: 21, params: { band: "back", level } });
const front = (level: number): VfxCue => ({ kind: "tide-return", at: 0, until: 1, layer: "front", seed: 22, params: { band: "front", level } });

export const undertow: Cinematic = {
  id: "undertow",
  heroId: "arcanist",
  motif: "tide-motif",
  shots: [
    /* 0 · CALL — the arm goes out, and the water leaves the fight. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the real Arcanist puts its arm out straight, palm open, and leans back against a pull; a sheet of water slides away from every real enemy's feet and out of the fight, and the board sinks to slate.",
      space: "battlefield",
      ms: 420,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [SLATE, 0], letterbox: 0 },
      toLighting: { tint: [SLATE, 0.6], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:tide-hold" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: COBALT },
        { kind: "tide-drain", at: 0.1, until: 1, anchor: "targets", stagger: 40 },
      ],
      sound: [{ at: 0, sfx: "tide-call" }],
      duck: [{ at: 0, level: 0.3, ms: 4600 }],
      markers: [{ at: 0.5, label: "held" }],
    },

    /* 1 · EDGE — extreme close-up: the open hand over the water's edge, and the sea backing off. */
    {
      id: "edge",
      kind: "extreme-close-up",
      purpose:
        "Identity. The glove over the water's edge at a hand's scale, fingers spread as wide as they go and trembling, the spark a cold point in the palm; the sea's edge backs away from the fingertips, its foam line thinning, the sand it leaves shining and dulling, threads of water running out after it.",
      space: "cinematic",
      ms: 600,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: {
        from: { x: 900, y: 590, zoom: 2.1, rotate: -5 },
        to: { x: 930, y: 585, zoom: 2.3, rotate: -4 },
        ease: "out",
      },
      background: "tide-edge",
      lighting: { exposure: 0.55, under: [COBALT, 0.2], rim: [COBALT, 0.7, 1], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.5, under: [COBALT, 0.1], rim: [COBALT, 0.9, 1], vignette: 0.62, letterbox: BARS },
      actors: [
        { role: "caster", at: [600, 1000], size: 900, clip: "ult:tide-strain", then: "ult:tide-strain", look: "rim", rim: COBALT, root: false },
      ],
      vfx: [{ kind: "tide-edge-water", at: 0, until: 1, layer: "back", seed: 7, params: { reach: 500 } }],
      sound: [
        { at: 0, sfx: "tide-drag" },
        { at: 0.3, sfx: "tide-strain" },
      ],
      text: [{ kind: "voice", at: 0.35, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.1, label: "backing off" }],
    },

    /* 2 · FLATS — wide: the row stranded on the sand, the sea going out to the horizon. */
    {
      id: "flats",
      kind: "wide-hero",
      purpose:
        "Stakes and target. The whole flat from the beach: the Tidecaller at the left with its arm out, the real row out on the shining sand among the mooring posts and the hull, and the sea going out across all of it, its foam line sliding past their feet and away, banking on the horizon.",
      space: "cinematic",
      ms: 880,
      fastMs: 0,
      transition: { kind: "whip", ms: 110, dir: 1 },
      camera: {
        from: { x: 960, y: 640, zoom: 0.98 },
        to: { x: 990, y: 635, zoom: 1.03 },
        ease: "inOut",
      },
      background: "tide-flats",
      lighting: { exposure: 0.72, under: [COBALT, 0.08], back: ["#1a2542", 0.3], rim: [COBALT, 0.6, 1], vignette: 0.42, letterbox: BARS },
      toLighting: { exposure: 0.7, under: [COBALT, 0.06], back: ["#1a2542", 0.35], rim: [COBALT, 0.7, 1], vignette: 0.45, letterbox: BARS },
      actors: [
        { role: "caster", at: [300, 790], size: 300, clip: "ult:tide-strain", then: "ult:tide-strain", look: "rim", rim: COBALT, z: 1 },
        stranded([1000, 800], 300, [220, -14]),
      ],
      vfx: [{ kind: "tide-sea", at: 0, until: 1, layer: "back", seed: 9, params: { from: 0.08, to: 0.62, bank: 0, bankTo: 0.25, ease: "inOut" } }],
      sound: [
        { at: 0.05, sfx: "tide-motif" },
        { at: 0.3, sfx: "tide-drag" },
      ],
      text: [
        { kind: "name", at: 0.34, until: 1, text: "$name", x: 0.07, y: 0.2 },
        { kind: "epithet", at: 0.44, until: 1, text: "$epithet", x: 0.07, y: 0.3 },
      ],
      markers: [{ at: 0.34, label: "title" }],
      framing: {
        large: {
          camera: { from: { x: 1040, y: 610, zoom: 1.0 }, to: { x: 1080, y: 605, zoom: 1.06 }, ease: "inOut" },
          actors: [
            { role: "caster", at: [300, 790], size: 300, clip: "ult:tide-strain", then: "ult:tide-strain", look: "rim", rim: COBALT, z: 1 },
            stranded([1040, 800], 280, [250, -14]),
          ],
        },
        boss: {
          camera: { from: { x: 1080, y: 590, zoom: 0.94 }, to: { x: 1110, y: 585, zoom: 1.0 }, ease: "inOut" },
          actors: [
            { role: "caster", at: [300, 790], size: 300, clip: "ult:tide-strain", then: "ult:tide-strain", look: "rim", rim: COBALT, z: 1 },
            stranded([1120, 810], 260, [280, -14]),
          ],
        },
      },
    },

    /* 3 · STRAIN — low angle: up at the Tidecaller, the arm shaking, the horizon banking. */
    {
      id: "strain",
      kind: "low-angle",
      purpose:
        "Escalation. Up at the Tidecaller from the sand: the arm out straight and shaking, the hat's tip streaming seaward, the hem pulled the same way, the eye-lights; behind it the sea standing up on the horizon where it has been sent.",
      space: "cinematic",
      ms: 460,
      fastMs: 300,
      transition: { kind: "cut" },
      camera: {
        from: { x: 720, y: 490, zoom: 1.6, rotate: 8 },
        to: { x: 735, y: 455, zoom: 1.78, rotate: 11 },
        ease: "in",
      },
      background: "tide-flats",
      lighting: { exposure: 0.5, back: [COBALT, 0.3], rim: [FOAM, 0.8, 1], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.58, back: [COBALT, 0.6], rim: [FOAM, 1, 1], vignette: 0.48, letterbox: BARS },
      actors: [{ role: "caster", at: [700, 985], size: 780, clip: "ult:tide-strain", then: "ult:tide-strain", look: "rim", rim: COBALT }],
      vfx: [{ kind: "tide-sea", at: 0, until: 1, layer: "back", seed: 10, params: { from: 0.62, to: 1, bank: 0.25, bankTo: 0.6 } }],
      sound: [{ at: 0, sfx: "tide-strain" }],
      text: [{ kind: "name", at: 0.05, until: 1, text: "$name", x: 0.07, y: 0.74, mode: "fast" }],
      markers: [{ at: 0.5, label: "the weight" }],
    },

    /* 4 · BARE — the quiet: the seabed bare, level with the sand. */
    {
      id: "bare",
      kind: "target",
      purpose:
        "The quiet. Level with the sand, all but locked: the row in silhouette on the bare seabed, threads of water still draining seaward past their feet, one fish flapping and going still, and the line of the sea on the horizon thickening. Music at 5%.",
      space: "cinematic",
      ms: 520,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1080, y: 700, zoom: 1.32 },
        to: { x: 1090, y: 698, zoom: 1.36 },
        ease: "linear",
      },
      background: "tide-flats",
      lighting: { exposure: 0.36, back: ["#2a3650", 0.5], vignette: 0.6, letterbox: 0.14 },
      toLighting: { exposure: 0.3, back: ["#2a3650", 0.6], vignette: 0.66, letterbox: 0.14 },
      actors: [stranded([1000, 800], 300, [220, -14], "silhouette", [{ at: 0, clip: "anticipate" }])],
      vfx: [
        { kind: "tide-sea", at: 0, until: 1, layer: "back", seed: 11, params: { from: 1, to: 1, bank: 0.6, bankTo: 1 } },
        { kind: "tide-drag", at: 0, until: 1, layer: "back", seed: 13 },
        { kind: "tide-fish", at: 0, until: 1, layer: "front", params: { x: 820, y: 880 } },
        { kind: "tide-foam-wipe", at: 0.84, until: 1, layer: "screen", params: { half: "out" } },
      ],
      duck: [{ at: 0, level: 0.05, ms: 520 }],
      sound: [
        { at: 0.02, sfx: "tide-hush", mode: "full" },
        { at: 0.02, sfx: "tide-hush-fast", mode: "fast" },
      ],
      markers: [{ at: 0.5, label: "bare" }],
      framing: {
        large: {
          actors: [stranded([1060, 810], 280, [250, -14], "silhouette", [{ at: 0, clip: "anticipate" }])],
        },
        boss: {
          camera: { from: { x: 1120, y: 660, zoom: 1.1 }, to: { x: 1130, y: 658, zoom: 1.13 }, ease: "linear" },
          actors: [stranded([1180, 820], 260, [280, -14], "silhouette", [{ at: 0, clip: "anticipate" }])],
        },
      },
    },

    /* 5 · UNDERTOW — the impact: the hand comes down; the sea comes back; under. */
    {
      id: "undertow",
      kind: "impact",
      purpose:
        "Impact. Foam clears off the lens; the Tidecaller's arm drops on the beach at the left and the sea comes back as a level through the whole frame on a cobalt two-tone: foam riding the line, the row struck, dragged seaward and tilted, the target dragged furthest; then the camera goes down under the surface, a bright ceiling overhead, bubbles going up, everything under it dragged towards the deep. The damage on the frame.",
      space: "cinematic",
      ms: 760,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 960, y: 640, zoom: 1.25, rotate: -3 },
        to: { x: 980, y: 880, zoom: 1.45, rotate: -1 },
        ease: "in",
      },
      background: "tide-flats",
      lighting: { exposure: 0.85, under: [COBALT, 0.4], rim: [FOAM, 1, 1], vignette: 0.4, letterbox: BARS },
      toLighting: { exposure: 0.45, under: [COBALT, 0.2], rim: [COBALT, 0.7, 1], vignette: 0.62, letterbox: BARS },
      actors: [letGo(300), struck([1000, 800], 300, [220, -14], 120, 14)],
      vfx: [
        { kind: "tide-foam-wipe", at: 0, until: 0.13, layer: "screen", params: { half: "in" } },
        back(0.55),
        front(0.55),
      ],
      screen: [{ kind: "two-tone", at: 0.12, ms: 70, color: COBALT }],
      stop: [{ at: 0.12, ms: 150 }],
      shake: [
        { at: 0.12, amount: 0.036 },
        { at: 0.45, amount: 0.012 },
      ],
      sound: [
        { at: 0.115, sfx: "tide-impact" },
        { at: 0.42, sfx: "tide-under" },
      ],
      reveal: [{ at: 0.12, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.12, until: 0.95, text: "$damage", x: 0.7, y: 0.2, rotate: -4 },
        { kind: "voice", at: 0.4, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.12, label: "the sea back" },
        { at: 0.45, label: "under" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 1040, y: 630, zoom: 1.12, rotate: -3 },
            to: { x: 1060, y: 820, zoom: 1.28, rotate: -1 },
            ease: "in",
          },
          actors: [letGo(300), struck([1040, 800], 280, [250, -14], 80, 9)],
          vfx: [{ kind: "tide-foam-wipe", at: 0, until: 0.13, layer: "screen", params: { half: "in" } }, back(0.5), front(0.5)],
        },
        boss: {
          camera: {
            from: { x: 1100, y: 600, zoom: 0.98, rotate: -3 },
            to: { x: 1110, y: 720, zoom: 1.06, rotate: -1 },
            ease: "in",
          },
          actors: [letGo(300), struck([1120, 810], 260, [280, -14], 36, 4)],
          vfx: [{ kind: "tide-foam-wipe", at: 0, until: 0.13, layer: "screen", params: { half: "in" } }, back(0.42), front(0.42)],
        },
      },
    },

    /* 6 · EBB — back on the board: everyone standing in water still running out. */
    {
      id: "ebb",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield every enemy stands in water that is still running out past it, seaward streaks and foam at its shins: the Wet, and the Weak. The real Tidecaller lowers its arm and shakes out its hand, and the spark comes back into the glove.",
      space: "battlefield",
      ms: 700,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [SLATE, 0.45], letterbox: BARS },
      toLighting: { tint: [SLATE, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:tide-lower" }],
      vfx: [{ kind: "tide-standing", at: 0, until: 1, anchor: "targets", stagger: 60 }],
      sound: [
        { at: 0.05, sfx: "tide-after" },
        { at: 0.45, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.14, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.3, label: "still running out" }],
    },
  ],
};
