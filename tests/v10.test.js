import test from "node:test";
import assert from "node:assert/strict";
import { createState } from "../src/storage/workspace.js";
import { ids, byId } from "../src/data/anatomy.js";
import { visibleDefs } from "../src/data/rules.js";
import { sourceFor, levelNote } from "../src/data/sources.js";
import { createScene } from "../src/geometry/scene.js";
import {
  activePart,
  visiblePart,
  opacityFor,
  separationOffset,
} from "../src/rendering/visibility.js";
import { createQuestion } from "../src/quiz/quiz.js";

test("book additions exist only at the appropriate levels and have pickable geometry", () => {
  const expected = {
    carotidTubercle: ["C6"],
    densAnterior: ["C2"],
    densPosterior: ["C2"],
    accessory: ids.filter((id) => id.startsWith("L")),
  };
  for (const [part, levels] of Object.entries(expected)) {
    assert.ok(sourceFor(part));
    for (const vertebra of ids) {
      const state = { ...createState(), vertebra, assembly: "solo" };
      assert.equal(
        visibleDefs(state).some((d) => d.id === part),
        levels.includes(vertebra),
        `${vertebra}:${part}`,
      );
      const scene = createScene(state);
      scene.build();
      assert.equal(
        scene.grouped.has("target|" + part),
        levels.includes(vertebra),
      );
    }
  }
  for (const id of ids) assert.ok(levelNote(id).text);
  assert.match(sourceFor("carotidTubercle").url, /#page=33$/);
});

test("space selection stays visible in isolation and cannot be detached", () => {
  const state = {
    ...createState(),
    selected: "foramen",
    soloPart: true,
    partSeparation: 100,
  };
  const guide = { owner: "target", part: "foramen" };
  assert.ok(activePart(state, guide));
  assert.ok(visiblePart(state, guide));
  assert.equal(visiblePart(state, { owner: "target", part: "body" }), false);
  assert.equal(visiblePart(state, { owner: "above", part: "foramen" }), false);
  assert.deepEqual(separationOffset(state, guide), [0, 0, 0]);
});

test("arch transforms as one group, neighbors do not move; quiz has no study hints", () => {
  const state = {
    ...createState(),
    selected: "arch",
    soloPart: true,
    partSeparation: 100,
    contextOpacity: 25,
  };
  const foot = { owner: "target", part: "pedicle" };
  const plate = { owner: "target", part: "lamina" };
  const neighbor = { owner: "above", part: "pedicle" };
  assert.deepEqual(
    separationOffset(state, foot),
    separationOffset(state, plate),
  );
  assert.equal(separationOffset(state, foot)[1], 0.85);
  assert.deepEqual(separationOffset(state, neighbor), [0, 0, 0]);
  assert.equal(opacityFor(state, foot), 1);
  assert.equal(opacityFor(state, neighbor), 0.25);
  state.mode = "quiz";
  assert.equal(activePart(state, foot), false);
  assert.equal(visiblePart(state, neighbor), true);
  assert.equal(opacityFor(state, neighbor), 1);
  assert.deepEqual(separationOffset(state, foot), [0, 0, 0]);
  state.answered = true;
  assert.ok(activePart(state, foot));
});

test("practice targets can exclude learned/seen structures while retaining distractors", () => {
  const defs = visibleDefs({ ...createState(), vertebra: "C6" });
  const q = createQuestion(defs, () => 0.3, ["carotidTubercle"]);
  assert.equal(q.target, byId.carotidTubercle);
  assert.equal(q.choices.length, 4);
  assert.equal(createQuestion(defs, Math.random, []), null);
  assert.equal(createQuestion(defs, Math.random, ["sacBase"]), null);
});
