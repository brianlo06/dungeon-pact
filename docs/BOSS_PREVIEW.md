# Boss preview and browser QA

Updated 2026-09-10. This is the Codex presentation work alongside Claude's
consumables, balance, and reliability work.

## Open locally

```sh
npm run dev -- --port 5174 --strictPort
```

Open http://localhost:5174/dev/bosses.html. The preview uses the real `Combat`
component, engine reducer, content, effects, and snapshot filtering. It needs
no room server and does not read guest credentials or write game saves. Its
HTML entry is outside Vite's production entry graph; both the entry and React
mount are development-gated. The production build contains no preview page or
fixture bundle.

Choose either boss, two to four heroes, starting treasury, and a scene:

- **Opening briefing:** the actual first-round formation and objective.
- **Objective intent:** immediately before Repossess or Weight of wealth.
- **After objective resolves:** every hero Braces through the real reducer.
- **Strongbox broken:** after that round, apply a lethal damage effect to the
  box to inspect the real release transition. This shortcut is a visual fixture,
  not evidence about the number of player actions needed to open it.

The fixture finds a seed that generates the requested boss, keeping the real
party scaling and supports. Ada and Bram occupy the front row, with known
equipment so a seizure is easy to inspect. The other heroes occupy the back.
It is a controlled scenario, not a balanced endgame build or a multiplayer test.

To play a turn, choose a hero, select an ability and target, and lock the plan.
Switch heroes to enter their plans, or use **Finish round · others Brace** to
fill unplanned actions. Equipment and recent logs below the arena expose the
settled result. Reset reloads the chosen fixture. Animation is off initially;
the checkbox enables the normal round playback and Skip control.

## Presentation fixes

- Restored combat foundations in `src/client/combat.css`, imported before the
  existing responsive rules. Commit `e463b5e` had removed them with a larger
  route-map CSS replacement: health bars disappeared, card labels ran together,
  and formations lost their grid. The restored rules preserve the prior art
  direction; small-screen intent, HP, and holdings text is now larger.
- The Miser's banner states the 160-gold allowance, 1-per-12 rate, and calculated
  shield. Its intent shows the shield alongside damage, derived from the
  authored bank effect and current treasury.
- The Strongbox says **Container / Optional target**, lists equipment with each
  owner's name, and changes to **Opened / Equipment returned** after breaking.
  The objective becomes **RECLAIMED**, and subsequent Repossess intent text no
  longer promises a seizure that the engine will not perform.
- Barrier-granting intentions also show their authored amount.

## Verification

Browser checks used the live Vite page in an isolated Chrome context:

- Desktop at 1440 × 900; narrow layouts at 390 × 844 and 320 × 740, with no
  horizontal document overflow in the checked boss scenes.
- Collector seizure and release for two, three, and four heroes. Ada and Bram
  lose their Stormglass Needles; the box lists both owners; release restores
  both items and clears its holdings.
- Selecting the Strongbox enables Lock action; locking it produces one locked
  plan and an Unlock control without a reducer error.
- Miser at 700 gold gains 45 Barrier; at 160 gold it gains none. The final
  intent and banner expose the same calculation.
- Legacy rules omit the objective banner and retain the old intentions.
- Enabling round animation starts playback on settlement; Skip immediately
  returns to the settled board.

`npm run build` passes. The full suite passed 80 tests across 11 files during
this pass; after the final UI integration, the 17 fixture, presentation, boss,
and playback tests passed again. The added calculation test compares the
displayed shield with actual engine settlement at 100, 160, 171, 172, 400, and
700 gold. Fixture tests verify real seizure/release and legacy behavior.

This does not replace a full human multiplayer run, reconnect testing, or
balance measurements. Existing game rules and networking were not changed by
this presentation pass.

## Parallel-session note

`Combat.tsx` contains both Claude's earlier consumable-action changes and the
small presentation integration above. Preserve both when staging or committing.
Codex also changed `UnitCard.tsx` and added the combat CSS import to `style.css`;
the fixture, presentation helper/component, and their tests are separate files.

The same `e463b5e` CSS deletion also removed auction foundations (including
`.auction-layout`, `.auction-host`, and `.item-card`). Those rules were not
restored here because auctions are Claude's active area. Compare that commit
with its parent when addressing the auction presentation.
