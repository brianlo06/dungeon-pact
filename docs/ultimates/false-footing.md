# False Footing — Ranger · Pathfinder

**The idea, in one sentence:** the Pathfinder reads the enemy's own tracks in
fresh snow until they say where its next foot will fall, and the snare is
already waiting under that exact spot when it does.

Only the Pathfinder could have it. The path's title is the plot: *Know the
ground and it stops being their ground.* It gave up the Ranger's Quarry sign
for **Snare** (8, Mark, Weak) and took a heavier, steadier body (+16 HP, +2
guard) — the kit of someone who does not win with the killing shot but with
knowing the field. So the film looses no arrow. Its hero kneels, touches a
print, looks up, and waits; the enemy walks itself into what the kid laid,
and the kid hauls the cord. The Ranger's drawing supplies the reader: the
youngest face in the party, a kid in a patched hood, low to the ground, bow
held down, a hand that can read a track.

## Gameplay (`ultimate-defs/rng-pathfinder.ts`)

Target an enemy, cost 100, speed 18:

1. any enemy **already Marked** — the target included — goes down mid-stride:
   its **WINDUP is broken** (read before the bite, because the bite spends the
   Mark);
2. the target is snared: **16 precision** (an existing Mark is cashed:
   EXPLOIT, +20), then **Marked** again (3 rounds) and hobbled, **Weak for 2
   rounds**;
