# Changelog

## 0.15 picks at the table and chance events — 2026-09-13

Two requests from the table: seeing who picked what meant scrolling to the
bottom of the lobby, and the events were all sure things.

- **Picks show on the heroes.** Each player gets a seat colour in join order,
  as in a couch fighting game (red, blue, yellow, green). A hero someone has
  picked wears that colour as its border, with a small tag carrying the seat
  and name. Tags are dashed while the player is deciding and solid, with a
  tick, once they lock in. Friends on the same hero stack rings outside the
  first. Nobody is shown on the Vanguard just for joining with it: a pick
  shows once it is made (`Player.chosen`).
- **The table is pinned to the bottom of the screen.** Four seats, with
  portrait, hero and ready state, plus the ready and begin buttons, stay in
  view wherever the grid is scrolled.
- **Six chance events**, after the Slay the Spire events people remember,
  drawn into the same pool as the eight fixed ones:
  - **The Paymaster’s Wheel** (after the Wheel of Change): six equal slices,
    four good and two bad.
  - **The Buried Surveyor** (after the Dead Adventurer): search up to three
    times for loot, with a 25%, then 50%, then 75% chance of an elite ambush.
    The party keeps what it found.
  - **The Slag Chute** (after the Scrap Ooze): every try burns the party a
    little more, and the chance of finding the strongbox climbs from 25% to a
    sure thing.
  - **The Automaton Duel** (after the Joust): back the 70% favourite or the
    30% long shot for 60 gold.
  - **The Warm Strongbox**: 60% treasure, 40% it bites.
  - **The Loaded Dice**: every hero rolls for themselves for maximum HP, or
    pays 80 gold to load the dice from 50% to 75%.
- **The odds are on the table.** Every chance choice prints its percentages
  as a d100 strip with what each band does, because a party that votes needs
  something to argue about. The result is shown on the same strip: the die
  tumbles, lands, and the party stays on the result until someone continues.
  A roll that ends in a fight starts it then. Health losses never down a hero,
  every chance event can be left for free, and a run does not repeat an event
  until it has seen all fourteen. A fight an event deals pays 80 gold rather
  than a chamber's 110.
- **Measured.** The tactical matrix (10 seeds, all 486 compositions) is
  unchanged within noise: duos 80→79%, trios 94→95%, quartets 91→92%. The
  bots price each chance choice by its expected value.

## 0.14 floors, chambers and a readable route — 2026-09-12

The second playtest round: the run ended too soon, the route screen was hard
to read, health and the class resource were hard to find in a fight, and the
party wanted more kinds of room than fights and shops.

- **Two floors.** A run used to end at whichever boss the dice picked. It now
  descends: floor one is the Foundry and ends at the Collector's Hoard, floor
  two opens in the Cistern, closes in the Archive and ends at the Miser's
  Counting House. Each floor is six chambers with a guaranteed rest before its
  boss. Floor two's enemies have a quarter more health and power. The stairs
  between floors raise fallen heroes to half health and restore a third of
  everyone else's. Rooms that entered a run before floors keep the old single
  route.
