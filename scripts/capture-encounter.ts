import { chromium } from "@playwright/test";

/**
 * Battle Lab captures of authored encounters, for reviewing a formation's
 * staging and its intent chips.
 *
 *   npx tsx scripts/capture-encounter.ts <outdir> <port> <encounter>[:size][:stage] ...
 *
 * With SHEET=<name> the frames are also tiled into one contact sheet.
 */
const [out, port, ...jobs] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const names: string[] = [];
for (const job of jobs) {
  const [id, size = "3", stage = "opening"] = job.split(":");
  await page.goto(
    `http://127.0.0.1:${port}/dev/bosses.html?encounter=${id}&party=${size}&stage=${stage}&motion=1`,
  );
  await page.locator(".intent-chip").first().waitFor({ timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  const name = `${id}-${size}p`;
  await page.locator(".stage").screenshot({ path: `${out}/${name}.jpg`, type: "jpeg", quality: 82 });
  names.push(name);
  console.log("saved", name);
}
if (process.env.SHEET) {
  const { readFileSync } = await import("node:fs");
  const cells = names
    .map(
      (n) =>
        `<figure><img src="data:image/jpeg;base64,${readFileSync(`${out}/${n}.jpg`).toString("base64")}"><figcaption>${n}</figcaption></figure>`,
    )
    .join("");
  const sheet = await browser.newPage({ viewport: { width: 1290, height: 400 } });
  await sheet.setContent(
    `<style>body{margin:0;background:#111;display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px}figure{margin:0;position:relative}img{width:100%;display:block}figcaption{position:absolute;left:4px;top:2px;color:#0ff;font:12px monospace;background:#000a;padding:1px 4px}</style>${cells}`,
  );
  await sheet.waitForTimeout(200);
  await sheet.screenshot({ path: `${out}/${process.env.SHEET}.png`, fullPage: true });
  console.log("sheet", process.env.SHEET);
}
await browser.close();
