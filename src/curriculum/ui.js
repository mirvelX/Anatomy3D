import { modules, entries, byId, coverage } from './index.js';
import { sourceCatalog } from './schema.js';
import { load, save, normalize, question, answer } from './progress.js';

export function initCurriculum({ getLevel = () => 'L3' } = {}) {
  const dialog = document.createElement('dialog');
  dialog.id = 'curriculum';
  dialog.setAttribute('aria-labelledby', 'curriculumTitle');
  dialog.innerHTML = `
    <header class="curriculum-head"><div><p class="curriculum-eyebrow">ANATOMY 3D · ახალი თემები · სამუშაო ვერსია</p><h2 id="curriculumTitle">ანატომიის სასწავლო სივრცე</h2></div><button data-close aria-label="სასწავლო სივრცის დახურვა">მალების ატლასზე დაბრუნება ×</button></header>
    <p class="curriculum-notice">მასალა დამუშავებულია კონსპექტის ხელმისაწვდომი ასლით. კაციტაძესთან შედარება დაუსრულებელია. ახალი 3D მოდელები ჯერ არ არის დამატებული.</p>
    <p data-storage role="status" class="curriculum-storage"></p>
    <div class="curriculum-shell"><aside class="curriculum-nav"><nav aria-label="სასწავლო თემები" data-modules></nav><div class="curriculum-total" data-total></div><button data-export>პროგრესის შენახვა (.json)</button><label>პროგრესის აღდგენა<input data-import type="file" accept=".json,application/json"></label></aside>
    <main class="curriculum-main"><div class="curriculum-module-head"><div><p data-version class="curriculum-eyebrow"></p><h3 data-title></h3><p data-latin></p></div><span data-progress></span></div>
    <progress data-bar max="1" value="0" aria-label="მოდულის სასწავლო პროგრესი"></progress>
    <p data-context class="curriculum-context"></p>
    <div class="curriculum-tools"><label>მოძებნე ქართულად ან ლათინურად<input data-search type="search" placeholder="მაგ. Capsula articularis"></label><label>ჯგუფი<select data-group><option value="">ყველა ჯგუფი</option></select></label><button data-mode aria-pressed="false">გამოცდა</button><button data-row hidden>მაჯის რიგების სწავლა</button><button data-compare>ორი სტრუქტურის შედარება</button></div>
    <section data-comparison hidden><h4>სტრუქტურების შედარება</h4><label>მეორე სტრუქტურა<select data-compare-select></select></label><div data-compare-result></div></section>
    <section data-quiz hidden class="curriculum-quiz" aria-label="გამოცდა"><p>ქართული → ლათინური · სამუშაო მასალა</p><h4 data-question></h4><div data-choices class="curriculum-choices"></div><p data-feedback role="status"></p><button data-next>შემდეგი კითხვა →</button><p data-score></p></section>
    <div data-study class="curriculum-study"><section data-list class="curriculum-list" aria-label="სტრუქტურები"></section><article data-detail class="curriculum-detail"></article></div>
    </main></div>`;
  document.body.append(dialog);
  const $ = name => dialog.querySelector(`[data-${name}]`);
  const report = text => { $('storage').textContent = text; };
  let storage;
  try { storage = window.localStorage; } catch { storage = { getItem() { throw Error(); }, setItem() { throw Error(); } }; }
  const ids = entries.map(e => e.id);
  let progress = load(storage, ids, report), selectedModule = modules[0], selected = selectedModule.entries[0], q = null, quiz = false, rowMode = false, context = '';
  function persist() { save(storage, progress, report); }
  function element(tag, text, cls) { const el = document.createElement(tag); el.textContent = text; if (cls) el.className = cls; return el; }
  function field(parent, label, text) { parent.append(element('h5', label), element('p', text || 'წყაროს მიხედვით შესავსებია.')); }
  function filtered() { const needle = $('search').value.trim().toLocaleLowerCase(); return selectedModule.entries.filter(e => (!$('group').value || e.group === $('group').value) && `${e.ka} ${e.latin} ${e.source.originalLatin}`.toLocaleLowerCase().includes(needle)); }
  function renderProgress() {
    const done = selectedModule.entries.filter(e => progress.learned[e.id]).length;
    $('progress').textContent = `${done} / ${selectedModule.entries.length} ნასწავლია`;
    $('bar').max = selectedModule.entries.length; $('bar').value = done;
    const c = coverage();
    $('total').textContent = `${modules.length} მოდული · ${c.total} ჩანაწერი\n3D მოდელით: ${c.ready}/${c.total}\nწიგნით გადამოწმებული: ${c.reviewed}/${c.total}`;
    $('score').textContent = `სწორი: ${progress.score.correct} / ${progress.score.total}`;
  }
  function renderList() {
    const list = $('list'); list.replaceChildren();
    for (const entry of filtered()) {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.entry = entry.id;
      b.setAttribute('aria-pressed', String(entry.id === selected.id));
      b.append(element('b', entry.latin), element('span', entry.ka), element('small', `${entry.group}${progress.learned[entry.id] ? ' · ✓ ნასწავლია' : ''}`));
      b.onclick = () => { selected = entry; renderList(); renderDetail(); renderComparison(); };
      list.append(b);
    }
    if (!list.children.length) list.append(element('p', 'შესაბამისი სტრუქტურა ვერ მოიძებნა.'));
  }
  function renderDetail() {
    const pane = $('detail'); pane.replaceChildren();
    pane.append(element('p', selected.group, 'curriculum-eyebrow'), element('h4', selected.latin), element('p', selected.ka, 'curriculum-georgian'), element('p', selected.description));
    const model = element('section', '', 'curriculum-model');
    model.append(element('strong', '3D მოდელი მოსამზადებელია'), element('p', 'ამ სტრუქტურისთვის საჭიროა ხარისხიანი, ლიცენზირებული mesh და შემოწმებული მონიშვნის უბანი.'));
    const controls = element('div', '');
    for (const name of ['მონიშვნა', 'იზოლირება']) { const b = element('button', name); b.disabled = true; b.title = 'ხელმისაწვდომი იქნება დამოწმებული მოდელის დამატების შემდეგ'; controls.append(b); }
    model.append(controls); pane.append(model);
    if (selectedModule.views.length) field(pane, 'მოდელისთვის საჭირო ხედები', selectedModule.views.join(' · '));
    if (selected.joint) {
      for (const [key, label] of Object.entries({ bones: 'მონაწილე ძვლები', surfaces: 'სასახსრე ზედაპირები', type: 'სახსრის ტიპი', capsule: 'სასახსრე ჩანთა', elements: 'იოგები და დამატებითი ელემენტები', movements: 'მოძრაობები' })) field(pane, label, selected.joint[key]);
    }
    if (selected.boundaries) field(pane, 'საზღვრები', selected.boundaries);
    const learned = element('button', progress.learned[selected.id] ? '✓ ნასწავლია — გაუქმება' : '✓ ვისწავლე', 'curriculum-learn');
    learned.dataset.learn = ''; learned.setAttribute('aria-pressed', String(!!progress.learned[selected.id]));
    learned.onclick = () => { if (progress.learned[selected.id]) delete progress.learned[selected.id]; else progress.learned[selected.id] = true; persist(); renderDetail(); renderList(); renderProgress(); }; pane.append(learned);
    const sources = element('section', '', 'curriculum-source');
    field(sources, 'წყარო', `${sourceCatalog.ak.title} · გვ. ${selected.source.page}`);
    field(sources, 'წყაროში მოცემული ლათინური ფორმა', selected.source.originalLatin);
    field(sources, 'კაციტაძესთან შედარება', selected.book.status === 'pages-unavailable' ? 'შესაბამისი სპეციფიკური ართროლოგიის გვერდები ატვირთულ წიგნში არ არის. შემდგომი PDF-ის დამატებისას გადასამოწმებელია.' : `დაუსრულებელია. საძიებო დიაპაზონი: დაბეჭდილი გვ. ${selected.book.printedPages.join('–')}; ეს კონკრეტული ჩანაწერის დამოწმება არ არის.`);
    if (selected.reviewNotes.length) field(sources, 'განსხვავება / გადამოწმების შენიშვნა', selected.reviewNotes.join('\n'));
    field(sources, 'გამოყენებული ასლი', `${sourceCatalog.ak.copy}. ${sourceCatalog.ak.identity}`);
    pane.append(sources);
  }
  function renderComparison() {
    if ($('comparison').hidden) return;
    const other = byId[$('compare-select').value];
    const host = $('compare-result'); host.replaceChildren(); if (!other) return;
    const table = document.createElement('table');
    for (const row of [['სტრუქტურა', selected.latin, other.latin], ['ქართული', selected.ka, other.ka], ['ჯგუფი', selected.group, other.group], ['აღწერა', selected.description, other.description], ['წყარო', `AK · ${selected.source.page}`, `AK · ${other.source.page}`], ['3D', 'მოსამზადებელია', 'მოსამზადებელია']]) { const tr = document.createElement('tr'); row.forEach((text, i) => tr.append(element(i ? 'td' : 'th', text))); table.append(tr); }
    host.append(table);
  }
  function nextQuestion() {
    const pool = rowMode ? selectedModule.entries.filter(e => e.carpalRow) : filtered();
    q = question(pool, q?.target.id);
    $('choices').replaceChildren(); $('feedback').textContent = ''; $('next').disabled = !q;
    $('question').textContent = q ? (rowMode ? `რომელ რიგშია ${q.target.latin}?` : q.target.ka) : 'გამოცდისთვის საჭიროა სულ მცირე ორი ჩანაწერი. გააფართოვე ძიება.';
    if (!q) return;
    if (rowMode) {
      for (const row of ['proximal', 'distal']) {
        const b = element('button', row === 'proximal' ? 'პროქსიმალური რიგი' : 'დისტალური რიგი');
        b.onclick = () => { if (q.answered) return; q.answered = true; const correct = q.target.carpalRow === row; progress.score.total++; if (correct) progress.score.correct++; finishAnswer(correct, q.target.carpalRow === 'proximal' ? 'პროქსიმალური რიგი' : 'დისტალური რიგი'); }; $('choices').append(b);
      }
    } else for (const choice of q.choices) {
      const b = element('button', choice.latin); b.dataset.choice = choice.id;
      b.onclick = () => { const result = answer(q, choice.id, progress); if (result !== null) finishAnswer(result, q.target.latin); }; $('choices').append(b);
    }
  }
  function finishAnswer(correct, expected) { $('feedback').textContent = `${correct ? 'სწორია' : 'სწორი პასუხია'}: ${expected}`; for (const b of $('choices').children) b.disabled = true; persist(); renderProgress(); }
  function setQuiz(value) { quiz = value; $('quiz').hidden = !quiz; $('study').hidden = quiz; $('mode').textContent = quiz ? 'სწავლაზე დაბრუნება' : 'გამოცდა'; $('mode').setAttribute('aria-pressed', String(quiz)); if (quiz) nextQuestion(); }
  function selectModule(module) {
    selectedModule = module; selected = module.entries[0]; rowMode = false;
    $('title').textContent = module.ka; $('latin').textContent = module.latin; $('version').textContent = `v${module.version} · სამუშაო მასალა`;
    $('search').value = ''; $('group').replaceChildren(new Option('ყველა ჯგუფი', ''));
    for (const group of new Set(module.entries.map(e => e.group))) $('group').append(new Option(group, group));
    $('row').hidden = module.id !== 'hand'; $('context').textContent = context;
    $('compare-select').replaceChildren(...module.entries.map(e => new Option(`${e.latin} · ${e.ka}`, e.id)));
    $('comparison').hidden = true;
    for (const b of $('modules').children) b.setAttribute('aria-current', b.dataset.module === module.id ? 'page' : 'false');
    setQuiz(false); renderList(); renderDetail(); renderProgress();
  }
  for (const module of modules) { const b = element('button', `${module.ka}\nv${module.version}`); b.dataset.module = module.id; b.onclick = () => { context = ''; selectModule(module); }; $('modules').append(b); }
  $('search').oninput = $('group').onchange = () => { renderList(); if (quiz) nextQuestion(); };
  $('mode').onclick = () => { rowMode = false; setQuiz(!quiz); };
  $('row').onclick = () => { rowMode = true; setQuiz(true); };
  $('compare').onclick = () => { $('comparison').hidden = !$('comparison').hidden; renderComparison(); };
  $('compare-select').onchange = renderComparison;
  $('next').onclick = nextQuestion;
  $('close').onclick = () => dialog.close();
  $('export').onclick = () => { const a = document.createElement('a'); const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' })); a.href = url; a.download = 'anatomy3d-curriculum-progress.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  $('import').onchange = async () => { try { const file = $('import').files[0]; if (!file || file.size > 1000000) throw Error(); const value = JSON.parse(await file.text()); if (value.version !== 1 || !value.learned || !value.score) throw Error(); const incoming = normalize(value, ids); progress = { ...progress, learned: { ...progress.learned, ...incoming.learned }, score: { correct: Math.max(progress.score.correct, incoming.score.correct), total: Math.max(progress.score.total, incoming.score.total) } }; persist(); renderProgress(); renderList(); renderDetail(); report('პროგრესი დამატებულია; არსებული ნასწავლი ჩანაწერები შენარჩუნდა.'); } catch { report('ფაილი ვერ აღდგა. არსებული პროგრესი შენარჩუნდა.'); } $('import').value = ''; };
  const launch = element('button', 'ახალი თემები · ძვლები და შეერთებები', 'curriculum-launch'); launch.id = 'openCurriculum';
  launch.onclick = () => { context = ''; selectModule(selectedModule); dialog.showModal(); };
  document.querySelector('.topline')?.prepend(launch);
  const connections = element('button', 'Connections · შეერთებების სწავლა'); connections.id = 'openConnections';
  connections.onclick = () => { const module = modules.find(m => m.id === 'vertebral'); if (!module) return; const level = getLevel(); context = `${level} · ${['C1', 'C2'].includes(level) ? 'ატლას–აქსისის შუა/გვერდითი სახსრები და იოგები. C1–C2-ს შორის დისკო არ არის.' : level === 'SAC' || level === 'COC' ? 'გავა–კუდუსუნის კავშირი' : 'ზედა/ქვედა მეზობლებთან დისკოები, სასახსრე მორჩები და იოგები.'} · სტრუქტურების 3D მონიშვნა ჯერ მოსამზადებელია.`; selectModule(module); dialog.showModal(); };
  document.querySelector('#neighbors')?.after(connections);
  selectModule(selectedModule);
}
