# Command Performance — Beguiler · Puppeteer

**The idea, in one sentence:** the Puppeteer cuts the little wooden doll off
its own strings, because it has a real one now: it drops the strings from a
marionette theatre's bridge onto one enemy, walks it into its own line,
hoists it, and swings it like a weight on a line through its own side.

Only the Puppeteer could have it. The Beguiler's drawing is a figure *holding
someone*: a marionette's control held up in front, a limp wooden doll on the
strings. The Hall of Mirrors kept the control to one gesture and put the lie
in the enemy's eyes; it turns a whole line with doubt and never touches
anyone. The Puppeteer's path title is the plot, *You were always going to do
this for me*, and its signature is **Puppetry**: one enemy strikes its own
side and is left open. So this film has no doubt in it, no mirror and no
crowd. It has one body, and what a puppeteer does with one: stands it up,
walks it, lifts it, and uses its weight.

## Gameplay purpose

`ultimate-defs/bgl-puppeteer.ts`, target an enemy, cost 100, speed 20:

1. the puppet is **walked into the front line** (`move`), where the party's
   melee can reach it past any screen;
2. it is **swung through its own side**: every other enemy takes **12
   arcane** (plus the Beguiler's power, less guard);
3. if the party had **already opened it** (Vulnerable: Puppetry, Seed of
   doubt, Unpick the seam, Mind spike, the Breaker, the Broker), the opening
   is dragged into everything it hits: **every other enemy is left
   Vulnerable** for two rounds (applied after the swing lands, so the swing
   itself is not multiplied);
4. then it is left hanging: **10 arcane through armour**, **Vulnerable** for
   two rounds, and **still on the strings** (Confused this round: its own
   blow, at its own strength, lands on its own side).

| | Hall of Mirrors (base) | **Command Performance** (Puppeteer) |
| --- | --- | --- |
| Who is turned | **every** enemy, this round | **one**: the puppet, as the tail of the act |
| The chosen enemy | 10 arcane | walked into the front; 10 arcane through armour; Vulnerable 2 rounds; Confused |
| Every other enemy | a 0-base sliver of glass | **12 arcane from the puppet's body**; Vulnerable if the puppet was already open |
| Beguiler's control charge | from every turned blow | from one |

It differs in what it does, not only in numbers. The Hall of Mirrors is doubt
spread thin: the enemy round does whatever the line happens to do to itself,
and its damage is a sliver. Command Performance spends one body. Its damage to
the rest is immediate and certain; its control is one enemy's blow; and its
team play is a plan across two rounds. **Puppetry now, Command Performance
next** (or any Vulnerable the party leaves: the Breaker's row, Unpick the
seam's row, Mind spike) and the whole enemy side is open for the party's
blows this round and next, with the puppet in reach of the melee.

Confusion is in it once, on purpose, and never as its centre: it is the only
way the effect system lets an enemy's own strength be used against its side
(every damage effect is sized by the caster), and it is what Puppetry does.
The gameplay test proves no scope ever carries it
(`tests/ultimates-command-performance.test.ts`).

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, with this
path's stub still `null` and then with Command Performance:

| Win rate | off | on, stub (Hall of Mirrors) | **on, Command Performance** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 83% | **83%** |
| 3 players | 94% | 95% | **95%** |
| 4 players | 92% | 93% | **93%** |
| all | 91% | 93% | **93%** |

Nothing moves, because the bot trains a Beguiler into the Puppeteer almost
never in that sample (Beguiler charge per run 260 → 261 is the only
difference). So it was weighed head to head, as Eyespot was: every Beguiler
plays one Ultimate's effects whatever its path, on every composition with a
Beguiler in it (164 compositions × 8 seeds, 1,312 runs each):

| Every Beguiler plays | 2p | 3p | 4p | all |
| --- | ---: | ---: | ---: | ---: |
| no Ultimates | 77% | 94% | 95% | 94% |
| Hall of Mirrors | 92% | 99% | 96% | 96% |
| The Open Mind | 89% | 98% | 96% | 96% |
| Eyespot | 88% | 98% | 95% | 95% |
| first cut (swing 12, bite 14) | 91% | 99% | 97% | 97% |
| swing 8, bite 14 | 92% | 99% | 98% | 98% |
| swing 8, bite 14, **no confusion** | 77% | 94% | 93% | 92% |
| swing 12, bite 14, no confusion | 77% | 94% | 93% | 93% |
| **swing 12, bite 10 (shipped)** | **89%** | **99%** | **97%** | **97%** |

What the table says: nearly all of its strength is the one confusion. The bot
aims an Ultimate at the enemy doing the most this round, and taking that one
enemy's blow off the party is worth more than any of the damage; without it
the Ultimate is worth nothing to the bot at all. The damage barely moves the
number. So the confusion stayed (it is the path), and the bite was cut from
14 to 10 to bring it within a point of the Hall of Mirrors; duos sit three
points under it and level with the Open Mind.

## Space, palette, sound

- **Space: a marionette theatre, from the wings.** Backstage of a small
  wooden puppet theatre after hours: a raked stage of worn boards with chalk
  crosses for places, a painted backcloth hung from a batten (the dungeon
  itself painted as naive scenery: a scene painter's round arch and pillars
  in flat distemper, two torches whose flames are only paint), an oxblood
  velvet leg at the far side, and in the wing the puppeteer's **bridge**, a
  plank deck on trestles with a rail and fly lines tied off on its posts. One
  work lamp hangs over the stage. Not a hall, forge, storm, ridge, causeway,
  meadow, vault, undergrowth, mere, wood, no-man's-land, snowfield, pit, page,
  mirror room, the floor of a mind, or a chamber held mid-collapse. The only
  film in a theatre, and the only one whose space is built for someone to be
  *made* to perform.
- **The strings** (`perf-strings`), drawn one way everywhere: three long lines
  to the puppet's crown and both hands, a warm white core over a thin ink
  edge and a carmine glow, a gilt hook where each bites. They are drawn
  between the real figures every frame, from the crossbar as the caster's
  drawing really holds it (measured off its `control` part), so they fly,
  bite, go taut and whip with the bodies.
- **The splinters** (`perf-splinters`): the swing strikes like wood on wood.
  Raw-wood slivers and chips of paint in the theatre's own colours burst off
  each body where and when the swing reaches it.
- **The curtain** (`perf-curtain`): an oxblood drop curtain with a gilt
  fringe, the film's wipe. It falls over the end of the swing and rises off
  the real board.
- **Palette:** backstage umber `#140c0a`, raw board `#4d3421`, backcloth
  distemper teal-grey `#526763`, oxblood velvet `#5c1420`, gilt `#b8893e`, the
  work lamp's warm light `#ffb45c`, and the accent, **carmine** `#ff5aa5`: the
  strings' glow, the call, and the drawn frame. The room is wood, cloth and
  lamplight; the only colour in it that is not is the will on the strings.
  No violet, no green light, no glass, no moon, no amber-lined stills.
- **Motif (original):** four notes on a wooden bar instrument, D4, up to A4,
  down to F4, then a leap to C♯5, held and never resolved, over a plucked low
  D: a marionette's walk whose last step lands where it was always going to.
- **Signature sound:** the yank (`perf-yank`): a gut string snapped taut, its
  pitch leaping up, with the crossbar's clack on it. The film's whole family
  is wood and gut: crossbar clacks, hollow wooden footfalls, three taut
  plucks as the strings bite, the joints creaking.
- **Impact, layered** (`perf-impact`): a dry crack of wood (transient), a sub
  drop, the body a scatter of splintering crackles over a torn noise band,
  and a lowpassed room with two strings left ringing a semitone apart (tail).
  `perf-knock` follows as the swing goes on through the line.

## Rhythm

A performance in five beats. **Places** (identity: the doll is cut loose) →
**casting** (stakes and target: the strings fly from the bridge onto one real
enemy and stand it up; title) → **blocking** (escalation: the puppet is walked
into its own line in marionette steps, the rest turning to face it) → **the
held pose** (quiet: the puppet hoisted off the boards in silhouette against
the lamp's pool, nothing moving but one string) → **the swing** (impact:
yanked down through its own line like a weight) → **curtain call** (release:
the drop curtain rises off the real board, the puppet still on its strings,
the rest struck).

## Shots — 4.56s FULL, 2.40s FAST (53%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Beguiler `ult:perf-call`: the control lifted high as if by the scruff, the doll jerked | real battlefield sinks to backstage umber, bars close | carmine call aura; three strings drop from the top of the screen onto the real target and snap taut (`perf-drop`, anchored, the target only) | `perf-call`: two hollow clacks of the crossbar and the strings running down; music ducks | on board | — | break the round: someone has picked this one |
| 1 | Snip · detail | 620 (400) | tight on mask, control and shard; Dutch 8° → 5°, slow push | `ult:perf-snip` (`root: false`): the control let down to the chest, the eye glances down at the doll, the shard comes up across the strings, **the doll is cut loose and drops out of frame**, the strings spring up short, the eye comes back up to the lens a little wider | theatre, near dark; the lamp's warm rim from the left | a glint runs along the shard's edge, three cut string ends spring up (`perf-snip`) | `perf-snip`: a scrape, a snip, the twang of the ends, a small wooden clatter far below; "Up you get. You're in the next act." | no | black 50ms | identity: it has a real one now |
| 2 | Casting · over-the-shoulder, target wide | 940 (—) | wide past the Beguiler at the bridge rail, down onto the stage; a slow crane down and in | `ult:perf-cast`: the control thrown forward like a line, then drawn back hard as the strings bite | the theatre lit: backcloth, boards, lamp; warm rim | the bridge rail across the foreground (`perf-rail`); **the strings pay out from the crossbar in long arcs and hook into the real target**, which is jerked up off its feet on them (`perf-strings` cast) | **motif**; `perf-hook`: three taut plucks as they bite | **the real line**; the puppet stood up, the rest looking round (`anticipate`) | cut | stakes and target; title |
| 3 | Blocking · profile tracking | 520 (340) | level with the boards, trucking right with the puppet | — | theatre, lamp light from behind | **the puppet walked in three marionette steps into its own line**: lifted, carried, set down, lurching, on strings from the dark; the rest turned round to face it and shying back as it comes (`perf-strings` walk) | `perf-walk`: hollow wooden footfalls on each step, joints creaking | **line**, the rest shying (`block`) | cut | escalation: its body goes where the strings go |
| 4 | Held · low angle (the quiet) | 560 (380) | from the boards, looking up; dead still | — (the Beguiler is off the top of the frame) | exposure 0.1 → 0.08, heavy vignette; the lamp's pool on the backcloth drawn over the exposure (`perf-lamp`) | **the puppet hoisted off the boards in silhouette against the pool**, strings taut out of the top of the frame; **one string trembles**; lamp dust held still (`motes` still) | **music ducked to 4%**; two faint beating tones of taut strings, one slow creak, a knuckle on the bar (`perf-hush`) | **puppet**, hoisted and held | cut | anticipation by suspension |
| 5 | Swing · impact | 800 (560) | medium wide at stage height, Dutch 3° → 1°, easing out; the Beguiler small on the bridge at top left | `ult:perf-yank` (contact 0.04), in silhouette behind the rail | a hot field of lamp light behind the line (`perf-lamp` hot) so the drawn frame is carmine and ink; the theatre comes back up behind it | **70ms carmine two-tone**: the puppet already swung down into the enemy beside it, **a sheaf of ink string lines fanned along the arc it came by**; it goes on through the rest of the line, each struck as it arrives with **a burst of splinters and paint** (`perf-strings` swing, `perf-splinters`); the drop curtain falls at the very end (`perf-curtain` in) | `perf-yank` + layered `perf-impact`; `perf-knock`; `perf-drape` under the curtain; **140ms stop**, heavy shake, a second shake | **line**: `hurt`, shoved and tilted as the swing reaches each | cut | impact; `$damage`; "There. Just as we rehearsed." |
| 6 | Curtain call · return | 720 (480) | battle camera | real Beguiler `ult:perf-bow`: a showman's bow over the control | real battlefield; bars open | **the curtain is hauled up off the board** (`perf-curtain` out); the puppet hangs on slack strings from the top of the screen, swaying (`perf-drop` hang); splinters burst off every other real enemy, staggered (`perf-splinters`, anchored) | `perf-rise`: the curtain's wooden rings; `perf-after`: the motif's last two notes; tail | on board | the curtain (in-folder wipe) | release: the puppet open and on strings, the rest struck |

### Boss framing

A boss is too heavy to swing. In **Casting** the camera pulls back and the
line spreads so the boss stands whole. In **Blocking** it is hauled a single
heavy step, not walked, in a wider frame. In **Held** it is lifted only onto
its toes and fills the frame to the waist. In **Swing** it is not swung but
**yanked** (`perf-strings` yank): hauled forward and down by its own weight
against the hot field, anything beside it struck by the fall, the splinter
burst at its feet. **Large** framing re-frames the held pose, where a heavy
body in silhouette was cut off by the frame.

### FAST

Drops **Casting**. The strings are already on the puppet when **Blocking**
opens, and the title rides that shot. It keeps the snip, the walk, the held
pose, the swing and the curtain.

## Performance, without a face layer

The Beguiler is not one of the five face heroes; its face is a mask. The Hall
of Mirrors acts with a head that tilts too far, the Open Mind with an eye that
narrows to a pin, Eyespot with a glance and a wink. The Puppeteer acts with
**its hands**: the shard crossing the strings, the doll dropped, the control
thrown and drawn back, the yank. The eye only *watches*: down at the doll as
it goes, then back up at you, a little wider.

A close-up-only **`doll`** part was added to `Beguiler.tsx` (registered only
in a film's copy of the figure, like the Open Mind's `eye`); at rest it hangs
exactly where it always did. After the snip every later clip holds `doll`
and the short drawn `strings` at scale 0, so the doll never comes back in
the film. On the board the bow holds `strings` at scale 0 too; the doll is
back on its strings when the round begins.

**Root keys**, authored for the shot each clip plays in: `ult:perf-call` (a
rise and lean back, battlefield size), `ult:perf-cast` (a lean into the throw
and back, as a foreground figure), `ult:perf-yank` (lunged down behind the
bar: x 0.05, rotate 9°, squash 0.9, small on the bridge), `ult:perf-bow` (the
bow, battlefield size). `ult:perf-snip` has only a hair of root motion, and
its close-up sets `root: false`. Nothing is rebuilt on the caster's
`.cine-look`. The **enemies'** `.cine-look` is moved by `perf-strings`, which
is the only way the engine lets one figure of a row do something the rest do
not (see below).

## Notes from the lab

- The first drawn frame was unreadable: at exposure 0.95 the backcloth's
  stone blocks and the string sheaf went to the same tone and made a grid
  over the bodies. It reads now because a hot field of lamp light is laid
  behind the line on the effects layer (above the exposure): the two-tone
  turns it carmine and every figure ink, and the sheaf was changed from light
  to ink lines so it reads on it. The field fades back to 40% after the
  blow so the theatre returns.
- On the drawn frame the puppet must already be *in* the next enemy. The
  swing is solved backwards from that: the arc's angle at contact is the one
  that puts the puppet's leading edge 0.42 of a body into the first of the
  rest; the cut hides the fall from where the stage placed it. Contact times
  for the rest are measured as the swing reaches each, and never past world
  x 1240, so a four-enemy line is struck without the puppet leaving the
  frame. The puppet is painted over the line it is swung into.
- The strings start from the crossbar as drawn, measured each frame with
  `getScreenCTM` off the caster's `control` part, so they follow the throw
  and the lean exactly; the browser test checks every string starts on the
  crossbar and ends on the puppet.
- The accent was amber (the work lamp's colour) until **Still Life** merged
  with an amber accent and an amber two-tone. The lamp keeps its warm light
  as the room's light, and the strings, the call and the drawn frame moved to
  carmine.
- Sounds were rendered offline in the browser and measured against the other
  Beguiler films: the impact peaks at 1.16 (Hall of Mirrors 1.21, Eyespot
  1.14, Open Mind 1.20), the motif's RMS at 0.029 (0.030, 0.025, 0.027), the
  call at 0.37 (0.48, 0.43, 0.38), the release at 0.13 (0.09–0.12). The first
  render had the impact at 1.32 and the knock, walk and hook plucks loud
  enough to step on it; all were brought down.
- Performance (dev build, `GPU=1 scripts/profile-ultimate.ts`, 1920×1080, a
  shared machine at load average ~17): film p50 16.7ms / p95 33.3ms, 4 frames
  over 34ms; the round after it p50 16.7 / p95 33.3, 8 over 34ms. The Hall of
  Mirrors minutes later: film p50 16.7 / p95 33.4. Peak 1,358 nodes (1,218
  SVG), 5 live effects, no filtered elements.

## What the engine could not do, and what was built instead

- **One figure of a row acting on its own.** An actor cue places a row of
  targets with one set of reactions and one facing, and the puppet must be
  worked while the rest shy, turn round or are struck one after another.
  `perf-strings` moves each target's `.cine-look` (translate, rotate, and a
  mirror to turn the rest round) and puts it back when it unmounts; the rows'
  `hurt` and `block` clips still land together. The engine would need
  per-slot actor cues (or per-slot `react`, `shove` and `face`).
- **Effects riding a figure the effect itself moves.** `follow` and `each`
  ride the stage's ground point, not a look transform, so the splinter bursts
  are positioned by `perf-splinters` from the contact points `perf-strings`
  records on each figure (`data-perf-hit`).
- **An occlusion with another object.** The occluder is always a cape, so the
  drop curtain is an in-folder screen effect straddling the cut, with the
  shot's transition left a `cut`. The engine would need an `occlusion` whose
  object is an effect kind.
- **Moving an enemy into the front logs no beat**, so the film does not claim
  the row change; the board re-lays the puppet out at the reveal.
- **Confusion logs no beat** until the puppet acts, so a round with no hero
  actions carries the puppet's turned blow inside the Ultimate's segment; the
  film does not show that blow, only the swing.
- **One reveal covers every target**: the whole line's damage lands on the
  drawn frame, though the film strikes the rest one after another over the
  next 300ms.
- **Poses for enemies.** Only party rigs take `ult:` clips, so the puppet's
  marionette walk and hoist are whole-figure motion on its look, not limbs
  lifted on the strings.
