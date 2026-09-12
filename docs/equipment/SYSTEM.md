# Visible equipment

## Audit of the starting repository

- **Authority:** `Player.items: string[]` in `src/shared/model.ts`. There is no `hero.equipment` field. IDs include both equipped gear and carried supplies. Keeping this representation avoids a second authority or save migration.
- **Slots:** weapon, armor, relic; supplies are carried, stack separately, and are not wearable. Auction purchase replaces and surrenders the previous item of the same wearable slot. Engine primitives, item statistics, prices, curses, trigger conditions, supply behavior, and auction rules are unchanged.
- **Rig construction:** eight authored React SVG cutouts in `src/client/components/heroes`, a common 100×100 viewBox, ground at y=97. `useRigParts` attaches stable named SVG groups to `Animator`. A shared RAF updates ancestor transforms without React renders on each frame. Body, head, limbs, weapons, and secondary accessories have independent tracks.
- **Original weapons:** Vanguard's sword includes a nested wrist/blade; Ranger has bow, draw arm, and arrow; Arcanist holds a casting spark and a book; Warden a lantern staff; Broker swings a ledger while keeping scales; Herald carries a banner and horn; Reaver a cleaver; Beguiler a mirror shard and puppet control. Their silhouettes were fixed authored art.
- **Original equipment appearance:** purchased item IDs were never provided to hero SVGs. No purchased weapon, armor, or relic changed appearance. Shields, capes, headgear, and held props were class art, not representations of run ownership.
- **Original Collector:** `effects(seize)` removes item IDs from `Player.items`, puts `{playerId,itemId}` in the Strongbox's `holding`, and emits SEIZED. `release` restores held IDs and emits RECLAIMED. Chains, vault locks/count, and a generic reclaim burst already existed. Fixed hero art did not disappear or change. Supplies are excluded from seizure. A broken box ends further seizures.
- **Metadata home:** optional `ItemDef.visual`, alongside existing item content in `src/content/items.ts`. Reusable vector assets live in `src/client/equipment/assets.tsx`; renderer code selects assets, never item names.

## Composition contract

`EquipmentProvider` accepts authoritative item IDs, plus optional local preview/highlight and authoritative pulse cues. `GearMount` is an actual SVG group nested within the corresponding animated part. It renders the metadata's attachments. Mount and item keys stay stable through animation and normal renders. `BaseWeapon` keeps the authored SVG/ref tree mounted but hidden while replacement gear is present; removal immediately exposes it again. Down/revive only transform ancestors and never clear equipment.

Metadata (`src/shared/equipment.ts`):

```ts
visual: {
  slot: 'weapon',
  accent: '#f55b72',
  attachments: [{ anchor: 'mainHand', layer: 'weapon', asset: 'blood-blade' }],
  replacesBaseWeapon: true,
  reaction: 'blood',
  attack: 'blood',
  // Optional: rigOverrides: { skinOrRigKey: [/* replacement mounts */] },
  // Optional: fallback: 'generic' | 'hidden'
}
```

Attachments may add x/y/rotation/scale relative to the authored socket. The equipment metadata never selects an ability or changes a hit, damage, target, status, timing, or resource rule. `RigContext` resolves overrides by presentation rig identity; future skins can supply their own rig key/mounts without item-specific code in battle components.

### Sockets and deterministic layers

SVG document order, not per-item z-index, defines occlusion:

| Socket       | Animated parent      | Layer             | Placement                          |
| ------------ | -------------------- | ----------------- | ---------------------------------- |
| back         | actor root           | back              | 40,50 before authored body         |
| torso        | body                 | body              | 48,57 over trunk, below later arms |
| shoulderBack | body                 | front within body | 37,49                              |
| waist        | body                 | front within body | 39,73 Vanguard; 42,74 others       |
| head         | head                 | front within head | 48,29                              |
| mainHand     | existing weapon part | weapon            | weapon geometry before fingers     |
| root         | actor root           | front             | 50,60 after authored figure        |

Head, back, and root sockets are available for future content; the initial catalog uses mainHand, torso, shoulderBack, and waist. Layer names describe order **within the animated parent**. A front shoulder remains below a separately authored foreground arm. World combat/status VFX remain outside this tree.

### Rig calibration / base identity

