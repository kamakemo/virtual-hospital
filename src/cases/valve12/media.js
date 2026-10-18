/* Videos for Case 12. YouTube could not be opened from the build environment
   (proxy 403 / DNS failure), so no channel page or ytInitialData could be read.
   Each id + title below was returned by a web-search index of youtube.com;
   channel names are left off because they could not be confirmed. Every one
   is listed as UNVERIFIED in REPORT.md — open each before release. */
export const V = {
  watchmanProc: { id: 'gKBzpjwLMKA', title: 'Watchman procedure for left atrial appendage occlusion (LAAO)' },
  watchman: { id: '9nUebOY4T34', title: 'Watchman™ left atrial appendage occlusion' },
  laaoDevice: { id: 'Ok4CboycmIA', title: 'Tell me more: left atrial appendage occlusion device' },
  amuletIde: { id: 'COaPGllU2sc', title: 'ESC Congress 2021 — Amulet IDE trial (ESC TV)' },
  tsp: { id: 'OOarHfU8JiA', title: 'How to guide a transseptal puncture with echocardiography' },
  pulsus: { id: 'RSTN4yo5tBM', title: 'Pulsus paradoxus finally makes sense (tamponade explained visually)' },
  pulsus2: { id: 'JsOuUvJgqec', title: 'Pulsus paradoxus, pericardial effusion, cardiac tamponade' },
  pericardio: { id: '61FPmtw5RAM', title: 'Ultrasound-guided pericardiocentesis' },
};

/* Channel searches the learner can open (same channels as valveMedia.js). */
export const LAAO_SEARCHES = [
  { name: 'CCC Live Cases — LAA occlusion', url: 'https://www.youtube.com/@CCCLiveCases/search?query=LAA%20occlusion', note: 'Live LAAO cases' },
  { name: 'CCC Live Cases — Watchman', url: 'https://www.youtube.com/@CCCLiveCases/search?query=Watchman', note: 'Watchman cases' },
  { name: 'Gulf Intervention Society — LAA closure', url: 'https://www.youtube.com/@gulfinterventionsociety/search?query=LAA%20closure', note: 'Appendage closure cases and talks' },
  { name: 'Interventional Cardiology — Amulet', url: 'https://www.youtube.com/@interventionalcardiologyis3814/search?query=Amulet', note: 'Amulet cases' },
];
