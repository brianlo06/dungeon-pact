# Dry Flood (Arcanist · Pyromancer) — storyboard

**The idea, in one sentence:** the Pyromancer tips its spark over the lip of
a spillway that has been dry for years, and the fire goes down it the way the
water used to, step by step and faster than the water ever did, and floods the
basin where the enemy row is standing.

Only the Pyromancer could have it. The path's title is the plot: *Water was
always the slower answer.* The Arcanist is a water-and-lightning caster
(Cloudburst, then Storm needle); the Pyromancer is the one Arcanist who gave
up waiting for the water. So its fire is drawn doing water's job: poured,
running downhill, filling the low ground, and never once falling like rain.
The drawing supplies the gesture. The Arcanist has no staff; it holds its
spark out in a gloved **hand**, so the one thing it can do with fire is what a
hand does with anything in it: turn it over and let it go. The **hat's tip**,
which flops about on its own every round, is lifted by the heat for the first
time. It has **no face** under the brim, only two **eye-lights**, so the fire
lights it from below and it watches. The path's price supplies the ending:
eight health gone for three points of power, and the Ultimate burns its own
**sleeve**.

Fire is never a forge here (no molten rims, no embers, no red forge light, no
metal), and never a flame icon stamped in rows. The flood is drawn the way a
flood of water is: **one body with a front**, a sheet on every step that
curls over each nose and tumbles down the riser, a pool that spreads across
the basin and piles up against whatever stands in it. What makes it fire is
its surface: licks riding the current and trailing back, bright streaks
running inside it, flame thrown up like spray where it hits.

## Gameplay

`src/content/ultimate-defs/arc-pyromancer.ts`, target an enemy row, cost 100,
speed 10:

| | Debt of Thunder (base) | **Dry Flood** (Pyromancer) |
| --- | --- | --- |
| Who | one target, and every enemy through the scope | **one row**, every enemy in it |
| Damage | 26 lightning on the target; Chain Shock 12 on the rest | **28 fire** on each enemy in the row |
| Over time | — | **Burn 8 for 3 rounds** on each (Burn stacks: on an Immolated row, 14) |
| Wet | **applied** to every enemy, and left for the party | **boiled off**: any Wet on the row flashes to steam for **10 more through armour**, and is gone |
| The party | the Wet to spend on lightning | **every burning enemy is Vulnerable this round**, in the row or out of it |
| Its price | — | the Pyromancer catches too: **Burn 3 for 2 rounds** |
| Mana | +3 | +2 |

It differs in what it does, not only in numbers. Debt of Thunder is patience:
it lays Wet on everyone, spends it on one target, and leaves the rest for the
party to spend later. Dry Flood lays nothing down for later. It hits a whole
row at once and keeps hitting it for three rounds; it *consumes* the Wet that
the Arcanist's whole kit builds, as steam, rather than saving it for a bolt;
and it opens the burning enemies to the party's blows now, not next round.
Burn over time where Debt of Thunder is burst; a row where it is a line; and
a cost on its own body where it had none.

Its team play is the reactions from the other side. A Tidecaller's Riptide, an
Arcanist's Debt of Thunder or the Pyromancer's own Cloudburst leaves Wet for it
to boil; its Vulnerable makes every ally's hit on the burning count a quarter
more that round, a Ranger's Exploit included; and the Burn it takes is a
cleanse for a Warden or a Herald to spend (Counterpoint, Green Reckoning).

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, with this
path's stub still `null` (the Pyromancer on Debt of Thunder) and then with
Dry Flood as it was tuned:

| Win rate | off | on, stub | 20 fire, self Burn 4 | 24 fire, self Burn 3 | 34 fire | **28 fire (final)** |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 players | 75% | 83% | 79% | 79% | 83% | **79%** |
| 3 players | 94% | 95% | 95% | 95% | 95% | **95%** |
| 4 players | 92% | 93% | 93% | 92% | 93% | **93%** |
| all | 91% | 93% | 92% | 92% | 93% | **93%** |

