# A Good Hiding — Reaver · Ironhide

**The idea, in one sentence:** the Ironhide has stopped paying in blood, so it
beats its own chest in a tannery loft, spreads its arms and lets the enemy hit
it flush, and the blow does not burst off it but sinks in, pressed into the
hide like a mallet into leather, and comes back out through the cleaver as a
good hiding.

Only the Ironhide could have it. The Reaver's title is *Pain is just unspent
currency*; its Pact Charge comes from being hurt; its combat rig "takes the
hit, snarls, and leans straight back into it". The Ironhide path, *Stop
bleeding. Start absorbing.*, keeps the pain as fuel and stops inflicting it on
itself: Ironrend leaves it Barrier instead of costing it HP, and it is heavier
(+26 HP, +2 guard) and slower (−2 speed). The drawing supplies the body: the
one bare, scarred torso in the party, a brow that is a shelf of bone, a jaw
pushed forward, a mane, crossed leather straps. A hide is skin that has been
worked until it no longer tears. "A good hiding" is a beating.

## Gameplay

`ultimate-defs/rvr-ironhide.ts`, target an enemy, cost 100, speed 4:

1. the enemy's strength is spent on the hide: it is **Weak for two rounds**;
2. the blow is kept: the Ironhide gains **16 Barrier** (two rounds);
3. and given back: the Ironhide is **Empowered this round**, strikes that
   enemy for **12** at once (with the Reaver's power and Empowered, ~22
   before guard) and gains **2 Fury**.

| | Red Ledger (Reaver) | **A Good Hiding** (Ironhide) |
| --- | --- | --- |
| The price | loses 14 HP | **nothing**: Barrier gained instead (16) |
| The target | 40 through armour | **Weak for two rounds**; 12, Empowered, not through armour |
| The row | 12 to everyone else in it | **nothing** |
| The Reaver's own plan this round | as usual | **Empowered**: a Blood price or Frenzy lands 30% harder, and its HP cost comes out of the new Barrier |
| Fury | +3 | +2 |

It differs in what it does, not only in numbers. Red Ledger is a price and a
burst: the Reaver bleeds and the target and its row are cut. A Good Hiding is
an exchange of blows across two rounds. It disarms the one enemy that matters
(the whole party takes a third less from it this round and next), thickens the
Ironhide's hide, and hands its own action this round the force it kept. Its
team play is **Weak** on the enemy's main threat and **Empowered** on the
Ironhide: an Empowered blow on an enemy the party already opened (Drag them
down, Gatebreaker, Foreclosure, Seed of doubt) is both, and an Empowered Blood
price is paid out of Barrier, not blood. It guards nobody and wards nobody: it
is not the Aegis Knight's wall in front of the party, and it is not Eyespot's
misdirection of every enemy.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, with this
path's stub still `null` (the Ironhide on Red Ledger) and then with A Good
Hiding: see the table filled in below under *Measurements*.

Because the bot trains a Reaver into the Ironhide rarely in that sample, the
Ultimate was also weighed head to head: every Reaver playing one Ultimate's
effects whatever its path, on every 2nd Reaver composition, 10 seeds, 820 runs
each (`scratchpad` script, not committed). Reference rows are other authored
Ultimates played by the same Reavers.

| Every Reaver plays | 2p | 3p | 4p | all |
| --- | ---: | ---: | ---: | ---: |
| no Ultimates | 80% | 91% | 83% | 85% |
| Red Ledger | 70% | 94% | 87% | 88% |
| Debt of Thunder | 75% | 92% | 90% | 90% |
| Into the Din | 90% | 98% | 95% | 95% |
| Eyespot | 88% | 99% | 97% | 97% |
| Breakwater | 90% | 100% | 100% | 100% |
| first cut: interrupt, Weak 2, 20 Barrier, Regen 6×3, Empowered 2, 22 | 93% | 100% | 100% | 99% |
| **A Good Hiding** (Weak 2, 16 Barrier, Empowered this round, 12) | 88% | 99% | 97% | **97%** |

The first cut sat with Breakwater at the top. Measured one piece at a time,
Barrier, Regeneration and the damage each moved it a couple of points and Weak
on the main threat moved it five; together they compounded. The Regeneration,
the interrupt and the second round of Empowered were cut, and Barrier and
damage trimmed, which lands it with Eyespot, two points over Into the Din.

## Space, palette, sound

- **Space: the tannery's drying loft.** A long timber loft under a pitched
  roof. Rows of cured hides hang over poles, receding into the dark; the near
  wall is slatted louvres, and hard bars of pale daylight come through them
  and lie across the boards and the hides. Tanners' mallets and a scraping
  beam at the side. Not a hall, forge, vault, gate, pit, causeway, wood, ridge,
  mere, maze, page, meadow, theatre, snowfield, run, held fall, no-man's-land,
  mirror room or the ground under the floor. No sand, no stakes, no top light.
