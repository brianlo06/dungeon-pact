import type { ActorCue, Cinematic, VfxCue } from "../../shared/cinematic";

/**
 * FALSE FOOTING — the Ranger · Pathfinder's Ultimate.
 *
 * The idea, in one sentence: the Pathfinder reads the enemy's own tracks in
 * fresh snow until they say where its next foot will fall, and the snare is
 * already waiting under that exact spot when it does.
 *
 * Only the Pathfinder could have it. The path traded the Ranger's Quarry sign
 * for Snare and its killing shot for knowing the field ("Know the ground and
 * it stops being their ground"), so this film looses no arrow. The kid gets
 * down on one knee, touches a print, looks up the trail, and waits; the enemy
 * walks itself onto what was laid for it, and the kid hauls the cord.
 *
 * The space is the snowfield in the blue hour: fresh snow under a slate sky,
 * low drifts, dry grass through the crust, nothing in it but tracks. It is
 * seen from the tracker's two heights — at eye level with the snow, and from
 * above. Snow blue and dusk ink; the one warm colour, amber, is kept for what
 * the Pathfinder knows: a print it has read, the step it foresaw, its cord.
 *
 * Rhythm: identity (a hand on a print; the rim lights) → escalation and
 * stakes (from above, every trail read up to the enemy, one dashed print
 * past its feet, a snare under it, the cords back to the kid; title) →
 * anticipation (the face: reading, breath clouds, then held, a grin) → the
 * quiet (at the snow in the dark, the enemy walks towards the dashed print;
 * the flakes hang) → impact (the cord rips out of the snow; the noose bites;
 * the enemy's feet go out from under it in a burst of snow) → release (the
 * real board: a snare cinched at every enemy's feet).
 *
 * It shares nothing with the Hundredth Mark: no wood, no fog, no lines from
 * an arrowhead, no quarry signs, no arrow in flight, no glass. Nor with Green
 * Reckoning (nothing under the ground), Mourning Water (no water) or
 * Gatebreaker (no cracks): the ground here is read from on top of it.
 *
 * The storyboard, with every shot's purpose, framing and the engine limits it
 * works around, is `docs/ultimates/false-footing.md`.
 */

const AMBER = "#f2a93b";
const COLD = "#9fb4df";
const DUSK = "#0e1426";
const SNOWLIGHT = "#e3ebf7";
const BARS = 0.1;

/* ── The high wide ─────────────────────────────────────────────────────── */

const trailActors = (targets: [number, number], size: number, spread: [number, number]): ActorCue[] => [
  { role: "caster", at: [300, 840], size: 300, clip: "ult:ff-watch", then: "ult:ff-watch", look: "lit", z: 3 },
  { role: "targets", at: targets, size, face: -1, look: "lit", spread, z: 1, clip: "idle" },
];
const trailVfx = (hy: number): VfxCue[] => [
  { kind: "ff-trail", at: 0.04, until: 1, layer: "back", params: { hx: 0.3, hy, squash: 0.72, bx: 0.86, by: -0.5 } },
  { kind: "ff-flakes", at: 0, until: 1, layer: "screen", seed: 52, params: { count: 26 } },
  { kind: "ff-spray", at: 0, until: 0.2, layer: "screen", seed: 61, params: { mode: "out" } },
];

/* ── The quiet ─────────────────────────────────────────────────────────── */

const stepVfx = (x: number, y: number, size: number): VfxCue[] => [
  { kind: "ff-loop", at: 0, until: 1, x: x + 6, y: y + 8, scale: size / 210, layer: "back", seed: 5, params: { mode: "hidden", squash: 0.26 } },
  { kind: "ff-print", at: 0, until: 1, x, y, layer: "back", params: { ghost: true, size, squash: 0.4, ra: 0.02, rb: 0.3 } },
  { kind: "ff-cord", at: 0, until: 1, layer: "back", params: { ax: -120, ay: y + 34, bx: x - size * 0.55, by: y + 12, sag: 8, cw: size / 260 } },
  { kind: "ff-flakes", at: 0, until: 1, layer: "screen", seed: 55, params: { count: 34, still: true } },
];

/* ── The impact ────────────────────────────────────────────────────────── */

