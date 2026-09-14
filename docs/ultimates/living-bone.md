# Living Bone — Warden · Lifebinder

**The idea, in one sentence:** the Warden's antlers are the one bone that
grows back, so the Lifebinder breaks a tine off its own crown and grafts it
to the one it will not lose — a piece of living bone that takes, buds, and
keeps growing where the Warden put it.

Only the Lifebinder could have it. The Warden is drawn with antlers growing
up through its hood, in the same wood colour as its staff: bone that is
already half a branch. The path's title is an absolute — *Nothing living is
beyond hope. Nothing.* — and its Lifebind is the Warden's heal pushed past
mending into keeping: a heal, a regeneration and a barrier on one ally. So
the Ultimate is one life bound, not everyone touched, and the binding has a
price the Warden pays out of its own body. An antler shed is an antler
regrown; velvet antler bleeds when it breaks; a graft takes and grows. The
film is those three facts, in that order.

## Gameplay (`ultimate-defs/war-lifebinder.ts`)

| | Green Reckoning (Warden) | **Living Bone** (Lifebinder) |
| --- | --- | --- |
| Target | self: the whole field | **one ally, the downed included** |
| The bound one | healed 18, Regen 3, cleansed | **healed 44 (revived if down), Regen 8 for 3 rounds, Barrier 12, Empowered for 2 rounds** |
| The rest of the party | the same as above | nothing |
| The enemy | Poison 4 a round | nothing |
| The Warden | healed with the rest | **pays 12 HP flat** (the tine), **steps to the front and intercepts the bound ally's next direct hit** this round, +2 Growth |

Speed 11. It differs from Green Reckoning in what it does: Green Reckoning is
a sweep — everyone healed a little, cleansed, the enemy poisoned. Living Bone
is a bond between two heroes. One is brought back or kept, and comes back
stronger (an antler grows back bigger every year: Empowered); the Warden's
body stands in for the bound one's (a guard link, the existing intercept
reaction); and the Warden bleeds for it (a flat blood cost). The gift lands
before the price, so a Warden low enough to drop itself still binds the life
it meant to. The heal reaches a downed ally, so the same action is a revive:
"nothing living is beyond hope", taken literally.

Team play: Empowered makes the revived Reaver's or Ranger's next two rounds
hit 30% harder; the guard link is the Vanguard's reaction, on a healer who
has to leave the back row to give it; Barrier and Regen are the Warden's
own affinities, so the meter refills by doing this.

## Space, palette, shape

- **Space: the shedding ground.** A clearing at the end of winter under a
  flat white sky: dead bracken, a bare hedgerow black along the far edge,
  and old shed antlers lying about in the bracken — every crown the Warden
  ever dropped, bone-white, some already sprouting a leaf. Not underground,
  not a mere; no roots, no water, no hall, forge, storm, snow, moon, sun or
  glass. Nothing in it moves.
- **Palette:** bone `#ece3cf` (the antlers, the mantle, the shed crowns),
  **juniper `#7fc4a4`** (the accent: the cold green of new growth, not the
  base film's sap or the Hollow Druid's duckweed), bracken copper `#6b4a2a`,
  the sky's pale `#d9e4dc`, and one warm note, velvet-blood `#c4573f`, at
  the break and nowhere else.
- **Shape language:** the tine (a curved prong of bone with a hook), the
  stump it leaves, the bud (a small tine sprouting), and a thread of light
  from the hand to the one it binds.

Shares nothing with the Warden's other films: no roots or web, no ground cut
away, no heartbeat, no eyes opening; no tear, cupped hand, black water or
mere. Nothing with the other support films: no voice ribbons, paper, lantern
wards, a shield taking blows or a body absorbing them. Its signature effect is
a piece of the hero's own body broken off and given.

## Rhythm

