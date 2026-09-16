import type { Cinematic } from "../../shared/cinematic";

/**
 * HALLOWED GROUND — the Herald · Sanctifier's Ultimate.
 *
 * The idea, in one sentence: the Sanctifier draws the line itself — it walks
 * the party's front scoring the sooted foundry floor with the foot of its
 * standard, and closes the score with one hard low stroke that lights the
 * whole line white and blows the soot off the stone on the party's side: the
 * ground they are standing on is made clean and holy under their feet.
 *
 * Only the Sanctifier could have it. The Herald tells people what they are
 * worth; the Sanctifier's title is *Hold the line by holding the people on
 * it*, and its kit is Sanctuary, a row's ground made safe. Its standard is a
 * long pole with a foot, and a line drawn on the ground with it — the oldest
 * way to say "here, and no further" — is the consecration: no horn, no song,
 * no note in the air, no dome, and no pole planted.
 *
 * Gameplay it shows: nothing is struck and no enemy is in it. The real party
 * set their feet on the cold floor, the line is scored along their front,
 * and on the stroke every one of them is warded (Barrier, revealed on the
 * frame) on ground that stays lit (Regeneration, lasting); then a lit seam
 * along the real party's front and a clean flagstone under each.
 *
 * Rhythm: identity (the open smile goes and the face sets, a nod) → stakes
 * (the real party, feet set, while the Sanctifier walks their front scoring
 * the line; title) → quiet (down the groove to its end: the Sanctifier
 * coiled over it, the foot drawn back, the embers going out) → impact (the
 * two-tone; the stroke; the line white end to end; the soot blown off the
 * party's side; nobody moves) → release (the board).
 *
 * It shares nothing with Anthem of the Unpaid (a horn, ribbons, a dusk
 * ridge, a braided banner), Into the Din (noise strokes, one ringing note,
 * black-bone-gold) or Elegy for the Standing (a burying ground, a grave, a
 * shadow laid down, a banner driven into the earth, lilac); nor with the
 * Lantern Wall (a shield planted, wards over the party), the Small Print
 * (paper screens), Breakwater (a wave on a shield), Good Hiding (a body
 * absorbing blows) or Undertow (a sea drawn back off the sand). The
 * storyboard is `docs/ultimates/hallowed-ground.md`.
 */

const HALO = "#cdf5ff";
const WHITE = "#f4fbff";
const STONE = "#c9c4b6";
const IRON = "#0c1016";
const BARS = 0.1;

/** The line on the impact: scored along y from x0; the stroke ends it at `end`. */
const LINE = { x0: 120, y: 800, end: 1270 };
/** Where the Sanctifier makes the stroke, and where the party stands behind the line. */
const GROUND = { caster: [1100, 800] as [number, number], allies: [880, 690] as [number, number], spread: [-230, 12] as [number, number] };
/**
 * The stroke's contact: `ult:hallow-stroke` reaches it 45ms in, so in the
 * 860ms shot it is at 0.052. FAST plays the shot in 700ms and the same
 * fraction lands 37ms in, where the stroke is already all but through.
 */