| Rig      | mainHand parent | Position  | Rotation / scale | Base hidden                             |
| -------- | --------------- | --------- | ---------------- | --------------------------------------- |
| Vanguard | sword → blade   | 31,64     | −26° / 1         | blade only; sword arm and shield remain |
| Ranger   | bow             | 76.5,58.5 | 0° / 1           | bow geometry; arm and grip remain       |
| Arcanist | hand            | 77,53     | 12° / 1          | casting spark; glove, robe, book remain |
| Warden   | staff           | 28.5,61.5 | −25° / 1         | staff and lantern; arm remains          |
| Broker   | ledger          | 29.5,61.5 | −26° / 1         | ledger geometry; hand and scales remain |
| Herald   | banner          | 69,58     | 0° / 1           | staff and flag; hand and horn remain    |
| Reaver   | cleaver         | 31,67     | −128° / .82      | cleaver geometry; arm and wraps remain  |
| Beguiler | shard           | 29,62     | −12° / 1         | shard; fingers and puppet remain        |

These are rig calibrations, shared by every item. **No item-specific hero overrides are needed in the initial catalog.** Ranger's shared bow construction combines the item's distinct limb path and its mechanical center; its arrow inherits the equipped weapon's accent and follows the existing arrow group. World projectiles use the equipped weapon's accent. Other heroes keep their existing action vocabulary.

## All twelve items

Idle glow is a bounded opacity pulse on a small detail. No equipment has a continuous blur, animated gradient, or particle generator. Armor covers a limited torso/shoulder area and relics remain small enough to preserve head and class silhouette.

| Item (content ID)                 | Slot / assets                            | Concept                                                          | Attachment / layers                 | Idle                  | Authoritative trigger                               | Attack                                    |
| --------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- | ----------------------------------- | --------------------- | --------------------------------------------------- | ----------------------------------------- |
| Stormglass Needle (`stormglass`)  | weapon / storm-needle                    | tapered glass conductor, metal collars, internal lightning       | mainHand / weapon                   | small lightning arcs  | energy ring at weapon                               | lightning-colored trail/bolt, angular bow |
| Blood Price (`blood-price`)       | weapon / blood-blade                     | dark thorned forge blade, red fault line, barbed guard           | mainHand / weapon                   | cursed crack pulse    | violent red fracture pulse, including curse payment | red trail/bolt, barbed bow                |
| Copper Conductor (`conductor`)    | weapon / copper-siphon                   | copper bypass pipes, glass water reservoir, condensation droplet | mainHand / weapon                   | droplet pulse         | weapon-origin pulse                                 | water accent, stepped pipe bow            |
| Quarry Lens (`lens`)              | weapon / quarry-sight                    | brass sight and lens, targeting crosshair                        | mainHand / weapon                   | sight glint           | sight-origin pulse                                  | precision accent, angular sight bow       |
| Cinder Thread (`cinder`)          | weapon / cinder-spindle                  | forged spool holding a looping ember filament                    | mainHand / weapon                   | ember thread pulse    | ember-origin pulse                                  | ember trail/bolt, curved filament bow     |
| Widow’s Promise (`venom`)         | weapon / widow-hook                      | hooked injector blade, toxin ampoule, split guard                | mainHand / weapon                   | toxin seam pulse      | weapon-origin pulse                                 | toxin trail/bolt, hooked bow              |
| Briar Mantle (`thornmail`)        | armor / briar-mantle + briar-shoulder    | metallic vine vest, thorned mantle shoulders                     | torso / body + shoulderBack / front | small thorn sheen     | thorn flare on onHurt dispatch                      | none                                      |
| Bastion Heart (`bastion`)         | armor / bastion-plate + bastion-shoulder | interlocked reinforced plate, shield seams, rivets               | torso / body + shoulderBack / front | shield seam pulse     | shield outline when round-start passive dispatches  | none                                      |
| The Living Chalice (`shared-cup`) | relic / living-cup                       | ornate little cup, restorative liquid                            | waist / front                       | liquid pulse          | healing cross on afterHeal dispatch                 | none                                      |
| Wellspring Stone (`wellspring`)   | relic / spring-stone                     | mineral in a brass belt setting                                  | waist / front                       | soft stone rune pulse | healing cross on round-start dispatch               | none                                      |
| Gilded Fang (`bounty`)            | relic / gold-fang                        | ivory fang in gold collar, small contract loop                   | waist / front                       | gold glint            | three coins on onKill dispatch                      | none                                      |
| Arcane Reservoir (`reservoir`)    | relic / arcane-cell                      | capped arcane energy cell                                        | waist / front                       | crystal pulse         | inward energy strokes on round-start dispatch       | none                                      |

