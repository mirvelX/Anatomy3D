export const guideParts = new Set([
  "foramen",
  "canal",
  "incSup",
  "incInf",
  "atlasForamen",
  "transForamen",
  "atlasTransForamen",
  "sacForamina",
  "sacCanal",
  "interforamen",
]);
const linkParts = new Set(["disc", "facetLink", "interforamen", "ligament"]);
export const hasSelection = (state) =>
  state.selected !== "all" && (state.mode !== "quiz" || state.answered);
export function activePart(state, mesh) {
  if (!hasSelection(state)) return false;
  if (linkParts.has(state.selected))
    return mesh.owner === "link" && mesh.part === state.selected;
  if (mesh.owner !== "target") return false;
  return state.selected === "arch"
    ? ["pedicle", "lamina"].includes(mesh.part)
    : mesh.part === state.selected;
}
export function visiblePart(state, mesh) {
  // Empty-space guides are an overlay for the selected concept, never quiz hints.
  if (guideParts.has(mesh.part)) return activePart(state, mesh);
  if (state.soloPart && hasSelection(state)) return activePart(state, mesh);
  return true;
}
export function opacityFor(state, mesh) {
  return state.dim && hasSelection(state) && !activePart(state, mesh)
    ? state.contextOpacity / 100
    : 1;
}
export function separationOffset(state, mesh) {
  // A teaching displacement, not anatomical movement. Spaces cannot be detached.
  if (
    state.mode !== "study" ||
    !activePart(state, mesh) ||
    guideParts.has(mesh.part)
  )
    return [0, 0, 0];
  return [0, (state.partSeparation / 100) * 0.85, 0];
}
