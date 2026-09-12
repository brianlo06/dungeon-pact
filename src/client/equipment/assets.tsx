import type { ComponentType } from "react";
/** Local coordinates: weapon grip (0,0), point up; accessories centred on anchor.
 * No SVG ids, filters, bitmap sheets, or per-frame asset generation. */
export const EQUIPMENT_ASSETS: Record<string, ComponentType> = {
  "blood-blade": () => (
    <>
      <path
        d="M-3 3 L-5 -13 -9 -18 -5 -20 -7 -31 -2 -29 0 -44 7 -34 5 -24 9 -21 5 -17 4 -4Z"
        fill="#342b40"
      />
      <path
        d="M0 -39 L2 -28 -2 -21 2 -14 0 -5"
        stroke="#ff6179"
        fill="none"
        strokeWidth="1.5"
        className="gear-energy"
      />
      <path d="M-9 -6 L-5 -10 0 -6 6 -10 9 -7 4 -3 -4 -3Z" fill="#9c475f" />
      <path d="M-2 -3 H2 V8 H-2Z" fill="#5b3544" />
      <circle cy="9" r="2.5" fill="#f05b77" />
    </>
  ),
  "bastion-plate": () => (
    <>
      <path
        d="M-15 -10 L-8 -14 0 -11 9 -14 16 -9 13 10 0 15 -13 10Z"
        fill="#5d7181"
      />
      <path d="M-10 -7 L0 -4 11 -7 8 7 0 11 -8 7Z" fill="#a0b4bc" />
      <path
        d="M0 -7 V9 M-10 -3 L-7 6 M10 -3 L7 6"
        stroke="#99f2e6"
        fill="none"
        className="gear-energy"
      />
      <path d="M-3 -2 H3 V4 L0 7 -3 4Z" fill="#293b4d" />
    </>
  ),
  "bastion-shoulder": () => (
    <>
      <path d="M-13 4 L-12 -5 -6 -10 5 -8 11 -3 10 5 0 2Z" fill="#6c8391" />
      <path d="M-9 -4 L-5 -7 3 -5 7 -1" fill="none" stroke="#b9eee7" />
      <circle cx="-7" cy="1" r="1.5" fill="#d5bd77" />
    </>
  ),
  "gold-fang": () => (
    <>
      <path d="M-4 -9 Q0 -5 4 -9" fill="none" stroke="#d7b967" />
      <path d="M-5 -5 Q7 -8 5 1 Q4 9 -3 13 Q0 7 -4 4Z" fill="#f2dfaa" />
      <path d="M-6 -5 L5 -6 6 -1 -5 1Z" fill="#d5a246" />
      <circle cy="-3" r="1.8" fill="#fff4bf" className="gear-energy" />
    </>
  ),
  "storm-needle": () => (
    <>
      <path
        d="M-2 6 H2 V-6 L5 -12 2 -35 0 -44 -2 -35 -5 -12 -2 -6Z"
        fill="#b4e9e9"
      />
      <path
        d="M0 -39 L-2 -26 2 -24 -1 -14"
        fill="none"
        stroke="#f9ffff"
        className="gear-energy"
      />
      <path d="M-6 -9 H6 M-4 -5 H4" stroke="#63818d" strokeWidth="3" />
      <path
        d="M-6 -29 L-9 -24 -5 -21 M6 -19 L9 -15 5 -12"
        stroke="#8cecfb"
        fill="none"
        className="gear-energy"
      />
    </>
  ),
  "copper-siphon": () => (
    <>
      <path d="M-2 8 H2 V-9 H5 V-34 L0 -39 -5 -34 V-9 H-2Z" fill="#ba794d" />
      <path
        d="M-5 -30 H-9 V-11 H-4 M5 -28 H9 V-17 H5"
        fill="none"
        stroke="#d6a072"
        strokeWidth="3"
      />
      <rect x="-3" y="-28" width="6" height="15" rx="2" fill="#628f99" />
      <path d="M-2 -20 H2" stroke="#b9e8d9" />
      <path
        d="M8 -10 Q13 -3 8 -3 Q4 -3 8 -10Z"
        fill="#a1e3dd"
        className="gear-energy"
      />
    </>
  ),
  "quarry-sight": () => (
    <>
      <path
        d="M-3 8 H3 V-13 L7 -20 5 -35 0 -41 -5 -35 -7 -20 -3 -13Z"
        fill="#7a7889"
      />
      <path d="M-2 -33 H2 V-25 H-2Z" fill="#d6c992" />
      <circle cy="-19" r="8" fill="#c2a05e" />
      <circle cy="-19" r="5" fill="#373747" />
      <path
        d="M-6 -19 H6 M0 -25 V-13"
        stroke="#fbe4aa"
        className="gear-energy"
      />
      <path d="M-7 -7 H7" stroke="#a69971" strokeWidth="3" />
    </>
  ),
  "cinder-spindle": () => (
    <>
      <path
        d="M-3 8 H3 V-10 L7 -16 5 -22 -5 -22 -7 -16 -3 -10Z"
        fill="#8b5544"
      />
      <path
        d="M0 -15 C-17 -24 15 -28 1 -42 C23 -28 -8 -21 0 -15Z"
        fill="#cc733e"
      />
      <path
        d="M0 -18 C-6 -26 12 -29 1 -38"
        stroke="#ffde85"
        fill="none"
        strokeWidth="2"
        className="gear-energy"
      />
      <path d="M-7 -10 H7" stroke="#dca157" strokeWidth="3" />
    </>
  ),
  "widow-hook": () => (
    <>
      <path
        d="M-3 8 H3 V-18 C19 -29 9 -44 -2 -39 C5 -34 8 -29 -4 -26 L-7 -19 -3 -12Z"
        fill="#5c6263"
      />
      <path
        d="M0 -21 C10 -27 10 -32 5 -35"
        fill="none"
        stroke="#b4d885"
        className="gear-energy"
      />
      <path
        d="M-9 -9 L0 -5 8 -11"
        fill="none"
        stroke="#848f69"
        strokeWidth="3"
      />
      <rect x="-5" y="-17" width="5" height="10" rx="2" fill="#a3b76c" />
      <circle cx="-2.5" cy="-12" r="1.3" fill="#e7efb4" />
    </>
  ),
  "briar-mantle": () => (
    <>
      <path
        d="M-15 -9 L-5 -14 0 -8 7 -14 15 -8 12 8 4 12 0 6 -8 12 -13 7Z"
        fill="#4e6250"
      />
      <path
        d="M-11 9 Q4 -2 -10 -12 M8 10 Q-4 -2 11 -10"
        stroke="#9eaa88"
        fill="none"
        strokeWidth="2"
      />
      <path
        d="M-12 -3 L-19 -9 -13 -9 -14 -16 -6 -12 M10 -5 L19 -12 13 -11 15 -18 7 -13"
        fill="#9c9f89"
      />
    </>
  ),
  "briar-shoulder": () => (
    <>
      <path d="M-12 4 L-10 -6 -5 -8 3 -6 10 4Z" fill="#64725a" />
      <path
        d="M-10 -4 L-15 -13 -7 -8 -6 -17 0 -8 6 -14 5 -4"
        fill="#a4aa8e"
        className="gear-energy"
      />
    </>
  ),
  "living-cup": () => (
    <>
      <path d="M-4 -8 Q0 -4 4 -8" stroke="#c6ab7e" fill="none" />
      <path
        d="M-6 -5 H6 L4 2 1 4 V8 H5 V10 H-5 V8 H-1 V4 L-4 2Z"
        fill="#b49c6e"
      />
      <path d="M-3 -4 H3 L2 1 H-2Z" fill="#92d9a1" className="gear-energy" />
      <path
        d="M-6 -3 H-9 Q-10 2 -4 2 M6 -3 H9 Q10 2 4 2"
        fill="none"
        stroke="#ceb782"
      />
    </>
  ),
  "spring-stone": () => (
    <>
      <path d="M-6 -7 L5 -8 8 0 3 9 -5 7 -8 0Z" fill="#6e8c85" />
      <path d="M-3 -5 L4 -4 3 4 -2 6 -4 0Z" fill="#b6dcb7" />
      <path
        d="M-2 -2 Q3 -4 2 1 Q0 4 -2 1"
        fill="none"
        stroke="#edf8c8"
        className="gear-energy"
      />
      <path d="M-8 -4 L-4 -7 M4 7 L7 3" stroke="#bcb184" strokeWidth="3" />
    </>
  ),
  "arcane-cell": () => (
    <>
      <path d="M-4 -10 H4 L7 -5 V6 L3 11 H-3 L-7 6 V-5Z" fill="#655480" />
      <path
        d="M-3 -6 H3 L4 4 0 8 -4 4Z"
        fill="#b7a0e4"
        className="gear-energy"
      />
      <path d="M-7 -6 H7 M-7 6 H7" stroke="#cab98e" strokeWidth="3" />
      <path d="M-10 -2 H-7 M7 2 H10" stroke="#e6d9ff" />
    </>
  ),
  "generic-weapon": () => (
    <path
      d="M-2 7 H2 V-6 H7 V-9 H3 V-31 L0 -37 -3 -31 V-9 H-7 V-6 H-2Z"
      fill="#aaa2b2"
    />
  ),
  "generic-armor": () => (
    <path d="M-12 -10 L0 -6 12 -10 10 9 0 13 -10 9Z" fill="#807a8b" />
  ),
  "generic-relic": () => (
    <>
      <path d="M-4 -8 L0 0 4 -8" fill="none" stroke="#bfa66d" />
      <path d="M0 -2 L5 3 0 9 -5 3Z" fill="#bea87e" />
    </>
  ),
};

/** A shared ranged construction preserves the Ranger's draw/release rig. Each
 * item keeps its own mechanical centre and limb silhouette, rather than
 * retaining the base bow or turning a ranged attack into a sword gesture. */
export const BOW_LIMBS: Record<string, string> = {
  "blood-blade": "M-8 -34 L3 -25 -2 -18 5 -11 0 0 5 12 -2 20 3 27 -8 34",
  "storm-needle": "M-8 -34 L2 -23 4 -9 0 0 4 9 2 23 -8 34",
  "copper-siphon": "M-8 -34 H0 V-23 H5 V-12 H0 V12 H5 V23 H0 V34 H-8",
  "quarry-sight": "M-8 -34 L4 -28 4 -18 0 -12 V12 L4 18 4 28 -8 34",
  "cinder-spindle": "M-8 -34 C15 -27 -7 -17 2 -8 Q7 0 2 8 C-7 17 15 27 -8 34",
  "widow-hook": "M-8 -34 C12 -38 10 -19 0 -10 Q-6 0 0 10 C10 19 12 38 -8 34",
};
