# Elegy for the Standing — Herald · Dirgesinger

**The idea, in one sentence:** the Dirgesinger sings an enemy's funeral while
it is still standing, and sings it so well that the enemy's own shadow
believes it — the shadow stands up, lies down in the grave dug for it, and on
the last note the earth closes over the shadow and leaves the enemy on its
feet with nothing under it.

Only the Dirgesinger could have it. The Herald's title is *You are worth more
than you think*: it is the one who tells people what they are worth. The
Dirgesinger says it in the past tense. The path's title is the plot, *A funeral
song, sung early*, and its kit is **Dirge**, the song that takes a row's
afflictions away and turns the grief into resolve. The drawing supplies the
rite. A standard-bearer's salute to the dead is the colours dipped, and the
Herald's banner dips; its flag is lilac, which is the colour of half-mourning;
and its laurel, a victory crown, is what is laid on a grave — one leaf of it
comes loose in the close-up, lies on the shadow in the quiet, and a wreath of
it is on the grave at the end. The song itself is never drawn: no ribbon, no
ring, no stroke of sound. It is seen in what it does to the one it is for.

## Gameplay

`ultimate-defs/hrl-dirgesinger.ts`, target an enemy, cost 100, **speed 22**:

| | Anthem of the Unpaid (base) | Into the Din (Warcaller) | **Elegy for the Standing** (Dirgesinger) |
| --- | --- | --- | --- |
| Aimed at | self: the party | an enemy, struck | **an enemy, mourned** |
| The enemy | nothing | 24, Vulnerable 2 rounds | **Vulnerable 3 rounds, laid first; then 12 through armour onto it (×1.25)** |
| The party | Empowered 2 rounds, 8 Barrier, Weak and Vulnerable cleared | Weak cleared, Empowered this round | **nothing to swing with**: Burn, Poison, Weak and Vulnerable cleared, the singer and the downed included |
| The Herald | — | Empowered 3 rounds, +2 Verse | +2 Verse |
| Order | speed 18 | speed 16 | **speed 22: sung early**, before every other Ultimate queued that round |

It differs in what it does, not only in numbers. Both Herald Ultimates so far
make the party stronger. This one makes the *enemy* the thing the party is
stronger against: the Herald's "your blows land harder" is moved off the
singers and onto the one being sung for, for three rounds, a round longer than
any other Vulnerable in the game. The party itself gets only the Dirge, for
everyone at once: every affliction the dungeon put on it is buried in the same
grave. Team play: at speed 22 it resolves before any other Ultimate queued
that round, so an ally's Ultimate the same round lands on Vulnerable (Red
Ledger's 40, Gatebreaker, Debt of Thunder's bolt and its Chain Shock); every
Exploit and Chain Shock on the mourned for three rounds is a quarter heavier;
and the cleanse takes a hazard chamber's Burn, a Pyromancer's fire and a
sniper's Weak off the whole party in one action.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, with the
path's stub still `null` (the Dirgesinger on the Anthem) and then with Elegy
for the Standing as shipped:

| Win rate | off | on, stub (Anthem) | **on, Elegy** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 79% | **83%** |
| 3 players | 94% | 95% | **95%** |
| 4 players | 92% | 93% | **94%** |
| all | 91% | 93% | **93%** |

"all" does not move. Herald uses per run 2.79 → 2.78, charge 293 → 292: the
Cipher is the deepest mentor and the bot trains a Herald into the Dirgesinger
almost never in that sample, so the duo line (about 40 runs) is one or two
runs of noise. So it was weighed head to head, as Eyespot, False Footing and
Sunblind were: every Herald plays one Ultimate's effects whatever its path,
on every 2nd composition with a Herald in it, 6 seeds (492 runs each):

