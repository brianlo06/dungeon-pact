# Hallowed Ground — Herald · Sanctifier

**The idea, in one sentence:** the Sanctifier draws the line itself — it walks
the party's front scoring the sooted foundry floor with the foot of its
standard, and closes the score with one hard low stroke that lights the whole
line white and blows the soot off the stone on the party's side: the ground
they are standing on is made clean and holy under their feet.

Only the Sanctifier could have it. The Herald's title is *You are worth more
than you think*; the Sanctifier's is *Hold the line by holding the people on
it*, and its kit is **Sanctuary**, a row's ground made safe. The line is
literal. The Herald is drawn with a standard, a long pole with a foot, and a
line drawn on the ground with the thing you carry is the oldest way there is
of saying *here, and no further*. No horn, no song, no note drawn in the air,
no dome, and no pole planted: the consecration is a mark cut in the floor and
what it does to the floor.

## Gameplay

`ultimate-defs/hrl-sanctifier.ts`, target self, cost 100, speed 14:

| | Anthem of the Unpaid (base) | Into the Din (Warcaller) | Elegy for the Standing (Dirgesinger) | **Hallowed Ground** (Sanctifier) |
| --- | --- | --- | --- | --- |
| Aimed at | self: the party | an enemy, struck | an enemy, mourned | **self: the ground under the party** |
| The party | Empowered 2 rounds, 8 Barrier, Weak and Vulnerable cleared | Weak cleared, Empowered this round | Burn, Poison, Weak, Vulnerable cleared | **10 Barrier that lasts four rounds; nothing cleared, nobody Empowered** |
| The enemy | nothing | 24, Vulnerable 2 rounds | Vulnerable 3 rounds, 12 through armour | nothing |
| The Herald | — | Empowered 3 rounds, +2 Verse | +2 Verse | **steps onto the front line, +3 Verse** |
| Lasts | 2 rounds | this round | 3 rounds | **4 rounds** |

It differs in what it does, not only in numbers. The other Herald Ultimates
give the party something to swing with (Empowered), or open the enemy for
them, or take the dungeon's afflictions off them. This one gives them nothing
to swing with, clears nothing and touches no enemy: it makes the ground they
stand on hold, for four rounds, and it puts the Sanctifier on the line in
front of them. Every enemy but a sniper and the Collector prefers the front
row when it picks a target, so a Sanctifier that steps forward draws the
enemy's blows onto itself (101 HP with the path) and away from the back row:
*hold the line by holding the people on it*. It costs what a front-row place
costs (a vent chamber scalds the front; a row attack on the front finds it).

The Barrier is the lasting kind: the Small Print's 30 lapses at its round's
end, the Anthem's 8 and the Lantern Wall's 12 a round after theirs; Hallowed
Ground's 10 is there until it is spent, for four rounds. Team play: a Vanguard
behind the line earns charge on every point its Barrier blocks and every hit it
intercepts; a Warden's Regeneration sits under it; and the Sanctifier's own
Sanctuary (3 Verse: 24 Barrier and Regeneration on a row) is paid for by the
+3 Verse the very next round, on whichever row the blows found.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, on
`0b86568`, with the path's stub still `null` (the Sanctifier on the Anthem) and
then with Hallowed Ground as shipped:

| Win rate | off | on, stub (Anthem) | **on, Hallowed Ground** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 88% | **88%** |
| 3 players | 94% | 95% | **96%** |
| 4 players | 92% | 94% | **94%** |
| all | 91% | 94% | **94%** |

"all" does not move. Herald uses per run 2.78 → 2.76, charge 292 → 291: the
bot trains a Herald into the Sanctifier rarely (the first cut, 16 Barrier and
Regeneration 4 on everyone and 12 more on the Sanctifier, also read 94%). So
it was weighed head to head, as the Elegy, Eyespot, False Footing and Sunblind
were: every Herald plays one Ultimate's effects whatever its path, every Herald
party in every 2nd composition, 6 seeds (492 runs each; every Hallowed Ground
row keeps the step to the front and the +3 Verse unless it says otherwise):

