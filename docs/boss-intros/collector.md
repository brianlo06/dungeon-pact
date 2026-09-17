# The Collector — boss intro

**The idea, in one sentence:** every chain in the Collector's Hoard ends in a
lock, and the Collector holds the key — the dark overhead is full of what it
has taken, an empty lock swings open for whatever the party carries, and when
the key comes down every chain snaps taut and the Strongbox is set out for the
first of it.

Only the Collector could have it. Its drawing is a creditor weighed down by
what it has taken — a crown of keys, an outboard key for a weapon, a ledger and
seals on chains — and its objective is the Strongbox: it seizes a hero's
dearest gear into a box the party can break open. So the entrance is
possession: a shaft of taken things on chains, one empty lock waiting, the key
that owns every lock, and the box that takes the first thing. It shares nothing
with Foreclosure (the Broker's shelved counting house, the balance, the coin):
no shelves, no weighing, nothing gold that rings.

## Rhythm

door shut (the board: a curtain of chain drops behind the party) → stakes (up
the shaft at the hoard, the party small beneath it) → **quiet** (one empty
padlock ticking, its shackle dropping open; two lamps open in the dark; music
at 3%) → reveal (the Collector drawn up out of that dark, key lifted) →
**loudest** (the key on the grate: flash, hit-stop, every chain snapping taut,
the title struck) → the mechanic (the Strongbox set down; a chain out of it
hauls a hero's blade back in; "Everything you carry is collateral.") → back to
the board as the chains draw up and the boss theme comes up.

## Shots — FULL 5440ms, FAST 2920ms (54%)

| # | Shot | ms (FAST) | Camera | Boss | Space / light | Effects | Sound | Purpose |
|---|---|---|---|---|---|---|---|---|
| 0 | Shut · call | 560 (320) | battle camera on the boss | on the board | the board dims, bars close | `col-curtain`: 18 strands of chain drop shut over the left third, a bar across the top | `col-shut`; music ducked to 12% | the chamber sealed |
| 1 | Hoard · wide | 1000 (—) | tilts up the shaft from the party to the hoard | — | `col-hoard`, lit from the furnace below | `col-hanging` far and near: cages, shields with padlocks, a crown, swords, boxes, swaying; the party in silhouette | `col-hoard`, the motif at 0.42 | stakes: what it takes, over your heads |
| 2 | Quiet · extreme close-up | 650 (380) | one padlock, pushing in | — | nearly dark | `col-lock` swinging, shackle drops open at 0.52; `col-eyes` open at 0.68 | two ticks, `col-shackle`; music to 3% | the quiet: a lock waiting for yours |
| 3 | Loom · low angle | 720 (460) | from the grate, up at it | `intro:loom`: out of a crouch to full height, key lifted | ember under-light, gold rim coming up | far hoard; embers | `boss-groan` | the reveal |
| 4 | Strike · impact | 1000 (720) | wide, settling | `intro:strike` (contact 0.4) | exposure up, gold back-light | `col-taut` every chain straight to the strike; cracks, sparks, dust; 70ms flash, 90ms stop, shake | `col-slam`; music back to 55% | the loudest; the title card |
| 5 | Strongbox · target | 950 (660) | on the box, pushing in | `intro:appraise`: key levelled at the party, ledger lifted | gold rim | `col-strongbox` lands and opens; `col-seize` whips out and hauls a blade in | `col-lid`, `col-seize`; the line | the seizure, shown not told |
| 6 | Return | 560 (380) | battle camera | on the board | bars open | — | `col-draw`; music back | back to the fight |

Boss framing: every boss is `boss-large`, so intros are authored at the boss's
own scale; there is no smaller framing to fall back to.

FAST drops the hoard and keeps the door, the quiet, the reveal, the strike, the
Strongbox and the return.

Reduced motion plays the generic still card with the Collector's accent and
title, and no camera move, flash, shake or stop.

## Notes from the lab

- **The hoard was black.** The first cut drew the hanging things in the shaft's
  own darks and hung them above the camera; the stakes shot showed three
  silhouettes and nothing over them. The things are lit from below now (every
  chain catches the furnace on its near edge), hung into frame, and the camera
  tilts from the party up to them.
- **The quiet's lamps were behind the letterbox.** Placed above the lock at
  world y 200, they sat under the top bar at that zoom; they open to the lock's
  right at y 300.
- **The blade was taken off-screen.** At a reach of 900 the chain caught the
  blade past the frame's left edge; at 420 the catch is in the shot.
- **The title's strike spacing crossed the boss in FAST** and starts tighter.
- **Levels**, rendered offline (peak / RMS): the slam 1.39 / 0.110 (the films'
  impacts 1.43–1.47); the motif 0.14 (Mourning Water's 0.17); the ticks 0.02,
  the quietest thing in it.
- **Profile** (1920×1080, real GPU, dev build, load 12): film p50 16.7ms /
  p95 16.8–33.3ms over two runs; RecalcStyle 182–191ms/s, in the band the
  Ultimate films measure.
