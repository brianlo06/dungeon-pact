# The Notary — boss intro

**The idea, in one sentence:** the Notary witnesses every signature, and the
party has just walked into its record — a witness candle lights over each of
them, the walls are every seal it has ever pressed, a drop of wax falls on the
one empty line in its ledger, and when it presses, the wax it squeezes out
stands up as three seals that count down and are enforced.

Only the Notary could have it. Its drawing is a tall clerk with a deed for a
mitre, a wax lens, a stamp the size of an anvil and a stack of witnessed
ledgers; its objective is the wax seals — each sets in three rounds and is
enforced on the party unless the wax is broken first. So the entrance is
witnessing and sealing, and its mechanic beat is the seals' countdown.

It is kept clear of Small Print (the Broker's policy): nothing unfolds and no
signature writes itself. The names in the Notary's ledger are already signed
and sealed, and the party's line is blank; the party is *witnessed* (candles),
not made to sign.

## Rhythm

witnessed (the board: a desk bell, a candle lit over every hero) → stakes (the
Sealing Room: walls of pigeonholed deeds, each sealed red, going up out of the
light; the party small at the clerk's desk) → **quiet** (a ledger of sealed
names, one empty line; a drop of wax falls onto its empty seal; music at 3%) →
reveal (the Notary draws itself up, lens lit, stamp high) → **loudest** (the
press: wax squeezed out and flung, flash, hit-stop, the title) → the mechanic
(three seals stand, three notches each go out, and each is enforced on the
party; "So witnessed. So sealed.") → back as the candles gutter.

## Shots — FULL 5580ms, FAST 3020ms (54%)

| # | Shot | ms (FAST) | Camera | Boss | Space / light | Effects | Sound | Purpose |
|---|---|---|---|---|---|---|---|---|
| 0 | Witnessed · call | 560 (320) | battle camera | on the board | the board dims, bars close | `nti-candle` lit over each hero in turn | `nti-bell`; music ducked to 12% | the party is witnessed |
| 1 | Room · wide | 950 (—) | tilts down the walls of seals to the desk | — | `nti-room`, candlelit from below | motes; the party in silhouette | `nti-room`, the motif at 0.45 | stakes: every signature it keeps |
| 2 | Ledger · extreme close-up | 750 (420) | on the page, pushing to its foot | — | candlelight | `nti-ledger` (five sealed names, one empty line); `nti-drop` lands on the empty seal at 0.62 | `nti-drop`; music to 3% | the quiet: your line is next |
| 3 | Rise · low angle | 760 (480) | from the floor, up | `intro:rise`: stoop to full height, stamp raised | wax rim coming up | motes | `nti-rise`, `boss-groan` | the reveal |
| 4 | Press · impact | 1000 (720) | wide, settling | `intro:press` (contact 0.38) | exposure up, wax back-light | `nti-splat` pool, three gobs and flecks; dust, cracks; 70ms flash, 100ms stop, shake | `nti-press`; music back to 55% | the loudest; the title card |
| 5 | Seals · target | 1000 (700) | along the three seals | `intro:attest`: upright, lens on the party | wax rim | `nti-seals`: stand by 0.25, notches out at 0.38/0.52/0.66, lashes to the party at 0.72 | `nti-seals`; the line | the seals' fuse, shown not told |
| 6 | Return | 560 (380) | battle camera | on the board | bars open | — | `nti-gutter`; music back | back to the fight |

FAST drops the room and keeps the candles, the ledger, the rise, the press, the
seals and the return. Reduced motion plays the generic still card with the
Notary's accent and title, and no camera move, flash, shake or stop.

## Notes from the lab

- **The seals stood on the Notary.** Their box was offset the wrong way (a
  `translate` sign), putting the first seal off-frame and the last one inside
  the boss; they now stand in a row in front of it, larger and above the
  letterbox.
- **The seal's device read as a "no" sign.** The quill was drawn across the
  book; it stands beside the book now.
- **The walls were black at the top**, where the tilt starts. The pigeonholes
  are lit at no less than half now, so the stakes shot opens on seals.
- **The witness candles sat on the heroes' chests** and are lifted over their
  heads.
- **Levels** (`scripts/intro-levels.ts notary`, peak / RMS over 3s): the press
  1.15 / 0.092; the bell 0.43; the seals 0.22; the motif 0.13; the wax drop
  0.08, the quietest thing in it.
- **The walls were a thousand elements.** Drawn cell by cell the pigeonholes
  put the film at 4,871 nodes, four times any other intro; they are one SVG
  pattern now, dimmed towards the top by a gradient, and the film peaks at 756.
- **Profile** (`scripts/profile-ultimate.ts`, 1920×1080 headless, measured back
  to back with the Collector on a machine at load 13–25): peak 756 film nodes,
  no filtered elements, and frame times in the same band as the Collector's on
  the same run — headless software rendering under that load, so read them
  only as a comparison.
