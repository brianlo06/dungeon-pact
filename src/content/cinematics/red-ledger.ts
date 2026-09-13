import type { Cinematic } from "../../shared/cinematic";

/**
 * RED LEDGER — the Reaver's Ultimate.
 *
 * The idea, in one sentence: the Reaver pays first — it clenches its bandaged
 * fist until the old wound runs and wipes one red stroke of its own blood
 * across its chest — and the cleaver collects with that stroke, cut once
 * through the target and entered again, stroke for stroke, on everyone
 * standing in its row.
 *
 * Only the Reaver could have it: *Pain is just unspent currency*. Its kit
 * pays HP for damage (Blood price) and for a row (Frenzy), its Pact Charge is
 * earned by sacrifice and by being hurt, and its drawing is the one bare,
 * scarred body in the party, a fist already spotted red through the bandage.
 * A ledger is where a debt is entered; here the entry is a stroke on skin,
 * and the same stroke is the damage. The three results are one mark: on the
 * Reaver (the price), doubled on the target (40, paid in full), and a copy
 * on each of the target's row (12).
 *
 * Rhythm: identity and the price (the clench, the stroke) → stakes and
 * escalation (the row sees it come across the pit; title) → quiet (the face
 * in the dark, a single drop) → impact (a black frame with the stroke across
 * it, the chop, the copies landing one after another) → release (the mark on
 * everyone who paid, on the real board).
 *
 * It shares nothing with the other films: its space is a pit with one hard
 * top light (not a hall, forge, storm, wood, causeway, mirror room or
 * ridge); red is never light here, only paint; its reverse angle looks at the
 * hero from behind its enemies; its impact frame is black, not two-tone; and
 * its row is not broken open or struck by a line of force — each of them is
 * written on. The storyboard is `docs/ultimates/red-ledger.md`.
 */

const CRIMSON = "#ff4d5e";
const BONE = "#e6d6b6";
const INK = "#0a0607";
const BARS = 0.11;

