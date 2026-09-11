# Art direction — The Last Lantern

2026-09-10 · presentation revision 0.2

User feedback: the first presentation felt AI-generated and lacked an indie game identity. Replace its ornate serif typography, gold glow, abstract glyph characters and oversized atmospheric panels with a coherent pixel dungeon direction.

## Visual language

- Ink-purple shadows (#211e2c), dusty violet stone, rust-orange fire, bone text and amber coins. Sage and blue distinguish hero identities without becoming the sole status signal.
- Silkscreen headings, locally hosted under its SIL Open Font License; system Verdana for longer gameplay text. Pixel type is restrained to names, labels and buttons. No remote font dependency.
- Hard 2–4 px outlines, offset shadows, small flat highlights. Gradients are used only to draw repeating stone seams, never as glossy card lighting.
- Scruffy small adventurers with distinct silhouettes and equipment. All current characters share one generated atlas; its provenance is documented, not represented as human-painted art.
- Source-authored pixel-grid tavern environment and 16×16 UI icons. These can be edited as geometry without regenerating character art.
- Idle motion uses small stepped translations. Reduced motion disables animation and transitions globally.

## Asset contract

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

Still missing: multi-frame character animation. The beat system already knows
when a unit acts, is hit, heals or falls, so an idle/attack/hurt sheet has
somewhere to plug in — that needs the atlas work above first.

## Next art work

Actual multi-frame attacks/casting/hurt animations; biome floor/background tiles matching the sprite pixel density; distinct item icons; responsive status popovers; event illustrations. Current stepped idle movement is CSS presentation, not a skeletal or sprite animation system. Avoid marketing language that implies commissioned human art or production-ready animation coverage.

## Art medium — the decision, and why

**Hybrid.** Large pixel sprites for heroes and ordinary enemies; layered cutout
rigs for bosses, containers and anything that has to carry weight.

The alternatives were weighed and rejected for concrete reasons rather than
taste. High-resolution illustration costs the most per asset and is the hardest
to animate at this team's size, and the first thing that would suffer is the
number of enemies. Pure pixel art cannot give the Collector believable heft
without dozens of hand-drawn frames per action, and that budget does not exist.
Cutout rigging alone fights the pixel assets already in the project.

The hybrid is also what the engine already supports: the animation player takes
frame sheets **and** transform rigs behind one interface, so a creature can be
upgraded from one to the other without touching a call site.

Do not read the current placeholder sprites as the decision. They are 128px
prototypes; the target is 256px cells with real anticipation frames.

## Sprite and rig conventions

**Frame sheets.** One horizontal strip per clip.

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

**Transform rigs** live in `client/battle/rigs.ts` as keyed poses. They exist
so a creature can have anticipation and recovery before it has any artwork at
all, and they stay the right answer for bosses afterwards.

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

All four are now drawn: the Collector, the Strongbox, the Iron Bulwark and the
Kiln Mender. Nothing in the boss encounter is a prototype sprite. The rest of
the bestiary still is.

**Facing.** Enemies face the party, which is to their left. The raster atlas is
drawn facing right and is flipped in CSS; authored SVG is drawn facing the
party already and must _not_ be flipped. Getting this wrong pointed a battering
ram away from the people it charges, and there is a test for it now.

## What does not fit

Cute mascots. Enemies that share a footprint. Sprites that stand still. Bosses
that bounce. Anything whose silhouette needs a name tag. Dashed grid cells,
detached stat panels, or an interface that sits beside the battle rather than
inside it.
