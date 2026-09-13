# Eyespot (Beguiler · Illusionist) — storyboard

**The idea, in one sentence:** the Illusionist's robe is a swarm of moths
wearing its shape, every wing painted with its one green eye, so the enemy
lunges at the eye it has been watching, the robe bursts into wings around
nobody, and the Beguiler, already behind it, cuts it with a sliver of moon.

Only the Illusionist could have it. The path's title is the plot: *Be
somewhere else when it lands.* The drawing supplies the trick. The Beguiler's
robe comes apart at the hem into curling tatters, and tatters that lift are
wings. The one living thing in its face is a sickly green eye behind a
porcelain mask. A moth's **eyespot** is nature's misdirection: a false eye on
the wing that draws the strike away from the body. The kit supplies the
payoff. Mirrorstep strikes, leaves the enemy Vulnerable and steps behind
Barrier, and the Ultimate is that, made total.

## Gameplay

`src/content/ultimate-defs/bgl-illusionist.ts`, target an enemy, speed 20:

| | Hall of Mirrors (base) | **Eyespot** (Illusionist) |
| --- | --- | --- |
| The target | 10 arcane | **carried into the front line; 18 arcane through armour; Vulnerable 2 rounds; Weak this round** |
| Every other enemy | Confused: strikes its own side this round; a 0-base sliver | **no confusion**; moths over its eyes: **Weak this round**; a 0-base sliver |
| The Beguiler | — | **20 Barrier, 2 rounds** |

It differs in what it does, not only in numbers. The Hall of Mirrors is
control: nobody is hurt much, and the enemy's round is turned on itself. Eyespot
turns nobody. Every blow the enemy throws this round is still thrown at the
party, but a third lighter (Weak), at a Beguiler who is not where it was
(Barrier). The one enemy it chose has overreached: its lunge carries it into
the front, where the party's melee can reach it past the screen, and the cut
from behind leaves it open (Vulnerable) for the party's blows this round and
next. A Mark on a back-row enemy becomes a front-row Exploit; a Breaker or a
Reaver standing in the front gets it delivered.

The sliver on every other enemy is there for the film as much as the fight: a
film's cast is the enemies an Ultimate damaged, so without it the film could
show only the one enemy, never the moths settling on the rest.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), with the path still
`null` and then with Eyespot, same machine, same seeds:

| Win rate | off | on, stub (Hall of Mirrors) | **on, Eyespot** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 83% | **83%** |
| 3 players | 94% | 95% | **95%** |
| 4 players | 92% | 94% | **94%** |
| all | 91% | 93% | **93%** |

"all" does not move, but that is because the bot trains a Beguiler into the
Illusionist only 11 times in those 324 runs (the Reliquary is a tier-2
mentor). So the Ultimate was also weighed head to head, with every Beguiler
playing one Ultimate's effects whatever its path, on every Beguiler party in
the matrix (every 2nd composition, 4 seeds, 328 runs each):

| Every Beguiler plays | 2p | 3p | 4p | all |
| --- | ---: | ---: | ---: | ---: |
| no Ultimates | 81% | 93% | 93% | 92% |
| Hall of Mirrors | 94% | 99% | 95% | 96% |
| The Open Mind | 88% | 97% | 95% | 95% |
| **Eyespot** | **88%** | **99%** | **95%** | **95%** |

In line with the Open Mind, a point under the base. Tests:
`tests/ultimates-eyespot.test.ts`.

## Space, palette, sound

- **Space: the moth garden.** A night meadow of moonflowers under a moon too
  big for the sky: tall pale trumpet blooms open on long stalks, a low line of
  black hills, and nothing to stand behind. Not a hall, a forge, a storm, a
  wood, a vault, a ridge at dusk, the ground under the floor, a pit, a
  causeway, a no-man's-land, a room of mirrors or the floor of a mind. It is
  the one film under a moon, and the only one that is out in the open with
  nowhere to hide, which is the point: the Illusionist does not need cover.
- **The moth** (`spot-moths`, `spot-coat`, `spot-robe`), drawn one way
  everywhere: ink body, dusty lilac forewings with a darker band, small
  hindwings, and on each forewing an **eyespot**, an ink ring round a green
  iris with an ink pupil and a cream catchlight: the Beguiler's own eye,
  copied a hundred times.
- **The cut** (`spot-cut`): a crescent, the shape of a sliver of moon, cream
  over an ink edge. The Beguiler's shard catches the moon and the wound it
  leaves is the moon's own shape.
- **Palette:** night indigo `#0b0a1c`, moonlight cream `#f3e7c4` (the accent,
  and the two-tone), dusty lilac `#b9aecb` for wings, and the eyespot green
  `#c7f06a` used only in eyes. No violet glow, no green light, no glass.
- **Motif (original):** four breathy whistled notes, C5, G4, then a leap to
  C6 and a fall onto B5, held: a tune that turns up an octave away from where
  you were listening, and does not land where it should. Not a music box
  (Hall of Mirrors), not struck sines on a pin (Open Mind).
