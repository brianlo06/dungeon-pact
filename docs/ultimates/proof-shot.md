# Proof Shot — Ranger · Sharpshooter

**The idea, in one sentence:** from the far end of the proving range, where
the target is no bigger than a thumbnail, the Sharpshooter puts one arrow
through the plate hung in front of it, and the second through the hole the
first one made.

Only the Sharpshooter could have it. The path's title is the plot: *Armour is
just a slower target.* It traded True shot for **Piercing shot** (22 through
armour, +1 Focus) and took +3 power: not the Ranger who chooses between a
hundred shots, nor the one who reads the ground or hides in the light, but
the one who goes through whatever the target it chose is wearing, from as
far off as it likes. So the film's materials are the two things the path is
made of: **distance** and **armour**. Its space is a range built for proving
armour, where plates are hung on frames and shot to see whether they hold.
The drawing supplies the marksman: a kid in a patched hood with a bow taller
than it is, freckles, a drawing hand that can be opened to read the wind and
closed to a thumb held up at arm's length; and the bowstring in two halves,
which lets a loose be drawn.

## Gameplay (`ultimate-defs/rng-sharpshooter.ts`)

Target an enemy, cost 100, **speed 4** (it resolves after most other
Ultimates, so it lands on whatever the party has already opened):

1. the target's **Barrier is stripped**: the plate comes off first;
2. **the proof shot**: 8 precision through armour (a Mark the party left
   there is cashed: EXPLOIT); the arrow standing in the target is its
   **Mark**, for one round;
3. **the second shot**: 8 precision through armour into the same hole,
   which cashes that Mark: a second **EXPLOIT**, always;
4. the armour has a hole in it now: the target is **Vulnerable for 2
   rounds**;
5. **+2 Focus**, one per shot, as Piercing shot earns it.

