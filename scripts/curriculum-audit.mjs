import { modules, entries, coverage } from '../src/curriculum/index.js';
const audit = { status:'draft', ...coverage(), modules:modules.map(m=>({id:m.id,stage:m.version,entries:m.entries.length,missingModels:m.entries.filter(e=>e.model.status!=='ready').map(e=>e.id),bookReviewPending:m.entries.filter(e=>e.book.status!=='verified').map(e=>e.id)})) };
console.log(JSON.stringify(audit,null,2));
if (process.argv.includes('--release') && entries.some(e=>e.model.status!=='ready'||e.book.status!=='verified')) {
  console.error('Release blocked: model coverage and source review are incomplete.');
  process.exitCode=1;
}
