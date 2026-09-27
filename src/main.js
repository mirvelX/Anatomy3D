import {
  ids,
  name,
  latinName,
  above,
  below,
  jointType,
  byId,
} from "./data/anatomy.js";
import {
  connected as getConnections,
  visibleDefs as getVisibleDefs,
} from "./data/rules.js";
import {
  createState,
  loadWorkspace,
  saveWorkspace as persist,
  makeBackup,
  parseBackup,
  WORKSPACE_KEY,
} from "./storage/workspace.js";
import { createQuestion, answerQuestion } from "./quiz/quiz.js";
import { createScene } from "./geometry/scene.js";
import { createRenderer } from "./rendering/renderer.js";
import { registerPwa } from "./pwa/register.js";
const $ = (id) => document.getElementById(id);
function storageStatus(message) {
  $("storageStatus").textContent = message;
  $("storageStatus").classList.toggle("hidden", !message);
}
const state = loadWorkspace(() => window.localStorage, storageStatus);
function saveWorkspace() {
  return persist(() => window.localStorage, state, storageStatus);
}
const connected = () => getConnections(state),
  visibleDefs = () => getVisibleDefs(state);
const scene = createScene(state),
  renderer = createRenderer(state, scene);
const { draw, pick, setView } = renderer;
function build() {
  scene.build();
  renderer.compileMeshes();
  draw();
}
function populateSelector() {
  const groups = [
    ["კისრის მალები · C1–C7", ids.filter((x) => /^C[1-7]$/.test(x))],
    ["გულმკერდის მალები · T1–T12", ids.filter((x) => x.startsWith("T"))],
    ["წელის მალები · L1–L5", ids.filter((x) => x.startsWith("L"))],
    ["შეზრდილი მალები", ["SAC", "COC"]],
  ];
  for (const [heading, values] of groups) {
    const opt = document.createElement("optgroup");
    opt.label = heading;
    for (const value of values) {
      const el = document.createElement("option");
      el.value = value;
      el.textContent = name(value) + " — " + latinName(value);
      opt.appendChild(el);
    }
    $("vertebra").appendChild(opt);
  }
  $("vertebra").value = state.vertebra;
}
function displayNeighbors() {
  const links = connected();
  $("neighbors").textContent = links.length
    ? links.map(([a, b]) => name(a) + " ↔ " + name(b)).join("   ·   ")
    : name(state.vertebra) + " (ცალკე)";
  $("modelLabel").textContent = $("neighbors").textContent;
  $("explode").disabled = links.length === 0;
  $("rotate").disabled = !links.some(
    ([a, b]) => jointType(a, b) === "atlantoaxial",
  );
  $("pageTitle").textContent = links.length
    ? name(state.vertebra) + " · მეზობელი მალები"
    : name(state.vertebra);
  $("subtitle").textContent =
    latinName(state.vertebra) + " · აირჩიე ნაწილი ან დააწკაპუნე 3D მოდელში.";
}
function renderPartList() {
  const matches = visibleDefs().filter((d) =>
    (d.latin + " " + d.ka)
      .toLocaleLowerCase()
      .includes($("search").value.toLocaleLowerCase()),
  );
  $("parts").replaceChildren();
  for (const d of matches) {
    const btn = document.createElement("button");
    btn.className = "part-btn" + (state.selected === d.id ? " active" : "");
    btn.innerHTML =
      '<span><b></b><small></small></span><span class="dot"></span>';
    btn.querySelector("b").textContent = d.latin;
    btn.querySelector("small").textContent = d.ka;
    btn.type = "button";
    btn.onclick = () => selectPart(d.id);
    $("parts").appendChild(btn);
  }
  $("partCount").textContent = visibleDefs().length + " ნაწილი";
}
function renderDetails() {
  const d = byId[state.selected] || byId.all;
  $("detailLatin").textContent = d.latin;
  $("detailKa").textContent = d.ka;
  $("detailText").textContent = d.info;
  $("detailKind").textContent =
    [
      "normal-space",
      "typical-space",
      "atlas-space",
      "sacrum-space",
      "ordinary-link",
    ].includes(d.kind) && d.id !== "facetLink"
      ? "ხვრელი / სივრცე / შეერთება"
      : "ანატომიური სტრუქტურა";
  $("detailTitle").textContent = "არჩეული სტრუქტურა";
  const learned = !!state.learned[state.vertebra + ":" + state.selected];
  $("learnedBtn").disabled = state.selected === "all";
  $("learnedBtn").textContent = learned
    ? "✓ ნასწავლია — გაუქმება"
    : "✓ ვისწავლე";
  $("learnedBtn").setAttribute("aria-pressed", String(learned));
  $("learnedBtn").classList.toggle("learned", learned);
}
function explainConnection(a, b) {
  switch (jointType(a, b)) {
    case "occipital":
      return "კეფის ძვლის როკები ატლასის ზედა სასახსრე ზედაპირებს უკავშირდება. მალთაშუა დისკო არ არის.";
    case "atlantoaxial":
      return "C1–C2: შუა სახსარში აქსისის კბილისებრი მორჩი ატლასის წინა რკალს უერთდება; ასევე არსებობს ორი გვერდითი სახსარი. ჩვეულებრივი დისკო არ არის.";
    case "sacrococcygeal":
      return "გავის მწვერვალსა და კუდუსუნის ფუძეს შორის კავშირი ხშირად ბოჭკოვან-ხრტილოვანია; შეზრდა შეიძლება განსხვავდებოდეს.";
    default:
      return "მალების სხეულებს შორის მდებარეობს მალთაშუა დისკო; უკანაა წყვილი რკალთაშუა სასახსრე შეერთება. მალთაშუა ხვრელი მომიჯნავე ნაჭდევებს შორის ყალიბდება.";
  }
}
function renderConnection() {
  const con = connected(),
    el = $("linkInformation");
  el.replaceChildren();
  if (!con.length) {
    const p = document.createElement("p");
    p.textContent =
      "ჩართე ზედა ან ქვედა მეზობელი, რათა შეერთების აღწერა გამოჩნდეს.";
    el.appendChild(p);
  }
  for (const [a, b] of con) {
    const box = document.createElement("div");
    box.className = "connection";
    const title = document.createElement("strong");
    title.textContent = name(a) + " + " + name(b);
    const p = document.createElement("p");
    p.textContent = explainConnection(a, b);
    box.append(title, p);
    el.appendChild(box);
  }
}
function renderProgress() {
  const n = Object.values(state.learned).filter(Boolean).length;
  $("progressText").textContent =
    `ნასწავლი სტრუქტურები: ${n} · სწორი პასუხები: ${state.progress.correct} / ${state.progress.total}. მონაცემები ინახება მხოლოდ ამ მოწყობილობის ბრაუზერში.`;
  $("score").textContent =
    `სწორი: ${state.progress.correct} / ${state.progress.total}`;
}
function updatePanel(persistState = true) {
  displayNeighbors();
  renderPartList();
  renderDetails();
  renderConnection();
  renderProgress();
  for (const b of document.querySelectorAll("[data-assembly]")) {
    b.classList.toggle("active", b.dataset.assembly === state.assembly);
    b.disabled =
      (b.dataset.assembly === "above" && !above(state.vertebra)) ||
      (["below", "both"].includes(b.dataset.assembly) &&
        !below(state.vertebra));
  }
  $("explodeVal").textContent = state.explode + "%";
  $("rotateVal").textContent = state.rotation + "°";
  $("zoomVal").textContent = Math.round(state.zoom * 100) + "%";
  $("isolate").checked = state.dim;
  $("labels").checked = state.labels;
  $("zoom").value = state.zoom * 100;
  $("tabStudy").classList.toggle("active", state.mode === "study");
  $("tabQuiz").classList.toggle("active", state.mode === "quiz");
  $("studyList").classList.toggle("hidden", state.mode === "quiz");
  $("studyControls").classList.toggle("hidden", state.mode === "quiz");
  $("quizPanel").classList.toggle("hidden", state.mode !== "quiz");
  if (persistState) saveWorkspace();
}
function selectPart(id) {
  if (!byId[id]) return;
  if (state.mode === "quiz" && state.question) {
    grade(id);
    return;
  }
  state.selected = id;
  renderPartList();
  renderDetails();
  draw();
  if (state.labels && id !== "all") {
    const d = byId[id];
    tooltip(d.latin + " — " + d.ka);
  }
  saveWorkspace();
}
function tooltip(msg) {
  if (!state.labels || !msg) {
    $("tooltip").classList.add("hidden");
    return;
  }
  $("tooltip").textContent = msg;
  $("tooltip").classList.remove("hidden");
}
function changeVertebra(id) {
  state.vertebra = id;
  state.selected = "all";
  state.rotation = 0;
  state.explode = 0;
  $("explode").value = 0;
  $("rotate").value = 0;
  $("search").value = "";
  if (id === "COC" && ["below", "both"].includes(state.assembly))
    state.assembly = "above";
  build();
  updatePanel();
  if (state.mode === "quiz") makeQuestion();
  tooltip("");
}
let drag = null;
$("gl").addEventListener("pointerdown", (e) => {
  drag = {
    sx: e.clientX,
    sy: e.clientY,
    x: e.clientX,
    y: e.clientY,
    moved: false,
  };
  $("gl").setPointerCapture(e.pointerId);
});
$("gl").addEventListener("pointermove", (e) => {
  if (!drag) return;
  if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 5)
    drag.moved = true;
  if (drag.moved) {
    renderer.orbit(e.clientX - drag.x, e.clientY - drag.y);
  }
  drag.x = e.clientX;
  drag.y = e.clientY;
});
$("gl").addEventListener("pointerup", (e) => {
  if (drag && !drag.moved) {
    const found = pick(e);
    if (found) {
      if (state.mode === "quiz") {
        if (found.owner === "target" || found.owner === "link")
          grade(found.part, found.owner);
      } else if (found.owner === "target" || found.owner === "link") {
        const p = found.part;
        if (visibleDefs().some((x) => x.id === p)) selectPart(p);
        else if (p === "mass") selectPart("atlasSup");
      } else {
        tooltip(
          name(scene.poses.find((p) => p.owner === found.owner)?.id) +
            " — მეზობელი მალა",
        );
      }
    }
  }
  drag = null;
});
$("gl").addEventListener("pointercancel", () => (drag = null));
$("gl").addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    state.zoom = Math.min(
      1.9,
      Math.max(0.6, state.zoom * (e.deltaY > 0 ? 0.91 : 1.1)),
    );
    updatePanel();
    draw();
  },
  { passive: false },
);
document.addEventListener("keydown", (e) => {
  if (
    e.key.toLowerCase() === "r" &&
    !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)
  )
    setView("reset");
});
$("vertebra").addEventListener("change", (e) => changeVertebra(e.target.value));
for (const b of document.querySelectorAll("[data-assembly]"))
  b.onclick = () => {
    state.assembly = b.dataset.assembly;
    state.selected = "all";
    state.explode = 0;
    $("explode").value = 0;
    build();
    updatePanel();
    if (state.mode === "quiz") makeQuestion();
  };
