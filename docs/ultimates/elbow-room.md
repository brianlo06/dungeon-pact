# Elbow Room — Reaver · Butcher

**The idea, in one sentence:** the Butcher is standing in the Shambles, the
butchers' lane so narrow its upper storeys nearly touch, with the enemy row
packed across it wall to wall — and it swings anyway: one flat swing wider
than the street, that bites both walls and sweeps the whole row back down the
lane.

Only the Butcher could have it. The path's title is the plot: *Wider swings.
Fewer problems.* It traded Frenzy for Butchery (tear a whole enemy row) and
took +4 power: it no longer aims. The drawing supplies the rest: the cleaver is
"far too big to carry properly", so it is dragged — a blade that was never
going to fit anywhere, let alone a lane where you could not swing a cat. And a
butcher's street is where the Butcher is at home. Every other Reaver film is
about what the Reaver pays or keeps (Red Ledger's blood stroke, A Good
Hiding's dent, Give and Take's blood running both ways). This one is about
room, and nothing is paid.

## Gameplay

`ultimate-defs/rvr-butcher.ts`, target an enemy row, cost 100, speed 6:

1. every enemy in the row takes **30** (39 at the Butcher's power, before
   Guard), all alike;
2. every one of them is **knocked into the back line**;
3. any of them already **Vulnerable** has its **WINDUP broken** (and takes the
   blow a quarter harder, as anything Vulnerable does);
4. **+2 Fury**.

| | Red Ledger (Reaver) | **Elbow Room** (Butcher) |
| --- | --- | --- |
| The price | loses 14 HP | **nothing** |
| The target | 40 through armour | 30, like everyone else in its row |
| The row | 12 to the rest | **30 to every one, and knocked into the back line** |
| Windups | — | broken on anything already Vulnerable |
| Fury | +3 | +2 |

It differs in what it does, not only in numbers: Red Ledger is a price and a
burst on one enemy; Elbow Room is a sweep that moves a formation. It is also
not Gatebreaker, the other row Ultimate that moves a row: Gatebreaker drags the
row forward into the party and makes it Vulnerable; Elbow Room throws it back
out of the way and cashes a Vulnerable that is already there.

The team play is the room it makes. A front row swept into the back leaves no
screen, so every melee hero in the party can reach every enemy from then on
(until something drags them forward again): the Vanguard's charge, the Reaver's
Rend, a Warden's staff at the sniper. And a row the party already opened —
Drag them down, Gatebreaker, Seed of doubt, Foreclosure, Sunblind — loses its
windups to it.

## Space, palette, sound

- **Space: the Shambles, at dusk.** A medieval butchers' lane. Timber-framed
  houses with jettied upper storeys that lean out over the street until their
  eaves almost meet, leaving a slit of sky; lime plaster washed in the old
  colours, dusky pink and ochre, gone dark with evening; the shop fronts shut,
  their shutters folded down into the wide plank benches butchers sold from
  (the *shambles*); empty iron hooks under the jetties; cobbles strewn with
  sawdust and a gutter down the middle. No meat anywhere: it is after the
  market. Not a hall, forge, vault, gate, pit, loft, crossroads, snowfield,
  saleroom, field, range, theatre, spillway, sink, page, meadow, mere, ridge,
  roofs, flats, burying or shedding ground, casting floor, no-man's-land,
  mirror room, labyrinth, wood or the ground under the floor.