export const redLedger: Cinematic = {
  id: "red-ledger",
  heroId: "reaver",
  motif: "ledger-motif",
  shots: [
    /* 0 · CALL — the pit's one light finds the real Reaver. */
    {
      id: "call",
      kind: "call",
      purpose:
        "The round stops: the real battlefield goes to ink, one hard pool of white light lands round the Reaver, and it drags its cleaver up off the floor and closes its fist.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [INK, 0], letterbox: 0 },
      toLighting: { tint: [INK, 0.64], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:ledger-clench" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: BONE },
        { kind: "ledger-pool", at: 0.05, until: 1, anchor: "caster" },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.12, sfx: "ledger-scrape" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4300 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · PRICE — detail: the fist clenched until it runs, and the stroke. */
    {
      id: "price",
      kind: "detail",
      purpose:
        "Identity and the price, paid on screen: the bandaged fist clenched in front of the scarred chest until it shakes and the bandage soaks red from inside; then the fist is dragged down across the chest and leaves one red stroke behind it.",
      space: "cinematic",
      ms: 700,
      fastMs: 460,
      transition: { kind: "black", ms: 130 },
      camera: {
        from: { x: 820, y: 826, zoom: 1.96, rotate: -8 },
        to: { x: 836, y: 836, zoom: 2.1, rotate: -5 },
        ease: "out",
      },
      background: "ledger-pit",
      lighting: { exposure: 0.34, vignette: 0.72, letterbox: BARS },
      toLighting: { exposure: 0.42, vignette: 0.62, letterbox: BARS },
      actors: [
        { role: "caster", at: [800, 1300], size: 1000, clip: "ult:ledger-price", then: "ult:ledger-price", look: "lit" },
      ],
      vfx: [
        { kind: "ledger-drops", at: 0.1, until: 0.5, x: 1013, y: 862, layer: "front", seed: 4, params: { n: 4, fall: 300 } },
      ],
      sound: [
        { at: 0.04, sfx: "ledger-clench" },
        // The wipe starts 280ms into the clip, whichever cut this is.
        { at: 0.4, sfx: "ledger-entry", mode: "full" },
        { at: 0.6, sfx: "ledger-entry", mode: "fast" },
      ],
      text: [{ kind: "voice", at: 0.2, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.37, label: "soaked" },
        { at: 0.59, label: "entered" },
      ],
    },

    /* 2 · PIT — reverse: from behind the row, the Reaver coming across the sand. */
    {
      id: "pit",
      kind: "target",
      purpose:
        "Stakes and escalation, from the other side: the real row in the dark foreground, bracing, and across the lit sand the Reaver coming at them with the stroke on its chest, head low, the cleaver dragging a groove behind it.",
      space: "cinematic",
      ms: 1000,
      fastMs: 520,
      transition: { kind: "cut" },
      camera: {
        from: { x: 820, y: 560, zoom: 1.28 },
        to: { x: 760, y: 580, zoom: 1.4, rotate: -1 },
        ease: "inOut",
      },
      background: "ledger-pit",
      lighting: { exposure: 0.8, back: [BONE, 0], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.86, back: [BONE, 0], vignette: 0.45, letterbox: BARS },
      actors: [
        {
          role: "caster",
          at: [1230, 770],
          to: [1030, 800],
          size: 300,
          toSize: 350,
          face: -1,
          clip: "ult:ledger-walk",
          look: "lit",
          z: 1,
        },
        {
          role: "targets",
          at: [640, 1060],
          spread: [-230, 16],
          size: 520,
          face: 1,
          look: "silhouette",
          z: 3,
          react: [{ at: 0.62, clip: "anticipate", then: "idle" }],
        },
      ],
      vfx: [
        { kind: "ledger-groove", at: 0, until: 1, layer: "back", params: { from: 1700, tip: 0.55, lift: 0 } },
        { kind: "motes", at: 0, until: 1, x: 900, y: 420, scale: 1.6, color: BONE, layer: "back", seed: 7 },
      ],
      sound: [
        { at: 0.02, sfx: "ledger-drag" },
        { at: 0.1, sfx: "ledger-motif" },
      ],
      text: [
        { kind: "name", at: 0.3, until: 1, text: "$name", x: 0.54, y: 0.2 },
        { kind: "epithet", at: 0.4, until: 1, text: "$epithet", x: 0.54, y: 0.3 },
      ],
      markers: [{ at: 0.3, label: "title" }],
      framing: {
        boss: {
          camera: {
            from: { x: 840, y: 520, zoom: 1.12 },
            to: { x: 800, y: 530, zoom: 1.2, rotate: -1 },
            ease: "inOut",
          },
          actors: [
            { role: "caster", at: [1260, 760], to: [1100, 780], size: 260, toSize: 300, face: -1, clip: "ult:ledger-walk", look: "lit", z: 1 },
            {
              role: "targets",
              at: [300, 1020],
              spread: [-260, 12],
              size: 460,
              face: 1,
              look: "silhouette",
              z: 3,
              react: [{ at: 0.62, clip: "anticipate", then: "idle" }],
            },
          ],
        },
      },
    },

    /* 3 · HUSH — the quiet: the face in the dark, one drop. */
    {
      id: "hush",
      kind: "face-close-up",
      purpose:
        "The quiet. Nearly black; the brow shelf lowered over shut eyes, the red fist at the jaw, and one drop swelling on it. The music is gone and there is one heartbeat. The drop lets go; the brow lifts, the eyes open, and the teeth show.",
      space: "cinematic",
      ms: 560,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: { from: { x: 900, y: 690, zoom: 2.0 }, to: { x: 902, y: 692, zoom: 2.03 }, ease: "linear" },
      background: "ledger-pit",
      lighting: { exposure: 0.06, rim: [BONE, 0.12, 1], vignette: 0.95, letterbox: 0.14 },
      toLighting: { exposure: 0.05, rim: [BONE, 0.18, 1], vignette: 0.96, letterbox: 0.14 },
      actors: [{ role: "caster", at: [800, 1500], size: 1300, clip: "ult:ledger-hush", then: "ult:ledger-hush", look: "rim", rim: BONE }],
      vfx: [
        { kind: "ledger-drops", at: 0, until: 1, x: 1046, y: 814, layer: "front", params: { single: true, hang: 0.6, fall: 260 } },
      ],
      duck: [{ at: 0, level: 0.03, ms: 560 }],
      sound: [
        { at: 0.06, sfx: "ledger-heart" },
        { at: 0.62, sfx: "ledger-drop" },
      ],
      markers: [{ at: 0.55, label: "eyes open" }],
    },

    /* 4 · COLLECT — the black frame, the chop, the copies. */
    {
      id: "collect",
      kind: "impact",
      purpose:
        "Impact. A black frame with the stroke across the whole screen and the number on it, a held stop, and then the chop seen whole: the cleaver through and too far, the target doubled with the stroke and knocked back, and a copy of the stroke entered on each of its row, one after another.",
      space: "cinematic",
      ms: 800,
      fastMs: 580,
      transition: { kind: "cut" },
      camera: {
        from: { x: 950, y: 600, zoom: 1.36, rotate: 6 },
        to: { x: 970, y: 596, zoom: 1.22, rotate: 2.5 },
        ease: "out",
      },
      background: "ledger-pit",
      lighting: { exposure: 0.95, vignette: 0.32, letterbox: BARS },
      toLighting: { exposure: 0.74, vignette: 0.42, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [1000, 820],
          spread: [180, -12],
          size: 370,
          face: -1,
          z: 1,
          react: [{ at: 0.04, clip: "hurt" }],
          shove: { at: 0.04, by: [46, -4] },
          toTilt: 6,
        },
        { role: "caster", at: [690, 830], to: [740, 830], ease: "out", size: 450, clip: "ult:ledger-collect", then: "ult:ledger-collect", look: "lit", z: 2 },
      ],
      vfx: [
        { kind: "ledger-entries", at: 0.04, until: 1, layer: "front", params: { angle: 22, gap: 0.07 } },
        { kind: "ledger-drops", at: 0.06, until: 0.9, follow: "target", x: -40, y: -230, layer: "front", seed: 12, params: { n: 6, fall: 240 } },
        { kind: "ledger-cut", at: 0, until: 0.16, layer: "screen", params: { x: 300, y: 320, angle: 16, size: 44 } },
      ],
      screen: [
        { kind: "black", at: 0, ms: 70, mode: "full" },
        { kind: "black", at: 0, ms: 50, mode: "fast" },
      ],
      stop: [{ at: 0.04, ms: 150 }],
      shake: [
        { at: 0.04, amount: 0.036 },
        { at: 0.24, amount: 0.012 },
      ],
      sound: [
        { at: 0.02, sfx: "ledger-cut" },
        { at: 0.04, sfx: "ult-boom" },
        { at: 0.12, sfx: "ledger-stamps" },
      ],
      reveal: [{ at: 0.04, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.04, until: 0.9, text: "$damage", x: 0.46, y: 0.2, rotate: -5 },
        { kind: "voice", at: 0.34, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.04, label: "collected" },
        { at: 0.18, label: "entered on the row" },
      ],
      framing: {
        boss: {
          camera: {
            from: { x: 900, y: 500, zoom: 1.08, rotate: 4 },
            to: { x: 920, y: 500, zoom: 1.0, rotate: 1.5 },
            ease: "out",
          },
          actors: [
            {
              role: "targets",
              at: [1100, 830],
              spread: [220, -12],
              size: 400,
              face: -1,
              z: 1,
              react: [{ at: 0.04, clip: "hurt" }],
              shove: { at: 0.04, by: [18, 0] },
              toTilt: 2,
            },
            { role: "caster", at: [600, 830], to: [650, 830], ease: "out", size: 400, clip: "ult:ledger-collect", then: "ult:ledger-collect", look: "lit", z: 2 },
          ],
        },
      },
    },

    /* 5 · SETTLE — the real board: the mark on everyone who paid. */
    {
      id: "settle",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield the light lifts and the entries stay: the stroke doubled on the target, a copy on each of its row, and the same stroke on the Reaver, who lets the blade back down onto the floor with its HP gone.",
      space: "battlefield",
      ms: 760,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [INK, 0.44], letterbox: BARS },
      toLighting: { tint: [INK, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:ledger-settle" }],
      vfx: [
        { kind: "ledger-mark", at: 0.02, until: 1, anchor: "targets", stagger: 70 },
        { kind: "ledger-mark", at: 0.12, until: 1, anchor: "caster", params: { price: true } },
      ],
      sound: [
        { at: 0.05, sfx: "ledger-settle" },
        { at: 0.45, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.12, label: "the price" }],
    },
  ],
};