| | The Hundredth Mark (base) | **Proof Shot** (Sharpshooter) |
| --- | --- | --- |
| Marks | one on **every** enemy, for the party | **none for the party**; its own, spent by its own second arrow |
| The strike | one arrow, 24 through armour | **two** arrows, 8 + 8 through armour, the second an Exploit (8 + 7 + 8 + 7 + 20 = 50 at the path's power) |
| Barrier | absorbs the shot | **stripped** first |
| What it leaves the party | Marks to Exploit | **one target Vulnerable for two rounds** |
| Reach | every enemy | **one enemy**, nothing else touched |
| Order | speed 16 | **speed 4**: after most other Ultimates |
| Focus | +2 | +2 |

It differs in what it does, not only in numbers. The Hundredth Mark marks
everything and finishes one; Proof Shot marks nothing for anyone, reaches no
second enemy, strips Barrier, strikes twice and leaves an opening on one
target instead of Marks on all of them. It is not False Footing (snare, Weak,
windups broken) nor Sunblind (a row volley, the whole side Vulnerable,
fastest): nobody else is touched, and it is the slow one. A team play through
the reaction system both ways: a Quarry sign, a Snare or a Hunter's sign on
the target is a third Exploit the proof shot cashes, and the Vulnerable it
leaves is a quarter more on every blow the party lands there for two rounds,
the other Ultimates of that round included, since this one resolves after
them.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, stub
`null` and then Proof Shot:

| Win rate | off | on, stub (Hundredth Mark) | **on, Proof Shot** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 79% | **79%** |
| 3 players | 94% | 95% | **95%** |
| 4 players | 92% | 93% | **95%** |
| all | 91% | 93% | **94%** |

Ranger uses per run 3.24 → 3.14, charge 329 → 324: the bot trains a Ranger
into the Sharpshooter more often than into the other two paths (the
Whetstone is the first mentor), so unlike False Footing and Sunblind this one
registers in the whole-game matrix; "all" moves one point. It was also
weighed head to head, as those two were: every Ranger plays one Ultimate's
effects whatever its path, every Ranger party in every 2nd composition, 4
seeds (328 runs each; "none" turns every class's off):

| Every Ranger plays | 2p | 3p | 4p | all | Ranger uses / run |
| --- | ---: | ---: | ---: | ---: | ---: |
| none | 81% | 94% | 90% | 91% | — |
| The Hundredth Mark | 75% | 94% | 95% | 94% | 3.13 |
| 12 + 12, Vulnerable 2 (first cut) | 81% | 100% | 98% | 97% | 2.91 |
| 14 + 14, Vulnerable 2 | 88% | 100% | 98% | 98% | 2.92 |
| 10 + 10, Vulnerable 2 | 81% | 100% | 96% | 96% | 2.95 |
| 12 + 12, no Vulnerable | 69% | 99% | 95% | 95% | 2.96 |
| 12 + 12, Vulnerable 1 | 75% | 100% | 96% | 96% | 2.92 |
| 12 + 12, Barrier not stripped | 69% | 100% | 97% | 96% | 2.92 |
| 10 + 10, Vulnerable 1 | 75% | 100% | 95% | 95% | 2.99 |
| 6 + 6, Vulnerable 2 | 75% | 97% | 95% | 94% | 3.01 |
| 8 + 8, Vulnerable 1 | 81% | 97% | 94% | 94% | 3.01 |
| **8 + 8, Vulnerable 2 (shipped)** | **81%** | **99%** | **95%** | **95%** | **2.96** |

The first cut sat three points over the base: two guaranteed Exploits and a
two-round opening is a lot on one target. The damage is the lever that
moved it (14 → 12 → 10 → 8 walks it down a point at a time); the
Vulnerable's length moved it less, and taking it away cost duos six points
while leaving the total high. 8 + 8 with the two-round opening lands a point
over the Hundredth Mark, inside the noise of 328 runs, with the opening —
the team play — kept whole.

Tests: `tests/ultimates-proof-shot.test.ts`.

## Space, palette, shape

- **Space: the proof range.** Where the armourers' guild proves its plates: a
  long, straight lane of packed black cinder between two low earth banks,
  running away from the lens to a great earth butt at the far end under an
  even pewter sky. Along the lane, at intervals, iron frames with breastplates
  hung from them by chains, every one holed by old shots (proof marks), each
  frame further and smaller than the last; white pace lines across the
  cinder, weathered; and at the far end a tall pole with a long wind streamer
  on it, the range flag, and beside it the last frame with a plate hung in
  front of whatever stands at the butt. It is overcast: no sun, no glare, no
  shadows worth the name, no fog, no snow, no mud, no water, no wood, no
  roofs. Not a hall, forge, vault, ridge, meadow, mere, pit, page, labyrinth,
  no-man's-land, spillway, sink, theatre, loft or mirror room. The only
  weather is wind, and the film is about waiting for it to drop. Seen from
  both ends: from the shooting line (the kid large, the target a speck at
  the butt) and from the butt (the target large, the kid a speck at the
  line). **Distance goes blue**: the far end of the lane, whichever end that
  is, is hazed into the accent.
- **Palette:** cinder `#26282b`, banks `#4c524b`, pewter sky `#9aa3ab` going
  to `#c5cbd0` at the horizon, plate steel `#8b96a2` with rust bloom
  `#6e4a35`, iron `#1b1d20`, pace lines `#d9dde0` weathered, ink `#111418`;
  the accent, far blue `#6a9bff`, kept for distance (the haze at the far end,
  the bands on the pace posts) and for the fresh proof mark (steel turned
  outward, and the light through the hole). One warm colour: the streamer's
  faded oxblood `#8a3b30`, the same red as the fletching on the kid's arrows.
  Cold, matt and grey where the Hundredth Mark is pale green, False Footing
  warm-dark, Sunblind white and lemon.
- **Shape language:** the **plate** (a breastplate, a rounded trapezoid with a
  neck cut-out, hung by a chain from an iron frame); the **proof mark** (a
  small ragged hole with a bright turned-out rim, sky showing through it);
  the **pace line** (a white stripe across the lane, further and thinner);
  the **streamer** (a long narrow cloth tapering off a pole); the **thumb**
  held up at arm's length, which is how far away a thing is.

## Signature effect — the second arrow through the first

The first arrow punches through the plate and into the target behind it; the
plate is knocked off its hook by the blow and spins away to the ground. Then,
on the same line, the second arrow arrives and **splits the first's shaft**,
its halves bursting outward, and stands in the same hole. On the held frame:
the plate lying at the target's feet with one proof mark through it, the
second arrow in the target with the split halves of the first about it, and
the hole in the target's side shining the accent's cold blue: open.

## Sound

- **Motif (original):** four proof plates rung at increasing distance: a
  hammer on a hung breastplate, D3, then F3, A3 and D4, each one further off,
  softer, duller and a little later than the last, until the fourth is almost
  only its room. Struck steel that gets far away; not plucked gut (the
  Hundredth Mark), a damped bar in mud (False Footing), chime tubes
  (Sunblind), a horn, a drum or coins.
- **Signature sound:** steel punched through: a bright hard crack with a
  short metallic ring behind it, and a second, smaller one with the dry
  split of a shaft in it.
- **Impact, layered:** the punch through plate (transient), a sub drop, the
  plate's clang and the thud into the target (body), and the plate's ring
  dying under a rattle of chain, then the plate hitting the cinder half a
  second later (tail).
- **The quiet:** music at 3%; the wind falling away to nothing; the cloth of
  the streamer settling; then only air.

## Rhythm

identity (a pinch of cinder let go from an open hand, streaming sideways in
the wind: the marksman reads the wind first) → stakes and target (the range
from the shooting line: the kid side-on with its thumb held up at arm's
length, and at the far end, the size of its thumbnail, the real target behind
its plate with the streamer flying above it; the thumb comes down and the
bow comes up; title) → anticipation (the face at full draw: the eyes close,
the breath goes out, the eyes open calm, and the string snaps past the cheek
twice in one breath) → **quiet** (at the far end: the streamer drops and
hangs still, the target stands unaware behind its plate, and nothing
arrives) → **impact** (the first arrow through the plate and the plate
spinning away; the second through the first) → release (the real board: the
target with the arrows in it, the holed plate at its feet, the hole shining;
the kid lowers the bow).

Once the loose is made the kid is never seen except as a speck at the far end
of the lane: the shot arrives before the sound of it.

## Shots — FULL 4680ms, FAST 2420ms (52%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Ranger `ult:ps-step`: half a pace back, the bow brought up level | real battlefield goes pewter, bars close | far-blue call aura; **pace lines** drawn across the real floor from the kid to its target (`ps-board` paces); grit blowing low across the board (`ps-wind`) | call bell; a gust (`ps-gust`); music ducks | on board | — | break the round: the kid steps *back* to shoot |
| 1 | Wind · extreme close-up | 560 (360) | at hip height on the drawing hand, Dutch −5°, a slow push | `ult:ps-wind` (`root: false`): the drawing hand comes out low and opens; a pinch of cinder is let go | the range at eye level, the near pace line, exposure 0.75; far-blue rim | **the open hand** (a close-up-only hand in `Ranger.tsx`, shown by `--ps-open`); **grit** falling from it and streaming off right in the wind (`ps-grit`); grit across the frame (`ps-wind`) | `ps-grit`: a dry hiss and the wind; "Stay there. It's a long way. You won't hear it." | no | cut | identity: it reads the wind first |
| 2 | Range · wide | 1000 (—) | wide along the lane from beside the shooting line, a slow push; the kid left, the lane running away to the butt at the upper right | `ult:ps-range`: side-on, the arm straight out with **the thumb up** (`--ps-thumb`); the arm drops, the hand goes to the quiver, nocks, and draws to the cheek by the end | `ps-lane`: the frames with holed plates receding, the pace lines, the banks, the butt far off in blue haze; pewter sky | **the real target, tiny, at the far end** behind the last frame's plate (`ps-plate` hung), the streamer flying above it (`ps-streamer`); grit blowing (`ps-wind`) | **motif** (four plates rung, each further); the streamer snapping; a bow creak | **yes**, a speck, unaware (`idle`) | cut | stakes and distance: the target is the size of a thumbnail; title |
| 3 | Breath · face close-up | 600 (380) | tight on the face over the string, level, a slow drift in; exposure falling | `ult:ps-breath` (`root: false`): full draw held; the eyes narrow, **close**, the mouth lets a breath out and shuts, the eyes open calm; the loose at 0.66 (the string past the cheek, the head knocked back a hair), the hand back to the quiver, a second arrow nocked and drawn, the second loose at 0.9 | `ps-lane` near-black (exposure 0.55 → 0.4), far-blue rim, bars deepen | the string halves snapping straight and shivering; at the end **the streamer's cloth crosses the lens** (`ps-streamer` wipe, in) | music 12%; `ps-breath`: a breath let out, then held; two snaps (`ps-loose`) | no | cut | anticipation: the breath, and two arrows in it |
| 4 | Streamer · the quiet | 600 (400) | at the far end, level on the target from the butt's side, locked off | — (the kid is not on this side) | `ps-butt`: the butt behind, the lane running off to the left into blue haze; exposure 0.7 → 0.45, vignette 0.4 → 0.7 | the cloth leaves the lens (`ps-streamer` wipe, out); **the streamer on its pole flying, then dropping and hanging still** by the middle of the shot (`ps-streamer` drop); the target behind **its plate on the frame** (`ps-plate` hung), swaying a little and then still; grit that stops (`ps-wind`, `stopAt`) | **music 3%**; `ps-settle`: the wind dying, the cloth settling, nothing | **yes**, unaware, idle | in-folder: the streamer wipe | the quiet: the wind drops, and nothing arrives yet |
| 5 | Proof · impact | 760 (560) | the same end, medium on the target, easing back a little; Dutch −4° → −2° | far off at the shooting line, the kid a speck, `ult:ps-after` (contact 0.06); the target `hurt` at 0.06, shoved and tilted; `hurt` again at 0.34 | `ps-butt`, blown out then settling | **two-tone frame (40ms)**: the first arrow in the plate; then in colour: **the plate knocked off its hook, holed, spinning away** to the ground (`ps-plate` proof), the arrow standing in the target (`ps-arrows`); at 0.34 **the second arrow splits the first** and stands in the same hole; held from 0.5: the plate on the cinder with its proof mark, the split halves, the hole shining far blue | `ps-impact` (layered) at 0.05; **150ms stop** at 0.06, heavy shake; `ps-second` at 0.33, 60ms stop, a smaller shake; "Clean through." | **yes** | cut on the two-tone | impact: the plate proved nothing; the damage on the held frame |
| 6 | Proved · return | 740 (480) | battle camera | real Ranger `ult:ps-lower`: the bow comes down, the drawing hand shakes out | real battlefield; the pewter lifts; bars open | on the target: **the holed plate lying at its feet, the two arrows in it, and the hole shining** (`ps-board` proved); the pace lines fading | `ps-after`: the motif's last plate, far off; `ult-tail` | on board | flash 80ms | release: what it did, where it matters |

FAST drops the wide; the title moves to the wind close-up. It keeps the wind,
the face with both looses, the quiet with the real target in it, and the
impact.

## Voice

"Stay there. It's a long way. You won't hear it." · "Clean through." · "See?
Armour's just something slower to hit."

## Framing

- **Large and boss.** The wide sets a boss further along the butt so it
  stands whole with its plate; the quiet pulls back so a boss is whole behind
  a plate sized to it; the impact pulls back, the plate and arrows larger,
  with a small shove and a slight tilt, so a boss is struck, not shrunk.
- **Party size** does not change the film: the cast is the kid and the one
  target.

## Whole-body motion

Root keys authored for the size each clip plays at: `ult:ps-step` (the
board: half a pace back), `ult:ps-range` (the wide: the weight shifting
onto the back foot as the thumb goes up, then forward into the draw),
`ult:ps-after` (a speck at the far end: the rock back from two looses
settling) and `ult:ps-lower` (the board: settling forward). The close-ups
`ult:ps-wind` and `ult:ps-breath` keep a still root and their cues set
`root: false`. Nothing is built on `.cine-look`.

## Notes from the lab

- **Placed from probes** (`scripts/probe-ultimate.ts`): in the wind close-up
  at size 1000 the open hand's centre is at world (686, 928) and the head
  above the frame at (667, 588); the grit is let go from the fingertips, an
  offset of (4, −196) from the ground point. In the wide the thumb sits at
  (330, 699) beside the head's centre (293, 647). In the breath at size 1000
  the eyes are at (744, 605) and the mouth at (750, 664); the camera holds
  (806, 622) → (798, 618). In the quiet at size 420 the hound's body spans
  x 888–1312, so the plate hangs 300 world units in front of the ground
  point (330 for a large target, 372 for a boss).
- **The hands are drawn in `Ranger.tsx`**, inside the `draw` part, as two
  close-up-only parts (`open`, `thumb`) registered only in a close-up copy
  (`CloseUpContext`) and shown only where this film's CSS sets `--ps-open`
  (the wind) or `--ps-thumb` (the range). A part with no track in a clip
  returns to rest — visible — so the CSS variable is what keeps them out of
  every other film's close-ups; inside this film's shots their clips scale
  them up and down (the thumb goes up at 0.08–0.16 of the range and away at
  0.5–0.56 as the hand goes to the quiver). Each covers the mitten, so the
  mitten is the closed hand and needs no rule of its own. False Footing's
  glove (`--ff-reach`) is untouched.
- **The draw was solved, not posed**, with the same solver the other two
  path films use (`aimed`, `drawn`), but every draw here is `aimed(-2)`: flat
  along the range, never at the sky. Two looses in one 600ms clip: the hand
  goes back over the shoulder between them so the fresh arrow is not seen
  crossing the face.
- **The target stood on the far bank** in the first wide (its ground point
  above the lane's far edge); it is now at (1296, 492), on the cinder, and
  the flag's pole was moved in from the vanishing point so the streamer is
  in frame beside it.
- **The plate** was first two thirds of the figure's drawn height across and
  read as a tag; it is now 0.76 of the drawn height wide and hangs on an
  iron frame whose legs stand on the ground, so it reads as a thing hung in
  the target's way. The mark it takes is a ragged hole with the sky through
  it and a cold shine that fades as it falls.
- **The two-tone frame** first went almost all to black: cinder and a dark
  creature are one tone. A pale light (`ps-glare`) now sits behind the target
  for the first half of the impact, so on that frame the target and its
  plate are ink against it.
- **The far kid** was a silhouette at size 88 and read as a blot at the end
  of the lane; lit and at 98 it reads as the kid with its bow still up.
- **The pace lines on the board** first stood up like posts; they now lie
  along the floor in front of the target, towards the party, stepping away
  from it.
- Sounds, rendered offline (three renders each, peak and loudest-300ms
  RMS): `ps-impact` 1.54–1.64 / 0.266 in its first cut, against the
  Hundredth Mark's 1.36–1.38 / 0.252, Sunblind's 1.25–1.32 / 0.252 and
  False Footing's 1.30–1.39 / 0.248; its punch and sub were trimmed (the
  measured numbers after the trim are in the report). The motif 0.22 / 0.046
  (Sunblind's 0.20 / 0.055, the Hundredth Mark's 0.60–0.96 / 0.051); the
  second arrow 0.78–0.95 / 0.101 before its trim; the loose 0.26–0.68, its
  snap trimmed; the quiet's `ps-settle` 0.05 / 0.006.
- Root keys: `ult:ps-step` (the board: x −0.05, leans −2°, squash 1.02),
  `ult:ps-range` (the wide: weight back to −2.5° under the thumb, forward to
  1.2° into the draw), `ult:ps-after` (a speck: −3° settling to −1°) and
  `ult:ps-lower` (the board: from x −0.05 back to rest). The close-ups
  `ult:ps-wind` and `ult:ps-breath` keep a still root and their cues set
  `root: false`. Nothing is built on `.cine-look`.
- Profile (`GPU=1 scripts/profile-ultimate.ts 5491 1920x1080`, dev build,
  shared machine under load): film p50 16.7ms / p95 50ms, 12 frames over
  34ms (at its first frames); the round after it p50 16.7ms / p95 66.6ms, 13
  over 34ms. Peak 949 nodes (879 SVG), 5 live effects, 0 filtered elements.

## What the engine could not do, and what was built instead

- **The occlusion object is always a cape**: the cut from the face to the far
  end is an in-folder screen effect, the streamer's cloth (`ps-streamer`
  wipe).
- **One reveal, one contact**: the film's blow is the first arrow (the
  reveal and the kid's `contact` sit on it, at 0.06); the second arrow is
  drawn at 0.34 and the damage number lands with it, the total of both hits.
  The board's two pops fall together at the first. A `contact` list on a
  clip is read only for its first entry, so a second hit cannot carry its
  own reveal.
- **The engine's damage is not the film's**: the lab hound has 46 HP, so the
  number on the frame in the lab is 46 and not the 50 the shots add up to
  (the Collector shows 50).
- **A status leaves no record but a chip**: the Vulnerable and the stripped
  Barrier are drawn by the film itself (the hole shining, the plate on the
  ground).
