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

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, with the
path's stub still `null` (the Bloodbound on Red Ledger) and then with Give and
Take: see *Measurements*.

## Space, palette, sound

- **Space: the gallows crossroads on the chalk down, at night.** Two chalk
  tracks cross on a bare down under a torn sky with a few hard stars. At the
  crossing a fingerpost leans with two arms pointing opposite ways, their
  lettering long weathered off. Behind it an empty gibbet stands on a barrow
  mound, its iron cage hanging from its chain, and a single thorn is bent flat
  by the wind. The chalk of the tracks is the only pale thing; the turf and
  the downs are ink. A crossroads is where a bargain is struck, and a
  fingerpost there points both ways. Not a hall, forge, vault, gate, storm,
  ridge, causeway, wood, mirror room, counting house, cutaway, labyrinth,
  no-man's-land, meadow, hound run, spillway, sink, held fall, proof range,
  harbour flats, white roofs, page, theatre, burying ground, shedding ground,
  mere, snowfield, sand pit or tannery loft. No top light, no sand, no stakes,
  no hides, no moon.
- **Palette:** night `#0b0d16`, turf `#15191c`, chalk `#d9d3c4`, a cold star
  rim `#b9c6d8`, and two bloods: **scarlet** `#e8243c` for the Reaver's, going
  out, and **garnet** `#7a1030` with a rose sheen `#ff8fb0` for the enemy's,
  coming back. The accent `#e0466f` sits between them. Red is never a mark
  painted on anyone (Red Ledger's) and never a light: it is only ever
  something running.
- **Signature effect — the run.** Blood running along a blade, drawn as a
  liquid: a glossy ribbon with a swollen, bright head (the meniscus), a hard
  highlight along its length and a thin tail, laid on the blade's own flat and
  clipped to it, advancing along it. **Out** is scarlet, from the palm to the
  edge and down into the wound; **back** is garnet, from the wound up the
  blade to the palm, head first. It is the same drawing both ways, and the
  film is built on it: the oath (out, along the edge under the palm), the
  impact (out, into the enemy), the take (back, up into the hand), the board
  (a run down the enemy, a run up into the Reaver).
- **The drawn frame — the split.** The impact's accent frame is cut in two
  along the blade: both halves go to two tones, one half inverted, so the
  Reaver's side and the enemy's side swap light and dark across one line, and
  the scarlet run lies along that line in colour.
- **Motif (original):** a bowed saw — a steel blade made to sing — over a low
  bowed drone: E4, B♭4, E4, then E3 under it. Out a tritone and back again,
  a palindrome: the tune runs both ways. Not a drum and string (Red Ledger),
  not a mallet on a string (A Good Hiding), not a horn, bell, music box,
  marimba, chime, reed, pipe or voice.
- **Signature sound: the edge drawn.** A palm drawn along a blade: a steel
  whisper whose pitch climbs as it goes out; its answer in the take is the
  same whisper falling, coming back.
- **Impact, layered:** a cleaver's crack (transient), a sub drop, the blade's
  ring and a wet thock (body), and the wind coming back over the down (tail).
- **The quiet:** music at 3%; the wind drops out; one creak of the
  fingerpost; a single bead of scarlet swelling on the edge over the enemy.

## Rhythm

identity (the fist opens, the bandage falls, the palm is laid along the edge,
the scarlet runs out along it: "I bleed, you bleed.") → stakes (over the
Reaver's shoulder across the crossroads at the real enemy, the fingerpost
pointing both ways between them; title) → **quiet** (the real enemy under the
raised blade, dead still, a bead of scarlet swelling on the edge over it) →
**impact** (the split frame; the cleaver through the enemy's guard, the run
going down into it) → the take (the Reaver's face as the enemy's blood comes
up the blade into its palm; the healing revealed) → release (the real board:
a run down the enemy, open for the party; a run up into the Reaver).

## Shots — FULL 4700ms, FAST 3000ms (64%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Reaver `ult:give-call`: the cleaver swung up off the floor to lie across the body, the fist brought to it | real battlefield goes to night indigo, bars close | chalk-pale call aura | call bell; the palm slapped flat on steel (`give-ring`); music ducks | on board | — | break the round |
| 1 | Oath · extreme close-up | 700 (440) | on the blade across the chest and the hand, Dutch −8° → −5°, pushing along the blade | `ult:give-oath` (`root: false`): the bandage slides off, the fist opens into a hand, the palm is laid flat along the edge and drawn down it; the brow lowers, the teeth set | crossroads, low exposure, cold star rim | the bandage falling (`unwrap` part); the open hand (`palm` part); **the run, out**: scarlet wells under the palm and runs along the edge to the point (`run` part) | `give-oath`: linen, a hand on steel, **the edge drawn** (rising); "I bleed, you bleed." | no | black 70ms | identity: the one time the fist opens, and the price |
| 2 | Crossroads · over-the-shoulder | 920 (480) | past the Reaver's shoulder across the crossing, slow push | `ult:give-hold`: the cleaver held out at the enemy, point down, the open hand at its spine | crossroads, wide: tracks, fingerpost, gibbet, thorn, stars | the run held at the point; wind over the turf (`give-wind`) | **motif**; wind | **the real target** far across the crossing, lit cold, bracing (`anticipate`) | cut | stakes; title |
| 3 | Under the blade · target (the quiet) | 520 (340) | low, level, dead still, on the enemy | — (the raised blade's edge in the top of the frame, the Reaver off screen) | exposure 0.14, vignette, a cold rim on the enemy | **one bead of scarlet swelling on the edge over the enemy** (`give-bead`); nothing else moves | music 3%; the wind cut; one fingerpost creak | **yes**, dead still, rimmed | cut | the quiet: what is about to come down |
| 4 | Give · impact | 840 (600) | medium, low, Dutch 7° → 3°, easing out | `ult:give-strike` (contact 0.04): the cleaver over and down through the enemy's guard, the whole body after it; target `hurt`, shoved, tilted | crossroads lit, then settling | **the split frame** (`give-split`, 70ms); then **the run, out**, down the buried blade into the wound; chalk kicked up (`give-chalk`) | layered cut (`give-impact`) + boom; **150ms stop**; heavy shake | **yes** | cut on the split | impact: `$damage`; "Your turn." |
| 5 | Take · face close-up | 680 (460) | on the face, the blade's spine and the palm laid on it, level, a slow drift | `ult:give-take` (`root: false`): the palm pressed on the spine; head tips back, the brow lifts, eyes half shut, a long breath in; then eyes open and the grin | crossroads, low exposure, warm rose rim from the run | **the run, back**: garnet coming up the blade head first into the palm (`run` part) | **the edge drawn, falling** (`give-take`); a breath in | no | cut | the take: the blood coming home; healing revealed |
| 6 | Square · return | 700 (460) | battle camera | real Reaver `ult:give-settle`: the blade let down to the floor, the hand closed back into a fist | battlefield, bars open | a scarlet run down the real enemy (open), a garnet run up into the real Reaver (`give-board`) | the motif's last two notes; tail | on board | flash 80ms | release: the enemy open for the party, the Reaver whole |

## Framing

- **Boss** (`enemy=collector`): the crossroads pulls back so the boss stands
  whole across the crossing and the Reaver's shoulder is smaller in the
  foreground; the quiet frames the boss's head and chest under the blade; the
  impact pulls back to the boss's height with the Reaver smaller, the blade
  into its robe, the shove small.
- **Large** falls between.

## FAST

Keeps all seven shots, shorter. The crossroads is cut to 480ms (the title
rides it); the oath, the quiet, the impact and the take keep their shape. A
clip plays at one speed in both cuts, so the oath's run reaches the point and
the take's garnet reaches the palm inside FAST's cut and hold in FULL.

## Voice

"I bleed, you bleed." · "Your turn." · "Square."
