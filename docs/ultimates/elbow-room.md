# Elbow Room — Reaver · Butcher

**The idea, in one sentence:** the Butcher is standing in the Shambles, the
butchers' lane so narrow its upper storeys nearly touch, with the enemy row
packed across it wall to wall — and it swings anyway: one flat swing wider
than the street, that tears a gouge along the wall and sweeps the whole row back down the
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
  of the plaster the whole width of the frame; splinters fly out past the
  lens; and its wake lifts the sawdust off the cobbles in one flat sheet. On
  the board after, it is a curved bank of swept sawdust in front of each unit
  it moved.
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

identity (the close-up: a jetty beam an inch over its head; it straightens up
and cracks its head on it, plaster comes down, the brow goes up at the beam,
then the grin: "Bit tight in here.") → stakes (down the lane from a first-floor
window: the real row packed across it, the Butcher coming up the lane with the
cleaver on its shoulder rattling along the shutters; title) → escalation (the
wind-up: the cleaver swung off the shoulder and back at full reach until its
point bites a post) → **quiet** (the cat flattens) → **impact** (a teal-and-ink
frame; the swing a flat band round the row, a gouge torn along the far wall,
sawdust thrown; the row knocked back down the lane: "MAKE ROOM!") → release
(the real board: the lane's walls pushed back out, the row standing in the
back line with a bank of swept sawdust in front of each where it stood:
"That's better.").

## Shots — FULL 4600ms, FAST 3140ms (68%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Butcher `ult:elbow-call`: the neck rolled, the cleaver hauled up off the floor | real battlefield darkens to dusk; bars close | teal call aura; the Shambles' house-fronts lean in over the board from both edges (`elbow-lane`, in) | call bell; a neck crack and a creak of timber (`elbow-crack`); music ducks | on board | — | break the round: the room gets small |
| 1 | Cramped · face close-up | 700 (440) | on the head under a jetty beam, Dutch −6° → −3°, pushing in | `ult:elbow-shrug` (`root: false`): the blade on the shoulder, it straightens up and cracks its head on the beam (mane squashed, eyes squeezed), the brow shoots up and the head tips back to look at the beam; then the head comes down, the brow lowers, the grin | the side-on lane close, low exposure, teal rim | the beam, a pegged oak joist across the top of the frame with an empty hook (`elbow-eaves`); plaster knocked off it (`elbow-plaster`, a cue per cut) | `elbow-bump` (a cue per cut); "Bit tight in here." | no | black 70ms | identity: the biggest thing in the smallest street |
| 2 | The Shambles · wide | 1000 (520) | down the lane from a first-floor window, a slow push | `ult:elbow-stride`: walking up the lane, the cleaver on the shoulder | `elbow-lane`: jetties leaning in over the cobbles, benches, hooks, sawdust | dust kicked up behind the walker | **the rattle** (`elbow-rattle`, `-fast`); **motif** (`elbow-motif`) | **the real row** across the lane, `anticipate` | cut | stakes: what is in the way, and how little room there is; title |
| 3 | Wind-up · low Dutch | 520 (340) | low, medium, Dutch −9° → −12°, pushing in | `ult:elbow-wind` (bite at 264ms): feet planted, the cleaver swung off the shoulder and back level at full reach until its point bites a post; brow down | `elbow-street`, exposure falling 0.62 → 0.3, teal rim | a timber post behind the blade, notched where it bites (`elbow-post`); plaster bursting there (`elbow-plaster`); both a cue per cut | `elbow-wind`: straps creaking, a breath in, the bite; music ducks to 12% | no | cut | escalation: the swing will not fit, and is coming anyway |
| 4 | Hush · the cat | 480 (340) | extreme close-up on a shutter bench in the dark, dead still | — | near black; exposure 0.05; vignette 0.95 | **the lane cat** (`elbow-cat`): eyes lit, ears flat at 0.3, pupils round, pressed flat by 0.65 | music at 3%; one drip, a growl too low to be sure of (`elbow-hush`) | no | cut | the quiet: even the cat gets down |
| 5 | Make room · impact | 780 (780) | medium wide profile, Dutch 4° → 1.5°, easing out | `ult:elbow-sweep` (contact 130ms): from level behind, a foreshortened instant at the lens, to the blade forward across the row with the whole body turned after it, chin up, roaring; targets `hurt`, shoved back down the lane, tilted | `elbow-street` lit with a teal tint, settling | **teal-and-ink two-tone** 70ms over a pale glare behind the row (`elbow-glare`); **the swing** as a flat band round the row, far half behind, near half in front (`elbow-sweep`); **a gouge torn along the far wall** (`elbow-gouge`); plaster out of the wall (`elbow-plaster`); the sawdust sheet (`elbow-sawdust`); splinters out past the lower corner (`elbow-splinter`) | `elbow-swing` into `elbow-impact` + `ult-boom`; **150ms stop**; heavy shake | **the row** | cut; the two-tone on the contact | impact: `$damage` on the held frame; "MAKE ROOM!" |
| 6 | Elbow room · return | 720 (480) | battle camera | real Butcher `ult:elbow-stretch`: the cleaver set down, the arms and chest stretched out | battlefield; bars open | the house-fronts pushed back out (`elbow-lane`, out); a curved bank of swept sawdust in front of every real target (`elbow-board`, staggered) | sawdust settling, the motif's last two notes (`elbow-settle`); tail | on board | flash 80ms | release: the row in the back line, and room |

