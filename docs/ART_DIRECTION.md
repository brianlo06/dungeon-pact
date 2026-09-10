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

### Second atlas — cell manifest to generate

`Sprite.tsx` already supports a second sheet. Producing
`public/art/characters-v2.png` and filling in the `v2` constant is the whole
integration; no other code changes, and the borrowed cells and palette filters
stop being used automatically.

Required: a **2×2 equal-cell RGBA sheet**, transparent background, each cell
square and the character centred with a few pixels of margin. Match v1's
density — its characters read at roughly 64×64 logical pixels with hard
outlines and two-tone shading. Row-major order:

| Cell | Class    | Read                                                                                                                          |
| ---- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 0    | Broker   | A ledger-carrying dealer. Long coat, coin pouches, scales or an abacus, a quill. Amber and brass. Reads as money, not combat. |
| 1    | Herald   | A standard bearer. Tabard, horn or banner on a pole, laurel. Pale gold and bone. Upright, chin high, inspiring not armoured.  |
| 2    | Reaver   | A blood-priced berserker. Bare arms, torn straps, a heavy notched cleaver, bandages showing old wounds. Crimson and iron.     |
| 3    | Beguiler | A crooked-tongue manipulator. Hood over a half-mask, trailing ribbons, puppet strings or a mirror shard. Violet and green.    |

Style constraints to carry into any prompt: chunky 2–3 px dark outlines, flat
fills with one highlight and one shadow tone per material, no gradients, no
anti-aliasing, no drop shadows, no ground plane or background scenery, scruffy small
adventurer proportions with roughly a 1:3 head-to-body ratio, and a palette of
ink purple, dusty violet, rust orange, bone and amber. Each character faces
three-quarters toward the viewer in a ready stance.

Whatever tool produces it, record the provenance in ASSET_LICENSES.md and do
not describe generated output as commissioned human illustration.

### Current placeholder

The atlas predates the second class wave, so Broker, Herald, Reaver and Beguiler borrow the closest silhouette — Ranger, Warden, Vanguard and Arcanist respectively — and are separated by palette in `Sprite.tsx` and `style.css`. Deriving a variant by recolouring is ordinary pixel-art practice, but these four still read as recoloured versions of another class rather than their own characters. The fix is an atlas regeneration adding four cells plus four entries in `cells`; the `derived` map and the `.sprite-<class>` filters then disappear. Do not describe these as bespoke class art. The filters normalise through `sepia()` first because a bare `hue-rotate` drags the atlas's reds into magenta.

Sprites appear in hero selection, battlefield, Guild Hall, auction host, rewards and results. `PixelIcon.tsx` provides source-authored coin, sword, shield, gavel, gem, crown, skull, leaf, fire and question icons. Actual equipment still uses category icons; unique per-item art is future work.

## Screen decisions

Guild Hall: compact invitation form beside a small tavern tableau. Lobby: four character stages with clear selection borders. Combat: two columns preserve explicit front/back labels and reduce vertical scrolling. Intentions sit above enemies as speech panels, with damage and targets in text. Auctions: the skeleton host speaks beside a framed item pedestal. Maps use pixel room icons and dashed route connectors.

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
