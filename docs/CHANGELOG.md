# Changelog

## 0.3 branching upgrades and measured balance — 2026-09-10

- Added branching ability upgrades. A cleared chamber opens a new UPGRADE phase where every hero picks one of two branches for one ability line; three lines per hero, one pick each, so a run produces up to eight builds per class. Every line offers force against guard, so sustain and mitigation are no longer a Vanguard or Warden monopoly.
- Added `self`-flagged heal and status effects so an attack can also sustain or shield its user. `abilities()` now patches chosen branches over the base list without changing ability ids, so locked plans, cooldowns and saves survive.
- Fixed a defect where combat could fail to terminate: sustain heroes against a fortifying enemy traded heals and shields forever. From round 7 every enemy damage effect now grows by 3 per further round. A regression asserts every class combination terminates under both simulation policies.
- Made recovery scarce and gold consequential. Each battlefield revival costs 60 more than the last; camp training now costs 100 gold instead of being free, so the three camp options genuinely compete; the Miser scales on floor(gold/70).
- Rebalanced by party size and class. Enemy scaling is now 0.75 + players×0.14 (boss 0.45 + players×0.40); four-player bosses gain an Iron Bulwark alongside the Kiln Mender, so a larger party must split its damage rather than burn the boss down. Weak cuts attacks to 65% and Mark + Precision pays 20.
- Rebuilt the simulation harness into a real measuring instrument: arbitrary compositions, a control-aware policy alongside the preserved original, all 65 class combinations via `--matrix`, per-run economy metrics, and a rejected-plan counter that fails the tests if a policy ever proposes an illegal action.
- Overturned the previous balance conclusion. The "healer parties dominate" finding was an artefact of a bot that never used a defensive action; under competent play the Warden gap is 6 points and the real outlier was the Vanguard at 41, now 13. Full evidence and open concerns in BALANCE.md.
- Existing saves are untouched: no combatVersion means no upgrade phase, no escalation, flat revival price and legacy Miser scaling. Schema and content versions remain 1.
- Extended the real-WebSocket harness through encounter victory, the upgrade phase and branch lock-in. Production build, 45 automated tests and 12 network checks pass.

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
