import { test, expect, type Page } from "@playwright/test";

/**
 * The tuned roster's choreography, on the real stage.
 *
 * Each move is played through the Battle Lab's choreography panel, which
 * appends synthesised beats that the director replays exactly as it replays
 * a real round. A recorder in the page timestamps, from the same frames the
 * player sees, when each projectile appears and arrives, when each target
 * starts to flinch, when a number is thrown, and where the actor's figure is
 * — so "nothing lands before what carries it arrives" is checked against
 * what was drawn, not against the plan.
 *
 * Choreography does not depend on the viewport, so this runs at one size.
 */

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== "1440x900", "choreography runs at one size");
});

const scene = (params: Record<string, string | number>) =>
  `/dev/bosses.html?${new URLSearchParams({
    viewport: "fit",
    stage: "objective",
    motion: "1",
    choreo: "1",
    ...(params as Record<string, string>),
  })}`;

interface Record_ {
  projectiles: { cls: string; from: string; to: string; born: number; arrived?: number }[];
  pops: { cls: string; text: string; at: number }[];
  hurt: Record<string, number>;
  samples: { t: number; travel: string; dist: number }[];
  done?: number;
}
type Probe = Window & {
  __rec?: Record_;
  __lab?: {
    play: (r: object) => void;
    api: () => { timeline: () => unknown; setSpeed: (n: number) => void } | null;
  };
};

async function open(page: Page, params: Record<string, string | number>) {
  await page.goto(scene(params));
  await page.locator(".stage").waitFor();
  await page.waitForFunction(() => !!(window as Probe).__lab?.api());
  // Let the entrance and the first layout settle.
  await page.waitForTimeout(600);
}

/** The unit id of the combatant whose plate shows this name. */
const unitId = (page: Page, name: string) =>
  page
    .locator(".combatant", { has: page.locator(`.combatant-name:text-is("${name}")`) })
    .first()
    .getAttribute("data-unit");

/**
 * Start recording, play one move at a speed, and wait for its replay to end.
 * `watch` is the actor whose figure is sampled, `near` the unit it is
 * measured against.
 */
async function perform(
  page: Page,
  req: { actor: string; target: string; ability?: string; move?: string; amount?: number },
  opts: { speed?: number; watch?: string; near?: string } = {},
): Promise<Record_> {
  await page.evaluate(
    ({ speed, watch, near }) => {
      const w = window as Probe;
      const rec: Record_ = { projectiles: [], pops: [], hurt: {}, samples: [] };
      w.__rec = rec;
      const now = () => performance.now();
      const layer = document.querySelector(".stage")!;
      new MutationObserver((records) => {
        for (const r of records) {
          if (r.type === "childList")
            r.addedNodes.forEach((n) => {
              if (!(n instanceof HTMLElement)) return;
              if (n.classList.contains("projectile"))
                rec.projectiles.push({
                  cls: n.className,
                  from: n.dataset.from ?? "",
                  to: n.dataset.to ?? "",
                  born: now(),
                });
              if (n.classList.contains("vfx-pop"))
                rec.pops.push({ cls: n.className, text: n.textContent ?? "", at: now() });
            });
          else if (r.target instanceof HTMLElement) {
            const el = r.target;
            if (r.attributeName === "data-arrived" && el.dataset.arrived) {
              const p = rec.projectiles.find((x) => x.arrived === undefined && el.className.startsWith(x.cls.split(" ")[0]) && x.from === el.dataset.from && x.to === el.dataset.to);
              if (p) p.arrived = now();
            }
            if (r.attributeName === "data-clip" && el.dataset.clip === "hurt") {
              const id = el.closest<HTMLElement>(".combatant")?.dataset.unit;
              if (id && rec.hurt[id] === undefined) rec.hurt[id] = now();
            }
          }
        }
      }).observe(layer, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["data-arrived", "data-clip"],
      });
      const centre = (id?: string) => {
        const r = id
          ? document.querySelector(`.combatant[data-unit="${id}"] .combatant-rig`)?.getBoundingClientRect()
          : undefined;
        return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
      };
      const tick = () => {
        if (watch) {
          const travel =
            document.querySelector<HTMLElement>(`.combatant[data-unit="${watch}"] .combatant-travel`)?.style.transform ?? "";
          const a = centre(watch);
          const b = centre(near);
          rec.samples.push({ t: now(), travel, dist: a && b ? Math.hypot(a.x - b.x, a.y - b.y) : -1 });
        }
        if (rec.done === undefined) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      w.__lab!.api()!.setSpeed(speed ?? 1);
    },
    { speed: opts.speed, watch: opts.watch, near: opts.near },
  );
  await page.evaluate((r) => (window as Probe).__lab!.play(r), req);
  await page.waitForFunction(() => !!(window as Probe).__lab!.api()!.timeline());
  await page.waitForFunction(() => !(window as Probe).__lab!.api()!.timeline(), undefined, {
    timeout: 20_000,
  });
  return page.evaluate(() => {
    const rec = (window as Probe).__rec!;
    rec.done = performance.now();
    return rec;
  });
}

/** One frame's slack: a beat and its arrival are drawn in the same frame. */
const FRAME = 34;

