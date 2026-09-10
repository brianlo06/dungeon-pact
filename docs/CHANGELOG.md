# Changelog

## 0.7 class paths — 2026-09-10

- Added class evolutions. Three mentors sit on the route at different depths — the Whetstone, the Reliquary and the Cipher — each teaching exactly one path to each of the eight classes, for 24 paths. A route visits one node per depth, so no run reaches all three and which paths were on offer differs between runs.
- A path is a role pivot rather than a power-up: it swaps one signature ability, shifts stats in both directions, and a hero takes only one per run. Taking the first mentor means declining what the later ones would have taught.
- Tuition is charged to the shared treasury the moment a hero commits, and the purse will not cover everyone. Who trains is fought over the same gold as the auctions — the inspiration treats a subclass as personal progression, here it is a contested purchase.
- Paths swap abilities by id, so branches, cooldowns and locked plans survive the change. `abilities()` applies the path first and folds branches over the result, so no content variant is needed per combination.
- Party size stopped mattering: 92/93/92 across two, three and four players, against 77/92/95 before. Flat per-hero tuition from one shared purse is self-balancing — a duo can evolve both heroes, a quartet cannot afford four. That was not designed; it fell out of pricing training per hero.
- Mentors are the largest gold sink added so far. Mean final treasury fell from 381–463 to 268–325.
- Recorded a finding the tuning attempts made clear: the class gap is driven by base sustain, not by paths. Softening the strongest path and helping the weakest class moved the aggregates by under a point each. Closing it means revisiting Warden's baseline healing, which BALANCE.md leaves open rather than fudging.
- `resourceCap()` is now the single source of truth for a hero's maximum resource, since a path may raise it.

## 0.6 class art — 2026-09-10

- Broker, Herald, Reaver and Beguiler have their own sprites. The palette-shifted placeholders they shipped with are gone, along with the `derived` map and the `.sprite-<class>` filters.
- Added `public/art/characters-v2.png`, a 2×2 512px-cell atlas. `Sprite.tsx` selects the sheet per id, so both atlases coexist and a third needs only another entry.
- Added `scripts/build-sprite-sheet.py`, which keys the generated magenta background, trims to the artwork and centres each sprite in its cell. Keying on a flat threshold leaves a purple fringe, so it neutralises the key across a band and feathers alpha instead.
- Recorded what actually makes the generation work in ART_DIRECTION.md: two cropped v1 cells as visual reference fix the proportions, which words alone do not; ask for exactly one character alone or a multi-character reference produces a scene; and require the whole body head to feet or the framing crops to a bust.
- Provenance recorded in ASSET_LICENSES.md as AI-generated, not commissioned illustration.

## 0.5 combat presentation — 2026-09-10

- Added round playback. The engine resolved a whole round in one message and the client snapped to the aftermath, so a fight had no moments in it. Rounds now replay as timed beats: the acting unit is spotlit while the board dims, the move announces itself as a skewed callout, targets flash and shake, floating numbers rise off them, and reactions get a full-width banner.
- Added structured `beat` data to the chronicle — actor, target, label, amount and resulting health — so playback animates accurately instead of parsing prose. Tests assert beats name real units and settle on the health the round actually reached.
- Long rounds scale their step timing down so replay never exceeds about four seconds, and a Skip control is always available. Reduced motion disables replay entirely; the chronicle still carries every event in text, so animation is never load-bearing for information.
- Impacts layer a filtered noise burst under the tone cue. A pure oscillator read as beeping rather than hitting.
- Influences taken from Persona's turn presentation — typography, layout, colour and animation carrying the theme rather than new mechanics, every action on its own button with no scrolling — expressed in this game's pixel palette.
- `Sprite.tsx` now supports a second atlas. Producing `public/art/characters-v2.png` and filling in one constant is the whole integration for real class art; the borrowed cells and palette filters then stop being used automatically. ART_DIRECTION.md carries the exact cell manifest and style constraints to generate against.

## 0.4 eight classes — 2026-09-10

- Added four classes, doubling the roster. **Broker** bills the shared treasury for damage and shields and earns gold back by fighting; **Herald** empowers itself and an ally, shields whole rows and clears afflictions; **Reaver** pays HP for armour-piercing damage and drags back-row enemies to the front; **Beguiler** turns an enemy's next action against its own side.
- Added the primitives those roles needed: `self` on damage (a flat blood cost, no scaling or armour), `pierce` on damage, `self` on heal and status, an `allyRow` target so rows carry support meaning, the `empowered` status as Weak's mirror, and `confused`, which flips an enemy's next action onto its own side — including healing intents, so a confounded Kiln Mender repairs the wrong thing.
- Fixed a latent engine gap the Broker exposed: an ability billed to the treasury resolved at a discount when the purse was short. It is now refused.
- Fixed the Herald, which shipped broken. The 486-composition sweep caught it as the only class that made a party worse (84% with, 94% without; Hrl+Hrl won 0%). A buffer spending one of two actions to add 30% to the other is net-negative in a duo, so Battle anthem now empowers the Herald as well as its target. Hrl+Hrl+Hrl went from 28% to 96%.
- Rebalanced measurement for eight classes: 486 compositions, 12,150 runs per policy. All eight classes now sit inside a 14-point band, against the 41-point Vanguard gap this development pass began with. Aggregates and tails print by default; `--full` prints every row, and `--party` accepts the short labels the tables use.
- The atlas has no cells for the new classes, so they borrow the closest silhouette and are separated by palette. This is documented as an interim in ART_DIRECTION.md, not as bespoke class art; a regenerated atlas removes the `derived` map and the filters.

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
