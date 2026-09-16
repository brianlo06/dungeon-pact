import type { Cinematic, VfxCue } from "../../shared/cinematic";

/**
 * ELBOW ROOM — the Reaver · Butcher's Ultimate.
 *
 * The idea, in one sentence: the Butcher is standing in the Shambles, the
 * butchers' lane so narrow its upper storeys nearly touch, with the enemy row
 * packed across it wall to wall — and it swings anyway: one flat swing wider
 * than the street, that bites both walls and sweeps the whole row back down
 * the lane.
 *
 * Only the Butcher could have it: *Wider swings. Fewer problems.* It traded
 * Frenzy for Butchery (tear a whole row) and stopped aiming; its cleaver is
 * drawn too big to carry, let alone swing in a lane where you could not swing
 * a cat. Every other Reaver film is about what is paid or kept; this one is
 * about room, and nothing is paid.
 *
 * Rhythm: identity (a beam an inch over its head: the brow goes up, the blade
 * knocks the beam, the grin) → stakes (down the lane: the real row packed
 * across it, the Butcher coming with the blade on its shoulder rattling along
 * the shutters; title) → escalation (the wind-up: the blade swung back level
 * until its point bites a post) → quiet (the lane cat gets down) → impact (a
 * teal-and-ink frame; the swing wrapped round the row, a gouge torn along the
 * far wall, sawdust lifted in a sheet, the row knocked back down the lane) →
 * release (the real board: the lane's walls pushed back out, heel-skids in
 * sawdust behind the row, now in the back line).
 *
 * It shares nothing with Red Ledger (a pit, one top light, a blood stroke), A
 * Good Hiding (a tannery loft, the dent), Gatebreaker (a forge, a gate, a
 * ram) or Hammer Price (an overhead blow on one lot): a lane, dusk, a flat
 * swing round a whole row. Storyboard: `docs/ultimates/elbow-room.md`.
 */

const TEAL = "#5fd9c4";
const WAKE = "#d4fbf1";
const DUSK = "#0b0d0f";
const BARS = 0.1;
const STREET = "elbow-street";

/**
 * The impact is one length in FULL and FAST: the swing plays at one rate in
 * both, and its contact (130ms into `ult:elbow-sweep`, after the film's
 * 120ms blend into the clip) is where the hit-stop and the reveal must fall.
 */
const IMPACT_MS = 780;
const HIT = 130 / IMPACT_MS;

/** The swing's effects for one framing: both halves of the band, the gouge, the sawdust, plaster off the far wall. */
function swing(o: { wall: number; ground: number; lift: number; ry: number; w: number; past: number; saw: number; gx: number; gy: number }): VfxCue[] {
  const band = { from: 55, hit: 130, hold: 150, fade: 320, lift: o.lift, ry: o.ry, w: o.w, past: o.past, behind: 0.4 };
  return [
    { kind: "elbow-glare", at: HIT - 0.01, until: 0.6, x: o.gx, y: o.gy, layer: "back", params: { w: 1700, h: 560, hold: 0.12 } },
    { kind: "elbow-gouge", at: 0, until: 1, layer: "back", params: { x0: -300, x1: 1900, y: o.wall, h: 34, from: 40, hit: 130 } },
    { kind: "elbow-sweep", at: 0, until: 1, layer: "back", params: { ...band, half: "far" } },
    { kind: "elbow-sweep", at: 0, until: 1, layer: "front", params: { ...band, half: "near" } },
    ...[260, 640, 1020, 1380].map(
      (x, i): VfxCue => ({
        kind: "elbow-plaster",
        at: HIT - 0.04 + i * 0.012,
        until: 0.8,
        x,
        y: o.wall,
        layer: "back",
        seed: 5 + i,
        params: { n: 12, dir: 80, spread: 160, reach: 110, size: 18, fall: 220 },
      }),
    ),
    { kind: "elbow-sawdust", at: HIT - 0.02, until: 1, x: 900, y: o.ground, layer: "front", seed: 3, params: { n: 90, w: o.saw, lift: 150, drift: 220, lag: 0.1, size: 11 } },
    { kind: "elbow-splinter", at: HIT, until: 0.7, layer: "screen", seed: 9, params: { n: 6 } },
  ];
}

