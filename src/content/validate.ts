import { z } from "zod";
import type { Effect } from "../shared/model";
import { heroes } from "./heroes";
import { items } from "./items";
import { enemies } from "./enemies";
import { events } from "./events";
import { statuses } from "./statuses";
const nonnegative = z.number().int().min(0).max(10000);
const statusId = z.enum([
  "burn",
  "wet",
  "marked",
  "barrier",
  "regen",
  "vulnerable",
  "poison",
]);
export const effectSchema: z.ZodType<Effect> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("damage"),
      amount: nonnegative,
      damageType: z
        .enum(["physical", "fire", "lightning", "arcane"])
        .optional(),
      precision: z.boolean().optional(),
    }),
    z.object({ kind: z.literal("heal"), amount: nonnegative }),
    z.object({
      kind: z.literal("status"),
      status: statusId,
      stacks: z.number().int().positive().max(100),
      duration: z.number().int().positive().max(100),
    }),
    z.object({
      kind: z.literal("resource"),
      amount: z.number().int().min(-100).max(100),
    }),
    z.object({ kind: z.literal("move"), row: z.enum(["front", "back"]) }),
    z.object({
      kind: z.literal("gold"),
      amount: z.number().int().min(-10000).max(10000),
    }),
    z.object({
      kind: z.literal("conditional"),
      status: statusId,
      effects: z.array(effectSchema).max(20),
    }),
  ]),
);
const abilitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  cost: nonnegative,
  speed: z.number().int(),
  cooldown: nonnegative,
  target: z.enum(["enemy", "ally", "self", "enemyRow"]),
  effects: z.array(effectSchema).min(1).max(20),
});
const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rarity: z.enum(["Common", "Rare", "Epic", "Legendary"]),
  slot: z.enum(["weapon", "armor", "relic"]),
  tags: z.array(z.string()).min(1),
  description: z.string().min(1),
  clue: z.string().min(1),
  cursed: z.boolean(),
  trigger: z.enum([
    "roundStart",
    "afterAttack",
    "afterHeal",
    "onHurt",
    "onKill",
  ]),
  effects: z.array(effectSchema).min(1),
  target: z.enum(["self", "target"]),
  price: z.number().int().positive(),
});
function unique(entries: { id: string }[], label: string) {
  if (new Set(entries.map((e) => e.id)).size !== entries.length)
    throw Error(`Duplicate ${label} ID`);
}
/** Validate trusted shipped catalogs at room boot; reject unsupported content before play. */
export function validateContent() {
  unique(heroes, "hero");
  unique(items, "item");
  unique(enemies, "enemy");
  unique(events, "event");
  for (const h of heroes) {
    z.object({
      hp: z.number().int().positive(),
      power: nonnegative,
      guard: nonnegative,
      speed: nonnegative,
      maxResource: z.number().int().positive(),
    }).parse(h);
    unique(h.abilities, "ability");
    for (const a of h.abilities) {
      abilitySchema.parse(a);
      if (a.cost > h.maxResource) throw Error(`Uncastable ability ${a.id}`);
    }
  }
  for (const i of items) itemSchema.parse(i);
  for (const e of enemies) {
    z.object({
      hp: z.number().int().positive(),
      power: nonnegative,
      guard: nonnegative,
      speed: nonnegative,
    }).parse(e);
    for (const a of e.abilities) abilitySchema.parse(a);
  }
  for (const event of events) {
    unique(event.choices, "event choice");
    for (const c of event.choices)
      z.object({
        cost: nonnegative,
        heal: z.number().int(),
        gold: nonnegative,
      }).parse(c);
  }
  for (const id of statusId.options)
    if (!statuses[id]?.description) throw Error(`Missing status ${id}`);
  return {
    heroes: heroes.length,
    items: items.length,
    enemies: enemies.length,
    events: events.length,
    statuses: statusId.options.length,
  };
}
