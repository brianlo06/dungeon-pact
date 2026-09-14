import type { Cinematic } from "../../shared/cinematic";

/**
 * HALLOWED GROUND — the Herald · Sanctifier's Ultimate.
 *
 * The idea, in one sentence: the Sanctifier draws the line itself — it walks
 * the length of the party's front with the iron-shod foot of its standard
 * scoring the foundry floor behind it, and when it grounds the standard on
 * the end of the score the whole line burns white and the soot is blown off
 * the stone on the party's side: the ground they stand on is made holy, and
 * they are already standing on it.
 *
 * Only the Sanctifier could have it. The Herald tells people what they are
 * worth; the Sanctifier's title is *Hold the line by holding the people on
 * it*, and its kit is Sanctuary, a row's ground made safe. Its standard is a
 * pole with a shod foot, and a standard-bearer's ceremonial gesture is to
 * ground it. So the consecration is a mark made on the floor with the foot
 * of the thing it carries — no horn, no song, no note in the air, no dome.
 *
 * Gameplay it shows: nothing is struck and no enemy is in it. The real
 * party set their feet on the cold floor, the line is drawn along their
 * front, and on the grounding every one of them is warded (Barrier, revealed
 * on the frame) on ground that stays lit (Regeneration, lasting); then a lit
 * seam along the real party's front and a clean flagstone under each.
 *
 * Rhythm: identity (the open face looks at the floor and sets) → stakes (the
 * real party, feet set, while the Sanctifier walks their front scoring the
 * line; title) → quiet (the ferrule held over the end of the score, the
 * embers going out) → impact (the two-tone; the grounding; the line ignites
 * end to end; the soot blown off the party's side; nobody moves) → the
 * ground (at their boots on the clean stone) → release (the board).
 *
 * It shares nothing with Anthem of the Unpaid (a horn, ribbons, a dusk
 * ridge, a braided banner), Into the Din (noise strokes, one ringing note,
 * black-bone-gold) or Elegy for the Standing (a burying ground, a grave, a
 * shadow laid down, a wreath, lilac); nor with the Lantern Wall (wards over
 * the party), the Small Print (paper screens), Breakwater (a wave on a
 * shield) or Good Hiding (a body absorbing blows). The storyboard is
 * `docs/ultimates/hallowed-ground.md`.
 */

const HALO = "#cdf5ff";
const WHITE = "#f4fbff";
const STONE = "#c9c4b6";
const IRON = "#0c1016";
const BARS = 0.1;

/** The line, in world units: scored along y from x0 towards x1; the ferrule ends it. */
const LINE = { x0: 260, y: 850, end: 1268 };
/** Where the Sanctifier grounds the standard, and where the party stands behind the line. */
const GROUND = { caster: [1180, 850] as [number, number], allies: [1000, 722] as [number, number], spread: [-200, 16] as [number, number] };

