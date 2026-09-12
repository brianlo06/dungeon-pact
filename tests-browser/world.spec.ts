import { test, expect } from "@playwright/test";
test("music produces a bounded audible signal and stops after deactivation", async ({
  page,
}) => {
  await page.goto("/dev/equipment.html");
  await page.getByRole("button", { name: "idle", exact: true }).click();
  const levels = await page.evaluate(async () => {
    const source = "/src/client/audio/score.ts";
    const { ScorePlayer } = await import(source);
    const ctx = new AudioContext();
    await ctx.resume();
    const analyser = ctx.createAnalyser();
    const original = ctx.createGain.bind(ctx);
    let first = true;
    ctx.createGain = () => {
      const gain = original();
      if (first) {
        gain.connect(analyser);
        first = false;
      }
      return gain;
    };
    const score = new ScorePlayer(ctx);
    const samples = new Float32Array(analyser.fftSize);
    const rms = () => {
      analyser.getFloatTimeDomainData(samples);
      return Math.sqrt(samples.reduce((n, v) => n + v * v, 0) / samples.length);
    };
    score.set("battle", 0.3, true);
    await new Promise((r) => setTimeout(r, 750));
    const playing = rms();
    score.set("battle", 0, false);
    await new Promise((r) => setTimeout(r, 250));
    const stopped = rms();
    await ctx.close();
    return { playing, stopped };
  });
  expect(levels.playing).toBeGreaterThan(0.0001);
  expect(levels.playing).toBeLessThan(0.2);
  expect(levels.stopped).toBeLessThan(0.00001);
});
test("new gear has distinct stable silhouettes on Vanguard and Ranger", async ({
  page,
}, info) => {
  await page.goto(
    "/dev/equipment.html?items=rivet-breaker,lattice-shell,salvage-token",
  );
  const actor = page.locator(".workshop-actor");
  const silhouettes = new Set<string>();
  for (const weapon of [
    "rivet-breaker",
    "debt-hook",
    "survey-spike",
    "slag-cutter",
    "quench-rod",
    "tithe-hammer",
  ]) {
    await page.getByLabel("weapon", { exact: true }).selectOption(weapon);
    const art = actor.locator(`[data-equipment="${weapon}"]`);
    await expect(art).toBeVisible();
    silhouettes.add(await art.innerHTML());
    await expect(actor.locator("[data-base-weapon]")).toBeHidden();
  }
  expect(silhouettes.size).toBe(6);
  for (const armor of [
    "lattice-shell",
    "suture-coat",
    "quench-mail",
    "antidote-weave",
    "rebuke-plate",
    "second-skin",
  ]) {
    await page.getByLabel("armor", { exact: true }).selectOption(armor);
    await expect(
      actor.locator(`[data-attachment="torso"] [data-equipment="${armor}"]`),
    ).toBeVisible();
  }
  for (const relic of [
    "salvage-token",
    "mercy-ampoule",
    "grounding-cell",
    "safety-seal",
    "steady-heart",
    "surge-vial",
    "victory-bell",
    "contract-splinter",
  ]) {
    await page.getByLabel("relic", { exact: true }).selectOption(relic);
    await expect(actor.locator(`[data-equipment="${relic}"]`)).toBeVisible();
  }
  await page.screenshot({
    path: info.outputPath("new-vanguard.png"),
    fullPage: true,
  });
  await page.getByLabel("Hero", { exact: true }).selectOption("ranger");
  await expect(
    actor.locator('[data-part="bow"] [data-equipment="tithe-hammer"]'),
  ).toBeVisible();
  await page.getByRole("button", { name: "attack", exact: true }).click();
  await expect(
    actor.locator('[data-part="arrow"] [data-gear-projectile="tithe-hammer"]'),
  ).toBeAttached();
  await page.screenshot({
    path: info.outputPath("new-ranger.png"),
    fullPage: true,
  });
});
for (const [encounter, biome] of [
  ["sluice-sentries", "cistern"],
  ["probate-guard", "archive"],
]) {
  test(`${biome} renders real combat without stage or HUD overflow`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      `/dev/bosses.html?encounter=${encounter}&party=4&stage=opening`,
    );
    await expect(page.locator(`[data-biome="${biome}"]`)).toBeVisible();
    await expect(page.locator(".combatant-body")).toHaveCount(8);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const stage = await page.locator(".stage").boundingBox();
    expect(stage!.x).toBeGreaterThanOrEqual(0);
    expect(stage!.x + stage!.width).toBeLessThanOrEqual(
      page.viewportSize()!.width + 1,
    );
    await page.screenshot({ path: info.outputPath(`${biome}.png`) });
    expect(errors).toEqual([]);
  });
}
test("screened targets are disabled and reach explanation is visible", async ({
  page,
}) => {
  await page.goto(
    "/dev/bosses.html?encounter=sluice-sentries&party=2&stage=opening",
  );
  await page
    .getByRole("option", { name: "Shieldbreaker Free", exact: true })
    .click();
  await expect(page.locator(".commit-what")).toContainText(
    "Front enemies screen",
  );
  const enemies = page.locator('.combatant[data-side="enemy"] .combatant-body');
  // Full server validation is covered by unit tests; here the UI must withhold illegal selections.
  await expect(enemies).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: /^Iron Bulwark,/ }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: /^Rivet Sniper,/ }),
  ).toBeDisabled();
});
