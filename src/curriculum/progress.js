export const KEY = 'anatomy3d_curriculum_v10_2';
export function normalize(value, ids) {
  const allowed = new Set(ids);
  const learned = Object.fromEntries(Object.entries(value?.learned || {}).filter(([id, v]) => allowed.has(id) && v === true));
  const raw = value?.score;
  const score = raw && Number.isSafeInteger(raw.correct) && Number.isSafeInteger(raw.total) && raw.correct >= 0 && raw.total >= raw.correct ? raw : { correct: 0, total: 0 };
  return { version: 1, learned, score };
}
export function load(storage, ids, report = () => {}) {
  try { const raw = storage.getItem(KEY); return normalize(raw ? JSON.parse(raw) : null, ids); }
  catch { report('პროგრესი ვერ წავიკითხეთ. არსებული ჩანაწერი არ წაშლილა.'); return normalize(null, ids); }
}
export function save(storage, value, report = () => {}) {
  try { storage.setItem(KEY, JSON.stringify(value)); return true; }
  catch { report('პროგრესი მხოლოდ ამ სესიაში ინახება: ბრაუზერში ჩაწერა ვერ მოხერხდა.'); return false; }
}
export function question(pool, previous = '', random = Math.random) {
  const options = pool.filter(e => e.quizEligible !== false);
  if (options.length < 2) return null;
  const eligible = options.filter(e => e.id !== previous);
  const target = eligible[Math.floor(random() * eligible.length)];
  const distractors = options.filter(e => e.id !== target.id && e.latin !== target.latin).sort(() => random() - .5).slice(0, 3);
  return { target, choices: [target, ...distractors].sort(() => random() - .5), answered: false };
}
export function answer(q, id, state) {
  if (!q || q.answered || !q.choices.some(e => e.id === id)) return null;
  q.answered = true;
  const correct = q.target.id === id;
  state.score.total++; if (correct) state.score.correct++;
  return correct;
}
