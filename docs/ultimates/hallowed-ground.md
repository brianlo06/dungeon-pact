# Hallowed Ground — Herald · Sanctifier

**The idea, in one sentence:** the Sanctifier draws the line itself — it walks
the length of the party's front with the iron-shod butt of its standard
scoring the foundry floor behind it, and when it grounds the standard on the
end of the score the whole line burns white and the soot is blown off the
stone on the party's side of it: the ground they are standing on is made
holy, and they are already standing on it.

Only the Sanctifier could have it. The Herald's title is *You are worth more
than you think*; the Sanctifier's is *Hold the line by holding the people on
it*, and its kit is **Sanctuary**, a row's ground made safe (24 Barrier and
lasting Regeneration). The line is literal: the standard the Herald is drawn
with is a pole with a shod foot, and a standard-bearer's ceremonial gesture
is to *ground* it — the butt struck on the stone. No horn, no song, no note
drawn in the air: the Sanctifier's consecration is a mark made on the ground
with the foot of the thing it carries, and what it does to the floor.

## Gameplay

`ultimate-defs/hrl-sanctifier.ts`, target self, cost 100, speed 14:

| | Anthem of the Unpaid (base) | Into the Din (Warcaller) | Elegy for the Standing (Dirgesinger) | **Hallowed Ground** (Sanctifier) |
| --- | --- | --- | --- | --- |
| Aimed at | self: the party | an enemy, struck | an enemy, mourned | **self: the ground under the party** |
| The party | Empowered 2 rounds, 8 Barrier, Weak and Vulnerable cleared | Weak cleared, Empowered this round | Burn, Poison, Weak, Vulnerable cleared | **16 Barrier and Regeneration 4, both for four rounds; nothing cleared, nobody Empowered** |
| The enemy | nothing | 24, Vulnerable 2 rounds | Vulnerable 3 rounds, 12 through armour | nothing |
| The Herald | — | Empowered 3 rounds, +2 Verse | +2 Verse | **steps onto the front line, 12 more Barrier, +3 Verse** |
| Lasts | 2 rounds | this round | 3 rounds | **4 rounds** |

It differs in what it does, not only in numbers. The other three Herald
Ultimates give the party something to swing with (Empowered), or open the
enemy for them, or take the dungeon's afflictions off them. This one gives
them nothing to swing with, clears nothing and touches no enemy: it makes the
ground they stand on hold, for four rounds, and it puts the Sanctifier on the
line in front of them. Every enemy but a sniper and the Collector prefers the
front row when it picks a target, so a Sanctifier that steps forward draws
the enemy's blows onto itself, on 101 HP, 28 Barrier and 4 a round back, and
away from the back row: *hold the line by holding the people on it*. It costs
what a front-row place costs (a vent chamber scalds the front; a row attack on
the front finds it).

The Barrier is the lasting kind, not the lapsing kind: the Small Print's 30
lapses at the round's end, the Anthem's 8 and the Lantern Wall's 12 last a
round after theirs; Hallowed Ground's 16 is there until it is spent, for four
rounds, with 4 HP a round under it. Team play: a Vanguard behind it earns
charge on every point its Barrier blocks and intercepts on it; a Warden's
Regeneration stacks; and the Sanctifier's own Sanctuary (3 Verse) is affordable
again the very next round, on the row that needs it, from the +3 Verse.

### Balance

Filled in from `scripts/ultimate-report.ts 4 --sample=6` on the same machine,
with the stub still `null` and then with Hallowed Ground; see the report.

## Space, palette, sound

- **Space: the cold casting floor of the Ember Foundry.** The great floor
  where the foundry poured, with its fires out: sooted flagstones in
  perspective, joints running away to a far wall; a casting trench along the
  right; iron columns; ladles and a crucible hanging dead on their chains from
  the dark overhead; slag heaped at the walls; the furnace mouth far off, an
  arch with nothing burning in it. Lit by nothing until the line lights it.
  Not the Breaker's breach forge (a forge wall in heat, a vault gate, red,
  embers): this foundry is cold, blue-black and silent, and the only fire in
  it is the one the Sanctifier scores into the floor. Not a hall, storm,
  wood, ridge, field between the lines, burying ground, pit, vault, mirrors,
  mere, labyrinth, theatre, page, spillway, snowfield, moth garden, hound
  run, roofs or tannery.
