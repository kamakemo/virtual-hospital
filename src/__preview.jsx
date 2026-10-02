import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { TopBar, Footer } from './ui/Chrome.jsx';
import Home from './views/Home.jsx';
import Department from './views/Department.jsx';
import Unit from './views/Unit.jsx';
import Auth from './views/Auth.jsx';
import { DEPARTMENTS } from './data/curriculum.js';

/* Design preview harness — not part of the app. Mounts the real views with
   representative data so the light design can be inspected without a session.
   Served only by preview.html. */

const SEV = ['critical', 'urgent', 'stable'];
const mkCases = (dept, n, titles) =>
  Array.from({ length: n }, (_, i) => ({
    id: `${dept}-${i}`,
    department: dept,
    bedNumber: i < 4 ? i + 1 : null,
    title: titles[i % titles.length],
    chiefComplaint: 'Presented through the emergency department earlier this morning',
    severity: SEV[i % 3],
    caseType: 'rich-html',
    tags: ['Teaching case', 'Worked example'],
    vitals: { hr: 78 + i * 3, bp: '124/76', spo2: 97 - (i % 6) },
    profile: { age: 40 + i, sex: i % 2 ? 'Female' : 'Male', name: 'Patient' },
  }));

const cases = [
  ...mkCases('cv-ccu', 12, ['Acute Anterior STEMI', 'Inferior STEMI with Bradycardia', 'NSTEMI in Chronic Kidney Disease', 'Cardiogenic Shock after Late Presentation']),
  ...mkCases('cv-ed', 13, ['Undifferentiated Chest Pain', 'Syncope in a Young Athlete', 'Hypertensive Emergency with Pulmonary Oedema']),
  ...mkCases('cv-cath', 16, ['Primary PCI to the LAD', 'Chronic Total Occlusion of the RCA', 'Radial Access Complication']),
  ...mkCases('cv-hf', 12, ['Decompensated HFrEF', 'HFpEF with Atrial Fibrillation']),
  ...mkCases('cv-valve', 11, ['Severe Aortic Stenosis for TAVI', 'Acute Mitral Regurgitation']),
  ...mkCases('cv-ep', 12, ['Atrial Fibrillation with Rapid Ventricular Response', 'Recurrent Monomorphic VT']),
  ...mkCases('cv-clinic', 12, ['Primary Prevention in Familial Hypercholesterolaemia']),
  ...mkCases('im-resp', 12, ['Near-Fatal Acute Severe Asthma', 'COPD Exacerbation with Hypercapnia']),
  ...mkCases('im-icu', 12, ['Severe ARDS on Mechanical Ventilation', 'Meningococcal Septic Shock', 'Super-Refractory Status Epilepticus']),
  ...mkCases('im-neph', 12, ['Oliguric AKI after Sepsis', 'Hyponatraemia in a Marathon Runner']),
  ...mkCases('im-endo', 10, ['DKA with Cerebral Oedema', 'Thyroid Storm']),
  ...mkCases('im-git', 12, ['Variceal Haemorrhage in Cirrhosis', 'Severe Acute Pancreatitis']),
  ...mkCases('im-neuro', 12, ['Anterior Circulation Stroke for Thrombectomy', 'Myasthenic Crisis']),
  ...mkCases('im-rheum', 12, ['Lupus Nephritis', 'ANCA Vasculitis with Pulmonary Haemorrhage']),
  ...mkCases('im-hemonc', 12, ['Febrile Neutropenia', 'Newly Diagnosed Myeloma with Hypercalcaemia']),
];

const library = [
  { id: 'l1', department: 'im-icu', title: 'Decompensated Heart Failure 2026', description: 'A full review of the four pillars and when to start each one.', category: 'Review' },
  { id: 'l2', department: 'cv-ccu', title: 'Antiplatelet Therapy After PCI', description: 'Duration, de-escalation and the bleeding patient.', category: 'Drug tables' },
  { id: 'l3', department: 'im-resp', title: 'Reading an Arterial Blood Gas', description: 'A six-step method with worked examples.', category: 'Algorithm' },
];

const conferences = [
  { id: 'c1', title: 'Venous Thromboembolism', subtitle: 'From the leg to the lung — an eight-session intensive', dateLabel: 'Session 2026', organizer: 'Department of Internal Medicine' },
  { id: 'c2', title: 'Sepsis and Septic Shock', subtitle: 'Two days, sixteen sessions on recognition through recovery', dateLabel: 'Session 2026', organizer: 'Critical Care' },
  { id: 'c3', title: 'Acute Kidney Injury and Electrolytes', subtitle: 'The arithmetic of sodium, potassium and acid', dateLabel: 'Session 2026', organizer: 'Nephrology' },
  { id: 'c4', title: 'Gastrointestinal Bleeding', subtitle: 'Resuscitation, endoscopy and the variceal bleed', dateLabel: 'Session 2026', organizer: 'GI & Liver' },
];

const progress = {
  xp: 450,
  completedStages: { 'rich:cv-ccu-0': true, 'rich:cv-ccu-1': true, 'rich:im-icu-0': true, 'rich:cv-cath-2': true },
  conferenceProgress: { c1: { sessions: { s1: {}, s2: {} } } },
};

const SCREENS = [
  { id: 'home', label: 'Home' },
  { id: 'cardiology', label: 'Cardiology' },
  { id: 'internal', label: 'Internal Medicine' },
  { id: 'ward', label: 'Unit — ward' },
  { id: 'unit', label: 'Unit — index' },
  { id: 'auth', label: 'Sign in' },
];

function Preview() {
  const initial = new URLSearchParams(location.search).get('s') || 'home';
  const [screen, setScreen] = useState(initial);
  const navigate = r => {
    if (r.name === 'department') setScreen(r.deptId);
    else if (r.name === 'unit') setScreen(r.unitId === 'im-icu' ? 'ward' : 'unit');
    else setScreen('home');
    window.scrollTo(0, 0);
  };
  const session = { user: { email: 'kareem@hospital.org', id: 'preview' } };
  const shared = { cases, library, conferences, progress, setProgress: () => {}, navigate };

  let body;
  if (screen === 'auth') return <Auth />;
  if (screen === 'cardiology' || screen === 'internal') body = <Department deptId={screen} {...shared} />;
  else if (screen === 'ward') body = <Unit deptId="internal" unitId="im-icu" {...shared} />;
  else if (screen === 'unit') body = <Unit deptId="cardiology" unitId="cv-hf" {...shared} />;
  else body = <Home {...shared} />;

  return (
    <div className="min-h-full flex flex-col">
      <div className="bg-ink text-white px-5 py-2 flex items-center gap-3 flex-wrap text-[12px]">
        <span className="label" style={{ fontSize: 9 }}>Design preview</span>
        {SCREENS.map(s => (
          <button key={s.id} onClick={() => setScreen(s.id)}
            className={screen === s.id ? 'underline font-semibold' : 'opacity-70 hover:opacity-100'}>
            {s.label}
          </button>
        ))}
      </div>
      <TopBar route={{ name: screen === 'cardiology' || screen === 'internal' ? 'department' : 'home', deptId: screen }}
        navigate={navigate} session={session} onSignOut={() => {}} />
      <div className="flex-1">{body}</div>
      <Footer navigate={navigate} counts={{ cases: cases.length, units: DEPARTMENTS.reduce((n, d) => n + d.units.length, 0), library: library.length, conferences: conferences.length }} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Preview />);