| Every Herald plays | 2p | 3p | 4p | all | Herald uses / run |
| --- | ---: | ---: | ---: | ---: | ---: |
| no Ultimates | 79% | 94% | 94% | 93% | — |
| Anthem of the Unpaid | 75% | 94% | 95% | 93% | 2.91 |
| Into the Din | 83% | 97% | 97% | 96% | 3.08 |
| first cut: Vulnerable 3, **Weak 2** | 96% | 100% | 99% | 99% | 3.02 |
| Vulnerable 3, Weak 1 | 96% | 98% | 98% | 98% | 3.10 |
| Vulnerable 2, Weak 1 | 92% | 97% | 98% | 97% | 3.13 |
| Vulnerable 2, no Weak | 75% | 98% | 95% | 95% | 3.19 |
| **Vulnerable 3, no Weak (shipped)** | **83%** | **99%** | **96%** | **96%** | 3.16 |

The first cut also left the target Weak for two rounds ("it fights like
something already buried"). Weak on a boss for even one round, sung before
the round's other Ultimates and blows, was worth three to six points over
Into the Din: the boss's windup is most of what kills a party, and a third off
it is more than any damage. Without it, at 96%, the Elegy sits level with the
Warcaller's Ultimate and three above the Anthem, which is where a path that
trades the Anthem's Barrier and Empowered for a longer opening should sit.
The weakness stayed in the film (the enemy dragged down by its feet as the
earth goes in) and left the rules. Tests:
`tests/ultimates-elegy-for-the-standing.test.ts` (4).

## Space, palette, sound

- **Space: the burying ground, dug the night before.** A slope of raw clay
  under a flat, sunless white sky: rows of fresh graves dug and waiting, open
  pits with their spoil heaped beside them and pegged out with string, no
  stones and no names yet; a line of black cypresses along the crest; a spade
  left standing in a heap. Nothing in it casts a shadow, because nothing
  lights it — except the one the song is for. Not a hall, forge, storm, wood,
  ridge, causeway, field between the lines, the ground under the floor, a pit,
  a vault, mirrors, a mere, a labyrinth, a theatre, a page, a spillway, a
  snowfield, a moth garden, a hound run, a sunlit roof or a tannery loft.
- **Palette: mourning's three grades, and earth.** Full mourning black (the
  shadow, `#0d0b12`), grey (the pewter sky, `#5e636c` to `#ecebe3`), and the
  lilac of half-mourning (`#c6b4e8`, the accent), which is the Herald's own
  flag. The earth is raw clay, umber to near black. No gold and no rose: the
  Herald's warm colours are what it gives up to sing this.
- **Signature effect — the shadow laid down.** The target's shadow is its own
  drawing, copied off the stage, filled with mourning black and edged in
  half-mourning lilac, joined to its feet. It is not a shadow cast by any
  light (nothing in the burying ground casts one): it has a will of its own.
  It stands up behind the target when the song starts, and each note of the
  motif lays it further down, like something felled, until it lies full length
  in the open grave. On the last note the spoil on both sides tips in over it
  and it is gone. Everywhere after, the target stands on a filled grave and
  casts nothing. (Sunblind, merged while this was authored, draws every
  enemy's cast shadow thrown long behind it by a hard sun; this shadow is cast
  by nothing, stands up, is edged in lilac, and is buried. The board's call
  stands it up behind the enemy rather than laying it along the floor, so the
  two never rhyme.)
- **The impact frame — the negative.** At the last note the frame goes to
  mourning black and only the figures and the shadow are drawn, in bone, the
  shadow and the enemy one shape joined at the feet. Then colour, and the
  earth comes in.
- **Motif (original):** a single voice on a closed "oo", falling — E4, D4, C4
  — over a low drone, and the last note A3 sung full on an A minor chord as
  the earth lands on it. Not the Anthem's horn and answer (A3, E4, F♯4, D
  chord) and not the Din's drum and bell (D3, D3, F3, C4).
- **Signature sound:** earth thrown into a grave — a spadeful of clay landing
  on wood, heavy, granular, with the dull knock under it.