There are also generic weapon, armor, and relic assets. All 12 current wearable items have final authored assets; none currently uses a fallback. Supplies intentionally mount nothing.

## Authoritative events and replay

`Beat.equipment?: EquipmentCue[]` adds source identity without duplicating conditions. A cue contains action (`trigger`, `seize`, `return`), ownerId, itemId, and optional containerId. The engine emits trigger cues exactly where it dispatches item effects, including the existing generic curse cost. These describe **passive activation**, even where a capped resource or full health makes the net arithmetic zero.

Trigger-only beats have zero pacing budget: the pulse accompanies existing actions rather than extending the six-second replay policy. SEIZED and RECLAIMED retain their existing combo beats and gain exact transfer identities. `equipmentBefore` reverses only those ownership deltas from the received final snapshot; `equipmentStep` applies them at their beats. It does not derive a trigger from health, status, kills, item text, or prices. Pending replay is rewound on the first render to prevent a one-frame ownership flicker.

The Strongbox displays up to six actual item silhouettes behind bars; the count still reports the complete holding list. Transfers use the same asset as a bounded spectral visual. Equipped layers disappear on seizure and restore on return. Reconnect/skip uses the latest snapshot directly. Surrendered auction items are absent from current item IDs and never get resurrected by a cosmetic cache.

## UI and development

- Auction: revealed equipment has local hover/focus try-on, a PREVIEW label, translucent preview geometry, subdued actual gear, and blur/mouse-leave restoration. Hidden auction identities are never looked up. No intent is sent for preview.
- Inspection: each hero's Build control opens three slot descriptions. Hover/focus highlights the corresponding mounted gear, including both armor pieces.
- Results: the actual Results component passes final item IDs into Sprite. No persistence, screenshot storage, or authoritative cosmetic field was added.
- Battle Lab links to `/dev/equipment.html`. The workshop supports all heroes, three slots, unequip/cycle, passive visual triggers, seizure/return, preview, front/back movement, idle/anticipation/attack/hurt/down/revive, and pose freeze. Its direct art controls are local development simulation; production triggers consume engine cues.
- Workshop URLs accept `hero` and comma-separated `items`. `?screen=auction` and `?screen=results` show the actual UI components against development fixture snapshots.
- `node scripts/capture-equipment.mjs` generates 17 PNGs and `.screenshots/equipment/index.html` against the local server on port 5399. Captures are ignored by Git, consistent with existing repository practice.

## Validation and performance

`validateContent()` returns presentation warnings separately from gameplay validation. The browser's development build also validates registered asset keys. Tests require all current artwork and valid anchor/layer metadata. An unknown asset uses a generic slot visual; absent metadata does the same; explicit hidden fallback suppresses the optional art. Missing optional art never rejects room creation.

No new animation loop is introduced. Rig transforms continue using existing stable SVG/DOM nodes. Asset primitives use no SVG IDs and no filters. Strongbox gradient IDs are now instance-scoped. Highlight filters exist only during inspection, and spectral drop shadows only during a short transfer. Weapon-specific trails remain bounded; relic reactions contain at most three coin shapes.

The implementation retains the existing choreography/timing. It does not add measured approach/contact travel, a new presentation clock, or new projectile flight timing. Those belong to the separate choreography work described by the user. The captured contact frame is an authored attack contact pose, not evidence that a new traversal system has been completed.

### Verified measurements and checks

- Production build succeeded; final TypeScript and `git diff --check` passed.
- 305 unit tests across 26 files passed, including five new equipment contract/authority tests.
- Seven equipment browser scenarios cover all four supported viewport sizes (28 cases). All passed, with the four matrix/down-revive cases rerun after normalizing JavaScript signed zero in the comparison.
- The existing combat-layout and party suites passed all 196 cases across 1280×720, 1366×768, 1440×900, and 1920×1080. These include ActionFan collisions, HUD/nameplate visibility, stage bounds, downed heroes, and replay layout.
- Captures completed with zero browser page errors. Workshop SVG measurements: base Vanguard 79 descendants; Blood Price + Bastion + Gilded Fang 104 descendants (**25 extra SVG nodes**, four mounted pieces). Both have zero SVG filters. This is a structural cost measurement, not a claim about frame rates on all devices.
- Build output: 646.73 kB JS / 186.04 kB gzip, 57.44 kB CSS / 13.57 kB gzip. The existing single-bundle size warning remains; no code-splitting or unrelated packaging change was made.
