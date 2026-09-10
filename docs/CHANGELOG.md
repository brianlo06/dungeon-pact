# Changelog

## 0.2 art and tactical combat pass — 2026-09-10

- Replaced the first ornate presentation after user art-direction feedback with an indie pixel dungeon theme: purple stone, rust light, chunky frames and local pixel typography.
- Added a cohesive 16-cell generated character atlas, including all four heroes, eight normal enemies, two bosses, Auctioneer and chest.
- Added source-authored Guild Hall tavern scenery and pixel interface icons. Integrated sprites into lobby, combat, auctions, rewards and results.
- Compacted the battlefield into two formation columns; retained explicit intentions, targets, health and row labels.
- Documented art rules, asset provenance and remaining animation/item-art work. The art layer is independent of gameplay. New tactical combat changes are versioned per room.

## 0.1.0 — 2026-09-10

- Created independent Dungeon Pact project after inspecting workspace game candidates.
- Added React/Vite client, Worker ingress and per-room SQLite Durable Objects.
- Added versioned state, validated intents, deterministic RNG, transactional commands, duplicate receipts, secret-filtered snapshots and reconnect credentials.
- Added four heroes, eight normal enemies, two bosses, two elite traits, twelve items, three events, seven statuses and two reactions.
- Added a seven-depth seeded Foundry route with combat, ascending/mystery auctions, approval votes, starting pacts, camps, rewards and results.
- Added dark fantasy UI, glyph/token combat presentation, row targeting, intention inspection, shared treasury, build inspection, strategic pings and original synthesized feedback sounds.
- Added unit, deterministic simulation and real WebSocket smoke tests. Initial production build and 20 tests passed; local network smoke passed.
- Ran 150 AI-policy runs; captured composition/scaling and excess treasury findings in BALANCE.md.
- Fixed an all-down round-start curse edge case discovered during review.
- Added the requested seven development documents and an explicit roadmap separating implemented and planned work.

Known release blockers are tracked in ROADMAP.md and ARCHITECTURE.md. This release is a development expedition, not completion of the master brief.

- Added boot-time catalog validation and regressions for invalid effects and round-start curse defeat. Two isolated browser sessions verified guest join, hero selection, ready/start and pact voting.

- Browser-tested independent combat lock-in and server round resolution; made raw enemy damage and revival gold cost visible. Added a Node 24 CI workflow.

- Confirmed equipped-ability combat direction with the user; no deck or random hand system.
- Added versioned authored encounter formations and enemy windup/fortification rotations.
- Added Vanguard interception, Arcanist interruption, Ranger Weak and Warden barrier removal, with server-side targeting/cost rules and status feedback.
- New rooms use combatVersion 2 and encounterVersion 2; existing saves missing those flags retain legacy skills, intentions and generation.
- Added focused tests for interception, multi-hit behavior, status riders, expired protectors, Weak, interruption, cooldowns, shield stripping and legacy skills. Build and 34 tests pass.

- Verified real-network windup/interrupt settlement and cooldowns; checked desktop combat and mobile Guild Hall for horizontal overflow. Added a retaliation regression: defeated multi-attackers stop between hits in tactical v2.
