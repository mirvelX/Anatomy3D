export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createQuestion(defs, random = Math.random) {
  const available = defs.filter(
    (d) =>
      d.id !== "all" &&
      ![
        "normal-space",
        "typical-space",
        "atlas-space",
        "sacrum-space",
        "ordinary-link",
        "disc-link",
        "canal",
      ].includes(d.kind),
  );
  if (available.length < 2) return null;
  const [target, ...others] = shuffle(available, random);
  return { target, choices: shuffle([target, ...others.slice(0, 3)], random) };
}
export function matchesAnswer(question, id, owner) {
  if (owner !== undefined) {
    const expected = question.id === "ligament" ? "link" : "target";
    if (owner !== expected) return false;
    if (question.id === "arch") return ["pedicle", "lamina"].includes(id);
  }
  return question.id === id;
}
export function answerQuestion(state, id, owner) {
  if (!state.question || state.answered) return null;
  state.answered = true;
  const correct = matchesAnswer(state.question, id, owner);
  state.progress.total++;
  if (correct) state.progress.correct++;
  return correct;
}
