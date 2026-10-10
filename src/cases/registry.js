/* Simulated cases, found automatically. Each case lives in its own folder
   with an index.jsx (the case, loaded on demand so the hospital stays
   light) and a meta.js that says which unit and bed it belongs to:

     export default { key: 'cv-valve:6', header: 'Rheumatic Mitral Stenosis — …' };

   Adding a case never touches this file. */
const metas = import.meta.glob('./*/meta.js', { eager: true, import: 'default' });
const loaders = import.meta.glob('./*/index.jsx');

export const CASES = {};
export const CASE_HEADERS = {};
for (const [path, meta] of Object.entries(metas)) {
  const dir = path.slice(0, path.lastIndexOf('/'));
  const load = loaders[`${dir}/index.jsx`];
  if (!meta?.key || !load) continue;
  CASES[meta.key] = load;
  if (meta.header) CASE_HEADERS[meta.key] = meta.header;
}

export const caseKey = (floorId, bedNumber) => `${floorId}:${bedNumber}`;
export const hasCase = (floorId, bedNumber) => !!CASES[caseKey(floorId, bedNumber)];