- **Palette:** timber dark `#140d09`, cured hide from tan `#b98a5c` to umber
  `#5a3a26`, limewash `#e6e0cf` (the slat light and the dust), and cold iron
  `#a9b7c1` (the accent) for the blow kept in the hide. No red is used as a
  mark or a light anywhere in the film.
- **Signature effect — the dent.** A blow drawn as what a mallet does to
  leather: a set of heavy, lumpy ink contour lines round the point it lands,
  closing *inward* until they vanish into it, and the skin there setting into
  a patch of fine iron hatching. It never bursts outward. The film shows it
  once going in (on the Ironhide's chest) and once driven in (on the target,
  under the cleaver); on the board after it is the iron hatch set over the
  Ironhide (its Barrier) and a slack, sagging dent over the enemy (Weak).
- **Lime dust:** a worked hide sheds pale dust when it is struck. It comes off
  the Ironhide's chest when it beats it, out of the skin when the blow lands,
  and out of the target under the cleaver. Dust, never blood.
- **The hides:** foreground hides hanging from poles swing when a blow lands,
  settle in the quiet, and all jump at the impact.
- **Motif (original):** a tanner's mallet on a low plucked string: G2, B♭2, G2,
  then down to E♭2 — hit, hit, hit, kept. Not a drum, not a horn, not a bell.
- **Signature sound: the swallow.** A blow's thud whose tail is sucked back
  into it: a reversed swell that stops dead, then nothing. The blow is heard
  to go in.
- **Impact, layered:** a crack (transient), a sub drop, a wet leather thwack
  and a cleaver's thock (body), and the loft's rumble with every hide rattling
  on its pole (tail).
- **The quiet:** music at 4%; the poles creak as the hides come to rest; one
  long breath out through the nose.

## Rhythm

identity (the fist beats the chest; dust comes off the hide; the arms open:
"Go on. Hit me.") → stakes (from behind the real enemy, its blow thrown at an
Ironhide standing open in the loft; title) → the blow taken (the face as it
lands: the head snaps back, the brow shelf comes down on it, the eyes never
close; the dent closes into the chest; then the grin) → **quiet** (the two of
them in profile between the hanging hides, swinging to rest, the cleaver lifted slowly behind the mane) →
**impact** (a drawn iron frame, the cleaver down on the target, the dent driven
into it, every hide jumping) → release (the real board: the Ironhide's hide set
with iron, the enemy slack and dented).

## Shots — FULL 4640ms, FAST 3000ms (65%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Ironhide `ult:hiding-call`: the cleaver's point set on the floor, the fist beats the chest twice, chin up | real battlefield darkens to timber brown, bars close | iron call aura; lime dust puffs off the real Reaver's chest (`hiding-dust`, anchored) | two chest thumps (`hiding-thump`), call bell; music ducks | on board | — | break the round: a hide being beaten |
| 1 | Dare · detail | 640 (400) | tight on the chest, fist and jaw, Dutch 7° → 4°, pushing in | `ult:hiding-dare` (`root: false`): one more blow of the fist on the chest, dust bursting off the scarred skin, then both arms opening wide, chin up, a grin | loft, low exposure, one bar of slat light across the chest (`hiding-slats`) | lime dust off the chest (`hiding-dust`); a hide swings across the lens at the end (`hiding-wipe`, out) | `hiding-dare`: the thump, a leather creak as the arms open; "Go on. Hit me." | no | black 60ms | identity: a hide that asks to be beaten |
| 2 | Swing · target | 900 (500) | from behind the real enemy, low, pushing past it at the Reaver | `ult:hiding-open`: arms wide, chest out, weight settling onto the heels to take it | loft lit: slat bars across the boards, hides receding | the wipe clears the lens (`hiding-wipe`, in); foreground hides hanging at the frame's edge (`hiding-hides`); slats | `hiding-motif`; the enemy's swing (`hiding-whoosh`) | **the real target** in the foreground, lit, throwing its `attack` at the Reaver | the hanging hide (in-folder wipe) | stakes: it is going to take it; title |
| 3 | Take · face close-up | 620 (420) | on the face and chest, dead level; a jolt on the blow, then still | `ult:hiding-take` (`root: false`): the head snaps back, the brow shelf comes down hard, the eyes stay open, the jaw sets; then the head comes forward and the brow lifts into a grin | loft, a slat bar across the eyes | **the dent closes inward into the chest, and the iron hatch sets there** (`hiding-dent`, in); dust out of the skin; the Barrier revealed | **the swallow** (`hiding-swallow`); 90ms stop; a small shake | no | cut, on the contact | the blow taken, and kept; Barrier revealed |
| 4 | Hang · profile two-shot (the quiet) | 540 (360) | eye level, between two hanging hides, dead still | `ult:hiding-raise`: the cleaver lifted slowly up behind the mane, fist forward | exposure down to 0.14, heavy vignette; both figures ink against the slat light | **hides swinging to rest** (`hiding-hides`, settle); dust hanging in the slat light (`motes`, still) | music at 4%; poles creak; one long breath out (`hiding-hush`) | **yes**, in silhouette across from it, off balance from its own blow | cut | anticipation: everything settles before it comes back |
| 5 | Hiding · impact | 820 (600) | medium profile, Dutch −4° → −1.5°, easing out | `ult:hiding-strike` (contact 0.04): the cleaver down over the mane with the whole body behind it; target `hurt`, shoved hard and tilted | loft blown up, settling | **70ms iron two-tone frame**, then the dent driven into the target at the blade (`hiding-dent`, out), lime dust blown off it, every hide jumping (`hiding-hides`, jump) | `hiding-impact` layered; **150ms stop**; heavy shake | **yes** | cut on the two-tone | impact: `$damage`; "Here. Have it back." |
| 6 | Kept · return | 720 (480) | battle camera | real Ironhide `ult:hiding-settle`: the blade let down, the neck rolled | real battlefield; bars open | the iron hatch set over the real Ironhide (`hiding-board`, kept); a slack, sagging dent over the real target (`hiding-board`, spent) | `hiding-settle`: the blade on the boards, the motif's last two notes; tail | on board | flash 80ms | release: the Barrier on the Ironhide, the enemy Weak |

