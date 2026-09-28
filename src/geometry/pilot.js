import { above, below } from "../data/anatomy.js";

export const pilotLevels = ["C1", "C2", "L3"];
const base = new URL("../../assets/bodyparts3d/", import.meta.url);
const models = new Map();
let loading;
export let pilotManifest = null;
export const pilotAvailable = (state) =>
  state.meshMode === "atlas" &&
  pilotLevels.includes(state.vertebra) &&
  models.has(state.vertebra);

export function parseObj(text) {
  const vertices = [],
    faces = [];
  for (const line of text.split(/\r?\n/)) {
    const fields = line.trim().split(/\s+/);
    if (fields[0] === "v") {
      const v = fields.slice(1, 4).map(Number);
      if (v.length !== 3 || !v.every(Number.isFinite))
        throw Error("Invalid vertex");
      vertices.push(v);
    }
    if (fields[0] === "f") {
      const face = fields.slice(1).map((v) => Number(v.split("/")[0]) - 1);
      if (
        face.length !== 3 ||
        !face.every((i) => Number.isInteger(i) && i >= 0 && i < vertices.length)
      )
        throw Error("Invalid triangle");
      faces.push(face);
    }
  }
  if (!vertices.length || !faces.length) throw Error("Empty mesh");
  return { vertices, faces };
}

export function validateRegions(mesh, mask) {
  const seen = new Set();
  for (const indices of Object.values(mask.groups)) {
    if (!Array.isArray(indices)) throw Error("Invalid region");
    for (const i of indices) {
      if (
        !Number.isInteger(i) ||
        i < 0 ||
        i >= mesh.faces.length ||
        seen.has(i)
      )
        throw Error("Overlapping or invalid region");
      seen.add(i);
    }
  }
  if (seen.size !== mesh.faces.length) throw Error("Incomplete mesh partition");
}

async function checkedFile(file, sha) {
  const response = await fetch(new URL(file, base));
  if (!response.ok) throw Error("Model download failed");
  const buffer = await response.arrayBuffer();
  if (sha) {
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    const actual = [...new Uint8Array(digest)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
    if (actual !== sha) throw Error("Model integrity check failed");
  }
  return new TextDecoder().decode(buffer);
}

export async function loadPilot() {
  if (loading) return loading;
  loading = (async () => {
    const manifest = JSON.parse(await checkedFile("manifest.json"));
    const entries = await Promise.all(
      Object.entries(manifest.assets).map(async ([id, asset]) => {
        const [obj, regions] = await Promise.all([
          checkedFile(asset.file, asset.sha256),
          checkedFile(asset.mask, asset.maskSha256),
        ]);
        const mesh = parseObj(obj),
          mask = JSON.parse(regions);
        if (mask.sourceSha256 !== asset.sha256)
          throw Error("Region source mismatch");
        validateRegions(mesh, mask);
        return [id, { ...mesh, groups: mask.groups, asset }];
      }),
    );
    for (const [id, model] of entries) models.set(id, model);
    pilotManifest = manifest;
    return manifest;
  })().catch((error) => {
    loading = null;
    throw error;
  });
  return loading;
}

export function pilotParts(state) {
  if (!pilotAvailable(state)) return null;
  return new Set([
    "all",
    ...Object.keys(models.get(state.vertebra).groups).filter(
      (x) => x !== "unsegmented",
    ),
  ]);
}

// One shared transform for every bone: no per-bone recentering or guessed spacing.
// Source mm -> display units, with Z up and Y posterior in the source.
export function transformSource(point, anchor) {
  return [
    (point[0] - anchor[0]) / 20,
    (point[2] - anchor[2]) / 20,
    (point[1] - anchor[1]) / 20,
  ];
}

export function buildPilotScene(state) {
  const target = models.get(state.vertebra);
  const [min, max] = target.asset.sourceBoundsMm;
  const anchor = min.map((x, i) => (x + max[i]) / 2);
  const entries = [{ id: state.vertebra, owner: "target", y: 0 }];
  const omitted = [];
  for (const [owner, id, sign] of [
    ["above", above(state.vertebra), 1],
    ["below", below(state.vertebra), -1],
  ]) {
    if (![owner, "both"].includes(state.assembly) || !id) continue;
    if (models.has(id))
      entries.push({ id, owner, y: ((sign * state.explode) / 100) * 0.72 });
    else omitted.push(id);
  }
  const grouped = new Map(),
    extents = [
      [Infinity, Infinity, Infinity],
      [-Infinity, -Infinity, -Infinity],
    ];
  for (const pose of entries) {
    const mesh = models.get(pose.id),
      vertices = mesh.vertices.map((v) => transformSource(v, anchor));
    for (const v of vertices)
      for (let a = 0; a < 3; a++) {
        const value = v[a] + (a === 1 ? pose.y : 0);
        extents[0][a] = Math.min(extents[0][a], value);
        extents[1][a] = Math.max(extents[1][a], value);
      }
    const groups =
      pose.owner === "target"
        ? mesh.groups
        : { unsegmented: mesh.faces.map((_, i) => i) };
    for (const [part, indices] of Object.entries(groups))
      grouped.set(
        pose.owner + "|" + part,
        indices.map((i) => mesh.faces[i].map((v) => vertices[v])),
      );
  }
  return {
    grouped,
    poses: entries,
    omitted,
    anchor,
    bounds: {
      center: extents[0].map((x, i) => (x + extents[1][i]) / 2),
      height: Math.max(3.3, extents[1][1] - extents[0][1] + 0.8),
      width: Math.max(
        4.4,
        extents[1][0] - extents[0][0] + 0.5,
        extents[1][2] - extents[0][2] + 0.5,
      ),
    },
  };
}

export const pilotAssetUrl = (file) => new URL(file, base).href;
