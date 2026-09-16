import type { ActorCue, Cinematic, VfxCue } from "../../shared/cinematic";

/**
 * PROOF SHOT — the Ranger · Sharpshooter's Ultimate.
 *
 * The idea, in one sentence: from the far end of the proving range, where
 * the target is no bigger than a thumbnail, the Sharpshooter puts one arrow
 * through the plate hung in front of it, and the second through the hole
 * the first one made.
 *
 * Only the Sharpshooter could have it: "Armour is just a slower target." It
 * traded True shot for Piercing shot and took power, so it is the Ranger
 * that goes through whatever the target is wearing, from as far off as it
 * likes; and its two materials are the two things the path is made of,
 * distance and armour. The space is a range built for proving armour, where
 * plates are hung on iron frames and shot to see whether they hold: a lane
 * of black cinder under a pewter sky, pace lines, holed plates receding,
 * the far end hazed into blue, and a range flag that flies until the wind
 * drops.
 *
 * Rhythm: identity (a pinch of cinder let go from an open hand, taken
 * sideways by the wind) → stakes and distance (the range from the shooting
 * line: the kid side-on with its thumb up at arm's length, and at the far
 * end, the size of the thumbnail, the real target behind its plate; the
 * thumb comes down and the bow comes up; title) → anticipation (the face at
 * full draw: the eyes close, the breath goes out, the eyes open calm, and
 * the string snaps past the cheek twice in one breath) → the quiet (at the
 * far end: the flag drops and hangs still, the target stands unaware behind
 * its plate, and nothing arrives) → impact (the first arrow through the
 * plate and the plate spinning off; the second through the first) → release
 * (the real board: the arrows in the target, the holed plate at its feet,
 * the hole shining; the kid lowers the bow).
 *
 * It shares nothing with the Hundredth Mark (fog, birch wood, sight lines,
 * quarry signs, one arrow's silent flight), False Footing (peat mud at dusk,
 * tracks, a snare, midges) or Sunblind (white roofs, the sun behind the kid,
 * shadows sliding to the row's feet). Its quiet is not an arrow in flight:
 * it is the wind dropping while two arrows are already in the air, unseen.
 *
 * The storyboard, with every shot's purpose, framing and the engine limits it
 * works around, is `docs/ultimates/proof-shot.md`.
 */

const BLUE = "#6a9bff";
const PEWTER = "#aeb6bd";
/** Sky light bounced up off the cinder: cold and faint. */
const BOUNCE = "#8e979f";
const BARS = 0.1;
/** The plate hangs low on its chain, so the shot through its middle finds the target's chest. */
const HANG = 16;
/** Where the arrows go in: fractions of the target's drawn height, forward of and above its ground point. */
const EX = -0.14;
const EY = 0.42;

/* ── The wide ──────────────────────────────────────────────────────────── */

const KID: ActorCue = { role: "caster", at: [330, 880], size: 360, clip: "ult:ps-range", then: "ult:ps-range", look: "lit", z: 3 };
const wideTarget = (at: [number, number], size: number): ActorCue => ({ role: "target", at, size, face: -1, look: "lit", z: 1 });
const wideVfx = (plateX: number, plateScale: number): VfxCue[] => [
  { kind: "ps-plate", at: 0, until: 1, follow: "target", x: plateX, y: 0, scale: plateScale, layer: "back", params: { mode: "hung" } },
  { kind: "ps-streamer", at: 0, until: 1, layer: "back", params: { x: 1421, y: 300, len: 104, w: 13 } },
  { kind: "ps-wind", at: 0, until: 1, layer: "screen", seed: 41, params: { count: 22, o: 0.5 } },
];

/* ── The far end ───────────────────────────────────────────────────────── */

const quietTarget = (at: [number, number], size: number): ActorCue => ({ role: "target", at, size, face: -1, look: "lit", z: 2 });
const quietVfx = (plateX: number): VfxCue[] => [
  { kind: "ps-plate", at: 0, until: 1, follow: "target", x: plateX, y: 0, layer: "front", params: { mode: "hung", stillAt: 0.45, hang: HANG } },
  { kind: "ps-streamer", at: 0, until: 1, layer: "back", seed: 5, params: { x: 1302, y: 414, len: 250, w: 32, dropAt: 0.18 } },
  { kind: "ps-wind", at: 0, until: 1, layer: "screen", seed: 43, params: { count: 20, o: 0.4, stopAt: 0.42 } },
  { kind: "ps-streamer", at: 0, until: 0.26, layer: "screen", seed: 47, params: { wipe: true, mode: "out" } },
];

