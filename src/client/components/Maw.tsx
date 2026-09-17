import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-cistern.css";

/**
 * The Pressure Maw.
 *
 * An amphibious predator built around suction, so the drawing is mostly the
 * intake: a bolted flange of a mouth on the party's side with a ring of inward
 * teeth around a black gullet. Behind it the body is a low wet hump slung
 * between splayed webbed legs, and two glass-bright pressure bladders ride the
 * flank, plumbed into the intake by a pair of valved pipes.
 *
 * Silhouette: wide and low — a circle at the front, two bulbs at the back and
 * nothing tall. That reads differently from the Slag Hound, which is a lean
 * quadruped up on stilts, and from every upright in the foundry roster.
 *
 * Rigged as `legs`, `body`, `maw` and `sacs`. The bladders load and empty about
 * their own middle and the mouth scales about the centre of its ring, so the
 * intake gapes rather than swinging on a hinge.
 */
const PARTS = ["legs", "body", "maw", "sacs"] as const;

const TEETH = [20, 70, 110, 160, 200, 250, 290, 340];
const BOLTS = [0, 45, 90, 135, 180, 225, 270, 315];

export function Maw({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  return (
    <svg
      className={`maw cistern-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Pressure Maw"
    >
      <defs>
        <linearGradient id="maw-hide" x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#5a9a8e" />
          <stop offset="0.5" stopColor="#2d605c" />
          <stop offset="1" stopColor="#132e2d" />
        </linearGradient>
        <linearGradient id="maw-iron" x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#7c8a8c" />
          <stop offset="0.5" stopColor="#414b4e" />
          <stop offset="1" stopColor="#1d2427" />
        </linearGradient>
        {/* Kept a shade under the teeth: the intake has to stay the brightest
         * thing on the animal. */}
        <radialGradient id="maw-sac" cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#a6d4cb" />
          <stop offset="0.5" stopColor="#5e9c94" />
          <stop offset="1" stopColor="#265653" />
        </radialGradient>
        <radialGradient id="maw-gullet" cx="0.5" cy="0.5" r="0.62">
          <stop offset="0" stopColor="#050c0c" />
          <stop offset="0.72" stopColor="#0d2120" />
          <stop offset="1" stopColor="#1b3b3a" />
        </radialGradient>
      </defs>

      {/* ---- legs: splayed and webbed. It squats; it does not stand. ---- */}
      <g ref={hold("legs")} style={{ transformOrigin: "56px 90px" }}>
        <g fill="url(#maw-hide)" stroke="#171420" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M46 74 C37 78 29 86 27 93 L45 95 C47 88 49 80 49 75 Z" />
          <path d="M72 72 C80 76 86 85 87 93 L70 95 C68 87 66 79 66 74 Z" />
          {/* Webbed feet, spread flat on a wet floor */}
          <path d="M29 88 C21 90 15 94 16 97 L41 97 C41 92 37 88 33 87 Z" />
          <path d="M84 87 C92 89 96 93 95 97 L72 97 C72 92 76 88 80 86 Z" />
        </g>
        <g stroke="#0e2222" strokeWidth="1.2" opacity="0.8">
          <path d="M23 96 L27 90 M31 96 L32 89 M88 96 L86 89 M80 96 L79 89" />
        </g>
      </g>

      {/* ---- sacs: pressure bladders riding the flank behind the shoulder ---- */}
      <g ref={hold("sacs")} style={{ transformOrigin: "72px 54px" }}>
        <circle cx="67" cy="46" r="10.5" fill="url(#maw-sac)" stroke="#171420" strokeWidth="2.2" />
        <circle cx="84" cy="59" r="8.5" fill="url(#maw-sac)" stroke="#171420" strokeWidth="2" />
        <g className="cst-wet-line">
          <path d="M62 41 Q65 37 70 37" />
          <path d="M80 54 Q82 51 86 52" />
        </g>
        {/* Ribbing, so they read as bladders under load and not as bubbles */}
        <g stroke="#1f4e4a" strokeWidth="1.4" fill="none" opacity="0.7">
          <path d="M59 49 Q67 53 75 49" />
          <path d="M58 43 Q67 47 76 42" />
          <path d="M78 63 Q84 66 90 61" />
        </g>
      </g>

      {/* ---- body: a low wet hump with plumbing grown along it ---- */}
      <g ref={hold("body")} style={{ transformOrigin: "58px 80px" }}>
        {/* The gullet neck: the body narrows into the intake, so the ring
         * stands clear of the hump instead of merging with it. */}
        <path
          d="M40 58 C30 60 23 64 20 70 C24 79 32 83 42 83 Z"
          fill="#1f4a47"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M33 80 C28 70 36 56 52 52 C68 48 84 55 87 66 C89 77 80 86 62 87 C46 88 36 86 33 80 Z"
          fill="url(#maw-hide)"
          stroke="#171420"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* A lit back, so the ridge reads rounded and soaking */}
        <path d="M38 62 Q54 53 72 57" stroke="#7bbfb3" strokeWidth="2.4" fill="none" opacity="0.7" strokeLinecap="round" />
        {/* Two small eyes crowded over the intake: all the face it has */}
        <circle cx="43" cy="57" r="3.4" fill="#0f2120" stroke="#171420" strokeWidth="1.6" />
        <circle cx="54" cy="52" r="3" fill="#0f2120" stroke="#171420" strokeWidth="1.6" />
        <circle className="mw-eye" cx="42.2" cy="56.2" r="1.3" />
        <circle className="mw-eye" cx="53.2" cy="51.3" r="1.1" />
        {/* Intake plumbing: bladder to mouth, valved on the way */}
        <g stroke="#171420" strokeWidth="4.6" fill="none" strokeLinecap="round">
          <path d="M64 54 Q50 58 40 65" />
          <path d="M80 66 Q64 73 46 76" />
        </g>
        <g stroke="#6b7478" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M64 54 Q50 58 40 65" />
          <path d="M80 66 Q64 73 46 76" />
        </g>
        <circle cx="52" cy="59" r="2.6" fill="#7a5a3a" stroke="#171420" strokeWidth="1.2" />
        <circle cx="63" cy="72" r="2.4" fill="#7a5a3a" stroke="#171420" strokeWidth="1.2" />
        {/* Corroded belly banding, half swallowed by the hide */}
        <path d="M42 83 Q58 88 76 82" stroke="#7a5a3a" strokeWidth="3" fill="none" opacity="0.85" />
        <g fill="#8d9a9c">
          {[46, 56, 66, 74].map((x, i) => (
            <circle key={x} cx={x} cy={[83.4, 85.4, 85, 83][i]} r="1" />
          ))}
        </g>
      </g>

      {/* ---- maw: the intake, a bolted ring with its teeth turned inward ---- */}
      <g ref={hold("maw")} style={{ transformOrigin: "23px 70px" }}>
        <circle cx="23" cy="70" r="17" fill="url(#maw-iron)" stroke="#171420" strokeWidth="2.8" />
        <circle cx="23" cy="70" r="13.2" fill="none" stroke="#7a5a3a" strokeWidth="2.4" opacity="0.9" />
        <g fill="#9aa6a8">
          {BOLTS.map((a) => (
            <circle
              key={a}
              cx={23 + 15 * Math.cos((a * Math.PI) / 180)}
              cy={70 + 15 * Math.sin((a * Math.PI) / 180)}
              r="1.3"
            />
          ))}
        </g>
        <circle cx="23" cy="70" r="10.4" fill="url(#maw-gullet)" stroke="#171420" strokeWidth="1.8" />
        <g fill="#dfe6df" stroke="#171420" strokeWidth="0.9">
          {TEETH.map((a) => {
            const r = (a * Math.PI) / 180;
            const c = Math.cos(r);
            const s = Math.sin(r);
            return (
              <path
                key={a}
                d={`M${(23 + 10 * c - 2.6 * s).toFixed(1)} ${(70 + 10 * s + 2.6 * c).toFixed(1)} L${(23 + 4 * c).toFixed(1)} ${(70 + 4 * s).toFixed(1)} L${(23 + 10 * c + 2.6 * s).toFixed(1)} ${(70 + 10 * s - 2.6 * c).toFixed(1)} Z`}
              />
            );
          })}
        </g>
        {/* Wet rim highlight on the party's side of the ring */}
        <path className="cst-wet-line" d="M8 62 Q5 70 8 78" strokeWidth="2.2" />
      </g>
    </svg>
  );
}
