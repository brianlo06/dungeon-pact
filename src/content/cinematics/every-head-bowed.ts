import type { ActorCue, Cinematic, VfxCue } from "../../shared/cinematic";

/**
 * EVERY HEAD BOWED — the Blightcaller's Ultimate (Warden · Blightcaller).
 *
 * The idea, in one sentence: everything that grows turns its face to the
 * Warden's lantern, the only light the party carries — so the Blightcaller
 * lifts it over a field of ripe sunflowers until every head is turned up to
 * it, then sets the lantern down in the dirt, and every head goes down after
 * the light: the whole field bows and blackens at once, and the enemy row
 * standing in it bows with it.
 *
 * Only the Blightcaller could have it. The Warden's drawing carries the one
 * light in the party, on the crook of a sprouting staff; its class is growth;
 * its path is "growth, pointed the other way", and its Blight is a rot that
 * takes a whole row. Growth reaches for light. This film grows nothing on
 * the enemy: it takes the light down, and growth follows.
 *
 * The space is the late field: ripe sunflowers in drilled rows after
 * sundown, under a heavy starless overcast with one rust band where the sun
 * went down, lit by nothing but the lantern. Soot, sunflower gold, the
 * lantern's amber, and the blight — seed black with a mould-white bloom.
 *
 * Rhythm: identity (from among the stalks: the lantern rises, the nearest
 * heads turn up to it) → stakes and target (the field, wide: the light swung
 * once, every head tracking it, the enemy row standing among them; title) →
 * the quiet (the face under the lantern's light; the brow softens, then
 * sets; the light slides down off it; the crickets stop) → impact (the
 * lantern's foot in the dirt: every head down at once, black; the row bowed
 * with them, blighted; the damage) → release (the real board: the row hung
 * with blight, a dead head drooping at each one's feet).
 *
 * It shares nothing with the Warden's other films: no roots, web, heartbeat
 * or eyes opening (Green Reckoning); no tear, cupped hand, closing fist or
 * black water (Mourning Water); no antler, bone, graft or white sky (Living
 * Bone). The healing hand does nothing; the staff and its lantern do it all.
 *
 * The storyboard is `docs/ultimates/every-head-bowed.md`.
 */

const LAMP = "#ffc15a";
const TARNISH = "#d9a13c";
const SOOT = "#1a1712";
const BARS = 0.11;

/** A band of the field, laid out against the frame that shoots it. */
const field = (set: string, band: "back" | "front", frame: string, extra: Record<string, number | string> = {}): VfxCue => ({
  kind: "bowed-field",
  at: 0,
  until: 1,
  layer: band,
  params: { set, band, frame, ...extra },
});

/** The row, struck: hurt on the contact, pushed down and bowed forward towards the lantern. */
const bowedRow = (at: [number, number], size: number, spread: [number, number], sink: number, bow: number): ActorCue => ({
  role: "targets",
  at,
  spread,
  size,
  face: -1,
  look: "rim",
  rim: LAMP,
  z: 2,
  react: [
    { at: 0, clip: "anticipate" },
    { at: 0.1, clip: "hurt" },
  ],
  shove: { at: 0.1, by: [-8, sink] },
  tilt: 0,
  toTilt: -bow,
});

const stooping = (at: [number, number], size: number): ActorCue => ({
  role: "caster",
  at,
  size,
  clip: "ult:bowed-down",
  then: "ult:bowed-down",
  look: "rim",
  rim: LAMP,
  z: 3,
});

const watching = (at: [number, number], size: number, spread: [number, number]): ActorCue => ({
  role: "targets",
  at,
  spread,
  size,
  face: -1,
  look: "rim",
  rim: LAMP,
  z: 2,
  react: [{ at: 0.3, clip: "anticipate" }],
});

