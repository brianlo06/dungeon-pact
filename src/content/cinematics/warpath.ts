import type { Cinematic } from "../../shared/cinematic";

/**
 * WARPATH — the Vanguard · Warlord's Ultimate.
 *
 * The idea, in one sentence: the Warlord breaks trail — it roars a plume of
 * breath out of its visor into a blizzard and wades first through snow too
 * deep for anyone else, and the party comes after it in its footprints, all
 * the way to the enemy the trail ends at.
 *
 * Only the Warlord could have it. Every other Vanguard film stands the
 * Vanguard in front of the party so nothing reaches them; the Warlord path is
 * *Fight louder. They follow the noise*, and it traded pure guarding for
 * command. So this is the one Vanguard film where the party is behind it
 * because it is following. Who follows is the party; where to is exactly
 * where the Warlord walked. The widest figure in the party, whose front is a
 * wall, is the one who can go first through a drift. And it has no face: its
 * warcry is drawn as the one thing a closed helm can show in the cold, breath.
 *
 * Gameplay it shows: the enemy struck and left Marked and Vulnerable at the
 * end of the trail (revealed on the blow's frame), and the whole party come
 * forward into the front line in the Warlord's tracks, with its Barrier — the
 * allies arriving behind it in the blow's shot, then standing in the front on
 * the real board with snowy prints leading to each of them and on to the
 * enemy.
 *
 * Rhythm: identity (the roar) → stakes and escalation (breaking trail, the
 * real party wading in its trench, the real enemy far ahead; title) → quiet
 * (from high above the plain: the trail one dark stroke across the white, a
 * step short of the enemy; the wind drops dead) → impact (the last step and
 * the blow; an ink-and-snow frame; the snow thrown; the party arriving) →
 * release (the board).
 *
 * It shares nothing with the Lantern Wall, the Gatebreaker or Breakwater: no
 * hall, lantern, planted shield, forge, gate, ram, wave, charge or ward; the
 * Warlord wades, and the camera looks down on it once, from far above, where
 * theirs look up at it or ride beside it. Nor with Into the Din: nothing here
 * is sound drawn — no strokes, no rings, no courage passing from a blow — and
 * the party is not held back and then lit, it walks the whole way. It is the
 * one film in snow. The storyboard is `docs/ultimates/warpath.md`.
 */

const RUST = "#e0664a";
const SNOW = "#e9eef2";
const ICE = "#c6d9e8";
const SLATE = "#10151c";
const BARS = 0.1;

/**
 * The blow, laid out from probed positions (world units): the Warlord's
 * ground point, the enemy's, and where the blade is on the held frame.
 */
const CASTER = { x: 640, y: 860 };
const TARGET = { x: 1000, y: 860 };
const CONTACT = { x: 878, y: 650 };
const BOSS = {
  caster: { x: 640, y: 900 },
  target: { x: 1050, y: 900 },
  contact: { x: 868, y: 708 },
};