- **Palette:** timber black `#120c0d`, washed plaster pink `#b98479` and
  ochre `#b58b4a` (both darker in the dusk), cobble slate `#2b2a33`, sawdust
  `#e4c58c`, and a dusk sky of cold green-teal; the accent **sea-glass teal
  `#5fd9c4`** is the swing itself (its wake, the call, the drawn frame). No
  crimson as a light or a mark (Red Ledger's), no iron (A Good Hiding's), no
  scarlet or garnet (Give and Take's).
- **Signature effect — the swing, wider than the street.** A flat horizontal
  sweep seen from the side is a flat ellipse, so the swing is drawn as one:
  a broad crescent of pale teal wake with ink speed-hatching, heavy at the
  blade's edge and thinning behind it, that wraps *round* the row — its far
  half drawn behind every enemy at chest height, its near half in front of
  them lower down — and runs out past both ends of the frame. Where its far
  edge meets the house fronts behind the row it tears a long level gouge out
  of the plaster the whole width of the lane; where its near edge passes the
  lens a timber post splinters; and its wake lifts the sawdust off the cobbles
  in one flat sheet.
- **The lane closing in:** on the real battlefield, the call brings the
  Shambles in over the board as two leaning house-fronts from the edges of the
  screen, narrowing it; the return pushes them back out.
- **Motif (original):** an accordion in the lane, each interval wider than the
  last — B♭2, D♭3 (a minor third up), A♭3 (a fifth up), then a swing down to
  B♭1 — the bellows opening wide. Not a drum, horn, bell, organ, saw, mallet
  on a string, whistle, music box, coins or voice.
- **Signature sound: the rattle.** The cleaver carried on the shoulder, its
  end clattering along the shutters as the Butcher walks: a stick dragged
  along railings. On the swing, a long low whump of air.
- **Impact, layered:** a wooden crack and the cleaver's chop (transient), a
  sub drop, the whump of the swing and plaster giving way (body), and a tail
  of plaster and sawdust pattering down with a shutter banging twice.
- **The quiet:** the lane cat. On a shutter bench in the dark, only its eyes
  lit; its ears go flat and it presses itself down below the line of the
  swing. Music at 3%, one drip off the eaves.

## Rhythm

identity (the close-up: a jetty beam an inch over its head, a wall at its
elbow; the brow goes up at the beam, the shoulders roll, the elbow knocks
plaster off the wall; "Bit tight in here.") → stakes (the lane from above the
eaves: the real row packed across it wall to wall, the Butcher coming up the
lane with the cleaver on its shoulder rattling along the shutters; title) →
escalation (the wind-up: the cleaver swung off the shoulder and back at full
reach until its point bites the wall behind) → **quiet** (the cat flattens) →
**impact** (a teal-and-ink frame; the swing wraps the row, gouges the far wall,
splinters the near post, throws the sawdust; the row knocked back down the
lane: "MAKE ROOM!") → release (the real board: the lane's walls pushed back
out, the row standing in the back line, heel-skids in the sawdust where each
one was swept from: "That's better.").

## Shots — FULL 4640ms, FAST 2960ms (64%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Butcher `ult:elbow-call`: the neck rolled, the cleaver hauled up off the floor | real battlefield darkens to dusk; bars close | teal call aura; the Shambles' house-fronts lean in over the board from both edges (`elbow-lane`, in) | call bell; a neck crack and a creak of timber (`elbow-crack`); music ducks | on board | — | break the round: the room gets small |
| 1 | Cramped · face close-up | 700 (440) | on the head and shoulders under a jetty beam, Dutch −6° → −3° | `ult:elbow-shrug` (`root: false`): the head tips up at the beam, brow lifted; the shoulders roll and the cleaver elbow knocks the wall; the brow comes down into a grin | the lane close: plaster wall and timber post at the elbow, the beam and an empty hook over the head (`elbow-eaves`) | plaster knocked off the wall at the elbow (`elbow-plaster`) | `elbow-bump`; "Bit tight in here." | no | black 70ms | identity: the biggest thing in the smallest street |
| 2 | The Shambles · high wide | 1000 (520) | from above the eaves down the lane, a slow push | `ult:elbow-stride`: walking up the lane, the cleaver on the shoulder | the lane: jetties leaning in, slit of sky, benches, sawdust | sawdust kicked up at each step | **the rattle** (`elbow-rattle`); **motif** (`elbow-motif`) | **the real row** packed across the lane, `anticipate` | cut | stakes: what is in the way, and how little room there is; title |
| 3 | Wind-up · low Dutch | 520 (340) | low, medium, Dutch −9° → −12°, pushing in | `ult:elbow-wind`: feet planted, the cleaver swung off the shoulder and back level at full reach; the point bites the wall | the lane, exposure falling 0.7 → 0.3 | plaster bursting from the wall at the blade's point (`elbow-plaster`); a gouge (`elbow-bite`) | `elbow-wind`: straps creaking, a breath in; the bite | no | cut | escalation: the swing will not fit, and is coming anyway |
| 4 | Hush · the cat | 480 (340) | extreme close-up on a shutter bench in the dark, dead still | — | near black; exposure 0.08; heavy vignette | **the lane cat** (`elbow-cat`): eyes lit, ears flatten at 0.3, it presses flat by 0.65 | music at 3%; one drip (`elbow-hush`) | no | cut | the quiet: even the cat gets down |
| 5 | Make room · impact | 820 (600) | medium wide profile, a little high, Dutch 4° → 1.5°, easing out | `ult:elbow-sweep` (contact 130ms): the cleaver comes round flat at chest height with the whole body turning after it; targets `hurt`, shoved back down the lane, tilted | the lane lit, then settling | **teal-and-ink two-tone** 70ms; **the swing** wrapping the row (`elbow-sweep`, back half and front half); **the gouge along the far wall** (`elbow-gouge`); sawdust sheet (`elbow-sawdust`); plaster (`elbow-plaster`); a near post splintering past the lens (`elbow-splinter`) | `elbow-impact` + `ult-boom`; **150ms stop**; heavy shake | **the row** | cut on the two-tone | impact: `$damage` on the frame; "MAKE ROOM!" |
| 6 | Elbow room · return | 720 (480) | battle camera | real Butcher `ult:elbow-stretch`: the cleaver set down, the arms stretched out wide | battlefield; bars open | the house-fronts pushed back out (`elbow-lane`, out); heel-skids in sawdust behind every real target (`elbow-board`) | the motif's last notes, sawdust settling (`elbow-settle`); tail | on board | flash 80ms | release: the row in the back line, and room |

## Framing

- **Boss** (`enemy=collector`): the lane pulls back to fit the Collector
  whole across it; the impact pulls back to its height with the Butcher
  smaller, the swing wrapped round the robe, and a short shove.
- **A row of more than one** (`enemy=hound&party=4`: hound and bulwark;
  `enemy=sniper`: sniper and mender): the swing wraps all of them; the
  shove carries each back.

## FAST

Keeps all seven shots, shorter. The Shambles is cut to 520ms (the title rides
it); the close-up, the wind-up, the cat and the impact keep their shape.

## Voice

"Bit tight in here." · "MAKE ROOM!" · "That's better."
