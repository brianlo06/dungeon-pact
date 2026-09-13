import type { Cinematic } from "../../shared/cinematic";

/**
 * GATEBREAKER — the Breaker's Ultimate.
 *
 * Fantasy: "the wall learns to move forward." Where the Lantern Wall is a
 * hall of light the party stands in, this is a forge and a door. The Breaker
 * heats the shield's rim until it glows, sets its feet, and goes *through* the
 * enemy line the way a ram goes through a gate — and then stands on the far
 * side of it with its guard down, because it no longer cares.
 *
 * It shares no shot with the Lantern Wall. The Wall opens on a planted shield
 * and closes on wards; this opens on a hand and an edge, closes on cracks in
 * the floor under a broken formation, and its camera never looks up at the
 * hero once — it rides behind the shield instead. Warm gold becomes forge red;
 * a held breath becomes a crouch that loads like a spring.
 *
 * The storyboard is `docs/ULTIMATES.md`.
 */

const RED = "#ff6a3a";
const MOLTEN = "#ffb347";
const BARS = 0.12;

export const gatebreaker: Cinematic = {
  id: "gatebreaker",
  heroId: "vanguard",
  motif: "motif-breaker",
  shots: [
    /* 0 · CALL — the Breaker's shield heats where it stands. */
    {
      id: "call",
      kind: "call",
      purpose: "The round stops: the Breaker glows forge-red and stamps.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: ["#0b0503", 0], letterbox: 0 },
      toLighting: { tint: ["#0b0503", 0.66], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:heat" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: RED },
        { kind: "embers", at: 0, until: 1, anchor: "caster", color: MOLTEN },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.35, sfx: "footstep-heavy" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4000 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · HEAT — detail: along the shield's rim as the seam opens. */
    {
      id: "heat",
      kind: "detail",
      purpose:
        "Identity. Not a lantern but a forge: the shield turned edge-on, its rim glowing open, the grip locking.",
      space: "cinematic",
      ms: 600,
      fastMs: 380,
      transition: { kind: "black", ms: 60 },
      camera: {
        from: { x: 870, y: 610, zoom: 3.4, rotate: 12 },
        to: { x: 935, y: 590, zoom: 3.6, rotate: 9 },
        ease: "linear",
      },
      background: "breach-forge",
      lighting: {
        exposure: 0.18,
        under: [RED, 0.5],
        rim: [MOLTEN, 0.9, 1],
        vignette: 0.8,
        letterbox: BARS,
      },
      toLighting: {
        exposure: 0.3,
        under: [RED, 0.8],
        rim: [MOLTEN, 1, 1],
        vignette: 0.7,
        letterbox: BARS,
      },
      actors: [
        {
          role: "caster",
          at: [800, 820],
          size: 560,
          clip: "ult:heat",
          then: "ult:heat",
          look: "rim",
          rim: RED,
        },
      ],
      vfx: [
        { kind: "molten-seam", at: 0.05, until: 1, follow: "caster", x: 130, y: -250, scale: 1.1, color: MOLTEN, layer: "front" },
        { kind: "sparks", at: 0.2, until: 1, follow: "caster", x: 140, y: -150, scale: 1, color: MOLTEN, seed: 5, layer: "front" },
        { kind: "embers", at: 0, until: 1, x: 900, y: 620, scale: 1.2, color: MOLTEN, layer: "back" },
      ],
      sound: [
        { at: 0, sfx: "ult-forge" },
        { at: 0.25, sfx: "ult-grind" },
      ],
      text: [{ kind: "voice", at: 0.35, until: 1, text: "$voice.activation" }],
    },

    /* 2 · GATE — over the shoulder: the whole row, and a gate behind it. */
    {
      id: "gate",
      kind: "over-the-shoulder",
      purpose:
        "Target and stakes. The Breaker's dark shoulder fills the left of the frame; the real enemy row stands in front of a vault gate, lit from below.",
      space: "cinematic",
      ms: 860,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 860, y: 520, zoom: 1.22 },
        to: { x: 900, y: 510, zoom: 1.38 },
        ease: "inOut",
      },
      background: "breach-forge",
      lighting: {
        exposure: 0.55,
        under: [RED, 0.7],
        back: [RED, 0.45],
        rim: [MOLTEN, 0.9, 1],
        vignette: 0.5,
        letterbox: BARS,
      },
      toLighting: {
        exposure: 0.68,
        under: [RED, 0.9],
        back: [RED, 0.6],
        rim: [MOLTEN, 1, 1],
        vignette: 0.45,
        letterbox: BARS,
      },
      actors: [
        {
          role: "targets",
          at: [1020, 700],
          spread: [240, -12],
          size: 300,
          face: -1,
          look: "lit",
          z: 1,
          react: [{ at: 0.55, clip: "anticipate", then: "idle" }],
        },
        {
          role: "caster",
          at: [360, 1180],
          to: [390, 1170],
          size: 1250,
          clip: "ult:crouch",
          clipAt: 0.5,
          then: "ult:crouch",
          look: "rim",
          rim: MOLTEN,
          z: 3,
        },
      ],
      vfx: [
        { kind: "vault-gate", at: 0, until: 1, x: 1200, y: 700, scale: 1, color: RED, layer: "back", params: { broken: false } },
        { kind: "embers", at: 0, until: 1, x: 900, y: 600, scale: 2.2, color: MOLTEN, layer: "front" },
      ],
      sound: [{ at: 0.05, sfx: "motif-breaker" }],
      text: [
        { kind: "name", at: 0.34, until: 1, text: "$name", x: 0.52, y: 0.22, rotate: -4 },
        { kind: "epithet", at: 0.44, until: 1, text: "$epithet", x: 0.52, y: 0.32 },
      ],
      markers: [{ at: 0.34, label: "title" }],
    },

    /* 3 · LOAD — Dutch low angle: the crouch, and the embers sucked inward. */
    {
      id: "load",
      kind: "dutch",
      purpose:
        "Anticipation. The Breaker sinks onto its heels and everything pulls towards the shield — the embers, the light, the sound — before it lets go.",
      space: "cinematic",
      ms: 460,
      fastMs: 320,
      transition: { kind: "cut" },
      camera: {
        from: { x: 900, y: 700, zoom: 2.0, rotate: -13 },
        to: { x: 930, y: 720, zoom: 2.35, rotate: -15 },
        ease: "in",
      },
      background: "breach-forge",
      lighting: {
        exposure: 0.2,
        under: [RED, 0.9],
        rim: [MOLTEN, 1, 1],
        vignette: 0.75,
        letterbox: 0.15,
      },
      toLighting: {
        exposure: 0.08,
        under: [RED, 1],
        rim: [MOLTEN, 1, 1],
        vignette: 0.9,
        letterbox: 0.16,
      },
      actors: [
        {
          role: "caster",
          at: [760, 860],
          size: 620,
          clip: "ult:crouch",
          then: "ult:crouch",
          look: "rim",
          rim: RED,
        },
      ],
      vfx: [
        { kind: "gather", at: 0, until: 1, follow: "caster", x: 285, y: -110, scale: 1.6, color: MOLTEN, layer: "front" },
        { kind: "floor-cracks", at: 0.1, until: 1, x: 760, y: 862, scale: 1.2, color: RED, seed: 7, layer: "front", params: { inward: true } },
      ],
      duck: [{ at: 0, level: 0.1, ms: 460 }],
      sound: [{ at: 0.1, sfx: "ult-grind" }],
      text: [
        { kind: "name", at: 0.05, until: 1, text: "$name", x: 0.52, y: 0.22, rotate: -4, mode: "fast" },
      ],
      markers: [{ at: 0.95, label: "release" }],
    },

    /* 4 · RAM — riding behind the shield as the row rushes up at the lens. */
    {
      id: "ram",
      kind: "projectile-follow",
      purpose:
        "Motion. The camera is bolted to the shield; the floor streaks, debris whips past the lens, and the row and its gate come up fast.",
      space: "cinematic",
      ms: 560,
      fastMs: 380,
      transition: { kind: "whip", ms: 120, dir: 1 },
      camera: {
        from: { x: 560, y: 600, zoom: 1.9, rotate: 4 },
        to: { x: 1030, y: 600, zoom: 1.7, rotate: 2 },
        ease: "in",
      },
      background: "breach-forge",
      lighting: { exposure: 0.55, under: [RED, 0.5], rim: [MOLTEN, 0.9, 1], vignette: 0.5, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [1230, 780],
          spread: [220, -6],
          size: 380,
          face: -1,
          z: 1,
          react: [{ at: 0.5, clip: "block" }],
        },
        {
          role: "caster",
          at: [380, 800],
          to: [1080, 800],
          ease: "in",
          size: 460,
          clip: "ult:ram",
          look: "rim",
          rim: RED,
          z: 2,
        },
      ],
      vfx: [
        { kind: "vault-gate", at: 0, until: 1, x: 1440, y: 780, scale: 1.2, color: RED, layer: "back", params: { broken: false } },
        { kind: "speed-lines", at: 0, until: 1, layer: "screen", color: RED, params: { dir: 1, dense: true } },
        { kind: "trail", at: 0, until: 1, follow: "caster", x: -20, y: -210, scale: 1.6, color: RED, layer: "back" },
        { kind: "debris", at: 0.3, until: 1, follow: "caster", x: 180, y: -120, scale: 1.4, color: "#6b4a3a", seed: 11, layer: "screen", params: { pass: true } },
      ],
      sound: [
        { at: 0, sfx: "ult-whoosh" },
        { at: 0.1, sfx: "footstep-heavy" },
        { at: 0.3, sfx: "footstep-heavy" },
        { at: 0.45, sfx: "footstep-heavy" },
      ],
      framing: {
        boss: {
          camera: {
            from: { x: 620, y: 500, zoom: 1.2, rotate: 3 },
            to: { x: 980, y: 480, zoom: 1.1, rotate: 1 },
            ease: "in",
          },
          actors: [
            { role: "targets", at: [1280, 840], spread: [230, -10], size: 440, face: -1, z: 1, react: [{ at: 0.5, clip: "block" }] },
            { role: "caster", at: [300, 840], to: [860, 840], ease: "in", size: 340, clip: "ult:ram", look: "rim", rim: RED, z: 2 },
          ],
        },
      },
    },

    /* 5 · BREACH — wide: black, white, and the gate and the row come apart. */
    {
      id: "breach",
      kind: "impact",
      purpose:
        "Impact, across a line. One black frame, one white, then the gate bursts into plates and every enemy in the row is hit in turn.",
      space: "cinematic",
      ms: 700,
      fastMs: 540,
      transition: { kind: "black", ms: 45 },
      camera: {
        from: { x: 1040, y: 560, zoom: 1.55, rotate: 6 },
        to: { x: 1080, y: 545, zoom: 1.34, rotate: 3 },
        ease: "out",
      },
      background: "breach-forge",
      lighting: { exposure: 1, tint: [MOLTEN, 0.25], under: [RED, 0.6], vignette: 0.3, letterbox: BARS },
      toLighting: { exposure: 0.55, tint: [MOLTEN, 0], under: [RED, 0.4], vignette: 0.45, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [1180, 790],
          spread: [210, -6],
          size: 380,
          face: -1,
          z: 1,
          react: [{ at: 0.04, clip: "hurt" }],
          shove: { at: 0.04, by: [170, -10] },
          toTilt: 10,
        },
        {
          role: "caster",
          at: [940, 800],
          to: [1060, 800],
          ease: "out",
          size: 470,
          clip: "ult:breach",
          look: "rim",
          rim: RED,
          z: 2,
        },
      ],
      vfx: [
        { kind: "vault-gate", at: 0, until: 1, x: 1330, y: 790, scale: 1.2, color: RED, layer: "back", params: { broken: true } },
        { kind: "impact-star", at: 0.02, until: 0.3, x: 1120, y: 620, scale: 2.2, color: MOLTEN, layer: "front", seed: 5, params: { jagged: true } },
        { kind: "shockwave", at: 0.04, until: 0.7, x: 1140, y: 700, scale: 3, color: RED, layer: "front", params: { line: true } },
        { kind: "debris", at: 0.04, until: 1, x: 1200, y: 640, scale: 2.2, color: "#5a3b2e", seed: 21, layer: "front" },
        { kind: "sparks", at: 0.04, until: 0.8, x: 1150, y: 640, scale: 2, color: MOLTEN, seed: 13, layer: "front" },
        { kind: "embers", at: 0.1, until: 1, x: 1150, y: 640, scale: 2, color: MOLTEN, layer: "front", params: { burst: true } },
      ],
      screen: [
        { kind: "flash", at: 0.02, ms: 70, amount: 1, color: "#fff1e0" },
        { kind: "two-tone", at: 0.06, ms: 60, color: RED, mode: "full" },
        { kind: "chromatic", at: 0.06, ms: 200, amount: 1.2 },
        { kind: "radial", at: 0.02, ms: 260, color: MOLTEN },
      ],
      stop: [{ at: 0.04, ms: 130 }],
      shake: [
        { at: 0.04, amount: 0.04 },
        { at: 0.24, amount: 0.02 },
      ],
      sound: [
        { at: 0.02, sfx: "ult-impact" },
        { at: 0.04, sfx: "ult-shatter" },
        { at: 0.06, sfx: "ult-boom" },
      ],
      reveal: [{ at: 0.05, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.08, until: 0.9, text: "BREACH", x: 0.5, y: 0.3, rotate: 4 },
        { kind: "voice", at: 0.3, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: 0.04, label: "contact" }],
      framing: {
        boss: {
          camera: {
            from: { x: 1080, y: 480, zoom: 1.2, rotate: 5 },
            to: { x: 1100, y: 470, zoom: 1.08, rotate: 2 },
            ease: "out",
          },
          actors: [
            {
              role: "targets",
              at: [1260, 840],
              spread: [230, -10],
              size: 440,
              face: -1,
              z: 1,
              react: [{ at: 0.04, clip: "hurt" }],
              shove: { at: 0.04, by: [60, 0] },
              toTilt: 3,
            },
            { role: "caster", at: [880, 840], to: [960, 840], ease: "out", size: 360, clip: "ult:breach", look: "rim", rim: RED, z: 2 },
          ],
        },
      },
    },

    /* 6 · OPEN — back on the battlefield: cracks under the dragged row, the Breaker's guard down. */
    {
      id: "open",
      kind: "aftermath",
      purpose:
        "Release. The film hands back; the row it hit is on the front line now, cracked open, and the Breaker stands there unguarded.",
      space: "battlefield",
      ms: 660,
      fastMs: 460,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: ["#0b0503", 0.45], letterbox: BARS },
      toLighting: { tint: ["#0b0503", 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:open" }],
      vfx: [
        { kind: "floor-cracks", at: 0, until: 1, anchor: "targets", stagger: 60, color: RED, scale: 0.5 },
        { kind: "embers", at: 0, until: 1, anchor: "caster", color: MOLTEN },
      ],
      sound: [{ at: 0.1, sfx: "ult-tail" }],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.1, until: 1, text: "$voice.after" }],
    },
  ],
};
