# Undertow (Arcanist · Tidecaller) — storyboard

**The idea, in one sentence:** the Tidecaller has been holding the whole sea
back with one open hand; it pulls the water off the flats where the enemy
stands, holds it out at arm's length on the horizon while they stand on the
bare seabed, and then lets go, and the loudest moment is seen from under the
water that comes back.

Only the Tidecaller could have it. The path's title is the plot: *The tide
arrives whether you are ready or not.* Its one ability, Riptide, is water
that *drags* (Wet and Weak on a row for one Mana), and the Arcanist is drawn
with no staff, only an open gloved **hand** held out towards the enemy with a
spark in it. So the Ultimate is not a spell thrown but a hold given up: the
open palm, the drawing's own rest gesture, straight-armed and shaking with
the weight of the sea on it; then the arm comes down. Nothing is cast at the
impact. The Tidecaller simply stops holding, and the sea does what it was
always going to do. The **hat's tip**, which flops on its own every round,
streams *seaward* with the wind that goes out with the water, and the robe's
hem is pulled the same way; the **eye-lights** are the only face it has.

It shares nothing with Debt of Thunder (no rain, no sky seal, no bolt, no
chain, no tome, no look under the brim; that film drowns a hall from above,
this one empties a shore and refills it from below), nothing with Dry Flood
(no spillway, no steps, no flood with a front racing downhill, no high-water
lines on stone, nothing poured), nothing with Still Life (no stills, nothing
frozen), nothing with Mourning Water (no still black water, no drop and rings,
no water climbing a figure slowly, no hand closing; this water is fast, it
goes *out* first, and it drags sideways) and nothing with Breakwater (no wave,
no crest hanging, no spray, no causeway, no cold horizon of steel; the sea
here comes back as a *level*, not a breaker, and the film goes under it).

## Gameplay

`src/content/ultimate-defs/arc-tidecaller.ts`, target an enemy, cost 100,
speed 6 (the tide is slow, and it arrives all the same):

| | Debt of Thunder (base) | **Undertow** (Tidecaller) |
| --- | --- | --- |
| Who | one target, and every enemy through the scope | **every enemy**, and the target more |
| Damage | 26 lightning on the target; Chain Shock 12 on the rest | **12 arcane** on the target and **10 arcane on every enemy**: the sea's weight, not a bolt |
| Wet | applied to every enemy for 3 rounds | applied to every enemy for 3 rounds |
| Weak | — | **every enemy Weak for 2 rounds**: the undertow drags their blows down |
| WINDUP | — | **the target's broken**; and any enemy **already standing in water** (Wet before the tide turned) is dragged under too: interrupted and 6 more through armour |
| Mana | +3 | +2 |

It differs in what it does, not only in numbers. Debt of Thunder is a burst
that spends the Wet it lays on one target and leaves the rest for the party.
Undertow spends nothing: it is a *control* Ultimate, the whole enemy side
Wet and Weak for two rounds and the target's plan gone, with the damage
spread thin across everyone rather than piled on one. And it compounds with
the Tidecaller's own round-to-round play: a Riptide the round before means
the whole row is "already in the water" when the tide turns, and every one
of them loses its WINDUP as well.

Team play: the Wet on everyone is the party's Chain Shock (the Tidecaller's
own Storm needle next round runs down the whole soaked line); the Weak is two
rounds of the party taking a third less from every enemy; the interrupts are
a Vanguard's or a Warden's round bought back; and the Wet is steam for a
Pyromancer's Dry Flood if there is one.

### Balance

See *Notes from the lab* below for the measured numbers.

## Space, palette, sound

