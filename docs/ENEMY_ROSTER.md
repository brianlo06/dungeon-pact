# Dungeon Pact — Enemy Roster (as of production 844d0c5, 2026-09-17)

A snapshot of every enemy, minion, spawned object and boss in the game, how they
are assembled into fights, and what the engine already supports, written as a
brief for designing new enemy types. Numbers are base values from
`src/content/enemies.ts`; see "How numbers scale" for what a party actually
faces.

## The game in one paragraph

Dungeon Pact is a 2–4 player co-op, round-based tactics roguelite. Each round
every enemy **shows its intent** (move, target, forecast damage). Heroes plan
together, then the round resolves in speed order. Both sides stand in a
**front row** and a **back row**. A run is **three floors** of six chambers
each: fights, shops, events, a mentor/training ground, a camp, then a boss.
Heroes: Vanguard (tank/guard), Arcanist (magic/lightning), Ranger (precision,
Marked), Warden (healer), Broker (gold), Herald (support), Reaver (spends HP
for damage), Beguiler (Confused: makes enemies hit their own side).

## Regular enemies (minions) — 8 types

Every regular fight uses only these eight. Each alternates through a **two-move
rotation** (round 1 move A, round 2 move B, repeat). A **WINDUP** move is
telegraphed, and a hero can Interrupt it.

| Enemy | Row | HP | Guard | Speed | Look | Move A | Move B |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| **Cinder Stoker** | front | 42 | 1 | 3 | small foundry worker | Branding tongs: 12 | Heavy hammer: 22 |
| **Iron Bulwark** | front | 65 | 5 | 2 | heavy shield construct | Lock shields: self Barrier 16 | Shield ram: 22 |
| **Ash Acolyte** | back | 35 | 0 | 5 | robed caster | Ember bolt: 10 | WINDUP Cinder eruption: 20 to a row + Burn 3 |
| **Kiln Mender** | back | 38 | 1 | 4 | repair-priest | WINDUP Repair lattice: heal an ally 18 | Wrench: 12 |
| **Slag Hound** | front | 39 | 0 | 9 | fast molten dog | Double bite: 7 + 7 | Pounce: 22 |
| **Rivet Sniper** | back | 34 | 1 | 6 | small rifle turret-man | Take aim: self Barrier 6 | WINDUP Kill shot: 34 |
| **Coin Leech** | front | 40 | 1 | 7 | thief | Treasury tithe: 10 + steals 15 gold | *(one move only)* |
| **Living Bellows** | back | 53 | 2 | 2 | heavy furnace bellows | Draw breath: self Barrier 8 | WINDUP Furnace blast: 24 to a row |

All eight are foundry-themed (fire, iron, rivets). Every one has an authored
cutout rig with its own attack, hurt and defeat animations. Coin Leech has no
two-move rotation of its own; it uses its single tithe every round.

**What minions do today:**
- **Damage:** almost all of it is single-target or a row.
- **Self-shields:** Barrier on Bulwark, Sniper and Bellows.
- **One heal:** the Mender.
- **Burn:** the Acolyte's eruption is the only status any minion puts on a hero.
- **Gold theft:** the Leech's tithe.

**What no minion does:** summon, move heroes or itself between rows, react to what heroes do, buff other enemies (beyond one heal), apply Weak / Poison / Vulnerable / Marked / Confused to heroes, punish a specific hero choice, protect an ally (guard/intercept), change behaviour at low HP, or explode/act on death.

## Elites

An **elite** chamber is a regular encounter with every enemy at **×1.3 HP** plus one random affix per enemy:
- **Greedy:** steals 10 gold on a damaging hit.
- **Vampiric:** heals for half the damage dealt.
- **Sapping:** drains 1 resource from the hero it damages.
- **Armored:** gains 8 Barrier every round.

There are no elite-only enemy types.

## Encounters (formations)

A fight draws one encounter for the chamber's region, with a hand-built line-up for each party size. The enemy count equals the number of heroes.

**Floor 1 — Ember Foundry**

| Encounter | From depth | 2 heroes | 3 heroes | 4 heroes |
| --- | --- | --- | --- | --- |
| Furnace Watch | 0 | Bulwark, Acolyte | + Stoker | + Sniper |
| Rivet Hunting Party | 0 | Hound, Sniper | + Stoker | + Acolyte |
| Smoke Line | 0 | Stoker, Bellows | + Acolyte | Bulwark, Bellows, Acolyte, Hound |
| The Repair Detail | 2 | Bulwark, Mender | + Sniper | + Acolyte |
| Foundry Toll Collectors | 2 | Leech, Hound | Leech, Bulwark, Sniper | + Mender |

**Floor 2 — Drowned Cistern** (only 2 encounters)

