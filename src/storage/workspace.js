import { ids, byId } from "../data/anatomy.js";
import { visibleDefs } from "../data/rules.js";

export const WORKSPACE_KEY = "anatomy3d_workspace_v10";
export const PREVIOUS_KEY = "anatomy3d_workspace_v9";
export const LEGACY_KEY = "anatomy3d_workspace_v8";
const SCORE_KEY = "vertebraAtlasV7";
export function createState() {
  return {
    vertebra: "L5",
    meshMode: "schematic",
    assembly: "below",
    selected: "all",
    dim: true,
    contextOpacity: 12,
    soloPart: false,
    partSeparation: 0,
    explode: 0,
    rotation: 0,
    zoom: 1,
    labels: true,
    mode: "study",
    question: null,
    answered: false,
    progress: { correct: 0, total: 0 },
    learned: {},
  };
}
const record = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
export function validProgress(value) {
  return (
    record(value) &&
    Number.isSafeInteger(value.correct) &&
    Number.isSafeInteger(value.total) &&
    value.correct >= 0 &&
    value.total >= value.correct
  );
}
function normalizeWorkspace(value = {}) {
  const result = createState();
  if (ids.includes(value.vertebra)) result.vertebra = value.vertebra;
  if (["solo", "above", "below", "both"].includes(value.assembly))
    result.assembly = value.assembly;
  if (result.vertebra === "COC" && ["below", "both"].includes(result.assembly))
    result.assembly = "above";
  if (typeof value.dim === "boolean") result.dim = value.dim;
  if (typeof value.soloPart === "boolean") result.soloPart = value.soloPart;
  if (
    Number.isFinite(value.contextOpacity) &&
    value.contextOpacity >= 0 &&
    value.contextOpacity <= 100
  )
    result.contextOpacity = value.contextOpacity;
  if (typeof value.labels === "boolean") result.labels = value.labels;
  if (visibleDefs(result).some((d) => d.id === value.selected))
    result.selected = value.selected;
  return result;
}
function learnedEntries(value, strict) {
  if (!record(value)) {
    if (strict) throw Error("Invalid learned map");
    return {};
  }
  const entries = Object.entries(value);
  if (entries.length > 1000 && strict) throw Error("Too many entries");
  return Object.fromEntries(
    entries
      .filter(([key, learned]) => {
        const [vertebra, part, ...extra] = key.split(":");
        const valid =
          learned === true &&
          !extra.length &&
          ids.includes(vertebra) &&
          part !== "all" &&
          Object.hasOwn(byId, part) &&
          visibleDefs({
            ...createState(),
            vertebra,
            assembly: vertebra === "COC" ? "above" : "both",
          }).some((d) => d.id === part);
        if (!valid && strict) throw Error("Unknown learned structure");
        return valid;
      })
      .slice(0, 1000),
  );
}
export function makeBackup(state) {
  return {
    app: "Anatomy 3D",
    version: "10.9.0-alpha.1",
    schemaVersion: 10,
    exported_at: new Date().toISOString(),
    workspace: {
      vertebra: state.vertebra,
      meshMode: state.meshMode,
      assembly: state.assembly,
      selected: state.selected,
      dim: state.dim,
      contextOpacity: state.contextOpacity,
      soloPart: state.soloPart,
      labels: state.labels,
    },
    learned: state.learned,
    progress: state.progress,
  };
}
export function parseBackup(data) {
  if (
    !record(data) ||
    data.app !== "Anatomy 3D" ||
    !validProgress(data.progress)
  )
    throw Error("Invalid backup");
  if (data.schemaVersion !== undefined && ![9, 10].includes(data.schemaVersion))
    throw Error("Unsupported schema");
  if (data.schemaVersion === undefined && data.version !== "8.0")
    throw Error("Unsupported legacy backup");
  if (!record(data.workspace)) throw Error("Invalid workspace");
  return {
    ...normalizeWorkspace(data.workspace),
    progress: { ...data.progress },
    learned: learnedEntries(data.learned, true),
  };
}
export function loadWorkspace(getStorage, report = () => {}) {
  try {
    const storage = getStorage();
    const current = storage.getItem(WORKSPACE_KEY);
    if (current !== null) {
      try {
        return parseBackup(JSON.parse(current));
      } catch {
        // Keep the original bytes before any later save overwrites the active key.
        storage.setItem(WORKSPACE_KEY + "_recovery_" + Date.now(), current);
        report(
          "შენახული მონაცემები დაზიანებულია. ძველი ასლით აღდგენას ვცდილობთ; დაზიანებული ასლი შენარჩუნებულია.",
        );
      }
    }
    const previous = storage.getItem(PREVIOUS_KEY);
    if (previous !== null) {
      try {
        return parseBackup(JSON.parse(previous));
      } catch {
        report(
          "v9-ის პროგრესის წაკითხვა ვერ მოხერხდა; მისი ორიგინალი შენარჩუნებულია.",
        );
      }
    }
    const state = createState();
    try {
      const old = JSON.parse(storage.getItem(LEGACY_KEY) || "null");
      if (record(old)) {
        Object.assign(state, normalizeWorkspace(old));
        state.learned = learnedEntries(old.learned, false);
        if (validProgress(old.progress)) state.progress = { ...old.progress };
        else {
          const score = JSON.parse(storage.getItem(SCORE_KEY) || "null");
          if (validProgress(score)) state.progress = { ...score };
        }
        return state;
      }
    } catch {
      report(
        "ძველი სამუშაო მდგომარეობა ვერ აღდგა. სარეზერვო ასლის იმპორტი შესაძლებელია.",
      );
    }
    try {
      const old = JSON.parse(storage.getItem(SCORE_KEY) || "null");
      if (validProgress(old)) state.progress = { ...old };
    } catch {}
    return state;
  } catch {
    report(
      "ბრაუზერში შენახვა მიუწვდომელია. პროგრესის შესანარჩუნებლად ჩამოტვირთე სარეზერვო ასლი.",
    );
    return createState();
  }
}
export function saveWorkspace(getStorage, state, report = () => {}) {
  try {
    const storage = getStorage(),
      serialized = JSON.stringify(makeBackup(state));
    storage.setItem(WORKSPACE_KEY, serialized);
    if (storage.getItem(WORKSPACE_KEY) !== serialized)
      throw Error("Save verification failed");
    return true;
  } catch {
    report(
      "პროგრესი ვერ შეინახა. გვერდის დახურვამდე ჩამოტვირთე სარეზერვო ასლი.",
    );
    return false;
  }
}
