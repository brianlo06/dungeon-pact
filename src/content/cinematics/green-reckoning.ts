import type { Cinematic } from "../../shared/cinematic";

/**
 * GREEN RECKONING — the Warden's Ultimate.
 *
 * The idea, in one sentence: the Warden, whose eyes are always shut, lays its
 * healing hand on the ground and listens down one web of roots to every heart
 * on the field — and when it opens its eyes, the same roots answer all of them
 * at once: sap to the party, rot to everything else.
 *
 * Only the Warden could have it. Its eyes are drawn closed, so the one time
 * they open is the event. Its hand is the one that heals and its heal is
 * Mending roots; its poison is Briar prison. The Ultimate's two halves — the
 * party healed, lifted and cleansed; every enemy poisoned — are one gesture
 * here, one root system, and the Warden decides what flows down each thread.
 *
 * The space is the ground under the fight, cut away: a moss crust for a
 * floor, black air under old roots above it, loam and the bones of old fights
 * below it, drawn in front of every foot. Loam brown, bone, sap green, and
 * rot — black plum with ochre spores.
 *
 * Rhythm: identity (the hand laid on the earth, roots running down out of the
 * palm) → stakes (under the floor, one web reaching every ally's heart — one
 * faint — and every enemy's feet; title) → the quiet (the face: eyes shut,
 * listening; music gone) → impact (the eyes open: sap and rot burst up through
 * the floor at once) → release (leaves and rot on the real board). The quiet
 * face is directly before the loudest shot, and its last frames are the eyes
 * opening, so the impact is a look as much as a blow.
 *
 * It shares nothing with the other films: no plant with light in floor
 * cracks, no hall, forge, sky, wood, causeway or mirrors, no charge, arrow or
 * bolt; its signature is growth through earth seen from the side, its quiet is
 * a shut-eyed face listening, and it is the only film that goes underground.
 *
 * The storyboard, with every shot's purpose and the engine limits it works
 * around, is `docs/ultimates/green-reckoning.md`.
 */

const SAP = "#9be38a";
const HOT = "#effbe0";
const LOAM = "#0c0805";
const BARS = 0.1;

