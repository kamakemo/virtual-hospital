/* ============================================================
   THE CURRICULUM
   One hospital, two departments, twenty-eight units.

   A unit is the teaching atom: it owns a slice of the curriculum,
   a set of cases, and a library shelf. `legacy` is the department
   id the 2025 build used, which is still the value stored in
   `cases.department` and `library_items.department` — so units
   inherit their existing content with no database migration.

   Units with `legacy: null` are defined but not yet stocked; they
   exist so the curriculum is complete and visible, and so content
   has somewhere to land.
   ============================================================ */

export const HOSPITAL = {
  name: 'Virtual Teaching Hospital',
  short: 'VTH',
  tagline: 'Clinical reasoning, one patient at a time',
};

/* A restrained set of hues — muted, print-like, never neon. Each unit
   takes one as a 3px edge on its panel; nothing else is coloured. */
export const HUE = {
  teal:    '#0E6B7A',
  indigo:  '#3B4E8C',
  plum:    '#6B3F6B',
  clay:    '#A8542F',
  moss:    '#4A6B3A',
  ochre:   '#8A6A1F',
  slate:   '#4A5B66',
  rust:    '#9B3B2F',
  crimson: '#A32F3A',
  sea:     '#1C6B5E',
};

export const DEPARTMENTS = [
  {
    id: 'cardiology',
    label: 'Cardiology',
    kicker: 'Department of',
    blurb:
      'From the front door to the cath lab: ischaemia, failure, rhythm, structure and the vessels that carry it all.',
    units: [
      {
        id: 'cv-ed',
        legacy: 'cv-ed',
        label: 'Emergency & Acute Chest Pain',
        short: 'Emergency',
        hue: HUE.crimson,
        ward: true,
        blurb: 'The front door. Rule-out pathways, the time-critical mimics, and the arrest.',
        topics: [
          'Chest pain triage and risk scores (HEART, TIMI, GRACE)',
          'High-sensitivity troponin rule-out algorithms',
          'ACS versus the mimics',
          'Acute aortic syndromes',
          'Pulmonary embolism in the ED',
          'Pericarditis, effusion and tamponade',
          'Hypertensive emergency',
          'Syncope: risk stratification and disposition',
          'Cardiac arrest and advanced life support',
        ],
      },
      {
        id: 'cv-ccu',
        legacy: 'cv-ccu',
        label: 'Coronary Care & ACS',
        short: 'Coronary Care',
        hue: HUE.rust,
        ward: true,
        blurb: 'STEMI to shock. Reperfusion decisions and the first forty-eight hours.',
        topics: [
          'STEMI: diagnosis and reperfusion strategy',
          'NSTEMI and unstable angina',
          'Antiplatelet and anticoagulation regimens',
          'Fibrinolysis versus primary PCI',
          'Cardiogenic shock and mechanical support',
          'Mechanical complications of infarction',
          'Peri-infarct arrhythmia',
          'Secondary prevention and discharge planning',
        ],
      },
      {
        id: 'cv-hf',
        legacy: 'cv-hf',
        label: 'Heart Failure',
        short: 'Heart Failure',
        hue: HUE.plum,
        ward: true,
        blurb: 'Congestion, perfusion and the four pillars — acute decompensation through advanced therapy.',
        topics: [
          'HFrEF, HFmrEF and HFpEF: definitions that change management',
          'Acute decompensated heart failure',
          'Diuretic strategy and resistance',
          'The four pillars: ARNI, beta-blocker, MRA, SGLT2',
          'Device therapy in heart failure',
          'Advanced heart failure, LVAD and transplant',
          'Cardiorenal syndrome',
          'Palliative care in end-stage heart failure',
        ],
      },
      {
        id: 'cv-cath',
        legacy: 'cv-cath',
        label: 'Interventional Cardiology',
        short: 'Cath Lab',
        hue: HUE.clay,
        ward: true,
        blurb: 'The lab: access, anatomy, physiology and the complication you have to own.',
        topics: [
          'Diagnostic coronary angiography and projections',
          'Vascular access and access-site complications',
          'PCI technique, stents and lesion preparation',
          'Dual antiplatelet therapy duration',
          'Left main and multivessel disease',
          'Chronic total occlusion',
          'Physiology: FFR and iFR',
          'Intracoronary imaging: IVUS and OCT',
          'Primary PCI pathways and door-to-balloon',
          'Contrast nephropathy and radiation safety',
        ],
      },
      {
        id: 'cv-valve',
        legacy: 'cv-valve',
        label: 'Valvular & Structural',
        short: 'Structural',
        hue: HUE.indigo,
        ward: true,
        blurb: 'Severity, symptoms, timing of intervention — and the transcatheter alternative.',
        topics: [
          'Aortic stenosis: grading and timing of intervention',
          'Aortic regurgitation',
          'Mitral stenosis and rheumatic valve disease',
          'Primary and secondary mitral regurgitation',
          'Tricuspid regurgitation',
          'Prosthetic valves and anticoagulation',
          'TAVI: selection and complications',
          'Transcatheter mitral and tricuspid repair',
          'ASD, VSD and PFO closure',
          'Left atrial appendage occlusion',
        ],
      },
      {
        id: 'cv-ep',
        legacy: 'cv-ep',
        label: 'Electrophysiology & Arrhythmia',
        short: 'EP Lab',
        hue: HUE.ochre,
        ward: true,
        blurb: 'Rate, rhythm, conduction and the devices that take over when they fail.',
        topics: [
          'Atrial fibrillation: rate, rhythm and stroke prevention',
          'Atrial flutter and atrial tachycardia',
          'Supraventricular tachycardia and pre-excitation',
          'Ventricular tachycardia and VF',
          'Inherited channelopathies: LQTS, Brugada, CPVT',
          'Bradyarrhythmia and conduction block',
          'Pacemakers: modes and troubleshooting',
          'ICD and CRT: indications and follow-up',
          'Catheter ablation',
          'Survivors of sudden cardiac death',
        ],
      },
      {
        id: 'cv-imaging',
        legacy: 'cv-imaging',
        label: 'Cardiac Imaging & Diagnostics',
        short: 'Imaging',
        hue: HUE.sea,
        ward: true,
        blurb: 'Reading the heart: the ECG upward through echo, CT, MRI and the cath haemodynamics.',
        topics: [
          'Systematic ECG interpretation',
          'Transthoracic and transoesophageal echo',
          'Stress testing: exercise, pharmacologic, imaging',
          'Cardiac CT and calcium scoring',
          'Cardiac MRI and tissue characterisation',
          'Nuclear perfusion imaging',
          'Invasive haemodynamics and pressure tracings',
          'Ambulatory rhythm monitoring',
          'Choosing the right test: appropriate use',
        ],
      },
      {
        id: 'cv-prevent',
        legacy: 'cv-clinic',
        label: 'Preventive & Outpatient Cardiology',
        short: 'Prevention',
        hue: HUE.moss,
        ward: true,
        blurb: 'The long game — risk estimation, lipids, pressure and the clinic conversation.',
        topics: [
          'Cardiovascular risk estimation',
          'Lipid management: statins, ezetimibe, PCSK9',
          'Hypertension in the clinic',
          'Diabetes and cardiovascular risk',
          'Smoking cessation',
          'Obesity and metabolic risk',
          'Exercise prescription and cardiac rehabilitation',
          'Adherence and the follow-up consultation',
        ],
      },
      {
        id: 'cv-htn-vasc',
        legacy: null,
        label: 'Hypertension & Vascular Disease',
        short: 'Vascular',
        hue: HUE.slate,
        ward: true,
        blurb: 'Pressure, aorta and peripheral circulation — the whole vascular tree.',
        topics: [
          'Primary hypertension: assessment and targets',
          'Secondary hypertension: when to look',
          'Resistant hypertension',
          'Renal artery stenosis',
          'Aortic aneurysm: surveillance and repair',
          'Acute aortic dissection',
          'Peripheral arterial disease and critical limb ischaemia',
          'Carotid disease',
          'Chronic venous disease and lymphoedema',
        ],
      },
      {
        id: 'cv-myo',
        legacy: null,
        label: 'Cardiomyopathy & Myopericardial Disease',
        short: 'Myopericardial',
        hue: HUE.plum,
        ward: true,
        blurb: 'When the muscle or the sac is the disease, not the vessel.',
        topics: [
          'Hypertrophic cardiomyopathy',
          'Dilated cardiomyopathy',
          'Arrhythmogenic right ventricular cardiomyopathy',
          'Cardiac amyloidosis',
          'Cardiac sarcoidosis and iron overload',
          'Myocarditis',
          'Acute and recurrent pericarditis',
          'Constrictive pericarditis versus restriction',
          'Pericardial tamponade',
          'Takotsubo and peripartum cardiomyopathy',
        ],
      },
      {
        id: 'cv-chd',
        legacy: null,
        label: 'Congenital & Adult CHD',
        short: 'Congenital',
        hue: HUE.indigo,
        ward: true,
        blurb: 'Grown-up congenital hearts: the repaired, the palliated and the newly found.',
        topics: [
          'Shunt lesions: ASD, VSD, PDA',
          'Coarctation of the aorta',
          'Repaired tetralogy of Fallot',
          'Transposition and the arterial switch',
          'Eisenmenger physiology',
          'Fontan circulation',
          'Pregnancy in congenital heart disease',
          'Transition from paediatric to adult care',
        ],
      },
      {
        id: 'cv-ph',
        legacy: null,
        label: 'Pulmonary Hypertension & Right Heart',
        short: 'Right Heart',
        hue: HUE.sea,
        ward: true,
        blurb: 'The forgotten ventricle and the circulation it serves.',
        topics: [
          'Pulmonary hypertension classification',
          'Pulmonary arterial hypertension therapy',
          'Chronic thromboembolic pulmonary hypertension',
          'Acute right ventricular failure',
          'Cor pulmonale',
          'Right heart catheterisation and interpretation',
        ],
      },
      {
        id: 'cv-infect',
        legacy: null,
        label: 'Endocarditis & Inflammatory Heart Disease',
        short: 'Endocarditis',
        hue: HUE.rust,
        ward: true,
        blurb: 'Infection and inflammation on the valves, the device and the myocardium.',
        topics: [
          'Infective endocarditis: the modified Duke criteria',
          'Organism-directed therapy',
          'Surgical indications and timing',
          'Endocarditis prophylaxis',
          'Cardiac device infection',
          'Acute rheumatic fever and rheumatic heart disease',
          'Cardiac involvement in systemic inflammatory disease',
        ],
      },
      {
        id: 'cv-special',
        legacy: null,
        label: 'Special Populations & Cardio-Oncology',
        short: 'Special Populations',
        hue: HUE.ochre,
        ward: true,
        blurb: 'The same heart in pregnancy, in cancer therapy, in sport and in old age.',
        topics: [
          'Pregnancy and heart disease',
          'Cardiotoxicity of cancer therapy',
          'Sports cardiology and pre-participation screening',
          'Geriatric cardiology and frailty',
          'Perioperative cardiovascular assessment',
          'Cardiovascular disease in chronic kidney disease',
        ],
      },
    ],
  },

  {
    id: 'internal',
    label: 'Internal Medicine',
    kicker: 'Department of',
    blurb:
      'The whole of general medicine: organ by organ, plus the cross-cutting units — infection, poisoning, ageing and the end of life.',
    units: [
      {
        id: 'im-resp',
        legacy: 'im-resp',
        label: 'Respiratory Medicine',
        short: 'Respiratory',
        hue: HUE.sea,
        ward: true,
        blurb: 'Obstruction, infection, infiltration and the failing gas exchange.',
        topics: [
          'Asthma: control, exacerbation and near-fatal attack',
          'COPD and acute exacerbation',
          'Community- and hospital-acquired pneumonia',
          'Tuberculosis',
          'Bronchiectasis and cystic fibrosis in adults',
          'Interstitial lung disease',
          'Sarcoidosis',
          'Pleural effusion and empyema',
          'Pneumothorax',
          'Pulmonary embolism',
          'Obstructive sleep apnoea',
          'Lung cancer',
          'Acute and chronic respiratory failure',
        ],
      },
      {
        id: 'im-icu',
        legacy: 'im-icu',
        label: 'Critical Care',
        short: 'Critical Care',
        hue: HUE.crimson,
        ward: true,
        blurb: 'Organ support when physiology fails — and the decisions that come with it.',
        topics: [
          'Sepsis and septic shock',
          'ARDS and lung-protective ventilation',
          'Modes of mechanical ventilation and weaning',
          'Shock states and haemodynamic assessment',
          'Vasoactive and inotropic support',
          'Sedation, analgesia and delirium',
          'Acute kidney injury and renal replacement in ICU',
          'Nutrition in critical illness',
          'Metabolic crises: DKA, thyroid storm, adrenal crisis',
          'Neurocritical care and intracranial pressure',
          'Post-cardiac-arrest care',
          'Withdrawal of treatment and end-of-life in ICU',
        ],
      },
      {
        id: 'im-neph',
        legacy: 'im-neph',
        label: 'Nephrology, Fluids & Electrolytes',
        short: 'Nephrology',
        hue: HUE.indigo,
        ward: true,
        blurb: 'Filtration, balance and the arithmetic of sodium, potassium and acid.',
        topics: [
          'Acute kidney injury',
          'Chronic kidney disease and its complications',
          'Glomerulonephritis',
          'Nephrotic syndrome',
          'Dialysis and transplantation',
          'Sodium disorders: hypo- and hypernatraemia',
          'Potassium, calcium, magnesium and phosphate',
          'Acid–base disorders',
          'Nephrolithiasis',
          'Renovascular disease',
          'Kidney disease in pregnancy',
        ],
      },
      {
        id: 'im-endo',
        legacy: 'im-endo',
        label: 'Endocrinology & Metabolism',
        short: 'Endocrinology',
        hue: HUE.ochre,
        ward: true,
        blurb: 'Axes, feedback loops and the emergencies that follow when they break.',
        topics: [
          'Type 1 diabetes and insulin strategy',
          'Type 2 diabetes and modern agents',
          'DKA and hyperosmolar hyperglycaemic state',
          'Hypoglycaemia',
          'Hyperthyroidism and thyroid storm',
          'Hypothyroidism and myxoedema',
          'Thyroid nodule and thyroid cancer',
          'Adrenal insufficiency and Cushing syndrome',
          'Phaeochromocytoma',
          'Pituitary disease and hypopituitarism',
          'Calcium and metabolic bone disease',
          'Obesity and metabolic syndrome',
          'Reproductive endocrinology',
        ],
      },
      {
        id: 'im-git',
        legacy: 'im-git',
        label: 'Gastroenterology & Hepatology',
        short: 'GI & Liver',
        hue: HUE.moss,
        ward: true,
        blurb: 'Gut, liver and pancreas — bleeding, inflammation and failure.',
        topics: [
          'Upper gastrointestinal bleeding',
          'Lower gastrointestinal bleeding',
          'GORD and peptic ulcer disease',
          'Inflammatory bowel disease',
          'Coeliac disease and malabsorption',
          'Irritable bowel syndrome',
          'Jaundice and abnormal liver tests',
          'Viral hepatitis',
          'Alcohol-related liver disease',
          'Metabolic dysfunction-associated steatotic liver disease',
          'Cirrhosis and its complications',
          'Acute liver failure',
          'Acute and chronic pancreatitis',
          'Gastrointestinal malignancy',
          'Dysphagia',
        ],
      },
      {
        id: 'im-neuro',
        legacy: 'im-neuro',
        label: 'Neurology',
        short: 'Neurology',
        hue: HUE.plum,
        ward: true,
        blurb: 'Localise the lesion, then treat the clock.',
        topics: [
          'Ischaemic stroke and TIA',
          'Intracerebral and subarachnoid haemorrhage',
          'Seizures and epilepsy',
          'Status epilepticus',
          'Headache and the dangerous causes',
          'Multiple sclerosis and demyelination',
          "Parkinson's disease and movement disorders",
          'Dementia and cognitive assessment',
          'Peripheral neuropathy',
          'Myasthenia gravis and neuromuscular junction disorders',
          'Myopathy',
          'CNS infection: meningitis and encephalitis',
          'Spinal cord syndromes',
          'Vertigo and the dizzy patient',
        ],
      },
      {
        id: 'im-rheum',
        legacy: 'im-rheum',
        label: 'Rheumatology & Immunology',
        short: 'Rheumatology',
        hue: HUE.clay,
        ward: true,
        blurb: 'Autoimmunity, inflammation and the immune system that under- or over-shoots.',
        topics: [
          'Rheumatoid arthritis',
          'Systemic lupus erythematosus',
          'Antiphospholipid syndrome',
          "Sjögren syndrome",
          'Systemic sclerosis',
          'Idiopathic inflammatory myopathy',
          'ANCA-associated vasculitis',
          'Giant cell arteritis and polymyalgia',
          'Spondyloarthritis',
          'Gout and calcium pyrophosphate disease',
          'Osteoarthritis',
          'Fibromyalgia and chronic widespread pain',
          'Primary immunodeficiency in adults',
          'Anaphylaxis and drug allergy',
          'Biologic and targeted therapy: use and risks',
        ],
      },
      {
        id: 'im-hemonc',
        legacy: 'im-hemonc',
        label: 'Haematology & Oncology',
        short: 'Haem/Onc',
        hue: HUE.rust,
        ward: true,
        blurb: 'Counts, clots, marrow and malignancy — plus the emergencies of cancer care.',
        topics: [
          'Anaemia: a structured approach',
          'Haemolytic anaemia',
          'Sickle cell disease and thalassaemia',
          'Thrombocytopenia and platelet disorders',
          'Bleeding disorders and coagulopathy',
          'Venous thromboembolism and anticoagulation',
          'Acute leukaemia',
          'Chronic leukaemia and myeloproliferative neoplasms',
          'Lymphoma',
          'Myeloma and plasma cell disorders',
          'Bone marrow failure and transplantation',
          'Transfusion medicine and its reactions',
          'Solid tumours: principles of systemic therapy',
          'Oncological emergencies',
          'Febrile neutropenia',
        ],
      },
      {
        id: 'im-id',
        legacy: null,
        label: 'Infectious Diseases',
        short: 'Infection',
        hue: HUE.sea,
        ward: true,
        blurb: 'Find the source, name the organism, choose the narrowest drug that works.',
        topics: [
          'Sepsis recognition and source control',
          'Antimicrobial stewardship and resistance',
          'HIV: diagnosis, therapy and opportunistic infection',
          'Tuberculosis, latent and active',
          'Malaria and tropical infection',
          'Fever in the returning traveller',
          'Meningitis and encephalitis',
          'Osteomyelitis and septic arthritis',
          'Skin and soft tissue infection',
          'Urinary tract infection and pyelonephritis',
          'Clostridioides difficile infection',
          'Healthcare-associated infection and prevention',
          'Immunisation in adults',
        ],
      },
      {
        id: 'im-ger',
        legacy: null,
        label: 'Geriatric Medicine',
        short: 'Geriatrics',
        hue: HUE.slate,
        ward: true,
        blurb: 'Frailty, function and the medicine of accumulated deficits.',
        topics: [
          'Frailty and comprehensive geriatric assessment',
          'Falls and gait assessment',
          'Delirium',
          'Dementia care and behavioural symptoms',
          'Polypharmacy and deprescribing',
          'Urinary and faecal incontinence',
          'Pressure injury prevention',
          'Osteoporosis and fracture prevention',
          'Malnutrition in older adults',
          'Capacity, consent and advance care planning',
        ],
      },
      {
        id: 'im-tox',
        legacy: null,
        label: 'Clinical Toxicology & Therapeutics',
        short: 'Toxicology',
        hue: HUE.crimson,
        ward: true,
        blurb: 'The overdose, the interaction and the antidote.',
        topics: [
          'The poisoned patient: a general approach',
          'Paracetamol poisoning',
          'Salicylate poisoning',
          'Tricyclic antidepressant overdose',
          'Opioid and benzodiazepine toxicity',
          'Beta-blocker and calcium channel blocker overdose',
          'Digoxin toxicity',
          'Toxic alcohols: methanol and ethylene glycol',
          'Carbon monoxide and cyanide',
          'Organophosphate poisoning',
          'Serotonin syndrome and neuroleptic malignant syndrome',
          'Envenomation',
          'Therapeutic drug monitoring',
          'Adverse drug reactions and interactions',
        ],
      },
      {
        id: 'im-gen',
        legacy: null,
        label: 'General & Ambulatory Medicine',
        short: 'General Medicine',
        hue: HUE.moss,
        ward: true,
        blurb: 'The undifferentiated presentation — where internal medicine actually starts.',
        topics: [
          'The undifferentiated symptom',
          'Fatigue',
          'Unintentional weight loss',
          'Pyrexia of unknown origin',
          'Lymphadenopathy',
          'Peripheral oedema',
          'Breathlessness: a structured workup',
          'Preoperative medical assessment',
          'Multimorbidity and competing priorities',
          'Health screening and the periodic review',
          'Chronic pain',
          'Alcohol, tobacco and substance use',
        ],
      },
      {
        id: 'im-derm',
        legacy: null,
        label: 'Dermatology for the Internist',
        short: 'Dermatology',
        hue: HUE.clay,
        ward: true,
        blurb: 'The rash that is a clue, and the rash that is an emergency.',
        topics: [
          'Drug eruptions',
          'Stevens–Johnson syndrome and toxic epidermal necrolysis',
          'Cellulitis and necrotising soft tissue infection',
          'Psoriasis',
          'Atopic dermatitis and eczema',
          'Urticaria and angio-oedema',
          'Cutaneous signs of systemic disease',
          'Vasculitic and purpuric rashes',
          'Pigmented lesions and melanoma',
          'Chronic leg ulcers',
        ],
      },
      {
        id: 'im-pall',
        legacy: null,
        label: 'Palliative & End-of-Life Care',
        short: 'Palliative Care',
        hue: HUE.indigo,
        ward: true,
        blurb: 'Symptom control, honest conversations, and care that does not depend on cure.',
        topics: [
          'Pain assessment and the analgesic ladder',
          'Opioid conversion and titration',
          'Breathlessness at the end of life',
          'Nausea, vomiting and bowel obstruction',
          'Terminal delirium and agitation',
          'Breaking bad news',
          'Goals-of-care conversations',
          'Advance directives and surrogate decision-making',
          'Recognising and managing the last days of life',
          'Bereavement support',
          'Ethics of withholding and withdrawing treatment',
        ],
      },
    ],
  },
];

