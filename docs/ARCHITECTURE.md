# Architecture

Updated 2026-09-10

## Repository findings and decision

The supplied working directory was `/Users/brianlo`, not a game checkout. Checked candidate game projects: `game/Claude-Code-Game-Studios` contains workflow scaffolding and an empty src; `roblox-dungeon-crawler` contains a Roblox extraction design with incompatible combat/economy; `unitygame` is a separate Unity game; `half-light` is typography work. No Dungeon Pact implementation or applicable parent AGENTS.md was found. No existing game was rewritten. A new independent project lives at `/Users/brianlo/dungeon-pact`.

## Boundaries

- `src/shared`: serializable state types and Zod client-intent schemas. No UI/platform dependencies.
- `src/content`: declarative hero, ability, enemy, item, event and status catalogs.
- `src/engine`: deterministic synchronous reducer, RNG, combat, status/effect interpreter, auction settlement, map generation. Never imports React, sockets, database or wall clock. Caller supplies time only for run timestamps.
- `src/server/index.ts`: Cloudflare Worker ingress and SQLite Durable Object per room. Owns credentials, command validation, storage transactions, WebSocket lifecycle and filtered broadcasts.
- `src/client`: React views, connection lifecycle, local preferences, presentation/audio. Sends intents, never authoritative values.
- `tests`, `scripts`: rules regressions, simulations, real WebSocket smoke harness.

React/TypeScript/Vite match the requested stack. Native Cloudflare Worker + Durable Object hosting is used directly because the primary artifact is a multiplayer game service requiring custom authoritative room infrastructure. Vite proxies `/api` during development; Wrangler serves the compiled client and API together for integrated testing. No external UI library.

## Authoritative state

`RunState` is the save contract. `phase` gates every action. Current persisted phases: LOBBY, PACT, MAP, COMBAT, REWARD, AUCTION, EVENT, CAMP, COMPLETE. Entry and ordered combat resolution are atomic reducer operations, not timer-driven persistent phases. This avoids persisting half-applied damage. Later animation playback consumes ordered events without pausing server truth. Bosses are COMBAT encounters, not a separate permission model.

Every accepted command clones state, validates player/phase/target/cost, resolves synchronously, increments revision and commits run + receipt together in `transactionSync`. No await occurs inside a read-modify-write action. Broadcast occurs after the write; Cloudflare output gates provide durability ordering. Each room is its own coordination unit, so unrelated rooms do not contend.

The SQLite schema stores one JSON run row, hashed guest sessions and command receipts. This is intentionally a small atomic snapshot aggregate: four players and bounded logs. It does not write individual animation frames. Logs retain 100 events; receipts retain about 2,000 revisions. A pruned command still carries its old revision and cannot replay on a newer state.

## Persistence and recovery

Hibernatable WebSockets attach player/connection identity and rate counters. SQL is re-read for commands; no critical cached in-memory state. New sockets authenticate a 256-bit bearer via WebSocket subprotocol; only its SHA-256 digest is stored. Connection generation invalidates stale duplicate tabs. Secrets do not appear in query strings, snapshots or logs. The guest token stays in localStorage; account linking/revocation and cross-device recovery are future work.

Save schemaVersion and contentVersion are 1. Unsupported versions fail closed. Before any breaking save change, add a pure migration and golden-save tests; retain matching old content or migrate owned IDs. No automatic version rewrite is allowed. The present run stores enemy intention definitions, so planned attacks survive restart.

D1 profile/history persistence is not wired yet. Phase 5 should add profiles, unlocks, stats and run summaries plus an idempotent run-completion outbox. The DO remains the active-run source of truth; D1 must never participate in combat settlement. Do not claim lifetime progression until this is implemented.

## Security and operational limits

Same-origin API, bounded join body, runtime command schemas, per-socket 12 messages/second, strict revision, player binding, phase gates, resource/target validation, filtered snapshots. Room codes are join invitations, not credential replacements. All current public player state is intentional; RNG seed is released only after completion.

Before public release: add edge room-creation/join rate limits, retention/cleanup alarms, token revocation, robust snapshot runtime decoding, production error classification, metrics, deployment pipeline, account migration and an AFK policy. Current socket rate limiting resets after reconnection and is not sufficient for public abuse resistance. No public deployment has occurred.

## Platform references

Implementation checked against [Cloudflare hibernating WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/) and [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/). Env/runtime types are generated from Wrangler configuration, not hand-written.

## Dependency audit

Production dependency audit reports zero vulnerabilities. The local Wrangler toolchain currently reports three related high-severity advisories through Miniflare/sharp (libheif); it is not shipped in the browser/Worker runtime. Track an upstream compatible fix before enabling development image-transformation endpoints. Vitest is pinned to the patched 4.1.11 line; Node 24 LTS is the supported development recommendation.

## Backward-compatible tactical revisions

RunState now has optional `combatVersion: 2` and `encounterVersion: 2` on new rooms. Missing values explicitly select legacy skill catalogs, intent rotations and random formation generation. The JSON save schema remains readable at version 1; existing saves require no destructive rewrite. Authored formations and tactical effects are validated with shipped content. Future changes must retain the same version-selection discipline.
