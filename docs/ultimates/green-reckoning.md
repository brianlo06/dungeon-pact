# Green Reckoning — Warden

**The idea, in one sentence:** the Warden, whose eyes are always shut, lays
its healing hand on the ground and listens down one web of roots to every
heart on the field — and when it opens its eyes, the same roots answer all of
them at once: sap to the party, rot to everything else.

Only the Warden could have it. Its eyes are drawn closed, "an old face at
peace", so the one time they open is an event. Its hand is "the one that
heals" and its heal is *Mending roots*; its poison is *Briar prison*. The
Ultimate's two halves — every ally healed, lifted and cleansed; every enemy
poisoned — are one gesture here, not two spells: one root system, and the
Warden decides what flows down each thread. "Nothing living is beyond hope" is
the faint heart it finds and lifts. "Nothing dead stays comfortable" is the old
dead in the soil stirring, and the rot that climbs the enemy.

## Gameplay (`ultimate-defs/warden.ts`, unchanged)

Target self. Every ally, the downed included: heal 18, Regeneration, Burn,
Poison and Weak cleared. Every enemy: Poison 4 a round. The film shows the real
party (a downed ally lying on the web, then lifted by it) and the real enemy
line, copied off the board, rotting.

## Space, palette, shape

- **Space: the ground under the fight, cut away.** A thin crust of moss and
  flagstones is the floor; above it, black air under old arched roots; below
  it, a cross-section of loam with stones, and the bones and broken gear of
  every fight ever lost here. No other film goes under the floor. Figures
  stand *in* it: the soil is drawn in front of their feet.
- **Palette:** loam brown-black `#140e09`, bone `#e6dcc4` (the mantle), sap
  green `#9be38a` (the accent) for the living, and rot — black plum `#2a1626`
  with ochre spores `#c8b25a` — for the rest. The lantern's amber appears once,
  in the close-up.
