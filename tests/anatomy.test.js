import test from "node:test";
import assert from "node:assert/strict";
import { ids, above, below, jointType, byId } from "../src/data/anatomy.js";
import { connected, visibleDefs } from "../src/data/rules.js";
import { createState } from "../src/storage/workspace.js";
import { createScene } from "../src/geometry/scene.js";
import {
  createQuestion,
  matchesAnswer,
  answerQuestion,
  shuffle,
} from "../src/quiz/quiz.js";
test("neighbor boundaries and special connections", () => {
  assert.equal(ids.length, 26);
  assert.equal(above("C1"), "OCC");
  assert.equal(below("COC"), null);
  assert.equal(below("L5"), "SAC");
  assert.equal(jointType("OCC", "C1"), "occipital");
  assert.equal(jointType("C1", "C2"), "atlantoaxial");
  assert.equal(jointType("SAC", "COC"), "sacrococcygeal");
});
test("all 104 vertebra and assembly scenes have finite geometry and valid question choices", () => {
  for (const vertebra of ids)
    for (const assembly of ["solo", "above", "below", "both"]) {
      const state = { ...createState(), vertebra, assembly };
      const scene = createScene(state);
      scene.build();
      assert.equal(scene.poses.length, connected(state).length + 1);
      assert.ok(scene.grouped.size > 0);
      for (const [key, triangles] of scene.grouped) {
        assert.ok(triangles.length > 0, key);
        for (const triangle of triangles)
          for (const point of triangle)
            for (const coordinate of point)
              assert.ok(Number.isFinite(coordinate), key);
      }
      const question = createQuestion(visibleDefs(state), () => 0.25);
      assert.ok(question);
      assert.ok(question.choices.includes(question.target));
      assert.equal(
        new Set(question.choices.map((d) => d.id)).size,
        question.choices.length,
      );
    }
});
test("arch recognizes components on target; neighbors and incorrect links do not pass", () => {
  assert.equal(matchesAnswer(byId.arch, "pedicle", "target"), true);
  assert.equal(matchesAnswer(byId.arch, "lamina", "target"), true);
  assert.equal(matchesAnswer(byId.arch, "pedicle", "above"), false);
  assert.equal(matchesAnswer(byId.body, "body", "below"), false);
  assert.equal(matchesAnswer(byId.ligament, "ligament", "link"), true);
  assert.equal(matchesAnswer(byId.ligament, "ligament", "target"), false);
});
test("an answer is scored once, with correct and incorrect totals", () => {
  const state = createState();
  state.question = byId.arch;
  assert.equal(answerQuestion(state, "lamina", "target"), true);
  assert.equal(answerQuestion(state, "body"), null);
  assert.deepEqual(state.progress, { correct: 1, total: 1 });
  state.answered = false;
  state.question = byId.body;
  assert.equal(answerQuestion(state, "dens"), false);
  assert.deepEqual(state.progress, { correct: 1, total: 2 });
});
test("shuffle preserves input and all choices", () => {
  const input = [1, 2, 3, 4];
  assert.deepEqual(
    shuffle(input, () => 0),
    [2, 3, 4, 1],
  );
  assert.deepEqual(input, [1, 2, 3, 4]);
});
