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
