import { chromium } from "playwright";
import assert from "node:assert/strict";
import { build } from "../scripts/build.mjs";
import { serve } from "../scripts/serve.mjs";

const result = await build();
const { server, url } = await serve(() => result.out);
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || undefined,
  executablePath: process.env.BROWSER_EXECUTABLE || undefined,
});

let checks = 0;
const pass = (label) => {
  checks++;
  console.log("PASS " + label);
};

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(
    () => window.__anatomyDebug?.version === "11.3.0-alpha.1",
  );

  assert.deepEqual(
    await page.locator("#category option").evaluateAll((nodes) =>
      nodes.map((node) => node.value),
    ),
    ["spine", "shoulder", "upperfree"],
  );
  pass("three atlas categories");

  await page.locator("#category").selectOption("shoulder");
  await page.waitForFunction(() => window.__anatomyDebug.state.category === "shoulder");
  for (const bone of ["CLAV", "SCAP"]) {
    await page.locator("#vertebra").selectOption(bone);
    await page.waitForFunction(
      (id) => window.__anatomyDebug.state.vertebra === id,
      bone,
    );
    assert.ok((await page.locator("#parts button").count()) > 2);
    assert.ok(await page.evaluate(() => window.__anatomyDebug.meshes().length > 0));
  }
  pass("clavicle and scapula render");

  await page.locator("#category").selectOption("upperfree");
  await page.waitForFunction(() => window.__anatomyDebug.state.category === "upperfree");
  for (const bone of ["HUM", "ULNA", "RADIUS"]) {
    await page.locator("#vertebra").selectOption(bone);
    await page.waitForFunction(
      (id) => window.__anatomyDebug.state.vertebra === id,
      bone,
    );
    assert.ok((await page.locator("#parts button").count()) > 2);
    assert.ok(await page.evaluate(() => window.__anatomyDebug.meshes().length > 0));
  }
  pass("Humerus, Ulna and Radius render");

  await page.locator('button[data-side="left"]').click();
  assert.equal(
    await page.evaluate(() => window.__anatomyDebug.state.side),
    "left",
  );
  assert.match(await page.locator("#modelLabel").textContent(), /მარცხენა/);
  pass("left-right mirroring control");

  await page.locator("#tabQuiz").click();
  await page.waitForFunction(() => window.__anatomyDebug.state.mode === "quiz");
  assert.ok((await page.locator("#quizChoices button").count()) >= 2);
  pass("quiz mode");

  assert.deepEqual(errors, []);
  pass("no page errors");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

console.log("v11.3 browser checks:", checks);