| Every Herald plays | 2p | 3p | 4p | all |
| --- | ---: | ---: | ---: | ---: |
| no Ultimates | 71% | 94% | 93% | 92% |
| Anthem of the Unpaid | 54% | 94% | 96% | 93% |
| Into the Din | 79% | 96% | 98% | 96% |
| Elegy for the Standing | 71% | 98% | 96% | 95% |
| an Ultimate that does nothing | 54% | 83% | 90% | 87% |
| only the step to the front | 67% | 89% | 96% | 93% |
| first cut: 16 Barrier + Regeneration 4, both 4 rounds; +12 own; +3 Verse; the step | 83% | 100% | 100% | 99% |
| the same without the step or the Verse | 83% | 99% | 99% | 99% |
| 12 + Regeneration 3, 3 rounds; +8 own | 83% | 99% | 100% | 99% |
| 8 Barrier 2 rounds + Regeneration 2, 3 rounds | 79% | 97% | 100% | 98% |
| Regeneration 4 only, 4 rounds | 79% | 97% | 100% | 98% |
| 8 Barrier + Regeneration 2, 4 rounds, no Verse | 83% | 98% | 100% | 99% |
| 12 Barrier, 4 rounds, no Verse | 79% | 98% | 99% | 98% |
| Regeneration 2 only, 3 rounds, no Verse | 75% | 96% | 98% | 97% |
| 8 Barrier, 4 rounds; +3 Verse; the step | 79% | 94% | 99% | 97% |
| **10 Barrier, 4 rounds; +3 Verse; the step (shipped)** | **75%** | **94%** | **100%** | **97%** |

The first cut won 99%, three points over Into the Din and four over the Elegy:
a whole party warded *and* regenerating for four rounds is far more than two
strong actions to the bot, and every version that kept both came out at 98–99.
The step to the front alone is worth six points over an Ultimate that does
nothing (the Herald draws the hound's bites off the back row). So the
Regeneration left the rules and stayed in the film only as the ground that
stays lit, the Sanctifier's extra 12 went, and the Barrier came down to 10:
at 97%, one over the Warcaller and two over the Elegy, with the step, the
lasting ward and the Verse for Sanctuary — the team play — whole. Tests:
`tests/ultimates-hallowed-ground.test.ts` (6).

## Space, palette, sound

- **Space: the cold casting floor of the Ember Foundry.** The great floor
  where the foundry poured, with its fires out: sooted flagstones in
  perspective, joints running away to a far wall; a casting trench along the
  right; iron columns; ladles hanging dead on their chains from the dark
  overhead; slag heaped at the walls; the furnace mouth far off, an arch with
  nothing burning in it. Lit by nothing until the line lights it. Not the
  Breaker's breach forge (a forge wall in heat, a vault gate, red, embers):
  this foundry is cold, blue-black and silent, and the only fire in it is the
  one the Sanctifier scores into the floor. Not the Elegy's burying ground,
  False Footing's hound run behind these same works (outdoors, peat, a
  dusk sky), or Proof Shot's proving range (an overcast lane of cinder with
  plates hung on frames).
- **Palette:** soot black-brown (`#100e0d`) and cold iron blue-grey
  (`#2c313a`) for the foundry; the scored groove warm ember (`#ffb070`) while
  it is cut; the lit line arc-white with a cold blue halo (`#cdf5ff`, the
  accent — a seam in a foundry, not lantern gold); the stone under the soot
  clean pale grey (`#c9c4b6`). No gold light, no rose, no lilac beyond the
  Herald's own flag.
- **Signature effect — the line scored, then lit.** The foot of the standard,
  dragged, cuts a groove along the floor behind the walking Sanctifier, a
  rooster tail of hand-cut sparks thrown back off it and falling, and an ember
  light in the groove (`hallow-score` score). Seen down its length in the
  quiet, the groove is a wedge running from the lens to the foot, its embers
  going out from the near end (`hallow-score` quiet). On the stroke the whole
  length goes white at once, a burst of long tapered streaks is thrown forward
  off the foot along the sweep, and a bead of white runs back down the line
  after the stop (`hallow-score` burn); on the same frame the soot on the
  party's side is off the stone — a hundred and fifty flakes of it lifting,
  lit on their edges from the line below — and the pale flagstones show under
  the party, who do not move: only their cloth and hair blow (`hallow-soot`
  blow). On the board after, a lit seam along the party's front and a clean
  flagstone under every one of them (`hallow-board`).
