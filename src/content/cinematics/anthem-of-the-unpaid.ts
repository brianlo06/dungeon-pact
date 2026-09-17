import type { Cinematic } from "../../shared/cinematic";

/**
 * ANTHEM OF THE UNPAID — the Herald's Ultimate.
 *
 * The idea, in one sentence: the Herald's horn does not play the anthem, it
 * asks for it — one note goes out, every ally in the pact answers it in their
 * own voice, and the last note is all of them at once.
 *
 * Only the Herald could have it: its kit is other people ("you and an ally",
 * a whole row), its rally is a horn at the lips, its resource is Verse and its
 * title is *You are worth more than you think*. A standard-bearer's whole job
 * is to be answered. So the film is a call and its answer, and a voice is
 * drawn as a ribbon in its singer's colour — the banner the Herald carries,
 * made of the people it carries it for.
 *
 * Gameplay it shows: nothing is struck. The whole real party — its drawings,
 * its gear — answers, and on the last note every one of them is wound in its
 * own voice (Barrier) with gold running up it (Empowered); then the same on
 * the real board.
 *
 * Rhythm: identity (the note, eyes shut) → stakes and escalation (the real
 * party hears it and answers, one after another; title) → quiet (the ribbons
 * hang dead still, the breath comes in, the eyes open) → impact (every voice
 * at once, two-tone, the ribbons snap into one banner) → release (the board).
 * The Herald turns its back on the fight to face the party for the call, and
 * turns round with them for the last note; the two-tone frame hides the turn.
 *
 * It shares nothing with the other films: its space is an open sky at dusk
 * (not a hall, forge, storm, wood, causeway or mirror room); no enemy is in
 * it; its close-ups are of a face singing, not a weapon; its signature effect
 * is cloth and sound, not light, force, weather, lines or glass; and the
 * party is not lit behind the hero — it is the subject, and it sings.
 * The storyboard is `docs/ultimates/anthem-of-the-unpaid.md`.
 */

const ROSE = "#ffb3d1";
const DUSK = "#140a22";
const PEACH = "#ffd9ae";
const BARS = 0.1;