const snared = (at: [number, number], size: number, shove: [number, number], tilt: number): ActorCue => ({
  role: "target",
  at,
  size,
  face: -1,
  look: "lit",
  z: 2,
  react: [{ at: 0.06, clip: "hurt" }],
  shove: { at: 0.06, by: shove },
  // Already going over on the drawn frame: the yank is the cut.
  tilt: tilt * 0.7,
  toTilt: tilt,
});
const HAULER: ActorCue = { role: "caster", at: [370, 830], size: 380, clip: "ult:ff-haul", then: "ult:ff-haul", look: "lit", z: 3 };
const springVfx = (burst: number, loop: number): VfxCue[] => [
  { kind: "ff-cord", at: 0, until: 1, layer: "back", seed: 21, params: { a: "caster", afx: -0.54, afy: 0.29, b: "target", bfx: -0.02, bfy: 0.04, sag: 30, tautat: 0.06, rip: true, cw: 1.2 } },
  { kind: "ff-burst", at: 0, until: 0.95, follow: "target", x: -20, y: 10, scale: burst, seed: 3, layer: "front" },
  { kind: "ff-hobble", at: 0, until: 1, follow: "target", scale: loop, layer: "front" },
];

export const falseFooting: Cinematic = {
  id: "false-footing",
  heroId: "ranger",
  motif: "ff-motif",
  shots: [
    /* 0 · CALL — the round stops; the kid gets down, and prints dent the floor behind every enemy. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the real battlefield goes to blue-hour dusk, the Ranger drops onto one knee with a hand on the floor, and a line of prints dents the floor behind every enemy, lighting towards its feet.",
      space: "battlefield",
      ms: 420,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [DUSK, 0], letterbox: 0 },
      toLighting: { tint: ["#1b2748", 0.45], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:ff-kneel", then: "ult:ff-kneel" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: AMBER },
        { kind: "ff-board", at: 0.1, until: 1, anchor: "targets", stagger: 60, params: { mode: "call" } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.28, sfx: "ff-crunch" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4700 }],
      markers: [{ at: 0.3, label: "down" }],
    },

    /* 1 · READ — extreme close-up: a hand on a print, and its rim lights. */
    {
      id: "read",
      kind: "extreme-close-up",
      purpose:
        "Identity. At the level of the snow, one clawed print fills the bottom of the frame; the kid's hand comes down onto its rim and slides along it, and where it touches the rim lights amber round the whole print — read. Crumbs of snow tip in. Powder is thrown across the lens.",
      space: "cinematic",
      ms: 640,
      fastMs: 400,
      transition: { kind: "black", ms: 50 },
      camera: {
        from: { x: 930, y: 830, zoom: 2.0, rotate: -6 },
        to: { x: 945, y: 840, zoom: 2.2, rotate: -4 },
        ease: "out",
      },
      background: "ff-field",
      lighting: { exposure: 0.55, under: [COLD, 0.25], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.62, under: [COLD, 0.3], vignette: 0.55, letterbox: BARS },
      actors: [{ role: "caster", at: [600, 900], size: 1300, clip: "ult:ff-touch", then: "ult:ff-touch", look: "lit", root: false }],
      vfx: [
        { kind: "ff-print", at: 0, until: 1, x: 950, y: 915, layer: "back", seed: 11, params: { size: 500, squash: 0.46, ra: 0.3, rb: 0.72, crumbs: true } },
        { kind: "ff-spray", at: 0.82, until: 1, layer: "screen", seed: 61, params: { mode: "in" } },
      ],
      sound: [
        { at: 0.12, sfx: "ff-read" },
        { at: 0.8, sfx: "ff-trail", mode: "full" },
      ],
      text: [
        { kind: "voice", at: 0.2, until: 1, text: "$voice.activation" },
        { kind: "name", at: 0.34, until: 1, text: "$name", x: 0.06, y: 0.2, mode: "fast" },
      ],
      markers: [{ at: 0.3, label: "touch" }],
    },

    /* 2 · TRAIL — from above: every trail read, the next step foreseen, the snares, the cords. */
    {
      id: "trail",
      kind: "wide-hero",
      purpose:
        "Escalation and stakes. From above the field: the kid small on one knee at the lower left; the real enemy line standing in the snow; each enemy's trail lights print by print from where it came up to its feet — the target's first — and then one dashed print appears past its feet, where its next step will fall, a noose showing under it and its cord running back across the snow to the kid's hand. Title.",
      space: "cinematic",
      ms: 1000,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 830, y: 470, zoom: 1.12 },
        to: { x: 810, y: 490, zoom: 1.18 },
        ease: "inOut",
      },
      background: "ff-high",
      lighting: { exposure: 0.8, under: [COLD, 0.15], vignette: 0.45, letterbox: BARS },
      toLighting: { exposure: 0.78, under: [COLD, 0.18], vignette: 0.5, letterbox: BARS },
      actors: trailActors([1040, 610], 230, [130, -70]),
      vfx: trailVfx(0.28),
      sound: [
        { at: 0.04, sfx: "ff-motif" },
        { at: 0.46, sfx: "ff-trail" },
      ],
      text: [
        { kind: "name", at: 0.24, until: 1, text: "$name", x: 0.06, y: 0.2 },
        { kind: "epithet", at: 0.32, until: 1, text: "$epithet", x: 0.06, y: 0.29 },
      ],
      markers: [
        { at: 0.24, label: "title" },
        { at: 0.5, label: "next step" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 830, y: 450, zoom: 1.04 },
            to: { x: 815, y: 465, zoom: 1.08 },
            ease: "inOut",
          },
          actors: trailActors([1060, 640], 200, [130, -70]),
          vfx: trailVfx(0.28),
        },
        boss: {
          camera: {
            from: { x: 840, y: 430, zoom: 0.96 },
            to: { x: 825, y: 445, zoom: 1 },
            ease: "inOut",
          },
          actors: trailActors([1090, 690], 170, [130, -70]),
          vfx: trailVfx(0.28),
        },
      },
    },

    /* 3 · KNOW — face close-up: reading, breath clouds, then held; a grin. */
    {
      id: "know",
      kind: "face-close-up",
      purpose:
        "Anticipation. Low behind a drift, the kid's face under the hood: the brow knits and the eyes narrow and glance along the trail; breath clouds go out into the cold, twice — then stop, held; the brow lifts and a slow, sure grin spreads. The cord wound in the fist trembles.",
      space: "cinematic",
      ms: 560,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: {
        from: { x: 770, y: 568, zoom: 2.4 },
        to: { x: 776, y: 574, zoom: 2.55 },
        ease: "linear",
      },
      background: "ff-field",
      lighting: { exposure: 0.4, under: [COLD, 0.35], vignette: 0.75, letterbox: 0.13 },
      toLighting: { exposure: 0.3, under: [COLD, 0.3], vignette: 0.82, letterbox: 0.14 },
      actors: [{ role: "caster", at: [700, 1120], size: 1000, clip: "ult:ff-know", then: "ult:ff-know", look: "lit", root: false }],
      vfx: [
        { kind: "ff-breath", at: 0, until: 1, follow: "caster", x: 70, y: -458, params: { puffs: "0,0.26" } },
        { kind: "ff-drift", at: 0, until: 1, x: 780, y: 718, layer: "front", seed: 71, params: { w: 1400, h: 200 } },
        { kind: "ff-spray", at: 0, until: 0.22, layer: "screen", seed: 61, mode: "fast", params: { mode: "out" } },
      ],
      duck: [{ at: 0, level: 0.12, ms: 560 }],
      sound: [{ at: 0.02, sfx: "ff-breath" }],
      markers: [
        { at: 0.58, label: "held" },
        { at: 0.85, label: "grin" },
      ],
    },

    /* 4 · STEP — the quiet: at the snow, the enemy walks towards the dashed print. */
    {
      id: "step",
      kind: "profile",
      purpose:
        "The quiet. At the level of the snow in near dark, dead still: the dashed print in untouched snow, the noose showing under it, the cord lying slack off to the left — and the real target walking in from the right towards it. The last flakes hang in the air. Nothing else moves.",
      space: "cinematic",
      ms: 600,
      fastMs: 400,
      transition: { kind: "cut" },
      camera: { from: { x: 930, y: 720, zoom: 1.85 } },
      background: "ff-field",
      lighting: { exposure: 0.46, under: [COLD, 0.22], vignette: 0.75, letterbox: 0.15 },
      toLighting: { exposure: 0.34, under: [COLD, 0.16], vignette: 0.85, letterbox: 0.15 },
      actors: [
        { role: "target", at: [1280, 800], to: [1090, 800], ease: "linear", size: 330, face: -1, look: "lit", z: 2, clip: "approach", then: "approach" },
      ],
      vfx: stepVfx(880, 806, 230),
      duck: [{ at: 0, level: 0.03, ms: 600 }],
      sound: [{ at: 0.02, sfx: "ff-hush" }],
      markers: [{ at: 0.6, label: "footfall" }],
      framing: {
        large: {
          camera: { from: { x: 820, y: 640, zoom: 1.4 } },
          actors: [
            { role: "target", at: [1300, 810], to: [1110, 810], ease: "linear", size: 290, face: -1, look: "lit", z: 2, clip: "approach", then: "approach" },
          ],
          vfx: stepVfx(880, 815, 250),
        },
        boss: {
          camera: { from: { x: 840, y: 590, zoom: 1.08 } },
          actors: [
            { role: "target", at: [1330, 830], to: [1150, 830], ease: "linear", size: 250, face: -1, look: "lit", z: 2, clip: "approach", then: "approach" },
          ],
          vfx: stepVfx(870, 836, 300),
        },
      },
    },

    /* 5 · SPRING — the impact: the cord rips up, the noose bites, the feet go. */
    {
      id: "spring",
      kind: "impact",
      purpose:
        "Impact. On a two-tone frame the enemy is a black shape in a white burst of snow with the cord a black line to it; then, held in colour: the kid thrown back on the cord at the left, the cord torn straight up out of the snow along its whole length, the noose shut round the enemy's feet, which are yanked out from under it, and snow boiling up round it. The damage.",
      space: "cinematic",
      ms: 760,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 780, y: 560, zoom: 1.3, rotate: -7 },
        to: { x: 770, y: 552, zoom: 1.22, rotate: -3 },
        ease: "out",
      },
      background: "ff-field",
      lighting: { exposure: 1, tint: [SNOWLIGHT, 0.12], back: [SNOWLIGHT, 0.55], under: [COLD, 0.3], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.66, tint: [SNOWLIGHT, 0], back: [COLD, 0.15], under: [COLD, 0.25], vignette: 0.45, letterbox: BARS },
      actors: [HAULER, snared([1030, 800], 400, [-80, -14], -20)],
      vfx: springVfx(1, 1),
      screen: [
        { kind: "two-tone", at: 0, ms: 40 },
        { kind: "flash", at: 0.1, ms: 70, amount: 0.4, color: SNOWLIGHT },
      ],
      stop: [{ at: 0.06, ms: 150 }],
      shake: [
        { at: 0.06, amount: 0.034 },
        { at: 0.32, amount: 0.012 },
      ],
      sound: [
        { at: 0, sfx: "ff-rip" },
        { at: 0.05, sfx: "ff-impact" },
      ],
      reveal: [{ at: 0.06, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.06, until: 0.95, text: "$damage", x: 0.66, y: 0.2, rotate: -4 },
        { kind: "voice", at: 0.4, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: 0.06, label: "bites" }],
      framing: {
        large: {
          camera: {
            from: { x: 790, y: 520, zoom: 1.16, rotate: -6 },
            to: { x: 780, y: 515, zoom: 1.1, rotate: -2.5 },
            ease: "out",
          },
          actors: [{ ...HAULER, at: [290, 840], size: 340 }, snared([1050, 820], 340, [-50, -6], -10)],
          vfx: springVfx(1.2, 1),
        },
        boss: {
          camera: {
            from: { x: 800, y: 470, zoom: 1.02, rotate: -5 },
            to: { x: 790, y: 465, zoom: 0.97, rotate: -2 },
            ease: "out",
          },
          actors: [{ ...HAULER, at: [300, 810], size: 300 }, snared([1080, 820], 290, [-26, 16], -4)],
          vfx: springVfx(1.5, 0.9),
        },
      },
    },

    /* 6 · SNARED — the real board: a snare cinched at every enemy's feet. */
    {
      id: "snared",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield the Ranger stands and winds the cord in; at every real enemy's feet a noose is cinched tight with a puff of snow and its cord staked off along the floor, one after another — and the target's knotted twice with an amber tag: Marked, and hobbled for two rounds.",
      space: "battlefield",
      ms: 760,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: ["#1b2748", 0.35], letterbox: BARS },
      toLighting: { tint: ["#1b2748", 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:ff-coil" }],
      vfx: [{ kind: "ff-board", at: 0.02, until: 1, anchor: "targets", stagger: 90, params: { mode: "snared" } }],
      sound: [
        { at: 0.04, sfx: "ff-cinch" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.1, label: "snared" }],
    },
  ],
};
