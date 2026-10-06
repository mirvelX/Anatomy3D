import test from 'node:test';
import assert from 'node:assert/strict';
import { modules, entries } from '../src/curriculum/index.js';
import { validateModules } from '../src/curriculum/schema.js';
import { normalize, load, save, question, answer, KEY } from '../src/curriculum/progress.js';
test('curriculum has unique sourced structures and fails closed for unapproved meshes', () => {
  assert.equal(validateModules(modules), entries.length);
  for (const e of entries) { assert.ok(e.source.page >= 1 && e.source.page <= 19); assert.ok(e.model.required); assert.notEqual(e.book.status, 'verified'); }
  const bad = structuredClone(modules); bad[0].entries[0].model.status = 'ready';
  assert.throws(() => validateModules(bad), /Unapproved mesh/);
});
test('new curriculum storage is separate, validates imports, and reports failure', () => {
  const ids = entries.map(e => e.id), messages = [];
  const storage = new Map(); storage.set('anatomy3d_workspace_v10', 'untouched');
  const api = { getItem:k=>storage.get(k), setItem:(k,v)=>storage.set(k,v) };
  const p = normalize({learned:{[ids[0]]:true, injected:true},score:{total:-1,correct:99}}, ids);
  assert.deepEqual(Object.keys(p.learned),[ids[0]]); assert.equal(p.score.total,0);
  assert.ok(save(api,p)); assert.deepEqual(load(api,ids),p); assert.equal(storage.get('anatomy3d_workspace_v10'),'untouched');
  storage.set(KEY,'broken'); load(api,ids,m=>messages.push(m)); assert.equal(storage.get(KEY),'broken');
  assert.equal(save({setItem(){throw Error();}},p,m=>messages.push(m)),false); assert.equal(messages.length,2);
});
test('quizzes use available module terms, avoid immediate repeats and score only once', () => {
  for (const m of modules) {
    const state = normalize(null,[]), first = question(m.entries), second = question(m.entries,first.target.id);
    assert.notEqual(first.target.id,second.target.id);
    assert.equal(answer(first,'invalid',state),null);
    assert.equal(answer(first,first.target.id,state),true);
    assert.equal(answer(first,first.target.id,state),null);
    assert.deepEqual(state.score,{correct:1,total:1});
  }
  assert.equal(question(entries.slice(0,1)),null);
});
test('hand contains two complete carpal rows and correct individual bone inventory', () => {
  const hand = modules.find(m=>m.id==='hand');
  assert.equal(hand.entries.filter(e=>e.carpalRow==='proximal').length,4);
  assert.equal(hand.entries.filter(e=>e.carpalRow==='distal').length,4);
  assert.equal(hand.entries.filter(e=>e.id.startsWith('hand.metacarpal-')).length,5);
  assert.equal(hand.entries.filter(e=>e.id.startsWith('hand.phalanx-')).length,14);
  assert.ok(!hand.entries.some(e=>e.id==='hand.phalanx-1-media'));
});
test('joint records in upper limb never cite available bone pages as joint evidence', () => {
  for(const e of entries.filter(e=>['shoulder','arm','forearm','hand'].includes(e.moduleId)&&e.kind==='joint')) assert.equal(e.book.status,'pages-unavailable');
});
test('quiz choices have distinct labels even when several bones share landmark names', () => {
  const forearm=modules.find(m=>m.id==='forearm');
  for(let n=0;n<50;n++){const q=question(forearm.entries); assert.equal(new Set(q.choices.map(e=>e.latin)).size,q.choices.length);}
  assert.equal(question([{id:'a',latin:'X'},{id:'b',latin:'X'}]),null);
});
