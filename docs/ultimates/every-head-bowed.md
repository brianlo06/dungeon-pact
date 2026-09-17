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

## Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, on
`28c367f`: first with this path's stub still `null` (the Blightcaller on Green
Reckoning), then with Every Head Bowed.

| Win rate | off | on, stub (Green Reckoning) | **on, Every Head Bowed** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 88% | **88%** |
| 3 players | 94% | 96% | **96%** |
| 4 players | 92% | 96% | **95%** |
| all | 91% | 95% | **95%** |

The Warden's uses per run 1.86 → 2.09 (the bot holds a heal for a party in
trouble; a force Ultimate it spends when there is enemy left to spend it on).
Charge earned 220 → 239.

## Notes from the lab

- **The heads look at the real lantern.** `bowed-field` reads the flame of the
  caster copy's `lantern` part every frame (once a frame, cached on
  `document.timeline.currentTime`: three effects ask, and each read after
  another effect's writes was a forced layout — the first profile ran p50
  33ms against the round's 16.7), turns every head towards it with its own
  lag, and lights it by its distance from the flame. Plants are laid out in
  fractions of the frame that shoots them, so a set follows its camera.
- **The first two-tone frame was black on black.** The field after sundown is
  dark and the filter took everything to ink. `bowed-glare` flares the
  lantern's light down the row behind the enemy on the contact, so the drawn
  frame is the bowed heads and the bent row cut out against amber, and the
  held frame after it shows them lit.
- **Hung heads first read as black mushrooms, then as clocks, then as eyes.**
  A disc facing the ground is a flat cap in profile; the dotted mould ring
  read as a clock face and a pale centre as an eye. The neck now arches over
  and the head hangs off the arch, widening towards the lens as it falls,
  with shrivelled brown petals and a few grey specks — no rings, no pale
  middle.
- **Blight on the figure.** A clipPath may hold only shapes, so the first
  clip (groups copied from the drawing) clipped everything away. The target's
  drawing is now flattened into shapes with each one's transform baked in,
  and a black coat and irregular lesions with a dull grey bloom are drawn
  inside it — in the target copy's `.cine-look` in the film, and over the real
  figure's box in the return. Big pale blooms read as cow-print; they are now
  dark and small.
- **gear=kit takes the lantern away.** A worn weapon replaces `BaseWeapon`,
  and the lantern is inside it. The film hangs a copy of the lantern's own
  drawing from the highest point of the worn weapon (measured in the staff
  arm's units) and keeps it plumb, in the film's copy only.
- The healing hand's mote is put out on the film's copy: that hand does
  nothing here.
- **Root keys.** `ult:bowed-raise` (battlefield: rises 0.014, leans −1.2°),
  `ult:bowed-swing` (the wide: weight shifts x ±0.014, ±2°),
  `ult:bowed-down` (the impact: stoops y 0.028, rotate 7°, squash 0.965 on the
  contact) and `ult:bowed-rest` (battlefield settle). The close-ups
  `ult:bowed-lift` and `ult:bowed-hush` keep a still root and are cued
  `root: false`. Nothing is built on `.cine-look` except the blight overlay
  (an appended node, no transform).
- **The staff turned over.** On the contact the staff arm is at 146°, crook
  down, so the lantern sits on the dirt at the Warden's feet: the staff that
  points up, pointed the other way.
- **Sounds**, rendered offline (peak / RMS): `bowed-impact` 1.23 / 0.160
  against `green-impact` 1.28 / 0.161, `bone-snap` 1.17 / 0.160 and
  `mourn-impact` 1.32 / 0.156; `bowed-motif` 0.19 / 0.045 against
  `green-motif` 0.20 / 0.036 and `mourn-motif` 0.19 / 0.047; the quiet's
  `bowed-hush` 0.04 / 0.007, the dusk crickets 0.03, on purpose.
- **Lead review revision.**
  - *The row did not bow.* Every flower went down and the enemies stood as
    they were, only blotched. Folder poses reach heroes only, so
    `bowed-blight` bends each target copy itself on the contact: its drawing
    (`.cine-look`, from its feet) pitches 19° towards the lantern, hunches 15%
    and sinks; its head part (`head`, `visor` or `snout`) drops 32° and the
    part it leads with (`gun`, `ram`, `key`, `jaw`…) sags 12°, written with
    the individual `rotate`/`translate` properties so they compose with the
    animator's own transform and `hurt` still plays through. The first target
    is fully bowed on the contact frame, the rest a beat behind; held at 88%
    to the late frame. A boss bows at 62%: a slump and a hung head. The actor's
    own `toTilt` is only a drift now.
  - *Performance.* A per-head composited box was slower still (p50 33). Two
    real costs, found by hiding one layer at a time per shot: the background
    (230 far heads, 29 furrows and 9 clouds as separate nodes, re-rastered as
    the camera moves) and the field's node count. The background is now five
    paths; each band of the field is one path per colour (calyx, petals,
    disc, eye, six shade levels, dry petals, rot, specks, three stalk widths
    and the leaves), rebuilt as strings once a frame with every head's shapes
    pushed through its own transform. The bow's settle is 60ms instead of
    280ms, so the field is still, and unwritten, after it.
  - *The lantern* in the film's copy is drawn for a close-up (a cap and ring,
    a thin iron frame, amber glass with a highlight, the flame inside);
    the board's box and cross stand down only there.
- **Profile** (`GPU=1 profile-ultimate.ts`, 1920×1080, dev build, film and the
  round after it in the same run, load 15–36 on a shared machine), three runs:

  | run (load) | film p50 / p95 | film over 34ms | round p50 / p95 | round over 34ms |
  | --- | --- | ---: | --- | ---: |
  | 1 (17) | 16.7 / 66.6 | 16 | 16.7 / 50.0 | 16 |
  | 2 (15) | 16.7 / 100 | 16 | 16.7 / 116.6 | 22 |
  | 3 (36) | 16.7 / 50.1 | 11 | 16.7 / 83.3 | 24 |

  Peak 826 nodes (772 SVG), down from 1301; 2 live effects at peak, no
  filtered elements. Per shot (same tool's frames, split by `data-shot`,
  load 20): lantern, field, hush, bow and return all p50 16.7; the field
  51 frames in its 1000ms, p95 33.4; the bow's slow frames are its 150ms
  hit-stop.

## What the engine could not do, and what was built instead

- **An Ultimate's status effects do not put a unit in the cast**, but this one
  bites (10 through armour), so the row is the real cast. The bite is honest
  gameplay — the blight's first bite ignores Guard like its poison — not a
  workaround.
- **Poison, Weak and Vulnerable leave no beat.** The reveal punches only the
  damage; the film draws the rest on the figures itself (the blight on the
  silhouette, the bow).
- **A row's reactions land together.** The blight overlays are staggered
  inside `bowed-blight` (6% of the shot per target) and in the return by the
  anchor's `stagger`.
- **Presentation copies do not carry statuses from before the cast**, so a
  row that was already Poisoned (and rots through, Vulnerable) looks the same
  in the film as one that was not.
- **A worn weapon hides the lantern** (above): the engine would need the base
  weapon's parts to be available to a film when a weapon replaces them, or a
  per-hero "carried light" mount.
