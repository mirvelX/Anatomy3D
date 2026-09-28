import test from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  validProgress,
  loadWorkspace,
  saveWorkspace,
  parseBackup,
  makeBackup,
  WORKSPACE_KEY,
  PREVIOUS_KEY,
  LEGACY_KEY,
} from "../src/storage/workspace.js";
function memory(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    data,
  };
}
test("migrates v8 without removing original data and survives reload", () => {
  const old = {
    vertebra: "C1",
    assembly: "both",
    selected: "antArch",
    labels: false,
    dim: false,
    progress: { correct: 3, total: 5 },
    learned: { "C1:antArch": true, "fake:part": true },
  };
  const storage = memory({ [LEGACY_KEY]: JSON.stringify(old) }),
    state = loadWorkspace(() => storage);
  assert.equal(state.vertebra, "C1");
  assert.deepEqual(state.progress, old.progress);
  assert.deepEqual(state.learned, { "C1:antArch": true });
  assert.equal(
    saveWorkspace(() => storage, state),
    true,
  );
  assert.equal(storage.getItem(LEGACY_KEY), JSON.stringify(old));
  assert.deepEqual(
    loadWorkspace(() => storage),
    state,
  );
});
test("migrates v7 score and rejects impossible scores", () => {
  assert.deepEqual(
    loadWorkspace(() => memory({ vertebraAtlasV7: '{"correct":2,"total":4}' }))
      .progress,
    { correct: 2, total: 4 },
  );
  for (const value of [
    { correct: -1, total: 4 },
    { correct: 5, total: 4 },
    { correct: 1.5, total: 2 },
    { correct: 0, total: Infinity },
    { correct: 0, total: Number.MAX_SAFE_INTEGER + 1 },
  ])
    assert.equal(validProgress(value), false);
});
test("current and legacy backup round trips; validates before mutation", () => {
  const state = createState();
  state.learned = { "L5:body": true };
  state.progress = { correct: 2, total: 3 };
  const backup = makeBackup(state);
  assert.deepEqual(parseBackup(backup), state);
  const legacy = { ...backup, version: "8.0" };
  delete legacy.schemaVersion;
  assert.deepEqual(parseBackup(legacy), state);
  assert.throws(() =>
    parseBackup({ ...backup, progress: { correct: 4, total: 1 } }),
  );
  assert.throws(() => parseBackup({ ...backup, schemaVersion: 999 }));
  assert.throws(() => parseBackup({ ...backup, learned: { "L5:dens": true } }));
  assert.deepEqual(state.progress, { correct: 2, total: 3 });
});

test("v9 migration retains exact original and v10 additions survive backups", () => {
  const old = {
    ...makeBackup(createState()),
    version: "9.0",
    schemaVersion: 9,
    learned: { "C2:dens": true },
    progress: { correct: 4, total: 7 },
  };
  const bytes = JSON.stringify(old);
  const storage = memory({ [PREVIOUS_KEY]: bytes });
  const state = loadWorkspace(() => storage);
  assert.deepEqual(state.progress, old.progress);
  state.learned["C6:carotidTubercle"] = true;
  state.learned["L3:accessory"] = true;
  state.learned["C2:densPosterior"] = true;
  state.contextOpacity = 27;
  state.soloPart = true;
  assert.ok(saveWorkspace(() => storage, state));
  assert.equal(storage.getItem(PREVIOUS_KEY), bytes);
  assert.deepEqual(
    loadWorkspace(() => storage),
    state,
  );
  assert.deepEqual(parseBackup(makeBackup(state)), state);
  assert.equal(makeBackup(state).schemaVersion, 10);
  const invalid = makeBackup(state);
  invalid.workspace.contextOpacity = -20;
  assert.equal(parseBackup(invalid).contextOpacity, 12);
});
test("normalizes unavailable selection and coccyx neighbors", () => {
  const backup = makeBackup(createState());
  backup.workspace = { vertebra: "COC", assembly: "both", selected: "dens" };
  const state = parseBackup(backup);
  assert.equal(state.assembly, "above");
  assert.equal(state.selected, "all");
});
test("corrupt current data is retained for recovery", () => {
  const storage = memory({
    [WORKSPACE_KEY]: "{broken",
    [LEGACY_KEY]: JSON.stringify({
      ...createState(),
      progress: { correct: 1, total: 2 },
    }),
  });
  const state = loadWorkspace(() => storage);
  assert.equal(state.progress.total, 2);
  assert.ok(
    [...storage.data.keys()].some((key) =>
      key.startsWith(WORKSPACE_KEY + "_recovery_"),
    ),
  );
});
test("blocked storage does not crash and save reports failure", () => {
  const reports = [];
  const deny = () => {
    throw Error("SecurityError");
  };
  assert.deepEqual(
    loadWorkspace(deny, (message) => reports.push(message)),
    createState(),
  );
  assert.equal(
    saveWorkspace(deny, createState(), (message) => reports.push(message)),
    false,
  );
  assert.equal(reports.length, 2);
  const full = memory();
  full.setItem = () => {
    throw Error("QuotaExceededError");
  };
  assert.equal(
    saveWorkspace(() => full, createState()),
    false,
  );
});
