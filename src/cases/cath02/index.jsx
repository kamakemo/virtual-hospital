import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Steps, Step, Figure, Video, Quiz, fmtClock,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor,
} from '../kit/CaseKit.jsx';
import ECG12 from '../kit/ECG12.jsx';
import Angio from '../kit/Angio.jsx';
import IVUS from '../kit/IVUS.jsx';
import { Barbeau, PressureWire, Inflator, CatheterPressure } from '../kit/Physiology.jsx';
import { TREE, VIEWS, ivusProfile, IVUS_MARKS, STENT, RCA_LESION, OSTIAL } from './anatomy.js';

/* ============================================================
   CATH LAB · CASE 02
   Chronic coronary syndrome: a 59-year-old teacher with
   CCS III angina despite three anti-anginal drugs. Elective
   radial PCI of an eccentric mid-RCA plaque — hidden in one
   view, obvious in another, confirmed by physiology and sized
   by IVUS. A guide extension delivers the stent; withdrawing
   it pulls the JR4 deep, the pressure damps, a final puff is
   injected — and the ostium of the RCA dissects.

   Clinical content follows the 2024 ESC guideline on chronic
   coronary syndromes, ISCHEMIA / ORBITA-2, and published
   management of iatrogenic aorto-coronary dissection,
   simplified for teaching.
   ============================================================ */

const WIKI = f => `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=960`;
const WIKIPAGE = f => `https://commons.wikimedia.org/wiki/File:${f}`;
const min = (h, m) => h * 60 + m;
const RIGHT = VIEWS.filter(v => v.system === 'right');

/* ---------- small local pieces ---------- */

function Reveal({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="cs-card tight" style={{ marginBottom: 8 }}>
      <button className="cs-btn" onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ width: '100%', justifyContent: 'space-between' }}>
        <span>{label}</span><span className="cs-mono" style={{ color: 'var(--ink3)' }}>{open ? '−' : '+'}</span>
      </button>
      {open && <div style={{ marginTop: 10 }}>{children}</div>}
    </div>
  );
}

