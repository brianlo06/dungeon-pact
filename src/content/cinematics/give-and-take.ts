import type { Cinematic } from "../../shared/cinematic";

/**
 * GIVE AND TAKE — the Reaver · Bloodbound's Ultimate.
 *
 * The idea, in one sentence: the Bloodbound opens its fist for the first time
 * and lays the bare palm along its cleaver's edge, swearing the pact on the
 * blade, so the blade runs both ways — driven through the enemy's armour it
 * carries the Reaver's blood down into the wound, and then it carries the
 * enemy's back up, into the hand that paid.
 *
 * Only the Bloodbound could have it: *The debt runs both ways now.* Every
 * Reaver pays in blood; the Bloodbound traded Blood price for Blood pact, and
 * is the only one whose blood comes home. Its drawing's front hand is a
 * bandaged fist in every round and in both other Reaver films; this is the one
 * time it opens. An oath is sworn on a blade, and the notched cleaver it drags
 * is the only thing it owns.
 *
 * Rhythm: identity (the bandage off, the fist opened, the palm drawn along the
 * edge, the scarlet running out along it) → stakes (over its shoulder across a
 * crossroads at the real enemy, a fingerpost pointing both ways between them;
 * title) → quiet (the real enemy under the raised blade, a bead of scarlet
 * swelling on the edge, the wind cut) → impact (the frame split along the
 * blade, one half inverted; the cleaver through the enemy's guard and the run
 * going down into it) → the take (the face as the enemy's garnet comes up the
 * blade into the palm) → release (on the real board, a run down the enemy and a
 * run up into the Reaver).
 *
 * It shares nothing with Red Ledger (no pit, sand, top light, stakes, stroke
 * or mark painted on anyone, no black impact frame, no drop falling, no face
 * in the dark with its eyes shut) nor with A Good Hiding (no loft, hides,
 * dust, dent, blow invited, iron two-tone). Red is never a light here and
 * never a mark: only something running. The storyboard is
 * `docs/ultimates/give-and-take.md`.
 */

/** The chalk of the tracks: the only pale thing on the down. */
const CHALK = "#d9d3c4";
/** A cold star rim. */
const STAR = "#b9c6d8";
/** The enemy's blood coming home: its sheen, as a rim. */
const ROSE = "#ff8fb0";
const NIGHT = "#0b0d16";
const BARS = 0.11;

