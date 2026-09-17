# Sunblind — Ranger · Gloomstalker

**The idea, in one sentence:** the Gloomstalker puts the low sun at its back
and looses a volley out of the glare, where every enemy is squinting and
nothing can be seen, so the only warning the row ever gets is the arrows' own
shadows racing across the white roof to its feet a heartbeat before the arrows
that cast them.

Only the Gloomstalker could have it. The path's title is the plot: *They
should not get to see it coming.* It traded the Ranger's patience and
visibility for speed and concealment (+3 speed, −6 HP), and the Ranger's
volley for **Shadow volley** (a whole row, Vulnerable). The drawing supplies
the kid: the smallest, youngest figure in the party, in a patched hood, with
a bow taller than it is. What not being seen means to a kid is not hiding in
the dark, where everyone looks for a thief. It is standing where nobody can
bear to look. A kid knows you cannot look at the sun. So the Gloomstalker
**hides in it**. The enemy is looking *at the light*, which is where the kid
is. And what the row sees last is not the kid and not the arrows. It is
their **shadows**.

The name is the gloom the kid really works in: shade. This is the brightest
film in the game, and the only dark things in it are shadows cast by a hard
sun. That is deliberate. It never goes dark, never shows a figure against a
night sky, and its quiet is a stopped-down glare, not a black screen.

## Gameplay (`ultimate-defs/rng-gloomstalker.ts`)

Target an enemy row, cost 100, **speed 24** (the fastest Ultimate in the
game):

1. the sun is in every enemy's eyes: **every enemy is Vulnerable this round**;
2. the row the volley falls on is **Vulnerable for two rounds**, applied
   *before* the arrows land, so the volley itself lands a quarter harder;
3. **18 precision** on every enemy in that row, which cashes in every Mark the
   party left there (EXPLOIT on each);
4. **+2 Focus**.

| | The Hundredth Mark (base) | **Sunblind** (Gloomstalker) |
| --- | --- | --- |
| Marks | lays one on **every** enemy for the party | lays **none**; **spends every Mark in the row** at once |
| The strike | one arrow, 24 through armour, on the target | a volley: 18 precision on **every enemy in a row**, no armour pierced |
| What it leaves the party | Marks to Exploit | an **opening**: every enemy Vulnerable this round, the struck row next round too |
| Order | speed 16 | **speed 24**: before every other Ultimate, so the party's own Ultimates that round land on Vulnerable |
| Focus | +2 | +2 |

It differs in what it does, not only in numbers. The Hundredth Mark is
patience made visible: it marks everything and finishes one. Sunblind is
unseen and fast: it marks nothing, pierces nothing, and turns the party's
setup into a whole row's damage in the first instant of the round, then
leaves the whole enemy side open. It is not False Footing (snare, Weak,
windups broken on Marked quarry): nobody is Weak, nothing is interrupted, and
nothing about it is defence. Nor Dry Flood (merged while this was authored:
a row set burning, Vulnerable only where it burns): nothing burns, and its
opening reaches the whole enemy side through no status of the party's. It is a team play two ways: Marks from a Quarry
sign, a Snare, a Hunter's sign or another Ranger are Exploits the volley
cashes, and every other hero's blow, and every other Ultimate queued that
round, lands on Vulnerable.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, stub
`null` and then Sunblind:

| Win rate | off | on, stub (Hundredth Mark) | **on, Sunblind** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 83% | **83%** |
| 3 players | 94% | 95% | **95%** |
| 4 players | 92% | 93% | **93%** |
| all | 91% | 93% | **93%** |

