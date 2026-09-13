import type { Cinematic } from "../../shared/cinematic";
import type { UltimateDef } from "../ultimates";

/**
 * Every authored cinematic, by the name an Ultimate's presentation gives it.
 *
 * One file per film in this folder, collected here. An Ultimate whose film
 * has not been authored plays the generic cinematic below, built from its own
 * name, accent and target, so it is never missing and never pretends to be
 * finished.
 */
const films = import.meta.glob<Record<string, unknown>>("./*.ts", { eager: true });
export const cinematics: Record<string, Cinematic> = {};
for (const [path, mod] of Object.entries(films)) {
  if (path === "./index.ts") continue;
  // One film per file; whatever it is exported as.
  for (const value of Object.values(mod)) {
    const film = value as Cinematic;
    if (!film || typeof film !== "object" || !Array.isArray(film.shots)) continue;
    if (cinematics[film.id]) throw Error(`Cinematic ${film.id} is defined twice (${path})`);
    cinematics[film.id] = film;
  }
}

export function cinematicFor(u: UltimateDef): Cinematic {
  const named = u.presentation.cinematic;
  return (named && cinematics[named]) || genericCinematic(u);
}

/**
 * The placeholder: a call, a hero shot with the name, the blow if there is a
 * target, and the return. Three and a half seconds, no authored poses — the
 * combat clips — and no background but the accent. It exists so an Ultimate
 * without its own film still breaks the round's rhythm and still shows what
 * it did, not so anyone mistakes it for the real thing.
 */
export function genericCinematic(u: UltimateDef): Cinematic {
  const accent = u.presentation.accent ?? "#ffd98a";
  const aimed = u.target === "enemy" || u.target === "enemyRow";
  const bars = 0.1;
  return {
    id: `generic:${u.id}`,
    heroId: u.heroId,
    shots: [
      {
        id: "call",
        kind: "call",
        purpose: "The caster lights up where it stands.",
        space: "battlefield",
        ms: 360,
        fastMs: 220,
        background: "battlefield",
        lighting: { tint: ["#07060a", 0], letterbox: 0 },
        toLighting: { tint: ["#07060a", 0.55], letterbox: bars },
        vfx: [{ kind: "call-aura", at: 0, until: 1, anchor: "caster", color: accent }],
        sound: [{ at: 0, sfx: "ult-call" }],
        duck: [{ at: 0, level: 0.4, ms: 3200 }],
      },
      {
        id: "hero",
        kind: "wide-hero",
        purpose: "The caster, alone, named.",
        space: "cinematic",
        ms: 1000,
        fastMs: 520,
        transition: { kind: "flash", ms: 60 },
        camera: {
          from: { x: 800, y: 520, zoom: 1.55 },
          to: { x: 800, y: 500, zoom: 1.75 },
          ease: "out",
        },
        background: "pact-sigil",
        lighting: {
          exposure: 0.6,
          back: [accent, 0.6],
          rim: [accent, 0.9, 1],
          vignette: 0.55,
          letterbox: bars,
        },
        actors: [
          {
            role: "caster",
            at: [760, 880],
            size: 640,
            clip: aimed ? "signature" : "cast",
            clipAt: 0.35,
            look: "rim",
            rim: accent,
          },
        ],
        vfx: [
          { kind: "gather", at: 0.1, until: 0.7, follow: "caster", x: 40, y: -380, scale: 1.4, color: accent, layer: "front" },
          { kind: "motes", at: 0, until: 1, x: 800, y: 600, scale: 2, color: accent, layer: "front" },
        ],
        sound: [{ at: 0.05, sfx: "ult-rise" }],
        text: [
          { kind: "name", at: 0.2, until: 1, text: "$name", x: 0.08, y: 0.64 },
          { kind: "epithet", at: 0.3, until: 1, text: "$epithet", x: 0.08, y: 0.74 },
        ],
        reveal: aimed ? [] : [{ at: 0.7, reveal: "all" }],
      },
      ...(aimed
        ? [
            {
              id: "blow",
              kind: "impact" as const,
              purpose: "The target, and what hit it.",
              space: "cinematic" as const,
              ms: 760,
              fastMs: 520,
              transition: { kind: "cut" as const },
              camera: {
                from: { x: 1000, y: 560, zoom: 1.8, rotate: -4 },
                to: { x: 1030, y: 555, zoom: 1.65, rotate: -2 },
                ease: "out" as const,
              },
              background: "pact-sigil" as const,
              lighting: { exposure: 0.7, rim: [accent, 0.8, 1] as [string, number, 1], vignette: 0.45, letterbox: bars },
              actors: [
                { role: "caster" as const, at: [820, 780] as [number, number], size: 430, clip: "attack", look: "rim" as const, rim: accent, z: 2 },
                {
                  role: "target" as const,
                  at: [1180, 780] as [number, number],
                  size: 430,
                  face: -1 as const,
                  z: 1,
                  react: [{ at: 0.3, clip: "hurt" }],
                  shove: { at: 0.3, by: [80, 0] as [number, number] },
                },
              ],
              vfx: [
                { kind: "impact-star" as const, at: 0.28, until: 0.55, x: 1110, y: 610, scale: 1.3, color: accent, layer: "front" as const },
                { kind: "shockwave" as const, at: 0.3, until: 0.9, x: 1130, y: 620, scale: 2, color: accent, layer: "front" as const },
              ],
              screen: [{ kind: "flash" as const, at: 0.28, ms: 90, amount: 0.7 }],
              stop: [{ at: 0.3, ms: 110 }],
              shake: [{ at: 0.3, amount: 0.024 }],
              sound: [
                { at: 0.28, sfx: "ult-impact" },
                { at: 0.3, sfx: "ult-boom" },
              ],
              reveal: [{ at: 0.3, reveal: "all" as const }],
              text: [{ kind: "impact" as const, at: 0.32, until: 0.9, text: "$damage", x: 0.64, y: 0.34, rotate: -5 }],
            },
          ]
        : []),
      {
        id: "return",
        kind: "return",
        purpose: "Back to the fight.",
        space: "battlefield",
        ms: 520,
        fastMs: 360,
        transition: { kind: "flash", ms: 80 },
        background: "battlefield",
        lighting: { tint: ["#07060a", 0.4], letterbox: bars },
        toLighting: { tint: ["#07060a", 0], letterbox: 0 },
        sound: [{ at: 0.05, sfx: "ult-tail" }],
        reveal: [{ at: 0, reveal: "all" }],
      },
    ],
  };
}

