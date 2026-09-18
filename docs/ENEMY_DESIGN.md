# Enemy design

How Dungeon Pact's regular enemies are designed, how they choose what to do,
how encounters are built from them, and where Wave 1 stands. Engine details
live in `CONTENT_SYSTEM.md`; balance numbers in `BALANCE.md` and the Wave 1
section at the end of this file.

## The rule

Do not ask *what attack does this monster have?* Ask **what decision does this
monster force the party to make?** — then build its moves, its look, its intent
and its encounter partners around that answer. A creature whose only
difference is a damage number is not a new creature.

Regular fights are small cooperative puzzles: the party can see exactly what is
about to happen, and has to choose which of it to prevent. Difficulty comes
from conflicting threats, synergy, timing, target priority, position, statuses
and conditions — not from hidden dice and not from more HP.

## Factions

Each floor is a faction with its own materials, shapes, statuses and
questions. Cross-faction encounters are deliberate exceptions.

| Floor | Thinks about | Statuses | Looks like |
| --- | --- | --- | --- |
| **Ember Foundry** | armour, heat, machinery, interrupts, gold | Burn, Weak, Barrier | iron, ash, furnace orange, rivets |
| **Drowned Cistern** | Wet, pressure, movement, corrosion, plates | Wet, Vulnerable, Poison, Barrier | corroded metal, pipes, wet stone, glass tanks, brine, aquatic forms |
| **Ledger Archive** | seals, countdowns, Marks, debts, rules | Marked, Weak, Vulnerable, Debt | wax, paper, ink, bindings, seals, pale light |

The Foundry's eight creatures are the stable baseline Wave 1 is measured
against, and are unchanged. Until each new faction has simple attackers and
tanks of its own (Wave 2), its early encounters borrow familiar foundry
support — salvaged machines still working the flooded halls, clerks' guards —
so that each lesson introduces exactly one unfamiliar creature.

## Roles

Every creature carries `roles` in content, for analysis and tooling only;
nothing in combat reads them.

ATTACKER · BRUISER · TANK · SNIPER · ASSASSIN · SUPPORT · HEALER · CONTROLLER ·
DEBUFFER · SETUP · PAYOFF · SUMMONER · ECONOMIC · FORMATION · COUNTDOWN ·
OBJECTIVE · MOBILE · STATUS

Cognitive load needs contrast: keep simple attackers, tanks and ranged enemies
beside the complex ones. The interesting fights come from compositions.

## How an enemy chooses

`EnemyDef.behavior` (in rooms with `factionVersion`) is a list of **steps**,
one per round, repeating. A step is a list of **rules**; the first rule that
applies is chosen, or with `weighted` the room's seeded dice choose among all
that apply. A rule applies when every **condition** holds and at least one
unit passes its **target filter**. A step where nothing applies falls through
to the next step. `below` swaps in a second pattern under a health fraction.
The engine is `src/engine/intents.ts`; it names no creature.

| Pattern | How it is written |
| --- | --- |
| Rotation (A → B) | two steps of one rule each |
| Sequence (A → B → C) | three steps |
| Weighted | one step with `weighted: true` and `weight` on each rule |
| Conditional | a rule with `when`: `allyBelow`, `selfHas`, `treasury`, … |
| Reactive | a rule whose target filter reads hero state: `has: "wet"` → Conduct |
| Phased | `behavior.below: { fraction, steps }` |
| Ally-aware | `allyHas`, `allyBelow`, `alliesInRow`, or an ally-aimed rule with a filter |
| Target-aware | target filter `has`/`lacks`/`order` (`lowestFraction`, `highestHp`, …) |
| Economy-aware | `treasury: { atLeast }` |
| Position-aware | target filter `row`, or `heroesInRow` / `alliesInRow` |

Conditions only ask about state the whole party can see, and the only dice are
the room's seeded ones, so every choice is deterministic and, once announced,
fully visible.

## Intents must explain themselves

- Every move has a name, a target and a forecast damage figure on its chip.
- A rule may carry `why` — shown on the chip as a short tag (`WET`, `MARKED`,
  `BACK ROW`, `BRAM WOUNDED`) and in the tooltip as *Chosen because …*. Give one
  to every rule that reacts to something the party could change.
- Riders name consequences before they land: `pulls to front`, `Wet 1`,
  `+20 if Marked`, `chains 12 if Wet`, `sets sentence seal`, `Debt 30`.
- A bonus the target already qualifies for is included in the damage figure.
- Countdown objects count down in their own intent name (`Passes in 2`).
- A move that breaks under damage shows `CRACK AT n`.

If a synergy cannot be read from the chips before the round resolves, redesign
it.

## Synergy rules

- A synergy is two readable halves: a **setup** that changes visible state
  (Wet, Marked, a pull, a plate) and a **payoff** that visibly reacts to it.
- Every synergy has at least two answers among: kill the setup, kill the
  payoff, interrupt, cleanse, reposition, guard, break an object.
- Setups should be fragile enough to be a real choice, and paired with a
  threat that competes for the same actions — never so weak they are always
  target #1, never so strong they are never worth answering.
- Setup-payoff timing must fit the fight: a regular fight lasts three to four
  rounds, so a clock longer than two rounds rarely resolves (see Wave 1).

## Rows

New creatures use both rows actively: pull a hero forward (Pressure Maw), move
allies (Dredger), shift their own row out of melee reach (Margin Stalker),
strike only a named row (Crushing jet). Heroes start in the back row except the
front-line class, and enemies aim at the front row by default, so pulling a
back-liner forward is itself a synergy with every front-row attack.

## Objects

Boss objects taught the pattern; regular creatures use it sparingly, and only
as objectives:

- **Soft Plate** (Plate Tender) — set on an ally, hardens in two rounds; broken
  soft it leaves its host Vulnerable. The Salvor's plates, in miniature.
