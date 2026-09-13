# The Small Print — Broker · Assurer

**The idea, in one sentence:** the Assurer writes one policy long enough for
the whole party — it unfolds out of the Broker's hand fold after fold, a fold
at every ally's feet — reads the small print once through its spectacles, and
snaps the whole thing taut so every fold stands up at once as a paper screen
in front of the one it covers.

Only the Assurer could have it. The path's title is the plot: *Everyone is
covered. Read the small print later.* Its kit is Indemnity, cover bought for a
whole row with the treasury's money, where the Broker's Underwrite covered one.
The drawing supplies the reader: the spectacles and the brows under the brim,
and the ledger hand the policy comes out of. Insurance is paper — a promise
written down, in a form long enough to hide a catch at the bottom — so the film
is drawn in paper: folds, creases, a certificate's engraved border, and a line
of script too small to read.

## Gameplay purpose

`ultimate-defs/brk-assurer.ts`, target self, cost 100, speed 12:

| | Foreclosure (base) | **The Small Print** (Assurer) |
| --- | --- | --- |
| The treasury | **+30 gold** | **−40 gold**, the premium (a short treasury pays what it holds) |
| An enemy | Barrier seized, 26, Vulnerable | **nothing** |
| Every ally, the Broker too | +8 Barrier (2 rounds) | **+30 Barrier, until the end of this round**; any Mark served on them struck out |
| Credit | — | +2, the commission |

It differs in what it does, not in numbers: Foreclosure is a blow that pays;
the Small Print is a purchase that protects. Nothing is struck and nothing is
earned. The catch is real and it is the play. An Ultimate resolves before
anyone acts, so the cover holds against everything the enemy does this round,
and lapses when the round ends. It is bought for the round the party can see
coming: a windup on the board (the Collector's *Close the account*, a Furnace
blast, a Crushing levy) is answered either by breaking it or by insuring
against it, and that is a choice the party makes together. With a Vanguard,
a protector holding 30 Barrier takes what it intercepts for nothing, and every
point blocked is Pact Charge for it. The premium comes out of the purse the
shop, the tuition and the revival draw on, and out of the hoard the Miser
shields itself with; the Miser's *Audit the shielded* strips the cover back
off. The Mark clause voids the Collector's *Final notice*, so *Enforce the
notice* finds nothing to enforce.

**When the party cannot pay.** The effect pipeline spends
`Math.min(treasury, 40)`, and an Ultimate, unlike an ability, is not checked
for price, so the Small Print is never refused: a short treasury is emptied and
the cover is paid in full. That is written into the description.

Quick balance (`scripts/ultimate-report.ts 4 --sample=6`, 324 runs, same
machine), against the same sample with this path still on Foreclosure:

| Win rate | off | on, Foreclosure | **on, The Small Print** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 83% | 83% |
| 3 players | 94% | 95% | 95% |
| 4 players | 92% | 94% | 93% |
| all | 91% | 93% | **93%** |

"all" does not move; duos do not move; quartets lose a point. Broker uses per
run 2.33 before, 2.36 after (charge earned 258 / 261).

Tests: `tests/ultimates-small-print.test.ts` (4): it replaces Foreclosure,
touches no enemy and only spends; it takes 40 gold, covers all four with 30,
strikes out a Mark and gives 2 Credit; a treasury of 15 is emptied and the
Ultimate still resolves; the cover takes the round's hits and is gone when the
round ends, and the film is handed a ward for every member of the party and no
target.

## Space, palette, sound

- **Space: the policy itself.** The film stands the party on the page. A cream
  sheet runs away to a straight far edge with the umber dark of ink beyond it;
  ruled lines recede to that edge, columns of clauses in tiny ink script, a
  carbon-blue margin rule, an old fold creased across it, and along the near
  edge, the small print — a band of script too fine to read. No hall, forge,
  storm, wood, cutaway, vault, ridge, pit, mirror room, causeway, labyrinth or
  no-man's-land: a document.
- **Palette:** paper cream `#efe3c6`, iron-gall ink `#1d160f`, the umber dark
  `#120d09`, and one colour, **carbon blue** (`#8b95ff`, the accent), for the
  cover — the copy each ally keeps. No brass and no green: the counting house
  is the base film's. The two-tone frame is carbon and ink.
