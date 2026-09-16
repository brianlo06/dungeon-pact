# Undertow — Arcanist · Tidecaller

**The idea, in one sentence:** the Tidecaller has been holding the whole sea
back with one open hand; it pulls the water off the flats where the enemy
stands, holds it out at arm's length on the horizon while they stand on the
bare seabed, and then lets go, and the loudest moment is seen from under the
water that comes back.

Only the Tidecaller could have it. The path's title is the plot: *The tide
arrives whether you are ready or not.* Its one ability, Riptide, is water
that *drags* (Wet and Weak on a row for one Mana), and the Arcanist is drawn
with no staff, only an open gloved **hand** held out towards the enemy with a
spark in it. So the Ultimate is not a spell thrown but a hold given up: the
open palm, the drawing's own rest gesture, straight-armed and shaking with
the weight of the sea on it; then the arm comes down. Nothing is cast at the
impact. The Tidecaller simply stops holding, and the sea does what it was
always going to do. The **hat's tip**, which flops on its own every round,
streams *seaward* with the wind that goes out with the water, and the robe's
hem is pulled the same way; the **eye-lights** are the only face it has.

It shares nothing with Debt of Thunder (no rain, no sky seal, no bolt, no
chain, no tome, no look under the brim; that film drowns a hall from above,
this one empties a shore and refills it from below), nothing with Dry Flood
(no spillway, no steps, no flood with a front racing downhill, no high-water
lines on stone, nothing poured), nothing with Still Life (no stills, nothing
frozen), nothing with Mourning Water (no still black water, no drop and rings,
no water climbing a figure slowly, no hand closing; this water is fast, it
goes *out* first, and it drags sideways) and nothing with Breakwater (no wave,
no crest hanging, no spray, no causeway, no cold horizon of steel; the sea
here comes back as a *level*, not a breaker, and the film goes under it).

## Gameplay

`src/content/ultimate-defs/arc-tidecaller.ts`, target an enemy, cost 100,
speed 6 (the tide is slow, and it arrives all the same):

| | Debt of Thunder (base) | **Undertow** (Tidecaller) |
| --- | --- | --- |
| Who | one target, and every enemy through the scope | **every enemy**, and the target more |
| Damage | 26 lightning on the target; Chain Shock 12 on the rest | **12 arcane** on the target and **10 arcane on every enemy**: the sea's weight, not a bolt |
| Wet | applied to every enemy for 3 rounds | applied to every enemy for 3 rounds |
| Weak | — | **every enemy Weak for 2 rounds**: the undertow drags their blows down |
| WINDUP | — | **the target's broken**; and any enemy **already standing in water** (Wet before the tide turned) is dragged under too: interrupted and 6 more through armour |
| Mana | +3 | +2 |

It differs in what it does, not only in numbers. Debt of Thunder is a burst
that spends the Wet it lays on one target and leaves the rest for the party.
Undertow spends nothing: it is a *control* Ultimate, the whole enemy side
Wet and Weak for two rounds and the target's plan gone, with the damage
spread thin across everyone rather than piled on one. And it compounds with
the Tidecaller's own round-to-round play: a Riptide the round before means
the whole row is "already in the water" when the tide turns, and every one
of them loses its WINDUP as well.

Team play: the Wet on everyone is the party's Chain Shock (the Tidecaller's
own Storm needle next round runs down the whole soaked line); the Weak is two
rounds of the party taking a third less from every enemy; the interrupts are
a Vanguard's or a Warden's round bought back; and the Wet is steam for a
Pyromancer's Dry Flood if there is one.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), on `bbdb4e3`, with the
path's stub `null` (the Tidecaller on Debt of Thunder) and with Undertow:

| Win rate | off | on, stub (Debt of Thunder) | **on, Undertow** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 83% | **83%** |
| 3 players | 94% | 95% | **95%** |
| 4 players | 92% | 94% | **94%** |
| all | 91% | 93% | **93%** |

Identical, as it was on the first base (79/95/93/93 both ways): the bot trains
an Arcanist into the Tidecaller too rarely in that sample for the path to
show. So it was weighed head to head, as Dry Flood was: every Arcanist plays
one Ultimate's effects and speed whatever its path (all three Arcanist paths
stubbed), every 2nd composition, 4 seeds (972 runs each):

| Every Arcanist plays | 2p | 3p | 4p | all | Arcanist uses / charge |
| --- | ---: | ---: | ---: | ---: | --- |
| Debt of Thunder | 92% | 96% | 95% | 95% | 2.84 / 305 |
| **Undertow** | 93% | 96% | 96% | **96%** | 2.61 / 294 |

