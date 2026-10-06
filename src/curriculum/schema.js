export const sourceCatalog = {
  kacitadze: { title: 'კაციტაძე · ადამიანის ანატომია · I ტომი (2017)', priority: 1, lastPrintedPage: 149, status: 'scan-review-pending' },
  ak: { title: '1 კონსპექტი AK', priority: 2, status: 'text-reviewed', copy: '1.კონსპექტი A.K(2).pdf', identity: 'წაკითხულია ადრე ატვირთული ასლი; ახლად ატვირთულ ფაილთან იდენტურობა ჯერ არ შემოწმებულა.' },
};
export function terms(moduleId, group, page, rows, extra = {}) {
  return rows.trim().split('\n').filter(Boolean).map(line => {
    const [key, ka, latin, description = '', original = ''] = line.split('|');
    return { id: `${moduleId}.${key}`, moduleId, group, ka, latin, description,
      kind: 'structure', quizEligible: true,
      source: { id: 'ak', page, originalLatin: original || latin },
      book: { status: 'comparison-pending' },
      model: { required: true, status: 'asset-needed', asset: null, region: null },
      reviewNotes: original && original !== latin ? [`კონსპექტის ფორმა: ${original}. საჩვენებელი ფორმა ცალკე ნორმალიზებულია; წიგნთან შედარება საჭიროა.`] : [],
      ...extra,
    };
  });
}
export function joint(entry, bones, surfaces, type, elements, movements, notes = []) {
  return { ...entry, kind: 'joint', joint: { bones, surfaces, type, capsule: 'დეტალური მიმაგრება წყაროს მიხედვით შესავსებია.', elements, movements }, reviewNotes: [...entry.reviewNotes, ...notes] };
}
export function moduleRecord(id, version, ka, latin, entries, bookPages, views = []) {
  return { id, version, ka, latin, entries: entries.map(e => ({ ...e, book: { status: bookPages[0] > 149 ? 'pages-unavailable' : 'comparison-pending', printedPages: bookPages } })), views, status: 'draft', modelsComplete: false };
}
export function validateModules(modules) {
  const seen = new Set();
  for (const m of modules) for (const e of m.entries) {
    if (seen.has(e.id)) throw Error(`Duplicate structure: ${e.id}`);
    seen.add(e.id);
    if (!e.ka || !e.latin || !e.source?.page || !e.model?.required) throw Error(`Incomplete structure: ${e.id}`);
    if (e.model.status === 'ready' && (!e.model.asset || !e.model.region || !e.model.license || !e.model.reviewed)) throw Error(`Unapproved mesh: ${e.id}`);
    if (e.book.status === 'verified' && (!e.book.evidence || e.book.printedPages.some(p => p > 149))) throw Error(`Unsupported book verification: ${e.id}`);
  }
  return seen.size;
}
