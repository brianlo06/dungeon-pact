/**
 * A boss intro's sounds, rendered offline in the lab page: peak / RMS over
 * three seconds for every voice in `src/client/boss-intros/<boss>/sounds.ts`.
 *
 *   npx tsx scripts/intro-levels.ts <boss> [port]
 */
import { chromium } from "@playwright/test";
const boss = process.argv[2];
const port = process.argv[3] ?? "5561";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/dev/ultimates.html?hero=vanguard`);
const out = await page.evaluate(async (boss) => {
  const m = await import(/* @vite-ignore */ `/src/client/boss-intros/${boss}/sounds.ts`);
  const res: Record<string, string> = {};
  for (const [id, v] of Object.entries<any>(m.voices)) {
    const c = new OfflineAudioContext(1, 44100 * 3, 44100);
    v.render(c, c.destination, 0.01);
    const b = await c.startRendering();
    const d = b.getChannelData(0);
    let peak = 0, sum = 0;
    for (const x of d) { peak = Math.max(peak, Math.abs(x)); sum += x * x; }
    res[id] = `${peak.toFixed(2)} / ${Math.sqrt(sum / d.length).toFixed(3)}`;
  }
  return res;
}, boss);
console.log(out);
await browser.close();
