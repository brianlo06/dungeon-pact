# Hammer Price — Broker · Magnate

**The idea, in one sentence:** the Magnate buys the enemy at an auction in a
dark saleroom where every rival paddle is a light, and every rival it outbids
goes out and adds its weight to the Magnate's hammer — so when the room is
dark and the hammer comes down, the hammer price falls on the lot.

Only the Magnate could have it. The path's title is the plot: *Buy the
problem. Then break it.* Its kit is Hostile bid, the one Broker ability that
pays gold to hit: every other Broker film earns (Foreclosure seizes, the Usurer
lends) or spends on the party (the Assurer insures). The Magnate is the only
one who buys, and an auction is the one place where buying is a fight — a room
of rivals, and a hammer that falls on whoever is left. The auction term is the
joke: the *hammer price* is what a lot sells for when the hammer comes down.
The base film left the auction and the hammer to this path on purpose
(`foreclosure.md`, "Leaving room for the paths").

The drawing supplies the bidder. An auction bid is a nod, and the Broker's
whole face is a cap, a pair of spectacles and a pleased mouth under them: the
biggest bid in the film is the smallest movement in it. And the Magnate has
stopped weighing things. The balance's pans are gone from its fist in every
shot of the film, and what it holds up in their place is a sale hammer.

## Gameplay purpose

`ultimate-defs/brk-magnate.ts`, target enemy, cost 100, speed 10:

| | Foreclosure (base) | **Hammer Price** (Magnate) |
| --- | --- | --- |
| The treasury | **+30 gold** | **−40 gold**, the bid — and **nothing** if the target is already Vulnerable (a distressed asset) |
| The target's guard | Barrier stripped | untouched |
| The target's move | — | **WINDUP broken** |
| The blow | 26, Vulnerable | **36 through armour**, Vulnerable (2 rounds) |
| Every other enemy | — | **Weak this round** (outbid) |
| Every ally | +8 Barrier | — |
| Credit | — | +2 |

It differs from Foreclosure in what it does: nothing is stripped, nobody is
shielded, and the treasury goes *down*. Foreclosure is a blow that pays; this
is a blow the party pays for, bought to take one threat off the board this
round — its windup broken, its guard irrelevant — and to blunt every other
one. An Ultimate resolves before anyone acts, so the Weak covers the party for
the whole of the round it is called in.

It is a team play in both directions. Every Vulnerable already on the target
— the Vanguard's Lantern Wall, the Reaver's Drag them down, a Gloomstalker's
volley, a Breaker, the Magnate's own Hostile bid — makes the Ultimate free.
The Vulnerable it leaves is 25% more on every hit the party lands on the
target this round and next, what the Mindflayer holes and what a Usurer
collects on.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, on
`0b86568`: first with this path's stub still `null` (the Magnate on
Foreclosure), then with Hammer Price.

| Win rate | off | on, stub (Foreclosure) | **on, Hammer Price** |
| --- | ---: | ---: | ---: |
| 2 players | 75% | 88% | **88%** |
| 3 players | 94% | 95% | **96%** |
| 4 players | 92% | 94% | **94%** |
| all | 91% | 94% | **94%** |

"all" and duos do not move; trios gain a point. Broker uses per run 2.35 →
2.41, charge earned 259 → 262; Ultimates per boss fight 6.90 → 6.88; the
Ultimate share of hero damage stays 17%, and healing and Barrier from
Ultimates falls 126 → 118 a run (the Magnate hands out none).

Tests: `tests/ultimates-hammer-price.test.ts` (5): it replaces Foreclosure
and strips and shields nobody; it spends 40, breaks the windup, deals 36
through armour, leaves Vulnerable for 2 rounds, makes every other enemy Weak
this round without touching their HP, and gives 2 Credit; an enemy already
Vulnerable costs nothing and takes the Vulnerable blow; a 15-gold treasury is
emptied and the blow still lands; resolved as an Ultimate, the film is handed
the target and its damage beat.

## Space, palette, sound

- **Space: the saleroom after dark.** A long, high auction room with its lamps
  out: rank after rank of empty cane-backed chairs running away into the dark,
  a raised rostrum of black lacquer at the far end, and in front of it the
  sale block, a low round dais where the lot stands. Nobody is in the chairs.
  Over every chair a bidding paddle is held up out of the dark, and the
  paddles are the only light in the room: pale discs, hundreds of them, like
  a sky of rival money. Not a hall of lanterns, a forge, a storm, a wood, a
  vault of shelves, a sink, a page, a ridge, a causeway, a theatre, a
  spillway, a meadow, a mud run, the ground under the floor, a mirror room, a
  no-man's-land, a mere, a labyrinth, a pit, a stopped chamber, a loft, white
  roofs, a burying ground, a shedding ground, tidal flats or a snowfield.