At 4 seeds a duo bucket is 24 runs, so 83 → 79 is one run; it did not move
for the self-Burn (off entirely: 79) or for Vulnerable lasting two rounds
(79), only for 34 fire, which is far over what the Ultimate should be worth.
So the duo gap was measured again at 8 seeds (648 runs): stub 79 / 77 (2p),
94 / 96, 93 / 93, all 92 / 93; **28 fire 79 / 77, 94 / 97, 93 / 94, all 92 /
93** — the same as the stub. The duo difference at 4 seeds was noise.

The bot trains Arcanists into the Pyromancer only some of the time, so it was
also weighed head to head: every Arcanist playing one Ultimate's effects
whatever its path, every 2nd composition, 4 seeds (972 runs each):

| Every Arcanist plays | 2p | 3p | 4p | all | Arcanist uses / charge |
| --- | ---: | ---: | ---: | ---: | --- |
| Debt of Thunder | 90% | 95% | 95% | 94% | 2.84 / 305 |
| **Dry Flood** | 89% | 94% | 95% | **94%** | 2.64 / 285 |

Within a point everywhere. Dry Flood is used a little less because it earns
less charge back: Debt of Thunder's Chain Shock is a reaction (×2 for the
Arcanist) and its Wet is setup on every enemy; Dry Flood's Burn and Vulnerable
are setup on one row only.

## Space, palette, sound

- **Space: the dry spillway.** The cistern's great stepped spillway, dry for
  years, and every mark the water left on it: a pale crust at the high-water
  line with stains run down from it, the wall dry stone above it and stained
  dark below, fainter rings where the water sat lower; a depth gauge painted
  on the wall with nothing to measure; the culvert behind the lip with its
  grate still in it; poured-stone steps worn round at the nose, a dark skin
  of dead growth on every riser and dried weed hanging off every nose; the
  basin's silt dried and cracked into plates, the rings of the last puddles,
  a grated drain, and the bones of a fish that was living in it when it
  went. Nothing in it is wet. Not a hall, a forge, a
  gate, a storm, a drowned ledger, a held fall, a ridge, a meadow, a wood, a
  causeway, a snowfield, a vault, the ground under the floor, a pit, a mere, a
  labyrinth, a no-man's-land, a mirror room or a page. Three drawings of it:
  `dry-lip` (the lip at a hand's scale), `dry-weir` (the whole spillway,
  side-on) and `dry-steps` (the steps from the basin, looking up).
- **The flood** (`dry-fire`): one outline traced every frame along the
  steps' edge (`weir.ts`), from the lip to wherever its front has got to, in
  three flat layers (deep red, orange, gold) that are the same outline at
  three thicknesses. On a tread it is a sheet; off each nose it shoots out
  and falls as a curtain to the next tread; on the floor it is a pool that
  piles up round every figure's legs. Its front is a rolling head that curls
  over and back under itself, and on a riser tumbles down the face. Its
  surface is torn into licks, each hashed from its place in the current (its
  own width, height and flicker; no drawing is repeated), carried along with
  the flow and trailing back against it; bright streaks run inside the body
  like the lines on fast water; where the front hits a figure it throws seven
  blades of flame up over it like spray, bent upward by the heat. A back
  band draws the whole flood behind the figures and a front band only the
  near edge of the pool, round their feet and shins.
- **The small fires** (`fire.tsx`; `dry-flame`, `dry-pour`, `dry-kindle`,
  `dry-burning`, `dry-singe`): tongues in four flat layers, three drawings a
  tongue boiling between them. Smoke: three curling strokes going up. No
  embers, no sparks, no blur, no blue; a glow is a small flat gradient.
- **Palette:** soot umber `#140d09`, silt bone `#cdbf9f` (the tide-lines and
  the dry stone), flame orange `#ff8a2a` (the accent), gold `#ffc63d`, deep red
  `#b8321c` and a pale core `#fff1c8`. The Arcanist's storm blue is nowhere,
  not even at the root of a flame.
