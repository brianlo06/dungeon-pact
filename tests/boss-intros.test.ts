/**
 * Boss intros: the entrance each boss makes as a fight opens. They are films
 * in the Ultimate format with a boss's cast, so they are held to the same
 * content rules as Ultimates where those apply — everything they name exists,
 * every shot has a purpose, the reduced-motion cut does not move — and to an
 * intro's own: every boss has one, it credits no caster and reveals nothing,
 * it shows the boss's title card, and it stays short enough to see again.
 */
import { describe, expect, it } from "vitest";
import { enemies } from "../src/content/enemies";
import {
  bossIntros,
  genericIntro,
  introFor,
  reducedIntro,
  type BossIntroFilm,
} from "../src/content/boss-intros";
import { layout } from "../src/client/cinematic/timeline";
import { RENDERERS as VFX, FOLDER_BACKGROUNDS } from "../src/client/cinematic/registry";
import { rigFor, GENERIC } from "../src/client/battle/rigs";
import { ULTIMATE_SFX, SFX_NAMES } from "../src/client/audio/engine";
import { FOLDER_VOICES } from "../src/client/audio/ultimate-voices";

const SOUNDS = new Set<string>([...ULTIMATE_SFX, ...SFX_NAMES, ...Object.keys(FOLDER_VOICES)]);
const BACKGROUNDS = new Set([
  "battlefield",
  "void",
  "lantern-vault",
  "breach-forge",
  "pact-sigil",
  "storm-ledger",
  ...Object.keys(FOLDER_BACKGROUNDS),
]);
const bosses = enemies.filter((d) => d.boss);
const all: BossIntroFilm[] = [
  ...Object.values(bossIntros),
  ...bosses.map(genericIntro),
  ...bosses.map(reducedIntro),
];

describe("boss intros", () => {
  it("gives every boss an intro, authored or generic", () => {
    expect(bosses.length).toBeGreaterThanOrEqual(6);
    for (const b of bosses) {
      const film = introFor(b);
      expect(film.bossId).toBe(b.id);
      expect(film.shots.length, b.id).toBeGreaterThan(1);
    }
    for (const id of Object.keys(bossIntros))
      expect(bosses.map((b) => b.id), `intro for ${id}`).toContain(id);
  });

  it("has an authored intro for every boss in the game, so none falls back to the generic one", () => {
    expect(Object.keys(bossIntros).sort()).toEqual(bosses.map((b) => b.id).sort());
  });

  it("stays short enough to see again: authored intros 3–6 seconds, FAST well under", () => {
    for (const film of Object.values(bossIntros)) {
      const full = layout(film, "full", "boss").duration;
      const fast = layout(film, "fast", "boss").duration;
      expect(full, film.id).toBeGreaterThanOrEqual(3000);
      expect(full, film.id).toBeLessThanOrEqual(6000);
      expect(fast, film.id).toBeLessThan(full * 0.75);
    }
    for (const b of bosses) {
      expect(layout(genericIntro(b), "full", "boss").duration).toBeLessThanOrEqual(4000);
      expect(layout(reducedIntro(b), "full", "boss").duration).toBeLessThanOrEqual(3000);
    }
  });

  it("names only effects, backgrounds and sounds that exist, and says what every shot is for", () => {
    for (const c of all)
      for (const shot of c.shots) {
        expect(BACKGROUNDS.has(shot.background), `${c.id}/${shot.id}`).toBe(true);
        for (const v of shot.vfx ?? []) expect(VFX[v.kind], `${c.id}/${shot.id} ${v.kind}`).toBeDefined();
        for (const s of shot.sound ?? []) expect(SOUNDS.has(s.sfx), `${c.id}/${shot.id} ${s.sfx}`).toBe(true);
        expect(shot.purpose.length, `${c.id}/${shot.id} purpose`).toBeGreaterThan(8);
      }
  });

  it("casts no caster, reveals nothing, and shows the boss's title card", () => {
    for (const c of all) {
      for (const shot of c.shots) {
        for (const a of shot.actors ?? []) expect(a.role, `${c.id}/${shot.id}`).not.toBe("caster");
        expect(shot.reveal ?? [], `${c.id}/${shot.id}`).toEqual([]);
      }
      expect(
        c.shots.some((s) => (s.text ?? []).some((t) => t.kind === "title")),
        `${c.id} title card`,
      ).toBe(true);
    }
  });

  it("asks each boss only for poses its rig has", () => {
    for (const c of all) {
      const boss = enemies.find((d) => d.id === c.bossId)!;
      const rig = rigFor(boss.presentation!.spriteSet);
      for (const shot of c.shots)
        for (const a of shot.actors ?? [])
          if ((a.role === "target" || a.role === "targets") && a.clip)
            expect(
              rig[a.clip as keyof typeof rig] ?? GENERIC[a.clip as keyof typeof GENERIC],
              `${c.id}/${shot.id} ${a.clip}`,
            ).toBeDefined();
    }
  });

  it("uses no flashes, shakes, stops or camera moves in the reduced-motion cut", () => {
    for (const b of bosses) {
      const c = reducedIntro(b);
      for (const shot of c.shots) {
        expect(shot.screen ?? [], c.id).toEqual([]);
        expect(shot.shake ?? [], c.id).toEqual([]);
        expect(shot.stop ?? [], c.id).toEqual([]);
        expect(shot.camera?.to, c.id).toBeUndefined();
        expect(shot.transition?.kind === "flash", c.id).toBe(false);
      }
    }
  });

  it("dips the music under the entrance and gives it back", () => {
    for (const c of Object.values(bossIntros)) {
      const ducks = c.shots.flatMap((s) => s.duck ?? []);
      expect(ducks.length, c.id).toBeGreaterThan(0);
    }
  });
});
