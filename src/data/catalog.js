import CARDIOLOGY from './cardiology.js';
import INTERNAL from './internal.js';
import { CONFERENCE, TESTS } from './centres.js';

/* One catalogue for the whole site. Every item gets a stable id:
   <unit id>-<two-digit number>, e.g. c-hf-02, m-neph-11, conf-guide-04. */

export const HOSPITALS = [CARDIOLOGY, INTERNAL];
export const CENTRES = [CONFERENCE, TESTS];
export const SECTIONS = [...HOSPITALS, ...CENTRES];

const pad = n => String(n).padStart(2, '0');
for (const s of SECTIONS) {
  for (const u of s.units) {
    u.section = s.id;
    u.items = u.cases.map((title, i) => ({ id: `${u.id}-${pad(i + 1)}`, n: i + 1, title, unit: u.id, section: s.id }));
  }
}

export const SECTION_BY_ID = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
export const UNIT_BY_ID = Object.fromEntries(SECTIONS.flatMap(s => s.units.map(u => [u.id, u])));
export const ITEM_BY_ID = Object.fromEntries(SECTIONS.flatMap(s => s.units.flatMap(u => u.items.map(it => [it.id, it]))));

export const COUNTS = {
  units: HOSPITALS.reduce((n, h) => n + h.units.length, 0),
  cases: HOSPITALS.reduce((n, h) => n + h.units.length * 12, 0),
  sessions: CONFERENCE.units.reduce((n, u) => n + u.items.length, 0),
  tests: TESTS.units.reduce((n, u) => n + u.items.length, 0),
};

/** Words used for an item in each kind of section. */
export const itemWord = sectionId => (sectionId === 'conference' ? 'Session' : sectionId === 'tests' ? 'Test' : 'Case');
