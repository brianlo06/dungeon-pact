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

Heroes define base attributes, resource name/cap and abilities. Add only effects the interpreter supports; no hard-coded hero checks in presentation. Intrinsic passive hooks remain Phase 2; branching upgrades are implemented.

Events currently support deterministic party gold/HP choices with explicit costs. Add EventDef and choices, then test affordability. Delayed consequences, class-specific choices, sacrifice choices and weighted outcomes require schema expansion. Map types are a closed union; new types need an entry handler and a functional view before appearing in generation.

## Hidden information

Server keeps the selected lot ID; `snapshot()` emits only rarity, slot, non-curse tags and clue until reveal. Do not spread authoritative state into a response. Catalog knowledge may let returning players recognize a clue; the selected lot and curse must still never be sent accidentally. If rolled affixes/variable curses are added, their generation must be server-only.

## Inventory at this revision

4 heroes; 17 class abilities in tactical v2 (14 legacy) plus 4 common actions; 24 ability branches; 12 items; 8 normal enemies and 2 bosses; 2 elite traits; 10 statuses; 2 reactions; 3 events; standard and mystery versions of one ascending auction rule. Content targets in the master brief are roadmap targets, not present inventory.

## Tactical content extension

New effect variants: `protect {barrier}` creates a one-hit Guarded source link and frontline barrier; `interrupt` applies Interrupted only to an interruptible enemy intent; `removeStatus {status}` removes all stacks before subsequent effects. Weak multiplies outgoing direct attack power by 0.75 before Guard. Guarded stores an optional sourceId; damage riders follow the intercepted hit. All expire according to centralized status rules.
`encounters.ts` authors explicit formations by party size. `tacticalIntents` supplies versioned enemy rotations; `tacticalSkills` supplies versioned equipped abilities. Ability.interruptible marks an intent's counterplay, not a client permission grant. Server validation still enforces targeting and availability.

## Ability branches

`src/content/upgrades.ts` holds `UpgradeDef`s: a hero, a line index, the ability
id they patch, a `force`/`guard` kind, and an `apply` that returns a new
Ability. Branches are content code, not serialized state — a player stores only
the chosen ids, and `abilities(heroId, combatVersion, chosen)` folds them over
the base list at read time. That keeps saves small and lets a branch be revised
without migrating rooms.

Rules an upgrade must obey, all enforced by `validateContent()` at room boot:

- Never change the ability's `id`. Plans, cooldowns and saved state key off it.
- Never mutate the base ability. The catalog objects are shared; copy them.
- Every line offers exactly two branches, at least one of them `guard`.
- Every branch patches an ability the hero actually owns in tactical v2.
- The patched ability still parses against the ability schema and stays castable
  within the hero's resource cap.

A hero is offered the line matching how many picks they already hold, so adding
a fourth line extends the tree without touching existing runs. `self`-flagged
heal and status effects send the effect to the actor instead of the target,
which is how an offensive ability can sustain or shield its user. Note that such
an ability still targets an enemy — anything reasoning about "healing abilities"
must check the ability's target, not just the presence of a heal effect.
