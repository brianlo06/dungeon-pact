# Red Ledger — Reaver

**The idea, in one sentence:** the Reaver pays first — it clenches its
bandaged fist until the old wound runs and wipes one red stroke of its own
blood across its chest — and the cleaver collects with that stroke: cut once
through the target, and entered again, stroke for stroke, on everyone standing
in its row.

Only the Reaver could have it. Its title is *Pain is just unspent currency*;
its kit is Blood price (lose HP, hit through armour) and Frenzy (lose HP, hit a
row); its Pact Charge comes from sacrifice and from being hurt; and its drawing
is the only bare, scarred body in the party, with a bandaged fist already
spotted red and a notched cleaver it drags because it will not carry it. A
ledger is where a debt is entered: here the entry is a stroke on skin, and the
same stroke is the damage.

## Gameplay purpose (unchanged)

`ultimate-defs/reaver.ts`, target one enemy: the Reaver loses 14 HP, deals 40
through armour to the target and 12 to everything else in the target's row;
+3 Fury. Three results, and the film shows each as **the same mark**: the
stroke on the Reaver (the price), a doubled stroke on the target (paid in
full: 40), and a single stroke on each of the rest of its row (12).

## Space, palette, sound

- **Space:** the pit the Reaver was paid to bleed in. A round sand floor at the
  bottom of a shaft, one hole of white sky far above, one hard pool of top light
  on the sand, a palisade of sharpened stakes around it, and black everywhere
  the light does not reach. Not a hall, forge, storm, wood, causeway, mirror
  room or ridge: a hole in the ground with one light in it.
- **Palette:** ink black, bone sand (`#e6d6b6`), a cold white top light, and one
  crimson (`#ff4d5e`, the Reaver's accent) — used only for what was paid. No
  orange, no molten, no red light: red is never a light in this film, only a
  mark.
- **Signature effect — the entry.** A single brush-stroke of flat crimson, hard
  edged, heavy where it starts and dry-brushed thin where it ends, with one
  drip hanging off its heaviest point. The fist paints it on the Reaver's chest
  (a part of the drawing, hidden at rest); the black impact frame is that
  stroke at the size of the screen; the target is struck through with it
  twice and each of the row once — drawn long and thin across the figure, the
  way a settled account is struck through — landing one after another; on the
  real board it is on everyone who paid, the Reaver included.
- **Motif (original):** a tuned war-drum under a bowed low string — D3, F3,
  then a fall to C♯3, and a D2 thump under the last. Pay, pay, collect.
- **Signature sound:** the entry — a coarse rasp of a fist dragged across skin
  over a single heartbeat.
- **Impact, layered:** a dry chop (transient), a sub drop, a cleaver's body
  thock with the blade ringing (body), and a room tail; the copies land as three
  short stamps under it.
- **The quiet:** music ducked to 3%, one slow heartbeat, then silence; a single
  drop leaves the fist and is the only thing moving.

## Rhythm

identity and price (the clench and the stroke) → stakes and escalation (the
row sees the Reaver come across the pit, dragging the blade; title) → **quiet**
(the face in the dark: brow down, then up, the grin; one drop falls) →
**impact** (a black frame with the stroke across it; the chop; the target
doubled, the row entered one after another) → release (the real board: the
mark on the target, on its row, and on the Reaver, whose HP is gone).

## Shots — FULL 4220ms, FAST 2640ms (63%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Reaver `ult:ledger-clench` — the cleaver comes off the floor, the fist comes up and closes | real battlefield goes to ink, bars close | crimson call aura; a hard pool of white top light lands on the floor round the Reaver (`ledger-pool`) | call bell, the blade scraping up; music ducks | on board | — | break the round: the Reaver steps into its light |
| 1 | Price · detail | 700 (460) | tight on the fist and the chest, Dutch −8° → −5°, pushing in | `ult:ledger-price` — the fist clenched in front of the chest, trembling; the bandage soaks red from inside; then the fist drags across the chest and leaves the stroke; brow down, teeth set | pit, low exposure, top light only | the bandage soaking (`stain` part), drops falling off the fist (`ledger-drops`), the stroke painted (`entry` part) | the clench (bandage creak, heartbeat), **the entry** (rasp) | no | black 130ms (hides the copy settling into the clench) | identity and the price, paid on screen |
| 2 | Pit · reverse target | 1000 (520) | from behind the enemy row, low, slow push across | `ult:ledger-walk` — mirrored, coming across the sand at the row, head low, the cleaver dragged | pit lit: the pool, the stakes, the shaft | the groove the blade drags in the sand, spotted red (`ledger-groove`); motes in the shaft | the drag, footfalls, **Red Ledger motif** | **the real row** as ink in the foreground, bracing | cut | stakes and escalation: what is coming for them; title |
| 3 | Hush · face close-up | 560 (360) | dead still, level, on the face with the fist at the jaw | `ult:ledger-hush` — brow shelf down over shut eyes; at 0.7 the brow lifts, the eyes open, the teeth show | near black (exposure 0.08), only the top light on the brow | one drop hangs off the fist and falls (`ledger-drops`, single) | music at 3%; one heartbeat; silence; the drop | no | cut | the quiet |
| 4 | Collect · impact | 800 (580) | profile, medium wide, Dutch 6° → 2.5°, easing out | `ult:ledger-collect` (contact 0.04) — the cleaver comes over and down, too far, the whole body going after it; target `hurt`, shoved and tilted; the row shoved | pit lit, then settling | **black frame with the stroke across the screen and the number on it** (`ledger-cut`); then the target struck through twice and each of its row once, one after another, each figure knocked back as its line lands (`ledger-entries`); drops thrown | layered chop (transient, sub, thock, ring) + room boom; the copies stamp in; **150ms stop**; heavy shake | **target and row** | cut on a 70ms black frame (FAST: 50ms) | impact: 40 on the frame; "Now you pay." |
| 5 | Settle · return | 760 (480) | battle camera | real Reaver `ult:ledger-settle` — the blade let back down to the floor, shoulders heaving | battlefield, bars open | the stroke on every real enemy hit (doubled on the target) and on the Reaver (`ledger-mark`), dripping | blade on the floor, motif reprise (low), tail | on board | flash 80ms | release: who paid, and what |

## Framing

- **Boss** (`enemy=collector`): in the pit shot the boss's silhouette is too
  big to stand in the foreground, so it is pulled back and to the left edge and
  the Reaver comes across further away; in the impact the camera pulls back to
  the boss's height with the Reaver smaller and the shove small, and the doubled
  stroke is drawn at the boss's chest.
- **A lone enemy in its row:** the target alone takes the doubled stroke; no
  copies, and nothing pretends there is a row.
- **A full row** (`enemy=sniper&party=4`: sniper, mender, bellows): the copies
  land left to right after the target.

## FAST

Keeps all six shots, shorter. The pit shot is trimmed to 520ms (the title
rides it), the price keeps the stroke, and the quiet and the impact keep their
shape. A clip plays at the same speed in both cuts, so the price clip (560ms:
the stroke painted by 370ms, the fist off the chest by 440ms) and the hush
clip (520ms: the eyes open by 350ms) are timed to finish inside FAST's cut of
their shots and hold in FULL's; the entry's sound has a cue per cut.

## Voice

"Hurts. Good. That's what it costs." · "Now you pay." · "Cheap at the price."

## Notes from the lab

- **The chest stroke is solved, not placed by eye.** The fist is pressed to the
  chest and dragged on its own arc (the front arm pulled 12 units towards the
  sternum, turned −40° → +65°); the stroke lies on that arc's chord and its
  paint is kept just under the fist's leading edge (`wipe()` in `poses.ts`,
  `ENTRY` in `Reaver.tsx`). The first version put the stroke on a chord the
  forearm then covered; the fist now goes back up to where it rests, so the
  whole stroke is seen.
