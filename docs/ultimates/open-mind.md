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

Balance: see the report at the end of this file.

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

## Shots — 4.54s FULL, 2.40s FAST (53%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Beguiler `ult:mind-drop`: the control drops to its side, the strings go slack, and the head, always tilting, comes level and stops | real battlefield sinks to night, bars close | green call aura; **each real enemy's mind appears over its head** (`mind-disc`, anchored, staggered) | `mind-call`: a low drone, a thin tone tuning down to one pitch; music ducks | on board | — | break the round: the minds are visible now |
| 1 | Stare · extreme close-up | 620 (400) | dead level, no roll, tight on the eye hole; slow push | `ult:mind-stare`: head level and held; the eye widens, then narrows to a pin (the new close-up `eye` part) | void, near black; the only light is the eye's green | the mask's crack lights green along its length (`mind-crack`); the eye's glow gathers to a point (`mind-pin`) | `mind-pin`: a falling whistle closing to one high point | no | black 60ms | identity: the one eye, focusing |
| 2 | Minds · target wide | 900 (—) | low wide, craning down onto the line | — (the Beguiler is not here, only its gaze) | the floor of the thinking | every enemy's mind turning slowly over its head (`mind-disc`, each); in the target's a **dotted path winds the long way** towards the coil; a green sightline comes in from the left and finds its rim (`mind-sight`); the picture **closes onto the target's mind** (`mind-iris`) | **motif**; slow, unsure ticks (`mind-doubt`) | **the real line**, looking up and round (`anticipate`) | cut | stakes and target; doubt goes the long way; title |
| 3 | Bore · projectile follow | 580 (360) | top-down over the target's labyrinth, tracking the needle's head from the rim to the centre, rushing (ease in) | — | void; the labyrinth fills the frame | the iris opens out of the disc; **the needle**, a green line drawn dead straight across the maze, punches a hole through every wall it meets (chips fly); the dotted doubt path, left behind, still winding (`mind-maze`, bore) | seven punches, accelerating, under a rising whine (`mind-bore`) | inside the target's mind | the iris, in-folder (see below) | escalation: straight through the walls |
| 4 | Coil · detail | 540 (360) | dead still, extreme close on the maze's heart | — | near black; amber from the coil | **the plan**, an amber coil winding tighter a turn at a time; the needle's point hangs a hair from it, trembling (`mind-maze`, heart) | **music ducked to 4%**; a thin ringing fading out; two soft, low pulses (`mind-hush`) | no | cut | anticipation by subtraction |
| 5 | Through · impact | 780 (560) | low, level, framed on the target's head with the Beguiler small at the left edge; a push *into* the hole after contact | `ult:mind-pierce` (contact 0.04): the head drives forward, the eye flares, the control hangs dead | the floor of the thinking, blown out green, then settling | **70ms green two-tone**; the thought from the eye straight through the target's head and on (`mind-spike`); the target's mind **punched through**, its rings flung out, the coil snapped (`mind-hole`); at 0.34 a parallel needle and a smaller hole through every other mind in the line | `mind-spike` + `mind-impact`; `mind-echo` as the line is holed; **150ms stop**, heavy shake, a second small shake | **target** `hurt`, shoved; **the line** `hurt` at 0.34 | cut on the two-tone | impact: the damage on the frame; "There. Now it's open." |
| 6 | Holes · return | 700 (480) | battle camera | real Beguiler `ult:mind-lift`: the head tilts back over, the control comes up again | real battlefield; bars open | over every real enemy its mind hangs holed, its coil gone; the target's hole is ringed in green: open (`mind-disc` holed, anchored) | `mind-after`: the motif's first two notes, slower; tail | on board | flash 80ms | release: what it did, over each of them |

### Boss framing

A boss's mind is a boss's size. The disc rides the figure's real height, so a
Collector's labyrinth hangs over its crown and not in its chest. In **Minds**
the camera pulls back and up to take in its height and its mind; in
**Through** the camera frames the boss whole, the Beguiler is smaller, the
needle rises to its head and the shove is small. A boss is struck, not
shrunk. Large framing sits between.

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

## What the engine could not do, and what was built instead

- **An iris.** `iris` is in the schema but not rendered, so the cut from the
  wide into the labyrinth is two in-folder effects straddling it: `mind-iris`
  closes the picture onto the target's mind (read from where that disc really
  is on screen), and the bore shot opens out of a disc of the same size.
- **Statuses from before the Ultimate.** The film cannot tell which enemies
  were already Vulnerable (the board is at the result and statuses are not in
  the beats), so every other enemy's mind is holed alike, smaller than the
  target's. The engine would need the segment to carry each target's statuses
  as they stood before the cast.
- **Root motion.** A clip's root track is not written in films today, so all
  of the Beguiler's motion is in its parts; the root keys are kept small.
- **A row's reactions land together**, so the line's echo holes are
  staggered inside `mind-hole` itself.
