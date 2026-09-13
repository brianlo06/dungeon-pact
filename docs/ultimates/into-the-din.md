# Into the Din — Herald · Warcaller

**The idea, in one sentence:** the Warcaller does not sing the charge, it
strikes it — it walks out alone into the loudest place in the fight and hits
the enemy so hard the whole field's noise is struck into one ringing note, and
the party takes its courage from that sound.

Only the Warcaller could have it. The Herald is the party's voice; its title is
*You are worth more than you think*, its rally was a note on a horn. The
Warcaller path traded that note for a blow — Warcall, a strike that Empowers
the striker — and the path's title is *Lead from where it is loudest.* So the
voice is still the Herald's, but it comes out of the weapon, from in front of
the party instead of behind it. And the Herald is a herald: the film is drawn
in heraldry's own tinctures — sable, argent, and one touch of or.

## Gameplay purpose

`ultimate-defs/hrl-warcaller.ts`, target an enemy, cost 100, speed 16:

1. the Warcaller is **Empowered for three rounds**, first, so the blow is too;
2. **24 damage** to the chosen enemy (with the path's +3 power and Empowered,
   ~39 before Guard);
3. that enemy is **Vulnerable** for two rounds — rung open;
4. **every ally** sheds **Weak** and is **Empowered this round only**;
5. **+2 Verse**.

A focused volley, not a lasting blessing: the party's blows this round are
Empowered *and* land on a Vulnerable target the Warcaller chose (×1.3 × 1.25),
and an ally's Exploit or Chain Shock on it this round is both. How it differs
from **Anthem of the Unpaid**, which it replaces: the Anthem is self-targeted
and touches no enemy; it gives the whole party two rounds of Empowered, 8
Barrier and a cleanse of Weak and Vulnerable. Into the Din strikes and opens
one enemy, gives no Barrier and cleanses nothing but fear (Weak), and its
courage is spent the same round — only the Warcaller keeps its own.

## Space, palette, sound

- **Space: the ground between the lines.** A no-man's-land drawn like a
  woodcut: a black field hatched in bone, a low horizon, furrowed earth running
  away to it, and the litter of other charges — dropped shields, a helmet, a
  snapped blade. Not a hall, a forge, a storm, a wood, a ridge, the ground
  under the floor, a causeway, a vault or a room of mirrors.
- **Palette:** sable `#0b0a0e`, argent (bone) `#f1e6cc` — the accent — and a
  single or `#e7b54a` kept for courage. The heroes are the only full colour
  in the film. No other film is monochrome.
- **Signature effect — the din, and the note it is struck into.** The noise of
  battle is drawn: hundreds of short jagged strokes in bone and ink, buzzing
  round every fighter and thickest round the enemy (`din-noise`). The Warcaller
  walks into it. In the quiet every stroke freezes and goes out, one by one.
  On the blow a ring leaves the point of contact, and every stroke it passes
  is *tuned* — its zigzag pulled straight into a clean arc round the blow — so
  the din becomes one note, visibly, and that ring rolls back over the party.
- **Motif (original):** four notes, the last one struck rather than played.
  A war drum and a low brass stab on D3, D3, F3 as the Warcaller walks out;
  the fourth note, C4, is the blow itself — the enemy rung like a bell. Not a
  variation of the Anthem's horn-and-voices motif (A3, E4, F♯4, D chord).
- **Signature sound:** the enemy rung like a great bell — a clang with bell
  partials and a long, beating ring — under the silence it breaks.
- **The impact, layered:** a crack (transient), a sub drop, the bell and a
  brass stab on C (body), and a ring that beats as it dies, with air (tail).
- **The quiet:** the din cuts out with the cut; the music ducks to 4%; only a
  heartbeat and the creak of the grip.

## Rhythm

identity (the Herald's earnest face turns into a war grin; "Loudest spot in
the fight? That's mine.") → stakes (the real party holds back in the din, and
the Warcaller walks out past them, alone, towards the real enemy; title) →
**quiet** (from over the enemy's own shoulder: the weapon drawn back, the
face set, every stroke of the din freezing and going out) → **impact** (a
two-tone frame; the blow; the din tuned into one ring; Vulnerable and the
damage revealed) → courage (the ring rolls back over the real party and all
of them come forward at once, lit) → release (the real board: the enemy still
ringing, a ring of or carried in front of every ally).

