import type { Cinematic } from "../../shared/cinematic";

/**
 * DEBT OF THUNDER — the Arcanist's Ultimate.
 *
 * Fantasy: "power is a debt worth taking." The Arcanist does not call a
 * storm; it borrows one. The tome tears itself open and its pages climb into
 * a sky with a promissory seal written in the clouds, every enemy is drowned
 * in the rain that follows, and then the debt is called in all at once — one
 * bolt through the seal, and Chain Shock running down a line of soaked
 * targets.
 *
 * Rhythm: identity (the book) → stakes (the whole line, drenched) →
 * anticipation (silence under the brim) → escalation (the hand raised to the
 * seal) → impact (the bolt and the chain) → release (steam and dripping on
 * the real board). The noisiest thing before the silence is rain, so the
 * silence is the rain *stopping*.
 *
 * Gameplay it shows: Wet on every enemy, 26 lightning on the target, Chain
 * Shock on the rest — which is why the arcs are in the film at all: they are
 * the reaction the party can keep using after it.
 */

const STORM = "#8fd3ff";
const PALE = "#e6f6ff";
const BARS = 0.11;

export const debtOfThunder: Cinematic = {
  id: "debt-of-thunder",
  heroId: "arcanist",
  motif: "motif-arcanist",
  shots: [
    /* 0 · CALL — the real sky darkens, and it starts to rain on the fight. */
    {
      id: "call",
      kind: "call",
      purpose: "The round stops: the Arcanist's eyes catch light and rain starts to fall on the real battlefield.",
      space: "battlefield",
      ms: 420,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: ["#050a14", 0], letterbox: 0 },
      toLighting: { tint: ["#050a14", 0.6], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "cast" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: STORM },
        { kind: "rain", at: 0.25, until: 1, layer: "screen", color: STORM, seed: 3 },
      ],
      sound: [
        { at: 0, sfx: "ult-thunder-far" },
        { at: 0.05, sfx: "ult-call" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4400 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · LEDGER — detail: the tome opens itself and its pages climb. */
    {
      id: "ledger",
      kind: "detail",
      purpose:
        "Identity. The debt is on paper: the tome held up behind the Arcanist tears itself open and the pages rise into the storm.",
      space: "cinematic",
      ms: 640,
      fastMs: 400,
      transition: { kind: "black", ms: 60 },
      camera: {
        from: { x: 690, y: 480, zoom: 2.05, rotate: -6 },
        to: { x: 700, y: 440, zoom: 2.3, rotate: -4 },
        ease: "out",
      },
      background: "storm-ledger",
      lighting: {
        exposure: 0.3,
        under: [STORM, 0.35],
        rim: [STORM, 0.6, -1],
        vignette: 0.7,
        letterbox: BARS,
      },
      toLighting: {
        exposure: 0.42,
        under: [STORM, 0.7],
        rim: [STORM, 0.9, -1],
        vignette: 0.6,
        letterbox: BARS,
      },
      actors: [
        { role: "caster", at: [800, 880], size: 720, clip: "ult:open", then: "ult:open", look: "rim", rim: STORM },
      ],
      vfx: [
        { kind: "pages", at: 0.3, until: 1, follow: "caster", x: -221, y: -440, scale: 1, seed: 21, layer: "front" },
        { kind: "glint", at: 0.2, until: 0.5, follow: "caster", x: -221, y: -440, scale: 0.9, layer: "front" },
        { kind: "rain", at: 0, until: 1, layer: "screen", color: STORM, seed: 5 },
      ],
      sound: [
        { at: 0.3, sfx: "ult-pages" },
        { at: 0.5, sfx: "ult-thunder-far" },
      ],
      text: [{ kind: "voice", at: 0.4, until: 1, text: "$voice.activation" }],
    },

    /* 2 · DOWNPOUR — high wide: every enemy on the line, drowned. */
    {
      id: "downpour",
      kind: "wide-hero",
      purpose:
        "Stakes. Every real enemy the storm will reach stands in a flood under the seal, and the rain comes down on all of them.",
      space: "cinematic",
      ms: 920,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 900, y: 470, zoom: 1.15 },
        to: { x: 920, y: 500, zoom: 1.3, rotate: 1 },
        ease: "inOut",
      },
      background: "storm-ledger",
      lighting: { exposure: 0.6, under: [STORM, 0.2], back: ["#16304d", 0.4], vignette: 0.45, letterbox: BARS },
      toLighting: { exposure: 0.72, under: [STORM, 0.3], back: ["#16304d", 0.5], vignette: 0.4, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [900, 740],
          spread: [240, -20],
          size: 270,
          face: -1,
          z: 1,
          react: [{ at: 0.22, clip: "block" }],
        },
        { role: "caster", at: [230, 980], size: 660, clip: "ult:call", then: "ult:call", look: "rim", rim: STORM, z: 3 },
      ],
      vfx: [
        { kind: "rune-circle", at: 0.2, until: 1, x: 1040, y: 150, scale: 1.4, color: STORM, layer: "back" },
        { kind: "wet", at: 0.2, until: 1, each: "targets", color: STORM, layer: "front" },
        { kind: "rain", at: 0, until: 1, layer: "screen", color: STORM, seed: 7, params: { heavy: true } },
      ],
      sound: [
        { at: 0, sfx: "ult-rain" },
        { at: 0.12, sfx: "motif-arcanist" },
      ],
      text: [
        { kind: "name", at: 0.38, until: 1, text: "$name", x: 0.08, y: 0.24 },
        { kind: "epithet", at: 0.48, until: 1, text: "$epithet", x: 0.08, y: 0.34 },
      ],
      markers: [{ at: 0.38, label: "title" }],
    },

    /* 3 · BRIM — face close-up: the rain stops; drops hang off the brim. */
    {
      id: "brim",
      kind: "face-close-up",
      purpose:
        "Anticipation. The rain cuts out. Under the brim, drops hang in the air, the eyes come up out of shadow, and one drop falls.",
      space: "cinematic",
      ms: 560,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: {
        from: { x: 790, y: 430, zoom: 3.1, rotate: 3 },
        to: { x: 800, y: 422, zoom: 3.45, rotate: 2 },
        ease: "linear",
      },
      background: "storm-ledger",
      lighting: { exposure: 0.1, rim: [STORM, 0.8, 1], vignette: 0.9, letterbox: 0.15 },
      toLighting: { exposure: 0.06, rim: [STORM, 1, 1], vignette: 0.92, letterbox: 0.15 },
      actors: [{ role: "caster", at: [800, 1000], size: 900, clip: "ult:gaze", then: "ult:gaze", look: "rim", rim: STORM }],
      vfx: [
        { kind: "drops", at: 0, until: 1, follow: "caster", x: -10, y: -600, scale: 1.8, color: STORM, layer: "front", params: { still: true } },
        { kind: "drops", at: 0.55, until: 1, follow: "caster", x: 60, y: -600, scale: 1.8, color: STORM, seed: 9, layer: "front" },
      ],
      duck: [{ at: 0, level: 0.06, ms: 560 }],
      sound: [
        { at: 0.55, sfx: "ult-drip" },
        { at: 0.82, sfx: "ult-charge-arc" },
      ],
      text: [{ kind: "name", at: 0.05, until: 1, text: "$name", x: 0.08, y: 0.72, mode: "fast" }],
      markers: [{ at: 0.55, label: "the drop" }],
    },

    /* 4 · COMMAND — low Dutch angle: the hand thrown up at the seal. */
    {
      id: "command",
      kind: "low-angle",
      purpose:
        "Escalation. The hand goes up; the seal in the clouds spins up and whitens; the storm gathers into the Arcanist's fingers.",
      space: "cinematic",
      ms: 480,
      fastMs: 320,
      transition: { kind: "cut" },
      camera: {
        from: { x: 780, y: 560, zoom: 1.55, rotate: 9 },
        to: { x: 790, y: 470, zoom: 1.7, rotate: 11 },
        ease: "in",
      },
      background: "storm-ledger",
      lighting: { exposure: 0.35, back: [STORM, 0.35], rim: [PALE, 0.9, 1], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.55, back: [STORM, 0.7], rim: [PALE, 1, 1], vignette: 0.45, letterbox: BARS },
      actors: [{ role: "caster", at: [760, 960], size: 780, clip: "ult:command", then: "ult:command", look: "rim", rim: STORM, root: false }],
      vfx: [
        { kind: "rune-circle", at: 0, until: 1, x: 820, y: 120, scale: 2.2, color: STORM, layer: "back" },
        { kind: "gather", at: 0.35, until: 1, follow: "caster", x: 130, y: -740, scale: 1.2, color: PALE, layer: "front" },
      ],
      sound: [{ at: 0, sfx: "ult-charge-arc" }],
    },

    /* 5 · STRIKE — the bolt through the seal onto the target, and the chain. */
    {
      id: "strike",
      kind: "impact",
      purpose:
        "Impact and the reaction. One bolt onto the chosen target — an inverted frame, a stop — and then Chain Shock jumping down every soaked enemy in turn.",
      space: "cinematic",
      ms: 720,
      fastMs: 540,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1000, y: 560, zoom: 1.5, rotate: -3 },
        to: { x: 1040, y: 555, zoom: 1.38, rotate: -1 },
        ease: "out",
      },
      background: "storm-ledger",
      lighting: { exposure: 0.45, under: [STORM, 0.3], vignette: 0.45, letterbox: BARS },
      toLighting: { exposure: 0.6, under: [STORM, 0.5], vignette: 0.4, letterbox: BARS },
      actors: [
        { role: "caster", at: [520, 810], size: 420, clip: "ult:strike", look: "rim", rim: STORM, z: 2 },
        {
          role: "targets",
          at: [1060, 800],
          spread: [230, -26],
          size: 360,
          face: -1,
          z: 1,
          react: [
            { at: 0.15, clip: "hurt" },
            { at: 0.5, clip: "hurt" },
          ],
          shove: { at: 0.15, by: [40, 0] },
        },
      ],
      vfx: [
        { kind: "lightning", at: 0.12, until: 0.5, follow: "target", x: 0, y: -10, scale: 1, color: STORM, layer: "front" },
        { kind: "impact-star", at: 0.14, until: 0.36, follow: "target", x: 0, y: -170, scale: 0.9, color: PALE, seed: 7, layer: "front", params: { jagged: true } },
        { kind: "shockwave", at: 0.15, until: 0.7, follow: "target", x: 0, y: -10, scale: 1.4, color: STORM, layer: "front" },
        { kind: "arcs", at: 0.2, until: 0.9, color: STORM, layer: "front" },
        { kind: "wet", at: 0, until: 1, each: "targets", color: STORM, layer: "front" },
        { kind: "sparks", at: 0.16, until: 0.7, follow: "target", x: 0, y: -160, scale: 1.2, color: PALE, seed: 4, layer: "front" },
      ],
      screen: [
        // A black frame, then the sky: the bolt reads against the dark.
        { kind: "black", at: 0.13, ms: 45, mode: "full" },
        { kind: "flash", at: 0.2, ms: 70, amount: 0.45, color: PALE },
        { kind: "chromatic", at: 0.16, ms: 160, amount: 1 },
      ],
      stop: [{ at: 0.15, ms: 140 }],
      shake: [
        { at: 0.15, amount: 0.034 },
        { at: 0.5, amount: 0.012 },
      ],
      sound: [
        { at: 0.13, sfx: "ult-bolt" },
        { at: 0.22, sfx: "ult-chain" },
      ],
      reveal: [{ at: 0.15, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.17, until: 0.9, text: "$damage", x: 0.7, y: 0.26, rotate: -5 },
        { kind: "voice", at: 0.3, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.15, label: "bolt" },
        { at: 0.2, label: "chain" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 1020, y: 540, zoom: 1.35, rotate: -3 },
            to: { x: 1050, y: 535, zoom: 1.25, rotate: -1 },
            ease: "out",
          },
        },
        boss: {
          camera: {
            from: { x: 1040, y: 470, zoom: 1.12, rotate: -3 },
            to: { x: 1060, y: 460, zoom: 1.05, rotate: -1 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [440, 840], size: 360, clip: "ult:strike", look: "rim", rim: STORM, z: 2 },
            {
              role: "targets",
              at: [1100, 850],
              spread: [260, -20],
              size: 420,
              face: -1,
              z: 1,
              react: [
                { at: 0.15, clip: "hurt" },
                { at: 0.5, clip: "hurt" },
              ],
              shove: { at: 0.15, by: [16, 0] },
            },
          ],
        },
      },
    },

    /* 6 · STEAM — back on the battlefield: the enemies still dripping. */
    {
      id: "steam",
      kind: "return",
      purpose:
        "Release. The board, with every enemy the storm reached still soaked — the Wet the rest of the party can spend.",
      space: "battlefield",
      ms: 640,
      fastMs: 460,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: ["#050a14", 0.45], letterbox: BARS },
      toLighting: { tint: ["#050a14", 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:settle" }],
      vfx: [
        { kind: "wet", at: 0, until: 1, anchor: "targets", stagger: 40, color: STORM },
        { kind: "sparks", at: 0, until: 0.6, anchor: "targets", stagger: 60, color: PALE, scale: 0.4 },
        { kind: "rain", at: 0, until: 0.45, layer: "screen", color: STORM, seed: 11 },
      ],
      sound: [{ at: 0.1, sfx: "ult-tail" }],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.1, until: 1, text: "$voice.after" }],
    },
  ],
};