- **The impact frame:** a two-tone frame in the pale stone colour (30ms) and a
  white flash (12ms), both over before contact, so the frame the hit-stop
  holds is in colour and already has the result on it: the stroke, the lit
  line, the bared stone and the soot in the air.
- **Motif (original):** a reed organ, not a horn and not a voice. Three rising
  notes, F3 · B♭3 · C4, on a slow harmonium swell, and the fourth, F4, lands
  as an F-major chord with the ninth in it on the stroke. Not the Anthem's
  horn and answer (A3, E4, F♯4, D chord), the Din's drum and bell (D3, D3, F3,
  C4), the Elegy's falling voice (E4, D4, C4, A3) or Proof Shot's rung plates
  (D3, F3, A3, D4, going away).
- **Signature sound:** iron scoring stone — a long grinding scrape whose band
  climbs, a thin screech riding it where the foot catches and slips, grit
  after it.
- **The impact, layered:** a short grind rising into the contact (38ms, so the
  contact lands with the picture in FULL and FAST), then the foot's crack on
  stone and a hiss of the line catching (transient), a sub drop, the organ
  chord and a low iron ring (body), a long white hiss of the soot going off
  the floor with grit in it (tail).
- **The quiet:** music ducked to 3%; the scrape has stopped; only the embers
  in the groove ticking as they cool.

## Rhythm

