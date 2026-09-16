# Every Head Bowed — Warden · Blightcaller

**The idea, in one sentence:** everything that grows turns its face to the
Warden's lantern, the only light the party carries — so the Blightcaller lifts
it over a field of ripe sunflowers until every head is turned up to it, then
sets the lantern down in the dirt, and every head goes down after the light:
the whole field bows and blackens at once, and the enemy row standing in it
bows with it.

Only the Blightcaller could have it. The Warden is drawn with "nothing else
carries a light" — a lantern swinging from the crook of a sprouting staff —
and its class is growth. The path's title is *Growth, pointed the other way*,
and its Blight is Briar prison turned from a cage into a rot that takes a
whole row. Growth reaches for light; that is what growing *is*. So this path
does not grow anything on the enemy. It takes the light down, and lets growth
do what it always does: follow. A head pointed at the dirt is a head that
rots. The row is a drilled row of a field; the enemy row is standing in it.

## Gameplay (`ultimate-defs/war-blightcaller.ts`)

| | Green Reckoning (Warden) | **Every Head Bowed** (Blightcaller) |
| --- | --- | --- |
| Target | self: the whole field | **one enemy row** |
| The party | healed 18, Regen, Burn/Poison/Weak cleared, the downed lifted | **nothing** |
| Every enemy | Poison 4 a round | only the chosen row is touched |
| The row | — | **10 through armour, Poison 10 for 3 rounds, Weak this round** |
| Already Poisoned | — | **rots through: Vulnerable for 2 rounds** (checked before the new Poison lands) |
| Growth | — | +2 |

Speed 10. It differs from Green Reckoning in what it does, not in numbers:
Green Reckoning is a sweep that spends most of itself on the party; Every Head
Bowed gives the party nothing directly and concentrates the Warden's whole
poison on one row, twice as hard as Blight itself, and bends that row over
(Weak) for the round it is called. The team play is the reactions from both
sides: a row the Blightcaller has already Blighted (or anyone has poisoned —
a Poison item, a reforged piece) is left Vulnerable for two rounds, so every
direct hit the party lands on it counts a quarter more — the Reaver's cleaver,
a Ranger's Exploit, the Arcanist's Chain Shock; and Weak on the whole row
blunts its attacks for the round the party needs it most. Poison ignores
Guard, and so does the blight's first bite.

## Space, palette, shape

- **Space: the late field.** A cultivated field of ripe sunflowers after
  sundown, in drilled rows running off to a low horizon under a heavy,
  close, starless overcast — blight weather — with one dull rust band where
  the sun went down. The heads are heavy with seed; the flowers stand taller
  than anyone in the fight. Nothing lights it but the lantern. Not a meadow,
  a wood of trunks, a clearing, the ground under the floor, a mere, a
  burying ground, a foundry floor, a hound run or a moonlit garden: no moon,
  no moths, no roots, no water, no graves, no bone.
