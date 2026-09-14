# Compound Interest — Broker · Usurer

**The idea, in one sentence:** the Usurer bites a copper to mark it as its own,
presses it into the wound it has just opened like a nail, and lets it breed —
coin begetting coin on the target until the debt has covered it, because
everything in the Usurer's world, including the walls of the place it keeps,
was one lent coin once.

Only the Usurer could have it. The path's title is the plot — *every wound is
somebody's asset* — and its kit is the Tithe: a blow that earns and heals at
the same time. The base Broker seizes and settles inside the round; the Assurer
buys cover and spends; the Usurer *lends*, and lending is the one money act
that is not finished when it happens. The drawing supplies the instrument: the
three coin pouches strung on the belt that nothing else in the films has used,
and the heaviest jaw in the party. The mark on the loan is the Usurer's own
bite, and every coin that breeds out of it carries the same tooth-notch in its
rim, so the crust on the enemy is legible as *its* money from the first frame.

## Gameplay purpose

`ultimate-defs/brk-usurer.ts`, target enemy, cost 100, speed 11:

| | Foreclosure (base) | **Compound Interest** (Usurer) |
| --- | --- | --- |
| The target's guard | Barrier stripped | **untouched** |
| The blow | 26, Vulnerable | **20, and Poison 6 for three rounds** |
| The treasury | +30 | **+20, and +8 for every debt on the field** |
| Every ally, the Broker too | +8 Barrier | **+3 Regeneration (2 rounds) for every debt on the field** |
| The Broker | — | **heals 8**, +2 Credit |

A debt is an enemy that is **Poisoned, Burning or Vulnerable**, counted once
per affliction, so an enemy carrying two pays twice. The Poison the Ultimate
has just written is itself the first account, so the party is always paid
something; everything above that is a wound the party opened in an earlier
round. It differs from Foreclosure in what it does and in *when* it pays:
Foreclosure is a seizure that settles at once, this is a loan that pays every
round, out of other people's injuries. The Regeneration and the Poison tick on
the same beat at the end of the round — the enemy's wound and the party's
mending are paid out of the same purse.

It is a team play in both directions. A Warden's Poison, a Pyromancer's Burn
and every Vulnerable a Vanguard, a Reaver or a Magnate leaves on the line are
all accounts the Usurer can collect on, which makes the round *before* this
Ultimate worth spending on afflictions; and the Poison it leaves is an account
the next cast collects on again. Nothing is stripped and nobody is shielded:
both halves of Foreclosure are gone.

Quick balance (`scripts/ultimate-report.ts 4 --sample=6`, 324 runs, same
machine), against the same sample with this path still `null` (on Foreclosure):

| Win rate | off | on, baseline (stub) | **on, Compound Interest** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 79% | 79% |
| 3 players | 94% | 95% | 95% |
| 4 players | 92% | 93% | 93% |
| all | 91% | 93% | **93%** |

Nothing moves. Broker uses per run 2.35 before and after; charge earned 259 →
260; Ultimates per boss fight 6.93 either way.

Tests: `tests/ultimates-compound-interest.test.ts` (5).

## Space, palette, sound

- **Space: the sink.** A limestone swallow-hole under the dungeon where the
  Usurer's old loans have gone on breeding: the walls crusted with bitten
  coppers the way a hull is crusted with barnacles, thickest in the hollows;
  fused drips of coin hanging from the roof where the crust has run; a floor of
  loose coin shingle that slides underfoot; and, held in the crust, the shapes
  of earlier borrowers — a shoulder, a horn, a hand — still paying. Nothing
  here was ever stored: it grew. Not a hall, a forge, a storm, a wood, a vault
  of shelves, a page, a ridge, a causeway, a theatre, a spillway, a meadow, a
  mud run, the ground under the floor, a mirror room, a no-man's-land, a mere,
  a labyrinth, a pit, a stopped chamber, white roofs or a snowfield.
- **Palette:** soot `#0e0a08`, tarnished copper `#5a3524` and old crust
  `#7a4a2c`, one deep verdigris `#3f6b5e` in the oldest hollows, and **raw
  copper `#e08a3c`** — the accent — kept for the new coin and for every coin
  bred out of it, with a hot rim `#ffd9a0`. No brass, no bottle green, no
  cream, no ink-and-paper: the counting house is the base film's and the policy
  the Assurer's.
- **Signature effect — money that breeds.** A lent coin has a crescent
  tooth-notch bitten out of its rim. It buds: it splits, and its children
  split, so the debt doubles where it sits and spreads outward in generations
  from the place it was pressed in. The same drawing is the quiet (one coin
  becoming two), the impact (the whole runaway, a crust over the target) and
  the space itself (the walls are what it looks like after years).
- **Motif (original):** four notes on a dry stopped pipe — D3, F3, A3, D4 —
  where each note is *split* into a group of repeats, and the group doubles:
  one, two, four, eight, the last spraying into the impact. Compounding as a
  rhythm. Not struck coins (Foreclosure), not plucked nib-clicks (The Small
  Print), not a horn, a music box, a wooden bar or a reed.
- **Signature sound:** the bite (`usury-bite`) — a tooth closing on soft metal:
  a dull click with a bent ring under it, the ring's pitch dropping as the
  metal gives.
- **The quiet:** the tick (`usury-tick`), a single new coin budding off the
  first. Music to 4%; one tick; a pause the length of the first; two ticks;
  four, and the cut lands on the fourth.
- **Impact, layered:** a coin-clatter transient, a sub drop, a dull metallic
  mass (a chest of coppers dropped on stone) and a tail of shingle sliding
  back down the sink.

## Rhythm