3. every other enemy stumbles on the snare line: **Weak this round**, and a
   0-base, non-precision sliver (the film's cast; it never spends a Mark);
4. **+2 Focus**.

It differs from the Hundredth Mark in what it does. The base Ultimate is
offence: 24 through armour, and a Mark on every enemy for the party to spend.
False Footing is the party kept safe on ground it has read: nothing through
armour and no Marks handed out; every enemy blow this round a third lighter,
the one that mattered hobbled for two rounds, and windups broken wherever the
party had already found its quarry. A team play both ways: a Mark from a
Snare, a Hunter's sign or another Ranger sets up the trip, and the Mark it
leaves on the target is an Exploit waiting for the next precision hit.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, stub
`null` then False Footing:

| win rate | off | on (stub null) | on (False Footing) |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 83% | 83% |
| 3 players | 94% | 95% | 95% |
| 4 players | 92% | 93% | 93% |
| all | 91% | 93% | 93% |

It does not move, because the bot trains a Ranger into the Pathfinder rarely.
So it was also weighed head to head: every Ranger playing one Ultimate's
effects whatever its path, every Ranger party in every 2nd composition, all
Ultimates on, 10 seeds (820 runs each):

| Every Ranger plays | seeds | 2p | 3p | 4p | all |
| --- | ---: | ---: | ---: | ---: | ---: |
| The Hundredth Mark | 10 | 93% | 93% | 93% | 93% |
| first cut: every target's windup broken, 16, Weak 2 | 4 | 94% | 97% | 96% | 96% |
| first cut, 10 instead of 16 | 10 | 90% | 96% | 96% | 95% |
| first cut, target Weak 1 round | 10 | 95% | 95% | 95% | 95% |
| first cut, no interrupt at all | 10 | 95% | 94% | 94% | 94% |
| **False Footing** (windup broken only on Marked quarry) | 10 | **93%** | **94%** | **95%** | **94%** |

The first cut sat two to three points over the base. Damage and the length
of the target's Weak moved nothing measurable; the unconditional interrupt
was worth about two points, so the trip was kept for quarry the party has
already tracked, which is also the better team play. False Footing lands a
point over the Hundredth Mark, inside the noise of 820 runs. Ranger uses per
run in the head to head: 3.97 with the base, 4.17 with False Footing (it
charges a little faster: Weak on every enemy is Setup, which the Ranger earns
at ×1.5).

Tests: `tests/ultimates-false-footing.test.ts`.

## Space, palette, shape

- **Space: the snowfield in the blue hour.** Fresh snow just after it stopped
  falling, a long white field under a slate sky with no sun and no moon, low
  drifts, a far line of bare hills, and nothing in it but tracks. Seen from the
  tracker's two heights: at eye level with the snow (the print, the step) and
  from above (the whole trail read at once). Not a hall, a forge, a storm, a
  fog wood, a causeway, a ridge at dusk, a vault, a pit, a mere, a moth garden,
  a page, a labyrinth, a no-man's-land, a mirror room or the ground cut away.
  No roots, no cracks, no water, no underground. The ground is read from on
  top of it.
- **Palette:** snow shadow blue `#6f86b8`, dusk ink `#0e1426`, lit snow
  `#e3ebf7`, and one warm colour, amber `#f2a93b` (the accent), kept for what
  the Pathfinder *knows*: a print it has read, the next step it has foreseen,
  the cord of its snare. Figures are lit from below by the snow (`under`), a
  cold bounce, never a rim of their own colour.
- **Shape language:** the **print** (a clawed pad dented in snow, with a lit
  far rim and a blue-shadowed hollow); the **ghost print** (the same shape as
  a dashed amber outline in untouched snow); the **loop** (a running noose
  just under the surface, a gleam of cord); the **cord** (slack and sagging,
  then a straight line tearing up out of the snow).

## Signature effect — the trail read forward

Prints are the film's whole vocabulary. Read, a print's rim fills with amber
from the kid's fingertip round both sides. From above, the enemy's tracks
light one after another from where it came from up to where it stands, and
then — past its feet, in unmarked snow — one more print appears, dashed:
where its next foot will fall. Under it a loop of cord shows through the snow,
and the cord runs back across the field to the kid's hand. On the impact the
cord rips up out of the snow along its whole length and the loop cinches.

## Sound

- **Motif (original):** four footfalls tuned like a wooden marimba muffled in
  snow — A3, E4, D4, then a low A2 thud — uneven, like a stride with a limp in
  it. Struck and damped, not plucked and not blown (the Hundredth Mark's call
  is a plucked E4–A4–G4–E5).
- **Signature sound:** the cord ripping up out of crusted snow — a fast zip of
  crunches along its length ending in a taut twang.
- **Impact, layered:** a whip-crack of cord (transient), a sub drop, a heavy
  snow thump with a body of crunched ice (body), and a long powder hiss
  falling back (tail).
- **The quiet:** music at 3%, the wind is gone, one slow crunch of the enemy's
  step, and the kid's breath held.

## Rhythm

identity (the fingertip on the print; it lights) → escalation and stakes (from
above: the whole trail read up to the enemy, the next step foreseen, a snare
under it, the cord back to the kid; title) → anticipation (the face in the
cold: reading, the breath clouds stop, a small grin) → **quiet** (at the snow,
the enemy walks towards the dashed print in the dark; nothing else moves, the
flakes hang) → **impact** (the cord rips out of the snow; the loop bites; the
enemy's feet go out from under it in a burst of snow) → release (the real
board: a snare cinched at every enemy's feet, the target's knotted and staked).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Ranger `ult:ff-kneel` — drops to one knee, the drawing hand to the floor, bow laid across | real battlefield tinted blue-hour, bars close | amber call aura; prints dent the real floor behind every real enemy, lighting one by one towards its feet | call bell; a crunch; music ducks | on board | — | break the round: the kid gets down to read the ground |
| 1 | Read · extreme close-up | 640 (400) | at the snow surface on one print, Dutch −6°, pushing in | `ult:ff-touch` (`root: false`) — the drawing hand comes down into frame, two fingers on the print's rim, sliding along it | snowfield at eye level, low exposure, cold under-light | **one print huge in the foreground**; its rim lights amber from the fingertip both ways; crumbs of snow tip into it | fingertip in dry snow; a low damped note | no | black 50ms | identity: a hand that reads a track |
| 2 | Trail · high wide | 1000 (—) | from above over the field, drifting down the trail | Ranger small, lower left, `ult:ff-watch` — kneeling, head up, cord in hand | snowfield from above | **the real enemy line** standing in the snow; **each enemy's trail lights print by print up to its feet**, then **one dashed print ahead** of it, a **loop** showing under it, and **the cords** running back across the snow to the kid's hand; the target's brightest | **motif** (four footfalls); crunches | **every enemy**, unaware | in-folder: a spray of powder thrown across the lens from the print | stakes and escalation; title |
| 3 | Know · face close-up | 560 (360) | on the face low behind a drift lip, level, slow drift | `ult:ff-know` (`root: false`) — brow knits reading, eyes narrow and glance, breath clouds; then the breath stops, the brow lifts, a slow grin | snowfield, low exposure, bars deepen | **breath clouds** from the mouth that stop; **the cord** wound in the fist, running out of frame, trembling taut | breath out, breath out, held; cord creak; music 12% | no | cut | anticipation: it knows |
| 4 | Step · the quiet, low profile | 600 (400) | at snow level, dead still | — | snowfield near black (exposure 0.3 → 0.2) | the target walks towards the **dashed print**; the **loop** under the snow; the cord slack along the snow to the left edge; **the flakes hang still** | music 3%; one slow crunch; a held breath | **yes** — `approach`, walking in | cut | anticipation by subtraction: it steps where it was read |
| 5 | Spring · impact | 760 (560) | low wide at the snow, Dutch −7° easing out | `ult:ff-haul` — the kid hauls back with the whole body; target `hurt`, feet yanked towards the kid, tilted | exposure blown to 1, then settling; snow glare behind the target | **two-tone frame (40ms)**: the enemy's silhouette in a white burst with the cord a black line; then in colour: **the cord tears out of the snow** along its length, the **loop cinches**, a **snow burst** boils (three drawings) with chunks | cord rip + layered impact; **150ms stop**; heavy shake | **yes** | cut on the two-tone frame | impact: the result on the frame; damage |
| 6 | Snared · return | 760 (480) | battle camera | real Ranger `ult:ff-coil` — stands, winds the cord in, bow back up | real battlefield; the blue-hour tint lifts; bars open | **a snare cinched at every real enemy's feet**, one after another, each with a puff of snow and a cord staked off along the floor; **the target's knotted twice with an amber tag** (Marked, hobbled) | a creak and cinch for each; tail | on board | flash 80ms | release: every enemy caught, the one that mattered hobbled |

FULL 4740ms, FAST 2440ms (51%). FAST drops the high wide (the title moves to
the read shot) and keeps the read, the face, the quiet with the target in it,
and the impact.

## Voice

"Hold on. Let me read you." · "Watch your step!" · "Stay on my prints.
Nothing out there bites."

## Framing

- **Large and boss.** The high wide pulls back so a boss stands whole in the
  field with its trail under it; the quiet sets the target smaller and further
  so a boss walks whole into frame; the impact pulls back, the kid smaller,
  and a boss is dragged down to a knee (a small shove down and a slight tilt)
  under a larger burst, rather than flipped.
- **Party size** does not change the film: the cast is the Ranger and every
  enemy (the sliver). The allies are not in it.

## Notes from the lab

- Every camera and effect was placed from probed positions
  (`scripts/probe-ultimate.ts`): the drawing hand at size 1300 in the read,
  the eyes (world ~(747, 599)) and mouth (~(757, 660)) at size 1000 in the
  face, and the hauling hand in the impact (behind the kid, ground offset
  (−0.54, 0.29) of its drawn height), which is where the cord is tied off.
- **The reading hand is drawn in `Ranger.tsx`**, inside the `draw` part: a
  fingerless glove with two fingers out, rendered only in an Ultimate's
  close-up copy (`CloseUpContext`) and shown only where a film sets
  `--ff-reach` (this film's `read` shot, by a CSS rule on
  `[data-cinematic][data-shot]`). The mitten circle fades out by the same
  variable. A round's Ranger and every other film are unchanged. The first
  read shot, without it, was a brown disc on a blue blob.
- In the read the drawing arm is posed a little long (`scale` 1.25, carried
  forward 0.27) so the hand reaches past the knee onto the print; its
  shoulder is out of frame.
- **The kneel is built from parts, not the root**: the legs fold about the
  boots (scale/squash) and everything above them comes down by 0.13, so the
  boots stay on the ground in every shot.
- **The trail is placed from the cast.** `ff-trail` draws room for six
  trails and its frame function puts one on each enemy the stage really
  placed (`targets-i`), sizes the prints from each figure's drawn height,
  hides the rest, and runs each cord back to the kid's hand. The prints on the
  trail and the board are drawn light (lip, hollow, rim), which took the
  film's peak from 2363 to 1957 nodes.
- **The snare, sprung, was first a noose cinched round the ground point**,
  which read as a halo floating between a hound's legs. It is now
  `ff-hobble`: three turns of cord across the lower quarter of the figure,
  sized from its drawn height, knotted where the line comes in, which reads
  on a hound, the Bulwark and the Collector alike.
- **The burst was first a white lotus** (symmetric petals and a centre
  ellipse). It is now uneven clumps and torn-loose lumps, boiling between
  three drawings, starting at 85% of its size so it is already there on the
  held frame, and smaller so the figure still reads through it.
- **The impact flash was removed.** A flash accent is a screen-blended solid
  at full strength whatever its `amount`, so a 70ms flash after the stop was
  a blank pale frame straight after the result. The two-tone frame (40ms) is
  the accent and ends before the stop, so the held frame is in colour.
- **The powder wipe** (`ff-spray`) was first a flat sheet with a straight
  edge that read as a UI panel. Its edge is now a column of overlapping soft
  clumps with grains flung ahead, entering from the left over the read and
  leaving off the right of the high wide (or the face, in FAST).
- The drift in front of the face and the effects in the quiet are not dimmed
  by the shot's exposure (only the background is), so they are drawn in the
  darker values of the shot they are in.
- Sounds were rendered offline (`OfflineAudioContext`, peak and loudest-300ms
  RMS): `ff-impact` 1.19 / 0.246 against the Hundredth Mark's impact 1.24 /
  0.251 and Mourning Water's 1.33 / 0.293; the motif 0.25 / 0.052 against
  0.19 / 0.051 and 0.19 / 0.078 (first cut 0.42 / 0.077, its low thud
  lowered); the signature `ff-rip` 0.27 / 0.045.
- Root keys: `ult:ff-kneel` (battlefield: x 0.02, y 0.01, leans 7°),
  `ult:ff-watch` (the high wide: a breathing rock of 1.4–2°),
  `ult:ff-haul` (the impact wide: thrown back x −0.085, 16°) and
  `ult:ff-coil` (battlefield, settling back from the haul). The close-ups
  `ult:ff-touch` and `ult:ff-know` keep a still root and their cues set
  `root: false`. No whole-body motion is built on `.cine-look`.
- Profile (1920×1080, real GPU, dev build, shared machine under load): film
  p50 16.7ms / p95 33.4ms, 10 frames over 34ms; the round after it p50 16.7ms
  / p95 33.4ms, 9 over 34ms. Peak 1957 nodes (1825 SVG), 3 live effects, 0
  filtered elements.

## What the engine could not do, and what was built instead

- **The rest of the line is not in the cast.** Weak is a status and logs no
  beat, so every other enemy takes a 0-base, non-precision sliver (the
  Pathfinder's power less guard, at least 1) to be in the film. The engine
  would need an Ultimate's status effects to count as reach.
- **One reveal covers every target**, and a row's reactions land together:
  the impact shows the one target, and every other enemy's snare lands in
  the return, staggered by the anchor's own `stagger` (90ms).
- **The occlusion object is always a cape**: the cut from the print to the
  field is an in-folder screen effect (`ff-spray`).
- **A result on the frame.** Mark, Weak and the interrupt leave the board's
  status chips as their only record; the film draws them itself (the
  hobble, the double loop and amber tag on the board's target). Presentation
  copies do not carry statuses from before the cast, so the film cannot show
  that a target was already Marked (and so tripped, EXPLOIT): the damage
  number and the board's INTERRUPTED say it.
- **A clip plays at one rate**: the quiet's walk is the enemy's own
  `approach` loop at its own speed while the actor cue slides it forward;
  the camera, not the walk, is held.
