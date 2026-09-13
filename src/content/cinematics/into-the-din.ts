import type { Cinematic } from "../../shared/cinematic";

/**
 * INTO THE DIN — the Herald · Warcaller's Ultimate.
 *
 * The idea, in one sentence: the Warcaller does not sing the charge, it
 * strikes it — it walks out alone into the loudest place in the fight and hits
 * the enemy so hard that the whole field's noise is struck into one ringing
 * note, and the party takes its courage from that sound.
 *
 * Only the Warcaller could have it. The Herald is the party's voice; the path
 * traded its rallying note for a strike that Empowers the striker, and its
 * title is *Lead from where it is loudest.* So the voice is still the Herald's
 * — but it comes out of the weapon, from in front of the party, not behind it.
 * And a herald's colours are heraldry's: the film is sable, argent and a
 * single or, and the heroes are the only full colour in it.
 *
 * Gameplay it shows: the Warcaller Empowered, the chosen enemy struck and left
 * Vulnerable (revealed on the blow's frame), and every ally Empowered for this
 * round — shown as the ring of the blow reaching the real party and all of
 * them coming forward at once, and then on the real board.
 *
 * Rhythm: identity (the earnest face goes to war) → stakes (the real party
 * holding back in the din while the Warcaller walks out past them, alone, at
 * the real enemy; title) → quiet (from over the enemy's own shoulder: the
 * weapon drawn back, the face set, every stroke of the din going out) →
 * impact (a two-tone frame; the blow; the din tuned into one ring) → courage
 * (the ring rolls back over the party) → release (the board).
 *
 * It shares nothing with Anthem of the Unpaid, the film it replaces: no horn
 * at the lips, no ribbons, no party answering in turn, no banner over them, no
 * sky at dusk, no breath held on a horn. Nor with the Vanguard's two: nobody
 * charges or rams — the Warcaller *walks* — and nothing is a hall, a forge, a
 * gate or a row broken open. Its signature is sound drawn and then tuned.
 * The storyboard is `docs/ultimates/into-the-din.md`.
 */

const BONE = "#f1e6cc";
const HOT = "#fffaf0";
const SABLE = "#0b0a0e";
const OR = "#e7b54a";
const BARS = 0.1;

/** Where the weapon lands in the blow, world units (probed). */
const CONTACT = { x: 960, y: 650 };

