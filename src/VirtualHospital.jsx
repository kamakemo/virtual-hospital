import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity, Heart, Stethoscope, Pill, FileText, AlertCircle, CheckCircle2, XCircle,
  ChevronRight, ChevronLeft, Search, Filter, Award, Trophy, Star, Zap, Brain,
  ClipboardList, UserCircle, Clock, Thermometer, Droplet, TrendingUp, BookOpen,
  Shield, Target, Lightbulb, Edit3, Plus, Trash2, Save, Eye, EyeOff, Settings,
  LayoutGrid, Home, BarChart3, BookMarked, GraduationCap, Hospital, Sun, Moon,
  Microscope, Image as ImageIcon, Bold, Italic, List, Heading1, Heading2,
  Quote, Code, Underline, Sparkles, Lock, Unlock, Bell, ChevronDown, X, Check,
  PlayCircle, ArrowRight, BarChart2, Users, Layers, Bookmark, RefreshCw, Download,
  Upload, Copy, MoreVertical, Menu, Beaker, Syringe, ScrollText, Crosshair, Wind,
  HeartPulse, Building2, Bed, Siren, Waves, Dna, Bone,
  Soup, Droplets, MapPin, Radio,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Strikethrough, Subscript, Superscript,
  Undo2, Redo2, Type, Palette, Highlighter, Table as TableIcon, Minus,
  Youtube, Film, Image as ImageIcon2, FileImage, Link2, Code2, Indent, Outdent,
  GripVertical, Pencil, ArrowUp, ArrowDown, Eraser, FileCode, Info, AlertTriangle,
  CircleDot, Hash
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import {
  supabase,
  isSupabaseConfigured,
  signInWithMagicLink,
  signOut,
  isUserAdmin,
  fetchAllCases,
  upsertCase,
  deleteCaseRow,
  fetchProgress,
  saveProgress,
} from './supabaseClient';

// ============== STORAGE KEYS ==============
const SK = {
  CASES: 'vh:cases:v1',
  PROGRESS: 'vh:progress:v1',
  SETTINGS: 'vh:settings:v1',
  ADMIN_AUTH: 'vh:admin:v1',
};

// ============== STAGE DEFINITIONS ==============
const STAGES = [
  { id: 'S1',  key: 'profile',       label: 'Profile',           icon: UserCircle,    color: 'sky' },
  { id: 'S2',  key: 'handover',      label: 'Handover',          icon: ScrollText,    color: 'sky' },
  { id: 'S3',  key: 'assessment',    label: 'Initial Assessment',icon: Stethoscope,   color: 'blue' },
  { id: 'S4',  key: 'resident',      label: 'Resident Review',   icon: ClipboardList, color: 'blue' },
  { id: 'S5',  key: 'consultant',    label: 'Consultant Round',  icon: GraduationCap, color: 'indigo' },
  { id: 'S6',  key: 'teaching',      label: 'Teaching Points',   icon: Lightbulb,     color: 'amber' },
  { id: 'S7',  key: 'orders',        label: 'Orders',            icon: FileText,      color: 'violet' },
  { id: 'S8',  key: 'nursing',       label: 'Nursing Care',      icon: Heart,         color: 'rose' },
  { id: 'S9',  key: 'investigations',label: 'Investigations',    icon: Microscope,    color: 'cyan' },
  { id: 'S10', key: 'imaging',       label: 'ECG / Imaging',     icon: Activity,      color: 'red' },
  { id: 'S11', key: 'medications',   label: 'Medications',       icon: Pill,          color: 'emerald' },
  { id: 'S12', key: 'monitoring',    label: 'Monitoring',        icon: BarChart2,     color: 'teal' },
  { id: 'S13', key: 'complications', label: 'Complications',     icon: AlertCircle,   color: 'orange' },
  { id: 'S14', key: 'differentials', label: 'Differentials',     icon: Layers,        color: 'fuchsia' },
  { id: 'S15', key: 'plan',          label: 'Plan',              icon: Target,        color: 'purple' },
  { id: 'S16', key: 'progress',      label: 'Progress',          icon: TrendingUp,    color: 'lime' },
  { id: 'S17', key: 'discharge',     label: 'Discharge',         icon: CheckCircle2,  color: 'green' },
  { id: 'S18', key: 'pearls',        label: 'Clinical Pearls',   icon: Sparkles,      color: 'yellow' },
  { id: 'S19', key: 'mcqs',          label: 'MCQs / Assessment', icon: Brain,         color: 'pink' },
];

