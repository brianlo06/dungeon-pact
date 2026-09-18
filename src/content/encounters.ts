import { runDepth } from "./floors";
import type { RunState } from "../shared/model";
import { pick } from "../engine/rng";
export interface EncounterDef {
  /** A pre-faction region pool: the foundry creatures, renamed for the floor. */
  biome?: "cistern" | "archive";
  /**
   * A faction pool, drawn only in rooms with `factionVersion`. The foundry's
   * encounters stay biome-less and keep their old draw.
   */
  faction?: "cistern" | "archive";
  id: string;
  name: string;
  minDepth: number;
  /**
   * Where it sits on a floor's complexity curve: 1 introduces one new
   * mechanic beside familiar support, 2 introduces another, 3 combines two
   * the floor has taught, 4 is a synergy. Faction encounters only.
   */
  tier?: 1 | 2 | 3 | 4;
  /** Drawn only in elite chambers: an encounter built around an elite creature. */
  elite?: boolean;
  /** The tactical sentence: why this formation is a problem worth solving. */
  sentence?: string;
  /** Explicit formations keep each party size a designed encounter. */
  formations: Record<2 | 3 | 4, string[]>;
}
export const encounters: EncounterDef[] = [
  {
    id: "sluice-sentries",
    name: "Sluice Sentries",
    biome: "cistern",
    minDepth: 2,
    formations: {
      2: ["bulwark", "sniper"],
      3: ["bulwark", "sniper", "mender"],
      4: ["bulwark", "sniper", "mender", "bellows"],
    },
  },
  {
    id: "diving-detail",
    name: "Diving Bell Recovery Crew",
    biome: "cistern",
    minDepth: 2,
    formations: {
      2: ["hound", "mender"],
      3: ["hound", "mender", "sniper"],
      4: ["hound", "bulwark", "mender", "sniper"],
    },
  },
  {
    id: "probate-guard",
    name: "Probate Guard",
    biome: "archive",
    minDepth: 3,
    formations: {
      2: ["bulwark", "thief"],
      3: ["bulwark", "thief", "mender"],
      4: ["bulwark", "thief", "mender", "acolyte"],
    },
  },
  {
    id: "index-hunters",
    name: "Hunters of the Unpaid",
    biome: "archive",
    minDepth: 3,
    formations: {
      2: ["hound", "acolyte"],
      3: ["hound", "thief", "acolyte"],
      4: ["hound", "thief", "acolyte", "sniper"],
    },
  },
  {
    id: "furnace-watch",
    name: "Furnace Watch",
    minDepth: 0,
    formations: {
      2: ["bulwark", "acolyte"],
      3: ["bulwark", "acolyte", "stoker"],
      4: ["bulwark", "acolyte", "stoker", "sniper"],
    },
  },
  {
    id: "hunting-pack",
    name: "Rivet Hunting Party",
    minDepth: 0,
    formations: {
      2: ["hound", "sniper"],
      3: ["hound", "sniper", "stoker"],
      4: ["hound", "sniper", "stoker", "acolyte"],
    },
  },
  {
    id: "smoke-line",
    name: "Smoke Line",
    minDepth: 0,
    formations: {
      2: ["stoker", "bellows"],
      3: ["stoker", "bellows", "acolyte"],
      4: ["bulwark", "bellows", "acolyte", "hound"],
    },
  },
  {
    id: "repair-detail",
    name: "The Repair Detail",
    minDepth: 2,
    formations: {
      2: ["bulwark", "mender"],
      3: ["bulwark", "mender", "sniper"],
      4: ["bulwark", "mender", "sniper", "acolyte"],
    },
  },
  {
    id: "toll-collectors",
    name: "Foundry Toll Collectors",
    minDepth: 2,
    formations: {
      2: ["thief", "hound"],
      3: ["thief", "bulwark", "sniper"],
      4: ["thief", "bulwark", "sniper", "mender"],
    },
  },
  // ------------------------------------------------------------ CISTERN --
  // Early fights pair one new creature with foundry support the party already
  // knows: salvaged machines still working the flooded halls. Wave 1 has no
  // simple Cistern attacker or tank of its own yet; those replace the
  // foundry stand-ins in wave 2.
  {
    id: "intake-tunnel",
    name: "Intake Tunnel",
    faction: "cistern",
    tier: 1,
    minDepth: 0,
    sentence: "The Maw drags your back line forward, into the Hound's reach.",
    formations: {
      2: ["maw", "hound"],
      3: ["maw", "hound", "bulwark"],
      4: ["maw", "hound", "bulwark", "sniper"],
    },
  },
  {
    id: "spillway-watch",
    name: "Spillway Watch",
    faction: "cistern",
    tier: 1,
    minDepth: 0,
    sentence: "The Eel soaks whoever is dry and Conducts into whoever is already Wet.",
    formations: {
      2: ["eel", "bulwark"],
      3: ["eel", "bulwark", "hound"],
      4: ["eel", "bulwark", "hound", "stoker"],
    },
  },
  {
    id: "plate-yard",
    name: "The Plate Yard",
    faction: "cistern",
    tier: 2,
    minDepth: 0,
    sentence: "The Tender plates its sturdiest friend: break the plate soft, or fight through the armour.",
    formations: {
      2: ["tender", "bulwark"],
      3: ["tender", "bulwark", "hound"],
      4: ["tender", "bulwark", "hound", "sniper"],
    },
  },
  {
    id: "dredge-crew",
    name: "Dredge Crew",
    faction: "cistern",
    tier: 2,
    minDepth: 0,
    sentence: "The Dredger drags the wounded out of reach and shoves fresh bodies forward.",
    formations: {
      2: ["dredger", "hound"],
      3: ["dredger", "hound", "acolyte"],
      4: ["dredger", "hound", "acolyte", "stoker"],
    },
  },
  {
    id: "conductive-main",
    name: "Conductive Main",
    faction: "cistern",
    tier: 3,
    minDepth: 0,
    sentence: "The Maw soaks whoever it pulls forward, and the Eel is waiting for Wet.",
    formations: {
      2: ["maw", "eel"],
      3: ["maw", "eel", "bulwark"],
      4: ["maw", "eel", "bulwark", "hound"],
    },
  },
  {
    id: "salvage-line",
    name: "Salvage Line",
    faction: "cistern",
    tier: 3,
    minDepth: 0,
    sentence: "The Tender plates the front while the Dredger rotates the wounded behind it.",
    formations: {
      2: ["dredger", "tender"],
      3: ["dredger", "tender", "hound"],
      4: ["dredger", "tender", "hound", "eel"],
    },
  },
  {
    id: "floodgate",
    name: "The Floodgate",
    faction: "cistern",
    tier: 4,
    minDepth: 0,
    sentence: "Pulled forward, soaked, conducted: a chain the party can break at any link.",
    formations: {
      2: ["eel", "dredger"],
      3: ["maw", "eel", "dredger"],
      4: ["maw", "eel", "dredger", "tender"],
    },
  },
  {
    id: "drowned-bulwark",
    name: "Drowned Bulwark",
    faction: "cistern",
    tier: 4,
    minDepth: 0,
    sentence: "Plated by the Tender, the Maw holds the line while the Eel works behind it.",
    formations: {
      2: ["tender", "maw"],
      3: ["tender", "maw", "eel"],
      4: ["tender", "maw", "eel", "dredger"],
    },
  },
  {
    id: "pressure-engine",
    name: "The Pressure Engine",
    faction: "cistern",
    elite: true,
    minDepth: 0,
    sentence: "The Engine builds to a vent on every hero: crack it before it blows, while the Eel soaks you.",
    formations: {
      2: ["engine", "eel"],
      3: ["engine", "eel", "tender"],
      4: ["engine", "eel", "tender", "dredger"],
    },
  },
  // ------------------------------------------------------------ ARCHIVE --
  {
    id: "copy-desk",
    name: "The Copy Desk",
    faction: "archive",
    tier: 1,
    minDepth: 0,
    sentence: "The Scribe seals a hero's sentence: break the seal, or reach the Scribe behind the Bulwark.",
    formations: {
      2: ["scribe", "bulwark"],
      3: ["scribe", "bulwark", "hound"],
      4: ["scribe", "bulwark", "hound", "stoker"],
    },
  },
  {
    id: "ledger-room",
    name: "The Ledger Room",
    faction: "archive",
    tier: 1,
    minDepth: 0,
    sentence: "The Wraith writes debts that come due in gold: kill it first and they are written off.",
    formations: {
      2: ["wraith", "thief"],
      3: ["wraith", "thief", "bulwark"],
      4: ["wraith", "thief", "bulwark", "stoker"],
    },
  },
  {
    id: "the-index",
    name: "The Index",
    faction: "archive",
    tier: 2,
    minDepth: 0,
    sentence: "The Indexer Marks the most exposed hero and leaves them Vulnerable.",
    formations: {
      2: ["indexer", "hound"],
      3: ["indexer", "hound", "bulwark"],
      4: ["indexer", "hound", "bulwark", "sniper"],
    },
  },
  {
    id: "night-clerks",
    name: "Night Clerks",
    faction: "archive",
    tier: 2,
    minDepth: 0,
    sentence: "The Stalker slips between rows and strikes whoever is weakest.",
    formations: {
      2: ["stalker", "bulwark"],
      3: ["stalker", "bulwark", "mender"],
      4: ["stalker", "bulwark", "mender", "acolyte"],
    },
  },
  {
    id: "marked-for-collection",
    name: "Marked for Collection",
    faction: "archive",
    tier: 3,
    minDepth: 0,
    sentence: "The Indexer Marks someone so the Stalker can execute them.",
    formations: {
      2: ["indexer", "stalker"],
      3: ["indexer", "stalker", "bulwark"],
      4: ["indexer", "stalker", "bulwark", "thief"],
    },
  },
  {
    id: "collection-notice",
    name: "Collection Notice",
    faction: "archive",
    tier: 3,
    minDepth: 0,
    sentence: "The Indexer exposes a debtor while the Wraith's ledger comes due.",
    formations: {
      2: ["wraith", "indexer"],
      3: ["wraith", "indexer", "bulwark"],
      4: ["wraith", "indexer", "bulwark", "stalker"],
    },
  },
  {
    id: "sentence-passed",
    name: "Sentence Passed",
    faction: "archive",
    tier: 4,
    minDepth: 0,
    sentence: "A seal ticks on one hero while the Stalker hunts another.",
    formations: {
      2: ["scribe", "stalker"],
      3: ["scribe", "indexer", "stalker"],
      4: ["scribe", "indexer", "stalker", "wraith"],
    },
  },
  {
    id: "probate-court",
    name: "Probate Court",
    faction: "archive",
    tier: 4,
    minDepth: 0,
    sentence: "A sentence and a debt both come due: choose which clock to stop.",
    formations: {
      2: ["wraith", "scribe"],
      3: ["wraith", "scribe", "bulwark"],
      4: ["wraith", "scribe", "bulwark", "indexer"],
    },
  },
];
/**
 * The highest tier a chamber at each floor depth may draw. The first fight on
 * a floor teaches one thing; the next teaches another; the middle combines
 * them; the last fights before the rest are synergies.
 */
