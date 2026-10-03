import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Steps, Step, Figure, Video, Quiz, fmtClock, fmtSec,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor,
} from '../kit/CaseKit.jsx';
import ECG12 from '../kit/ECG12.jsx';
import Angio from '../kit/Angio.jsx';
import IVUS from '../kit/IVUS.jsx';
import { Barbeau, PressureWire, Inflator, Echo } from '../kit/Physiology.jsx';
import { TREE, VIEWS, ivusProfile, IVUS_MARKS, STENT, PERF_AT, LAD_LESION } from './anatomy.js';

/* ============================================================
   CATH LAB · CASE 01
   NSTE-ACS with recurrent ischaemia: a heavily calcified
   proximal LAD / first diagonal bifurcation in a diabetic man
   with CKD who takes apixaban for atrial fibrillation.
   Immediate invasive strategy → radial access → IVUS-guided,
   lithotripsy-prepared provisional stenting with POT → an
   Ellis III perforation and tamponade → covered stent.

   Clinical content follows the 2023 ESC ACS guideline, the
   European Bifurcation Club consensus, and the published IVUS
   optimisation criteria, simplified for teaching.
   ============================================================ */

const WIKI = f => `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=960`;
const WIKIPAGE = f => `https://commons.wikimedia.org/wiki/File:${f}`;
const UNSPLASH = id => `https://unsplash.com/photos/${id}/download?w=1200`;

const min = (h, m) => h * 60 + m;

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

/* ============================================================
   1 · CLINICAL PRESENTATION & TRIAGE
   ============================================================ */

