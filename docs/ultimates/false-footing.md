# False Footing — Ranger · Pathfinder

**The idea, in one sentence:** the Pathfinder reads the enemy's own tracks in
the mud until they say where its next foot will fall, and the snare is
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

- **Space: the hound run, at dusk.** The Ember Foundry keeps hunting packs,
  and they are run on a strip of waste ground behind the works: dark peat mud
  churned by a hundred paws, the leaning posts of an old run fence, tussocks
  of dead grass, and beyond it the foundry's spoil heaps and cold chimneys
  under a sky of old smoke. Nothing burns. The ground is all prints, most of
  them old: anyone can see hounds were here, and only a tracker finds the one
  trail that matters. Seen from the tracker's two heights: at eye level with
  the mud (the print, the step) and from above (the whole run, one trail read
  out of it). Not snow (Warpath), sand (Red Ledger), water (Mourning Water),
  a fog wood (the Hundredth Mark), roots under the floor (Green Reckoning), a
  held chamber (Still Life), nor any other film's hall, forge, ridge,
  causeway, vault, pit, garden, page, labyrinth, no-man's-land or mirrors. No
  cracks and nothing underground: the ground is read from on top of it, and
  the mud never shines, so it never reads as water.
- **Palette:** peat mud `#45372a` fading to `#5b4d3b` at the far edge, print
  hollows `#1d150f`, squeezed-up lips catching the sky `#8a775b`–`#a08a68`,
  smoke-khaki sky `#6a644c` over `#141310`, ink `#0f0c09`, dead grass
  `#7a6d45`; and one warm colour, amber `#f2a93b` (the accent), kept for what
  the Pathfinder *knows*: a print it has read, the step it foresaw, the cord
  of its snare. Figures are lit from below by the smoky sky bounced off the
  mud (`under` `#a39676`). Warm-dark and matt, where Warpath is pale, cold and
  blue-grey.
- **Shape language:** the **print** (a clawed pad pressed into mud, its rim
  squeezed up and lit on the far side, its hollow near black); the **ghost
  print** (the same shape as a dashed amber outline in untrodden mud); the
  **loop** (a running noose under a skin of mud, a gleam of cord); the
  **cord** (slack along the ground, then a straight line tearing up out of
  it); the **old prints** that cover the run, unlit.

## Signature effect — the trail read forward

Prints are the film's whole vocabulary, and the run is covered in them. Read,
a print's rim fills with amber from the kid's fingertip round both sides. From
above, out of a hundred old prints, the enemy's own tracks light one after
another from where it came from up to where it stands, and then — past its
feet, in untrodden mud — one more print appears, dashed: where its next foot
will fall. Under it a loop of cord shows through the mud, and the cord runs
back across the run to the kid's hand. On the impact the cord rips up out of
the mud along its whole length and whips round the enemy's legs in three
turns.

## Sound

