# Content system

Updated 2026-09-10 · contentVersion 1

## Authoring contract

`src/shared/model.ts` defines HeroDef, Ability, ItemDef, EnemyDef, Effect and Status; `src/content/events.ts` defines EventDef. Every definition needs a stable unique ID. Never change an ID to edit a display name. Content is TypeScript data checked at build time. `src/content/validate.ts` validates shipped catalogs at server boot using Zod effect/ability/item schemas plus reference/uniqueness checks. External JSON authoring is a later step; do not load unvalidated user content.

Effect is a discriminated union: damage (type and optional precision), heal, status (stacks/duration), resource, move (row), gold, conditional (status present → nested effects). The interpreter is `src/engine/effects.ts`. Core damage includes actor power, target guard, vulnerability, barrier and reaction resolution. Status definitions supply stack cap, tooltip and icon. Durations decrease at round end. Nested effects have a depth ceiling of six; item-trigger chains stop after depth four. Triggered damage does not generate another afterAttack. These guards prevent reflection loops.

Ability specifies target policy, class-resource cost, relative initiative, cooldown and effect list. Self/resource effects operate on actor; target effects operate on selected unit(s). Row abilities currently apply the effect list once per target; avoid putting actor resource/gold bonuses in row definitions unless per-target behavior is intended. Cooldown one blocks use on the following round; brace is always free.

Item specifies rarity, slot, tags, clue, curse flag, reference price, trigger, target and effects. Current hooks: roundStart, afterAttack, afterHeal, onHurt, onKill. Cursed items currently share a fixed six-HP round-start tax; generalized curse costs are pending. Only one item per implemented slot. Team relics, conditional item counters, onAllyAction, equipment trading and ability mutation require new engine primitives and tests before authoring content that promises them.

## Adding an item

1. Add a unique ItemDef to `src/content/items.ts` using existing effects.
2. Write description matching exact trigger/target behavior; include visible curse cost.
3. Choose tags for future synergy and a cryptic clue for mystery auctions.
4. Set price as a reference value, not the settled auction price.
5. Add a regression when introducing a new interaction, especially recursive damage or economy triggers.
6. Run build, tests and simulation; inspect equipment replacement in the auction view.

Example: a weapon with `trigger: 'afterAttack'`, `target: 'target'`, and a Wet status effect makes a basic attack prime Lightning. No component or combat-ID branch is required.

## Adding enemies / heroes / events

Enemies use Ability definitions and server-controlled intent selection. Add glyph, stats, row, ability rotation and boss flag. Current special boss target/scaling rules are explicit engine branches; a phase/intent policy DSL is needed before expanding to 15 bosses. Do not pretend those rules are fully data-driven yet.

Heroes define base attributes, resource name/cap and abilities. Add only effects the interpreter supports; no hard-coded hero checks in presentation. Intrinsic passive hooks and branching upgrades remain Phase 2.

Events currently support deterministic party gold/HP choices with explicit costs. Add EventDef and choices, then test affordability. Delayed consequences, class-specific choices, sacrifice choices and weighted outcomes require schema expansion. Map types are a closed union; new types need an entry handler and a functional view before appearing in generation.

## Hidden information

Server keeps the selected lot ID; `snapshot()` emits only rarity, slot, non-curse tags and clue until reveal. Do not spread authoritative state into a response. Catalog knowledge may let returning players recognize a clue; the selected lot and curse must still never be sent accidentally. If rolled affixes/variable curses are added, their generation must be server-only.

## Inventory at this revision

4 heroes; 15 class abilities plus 4 common actions; 12 items; 8 normal enemies and 2 bosses; 2 elite traits; 7 statuses; 2 reactions; 3 events; standard and mystery versions of one ascending auction rule. Content targets in the master brief are roadmap targets, not present inventory.