export const intoTheDin: Cinematic = {
  id: "into-the-din",
  heroId: "herald",
  motif: "din-motif",
  shots: [
    /* 0 · CALL — the din comes up over the real board. */
    {
      id: "call",
      kind: "call",
      purpose:
        "The round stops and gets loud: the real battlefield goes sable, the noise of the fight is drawn over every unit on it, and the Warcaller brings its weapon to the fore.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [SABLE, 0], letterbox: 0 },
      toLighting: { tint: [SABLE, 0.6], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:din-step" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: BONE },
        { kind: "din-board", at: 0.05, until: 1, anchor: "party", seed: 3, scale: 0.7, params: { mode: "din" } },
        { kind: "din-board", at: 0.1, until: 1, anchor: "targets", seed: 9, scale: 0.8, params: { mode: "din" } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.08, sfx: "din-rise" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4500 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · GRIN — face close-up: the Herald's earnest face goes to war. */
    {
      id: "grin",
      kind: "face-close-up",
      purpose:
        "Identity. The face the Herald is drawn with — open, earnest, eyes wide — sets for a fight: the brows come down on the eyes, the smile becomes a grin with teeth in it, and it barks the line, the weapon's pole standing beside it and the din buzzing behind.",
      space: "cinematic",
      ms: 600,
      fastMs: 340,
      transition: { kind: "black", ms: 90 },
      camera: {
        from: { x: 800, y: 715, zoom: 2.7 },
        to: { x: 815, y: 715, zoom: 2.95 },
        ease: "out",
      },
      background: "din-field",
      lighting: { exposure: 0.4, rim: [BONE, 0.55, 1], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.5, rim: [BONE, 0.8, 1], vignette: 0.55, letterbox: BARS },
      actors: [
        { role: "caster", at: [760, 1330], size: 1000, clip: "ult:din-grin", then: "ult:din-grin", look: "lit", rim: BONE },
      ],
      vfx: [
        { kind: "din-noise", at: 0, until: 1, layer: "back", seed: 21, params: { mode: "loud", around: "", field: 70, width: 0.6 } },
      ],
      sound: [{ at: 0, sfx: "din-bed" }],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.34, label: "grin" }],
    },

    /* 2 · OUT FRONT — wide, from behind the real party: the Warcaller walks out alone. */
    {
      id: "out-front",
      kind: "wide-hero",
      purpose:
        "Stakes. Low behind the real party, which holds back in the noise at the edge of the frame, the Warcaller walks out past them — not a charge, a walk — alone into the din towards the real enemy, which sees it coming. The motif's first three notes land on its footfalls.",
      space: "cinematic",
      ms: 900,
      fastMs: 440,
      transition: { kind: "whip", ms: 110, dir: 1 },
      camera: {
        from: { x: 720, y: 520, zoom: 1.3 },
        to: { x: 820, y: 505, zoom: 1.4 },
        ease: "inOut",
      },
      background: "din-field",
      lighting: { exposure: 0.62, back: [BONE, 0.12], rim: [BONE, 0.5, 1], vignette: 0.45, letterbox: BARS },
      toLighting: { exposure: 0.7, back: [BONE, 0.14], rim: [BONE, 0.6, 1], vignette: 0.42, letterbox: BARS },
      actors: [
        {
          role: "target",
          at: [1260, 720],
          size: 250,
          face: -1,
          look: "lit",
          z: 1,
          react: [{ at: 0.62, clip: "anticipate", then: "idle" }],
        },
        {
          role: "caster",
          at: [560, 900],
          to: [930, 770],
          ease: "linear",
          size: 460,
          toSize: 330,
          clip: "ult:din-walk",
          then: "ult:din-walk",
          look: "rim",
          rim: BONE,
          z: 2,
        },
        {
          role: "allies",
          at: [430, 1000],
          spread: [-135, 30],
          size: 560,
          look: "lit",
          rim: BONE,
          z: 3,
          clip: "ult:din-wait",
          then: "ult:din-wait",
        },
      ],
      vfx: [
        { kind: "din-noise", at: 0, until: 1, layer: "back", seed: 31, params: { mode: "loud", around: "targets,allies", field: 80, dense: 1.2 } },
        { kind: "din-noise", at: 0, until: 1, layer: "front", seed: 37, params: { mode: "loud", around: "targets", field: 0, dense: 0.8, width: 0.9 } },
        { kind: "din-walk", at: 0, until: 1, layer: "back" },
      ],
      sound: [{ at: 0.12, sfx: "din-motif" }],
      text: [
        { kind: "name", at: 0.3, until: 1, text: "$name", x: 0.5, y: 0.14, rotate: -3 },
        { kind: "epithet", at: 0.4, until: 1, text: "$epithet", x: 0.5, y: 0.24 },
      ],
      markers: [
        { at: 0.3, label: "title" },
        { at: 0.62, label: "seen" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 780, y: 480, zoom: 1.2 },
            to: { x: 860, y: 470, zoom: 1.3 },
            ease: "inOut",
          },
        },
        boss: {
          camera: {
            from: { x: 800, y: 440, zoom: 1.08 },
            to: { x: 860, y: 430, zoom: 1.16 },
            ease: "inOut",
          },
          actors: [
            {
              role: "target",
              at: [1250, 740],
              size: 200,
              face: -1,
              look: "lit",
              z: 1,
              react: [{ at: 0.62, clip: "anticipate", then: "idle" }],
            },
            {
              role: "caster",
              at: [540, 900],
              to: [880, 780],
              ease: "linear",
              size: 430,
              toSize: 300,
              clip: "ult:din-walk",
              then: "ult:din-walk",
              look: "rim",
              rim: BONE,
              z: 2,
            },
            {
              role: "allies",
              at: [420, 1000],
              spread: [-135, 30],
              size: 540,
              look: "lit",
              rim: BONE,
              z: 3,
              clip: "ult:din-wait",
              then: "ult:din-wait",
            },
          ],
        },
      },
    },

    /* 3 · THE EYE — the quiet, from over the real enemy's shoulder. */
    {
      id: "eye",
      kind: "over-the-shoulder",
      purpose:
        "The quiet. Reversed, from behind the real enemy — its black shape filling the edge of the frame — onto the Warcaller's face and raised weapon: drawn back as far as it goes, the jaw shut, eyes locked. Every stroke of the din freezes and goes out one at a time, and then nothing moves at all.",
      space: "cinematic",
      ms: 580,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: {
        from: { x: 760, y: 560, zoom: 1.72 },
        to: { x: 762, y: 560, zoom: 1.76 },
        ease: "linear",
      },
      background: "din-field",
      lighting: { exposure: 0.16, back: [BONE, 0.2], rim: [BONE, 0.7, 1], vignette: 0.8, letterbox: 0.13 },
      toLighting: { exposure: 0.07, back: [BONE, 0.16], rim: [BONE, 0.9, 1], vignette: 0.9, letterbox: 0.14 },
      actors: [
        { role: "caster", at: [560, 1060], size: 720, clip: "ult:din-draw", then: "ult:din-draw", look: "rim", rim: BONE, z: 1 },
        { role: "target", at: [1320, 1120], size: 1100, face: -1, look: "silhouette", z: 3 },
      ],
      vfx: [
        { kind: "din-noise", at: 0, until: 1, layer: "back", seed: 41, params: { mode: "freeze", around: "caster", field: 70, dense: 1.4, width: 0.8 } },
      ],
      duck: [{ at: 0, level: 0.04, ms: 580 }],
      sound: [{ at: 0.06, sfx: "din-heart" }],
      markers: [{ at: 0.45, label: "held" }],
      framing: {
        boss: {
          camera: {
            from: { x: 740, y: 560, zoom: 1.72 },
            to: { x: 742, y: 560, zoom: 1.76 },
            ease: "linear",
          },
          actors: [
            { role: "caster", at: [540, 1080], size: 720, clip: "ult:din-draw", then: "ult:din-draw", look: "rim", rim: BONE, z: 1 },
            { role: "target", at: [1330, 1320], size: 760, face: -1, look: "lit", z: 3 },
          ],
        },
      },
    },

    /* 4 · THE BLOW — impact: the fourth note. */
    {
      id: "blow",
      kind: "impact",
      purpose:
        "Impact. One two-tone frame and the weapon is down on the real enemy: a hit-stop, the blow drawn as a struck disc and wedges, and a ring out of it — and every stroke of the din it passes is pulled straight into an arc round the blow. The enemy reels, Vulnerable, and the damage lands on the frame.",
      space: "cinematic",
      ms: 740,
      fastMs: 540,
      transition: { kind: "cut" },
      camera: {
        from: { x: 900, y: 580, zoom: 1.55, rotate: -6 },
        to: { x: 910, y: 575, zoom: 1.38, rotate: -2 },
        ease: "out",
      },
      background: "din-field",
      lighting: { exposure: 1, tint: [BONE, 0.2], rim: [BONE, 1, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.62, tint: [BONE, 0], rim: [BONE, 0.7, 1], vignette: 0.45, letterbox: BARS },
      actors: [
        {
          role: "target",
          at: [1030, 860],
          size: 440,
          face: -1,
          z: 1,
          react: [{ at: 0.04, clip: "hurt" }],
          shove: { at: 0.04, by: [110, -6] },
          toTilt: 7,
        },
        { role: "caster", at: [700, 860], to: [715, 860], ease: "out", size: 470, clip: "ult:din-blow", then: "ult:din-blow", look: "lit", rim: BONE, z: 2 },
      ],
      vfx: [
        { kind: "din-noise", at: 0, until: 1, layer: "back", seed: 51, params: { mode: "tune", around: "caster,targets", field: 110, dense: 1.2, ox: CONTACT.x, oy: CONTACT.y, speed: 1500, from: 0.04 } },
        { kind: "din-ring", at: 0.04, until: 1, layer: "front", params: { ox: CONTACT.x, oy: CONTACT.y, speed: 1700, gap: 60, rings: 5 } },
        { kind: "din-clang", at: 0.03, until: 0.42, x: CONTACT.x, y: CONTACT.y, scale: 1, layer: "front", seed: 4 },
        { kind: "sparks", at: 0.04, until: 0.6, x: CONTACT.x, y: CONTACT.y, scale: 1.3, color: HOT, seed: 17, layer: "front" },
      ],
      screen: [
        { kind: "two-tone", at: 0, ms: 70, color: BONE, mode: "full" },
        { kind: "invert", at: 0, ms: 50, mode: "fast" },
        { kind: "flash", at: 0.1, ms: 90, amount: 0.6, color: HOT },
        { kind: "chromatic", at: 0.04, ms: 160, amount: 0.9 },
        { kind: "radial", at: 0.03, ms: 240, amount: 0.8, color: BONE },
      ],
      stop: [{ at: 0.04, ms: 150 }],
      shake: [
        { at: 0.04, amount: 0.042 },
        { at: 0.3, amount: 0.014 },
      ],
      sound: [
        { at: 0.035, sfx: "din-clang" },
        { at: 0.05, sfx: "ult-boom" },
      ],
      reveal: [{ at: 0.04, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.06, until: 0.9, text: "$damage", x: 0.62, y: 0.24, rotate: 5 },
        { kind: "voice", at: 0.3, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: 0.04, label: "contact" }],
      framing: {
        large: {
          camera: {
            from: { x: 900, y: 540, zoom: 1.4, rotate: -5 },
            to: { x: 910, y: 535, zoom: 1.26, rotate: -2 },
            ease: "out",
          },
        },
        boss: {
          camera: {
            from: { x: 920, y: 530, zoom: 1.14, rotate: -4 },
            to: { x: 930, y: 520, zoom: 1.04, rotate: -1.5 },
            ease: "out",
          },
          actors: [
            {
              role: "target",
              at: [1120, 900],
              size: 400,
              face: -1,
              z: 1,
              react: [{ at: 0.04, clip: "hurt" }],
              shove: { at: 0.04, by: [30, 0] },
              toTilt: 2,
            },
            { role: "caster", at: [600, 900], to: [615, 900], ease: "out", size: 400, clip: "ult:din-blow", then: "ult:din-blow", look: "lit", rim: BONE, z: 2 },
          ],
          vfx: [
            { kind: "din-noise", at: 0, until: 1, layer: "back", seed: 51, params: { mode: "tune", around: "caster,targets", field: 110, dense: 1.2, ox: 790, oy: 720, speed: 1700, from: 0.04 } },
            { kind: "din-ring", at: 0.04, until: 1, layer: "front", params: { ox: 790, oy: 720, speed: 1900, gap: 70, rings: 5 } },
            { kind: "din-clang", at: 0.03, until: 0.42, x: 790, y: 720, scale: 1.25, layer: "front", seed: 4 },
            { kind: "sparks", at: 0.04, until: 0.6, x: 790, y: 720, scale: 1.5, color: HOT, seed: 17, layer: "front" },
          ],
        },
      },
    },

    /* 5 · COURAGE — low on the real party: the ring reaches them, all at once. */
    {
      id: "courage",
      kind: "low-angle",
      purpose:
        "Courage from the blow. The ring rolls back from the Warcaller, far out in front, over the real party; the din around them is tuned as it passes, and every one of them comes forward at once — weapons up, lit, a ring of or carried before each. Empowered, on everyone.",
      space: "cinematic",
      ms: 560,
      fastMs: 360,
      transition: { kind: "whip", ms: 100, dir: -1 },
      camera: {
        from: { x: 720, y: 560, zoom: 1.45 },
        to: { x: 700, y: 575, zoom: 1.56 },
        ease: "out",
      },
      background: "din-field",
      lighting: { exposure: 0.4, rim: [BONE, 0.3, 1], vignette: 0.55, letterbox: BARS },
      toLighting: { exposure: 0.85, rim: [OR, 0.95, 1], vignette: 0.35, letterbox: BARS },
      actors: [
        { role: "caster", at: [1110, 700], size: 230, clip: "ult:din-front", then: "ult:din-front", look: "rim", rim: BONE, z: 1 },
        {
          role: "allies",
          at: [600, 880],
          spread: [-250, 14],
          size: 500,
          look: "lit",
          rim: OR,
          z: 2,
          clip: "ult:din-wait",
          react: [{ at: 0.13, clip: "ult:din-surge", then: "ult:din-surge" }],
        },
      ],
      vfx: [
        { kind: "din-noise", at: 0, until: 1, layer: "back", seed: 61, params: { mode: "tune", around: "allies", field: 90, dense: 1, ox: 1110, oy: 580, speed: 1500, from: 0 } },
        { kind: "din-ring", at: 0, until: 1, layer: "back", params: { ox: 1110, oy: 580, speed: 1600, gap: 90, rings: 4 } },
        { kind: "din-courage", at: 0, until: 1, layer: "front", params: { arrive: 0.13 } },
      ],
      sound: [{ at: 0.04, sfx: "din-surge" }],
      markers: [{ at: 0.13, label: "heard" }],
    },

    /* 6 · CARRIED — back on the board. */
    {
      id: "carried",
      kind: "return",
      purpose:
        "Release. The film hands back to the fight and what it did is where it matters: the struck enemy still ringing, a ring of or carried before every real ally, and the Warcaller out in front with its weapon planted.",
      space: "battlefield",
      ms: 660,
      fastMs: 440,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [SABLE, 0.45], letterbox: BARS },
      toLighting: { tint: [SABLE, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:din-hold" }],
      vfx: [
        { kind: "din-board", at: 0, until: 1, anchor: "targets", params: { mode: "ring" } },
        { kind: "din-board", at: 0.04, until: 1, anchor: "allies", params: { mode: "carry" } },
      ],
      sound: [
        { at: 0.08, sfx: "din-reprise" },
        { at: 0.45, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.06, label: "carried" }],
    },
  ],
};
