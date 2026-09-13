# Sunblind — Ranger · Gloomstalker

**The idea, in one sentence:** the Gloomstalker puts the low sun at its back
and looses a volley out of the glare, where every enemy is squinting and
nothing can be seen, so the only warning the row ever gets is the arrows' own
shadows racing across the white roof to its feet a heartbeat before the arrows
that cast them.

Only the Gloomstalker could have it. The path's title is the plot: *They
should not get to see it coming.* It traded the Ranger's patience and
visibility for speed and concealment (+3 speed, −6 HP), and the Ranger's
volley for **Shadow volley** (a whole row, Vulnerable). The drawing supplies
the kid: the smallest, youngest figure in the party, in a patched hood, with
a bow taller than it is. What not being seen means to a kid is not hiding in
the dark, where everyone looks for a thief. It is standing where nobody can
bear to look. A kid knows you cannot look at the sun. So the Gloomstalker
**hides in it**. The enemy is looking *at the light*, which is where the kid
is. And what the row sees last is not the kid and not the arrows. It is
their **shadows**.

The name is the gloom the kid really works in: shade. This is the brightest
film in the game, and the only dark things in it are shadows cast by a hard
sun. That is deliberate. It never goes dark, never shows a figure against a
night sky, and its quiet is a stopped-down glare, not a black screen.

## Gameplay (`ultimate-defs/rng-gloomstalker.ts`)

Target an enemy row, cost 100, **speed 24** (the fastest Ultimate in the
game):

1. the sun is in every enemy's eyes: **every enemy is Vulnerable this round**;
2. the row the volley falls on is **Vulnerable for two rounds**, applied
   *before* the arrows land, so the volley itself lands a quarter harder;
3. **18 precision** on every enemy in that row, which cashes in every Mark the
   party left there (EXPLOIT on each);
4. **+2 Focus**.

| | The Hundredth Mark (base) | **Sunblind** (Gloomstalker) |
| --- | --- | --- |
| Marks | lays one on **every** enemy for the party | lays **none**; **spends every Mark in the row** at once |
| The strike | one arrow, 24 through armour, on the target | a volley: 18 precision on **every enemy in a row**, no armour pierced |
| What it leaves the party | Marks to Exploit | an **opening**: every enemy Vulnerable this round, the struck row next round too |
| Order | speed 16 | **speed 24**: before every other Ultimate, so the party's own Ultimates that round land on Vulnerable |
| Focus | +2 | +2 |

It differs in what it does, not only in numbers. The Hundredth Mark is
patience made visible: it marks everything and finishes one. Sunblind is
unseen and fast: it marks nothing, pierces nothing, and turns the party's
setup into a whole row's damage in the first instant of the round, then
leaves the whole enemy side open. It is not False Footing (snare, Weak,
windups broken on Marked quarry): nobody is Weak, nothing is interrupted, and
nothing about it is defence. It is a team play two ways: Marks from a Quarry
sign, a Snare, a Hunter's sign or another Ranger are Exploits the volley
cashes, and every other hero's blow, and every other Ultimate queued that
round, lands on Vulnerable.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, stub
`null` and then Sunblind:

| Win rate | off | on, stub (Hundredth Mark) | **on, Sunblind** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 83% | **83%** |
| 3 players | 94% | 95% | **95%** |
| 4 players | 92% | 93% | **93%** |
| all | 91% | 93% | **93%** |