/**
 * The reduced-motion cut of any Ultimate: three still cards. No camera, no
 * flashes, no shake, nothing that moves — a portrait with the name, the target
 * with what landed on it, and the board. It still says, clearly, that this was
 * not an ordinary action.
 */
export function reducedCinematic(u: UltimateDef): Cinematic {
  const accent = u.presentation.accent ?? "#ffd98a";
  const aimed = u.target === "enemy" || u.target === "enemyRow";
  const still = { exposure: 0.55, back: [accent, 0.35] as [string, number], vignette: 0.4, letterbox: 0.1 };
  return {
    id: `reduced:${u.id}`,
    heroId: u.heroId,
    shots: [
      {
        id: "portrait",
        kind: "wide-hero",
        purpose: "Who, and what: the caster and the Ultimate's name.",
        space: "cinematic",
        ms: 1100,
        fastMs: 800,
        camera: { from: { x: 800, y: 520, zoom: 1.6 } },
        background: "pact-sigil",
        lighting: still,
        actors: [{ role: "caster", at: [640, 880], size: 640, look: "rim", rim: accent }],
        text: [
          { kind: "name", at: 0, until: 1, text: "$name", x: 0.5, y: 0.6 },
          { kind: "epithet", at: 0, until: 1, text: "$epithet", x: 0.5, y: 0.7 },
        ],
      },
      ...(aimed
        ? [
            {
              id: "target",
              kind: "target" as const,
              purpose: "On whom, and how much.",
              space: "cinematic" as const,
              ms: 900,
              fastMs: 650,
              camera: { from: { x: 1000, y: 540, zoom: 1.6 } },
              background: "pact-sigil" as const,
              lighting: still,
              actors: [
                { role: "caster" as const, at: [800, 800] as [number, number], size: 420, look: "rim" as const, rim: accent },
                { role: "target" as const, at: [1180, 800] as [number, number], size: 430, face: -1 as const },
              ],
              reveal: [{ at: 0, reveal: "all" as const }],
              text: [{ kind: "impact" as const, at: 0, until: 1, text: "$damage", x: 0.62, y: 0.34 }],
            },
          ]
        : []),
      {
        id: "return",
        kind: "return",
        purpose: "The board, as it now stands.",
        space: "battlefield",
        ms: 400,
        fastMs: 300,
        background: "battlefield",
        lighting: { tint: ["#07060a", 0.3], letterbox: 0.1 },
        reveal: [{ at: 0, reveal: "all" }],
        text: [{ kind: "name", at: 0, until: 1, text: "$name", x: 0.5, y: 0.5 }],
      },
    ],
  };
}