- **Palette:** soot black-brown (`#100e0d`) and cold iron blue-grey
  (`#2c313a`) for the foundry; the line's light is arc-white with a cold
  blue halo (`#cdf5ff`, the accent — a welding seam in a foundry, not lantern
  gold); the stone under the soot is clean pale grey (`#c9c4b6`). No gold, no
  rose, no bone-and-sable, no lilac.
- **Signature effect — the line scored, then lit.** The shod foot of the
  standard, dragged, scores a groove across the floor behind the walking
  Sanctifier, with hand-cut sparks off the ferrule and a dull ember light in
  the groove behind it (`hallow-score` score). On the grounding the whole
  length of it ignites white at once (`hallow-score` burn), and the soot on
  the party's side is blown off the stone in a wave from the line — a
  hundred and forty flakes of soot and ash lifting and spinning away, the
  pale flagstones showing where they were (`hallow-soot` blow) — while the
  party does not move at all: only their cloth and hair blow. On the board
  after, a lit seam runs along the party's front and a clean flagstone shows
  under every one of them (`hallow-board`).
- **The impact frame:** a two-tone frame in the pale stone colour — the film
  reduced to light and shadow — then the white flash of the line igniting.
- **Motif (original):** a reed organ, not a horn and not a voice. Three
  rising notes, F3 · B♭3 · C4, on a slow harmonium swell, and the fourth, F4,
  lands as an F-major chord with the ninth in it on the grounding. Not the
  Anthem's horn and answer (A3, E4, F♯4, D chord), the Din's drum and bell
  (D3, D3, F3, C4) or the Elegy's falling voice (E4, D4, C4, A3).
- **Signature sound:** iron scoring stone — a long, grinding, slowly rising
  scrape with grit in it, and the knock of the ferrule at each end.
- **The impact, layered:** the shod foot on stone and a hiss of the line
  igniting (transient), a sub drop, the organ chord and a low iron ring
  (body), a long white hiss of the soot going off the floor (tail).
- **The quiet:** music ducked to 3%; the scrape has stopped; only the embers
  in the groove ticking as they cool.

## Rhythm

identity (the Herald's open face looks down at the floor by its feet, then
straight out and *sets*: the smile pressed to a line, the brows level, a
nod) → stakes (the real party set their feet on the cold floor while the
Sanctifier walks their whole front, low, the standard couched forward and
the groove opening behind it, sparks off the ferrule; title) → **quiet** (on
the floor: the ferrule held a hand's breadth over the end of the score, the
embers in the groove going out, the soot in the air hanging still) →
**impact** (two-tone; the standard grounded; the line ignites white end to
end; the soot blown off the party's side; the party unmoved; Barrier and
Regeneration on everyone) → the ground (at their feet: the clean stone, the
line steady behind them) → release (the board: a lit seam along the party's
front, a clean flagstone under each).

The quietest shot sits directly before the loudest. The Sanctifier never
strikes anything, never faces an enemy, and never sings.