for (const b of document.querySelectorAll("[data-view]"))
  b.onclick = () => setView(b.dataset.view);
$("search").addEventListener("input", renderPartList);
$("explode").addEventListener("input", (e) => {
  state.explode = +e.target.value;
  updatePanel();
  build();
});
$("rotate").addEventListener("input", (e) => {
  state.rotation = +e.target.value;
  updatePanel();
  draw();
});
$("zoom").addEventListener("input", (e) => {
  state.zoom = +e.target.value / 100;
  updatePanel();
  draw();
});
$("isolate").addEventListener("change", (e) => {
  state.dim = e.target.checked;
  draw();
  saveWorkspace();
});
$("labels").addEventListener("change", (e) => {
  state.labels = e.target.checked;
  if (!state.labels) tooltip("");
  saveWorkspace();
});

function makeQuestion() {
  const question = createQuestion(visibleDefs());
  state.question = question?.target || null;
  state.answered = false;
  state.selected = "all";
  $("quizChoices").replaceChildren();
  if (!question) {
    $("quizQuestion").textContent = "აირჩიე სხვა მალა ტესტისთვის";
    draw();
    return;
  }
  $("quizQuestion").textContent = "მოძებნე: " + question.target.latin;
  for (const d of question.choices) {
    const b = document.createElement("button");
    b.textContent = d.ka;
    b.onclick = () => grade(d.id);
    $("quizChoices").appendChild(b);
  }
  $("quizFeedback").textContent =
    "მოდელზე დააწკაპუნე ან ქვემოთ მოცემულ ვარიანტს უპასუხე.";
  draw();
}
function grade(id, owner) {
  const result = answerQuestion(state, id, owner);
  if (result === null) return;
  saveWorkspace();
  $("quizFeedback").textContent =
    (result ? "✓ სწორია! " : "✗ სწორი პასუხია: " + state.question.ka + ". ") +
    state.question.info;
  renderProgress();
}
$("tabStudy").onclick = () => {
  state.mode = "study";
  state.selected = "all";
  updatePanel();
  draw();
};
$("tabQuiz").onclick = () => {
  state.mode = "quiz";
  updatePanel();
  makeQuestion();
};
$("next").onclick = makeQuestion;
$("reveal").onclick = () => {
  if (!state.question) return;
  $("quizFeedback").textContent =
    state.question.latin +
    " — " +
    state.question.ka +
    ". " +
    state.question.info;
  state.answered = true;
};
$("learnedBtn").onclick = () => {
  if (state.selected === "all") return;
  const k = state.vertebra + ":" + state.selected;
  if (state.learned[k]) delete state.learned[k];
  else state.learned[k] = true;
  renderDetails();
  renderProgress();
  renderPartList();
  saveWorkspace();
};

