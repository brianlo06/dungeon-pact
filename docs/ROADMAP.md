# Repository roadmap

Latest implementation delta: [Phase 1 expansion](PHASE1_EXPANSION.md). The original milestone lists below are historical and should not be read as the current inventory.

Updated 2026-09-10

## Current milestone: foundation implemented; Phase 1 underway

A playable local end-to-end Foundry Expedition exists. This is not the full Phase 1 content target or finished long-term game.

### Phase 0 implemented

React/Vite/TS project; shared serializable state and validated command union; pure deterministic reducer; seeded RNG; typed content; composable effects/statuses; lobby/guest room; hibernatable authoritative Durable Object; transactional save/receipts; filtered snapshots; reconnect; initial rule/network/simulation tests and a Node 24 build/test CI workflow. Seven requested living documents exist.

### Phase 0 hardening remaining

Server-message schemas, save migration fixtures, explicit phase-epoch protocol for commuting plans, heartbeat timeout, room expiration/creation limits, structured observability, AFK resolution and deployment environments. These should precede wide/public access.

### Phase 1 implemented

4 heroes, 8 normal enemies, 2 simple mechanical bosses, 2 elite traits, 12 items, 10 statuses, 2 reactions, standard/mystery auctions, 3 events, camp, treasury, downs/revives, seeded branching route, results, basic audio/UI/accessibility.

### Next concrete implementation batches

1. **Reliability gate** (`src/server`, `src/shared`, `tests`): restart/duplicate-tab and four-client full-run tests; permission/target fuzzing; migrate simple strict revision to phase epoch for safe concurrent plans; extend content validation and keep receipts atomic.
2. **Content gate** (`src/content`, `src/engine`): expand to 30–40 reviewed items and 5–10 events; add passive/resource hooks, conditional counters and generalized curses. Every new effect needs a behavior regression and content example.
3. **Combat gate** (`src/engine/combat.ts`, client Combat): branching ability upgrades are done. Remaining: boss phase objectives that change decisions, meaningful elite combinations, spirit action each round, and row reach tradeoffs. Prefer new threat shapes over larger enemy health pools.
4. **Economy gate** (`auction.ts`, map/event content): consumables, healing/information alternatives, team relics, equipment trading; richer auction rule definitions including sealed/Dutch. Add server alarms only when timed mode exists.
5. **Experience gate** (`src/client`): multi-frame hero/enemy animation, biome tiles, unique item art, contextual tutorial, compact round event playback, focus management, accessible status inspection, equipment comparisons, pings with targets, adaptive licensed audio.

Phase 1 exit: two to four humans complete a 15–25 minute development expedition, use a cooperative reaction, take branch upgrades they can explain afterwards, make contested purchases, recover from a refresh, and finish without manual intervention; 30–40 functional items, 5–10 events and useful boss mechanics. Simulations alone do not satisfy the human playtest requirement.

## Subsequent phases

| Phase                | Scope                                                                                          | Dependencies / acceptance                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 2 Combat depth       | Passives, deeper upgrade trees, reactions, positioning, more status/enemy roles                | Effect hooks and replayable event presentation; no class owns every solution |
| 3 Economy            | More auction modes, approval config, sacrifices/debt/reverse auctions, economic traits         | Atomic non-gold costs and approval semantics; economy metrics                |
| 4 Procedural content | Additional regions, route generator with hidden/revealed nodes, weighted pools, events, bosses | Content validation and seed/save compatibility                               |
| 5 Meta               | D1 profiles, horizontal unlocks, Guild Hall collection, codex, history, stats, Pact levels     | Guest linking and idempotent completion outbox; no permanent stat advantage  |
| 6 Social/custom      | Spectators, pings, seed entry, presets, alternate run modes, share cards                       | Hidden-view policies for spectators; mode schemas                            |
| 7 Polish             | Consistent art/audio/VFX, onboarding, device/accessibility pass                                | Asset license manifest and performance budgets                               |
| 8 Balance/QA         | Human sessions, automated policies, network soak and economy tuning                            | Metrics represent composition, seed, choices and duration                    |
| 9 Content engine     | Cheap new definitions, authoring browser, simulations, expansion packages                      | Versioned catalogs and documented tested primitives                          |

## Explicitly absent / no fake completion

No public hosted game, accounts/D1 progression, codex collection, achievements, run-history service, daily/weekly challenges, full Standard run, multiple regions, 250-item catalog, dedicated developer UI, adaptive music or animated character art. No placeholder navigation buttons suggest these exist. The first pixel art direction now has a generated character atlas, source-authored tavern scene, locally hosted font and compact game UI. Multi-frame character animation and unique item art remain pending; asset provenance is in the manifest.

## 0.7 progress

Class paths are implemented: three mentors on the route, 24 paths, tuition from
the shared treasury, one path per hero per run. Tiers currently map to route
depth; when additional regions land in Phase 4 a tier becomes a region with no
rework, which is how the inspiration gates its subclasses.

Still open and now better evidenced: the class gap is driven by base sustain
rather than by any of the layered progression systems, so it needs a decision
about Warden's baseline healing rather than more content. Boss objectives that
change decisions remain the clearest ceiling on difficulty.

## 0.3 progress

Branching ability upgrades are implemented, which was the top item of the combat
gate. Twenty-four branches across four heroes, one pick per cleared chamber,
each line trading force against guard. Balance was measured across all 65 class
combinations with a control-aware policy before any tuning; the resulting
evidence overturned the previous healer-dominance conclusion and identified the
Vanguard as the real outlier, now largely closed. A genuine defect — combat that
could never terminate — was found and fixed. Recovery is now scarce: revivals
escalate in price and camp training costs gold.

Still open from the combat gate: boss objectives that change decisions rather
than raise numbers, spirit actions each round, and row reach tradeoffs. Still
open from the economy gate, and the main cause of leftover treasury: there is
almost nothing to buy. Consumables, healing alternatives and team relics are the
real fix and are deliberately not faked with price tweaks.

## 0.2 progress

User confirmed equipped abilities and deeper tactical turns. New rooms now have authored enemy formations, versioned windups/fortification patterns, interception, Weak, interruption and barrier stripping. The pixel art direction includes hero/enemy/boss sprites, an Auctioneer, source-authored tavern geometry and local typography. Next combat work: branching skill upgrades, reliable non-healer sustain, more boss objectives and a clear round recap.