| Encounter | 2 heroes | 3 heroes | 4 heroes |
| --- | --- | --- | --- |
| Sluice Sentries | Bulwark, Sniper | + Mender | + Bellows |
| Diving Bell Recovery Crew | Hound, Mender | + Sniper | Hound, Bulwark, Mender, Sniper |

**Floor 3 — Ledger Archive** (only 2 encounters)

| Encounter | 2 heroes | 3 heroes | 4 heroes |
| --- | --- | --- | --- |
| Probate Guard | Bulwark, Leech | + Mender | + Acolyte |
| Hunters of the Unpaid | Hound, Acolyte | Hound, Leech, Acolyte | + Sniper |

**The cistern and the archive have no creatures of their own.** They reuse the foundry's eight under new encounter names, so the flooded halls and the ledger vaults field the same stokers, hounds and snipers as the foundry.

A floor has about 2–3 fights (1–2 regular, often an elite or a hazard room) plus its boss. Hazard rooms change the room, not the enemies:
- **Vents:** scald the hero front row for 6 each round.
- **Collapse:** drops the back row to the front on round 3.

## Bosses — 6 (two per floor, one drawn per run)

Every boss has **HP ×1.2 and +2 damage per hero** (priced for Ultimates), enters **phase II below 50% HP** with its own harder rotation, and has one **objective**: a readable rule the fight is about. Each has an authored rig, its own attack animations and a ~5.5s cinematic entrance.

With 3 heroes a boss brings a **Kiln Mender**; with 4, a Mender and an **Iron Bulwark**.

### Floor 1 — Ember Foundry

**The Collector** — "Keeper of Unpaid Debts" · The Collector's Hoard · HP 190, Guard 3, Speed 4
- **Objective:** it seizes a hero's best equipment into a **Strongbox** (an object, HP 60, Barrier each round). Break the box to get the gear back.
- **Rotation:** Appraise the wealthy 22 (targets the hero who spent the most gold) → WINDUP Close the account 40 → Repossess the collateral 18 to a row + seize 1 item.
- **Phase II:** Final notice 22 + Marked → WINDUP Enforce the notice 33 (+10 pierce on Marked) → WINDUP Repossess.

**The Assayer** — "Who Weighs What You Are Worth in Heat" · The Assay Furnace · HP 190, Guard 3, Speed 3
- **Objective:** it heats a crucible (Heat stacks + Barrier), then pours down a row (38 + Burn 4). If the party deals enough damage in the round the pour is announced (18 per Heat), the crucible **cracks** over the Assayer: 24 pierce, Burn 6, Vulnerable. Wet halves the threshold.
- **Rotation:** Heat → Tongs 24 → Heat → Pour.
- **Phase II:** Heat ×2 → Slag spit 18 row → Pour 40 (crack 20 per Heat).

### Floor 2 — Drowned Cistern

**The Miser** — "Who Counts What You Kept" · The Counting House · HP 175, Guard 4, Speed 3
- **Objective:** its hits and armour grow with the gold the party is holding (Barrier from the treasury above 160 gold). Spending gold weakens it.
- **Rotation:** Weight of wealth 20 + bank gold as Barrier → WINDUP Crushing levy 25 to a row, −10 gold.
- **Phase II:** strips hero Barrier before the levy.

**The Salvor** — "Who Claims What the Water Took" · The Wreck Pool · HP 205, Guard 4, Speed 3
- **Objective:** it grows **Soft Plates** (objects, HP 40, one-round fuse). Break a plate while soft and the Salvor loses its Barrier and becomes Vulnerable. Leave it, and it hardens: the Salvor gains Encrusted (+3 damage on every hit, stacking) and 16 Barrier.
- **Rotation:** Scrape and grow 18 + front plate → Rust volley 20 row → Scrape and grow 18 + back plate → Gaff hook 28.
- **Phase II:** two plates at once → volley 22 → gaff 32. While its plates stand it grinds a row for 20 instead of growing more.

### Floor 3 — Ledger Archive

**The Notary** — "Who Witnesses Every Signature" · The Sealing Room · HP 200, Guard 3, Speed 3
- **Objective:** WINDUP Press the seals spawns **Wax Seals** (objects, HP 34) across both rows on a 3-round fuse. When a seal sets it deals 12 to **every hero**. Each seal broken early deals 8 pierce to the Notary. Break a whole pressing and the Notary is interrupted and Vulnerable. Interrupting the WINDUP stops the pressing entirely.
- **Rotation:** Attest 20 → WINDUP Press 3 seals → Strike from the record 14 row.
- **Phase II:** 4 seals on a 2-round fuse. Countersign 24 while seals stand.

**The Bailiff** — "Who Comes to Collect" · The Bailiff's Court · HP 205, Guard 3, Speed 4
- **Objective:** it serves **Liens** on heroes: a debt that detonates for its stacks after 3 rounds, or immediately if the Bailiff's side lands a direct hit on the carrier. It targets indebted heroes. Heroes can "Serve it back" to transfer the lien onto the Bailiff.
- **Rotation:** Serve a lien 12 + Lien 46 → Garnish wages 16 row, −10 gold → Collect 22.
- **Phase II:** two liens (20 + Lien 50 each) → Collect 34. Lien size scales with party size (×0.6 duo … ×1.35 quartet).

