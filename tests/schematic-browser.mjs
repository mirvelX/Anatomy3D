import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { build } from "../scripts/build.mjs";
import { serve } from "../scripts/serve.mjs";
import { ids } from "../src/data/anatomy.js";

const result = await build();
const { server, url } = await serve(() => result.out);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BROWSER_EXECUTABLE || undefined,
  channel: process.env.BROWSER_CHANNEL || undefined,
});
await mkdir("test-results", { recursive: true });
const errors = [];

async function ready(page) {
  await page.waitForFunction(
    () =>
      document.querySelector("#vertebra")?.options.length === 26 &&
      document.querySelector("#sceneSource")?.textContent.includes("სქემატური 3D"),
  );
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await ready(page);

  assert.equal(await page.locator("#meshMode").count(), 0);
  assert.equal(await page.locator("[data-pilot]").count(), 0);
  assert.equal(await page.locator("#pilotCredits").count(), 0);
  assert.match(await page.locator("#sceneSource").textContent(), /სქემატური 3D/);

  for (const id of ids) {
    await page.locator("#vertebra").selectOption(id);
    await page.waitForFunction((value) => document.querySelector("#vertebra").value === value, id);
    assert.ok((await page.locator("#parts button").count()) > 1, id);
    }

  await page.locator("#vertebra").selectOption("SAC");
  await page.locator("#parts button").filter({ hasText: "Crista sacralis mediana" }).click();
  await page.locator("#soloPart").check();
  const sacrum = await page.locator("#gl").screenshot();
  assert.ok(sacrum.length > 5000);

  await page.locator("#vertebra").selectOption("COC");
  await page.locator("#parts button").filter({ hasText: "Cornu coccygeum" }).click();
  const coccyx = await page.locator("#gl").screenshot();
  assert.notDeepEqual(coccyx, sacrum);

  await page.locator("#vertebra").selectOption("C1");
  await page.locator('[data-assembly="below"]').click();
  assert.equal(await page.locator("#rotate").isDisabled(), false);
  await page.locator("#rotate").fill("20");
  await page.locator("#rotate").dispatchEvent("input");

  for (const view of ["top", "bottom", "front", "back", "side", "reset"]) {
    await page.locator(`[data-view="${view}"]`).click();
  }

  await page.locator("#openCurriculum").click();
  assert.equal(await page.locator("#curriculum").evaluate((el) => el.open), true);
  assert.match(await page.locator("#curriculumTitle").textContent(), /სასწავლო ატლასი/);
  await page.locator("#curriculum [data-close]").click();

  await page.screenshot({ path: "test-results/v10.9-schematic-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
  );
  await page.locator("#stage").scrollIntoViewIfNeeded();
  assert.ok(await page.locator("#gl").isVisible());
  await page.screenshot({ path: "test-results/v10.9-schematic-mobile.png", fullPage: true });

  assert.deepEqual(errors, []);
  await context.close();
  console.log("PASS v10.9 schematic atlas: 26 levels, sacrum/coccyx, C1-C2 motion, curriculum UI, mobile");
} finally {
  await browser.close();
  server.close();
}