function Table({ head, rows }) {
  return (
    <div className="cs-scroll">
      <table className="cs-table">
        <thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k} className={typeof c === 'object' && c?.num ? 'num' : ''}>{typeof c === 'object' && c?.v != null ? <span className={c.cls}>{c.v}</span> : c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
const N = (v, cls) => ({ v, num: true, cls });

function ScoreOnce({ id, pts, max }) {
  const { award, stageId } = useCase();
  useEffect(() => { if (pts != null) award(stageId, id, pts, max); }, [pts]);  // eslint-disable-line
  return null;
}

/** Pd/Pa along a slow pullback: one sharp step (focal) or a long slope (diffuse). */
function PullbackCurve() {
  const [mode, setMode] = useState('focal');
  const W = 640, H = 220, pad = 38;
  const val = x => mode === 'focal'
    ? (x < 26 ? 0.71 + x * 0.0008 : x < 38 ? 0.731 + (0.94 - 0.731) * ((x - 26) / 12) ** 1.4 : 0.94 + (x - 38) * 0.001)
    : 0.71 + (0.97 - 0.71) * (x / 70) ** 0.9;
  const X = x => pad + x / 70 * (W - pad - 10), Y = v => H - 28 - (v - 0.6) / 0.42 * (H - 50);
  const d = Array.from({ length: 141 }, (_, i) => i / 2).map((x, i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(val(x)).toFixed(1)}`).join(' ');
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        <button className={'cs-chip' + (mode === 'focal' ? ' on' : '')} onClick={() => setMode('focal')}>Her pullback</button>
        <button className={'cs-chip' + (mode === 'diffuse' ? ' on' : '')} onClick={() => setMode('diffuse')}>For contrast: diffuse disease</button>
      </div>
      <div className="cs-viewer" style={{ background: '#03070B' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="Pressure-wire pullback curve">
          {[0.6, 0.7, 0.8, 0.9, 1.0].map(v => (
            <g key={v}>
              <line x1={pad} x2={W - 10} y1={Y(v)} y2={Y(v)} stroke={v === 0.8 ? '#FF4D6D' : '#13212D'} strokeDasharray={v === 0.8 ? '5 4' : ''} />
              <text x={6} y={Y(v) + 4} fill="#6A7F9B" fontSize="11" fontFamily="JetBrains Mono, monospace">{v.toFixed(2)}</text>
            </g>
          ))}
          <path d={d} fill="none" stroke="#F2D24B" strokeWidth="2.6" />
          <text x={W - 12} y={H - 8} textAnchor="end" fill="#6A7F9B" fontSize="11" fontFamily="JetBrains Mono, monospace">guide tip →</text>
          <text x={pad} y={H - 8} fill="#6A7F9B" fontSize="11" fontFamily="JetBrains Mono, monospace">← distal RCA</text>
          {mode === 'focal' && <text x={X(32)} y={Y(0.84) - 6} fill="#34E39A" fontSize="12" fontFamily="JetBrains Mono, monospace">Δ 0.21 over 12 mm</text>}
        </svg>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>{mode === 'focal'
        ? 'One step, exactly where the plaque is. Fix that segment and the whole artery recovers: predicted post-PCI FFR ≈ 0.93.'
        : 'Pressure bleeds away along the whole vessel. A stent fixes 20 mm of a 70 mm problem: post-PCI FFR stays low, and angina often persists.'}</p>
    </div>
  );
}

/* ============================================================
   1 · PRESENTATION & TRIAGE
   ============================================================ */

function Presentation() {
  const [ecg, setEcg] = useState('rest');
  const STRESS = { II: -1.5, III: -1.8, aVF: -1.6, V5: -1, V6: -1.2, aVR: 0.5 };
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">07:55</span>Mrs Samira Nassar, 59, teaches chemistry. Her laboratory is on the second floor. For four months she has had to stop halfway up the stairs with a <b>tight band across her chest, into her jaw</b>. It goes within three minutes of standing still; her GTN spray clears it in two.</p>
        <p className="cs-p"><span className="cs-time">history</span>Never at rest. Never at night. The same two flights, the same pain, every time. Hypertension, high cholesterol, ex-smoker (15 pack-years, stopped six years ago); her father had an MI at 52. No diabetes.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">drugs</span>Aspirin 75 mg, atorvastatin 40 mg, bisoprolol 10 mg, amlodipine 5 mg, and isosorbide mononitrate 30 mg added six weeks ago. Still limited. “I want to be able to climb to my own classroom.”</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Day-case admission · 07:55</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('58 /min, sinus')], ['Blood pressure', N('138/82 mmHg')], ['SpO₂', N('98% on air')],
            ['BMI', N('29 kg/m²')], ['Creatinine / eGFR', N('68 µmol/L · 88')], ['Haemoglobin', N('131 g/L')], ['LDL-C', N('2.3 mmol/L', 'cs-hi')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Investigations so far</div>
          <Table head={['Test', 'Result']} rows={[
            ['Echo at rest', 'LVEF 60%, normal wall motion, no valve disease'],
            ['CT coronary angiography', 'Calcium score 160. Mid RCA: eccentric, mostly non-calcified plaque, 70–99% (CAD-RADS 4A). Mid LAD 25–49%. LCx normal.'],
            ['Stress echo', 'Typical angina at 7 METs; new inferior and inferobasal hypokinesia; 1.5 mm ST depression II, III, aVF'],
          ]} />
        </div>
      </div>

      <div className="cs-h2">12-lead ECG</div>
      <div className="cs-row" style={{ marginBottom: 8 }}>
        <button className={'cs-chip' + (ecg === 'rest' ? ' on' : '')} onClick={() => setEcg('rest')}>At rest</button>
        <button className={'cs-chip' + (ecg === 'stress' ? ' on' : '')} onClick={() => setEcg('stress')}>Peak stress · 7 METs</button>
      </div>
      <ECG12 rate={ecg === 'rest' ? 58 : 138} st={ecg === 'rest' ? {} : STRESS}
        caption={ecg === 'rest'
          ? 'At rest: sinus bradycardia on bisoprolol, normal axis, no ST deviation. A normal resting ECG never rules out angina.'
          : 'At peak stress: horizontal ST depression in II, III and aVF and V5–V6, resolving in recovery — ischaemia appearing only when demand rises.'} />

      <MultiSelect id="s1-typical" question="Which of her features are the three that define typical (constrictive) angina?"
        items={[
          { id: 'char', label: 'Constricting discomfort in the chest, jaw, neck or arm', correct: true, why: 'Character and site.' },
          { id: 'exert', label: 'Brought on by exertion or emotion', correct: true, why: 'The trigger: demand rising.' },
          { id: 'relief', label: 'Relieved by rest or nitrates within five minutes', correct: true, why: 'Demand falls back under the fixed supply.' },
          { id: 'stable', label: 'Unchanged for four months', correct: false, why: 'That makes it stable, not typical. Typicality is about the pain; stability is about its pattern over time.' },
          { id: 'fh', label: 'Father with an MI at 52', correct: false, why: 'A risk factor raises the likelihood of disease — it says nothing about the character of the pain.' },
        ]}>
        <p className="cs-pts" style={{ marginBottom: 8 }}>The 2024 ESC guideline estimates likelihood from these symptoms plus risk factors (the RF-CL model), rather than labelling pain “typical” or “atypical” alone — but the three features remain the bedside core.</p>
      </MultiSelect>

      <Decision id="s1-ccs" question="Grade her angina."
        options={[
          { id: 'iii', label: 'CCS class III — marked limitation: angina walking one or two blocks on the level, or one flight of stairs at a normal pace', verdict: 'best', points: 10,
            why: 'She stops halfway up two flights — ordinary activity is markedly limited.' },
          { id: 'ii', label: 'CCS class II — slight limitation, angina only on brisk or uphill walking', verdict: 'ok', points: 3, why: 'Underestimates her: ordinary stairs stop her.' },
          { id: 'iv', label: 'CCS class IV — angina at rest or with any activity', verdict: 'wrong', points: 0, why: 'She is pain-free at rest.' },
        ]} />

      <Why title="Why the pain comes on the stairs — and leaves when she stops"
        chain={[
          { k: 'CEILING', t: 'A fixed plaque caps the maximum flow the RCA can deliver; at rest, the arterioles dilate to hide it.' },
          { k: 'DEMAND', t: 'Stairs raise heart rate, blood pressure and contractility — oxygen demand climbs past the ceiling.' },
          { k: 'DIASTOLE', t: 'A faster heart spends less time in diastole — the only time the LV muscle is perfused.' },
          { k: 'PAIN', t: 'The ischaemic subendocardium releases adenosine and lactate; cardiac afferents enter the cord at T1–T5, so the brain reads chest, jaw and arm.' },
          { k: 'RELIEF', t: 'Stop, and demand falls back below the ceiling. Within minutes the ischaemia clears — and so does the pain.' },
        ]}>
        That is why the threshold is reproducible: the same stairs, the same pain. The plaque does not change; her demand does.
      </Why>
      <Contrast title="stable angina vs an acute coronary syndrome"
        is={{ h: 'Chronic coronary syndrome (stable angina)', points: [
          'A fixed plaque with a thick fibrous cap.',
          'Predictable threshold; relieved by rest within minutes.',
          'Troponin normal. Investigated and treated electively.',
        ] }}
        isnt={{ h: 'Acute coronary syndrome', points: [
          'A ruptured or eroded plaque with thrombus — the lumen changes minute to minute.',
          'New, crescendo or rest pain; the threshold falls.',
          'Troponin may rise; managed on the ACS pathway, urgently.',
        ] }} />

      <Decision id="s1-test" question="Before any of this was done, what was the right first test for her?"
        options={[
          { id: 'ccta', label: 'CT coronary angiography', verdict: 'best', points: 10,
            why: 'For a moderate clinical likelihood without known disease, CCTA is the preferred first test: it rules out disease reliably and shows the anatomy (ESC 2024).' },
          { id: 'func', label: 'Functional imaging (stress echo, perfusion scan or stress CMR)', verdict: 'ok', points: 7, why: 'Equally acceptable first-line, especially at higher likelihood; she had one after the CT to judge significance.' },
          { id: 'ett', label: 'Exercise ECG alone', verdict: 'ok', points: 2, why: 'Poor sensitivity; no longer recommended to diagnose obstructive CAD on its own.' },
          { id: 'ica', label: 'Straight to invasive angiography', verdict: 'wrong', points: 0, why: 'Reserved for very high likelihood, refractory symptoms or high-risk features.' },
        ]} />

      <div className="cs-media-row">
        <Figure src={WIKI('Blausen_0022_Angina.png')} href={WIKIPAGE('Blausen_0022_Angina.png')} alt="Diagram of angina from a narrowed coronary artery" caption="Angina: a narrowed artery cannot raise its flow when the muscle beyond it needs more." credit="BruceBlaus, CC BY 3.0, Wikimedia Commons" />
        <Video id="-I-NN2PSAU8" title="Angina pectoris: stable, unstable, microvascular and Prinzmetal — animation" channel="Alila Medical Media" />
      </div>
    </>
  );
}

/* ============================================================
   2 · PRE-PROCEDURE WORKUP
   ============================================================ */

function Workup() {
  const EGFR = 88;
  return (
    <>
      <Decision id="s2-why" question="Why is she on today’s list?"
        options={[
          { id: 'sx', label: 'Lifestyle-limiting angina despite optimal medical therapy — PCI is to relieve her symptoms', verdict: 'best', points: 10,
            why: 'In chronic coronary syndromes, revascularisation is indicated for angina that persists despite medical therapy. It improves angina and quality of life (ISCHEMIA, ORBITA-2).' },
          { id: 'mi', label: 'To prevent a heart attack and help her live longer', verdict: 'wrong', points: 0,
            why: 'In stable disease without high-risk anatomy, PCI added to medical therapy did not reduce death or MI (COURAGE, ISCHEMIA). Saying so is part of consent.' },
          { id: 'anat', label: 'Because the CT shows a 70–99% stenosis', verdict: 'ok', points: 3, why: 'Anatomy alone is the indication only for prognostic disease (left main, proximal LAD with LV dysfunction, multivessel with reduced EF).' },
          { id: 'pref', label: 'Because she asked for a stent', verdict: 'ok', points: 2, why: 'Her preference matters — but alongside an indication, not instead of one.' },
        ]} />

      <Why title="Why a stent relieves angina but does not prevent infarction"
        chain={[
          { k: 'ANGINA', t: 'Angina comes from the tightest, flow-limiting plaque. Open it, raise the ceiling, the pain goes.' },
          { k: 'INFARCTS', t: 'Most heart attacks start in plaques that were never tight: lipid-rich, thin-capped, often < 50%.' },
          { k: 'BLIND SPOT', t: 'A stent treats one segment. The plaque that ruptures next year is usually somewhere else.' },
          { k: 'WHAT PROTECTS', t: 'Statins, antiplatelets, blood-pressure control and no smoking stabilise every plaque at once.' },
        ]}>
        So a stent is a symptom treatment in her — a very good one. Her pills are her life insurance. Tell her both.
      </Why>
      <Contrast title="what PCI does — and doesn’t — do in stable disease"
        is={{ h: 'What it does', points: [
          'Relieves angina faster and more completely than drugs alone.',
          'Improves exercise capacity and quality of life — beyond placebo (ORBITA-2).',
          'Lets some patients come off anti-anginal drugs.',
        ] }}
        isnt={{ h: 'What it doesn’t', points: [
          'Reduce death or myocardial infarction compared with optimal medical therapy (COURAGE, ISCHEMIA).',
          'Replace the statin, the aspirin, blood-pressure control or stopping smoking.',
          'Apply to prognostic anatomy — left main or extensive disease with poor LV — where revascularisation can save life.',
        ] }} />

      <p className="cs-p">The checklist before transfer — open each item.</p>
      <Reveal label="Consent">
        <p className="cs-p">Angiography with physiology and imaging, and PCI in the same sitting if a flow-limiting lesion suits it. Benefit: relief of angina. Risks: death, MI and stroke each well under 1%; bleeding and radial artery occlusion; contrast kidney injury (low for her); allergic reaction; <b>coronary dissection</b> or perforation; emergency surgery rarely; radiation. Alternatives: continue and adjust medical therapy, or surgery if the anatomy demanded it.</p>
      </Reveal>
      <Reveal label="Medicines on the morning">
        <p className="cs-p">Continue aspirin, statin, bisoprolol and amlodipine. Fasting light. <b>Ask about phosphodiesterase-5 inhibitors</b> (sildenafil within 24 h, tadalafil within 48 h): nitrates are given routinely in the lab, and the combination causes profound hypotension. She takes none.</p>
      </Reveal>
      <Reveal label="Kidneys and contrast">
        <p className="cs-p">eGFR {EGFR}. Ceiling by volume/eGFR &lt; 3.7: <b className="cs-mono">{Math.round(3.7 * EGFR)} mL</b>; working target ≤ 150 mL. Low risk — still a budget, because good habits are built on easy days.</p>
      </Reveal>

      <Decision id="s2-p2y12" question="Her anatomy is known and PCI is likely. Antiplatelet preparation?"
        options={[
          { id: 'clop', label: 'Continue aspirin; clopidogrel 600 mg at least 2 hours before the procedure', verdict: 'best', points: 10,
            why: 'In chronic coronary syndromes clopidogrel is the P2Y12 inhibitor of choice; when the anatomy is known and PCI is planned, loading beforehand is reasonable.' },
          { id: 'lab', label: 'No pretreatment — load clopidogrel in the lab once PCI is decided', verdict: 'ok', points: 6, why: 'Also acceptable, especially when anatomy is unknown; a 600 mg load takes about 2 hours to work fully.' },
          { id: 'tica', label: 'Ticagrelor 180 mg', verdict: 'wrong', points: 2, why: 'Potent P2Y12 inhibitors are reserved for ACS or selected high-risk elective PCI — more bleeding, no benefit here.' },
          { id: 'pras', label: 'Prasugrel 60 mg', verdict: 'wrong', points: 0, why: 'Not for elective PCI in chronic coronary syndromes.' },
        ]} />

      <div className="cs-h2">Access assessment — Barbeau test, right hand</div>
      <Barbeau type="A" />
      <Decision id="s2-barbeau" question="The thumb pleth does not change at all while the radial artery is compressed. Barbeau type?"
        options={[
          { id: 'A', label: 'Type A — excellent ulnar collateral supply; right radial is fine', verdict: 'best', points: 10, why: 'No damping at all: the palmar arch fills the thumb from the ulnar side.' },
          { id: 'B', label: 'Type B', verdict: 'wrong', points: 0, why: 'Type B damps and then recovers.' },
          { id: 'D', label: 'Type D — avoid this radial', verdict: 'wrong', points: 0, why: 'Type D loses the waveform without recovery.' },
        ]} />

      <MultiSelect id="s2-kit" question="An RCA intervention is likely. What do you want open, or in the room?"
        items={[
          { id: 'wire', label: 'Pressure wire', correct: true, why: 'To prove the lesion limits flow before treating it.' },
          { id: 'ivus', label: 'IVUS', correct: true, why: 'To size the stent and check the result.' },
          { id: 'gex', label: 'A guide extension catheter', correct: true, why: 'RCA guides from the radial often lack support; an extension delivers the stent without deep-seating the guide.' },
          { id: 'pace', label: 'Atropine drawn up and a temporary pacing wire available', correct: true, why: 'The RCA supplies the SA and AV nodes in most people: RCA ischaemia slows the heart.' },
          { id: 'rota', label: 'Rotational atherectomy', correct: false, why: 'The CT shows a mostly non-calcified plaque. Plan for the lesion you have.' },
          { id: 'iabp', label: 'Prophylactic intra-aortic balloon pump', correct: false, why: 'Normal LV, single vessel: no indication.' },
        ]} />

      <div className="cs-media-row">
        <Figure src="/images/cath-lab.webp" alt="Cardiac catheterisation laboratory prepared for a case" caption="Cath Lab 1, set up for the 08:45 case: C-arm parked, screens live, sterile trolley laid out." credit="Virtual Hospital" />
        <Video id="mcTHdCbAsoE" title="ISCHEMIA trial: revascularisation strategies in stable CAD" channel="Dr Chadi Alraies" />
      </div>
    </>
  );
}

/* ============================================================
   3 · VASCULAR ACCESS
   ============================================================ */

function Access() {
  const { answers, answer, bump } = useCase();
  const heparin = answers['s3-heparin'];
  const ACT = { 3000: 196, 5000: 242, 7000: 286, 10000: 388 };
  const give = (u) => { if (heparin) return; answer('s3-heparin', u); bump({ act: ACT[u] }); };
  return (
    <>
      <Decision id="s3-site" question="Arterial access?"
        options={[
          { id: 'rr', label: 'Right radial, 6F slender sheath', verdict: 'best', points: 10, why: 'Fewer bleeding and vascular complications, same-day discharge, and she walks out of the lab.' },
          { id: 'dr', label: 'Right distal radial (snuffbox)', verdict: 'ok', points: 8, why: 'A good alternative with less radial occlusion in some series; smaller artery, longer learning curve.' },
          { id: 'lr', label: 'Left radial', verdict: 'ok', points: 7, why: 'Valid — ergonomically harder, but straighter to the aorta in the elderly.' },
          { id: 'fem', label: 'Right femoral', verdict: 'wrong', points: 2, why: 'More bleeding and a night in bed for no gain.' },
        ]} />

      <Sequence id="s3-seq" question="Put the radial access in order."
        steps={[
          { label: 'Wrist extended on the arm board, prepped and draped; a little lidocaine under the skin', why: 'A comfortable patient makes fewer catecholamines — and less spasm.' },
          { label: 'Ultrasound-guided anterior-wall puncture with a 21G needle', why: 'Better first-pass success, fewer attempts.' },
          { label: 'Advance the 0.021″ wire without resistance', why: 'Resistance means a branch, a loop or a subintimal course. Stop and look.' },
          { label: 'Introduce the hydrophilic 6F sheath', why: 'Less friction, less spasm.' },
          { label: 'Spasmolytic cocktail and heparin through the sheath', why: 'Before catheters go up the arm.' },
        ]} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>Heparin for PCI — 74 kg, no anticoagulant at home</div>
        <p className="cs-p">Unfractionated heparin for PCI without a GP IIb/IIIa inhibitor: 70–100 IU/kg, aiming for an ACT of 250–350 s.</p>
        <div className="cs-row">
          {[3000, 5000, 7000, 10000].map(u => (
            <button key={u} className={'cs-btn' + (heparin === u ? ' primary' : '')} disabled={!!heparin} onClick={() => give(u)}>{u.toLocaleString()} IU ({Math.round(u / 74)} IU/kg)</button>
          ))}
        </div>
        {heparin && (
          <div className={'cs-fb ' + (heparin === 7000 ? 'best' : heparin === 5000 ? 'ok' : 'wrong')}>
            ACT at 5 minutes: <b className="cs-mono">{ACT[heparin]} s</b>. {heparin === 7000 ? 'On target.'
              : heparin === 5000 ? 'Just short of 250 s — fine for diagnostics, top up before the wire goes down.'
              : heparin === 3000 ? 'Too low for PCI: thrombus on the wire and in the guide.' : 'Over-anticoagulated: no benefit, more bleeding.'}
          </div>
        )}
        <ScoreOnce id="s3-hep" pts={heparin === 7000 ? 10 : heparin === 5000 ? 6 : heparin ? 0 : null} max={10} />
      </div>

      <Decision id="s3-guide" question="Guide catheter for a normally arising RCA from the right radial?"
        options={[
          { id: 'jr4', label: 'JR4, 6F', verdict: 'best', points: 10, why: 'Engages coaxially with gentle clockwise rotation and sits in the ostium without wedging. The workhorse for the RCA.' },
          { id: 'al', label: 'Amplatz left (AL 0.75–1)', verdict: 'ok', points: 5,
            why: 'Far more support — but its tip dives deep into the RCA with little warning, and it is the classic cause of catheter-induced RCA dissection. Keep it for when you need it, and watch it.' },
          { id: 'ebu', label: 'EBU 3.5', verdict: 'wrong', points: 0, why: 'A left coronary guide.' },
        ]} />

      <Why title="Why the shape of the catheter decides the pressure you see"
        chain={[
          { k: 'ROUTE', t: 'From the right radial the catheter enters the aorta from the innominate artery, above and to the right.' },
          { k: 'ROTATE', t: 'Clockwise torque swings the JR tip from the left cusp, across the front, into the right cusp — and the RCA ostium.' },
          { k: 'COAXIAL', t: 'Tip in line with the ostium: blood still flows past it into the artery, and the transducer reads the aorta.' },
          { k: 'WEDGED', t: 'Tip against the wall or deep in a small vessel: no flow past it — the pressure damps or turns ventricular.' },
        ]} />

      <div className="cs-media-row">
        <Video id="VICGjOZzWyY" title="Transradial access for coronary angiography and interventions" />
        <Video id="XMg0vHj15hs" title="Right coronary engagement, damping and ventricularisation" channel="Elias Hanna, University of Iowa" />
      </div>
    </>
  );
}

/* ============================================================
   4 · ANGIOGRAPHY & VIEWS
   ============================================================ */

function Diagnostic() {
  const { answers, answer, bump } = useCase();
  const cath = answers['s4-cath'] || 'aortic';
  const coax = cath === 'coax';
  const runs = answers['s4-runs'] || [];
  const onCine = (v) => {
    const preset = VIEWS.find(p => p.lao === Math.round(v.lao) && p.cra === Math.round(v.cra));
    const key = preset?.id || `${Math.round(v.lao)}:${Math.round(v.cra)}`;
    if (!runs.includes(key)) answer('s4-runs', [...runs, key]);
  };
  const left = runs.filter(r => VIEWS.find(v => v.id === r)?.system === 'left').length;
  const right = runs.filter(r => VIEWS.find(v => v.id === r)?.system === 'right').length;
  const enough = left >= 2 && right >= 3;
  const mode = cath === 'engaged' ? 'ventricular' : 'aortic';
  return (
    <>
      <p className="cs-p">The left system first, with a 5F diagnostic catheter, then the right. Before every injection, one glance: <b>the pressure at the catheter tip</b>.</p>
      <div className="cs-h2" style={{ marginTop: 10 }}>A · Engaging the RCA</div>
      <CatheterPressure mode={mode} note={cath === 'aortic' ? 'Tip in the aortic root. Rotate clockwise to drop into the right cusp and engage.' : cath === 'engaged' ? 'The tip has dropped into the RCA ostium. Look at the trace before you touch the syringe.' : 'Coaxial in the ostium; the aortic waveform is back. Safe to inject.'} />
      <div className="cs-row" style={{ marginBottom: 12 }}>
        <button className="cs-btn" disabled={cath !== 'aortic'} onClick={() => { answer('s4-cath', 'engaged'); bump({ fluoro: 20, kerma: 4 }); }}>Rotate clockwise & engage the RCA</button>
        <button className="cs-btn primary" disabled={cath !== 'engaged' || !answers['s4-damp']} onClick={() => { answer('s4-cath', 'coax'); bump({ fluoro: 15, kerma: 3 }); }}>Withdraw 2 mm & re-engage coaxially</button>
      </div>
      {cath !== 'aortic' && (
        <Decision id="s4-damp" question="The trace has changed like this the moment the tip entered the ostium. What do you do?"
          options={[
            { id: 'pull', label: 'Do not inject. Withdraw slightly until the aortic waveform returns, then re-engage coaxially (or use a catheter with side holes)', verdict: 'best', points: 10,
              why: 'Ventricularisation means the tip is wedged and nothing flows past it. Contrast injected now has nowhere to go but into the wall (dissection) or the whole territory at once (VF).' },
            { id: 'puff', label: 'A small test puff to see what is wrong', verdict: 'wrong', points: 0, why: 'A “small” puff into a wedged tip is exactly how ostial dissections and VF start.' },
            { id: 'slow', label: 'Inject, but slowly', verdict: 'ok', points: 2, why: 'Slower is less dangerous than fast, but the problem is the position — fix it first.' },
            { id: 'gtn', label: 'Give intracoronary nitrate for spasm', verdict: 'wrong', points: 1, why: 'Still an injection into a wedged catheter. Spasm can cause damping — you treat it after you have disengaged.' },
          ]} />
      )}
      <Contrast title="damped vs ventricularised"
        is={{ h: 'Damped', points: [
          'Systolic falls, the pulse pressure narrows, the dicrotic notch blurs.',
          'The tip is against a wall, kinked, or partly in an ostial stenosis.',
          'Meaning: flow past the tip is reduced.',
        ] }}
        isnt={{ h: 'Ventricularised', points: [
          'Diastolic drops toward zero and rises through diastole — the shape of an LV trace.',
          'The tip is wedged: an ostial lesion, a small vessel, or a conus branch.',
          'Meaning: flow beyond the tip has stopped. Never inject.',
        ] }} />

      <div className="cs-h2">B · Acquire the series</div>
      {!coax && <Note kind="warn" title="Not yet">Re-establish an aortic waveform before the first RCA run.</Note>}
      <p className="cs-p">At least two views of the left system and three of the right. Watch what the mid RCA does as the projection changes.</p>
      <Angio tree={TREE} presets={VIEWS} system="left" onCine={onCine} height={420} startView="rao-cau" systems={coax ? ['left', 'right'] : ['left']} />
      <div className="cs-row" style={{ margin: '4px 0 14px' }}>
        {VIEWS.map(v => <span key={v.id} className={'cs-chip' + (runs.includes(v.id) ? ' done' : '')}>{runs.includes(v.id) ? '✓ ' : ''}{v.system === 'right' ? 'RCA · ' : ''}{v.short}</span>)}
      </div>
      <p className="cs-pts">Left system views: {left} · Right system views: {right}{enough ? ' — series complete.' : ''}</p>

      {enough && (
        <div className="cs-card" style={{ borderColor: 'var(--accent2)' }}>
          <div className="cs-h2" style={{ marginTop: 0 }}>Angiographic findings</div>
          <ul className="cs-ul">
            <li className="cs-li"><b>RCA</b>: large, dominant. Mid-segment eccentric stenosis, ~18 mm long: <b>≈ 45–50% in LAO 35, ≈ 85% in RAO 30</b>. Smooth, no thrombus. Conus and SA nodal branches arise proximally.</li>
            <li className="cs-li"><b>LAD</b>: mild 30% mid. <b>LCx</b>: normal. LM normal.</li>
          </ul>
        </div>
      )}

      <Decision id="s4-sev" question="LAO 35 says 50%. RAO 30 says 85%. Which do you believe?"
        options={[
          { id: 'worst', label: 'The view where the plaque is in profile — 85% — and then confirm it physiologically', verdict: 'best', points: 10,
            why: 'An eccentric plaque narrows the lumen in one direction. Seen face-on, the contrast column looks wide; seen edge-on, it is tight. Judge severity in the least foreshortened view showing the worst narrowing — then measure.' },
          { id: 'avg', label: 'Average them: about 65–70%', verdict: 'wrong', points: 0, why: 'An average of two projections is not a measurement of anything.' },
          { id: 'lao', label: 'LAO 35 — it is the standard RCA view', verdict: 'wrong', points: 0, why: 'Standard does not mean truthful. This is the view that hides her lesion.' },
        ]} />
      <Why title="Why the same plaque looks mild in one view and severe in another"
        chain={[
          { k: 'SHADOW', t: 'An angiogram measures the width of a contrast shadow, in one plane only.' },
          { k: 'ECCENTRIC', t: 'Her plaque grows from one side of the wall: the lumen is a crescent, not a circle.' },
          { k: 'FACE-ON', t: 'Looking at the plaque face-on, you see the crescent’s full width — it looks generous.' },
          { k: 'IN PROFILE', t: 'Turn 90° and you look across its narrowest diameter — the real stenosis.' },
        ]}>
        Try it above: LAO 35, then RAO 30. Same artery, same second. Two different patients.
      </Why>

      <Decision id="s4-node" question="In her, which artery supplies the AV node — and why does it matter today?"
        options={[
          { id: 'rca', label: 'The dominant RCA, from the crux — so RCA ischaemia can cause heart block and bradycardia', verdict: 'best', points: 10,
            why: 'Dominance is defined by which artery gives the PDA; the AV nodal artery comes off at the crux in ~80–90% of people. Her SA nodal artery also comes from the proximal RCA.' },
          { id: 'lcx', label: 'The circumflex', verdict: 'wrong', points: 0, why: 'Only in left-dominant systems.' },
          { id: 'lad', label: 'The LAD septals', verdict: 'wrong', points: 2, why: 'The septals supply the bundle branches, not the AV node.' },
        ]} />

      <div className="cs-media-row">
        <Figure src={WIKI('Coronary_Angiography.png')} href={WIKIPAGE('Coronary_Angiography.png')} alt="Diagram of coronary angiography" caption="Coronary angiography: a catheter from the wrist or groin to the coronary ostium, contrast injected under X-ray." credit="BruceBlaus, CC BY-SA 4.0, Wikimedia Commons" />
        <Video id="sT1tIOiT3Lc" title="Right coronary artery angiogram views & dominance" />
      </div>
      <Video id="TV7kFulrCNg" title="Damping and ventricularisation — and how to handle them" />
    </>
  );
}

/* ============================================================
   5 · PHYSIOLOGY & IMAGING
   ============================================================ */

const RCA_PHYS = { rest: 0.86, ifr: 0.84, ffr: 0.71 };

function Assessment() {
  const { answer, answers } = useCase();
  const read = answers['s5-reads'] || {};
  const pre = useMemo(() => ivusProfile('pre'), []);
  return (
    <>
      <div className="cs-h2" style={{ marginTop: 0 }}>A · Pressure wire across the mid RCA</div>
      <p className="cs-p">Through the 6F JR4 guide — coaxial, aortic waveform. Equalise, cross, measure at rest, then hyperaemia.</p>
      <PressureWire lesion={RCA_PHYS} onReading={v => answer('s5-reads', { ...read, ...v })} />
      <Decision id="s5-sig" question={`iFR ${RCA_PHYS.ifr.toFixed(2)}, FFR ${RCA_PHYS.ffr.toFixed(2)}. Your conclusion?`}
        options={[
          { id: 'sig', label: 'Flow-limiting: it explains her angina and her inferior ischaemia — treat it', verdict: 'best', points: 10,
            why: 'Both indices are below their thresholds (iFR ≤ 0.89, FFR ≤ 0.80), and they match the territory on stress echo. Anatomy, physiology and symptoms agree.' },
          { id: 'defer', label: 'Borderline — defer and up-titrate drugs', verdict: 'wrong', points: 0, why: '0.71 is not borderline.' },
          { id: 'ivus', label: 'Repeat with IVUS before deciding', verdict: 'ok', points: 3, why: 'IVUS helps you treat it, not decide whether to.' },
        ]} />

      <div className="cs-h2">B · The pullback: focal or diffuse?</div>
      <PullbackCurve />
      <Decision id="s5-pullback" question="Her pullback shows one sharp step at the plaque. What does that predict?"
        options={[
          { id: 'focal', label: 'Focal disease: stenting this segment should restore near-normal pressure and relieve her angina', verdict: 'best', points: 10,
            why: 'When the pressure loss sits in one place, fixing that place fixes the vessel. Pullback patterns predict the post-PCI FFR and symptom relief.' },
          { id: 'diffuse', label: 'Diffuse disease: a long stent is needed', verdict: 'wrong', points: 0, why: 'That is the other curve.' },
          { id: 'none', label: 'Nothing — pullbacks are only for research', verdict: 'wrong', points: 0, why: 'They are a routine part of planning physiology-guided PCI.' },
        ]} />
      <Contrast title="focal vs diffuse disease"
        is={{ h: 'Focal — one step', points: [
          'The pressure drops across a short segment.',
          'A short stent fixes the physiology.',
          'Expect excellent symptom relief.',
        ] }}
        isnt={{ h: 'Diffuse — a long slope', points: [
          'Pressure leaks away along the whole artery.',
          'Stents fix a fraction; residual ischaemia and angina are common.',
          'Think medical therapy, or surgery for diffuse multivessel disease.',
        ] }} />

      <div className="cs-h2">C · IVUS before treatment</div>
      <IVUS profile={pre} length={60} marks={IVUS_MARKS.pre} title="RCA · pre-intervention pullback" proxLabel="proximal (ostium)" />
      <Table head={['Landmark', 'Lumen', 'EEM', 'Plaque burden']} rows={[
        ['Distal reference (10 mm)', N('7.1 mm² · Ø 3.0'), N('10.2 mm² · Ø 3.6'), N('30%')],
        ['MLA (30 mm)', N('2.3 mm²', 'cs-hi'), N('11.4 mm²'), N('80%', 'cs-hi')],
        ['Proximal reference (49 mm)', N('9.1 mm² · Ø 3.4'), N('12.6 mm² · Ø 4.0'), N('28%')],
        ['Lesion length, normal to normal', N('18 mm'), '', ''],
      ]} />
      <MultiSelect id="s5-ivus" question="What does IVUS show about this plaque?"
        items={[
          { id: 'soft', label: 'Soft, fibrofatty plaque', correct: true, why: 'Echolucent to intermediate, no bright reflectors.' },
          { id: 'ecc', label: 'Eccentric — thick on one side, thin on the other', correct: true, why: 'The reason the angiogram changed with the view.' },
          { id: 'noca', label: 'No calcium: no dedicated calcium modification is needed', correct: true, why: 'Plan for the lesion you have.' },
          { id: 'att', label: 'Attenuated plaque — a large lipid pool with deep shadowing', correct: false, why: 'Not here. Attenuated plaque predicts distal embolisation and no-reflow.' },
          { id: 'thr', label: 'Thrombus', correct: false, why: 'Stable disease; none seen.' },
        ]} />
      <div className="cs-grid2">
        <Decision id="s5-dia" question="Stent diameter?"
          options={[
            { id: '35', label: '3.5 mm', verdict: 'best', points: 10, why: 'Distal EEM Ø 3.6 rounded down; distal lumen 3.0 rounded up by 0.25–0.5. Both say 3.5.' },
            { id: '30', label: '3.0 mm', verdict: 'ok', points: 4, why: 'Lumen-sized without the round-up — undersized for this vessel.' },
            { id: '40', label: '4.0 mm', verdict: 'wrong', points: 0, why: 'Proximal-vessel size; overstretches the distal landing zone.' },
          ]} />
        <Decision id="s5-len" question="Stent length?"
          options={[
            { id: '22', label: '22 mm', verdict: 'best', points: 10, why: 'Covers 18 mm normal-to-normal with ~2 mm landing each side.' },
            { id: '15', label: '15 mm', verdict: 'wrong', points: 0, why: 'Geographic miss: leaves plaque at an edge.' },
            { id: '30', label: '30 mm', verdict: 'ok', points: 4, why: 'Covers it, with more metal than needed.' },
          ]} />
      </div>

      <div className="cs-media-row">
        <Video id="kml6OuZaMX8" title="What is FFR or iFR? How does it work?" />
        <Video id="UC3NokObF88" title="IVUS basics — School of Rock, part 3" />
      </div>
    </>
  );
}

/* ============================================================
   6 · STRATEGY
   ============================================================ */

function Strategy() {
  return (
    <>
      <p className="cs-p">Single-vessel disease. A focal, flow-limiting, soft, eccentric mid-RCA plaque; vessel 3.5 mm. Angina CCS III on three drugs. She has consented to PCI in this sitting.</p>
      <Decision id="s6-go" question="What now?"
        options={[
          { id: 'pci', label: 'Ad hoc PCI to the mid RCA now', verdict: 'best', points: 10, why: 'Indication (refractory angina), physiology (FFR 0.71, focal) and consent are all in place. One sitting, one puncture.' },
          { id: 'omt', label: 'Stop, and continue medical therapy alone', verdict: 'ok', points: 4, why: 'Legitimate in stable disease — ISCHEMIA says she is not at higher risk of death for choosing it — but she has refractory symptoms and has chosen PCI.' },
          { id: 'cabg', label: 'Refer for CABG', verdict: 'wrong', points: 1, why: 'Single-vessel RCA disease suited to PCI.' },
          { id: 'both', label: 'Stent the RCA and the 30% LAD', verdict: 'wrong', points: 0, why: 'A 30% LAD plaque is treated with a statin, not a stent.' },
        ]} />
      <Decision id="s6-prep" question="Lesion preparation?"
        options={[
          { id: 'pre', label: 'Predilate with a 3.0 mm semi-compliant balloon, then a drug-eluting stent', verdict: 'best', points: 10, why: 'Confirms the lesion opens, eases stent delivery and ensures full expansion.' },
          { id: 'direct', label: 'Direct stenting', verdict: 'ok', points: 7, why: 'Reasonable for soft, focal plaque with good guide support — less contrast and time; risk is failure to cross.' },
          { id: 'dcb', label: 'Drug-coated balloon alone', verdict: 'ok', points: 3, why: 'An option for in-stent restenosis and small vessels; a 3.5 mm de novo RCA is DES territory.' },
          { id: 'poba', label: 'Plain balloon angioplasty alone', verdict: 'wrong', points: 0, why: 'Recoil and restenosis.' },
        ]} />
      <Contrast title="semi-compliant vs non-compliant balloons"
        is={{ h: 'Semi-compliant', points: [
          'Grows noticeably with pressure (≈ 0.3–0.4 mm from nominal to burst).',
          'Soft, flexible, crosses tight lesions — for predilation.',
          'At high pressure it dog-bones into healthy vessel at the ends.',
        ] }}
        isnt={{ h: 'Non-compliant', points: [
          'Barely grows past nominal — the diameter you choose is the diameter you get.',
          'Takes 20+ atm: for post-dilation and resistant lesions.',
          'Stiffer and bulkier to deliver.',
        ] }} />
      <Why title="Why drug-eluting stents — and why that means months of two antiplatelets"
        chain={[
          { k: 'INJURY', t: 'A stent stretches and tears the wall; smooth-muscle cells migrate and multiply over the struts.' },
          { k: 'RESTENOSIS', t: 'A bare-metal stent can fill with this scar within months.' },
          { k: 'THE DRUG', t: 'A limus drug blocks mTOR and stops that proliferation — restenosis falls dramatically.' },
          { k: 'THE PRICE', t: 'It also slows the endothelium growing over the struts. Bare metal in blood is a platelet magnet — so DAPT until the struts are covered.' },
        ]} />
    </>
  );
}

/* ============================================================
   7 · INTERVENTION
   ============================================================ */

const SC_30 = [[4, 2.65], [6, 2.85], [8, 3.0], [10, 3.12], [12, 3.24], [14, 3.35], [16, 3.45]];
const DES_35 = [[8, 3.28], [10, 3.42], [11, 3.5], [12, 3.55], [14, 3.64], [16, 3.73], [18, 3.8]];
const NC_375 = [[8, 3.6], [10, 3.67], [12, 3.75], [14, 3.81], [16, 3.87], [18, 3.92], [20, 3.96]];

function devicesFor(step, extra = {}) {
  const d = { wires: [], label: 'PCI · JR4 6F' };
  if (step >= 1) d.wires = [{ vessel: 'RCA', to: 0.95 }];
  if (extra.balloon) d.balloon = extra.balloon;
  if (step >= 2) d.lesions = { RCA: [{ ...RCA_LESION, sev: 0.4, ecc: 0.4, dir: [0.87, 0, 0.5] }] };
  if (step >= 4) { d.stents = [{ vessel: 'RCA', t0: STENT.t0, t1: STENT.t1, d: 3.5 }]; d.lesions = { RCA: [] }; }
  return d;
}

function Intervention() {
  const { answers, answer, bump, atLeastClock } = useCase();
  const step = answers['s7'] ?? 0;
  const [balloon, setBalloon] = useState(null);
  const devices = devicesFor(step, { balloon });
  useEffect(() => { atLeastClock(min(9, 24) + step * 4); }, [step]);  // eslint-disable-line
  const between = (v, a, b) => v != null && v >= a && v <= b;
  return (
    <>
      <div className="cs-sticky">
        <Angio tree={TREE} presets={RIGHT} system="right" systems={['right']} devices={devices} height={300} startView="rao-r" />
      </div>
      <Steps id="s7">
        <Step title="Engage the guide and wire the RCA">
          {({ done }) => (
            <>
              <Decision id="s7-wire" question="Coronary wire?"
                options={[
                  { id: 'work', label: 'A workhorse, non-polymer-jacketed 0.014″ wire', verdict: 'best', points: 10, why: 'Steerable, safe, and it tells you through your fingers when it meets resistance.' },
                  { id: 'poly', label: 'A polymer-jacketed hydrophilic wire', verdict: 'ok', points: 4, why: 'Slides into side branches and subintimal spaces silently. Not needed for a patent, soft lesion.' },
                  { id: 'cto', label: 'A stiff CTO wire', verdict: 'wrong', points: 0, why: 'A penetration wire in a patent vessel.' },
                ]} />
              {answers['s7-wire'] && step === 0 && <button className="cs-btn primary" onClick={() => { bump({ fluoro: 60, kerma: 15, contrast: 4 }); done(); }}>Wire in the distal RCA — next</button>}
            </>
          )}
        </Step>

        <Step title="Predilate with a 3.0 × 15 mm semi-compliant balloon">
          {({ done }) => (
            <>
              <p className="cs-p">Watch the compliance chart as you inflate: a semi-compliant balloon keeps growing as the pressure rises.</p>
              <Inflator label="SC 3.0 × 15 mm (nominal 8, RBP 14 atm)" compliance={SC_30} nominal={8} rbp={14}
                onDeflate={(peak) => { answer('s7-predil', peak); setBalloon(null); bump({ fluoro: 30, kerma: 8, contrast: 5 }); }} />
              {answers['s7-predil'] != null && (
                <div className={'cs-fb ' + (between(answers['s7-predil'], 8, 12) ? 'best' : answers['s7-predil'] > 14 ? 'wrong' : 'ok')}>
                  Peak {answers['s7-predil'].toFixed(1)} atm. {between(answers['s7-predil'], 8, 12)
                    ? 'Full expansion with no waist — soft plaque yields at modest pressure.'
                    : answers['s7-predil'] > 14 ? 'Above rated burst — and a semi-compliant balloon this high is already oversized for the distal vessel.'
                    : 'Below nominal: not enough to prove the lesion opens.'}
                </div>
              )}
              <ScoreOnce id="s7-predil" pts={answers['s7-predil'] == null ? null : between(answers['s7-predil'], 8, 12) ? 10 : answers['s7-predil'] > 14 ? 2 : 5} max={10} />
              {answers['s7-predil'] != null && step === 1 && <button className="cs-btn primary" style={{ marginTop: 10 }} onClick={done}>Next — deliver the stent</button>}
            </>
          )}
        </Step>

        <Step title="Deliver the stent">
          {({ done }) => (
            <>
              <p className="cs-p">The 3.5 × 22 mm DES will not pass the proximal bend. As you push, the JR4 backs out of the ostium into the aorta.</p>
              <Decision id="s7-support" question="How do you get the stent down?"
                options={[
                  { id: 'gex', label: 'A guide extension catheter through the JR4, advanced into the proximal RCA', verdict: 'best', points: 10,
                    why: 'A mother-in-child catheter adds support and a smooth channel past the bend, without forcing the guide itself deeper.' },
                  { id: 'buddy', label: 'A second, buddy wire to straighten the bend', verdict: 'ok', points: 6, why: 'Often enough, and cheap — a reasonable first move.' },
                  { id: 'deep', label: 'Deep-seat the JR4 by pushing and rotating it into the RCA', verdict: 'wrong', points: 2,
                    why: 'Deep intubation of a guide not designed for it is how ostial dissections happen. If you need deep support, use a device built for it.' },
                  { id: 'push', label: 'Push the stent harder', verdict: 'wrong', points: 0, why: 'Stent loss, guide prolapse, or stripping the stent off its balloon.' },
                ]} />
              {answers['s7-support'] && (
                <>
                  <Note kind="pearl" title="What the team does">A 6F guide extension goes over the wire into the proximal RCA; the stent tracks through it to the lesion. Remember: removing the extension later can drag the mother guide forward into the ostium.</Note>
                  {step === 2 && <button className="cs-btn primary" onClick={() => { bump({ fluoro: 45, kerma: 12, contrast: 4 }); done(); }}>Stent across the lesion — next</button>}
                </>
              )}
            </>
          )}
        </Step>

        <Step title="Deploy the 3.5 × 22 mm drug-eluting stent">
          {({ done }) => (
            <>
              <Inflator label="DES 3.5 × 22 mm (nominal 11, RBP 16 atm)" compliance={DES_35} nominal={11} rbp={16}
                onDeflate={(peak) => { answer('s7-deploy', peak); bump({ fluoro: 30, kerma: 9, contrast: 6 }); }} />
              {answers['s7-deploy'] != null && (
                <div className={'cs-fb ' + (between(answers['s7-deploy'], 12, 16) ? 'best' : answers['s7-deploy'] >= 10 && answers['s7-deploy'] < 12 ? 'ok' : 'wrong')}>
                  Deployed at {answers['s7-deploy'].toFixed(1)} atm. {between(answers['s7-deploy'], 12, 16) ? 'Near-nominal diameter, struts against the wall.'
                    : answers['s7-deploy'] > 16 ? 'Above the stent balloon’s rated burst pressure: high pressure belongs to an NC balloon.' : 'Low — expect to post-dilate.'}
                </div>
              )}
              <ScoreOnce id="s7-deploy" pts={answers['s7-deploy'] == null ? null : between(answers['s7-deploy'], 12, 16) ? 10 : answers['s7-deploy'] >= 10 && answers['s7-deploy'] < 12 ? 6 : 0} max={10} />
              {answers['s7-deploy'] != null && step === 3 && <button className="cs-btn primary" style={{ marginTop: 10 }} onClick={done}>Stent deployed — next</button>}
            </>
          )}
        </Step>

        <Step title="Post-dilate with a 3.75 × 12 mm non-compliant balloon">
          {({ done }) => (
            <>
              <Decision id="s7-postpos" question="Where does the NC balloon go?"
                options={[
                  { id: 'in', label: 'Entirely inside the stent, markers short of both edges', verdict: 'best', points: 10, why: 'High pressure inside the metal only; the unstented edges never see it.' },
                  { id: 'edge', label: 'Across the distal edge, to tidy it', verdict: 'wrong', points: 0, why: 'High pressure on unstented vessel: edge dissection.' },
                ]} />
              {answers['s7-postpos'] && (
                <Inflator label="NC 3.75 × 12 mm (nominal 12, RBP 20 atm)" compliance={NC_375} nominal={12} rbp={20}
                  onDeflate={() => { answer('s7-postdone', true); bump({ fluoro: 25, kerma: 7, contrast: 5 }); }} />
              )}
              {answers['s7-postdone'] && step === 4 && <button className="cs-btn primary" style={{ marginTop: 10 }} onClick={done}>Post-dilation done — next</button>}
            </>
          )}
        </Step>

        <Step title="Withdraw the guide extension">
          {({ done }) => (
            <>
              <Decision id="s7-gexout" question="As the guide extension comes back, what do you watch?"
                options={[
                  { id: 'guide', label: 'The guide tip on fluoroscopy and the pressure trace — withdrawing the extension can pull the guide deep into the ostium', verdict: 'best', points: 10,
                    why: 'The extension and the mother guide are coupled by friction. Pull one, the other comes forward. Keep slight back-tension on the guide.' },
                  { id: 'stent', label: 'Nothing in particular — the stent is in', verdict: 'wrong', points: 0, why: 'Most catheter-induced ostial dissections happen at moments like this, when the work feels done.' },
                ]} />
              {answers['s7-gexout'] && step === 5 && <button className="cs-btn primary" onClick={() => { bump({ fluoro: 10 }); done(); }}>Procedure steps complete</button>}
            </>
          )}
        </Step>
      </Steps>

      <div className="cs-media-row" style={{ marginTop: 16 }}>
        <Video id="mXXXSwW--BA" title="Manual of PCI — guide catheter extensions" channel="Manual of PCI" />
        <Figure src={WIKI('Blausen_0034_Angioplasty_Stent_01.png')} href={WIKIPAGE('Blausen_0034_Angioplasty_Stent_01.png')} alt="Balloon-expandable coronary stent" caption="A balloon-expandable stent: the balloon drives the struts into the wall; the stent holds the result." credit="Blausen Medical, CC BY 3.0, Wikimedia Commons" />
      </div>
    </>
  );
}

/* ============================================================
   8 · RESULT ASSESSMENT
   ============================================================ */

function Result() {
  const { answers } = useCase();
  const post = useMemo(() => ivusProfile('stent'), []);
  return (
    <>
      <Angio tree={TREE} presets={RIGHT} system="right" systems={['right']} height={300} startView="rao-r"
        devices={{ wires: [{ vessel: 'RCA', to: 0.95 }], stents: [{ vessel: 'RCA', t0: STENT.t0, t1: STENT.t1, d: 3.5 }], lesions: { RCA: [] }, label: 'final' }}
        caption="Final angiography: TIMI 3 flow, no residual narrowing in any view, no visible edge problem." />
      <IVUS profile={post} length={60} marks={IVUS_MARKS.post} title="RCA · after DES + NC post-dilation" proxLabel="proximal (ostium)" />
      <Table head={['Measure', 'Result', 'Target']} rows={[
        ['Minimal stent area', N('7.0 mm²'), N('> 5.5 mm²')],
        ['Expansion vs distal reference lumen', N('99%'), N('> 90%')],
        ['Apposition', N('complete'), N('complete')],
        ['Distal edge', N('flap ~50°, 2 mm, plaque only', 'cs-lo'), N('no dissection > 60°, > 3 mm or into media')],
      ]} />
      <Decision id="s8-edge" question="What do you do about the distal edge flap?"
        options={[
          { id: 'leave', label: 'Leave it: small, superficial, not flow-limiting — it will heal', verdict: 'best', points: 10,
            why: 'Minor edge dissections confined to plaque, under 60° and 3 mm, with normal flow, do not change outcomes. Treating them adds metal and moves the edge problem further down.' },
          { id: 'stent', label: 'A second stent over the distal edge', verdict: 'wrong', points: 2, why: 'More metal for a problem that does not need solving.' },
          { id: 'balloon', label: 'A prolonged balloon inflation over it', verdict: 'wrong', points: 1, why: 'Unnecessary, and inflation outside the stent can extend it.' },
        ]} />
      <Contrast title="an edge dissection that matters vs one that doesn’t"
        is={{ h: 'Leave it', points: ['Confined to plaque; media intact.', 'Arc < 60°, length < 3 mm.', 'Normal flow, no symptoms, no ECG change.'] }}
        isnt={{ h: 'Treat it', points: ['Into the media or beyond.', 'Arc > 60°, length > 3 mm, or lumen compromised.', 'Slow flow, pain, or ST change.'] }} />

      <div className="cs-h2">The last run</div>
      <p className="cs-p">The fellow reaches for the manifold for a final orthogonal run. You glance at the trace:</p>
      <CatheterPressure mode="damped" />
      <Decision id="s8-final" question="The guide has slipped forward as the extension came out, and the pressure has damped. What do you say?"
        options={[
          { id: 'stop', label: '“Stop — don’t inject.” Disengage until the aortic waveform is back, then inject gently', verdict: 'best', points: 10,
            why: 'Never inject into a damped or ventricularised trace. The pressure is the only warning you get.' },
          { id: 'small', label: '“A small, gentle puff is fine.”', verdict: 'wrong', points: 0, why: 'The size of the puff is not what dissects; the position of the tip is.' },
          { id: 'flush', label: '“A firm flush will clear the damping.”', verdict: 'wrong', points: 0, why: 'A firm flush into a wedged tip is the mechanism of the injury you are about to see.' },
        ]} />
      {answers['s8-final'] && (
        <Note kind="warn" title="09:52">{answers['s8-final'] === 'stop'
          ? 'You say it — but the plunger is already moving. The run is on the screen. Continue to the next stage.'
          : 'The plunger goes down. The run is on the screen. Continue to the next stage.'}</Note>
      )}
      <Video id="K9whm-jZd0U" title="Role of intravascular ultrasound (IVUS) in coronary stenting" />
    </>
  );
}

/* ============================================================
   9 · OSTIAL DISSECTION
   ============================================================ */

function Complication() {
  const { answers, answer, setVitals, bump, advanceClock } = useCase();
  const acted = !!answers['s9-atropine'];
  const sealed = !!answers['s9-stent'];
  const startedAt = useRef(performance.now());
  const [elapsed, setElapsed] = useState(0);
  const dissect = useMemo(() => ivusProfile('dissect'), []);
  const fixed = useMemo(() => ivusProfile('sealed'), []);

  useEffect(() => {
    const id = setInterval(() => {
      const s = Math.round((performance.now() - startedAt.current) / 1000);
      setElapsed(s);
      if (!acted && !sealed) setVitals({ sys: Math.max(62, 80 - s * 0.8), dia: Math.max(36, 46 - s * 0.4), hr: Math.max(32, 40 - s * 0.2) });
    }, 1000);
    return () => clearInterval(id);
  }, [acted, sealed]);   // eslint-disable-line

  const devices = {
    wires: [{ vessel: 'RCA', to: 0.95 }],
    stents: [{ vessel: 'RCA', t0: STENT.t0, t1: STENT.t1, d: 3.5 }, ...(sealed ? [{ vessel: 'RCA', t0: 0, t1: OSTIAL.t1 + 0.02, d: 4.0 }] : [])],
    lesions: { RCA: sealed ? [] : [{ t0: 0.0, t1: 0.1, sev: 0.55, shape: k => Math.sin(Math.min(1, k * 1.3) * Math.PI / 2) }] },
    dissection: { vessel: 'RCA', t0: OSTIAL.t0, t1: OSTIAL.t1, aortic: 0.6, sealed },
    label: sealed ? 'after ostial stent' : 'final run',
  };
  const ST = sealed ? {} : { II: 2.2, III: 3, aVF: 2.6, I: -1, aVL: -1.6, V1: 1, V2: -0.5 };

  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>09:52</span>
          “It’s back — but worse. Heavy.” She is grey and sweating. The monitor slows; the arterial line sags. The run is on the screen and the contrast has not cleared from the ostium.
          {!acted && !sealed && <b className="cs-alarm" style={{ marginLeft: 8 }}>{elapsed}s</b>}
        </p>
      </div>
      <BedsideMonitor />
      <Angio tree={TREE} presets={RIGHT} system="right" systems={['right']} devices={devices} height={320} startView="lao-cra-r" autoCine />
      <ECG12 rate={sealed ? 72 : acted ? 58 : 38} st={ST}
        caption={sealed ? 'After the ostial stent: ST segments back to baseline.' : 'Inferior ST elevation (III > II), reciprocal depression in I and aVL, ST elevation in V1 (RV involvement), sinus bradycardia.'} />

      <Decision id="s9-what" question="What has happened?"
        options={[
          { id: 'diss', label: 'Catheter-induced dissection of the RCA ostium, with contrast staining back into the right coronary cusp', verdict: 'best', points: 10,
            why: 'A wedged guide, an injection, then a stain at the ostium that persists after washout, a flap, a compressed true lumen and inferior ischaemia.' },
          { id: 'spasm', label: 'Catheter-induced spasm', verdict: 'wrong', points: 2, why: 'Spasm is smooth, leaves no stain and melts with nitrate.' },
          { id: 'air', label: 'Air embolism', verdict: 'wrong', points: 1, why: 'Air is a moving lucency that clears in seconds — it leaves no contrast behind.' },
          { id: 'st', label: 'Acute stent thrombosis', verdict: 'wrong', points: 0, why: 'The stent fills; the problem is upstream, at the ostium.' },
        ]} />
      <Contrast title="dissection vs spasm"
        is={{ h: 'Dissection', points: ['Contrast stain that hangs on after washout.', 'A linear lucent flap; a spiral course.', 'Follows a mechanical insult: wedged tip, injection, device.', 'Treated by sealing the entry — usually with a stent.'] }}
        isnt={{ h: 'Spasm', points: ['Smooth, tapered narrowing; no stain, no flap.', 'Often at the catheter tip in a reactive vessel.', 'Resolves with intracoronary nitrate and disengaging.', 'Stenting spasm is a mistake.'] }} />

      <Decision id="s9-dunning" question="The stain is confined to the right coronary cusp. Dunning class?"
        options={[
          { id: '1', label: 'Class I — limited to the coronary cusp', verdict: 'best', points: 10, why: 'Class I: cusp only. Class II: up the ascending aorta < 40 mm. Class III: > 40 mm.' },
          { id: '2', label: 'Class II', verdict: 'wrong', points: 0, why: 'It has not climbed the ascending aorta.' },
          { id: '3', label: 'Class III — surgery', verdict: 'wrong', points: 0, why: 'Class III extends more than 40 mm up the aorta; surgery is then considered.' },
        ]} />

      <MultiSelect id="s9-now" question="In the next minute, what do you do?"
        items={[
          { id: 'wire', label: 'Keep the wire exactly where it is, in the distal true lumen', correct: true, why: 'Your wire went down before the dissection: it is in the true lumen. Lose it and you may never find the true lumen again.' },
          { id: 'atropine', label: 'Atropine 0.6 mg IV, repeat to effect', correct: true, why: 'Vagal bradycardia from inferior ischaemia (and possible nodal ischaemia).' },
          { id: 'fluid', label: 'A fluid bolus', correct: true, why: 'RV ischaemia makes her preload-dependent.' },
          { id: 'help', label: 'Call for help; pacing wire and vasopressor ready', correct: true, why: 'If atropine fails, pace. Hold the pressure while you fix the artery.' },
          { id: 'noinj', label: 'No more forceful injections — small, gentle puffs only, guide disengaged', correct: true, why: 'Every injection pressurises the false lumen and drives the tear.' },
          { id: 'pull', label: 'Pull everything back and re-engage for a cleaner picture', correct: false, why: 'Re-wiring a dissected ostium risks the false lumen.' },
          { id: 'gtn', label: 'Intracoronary nitrate for presumed spasm', correct: false, why: 'Not spasm — and nitrate with RV ischaemia and a BP of 70 will drop her further.' },
          { id: 'prot', label: 'Protamine', correct: false, why: 'Nothing is bleeding into the pericardium; reversal with a wire and a new stent in the vessel risks thrombosis.' },
        ]} />
      {!acted ? (
        <button className="cs-btn danger" onClick={() => { answer('s9-atropine', true); setVitals({ hr: 58, sys: 92, dia: 56 }); advanceClock(2); }}>Atropine 0.6 mg IV + 250 mL fluid</button>
      ) : (
        <div className="cs-fb ok">Heart rate 58, pressure 92/56. Buying time — the artery is still dissected.</div>
      )}

      {acted && (
        <>
          <div className="cs-h2">IVUS of the ostium — before you treat</div>
          <IVUS profile={sealed ? fixed : dissect} length={60} marks={IVUS_MARKS.ostium} title={sealed ? 'RCA · after ostial stent' : 'RCA · ostial dissection'} proxLabel="proximal (ostium)" />
          <Decision id="s9-def" question="Definitive treatment?"
            options={[
              { id: 'stent', label: 'Stent the ostium to seal the entry tear, the stent protruding 1–2 mm into the aorta', verdict: 'best', points: 10,
                why: 'Covering the entry decompresses the false lumen and stops retrograde propagation. Ostial stents must sit just proud of the ostium or the tear stays open.' },
              { id: 'balloon', label: 'Prolonged balloon inflation', verdict: 'ok', points: 3, why: 'May tack a small flap down; an ostial entry with a cusp stain needs covering.' },
              { id: 'watch', label: 'Observe — it may heal', verdict: 'wrong', points: 1, why: 'Conservative care is for small, non-flow-limiting class I tears. Hers is flow-limiting with a compressed true lumen.' },
              { id: 'surg', label: 'Emergency surgery', verdict: 'ok', points: 2, why: 'For class III, or when percutaneous sealing fails.' },
            ]} />
          <Sequence id="s9-seq" question="Put the bailout in order."
            steps={[
              { label: 'Confirm with IVUS that the wire is in the true lumen all the way', why: 'Stenting a false lumen closes the artery.' },
              { label: 'Choose a view that shows the ostium square-on (LAO cranial)', why: 'Foreshortened ostia are stented short.' },
              { label: 'Position a 4.0 mm stent with 1–2 mm protruding into the aorta', why: 'Cover the entry tear.' },
              { label: 'Deploy, then flare the ostium with a short NC balloon', why: 'Apposition at the ostium.' },
              { label: 'Gentle check injection with the guide disengaged; IVUS for coverage', why: 'No more pressurised puffs.' },
            ]} />
          {!sealed ? (
            <button className="cs-btn primary" onClick={() => { answer('s9-stent', true); setVitals({ hr: 72, sys: 118, dia: 70 }); bump({ contrast: 8, fluoro: 180, kerma: 40 }); advanceClock(12); }}>Deploy the 4.0 × 12 mm ostial stent</button>
          ) : (
            <div className="cs-fb best">Stent deployed and flared. TIMI 3 flow, the stain fading, no extension into the aorta. Pain gone; heart rate 72, pressure 118/70; ST segments back to baseline.</div>
          )}
          {sealed && <Note kind="pearl" title="Before she goes home">Image the aortic root (CT or transoesophageal echo) if there is any doubt about extension, repeat it if pain recurs, and record the event clearly for the next operator who engages this RCA.</Note>}
        </>
      )}

      <Why title="Why trouble in the RCA slows the heart and drops the pressure"
        chain={[
          { k: 'NODES', t: 'The SA nodal artery comes from the proximal RCA in ~60%; the AV nodal artery from the dominant RCA in ~80–90%.' },
          { k: 'REFLEX', t: 'Ischaemic inferior wall fires vagal afferents (Bezold–Jarisch): bradycardia plus vasodilatation.' },
          { k: 'RV', t: 'RV ischaemia: the right ventricle cannot push enough blood through the lungs to fill the left.' },
          { k: 'RESULT', t: 'Slow, empty, vasodilated — profound hypotension from a small artery problem.' },
        ]}>
        So the treatment list writes itself: atropine for the vagus, fluid for the RV, pacing if the node fails — and <b>flow</b> to end the reflex.
      </Why>
      <Video id="TV7kFulrCNg" title="Damping and ventricularisation — and how to handle them" />
    </>
  );
}

/* ============================================================
   THE VICIOUS CYCLE
   ============================================================ */

function Cycles() {
  return (
    <>
      <p className="cs-p">Three loops she lived through today. Tap each step; the green scissors are where treatment cuts in.</p>
      <ViciousCycle id="cyc-angina" title="The angina spiral — halfway up the stairs"
        nodes={[
          { short: 'Exertion', t: 'Exertion raises oxygen demand', d: 'Heart rate, blood pressure and contractility all rise.' },
          { short: 'Short diastole', t: 'Tachycardia shortens diastole', d: 'The LV is perfused in diastole only. A faster heart has less of it.' },
          { short: 'Ischaemia', t: 'The subendocardium becomes ischaemic', d: 'Supply is capped by the plaque; demand keeps climbing.' },
          { short: 'Stiff LV', t: 'The ischaemic LV relaxes poorly; filling pressure rises', d: 'Perfusion pressure of the inner wall = aortic diastolic − LVEDP. As LVEDP rises, it falls.' },
          { short: 'Pain & adrenaline', t: 'Pain triggers a sympathetic surge', d: 'More heart rate, more pressure, more demand.' },
        ]}
        breaks={[
          { at: 0, t: 'Stop: rest drops demand below the ceiling within minutes.' },
          { at: 1, t: 'Beta-blocker: slower heart, longer diastole, lower demand — first line.' },
          { at: 3, t: 'Nitrate: venodilatation lowers preload and LVEDP — the inner wall reperfuses.' },
          { at: 3, t: 'Ranolazine: blocks the late sodium current that overloads ischaemic cells with calcium and stiffens them.' },
          { at: 2, t: 'PCI: raises the ceiling itself.' },
          { at: 4, t: 'Calcium-channel blocker: lowers afterload and, if rate-limiting, heart rate.' },
        ]} />
      <Decision id="cyc-bb" question="Why is a beta-blocker first-line for her angina, ahead of a nitrate?"
        options={[
          { id: 'both', label: 'It cuts demand and lengthens diastole at the same time — two links with one drug', verdict: 'best', points: 10,
            why: 'Heart rate is the single biggest determinant of demand and of perfusion time. Slowing it attacks the loop from both sides.' },
          { id: 'dilate', label: 'It dilates the coronary arteries', verdict: 'wrong', points: 0, why: 'It does not; that is nitrates and calcium-channel blockers.' },
          { id: 'mi', label: 'It prevents myocardial infarction in stable angina', verdict: 'wrong', points: 1, why: 'Its benefit in chronic coronary syndromes without prior MI or LV dysfunction is anti-anginal.' },
        ]} />

      <ViciousCycle id="cyc-bj" title="The inferior spiral — 09:52"
        nodes={[
          { short: 'RCA flow falls', t: 'The dissected ostium throttles RCA flow', d: 'The false lumen squeezes the true lumen.' },
          { short: 'Inferior ischaemia', t: 'Inferior wall, RV and nodes become ischaemic', d: 'Including the SA and AV nodal arteries.' },
          { short: 'Vagal reflex', t: 'Bezold–Jarisch reflex fires', d: 'Bradycardia and arterial vasodilatation.' },
          { short: 'Hypotension', t: 'Pressure falls; RV output falls', d: 'A slow, under-filled heart in a dilated circulation.' },
          { short: 'Perfusion falls', t: 'Coronary perfusion pressure falls', d: 'Less pressure to push blood past the dissection — more ischaemia.' },
        ]}
        breaks={[
          { at: 0, t: 'Stent the ostium: restore flow — the definitive cut.' },
          { at: 2, t: 'Atropine blocks the vagal limb.' },
          { at: 3, t: 'Fluid fills the preload-dependent RV; a vasopressor holds the pressure.' },
          { at: 2, t: 'Temporary pacing if the node fails.' },
          { at: 3, t: 'Avoid nitrates: they remove the preload she is living on.' },
        ]} />
      <Decision id="cyc-gtn" question="Why could a nitrate — the drug that relieved her angina for months — kill her at 09:52?"
        options={[
          { id: 'preload', label: 'With RV ischaemia her output depends on preload; venodilatation empties the RV and her pressure collapses', verdict: 'best', points: 10,
            why: 'Same drug, opposite loop. In the angina spiral lowering preload helps; in the RV spiral preload is the last thing holding her up.' },
          { id: 'brady', label: 'Nitrates cause heart block', verdict: 'wrong', points: 0, why: 'Not the mechanism.' },
          { id: 'none', label: 'It would not — nitrates are always safe in ischaemia', verdict: 'wrong', points: 0, why: 'Hypotension and RV infarction are classic contraindications.' },
        ]} />

      <ViciousCycle id="cyc-diss" title="The dissection spiral — why you stop injecting"
        nodes={[
          { short: 'Entry tear', t: 'A wedged tip and an injection tear the intima', d: 'Contrast under pressure enters the wall.' },
          { short: 'False lumen fills', t: 'The false lumen pressurises and grows', d: 'It spirals down the vessel and back into the cusp.' },
          { short: 'True lumen shrinks', t: 'The true lumen is compressed', d: 'Flow falls; ischaemia begins.' },
          { short: 'More puffs', t: 'The team injects again to see what is happening', d: 'Each run pressurises the false lumen further.' },
        ]}
        breaks={[
          { at: 0, t: 'Prevent it: never inject into a damped or ventricularised trace.' },
          { at: 3, t: 'Stop forceful injections; use IVUS instead of contrast to see.' },
          { at: 1, t: 'Stent the entry: the false lumen loses its inflow and collapses.' },
          { at: 2, t: 'Keep the wire in the true lumen — the only road to the fix.' },
        ]} />
    </>
  );
}

/* ============================================================
   M&M — WAR STORIES
   ============================================================ */

function WarStories() {
  return (
    <>
      <p className="cs-p">Composite morbidity-and-mortality cases. Details changed; the mechanism, and the outcome, are the kind that happen.</p>

      <WarStory title="The puff into the wedge"
        mistake="Injecting with a ventricularised pressure trace."
        burn="The pressure never lies. Damped or ventricular: hands off the syringe until the aorta comes back.">
        <p className="cs-p">A diagnostic study through an Amplatz catheter. The trace ventricularises as the tip drops into a small RCA. “Quick test puff.” Contrast cannot run off; it fills the territory and the wall at once. VF. Defibrillated — and on the next run, a spiral dissection from ostium to crux.</p>
      </WarStory>
      <Decision id="mm-wedge" question="What should have happened the moment the trace changed?"
        options={[
          { id: 'disengage', label: 'Withdraw until the aortic waveform returns; re-engage coaxially or switch to a catheter with side holes', verdict: 'best', points: 10, why: 'Fix the position, then inject.' },
          { id: 'smaller', label: 'A smaller test puff', verdict: 'wrong', points: 0, why: 'The story’s mistake.' },
          { id: 'faster', label: 'Inject faster to finish quickly', verdict: 'wrong', points: 0, why: 'Higher pressure into a closed space.' },
        ]} />

      <WarStory title="The stent that was supposed to save his life"
        mistake="Promising that a stent for stable angina would prevent a heart attack."
        burn="In stable disease, stents treat symptoms. Pills and stopping smoking prevent the infarct.">
        <p className="cs-p">A 52-year-old with stable angina gets a technically perfect stent and is told he is “fixed”. He stops his statin (“the blockage is gone”) and keeps smoking. Two years later: an anterior STEMI from a 40% LAD plaque nobody would ever have stented.</p>
      </WarStory>

      <WarStory title="The dentist, three weeks later"
        mistake="Stopping both antiplatelet drugs three weeks after a drug-eluting stent for an elective dental extraction."
        burn="Early after a DES, never stop both antiplatelets for an elective procedure. Delay it, or do it on aspirin with local haemostasis — and ask the cardiologist first.">
        <p className="cs-p">Three weeks after an elective DES, a molar needs to come out. To be safe, aspirin and clopidogrel are stopped for a week. Day five: inferior STEMI. The struts, not yet covered by endothelium, have thrombosed.</p>
      </WarStory>
      <Decision id="mm-dental" question="What would have been safe?"
        options={[
          { id: 'continue', label: 'Do the extraction on antiplatelets with local haemostasis, or defer it — after talking to the cardiologist', verdict: 'best', points: 10,
            why: 'Most dental extractions are safe on aspirin, often on DAPT with local measures. The thrombotic risk of stopping both early dwarfs the bleeding risk of a tooth.' },
          { id: 'stopall', label: 'Stop both for a week — bleeding is the bigger risk', verdict: 'wrong', points: 0, why: 'The story’s mistake.' },
          { id: 'bridge', label: 'Stop both and bridge with heparin', verdict: 'wrong', points: 0, why: 'Heparin does not protect a stent from platelet thrombosis.' },
        ]} />

      <WarStory title="The little blue pill"
        mistake="Giving a nitrate without asking about phosphodiesterase-5 inhibitors."
        burn="Before any nitrate: sildenafil or vardenafil in 24 hours? Tadalafil in 48? Ask — every time.">
        <p className="cs-p">An elective PCI. Radial spasm; intra-arterial nitrate as routine, then intracoronary nitrate before the runs. Pressure 62/30 and falling. The patient had taken sildenafil the night before. Both drugs raise cGMP; together they open every vessel at once.</p>
      </WarStory>

      <WarStory title="The radial that went silent"
        mistake="An over-tight compression band left for four hours, and no radial pulse check before discharge."
        burn="Patent haemostasis: the least pressure that stops bleeding, with flow confirmed. Check the pulse before she goes.">
        <p className="cs-p">A smooth day-case PCI. The band is pumped up hard “to be safe” and left all afternoon. Months later the patient needs a fistula for dialysis and a repeat angiogram: the radial is occluded. Silent — no pain, no ischaemia — and permanent.</p>
      </WarStory>
    </>
  );
}

/* ============================================================
   DEBRIEF & ASSESSMENT
   ============================================================ */

function Debrief() {
  const { totals, def, metrics } = useCase();
  const pct = totals.max ? Math.round(totals.got / totals.max * 100) : 0;
  const band = pct >= 85 ? 'Distinction' : pct >= 70 ? 'Pass with merit' : pct >= 55 ? 'Pass' : 'Needs another run';
  return (
    <>
      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>The wrist</div>
          <p className="cs-p">Sheath out on the table, compression band on with patent haemostasis — the least air that keeps it dry, with the thumb pleth confirming flow. Gradual release from 60–90 minutes. Radial pulse checked before discharge.</p>
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Overnight, not same-day</div>
          <ul className="cs-ul">
            <li className="cs-li">The dissection changes the plan: observation overnight with ECG monitoring, troponin, and imaging of the aortic root if there is any doubt.</li>
            <li className="cs-li">Contrast used: <b className="cs-mono">{Math.round(metrics.contrast)} mL</b> — volume/eGFR {(metrics.contrast / 88).toFixed(1)}.</li>
            <li className="cs-li">Air kerma <b className="cs-mono">{Math.round(metrics.kerma)} mGy</b>.</li>
          </ul>
        </div>
      </div>

      <Decision id="s12-dapt" question="Antiplatelet therapy after elective PCI for a chronic coronary syndrome, no high bleeding risk?"
        options={[
          { id: '6m', label: 'Aspirin + clopidogrel for 6 months, then a single antiplatelet lifelong', verdict: 'best', points: 10, why: 'The ESC default after PCI in chronic coronary syndromes. 1–3 months if bleeding risk is high.' },
          { id: '12m', label: 'Aspirin + ticagrelor for 12 months', verdict: 'wrong', points: 0, why: 'The ACS regimen.' },
          { id: '1m', label: 'Aspirin + clopidogrel for 1 month only', verdict: 'ok', points: 4, why: 'Right for high bleeding risk — she has none.' },
          { id: 'asa', label: 'Aspirin alone from today', verdict: 'wrong', points: 0, why: 'Uncovered struts need dual therapy.' },
        ]} />
      <MultiSelect id="s12-prev" question="What does she go home with?"
        items={[
          { id: 'statin', label: 'High-intensity statin (atorvastatin 80 mg): LDL < 1.4 mmol/L and ≥ 50% reduction', correct: true, why: 'Her LDL of 2.3 on atorvastatin 40 is not at target.' },
          { id: 'rehab', label: 'Cardiac rehabilitation', correct: true, why: 'Exercise capacity, risk factors, confidence.' },
          { id: 'titrate', label: 'A plan to step down anti-anginals if she stays pain-free', correct: true, why: 'Three anti-anginals may no longer be needed; keep the beta-blocker for BP and rate.' },
          { id: 'gtn', label: 'GTN spray, with clear advice on when to call', correct: true, why: 'New or rest pain after PCI is an emergency.' },
          { id: 'stopclop', label: 'Stop clopidogrel after a month if she feels well', correct: false, why: 'Six months.' },
          { id: 'nsaid', label: 'Ibuprofen for wrist soreness', correct: false, why: 'NSAIDs with DAPT: bleeding and kidney harm.' },
        ]} />

      <div className="cs-h2">Case quiz</div>
      <Quiz id="s12-quiz" items={[
        { q: 'In stable coronary disease without high-risk anatomy, adding PCI to optimal medical therapy…', options: ['Reduces death', 'Reduces MI', 'Relieves angina and improves quality of life', 'Removes the need for a statin'], answer: 2,
          why: 'ISCHEMIA and ORBITA-2: symptoms and quality of life, not death or MI.' },
        { q: 'A ventricularised catheter pressure trace means…', options: ['The patient is in heart failure', 'The tip is wedged and flow beyond it has stopped', 'The transducer needs re-zeroing', 'Normal aortic pressure'], answer: 1,
          why: 'Diastolic falls toward zero and rises through diastole. Never inject.' },
        { q: 'An eccentric plaque looks most severe when…', options: ['Viewed face-on', 'Viewed in profile', 'Viewed caudally', 'Severity is the same in every view'], answer: 1,
          why: 'In profile you look across its narrowest diameter.' },
        { q: 'A pullback with a single sharp pressure step predicts…', options: ['Diffuse disease', 'A good physiological result from a short stent', 'Microvascular dysfunction', 'Coronary spasm'], answer: 1,
          why: 'Focal loss, focal fix.' },
        { q: 'First steps for a catheter-induced RCA ostial dissection with bradycardia and hypotension:', options: ['Pull back and re-wire', 'Keep the wire, atropine, fluids, no forceful injections, seal the ostium', 'Intracoronary nitrate', 'Protamine'], answer: 1,
          why: 'Wire, physiology support, stop the pressure, cover the entry.' },
        { q: 'Default DAPT after elective PCI for a chronic coronary syndrome:', options: ['1 month', '6 months', '12 months with ticagrelor', 'None'], answer: 1,
          why: 'Six months of aspirin + clopidogrel, shorter if bleeding risk is high.' },
      ]} />

      <div className="cs-card" style={{ borderColor: 'var(--accent2)' }}>
        <div className="cs-h2" style={{ marginTop: 0 }}>Your score</div>
        <p className="cs-p" style={{ fontSize: 20 }}><b className="cs-mono">{totals.got} / {totals.max}</b> · {pct}% · <b style={{ color: pct >= 70 ? 'var(--good)' : 'var(--amber)' }}>{band}</b></p>
        <div className="cs-scorebar" style={{ marginBottom: 14 }}><i style={{ width: `${pct}%` }} /></div>
        <Table head={['Stage', 'Points']} rows={def.stages.map(st => [st.title, N(`${totals.by[st.id]?.got || 0} / ${totals.by[st.id]?.max || 0}`)])} />
      </div>

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>Take-home points</div>
        <ol className="cs-ul">
          <li className="cs-li">In stable disease, PCI is for symptoms. Say so in the consent; the pills prevent the infarct.</li>
          <li className="cs-li">The pressure at the catheter tip is checked before every injection. Damped or ventricular: disengage.</li>
          <li className="cs-li">An eccentric plaque hides in one view. Judge severity in profile — then measure the physiology.</li>
          <li className="cs-li">Focal pressure step, focal fix. A diffuse slope is a different disease.</li>
          <li className="cs-li">Need support? Use a device built for it. Watch the guide when you pull the extension.</li>
          <li className="cs-li">Ostial dissection: keep the wire, support the heart, stop injecting, seal the entry with a stent proud of the ostium.</li>
          <li className="cs-li">RCA trouble means bradycardia and hypotension: atropine, fluids, pacing — and no nitrates.</li>
        </ol>
      </div>
      <Video id="LI2kkaJsCbY" title="TR Band application and removal technique" />
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const CASE_02 = {
  title: 'Stable angina · Eccentric mid-RCA plaque · Elective radial PCI',
  short: 'Cath Lab · Case 02',
  patient: {
    name: 'Mrs Samira Nassar',
    meta: '59 F · MRN 5518-2203 · 74 kg',
    flags: [
      { text: 'No known allergies', tone: 'blue' },
      { text: 'Clopidogrel 600 mg · 07:30', tone: 'amber' },
      { text: 'CCS III on 3 anti-anginals', tone: 'amber' },
      { text: 'eGFR 88', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 150, limit: 325, basis: 'volume/eGFR ≤ 3.7' },
  clock0: min(7, 55),
  vitals0: { hr: 58, sys: 138, dia: 82, spo2: 98, rr: 14, st: 0 },
  brand: { icon: '🫀', line: 'Cath Lab · Case 02' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / IM', tone: 'cyan' },
      { text: 'Elective → emergency', tone: 'red' },
      { text: 'ESC 2024 CCS-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'Stable angina', style: 'outline' },
      { text: 'unstable', style: 'grad' },
      { text: 'morning', style: 'cyan' },
    ],
    hook: (
      <>
        A chemistry teacher who can no longer climb to her own classroom. A <b>routine radial PCI</b> on the 08:45 list.
        A plaque that <span className="g">hides</span> in one view and screams in another. A pressure trace that quietly loses its notch —
        and a single puff of contrast that <span className="r">tears the artery</span> it was meant to show.
        One rule to learn today: <span className="y">the pressure never lies</span>.
      </>
    ),
    image: '/images/cath-lab.webp',
    sims: 's4',
    crisis: 's9',
    cards: [
      { k: 'The patient', t: 'Mrs Samira Nassar, 59 — CCS III angina despite three drugs, inferior ischaemia on stress echo.' },
      { k: 'Your role', t: 'Operator for an elective day case — from consent to the compression band.' },
      { k: 'In your hands', t: 'A catheter pressure trace, the C-arm, a pressure wire and pullback, IVUS, three balloons, a 12-lead ECG.' },
      { k: 'How it teaches', t: 'The why, what it isn’t, the vicious cycle — and five stories of what happens when it goes wrong.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🩺', nav: 'Presentation & Triage', title: 'Clinical presentation & triage', Component: Presentation,
      pill: '🪜 Two flights of stairs',
      lede: 'History, ECG, stress test and CT — typical, stable, and how limiting.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 58, sys: 138, dia: 82, spo2: 98, st: 0 }); atLeastClock(min(7, 55)); } },
    { id: 's2', icon: '📋', nav: 'Pre-Procedure Workup', title: 'Pre-procedure workup & consent', Component: Workup,
      pill: '🤝 What a stent can — and can’t — do',
      lede: 'Why she is here, what to promise, what to load, what to have open.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 60, sys: 140, dia: 84 }); atLeastClock(min(8, 20)); } },
    { id: 's3', icon: '🩸', nav: 'Vascular Access', title: 'Vascular access & setup', Component: Access,
      pill: '🎯 The wrist, the heparin, the curve',
      lede: 'Radial access, the anticoagulant, and the guide for the right coronary.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 62, sys: 136, dia: 80 }); atLeastClock(min(8, 45)); } },
    { id: 's4', icon: '📸', nav: 'Angiography & Views', title: 'Diagnostic angiography & views', Component: Diagnostic,
      pill: '📈 Look at the trace before the syringe',
      lede: 'Engage, read the pressure, acquire the series — and watch a lesion change with the view.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 62, sys: 134, dia: 78 }); atLeastClock(min(8, 58)); } },
    { id: 's5', icon: '🔬', nav: 'Physiology & Imaging', title: 'Lesion assessment — physiology & imaging', Component: Assessment,
      pill: '📏 Measure, don’t guess',
      lede: 'FFR, the pullback, and IVUS to size the stent.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 64, sys: 132, dia: 76 }); atLeastClock(min(9, 10)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy & decision point', Component: Strategy,
      pill: '🧭 The branching point',
      lede: 'Treat now or not, and how to prepare the lesion.',
      enter: ({ atLeastClock }) => atLeastClock(min(9, 20)) },
    { id: 's7', icon: '🛠️', nav: 'Intervention Steps', title: 'Intervention — step by step', Component: Intervention,
      pill: '🎈 Hands on the balloon',
      lede: 'Wire, predilate, deliver, deploy, post-dilate — and take the extension out.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 64, sys: 130, dia: 76 }); atLeastClock(min(9, 24)); } },
    { id: 's8', icon: '✅', nav: 'Result Assessment', title: 'Result assessment & optimisation', Component: Result,
      pill: '🔍 Perfect — until the last run',
      lede: 'IVUS criteria, an edge flap — and a trace you should not ignore.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 64, sys: 130, dia: 76, st: 0 }); atLeastClock(min(9, 48)); } },
    { id: 's9', icon: '🚨', nav: 'Dissection Drill', title: 'Complication: ostial RCA dissection', Component: Complication,
      pill: '🫀 09:52 — the artery tears',
      lede: 'Recognise it, hold the patient up, keep the wire, seal the entry.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 40, sys: 80, dia: 46, st: 2 }); atLeastClock(min(9, 52)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'The same drug can save her in one loop and drop her in another.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 70, sys: 122, dia: 72, st: 0 }); atLeastClock(min(10, 40)); } },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Five mistakes that hurt patients in “routine” cases.',
      enter: ({ atLeastClock }) => atLeastClock(min(11, 0)) },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Post-procedure care, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'The wrist, the night, the antiplatelets and the statin — then your score.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 64, sys: 126, dia: 74, st: 0 }); atLeastClock(min(14, 30)); } },
  ],
};

export default function Case02({ onClose }) {
  return <CaseShell def={CASE_02} onClose={onClose} />;
}