## Framing

- **Boss** (`enemy=collector`): the lane pulls back to fit the Collector
  whole across it; the impact pulls back to its height with the Butcher
  smaller, the swing wrapped round the robe, and a short shove.
- **A row of more than one** (`enemy=hound&party=4`: hound and bulwark;
  `enemy=sniper`: sniper and mender): the swing wraps all of them; the
  shove carries each back.

## FAST

Keeps all seven shots, shorter. The Shambles is cut to 520ms (the title rides
it); the close-up, the wind-up and the cat keep their shape, and the impact
keeps its full 780ms: a clip plays at one rate in both cuts, and the hit-stop
and the reveal are fractions of the shot, so a shorter impact would stop
before the blade arrived. The close-up's and wind-up's clips (420ms, 480ms)
finish inside FAST's cut of their shots and hold in FULL's; their sounds and
plaster have a cue per cut.

## Voice

"Bit tight in here." · "MAKE ROOM!" · "That's better."

## Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, with the
stub still `null` (the Butcher on Red Ledger) and then with Elbow Room:

| Win rate | off | on, stub `null` (Red Ledger) | **on, Elbow Room** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 88% | **88%** |
| 3 players | 94% | 98% | **98%** |
| 4 players | 92% | 96% | **96%** |
| all | 91% | 96% | **96%** |

Nothing moves (Reaver 2.42 → 2.44 uses and 261 → 264 charge a run; Ultimates
per boss fight 6.82 → 6.85; share of hero damage 17% both): the bot trains a
Reaver into the Butcher rarely in that sample. So it was weighed head to head,
as A Good Hiding and Give and Take were: every Reaver playing one Ultimate's
effects whatever its path, every 2nd composition with a Reaver in it, 6 seeds,
492 runs each (a scratchpad script, not committed):

| Every Reaver plays | 2p | 3p | 4p | all | Reaver uses / run |
| --- | ---: | ---: | ---: | ---: | ---: |
| no Ultimates | 83% | 91% | 83% | 85% | — |
| Red Ledger | 71% | 96% | 88% | 89% | 2.31 |
| A Good Hiding | 92% | 98% | 97% | 97% | 2.41 |
| **Elbow Room** | **79%** | **98%** | **93%** | **93%** | 2.38 |

It lands between Red Ledger and A Good Hiding, beside Give and Take (95% in
its own run of the same script). The first cut was kept.

Tests: `tests/ultimates-elbow-room.test.ts` (5): it replaces Red Ledger, aims at
a row, pays nothing and pierces nothing; every enemy in the row takes 30 +
power − Guard and goes to the back line while the rest are untouched, +2 Fury;
with the front swept back, a melee hero's reach error on the back row is gone;
an enemy already Vulnerable is interrupted and hit a quarter harder; resolved
as an Ultimate, the film is handed the whole row with a damage beat on each.

## Measurements

**Levels**, rendered offline in the lab page (`OfflineAudioContext`, peak of
three renders / RMS): `elbow-impact` 1.25 / 0.097 (Red Ledger's `ledger-cut`
1.21, A Good Hiding's impact 1.33, Hammer Price's 1.32); the motif 0.25 / 0.045
(`hiding-motif` 0.31, `hammer-motif` 0.15); the rattle 0.17; the swing 0.38;
the head on the beam 0.28; the wind-up 0.25; the call 0.16; the quiet 0.03
(`hiding-hush` 0.04). The first render had the swing's whump inaudible (0.08)
and the neck crack at 0.96: a noise burst 20ms long spikes through its
filter, so the clicks are short square tones now.

**Performance** (dev build, `GPU=1 scripts/profile-ultimate.ts 5551 1920x1080
"hero=reaver&evo=rvr-butcher&party=4"`, a shared machine at load ~12–24): film
p50 16.7ms / p95 50ms, 12 frames over 34ms; the round after it p50 16.7 / p95
49.9, 16 over 34ms. Peak 1175 nodes (955 SVG), 10 live effects, no filtered
elements. The first profile peaked at 1904 SVG nodes, because every cobble,
fleck of sawdust and hook was its own element; they are a few paths now.

## Face and whole-body motion

