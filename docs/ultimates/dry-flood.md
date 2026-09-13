# Dry Flood (Arcanist · Pyromancer) — storyboard

**The idea, in one sentence:** the Pyromancer tips its spark over the lip of
a spillway that has been dry for years, and the fire goes down it the way the
water used to, step by step and faster than the water ever did, and floods the
basin where the enemy row is standing.

Only the Pyromancer could have it. The path's title is the plot: *Water was
always the slower answer.* The Arcanist is a water-and-lightning caster
(Cloudburst, then Storm needle); the Pyromancer is the one Arcanist who gave
up waiting for the water. So its fire is drawn doing water's job: poured,
running downhill, filling the low ground, and never once falling like rain.
The drawing supplies the gesture. The Arcanist has no staff; it holds its
spark out in a gloved **hand**, so the one thing it can do with fire is what a
hand does with anything in it: turn it over and let it go. The **hat's tip**,
which flops about on its own every round, is lifted by the heat for the first
time. It has **no face** under the brim, only two **eye-lights**, so the fire
lights it from below and it watches. The path's price supplies the ending:
eight health gone for three points of power, and the Ultimate burns its own
**sleeve**.

Fire is never a forge here (no molten rims, no embers, no red forge light, no
metal): it is drawn as tongues of flame, each with the spark's blue at its
root, that lean the way the fire runs and lick upward even while the fire is
pouring down.

## Gameplay

`src/content/ultimate-defs/arc-pyromancer.ts`, target an enemy row, cost 100,
speed 10:

| | Debt of Thunder (base) | **Dry Flood** (Pyromancer) |
| --- | --- | --- |
| Who | one target, and every enemy through the scope | **one row**, every enemy in it |
| Damage | 26 lightning on the target; Chain Shock 12 on the rest | **28 fire** on each enemy in the row |
| Over time | — | **Burn 8 for 3 rounds** on each (Burn stacks: on an Immolated row, 14) |
| Wet | **applied** to every enemy, and left for the party | **boiled off**: any Wet on the row flashes to steam for **10 more through armour**, and is gone |
| The party | the Wet to spend on lightning | **every burning enemy is Vulnerable this round**, in the row or out of it |
| Its price | — | the Pyromancer catches too: **Burn 3 for 2 rounds** |
| Mana | +3 | +2 |

It differs in what it does, not only in numbers. Debt of Thunder is patience:
it lays Wet on everyone, spends it on one target, and leaves the rest for the
party to spend later. Dry Flood lays nothing down for later. It hits a whole
row at once and keeps hitting it for three rounds; it *consumes* the Wet that
the Arcanist's whole kit builds, as steam, rather than saving it for a bolt;
and it opens the burning enemies to the party's blows now, not next round.
Burn over time where Debt of Thunder is burst; a row where it is a line; and
a cost on its own body where it had none.

Its team play is the reactions from the other side. A Tidecaller's Riptide, an
Arcanist's Debt of Thunder or the Pyromancer's own Cloudburst leaves Wet for it
to boil; its Vulnerable makes every ally's hit on the burning count a quarter
more that round, a Ranger's Exploit included; and the Burn it takes is a
cleanse for a Warden or a Herald to spend (Counterpoint, Green Reckoning).

Quick balance (`scripts/ultimate-report.ts 4 --sample=6`, 324 runs, same
machine), against the same sample with this path's stub still `null` (the
Pyromancer on Debt of Thunder): see *Balance* under the lab notes.

## Space, palette, sound

- **Space: the dry spillway.** The cistern's great stepped spillway, dry for
  years. A lip of dressed stone at the top with a black culvert mouth behind
  it; steps going down to a basin floor of cracked silt; and on the walls
  above everything, pale tide-lines at every height the water ever stood, one
  over another, far over the heads of the enemy row. Dead weed hangs dried
  black from every step's edge. Nothing in it is wet. Not a hall, a forge, a
  gate, a storm, a drowned ledger, a held fall, a ridge, a meadow, a wood, a
  causeway, a snowfield, a vault, the ground under the floor, a pit, a mere, a
  labyrinth, a no-man's-land, a mirror room or a page. Three drawings of it:
  `dry-lip` (the lip at a hand's scale), `dry-weir` (the whole spillway,
  side-on) and `dry-steps` (the steps from the basin, looking up).
- **Fire** (`dry-front`, `dry-pour`, `dry-flood`, `dry-burning`): tongues of
  flame in four flat layers, deep red, orange, gold and a pale core, with the
  spark's blue at the root; each tongue has three drawings and boils between
  them on its own beat. Smoke is drawn too (plum-black lobes lit orange
  underneath). No embers, no sparks, no glow but the lighting and small flat
  gradients.
- **Palette:** soot umber `#140d09`, silt bone `#cdbf9f` (the tide-lines and
  the dry stone), flame orange `#ff8a2a` (the accent), gold `#ffc63d`, deep red
  `#b8321c`, a pale core `#fff1c8`, and the spark's blue `#5fb2ff` only at the
  root of a flame. The Arcanist's storm blue is nowhere else.
- **Motif (original):** four notes on a low reed-like voice whose every note
  *flutters* (a fast tremolo, the way a flame does): A3, E4, F4, then D4 held
  and guttering out.
