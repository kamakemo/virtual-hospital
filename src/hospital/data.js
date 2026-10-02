/* ============================================================
   THE HOSPITAL
   One building, two wings, fourteen floors each. Every floor is
   one department with twelve beds.

   This file is the whole of the app's data. There is no backend:
   the only case information kept is each case's header (its
   title), shown on the bed's identification board. Everything
   else — the case content, records, treatment — is deliberately
   absent until it is rebuilt.
   ============================================================ */

export const HOSPITAL_NAME = 'Virtual Hospital';
export const BEDS_PER_FLOOR = 12;

/* How a department is fitted out. Drives equipment, curtains,
   flooring and lighting temperature in the ward builder. */
export const KIND = {
  critical:  'critical',   // ICU / CCU — ventilators, pump stacks, teal curtains
  emergency: 'emergency',  // ED — trolleys, crash cart, cream/grey curtains, wood floor
  procedure: 'procedure',  // cath / EP / imaging recovery — slate curtains, lead aprons
  ward:      'ward',       // general ward — blue curtains, lockers, overbed tables
  comfort:   'comfort',    // palliative / geriatric / day units — wood, armchairs, plants
};

const CARDIOLOGY = [
  ['cv-ed',       'Emergency & Chest Pain Unit',          KIND.emergency, '#B23A3A'],
  ['cv-ccu',      'Coronary Care Unit',                   KIND.critical,  '#C0473B'],
  ['cv-hf',       'Heart Failure Unit',                   KIND.ward,      '#7A4D7E'],
  ['cv-cath',     'Cardiac Catheterisation Laboratory',   KIND.procedure, '#B4643A'],
  ['cv-valve',    'Valvular & Structural Heart Unit',     KIND.ward,      '#3F5A99'],
  ['cv-ep',       'Electrophysiology & Arrhythmia Unit',  KIND.procedure, '#A57A22'],
  ['cv-imaging',  'Cardiac Imaging & Diagnostics',        KIND.procedure, '#1F7A72'],
  ['cv-prevent',  'Preventive Cardiology Day Unit',       KIND.comfort,   '#4C7A42'],
  ['cv-htn-vasc', 'Hypertension & Vascular Unit',         KIND.ward,      '#4B5F70'],
  ['cv-myo',      'Cardiomyopathy & Pericardial Unit',    KIND.ward,      '#7D4466'],
  ['cv-chd',      'Adult Congenital Heart Unit',          KIND.ward,      '#41558F'],
  ['cv-ph',       'Pulmonary Hypertension Unit',          KIND.critical,  '#227568'],
  ['cv-infect',   'Endocarditis & Inflammatory Unit',     KIND.ward,      '#9C4535'],
  ['cv-special',  'Cardio-Obstetric & Cardio-Oncology',   KIND.comfort,   '#93722A'],
];

const INTERNAL = [
  ['im-resp',     'Respiratory Medicine Ward',            KIND.ward,      '#22738A'],
  ['im-icu',      'Intensive Care Unit',                  KIND.critical,  '#B03A44'],
  ['im-neph',     'Nephrology & Dialysis Unit',           KIND.ward,      '#3E559A'],
  ['im-endo',     'Endocrinology & Metabolism Ward',      KIND.ward,      '#957322'],
  ['im-git',      'Gastroenterology & Hepatology Ward',   KIND.ward,      '#4E7A3C'],
  ['im-neuro',    'Neurology & Stroke Unit',              KIND.critical,  '#6E4A8C'],
  ['im-rheum',    'Rheumatology & Immunology Ward',       KIND.ward,      '#A3593A'],
  ['im-hemonc',   'Haematology & Oncology Ward',          KIND.ward,      '#A13D4D'],
  ['im-id',       'Infectious Diseases & Isolation',      KIND.ward,      '#2B7A6A'],
  ['im-ger',      'Geriatric Medicine Ward',              KIND.comfort,   '#5B6B78'],
  ['im-tox',      'Clinical Toxicology Unit',             KIND.emergency, '#B0443A'],
  ['im-gen',      'General Medical Admissions',           KIND.ward,      '#3C6C82'],
  ['im-derm',     'Dermatology Day Unit',                 KIND.comfort,   '#A26445'],
  ['im-pall',     'Palliative Care Unit',                 KIND.comfort,   '#5A6E8E'],
];

/* ---------- case headers ----------
   Snapshot of the case titles that were in the hospital, with the bed each
   was assigned to (null = unassigned). Titles only — no case content. */