/* ---------- derived lookups ---------- */

export const ALL_UNITS = DEPARTMENTS.flatMap(d =>
  d.units.map(u => ({ ...u, deptId: d.id, deptLabel: d.label }))
);

export const UNIT_BY_ID = ALL_UNITS.reduce((acc, u) => {
  acc[u.id] = u;
  return acc;
}, {});

export const DEPT_BY_ID = DEPARTMENTS.reduce((acc, d) => {
  acc[d.id] = d;
  return acc;
}, {});

/* Legacy department id -> unit. Cases and library items still carry the old
   `department` value, so this is how stored content finds its new home. */
export const UNIT_BY_LEGACY = ALL_UNITS.reduce((acc, u) => {
  if (u.legacy) acc[u.legacy] = u;
  return acc;
}, {});

/* Departments retired in the 2026 rebuild. Their rows stay in the database
   untouched; they are simply not surfaced anywhere in the app. */
export const RETIRED_LEGACY = [
  'ph-foundations', 'ph-airway', 'ph-medical', 'ph-trauma',
  'ph-assessment', 'ph-special', 'ph-operations',
];

/** Cases/library rows -> the unit that should display them. */
export function unitForLegacy(legacyDept) {
  return UNIT_BY_LEGACY[legacyDept] || null;
}

