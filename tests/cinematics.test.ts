import { describe, expect, it } from "vitest";
import { addPlayer, createRun, reduce } from "../src/engine/game";
import { enterCombat } from "../src/engine/combat";
import { ULTIMATE_MAX, ultimates, ultimateFor } from "../src/content/ultimates";
import {
  cinematicFor,
  cinematics,
  genericCinematic,
  reducedCinematic,
} from "../src/content/cinematics";
import {
  cameraAt,
  framingFor,
  instantsBetween,
  layout,
  shotAt,
} from "../src/client/cinematic/timeline";
import { revealed, splitUltimates } from "../src/client/cinematic/segments";
import { VFX } from "../src/client/cinematic/vfx";
import { rigFor, GENERIC } from "../src/client/battle/rigs";
import { contactTimes } from "../src/client/battle/animation";
import { ULTIMATE_SFX, SFX_NAMES } from "../src/client/audio/engine";
import { heroes } from "../src/content/heroes";
import type { Cinematic } from "../src/shared/cinematic";
import type { RunState } from "../src/shared/model";

const SOUNDS = new Set<string>([...ULTIMATE_SFX, ...SFX_NAMES]);
const BACKGROUNDS = new Set(["battlefield", "void", "lantern-vault", "breach-forge", "pact-sigil"]);

/** Every cinematic the game can play: authored, generic and reduced. */
const all: Cinematic[] = [
  ...Object.values(cinematics),
  ...ultimates.map(genericCinematic),
  ...ultimates.map(reducedCinematic),
];

describe("cinematic content", () => {
  it("gives every Ultimate a cinematic, authored or generic", () => {
    for (const u of ultimates) expect(cinematicFor(u).shots.length).toBeGreaterThan(1);
    expect(cinematicFor(ultimateFor({ heroId: "vanguard" })!).id).toBe("lantern-wall");
    expect(
      cinematicFor(ultimateFor({ heroId: "vanguard", evolution: "van-breaker" })!).id,
    ).toBe("gatebreaker");
  });

  it("keeps the authored films inside the 3–5 second brief, and FAST well under", () => {
    for (const c of Object.values(cinematics)) {
      const full = layout(c, "full", "normal").duration;
      const fast = layout(c, "fast", "normal").duration;
      expect(full, c.id).toBeGreaterThanOrEqual(3000);
      expect(full, c.id).toBeLessThanOrEqual(5000);
      expect(fast, c.id).toBeLessThan(full * 0.72);
      expect(fast, c.id).toBeGreaterThan(1500);
    }
  });

  it("names only effects, backgrounds and sounds that exist", () => {
    for (const c of all)
      for (const shot of c.shots) {
        expect(BACKGROUNDS.has(shot.background), `${c.id}/${shot.id}`).toBe(true);
        for (const v of shot.vfx ?? []) expect(VFX[v.kind], `${c.id}/${shot.id} ${v.kind}`).toBeDefined();
        for (const s of shot.sound ?? []) expect(SOUNDS.has(s.sfx), `${c.id}/${shot.id} ${s.sfx}`).toBe(true);
        expect(shot.purpose.length, `${c.id}/${shot.id} purpose`).toBeGreaterThan(8);
      }
  });

  it("asks the caster only for poses its rig has", () => {
    for (const c of Object.values(cinematics)) {
      const rig = rigFor(heroes.find((h) => h.id === c.heroId)!.presentation!.spriteSet);
      for (const shot of c.shots)
        for (const a of shot.actors ?? [])
          if (a.role === "caster" && a.clip)
            expect(rig[a.clip as keyof typeof rig] ?? GENERIC[a.clip as keyof typeof GENERIC], `${c.id}/${shot.id} ${a.clip}`).toBeDefined();
    }
  });

  it("shows the result of every Ultimate before its film ends", () => {
    for (const c of all) {
      const reveals = c.shots.flatMap((s) => s.reveal ?? []);
      expect(reveals.length, c.id).toBeGreaterThan(0);
    }
    // The authored films show the blow at the blow, and the wards after it.
    for (const c of Object.values(cinematics)) {
      const tl = layout(c, "full", "normal");
      const impact = tl.instants.find((x) => x.kind === "reveal" && x.reveal === "impact");
      expect(impact, c.id).toBeDefined();
      expect(impact!.t).toBeLessThan(tl.duration * 0.9);
    }
  });

  it("uses no flashes, shakes or stops in the reduced-motion cut", () => {
    for (const u of ultimates) {
      const c = reducedCinematic(u);
      for (const shot of c.shots) {
        expect(shot.screen ?? [], c.id).toEqual([]);
        expect(shot.shake ?? [], c.id).toEqual([]);
        expect(shot.stop ?? [], c.id).toEqual([]);
        expect(shot.camera?.to, c.id).toBeUndefined();
        expect(shot.transition?.kind === "flash", c.id).toBe(false);
      }
    }
  });
});