identity (the Herald's open smile goes: the mouth closes on it, the brows
come down and in, the mouth presses to a line, one hard nod) → stakes (the
real party with their feet set on the cold floor while the Sanctifier walks
their whole front, the standard couched, the groove opening behind it and the
sparks flying back off its foot; title) → **quiet** (down on the stone at the
near end of the groove, looking along it to the Sanctifier coiled over its
end, weight back, the foot drawn back into it; the embers going out; the ash
hanging) → **impact** (the two-tone; the stroke: the foot swept forward
through the end of the score, the lunge after it; the line white end to end;
the soot off the party's side; the party unmoved; the Barrier on everyone) →
release (the board: a lit seam along the party's front, a clean flagstone
under each, the Sanctifier in front).

The quietest shot sits directly before the loudest. The Sanctifier never
strikes anything, never faces an enemy, and never sings.

## Shots — FULL 4100ms, FAST 2640ms (64%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Herald `ult:hallow-slope` — the standard tips forward onto the shoulder and its foot knocks the floor once | real battlefield goes cold iron, bars close | pale call aura; a short bright scratch on the floor at the Herald's feet (`hallow-board` knock) | the foot on stone; the organ breathing in (`hallow-knock`); music ducks | on board | — | break the round: something is being marked out |
| 1 | Set · face close-up | 620 (380) | tight on the face, Dutch −4° righting to 0°, a slow ease back | `ult:hallow-set` (`root: false`) — the open smile goes (the mouth closing on it, the chin lifting on a breath), the brows come down and in, the mouth presses to a line; one hard nod with the lids dropping; the eyes come back up steady | the cold foundry, near black; a cold rim | ash drifting down past the face (`hallow-soot` drift) | motif, first two notes (`hallow-motif-a`) | no | black 80ms | identity: the face that tells you your worth, deciding where you stand |
| 2 | The line · wide tracking | 900 (460) | medium-wide, trucking right with the Sanctifier | Herald `ult:hallow-walk` — the standard couched forward at 52°, its foot dragging the floor behind; the real party behind the line, `ult:hallow-stand` (feet set, heads following it) | the casting floor; warm under-light from the groove | the groove cut along the floor behind the foot, an ember light in it, a rooster tail of sparks thrown back off the foot (`hallow-score` score) | the scrape (`hallow-scrape`), the third note over it (`hallow-motif-b`) | **the real party**, with their real gear | whip 110ms | stakes: whose ground it is; title over the dark wall |
| 3 | Down the line · quiet | 600 (380) | down on the stone at the near end of the groove, looking along it; Dutch 5°, dead still | `ult:hallow-coil` — the Sanctifier coiled over the end of the score, weight back and low, the standard leaned forward so its foot rests behind the heels in the groove (40°) | exposure 0.42 → 0.22; warm under-light dying; heavy vignette | the groove as a wedge from the lens to the foot, the embers going out from the near end, a warm glow at the foot (`hallow-score` quiet); ash hanging still (`hallow-soot` hang) | music ducked to 3%; embers cooling (`hallow-ember`) | no | cut | anticipation by stillness |
| 4 | The stroke · impact | 860 (700) | medium-wide from the enemy's side of the line, low, easing back | Herald `ult:hallow-stroke` (180ms, contact at 45ms) — the foot swept forward through the end of the score (+40° → −26°), the body lunging after it, the flag dragged out flat; then `ult:hallow-held`, a guard with the foot on the lit line; every ally `ult:hallow-still` (nothing moves but cloaks and hair) | exposure up; the stone's cold under-light | **two-tone frame** in pale stone (30ms) and a white flash; the line white end to end, streaks thrown forward off the foot, a bead running back along the line (`hallow-score` burn); the soot off the party's side and the pale stone under them (`hallow-soot` blow); dust at the foot | layered stroke (`hallow-strike`) + room boom; **150ms stop at contact**; heavy shake | **the real party**, unmoved | cut on the two-tone frame (FAST: invert) | impact: the Barrier revealed on everyone on the held frame; "Holy ground. Hold it." |
| 5 | Held · return | 720 (480) | battle camera | real Herald `ult:hallow-hold` — the guard let go to rest | real battlefield; bars open | a lit seam along the real party's front (`hallow-board` line); a clean flagstone under every real party member, one after another (`hallow-board` stone) | the chord's release, one last knock (`hallow-settle`), tail | on board | flash 80ms | release: the ground held, and who is on it |

## Framing

- **Boss.** Nothing in this film is an enemy, and a self-targeted Ultimate is
  framed `normal` in any room: a boss is only on the real board, in the call
  and the return.
- **Party size.** The line passes the whole row whatever its length, spread
  250 apart; in the stroke later allies stand a step nearer and further left
  (−230, +12), so a duo's one ally stands by the Sanctifier and a quartet's
  third is still in frame at the left edge.

## FAST

Keeps every shot, shorter: the line cut to 460ms (the title stays), the quiet
to 380ms, and the stroke to 700ms. The stop and the reveals are fractions of
the shot, so they land 37ms into the FAST stroke rather than 45ms; the stroke
clip is front-loaded (most of the sweep is done by 34ms) so that frame still
has the pole low and forward, not upright. 2640ms of 4100ms (64%).

## Voice

"Stay where you are. I'll see to the ground." · "Holy ground. Hold it." ·
"It holds as long as you do. So hold."

## Merged films checked

Checked against every film on `ultimates` before the space was kept and again
before the final captures. **Elegy for the Standing**, the Herald's other path
film, drives the banner point first into the ground at its impact; the first
cut of this film *grounded* the standard on the end of the line as its impact,
which read as the same gesture on the same figure, and its face close-up
opened on the same look down. Both changed: the impact is a low forward sweep
of the pole's foot along the floor, the pole never upright at the loudest
frame; the close-up never looks away or shuts its eyes (the smile goes and the
face sets). **Living Bone** (a shedding ground, a tine grafted), **Undertow**
(a sea drawn back off the flats) and **Proof Shot** (an overcast proving range,
a plate holed twice) share nothing with it; Undertow's water drawn back off
the sand is why the soot here lifts off as flakes at once rather than rolling
back as a sheet.

## Notes from the lab

- **The first cut's impact did not read.** Its held frame was the party in a
  dark room with a thin line at their feet and a flare star; the clean stone
  only showed a third of a second later. Now everything the Ultimate did is on
  the frame the stop holds: the stone clip is 70% open at contact (the rest
  over the next fifth of the shot), every flake is already off the floor, the
  line is lit at contact with no ramp, and the burst is out.
- **The held frame's pose.** A stroke lerped linearly from the coil passes
  through the vertical, which on a held frame is the Elegy's planted pole. The
  pose is front-loaded (−20° at 34ms, −26° at contact, 45ms) and the whole
  group drops (0.09) so the foot stays on the stone at that angle. Probed on
  the held frame: banner −26°, the foot at the line's end (world 1270).
- **Pole geometry**, for placing the foot: the banner pivots at the front
  shoulder (60, 50) and its foot is at (69, 96); rotated by a, the foot's
  height is 50 + 9·sin a + 46·cos a, so the drop that sets it on the floor is
  0.116 at 52°, 0.06 at 40°, 0.01 at 0°, 0.09 at −26° and 0.16 at −40°.
- **After the stroke** the first cut stood the standard upright on the line;
  on the frames after contact that read as a planted pole. `ult:hallow-held`
  is now a guard at −18° with the foot on the line.
- **The quiet** was a macro of the boots and the pole's foot at size 1100, and
  read as a brown shape. It looks down the groove instead: the groove drawn as
  a wedge in perspective from the lens to the foot, the Sanctifier small and
  whole at its end. The wedge's lip is only a shade off the floor; a lighter
  lip read as a road.
- **The line shot** was framed like the Elegy's graveside (the Herald big in
  the foreground, the party behind it). It is now a wider track (zoom 1.3):
  the Sanctifier at 310 walking past the party at 250, the title over the dark
  wall rather than over the figures, a thicker groove and a warm under-light.