- **Signature sound:** the catch (`dry-catch`), the hollow *whump* of a flame
  taking hold, air pulled in and let go in one breath.
- **Impact, layered:** a dry crack (transient); a sub dropping (weight); the
  roar of the fire filling the basin, a wide noise band sweeping down (body);
  and crackle ticks over a long low rumble (tail).

## Rhythm

identity (the spark is turned over the lip and poured) → stakes and target
(the row standing in the dry basin, under the water's old lines; the first
light at the top of the steps; title) → escalation (racing down the steps
with the fire's front) → **quiet** (from behind the row, looking up the steps:
silhouettes, the air drawn up past them towards the light, no sound) → impact
(the fire comes over the last step and floods the basin through the row) →
release (the real board: the row still burning, and the Pyromancer beating
out its own sleeve).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Arcanist `ult:dry-catch`: the hand comes up and the spark catches | real battlefield sinks to soot, bars close | orange call aura; a drawn flame catches in the real glove (`dry-kindle`) | `dry-call`: a rasp and the catch; music ducks | on board | — | break the round |
| 1 | Lip · detail | 640 (400) | side-on at the lip, hat to hand and the drop below, Dutch 5° → 3°, slow push | `ult:dry-pour`: the arm out over the drop, the spark swells, the hand turns over and the spark goes; the hat's tip lifts in the heat; the head tips to watch (`root: false`) | `dry-lip`; lit from below by the fire | the spark as a flame on the glove (`dry-flame`), then poured: a ribbon of fire falling from the glove out of frame, its tongues licking upward (`dry-pour`) | `dry-catch`, `dry-pour` | no | black 60ms | identity: fire, poured like water |
| 2 | Basin · target | 900 (—) | on the row at the foot of the steps, slow push and rise | — | `dry-weir`; tide-lines far over their heads; the top of the steps starting to glow | the fire's front coming down the top steps (`dry-front`) | **motif**; a far roar growing | **the real row**, looking up (`anticipate` → `block`) | cut | stakes and target: where the water was; title |
| 3 | Run · projectile-follow | 560 (380) | bolted to the fire's front, racing down the steps, Dutch −14° | — | `dry-weir` | the front: tall leaning tongues, a sheet of flame over every step it crosses, smoke trailing (`dry-front`); smoke rolls across the lens at the end (`dry-smoke-wipe`) | `dry-run`: roar with a whump at every step | no | cut | escalation: faster than water |
| 4 | Draw · the quiet | 520 (380) | from behind the row, level, locked, up the steps | the row held in silhouette | `dry-steps`; exposure right down; light along the top step only | the smoke clears off the lens; the air drawn up the steps past them, thin streaks of silt and one dry leaf, towards the light (`dry-draft`); the light along the top edge creeping (`dry-crest`) | **music ducked to 5%**; the air drawn in, then nothing (`dry-draw`) | **the row**, silhouettes, holding | the smoke, in-folder | the quiet: the fire takes a breath |
| 5 | Flood · impact | 780 (560) | the whole diagonal, from the Pyromancer on the lip down to the row, Dutch −5° easing out | `ult:dry-send` (contact 0.12): the arm flung down after the fire | `dry-weir`, lit; exposure up | **70ms orange two-tone** held by the stop; the fire over the last step and through the row: tall tongues behind them, low ones before them, then a burning carpet over the whole basin (`dry-flood`); a tongue of flame shooting up the struck target (`dry-flare`); smoke rising | `dry-impact` layered; **150ms stop**, heavy shake, a second small shake | **row** `hurt`, shoved and tipped | cut on the two-tone | impact: the damage on the frame; "Done waiting." |
| 6 | Burning · return | 700 (480) | battle camera | real Arcanist `ult:dry-swat`: it notices its sleeve is alight and beats it out | real battlefield; bars open | every real enemy in the row still burning, with a scorch under it and smoke over it (`dry-burning`); a flame on the Pyromancer's own sleeve, beaten out to a wisp (`dry-singe`) | `dry-after`: crackle, a hiss, the motif's last two notes; tail | on board | flash 80ms | release: what is still burning, and what it cost |

### Boss framing

The fire is drawn at the target's size. In **Basin** the camera pulls back
and up to take in a Collector's height under the tide-lines. In **Flood** the
camera frames the boss whole with the steps and the small Pyromancer beyond
it, and the flood's tongues are drawn taller for it; a small shove. Large
framing (the Iron Bulwark) sits between.

### FAST

Drops **Basin**. The title rides **Run**. It keeps the pour, the fire's run,
the quiet and the flood.

## Performance, without a face

The Arcanist is not one of the five face heroes. Debt of Thunder looks under
the brim and opens the tome; Still Life never does either, and acts with the
hand's pinch, a flung sleeve, a hat's tip stopped mid-flop and eye-lights over
a silhouette. Dry Flood acts with **the hand turning over** (a pour, then a
fling, then beating out its own sleeve), **the spark** (swelling, becoming a
flame, gone), **the hat's tip lifted by the heat** (the one time it rises
instead of flopping) and **the eye-lights lit from below** by what it poured.
No part was added to `Arcanist.tsx`.
