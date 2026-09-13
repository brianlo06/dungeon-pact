# The Open Mind (Beguiler · Mindflayer) — storyboard

**The idea, in one sentence:** every mind is a labyrinth, and doubt, the
Beguiler's old way in, walks it the long way round; the Mindflayer's one green
eye narrows to a pin and puts a single thought straight through the walls, into
the plan coiled at the centre, and on through every mind the party left open.

Only the Mindflayer could have it. The path's title is the plot: *Doubt is
slower than a hole in the thinking.* The Beguiler's Seed of doubt is the slow
way (the dotted path that winds through the maze and never arrives); the
Mindflayer traded it and Ill whisper for **Mind spike**, a direct psychic
wound. The drawing supplies the weapon. It is the one sickly green eye behind
the cracked porcelain mask, the only living thing in that face. The kit
supplies the payoff: Vulnerable, which the Beguiler has always dealt in, is
drawn as a mind that is *open*.

## Gameplay

`src/content/ultimate-defs/bgl-mindflayer.ts`, target an enemy, speed 18:

| | Hall of Mirrors (base) | **The Open Mind** (Mindflayer) |
| --- | --- | --- |
| The target | 10 arcane | **24 arcane through armour, WINDUP broken, Vulnerable** |
| Every other enemy | Confused: strikes its own side this round; a 0-base sliver | **no confusion**; the thought passes through: a 0-base sliver through armour |
| Enemies the party already made Vulnerable | nothing special | **holed**: 10 more arcane through armour (×1.25 for the Vulnerable) and **WINDUP broken** |
| Sway | — | +2 |

It differs in what it does, not only in numbers. The Hall of Mirrors is control:
nobody is hurt much, and the enemy's round is turned on itself. The Open Mind
turns nobody. It is a wound and an interruption, and its reach depends on the
party. Every Vulnerable source in the game sets it up: the Mindflayer's own
Mind spike from last round, Unpick the seam, Gatebreaker, Breakwater and
Foreclosure.

The sliver on every enemy is there for the film as much as the fight. A film's
cast is the enemies an Ultimate damaged, so without it the film could show
only the one mind (as the Hall of Mirrors found).

Quick balance (`scripts/ultimate-report.ts 4 --sample=6`, 324 runs, on
`37190fe`), against the same sample with this path still on the Hall of
Mirrors:

| Win rate | off | on, Hall of Mirrors | **on, The Open Mind** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 75% | 75% |
| 3 players | 94% | 95% | 95% |
| 4 players | 92% | 94% | 94% |
| all | 91% | 93% | **93%** |

"all" does not move. Beguiler uses per run: 2.55 before, 2.49 after (charge
earned 260 / 261). The tests are `tests/ultimates-open-mind.test.ts` (its own
file, so no shared test file is edited): the target is holed through armour,
interrupted and left Vulnerable; a closed mind takes only the sliver; an open
one is holed and interrupted; and the film is handed the whole line.

## Space, palette, sound

- **Space: the floor of the thinking.** A black plain paved to the horizon
  with one vast labyrinth drawn in perspective, its rings running out under
  the enemy line. A black sky, a low green haze on the horizon, and nothing
  else. Not a hall, a forge, a storm, a wood, a vault, a ridge, a causeway or a
  room of mirrors. It is the inside of somebody's head, with no glass in it.
- **A mind** (`mind-disc`), drawn one way everywhere: a small round labyrinth,
  walls in pale violet ink, doors in each ring, and at its centre **the plan**,
  a tight amber coil. The coil is the WINDUP, a thing wound up to be let go.
  An open mind has a clean round hole through it; a broken plan is a coil with
  its turns flung apart.
- **Palette:** night `#07060b`, the Mindflayer's green `#c7f06a` (the eye, the
  thought), wall-ink violet `#b7a9cf`, and amber `#ffb347` for the enemy's
  plan. No crimson, no porcelain white used as light.
- **Motif (original):** four struck-sine notes with a pin-click on each attack,
  G5, D5, E♭5, then A4 held: a question that lands a tritone away from where it
  should. Cold and close, not pretty. The music box is the base film's.
- **Signature sound:** the pin (`mind-spike`), a click so high it is nearly a
  pressure, drawn up into a whistle as the thought goes in.
- **Impact, layered:** the pin's click (transient); a sub dropping out; a
  detuned sine cluster bending down (the body, a thought coming apart); a
  lowpassed room and a falling ring (tail).

## Rhythm

