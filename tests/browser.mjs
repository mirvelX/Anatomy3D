import { chromium } from "playwright";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { build } from "../scripts/build.mjs";
import { serve } from "../scripts/serve.mjs";
import { ids } from "../src/data/anatomy.js";
const result = await build();
let root = result.out;
const { server, url } = await serve(() => root);
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || undefined,
  executablePath: process.env.BROWSER_EXECUTABLE || undefined,
});
const errors = [];
const ready = (page) =>
  page.waitForFunction(
    () => document.querySelector("#vertebra")?.options.length === 26,
  );
const controlled = (page) =>
  page.waitForFunction(() => !!navigator.serviceWorker.controller);
const workspace = (page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("anatomy3d_workspace_v10")),
  );
let checks = 0;
const pass = (label) => {
  checks++;
  console.log("PASS " + label);
};
async function eventually(check) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw Error("Timed out waiting for service worker transition");
}
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() =>
    localStorage.setItem(
      "anatomy3d_workspace_v8",
      JSON.stringify({
        vertebra: "C1",
        assembly: "both",
        selected: "antArch",
        progress: { correct: 2, total: 3 },
        learned: { "C1:antArch": true },
      }),
    ),
  );
  await page.goto(url);
  await ready(page);
  await controlled(page);
  assert.equal(
    await page.evaluate(
      () => !!document.querySelector("#gl").getContext("webgl"),
    ),
    true,
  );
  assert.equal(await page.locator("#vertebra").inputValue(), "C1");
  assert.equal((await workspace(page)).progress.total, 3);
  pass("v8 progress migration");
  for (const id of ids) {
    await page.locator("#vertebra").selectOption(id);
    assert.ok((await page.locator("#parts button").count()) > 1);
  }
  await page.locator("#vertebra").selectOption("L5");
  await page
    .locator("#parts button")
    .filter({ hasText: "Corpus vertebrae" })
    .click();
  await page.locator("#learnedBtn").click();
  await page.reload();
  await ready(page);
  assert.equal((await workspace(page)).learned["L5:body"], true);
  pass("26 selectors and learned-state reload");
  await page.locator("#vertebra").selectOption("C6");
  await page
    .locator("#parts button")
    .filter({ hasText: "Tuberculum caroticum" })
    .click();
  assert.match(
    await page.locator("#sourceInfo a").getAttribute("href"),
    /#page=33$/,
  );
  await page.locator("#contextOpacity").evaluate((el) => {
    el.value = "35";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.reload();
  await ready(page);
  assert.equal(await page.locator("#contextOpacity").inputValue(), "35");
  await page.locator("#soloPart").check();
  const joinedImage = await page.locator("#gl").screenshot();
  await page.locator("#partSeparation").evaluate((el) => {
    el.value = "80";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const separatedImage = await page.locator("#gl").screenshot();
  assert.notDeepEqual(joinedImage, separatedImage);
  await page.locator("#learnedBtn").click();
  await page
    .locator("#parts button")
    .filter({ hasText: "Foramen vertebrale" })
    .click();
  assert.ok(await page.locator("#partSeparation").isDisabled());
  assert.ok(
    await page.evaluate(() => {
      const c = document.querySelector("#gl"),
        gl = c.getContext("webgl");
      const pixels = new Uint8Array(c.width * c.height * 4);
      gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      return pixels.some((v, i) => i % 4 === 0 && v > 100);
    }),
    "isolated foramen guide must render",
  );
  pass("book source, persistent opacity, separation and isolated space guide");
  await page.locator("#soloPart").uncheck();
  await page.locator("#tabQuiz").click();
  await page.locator("#quizScope").selectOption("unlearned");
  const cycleTargets = new Set();
  for (let i = 0; i < 5; i++) {
    const target = await page
      .locator("#quizQuestion")
      .getAttribute("data-part");
    assert.notEqual(target, "carotidTubercle");
    assert.equal(cycleTargets.has(target), false);
    cycleTargets.add(target);
    await page.locator("#next").click();
  }
  const beforeReveal = (await workspace(page)).progress;
  const targetLabel = (
    await page.locator("#quizQuestion").textContent()
  ).replace("მოძებნე: ", "");
  await page.locator("#reveal").click();
  assert.equal(await page.locator("#detailLatin").textContent(), targetLabel);
  assert.deepEqual((await workspace(page)).progress, beforeReveal);
  await page.locator("#quizScope").selectOption("all");
  await page.locator("#tabStudy").click();
  pass(
    "unlearned practice cycle excludes learned parts and reveal is unscored",
  );
  await page.locator("#tabQuiz").click();
  await page.locator("#quizChoices button").first().click();
  const score = (await workspace(page)).progress.total;
  await page.locator("#quizChoices button").first().click();
  assert.equal((await workspace(page)).progress.total, score);
  pass("quiz scores once");
  await page.locator("#tabStudy").click();
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportProgress").click();
  const download = await downloadPromise;
  const backup = JSON.parse(await readFile(await download.path(), "utf8"));
  assert.equal(backup.schemaVersion, 10);
  assert.equal(backup.learned["L5:body"], true);
  const before = await workspace(page);
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.locator("#importProgress").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ ...backup, progress: { correct: -5, total: 0 } }),
    ),
  });
  await page.waitForFunction(
    () => document.querySelector("#importProgress").value === "",
  );
  assert.deepEqual((await workspace(page)).progress, before.progress);
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#importProgress").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page.waitForFunction(
    () => document.querySelector("#importProgress").value === "",
  );
  pass("backup export/import and rejected invalid score");
  const sibling = await context.newPage();
  await sibling.goto(url);
  await ready(sibling);
  await page.locator("#vertebra").selectOption("C2");
  await sibling.waitForFunction(
    () => document.querySelector("#vertebra").value === "C2",
  );
  assert.deepEqual(
    (await workspace(sibling)).progress,
    (await workspace(page)).progress,
  );
  await sibling.close();
  pass("open tabs synchronize saved progress");
  await context.setOffline(true);
  await page.reload();
  await ready(page);
  await page.locator("#vertebra").selectOption("C2");
  assert.ok(await page.locator("#parts button").count());
  await context.setOffline(false);
  pass("offline reload with full modules");
  await mkdir("test-results", { recursive: true });
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  pass("mobile has no horizontal overflow");
  await context.close();

  const v9Context = await browser.newContext();
  const v9Page = await v9Context.newPage();
  v9Page.on("pageerror", (e) => errors.push(e.message));
  await v9Page.addInitScript(() => {
    if (!localStorage.getItem("anatomy3d_workspace_v9"))
      localStorage.setItem(
        "anatomy3d_workspace_v9",
        JSON.stringify({
          app: "Anatomy 3D",
          version: "9.0",
          schemaVersion: 9,
          workspace: {
            vertebra: "C2",
            assembly: "both",
            selected: "dens",
            dim: true,
            labels: true,
          },
          learned: { "C2:dens": true },
          progress: { correct: 5, total: 8 },
        }),
      );
  });
  await v9Page.goto(url);
  await ready(v9Page);
  await controlled(v9Page);
  assert.equal(await v9Page.locator("#vertebra").inputValue(), "C2");
  const originalV9 = await v9Page.evaluate(() =>
    localStorage.getItem("anatomy3d_workspace_v9"),
  );
  await v9Page
    .locator("#parts button")
    .filter({ hasText: "Facies articularis posterior dentis" })
    .click();
  await v9Page.locator("#learnedBtn").click();
  await v9Page.reload();
  await ready(v9Page);
  assert.equal((await workspace(v9Page)).learned["C2:densPosterior"], true);
  assert.equal((await workspace(v9Page)).progress.total, 8);
  assert.equal(
    await v9Page.evaluate(() => localStorage.getItem("anatomy3d_workspace_v9")),
    originalV9,
  );
  pass(
    "v9 progress migration preserves original and new structure after reload",
  );
  await v9Context.close();

  const fallback = await browser.newContext();
  const canvasPage = await fallback.newPage();
  canvasPage.on("pageerror", (e) => errors.push(e.message));
  await canvasPage.goto(url + "/?canvas=1");
  await ready(canvasPage);
  assert.match(await canvasPage.locator(".stage-help").textContent(), /Canvas/);
  for (const id of ["C1", "C2", "T12", "L5", "SAC", "COC"])
    await canvasPage.locator("#vertebra").selectOption(id);
  await canvasPage.locator("#vertebra").selectOption("C6");
  await canvasPage
    .locator("#parts button")
    .filter({ hasText: "Tuberculum caroticum" })
    .click();
  await canvasPage.locator("#soloPart").check();
  const canvasBefore = await canvasPage.locator("#gl").screenshot();
  await canvasPage.locator("#partSeparation").evaluate((el) => {
    el.value = "100";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert.notDeepEqual(
    await canvasPage.locator("#gl").screenshot(),
    canvasBefore,
  );
  await canvasPage
    .locator("#parts button")
    .filter({ hasText: "Foramen vertebrale" })
    .click();
  assert.ok(await canvasPage.locator("#partSeparation").isDisabled());
  await canvasPage.screenshot({
    path: "test-results/canvas.png",
    fullPage: true,
  });
  pass("Canvas fallback including isolation and part separation");
  await fallback.close();

  const blocked = await browser.newContext();
  const denied = await blocked.newPage();
  denied.on("pageerror", (e) => errors.push(e.message));
  await denied.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    }),
  );
  await denied.goto(url);
  await ready(denied);
  assert.equal(await denied.locator("#storageStatus").isVisible(), true);
  await denied.locator("#vertebra").selectOption("C1");
  pass("storage unavailable remains usable");
  await blocked.close();

  const upgrade = await browser.newContext();
  const old = await upgrade.newPage();
  old.on("pageerror", (e) => errors.push(e.message));
  root = resolve("tests/fixtures/v8");
  await old.goto(url);
  await ready(old);
  await controlled(old);
  await old
    .locator("#parts button")
    .filter({ hasText: "Corpus vertebrae" })
    .click();
  await old.locator("#learnedBtn").click();
  root = result.out;
  await old.evaluate(async () => {
    window.__oldController = navigator.serviceWorker.controller;
    const r = await navigator.serviceWorker.getRegistration();
    await r.update();
  });
  await eventually(() =>
    old.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      const keys = await caches.keys();
      return (
        registration.active !== window.__oldController &&
        !registration.installing &&
        !registration.waiting &&
        registration.active?.state === "activated" &&
        registration.active === navigator.serviceWorker.controller &&
        keys.some((key) => key.startsWith("anatomy3d-v9-"))
      );
    }),
  );
  await old.reload();
  await ready(old);
  assert.match(await old.locator(".brand p").textContent(), /v10.1 alpha/);
  assert.equal((await workspace(old)).learned["L5:body"], true);
  pass("real v8 worker to v10 migration");

  const freshContext = await browser.newContext();
  const fresh = await freshContext.newPage();
  fresh.on("pageerror", (e) => errors.push(e.message));
  await fresh.goto(url);
  await ready(fresh);
  await controlled(fresh);

  // Simulate a subsequent complete release using a distinct cache ID.
  const next = resolve("test-results/next");
  await cp(result.out, next, { recursive: true });
  const worker = await readFile(resolve(next, "sw.js"), "utf8");
  await writeFile(
    resolve(next, "sw.js"),
    worker.replace(result.release, result.release + "-test"),
  );
  const nextHtml = await readFile(resolve(next, "index.html"), "utf8");
  await writeFile(
    resolve(next, "index.html"),
    nextHtml.replace("v10.1 alpha", "v10.1 alpha test"),
  );
  root = next;
  await fresh.evaluate(
    async () =>
      await (await navigator.serviceWorker.getRegistration()).update(),
  );
  await fresh.locator("#updateNotice").waitFor({ state: "visible" });
  await fresh.locator("#applyUpdate").click();
  await fresh.waitForFunction(() =>
    document
      .querySelector(".brand p")
      ?.textContent.includes("v10.1 alpha test"),
  );
  await ready(fresh);
  pass("first-install tab reloads after accepting a later update");
  await freshContext.close();
  await old.evaluate(async () => {
    await (await navigator.serviceWorker.getRegistration()).update();
  });
  await old.locator("#updateNotice").waitFor({ state: "visible" });
  assert.doesNotMatch(await old.locator(".brand p").textContent(), /test/);
  await old.locator("#applyUpdate").click();
  await old.waitForFunction(() =>
    document
      .querySelector(".brand p")
      ?.textContent.includes("v10.1 alpha test"),
  );
  await ready(old);
  assert.equal((await workspace(old)).learned["L5:body"], true);
  pass("subsequent release waits for acceptance and preserves progress");

  const bad = resolve("test-results/incomplete");
  await cp(next, bad, { recursive: true });
  const badWorker = (await readFile(resolve(bad, "sw.js"), "utf8"))
    .replace(result.release + "-test", result.release + "-bad")
    .replace("./index.html", "./missing-required.html");
  await writeFile(resolve(bad, "sw.js"), badWorker);
  root = bad;
  await old.evaluate(async () => {
    await (await navigator.serviceWorker.getRegistration()).update();
  });
  await old.locator("#offlineStatus").waitFor({ state: "visible" });
  await old.reload();
  await ready(old);
  assert.match(await old.locator(".brand p").textContent(), /v10.1 alpha test/);
  assert.equal((await workspace(old)).learned["L5:body"], true);
  pass("failed update keeps working release");
  await upgrade.close();
  assert.deepEqual(errors, [], "Uncaught browser errors");
  console.log(`${checks} browser scenarios passed; no uncaught page errors.`);
} finally {
  await browser.close();
  server.close();
}
