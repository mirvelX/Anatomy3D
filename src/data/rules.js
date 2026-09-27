import { above, below, jointType, defs } from "./anatomy.js";
const isOrdinary = (a, b) => jointType(a, b) === "ordinary";
function connected(state) {
  const a = above(state.vertebra),
    b = below(state.vertebra),
    out = [];
  if ((state.assembly === "above" || state.assembly === "both") && a)
    out.push([a, state.vertebra]);
  if ((state.assembly === "below" || state.assembly === "both") && b)
    out.push([state.vertebra, b]);
  return out;
}
function visibleDefs(state) {
  let id = state.vertebra,
    con = connected(state),
    atlas = id === "C1",
    axis = id === "C2",
    sac = id === "SAC",
    coc = id === "COC",
    ordinary = con.some(([a, b]) => isOrdinary(a, b));
  return defs.filter((d) => {
    switch (d.kind) {
      case "any":
        return true;
      case "typical":
      case "normal-space":
      case "typical-space":
      case "canal":
        return !atlas && !sac && !coc;
      case "ordinary-link":
        return ordinary;
      case "disc-link":
        return con.some(
          ([a, b]) => isOrdinary(a, b) || jointType(a, b) === "sacrococcygeal",
        );
      case "cervical":
        return id.startsWith("C") && !atlas;
      case "thoracic-typical":
        return id.startsWith("T") && +id.slice(1) <= 9;
      case "thoracic-last":
        return id === "T11" || id === "T12";
      case "thoracic-trans":
        return id.startsWith("T") && +id.slice(1) <= 10;
      case "lumbar":
        return id.startsWith("L");
      case "atlas":
      case "atlas-space":
        return atlas;
      case "axis":
        return axis;
      case "sacrum":
      case "sacrum-space":
        return sac;
      case "coccyx":
        return coc;
      case "axial-link":
        return con.some(([a, b]) => jointType(a, b) === "atlantoaxial");
      default:
        return false;
    }
  });
}

export { connected, visibleDefs };