identity (the eye focuses) → stakes and target (every enemy's mind over its
head; doubt winding the long way in the target's; title) → escalation (inside
the target's mind: straight through every wall, faster) → **quiet** (the heart
of the maze: the plan winding tighter in silence, the needle's point a hair
away) → impact (through: the hole, the coil broken, the same thought through
every other mind) → release (the real board: every enemy's mind with a hole in
it).

The quiet is directly before the loudest, and the tightest, stillest shot (the
coil) cuts straight to the widest reach (the line).

## Shots — 4.52s FULL, 2.40s FAST (53%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Beguiler `ult:mind-drop`: the control drops to its side, the strings go slack, and the head, always tilting, comes level and stops | real battlefield sinks to night, bars close | green call aura; **each real enemy's mind appears over its head** (`mind-disc`, anchored, staggered) | `mind-call`: a low drone, a thin tone tuning down to one pitch; music ducks | on board | — | break the round: the minds are visible now |
| 1 | Stare · extreme close-up | 620 (400) | dead level, no roll, tight on the eye hole; slow push | `ult:mind-stare`: head level and held; the eye widens, then narrows to a pin (the new close-up `eye` part) | void, near black; the only light is the eye's green | the mask's crack lights green along its length (`mind-crack`); the eye's glow gathers to a point (`mind-pin`) | `mind-pin`: a falling whistle closing to one high point | no | black 60ms | identity: the one eye, focusing |
| 2 | Minds · target wide | 900 (—) | low wide, craning down onto the line | — (the Beguiler is not here, only its gaze) | the floor of the thinking | every enemy's mind turning slowly over its head (`mind-disc`, each); in the target's a **dotted path winds the long way** towards the coil; a green sightline comes in from the left and finds its rim (`mind-sight`); the picture **closes onto the target's mind** (`mind-iris`) | **motif**; slow, unsure ticks (`mind-doubt`) | **the real line**, looking up and round (`anticipate`) | cut | stakes and target; doubt goes the long way; title |
| 3 | Bore · projectile follow | 580 (360) | top-down on the whole labyrinth, Dutch −7° → −4°, following the needle in towards the centre and pushing in as it rushes (ease in) | — | void; the labyrinth fills the frame | the iris opens on the labyrinth; **the needle**, a green line drawn dead straight across the maze, punches a hole through every wall it meets (chips fly); the dotted doubt path, left behind, still winding (`mind-maze`, bore) | seven punches, accelerating, under a rising whine (`mind-bore`) | inside the target's mind | the iris, in-folder (see below) | escalation: straight through the walls |
| 4 | Coil · detail | 540 (360) | dead still, extreme close on the maze's heart | — | near black; amber from the coil | **the plan**, an amber coil winding tighter a turn at a time; the needle's point hangs a hair from it, trembling (`mind-maze`, heart) | **music ducked to 4%**; a thin ringing fading out; two soft, low pulses (`mind-hush`) | no | cut | anticipation by subtraction |
| 5 | Through · impact | 780 (560) | low and level, the Beguiler at the bottom-left corner and the line up to the right, so the thought crosses the whole frame; a push *into* the hole after contact | `ult:mind-pierce` (contact 0.04): the head drives forward, the eye flares, the control hangs dead | the floor of the thinking, blown out green, then settling | **70ms green two-tone**, held by the stop, over a pale field behind everyone (`mind-glare`) so the figures and the minds go to ink; the thought from the eye straight through the target's mind and on, ink under its light so it reads on the drawn frame (`mind-spike`); the target's mind **punched through**, its rings flung out, the coil snapped (`mind-hole`); at 0.34 a parallel needle and a smaller hole through every other mind in the line | `mind-spike` + `mind-impact`; `mind-echo` as the line is holed; **150ms stop**, heavy shake, a second small shake | **target** `hurt`, shoved; **the line** `hurt` at 0.34 | cut on the two-tone | impact: the damage on the frame; "There. Now it's open." |
| 6 | Holes · return | 700 (480) | battle camera | real Beguiler `ult:mind-lift`: the head tilts back over, the control comes up again | real battlefield; bars open | over every real enemy its mind hangs holed, its coil gone; the target's hole is ringed in green: open (`mind-disc` holed, anchored) | `mind-after`: the motif's first two notes, slower; tail | on board | flash 80ms | release: what it did, over each of them |

### Boss framing