export const everyHeadBowed: Cinematic = {
  id: "every-head-bowed",
  heroId: "warden",
  motif: "bowed-motif",
  shots: [
    /* 0 · CALL — the round stops; the Warden holds up the light. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round's rhythm: the real battlefield sinks to soot and the bars close; the real Warden lifts its staff until the lantern hangs high over its head, and a pool of lantern light spreads on the floor round it.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [SOOT, 0], letterbox: 0 },
      toLighting: { tint: [SOOT, 0.55], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:bowed-raise", then: "ult:bowed-raise" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: TARNISH },
        { kind: "bowed-board", at: 0, until: 1, anchor: "caster", params: { mode: "call" } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.15, sfx: "bowed-chain" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4200 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · LANTERN — low among the stalks, looking up: the light rises and the heads turn up to it. */
    {
      id: "lantern",
      kind: "low-angle",
      purpose:
        "Identity. From low among the stalks, looking up past huge sunflower heads to the crook: the lantern rises into the frame over the Warden's antlers and steadies, and the nearest heads turn their faces up to follow it. The one light, and growth that follows it.",
      space: "cinematic",
      ms: 620,
      fastMs: 380,
      transition: { kind: "black", ms: 50 },
      camera: {
        from: { x: 770, y: 720, zoom: 2.05, rotate: -7 },
        to: { x: 766, y: 690, zoom: 2.2, rotate: -4 },
        ease: "out",
      },
      background: "bowed-late",
      lighting: { exposure: 0.42, rim: [LAMP, 0.7, -1], vignette: 0.75, letterbox: BARS },
      toLighting: { exposure: 0.5, rim: [LAMP, 0.85, -1], vignette: 0.68, letterbox: BARS },
      actors: [
        { role: "caster", at: [800, 1560], size: 1000, clip: "ult:bowed-lift", then: "ult:bowed-lift", look: "rim", rim: LAMP, root: false },
      ],
      vfx: [
        { kind: "bowed-light", at: 0, until: 1, layer: "back", params: { size: 1300, strength: 1 } },
        field("lift", "back", "420,495,700,394", { radius: 700 }),
        field("lift", "front", "420,495,700,394", { radius: 700 }),
      ],
      sound: [
        { at: 0.05, sfx: "bowed-chain" },
        { at: 0.2, sfx: "bowed-turn" },
      ],
      text: [{ kind: "voice", at: 0.2, until: 0.95, text: "$voice.activation" }],
      markers: [{ at: 0.5, label: "the light up" }],
    },

    /* 2 · FIELD — wide: the light swung once, and the whole field follows it; the row among them. */
    {
      id: "field",
      kind: "wide-hero",
      purpose:
        "Stakes and target. The late field, wide and level: the Warden at the field's edge holds the lantern high and swings it once, and every head in the field tracks the light — and the enemy row, standing among the flowers, lit by the same lantern, turns to it too. Title.",
      space: "cinematic",
      ms: 1000,
      fastMs: 480,
      transition: { kind: "whip", ms: 120, dir: -1 },
      camera: {
        from: { x: 830, y: 480, zoom: 1.04 },
        to: { x: 790, y: 470, zoom: 1.0 },
        ease: "inOut",
      },
      background: "bowed-late",
      lighting: { exposure: 0.55, rim: [LAMP, 0.7, -1], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.6, rim: [LAMP, 0.8, -1], vignette: 0.45, letterbox: BARS },
      actors: [
        { role: "caster", at: [330, 770], size: 290, clip: "ult:bowed-swing", then: "ult:bowed-swing", look: "rim", rim: LAMP, z: 3 },
        watching([1170, 770], 290, [190, -4]),
      ],
      vfx: [
        { kind: "bowed-light", at: 0, until: 1, layer: "back", params: { size: 1500, strength: 0.9 } },
        field("wide", "back", "0,20,1600,900", { radius: 1100 }),
        field("wide", "front", "0,20,1600,900", { radius: 1100 }),
      ],
      sound: [
        { at: 0.02, sfx: "bowed-motif" },
        { at: 0, sfx: "bowed-dusk" },
        { at: 0.18, sfx: "bowed-turn" },
      ],
      text: [
        { kind: "name", at: 0.25, until: 1, text: "$name", x: 0.06, y: 0.72 },
        { kind: "epithet", at: 0.35, until: 1, text: "$epithet", x: 0.06, y: 0.81 },
      ],
      markers: [
        { at: 0.3, label: "swung back" },
        { at: 0.64, label: "swung out" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 840, y: 450, zoom: 0.98 },
            to: { x: 800, y: 440, zoom: 0.94 },
            ease: "inOut",
          },
          actors: [
            { role: "caster", at: [330, 770], size: 280, clip: "ult:bowed-swing", then: "ult:bowed-swing", look: "rim", rim: LAMP, z: 3 },
            watching([1180, 770], 270, [220, -4]),
          ],
        },
        boss: {
          camera: {
            from: { x: 860, y: 400, zoom: 0.9 },
            to: { x: 820, y: 390, zoom: 0.86 },
            ease: "inOut",
          },
          actors: [
            { role: "caster", at: [300, 790], size: 270, clip: "ult:bowed-swing", then: "ult:bowed-swing", look: "rim", rim: LAMP, z: 3 },
            watching([1220, 800], 240, [260, -4]),
          ],
          vfx: [
            { kind: "bowed-light", at: 0, until: 1, layer: "back", params: { size: 1600, strength: 0.9 } },
            field("wide", "back", "-60,-100,1760,990", { radius: 1200 }),
            field("wide", "front", "-60,-100,1760,990", { radius: 1200 }),
          ],
        },
      },
    },

    /* 3 · HUSH — the quiet: the face under the lantern's light, deciding to take it away. */
    {
      id: "hush",
      kind: "face-close-up",
      purpose:
        "The quiet. The face under the hood, lit from above by the lantern: the brow lifts, tender, as over something small; then it knits and sets, a breath goes out under the moustache, and the head bows as the light slides down off the face and is gone. The crickets stop. Nothing else moves.",
      space: "cinematic",
      ms: 620,
      fastMs: 400,
      transition: { kind: "cut" },
      camera: {
        from: { x: 756, y: 476, zoom: 3.0, rotate: 0 },
        to: { x: 758, y: 482, zoom: 3.08, rotate: 0 },
        ease: "linear",
      },
      background: "bowed-late",
      lighting: { exposure: 0.3, rim: [LAMP, 0.55, -1], vignette: 0.86, letterbox: 0.14 },
      toLighting: { exposure: 0.06, rim: [LAMP, 0.05, -1], vignette: 0.94, letterbox: 0.15 },
      actors: [
        { role: "caster", at: [700, 1100], size: 900, clip: "ult:bowed-hush", then: "ult:bowed-hush", look: "rim", rim: LAMP, root: false },
      ],
      vfx: [
        { kind: "bowed-light", at: 0, until: 1, layer: "front", params: { from: "735,330", to: "770,860", slideA: 0.3, slideB: 1, size: 760, strength: 0.75, fadeA: 0.55, fadeB: 1 } },
      ],
      duck: [{ at: 0, level: 0.03, ms: 620 }],
      sound: [{ at: 0.02, sfx: "bowed-hush" }],
      markers: [
        { at: 0.3, label: "tender" },
        { at: 0.55, label: "set" },
        { at: 0.72, label: "the breath" },
      ],
    },

    /* 4 · BOW — impact: the lantern in the dirt, and every head down after it. */
    {
      id: "bow",
      kind: "impact",
      purpose:
        "Impact. Low at the soil down a drilled row: the Warden, large at the left, turns its staff over and sets the lantern's foot in the dirt — and on a two-tone frame every head in the field goes down after the light at once, black, and the enemy row goes down with them: struck, pushed down, bowed forward, blight spreading over its shoulders with a mould-white bloom, seed pouring onto it. The damage on the frame.",
      space: "cinematic",
      ms: 800,
      fastMs: 600,
      transition: { kind: "cut" },
      camera: {
        from: { x: 830, y: 610, zoom: 1.3, rotate: 5 },
        to: { x: 850, y: 600, zoom: 1.24, rotate: 2 },
        ease: "out",
      },
      background: "bowed-late",
      lighting: { exposure: 0.85, rim: [LAMP, 1, -1], under: [LAMP, 0.5], vignette: 0.4, letterbox: BARS },
      toLighting: { exposure: 0.55, rim: [LAMP, 0.85, -1], under: [LAMP, 0.35], vignette: 0.55, letterbox: BARS },
      actors: [stooping([250, 930], 560), bowedRow([1020, 830], 330, [210, -6], 18, 9)],
      vfx: [
        { kind: "bowed-light", at: 0, until: 1, layer: "back", params: { size: 1500, strength: 1, flareAt: 0.1 } },
        field("bow", "back", "190,250,1280,720", { radius: 1400, bowAt: 0.1 }),
        field("bow", "front", "190,250,1280,720", { radius: 1400, bowAt: 0.1 }),
        { kind: "bowed-blight", at: 0, until: 1, layer: "front", params: { at: 0.1, until: 0.75 } },
        { kind: "bowed-seeds", at: 0, until: 1, layer: "front", params: { at: 0.1 } },
      ],
      screen: [{ kind: "two-tone", at: 0.1, ms: 60, color: LAMP }],
      stop: [{ at: 0.1, ms: 150 }],
      shake: [
        { at: 0.1, amount: 0.034 },
        { at: 0.4, amount: 0.01 },
      ],
      sound: [{ at: 0.095, sfx: "bowed-impact" }],
      reveal: [{ at: 0.1, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.1, until: 0.95, text: "$damage", x: 0.72, y: 0.18, rotate: -4 },
        { kind: "voice", at: 0.45, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.1, label: "in the dirt" },
        { at: 0.5, label: "blighted" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 860, y: 580, zoom: 1.2, rotate: 5 },
            to: { x: 880, y: 572, zoom: 1.15, rotate: 2 },
            ease: "out",
          },
          actors: [stooping([250, 930], 540), bowedRow([1040, 840], 300, [240, -6], 12, 6)],
        },
        boss: {
          camera: {
            from: { x: 900, y: 500, zoom: 0.98, rotate: 4 },
            to: { x: 920, y: 492, zoom: 0.94, rotate: 1.5 },
            ease: "out",
          },
          actors: [stooping([250, 960], 520), bowedRow([1130, 880], 290, [280, -6], 8, 4)],
          vfx: [
            { kind: "bowed-light", at: 0, until: 1, layer: "back", params: { size: 1700, strength: 1, flareAt: 0.1 } },
            field("bow", "back", "40,40,1720,968", { radius: 1600, bowAt: 0.1 }),
            field("bow", "front", "40,40,1720,968", { radius: 1600, bowAt: 0.1 }),
            { kind: "bowed-blight", at: 0, until: 1, layer: "front", params: { at: 0.1, until: 0.75 } },
            { kind: "bowed-seeds", at: 0, until: 1, layer: "front", params: { at: 0.1 } },
          ],
        },
      },
    },

    /* 5 · BOWED — the real board: the row hung with blight, a dead head at each one's feet. */
    {
      id: "bowed",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield every enemy of the row is hung with blight on its own drawing — black from the shoulders, lesions blooming mould-white — with a dead black sunflower drooping at its feet and seed dropping: the Poison that keeps going, the row bent Weak. The real Warden brings the staff back up and the lantern swings home.",
      space: "battlefield",
      ms: 760,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [SOOT, 0.45], letterbox: BARS },
      toLighting: { tint: [SOOT, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:bowed-rest" }],
      vfx: [{ kind: "bowed-board", at: 0, until: 1, anchor: "targets", stagger: 90, params: { mode: "after" } }],
      sound: [
        { at: 0.05, sfx: "bowed-after" },
        { at: 0.45, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.15, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.1, label: "bowed" }],
    },
  ],
};