- **The impact, layered:** the sod tearing and a hard knock (transient), a
  sub drop, the last note sung full on the chord with the whole heap landing
  (body), and soil trickling in after it with a long grey air (tail).
- **The quiet:** music ducked to 3%, and nothing but a little earth running
  off the lip of the grave, grain by grain.

## Rhythm

identity (the Herald's open face closes over the song: the brows lift, the
eyes shut, the mouth rounds on the note; a leaf of the laurel comes loose) →
stakes (the burying ground: the Herald with its colours dipped and the real
party with their heads bowed, at a graveside, for the real enemy at the
grave's foot, which is alive and looking at them; its shadow stands up behind
it and lies down note by note; title) → **quiet** (on the ground at the head
of the grave: the shadow laid out full length towards the lens with the
laurel leaf on it, the enemy tiny and upright at its feet against the white
sky; nothing moves but a few grains of earth) → **impact** (the negative
frame; the banner driven point first into the ground at the shadow's head;
the earth heaved in over the whole length of it; the enemy dragged down by
its feet) → release (the real board: the enemy standing on a fresh grave with
the Herald's laurel on it, a laurel leaf settling on every one of the party).

The quietest shot sits directly before the loudest.

## Shots — FULL 4100ms, FAST 2580ms (63%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Herald `ult:elegy-dip` — the head bows, the colours dip forward and down, the horn arm comes in | real battlefield sinks to pewter grey, bars close | lilac call aura; **the real target's shadow, a copy of its board figure in mourning black, stands up out of the floor behind it and begins to lean** (`elegy-board` rise) | a low hummed note over a drone (`elegy-hum`); music ducks | on board | — | break the round: someone has started a funeral |
| 1 | Sung · face close-up | 660 (400) | tight on the face and the laurel, a slow push down and in | `ult:elegy-sing` (`root: false`) — the earnest face looks down at what it has to sing (brows up, lids half down, the mouth set), the eyes shut, and the mouth rounds on "oo"; the head bows on the breath and lifts on the note | the burying ground, low; white sky and cypresses behind the head; lilac rim | **a laurel leaf comes loose from the front of the circlet and falls turning past the face** (`elegy-leaf`) | motif, first two notes (E4, D4) on the voice (`elegy-motif-a`) | no | black 80ms | identity: the face that tells you your worth, singing it in the past tense |
| 2 | Graveside · wide | 920 (520) | wide across the open grave, a slow push | Herald at the head of the grave, `ult:elegy-mourn` (colours dipped, singing, breathing); the real party behind it, `ult:elegy-bow` (heads bowed, weapons lowered) | the burying ground: white sky, cypresses, rows of open graves | **the target's shadow, copied off its figure, stands leaning behind it and is laid down note by note along the grave** (`elegy-shadow` lay: −20°, −54°, −90°), lilac-edged; the grave dug from its feet to where its head will be | motif (D4, C4 falling), the drone, one clod into the grave (`elegy-motif-b`) | **yes** — `anticipate` as its shadow goes down | cut | stakes: who is mourning, and who for; title |
| 3 | Laid out · the quiet | 600 (380) | on the ground at the head of the grave, dead still | Herald out of frame | exposure 0.46 → 0.24, heavy vignette, the white sky behind the enemy | **the shadow laid full length towards the lens** (`elegy-shadow` quiet: the copy laid down in perspective), the laurel leaf on it; the grave's two walls closing to the enemy, standing tiny and silhouetted at its feet (`elegy-quiet`) | music ducked to 3%; earth running off the lip (`elegy-trickle`) | **yes**, far off, still | cut | anticipation by stillness |
| 4 | Buried · impact | 780 (560) | low profile along the grave, Dutch −6° → −2°, easing out | Herald `ult:elegy-close` (160ms, contact 0.3) — the last note sung up at the sky, the banner driven point first into the ground at the shadow's head; then `ult:elegy-planted`; target `hurt` at 0.048, dragged down and tilted | exposure blown, falling to 0.62; bone tint | **the negative (44ms)**: black frame, every figure and the shadow in bone (`elegy-negative`); **the spoil on both sides tips in as two slabs and the earth is thrown up along the whole grave** (`elegy-clods`: 90 clods, a heap over the enemy's feet); the grave filled (`elegy-shadow` bury); dust | layered impact (`elegy-earth`) + room boom; **150ms stop at 0.1**; heavy shake | **yes** | cut on the negative | impact: the damage and the Vulnerable on the frame; "Lie down. The song's over." |
| 5 | Mourned · return | 720 (480) | battle camera | real Herald `ult:elegy-rest` — the banner lifted out of the earth and stood upright | real battlefield; bars open | **a fresh grave mound under the real target with the Herald's laurel wreath on it, the shadow sunk in it** (`elegy-board` grave); **a laurel leaf settling on every one of the real party** in turn (`elegy-board` laurel, 110ms apart) | the last note hummed, earth settling (`elegy-settle`), tail | on board | flash 80ms | release: who is mourned, and a party with its griefs laid down |