export const anthemOfTheUnpaid: Cinematic = {
  id: "anthem-of-the-unpaid",
  heroId: "herald",
  motif: "anthem-motif",
  shots: [
    /* 0 · CALL — the real Herald lifts the horn and the air is drawn in. */
    {
      id: "call",
      kind: "call",
      purpose:
        "The round stops: dusk comes down over the real battlefield, the Herald brings the horn up to its lips, and the air is drawn in towards it.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [DUSK, 0], letterbox: 0 },
      toLighting: { tint: [DUSK, 0.58], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:anthem-lift" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: ROSE },
        { kind: "anthem-breath", at: 0.1, until: 1, anchor: "caster", color: ROSE },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.25, sfx: "anthem-breath" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4200 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · NOTE — extreme close-up: the horn blown, eyes shut, towards the party. */
    {
      id: "note",
      kind: "dutch",
      purpose:
        "Identity. The Herald has turned its back on the fight to face its own people: the horn at the lips, blown with the eyes shut and the brows up, and the one note unfurls out of the bell towards them. The eyes open at the end of it.",
      space: "cinematic",
      ms: 640,
      fastMs: 400,
      // Long enough to hide the copy blending out of its rest pose into the horn.
      transition: { kind: "black", ms: 130 },
      camera: {
        from: { x: 900, y: 520, zoom: 1.7, rotate: 9 },
        to: { x: 860, y: 510, zoom: 1.82, rotate: 6 },
        ease: "out",
      },
      background: "anthem-ridge",
      lighting: { exposure: 0.42, rim: [ROSE, 0.7, -1], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.5, rim: [ROSE, 0.9, -1], vignette: 0.5, letterbox: BARS },
      actors: [
        { role: "caster", at: [1000, 1000], size: 820, face: -1, clip: "ult:anthem-call", then: "ult:anthem-call", look: "rim", rim: ROSE },
      ],
      vfx: [
        { kind: "anthem-note", at: 0.08, until: 1, layer: "front", params: { x1: 770, y1: 490, x2: 300, y2: 400, width: 34, amp: 30, ring: 0 } },
      ],
      sound: [{ at: 0.04, sfx: "anthem-horn" }],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.08, label: "the note" }],
    },

    /* 2 · ANSWER — tracking along the real party as the note reaches each. */
    {
      id: "answer",
      kind: "profile",
      purpose:
        "Stakes and escalation. The note runs along the real party, and as it reaches each of them they hear it and answer — one after another, each voice rising off them in its own colour, gear and all.",
      space: "cinematic",
      ms: 1000,
      fastMs: 520,
      transition: { kind: "whip", ms: 110, dir: -1 },
      camera: {
        from: { x: 1060, y: 600, zoom: 1.5 },
        to: { x: 620, y: 590, zoom: 1.55, rotate: -1 },
        ease: "inOut",
      },
      background: "anthem-ridge",
      lighting: { exposure: 0.72, back: [PEACH, 0.2], rim: [ROSE, 0.7, 1], vignette: 0.4, letterbox: BARS },
      toLighting: { exposure: 0.8, back: [PEACH, 0.28], rim: [ROSE, 0.9, 1], vignette: 0.36, letterbox: BARS },
      actors: [
        {
          role: "allies",
          at: [470, 880],
          spread: [300, -8],
          size: 420,
          look: "lit",
          z: 2,
          clip: "idle",
          react: [{ at: 0.12, clip: "ult:anthem-answer", then: "ult:anthem-answer" }],
        },
      ],
      vfx: [{ kind: "anthem-voices", at: 0, until: 1, layer: "back", params: { mode: "answer", x1: 1560, x2: -150, row: 0.74 } }],
      sound: [
        { at: 0.1, sfx: "anthem-answer" },
      ],
      text: [
        { kind: "name", at: 0.38, until: 1, text: "$name", x: 0.06, y: 0.16 },
        { kind: "epithet", at: 0.48, until: 1, text: "$epithet", x: 0.06, y: 0.26 },
      ],
      markers: [{ at: 0.38, label: "title" }],
    },

    /* 3 · HUSH — the quiet: the voices hang still; the breath; the eyes open. */
    {
      id: "hush",
      kind: "face-close-up",
      purpose:
        "The quiet. Every voice hangs dead still in the air; the horn is down, the eyes are shut, the music is gone and the Herald draws one breath — and at the very end the eyes open, and the mouth.",
      space: "cinematic",
      ms: 580,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: { from: { x: 850, y: 505, zoom: 3.6 } },
      background: "anthem-ridge",
      lighting: { exposure: 0.1, rim: [ROSE, 0.3, -1], vignette: 0.9, letterbox: 0.14 },
      toLighting: { exposure: 0.08, rim: [ROSE, 0.45, -1], vignette: 0.92, letterbox: 0.14 },
      actors: [
        { role: "caster", at: [900, 1030], size: 820, face: -1, clip: "ult:anthem-breathe", then: "ult:anthem-breathe", look: "rim", rim: ROSE, root: false },
      ],
      vfx: [{ kind: "anthem-voices", at: 0, until: 1, layer: "back", params: { mode: "hang", cx: 820, cy: 430, span: 760 } }],
      duck: [{ at: 0, level: 0.03, ms: 580 }],
      sound: [
        { at: 0, sfx: "anthem-hush" },
        { at: 0.72, sfx: "anthem-gasp" },
      ],
      markers: [{ at: 0.8, label: "eyes open" }],
    },

    /* 4 · ANTHEM — every voice at once. */
    {
      id: "anthem",
      kind: "impact",
      purpose:
        "Impact. One two-tone frame, a held stop, and every voice at once: the Herald turned back to the fight with the horn thrown up, the whole real party roaring the last note beside it, the ribbons snapping taut into one banner over them — and each wound in its own voice, gold running up it: Barrier and Empowered, on everyone.",
      space: "cinematic",
      ms: 780,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 700, y: 540, zoom: 1.45, rotate: -4 },
        to: { x: 690, y: 510, zoom: 1.18, rotate: -1 },
        ease: "out",
      },
      background: "anthem-ridge",
      lighting: { exposure: 1, tint: [ROSE, 0.22], back: [PEACH, 0.5], rim: [ROSE, 1, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.78, tint: [ROSE, 0], back: [PEACH, 0.3], rim: [ROSE, 0.8, 1], vignette: 0.4, letterbox: BARS },
      actors: [
        {
          role: "allies",
          at: [640, 830],
          spread: [-205, 22],
          size: 360,
          look: "lit",
          z: 1,
          clip: "ult:anthem-roar",
          then: "ult:anthem-roar",
        },
        { role: "caster", at: [900, 860], size: 440, clip: "ult:anthem-cry", then: "ult:anthem-cry", look: "lit", rim: ROSE, z: 3 },
      ],
      vfx: [
        { kind: "anthem-banner", at: 0, until: 1, layer: "back", params: { y: 250, sag: 50 } },
        { kind: "anthem-ward", at: 0.02, until: 1, layer: "back", params: { half: "back" } },
        { kind: "anthem-ward", at: 0.02, until: 1, layer: "front", params: { half: "front" } },
        { kind: "anthem-chord", at: 0.02, until: 0.8, follow: "caster", x: 40, y: -470, scale: 1.2, color: ROSE, layer: "front" },
      ],
      screen: [
        { kind: "two-tone", at: 0, ms: 70, color: ROSE, mode: "full" },
        { kind: "invert", at: 0, ms: 50, mode: "fast" },
        { kind: "flash", at: 0.12, ms: 110, amount: 0.55, color: "#fff1f6" },
        { kind: "chromatic", at: 0.03, ms: 150, amount: 0.8 },
        { kind: "radial", at: 0.02, ms: 260, amount: 0.8, color: ROSE },
      ],
      stop: [{ at: 0.03, ms: 150 }],
      shake: [
        { at: 0.03, amount: 0.036 },
        { at: 0.34, amount: 0.012 },
      ],
      sound: [
        { at: 0.02, sfx: "anthem-chord" },
        { at: 0.03, sfx: "ult-boom" },
      ],
      reveal: [
        { at: 0.03, reveal: "impact" },
        { at: 0.03, reveal: "ward" },
      ],
      text: [{ kind: "voice", at: 0.26, until: 1, text: "$voice.impact" }],
      markers: [{ at: 0.03, label: "every voice" }],
    },

    /* 5 · CARRIED — back on the board: every hero wound in its own voice. */
    {
      id: "carried",
      kind: "return",
      purpose:
        "Release. The film hands back to the fight, and what it did is on every real party member: each wound in its own voice with a pennant tail streaming off it, warded and Empowered, and the Herald standing easy.",
      space: "battlefield",
      ms: 760,
      fastMs: 500,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [DUSK, 0.42], letterbox: BARS },
      toLighting: { tint: [DUSK, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:anthem-stand" }],
      vfx: [{ kind: "anthem-pennant", at: 0.04, until: 1, anchor: "party", stagger: 70, color: ROSE }],
      sound: [
        { at: 0.04, sfx: "anthem-flutter" },
        { at: 0.18, sfx: "anthem-motif" },
        { at: 0.5, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.06, label: "carried" }],
    },
  ],
};