$("exportProgress").onclick = () => {
  const blob = new Blob([JSON.stringify(makeBackup(state), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "anatomy3d_backup.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$("importProgress").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 2_000_000) throw Error("Too large");
    const restored = parseBackup(JSON.parse(await file.text()));
    if (
      !confirm(
        "აღვადგინოთ შენახული მონაცემები? მიმდინარე პროგრესი ჩანაცვლდება.",
      )
    )
      return;
    Object.assign(state, createState(), restored);
    $("vertebra").value = state.vertebra;
    $("search").value = "";
    $("explode").value = 0;
    $("rotate").value = 0;
    build();
    updatePanel();
  } catch {
    alert(
      "ამ ფაილის წაკითხვა ვერ მოხერხდა. აირჩიე ამ აპიდან შენახული ვალიდური JSON ასლი.",
    );
  } finally {
    e.target.value = "";
  }
});
$("clearProgress").onclick = () => {
  if (confirm("ნამდვილად გინდა სასწავლო პროგრესის განულება?")) {
    state.progress = { correct: 0, total: 0 };
    state.learned = {};
    renderProgress();
    renderDetails();
    saveWorkspace();
  }
};
window.addEventListener("resize", () => draw());
window.addEventListener("storage", (event) => {
  if (event.key !== WORKSPACE_KEY || !event.newValue) return;
  try {
    Object.assign(
      state,
      createState(),
      parseBackup(JSON.parse(event.newValue)),
    );
    $("vertebra").value = state.vertebra;
    $("search").value = "";
    $("explode").value = 0;
    $("rotate").value = 0;
    build();
    updatePanel(false);
  } catch {
    /* Leave the current session intact if another tab writes bad data. */
  }
});
populateSelector();
renderer.init();
build();
updatePanel();
registerPwa(saveWorkspace);