/** Everything the app is willing to show, filtered of retired content. */
export function isVisible(row) {
  if (!row?.department) return false;
  return !!UNIT_BY_LEGACY[row.department];
}

/* ---------- rooms ----------
   Every unit is a real room you walk into. The photograph is the room you are
   standing in — blurred and darkened behind the drawn bays, so it reads as
   depth rather than competing with the beds in front of it. */

export const ROOM = {
  icu:  '/img/room-icu.jpg',     // single-bed critical care room, monitor on a stand
  ward: '/img/room-ward.webp',   // bedded ward with Bed-01/02/03 wall placards
  bay:  '/img/room-bay.jpg',     // open ward, curtained bays
  ed:   '/img/hero-ed.webp',     // emergency floor with the nursing station
  front: '/img/exterior.png',    // the hospital from the street
};

/* High-acuity units get the closed critical-care room; the front-door and
   high-traffic units get the open emergency floor; everything else is a ward. */
const ROOM_KIND = {
  'cv-ed': ROOM.ed, 'im-id': ROOM.ed, 'im-gen': ROOM.ed,
  'cv-ccu': ROOM.icu, 'cv-cath': ROOM.icu, 'cv-ep': ROOM.icu,
  'im-icu': ROOM.icu, 'im-tox': ROOM.icu, 'cv-ph': ROOM.icu,
  'cv-prevent': ROOM.bay, 'im-ger': ROOM.bay, 'im-pall': ROOM.bay,
  'im-derm': ROOM.bay, 'cv-special': ROOM.bay, 'cv-chd': ROOM.bay,
};

export function roomFor(unit) {
  return ROOM_KIND[unit?.id] || ROOM.ward;
}

export const SEVERITY = {
  stable:   { label: 'Stable',   color: '#0F766E', bg: '#E8F2F0' },
  urgent:   { label: 'Urgent',   color: '#A8620F', bg: '#F7F0E4' },
  critical: { label: 'Critical', color: '#AE2A22', bg: '#F9EDEB' },
};
