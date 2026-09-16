# Give and Take — Reaver · Bloodbound

**The idea, in one sentence:** the Bloodbound opens its fist for the first
time and lays the bare palm along its cleaver's edge, swearing the pact on the
blade, so the blade runs both ways: driven through the enemy's armour it
carries the Reaver's blood down into the wound, and then it carries the
enemy's back up, into the hand that paid.

Only the Bloodbound could have it. The Reaver's title is *Pain is just unspent
currency*, and every Reaver pays; the Bloodbound's path title is *The debt
runs both ways now*, and it is the only one whose blood comes home: it traded
Blood price for **Blood pact** (lose 10, deal 40 through armour, and take 14
back). The drawing supplies the oath. The Reaver's front hand is a bandaged
fist in every drawing, every round and both other Reaver films (clenched in
Red Ledger, beating the chest in A Good Hiding); the Bloodbound's Ultimate is
the one time it opens. An oath sworn on a blade is as old as blades; the
notched cleaver it drags is the only thing it owns, so that is what it swears
on, and the blade is the channel both ways.

## Gameplay

`ultimate-defs/rvr-bloodbound.ts`, target an enemy, cost 100, speed 10:

1. blood out: the Reaver **pays 12 HP**;
2. into the enemy, under the armour: **30 through armour** (35 at the
   Reaver's power);
3. an open wound pays back faster: if the enemy was **already Vulnerable**
   (read before the pact opens it), the Reaver takes back **12 more**;
4. blood back: the Reaver **takes back 26**;
5. both parties are bound by a pact: the enemy is **Vulnerable for two
   rounds**, and the Reaver **Vulnerable this round**;
6. **+2 Fury**.

| | Red Ledger (Reaver) | A Good Hiding (Ironhide) | **Give and Take** (Bloodbound) |
| --- | --- | --- | --- |
| The Reaver's HP | −14 | ±0, +16 Barrier | **−12, then +26 (+38 on an open enemy): a net +14 or +26** |
| The target | 40 through armour | Weak 2 rounds; 12, Empowered | **30 through armour; Vulnerable 2 rounds** |
| The row | 12 to everyone else in it | nothing | **nothing** |
| The Reaver afterwards | as it was | Empowered, Barrier | **Vulnerable this round** |
| Fury | +3 | +2 | +2 |

It differs in what it does, not only in numbers. Red Ledger is a price and a
burst: the Reaver always ends 14 down and the row is cut. A Good Hiding is an
exchange of blows: nothing is paid, and the Ironhide keeps the enemy's
strength. Give and Take is a trade of blood: the Reaver ends the cast with
more health than it began, one enemy is opened for the whole party for two
rounds, and the Reaver stands open for one. Nothing is absorbed, nothing is
struck across a row, nothing guards anyone.

The team play runs both ways, as the path says. The party's blows on the bound
enemy land a quarter harder for two rounds (Exploits, Chain Shock and the
other Ultimates of that round included, since it resolves at speed 10). An
enemy the party had already opened — Drag them down (the Reaver's own),
Gatebreaker, Foreclosure, Mind spike, Proof Shot — pays the Reaver back 12
more. And the Reaver left open is a Reaver being hit this round, which is how
a Reaver fills its meter (hurt ×1.8), or a Vanguard's guard link turned into
Pact Charge.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, back to
back, with the path's stub still `null` (the Bloodbound on Red Ledger) and then
with Give and Take:

| Win rate | off | on, stub `null` (Red Ledger) | **on, Give and Take** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 88% | **88%** |
| 3 players | 94% | 95% | **95%** |
| 4 players | 92% | 95% | **95%** |
| all | 91% | 95% | **95%** |

Nothing moves (Reaver uses per run 2.45 and 263 charge both times; healing and
Barrier from Ultimates 125 → 126 a run): the Cipher is the deepest mentor, and
the bot trains a Reaver into the Bloodbound almost never in that sample. So it
was weighed head to head, as A Good Hiding was: every Reaver playing one
Ultimate's effects whatever its path, every 2nd composition with a Reaver in
it, 6 seeds, 492 runs each (a scratchpad script, not committed):

| Every Reaver plays | 2p | 3p | 4p | all | Reaver uses / run |
| --- | ---: | ---: | ---: | ---: | ---: |
| no Ultimates | 83% | 91% | 83% | 85% | — |
| Red Ledger | 67% | 95% | 88% | 89% | 2.33 |
| A Good Hiding | 92% | 99% | 97% | 97% | 2.43 |
| **Give and Take** | **79%** | **98%** | **95%** | **95%** | 2.51 |

It lands between the two other Reaver Ultimates: six points over Red Ledger,
whose price costs duos most (a Reaver 14 HP down with nobody to heal it), and
two under A Good Hiding. The first cut was kept.

Tests: `tests/ultimates-give-and-take.test.ts` (4): it replaces Red Ledger and
reaches nobody past its target; −12, 35 through armour, +26, the enemy
Vulnerable two rounds and the Reaver one; 12 more back from an enemy already
Vulnerable (and the cut a quarter harder on it); resolved as an Ultimate, the
film is handed its one target, the price, the damage and the healing as beats.

## Space, palette, sound

- **Space: the gallows crossroads on the chalk down, at night.** Two chalk
  tracks cross on a bare down under a torn sky with a few hard stars and a
  cold band of light low on the horizon. At the crossing a fingerpost leans
  with two arms pointing opposite ways, their lettering weathered off. Behind
  it an empty gibbet stands on a barrow, its cage hanging, and a thorn is bent
  flat by the wind. The chalk is the only pale thing; turf and downs are ink.
  A crossroads is where a bargain is struck, and a fingerpost there points
  both ways. Not a hall, forge, vault, gate, storm, ridge, causeway, wood,
  mirror room, counting house, cutaway, labyrinth, no-man's-land, meadow,
  hound run, spillway, sink, held fall, proof range, harbour flats, white
  roofs, page, theatre, burying ground, shedding ground, mere, snowfield, sand
  pit, tannery loft or casting floor. No top light, no sand, no stakes, no
  hides, no moon.
- **Palette:** night `#0b0d16`, turf `#15191c`, chalk `#d9d3c4`, a cold star
  rim `#b9c6d8`, and two bloods: **scarlet** `#e8243c` for the Reaver's, going
  out, and **garnet** `#7a1030` with a rose sheen `#ff8fb0` for the enemy's,
  coming back. The accent `#e0466f` sits between them. Red is never a mark
  painted on anyone (Red Ledger's) and never a light: it is only ever
  something running.
- **Signature effect — the run.** Blood running along a blade, drawn as a
  liquid: a glossy ribbon with a swollen, bright head, a hard highlight and a
  thin tail, laid along the lower flat of the blade just above the notched
  edge and clipped to the blade. It is part of the Reaver's drawing (`runOut`,
  `runBack`, hidden at rest), so it rides the real cleaver: **out** is
  scarlet, from the palm to the point, in the oath, at the point across the
  crossroads, dripping from the point in the quiet and running down the
  buried blade after the blow; **back** is garnet, from the point up the steel
  into the palm, in the take. On a worn weapon it runs in a band along the
  same axis. On the board a scarlet run goes down the enemy and a garnet run
  up into the Reaver (`give-board`).
- **The hand.** The fist opens: `knuckles` (the fist as drawn) goes, the
  bandage comes off (`unwrap`) and an open hand with a cut across its palm
  (`palm`) is laid on the blade: along the edge in the oath, across the spine
  in the take. The hand is drawn over the cleaver and placed by its own keys,
  since it lies on the blade.
- **The drawn frame — both ways.** The impact's accent is the engine's
  two-tone, first as it is (the Reaver and the enemy ink on the accent) and
  then, for the whole hit-stop, inverted (the same two figures in the accent
  on ink): the one picture shown one way and then the other. A flat field of
  chalk light is laid behind the figures for it (`give-glare`) so they
  separate from the night, and over both, in colour, the scarlet run is laid
  across the whole frame along the blade on an ink cut (`give-split`). The
  number is on it; a burst of notched wedges is thrown off the contact
  (`give-notch`).
- **Motif (original):** a bowed saw — a blade made to sing — over a low bowed
  drone: E4, B♭4, E4, then E3 under it. Out a tritone and back again: a tune
  that runs both ways. Not a drum and string (Red Ledger), a mallet on a
  string (A Good Hiding), a reed organ (Hallowed Ground), a horn, bell, music
  box, marimba, chime, pipe or voice.
- **Signature sound: the edge drawn.** A palm drawn along a blade: a steel
  whisper whose band climbs as it goes out (`give-oath`); its answer in the
  take is the same whisper falling as the blood comes back (`give-take`).
- **Impact, layered** (`give-impact`): a cleaver's crack (transient), a sub
  drop, a wet thock and the blade's ring (body), and the wind rushing back in
  over the down (tail); `ult-boom` under it.
- **The quiet:** music at 3%; the wind cut off with the cut; one creak of the
  fingerpost (`give-hush`); the bead trembling on the edge.

## Rhythm

identity and the price (the bandage off, the fist opened, the palm drawn along
the edge, the scarlet running out ahead of it: "I bleed, you bleed.") → stakes
(over the Reaver's shoulder across the crossing at the real enemy, the blade
held out at it with the blood standing at its point, the fingerpost between
them; title) → **quiet** (the real enemy in the dark under the blade's edge,
a bead of scarlet trembling on it, the wind gone) → **impact** (the frame both
ways, the scarlet cut across it; the cleaver through the enemy's guard, the
notched burst, the run down into the wound: "Your turn.") → the take (the
face as the enemy's garnet comes back up the blade into the palm: head back,
brow lifted, eyes shut on a breath in; then the grin; the healing revealed) →
release (the real board: a run down the enemy, open for the party; a run up
into the Reaver, whole: "Square.").

## Shots — FULL 4760ms, FAST 3020ms (63%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Reaver `ult:give-call`: the cleaver swung up off the floor to lie across the body, the fist brought to it | real battlefield goes to night indigo, bars close | chalk-pale call aura | call bell; the blade brought up and a hand laid on it (`give-ring`); music ducks | on board | — | break the round |
| 1 | Oath · extreme close-up | 700 (440) | on the blade across the chest and the hand, Dutch −8° → −5°, pushing in | `ult:give-oath` (`root: false`): the bandage comes off, the fist opens, the palm is laid along the edge and drawn towards the point; brow lowered, teeth set | crossroads, exposure 0.3, cold star rim | the bandage falling (`unwrap`), the open hand (`palm`), **the run out** along the blade (`runOut`) | `give-oath`: linen, a hand on steel, **the edge drawn** rising; "I bleed, you bleed." | no | black 70ms | identity: the one time the fist opens, and the price |
| 2 | Crossroads · over-the-shoulder | 920 (480) | past the Reaver's shoulder across the crossing, slow push | `ult:give-hold`: the cleaver held out forward and down, the open hand on it, the blood at its point | crossroads, wide: tracks, fingerpost, gibbet, thorn, stars; star rim | wind streaks and chalk grit crossing low (`give-wind`) | wind (`give-wind`), **motif** (`give-motif`) | **the real target** across the crossing, lit cold, bracing (`anticipate`) | cut | stakes; title |
| 3 | Under the blade · target (the quiet) | 520 (340) | level, dead still, on the enemy | `ult:give-raise`: the blade held level over the enemy from off the right of the frame, a hair of tremble | exposure 0.14 → 0.12, vignette 0.9, star rim on the enemy | **one bead of scarlet trembling on the edge over the enemy** (`give-bead`) | music at 3%; the wind cut; one fingerpost creak (`give-hush`) | **yes**, still, rimmed | cut | the quiet: what is about to come down |
| 4 | Give · impact | 840 (600) | medium, Dutch 7° → 3°, easing out | `ult:give-strike` (contact 0.04): the cleaver over and down through the enemy's guard, the whole body after it; target `hurt`, shoved, tilted | crossroads lit, then settling | **the frame both ways**: two-tone 70ms, inverted for the stop (`give-glare` behind, `give-split` over); then the notched burst (`give-notch`) and **the run out** down the buried blade | `give-impact` + `ult-boom`; **150ms stop**; heavy shake | **yes** | cut on the frame | impact: `$damage`; "Your turn." |
| 5 | Take · face close-up | 680 (460) | on the face and the blade under the jaw, level, a slow drift | `ult:give-take` (`root: false`): the blade drawn up under the jaw, the palm laid across its spine; the garnet comes up the blade; head back, brow lifted, eyes shut on a breath in; then eyes open on a grin | crossroads, exposure 0.4 → 0.46, a rose rim | **the run back** up the blade into the palm (`runBack`); the scarlet gone from the steel | **the edge drawn**, falling (`give-take`), a breath, one note of the saw | no | cut | the take: the blood coming home; healing revealed (0.5) |
| 6 | Square · return | 700 (460) | battle camera | real Reaver `ult:give-settle`: the blade let down, the hand closed back into a fist; target `hurt` | battlefield, bars open | a scarlet run down the real enemy (`give-board` open), a garnet run up into the real Reaver (`give-board` home) | the saw's last two notes (`give-settle`); tail | on board | flash 80ms | release: the enemy open for the party, the Reaver whole |

## Framing

- **Boss** (`enemy=collector`): the crossroads pulls back (zoom 1.05) with the
  Reaver smaller in the foreground and the boss standing whole across the
  crossing below the title; the impact pulls back to the boss's height
  (zoom 1.12 → 1.04) with the Reaver smaller, the blade into its robe and a
  short shove. The quiet needs no override: the boss's chest and hands fill
  the frame under the bead.
- **Large** (`enemy=bulwark`) plays the normal framing, which holds it whole.

## FAST

Keeps all seven shots, shorter (63% of FULL). The crossroads is cut to 480ms
(the title rides it); the oath, the quiet, the impact and the take keep their
shape. A clip plays at one speed in both cuts, so the oath's run reaches the
point by 432ms and the take's garnet reaches the palm by 397ms, inside FAST's
440 and 460, and both hold in FULL. The frame's invert starts on the stop in
both cuts.

## Voice

"I bleed, you bleed." · "Your turn." · "Square."

## Measurements

**Performance** (dev build, `GPU=1 scripts/profile-ultimate.ts 5531 1920x1080
"hero=reaver&evo=rvr-bloodbound"`, shared machine at load average ~25): film
p50 16.7ms / p95 33.3ms, 8 frames over 34ms; the round after it p50 16.7 /
p95 49.9, 14 over 34ms. An earlier run at load ~20 gave the film 16.7 / 33.4
and the round 16.7 / 33.3. Peak 1136 nodes (1057 SVG), 1 live effect, no
filtered elements. The first cut peaked at 1528 nodes; the crossroads' turf
tufts and flints were halved.

**Levels**, rendered offline in the browser (`OfflineAudioContext`, peak /
RMS): `give-impact` 1.19 / 0.088 (A Good Hiding's `hiding-impact` 1.22 /
0.091, Red Ledger's `ledger-cut` 1.18 / 0.085); the motif 0.21 / 0.042
(`hiding-motif` 0.28 / 0.032); the edge drawn, out 0.50 / 0.007 and back
0.24 / 0.011; the wind 0.07 / 0.005; the quiet 0.01 / 0.001 (`hiding-hush`
0.03). The first render had the drawn edge at 0.005 RMS and the wind at 0.02
peak, both too faint to hear under the music; both were raised.

## Face and whole-body motion

The close-ups act with `face()`: `ult:give-oath` (brow lowered 1.6 and the
teeth widened as the palm goes to the edge), `ult:give-take` (brow shelf
lifted 1.2 with the eyes shut to 0.35 on the breath in, then open on a grin,
knit never over 3°; the browser test holds the brow's tilt under 5°), and
`ult:give-strike` roars on the contact.

Root keys, authored for the shot each plays in: `ult:give-call` and
`ult:give-settle` (battlefield size: a dip and a rise, ≤ 3°);
`ult:give-hold` (3–4.5° lean, for the over-the-shoulder at 880);
`ult:give-raise` (−2°, still); `ult:give-strike` (x 0.09–0.1, rotate 12–13°,
squash 0.87, scale 1.04, for the medium impact). **`root: false`** on both
close-ups, the oath and the take: the oath's root is a hair, the take's
carries the strike's lean (x 0.07, 8°), which would carry the face out of the
frame. Nothing is rebuilt on `.cine-look`.

## Notes from the lab

- **The hand is drawn over the blade.** The open palm first lived in the
  fist's group, under the cleaver arm, and was invisible under the blade in
  every shot. It is now its own group after the cleaver in the drawing,
  placed in the drawing's units by its own keys (`hand()` in `poses.ts`),
  solved from the blade's axis: grip at the back shoulder plus the grip's
  offset turned by the cleaver's rotation, the blade at 142° + that rotation.
- **The run was a red slab.** Drawn the blade's full width it turned the
  cleaver into a red bar; it runs along the lower flat now, above the notches,
  so the steel shows above it.
- **The drawn frame was unreadable twice.** A `difference`-blended half-frame
  was the first idea (the picture split along the blade, one half inverted):
  a blended element in a layer blends only inside its own stacking context, so
  it painted a white half over nothing. At the night's exposure the two-tone
  turned everything ink. It is now the engine's two-tone and then its invert
  over the stop, with a flat chalk field behind the figures for the length of
  the frame.
- **The quiet showed the Reaver's legs, then its arm and sash.** The blade is
  held level from a Reaver standing off the right of the frame (face −1, so
  the torso is away from the blade), 1300 tall, with the hand dropped out of
  the picture.
- **The take could not hold both face and blade** with the blade down in the
  enemy (the point was 500 units below the jaw); the blade is drawn up under
  the jaw at 240°, where the garnet can be seen coming up it.
- **A worn weapon replaces the cleaver**, and the runs were clipped to the
  base blade; the clip is now a later sibling of the base weapon, so when the
  base is hidden (`style="display: none"`) a CSS sibling rule swaps the blade
  outline for a band along the same axis.
- **Films merged while this was authored:** Hallowed Ground (the Sanctifier's
  cold casting floor, a line scored and lit). It owns no crossroads, blade,
  blood or hand; nothing here was changed for it.

## What the engine could not do, and what was built instead

- **One impact reveal.** The Reaver's 12 HP price is revealed with the blow
  (`impact`), and the 26 back with the take (`ward` covers healing), so the
  board shows the order the pact runs in; the price cannot land in the oath,
  where it is paid. The engine would need a reveal filtered by target.
- **No status beat.** Vulnerable on both parties logs no beat; the board's
  chips carry it, and `give-board` draws the run on each.
- **No blend across layers.** A `mix-blend-mode` effect in a film layer blends
  only inside that layer, so a split frame (one half inverted) is not
  possible; the swapped two-tone runs across time instead of across the
  frame. The engine would need a screen accent with a clip region (a
  half-plane) or a blended layer inside `.cine-film`.
- **Equipment state is not exposed to a drawing.** Whether a worn weapon
  replaces the base is read by a CSS sibling selector on the base weapon's
  inline style; the engine would need `BaseWeapon` to expose a data attribute
  or a hook.
- **A clip plays at one rate in FULL and FAST**, so the oath's run and the
  take's garnet are timed to FAST and hold in FULL.
- **Paused lab frames skip the hit-stop**, so a still of the FAST frame at
  0.06 catches the chalk field fading; in play the stop holds it.

## Where it is weakest

- **The take's garnet is dark on a dark blade.** Coming up the blade it reads
  as blood moving towards the hand, but it is the quietest colour in the film
  on its smallest element; a brighter sheen or a slower run would sell *back*
  harder than the face does.
- **The hand is pasted on.** The open palm is placed on the blade by its own
  keys, not carried by the arm, so the forearm under the blade and the hand
  over it do not quite join; in a close-up it reads as a hand pressed on the
  steel, not as an arm reaching round it.
- **On the drawn frame the two figures overlap** into one accent mass at the
  contact; the silhouettes separate at the Reaver's head and the hound's tail,
  but the blade itself is lost in the fill, and the cut line does the work.
- **The quiet is framed around a blade whose owner is off screen**, which
  reads as menace but leaves the left third of the frame empty dark.
