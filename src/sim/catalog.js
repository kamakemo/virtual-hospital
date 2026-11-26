/* ============================================================
   ORDER CATALOGUE — shared by every simulated case.
   delay: minutes until a result is available (investigations).
   A case decides what each result says and what each order does.
   ============================================================ */

export const CATS = [
  ['inv', '🧪 Investigations'],
  ['img', '🖥️ Imaging & cardiac tests'],
  ['med', '💊 Medications'],
  ['acute', '⚡ Acute & resuscitation'],
  ['proc', '🛠️ Procedures & referrals'],
  ['nurse', '🩺 Nursing & monitoring'],
];

const I = (id, name, delay, extra = {}) => ({ id, name, cat: 'inv', delay, ...extra });
const G = (id, name, delay, extra = {}) => ({ id, name, cat: 'img', delay, ...extra });
const M = (id, name, dose, route, freq, extra = {}) => ({ id, name, cat: 'med', dose, route, freq, ...extra });
const A = (id, name, dose, route, extra = {}) => ({ id, name, cat: 'acute', dose, route, freq: 'STAT', stat: true, ...extra });
const P = (id, name, delay, extra = {}) => ({ id, name, cat: 'proc', delay, ...extra });
const N = (id, name, extra = {}) => ({ id, name, cat: 'nurse', ...extra });

export const CATALOG = [
  I('ecg', '12-lead ECG', 5),
  I('trop', 'hs-Troponin T', 60, { repeatable: true }),
  I('fbc', 'Full blood count', 40, { repeatable: true }),
  I('ue', 'Urea, creatinine & electrolytes', 40, { repeatable: true }),
  I('coag', 'Coagulation screen (INR, aPTT)', 40),
  I('bnp', 'NT-proBNP', 60),
  I('iron', 'Ferritin & iron studies', 240),
  I('fit', 'Faecal immunochemical test (FIT)', 600),
  I('vbg', 'Venous blood gas + lactate', 5, { repeatable: true }),
  I('gs', 'Group & save / crossmatch', 30),
  I('vwf', 'von Willebrand factor multimers & PFA-100', 2880),
  I('tft', 'Thyroid function', 120),
  G('cxr', 'Chest X-ray', 40),
  G('pocus', 'Bedside focused echo (POCUS)', 10),
  G('tte', 'Formal transthoracic echo', 120),
  G('ctca', 'CT aortic valve calcium score', 180),
  G('dse', 'Low-dose dobutamine stress echo', 240),
  G('cttavi', 'CT TAVI protocol (annulus, coronaries, access)', 300),
  G('angio', 'Invasive coronary angiography', 360),
  G('ctbrain', 'CT head', 45),
  M('gtn', 'Glyceryl trinitrate spray', '400 µg', 'SL', 'PRN'),
  M('amlo', 'Amlodipine', '10 mg', 'PO', 'od'),
  M('ramipril', 'Ramipril', '5 mg', 'PO', 'od'),
  M('ibu', 'Ibuprofen', '400 mg', 'PO', 'tds'),
  M('para', 'Paracetamol', '1 g', 'PO', 'qds PRN'),
  M('enox', 'Enoxaparin (prophylaxis)', '40 mg', 'SC', 'od'),
  M('ppi', 'Pantoprazole', '40 mg', 'PO', 'od'),
  M('statin', 'Atorvastatin', '40 mg', 'PO', 'nocte'),
  M('ivfe', 'Ferric carboxymaltose (IV iron)', '1,000 mg', 'IV over 15 min', 'once'),
  M('aspirin', 'Aspirin', '75 mg', 'PO', 'od'),
  M('aspload', 'Aspirin loading dose', '300 mg', 'PO', 'STAT'),
  M('ticag', 'Ticagrelor loading dose', '180 mg', 'PO', 'STAT'),
  M('clopi', 'Clopidogrel', '75 mg', 'PO', 'od'),
  M('apix', 'Apixaban', '5 mg', 'PO', 'bd'),
  M('warf', 'Warfarin (target INR 2–3)', 'per INR', 'PO', 'od'),
  M('heparin', 'Unfractionated heparin infusion', 'per protocol', 'IV', 'continuous'),
  M('bisop', 'Bisoprolol', '2.5 mg', 'PO', 'od'),
  M('furo_po', 'Furosemide', '40 mg', 'PO', 'od'),
  A('o2', 'Oxygen — titrate to SpO₂ 94–98%', 'titrate', 'mask'),
  A('cpap', 'CPAP / non-invasive ventilation', 'PEEP 7.5 cmH₂O', 'face mask'),
  A('sedate', 'Procedural sedation (etomidate)', '0.1 mg/kg', 'IV'),
  A('dccv', 'Synchronised DC cardioversion', '150–200 J biphasic', 'pads AP'),
  A('metop', 'Metoprolol', '5 mg', 'IV'),
  A('amio', 'Amiodarone', '300 mg over 1 h', 'IV'),
  A('furo_iv', 'Furosemide', '40 mg', 'IV'),
  A('gtn_inf', 'GTN infusion', '10–200 µg/min', 'IV'),
  A('fluid', 'Crystalloid bolus', '1,000 mL', 'IV'),
  A('fluid250', 'Crystalloid bolus', '250 mL', 'IV'),
  A('phenyl', 'Phenylephrine', '100 µg boluses', 'IV'),
  A('norad', 'Noradrenaline infusion', '0.05 µg/kg/min', 'IV (central/large vein)'),
  A('dobut', 'Dobutamine infusion', '5 µg/kg/min', 'IV'),
  A('atropine', 'Atropine', '600 µg', 'IV'),
  A('iso', 'Isoprenaline infusion', '1–10 µg/min', 'IV'),
  A('pace_up', 'Temporary pacing wire — pace VVI 70/min', 'output 5 mA', 'existing wire', { requires: 'wire' }),
  A('tcp', 'Transcutaneous pacing', 'rate 70, titrate mA to capture', 'pads'),
  A('transfuse', 'Red cell transfusion', '1 unit over 3 h', 'IV'),
  P('cardio', 'Cardiology review', 30),
  P('surg', 'Cardiac surgery referral', 120),
  P('gi', 'Gastroenterology referral', 240),
  P('heartteam', 'Heart Team (MDT) discussion', 600),
  P('ppm', 'Permanent pacemaker implantation', 240),
  P('bav', 'Balloon aortic valvuloplasty', 120),
  N('tele', 'Continuous telemetry'),
  N('obs4', '4-hourly observations + NEWS2'),
  N('nobp', 'Alert: no vasodilators / no PRN antihypertensives'),
  N('falls', 'Falls precautions, supervised mobilisation'),
  N('fluidbal', 'Strict fluid balance & daily weight'),
  N('stool', 'Stool chart — report melaena'),
];

export const CAT_BY_ID = Object.fromEntries(CATALOG.map(c => [c.id, c]));
