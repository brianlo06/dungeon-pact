# Art direction — The Last Lantern

2026-09-11 · presentation revision 0.3

User feedback: the first presentation felt AI-generated and lacked an indie game identity. Replace its ornate serif typography, gold glow, abstract glyph characters and oversized atmospheric panels with a coherent pixel dungeon direction.

## Visual language

- Ink-purple shadows (#211e2c), dusty violet stone, rust-orange fire, bone text and amber coins. Sage and blue distinguish hero identities without becoming the sole status signal.
- Silkscreen headings, locally hosted under its SIL Open Font License; system Verdana for longer gameplay text. Pixel type is restrained to names, labels and buttons. No remote font dependency.
- Hard 2–4 px outlines, offset shadows, small flat highlights. Gradients are used only to draw repeating stone seams, never as glossy card lighting.
- Scruffy small adventurers with distinct silhouettes and equipment. Every combatant is now authored SVG drawn in source — see _Art medium_ below. Only the auctioneer and the reward chest still come from the generated atlas. None of it is commissioned or hand-painted by an artist, and it should not be described that way.
- Source-authored pixel-grid tavern environment and 16×16 UI icons. These can be edited as geometry without regenerating character art.
- Idle motion uses small stepped translations. Reduced motion disables animation and transitions globally.

## Asset contract

**The atlas now serves only the auctioneer and the reward chest.** Every hero and enemy is drawn in source, and `Sprite` renders a drawn hero in place of its cell wherever one is asked for, so the cells below are no longer what anyone sees. The contract is kept because the two remaining cells still depend on it.

`public/art/characters-v1.png`: 4×4 equal-cell RGBA atlas, generated at 1254×1254. Row-major mapping in `Sprite.tsx`: Vanguard, Arcanist, Ranger, Warden; Stoker, Bulwark, Acolyte, Mender; Hound, Sniper, Thief, Bellows; Collector, Miser, Auctioneer, Chest. CSS background-size 400% isolates cells without image transformation. Do not change the layout without updating the coordinate contract.

### Second atlas

`public/art/characters-v2.png`: 2×2 equal-cell RGBA atlas, 512px cells, holding
the classes added after v1 was generated. Row-major mapping in `Sprite.tsx`:
Broker, Herald; Reaver, Beguiler. `Sprite` picks the sheet per id, so the two
atlases coexist and a third would only need another entry.

Each character was generated separately against a flat pure magenta #FF00FF
field, then keyed, trimmed and centred by `scripts/build-sprite-sheet.py`. A
flat threshold on the key leaves a purple fringe, because the edge pixels are
part sprite and part background; the script instead neutralises the key's
contribution across a band and feathers alpha through it.

Style is held by the prompt in `scripts/generate-sprites.ts` plus two cropped
v1 cells supplied as visual reference. The reference is what fixes proportions:
described in words alone the model produces slim modern figures, and shown a
cell it matches the chunky big-head builds. Two further rules matter — ask for
exactly one character alone in frame, since a multi-character reference makes
it compose a scene; and state the whole body from head to feet must be visible,
or it crops to a bust.

Cell subjects, for regeneration: Broker, a stout spectacled money-dealer with a
ledger, coin pouches and brass scales in amber over violet. Herald, a standard
bearer with laurel circlet, sun-sigil banner and horn in pale gold and bone.
Reaver, a scarred bare-armed berserker with bandaged forearms and a notched
cleaver in crimson and iron. Beguiler, a hooded figure in a cracked porcelain
half-mask with puppet strings and a mirror shard in violet and sickly green.

## Screen decisions

Guild Hall: compact invitation form beside a small tavern tableau. Lobby: eight
character stages in two rows with clear selection borders. Combat: two columns
preserve explicit front/back labels and reduce vertical scrolling. Intentions
sit above enemies as speech panels, with damage and targets in text. Auctions:
the skeleton host speaks beside a framed item pedestal, with the lot's position
in the exchange's sequence in the eyebrow.

Maps draw the route as a branching descent. Links are stroked between the
chambers they actually join, so a fork looks like a fork; reachable chambers
are lit while everything else recedes; the party's position carries a pin; and
the whole route fits one screen and ends on the vault. It reads as a route at a
glance rather than a list to scroll. This depends on the generator: chambers
feed a contiguous span of the layer below, which is what keeps links from
crossing.

Mentors: the offered path beside the fee and a live roster of who has committed,
so the treasury draining is visible while the party decides.

## Combat presentation

A resolved round arrives from the server in one message. The client replays it
as timed beats rather than snapping to the aftermath: the acting unit is
spotlit while the rest of the board dims, the move announces itself as a skewed
Silkscreen callout, the target flashes and shakes, and a floating number rises
off it. Reactions get a full-width banner. The influences are Persona's
stylised turn presentation — typography, layout, colour and animation carrying
the theme rather than new mechanics, and every action on its own button with no
scrolling — expressed in this game's pixel palette rather than Persona's.

Timing is short and overshoots slightly; nothing lingers. A long round scales
its step duration down so replay never exceeds about four seconds, and a Skip
control is always present. Reduced motion disables replay entirely and shows
the settled board immediately, so the animation is never load-bearing for
information — the chronicle still carries every event in text.

Impacts layer a filtered noise burst under the tone cue, because a pure
oscillator reads as beeping rather than hitting.

The beat system drives each combatant's rig: a hero's action plays the clip its
ability implies (a strike, a signature, a cast on an ally, a brace), an enemy's
plays a cast when aimed at another enemy and a brace when aimed at itself, and
the hit, the fall and the revival each have their own clip. The authored
`windup` and `signature` clips on the two bosses are not yet asked for by
anything.

## Next art work

Biome floor/background tiles; distinct item icons; responsive status popovers; event illustrations; the auctioneer and the reward chest, the last two atlas cells. Avoid marketing language that implies commissioned human art.

## Art medium — the decision, and why

**Authored SVG cutout rigs, for every combatant.** This replaces the earlier
hybrid — pixel sprites for heroes and ordinary enemies, rigs for bosses —
which is kept below because its reasoning still holds for what it rejected.

The hybrid assumed rigs were the expensive option, justified only where a
creature had to carry weight. Drawing the boss encounter disproved that: each
of the Collector, the Strongbox, the Bulwark and the Mender took roughly one
pass, and the pipeline — a named-part SVG, a keyed-pose rig, a silhouette
test and a facing test — was then applied to the other fifteen combatants in
parallel. A pixel sprite that animates convincingly needs a frame sheet per
action per creature; a rig needs one drawing. At this team's size that
settles it.

The cost is that the creatures are vector, not pixel. What ties them to the
pixel interface is the hard ink outline (#171420), the palette, the flat
upper-left light and the chunky proportions — not the rendering. If the two
ever read as different games, that is where to look first.

What was rejected, and still is: high-resolution illustration costs the most
per asset and is the hardest to animate, and the first thing to suffer would
be the number of enemies. Pure pixel art cannot give a boss believable heft
without dozens of hand-drawn frames per action.

## Sprite and rig conventions

**Frame sheets.** Nothing uses these now; they are the convention should a
creature ever be drawn as a raster sheet instead. One horizontal strip per clip.

```
art/heroes/vanguard/
  idle.png      256×256 per frame, 8 frames, 12fps, loop
  attack.png    256×256 per frame, 9 frames, 18fps, once
  hurt.png      ...
```

- **Cell:** square, power of two, 256×256 at the current target.
- **Anchor:** bottom-centre of the cell is the character's ground point. The
  stage positions by ground point, so a sprite that floats inside its cell will
  float on the battlefield.
- **Headroom:** leave the top 10% clear. Intent chips and damage numbers sit
  there.
- **Transparency:** straight alpha, no matte.
- **Scaling:** `image-rendering: pixelated`, integer-friendly sizes.
- **Naming:** the clip names in `shared/presentation.ts` and nothing else.

**Transform rigs** live in `client/battle/rigs*.ts` as keyed poses — the
party in `rigs-party.ts`, the foundry creatures in `rigs-forge.ts`, the
Counting House in `rigs-debt.ts`, the first four in `rigs.ts`. Each drives the
named `<g>` parts of an authored SVG creature, registered by sprite set in
`components/creatures.ts`. A part a rig never mentions stays still, and
`flash` is applied to the whole figure only — inside a part track it does
nothing.

**Motion is in screen space, in the creature's own facing.** The animator
knows nothing about sides. A hero's strike travels towards positive x and
recoils towards negative; an enemy's is the reverse. The first three creatures
were written the other way round and lunged away from the party for a whole
pass before anyone noticed. `tests/rig-facing.test.ts` and
`tests/party-rigs.test.ts` hold every rig to its side; the Rivet Sniper, whose
impact pose is a gun's kick, is the one named exception.

## Animation principles

Every action reads as **anticipation → action → impact → recovery**. A strike
that begins at the moment of contact reads as a teleport no matter how fast the
rest of it is; the pull-back is what makes it legible and heavy. Light actions
compress this, they do not skip it.

Weight is communicated by how little a thing moves when hit. The Vanguard
recoils; the Collector barely shifts. That asymmetry is most of what separates
a boss from an enemy.

Idles never synchronise. Every unit starts its loop at a random phase and
creatures carry their own period, because a row of things breathing in time is
the clearest possible signal that a battlefield is a spreadsheet.

## Creature direction — the boss encounter

These four appear together and are the coherence test for the whole bestiary.

**The Collector.** _Drawn._ A creditor, not a wizard: a hooded, beaked figure
in a flaring robe, a crown of small keys, seals hanging clear of the hem on one
side, a ledger swinging on a chain, and an oversized key held outboard that
doubles as its weapon.

It is built as a **cutout rig** — `key`, `ledger`, `chains`, `seals`, `head` and
`mantle` are separately animated parts — which is the documented approach for
bosses and the first thing to use it. Everything that hangs off it lags behind
the body, and that lag is most of what sells the weight. It barely moves when
hit; the key falls out of its grip when it dies.

The silhouette rule is not decoration. The first version of this design failed
its own test: filled flat black it read as a squat lump. It was redrawn taller
and deliberately lopsided so the key, the beak and the hanging seals all _break_
the outline, with real negative space between the key and the body. Run that
test on anything new — fill it black against a dimmed stage and see whether you
still know what it is.

**The Strongbox.** Built to contain confiscated power, not to store treasure.
A squat riveted vault, gold strapping, a lock per item taken, a contract seal
across the face, chains wrapping the hull. Light escapes the seam when it is
holding something. _This is now authored art rather than a placeholder._

**Iron Bulwark.** _Drawn._ A defensive frontliner whose anatomy says so before
its intent does: the entire forebody is one angled plate with a lit leading
edge, the centre of gravity is on the floor, splayed feet brace it, and a visor
slot is the only opening. A ram boss juts from the plate and two exhaust stacks
rake back off the shoulders.

Rigged as `shield`, `ram`, `legs`, `stacks`, `visor`. Its idle is almost
nothing — only the exhaust moves. On a ram the plate and boss arrive first and
the legs catch up; when it is hit the plate takes it and the machine behind
barely registers. That is the opposite of the Mender, deliberately.

**Kiln Mender.** _Drawn._ A forge surgeon, and deliberately not cute: a swollen
bellows sac for a body with heat seams glowing through the hide, carried high
on thin legs, a flue venting off its back, a single working lens instead of a
face, and three instrument limbs ending in heated clamps.

Rigged as `bellows`, `armA`, `armB`, `armC`, `head`, `flue`, `legs`. The sac
drives the rhythm and everything else twitches off that beat. Repairing is a
welding motion — the clamps reach in and work in short bursts. Hit, the limbs
flail; killed, the sac empties and the legs buckle.

All four are drawn: the Collector, the Strongbox, the Iron Bulwark and the
Kiln Mender.

**Facing.** Enemies face the party, which is to their left; heroes face the
enemies, to their right. The raster atlas is drawn facing right and is flipped
in CSS; authored SVG is drawn facing the right way already and must _not_ be
flipped. Getting this wrong pointed a battering ram away from the people it
charges, and there is a test for it now. The motion has the same rule — see
_Sprite and rig conventions_.

## Creature direction — the rest of the bestiary

**Cinder Stoker.** _Drawn._ A furnace hand, not a soldier: stunted and hunched
under a coal hod, one forearm grown huge from feeding the fire. Wide and low —
a lumpy coal heap on its back with a shovel stuck in it, a peaked cap and
goggles sunk between the shoulders, long branding tongs held out with a lit
coal in the jaws. The opposite shape to the Acolyte, which it fights beside.
Rigged as `legs`, `hod`, `body`, `head`, `arm`. A labourer's shrug for an idle,
with the hod settling a beat late; it rears back with the coal high and jabs
it home. Killed, it goes over backwards under the load.

**Ash Acolyte.** _Drawn._ A faceless furnace zealot: an iron brazier burning on
a thin neck, a charred mantle, an ember stole, a ragged hem that sheds ash. It
hangs in the air rather than walking. A tall pale column with fire on top and
one bell sleeve reaching out; no hood, because the Collector is the hooded one.
Rigged as `hem`, `robe`, `offArm` (a censer), `head`, `castArm` with a nested
`ember`, and `cinders`. It drifts; to cast it draws the ember back overhead and
throws it, and a new one kindles in the palm. Killed, the fire goes out and it
folds into its robe. _The weakest silhouette at back-row size — about 70px,
and the flame can read as a crown._

**Living Bellows.** _Drawn._ A forge bellows that got up and walked: a long,
low concertina of leather pleats between iron hoops, a riveted end-plate with a
glowing grate, the old pump handles standing up in a V, and a flared brass
horn at the front. Six short clawed legs, so the Hound stays the only
quadruped. A horizontal tube carried low, sharing nothing with the Mender's
round sac but the material. Rigged as `handles`, `farLegs`, `pleats`, `plate`,
`snout` with a nested `plume`, `nearLegs`. Everything it does is a breath: a
long visible intake, then everything empties at once and a plume bursts out of
the horn. Killed, it deflates nose-first.

**Slag Hound.** _Drawn._ A lean hound of cooling slag, the cracks still molten
and the mouth lit from inside — the only four-legged thing in the game, and it
reads as fast standing still: pitched forward onto its forelegs, haunches
cocked, head low and level with the party, spikes raked back, a whip of a
tail. Rigged as `tail`, `hindLegs`, `foreLegs`, `body`, `mane`, `head` with a
nested `jaw`. It never drifts; it pants, twitches and flicks. The bite is a
coil, a long flat leap, a snap and a shake, and a hop back.

**Rivet Sniper.** _Drawn._ The design is the gun: a riveting rifle longer than
the gremlin holding it, on an A-frame bipod, fed red-hot rivets from a brazier
on its back. It is small and in the back row, so it reads from one long line
pointing at the party with daylight under it. Rigged as `legs`, `brazier`,
`belt`, `body`, `gun`, `head`. Its idle is aiming — the barrel drifts and snaps
back. Firing is a held beat, then a kick up and back into the stock.

**Coin Leech.** _Drawn._ A glossy ringed leech rearing out of its own coil,
a lip-ringed sucker of gold-capped hooks facing the party, the swallowed coins
showing through a translucent belly. An S-column on a spiral; nothing else in
the game is serpentine. Rigged as `tail`, `lower`, `belly`, `upper`, `head`. A
cobra's sway travelling up the body one joint at a time; it strikes by throwing
the whole column forward, latches, and pulls back as the belly swells. _Clean
rather than menacing._

**The Miser.** _Drawn._ A hoarder, not a creditor — the Collector takes, this
keeps. A hunched, toad-headed thing squatting in a heap of coins, one long arm
always reaching down to the stacks it is counting, a jeweller's loupe screwed
into one eye, a wide lipless mouth with one gold tooth, a shawl sewn with coin
settings across its back.

The shawl is the objective. It reads the same `bank` figure the engine and the
objective strip use: the richer the pact, the more settings are filled, the
more coins stand on edge along its spine, the deeper the heap. A pact that
spent faces a bare, moth-eaten thing with a knuckled spine; a pact that
hoarded faces something crested in gold. While it holds banked Barrier the
coins glow, and they flare when that Barrier soaks a hit.

Low, wide and back-heavy, with no hood, crown or key — none of the Collector's
shapes. It uses the `boss-large` footprint; at `boss` it stood barely taller
than the Bulwark beside it. Rigged as `body`, `shawl`, `hoard`, `stacks`,
`head`, `jaw`, `hand`. Its idle is counting: three taps, a pause, a look up at
the party. It attacks by scooping, drawing back and flinging; it barely shifts
when hit; it dies slumped over its heap as the stacks topple. Its entrance
uses its own mark, a milled coin struck with a tally, and its own two sounds.

It went through four drawings. One of them was drifting towards a hook-nosed,
gold-counting old man — an antisemitic caricature — and the head became a
toad's for that reason. Keep it that way. _The black silhouette is less
iconic than the Collector's key, and the flipped-up lens reads a little like
an antenna._

## Creature direction — the party

**House style.** Every hero is built on one body in `components/heroes/kit.tsx`:
#171420 ink, 2.4-unit silhouette outlines, three-stop colour ramps lit from
the upper left. The head is about a third of the figure, the trunk short and
chunky, the legs stubby, boots pointing at the enemy, the ground line at y 97
and the top ten units clear. Joints sit at fixed places so one rig vocabulary
moves everyone. "Chunky" has to mean wide, because the headroom rule caps
height. The arm that does the work is drawn on top, and a weapon that swings
over the top gets a nested wrist so the arm can turn a full circle and still
end pointing at the enemy. Glows carry `ph-glow` so silhouette checks can
ignore them. Outside combat a hero stands at rest in the box an atlas cell
would have, with a head-and-shoulders crop for the HUD portrait.

**Vanguard.** A flat-topped great helm with a rust crest, a heater shield with
the lantern sigil carried forward as a wall, the sword shouldered up and back,
a cape flaring behind. Slow and planted: the sword comes over the top and
down, the shield leads on a brace, the cape always arrives late.

**Arcanist.** Power carried in the hand, no staff. The face lost under the
widest brim in the party, only amber eyes showing; a starred bell robe, a tome
at the hip, a gloved hand holding a spark. The spark is pulled back and thrown;
for a signature the hand goes up over the hat, and the hat tip is the lag.

**Ranger.** A young scout in a patched green hood, fletching bristling over the
shoulder, a longbow taller than its owner standing upright down the right
side — the Sniper's gun is flat, this bow is vertical. It leans into the draw,
holds, and lets go; the arrow leaves the hand and a new one returns.

**Warden.** A hedge-priest in a torn bone-white mantle, eyes closed, antlers
growing up through the hood, a crooked staff with a hanging lantern. The heal
is the slowest thing it does — staff lifted, open hand offered out, glow held.
When it falls the lantern keeps hanging towards the floor.

**Broker.** Stout and spectacled, flat cap and quill, a violet coat over a
straining amber waistcoat, coin pouches, a brass balance out front and a
ledger under the arm — the widest, roundest body in the line. The pans never
settle; Leveraged strike brings the ledger down over the cap.

**Herald.** A standard-bearer with a laurel, a sun tabard over mail and a
curled horn; the banner pole is the tallest vertical in the party, its flag
flying forward at the enemy. The rallying note is the horn raised and blown;
anything done for allies is the banner lifted and waved.

**Reaver.** A scarred, bare-chested berserker, spiked black mane, bandaged fist
raised, a notched cleaver too big to carry dragged point-down to the lower
left. Reckless: the lunge overshoots, the recovery is a stumble, and hit, it
snarls and leans straight back in.

**Beguiler.** A two-horned violet hood with bells, half the face under a
cracked porcelain mask, a robe coming apart into tatters, a marionette control
held up with a small wooden puppet dangling from it, a mirror shard held low.
The Acolyte holds a flame; the Beguiler holds someone. The head tilts too far
and the puppet swings out of time.

_Weaker spots:_ the Arcanist's spark and the Warden's lash are small next to
the melee swings; five of the eight share one round face and are told apart by
what they wear.

## What does not fit

Cute mascots. Enemies that share a footprint. Sprites that stand still. Bosses
that bounce. Anything whose silhouette needs a name tag. Dashed grid cells,
detached stat panels, or an interface that sits beside the battle rather than
inside it.
