import type { ItemDef } from "../shared/model";
import { z } from "zod";
const attachment = z.object({
  anchor: z.enum([
    "mainHand",
    "torso",
    "shoulderBack",
    "waist",
    "root",
    "head",
    "back",
  ]),
  layer: z.enum(["back", "body", "weapon", "front"]),
  asset: z.string().min(1),
  x: z.number().finite().optional(),
  y: z.number().finite().optional(),
  rotation: z.number().finite().optional(),
  scale: z.number().positive().max(4).optional(),
});
const schema = z.object({
  slot: z.enum(["weapon", "armor", "relic"]),
  attachments: z.array(attachment).min(1),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  rigOverrides: z.record(z.string(), z.array(attachment).min(1)).optional(),
});
/** Presentation problems are diagnostics, never grounds for rejecting a room. */
export function validateEquipmentVisuals(
  catalog: ItemDef[],
  assets?: ReadonlySet<string>,
): string[] {
  const warnings: string[] = [];
  for (const item of catalog) {
    if (item.slot === "supply") continue;
    if (!item.visual) {
      warnings.push(
        `${item.id}: missing optional visual; generic slot fallback`,
      );
      continue;
    }
    const parsed = schema.safeParse(item.visual);
    if (!parsed.success) {
      warnings.push(`${item.id}: invalid visual attachment metadata`);
      continue;
    }
    const v = parsed.data;
    if (v.slot !== item.slot)
      warnings.push(`${item.id}: visual slot does not match equipment slot`);
    for (const mounts of [
      v.attachments,
      ...Object.values(v.rigOverrides ?? {}),
    ]) {
      if (
        v.slot === "weapon" &&
        !mounts.some((a) => a.anchor === "mainHand" && a.layer === "weapon")
      )
        warnings.push(
          `${item.id}: weapon requires mainHand / weapon attachment`,
        );
      for (const a of mounts)
        if (assets && !assets.has(a.asset))
          warnings.push(`${item.id}: unknown equipment asset ${a.asset}`);
    }
  }
  return warnings;
}