Within a point everywhere. The Elegy found Weak on a boss worth three to six
points when it lands *first*; Undertow's Weak lands at speed 6, after most of
a round's blows, and its damage is spread thin, so two rounds of Weak on the
whole side buys back about what Debt of Thunder's 26 and Chain Shock do. It is
used less because it earns less charge back: it spends no Wet on a reaction.
Tests: `tests/ultimates-undertow.test.ts`.

## Space, palette, sound

- **Space: the flats at the harbour mouth, before dawn.** Ribbed wet sand
  running out from a shingle beach at the left to the sea at the right, under
  a slate pre-dawn sky with no moon and no sun. Mooring posts leaning in a
  line out across the sand, weed hanging off them; a hull lying on its side
  where the tide left it, its anchor chain lying across the sand; a wrack
  line of weed; lugworm casts; the last pools draining. When the sea goes out
  the sand *shines*, and the water it leaves behind runs seaward across it
  in threads. Not a hall, a forge, a gate, a storm, a drowned ledger, a held
  fall, a spillway, a ridge, a meadow, a wood, a causeway, a snowfield, a
  vault, the ground under the floor, a pit, a mere, a labyrinth, a
  no-man's-land, a mirror room, a page, a theatre, a rooftop or a hound run.
  Two drawings of it: `tide-edge` (the water's edge at a hand's scale) and
  `tide-flats` (the whole flat, shore to horizon).
- **The sea** (`tide-sea`, `tide-return`): drawn as a *level*. Going out it is
  one dark body whose near edge slides away across the sand, a pale foam
  line on the edge and a shine left behind it; at the horizon it banks up
  into a thicker band, which is the only warning. Coming back it is not a
  wave: the whole frame floods from below, the water's top edge a wobbling
  line that climbs the figures in a tenth of a second, a body of foam riding
  the line, and under the line the picture is seen *through* the water: a
  translucent cobalt that deepens with depth, the surface seen from
  underneath as a bright wobbling ceiling, bubbles going up in columns, and
  everything under it dragged sideways, seaward (the undertow: horizontal
  streaks, never a curl). Foam and bubbles are bodies of flat circles; a glow
  is a small flat gradient; nothing is blurred.