- **Space: the flats at the harbour mouth, before dawn.** Ribbed wet sand
  running out from a shingle beach at the left to the sea at the right, under
  a slate pre-dawn sky with no moon and no sun. Mooring posts leaning in a
  line out across the sand, weed hanging off them; a hull lying on its side
  where the tide left it, its anchor chain lying across the sand; a wrack
  line of weed; lugworm casts; the last pools draining. When the sea goes out
  the sand *shines*, and the water it leaves behind runs seaward across it
  in threads. Not a hall, a forge, a gate, a storm, a drowned ledger, a held
  fall, a spillway, a ridge, a meadow, a wood, a causeway, a snowfield, a
  vault, the ground under the floor, a pit, a mere, a labyrinth, a
  no-man's-land, a mirror room, a page, a theatre, a rooftop or a hound run.
  Two drawings of it: `tide-edge` (the water's edge at a hand's scale) and
  `tide-flats` (the whole flat, shore to horizon).
- **The sea** (`tide-sea`, `tide-return`): drawn as a *level*. Going out it is
  one dark body whose near edge slides away across the sand, a pale foam
  line on the edge and a shine left behind it; at the horizon it banks up
  into a thicker band, which is the only warning. Coming back it is not a
  wave: the whole frame floods from below, the water's top edge a wobbling
  line that climbs the figures in a tenth of a second, a body of foam riding
  the line, and under the line the picture is seen *through* the water: a
  translucent cobalt that deepens with depth, the surface seen from
  underneath as a bright wobbling ceiling, bubbles going up in columns, and
  everything under it dragged sideways, seaward (the undertow: horizontal
  streaks, never a curl). Foam and bubbles are bodies of flat circles; a glow
  is a small flat gradient; nothing is blurred.
