# Mourning Water — Warden · Hollow Druid

**The idea, in one sentence:** the Hollow Druid weeps without opening its
eyes — one tear, heavy with everything the green has lost, falls into the open
hand that used to heal — and when that hand closes, the black water the tear
became closes over the one who took it.

Only the Hollow Druid could have it. The Warden's drawing is an old face with
its eyes shut and an open hand, "the one that heals"; the path, *The green
remembers what was taken*, gave up the healing dew for Drown. So the film is
that hand doing the one thing it never did: closing. The tear is the grief,
the hand is the healing that is withdrawn, and the water is the drowning — one
gesture, and its shape is repeated at the scale of the target: the fingers
curl, and the mere curls over the enemy the same way.

## Gameplay (`ultimate-defs/war-hollow.ts`)

| | Green Reckoning (Warden) | **Mourning Water** (Hollow Druid) |
| --- | --- | --- |
| Target | self: the whole field | **one enemy** |
| The party | healed 18, Regen, Burn/Poison/Weak cleared, the downed lifted | **nothing** — no heal, no cleanse |
| The target | Poison 4 a round | **24, Wet 3 rounds, Weak 2 rounds**; **10 more if it was already Wet** |
| The rest of the line | Poison 4 a round | **Wet 2 rounds; any already Wet also Weak this round** |
| Growth | — | +2 |

Speed 10. What it does is the path's identity pushed to the end: the Warden's
healing turned into grief, and grief into drowning. It sets up rather than
restores — Wet for the party's lightning (Chain Shock) on every enemy, Weak on
the one that matters — and it remembers: whatever the party had already soaked
(the Druid's own Drown, the Arcanist's rain, the Tidecaller) is taken further.

## Space, palette, shape

- **Space: the mere in the hollow.** A drowned dell at night, full to its
  rim with black, perfectly still water; a far bank of weeping willows whose
  hanging fronds trail in it; duckweed skinning the edges and a few fallen
  leaves floating, which is all the green that is left of what the water
  took. Everyone in the film stands in it, the water drawn in front of their
  legs. Not a hall, forge, storm, causeway, wood of trunks, ridge, pit,
  vault, mirror room, mind or the ground under the floor; no rain, no wave,
  no roots, no heartbeat, no reflections.
- **Palette:** mere black-green `#050c0b`, willow `#34472f`, the tear's cold
  white `#e6f3ec`, and duckweed `#a9bf62` (the accent) — a dull, old green,
  never the base film's bright sap. The lantern's amber is the one warm light,
  and it goes out.
- **Shape language:** the drop and the ring it makes; the curl of a closing
  hand, which the water makes too; long falling strands (tears, fronds, water
  running off a figure).

## Rhythm