- **Signature sound:** the flutter (`spot-flutter` inside `spot-call`,
  `spot-open` and `spot-scatter`): a dry, soft beating of many small wings,
  built from short bandpassed noise ticks.
- **Impact, layered** (`spot-impact`): a thin bright *shing* of the shard
  (transient), a sub drop, the body a tearing burst of wings (a noise band
  torn open and scattering), and a long lowpassed room with a falling glint
  (tail). `spot-cut` leads it: the in-breath of the blade.

## Rhythm

A magic trick in four beats. **The pledge** (identity: the wink, "keep your
eyes on mine") → **the turn** (stakes and target: the real line watches the
Beguiler, and moths settle on its robe and open a hundred green eyes; title) →
**quiet** (the enemy picks one eye and draws back; nothing moves) → **the
prestige** (impact: it lunges, the robe bursts into moths around nobody, and
the cut lands from behind) → release (the real board: moths over every
enemy's eyes, the target cut and in the front, the Beguiler in a veil of
wings).

The film misdirects its own audience the way the Beguiler misdirects the
enemy: nothing before the impact says the figure in the robe is not the
Beguiler, except the eye that glances away in the close-up, to where it will
be.

## Shots — 4.08s FULL, 2.06s FAST (50%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Beguiler `ult:spot-call`: the hand with the control makes a slow pass across the body and the head turns to watch the hand | real battlefield sinks to indigo night, bars close | moths peel off the real Beguiler's hem and climb round it (`spot-moths` rise, anchored); cream call aura | `spot-call`: a dry flutter swelling over a low hum; music ducks | on board | — | break the round: the hem is wings |
| 1 | Wink · face close-up | 640 (400) | from below the chin, up at the mask with the moon behind the hood's horns, rising, a slight roll settling | `ult:spot-wink` (`root: false`): the head tips; **the eye glances aside, holds, comes back, and winks** (the close-up `eye` part) | the moth garden's sky; a vast moon (`spot-moon`) behind the head; exposure mid, cream back light | two moths cross the moon; at the end **a swarm crosses the lens** (`spot-moths` swarm, screen) | `spot-wink` on the glance and the blink; subtitle "Keep your eyes on mine." | no | black 50ms | identity; the one tell |
| 2 | A hundred eyes · target wide | 920 (—) | wide on the meadow, trucking slowly left, the Beguiler at the left third and the line at the right | `ult:spot-beckon`: the free hand curls once, beckoning; otherwise still | the moth garden; moon high left; cream back light | the swarm's tail clears; moths land all over the robe and **open one after another, a hundred green eyes** (`spot-coat`) | **motif**; `spot-open`, the flutter thickening with a twinkle per eye | **the real line**, looking at it (`anticipate`) | the swarm (in-folder occlusion) | stakes and target; title |
| 3 | Which eye · over-the-shoulder | 600 (380) | tight past the target, a black shape filling the right of frame, onto the Beguiler covered in eyes; held | `ult:spot-still`: nothing moves | exposure down to 0.2; a thin moon rim on the target | every eye open, dead still (`spot-coat` held); the wings close once, slowly, and open | **music ducked to 4%**; one slow wingbeat, a faint high moon tone (`spot-hush`) | **target**, drawn back and held (`anticipate`) | cut | anticipation by subtraction: the enemy chooses |
| 4 | Wrong eye · impact | 820 (560) | low and level, medium wide, easing out and drifting with the lunge | `ult:spot-cut` (contact 0.04): lunged in from behind, the shard swept down through, the control arm flung back | a moon the size of the frame behind everyone (`spot-moon` big) so the drawn frame is cream and ink | **the robe bursts into moths around nothing** (`spot-robe`); the crescent cut across the target's back (`spot-cut`); the moths stream away over the line (`spot-moths` stream) | `spot-cut` + `spot-impact`; `spot-scatter`; **150ms stop**, heavy shake | **target** lunging (`attack`), then `hurt`, shoved on into the front | cut on a **70ms cream two-tone** | impact: the blow and the empty robe on one frame; damage; "Wrong eye." |
| 5 | Wings · return | 700 (480) | battle camera | real Beguiler `ult:spot-settle`: the shard lowered, the head back to its crooked angle | real battlefield; bars open | **moths over every real enemy's eyes** (`spot-moths` blind, anchored); the crescent scar on the target (`spot-cut` scar); wings circling the Beguiler (`spot-moths` veil) | `spot-after`: the motif's last two notes, and a flutter; tail | on board | flash 80ms | release: every enemy blinded, the target open, the Beguiler elsewhere |

### Boss framing

A boss's lunge is a boss's size. In **A hundred eyes** the camera pulls back
and the boss stands at the right with the Beguiler small at the left. In
**Which eye** the boss fills the right half of the frame from the waist up.
In **Wrong eye** the camera takes in the boss's height, the robe bursts at
its knee, the Beguiler strikes at its flank from behind and the crescent is
drawn to its height; the shove is small. Large framing sits between.

