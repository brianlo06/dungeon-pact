import { describe, it, expect } from "vitest";
import { items } from "../src/content/items";
import { EQUIPMENT_ASSETS } from "../src/client/equipment/assets";
import { validateEquipmentVisuals } from "../src/content/equipment-validation";
import {
  equipmentBefore,
  equipmentStep,
  equipmentBoard,
} from "../src/client/equipment/replay";
import { bossFixture } from "../src/dev/boss-fixture";
import { snapshot } from "../src/engine/game";
import { effects, release, trigger } from "../src/engine/effects";
const fixture = () =>
  bossFixture({
    boss: "collector",
    size: 2,
    stage: "opening",
    gold: 700,
    legacy: false,
  });
describe("equipment presentation contract", () => {
  it("all twelve equipped items have valid registered assets", () => {
    expect(items.filter((i) => i.slot !== "supply")).toHaveLength(12);
    expect(
      validateEquipmentVisuals(items, new Set(Object.keys(EQUIPMENT_ASSETS))),
    ).toEqual([]);
  });
  it("optional bad artwork is diagnostic, with missing asset and invalid anchors reported", () => {
    const item = structuredClone(items[0]);
    item.visual!.attachments[0].asset = "absent";
    expect(validateEquipmentVisuals([item], new Set())).toContain(
      "stormglass: unknown equipment asset absent",
    );
    item.visual!.attachments = [];
    expect(validateEquipmentVisuals([item])).toHaveLength(1);
    delete item.visual;
    expect(validateEquipmentVisuals([item])).toHaveLength(1);
  });
  it("real seizure and release carry owner/item/container identities and replay reversibly", () => {
    const s = fixture();
    const p = s.players[0];
    p.items = ["blood-price", "bastion", "bounty"];
    const before = [...p.items];
    const seq = s.eventSeq;
    effects(s, s.enemies[0], p, [{ kind: "seize", count: 1 }]);
    const box = s.enemies.find((e) => e.definition === "strongbox")!;
    expect(p.items).toEqual(["bastion", "bounty"]);
    const beats = s.logs
      .filter((l) => l.seq > seq && l.beat)
      .map((l) => l.beat!);
    expect(beats[0].equipment).toEqual([
      {
        action: "seize",
        ownerId: p.id,
        itemId: "blood-price",
        containerId: box.id,
      },
    ]);
    const snap = snapshot(s, p.id, []);
    const initial = equipmentBefore(snap, beats);
    expect(new Set(initial.worn[p.id])).toEqual(new Set(before));
    expect(equipmentStep(initial, beats[0].equipment!)).toEqual(
      equipmentBoard(snap),
    );
    release(s, box);
    expect(p.items).toContain("blood-price");
    expect(s.logs.at(-1)?.beat?.equipment?.[0].action).toBe("return");
    // A reconnect renders only current ownership, with no stale history replay.
    expect(equipmentBoard(snapshot(s, p.id, [])).worn[p.id]).toContain(
      "blood-price",
    );
  });
  it("engine emits item cues for armor, relic, weapon and curse activation", () => {
    const s = fixture(),
      p = s.players[0];
    p.items = ["blood-price", "bastion", "bounty"];
    trigger(s, p, s.enemies[0], "roundStart");
    trigger(s, p, s.enemies[0], "afterAttack");
    trigger(s, p, s.enemies[0], "onKill");
    const cues = s.logs
      .flatMap((l) => l.beat?.equipment ?? [])
      .filter((c) => c.ownerId === p.id && c.action === "trigger");
    for (const id of p.items)
      expect(cues.some((c) => c.itemId === id)).toBe(true);
  });
  it("presentation metadata cannot change combat results", () => {
    const a = fixture(),
      b = structuredClone(a);
    a.players[0].items = ["blood-price", "bastion", "bounty"];
    b.players[0].items = [...a.players[0].items];
    trigger(a, a.players[0], a.enemies[0], "afterAttack");
    const saved = items.map((i) => i.visual);
    try {
      items.forEach((i) => delete i.visual);
      trigger(b, b.players[0], b.enemies[0], "afterAttack");
    } finally {
      items.forEach((i, n) => (i.visual = saved[n]));
    }
    expect(a).toEqual(b);
  });
});
