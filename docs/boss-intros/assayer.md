# The Assayer — boss intro

**The idea, in one sentence:** the Assayer weighs what you are worth in heat —
its floor is lined with moulds cast in the shapes of weapons it has melted
down, its gauge climbs into the red as it lifts the crucible, it pours one
more, and the only answer is a hard blow on the crucible while it is hot.

Only the Assayer could have it. Its drawing is a kiln on legs with a gauge for
an eye and a crucible held out on tongs; its objective is the pour and the
crack — it heats over rounds, pours down a row, and a big enough hit in the
round it pours cracks the crucible over it. So the entrance is appraisal and
its counter: what it has already melted, the reading climbing, the pour, and
the crack. It shares nothing with the Collector's shaft (no chains, no height)
or Dry Flood (no water, no spillway): a low hot hall around one furnace mouth.

## Rhythm

the heat (the board: a furnace door grinds open off-screen and its light pushes
in) → stakes (the assay floor: moulds shaped like a sword, a shield, an axe, a
helm, still glowing, the party standing among them) → **quiet** (the gauge
needle trembling up into the red; one drop of melt; music at 3%) → reveal (the
Assayer comes up to temperature, crucible lifted high) → **loudest** (the pour:
melt on brick, flash, hit-stop, the title) → the mechanic (a blade strikes the
glowing crucible and a crack runs through it, melt leaking; "Let's see what
you're worth.") → back to the board as the brick steams.

## Shots — FULL 5480ms, FAST 2960ms (54%)

| # | Shot | ms (FAST) | Camera | Boss | Space / light | Effects | Sound | Purpose |
|---|---|---|---|---|---|---|---|---|
| 0 | Heat · call | 560 (320) | battle camera | on the board | the board dims, bars close | `asi-kilnlight`: furnace light spills in from the right edge | `asi-door`; music ducked to 12% | something opens |
| 1 | Moulds · wide | 950 (—) | tracks right along the floor to the furnace mouth | — | `asi-furnace`, under-lit orange | `asi-moulds`: five weapon-shaped moulds, cooling; embers; the party in silhouette | `asi-floor`, the motif at 0.42 | stakes: what it melted |
| 2 | Gauge · extreme close-up | 700 (400) | on the dial, pushing in | — | nearly dark | `asi-gauge` needle climbs into the red, trembling; `asi-drip` at 0.62 | four `asi-tick`, `asi-drip`; music to 3% | the quiet: the reading |
| 3 | Lift · low angle | 760 (480) | from the floor, up | `intro:lift`: squat to upright, crucible high, gauge tipped up | melt under-light, hot rim | embers | `asi-bellows`, `boss-groan` | the reveal |
| 4 | Pour · impact | 1000 (720) | wide, settling | `intro:pour` (contact 0.38) | exposure up, melt back-light | `asi-stream` lip to floor; `asi-splash` pool and gobbets; cracks, sparks; 70ms flash, 90ms stop, shake | `asi-pour`; music back to 55% | the loudest; the title card |
| 5 | Crack · target | 950 (660) | on the crucible | its tongs reach in from the right | glowing | `asi-crucible`; `asi-blade` strikes at 0.36; the crack draws, melt leaks | `asi-crack`; the line | the counterplay, shown not told |
| 6 | Return | 560 (380) | battle camera | on the board | bars open | — | `asi-cool`; music back | back to the fight |

FAST drops the moulds and keeps the heat, the gauge, the lift, the pour, the
crack and the return. Reduced motion plays the generic still card with the
Assayer's accent and title, and no camera move, flash, shake or stop.

## Notes from the lab

- **The moulds were under the frame and unreadable.** Squashed to 0.42 and
  stroked heavily they read as bricks, and sat below the letterbox; they are
  0.62 high with a lighter rim now, in frame, and read as a sword, a shield, an
  axe and a helm.
- **The stream floated.** It was drawn from above the lip and wiped in; it now
  hangs from the tipped lip (measured off the capture) straight into the pool,
  with no wipe.
- **Levels** (`scripts/intro-levels.ts assayer`, peak / RMS over 3s): the pour
  1.15 / 0.099; the door 0.35; the crack 0.47; the motif 0.12; the gauge ticks
  0.02, the quietest thing in it.
- **Profile** (`scripts/profile-ultimate.ts`, 1920×1080 headless, measured back
  to back with the Collector on a machine at load 13–25): peak 1231 film nodes,
  no filtered elements, and frame times in the same band as the Collector's on
  the same run — headless software rendering under that load, so read them
  only as a comparison.