- **Motif (original):** four notes on a low reed-like voice whose every note
  *flutters* (a fast tremolo, the way a flame does): A3, E4, F4, then D4 held
  and guttering out.
- **Signature sound:** the catch (`dry-catch`), the hollow *whump* of a flame
  taking hold, air pulled in and let go in one breath.
- **Impact, layered:** a dry crack (transient); a sub dropping (weight); the
  roar of the fire filling the basin, a wide noise band sweeping down (body);
  and crackle ticks over a long low rumble (tail).

## Rhythm

identity (the spark is turned over the lip and poured) → stakes and target
(the row standing in the dry basin, under the water's old lines; the first
light at the top of the steps; title) → escalation (racing down the steps
with the fire's front) → **quiet** (from behind the row, looking up the steps:
silhouettes, the air drawn up past them towards the light, no sound) → impact
(the fire comes over the last step and floods the basin through the row) →
release (the real board: the row still burning, and the Pyromancer beating
out its own sleeve).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Arcanist `ult:dry-catch`: the hand comes up and the spark catches | real battlefield sinks to soot, bars close | orange call aura; a drawn flame catches in the real glove (`dry-kindle`) | `dry-call`: a rasp and the catch; music ducks | on board | — | break the round |
| 1 | Lip · detail | 640 (400) | side-on at the lip, the Arcanist from hat to lip with the drop beside it, Dutch 6°; held until the pour, then it drops down the fall after the fire (`snap`) | `ult:dry-pour`: the arm out over the drop, the spark swells, the hand tips over (221ms) and the spark is gone; the hat's tip lifts in the heat and trembles up there; the head tips to watch (`root: false`) | `dry-lip`; lit from below by the fire | the spark as a flame held in the palm (`dry-flame`, its own drawing stood down), then poured: a ribbon of fire falling from the glove down the drop, tongues licking up and out along both its edges, bursting on the step below (`dry-pour`) | `dry-catch`, then `dry-pour` at the tip | no | black 60ms | identity: fire, poured like water |
| 2 | Basin · target | 900 (—) | wide on the whole dry channel, lip to basin, slow push | — | `dry-weir`: the high-water line, the gauge, the grate, the weed, the cracked silt, lit plainly (exposure 0.74) | for its first 306ms nothing burns: the empty channel. Then the flood's front comes over the lip and down the top steps (`dry-fire`) | **motif**; a far roar growing (`dry-roar`) | **the real row** on the silt, looking up (`anticipate` → `block`) | cut | stakes and target: where the water was; title |
| 3 | Run · projectile-follow | 560 (380) | bolted to the flood's front, racing down the steps, Dutch −12° → −16° | — | `dry-weir` | the flood: its head curling over each nose and tumbling down the riser, the sheet behind pouring off every step, licks riding it, streaks inside it, smoke curling up (`dry-fire`); smoke rolls across the lens at the end (`dry-smoke-wipe`) | `dry-run`: a roar with a whump at every step, faster each time | no | cut | escalation: faster than water |
| 4 | Draw · the quiet | 520 (380) | from behind the row, level, all but locked, up the steps | the row held in silhouette | `dry-steps`; exposure down (0.34 → 0.28, against 0.7–0.8 either side); the light only at the top | the smoke clears off the lens; the flood's front **cresting the top step like a wave**: a mound of fire risen behind the nose, its crest torn, the dark underside of the curl rolling towards the row, a sheet of it already spilling over the nose; it rises slowly and flickers at a third of its speed; the air drawn up past the row and one dry leaf (`dry-crest`, `dry-draft`) | **music ducked to 5%**; the air drawn in, then nothing (`dry-draw`) | **the row**, silhouettes, holding | the smoke, in-folder | the quiet: the wave before it comes down |
| 5 | Flood · impact | 780 (560) | the whole slant, from the Pyromancer on the lip down to the row, Dutch −5° easing out | `ult:dry-send` (contact 0.12): the arm flung down after the fire, whole and rim-lit on the lip at a size of 220, **the pour still falling from its glove** into the flood (`dry-pour`, `tip: 0`) | `dry-weir`, lit from below; exposure up | **70ms orange two-tone** held by the stop: the row black against the flood; the flood off the last step and through the row, one body from the lip to the far wall, piled up their legs, flame thrown up over them like spray (`dry-fire` at 1.6, a back and a front band); smoke curling up | `dry-impact` layered; **150ms stop**, heavy shake, a second small shake | **row** `hurt`, shoved and tipped | cut on the two-tone | impact: the damage on the frame; "Done waiting." |
| 6 | Burning · return | 700 (480) | battle camera | real Arcanist `ult:dry-swat`: it notices its sleeve is alight and beats it out | real battlefield; bars open | every real enemy in the row still burning, with a scorch under it and smoke over it (`dry-burning`); a flame on the Pyromancer's own sleeve, beaten out to a wisp (`dry-singe`) | `dry-after`: crackle, a hiss, the motif's last two notes; tail | on board | flash 80ms | release: what is still burning, and what it cost |

