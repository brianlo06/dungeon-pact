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
goes out, the music is gone, nothing moves but the fingers) → **impact** (the
mere closes over the target in the shape of the hand: a drawn frame, a stop,
the damage) → release (the real board: the target standing in black water
that clings to it and drags; every other enemy ringed and dripping).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Warden `ult:mourn-bow` — head bows low, the open hand drawn in to the chest, the lantern swings and stills | real battlefield sinks to mere-black, bars close | duckweed call aura; a black pool spreads on the real floor under the Warden, a single ring runs out of it | call bell; one deep drip; music ducks | on board | — | break the round: the Warden stops, and grieves |
| 1 | Tear · face close-up | 700 (440) | tight on the face under the hood, level, a slow push | `ult:mourn-weep` (`root: false`) — the brow's inner ends lift and knit, the shut lids press, the mouth works and trembles, the head shudders once | the hollow, near black; cold rim | **a tear wells from under the lid, runs the cheek leaving a wet track, and drops off the beard** | a breath caught; one high glassy tone | no | black 60ms | identity: the face that never opens its eyes, grieving |
| 2 | Palm · detail | 560 (320) | on the open hand, Dutch −6° → −3°, falling with the drop | `ult:mourn-cup` (`root: false`) — the hand lifts to receive it and dips under a weight too heavy for one tear | the hollow; light only from the water in the palm | **the tear lands: a crown splash; black water wells up in the palm, brims and spills off the fingers in strands**; at the end a drop hits the lens and **rings open across the glass** | **the signature: one huge drop into still water**, a hollow tail | no | cut (the tear leaves the top of frame) | escalation: one tear, and far more water than a tear |
| 3 | Mere · wide target | 900 (—) | low over the water, square-on, drifting right | Warden small at the left, `ult:mourn-pour` — hand out over the water, strands falling from it; target in the water, `anticipate` as the water rises | the mere in the hollow: willows, still black water, duckweed | **rings run across the whole mere from the Warden's strands to the target**; the water round the target darkens and climbs its legs | **motif** (four glass notes, falling); drips | **yes** — feels it, braces | in-folder: the rings on the glass become the rings on the mere | stakes and target; title |
| 4 | Hold · foreground hand (the quiet) | 600 (400) | dead still: the Warden's raised hand huge at the left, the target small across the water, framed in the curl | `ult:mourn-grasp` — the arm up, the open hand turning; the fingers begin to close (`--wdn-grasp`) | exposure down to near black; **the lantern goes out** | the strands off the hand slow and hang; nothing else moves | music ducked to 3%; one far drip; a knuckle creak | **yes**, far off, still | cut | anticipation by subtraction: the hand closing on it |
| 5 | Drown · impact | 760 (560) | low at the waterline on the target, Dutch 5° → 2°, easing out | target `hurt` after the stop, dragged down (shove) and tilted; the Warden a silhouette far off, fist shut | exposure spike, then the hollow darkening | **two-tone frame: the mere closed over the target in the shape of a hand**, spray off the knuckles; the fist squeezes and falls away in sheets, rings, the water left clinging and dragging | layered impact (water slap, sub, heave, bubbles, a glass chord); **150ms stop**; heavy shake | **yes** | cut on the two-tone frame | impact: the result on the frame; damage |
| 6 | Still · return | 740 (480) | battle camera | real Warden `ult:mourn-open` — the fist opens slowly, the head lifts | real battlefield; bars open | the target stands in a black pool, water hanging off it in heavy strands and dripping (Wet, Weak); every other enemy ringed and dripping (Wet), staggered | the motif's last note, drips, tail | on board | flash 80ms | release: who is soaked, and who is too heavy with it to strike |

FULL 4680ms, FAST 2440ms (52%). FAST drops the wide mere and keeps the tear,
the palm, the quiet (the target is in it) and the impact.

## Voice

"Everything you took… it kept." · "Hold it. We had to." · "Heavy, isn't it.
It doesn't dry."