### Spawned objects (not counted as enemies to clear)

| Object | Owner | HP | Behaviour |
| --- | --- | ---: | --- |
| The Strongbox | Collector | 60 | holds seized gear; +4 Barrier per round |
| Soft Plate | Salvor | 40 | 1-round fuse, then hardens onto the Salvor |
| Wax Seal | Notary | 34 | 3-round fuse (2 in phase II), then 12 to every hero |

## How numbers scale (what a party actually faces)

- **Minion HP:** base × (0.75 + 0.14 × heroes) × floor (×1, ×1.25, ×1.5) × 1.3 if elite.
- **Boss HP:** base × (0.1 + 0.48 × heroes) × floor × 1.2.
- **Enemy damage:** base × 1.3 (duo) or ×1.4 (3–4 heroes), then:
  - +2 per hero on bosses;
  - +7 in phase II if the boss has no authored phase-II rotation;
  - +3 per round after round 6 ("the Foundry loses patience").
- **Guard** reduces incoming direct damage; **pierce** ignores it.
- **Speed** sets turn order within a round.
- **Melee screening:** a front-row enemy protects the back row from hero melee attacks (unless the target is Marked).

## Engine building blocks already available

A new enemy can be built from these without engine work.

**Ability targets:** `enemy` (one hero), `enemyRow` (a whole hero row), `self`, `ally` (another enemy), `allyRow`.

**Ability flags:**
- `interruptible`: a WINDUP heroes can stop.
- `cracks`: breaks under enough damage this round, with a backlash.
- `reach`.

**Effects:**
- `damage` (with pierce, precision, fire/lightning/arcane type, or `self` to pay HP).
- `heal`, `protect` (Barrier), `status` / `removeStatus`, `resource`.
- `move` (change rows), `gold`, `seize` (take equipment), `bank` (gold → Barrier), `transfer` (move a status).
- `spawn` (put objects in the fight, optionally on a fuse with a clock move when due).
- Scoped effects on every hero (`enemies`) or every ally (`allies`), and `conditional` (only if the target has a status).

**Enemy-definition hooks:**
- **Targeting:** `targets` (wealthiest / indebted).
- **Scaling:** `hoard` (scales with gold).
- **Objects:** `clock` (a spawned object's countdown and due move), `broken` (what breaking an object does to its owner), `busy` (what a spawner does while its objects stand).
- **Bosses:** a phase-II rotation.

**Statuses:**

| Status | Effect |
| --- | --- |
| Weak | −35% attack |
| Empowered | +30% attack |
| Confused | the next action hits its own side |
| Guarded | a protector takes the next hit |
| Interrupted | loses its WINDUP |
| Burn | damage over time |
| Poison | damage over time that ignores Guard |
| Wet | the next Lightning hit chains 12 |
| Marked | the next Precision hit does +20, and melee can bypass screening to reach it |
| Barrier | absorbs damage |
| Regeneration | heals over time |
| Heat | Assayer only |
| Encrusted | +3 damage per stack |
| Lien | a delayed detonation |
| Vulnerable | +25% damage taken |

## What each new enemy costs to add

Every enemy is expected to be **authored art**, not a placeholder sprite:
- an SVG cutout component (`src/client/components/<Name>.tsx`);
- a rig with idle / attack / hurt / defeat clips (`src/client/battle/rigs-*.ts`);
- choreography for how its moves cross the stage (`src/content/choreography/<id>.ts`).

It also needs:
- an entry in `src/content/enemies.ts`, a tactical rotation, and placement in encounters;
- browser tests that it is drawn, faces the party and stays on screen;
- a balance pass in `scripts/simulate.ts`.

A new boss adds a phase-II rotation, an objective, and an intro film.

## Where the variety is thin (observations)

1. **Eight minions for the whole game**, all foundry-themed. Floors 2 and 3 introduce no new creature; their fights are relabelled foundry fights.
2. **Only two encounters each on floors 2 and 3**, so the same line-ups repeat within a run.
3. **Minion behaviour is flat:** fixed two-move loops of "hit" and "shield or wind up". No minion interacts with another (apart from one heal), reacts to what heroes do, repositions, summons, or changes at low HP.
4. **Hero debuffs are almost unused by enemies.** Weak, Poison, Vulnerable, Marked and Confused are in the engine, but only Burn and gold theft come from minions.
5. **Elites are affixes, not creatures.** There is no elite or mini-boss enemy type.
6. **Bosses are where the mechanics live** (seizure, gold armour, cracking pours, plates, seals, liens). The fights before them teach none of those mechanics.
