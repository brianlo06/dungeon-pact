import type { ComponentType } from "react";

/** Grip at (0,0), chest/charms centered at origin. No filters or document IDs. */
export const EXPEDITION_ART: Record<string, ComponentType> = {
  "rivet-breaker": () => (
    <>
      <path d="M-3 9V-29H3V9Z" fill="#625b53" />
      <path d="M-14-39H13V-25H4V-30H-7V-25H-14Z" fill="#a99b83" />
      <path d="M-10-36H8M-8-33H5" stroke="#eee0b4" />
      <path d="M-5-10H5M-5-5H5M-5 0H5" stroke="#302b2b" />
    </>
  ),
  "debt-hook": () => (
    <>
      <path
        d="M-2 10V-27Q-17-45-6-47Q11-48 12-34L5-28L8-39Q-1-44-4-36L3-27V10Z"
        fill="#a89a80"
      />
      <path d="M-6-17H7L10-8L-2-5Z" fill="#bdb096" />
      <path d="M-3-14L5-15M-2-11H5" stroke="#594c43" />
      <path d="M2 5Q12 8 8 14Q3 18 1 12" fill="none" stroke="#b99465" />
    </>
  ),
  "survey-spike": () => (
    <>
      <path d="M-2 8L-4-30L0-48L4-30L2 8Z" fill="#c5c9b8" />
      <path d="M-9-25H9M-7-22H7M0-39V-5" fill="none" stroke="#6d8583" />
      <circle cy="-19" r="6" fill="#252c32" />
      <circle cy="-19" r="3" fill="#c4e7c9" className="gear-energy" />
      <path d="M-7-3H7L4 2H-4Z" fill="#998655" />
    </>
  ),
  "slag-cutter": () => (
    <>
      <path
        d="M-3 10V-9L-9-14L-8-40L2-47L10-39L7-34L10-30L7-25L10-21L6-13L3-9V10Z"
        fill="#53525a"
      />
      <path
        d="M-5-38L0-42L4-37L1-29L4-23L0-17"
        fill="none"
        stroke="#ef9a67"
        className="gear-energy"
      />
      <path d="M-8-9H8M-3 0H3M-3 5H3" stroke="#a7a19b" />
    </>
  ),
  "quench-rod": () => (
    <>
      <path d="M-2 10V-40H2V10Z" fill="#907956" />
      <path d="M-7-35Q-11-19-5-15H5Q11-19 7-35Z" fill="#314954" />
      <path d="M-5-30V-20H5V-30Z" fill="#8ecbce" className="gear-energy" />
      <path d="M-9-36H9M-8-15H8M-4-41H4" stroke="#b79868" strokeWidth="3" />
      <path d="M7-39Q15-38 11-32M-6-9Q-11-4-7-2" fill="none" stroke="#87c3ca" />
    </>
  ),
  "tithe-hammer": () => (
    <>
      <path d="M-3 10V-33H3V10Z" fill="#655245" />
      <path d="M-16-40H13L16-35V-25H-14L-17-30Z" fill="#ac9266" />
      <path d="M-10-39V-26M8-39V-26" stroke="#e2c58b" strokeWidth="3" />
      <path d="M-5-35H4M-5-31H1" stroke="#3b3434" />
      <path d="M-5-10H5M-5-5H5" stroke="#c6af7c" />
    </>
  ),
  "lattice-shell": () => (
    <>
      <path
        d="M-14-14L-5-17L0-11L5-17L14-14L11 12L0 16L-11 12Z"
        fill="#3d5966"
      />
      <path
        d="M-11-10L10 9M-12-1L4 13M-5-13L12 2M11-10L-10 9M12-1L-4 13M5-13L-12 2"
        stroke="#a9c2c9"
        strokeWidth="2"
      />
      <path
        d="M-9 11L0 14L9 11"
        fill="none"
        stroke="#d1edf1"
        className="gear-energy"
      />
    </>
  ),
  "suture-coat": () => (
    <>
      <path
        d="M-14-13L-5-16L0-8L5-16L14-13L10 5L14 19L2 16L0 8L-2 16L-14 19L-10 5Z"
        fill="#796966"
      />
      <path
        d="M-9-11L-6 13M9-11L6 13M-10-5H-3M-10 0H-3M3-5H10M3 0H10"
        stroke="#d1c3a5"
      />
      <path d="M-2-5H2V2H-2Z" fill="#a6c9a1" className="gear-energy" />
    </>
  ),
  "quench-mail": () => (
    <>
      <path
        d="M-14-12L-5-16L0-10L5-16L14-12L12 12L0 16L-12 12Z"
        fill="#344b59"
      />
      <path
        d="M-10-9V8Q-5 14-3 7V-5Q0-10 3-5V7Q5 14 10 8V-9"
        stroke="#8abfc9"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M-13-8H-7M7-8H13M-11 9H-5M5 9H11"
        stroke="#b69971"
        strokeWidth="3"
      />
    </>
  ),
  "antidote-weave": () => (
    <>
      <path
        d="M-15-12L-6-17L0-10L6-17L15-12L10 0L12 14L0 12L-12 14L-10 0Z"
        fill="#4e5950"
      />
      <path d="M-12-8L10 11M12-8L-10 11M-7-10L8 4M7-10L-8 4" stroke="#899878" />
      <path
        d="M-8-3H-4V6H-8ZM4-3H8V6H4Z"
        fill="#bcdc94"
        className="gear-energy"
      />
      <path d="M-9-4H-3M3-4H9" stroke="#bea379" />
    </>
  ),
  "rebuke-plate": () => (
    <>
      <path
        d="M-15-13L-5-15L0-9L5-15L15-13L12 12L0 17L-12 12Z"
        fill="#6d6065"
      />
      <path
        d="M-14-11L-19-18L-17-3L-11 0M14-11L19-18L17-3L11 0"
        fill="#b3a4a5"
      />
      <path d="M-9-6L0-1L9-6L7 5L0 12L-7 5Z" fill="#3b343e" />
      <path
        d="M-5 0L0 4L5 0"
        fill="none"
        stroke="#dfb8aa"
        className="gear-energy"
      />
    </>
  ),
  "second-skin": () => (
    <>
      <path d="M-13-13Q0-6 13-13L11 12Q0 19-11 12Z" fill="#3c4a50" />
      <path
        d="M-12-9Q0-1 12-9M-12-3Q0 5 12-3M-11 3Q0 11 11 3M-10 9Q0 16 10 9"
        fill="none"
        stroke="#b7baa8"
        strokeWidth="3"
      />
      <path d="M0-6V12" stroke="#a2ddc6" className="gear-energy" />
    </>
  ),
  "salvage-token": () => (
    <>
      <path d="M0-13V-7" stroke="#aa9264" />
      <path d="M-7-5L-4-9H5L9-2L6 7L-4 9L-8 2Z" fill="#998665" />
      <path d="M-3-4H3V0H0V5H-3Z" fill="#d9c89b" />
      <circle cx="5" cy="4" r="1" fill="#ecdcad" className="gear-energy" />
    </>
  ),
  "mercy-ampoule": () => (
    <>
      <path d="M-3-12H3V-5Q9-2 6 7Q0 12-6 7Q-9-2-3-5Z" fill="#686373" />
      <path d="M-4 0H4L3 6H-3Z" fill="#d7a7b5" className="gear-energy" />
      <path d="M-4-10H4M-4-6H4" stroke="#cdb997" />
      <path d="M-2 3H2M0 1V5" stroke="#f4dac9" />
    </>
  ),
  "grounding-cell": () => (
    <>
      <path d="M-6-10H6L8 8H-8Z" fill="#535357" />
      <path
        d="M-3-12V-8M3-12V-8M-7-3H7M-8 3H8"
        stroke="#b7a17b"
        strokeWidth="2.5"
      />
      <path d="M-2-7H2V6H-2Z" fill="#8dbcb9" className="gear-energy" />
      <path d="M0 8V13L4 10" fill="none" stroke="#ad936d" />
    </>
  ),
  "safety-seal": () => (
    <>
      <path d="M0-13V-7M-4 5L-6 13L0 10L5 13L4 5" fill="#bca77b" />
      <path d="M-8-5L-3-9L3-8L8-4L7 3L2 8L-5 6L-8 1Z" fill="#778d9a" />
      <path d="M-4-3H4V1L0 5L-4 1Z" fill="#cee0d9" className="gear-energy" />
    </>
  ),
  "steady-heart": () => (
    <>
      <path d="M0-13V-8" stroke="#c0a36e" />
      <path d="M0-5Q-10-13-9-2Q-8 4 0 10Q8 4 9-2Q10-13 0-5Z" fill="#8a6460" />
      <path
        d="M-6 0H-3L-1-3L1 4L3 0H6"
        fill="none"
        stroke="#edc5a3"
        className="gear-energy"
      />
      <path d="M0 7V10" stroke="#c5ae83" />
    </>
  ),
  "surge-vial": () => (
    <>
      <path d="M-5-11H2V-5L7 4L3 11L-5 8L-8 2L-2-5Z" fill="#4b5569" />
      <path
        d="M-4 0L1-3L4 4L1 7L-4 5Z"
        fill="#a5b6ed"
        className="gear-energy"
      />
      <path d="M-6-10H3M-5-7H3" stroke="#b6ab90" strokeWidth="2" />
    </>
  ),
  "victory-bell": () => (
    <>
      <path d="M-2-9Q-4-14 0-14Q4-14 2-9" fill="none" stroke="#c1a474" />
      <path d="M-4-9H4L6 3L10 6H-10L-6 3Z" fill="#c0a071" />
      <path d="M-3-5L-4 1M-8 4H8" stroke="#f0d9a0" />
      <circle cy="9" r="3" fill="#ead89e" className="gear-energy" />
    </>
  ),
  "contract-splinter": () => (
    <>
      <path d="M0-14L2-8" stroke="#ac9a85" />
      <path d="M-6-10L6-6L3-1L7 3L-3 13L-1 4L-6 1L-2-3Z" fill="#71657c" />
      <path
        d="M-2-6L2-4L-1 0L2 3L-1 7"
        fill="none"
        stroke="#d0a8e0"
        className="gear-energy"
      />
      <path d="M-7 4L-4 6M5-11L7-8" stroke="#b795c8" />
    </>
  ),
};

export const EXPEDITION_BOWS: Record<string, string> = {
  "rivet-breaker": "M-8-34L3-28L3-20L9-17L3-8L0 0L3 8L9 17L3 20L3 28L-8 34",
  "debt-hook": "M-8-34Q12-42 8-24L0 0Q15 22 5 31L-8 34",
  "survey-spike": "M-8-34L4-24L0-12L4 0L0 12L4 24L-8 34",
  "slag-cutter": "M-8-34L9-27L5-20L11-15L0 0L11 15L5 20L9 27L-8 34",
  "quench-rod": "M-8-34Q12-33 6-20Q-3-13 0 0Q-3 13 6 20Q12 33-8 34",
  "tithe-hammer": "M-8-34H5V-24H10V-18L0 0L10 18V24H5V34H-8",
};
