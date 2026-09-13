import type { ActorCue, Cinematic, VfxCue } from "../../shared/cinematic";

/**
 * DRY FLOOD — the Arcanist · Pyromancer's Ultimate.
 *
 * The idea: the Pyromancer tips its spark over the lip of a spillway that has
 * been dry for years, and the fire goes down it the way the water used to,
 * step by step and faster than the water ever did, and floods the basin where
 * the enemy row is standing.
 *
 * Rhythm: identity (the spark turned over the lip and poured) → stakes and
 * target (the row in the dry basin, under the water's old lines; the first
 * light at the top of the steps; title) → escalation (racing down the steps
 * with the fire's front) → the quiet (from behind the row, looking up the
 * steps: silhouettes, the air drawn up past them, no sound) → impact (the
 * fire over the last step and through the row) → release (the real board:
 * the row still burning, and the Pyromancer beating out its own sleeve).
 *
 * It shares nothing with Debt of Thunder: no weather, no sky, no seal, no
 * tome, no pages, no bolt, no chain, and never a look under the brim. Where
 * that film drowns a hall, this one is a place the water left. Nor with Still
 * Life (no stills, nothing frozen, no shutter), Gatebreaker (no forge, gate,
 * embers or molten metal) or Red Ledger (no pit, no strokes).
 *
 * The storyboard is `docs/ultimates/dry-flood.md`; the spillway's geometry,
 * shared with the drawing and the fire, is `client/ultimates/dry-flood/weir.ts`.
 */

const FIRE = "#ff8a2a";
const GOLD = "#ffc63d";
const SOOT = "#140d09";
const BARS = 0.11;

const flood = (band: "back" | "front", scale: number, surge: number): VfxCue => ({
  kind: "dry-fire",
  at: 0,
  until: 1,
  layer: band,
  scale,
  seed: band === "back" ? 11 : 12,
  // Already down the steps at the cut; through the row on the hit (0.1).
  params: { band, from: 1000, to: 2600, go: 0, end: 0.4, ease: "linear", floorSurge: surge, surge: 1.2, smoke: band === "back" },
});

const struck = (at: [number, number], size: number, spread: [number, number], shove: number): ActorCue => ({
  role: "targets",
  at,
  spread,
  size,
  face: -1,
  look: "lit",
  z: 2,
  react: [{ at: 0.1, clip: "hurt" }],
  shove: { at: 0.1, by: [shove, -4] },
  toTilt: shove > 40 ? 5 : 2,
});