### FAST

Drops **A hundred eyes**. The swarm that closed the close-up opens **Which
eye**, where the robe is already covered in open eyes, and the title rides
that shot. It keeps the wink, the silence, the burst and the cut.

## Performance, without a face layer

The Beguiler is not one of the five face heroes, and its face is a mask.
The Hall of Mirrors acts with a head that tilts too far; the Open Mind with a
head held level and an eye that narrows to a pin. The Illusionist acts with a
**glance**: its eye slides to the side, to where it is going to be, holds,
comes back to the lens and **winks**. It is the only tell in the film. The
same close-up-only `eye` part (added to `Beguiler.tsx` for the Open Mind) is
translated and squashed rather than scaled. On the battlefield the drawing is
unchanged.

Root tracks play in films. Keys authored for their shot size:
`ult:spot-call` (a small sway, battlefield size), `ult:spot-beckon` (a
lean), `ult:spot-cut` (the lunge from behind: x 0.07, rotate 6°, squash),
`ult:spot-settle` (a small lift). `ult:spot-wink` has only a hair of root
motion, and its close-up sets `root: false`. Nothing is rebuilt on
`.cine-look`.

## Notes from the lab

- The moon in the background (`spot-garden`, at world 660, 330) was placed so
  one moon serves three shots: behind the hood's horns in the close-up, over
  the Beguiler in the wide and peeking over it in the quiet. Because the
  exposure layer darkens the background, those shots lay a `spot-moon` drawing
  exactly over it on the effects layer so it stays bright.
- The impact's drawn frame works because the moon is the size of the sky
  behind everyone: the two-tone sends it to cream and every figure to ink, so
  the robe's horned outline, the lunging target, the crescent and the
  Beguiler behind it read as four silhouettes in a row. Before the moon was
  moved under the robe, the robe was ink on a black sky and did not read. The
  cream flash that first followed the two-tone was removed: it whited out the
  frame after the accent.
- The swarm is the film's wipe: the same seeded moths close the close-up
  (`phase: in`, the first half of their flight) and open the next shot
  (`phase: out`), and a dark band of wing-dust travels with them so the frame
  is fully covered on the cut (the browser test checks the band spans the
  frame at 0.995 of the close-up).
- Moths on the robe were first a dense grey scatter that read as debris; they
  read as eyes at about a seventh of the robe's width with the eyespot a
  fifth of the wing, and a faint green disc behind each eye (no filter).
- Sounds were rendered offline in the browser and measured against the other
  two Beguiler films: the impact peaks at 1.19 (the Hall of Mirrors' 1.20,
  the Open Mind's 1.18), the motif at 0.15 (0.15, 0.28), the call at 0.42
  (0.48, 0.38), the release at 0.11 (0.12).
- Performance (dev build, `GPU=1 scripts/profile-ultimate.ts`, 1920×1080, on a
  shared machine at load average 25–35, so only the comparisons mean
  anything): film p50 16.7ms / p95 66.7ms, 15 frames over 34ms; the round
  after it p50 16.7 / p95 50.1. The Hall of Mirrors minutes later: film p50
  33.3 / p95 183, the round after it p50 16.7 / p95 66.6; the Open Mind
  earlier: p50 16.7 / p95 83.4 against its round's 66.7. No filtered
  elements; peak 1,405 nodes, 3 live effects. The meadow's flowers and stars
  were thinned (peak 1,543 before), and every moth is two `<use>`s of one
  wing symbol and one of its body.

## What the engine could not do, and what was built instead

- **An enemy that only takes Weak is not in the cast.** Solved in gameplay:
  every other enemy takes the moths' 0-base sliver, as the other two Beguiler
  films do.
- **An occlusion with another object.** The occluder is always a cape, so the
  swarm of moths across the lens is an in-folder screen effect straddling the
  cut (`spot-moths` swarm, `phase` in and out, same seed), with the shot's
  transition left as a `cut`. The engine would need an `occlusion` whose
  object is an effect kind.
- **A decoy of the caster.** Only `reflection` is handed a figure, so the robe
  the enemy lunges at is the Beguiler's outline redrawn from `Beguiler.tsx`
  (robe, hood, horns) as cloth, not a copy of the presentation figure. It
  does not wear the caster's equipment. The engine would need an effect slot
  for a second copy of the caster.
- **Effects that ride a figure's parts.** A `follow` effect rides the ground
  point only, so the moths on the robe do not tilt with the head in the
  beckon (the clip keeps that tilt small). The engine would need a follow
  anchor on a named part.
- **One reveal covers every target.** The whole line's damage and Weak land
  on the target's contact; the other enemies are not in the impact shot, and
  their moths are shown on the board in the return.
- **Moving an enemy into the front logs no beat**, so the board's re-layout at
  the reveal is the only sign of it; the film shows the lunge carrying the
  target forward and does not claim the row.
- **A row of targets shares one facing**, and with four enemies the wide's
  line is crowded to the frame's right edge.