const HEADERS = {
  'cv-ed': [[1,'Undifferentiated Chest Pain — the ACS Rule-Out'],[2,'Acute Aortic Dissection (Stanford Type A)'],[3,'High-Risk (Massive) Pulmonary Embolism'],[4,'Cardiac Arrest — ACLS in Resus'],[5,'Severe Hyperkalaemia with Cardiac Toxicity'],[6,'Symptomatic Bradycardia & High-Grade AV Block'],[7,'The Unstable Tachyarrhythmia — a Triage Emergency'],[8,'SCAPE — Sympathetic Crashing Acute Pulmonary Oedema'],[9,'Syncope — Risk-Stratifying the Faint that Kills'],[10,'Cardiotoxic Overdose — Beta-Blocker / CCB / Digoxin'],[11,'Cocaine-Associated Chest Pain'],[12,'Critical Aortic Stenosis — the Fixed-Obstruction Trap'],[null,'Undifferentiated Chest Pain']],
  'cv-ccu': [[1,'Acute Anterior STEMI — Primary PCI'],[2,'Unstable Monomorphic Ventricular Tachycardia (VT Storm)'],[3,'NSTE-ACS / NSTEMI — Risk-Stratified Care'],[4,'Cardiogenic Shock Complicating Acute MI'],[5,'Inferior STEMI with Right Ventricular Infarction'],[6,'Mechanical Complications of Acute MI'],[7,'Cardiac Tamponade'],[8,'Hypertensive Emergency & SCAPE (Flash Pulmonary Edema)'],[9,'Post-Cardiac-Arrest Care After ROSC'],[10,'Fulminant Myocarditis'],[11,'Takotsubo (Stress) Cardiomyopathy'],[12,'Acute Pericarditis — The Great STEMI Mimic']],
  'cv-hf': [[1,'Acute Decompensated Heart Failure'],[2,'Chronic HFrEF — The Four Pillars of GDMT'],[3,'Heart Failure with Preserved Ejection Fraction (HFpEF)'],[4,'Cardiogenic Shock — Cold and Wet'],[5,'Cardiorenal Syndrome & Diuretic Resistance'],[6,'Right Ventricular Failure & Pulmonary Hypertension'],[7,'Advanced Heart Failure — Transplant & LVAD'],[8,'Functional (Secondary) Mitral Regurgitation in Heart Failure'],[9,'Dilated Cardiomyopathy — the Reversible & the Familial'],[10,'Cardio-Oncology — Cancer-Therapy-Related Cardiac Dysfunction'],[11,'Device Therapy in Heart Failure — CRT & ICD'],[12,'The Comorbidities that Decide Heart-Failure Outcomes']],
  'cv-cath': [[1,'PCI Masterclass'],[2,'Stable Angina | Radial PCI'],[4,'Case 07 — Femoral Access → Retroperitoneal Bleed'],[5,'Primary PCI — Acute Anterior STEMI'],[6,'Inferior STEMI + RV Infarct — Primary PCI of the RCA'],[7,'NSTEMI — Early Invasive Strategy & FFR-Guided PCI'],[8,'Left Main / Multivessel — PCI vs CABG (Heart Team & SYNTAX)'],[9,'Coronary Bifurcation — Provisional vs 2-Stent'],[10,'Heavily Calcified Lesion — Rotational Atherectomy / IVL'],[11,'Chronic Total Occlusion — Antegrade & Retrograde PCI'],[12,'Cardiogenic Shock — PCI with Mechanical Support'],[13,'Coronary Perforation & Tamponade — Cath Lab Emergency'],[14,'Stent Thrombosis — The Catastrophic Re-occlusion'],[15,'No-Reflow / Slow-Flow — The Open Artery That Will Not Perfuse'],[16,'Spontaneous Coronary Artery Dissection — When NOT to Stent'],[null,'Failed Radial → Femoral Crossover']],
  'cv-valve': [[1,'Valvular & Pericardial Heart Disease — Grand Rounds'],[null,'Degenerative Mitral Regurgitation'],[null,'Degenerative Mitral Regurgitation Case 2'],[null,'Functional Mitral Regurgitation in HF'],[null,'Rheumatic Mitral Stenosis with AF'],[null,'Right-Sided Infective Endocarditis'],[null,'Severe Functional Tricuspid Regurgitation in Pulmonary Hypertension'],[null,'Prosthetic Valve Dysfunction'],[null,'Pulmonary Valve Stenosis'],[null,'Severe Aortic Stenosis | Clinical Simulation'],[null,'Case AR-58 — Severe Aortic Regurgitation']],
  'cv-ep': [[1,'AVNRT — Paroxysmal Supraventricular Tachycardia'],[2,'Pre-excited Atrial Fibrillation in WPW (FBI — Fast, Broad, Irregular)'],[3,'New-Onset Atrial Fibrillation with Rapid Ventricular Response'],[4,'Typical Atrial Flutter with 2:1 AV Conduction'],[5,'Torsades de Pointes — Acquired Long QT'],[6,'Congenital Long QT Syndrome'],[7,'Brugada Syndrome — Fever-Unmasked VF'],[8,'Catecholaminergic Polymorphic VT (CPVT)'],[9,'Complete (Third-Degree) Heart Block with Stokes-Adams Syncope'],[10,'Sick Sinus Syndrome — Tachy-Brady Syndrome'],[11,'ICD Electrical Storm'],[12,'Idiopathic VT — RVOT & Fascicular (the Verapamil-Sensitive Exception)']],
  'cv-prevent': [[1,'Chronic Coronary Syndrome — Stable Angina in Clinic'],[2,'Hypertension & the Hunt for a Secondary Cause'],[3,'Dyslipidaemia & Familial Hypercholesterolaemia'],[4,'Atrial Fibrillation — the ABC Pathway in Clinic'],[5,'The Asymptomatic Severe Valve — When to Watch, When to Act'],[6,'Palpitations — the Ambulatory Rhythm Work-Up'],[7,'Reflex (Vasovagal) Syncope — Managing the Benign Faint'],[8,'Cardiovascular Primary Prevention & Risk Assessment'],[9,'Adult Congenital Heart Disease in Clinic'],[10,'Hypertrophic Cardiomyopathy — Risk, Obstruction & Family'],[11,'The Cardiometabolic Clinic — Diabetes, Obesity & CV Risk'],[12,'Preoperative Cardiac Risk Assessment for Non-Cardiac Surgery']],
  'im-endo': [[1,'HHS / T2DM Decompensation'],[2,'Myxedema Coma · 65F'],[3,'Thyroid Storm'],[4,'Adrenal Crisis'],[5,"Cushing's Syndrome"],[6,'Pheochromocytoma Crisis'],[null,'Severe DKA Case'],[null,'SIADH / Severe Hyponatremia'],[null,'Acromegaly Case'],[null,'Hypercalcemia of Malignancy']],
  'im-git': [[1,'Dysphagia — Oesophageal Cancer & Achalasia'],[2,'Dyspepsia, Peptic Ulcer Disease & H. pylori'],[3,'Acute Severe Ulcerative Colitis'],[4,"Crohn's Disease"],[5,'Coeliac Disease & Malabsorption'],[6,'Clostridioides difficile Colitis'],[7,'Decompensated Cirrhosis — Ascites, SBP & HRS'],[8,'Severe Alcoholic Hepatitis'],[9,'Hepatic Encephalopathy'],[10,'Chronic Viral Hepatitis B & C'],[11,'NAFLD/MASLD & Autoimmune/Genetic Liver Disease'],[12,'Hepatocellular Carcinoma & Liver Lesions']],
  'im-hemonc': [[null,'DVT Crisis Case'],[null,'Severe Symptomatic Anemia'],[null,'Acute Myeloid Leukemia'],[null,'ITP Case'],[null,'Hodgkin Lymphoma Case'],[null,'Back Pain with Hypercalcemia'],[null,'CML Case'],[null,'DVT & Cancer-Associated Thrombosis'],[null,'Breast Lump: Early Breast Cancer'],[null,'Febrile Neutropenia'],[null,'Sickle Cell Crisis with ACS'],[null,'Esophageal Cancer Case']],
  'im-icu': [[7,'Post-CABG Multi-Organ Failure'],[10,'Acute Liver Failure (Fulminant / Paracetamol)'],[12,'Thyroid Storm (Thyrotoxic Crisis)'],[null,'Aortic Dissection Type A'],[null,'Meningococcal Septic Shock'],[null,'Severe ARDS on Mechanical Ventilation'],[null,'Super-Refractory Status Epilepticus'],[null,'CODE BLUE — Massive PE / Cardiac Arrest Case Simulation'],[null,'DKA × Cerebral Edema — Night-into-Morning Case File'],[null,'Severe Traumatic Brain Injury'],[null,'Near-Fatal Acute Severe Asthma'],[null,'Severe Acute Pancreatitis — Longitudinal Teaching Case File']],
  'im-neph': [[4,'Nephritic Syndrome Case'],[5,'Diabetic Nephropathy Case'],[null,'Hyperkalemia Emergency'],[null,'Hyponatremia / SIADH'],[null,'Renal Tubular Acidosis'],[null,'ADPKD Crisis Case'],[null,'Renovascular Hypertensive Kidney Disease'],[null,'Acute Interstitial Nephritis'],[null,'ESRD — Dialysis & Transplant'],[null,'CKD Staging & Complications'],[null,'AKI: ATN vs Prerenal'],[null,'Edema · Adult Nephrotic Syndrome (PLA2R+ Membranous Nephropathy)']],
  'im-neuro': [[5,'Acute Bacterial Meningitis & Meningococcal Sepsis'],[6,'Herpes Simplex Encephalitis'],[7,'Guillain-Barré Syndrome'],[8,'Myasthenia Gravis & Myasthenic Crisis'],[9,'Metastatic Spinal Cord Compression'],[10,'Migraine & the Primary Headache Differential'],[11,"Wernicke's Encephalopathy"],[12,'Motor Neurone Disease (ALS)'],[null,'Progressive Parkinsonism'],[null,'Status Epilepticus'],[null,'Cognitive Decline Case'],[null,'Multiple Sclerosis']],
  'im-resp': [[null,'Acute Severe Asthma'],[null,'CAP → Sepsis'],[null,'COPD Crisis'],[null,'Massive Pulmonary Embolism'],[null,'ILD Case'],[null,'Pleural Disease Case'],[null,'Hemoptysis Revealing Lung Cancer'],[null,'Pulmonary Tuberculosis'],[null,'OSA & Obesity Hypoventilation Syndrome'],[null,'ARDS in the Respiratory ICU'],[null,'Bronchiectasis with Recurrent Infections'],[null,'Systemic Autoimmune Disease with Pulmonary Manifestations']],
  'im-rheum': [[1,'Septic Arthritis — The Hot Joint Emergency'],[2,'Crystal Arthropathy — Gout & Pseudogout'],[3,'Rheumatoid Arthritis'],[4,'Systemic Lupus Erythematosus & Lupus Nephritis'],[5,'Giant Cell Arteritis & Polymyalgia Rheumatica'],[6,'ANCA-Associated Vasculitis (GPA/MPA)'],[7,'Systemic Sclerosis & Scleroderma Renal Crisis'],[8,'Axial Spondyloarthritis (Ankylosing Spondylitis)'],[9,'Antiphospholipid Syndrome'],[10,'Dermatomyositis / Polymyositis'],[11,'Common Variable Immunodeficiency'],[12,'Anaphylaxis & Hereditary Angioedema']],
};