## Framing

- **Boss** (`enemy=collector`): the swing pulls back so the boss stands whole
  in the foreground, its blow coming down on a smaller Reaver; the quiet puts
  the boss's silhouette at the frame's edge; the impact frames up at the boss's
  height with the Ironhide smaller, the dent at the boss's chest, a short shove.
- **Large** falls between.

## FAST

Keeps all seven shots, shorter. The swing is cut to 500ms (the title and the
enemy's blow are still in it); the take, the quiet and the impact keep their
shape.

## Voice

"Go on. Hit me." · "Here. Have it back." · "Didn't even bleed."

## Measurements

Quick balance (`scripts/ultimate-report.ts 4 --sample=6`, 324 runs, same
machine, back to back):

| Win rate | off | on, stub `null` (the Ironhide on Red Ledger) | **on, A Good Hiding** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 83% | **83%** |
| 3 players | 94% | 95% | **95%** |
| 4 players | 92% | 93% | **93%** |
| all | 91% | 93% | **93%** |

Nothing moves, because the bot trains a Reaver into the Ironhide rarely in
that sample (Reaver uses 2.48 per run and 266 charge earned, both runs). The
head-to-head table above is the real comparison.

**Performance** (dev build, `GPU=1 scripts/profile-ultimate.ts 5481 1920x1080
"hero=reaver&evo=rvr-ironhide"`, shared machine at load average ~13): film p50
16.7ms / p95 16.8ms, 2 frames over 34ms; the round after it p50 16.7 / p95
16.8, 1 over 34ms. Red Ledger straight before it on the same page: p50 16.7 /
p95 16.8, 2 over 34ms. Peak 915 nodes (837 SVG), 4 live effects, no filtered
elements. An earlier run while another session's suite was at load ~17 gave
the film p95 50ms against the round's 33.4ms; run again on a quieter machine,
both matched.

**Levels**, rendered offline in the browser (`OfflineAudioContext`, peak / RMS):
`hiding-impact` 1.15–1.25 / 0.081 (Red Ledger's `ledger-cut` 1.15 / 0.076,
Command Performance's impact 1.14 / 0.079); the motif 0.28 / 0.029 (perf-motif
0.65 / 0.029); the swallow 0.60 / 0.028, kept well under the impact; the quiet
0.03 / 0.001 (perf-hush 0.04). The first render had the swallow at 0.83, close
enough to the impact to steal it, and the whoosh inaudible at 0.04.

## Face and whole-body motion

The close-ups act with `face()`: `ult:hiding-dare` (brow lowered on the blow
of the fist, then lifted into a grin as the arms open) and `ult:hiding-take`
(the brow shelf dropped 1.8 units on the blow with the eyes held fully open
under it, easing up to a grin; knit never over 4°, and the browser test holds
the brow's tilt under 5°). `ult:hiding-strike` roars on the contact.

Root keys, authored for the shot each plays in: `ult:hiding-call` and
`ult:hiding-settle` (small, battlefield size: a bob on each blow of the fist,
a lean back); `ult:hiding-open` (a 5–8° lean back onto the heels, for the wide
at 400 units); `ult:hiding-raise` (sinking 0.014 and leaning back 3°, for the
quiet's two-shot); `ult:hiding-strike` (x 0.09–0.1, rotate 12–13°, squash 0.87,
scale 1.04, for the medium impact). **`root: false`** on both close-ups, the
dare and the take: their roots are a hair (≤ 7°, ≤ 0.03) but the face would
leave the frame with them. Nothing is rebuilt on `.cine-look`.

## Notes from the lab

- **Every camera and effect was placed from probes** (`.cine-actor
  [data-part]`, world units). The first dent sat on the jaw (the Reaver's head
  reaches down to y 841 in the take); it is at the chest, 560 above the ground
  point and 30 forward. The first blow landed the cleaver in the air in front
  of the hound (contact 256° pointed the blade at the floor, and the hound's
  near edge was at x 816 with the blade at 806); the Reaver was moved 40 in,
  the hound 40 back, and the contact angle brought up to 222° so the blade
  lies across the hound's neck on the frame after the accent.
- **The drawn frame was unreadable twice.** At exposure 0.95 the loft is dark
  umber, so the two-tone turned the whole background black and the hound
  vanished into it. A pale field is now laid behind the figures on the back
  layer (`hiding-glare`) so the frame is iron and every figure ink. Its first
  version was bars of slat light, which on the frame read as a cage; it is a
  field with two thin lumpy rings of the dent round the blow, and it sinks to
  18% within 170ms so the colour picture returns.
- **Arms wide** does not exist in a profile rig: the fist thrown up covered
  the face in every version (−104°, −128°). The opened stance is both arms
  swung *back* (fist +64°, cleaver +34°) with the chin up and the body leaning
  back, which reads as a chest offered.
- **Eyes open under the brow.** At brow 2.4 the shelf hides the eyes entirely
  and the Ironhide looked as if it flinched shut, which is the opposite of the
  point; the brow now drops 1.8 with the eyes at full opening.
- **A flash on the blow in the take washed the face out** on its first frame;
  it was removed. The stop, the jolt of the head and the dust carry it.
- **The iron** was first a hatch of parallel lines, which read as a speaker
  grille on the chest; it is now short scored strokes every which way over a
  grey, lumpy patch.
- **The quiet's silhouettes glowed gold**: the silhouette look's glow reads
  `--back-c`, so the shot sets `back: [LIME, 0]`, as Red Ledger found.
- **Films merged while this was authored:** Sunblind (the Gloomstalker's white
  roofs, low sun, arrow shadows) and Dry Flood (the Pyromancer's dry spillway
  and fire poured like water). Neither owns a tannery, hides, a dent, dust off
  a body, or a chest-beating; nothing here was changed for them.

## What the engine could not do, and what was built instead

- **The enemy's blow is film, not a result.** The Ultimate resolves before the
  round, and no effect lets an enemy strike during it, so the target's
  `attack` in the swing and the blow taken in the close-up show what Weak and
  Barrier mean rather than a beat. The Barrier's `ward` beat is revealed on the
  take; Weak and Empowered log no beat at all, so the board's status chips
  carry them, with `hiding-board` over each unit.
- **The occlusion object is always a cape**, so the hanging hide swung across
  the lens is an in-folder screen effect straddling the cut (`hiding-wipe`,
  out at the end of the dare, in at the start of the swing), and the swing's
  transition is left a `cut`. The engine would need an `occlusion` whose object
  is an effect kind.
- **A self-targeted status is never shown on the target's copy**, and Weak
  has no presentation in combat, so the enemy's spent strength is drawn as a
  slack, sagging dent on the board, and the real enemy plays `hurt` there
  (battlefield clips reach targets).
- **A clip plays at one rate in FULL and FAST**, so the dare's arms are open
  by 372ms and the take's grin lands by 392ms, inside FAST's 400 and 420, and
  both hold in FULL.
- **Enemies take no `ult:` poses**, so the enemy is off balance in the quiet by
  a tilt on its actor cue, not a pose.

## Where it is weakest

- **The boss impact.** Against the Collector the Ironhide is a third of the
  boss's height and the blade lands in its robe beside the key; it reads as a
  blow, not as a beating. A wider two-shot or a lower camera looking up at the
  boss would sell it better.
- **The hides in the loft's background** read as ragged brown drapery at the
  top of the frame more than as cured hides; the foreground hides (the wipe,
  the quiet's pair) read as hides.
- **The opened stance** is a lean back with both arms behind, not arms flung
  wide; the rig cannot do wider in profile.
- **The board after** is small: the iron over the Ironhide and the sagging dent
  over the enemy are legible in a still, and in play they sit beside the
  Barrier and Weak chips that say the same thing louder.
