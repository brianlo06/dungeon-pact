import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

const base = "http://127.0.0.1:5400/dev/bosses.html";
await page.goto(`${base}?party=4&heroes=vanguard,ranger,arcanist,warden&stage=opening&motion=1&choreo=1&debug=1&tempo=.35`);
await page.locator(".stage").waitFor();
const target = await page.locator(".combatant[data-side=enemy]").first().getAttribute("data-unit");
await page.evaluate((target) => window.__lab.play({ actor: "preview-0", target, move: "melee" }), target);
await page.waitForTimeout(1600);
await page.screenshot({ path: "/private/tmp/choreo-vanguard.png" });
const vanguard = await page.evaluate(() => ({
  clip: document.querySelector("[data-unit=preview-0] .combatant-rig")?.getAttribute("data-clip"),
  travel: document.querySelector("[data-unit=preview-0] .combatant-travel")?.getAttribute("style"),
  debug: document.querySelectorAll(".choreo-debug-point").length,
  api: !!window.__lab.api(),
}));

await page.reload();
await page.locator(".stage").waitFor();
const rangedTarget = await page.locator(".combatant[data-side=enemy]").first().getAttribute("data-unit");
await page.evaluate((target) => window.__lab.play({ actor: "preview-1", target, move: "bow" }), rangedTarget);
await page.waitForTimeout(2100);
await page.screenshot({ path: "/private/tmp/choreo-ranger.png" });
const ranger = await page.evaluate(() => ({
  clip: document.querySelector("[data-unit=preview-1] .combatant-rig")?.getAttribute("data-clip"),
  projectiles: document.querySelectorAll(".choreo-projectile").length,
}));

await page.goto(`${base}?party=2&encounter=hunting-pack&stage=opening&motion=1&choreo=1&debug=1&tempo=.35`);
await page.locator(".stage").waitFor();
const hound = await page.locator("[data-rig=hound]").first().getAttribute("data-unit");
await page.evaluate((actor) => window.__lab.play({ actor, target: "preview-0", move: "melee" }), hound);
await page.waitForTimeout(1600);
await page.screenshot({ path: "/private/tmp/choreo-hound.png" });
const houndState = await page.evaluate((id) => ({
  clip: document.querySelector(`[data-unit='${id}'] .combatant-rig`)?.getAttribute("data-clip"),
  travel: document.querySelector(`[data-unit='${id}'] .combatant-travel`)?.getAttribute("style"),
}), hound);

console.log(JSON.stringify({ errors, vanguard, ranger, hound: houndState }));
await browser.close();