describe("cinematic timeline", () => {
  const lw = cinematics["lantern-wall"];

  it("lays out shots end to end and drops FAST-less shots from FAST", () => {
    const full = layout(lw, "full", "normal");
    const fast = layout(lw, "fast", "normal");
    expect(full.shots.map((s) => s.id)).toContain("wall");
    expect(fast.shots.map((s) => s.id)).not.toContain("wall");
    full.shots.reduce((t, s) => {
      expect(s.start).toBe(t);
      return t + s.length;
    }, 0);
    const { shot, u } = shotAt(full, full.shots[2].start + full.shots[2].length / 2);
    expect(shot.id).toBe("wall");
    expect(u).toBeCloseTo(0.5, 5);
  });

  it("fires every instant exactly once however the frames fall", () => {
    const tl = layout(lw, "full", "normal");
    const seen: string[] = [];
    let last = -1;
    // Irregular frames, including a long stall.
    for (const step of [16, 16, 250, 3, 40, 16, 700, 16, 16, 900, 5000]) {
      const next = Math.min(tl.duration, last + step);
      for (const x of instantsBetween(tl, last, next)) seen.push(`${x.kind}@${x.t}`);
      last = next;
    }
    expect(seen.length).toBe(tl.instants.length);
  });

  it("re-frames for a boss, and keeps a normal target's framing otherwise", () => {
    expect(framingFor("boss-large")).toBe("boss");
    expect(framingFor("heavy")).toBe("large");
    expect(framingFor("small")).toBe("normal");
    const normal = layout(lw, "full", "normal");
    const boss = layout(lw, "full", "boss");
    const at = normal.shots.find((s) => s.id === "impact")!;
    expect(cameraAt(boss, at.start + 10).zoom).toBeLessThan(cameraAt(normal, at.start + 10).zoom);
  });

  it("lands the blow on the pose: the reveal falls on the strike's contact, in FULL and FAST", () => {
    const rig = rigFor("vanguard");
    for (const mode of ["full", "fast"] as const)
      for (const c of Object.values(cinematics)) {
        const tl = layout(c, mode, "normal");
        const reveal = tl.instants.find((x) => x.kind === "reveal" && x.reveal === "impact")!;
        const shot = tl.shots[reveal.shot];
        const strike = (shot.actors ?? []).find((a) => a.role === "caster" && a.clip);
        const clip = rig[strike!.clip as keyof typeof rig]!;
        const start = shot.start + (strike!.clipAt ?? 0) * shot.length;
        const contact = start + contactTimes(clip)[0] * clip.duration;
        // One clock drives both, so this holds at 0.5×, 1× and 2× alike.
        expect(Math.abs(contact - reveal.t), `${c.id} ${mode}`).toBeLessThan(40);
      }
  });
});

describe("Ultimate segments", () => {
  function resolved(): RunState {
    let s = createRun("SEG", "segments");
    addPlayer(s, "p0", "Tank");
    addPlayer(s, "p1", "Mage");
    addPlayer(s, "p2", "Scout");
    s = reduce(s, "p1", { type: "hero", hero: "arcanist" }, 0);
    s = reduce(s, "p2", { type: "hero", hero: "ranger" }, 0);
    s.map = [{ id: "r", depth: 1, lane: 0, type: "combat", name: "T", next: [], visited: true }];
    s.currentNode = "r";
    enterCombat(s);
    s.players[0].ultimateCharge = ULTIMATE_MAX;
    s.players[1].ultimateCharge = ULTIMATE_MAX;
    for (const e of s.enemies) {
      e.hp = 500;
      e.maxHp = 500;
    }
    s = reduce(s, "p0", { type: "ultimate", target: s.enemies[0].id }, 0);
    s = reduce(s, "p1", { type: "ultimate", target: s.enemies[0].id }, 0);
    return s;
  }

  it("cuts each Ultimate out of the round, in the order they resolved", () => {
    let s = resolved();
    const seen = s.eventSeq;
    for (const p of s.players) s = reduce(s, p.id, { type: "plan", ability: "brace", target: p.id }, 0);
    const beats = s.logs.filter((l) => l.seq > seen && l.beat).map((l) => l.beat!);
    const { segments, rest } = splitUltimates(beats);
    expect(segments.map((x) => x.def.id)).toEqual(["lantern-wall", "debt-of-thunder"]);
    expect(segments[0].targets[0]).toBe("enemy-0");
    // Nothing from an Ultimate leaks into the round, and the round is whole.
    expect(rest.some((b) => b.ultimate)).toBe(false);
    expect(rest.filter((b) => b.kind === "cast").length).toBeGreaterThanOrEqual(3);
    expect(segments[0].beats.some((b) => b.kind === "ward")).toBe(true);
    const impact = revealed(segments[0].beats, "impact");
    const ward = revealed(segments[0].beats, "ward");
    expect(impact.length + ward.length).toBe(segments[0].beats.length);
    expect(ward.every((b) => b.kind === "ward" || b.kind === "heal")).toBe(true);
  });

  it("leaves a round with no Ultimate untouched", () => {
    let s = resolved();
    s.ultimates = {};
    const seen = s.eventSeq;
    for (const p of s.players) s = reduce(s, p.id, { type: "plan", ability: "brace", target: p.id }, 0);
    const beats = s.logs.filter((l) => l.seq > seen && l.beat).map((l) => l.beat!);
    const { segments, rest } = splitUltimates(beats);
    expect(segments).toEqual([]);
    expect(rest).toEqual(beats);
  });
});