export const warpath: Cinematic = {
  id: "warpath",
  heroId: "vanguard",
  motif: "warpath-motif",
  shots: [
    /* 0 · CALL — the weather turns on the real board. */
    {
      id: "call",
      kind: "call",
      purpose:
        "The round stops and the weather turns: the real battlefield goes slate, snow starts driving across it, and the Warlord throws its sword forward at the enemy.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [SLATE, 0], letterbox: 0 },
      toLighting: { tint: [SLATE, 0.6], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:warpath-call" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: RUST },
        { kind: "warpath-snow", at: 0, until: 1, layer: "screen", seed: 3, params: { count: 70, wind: -1.1, fall: 0.5, near: 0.04, fadeIn: 0.8 } },
      ],
      sound: [{ at: 0, sfx: "warpath-call" }],
      duck: [{ at: 0, level: 0.3, ms: 4200 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · ROAR — face close-up: the helm's warcry, as breath. */
    {
      id: "roar",
      kind: "face-close-up",
      purpose:
        "Identity. The faceless helm in profile in the blizzard: drawn back as the breath comes in, then thrown forward into the roar, a plume of breath torn out of the visor and back over the crest, the cape whipping. The Warlord's warcry, with no sound drawn.",
      space: "cinematic",
      ms: 620,
      fastMs: 380,
      transition: { kind: "black", ms: 80 },
      camera: {
        from: { x: 740, y: 600, zoom: 1.95 },
        to: { x: 752, y: 596, zoom: 2.1 },
        ease: "out",
      },
      background: "warpath-field",
      lighting: { exposure: 0.8, rim: [RUST, 0.55, 1], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.86, rim: [RUST, 0.75, 1], vignette: 0.45, letterbox: BARS },
      actors: [
        { role: "caster", at: [700, 1250], size: 1000, clip: "ult:warpath-roar", then: "ult:warpath-roar", look: "lit", rim: RUST, root: false },
      ],
      vfx: [
        { kind: "warpath-breath", at: 0.44, until: 1, follow: "caster", x: 95, y: -652, scale: 1.3, layer: "front", seed: 5, params: { from: 0, back: 1.1, rise: 1 } },
        { kind: "warpath-snow", at: 0, until: 1, layer: "screen", seed: 7, params: { count: 80, wind: -1.8, fall: 0.35, near: 0.12 } },
        { kind: "warpath-gust", at: 0.8, until: 1, layer: "screen", seed: 21, params: { phase: "in" } },
      ],
      sound: [
        { at: 0, sfx: "warpath-wind" },
        { at: 0.2, sfx: "warpath-roar" },
        { at: 0.84, sfx: "warpath-gust" },
      ],
      text: [{ kind: "voice", at: 0.5, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.46, label: "roar" }],
    },

    /* 2 · BREAKING TRAIL — the wide: the Warlord wades at the lens, the party in its tracks. */
    {
      id: "trail",
      kind: "wide-hero",
      purpose:
        "Stakes. Low at the snow's surface, the Warlord wades hip-deep diagonally at the lens, heaving the drift aside with its shield; behind it the real party wades single file in its trench, in step; far ahead on the white the real enemy it is walking at sees it coming. The motif lands on the footfalls.",
      space: "cinematic",
      ms: 1000,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 780, y: 560, zoom: 1.34 },
        to: { x: 830, y: 575, zoom: 1.42 },
        ease: "inOut",
      },
      background: "warpath-field",
      lighting: { exposure: 0.92, rim: [RUST, 0.5, 1], vignette: 0.38, letterbox: BARS },
      toLighting: { exposure: 0.95, rim: [RUST, 0.6, 1], vignette: 0.36, letterbox: BARS },
      actors: [
        { role: "target", at: [1330, 610], size: 210, face: -1, look: "lit", z: 1, react: [{ at: 0.7, clip: "anticipate", then: "idle" }] },
        {
          role: "allies",
          at: [520, 700],
          to: [590, 716],
          ease: "linear",
          spread: [-165, -46],
          size: 330,
          look: "lit",
          z: 2,
          clip: "ult:warpath-follow",
          then: "ult:warpath-follow",
        },
        {
          role: "caster",
          at: [760, 820],
          to: [880, 868],
          ease: "linear",
          size: 470,
          toSize: 520,
          clip: "ult:warpath-wade",
          then: "ult:warpath-wade",
          look: "lit",
          rim: RUST,
          z: 3,
        },
      ],
      vfx: [
        { kind: "warpath-drift", at: 0, until: 1, layer: "front", seed: 3, params: { depth: 0.27, targetDepth: 0.06, heave: 1, stride: 1000 } },
        { kind: "warpath-snow", at: 0, until: 1, layer: "screen", seed: 13, params: { count: 90, wind: -1.4, fall: 0.45, near: 0.06 } },
        { kind: "warpath-gust", at: 0, until: 0.22, layer: "screen", seed: 21, params: { phase: "out" } },
      ],
      sound: [
        { at: 0, sfx: "warpath-wind" },
        { at: 0.1, sfx: "warpath-motif" },
      ],
      text: [
        { kind: "name", at: 0.28, until: 1, text: "$name", x: 0.44, y: 0.13, rotate: -2 },
        { kind: "epithet", at: 0.38, until: 1, text: "$epithet", x: 0.44, y: 0.23 },
      ],
      markers: [
        { at: 0.28, label: "title" },
        { at: 0.7, label: "seen" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 800, y: 530, zoom: 1.24 },
            to: { x: 850, y: 545, zoom: 1.3 },
            ease: "inOut",
          },
        },
        boss: {
          camera: {
            from: { x: 820, y: 500, zoom: 1.12 },
            to: { x: 860, y: 510, zoom: 1.18 },
            ease: "inOut",
          },
          actors: [
            { role: "target", at: [1330, 640], size: 200, face: -1, look: "lit", z: 1, react: [{ at: 0.7, clip: "anticipate", then: "idle" }] },
            {
              role: "allies",
              at: [500, 700],
              to: [570, 716],
              ease: "linear",
              spread: [-165, -46],
              size: 330,
              look: "lit",
              z: 2,
              clip: "ult:warpath-follow",
              then: "ult:warpath-follow",
            },
            {
              role: "caster",
              at: [740, 830],
              to: [860, 878],
              ease: "linear",
              size: 460,
              toSize: 500,
              clip: "ult:warpath-wade",
              then: "ult:warpath-wade",
              look: "lit",
              rim: RUST,
              z: 3,
            },
          ],
        },
      },
    },

    /* 3 · THE TRAIL FROM ABOVE — the quiet. */
    {
      id: "above",
      kind: "aftermath",
      purpose:
        "The quiet. From high above the plain and dead still: the trail is one dark stroke across the white from the edge of the world to the Warlord, the file of tiny figures stopped on it, the enemy a step beyond its end. The wind drops dead, the snow sinks straight down, and a cloud's shadow crosses the field.",
      space: "cinematic",
      ms: 560,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: {
        from: { x: 900, y: 830, zoom: 1.4 },
        to: { x: 902, y: 830, zoom: 1.42 },
        ease: "linear",
      },
      background: "warpath-field",
      lighting: { exposure: 0.8, rim: [RUST, 0.3, 1], vignette: 0.55, letterbox: 0.13 },
      toLighting: { exposure: 0.5, rim: [RUST, 0.3, 1], vignette: 0.78, letterbox: 0.14 },
      actors: [
        { role: "target", at: [1150, 780], size: 150, face: -1, look: "lit", z: 1, clip: "block", then: "idle" },
        {
          role: "allies",
          at: [880, 830],
          spread: [-110, 40],
          size: 140,
          look: "lit",
          z: 2,
          clip: "ult:warpath-halt",
          then: "ult:warpath-halt",
        },
        { role: "caster", at: [1010, 795], size: 150, clip: "ult:warpath-step", then: "ult:warpath-step", look: "lit", rim: RUST, z: 3 },
      ],
      vfx: [
        { kind: "warpath-trail", at: 0, until: 1, layer: "back", seed: 9, params: { x0: 300, y0: 1200, width: 24 } },
        { kind: "warpath-snow", at: 0, until: 1, layer: "screen", seed: 17, params: { mode: "settle", count: 46, wind: -0.03, fall: 0.07, near: 0.03 } },
      ],
      duck: [{ at: 0, level: 0.05, ms: 560 }],
      sound: [{ at: 0.12, sfx: "warpath-hush" }],
      markers: [{ at: 0.4, label: "held" }],
      framing: {
        boss: {
          camera: {
            from: { x: 920, y: 800, zoom: 1.3 },
            to: { x: 922, y: 800, zoom: 1.32 },
            ease: "linear",
          },
          actors: [
            { role: "target", at: [1190, 820], size: 88, face: -1, look: "lit", z: 1, clip: "block", then: "idle" },
            {
              role: "allies",
              at: [860, 840],
              spread: [-110, 40],
              size: 140,
              look: "lit",
              z: 2,
              clip: "ult:warpath-halt",
              then: "ult:warpath-halt",
            },
            { role: "caster", at: [990, 805], size: 150, clip: "ult:warpath-step", then: "ult:warpath-step", look: "lit", rim: RUST, z: 3 },
          ],
        },
      },
    },

    /* 4 · THE LAST STEP — impact. */
    {
      id: "blow",
      kind: "impact",
      purpose:
        "Impact. Out of the quiet, the last step and the blow: the sword over the top and down onto the real enemy; a two-tone frame of snow and ink, and the hit-stop holds the blade on it, the white split open at the contact and the snow at its feet ripped up and thrown back past it. Marked and Vulnerable and the damage on the held frame; then the party wades into the shot behind the Warlord, in its tracks, and stops beside it.",
      space: "cinematic",
      ms: 820,
      fastMs: 600,
      transition: { kind: "cut" },
      camera: {
        from: { x: 800, y: 620, zoom: 1.6, rotate: -5 },
        to: { x: 770, y: 612, zoom: 1.46, rotate: -2 },
        ease: "out",
      },
      background: "warpath-field",
      lighting: { exposure: 1, tint: [ICE, 0.15], rim: [RUST, 1, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.85, tint: [ICE, 0], rim: [RUST, 0.6, 1], vignette: 0.4, letterbox: BARS },
      actors: [
        {
          role: "target",
          at: [TARGET.x, TARGET.y],
          size: 440,
          face: -1,
          z: 1,
          react: [{ at: 0.06, clip: "hurt" }],
          shove: { at: 0.2, by: [170, -4] },
          toTilt: 9,
        },
        {
          role: "allies",
          at: [60, 820],
          to: [330, 830],
          ease: "out",
          spread: [-150, -18],
          size: 400,
          look: "lit",
          z: 1,
          clip: "ult:warpath-follow",
          then: "ult:warpath-follow",
          react: [{ at: 0.82, clip: "ult:warpath-halt", then: "ult:warpath-halt" }],
        },
        {
          role: "caster",
          at: [CASTER.x, CASTER.y],
          size: 470,
          clip: "ult:warpath-cleave",
          then: "ult:warpath-cleave",
          react: [{ at: 0.16, clip: "ult:warpath-through", then: "ult:warpath-through" }],
          look: "lit",
          rim: RUST,
          z: 2,
        },
      ],
      vfx: [
        { kind: "warpath-drift", at: 0, until: 1, layer: "front", seed: 7, params: { depth: 0.2, targetDepth: 0.1, heave: 0 } },
        { kind: "warpath-cleave", at: 0.045, until: 0.42, x: CONTACT.x, y: CONTACT.y, rotate: 42, scale: 0.8, layer: "front", seed: 4 },
        { kind: "warpath-throw", at: 0.05, until: 0.95, x: TARGET.x + 60, y: TARGET.y - 40, scale: 1, layer: "front", seed: 8, params: { dir: 1 } },
        { kind: "warpath-snow", at: 0.1, until: 1, layer: "screen", seed: 19, params: { count: 70, wind: -1.2, fall: 0.45, near: 0.05, fadeIn: 0.3 } },
      ],
      screen: [
        { kind: "two-tone", at: 0.014, ms: 24, color: SNOW, mode: "full" },
        { kind: "invert", at: 0.014, ms: 20, mode: "fast" },
        { kind: "chromatic", at: 0.047, ms: 160, amount: 0.8 },
        { kind: "radial", at: 0.047, ms: 220, amount: 0.8, color: ICE },
      ],
      stop: [{ at: 0.047, ms: 150 }],
      shake: [
        { at: 0.047, amount: 0.04 },
        { at: 0.3, amount: 0.014 },
      ],
      sound: [
        { at: 0.045, sfx: "warpath-impact" },
        { at: 0.06, sfx: "ult-boom" },
        { at: 0.62, sfx: "warpath-crunch" },
      ],
      reveal: [{ at: 0.047, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.048, until: 0.9, text: "$damage", x: 0.72, y: 0.24, rotate: 5 },
        { kind: "voice", at: 0.3, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: 0.047, label: "contact" }],
      framing: {
        large: {
          camera: {
            from: { x: 820, y: 590, zoom: 1.45, rotate: -5 },
            to: { x: 790, y: 585, zoom: 1.32, rotate: -2 },
            ease: "out",
          },
        },
        boss: {
          camera: {
            from: { x: 880, y: 545, zoom: 0.92, rotate: -4 },
            to: { x: 860, y: 540, zoom: 0.87, rotate: -1.5 },
            ease: "out",
          },
          actors: [
            {
              role: "target",
              at: [BOSS.target.x, BOSS.target.y],
              size: 420,
              face: -1,
              z: 1,
              react: [{ at: 0.06, clip: "hurt" }],
              shove: { at: 0.2, by: [50, 0] },
              toTilt: 3,
            },
            {
              role: "allies",
              at: [80, 860],
              to: [340, 870],
              ease: "out",
              spread: [-150, -18],
              size: 380,
              look: "lit",
              z: 1,
              clip: "ult:warpath-follow",
              then: "ult:warpath-follow",
              react: [{ at: 0.82, clip: "ult:warpath-halt", then: "ult:warpath-halt" }],
            },
            {
              role: "caster",
              at: [BOSS.caster.x, BOSS.caster.y],
              size: 440,
              clip: "ult:warpath-cleave",
              then: "ult:warpath-cleave",
              react: [{ at: 0.16, clip: "ult:warpath-through", then: "ult:warpath-through" }],
              look: "lit",
              rim: RUST,
              z: 2,
            },
          ],
          vfx: [
            { kind: "warpath-drift", at: 0, until: 1, layer: "front", seed: 7, params: { depth: 0.2, targetDepth: 0.05, heave: 0 } },
            { kind: "warpath-cleave", at: 0.045, until: 0.42, x: BOSS.contact.x, y: BOSS.contact.y, rotate: 42, scale: 1.05, layer: "front", seed: 4 },
            { kind: "warpath-throw", at: 0.05, until: 0.95, x: BOSS.target.x + 40, y: BOSS.target.y - 40, scale: 1.4, layer: "front", seed: 8, params: { dir: 1 } },
            { kind: "warpath-snow", at: 0.1, until: 1, layer: "screen", seed: 19, params: { count: 70, wind: -1.2, fall: 0.45, near: 0.05, fadeIn: 0.3 } },
          ],
        },
      },
    },

    /* 5 · FRONT LINE — back on the board. */
    {
      id: "front",
      kind: "return",
      purpose:
        "Release. The film hands back to the fight and what it did is where it matters: the whole party standing in the front line, snowy boot prints leading into each of them, and the trail trampled round the feet of the enemy it ended at; the Warlord's sword pointed along it. The snow thins away.",
      space: "battlefield",
      ms: 720,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [SLATE, 0.45], letterbox: BARS },
      toLighting: { tint: [SLATE, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:warpath-stand" }],
      vfx: [
        { kind: "warpath-board", at: 0.02, until: 1, anchor: "party", stagger: 70, seed: 13, params: { mode: "prints" } },
        { kind: "warpath-board", at: 0.1, until: 1, anchor: "targets", seed: 29, params: { mode: "end" } },
        { kind: "warpath-board", at: 0.04, until: 1, anchor: "caster", seed: 31, params: { mode: "lead" } },
        { kind: "warpath-snow", at: 0, until: 1, layer: "screen", seed: 23, params: { count: 50, wind: -0.8, fall: 0.4, near: 0.02, fadeOut: 0.35 } },
      ],
      sound: [
        { at: 0.08, sfx: "warpath-reprise" },
        { at: 0.45, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.06, label: "front line" }],
    },
  ],
};
