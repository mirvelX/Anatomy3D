import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash, webcrypto } from "node:crypto";
import {
  parseObj,
  validateRegions,
  transformSource,
  loadPilot,
  buildPilotScene,
  pilotParts,
} from "../src/geometry/pilot.js";
import { createState } from "../src/storage/workspace.js";
import { createScene } from "../src/geometry/scene.js";
import { activePart, visiblePart } from "../src/rendering/visibility.js";
const root = new URL("../assets/bodyparts3d/", import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL("manifest.json", root), "utf8"),
);

test("exact asset hashes, identities and license headers; masks partition every source face once", async () => {
  for (const [id, asset] of Object.entries(manifest.assets)) {
    const bytes = await readFile(new URL(asset.file, root));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      asset.sha256,
    );
    const text = bytes.toString();
    assert.ok(
      text.includes("Creative Commons Attribution-Share Alike 2.1 Japan"),
    );
    for (const identity of [
      asset.fileId,
      asset.conceptId,
      asset.representationId,
    ])
      assert.ok(text.includes(identity));
    const mesh = parseObj(text);
    assert.equal(mesh.faces.length, asset.triangles);
    assert.equal(mesh.vertices.length, asset.vertices);
    const maskBytes = await readFile(new URL(asset.mask, root));
    assert.equal(
      createHash("sha256").update(maskBytes).digest("hex"),
      asset.maskSha256,
    );
    const mask = JSON.parse(maskBytes);
    assert.equal(mask.sourceSha256, asset.sha256);
    validateRegions(mesh, mask);
    assert.ok(mask.groups.unsegmented.length > 0, id);
  }
});

test("malformed meshes and overlapping, missing or out-of-range region faces fail closed", () => {
  assert.throws(() => parseObj("v NaN 1 2\nf 1 1 1"));
  assert.throws(() => parseObj("v 1 1 1\nf 1 2 3"));
  const mesh = {
    faces: [
      [0, 1, 2],
      [2, 3, 0],
    ],
  };
  assert.throws(() =>
    validateRegions(mesh, { groups: { body: [0], dens: [0, 1] } }),
  );
  assert.throws(() => validateRegions(mesh, { groups: { body: [0] } }));
  assert.throws(() => validateRegions(mesh, { groups: { body: [0, 2] } }));
});

test("shared transform preserves pairwise distances and relative location at a common scale", () => {
  const a = [-14, -73, 1470],
    b = [-14, -73, 1454],
    anchor = [0, -65, 1471];
  const p = transformSource(a, anchor),
    q = transformSource(b, anchor);
  assert.deepEqual(
    p.map((n, i) => Math.round((n - q[i]) * 1000) / 1000),
    [0, 0.8, 0],
  );
  assert.ok(
    Math.abs(Math.hypot(...p.map((n, i) => n - q[i])) * 20 - 16) < 1e-10,
  );
});

test("pilot uses only acquired neighbors, no invented joints, and selectable draft faces", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => new Response(await readFile(url));
  try {
    await loadPilot();
    for (const vertebra of ["C1", "C2", "L3"])
      for (const assembly of ["solo", "above", "below", "both"]) {
        const state = {
          ...createState(),
          meshMode: "atlas",
          vertebra,
          assembly,
        };
        const scene = createScene(state);
        scene.build();
        assert.ok(scene.realMesh);
        assert.ok(
          ![...scene.grouped.keys()].some((x) => x.startsWith("link|")),
        );
        const parts = pilotParts(state);
        for (const part of parts) {
          if (part === "all") continue;
          assert.ok(scene.grouped.get("target|" + part)?.length);
          state.selected = part;
          state.soloPart = true;
          assert.ok(visiblePart(state, { owner: "target", part }));
          assert.ok(
            !visiblePart(state, { owner: "target", part: "unsegmented" }),
          );
          assert.ok(!activePart(state, { owner: "above", part }));
        }
        if (vertebra === "C1" && ["above", "both"].includes(assembly))
          assert.deepEqual(scene.omitted, ["OCC"]);
        if (vertebra === "L3" && assembly === "both")
          assert.deepEqual(
            scene.poses.map((p) => p.id),
            ["L3", "L2", "L4"],
          );
      }
    const state = { ...createState(), vertebra: "T5", meshMode: "atlas" };
    const scene = createScene(state);
    scene.build();
    assert.equal(scene.realMesh, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
