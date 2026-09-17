import type { Cinematic } from "../../shared/cinematic";

/**
 * FORECLOSURE — the Broker's Ultimate.
 *
 * The idea, in one sentence: the Broker weighs whatever the enemy is standing
 * behind against one coin of its own, finds it worth less, and repossesses it
 * — knocks it off the enemy with the ledger and pays it out, re-minted, as the
 * party's Barrier.
 *
 * Only the Broker could have it: the brass balance it holds out in every
 * round, with a coin always in the pan, is the whole film, and the ledger it
 * brings over its cap in a leveraged strike is the one blow in it. The space
 * is its repossession vault — shelves of other people's shields, each with a
 * price tag — under one banker's lamp; brass is the only warm thing in it.
 *
 * Rhythm: identity (the appraisal over the spectacles; a coin flicked off the
 * pan at the lens) → stakes and target (the coin drops out of the lens into
 * the vault's great balance, and the target, standing in the other pan behind
 * its collateral, is flung up: worth less than one coin; title) → the quiet
 * (the coin spins down on the brass while the face goes cold; music to 5%;
 * the whirr stops dead) → impact (brass-and-ink frame; the ledger comes down,
 * the collateral is knocked off and flung back, the tag tears) → release (on
 * the real board, the proceeds land on the party as minted wards).
 *
 * Gameplay it shows, each where it happens: the target's Barrier seized (the
 * collateral knocked off at the blow), 26 and Vulnerable (the damage on the
 * drawn frame; the price tag torn and left hanging), +30 gold and 8 Barrier on
 * every ally (coin from the target to each of the party and to the treasury,
 * each landing as a ward as the Barrier is revealed).
 *
 * It shares nothing with the other films: no light, force, weather, glass,
 * water or lines; no charge and no projectile; its transition is a coin
 * across the lens; its quiet is a sound stopping, and its drawn frame is a
 * coin's milled rim. Storyboard: `docs/ultimates/foreclosure.md`.
 */

const BRASS = "#f3d487";
const GREEN = "#06140d";
const HOT = "#fff3cf";
const BARS = 0.1;

