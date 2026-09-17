# The Miser — boss intro

**The idea, in one sentence:** the Miser hears the party's purse before it
sees them — it has been down here counting for years, one coin rolling in the
dark wakes the heap, it heaves itself up out of its hoard and slaps its hand
down on it, and the gold the party kept pours off them onto its back, where it
sets into a shell.

Only the Miser could have it. Its drawing is a toad-like hoarder sunk in a
heap, its coin shawl showing the treasury; its objective is the gold shield —
it wears whatever gold the pact still holds. So the entrance is *keeping*:
walls of tallies, heaps that turn out to be the boss, and the party's own gold
becoming its armour. It shares nothing with Foreclosure (the Broker's scales
and shelves: no weighing, nothing struck that rings) or Compound Interest (no
coin crust growing on a hero — the gold leaves the party and lands on the boss).

## Rhythm

the purse (the board: every hero's coins glint and lift) → stakes (the pit:
walls scratched with years of tallies, a fifth struck through, the party small
in lamplight) → **quiet** (one coin rolls in the dark and falls flat; two eyes
open in the heap; music at 3%) → reveal (the heap stands up, coins pouring off
it, hand overhead) → **loudest** (the hand flat on the hoard: flash, hit-stop,
coins thrown up, the title) → the mechanic (the party's gold streams onto its
back and sets into a shell of coin-scales; "Keep your gold. I'll wear it.") →
back to the board.

## Shots — FULL 5470ms, FAST 2980ms (54%)

| # | Shot | ms (FAST) | Camera | Boss | Space / light | Effects | Sound | Purpose |
|---|---|---|---|---|---|---|---|---|
| 0 | Purse · call | 560 (320) | battle camera | on the board | the board dims, bars close | `msr-purse` on every hero: coins lift off and drift toward the boss | `msr-purse`; music ducked to 12% | it heard them |
| 1 | Tally · wide | 900 (—) | tilts down from the tallies to the heaps | — | `msr-pit`, one hanging lamp | `msr-tally`: four marks and a fifth struck through; the party in silhouette | five `msr-scratch`, the motif at 0.4 | stakes: years of keeping |
| 2 | Quiet · extreme close-up | 700 (400) | the foot of a heap, pushing in | — | nearly dark | `msr-coin` rolls in, wobbles flat at 0.6; `msr-eye` opens at 0.68 | `msr-roll`; music to 3% | the quiet: the heap is awake |
| 3 | Rise · low angle | 800 (500) | from the floor, up at it | `intro:rise`: sunk and squashed, heaves up, hand overhead | lamp under-light, gold rim coming up | `msr-pour`: coins pouring off | `msr-heave`, `boss-groan` | the reveal |
| 4 | Slam · impact | 1000 (720) | wide, settling | `intro:slam` (contact 0.35) | exposure up, gold back-light | `msr-burst` coins thrown up and a ring; dust; 70ms flash, 90ms stop, shake | `msr-slam`; music back to 55% | the loudest; the title card |
| 5 | Shell · target | 950 (660) | on the boss, pushing in | `intro:claim`: hand spread back, croaking | gold rim | `msr-stream` from the party's side onto its back; `msr-shell` sets over the shawl | `msr-stream`; the line | the gold shield, shown not told |
| 6 | Return | 560 (380) | battle camera | on the board | bars open | — | `msr-purse`; music back | back to the fight |

FAST drops the tally and keeps the purse, the quiet, the reveal, the slam, the
shell and the return. Reduced motion plays the generic still card with the
Miser's accent and title, and no camera move, flash, shake or stop.

## Notes from the lab

- **The intro's classes restyled the drawing's.** The first cut named the
  rolling coin `msr-coin-face`, which the Miser's own drawing already uses (its
  treasury coins, `creatures-debt.css`), so the coin rendered in the drawing's
  unlit brown. Effect ids keep `msr-`; every class and gradient id in the intro
  is `mbi-`, and the browser spec checks that nothing in the film outside the
  actor carries an `msr-` class.
- **The party stood below the frame** in the tally shot; the tilt ends lower and
  the silhouettes stand at y 930, in front of the heaps.
- **The eye read as a gold ring.** It is two lidded toad's eyes with a flat bar
  of a pupil now, sunk in the heap.
- **The shell sat over its face.** It is smaller and set over the shawl.
- **Levels**, rendered offline with `scripts/intro-levels.ts miser` (peak /
  RMS over 3s): the slam 1.20 / 0.087 (the Collector's 1.30); the motif 0.14;
  the stream 0.25; the rolling coin 0.04, the quietest thing in it.
- **Profile** (`scripts/profile-ultimate.ts`, 1920×1080 headless, measured back
  to back with the Collector on a machine at load 13–25): peak 1269 film nodes,
  no filtered elements, and frame times in the same band as the Collector's on
  the same run — headless software rendering under that load, so read them
  only as a comparison.
