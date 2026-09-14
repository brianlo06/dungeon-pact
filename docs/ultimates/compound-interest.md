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

Tests: `tests/ultimates-compound-interest.test.ts` (5): it replaces Foreclosure
and strips and shields nobody; the principal through Guard, the Poison, the
cut and the first collection, Regeneration on every hero and none on the
enemy, the self-heal and the Credit; three debts on the field pay three
times without striking the others; one enemy carrying two debts pays twice;
resolved as an Ultimate, the film is handed the target, the Poison ticks and
the pact regenerates on the same round-end beat.

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
| 2 | The sink · wide | 940 (480) | wide, level, a slow push and truck right | `ult:usury-offer` — holds the bitten coin out at arm's length, weighing nothing, and looks at the target over the spectacles | the sink lit: crusted walls, drips, the shingle floor, the borrowers held in the crust | the crust *stirs* — a ripple of lit coins runs round the rim of the hole from the Usurer's side to the target's, over the roof and along the floor (`usury-stir`); a glint on the coin | **the motif**; the stir (`usury-stir`, a dry ripple of clicks) | **yes** — real figure on the shingle, braces | cut | stakes: everything in here was one coin once; title |
| 3 | The loan · over-the-shoulder | 520 (320) | close on the Usurer's hand and the target's flank, Dutch −6° → −3°, pushing in | `ult:usury-press` — steps in and presses the coin home with the thumb, like a nail, and holds the press | the sink; exposure falling | the coin carried in on the hand and seated (`usury-coin`, `mode: press`), a ring of copper light where it goes | the press (`usury-press`): a dull push, a copper scrape, the seat | **yes** — flinches (`hurt`), a small shove | crust across the lens (in-folder occlusion, `usury-creep`) | the loan made; it is far too small to be worth flinching at |
| 4 | Interest · extreme close-up (the quiet) | 560 (360) | macro on the seated coin, dead still, no move at all | — (the target holds; the Usurer is out of frame) | the sink, near black; one copper line along the coin's rim; exposure 0.3 → 0.16 | the first budding: the coin splits, and the two split (`usury-brood`, `mode: quiet`, two generations) | **music to 4%**; one tick (`usury-tick`), a pause, two, then four | **yes** — held | cut | the quiet: interest, at the size of a boulder |
| 5 | Called in · impact | 780 (560) | medium on the two of them, Dutch 5° → 1°, easing out | `ult:usury-call` (contact 0.13) — the hand comes off the target and shuts at the chest, and the whole round body rocks back with the shout | exposure blows out to copper and settles; a pool of copper light behind the target (`usury-glow`) so the drawn frame cuts both silhouettes | **copper-and-soot two-tone** (70ms) at 0.13; a wave of shingle runs from the fist to the target's feet (`usury-rush`); from the seat of the coin the crust doubles nine times in the 90ms before the frame and stands full on it (`usury-brood`, `mode: run`, 1023 coins); coins thrown off it (`usury-spill`); a copper shockwave | the runaway (`usury-run`) into the layered impact (`usury-impact`); **150ms stop**, heavy shake | **yes** — `hurt`, driven down and tilted | cut on the two-tone | impact: the debt is called and it covers them; damage; "And it compounds!" |
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

## Films merged while this was authored

Checked before locking the space and again before the final captures: since
the base commit, **A Good Hiding** (Reaver · Ironhide) merged — a tannery loft,
hanging hides, a blow absorbed into the body and given back. Nothing here
touches it: no loft, no hide, no blow taken; the Usurer never strikes and is
never struck.

## Notes from the lab

- **The balance stays down.** The Broker always holds its balance out; in every
  cinematic shot here `scales` is turned 66–70° so it hangs at the hip, because
  the weighing is Foreclosure's. The first cut turned it 18° and the balance
  sat in every frame at chest height.
- **The arm does not reach the mouth**, so the head comes down to the coin
  (`head` 18° at the bite) and the coin goes up the last inch between the
  lips edge-first (`usury-coin` `lipX`/`lipY`), which is what makes the bite
  read: with the coin flat at the chin it looked held, not bitten. The bite
  is framed on the jaw, the eyes screwed shut and the brows on the rims; the
  mouth itself is under the coin for the four frames of the bite and comes
  out of it spreading.