export const greenReckoning: Cinematic = {
  id: "green-reckoning",
  heroId: "warden",
  motif: "green-motif",
  shots: [
    /* 0 · CALL — the round stops; roots creep along the real floor to every unit. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round's rhythm: the real battlefield sinks into loam-dark, the Warden bows its head and lowers the open hand, and roots creep along the floor from it to every unit, a heartbeat ring under each.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [LOAM, 0], letterbox: 0 },
      toLighting: { tint: [LOAM, 0.55], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:green-listen", then: "ult:green-listen" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: SAP },
        { kind: "green-board", at: 0, until: 1, anchor: "caster", params: { mode: "listen" } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.25, sfx: "green-heart" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4200 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · HAND — detail: the open hand laid on the moss, roots pouring down out of the palm. */
    {
      id: "hand",
      kind: "detail",
      purpose:
        "Identity. The hand that heals, put into the ground: the Warden goes down on one knee and lays its open palm on the moss, and roots pour down out of it into the earth under the floor.",
      space: "cinematic",
      ms: 600,
      fastMs: 380,
      transition: { kind: "black", ms: 50 },
      camera: {
        from: { x: 640, y: 470, zoom: 2.3, rotate: -6 },
        to: { x: 660, y: 490, zoom: 2.55, rotate: -3 },
        ease: "out",
      },
      background: "green-undergrowth",
      lighting: { exposure: 0.4, under: [SAP, 0.3], rim: [SAP, 0.55, 1], vignette: 0.7, letterbox: BARS },
      toLighting: { exposure: 0.55, under: [SAP, 0.75], rim: [SAP, 0.85, 1], vignette: 0.6, letterbox: BARS },
      actors: [{ role: "caster", at: [520, 430], size: 900, clip: "ult:green-kneel", then: "ult:green-kneel", look: "rim", rim: SAP }],
      vfx: [
        { kind: "green-eyes", at: 0, until: 1, params: { from: 0, to: 0 } },
        { kind: "green-soil", at: 0, until: 1, layer: "front", seed: 41 },
        { kind: "green-web", at: 0.34, until: 1, layer: "front", seed: 12, params: { mode: "hand", ox: 0.17, oy: 0.01 } },
        { kind: "motes", at: 0.3, until: 1, x: 690, y: 400, scale: 0.8, color: SAP, layer: "front", seed: 4 },
        { kind: "green-earth", at: 0.8, until: 1, layer: "screen", seed: 9, params: { dir: "in" } },
      ],
      sound: [
        { at: 0.32, sfx: "green-press" },
        { at: 0.4, sfx: "green-roots" },
      ],
      shake: [{ at: 0.34, amount: 0.006 }],
      text: [{ kind: "voice", at: 0.2, until: 0.85, text: "$voice.activation" }],
      markers: [{ at: 0.34, label: "palm down" }],
    },

    /* 2 · WEB — the whole cutaway: one web of roots to every heart and every enemy. */
    {
      id: "web",
      kind: "wide-hero",
      purpose:
        "Stakes. Under the floor, square-on: the roots spread from the Warden's palm through the soil and fork up to every foot — a heartbeat climbing from every ally, the downed one's faint and late — and curl rot-dark under the whole real enemy line, which flinches as they arrive. Title.",
      space: "cinematic",
      ms: 1000,
      fastMs: 520,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 430, zoom: 1.16 },
        to: { x: 800, y: 462, zoom: 1.04 },
        ease: "out",
      },
      background: "green-undergrowth",
      lighting: { exposure: 0.62, under: [SAP, 0.35], rim: [SAP, 0.7, 1], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.8, under: [SAP, 0.45], rim: [SAP, 0.9, 1], vignette: 0.42, letterbox: BARS },
      actors: [
        { role: "allies", at: [150, 430], spread: [150, 0], size: 220, clip: "ult:green-waiting", then: "ult:green-waiting", look: "rim", rim: SAP, z: 2 },
        { role: "caster", at: [540, 430], size: 240, clip: "ult:green-kneel", then: "ult:green-kneel", look: "rim", rim: SAP, z: 3 },
      ],
      vfx: [
        { kind: "green-eyes", at: 0, until: 1, params: { from: 0, to: 0 } },
        { kind: "green-foes", at: 0, until: 1, layer: "back", params: { mode: "web", x0: 860, span: 640, maxH: 300 } },
        { kind: "green-soil", at: 0, until: 1, layer: "front", seed: 41 },
        { kind: "green-web", at: 0, until: 1, layer: "front", seed: 3, params: { mode: "web", ox: 0.17, oy: 0.01 } },
        { kind: "green-party", at: 0, until: 1, layer: "front", params: { mode: "web" } },
        { kind: "green-earth", at: 0, until: 0.2, layer: "screen", seed: 9, params: { dir: "out" } },
      ],
      sound: [
        { at: 0.02, sfx: "green-motif" },
        { at: 0.3, sfx: "green-hearts" },
      ],
      text: [
        { kind: "name", at: 0.3, until: 1, text: "$name", x: 0.06, y: 0.62 },
        { kind: "epithet", at: 0.4, until: 1, text: "$epithet", x: 0.06, y: 0.71 },
      ],
      markers: [
        { at: 0.3, label: "title" },
        { at: 0.6, label: "every heart found" },
      ],
    },

    /* 3 · LISTEN — the quiet: the face, eyes shut, listening; then they open. */
    {
      id: "listen",
      kind: "face-close-up",
      purpose:
        "The quiet. Under the hood between the antlers, eyes shut and pressed, the brow working to listen; the hearts, then one that barely comes and the brow lifts; the mouth sets — and for the first time, the eyes open.",
      space: "cinematic",
      ms: 640,
      fastMs: 400,
      transition: { kind: "cut" },
      camera: {
        from: { x: 842, y: 262, zoom: 3.0, rotate: 1.2 },
        to: { x: 842, y: 258, zoom: 3.12, rotate: 0.6 },
        ease: "linear",
      },
      background: "green-undergrowth",
      lighting: { exposure: 0.16, under: [SAP, 0.5], rim: [SAP, 0.75, 1], vignette: 0.85, letterbox: 0.14 },
      toLighting: { exposure: 0.1, under: [SAP, 0.62], rim: [SAP, 0.95, 1], vignette: 0.9, letterbox: 0.15 },
      actors: [{ role: "caster", at: [700, 660], size: 1000, clip: "ult:green-hear", then: "ult:green-hear", look: "rim", rim: SAP }],
      vfx: [
        { kind: "green-eyes", at: 0, until: 1, params: { from: 0, to: 1, a: 0.86, b: 0.94 } },
        { kind: "motes", at: 0, until: 1, x: 840, y: 270, scale: 0.8, color: SAP, layer: "front", seed: 7, params: { still: true } },
      ],
      duck: [{ at: 0, level: 0.03, ms: 640 }],
      sound: [
        { at: 0.04, sfx: "green-listen" },
        { at: 0.86, sfx: "green-open" },
      ],
      markers: [
        { at: 0.6, label: "the faint one" },
        { at: 0.88, label: "eyes open" },
      ],
    },

    /* 4 · RECKONING — impact: sap and rot up through the floor at once. */
    {
      id: "reckoning",
      kind: "impact",
      purpose:
        "Impact. On a two-tone frame the Warden comes up out of the kneel, eyes open, staff up and hand flung open: sap bursts up through the crust under every ally and lifts the downed one to its feet, and briars and fungus burst under every enemy as the rot climbs them. Regen on the party, Poison on the line.",
      space: "cinematic",
      ms: 740,
      fastMs: 540,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 300, zoom: 1.34, rotate: 4 },
        to: { x: 800, y: 290, zoom: 1.24, rotate: 1.5 },
        ease: "out",
      },
      background: "green-undergrowth",
      lighting: { exposure: 1, tint: [HOT, 0.28], under: [SAP, 0.9], rim: [SAP, 1, 1], vignette: 0.28, letterbox: BARS },
      toLighting: { exposure: 0.78, tint: [HOT, 0], under: [SAP, 0.45], rim: [SAP, 0.8, 1], vignette: 0.4, letterbox: BARS },
      actors: [
        { role: "allies", at: [520, 430], spread: [-160, 0], size: 320, clip: "ult:green-lifted", then: "ult:green-lifted", look: "lit", z: 2 },
        { role: "caster", at: [770, 430], size: 400, clip: "ult:green-reckon", then: "ult:green-reckon", look: "rim", rim: SAP, z: 3 },
      ],
      vfx: [
        { kind: "green-eyes", at: 0, until: 1, params: { from: 1, to: 1 } },
        { kind: "green-foes", at: 0, until: 1, layer: "back", params: { mode: "rot", x0: 1010, span: 460, maxH: 460 } },
        { kind: "green-soil", at: 0, until: 1, layer: "front", seed: 41 },
        { kind: "green-web", at: 0, until: 1, layer: "front", seed: 3, params: { mode: "surge", ox: -0.02, oy: 0.01 } },
        { kind: "green-burst", at: 0, until: 1, layer: "front" },
        { kind: "green-party", at: 0, until: 1, layer: "front", params: { mode: "rise" } },
        { kind: "motes", at: 0.05, until: 1, x: 760, y: 360, scale: 2.2, color: SAP, layer: "front", seed: 11 },
      ],
      screen: [
        { kind: "two-tone", at: 0.03, ms: 70 },
        { kind: "flash", at: 0.12, ms: 90, amount: 0.5, color: HOT },
        { kind: "radial", at: 0.05, ms: 220, amount: 0.5 },
      ],
      stop: [{ at: 0.04, ms: 150 }],
      shake: [
        { at: 0.04, amount: 0.034 },
        { at: 0.32, amount: 0.012 },
      ],
      sound: [
        { at: 0.03, sfx: "green-impact" },
        { at: 0.07, sfx: "green-rot" },
      ],
      reveal: [
        { at: 0.04, reveal: "impact" },
        { at: 0.04, reveal: "ward" },
      ],
      text: [{ kind: "voice", at: 0.34, until: 1, text: "$voice.impact" }],
      markers: [{ at: 0.04, label: "reckoning" }],
    },

    /* 5 · GROWN — the real board: leaves at every ally's feet, rot at every enemy's. */
    {
      id: "grown",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield: leaves and a sprout at every ally's feet with sap rising off them (the one that was down in the biggest), and briars and falling spores at every enemy's — what is healing and what is rotting, where they stand.",
      space: "battlefield",
      ms: 760,
      fastMs: 460,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [LOAM, 0.4], letterbox: BARS },
      toLighting: { tint: [LOAM, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:green-rest" }],
      vfx: [{ kind: "green-board", at: 0, until: 1, anchor: "caster", params: { mode: "after" } }],
      sound: [
        { at: 0.06, sfx: "green-grown" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.06, label: "grown" }],
    },
  ],
};
