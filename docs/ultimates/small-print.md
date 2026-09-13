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
| 0 | Call | 400 (240) | battle camera | real Broker `ult:print-produce` — the ledger hand goes into the coat and comes out with a fat folded policy | real battlefield sinks to umber, bars close | carbon call aura; the folded policy flicks open a fold at the Broker's hand (`print-slip`, anchored) | call; paper drawn out and riffled (`print-rustle`); music ducks | on board | — | break the round: the Broker has paperwork |
| 1 | Riffle · detail | 600 (380) | low, up past the policy at the face, Dutch 8° → 5°, pushing in | `ult:print-riffle` — the policy held up to the lens in the ledger hand, the thumb riffling; head tipped down over it, brows knit amiably, a salesman's purse of the mouth | the page, near dark; cream bounce light from below | the fan-fold wad, its folds flicking past the thumb one by one, each with a carbon border (`print-wad`) | the riffle, speeding up (`print-riffle`) | no | black 70ms | identity: the underwriter and its very long form |
| 2 | Policy · wide on the party | 1000 (520) | wide and level on the page, a slow truck along the line | `ult:print-cast` — the Broker at the left edge lets the strip go out of its hand; allies `ult:print-look`, looking down at the fold landing at their feet, one after another | the page, lit | the strip flips open along the page fold over fold (`print-policy`), a carbon signature line writing itself on the fold at each ally's feet | the flaps running out (`print-unfold`); **the motif** on the last three entries | **the real party**, gear and all | the first fold flips over the lens (`print-turn`, in-folder occlusion) | stakes and escalation: everyone is on it; title |
| 3 | Small print · the spectacles | 620 (400) | extreme close-up on both lenses and the brows, dead level, still | `ult:print-read` (root off) — eyes run along the lines; brows come down onto the rims and knit; eyes narrow; the mouth tightens, then one corner settles | the page, near black; cream under-light on the lenses | lines of small print scrolling across both lenses (`print-lens`); the page's edge in the foreground (`print-margin`) | music to 4%; the watch ticking (`print-tick`, `-fast`); a breath | no | cut | the quiet: the catch, read and accepted |
| 4 | Covered · impact | 780 (560) | low on the page along the party line, Dutch −6° → −2°, easing out | `ult:print-snap` (contact 0.05) — up on the toes, the ledger arm cracking the strip out and up, a shout; allies brace (`block`) | exposure spike to cream, then settling; carbon rim | **carbon-and-ink two-tone** (70ms); the crease across the frame (`print-crack`); every fold stands up into a screen in front of its ally, the Broker's first (`print-screens`); paper slivers | layered crease impact (`print-impact`) + room; **140ms stop**, heavy shake | **the real party**, covered | cut on the two-tone | impact: everyone covered at once; wards revealed; "Covered! Every last one of you!" |
| 5 | Cover · return | 820 (520) | battle camera | real Broker `ult:print-settle` — pats the policy into its coat and straightens | real battlefield; bars open | a paper screen stands up at the enemy-facing side of every real party member, staggered (`print-cover`); the bill flies into the treasury (`print-bill`) | a card thump per ally, rising (`print-stand`); tail | on board | flash 70ms | release: where the cover stands, and what it cost |

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