- **Shape language:** the root, branching and forking to a point under each
  foot; the heartbeat as a bead of light travelling a root; the leaf (the
  Warden's own leaf mark) for what grows, the thorn and the fungus cap for
  what rots.

Shares nothing with the other films: no plant with light running through
floor cracks (the hand is laid, not struck, and the roots are seen from the
side, underground); no hall, forge, sky, fog wood, causeway or mirrors; no
charge, ram, arrow or bolt; its signature effect is growth through earth, not
light, force, weather, lines or glass; its quiet is a listening face with its
eyes shut, and its impact is a pair of eyes opening.

## Rhythm

identity (the hand laid on the earth, roots running down from the palm) →
stakes (under the floor: one web reaching every ally's heart — one of them
faint — and every enemy's feet; title) → **quiet** (the face: eyes shut,
listening; the heartbeats, then one that barely comes; music gone) →
**impact** (the eyes open: sap and rot burst up through the floor at once; the
downed ally lifted; the enemy line recoils as the rot climbs it) → release (the
real board: leaves at every ally's feet, briars and spores at every enemy's).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Warden `ult:green-listen` — head bows, the open hand lowers, the lantern stills | real battlefield sinks into loam-dark, bars close | call-aura (sap); roots creep along the real floor from the Warden to every unit, a heartbeat ring under each | call bell; one heartbeat through the floor; music ducks | every unit, on board | — | break the round's rhythm: the Warden starts listening |
| 1 | Hand · detail | 600 (380) | low on the ground line, the kneeling figure cut at the chin, Dutch −6° → −3.5°, pushing in | `ult:green-kneel` — down on one knee, the open hand laid flat on the moss | the undergrowth cut away: moss crust, loam below; sap under-light from the soil | the soil in front of the figure; **roots pour down out of the palm into the earth**; spores | the palm on the earth; roots creaking into the soil | no | black 50ms | identity: the hand that heals, put into the ground |
| 2 | Web · wide cross-section | 1000 (520) | flat, square-on, dead level, slow sink and pull back | `ult:green-kneel` held — small, kneeling at the far left, the root of everything | the whole cutaway: black air above, loam below | **the root web** spreads from the palm through the soil, forks up to every foot; **a heartbeat bead climbs to each real ally** (the downed one's faint and late); rot-dark tips curl under the **real enemy line** (copied off the board) | Green motif (a wooden heartbeat, four notes); heartbeats | the real party (a downed ally lying) and **every enemy**, which flinch as the roots arrive | **in-folder occlusion: earth rises over the lens** (the camera goes into the ground) | stakes: all of them on one web; title |
| 3 | Listen · face close-up (the quiet) | 640 (400) | on the face under the hood, between the antlers, near still | `ult:green-hear` — eyes shut tight, brow knitting to listen; at the faint heart the brow lifts; the mouth sets; **the eyes open** at the last | near-black; sap rim from below | spores hanging still; then the eyes light | music ducked to 3%; two heartbeats, a gap, one faint one; an intake of breath | no | cut | anticipation by subtraction — and the decision |
| 4 | Reckoning · impact | 740 (540) | low on the floor line, Dutch 4° → 1.5°, easing back out | `ult:green-reckon` (contact 0.04) — up out of the kneel, staff raised, open hand flung up, eyes open | exposure spike, then settling; sap tint | **70ms two-tone** (black figures on a sap glow); the web surges out of the Warden's feet; shoots burst up through the crust under every ally and a flower under the Warden, **the downed ally lifted to its feet**; briars and fungus caps burst under every enemy and **rot climbs them**; a chip on the party ("Healed · Regen · Cleansed", or "Revived" on the one who was down) and "Poison 4" on each enemy | layered impact (root snap, sub, earth body, leaf rush) + rot hiss; **150ms stop**; heavy shake | **the party lifted, every enemy recoiling** | cut on the two-tone frame | impact: both halves at once, the result on the frame |
| 5 | Grown · return | 760 (460) | battle camera | real Warden `ult:green-rest` | real battlefield; bars open | leaves and a sprout at every real ally's feet, rising sap motes; briars and falling spores at every real enemy's | soft wooden chime per ally, tail | on board | flash 80ms | release: what is healing and what is rotting, where they stand |

FULL 4140ms, FAST 2540ms (61%). FAST keeps the web (the idea) shortened, the
quiet and the impact.

**Framing.** The film has no chosen target (it aims at the Warden itself), so
the engine's framing is always normal and `framing` overrides never apply. The
enemy line is copied off the board at its real sizes relative to the Warden's
own board figure, so a boss stands over the web as a boss; when the line would
leave the frame (its drawing's real top, crown included, or its width past the
party) the copies are scaled down together, never one alone.

**Voice.** "Hush. Let me hear your hearts." · "Up, all of you. — Not you." ·
"It keeps growing. On all of you."

## Notes from the lab

- **A presentation copy's root track is never written — in any film.** The
  cast layer attaches each copy's `.cine-rig` in a ref callback, but the
  figure's parts register in a passive effect, and `animators.attach` is a
  no-op for an animator that does not exist yet; `register` then creates it
  and nothing attaches the root again. Every `poses` root key in every
  Ultimate clip is silently dropped (the rig's `style.transform` stays empty;
  root `flash` too). The Warden's kneel is therefore built from the parts
  (everything sinks together, the legs fold), and the party's lift at the
  reckoning is a transform on each copy's `.cine-look`. The engine fix is one
  line in `UltimateCinematic.tsx`: attach the rig node again after
  `animators.register` in the layout effect.
- **Under a film the board already stands at the result.** `Combat` passes a
  unit the replay's health only while a beat is showing, and a film shows
  none, so a revived hero's board figure gets up the moment the round
  arrives. The downed ally is found as the call shot mounts, before the
  board's revive has drawn a frame (a hero rig rotated past −25°, or
  `data-down`), and written onto the film as `data-green-downed`.
- **The lab could not stage a downed ally.** `downed=1` was added to
  `dev/ultimate-lab.tsx` (four additive lines, its own commit): the boss
  fixture already supported it.
- The eyes open through `--wdn-eyes`, a CSS variable the film sets on the
  Warden's copy; the open eyes are drawn inside the `eyes` part only in a
  close-up (`Warden.tsx`), so a round's Warden is unchanged and the lids
  still squash with `open`.
- Copied enemies drop their eye and coal `drop-shadow`s, so nothing that moves
  in the film carries a filter.

## What the engine could not do, and what was built instead

- **Enemies that only take a status are not in the cast.** Poison leaves no
  beat, so the film's `targets` is empty. The enemy line is copied off the
  board (`green-foes`), placed by its real relative positions and sizes, and
  its reactions (the flinch, the recoil, the rot) are transforms and a clipped
  ink copy. The engine would need an Ultimate's status effects to count as
  reach, and a `react` for figures it did not cast.
- **One ally cannot act apart from the others.** A clip on `allies` plays on
  every ally; the downed one lying and being lifted is a transform on its copy's
  `.cine-look`, found by matching its drawing to the board unit. The engine
  would need per-ally cues (`allies-1`) or a `downed` role.
- **The occlusion object is always a cape.** The earth rising over the lens
  between the hand and the web is a screen-layer effect across the cut.