A boss's mind is a boss's size. The disc rides the figure's real height, so a
Collector's labyrinth hangs over its crown and not in its chest. In **Minds**
the camera pulls back to take in its height and its mind; in **Through** the
camera frames the boss big and its mind in frame, the Beguiler is smaller in
the corner, the thought climbs steeply to the boss's mind and the shove is
small. A boss is struck, not shrunk. Large framing (the Iron Bulwark) has its
own overrides between the two, so a heavy target's feet are not cut off.

### FAST

Drops **Minds**. The title rides **Bore**. It keeps the eye, the walls, the
silence at the coil and the impact.

## Performance, without a face layer

The Beguiler is not one of the five face heroes, and its face is a mask. The
Hall of Mirrors acts with the head's tilt, too far over. This film acts with
the opposite: **stillness**. The head that never stops tilting comes level and
holds, and the eye does the acting. A close-up-only `eye` part was added to
`Beguiler.tsx` (registered only inside a cinematic copy, like the face parts)
so the eye can widen, narrow to a pin and flare at the impact. On the
battlefield the drawing is unchanged.

Films do not write a clip's root track yet, so every movement the film needs
is in the parts. The root keys are small and safe for when they start
playing: `ult:mind-drop` and `ult:mind-stare` (y −0.01, scale 1.02),
`ult:mind-pierce` (x 0.02, rotate 2°), `ult:mind-lift` (y −0.015, scale 1.02).

## Notes from the lab

- Every camera and effect in the close-up was placed from probed positions:
  the eye at (815, 400) and the crack at (831, 383) in world units, with the
  caster at (800, 900), size 760.
- The eye's pin is timed in the clip to finish inside the FAST shot (400ms);
  in FULL it lands at half the shot.
- The needle's head and the bore camera share one ease (`in`, cubic, written
  as `--pi`), so the head stays where the camera is looking; the seven punch
  sounds are placed at the moments the eased head reaches each wall.
- A rim-lit figure in an extreme close-up turns the whole frame the rim's
  colour (the glow is the size of the figure's box), so the stare is `lit`
  at low exposure and the eye alone is green.
- The impact's two-tone frame needed a light field behind everyone
  (`mind-glare`) and an ink core under the thought's light; without them the
  thought and the hole were the same tone as the frame.
- Performance (dev build, `GPU=1 scripts/profile-ultimate.ts`, 1920×1080, a
  loaded shared machine): film p50 16.7ms / p95 33.3ms, 4 frames over 34ms;
  the round after it p50 16.7 / p95 16.8. The Hall of Mirrors on the same
  machine minutes earlier: p50 16.7 / p95 33.4, 7 over 34ms. No filtered
  elements; peak 1,043 nodes, 5 live effects. Three things were fixed to get
  there, each measured: the background's drifting thoughts and per-ring group
  opacity (the whole floor re-rasterised every frame), its box-sized
  gradients (re-rasterised with every zoom), and the iris, first drawn as a
  spread box-shadow many times the screen's size and now one screen-sized
  radial gradient. Doubt's path draws only the stretch the film walks.
- Sounds were rendered offline and measured: the impact peaks at 1.22 (the
  Hall of Mirrors' at 1.21), the motif at 0.16 (0.15), the call at 0.38 (0.47).

## What the engine could not do, and what was built instead

- **An iris.** `iris` is in the schema but not rendered, so the cut from the
  wide into the labyrinth is two in-folder screen effects straddling it:
  `mind-iris` closes the picture onto the target's mind (read each frame from
  where that disc really is on screen), and the bore shot opens a circle onto
  the labyrinth. The engine would need `iris` rendered with a point and a
  radius, ideally taken from an effect or actor.
- **Statuses from before the Ultimate.** The film cannot tell which enemies
  were already Vulnerable (the board is at the result and statuses are not in
  the beats), so every other enemy's mind is holed alike, smaller than the
  target's. The engine would need the segment to carry each target's statuses
  as they stood before the cast.
- **Root motion.** A clip's root track is not written in films today, so all
  of the Beguiler's motion is in its parts (above).
- **A row's reactions land together**, so the line flinches as one at 0.34
  and the target flinches a second time with it; the holes themselves are
  staggered per mind by `each`'s own 0.04 offset.
- **`each` copies start late.** A cue with `each: "targets"` opens each copy
  0.04 of the shot later than the last, so a mind that must hang there from
  the first frame and be holed later is one `mind-hole` cue starting at
  −0.1, whole until its own `holeAt`. The engine would need a `stagger: 0`
  (or milliseconds) on `each`.
- **Large framing does not fall back to boss** (only boss to large), so both
  are authored for the two shots that need them.