### Boss framing

In **Basin** the camera pulls back to take in a Collector's height under the
high-water line. In **Draw** a big figure would stand in front of the wave
it is waiting for, so it stands to one side of the steps, smaller, and the
crest stays clear. In **Flood** the camera frames the boss whole with the
steps and the Pyromancer on the lip beyond it, the flood is drawn at 1.7, and
the pool's pile-up and the spray are capped (150 and 300 units) so the fire
reaches a boss's knees and chest rather than swallowing it; the shove is
small. Large framing (the Iron Bulwark) sits between.

### FAST

Drops **Basin**. The title rides **Run**. It keeps the pour, the fire's run,
the quiet and the flood.

## Performance, without a face

The Arcanist is not one of the five face heroes. Debt of Thunder looks under
the brim and opens the tome; Still Life never does either, and acts with the
hand's pinch, a flung sleeve, a hat's tip stopped mid-flop and eye-lights over
a silhouette. Dry Flood acts with **the hand turning over** (a pour, then a
fling, then beating out its own sleeve), **the spark** (swelling, becoming a
flame, gone), **the hat's tip lifted by the heat** (the one time it rises
instead of flopping) and **the eye-lights lit from below** by what it poured.
No part was added to `Arcanist.tsx`.

## Notes from the lab

### Revision after lead review

The film's signature was below the bar in two ways, and both were redrawn:

- **The fire read as icons, not a flood.** It was one small flame drawing
  (with a blue base) stamped in rows along each step: at a glance, the fire
  emoji repeated, and rows of separate flames are the opposite of a flood.
  `dry-fire` is now one body traced along the steps every frame (see *The
  flood* above), with no sprites and no blue anywhere. The first cut of the
  sheet was far too thin (a glowing crack along the steps); it is now about
  as thick as a riser is tall, twice that at the head. Its head was first a
  flat lobe, then a starburst; it is now a roll that curls back under itself
  with licks only over its top, trailing back.
- **The spillway read as a brick staircase with planks.** The ashlar courses
  are gone, the stepped weir is poured stone with worn noses, and the space
  carries the marks of water that has gone (see *Space*). The lip was lowered
  (to 426, risers 64) so the basin shot holds the lip, the steps, the wall's
  high-water line and the silt at once, and shows the empty channel for its
  first 306ms before the flood comes over.
- **The quiet read as flames on a shelf.** It is now the flood's front
  cresting the top step like a wave: a mound (not a box) that runs down to
  nothing at the step's ends, a torn crest, the curl's dark underside, and a
  sheet already spilling over the nose.
- **The Pyromancer was a tiny figure cropped at the top-left of the impact.**
  With the lower lip and a wider camera it stands whole on the lip at a size
  of 220, rim-lit, with the pour still falling from its glove into the head of
  the flood, so it reads as the one who poured it.

- **Shot list as built** (FULL / FAST ms): call 420/240, lip 640/400, basin
  900/—, run 560/380, draw 520/380, flood 780/560, burning 700/480. 4,520ms
  FULL, 2,440ms FAST (54%). The quiet (`draw`) is directly before the impact.