- **Palette:** pre-dawn slate `#1a2130` and `#0b0f18`, wet sand ochre
  `#8a7550` with its shine `#b8a882`, the sea's ink `#06101f`, and where the
  water moves a cold cobalt `#4a7dff` (the accent) with foam `#d6e6ff`. No
  storm blue (Debt of Thunder's `#8fd3ff`), no verdigris, no moon cream.
- **Motif (original):** four notes on a hollow blown voice, like breath over
  a bottle's mouth, G3, D4, C4, then F4 held with a slow vibrato: a swell that
  rises and does not resolve.
- **Signature sound:** the drag (`tide-drag`): a wave drawing back over
  shingle, a rattle of stones thinning out under a falling hiss, the sound of
  the sea *leaving*.
- **Impact, layered** (`tide-impact`): a slap (transient); a sub dropping
  (weight); a wide band of noise sweeping down and a long low push (body);
  then, under the surface, everything lowpassed to a rumble with bubbles
  chirping up through it (tail).

## Rhythm

identity (the open hand over the water's edge, and the sea backing off from
it) → stakes and target (the whole flat, the row stranded on the shining
sand, the sea going out to the horizon; title) → escalation (the strain: up at
the Tidecaller from the sand, the arm shaking, the hat's tip streaming
seaward, the horizon banking) → **quiet** (the bare seabed, level with the
sand: silhouettes, threads of water still draining past their feet, one fish
flapping, the sea a line on the horizon that thickens; music at 5%) → impact
(the hand comes down; the sea comes back as a level through the whole frame;
the row struck and dragged; the camera goes under the surface with the
target) → release (the real board: every enemy standing in water that is
still running out past it; the Tidecaller shaking out its hand).

## Shots — FULL 4340ms, FAST 2320ms (53%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Arcanist `ult:tide-hold`: the arm goes out straight, palm open, the body leaning back against a pull | real battlefield sinks to slate, bars close | cobalt call aura; a sheet of water slides *away* from every real enemy's feet and out of the fight (`tide-drain`) | `tide-call`: the drag, first heard; music ducks | on board | — | break the round |
| 1 | Edge · extreme close-up | 600 (380) | on the glove over the water's edge, Dutch −5°, a slow push | `ult:tide-strain` (`root: false`): the fingers spread as wide as they go and tremble; the spark a cold point in the palm | `tide-edge`: the sand at a hand's scale; cobalt rim from the right (the sea) | the sea's edge backing away from the fingertips, its foam line thinning, the sand it leaves shining and dulling, a thread of water running out of a footprint (`tide-edge-water`) | `tide-drag`; the held tone begins (`tide-strain`) | no | cut | identity: the hand holding the sea off |
| 2 | Flats · wide-hero | 880 (—) | wide from the beach, the Tidecaller left with the arm out, the row on the flats, the sea right; a slow drift right | `ult:tide-strain` | `tide-flats`, plainly lit (exposure 0.72): the posts, the hull, the sand shining | the sea going out across the whole flat, its foam line sliding seaward past the row, banking on the horizon (`tide-sea`) | **motif**; the drag far off | **the real row**, on the sand, watching the water go (`anticipate` → `block`) | whip 110ms | stakes and target; title |
| 3 | Strain · low-angle | 460 (300) | up at the Tidecaller from the sand, Dutch 8° → 11°, pushing in | `ult:tide-strain` at full size: the arm shaking, the hat's tip streaming seaward, the hem pulled, the eye-lights | `tide-flats` from low; cobalt back light growing | the horizon banking behind it (`tide-sea`, `bank`) | `tide-strain`: the held tone rising, creaking | no | cut | escalation: the weight of it |
| 4 | Bare · the quiet | 520 (360) | level with the sand, all but locked, the row mid-frame, the horizon behind | the row held, silhouettes against the pre-dawn | `tide-flats`; exposure down (0.36 → 0.3) | threads of water draining seaward past their feet (`tide-drag`); one fish flapping (`tide-fish`); the line of the sea on the horizon thickening (`tide-sea`, `bank`) | **music ducked to 5%**; the flap, a trickle, then nothing (`tide-hush`) | **the row**, silhouettes, holding | cut | the quiet: the seabed bare |
| 5 | Undertow · impact | 760 (560) | side-on and low on the row; from 0.3 the camera **goes down under the surface** | `ult:tide-release` (contact 80ms): the arm drops, small on the beach at the left | `tide-flats`; exposure up on the hit, then the murk | foam across the lens (`tide-foam-wipe`); the sea back as a level through the whole frame on a **70ms cobalt two-tone**, foam riding the line, the row struck in the level to the chest, dragged seaward and tilted, never covered; then from under: the surface a lit mid-blue ceiling, bubbles, everything dragged right (`tide-return`) | `tide-impact` layered; **150ms stop**, heavy shake; `tide-under` as the camera goes down | **every enemy** `hurt`, shoved and tilted, standing in the sea | the foam, in-folder | impact: the damage on the frame; "Let go." |
| 6 | Ebb · return | 700 (480) | battle camera | real Arcanist `ult:tide-lower`: the arm comes down, the hand shaken out, the spark back | real battlefield; bars open | every real enemy standing in water that is still running out past it, seaward streaks and foam at its shins, the target's deeper (`tide-standing`) | `tide-after`: the drag again, softer, and the motif's last two notes; tail | on board | flash 80ms | release: Wet and Weak, where it matters |

### Boss framing

In **Flats** the camera pulls back to take in a Collector's height on the
sand. In **Bare** a boss stands to the right of centre, smaller, so the
horizon stays clear over it. In **Undertow** the camera frames the boss
whole, the water's level rises to its chest rather than over it, its shove
and tilt are small and the camera goes down only to its waist, so a boss is
in the sea, not swallowed by it. Large framing (the Iron Bulwark) sits
between.

### FAST

Drops **Flats**. The title rides **Strain**, at the top of the frame, clear of the hand and the tome. It keeps the edge, the strain,
the quiet and the undertow.

## Performance, without a face

The Arcanist is not one of the five face heroes. Debt of Thunder looks under
the brim; Still Life acts with a pinch and a stopped hat; Dry Flood with a
pour. Undertow acts with **the open hand held out** (the drawing's rest
gesture, taken to its limit: fingers spread, the arm straight, the whole body
leaning back against the pull), **the hat's tip streaming seaward** (it flops
every round; here the wind that goes out with the water holds it out
straight), **the spark as a cold point** that goes out when the hand drops,
and **the eye-lights**. No part was added to `Arcanist.tsx`.

## Films merged while this was authored

Checked before locking the space and again before the final captures. Since
the base, **Compound Interest** (a copper sink, coins doubling into a crust)
and **Elegy for the Standing** (a burying ground under a white sky, a shadow
buried and earth closing over it) merged, and Sunblind was let resolve before
the Elegy (speed 24). Nothing here touches them: no coins, no grave, no earth closing, no
white sky. Two cautions came from the queue owner, who had read the films this
session had not: **Mourning Water** owns water closing over the one it takes,
so the sea here never heaps over the target (the level stops at the chest and
the camera goes under instead, and the heap is out of the code); and
**Sunblind** owns the pale pre-dawn, so the flats' sky is kept dark in bands.

## Notes from the lab

- **The edge is placed under the fingers from probes.** The sea's edge starts
  under the glove and backs off; the spec reads the glove's own box and checks
  the water is under the fingertips at 0.08 of the shot and past them at 0.7.