export const foreclosure: Cinematic = {
  id: "foreclosure",
  heroId: "broker",
  motif: "foreclosure-motif",
  shots: [
    /* 0 · CALL — a price tag drops onto the real target. */
    {
      id: "call",
      kind: "call",
      purpose:
        "The round stops: the real battlefield sinks into bottle green, the Broker raises its balance to its spectacles, and a price tag drops onto the target on a red string.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [GREEN, 0], letterbox: 0 },
      toLighting: { tint: [GREEN, 0.5], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:appraise" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: BRASS },
        { kind: "foreclosure-tag", at: 0.15, until: 1, anchor: "targets", params: { mode: "drop", size: 2.6 } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.4, sfx: "foreclosure-bell" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4300 }],
      markers: [
        { at: 0, label: "called" },
        { at: 0.5, label: "priced" },
      ],
    },

    /* 1 · APPRAISAL — detail: over the spectacles, along the beam; a coin flicked at the lens. */
    {
      id: "appraisal",
      kind: "detail",
      purpose:
        "Identity. The balance comes up level with the spectacles; the Broker peers over them, narrows to a squint, then flicks the pan — and a coin jumps off it, turning over, straight at the lens.",
      space: "cinematic",
      ms: 560,
      fastMs: 360,
      transition: { kind: "black", ms: 50 },
      camera: {
        from: { x: 850, y: 745, zoom: 2.3, rotate: -7 },
        to: { x: 880, y: 735, zoom: 2.55, rotate: -4 },
        ease: "out",
      },
      background: "foreclosure-vault",
      lighting: { exposure: 0.42, rim: [BRASS, 0.55, 1], vignette: 0.7, letterbox: BARS },
      toLighting: { exposure: 0.55, rim: [BRASS, 0.8, 1], vignette: 0.6, letterbox: BARS },
      actors: [{ role: "caster", at: [700, 1350], size: 1000, clip: "ult:appraise", look: "lit" }],
      vfx: [
        { kind: "motes", at: 0, until: 1, x: 900, y: 640, scale: 1.4, color: BRASS, seed: 9, layer: "back", params: { still: true } },
        { kind: "glint", at: 0.36, until: 0.62, follow: "caster", x: 20, y: -655, scale: 0.55, color: HOT, layer: "front" },
        { kind: "foreclosure-coin", at: 0.72, until: 1, follow: "caster", x: 360, y: -455, layer: "front", params: { mode: "flick", size: 56, rise: 240 } },
        { kind: "foreclosure-coin", at: 0.84, until: 1, layer: "screen", params: { mode: "cover" } },
      ],
      sound: [
        { at: 0.05, sfx: "foreclosure-appraise" },
        { at: 0.72, sfx: "foreclosure-flick" },
      ],
      text: [{ kind: "voice", at: 0.2, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.5, label: "squint" },
        { at: 0.72, label: "flick" },
      ],
    },

    /* 2 · WEIGHING — wide: one coin against everything the target stands behind. */
    {
      id: "weighing",
      kind: "wide-hero",
      purpose:
        "Stakes and target. The coin falls out of the lens into one pan of the vault's great balance; the real target stands in the other, behind its collateral, and is flung up — worth less than one coin. Title.",
      space: "cinematic",
      ms: 1000,
      fastMs: 520,
      transition: { kind: "cut" },
      camera: {
        from: { x: 810, y: 450, zoom: 1.12 },
        to: { x: 830, y: 440, zoom: 1.2, rotate: -0.8 },
        ease: "inOut",
      },
      background: "foreclosure-vault",
      lighting: { exposure: 0.8, rim: [BRASS, 0.7, 1], vignette: 0.45, letterbox: BARS },
      toLighting: { exposure: 0.9, rim: [BRASS, 0.9, 1], vignette: 0.4, letterbox: BARS },
      actors: [
        {
          role: "target",
          at: [1180, 640],
          size: 240,
          face: -1,
          z: 1,
          react: [{ at: 0.36, clip: "anticipate", then: "idle" }],
          shove: { at: 0.36, by: [0, -80] },
        },
        { role: "caster", at: [250, 930], size: 620, clip: "ult:weigh", look: "rim", rim: BRASS, z: 3 },
      ],
      vfx: [
        { kind: "foreclosure-balance", at: 0, until: 1, layer: "back", params: { part: "back", px: 890, rest: 640, floor: 930 } },
        { kind: "foreclosure-balance", at: 0, until: 1, layer: "front", params: { part: "front", px: 890, rest: 640 } },
        { kind: "foreclosure-collateral", at: 0, until: 1, follow: "target", layer: "front", params: { mode: "hold", ox: -0.18, oy: 0.5, size: 0.95 } },
        { kind: "foreclosure-tag", at: 0, until: 1, follow: "target", layer: "front", params: { mode: "hang", ox: 0.12, oy: 0.95, size: 1 } },
        { kind: "foreclosure-coin", at: 0.06, until: 1, layer: "front", params: { mode: "drop", size: 46, land: (0.36 - 0.06) / 0.94 } },
        { kind: "foreclosure-coin", at: 0, until: 0.14, layer: "screen", params: { mode: "reveal" } },
      ],
      sound: [
        { at: 0.36, sfx: "foreclosure-drop" },
        { at: 0.46, sfx: "foreclosure-motif" },
      ],
      text: [
        { kind: "name", at: 0.44, until: 1, text: "$name", x: 0.05, y: 0.2 },
        { kind: "epithet", at: 0.52, until: 1, text: "$epithet", x: 0.05, y: 0.29 },
      ],
      markers: [
        { at: 0.36, label: "coin lands" },
        { at: 0.44, label: "title" },
      ],
      framing: {
        boss: {
          camera: {
            from: { x: 810, y: 440, zoom: 1.0 },
            to: { x: 830, y: 430, zoom: 1.06, rotate: -0.8 },
            ease: "inOut",
          },
          actors: [
            {
              role: "target",
              at: [1180, 670],
              size: 220,
              face: -1,
              z: 1,
              react: [{ at: 0.36, clip: "anticipate", then: "idle" }],
              shove: { at: 0.36, by: [0, -60] },
            },
            { role: "caster", at: [240, 950], size: 620, clip: "ult:weigh", look: "rim", rim: BRASS, z: 3 },
          ],
          vfx: [
            { kind: "foreclosure-balance", at: 0, until: 1, layer: "back", params: { part: "back", px: 880, rest: 670, floor: 950 } },
            { kind: "foreclosure-balance", at: 0, until: 1, layer: "front", params: { part: "front", px: 880, rest: 670 } },
            { kind: "foreclosure-collateral", at: 0, until: 1, follow: "target", layer: "front", params: { mode: "hold", ox: -0.12, oy: 0.46, size: 0.8 } },
            { kind: "foreclosure-tag", at: 0, until: 1, follow: "target", layer: "front", params: { mode: "hang", ox: 0.1, oy: 0.9, size: 0.8 } },
            { kind: "foreclosure-coin", at: 0.06, until: 1, layer: "front", params: { mode: "drop", size: 46, land: (0.36 - 0.06) / 0.94 } },
            { kind: "foreclosure-coin", at: 0, until: 0.14, layer: "screen", params: { mode: "reveal" } },
          ],
        },
      },
    },

    /* 3 · SETTLE — face close-up: the coin spins down; the quiet. */
    {
      id: "settle",
      kind: "face-close-up",
      purpose:
        "The quiet. The coin spins down on the brass in the foreground while the music falls away; the Broker's eyes follow it, the brows come down onto the spectacles, the mouth goes flat — and as the whirr stops dead and the book is drawn back out of frame, one corner of it lifts.",
      space: "cinematic",
      ms: 620,
      fastMs: 400,
      transition: { kind: "cut" },
      camera: {
        from: { x: 720, y: 790, zoom: 2.25 },
        to: { x: 712, y: 794, zoom: 2.4 },
        ease: "linear",
      },
      background: "foreclosure-vault",
      lighting: { exposure: 0.3, rim: [BRASS, 0.85, 1], vignette: 0.85, letterbox: 0.13 },
      toLighting: { exposure: 0.16, rim: [BRASS, 1, 1], vignette: 0.92, letterbox: 0.14 },
      actors: [{ role: "caster", at: [620, 1500], size: 1100, clip: "ult:settle", then: "ult:settle", look: "rim", rim: BRASS }],
      vfx: [{ kind: "foreclosure-coin", at: 0, until: 1, x: 900, y: 915, layer: "front", params: { mode: "spin", size: 120, flat: 0.86 } }],
      duck: [{ at: 0, level: 0.05, ms: 700 }],
      sound: [
        { at: 0.02, sfx: "foreclosure-spin", mode: "full" },
        { at: 0.02, sfx: "foreclosure-spin-fast", mode: "fast" },
      ],
      markers: [{ at: 0.86, label: "flat" }],
    },

    /* 4 · FORECLOSURE — the blow; the collateral seized. */
    {
      id: "foreclosure",
      kind: "impact",
      purpose:
        "Impact. On a brass-and-ink frame the ledger comes down on the target; its collateral is knocked off and flung back past the Broker, turning over and shedding coin, a coin's milled rim bursts from the blow, and the price tag tears.",
      space: "cinematic",
      ms: 780,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 770, y: 560, zoom: 1.46, rotate: 6 },
        to: { x: 760, y: 565, zoom: 1.34, rotate: 2 },
        ease: "out",
      },
      background: "foreclosure-vault",
      lighting: { exposure: 1, tint: [BRASS, 0.3], back: [BRASS, 0.95], rim: [BRASS, 1, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.78, tint: [BRASS, 0], back: [BRASS, 0.25], rim: [BRASS, 0.7, 1], vignette: 0.42, letterbox: BARS },
      actors: [
        { role: "caster", at: [640, 900], size: 620, clip: "ult:foreclose", then: "ult:foreclose", look: "rim", rim: BRASS, z: 2 },
        {
          role: "target",
          at: [960, 860],
          size: 500,
          face: -1,
          z: 1,
          react: [{ at: 0.07, clip: "hurt" }],
          shove: { at: 0.07, by: [60, -6] },
          toTilt: 6,
        },
      ],
      vfx: [
        { kind: "foreclosure-glow", at: 0, until: 1, follow: "target", layer: "back" },
        { kind: "foreclosure-collateral", at: 0, until: 1, follow: "target", layer: "front", seed: 41, params: { mode: "seize", hit: 0.07, ox: -0.2, oy: 0.5, size: 0.95, fly: -1 } },
        { kind: "foreclosure-tag", at: 0, until: 1, follow: "target", layer: "front", params: { mode: "tear", hit: 0.07, ox: 0.12, oy: 0.95 } },
        { kind: "foreclosure-mill", at: 0.07, until: 0.5, follow: "target", layer: "front", params: { ox: -0.3, oy: 0.55, size: 1 } },
        { kind: "sparks", at: 0.07, until: 0.5, follow: "target", x: -140, y: -250, scale: 1.1, color: BRASS, seed: 5, layer: "front" },
      ],
      screen: [
        { kind: "two-tone", at: 0.07, ms: 70 },
        { kind: "flash", at: 0.14, ms: 60, amount: 0.5, color: HOT },
        { kind: "chromatic", at: 0.07, ms: 120, amount: 0.7 },
      ],
      stop: [{ at: 0.07, ms: 140 }],
      shake: [
        { at: 0.07, amount: 0.032 },
        { at: 0.3, amount: 0.01 },
      ],
      sound: [
        { at: 0.065, sfx: "foreclosure-impact" },
        { at: 0.1, sfx: "foreclosure-coins" },
      ],
      reveal: [{ at: 0.07, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.08, until: 0.9, text: "$damage", x: 0.62, y: 0.22, rotate: 4 },
        { kind: "voice", at: 0.3, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: 0.07, label: "foreclosed" }],
      framing: {
        large: {
          camera: {
            from: { x: 780, y: 520, zoom: 1.32, rotate: 5 },
            to: { x: 770, y: 525, zoom: 1.22, rotate: 2 },
            ease: "out",
          },
        },
        boss: {
          camera: {
            from: { x: 800, y: 470, zoom: 1.08, rotate: 4 },
            to: { x: 790, y: 475, zoom: 1.0, rotate: 1.5 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [600, 920], size: 560, clip: "ult:foreclose", then: "ult:foreclose", look: "rim", rim: BRASS, z: 2 },
            {
              role: "target",
              at: [1030, 900],
              size: 380,
              face: -1,
              z: 1,
              react: [{ at: 0.07, clip: "hurt" }],
              shove: { at: 0.07, by: [18, 0] },
              toTilt: 2,
            },
          ],
          vfx: [
            { kind: "foreclosure-glow", at: 0, until: 1, follow: "target", layer: "back" },
            { kind: "foreclosure-collateral", at: 0, until: 1, follow: "target", layer: "front", seed: 41, params: { mode: "seize", hit: 0.07, ox: -0.14, oy: 0.46, size: 0.8, fly: -1 } },
            { kind: "foreclosure-tag", at: 0, until: 1, follow: "target", layer: "front", params: { mode: "tear", hit: 0.07, ox: 0.1, oy: 0.9, size: 0.8 } },
            { kind: "foreclosure-mill", at: 0.07, until: 0.5, follow: "target", layer: "front", params: { ox: -0.24, oy: 0.5, size: 0.9 } },
            { kind: "sparks", at: 0.07, until: 0.5, follow: "target", x: -140, y: -300, scale: 1.3, color: BRASS, seed: 5, layer: "front" },
          ],
        },
      },
    },

    /* 5 · PROCEEDS — the real board: the guard moves from them to us. */
    {
      id: "proceeds",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield the proceeds arc from the target to every real party member and into the treasury, and each coin lands as a minted disc with the Broker's mark: the Barrier. The torn tag is left hanging on the target.",
      space: "battlefield",
      ms: 860,
      fastMs: 560,
      transition: { kind: "flash", ms: 70 },
      background: "battlefield",
      lighting: { tint: [GREEN, 0.4], letterbox: BARS },
      toLighting: { tint: [GREEN, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:collect" }],
      vfx: [
        { kind: "foreclosure-tag", at: 0, until: 1, anchor: "targets", params: { mode: "left", size: 2.6 } },
        { kind: "foreclosure-ward", at: 0.34, until: 1, anchor: "party", stagger: 70 },
        { kind: "foreclosure-proceeds", at: 0, until: 1, anchor: "targets" },
      ],
      sound: [
        { at: 0.3, sfx: "foreclosure-paid" },
        { at: 0.55, sfx: "ult-tail" },
      ],
      reveal: [
        { at: 0.34, reveal: "ward" },
        { at: 0.6, reveal: "all" },
      ],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.34, label: "proceeds land" }],
    },
  ],
};