identity (the bite: the Usurer marks the coin with its own teeth) → stakes and
the space (the sink, and the target standing in the middle of everything that
was lent before it; the crust stirs when it sees the new coin; title) → the
loan made (the coin pressed home with a thumb, like a nail; the target flinches
at something too small to matter) → **quiet** (the coin in the wound, alone,
still — one tick, and there are two) → **impact** (the Usurer closes its fist,
the doubling runs away, and the target goes down under its own debt) → release
(the real board: the crust still budding on the target, and the pact paid).

The quietest frame in the film is one coin at the size of a boulder; the
loudest is a thousand of them. That is the whole film: the same drawing,
sixteen doublings apart.

## Shots — FULL 4620ms, FAST 2860ms (62%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera on the caster | real Broker `ult:usury-open` — the ledger hand goes to the belt and works a pouch open | real battlefield sinks to soot; bars close | copper call aura; one bitten copper rises out of the pouch (`usury-purse`, anchored on the caster) and a second is already standing on the real target (`usury-served`, anchored) | `usury-open` (a drawstring, coins shifting), call; music ducks | on board | — | break the round: somebody is about to be lent something |
| 1 | The bite · face close-up | 600 (380) | tight on the jaw and the hand, Dutch 7° → 4°, pushing in | `ult:usury-bite` (`root: false`) — the coin comes up to the mouth, the jaw closes on it, the brows come down onto the rims and knit, the eyes narrow; then it is held off and the mouth spreads | the sink, near dark; copper under-light off the crust; hot rim | the coin between the fingers, turning, and the notch left in its rim (`usury-coin`, `mode: bite`); coin-scale motes | **the bite** (`usury-bite`); a breath through the nose | no | black 60ms | identity: the lender's mark is its own teeth |
| 2 | The sink · wide | 940 (480) | wide and low, slow truck right and a small rise | `ult:usury-offer` — holds the bitten coin out at arm's length, weighing nothing, and looks at the target over the spectacles | the sink lit: crusted walls, fused drips, the shingle floor, the shapes held in the crust | the crust *stirs* — a wave of coins turning edge-on to the new coin runs across the walls away from the Usurer (`usury-stir`); shingle dust | **the motif**; the stir (`usury-stir`, a dry ripple of clicks) | **yes** — real figure on the shingle, braces | cut | stakes: everything in here was one coin once; title |
| 3 | The loan · over-the-shoulder | 520 (320) | past the target's flank and down onto the Usurer's hand, Dutch −6° | `ult:usury-press` — steps in and presses the coin home with the thumb, like a nail, and holds the press | the sink; exposure falling; the target's flank fills the left of the frame | the coin driven in and seated (`usury-coin`, `mode: press`), one bead of copper light where it goes | the press (`usury-press`): a dull push and a copper scrape | **yes** — flinches (`hurt`), a small shove | crust across the lens (in-folder occlusion, `usury-creep`) | the loan made; it is far too small to be worth flinching at |
| 4 | Interest · extreme close-up (the quiet) | 560 (360) | macro on the seated coin, dead still, no move at all | — (the target holds; the Usurer is out of frame) | the sink, near black; one copper line along the coin's rim; exposure 0.3 → 0.16 | the first budding: the coin splits, and the two split (`usury-brood`, `mode: quiet`, two generations) | **music to 4%**; one tick (`usury-tick`), a pause, two, then four | **yes** — held | cut | the quiet: interest, at the size of a boulder |
| 5 | Called in · impact | 780 (560) | medium low on the target, Dutch 5° → 1°, easing out | `ult:usury-call` (contact 0.06) — the fist closes and the whole round body rocks back with the shout | exposure blows out to copper and settles; copper back light behind the target | **copper-and-soot two-tone** (70ms); a wave of shingle runs from the fist to the target's feet (`usury-rush`); the crust floods over the target in doubling generations and stands full on the drawn frame (`usury-brood`, `mode: run`); coins thrown off it (`usury-spill`) | the runaway (`usury-run`) into the layered impact (`usury-impact`); **150ms stop**, heavy shake | **yes** — `hurt`, driven down and tilted | cut on the two-tone | impact: the debt is called and it covers them; damage; "And it compounds!" |
| 6 | Paid · return | 820 (520) | battle camera back to neutral | real Broker `ult:usury-settle` — pats the pouch shut and tips the cap | real battlefield; soot lifting; bars open | the crust left on the real target, still budding slowly (`usury-brood`, `mode: board`, anchored); coins drip off it onto the floor (`usury-drip`); at every real hero a copper ring rises, and a second behind it — one for each round of the Regeneration (`usury-dividend`, anchored on the party, staggered) | coins dripping (`usury-drip`), the party's cut (`usury-dividend`), tail | on board | flash 70ms | release: the debt still running where it matters, and the pact paid |

### Boss framing

A boss is not pressed in the flank: in **The loan** the camera and the Usurer
drop to the leg, and the coin is seated there. **The sink** pulls back and up so
a boss stands under the fused drips rather than through them, and in **Called
in** the camera pulls back to hold the whole boss with the crust running up it
from the ankle, the shove small: a boss is buried, not shrunk. The brood's
spread is solved from the target's real drawn height, so the crust covers a
hound and a Collector alike.

### FAST

Every shot survives, shortened; the wide is cut to half. The bite, the quiet's
first budding and the two-tone frame are all in FAST, and the quiet keeps its
ticks (a shorter `usury-tick-fast` count).

### Voice

"A little something on account. You'll hardly feel it." · "And it compounds!" ·
"Every round that hurts, the pact gets paid. Terms are terms."

## What the engine could not do, and what was built instead

(Filled in as the film was built; see the end of this file.)
