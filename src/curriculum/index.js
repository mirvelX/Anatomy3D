import arthrology from './arthrology.js';
import { validateModules } from './schema.js';
export const modules = [arthrology];
validateModules(modules);
export const entries = modules.flatMap(m => m.entries);
export const byId = Object.fromEntries(entries.map(e => [e.id, e]));
export function coverage() { return { total: entries.length, ready: entries.filter(e => e.model.status === 'ready').length, reviewed: entries.filter(e => e.book.status === 'verified').length }; }