identity (the hand goes up and closes on the crown: the one thing only this
Warden would take hold of) → stakes (the shedding ground, wide: the party
across the clearing, every old crown in the bracken; title) → **quiet** (the
face under the antlers, eyes shut: the brow braces, the lids press, the mouth
sets — and a nod; music gone; nothing moves but the grip whitening) →
**impact** (the snap: a drawn frame, the tine wrenched free in the fist, the
stump on the crown, a bead of velvet-blood; the Warden's own cost shown) →
target (the graft: the Warden crosses to the one it binds and presses the
tine to it; the light runs from the hand into the figure and the bud takes;
the numbers) → release (the real board: the bound one with a living tine on
it, budding; the Warden's hand coming down from its crown).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Warden `ult:bone-turn` — the head lifts, the open hand rises towards the crown, the lantern swings once | real battlefield pales towards bone, bars close | juniper call-aura on the real Warden | call bell; a dry knock of knuckle on antler; music ducks | on board | — | break the round: the Warden reaches for its own crown |
| 1 | Crown · extreme close-up | 620 (400) | tight on the front antler from low front-right, Dutch −8°, pushing in | `ult:bone-grip` (`root: false`) — the hand comes up under the forward tine and closes on it (`--wdn-grasp` 0 → 1, three drawn stages); the head tips into the grip; the lantern steadies | the shedding ground, near white; cold juniper rim | the fist closing on bone; a glint off the tine's hook | a creak of bone under a grip; the lantern's chain ticking still | no | black 50ms | identity: only this Warden takes hold of this |
| 2 | Shedding ground · wide | 900 (—) | wide and level, a slow truck right, the Warden at the left third and the party across the clearing | `ult:bone-grip` held (the fist on the crown); the party `idle`, rim-lit | the clearing: white sky, black hedgerow, bracken, old shed crowns in the bracken drawn in front of every foot | `bone-ground` (the shed antlers, the bracken), still juniper motes | **Living Bone motif** (four notes on a bone whistle, breath in them) | the real party, standing across the clearing | cut | stakes: every crown it ever shed, and the one it is about to; title |
| 3 | Brace · face close-up (the quiet) | 600 (380) | on the face under the antlers between the two beams, dead still | `ult:bone-brace` (`root: false`) — the brow knits and drops, the shut lids press, the mouth sets thin; then one small nod; the fist whitens (scale) | exposure to 0.14, vignette 0.9, a thin juniper rim | nothing moves but the fingers | music ducked to 3%; two creaks of the grip; a breath drawn in and held | no | cut | anticipation by subtraction: the Warden deciding to hurt itself |
| 4 | Snap · impact | 600 (440) | high and close on the crown from behind-right, Dutch +6° easing to +2°, the sky behind | `ult:bone-snap` (contact 0.06) — the fist wrenches down and away, the head jerks the other way and recoils; the forward tine leaves the crown (`--wdn-tine` 0 → 1) and is in the fist | exposure spike to bone-white, then falls; juniper tint | **70ms two-tone frame**: the crown and the fist with the tine free between them; the stump on the beam; a **bead of velvet-blood** at the break; bone splinters; `impact` reveal (the Warden's cost on the board) | layered snap (dry crack, sub, wooden body, a bone ring); **150ms stop**; heavy shake | no | cut on the two-tone frame | impact: the price, on its own frame |
| 5 | Graft · over-the-shoulder | 700 (480) | past the Warden's crown (one tine short) to the party; the camera drifts with the crossing | `ult:bone-give` — the Warden crosses to the bound one and presses the tine to its chest; the fist opens (`--wdn-grasp` 1 → 0) and leaves the tine there; the head bows; the party ghosted except **the bound one**, lit, which if it was down is sunk to its knees and comes up as the tine takes | the clearing; exposure lifting; juniper back light behind the bound one | `bone-thread`: light runs from the hand into the figure; **the bud** (a small tine budding, juniper velvet on it) on the bound one; a chip with the real numbers (`+44 · ⬡12`, `REVIVED` if it was down); `ward` reveal at the press | `bone-graft` (the press, then a rising breathy chord); "There. It's yours now — grow." | **the real bound ally** | whip 120ms (the Warden turning to them) | target and result: the life it binds, by name and number |
| 6 | Taken · return | 760 (480) | battle camera | real Warden `ult:bone-rest` — the hand comes down from the crown, the head lifts, the lantern swings home | real battlefield; bars open | on the real bound ally: **the grafted tine on its chest, budding**, juniper motes rising off it; on the real Warden, a bead at the crown | the motif's last note; tail | on board | flash 80ms | release: where the bone went, and what it is doing there |

FULL 4580ms, FAST 2420ms (53%). FAST drops the wide and keeps the grip, the
quiet, the snap and the graft.

## Voice

"Stay. I've something to give you." · "There. It's yours now — grow." ·
"It'll ache in the spring. That's how you know it took."

## Framing

The Ultimate aims at an ally, so the engine's framing is always `normal` and
`framing` overrides never apply; there is no enemy in the film, at any size.
The party is the real cast at one size, so a boss fight looks the same as a
hound fight — which is right: the film is between the Warden and one of its
own.

## What the engine could not do, and what was built instead

- **The chosen ally is not in the cast.** `splitUltimates` collects only
  enemy targets, so an ally-aimed Ultimate has no `target` role and no
  `targets` anchor; the bound one is one of `allies`, in party order, with
  nothing to say which. The film finds it two ways: at the call, a hero
  lying on the board (`data-down`) is the one being revived; otherwise the
  graft shot reveals `ward` at its start and reads the heal and Barrier pops
  the reveal raises on the board (matched to a unit by the place they share)
  before the press, then draws the thread, the bud and the numbers on that
  copy. The engine would need `splitUltimates` to add a player target and
  the cast to give it the `target` role (and `anchor: "targets"`), which is
  a one-line change there and none in the schema.
- **A row of allies shares one clip.** The bound one is lit and stepped
  forward, and comes up from its knees if it was down, by a transform on its
  copy's `.cine-look` written by the film's own frame function.
- **The cost has no pop.** The Warden's 12 HP is a `damage` beat, which the
  reveal shows on the board's bar but never as a number; the snap draws the
  bead and the stump instead, and the bar tells the truth on the return.
- **`$damage` is the damage to the primary target**, which an ally-aimed
  Ultimate has none of; the graft's chip quotes the reveal's own pops.
- **The bot aims an ally-target Ultimate at the first standing ally**, never
  the downed or the most wounded (`scripts/policy.ts` `ultimateTarget`), so
  the balance run underuses it. Not changed here; noted for the policy.
