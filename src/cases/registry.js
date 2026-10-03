/* Simulated cases that have been written, by department and bed.
   Each loads on demand, so the hospital itself stays light. */
export const CASES = {
  'cv-cath:1': () => import('./cath01/index.jsx'),
};
export const caseKey = (floorId, bedNumber) => `${floorId}:${bedNumber}`;
export const hasCase = (floorId, bedNumber) => !!CASES[caseKey(floorId, bedNumber)];