export const elbowRoom: Cinematic = {
  id: "elbow-room",
  heroId: "reaver",
  motif: "elbow-motif",
  shots: [
    /* 0 · CALL — the lane leans in over the board. */
    {
      id: "call",
      kind: "call",
      purpose:
        "The round stops and the room gets small: the battlefield darkens to dusk, the Shambles' house-fronts lean in over the board from both edges of the screen, and the real Reaver rolls its neck and hauls the cleaver up onto its shoulder.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [DUSK, 0], letterbox: 0 },
      toLighting: { tint: [DUSK, 0.55], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:elbow-call" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: TEAL },
        { kind: "elbow-lane", at: 0, until: 1, layer: "screen", params: { phase: "in" } },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.05, sfx: "elbow-crack" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4300 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · CRAMPED — face close-up under a beam. */
    {
      id: "cramped",
      kind: "face-close-up",
      purpose:
        "Identity: the biggest thing in the smallest street. A jetty beam an inch over the Butcher's head; it straightens up and cracks its head on it, plaster comes down, the brow shoots up and it looks up at the beam; then the head comes down, the brow lowers, and the grin.",
      space: "cinematic",
      ms: 700,
      fastMs: 440,
      transition: { kind: "black", ms: 70 },
      camera: {
        from: { x: 750, y: 540, zoom: 1.72, rotate: -6 },
        to: { x: 760, y: 548, zoom: 1.84, rotate: -3 },
        ease: "out",
      },
      background: STREET,
      lighting: { exposure: 0.42, rim: [TEAL, 0.35, 1], vignette: 0.6, letterbox: BARS },
      toLighting: { exposure: 0.48, rim: [TEAL, 0.45, 1], vignette: 0.55, letterbox: BARS },
      actors: [
        { role: "caster", at: [760, 1250], size: 1000, clip: "ult:elbow-shrug", then: "ult:elbow-shrug", look: "lit", root: false },
      ],
      vfx: [
        { kind: "elbow-eaves", at: 0, until: 1, x: 700, y: 532, layer: "front", params: { w: 1600, hook: 0.22 } },
        { kind: "elbow-plaster", at: 0.2, until: 1, x: 700, y: 472, layer: "front", seed: 2, params: { n: 12, dir: 95, spread: 70, reach: 60, size: 14, fall: 320 }, mode: "full" },
        { kind: "elbow-plaster", at: 0.32, until: 1, x: 700, y: 472, layer: "front", seed: 2, params: { n: 12, dir: 95, spread: 70, reach: 60, size: 14, fall: 320 }, mode: "fast" },
      ],
      sound: [
        // The head meets the beam 151ms into the clip, whichever cut this is.
        { at: 0.22, sfx: "elbow-bump", mode: "full" },
        { at: 0.34, sfx: "elbow-bump", mode: "fast" },
      ],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.22, label: "head on the beam" }],
    },

    /* 2 · THE SHAMBLES — down the lane: the row packed across it. */
    {
      id: "shambles",
      kind: "wide-hero",
      purpose:
        "Stakes: down the Shambles from a first-floor window, the houses leaning in to a slit of sky, the real row packed across the lane wall to wall, bracing, and the Butcher coming up the lane at them with the cleaver on its shoulder, its end rattling along the shutters.",
      space: "cinematic",
      ms: 1000,
      fastMs: 520,
      transition: { kind: "cut" },
      camera: {
        from: { x: 990, y: 520, zoom: 1.08 },
        to: { x: 980, y: 540, zoom: 1.18 },
        ease: "inOut",
      },
      background: "elbow-lane",
      lighting: { exposure: 0.78, back: [TEAL, 0], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.72, back: [TEAL, 0], vignette: 0.55, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [930, 770],
          spread: [190, 0],
          size: 250,
          face: -1,
          look: "lit",
          z: 1,
          react: [{ at: 0.55, clip: "anticipate", then: "idle" }],
        },
        { role: "caster", at: [600, 1000], to: [670, 945], size: 440, toSize: 400, clip: "ult:elbow-stride", look: "lit", z: 2 },
      ],
      vfx: [{ kind: "dust", at: 0.1, until: 1, follow: "caster", x: 0, y: -10, scale: 0.6, color: "#e4c58c", layer: "back" }],
      sound: [
        { at: 0.02, sfx: "elbow-rattle", mode: "full" },
        { at: 0.02, sfx: "elbow-rattle-fast", mode: "fast" },
        { at: 0.12, sfx: "elbow-motif" },
      ],
      text: [
        { kind: "name", at: 0.3, until: 1, text: "$name", x: 0.5, y: 0.2, rotate: -3 },
        { kind: "epithet", at: 0.4, until: 1, text: "$epithet", x: 0.5, y: 0.3 },
      ],
      markers: [{ at: 0.3, label: "title" }],
      framing: {
        boss: {
          camera: {
            from: { x: 990, y: 470, zoom: 0.96 },
            to: { x: 980, y: 480, zoom: 1.02 },
            ease: "inOut",
          },
          actors: [
            { role: "targets", at: [1000, 760], spread: [190, 0], size: 230, face: -1, look: "lit", z: 1, react: [{ at: 0.55, clip: "anticipate", then: "idle" }] },
            { role: "caster", at: [590, 1000], to: [660, 945], size: 420, toSize: 380, clip: "ult:elbow-stride", look: "lit", z: 2 },
          ],
        },
      },
    },

    /* 3 · WIND-UP — low Dutch: the blade back level, and the post it bites. */
    {
      id: "wind",
      kind: "dutch",
      purpose:
        "Escalation: the swing will not fit, and it is coming anyway. The Butcher plants its feet and swings the cleaver off its shoulder and back, level at full reach, until the point bites into a timber post behind it with a crunch of plaster; the brow comes down.",
      space: "cinematic",
      ms: 520,
      fastMs: 340,
      transition: { kind: "cut" },
      camera: {
        from: { x: 640, y: 640, zoom: 1.7, rotate: -9 },
        to: { x: 630, y: 650, zoom: 1.9, rotate: -12 },
        ease: "in",
      },
      background: STREET,
      lighting: { exposure: 0.62, rim: [TEAL, 0.7, 1], vignette: 0.55, letterbox: 0.12 },
      toLighting: { exposure: 0.3, rim: [TEAL, 0.9, 1], vignette: 0.75, letterbox: 0.13 },
      actors: [{ role: "caster", at: [760, 860], size: 560, clip: "ult:elbow-wind", then: "ult:elbow-wind", look: "lit" }],
      vfx: [
        { kind: "elbow-post", at: 0, until: 1, x: 380, y: 880, layer: "back", params: { h: 760, by: 0.37, hit: 0.5 }, mode: "full" },
        { kind: "elbow-post", at: 0, until: 1, x: 380, y: 880, layer: "back", params: { h: 760, by: 0.37, hit: 0.76 }, mode: "fast" },
        { kind: "elbow-plaster", at: 0.5, until: 1, x: 390, y: 600, layer: "front", seed: 12, params: { n: 14, dir: 200, spread: 110, reach: 90, size: 15, fall: 200 }, mode: "full" },
        { kind: "elbow-plaster", at: 0.76, until: 1, x: 390, y: 600, layer: "front", seed: 12, params: { n: 14, dir: 200, spread: 110, reach: 90, size: 15, fall: 200 }, mode: "fast" },
      ],
      sound: [{ at: 0, sfx: "elbow-wind" }],
      duck: [{ at: 0.5, level: 0.12, ms: 300 }],
      markers: [{ at: 0.5, label: "bitten" }],
    },

    /* 4 · HUSH — the lane cat gets down. */
    {
      id: "hush",
      kind: "extreme-close-up",
      purpose:
        "The quiet. Near black: a shutter bench, and the lane cat on it, seen only by its edge and its eyes. Its ears go flat, its pupils go round, and it presses itself down below the line of the swing. Music at 3%, one drip off the eaves.",
      space: "cinematic",
      ms: 480,
      fastMs: 340,
      transition: { kind: "cut" },
      camera: { from: { x: 800, y: 450, zoom: 1 }, to: { x: 800, y: 450, zoom: 1 }, ease: "linear" },
      background: STREET,
      lighting: { exposure: 0.05, vignette: 0.95, letterbox: 0.14 },
      toLighting: { exposure: 0.04, vignette: 0.96, letterbox: 0.14 },
      vfx: [{ kind: "elbow-cat", at: 0, until: 1, layer: "screen", seed: 9 }],
      duck: [{ at: 0, level: 0.03, ms: 480 }],
      sound: [{ at: 0, sfx: "elbow-hush" }],
      markers: [{ at: 0.4, label: "down" }],
    },

    /* 5 · MAKE ROOM — the swing round the whole row. */
    {
      id: "sweep",
      kind: "impact",
      purpose:
        "Impact. One flat swing wider than the street: on a teal-and-ink frame the wake is wrapped round the whole row, a gouge is torn level along the far houses, a post splinters past the lens and the sawdust comes up off the cobbles in a sheet; the row is knocked back down the lane. The damage lands on the held frame. MAKE ROOM!",
      space: "cinematic",
      ms: IMPACT_MS,
      fastMs: IMPACT_MS,
      transition: { kind: "cut" },
      camera: {
        from: { x: 880, y: 590, zoom: 1.18, rotate: 4 },
        to: { x: 900, y: 590, zoom: 1.1, rotate: 1.5 },
        ease: "out",
      },
      background: STREET,
      lighting: { exposure: 0.95, tint: [TEAL, 0.12], back: [WAKE, 0.25], rim: [TEAL, 0.8, 1], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.7, tint: [TEAL, 0], back: [WAKE, 0], rim: [TEAL, 0.5, 1], vignette: 0.42, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [770, 850],
          spread: [240, -8],
          size: 360,
          face: -1,
          z: 1,
          react: [{ at: HIT, clip: "hurt" }],
          shove: { at: HIT, by: [150, -6] },
          toTilt: 12,
        },
        { role: "caster", at: [470, 860], size: 470, clip: "ult:elbow-sweep", then: "ult:elbow-sweep", look: "lit", z: 2 },
      ],
      vfx: swing({ wall: 520, ground: 870, lift: 0.52, ry: 0.1, w: 0.16, past: 0.55, saw: 1500, gx: 950, gy: 640 }),
      screen: [{ kind: "two-tone", at: HIT, ms: 70, color: TEAL }],
      stop: [{ at: HIT, ms: 150 }],
      shake: [
        { at: HIT, amount: 0.036 },
        { at: 0.42, amount: 0.012 },
      ],
      sound: [
        { at: 0.06, sfx: "elbow-swing" },
        { at: HIT - 0.004, sfx: "elbow-impact" },
        { at: HIT + 0.01, sfx: "ult-boom" },
      ],
      reveal: [{ at: HIT, reveal: "impact" }],
      text: [
        { kind: "impact", at: HIT + 0.01, until: 0.9, text: "$damage", x: 0.5, y: 0.2, rotate: -4 },
        { kind: "voice", at: 0.36, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: HIT, label: "swept" }],
      framing: {
        boss: {
          camera: {
            from: { x: 880, y: 520, zoom: 1.0, rotate: 3 },
            to: { x: 900, y: 520, zoom: 0.94, rotate: 1 },
            ease: "out",
          },
          actors: [
            {
              role: "targets",
              at: [1000, 860],
              spread: [230, -8],
              size: 380,
              face: -1,
              z: 1,
              react: [{ at: HIT, clip: "hurt" }],
              shove: { at: HIT, by: [40, 0] },
              toTilt: 3,
            },
            { role: "caster", at: [470, 870], size: 440, clip: "ult:elbow-sweep", then: "ult:elbow-sweep", look: "lit", z: 2 },
          ],
          vfx: swing({ wall: 470, ground: 880, lift: 0.55, ry: 0.12, w: 0.18, past: 0.4, saw: 1600, gx: 1000, gy: 560 }),
        },
      },
    },

    /* 6 · ELBOW ROOM — the real board, and room. */
    {
      id: "room",
      kind: "return",
      purpose:
        "Release, over the real battlefield: the lane's house-fronts pushed back out off the screen, the row now standing in the back line with heel-skids ploughed through sawdust behind each of them where they were swept from, and the Butcher setting the blade down and stretching its arms out wide. That's better.",
      space: "battlefield",
      ms: 720,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [DUSK, 0.45], letterbox: BARS },
      toLighting: { tint: [DUSK, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:elbow-stretch" }],
      vfx: [
        { kind: "elbow-lane", at: 0, until: 0.9, layer: "screen", params: { phase: "out" } },
        { kind: "elbow-board", at: 0.05, until: 1, anchor: "targets", stagger: 70 },
      ],
      sound: [
        { at: 0.04, sfx: "elbow-settle" },
        { at: 0.5, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.14, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.3, label: "room" }],
    },
  ],
};