The film never charges and never rams: the Warcaller *walks*. The quietest
shot sits directly before the loudest.

## Shots — FULL 4440ms, FAST 2740ms (62%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera on the caster | real Herald `ult:din-step` — weapon comes down to the fore, the horn arm swings back | real battlefield dims to sable, bars close | bone call aura on the Warcaller; the din flickers up over every unit on the board (`din-board` din) | the din swelling (clatter, metal, a far roar); music ducks | on board | — | break the round: it gets loud |
| 1 | Grin · face close-up | 600 (340) | tight on the face, level, a slow push | `ult:din-grin` — the earnest open face sets: brows drop, eyes narrow, the smile becomes a grin, then a bark | din field, low; bone rim; the din buzzing behind the head | `din-noise` loud, behind | the din continuing; a grip creak | no | black 90ms | identity: the Herald's own face, going to war |
| 2 | Out front · wide, from behind the party | 900 (440) | low, behind the party's shoulders, drifting after the Warcaller | allies `ult:din-wait` (held back, weapons low); Herald `ult:din-walk`, walking out past them into the din | din field; the party dim in the foreground, the Warcaller rim-lit | the din round every figure and thickest round the target; the Warcaller's stride bobs its figure (`din-body` walk) | war drum and brass: motif D3 · D3 · F3 on the footfalls | **yes**, far off in the din, braces at 0.62 | whip 110ms | stakes: who it leads, who it walks at; title |
| 3 | The eye · reverse over the target's shoulder | 580 (380) | from behind the real target (a black shape filling the right edge), on the Warcaller's face and raised weapon; dead still | `ult:din-draw` — weapon drawn back high, face set, jaw shut; held still for the last half | exposure 0.16 → 0.07, a faint bone back light so the black shape reads, heavy vignette, bone rim | every din stroke freezes and goes out one by one (`din-noise` freeze); the figure sinks under the weapon and holds (`din-body` draw) | music ducked to 4%; a heartbeat, twice; the grip | **yes** — its back | cut (the din cuts with it) | the quiet |
| 4 | The blow · impact | 740 (540) | profile across the blow, Dutch −6° → −2°, easing back | Herald `ult:din-blow` (contact 0.03); target `hurt`, shoved and tilted | exposure blown to 1, falling; bone tint | **two-tone frame**; the drawn clang at contact (`din-clang`); the ring out of it (`din-ring`); every stroke of the din tuned into an arc round the blow and dying away behind the ring (`din-noise` tune); the whole figure leans into the blow (`din-body` blow) | layered bell impact + room boom; 150ms stop; heavy shake | **yes** | cut on a 70ms two-tone frame (FAST: invert) | impact: the fourth note; damage and Vulnerable revealed; "THAT's the signal!" |
| 5 | Courage · low angle on the party | 560 (360) | low, on the whole real party, pushing in | allies `ult:din-surge` at the ring's arrival — all at once, weapons forward; the Warcaller small, far out front, `ult:din-front` | din field brightening behind them; bone rim rising | the ring rolling in from the Warcaller and over the party (`din-ring`); the din round them tuned as it passes; each lurches forward and carries a ring of or before it (`din-courage`) | the ring passing; the party's shout; footfalls | no — the party | whip 100ms, back the way the ring goes | courage from the blow: Empowered, on everyone at once |
| 6 | Carried · return | 660 (440) | battle camera | real Herald `ult:din-hold` — weapon planted, chin up | real battlefield; bars open | the target still ringing (`din-board` ring); a ring of or before every ally (`din-board` carry) | the motif's last two notes in brass, soft; tail | on board | flash 80ms | release: what it did, where it matters |

## Framing

- **Large and boss.** Every shot the target is in is re-framed: the walk-out
  pulls back so a boss stands whole in the din with the Warcaller small before
  it; the eye shot keeps only the near edge of the boss on the right (it would
  fill the frame otherwise), lit rather than in silhouette (see below), and
  sits the Warcaller lower; the blow frames up at the boss with the Warcaller
  smaller, the weapon landing on the Collector's key-staff and body, a
  bigger clang and ring, and a short shove.
