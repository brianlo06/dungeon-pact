# Breakwater (Vanguard · Aegis Knight)

**The idea, in one sentence:** the Aegis Knight's shield remembers every blow
that ever broke on it; it stands perfectly still while the enemy's whole
onslaught comes down on it like a wave, and the wave breaks — and every blow
the shield remembers goes back.

Path: "Stand still. Let it break on you." +25 HP, −2 speed, and Aegis instead
of Intercept (take an ally's next hit with 20 Barrier, shield their row).

## Gameplay

| | Lantern Wall (base) | **Breakwater** (Aegis Knight) |
| --- | --- | --- |
| The party | every ally +12 Barrier **and** guarded | every ally guarded — **no Barrier on them**: every blow comes to the Knight |
| The caster | +6 Barrier per ally, +8 | **+10 Barrier per ally, +14** |
| The enemy side | nothing | **every enemy Weak this round** (their blows break) and 6 back |
| The target | charge: 20, WINDUP broken, Vulnerable | **answered**: 14 more through armour, Vulnerable — no interrupt, no charge |
| Resolve | +2 | +2 |

Target: an enemy (the one it answers). Speed 16.

Why it is not the Lantern Wall with other numbers: the Lantern Wall makes each
ally harder to hurt and then leaves the line to strike one threat. Breakwater
never leaves and never shares its guard: it turns the whole round's incoming
damage into one target — itself — makes that damage smaller at the source
(Weak on the entire enemy side, which the base Ultimate cannot touch), and
turns the round's defence into the party's offence (every enemy scratched, one
cracked open). It is the fortress that punishes what breaks on it.

Quick balance (`scripts/ultimate-report.ts 4 --sample=6`): "all" 88% off →
90% on, identical to the same sample before Breakwater existed (the Aegis
Knight kept the Lantern Wall). Aegis runs only (every composition with a
Vanguard, 5 seeds, 166 runs that trained the path): 95% with Breakwater, 97%
with the Lantern Wall — in line, not above it.

## Fantasy and palette

Not a hall (Lantern Wall) and not a forge (Gatebreaker): **a causeway at the
end of the world, paved with the broken blades of everything that ever came at
the Knight**, under a pale, cold horizon. The enemy's onslaught is drawn as a
**wave of ink and steel** whose crest is made of blades. Palette: ink black,
cold steel white and **verdigris** (`#7fe6c3`) — the Aegis's own light.

Shape language: the shield's own heater outline, repeated outward as ripples
(the Aegis spreading, and everything it remembers going back); dents lighting
on the shield face (the blows it remembers); blades — in the wave's crest, in
the causeway, shattering at the break, snapped over each Weak enemy.

Shares nothing with the benchmarks: no floor-contact close-up, no helm/visor
close-up, no charge, no ram, no over-the-shoulder, no gate, no lanterns, no
wards, no cracks; its camera is still where theirs move, and its hero never
moves when it is struck.

## Rhythm

identity (the dents) → stakes (the tide rises behind the real enemies) →
**quiet** (the crest hangs over a motionless silhouette; sound drops to one
glassy note; only the cape moves) → **impact** (the wave breaks on the shield;
the Knight does not move; the party behind it is dry) → payback (every
remembered blow goes back through the enemy line) → release (the Aegis marks
over the real party, broken blades over the real enemies).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Knight `ult:aegis-set` — shield drawn in and set, weight dropped | battlefield dims to 0.62, bars close | call-aura (verdigris), heater-outline ripples on the real unit | shield knock + cold fifth; music ducks | on board | — | break the round's rhythm |
| 1 | Tally · detail | 660 (400) | tight on the shield face, slow roll −3° → +2°, drifting down | `ult:aegis-hold` — set, still, cape moving | causeway, near-black; cold raking light from the right | **dents light one by one across the shield face**, then all at once | accelerating ticks of metal; "Let it come." | no | black 140ms (covers the copy settling into the set pose) | identity: a shield that remembers every blow |
| 2 | Tide · target | 920 (—) | high wide, slow push | Knight small at left, planted, rim-lit | causeway; horizon pale; the tide climbing | **the wave of ink and blades rises behind the real enemy line** | rising roar; **Breakwater motif** | **every enemy**, bracing (`anticipate`) | cut | stakes: all of them, at once; title |
| 3 | Still · wide hero (the quiet) | 560 (360) | **dead still**, Dutch −2° — the one shot whose camera does not move | `ult:aegis-hold` — silhouette | pale cold sky; the crest and the Knight both in ink against it | the crest hangs over the helm, **shards suspended** | music ducked to 6%; one glassy note; a grip creaks | no | cut | anticipation by suspension: the wave has not fallen yet |
| 4 | Break · impact | 700 (520) | medium on the shield, Dutch 3° easing out | `ult:aegis-brace` — **does not move**; the cape takes it | exposure spike, verdigris tint | two-tone frame; the tide's crest slams the shield and slumps; **a white seam down the shield face, a crown of ink spray and a fan of steel splinters thrown up and back**; sparks | layered break (click, sub, shield ring, shard rain) + room boom; **160ms stop**; heavy shake | no — **the party behind it, flinching and untouched** | cut on a 70ms two-tone frame | impact: it breaks, the Knight does not; "It breaks. I don't." |
| 5 | Return · Dutch | 620 (420) | Dutch −8° → −5°, pushing across the line | `ult:aegis-return` — the shield punched forward, feet still | causeway | **the remembered blows fly back as lights over a rolling ripple**; a shard-burst on every enemy | whoosh back, three answering blows; 110ms stop | **every enemy hurt and shoved**; `$damage` on the one answered | whip 110ms | payback |
| 6 | Hold · return | 720 (500) | battle camera | real Knight `ult:aegis-stand` | battlefield; bars open | Aegis mark over every real ally; ripples on the Knight; broken-blade mark over every real enemy | low held chord, tail | on board | flash 80ms | release: who is guarded, who is Weak; "Again, if you like." |

FULL 4580ms, FAST 2440ms (53%).

Boss framing: the tide shot pulls back so the boss stands inside the wave
rather than being cropped by it; the return shot frames up at the boss with
the Knight smaller and a smaller shove. Large framing sits between.

## Notes from the lab

- The presentation copy blends ~120ms into its first clip; the tally's black
  transition is long enough to hide the sword turning point-down.
- `ult:aegis-hold` is a long one-shot handed to itself, not a loop, so the
  next shot asking for it does not restart it and a finished brace does not
  blend back to the rest pose (sword shouldered).
- `ult:aegis-return` contacts at 8% so the reveal lands on the punch in both
  FULL and FAST (`clipAt: 0.14`).
- The causeway's blades and lines are baked into a handful of paths: the
  backdrop is re-rasterised when the camera zooms, at a cost per element.