const struck = (at: [number, number], size: number, shove: [number, number], tilt: number): ActorCue => ({
  role: "target",
  at,
  size,
  face: -1,
  look: "lit",
  z: 2,
  react: [
    { at: 0.06, clip: "hurt" },
    { at: 0.34, clip: "hurt" },
  ],
  shove: { at: 0.06, by: shove },
  tilt: 0,
  toTilt: tilt,
});
/** A speck at the shooting line: the arrival is its `contact`. */
const FAR_KID: ActorCue = { role: "caster", at: [446, 484], size: 98, clip: "ult:ps-after", then: "ult:ps-after", look: "lit", z: 1 };
const proofVfx = (plate: [number, number], plateScale: number): VfxCue[] => [
  { kind: "ps-glare", at: 0, until: 0.5, follow: "target", x: 0, y: 0, layer: "back" },
  { kind: "ps-plate", at: 0, until: 1, x: plate[0], y: plate[1], scale: plateScale, layer: "front", params: { mode: "proof", hit: 0, hang: HANG } },
  { kind: "ps-arrows", at: 0, until: 1, layer: "front", seed: 53, params: { hit1: 0.02, hit2: 0.32, ex: EX, ey: EY } },
  { kind: "ps-streamer", at: 0, until: 1, layer: "back", seed: 5, params: { x: 1302, y: 414, len: 250, w: 32, dropAt: -1 } },
  { kind: "ps-wind", at: 0, until: 1, layer: "screen", seed: 45, params: { count: 14, o: 0.25, still: true } },
];

