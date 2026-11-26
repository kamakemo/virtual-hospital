/* ============================================================
   CARDIOLOGY · VALVULAR & STRUCTURAL · CASE 01
   Severe Aortic Stenosis — TAVI or SAVR?

   A full admission, ER to discharge, played in the simulator:
   you take the history, examine, order, read results, fix the
   drug chart, argue at the Heart Team and treat two crises with
   real orders against the clock.

   Guidelines: 2025 ESC/EACTS valvular heart disease; 2020 ACC/AHA
   VHD; 2021 ESC cardiac pacing; 2024 ESC AF; 2023 ESC
   endocarditis. Trial figures are rounded from the primary
   publications. Composite teaching case.
   ============================================================ */

const T = (day, h, m) => day * 1440 + h * 60 + m;

export const CAST = {
  you: ['You', 'Resident · day shift', '#C8FF3D', 'YOU'],
  omar: ['Dr Omar Fathy', 'Resident · night shift', '#7FB4FF', 'OF'],
  layla: ['Dr Layla Haddad', 'Consultant cardiologist', '#FF5A4E', 'LH'],
  karim: ['Mr Karim Adel', 'Cardiac surgeon', '#FFC24B', 'KA'],
  selim: ['Dr Selim Nassar', 'Structural interventionalist', '#A678FF', 'SN'],
  mariam: ['Mariam', 'Charge nurse', '#2EE6A6', 'MN'],
  hassan: ['Mr Hassan', 'The patient', '#D7DCE8', 'HE'],
  dina: ['Dina', 'His daughter', '#F5A8C8', 'DE'],
  ed: ['Dr Tarek', 'ED registrar', '#9AA3B8', 'TR'],
  anaes: ['Dr Rania', 'Cardiac anaesthetist', '#7FE0E6', 'RA'],
};

const inCrisis = id => s => s.crisis?.id === id;
const before = t => s => s.t < t;