Nothing moves, because the Cipher is the deepest mentor and the bot trains a
Ranger into the Gloomstalker almost never in that sample (Ranger charge per
run 330 → 329 is the only difference). So it was weighed head to head, as
False Footing and Eyespot were: every Ranger plays one Ultimate's effects
whatever its path, on every 2nd composition with a Ranger in it, 10 seeds
(820 runs each; "no Ultimates" turns every class's off):

| Every Ranger plays | 2p | 3p | 4p | all | Ranger uses / run |
| --- | ---: | ---: | ---: | ---: | ---: |
| no Ultimates | 75% | 94% | 92% | 91% | — |
| The Hundredth Mark | 75% | 95% | 94% | 93% | 2.99 |
| False Footing | 83% | 99% | 96% | 96% | 3.15 |
| Sunblind, no field-wide Vulnerable | 70% | 94% | 94% | 93% | 2.91 |
| Sunblind at 14 | 70% | 95% | 93% | 92% | 2.97 |
| Sunblind at 22 | 68% | 96% | 94% | 93% | 2.88 |
| **Sunblind (18, shipped)** | **73%** | **95%** | **94%** | **93%** | **2.91** |

Level with the Hundredth Mark overall. Damage between 14 and 22 moves nothing
measurable; duos move two to five points between cuts, which at 164 duo runs
is noise. It sits under False Footing, whose defence is worth more to the bot
than any damage.

Tests: `tests/ultimates-sunblind.test.ts`.

## Space, palette, shape

- **Space: the white roofs, in the afternoon glare.** The flat, whitewashed
  roofs of a hill town under a hard low sun: a lone tower the kid has
  climbed, with the sun standing right over it; the drop to the street in
  deep blue shade, a ladder leaning across it; a lower terrace roof with a
  parapet, clay water jars and a drain spout, where the enemy row stands; and
  beyond, flat roofs and a dome or two stepping away to a bleached sky. It is
  the one film in daylight and the brightest space in the game. Not fog or a
  wood (the Hundredth Mark), not mud at dusk (False Footing), snow (Warpath),
  sand in a pit (Red Ledger), a ridge at dusk with a low sun on the horizon
  (Anthem), a moonlit meadow (Eyespot), a dark chamber (Still Life), a hall,
  forge, causeway, vault, mere, page, labyrinth, cutaway, no-man's-land, mirror
  room or theatre. The sun here is never a disc sitting on a horizon: it is a
  blinding blot high over the kid's roof, too bright to have an edge.
- **Palette:** plaster lit `#f4ecd6`, glare white `#fffbea`, a bleached sky
  going from white-gold round the sun `#fbf0c8` to pale grey-blue away from it
  `#d3dfe2`; shade on plaster `#8e98c4` and hard cast shadow `#3a4478` (cool
  shadows under a warm light), ink `#161a2c`; clay `#c98a4e` for jars. The
  accent, sun lemon `#ffe45c`, is kept for the sun and the title. Figures are
  lit hard from the left, the side the kid and the sun are on.
- **Shape language:** the **shadow** (a hard-edged dark shape lying on white
  plaster, longer than what cast it); the **glare** (a white bloom with long,
  uneven, hand-cut spokes, never a photographic flare); the **arrow** (the
  Ranger's own, red-fletched, taken from its hand, standing in stone).

## Signature effect — the shadows arrive first

With the sun low behind the archer, an arrow high in the air throws its
shadow far ahead of it along the ground; as it falls, the arrow catches up
with its shadow exactly where it lands. So the volley is seen from the row's
side only as **a comb of thin, sharp shadows sliding over the white roof
towards its feet**, and then **the arrows standing in the shadows' ends**. Every
enemy's own shadow is drawn too: a copy of the real figure laid flat along
the roof behind it, because the light is in its eyes.

## Sound

- **Motif (original):** four struck tubes of a rooftop wind chime, long and
  inharmonic: B5, F♯6, E6, then a low B4 left ringing. Struck metal tubes that
  ring for seconds, not coins (Foreclosure's short clinks), not a music box,
  not plucked (the Hundredth Mark), not a damped bar (False Footing).
- **Signature sound:** the volley falling out of the sun: a soft rush of many
  fletchings, pitched downward, that thickens as it comes and cuts dead at the
  impact.
- **Impact, layered:** a rapid run of dry *thocks* as heads bite plaster
  (transient), a sub drop, a crack of plaster and a spray of chips (body), and
  chalk dust sifting down with the chime's low B4 left ringing (tail).
- **The quiet:** music at 3%; no chime; a faint high hiss of heat off the
  roof and the falling volley so soft it is almost nothing, until in the
  last half of the shot its rush (`sb-fall`) swells up into the cut.

## Rhythm

identity (the kid's head rises across the sun: the glare goes out behind
the hood, the squint opens, a grin) → stakes and target (from far off,
the whole roofscape: the row on the terrace squinting into the sun, and in
the sun, if you look hard, a kid drawing a bow; title) → escalation (from
below the kid: four arrows loosed straight up in one breath; the sun flares
across the lens) → **quiet** (at the row's feet, stopped down: thin shadows
sliding over the white plaster towards them, and the row still looking up
into the light) → **impact** (the arrows standing in the ends of their
shadows, all along the row; plaster chips and chalk dust) → release (the real
board: every enemy standing in a hard pool of sun with its shadow thrown long
behind it, the struck row stuck round with arrows).

Once the camera is with the row, the kid is never seen except as a notch in
the sun, far off: the row never sees it, and neither does the camera.

## Shots — FULL 4700ms, FAST 2440ms (52%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Ranger `ult:sb-crouch`: drops low, the drawing hand to the hood's brim, the bow brought in | real battlefield bleached hot, bars close | lemon call aura; a glare blooms over the real Ranger's shoulder (`sb-sun`, anchored); a pool of sun lands under every real enemy and its shadow, a copy of its board figure, swings out long behind it (`sb-board` field) | call bell; `sb-glare` (a hot shimmer rising, one far chime); music ducks | on board | — | break the round: the light turns hard |
| 1 | Eclipse · face close-up | 620 (400) | tight on the face, easing up and in; the sun above and left of the hood | `ult:sb-eclipse` (`root: false`; the cue lifts the figure up and left across the sun): squinting hard in the glare, brow down and knit, mouth tight; the head rises over the sun; the eyes open wide in its own shade, the brow lifts, one corner of the mouth goes up | `sb-sky`, the glare sky over the roof edge; exposure 1 → 0.72; the glare rim round the hood; bounce light from the roof | the sun (`sb-sun`, back) swallowed by the hood, its spokes round the hood's edge | `sb-eclipse`: shimmer, a rustle of the hood, cut to a hush as the sun is covered; "Don't look at me. Look at the sun." | no | black 50ms | identity: the kid hides in the one place nobody can look |
| 2 | Glare · target wide | 1000 (—) | wide over the roofs, a slow truck right | the kid small on the tower's roof at the left, inside the sun, `ult:sb-rise`: up, a fresh arrow, the bow raised and drawn at the sky; `silhouette` | `sb-roofs`: a tower, a ladder across the drop to a terrace with a parapet and clay jars, the town stepping away; lit hard from the left | the sun behind the kid (`sb-sun`, back) and its spokes over the kid (`sb-sun`, front, no core), so the kid is a notch in the glare; **the real row** on the terrace, each with **its own shadow laid long behind it** (`sb-cast`); heat rising off the roof (`sb-heat`) | **motif** (chimes); a bow creak (`sb-draw`) | **the real row**, looking into the light (`anticipate` at 0.5) | cut | stakes and target: they are looking right at it; title |
| 3 | Loose · low angle | 560 (360) | from below the kid, Dutch 9° → 5°, rising | `ult:sb-volley` (release 0.16): the bow tipped up at the sky, four draws and looses in one breath, the hand flying back past the ear and over the shoulder for the next | `sb-sky`; the sun behind the kid's shoulder; glare rim | each loosed arrow (the real arrow, measured off the hand at the loose) climbs out of the bow along its streak and is gone into the sky (`sb-loosed`); at the end **the sun flares across the lens** and whites out the frame (`sb-flare` in) | `sb-loose`: four string snaps and hisses; `sb-flare` | no | cut | escalation: speed, and the volley already in the air |
| 4 | Shadows · the quiet | 600 (400) | at roof level on the row's legs, locked off | — (the kid is not on this side) | `sb-roofs` close; exposure 0.85 → 0.58: the glare stopping down; vignette 0.45 → 0.7 | the flare leaves the lens (`sb-flare` out); **a comb of thin, hard shadows slides in over the white plaster towards every enemy's feet**, fast and then creeping (`sb-shadows`); the row's own shadows behind it (`sb-cast`) | **music 3%**; `sb-hush` (heat hiss, the faintest fletching); from 0.52 the signature `sb-fall` swells up into the cut | **yes**, from the chest down, still, looking into the light | in-folder: the flare (`sb-flare`) | the quiet: what the row sees last, and does not look at |
| 5 | Volley · impact | 760 (560) | medium wide on the row, level, easing back | the kid far off in the sun, `ult:sb-after` (contact 0.08: the arrival); the row `hurt` at 0.08, shoved, tilted | `sb-roofs`, blown out then settling; the sun at the upper left | **two-tone frame (40ms)**: lemon and ink, the arrows coming in; then, held in colour: **three arrows in every enemy of the row and four in the plaster round its feet** (`sb-volley`, the real arrow, staggered along the row), each with a streak back to the sun and a shadow laid from its base; **plaster chips and chalk dust** boiling in three drawings; the row's shadows (`sb-cast`) | `sb-impact` (layered); **150ms stop**; heavy shake | **the row** | cut on the two-tone | impact: the volley and the damage on the held frame; "Heads down!" |
| 6 | Sunstruck · return | 740 (480) | battle camera | real Ranger `ult:sb-lower`: stands, the hand pushes the hood back, the bow down | real battlefield; the bleach lifts; bars open | **every real enemy in a lemon pool of sun with its shadow laid long behind it** (Vulnerable, `sb-board` field held); **the struck row stuck round with arrows, each with its shadow** (`sb-board` struck, staggered 90ms) | `sb-after`: the motif's last two chimes; `ult-tail` | on board | flash 80ms | release: the whole side open, the row struck |

FAST drops the wide; the title moves to the eclipse. It keeps the eclipse, the
volley loosed, the quiet with the real row in it, and the impact.

## Voice

"Don't look at me. Look at the sun." · "Heads down!" · "They never even
looked up."

## Framing

- **Large and boss.** The wide pulls back and sets the boss further along
  the terrace so it stands whole with its shadow. The quiet frames a boss from
  the shins down, the shadows arriving at its feet at its scale. The impact
  pulls back to take in the boss whole, with larger arrows, and a small shove.
- **Row size.** Every cinematic shot lays out one to three enemies along the
  terrace, each with its own shadow, shadows and arrows placed from where the
  stage really put each figure.

## Performance: the face

The Ranger is a face-layer hero, and the eclipse is the film's one face
close-up. It acts with `face()` from a squint to open eyes: the brow down
1.6–1.8 and knit 10–11°, the eyes to 0.18–0.22 of their height, the mouth
pressed (0.6–0.7) and widened, while the glare is beside the hood; then as the
head crosses the sun, the brow lifts (−0.8 to −1.1), the eyes open to 1.2–1.3,
and the mouth widens to 1.3 at one height: a grin. The head turns from 8° to
−3° as it rises. The low angle keeps a milder face (a set, narrow draw
opening into a small grin after the fourth loose). Nothing was added to
`Ranger.tsx`: the bowstring halves (`stringTop`, `stringBottom`) are solved
for every draw along any aim (`aimed()` in `poses.ts`), and False Footing's
close-up glove is untouched (it only shows where `--ff-reach` is set).

## Whole-body motion

Root keys, authored for the size each clip plays at: `ult:sb-crouch` (the
board: down 0.028, lean 3–4°, squash 1.07), `ult:sb-rise` (the wide, at a
tiny size: up out of the crouch, leaning back to −10° into the draw),
`ult:sb-volley` (the low angle: held at −10°, each loose rocking back x −0.026
and −13°), `ult:sb-after` (far off in the impact: settling from −6° to −2°)
and `ult:sb-lower` (the board: standing out of the crouch). `ult:sb-eclipse`
has a still root and its close-up cue sets **`root: false`**; the rise across
the sun is the cue's own `at → to`, so the face stays framed. Nothing is
built on `.cine-look`.

## Notes from the lab

- **Placed from probes.** In the eclipse at size 1000 the head's centre runs
  from (845, 586) to (699, 484) and the eyes to (786, 487); the sun is set at
  (690, 455), so it is above and left of the head at the start and behind the
  hood at the end. The loosed arrows leave from the drawn arrow's own box,
  measured on the frame of each loose.
- **The draw was solved, not posed.** The first cut hand-set the arm angles
  and the arrow floated clear of the string with the head behind the grip.
  `aimed(elevation, pull)` now turns the bow square to the line, solves the
  drawing arm (with the part's offset carrying what the arm cannot reach), and
  `drawn()` lays the arrow from the hand through the grip and meets the string
  halves at its nock. Between looses the hand goes back over the shoulder so
  the fresh arrow is not seen crossing the face.
- **The kid in the sun** was first lit, and read as a figure standing in
  front of a lamp. It is now a `silhouette` with the sun's core behind it and
  a second, coreless `sb-sun` in front, so its spokes cross the figure and it
  is a notch in the glare that still reads as a kid with a bow.
- **Shadows are copies of the real figures.** `sb-cast` clones each placed
  target's actor node once, strips its names, fills it with shade and lays it
  down about the feet (a quarter turn, stretched ×2.1, flattened ×0.22); the
  copy follows the live placement so a shove carries it. On the board,
  `sb-board` copies each enemy's `.combatant-rig` the same way. The first
  board shadows were flattened to smears; at ×0.5 across they read as the
  creature lying on the floor. The creatures' drawn glows are CSS
  `drop-shadow`s and came along in the copies (13 filtered elements); a
  shadow now drops every filter.
- **The quiet's shadows** first stopped as short dashes in one line and read
  as UI arrows. They are now one hard shape each (fletch, shaft, head) over a
  soft wider copy, nine per enemy spread in depth over the floor, long when
  they enter and shortening as they slow.
- **The flare** first crossed the frame too late to hide the cut. Its white
  heart is a frame and a half wide and covers the frame from 95% of the low
  angle; the quiet opens under it.
- **Row sizes.** The wide, quiet and impact spread a row 310–360 world units
  apart, so a two-enemy back row (Kiln Mender and Rivet Sniper) keeps each
  figure's arrows and shadow apart.
- **Sounds, rendered offline** (three renders each, peak and loudest-300ms
  RMS): `sb-impact` 1.27–1.46 / 0.250 against the Hundredth Mark's impact
  1.23–1.39 / 0.252 and False Footing's 1.14–1.24 / 0.247; the motif 0.18 /
  0.055 (theirs 0.15–0.17 / 0.051 and 0.25 / 0.054; first cut 0.22 / 0.065);
  the signature `sb-fall` 0.19–0.23 / 0.030 (first cut 0.08 / 0.005, inaudible,
  against `ff-rip` 0.27 / 0.045); the loose 0.19–0.21; the call's glare 0.12.

## Performance

`GPU=1 scripts/profile-ultimate.ts 5491 1920x1080` (dev build, shared
machine at load 7–9): film p50 16.7ms / p95 16.8ms, 4 frames over 34ms (at
its first frames); the round after it p50 16.7ms / p95 16.8ms, 0 over 34ms.
Peak 2,202 nodes (2,136 SVG), 4 live effects, **0 filtered elements**. The
node count is the shadow copies: each is a whole figure, copied once.

## What the engine could not do, and what was built instead

- **A figure's shadow.** No effect is handed a cast member, so `sb-cast`
  clones the stage's actor nodes and `sb-board` clones the board's rigs. A
  copy holds the pose it was copied in (it follows the placement, not the
  animation), so a shadow does not flinch with its figure. The engine would
  need a `slot` that hands an effect a live copy of any cast member, or a
  `shadow` look on an actor cue.
- **Every enemy on the board, from one cue.** `anchor: "targets"` reaches
  only the row the volley struck, but the whole side is Vulnerable; the
  field of pools and shadows is anchored on the caster and finds every enemy
  on the board itself. The engine would need `anchor: "enemies"`.
- **A status on an enemy the Ultimate did not damage is not in the cast**, so
  the other row's Vulnerable (this round) appears only on the board, never in
  the film's cinematic shots.
- **A row's reactions land together**: every enemy's `hurt` plays at 0.08; the
  arrows bite staggered along the row (35ms apart) inside `sb-volley`.
- **The occlusion is always a cape**: the flare across the lens is an
  in-folder screen effect straddling the cut (`in`, then `out`).
- **Pose at a time for a projectile.** The loosed arrows are measured off the
  drawn arrow on the first frame after each loose; a seek that lands late
  starts them a little further along.