The close-up acts with `face()`: `ult:elbow-shrug` squeezes the eyes on the
bump (open 0.5), then lifts the brow shelf 1.9 units with the eyes wide (1.3)
while the head tips back to look at the beam, then lowers it into the grin.
Knit never passes 3°, and the browser test holds the brow's tilt under 5° at
four moments of the shot. `ult:elbow-wind` lowers the brow and
`ult:elbow-sweep` roars on the contact (keyed, drawn only in close-ups).

Root keys, authored for the shot each plays in: `ult:elbow-stride` (a ±0.02
bob and a 3–4.5° lean, for the wide down the lane); `ult:elbow-wind` (back onto
the heels: x −0.045, rotate −9°, squash 1.08, for the medium Dutch);
`ult:elbow-sweep` (from that, forward into the swing: x 0.12–0.14, rotate 3–8°,
squash 0.88, scale 1.04, for the medium impact); `ult:elbow-call` and
`ult:elbow-stretch` (small, battlefield size). **`root: false`** on the
close-up's `ult:elbow-shrug`: its straightening up is the `body` part, so the
face stays under the beam. Nothing is rebuilt on `.cine-look`.

## Notes from the lab

- **A flat swing in a profile rig.** An arm turning in the picture's plane can
  only chop or scoop, so the swing is drawn by the effect, as the ellipse a
  flat circle makes seen from the side: its far half behind the row, its near
  half in front, both from behind the Butcher to past the last figure. The
  first cut had the ellipse deep (ry 0.26 of the Butcher's height) and low, and
  on the held frame it read as a hoop lying on the cobbles round everyone; it
  is flat (0.1) at hip-to-chest height now, and reads as one level cut through
  the row.
- **The blade is 33° off its own arm**, so a level arm points the blade down
  and a level blade lifts the arm across the face. The contact is a
  compromise: the arm level under the jaw (−113°, scaled to 1.24 for a bigger
  blade), the blade angled down across the row, and the chin thrown up into
  the roar so the arm does not cover the mouth.
- **The two-tone frame** first turned the dusk lane and every figure to one
  ink. A pale field behind the row (`elbow-glare`) sinks away within 270ms of
  the contact, so on the accent the row is ink inside a teal band.
- **The close-up was re-staged once.** The first version had the blade knock
  the beam; to meet the blade the beam had to sit so high that it was a dark
  band at the edge of the frame and the shot did not read as cramped. The head
  meets it instead, and the beam is lit as a pegged oak joist on the front
  layer (effects are not under the stage's exposure).
- **The cat** was drawn below the letterbox in its first cut (only its ears
  showed); the bench and cat were lifted.
- **The board after** went through heel-skids (read as stools under the
  enemies) and streaks (read as tassels) to one curved bank of sawdust in front
  of each unit, the swing's wake on the floor. On a boss it is capped at a
  row's size.
- **Splinters past the lens** first flew across the row on the held frame and
  covered the blow; they leave by the lower left corner now.
- **Films merged while this was authored:** Give and Take (the Bloodbound: a
  chalk crossroads at night, the palm on the cleaver's edge, blood running
  along the blade, the cleaver down into a flank). Nothing here shares it: no
  crossroads, no hand on the blade, no blood, and the swing is flat, not down
  into a flank. Every Head Bowed (the Blightcaller's sunflower field bowing)
  was still in progress and owns crops; this film has none.

## What the engine could not do, and what was built instead

- **A flat swing.** Rigs turn parts only in the picture's plane, so the swing
  round the row is an effect laid round the cast (`elbow-sweep`, placed in a
  frame function from where the stage put the Butcher and each target). The
  engine would need an effect anchored to the caster and the whole row.
- **A row's reactions land together.** Every target plays `hurt` and takes the
  same shove on the contact; a sweep reaching the far end of the row a beat
  later would need `react[].stagger`.
- **A move logs no beat.** The row goes into the back line when the board is
  revealed; the film shows it as the shove down the lane and, on the board,
  the bank of sawdust in front of each unit. Whether a windup was broken is not
  branched on.
- **A clip plays at one rate in FULL and FAST**, so the impact is the same
  780ms in both, and the close-up's and wind-up's sounds and plaster have a cue
  per cut.
- **The occlusion object is always a cape**, so the film's authored
  transitions are a black frame and a flash rather than a shutter swung across
  the lens.

## Where it is weakest

- **The swing's pose.** The Reaver's cleaver is drawn 33° off its arm, so on
  the held frame the blade points down into the row rather than level through
  it. The flat teal band carries the sweep; the pose alone reads closer to a
  hack.
- **The call's leaning house-fronts** are flat blocky silhouettes: they read as
  walls closing in, not yet as the Shambles' jettied timber.
- **The board after** is modest: a curved bank of sawdust in front of each
  moved unit. The real statement, the row standing in the back line, is made
  by the board's own layout.
- **A lone enemy in the wide** stands in the middle of an otherwise empty lane:
  "packed wall to wall" is only true for a full row.