export default {
  id: 'c-valve-01',
  title: 'Severe Aortic Stenosis — TAVI or SAVR?',
  patient: { name: 'Hassan El-Sayed', age: 72, sex: 'M', mrn: '48-2217', weight: 78, allergies: 'None known', code: 'Full code', bed: 'Resus 2 → Valvular unit bed 4' },
  oneLiner: '72-year-old architect, hypertensive, witnessed exertional syncope on a staircase with chest tightness.',
  start: T(0, 23, 41),
  vitals: { hr: 88, sbp: 108, dbp: 84, spo2: 95, rr: 20, temp: 36.6, rhythm: 'SR' },
  cast: CAST,

  /* ---------- the history he will give, if asked ---------- */
  history: [
    { id: 'event', q: 'Tell me exactly what happened on the stairs.', a: '“I was carrying a box of candles up one flight. My chest went tight, like a belt, the stairs went grey — then I was on the landing with my daughter’s hands on my face.”' },
    { id: 'exertion', q: 'Before tonight — any breathlessness, chest pain or dizziness on exertion?', a: '“…Three months. I stopped walking to the office in spring. Breathless by the second floor, a tightness that goes when I stop. I told my wife it was my knees.”' },
    { id: 'stools', q: 'Any black, tarry stools or blood from the back passage?', a: '“On and off since winter. Black. I thought it was the iron tablets my pharmacist gave me.”' },
    { id: 'nsaid', q: 'What tablets do you take — including over the counter?', a: '“Amlodipine, ramipril. And ibuprofen most days for my knees. Iron from the pharmacy.”' },
    { id: 'orthop', q: 'Can you lie flat at night? Ankles swollen?', a: '“Two pillows lately. Ankles a little puffy by evening.”' },
    { id: 'family', q: 'Any family history of heart disease or sudden death?', a: '“My father had a ‘heart murmur’ and died at 80 in his sleep.”' },
    { id: 'goals', q: 'What matters most to you right now?', a: '“My daughter Dina gets married in five weeks. I am walking her down that aisle.”' },
  ],
  exam: [
    { id: 'pulse', sys: 'Pulse', f: 'Low-volume, slow-rising carotid upstroke — pulsus parvus et tardus. Regular, 88.' },
    { id: 'bp', sys: 'Blood pressure', f: '108/84 — narrow pulse pressure (24 mmHg).' },
    { id: 'apex', sys: 'Apex', f: 'Sustained, heaving, not displaced — pressure overload.' },
    { id: 's2', sys: 'Heart sounds', f: 'Single, soft S2 — A2 is inaudible. S4 present.' },
    { id: 'murmur', sys: 'Murmur', f: 'Harsh ejection systolic murmur, right upper sternal edge, late-peaking, radiating to both carotids; musical at the apex (Gallavardin).' },
    { id: 'chest', sys: 'Chest', f: 'Fine crackles at both bases.' },
    { id: 'pallor', sys: 'General', f: 'Conjunctival pallor. No jaundice, no stigmata of liver disease.' },
    { id: 'pr', sys: 'Abdomen & PR', f: 'Soft, non-tender. PR: dark, tarry stool on the glove.' },
  ],

  problems: [
    { id: 'p1', title: 'Exertional syncope with ejection systolic murmur — ?severe aortic stenosis', sev: 'critical', plan: 'Telemetry, no vasodilators, echo' },
  ],

  /* ---------- what each test shows in this patient ---------- */
  results: {
    ecg: { summary: 'Sinus rhythm 88. LVH with strain (ST depression/T inversion I, aVL, V5–V6). Complete RBBB. PR 210 ms. No acute ST elevation.', interp: 'Pressure-overloaded LV. Baseline conduction disease — the strongest predictor of needing a pacemaker after TAVI.' },
    trop: [
      { summary: 'hs-TnT 38 ng/L (ref < 14)', rows: [['hs-TnT', '38', 'ng/L', '< 14', 'H']], interp: 'Raised — repeat at 1 h.' },
      { summary: 'hs-TnT 41 ng/L (Δ 3)', rows: [['hs-TnT 1 h', '41', 'ng/L', '< 14', 'H']], interp: 'Flat curve: chronic myocardial injury of a hypertrophied LV, not an acute plaque event.' },
      { summary: 'hs-TnT 40 ng/L', rows: [['hs-TnT', '40', 'ng/L', '< 14', 'H']] },
    ],
    fbc: (s, n) => n === 1 || s.t < T(3, 0, 0)
      ? { summary: 'Hb 9.1 g/dL, MCV 72 fL, platelets 268', rows: [['Haemoglobin', '9.1', 'g/dL', '13–17', 'L'], ['MCV', '72', 'fL', '80–100', 'L'], ['Platelets', '268', '×10⁹/L', '150–400', 'N'], ['WCC', '7.2', '×10⁹/L', '4–11', 'N']], interp: 'Microcytic anaemia. Why? Nobody has asked yet.' }
      : { summary: 'Hb 10.4 g/dL', rows: [['Haemoglobin', '10.4', 'g/dL', '13–17', 'L']], interp: 'Rising after IV iron; no further melaena.' },
    ue: { summary: 'Creatinine 1.2 mg/dL, eGFR 58, K⁺ 4.3, Na⁺ 138', rows: [['Creatinine', '1.2', 'mg/dL', '0.7–1.2', 'N'], ['eGFR', '58', 'mL/min/1.73m²', '> 60', 'L'], ['Potassium', '4.3', 'mmol/L', '3.5–5.0', 'N'], ['Sodium', '138', 'mmol/L', '135–145', 'N']], interp: 'CKD 3a — matters for contrast and for DOAC dosing.' },
    coag: { summary: 'INR 1.0, aPTT 31 s', rows: [['INR', '1.0', '', '0.9–1.2', 'N'], ['aPTT', '31', 's', '25–35', 'N']] },
    bnp: { summary: 'NT-proBNP 2,900 pg/mL', rows: [['NT-proBNP', '2900', 'pg/mL', '< 300', 'H']], interp: 'High LV wall stress — prognostic in AS.' },
    iron: { summary: 'Ferritin 8 µg/L, TSAT 7% — absolute iron deficiency', rows: [['Ferritin', '8', 'µg/L', '30–400', 'L'], ['Transferrin saturation', '7', '%', '20–45', 'L']], interp: 'Chronic blood loss.' },
    fit: { summary: 'FIT positive (412 µg Hb/g)', rows: [['FIT', '412', 'µg/g', '< 10', 'H']], interp: 'Occult GI bleeding.' },
    vbg: (s) => s.v.sbp < 90 ? { summary: 'pH 7.29, lactate 4.1 mmol/L', rows: [['pH', '7.29', '', '7.35–7.45', 'L'], ['Lactate', '4.1', 'mmol/L', '< 2', 'H']], interp: 'Hypoperfusion.' } : { summary: 'pH 7.38, lactate 1.4 mmol/L', rows: [['pH', '7.38', '', '7.35–7.45', 'N'], ['Lactate', '1.4', 'mmol/L', '< 2', 'N']] },
    gs: { summary: 'Group A Rh+, antibody screen negative. 2 units available.' },
    vwf: { summary: 'Loss of high-molecular-weight vWF multimers; PFA-100 collagen/ADP closure time prolonged (> 300 s).', interp: 'Acquired von Willebrand syndrome type 2A — Heyde syndrome. Expected to correct after valve replacement.' },
    tft: { summary: 'TSH 1.8 mU/L' },
    cxr: { summary: 'Normal heart size, calcified aortic knuckle, mild upper-lobe diversion, small bilateral effusions.' },
    pocus: { summary: 'Heavily calcified, barely-opening aortic valve. Concentric LVH, small cavity, vigorous systolic function. No effusion.', interp: 'Severe AS likely — confirm with a formal study.' },
    tte: { summary: 'AVA 0.78 cm² (0.41 cm²/m²), Vmax 3.8 m/s, mean gradient 34 mmHg, DVI 0.22, LVEF 58%, SVi 30 mL/m², GLS −13%.', rows: [['Peak velocity', '3.8', 'm/s', 'severe ≥ 4.0', 'N'], ['Mean gradient', '34', 'mmHg', 'severe ≥ 40', 'N'], ['AVA (continuity)', '0.78', 'cm²', 'severe ≤ 1.0', 'C'], ['Indexed AVA', '0.41', 'cm²/m²', 'severe ≤ 0.6', 'C'], ['Dimensionless index', '0.22', '', 'severe ≤ 0.25', 'C'], ['LVEF', '58', '%', '≥ 50', 'N'], ['Stroke volume index', '30', 'mL/m²', 'low flow ≤ 35', 'L'], ['GLS', '−13', '%', 'normal ≤ −18', 'L']], interp: 'Discordant: area severe, gradient moderate, EF preserved, flow low.' },
    ctca: { summary: 'Aortic valve calcium score 2,650 Agatston units.', interp: 'Above the male threshold (≥ 2,000 AU): true severe AS — paradoxical low-flow, low-gradient.' },
    dse: { summary: 'Small, stiff LV; little change in flow; non-diagnostic.', interp: 'Dobutamine echo is the test for classical LF-LG AS with reduced EF — not for this phenotype.' },
    cttavi: { summary: 'Tricuspid valve, no LVOT calcium. Annulus 468 mm² / 77 mm. LM height 13 mm, RCA 15 mm, sinuses 32 mm. Femorals 7.2/7.0 mm. Membranous septum 3 mm. No porcelain aorta.', interp: 'Suitable for transfemoral TAVI (26 mm balloon-expandable or 29 mm self-expanding). Short membranous septum + RBBB → high pacing risk.' },
    angio: { summary: 'Proximal LAD 75% focal stenosis. LCx and RCA mild irregularities. Left main normal.' },
    ctbrain: { summary: 'No acute intracranial abnormality.' },
  },

  /* ---------- what orders do to this patient ---------- */
  rules: {
    gtn: [{ when: before(T(5, 0, 0)), harm: 10, fx: { set: { sbp: 74, dbp: 48, hr: 112, spo2: 92 } }, say: ['mariam', 'Pressure’s 74 over 48 — he’s grey and drifting. That was the nitrate.'], short: 'vasodilator in a fixed-output heart', why: 'Nitrates drop preload and afterload; through a fixed aortic orifice output cannot rise — BP and coronary perfusion collapse.' }],
    gtn_inf: [{ harm: 10, fx: { set: { sbp: 60, dbp: 36, hr: 120 } }, say: ['mariam', 'Sixty systolic on the GTN! I’m stopping it.'], short: 'vasodilator in severe AS' }],
    amlo: [{ when: before(T(5, 0, 0)), harm: 5, say: ['mariam', 'More amlodipine after syncope with a pressure of 108? I’ll hold it until you’re sure.'], short: 'vasodilator after syncope' }],
    aspload: [{ when: before(T(1, 6, 0)), harm: 5, say: ['ed', 'Loaded with aspirin… you sure about an NSTEMI with a flat troponin and an Hb of nine?'], short: 'no ACS indication; anaemic' }],
    ticag: [{ when: before(T(1, 6, 0)), harm: 5, say: ['mariam', 'Ticagrelor in a pale man with dark stools? I’d want a reason.'], short: 'potent antiplatelet in occult GI bleeding' }],
    ibu: [{ harm: 5, say: ['mariam', 'Ibuprofen — with a GI bleed and CKD?'], short: 'NSAID: GI bleeding and kidney' }],
    transfuse: [{ when: s => s.v.sbp >= 90, harm: 3, fx: { d: { spo2: -2, rr: 3 } }, say: ['mariam', 'He’s getting crackly with that unit going in…'], short: 'volume into a stiff LV, Hb stable' }],
    ivfe: [{ good: true, why: 'IV iron corrects the deficit over 2–3 weeks without loading volume.' }],
    tele: [{ good: true, why: 'Syncope with suspected severe AS needs a monitored bed.' }],
    nobp: [{ good: true, why: 'A visible alert stops the 03:00 PRN nitrate.' }],
    // night of Day 3 — fast AF with flash pulmonary oedema
    metop: [{ when: inCrisis('af'), harm: 10, fx: { set: { hr: 124, sbp: 62, dbp: 38, spo2: 80 } }, say: ['mariam', 'Rate’s coming down — and so is everything else. Sixty-two systolic!'], short: 'negative inotrope in a failing fixed-output heart' }],
    furo_iv: [
      { when: inCrisis('af'), harm: 5, fx: { d: { sbp: -6 } }, say: ['mariam', 'Furosemide won’t fix a rhythm — and he’s seventy-eight systolic.'], short: 'diuretic before rhythm/pressure' },
      { when: s => s.v.sbp < 95, harm: 5, fx: { d: { sbp: -8 } }, say: ['mariam', 'He dropped another eight with that.'], short: 'diuretic before perfusion pressure is secured' },
      { when: s => s.flags.afFixed, good: true, delay: 30, fx: { d: { spo2: 3, rr: -4 } }, say: ['mariam', 'Passing urine well. Crackles a bit better.'], why: 'Cautious diuresis once perfusion pressure is held.' },
    ],
    fluid: [{ when: s => s.v.spo2 < 95, harm: 8, fx: { set: { spo2: 82, rr: 36 } }, say: ['mariam', 'Sats eighty-two — that litre went straight to his lungs.'], short: 'volume into pulmonary oedema' }],
    amio: [{ when: inCrisis('af'), fx: { d: { hr: -8 } }, say: ['mariam', 'Amiodarone’s running — over an hour. He doesn’t look like he has an hour.'] }],
    sedate: [{ when: inCrisis('af'), good: true, say: ['anaes', 'Etomidate in. Small dose. You’re clear to shock.'], why: 'Brief sedation with a haemodynamically gentle agent.' }],
    cpap: [{ good: true, fx: { d: { spo2: 4, rr: -4 } }, say: ['mariam', 'CPAP on — sats coming up.'], why: 'CPAP offloads the LV and recruits oedematous lung.' }],
    o2: [{ fx: { d: { spo2: 2 } } }],
    heparin: [{ when: s => s.flags.afFixed, good: true, why: 'New AF, CHA₂DS₂-VA 3, cardioverted: anticoagulate.' }],
    // Day 3 afternoon — complete heart block
    atropine: [{ when: inCrisis('chb'), fx: { d: { hr: 2 } }, say: ['mariam', 'Nothing. Still thirty-four.'], why: 'Infra-nodal block from the valve frame does not respond to atropine.' }],
    iso: [{ when: inCrisis('chb'), fx: { set: { hr: 46, sbp: 90, dbp: 46 } }, say: ['mariam', 'Up to forty-six on the isoprenaline… he’s still clammy.'] }],
    ppm: [{ when: s => s.flags.chb, good: true, why: 'Persistent complete heart block after TAVI: permanent pacing (Class I).' }],
  },

  /* the night resident’s chart, written before you arrive */
  preOrders: [],

  beats: [
    /* ---------------- 1 · ER ---------------- */
    { k: 'scene', title: 'Emergency department — resus bay 2', t: T(0, 23, 41), icon: '🚨' },
    { k: 'act', text: 'He designed half the buildings on this street. Tonight Hassan El-Sayed carried a box of candles up one flight of stairs for his daughter’s wedding rehearsal — and woke up on the landing.' },
    { k: 'say', who: 'ed', text: '72, witnessed syncope on exertion, out about twenty seconds. No seizure. Chest “tight like a belt” on the stairs. Hypertensive, nothing else. BP 108 over 84.' },
    { k: 'say', who: 'mariam', text: 'Pulse pressure of twenty-four. And he’s pale — properly pale.' },
    { k: 'say', who: 'hassan', text: 'I stood up too fast. My daughter gets married in five weeks; I don’t have time for this.' },
    { k: 'say', who: 'ed', text: 'ECG’s got strain and a right bundle. I’ll give him a puff of GTN for the tightness and run an NSTEMI pathway.' },
    { k: 'q', id: 'er1', short: 'ED: the GTN', ask: 'The ED registrar reaches for the GTN spray. What do you say?', opts: [
      ['“Hold the nitrate. Exertional syncope, narrow pulse pressure, LVH strain — stethoscope and probe on that chest before any vasodilator.”', 2, '<b>Exactly.</b> Exertional syncope + slow narrow pulse + LVH strain is aortic stenosis until proven otherwise. A fixed outflow cannot raise output when a nitrate drops preload and afterload.'],
      ['“Fine — one puff, and repeat the troponin at one hour.”', 0, 'In severe AS a nitrate can turn chest tightness into an arrest: preload falls, output cannot rise through a fixed orifice, BP collapses, coronary perfusion follows.', { set: { sbp: 76, dbp: 48, hr: 110 } }],
      ['“Load aspirin and ticagrelor and call the cath lab.”', 0, 'A flat, minimally raised troponin in a hypertrophied ventricle is demand ischaemia far more often than plaque rupture. Dual antiplatelets in a pale man you have not examined is how a GI bleed becomes a transfusion.'],
      ['“CT head first — he lost consciousness.”', 1, 'Only with head injury or focal signs. Twenty seconds of exertional syncope with full recovery is a cardiac problem.'],
    ] },
    { k: 'task', id: 'er_work', short: 'ED work-up', pts: 15, ask: 'He’s yours. Use the chart: take a focused history, examine him, and order the first investigations and monitoring.', need: ['h:event', 'e:murmur', 'e:s2', 'o:ecg', 'o:trop', 'o:fbc', 'o:pocus', 'o:tele'], missedWhy: 'History of the event, the murmur and S2, ECG, troponin, FBC, a bedside echo and telemetry are the minimum for exertional syncope.' },
    { k: 'card', title: '🫀 The bedside diagnosis', html: '<ul><li><b>Pulsus parvus et tardus</b> — slow, small upstroke (may be masked by a stiff aorta in the elderly).</li><li><b>Single soft S2</b> — A2 lost: the best bedside sign of severity.</li><li><b>Late-peaking murmur</b> — the later the peak, the tighter the valve. Loudness means little: a failing ventricle makes a quiet murmur.</li><li><b>Narrow pulse pressure</b> and LVH strain complete the picture.</li></ul>' },
    { k: 'scene', title: 'Resus bay 2 — results back', t: T(1, 0, 50), icon: '🧪' },
    { k: 'say', who: 'ed', text: 'Your results are in the chart. So — where does he go?' },
    { k: 'q', id: 'er2', short: 'ED disposition', ask: 'Where does he go from the ED?', opts: [
      ['Monitored cardiology bed, telemetry, no vasodilators, formal echo in the morning', 2, 'Syncope with suspected severe AS is high-risk: admit monitored. Untreated symptomatic severe AS carries about 50% mortality at two years.'],
      ['Home with an urgent outpatient echo', 0, 'Exertional syncope with a structural cause is a red flag in every syncope guideline.'],
      ['General medical ward, routine observations', 1, 'Right to admit, wrong place — he needs telemetry and a team that won’t give him amlodipine and a nitrate.'],
      ['Straight to the cath lab tonight', 0, 'No STEMI. Angiography is part of the work-up — planned, in daylight, after the valve is defined.'],
    ] },

    /* ---------------- 2 · Handover ---------------- */
    { k: 'scene', title: 'Residents’ room — morning handover', t: T(1, 7, 30), icon: '🌙' },
    { k: 'event', by: 'Dr O. Fathy (night)', orders: ['gtn', 'amlo', 'ramipril', 'ibu', 'enox', 'para', 'obs4'], note: { by: 'Dr O. Fathy', role: 'Night resident', title: 'Admission note', text: 'Exertional syncope ?AS. Stable overnight. Home meds continued. PRN GTN for chest tightness. VTE prophylaxis. Echo am.' } },
    { k: 'act', text: 'Omar has been awake for twenty-six hours. Bed 4 is the last of nine handovers; he’s already reaching for his jacket.' },
    { k: 'say', who: 'omar', text: '<b>S</b> — Bed 4, Hassan El-Sayed, 72, exertional syncope, murmur like severe AS. Stable overnight.' },
    { k: 'say', who: 'omar', text: '<b>B</b> — Hypertensive on amlodipine 10 and ramipril 5. Ibuprofen most days for his knees. Lives independently.' },
    { k: 'say', who: 'omar', text: '<b>A</b> — 112/82, sinus 84, sats 96. Trop flat. Hb 9.1. Nothing on tele.' },
    { k: 'say', who: 'omar', text: '<b>R</b> — Formal echo, consultant review. I charted his home meds, PRN GTN and prophylactic enoxaparin. Can I go?' },
    { k: 'q', id: 'sbar1', multi: true, short: 'Handover errors', ask: 'Before he leaves — what in that handover would you stop him for? Select every problem.', opts: [
      ['PRN GTN is on the drug chart of a man with suspected severe AS', 1, 'A PRN order is a loaded gun: at 03:00 a nurse will follow the chart.'],
      ['Amlodipine and ramipril continued unchanged after syncope with a systolic of 108', 1, 'Not “never” drugs in AS — but after syncope with a low BP, hold them until the haemodynamics are defined.'],
      ['Hb 9.1, microcytic, on daily ibuprofen — nobody asked about stool colour or sent iron studies', 1, 'An unexplained microcytic anaemia in AS is a diagnosis waiting to be made.'],
      ['RBBB with a long PR was not handed over', 1, 'Baseline conduction disease is the strongest predictor of pacing after valve intervention.'],
      ['Enoxaparin prophylaxis was prescribed', 0, 'Reasonable while the anaemia is stable — review it daily, but it is not the error.'],
      ['He was put on telemetry', 0, 'Correct, not a problem.'],
    ] },
    { k: 'task', id: 'chart_fix', short: 'Fix the night chart', pts: 15, ask: 'Open the Drug chart and make it safe before the 08:00 drug round.', need: ['s:gtn', 'x:amlo', 'x:ramipril', 's:ibu', 'o:nobp'], missedWhy: 'GTN off, amlodipine and ramipril held, ibuprofen stopped and a no-vasodilator alert.' },
    { k: 'card', title: '🧠 Why SBAR fails at 07:30', tone: 'burn', html: '<ul><li><b>Recommendation is the weakest letter.</b> “Echo, consultant review” is a schedule, not a plan. A plan says what must <b>not</b> happen.</li><li><b>Abnormal results get normalised overnight.</b> “Hb 9.1” said flatly sounds like a fact; it is a question.</li><li><b>The drug chart is the real handover.</b> What is written is what will be given.</li></ul>' },

    /* ---------------- 3 · Your review ---------------- */
    { k: 'scene', title: 'Bed 4 — your review', t: T(1, 8, 5), icon: '🩺' },
    { k: 'say', who: 'dina', text: 'Baba, tell them about the lamp-posts. You stopped at every one.' },
    { k: 'task', id: 'review', short: 'History, exam and work-up', pts: 15, ask: 'Complete the history and examination, then order what will define the valve and explain the anaemia.', need: ['h:exertion', 'h:stools', 'h:nsaid', 'e:pulse', 'e:pr', 'o:tte', 'o:iron', 'o:ue'], missedWhy: 'Exertional symptoms, melaena and NSAIDs; pulse character and a PR; formal echo, iron studies and renal function.' },
    { k: 'card', title: '⏳ The triad is a clock', html: '<p>Without valve replacement, average survival after symptom onset: about <b>5 years after angina, 3 after syncope, 2 after heart failure</b> (Ross &amp; Braunwald). He has all three.</p>' },
    { k: 'scene', title: 'Echo lab — the formal study', t: T(1, 10, 15), icon: '🖥️' },
    { k: 'say', who: 'you', text: 'Area severe. Gradient moderate. EF normal. The sonographer has written “moderate–severe”.' },
    { k: 'q', id: 'rev1', short: 'Discordant echo', ask: 'The echo numbers disagree (read them in Results). What next?', opts: [
      ['Exclude measurement error (LVOT, flow, BP), recognise paradoxical low-flow low-gradient AS, and arbitrate with a CT valve calcium score', 2, '<b>Preserved EF + SVi ≤ 35 + AVA ≤ 1.0 + mean gradient &lt; 40</b> = paradoxical LF-LG AS. CT calcium arbitrates: <b>≥ 2,000 AU men / ≥ 1,200 AU women</b> → severe likely.'],
      ['Call it moderate and repeat in six months', 0, 'Gradient depends on flow; low flow makes a severe valve look moderate. He does not have six months.'],
      ['Low-dose dobutamine stress echo', 1, 'The test for <b>classical</b> LF-LG AS with reduced EF. With a small cavity and preserved EF it adds little.'],
      ['Invasive study crossing the valve', 1, 'Occasionally needed when non-invasive data stay discordant; crossing a calcified valve carries embolic stroke risk.'],
    ] },
    { k: 'task', id: 'ctca', short: 'Arbitrate severity', pts: 5, ask: 'Order the test that settles severity.', need: ['o:ctca'] },

    /* ---------------- 4 · Consultant round ---------------- */
    { k: 'scene', title: 'Bed 4 — consultant ward round', t: T(1, 14, 0), icon: '👩‍⚕️' },
    { k: 'act', text: 'Dr Layla Haddad reads the echo standing, flips the page as if the answer might be on the back, and looks at you instead of the patient.' },
    { k: 'say', who: 'layla', text: 'Velocity 3.8, gradient 34. My sonographer says moderate-to-severe, which is echo-speak for “I don’t want to be wrong”. Is this valve killing him or not?' },
    { k: 'say', who: 'you', text: 'Severe. Area 0.78, index 0.22, SVi 30 with an EF of 58 — paradoxical low-flow low-gradient. Calcium score 2,650.' },
    { k: 'q', id: 'rd1', short: 'Low flow, normal EF', ask: 'Dr Haddad: “Why does a ventricle with an EF of 58% have a low stroke volume?”', opts: [
      ['Concentric remodelling leaves a small, stiff cavity: a normal fraction of a small volume is a small stroke volume — and longitudinal function (GLS −13%) is already impaired', 2, '<b>EF is a ratio, not an output.</b> 58% of a 55 mL cavity is 32 mL. Strain shows the damage EF hides.'],
      ['The measurement is wrong — EF and SV must agree', 0, 'They measure different things. The pattern is common — up to a third of severe AS.'],
      ['Because of the anaemia', 0, 'Anaemia raises output; it would inflate gradients.'],
      ['Mitral regurgitation stealing forward flow', 1, 'A real cause to exclude — he has none of significance.'],
    ] },
    { k: 'card', title: '📐 Four patterns, one valve area', html: '<table><tr><th>Pattern</th><th>Gradient</th><th>SVi</th><th>EF</th><th>Settle it with</th></tr><tr><td>High-gradient</td><td>≥ 40</td><td>any</td><td>any</td><td>It is severe</td></tr><tr><td>Classical LF-LG</td><td>&lt; 40</td><td>≤ 35</td><td>&lt; 50%</td><td>Dobutamine echo (flow reserve)</td></tr><tr><td><b>Paradoxical LF-LG</b></td><td>&lt; 40</td><td>≤ 35</td><td>≥ 50%</td><td><b>CT calcium score</b></td></tr><tr><td>Normal-flow LG</td><td>&lt; 40</td><td>&gt; 35</td><td>≥ 50%</td><td>Usually moderate; re-measure</td></tr></table>' },
    { k: 'say', who: 'layla', text: 'Now the haemoglobin. An old man with AS is bleeding from his gut and you want to blame his knees. What does blood do when it’s forced through a slit at four metres a second?' },
    { k: 'q', id: 'rd2', short: 'Heyde syndrome', ask: 'What is Dr Haddad asking you to see?', opts: [
      ['Heyde syndrome: shear unfolds von Willebrand factor, ADAMTS13 cleaves its large multimers, angiodysplasia bleeds — acquired vWD type 2A', 2, 'Platelets and clotting are normal; the defect is in high-molecular-weight multimers (PFA-100 prolonged). It <b>resolves after valve replacement</b> — fixing the valve treats the bleeding.'],
      ['Occult colorectal cancer — colonoscopy before anything cardiac', 1, 'Must be excluded at 72, but delaying a valve with 50% two-year mortality reverses the priorities.'],
      ['NSAID gastropathy — stop ibuprofen and move on', 1, 'Stop it, certainly. Stopping at the first plausible cause is how the second diagnosis is missed.'],
      ['Haemolysis across the calcified valve', 0, 'Mechanical haemolysis belongs to prostheses and paravalvular leaks.'],
    ] },
    { k: 'card', title: '📜 Who replaces the valve — the guidelines', tone: 'ev', html: '<ul><li>Intervention is indicated in <b>symptomatic severe AS</b>, including low-gradient AS once severity is confirmed (Class I).</li><li><b>2025 ESC/EACTS:</b> Heart Team decision; <b>TAVI recommended ≥ 70 years</b> with tricuspid valve and transfemoral anatomy; <b>SAVR &lt; 70</b> at low surgical risk (threshold lowered from 75 in 2021).</li><li><b>2020 ACC/AHA:</b> SAVR &lt; 65; <b>shared decision 65–80</b>; TAVI &gt; 80 or life expectancy &lt; 10 years.</li></ul>' },
    { k: 'card', title: '🔬 The trials behind the argument', tone: 'ev', html: '<table><tr><th>Trial</th><th>Population</th><th>Result</th></tr><tr><td>PARTNER 3 (5 y)</td><td>Low risk, mean 73, balloon-expandable</td><td>Early TAVI advantage; curves converge by 5 years</td></tr><tr><td>Evolut Low Risk</td><td>Low risk, self-expanding</td><td>Death/disabling stroke similar; better haemodynamics, more pacing and mild PVL</td></tr><tr><td>NOTION (10 y)</td><td>≥ 70, mostly low risk</td><td>No mortality difference; less structural valve deterioration with TAVI</td></tr><tr><td>DEDICATE</td><td>Low–intermediate risk, mean 74</td><td>Death or stroke at 1 y ≈ 5% TAVI vs 10% SAVR</td></tr><tr><td>NOTION-3</td><td>TAVI + significant CAD</td><td>PCI reduced death/MI/urgent revascularisation, more bleeding</td></tr><tr><td>EARLY TAVR</td><td>Asymptomatic severe AS</td><td>Early TAVR beat surveillance (driven by hospitalisation)</td></tr></table>' },
    { k: 'q', id: 'rd3', short: 'Asymptomatic AS', ask: 'Dr Haddad: “Same valve, no symptoms, found by accident. What then?”', opts: [
      ['Intervene for EF < 50%, abnormal exercise test, Vmax ≥ 5 m/s, rapid progression or very high BNP — and after EARLY TAVR, AVATAR and RECOVERY, early intervention at low procedural risk is reasonable', 2, '2025 ESC/EACTS: intervention <b>should be considered</b> in asymptomatic high-gradient severe AS at low procedural risk. “Asymptomatic” often means “has stopped climbing stairs”.'],
      ['Watchful waiting until symptoms, always', 0, 'Forty years of teaching that the trials have now moved past.'],
      ['Everyone gets a valve immediately', 1, 'Closer than it used to be, but still a risk/durability decision.'],
      ['A statin to slow progression', 0, 'SALTIRE, SEAS, ASTRONOMER: statins do not slow calcific AS.'],
    ] },

    /* ---------------- 5 · The file ---------------- */
    { k: 'scene', title: 'Nurses’ station — writing it up', t: T(1, 15, 0), icon: '📁' },
    { k: 'say', who: 'mariam', text: 'If it isn’t in the file, it didn’t happen — and my night staff will do exactly what the chart says. Write the plan.' },
    { k: 'task', id: 'plan', short: 'The consultant’s plan', pts: 15, ask: 'Put Dr Haddad’s plan into orders: treat the iron deficiency, protect the gut, confirm Heyde, and work him up for valve intervention.', need: ['o:ivfe', 'o:ppi', 'o:vwf', 'o:cttavi', 'o:angio', 'o:gs', 'o:stool'], missedWhy: 'IV iron, PPI, vWF multimers, CT TAVI protocol, coronary angiography, group & save and a stool chart.' },
    { k: 'q', id: 'ch1', short: 'Transfusion threshold', ask: 'Hb 9.1, iron deficient, haemodynamically stable. Transfuse before the cath lab?', opts: [
      ['No: IV iron, group & save, transfuse only if Hb < 8 or symptomatic — the valve is the definitive treatment of the bleeding', 2, 'Restrictive thresholds are as safe as liberal in stable cardiac patients (MINT favoured a liberal threshold only in acute MI). Each unit is also volume into a stiff ventricle.'],
      ['Two units today to get above 10', 1, 'Not wrong if symptomatic, but 600 mL into a preload-sensitive LV invites pulmonary oedema.'],
      ['Oral iron and recheck in a month', 0, 'Too slow, poorly absorbed with ongoing loss.'],
      ['Cancel cardiac work-up until GI has scoped him', 0, 'Inverts the risk.'],
    ] },
    { k: 'event', note: { by: 'Dr L. Haddad', role: 'Consultant', title: 'Consultant ward round', text: 'Symptomatic true-severe paradoxical LF-LG AS (AVA 0.78, Ca 2,650). Probable Heyde syndrome. Plan: CT TAVI + angiography; Heart Team tomorrow 08:00; no vasodilators; IV iron; NSAID stopped; telemetry; pacing risk discussed (RBBB). Patient goal: daughter’s wedding in 5 weeks.' }, problem: { id: 'p1', title: 'Severe calcific AS — paradoxical low-flow low-gradient, symptomatic (syncope, angina, NYHA III)', sev: 'critical', plan: 'Heart Team Day 2' } },
    { k: 'event', problem: { id: 'p2', title: 'Iron-deficiency anaemia with GI blood loss — ?Heyde syndrome', sev: 'high', plan: 'IV iron, PPI, vWF multimers, GI after valve' } },
    { k: 'event', problem: { id: 'p3', title: 'Conduction disease: RBBB, PR 210 ms', sev: 'moderate', plan: 'Telemetry; pacing risk consented' } },

    /* ---------------- 6 · Heart team ---------------- */
    { k: 'scene', title: 'Heart Team — conference room B', t: T(2, 8, 0), icon: '👥' },
    { k: 'act', text: 'His aortic root rotates on the wall, white with calcium. A surgeon, an interventionalist, an anaesthetist and a consultant who enjoys arguments sit round a table too small for their opinions. (CT and angiogram are in Results.)' },
    { k: 'say', who: 'karim', text: 'He’s 72, STS under two, with a proximal LAD lesion. Give me ninety minutes: a tissue valve and a LIMA to the LAD. You’re offering a stent with dual antiplatelets — to a man who is already bleeding.' },
    { k: 'say', who: 'selim', text: 'And you’re offering full heparin, a bypass circuit and a sternotomy to a man with acquired von Willebrand. ESC says TAVI at seventy. His femorals are tramlines. Home in three days, not three months.' },
    { k: 'say', who: 'karim', text: 'Home with a pacemaker. Right bundle, three-millimetre membranous septum — that’s near one-in-three.' },
    { k: 'say', who: 'selim', text: 'And your valve fails at 85 — redo sternotomy?' },
    { k: 'say', who: 'karim', text: 'Then your valve goes inside mine. If <i>yours</i> fails at 85, he gets TAVI-in-TAVI with a coronary you may never reach again.' },
    { k: 'say', who: 'anaes', text: 'Paradoxical low flow, small stiff ventricle — they hate induction. I’d sleep better with conscious sedation.' },
    { k: 'say', who: 'layla', text: 'Both of you are right, which is why this meeting exists. Resident — you know what he wants. Vote.' },
    { k: 'q', id: 'tm1', short: 'Heart Team vote', ask: 'What do you recommend for Mr El-Sayed?', opts: [
      ['Transfemoral TAVI with PCI to the LAD — while telling him plainly that SAVR + LIMA is a legitimate alternative', 2, 'Age ≥ 70 with favourable anatomy (2025 ESC/EACTS), Heyde bleeding, a low-flow ventricle that tolerates anaesthesia poorly, and an informed preference. NOTION-3 supports treating a significant proximal LAD. The price — pacemaker risk near 30%, the second valve — discussed, not hidden.'],
      ['SAVR with a bioprosthesis + LIMA–LAD', 1, '<b>Defensible</b>: proven durability, the best conduit, lower pacing risk, clean coronary access. Against it here: bleeding on bypass, longer recovery, and his priorities.'],
      ['Mechanical SAVR — one valve for life', 0, 'Lifelong warfarin in a man bleeding from angiodysplasia; bioprostheses are favoured above 65.'],
      ['Balloon valvuloplasty now, decide later', 0, 'A bridge for the unstable, not a strategy.'],
    ] },
    { k: 'card', title: '♟️ Lifetime management', html: '<ul><li><b>Plan the second valve at the first.</b> SAVR → TAVI-in-SAVR is the most predictable path; TAVI → TAVI-in-TAVI depends on coronary heights, sinus width and commissural alignment.</li><li>His anatomy helps: LM 13 mm, sinuses 32 mm, no LVOT calcium.</li><li>With CAD, a short intra-annular frame keeps the coronary ostia reachable.</li></ul>' },
    { k: 'say', who: 'hassan', text: 'If I choose the catheter, do I walk at the wedding? … Then I’ve been an architect forty-five years. I know when a client has already decided.' },
    { k: 'q', id: 'tm2', short: 'PCI timing', ask: 'TAVI and PCI — in which order?', opts: [
      ['PCI to the proximal LAD first (or same sitting, before deployment), then TAVI', 2, 'A tight proximal LAD is the wrong thing to leave during rapid pacing; coronary access is easiest before the frame. NOTION-3 randomised PCI before or with TAVI.'],
      ['TAVI first, PCI later through the frame', 1, 'Possible; some judge the lesion after the valve. Not ideal with a tight proximal LAD.'],
      ['TAVI only; treat the LAD medically', 1, 'Reasonable for borderline or non-proximal lesions — not this one with exertional angina.'],
      ['PCI now, discharge, TAVI in three months after DAPT', 0, 'Two risks instead of one.'],
    ] },

    /* ---------------- 7 · The night ---------------- */
    { k: 'scene', title: 'Bed 4 — the night before the procedure', t: T(3, 2, 14), icon: '⚡' },
    { k: 'event', fx: { set: { hr: 158, sbp: 78, dbp: 46, spo2: 84, rr: 34, rhythm: 'AF' } }, alarm: 'Bed 4: HR 158 irregular, BP 78/46, SpO₂ 84%', nursing: { by: 'Mariam', cat: 'escalation', text: 'Acutely breathless, grey, clammy. Fast AF on telemetry. Crackles to mid-zones. Resident called.' } },
    { k: 'act', text: 'The alarm is a sound you feel in your teeth. He is bolt upright, grey, clawing at the oxygen mask as if it were the thing stopping him breathing.' },
    { k: 'say', who: 'mariam', text: 'Fast AF, 158. Seventy-eight systolic. Sats 84. He was fine at midnight. Your orders — now.' },
    { k: 'card', title: '⚙️ Why AF is a catastrophe here', tone: 'burn', html: '<p>A thick, stiff ventricle depends on the atrial kick for <b>up to 40% of its filling</b>. Fast AF removes the kick and shortens diastole: filling collapses, LA pressure rockets, output falls through a fixed orifice, coronary perfusion falls, the ventricle stiffens further.</p>' },
    { k: 'crisis', id: 'af', title: 'Unstable fast AF', window: 8, par: 4, pts: 20, resolve: ['dccv'], ask: 'Unstable fast AF with pulmonary oedema. Treat him from the Orders tab — every order costs time.', why: 'Haemodynamically unstable AF → synchronised DC cardioversion (with brief, gentle sedation).',
      success: { set: { hr: 84, sbp: 88, dbp: 54, spo2: 90, rr: 28, rhythm: 'SR' } }, successSay: ['mariam', 'Sinus! 84. But he’s still only 88 systolic and still wet.'],
      fail: { set: { hr: 40, sbp: 50, dbp: 30, spo2: 78, rhythm: 'SR' } }, failSay: ['layla', 'I heard the alarm from the corridor. Pads, shock — now. He nearly arrested while we waited.'] },
    { k: 'event', flag: { afFixed: true } },
    { k: 'crisis', id: 'bp', title: 'Hypotension after cardioversion', window: 10, par: 4, pts: 15, resolve: ['phenyl', 'norad', 'dobut'], best: ['phenyl', 'norad'], ask: 'Sinus rhythm, BP 88/54, still in pulmonary oedema. Support the pressure.', why: 'In AS the target is coronary perfusion pressure: an α-agonist raises diastolic pressure; keep sinus rhythm and preload.',
      success: { set: { hr: 78, sbp: 108, dbp: 64, spo2: 92, rr: 24 } }, outcomes: { dobut: { set: { hr: 112, sbp: 96, dbp: 50, spo2: 91, rr: 26 } } }, successSay: ['mariam', 'Up to a hundred and eight. That’s better.'],
      fail: { set: { sbp: 70, dbp: 40, spo2: 86 } }, failSay: ['layla', 'Phenylephrine, a hundred micrograms. In stenosis you buy perfusion pressure first, then you think.'] },
    { k: 'task', id: 'night', short: 'Finish stabilising', pts: 10, ask: 'Pressure held. Finish the job: breathing support, cautious offloading, and the new AF.', need: ['o:cpap', 'o:furo_iv', 'o:heparin'], missedWhy: 'CPAP, a small dose of IV furosemide once pressure is held, and anticoagulation for new AF.' },
    { k: 'say', who: 'layla', text: 'He just told us his reserve: none. What does that do to this morning’s list?' },
    { k: 'q', id: 'ev3', short: 'After decompensation', ask: 'What happens to the plan?', opts: [
      ['First on the list: urgent TAVI + LAD PCI this morning, heparin for the AF, CCU until then', 2, 'Decompensation is the indication, not a contraindication. Every hour in this state risks another loop.'],
      ['Balloon valvuloplasty as a bridge, TAVI in weeks', 1, 'A fair rescue where urgent TAVI isn’t available — his work-up is done.'],
      ['Postpone two weeks to optimise with diuretics and beta-blockers', 0, 'There is no medical optimisation of a fixed obstruction.'],
      ['Emergency SAVR tonight', 1, 'Possible in surgical centres, but operative risk after cardiogenic oedema is far higher than yesterday’s STS.'],
    ] },

    /* ---------------- 8 · The procedure and its aftermath ---------------- */
    { k: 'scene', title: 'Hybrid lab — TAVI + PCI', t: T(3, 8, 40), icon: '🛠️' },
    { k: 'event', fx: { set: { hr: 80, sbp: 126, dbp: 66, spo2: 96, rr: 18, rhythm: 'SR' } }, note: { by: 'Dr S. Nassar', role: 'Interventionalist', title: 'Procedure note', text: 'Conscious sedation. DES to proximal LAD. 26 mm balloon-expandable TAVI, transfemoral, deployed high under rapid pacing. Mean gradient 34 → 6 mmHg. No PVL. Transient new LBBB on RBBB at deployment, resolved. Temporary RV wire placed.' } },
    { k: 'act', text: 'A stent in the proximal LAD. Then a 26 mm valve, deployed high under rapid pacing. The gradient falls from 34 to 6. He sleeps through the most important ten seconds of his year.' },
    { k: 'say', who: 'selim', text: 'Valve’s perfect. A few beats of new left bundle on top of his right bundle at deployment, then back to RBBB. I don’t like that septum.' },
    { k: 'q', id: 'ev4', short: 'The temporary wire', ask: 'Baseline RBBB, PR 210, short membranous septum, transient conduction change. The temporary wire?', opts: [
      ['Leave it in, secured, back-up pacing at 40/min, telemetry for at least 24–48 h', 2, 'Pre-existing RBBB is the strongest predictor of high-grade AV block after TAVI — and it can be delayed by hours to days.', null, { wire: true }],
      ['Remove it — sinus rhythm, stable conduction', 0, 'The decision that turns a manageable event at 15:00 into a cardiac-arrest call.'],
      ['Implant a permanent pacemaker before he leaves the lab', 1, 'Not recommended on RBBB alone: many never need it, and pacing has its own costs.', null, { ppm: true }],
      ['Remove it and rely on transcutaneous pads', 1, 'Pads are a bridge of minutes and capture unreliably.'],
    ] },
    { k: 'scene', title: 'CCU — the same afternoon', t: T(3, 15, 20), icon: '🚨' },
    { k: 'event', if: s => !s.flags.ppm, fx: { set: { hr: 32, sbp: 82, dbp: 40, spo2: 94, rr: 20, rhythm: 'CHB' } }, alarm: 'CCU 3: HR 32, complete heart block, BP 82/40', flag: { chb: true } },
    { k: 'say', who: 'dina', if: s => !s.flags.ppm, text: 'Baba? BABA?' },
    { k: 'say', who: 'mariam', if: s => !s.flags.ppm, text: 'P waves marching at eighty, broad complexes at thirty-two. Pressure eighty-two. He’s clammy.' },
    { k: 'crisis', id: 'chb', if: s => !s.flags.ppm, title: 'Complete heart block', window: 6, par: 2, pts: 20, resolve: ['pace_up', 'tcp'], best: s => (s.flags.wire ? ['pace_up'] : ['tcp']), ask: 'Complete heart block with hypotension, six hours after TAVI. Act from the Orders tab.', why: 'Infra-nodal block after TAVI: pace. Use the wire if you kept it; atropine will not work.',
      success: { set: { hr: 72, sbp: 118, dbp: 62, spo2: 97, rr: 18, rhythm: 'V-paced' } }, outcomes: { tcp: { set: { hr: 70, sbp: 104, dbp: 58, spo2: 96, rr: 22, rhythm: 'Paced (external)' } } }, successSay: ['mariam', 'Capture on every spike — and a pulse with each. His colour’s coming back.'],
      fail: { set: { hr: 0, sbp: 0, dbp: 0, spo2: 70, rhythm: 'VF' } }, failSay: ['layla', 'He went into VF waiting. One shock, then pacing. He’s back — and he’s lucky.'] },
    { k: 'say', who: 'hassan', if: s => !s.flags.ppm, text: '…What did I miss? Did she put my brother at table one?' },
    { k: 'q', id: 'ev6', if: s => !s.flags.ppm, short: 'Permanent pacing', ask: 'Next morning he is still in complete heart block under the pacing. When does he get a permanent pacemaker?', opts: [
      ['Now: complete or high-grade AV block persisting 24–48 h after TAVI is a Class I indication — dual-chamber, ideally conduction-system pacing', 2, '2021 ESC pacing guidelines. With a hypertrophied LV and a high expected pacing burden, prefer physiological (left bundle branch area) pacing.'],
      ['Wait seven days, as after cardiac surgery', 0, 'After TAVI the window is 24–48 h; a week of a temporary wire means infection, perforation and delirium.'],
      ['Discharge with an ambulatory monitor', 0, 'That pathway is for new LBBB with stable PR/QRS — not complete heart block.'],
      ['Single-chamber VVI — simpler', 1, 'Keeps him alive but loses the atrial kick his stiff ventricle needs.'],
    ] },
    { k: 'task', id: 'ppm', if: s => !s.flags.ppm, short: 'Book the pacemaker', pts: 5, ask: 'Order it.', need: ['o:ppm'] },
    { k: 'event', t: T(4, 16, 0), fx: { set: { hr: 70, sbp: 126, dbp: 70, spo2: 98, rr: 16, rhythm: 'A-sense V-pace' } }, note: { by: 'EP team', role: 'Electrophysiology', title: 'Device implant', text: 'Dual-chamber pacemaker with left bundle branch area lead. Thresholds satisfactory.' } },
    { k: 'act', text: 'Day 5: he walks the corridor twice. The melaena has stopped. (Repeat the FBC if you want to see it.)' },

    /* ---------------- 9 · Discharge ---------------- */
    { k: 'scene', title: 'Bed 4 — discharge day', t: T(6, 10, 0), icon: '🏠' },
    { k: 'say', who: 'layla', text: 'New valve, new stent, new pacemaker, paroxysmal AF and a gut that bled last week. Write me a discharge prescription that doesn’t kill him from either direction.' },
    { k: 'q', id: 'hm1', short: 'Antithrombotic plan', ask: 'TAVI + DES to the LAD + AF (CHA₂DS₂-VA 3) + recent GI bleeding. The plan?', opts: [
      ['A DOAC plus clopidogrel — no aspirin — for a short period (1–3 months given bleeding risk), then the DOAC alone; PPI', 2, 'AF needs anticoagulation; the stent needs a P2Y12 inhibitor; aspirin on top mainly buys bleeding. After TAVI with an OAC indication, OAC alone beat OAC + clopidogrel (POPular TAVI B) — the clopidogrel is for the stent, so keep it brief.'],
      ['Aspirin alone for life — standard after TAVI', 0, 'Right for TAVI without another indication (POPular TAVI A). He has AF and a new stent.'],
      ['Triple therapy for six months', 0, 'Maximum bleeding for no ischaemic gain.'],
      ['Warfarin, INR 2.5', 1, 'Works, but DOACs bleed less intracranially. (ENVISAGE-TAVI: more bleeding with edoxaban than VKA — choose and dose carefully.)'],
    ] },
    { k: 'task', id: 'tto', short: 'Discharge prescription', pts: 15, ask: 'Write the discharge prescription in the chart: start what he needs, stop what he must not take home.', need: ['o:apix', 'o:clopi', 'o:ppi', 's:heparin', 's:enox', 'n:aspirin', 'n:ibu'], missedWhy: 'Apixaban + clopidogrel + PPI; stop the heparin infusion and prophylactic enoxaparin; no aspirin, no NSAID.' },
    { k: 'q', id: 'hm2', multi: true, short: 'Discharge plan', ask: 'What else goes in the discharge plan? Select all that belong.', opts: [
      ['Baseline echo before discharge and at 30 days, then yearly', 1, 'The reference for every future question about this valve.'],
      ['Pacemaker check at 4–6 weeks; wound care; no driving until cleared', 1, ''],
      ['Hb and ferritin in 4 weeks; vWF result review; outpatient colonoscopy', 1, 'Confirm the bleeding has stopped and exclude a second cause.'],
      ['Dental hygiene and antibiotic prophylaxis before high-risk dental procedures', 1, 'A prosthetic valve is a high-risk substrate for endocarditis (ESC 2023).'],
      ['Cardiac rehabilitation — and a clear answer about the wedding', 1, 'Five weeks. He walks.'],
      ['Restart ibuprofen for the knees', 0, 'With an anticoagulant and clopidogrel — no.'],
      ['Restart amlodipine 10 mg and ramipril at previous doses without review', 0, 'Re-titrate against today’s pressure.'],
    ] },
    { k: 'act', text: 'Five weeks later a photograph arrives on the ward group from an unknown number: a man in a grey suit, a small bulge under his left collarbone, walking a bride down an aisle. He is not out of breath. Mariam pins it above bed 4.' },
    { k: 'card', title: '🔥 Burn these in', tone: 'burn', html: '<ul><li><b>Exertional syncope + slow pulse + single S2</b> is AS. No vasodilators until you know.</li><li><b>Gradient depends on flow.</b> Small area, low gradient, preserved EF → paradoxical LF-LG; CT calcium arbitrates (≥ 2,000 ♂ / 1,200 ♀).</li><li><b>Anaemia in AS is a question</b> — think Heyde; the valve is the cure.</li><li><b>TAVI vs SAVR is a lifetime plan</b>: age (ESC 70 / ACC 65–80), anatomy, CAD, bleeding, conduction, the second valve — and what the patient wants.</li><li><b>AF in AS: electricity, then pressors.</b> Never beta-block or vasodilate a crashing fixed-output heart.</li><li><b>RBBB before TAVI = keep the wire.</b> Persistent block at 24–48 h = pacemaker.</li><li><b>Antithrombotics are subtracted, not added.</b></li></ul>' },
    { k: 'card', title: '📚 Sources', html: '<ul><li>2025 ESC/EACTS Guidelines for valvular heart disease · 2020 ACC/AHA VHD Guideline</li><li>PARTNER 3 (5 y) · Evolut Low Risk · NOTION (10 y) · DEDICATE-DZHK6 · UK TAVI</li><li>EARLY TAVR · AVATAR · RECOVERY · EVOLVED</li><li>NOTION-3 · ACTIVATION · POPular TAVI A &amp; B · ENVISAGE-TAVI AF</li><li>2021 ESC cardiac pacing · 2024 ESC AF · 2023 ESC endocarditis</li><li>Vincentelli et al., NEJM 2003 (acquired vWD in AS)</li></ul><p class="mono">Composite teaching case. Trial figures rounded — check primary sources and local protocols.</p>' },
  ],
};
