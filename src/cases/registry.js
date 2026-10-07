/* Simulated cases that have been written, by department and bed.
   Each loads on demand, so the hospital itself stays light. */
export const CASES = {
  'cv-cath:1': () => import('./cath01/index.jsx'),
  'cv-cath:2': () => import('./cath02/index.jsx'),
  'cv-valve:1': () => import('./valve01/index.jsx'),
  'cv-valve:2': () => import('./valve02/index.jsx'),
};
export const caseKey = (floorId, bedNumber) => `${floorId}:${bedNumber}`;
export const hasCase = (floorId, bedNumber) => !!CASES[caseKey(floorId, bedNumber)];