export const CURVE = [1, 2, 2, 3, 4, 4] as const;

/**
 * A faction floor's draw: the highest tier the depth allows that the run has
 * not fought yet, falling back down the curve, and only then to a repeat. An
 * elite chamber draws an elite creature's encounter or one of the floor's
 * late synergies.
 */
function factionEncounter(
  s: RunState,
  faction: "cistern" | "archive",
  depth: number,
  elite: boolean,
): EncounterDef {
  const pool = encounters.filter((e) => e.faction === faction);
  const fresh = (e: EncounterDef) => !(s.fought ?? []).includes(e.id);
  if (elite) {
    const hard = pool.filter((e) => e.elite || (e.tier ?? 1) >= 3);
    const unseen = hard.filter(fresh);
    return pick(s, unseen.length ? unseen : hard);
  }
  const regular = pool.filter((e) => !e.elite);
  const cap = CURVE[Math.max(0, Math.min(CURVE.length - 1, depth))];
  for (let tier = cap; tier >= 1; tier--) {
    const open = regular.filter((e) => e.tier === tier && fresh(e));
    if (open.length) return pick(s, open);
  }
  return pick(
    s,
    regular.filter((e) => (e.tier ?? 1) <= cap),
  );
}

export function chooseEncounter(s: RunState, elite = false): EncounterDef {
  const node = s.map.find((n) => n.id === s.currentNode);
  if (
    s.factionVersion === 1 &&
    (node?.biome === "cistern" || node?.biome === "archive")
  )
    return factionEncounter(s, node.biome, node.depth, elite);
  // Across the whole run, not this floor: depth restarts on each floor, and
  // reading it raw would hand floor two the entry fights of floor one.
  const depth = runDepth(
    s,
    s.map.find((n) => n.id === s.currentNode)?.depth ?? 0,
  );
  const biome = s.map.find((n) => n.id === s.currentNode)?.biome;
  return pick(
    s,
    encounters.filter(
      (e) =>
        !e.faction &&
        e.minDepth <= depth &&
        (biome && biome !== "foundry" ? e.biome === biome : !e.biome),
    ),
  );
}
