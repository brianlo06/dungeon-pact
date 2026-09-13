# Command Performance — Beguiler · Puppeteer

**The idea, in one sentence:** the Puppeteer cuts the little wooden doll off
its own strings, because it has a real one now: it drops the strings from a
marionette theatre's bridge onto one enemy, walks it downstage, hoists it,
and swings it like a weight on a line through its own side.

Only the Puppeteer could have it. The Beguiler's drawing is a figure *holding
someone*: a marionette's control held up in front, a limp wooden doll on the
strings. The Hall of Mirrors kept the control to one gesture and put the lie
in the enemy's eyes; it turns a whole line with doubt and never touches
anyone. The Puppeteer's path title is the plot, *You were always going to do
this for me*, and its signature is **Puppetry**: one enemy strikes its own
side and is left open. So this film has no doubt in it, no mirror and no
crowd. It has one body, and what a puppeteer does with one: stands it up,
walks it, lifts its arms, and uses its weight.

## Gameplay purpose

`ultimate-defs/bgl-puppeteer.ts`, target an enemy, cost 100, speed 20:

1. the puppet is **walked into the front line** (`move`), where the party's
   melee can reach it past any screen;
2. it is **swung through its own side**: every other enemy takes arcane from
   the swing (BALANCE: amount below);
3. if the party had **already opened it** (Vulnerable: Puppetry, Seed of
   doubt, Unpick the seam, Mind spike, the Breaker, the Broker), the opening
   is dragged into everything it hits: **every other enemy is left
   Vulnerable** too;
4. then it is left hanging: **arcane through armour**, **Vulnerable** for two
   rounds, and **still on the strings** (Confused this round: its own blow, at
   its own strength, lands on its own side).

| | Hall of Mirrors (base) | **Command Performance** (Puppeteer) |
| --- | --- | --- |
| Who is turned | **every** enemy, this round | **one**: the puppet, and only as the tail of the act |
| The chosen enemy | 10 arcane | walked into the front; arcane through armour; Vulnerable 2 rounds; Confused |
| Every other enemy | a 0-base sliver of glass | **struck by the puppet's body**; Vulnerable if the puppet was already open |
| What it pays the Beguiler | control charge from every turned blow | control charge from one |