identity (the face: the brow breaks, and a tear runs out from under the shut
lids) → escalation (the tear falls into the open palm; the palm fills with far
more water than one tear and it spills) → stakes and target (the mere, wide:
the spill's rings run across the still water to the real target, which feels
it rising and braces; title) → **quiet** (across the water from behind the
raised hand: the fingers begin to close round the far-off enemy; the lantern
is already out, the music is gone, nothing moves but the fingers) → **impact** (the
mere closes over the target in the shape of the hand: a drawn frame, a stop,
the damage) → release (the real board: the target standing in black water
that clings to it and drags; every other enemy ringed and dripping).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Warden `ult:mourn-bow` — head bows low, the open hand drawn in to the chest, the lantern swings and stills | real battlefield sinks to mere-black, bars close | duckweed call aura; a black pool spreads on the real floor under the Warden, a single ring runs out of it | call bell; one deep drip; music ducks | on board | — | break the round: the Warden stops, and grieves |
| 1 | Tear · face close-up | 700 (440) | tight on the face under the hood, level, a slow push; **mirrored** (the Warden faces left, the face right of centre) so it does not rhyme with the hold's face at the left edge | `ult:mourn-weep` (`root: false`) — the brow's inner ends lift and knit, the shut lids press, the mouth works and trembles, the head shudders once | the hollow, near black; cold rim | **a tear wells from under the lid, runs the cheek leaving a wet track, and drops off the beard** | a breath caught; one high glassy tone | no | black 60ms | identity: the face that never opens its eyes, grieving |
| 2 | Palm · detail | 560 (320) | on the open hand, held out level and larger than life, filling the frame with no face in it, Dutch −6° → −3° | `ult:mourn-cup` (`root: false`) — the hand held out (scale 1.3) to receive the tear and dipping under a weight too heavy for one | the hollow; **the green light in the palm lights the hand**, then goes out | **the close-up's cupped hand** (`--wdn-palm`: thumb raised, fingers curling up); **the tear falls in view** with a streak, through the light, into the palm: a crown of spray; **the light swells, gutters and goes out** to a thread of smoke; black water fills the hollow of the hand and spills; a drop hits the lens and **rings open across the glass** | **the signature: one huge drop into still water**, a hollow tail | no | cut | escalation: one tear, the light it puts out, and far more water than a tear |
| 3 | Mere · wide target | 900 (—) | low over the water, square-on, drifting right | Warden small at the left, `ult:mourn-pour` — leaning out, hand over the water, strands falling from it | the mere in the hollow: willows, still black water, duckweed; **the lantern gutters and goes out** as the water climbs the target | **rings run across the whole mere from the Warden's strands to the target**; the water heaps round the target and climbs its legs (`mourn-shallows` rise) | **motif** (four glass notes, falling); drips | **yes** — `anticipate` as the rings reach it | in-folder: the drop's rings on the glass carry over the cut onto the mere (`mourn-lens`) | stakes and target; title |
| 4 | Hold · foreground hand (the quiet) | 600 (400) | dead still: the Warden's raised hand huge at the left, the face cut by the frame, the target small across the water just past the fingers | `ult:mourn-grasp` (`root: false`) — arm up, the open hand held; the fingers close from open to a curl (`--wdn-grasp` 0 → 0.55, three drawn stages) | exposure 0.34 → 0.18, vignette 0.92, the lantern out, the palm's green light out | nothing moves but the fingers | music ducked to 3%; one far drip; a knuckle creak; a low breath of air | **yes**, far off, still | cut | anticipation by subtraction: the hand closing on it |
| 5 | Drown · impact | 760 (560) | low at the waterline on the target, Dutch 5° → 2°, easing out | target `hurt` after the stop, dragged down (shove) and tilted; the Warden a far silhouette, `ult:mourn-fist`, fist shut (`--wdn-grasp` 1) | exposure 1 → 0.55; a pale light off the water behind the target (`mourn-glare`) so the drawn frame reads | **two-tone frame (40ms): a black hand of water closed round the target**, four fingers edged in light, spray off the knuckles; the stop holds it **in colour**: fingers and thumb of translucent black water over the target, which shows through; it squeezes, lets go and falls back in strands and rings; drips keep running off the target (`mourn-cling`) | layered impact (slap, sub, heave, bubbles, a glass chord); **150ms stop at 0.075**; heavy shake; water falling | **yes** | cut on the two-tone frame | impact: the result on the frame; damage |
| 6 | Still · return | 740 (480) | battle camera | real Warden `ult:mourn-open` — the fist opens slowly, the head lifts | real battlefield; bars open | **on every real enemy, water drawn on the figure itself**: a copy of its own drawing laid over it as a dark wet coat with a pale wet edge, runs ending in beads, drips; **the drowned** heavy-coated, water sheeting off both its sides, weed on it, in a black pool much wider than it with rings going out; **the rest** lighter, dripping, a pool at their feet, one after another. All sized from each figure's measured box and painted bounds, so a hound and the Collector both read | the motif's last note, drips, tail | on board | flash 80ms | release: who is drowned, and who is soaked, at board scale |

FULL 4680ms, FAST 2440ms (52%). FAST drops the wide mere and keeps the tear,
the palm, the quiet (the target is in it) and the impact.

## Voice

"Everything you took… it kept." · "Hold it. We had to." · "Heavy, isn't it.
It doesn't dry."

## Framing

- **Large and boss.** The wide and the impact are re-framed. The wide pulls
  back and sets the target smaller in the water so a boss stands whole under
  the title. The impact pulls back and sets the fist smaller against the
  target's height (0.85 → 0.78 → 0.62 of the figure) so the hand still closes
  round a boss's body with its head above the knuckles rather than a fist that
  fills the frame. The quiet needs none: the target is small and far off.
- **Party size** does not change the film: the cast is the Warden and the one
  it drowns. The rest of the line is drawn off the board in the return.

## FAST

Drops the wide mere (the title moves to the palm shot) and keeps the tear, the
palm, the quiet with the target in it, and the impact. 2440ms of 4680ms (52%).

## Notes from the lab

- Every camera and effect was placed from probed positions
  (`scripts/probe-ultimate.ts`): the face at size 1000 (eyes at world
  ~(749, 260)), the palm pool at (830, 629) in the palm shot, the raised hand
  in the quiet.
- **The tear and the palm-water are drawn inside the Warden's copy**, in its
  head (`[data-art="illustrated-head"]`) and its `hand` part, in drawing units,
  so a shudder of the head or the hand sinking under the weight carries them
  exactly. The node is added by the effect's first frame and removed when the
  effect unmounts (its shot ends, or the film is skipped).
- **The hand closes in three drawings**, not a cross-fade: `Warden.tsx` gained
  a curl and a fist inside the `hand` part, drawn only in an Ultimate's
  close-up copy and stepped on `--wdn-grasp` (open < 0.34 < curl < 0.67 <
  fist). Unset, only the open hand is drawn, so a round's Warden and Green
  Reckoning's copy are unchanged; the open eyes (`--wdn-eyes`) are untouched.