/** Twelve beds; explicit bed numbers win, the rest fill free beds in order. */
function assignBeds(list = []) {
  const beds = Array(BEDS_PER_FLOOR).fill(null);
  const rest = [];
  for (const [n, title] of list) {
    if (n >= 1 && n <= BEDS_PER_FLOOR && !beds[n - 1]) beds[n - 1] = title;
    else rest.push([n, title]);
  }
  // Unassigned headers fill the gaps; numbered ones beyond bed 12 do not fit.
  for (const [n, title] of rest) {
    if (n != null) continue;
    const free = beds.indexOf(null);
    if (free !== -1) beds[free] = title;
  }
  return beds;
}

function wing(id, name, short, tab, side, rows) {
  return {
    id, name, short, tab, side,
    floors: rows.map(([unitId, name, kind, hue], i) => ({
      id: unitId,
      number: i + 1,
      name,
      kind,
      hue,
      wingId: id,
      beds: assignBeds(HEADERS[unitId]),
    })),
  };
}

/* The east wing faces the sun in the exterior scene. */
export const WINGS = [
  wing('cardiology', 'Cardiology Wing', 'Cardiology', 'Cardiology', 'east', CARDIOLOGY),
  wing('internal',   'Internal Medicine Wing', 'Internal Medicine', 'Medicine', 'west', INTERNAL),
];

export const WING_BY_ID = Object.fromEntries(WINGS.map(w => [w.id, w]));

export function floorOf(wingId, number) {
  return WING_BY_ID[wingId]?.floors.find(f => f.number === number) || null;
}

export const pad2 = n => String(n).padStart(2, '0');