export const giveAndTake: Cinematic = {
  id: "give-and-take",
  heroId: "reaver",
  motif: "give-motif",
  shots: [
    /* 0 · CALL — the blade brought up across the body, on the real board. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the real battlefield goes to night indigo, and the Reaver swings its cleaver up off the floor to lie across its body and lays its fist on the blade.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [NIGHT, 0], letterbox: 0 },
      toLighting: { tint: [NIGHT, 0.64], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:give-call" }],
      vfx: [{ kind: "call-aura", at: 0, until: 1, anchor: "caster", color: CHALK }],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.02, sfx: "give-ring" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4700 }],
      markers: [{ at: 0.6, label: "across" }],
    },

    /* 1 · OATH — extreme close-up: the fist opens, and the palm is drawn along the edge. */
    {
      id: "oath",
      kind: "extreme-close-up",
      purpose:
        "Identity, and the price. Close on the blade across the chest: the bandage comes off, the fist opens for the first time, and the bare palm is laid along the edge and drawn down it towards the point; the scarlet runs out along the blade ahead of it.",
      space: "cinematic",
      ms: 700,
      fastMs: 440,
      transition: { kind: "black", ms: 70 },
      camera: {
        from: { x: 960, y: 860, zoom: 1.9, rotate: -8 },
        to: { x: 1000, y: 876, zoom: 2.05, rotate: -5 },
        ease: "out",
      },
      background: "give-crossroads",
      lighting: { exposure: 0.3, rim: [STAR, 0.5, -1], vignette: 0.7, letterbox: BARS },
      toLighting: { exposure: 0.36, rim: [STAR, 0.6, -1], vignette: 0.62, letterbox: BARS },
      actors: [
        { role: "caster", at: [800, 1300], size: 1000, clip: "ult:give-oath", then: "ult:give-oath", look: "lit", root: false },
      ],
      sound: [{ at: 0.02, sfx: "give-oath" }],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.2, label: "opened" },
        { at: 0.45, label: "drawn" },
      ],
    },

    /* 2 · CROSSROADS — over the shoulder, across the crossing at the real enemy. */
    {
      id: "crossroads",
      kind: "over-the-shoulder",
      purpose:
        "Stakes. Past the Reaver's shoulder, across a chalk crossroads at night: the cleaver held out at the enemy with the scarlet standing at its point, a fingerpost between them pointing both ways, and the real enemy across the crossing, bracing.",
      space: "cinematic",
      ms: 920,
      fastMs: 480,
      transition: { kind: "cut" },
      camera: {
        from: { x: 820, y: 560, zoom: 1.2 },
        to: { x: 860, y: 570, zoom: 1.3, rotate: 1 },
        ease: "inOut",
      },
      background: "give-crossroads",
      lighting: { exposure: 0.8, rim: [STAR, 0.5, 1], vignette: 0.45, letterbox: BARS },
      toLighting: { exposure: 0.84, rim: [STAR, 0.55, 1], vignette: 0.42, letterbox: BARS },
      actors: [
        { role: "caster", at: [360, 1180], to: [380, 1180], size: 820, clip: "ult:give-hold", then: "ult:give-hold", look: "rim", rim: STAR, z: 3 },
        {
          role: "target",
          at: [1150, 670],
          size: 300,
          face: -1,
          look: "lit",
          z: 1,
          react: [{ at: 0.55, clip: "anticipate", then: "idle" }],
        },
      ],
      vfx: [{ kind: "give-wind", at: 0, until: 1, layer: "screen", seed: 5 }],
      sound: [
        { at: 0, sfx: "give-wind" },
        { at: 0.08, sfx: "give-motif" },
      ],
      text: [
        { kind: "name", at: 0.22, until: 1, text: "$name", x: 0.6, y: 0.18 },
        { kind: "epithet", at: 0.32, until: 1, text: "$epithet", x: 0.6, y: 0.28 },
      ],
      markers: [{ at: 0.22, label: "title" }],
    },

    /* 3 · UNDER THE BLADE — the quiet: the real enemy, and a bead on the edge over it. */
    {
      id: "under",
      kind: "target",
      purpose:
        "The quiet. Low and dead still on the real enemy in the dark, a cold rim on it; the Reaver's raised blade crosses the top of the frame, and a single bead of scarlet swells on its edge over the enemy and does not fall. The wind has stopped.",
      space: "cinematic",
      ms: 520,
      fastMs: 340,
      transition: { kind: "cut" },
      camera: {
        from: { x: 900, y: 600, zoom: 1.7 },
        to: { x: 900, y: 600, zoom: 1.72 },
        ease: "linear",
      },
      background: "give-crossroads",
      lighting: { exposure: 0.14, back: [STAR, 0], vignette: 0.9, letterbox: 0.14 },
      toLighting: { exposure: 0.12, back: [STAR, 0], vignette: 0.92, letterbox: 0.14 },
      actors: [
        { role: "caster", at: [520, 760], size: 900, clip: "ult:give-raise", then: "ult:give-raise", look: "rim", rim: STAR, z: 2 },
        { role: "target", at: [960, 760], size: 380, face: -1, look: "rim", rim: STAR, z: 1, react: [{ at: 0, clip: "idle" }] },
      ],
      vfx: [{ kind: "give-bead", at: 0, until: 1, x: 900, y: 420, layer: "front", params: { size: 60 } }],
      duck: [{ at: 0, level: 0.03, ms: 520 }],
      sound: [{ at: 0.02, sfx: "give-hush" }],
      markers: [{ at: 0.9, label: "held" }],
    },

    /* 4 · GIVE — the split frame, and the cleaver through the enemy's guard. */
    {
      id: "give",
      kind: "impact",
      purpose:
        "Impact. The frame split along the blade, one half inverted, with the scarlet running down the cut; then in colour the cleaver buried through the enemy's guard with the whole body after it, the run going down the blade into the wound, the enemy thrown back.",
      space: "cinematic",
      ms: 840,
      fastMs: 600,
      transition: { kind: "cut" },
      camera: {
        from: { x: 880, y: 620, zoom: 1.36, rotate: 7 },
        to: { x: 900, y: 612, zoom: 1.24, rotate: 3 },
        ease: "out",
      },
      background: "give-crossroads",
      lighting: { exposure: 0.95, rim: [STAR, 0.5, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.74, rim: [STAR, 0.45, 1], vignette: 0.42, letterbox: BARS },
      actors: [
        {
          role: "target",
          at: [980, 830],
          size: 380,
          face: -1,
          z: 1,
          react: [{ at: 0.04, clip: "hurt" }],
          shove: { at: 0.04, by: [60, -4] },
          toTilt: 8,
        },
        { role: "caster", at: [700, 834], to: [716, 834], ease: "out", size: 450, clip: "ult:give-strike", then: "ult:give-strike", look: "lit", z: 2 },
      ],
      vfx: [
        { kind: "give-notch", at: 0.04, until: 0.4, follow: "target", x: -20, y: -190, layer: "front", seed: 9, params: { size: 380 } },
        { kind: "give-split", at: 0, until: 0.1, layer: "screen", params: { x1: 0.36, y1: 0.24, x2: 0.62, y2: 0.7, side: 1 } },
      ],
      screen: [
        { kind: "two-tone", at: 0, ms: 70, mode: "full" },
        { kind: "two-tone", at: 0, ms: 50, mode: "fast" },
      ],
      stop: [{ at: 0.04, ms: 150 }],
      shake: [
        { at: 0.04, amount: 0.04 },
        { at: 0.26, amount: 0.012 },
      ],
      sound: [
        { at: 0.03, sfx: "give-impact" },
        { at: 0.05, sfx: "ult-boom" },
      ],
      reveal: [{ at: 0.04, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.04, until: 0.9, text: "$damage", x: 0.66, y: 0.22, rotate: 4 },
        { kind: "voice", at: 0.4, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.04, label: "given" },
        { at: 0.3, label: "run down" },
      ],
    },

    /* 5 · TAKE — face close-up: the enemy's blood coming up the blade into the palm. */
    {
      id: "take",
      kind: "face-close-up",
      purpose:
        "The take. On the face, with the open hand laid on the blade's spine: the enemy's garnet comes up the blade head first into the palm; the head goes back, the brow lifts and the eyes half shut on a long breath in, then open on a grin. The healing is revealed.",
      space: "cinematic",
      ms: 680,
      fastMs: 460,
      transition: { kind: "cut" },
      camera: {
        from: { x: 900, y: 760, zoom: 1.6 },
        to: { x: 904, y: 756, zoom: 1.65 },
        ease: "linear",
      },
      background: "give-crossroads",
      lighting: { exposure: 0.4, rim: [ROSE, 0.45, 1], vignette: 0.64, letterbox: 0.13 },
      toLighting: { exposure: 0.46, rim: [ROSE, 0.6, 1], vignette: 0.6, letterbox: 0.13 },
      actors: [
        { role: "caster", at: [760, 1440], size: 1150, clip: "ult:give-take", then: "ult:give-take", look: "lit", root: false },
      ],
      sound: [{ at: 0.04, sfx: "give-take" }],
      reveal: [{ at: 0.5, reveal: "ward" }],
      markers: [
        { at: 0.1, label: "coming back" },
        { at: 0.62, label: "home" },
      ],
    },

    /* 6 · SQUARE — the real board: the enemy open, the Reaver whole. */
    {
      id: "square",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield: the Reaver lets its blade down onto the floor and closes its hand back into a fist; a scarlet run goes down the real enemy (open for the party), a garnet run goes up into the Reaver (the blood come home).",
      space: "battlefield",
      ms: 700,
      fastMs: 460,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [NIGHT, 0.44], letterbox: BARS },
      toLighting: { tint: [NIGHT, 0], letterbox: 0 },
      actors: [
        { role: "caster", at: [0, 0], size: 0, clip: "ult:give-settle" },
        { role: "target", at: [0, 0], size: 0, clip: "hurt", clipAt: 0.1, then: "idle" },
      ],
      vfx: [
        { kind: "give-board", at: 0.02, until: 1, anchor: "targets", params: { mode: "open" } },
        { kind: "give-board", at: 0.12, until: 1, anchor: "caster", params: { mode: "home" } },
      ],
      sound: [
        { at: 0.04, sfx: "give-settle" },
        { at: 0.45, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.12, label: "square" }],
    },
  ],
};
