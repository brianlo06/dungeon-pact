# Foreclosure — Broker

**The idea, in one sentence:** the Broker weighs whatever the enemy is standing
behind against one coin of its own, finds it worth less, and repossesses it —
knocks it off the enemy with the ledger and pays it out, re-minted, as the
party's Barrier.

Only the Broker could have it. The brass balance it holds out in every round,
with a coin always in the pan, is the whole film: an appraisal, a weighing, and
a coin left spinning on the brass until it lies flat. The ledger that comes
over its cap in a leveraged strike is the blow. Its class line — *everything
has a price* — is the plot, and the epithet is the joke: *collateral is
whatever you were standing behind*.

## Gameplay purpose

`ultimate-defs/broker.ts`, unchanged: strip the target's Barrier, 26 damage,
Vulnerable for 2 rounds; +30 team gold; every ally (the Broker too) +8 Barrier.
It is a Broker turn at its best — Liquidate, a Leveraged strike and an
Underwrite at once — and its point for the party is the *transfer*: a guard
leaves the enemy and arrives on them.

The film has three results to show and shows each where it happens:

1. **The seized Barrier.** The enemy's collateral — a tarnished disc with a
   lock in it, standing in front of it — is weighed, then knocked off at the
   blow and flung back towards the Broker, shedding coin.
2. **The blow.** The ledger (or whatever the Broker really holds) comes down on
   the target; the damage is revealed on the drawn frame, and the price tag
   the Broker hung on it tears — Vulnerable.
3. **The proceeds.** On the real battlefield the coin arcs from the target to
   every real party member and to the treasury, and each lands as a minted
   disc with the Broker's mark on it: the Barrier, revealed as it lands.

## Space, palette, sound

- **Space:** the Broker's repossession vault — a counting house after hours.
  Shelves to the ceiling of everything it ever foreclosed on (shields, helms,
  a crown, a cartwheel, a lute, a door), every piece hung with a paper tag, one
  banker's lamp with a green glass shade over a green baize floor. Not a hall
  of light, a forge, a storm, a wood, a mirror hall or a causeway: a storeroom
  of other people's guards.
- **Palette:** bottle green and ink; brass (`#f3d487`) is the only warm thing
  and belongs to the Broker; cream tags; one oxblood red for the tag string and
  the tear. The two-tone frame is brass and ink.
- **Motif:** struck coins — four notes (C, E♭, D, then G a fifth below), short,
  short, short, long: a pleased *tut-tut*. Inharmonic partials so it rings like
  metal, not like a bell.