- **Wax Sentence** (Seal Scribe) — bound to a hero, passes on them in two
  rounds; breaking it hurts the Scribe; killing the Scribe crumbles it. The
  Notary's seals, one at a time.

## Encounters

Encounters are authored, never random soup. Each has a **tactical sentence** —
if the formation's interest cannot be said in one line, redesign it — a
**tier** on the floor's complexity curve, and a line-up for each party size
that deepens the interaction rather than inflating it.

| Tier | Where | What it asks |
| --- | --- | --- |
| 1 | the floor's first fight | one new mechanic, familiar support |
| 2 | the second fight | a different new mechanic |
| 3 | mid floor | two mechanics the floor has taught, combined |
| 4 | late floor | a synergy |
| elite | elite chambers | an elite creature's puzzle, or a late synergy with traits |
| boss | the vault | everything |

`chooseEncounter` draws the highest tier the chamber's depth allows
(`CURVE = [1, 2, 2, 3, 4, 4]`) that the run has not fought, falling back down
the curve before it repeats.

Duos have no spare actions to answer a synergy with: their line-ups are
designed separately (usually one mechanic and one simple partner), and every
change is measured at 2, 3 and 4 heroes.

## Boss-teaching map

A floor's regular creatures teach small pieces of its bosses, so a boss reads
as *the advanced version of that* rather than a new rule.

| Boss | Taught by | The piece |
| --- | --- | --- |
| Collector | Foundry (Bulwark, Sniper, Bellows) | Barrier, interrupts, a valuable target |
| Assayer | Foundry (Acolyte, Bellows), Pressure Engine | wind-ups, a move that cracks under damage, Wet halving it |
| Miser | Ledger Wraith, Coin Leech | resources as pressure; choosing whether to spend |
| Salvor | Plate Tender | plates that harden unless broken soft |
| Notary | Seal Scribe | countdown seals; break them, or stop the one pressing |
| Bailiff | Ledger Wraith | a delayed debt on one hero that comes due |

## Content process

Mechanics are validated before art is spent on them:

1. **Mechanical prototype** — content only, placeholder art, unit tests per
   rule.
2. **Simulation** — `scripts/simulate.ts --telemetry` at 2, 3 and 4 heroes.
   Before tuning an inert mechanic, check that the bot understands it, that
   the encounter creates the situation, and that the probe counts it.
3. **Battle Lab** — basic authored rig and choreography; captures.
4. **Human playtest** — the questions in the brief: what did you fear, what did
   you kill first, did you read the seal, did Wet → Conduct register, did rows
   matter, was anything annoying rather than hard.
5. **Final art and polish.**

## Enemy matrix

| Enemy | Floor | Roles | Row | Pressure | Defence | Status | Movement | Economy | Setup / payoff | Teaches | Partners |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cinder Stoker | Foundry | ATTACKER | front | medium | low | — | — | — | — | — | anything |
| Iron Bulwark | Foundry | TANK | front | medium | high (Barrier) | — | — | — | — | Barrier | back-row setups |
| Ash Acolyte | Foundry | ATTACKER | back | row wind-up | none | Burn | — | — | — | interrupts | Bulwark |
| Kiln Mender | Foundry | HEALER | back | low | low | — | — | — | — | priority | anything sturdy |
| Slag Hound | Foundry | ATTACKER | front | high burst | none | — | — | — | — | — | Pressure Maw |
| Rivet Sniper | Foundry | SNIPER | back | high wind-up | Barrier | — | — | — | — | interrupts | Bulwark |
| Coin Leech | Foundry | ECONOMIC | front | low | low | — | — | steals gold | — | Miser | Ledger Wraith |
| Living Bellows | Foundry | ATTACKER | back | row wind-up | Barrier | — | — | — | — | wind-ups | — |
| **Pressure Maw** | Cistern | CONTROLLER, BRUISER, SETUP | front | row blast | medium | Wet | pulls heroes forward | — | setup (pull, Wet) | — | Hound, Eel |
| **Sluice Eel** | Cistern | SETUP, PAYOFF, STATUS | back | chain | low | Wet | — | — | both (Soak → Conduct) | Assayer's Wet | Maw |
| **Plate Tender** | Cistern | SUPPORT | back | low | builds armour | Encrusted, Vulnerable | — | — | setup (plate) | **Salvor** | Bulwark, Maw |
| **Dredger** | Cistern | FORMATION, TANK | front | medium | medium | — | moves allies | — | — | — | Hound, Tender |
| **Pressure Engine** (elite) | Cistern | OBJECTIVE, COUNTDOWN, BRUISER | front | party-wide vent | high | Pressure | — | — | self (builds, vents) | **Assayer** | Eel |
| **Seal Scribe** | Archive | COUNTDOWN, SETUP | back | delayed | low | Weak | — | — | setup (sentence) | **Notary** | Stalker, Bulwark |
| **Ledger Wraith** | Archive | ECONOMIC, COUNTDOWN | back | delayed | medium | Debt | — | gold or blood | setup (debt) | **Bailiff**, Miser | Leech, Indexer |
| **Indexer** | Archive | SETUP, DEBUFFER | back | low | none | Marked, Vulnerable | — | — | setup (Mark) | — | Stalker |
| **Margin Stalker** | Archive | ASSASSIN, MOBILE | shifts | high precision | Barrier on shift | — | shifts own row | — | payoff (Mark) | — | Indexer |

Gaps this reveals for Wave 2: no simple Cistern or Archive attacker or tank; no
creature applies Poison or Confused; no creature reacts to the treasury; no
heal-interacting creature (the Reservoir Parasite's space); no rule-setting
elite (the Arbiter) or commander (the Foreman).
