# Repository roadmap

Updated 2026-09-10

## Current milestone: foundation implemented; Phase 1 underway

A playable local end-to-end Foundry Expedition exists. This is not the full Phase 1 content target or finished long-term game.

### Phase 0 implemented

React/Vite/TS project; shared serializable state and validated command union; pure deterministic reducer; seeded RNG; typed content; composable effects/statuses; lobby/guest room; hibernatable authoritative Durable Object; transactional save/receipts; filtered snapshots; reconnect; initial rule/network/simulation tests and a Node 24 build/test CI workflow. Seven requested living documents exist.

### Phase 0 hardening remaining

Server-message schemas, save migration fixtures, explicit phase-epoch protocol for commuting plans, heartbeat timeout, room expiration/creation limits, structured observability, AFK resolution and deployment environments. These should precede wide/public access.

### Phase 1 implemented

4 heroes, 8 normal enemies, 2 simple mechanical bosses, 2 elite traits, 12 items, 7 statuses, 2 reactions, standard/mystery auctions, 3 events, camp, treasury, downs/revives, seeded branching route, results, basic audio/UI/accessibility.

### Next concrete implementation batches

1. **Reliability gate** (`src/server`, `src/shared`, `tests`): restart/duplicate-tab and four-client full-run tests; permission/target fuzzing; migrate simple strict revision to phase epoch for safe concurrent plans; extend content validation and keep receipts atomic.
2. **Content gate** (`src/content`, `src/engine`): expand to 30–40 reviewed items and 5–10 events; add passive/resource hooks, conditional counters and generalized curses. Every new effect needs a behavior regression and content example.
3. **Combat gate** (`src/engine/combat.ts`, client Combat): strengthen boss phase objectives, add intercept semantics (current Iron Oath is a barrier), meaningful elite combinations, spirit action each round, and row reach tradeoffs. Add branching ability upgrades before increasing stat complexity.
4. **Economy gate** (`auction.ts`, map/event content): consumables, healing/information alternatives, team relics, equipment trading; richer auction rule definitions including sealed/Dutch. Add server alarms only when timed mode exists.
5. **Experience gate** (`src/client`): original illustrated hero/enemy art, contextual tutorial, compact round event playback, focus management, accessible status inspection, equipment comparisons, pings with targets, adaptive licensed audio.

Phase 1 exit: two to four humans complete a 15–25 minute development expedition, use a cooperative reaction, make contested purchases, recover from a refresh, and finish without manual intervention; 30–40 functional items, 5–10 events and useful boss mechanics. Simulations alone do not satisfy the human playtest requirement.

## Subsequent phases

| Phase                | Scope                                                                                          | Dependencies / acceptance                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 2 Combat depth       | Passives, branching upgrades, reactions, positioning, more status/enemy roles                  | Effect hooks and replayable event presentation; no class owns every solution |
| 3 Economy            | More auction modes, approval config, sacrifices/debt/reverse auctions, economic traits         | Atomic non-gold costs and approval semantics; economy metrics                |
| 4 Procedural content | Additional regions, route generator with hidden/revealed nodes, weighted pools, events, bosses | Content validation and seed/save compatibility                               |
| 5 Meta               | D1 profiles, horizontal unlocks, Guild Hall collection, codex, history, stats, Pact levels     | Guest linking and idempotent completion outbox; no permanent stat advantage  |
| 6 Social/custom      | Spectators, pings, seed entry, presets, alternate run modes, share cards                       | Hidden-view policies for spectators; mode schemas                            |
| 7 Polish             | Consistent art/audio/VFX, onboarding, device/accessibility pass                                | Asset license manifest and performance budgets                               |
| 8 Balance/QA         | Human sessions, automated policies, network soak and economy tuning                            | Metrics represent composition, seed, choices and duration                    |
| 9 Content engine     | Cheap new definitions, authoring browser, simulations, expansion packages                      | Versioned catalogs and documented tested primitives                          |

## Explicitly absent / no fake completion

No public hosted game, accounts/D1 progression, codex collection, achievements, run-history service, daily/weekly challenges, full Standard run, multiple regions, 250-item catalog, dedicated developer UI, adaptive music or animated character art. No placeholder navigation buttons suggest these exist. The CSS environment and glyph characters are functional temporary art, tracked in the asset manifest.