- **Parts hidden at rest.** `stain` and `entry` are drawn outside a clip and
  slid in, so a figure no clip drives (the Reaver as an ally in another film)
  shows neither, and both register only in a close-up, like the face. Both
  are drawn over whatever the chest wears (the tailored vest, the kit's
  armour): the first cut put the stroke under the vest.
- **The stroke is paint, not a wound**: most of the Reaver's chest is its vest,
  so the stroke is a smear of the fist's blood over cloth and strap, which also
  keeps it well short of gore.
- **Row marks.** A copy of the stroke at its own proportions, on a small enemy,
  read as red tape or a claw; drawn long and thin across the figure (the same
  shape, scaled across to 0.36–0.46) it reads as a strike-through.
- **Silhouettes glow gold** unless the shot sets a back light: the silhouette
  look's glow reads `--back-c`, so the pit sets `back: [bone, 0]`.
- **No flash after the black frame**: a flash accent washed the returning
  picture out; the black frame alone is the accent.
- Sounds were rendered offline and measured: the layered cut peaks at 1.30
  (The Hundredth Mark's impact 1.30, the Anthem's chord 1.35); the heartbeat
  under the quiet peaks at 0.27.

## What the engine could not do, and what was built instead

- **Root tracks do not play on a film's copies** (verified by the lead; to be
  fixed centrally). Every whole-body move the film needs — the Reaver's lunge,
  sink and lean through the chop, each target knocked back as its line lands —
  is a transform on the copy's `.cine-look`, written by `ledger-entries` and
  reset when the shot unmounts. Root keys are kept small so the framing holds
  when they start playing: `ult:ledger-walk` (bob, 3–4.5° lean),
  `ult:ledger-collect` (x ≤ 0.05, 3–10° lean, squash to 0.88),
  `ult:ledger-price` and `ult:ledger-hush` (≤ 2°, y ≤ 0.016). The battlefield
  clips' roots (`ult:ledger-clench`, `ult:ledger-settle`) already play on the
  real unit. Once the fix lands the chop leans twice (root 9° + look 17°): the
  look's lean should drop to about 8°.
- **Staggered reactions in a row.** A row's `react` clips land together, so all
  targets play `hurt` on the blow and `ledger-entries` staggers the rest: each
  line lands 0.07 of the shot after the last and knocks its own figure. The
  engine would need `react[].stagger`.
- **A clip's speed per cut.** FULL and FAST play a clip at one speed, so the
  price and hush clips are timed to FAST and held in FULL, and the entry's
  sound is authored twice. The engine would need `clipAt`/rate per mode.
- **One impact reveal.** The Reaver's 14 HP and the damage to the row are
  revealed together; the price cannot land on the board at the price shot. The
  film shows it where it is paid (the bandage, the stroke) and again on the
  board (the mark on the Reaver). The engine would need a reveal filtered by
  target (caster / primary / rest).
- **No number for the price on the board**: reveals pop numbers only for
  Barrier and healing, and `$damage` is the target's. The HP bar and
  `ledger-mark` on the caster carry it.
- **A figure's line follows its ground point and height, not its drawing**: on
  a creature whose chest is not near 56% of its height (the Rivet Sniper
  crouches behind its gun) the line crosses the gun.