- **Palette:** soot sky `#1a1712` over a rust band `#5b3522`; sunflower gold
  `#e3ae34` with seed-disc brown `#3b2412`; the lantern's own amber `#ffc15a`
  (from the Warden's drawing) as the film's only light, and the accent
  **tarnished gold `#d9a13c`**; and the blight — seed black `#110d09` with
  the white-grey bloom of head-rot mould `#d9d4c3`. No sap green, no
  duckweed, no juniper, no plum.
- **Shape language:** the disc (a face of seeds ringed with petals), the neck
  that turns it, and the hook the neck makes when it gives up and hangs; the
  lantern's pool of light.

Shares nothing with the Warden's other films. Not Green Reckoning's roots,
web, heartbeat, rot climbing or eyes opening (the eyes stay shut: the flowers
do the looking); not Mourning Water's tear, cupped hand, black water or
closing fist; not Living Bone's antler, bone, graft or white sky. The hand
that heals does nothing here — the other hand, the staff and its lantern,
does it all. Not Hallowed Ground's line scored in soot, nor Elegy for the
Standing's grave and shadow. Its signature is a field of faces following one
light, and bowing when it goes down.

## Rhythm

identity (from among the stalks, looking up: the lantern goes up on the
crook, and the nearest heads turn up to it) → stakes and target (the late
field, wide: the Warden at the field's edge with the light held high and
swung once, and every head in the field tracking it — the enemy row standing
among them, lit by the same lantern; title) → **quiet** (the face under the
hood, the lantern's light on it from above: the brow softens, then sets; the
light slides down the face as the lantern comes down; the crickets stop; the
music is gone) → **impact** (the lantern's foot meets the dirt: a drawn frame,
and every head in the field goes down at once, black; the row bows with them;
the blight lands on the row with the damage) → release (the real board: every
enemy of the row hung with blight, head bowed, a dead flower drooping at its
feet; the real Warden lifts the lantern back onto the crook).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Warden `ult:bowed-raise` — the staff arm goes up, the lantern lifts high on the crook, the head tips back | real battlefield sinks to soot, bars close | tarnished-gold call aura; a pool of lantern light on the real floor round the Warden | call bell; the lantern's chain creaks up; music ducks | on board | — | break the round: the Warden holds up the light |
| 1 | Lantern · low-angle detail | 620 (380) | from low among the stalks looking up at the crook, Dutch −7° → −4°, pushing in | `ult:bowed-lift` (`root: false`) — the lantern rises into the frame on the crook and steadies; the staff hand grips | the late field, black sky; amber from the lantern | `bowed-field` near heads, huge in the foreground, **turn their faces up to the lantern as it rises**; the lantern's light pool (`bowed-light`) | chain creak; a dry rustle as the heads turn; activation line | no | black 50ms | identity: the one light, and growth that follows it |
| 2 | Field · wide | 1000 (480) | wide and level, a slow truck left, Warden at the left third, the row at the right | `ult:bowed-swing` — the lantern held high and swung once across the field | the late field: rows to the horizon, rust band, soot sky; amber rim | `bowed-field` back and front bands: **every head tracks the lantern's real position**; the lantern's light pool | **motif** (four reed-organ notes); crickets; the rustle as the field turns | **the real row**, lit by the lantern, `anticipate` as the field turns | whip 120ms | stakes and target: the whole field faces the light — and so does the row; title |
| 3 | Hush · face close-up (the quiet) | 620 (400) | on the face under the hood and antlers, dead level, near still | `ult:bowed-hush` (`root: false`) — face: the brow lifts tender, then knits and sets; the shut lids press; a breath out through the moustache; the head bows | exposure 0.34 → 0.06, vignette 0.9; **the lantern's light slides down off the face** as it is lowered | nothing moves but the face and the light | music ducked to 3%; the crickets stop mid-chirr; a breath; the chain | no | cut | anticipation by subtraction: the decision to take the light away |
| 4 | Bow · impact | 800 (600) | low at the soil down a drilled row, Dutch 5° → 2°, easing out | `ult:bowed-down` (contact 0.1) — the Warden large at the left stoops and sets the lantern's foot on the dirt; targets `hurt`, shoved down and bowed forward | amber from the lantern at ground level, exposure spike then settling | **60ms two-tone** (black bowed heads on an amber glow); **every head snaps down, black, mould-white bloom on them**; `bowed-blight` on each target — black blight spreading on the figure from the shoulders with a mould rim; black seed falling | layered impact (the iron foot in the dirt, sub, the whole field's crunching collapse, seed patter tail); **150ms stop**; heavy shake | **the row**, bowed | cut | impact: the result on the frame; damage |
| 5 | Bowed · return | 760 (480) | battle camera | real Warden `ult:bowed-rest` — the lantern comes back up onto the crook, the head lifts | real battlefield; bars open | `bowed-board` on every real target: the blight on its own drawing, a dead blackened head drooping at its feet, seeds dropping, mould drifting | the motif's last note, low; seed patter; tail | on board | flash 80ms | release: which row is rotting, and bent |

FULL 4200ms, FAST 2580ms (61%). FAST shortens the wide (the idea: the field
turning to the light) and keeps the lantern, the quiet and the bow.

## Voice

"Look up, little ones. Here is your light." · "And follow it down." ·
"Heads bowed. It's warm in the dirt."

## Framing

- **Large and boss.** The wide and the impact are re-framed: the wide pulls
  back so a boss stands whole among the flowers under the title; the impact
  pulls back and sets the Warden smaller against the boss's height so the
  bowed heads still hang over a boss's shoulders and the blight on it reads,
  with a smaller shove (a boss bends, it does not fall over).
- **A row of one, a row of two.** The row is the real cast (`targets`) at its
  real footprints, spread along the drilled row.
