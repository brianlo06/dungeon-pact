import type { ActorCue, Cinematic } from "../../shared/cinematic";

/**
 * STILL LIFE — the Arcanist · Chronomancer's Ultimate.
 *
 * The idea: the Chronomancer's spark is a shutter — every time it flickers it
 * takes a still of whatever moves — and the Chronomancer takes the enemy's
 * next moment that way, still by still, tucks the stills up its sleeve while
 * the whole room hangs where it was, then throws every one of them back into
 * the enemy in a single instant.
 *
 * Rhythm: identity (the spark's first stills: a hand laid out in time) →
 * stakes and target (the real line winding up; each flicker takes a still of
 * every enemy's coming blow and leaves it hanging ahead of it; title) →
 * escalation (from behind the brim, the stills pulled off the line and up the
 * sleeve) → the quiet (a profile against the still-light, the hat's tip
 * stopped mid-flop, nothing moving but the eye-lights) → impact (the sleeve
 * flung open, every still back into the target at once, the roof coming
 * down) → release (the real board: a still left hanging on each enemy, and
 * light rising off the party).
 *
 * It shares nothing with Debt of Thunder: no weather, no sky, no seal, no
 * book, no pages, no bolt, no chain, and never a look under the brim. Where
 * that film is a storm spent at once, this one is a room where nothing moves.
 * Time is never a clock: it is a still, the real figure printed at one
 * instant and left behind.
 *
 * The storyboard is `docs/ultimates/still-life.md`.
 */

const AMBER = "#ffb870";
const STILL = "#e6e1f6";
const NIGHT = "#0a0914";
/** A screen flash is drawn at full strength and screened: its colour is its strength. */
const FLICKER = "#4a3321";
const BARS = 0.11;

/** The impact's stills: laid out to the left of each figure, then thrown home. */
const CONVERGE = { from: "targets", mode: "converge", takes: "0,0,0,0", dx: -0.3, dy: 0.015, fade: 0.16, alpha: 0.95, hit: 0.1, lead: 0.1, hit2: 0.36, through: 0.22 };

const releaseTargets = (at: [number, number], size: number, spread: [number, number], shove: number): ActorCue => ({
  role: "targets",
  at,
  spread,
  size,
  face: -1,
  look: "lit",
  z: 2,
  react: [
    { at: 0.1, clip: "hurt" },
    { at: 0.36, clip: "hurt" },
  ],
  shove: { at: 0.1, by: [shove, -4] },
  toTilt: shove > 40 ? 5 : 2,
});