const SEVERITY = {
  stable:   { label: 'Stable',   chip: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500', xp: 50 },
  urgent:   { label: 'Urgent',   chip: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',         dot: 'bg-amber-500',   xp: 100 },
  critical: { label: 'Critical', chip: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',                 dot: 'bg-red-500',     xp: 200 },
};

// ============== DEPARTMENT DEFINITIONS ==============
const DEPARTMENTS = {
  cardiology: [
    { id: 'cv-ed',         label: 'Emergency Department',     short: 'ED',         icon: Siren,        accent: 'rose',    beds: 8,  desc: 'Front door — triage and acute presentations' },
    { id: 'cv-ccu',        label: 'CCU',                      short: 'CCU',        icon: HeartPulse,   accent: 'red',     beds: 6,  desc: 'Coronary Care Unit — STEMI, shock, arrhythmia' },
    { id: 'cv-hf',         label: 'Heart Failure Ward',       short: 'HF Ward',    icon: Heart,        accent: 'pink',    beds: 10, desc: 'Acute decompensation, chronic HF optimization' },
    { id: 'cv-cath',       label: 'Cath Lab',                 short: 'Cath',       icon: Activity,     accent: 'fuchsia', beds: 4,  desc: 'PCI, angiography, structural intervention' },
    { id: 'cv-valve',      label: 'Valvular & Structural',    short: 'Structural', icon: Layers,       accent: 'violet',  beds: 6,  desc: 'TAVR, MitraClip, congenital, septal defects' },
    { id: 'cv-ep',         label: 'EP Lab',                   short: 'EP',         icon: Zap,          accent: 'amber',   beds: 4,  desc: 'Ablation, device implant, complex arrhythmia' },
    { id: 'cv-imaging',    label: 'Cardiac Imaging',          short: 'Imaging',    icon: Waves,        accent: 'cyan',    beds: 4,  desc: 'Echo, cardiac MRI, CT angiography' },
    { id: 'cv-clinic',     label: 'Outpatient Clinic',        short: 'Clinic',     icon: ClipboardList,accent: 'teal',    beds: 6,  desc: 'Follow-up, risk-factor management' },
  ],
  internal: [
    { id: 'im-resp',       label: 'Respiratory',              short: 'Resp',       icon: Wind,         accent: 'sky',     beds: 8,  desc: 'Asthma, COPD, pneumonia, ILD, PE' },
    { id: 'im-icu',        label: 'Critical Care Unit',       short: 'ICU',        icon: Siren,        accent: 'red',     beds: 6,  desc: 'Sepsis, shock, ARDS, multi-organ failure' },
    { id: 'im-hemonc',     label: 'Hematology & Oncology',    short: 'Hem/Onc',    icon: Droplets,     accent: 'rose',    beds: 8,  desc: 'Anemia, leukemia, lymphoma, solid tumors' },
    { id: 'im-endo',       label: 'Endocrinology',            short: 'Endo',       icon: Dna,          accent: 'amber',   beds: 6,  desc: 'Diabetes, thyroid, adrenal, pituitary' },
    { id: 'im-rheum',      label: 'Rheumatology & Immunology',short: 'Rheum',      icon: Bone,         accent: 'violet',  beds: 6,  desc: 'SLE, RA, vasculitis, immunodeficiency' },
    { id: 'im-neph',       label: 'Nephrology',               short: 'Neph',       icon: Beaker,       accent: 'cyan',    beds: 6,  desc: 'AKI, CKD, glomerulonephritis, dialysis' },
    { id: 'im-neuro',      label: 'Neurology',                short: 'Neuro',      icon: Brain,        accent: 'indigo',  beds: 6,  desc: 'Stroke, seizure, MS, neuromuscular' },
    { id: 'im-git',        label: 'GIT & Hepatology',         short: 'GI/Hep',     icon: Soup,         accent: 'emerald', beds: 8,  desc: 'GI bleed, IBD, cirrhosis, pancreatitis' },
  ],
};

const DEPARTMENT_BY_ID = Object.values(DEPARTMENTS).flat().reduce((acc, d) => {
  acc[d.id] = d;
  return acc;
}, {});

// Tailwind-safe accent classes (must be statically discoverable)
const ACCENT_CLASSES = {
  rose:    { bg: 'bg-rose-500',    text: 'text-rose-600 dark:text-rose-400',       soft: 'bg-rose-50 dark:bg-rose-500/10',       border: 'border-rose-200 dark:border-rose-500/30',       grad: 'from-rose-500 to-pink-600',       ring: 'ring-rose-500/40',    glow: 'shadow-rose-500/30' },
  red:     { bg: 'bg-red-500',     text: 'text-red-600 dark:text-red-400',         soft: 'bg-red-50 dark:bg-red-500/10',         border: 'border-red-200 dark:border-red-500/30',         grad: 'from-red-500 to-rose-600',        ring: 'ring-red-500/40',     glow: 'shadow-red-500/30' },
  pink:    { bg: 'bg-pink-500',    text: 'text-pink-600 dark:text-pink-400',       soft: 'bg-pink-50 dark:bg-pink-500/10',       border: 'border-pink-200 dark:border-pink-500/30',       grad: 'from-pink-500 to-fuchsia-600',    ring: 'ring-pink-500/40',    glow: 'shadow-pink-500/30' },
  fuchsia: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-600 dark:text-fuchsia-400', soft: 'bg-fuchsia-50 dark:bg-fuchsia-500/10', border: 'border-fuchsia-200 dark:border-fuchsia-500/30', grad: 'from-fuchsia-500 to-purple-600',  ring: 'ring-fuchsia-500/40', glow: 'shadow-fuchsia-500/30' },
  violet:  { bg: 'bg-violet-500',  text: 'text-violet-600 dark:text-violet-400',   soft: 'bg-violet-50 dark:bg-violet-500/10',   border: 'border-violet-200 dark:border-violet-500/30',   grad: 'from-violet-500 to-purple-600',   ring: 'ring-violet-500/40',  glow: 'shadow-violet-500/30' },
  indigo:  { bg: 'bg-indigo-500',  text: 'text-indigo-600 dark:text-indigo-400',   soft: 'bg-indigo-50 dark:bg-indigo-500/10',   border: 'border-indigo-200 dark:border-indigo-500/30',   grad: 'from-indigo-500 to-blue-600',     ring: 'ring-indigo-500/40',  glow: 'shadow-indigo-500/30' },
  sky:     { bg: 'bg-sky-500',     text: 'text-sky-600 dark:text-sky-400',         soft: 'bg-sky-50 dark:bg-sky-500/10',         border: 'border-sky-200 dark:border-sky-500/30',         grad: 'from-sky-500 to-blue-600',        ring: 'ring-sky-500/40',     glow: 'shadow-sky-500/30' },
  cyan:    { bg: 'bg-cyan-500',    text: 'text-cyan-600 dark:text-cyan-400',       soft: 'bg-cyan-50 dark:bg-cyan-500/10',       border: 'border-cyan-200 dark:border-cyan-500/30',       grad: 'from-cyan-500 to-teal-600',       ring: 'ring-cyan-500/40',    glow: 'shadow-cyan-500/30' },
  teal:    { bg: 'bg-teal-500',    text: 'text-teal-600 dark:text-teal-400',       soft: 'bg-teal-50 dark:bg-teal-500/10',       border: 'border-teal-200 dark:border-teal-500/30',       grad: 'from-teal-500 to-emerald-600',    ring: 'ring-teal-500/40',    glow: 'shadow-teal-500/30' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', soft: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', grad: 'from-emerald-500 to-green-600',   ring: 'ring-emerald-500/40', glow: 'shadow-emerald-500/30' },
  amber:   { bg: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',     soft: 'bg-amber-50 dark:bg-amber-500/10',     border: 'border-amber-200 dark:border-amber-500/30',     grad: 'from-amber-500 to-orange-600',    ring: 'ring-amber-500/40',   glow: 'shadow-amber-500/30' },
};

const ROLES = [
  { id: 'student',     label: 'Medical Student', xpRequired: 0,    icon: BookOpen,       depth: 'Foundational reasoning, simplified language' },
  { id: 'resident',    label: 'Resident',        xpRequired: 300,  icon: Stethoscope,    depth: 'Diagnostic workup, ward management' },
  { id: 'consultant',  label: 'Consultant',      xpRequired: 800,  icon: GraduationCap,  depth: 'Expert-level reasoning, evidence-based decisions' },
];

// ============== SEED CASES ==============
const SEED_CASES = [
  {
    id: 'c-stemi-001', hospital: 'cardiology', department: 'cv-ccu', bedNumber: 1, title: 'Acute Anterior STEMI',
    chiefComplaint: 'Crushing chest pain × 45 min', system: 'Cardiology',
    severity: 'critical', tags: ['ACS', 'STEMI', 'PCI', 'Emergency'],
    profile: { name: 'Mr. A.H.', age: 58, sex: 'Male', mrn: 'CV-10293', allergies: 'NKDA', weight: '82 kg', occupation: 'Accountant', pmh: 'HTN, Dyslipidemia, Smoker (30 pack-years)' },
    vitals: { hr: 112, bp: '156/94', rr: 22, spo2: 94, temp: 37.0, gcs: 15 },
    handover: '<p><strong>EMS handover:</strong> 58-year-old male collected from home with sudden onset crushing retrosternal chest pain radiating to left arm and jaw. Diaphoretic, anxious. Pre-hospital ECG: ST elevation in V1–V4. Aspirin 300 mg PO and ticagrelor 180 mg PO given en route. IV access × 2 (18G).</p>',
    assessment: '<p><strong>Looks unwell, diaphoretic, clutching chest.</strong></p><ul><li>Airway: patent, talking in short sentences</li><li>Breathing: bilateral air entry, no crackles, RR 22</li><li>Circulation: cool peripheries, BP 156/94, HR 112 regular, S4 audible</li><li>Disability: GCS 15, anxious</li><li>Exposure: no peripheral edema, calves soft</li></ul><p><strong>Pain score:</strong> 9/10, "elephant on chest", failed to respond to sublingual GTN.</p>',
    resident: '<p>This is an <em>STEMI activation</em>. Anterior wall changes suggest LAD occlusion — likely proximal given V1–V4 involvement. Door-to-balloon target &lt; 90 minutes. Immediate priorities:</p><ol><li>Confirm diagnosis with 12-lead ECG and troponin</li><li>Activate cath lab</li><li>DAPT loaded (already given)</li><li>Anticoagulation — heparin bolus on call from interventionalist</li><li>Pain control with IV opioid</li></ol>',
    consultant: '<p>Anterior STEMI carries the highest mortality among STEMI subtypes due to large myocardium at risk. <strong>Primary PCI is standard of care</strong> if achievable within 120 min of first medical contact (Class I, ESC 2023).</p><p>Pre-PCI considerations:</p><ul><li><strong>Antiplatelet:</strong> Aspirin + ticagrelor (preferred over clopidogrel unless high bleeding risk)</li><li><strong>Anticoagulant:</strong> Unfractionated heparin 70–100 U/kg bolus, or bivalirudin if HIT history</li><li><strong>Rule out aortic dissection</strong> before anticoagulation if any concern (BP differential, tearing pain, mediastinal widening)</li></ul><p>Post-PCI: dual antiplatelet × 12 months minimum, high-intensity statin, beta-blocker, ACEi, aldosterone antagonist if EF &lt; 40%.</p>',
    teaching: '<ul><li><strong>Time is muscle:</strong> every 30-min delay in reperfusion increases 1-year mortality by ~8%</li><li><strong>ECG localization:</strong> V1–V4 = anterior (LAD); II, III, aVF = inferior (RCA); I, aVL, V5–V6 = lateral (LCx)</li><li><strong>Reciprocal changes</strong> in inferior leads strengthen the diagnosis of anterior STEMI</li><li><strong>Posterior MI clue:</strong> tall R waves and ST depression in V1–V3 (mirror image)</li><li>Always check <strong>right-sided leads (V4R)</strong> in inferior STEMI to detect RV involvement</li></ul>',
    orders: '<ul><li>Activate cath lab — primary PCI</li><li>Cardiac monitor, defib pads on</li><li>IV access × 2 (already in)</li><li>Bloods: troponin, CBC, U&amp;E, coag, lipid panel, HbA1c</li><li>Heparin 5000 U IV bolus on cath lab call</li><li>Morphine 2.5 mg IV PRN</li><li>O2 only if SpO2 &lt; 90%</li><li>NPO for procedure</li></ul>',
    nursing: '<ul><li>Continuous cardiac monitoring, alert MD for arrhythmia</li><li>Vital signs q15min until stable</li><li>Pain reassessment after analgesia</li><li>Femoral/radial site prep for arterial access</li><li>Document time of symptom onset, ECG, and cath lab activation</li><li>Family communication and consent witness</li></ul>',
    investigations: '<table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;border-bottom:1px solid #ccc;padding:6px">Test</th><th style="text-align:left;border-bottom:1px solid #ccc;padding:6px">Result</th><th style="text-align:left;border-bottom:1px solid #ccc;padding:6px">Reference</th></tr></thead><tbody><tr><td style="padding:6px">Troponin I</td><td style="padding:6px"><strong>2.4 ng/mL</strong> ↑↑</td><td style="padding:6px">&lt; 0.04</td></tr><tr><td style="padding:6px">CK-MB</td><td style="padding:6px">68 U/L ↑</td><td style="padding:6px">&lt; 25</td></tr><tr><td style="padding:6px">Creatinine</td><td style="padding:6px">1.0 mg/dL</td><td style="padding:6px">0.7–1.2</td></tr><tr><td style="padding:6px">K⁺</td><td style="padding:6px">4.1 mmol/L</td><td style="padding:6px">3.5–5.0</td></tr></tbody></table>',
    imaging: '<p><strong>12-lead ECG:</strong> Sinus tachycardia 112 bpm, ST elevation 3–4 mm in V1–V4, reciprocal ST depression in II, III, aVF. No Q waves yet.</p><p><strong>Echo (bedside):</strong> Anterior wall hypokinesis, EF estimated 40%, no pericardial effusion, no mechanical complication.</p>',
    medications: '<ul><li><strong>Aspirin</strong> 300 mg PO loading, then 81 mg daily</li><li><strong>Ticagrelor</strong> 180 mg PO loading, then 90 mg BD × 12 mo</li><li><strong>Atorvastatin</strong> 80 mg PO daily (high-intensity)</li><li><strong>Metoprolol</strong> 25 mg PO BD (start once hemodynamically stable)</li><li><strong>Lisinopril</strong> 5 mg PO daily (start within 24h)</li><li><strong>Heparin</strong> 70 U/kg IV bolus pre-PCI</li></ul>',
    monitoring: '<ul><li>Continuous telemetry × 48–72 h</li><li>Serial troponins q6h × 3</li><li>Repeat ECG post-PCI and daily</li><li>Echo within 24–48 h for EF assessment</li><li>Monitor for: arrhythmia, heart failure, mechanical complication, bleeding</li></ul>',
    complications: '<ul><li><strong>Cardiogenic shock</strong> (5–10% of anterior STEMI)</li><li><strong>VT/VF</strong> — most common in first 48 h</li><li><strong>Mechanical complications</strong> (days 3–7): VSD, papillary muscle rupture, free wall rupture</li><li><strong>Pericarditis</strong> (Dressler\'s) — weeks later</li><li><strong>LV thrombus</strong> in large anterior MI with apical akinesis</li><li><strong>Bleeding</strong> from access site or DAPT</li></ul>',
    differentials: '<ul><li><strong>Aortic dissection</strong> — tearing pain, BP differential, widened mediastinum</li><li><strong>Pulmonary embolism</strong> — pleuritic, dyspnea, S1Q3T3 on ECG</li><li><strong>Pericarditis</strong> — diffuse ST elevation with PR depression, positional pain</li><li><strong>Esophageal spasm / GERD</strong> — relieved by nitrates, may mimic</li><li><strong>Pneumothorax</strong> — sudden pleuritic pain, decreased breath sounds</li></ul>',
    plan: '<ol><li>Primary PCI to LAD — culprit lesion identified, DES placed</li><li>Admit to CCU post-procedure</li><li>Continue DAPT 12 months</li><li>Cardiac rehab referral</li><li>Risk factor modification: smoking cessation, lipid management, BP control</li><li>Follow-up echo in 3 months</li></ol>',
    progressNotes: '<p><strong>Day 1 post-PCI:</strong> Pain-free, hemodynamically stable, no arrhythmia. EF 40% on echo.</p><p><strong>Day 2:</strong> Ambulating, tolerating diet, beta-blocker tolerated.</p><p><strong>Day 3:</strong> Discharge planning initiated.</p>',
    discharge: '<p><strong>Discharge medications:</strong> Aspirin, ticagrelor, atorvastatin 80 mg, metoprolol, lisinopril.</p><p><strong>Lifestyle:</strong> Smoking cessation referral, cardiac rehab, Mediterranean diet, no driving × 1 week.</p><p><strong>Red flags:</strong> recurrent chest pain, dyspnea, syncope → ER immediately.</p><p><strong>Follow-up:</strong> Cardiology clinic in 2 weeks, GP in 1 week.</p>',
    pearls: '<ul><li>"Time is muscle" — door-to-balloon &lt; 90 min</li><li>Ticagrelor &gt; clopidogrel in most STEMI (PLATO trial)</li><li>High-intensity statin from day 1 regardless of LDL</li><li>Beta-blocker reduces mortality post-MI; start once stable, avoid in acute heart failure</li><li>Anterior STEMI = think LAD, anticipate LV dysfunction</li></ul>',
    mcqs: [
      { q: 'Which artery is most likely occluded in a STEMI with ST elevation in V1–V4?', options: ['Right coronary artery', 'Left circumflex', 'Left anterior descending', 'Posterior descending'], correct: 2, explain: 'V1–V4 represent the anterior wall, supplied by the LAD. Proximal LAD occlusion involves a large territory and carries high mortality.' },
      { q: 'The recommended door-to-balloon time in primary PCI for STEMI is:', options: ['< 30 min', '< 60 min', '< 90 min', '< 180 min'], correct: 2, explain: 'Guidelines (ACC/AHA, ESC) recommend door-to-balloon time < 90 minutes from first medical contact for primary PCI.' },
      { q: 'Which of the following is NOT a routine medication post-STEMI?', options: ['Aspirin', 'High-intensity statin', 'Calcium channel blocker', 'Beta-blocker'], correct: 2, explain: 'Calcium channel blockers are not routine post-STEMI. The "ABCS" of post-MI care: Aspirin, Beta-blocker, Cholesterol (statin), Smoking cessation, plus ACEi.' },
    ],
    labTrend: [
      { time: '0h', troponin: 2.4, ck: 68 },
      { time: '6h', troponin: 18, ck: 240 },
      { time: '12h', troponin: 42, ck: 410 },
      { time: '24h', troponin: 56, ck: 320 },
      { time: '48h', troponin: 28, ck: 110 },
    ],
  },
  {
    id: 'c-hf-002', hospital: 'cardiology', department: 'cv-hf', bedNumber: 1, title: 'Acute Decompensated Heart Failure',
    chiefComplaint: 'Worsening dyspnea and orthopnea × 1 week', system: 'Cardiology',
    severity: 'urgent', tags: ['HFrEF', 'Pulmonary edema', 'Diuresis'],
    profile: { name: 'Mrs. F.K.', age: 71, sex: 'Female', mrn: 'CV-10341', allergies: 'Sulfa', weight: '74 kg (up 4 kg)', occupation: 'Retired', pmh: 'HFrEF (EF 30%), DM2, AF, CKD stage 3' },
    vitals: { hr: 104, bp: '142/88', rr: 28, spo2: 89, temp: 36.8, gcs: 15 },
    handover: '<p>71-year-old female with known HFrEF presenting with progressive dyspnea, orthopnea (4 pillows), bilateral leg swelling. Stopped furosemide last week due to dizziness. Now hypoxic on room air, JVP elevated.</p>',
    assessment: '<p>In respiratory distress, sitting upright, tripod position. JVP +8 cm, bilateral basal crackles to mid-zones, S3 gallop, pitting edema to knees.</p>',
    resident: '<p>Classic <strong>"warm and wet"</strong> profile — congested but perfused. Priority: diuresis with IV loop diuretic, oxygen, BiPAP if worsening hypoxia. Identify precipitant — non-adherence to diuretic is the likely trigger.</p>',
    consultant: '<p>Approach acute HF using the <strong>Forrester / Stevenson classification</strong>: assess perfusion (warm vs cold) and congestion (dry vs wet). This patient is warm-and-wet → diuresis without inotropes. Watch for cardiorenal syndrome with aggressive diuresis and CKD.</p><p>Foundational therapies for HFrEF (the "four pillars"): ARNI/ACEi, beta-blocker, MRA, SGLT2 inhibitor. Start/optimize during admission.</p>',
    teaching: '<ul><li>Common HF decompensation triggers: <strong>FAILURE</strong> — Forgot meds, Arrhythmia, Ischemia, Lifestyle (salt/fluid), Upregulation (pregnancy, thyroid), Renal failure, Embolism (PE)</li><li>BNP &gt; 400 supports HF; &lt; 100 makes it unlikely</li><li>Daily weights are more reliable than I/O charts</li></ul>',
    orders: '<ul><li>Furosemide 80 mg IV stat, then 40 mg IV BD (titrate to UOP &gt; 100 mL/h)</li><li>Strict I/O, daily weights</li><li>Fluid restriction 1.5 L/day</li><li>Salt restriction &lt; 2 g/day</li><li>BiPAP if RR &gt; 30 or SpO2 &lt; 90% on O2</li><li>ECG, CXR, echo, BNP, U&amp;E daily</li></ul>',
    nursing: '<ul><li>Sit patient upright, supplemental O2 to keep SpO2 &gt; 92%</li><li>Strict fluid balance, hourly UOP</li><li>Daily weight at same time, same scale</li><li>Skin care for edematous limbs</li><li>Education on med adherence and salt</li></ul>',
    investigations: '<p><strong>BNP:</strong> 1,840 pg/mL (↑↑)<br><strong>Creatinine:</strong> 1.6 mg/dL (baseline 1.4)<br><strong>K⁺:</strong> 4.5<br><strong>Hb:</strong> 11.2 g/dL<br><strong>TSH:</strong> normal</p>',
    imaging: '<p><strong>CXR:</strong> Cardiomegaly, bilateral pulmonary congestion, Kerley B lines, small bilateral pleural effusions.<br><strong>Echo:</strong> EF 28% (was 30%), severe MR, dilated LA, no pericardial effusion.</p>',
    medications: '<ul><li><strong>IV furosemide</strong> — initial dose 2.5× home oral dose</li><li><strong>Sacubitril/valsartan</strong> — start once hemodynamically stable, off ACEi for 36 h</li><li><strong>Bisoprolol</strong> — continue if not in cardiogenic shock</li><li><strong>Spironolactone</strong> 25 mg daily (monitor K⁺, Cr)</li><li><strong>Dapagliflozin</strong> 10 mg daily</li></ul>',
    monitoring: '<ul><li>Telemetry, q4h vitals</li><li>Daily weight, U&amp;E, fluid balance</li><li>Repeat BNP if unclear response</li><li>Watch for hypotension, AKI, hypokalemia</li></ul>',
    complications: '<ul><li>Cardiorenal syndrome</li><li>Hypokalemia / hyponatremia</li><li>Diuretic resistance</li><li>Cardiogenic shock</li><li>Arrhythmia (AF with RVR)</li></ul>',
    differentials: '<ul><li>Pneumonia</li><li>COPD exacerbation</li><li>Pulmonary embolism</li><li>ARDS</li><li>Renal failure with volume overload</li></ul>',
    plan: '<ol><li>Aggressive IV diuresis to euvolemia</li><li>Optimize GDMT (4 pillars)</li><li>Identify and address precipitant</li><li>Cardiac rehab, education on adherence</li><li>HF clinic follow-up in 1–2 weeks</li></ol>',
    progressNotes: '<p>Day 2: Net negative 2.5 L, dyspnea improving. Day 4: Off O2, transitioned to oral diuretic. Day 5: Discharge.</p>',
    discharge: '<p>Resume optimized GDMT, daily weights, salt and fluid restriction, follow-up in HF clinic 1–2 weeks. Red flags: weight gain &gt;2 kg in 3 days, increased SOB.</p>',
    pearls: '<ul><li>Diuretic dose: IV bolus = 2.5× home oral dose</li><li>Spironolactone reduces mortality in HFrEF (RALES)</li><li>SGLT2i benefit independent of diabetes (DAPA-HF, EMPEROR)</li><li>BiPAP reduces intubation rate in cardiogenic pulmonary edema</li></ul>',
    mcqs: [
      { q: 'Which is NOT one of the four pillars of HFrEF therapy?', options: ['ARNI/ACEi', 'Beta-blocker', 'Calcium channel blocker', 'SGLT2 inhibitor'], correct: 2, explain: 'The four pillars are ARNI/ACEi, beta-blocker, MRA, and SGLT2 inhibitor. Non-dihydropyridine CCBs are contraindicated in HFrEF.' },
      { q: 'A "warm and wet" patient profile indicates:', options: ['Hypoperfusion with congestion', 'Hypoperfusion without congestion', 'Adequate perfusion with congestion', 'Adequate perfusion without congestion'], correct: 2, explain: 'Warm = adequate perfusion; wet = congestion. Treatment is diuresis without inotropes.' },
    ],
    labTrend: [
      { time: 'D1', bnp: 1840, creat: 1.6, weight: 74 },
      { time: 'D2', bnp: 1420, creat: 1.7, weight: 72.5 },
      { time: 'D3', bnp: 980,  creat: 1.6, weight: 71 },
      { time: 'D4', bnp: 620,  creat: 1.5, weight: 70 },
      { time: 'D5', bnp: 410,  creat: 1.5, weight: 69.5 },
    ],
  },
  {
    id: 'c-sepsis-003', hospital: 'internal', department: 'im-icu', bedNumber: 1, title: 'Septic Shock from UTI',
    chiefComplaint: 'Confusion and fever × 12 h', system: 'Internal Medicine',
    severity: 'critical', tags: ['Sepsis', 'Shock', 'Antibiotics'],
    profile: { name: 'Mr. S.M.', age: 78, sex: 'Male', mrn: 'IM-20455', allergies: 'Penicillin (rash)', weight: '68 kg', occupation: 'Retired teacher', pmh: 'BPH, DM2, recent urinary catheter' },
    vitals: { hr: 124, bp: '82/48', rr: 28, spo2: 92, temp: 39.2, gcs: 13 },
    handover: '<p>Brought in by family — fever, rigors, confusion, low urine output, recent indwelling catheter. Lactate 4.6, hypotensive despite 2 L crystalloid bolus.</p>',
    assessment: '<p>Looks unwell, mottled extremities, dry mucous membranes, suprapubic tenderness, foul-smelling urine in catheter bag. CRT 4 sec.</p>',
    resident: '<p><strong>Septic shock</strong> — qSOFA ≥ 2, MAP &lt; 65 despite fluids, lactate &gt; 2. Hour-1 sepsis bundle: cultures, broad-spectrum antibiotics, lactate, fluids, vasopressors if needed.</p>',
    consultant: '<p>Surviving Sepsis Campaign 2021: <strong>Hour-1 bundle</strong> — measure lactate, blood cultures BEFORE antibiotics (do not delay), broad-spectrum antibiotics within 1 h, 30 mL/kg crystalloid for hypotension or lactate ≥ 4, vasopressors to MAP ≥ 65.</p><p>Empirical antibiotics for urosepsis in elderly: cover Gram-negative, consider ESBL if recent healthcare exposure → <strong>piperacillin-tazobactam</strong> or <strong>meropenem</strong> if high risk.</p>',
    teaching: '<ul><li>qSOFA: SBP ≤ 100, RR ≥ 22, altered mentation — ≥ 2 = high risk</li><li>Lactate clearance correlates with survival</li><li>Norepinephrine is first-line vasopressor</li><li>Source control is as important as antibiotics</li></ul>',
    orders: '<ul><li>Blood cultures × 2, urine culture</li><li>Lactate, CBC, U&amp;E, LFTs, coag, procalcitonin</li><li>Piperacillin-tazobactam 4.5 g IV stat</li><li>30 mL/kg crystalloid bolus</li><li>Norepinephrine if MAP &lt; 65 after fluids</li><li>Foley catheter exchange (source control)</li><li>Lactate q2h until normalized</li></ul>',
    nursing: '<ul><li>Hourly UOP, MAP target ≥ 65</li><li>Strict I/O</li><li>Sepsis bundle compliance documentation</li><li>Skin and pressure area care</li><li>Family communication</li></ul>',
    investigations: '<p>WBC 18.4, Lactate 4.6 → 2.1 → 1.4, Procalcitonin 28, Cr 1.9 (baseline 1.0), urine: leukocytes ++, nitrites +, blood culture: <em>E. coli</em> (sensitive to pip-tazo).</p>',
    imaging: '<p>CXR clear, CT abdomen/pelvis: no obstruction, no abscess, mild bilateral hydronephrosis from chronic BPH.</p>',
    medications: '<ul><li>Piperacillin-tazobactam 4.5 g IV q6h × 7–10 days (de-escalate per culture)</li><li>Norepinephrine titrated to MAP ≥ 65</li><li>Stress-dose hydrocortisone if pressor-dependent</li><li>VTE prophylaxis once stable</li></ul>',
    monitoring: '<ul><li>ICU monitoring, arterial line</li><li>Lactate, ABG q4h</li><li>Daily cultures review and de-escalation</li><li>Watch for AKI, ARDS, DIC</li></ul>',
    complications: '<ul><li>Multi-organ dysfunction</li><li>AKI requiring CRRT</li><li>DIC</li><li>ICU-acquired weakness</li><li>Antibiotic-associated <em>C. difficile</em></li></ul>',
    differentials: '<ul><li>Cardiogenic shock</li><li>Hypovolemic shock</li><li>Anaphylaxis</li><li>Adrenal crisis</li><li>Massive PE</li></ul>',
    plan: '<ol><li>Source control (catheter exchange done)</li><li>De-escalate antibiotics per culture sensitivity</li><li>Wean vasopressor as MAP recovers</li><li>Step-down to ward when stable × 24 h</li><li>Geriatric assessment, deconditioning prevention</li></ol>',
    progressNotes: '<p>Day 2: Lactate normalized, off norepinephrine. Day 4: Step-down to ward. Day 7: Discharge planned.</p>',
    discharge: '<p>Complete oral antibiotic course, urology follow-up for BPH/catheter, return if fever, dysuria, or confusion.</p>',
    pearls: '<ul><li>"Time is tissue" in sepsis — antibiotics within 1 h save lives</li><li>Beware of "occult shock" — normal BP does not exclude sepsis if lactate ↑</li><li>Source control trumps antibiotics — find and drain</li><li>De-escalate within 48–72 h based on cultures</li></ul>',
    mcqs: [
      { q: 'In the Hour-1 sepsis bundle, antibiotics should be given:', options: ['Before cultures, regardless', 'After cultures, within 1 h', 'After CT confirms source', 'Only if MAP < 65'], correct: 1, explain: 'Cultures should be drawn BEFORE antibiotics, but antibiotics must not be delayed beyond 1 h. If cultures cannot be drawn rapidly, give antibiotics first.' },
      { q: 'First-line vasopressor in septic shock is:', options: ['Dopamine', 'Norepinephrine', 'Vasopressin', 'Phenylephrine'], correct: 1, explain: 'Norepinephrine is first-line per Surviving Sepsis guidelines. Vasopressin can be added as second agent.' },
    ],
    labTrend: [
      { time: '0h', lactate: 4.6, wbc: 18.4, mapVal: 58 },
      { time: '3h', lactate: 3.2, wbc: 17.1, mapVal: 65 },
      { time: '6h', lactate: 2.1, wbc: 15.2, mapVal: 72 },
      { time: '12h', lactate: 1.4, wbc: 13.0, mapVal: 78 },
      { time: '24h', lactate: 1.1, wbc: 11.2, mapVal: 82 },
    ],
  },
  {
    id: 'c-pe-004', hospital: 'internal', department: 'im-resp', bedNumber: 1, title: 'Massive Pulmonary Embolism',
    chiefComplaint: 'Sudden dyspnea and syncope', system: 'Internal Medicine',
    severity: 'critical', tags: ['PE', 'Anticoagulation', 'Thrombolysis'],
    profile: { name: 'Ms. R.D.', age: 64, sex: 'Female', mrn: 'IM-20488', allergies: 'NKDA', weight: '88 kg', occupation: 'Office worker', pmh: 'Recent knee surgery 2 wks ago, OCP, obesity' },
    vitals: { hr: 128, bp: '88/56', rr: 32, spo2: 86, temp: 37.4, gcs: 14 },
    handover: '<p>Sudden dyspnea while standing, brief syncope, persistent tachycardia and hypoxia. Recent knee surgery. PE is the leading suspicion.</p>',
    assessment: '<p>Tachypneic, hypoxic, JVP raised, accentuated P2, no leg swelling visible but right calf tender.</p>',
    resident: '<p>High-risk (massive) PE — hemodynamic instability with SBP &lt; 90. CT pulmonary angiogram if stable enough; otherwise bedside echo for RV strain. <strong>Systemic thrombolysis</strong> indicated unless contraindicated.</p>',
    consultant: '<p>Risk stratification: <strong>massive PE</strong> = SBP &lt; 90 or pressor requirement; <strong>submassive</strong> = RV dysfunction without hypotension; <strong>low-risk</strong> = neither.</p><p>Massive PE → <strong>thrombolysis</strong> (alteplase 100 mg over 2 h) if no contraindication, OR catheter-directed thrombolysis, OR surgical embolectomy.</p>',
    teaching: '<ul><li>Wells score and PERC rule for pre-test probability</li><li>D-dimer is sensitive but not specific — high NPV</li><li>CTPA is gold standard if stable</li><li>RV/LV ratio &gt; 0.9 on CT or echo = RV strain</li></ul>',
    orders: '<ul><li>O2 to SpO2 &gt; 94%</li><li>IV access × 2, fluids cautiously (avoid RV overload)</li><li>CTPA stat if stable, else bedside echo</li><li>Heparin bolus 80 U/kg, then infusion</li><li>Alteplase 100 mg IV over 2 h if confirmed massive PE</li><li>Troponin, BNP, ABG</li></ul>',
    nursing: '<ul><li>Continuous SpO2 and BP monitoring</li><li>Bleeding precautions during/after thrombolysis</li><li>Strict bed rest initially</li><li>Neurological checks q15 min during lysis</li></ul>',
    investigations: '<p>Troponin 0.18 ↑, BNP 380 ↑, D-dimer 8.2 (very high), ABG: pH 7.48, pCO2 28, pO2 58 on RA.</p>',
    imaging: '<p><strong>CTPA:</strong> Saddle embolus extending into both main pulmonary arteries with multiple lobar filling defects. RV/LV ratio 1.3 — RV strain.<br><strong>Echo:</strong> Dilated, hypokinetic RV, McConnell sign present, TR jet 3.6 m/s.</p>',
    medications: '<ul><li>Alteplase 100 mg IV over 2 h (massive PE)</li><li>Unfractionated heparin infusion (target aPTT 60–80)</li><li>Transition to DOAC (apixaban or rivaroxaban) at discharge</li></ul>',
    monitoring: '<ul><li>HDU/ICU for first 24–48 h</li><li>Hemodynamics, SpO2, neuro checks</li><li>Daily CBC, coag</li><li>Repeat echo before discharge</li></ul>',
    complications: '<ul><li>Major bleeding (intracranial 2–3%)</li><li>Recurrent PE</li><li>Chronic thromboembolic pulmonary hypertension (CTEPH)</li><li>RV failure, cardiogenic shock</li></ul>',
    differentials: '<ul><li>Acute MI</li><li>Aortic dissection</li><li>Tension pneumothorax</li><li>Cardiac tamponade</li><li>Sepsis</li></ul>',
    plan: '<ol><li>Thrombolysis given, transition to anticoagulation</li><li>DOAC for 6+ months — consider indefinite if unprovoked</li><li>Workup for thrombophilia if recurrent</li><li>Cancer screening age-appropriate</li><li>Compression stockings, mobilization</li></ol>',
    progressNotes: '<p>Day 1: Hemodynamics improved post-lysis, off O2 by day 2. Day 5: Discharged on apixaban.</p>',
    discharge: '<p>Apixaban 10 mg BD × 7 days, then 5 mg BD. Hematology follow-up. Avoid OCP. Red flags: chest pain, SOB, leg swelling, bleeding.</p>',
    pearls: '<ul><li>McConnell sign on echo = RV free wall hypokinesis with apical sparing — specific for acute PE</li><li>Massive PE mortality 30–50% without treatment</li><li>DOACs preferred over warfarin for most VTE</li><li>Avoid IVC filter unless anticoagulation is contraindicated</li></ul>',
    mcqs: [
      { q: 'Massive PE is defined by:', options: ['RV strain on echo', 'Troponin elevation', 'SBP < 90 mmHg or pressor requirement', 'Saddle embolus on CT'], correct: 2, explain: 'Massive PE is defined hemodynamically — SBP < 90 mmHg or shock — regardless of clot burden on imaging.' },
      { q: 'McConnell sign refers to:', options: ['LV apical ballooning', 'RV free wall hypokinesis with apical sparing', 'Septal flattening', 'Pericardial tamponade'], correct: 1, explain: 'McConnell sign — RV free wall akinesis with preserved apical contraction — is a specific echo finding in acute PE.' },
    ],
    labTrend: [
      { time: '0h',  spo2Val: 86, hr: 128, rvRatio: 1.3 },
      { time: '6h',  spo2Val: 92, hr: 110, rvRatio: 1.2 },
      { time: '24h', spo2Val: 96, hr: 92,  rvRatio: 1.0 },
      { time: '48h', spo2Val: 98, hr: 84,  rvRatio: 0.9 },
    ],
  },
  {
    id: 'c-dka-005', hospital: 'internal', department: 'im-endo', bedNumber: 1, title: 'Diabetic Ketoacidosis',
    chiefComplaint: 'Vomiting and lethargy in a known diabetic', system: 'Internal Medicine',
    severity: 'urgent', tags: ['Endocrine', 'DKA', 'Insulin'],
    profile: { name: 'Mr. Y.A.', age: 22, sex: 'Male', mrn: 'IM-20512', allergies: 'NKDA', weight: '64 kg', occupation: 'Student', pmh: 'T1DM × 8 yrs, missed insulin × 2 days due to gastro' },
    vitals: { hr: 116, bp: '108/68', rr: 28, spo2: 99, temp: 37.0, gcs: 14 },
    handover: '<p>Type 1 diabetic, ran out of insulin × 2 days, now vomiting, Kussmaul breathing, abdominal pain.</p>',
    assessment: '<p>Dehydrated, fruity breath, deep sighing respirations, mild abdominal tenderness, no peritonism.</p>',
    resident: '<p>Classic DKA — meets the triad: <strong>hyperglycemia, ketonemia, anion-gap metabolic acidosis</strong>. Initiate fluids first, then insulin infusion, monitor K⁺ closely.</p>',
    consultant: '<p>DKA management: <strong>F-I-G-K-A</strong> — Fluids, Insulin, Glucose, Potassium, Address precipitant. Always replace K⁺ before insulin if K⁺ &lt; 3.3. Add dextrose to fluids when glucose &lt; 250 to allow continued insulin and ketone clearance.</p>',
    teaching: '<ul><li>Anion gap = Na − (Cl + HCO3); normal 8–12</li><li>Insulin clears ketones, not just glucose — continue until gap closes</li><li>Cerebral edema risk in pediatrics with rapid correction</li><li>Look for precipitant: <strong>5 I\'s</strong> — Insulin omission, Infection, Infarction, Ischemia (gut), Intoxication</li></ul>',
    orders: '<ul><li>0.9% saline 1 L over 1 h, then 250–500 mL/h titrated</li><li>Insulin infusion 0.1 U/kg/h after K⁺ confirmed ≥ 3.3</li><li>K⁺ replacement when K⁺ &lt; 5.3</li><li>Dextrose 5% added when glucose &lt; 250</li><li>VBG, U&amp;E, glucose, ketones q2h</li><li>Look for precipitant: ECG, troponin, CBC, urinalysis</li></ul>',
    nursing: '<ul><li>Hourly glucose, q2h electrolytes</li><li>Strict I/O</li><li>Watch for cerebral edema — headache, ↓ GCS</li><li>Diabetes education before discharge</li></ul>',
    investigations: '<p>Glucose 480 mg/dL, pH 7.18, HCO3 8, AG 22, β-hydroxybutyrate 5.8, K⁺ 5.4, Na⁺ 134, Cr 1.4.</p>',
    imaging: '<p>CXR clear, ECG sinus tachycardia, no ischemia.</p>',
    medications: '<ul><li>Insulin infusion 0.1 U/kg/h</li><li>0.9% saline initially, switch to 0.45% if Na corrects rapidly</li><li>KCl per protocol</li><li>Subcutaneous long-acting insulin 2 h before stopping infusion</li></ul>',
    monitoring: '<ul><li>Hourly glucose</li><li>q2h electrolytes, VBG</li><li>Continue insulin infusion until AG closes &lt; 12 AND HCO3 &gt; 18</li><li>Watch for hypokalemia (most common iatrogenic complication)</li></ul>',
    complications: '<ul><li>Hypokalemia, hypoglycemia</li><li>Cerebral edema (esp. children)</li><li>ARDS</li><li>Recurrent DKA from premature insulin discontinuation</li></ul>',
    differentials: '<ul><li>HHS (older, usually T2DM, glucose &gt; 600, minimal ketosis)</li><li>Lactic acidosis</li><li>Salicylate / methanol / ethylene glycol toxicity</li><li>Starvation ketosis</li></ul>',
    plan: '<ol><li>Resolve DKA per protocol</li><li>Transition to subcutaneous insulin once stable</li><li>Diabetes education, insulin pump consideration</li><li>Endocrinology follow-up</li><li>Address adherence barriers</li></ol>',
    progressNotes: '<p>Day 1: Gap closed by 12 h, transitioned to SC insulin day 2, eating well day 3.</p>',
    discharge: '<p>Resume basal-bolus insulin, diabetes nurse education, sick-day rules, follow-up endocrinology in 1 week.</p>',
    pearls: '<ul><li>Never stop insulin in T1DM — even when not eating, basal is mandatory</li><li>Sick-day rules: more insulin, more fluids, more checks</li><li>K⁺ falls with insulin therapy — replace early</li><li>Bicarbonate only if pH &lt; 6.9</li></ul>',
    mcqs: [
      { q: 'In DKA, insulin should be withheld until potassium is at least:', options: ['2.5', '3.3', '4.0', '5.0'], correct: 1, explain: 'If K⁺ < 3.3 mmol/L, withhold insulin and replace K⁺ first to avoid life-threatening hypokalemia.' },
      { q: 'Which finding distinguishes DKA from HHS?', options: ['Hyperglycemia', 'Significant ketonemia and acidosis', 'Dehydration', 'Altered mental status'], correct: 1, explain: 'DKA has prominent ketonemia and high-anion-gap acidosis; HHS has minimal ketosis with extreme hyperglycemia and hyperosmolarity.' },
    ],
    labTrend: [
      { time: '0h',  glucose: 480, ph: 7.18, hco3: 8 },
      { time: '4h',  glucose: 320, ph: 7.24, hco3: 12 },
      { time: '8h',  glucose: 220, ph: 7.30, hco3: 16 },
      { time: '12h', glucose: 180, ph: 7.36, hco3: 20 },
      { time: '24h', glucose: 150, ph: 7.40, hco3: 23 },
    ],
  },
];

// ============== ECG GENERATOR ==============
function generateECGPath(pattern = 'normal', width = 800, height = 120) {
  const points = [];
  const step = 2;
  const baseY = height / 2;
  const cycles = 8;
  const cycleLen = width / cycles;

  for (let x = 0; x < width; x += step) {
    const phase = (x % cycleLen) / cycleLen;
    let y = baseY;

    if (pattern === 'normal') {
      if (phase < 0.05) y = baseY - 4 * Math.sin(phase * Math.PI / 0.05); // P
      else if (phase >= 0.1 && phase < 0.13) y = baseY + 6;                // Q
      else if (phase >= 0.13 && phase < 0.16) y = baseY - 35;              // R
      else if (phase >= 0.16 && phase < 0.19) y = baseY + 10;              // S
      else if (phase >= 0.3 && phase < 0.4) y = baseY - 8 * Math.sin((phase - 0.3) * Math.PI / 0.1); // T
    } else if (pattern === 'stemi') {
      if (phase < 0.05) y = baseY - 4 * Math.sin(phase * Math.PI / 0.05);
      else if (phase >= 0.1 && phase < 0.13) y = baseY + 6;
      else if (phase >= 0.13 && phase < 0.16) y = baseY - 35;
      else if (phase >= 0.16 && phase < 0.19) y = baseY + 10;
      else if (phase >= 0.19 && phase < 0.45) y = baseY - 18; // ST elevation
      else if (phase >= 0.45 && phase < 0.55) y = baseY - 22 * Math.sin((phase - 0.45) * Math.PI / 0.1);
    } else if (pattern === 'afib') {
      const irreg = Math.random() * 4 - 2;
      if (phase < 0.13 + irreg * 0.01) y = baseY + Math.sin(x * 0.5) * 2;
      else if (phase >= 0.13 && phase < 0.17) y = baseY - 30;
      else if (phase >= 0.17 && phase < 0.2) y = baseY + 8;
      else if (phase >= 0.3 && phase < 0.4) y = baseY - 6;
    } else if (pattern === 'vt') {
      y = baseY + Math.sin(x * 0.15) * 30;
    }

    points.push(`${x},${y}`);
  }
  return 'M' + points.join(' L ');
}

// ============== UTILITIES ==============
const cx = (...c) => c.filter(Boolean).join(' ');

const useLocal = (key, initial) => {
  const [v, setV] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; }
    catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV];
};

// ============== IMAGE COMPRESSION ==============
// Compresses an uploaded image to a sensible size before storing.
// Returns a Promise<dataURL>.
async function compressImage(file, { maxDim = 1600, quality = 0.82, mime = 'image/jpeg' } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        let w = width, h = height;
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        // Smooth high-quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        // White background for transparent PNGs being saved as JPEG
        if (mime === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const dataUrl = canvas.toDataURL(mime, quality);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ============== AUTH HOOK ==============
function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Check admin status whenever session changes
  useEffect(() => {
    if (session?.user?.email) {
      isUserAdmin(session.user.email).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [session?.user?.email]);

  return { session, loading, isAdmin, user: session?.user || null };
}

// ============== RICH TEXT EDITOR ==============
// ============== STAGE HELPERS ==============
// Each case can have a custom `stages` array: [{ id, key, label, icon, color, removed? }]
// If not present, the global STAGES list is used.
function getCaseStages(caseData) {
  if (!caseData?.stages || !Array.isArray(caseData.stages) || caseData.stages.length === 0) {
    return STAGES;
  }
  // Re-attach the icon component since icons aren't serializable
  return caseData.stages
    .filter(s => !s.removed)
    .map(s => {
      const original = STAGES.find(o => o.key === s.key);
      return {
        ...original,
        ...s,
        icon: original?.icon || ClipboardList,
      };
    });
}

// ============== ADVANCED RICH TEXT EDITOR ==============
function RichTextEditor({ value, onChange, placeholder = 'Write content...', minH = 240 }) {
  const ref = useRef(null);
  const fileInputRef = useRef(null);
  const ecgInputRef = useRef(null);
  const [active, setActive] = useState({});
  const [showColor, setShowColor] = useState(false);
  const [showHilite, setShowHilite] = useState(false);
  const [showInsert, setShowInsert] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [showSize, setShowSize] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [sourceDraft, setSourceDraft] = useState('');
  const savedRangeRef = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  // Save selection so we can restore it after clicking toolbar buttons
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    } else {
      ref.current?.focus();
    }
  };

  const exec = (cmd, val = null) => {
    restoreSelection();
    document.execCommand(cmd, false, val);
    handleInput();
  };

  const insertHTML = (html) => {
    restoreSelection();
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML);
    const a = {};
    ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript',
     'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
     'insertUnorderedList', 'insertOrderedList'
    ].forEach(c => {
      try { a[c] = document.queryCommandState(c); } catch {}
    });
    setActive(a);
    saveSelection();
  };

  // ===== File upload handlers =====
  const handleImageUpload = async (e, kind = 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('File too large (max 25MB before compression).');
      e.target.value = '';
      return;
    }
    try {
      // ECG/imaging files are usually photos of strips/films — keep higher quality.
      // Regular content images are heavily compressed.
      const opts = kind === 'ecg'
        ? { maxDim: 2000, quality: 0.88, mime: 'image/jpeg' }
        : { maxDim: 1600, quality: 0.82, mime: 'image/jpeg' };
      const dataUrl = await compressImage(file, opts);
      const caption = prompt(kind === 'ecg' ? 'ECG / Imaging caption (e.g. "Lead II — ST elevation")' : 'Optional caption (leave empty for none):') || '';
      const figClass = kind === 'ecg' ? 'rte-figure rte-ecg' : 'rte-figure';
      const html = `
<figure class="${figClass}" contenteditable="false">
  <img src="${dataUrl}" alt="${caption.replace(/"/g, '&quot;')}" />
  ${caption ? `<figcaption>${caption}</figcaption>` : ''}
</figure><p><br></p>`;
      insertHTML(html);
    } catch (err) {
      alert('Image processing failed: ' + (err?.message || 'unknown error'));
    }
    e.target.value = '';
  };

  // ===== YouTube embed =====
  const insertYouTube = () => {
    const url = prompt('Paste YouTube URL or video ID:');
    if (!url) return;
    let id = '';
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{6,})/);
    if (m) id = m[1];
    else if (/^[a-zA-Z0-9_-]{6,}$/.test(url.trim())) id = url.trim();
    else { alert('Could not parse a YouTube ID from that URL.'); return; }
    const html = `
<div class="rte-embed" contenteditable="false">
  <iframe src="https://www.youtube.com/embed/${id}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div><p><br></p>`;
    insertHTML(html);
  };

  // ===== Generic video URL embed =====
  const insertVideoURL = () => {
    const url = prompt('Paste video URL (mp4/webm or any direct video link):');
    if (!url) return;
    const html = `
<div class="rte-embed rte-video" contenteditable="false">
  <video src="${url}" controls preload="metadata"></video>
</div><p><br></p>`;
    insertHTML(html);
  };

  // ===== Insert table =====
  const insertTable = () => {
    const dim = prompt('Rows × columns (e.g. "3x4"):', '3x3');
    if (!dim) return;
    const m = dim.match(/(\d+)\s*[xX×]\s*(\d+)/);
    if (!m) return;
    const rows = Math.min(20, parseInt(m[1]));
    const cols = Math.min(10, parseInt(m[2]));
    let html = '<table class="rte-table"><thead><tr>';
    for (let c = 0; c < cols; c++) html += `<th>Header ${c + 1}</th>`;
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows - 1; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) html += '<td>&nbsp;</td>';
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    insertHTML(html);
  };

  // ===== Callout / pearl / warning blocks =====
  const insertCallout = (kind) => {
    const map = {
      pearl: { cls: 'rte-callout rte-pearl', label: '💡 Clinical Pearl', body: 'Type your pearl here…' },
      warn:  { cls: 'rte-callout rte-warn',  label: '⚠️ Warning',        body: 'Type your warning here…' },
      info:  { cls: 'rte-callout rte-info',  label: 'ℹ️ Note',            body: 'Type your note here…' },
    };
    const c = map[kind];
    insertHTML(`<div class="${c.cls}"><strong>${c.label}</strong><p>${c.body}</p></div><p><br></p>`);
  };

  const insertHR = () => insertHTML('<hr/>');

  const insertCodeBlock = () => insertHTML('<pre><code>// code…</code></pre><p><br></p>');

  const handleSourceToggle = () => {
    if (!showSource) {
      setSourceDraft(value || '');
      setShowSource(true);
    } else {
      onChange(sourceDraft);
      setShowSource(false);
    }
  };

  // ===== Toolbar button =====
  const Btn = ({ cmd, val, icon: Icon, label, onClick, isActive }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        else exec(cmd, val);
      }}
      title={label}
      className={cx(
        'p-1.5 rounded-md transition-all flex items-center justify-center',
        (isActive ?? active[cmd])
          ? 'bg-teal-500 text-white'
          : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
      )}
    >
      <Icon size={15} />
    </button>
  );

  const Divider = () => <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-0.5" />;

  // Color palette
  const colors = ['#0f172a', '#475569', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#ffffff'];
  const hilites = ['transparent', '#fef9c3', '#bbf7d0', '#bae6fd', '#fbcfe8', '#fed7aa', '#fecaca', '#e9d5ff'];

  const sizes = [
    { label: 'Small', val: '2' },
    { label: 'Normal', val: '3' },
    { label: 'Medium', val: '4' },
    { label: 'Large', val: '5' },
    { label: 'Huge', val: '6' },
  ];

  return (
    <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/40">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleImageUpload(e, 'image')} />
      <input ref={ecgInputRef} type="file" accept="image/*,application/pdf" className="hidden"
        onChange={(e) => handleImageUpload(e, 'ecg')} />

      {/* Toolbar — Row 1: Inline formatting */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <Btn cmd="undo" icon={Undo2} label="Undo (Ctrl+Z)" />
        <Btn cmd="redo" icon={Redo2} label="Redo (Ctrl+Shift+Z)" />
        <Divider />
        <Btn cmd="bold" icon={Bold} label="Bold" />
        <Btn cmd="italic" icon={Italic} label="Italic" />
        <Btn cmd="underline" icon={Underline} label="Underline" />
        <Btn cmd="strikeThrough" icon={Strikethrough} label="Strikethrough" />
        <Btn cmd="subscript" icon={Subscript} label="Subscript (e.g. H₂O)" />
        <Btn cmd="superscript" icon={Superscript} label="Superscript (e.g. m²)" />
        <Divider />

        {/* Text color */}
        <div className="relative">
          <Btn icon={Type} label="Text color" onClick={() => { saveSelection(); setShowColor(s => !s); setShowHilite(false); }} />
          {showColor && (
            <div className="absolute top-full left-0 mt-1 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl grid grid-cols-6 gap-1">
              {colors.map(c => (
                <button key={c} type="button" onMouseDown={(e) => { e.preventDefault(); exec('foreColor', c); setShowColor(false); }}
                  className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                  style={{ background: c }} title={c}/>
              ))}
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <Btn icon={Highlighter} label="Highlight" onClick={() => { saveSelection(); setShowHilite(s => !s); setShowColor(false); }} />
          {showHilite && (
            <div className="absolute top-full left-0 mt-1 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl grid grid-cols-4 gap-1">
              {hilites.map(c => (
                <button key={c} type="button" onMouseDown={(e) => { e.preventDefault(); exec('hiliteColor', c === 'transparent' ? 'transparent' : c); setShowHilite(false); }}
                  className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 hover:scale-110"
                  style={{ background: c === 'transparent' ? 'repeating-linear-gradient(45deg, #fff, #fff 4px, #ddd 4px, #ddd 8px)' : c }} title={c}/>
              ))}
            </div>
          )}
        </div>

        {/* Font size */}
        <div className="relative">
          <Btn icon={Hash} label="Font size" onClick={() => { saveSelection(); setShowSize(s => !s); }} />
          {showSize && (
            <div className="absolute top-full left-0 mt-1 z-50 p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl min-w-[140px]">
              {sizes.map(s => (
                <button key={s.val} type="button" onMouseDown={(e) => { e.preventDefault(); exec('fontSize', s.val); setShowSize(false); }}
                  className="block w-full text-left px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
                  style={{ fontSize: { '2': '11px', '3': '14px', '4': '16px', '5': '20px', '6': '26px' }[s.val] }}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Btn cmd="removeFormat" icon={Eraser} label="Clear formatting" />
      </div>

      {/* Toolbar — Row 2: Block formatting + alignment */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/30">
        {/* Block style */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowBlock(s => !s); }}
            className="px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
          >
            Paragraph <ChevronDown size={12} />
          </button>
          {showBlock && (
            <div className="absolute top-full left-0 mt-1 z-50 p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl min-w-[160px]">
              {[
                { label: 'Paragraph', val: 'p', tag: 'p' },
                { label: 'Heading 1', val: 'h1', tag: 'h1' },
                { label: 'Heading 2', val: 'h2', tag: 'h2' },
                { label: 'Heading 3', val: 'h3', tag: 'h3' },
                { label: 'Heading 4', val: 'h4', tag: 'h4' },
                { label: 'Quote', val: 'blockquote', tag: 'blockquote' },
                { label: 'Preformatted', val: 'pre', tag: 'pre' },
              ].map(b => {
                const Tag = b.tag;
                return (
                  <button key={b.val} type="button" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', b.val); setShowBlock(false); }}
                    className="block w-full text-left px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">
                    <Tag style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>{b.label}</Tag>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <Divider />

        <Btn cmd="justifyLeft" icon={AlignLeft} label="Align left" />
        <Btn cmd="justifyCenter" icon={AlignCenter} label="Align center" />
        <Btn cmd="justifyRight" icon={AlignRight} label="Align right" />
        <Btn cmd="justifyFull" icon={AlignJustify} label="Justify" />
        <Divider />

        <Btn cmd="insertUnorderedList" icon={List} label="Bulleted list" />
        <Btn cmd="insertOrderedList" icon={ClipboardList} label="Numbered list" />
        <Btn cmd="indent" icon={Indent} label="Indent" />
        <Btn cmd="outdent" icon={Outdent} label="Outdent" />
        <Divider />

        {/* Insert menu */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowInsert(s => !s); }}
            className="px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
          >
            <Plus size={13} /> Insert <ChevronDown size={12} />
          </button>
          {showInsert && (
            <div className="absolute top-full left-0 mt-1 z-50 p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl min-w-[220px]">
              <InsMenuItem icon={ImageIcon} label="Image (upload)" onClick={() => { setShowInsert(false); fileInputRef.current?.click(); }} />
              <InsMenuItem icon={Activity} label="ECG / Imaging (upload)" onClick={() => { setShowInsert(false); ecgInputRef.current?.click(); }} />
              <InsMenuItem icon={ImageIcon2} label="Image from URL" onClick={() => {
                setShowInsert(false);
                const url = prompt('Image URL:');
                if (!url) return;
                const cap = prompt('Caption (optional):') || '';
                insertHTML(`<figure class="rte-figure" contenteditable="false"><img src="${url}" alt=""/>${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure><p><br></p>`);
              }} />
              <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
              <InsMenuItem icon={Youtube} label="YouTube video" onClick={() => { setShowInsert(false); insertYouTube(); }} />
              <InsMenuItem icon={Film} label="Video from URL" onClick={() => { setShowInsert(false); insertVideoURL(); }} />
              <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
              <InsMenuItem icon={Link2} label="Hyperlink" onClick={() => {
                setShowInsert(false);
                const url = prompt('Link URL:'); if (url) exec('createLink', url);
              }} />
              <InsMenuItem icon={TableIcon} label="Table" onClick={() => { setShowInsert(false); insertTable(); }} />
              <InsMenuItem icon={Minus} label="Horizontal rule" onClick={() => { setShowInsert(false); insertHR(); }} />
              <InsMenuItem icon={Code2} label="Code block" onClick={() => { setShowInsert(false); insertCodeBlock(); }} />
              <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
              <InsMenuItem icon={Sparkles} label="Clinical Pearl callout" onClick={() => { setShowInsert(false); insertCallout('pearl'); }} />
              <InsMenuItem icon={AlertTriangle} label="Warning callout" onClick={() => { setShowInsert(false); insertCallout('warn'); }} />
              <InsMenuItem icon={Info} label="Note callout" onClick={() => { setShowInsert(false); insertCallout('info'); }} />
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleSourceToggle}
            className={cx(
              'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold',
              showSource ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600'
            )}
            title="Toggle HTML source"
          >
            <FileCode size={13} /> {showSource ? 'Visual' : 'HTML'}
          </button>
        </div>
      </div>

      {/* Editor body OR HTML source */}
      {showSource ? (
        <textarea
          value={sourceDraft}
          onChange={(e) => setSourceDraft(e.target.value)}
          className="w-full p-4 font-mono text-xs bg-slate-950 text-emerald-300 focus:outline-none resize-y"
          style={{ minHeight: minH }}
          spellCheck={false}
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          suppressContentEditableWarning
          className="rte-content p-4 max-w-none focus:outline-none text-sm text-slate-800 dark:text-slate-200"
          style={{ minHeight: minH }}
          data-placeholder={placeholder}
        />
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        .rte-content { line-height: 1.6; }
        .rte-content h1 { font-size: 1.6rem; font-weight: 800; margin: 0.6em 0 0.3em; line-height: 1.2; }
        .rte-content h2 { font-size: 1.3rem; font-weight: 700; margin: 0.6em 0 0.3em; line-height: 1.25; }
        .rte-content h3 { font-size: 1.1rem; font-weight: 700; margin: 0.5em 0 0.25em; }
        .rte-content h4 { font-size: 1rem; font-weight: 700; margin: 0.4em 0 0.2em; }
        .rte-content p { margin: 0.4em 0; }
        .rte-content ul { list-style: disc; padding-left: 1.5em; margin: 0.4em 0; }
        .rte-content ol { list-style: decimal; padding-left: 1.5em; margin: 0.4em 0; }
        .rte-content blockquote { border-left: 3px solid #14b8a6; padding: 0.5em 0 0.5em 1em; color: #64748b; font-style: italic; margin: 0.5em 0; background: rgba(20,184,166,0.05); border-radius: 0 8px 8px 0; }
        .rte-content a { color: #0d9488; text-decoration: underline; }
        .rte-content hr { border: none; border-top: 2px dashed #cbd5e1; margin: 1.5em 0; }
        .rte-content pre { background: #0f172a; color: #e2e8f0; padding: 0.75em 1em; border-radius: 8px; font-family: ui-monospace, Menlo, monospace; font-size: 0.85em; overflow-x: auto; margin: 0.5em 0; }
        .rte-content code { background: rgba(20,184,166,0.1); color: #0d9488; padding: 0.1em 0.35em; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.9em; }
        .rte-content pre code { background: transparent; color: inherit; padding: 0; }
        .rte-content table.rte-table, .rte-content table { border-collapse: collapse; width: 100%; margin: 0.6em 0; font-size: 0.9em; }
        .rte-content table th, .rte-content table td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        .rte-content table th { background: #f1f5f9; font-weight: 700; }
        .dark .rte-content table th, .dark .rte-content table td { border-color: #334155; }
        .dark .rte-content table th { background: #1e293b; }
        .rte-content figure.rte-figure { margin: 1em 0; padding: 0.5em; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center; }
        .dark .rte-content figure.rte-figure { background: #0f172a; border-color: #334155; }
        .rte-content figure.rte-figure img { max-width: 100%; height: auto; border-radius: 8px; cursor: zoom-in; }
        .rte-content figure.rte-ecg { background: #0a0e1a; border-color: #334155; padding: 0.75em; }
        .rte-content figure.rte-ecg img { background: #fff; padding: 0.5em; }
        .rte-content figure figcaption { margin-top: 0.5em; font-size: 0.8em; color: #64748b; font-style: italic; }
        .rte-content .rte-embed { position: relative; padding-bottom: 56.25%; height: 0; margin: 1em 0; border-radius: 12px; overflow: hidden; background: #000; }
        .rte-content .rte-embed iframe, .rte-content .rte-embed video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        .rte-content .rte-callout { padding: 0.75em 1em; border-radius: 12px; margin: 0.75em 0; border-left: 4px solid; }
        .rte-content .rte-callout strong { display: block; margin-bottom: 0.25em; font-size: 0.85em; letter-spacing: 0.05em; text-transform: uppercase; }
        .rte-content .rte-callout p { margin: 0; }
        .rte-content .rte-pearl { background: #fef9c3; border-color: #eab308; color: #713f12; }
        .dark .rte-content .rte-pearl { background: rgba(234,179,8,0.1); color: #fde68a; }
        .rte-content .rte-warn { background: #fee2e2; border-color: #ef4444; color: #7f1d1d; }
        .dark .rte-content .rte-warn { background: rgba(239,68,68,0.1); color: #fecaca; }
        .rte-content .rte-info { background: #dbeafe; border-color: #3b82f6; color: #1e3a8a; }
        .dark .rte-content .rte-info { background: rgba(59,130,246,0.1); color: #bfdbfe; }
        .rte-content [contenteditable="false"] { user-select: none; }
        .rte-content [contenteditable="false"]:hover { outline: 2px dashed #14b8a6; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

function InsMenuItem({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
    >
      <Icon size={14} className="text-teal-600 dark:text-teal-400" />
      {label}
    </button>
  );
}

// ============== APP ==============
export default function VirtualHospital() {
  const [theme, setTheme] = useLocal(SK.SETTINGS, { dark: false });
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [progress, setProgress] = useState({
    xp: 0, completedStages: {}, mcqScores: {}, badges: [], teachingMode: 'advanced'
  });
  const [route, setRoute] = useState({ name: 'landing' });

  const auth = useAuth();
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.dark);
  }, [theme.dark]);

  // Load cases from Supabase on mount, and re-load when auth changes
  useEffect(() => {
    let cancelled = false;
    if (!isConfigured) {
      // Fall back to seed cases if env vars missing (dev convenience)
      setCases(SEED_CASES);
      setCasesLoading(false);
      return;
    }
    setCasesLoading(true);
    fetchAllCases().then(async rows => {
      if (cancelled) return;
      // Auto-seed: if there are no cases AND the current user is admin, insert the 5 starters
      if (rows.length === 0 && auth.isAdmin) {
        console.log('[seed] No cases yet — inserting 5 starter cases…');
        for (const c of SEED_CASES) {
          await upsertCase(c);
        }
        const seeded = await fetchAllCases();
        if (!cancelled) {
          setCases(seeded);
          setCasesLoading(false);
        }
      } else {
        setCases(rows);
        setCasesLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [isConfigured, auth.isAdmin]);

  // Load progress for the signed-in user
  useEffect(() => {
    if (!auth.user) {
      setProgress({ xp: 0, completedStages: {}, mcqScores: {}, badges: [], teachingMode: 'advanced' });
      return;
    }
    fetchProgress(auth.user.id).then(p => {
      if (p) setProgress(p);
    });
  }, [auth.user?.id]);

  // Save progress to Supabase when it changes (debounced)
  const progressSaveTimer = useRef(null);
  useEffect(() => {
    if (!auth.user) return;
    if (progressSaveTimer.current) clearTimeout(progressSaveTimer.current);
    progressSaveTimer.current = setTimeout(() => {
      saveProgress(auth.user.id, progress);
    }, 600);
    return () => {
      if (progressSaveTimer.current) clearTimeout(progressSaveTimer.current);
    };
  }, [progress, auth.user?.id]);

  const navigate = (r) => setRoute(r);

  // Case CRUD — go through Supabase
  const updateCase = async (updated) => {
    setCases(cs => cs.map(c => c.id === updated.id ? updated : c));
    if (isConfigured) await upsertCase(updated);
  };
  const addCase = async (newCase) => {
    setCases(cs => [...cs, newCase]);
    if (isConfigured) await upsertCase(newCase);
  };
  const deleteCase = async (id) => {
    setCases(cs => cs.filter(c => c.id !== id));
    if (isConfigured) await deleteCaseRow(id);
  };

  const userRole = useMemo(() => {
    let r = ROLES[0];
    for (const role of ROLES) if (progress.xp >= role.xpRequired) r = role;
    return r;
  }, [progress.xp]);

  // ===== If Supabase is not configured, show a setup banner =====
  if (!isConfigured) {
    return <ConfigMissingScreen />;
  }

  // ===== Auth gating: landing page is public; sign-in is required for content =====
  if (auth.loading) {
    return <SplashLoader />;
  }

  const PUBLIC_ROUTES = ['landing', 'login'];
  const isPublicRoute = PUBLIC_ROUTES.includes(route.name);
  const requiresAuth = !auth.user && !isPublicRoute;

  // If trying to access a protected route while signed out, redirect to login
  if (requiresAuth) {
    return <LoginScreen theme={theme} setTheme={setTheme} returnTo={route} navigate={navigate} />;
  }

  // Explicit /login route (when user clicks "Sign in")
  if (route.name === 'login') {
    return <LoginScreen theme={theme} setTheme={setTheme} navigate={navigate} />;
  }

  return (
    <div className={cx(
      'min-h-screen font-sans transition-colors',
      'bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100'
    )}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700;900&family=Inter:wght@400;500;600;700&display=swap');
        body, html { font-family: 'Inter', system-ui, sans-serif; }
        .display-font { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
        .grid-bg {
          background-image:
            linear-gradient(rgba(20, 184, 166, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.07) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .dark .grid-bg {
          background-image:
            linear-gradient(rgba(20, 184, 166, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.08) 1px, transparent 1px);
        }
        .pulse-dot::before {
          content: ''; position: absolute; inset: 0; border-radius: 9999px;
          background: currentColor; opacity: 0.6; animation: pulseRing 1.6s ease-out infinite;
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .ecg-glow { filter: drop-shadow(0 0 4px rgba(20, 184, 166, 0.6)); }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #475569; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease-out both; }

        /* Rich text content styles — used in editor preview AND in case view */
        .rte-content { line-height: 1.65; }
        .rte-content h1 { font-family: 'Fraunces', Georgia, serif; font-size: 1.6rem; font-weight: 800; margin: 0.7em 0 0.3em; line-height: 1.2; letter-spacing: -0.01em; }
        .rte-content h2 { font-family: 'Fraunces', Georgia, serif; font-size: 1.3rem; font-weight: 700; margin: 0.7em 0 0.3em; line-height: 1.25; }
        .rte-content h3 { font-size: 1.1rem; font-weight: 700; margin: 0.5em 0 0.25em; }
        .rte-content h4 { font-size: 1rem; font-weight: 700; margin: 0.4em 0 0.2em; }
        .rte-content p { margin: 0.5em 0; }
        .rte-content ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .rte-content ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .rte-content li { margin: 0.2em 0; }
        .rte-content strong { font-weight: 700; color: inherit; }
        .rte-content blockquote { border-left: 3px solid #14b8a6; padding: 0.5em 0 0.5em 1em; color: #475569; font-style: italic; margin: 0.7em 0; background: rgba(20,184,166,0.06); border-radius: 0 8px 8px 0; }
        .dark .rte-content blockquote { color: #94a3b8; }
        .rte-content a { color: #0d9488; text-decoration: underline; }
        .dark .rte-content a { color: #5eead4; }
        .rte-content hr { border: none; border-top: 2px dashed #cbd5e1; margin: 1.5em 0; }
        .dark .rte-content hr { border-top-color: #334155; }
        .rte-content pre { background: #0f172a; color: #e2e8f0; padding: 0.85em 1em; border-radius: 10px; font-family: ui-monospace, Menlo, monospace; font-size: 0.85em; overflow-x: auto; margin: 0.7em 0; }
        .rte-content code { background: rgba(20,184,166,0.12); color: #0d9488; padding: 0.1em 0.35em; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.9em; }
        .dark .rte-content code { background: rgba(20,184,166,0.18); color: #5eead4; }
        .rte-content pre code { background: transparent; color: inherit; padding: 0; }
        .rte-content table { border-collapse: collapse; width: 100%; margin: 0.7em 0; font-size: 0.9em; }
        .rte-content table th, .rte-content table td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; vertical-align: top; }
        .rte-content table th { background: #f1f5f9; font-weight: 700; }
        .dark .rte-content table th, .dark .rte-content table td { border-color: #334155; }
        .dark .rte-content table th { background: #1e293b; }
        .rte-content figure.rte-figure { margin: 1em 0; padding: 0.5em; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center; }
        .dark .rte-content figure.rte-figure { background: #0f172a; border-color: #334155; }
        .rte-content figure.rte-figure img { max-width: 100%; height: auto; border-radius: 8px; cursor: zoom-in; }
        .rte-content figure.rte-ecg { background: #0a0e1a; border-color: #334155; padding: 0.75em; }
        .rte-content figure.rte-ecg img { background: #fff; padding: 0.5em; }
        .rte-content figure figcaption { margin-top: 0.5em; font-size: 0.8em; color: #64748b; font-style: italic; }
        .rte-content .rte-embed { position: relative; padding-bottom: 56.25%; height: 0; margin: 1em 0; border-radius: 12px; overflow: hidden; background: #000; }
        .rte-content .rte-embed iframe, .rte-content .rte-embed video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        .rte-content .rte-callout { padding: 0.85em 1em; border-radius: 12px; margin: 0.85em 0; border-left: 4px solid; }
        .rte-content .rte-callout strong { display: block; margin-bottom: 0.3em; font-size: 0.85em; letter-spacing: 0.05em; text-transform: uppercase; }
        .rte-content .rte-callout p { margin: 0; }
        .rte-content .rte-pearl { background: #fef9c3; border-color: #eab308; color: #713f12; }
        .dark .rte-content .rte-pearl { background: rgba(234,179,8,0.1); color: #fde68a; }
        .rte-content .rte-warn { background: #fee2e2; border-color: #ef4444; color: #7f1d1d; }
        .dark .rte-content .rte-warn { background: rgba(239,68,68,0.12); color: #fecaca; }
        .rte-content .rte-info { background: #dbeafe; border-color: #3b82f6; color: #1e3a8a; }
        .dark .rte-content .rte-info { background: rgba(59,130,246,0.12); color: #bfdbfe; }
      `}</style>

      <TopBar
        route={route} navigate={navigate} theme={theme} setTheme={setTheme}
        progress={progress} userRole={userRole} auth={auth}
      />

      <main>
        {casesLoading && route.name === 'landing' && (
          <div className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-500">
            <div className="inline-flex items-center gap-2"><RefreshCw size={14} className="animate-spin" /> Loading cases…</div>
          </div>
        )}
        {!casesLoading && route.name === 'landing' && (
          <Landing navigate={navigate} cases={cases} progress={progress} userRole={userRole} />
        )}
        {route.name === 'hospital' && (
          <HospitalView
            hospital={route.hospital} cases={cases} navigate={navigate}
            progress={progress}
          />
        )}
        {route.name === 'department' && (
          <DepartmentView
            hospital={route.hospital} departmentId={route.departmentId}
            cases={cases} navigate={navigate} progress={progress}
          />
        )}
        {route.name === 'case' && (
          <CaseView
            caseData={cases.find(c => c.id === route.caseId)}
            navigate={navigate} progress={progress} setProgress={setProgress}
            userRole={userRole}
          />
        )}
        {route.name === 'dashboard' && (
          <Dashboard cases={cases} progress={progress} navigate={navigate} userRole={userRole} />
        )}
        {route.name === 'admin' && (
          <AdminPanel
            cases={cases} updateCase={updateCase} addCase={addCase}
            deleteCase={deleteCase} navigate={navigate}
            auth={auth}
          />
        )}
      </main>

      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500">
        <p className="display-font text-base mb-1">Virtual Teaching Hospital</p>
        <p>Built for AlGhad EMS &amp; Internal Medicine education · Educational use only — not for clinical decision-making</p>
      </footer>
    </div>
  );
}

// ============== TOP BAR ==============
function TopBar({ route, navigate, theme, setTheme, progress, userRole, auth }) {
  const RoleIcon = userRole.icon;
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/70 dark:border-slate-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <button onClick={() => navigate({ name: 'landing' })} className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Hospital size={18} className="text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
          </div>
          <div className="hidden sm:block">
            <div className="display-font text-lg leading-none font-bold">Virtual Hospital</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Clinical Reasoning Platform</div>
          </div>
        </button>

        <nav className="ml-auto flex items-center gap-1">
          <NavLink active={route.name === 'landing'} onClick={() => navigate({ name: 'landing' })} icon={Home} label="Home" />
          {auth?.user && (
            <NavLink active={route.name === 'dashboard'} onClick={() => navigate({ name: 'dashboard' })} icon={BarChart3} label="Progress" />
          )}
          {auth?.isAdmin && (
            <NavLink active={route.name === 'admin'} onClick={() => navigate({ name: 'admin' })} icon={Settings} label="Admin" />
          )}
        </nav>

        <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-200 dark:border-slate-800">
          {auth?.user && (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-500/10 dark:to-yellow-500/10 border border-amber-200 dark:border-amber-500/20">
                <Star size={13} className="text-amber-600 dark:text-amber-400 fill-amber-500" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">{progress.xp} XP</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20">
                <RoleIcon size={13} className="text-teal-700 dark:text-teal-400" />
                <span className="text-xs font-semibold text-teal-900 dark:text-teal-300">{userRole.label}</span>
              </div>
            </>
          )}
          <button
            onClick={() => setTheme(t => ({ ...t, dark: !t.dark }))}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            {theme.dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {!auth?.user && (
            <button
              onClick={() => navigate({ name: 'login' })}
              className="px-4 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-semibold hover:scale-[1.02] transition-transform"
            >
              Sign in
            </button>
          )}
          {auth?.user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-1.5 p-1.5 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                title={auth.user.email}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs font-bold flex items-center justify-center">
                  {(auth.user.email || '?').slice(0, 1).toUpperCase()}
                </div>
                <ChevronDown size={12} className="text-slate-400" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl z-50 p-1">
                    <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-500">Signed in as</div>
                      <div className="text-sm font-semibold truncate">{auth.user.email}</div>
                      {auth.isAdmin && (
                        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                          <Shield size={10} /> Admin
                        </div>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        setMenuOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 text-sm font-medium"
                    >
                      <X size={14} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
        active
          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      )}
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ============== LOGIN SCREEN ==============
function LoginScreen({ theme, setTheme, navigate, returnTo }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError('');
    const { error } = await signInWithMagicLink(email.trim());
    setSending(false);
    if (error) {
      setError(error.message || 'Could not send the magic link.');
    } else {
      setSent(true);
    }
  };

  return (
    <div className={cx('min-h-screen flex items-center justify-center p-4 relative overflow-hidden grid-bg',
      'bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100')}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700;900&family=Inter:wght@400;500;600;700&display=swap');
        body, html { font-family: 'Inter', system-ui, sans-serif; }
        .display-font { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
        .grid-bg {
          background-image:
            linear-gradient(rgba(20, 184, 166, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-400/20 dark:bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        {navigate ? (
          <button
            onClick={() => navigate({ name: 'landing' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={14} /> Back to home
          </button>
        ) : <span />}
        <button
          onClick={() => setTheme(t => ({ ...t, dark: !t.dark }))}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          {theme.dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl p-8">
          <div className="flex justify-center mb-5">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-teal-500/30">
              <Hospital size={26} className="text-white" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
            </div>
          </div>

          <h1 className="display-font text-3xl font-bold text-center mb-1">Virtual Hospital</h1>
          <p className="text-center text-sm text-slate-500 mb-6">
            {returnTo ? 'Sign in to continue' : 'Sign in to enter the ward'}
          </p>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <h2 className="font-bold mb-2">Check your inbox</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We sent a magic sign-in link to<br />
                <strong className="text-slate-900 dark:text-white">{email}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-3">
                Click the link in your email to finish signing in. You can close this tab.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="mt-4 text-xs text-teal-600 dark:text-teal-400 hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1.5">
                  Email address
                </label>
                <input
                  type="email" required autoFocus
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none text-sm"
                />
              </div>
              {error && (
                <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={sending || !email.trim()}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] transition-transform"
              >
                {sending ? 'Sending magic link…' : 'Send magic link'}
              </button>
              <p className="text-xs text-slate-500 text-center pt-2">
                We'll email you a one-tap sign-in link. No password needed.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Educational platform · For AlGhad EMS &amp; Internal Medicine students
        </p>
      </div>
    </div>
  );
}

// ============== SPLASH LOADER ==============
function SplashLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center animate-pulse">
          <Hospital size={22} className="text-white" />
        </div>
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}

// ============== CONFIG MISSING SCREEN ==============
function ConfigMissingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-lg w-full rounded-3xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4">
          <AlertTriangle size={26} />
        </div>
        <h1 className="display-font text-2xl font-bold mb-2">Supabase configuration missing</h1>
        <p className="text-sm mb-4">
          The app needs two environment variables to connect to your Supabase project.
          Create a file called <code className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-xs font-mono">.env.local</code> in your project root with:
        </p>
        <pre className="text-xs bg-slate-900 text-emerald-300 p-4 rounded-xl mb-4 overflow-x-auto">{`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-public-key...`}</pre>
        <p className="text-xs text-slate-700 dark:text-slate-300">
          Find these on your Supabase dashboard under <strong>Project Settings → API</strong>.
          After creating the file, restart the dev server (<code className="px-1 py-0.5 rounded bg-white dark:bg-slate-900 text-[11px] font-mono">npm run dev</code>).
        </p>
        <p className="text-xs text-slate-500 mt-3">
          For deployment on Vercel, add the same two variables in <strong>Project Settings → Environment Variables</strong>.
        </p>
      </div>
    </div>
  );
}

// ============== LANDING ==============
function Landing({ navigate, cases, progress, userRole }) {
  const cardiologyCases = cases.filter(c => c.hospital === 'cardiology');
  const internalCases = cases.filter(c => c.hospital === 'internal');

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-400/20 dark:bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 relative">
          <div className="flex items-center gap-2 mb-6">
            <span className="relative inline-flex">
              <span className="w-2 h-2 rounded-full bg-emerald-500 text-emerald-500 pulse-dot relative" />
            </span>
            <span className="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-slate-400 font-semibold">
              Live · Clinical Simulation
            </span>
          </div>

          <h1 className="display-font text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight max-w-4xl">
            Step into the <span className="italic text-teal-600 dark:text-teal-400">ward</span>.
            <br />Reason like a <span className="italic">consultant</span>.
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            A bilingual virtual teaching hospital for medical students, residents, and postgraduates.
            Walk through real clinical workflows — from EMS handover to discharge — across {STAGES.length} structured stages.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('hospitals');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              Choose a hospital
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate({ name: 'dashboard' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold"
            >
              <BarChart3 size={16} />
              View progress
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            <Stat icon={Layers} value={cases.length} label="Clinical cases" />
            <Stat icon={ClipboardList} value={STAGES.length} label="Workflow stages" />
            <Stat icon={Brain} value={cases.reduce((s, c) => s + (c.mcqs?.length || 0), 0)} label="MCQ assessments" />
            <Stat icon={Trophy} value={progress.xp} label="Your XP" />
          </div>
        </div>
      </section>

      {/* Hospital cards */}
      <section id="hospitals" className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold mb-2">Two virtual hospitals</p>
            <h2 className="display-font text-3xl sm:text-4xl font-bold">Pick your specialty.</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
            Each hospital simulates a real department workflow with rotating cases across stable, urgent, and critical severities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <HospitalCard
            tone="rose" icon={Heart} title="Cardiology Hospital"
            tagline="ACS · HF · Arrhythmia · Cath Lab"
            cases={cardiologyCases}
            onClick={() => navigate({ name: 'hospital', hospital: 'cardiology' })}
          />
          <HospitalCard
            tone="blue" icon={Stethoscope} title="Internal Medicine Hospital"
            tagline="Sepsis · Endocrine · Pulmonary · Renal"
            cases={internalCases}
            onClick={() => navigate({ name: 'hospital', hospital: 'internal' })}
          />
        </div>
      </section>

      {/* Feature highlights */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-4">
          <Feature icon={Activity} title="Live ECG simulator" desc="STEMI, AFib, VT patterns rendered as authentic rhythm strips." tone="rose" />
          <Feature icon={ImageIcon} title="Annotated imaging" desc="Zoomable chest X-rays, CT, and echo with clinical labels." tone="cyan" />
          <Feature icon={TrendingUp} title="Lab trend charts" desc="Watch troponin, BNP, and lactate evolve over the admission." tone="emerald" />
          <Feature icon={Brain} title="Decision mode" desc="Pause and predict next steps before the answer is revealed." tone="violet" />
          <Feature icon={GraduationCap} title="Role-based depth" desc="Student, resident, consultant — unlock as you earn XP." tone="amber" />
          <Feature icon={Edit3} title="Admin authoring" desc="Build new cases with a rich editor and 19-stage template." tone="teal" />
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur p-4">
      <Icon size={16} className="text-teal-600 dark:text-teal-400 mb-2" />
      <div className="display-font text-3xl font-bold leading-none">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function HospitalCard({ tone, icon: Icon, title, tagline, cases, onClick }) {
  const tones = {
    rose: { from: 'from-rose-500', to: 'to-pink-600', ring: 'ring-rose-500/20', bg: 'bg-rose-50 dark:bg-rose-500/5', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-500/20' },
    blue: { from: 'from-blue-500', to: 'to-indigo-600', ring: 'ring-blue-500/20', bg: 'bg-blue-50 dark:bg-blue-500/5', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
  }[tone];

  const sevCount = (s) => cases.filter(c => c.severity === s).length;

  return (
    <button
      onClick={onClick}
      className={cx(
        'group text-left relative overflow-hidden rounded-3xl border bg-white dark:bg-slate-900 transition-all hover:shadow-2xl hover:-translate-y-1',
        tones.border
      )}
    >
      <div className={cx('absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br transition-opacity', tones.from, tones.to)} style={{ opacity: 0.06 }} />
      <div className="relative p-7">
        <div className="flex items-start justify-between mb-6">
          <div className={cx('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg', tones.from, tones.to)}>
            <Icon className="text-white" size={26} />
          </div>
          <ArrowRight className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
        </div>

        <div className="display-font text-2xl sm:text-3xl font-bold mb-1">{title}</div>
        <div className={cx('text-sm font-medium mb-6', tones.text)}>{tagline}</div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <SevPill label="Stable" count={sevCount('stable')} color="emerald" />
          <SevPill label="Urgent" count={sevCount('urgent')} color="amber" />
          <SevPill label="Critical" count={sevCount('critical')} color="red" />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">{cases.length} active case{cases.length !== 1 ? 's' : ''}</span>
          <span className={cx('font-semibold', tones.text)}>Enter ward →</span>
        </div>
      </div>
    </button>
  );
}

function SevPill({ label, count, color }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    amber:   'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    red:     'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
  }[color];
  return (
    <div className={cx('rounded-lg border px-2.5 py-2 text-center', colors)}>
      <div className="text-lg font-bold">{count}</div>
      <div className="text-[9px] uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc, tone }) {
  const tones = {
    rose:    'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400',
    cyan:    'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
    violet:  'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400',
    amber:   'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400',
    teal:    'text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400',
  }[tone];
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-lg transition-shadow">
      <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', tones)}>
        <Icon size={18} />
      </div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

// ============== HOSPITAL VIEW ==============
function HospitalView({ hospital, cases, navigate, progress }) {
  const departments = DEPARTMENTS[hospital] || [];
  const meta = hospital === 'cardiology'
    ? { title: 'Cardiology Hospital', tagline: 'Choose a department to enter the ward', icon: Heart, tone: 'rose' }
    : { title: 'Internal Medicine Hospital', tagline: 'Choose a department to enter the ward', icon: Stethoscope, tone: 'blue' };
  const Icon = meta.icon;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <button onClick={() => navigate({ name: 'landing' })} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4">
        <ChevronLeft size={14} /> Back to lobby
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className={cx('w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg', meta.tone === 'rose' ? 'bg-gradient-to-br from-rose-500 to-pink-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600')}>
          <Icon className="text-white" size={26} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold mb-1">Hospital directory</p>
          <h1 className="display-font text-3xl sm:text-4xl font-bold">{meta.title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{meta.tagline}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((d, i) => {
          const deptCases = cases.filter(c => c.department === d.id);
          const occupied = deptCases.length;
          const occupancyPct = Math.round((occupied / d.beds) * 100);
          const accent = ACCENT_CLASSES[d.accent];
          const DIcon = d.icon;
          const critical = deptCases.filter(c => c.severity === 'critical').length;

          return (
            <button
              key={d.id}
              onClick={() => navigate({ name: 'department', hospital, departmentId: d.id })}
              className={cx(
                'group fade-up text-left relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 p-5 transition-all hover:shadow-xl hover:-translate-y-0.5',
                accent.border
              )}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className={cx('absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br', accent.grad)} />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={cx('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md', accent.grad, accent.glow)}>
                    <DIcon className="text-white" size={20} />
                  </div>
                  {critical > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {critical} critical
                    </span>
                  )}
                </div>

                <h3 className="display-font text-lg font-bold leading-tight mb-1">{d.label}</h3>
                <p className={cx('text-[11px] font-semibold mb-3 uppercase tracking-wider', accent.text)}>{d.short} · {d.beds} beds</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">{d.desc}</p>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Occupancy</span>
                  <span className={cx('font-bold', accent.text)}>{occupied}/{d.beds}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className={cx('h-full bg-gradient-to-r transition-all', accent.grad)} style={{ width: `${occupancyPct}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============== DEPARTMENT VIEW (3D BEDS) ==============
function DepartmentView({ hospital, departmentId, cases, navigate, progress }) {
  const dept = DEPARTMENT_BY_ID[departmentId];
  const [hoveredBed, setHoveredBed] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ severity: 'all' });

  if (!dept) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <p>Department not found.</p>
        <button onClick={() => navigate({ name: 'hospital', hospital })} className="mt-3 text-teal-600 underline">Back to hospital</button>
      </div>
    );
  }

  const accent = ACCENT_CLASSES[dept.accent];
  const DIcon = dept.icon;

  const deptCases = useMemo(() => {
    return cases
      .filter(c => c.department === departmentId)
      .filter(c => filter.severity === 'all' || c.severity === filter.severity)
      .filter(c => !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      );
  }, [cases, departmentId, search, filter]);

  // Build bed slots — fill by bedNumber, leaving empty slots between
  const beds = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= dept.beds; i++) {
      const c = deptCases.find(x => x.bedNumber === i) || deptCases[arr.filter(b => b.case).length];
      // Simpler: assign cases to beds in order, filling sequential bed numbers
      arr.push({ bedNumber: i, case: null });
    }
    // Fill cases into beds sequentially
    deptCases.forEach((c, idx) => {
      const target = c.bedNumber && c.bedNumber <= dept.beds ? c.bedNumber - 1 : idx;
      if (target < arr.length && !arr[target].case) {
        arr[target].case = c;
      } else {
        // find first empty
        const empty = arr.findIndex(b => !b.case);
        if (empty >= 0) arr[empty].case = c;
      }
    });
    return arr;
  }, [deptCases, dept.beds]);

  const occupied = beds.filter(b => b.case).length;
  const critical = beds.filter(b => b.case?.severity === 'critical').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate({ name: 'hospital', hospital })} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4">
        <ChevronLeft size={14} /> Back to {hospital === 'cardiology' ? 'Cardiology' : 'Internal Medicine'} hospital
      </button>

      {/* Department banner */}
      <div className={cx('relative overflow-hidden rounded-3xl border p-6 mb-6 bg-gradient-to-br', accent.border, 'from-slate-900 via-slate-900 to-slate-950 text-white')}>
        <div className={cx('absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[80px] opacity-30 bg-gradient-to-br', accent.grad)} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        <div className="relative flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className={cx('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-2xl', accent.grad, accent.glow)}>
              <DIcon className="text-white" size={26} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-semibold mb-1">{dept.short}</p>
              <h1 className="display-font text-3xl font-bold leading-tight">{dept.label}</h1>
              <p className="text-sm text-slate-300 mt-0.5">{dept.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="display-font text-xl font-bold">{occupied}/{dept.beds}</div>
              <div className="text-[10px] uppercase tracking-wider opacity-70">Occupancy</div>
            </div>
            {critical > 0 && (
              <div className="text-center px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/40">
                <div className="display-font text-xl font-bold text-red-200">{critical}</div>
                <div className="text-[10px] uppercase tracking-wider text-red-200/80">Critical</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 mb-6 flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search beds..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          {['all', 'stable', 'urgent', 'critical'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(f => ({ ...f, severity: s }))}
              className={cx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors',
                filter.severity === s
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600'
              )}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Ward floor plan */}
      <WardFloor
        beds={beds} dept={dept} accent={accent}
        hoveredBed={hoveredBed} setHoveredBed={setHoveredBed}
        navigate={navigate} progress={progress}
      />

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> Stable</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500" /> Urgent</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Critical</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-dashed border-slate-400" /> Empty bed</div>
        <span className="ml-auto italic">Hover a bed for the patient summary · Click to enter the case</span>
      </div>
    </div>
  );
}

// ============== WARD FLOOR (3D BEDS) ==============
function WardFloor({ beds, dept, accent, hoveredBed, setHoveredBed, navigate, progress }) {
  return (
    <div className={cx(
      'relative rounded-3xl border-2 p-6 sm:p-10 overflow-hidden',
      'border-slate-300 dark:border-slate-700',
      'bg-gradient-to-b from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950'
    )}>
      {/* Floor pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(100,116,139,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100,116,139,0.15) 1px, transparent 1px),
          linear-gradient(135deg, rgba(100,116,139,0.05) 25%, transparent 25%, transparent 75%, rgba(100,116,139,0.05) 75%)
        `,
        backgroundSize: '40px 40px, 40px 40px, 80px 80px'
      }} />

      {/* Nurse station */}
      <div className="relative mb-8 mx-auto max-w-md">
        <div className={cx(
          'rounded-2xl py-3 px-6 text-center text-white shadow-lg bg-gradient-to-br',
          accent.grad, accent.glow
        )}>
          <div className="flex items-center justify-center gap-2">
            <Radio size={14} className="opacity-80" />
            <span className="text-xs uppercase tracking-[0.25em] font-bold">Nurse Station · {dept.short}</span>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent mt-4" />
      </div>

      {/* Beds grid */}
      <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {beds.map(({ bedNumber, case: c }) => (
          <Bed3D
            key={bedNumber}
            bedNumber={bedNumber}
            caseData={c}
            accent={accent}
            isHovered={hoveredBed === bedNumber}
            onHover={(v) => setHoveredBed(v ? bedNumber : null)}
            onClick={() => c && navigate({ name: 'case', caseId: c.id })}
            progress={progress}
          />
        ))}
      </div>
    </div>
  );
}

// ============== 3D BED ==============
function Bed3D({ bedNumber, caseData, accent, isHovered, onHover, onClick, progress }) {
  const c = caseData;
  const sev = c ? SEVERITY[c.severity] : null;
  const completed = c ? Object.values(progress.completedStages?.[c.id] || {}).filter(Boolean).length : 0;
  const totalStages = STAGES.length;
  const pct = c ? Math.round((completed / totalStages) * 100) : 0;
  const isComplete = pct === 100;

  // Severity-based colors for the bed
  const sevColor = c?.severity === 'critical' ? 'rose'
    : c?.severity === 'urgent' ? 'amber'
    : c?.severity === 'stable' ? 'emerald' : null;

  return (
    <div
      className="relative group"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Hover tooltip */}
      {isHovered && c && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-30 w-64 fade-up pointer-events-none">
          <div className="rounded-xl bg-slate-900 dark:bg-slate-800 text-white p-3 shadow-2xl border border-white/10 text-left">
            <div className="flex items-start justify-between mb-1.5">
              <span className={cx('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border', sev.chip)}>
                <span className={cx('w-1 h-1 rounded-full', sev.dot)} />
                {sev.label}
              </span>
              <span className="text-[9px] font-mono text-slate-400">Bed {bedNumber}</span>
            </div>
            <h4 className="font-bold text-sm leading-tight mb-1">{c.title}</h4>
            <p className="text-[11px] text-slate-300 mb-2 line-clamp-2">{c.chiefComplaint}</p>
            <div className="grid grid-cols-3 gap-1 text-[10px] mb-2">
              <div className="bg-white/5 rounded px-1.5 py-1">
                <div className="text-slate-400">HR</div>
                <div className="font-bold">{c.vitals?.hr || '—'}</div>
              </div>
              <div className="bg-white/5 rounded px-1.5 py-1">
                <div className="text-slate-400">BP</div>
                <div className="font-bold">{c.vitals?.bp || '—'}</div>
              </div>
              <div className="bg-white/5 rounded px-1.5 py-1">
                <div className="text-slate-400">SpO2</div>
                <div className="font-bold">{c.vitals?.spo2 || '—'}%</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>{c.profile?.age || '—'}{c.profile?.sex?.[0] || ''} · {c.profile?.name || 'Patient'}</span>
              <span className="font-bold text-emerald-400">{pct}% done</span>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 dark:bg-slate-800 rotate-45 border-r border-b border-white/10" />
          </div>
        </div>
      )}

      <button
        onClick={onClick}
        disabled={!c}
        className={cx(
          'relative w-full block transition-all duration-300',
          c ? 'cursor-pointer hover:-translate-y-2' : 'cursor-default opacity-50',
          isHovered && c && '-translate-y-2 z-10'
        )}
        style={{ perspective: '600px' }}
      >
        {/* Bed number label */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className={cx(
            'px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border-2',
            c ? cx(accent.bg, 'text-white border-white dark:border-slate-900') : 'bg-slate-300 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-800'
          )}>
            BED {String(bedNumber).padStart(2, '0')}
          </div>
        </div>

        {/* The bed itself - 3D isometric */}
        <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(20deg) rotateZ(-2deg)' }}>
          {/* Bed shadow */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[90%] h-3 bg-black/20 dark:bg-black/40 blur-md rounded-full" />

          {/* Headboard / monitor */}
          <div className={cx(
            'h-14 rounded-t-xl border-2 border-b-0 flex items-center justify-center relative overflow-hidden',
            c ? 'bg-slate-800 dark:bg-slate-950 border-slate-700' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
          )}>
            {c ? (
              <>
                {/* Monitor screen */}
                <div className="w-full px-2">
                  <MiniECG severity={c.severity} />
                  <div className="flex justify-between text-[8px] font-mono mt-0.5">
                    <span className="text-emerald-400">HR {c.vitals?.hr || '--'}</span>
                    <span className="text-cyan-400">SpO {c.vitals?.spo2 || '--'}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-[10px] text-slate-400 font-semibold">EMPTY</div>
            )}
          </div>

          {/* Mattress */}
          <div className={cx(
            'h-20 border-2 border-t-0 border-b-0 relative overflow-hidden',
            c ? cx(
                'bg-gradient-to-b',
                sevColor === 'rose' ? 'from-rose-100 to-rose-50 dark:from-rose-950/40 dark:to-rose-900/20 border-rose-300 dark:border-rose-800' :
                sevColor === 'amber' ? 'from-amber-100 to-amber-50 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-300 dark:border-amber-800' :
                'from-emerald-100 to-emerald-50 dark:from-emerald-950/40 dark:to-emerald-900/20 border-emerald-300 dark:border-emerald-800'
              )
            : 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700'
          )}>
            {c && (
              <>
                {/* Pillow */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-white dark:bg-slate-200 rounded-md shadow-sm" />
                {/* Patient body */}
                <div className="absolute top-7 left-1/2 -translate-x-1/2 w-[50%] h-2 rounded-full bg-slate-300/70 dark:bg-slate-600/70" />
                {/* Blanket fold */}
                <div className={cx(
                  'absolute bottom-0 left-0 right-0 h-8',
                  sevColor === 'rose' ? 'bg-gradient-to-b from-rose-200 to-rose-300 dark:from-rose-900/60 dark:to-rose-800/40' :
                  sevColor === 'amber' ? 'bg-gradient-to-b from-amber-200 to-amber-300 dark:from-amber-900/60 dark:to-amber-800/40' :
                  'bg-gradient-to-b from-emerald-200 to-emerald-300 dark:from-emerald-900/60 dark:to-emerald-800/40'
                )} />
                {/* Severity pulse */}
                {c.severity === 'critical' && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                )}
                {isComplete && (
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footboard / IV pole base */}
          <div className={cx(
            'h-6 rounded-b-xl border-2 border-t-0 flex items-center justify-between px-2',
            c ? 'bg-slate-700 dark:bg-slate-900 border-slate-600 dark:border-slate-800' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
          )}>
            {c ? (
              <>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-slate-500 dark:bg-slate-600 rounded-sm" />
                  <div className="text-[9px] text-slate-300 font-mono">{c.profile?.age || '?'}{c.profile?.sex?.[0] || '?'}</div>
                </div>
                {/* Progress bar */}
                <div className="flex-1 mx-2 h-1 rounded-full bg-slate-600 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[9px] text-emerald-400 font-mono font-bold">{pct}%</div>
              </>
            ) : (
              <div className="w-full text-center text-[9px] text-slate-400">— Available —</div>
            )}
          </div>
        </div>

        {/* Patient title under bed */}
        {c && (
          <div className="mt-3 text-center px-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{c.tags?.[0] || c.system}</div>
            <div className="font-bold text-sm leading-tight line-clamp-1">{c.title}</div>
          </div>
        )}
      </button>
    </div>
  );
}

// Mini ECG component for the bed monitor
function MiniECG({ severity }) {
  const color = severity === 'critical' ? '#ef4444' : severity === 'urgent' ? '#f59e0b' : '#10b981';
  const path = severity === 'critical'
    ? 'M0,8 L10,8 L12,4 L14,12 L16,2 L18,10 L20,8 L30,8 L32,4 L34,12 L36,2 L38,10 L40,8 L50,8 L52,4 L54,12 L56,2 L58,10 L60,8 L70,8 L72,4 L74,12 L76,2 L78,10 L80,8'
    : 'M0,8 L15,8 L18,5 L20,11 L22,3 L24,9 L26,8 L40,8 L43,5 L45,11 L47,3 L49,9 L51,8 L65,8 L68,5 L70,11 L72,3 L74,9 L76,8';
  return (
    <svg viewBox="0 0 80 16" className="w-full h-4">
      <path d={path} fill="none" stroke={color} strokeWidth="1" />
    </svg>
  );
}


function CaseCard({ caseData: c, onClick, progress, delay = 0 }) {
  const sev = SEVERITY[c.severity];
  const completed = progress.completedStages?.[c.id] || {};
  const completedCount = Object.values(completed).filter(Boolean).length;
  const pct = Math.round((completedCount / STAGES.length) * 100);

  return (
    <button
      onClick={onClick}
      className="group fade-up text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-xl hover:-translate-y-0.5 hover:border-teal-500/50 transition-all relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cx('absolute top-0 left-0 right-0 h-1', sev.dot)} />

      <div className="flex items-start justify-between mb-3">
        <div className={cx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border', sev.chip)}>
          <span className={cx('w-1.5 h-1.5 rounded-full', sev.dot)} />
          {sev.label}
        </div>
        {pct === 100 && <CheckCircle2 size={16} className="text-emerald-500" />}
      </div>

      <h3 className="display-font text-lg font-bold mb-1 leading-tight">{c.title}</h3>
      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.chiefComplaint}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {c.tags?.slice(0, 3).map(t => (
          <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <UserCircle size={12} /> {c.profile?.age}{c.profile?.sex?.[0]}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-slate-500 font-medium">{pct}%</span>
        </div>
      </div>
    </button>
  );
}

// ============== CASE VIEW ==============
function CaseView({ caseData, navigate, progress, setProgress, userRole }) {
  const stages = useMemo(() => getCaseStages(caseData), [caseData]);
  const [activeStage, setActiveStage] = useState(stages[0]?.key || 'profile');
  const [decisionMode, setDecisionMode] = useState(false);
  const [revealed, setRevealed] = useState({});

  // If activeStage was removed, fall back to first
  useEffect(() => {
    if (!stages.find(s => s.key === activeStage)) {
      setActiveStage(stages[0]?.key || 'profile');
    }
  }, [stages, activeStage]);

  if (!caseData) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <p>Case not found.</p>
        <button onClick={() => navigate({ name: 'landing' })} className="mt-3 text-teal-600 underline">Return home</button>
      </div>
    );
  }

  const sev = SEVERITY[caseData.severity];
  const completed = progress.completedStages?.[caseData.id] || {};

  const markComplete = (stageKey) => {
    if (completed[stageKey]) return;
    setProgress(p => ({
      ...p,
      xp: p.xp + 10,
      completedStages: {
        ...p.completedStages,
        [caseData.id]: { ...(p.completedStages[caseData.id] || {}), [stageKey]: true }
      }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => caseData.department
          ? navigate({ name: 'department', hospital: caseData.hospital, departmentId: caseData.department })
          : navigate({ name: 'hospital', hospital: caseData.hospital })
        }
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4"
      >
        <ChevronLeft size={14} /> Back to {caseData.department ? DEPARTMENT_BY_ID[caseData.department]?.label || 'ward' : 'ward'}
      </button>

      {/* Patient banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-950 dark:to-black p-6 text-white relative overflow-hidden mb-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-500/10 blur-[100px] rounded-full" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', sev.chip)}>
                  <span className={cx('w-1.5 h-1.5 rounded-full', sev.dot)} />
                  {sev.label}
                </span>
                <span className="text-xs text-slate-400 font-mono">{caseData.profile?.mrn}</span>
              </div>
              <h1 className="display-font text-3xl sm:text-4xl font-bold mb-1">{caseData.title}</h1>
              <p className="text-slate-300">{caseData.chiefComplaint}</p>
            </div>
            <button
              onClick={() => setDecisionMode(d => !d)}
              className={cx(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                decisionMode
                  ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              )}
            >
              {decisionMode ? <Lock size={14} /> : <Unlock size={14} />}
              Decision Mode {decisionMode ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
            <VitalBox label="HR" value={caseData.vitals?.hr} unit="bpm" warn={caseData.vitals?.hr > 100 || caseData.vitals?.hr < 60} />
            <VitalBox label="BP" value={caseData.vitals?.bp} unit="mmHg" />
            <VitalBox label="RR" value={caseData.vitals?.rr} unit="/min" warn={caseData.vitals?.rr > 22} />
            <VitalBox label="SpO2" value={caseData.vitals?.spo2} unit="%" warn={caseData.vitals?.spo2 < 92} />
            <VitalBox label="Temp" value={caseData.vitals?.temp} unit="°C" warn={caseData.vitals?.temp > 38} />
            <VitalBox label="GCS" value={caseData.vitals?.gcs} unit="/15" warn={caseData.vitals?.gcs < 15} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        {/* Stage timeline */}
        <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-thin">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Clinical Stages</div>
            {stages.map(s => {
              const Icon = s.icon;
              const isActive = activeStage === s.key;
              const isDone = completed[s.key];
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveStage(s.key)}
                  className={cx(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left',
                    isActive
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span className={cx('text-[10px] font-mono w-6', isActive ? 'text-white/80' : 'text-slate-400')}>{s.id}</span>
                  <Icon size={14} className={isActive ? 'text-white' : ''} />
                  <span className="flex-1 truncate font-medium">{s.label}</span>
                  {isDone && <CheckCircle2 size={12} className={isActive ? 'text-white' : 'text-emerald-500'} />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Stage content */}
        <div>
          <StageContent
            stageKey={activeStage}
            caseData={caseData}
            decisionMode={decisionMode}
            revealed={revealed}
            setRevealed={setRevealed}
            markComplete={markComplete}
            progress={progress}
            setProgress={setProgress}
            userRole={userRole}
          />

          {/* Stage nav */}
          <div className="mt-5 flex items-center justify-between">
            <StageNavBtn
              dir="prev" stages={stages} activeStage={activeStage}
              onClick={(k) => setActiveStage(k)}
            />
            <StageNavBtn
              dir="next" stages={stages} activeStage={activeStage}
              onClick={(k) => { markComplete(activeStage); setActiveStage(k); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function VitalBox({ label, value, unit, warn }) {
  return (
    <div className={cx(
      'rounded-xl px-3 py-2 border',
      warn
        ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
        : 'bg-white/5 border-white/10 text-white'
    )}>
      <div className="text-[10px] uppercase tracking-wider opacity-70 font-bold">{label}</div>
      <div className="display-font text-xl font-bold leading-tight">{value || '—'}<span className="text-[10px] opacity-60 font-sans font-normal ml-1">{unit}</span></div>
    </div>
  );
}

function StageNavBtn({ dir, stages, activeStage, onClick }) {
  const idx = stages.findIndex(s => s.key === activeStage);
  const target = dir === 'prev' ? stages[idx - 1] : stages[idx + 1];
  if (!target) return <div />;
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={() => onClick(target.key)}
      className={cx(
        'flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold',
        dir === 'next' && 'ml-auto'
      )}
    >
      {dir === 'prev' && <Icon size={14} />}
      <div className="text-left">
        <div className="text-[10px] uppercase tracking-wider text-slate-400">{dir === 'prev' ? 'Previous' : 'Next'}</div>
        <div>{target.label}</div>
      </div>
      {dir === 'next' && <Icon size={14} />}
    </button>
  );
}

// ============== STAGE CONTENT ==============
function StageContent({ stageKey, caseData, decisionMode, revealed, setRevealed, markComplete, progress, setProgress, userRole }) {
  const caseStages = getCaseStages(caseData);
  const stage = caseStages.find(s => s.key === stageKey) || STAGES.find(s => s.key === stageKey);
  if (!stage) return null;
  const Icon = stage.icon;

  const reveal = () => setRevealed(r => ({ ...r, [stageKey]: true }));
  const isRevealed = !decisionMode || revealed[stageKey];

  const Header = (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center', `bg-${stage.color}-100 dark:bg-${stage.color}-500/15 text-${stage.color}-600 dark:text-${stage.color}-400`)}>
          <Icon size={18} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{stage.id}</div>
          <h2 className="display-font text-xl font-bold">{stage.label}</h2>
        </div>
      </div>
      {!isRevealed && stageKey !== 'mcqs' && stageKey !== 'profile' && stageKey !== 'imaging' && stageKey !== 'investigations' && (
        <button
          onClick={reveal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-slate-900 text-xs font-bold hover:bg-amber-400"
        >
          <Eye size={12} /> Reveal answer
        </button>
      )}
    </div>
  );

  const renderHTML = (html) => (
    <div className="rte-content max-w-none text-sm" dangerouslySetInnerHTML={{ __html: html || '<p class="text-slate-400 italic">No content yet.</p>' }} />
  );

  // STAGE: Profile
  if (stageKey === 'profile') {
    const p = caseData.profile || {};
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        {Header}
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ['Name', p.name],
            ['Age / Sex', `${p.age || '—'} / ${p.sex || '—'}`],
            ['MRN', p.mrn],
            ['Weight', p.weight],
            ['Allergies', p.allergies],
            ['Occupation', p.occupation],
            ['Past medical history', p.pmh],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{k}</div>
              <div className="text-sm font-medium">{v || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // STAGE: ECG / Imaging
  if (stageKey === 'imaging') {
    const pattern = caseData.severity === 'critical' && caseData.tags?.includes('STEMI') ? 'stemi'
      : caseData.tags?.some(t => /AF/i.test(t)) ? 'afib'
      : caseData.tags?.some(t => /VT/i.test(t)) ? 'vt'
      : 'normal';
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        {Header}
        <ECGViewer pattern={pattern} caseTitle={caseData.title} />
        <div className="mt-5">{renderHTML(caseData.imaging)}</div>
      </div>
    );
  }

  // STAGE: Investigations (lab + trend)
  if (stageKey === 'investigations') {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        {Header}
        <div className="space-y-5">
          {renderHTML(caseData.investigations)}
          {caseData.labTrend && caseData.labTrend.length > 0 && (
            <LabTrendChart data={caseData.labTrend} caseTitle={caseData.title} />
          )}
        </div>
      </div>
    );
  }

  // STAGE: MCQs
  if (stageKey === 'mcqs') {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        {Header}
        <MCQSection
          mcqs={caseData.mcqs || []} caseId={caseData.id}
          progress={progress} setProgress={setProgress}
          markComplete={() => markComplete('mcqs')}
        />
      </div>
    );
  }

  // STAGE: Teaching (with role/teaching mode toggle)
  if (stageKey === 'teaching' || stageKey === 'consultant' || stageKey === 'resident') {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        {Header}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Mode:</span>
          <button
            onClick={() => setProgress(p => ({ ...p, teachingMode: 'simple' }))}
            className={cx('px-3 py-1 rounded-full text-xs font-semibold border',
              progress.teachingMode === 'simple'
                ? 'bg-teal-500 text-white border-teal-500'
                : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >Simplified</button>
          <button
            onClick={() => setProgress(p => ({ ...p, teachingMode: 'advanced' }))}
            className={cx('px-3 py-1 rounded-full text-xs font-semibold border',
              progress.teachingMode === 'advanced'
                ? 'bg-teal-500 text-white border-teal-500'
                : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >Advanced</button>
          <span className="ml-auto text-xs text-slate-500">Viewing as: <span className="font-semibold text-teal-600 dark:text-teal-400">{userRole.label}</span></span>
        </div>
        {!isRevealed ? (
          <DecisionPrompt onReveal={reveal} stage={stage.label} />
        ) : (
          renderHTML(caseData[stageKey])
        )}
      </div>
    );
  }

  // Default: HTML content
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
      {Header}
      {!isRevealed
        ? <DecisionPrompt onReveal={reveal} stage={stage.label} />
        : renderHTML(caseData[stage.key === 'progress' ? 'progressNotes' : stage.key])}
    </div>
  );
}

function DecisionPrompt({ onReveal, stage }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 dark:bg-amber-500/10 p-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-3">
        <Brain size={20} />
      </div>
      <h3 className="display-font text-xl font-bold mb-2">Pause &amp; Reason</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 max-w-md mx-auto">
        Decision Mode is on. Think through what <strong>{stage.toLowerCase()}</strong> you would order or expect for this patient before viewing the answer.
      </p>
      <button onClick={onReveal} className="px-5 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-semibold">
        Reveal answer
      </button>
    </div>
  );
}

// ============== ECG VIEWER ==============
function ECGViewer({ pattern, caseTitle }) {
  const [paused, setPaused] = useState(false);
  const [lead, setLead] = useState('II');

  const path = useMemo(() => generateECGPath(pattern, 800, 120), [pattern, lead]);
  const patternLabel = {
    normal: 'Normal sinus rhythm', stemi: 'ST-elevation MI (anterior)',
    afib: 'Atrial fibrillation', vt: 'Ventricular tachycardia',
  }[pattern];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(244,114,182,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(244,114,182,0.4) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-emerald-400 font-mono text-xs uppercase tracking-wider">Live · Lead {lead}</span>
          </div>
          <div className="flex items-center gap-2">
            {['I', 'II', 'V1', 'V4'].map(l => (
              <button key={l} onClick={() => setLead(l)} className={cx(
                'px-2 py-0.5 rounded text-[10px] font-mono font-bold border',
                lead === l ? 'bg-emerald-500 text-slate-900 border-emerald-500' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
              )}>{l}</button>
            ))}
            <button onClick={() => setPaused(p => !p)} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              {paused ? '▶ Play' : '❚❚ Pause'}
            </button>
          </div>
        </div>
        <svg viewBox="0 0 800 120" className="w-full h-32">
          <path d={path} fill="none" stroke="#10b981" strokeWidth="1.6" className="ecg-glow">
            {!paused && (
              <animate attributeName="stroke-dashoffset" from="1600" to="0" dur="3s" repeatCount="indefinite" />
            )}
          </path>
          <path d={path} fill="none" stroke="#10b981" strokeWidth="1.6" strokeDasharray="800 800" strokeDashoffset={paused ? 0 : undefined} className="ecg-glow" opacity={paused ? 1 : 0.3} />
        </svg>
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Interpretation:</span>
            <span className="font-bold text-emerald-400">{patternLabel}</span>
          </div>
          <div className="text-slate-500 font-mono text-[10px]">25 mm/s · 10 mm/mV</div>
        </div>
      </div>
    </div>
  );
}

// ============== LAB TREND CHART ==============
function LabTrendChart({ data, caseTitle }) {
  const keys = Object.keys(data[0]).filter(k => k !== 'time');
  const colors = ['#14b8a6', '#f43f5e', '#f59e0b', '#8b5cf6', '#3b82f6'];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} className="text-teal-600 dark:text-teal-400" />
        <h4 className="font-bold text-sm">Lab trend over admission</h4>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip
              contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#cbd5e1' }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {keys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============== MCQ SECTION ==============
function MCQSection({ mcqs, caseId, progress, setProgress, markComplete }) {
  const stored = progress.mcqScores?.[caseId] || {};
  const [answers, setAnswers] = useState(stored.answers || {});
  const [submitted, setSubmitted] = useState(stored.submitted || false);

  const submit = () => {
    const correct = mcqs.filter((q, i) => answers[i] === q.correct).length;
    const total = mcqs.length;
    const xpGain = correct * 25;

    setSubmitted(true);
    setProgress(p => ({
      ...p,
      xp: (p.xp || 0) + xpGain,
      mcqScores: {
        ...p.mcqScores,
        [caseId]: { answers, submitted: true, correct, total }
      },
      badges: correct === total && !p.badges?.includes(caseId)
        ? [...(p.badges || []), caseId]
        : p.badges
    }));
    markComplete();
  };

  const reset = () => { setAnswers({}); setSubmitted(false); };

  if (!mcqs.length) {
    return <p className="text-sm text-slate-500 italic">No MCQs authored for this case yet.</p>;
  }

  return (
    <div className="space-y-4">
      {mcqs.map((q, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-7 h-7 rounded-lg bg-pink-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">Q{i + 1}</div>
            <p className="font-semibold text-sm leading-relaxed flex-1">{q.q}</p>
          </div>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const picked = answers[i] === oi;
              const isCorrect = oi === q.correct;
              const showResult = submitted;
              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => setAnswers(a => ({ ...a, [i]: oi }))}
                  className={cx(
                    'w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all flex items-center gap-3',
                    !showResult && picked && 'border-teal-500 bg-teal-50 dark:bg-teal-500/15',
                    !showResult && !picked && 'border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700',
                    showResult && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15',
                    showResult && picked && !isCorrect && 'border-rose-500 bg-rose-50 dark:bg-rose-500/15',
                    showResult && !picked && !isCorrect && 'border-slate-200 dark:border-slate-700 opacity-60',
                  )}
                >
                  <span className={cx(
                    'w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center flex-shrink-0',
                    !showResult && picked && 'bg-teal-500 text-white',
                    !showResult && !picked && 'bg-slate-200 dark:bg-slate-700',
                    showResult && isCorrect && 'bg-emerald-500 text-white',
                    showResult && picked && !isCorrect && 'bg-rose-500 text-white',
                    showResult && !picked && !isCorrect && 'bg-slate-200 dark:bg-slate-700',
                  )}>
                    {showResult && isCorrect ? <Check size={12} /> :
                     showResult && picked && !isCorrect ? <X size={12} /> :
                     String.fromCharCode(65 + oi)}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>
          {submitted && (
            <div className={cx(
              'mt-3 rounded-lg p-3 text-sm border',
              answers[i] === q.correct
                ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                : 'border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-200'
            )}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {answers[i] === q.correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {answers[i] === q.correct ? 'Correct' : 'Why this is wrong'}
              </div>
              <p className="text-xs leading-relaxed">{q.explain}</p>
            </div>
          )}
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2">
        {!submitted ? (
          <button
            onClick={submit}
            disabled={Object.keys(answers).length < mcqs.length}
            className="px-5 py-2.5 rounded-full bg-pink-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pink-600"
          >
            Submit answers ({Object.keys(answers).length}/{mcqs.length})
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-sm font-bold">
              <Trophy size={14} />
              {mcqs.filter((q, i) => answers[i] === q.correct).length} / {mcqs.length} correct
            </div>
            <button onClick={reset} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
              <RefreshCw size={12} /> Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============== DASHBOARD ==============
function Dashboard({ cases, progress, navigate, userRole }) {
  const totalStages = cases.length * STAGES.length;
  const completedStages = Object.values(progress.completedStages || {})
    .reduce((sum, c) => sum + Object.values(c).filter(Boolean).length, 0);
  const overallPct = totalStages ? Math.round((completedStages / totalStages) * 100) : 0;

  const mcqStats = useMemo(() => {
    const entries = Object.values(progress.mcqScores || {});
    const totalQ = entries.reduce((s, e) => s + (e.total || 0), 0);
    const correctQ = entries.reduce((s, e) => s + (e.correct || 0), 0);
    return { totalQ, correctQ, pct: totalQ ? Math.round(correctQ / totalQ * 100) : 0 };
  }, [progress.mcqScores]);

  const radarData = STAGES.slice(0, 6).map(s => {
    const cnt = Object.values(progress.completedStages || {}).filter(c => c[s.key]).length;
    return { stage: s.label.split(' ')[0], value: cases.length ? Math.round(cnt / cases.length * 100) : 0 };
  });

  const recentCases = useMemo(() => {
    return cases
      .map(c => {
        const completed = progress.completedStages?.[c.id] || {};
        const cnt = Object.values(completed).filter(Boolean).length;
        return { ...c, completedCount: cnt };
      })
      .sort((a, b) => b.completedCount - a.completedCount)
      .slice(0, 5);
  }, [cases, progress.completedStages]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <button onClick={() => navigate({ name: 'landing' })} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4">
        <ChevronLeft size={14} /> Back to lobby
      </button>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold mb-2">Learner profile</p>
        <h1 className="display-font text-4xl font-bold">Your progress.</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-7 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 blur-[80px] rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <userRole.icon className="text-white" size={26} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider opacity-80">Current rank</div>
                <div className="display-font text-2xl font-bold">{userRole.label}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-3xl display-font font-bold">{progress.xp}</div>
                <div className="text-xs uppercase tracking-wider opacity-80">XP earned</div>
              </div>
              <div>
                <div className="text-3xl display-font font-bold">{overallPct}%</div>
                <div className="text-xs uppercase tracking-wider opacity-80">Workflow done</div>
              </div>
              <div>
                <div className="text-3xl display-font font-bold">{mcqStats.pct}%</div>
                <div className="text-xs uppercase tracking-wider opacity-80">MCQ accuracy</div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-white/20">
              <RoleProgress xp={progress.xp} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Award size={16} className="text-amber-500" /> Badges</h3>
          {progress.badges?.length ? (
            <div className="grid grid-cols-3 gap-2">
              {progress.badges.map(id => {
                const c = cases.find(x => x.id === id);
                return (
                  <div key={id} className="rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-500/20 dark:to-yellow-500/20 border border-amber-300 dark:border-amber-500/30 p-3 text-center">
                    <Trophy size={20} className="mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                    <div className="text-[10px] font-bold leading-tight">{c?.title?.split(' ').slice(0, 2).join(' ') || 'Master'}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Trophy size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">Score 100% on a case MCQ to earn a badge.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Target size={16} className="text-teal-500" /> Strengths across stages</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(148,163,184,0.2)" />
                <PolarAngleAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Lightbulb size={16} className="text-amber-500" /> Suggested next</h3>
          <div className="space-y-2">
            {cases
              .filter(c => {
                const cnt = Object.values(progress.completedStages?.[c.id] || {}).filter(Boolean).length;
                return cnt < STAGES.length;
              })
              .slice(0, 4)
              .map(c => {
                const sev = SEVERITY[c.severity];
                return (
                  <button key={c.id} onClick={() => navigate({ name: 'case', caseId: c.id })} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors">
                    <span className={cx('w-2 h-2 rounded-full', sev.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{c.title}</div>
                      <div className="text-xs text-slate-500">{c.system}</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400" />
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Clock size={16} className="text-violet-500" /> Recent activity</h3>
        <div className="space-y-2">
          {recentCases.map(c => {
            const pct = Math.round(c.completedCount / STAGES.length * 100);
            return (
              <div key={c.id} className="flex items-center gap-3 p-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{c.title}</div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-1.5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500 tabular-nums">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RoleProgress({ xp }) {
  const next = ROLES.find(r => xp < r.xpRequired);
  if (!next) return <div className="text-xs opacity-80">Maximum rank achieved 🎉</div>;
  const prev = ROLES.filter(r => xp >= r.xpRequired).slice(-1)[0];
  const pct = Math.round((xp - prev.xpRequired) / (next.xpRequired - prev.xpRequired) * 100);
  return (
    <div>
      <div className="flex justify-between text-[11px] uppercase tracking-wider opacity-80 mb-1.5">
        <span>{prev.label}</span>
        <span>Next: {next.label} · {next.xpRequired - xp} XP</span>
      </div>
      <div className="h-2 rounded-full bg-white/20 overflow-hidden">
        <div className="h-full bg-white" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ============== ADMIN PANEL ==============
function AdminPanel({ cases, updateCase, addCase, deleteCase, navigate, auth }) {
  const [activeId, setActiveId] = useState(cases[0]?.id);
  const [activeStageKey, setActiveStageKey] = useState('profile');
  const [showNew, setShowNew] = useState(false);

  // Update activeId when cases change
  useEffect(() => {
    if (!activeId && cases.length > 0) setActiveId(cases[0].id);
    if (activeId && !cases.find(c => c.id === activeId)) setActiveId(cases[0]?.id);
  }, [cases, activeId]);

  const active = cases.find(c => c.id === activeId);

  // ===== Access control: must be signed in AND in the admins table =====
  if (!auth?.user) {
    return (
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={22} />
          </div>
          <h2 className="display-font text-2xl font-bold mb-2">Sign in required</h2>
          <p className="text-sm text-slate-500 mb-4">Please sign in to access the admin panel.</p>
          <button onClick={() => navigate({ name: 'landing' })} className="text-sm text-teal-600 underline">Back to home</button>
        </div>
      </div>
    );
  }

  if (!auth.isAdmin) {
    return (
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="rounded-3xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white" size={22} />
          </div>
          <h2 className="display-font text-2xl font-bold mb-2">Admin access only</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            Your account (<strong>{auth.user.email}</strong>) is not in the admin list.
          </p>
          <p className="text-xs text-slate-500 mb-4">
            To grant admin access, run this SQL in your Supabase SQL editor:
          </p>
          <pre className="text-[11px] bg-slate-900 text-emerald-300 p-3 rounded-lg text-left mb-4 overflow-x-auto">
{`insert into admins (email)
values ('${auth.user.email}');`}
          </pre>
          <button onClick={() => navigate({ name: 'landing' })} className="text-sm text-teal-600 underline">Back to home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold mb-1">Content authoring</p>
          <h1 className="display-font text-3xl font-bold">Admin Panel</h1>
          <p className="text-xs text-slate-500 mt-1">Signed in as <strong>{auth.user.email}</strong> · Changes save to Supabase instantly</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-full bg-teal-500 text-white text-sm font-bold flex items-center gap-1.5 hover:bg-teal-600">
            <Plus size={14} /> New case
          </button>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(cases, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'virtual-hospital-cases.json';
              a.click(); URL.revokeObjectURL(url);
            }}
            className="px-3 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-sm font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Download size={14} /> Export backup
          </button>
        </div>
      </div>

      {showNew && (
        <NewCaseModal
          onClose={() => setShowNew(false)}
          onCreate={(c) => {
            addCase(c);
            setActiveId(c.id);
            setShowNew(false);
          }}
        />
      )}

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        {/* Case list */}
        <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto scrollbar-thin">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
            <span>Cases ({cases.length})</span>
          </div>
          {cases.map(c => {
            const sev = SEVERITY[c.severity];
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cx(
                  'w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all mb-0.5',
                  activeId === c.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <span className={cx('w-1.5 h-1.5 rounded-full flex-shrink-0', sev.dot)} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{c.title}</div>
                  <div className={cx('text-[10px] uppercase tracking-wider', activeId === c.id ? 'opacity-70' : 'text-slate-500')}>
                    {c.hospital === 'cardiology' ? 'CV' : 'IM'} · {DEPARTMENT_BY_ID[c.department]?.short || '—'} · {c.severity}
                  </div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Editor */}
        {active ? (
          <CaseEditor
            key={active.id}
            caseData={active}
            stageKey={activeStageKey}
            setStageKey={setActiveStageKey}
            onUpdate={updateCase}
            onDelete={() => {
              if (confirm(`Delete "${active.title}"?`)) {
                deleteCase(active.id);
                setActiveId(cases.filter(c => c.id !== active.id)[0]?.id);
              }
            }}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-500">
            <p>No case selected. Create one to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NewCaseModal({ onClose, onCreate }) {
  const [draft, setDraft] = useState({
    title: '', hospital: 'cardiology', department: 'cv-ccu', bedNumber: '',
    severity: 'urgent', system: 'Cardiology', chiefComplaint: '', tags: ''
  });

  const availableDepartments = DEPARTMENTS[draft.hospital] || [];

  // When hospital changes, reset department to first one
  useEffect(() => {
    const first = DEPARTMENTS[draft.hospital]?.[0];
    if (first && !DEPARTMENTS[draft.hospital].find(d => d.id === draft.department)) {
      setDraft(d => ({ ...d, department: first.id }));
    }
  }, [draft.hospital]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h3 className="display-font text-xl font-bold">New clinical case</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-3">
          <Field label="Case title">
            <input
              autoFocus value={draft.title}
              onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
              placeholder="e.g., Acute Pericarditis"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-teal-500 focus:outline-none text-sm"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hospital">
              <select value={draft.hospital} onChange={e => setDraft(d => ({ ...d, hospital: e.target.value, system: e.target.value === 'cardiology' ? 'Cardiology' : 'Internal Medicine' }))} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
                <option value="cardiology">Cardiology</option>
                <option value="internal">Internal Medicine</option>
              </select>
            </Field>
            <Field label="Severity">
              <select value={draft.severity} onChange={e => setDraft(d => ({ ...d, severity: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
                <option value="stable">Stable</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </Field>
          </div>
          <Field label="Department / ward">
            <select
              value={draft.department}
              onChange={e => setDraft(d => ({ ...d, department: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm"
            >
              {availableDepartments.map(d => (
                <option key={d.id} value={d.id}>{d.label} ({d.beds} beds)</option>
              ))}
            </select>
            {DEPARTMENT_BY_ID[draft.department]?.desc && (
              <p className="text-[11px] text-slate-500 mt-1.5 italic">{DEPARTMENT_BY_ID[draft.department].desc}</p>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bed number (optional)">
              <input
                type="number" min="1" max={DEPARTMENT_BY_ID[draft.department]?.beds || 10}
                value={draft.bedNumber}
                onChange={e => setDraft(d => ({ ...d, bedNumber: e.target.value }))}
                placeholder="Auto-assign"
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm"
              />
            </Field>
            <Field label="System">
              <input value={draft.system} onChange={e => setDraft(d => ({ ...d, system: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm" />
            </Field>
          </div>
          <Field label="Chief complaint">
            <input value={draft.chiefComplaint} onChange={e => setDraft(d => ({ ...d, chiefComplaint: e.target.value }))} placeholder="e.g., Sharp pleuritic chest pain × 2 days" className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm" />
          </Field>
          <Field label="Tags (comma-separated)">
            <input value={draft.tags} onChange={e => setDraft(d => ({ ...d, tags: e.target.value }))} placeholder="e.g., Pericarditis, NSAID, Cardiac" className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm" />
          </Field>
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-slate-900">
          <button onClick={onClose} className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-sm">Cancel</button>
          <button
            onClick={() => {
              if (!draft.title.trim()) return alert('Title required');
              const newCase = {
                ...draft,
                id: 'c-custom-' + Date.now(),
                bedNumber: draft.bedNumber ? parseInt(draft.bedNumber, 10) : null,
                tags: draft.tags.split(',').map(t => t.trim()).filter(Boolean),
                profile: { name: '', age: '', sex: '', mrn: '', allergies: '', weight: '', occupation: '', pmh: '' },
                vitals: { hr: '', bp: '', rr: '', spo2: '', temp: '', gcs: '' },
                handover: '', assessment: '', resident: '', consultant: '', teaching: '',
                orders: '', nursing: '', investigations: '', imaging: '', medications: '',
                monitoring: '', complications: '', differentials: '', plan: '',
                progressNotes: '', discharge: '', pearls: '', mcqs: [], labTrend: []
              };
              onCreate(newCase);
            }}
            className="px-5 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-bold"
          >Create case</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">{label}</div>
      {children}
    </div>
  );
}

function CaseEditor({ caseData, stageKey, setStageKey, onUpdate, onDelete }) {
  const [draft, setDraft] = useState(caseData);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setDraft(caseData); }, [caseData.id]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(caseData);

  const save = () => {
    onUpdate(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const updateField = (key, value) => setDraft(d => ({ ...d, [key]: value }));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Editor header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            value={draft.title}
            onChange={e => updateField('title', e.target.value)}
            className="display-font text-2xl font-bold bg-transparent border-none focus:outline-none w-full"
          />
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <select value={draft.severity} onChange={e => updateField('severity', e.target.value)} className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
              <option value="stable">Stable</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={draft.hospital}
              onChange={e => {
                const newHosp = e.target.value;
                const firstDept = DEPARTMENTS[newHosp]?.[0]?.id;
                setDraft(d => ({ ...d, hospital: newHosp, department: firstDept }));
              }}
              className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
            >
              <option value="cardiology">Cardiology</option>
              <option value="internal">Internal Medicine</option>
            </select>
            <select
              value={draft.department || ''}
              onChange={e => updateField('department', e.target.value)}
              className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
              title="Department"
            >
              <option value="">— No department —</option>
              {(DEPARTMENTS[draft.hospital] || []).map(d => (
                <option key={d.id} value={d.id}>{d.short} · {d.label}</option>
              ))}
            </select>
            <input
              type="number" min="1"
              max={DEPARTMENT_BY_ID[draft.department]?.beds || 20}
              value={draft.bedNumber || ''}
              onChange={e => updateField('bedNumber', e.target.value ? parseInt(e.target.value, 10) : null)}
              placeholder="Bed #"
              className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 w-16"
              title="Bed number in the department"
            />
            <input value={draft.system || ''} onChange={e => updateField('system', e.target.value)} placeholder="System" className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 w-28" />
            <input value={draft.chiefComplaint || ''} onChange={e => updateField('chiefComplaint', e.target.value)} placeholder="Chief complaint" className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 flex-1 min-w-[150px]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && !saved && <span className="text-xs text-amber-600 font-semibold">Unsaved</span>}
          {saved && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 size={12} /> Saved</span>}
          <button onClick={save} disabled={!dirty} className="px-4 py-2 rounded-full bg-teal-500 text-white text-sm font-bold disabled:opacity-40 hover:bg-teal-600 flex items-center gap-1.5">
            <Save size={14} /> Save
          </button>
          <button onClick={onDelete} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-rose-500/15 text-rose-500" title="Delete case">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Stage tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-thin">
        <div className="flex p-2 gap-1 min-w-max">
          <StageTab id="meta" label="📋 Profile + Vitals" active={stageKey === 'meta'} onClick={() => setStageKey('meta')} />
          <StageTab id="sections" label="🧩 Sections" active={stageKey === 'sections'} onClick={() => setStageKey('sections')} />
          {getCaseStages(draft).filter(s => s.key !== 'profile').map(s => (
            <StageTab key={s.key} id={s.id} label={s.label} active={stageKey === s.key} onClick={() => setStageKey(s.key)} />
          ))}
          <StageTab id="labtrend" label="📈 Lab trend" active={stageKey === 'labtrend'} onClick={() => setStageKey('labtrend')} />
        </div>
      </div>

      {/* Editor body */}
      <div className="p-6">
        {stageKey === 'meta' && (
          <MetaEditor draft={draft} updateField={updateField} setDraft={setDraft} />
        )}
        {stageKey === 'sections' && (
          <SectionsEditor draft={draft} updateField={updateField} />
        )}
        {stageKey === 'mcqs' && (
          <MCQEditor mcqs={draft.mcqs || []} onChange={(m) => updateField('mcqs', m)} />
        )}
        {stageKey === 'labtrend' && (
          <LabTrendEditor data={draft.labTrend || []} onChange={(d) => updateField('labTrend', d)} />
        )}
        {!['meta', 'sections', 'mcqs', 'labtrend'].includes(stageKey) && (
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
              {getCaseStages(draft).find(s => s.key === stageKey)?.label || STAGES.find(s => s.key === stageKey)?.label}
            </div>
            <RichTextEditor
              value={draft[stageKey === 'progress' ? 'progressNotes' : stageKey] || ''}
              onChange={(v) => updateField(stageKey === 'progress' ? 'progressNotes' : stageKey, v)}
              placeholder={`Author content for ${getCaseStages(draft).find(s => s.key === stageKey)?.label || stageKey}...`}
              minH={300}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StageTab({ id, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
        active
          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
      )}
    >
      <span className={cx('text-[10px] font-mono', active ? 'opacity-80' : 'text-slate-400')}>{id}</span>
      {label}
    </button>
  );
}

function MetaEditor({ draft, updateField, setDraft }) {
  const updateProfile = (k, v) => setDraft(d => ({ ...d, profile: { ...d.profile, [k]: v } }));
  const updateVitals = (k, v) => setDraft(d => ({ ...d, vitals: { ...d.vitals, [k]: v } }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2"><UserCircle size={16} /> Patient profile</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ['name', 'Patient name'], ['age', 'Age'], ['sex', 'Sex'], ['mrn', 'MRN'],
            ['weight', 'Weight'], ['allergies', 'Allergies'], ['occupation', 'Occupation'], ['pmh', 'Past medical history']
          ].map(([k, label]) => (
            <Field key={k} label={label}>
              <input value={draft.profile?.[k] || ''} onChange={e => updateProfile(k, e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm" />
            </Field>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2"><Activity size={16} /> Vital signs</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[['hr', 'HR (bpm)'], ['bp', 'BP'], ['rr', 'RR'], ['spo2', 'SpO2 %'], ['temp', 'Temp °C'], ['gcs', 'GCS']].map(([k, label]) => (
            <Field key={k} label={label}>
              <input value={draft.vitals?.[k] || ''} onChange={e => updateVitals(k, e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm" />
            </Field>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2"><Bookmark size={16} /> Tags</h3>
        <input
          value={(draft.tags || []).join(', ')}
          onChange={e => updateField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="ACS, STEMI, PCI"
          className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm"
        />
      </div>
    </div>
  );
}

// ============== SECTIONS EDITOR (rename, reorder, delete, add) ==============
function SectionsEditor({ draft, updateField }) {
  // Initialize stages from current case or defaults
  const currentStages = useMemo(() => {
    if (draft.stages && Array.isArray(draft.stages) && draft.stages.length > 0) {
      return draft.stages;
    }
    // Convert default STAGES to a serializable form (drop icon component)
    return STAGES.map(s => ({ id: s.id, key: s.key, label: s.label, color: s.color, removed: false }));
  }, [draft.stages]);

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const saveStages = (next) => updateField('stages', next);

  const moveSection = (from, to) => {
    if (from === to || from < 0 || to < 0 || from >= currentStages.length || to >= currentStages.length) return;
    const next = [...currentStages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    saveStages(next);
  };

  const renameSection = (idx, newLabel) => {
    const next = [...currentStages];
    next[idx] = { ...next[idx], label: newLabel };
    saveStages(next);
  };

  const toggleRemoved = (idx) => {
    const next = [...currentStages];
    next[idx] = { ...next[idx], removed: !next[idx].removed };
    saveStages(next);
  };

  const addSection = () => {
    const label = prompt('Section name (e.g., "Family Discussion", "Imaging Review"):');
    if (!label || !label.trim()) return;
    // Generate a unique key from the label
    const baseKey = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'custom';
    let key = baseKey;
    let suffix = 1;
    while (currentStages.find(s => s.key === key)) {
      key = `${baseKey}_${suffix++}`;
    }
    const nextId = `S${currentStages.length + 1}`;
    saveStages([...currentStages, { id: nextId, key, label: label.trim(), color: 'teal', custom: true, removed: false }]);
  };

  const resetSections = () => {
    if (confirm('Reset to the default 19 stages? This will remove any custom sections you added (content remains preserved on the case object).')) {
      updateField('stages', null);
    }
  };

  const handleDragStart = (idx) => setDragIndex(idx);
  const handleDragOver = (idx, e) => {
    e.preventDefault();
    if (dragOver !== idx) setDragOver(idx);
  };
  const handleDrop = (idx) => {
    if (dragIndex !== null) moveSection(dragIndex, idx);
    setDragIndex(null);
    setDragOver(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold flex items-center gap-2"><Layers size={16} /> Manage sections</h3>
          <p className="text-xs text-slate-500 mt-1">
            Drag to reorder · click ✏️ to rename · 🗑 to remove a stage · Add custom stages below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetSections} className="px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <RefreshCw size={12} /> Reset to default
          </button>
          <button onClick={addSection} className="px-3 py-1.5 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center gap-1 hover:bg-teal-600">
            <Plus size={12} /> Add section
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-2 space-y-1">
        {currentStages.map((s, idx) => (
          <SectionRow
            key={s.key}
            stage={s} index={idx} total={currentStages.length}
            onRename={(label) => renameSection(idx, label)}
            onToggleRemove={() => toggleRemoved(idx)}
            onMoveUp={() => moveSection(idx, idx - 1)}
            onMoveDown={() => moveSection(idx, idx + 1)}
            isDragging={dragIndex === idx}
            isOver={dragOver === idx && dragIndex !== idx}
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(idx, e)}
            onDragEnd={() => { setDragIndex(null); setDragOver(null); }}
            onDrop={() => handleDrop(idx)}
          />
        ))}
      </div>

      <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3 text-xs text-amber-900 dark:text-amber-200">
        <strong>Note:</strong> Removing a section hides it from learners but does <em>not</em> delete the content — restore it any time by clicking the 🗑 again.
        Custom sections you add appear at the end of the timeline; their content is editable as soon as you save and re-open this case.
      </div>
    </div>
  );
}

function SectionRow({ stage, index, total, onRename, onToggleRemove, onMoveUp, onMoveDown,
                     isDragging, isOver, onDragStart, onDragOver, onDragEnd, onDrop }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stage.label);
  const original = STAGES.find(o => o.key === stage.key);
  const Icon = original?.icon || ClipboardList;

  useEffect(() => { setDraft(stage.label); }, [stage.label]);

  const commit = () => {
    if (draft.trim()) onRename(draft.trim());
    setEditing(false);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={cx(
        'flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border transition-all',
        isDragging && 'opacity-40',
        isOver ? 'border-teal-500 ring-2 ring-teal-500/30' : 'border-slate-200 dark:border-slate-700',
        stage.removed && 'opacity-50'
      )}
    >
      <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1" title="Drag to reorder">
        <GripVertical size={16} />
      </div>

      <div className="text-[10px] font-mono text-slate-400 w-8">{stage.id}</div>
      <Icon size={14} className="text-slate-500 flex-shrink-0" />

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') { setDraft(stage.label); setEditing(false); }
          }}
          className="flex-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 ring-teal-500/40"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className={cx(
            'flex-1 text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium',
            stage.removed && 'line-through'
          )}
        >
          {stage.label}
          {stage.custom && <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">Custom</span>}
        </button>
      )}

      <div className="flex items-center gap-0.5">
        <button onClick={onMoveUp} disabled={index === 0}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Move up">
          <ArrowUp size={13} />
        </button>
        <button onClick={onMoveDown} disabled={index === total - 1}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Move down">
          <ArrowDown size={13} />
        </button>
        <button onClick={() => setEditing(true)}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Rename">
          <Pencil size={13} />
        </button>
        <button onClick={onToggleRemove}
          className={cx('p-1.5 rounded',
            stage.removed
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
              : 'hover:bg-rose-100 dark:hover:bg-rose-500/15 text-rose-500'
          )}
          title={stage.removed ? 'Restore section' : 'Hide / remove'}>
          {stage.removed ? <RefreshCw size={13} /> : <Trash2 size={13} />}
        </button>
      </div>
    </div>
  );
}

function MCQEditor({ mcqs, onChange }) {
  const update = (i, k, v) => {
    const next = [...mcqs];
    next[i] = { ...next[i], [k]: v };
    onChange(next);
  };
  const updateOpt = (i, oi, v) => {
    const next = [...mcqs];
    const opts = [...next[i].options];
    opts[oi] = v;
    next[i] = { ...next[i], options: opts };
    onChange(next);
  };
  const addQ = () => onChange([...mcqs, { q: '', options: ['', '', '', ''], correct: 0, explain: '' }]);
  const removeQ = (i) => onChange(mcqs.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2"><Brain size={16} /> Multiple choice questions</h3>
        <button onClick={addQ} className="px-3 py-1.5 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center gap-1 hover:bg-pink-600">
          <Plus size={12} /> Add question
        </button>
      </div>

      {mcqs.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500">
          <Brain size={28} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No MCQs yet. Click "Add question" to start.</p>
        </div>
      )}

      {mcqs.map((q, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5">
          <div className="flex items-start justify-between mb-3 gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-lg bg-pink-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">Q{i + 1}</div>
              <textarea
                value={q.q} onChange={e => update(i, 'q', e.target.value)} placeholder="Question text..."
                rows={2}
                className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm resize-none"
              />
            </div>
            <button onClick={() => removeQ(i)} className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/15 text-rose-500"><Trash2 size={14} /></button>
          </div>

          <div className="space-y-2 mb-3">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <button
                  onClick={() => update(i, 'correct', oi)}
                  className={cx(
                    'w-7 h-7 rounded-md text-[10px] font-bold flex items-center justify-center flex-shrink-0',
                    q.correct === oi ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                  )}
                  title="Mark correct"
                >
                  {q.correct === oi ? <Check size={12} /> : String.fromCharCode(65 + oi)}
                </button>
                <input
                  value={opt} onChange={e => updateOpt(i, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                  className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            ))}
          </div>

          <Field label="Explanation (mistake feedback)">
            <textarea
              value={q.explain} onChange={e => update(i, 'explain', e.target.value)} rows={2}
              placeholder="Explain why the correct answer is correct, and why common wrong choices are wrong..."
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm resize-none"
            />
          </Field>
        </div>
      ))}
    </div>
  );
}

function LabTrendEditor({ data, onChange }) {
  const [draftJSON, setDraftJSON] = useState(JSON.stringify(data, null, 2));
  const [err, setErr] = useState('');

  const apply = () => {
    try {
      const parsed = JSON.parse(draftJSON);
      if (!Array.isArray(parsed)) throw new Error('Must be a JSON array');
      onChange(parsed);
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2"><TrendingUp size={16} /> Lab trend data</h3>
        <button onClick={apply} className="px-3 py-1.5 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center gap-1 hover:bg-teal-600">
          <Check size={12} /> Apply
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        JSON array of objects, each with a <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">time</code> field plus any number of measurement keys.
        e.g. <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">{`[{"time":"0h","troponin":2.4}]`}</code>
      </p>
      <textarea
        value={draftJSON} onChange={e => setDraftJSON(e.target.value)} rows={12}
        className="w-full px-3 py-2 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs border border-slate-700"
      />
      {err && <p className="text-xs text-rose-500 mt-2">{err}</p>}
      {data.length > 0 && !err && (
        <div className="mt-4">
          <LabTrendChart data={data} />
        </div>
      )}
    </div>
  );
}