- The lantern going out and the palm's green light being put out are this
  film's CSS on its own copy (`--mourn-lamp`, `--mourn-mote`). Their idle
  flicker is a keyframe on opacity, which wins over a plain value, so the film
  holds the animation off on its copy only.
- **The water in front of the figures' legs** (`mourn-shallows`) is the
  mere's colour faded out at both sides, with a black copy under
  `1 - --exposure`: a front-layer effect is not dimmed by the exposure layer
  the background is, and the first, square version showed as a dark pedestal.
- **The two-tone frame read as a black blob** at first: the filter makes a
  dark fist and a dark background one black. A pale light off the water behind
  the target (`mourn-glare`, a gradient, no filter) and a pale edge down each
  finger make the frame a hand. The two-tone is 40ms and ends before the stop,
  so the held frame is in colour (the lesson from Into the Din).
- **Lead review revision.** The palm shot read as sleeve, heavy ink, a bean
  and a disc: the drawing's open hand is a bean with a notch at every zoom. The
  close-up now draws a cupped hand of its own inside the `hand` part, stepped
  on `--wdn-palm` exactly as the fist is on `--wdn-grasp` (unset, nothing
  changes: the round, Green Reckoning and the hold keep the drawing's hand).
  The hand is held out level at 1.3× so it fills a frame with no face in it,
  the tear falls into it in view, and the light it holds is drawn behind the
  hand (a gradient, moved to the part's first child so it never washes the
  ink) and goes out as the event. The return first drew a thin ring at each
  enemy's feet, which only the game's "Wet" labels explained. It now lays a
  copy of each enemy's own board drawing over it as a wet coat (ids, classes
  and filters stripped), hangs runs, beads and pours from the drawing's
  measured painted bounds (a hound is low in its box), and pools the drowned in
  black water about 1.7× its width. A first version with long dashed streams
  read as rain and as a cage; the runs are short, uneven and end in beads.
- The tear close-up is mirrored (`face: -1`), so the face sits right of centre
  and no longer rhymes with the hold's face at the left edge.
- The water left on the target was first drawn as hanging strands; they read
  as bars of a cage, then as sticks. It is now beads that swell on the body's
  edge and drop, over and over, into a ringing pool — soaked and heavy.
- Sounds were rendered offline (`OfflineAudioContext`) and measured:
  `mourn-impact` peak 1.50 / RMS 0.103 against Green Reckoning's impact at
  1.40 / 0.100; the signature `mourn-drop` 0.73 / 0.040; the motif 0.18 / 0.041
  against Green Reckoning's 0.18 / 0.027. Measuring found a shared-synth
  click: a `crash()` started partway into a render (here 0.55s) put a
  single-sample peak of ~0.5–0.75 through regardless of its gain, most likely
  its gain node sitting at its default 1 before `setValueAtTime` takes effect.
  `audio/synth.ts` is shared and was not changed; it affects every film.
- Root keys: `ult:mourn-bow` (battlefield: sinks 0.035, leans 4.5°),
  `ult:mourn-pour` (the wide: leans out x 0.035, 6°), `ult:mourn-fist` (the far
  silhouette folds, y 0.03, 6°) and `ult:mourn-open` (battlefield, settling
  back). The close-ups (`ult:mourn-weep`, `ult:mourn-cup`, `ult:mourn-grasp`)
  keep the root still and their cues set `root: false`.
- Profile (1920×1080, real GPU, dev build, shared machine): film p50 16.7ms /
  p95 49.9ms, 11 frames over 34ms; the round after it p50 16.7ms / p95 49.9ms,
  15 over 34ms. Peak 1155 nodes (1089 SVG), 6 live effects, 0 filtered
  elements.
- Balance (`ultimate-report.ts 4 --sample=6`, 324 runs, same machine): with the
  stub `null`, all 91% off / 93% on (2 players 75/83, 3 players 94/95, 4
  players 92/94); with Mourning Water, identical in every row. The Warden's
  uses per run 1.80 → 1.83. The bot rarely trains the Hollow Druid in this
  sample, so this says it moves nothing, not how strong it is.

## What the engine could not do, and what was built instead

- **The rest of the line is not in the cast.** Wet and Weak are statuses, so
  only the drowned target is. The film is about one drowning on purpose; the
  return finds every other living enemy on the board (`mourn-board` soaked)
  and draws its water there. The engine would need an Ultimate's status
  effects to count as reach.
- **A result on the frame.** Wet and Weak leave no beat, so the reveal punches
  only the damage; the film draws them itself (the fist, the water running off
  the target, the pool).
- **The occlusion object is always a cape.** The cut from the palm to the mere
  is an in-folder screen effect: a drop hits the lens and its rings carry over
  the cut onto the water.
- **Presentation copies do not carry the target's statuses from before the
  cast**, so the film cannot show that a target was already Wet (and took 10
  more): the damage number says it.