- **The lip was redrawn twice.** Side-on at a flame on a glove, a pour that
  ran straight out of the bottom of the frame read as a stick of fire, not a
  pour. The lip was raised (its top at 760) so the shot holds the hat, the
  glove and the lip's nose at once, and the camera now holds until the hand
  tips over and then drops down the fall after the fire (`snap`), so the pour
  is seen to go a long way down and burst on a step.
- **A pour is timed by the clip, not the shot.** A clip plays at one rate in
  FULL and FAST, so `dry-flame` and `dry-pour` read the tip (221ms into
  `ult:dry-pour`, `POUR_TIP_MS`) from their own age in milliseconds; the pour
  sound has a FULL and a FAST cue at the tip.
- **The flame is placed from the drawing every frame**: between the spark's
  own circle and the glove, so it sits in the palm; with a worn weapon
  (`gear=kit`) the spark is not drawn and it sits on the glove.
- **Smoke read as cartoon clouds** as lumpy puffs; it is now three curling
  strokes going up.
- **The impact's accent**: the flood's front is just past the first enemy on
  the two-tone frame and reaches the second a few frames later, so the row is
  black against orange on that frame, not black against black. A
  chromatic fringe after it read as a colour fault at the frame's edges and
  was cut.
- **Sounds, rendered offline and measured** (peak range over five renders,
  RMS): the impact 1.51–1.74, RMS 0.110 (Foreclosure's 1.43–1.71, 0.101;
  Still Life's 1.55–1.88, 0.105); the motif 0.18; the quiet 0.08–0.12; the
  catch 0.36–0.44; the call 0.35–0.40; the run 0.25–0.29.

## Whole-body motion

Root keys, authored for the size each clip plays at: `ult:dry-send` (the
throw from the lip, x −0.02 → 0.05, rotate −3° → 7°, squash 0.94 at contact,
at a size of 150–180), and on the board `ult:dry-catch` (a small lift, y
−0.01, rotate −1.5°) and `ult:dry-swat` (hops and wobbles with each flap, y
−0.012, rotate ±2.5°). `ult:dry-pour` has small root keys but plays only in
the lip's detail, which sets `root: false` so the glove stays where the flame
and the pour are aimed. Nothing moves `.cine-look`.

## Performance

`GPU=1 scripts/profile-ultimate.ts 5501 1920x1080` (Rivet Sniper, a row of
two), after the revision: the film p50 16.7ms / p95 16.8ms, the round after
it p50 16.7ms / p95 16.8ms; 2 frames over 34ms in each. The film's peak is
933 nodes (877 in SVG), down from 1,527 before the flood became one outline:
it is a handful of paths whose `d` is rebuilt each frame (three layers, the
streaks, and the spray folded into the layers) rather than hundreds of
tongues. No filter, blur or keyframe in this folder. (A run under a load
average of 27 measured p95 100ms for the film and 66.7ms for the round; the
figures above are from a quieter machine.)

## What the engine could not do, and what was built instead

- **A row's reactions land together.** Both enemies of a row `hurt` on the
  same frame; the flood's front reaches each at its own place, so the fire is
  staggered even where the flinch is not.
- **The occlusion is always a cape.** The smoke across the lens is an
  in-folder screen effect, two cues straddling the cut into the quiet.
- **A cutout has no back.** The quiet is framed from behind the row; the
  enemies are drawn as silhouettes, so which way they face does not show.
- **Stripping a status logs no beat, and neither does a self-applied one.**
  The Wet boiled to steam is not in the segment's beats (the steam's 10 is,
  as a second damage beat, folded into `$damage`), and the Pyromancer's own
  Burn logs nothing, so the film cannot know whether a row was soaked and
  always shows the sleeve alight. An engine beat for a status removed or
  applied to the caster would let the film draw steam only on a soaked enemy.
- **The contact check needs a caster with a strike clip in the impact.** The
  Pyromancer is in the flood shot on purpose, small on the lip with its arm
  flung down on contact, where the fire came from.