- **Palette:** lacquer black `#0b0709`, walnut dark `#23150f`, cane
  `#6e5638`, paddle ivory `#efe5cf` (the room's only light), and one colour,
  **Tyrian `#e05bd8`** (the accent), kept for the Magnate's hammer and what it
  does: its rim, the knock, the split in the block, the drawn frame. No brass,
  no green, no copper, no cream paper, no carbon blue: the counting house, the
  sink and the policy are the other Broker films'.
- **Signature effect — the paddles going out.** A paddle is an ivory disc on a
  short black handle, held up over a chair back, with a faint pool of its own
  light round it. When the Magnate outbids a row, the row's paddles drop
  behind the chair backs one after another, like lamps being put out, and the
  room gets darker by exactly that much. Every paddle that goes down swells
  the Magnate's hammer a little: the price, as weight. The drawn impact is the
  knock: a hard Tyrian ring stamped flat on the block, the block split, and
  splinters of black lacquer thrown off it.
- **Motif (original):** three chords on a small pipe organ, each a whole step
  above the last — C, D, E: *going once, going twice* — and a fourth, a low F
  under a held pedal A, that comes down instead of up: *gone*. Blown, with a
  chiff on each attack. Not a horn, a bar, a pipe, a reed, coins, a whistle, a
  voice, a mallet on a string, a music box, a drum, plucked strings, a
  backwards tone, a bottle or a chime.
- **Signature sound: the rap.** A hardwood gavel on a sound block: a dry crack
  with a short hollow knock under it and no ring at all. The call is one rap;
  the film's paddles going down are a run of soft card-and-wood slaps.
- **The quiet:** music to 4%; one paddle left up in the dark, and the tiny
  rattle of its handle in a hand that cannot hold it still. Then nothing.
- **Impact, layered:** the rap at full size (transient), a sub drop, the block
  itself — a big hollow wooden boom with a split running through it (body) —
  and a tail of lacquer splinters and a room that has gone quiet.

## Rhythm

identity (the nod: the Magnate bids with its chin, and the paddles behind it
begin to go out) → stakes and escalation (the saleroom: every rival in the
room outbid row by row, the room going dark, the hammer swelling in the
Magnate's fist; the real target on the block, bracing; title) → anticipation
(going twice: on a Dutch angle, the hammer hoisted to its full price over the lot,
which cowers) → **quiet** (the last paddle, alone in the black, shaking, and
going down) → **impact** (gone: the hammer on the lot, the block split under
it, a Tyrian-and-ink frame) → release (the real board: the split block under
the real target, and a paddle lowered in front of every other enemy).

The quiet is the room at its darkest, and the loudest shot is lit only by the
hammer.

## Shots — FULL 4740ms, FAST 2960ms (62%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Broker `ult:hammer-call` — the chin comes up, the ledger hand touches the cap's brim: a bidder's signal | real battlefield sinks to lacquer black; bars close | Tyrian call aura; a round sale block drawn in under the real target's feet (`hammer-block`, `call`, anchored) | call; one rap (`hammer-rap`); music ducks | on board | — | break the round: the target is a lot |
| 1 | The nod · face close-up | 620 (400) | on the face with the hammer's head standing beside the cap, Dutch −6° → −3°, pushing in | `ult:hammer-nod` (`root: false`) — the balance gone from the fist and the sale hammer in it; lids up, brows lift a hair, one slow nod (head 9°, lids to 0.36), the mouth set closed and wide | the saleroom; the paddles behind drawn soft (no ink, dimmer, more light — not blurred) | the nearest paddles behind the head go out at the nod (`hammer-paddles`, `soft`) | the nod (`hammer-nod`): the murmur, and a low wooden tock on the nod (separate FULL/FAST cues, since a clip plays at one rate) | no | black 60ms | identity: the biggest bid in the film is a nod |
| 2 | The room · wide | 1000 (520) | wide, level, a slow push and a rise | `ult:hammer-outbid` — the hammer held up like a bid; at each wave a little lift, and its head swells (1 → 1.24 → 1.44 → 1.62, fattening) | the saleroom lit only by paddles; exposure 0.9 → 0.45 as they go | **every rival outbid** in three waves, from the Magnate's place outward (`hammer-paddles`: 7% → 33% → 64% → 95% of the room); the real target on the sale block (`hammer-block`) | **the motif** (`hammer-motif`); three waves of paddle slaps (`hammer-slaps`, `-fast`) | **yes** — real figure on the block, `anticipate` | whip 110ms | stakes and escalation: everyone outbid; the price as weight; title |
| 3 | Going twice · Dutch | 540 (340) | medium, the Magnate low left, Dutch 7° → 10°, pushing in | `ult:hammer-hoist` (held with `then`) — the hammer hoisted straight up at its full price, the body leaning back under it, brows down on the rims, lips pressed | near dark; Tyrian rim | the last paddles at the back of the room go out (`hammer-paddles` 95% → 99%) | the hoist (`hammer-hoist`): a creak of weight and a low note swelling | **yes** — the lot in the foreground, rim-lit, cowering (`block`) | cut | anticipation: the price, raised |
| 4 | The last paddle · extreme close-up | 560 (380) | on one paddle in the black, dead level, still | — | black; the paddle's own light (a gradient); exposure 0.2 → 0.08; bars 13% | one round card paddle in a gloved hand, trembling on the frame clock, then the hand gives and it goes down out of frame (`hammer-last`) | **music to 4%**; its handle rattling (`hammer-tremble`, once in FAST); then nothing | no | cut | the quiet: nobody else |
| 5 | Gone · impact | 800 (560) | medium two-shot, Dutch −6° → −2°, easing out | `ult:hammer-knock` (contact 125ms, 0.164) — cocked back, then over the cap and down with the whole body, the handle lying forward and the head on the lot; a shout; the head squashes and springs back | lit by the hammer: Tyrian back light and a pool behind the lot and the head (`hammer-glow`) so the drawn frame cuts both silhouettes | **Tyrian-and-ink two-tone** (70ms) at 0.175; the knock round the head — ragged end-grain rings laid flat, black lacquer wedges driven out sideways, the struck spot and the split running down through the lot (`hammer-knock`, back and front halves); the sale block split and its halves tipped apart, the inside Tyrian (`hammer-block`, `split`); lacquer splinters (`hammer-splinters`) | the swing (`hammer-swing`) into the layered impact (`hammer-impact`); **150ms stop**, heavy shake | **yes** — `hurt`, driven down and tilted | cut | impact: sold, and broken; damage on the held frame; "Sold!" |
| 6 | Knocked down · return | 820 (520) | battle camera | real Broker `ult:hammer-settle` — dusts its palms and tips the cap | real battlefield; black lifting; bars open | the split sale block under the real target (`hammer-block`, `board`); over every other real enemy standing a paddle held up and laid down at its feet (`hammer-outbid`, found on the stage, staggered) | paddles laid down and a low organ chord (`hammer-down`), tail | on board | flash 70ms | release: the lot broken, the room outbid |

### Boss and large framing

A boss is not struck on the head, which a Broker cannot reach: in **Gone** the
camera pulls back to hold the whole Collector on its block, the Broker stands
further left, and the hammer lands on the boss's body with a smaller knock
and a small shove — struck, not shrunk. In **Going twice** the Collector
stands further back behind the hoisted hammer; the Iron Bulwark stands higher
in the frame. The block, the glow and the knock are all sized from the
target's drawn height.

### FAST

Every shot survives, shorter; the room is cut to about half, its three waves
closer (`hammer-slaps-fast`). The nod, the quiet (one rattle instead of two)
and the two-tone frame are all in FAST.

### Voice

"Do I hear a bid? I do. Mine." · "Sold!" · "Bought and broken. The rest of
you: paddles down."

## Films merged while this was authored

Checked before locking the space and again before the final captures: since
`0b86568`, **Proof Shot** (Ranger · Sharpshooter) merged — a proving range,
armour plates on frames, two arrows through one hole. Nothing here touches
it: no range, no plate, no arrow, no distance.

## Notes from the lab

- **The balance comes out of the fist.** The Broker's drawing gained two
  close-up-only parts (`components/heroes/Broker.tsx`): `balance` wraps the
  post, ring and pans that were already there, so a close-up can scale it
  away, and `gavel` (with its head, `mallet`) is the sale hammer. The hammer is
  drawn only inside a cinematic's copy (`CloseUpContext`) and is parked 1000
  units right of the fist, outside a clip, at rest, so every other Broker
  film, and every round, is unchanged. Each clip brings it home with `x: −10`.
- **The swing is solved from the arm.** The handle's direction is the sum of
  the arm's turn and the wrist's, clockwise from straight up; 90 lays the
  handle forward with the head's face down. The first cut struck with the arm
  down and the handle level at the hound's head, which read as a ram from the
  side; the contact pose now lifts the arm (−40) and turns the wrist (120), and
  the impact shot sizes the Broker up (720) against the hound (400), so the
  head comes down *on* the lot's back.
- **The contact is after the blend.** A film eases into each clip for 120ms,
  so a contact at 76ms landed at three quarters of its pose. The knock is at
  125ms, keyed exactly, and the shot's reveal at 0.175 (140ms FULL, 98ms FAST)
  sits inside the 40ms the contact test allows in both cuts. The hoist holds its
  last pose through the quiet (`then`), so the knock starts from it.
- **The knock does not cover the blow.** The first knock was a star and wide
  rings drawn over the contact, and on the held frame they hid the hammer. It
  is now drawn in two halves — the far arcs behind the cast, the near arcs and
  the split in front — smaller, with fatter, shorter wedges, so the hammer's
  head and the lot are both whole on the held frame.
- **The two-tone frame** put the raised head against black; the Tyrian pool
  behind the lot was raised and widened until it sits behind the head too.
- **The paddles are one path per row**, rebuilt each frame (about 350 paddles,
  six rows, seven paths a row), chairs drawn over their own row's paddles so a
  paddle going down sinks behind its chair back. The chairs were arches at
  first and read as headstones; they are posts, a crest rail and a cane panel.
- **The last paddle** read as a mirror with a ring painted in it, then as an
  egg; it is a plain round card on a turned neck, in a gloved hand whose
  knuckles catch its light.
- **Sounds were rendered offline and measured** (peak of three renders,
  `OfflineAudioContext` in the lab page): the impact 1.32 (Foreclosure's
  1.33, Compound Interest's 1.32, The Small Print's 1.44); the motif 0.15
  (0.12 / 0.14); the quiet's rattle 0.04 (the Usurer's ticks 0.05, the
  Assurer's 0.06); the rap 0.38 (the Usurer's bite 0.41). Clicks are tones,
  not noise.
- **Profile** (`GPU=1 scripts/profile-ultimate.ts`, 1920×1080, dev build, on a
  machine at load average ~35 with two other agents' sessions): film p50
  33.3ms / p95 66.7ms, 16 frames over 34ms; the round straight after p50
  33.3ms / p95 100ms, 20 over 34ms. Peak 675 nodes (632 SVG), 0 filtered
  elements. The film is no slower than the round beside it on the same page.

## Whole-body motion

Root keys, authored for the size each clip plays at: `ult:hammer-knock` (a
lean back onto the heels, rotate −7°, squash 1.08, then forward into the blow
on the contact frame: x 0.05, rotate 8°, squash 0.9, scale 1.03, held),
`ult:hammer-hoist` (leaning back under the weight: x −0.024, rotate −6°,
squash 1.07), `ult:hammer-outbid` (the belly forward at each wave: rotate ≤ 3°,
squash ≤ 1.04), and on the board `ult:hammer-call` and `ult:hammer-settle`.
`ult:hammer-nod` plays with `root: false` (its root moves 1° anyway). Nothing
moves `.cine-look`.

## What the engine could not do, and what was built instead

- **An enemy that only takes a status is not in the cast.** The Weak on every
  other enemy has no figure in the film; the rivals in the saleroom are
  paddles, and on the board the outbid paddles find the rest of the enemy line
  on the stage itself (`.stage .combatant[data-side="enemy"]`), leaving out the
  target by the block anchored on it. The engine would need an `enemies`
  anchor (or the segment to carry every unit a scoped effect touched).
- **Gold has no beat.** The 40 gold is not revealable, and the film cannot tell
  a full bid from a distressed asset bought for nothing: the room going dark
  is the price, whatever was paid. The engine would need a beat for gold.
- **Interrupting logs a beat but the film does not branch on it.** The film
  shows the same blow whether the target had an interruptible windup or not.
- **Hero parts cannot be added from a folder.** The hammer and the `balance`
  wrapper had to be added to `Broker.tsx` (close-up only, invisible or
  unchanged at rest), because a vfx cannot ride a part of the drawing. The
  engine would need a named attachment point a folder effect could follow.
- **A clip blends in over 120ms whatever its contact.** The knock's contact is
  keyed after the blend rather than earlier in the swing; the engine would
  need a per-cue blend length (`blend: 0`) to cut straight onto a pose.
- **A clip plays at one rate in FULL and FAST.** The nod's tock is two cues,
  one per cut; the room's slaps are a separate FAST voice.
- **A self-lit two-tone.** The accent is a grayscale-and-contrast filter, so the
  dark saleroom goes entirely to shadow; the Tyrian pool behind the lot is a
  gradient in the film's own layer, not a light.