- **Signature sound:** a coin spun on brass, whirring faster and lower as it
  wobbles down, then silence when it lies flat (Euler's disk). It is the quiet.
- **Impact, layered:** leather slap (transient), sub drop, brass body (a struck
  plate, inharmonic), a room thump, and a tail of coins raining.

## Rhythm

identity (the appraisal: the eyes over the spectacles; a coin flicked off the
pan) → stakes and target (the vault's great balance: the target stands in one
pan behind its collateral; the Broker's single coin drops into the other and
the target is flung up — worth less than one coin; title) → **quiet** (the
coin spins down on the brass, the face goes cold, the ledger rises out of
frame; music to 5%) → impact (the coin falls flat — cut — brass-and-ink frame,
ledger down, the collateral knocked off, the tag torn) → release (the proceeds
land on the real party as wards).

The quietest shot is the coin settling, and it ends on the sound stopping: the
loudest shot starts on the silence.

## Leaving room for the paths

The base film owns *the weighing and the repossession*. It never buys anything
(so **Magnate**'s Hostile bid can own the auction and the hammer), never
insures or signs a policy (so **Assurer** can own the cover), and never lends
or counts interest on a wound (so **Usurer** can own the loan and the
compounding). It keeps the ledger to one blow and never opens it.

## Shots — 4.22s FULL, 2.64s FAST (63%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Broker `ult:appraise` — the balance comes up to the eyes | real battlefield sinks into bottle green, bars close | brass call aura; **a price tag drops onto the real target on a red string and swings** (`foreclosure-tag`, anchored) | counter bell (`foreclosure-bell`), call; music ducks | on board | — | break the round: the target has been priced |
| 1 | Appraisal · detail | 560 (360) | high, along the beam of the balance to the spectacles, Dutch −7° → −4°, pushing in | `ult:appraise` — the balance raised level with the eyes; the Broker peers over the spectacles (brow up, eyes wide), narrows to a squint, then flicks the pan and a coin jumps; eyebrows up, pleased | vault near dark; lamp light from above, brass rim | glint on the lens; dust in the lamp light; **a coin flicked off the pan tumbles up at the lens** (`foreclosure-coin` flick) and fills the frame (`lens`) | appraising hum; spectacles click; coin flick ping | no | black 50ms | identity: the appraiser |
| 2 | Weighing · wide | 1000 (520) | wide, low push-in, slight rise | `ult:weigh` — balance held out level; its small pans tip with the great one; a satisfied nod | the vault lit: shelves of tagged collateral; the banker's lamp | the coin **falls out of the lens** and into the left pan of **the vault's great balance** (`foreclosure-balance`, geometry solved from the target's real position and size); **the target stands in the right pan behind its collateral** (`foreclosure-collateral`, hold); its tag hangs; the target's pan is flung up | coin lands (`foreclosure-drop`), beam clank; **Foreclosure motif** | **yes** — real figure, flung up (`shove`), braces (`anticipate`) | the coin across the lens (in-folder occlusion) | stakes and target; worth less than one coin; title |
| 3 | Settle · face close-up | 620 (400) | low and level on the face, over the pan rim; slow linear drift | `ult:settle` — eyes follow the coin down, brow comes down and knits, the mouth goes flat, then one corner lifts; the ledger rises overhead out of frame | vault near black, one lamp line on the spectacles; exposure falling | **the coin spinning down on the brass** in the foreground (`foreclosure-coin` spin), its wobble speeding up until it lies flat | **music to 5%**; the spinning-coin whirr (`foreclosure-spin`) that stops dead | no | cut | anticipation by subtraction |
| 4 | Foreclosure · impact | 780 (560) | medium two-shot, Dutch 6° → 2°, easing out | `ult:foreclose` (contact 0.07) — the ledger over the cap and down; face in a shout; pans flying | exposure blows out to brass then settles | **brass-and-ink two-tone frame** (70ms); the collateral **knocked off and flung back past the Broker**, flipping edge-on like a coin and shedding coin (`foreclosure-collateral` seize); a milled coin-rim ring bursts from the contact (`foreclosure-mill`); the price tag **tears** (`foreclosure-tag` tear); coins rain | leather slap + sub + brass plate + room (`foreclosure-impact`), coins raining (`foreclosure-coins`); **140ms stop**, heavy shake | **yes** — `hurt`, shoved, tilted | cut on the two-tone | impact; the collateral seized; damage; "Foreclosed!" |
| 5 | Proceeds · return | 860 (560) | battle camera | real Broker `ult:collect` — shuts the book under its arm, levels the balance, tips the cap | real battlefield, green lifting, bars open | coins arc from the real target to every real party member and to the treasury (`foreclosure-proceeds`); each lands as **a minted disc with the Broker's mark** (`foreclosure-ward`, anchored on the party, staggered); the torn tag left hanging on the target | a coin landing per ally, rising (`foreclosure-paid`), tail | on board | flash 70ms | release: the guard moved from them to us; Barrier revealed as it lands |

### Boss framing

A boss does not fit a pan built for a hound. The balance is not drawn at a fixed
size: its beam, hangers and pans are solved each frame from where the target
really stands and how tall it really is, so a boss gets a bigger pan and longer
hangers, and the camera in **Weighing** pulls back and up to take in the beam
over its head. The boss is still flung up by the one coin, only less far. In
**Foreclosure** the camera pulls back so the whole boss and its collateral are
in frame; the Broker is smaller and the shove is small: a boss is struck, not
shrunk.

### FAST

Keeps every shot but shortens them; the weighing is cut to half. The coin
across the lens, the silence and the two-tone frame all survive.

### Voice

"Now then. What's all this worth?" · "Foreclosed!" · "Proceeds to the party.
Don't spend it all at once."

## What the engine could not do, and what was built instead

- **The target's Barrier before the Ultimate.** `removeStatus` logs no beat
  and the board already stands at the result, so the film cannot tell whether
  the target had a Barrier to strip. The collateral is drawn on every target:
  the engine would need a status beat (or the pre-Ultimate statuses on the
  segment) to draw it only when it was there, at its real size.
- **An occlusion with another object.** The engine's occluder is always the
  cape, so the coin that crosses the lens between the appraisal and the
  weighing is two screen-layer effects straddling the cut (`foreclosure-coin`
  `lens` out at the end of one shot and in at the start of the next). The
  engine would need `transition.object` to render a named in-folder effect.
- **A move that starts mid-shot.** An actor's `to` eases over the whole shot,
  so the target's launch in the pan is a `shove` (which starts at its `at`),
  and the balance reads the target's real position each frame rather than
  being animated alongside it.
- **Gold has no beat.** The treasury change is not a revealable result; the
  coin to the treasury is timed with the wards, and the counter itself already
  shows the new total under the film.
