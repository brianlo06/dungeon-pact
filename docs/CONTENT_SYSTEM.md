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

8 heroes; 33 class abilities in tactical v2 (26 legacy) plus 4 common actions; 48 ability branches; 24 class paths across 3 mentors; 12 items; 8 normal enemies, 2 bosses and 1 container; 2 elite traits; 12 statuses; 2 reactions; 3 events; standard and mystery versions of one ascending auction rule. Content targets in the master brief are roadmap targets, not present inventory.

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

## Primitives added for the second class wave

- `Effect.damage.self` pays a cost in the actor's own HP. It is deliberately
  flat: no power scaling, no Guard, no Vulnerable and no Mark, so a blood price
  reads as a fixed price rather than a stat check.
- `Effect.damage.pierce` ignores Guard entirely, which is how the Reaver's
  Blood price stays worth its cost against armoured targets.
- `Effect.heal.self` and `Effect.status.self` send the effect back to the actor,
  so an offensive ability can also sustain, shield or buff its user. Anything
  reasoning about "healing abilities" must check the ability's target, not just
  the presence of a heal effect — a self-siphoning attack still points at an
  enemy.
- `Ability.target: "allyRow"` resolves against everyone standing in the target's
  row, which gives row position a support meaning as well as a targeting one.
- `empowered` mirrors `weak`: outgoing direct attack power ×1.3 before Guard.
- `confused` makes an enemy's next action strike its own side. The redirect
  lives in the enemy action phase in `combat.ts`, not in a new effect kind, and
  it flips sides for healing intents too — a confounded Kiln Mender repairs the
  wrong thing.

An ability that bills gold now requires the treasury to cover it. Previously a
gold cost silently resolved at a discount when the purse was short, which only
mattered once the Broker made treasury-funded abilities common.

## Primitives added for boss objectives

- `Effect.seize` takes the dearest carried item off the target and banks it in
  the Collector's Strongbox, which is spawned on demand rather than by the
  encounter. The owner loses that item's triggers until the container breaks.
  A chamber holds one Strongbox: once it has been broken open, later seizures
  find nothing to take, so opening it ends the objective instead of restarting
  it.
- `Effect.bank` shields the actor for one Barrier per `per` gold the treasury
  holds above `free`. The allowance is not decoration — without it the effect
  taxes every party for carrying a working balance, and the parties least able
  to burst a shield are the ones a shield hurts most.
- `EnemyDef.object` marks a container: never drawn into an encounter, and never
  counted when deciding whether a chamber has been cleared. Leaving one standing
  has to be a losable choice rather than a chore the party is walked through, and
  a container stops acting the moment the last real enemy falls.
- `EnemyDef.objective` is the sentence a boss states before the first round. A
  boss that only hits harder needs no briefing; one that fights for something
  does. It is logged only in `combatVersion: 2` rooms, where the objective
  actually exists.
- Both objectives ride an attack the boss already had rather than occupying a
  rotation slot of their own. A slot that deals no damage is a free round, and
  measurement showed that softening both bosses even as it added the objective.

Anything reasoning about "the enemies left to beat" must use `combatants()`
from `combat.ts` rather than `s.enemies`, or a standing container will keep a
won fight from ending.

## Class paths

`src/content/evolutions.ts` holds `MentorDef`s and `EvolutionDef`s. A mentor is
an archetype with a tier and a tuition; an evolution is one hero's path through
one mentor, carrying stat deltas and a replacement ability.

Rules enforced by `validateContent()` at room boot:

- Every mentor teaches every class something. A mentor with a gap would be a
  dead node for part of the party.
- A path's replacement ability keeps the id of the ability it replaces, so
  branches, cooldowns and locked plans still resolve across the change.
- The replaced ability must exist in the hero's tactical v2 kit.
- The replacement stays castable within the hero's resource cap, including any
  cap the path itself raises.

Layering is deliberate: `abilities()` applies the path first, then folds chosen
branches over the result. A branch therefore modifies whatever the path left in
that slot, and content authors do not need a variant per combination.

Stat deltas are applied once, when the hero trains, and may be negative — that
is where a path's cost lives. `resourceCap()` is the single source of truth for
a hero's maximum resource and must be used instead of `hero(id).maxResource`
anywhere a path could apply.
