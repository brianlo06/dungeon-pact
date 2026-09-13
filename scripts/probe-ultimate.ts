import { chromium } from "@playwright/test";

/**
 * Where a cinematic's parts are, in world units, at a paused frame. For
 * authoring: find where the helm or the shield really is before aiming a
 * camera or an effect at it.
 *
 *   npx tsx scripts/probe-ultimate.ts <port> "<lab query>" selector...
 */
const [port, query, ...selectors] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1700, height: 1000 } });
await page.goto(`http://127.0.0.1:${port}/dev/ultimates.html?${query}`);
const q = new URLSearchParams(query);
await page.locator(`.ult-cinematic[data-shot-index="${q.get("shot") ?? 0}"]`).waitFor({ timeout: 15000 });
await page.waitForTimeout(400);
// A string, not a function: the TypeScript runner renames functions in a way
// the page cannot evaluate.
const out = await page.evaluate(`(() => {
  const sels = ${JSON.stringify(selectors)};
  const world = document.querySelector(".cine-world");
  const root = document.querySelector(".ult-cinematic").getBoundingClientRect();
  const m = new DOMMatrix(getComputedStyle(world).transform).inverse();
  const toWorld = (x, y) => {
    const p = m.transformPoint(new DOMPoint(x - root.left, y - root.top));
    return [Math.round(p.x), Math.round(p.y)];
  };
  return sels.map((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { sel, missing: true };
    const r = el.getBoundingClientRect();
    return {
      sel,
      centre: toWorld(r.left + r.width / 2, r.top + r.height / 2),
      topLeft: toWorld(r.left, r.top),
      bottomRight: toWorld(r.right, r.bottom),
    };
  });
})()`);
console.log(JSON.stringify(out, null, 1));
await browser.close();