- **Motif (original):** four footfalls tuned like a wooden marimba muffled in
  mud — A3, E4, D4, then a low A2 thud — uneven, like a stride with a limp in
  it. Struck and damped, not plucked and not blown (the Hundredth Mark's call
  is a plucked E4–A4–G4–E5; Warpath's is a war-horn on A2–C3–B2–E2).
- **Signature sound:** the cord tearing up out of mud — a fast zip of wet
  sucks along its length ending in a taut twang.
- **Impact, layered:** a whip-crack of cord (transient), a sub drop, a heavy
  slap of mud thrown up (body), and clods pattering back down (tail).
- **The quiet:** music at 3%, no wind, one slow step coming down in the mud.
  In the face before it, the thin whine of midges round the hood stops dead
  when the breath is held.

## Rhythm

identity (the fingertip on the print; it lights) → escalation and stakes (from
above: one trail read out of the churned run up to the enemy, the next step
foreseen, a snare under it, the cord back to the kid; title) → anticipation
(the face behind a bank of mud and dead grass: reading, the midges stop dead
as the breath is held, a small grin) → **quiet** (at the mud, the enemy walks
towards the dashed print in the dark; the midges hang) → **impact** (the cord
rips out of the mud and whips round its legs; the enemy's feet go out from
under it in a burst of mud) → release (the real board: a snare cinched at
every enemy's feet, the target's knotted and staked).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Ranger `ult:ff-kneel` — drops to one knee, the drawing hand to the floor, bow laid across | real battlefield tinted smoky dusk, bars close | amber call aura; prints press into the real floor behind every real enemy, lighting one by one towards its feet | call bell; a squelch; music ducks | on board | — | break the round: the kid gets down to read the ground |
| 1 | Read · extreme close-up | 640 (400) | at the mud's surface on one print, Dutch −6°, pushing in | `ult:ff-touch` (`root: false`) — the gloved drawing hand comes down into frame, two fingers on the print's squeezed-up rim, sliding along it | the run at eye level, old prints and clods, smoky under-light | **one print huge in the foreground**; its rim lights amber from the fingertip both ways; crumbs of mud tip into it | fingertip on wet mud; a low damped note | no | black 50ms | identity: a hand that reads a track |
| 2 | Trail · high wide | 1000 (—) | from above over the run, drifting down the trail | Ranger small, lower left, `ult:ff-watch` — kneeling, head up, cord in hand | the run from above: old prints everywhere, clods, fence posts | **the real enemy line** standing on the run; **each enemy's own trail lights print by print out of the old ones up to its feet**, then **one dashed print ahead** of it, a **loop** showing under it, and **the cords** running back across the mud to the kid's hand; the target's brightest; midges | **motif** (four footfalls); soft steps | **every enemy**, unaware | in-folder: mud flung across the lens (`ff-spray`) | stakes and escalation; title |
| 3 | Know · face close-up | 560 (360) | on the face low behind a bank of mud and dead grass, level, slow drift | `ult:ff-know` (`root: false`) — brow knits reading, eyes narrow and glance; the breath is held; the brow lifts, a slow grin | the run, low exposure, bars deepen | **midges** round the hood that **stop dead in the air** at the held breath; the bank in front | a thin midge whine that stops; cord creak; music 12% | no | cut | anticipation: it knows |
| 4 | Step · the quiet, low profile | 600 (400) | at mud level, dead still | — | the run near black (exposure 0.46 → 0.34) | the target walks towards the **dashed print**; the **loop** under its skin of mud; the cord slack along the ground to the left edge; **the midges hang still** | music 3%; one slow step in the mud | **yes** — `approach`, walking in | cut | anticipation by subtraction: it steps where it was read |
| 5 | Spring · impact | 760 (560) | low wide at the mud, Dutch −7° easing out | `ult:ff-haul` — the kid hauls back with the whole body; target `hurt`, feet yanked towards the kid, tilted | exposure blown to 1, then settling; a smoke-pale glare thrown up behind the target (`ff-glare`) | **two-tone frame (40ms)**: the enemy black against the glare, the kid black at the left, the cord a line between; then, held in colour: **the cord taut out of the mud** with clods torn off it along its length, **three turns of cord round the enemy's legs** (`ff-hobble`), a **burst of mud** in uneven clods boiling in three drawings | cord rip + layered impact; **150ms stop**; heavy shake | **yes** | cut on the two-tone frame | impact: the result on the frame; damage |
| 6 | Snared · return | 760 (480) | battle camera | real Ranger `ult:ff-coil` — stands, winds the cord in, bow back up | real battlefield; the dusk tint lifts; bars open | **a snare cinched at every real enemy's feet**, one after another, each with a splash of mud and a cord staked off along the floor; **the target's knotted twice with an amber tag** (Marked, hobbled) | a creak and cinch for each; tail | on board | flash 80ms | release: every enemy caught, the one that mattered hobbled |

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
  read shot, without it, was a brown disc on a blob.
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
- **The wipe** (`ff-spray`) was first a flat sheet with a straight
  edge that read as a UI panel. Its edge is now a column of overlapping soft
  clumps with grains flung ahead, entering from the left over the read and
  leaving off the right of the high wide (or the face, in FAST).
- The bank in front of the face and the effects in the quiet are not dimmed
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

## Re-grounded: from snow to the hound run

The first cut was set in a snowfield at the blue hour. Warpath (the
Warlord's Ultimate) merged in the meantime with a snowfield, a trench through
deep snow and boot prints in its return, so two films owned the same ground.
The idea, gameplay, the face, the impact and its held frame, the return and
the glove were kept; the ground, palette, weather and sounds were changed:

- **Why mud, and why the hound run.** A tracker in this game reads the
  ground the enemy walked, and the first chambers belong to the Ember
  Foundry's hunting packs. Soft mud takes the deepest, sharpest prints there
  are, with rims squeezed up that catch light, so a print still reads as a
  print at every size, from the read close-up to the board. And a run is
  already covered in prints, which makes the tracker's skill the picture:
  one trail found among a hundred. Dust on flagstones was considered and set
  aside: its prints are faint at board scale, and a dark dungeon chamber is
  Still Life's.
- **Changed:** both backgrounds (`ff-field`, `ff-high`) redrawn as the run;
  prints, loop, cord, burst, board marks and the lens wipe re-paletted to mud
  and amber; the falling flakes became midges (`ff-midges`), which stop dead
  when the breath is held, replacing the breath clouds (Warpath's warcry is
  drawn as breath); the drift became a bank of mud and dead grass
  (`ff-bank`); a smoke-pale glare (`ff-glare`) behind the bite, because dark
  mud goes black in the two-tone frame and the enemy vanished into it; the
  snow crunches became mud squelches (`ff-squelch`, `ff-hold`, and the rip,
  impact and motif footfalls).
- **Levels after the change:** `ff-impact` 1.13 / 0.247 against the
  Hundredth Mark's 1.16 / 0.253; the motif 0.26 / 0.054; the rip 0.27 /
  0.045.

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