function Presentation() {
  const { clock } = useCase();
  const [ecg, setEcg] = useState('pain');
  const ST_PAIN = { I: -1, aVL: -1, II: -1, aVF: -0.5, V2: -1.5, V3: -2, V4: -2.5, V5: -2, V6: -1.5, aVR: 1.5 };
  const ST_FREE = { V3: -0.5, V4: -0.5 };
  const deadline = min(10, 50), start = min(8, 50);
  const k = Math.min(1, Math.max(0, (clock - start) / (deadline - start)));
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">06:40</span>Mr Youssef Karam, 64, wakes with central chest pressure radiating to the left arm, sweaty and nauseated. It lasts 40 minutes and eases partly with his wife’s GTN spray.</p>
        <p className="cs-p"><span className="cs-time">08:05</span>Arrives in the emergency department pain-free. Type 2 diabetes (HbA1c 8.1% on metformin), hypertension, dyslipidaemia, 30 pack-years and still smoking, CKD stage 3a, and paroxysmal atrial fibrillation on <b>apixaban 5 mg twice daily</b> — last dose 21:00 last night.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">08:50</span>Pain returns at rest, 8/10, despite 300 mg aspirin, sublingual and then IV nitrate. The repeat ECG has changed.</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Vital signs · 08:52</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('102 /min, sinus', 'cs-hi')], ['Blood pressure', N('152/90 mmHg')], ['Respiratory rate', N('20 /min')],
            ['SpO₂', N('96% on air')], ['Temperature', N('36.8 °C')], ['Killip class', N('I — clear chest, no S3')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>The urgency clock</div>
          <p className="cs-p">Recurrent ischaemic pain despite treatment makes this <b>very-high-risk NSTE-ACS</b>: the target is the catheter laboratory within <b>2 hours</b> of the recurrence.</p>
          <div className="cs-scorebar" style={{ height: 10 }}><i style={{ width: `${k * 100}%`, background: k > 0.8 ? 'var(--red)' : 'linear-gradient(90deg,var(--accent2),var(--amber))' }} /></div>
          <div className="cs-row" style={{ justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--ink3)' }}>
            <span className="cs-mono">recurrence 08:50</span><span className="cs-mono">now {fmtClock(clock)}</span><span className="cs-mono">deadline 10:50</span>
          </div>
        </div>
      </div>

      <div className="cs-h2">12-lead ECG</div>
      <div className="cs-row" style={{ marginBottom: 8 }}>
        <button className={'cs-chip' + (ecg === 'free' ? ' on' : '')} onClick={() => setEcg('free')}>08:10 · pain-free</button>
        <button className={'cs-chip' + (ecg === 'pain' ? ' on' : '')} onClick={() => setEcg('pain')}>08:52 · during pain</button>
      </div>
      <ECG12 rate={ecg === 'pain' ? 102 : 84} st={ecg === 'pain' ? ST_PAIN : ST_FREE}
        caption={ecg === 'pain'
          ? 'During pain: horizontal ST depression 1.5–2.5 mm in V2–V6, I and aVL, with ~1.5 mm ST elevation in aVR. Dynamic compared with 08:10.'
          : 'Pain-free at 08:10: minor ST depression V3–V4 only.'} />
      <Note kind="pearl" title="Reading it">
        Widespread ST depression with ST elevation in aVR during pain is subendocardial ischaemia across a large territory — think left main, proximal LAD or multivessel disease.
        It is not a STEMI equivalent on its own. <b>That the changes come and go with the pain is the point.</b>
      </Note>
      <Why title="Why the ST segment drops everywhere — and rises in aVR"
        chain={[
          { k: 'SUPPLY', t: 'A ruptured LAD plaque with flickering thrombus: flow falls whenever demand rises.' },
          { k: 'WHERE', t: 'The subendocardium starves first — furthest from the epicardial artery and squeezed hardest in systole.' },
          { k: 'ELECTRICS', t: 'Injured inner muscle sets up a current of injury pointing away from the surface leads → ST depression.' },
          { k: 'aVR', t: 'aVR looks from the opposite side, so it records the mirror image: ST elevation.' },
        ]}>
        Diffuse ST depression does not localise the artery — it measures <b>how much muscle is starving</b>. That is why aVR elevation with widespread depression means a big territory: left main, proximal LAD, or three vessels.
      </Why>
      <Contrast title="what this ECG is — and what it is not"
        is={{ h: 'NSTE-ACS with dynamic subendocardial ischaemia', points: [
          'Partial occlusion or a flickering thrombus — flow comes and goes, so the ECG does too.',
          'ST depression that does not localise; it changes with the pain.',
          'Urgency comes from risk features: immediate (< 2 h) when pain recurs despite treatment, early (< 24 h) otherwise.',
          'No fibrinolysis — it does not help a non-occlusive white thrombus and only adds bleeding.',
        ] }}
        isnt={{ h: 'STEMI (occlusion MI)', points: [
          'Total occlusion — the full thickness of the wall is dying.',
          'ST elevation localises to a territory, with reciprocal depression opposite.',
          'Reperfusion now: primary PCI, or lysis if PCI cannot happen within 120 minutes.',
          'Trap: posterior MI hides as ST depression in V1–V3. Look for it before calling an ECG “NSTE”.',
        ] }} />

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>High-sensitivity troponin I</div>
          <Table head={['Time', 'hs-cTnI', 'Note']} rows={[
            ['0 h (08:10)', N('68 ng/L', 'cs-hi'), '≥ 64 ng/L on this assay: rule-in at presentation'],
            ['1 h (09:10)', N('412 ng/L', 'cs-hi'), 'Δ 344 ng/L — rising'],
          ]} />
          <p className="cs-pts" style={{ marginTop: 8 }}>ESC 0 h/1 h algorithm. Thresholds are assay-specific; these are the published values for the Architect hs-cTnI assay.</p>
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Bloods and bedside echo</div>
          <Table head={['Test', 'Result']} rows={[
            ['Haemoglobin', N('136 g/L')], ['Platelets', N('238 ×10⁹/L')], ['Creatinine', N('124 µmol/L (1.4 mg/dL)', 'cs-hi')],
            ['eGFR', N('52 mL/min/1.73 m²', 'cs-hi')], ['Potassium', N('4.3 mmol/L')], ['Glucose', N('11.8 mmol/L', 'cs-hi')],
            ['LDL-C', N('3.6 mmol/L', 'cs-hi')], ['INR (on apixaban)', N('1.2')],
            ['Echo', 'LVEF ~50%, anterior and anteroseptal hypokinesis, no effusion, no MR'],
          ]} />
        </div>
      </div>

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>Risk stratification</div>
        <Table head={['GRACE variable', 'Patient']} rows={[
          ['Age', '64'], ['Heart rate', '102'], ['Systolic BP', '152'], ['Creatinine', '124 µmol/L'],
          ['Killip class', 'I'], ['Cardiac arrest at admission', 'No'], ['ST-segment deviation', 'Yes'], ['Elevated cardiac biomarkers', 'Yes'],
        ]} />
        <p className="cs-p" style={{ marginTop: 10 }}>GRACE in-hospital score <b className="cs-mono">≈ 152</b> — above 140, high risk.</p>
      </div>

      <MultiSelect id="s1-veryhigh" question="Which of his features are ESC very-high-risk criteria for NSTE-ACS?"
        items={[
          { id: 'pain', label: 'Recurrent or refractory chest pain despite medical treatment', correct: true, why: 'Pain returned at rest despite aspirin and nitrates — very high risk.' },
          { id: 'st', label: 'Recurrent dynamic ST-segment changes', correct: true, why: 'The ECG changes with the pain. Intermittent ST elevation would also count.' },
          { id: 'grace', label: 'GRACE score above 140', correct: false, why: 'A high-risk criterion (invasive strategy within 24 h), not a very-high-risk one.' },
          { id: 'trop', label: 'Rising troponin (NSTEMI diagnosis)', correct: false, why: 'Confirms NSTEMI, which is high risk — not by itself an indication for immediate angiography.' },
          { id: 'shock', label: 'Haemodynamic instability or cardiogenic shock', correct: false, why: 'He is hypertensive and Killip I.' },
          { id: 'hf', label: 'Acute heart failure from ongoing ischaemia', correct: false, why: 'No congestion, no hypoxaemia.' },
        ]} />

      <Decision id="s1-timing" question="Timing of the invasive strategy?"
        options={[
          { id: 'imm', label: 'Immediate invasive strategy — catheter lab within 2 hours', verdict: 'best', points: 10,
            why: 'Recurrent ischaemia with dynamic ST changes despite therapy is a very-high-risk feature (ESC 2023, class I).',
            feedback: 'Correct. The lab is activated at 08:58 — the clock is running.' },
          { id: 'early', label: 'Early invasive strategy — angiography within 24 hours', verdict: 'ok', points: 3,
            why: 'Right for high-risk NSTE-ACS (NSTEMI, GRACE >140) once pain-free. Ongoing ischaemia moves him to immediate.' },
          { id: 'selective', label: 'Selective invasive strategy after non-invasive testing', verdict: 'wrong', points: 0,
            why: 'For low-risk patients with a negative troponin pathway.' },
          { id: 'lysis', label: 'Fibrinolysis, then angiography', verdict: 'wrong', points: 0,
            why: 'Fibrinolysis has no role in NSTE-ACS — and he is anticoagulated.' },
        ]} />

      <Decision id="s1-antithrombotic" question="He is on apixaban. What antithrombotic treatment does he get before the lab?"
        options={[
          { id: 'asa', label: 'Aspirin 300 mg already given; no P2Y12 pretreatment; no extra parenteral anticoagulant now — decide in the lab once the anatomy is known', verdict: 'best', points: 10,
            why: 'Routine P2Y12 pretreatment is not recommended when early angiography is planned. Clopidogrel will be the P2Y12 inhibitor because he needs an oral anticoagulant. Heparin is given in the lab irrespective of the last apixaban dose.' },
          { id: 'tica', label: 'Ticagrelor 180 mg + enoxaparin 1 mg/kg now', verdict: 'wrong', points: 0,
            why: 'Ticagrelor with an oral anticoagulant carries excess bleeding, and LMWH on top of apixaban stacks two anticoagulants.' },
          { id: 'clop', label: 'Clopidogrel 600 mg + fondaparinux 2.5 mg now', verdict: 'ok', points: 4,
            why: 'Clopidogrel is the right P2Y12 agent, but pretreatment before immediate angiography is not routine, and adding fondaparinux to apixaban is not indicated.' },
          { id: 'stop', label: 'Reverse apixaban with andexanet before the procedure', verdict: 'wrong', points: 0,
            why: 'Reversal is for life-threatening bleeding — not to prepare for a radial procedure.' },
        ]} />

      <div className="cs-media-row">
        <Figure src={UNSPLASH('0lrJo37r6Nk')} href="https://unsplash.com/photos/0lrJo37r6Nk" alt="Patient monitor showing a heart rate" caption="Continuous monitoring from arrival: recurrent ischaemia can declare itself as arrhythmia before pain." credit="Photo: Unsplash" />
        <Figure src={WIKI('Coronary_arteries.svg')} href={WIKIPAGE('Coronary_arteries.svg')} alt="Diagram of the coronary arteries" caption="Coronary anatomy: the LAD supplies the anterior wall — the territory of his ECG and echo changes." credit="P. J. Lynch / M. Häggström, CC BY-SA 3.0, Wikimedia Commons" />
      </div>
    </>
  );
}

/* ============================================================
   2 · PRE-PROCEDURE WORKUP & PLANNING
   ============================================================ */

function Workup() {
  const W = 82, CR = 1.4, EGFR = 52;
  return (
    <>
      <p className="cs-p">Fifteen minutes before transfer. Work through what the lab needs to know — open each item.</p>
      <Reveal label="Consent">
        <p className="cs-p">Angiography with likely <b>ad hoc PCI</b>. He is told the expected benefit (relief of ongoing ischaemia, lower risk of further infarction), and the risks: death, stroke and MI each well under 1%; bleeding and access-site injury; contrast kidney injury; allergic reaction; coronary dissection or perforation; emergency surgery rarely; and radiation. Alternatives: medical therapy alone, or surgery if the anatomy demands it. He agrees and signs.</p>
      </Reveal>
      <Reveal label="Allergies">
        <p className="cs-p">“Hives” after a CT contrast scan in 2019, settled with an antihistamine. He also says he is “allergic to shellfish.”</p>
        <Note kind="pearl" title="Shellfish is not iodine">Shellfish allergy does not predict contrast reactions — the allergen is tropomyosin, not iodine. A <b>previous mild allergic-like reaction to iodinated contrast</b> does matter.</Note>
      </Reveal>
      <Reveal label="Kidneys and diabetes">
        <p className="cs-p">eGFR 52 with diabetes: moderate risk of contrast-associated AKI. Start isotonic saline at 1 mL/kg/h now (0.5 mL/kg/h if LVEF ≤35% or heart failure) and continue for 6–12 hours afterwards. Use a low- or iso-osmolar agent, minimise volume, avoid nephrotoxins. <b>Metformin</b> is held from the procedure and restarted after 48 hours if creatinine is stable.</p>
      </Reveal>
      <Reveal label="Anticoagulation and bleeding risk">
        <p className="cs-p">Apixaban last taken at 21:00 — about 12 hours ago. Oral anticoagulation is a major Academic Research Consortium high-bleeding-risk criterion. Plan: <b>radial access</b>, no bridging, and in the lab <b>give unfractionated heparin irrespective of the timing of the last apixaban dose</b>, at a reduced bolus guided by ACT.</p>
      </Reveal>

      <Contrast title="contrast-reaction risk: real predictors vs folklore"
        is={{ h: 'What actually predicts a reaction', points: [
          'A previous reaction to iodinated contrast — his hives in 2019.',
          'Severe asthma or several severe allergies (a weaker signal).',
          'Most reactions are direct, non-IgE mast-cell release — which is why steroid and antihistamine premedication blunts them.',
        ] }}
        isnt={{ h: 'Folklore that delays care', points: [
          'Shellfish allergy — the allergen is tropomyosin, a muscle protein. There is no iodine in it that matters.',
          'Povidone-iodine skin reactions — a contact dermatitis, not a predictor of contrast anaphylaxis.',
          '“Iodine allergy” — iodine is an essential element in every thyroid hormone. Nobody is allergic to it.',
        ] }} />

      <Why title="Why contrast hurts a diabetic kidney"
        chain={[
          { k: 'VASOCONSTRICTION', t: 'Contrast releases adenosine and endothelin: renal medullary vessels clamp down.' },
          { k: 'HYPOXIA', t: 'The outer medulla already lives at the edge of hypoxia — thick ascending limbs pump salt all day on little blood flow.' },
          { k: 'TOXICITY', t: 'Viscous contrast lingers in the tubules: direct tubular-cell injury and free radicals.' },
          { k: 'NO RESERVE', t: 'Diabetes + CKD = fewer nephrons, each already hyperfiltering. Nothing left to absorb the hit.' },
        ]}>
        So the levers are <b>volume and flow</b>: less contrast means less insult; isotonic saline keeps tubular flow moving and dilutes what is there. And metformin is held not because it harms the kidney — but because if the kidney fails, metformin accumulates and causes <b>lactic acidosis</b>.
      </Why>

      <Decision id="s2-premed" question="How do you handle the previous contrast reaction for an urgent procedure?"
        options={[
          { id: 'accel', label: 'Accelerated IV premedication — methylprednisolone 40 mg (or hydrocortisone 200 mg) plus diphenhydramine 50 mg about an hour before — a different contrast agent, and the anaphylaxis kit ready', verdict: 'best', points: 10,
            why: 'A prior mild allergic-like reaction in an urgent case: accelerated IV premedication, ideally a different agent, and readiness to treat. It does not justify delaying an immediate invasive strategy.' },
          { id: '13h', label: 'The 13-hour oral prednisolone regimen, then angiography tomorrow', verdict: 'wrong', points: 0,
            why: 'Right for elective work. Here it would delay a very-high-risk patient past his 2-hour window.' },
          { id: 'none', label: 'No premedication — the reaction was only hives', verdict: 'ok', points: 3,
            why: 'Mild reactions often do not recur, but premedication is reasonable and cheap here, and the history should be acted on.' },
          { id: 'cancel', label: 'Avoid contrast and treat medically', verdict: 'wrong', points: 0,
            why: 'Denies him the treatment for ongoing ischaemia because of a manageable risk.' },
        ]} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>Contrast budget</div>
        <Table head={['Method', 'Calculation', 'Limit']} rows={[
          ['Contrast volume / eGFR ratio < 3.7', `3.7 × ${EGFR}`, N(`${Math.round(3.7 * EGFR)} mL`)],
          ['Contrast volume / eGFR ratio < 2 (highest-risk target)', `2 × ${EGFR}`, N(`${2 * EGFR} mL`)],
          ['Maximum acceptable contrast dose (Cigarroa)', `5 × ${W} kg ÷ ${CR} mg/dL`, N(`${Math.round(5 * W / CR)} mL`)],
        ]} />
        <p className="cs-pts" style={{ marginTop: 8 }}>The contrast tile in the vitals strip tracks every millilitre against this budget.</p>
      </div>
      <Decision id="s2-budget" question="Which contrast ceiling do you brief the team on?"
        options={[
          { id: 'ratio', label: 'About 190 mL (volume/eGFR < 3.7), aiming well below — ~150 mL', verdict: 'best', points: 10,
            why: 'The volume-to-eGFR ratio predicts contrast AKI better than a fixed volume. Brief a hard ceiling and a lower working target, and use IVUS to save contrast runs.' },
          { id: 'cig', label: 'About 290 mL (Cigarroa maximum)', verdict: 'ok', points: 4,
            why: 'A valid formula, but it gives the most permissive number for this patient.' },
          { id: 'none', label: 'No limit — the indication is urgent', verdict: 'wrong', points: 0,
            why: 'Urgency does not remove the kidney. A budget changes behaviour: fewer runs, smaller puffs, imaging instead of extra angiograms.' },
        ]} />

      <div className="cs-h2">Access assessment — Barbeau test, right hand</div>
      <Barbeau type="B" />
      <Decision id="s2-barbeau" question="During radial compression the thumb pleth damps to about half and recovers fully within two minutes. What does that mean?"
        options={[
          { id: 'B', label: 'Barbeau type B: the ulnar collateral supply is adequate — right radial access is acceptable', verdict: 'best', points: 10,
            why: 'Types A–C all support transradial access. Only type D (no recovery at 2 min) argues against using that radial, and even that is debated.' },
          { id: 'D', label: 'Type D: avoid the right radial', verdict: 'wrong', points: 0, why: 'The waveform recovered — that is not type D.' },
          { id: 'allen', label: 'Inconclusive; repeat with a modified Allen test before deciding', verdict: 'ok', points: 2,
            why: 'The Barbeau test is more sensitive than the Allen test and already answers the question.' },
        ]} />
      <p className="cs-p">Ultrasound: right radial artery 2.6 mm at the wrist, no calcification or loops — suitable for a 6F slender sheath. Left radial is the backup; femoral is the bailout.</p>

      <MultiSelect id="s2-kit" question="Given what you know, what do you ask the lab to have open and ready?"
        items={[
          { id: 'ivus', label: 'Intravascular imaging (IVUS or OCT)', correct: true, why: 'Diabetic, CKD, likely calcified LAD: imaging guides preparation, sizing and optimisation, and saves contrast.' },
          { id: 'calc', label: 'Calcium modification: intravascular lithotripsy and rotational atherectomy', correct: true, why: 'Anticipate calcium in an older diabetic with CKD rather than discover it with a stent half-expanded.' },
          { id: 'wire', label: 'Pressure wire for physiology of any non-culprit lesion', correct: true, why: 'Non-culprit intermediate lesions are assessed physiologically, not by eye.' },
          { id: 'covered', label: 'Covered stents and a pericardiocentesis set', correct: true, why: 'Calcium modification and high-pressure balloons raise perforation risk; the bailout kit should be in the room, not the store.' },
          { id: 'iabp', label: 'Prophylactic intra-aortic balloon pump insertion', correct: false, why: 'He is haemodynamically stable with near-normal LV function; no indication.' },
          { id: 'gp', label: 'Routine GP IIb/IIIa infusion', correct: false, why: 'Not routine; reserved for bailout (no-reflow, large thrombus) — and bleeding risk is high on apixaban.' },
        ]} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>The procedural plan, as briefed to the team</div>
        <ul className="cs-ul">
          <li className="cs-li">Right radial, 6F slender sheath; spasmolytic cocktail; UFH ~60 IU/kg, ACT target 250–300 s.</li>
          <li className="cs-li">Diagnostic: one catheter for both coronaries; left system first — the likely culprit.</li>
          <li className="cs-li">Culprit: IVUS before treatment to define calcium and size; prepare it, stent it, optimise it.</li>
          <li className="cs-li">Non-culprit: physiology before deciding.</li>
          <li className="cs-li">Anticipated risks: contrast AKI, bleeding on OAC, perforation with calcium modification, slow flow, side-branch loss.</li>
        </ul>
      </div>
      <div className="cs-media-row">
        <Figure src={UNSPLASH('Lpw-b-QWt8M')} href="https://unsplash.com/photos/Lpw-b-QWt8M" alt="A team in blue scrubs" caption="The team brief: roles, the contrast ceiling, and what is open on the shelf before the patient arrives." credit="Photo: Unsplash" />
        <Video id="tzsJutNVjjM" title="Cath Lab Tour: Percutaneous Coronary Intervention (PCI) in 2020" channel="F. Forouzandeh, MD, PhD" />
      </div>
    </>
  );
}

/* ============================================================
   3 · VASCULAR ACCESS & SETUP
   ============================================================ */

function Access() {
  const { answers, answer, bump } = useCase();
  const heparin = answers['s3-heparin'];
  const ACT = { 3000: 214, 5000: 268, 7000: 318, 9000: 372 };
  const give = (u) => {
    if (heparin) return;
    answer('s3-heparin', u);
    bump({ act: ACT[u] });
  };
  return (
    <>
      <Decision id="s3-site" question="Arterial access?"
        options={[
          { id: 'rr', label: 'Right radial', verdict: 'best', points: 10,
            why: 'In ACS, radial access reduces major bleeding and vascular complications and was associated with lower mortality (RIVAL, MATRIX). He is anticoagulated — this matters more, not less.' },
          { id: 'dr', label: 'Right distal radial (anatomical snuffbox)', verdict: 'ok', points: 7,
            why: 'Reasonable; lower radial occlusion rates in some series, but a smaller vessel and a learning curve.' },
          { id: 'lr', label: 'Left radial', verdict: 'ok', points: 6,
            why: 'Valid, and preferred with a LIMA graft or right subclavian tortuosity. Ergonomically harder for the operator.' },
          { id: 'fem', label: 'Right common femoral', verdict: 'wrong', points: 2,
            why: 'More bleeding — and he is on apixaban. Keep femoral for bailout: large-bore devices, failed radial, mechanical support.' },
        ]} />

      <Why title="Why the wrist bleeds less — and why that saves lives"
        chain={[
          { k: 'ANATOMY', t: 'The radial artery is superficial and lies on bone — the radius.' },
          { k: 'CONTROL', t: 'Any bleed is visible at once and stopped with a band pressing it against that bone.' },
          { k: 'THE GROIN', t: 'The femoral artery is deep. A puncture above the inguinal ligament bleeds backwards into the retroperitoneum — silently, litres at a time.' },
          { k: 'OUTCOME', t: 'A major bleed after ACS independently raises death. Fewer bleeds, fewer deaths (RIVAL, MATRIX).' },
        ]} />
      <Why title="Why the radial artery spasms"
        chain={[
          { k: 'WALL', t: 'A thick muscular media, rich in α₁-adrenergic receptors.' },
          { k: 'TRIGGER', t: 'Pain, fear and catheter friction release catecholamines.' },
          { k: 'SPASM', t: 'The artery grips the catheter: pain, resistance, and failed access.' },
          { k: 'BREAK IT', t: 'Verapamil and nitrate relax the muscle; a hydrophilic sheath cuts friction; local anaesthetic and calm cut the catecholamines.' },
        ]} />

      <Sequence id="s3-seq" question="Put the radial access in order."
        steps={[
          { label: 'Wrist extended on the arm board, prepped and draped; 1–2 mL of 2% lidocaine subcutaneously', why: 'A comfortable, still patient makes for less spasm.' },
          { label: 'Ultrasound-guided puncture with a 21G needle, anterior wall only', why: 'Ultrasound improves first-pass success and reduces attempts.' },
          { label: 'Advance the 0.021″ access wire — it should run without resistance', why: 'Resistance means a branch or a subintimal course: stop and check under fluoroscopy.' },
          { label: 'Introduce the 6F hydrophilic slender sheath', why: 'Hydrophilic coating reduces spasm and pain.' },
          { label: 'Spasmolytic cocktail through the sheath, then heparin', why: 'Prevent spasm and radial thrombosis before the catheters go up.' },
        ]} />

      <MultiSelect id="s3-cocktail" question="What goes into the radial cocktail?"
        items={[
          { id: 'ver', label: 'Verapamil 2.5 mg', correct: true, why: 'Calcium-channel blockade reduces spasm.' },
          { id: 'ntg', label: 'Nitroglycerin 100–200 µg', correct: true, why: 'Vasodilator. Dilute and give slowly — it stings.' },
          { id: 'hep', label: 'Heparin — through the sheath or IV', correct: true, why: 'Prevents radial artery occlusion; here it is also the procedural anticoagulant.' },
          { id: 'ade', label: 'Adenosine', correct: false, why: 'Used for hyperaemia and no-reflow, not radial spasm.' },
          { id: 'atr', label: 'Atropine', correct: false, why: 'For vagal bradycardia, not spasm.' },
        ]} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>Anticoagulation — choose the heparin bolus (82 kg, on apixaban)</div>
        <p className="cs-p">Standard UFH for PCI without a GP IIb/IIIa inhibitor is 70–100 IU/kg (ACT 250–350 s). In a patient on an oral anticoagulant, heparin is still given whatever the timing of the last dose, but a lower bolus — around 60 IU/kg — is usual, titrated to ACT.</p>
        <div className="cs-row">
          {[3000, 5000, 7000, 9000].map(u => (
            <button key={u} className={'cs-btn' + (heparin === u ? ' primary' : '')} disabled={!!heparin} onClick={() => give(u)}>{u.toLocaleString()} IU ({Math.round(u / 82)} IU/kg)</button>
          ))}
        </div>
        {heparin && (
          <div className={'cs-fb ' + (heparin === 5000 ? 'best' : heparin === 7000 ? 'ok' : 'wrong')}>
            ACT at 5 minutes: <b className="cs-mono">{ACT[heparin]} s</b>. {heparin === 5000
              ? 'On target for PCI on an interrupted NOAC.'
              : heparin === 3000 ? 'Too low for PCI — thrombus on wires and in the guide is a real risk. Top up.'
              : heparin === 7000 ? 'Acceptable range, but at the top end for someone on apixaban.'
              : 'Over-anticoagulated: bleeding risk, and a perforation would bleed harder.'}
          </div>
        )}
        <ScoreOnce id="s3-hep" pts={heparin === 5000 ? 10 : heparin === 7000 ? 6 : heparin ? 0 : null} max={10} />
        <Note kind="evid" title="Bivalirudin">An alternative to UFH (0.75 mg/kg bolus, 1.75 mg/kg/h). Its advantage is less bleeding in some trials; it does not need an ACT target in the same way. UFH remains the default.</Note>
      </div>

      <Decision id="s3-guide" question="For the LAD from the right radial, which 6F guide catheter?"
        options={[
          { id: 'ebu', label: 'EBU / XB 3.5', verdict: 'best', points: 10,
            why: 'Extra-backup curve: it braces against the opposite aortic wall, giving the support needed to deliver devices through a calcified lesion.' },
          { id: 'jl35', label: 'JL 3.5', verdict: 'ok', points: 5,
            why: 'Engages easily from the radial but gives less support — likely to back out when you push an IVL balloon or stent through calcium.' },
          { id: 'jl4', label: 'JL 4.0', verdict: 'wrong', points: 2,
            why: 'From the right radial a JL 4 tends to sit too high; JL 3.5 or an EBU fits a normal aorta better.' },
          { id: 'jr4', label: 'JR 4', verdict: 'wrong', points: 0, why: 'A right coronary catheter.' },
        ]} />
      <p className="cs-p">Diagnostics first with a single 5F Tiger catheter for both coronaries; the guide comes when you are ready to treat.</p>

      <div className="cs-media-row">
        <Figure src={WIKI('A_cardiac_catheterization_procedure_in_the_Naval_Medical_Center_San_Diego_hospital%E2%80%99s_cardiac_catheterization_laboratory_-_50427726433.jpg')}
          href={WIKIPAGE('A_cardiac_catheterization_procedure_in_the_Naval_Medical_Center_San_Diego_hospital%E2%80%99s_cardiac_catheterization_laboratory_-_50427726433.jpg')}
          alt="A cardiac catheterisation procedure in progress" caption="A real procedure: operators gowned and in lead, the patient draped, monitors and C-arm over the table." credit="U.S. Navy, public domain, Wikimedia Commons" />
        <Video id="VICGjOZzWyY" title="Trans radial access for coronary angiography and interventions" />
      </div>
    </>
  );
}

/** Award points once for an interaction that is not a Decision. */
function ScoreOnce({ id, pts, max }) {
  const { award, stageId } = useCase();
  useEffect(() => { if (pts != null) award(stageId, id, pts, max); }, [pts]);  // eslint-disable-line
  return null;
}

/* ============================================================
   4 · DIAGNOSTIC ANGIOGRAPHY & VIEWS
   ============================================================ */

function Diagnostic() {
  const { answers, answer } = useCase();
  const runs = answers['s4-runs'] || [];
  const onCine = (v) => {
    const key = `${Math.round(v.lao)}:${Math.round(v.cra)}`;
    const preset = VIEWS.find(p => p.lao === Math.round(v.lao) && p.cra === Math.round(v.cra));
    if (!runs.includes(preset?.id || key)) answer('s4-runs', [...runs, preset?.id || key]);
  };
  const left = runs.filter(r => VIEWS.find(v => v.id === r)?.system === 'left').length;
  const right = runs.filter(r => VIEWS.find(v => v.id === r)?.system === 'right').length;
  const enough = left >= 4 && right >= 2;
  return (
    <>
      <p className="cs-p">Acquire the series. Pick a projection, then <b>Cine / inject</b>. Every run costs contrast and dose — watch the contrast and fluoro tiles at the top. Aim for four or more views of the left system and two of the right, chosen so every segment is seen twice, in roughly orthogonal views.</p>
      <Angio tree={TREE} presets={VIEWS} onCine={onCine} height={420} startView="rao-cau" />
      <div className="cs-row" style={{ margin: '4px 0 14px' }}>
        {VIEWS.map(v => <span key={v.id} className={'cs-chip' + (runs.includes(v.id) ? ' done' : '')}>{runs.includes(v.id) ? '✓ ' : ''}{v.short}</span>)}
      </div>
      <p className="cs-pts">Left system views: {left} · Right system views: {right}{enough ? ' — series complete.' : ''}</p>

      <Note kind="pearl" title="How to choose views">
        Name the projection by where the <b>detector</b> sits: LAO/RAO for left or right anterior oblique, cranial/caudal for its tilt toward head or feet. Caudal views open the left main and circumflex; cranial views open the mid LAD and its branches. A lesion is only as severe as it looks in its <b>least</b> foreshortened, non-overlapped view.
      </Note>
      <Why title="Foreshortening: why one view lies"
        chain={[
          { k: 'SHADOW', t: 'An angiogram is the shadow of a 3D tube thrown onto a flat detector.' },
          { k: 'ANGLE', t: 'When the vessel runs toward the detector its length collapses — a 20 mm lesion can look like 8 mm.' },
          { k: 'OVERLAP', t: 'Branches cross in front of the lesion and hide its narrowest point.' },
          { k: 'RULE', t: 'Every segment in two roughly orthogonal views; judge by the worst unforeshortened one.' },
        ]}>
        Try it above: put the LAD in RAO caudal, then LAO cranial. Same artery, different truth.
      </Why>
      <Contrast title="culprit vs bystander"
        is={{ h: 'The culprit', points: [
          'Hazy, irregular or ulcerated edge; a filling defect (thrombus).',
          'Sits in the territory of the ECG changes and the wall-motion abnormality.',
          'Treated for what it is — a ruptured plaque — not for its gradient.',
        ] }}
        isnt={{ h: 'The bystander', points: [
          'Smooth, concentric, often long-standing.',
          'No territory correlate on ECG or echo.',
          'Judged by physiology: treated only if it limits flow.',
        ] }} />

      {enough && (
        <div className="cs-card" style={{ borderColor: 'var(--accent2)' }}>
          <div className="cs-h2" style={{ marginTop: 0 }}>Angiographic findings</div>
          <ul className="cs-ul">
            <li className="cs-li"><b>LM</b>: normal.</li>
            <li className="cs-li"><b>LAD</b>: heavily calcified (visible on fluoroscopy before contrast), 85–90% proximal-to-mid stenosis over ~26 mm, starting 5 mm from the left main bifurcation and running across the origin of D1. Hazy, irregular edge. TIMI 3 flow.</li>
            <li className="cs-li"><b>D1</b>: 2.5 mm, ostium free of disease.</li>
            <li className="cs-li"><b>LCx</b>: non-dominant, mild 30% mid.</li>
            <li className="cs-li"><b>RCA</b>: dominant, smooth 60–70% mid-segment stenosis.</li>
          </ul>
        </div>
      )}

      <Decision id="s4-culprit" question="Which is the culprit lesion?"
        options={[
          { id: 'lad', label: 'Proximal–mid LAD', verdict: 'best', points: 10,
            why: 'Matches the anterior ST changes and anterior hypokinesis; the haziness and irregular edge suggest plaque rupture or thrombus.' },
          { id: 'rca', label: 'Mid RCA', verdict: 'wrong', points: 0, why: 'Smooth and moderate, with no inferior ECG or echo correlate. A bystander until proven otherwise.' },
          { id: 'lcx', label: 'Mid LCx', verdict: 'wrong', points: 0, why: 'Mild disease only.' },
          { id: 'both', label: 'Both LAD and RCA — treat both now', verdict: 'wrong', points: 2, why: 'Identify one culprit; non-culprit disease needs physiology first.' },
        ]} />

      <Decision id="s4-medina" question="Medina classification of the LAD/D1 bifurcation lesion?"
        options={[
          { id: '110', label: '1,1,0 — proximal main vessel and distal main vessel diseased; side-branch ostium free', verdict: 'best', points: 10,
            why: 'Medina scores proximal main vessel, distal main vessel, side branch — each 1 or 0 for ≥50% stenosis. 1,1,0 is a non-true bifurcation lesion.' },
          { id: '111', label: '1,1,1 — a true bifurcation lesion', verdict: 'wrong', points: 0, why: 'The D1 ostium is free.' },
          { id: '100', label: '1,0,0', verdict: 'wrong', points: 0, why: 'The disease crosses the carina into the distal LAD.' },
          { id: '011', label: '0,1,1', verdict: 'wrong', points: 0, why: 'The proximal LAD is diseased; the D1 is not.' },
        ]} />

      <Decision id="s4-view" question="Which is your working view for treating this LAD/D1 bifurcation?"
        options={[
          { id: 'laocra', label: 'LAO cranial (or AP cranial)', verdict: 'best', points: 10,
            why: 'Cranial angulation separates diagonals from septals and opens the LAD/D1 carina, so you can place the stent and the POT balloon precisely.' },
          { id: 'raocau', label: 'RAO caudal', verdict: 'wrong', points: 0, why: 'Foreshortens the LAD and overlaps the bifurcation.' },
          { id: 'spider', label: 'LAO caudal (spider)', verdict: 'ok', points: 4, why: 'The view for the left main and proximal LAD ostium — useful to check you are not compromising the LM, but not for the mid-LAD bifurcation.' },
        ]} />

      <Decision id="s4-rca" question="The mid RCA lesion looks 60–70%. What next?"
        options={[
          { id: 'phys', label: 'Assess it physiologically (FFR or a non-hyperaemic ratio) before deciding', verdict: 'best', points: 10,
            why: 'Angiography misjudges intermediate lesions in both directions. Physiology decides whether it limits flow.' },
          { id: 'stent', label: 'Stent it now — complete revascularisation', verdict: 'wrong', points: 2, why: 'Complete revascularisation is guided by ischaemia, not appearance; and he has a contrast budget.' },
          { id: 'ignore', label: 'Leave it — only treat the culprit', verdict: 'ok', points: 4, why: 'Defensible in NSTE-ACS, but you would be guessing. A pressure wire answers it now.' },
        ]} />

      <div className="cs-media-row">
        <Figure src={WIKI('Angiography_coronary_stenosis_01.jpg')} href={WIKIPAGE('Angiography_coronary_stenosis_01.jpg')} alt="Coronary angiogram with stenosis" caption="A real coronary angiogram showing severe stenosis — the contrast column narrows to a waist." credit="Wikimedia Commons (see file page for licence)" />
        <Video id="snXIsggQP1k" title="Coronary views, including AP cranial and AP caudal" />
      </div>
      <div className="cs-media-row">
        <Video id="Vhf-gob-miA" title="Coronary angiogram: LAO caudal (spider) view" />
        <Video id="qaB2CiJf1Gg" title="Coronary angiogram: RAO cranial view" />
      </div>
    </>
  );
}

/* ============================================================
   5 · LESION ASSESSMENT — PHYSIOLOGY & IMAGING
   ============================================================ */

const RCA_PHYS = { rest: 0.93, ifr: 0.91, ffr: 0.85 };

function Assessment() {
  const { answers, answer } = useCase();
  const read = answers['s5-reads'] || {};
  const pre = useMemo(() => ivusProfile('pre'), []);
  return (
    <>
      <div className="cs-h2" style={{ marginTop: 0 }}>A · The mid RCA (non-culprit): pressure wire</div>
      <p className="cs-p">A 0.014″ pressure wire through a JR4 guide. Equalise at the guide tip, cross the lesion, measure at rest, then induce hyperaemia with IV adenosine.</p>
      <PressureWire lesion={RCA_PHYS} onReading={v => answer('s5-reads', { ...read, ...v })} />
      <Decision id="s5-rca" question={`iFR ${RCA_PHYS.ifr.toFixed(2)}, FFR ${RCA_PHYS.ffr.toFixed(2)}. What do you do with the RCA?`}
        options={[
          { id: 'defer', label: 'Defer: not flow-limiting — optimal medical therapy', verdict: 'best', points: 10,
            why: 'FFR > 0.80 and iFR > 0.89 are both above their ischaemic thresholds. Deferral on physiology is safe (DEFER, FAME; DEFINE-FLAIR and iFR-SWEDEHEART for iFR).' },
          { id: 'stent', label: 'Stent it — it looked 70%', verdict: 'wrong', points: 0, why: 'Treating a lesion that is not ischaemic adds stent risk without benefit.' },
          { id: 'stage', label: 'Plan staged PCI in six weeks', verdict: 'wrong', points: 2, why: 'There is nothing to stage — the lesion is physiologically non-significant.' },
        ]} />
      <Note kind="warn" title="Not on the culprit">
        Do not use FFR to judge the culprit lesion in ACS. Microvascular dysfunction in the infarct territory blunts hyperaemia, so FFR can look falsely reassuring; and a ruptured plaque is treated for what it is, not for its gradient.
      </Note>
      <Why title="Why FFR needs adenosine"
        chain={[
          { k: 'REST', t: 'At rest the arterioles autoregulate — they dilate to keep flow normal despite the narrowing.' },
          { k: 'HIDDEN', t: 'So the resting gradient is small and misleading: the reserve is being spent invisibly.' },
          { k: 'HYPERAEMIA', t: 'Adenosine dilates the arterioles fully; resistance becomes minimal and fixed.' },
          { k: 'RATIO', t: 'With resistance fixed, pressure tracks flow: Pd/Pa is the fraction of normal maximal flow the artery can deliver.' },
        ]}>
        The same logic explains the trap on the culprit: stunned, embolised microvessels <b>cannot</b> dilate, so flow cannot rise, the gradient stays small — and a lethal lesion looks innocent.
      </Why>
      <Contrast title="FFR is not iFR"
        is={{ h: 'FFR — hyperaemic', points: [
          'Needs adenosine to abolish microvascular resistance.',
          'Ischaemic at ≤ 0.80.',
          'Side effects: chest tightness, flushing, transient AV block.',
        ] }}
        isnt={{ h: 'iFR — resting, wave-free', points: [
          'No drug: measured in the diastolic window where resistance is naturally low and stable.',
          'Ischaemic at ≤ 0.89 — a different scale, not a worse FFR.',
          'Faster, and non-inferior for deferral decisions (DEFINE-FLAIR, iFR-SWEDEHEART).',
        ] }} />

      <div className="cs-h2">B · The LAD (culprit): IVUS before treatment</div>
      <p className="cs-p">A 60 MHz IVUS catheter on a workhorse wire, pulled back at 1 mm/s from the distal LAD to the left main. Drag along the longitudinal view, or jump to the landmarks.</p>
      <IVUS profile={pre} length={60} marks={IVUS_MARKS.pre} title="LAD · pre-intervention pullback" />
      <Table head={['Landmark', 'Lumen', 'EEM', 'Plaque burden']} rows={[
        ['Distal reference (8 mm)', N('7.5 mm² · Ø 3.1 mm'), N('10.2 mm² · Ø 3.6 mm'), N('26%')],
        ['MLA (25 mm)', N('1.9 mm²', 'cs-hi'), N('— shadowed'), N('—')],
        ['Proximal reference (47 mm)', N('10.2 mm² · Ø 3.6 mm'), N('13.2 mm² · Ø 4.1 mm'), N('23%')],
        ['Lesion length, normal to normal', N('28 mm'), '', ''],
        ['Calcium', N('360° over 16 mm, superficial'), '', ''],
      ]} />

      <MultiSelect id="s5-ivus" question="Which IVUS calcium features predict stent underexpansion here?"
        items={[
          { id: '270', label: 'Superficial calcium arc > 270° over > 5 mm', correct: true, why: 'One point in the IVUS calcium score.' },
          { id: '360', label: '360° superficial calcium', correct: true, why: 'A second point: a complete ring will not yield to a balloon.' },
          { id: 'nod', label: 'Calcified nodule', correct: false, why: 'None seen in this pullback.' },
          { id: 'small', label: 'Vessel diameter < 3.5 mm', correct: false, why: 'The vessel is 3.6–4.1 mm by EEM.' },
          { id: 'rev', label: 'Reverberations behind the calcium (suggesting it is thin)', correct: false, why: 'Reverberations suggest thinner calcium that is easier to crack — this does not add to underexpansion risk.' },
        ]}>
        <p className="cs-pts" style={{ marginBottom: 8 }}>IVUS calcium score: 1 point each for arc > 270° over > 5 mm, 360° calcium, a calcified nodule, and vessel Ø &lt; 3.5 mm. A score of 2 or more predicts underexpansion.</p>
      </MultiSelect>

      <Decision id="s5-prep" question="IVUS calcium score is 2. Does this lesion need dedicated calcium modification before stenting?"
        options={[
          { id: 'yes', label: 'Yes — plaque modification is needed before any stent', verdict: 'best', points: 10,
            why: 'Score ≥ 2 predicts stent underexpansion — the strongest predictor of stent thrombosis and restenosis. You cannot fix an underexpanded stent in a calcium ring afterwards.' },
          { id: 'nc', label: 'Probably not — a high-pressure NC balloon is enough', verdict: 'ok', points: 3,
            why: 'An NC balloon may suffice for less calcium. Use it as a test: if it does not fully expand, the calcium wins.' },
          { id: 'no', label: 'No — modern stents expand well', verdict: 'wrong', points: 0, why: 'Not against 360° calcium.' },
        ]} />
      <Note kind="pearl" title="OCT would add thickness">
        OCT sees through calcium and measures thickness. Its calcium score is arc &gt; 180° (2 points), thickness &gt; 0.5 mm (1), length &gt; 5 mm (1). A score of 4 means modify before stenting.
      </Note>

      <div className="cs-media-row">
        <Video id="kml6OuZaMX8" title="What is FFR or iFR? How does it work?" />
        <Video id="UC3NokObF88" title="IVUS Basics — School of Rock, part 3" />
      </div>
    </>
  );
}

/* ============================================================
   6 · STRATEGY & DECISION POINT
   ============================================================ */

function Strategy() {
  const { answers } = useCase();
  const prep = answers['s6-prep'];
  const consequence = {
    direct: 'You deploy a 3.5 × 32 mm DES at 16 atm. Repeat IVUS: minimal stent area 3.9 mm² — 52% of the distal reference. The stent has stopped against the calcium ring. You now have an underexpanded stent in a calcified vessel: very high-pressure NC balloons, and lithotripsy inside the stent off-label, are the only rescues left. This is the complication the planning was meant to prevent.',
    poba: 'Plain balloon angioplasty of a calcified culprit leaves dissection and recoil without a scaffold, and restenosis rates belong to the 1990s. A drug-eluting stent is the default for this lesion.',
    two: 'A planned two-stent technique for a Medina 1,1,0 lesion with a healthy side-branch ostium adds metal, time, contrast and complexity without benefit.',
    asp: 'Routine thrombus aspiration did not improve outcomes (TASTE, TOTAL) and the TOTAL trial showed more strokes. There is no large thrombus burden here.',
    cabg: 'Single-vessel LAD disease with a non-significant RCA and a low SYNTAX score — PCI is appropriate. Surgery is not required, though it is the backup for complications.',
  }[prep];
  return (
    <>
      <p className="cs-p">The picture: an ACS culprit in the proximal–mid LAD, 360° superficial calcium (IVUS calcium score 2), a Medina 1,1,0 bifurcation with a 2.5 mm first diagonal whose ostium is healthy, a non-ischaemic RCA, and a contrast budget already {`≈`}25% spent.</p>
      <Why title="Why calcium kills stents"
        chain={[
          { k: 'RING', t: '360° calcium is a rigid ring — a pipe, not a wall.' },
          { k: 'PHYSICS', t: 'Balloon force goes where resistance is least: the soft ends bulge (dog-bone), the ring holds.' },
          { k: 'UNDEREXPANSION', t: 'The stent is crimped to whatever the ring allows.' },
          { k: 'FAILURE', t: 'Small area → high shear, platelet activation, exposed struts → thrombosis and restenosis.' },
        ]}>
        Every calcium tool works the same way at heart: <b>break the ring first</b>. Once fractured, the ring becomes a hinge and the balloon can open it.
      </Why>
      <Contrast title="lithotripsy is not atherectomy"
        is={{ h: 'Intravascular lithotripsy (IVL)', points: [
          'Sonic pressure waves crack calcium — deep and superficial — through a balloon at 4 atm.',
          'Sized 1:1 to the vessel; both branch wires stay in.',
          'Little debris, little slow-flow.',
          'Needs the balloon to cross the lesion.',
        ] }}
        isnt={{ h: 'Rotational atherectomy', points: [
          'A diamond burr grinds superficial calcium into microparticles.',
          'Needs its own wire; the side-branch wire comes out.',
          'Cannot reach deep calcium; debris can cause slow-flow and no-reflow.',
          'Essential when nothing else will cross.',
        ] }} />
      <Decision id="s6-prep" question="How do you treat the LAD lesion?"
        options={[
          { id: 'ivl', label: 'Intravascular lithotripsy (IVL), then a drug-eluting stent — provisional bifurcation strategy with a wire in D1 and POT', verdict: 'best', points: 10,
            why: 'IVL fractures deep and superficial concentric calcium with sonic pressure waves, through a balloon sized 1:1 to the vessel. It is simple, does not depend on wire bias, and suits a 360° ring well.' },
          { id: 'ra', label: 'Rotational atherectomy, then a drug-eluting stent — provisional with POT', verdict: 'ok', points: 8,
            why: 'Excellent for superficial calcium and essential when nothing will cross. A steeper learning curve, more slow-flow and perforation risk, and the D1 wire must come out during burr runs.' },
          { id: 'nc', label: 'High-pressure NC balloon predilation, then a drug-eluting stent', verdict: 'ok', points: 4,
            why: 'Reasonable as a test for lesser calcium. Against a 360° ring, expect dog-boning — the balloon expands at its ends but not in the middle.' },
          { id: 'direct', label: 'Direct stenting with a 3.5 mm drug-eluting stent', verdict: 'wrong', points: 0, why: 'Skips the preparation that 360° calcium demands.' },
          { id: 'poba', label: 'Plain balloon angioplasty alone', verdict: 'wrong', points: 0, why: 'No scaffold, high restenosis.' },
          { id: 'two', label: 'Planned two-stent technique (DK-crush)', verdict: 'wrong', points: 1, why: 'Not for a 1,1,0 lesion with a healthy side-branch ostium.' },
          { id: 'asp', label: 'Thrombus aspiration first', verdict: 'wrong', points: 0, why: 'No routine role, and no large thrombus.' },
          { id: 'cabg', label: 'Stop and refer for CABG', verdict: 'wrong', points: 1, why: 'Single-vessel disease suitable for PCI.' },
        ]} />
      {consequence && <Note kind={['ivl', 'ra', 'nc'].includes(prep) ? 'pearl' : 'warn'} title="What happens next">{consequence}</Note>}
      {['direct', 'poba', 'two', 'asp', 'cabg'].includes(prep) && (
        <p className="cs-p">Your choice is scored. For the rest of the case the team proceeds with <b>lithotripsy-prepared provisional stenting</b>, the strategy the anatomy calls for, so you can see it through.</p>
      )}

      <Decision id="s6-bif" question="Bifurcation strategy for the LAD/D1?"
        options={[
          { id: 'prov', label: 'Provisional: stent the LAD across D1, keep a protection wire in D1, POT, and treat D1 only if it is compromised', verdict: 'best', points: 10,
            why: 'The European Bifurcation Club default for most bifurcations — and certainly for Medina 1,1,0 with a healthy side-branch ostium (EBC MAIN, Nordic trials).' },
          { id: 'noprot', label: 'Provisional, without a D1 wire', verdict: 'ok', points: 4,
            why: 'A 2.5 mm diagonal is worth protecting: if it closes, a jailed wire is your route back in and a marker of where it was.' },
          { id: 'cul', label: 'Culotte', verdict: 'wrong', points: 0, why: 'A two-stent technique for true bifurcations with similar-sized branches.' },
          { id: 'dk', label: 'DK-crush', verdict: 'wrong', points: 1, why: 'For complex true bifurcations (DEFINITION criteria) — not this one.' },
        ]} />
      <Note kind="evid" title="When a planned two-stent strategy is right">
        True bifurcations (Medina 1,1,1 / 0,1,1 / 1,0,1) where the side branch is large and its disease long — DEFINITION criteria: side-branch lesion ≥ 10 mm, or other complex features. DKCRUSH-V supports DK-crush for complex left main bifurcations.
      </Note>
    </>
  );
}

/* ============================================================
   7 · INTERVENTION — STEP BY STEP
   ============================================================ */

const DES_35 = [[8, 3.28], [10, 3.42], [11, 3.5], [12, 3.55], [14, 3.64], [16, 3.73], [18, 3.8]];
const NC_30 = [[8, 2.86], [10, 2.92], [12, 3.0], [14, 3.05], [16, 3.1], [18, 3.14], [20, 3.18], [22, 3.21]];
const NC_40 = [[8, 3.82], [10, 3.9], [12, 4.0], [14, 4.06], [16, 4.12], [18, 4.17], [20, 4.21]];

function devicesFor(step, extra = {}) {
  const d = { wires: [], label: 'PCI · EBU 3.5 6F' };
  if (step >= 1) d.wires = [{ vessel: 'LAD', to: 0.95 }, { vessel: 'D1', to: 0.8 }];
  if (extra.balloon) d.balloon = extra.balloon;
  if (step >= 5) {
    d.stents = [{ vessel: 'LAD', t0: STENT.t0, t1: STENT.t1, d: 3.5 }];
    d.lesions = { LAD: [{ t0: 0.22, t1: 0.32, sev: 0.12 }] };
  } else if (step >= 2) {
    d.lesions = { LAD: [{ ...LAD_LESION, sev: 0.55, calcified: true }] };
  }
  return d;
}

function Intervention() {
  const { answers, answer, bump, atLeastClock } = useCase();
  const step = answers['s7'] ?? 0;
  const prep = answers['s6-prep'] === 'ra' ? 'ra' : 'ivl';
  const [balloon, setBalloon] = useState(null);
  const pulses = answers['s7-pulses'] || 0;
  const prepped = useMemo(() => ivusProfile('prep'), []);
  const devices = devicesFor(step, { balloon });
  useEffect(() => { atLeastClock(min(10, 15) + step * 4); }, [step]);  // eslint-disable-line

  return (
    <>
      {/* the fluoroscopy stays in view while you work — on screens tall enough to hold both */}
      <div className="cs-sticky">
        <Angio tree={TREE} presets={VIEWS.filter(v => v.system === 'left')} systems={['left']} devices={devices} height={300} startView="lao-cra" />
      </div>
      <Steps id="s7">
        <Step title="Wire the LAD and protect D1">
          {({ done }) => (
            <>
              <Decision id="s7-wire" question="Which wire for the LAD?"
                options={[
                  { id: 'work', label: 'A workhorse, non-polymer-jacketed 0.014″ wire (Sion Blue, Runthrough type)', verdict: 'best', points: 10,
                    why: 'Good torque and tip control, low distal-perforation risk — the right first choice for a non-occlusive lesion.' },
                  { id: 'poly', label: 'A polymer-jacketed hydrophilic wire (Fielder FC type)', verdict: 'ok', points: 5,
                    why: 'Useful for tortuosity or to cross a tight lesion, but slips silently into small branches and causes distal perforations — park it carefully if used.' },
                  { id: 'stiff', label: 'A stiff tapered CTO wire (Confianza type)', verdict: 'wrong', points: 0, why: 'A penetration wire for occlusions: high perforation risk in a patent vessel.' },
                ]} />
              {answers['s7-wire'] && (
                <>
                  <p className="cs-p">Wire to the distal LAD; a second workhorse wire into D1 for protection. Both are visible on the angiogram above.</p>
                  {step === 0 && <button className="cs-btn primary" onClick={() => { bump({ fluoro: 90, kerma: 22 }); done(); }}>Wires in position — next</button>}
                </>
              )}
            </>
          )}
        </Step>

        <Step title={prep === 'ivl' ? 'Prepare the lesion: intravascular lithotripsy' : 'Prepare the lesion: rotational atherectomy'}>
          {({ done }) => prep === 'ivl' ? (
            <>
              <Decision id="s7-ivlsize" question="IVL balloon size? (distal reference lumen Ø 3.1 mm, EEM Ø 3.6 mm; proximal lumen Ø 3.6 mm)"
                options={[
                  { id: '35', label: '3.5 × 12 mm', verdict: 'best', points: 10, why: 'IVL balloons are sized 1:1 to the reference vessel diameter, so the emitters sit against the calcium.' },
                  { id: '30', label: '3.0 × 12 mm', verdict: 'ok', points: 5, why: 'Undersized for the proximal segment: less contact, less energy into the calcium.' },
                  { id: '40', label: '4.0 × 12 mm', verdict: 'wrong', points: 0, why: 'Oversized for the distal lesion — dissection risk.' },
                ]} />
              {answers['s7-ivlsize'] && (
                <div className="cs-card tight">
                  <p className="cs-p">Inflate to 4 atm, deliver a cycle of 10 pulses (1 per second), deflate to restore flow, then reposition and repeat — three overlapping positions across the 28 mm lesion. Then dilate to 6 atm.</p>
                  <div className="cs-row">
                    <button className="cs-btn primary" disabled={pulses >= 80} onClick={() => {
                      answer('s7-pulses', pulses + 10);
                      bump({ fluoro: 25, kerma: 6 });
                      setBalloon({ vessel: 'LAD', t0: 0.14 + Math.floor(pulses / 30) * 0.08, t1: 0.26 + Math.floor(pulses / 30) * 0.08, inflated: 3.4 });
                      setTimeout(() => setBalloon(b => b && { ...b, inflated: 0 }), 1600);
                    }}>Deliver cycle — 10 pulses at 4 atm</button>
                    <span className="cs-mono" style={{ color: 'var(--amber)' }}>{pulses} / 80 pulses</span>
                    <span className="cs-pts">position {Math.min(3, Math.floor(pulses / 30) + 1)} of 3</span>
                  </div>
                  {pulses >= 80 && (
                    <>
                      <p className="cs-p" style={{ marginTop: 10 }}>Repeat IVUS after lithotripsy and a 6 atm dilation:</p>
                      <IVUS profile={prepped} length={60} marks={IVUS_MARKS.pre} title="LAD · after IVL" />
                      <p className="cs-p">Three calcium fractures in the ring; MLA up from 1.9 to 4.6 mm². The calcium will now yield.</p>
                      {step === 1 && <button className="cs-btn primary" onClick={() => { setBalloon(null); done(); }}>Lesion prepared — next</button>}
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <Decision id="s7-burr" question="Burr size for rotational atherectomy in a ~3.1–3.6 mm vessel?"
                options={[
                  { id: '15', label: '1.5 mm burr (burr-to-artery ratio ~0.4–0.5)', verdict: 'best', points: 10, why: 'Modern practice favours a conservative ratio of 0.4–0.6, to modify the calcium rather than debulk it.' },
                  { id: '125', label: '1.25 mm burr', verdict: 'ok', points: 6, why: 'Safe, and a reasonable start in a tight lesion; you may need to step up.' },
                  { id: '20', label: '2.0 mm burr', verdict: 'wrong', points: 0, why: 'An aggressive ratio: more slow-flow and perforation.' },
                ]} />
              {answers['s7-burr'] && (
                <>
                  <Note kind="pearl" title="How the runs are done">Swap to the RotaWire and remove the D1 wire. Run at 140–180,000 rpm in short (&lt; 20 s) pecking runs. Avoid decelerations over 5,000 rpm; flush continuously with cocktail. Re-wire D1 afterwards.</Note>
                  <IVUS profile={prepped} length={60} marks={IVUS_MARKS.pre} title="LAD · after atherectomy" />
                  {step === 1 && <button className="cs-btn primary" onClick={() => { bump({ fluoro: 240, kerma: 40, contrast: 6 }); done(); }}>Lesion prepared — next</button>}
                </>
              )}
            </>
          )}
        </Step>

        <Step title="Predilate with a non-compliant balloon">
          {({ done }) => (
            <>
              <p className="cs-p">A 3.0 × 15 mm NC balloon across the prepared segment. Inflate slowly and watch it: full expansion with no waist means the lesion is ready for a stent.</p>
              <Inflator label="NC 3.0 × 15 mm (nominal 12, RBP 20 atm)" compliance={NC_30} nominal={12} rbp={20}
                onDeflate={(peak) => {
                  answer('s7-predil', peak);
                  bump({ fluoro: 30, kerma: 8, contrast: 5 });
                }} />
              {answers['s7-predil'] != null && (
                <div className={'cs-fb ' + (answers['s7-predil'] >= 14 && answers['s7-predil'] <= 20 ? 'best' : 'ok')}>
                  Peak {answers['s7-predil'].toFixed(1)} atm. {answers['s7-predil'] >= 14
                    ? 'The balloon expands fully at high pressure — no dog-bone. The lesion is ready.'
                    : 'Not enough pressure to prove the lesion is prepared. In practice you would take it to 14–18 atm.'}
                </div>
              )}
              <ScoreOnce id="s7-predil" pts={answers['s7-predil'] == null ? null : answers['s7-predil'] >= 14 && answers['s7-predil'] <= 20 ? 10 : answers['s7-predil'] > 20 ? 2 : 5} max={10} />
              {answers['s7-predil'] != null && step === 2 && <button className="cs-btn primary" style={{ marginTop: 10 }} onClick={done}>Next — choose the stent</button>}
            </>
          )}
        </Step>

        <Step title="Choose the stent: diameter and length">
          {({ done }) => (
            <>
              <Table head={['IVUS', 'Distal reference', 'Proximal reference']} rows={[
                ['Lumen', N('7.5 mm² · Ø 3.1'), N('10.2 mm² · Ø 3.6')],
                ['EEM', N('10.2 mm² · Ø 3.6'), N('13.2 mm² · Ø 4.1')],
                ['Lesion length (normal → normal)', N('28 mm'), ''],
              ]} />
              <Decision id="s7-dia" question="Stent diameter?"
                options={[
                  { id: '35', label: '3.5 mm', verdict: 'best', points: 10, why: 'Sized to the distal reference: EEM 3.6 rounded down (3.5), or lumen 3.1 rounded up 0.25–0.5 (3.35–3.6). Both point to 3.5. The proximal segment gets a larger balloon at POT.' },
                  { id: '30', label: '3.0 mm', verdict: 'wrong', points: 2, why: 'Undersized by every measure: malapposition and small final area.' },
                  { id: '325', label: '3.25 mm', verdict: 'ok', points: 6, why: 'Lumen-based sizing without the round-up — acceptable, but leaves area on the table.' },
                  { id: '40', label: '4.0 mm', verdict: 'wrong', points: 0, why: 'Sized to the proximal vessel: overstretches the distal LAD — dissection and perforation risk.' },
                ]} />
              <Decision id="s7-len" question="Stent length?"
                options={[
                  { id: '32', label: '32 mm', verdict: 'best', points: 10, why: 'Covers the 28 mm lesion with a couple of millimetres of healthy landing zone each side — edges in segments with plaque burden < 50%.' },
                  { id: '24', label: '24 mm', verdict: 'wrong', points: 0, why: 'Leaves disease uncovered — geographic miss and edge restenosis.' },
                  { id: '38', label: '38 mm', verdict: 'ok', points: 5, why: 'Covers everything, but more metal than needed; extra length raises restenosis and thrombosis risk.' },
                ]} />
              {answers['s7-dia'] && answers['s7-len'] && step === 3 && <button className="cs-btn primary" onClick={done}>Load the 3.5 × 32 mm DES — next</button>}
            </>
          )}
        </Step>

        <Step title="Deploy the stent">
          {({ done }) => (
            <>
              <p className="cs-p">The stent is positioned in the LAO cranial view, distal marker 2 mm beyond the lesion, proximal marker short of the left main. Inflate slowly — about 2 atm every few seconds — and hold 15–20 seconds at deployment pressure. Watch the patient: ST elevation and pain while the balloon is up are expected.</p>
              <Inflator label="DES 3.5 × 32 mm (nominal 11, RBP 16 atm)" compliance={DES_35} nominal={11} rbp={16}
                onDeflate={(peak, dia) => { answer('s7-deploy', peak); setBalloon(null); bump({ fluoro: 40, kerma: 12, contrast: 6 }); }}
              />
              {answers['s7-deploy'] != null && (() => {
                const p = answers['s7-deploy'];
                const v = p >= 12 && p <= 16 ? 'best' : p >= 10 && p < 12 ? 'ok' : 'wrong';
                return (
                  <div className={'cs-fb ' + v}>
                    Deployed at {p.toFixed(1)} atm → Ø ≈ {(DES_35.find(([a]) => a >= p)?.[1] || 3.8).toFixed(2)} mm. {v === 'best'
                      ? 'Good: deployment between nominal and rated burst pressure gives near-nominal diameter without overstretching.'
                      : v === 'ok' ? 'At or just above nominal — acceptable, but in a calcified segment expect to post-dilate.'
                      : p > 16 ? 'Above rated burst pressure: balloon rupture and edge dissection risk. High pressure belongs to a non-compliant balloon, not the stent balloon.'
                      : 'Below nominal: the stent will be underexpanded.'}
                  </div>
                );
              })()}
              <ScoreOnce id="s7-deploy" pts={answers['s7-deploy'] == null ? null : answers['s7-deploy'] >= 12 && answers['s7-deploy'] <= 16 ? 10 : answers['s7-deploy'] >= 10 && answers['s7-deploy'] < 12 ? 6 : 0} max={10} />
              {answers['s7-deploy'] != null && step === 4 && <button className="cs-btn primary" style={{ marginTop: 10 }} onClick={done}>Stent deployed — next</button>}
            </>
          )}
        </Step>

        <Step title="Proximal optimisation technique (POT)">
          {({ done }) => (
            <>
              <Decision id="s7-pot" question="POT balloon and position?"
                options={[
                  { id: 'best', label: '4.0 × 8 mm NC, distal marker just proximal to the carina, ~14–16 atm', verdict: 'best', points: 10,
                    why: 'POT restores the proximal main vessel’s natural diameter (proximal reference Ø 3.6–4.1 mm), apposes the struts there, and opens the cell facing D1. The balloon must stop proximal to the carina.' },
                  { id: 'carina', label: '4.0 mm NC straddling the carina', verdict: 'wrong', points: 2, why: 'Overdilates the distal main vessel and pushes the carina into the side branch.' },
                  { id: 'small', label: '3.5 mm NC proximal to the carina', verdict: 'ok', points: 4, why: 'Right position, but sized to the stent rather than the proximal vessel — it will not fully appose the proximal struts.' },
                  { id: 'lm', label: '4.5 mm NC up into the left main', verdict: 'wrong', points: 0, why: 'Outside the stent and into the left main: dissection risk.' },
                ]} />
              {answers['s7-pot'] && (
                <>
                  <Inflator label="NC 4.0 × 8 mm (nominal 12, RBP 20 atm)" compliance={NC_40} nominal={12} rbp={20}
                    onDeflate={() => { answer('s7-potdone', true); bump({ fluoro: 25, kerma: 7, contrast: 5 }); }} />
                  {answers['s7-potdone'] && step === 5 && <button className="cs-btn primary" style={{ marginTop: 10 }} onClick={done}>POT done — check the side branch</button>}
                </>
              )}
            </>
          )}
        </Step>

        <Step title="Assess the first diagonal">
          {({ done }) => (
            <>
              <p className="cs-p">The D1 has TIMI 3 flow, a mild ostial narrowing on the struts (~40% visually), no dissection, and the patient is pain-free.</p>
              <Decision id="s7-d1" question="What do you do with D1?"
                options={[
                  { id: 'leave', label: 'Leave it — TIMI 3, no dissection, no ischaemia. Remove the jailed wire.', verdict: 'best', points: 10,
                    why: 'In provisional stenting, side-branch treatment is for compromise: flow below TIMI 3, a significant dissection, ischaemia, or a large branch with severe narrowing (or FFR ≤ 0.80 if measured).' },
                  { id: 'kiss', label: 'Rewire through the distal cell and do a final kissing inflation', verdict: 'ok', points: 3,
                    why: 'Routine final kissing after provisional stenting did not improve outcomes (Nordic Bifurcation III) and can distort the stent. Keep it for a compromised side branch.' },
                  { id: 'tap', label: 'Stent D1 with a TAP technique', verdict: 'wrong', points: 0, why: 'A second stent for a branch that does not need it.' },
                ]} />
              {answers['s7-d1'] && step === 6 && <button className="cs-btn primary" onClick={() => { bump({ contrast: 6, kerma: 10, fluoro: 20 }); done(); }}>Procedure steps complete</button>}
            </>
          )}
        </Step>
      </Steps>

      <Why title="Why the ST rises while the balloon is up"
        chain={[
          { k: 'OCCLUSION', t: 'An inflated balloon is a deliberate, total occlusion.' },
          { k: 'TRANSMURAL', t: 'Within seconds the whole wall downstream is ischaemic, not only the subendocardium.' },
          { k: 'ECG', t: 'The injury current now points toward the surface leads → ST elevation, and chest pain.' },
          { k: 'RECOVERY', t: 'Deflate and it settles in seconds. If it does not — think dissection, thrombus, or a lost side branch.' },
        ]} />
      <Contrast title="POT vs kissing balloon"
        is={{ h: 'POT — proximal optimisation', points: [
          'One short NC balloon in the proximal main vessel, sized to the proximal reference.',
          'Restores the natural taper, apposes the proximal struts, opens the cell facing the side branch.',
          'Done in every provisional bifurcation.',
        ] }}
        isnt={{ h: 'Final kissing inflation', points: [
          'Two balloons at once, main vessel and side branch.',
          'For a compromised side branch only.',
          'Routine use ovalises the proximal stent and showed no benefit (Nordic Bifurcation III).',
        ] }} />

      <div className="cs-media-row" style={{ marginTop: 16 }}>
        <Video id="wfbZaHBBHto" title="Proximal optimisation technique (POT) in bifurcation stenting" />
        <Figure src={WIKI('Blausen_0034_Angioplasty_Stent_01.png')} href={WIKIPAGE('Blausen_0034_Angioplasty_Stent_01.png')} alt="Diagram of a balloon-expanded coronary stent" caption="Balloon-expandable stent: the balloon drives the struts into the wall, and the stent holds the result." credit="Blausen Medical, CC BY 3.0, Wikimedia Commons" />
      </div>
    </>
  );
}

/* ============================================================
   8 · RESULT ASSESSMENT & OPTIMISATION
   ============================================================ */

function Result() {
  const { answers } = useCase();
  const choice = answers['s8-opt'];
  const post = useMemo(() => ivusProfile('stent'), []);
  const after = useMemo(() => ivusProfile(choice === 'over' ? 'over' : 'opt'), [choice]);
  return (
    <>
      <Angio tree={TREE} presets={VIEWS.filter(v => v.system === 'left')} systems={['left']} height={300} startView="lao-cra"
        devices={{ wires: [{ vessel: 'LAD', to: 0.95 }], stents: [{ vessel: 'LAD', t0: STENT.t0, t1: STENT.t1, d: 3.5 }], lesions: { LAD: [{ t0: 0.24, t1: 0.3, sev: 0.06 }] }, label: 'final' }}
        caption="Final angiography: TIMI 3 in the LAD and D1, no visible residual stenosis, no angiographic edge dissection." />
      <p className="cs-p">The angiogram looks perfect. Angiography is a lumenogram, though — it cannot measure how well the stent has expanded against the calcium. IVUS can:</p>
      <IVUS profile={post} length={60} marks={IVUS_MARKS.post} title="LAD · after stent + POT" />
      <Table head={['Measure', 'Result', 'Target']} rows={[
        ['Minimal stent area (MSA)', N('5.2 mm² at 26.5 mm', 'cs-hi'), N('> 5.5 mm² (IVUS, non-LM)')],
        ['Expansion: MSA / distal reference lumen', N('69%', 'cs-hi'), N('> 80–90%')],
        ['Proximal segment after POT', N('10.4 mm², apposed'), N('apposed')],
        ['Edges', N('plaque burden 38%, no dissection'), N('< 50%; no dissection > 60° or into the media')],
      ]} />

      <MultiSelect id="s8-criteria" question="Which IVUS optimisation criteria does this result fail?"
        items={[
          { id: 'msa', label: 'Minimal stent area above 5.5 mm²', correct: true, why: '5.2 mm² — just under.' },
          { id: 'exp', label: 'Expansion above 80–90% of the distal reference lumen', correct: true, why: '69% — clearly underexpanded in the calcified segment.' },
          { id: 'edge', label: 'No major edge dissection', correct: false, why: 'The edges are clean.' },
          { id: 'pb', label: 'Edge plaque burden below 50%', correct: false, why: '38% — good landing zones.' },
          { id: 'appos', label: 'Proximal apposition', correct: false, why: 'POT has apposed the proximal struts.' },
        ]}>
        <p className="cs-pts" style={{ marginBottom: 8 }}>Criteria in the style of ULTIMATE and RENOVATE-COMPLEX-PCI: MSA &gt; 5.5 mm² (or &gt; 90% of distal reference lumen), edge plaque burden &lt; 50%, no edge dissection involving the media &gt; 3 mm.</p>
      </MultiSelect>
      <Contrast title="an optimal stent vs a good-looking angiogram"
        is={{ h: 'An optimal stent (IVUS)', points: [
          'Minimal stent area > 5.5 mm², or > 90% of the distal reference.',
          'Struts apposed; edges in plaque burden < 50%; no major edge dissection.',
          'Predicts fewer stent thromboses and repeat procedures.',
        ] }}
        isnt={{ h: '“Angiographic success”', points: [
          '< 20% residual narrowing — judged by eye, on a lumenogram.',
          'Cannot see expansion, apposition, or a dissection hidden behind struts.',
          'The contrast fills the lumen beautifully, whatever the metal is doing.',
        ] }} />

      <Decision id="s8-opt" question="How do you optimise?"
        options={[
          { id: 'nc35', label: 'Post-dilate inside the stent with a 3.5 × 15 mm NC balloon at 20–22 atm, centred on the MSA', verdict: 'best', points: 10,
            why: 'A non-compliant balloon sized to the stent, taken to high pressure, inside the stent edges. It expands the stent without overstretching the vessel beyond it.' },
          { id: 'over', label: 'Post-dilate the mid-to-distal stent with a 4.0 mm NC at 20 atm', verdict: 'wrong', points: 0,
            why: 'Oversized for a vessel whose distal EEM is 3.6 mm. Oversizing and high pressure in calcium are the classic set-up for rupture.' },
          { id: 'accept', label: 'Accept: the angiogram is perfect', verdict: 'wrong', points: 0, why: 'Underexpansion is the strongest predictor of stent thrombosis and restenosis — invisible on angiography, visible on IVUS.' },
          { id: 'restent', label: 'Implant a second stent inside the first', verdict: 'wrong', points: 0, why: 'Two layers of metal do not solve expansion; they make it worse.' },
        ]} />

      {choice && choice !== 'accept' && choice !== 'restent' && (
        <>
          <IVUS profile={after} length={60} marks={IVUS_MARKS.post} title={choice === 'over' ? 'LAD · after 4.0 NC at 20 atm' : 'LAD · after 3.5 NC at 22 atm'} />
          <p className="cs-p">{choice === 'over'
            ? 'MSA 7.4 mm², but there is an echolucent gap behind the struts at 26 mm.'
            : 'MSA 6.9 mm² — 92% of the distal reference. Expansion criteria met.'} A final contrast run is taken to close…</p>
          <Note kind="warn" title="The final run">The monitor alarms before the run has washed out. Continue to the next stage.</Note>
        </>
      )}
      <Video id="K9whm-jZd0U" title="Role of intravascular ultrasound (IVUS) in coronary stenting" />
    </>
  );
}

/* ============================================================
   9 · COMPLICATION RECOGNITION & MANAGEMENT
   ============================================================ */

function Complication() {
  const { answers, answer, setVitals, bump, advanceClock } = useCase();
  // sealed once any first action is taken: if it was not the balloon, the senior inflates it
  const sealed = !!answers['s9-first'];
  const tapped = !!answers['s9-tap'];
  const covered = !!answers['s9-covered'];
  const startedAt = useRef(performance.now());
  const [elapsed, setElapsed] = useState(0);

  // untreated, the pressure keeps falling
  useEffect(() => {
    const id = setInterval(() => {
      const s = Math.round((performance.now() - startedAt.current) / 1000);
      setElapsed(s);
      if (!sealed) setVitals({ sys: Math.max(64, 98 - s * 1.4), dia: Math.max(40, 60 - s * 0.8), hr: Math.min(132, 112 + s * 0.6) });
    }, 1000);
    return () => clearInterval(id);
  }, [sealed]);   // eslint-disable-line

  const devices = {
    wires: [{ vessel: 'LAD', to: 0.95 }],
    stents: [{ vessel: 'LAD', t0: STENT.t0, t1: STENT.t1, d: 3.5 }, ...(covered ? [{ vessel: 'LAD', t0: PERF_AT - 0.06, t1: PERF_AT + 0.06, d: 3.5, covered: true }] : [])],
    lesions: { LAD: [] },
    perforation: { vessel: 'LAD', t: PERF_AT, sealed: sealed || covered },
    balloon: sealed && !covered ? { vessel: 'LAD', t0: PERF_AT - 0.04, t1: PERF_AT + 0.04, inflated: 3.4 } : undefined,
    label: covered ? 'after covered stent' : sealed ? 'balloon tamponade' : 'final run',
  };

  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>10:49</span>
          The patient says he feels unwell and has a tight chest. Heart rate climbing, arterial pressure falling. The final run is on the screen.
          {!sealed && <b className="cs-alarm" style={{ marginLeft: 8 }}>{elapsed}s since recognition</b>}
        </p>
      </div>
      <BedsideMonitor />
      <Angio tree={TREE} presets={VIEWS.filter(v => v.system === 'left')} systems={['left']} devices={devices} height={320} startView="lao-cra" />

      <Decision id="s9-what" question="What is happening?"
        options={[
          { id: 'perf', label: 'Coronary perforation with contrast streaming out of the LAD', verdict: 'best', points: 10, why: 'A jet of contrast leaving the vessel at the site of the high-pressure inflation, then pooling around the heart.' },
          { id: 'noreflow', label: 'No-reflow', verdict: 'wrong', points: 0, why: 'No-reflow is slow or absent distal flow with no extravasation.' },
          { id: 'st', label: 'Acute stent thrombosis', verdict: 'wrong', points: 0, why: 'The vessel is patent; contrast is leaving it, not stopping in it.' },
          { id: 'vaso', label: 'Vasovagal reaction', verdict: 'wrong', points: 0, why: 'Vagal reactions slow the heart; he is tachycardic.' },
        ]} />

      <Decision id="s9-ellis" question="Ellis classification?"
        options={[
          { id: '1', label: 'Type I — extraluminal crater without extravasation', verdict: 'wrong', points: 0 },
          { id: '2', label: 'Type II — pericardial or myocardial blush, no jet', verdict: 'wrong', points: 0 },
          { id: '3', label: 'Type III — frank streaming through an exit hole ≥ 1 mm', verdict: 'best', points: 10, why: 'A jet, not a blush: Ellis III carries the highest risk of tamponade and death.' },
          { id: 'cs', label: 'Type III cavity spilling — into a chamber or the coronary sinus', verdict: 'wrong', points: 0, why: 'This drains into the pericardium, not a chamber.' },
        ]} />

      <Decision id="s9-first" question="Your first action — in the next 10 seconds?"
        onAnswer={(o) => { if (o.id === 'balloon') { setVitals({ sys: 92, dia: 58, hr: 118 }); } else { setVitals({ sys: 88, dia: 56, hr: 124 }); } bump({ fluoro: 30 }); }}
        options={[
          { id: 'balloon', label: 'Inflate a balloon at the perforation (the 3.5 NC, at 4–6 atm) to seal it, and keep it up', verdict: 'best', points: 10,
            why: 'Stop the leak first: a balloon sized to the vessel, at low pressure, over the hole. Everything else is done around this balloon.' },
          { id: 'protamine', label: 'Give protamine to reverse the heparin', verdict: 'wrong', points: 2,
            why: 'Reversal does not stop an Ellis III jet, and it risks thrombosis on fresh stents and equipment in the coronary. It comes later, once the hole is controlled.' },
          { id: 'tap', label: 'Pericardiocentesis first', verdict: 'ok', points: 4,
            why: 'He will need it, but draining a pericardium that is still filling from an open artery is a losing race. Seal, then drain.' },
          { id: 'pull', label: 'Pull the wire out to stop the injury', verdict: 'wrong', points: 0, why: 'Never give up the wire: it is your only route to deliver a balloon or a covered stent.' },
        ]} />
      {answers['s9-first'] && answers['s9-first'] !== 'balloon' && (
        <Note kind="warn" title="Meanwhile">Pressure 70/42. The team inflates the NC balloon over the perforation on your senior’s call. Pressure rises to 88/56.</Note>
      )}

      {answers['s9-first'] && (
        <>
          <div className="cs-h2">Bedside echo, subcostal view</div>
          <Echo effusion={tapped ? 4 : 14} tamponade={!tapped} label={tapped ? 'After drainage: a small residual rim, the RV filling normally.' : 'New circumferential effusion, 14 mm, with RV free-wall collapse in early diastole.'} />
          <MultiSelect id="s9-signs" question="Which findings support cardiac tamponade?"
            items={[
              { id: 'rv', label: 'RV free-wall collapse in early diastole', correct: true, why: 'Specific: pericardial pressure exceeds RV diastolic pressure.' },
              { id: 'ivc', label: 'Plethoric IVC that does not collapse with inspiration', correct: true, why: 'High right atrial pressure — sensitive.' },
              { id: 'hypo', label: 'Hypotension with tachycardia', correct: true, why: 'Falling stroke volume, compensated by rate — then not.' },
              { id: 'pp', label: 'Pulsus paradoxus — systolic fall > 10 mmHg with inspiration', correct: true, why: 'Visible on the arterial trace.' },
              { id: 'brady', label: 'Bradycardia', correct: false, why: 'Tamponade drives tachycardia; bradycardia here would be pre-arrest.' },
            ]} />
          <MultiSelect id="s9-next" question="With the balloon up, what happens now, in parallel?"
            items={[
              { id: 'tap', label: 'Echo-guided pericardiocentesis (subxiphoid, pigtail drain)', correct: true, why: 'Relieves tamponade; the drain stays in for monitoring.' },
              { id: 'help', label: 'Call for senior help and alert cardiac surgery and theatre', correct: true, why: 'Covered-stent failure means surgery. Call early.' },
              { id: 'fluids', label: 'Fluids, crossmatch and blood products; vasopressor support for pressure', correct: true, why: 'Supportive while the leak is controlled.' },
              { id: 'act', label: 'No further heparin; check the ACT', correct: true, why: 'Do not add anticoagulant to a bleeding vessel.' },
              { id: 'second', label: 'Prepare a second arterial access and guide for a covered stent', correct: true, why: 'The block-and-deliver technique needs a second guide.' },
              { id: 'coils', label: 'Embolise the LAD with coils', correct: false, why: 'Coils and fat are for distal small-vessel perforations — not the proximal LAD.' },
              { id: 'deflate', label: 'Deflate every 30 seconds to see whether it has stopped', correct: false, why: 'Each deflation refills the pericardium. Keep deflations few and deliberate; tolerate the ischaemia briefly.' },
            ]} />
          {!tapped ? (
            <button className="cs-btn danger" onClick={() => { answer('s9-tap', true); setVitals({ sys: 112, dia: 68, hr: 104 }); advanceClock(6); }}>Perform pericardiocentesis</button>
          ) : (
            <div className="cs-fb best">220 mL of blood drained via a subxiphoid pigtail. Pressure 112/68, heart rate 104. The drain stays on free drainage.</div>
          )}
          <Contrast title="why 220 mL nearly killed him"
            is={{ h: 'Acute tamponade', points: [
              'The pericardium cannot stretch in minutes: its pressure–volume curve goes vertical after 100–200 mL.',
              'Hypotension, tachycardia, rising venous pressure — shock with a small effusion.',
              'Removing even 50 mL drops the pressure steeply: you are on the steep part of the curve.',
            ] }}
            isnt={{ h: 'A chronic effusion', points: [
              'Over weeks the pericardium stretches; litres can collect.',
              'The patient may walk into clinic breathless but standing.',
              'Same physics, different time. Speed of filling, not volume, kills.',
            ] }} />
        </>
      )}

      {tapped && (
        <>
          <Decision id="s9-def" question="Definitive treatment of this Ellis III perforation in the mid LAD?"
            options={[
              { id: 'cs', label: 'A covered stent across the perforation', verdict: 'best', points: 10,
                why: 'For a large-vessel perforation that persists after prolonged balloon inflation, a covered stent is the definitive percutaneous treatment. Here it sits distal to D1, so it does not jail the branch.' },
              { id: 'prolonged', label: 'Prolonged balloon inflation alone, for 10–15 minutes', verdict: 'ok', points: 4,
                why: 'Can seal small type II perforations and some type III. A free jet like this one usually needs covering.' },
              { id: 'coil', label: 'Coils or fat embolisation', verdict: 'wrong', points: 0, why: 'For distal wire perforations, where sacrificing the tip of a small vessel is acceptable.' },
              { id: 'surg', label: 'Straight to surgery', verdict: 'ok', points: 3, why: 'The backup if covered-stent delivery fails or bleeding continues — not first line when a covered stent can be delivered.' },
            ]} />
          <Sequence id="s9-bad" question="Block-and-deliver with two guides — put it in order."
            steps={[
              { label: 'Keep the balloon inflated over the perforation through guide 1', why: 'The leak stays controlled.' },
              { label: 'Second access (left radial or femoral) and a second guide engaged in the left coronary', why: 'Guide 2 carries the covered stent.' },
              { label: 'Briefly deflate, pass a wire from guide 2 beyond the perforation, re-inflate', why: 'One short deflation to cross.' },
              { label: 'Advance the covered stent from guide 2 to just proximal of the inflated balloon', why: 'Ready to go the moment the balloon comes down.' },
              { label: 'Deflate and withdraw the balloon; advance and deploy the covered stent across the hole', why: 'Speed matters in this step.' },
              { label: 'Post-dilate with an NC balloon, then angiography: no extravasation, TIMI 3', why: 'Covered stents need high pressure to appose well.' },
            ]} />
          {!covered ? (
            <button className="cs-btn primary" onClick={() => { answer('s9-covered', true); setVitals({ sys: 120, dia: 72, hr: 92 }); bump({ contrast: 12, fluoro: 300, kerma: 60 }); advanceClock(14); }}>Deploy the 3.5 × 15 mm covered stent</button>
          ) : (
            <div className="cs-fb best">Covered stent deployed at 16 atm and post-dilated with the 3.5 NC at 18 atm. No extravasation; TIMI 3 in the LAD and D1. Repeat echo at 15 minutes: no re-accumulation. Pressure 120/72.</div>
          )}
          <Note kind="pearl" title="Protamine">
            Once the perforation is sealed and the equipment is out of the coronary, consider partial or full heparin reversal, especially if the drain keeps producing. Protamine with equipment still in the vessel risks catastrophic thrombosis. Covered stents carry a higher thrombosis risk of their own — antiplatelet therapy cannot be stopped.
          </Note>
        </>
      )}

      <div className="cs-media-row">
        <Figure src={WIKI('Pericardial_effusion_with_tamponade_(cropped).gif')} href={WIKIPAGE('Pericardial_effusion_with_tamponade_(cropped).gif')} alt="Echocardiogram of a pericardial effusion with tamponade" caption="Real echo: a large pericardial effusion with tamponade physiology." credit="Wikimedia Commons (see file page for licence)" />
        <Video id="fV5UozhaGvY" title="Coronary perforation, part 3: management" />
      </div>
      <Video id="xTNQq8FJ7XY" title="Massive coronary perforation, coils, and pericardiogram" />
    </>
  );
}

/* ============================================================
   THE VICIOUS CYCLE — the why behind the why
   Three loops this patient lived through today. Understand the
   loop and the treatment stops being a list: each drug or act
   is a pair of scissors placed on one link.
   ============================================================ */

function Cycles() {
  return (
    <>
      <p className="cs-p">Students forget treatment lists. They do not forget a loop they understand. Each loop below feeds itself — every turn makes the next one worse. Tap each step; the green scissors mark where treatment cuts it.</p>

      <ViciousCycle id="cyc-tamp" title="The tamponade spiral — 10:49 in this lab"
        nodes={[
          { short: 'Blood in the sac', t: 'Arterial blood fills the pericardial sac', d: 'An Ellis III jet pumps blood into a sac that cannot stretch in minutes. After the first 100–150 mL, pericardial pressure climbs steeply.' },
          { short: 'RV cannot fill', t: 'The right heart cannot fill', d: 'When pericardial pressure exceeds RV diastolic pressure, the thin RV free wall collapses in diastole. Venous return cannot get in.' },
          { short: 'Output falls', t: 'Stroke volume and blood pressure fall', d: 'Less in, less out. On inspiration the RV takes what little room there is and the septum bows left — the LV fills even less: pulsus paradoxus.' },
          { short: 'Tachycardia', t: 'The body compensates: tachycardia and vasoconstriction', d: 'The baroreflex drives the rate up. But faster means shorter diastole — the only time the ventricles fill, and the only time the left ventricle is perfused.' },
          { short: 'Coronary flow falls', t: 'Coronary perfusion pressure collapses', d: 'Coronary perfusion ≈ aortic diastolic pressure − ventricular diastolic pressure. One is falling, the other has risen to match the pericardium: the gap closes.' },
          { short: 'Weaker heart', t: 'An ischaemic heart pumps less — and the jet keeps filling', d: 'Starved muscle contracts less, pressure falls further, perfusion falls further. The end of this loop is PEA arrest.' },
        ]}
        breaks={[
          { at: 0, t: 'Seal the hole: a balloon at low pressure over the perforation. No new blood enters — without this, everything else is bailing water.' },
          { at: 0, t: 'Covered stent: the definitive seal.' },
          { at: 1, t: 'Pericardiocentesis: on the steep part of the curve, removing 50–100 mL drops the pressure dramatically.' },
          { at: 2, t: 'Fluid bolus: raise filling pressure above pericardial pressure — a bridge, not a fix.' },
          { at: 3, t: 'Protect the compensation: no beta-blocker, and no casual intubation — positive pressure and sedation take away venous return and sympathetic drive, and can tip him into arrest.' },
          { at: 4, t: 'A vasopressor holds aortic diastolic pressure while the drain goes in.' },
        ]} />
      <Decision id="cyc-intub" question="Before the drain is in, he becomes agitated and a colleague proposes rapid-sequence intubation “to control the situation”. Why is that dangerous?"
        options={[
          { id: 'ppv', label: 'Positive-pressure ventilation and induction agents cut venous return and sympathetic tone — the only things holding his pressure up', verdict: 'best', points: 10,
            why: 'In tamponade the heart lives on high venous pressure and catecholamines. Induction removes the catecholamines; positive intrathoracic pressure removes the venous return. Arrest on induction is a classic catastrophe. Drain first, under local anaesthetic.' },
          { id: 'asp', label: 'Because he might aspirate', verdict: 'wrong', points: 0, why: 'A real but secondary risk — not why patients die on induction in tamponade.' },
          { id: 'fine', label: 'It is not dangerous: securing the airway always comes first', verdict: 'wrong', points: 0, why: 'ABC dogma, applied without the physiology, kills this patient.' },
        ]} />

      <ViciousCycle id="cyc-isch" title="The ischaemia spiral — why his pain came back at 08:50"
        nodes={[
          { short: 'Plaque ruptures', t: 'Plaque rupture and thrombus narrow the LAD', d: 'Supply falls. The thrombus is dynamic — platelets build it, the body lyses it — so flow flickers, and so does the ECG.' },
          { short: 'Ischaemia', t: 'The subendocardium becomes ischaemic', d: 'Pain, and a surge of catecholamines.' },
          { short: 'Demand rises', t: 'Tachycardia and hypertension raise oxygen demand', d: 'Heart rate 102, BP 152/90: more work, less diastole — less time to perfuse.' },
          { short: 'LVEDP rises', t: 'The ischaemic ventricle stiffens; its filling pressure rises', d: 'Subendocardial perfusion pressure = aortic diastolic − LV end-diastolic pressure. Raise the LVEDP and the inner layer is squeezed from inside.' },
          { short: 'Thrombus grows', t: 'More ischaemia, more platelet activation', d: 'Catecholamines and shear activate platelets; the thrombus grows; supply falls further.' },
        ]}
        breaks={[
          { at: 0, t: 'PCI restores the lumen — the definitive cut.' },
          { at: 4, t: 'Aspirin and heparin stop the thrombus growing (the P2Y12 inhibitor once the anatomy is known).' },
          { at: 1, t: 'Nitrates dilate the epicardial artery and veins; analgesia blunts the catecholamine surge.' },
          { at: 2, t: 'A beta-blocker slows the heart and lengthens diastole — if there is no heart failure or shock.' },
          { at: 3, t: 'Nitrate venodilation lowers preload → LVEDP falls → the subendocardium is perfused again.' },
        ]} />
      <Decision id="cyc-bb" question="The beta-blocker that breaks the ischaemia spiral would be dangerous in the tamponade spiral an hour later. What single idea explains both?"
        options={[
          { id: 'comp', label: 'Tachycardia is the problem in ischaemia (it raises demand) but the compensation in tamponade (it keeps output up when stroke volume is fixed)', verdict: 'best', points: 10,
            why: 'Same heart rate, opposite meaning. Cardiac output = stroke volume × rate. When stroke volume is capped by the pericardium, the rate is all that is left.' },
          { id: 'bp', label: 'Beta-blockers always drop blood pressure, so are always dangerous in a cath lab', verdict: 'wrong', points: 0, why: 'They are standard in ACS when the patient is not in failure or shock.' },
          { id: 'brady', label: 'Beta-blockers cause heart block during PCI', verdict: 'wrong', points: 0, why: 'Not the mechanism here.' },
        ]} />

      <ViciousCycle id="cyc-aki" title="The contrast–kidney spiral — why the budget matters"
        nodes={[
          { short: 'Contrast', t: 'Contrast reaches the kidney', d: 'Adenosine and endothelin release constrict the medullary vessels.' },
          { short: 'Medullary hypoxia', t: 'The outer medulla becomes hypoxic', d: 'Salt-pumping tubules with a marginal blood supply run out of oxygen first.' },
          { short: 'Tubular injury', t: 'Tubular cells are injured', d: 'Hypoxia plus direct toxicity: cells swell, slough and block their own tubules.' },
          { short: 'Slow flow', t: 'Tubular flow slows — contrast lingers', d: 'Concentrated, viscous contrast stays longer in contact with the tubules: more toxicity.' },
          { short: 'Low BP', t: 'Hypotension cuts renal blood flow further', d: 'His tamponade was a kidney insult too: a falling pressure on a kidney already starved.' },
        ]}
        breaks={[
          { at: 0, t: 'Less contrast: a ceiling set from the eGFR, small puffs, IVUS instead of extra runs.' },
          { at: 2, t: 'Isotonic hydration keeps tubular flow moving and dilutes the contrast.' },
          { at: 3, t: 'Avoid nephrotoxins (NSAIDs), hold metformin, avoid repeat contrast within 48–72 hours.' },
          { at: 4, t: 'Fix hypotension fast — the tamponade drain was also kidney protection.' },
        ]} />
    </>
  );
}

/* ============================================================
   M&M — WAR STORIES
   Composite cases, each built around one real, repeated
   mistake. Read the story, then answer what should have happened.
   ============================================================ */

function WarStories() {
  return (
    <>
      <p className="cs-p">Every rule in this case was written by someone who paid for it. These are composite morbidity-and-mortality cases — details changed, mechanisms real. Not to frighten. To make sure you never have to learn them the same way.</p>

      <WarStory title="The wire that came out"
        mistake="Giving up wire position in a perforation."
        burn="The wire is the patient’s lifeline. In a perforation, the wire is the last thing to leave the coronary.">
        <p className="cs-p">A 4.0 mm balloon at high pressure in a calcified mid-LAD. The final run shows a jet. The operator, frightened of making it worse, pulls the balloon <b>and the wire</b> back into the guide “to stop the damage”. Blood pressure falls to 60. Three attempts to re-cross the torn, bleeding segment fail — the wire keeps leaving the vessel. By the time the surgeon is scrubbed, the patient is in PEA.</p>
      </WarStory>
      <Decision id="mm-wire" question="Ellis III jet, pressure falling, the balloon is still on the wire. What is the first move?"
        options={[
          { id: 'inflate', label: 'Advance the balloon over the wire to the hole and inflate at low pressure — keep the wire exactly where it is', verdict: 'best', points: 10,
            why: 'The wire is your rail for the balloon, the covered stent, and every rescue that follows. Seal first.' },
          { id: 'pull', label: 'Withdraw the balloon and wire to stop further injury', verdict: 'wrong', points: 0, why: 'This is the mistake in the story. The injury is done; the wire is now the treatment.' },
          { id: 'prot', label: 'Give protamine immediately', verdict: 'wrong', points: 0, why: 'Does not stop a jet, and risks thrombus on the equipment in the vessel.' },
        ]} />

      <WarStory title="The perfect angiogram"
        mistake="Trusting a lumenogram, skipping calcium preparation and imaging."
        burn="Angiography shows the lumen, not the stent. Prepare calcium before the stent — underexpansion cannot be fixed afterwards.">
        <p className="cs-p">A 58-year-old with a heavily calcified proximal LAD. To save time and contrast, a 3.5 mm stent goes straight in at 14 atm. The final angiogram is beautiful. No imaging. Day six: anterior STEMI. OCT shows the stent crimped inside a 360° calcium ring — minimal stent area 3.1 mm², and thrombus filling what is left.</p>
      </WarStory>

      <WarStory title="Protamine with the gear still in"
        mistake="Reversing heparin while the balloon and wire were still in the coronary."
        burn="Seal mechanically first. Reverse only when the hardware is out. Protamine on equipment is a thrombus factory.">
        <p className="cs-p">A perforation is sealed with a balloon. Relieved, the team gives full-dose protamine — with the balloon, the wire and a freshly stented segment still in the LAD. Within minutes the guide fills with thrombus and the stent occludes. The patient goes into VF in a vessel that had been saved.</p>
      </WarStory>

      <WarStory title="The groin that bled into the back"
        mistake="A high femoral puncture in an anticoagulated patient — and tachycardia with back pain put down to anxiety."
        burn="Unexplained hypotension or back pain after femoral access is a retroperitoneal bleed until a CT says otherwise. Radial first.">
        <p className="cs-p">A 71-year-old woman on apixaban. The radial “looked small”, so the femoral was used — punctured above the inguinal ligament. Four hours later: heart rate 118, back pain, and a soft, unremarkable groin. “Anxious,” said the night note. The next haemoglobin was 78, down from 132. The CT showed a retroperitoneal haematoma. Transfusion, kidney injury, multi-organ failure.</p>
      </WarStory>
      <Decision id="mm-rp" question="Four hours after a femoral PCI: HR 118, BP 96/60, back pain, the groin is soft. What do you do?"
        options={[
          { id: 'ct', label: 'Treat it as a retroperitoneal bleed: urgent haemoglobin and crossmatch, fluids, stop anticoagulation, CT abdomen/pelvis, call vascular/interventional radiology', verdict: 'best', points: 10,
            why: 'The groin looks normal because the blood is going backwards, above the ligament, into a space that holds litres.' },
          { id: 'reassure', label: 'Reassure: the groin is soft, so it is not a bleed', verdict: 'wrong', points: 0, why: 'This is the mistake in the story. A soft groin does not exclude a retroperitoneal bleed.' },
          { id: 'ecg', label: 'ECG and troponin first — it is probably ischaemia', verdict: 'ok', points: 2, why: 'Worth doing, but tachycardia + hypotension + back pain after femoral access is bleeding until proven otherwise.' },
        ]} />

      <WarStory title="Two hundred more millilitres"
        mistake="No contrast budget, and multivessel PCI in one sitting “while we’re here”."
        burn="Set the contrast ceiling before the first puff. Stage non-culprit work. The kidney does not care how good the angiogram looked.">
        <p className="cs-p">A diabetic man with eGFR 38. The culprit is treated well; then, “while we’re here”, two more vessels. 420 mL of contrast — a volume-to-eGFR ratio of 11. Creatinine triples by 72 hours. He leaves hospital on dialysis three times a week.</p>
      </WarStory>

      <WarStory title="Triple therapy, triple trouble"
        mistake="Aspirin + ticagrelor + an anticoagulant for twelve months, without a proton-pump inhibitor."
        burn="With an anticoagulant: clopidogrel only, triple therapy for a week at most, a PPI always. The bleed that stops every drug causes the thrombosis.">
        <p className="cs-p">AF on an anticoagulant, discharged after PCI on aspirin, ticagrelor and the anticoagulant for a year. Week seven: haematemesis, haemoglobin 62. Every antithrombotic is stopped to control the bleed. Week eight: stent thrombosis.</p>
      </WarStory>
      <Decision id="mm-att" question="Which regimen would most likely have prevented both events?"
        options={[
          { id: 'right', label: 'Aspirin + clopidogrel + anticoagulant for ≤ 1 week, then clopidogrel + anticoagulant, with a PPI throughout', verdict: 'best', points: 10,
            why: 'Less potent P2Y12 inhibition, the shortest triple therapy, and gastroprotection — less bleeding, so no reason to stop everything.' },
          { id: 'noac', label: 'Stop the anticoagulant and use aspirin + ticagrelor', verdict: 'wrong', points: 0, why: 'Leaves the AF stroke risk uncovered.' },
          { id: 'same', label: 'The same regimen, with a PPI', verdict: 'ok', points: 3, why: 'The PPI helps, but ticagrelor with an anticoagulant and a year of triple therapy still bleeds too much.' },
        ]} />
    </>
  );
}

/* ============================================================
   10 · POST-PROCEDURE CARE, DEBRIEF & ASSESSMENT
   ============================================================ */

function Debrief() {
  const { totals, def, metrics } = useCase();
  const pct = totals.max ? Math.round(totals.got / totals.max * 100) : 0;
  const band = pct >= 85 ? 'Distinction' : pct >= 70 ? 'Pass with merit' : pct >= 55 ? 'Pass' : 'Needs another run';
  return (
    <>
      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>The access site</div>
          <p className="cs-p">The radial sheath comes out at the end of the case with a compression band (TR band): patent haemostasis — enough pressure to stop bleeding while preserving flow, confirmed by thumb oximetry. Release gradually from about 60–90 minutes. He is anticoagulated, so watch for forearm haematoma. Check the radial pulse before discharge — radial artery occlusion is usually silent.</p>
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Monitoring on the coronary care unit</div>
          <ul className="cs-ul">
            <li className="cs-li">Pericardial drain: output hourly; echo at 6 and 24 hours; remove when output is minimal and no re-accumulation.</li>
            <li className="cs-li">Haemoglobin and crossmatch; troponin; ECG for ischaemia.</li>
            <li className="cs-li">Creatinine at 48–72 hours. Contrast-associated AKI is a rise ≥ 26.5 µmol/L (0.3 mg/dL) within 48 h, or ≥ 1.5× baseline within 7 days. Continue hydration; restart metformin only if stable.</li>
            <li className="cs-li">Contrast used today: <b className="cs-mono">{Math.round(metrics.contrast)} mL</b> — volume/eGFR {(metrics.contrast / 52).toFixed(1)}{metrics.contrast / 52 > 3.7 ? ', above the 3.7 threshold.' : '.'}</li>
            <li className="cs-li">Air kerma <b className="cs-mono">{Math.round(metrics.kerma)} mGy</b>: below the 5 Gy level that triggers skin follow-up.</li>
          </ul>
        </div>
      </div>

      <Decision id="s10-att" question="Antithrombotic therapy at discharge: ACS treated with PCI, in a man with atrial fibrillation (CHA₂DS₂-VASc now 3) on apixaban, after a major procedural bleed?"
        options={[
          { id: 'std', label: 'Aspirin + clopidogrel + apixaban 5 mg twice daily for up to 1 week (in hospital), then clopidogrel + apixaban to 12 months, then apixaban alone — with a proton-pump inhibitor', verdict: 'best', points: 10,
            why: 'The default after PCI in AF: short triple therapy, then a NOAC plus clopidogrel (AUGUSTUS, ESC 2023). His bleed argues for the shortest triple-therapy period.' },
          { id: 'tica', label: 'Aspirin + ticagrelor + apixaban for 12 months', verdict: 'wrong', points: 0, why: 'Potent P2Y12 inhibitors with an anticoagulant, and prolonged triple therapy, both carry excessive bleeding.' },
          { id: 'dapt', label: 'Stop apixaban; aspirin + prasugrel for 12 months', verdict: 'wrong', points: 0, why: 'Leaves AF stroke prevention uncovered; prasugrel is not used with OAC.' },
          { id: 'low', label: 'Apixaban 2.5 mg twice daily + clopidogrel', verdict: 'ok', points: 3, why: 'The dose reduction needs two of: age ≥ 80, weight ≤ 60 kg, creatinine ≥ 133 µmol/L. He meets none — underdosing raises stroke risk.' },
        ]} />

      <MultiSelect id="s10-prev" question="Secondary prevention: what does he leave on, or with?"
        items={[
          { id: 'statin', label: 'High-intensity statin (atorvastatin 80 mg); LDL target < 1.4 mmol/L and ≥ 50% reduction', correct: true, why: 'Very-high-risk targets after ACS.' },
          { id: 'eze', label: 'Ezetimibe added if not at target at 4–6 weeks (or upfront)', correct: true, why: 'Starting 3.6 mmol/L, statin alone is unlikely to reach < 1.4.' },
          { id: 'sglt', label: 'SGLT2 inhibitor', correct: true, why: 'Type 2 diabetes with CKD: kidney and cardiovascular protection.' },
          { id: 'acei', label: 'ACE inhibitor (or ARB)', correct: true, why: 'Hypertension, diabetes and CKD.' },
          { id: 'smoke', label: 'Smoking cessation with pharmacotherapy (varenicline), and cardiac rehabilitation', correct: true, why: 'Among the most effective interventions he can have.' },
          { id: 'nsaid', label: 'Ibuprofen for chest-wall soreness', correct: false, why: 'NSAIDs with an anticoagulant and clopidogrel raise bleeding and harm the kidneys.' },
          { id: 'ppi', label: 'Stop the PPI once home', correct: false, why: 'Keep gastroprotection while on combined antithrombotic therapy.' },
        ]} />

      <div className="cs-h2">Case quiz</div>
      <Quiz id="s10-quiz" items={[
        { q: 'Above which FFR value is it safe to defer revascularisation of a stable lesion?', options: ['0.75', '0.80', '0.89', '0.94'], answer: 1,
          why: 'FFR > 0.80 → defer (DEFER, FAME). The non-hyperaemic threshold for iFR is ≤ 0.89 for ischaemia.' },
        { q: 'An IVUS calcium score of 2 or more predicts…', options: ['Distal embolisation', 'Stent underexpansion', 'Side-branch occlusion', 'Contrast nephropathy'], answer: 1,
          why: 'Points for > 270° arc over > 5 mm, 360° calcium, calcified nodule, and vessel < 3.5 mm; ≥ 2 predicts underexpansion.' },
        { q: 'Where does the POT balloon go?', options: ['Straddling the carina', 'Just proximal to the carina, sized to the proximal main vessel', 'Into the side branch', 'Into the left main'], answer: 1,
          why: 'Proximal to the carina, sized 1:1 to the proximal main-vessel reference.' },
        { q: 'An Ellis type III perforation is…', options: ['A crater without extravasation', 'A blush without a jet', 'Frank streaming through an exit hole ≥ 1 mm', 'Contrast entering the coronary sinus'], answer: 2,
          why: 'Type III is a jet of contrast; type III cavity spilling drains into a chamber or the coronary sinus.' },
        { q: 'The first action for a large-vessel Ellis III perforation is…', options: ['Protamine', 'Pericardiocentesis', 'Balloon inflation over the perforation', 'Remove the wire'], answer: 2,
          why: 'Seal first with a balloon; then drain, then cover.' },
        { q: 'After PCI in a patient on an oral anticoagulant, the P2Y12 inhibitor of choice is…', options: ['Ticagrelor', 'Prasugrel', 'Clopidogrel', 'Cangrelor'], answer: 2,
          why: 'Clopidogrel: the least bleeding with an anticoagulant.' },
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
          <li className="cs-li">Recurrent pain with dynamic ST changes despite treatment means immediate invasive management — within 2 hours, not 24.</li>
          <li className="cs-li">On an oral anticoagulant: radial access, heparin in the lab whatever the last dose, clopidogrel as the P2Y12 inhibitor, short triple therapy.</li>
          <li className="cs-li">Set a contrast budget from the eGFR and spend it deliberately; imaging saves runs.</li>
          <li className="cs-li">Physiology decides the non-culprit; imaging decides how to treat the culprit.</li>
          <li className="cs-li">360° calcium is prepared before a stent goes in. Underexpansion cannot be fixed afterwards.</li>
          <li className="cs-li">Provisional stenting with POT is the default bifurcation strategy; treat the side branch only if it is compromised.</li>
          <li className="cs-li">A perfect angiogram can hide an underexpanded stent. Optimise to IVUS criteria, inside the stent, with a balloon sized to it.</li>
          <li className="cs-li">Perforation: seal with a balloon, drain the pericardium, cover the hole, call the surgeon early, never pull the wire.</li>
        </ol>
      </div>
      <Figure src={WIKI('PTCA_stent_NIH.gif')} href={WIKIPAGE('PTCA_stent_NIH.gif')} alt="Diagram of coronary angioplasty and stent placement" caption="Angioplasty and stenting, from the US National Institutes of Health." credit="NIH, public domain, Wikimedia Commons" />
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const CASE_01 = {
  title: 'NSTE-ACS · Calcified LAD/D1 bifurcation · IVUS-guided PCI',
  short: 'Cath Lab · Case 01',
  patient: {
    name: 'Mr Youssef Karam',
    meta: '64 M · MRN 4471-0920 · 82 kg',
    flags: [
      { text: 'Allergy: iodinated contrast (urticaria)', tone: 'red' },
      { text: 'Apixaban · last 21:00', tone: 'amber' },
      { text: 'eGFR 52 · metformin', tone: 'amber' },
      { text: 'T2DM · AF', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 150, limit: 190, basis: 'volume/eGFR ≤ 3.7' },
  clock0: min(8, 52),
  vitals0: { hr: 102, sys: 152, dia: 90, spo2: 96, rr: 20, st: -2 },
  brand: { icon: '🫀', line: 'Cath Lab · Case 01' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / IM', tone: 'cyan' },
      { text: 'High-acuity case', tone: 'red' },
      { text: 'ESC 2023 ACS · EBC-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'The calcium', style: 'outline' },
      { text: 'trap', style: 'grad' },
      { text: '& the bleed', style: 'cyan' },
    ],
    hook: (
      <>
        A 64-year-old diabetic on <b>apixaban</b> whose pain will not settle. A <b>360° ring of calcium</b> waiting to strangle your stent.
        An angiogram that looks <span className="g">perfect</span> — and lies. And at <span className="r">10:49</span>, a jet of contrast where no contrast should be.
        You have <span className="y">two hours</span>, <span className="y">190 mL</span> of contrast, and <span className="y">one wire</span> you must never pull.
      </>
    ),
    image: '/images/cath-lab.webp',
    sims: 's4',
    crisis: 's9',
    cards: [
      { k: 'The patient', t: 'Mr Youssef Karam, 64 — NSTE-ACS with recurrent pain, CKD 3a, atrial fibrillation on apixaban.' },
      { k: 'Your role', t: 'Primary operator, from the emergency department to the coronary care unit.' },
      { k: 'In your hands', t: 'A C-arm you drive, a pressure wire, IVUS, an inflation device, echo and a live monitor.' },
      { k: 'How it teaches', t: 'Mechanisms, not memory: the why, what it isn’t, the vicious cycle, and who it has hurt.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'Clinical presentation & triage', Component: Presentation,
      pill: '⏱ Golden hour — the clock starts now',
      lede: 'History, ECG, troponin and risk — and the decision that starts the clock.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 102, sys: 152, dia: 90, spo2: 96, st: -2 }); atLeastClock(min(8, 52)); } },
    { id: 's2', icon: '📋', nav: 'Pre-Procedure Workup', title: 'Pre-procedure workup & planning', Component: Workup,
      pill: '🧾 Know the patient before the table',
      lede: 'Consent, allergy, kidneys, anticoagulation, access — and a plan the whole team hears.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 88, sys: 140, dia: 84, st: -0.5 }); atLeastClock(min(9, 12)); } },
    { id: 's3', icon: '🩸', nav: 'Vascular Access', title: 'Vascular access & setup', Component: Access,
      pill: '🎯 The wrist saves lives',
      lede: 'Radial or femoral, the sheath, the anticoagulant and the guide for the job.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 84, sys: 138, dia: 78, st: 0 }); atLeastClock(min(9, 41)); } },
    { id: 's4', icon: '📸', nav: 'Angiography & Views', title: 'Diagnostic angiography & views', Component: Diagnostic,
      pill: '🎥 You drive the C-arm',
      lede: 'Acquire the series, read the tree, name the culprit.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 82, sys: 134, dia: 76 }); atLeastClock(min(9, 52)); } },
    { id: 's5', icon: '🔬', nav: 'Physiology & Imaging', title: 'Lesion assessment — physiology & imaging', Component: Assessment,
      pill: '📏 Measure, don’t guess',
      lede: 'A pressure wire for the bystander; IVUS for the culprit.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 84, sys: 132, dia: 74 }); atLeastClock(min(10, 3)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy & decision point', Component: Strategy,
      pill: '🧭 The branching point',
      lede: 'How this lesion will be treated — and what each choice costs.',
      enter: ({ atLeastClock }) => atLeastClock(min(10, 12)) },
    { id: 's7', icon: '🛠️', nav: 'Intervention Steps', title: 'Intervention — step by step', Component: Intervention,
      pill: '🎈 Hands on the balloon',
      lede: 'Wire, prepare, size, deploy, optimise the proximal segment, check the branch.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 80, sys: 130, dia: 74 }); atLeastClock(min(10, 15)); } },
    { id: 's8', icon: '✅', nav: 'Result Assessment', title: 'Result assessment & optimisation', Component: Result,
      pill: '🔍 The angiogram can lie',
      lede: 'The angiogram says perfect. Does IVUS agree?',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 80, sys: 132, dia: 74 }); atLeastClock(min(10, 44)); } },
    { id: 's9', icon: '🚨', nav: 'Perforation Drill', title: 'Complication recognition & management', Component: Complication,
      pill: '🩸 10:49 — crisis on the table',
      lede: 'Recognise it from the screen and the monitor, then act — in the right order.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 112, sys: 98, dia: 60 }); atLeastClock(min(10, 49)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'Understand the loop and you will never forget the treatment.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 90, sys: 120, dia: 72, st: 0 }); atLeastClock(min(11, 20)); } },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Six mistakes that hurt patients — so they never have to hurt yours.',
      enter: ({ atLeastClock }) => atLeastClock(min(12, 0)) },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Post-procedure care, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'Access, monitoring, antithrombotics and prevention — then your score.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 76, sys: 122, dia: 70, st: 0 }); atLeastClock(min(12, 30)); } },
  ],
};

export default function Case01({ onClose }) {
  return <CaseShell def={CASE_01} onClose={onClose} />;
}