- **The strain shot cut the Tidecaller at the left** in the boss and large
  framings, where the camera sits further right to take in a Collector or a
  Bulwark: it now stands at x 360 (was 300) and those cameras come 50–80
  units left, zooming 0.92–0.96.
- **FAST's title sat on the tome and the hand** at y 0.74; it rides the top
  of the frame (y 0.2), as the FULL title does in Flats.
- **The sea back flooded the beach.** The level came across the whole frame,
  so the Tidecaller stood in it; the near surface now runs out at the shore
  (x 600), coming down to the sand over 340 units, and the foam on the line
  stops short of it.
- **The heap came out.** The first cut heaped the water over the target's
  head on the impact. Mourning Water owns that; the row now stands in the
  level to the chest and the film goes under with them.
- **The drawn frame** is a 70ms cobalt two-tone, followed by a short foam
  flash (the whole sea white for its first tenth of the shot back), so the
  row reads black against it. The ceiling seen from under is a lit mid-blue,
  never pale.
- **The pools on the board** are mounds of water round the legs: the last
  pass halved their height (26 to 13 units), flattened their top across the
  legs and cut the sway, so they sit on the ground.
- **The foam, bubbles and streaks are a few paths.** As 180 circles and
  streaks, each moving its `cx`, `cy`, `r` and `opacity` every frame, the sea
  back made 557 attribute writes a frame (every other shot 120–160, most of it
  the rigs) and the film spent 209ms of every second recalculating style,
  against 98 for Compound Interest and 139 for Dry Flood. Each body is now one
  path rebuilt per frame from seeds held in JS (the flecks three, one per
  flicker phase; a streak or bubble shows by its length or radius, not its
  opacity), and the board's pools the same: 147 writes a frame, ~168ms/s.
- **Sound levels**, rendered offline (peak / RMS, measured together with the
  water films, so compare within this list): `tide-impact` 1.28 / 0.167
  (Mourning Water's 1.54 / 0.134, Breakwater's break 1.45 / 0.131): lower at
  the peak and heavier in the body, which is the sea's weight rather than a
  crack; the motif 0.17 / 0.052 (Mourning Water's 0.17, Breakwater's 0.18);
  the call 0.50; the drag 0.20; the strain 0.25; under the surface 0.19; the
  after 0.15; the hush in the quiet 0.05 (FAST's 0.03).
- **Profile** (`GPU=1 scripts/profile-ultimate.ts`, 1920×1080, dev build, a
  shared machine at load 9): film p50 16.7ms / p95 16.8ms and 33.2ms over two
  runs, 12–13 of 243 frames over 20ms, 4 over 34ms (the call's and a shot's
  first frames); the round after p50 16.7 / p95 16.8, none over 34. Before the
  paths were folded: p95 33.3 (load 6) and 100 (load 28). Peak 1248 nodes
  (1192 SVG), 4 live effects, 0 filtered elements.

## Whole-body motion

Root keys, authored for the size each clip plays at: `ult:tide-hold` (a lean
back as the weight comes on: x −0.02, rotate −4°, squash 1.02), `ult:tide-strain`
(leant back and juddering, never settling: x −0.024 ↔ −0.032, rotate −4.6° ↔
−5.8°, squash to 1.03), `ult:tide-release` (let go of, it pitches forward off
the lean on the contact frame: x 0.018, rotate 3.5°, squash 0.96, then settles
to upright) and `ult:tide-lower` (the hand shaken out: three small rocks, x
0.006, rotate 1°). The close-up at the water's edge plays `ult:tide-strain`
with `root: false`. Nothing moves `.cine-look`.

## What the engine could not do, and what was built instead

- **Going under the surface is not a camera.** The camera pushes down and in
  on the row; the "under" is the near surface's layer drawing the sky above
  the line as a lit ceiling at 0.4–0.6 of the shot, with rays down through
  it. The engine would need a camera plane (above / below a line) for this to
  be one move.
- **Who was already Wet has no beat.** Undertow drags under, interrupts and
  strikes again anyone Wet before the tide turned, but `reveal` is `impact`,
  `ward` or `all`, and the segment does not say which enemies met the
  condition. So every enemy is drawn struck the same; the WINDUP chip leaving
  an enemy is what the player reads. The engine would need the conditional's
  targets on the segment.
- **Weak and Wet have no beat either.** The water left standing round every
  enemy on the board is drawn on all of them, whatever the round does with
  it; the status chips under them are the truth.
- **An interrupt has no beat.** The target's broken WINDUP is not revealed on
  the frame it happens; the drag in the film is its only drawing.
- **A clip plays at one rate in FULL and FAST.** The quiet's hush is its own
  shorter sound in FAST (`tide-hush-fast`).