- **Palette:** pre-dawn slate `#1a2130` and `#0b0f18`, wet sand ochre
  `#8a7550` with its shine `#b8a882`, the sea's ink `#06101f`, and where the
  water moves a cold cobalt `#4a7dff` (the accent) with foam `#d6e6ff`. No
  storm blue (Debt of Thunder's `#8fd3ff`), no verdigris, no moon cream.
- **Motif (original):** four notes on a hollow blown voice, like breath over
  a bottle's mouth, G3, D4, C4, then F4 held with a slow vibrato: a swell that
  rises and does not resolve.
- **Signature sound:** the drag (`tide-drag`): a wave drawing back over
  shingle, a rattle of stones thinning out under a falling hiss, the sound of
  the sea *leaving*.
- **Impact, layered** (`tide-impact`): a slap (transient); a sub dropping
  (weight); a wide band of noise sweeping down and a long low push (body);
  then, under the surface, everything lowpassed to a rumble with bubbles
  chirping up through it (tail).

## Rhythm

identity (the open hand over the water's edge, and the sea backing off from
it) → stakes and target (the whole flat, the row stranded on the shining
sand, the sea going out to the horizon; title) → escalation (the strain: up at
the Tidecaller from the sand, the arm shaking, the hat's tip streaming
seaward, the horizon banking) → **quiet** (the bare seabed, level with the
sand: silhouettes, threads of water still draining past their feet, one fish
flapping, the sea a line on the horizon that thickens; music at 5%) → impact
(the hand comes down; the sea comes back as a level through the whole frame;
the row struck and dragged; the camera goes under the surface with the
target) → release (the real board: every enemy standing in water that is
still running out past it; the Tidecaller shaking out its hand).

## Shots

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Arcanist `ult:tide-hold`: the arm goes out straight, palm open, the body leaning back against a pull | real battlefield sinks to slate, bars close | cobalt call aura; a sheet of water slides *away* from every real enemy's feet and out of the fight (`tide-drain`) | `tide-call`: the drag, first heard; music ducks | on board | — | break the round |
| 1 | Edge · extreme close-up | 600 (380) | on the glove over the water's edge, Dutch −5°, a slow push | `ult:tide-strain` (`root: false`): the fingers spread as wide as they go and tremble; the spark a cold point in the palm | `tide-edge`: the sand at a hand's scale; cobalt rim from the right (the sea) | the sea's edge backing away from the fingertips, its foam line thinning, the sand it leaves shining and dulling, a thread of water running out of a footprint (`tide-edge-water`) | `tide-drag`; the held tone begins (`tide-strain`) | no | cut | identity: the hand holding the sea off |
| 2 | Flats · wide-hero | 880 (—) | wide from the beach, the Tidecaller left with the arm out, the row on the flats, the sea right; a slow drift right | `ult:tide-strain` | `tide-flats`, plainly lit (exposure 0.72): the posts, the hull, the sand shining | the sea going out across the whole flat, its foam line sliding seaward past the row, banking on the horizon (`tide-sea`) | **motif**; the drag far off | **the real row**, on the sand, watching the water go (`anticipate` → `block`) | whip 110ms | stakes and target; title |
| 3 | Strain · low-angle | 460 (300) | up at the Tidecaller from the sand, Dutch 8° → 11°, pushing in | `ult:tide-strain` at full size: the arm shaking, the hat's tip streaming seaward, the hem pulled, the eye-lights | `tide-flats` from low; cobalt back light growing | the horizon banking behind it (`tide-sea`, `bank`) | `tide-strain`: the held tone rising, creaking | no | cut | escalation: the weight of it |
| 4 | Bare · the quiet | 520 (360) | level with the sand, all but locked, the row mid-frame, the horizon behind | the row held, silhouettes against the pre-dawn | `tide-flats`; exposure down (0.36 → 0.3) | threads of water draining seaward past their feet (`tide-drag`); one fish flapping (`tide-fish`); the line of the sea on the horizon thickening (`tide-sea`, `bank`) | **music ducked to 5%**; the flap, a trickle, then nothing (`tide-hush`) | **the row**, silhouettes, holding | cut | the quiet: the seabed bare |
| 5 | Undertow · impact | 760 (560) | side-on and low on the row; from 0.3 the camera **goes down under the surface** | `ult:tide-release` (contact 80ms): the arm drops, small on the beach at the left | `tide-flats`; exposure up on the hit, then the murk | foam across the lens (`tide-foam-wipe`); the sea back as a level through the whole frame on a **70ms cobalt two-tone**, foam riding the line, the row struck, dragged seaward and tilted, the target pulled under; then from under: the surface a bright ceiling, bubbles, everything dragged right (`tide-return`) | `tide-impact` layered; **150ms stop**, heavy shake; `tide-under` as the camera goes down | **every enemy** `hurt`, shoved and tilted; the target under | the foam, in-folder | impact: the damage on the frame; "Let go." |
| 6 | Ebb · return | 700 (480) | battle camera | real Arcanist `ult:tide-lower`: the arm comes down, the hand shaken out, the spark back | real battlefield; bars open | every real enemy standing in water that is still running out past it, seaward streaks and foam at its shins, the target's deeper (`tide-standing`) | `tide-after`: the drag again, softer, and the motif's last two notes; tail | on board | flash 80ms | release: Wet and Weak, where it matters |

### Boss framing

In **Flats** the camera pulls back to take in a Collector's height on the
sand. In **Bare** a boss stands to the right of centre, smaller, so the
horizon stays clear over it. In **Undertow** the camera frames the boss
whole, the water's level rises to its chest rather than over it, its shove
and tilt are small and the camera goes down only to its waist, so a boss is
in the sea, not swallowed by it. Large framing (the Iron Bulwark) sits
between.

### FAST

Drops **Flats**. The title rides **Strain**. It keeps the edge, the strain,
the quiet and the undertow.

## Performance, without a face

The Arcanist is not one of the five face heroes. Debt of Thunder looks under
the brim; Still Life acts with a pinch and a stopped hat; Dry Flood with a
pour. Undertow acts with **the open hand held out** (the drawing's rest
gesture, taken to its limit: fingers spread, the arm straight, the whole body
leaning back against the pull), **the hat's tip streaming seaward** (it flops
every round; here the wind that goes out with the water holds it out
straight), **the spark as a cold point** that goes out when the hand drops,
and **the eye-lights**. No part was added to `Arcanist.tsx`.

## Notes from the lab

(Filled in as built.)