Nothing moves, because the Cipher is the deepest mentor and the bot trains a
Ranger into the Gloomstalker almost never in that sample (Ranger charge per
run 330 → 329 is the only difference). So it was weighed head to head, as
False Footing and Eyespot were: every Ranger plays one Ultimate's effects
whatever its path, on every 2nd composition with a Ranger in it, 10 seeds
(820 runs each; "no Ultimates" turns every class's off):

| Every Ranger plays | 2p | 3p | 4p | all | Ranger uses / run |
| --- | ---: | ---: | ---: | ---: | ---: |
| no Ultimates | 75% | 94% | 92% | 91% | — |
| The Hundredth Mark | 75% | 95% | 94% | 93% | 2.99 |
| False Footing | 83% | 99% | 96% | 96% | 3.15 |
| Sunblind, no field-wide Vulnerable | 70% | 94% | 94% | 93% | 2.91 |
| Sunblind at 14 | 70% | 95% | 93% | 92% | 2.97 |
| Sunblind at 22 | 68% | 96% | 94% | 93% | 2.88 |
| **Sunblind (18, shipped)** | **73%** | **95%** | **94%** | **93%** | **2.91** |

Level with the Hundredth Mark overall. Damage between 14 and 22 moves nothing
measurable; duos move two to five points between cuts, which at 164 duo runs
is noise. It sits under False Footing, whose defence is worth more to the bot
than any damage.

Tests: `tests/ultimates-sunblind.test.ts`.

## Space, palette, shape

- **Space: the white roofs, in the afternoon glare.** The flat, whitewashed
  roofs of a hill town under a hard low sun: a tall block the kid has climbed,
  a ladder still leaning on it; an alley between in blue shade; a lower
  terrace roof with a parapet, clay water jars and a drain spout, where the
  enemy row stands; and beyond, roofs stepping away to a bleached sky. It is
  the one film in daylight and the brightest space in the game. Not fog or a
  wood (the Hundredth Mark), not mud at dusk (False Footing), snow (Warpath),
  sand in a pit (Red Ledger), a ridge at dusk with a low sun on the horizon
  (Anthem), a moonlit meadow (Eyespot), a dark chamber (Still Life), a hall,
  forge, causeway, vault, mere, page, labyrinth, cutaway, no-man's-land, mirror
  room or theatre. The sun here is never a disc sitting on a horizon: it is a
  blinding blot high over the kid's roof, too bright to have an edge.
- **Palette:** plaster lit `#f4ecd6`, glare white `#fffbea`, a bleached sky
  going from white-gold round the sun `#fbf0c8` to pale grey-blue away from it
  `#d3dfe2`; shade on plaster `#8e98c4` and hard cast shadow `#3a4478` (cool
  shadows under a warm light), ink `#161a2c`; clay `#c98a4e` for jars. The
  accent, sun lemon `#ffe45c`, is kept for the sun and the title. Figures are
  lit hard from the left, the side the kid and the sun are on.
- **Shape language:** the **shadow** (a hard-edged dark shape lying on white
  plaster, longer than what cast it); the **glare** (a white bloom with long,
  uneven, hand-cut spokes, never a photographic flare); the **arrow** (the
  Ranger's own, red-fletched, taken from its hand, standing in stone).

## Signature effect — the shadows arrive first

With the sun low behind the archer, an arrow high in the air throws its
shadow far ahead of it along the ground; as it falls, the arrow catches up
with its shadow exactly where it lands. So the volley is seen from the row's
side only as **a comb of thin, sharp shadows sliding over the white roof
towards its feet**, and then **the arrows standing in the shadows' ends**. Every
enemy's own shadow is drawn too: a copy of the real figure laid flat along
the roof behind it, because the light is in its eyes.

## Sound

- **Motif (original):** four struck tubes of a rooftop wind chime, long and
  inharmonic: B5, F♯6, E6, then a low B4 left ringing. Struck metal tubes that
  ring for seconds, not coins (Foreclosure's short clinks), not a music box,
  not plucked (the Hundredth Mark), not a damped bar (False Footing).
- **Signature sound:** the volley falling out of the sun: a soft rush of many
  fletchings, pitched downward, that thickens as it comes and cuts dead at the
  impact.
- **Impact, layered:** a rapid run of dry *thocks* as heads bite plaster
  (transient), a sub drop, a crack of plaster and a spray of chips (body), and
  chalk dust sifting down with the chime's low B4 left ringing (tail).
- **The quiet:** music at 3%; no chime; a faint high hiss of heat off the
  roof, and the rush of the falling volley so soft it is almost nothing.

## Rhythm

identity (the kid slides its head in front of the sun: the glare goes out
behind the hood, the squint opens, a grin) → stakes and target (from far off,
the whole roofscape: the row on the terrace squinting into the sun, and in
the sun, if you look hard, a kid drawing a bow; title) → escalation (from
below the kid: four arrows loosed straight up in one breath; the sun flares
across the lens) → **quiet** (at the row's feet, stopped down: thin shadows
sliding over the white plaster towards them, and the row still looking up
into the light) → **impact** (the arrows standing in the ends of their
shadows, all along the row; plaster chips and chalk dust) → release (the real
board: every enemy standing in a hard pool of sun with its shadow thrown long
behind it, the struck row stuck round with arrows).

The kid is never in a shot on the row's side of the roof. The row never sees
it, and neither does the camera, once it is with them.

## Shots — FULL 4700ms, FAST 2440ms (52%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Ranger `ult:sb-crouch`: drops low, the hood pulled forward, the bow brought in | real battlefield bleached hot, bars close | lemon call aura; a glare blooms behind the real Ranger (`sb-sun`, anchored); a hard pool of sun lands under every real enemy and its shadow swings out long behind it (`sb-board` call) | call bell; `sb-glare` (a hot shimmer rising); music ducks | on board | — | break the round: the light turns hard |
| 1 | Eclipse · face close-up | 620 (400) | tight on the face, level, a slow push; the sun just left of the head | `ult:sb-eclipse` (`root: false`; the cue slides the figure left): squinting hard in the glare, brow knit, mouth tight; the head comes across in front of the sun; the eyes open wide in its own shade, the brow lifts, one corner of the mouth goes up | the glare sky over the roof's edge; exposure high, then down as the sun goes behind the hood; a hot rim round the hood; bounce light from the roof below | the sun (`sb-sun`, back) swallowed by the hood; spokes of glare round its edge | `sb-eclipse`: the shimmer drops to a hush as the sun is covered; "Don't look at me. Look at the sun." | no | black 50ms | identity: the kid hides in the one place nobody can look |
| 2 | Glare · target wide | 1000 (—) | wide over the roofs, a slow truck right | the kid small on the high roof at the left, inside the sun, `ult:sb-rise`: stands, bow raised high, draws | the white roofs, lit hard from the left; the sun over the kid's roof | the sun in front of the kid (`sb-sun`, front) so the kid is a notch in the glare; **the real row** on the terrace, each with **its own shadow laid long behind it** (`sb-cast`); heat shimmer off the roof (`sb-heat`) | **motif** (chimes); a bow creak | **the real row**, squinting into the light (`anticipate` at 0.5) | cut | stakes and target: they are looking right at it; title |
| 3 | Loose · low angle | 560 (360) | from below the kid, Dutch 9° → 5°, rising | `ult:sb-volley`: the bow tipped up at the sky, four draws and looses in one breath, the hand snapping back to the quiver between | glare sky, the sun behind the kid's shoulder, hot rim | each loosed arrow (the real arrow from the hand) climbs out of the bow and is gone into the sky (`sb-loosed`); at the end **the sun flares across the lens** (`sb-flare` in) | `sb-loose`: four string snaps and hisses | no | cut | escalation: speed, and the volley already in the air |
| 4 | Shadows · the quiet | 600 (400) | at roof level on the row's feet, locked off | — (the kid is not on this side) | the terrace at plaster level; exposure 0.8 → 0.4: the glare stopping down; vignette | the flare leaves the lens (`sb-flare` out); **a comb of thin shadows slides over the white plaster towards every enemy's feet** and slows as it comes (`sb-shadows`); the row's own shadows behind it (`sb-cast`) | **music 3%**; `sb-hush`: heat hiss and the faintest rush | **yes**, from the knees down, still, looking up into the light | in-folder: the flare (`sb-flare`) | the quiet: what the row sees last, and does not look at |
| 5 | Volley · impact | 760 (560) | medium wide on the row, level, easing back | — ; the row `hurt`, shoved, tilted | the terrace and the roofs, blown out then settling; the sun high at the upper left | **two-tone frame (40ms)**, then held in colour: **the arrows standing in every enemy and in the ends of their shadows** (`sb-volley`, the real arrow, staggered along the row), their streaks back to the sun; **chalk dust and plaster chips** bursting in three drawings (`sb-chips`); the row's shadows (`sb-cast`) | `sb-fall` into `sb-impact`; **150ms stop**; heavy shake | **the row** | cut on the two-tone | impact: the volley and the damage on the held frame; "Heads down!" |
| 6 | Sunstruck · return | 740 (480) | battle camera | real Ranger `ult:sb-lower`: stands, pushes the hood back | real battlefield; the bleach lifts; bars open | **every real enemy in a hard pool of sun with its shadow laid long behind it** (Vulnerable); **the struck row stuck round with arrows, each with its shadow** (`sb-board` struck) | `sb-after`: the motif's last two chimes; dust; tail | on board | flash 80ms | release: the whole side open, the row struck |

FAST drops the wide; the title moves to the loose. It keeps the eclipse, the
volley loosed, the quiet with the real row in it, and the impact.

## Voice

"Don't look at me. Look at the sun." · "Heads down!" · "They never even
looked up."

## Framing

- **Large and boss.** The wide pulls back and sets the boss further along
  the terrace so it stands whole with its shadow. The quiet frames a boss from
  the shins down, the shadows arriving at its feet at its scale. The impact
  pulls back to take in the boss whole, with larger arrows, and a small shove.
- **Row size.** Every cinematic shot lays out one to three enemies along the
  terrace, each with its own shadow, shadows and arrows placed from where the
  stage really put each figure.