## Framing

- **Large and boss.** The graveside, the quiet and the burial are re-framed.
  The graveside pulls back (zoom 1.3 → 1.2 / 1.04) and stands a heavy
  target or a boss further off at the grave's foot, smaller, so it is whole in
  the frame with a grave long enough for its shadow. The quiet stands a boss
  further up the grave at 82 (lit, not silhouetted: its shape is too big to
  read as a black mass) and stretches the shadow less (sy 4.2 against 6.2).
  The burial pulls back (zoom 1.55 → 1.4 / 1.08) with the singer smaller
  against the target, the grave and the earth run its whole length (a boss's
  from 460 to 1290), and the drag is smaller (a boss is not moved far).
- **Party size.** The graveside's allies stand a step nearer the camera and
  further left each (a row is painted in slot order), so a duo's one ally sits
  by the singer and a quartet's third is still in frame.

## FAST

Keeps all six shots, shorter: the graveside is cut to 520ms (the shadow
still goes down in it; the title stays), and the quiet and the burial keep
their shape. 2580ms of 4100ms (63%).

## Voice

"This one's for you. Sorry it's early." · "Lie down. The song's over." · "We've
done our grieving. Now finish it."

## Notes from the lab

- Every camera and effect was placed from probed positions
  (`scripts/probe-ultimate.ts`): the face at size 1000 (head 645–844 ×
  259–483, the mouth at 795, 448), the banner's point on the burial's held
  frame (the pole's foot at about 390, 915 with the caster at 430, 830, so the
  grave's head is at 470 and the earth is thrown from 560 rightwards, clear of
  the singer).
- **The face.** The Herald's mouth is drawn as an open smile with teeth, so
  any wide opening reads as laughter. Sung, it is narrow and tall (wide
  0.44–0.48, mouth 1.9–2.35): an "oo". The look down before the note is the
  mouth pressed (0.38) with the brow up and the lids half closed. The brow is
  one group, so `knit` reads as the front end dropping; sorrow here is the
  brow lifted (−1.4 to −2.5) with only a small knit.
- **The shadow** is the stage's own target node, copied twice (`cloneNode`)
  into the effect's box — one filled black, one a shade larger (1.07) in lilac
  behind it as the edge — and stripped of everything that names it
  (`data-part`, ids, the actor classes, the anchor) so the animator, the tests
  and the probes never mistake it for the figure. Its wrapper's transform
  origin is the target's ground point; it follows the target's placement and
  root pose until the earth goes in, and is removed with its shot. The
  creatures' drawn glows are filters; the copies have them stripped.