- **Signature effect — the fold.** Everything the policy does, it does by
  folding: a fat fan-fold riffled under the thumb, a strip that flips open along
  the ground fold over fold like a row of cards falling, a crease that snaps
  taut, and a fold that stands up into a screen — three cream panels with an
  engraved carbon-blue border (a certificate's guilloche) and ruled script.
  The drawn impact is the crease itself: a hard zigzag of light across the
  frame as every fold stands at once, with paper slivers thrown off it.
- **Motif (original):** plucked strings, each note with a nib-click on the
  attack: F4, A4, C5 rising — covered, covered, covered — and a fourth note, a
  B4 that does not resolve. The sly one. Not coins, not a horn, not a music
  box, not a drum.
- **Signature sound:** the crease — a stiff sheet snapped taut and folded in one
  movement: a dry crack with a card-stock *thock* under it.
- **Impact, layered:** the crack (transient), a sub drop, a run of card panels
  slapping upright one after another with a low felt thump (body), and a paper
  flutter and a carbon-blue chord ringing out (tail).
- **The quiet:** music to 4%; the Broker's pocket watch ticking on its chain,
  four ticks — the policy's term — and a breath through the nose.

## Rhythm

identity (a thumb riffles a fat folded policy: it is very long; "Sign here,
and here, and here") → stakes and escalation (the policy opens over the lens
and runs out along the whole real party, a fold landing at every ally's feet,
each looking down at it; title) → **quiet** (the spectacles: the small print
scrolls across the lenses while the eyes read it, the brows come down onto the
rims and knit, and the mouth decides it is fine) → **impact** (the snap: a
carbon-and-ink frame, the crease across it, and every fold standing up in front
of the one it covers) → release (the real board: a paper screen standing at
every real ally, and the bill tucked into the treasury).

The quiet is directly before the loudest; the tightest, stillest frame (two
lenses) cuts to the widest, loudest one.

## Leaving room for the other paths

Foreclosure owns the weighing, the coin and the repossession; it never
insures or signs. This film owns the policy and the cover, and never buys,
lends, bids or counts interest, so the Magnate keeps the auction and the
Usurer the loan.

## Shots — FULL 4220ms, FAST 2620ms (62%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Broker `ult:print-produce` — the ledger hand goes into the coat and comes out with a fat folded policy | real battlefield sinks to umber, bars close | carbon call aura; the folded policy flicks open a fold at the Broker's hand (`print-slip`, anchored) | call; paper drawn out and flicked (`print-rustle`); music ducks | on board | — | break the round: the Broker has paperwork |
| 1 | Riffle · detail | 600 (380) | on the face and the policy under it, Dutch 8° → 5°, pushing in | `ult:print-riffle` — the policy held at the chest in the ledger hand, trembling as the thumb runs over it; head tipped down to the lens, brows knit kindly, a salesman's purse of the mouth; the balance let down out of frame | the page, near dark; cream bounce light from below | the fan-fold block, its folds flicked open and slapping back in two waves (`print-wad`); at the end a sheet turns over the lens (`print-turn` out) | the riffle, speeding up (`print-riffle`); the turn (`print-turn`) | no | black 110ms (hides the copy blending into the riffle) | identity: the underwriter and its very long form |
| 2 | Policy · wide on the party | 1000 (520) | wide and level on the page, a slow truck right | `ult:print-cast` — the Broker at the left lets the policy go out of its hand and stands back pleased; allies `ult:print-look` — lean over and look down at it, then settle back unconvinced | the page, lit | the sheet turns off the lens (`print-turn` in); the policy opens behind the whole party fold after fold, a leaf behind each and on past the last of them, a carbon signature writing itself on each fold (`print-policy`) | the folds running out (`print-unfold`); **the motif** | **the real party**, gear and all | the sheet across the lens (in-folder occlusion) | stakes and escalation: everyone is on it; title |
| 3 | Small print · the spectacles | 620 (400) | extreme close-up: both lenses, the brows and the mouth, dead level, still | `ult:print-read` (`root: false`) — eyes run along a line and back; brows come down onto the rims and knit; eyes to slits; lips press; the mouth settles into a small smile | the page, near black; cream under-light | lines of small print scrolling up across both lenses (`print-lens`); the page's edge with its small print just above the letterbox (`print-margin`) | music to 4%; the watch ticking (`print-tick`, `-fast`); a breath through the nose | no | cut | the quiet: the catch, read and accepted |
| 4 | Covered · impact | 780 (560) | low on the page along the party line, which recedes up the frame; Dutch −8° → −3°, easing out | `ult:print-snap` (contact 0.05) — out of a crouch up onto the toes, the ledger arm cracked forward, a shout; the balance thrown down out of the way; allies brace (`block`) | exposure 1 → 0.88; carbon back light and rim | **carbon-and-ink two-tone** (70ms); the crease zig-zags across the frame and throws paper slivers (`print-crack`); every screen stands on the drawn frame itself, the Broker's too, and the crease runs taut from the Broker's hand along the top of every one and out of frame; after the stop each springs past its height and settles, from the Broker outward (`print-screens`) | layered crease impact (`print-impact`) + room; **140ms stop**, heavy shake | **the real party**, covered | cut on the two-tone | impact: everyone covered at once; wards revealed; "Covered! Every last one of you!" |
| 5 | Cover · return | 820 (520) | battle camera | real Broker `ult:print-settle` — pats the policy into its coat and straightens | real battlefield; bars open | a paper screen stands up beside every real party member, staggered (`print-cover`); the premium's bill flies from the Broker into the treasury (`print-bill`) | a card thump per ally, rising (`print-stand`); tail | on board | flash 70ms | release: where the cover stands, and what it cost; "Cover lapses when the round ends. It's all in the small print." |

## Notes from the lab

- **The result is on the drawn frame.** The first cut raised the screens after
  the contact, so the hit-stop held a frame with nothing standing: every screen
  is now full height on the two-tone frame, and the spring and the stagger
  happen after the stop. A flash after the two-tone washed the held frame out
  and was removed.
- **The taut crease** from the Broker's hand along the screens' tops is what
  ties the gesture to the result; without it the snap read as the Broker
  presenting something.
- **The policy is longer than the party.** In a duo the folds run on past the
  one ally to the edge of the frame, and at the impact the crease runs out of
  the frame: the joke, and no empty half of a picture.
- **The balance stays down.** The Broker always holds its balance; this film
  lets it down out of the picture in every Cinematic shot, because the
  weighing is Foreclosure's.
- **The quiet's mouth.** The page's edge first sat over the mouth, and then
  under the letterbox; it now sits just above the bar with the camera low
  enough that the smile is the last thing in the frame.
- **Sounds were rendered offline and measured** (peaks): the impact 1.25–1.29
  (Foreclosure's 1.44, the Anthem's chord 1.23, The Hundredth Mark's 1.21);
  the motif 0.15 (Foreclosure's 0.16); the quiet's ticks 0.06. The clicks are
  tones, not noise: short high-passed noise bursts peaked anywhere from 0.1 to
  0.85 from one render to the next.

## Whole-body motion

Root keys, authored for the size each clip plays at: `ult:print-snap` (a
crouch, squash 1.1, to up on the toes, y −0.05, squash 0.86, scale 1.05, lean
6°), `ult:print-cast` (a throw, x 0.03, lean −3° → 5°), `ult:print-riffle`
(lean ≤ 3.6°), and on the board `ult:print-produce` and `ult:print-settle`.
`ult:print-read` plays with `root: false`, and holds its root flat anyway.
The allies' `ult:print-look` moves parts only. Nothing moves `.cine-look`.

## What the engine could not do, and what was built instead

- **An occlusion with another object.** The occluder is always the cape, so
  the sheet turning over the lens is two screen-layer cues of `print-turn`
  straddling a plain cut (`out` at the end of the riffle, `in` at the start of
  the policy). The engine would need `transition.object` to render a named
  in-folder effect.
- **Staggered reactions.** An actor cue's clips land on every ally at once, so
  the allies all lean over the policy together rather than as it reaches each,
  and the screens' settle after the stop is staggered in `print-screens`. The
  engine would need `react[].stagger` (or per-slot delay on `clipAt`).
- **The catch has no beat.** A `ward` beat carries the Barrier's amount but not
  its duration, so the film cannot draw "until the end of the round" on each
  ally from the result; the catch is read in the quiet and said in the
  after-line. The engine would need the status duration on the beat.
- **Gold has no beat.** The premium is the bill flying into the treasury,
  timed by the return shot rather than revealed, and it flies whether the
  treasury paid 40 or was short.
- **Stripping a status logs no beat.** The Mark struck off an ally is not
  shown: the film cannot know who was Marked.
- **A self-targeted Ultimate always frames `normal`.** Nothing here needs a
  boss framing, since no enemy is cast; the boss room changes only the board.
- **A clip plays at one rate in FULL and FAST.** The read clip's acting is
  timed to FAST's 400ms and holds in FULL; the ticks have a `-fast` cue.

### Framing

Self-targeted, so the film always frames `normal` (the engine frames a
self-targeted Ultimate `normal`); a boss in the room changes nothing.

### Party sizes

The strip and the screens are laid out from where the stage places the allies
(`ctx.actor`), so a duo has one fold and one screen besides the Broker's, and a
quartet three.

### FAST

Keeps every shot, shorter. A clip plays at one rate in both cuts, so the read
clip's action is inside FAST's 400ms and it holds in FULL; the tick has a
`-fast` cue.

### Voice

"Gather round, all of you. Sign here, and here, and here." · "Covered! Every
last one of you!" · "Cover lapses when the round ends. It's all in the small
print."
