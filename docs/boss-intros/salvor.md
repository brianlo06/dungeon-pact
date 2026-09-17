# The Salvor — boss intro

**The idea, in one sentence:** the Salvor claims what the water took — a lamp
moves under the still water of the Wreck Pool, a hero's shield floats on it
until a hook takes it under, and then the Salvor stands up out of the pool with
the water sheeting off it, brings its gaff down, and soft plates climb out of
the water after it and harden on its back.

Only the Salvor could have it. Its drawing is a diver grown into its salvage —
brass helmet, a hump of hull plates, a drowned lantern, a gaff; its objective
is the soft plates it throws out, which harden onto it unless the party breaks
them first. So the entrance is claiming: a pool of taken things, one more thing
taken, the claimant rising, and the plates going home to its back.

It is kept clear of the three water films. Everything is seen from the air at
the surface: no camera under the water (Undertow), no water closing over a
hero (Mourning Water), and no wave (Breakwater) — the loudest beat is a column
thrown straight up.

## Rhythm

wet (the board: rings spread out from under the boss) → stakes (the Wreck Pool:
drowned vaults, a rowboat gone down by the stern, a lamp moving under the
water, the party on the ledge) → **quiet** (a floating shield, a bubble, and a
hook takes it under; music at 3%) → reveal (the Salvor stands up through the
surface, water sheeting off) → **loudest** (the gaff into the pool, a column of
water, flash, hit-stop, the title) → the mechanic (three soft plates climb out
of the water and shut on its hump; "What the water takes, I keep.") → back.

## Shots — FULL 5570ms, FAST 3000ms (54%)

| # | Shot | ms (FAST) | Camera | Boss | Space / light | Effects | Sound | Purpose |
|---|---|---|---|---|---|---|---|---|
| 0 | Wet · call | 560 (320) | battle camera | on the board | the board dims, bars close | `svi-rings` spreading from under the boss | `svi-drip`; music ducked to 12% | the floor is water |
| 1 | Pool · wide | 950 (—) | from the ledge out across the pool | — | `svi-pool`, sea-green | `svi-lamp` moving under the water; rings; the party in silhouette on the ledge | `svi-pool`, the motif at 0.45 | stakes: what the water took |
| 2 | Quiet · extreme close-up | 750 (420) | on the floating shield | — | dim, the lamp under it | `svi-shield`: bob, bubble at 0.4, hook up at 0.7, taken at 0.82; rings | `svi-bubble`, `svi-gulp`; music to 3% | the quiet: one more thing taken |
| 3 | Rise · low angle | 800 (500) | from the water, up | `intro:rise`: from under the surface to waist-deep, gaff drawn back | green under-light, sea rim | `svi-surface` in front; `svi-shed` streaks; rings | `svi-rise`, `boss-groan` | the reveal |
| 4 | Haul · impact | 1000 (720) | wide, settling | `intro:haul` (contact 0.38) | exposure up | `svi-column` thrown up and spray falling; rings; 70ms flash, 90ms stop, shake | `svi-haul`; music back to 55% | the loudest; the title card |
| 5 | Harden · target | 950 (660) | on the hump, pushing in | `intro:harden`: hunched, hump rocked back | sea rim | `svi-plates`: three plates out of the water, onto the hump, shut | `svi-plates`; the line | the plates, shown not told |
| 6 | Return | 560 (380) | battle camera | on the board | bars open | — | `svi-settle`; music back | back to the fight |

FAST drops the pool and keeps the wet floor, the quiet, the rise, the haul, the
plates and the return. Reduced motion plays the generic still card with the
Salvor's accent and title, and no camera move, flash, shake or stop.

## Notes from the lab

- **It stood on the water, not in it.** The actor's feet render about 80 world
  units above its `at` point, so a surface at y 820 only reached its boots. The
  surface sits at 745–765 now, the rise starts it fully under, and every shot
  after stands it waist-deep.
- **The shield shot had a box in it.** The first cut hid the hook's shaft
  behind a painted strip of water, which read as a teal rectangle; the shield
  and hook are clipped at the waterline instead.
- **The plates landed on the helmet** and are aimed at the hump now.
- **The pool was black.** Vaults, pillars, water and wreckage are all lifted a
  step, and a sunk rowboat and a shield rim were added so the stakes read; the
  quiet moved to open water away from the boat.
- **Levels** (`scripts/intro-levels.ts salvor`, peak / RMS over 3s): the haul
  1.19 / 0.070 (first cut 1.73, brought down); the drip-and-groan call 0.42;
  the plates 0.28; the motif 0.16; the bubble 0.05, the quietest thing in it.
