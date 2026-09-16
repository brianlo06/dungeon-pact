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

## The Notary — Ledger Archive

**Two words: witness, enforce.** The Notary presses its seal into the room.
Each wax seal is a signature waiting to set; when they set, every one of them
is enforced on the party at once. Breaking the wax before it sets turns the
pressing back on the Notary.

- **Pressing** (a WINDUP, so it can be interrupted outright): three wax seals
  are spawned, one in the front row and two in the back, each an object with a
  **fuse of 3**. A Notary that already has seals standing strikes instead.
- **A seal's intent** is its clock: `Setting · 2`, `Setting · 1`, then
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
rounds and pours it down one lane. Enough damage to the crucible while it is
heating cracks it and spills the metal on the Assayer; a Wet crucible
quenches. Principle: a charged state that damage knocks out.

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
