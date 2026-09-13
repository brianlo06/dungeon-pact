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

## Shots — FULL 4440ms, FAST 2760ms (62%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera on the caster | real Herald `ult:din-step` — weapon comes down to the fore, the horn arm swings back | real battlefield dims to sable, bars close | bone call aura on the Warcaller; the din flickers up over every unit on the board (`din-board` din) | the din swelling (clatter, metal, a far roar); music ducks | on board | — | break the round: it gets loud |
| 1 | Grin · face close-up | 600 (340) | tight on the face, level, a slow push | `ult:din-grin` — the earnest open face sets: brows drop, eyes narrow, the smile becomes a grin, then a bark | din field, low; bone rim; the din buzzing behind the head | `din-noise` loud, behind | the din continuing; a grip creak | no | black 90ms | identity: the Herald's own face, going to war |
| 2 | Out front · wide, from behind the party | 900 (440) | low, behind the party's shoulders, drifting after the Warcaller | allies `ult:din-wait` (held back, weapons low); Herald `ult:din-walk`, walking away into the din | din field; the party as dark rim-lit shapes in the foreground | the din round every figure and thickest round the target; the Warcaller's walk bobs its figure (`din-walk`) | war drum and brass: motif D3 · D3 · F3 on the footfalls | **yes**, far off in the din, braces at 0.62 | whip 110ms | stakes: who it leads, who it walks at; title |
| 3 | The eye · reverse over the target's shoulder | 580 (380) | from behind the real target (a black shape filling the right edge), on the Warcaller's face and raised weapon; dead still | `ult:din-draw` — weapon drawn back high, face set, jaw shut; held still for the last half | exposure 0.14 → 0.07, heavy vignette, bone rim | every din stroke freezes and goes out one by one (`din-noise` freeze) | music ducked to 4%; a heartbeat, twice; the grip | **yes** — its back | cut (the din cuts with it) | the quiet |
| 4 | The blow · impact | 740 (540) | profile across the blow, Dutch −6° → −2°, easing back | Herald `ult:din-blow` (contact 0.03); target `hurt`, shoved and tilted | exposure blown to 1, falling; bone tint | **two-tone frame**; the drawn clang at contact (`din-clang`); the ring out of it (`din-ring`); every stroke of the din tuned into an arc round the blow (`din-noise` tune) | layered bell impact + room boom; 150ms stop; heavy shake | **yes** | cut on a 70ms two-tone frame (FAST: invert) | impact: the fourth note; damage and Vulnerable revealed; "THAT's the signal!" |
| 5 | Courage · low angle on the party | 560 (360) | low, on the whole real party, pushing in | allies `ult:din-surge` at the ring's arrival — all at once, weapons forward; the Warcaller small, far out front, `ult:din-front` | din field brightening behind them; bone rim rising | the ring rolling in from the blow and over the party (`din-ring` sweep); tuned lines round them; each lurches forward and carries a ring of or before it (`din-courage`) | the ring passing; the party's shout; footfalls | no — the party | whip 100ms, back the way the ring goes | courage from the blow: Empowered, on everyone at once |
| 6 | Carried · return | 660 (440) | battle camera | real Herald `ult:din-hold` — weapon planted, chin up | real battlefield; bars open | the target still ringing (`din-board` ring); a ring of or before every ally (`din-board` carry) | the motif's last two notes in brass, soft; tail | on board | flash 80ms | release: what it did, where it matters |

## Framing

- **Large and boss.** Every shot the target is in is re-framed: the walk-out
  pulls back so a boss stands whole in the din with the Warcaller small before
  it; the eye shot keeps only the edge of the boss's black shape on the right
  (it would fill the frame otherwise) and sits the Warcaller lower; the blow
  frames up at the boss, the Warcaller smaller, the shove short.
- **Party size.** The party shots are laid out for one, two or three allies:
  the first ally stands nearest the camera and the rest step back along the
  line, so a duo is never an empty frame and a quartet never leaves it.

## FAST

Keeps all seven shots, shorter. The walk is cut to 440ms (the title and the
target are still in it); the quiet and the impact keep their shape.

## Voice

"Loudest spot in the fight? That's mine." · "THAT's the signal!" · "Follow the
noise. I'm already here."

## What the engine could not do, and what was built instead

Filled in from the lab; see the end of the file.