- **Party size.** The party shots are laid out for one, two or three allies:
  each later ally stands a step nearer the camera and further left (a row is
  painted in slot order, so the later slot must be the nearer), so a duo's one
  ally sits by the frame's centre-left and a quartet's third is still in it.

## FAST

Keeps all seven shots, shorter. The walk is cut to 440ms (the title and the
target are still in it); the quiet and the impact keep their shape.

## Voice

"Loudest spot in the fight? That's mine." · "THAT's the signal!" · "Follow the
noise. I'm already here."

## Notes from the lab

- Every camera and effect was placed from probed positions
  (`scripts/probe-ultimate.ts`). The blow's contact point (960, 650) is where
  the banner pole's head lands on the Slag Hound's neck with the Herald at
  x 700–715 and the banner at +78° from the shoulder; at +104° the pole head
  hit the floor in front of the hound instead.
- The weapon drawn back far behind the head (−72°) put the flag straight over
  the Herald's face, so the quiet raises it high and nearly upright (−30°,
  lifted and a little forward), and the blow swings through 106°.
- The Herald's brow is one group that tilts as a whole, so `knit` reads as the
  front brow dropping towards the nose: +10 to +12 is a scowl on this face,
  and the earnest start needs the brow lifted (−1.1) for the change to read.
- The tuned strokes at a large radius are nearly straight and read as rain;
  they now shorten and go out 260–780 world units behind the ring front.
- The Collector drawn as a silhouette shows pale, hard-edged shapes through
  it (by the look of it, parts the ink rule does not reach), so the boss framing
  of the quiet keeps it lit and only its near edge in frame.
- Worn gear: the Blood Price replaces the banner and rides the same `banner`
  part, so every pose (walk, draw, blow, front) holds with the blade.
- Profile (1920×1080, real GPU, dev build, a shared machine): film p50 16.7ms
  / p95 33.4ms, 9 frames over 34ms; the round after it p50 16.7ms / p95
  49.9ms. Peak 826 nodes (751 SVG), 5 live effects, 0 filtered elements.

## What the engine could not do, and what was built instead

- **Root motion in a film.** A copy's root track is not played today (the rig
  is attached before its animator exists), so the whole-figure motion the
  clips key — the walk's bob, the coil, the lean into the blow, the surge —
  does not play. The walk, the draw and the blow are given weight by
  `din-body`, and the surge's lurch by `din-courage`, both writing the copy's
  `.cine-look` and restoring it when their shot ends. Clips with non-trivial
  root keys, which will start to play when the engine attaches the root:
  `ult:din-step`, `ult:din-blow` (x 0.1 at contact), `ult:din-front`,
  `ult:din-hold`, `ult:din-draw`, `ult:din-walk`, `ult:din-grin` and every
  ally's `ult:din-surge` (x 0.05). They were kept small so the framing holds
  when they do; `din-body` would then need halving.
- **Allies on the board.** Battlefield clips reach only the caster and the
  targets, so the real allies cannot come forward in the return; what the
  Ultimate gave them is drawn in front of each (`din-board` carry). The engine
  would need battlefield clips for `allies`.
- **All at once, but a wave.** A row's reactions land together, which is what
  this film wants — but the ring physically reaches the nearest ally ~60ms
  before the farthest. The surge is timed to the ring reaching the party
  (0.13), not to each ally.
- **A result on the frame.** Empowered and Vulnerable are statuses and have no
  beat, so the board's chips are drawn from the snapshot already under the
  film; the film shows them itself (the ring of or, the target still
  ringing). The damage is the only number the reveal can punch.
- **The status chips after the round.** The allies' Empowered lasts only the
  round, so after the lab resolves it only the battle log shows it; the
  browser spec reads the log.
- **Silhouettes of some creatures.** See the Collector note
  above: the silhouette look would need to cover every element a creature
  draws, not only paths, rects, circles, ellipses, polygons and lines.