- **Every coin there is splits.** The first tree let only the newest coins
  bud, so nine "doublings" made ten coins. Corrected, nine doublings are 1023
  coins, and the crust on the drawn frame is a mass with one ink edge (edge
  path under, fill over) rather than a thousand rings. The bite notch is drawn
  only on coins wider than 24px on the impact and 3px in the quiet, so the
  quiet reads as a coin becoming three and the impact as a crust, not a rash.
- **The crust is placed on the body from probes**: the hound's `body` part is
  1030–1335 × 652–816 world in the impact shot; the brood's bounds are that
  ellipse, relative to the seat of the coin, so the legs, tail and jaw stick
  out of it. On the Collector the bounds are its red body, and it is buried to
  the shoulders.
- **The two-tone frame** cut everything to shadow until a copper pool
  (`usury-glow`) was put behind the target; on that frame the crusted target
  and the Usurer are two silhouettes against copper.
- **The sink is built round the wide shot.** The first hole was 3120 wide and
  the wide saw only a haze with crust at the edges; it is now 1320 × 820
  about (800, 520), so the roof, both walls and the shingle are all in the
  frame at zoom 1.04, and the stir runs round the visible rim.
- **Sounds were rendered offline and measured** (peaks, `OfflineAudioContext`
  in the lab page): the impact 1.32 (Foreclosure's 1.36, The Small Print's
  1.22); the motif 0.12 (0.16 / 0.16); the quiet's ticks 0.05 (Small Print's
  0.06); the bite 0.40. The clicks in the ticks and the pipes are tones, not
  noise: as noise bursts the ticks peaked at 0.29 and the drip at 0.98.
- **Profile** (`GPU=1 scripts/profile-ultimate.ts`, 1920×1080, dev build):
  film p50 16.7ms / p95 33.4ms, 7 frames over 34ms (the mount stall, max
  433ms, is the known first-frame task); the round after p50 16.7 / p95 16.8.
  Peak 642 nodes, 591 of them SVG, 4 live effects, 0 filtered elements.

## Whole-body motion

Root keys, authored for the size each clip plays at: `ult:usury-call` (a rock
back onto the heels on the contact frame: x 0.03 → −0.02, lean 3° → −7°,
squash 1.04 → 0.94, scale 1.03), `ult:usury-press` (a step in, x 0.05, lean
4°, squash 1.05), `ult:usury-offer` (the belly forward, x 0.014, lean 2.4°),
and on the board `ult:usury-open` and `ult:usury-settle`. `ult:usury-bite`
plays with `root: false` (its root barely moves anyway: lean 1.2°, y 0.004).
Nothing moves `.cine-look`.

## What the engine could not do, and what was built instead

- **An occlusion with another object.** The occluder is always the cape, so
  the crust growing over the lens is two screen-layer cues of `usury-creep`
  straddling a plain cut (`out` at the end of the sink, `in` at the start of
  the loan). The engine would need `transition.object` to render a named
  in-folder effect.
- **An enemy that only pays is not in the cast.** The collection reaches every
  enemy carrying a debt, but gold has no beat and a status on the *party* is
  not a target, so only the struck target is cast; the film cannot show which
  other enemies paid. The engine would need a beat for gold, or the segment to
  carry the enemies a scoped effect touched.
- **Gold has no beat.** The treasury's cut is the coins dripping off the crust,
  timed by the return shot rather than revealed; the counter under the film
  shows the new total.
- **Regeneration has no beat.** `reveal: "ward"` covers Barrier and healing
  only, so the party's Regeneration is drawn (`usury-dividend`, one ring per
  round) rather than revealed, and the film cannot draw more rings for a
  party paid on three debts than on one. The engine would need status beats on
  allies, or the stacks on the segment.
- **Poison has no beat either.** The crust left on the real target is drawn on
  every target, whatever the round does with it; the status chip under the
  target is what the player reads.
- **A clip plays at one rate in FULL and FAST.** The quiet's ticks are separate
  `sound` cues, two of them FULL-only, so FAST keeps one, two, then two.
- **A self-lit two-tone.** The accent is a grayscale-and-contrast filter over
  the film, so a dark space goes entirely to shadow; the copper pool behind the
  target is a plain gradient div in the film's own layer, not a light.
