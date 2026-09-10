/**
 * Generates the class sprites that `public/art/characters-v2.png` needs.
 *
 * NOT YET RUN END TO END: the account this was written against had no credits,
 * so the request shape is confirmed (the API rejected on billing, not on the
 * payload) but the returned images have never been inspected. Treat the first
 * run as a review step, not a build step.
 *
 *   GEMINI_API_KEY=... npx tsx scripts/generate-sprites.ts [class...]
 *
 * Writes one PNG per class to art-out/. Compositing them into the 2×2 atlas is
 * deliberately left manual: cell alignment and the magenta key both want eyes
 * on the actual output. See docs/ART_DIRECTION.md for the cell manifest.
 */
import { mkdir, writeFile } from "node:fs/promises";

const MODEL = process.env.IMG_MODEL ?? "gemini-2.5-flash-image";

/** Held constant across classes so the four read as one set. */
const STYLE = [
  "16-bit pixel art game sprite, single character, full body, three-quarter view",
  "facing the viewer in a ready combat stance. Chunky hard black outlines 2-3 pixels",
  "thick. Flat colour fills with exactly one highlight tone and one shadow tone per",
  "material. Crisp square pixels, absolutely no anti-aliasing, no gradients, no blur,",
  "no glow, no drop shadow. Scruffy small-adventurer proportions, large head roughly",
  "one third of total height, short sturdy body. Muted dark-fantasy palette of ink",
  "purple, dusty violet, rust orange, bone white and amber. The character is centred",
  "with a small margin on all sides and stands on nothing. Background is a completely",
  "flat uniform pure magenta #FF00FF field with no scenery, no ground, no floor, no",
  "shadow, no texture and no border.",
].join(" ");

const SUBJECTS: Record<string, string> = {
  broker:
    "A dungeon money-dealer. Long travelling coat heavy with coin pouches, a ledger " +
    "book tucked under one arm, a small brass balance scale hanging from the belt, a " +
    "quill behind the ear. Sharp-eyed and mercantile, not a warrior. Dominant colours " +
    "amber and brass over dark violet cloth.",
  herald:
    "A battle standard bearer. Tabard over light mail, a tall banner pole in one hand " +
    "with a rippling pennant, a curved brass horn slung at the hip, a laurel circlet. " +
    "Upright and inspiring, chin high, lightly armoured. Dominant colours pale gold and " +
    "bone white over dusty violet.",
  reaver:
    "A blood-priced berserker. Bare scarred arms, torn leather straps across the chest, " +
    "bloodstained bandages, a huge heavy notched cleaver held low in one hand. Feral and " +
    "reckless, no helmet, wild hair. Dominant colours deep crimson and dark iron.",
  beguiler:
    "A crooked-tongue manipulator. Deep hood over a cracked porcelain half-mask, long " +
    "trailing ribbons, puppet strings looped around the fingers, a shard of mirror in the " +
    "other hand. Sly and unsettling. Dominant colours violet and sickly green.",
};

async function generate(id: string): Promise<Uint8Array> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Error("GEMINI_API_KEY is not set");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SUBJECTS[id]} ${STYLE}` }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    },
  );
  const body = await res.text();
  if (!res.ok) throw Error(`${res.status} ${body.slice(0, 400)}`);
  const data = JSON.parse(body);
  for (const cand of data.candidates ?? [])
    for (const part of cand.content?.parts ?? []) {
      const inline = part.inlineData ?? part.inline_data;
      if (inline?.data) return Buffer.from(inline.data, "base64");
    }
  throw Error(`no image returned: ${body.slice(0, 400)}`);
}

const wanted = process.argv.slice(2).filter((a) => a in SUBJECTS);
const ids = wanted.length ? wanted : Object.keys(SUBJECTS);
await mkdir("art-out", { recursive: true });
for (const id of ids) {
  const png = await generate(id);
  await writeFile(`art-out/${id}.png`, png);
  console.log(`art-out/${id}.png  ${png.length} bytes`);
}
