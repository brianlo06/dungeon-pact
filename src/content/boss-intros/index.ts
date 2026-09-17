import type { Cinematic } from "../../shared/cinematic";
import type { EnemyDef } from "../../shared/model";

/**
 * Boss intros: the entrance a boss makes when the party walks into its
 * chamber, before the first round is planned.
 *
 * An intro is an ordinary cinematic (`shared/cinematic.ts`) played by the same
 * player as the Ultimates, with a different cast: no caster, the boss as the
 * `target`, the boss and its escort as `targets`, and the party as `allies`.
 * Its title card is the `title` text kind. It reveals nothing — the fight is
 * already set up behind it — and it is presentation only: every client plays
 * its own, and a round that resolves under it ends it.
 *
 * One file per boss in this folder, collected here, each exporting a
 * `BossIntroFilm`. Its presentation (backgrounds, effects, sounds, `intro:`
 * poses) lives in `src/client/boss-intros/<boss>/`. A boss without an authored
 * intro plays the generic one below, built from its own name and accent.
 */
export interface BossIntroFilm extends Cinematic {
  bossId: string;
  /** The colour of the title card's seal and the film's light. */
  accent: string;
  /** What the boss says as it is revealed, if anything (`$voice.activation`). */
  line?: string;
}

const files = import.meta.glob<Record<string, unknown>>("./*.ts", { eager: true });
export const bossIntros: Record<string, BossIntroFilm> = {};
for (const [path, mod] of Object.entries(files)) {
  if (path === "./index.ts") continue;
  for (const value of Object.values(mod)) {
    const film = value as BossIntroFilm;
    if (!film || typeof film !== "object" || !Array.isArray(film.shots) || !film.bossId) continue;
    if (bossIntros[film.bossId])
      throw Error(`Boss intro for ${film.bossId} is defined twice (${path})`);
    bossIntros[film.bossId] = film;
  }
}

/** A boss's accent when it has no authored intro, by its effect theme. */
const THEME_ACCENT: Record<string, string> = {
  contract: "#d9a24a",
  foundry: "#ff8a3a",
  guard: "#7fc7c0",
};

export function introFor(def: EnemyDef): BossIntroFilm {
  return bossIntros[def.id] ?? genericIntro(def);
}

/**
 * The placeholder entrance: the board dims around the boss, one low hero shot
 * with the title card, and back. About three seconds, the boss's combat clips
 * rather than authored poses, and no background but the pact's sigil. It
 * exists so a boss without its own intro still arrives as an event.
 */
export function genericIntro(def: EnemyDef): BossIntroFilm {
  const accent = THEME_ACCENT[def.presentation?.theme ?? ""] ?? "#d9a24a";
  const bars = 0.11;
  return {
    id: `generic-intro:${def.id}`,
    bossId: def.id,
    accent,
    shots: [
      {
        id: "dim",
        kind: "call",
        purpose: "The chamber goes quiet around the thing waiting in it.",
        space: "battlefield",
        ms: 520,
        fastMs: 300,
        background: "battlefield",
        lighting: { tint: ["#07060a", 0], letterbox: 0 },
        toLighting: { tint: ["#07060a", 0.6], letterbox: bars },
        vfx: [{ kind: "call-aura", at: 0.1, until: 1, anchor: "targets", color: accent }],
        sound: [{ at: 0, sfx: "boss-groan" }],
        duck: [{ at: 0, level: 0.25, ms: 2600 }],
      },
      {
        id: "reveal",
        kind: "low-angle",
        purpose: "The boss, from below, named.",
        space: "cinematic",
        ms: 1600,
        fastMs: 1000,
        transition: { kind: "flash", ms: 70 },
        camera: {
          from: { x: 860, y: 560, zoom: 1.35, rotate: 2 },
          to: { x: 860, y: 520, zoom: 1.55, rotate: 0 },
          ease: "out",
        },
        background: "pact-sigil",
        lighting: { exposure: 0.35, back: [accent, 0.5], rim: [accent, 0.9, -1], vignette: 0.65, letterbox: bars },
        toLighting: { exposure: 0.55, back: [accent, 0.6], rim: [accent, 1, -1], vignette: 0.55, letterbox: bars },
        actors: [
          { role: "target", at: [1060, 880], size: 260, face: -1, clip: "signature", clipAt: 0.3, look: "rim", rim: accent },
        ],
        vfx: [{ kind: "motes", at: 0, until: 1, x: 1000, y: 600, scale: 2, color: accent, layer: "front" }],
        shake: [{ at: 0.32, amount: 0.016 }],
        sound: [{ at: 0.3, sfx: "boss-stamp" }],
        text: [{ kind: "title", at: 0.28, until: 1, text: "", x: 0.06, y: 0.62 }],
        markers: [{ at: 0.3, label: "title" }],
      },
      {
        id: "return",
        kind: "return",
        purpose: "Back to the chamber, with the fight about to begin.",
        space: "battlefield",
        ms: 520,
        fastMs: 360,
        transition: { kind: "flash", ms: 80 },
        background: "battlefield",
        lighting: { tint: ["#07060a", 0.4], letterbox: bars },
        toLighting: { tint: ["#07060a", 0], letterbox: 0 },
        sound: [{ at: 0.05, sfx: "ult-tail" }],
      },
    ],
  };
}

/**
 * The reduced-motion entrance for any boss: one still card and the board. No
 * camera move, no flash, no shake — but still the boss, still its name and
 * epithet, still clearly not an ordinary fight.
 */
export function reducedIntro(def: EnemyDef): BossIntroFilm {
  const film = introFor(def);
  const accent = film.accent;
  const still = { exposure: 0.5, back: [accent, 0.35] as [string, number], vignette: 0.45, letterbox: 0.11 };
  return {
    id: `reduced-intro:${def.id}`,
    bossId: def.id,
    accent,
    line: film.line,
    shots: [
      {
        id: "portrait",
        kind: "low-angle",
        purpose: "Who waits in the chamber, and what it is called.",
        space: "cinematic",
        ms: 1800,
        fastMs: 1300,
        camera: { from: { x: 800, y: 540, zoom: 1.45 } },
        background: "pact-sigil",
        lighting: still,
        actors: [{ role: "target", at: [800, 860], size: 260, face: -1, look: "rim", rim: accent }],
        text: [{ kind: "title", at: 0, until: 1, text: "", x: 0.5, y: 0.78 }],
      },
      {
        id: "return",
        kind: "return",
        purpose: "The chamber, and the fight.",
        space: "battlefield",
        ms: 400,
        fastMs: 300,
        background: "battlefield",
        lighting: { tint: ["#07060a", 0.3], letterbox: 0.11 },
      },
    ],
  };
}