export const stillLife: Cinematic = {
  id: "still-life",
  heroId: "arcanist",
  motif: "still-motif",
  shots: [
    /* 0 · CALL — the spark comes up and flickers; the round stops. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the real Arcanist brings its spark up and pinches it small, the spark flickers once like a shutter, and the board sinks to indigo.",
      space: "battlefield",
      ms: 420,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [NIGHT, 0], letterbox: 0 },
      toLighting: { tint: [NIGHT, 0.62], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:still-pinch" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: AMBER },
        { kind: "still-flicker", at: 0, until: 1, anchor: "caster", color: AMBER, params: { at: "0.55", len: 0.4 } },
      ],
      sound: [{ at: 0, sfx: "still-call" }],
      duck: [{ at: 0, level: 0.3, ms: 4500 }],
      markers: [{ at: 0.55, label: "the flicker" }],
    },

    /* 1 · PINCH — extreme close-up on the glove: the gesture, laid out in stills. */
    {
      id: "pinch",
      kind: "extreme-close-up",
      purpose:
        "Identity. The gloved hand sweeps up across the frame and pinches the spark down to a hard point; each time the spark flickers it takes a still of the hand, and the stills stay in the air where the hand was.",
      space: "cinematic",
      ms: 620,
      fastMs: 380,
      transition: { kind: "black", ms: 60 },
      camera: {
        from: { x: 1080, y: 490, zoom: 3.5, rotate: 6 },
        to: { x: 1070, y: 466, zoom: 3.8, rotate: 4 },
        ease: "out",
      },
      background: "still-fall",
      lighting: { exposure: 0.3, back: [STILL, 0.22], rim: [AMBER, 0.7, 1], vignette: 0.75, letterbox: BARS },
      toLighting: { exposure: 0.36, back: [STILL, 0.3], rim: [AMBER, 0.85, 1], vignette: 0.7, letterbox: BARS },
      actors: [
        { role: "caster", at: [800, 900], size: 760, clip: "ult:still-pinch", then: "ult:still-pinch", look: "rim", rim: AMBER, root: false },
      ],
      vfx: [
        { kind: "still-plates", at: 0, until: 1, layer: "front", params: { from: "caster", keep: "hand", clip: "ult:still-pinch", mode: "lay", takes: "0.2,0.45,0.7", dx: 0, dy: 0, fade: 0.2, alpha: 0.6 } },
        { kind: "still-flicker", at: 0, until: 1, scale: 0.55, color: AMBER, layer: "front", params: { at: "0.2,0.45,0.7", len: 0.13, spark: true } },
      ],
      sound: [
        { at: 0.2, sfx: "still-take" },
        { at: 0.45, sfx: "still-take" },
        { at: 0.7, sfx: "still-take" },
      ],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.22, label: "still" },
        { at: 0.72, label: "pinched" },
      ],
    },

    /* 2 · WINDUP — the real line winds up; each flicker lays out its next moment. */
    {
      id: "windup",
      kind: "target",
      purpose:
        "Stakes and target. The real enemy line winds up under the hanging roof. At each flicker of the spark a still of every enemy's coming blow is taken and left stepping out ahead of it towards the party, each further on and paler: their next moment, laid out.",
      space: "cinematic",
      ms: 900,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1000, y: 520, zoom: 1.24 },
        to: { x: 950, y: 525, zoom: 1.3 },
        ease: "inOut",
      },
      background: "still-fall",
      lighting: { exposure: 0.55, under: [STILL, 0.1], back: [STILL, 0.12], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.62, under: [STILL, 0.14], back: [AMBER, 0.12], vignette: 0.45, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [820, 810],
          spread: [250, -16],
          size: 290,
          face: -1,
          look: "lit",
          z: 2,
          react: [{ at: 0.06, clip: "anticipate", then: "windup" }],
        },
      ],
      vfx: [
        { kind: "still-plates", at: 0, until: 1, layer: "back", params: { from: "targets", mode: "lay", takes: "0.26,0.46,0.66", dx: -0.2, dy: 0.012, fade: 0.28, alpha: 0.8, glide: 0.1 } },
      ],
      screen: [
        { kind: "flash", at: 0.25, ms: 60, color: FLICKER },
        { kind: "flash", at: 0.45, ms: 60, color: FLICKER },
        { kind: "flash", at: 0.65, ms: 60, color: FLICKER },
      ],
      sound: [
        { at: 0.02, sfx: "still-motif" },
        { at: 0.25, sfx: "still-take" },
        { at: 0.45, sfx: "still-take" },
        { at: 0.65, sfx: "still-take" },
      ],
      text: [
        { kind: "name", at: 0.12, until: 1, text: "$name", x: 0.06, y: 0.2 },
        { kind: "epithet", at: 0.22, until: 1, text: "$epithet", x: 0.06, y: 0.3 },
      ],
      markers: [
        { at: 0.26, label: "still 1" },
        { at: 0.66, label: "still 3" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 990, y: 500, zoom: 1.08 },
            to: { x: 950, y: 505, zoom: 1.13 },
            ease: "inOut",
          },
          actors: [
            {
              role: "targets",
              at: [840, 830],
              spread: [270, -16],
              size: 280,
              face: -1,
              look: "lit",
              z: 2,
              react: [{ at: 0.06, clip: "anticipate", then: "windup" }],
            },
          ],
        },
        boss: {
          camera: {
            from: { x: 960, y: 450, zoom: 0.98 },
            to: { x: 920, y: 460, zoom: 1.03 },
            ease: "inOut",
          },
          actors: [
            {
              role: "targets",
              at: [980, 850],
              spread: [300, -14],
              size: 280,
              face: -1,
              look: "lit",
              z: 2,
              react: [{ at: 0.06, clip: "anticipate", then: "windup" }],
            },
          ],
        },
      },
    },

    /* 3 · SLEEVE — over the shoulder: every still pulled off the line and up the sleeve. */
    {
      id: "sleeve",
      kind: "over-the-shoulder",
      purpose:
        "Escalation. From behind the brim, the hat's black shape filling the top left and the line small beyond it: every still is pulled off the enemy line and streams back past the lens into the sleeve, growing as it comes. Then the brim sweeps across the lens.",
      space: "cinematic",
      ms: 520,
      fastMs: 360,
      transition: { kind: "cut" },
      camera: {
        from: { x: 830, y: 560, zoom: 1.12 },
        to: { x: 800, y: 540, zoom: 1.22 },
        ease: "in",
      },
      background: "still-fall",
      lighting: { exposure: 0.42, back: [AMBER, 0.2], rim: [AMBER, 0.9, 1], vignette: 0.55, letterbox: BARS },
      toLighting: { exposure: 0.34, back: [AMBER, 0.28], rim: [AMBER, 1, 1], vignette: 0.6, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [1130, 760],
          spread: [150, -10],
          size: 170,
          face: -1,
          look: "lit",
          z: 1,
          react: [{ at: 0, clip: "windup" }],
        },
        { role: "caster", at: [340, 1070], size: 1000, clip: "ult:still-gather", then: "ult:still-hold", look: "silhouette", z: 3 },
      ],
      vfx: [
        { kind: "still-plates", at: 0, until: 1, layer: "front", params: { from: "targets", mode: "stream", takes: "0,0.04,0.08", dx: -0.3, dy: 0.02, fade: 0.2, alpha: 0.9, go: 0.14, every: 0.05, fly: 0.34, tx: 0.3, ty: 0.6, grow: 3 } },
        { kind: "still-brim", at: 0.82, until: 1, layer: "screen", params: { half: "out" } },
      ],
      sound: [
        { at: 0, sfx: "still-motif", mode: "fast" },
        { at: 0.08, sfx: "still-gather" },
      ],
      text: [{ kind: "name", at: 0.05, until: 0.8, text: "$name", x: 0.58, y: 0.2, mode: "fast" }],
      markers: [{ at: 0.5, label: "up the sleeve" }],
    },

    /* 4 · STOPPED — the quiet: a profile against the still-light, and nothing moves. */
    {
      id: "stopped",
      kind: "profile",
      purpose:
        "The quiet. Side-on, locked off: the Chronomancer's profile black against the pale still-light, the hat's tip caught mid-flop and staying there, the dust hanging. The music is gone. Nothing moves except the two eye-lights coming up amber, and at the end a breath drawn in backwards.",
      space: "cinematic",
      ms: 560,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: { from: { x: 800, y: 370, zoom: 1.75 } },
      background: "still-fall",
      lighting: { exposure: 0.12, back: [STILL, 0.55], vignette: 0.85, letterbox: 0.15 },
      toLighting: { exposure: 0.08, back: [STILL, 0.6], vignette: 0.88, letterbox: 0.15 },
      actors: [
        { role: "caster", at: [760, 1080], size: 1100, clip: "ult:still-hold", then: "ult:still-hold", look: "silhouette", root: false },
      ],
      vfx: [
        { kind: "still-motes", at: 0, until: 1, x: 800, y: 370, scale: 0.6, seed: 17, color: AMBER, layer: "front" },
        { kind: "still-eyes", at: 0, until: 1, color: AMBER, layer: "front" },
        { kind: "still-brim", at: 0, until: 0.16, layer: "screen", params: { half: "in" } },
      ],
      duck: [{ at: 0, level: 0.05, ms: 560 }],
      sound: [
        { at: 0.02, sfx: "still-hush", mode: "full" },
        { at: 0.02, sfx: "still-hush-fast", mode: "fast" },
      ],
      markers: [{ at: 0.5, label: "held" }],
    },

    /* 5 · RELEASE — the impact: every still thrown back into the target at once. */
    {
      id: "release",
      kind: "impact",
      purpose:
        "Impact. The sleeve is flung open at the target from the left foreground, and every still arrives in it at once, overprinted on it, on an amber two-tone frame held by the stop; they blow out through it, the roof comes down, and a beat later each other enemy's own still arrives in it.",
      space: "cinematic",
      ms: 740,
      fastMs: 520,
      transition: { kind: "cut" },
      camera: {
        from: { x: 930, y: 560, zoom: 1.4, rotate: -2 },
        to: { x: 950, y: 555, zoom: 1.3, rotate: -1 },
        ease: "out",
      },
      background: "still-fallen",
      lighting: { exposure: 0.8, under: [AMBER, 0.16], rim: [AMBER, 0.6, 1], vignette: 0.35, letterbox: BARS },
      toLighting: { exposure: 0.6, under: [AMBER, 0.1], rim: [AMBER, 0.4, 1], vignette: 0.5, letterbox: BARS },
      actors: [
        { role: "caster", at: [250, 1150], size: 920, clip: "ult:still-release", then: "ult:still-release", look: "lit", z: 3 },
        releaseTargets([1060, 810], 340, [240, -22], 70),
      ],
      vfx: [
        { kind: "still-fall", at: 0, until: 1, layer: "back", params: { drop: 0.14 } },
        { kind: "still-plates", at: 0, until: 1, layer: "front", params: CONVERGE },
        { kind: "still-burst", at: 0.1, until: 0.42, follow: "target", x: -90, y: -120, scale: 0.8, seed: 7, color: AMBER, layer: "front" },
      ],
      screen: [
        { kind: "two-tone", at: 0.1, ms: 70, color: AMBER },
        { kind: "flash", at: 0.26, ms: 60, color: "#6b4a2a" },
        { kind: "flash", at: 0.36, ms: 60, color: FLICKER },
        { kind: "chromatic", at: 0.12, ms: 150, amount: 0.8 },
      ],
      stop: [{ at: 0.1, ms: 150 }],
      shake: [
        { at: 0.1, amount: 0.034 },
        { at: 0.36, amount: 0.014 },
      ],
      sound: [
        { at: 0.09, sfx: "still-impact" },
        { at: 0.35, sfx: "still-echo" },
      ],
      reveal: [{ at: 0.1, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.1, until: 0.95, text: "$damage", x: 0.64, y: 0.2, rotate: -4 },
        { kind: "voice", at: 0.46, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.1, label: "contact" },
        { at: 0.36, label: "the line" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 930, y: 540, zoom: 1.2, rotate: -2 },
            to: { x: 950, y: 535, zoom: 1.12, rotate: -1 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [300, 1060], size: 660, clip: "ult:still-release", then: "ult:still-release", look: "lit", z: 3 },
            releaseTargets([1060, 840], 320, [260, -20], 45),
          ],
        },
        boss: {
          camera: {
            from: { x: 900, y: 470, zoom: 1.02, rotate: -2 },
            to: { x: 920, y: 465, zoom: 0.97, rotate: -1 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [260, 1040], size: 600, clip: "ult:still-release", then: "ult:still-release", look: "lit", z: 3 },
            releaseTargets([1080, 870], 300, [300, -16], 18),
          ],
          vfx: [
            { kind: "still-fall", at: 0, until: 1, layer: "back", params: { drop: 0.14 } },
            { kind: "still-plates", at: 0, until: 1, layer: "front", params: CONVERGE },
            { kind: "still-burst", at: 0.1, until: 0.42, follow: "target", x: 0, y: -300, scale: 1.5, seed: 7, color: AMBER, layer: "front" },
          ],
        },
      },
    },

    /* 6 · GIVEN — back on the board: stills held on them, light given to the party. */
    {
      id: "given",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield the Arcanist touches its brim and its spark is back in the glove. A still hangs ahead of every real enemy, going slowly pale: its moment, held. Stills of amber light rise off every ally: the moments given.",
      space: "battlefield",
      ms: 680,
      fastMs: 460,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [NIGHT, 0.45], letterbox: BARS },
      toLighting: { tint: [NIGHT, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:still-settle" }],
      vfx: [
        { kind: "still-held", at: 0, until: 1, anchor: "targets", stagger: 50 },
        { kind: "still-given", at: 0.15, until: 1, anchor: "party", stagger: 60, color: AMBER },
      ],
      sound: [
        { at: 0.05, sfx: "still-after" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.1, label: "held" }],
    },
  ],
};