- **Effects sit above the film's exposure.** Every fill drawn for a shot is
  painted at that shot's brightness: the graveside's grave at ~0.75, the
  quiet's grave near black (the pit `#15100c`), the burial's clods bright.
  Before that the quiet's grave drew brighter than the ground around it.
- **The pit** is drawn as a hole, dark with the cut edge round it, not as a
  lighter slab: on the first cut the raw earth inside was lighter than the
  ground and the whole grave read as a platform the shadow lay on.
- **The held frame.** A `shove` and a `toTilt` ease over a shot's remainder,
  so on a frame held 40ms after contact the target has barely moved. The
  stop is at 0.1 (78ms in), 30ms after the `hurt` reaction starts, so the
  held frame has the recoil on it; the drag itself (34 down, −11°) lands
  over the shot. The enemy is dragged down, never sunk: only its shadow is
  buried, and the heap at its feet is kept small (230) so it stands over the
  grave, not in it.
- **On the board**, the grave lies under the target's own feet (from −0.62 to
  +0.4 of its height), not beside it: the floor to the left of a back-row
  enemy is another unit's, and a first cut laid the mound over an ally's
  head. The mound is a long low lumpy strip with the wreath on it; the sunk
  shadow shows as a lilac sliver above the mound's line.
- **Sound levels**, rendered offline (peak / RMS): `elegy-earth` 1.37 /
  0.106, between the Anthem's chord (1.20 / 0.079) and the Din's clang (1.84
  / 0.131); the sung motif 0.16 / 0.03, level with the Anthem's horn (0.18)
  and answers (0.13); the hum 0.11; the settle 0.12; the trickle 0.03, on
  purpose the quietest thing in any film.
- **Profile** (1920×1080, real GPU, dev build, a shared machine): film p50
  16.7ms / p95 16.8ms, 2 frames over 34ms (at its first frames); the round
  after it p50 16.7 / p95 16.7, none over 34. Peak 1389 nodes (1313 SVG: the
  four rigs and the two shadow copies), 4 live effects.
- **Root keys.** Clips with non-trivial root keys: `ult:elegy-dip` (a lean
  and a settle of 3°, on the board), `ult:elegy-mourn` (a slow breath: y and
  squash), `ult:elegy-close` (x 0.07, rotate 9°, squash 1.09 at contact),
  `ult:elegy-planted` (settling from it), `ult:elegy-rest` (on the board, the
  lean coming off), every ally's `ult:elegy-bow` (a bow of 1.5° and a sink).
  `ult:elegy-sing` keys almost nothing on the root and plays with
  `root: false` in the close-up, so the face is never carried out of the
  frame. No whole-body motion is written on `.cine-look`.

## What the engine could not do, and what was built instead

- **A figure that is not in the cast.** Only `reflection` gets a figure slot,
  and it is a still of the target. The shadow needs the target's own drawing
  at its own pose, black, in three shots at three sizes, so the effect copies
  the stage's node itself. The engine would need a `copy` slot on a vfx cue
  (role, look) that the stage fills and re-poses.
- **A result on the held frame.** `shove` and `toTilt` are eased over the
  rest of the shot, so a target cannot already be moved on a frame held soon
  after contact; the reaction clip is what shows there. A `shove.ms` (a
  knock-back with its own length) would put the drag on the held frame.
- **Vulnerable has no beat.** The board's chip is drawn from the snapshot
  already, so the mourning is shown by the film itself (the shadow, the
  grave); the damage is the only number the reveal can punch.
- **Stripping a status logs no beat**, so the party's Dirge (Burn, Poison,
  Weak and Vulnerable buried) is shown as a laurel leaf on every one of the
  party, whether or not it had anything to shed.
- **Allies on the board.** Battlefield clips reach only the caster and the
  targets, so the real party cannot bow in the call; the leaf that settles on
  each in the return is what the Ultimate did to them.
- **A dark silhouette of a boss** would read as a black wall in the quiet, so
  the boss framing keeps the Collector lit and small at the grave's far end.
