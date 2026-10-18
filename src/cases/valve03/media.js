/* Media for Case 03. YouTube and Wikimedia were blocked from the build
   environment (proxy 403), so nothing here could be opened and checked.
   The single video ID came from a web-search result pointing at that exact
   watch URL; its channel is not known, so none is named. See REPORT.md. */

export const MEDIA = {
  overview: { id: 'FberAhcfNIY', title: 'Constrictive Pericarditis, Diagnosis and Management' },
};

/* Searches on the recommended channels (handles from valveMedia.js) — no IDs. */
const q = s => encodeURIComponent(s);
const CH = [
  ['CCC Live Cases', 'https://www.youtube.com/@CCCLiveCases'],
  ['Gulf Intervention Society', 'https://www.youtube.com/@gulfinterventionsociety'],
  ['Interventional Cardiology', 'https://www.youtube.com/@interventionalcardiologyis3814'],
];
const searches = (topic, label) => CH.map(([n, u]) => ({ name: `${n} — ${label}`, url: `${u}/search?query=${q(topic)}`, note: `${label} on ${n}` }));

export const CONSTRICTION_SEARCHES = searches('constrictive pericarditis', 'constriction');
export const HEMO_SEARCHES = searches('hemodynamics constriction restriction', 'LV/RV hemodynamics');
export const PORCELAIN_SEARCHES = searches('porcelain aorta TAVI', 'porcelain aorta');
export const LM_SEARCHES = searches('ostial left main PCI IVUS', 'ostial left main');
