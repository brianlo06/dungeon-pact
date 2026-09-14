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