const CONTACT = 0.052;
const IMPACT_MS = 860;

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
        "The round stops: the real battlefield goes cold iron, the Herald tips the standard forward onto its shoulder, and the foot of it knocks the floor once — a scratch of light under its feet.",
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
      kind: "wide-hero",
      purpose:
        "Stakes. At floor height in front of the real party: they set their feet on the cold flagstones while the Sanctifier walks the whole length of their front, the standard couched forward and its foot dragging the floor behind it — a groove opening across the foreground with sparks off the foot and an ember light in it.",
      space: "cinematic",
      ms: 900,
      fastMs: 460,
      transition: { kind: "whip", ms: 110, dir: 1 },
      camera: {
        from: { x: 560, y: 600, zoom: 1.3 },
        to: { x: 1080, y: 600, zoom: 1.3 },
        ease: "inOut",
      },
      background: "hallow-foundry",
      lighting: { exposure: 0.74, under: ["#ffb070", 0.18], rim: [HALO, 0.45, -1], vignette: 0.4, letterbox: BARS },
      toLighting: { exposure: 0.78, under: ["#ffb070", 0.22], rim: [HALO, 0.55, -1], vignette: 0.38, letterbox: BARS },
      actors: [
        {
          role: "allies",
          at: [520, 700],
          spread: [250, -4],
          size: 250,
          look: "lit",
          z: 1,
          clip: "ult:hallow-stand",
          then: "ult:hallow-stand",
        },
        { role: "caster", at: [300, 820], to: [1250, 820], ease: "linear", size: 310, clip: "ult:hallow-walk", look: "lit", rim: HALO, z: 3 },
      ],
      vfx: [
        { kind: "hallow-score", at: 0, until: 1, layer: "front", seed: 19, params: { mode: "score", x0: 60, x1: 1500, y: 820, trail: 60, walk: 1.05 } },
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

    /* 3 · DOWN THE LINE — the quiet: the groove to its end, the Sanctifier coiled over it. */
    {
      id: "coil",
      kind: "dutch",
      purpose:
        "The quiet. Down on the stone at the near end of the score, looking along it: the groove runs away from the lens to where the Sanctifier stands coiled over its end, weight back, the foot of the standard drawn back into the groove. The embers in it go out from the near end towards the foot; the ash in the air hangs still. Nothing else moves.",
      space: "cinematic",
      ms: 600,
      fastMs: 380,
      camera: {
        from: { x: 700, y: 668, zoom: 1.75, rotate: 5 },
        to: { x: 702, y: 669, zoom: 1.78, rotate: 5 },
        ease: "linear",
      },
      background: "hallow-foundry",
      lighting: { exposure: 0.42, under: ["#ffb070", 0.28], rim: [HALO, 0.35, 1], vignette: 0.74, letterbox: 0.13 },
      toLighting: { exposure: 0.22, under: ["#ffb070", 0.12], rim: [HALO, 0.25, 1], vignette: 0.86, letterbox: 0.14 },
      actors: [{ role: "caster", at: [760, 780], size: 290, clip: "ult:hallow-coil", then: "ult:hallow-coil", look: "lit", rim: HALO }],
      vfx: [
        { kind: "hallow-score", at: 0, until: 1, layer: "back", seed: 19, params: { mode: "quiet", nx: 250, ny: 880, fx: 731, fy: 780, nw: 36, fw: 5, glow: 110 } },
        { kind: "hallow-soot", at: 0, until: 1, layer: "front", seed: 11, params: { mode: "hang", cx: 700, cy: 668, w: 960, h: 540, count: 22, fall: 3 } },
      ],
      duck: [{ at: 0, level: 0.03, ms: 600 }],
      sound: [{ at: 0.06, sfx: "hallow-ember" }],
      markers: [{ at: 0.5, label: "still" }],
    },

    /* 4 · THE STROKE — impact: the foot swept through the end of the score; the line lights; the soot goes off the floor. */
    {
      id: "stroke",
      kind: "impact",
      purpose:
        "Impact. One frame of light and shadow, then the stroke: the foot of the standard swept hard through the end of the score, a burst of sparks thrown forward off it, the whole line white end to end, and the soot on the party's side blown up off the stone at once, the pale flagstones under it — and the party does not move; only their cloaks and hair blow. Barrier and Regeneration land on everyone.",
      space: "cinematic",
      ms: IMPACT_MS,
      fastMs: 700,
      camera: {
        from: { x: 930, y: 632, zoom: 1.42, rotate: -2 },
        to: { x: 890, y: 620, zoom: 1.28, rotate: 0 },
        ease: "out",
      },
      background: "hallow-foundry",
      lighting: { exposure: 0.55, under: [HALO, 0.6], rim: [HALO, 0.7, 1], vignette: 0.38, letterbox: BARS },
      toLighting: { exposure: 0.6, under: [HALO, 0.55], rim: [HALO, 0.6, 1], vignette: 0.42, letterbox: BARS },
      actors: [
        {
          role: "allies",
          at: GROUND.allies,
          spread: GROUND.spread,
          size: 300,
          look: "lit",
          z: 1,
          clip: "ult:hallow-still",
          then: "ult:hallow-still",
        },
        { role: "caster", at: GROUND.caster, size: 390, clip: "ult:hallow-stroke", then: "ult:hallow-held", look: "lit", rim: HALO, z: 3 },
      ],
      vfx: [
        { kind: "hallow-soot", at: 0, until: 1, layer: "back", seed: 23, params: { mode: "blow", x0: LINE.x0, x1: LINE.end + 130, y: LINE.y, depth: 260, taper: 60, at: CONTACT, count: 150, rise: 280, life: 0.6 } },
        { kind: "hallow-score", at: 0, until: 1, layer: "front", seed: 19, params: { mode: "burn", x0: LINE.x0, x1: LINE.end, head: LINE.end, y: LINE.y, ignite: CONTACT, shotMs: IMPACT_MS, depth: 260, taper: 80 } },
        { kind: "dust", at: CONTACT, until: 0.5, x: LINE.end, y: LINE.y, scale: 0.9, color: "#2c2a28", seed: 5, layer: "front" },
      ],
      // The accents end before contact: the hit-stop holds presentation time,
      // so anything on the lens at contact would be held with it. The frame
      // the stop holds is in colour: the stroke, the line lit, the stone
      // bared and the soot off it.
      screen: [
        { kind: "two-tone", at: 0, ms: 30, color: STONE, mode: "full" },
        { kind: "invert", at: 0, ms: 24, mode: "fast" },
        { kind: "flash", at: 0.035, ms: 12, amount: 0.8, color: WHITE, mode: "full" },
        { kind: "chromatic", at: 0.28, ms: 120, amount: 0.5 },
      ],
      stop: [{ at: CONTACT, ms: 150 }],
      shake: [
        { at: CONTACT, amount: 0.04 },
        { at: 0.36, amount: 0.012 },
      ],
      sound: [
        { at: 0, sfx: "hallow-strike" },
        { at: 0.05, sfx: "ult-boom" },
      ],
      reveal: [
        { at: CONTACT, reveal: "impact" },
        { at: CONTACT, reveal: "ward" },
      ],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.impact" }],
      markers: [{ at: CONTACT, label: "contact" }],
    },

    /* 6 · HELD — back on the board. */
    {
      id: "held",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield, what it did is where it matters: a lit seam runs along the real party's front, a clean flagstone shows under every one of them in turn, and the Herald stands with the standard stood upright on the line.",
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
