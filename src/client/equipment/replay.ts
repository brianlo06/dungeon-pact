import type { Snapshot, Beat } from "../../shared/model";
import type { EquipmentCue } from "../../shared/equipment";
export interface EquipmentBoard {
  worn: Record<string, string[]>;
  held: Record<string, { playerId: string; itemId: string }[]>;
}
export function equipmentBoard(s: Snapshot): EquipmentBoard {
  return {
    worn: Object.fromEntries(s.players.map((p) => [p.id, [...p.items]])),
    held: Object.fromEntries(
      s.enemies.map((e) => [e.id, [...(e.holding ?? [])]]),
    ),
  };
}
/** Only authoritative ownership deltas are replayed; no effect predicates. */
export function equipmentStep(
  board: EquipmentBoard,
  cues: EquipmentCue[],
  reverse = false,
): EquipmentBoard {
  const next = structuredClone(board);
  for (const c of reverse ? [...cues].reverse() : cues) {
    if (c.action === "trigger") continue;
    const take = (c.action === "seize") !== reverse;
    const worn = next.worn[c.ownerId] ?? [];
    next.worn[c.ownerId] = take
      ? worn.filter((id) => id !== c.itemId)
      : [...new Set([...worn, c.itemId])];
    if (c.containerId) {
      const held = next.held[c.containerId] ?? [];
      next.held[c.containerId] = take
        ? [...held, { playerId: c.ownerId, itemId: c.itemId }]
        : held.filter((h) => h.itemId !== c.itemId || h.playerId !== c.ownerId);
    }
  }
  return next;
}
export function equipmentBefore(s: Snapshot, beats: Beat[]) {
  return [...beats]
    .reverse()
    .reduce(
      (board, b) => equipmentStep(board, b.equipment ?? [], true),
      equipmentBoard(s),
    );
}