## Shots — FULL 4580ms, FAST 2480ms (54%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Herald `ult:hallow-slope` — the standard tips forward onto the shoulder and its foot knocks the floor once | real battlefield goes cold iron, bars close | pale call aura; a short bright scratch on the floor at the Herald's feet (`hallow-board` knock) | the ferrule on stone; the organ breathing in (`hallow-knock`); music ducks | on board | — | break the round: something is being marked out |
| 1 | Set · face close-up | 620 (380) | tight on the face, Dutch −4° righting to 0°, a slow ease back | `ult:hallow-set` (`root: false`) — the earnest face looks down at the floor by its feet (head bowed, lids half down), then up and straight out: the smile pressed to a line, the brows level and down a hair, the eyes steady; a short nod | the cold foundry, near black; a cold rim on the face | soot drifting down past the face (`hallow-soot` drift) | motif, first two notes on the organ (`hallow-motif-a`) | no | black 80ms | identity: the face that tells you your worth, deciding where you stand |
| 2 | The line · low tracking | 900 (460) | at floor height in front of the party, trucking right with the Sanctifier | Herald `ult:hallow-walk` — the standard couched forward at 52°, its shod foot dragging the floor behind; the real party behind it, `ult:hallow-stand` (feet set, watching it pass) | the casting floor, dark; the party lit cold from the groove | the groove scored across the foreground behind the ferrule, an ember light in it, hand-cut sparks off the foot (`hallow-score` score) | the scrape (`hallow-scrape`), the third note over it (`hallow-motif-b`) | **the real party**, with their real gear | whip 110ms | stakes: whose ground it is; title |
| 3 | The ferrule · quiet | 560 (360) | on the floor, Dutch 6°, dead still | `ult:hallow-lift` (`root: false`) — the standard brought up to the vertical, its foot held a hand's breadth over the end of the score | exposure 0.4 → 0.2; heavy vignette | the end of the groove close, embers in it ticking out (`hallow-score` quiet); soot hanging still in the air (`hallow-soot` hang) | music ducked to 3%; embers cooling (`hallow-ember`) | no | cut | anticipation by stillness |
| 4 | Grounded · impact | 780 (560) | wide from the enemy's side of the line, low, easing back | Herald `ult:hallow-ground` (180ms, contact 0.3) — the standard driven down onto the end of the score, the knees taking it, the flag snapping up, the head up; then `ult:hallow-held`; every ally `ult:hallow-still` (nothing moves but cloaks and hair) | exposure blown, then pale under-light from the stone | **two-tone frame** in pale stone (60ms); the line ignites white end to end with a flare at the foot (`hallow-score` burn); the soot blown off the party's side in a wave from the line, the pale stone showing (`hallow-soot` blow); dust at the foot | layered grounding (`hallow-strike`) + room boom; **150ms stop at contact**; heavy shake | **the real party**, unmoved | cut on the two-tone frame (FAST: invert) | impact: Barrier and Regeneration revealed on everyone; "Holy ground. Hold it." |
| 5 | Standing · low angle at their feet | 600 (—) | at the party's boots on the clean stone, rising slowly | allies `ult:hallow-still` held; Herald `ult:hallow-held`, the standard grounded, chin up | pale stone under-light; the line steady behind them | the last soot settling past the lens; the line's light breathing (`hallow-score` burn, settled) | the chord holding, the hiss dying | the real party | cut | what they are standing on |
| 6 | Held · return | 720 (480) | battle camera | real Herald `ult:hallow-hold` — the standard grounded upright, the horn arm at rest | real battlefield; bars open | a lit seam along the real party's front (`hallow-board` line); a clean flagstone under every real party member, one after another (`hallow-board` stone) | the chord's release, one last knock (`hallow-settle`), tail | on board | flash 80ms | release: the ground held, and who is on it |

## Framing

- **Boss.** Nothing in this film is an enemy, and a self-targeted Ultimate is
  framed `normal` in any room: a boss is only on the real board, in the call
  and the return.
- **Party size.** Every party shot is laid out for one, two or three allies:
  the line shot passes the whole row whatever its length; the impact and the
  standing shot stand later allies a step nearer and further left, so a duo's
  one ally sits by the Sanctifier and a quartet's third is still in frame.

## FAST

Keeps the set, the line, the quiet and the grounding, shorter; drops the
standing shot. 2480ms of 4580ms.

## Voice

"Stay where you are. I'll see to the ground." · "Holy ground. Hold it." ·
"It holds as long as you do. So hold."

## Notes from the lab

Filled in as the film is tuned.

## What the engine could not do, and what was built instead

- **Allies on the board.** Battlefield clips reach only the caster and the
  targets, so the real party cannot set their feet in the call or the
  return; the clean flagstone under each in the return is what the Ultimate
  did to them.
- **A row's reactions land together.** The film wants that here: nobody
  moves on the grounding, and only cloth blows.
- **Statuses have no beat.** Regeneration is shown by the film (the stone
  they stand on) and by the board's chips; Barrier has a ward beat and is
  punched on the impact frame.
- **A row move has no beat.** The Sanctifier's step to the front is state;
  the board's row layout shows it after the round.
