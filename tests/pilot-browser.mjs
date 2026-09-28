import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { build } from "../scripts/build.mjs";
import { serve } from "../scripts/serve.mjs";
const result = await build();
const { server, url } = await serve(() => result.out);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BROWSER_EXECUTABLE || undefined,
  channel: process.env.BROWSER_CHANNEL || undefined,
});
await mkdir("test-results", { recursive: true });
const errors = [];
let checks = 0;
const pass = (message) => {
  checks++;
  console.log("PASS " + message);
};
async function ready(page) {
  await page.waitForFunction(
    () => document.querySelector("#vertebra")?.options.length === 26,
  );
}
async function pilot(page, level) {
  await page.locator(`[data-pilot="${level}"]`).click();
  await page.waitForFunction(
    () => document.querySelector("#meshStatus")?.dataset.mode === "atlas",
  );
}
try {
  for (const canvas of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(url + (canvas ? "?canvas" : ""));
    await ready(page);
    for (const level of ["C1", "C2", "L3"]) {
      await pilot(page, level);
      assert.ok(await page.locator("#rotate").isDisabled());
      const expected = level === "C1" ? 5 : level === "C2" ? 5 : 4;
      assert.equal(await page.locator("#parts button").count(), expected);
      assert.ok(await page.locator("#pilotCredits").isVisible());
      await page.locator('[data-assembly="solo"]').click();
      for (const view of ["front", "back", "top", "bottom", "side"]) {
        await page.locator(`[data-view="${view}"]`).click();
        if (!canvas)
          await page
            .locator("#stage")
            .screenshot({ path: `test-results/pilot-${level}-${view}.png` });
      }
      await page.locator('[data-view="reset"]').click();
      const part =
        level === "C1"
          ? "Arcus anterior"
          : level === "C2"
            ? "Dens axis"
            : "Corpus vertebrae";
      await page.locator("#parts button").filter({ hasText: part }).click();
      await page.locator("#soloPart").check();
      await page.locator('[data-view="front"]').click();
      const point = await page.locator("#gl").evaluate((canvas) => {
        const gl = canvas.getContext("webgl");
        let pixels;
        if (gl) {
          pixels = new Uint8Array(canvas.width * canvas.height * 4);
          gl.readPixels(
            0,
            0,
            canvas.width,
            canvas.height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels,
          );
        } else
          pixels = canvas
            .getContext("2d")
            .getImageData(0, 0, canvas.width, canvas.height).data;
        const hits = [];
        for (let y = 5; y < canvas.height - 5; y += 4)
          for (let x = 5; x < canvas.width - 5; x += 4) {
            const i = (y * canvas.width + x) * 4;
            if (
              pixels[i] > 120 &&
              pixels[i] > pixels[i + 1] * 1.1 &&
              pixels[i + 1] > pixels[i + 2] * 1.5
            )
              hits.push([x, gl ? canvas.height - y : y]);
          }
        if (!hits.length)
          throw Error("Selected mesh produced no highlighted pixels");
        const center = hits.reduce(
          (a, p) => [a[0] + p[0] / hits.length, a[1] + p[1] / hits.length],
          [0, 0],
        );
        hits.sort(
          (a, b) =>
            Math.hypot(a[0] - center[0], a[1] - center[1]) -
            Math.hypot(b[0] - center[0], b[1] - center[1]),
        );
        const rect = canvas.getBoundingClientRect();
        return {
          x: (hits[0][0] / canvas.width) * rect.width,
          y: (hits[0][1] / canvas.height) * rect.height,
        };
      });
      await page.locator("#parts button").first().click();
      await page.locator("#gl").click({ position: point });
      if (!(await page.locator("#detailLatin").textContent()).includes(part)) {
        await page.screenshot({
          path: "test-results/pilot-pick-failure.png",
          fullPage: true,
        });
        console.log({
          level,
          point,
          actual: await page.locator("#detailLatin").textContent(),
        });
      }
      assert.ok(
        (await page.locator("#detailLatin").textContent()).includes(part),
        `mesh picking ${level}`,
      );
      await page.locator("#stage").screenshot({
        path: `test-results/pilot-${level}-isolated${canvas ? "-canvas" : ""}.png`,
      });
      await page.locator("#partSeparation").fill("65");
      await page.locator("#partSeparation").dispatchEvent("input");
      await page.locator("#soloPart").uncheck();
      await page.locator("#learnedBtn").click();
      await page.locator("#tabQuiz").click();
      assert.ok((await page.locator("#quizChoices button").count()) >= 3);
      await page.locator("#quizChoices button").first().click();
      assert.match(await page.locator("#score").textContent(), /\/ [1-3]/);
      await page.locator("#tabStudy").click();
      await page.locator('[data-assembly="both"]').click();
    }
    pass(
      (canvas ? "Canvas" : "WebGL") +
        ": all pilot levels, five views, picking, isolation, separation, study and quiz",
    );
    if (!canvas) {
      await page.screenshot({
        path: "test-results/pilot-desktop.png",
        fullPage: true,
      });
      await page.waitForFunction(() => !!navigator.serviceWorker.controller);
      const previous = await page.evaluate(() =>
        localStorage.getItem("anatomy3d_workspace_v10"),
      );
      await context.setOffline(true);
      await page.reload();
      await ready(page);
      await page.waitForFunction(
        () => document.querySelector("#meshStatus").dataset.mode === "atlas",
      );
      const after = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("anatomy3d_workspace_v10")),
      );
      assert.deepEqual(after.learned, JSON.parse(previous).learned);
      for (const level of ["C1", "C2", "L3"]) await pilot(page, level);
      pass("all meshes, masks, credits and progress survive offline reload");
      await context.setOffline(false);
      await page.locator("#vertebra").selectOption("T5");
      assert.equal(
        await page.locator("#meshStatus").getAttribute("data-mode"),
        "schematic",
      );
      pass("unsupported levels explicitly show schematic fallback");
    }
    await context.close();
  }
  const mobile = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });
  const page = await mobile.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await ready(page);
  await pilot(page, "C1");
  await page.locator("#stage").scrollIntoViewIfNeeded();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await page.screenshot({
    path: "test-results/pilot-mobile.png",
    fullPage: true,
  });
  await mobile.close();
  pass("412px mobile layout without horizontal overflow");
  const broken = await browser.newContext({ serviceWorkers: "block" });
  const failed = await broken.newPage();
  await failed.route("**/assets/bodyparts3d/*.obj", (r) =>
    r.fulfill({ status: 503, body: "Unavailable" }),
  );
  await failed.goto(url);
  await ready(failed);
  await failed.locator('[data-pilot="C1"]').click();
  await failed.locator("#meshRetry").waitFor({ state: "visible" });
  assert.equal(
    await failed.locator("#meshStatus").getAttribute("data-mode"),
    "schematic",
  );
  assert.ok((await failed.locator("#parts button").count()) > 5);
  await failed.unroute("**/assets/bodyparts3d/*.obj");
  await failed.locator("#meshRetry").click();
  await failed.waitForFunction(
    () => document.querySelector("#meshStatus").dataset.mode === "atlas",
  );
  await broken.close();
  pass(
    "failed asset load retains labeled fallback and retry restores the pilot",
  );
  assert.deepEqual(errors, []);
  console.log(`${checks} pilot scenarios passed; no uncaught page errors.`);
} finally {
  await browser.close();
  server.close();
}