export const hallowedGround: Cinematic = {
  id: "hallowed-ground",
  heroId: "herald",
  motif: "hallow-motif-a",
  shots: [
    /* 0 · CALL — something is being marked out. */
    {
      id: "call",
      kind: "call",
      purpose:
        "The round stops: the real battlefield goes cold iron, the Herald tips the standard forward onto its shoulder, and the shod foot of it knocks the floor once — a scratch of light under its feet.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [IRON, 0], letterbox: 0 },
      toLighting: { tint: [IRON, 0.58], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:hallow-slope" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: HALO },
        { kind: "hallow-board", at: 0.6, until: 1, anchor: "caster", params: { mode: "knock" } },
      ],
      sound: [{ at: 0.6, sfx: "hallow-knock" }],
      duck: [{ at: 0, level: 0.3, ms: 5000 }],
      markers: [{ at: 0.6, label: "knock" }],
    },

    /* 1 · SET — face close-up: the open face looks at the floor, then sets. */
    {
      id: "set",
      kind: "face-close-up",
      purpose:
        "Identity. The face the Herald is drawn with — open, earnest — looks down at the floor by its feet, then comes up and looks straight out, and sets: the smile pressed to a line, the brows level, the eyes steady. A short nod. Ash drifts down the cold air past it.",
      space: "cinematic",
      ms: 620,
      fastMs: 380,
      transition: { kind: "black", ms: 80 },
      camera: {
        from: { x: 832, y: 392, zoom: 2.5, rotate: -4 },
        to: { x: 826, y: 394, zoom: 2.32, rotate: 0 },
        ease: "out",
      },
      background: "hallow-foundry",
      lighting: { exposure: 0.32, rim: [HALO, 0.5, 1], vignette: 0.62, letterbox: BARS },
      toLighting: { exposure: 0.36, rim: [HALO, 0.62, 1], vignette: 0.58, letterbox: BARS },
      actors: [
        { role: "caster", at: [760, 1040], size: 1000, clip: "ult:hallow-set", then: "ult:hallow-set", look: "lit", rim: HALO, root: false },
      ],
      vfx: [
        { kind: "hallow-soot", at: 0, until: 1, layer: "front", seed: 7, params: { mode: "drift", cx: 830, cy: 392, w: 760, h: 440, count: 26, fall: 60 } },
      ],
      sound: [{ at: 0.02, sfx: "hallow-motif-a" }],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [
        { at: 0.24, label: "floor" },
        { at: 0.56, label: "set" },
      ],
    },

    /* 2 · THE LINE — low tracking: the Sanctifier walks the party's front, scoring the floor. */
    {
      id: "line",
      kind: "low-angle",
      purpose:
        "Stakes. At floor height in front of the real party: they set their feet on the cold flagstones while the Sanctifier walks the whole length of their front, the standard couched forward and its shod foot dragging the floor behind it — a groove opening across the foreground with sparks off the foot and an ember light in it.",
      space: "cinematic",
      ms: 900,
      fastMs: 460,
      transition: { kind: "whip", ms: 110, dir: 1 },
      camera: {
        from: { x: 560, y: 700, zoom: 1.6 },
        to: { x: 1130, y: 700, zoom: 1.6 },
        ease: "inOut",
      },
      background: "hallow-foundry",
      lighting: { exposure: 0.62, rim: [HALO, 0.4, -1], vignette: 0.45, letterbox: BARS },
      toLighting: { exposure: 0.66, rim: [HALO, 0.5, -1], vignette: 0.42, letterbox: BARS },
      actors: [
        {
          role: "allies",
          at: [560, 722],
          spread: [230, -4],
          size: 300,
          look: "lit",
          z: 1,
          clip: "ult:hallow-stand",
          then: "ult:hallow-stand",
        },
        { role: "caster", at: [400, 850], to: [1210, 850], ease: "linear", size: 400, clip: "ult:hallow-walk", look: "lit", rim: HALO, z: 3 },
      ],
      vfx: [
        { kind: "hallow-score", at: 0, until: 1, layer: "front", seed: 19, params: { mode: "score", x0: LINE.x0, x1: 1400, y: LINE.y, trail: 100 } },
      ],
      sound: [
        { at: 0.02, sfx: "hallow-scrape" },
        { at: 0.34, sfx: "hallow-motif-b" },
      ],
      text: [
        { kind: "name", at: 0.3, until: 1, text: "$name", x: 0.06, y: 0.14 },
        { kind: "epithet", at: 0.4, until: 1, text: "$epithet", x: 0.06, y: 0.24 },
      ],
      markers: [
        { at: 0.3, label: "title" },
        { at: 0.5, label: "scoring" },
      ],
    },

    /* 3 · THE FERRULE — the quiet: the standard's foot held over the end of the score. */
    {
      id: "ferrule",
      kind: "extreme-close-up",
      purpose:
        "The quiet. On the floor, Dutch: the standard brought up to the vertical, its shod foot held a hand's breadth over the end of the score, the embers in the groove ticking out one by one, the ash in the air hanging still. Nothing else moves.",
      space: "cinematic",
      ms: 560,
      fastMs: 360,
      camera: {
        from: { x: 780, y: 880, zoom: 2.4, rotate: 6 },
        to: { x: 782, y: 882, zoom: 2.42, rotate: 6 },
        ease: "linear",
      },
      background: "hallow-foundry",
      lighting: { exposure: 0.4, rim: [HALO, 0.3, 1], vignette: 0.85, letterbox: 0.13 },
      toLighting: { exposure: 0.2, rim: [HALO, 0.2, 1], vignette: 0.92, letterbox: 0.14 },
      actors: [
        { role: "caster", at: [480, 960], size: 1400, clip: "ult:hallow-lift", then: "ult:hallow-lift", look: "lit", rim: HALO, root: false },
      ],
      vfx: [
        { kind: "hallow-score", at: 0, until: 1, layer: "front", seed: 19, params: { mode: "quiet", x0: -400, x1: 774, head: 774, y: 960 } },
        { kind: "hallow-soot", at: 0, until: 1, layer: "front", seed: 11, params: { mode: "hang", cx: 780, cy: 860, w: 720, h: 380, count: 22, fall: 3 } },
      ],
      duck: [{ at: 0, level: 0.03, ms: 560 }],
      sound: [{ at: 0.06, sfx: "hallow-ember" }],
      markers: [{ at: 0.5, label: "still" }],
    },

    /* 4 · GROUNDED — impact: the standard driven down; the line ignites; the soot goes off the floor. */
    {
      id: "ground",
      kind: "impact",
      purpose:
        "Impact. One frame of light and shadow, then the standard driven down onto the end of the score: the whole line ignites white end to end with a flare at the foot, and the soot on the party's side is blown off the stone in a wave from it, the pale flagstones showing where it was — and the party does not move; only their cloaks and hair blow. Barrier and Regeneration land on everyone.",
      space: "cinematic",
      ms: 780,
      fastMs: 560,
      camera: {
        from: { x: 800, y: 640, zoom: 1.35, rotate: -3 },
        to: { x: 800, y: 626, zoom: 1.18, rotate: -1 },
        ease: "out",
      },
      background: "hallow-foundry",
      lighting: { exposure: 0.5, rim: [HALO, 0.7, 1], vignette: 0.4, letterbox: BARS },
      toLighting: { exposure: 0.62, under: [HALO, 0.55], rim: [HALO, 0.6, 1], vignette: 0.42, letterbox: BARS },
      actors: [
        {
          role: "allies",
          at: GROUND.allies,
          spread: GROUND.spread,
          size: 330,
          look: "lit",
          z: 1,
          clip: "ult:hallow-still",
          then: "ult:hallow-still",
        },
        { role: "caster", at: GROUND.caster, size: 420, clip: "ult:hallow-ground", then: "ult:hallow-held", look: "lit", rim: HALO, z: 3 },
      ],
      vfx: [
        { kind: "hallow-soot", at: 0, until: 1, layer: "back", seed: 23, params: { mode: "blow", x0: LINE.x0, x1: LINE.end, y: LINE.y, depth: 220, taper: 80, at: 0.075, count: 140, rise: 220, life: 0.5 } },
        { kind: "hallow-score", at: 0, until: 1, layer: "front", seed: 19, params: { mode: "burn", x0: LINE.x0, x1: LINE.end, head: LINE.end, y: LINE.y, ignite: 0.069, shotMs: 780, depth: 220, taper: 80 } },
        { kind: "dust", at: 0.07, until: 0.6, x: LINE.end, y: LINE.y, scale: 1.6, color: "#5c5a58", seed: 5, layer: "front" },
      ],
      screen: [
        { kind: "two-tone", at: 0, ms: 60, color: STONE, mode: "full" },
        { kind: "invert", at: 0, ms: 50, mode: "fast" },
        { kind: "flash", at: 0.069, ms: 80, amount: 0.75, color: WHITE },
        { kind: "chromatic", at: 0.07, ms: 140, amount: 0.7 },
      ],
      stop: [{ at: 0.075, ms: 150 }],
      shake: [
        { at: 0.07, amount: 0.04 },
        { at: 0.36, amount: 0.012 },
      ],
      sound: [
        { at: 0.066, sfx: "hallow-strike" },
        { at: 0.072, sfx: "ult-boom" },
      ],
      reveal: [
        { at: 0.069, reveal: "impact" },
        { at: 0.069, reveal: "ward" },
      ],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.impact" }],
      markers: [{ at: 0.069, label: "contact" }],
    },

    /* 5 · STANDING — at their boots on the clean stone. */
    {
      id: "standing",
      kind: "aftermath",
      purpose:
        "What they are standing on. Low, at the party's boots on the clean stone, the line burning steady behind them and the last of the soot settling past the lens; nobody has moved. The Sanctifier stands at the end of the line with the standard grounded and its chin up.",
      space: "cinematic",
      ms: 600,
      fastMs: 0,
      camera: {
        from: { x: 760, y: 780, zoom: 2.0 },
        to: { x: 760, y: 740, zoom: 1.84 },
        ease: "inOut",
      },
      background: "hallow-foundry",
      lighting: { exposure: 0.6, under: [HALO, 0.5], rim: [HALO, 0.5, 1], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.62, under: [HALO, 0.45], rim: [HALO, 0.5, 1], vignette: 0.5, letterbox: BARS },
      actors: [
        {
          role: "allies",
          at: GROUND.allies,
          spread: GROUND.spread,
          size: 330,
          look: "lit",
          z: 1,
          clip: "ult:hallow-still",
          clipAt: 0,
          then: "ult:hallow-still",
        },
        { role: "caster", at: GROUND.caster, size: 420, clip: "ult:hallow-held", then: "ult:hallow-held", look: "lit", rim: HALO, z: 3 },
      ],
      vfx: [
        { kind: "hallow-soot", at: 0, until: 1, layer: "back", seed: 23, params: { mode: "blow", x0: LINE.x0, x1: LINE.end, y: LINE.y, depth: 220, taper: 80, settle: 1 } },
        { kind: "hallow-score", at: 0, until: 1, layer: "front", seed: 19, params: { mode: "burn", x0: LINE.x0, x1: LINE.end, head: LINE.end, y: LINE.y, settle: 1, depth: 220, taper: 80 } },
        { kind: "hallow-soot", at: 0, until: 1, layer: "front", seed: 41, params: { mode: "drift", cx: 760, cy: 760, w: 900, h: 460, count: 14, fall: 110 } },
      ],
      markers: [{ at: 0.5, label: "standing" }],
    },

    /* 6 · HELD — back on the board. */
    {
      id: "held",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield, what it did is where it matters: a lit seam runs along the real party's front, a clean flagstone shows under every one of them in turn, and the Herald stands with the standard grounded upright.",
      space: "battlefield",
      ms: 720,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [IRON, 0.45], letterbox: BARS },
      toLighting: { tint: [IRON, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:hallow-hold" }],
      vfx: [
        { kind: "hallow-board", at: 0, until: 1, anchor: "caster", params: { mode: "line" } },
        { kind: "hallow-board", at: 0.08, until: 1, anchor: "party", stagger: 90, params: { mode: "stone" } },
      ],
      sound: [
        { at: 0.05, sfx: "hallow-settle" },
        { at: 0.5, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.06, label: "held" }],
    },
  ],
};