It differs in what it does, not only in numbers. The Hall of Mirrors is doubt
spread thin: the enemy round does whatever the line happens to do to itself,
and the damage is a sliver. Command Performance spends one body. Its damage to
the rest is immediate and certain; its control is one enemy's blow; and its
team play is a plan across two rounds. **Puppetry now, Command Performance
next** (or any Vulnerable the party leaves: the Breaker's row, Unpick the
seam's row, Mind spike) and the whole enemy side is open for the party's
blows this round and next, with the puppet in reach of the melee.

Confusion is in it once, on purpose, and never as its centre: it is the only
way the effect system lets an enemy's own strength be used against its side
(every damage effect is sized by the caster), and it is what Puppetry does.

### Balance

BALANCE: to be filled in from `scripts/ultimate-report.ts 4 --sample=6` and a
head-to-head with every Beguiler playing each Beguiler Ultimate.

## Space, palette, sound

- **Space: a marionette theatre, from the bridge.** Backstage of a small
  wooden puppet theatre after hours: a raked stage of worn boards, a painted
  backcloth hung from a batten (the dungeon itself painted as naive scenery:
  a scene painter's arch and pillars in flat distemper), a proscenium of
  carved gilt wood with an oxblood drop curtain, and above it all the
  puppeteer's **bridge**, a plank walkway with a rail from which the
  Beguiler leans out over the scene. One work lamp in the wings rakes warm
  light across the stage. Not a hall, forge, storm, ridge, causeway, meadow,
  vault, undergrowth, mere, wood, no-man's-land, snowfield, pit, page, mirror
  room or the floor of a mind. The only film in a theatre, and the only one
  whose space is built for someone to be *made* to perform.
- **The strings** (`perf-strings`), drawn one way everywhere: three long lines
  from the control bar to the puppet's head and both hands, a warm lamp-white
  core over a thin dark edge so they read on light and on dark, and each with
  a small brass hook where it bites. They are drawn between the real figures
  every frame, so they go taut, slacken and whip with the bodies.
- **Palette:** backstage umber `#140c0a`, raw board `#6b4a33`, backcloth
  distemper teal-grey `#58706c`, oxblood velvet `#4a0f18`, gilt `#c89a4a`, and
  the accent, lamp amber `#ffb45c`: the lamp, the strings, the two-tone. No
  violet, no green light, no glass, no moon.
- **Motif (original):** four notes on a wooden bar instrument, D4, A4, F4 and
  then C♯5, held and left unresolved: a marionette's walking tune with its
  last step landing where it was always going to.
- **Signature sound:** the string yanked taut (`perf-yank`): a gut string
  snapped tight, its pitch jumping up, with the control's crossbar clacking.
- **Impact, layered** (`perf-impact`): a dry wood crack (transient), a sub drop,
  the body a burst of splintering (short crackles over a torn noise band), and
  a room tail with the strings left ringing.

## Rhythm

A performance in five beats. **Places** (identity: the doll is cut loose) →
**casting** (stakes and target: the strings drop from the bridge onto one real
enemy and stand it up; title) → **blocking** (escalation: the puppet is walked
into its own side in marionette steps) → **the held pose** (quiet: the puppet
hoisted off the boards against the lamp-lit backcloth, nothing moving but one
string) → **the swing** (impact: yanked down through its own line like a
weight) → **curtain call** (release: the drop curtain rises off the real
board, the puppet still on its strings in the front, the rest struck).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Beguiler `ult:perf-call`: the control lifted high, the doll jerked | real battlefield sinks to backstage umber, bars close | amber call aura; three strings drop from the top of the screen onto the real target (`perf-drop`, anchored) | `perf-call`: two hollow clacks of the crossbar and the strings running down; music ducks | on board | — | break the round: someone has picked this one |
| 1 | Snip · detail | 620 (400) | tight on mask, control and shard; Dutch 8° → 5°, slow push | `ult:perf-snip` (`root: false`): the shard comes up across the strings, the eye glances down, **the doll is cut loose and drops out of frame**, the cut strings spring up, the eye comes back to the lens | theatre, near dark; the lamp's warm rim from the left | a glint along the shard's edge at the cut; three cut string ends curling up (`perf-snip`) | `perf-snip`: a scrape and a snip, a twang, a small wooden clatter far below; "Up you get. You're in the next act." | no | black 50ms | identity: it has a real one now |
| 2 | Casting · over-the-shoulder, target wide | 940 (—) | high and wide past the Beguiler's shoulder on the bridge, craning down onto the stage | `ult:perf-cast`: the control thrown forward like a line, then drawn back | the theatre lit: backcloth, boards, lamp | the rail of the bridge across the foreground (`perf-rail`); **the strings pay out in long curves and hook onto the real target**, which is jerked upright on them (`perf-strings`, `perf-marionette`) | **motif**; `perf-hook`: three taut plucks as they bite | **the real line**; the puppet stood up, the rest looking round (`anticipate`) | cut | stakes and target; title |
| 3 | Blocking · profile tracking | 520 (320) | level with the boards, trucking right with the puppet | `ult:perf-work` (small, at the top of frame edge: only the strings are seen) | theatre, lamp raking from the left | **the puppet walked in marionette steps into its own line**: lifted, set down, knees buckling, head lolling round to the next enemy (`perf-marionette` walk); the others shying back | `perf-walk`: hollow wooden footfalls and creaks | **line**, the rest shying (`block`) | cut | escalation: its body goes where the strings go |
| 4 | Held · low angle (the quiet) | 560 (380) | from the boards, looking up; dead still | — (the Beguiler is off the top of the frame) | exposure down to the lamp's pool on the backcloth; everything else black | **the puppet hoisted off the boards in silhouette against the backcloth**, arms up, strings taut out of the top of the frame; one string trembles; dust held in the light | music ducked to 4%; one slow creak of taut string, a breath of wood (`perf-hush`) | **puppet**, hoisted and held | cut | anticipation by suspension |
| 5 | Swing · impact | 800 (560) | medium wide at stage height, the bridge in the top left; easing out | `ult:perf-yank` (contact 0.04), small on the bridge in silhouette | exposure blown then settling; lamp amber behind | **70ms amber two-tone**; the puppet swung down through its line like a pendulum, a sheaf of string lines fanned along its arc (`perf-arc`); **splinters and paint chips** off every body it strikes (`perf-splinters`), staggered along the line; the drop curtain falls at the very end (`perf-curtain`) | `perf-yank` + layered `perf-impact`; `perf-knock` as it strikes each; **140ms stop**, heavy shake | **line**: `hurt`, shoved and tilted as the swing reaches each | cut on the two-tone | impact; `$damage`; "There. Just as we rehearsed." |
| 6 | Curtain call · return | 720 (480) | battle camera | real Beguiler `ult:perf-bow`: a showman's bow over the control | real battlefield; bars open | **the curtain rises off the board** (`perf-curtain`); the puppet stands in the front on slack strings from the top of the screen, swaying (`perf-hang`); a burst of splinters off each other real enemy, staggered (`perf-splinters`, anchored) | `perf-curtain`: cloth and wooden rings; `perf-after`; tail | on board | the curtain (in-folder wipe) | release: the puppet in reach, on strings, and the rest struck |

### Boss framing

A boss is too heavy to swing. In **Casting** the camera pulls back to take in
its height and the strings reach further down. In **Blocking** it is hauled a
single heavy step, not walked. In **Held** it is lifted onto its toes, arms
dragged up, filling the frame to the waist. In **Swing** it is not swung: it is
yanked forward and down onto the boards by its own weight, splinters burst from
the boards under it, and anything beside it is struck by the fall. Large
framing sits between.

### FAST

Drops **Casting**. The strings are already on the puppet when **Blocking**
opens, and the title rides that shot. It keeps the snip, the walk, the held
pose, the swing and the curtain.

## Performance, without a face layer

The Beguiler is not one of the five face heroes; its face is a mask. The Hall
of Mirrors acts with a head that tilts too far, the Open Mind with an eye that
narrows to a pin, Eyespot with a glance and a wink. The Puppeteer acts with
**its hands**: the shard crossing the strings, the doll dropped, the control
thrown and drawn back, the fingers working the bar. The eye only *watches*:
down at the falling doll, then back up at you.

A close-up-only `doll` part was added to `Beguiler.tsx` (registered only in a
film's copy of the figure, like the `eye`); at rest it hangs where it always
did.
