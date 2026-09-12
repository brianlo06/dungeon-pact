import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const out = ".screenshots/equipment";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const captures = [];
const metrics = {};
const measure = () =>
  page
    .locator(".workshop-actor svg")
    .evaluate((el) => ({
      nodes: el.querySelectorAll("*").length,
      equipmentNodes: [...el.querySelectorAll("[data-equipment]")].reduce(
        (n, g) => n + 1 + g.querySelectorAll("*").length,
        0,
      ),
      filters: el.querySelectorAll("filter").length,
      gearPieces: el.querySelectorAll("[data-equipment]").length,
    }));
async function capture(name) {
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  captures.push(name);
}
await page.goto("http://localhost:5399/dev/equipment.html");
await page.waitForTimeout(500);
await capture("01-base-vanguard");
metrics.baseVanguard = await measure();
await page.getByLabel("weapon", { exact: true }).selectOption("blood-price");
await page.waitForTimeout(500);
await capture("02-blood-price");
await page.getByLabel("armor", { exact: true }).selectOption("bastion");
await page.waitForTimeout(500);
await capture("03-bastion");
await page.getByLabel("relic", { exact: true }).selectOption("bounty");
await page.waitForTimeout(500);
await capture("04-fully-geared");
metrics.gearedVanguard = await measure();
await capture("05-geared-idle");
// Slow the actual rig clock to photograph authored anticipation and contact.
await page.evaluate(() => (document.documentElement.dataset.tempo = "0.2"));
await page.getByRole("button", { name: "attack", exact: true }).click();
await page.waitForTimeout(700);
await page.getByRole("button", { name: "Freeze pose" }).click();
await capture("06-melee-anticipation");
await page.getByRole("button", { name: "Resume", exact: true }).click();
await page.waitForTimeout(550);
await page.getByRole("button", { name: "Freeze pose" }).click();
await capture("07-weapon-contact-pose");
await page.getByRole("button", { name: "idle", exact: true }).click();
await page.evaluate(() => (document.documentElement.dataset.tempo = "1"));
await page.getByRole("button", { name: "Trigger armor", exact: true }).click();
await page.waitForTimeout(100);
await capture("08-armor-trigger");
await page.getByRole("button", { name: "Trigger relic", exact: true }).click();
await page.waitForTimeout(100);
await capture("09-relic-trigger");
await page.getByRole("button", { name: "Collector seizes weapon" }).click();
await page.waitForTimeout(200);
await capture("10-seizure-transfer");
await page.waitForTimeout(900);
await capture("11-after-seizure");
await capture("12-strongbox-holding");
await page.getByRole("button", { name: "Break Strongbox / return" }).click();
await page.waitForTimeout(120);
await capture("13-strongbox-break");
await page.waitForTimeout(200);
await capture("14-weapon-returning");
await page.getByLabel("Hero", { exact: true }).selectOption("ranger");
await page.getByLabel("weapon", { exact: true }).selectOption("stormglass");
await page.waitForTimeout(500);
await capture("15-geared-ranger");
await page.goto("http://localhost:5399/dev/equipment.html?screen=auction");
await page.getByRole("button", { name: /Try on/ }).hover();
await page.waitForTimeout(400);
await capture("16-auction-preview");
await page.goto("http://localhost:5399/dev/equipment.html?screen=results");
await page.waitForTimeout(500);
await capture("17-final-party");
await writeFile(
  `${out}/index.html`,
  `<!doctype html><meta charset="utf-8"><title>Dungeon Pact equipment captures</title><style>body{background:#1e1a27;color:#e5d8ba;font:16px system-ui;margin:30px auto;max-width:1200px}img{width:100%;border:1px solid #756344;border-radius:6px}figure{margin:30px 0}figcaption{padding:12px 0}</style><h1>Dungeon Pact · Visible equipment</h1><p>Development workshop captures. Contact is the existing rig's contact pose; auction and results are the actual game components.</p>${captures.map((n) => `<figure><figcaption>${n.replaceAll("-", " ")}</figcaption><a href="${n}.png"><img src="${n}.png" loading="lazy"></a></figure>`).join("")}`,
);
await writeFile(`${out}/metrics.json`, JSON.stringify(metrics, null, 2));
console.log(JSON.stringify({ captures: captures.length, errors, metrics }));
await browser.close();
