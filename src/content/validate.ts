import { encounters } from "./encounters";
import { z } from "zod";
import type { Effect } from "../shared/model";
import { heroes, abilities } from "./heroes";
import { upgrades, lines, upgradeOffer } from "./upgrades";
import { evolutions, mentors, pathFor } from "./evolutions";
import { items } from "./items";
import { enemies, enemyAbilities } from "./enemies";
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
  "weak",
  "empowered",
  "confused",
  "guarded",
  "interrupted",
]);
export const effectSchema: z.ZodType<Effect> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("protect"), barrier: nonnegative }),
    z.object({ kind: z.literal("interrupt") }),
    z.object({ kind: z.literal("removeStatus"), status: statusId }),
    z.object({
      kind: z.literal("damage"),
      amount: nonnegative,
      damageType: z
        .enum(["physical", "fire", "lightning", "arcane"])
        .optional(),
      precision: z.boolean().optional(),
      self: z.boolean().optional(),
      pierce: z.boolean().optional(),
    }),
    z.object({
      kind: z.literal("heal"),
      amount: nonnegative,
      self: z.boolean().optional(),
    }),
    z.object({
      kind: z.literal("status"),
      status: statusId,
      stacks: z.number().int().positive().max(100),
      duration: z.number().int().positive().max(100),
      self: z.boolean().optional(),
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
    z.object({ kind: z.literal("seize"), count: z.number().int().positive() }),
    z.object({
      kind: z.literal("bank"),
      per: z.number().int().positive(),
      free: nonnegative,
    }),
    z.object({
      kind: z.literal("conditional"),
      status: statusId,
      effects: z.array(effectSchema).max(20),
    }),
  ]),
);
const abilitySchema = z.object({
  interruptible: z.boolean().optional(),
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  cost: nonnegative,
  speed: z.number().int(),
  cooldown: nonnegative,
  target: z.enum(["enemy", "ally", "self", "enemyRow", "allyRow"]),
  effects: z.array(effectSchema).min(1).max(20),
});
const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rarity: z.enum(["Common", "Rare", "Epic", "Legendary"]),
  slot: z.enum(["weapon", "armor", "relic", "supply"]),
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
    "use",
  ]),
  effects: z.array(effectSchema),
  use: abilitySchema.optional(),
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
  unique(encounters, "encounter");
  for (const e of encounters) {
    for (const count of [2, 3, 4] as const) {
      const formation = e.formations[count];
      if (
        formation.length !== count ||
        formation.some(
          (id) =>
            !enemies.some(
              (enemy) => enemy.id === id && !enemy.boss && !enemy.object,
            ),
        )
      )
        throw Error(`Invalid encounter ${e.id}`);
    }
  }
  for (const h of heroes) {
    z.object({
      hp: z.number().int().positive(),
      power: nonnegative,
      guard: nonnegative,
      speed: nonnegative,
      maxResource: z.number().int().positive(),
    }).parse(h);
    unique(h.abilities, "ability");
    const tree = upgrades.filter((u) => u.heroId === h.id);
    const upgraded = abilities(
      h.id,
      2,
      tree.map((u) => u.id),
    );
    for (const a of [...h.abilities, ...abilities(h.id, 2), ...upgraded]) {
      abilitySchema.parse(a);
      if (a.cost > h.maxResource) throw Error(`Uncastable ability ${a.id}`);
    }
    // Every pick must present a real choice, and every branch must patch a
    // tactical ability the hero actually owns.
    for (let line = 0; line < lines(h.id); line++) {
      const branches = upgradeOffer({
        heroId: h.id,
        upgrades: Array.from({ length: line }, (_, i) => `line-${i}`),
      });
      if (branches.length < 2) throw Error(`Upgrade line ${line} of ${h.id}`);
      if (!branches.some((u) => u.kind === "guard"))
        throw Error(
          `Upgrade line ${line} of ${h.id} offers no defensive branch`,
        );
      for (const u of branches)
        if (!abilities(h.id, 2).some((a) => a.id === u.ability))
          throw Error(`Upgrade ${u.id} patches an unknown ability`);
    }
  }
  unique(upgrades, "upgrade");
  unique(evolutions, "evolution");
  unique(mentors, "mentor");
  for (const e of evolutions) {
    abilitySchema.parse(e.ability);
    const base = heroes.find((h) => h.id === e.heroId);
    if (!base) throw Error(`Evolution ${e.id} has no hero`);
    // A path swaps an ability the hero owns, keeping its id so branches,
    // cooldowns and locked plans still resolve.
    if (!abilities(e.heroId, 2).some((a) => a.id === e.replaces))
      throw Error(`Evolution ${e.id} replaces an unknown ability`);
    if (e.ability.id !== e.replaces)
      throw Error(`Evolution ${e.id} must keep the replaced ability's id`);
    if (!mentors.some((m) => m.id === e.mentor))
      throw Error(`Evolution ${e.id} has no mentor`);
    if (e.ability.cost > base.maxResource + (e.stats.resource ?? 0))
      throw Error(`Evolution ${e.id} is uncastable`);
  }
  // Every mentor must have something for every class, or reaching one is a
  // dead node for part of the party.
  for (const m of mentors)
    for (const h of heroes)
      if (!pathFor(m.id, h.id))
        throw Error(`Mentor ${m.id} teaches ${h.id} nothing`);
  for (const i of items) {
    itemSchema.parse(i);
    // A supply is nothing but its action; worn equipment is nothing but its
    // passive. Getting this backwards produces an item that silently does
    // nothing at all, which no other check would catch.
    if (i.slot === "supply") {
      if (!i.use || i.trigger !== "use" || i.effects.length)
        throw Error(`Supply ${i.id} must carry a use and no passive`);
      if (i.use.cost) throw Error(`Supply ${i.id} may not cost resource`);
    } else if (!i.effects.length || i.use)
      throw Error(`Item ${i.id} must carry a passive and no use`);
  }
  // A seizure names its container in engine code, so the container has to be
  // in the catalog and has to be an object, or breaking it would end a chamber.
  const box = enemies.find((e) => e.id === "strongbox");
  if (!box?.object) throw Error("Missing strongbox container");
  for (const e of enemies) {
    z.object({
      hp: z.number().int().positive(),
      power: nonnegative,
      guard: nonnegative,
      speed: nonnegative,
    }).parse(e);
    for (const a of [...e.abilities, ...enemyAbilities(e, 2)])
      abilitySchema.parse(a);
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
    upgrades: upgrades.length,
    evolutions: evolutions.length,
    mentors: mentors.length,
  };
}
