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

The atlas predates the second class wave, so Broker, Herald, Reaver and Beguiler borrow the closest silhouette — Ranger, Warden, Vanguard and Arcanist respectively — and are separated by palette in `Sprite.tsx` and `style.css`. Deriving a variant by recolouring is ordinary pixel-art practice, but these four still read as recoloured versions of another class rather than their own characters. The fix is an atlas regeneration adding four cells plus four entries in `cells`; the `derived` map and the `.sprite-<class>` filters then disappear. Do not describe these as bespoke class art. The filters normalise through `sepia()` first because a bare `hue-rotate` drags the atlas's reds into magenta.

Sprites appear in hero selection, battlefield, Guild Hall, auction host, rewards and results. `PixelIcon.tsx` provides source-authored coin, sword, shield, gavel, gem, crown, skull, leaf, fire and question icons. Actual equipment still uses category icons; unique per-item art is future work.

## Screen decisions

Guild Hall: compact invitation form beside a small tavern tableau. Lobby: four character stages with clear selection borders. Combat: two columns preserve explicit front/back labels and reduce vertical scrolling. Intentions sit above enemies as speech panels, with damage and targets in text. Auctions: the skeleton host speaks beside a framed item pedestal. Maps use pixel room icons and dashed route connectors.

## Next art work

Actual multi-frame attacks/casting/hurt animations; biome floor/background tiles matching the sprite pixel density; distinct item icons; responsive status popovers; event illustrations. Current stepped idle movement is CSS presentation, not a skeletal or sprite animation system. Avoid marketing language that implies commissioned human art or production-ready animation coverage.