export const proofShot: Cinematic = {
  id: "proof-shot",
  heroId: "ranger",
  motif: "ps-motif",
  shots: [
    /* 0 · CALL — the light goes pewter; the kid steps back. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the real battlefield goes the grey of an overcast range, the Ranger takes half a pace back and brings the bow up level, pace lines light across the floor in front of its target, and grit blows low across the board.",
      space: "battlefield",
      ms: 420,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [PEWTER, 0], letterbox: 0 },
      toLighting: { tint: [PEWTER, 0.36], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:ps-step", then: "ult:ps-step" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: BLUE },
        { kind: "ps-board", at: 0.08, until: 1, anchor: "targets", params: { mode: "paces" } },
        { kind: "ps-wind", at: 0, until: 1, layer: "screen", seed: 40, params: { count: 18, o: 0.45 } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.06, sfx: "ps-gust" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4680 }],
      markers: [{ at: 0.4, label: "back" }],
    },

    /* 1 · WIND — extreme close-up: a pinch of cinder let go. */
    {
      id: "wind",
      kind: "extreme-close-up",
      purpose:
        "Identity. At hip height on the drawing hand: the glove opens, a pinch of cinder falls from the fingers and is taken sideways by the wind before it reaches the ground. The marksman reads the wind first.",
      space: "cinematic",
      ms: 560,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: {
        from: { x: 770, y: 985, zoom: 1.9, rotate: -5 },
        to: { x: 776, y: 980, zoom: 2.02, rotate: -4 },
        ease: "out",
      },
      background: "ps-lane",
      lighting: { exposure: 0.72, under: [BOUNCE, 0.2], rim: [BLUE, 0.55, 1], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.78, under: [BOUNCE, 0.2], rim: [BLUE, 0.7, 1], vignette: 0.45, letterbox: BARS },
      actors: [{ role: "caster", at: [700, 1250], size: 1000, clip: "ult:ps-wind", then: "ult:ps-wind", look: "lit", root: false }],
      vfx: [
        { kind: "ps-grit", at: 0.3, until: 1, follow: "caster", x: 4, y: -196, layer: "front", seed: 43 },
        { kind: "ps-wind", at: 0, until: 1, layer: "screen", seed: 42, params: { count: 16, o: 0.35 } },
      ],
      sound: [{ at: 0.28, sfx: "ps-grit" }],
      text: [
        { kind: "voice", at: 0.2, until: 1, text: "$voice.activation" },
        { kind: "name", at: 0.36, until: 1, text: "$name", x: 0.06, y: 0.2, mode: "fast" },
      ],
      markers: [{ at: 0.3, label: "let go" }],
    },

    /* 2 · RANGE — wide: the thumb up, and the target the size of its nail. */
    {
      id: "range",
      kind: "wide-hero",
      purpose:
        "Stakes and distance. Wide along the lane from the shooting line: the kid side-on with its arm straight out and its thumb up, and at the far end of the range, the size of the thumbnail, the real target standing behind the last frame's plate with the flag flying over it. The thumb comes down and the bow comes up. Title.",
      space: "cinematic",
      ms: 1000,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 580, zoom: 1.08 },
        to: { x: 830, y: 572, zoom: 1.14 },
        ease: "inOut",
      },
      background: "ps-lane",
      lighting: { exposure: 0.95, under: [BOUNCE, 0.15], rim: [BLUE, 0.4, 1], vignette: 0.25, letterbox: BARS },
      toLighting: { exposure: 0.92, under: [BOUNCE, 0.15], rim: [BLUE, 0.5, 1], vignette: 0.3, letterbox: BARS },
      actors: [KID, wideTarget([1296, 492], 96)],
      vfx: wideVfx(-40, 1),
      sound: [
        { at: 0.04, sfx: "ps-motif" },
        { at: 0.62, sfx: "ps-creak" },
      ],
      text: [
        { kind: "name", at: 0.24, until: 1, text: "$name", x: 0.06, y: 0.2 },
        { kind: "epithet", at: 0.32, until: 1, text: "$epithet", x: 0.06, y: 0.29 },
      ],
      markers: [
        { at: 0.2, label: "thumb" },
        { at: 0.92, label: "drawn" },
      ],
      framing: {
        large: { actors: [KID, wideTarget([1290, 494], 90)], vfx: wideVfx(-50, 1) },
        boss: { actors: [KID, wideTarget([1284, 498], 82)], vfx: wideVfx(-64, 1) },
      },
    },

    /* 3 · BREATH — face close-up: the eyes close, the breath goes out, two looses. */
    {
      id: "breath",
      kind: "face-close-up",
      purpose:
        "Anticipation. Tight on the face over the string at full draw: the eyes narrow, then close; the breath goes out and the mouth shuts; the eyes open calm and clear. Then the string snaps past the cheek, the hand goes to the quiver, and a second arrow is nocked, drawn and loosed in the same breath. The flag's cloth crosses the lens.",
      space: "cinematic",
      ms: 600,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: {
        from: { x: 806, y: 622, zoom: 2.3 },
        to: { x: 798, y: 618, zoom: 2.42 },
        ease: "linear",
      },
      background: "ps-lane",
      lighting: { exposure: 0.55, rim: [BLUE, 0.85, 1], vignette: 0.75, letterbox: 0.14 },
      toLighting: { exposure: 0.4, rim: [BLUE, 1, 1], vignette: 0.85, letterbox: 0.15 },
      actors: [{ role: "caster", at: [700, 1250], size: 1000, clip: "ult:ps-breath", then: "ult:ps-breath", look: "lit", root: false }],
      vfx: [{ kind: "ps-streamer", at: 0.8, until: 1, layer: "screen", seed: 47, params: { wipe: true, mode: "in" } }],
      duck: [{ at: 0, level: 0.12, ms: 600 }],
      sound: [
        { at: 0.16, sfx: "ps-breath" },
        { at: 0, sfx: "ps-loose" },
      ],
      markers: [
        { at: 0.3, label: "eyes shut" },
        { at: 0.66, label: "loose" },
        { at: 0.9, label: "second" },
      ],
    },

    /* 4 · STREAMER — the quiet: the flag drops, and nothing arrives. */
    {
      id: "streamer",
      kind: "target",
      purpose:
        "The quiet. The cloth leaves the lens; at the far end of the range, level and locked off, the target stands unaware behind the plate hung on its frame, the flag on its pole flying over the butt — and then the wind dies: the cloth drops and hangs still, the plate stops swaying, the grit stops in the air, and nothing arrives.",
      space: "cinematic",
      ms: 600,
      fastMs: 400,
      transition: { kind: "cut" },
      camera: { from: { x: 1000, y: 600, zoom: 1.5 } },
      background: "ps-butt",
      lighting: { exposure: 0.7, under: [BOUNCE, 0.12], vignette: 0.4, letterbox: 0.14 },
      toLighting: { exposure: 0.45, under: [BOUNCE, 0.08], vignette: 0.7, letterbox: 0.15 },
      actors: [quietTarget([1100, 840], 420)],
      vfx: quietVfx(-300),
      duck: [{ at: 0, level: 0.03, ms: 600 }],
      sound: [{ at: 0.1, sfx: "ps-settle" }],
      markers: [{ at: 0.5, label: "still" }],
      framing: {
        large: {
          camera: { from: { x: 1000, y: 580, zoom: 1.36 } },
          actors: [quietTarget([1120, 846], 360)],
          vfx: quietVfx(-330),
        },
        boss: {
          camera: { from: { x: 1000, y: 560, zoom: 1.18 } },
          actors: [quietTarget([1160, 852], 270)],
          vfx: quietVfx(-372),
        },
      },
    },

    /* 5 · PROOF — impact: through the plate; then through the first arrow. */
    {
      id: "proof",
      kind: "impact",
      purpose:
        "Impact. On a pewter-and-ink frame the first arrow is already through the plate; then, in colour: the plate knocked off its hook, holed, turning down onto the cinder, and the arrow standing in the target. A beat later the second arrow arrives on the same line, splits the first and stands in the same hole, which shines. Far off at the shooting line, the kid. The damage.",
      space: "cinematic",
      ms: 760,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1000, y: 606, zoom: 1.4, rotate: -4 },
        to: { x: 990, y: 600, zoom: 1.3, rotate: -2 },
        ease: "out",
      },
      background: "ps-butt",
      lighting: { exposure: 1, tint: [PEWTER, 0.1], under: [BOUNCE, 0.15], vignette: 0.25, letterbox: BARS },
      toLighting: { exposure: 0.88, tint: [PEWTER, 0], under: [BOUNCE, 0.15], vignette: 0.35, letterbox: BARS },
      actors: [FAR_KID, struck([1100, 840], 420, [50, -6], 6)],
      vfx: proofVfx([800, 840], 1.06),
      screen: [
        // One drawn frame, over before the stop, so the held frame is the blow in colour (FAST is shorter, so is its frame).
        { kind: "two-tone", at: 0, ms: 40, mode: "full" },
        { kind: "two-tone", at: 0, ms: 30, mode: "fast" },
        { kind: "chromatic", at: 0.32, ms: 90, amount: 0.7 },
      ],
      stop: [
        { at: 0.06, ms: 150 },
        { at: 0.34, ms: 60 },
      ],
      shake: [
        { at: 0.06, amount: 0.03 },
        { at: 0.34, amount: 0.018 },
      ],
      sound: [
        { at: 0.05, sfx: "ps-impact" },
        { at: 0.33, sfx: "ps-second" },
      ],
      reveal: [{ at: 0.06, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.36, until: 0.96, text: "$damage", x: 0.5, y: 0.22, rotate: -4 },
        { kind: "voice", at: 0.55, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.06, label: "through" },
        { at: 0.34, label: "second" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 1000, y: 590, zoom: 1.28, rotate: -4 },
            to: { x: 992, y: 586, zoom: 1.2, rotate: -2 },
            ease: "out",
          },
          actors: [FAR_KID, struck([1120, 846], 360, [38, -5], 5)],
          vfx: proofVfx([790, 846], 1.16),
        },
        boss: {
          camera: {
            from: { x: 1000, y: 566, zoom: 1.12, rotate: -3 },
            to: { x: 992, y: 562, zoom: 1.06, rotate: -1.5 },
            ease: "out",
          },
          actors: [FAR_KID, struck([1160, 852], 270, [24, -3], 3)],
          vfx: proofVfx([788, 852], 1.3),
        },
      },
    },

    /* 6 · PROVED — the real board: the plate on the ground, the arrows in the target. */
    {
      id: "proved",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield, the pewter lifts: the holed plate lies at the target's feet, the two arrows stand in it with the split halves of the first about them, and the hole in its side shines, open. The Ranger lowers the bow and shakes out its drawing hand.",
      space: "battlefield",
      ms: 740,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [PEWTER, 0.3], letterbox: BARS },
      toLighting: { tint: [PEWTER, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:ps-lower" }],
      vfx: [{ kind: "ps-board", at: 0.02, until: 1, anchor: "targets", params: { mode: "proved" } }],
      sound: [
        { at: 0.05, sfx: "ps-after" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.1, label: "proved" }],
    },
  ],
};