export const dryFlood: Cinematic = {
  id: "dry-flood",
  heroId: "arcanist",
  motif: "dry-motif",
  shots: [
    /* 0 · CALL — the spark catches in the real glove; the round stops. */
    {
      id: "call",
      kind: "call",
      purpose:
        "Break the round: the real Arcanist brings its spark up, it catches like a struck match and becomes a flame in the glove, and the board sinks to soot.",
      space: "battlefield",
      ms: 420,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [SOOT, 0], letterbox: 0 },
      toLighting: { tint: [SOOT, 0.62], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:dry-catch" }],
      vfx: [
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: FIRE },
        { kind: "dry-kindle", at: 0, until: 1, anchor: "caster" },
      ],
      sound: [{ at: 0, sfx: "dry-call" }],
      duck: [{ at: 0, level: 0.3, ms: 4600 }],
      markers: [{ at: 0.5, label: "caught" }],
    },

    /* 1 · LIP — detail at the lip: the flame turned over and poured. */
    {
      id: "lip",
      kind: "detail",
      purpose:
        "Identity. At the lip of the dry spillway the Arcanist holds its arm out over the drop with the spark, now a flame, swelling in the glove; the hand turns over and pours it, a ribbon of fire falling away below, and the heat coming up lifts the hat's tip.",
      space: "cinematic",
      ms: 640,
      fastMs: 400,
      transition: { kind: "black", ms: 60 },
      camera: {
        // Held on the hand until it pours, then down the drop after the fire.
        from: { x: 980, y: 540, zoom: 1.5, rotate: 6 },
        to: { x: 1140, y: 930, zoom: 1.4, rotate: 2 },
        ease: "snap",
      },
      background: "dry-lip",
      lighting: { exposure: 0.5, under: [FIRE, 0.3], rim: [GOLD, 0.55, 1], vignette: 0.55, letterbox: BARS },
      toLighting: { exposure: 0.6, under: [FIRE, 0.75], rim: [GOLD, 0.8, 1], vignette: 0.5, letterbox: BARS },
      actors: [
        { role: "caster", at: [850, 760], size: 560, clip: "ult:dry-pour", then: "ult:dry-pour", look: "rim", rim: GOLD, root: false },
      ],
      vfx: [
        { kind: "dry-flame", at: 0, until: 1, layer: "front" },
        { kind: "dry-pour", at: 0, until: 1, layer: "front", seed: 5, params: { land: 1150 } },
      ],
      sound: [
        { at: 0, sfx: "dry-catch" },
        { at: 0.34, sfx: "dry-pour", mode: "full" },
        { at: 0.55, sfx: "dry-pour", mode: "fast" },
      ],
      text: [{ kind: "voice", at: 0.3, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.35, label: "poured" }],
    },

    /* 2 · BASIN — the row in the dry basin, under the water's old lines. */
    {
      id: "basin",
      kind: "target",
      purpose:
        "Stakes and target. The real enemy row stands on the cracked silt of the basin, the tide-lines of every height the water stood at on the wall above them; at the top of the steps the fire's first light comes over, and they look up at it.",
      space: "cinematic",
      ms: 900,
      fastMs: 0,
      transition: { kind: "cut" },
      camera: {
        from: { x: 1230, y: 600, zoom: 1.34 },
        to: { x: 1200, y: 585, zoom: 1.44 },
        ease: "inOut",
      },
      background: "dry-weir",
      lighting: { exposure: 0.5, under: [FIRE, 0.06], back: [FIRE, 0.08], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.6, under: [FIRE, 0.18], back: [FIRE, 0.16], vignette: 0.45, letterbox: BARS },
      actors: [
        {
          role: "targets",
          at: [1250, 836],
          spread: [210, 6],
          size: 260,
          face: -1,
          look: "lit",
          z: 2,
          react: [
            { at: 0.12, clip: "anticipate" },
            { at: 0.66, clip: "block" },
          ],
        },
      ],
      vfx: [
        { kind: "dry-fire", at: 0, until: 1, layer: "front", seed: 21, params: { band: "all", from: -30, to: 600, go: 0.3, end: 1, ease: "linear", smoke: true } },
      ],
      sound: [
        { at: 0.04, sfx: "dry-motif" },
        { at: 0.3, sfx: "dry-roar" },
      ],
      text: [
        { kind: "name", at: 0.14, until: 1, text: "$name", x: 0.54, y: 0.18 },
        { kind: "epithet", at: 0.24, until: 1, text: "$epithet", x: 0.54, y: 0.28 },
      ],
      markers: [
        { at: 0.3, label: "the first light" },
        { at: 0.66, label: "they look up" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 1240, y: 570, zoom: 1.16 },
            to: { x: 1210, y: 560, zoom: 1.24 },
            ease: "inOut",
          },
        },
        boss: {
          camera: {
            from: { x: 1240, y: 500, zoom: 0.98 },
            to: { x: 1215, y: 495, zoom: 1.04 },
            ease: "inOut",
          },
          actors: [
            {
              role: "targets",
              at: [1330, 840],
              spread: [260, 6],
              size: 250,
              face: -1,
              look: "lit",
              z: 2,
              react: [
                { at: 0.12, clip: "anticipate" },
                { at: 0.66, clip: "block" },
              ],
            },
          ],
        },
      },
    },

    /* 3 · RUN — bolted to the fire's front, racing down the steps. */
    {
      id: "run",
      kind: "projectile-follow",
      purpose:
        "Escalation. The camera races down the spillway with the fire's front: tall tongues leaning the way it runs, a sheet of flame spilling over every riser as it passes, smoke trailing behind; it goes faster step by step, faster than the water ever did. Smoke rolls across the lens.",
      space: "cinematic",
      ms: 560,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: {
        from: { x: 700, y: 520, zoom: 1.8, rotate: -12 },
        to: { x: 1240, y: 800, zoom: 1.7, rotate: -16 },
        ease: "linear",
      },
      background: "dry-weir",
      lighting: { exposure: 0.5, under: [FIRE, 0.3], back: [FIRE, 0.12], vignette: 0.5, letterbox: BARS },
      toLighting: { exposure: 0.62, under: [FIRE, 0.45], back: [FIRE, 0.2], vignette: 0.45, letterbox: BARS },
      vfx: [
        { kind: "dry-fire", at: 0, until: 1, layer: "front", seed: 31, params: { band: "all", from: 170, to: 1100, go: 0, end: 1, ease: "linear", surge: 1.8, smoke: true } },
        { kind: "dry-smoke-wipe", at: 0.72, until: 1, layer: "screen", params: { half: "out" } },
      ],
      sound: [
        { at: 0, sfx: "dry-run" },
        { at: 0, sfx: "dry-motif", mode: "fast" },
      ],
      text: [{ kind: "name", at: 0.04, until: 0.72, text: "$name", x: 0.56, y: 0.2, mode: "fast" }],
      markers: [{ at: 0.5, label: "halfway down" }],
    },

    /* 4 · DRAW — the quiet: from behind the row, up the steps, the air drawn in. */
    {
      id: "draw",
      kind: "over-the-shoulder",
      purpose:
        "The quiet. From behind the row, looking up the spillway: the enemies black against the light coming along the top step, the fire itself not yet in sight. Nothing moves but the air, drawn up the steps past them towards the fire, and one dry leaf lifted after it. No music; one breath in, then nothing.",
      space: "cinematic",
      ms: 520,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: { from: { x: 800, y: 440, zoom: 1.24 }, to: { x: 800, y: 432, zoom: 1.27 }, ease: "linear" },
      background: "dry-steps",
      lighting: { exposure: 0.34, back: [FIRE, 0.28], vignette: 0.8, letterbox: 0.15 },
      toLighting: { exposure: 0.28, back: [FIRE, 0.42], vignette: 0.82, letterbox: 0.15 },
      actors: [
        {
          role: "targets",
          at: [1060, 950],
          spread: [-540, 0],
          size: 600,
          face: -1,
          look: "silhouette",
          z: 2,
          react: [{ at: 0, clip: "anticipate" }],
        },
      ],
      vfx: [
        { kind: "dry-crest", at: 0, until: 1, layer: "back", params: { left: 563, right: 1037, y: 344 } },
        { kind: "dry-draft", at: 0, until: 1, layer: "back", seed: 9 },
        { kind: "dry-smoke-wipe", at: 0, until: 0.3, layer: "screen", params: { half: "in" } },
      ],
      duck: [{ at: 0, level: 0.05, ms: 520 }],
      sound: [
        { at: 0.02, sfx: "dry-draw", mode: "full" },
        { at: 0.02, sfx: "dry-draw-fast", mode: "fast" },
      ],
      markers: [{ at: 0.5, label: "held" }],
      framing: {
        // A big figure would stand in front of the light it is waiting for:
        // it stands to one side of the steps instead, the crest clear of it.
        large: {
          actors: [
            { role: "targets", at: [1180, 960], spread: [-640, 0], size: 420, face: -1, look: "silhouette", z: 2, react: [{ at: 0, clip: "anticipate" }] },
          ],
        },
        boss: {
          actors: [
            { role: "targets", at: [1270, 990], spread: [-760, 0], size: 330, face: -1, look: "silhouette", z: 2, react: [{ at: 0, clip: "anticipate" }] },
          ],
        },
      },
    },

    /* 5 · FLOOD — the impact: the fire over the last step and through the row. */
    {
      id: "flood",
      kind: "impact",
      purpose:
        "Impact. The whole spillway on a slant, from the small Pyromancer on the lip, its arm flung down after the fire, to the row at the foot of the steps: the fire comes over the last step and floods the basin through them on an orange two-tone frame; after it the row stands struck in a basin of flame, tall tongues behind them and low ones before them, a column going up the target, and the damage on the frame.",
      space: "cinematic",
      ms: 780,
      fastMs: 560,
      transition: { kind: "cut" },
      camera: {
        from: { x: 975, y: 530, zoom: 1.3, rotate: -5 },
        to: { x: 1005, y: 545, zoom: 1.2, rotate: -2 },
        ease: "out",
      },
      background: "dry-weir",
      lighting: { exposure: 0.8, under: [FIRE, 0.55], vignette: 0.35, letterbox: BARS },
      toLighting: { exposure: 0.6, under: [FIRE, 0.38], vignette: 0.45, letterbox: BARS },
      actors: [
        { role: "caster", at: [528, 332], size: 180, clip: "ult:dry-send", then: "ult:dry-send", look: "rim", rim: FIRE, z: 1 },
        struck([1250, 836], 290, [210, 6], 70),
      ],
      vfx: [
        flood("back", 1, 2.6),
        { kind: "dry-flare", at: 0, until: 0.7, follow: "target", layer: "back", scale: 1.25, seed: 7, params: { hit: 0.07 } },
        flood("front", 1, 1.5),
        { kind: "dry-smoke", at: 0.28, until: 1, layer: "back", seed: 4, scale: 1.1, params: { at: "1230,700;1470,690;760,420" } },
      ],
      screen: [
        { kind: "two-tone", at: 0.1, ms: 70, color: FIRE },
      ],
      stop: [{ at: 0.1, ms: 150 }],
      shake: [
        { at: 0.1, amount: 0.036 },
        { at: 0.42, amount: 0.012 },
      ],
      sound: [{ at: 0.095, sfx: "dry-impact" }],
      reveal: [{ at: 0.1, reveal: "impact" }],
      text: [
        { kind: "impact", at: 0.1, until: 0.95, text: "$damage", x: 0.7, y: 0.2, rotate: -4 },
        { kind: "voice", at: 0.46, until: 1, text: "$voice.impact" },
      ],
      markers: [
        { at: 0.1, label: "through the row" },
        { at: 0.42, label: "the basin burning" },
      ],
      framing: {
        large: {
          camera: {
            from: { x: 1070, y: 545, zoom: 1.14, rotate: -5 },
            to: { x: 1100, y: 555, zoom: 1.06, rotate: -2 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [528, 332], size: 170, clip: "ult:dry-send", then: "ult:dry-send", look: "rim", rim: FIRE, z: 1 },
            struck([1270, 840], 280, [230, 6], 45),
          ],
        },
        boss: {
          camera: {
            from: { x: 1130, y: 470, zoom: 0.96, rotate: -4 },
            to: { x: 1150, y: 480, zoom: 0.9, rotate: -2 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [528, 332], size: 160, clip: "ult:dry-send", then: "ult:dry-send", look: "rim", rim: FIRE, z: 1 },
            struck([1350, 842], 260, [260, 6], 18),
          ],
          vfx: [
            flood("back", 1.35, 3),
            { kind: "dry-flare", at: 0, until: 0.7, follow: "target", layer: "back", scale: 2, seed: 7, params: { hit: 0.07 } },
            flood("front", 1.3, 1.6),
            { kind: "dry-smoke", at: 0.28, until: 1, layer: "back", seed: 4, scale: 1.6, params: { at: "1330,560;1600,620;760,420" } },
          ],
        },
      },
    },

    /* 6 · BURNING — back on the board: the row still burning, the sleeve beaten out. */
    {
      id: "burning",
      kind: "return",
      purpose:
        "Release. Back on the real battlefield every enemy of the row is still burning, a scorch under it and smoke going up off it: the Burn that will keep going. The real Pyromancer finds its own sleeve alight and beats it out, and a wisp of smoke is left.",
      space: "battlefield",
      ms: 700,
      fastMs: 480,
      transition: { kind: "flash", ms: 80 },
      background: "battlefield",
      lighting: { tint: [SOOT, 0.45], letterbox: BARS },
      toLighting: { tint: [SOOT, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:dry-swat" }],
      vfx: [
        { kind: "dry-burning", at: 0, until: 1, anchor: "targets", stagger: 70 },
        { kind: "dry-singe", at: 0, until: 1, anchor: "caster" },
      ],
      sound: [
        { at: 0.05, sfx: "dry-after" },
        { at: 0.4, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0, reveal: "all" }],
      text: [{ kind: "voice", at: 0.14, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.3, label: "the sleeve" }],
    },
  ],
};