test.describe("the tuned roster's choreography", () => {
  for (const speed of [1, 2])
    test(`the Arcanist's spark crosses the stage and lands before its damage, at ${speed}×`, async ({ page }) => {
      await open(page, { encounter: "repair-detail", party: 3, heroes: "vanguard,arcanist,ranger" });
      const target = (await unitId(page, "Iron Bulwark"))!;
      const rec = await perform(page, { actor: "preview-1", target, ability: "Arcane spark" }, { speed });
      const orbs = rec.projectiles.filter((p) => p.cls.includes("projectile-orb"));
      expect(orbs).toHaveLength(1);
      expect(orbs[0].from).toBe("preview-1");
      expect(orbs[0].arrived).toBeDefined();
      // It is seen travelling, not just appearing where it lands.
      expect(orbs[0].arrived! - orbs[0].born).toBeGreaterThan(40 / speed);
      const damage = rec.pops.find((p) => p.cls.includes("pop-damage") || p.cls.includes("pop-critical"));
      expect(damage).toBeDefined();
      expect(orbs[0].arrived!).toBeLessThanOrEqual(damage!.at + FRAME);
      expect(rec.hurt[target]).toBeGreaterThanOrEqual(orbs[0].arrived! - FRAME);
    });

  test("the Iron Bulwark leaves home, rams its target up close, and backs home", async ({ page }) => {
    await open(page, { encounter: "repair-detail", party: 3, heroes: "vanguard,arcanist,ranger" });
    const actor = (await unitId(page, "Iron Bulwark"))!;
    const rec = await perform(
      page,
      { actor, target: "preview-0", ability: "Shield ram", amount: 22 },
      { watch: actor, near: "preview-0" },
    );
    const moving = rec.samples.filter((s) => s.travel.includes("translate"));
    expect(moving.length).toBeGreaterThan(5);
    const start = rec.samples.find((s) => s.dist > 0)!.dist;
    const closest = Math.min(...rec.samples.filter((s) => s.dist > 0).map((s) => s.dist));
    expect(closest).toBeLessThan(start * 0.5);
    // Contact comes when it is up close, not while it is still crossing.
    const hurt = rec.hurt["preview-0"];
    expect(hurt).toBeDefined();
    const at = rec.samples.reduce((a, b) => (Math.abs(b.t - hurt) < Math.abs(a.t - hurt) ? b : a));
    expect(at.dist).toBeLessThan(start * 0.6);
    // And it ends the move home, with no offset left on it.
    expect(rec.samples.at(-1)!.travel).toBe("");
    const back = rec.samples.findLastIndex((s) => s.travel.includes("translate"));
    expect(rec.samples[back].t).toBeGreaterThan(hurt);
  });

  test("the Kiln Mender's weld reaches its ally before the heal number rises", async ({ page }) => {
    await open(page, { encounter: "repair-detail", party: 3, heroes: "vanguard,arcanist,ranger" });
    const actor = (await unitId(page, "Kiln Mender"))!;
    const target = (await unitId(page, "Iron Bulwark"))!;
    const rec = await perform(page, { actor, target, ability: "Repair lattice", amount: 18 });
    const welds = rec.projectiles.filter((p) => p.cls.includes("projectile-weld"));
    expect(welds).toHaveLength(1);
    expect(welds[0].to).toBe(target);
    const heal = rec.pops.find((p) => p.cls.includes("pop-heal"));
    expect(heal).toBeDefined();
    expect(welds[0].arrived!).toBeLessThanOrEqual(heal!.at + FRAME);
    expect(heal!.at - welds[0].born).toBeGreaterThan(40);
  });

  test("the Rivet Sniper's rivet flies from the barrel and lands before its damage", async ({ page }) => {
    await open(page, { encounter: "hunting-pack", party: 3, heroes: "vanguard,arcanist,ranger" });
    const actor = (await unitId(page, "Rivet Sniper"))!;
    const rec = await perform(page, { actor, target: "preview-1", ability: "Kill shot", amount: 30 });
    const rivets = rec.projectiles.filter((p) => p.cls.includes("projectile-rivet"));
    expect(rivets).toHaveLength(1);
    expect(rivets[0].from).toBe(actor);
    const damage = rec.pops.find((p) => !p.cls.includes("pop-heal"));
    expect(damage).toBeDefined();
    expect(rivets[0].arrived!).toBeLessThanOrEqual(damage!.at + FRAME);
    expect(rec.hurt["preview-1"]).toBeGreaterThanOrEqual(rivets[0].arrived! - FRAME);
  });

  test("the Living Bellows' breath reaches the whole row at once", async ({ page }) => {
    await open(page, { encounter: "smoke-line", party: 4 });
    const actor = (await unitId(page, "Living Bellows"))!;
    const rec = await perform(page, { actor, target: "preview-0", ability: "Furnace blast", move: "area" });
    const cones = rec.projectiles.filter((p) => p.cls.includes("projectile-cone"));
    // One breath, not a visit to each target.
    expect(rec.projectiles).toHaveLength(1);
    expect(cones).toHaveLength(1);
    const hit = Object.entries(rec.hurt).filter(([id]) => id.startsWith("preview-"));
    expect(hit.length).toBeGreaterThanOrEqual(2);
    const times = hit.map(([, t]) => t);
    expect(Math.max(...times) - Math.min(...times)).toBeLessThanOrEqual(FRAME);
    expect(Math.min(...times)).toBeGreaterThanOrEqual(cones[0].arrived! - FRAME);
  });
});
