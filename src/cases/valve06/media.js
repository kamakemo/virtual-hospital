/* Videos for Case 06. YouTube itself could not be opened from the build
   environment; every id here was confirmed (id + title) through a web-search
   index of youtube.com — see REPORT.md. Channel names are only given where
   they could be confirmed. */
export const V = {
  msMurmur: { id: 'VI-dIsMha6Y', title: 'Mitral stenosis: opening snap & rumbling murmur' },
  arf: { id: 'MKTqnIrx4g8', title: 'Acute rheumatic fever and rheumatic heart disease explained' },
  pht: { id: '5h6_q3qmeBw', title: 'Pressure half time in mitral stenosis' },
  wilkins: { id: 'DnUqrsGaxRE', title: 'Wilkins echocardiographic score for mitral stenosis' },
  pmcSteps: { id: 'evPQWfYLJeU', title: 'Mitral balloon valvotomy: the basic steps (Inoue balloon)' },
  pmcLive: { id: 'WEdOwn1mzcU', title: 'Live case of balloon mitral valvuloplasty' },
  tsp: { id: 'OOarHfU8JiA', title: 'How to guide a transseptal puncture with echocardiography' },
  pericardio: { id: '61FPmtw5RAM', title: 'Ultrasound-guided pericardiocentesis' },
};

/* Channel searches the learner can open (same channels as valveMedia.js). */
export const PMC_SEARCHES = [
  { name: 'CCC Live Cases — mitral valvuloplasty', url: 'https://www.youtube.com/@CCCLiveCases/search?query=mitral%20valvuloplasty', note: 'Live balloon mitral cases' },
  { name: 'Gulf Intervention Society — mitral valvuloplasty', url: 'https://www.youtube.com/@gulfinterventionsociety/search?query=mitral%20valvuloplasty', note: 'PTMC / PMC cases and talks' },
  { name: 'Interventional Cardiology — PTMC', url: 'https://www.youtube.com/@interventionalcardiologyis3814/search?query=PTMC', note: 'Percutaneous transvenous mitral commissurotomy' },
];