- **Four new chambers**, each built on a system the game already had:
  a **toll gate** (pay the keepers, or fight for the reward and an upgrade), a
  **hazard chamber** (vents that scald the front row every round, or a catwalk
  that drops the back row forward on round three), a **shrine** (one hero trades
  maximum HP or party gold for permanent Power, then the altar goes dark) and a
  **workbench** (reforge gear the party carries so its effects strike half again
  as hard, once, under the shop's consent rules).
- **The route is legible.** Links were drawn in a percentage space that assumed
  every row and card was the same size; the cards were laid out by flexbox, and
  the two never agreed, so lines ran under cards and ended inside them. Links
  are now measured off the rendered cards, leave one card's bottom edge and
  arrive at the next one's top, and the way on from where the party stands is
  drawn in gold. Names wrap rather than truncate.
- **Health and the class resource are on the plate.** Health shows its figures
  inside the bar. The resource, which was seven pixels of text under the hero's
  feet, is a row of pips beneath it. The pulsing diamond that marked the action
  fan's anchor was removed: it sat on top of the pips that replaced it.

**Balance, measured rather than guessed.** Two floors first took duos from 84%
to 48%. The runner now records where every lost run ended, and the answer was
unambiguous: at every party size essentially every loss is at a boss, and duos
died to the _first_ boss at eight times a quartet's rate. The boss health
formula had been giving a duo more boss per head than a quartet (0.63 against
0.51). With an even per-head weight, and the stairs' partial recovery, the
tactical bot wins two floors at **80% / 94% / 91%** for two, three and four
heroes — against 84% / 91% / 92% for the old single floor.

Two levers were tried and rejected on the numbers, and are recorded so nobody
tries them again: a full heal between floors (quartets rose to 94% while duos
barely moved) and scaling floor damage by party size (+2 for duos, inside the
noise).

**A correction.** Three full browser runs in the previous round were reported
as passing. Each had 53–56 failures; the summary line sits above the tail that
was read. The failures predated that work — the same tests fail on the commit
before it — and came from melee screening, which made back-row enemies illegal
targets while twelve tests still clicked every enemy blindly or asserted that
an ability marks every unit. Those twelve now aim at legal targets and assert
that marks match legality. One pre-existing failure remains: the Collector's
held wind-up drops to idle for a moment before its signature
(`boss-moves.spec.ts`, "the wind-up lands as the signature").

## 0.13 playtest feedback — 2026-09-12

Everything here answers one friend playtest: five complaints and a follow-up
about status indicators, quoted in `HANDOFF.md`. What follows is what each one
turned out to be.

- **The killing blow was never shown.** The client unmounted combat the moment
  the server reported the chamber won, so the last round's replay — including
  the enemy's defeat — was cut off and the upgrade screen appeared instead.
  Combat is now held on screen until the replay it is already playing settles.
  The hold is presentation only: the snapshot is authoritative the whole time,
  other players carry on, and the held player simply cannot act until the
  animation finishes.
- **Row attacks followed heroes who dodged them.** An enemy announced "front
  row" but resolved against _its target's current row_, so a party that moved
  to the back was hit anyway — the move the announcement invites was the one
  thing it did not reward. An enemy now records the row when it announces the
  intention, and resolves against that row whoever is standing in it. Leaving
  it empty makes the attack miss, and says so in the chronicle. Intentions
  carried over from a round announced before this change are anchored before
  anyone moves, so a room mid-fight does not change rules underneath it.
- **The auction is gone; the exchange is a shop.** Lots that suited one hero
  and nobody else gave the party no reason to bid against each other, which
  left bidding as theatre over a purse everyone shares. Stock is now visible at
  posted prices: one weapon, one armour, one relic and two supplies, preferring
  gear nobody owns. A purchase names its recipient and needs a majority plus
  that recipient's own consent, and one decision runs at a time. What made the
  exchange worth playing was never the bidding — it was one treasury and a
  revival to keep gold back for — and that is untouched.
- **The Gilded pact was strictly worse, and now is not.** It paid a flat purse
  against a per-hero health price, so it cost a quartet twice what it cost a
  duo while buying each hero less. Nobody had caught it because _the bots could
  not take it_: both policies hard-coded the other pact, so every number this
  project has ever printed described a run that refused the Gilded. The runner
  takes either now (`--pact=`), which is how the rest of this was measured
  rather than guessed at. 486 compositions, 10 seeds, tactical policy, win rate
  at 2/3/4 players:

  | pact                   | 2   | 3   | 4   |
  | ---------------------- | --- | --- | --- |
  | Unbroken               | 75% | 90% | 92% |
  | Gilded, flat 300 purse | 78% | 88% | 85% |
  | Gilded, 120 a hero     | 78% | 87% | 91% |

  A flat purse was already a duo's bargain and a quartet's mistake; paying by
  the head puts the two pacts within three points at every size. The price is
  6 maximum HP a hero, unchanged from the flat version and half what the
  original asked.

- **Statuses were unreadable.** Barrier is named and carries its value instead
  of sitting in a row of anonymous glyphs; other statuses show the leading one
  with its stacks and rounds and a count of the rest. Either opens a panel
  listing every effect with what it does and how long it lasts, and closing it
  hands the keyboard back to the badge it was opened from.
- **The heroes were chibi, and are not now.** Under three heads tall is a
  mascot. Heads are scaled inside their own animated part and lifted, the gap
  that opens is a neck belonging to the body, and limbs, hands, legs and boots
  are trimmed by a shared factor. No joint moved, so no equipment mount or gear
  asset was re-authored. The party reads at about four heads. `ART_DIRECTION.md`
  has the reasoning and what it cost.

- **Every round started on last round's move.** The chosen ability, its target
  and the fan's mode were component state that outlived the round they were
  made in, so round two opened already in target mode with the previous move
  named and "Lock action" live under a target nobody had chosen this round.
  Repeating a move took one click; doing anything else took a trip through
  "← Back" first. Each round now starts where the first one did. Unlocking
  mid-round is untouched — that is a decision being edited, not a new one.
- **A training ground teaches one class.** Paths were always class-locked by
  identity — a Ranger could never take the Vanguard's — but every mentor taught
  all eight, so the whole party walked out of every mentor changed and a path
  belonged to nobody. A ground now draws one class from the party when the
  chamber is entered, and only that hero may take a path. Everyone else may
  drill: a small permanent gain in Power and maximum HP for a smaller fee, no
  new ability and nothing given up. A hero still evolves once a run, but an
  evolved hero can still drill, so a mentor chamber is never a dead room.

  Measured before designing anything further: duos went from **75% to 84%**,
  trios 90% to 91%, quartets 92% to 92%. The gain is almost entirely a duo's
  purse — two heroes used to pay two tuitions at one ground, and now pay one
  tuition and one drill. This closes about half of the two-player gap the
  handoff has been carrying as open work, and it was not the intent of the
  change; the intent was that a path should belong to a class.

Two instrument changes came out of this and matter more than any single fix.
The bots can now swear either pact, and they buy at the shop using the same
judgement the auction bot bid with, rather than taking the first affordable
thing on the shelf. The trap the handoff records — an instrument that cannot
reach a system reports that the system does nothing — caught a fifth victim
here, and it was the pact nobody had ever measured.

## 0.12 reliability — 2026-09-10

- Commands carry a decision epoch instead of matching an exact revision. Two
  heroes locking plans in the same round, or voting at the same instant, are
  both accepted; a decision made about a moment that has passed is still
  refused. Safety comes from the per-handler idempotency guards, which were
  already there.
- Rooms expire: idle sockets close after 45 minutes, a finished run is deleted
  two hours after it ends, and an untouched room is deleted after 24 hours.
  Expiry deletes the run, the sessions and the receipts together.
- Room creation is limited to twelve per address per hour.
- The live smoke harness now asserts the new concurrency rule in both
  directions.

## 0.11 supplies — 2026-09-10

- Five consumables: Ward-iron Flask, Field Dressing, Clear Draught, Solvent
  Flask, Flashpowder. Each sells one thing a Vanguard or Warden would otherwise
  be the only source of, for one action and one payment.
- Every exchange now closes with a consumables tray, sold by the case of two.
  The tray is the last of the three lots, so an exchange now runs two
  equipment lots rather than three.
- Supplies stack, never displace worn equipment, and are never seized.
- The Vanguard gap falls from +17 to +11 and the Warden's from +21 to +17.
  Parties that field them are unchanged; every point of that came from lifting
  the parties that do not.
- The Strongbox is priced against a party's actions rather than its headcount,
  so opening it costs a duo and a quartet the same share of a round.
- The simulation runner records why a plan was rejected, and counts supplies
  bought and used. A rejection count with no reason cannot be chased, and the
  chronicle is capped at 100 entries so it cannot be asked what happened.
- The policy picks interrupts by effect as well as Barrier strips, so a bought
  Flashpowder counts as counterplay alongside the Arcanist's Counterspell.

## 0.10 boss objectives — 2026-09-10

- Both bosses now fight for something and say so before the first round.
- The Collector's Repossess seizes the dearest item carried by each hero in the
  row it hits into a Strongbox. Its owners lose those items' triggers until the
  container is broken open, which returns everything and ends the seizures. The
  Strongbox never blocks a victory: opening it is a choice, not a chore.
- The Miser's Weight of wealth shields it for one Barrier per twelve gold the
  treasury holds above 160. Spending is the counterplay; hoarding is the
  expensive way to arrive.
- Three new content primitives — `seize`, `bank`, and `EnemyDef.object` — plus
  `EnemyDef.objective` for the stated goal. No enemy gained health.
- Difficulty moved on the strength of the objectives alone: three and four
  players from 88–91% to 81–86%, two players from 72% to 63%.
- The balance policy now picks a Barrier strip by effect rather than by name, so
  the Broker's Liquidate and two upgraded branches count as counterplay instead
  of only the Warden's Unravel.
- New `hoard` simulation policy, written to reach a system the tactical bot
  cannot: it never spends, so a treasury-scaled shield has something to measure.

## 0.9 scarce healing — 2026-09-10

- Mending roots had no cooldown, so a Warden healed every round and sustain compositions were not killable. It now heals 32 on a one-round cooldown, leaving a gap the party has to survive. Three- and four-player win rates fell from 93/92% to 81/85%.
- That alone moved the class gap the wrong way: Warden went from +12 to +22, because scarce healing raises the value of the only class that supplies it. Brace now heals 8 alongside its Barrier — free, available to every class every round, and still costing the whole action. The gap came back to +15 while the difficulty stayed.
- Recorded in BALANCE.md what is left: Vanguard and Warden both sit near +15, which is the tank-and-healer pattern rather than a defect, and closing it means changing what those classes are for.
- Fixed a measurement trap the route change introduced. Branching the route meant mentors had to be steered toward several chambers ahead, the greedy policy stopped reaching them, and the matrix quietly reverted to pre-evolution numbers as though evolutions did nothing. The policy now searches forward for reachable training.

## 0.8 the route — 2026-09-10

- Rebuilt the dungeon map. It was a stacked list of wide rows with one dashed line down the middle that connected nothing; it now draws as a branching descent with links stroked between the chambers they actually join, reachable chambers lit while the rest recede, a pin on the party's position, and the whole route on one screen ending at the vault.
- Fixed the underlying reason it never read as a map: every chamber linked to every chamber on the next layer, so a route choice closed nothing off. Each chamber now feeds a contiguous span of the layer below — taking the Gilded Exchange can put the Whetstone out of reach for the run. Every chamber stays reachable by some route and none dead-ends, both asserted by regression.
- Gave mentors their own icon. Training, combat and the veiled lot were all rendering as near-identical shapes.
- Chamber names are drawn without replacement, so one route no longer contains two Wounded Smiths, and the auction, elite and camp pools gained more names.

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
