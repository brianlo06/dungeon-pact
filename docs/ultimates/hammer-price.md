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

Quick balance: see **Balance** below.

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
(going twice: from under the hammer, hoisted to its full price over the lot,
which cowers) → **quiet** (the last paddle, alone in the black, shaking, and
going down) → **impact** (gone: the hammer on the lot, the block split under
it, a Tyrian-and-ink frame) → release (the real board: the split block under
the real target, and a paddle lowered in front of every other enemy).

The quiet is the room at its darkest, and the loudest shot is lit only by the
hammer.

## Shots — FULL 4740ms, FAST 2960ms (62%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Broker `ult:hammer-call` — the chin comes up, the cap is touched | real battlefield sinks to lacquer black; bars close | Tyrian call aura; a round sale block drawn under the real target's feet (`hammer-block`, anchored) | call; one gavel rap (`hammer-rap`); music ducks | on board | — | break the round: the target is a lot |
| 1 | The nod · face close-up | 620 (400) | tight on the face with the hammer at the shoulder, Dutch −6° → −3°, pushing in | `ult:hammer-nod` (`root: false`) — eyes slide to the lot, brows lift a hair, one slow nod, the mouth sets into a small closed smile; the hammer held up at the shoulder | the saleroom, near dark; paddles out of focus behind (soft, not blurred); Tyrian rim | behind the head the nearest paddles go down at the nod (`hammer-paddles`, near) | the nod (`hammer-nod`): a low wooden tock and the room's murmur cut off | no | black 60ms | identity: the biggest bid in the film is a nod |
| 2 | The room · wide | 1000 (520) | wide, level, a slow push and a rise | `ult:hammer-outbid` — the hammer lifted, and at each row going out the Broker leans on it, pleased | the saleroom lit only by paddles; exposure falls as they go | **every rival in the room outbid**: row after row of paddles goes down from the Magnate's side outward (`hammer-paddles`, waves), the room darkening; the hammer's head swells with each wave | **the motif**; waves of paddle slaps (`hammer-slaps`) | **yes** — real figure on the sale block (`hammer-block`), looking round, bracing | whip 110ms | stakes and escalation: everyone outbid; title |
| 3 | Going twice · low angle | 540 (340) | under the hammer, looking up past the lot, Dutch 9° → 12°, pushing in | `ult:hammer-hoist` — the hammer hoisted overhead at its full price, the body leaning back under it | near dark; Tyrian rim on the hammer; the last paddles far back | the hammer's head over the top of the frame; a last few paddles go out behind (`hammer-paddles`) | the hoist (`hammer-hoist`): a creak of weight and a swelling low note | **yes** — the lot cowers (`block`) under it | cut | anticipation: the price, raised |
| 4 | The last paddle · extreme close-up | 560 (380) | macro on one paddle in the black, dead level, still | — | black; the paddle's own faint light; exposure 0.3 → 0.12 | one paddle, trembling, then lowered out of frame (`hammer-last`) | **music to 4%**; its handle rattling (`hammer-tremble`); then nothing | no | cut | the quiet: nobody else |
| 5 | Gone · impact | 800 (560) | medium, low along the floor, Dutch −6° → −2°, easing out | `ult:hammer-knock` (contact 0.1) — the hammer down on the lot with the whole body behind it; a shout | the room lit by the hammer: Tyrian back light behind the lot (`hammer-glow`) so the drawn frame cuts both silhouettes | **Tyrian-and-ink two-tone** (70ms); the knock stamped flat on the block (`hammer-knock`); the block split and its halves tipped (`hammer-block`, split); lacquer splinters (`hammer-splinters`) | the swing (`hammer-swing`) into the layered impact (`hammer-impact`); **150ms stop**, heavy shake | **yes** — `hurt`, driven down and tilted | cut on the two-tone | impact: sold, and broken; damage; "Sold!" |
| 6 | Knocked down · return | 820 (520) | battle camera | real Broker `ult:hammer-settle` — dusts its palms and tips the cap | real battlefield; black lifting; bars open | the split sale block left under the real target (`hammer-block`, board); a paddle lowered in front of every other real enemy (`hammer-outbid`) | paddles laid down (`hammer-down`), tail | on board | flash 70ms | release: the lot broken, the room outbid |
