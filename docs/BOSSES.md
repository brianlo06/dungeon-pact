# Bosses

A run is three floors. Each floor draws its boss from a pool of two when the
floor is built, so the chamber's name, the fight and every client agree on who
is waiting before anyone walks in.

| Floor | Region | Mentor | Bosses |
| --- | --- | --- | --- |
| 1 | Ember Foundry | the Whetstone | **The Collector**, **The Assayer** |
| 2 | Drowned Cistern | the Reliquary | **The Miser**, **The Salvor** |
| 3 | Ledger Archive | the Cipher | **The Notary**, **The Bailiff** |

Rooms created before boss pools (`bossVersion` missing) keep two floors, the
Collector then the Miser, floor two opening in the Cistern and closing in the
Archive, and the same draws from the dice (`tests/floors.test.ts` pins them).

## What a boss is for

`GAME_DESIGN.md` already says it: a boss fights *for* something, not merely
harder. The roster below takes a second rule from how Capcom's designers
describe Monster Hunter's large monsters, as principles, never as creatures,
moves or looks:

1. **One idea, seen as a cycle.** Each boss is two words the party watches
   repeat across rounds (Nergigante was conceived as "destruction and
   regeneration", and early drafts were rejected for not showing the cycle).
2. **The tell is the mechanic.** The part of the rig that moves when an intent
   is announced is the part the party answers. Intents already announce every
   move; a boss's signature must be readable from its intent chip and its
   drawing alone.
3. **Breaking a part changes the fight**, not only the damage: it takes a
   family of intents away or turns them on the boss.
4. **Nothing takes a turn away.** Stuns, roars and "skip your action" are dead
   time for a human at a table of four. A boss costs actions; it never
   cancels them.
5. **Answers are shared.** Every objective has more than one class that can
   answer it, and a duo can answer it without abandoning the boss.

What does not translate: real-time dodging, facing, hunts that are health
sponges, and upkeep chores that repeat every round.

## The objective machinery

Everything below is content, read by the engine; no boss is named in engine
code.

- `EnemyDef.lair` names the boss chamber. `targets: "wealthiest"` and `hoard`
  are the Collector's and the Miser's old id checks, now fields.
- `floors` in `content/floors.ts` lists each floor's region, mentor tier and
  boss pool; `validateContent()` requires every pooled id to be a boss with a
  lair, and no boss on two floors.
- Objects (`object: true`) are enemies that never block a clear and give no
  kill charge: the Strongbox, and the objects the new bosses spawn.

## Difficulty: enemies hit harder

A playtest note said wins came too easily and asked too little strategy.
Every enemy damage effect in a three-floor room is multiplied by
`ENEMY_HIT = 1.3` (`engine/combat.ts`), scoped effects included; rooms from
before boss pools keep the old numbers. Damage, not health, is the lever: a
harder hit makes reading intents, interrupting and intercepting worth more,
where more health only makes a fight longer and meets the escalation clock.

Measured with `scripts/simulate.ts 6 --matrix --sample=4` (122 compositions,
732 runs each). "Tactical" reads intents; "attack" only attacks.

| Build | Tactical 2p / 3p / 4p / all | Attack, all |
| --- | --- | --- |
| three floors, ×1.0 | 91 / 91 / 91 / **91%** | 26% |
| ×1.15 | 76 / 86 / 84 / **84%** | — |
| ×1.3 | 65 / 77 / 78 / **77%** | 13% |
| ×1.3, Notary retuned (shipped) | 59 / 72 / 70 / **70%** | — |
| ×1.4, Notary retuned | 50 / 68 / 60 / **61%** | 6% |

At ×1.3 alone the floor-three boss took only 5–7% of losses: a party that
reaches it carries three mentors' paths. The Notary was retuned so the last
floor is a finale — 200 HP (was 170), seals of 34 (26) enforcing 12 (8), and
Countersign 24 (18) — which puts 14–30% of losses on floor three. Duos trail,
as they did on two floors (85% against 95%): a duo has no spare action to
answer an objective with.

Confirmed on every 2nd composition, 8 seeds (1,944 runs each): tactical
**72%** (62 / 73 / 73), attack **9%**.

The harder hit also widens the class spread, and that is the next problem,
not a solved one. Parties with a Warden win 97% against 60% without; with a
Vanguard 86% against 65%; with a Reaver 54% against 81%. Healing and
interception are worth more when every blow is heavier, and the Reaver, which
pays health for damage, is worth less. The handoff already named the Reaver
as the outlier on two floors (84% against 95%); ×1.3 more than doubles that
gap.

## Class balance under the harder hit

The harder hit widened the class spread, so the Reaver and the Warden were
rebalanced. Win rates are "parties with the class" against "parties without",
every 2nd composition, 8 seeds, tactical bot.

**A measurement bug first.** The tactical bot counted the Reaver's own blood
price as damage to the target, and paid it at any health. Fixed in
`scripts/policy.ts`: a self-inflicted hit is not damage dealt, and a price is
only paid while the caster keeps a quarter of its health after the round's
incoming damage. That alone moved the Reaver from −27 to −16.

**Reaver** (−16 → −1): 118 HP (105), Guard 2 (1); Blood price costs 8 HP (12);
Frenzy costs 5 (8); Rend heals the Reaver 6. Health and guard alone reached −10,
cheaper prices −6, and the heal on Rend closed it — the class earns back what
it bleeds. Paths and upgrades keep their own numbers; the Butcher's Butchery
still costs 8 and the Guarded Frenzy 4, now less of a discount.

**Warden** (+34 → +29): Mending roots heals 28 (32) with 3 Regeneration (4);
Green Reckoning heals 12 (18) with 2 Regeneration (3). The Warden's lead barely
answers its own numbers: halving Mend's Regeneration, or making Mend wait two
rounds, each moved it by a point or two. A party without a Warden wins about
the same whatever the Warden does, so the lead is the value of having a healer
at all, and the next lever is sustain for the classes without one, not a
harder Warden nerf.

**Difficulty by party size.** The Reaver's buff raised the overall rate, and
×1.4 for everyone brought it back but dropped duos to 48%. Enemies now hit
×1.3 against duos and ×1.4 against trios and quartets (`ENEMY_HIT`).

| | 2p | 3p | 4p | all | attack bot |
| --- | --- | --- | --- | --- | --- |
| shipped | 64% | 75% | 72% | **72%** | 6% |

| Class | with | without | gap |
| --- | --- | --- | --- |
| Warden | 91% | 62% | +29 |
| Vanguard | 86% | 65% | +21 |
| Beguiler | 81% | 67% | +14 |
| Broker | 70% | 73% | −3 |
| Reaver | 71% | 72% | −1 |
| Arcanist | 68% | 74% | −6 |
| Ranger | 67% | 75% | −8 |
| Herald | 61% | 78% | **−17** |

The Herald is now the weakest class, and the next one to look at.

## The Notary — Ledger Archive

**Two words: witness, enforce.** The Notary presses its seal into the room.
Each wax seal is a signature waiting to set; when they set, every one of them
is enforced on the party at once. Breaking the wax before it sets turns the
pressing back on the Notary.

- **Pressing** (a WINDUP, so it can be interrupted outright): three wax seals
  are spawned, one in the front row and two in the back, each an object with a
  **fuse of 3**. A Notary that already has seals standing strikes instead.
- **A seal's intent** is its clock: `Sets in 2`, `Sets in 1`, then
  `Enforce the signature`, which strikes every standing hero. The seal is
  spent when it enforces.
- **Breaking a seal** cracks it back up the Notary's arm (8 through armour).
  Breaking **every** seal of one pressing staggers it: its announced action
  this round is lost (applied as a status, because an interrupt only reaches a
  WINDUP) and it is Vulnerable for two rounds. Spent seals do not count as
  broken.
- **Phase two**: a fourth seal, and a fuse of 2.

The party's answer is to split its damage across both rows for two rounds, or
to interrupt the pressing before any wax lands, or to take the enforcement
with Barrier up and spend the rounds on the Notary. Principles: timed
breakable nodes (Monster Hunter's afflicted cores), and a WINDUP the party can
see coming.

## The Assayer — Ember Foundry

**Two words: heat, pour.** A smelting construct heats a crucible across
rounds and pours it down a row. The pour is not an interrupt's to stop: enough
damage in the round it is announced cracks the crucible, and the metal goes
over the Assayer instead. Principle: a charged state that damage knocks out
(Monster Hunter's charged monsters losing their charge to a damage threshold).

- **Rotation**: Heat the crucible (Heat 1, 6 Barrier) → Tongs 22 → Bring it to
  the pour (Heat 2) → **Pour the crucible**: 34 down a row with Burn 4.
- **Cracks** (`Ability.cracks`): if the Assayer takes **16 × heroes** damage,
  Barrier included, between the announcement and its turn, the pour is lost
  and the crucible spills on it — 24 through armour, Burn 6, Vulnerable 2, and
  its Heat gone. Only that round's damage counts (`Enemy.taken`, reset when
  intents are announced).
- **Wet quenches**: while the Assayer is Wet, half that damage cracks it, so
  the Warden's and Arcanist's Wet is a setup the party can bring to it.
- **The chip** reads `CRACK AT 32` with the pour's damage and row; the rig
  holds the crucible up through the round like a wind-up.
- **Phase two**: Heat twice as fast, Slag spit 18 over a row, and a pour of 40
  with Burn 6 that takes 20 × heroes to crack.

The party's answer is to spend the round of the pour on the Assayer — every
hero, Ultimates, Exploits and Chain Shock — or to step the threatened row out
of the pour's lane and take it on Barrier.

## The Salvor — Drowned Cistern

**Two words: encrust, shed.** The Salvor is plated in the drowned goods it
claims, and a plate regrows every round. A fresh plate is soft and breaks for
a stagger; a plate left to harden becomes Barrier and fuels a volley.
Principle: regrowth that rewards breaking a part while it is soft.

## The Bailiff — Ledger Archive

**Two words: serve, collect.** The Bailiff serves a Lien on one hero with a
visible countdown. Hitting the carrier sets it off early; a cleanse removes
it; the carrier can sign it over into the Bailiff's lane, where the Bailiff's
own attack sets it off. Principle: a delayed detonation the party can turn
around.
