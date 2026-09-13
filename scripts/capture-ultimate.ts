import { chromium } from "@playwright/test";

/**
 * Capture frames of an Ultimate cinematic from the Ultimate lab.
 *
 *   npx tsx scripts/capture-ultimate.ts <out-dir> <port> name=query ...
 *
 * Each `name=query` is a lab query string; the frame is saved as
 * `<out-dir>/<name>.png`. A query with `shot=` waits for that shot, paused.
 */
const [out, port, ...jobs] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1700, height: 1000 } });
const errors: string[] = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));
for (const job of jobs) {
  const at = job.indexOf("=");
  const name = job.slice(0, at);
  const query = job.slice(at + 1);
  await page.goto(`http://127.0.0.1:${port}/dev/ultimates.html?${query}`);
  await page.locator(".stage").waitFor();
  const q = new URLSearchParams(query);
  // `do=click:<selector>;wait:<ms>;…` drives the page before the capture.
  for (const step of (q.get("do") ?? "").split(";").filter(Boolean)) {
    const [verb, ...rest] = step.split(":");
    const arg = rest.join(":");
    if (verb === "click") await page.locator(arg).first().click();
    if (verb === "hover") await page.locator(arg).first().hover();
    if (verb === "wait") await page.waitForTimeout(Number(arg));
  }
  if (q.has("shot")) {
    await page
      .locator(`.ult-cinematic[data-shot-index="${q.get("shot")}"]`)
      .waitFor({ timeout: 45000 });
  } else if (q.get("wait")) {
    await page.locator(q.get("wait")!).first().waitFor({ timeout: 45000 });
  }
  await page.waitForTimeout(Number(q.get("settle") ?? 400));
  // FORMAT=jpeg for small files a report can embed.
  const jpeg = process.env.FORMAT === "jpeg";
  // `crop=<selector>`: capture just that element, padded, for close checks.
  const crop = q.get("crop");
  if (crop) {
    const box = await page.locator(crop).first().boundingBox();
    if (box) {
      const pad = Math.max(box.width, box.height) * 0.35;
      await page.screenshot({
        path: `${out}/${name}.png`,
        clip: { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 },
      });
      console.log("saved", name);
      continue;
    }
  }
  await page.locator(".preview-viewport").screenshot({
    path: `${out}/${name}.${jpeg ? "jpg" : "png"}`,
    ...(jpeg ? { type: "jpeg" as const, quality: 80 } : {}),
  });
  console.log("saved", name);
}
if (errors.length) console.log("ERRORS\n" + [...new Set(errors)].slice(0, 12).join("\n"));
// A contact sheet of everything captured, two across at half size, so a run
// of frames can be looked at in one image.
if (process.env.SHEET) {
  const { readFileSync } = await import("node:fs");
  const names = jobs.map((j) => j.slice(0, j.indexOf("=")));
  const cells = names
    .map(
      (n) =>
        `<figure><img src="data:image/png;base64,${readFileSync(`${out}/${n}.png`).toString("base64")}"><figcaption>${n}</figcaption></figure>`,
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