- **Worn gear** (`gear=kit`): the Herald's kit weapon is a short blade, not a
  pole, so in the stroke its tip does not reach the floor; the burst and the
  line still come off the end of the score.
- **Sound levels**, rendered offline (peak / RMS): `hallow-strike` 1.51 /
  0.108, level with the Elegy's earth (1.24 / 0.106) and between the Anthem's
  chord (1.18 / 0.079) and the Din's clang (1.84 / 0.131); the motif 0.15–0.17
  / 0.03, level with the Anthem's horn (0.18) and the Elegy's voice (0.16); the
  scrape 0.24 / 0.017; the settle 0.25; the embers 0.05, on purpose almost
  nothing; the call's knock brought down from 0.50 to about a third.
- **Profile** (1920×1080, real GPU, dev build, load average 23–40 from other
  sessions): film p50 16.7ms / p95 50ms, 11 frames over 34ms; the round after
  it p50 16.7 / p95 50.1, 21 over 34. Peak 941 nodes (881 SVG), 3 live
  effects, no filtered elements.
- **Root keys.** Clips with non-trivial root keys: `ult:hallow-slope` (a lean
  back of 2.5° and a sink, on the board), `ult:hallow-walk` (the bob: y and
  squash, a 3° forward lean), `ult:hallow-coil` (the crouch: x −0.014, −5°,
  squash 1.065), `ult:hallow-stroke` (the lunge: x 0.07, rotate 9°, squash
  1.1 at contact), `ult:hallow-held` (settling from it), `ult:hallow-hold`
  (on the board, the lean coming off), every ally's `ult:hallow-stand` (weight
  dropped) and `ult:hallow-still` (held where `stand` left it). `ult:hallow-set`
  keys almost nothing on the root and plays with `root: false` in the
  close-up. No whole-body motion is written on `.cine-look`.

## What the engine could not do, and what was built instead

- **Allies on the board.** Battlefield clips reach only the caster and the
  targets, so the real party cannot set their feet in the call or the return;
  the clean flagstone under each in the return is what the Ultimate did to
  them.
- **A row's reactions land together.** The film wants that here: nobody moves
  on the stroke, and only cloth blows.
- **Stops and reveals have no mode.** A `stop` or `reveal` cue cannot be set
  per mode, so in FAST it lands at the same fraction of a shorter shot while
  the clip plays in real milliseconds; the stroke is front-loaded so the held
  frame is right in both. A `mode` on stop and reveal cues (or an `ms` offset)
  would let them sit on the contact exactly.
- **A row move has no beat.** The Sanctifier's step to the front is state; the
  board's row layout shows it after the round.
- **A weapon's end is not addressable.** The effects are placed from probed
  pose angles, not from the drawn foot of the standard; a worn weapon of
  another length (the kit blade) does not reach the line. A per-part anchor
  point an effect could follow would fix both.
