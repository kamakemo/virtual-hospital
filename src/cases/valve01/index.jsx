import React, { useState } from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Figure, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor,
} from '../kit/CaseKit.jsx';
import ECG12 from '../kit/ECG12.jsx';
import { Auscultation, Doppler, Hemodynamics, TaviDeploy, Pacer } from '../kit/Valve.jsx';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 01
   Severe, symptomatic, high-gradient calcific aortic stenosis in
   a 79-year-old: exertional syncope, angina and breathlessness.

   1  the faint, the murmur, the pulse, the ECG, the bloods
   2  Doppler you measure, the continuity equation, discordant
      grading, and a dobutamine stress echo with three patients
   3  the heart team, the conversation, lifetime management
   4  CT: annulus sizing, coronary heights, the route, the septum
   5  the hybrid lab: access, pacing test, crossing, pressures
   6  strategy: predilation, target depth, embolic protection
   7  deployment on rapid pacing; aortogram, regurgitation index
   8  the unit: serial ECGs, a conduction algorithm, day-1 bloods
   9  night two: complete heart block, transcutaneous pacing,
      which pacemaker
   10 vicious cycles  11 M&M  12 discharge, follow-up, debrief

   Clinical content follows the 2025 ESC/EACTS valvular heart
   disease guideline and published consensus on conduction
   disturbances after TAVI, simplified for teaching.
   ============================================================ */

const WIKI = f => `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=960`;
const WIKIPAGE = f => `https://commons.wikimedia.org/wiki/File:${f}`;
const min = (h, m) => h * 60 + m;

const LVH = { shape: { V1: { s: 22 }, V2: { s: 27 }, V3: { r: 10, s: 14 }, V5: { r: 28 }, V6: { r: 22 }, I: { r: 12 }, aVL: { r: 13 } },
  st: { I: -1, aVL: -1, V5: -1.5, V6: -1.2 }, tInv: { I: true, aVL: true, V5: true, V6: true } };

/* ---------- small local pieces ---------- */

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
  React.useEffect(() => { if (pts != null) award(stageId, id, pts, max); }, [pts]);  // eslint-disable-line
  return null;
}

/** The continuity equation, with the LVOT diameter the learner chooses — and its squared error. */
function Continuity() {
  const [d, setD] = useState(2.2);
  const lvotVti = 22, avVti = 104;
  const area = Math.PI * (d / 2) ** 2;
  const ava = area * lvotVti / avVti;
  const dvi = lvotVti / avVti;
  return (
    <div className="cs-card">
      <div className="cs-h2" style={{ marginTop: 0 }}>The continuity equation — what goes in must come out</div>
      <p className="cs-p">Flow through the outflow tract = flow through the valve. <b className="cs-mono">LVOT area × LVOT VTI = AVA × AV VTI</b>, so <b className="cs-mono">AVA = π (d/2)² × 22 / 104</b>.</p>
      <div className="cs-row" style={{ marginBottom: 10 }}>
        {[2.0, 2.1, 2.2, 2.3, 2.4].map(x => <button key={x} className={'cs-chip' + (d === x ? ' on' : '')} onClick={() => setD(x)}>LVOT {x.toFixed(1)} cm</button>)}
      </div>
      <div className="cs-readout">
        <div><span>LVOT area</span><b>{area.toFixed(2)} cm²</b></div>
        <div><span>Stroke volume</span><b>{Math.round(area * lvotVti)} mL</b></div>
        <div><span>Aortic valve area</span><b style={{ color: ava <= 1.0 ? 'var(--red)' : 'var(--amber)' }}>{ava.toFixed(2)} cm²</b></div>
        <div><span>Indexed (BSA 1.9)</span><b>{(ava / 1.9).toFixed(2)} cm²/m²</b></div>
        <div><span>Dimensionless index</span><b style={{ color: 'var(--red)' }}>{dvi.toFixed(2)}</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 10 }}>A 1 mm error in the LVOT diameter — the width of a calliper mark — moves the AVA by ~10%, because the diameter is <b>squared</b>. The LVOT is also oval, not round, so echo tends to underestimate it. The dimensionless index (LVOT VTI ÷ AV VTI) never touches the diameter: below 0.25 is severe whatever the ruler says.</p>
    </div>
  );
}

/** Low-dose dobutamine echo in three patients with low-flow, low-gradient AS and a weak LV. */
const DSE = {
  A: { name: 'Patient A', sv: [44, 50, 56, 61, 64], mg: [26, 32, 38, 43, 46], ava: [0.78, 0.8, 0.81, 0.83, 0.84] },
  B: { name: 'Patient B', sv: [42, 50, 58, 63, 66], mg: [24, 25, 26, 27, 28], ava: [0.8, 0.95, 1.1, 1.22, 1.3] },
  C: { name: 'Patient C', sv: [40, 41, 42, 42, 43], mg: [22, 22, 23, 23, 23], ava: [0.76, 0.77, 0.77, 0.78, 0.78] },
};
const DOSES = [0, 5, 10, 15, 20];
function DobutamineEcho() {
  const [pt, setPt] = useState('A');
  const [k, setK] = useState(0);
  const P = DSE[pt];
  const rise = Math.round((P.sv[k] / P.sv[0] - 1) * 100);
  const W = 360, H = 160, X = i => 40 + i * ((W - 60) / 4), Y = v => H - 24 - (v - 15) / 40 * (H - 40);
  return (
    <div className="cs-card">
      <div className="cs-h2" style={{ marginTop: 0 }}>Low-dose dobutamine stress echo — EF 32%, AVA 0.8 cm², mean gradient ~25 mmHg</div>
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {Object.keys(DSE).map(key => <button key={key} className={'cs-chip' + (pt === key ? ' on' : '')} onClick={() => { setPt(key); setK(0); }}>{DSE[key].name}</button>)}
      </div>
      <div className="cs-row" style={{ marginBottom: 10 }}>
        {DOSES.map((d, i) => <button key={d} className={'cs-chip' + (k === i ? ' on' : '')} onClick={() => setK(i)}>{d} µg/kg/min</button>)}
      </div>
      <div className="cs-grid2" style={{ alignItems: 'center' }}>
        <div className="cs-viewer" style={{ background: '#03070B' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="Mean gradient against dobutamine dose">
            {[20, 30, 40, 50].map(v => <g key={v}><line x1={34} x2={W - 10} y1={Y(v)} y2={Y(v)} stroke={v === 40 ? '#FF4D6D' : '#13212D'} strokeDasharray={v === 40 ? '5 4' : ''} /><text x={4} y={Y(v) + 4} fill="#6A7F9B" fontSize="10" fontFamily="JetBrains Mono, monospace">{v}</text></g>)}
            <path d={P.mg.slice(0, k + 1).map((v, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(v)}`).join(' ')} fill="none" stroke="#F5C451" strokeWidth="2.5" />
            {P.mg.slice(0, k + 1).map((v, i) => <circle key={i} cx={X(i)} cy={Y(v)} r="4" fill="#F5C451" />)}
            <text x={W - 12} y={14} textAnchor="end" fill="#6A7F9B" fontSize="10" fontFamily="JetBrains Mono, monospace">mean gradient, mmHg</text>
          </svg>
        </div>
        <div className="cs-readout" style={{ marginTop: 0 }}>
          <div><span>Stroke volume</span><b>{P.sv[k]} mL</b></div>
          <div><span>Rise from baseline</span><b style={{ color: rise >= 20 ? 'var(--green)' : 'var(--amber)' }}>{rise}%</b></div>
          <div><span>Mean gradient</span><b style={{ color: P.mg[k] >= 40 ? 'var(--red)' : undefined }}>{P.mg[k]} mmHg</b></div>
          <div><span>AVA</span><b style={{ color: P.ava[k] <= 1.0 ? 'var(--red)' : 'var(--green)' }}>{P.ava[k].toFixed(2)} cm²</b></div>
        </div>
      </div>
      <p className="cs-pts" style={{ marginTop: 10 }}>Step the dose up for each patient. Contractile (flow) reserve is a stroke-volume rise of ≥ 20%. Then ask: did the valve open, or did the gradient climb through a valve that stayed small?</p>
    </div>
  );
}

/** CT annulus: an ellipse, and the valve sizes laid over it. */
function AnnulusSizer() {
  const [v, setV] = useState(26);
  const a = 27.2, b = 22.0;
  const area = Math.PI * (a / 2) * (b / 2);
  const perim = Math.PI * (3 * (a / 2 + b / 2) - Math.sqrt((3 * a / 2 + b / 2) * (a / 2 + 3 * b / 2)));
  const valveArea = Math.PI * (v / 2) ** 2;
  const over = (valveArea / area - 1) * 100;
  const S = 6, C = 110;
  const good = over > 0 && over < 25;
  return (
    <div className="cs-card">
      <div className="cs-h2" style={{ marginTop: 0 }}>The annulus, seen end-on (systolic phase)</div>
      <div className="cs-grid2" style={{ alignItems: 'center' }}>
        <div className="cs-viewer" style={{ background: '#05070A', maxWidth: 300 }}>
          <svg viewBox="0 0 220 220" style={{ width: '100%', display: 'block' }} role="img" aria-label="Aortic annulus with valve overlay">
            <ellipse cx={C} cy={C} rx={a / 2 * S} ry={b / 2 * S} fill="rgba(200,200,200,0.12)" stroke="#E9F2FC" strokeWidth="2" />
            <line x1={C - a / 2 * S} x2={C + a / 2 * S} y1={C} y2={C} stroke="#6A7F9B" strokeDasharray="4 3" />
            <line x1={C} x2={C} y1={C - b / 2 * S} y2={C + b / 2 * S} stroke="#6A7F9B" strokeDasharray="4 3" />
            <circle cx={C} cy={C} r={v / 2 * S} fill="none" stroke={good ? '#34E39A' : over < 0 ? '#F5C451' : '#FF4D6D'} strokeWidth="3" />
            {[[-0.6, 0.55], [0.7, 0.3], [-0.2, -0.85]].map(([x, y], i) => <circle key={i} cx={C + x * a / 2 * S} cy={C + y * b / 2 * S} r="5" fill="#FFFFFF" opacity="0.9" />)}
            <text x={8} y={16} fill="#9FB4C6" fontSize="10" fontFamily="JetBrains Mono, monospace">{a} × {b} mm</text>
          </svg>
        </div>
        <div>
          <div className="cs-row" style={{ marginBottom: 10 }}>
            {[23, 26, 29].map(x => <button key={x} className={'cs-chip' + (v === x ? ' on' : '')} onClick={() => setV(x)}>{x} mm valve</button>)}
          </div>
          <div className="cs-readout" style={{ marginTop: 0 }}>
            <div><span>Annulus area</span><b>{Math.round(area)} mm²</b></div>
            <div><span>Perimeter</span><b>{Math.round(perim)} mm</b></div>
            <div><span>Valve nominal area</span><b>{Math.round(valveArea)} mm²</b></div>
            <div><span>Area oversizing</span><b style={{ color: good ? 'var(--green)' : over < 0 ? 'var(--amber)' : 'var(--red)' }}>{over > 0 ? '+' : ''}{over.toFixed(0)}%</b></div>
          </div>
          <p className="cs-pts" style={{ marginTop: 8 }}>White blobs: calcium nodules in the annulus and outflow tract. Too little oversizing leaks around the frame; too much, pushed into calcium, tears the annulus.</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   1 · PRESENTATION & TRIAGE
   ============================================================ */

function Presentation() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">09:40</span>Mr Elias Mansour, 79, a retired civil engineer, was carrying two watering cans up the garden path when the world “went grey from the edges in”. His wife found him on the path, conscious again within a minute, grazed, not confused, not incontinent, no tongue bite.</p>
        <p className="cs-p"><span className="cs-time">history</span>Six months of breathlessness after one flight of stairs, and a tight chest when he hurries — which he put down to age. One near-faint in the summer, also on exertion. He has quietly stopped walking to the shops. Hypertension, mild COPD (ex-smoker, 30 pack-years), eGFR 58. Amlodipine 10 mg, ramipril 5 mg, atorvastatin 20 mg.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">10:20</span>Emergency department. Now well. A junior colleague has heard “a murmur, probably sclerosis — he’s 79”.</p>
      </div>
      <Note kind="pearl" title="The history hides in what he stopped doing">Patients with aortic stenosis slowly shrink their lives to fit their valve. “No symptoms” often means “no exertion”. Ask what he could do a year ago.</Note>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Observations · 10:20</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('72 /min, regular')], ['Blood pressure', N('118/80 mmHg — pulse pressure 38', 'cs-hi')], ['Lying → standing', N('116/80 → 112/78, no symptoms')],
            ['SpO₂', N('95% on air')], ['Resp. rate', N('16 /min')], ['Glucose', N('6.4 mmol/L')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Carotid pulse: small, slow-rising, a shudder (thrill) under the finger.</li>
            <li className="cs-li">Apex: undisplaced but sustained, heaving; a palpable atrial impulse.</li>
            <li className="cs-li">Harsh ejection murmur, right upper sternal edge, to both carotids. Quiet S2.</li>
            <li className="cs-li">Fine basal crackles. No oedema. A graze on the forehead.</li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">Listen — and compare</div>
      <p className="cs-p">Put headphones on. Listen to his heart, then switch to the other two and run each manoeuvre. What changes, and why?</p>
      <Auscultation lesions={['as-severe', 'as-mild', 'hcm']} />

      <MultiSelect id="s1-severity" question="Which bedside signs tell you this stenosis is SEVERE?"
        items={[
          { id: 'late', label: 'The murmur peaks late in systole', correct: true, why: 'The tighter the valve, the longer the LV takes to build the pressure that drives the peak flow.' },
          { id: 'a2', label: 'A soft or absent A2', correct: true, why: 'Rigid, calcified leaflets barely move — so they barely snap shut.' },
          { id: 'pulse', label: 'A slow-rising, low-volume carotid pulse', correct: true, why: 'Pulsus parvus et tardus: the aorta fills slowly through a small door.' },
          { id: 'pp', label: 'A narrow pulse pressure', correct: true, why: 'A small stroke volume ejected slowly gives a low systolic peak.' },
          { id: 'loud', label: 'A very loud murmur', correct: false, why: 'Loudness follows flow. As the LV fails, flow falls and a critical valve can go quiet — the most dangerous murmur may be the softest.' },
          { id: 'rad', label: 'Radiation to the carotids', correct: false, why: 'Any aortic stenosis radiates there, mild or severe.' },
        ]} />

      <Decision id="s1-grade" question="The murmur is harsh and loud, and you can feel a thrill over the carotid. Levine grade?"
        options={[
          { id: '4', label: 'Grade 4/6 — loud, with a palpable thrill', verdict: 'best', points: 6, why: 'A thrill makes it at least 4. Grade 5 is heard with the stethoscope barely on the chest; 6 without touching it.' },
          { id: '3', label: 'Grade 3/6', verdict: 'wrong', points: 0, why: 'Grade 3 is loud but has no thrill.' },
          { id: '6', label: 'Grade 6/6', verdict: 'wrong', points: 0, why: 'Audible with the stethoscope off the chest — not here.' },
        ]} />

      <Contrast title="aortic stenosis vs hypertrophic obstructive cardiomyopathy"
        is={{ h: 'Aortic stenosis — a FIXED obstruction', points: [
          'Valve level; radiates to the carotids; A2 soft.',
          'Squatting (bigger LV, more flow) makes it LOUDER.',
          'Valsalva or standing (less flow) makes it SOFTER.',
          'Slow, small carotid upstroke.',
        ] }}
        isnt={{ h: 'HOCM — a DYNAMIC obstruction', points: [
          'Below the valve: septum and mitral leaflet meet in systole; no carotid radiation.',
          'Squatting fills the LV and pushes the walls apart: SOFTER.',
          'Valsalva or standing empties the LV and the walls meet: LOUDER.',
          'Brisk, double-peaked carotid.',
        ] }} />

      <ECG12 rate={72} pr={0.21} shape={LVH.shape} st={LVH.st} tInv={LVH.tInv}
        caption="Sinus rhythm, PR 210 ms (first-degree AV block), QRS 108 ms. LVH by voltage (S V2 + R V5 ≈ 55 mm) with lateral ST depression and T inversion — the “strain” of a pressure-loaded LV. Calcium from the valve can creep into the conduction system: the long PR is a clue for later." />

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Bloods</div>
          <Table head={['Test', 'Result']} rows={[
            ['hs-Troponin T', N('28 ng/L (no rise at 3 h)', 'cs-hi')], ['NT-proBNP', N('2,850 ng/L', 'cs-hi')],
            ['Haemoglobin', N('128 g/L')], ['Creatinine / eGFR', N('112 µmol/L · 58', 'cs-hi')], ['Potassium', N('4.6 mmol/L')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Chest X-ray</div>
          <p className="cs-p">Heart size normal — concentric hypertrophy thickens the wall inward, it does not enlarge the shadow. Valve calcification on the lateral film. Mild upper-lobe diversion. No consolidation.</p>
        </div>
      </div>
      <Why title="Why a flat troponin and a high BNP matter in aortic stenosis"
        chain={[
          { k: 'WALL STRESS', t: 'Pressure overload stretches the LV wall; stretched myocytes release BNP.' },
          { k: 'STARVED MUSCLE', t: 'A thick wall outgrows its capillaries; a little troponin leaks constantly, without a plaque rupture.' },
          { k: 'PROGNOSIS', t: 'Both track how close the ventricle is to failing — high values predict death and heart failure.' },
          { k: 'NOT AN MI', t: 'A stable, low troponin with no rise is the valve, not a coronary event. Interpret it in context.' },
        ]} />

      <MultiSelect id="s1-ddx" question="Exertional syncope. Which of these belong in the differential?"
        items={[
          { id: 'as', label: 'Severe aortic stenosis', correct: true, why: 'Fixed output — his murmur says this first.' },
          { id: 'hcm', label: 'Hypertrophic obstructive cardiomyopathy', correct: true, why: 'Dynamic obstruction worsening with exercise.' },
          { id: 'vt', label: 'Ventricular tachycardia', correct: true, why: 'A scarred or hypertrophied LV can produce VT on exertion.' },
          { id: 'block', label: 'Intermittent high-grade AV block', correct: true, why: 'His PR is long; exertion can unmask infranodal block.' },
          { id: 'pah', label: 'Pulmonary hypertension or massive PE', correct: true, why: 'A fixed right-sided output fails the same way.' },
          { id: 'vv', label: 'Vasovagal syncope', correct: false, why: 'Classically on standing, in heat, with pain or emotion — and after, not during, exertion.' },
        ]} />

      <Decision id="s1-syncope" question="What do you make of the faint?"
        options={[
          { id: 'as', label: 'Exertional syncope from severe aortic stenosis until proven otherwise — admit for urgent assessment and telemetry', verdict: 'best', points: 10,
            why: 'Syncope on exertion with this murmur is a cardinal symptom of severe AS and marks a patient at risk of sudden death. He does not go home today.' },
          { id: 'vaso', label: 'Probably vasovagal; discharge with outpatient echo', verdict: 'wrong', points: 0, why: 'Vasovagal syncope is not triggered by carrying water uphill. Exertional syncope is cardiac until proven otherwise.' },
          { id: 'ortho', label: 'Orthostatic hypotension from his amlodipine', verdict: 'ok', points: 2, why: 'His lying/standing pressures were flat. His vasodilator may have contributed — it does not explain the murmur or the exertional trigger.' },
          { id: 'tia', label: 'A TIA — CT head and stroke clinic', verdict: 'wrong', points: 0, why: 'Global loss of consciousness with rapid recovery is not a TIA.' },
        ]} />
      <Contrast title="the syncope of aortic stenosis vs a vasovagal faint"
        is={{ h: 'Aortic stenosis', points: ['DURING exertion.', 'Little warning; grey-out, then down.', 'Can recur — and can be the last symptom before sudden death.', 'Murmur, slow pulse, LVH.'] }}
        isnt={{ h: 'Vasovagal', points: ['Standing, heat, pain, emotion — or just AFTER exercise stops.', 'Prodrome: nausea, sweating, yawning, warmth.', 'Benign, recurs in clusters, younger patients.', 'Normal heart.'] }} />

      <Why title="Why he fainted carrying water uphill"
        chain={[
          { k: 'FIXED DOOR', t: 'A calcified valve caps how much blood the LV can push out each beat.' },
          { k: 'EXERCISE', t: 'Working leg muscles dilate their arterioles: total resistance falls.' },
          { k: 'NO RESERVE', t: 'A normal heart raises its output to match. His cannot — the door is fixed.' },
          { k: 'PRESSURE FALLS', t: 'Blood pressure = output × resistance. Output fixed, resistance falling: pressure falls.' },
          { k: 'GREY-OUT', t: 'The brain is first to notice — and a stretched, ischaemic LV can fire a reflex vasodilatation that deepens the drop.' },
        ]}>
        Every symptom of AS has the same root: a fixed output meeting a body that needs more. Angina, breathlessness, syncope — the classic triad, each a mechanism, not a list.
      </Why>

      <Decision id="s1-gtn" question="He now mentions chest tightness. Your colleague reaches for the GTN spray. You…"
        options={[
          { id: 'stop', label: 'Stop them: nitrates can drop his pressure catastrophically — treat with rest, oxygen if hypoxic, and careful assessment', verdict: 'best', points: 10,
            why: 'In severe AS cardiac output is fixed; a venodilator drops preload, the LV under-fills, and output falls further. Pressure collapses, and coronary perfusion with it.' },
          { id: 'half', label: 'One small puff, lying down', verdict: 'ok', points: 2, why: 'Lying down helps — but you are still pulling the preload out from a heart that cannot compensate. Avoid.' },
          { id: 'give', label: 'Fine — chest pain gets GTN', verdict: 'wrong', points: 0, why: 'Reflexes kill here. The war-stories stage has this exact case.' },
        ]} />
      <Decision id="s1-meds" question="His regular medicines on admission?"
        options={[
          { id: 'adjust', label: 'Hold the amlodipine; continue ramipril at the current dose if his pressure allows; continue the statin', verdict: 'best', points: 8,
            why: 'A potent arterial vasodilator in a fixed-output heart is the first thing to stop. ACE inhibitors are not forbidden in AS — started low and watched, they treat his hypertension and LV — but not escalated today.' },
          { id: 'stopall', label: 'Stop every blood-pressure drug', verdict: 'ok', points: 4, why: 'Defensible for a day, but untreated hypertension also loads the LV. Be selective.' },
          { id: 'cont', label: 'Continue everything unchanged', verdict: 'wrong', points: 0, why: 'He fainted on a vasodilator with a fixed obstruction.' },
        ]} />

      <div className="cs-media-row">
        <Figure src={WIKI('Blausen_0040_AorticStenosis.png')} href={WIKIPAGE('Blausen_0040_AorticStenosis.png')} alt="Diagram of a normal and a stenotic aortic valve" caption="A normal trileaflet valve beside a calcified, stenotic one." credit="BruceBlaus, CC BY 3.0, Wikimedia Commons" />
        <Video id="XkkoFB8lTno" title="Aortic stenosis explained in 10 minutes — with the murmur" />
      </div>
    </>
  );
}

/* ============================================================
   2 · MEASURING IT — ECHO & DOPPLER
   ============================================================ */

function Echo() {
  const { answers, answer } = useCase();
  const m = answers['s2-vmax'];
  const l = answers['s2-lvot'];
  return (
    <>
      <p className="cs-p">Transthoracic echo, 13:00. Heavily calcified trileaflet aortic valve with restricted opening. LV wall 14 mm, concentric hypertrophy, EF 58%. Now measure — from the apex, and then again from the right parasternal window, because the highest velocity wins.</p>
      <div className="cs-h2" style={{ marginTop: 10 }}>A · Continuous-wave Doppler across the valve</div>
      <Doppler kind="cw-as" vmax={4.6} title="Apical five-chamber, CW cursor aligned through the valve" onMeasure={r => answer('s2-vmax', r)} />
      {m && (
        <div className={'cs-fb ' + (m.close ? 'best' : 'ok')}>
          You measured {m.v.toFixed(2)} m/s → peak {Math.round(m.peak)} mmHg, mean ≈ {Math.round(m.mean)} mmHg. {m.close
            ? 'On the envelope’s edge: Vmax 4.6 m/s.'
            : m.v < 4.6 ? 'Short of the true edge — under-reading the velocity under-reads the gradient by its square.' : 'Beyond the envelope: you are measuring noise.'}
        </div>
      )}
      <ScoreOnce id="s2-vmax" pts={m == null ? null : m.close ? 10 : 4} max={10} />
      <Decision id="s2-window" question="Why also scan from the right parasternal window and the suprasternal notch?"
        options={[
          { id: 'angle', label: 'Doppler under-reads when the beam is not parallel to the jet; the window most in line with it gives the true (highest) velocity', verdict: 'best', points: 6,
            why: 'Measured velocity = true velocity × cos(angle). At 20° off-axis you lose 6% of the velocity and 12% of the gradient. Search every window; never average them.' },
          { id: 'avg', label: 'To average the windows for accuracy', verdict: 'wrong', points: 0, why: 'Every off-axis window is an underestimate. Averaging dilutes the truth.' },
        ]} />

      <div className="cs-h2">B · Pulsed-wave Doppler in the outflow tract</div>
      <Doppler kind="pw-lvot" vmax={1.1} title="PW sample volume 5 mm below the valve" onMeasure={r => answer('s2-lvot', r)} />
      {l && <div className={'cs-fb ' + (l.close ? 'best' : 'ok')}>LVOT velocity {l.v.toFixed(2)} m/s, VTI ≈ {l.vti.toFixed(0)} cm. {l.close ? 'Good — a laminar envelope, sampled just below the valve.' : 'Re-check: sample too close to the valve and you pick up the accelerating jet; too far and you under-read.'}</div>}
      <ScoreOnce id="s2-lvot" pts={l == null ? null : l.close ? 6 : 2} max={6} />
      <Continuity />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>The rest of the echo</div>
        <Table head={['Measure', 'Value', 'Meaning']} rows={[
          ['Stroke volume index', N('41 mL/m²'), 'Normal flow (≥ 35)'],
          ['Global longitudinal strain', N('−14%', 'cs-hi'), 'Normal ≤ −18%: the long-axis fibres are already failing behind a normal EF'],
          ['E/e′ average', N('16', 'cs-hi'), 'Raised filling pressure — why he is breathless'],
          ['Left atrium', N('44 mL/m²', 'cs-hi'), 'Chronic pressure load'],
          ['PA systolic pressure', N('42 mmHg'), ''], ['Aortic regurgitation', N('mild'), ''], ['Mitral', N('mild MR, annular calcium'), ''],
        ]} />
      </div>
      <Why title="Why he is breathless with a normal ejection fraction"
        chain={[
          { k: 'THICK WALL', t: 'Concentric hypertrophy, then fibrosis: a stiff ventricle.' },
          { k: 'STIFF FILLING', t: 'Every millilitre of filling costs more pressure: LV diastolic pressure rises.' },
          { k: 'BACKWARDS', t: 'The left atrium and pulmonary veins carry that pressure into the lungs.' },
          { k: 'BREATHLESS', t: 'Wet, stiff lungs on exertion — while the EF still reads 58%.' },
        ]}>
        EF measures the radial squeeze; strain catches the long-axis fibres failing first. By the time the EF falls in AS, the heart has been suffering for years.
      </Why>

      <Decision id="s2-grade" question="Vmax 4.6 m/s, mean gradient 51 mmHg, AVA ≈ 0.8 cm², EF 58%, normal flow. Grade it."
        options={[
          { id: 'hg', label: 'Severe, high-gradient aortic stenosis', verdict: 'best', points: 10,
            why: 'Vmax ≥ 4 m/s, mean gradient ≥ 40 mmHg, AVA ≤ 1.0 cm² (≤ 0.6 cm²/m²), dimensionless index < 0.25. Everything agrees — the easy kind.' },
          { id: 'mod', label: 'Moderate — the AVA is borderline', verdict: 'wrong', points: 0, why: 'With normal flow, a mean gradient of 51 mmHg is severe whatever the AVA arithmetic says.' },
          { id: 'lflg', label: 'Low-flow, low-gradient AS', verdict: 'wrong', points: 0, why: 'His flow and gradient are both high.' },
        ]} />

      <Why title="Why the gradient depends on flow, not only on the valve"
        chain={[
          { k: 'BERNOULLI', t: 'Pressure drop ≈ 4 × velocity². Velocity = flow ÷ area.' },
          { k: 'SQUARED', t: 'So the gradient rises with the SQUARE of flow through a fixed orifice.' },
          { k: 'WEAK PUMP', t: 'Halve the flow (a failing LV) and the gradient falls to a quarter — through the same tight valve.' },
          { k: 'THE TRAP', t: 'A low gradient can mean a mild valve, or a severe valve with a weak heart behind it.' },
        ]}>
        That is why the gradient is never read alone: you must know the flow that made it.
      </Why>
      <Contrast title="high-gradient AS vs low-flow, low-gradient AS"
        is={{ h: 'High-gradient (his)', points: ['Mean ≥ 40 mmHg, Vmax ≥ 4 m/s, AVA ≤ 1.0 cm².', 'Normal flow; the numbers agree.', 'Diagnosis made — move on to the decision.'] }}
        isnt={{ h: 'Low-flow, low-gradient', points: ['AVA ≤ 1.0 cm² but mean < 40 mmHg, SVi < 35 mL/m².', 'Reduced EF (classical): low-dose dobutamine echo.', 'Preserved EF (paradoxical — small, thick LV): CT calcium score of the valve.'] }} />

      <div className="cs-h2">C · Not every patient is him — grade these</div>
      <Decision id="s2-p1" question="Woman, 82. EF 65%, small thick LV, SVi 28 mL/m², AVA 0.75 cm², mean gradient 31 mmHg, Vmax 3.5 m/s. CT valve calcium score 2,100 AU."
        options={[
          { id: 'paradox', label: 'Paradoxical low-flow, low-gradient severe AS', verdict: 'best', points: 8, why: 'Normal EF but low flow from a small, stiff cavity. Calcium ≥ 1,200 AU in a woman (≥ 2,000 in a man) makes severe likely.' },
          { id: 'mod', label: 'Moderate AS', verdict: 'wrong', points: 0, why: 'The gradient is low because the flow is low, not because the valve is open.' },
        ]} />
      <Decision id="s2-p2" question="Man, 76. EF 60%, SVi 44 mL/m², mean gradient 34 mmHg, Vmax 3.8 m/s, AVA 0.95 cm² with an LVOT measured at 1.9 cm."
        options={[
          { id: 'mod', label: 'Probably moderate: normal flow, and the small LVOT measurement has likely underestimated the AVA', verdict: 'best', points: 8, why: 'With normal flow the gradient is trustworthy. Check the LVOT on CT or use the dimensionless index — it will likely be ≥ 0.25.' },
          { id: 'sev', label: 'Severe — the AVA is below 1.0', verdict: 'wrong', points: 0, why: 'One number from a squared diameter does not override two flow-dependent measurements made at normal flow.' },
        ]} />
      <DobutamineEcho />
      <div className="cs-grid3">
        <Decision id="s2-dA" question="Patient A?"
          options={[
            { id: 'true', label: 'True severe AS', verdict: 'best', points: 6, why: 'Flow rose 45% and the gradient climbed to 46 while the AVA stayed ≤ 1.0: a fixed valve.' },
            { id: 'pseudo', label: 'Pseudo-severe', verdict: 'wrong', points: 0, why: 'The valve did not open.' },
            { id: 'ind', label: 'Indeterminate', verdict: 'wrong', points: 0, why: 'He had contractile reserve.' },
          ]} />
        <Decision id="s2-dB" question="Patient B?"
          options={[
            { id: 'pseudo', label: 'Pseudo-severe AS — a weak LV could not open a moderate valve', verdict: 'best', points: 6, why: 'With more flow the AVA rose to 1.3 and the gradient stayed low. Treat the cardiomyopathy.' },
            { id: 'true', label: 'True severe', verdict: 'wrong', points: 0, why: 'The valve opened.' },
            { id: 'ind', label: 'Indeterminate', verdict: 'wrong', points: 0, why: 'Flow rose 57%.' },
          ]} />
        <Decision id="s2-dC" question="Patient C?"
          options={[
            { id: 'ind', label: 'No contractile reserve — indeterminate; get a CT calcium score', verdict: 'best', points: 6, why: 'Stroke volume barely rose, so the test cannot judge the valve. Calcium score decides; no reserve carries higher surgical risk but TAVI may still help.' },
            { id: 'true', label: 'True severe', verdict: 'wrong', points: 0, why: 'No flow change, no conclusion.' },
            { id: 'pseudo', label: 'Pseudo-severe', verdict: 'wrong', points: 0, why: 'No flow change, no conclusion.' },
          ]} />
      </div>

      <div className="cs-media-row">
        <Figure src={WIKI('Aortic_valve_stenosis_E00127_(CardioNetworks_ECHOpedia).jpg')} href={WIKIPAGE('Aortic_valve_stenosis_E00127_(CardioNetworks_ECHOpedia).jpg')} alt="Echocardiogram of aortic valve stenosis" caption="A real echocardiogram of aortic valve stenosis." credit="CardioNetworks ECHOpedia, CC BY-SA 3.0, Wikimedia Commons" />
        <Video id="ZJUrSndLd5Q" title="Aortic valve area assessment by the continuity equation" />
      </div>
    </>
  );
}

/* ============================================================
   3 · THE HEART TEAM
   ============================================================ */

function HeartTeam() {
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>Heart team meeting · day 3</div>
        <Table head={['', 'Finding']} rows={[
          ['Symptoms', 'Exertional syncope, angina, NYHA III breathlessness'],
          ['Echo', 'Severe high-gradient AS, tricuspid valve, EF 58%, GLS −14%'],
          ['Coronaries (CT)', 'Moderate non-obstructive disease; no proximal stenosis > 70%'],
          ['STS-PROM / EuroSCORE II', N('3.8% / 3.1%')],
          ['Frailty', 'Clinical Frailty Scale 4; 5-metre walk 6.8 s; independent, lives with his wife'],
          ['Cognition', N('MoCA 26/30')], ['Lungs', 'Mild COPD, FEV₁ 68%'], ['Kidneys', 'eGFR 58'],
          ['His wish', '“I want to be safe to look after my wife — and my garden.”'],
        ]} />
      </div>

      <Decision id="s3-treat" question="Symptomatic severe aortic stenosis. Treat?"
        options={[
          { id: 'avr', label: 'Yes — aortic valve replacement, without delay', verdict: 'best', points: 10,
            why: 'Symptomatic severe AS is a class I indication. Untreated, half of patients with syncope or heart failure are dead within about two to three years — and sudden death is real while he waits.' },
          { id: 'watch', label: 'Medical therapy and surveillance', verdict: 'wrong', points: 0, why: 'No drug opens a calcified valve. Medical therapy only manages blood pressure and fluid.' },
          { id: 'bav', label: 'Balloon valvuloplasty alone', verdict: 'ok', points: 2, why: 'A bridge in the unstable or as a diagnostic test — restenosis within months.' },
        ]} />
      <Decision id="s3-how" question="Which procedure does the heart team recommend?"
        options={[
          { id: 'tavi', label: 'Transfemoral TAVI', verdict: 'best', points: 10,
            why: 'Older patients (≥ 70 years in the 2025 ESC/EACTS guideline) with a tricuspid valve and suitable transfemoral anatomy are generally offered TAVI: faster recovery, no sternotomy, outcomes at least as good at intermediate and low surgical risk.' },
          { id: 'savr', label: 'Surgical AVR', verdict: 'ok', points: 5, why: 'Excellent durability and the choice for younger patients, bicuspid valves with difficult anatomy, or when other cardiac surgery is needed — not his profile.' },
          { id: 'ta', label: 'Transapical TAVI', verdict: 'wrong', points: 1, why: 'For when the femoral route is impossible; more invasive and worse outcomes.' },
        ]} />
      <Contrast title="TAVI vs surgical AVR"
        is={{ h: 'TAVI', points: ['Through the femoral artery, under sedation, home in 1–3 days.', 'Native leaflets pushed aside, not removed.', 'More pacemakers and paravalvular leaks; long-term durability still being written.'] }}
        isnt={{ h: 'Surgical AVR', points: ['Sternotomy and bypass; the calcified valve cut out and the annulus debrided.', 'Fewer pacemakers, less leak, decades of durability data.', 'Longer recovery; more bleeding, AF and kidney injury early.'] }} />
      <Contrast title="tricuspid vs bicuspid aortic stenosis"
        is={{ h: 'Tricuspid, calcific (his)', points: ['Age-related degeneration, usually 70s–80s.', 'Round, predictable annulus.', 'The standard TAVI anatomy.'] }}
        isnt={{ h: 'Bicuspid', points: ['Congenital; stenoses a decade or two earlier.', 'Oval annulus, a calcified raphe, often an aortopathy.', 'TAVI possible in selected anatomy; surgery often preferred in the young or with a dilated aorta.'] }} />

      <div className="cs-h2">The conversation</div>
      <p className="cs-p">You sit down with Mr and Mrs Mansour. He asks: “Doctor, what does this new valve mean for me?”</p>
      <Decision id="s3-talk" question="How do you open?"
        options={[
          { id: 'ask', label: '“Before I explain, tell me what you understand so far — and what matters most to you in the next few years.”', verdict: 'best', points: 8,
            why: 'Start with his understanding and his goals. Then the facts land on something: he wants to be safe, to care for his wife, to garden. Every option can be explained against that.' },
          { id: 'facts', label: 'A clear list of the procedure, its risks and the statistics', verdict: 'ok', points: 4, why: 'Accurate — but a list delivered before you know what matters to him is information, not shared decision-making.' },
          { id: 'tell', label: '“You need a TAVI. It’s the standard of care at your age.”', verdict: 'wrong', points: 0, why: 'A recommendation is right; a verdict without a conversation is not consent.' },
        ]} />
      <Decision id="s3-risk" question="He asks: “What could go wrong?” Which risks must he hear?"
        options={[
          { id: 'full', label: 'Death (~1–2%), stroke (~2%), pacemaker (~10%, higher for him), major bleeding or vascular injury, kidney injury, valve leak, rare emergency surgery — and what happens if he does nothing', verdict: 'best', points: 8,
            why: 'Material risks, specific to him (his long PR raises the pacemaker risk), set against the natural history he would otherwise live with.' },
          { id: 'major', label: 'Only the catastrophic ones: death and stroke', verdict: 'ok', points: 3, why: 'A pacemaker affects his daily life and his driving. He needs to know it is likely enough to plan for.' },
          { id: 'none', label: 'Reassure him that it is very safe', verdict: 'wrong', points: 0, why: 'Reassurance without numbers is not consent.' },
        ]} />

      <Why title="Why the first valve must be chosen with the second one in mind"
        chain={[
          { k: 'DURABILITY', t: 'Tissue valves wear out — often in 10–15 years. A 79-year-old may outlive his valve.' },
          { k: 'VALVE-IN-VALVE', t: 'The next valve goes inside this one, so its size and frame height limit the next result.' },
          { k: 'CORONARIES', t: 'A tall frame and pinned-up leaflets can block access to the coronaries — and the coronary ostia during a second TAVI.' },
          { k: 'PLAN NOW', t: '“Lifetime management”: valve type, size and commissural alignment are chosen today for the procedure in 2040.' },
        ]} />

      <MultiSelect id="s3-workup" question="What must happen before his TAVI?"
        items={[
          { id: 'ct', label: 'ECG-gated CT of the aortic root and the iliofemoral arteries', correct: true, why: 'Sizes the valve, measures coronary heights, checks the route.' },
          { id: 'cor', label: 'Coronary assessment (CT or invasive angiography)', correct: true, why: 'Significant proximal disease may need PCI before TAVI.' },
          { id: 'dental', label: 'A dental review', correct: true, why: 'A new prosthetic valve is an endocarditis target; treat dental sepsis first.' },
          { id: 'ecg', label: 'Baseline ECG conduction: PR, QRS, bundle branch block', correct: true, why: 'Pre-existing conduction disease — especially right bundle branch block — predicts heart block after TAVI.' },
          { id: 'goals', label: 'Frailty, cognition and his goals of care', correct: true, why: 'Futility is real in the very frail; he is not.' },
          { id: 'pciall', label: 'Stent every coronary plaque first', correct: false, why: 'Only significant proximal disease supplying a large territory.' },
          { id: 'mri', label: 'Cardiac MRI in every case', correct: false, why: 'Useful for selected questions; not a routine requirement.' },
        ]} />
      <Why title="Why right bundle branch block before TAVI predicts complete heart block after it"
        chain={[
          { k: 'TWO WIRES', t: 'Below the His bundle, conduction runs down two branches: right and left.' },
          { k: 'THE FRAME', t: 'TAVI injures the LEFT bundle, which runs right under the membranous septum.' },
          { k: 'ALREADY CUT', t: 'If the right bundle is already blocked, the left is the only path left.' },
          { k: 'BOTH GONE', t: 'Injure it and nothing reaches the ventricles: complete heart block.' },
        ]}>
        He has no RBBB — but his long PR says his conduction system is not pristine either.
      </Why>
      <Video id="4JgN8zCkOTY" title="Understanding transcatheter aortic valve replacement (TAVR)" channel="Edwards Lifesciences" />
    </>
  );
}

/* ============================================================
   4 · CT PLANNING
   ============================================================ */

function Planning() {
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>ECG-gated CT · systolic phase</div>
        <Table head={['Measure', 'Value', 'Meaning']} rows={[
          ['Annulus diameters', N('27.2 × 22.0 mm'), 'Oval, as most annuli are'],
          ['Annulus area / perimeter', N('470 mm² / 78 mm'), 'The numbers valves are sized to'],
          ['Left main height', N('12.5 mm'), '> 10–12 mm: low obstruction risk'],
          ['RCA height', N('16 mm'), 'Low risk'],
          ['Sinus of Valsalva width', N('31 mm'), 'Room for displaced leaflets'],
          ['LVOT calcium', N('moderate, under the non-coronary cusp', 'cs-hi'), 'Annular rupture and leak risk'],
          ['Membranous septum length', N('4 mm — short', 'cs-hi'), 'Conduction system close to the frame'],
          ['Right common femoral, min. Ø', N('6.6 mm, little calcium'), 'Accepts a 14F expandable sheath'],
          ['Predicted coplanar view', N('LAO 6° / CAU 12°'), 'All three cusps in one line on fluoroscopy'],
        ]} />
      </div>
      <AnnulusSizer />
      <Decision id="s4-size" question="Balloon-expandable sizes: 23 mm (338–430 mm²), 26 mm (430–546 mm²), 29 mm (540–683 mm²). Which for an annulus of 470 mm²?"
        options={[
          { id: '26', label: '26 mm', verdict: 'best', points: 10, why: '470 mm² sits in the 26 mm range, with ~13% area oversizing for a seal.' },
          { id: '23', label: '23 mm — smaller is safer', verdict: 'wrong', points: 0, why: 'Undersized by 12%: paravalvular leak, and the valve can migrate.' },
          { id: '29', label: '29 mm — bigger seals better', verdict: 'wrong', points: 0, why: '40% oversizing into calcified LVOT is how annular rupture happens.' },
        ]} />
      <Decision id="s4-cor" question="A different patient: left main height 8 mm, sinus width 27 mm, bulky leaflet tips. What is the risk, and the plan?"
        options={[
          { id: 'obs', label: 'High risk of coronary obstruction: the displaced leaflet can seal the ostium. Plan coronary protection (a wire and stent ready in the left main) or leaflet modification', verdict: 'best', points: 8,
            why: 'Low ostium + narrow sinus + bulky leaflet = the native leaflet is pushed straight over the coronary. It presents as sudden hypotension and ST change seconds after deployment.' },
          { id: 'none', label: 'No issue — TAVI does not affect the coronaries', verdict: 'wrong', points: 0, why: 'Coronary obstruction is rare, often fatal, and predictable on CT.' },
        ]} />
      <Decision id="s4-access" question="Access route for him?"
        options={[
          { id: 'rcf', label: 'Right common femoral artery, ultrasound-guided, with pre-closure sutures', verdict: 'best', points: 10, why: 'Adequate size, little calcium, no tortuosity. Plan closure before you open.' },
          { id: 'sub', label: 'Subclavian', verdict: 'ok', points: 3, why: 'An alternative when the femoral route fails.' },
          { id: 'ta', label: 'Transapical', verdict: 'wrong', points: 0, why: 'Unnecessary with good femoral access.' },
        ]} />
      <Contrast title="a safe femoral route vs a dangerous one"
        is={{ h: 'Safe', points: ['Minimal diameter comfortably above the sheath’s outer diameter.', 'Little circumferential calcium.', 'Gentle curves; puncture over the femoral head.'] }}
        isnt={{ h: 'Dangerous', points: ['Sheath-to-artery ratio > 1.05.', 'Horseshoe or circumferential calcium — the artery cannot stretch.', 'Severe tortuosity; a high bifurcation; puncture above the ligament.'] }} />
      <Why title="Why a short membranous septum and a deep valve stop the heart"
        chain={[
          { k: 'ANATOMY', t: 'The His bundle emerges beneath the membranous septum, just under the commissure between the non- and right coronary cusps.' },
          { k: 'SHORT SEPTUM', t: 'A short membranous septum puts the His bundle millimetres from the annulus.' },
          { k: 'THE FRAME', t: 'The frame presses outward on the LVOT. The deeper it sits, the more of it pushes on the conducting tissue.' },
          { k: 'OEDEMA', t: 'Pressure, bruising and swelling over 24–72 hours: new LBBB, then sometimes complete heart block — late, on the ward.' },
        ]}>
        A useful rule: implant depth greater than the membranous septum length predicts a pacemaker. His septum is 4 mm. Aim high.
      </Why>
    </>
  );
}

/* ============================================================
   5 · ACCESS & SETUP
   ============================================================ */

function Setup() {
  return (
    <>
      <MultiSelect id="s5-check" question="Pre-procedure checklist in the hybrid lab — what must be done?"
        items={[
          { id: 'abx', label: 'Prophylactic antibiotic (e.g. cefazolin) before the sheath goes in', correct: true, why: 'A prosthetic valve and a large sheath.' },
          { id: 'xm', label: 'Group and save / crossmatch', correct: true, why: 'Vascular injury and annular rupture bleed fast.' },
          { id: 'surg', label: 'Perfusion and cardiac surgery informed and available', correct: true, why: 'Bailout for rupture, embolisation, coronary obstruction.' },
          { id: 'pads', label: 'Defibrillator pads on', correct: true, why: 'Rapid pacing can degenerate into VF.' },
          { id: 'cons', label: 'Consent confirmed, including pacemaker risk', correct: true, why: 'Already discussed — re-confirm.' },
          { id: 'ga', label: 'Mandatory general anaesthetic', correct: false, why: 'Not mandatory — see below.' },
        ]} />
      <Decision id="s5-anaes" question="Anaesthesia?"
        options={[
          { id: 'sed', label: 'Local anaesthetic with light conscious sedation, anaesthetist present', verdict: 'best', points: 10, why: 'Minimalist transfemoral TAVI: faster recovery, less delirium, outcomes at least as good.' },
          { id: 'ga', label: 'General anaesthetic with intubation', verdict: 'ok', points: 4, why: 'Still used for complex access or patients who cannot lie still. Induction is a high-risk moment in severe AS.' },
          { id: 'spinal', label: 'Spinal anaesthetic', verdict: 'wrong', points: 0, why: 'Sudden sympathetic block in severe AS: profound, refractory hypotension.' },
        ]} />
      <Sequence id="s5-seq" question="Put the set-up in order."
        steps={[
          { label: 'Ultrasound-guided puncture of the right common femoral artery; two suture devices placed before upsizing', why: 'Pre-closure: the closing stitches go in while the hole is small.' },
          { label: 'Second arterial access (left femoral or radial) and a pigtail to the non-coronary cusp', why: 'Pressure, and the contrast runs that mark the annulus.' },
          { label: 'Pacing route: temporary wire via the femoral vein to the RV, or pacing through the LV guidewire', why: 'Rapid pacing for deployment, backup pacing for heart block.' },
          { label: 'Heparin to an ACT > 250 s; insert the 14F expandable sheath', why: 'Anticoagulate before the big sheath.' },
          { label: 'Cross the valve with a straight wire; exchange for a pre-shaped stiff LV wire', why: 'The rail the valve rides on, curled safely in the LV apex.' },
        ]} />
      <Decision id="s5-pacetest" question="Before the valve goes in, you test rapid pacing at 180. What are you checking?"
        options={[
          { id: 'cap', label: '1:1 capture, and that arterial pressure falls below ~50 mmHg with the pulse pressure gone', verdict: 'best', points: 8,
            why: 'If the pacing does not capture, or the pressure stays up, the heart will still eject during deployment — and push the valve. Find out now, not mid-inflation.' },
          { id: 'rate', label: 'Only that the box can reach 180', verdict: 'wrong', points: 0, why: 'A number on the pacing box is not a still heart.' },
        ]} />
      <Why title="Why the stiff wire has a curl at its tip"
        chain={[
          { k: 'THE RAIL', t: 'A 14F valve system is pushed up the aorta and around the arch on this wire.' },
          { k: 'FORCE', t: 'All that push ends at the wire tip, in the LV apex.' },
          { k: 'A CURL', t: 'A pre-shaped pigtail curl spreads the force and sits away from the thin apex.' },
          { k: 'DANGER', t: 'A straight stiff tip in the LV can perforate it — tamponade on the table.' },
        ]} />
      <div className="cs-h2">Simultaneous pressures before the valve goes in</div>
      <Hemodynamics mode="as" />
      <Decision id="s5-hemo" question="LV 192/16, aorta 118/64, mean gradient 50 mmHg — and the aortic upstroke is slow. What does that confirm?"
        options={[
          { id: 'sev', label: 'Invasive confirmation of severe AS, consistent with the echo', verdict: 'best', points: 10, why: 'The shaded area between the LV and aortic traces in systole is the gradient. The slow aortic rise is the tardus of his carotid.' },
          { id: 'hcm', label: 'A dynamic subvalvular obstruction', verdict: 'wrong', points: 0, why: 'That would show a late-peaking intracavity gradient and a spike-and-dome aorta.' },
        ]} />
      <Contrast title="peak-to-peak vs peak instantaneous gradient"
        is={{ h: 'Peak-to-peak (cath)', points: ['LV peak minus aortic peak — two moments that never coincide.', 'Here 74 mmHg.', 'Not a physiological event.'] }}
        isnt={{ h: 'Peak instantaneous (Doppler)', points: ['The largest pressure difference at a single instant.', 'Here 85 mmHg — always the higher of the two.', 'The MEAN gradient is the number both methods agree on.'] }} />
      <Video id="_HM6oBp2hpQ" title="Live demonstration — how is TAVR done?" />
    </>
  );
}

/* ============================================================
   6 · STRATEGY
   ============================================================ */

function Strategy() {
  return (
    <>
      <Decision id="s6-predil" question="Predilate the native valve with a balloon first?"
        options={[
          { id: 'direct', label: 'No — direct implantation; predilate only if the valve will not cross', verdict: 'best', points: 10, why: 'Direct TAVI is the norm with modern balloon-expandable valves: one fewer run of rapid pacing, less embolic debris.' },
          { id: 'yes', label: 'Yes — always predilate', verdict: 'ok', points: 4, why: 'Was routine; now selective (very severe calcification, bicuspid, uncrossable).' },
        ]} />
      <Decision id="s6-target" question="Implant target for this patient?"
        options={[
          { id: 'high', label: 'High: about 90 : 10 aortic : ventricular', verdict: 'best', points: 10, why: 'Short membranous septum: keep the frame off the conduction system. High enough to seal, low enough not to embolise.' },
          { id: 'mid', label: 'About 70 : 30', verdict: 'ok', points: 4, why: 'Seals well — but presses on the His bundle in a short septum.' },
          { id: 'deep', label: 'Deep: 50 : 50 for stability', verdict: 'wrong', points: 0, why: 'Stability bought with a pacemaker.' },
        ]} />
      <Decision id="s6-cep" question="Use a cerebral embolic protection filter routinely?"
        options={[
          { id: 'no', label: 'Not routinely: in the large randomised trial it did not reduce stroke overall', verdict: 'best', points: 6, why: 'Filters catch debris, but stroke rates were not lower with routine use (BHF PROTECT-TAVI). Selective use is still debated.' },
          { id: 'yes', label: 'Yes — filters prevent stroke', verdict: 'wrong', points: 0, why: 'Intuitive, and not borne out for routine use.' },
        ]} />
      <Contrast title="balloon-expandable vs self-expanding valves"
        is={{ h: 'Balloon-expandable', points: ['Expanded by a balloon on rapid pacing, in seconds.', 'Short frame at the annulus; not recapturable.', 'Lower pacemaker rates; slightly higher gradients in small annuli.'] }}
        isnt={{ h: 'Self-expanding', points: ['Nitinol unsheathes and opens itself, slowly; often recapturable.', 'Tall frame, supra-annular leaflets: better gradients in small annuli.', 'More pressure on the LVOT for longer: more pacemakers.'] }} />
      <Why title="Why rapid pacing at 180 makes deployment possible"
        chain={[
          { k: 'EJECTION', t: 'Each heartbeat pushes 70 mL through the valve with real force.' },
          { k: 'RAPID PACING', t: 'At 180 the ventricle cannot fill between beats; stroke volume falls almost to zero.' },
          { k: 'STILL HEART', t: 'No ejection, no pulse pressure, no forward push on the balloon.' },
          { k: 'PRECISION', t: 'The valve expands exactly where you put it. Then pacing stops and the heart recovers within seconds — if it was not paced too long.' },
        ]} />
    </>
  );
}

/* ============================================================
   7 · DEPLOYMENT
   ============================================================ */

function Deploy() {
  const { answers, answer, setVitals, bump } = useCase();
  const res = answers['s7-deploy'];
  const aorto = answers['s7-aorto'];
  const verdict = !res ? null : res.migrated ? 'wrong' : res.depth >= 5 && res.depth <= 20 ? 'best' : res.depth > 20 && res.depth <= 30 ? 'ok' : 'wrong';
  return (
    <>
      <p className="cs-p">The 26 mm valve is crimped on its balloon, across the native valve on the stiff wire. First confirm the coplanar view; then position against the pigtail’s annulus line, rapid pace, and inflate.</p>
      {!aorto ? (
        <button className="cs-btn" onClick={() => { answer('s7-aorto', true); bump({ contrast: 15, fluoro: 20, kerma: 30 }); }}>Root aortogram in LAO 6° / CAU 12° (15 mL)</button>
      ) : (
        <div className="cs-fb best">All three cusps in a line, the pigtail at the floor of the non-coronary cusp. The CT-predicted view was right — this is the annulus plane you will deploy against.</div>
      )}
      <ScoreOnce id="s7-aorto" pts={aorto ? 6 : res ? 0 : null} max={6} />
      <TaviDeploy done={res} onResult={(r) => {
        answer('s7-deploy', r);
        bump({ contrast: 25, fluoro: 420, kerma: 260 });
        if (r.migrated) setVitals({ sys: 92, dia: 50, hr: 96 }); else setVitals({ sys: 128, dia: 62, hr: 78 });
      }} />
      {res && (
        <div className={'cs-fb ' + verdict}>
          {res.migrated
            ? 'Inflated without rapid pacing: the ejecting ventricle shoved the expanding valve up toward the aorta. In real life — a leaking, malpositioned or embolised valve, and a second valve or surgery.'
            : res.depth < 5 ? 'Too high: barely in the annulus. Risk of embolisation into the aorta and of a paravalvular leak.'
            : res.depth <= 20 ? 'On target. Sealed in the annulus, the frame kept off the conduction system as far as it can be.'
            : res.depth <= 30 ? 'Acceptable seal, but deeper than planned for a short septum: expect conduction changes.'
            : 'Deep: the frame is pressing into the LVOT below the membranous septum. Heart block is likely.'}
        </div>
      )}
      <ScoreOnce id="s7-dep" pts={verdict == null ? null : verdict === 'best' ? 20 : verdict === 'ok' ? 10 : 0} max={20} />
      {res && (
        <>
          <div className="cs-h2">After deployment</div>
          <Hemodynamics mode="post" />
          <Decision id="s7-ari" question="Ao 128/62, LV end-diastolic pressure 16. Aortic regurgitation index = (aortic diastolic − LVEDP) ÷ aortic systolic × 100. What is it, and what does it mean?"
            options={[
              { id: '36', label: '≈ 36 — above 25: no significant regurgitation', verdict: 'best', points: 8,
                why: '(62 − 16) ÷ 128 × 100 ≈ 36. Significant regurgitation drops the aortic diastolic pressure and raises the LVEDP, pushing the index below 25 — which predicts worse survival.' },
              { id: '18', label: '≈ 18 — significant leak', verdict: 'wrong', points: 0, why: 'Recalculate: (62 − 16) ÷ 128.' },
              { id: '48', label: '≈ 48 — the formula uses the systolic pressure as the numerator', verdict: 'wrong', points: 0, why: 'Diastolic minus LVEDP, over systolic.' },
            ]} />
          <Doppler kind="cw-as" vmax={2.1} title="Transthoracic echo on the table: CW through the new valve" />
          <MultiSelect id="s7-echo" question="What else must that on-table echo rule out?"
            items={[
              { id: 'eff', label: 'A new pericardial effusion', correct: true, why: 'Annular rupture or LV wire perforation.' },
              { id: 'wma', label: 'A new regional wall-motion abnormality', correct: true, why: 'Coronary obstruction.' },
              { id: 'pvl', label: 'The grade and site of any paravalvular leak', correct: true, why: 'Moderate or worse needs post-dilation or a second valve.' },
              { id: 'mv', label: 'Mitral valve damage from the stiff wire', correct: true, why: 'The wire can catch the chordae.' },
              { id: 'ef', label: 'A full strain analysis', correct: false, why: 'Not on the table.' },
            ]} />
          <Decision id="s7-pvl" question="Echo shows a trace paravalvular jet at the non-coronary cusp, mean gradient 7 mmHg, no effusion, no new wall-motion abnormality. Next?"
            options={[
              { id: 'accept', label: 'Accept: excellent result. Close the access, check the femoral artery, transfer to the unit', verdict: 'best', points: 10, why: 'Trace or mild paravalvular leak is common and benign. Moderate or worse would need post-dilation.' },
              { id: 'post', label: 'Post-dilate to abolish the trace leak', verdict: 'wrong', points: 2, why: 'Extra expansion in a calcified LVOT for a benign finding: annular rupture risk, and more pressure on the conduction system.' },
              { id: 'second', label: 'A second valve inside the first', verdict: 'wrong', points: 0, why: 'For a malpositioned valve or severe leak only.' },
            ]} />
          <Decision id="s7-close" question="Closing up. The temporary pacing wire?"
            options={[
              { id: 'keep', label: 'Check the rhythm before removing it: if new LBBB or a longer PR appears, keep the wire in for 24 hours', verdict: 'best', points: 6,
                why: 'Conduction changes on the table predict heart block later. A wire already in the RV is far easier than a new one at 3 am. His ECG on the table is unchanged — so it comes out.' },
              { id: 'always', label: 'Always remove it on the table', verdict: 'ok', points: 2, why: 'Often right, but decide on the ECG, not by habit.' },
            ]} />
        </>
      )}
      <div className="cs-media-row" style={{ marginTop: 12 }}>
        <Video id="f20qrZcD1LE" title="Edwards SAPIEN 3 TAVR — transfemoral implant procedure animation" channel="Edwards Lifesciences" />
        <Video id="LjeTOQ-UmYE" title="Edwards SAPIEN transfemoral TAVR procedure animation" channel="Edwards Lifesciences" />
      </div>
    </>
  );
}

/* ============================================================
   8 · BACK ON THE UNIT
   ============================================================ */

const SERIAL = [
  { id: 'base', label: 'Pre-TAVI', pr: 0.21, lbbb: false, note: 'PR 210 ms, QRS 108 ms. LVH with strain.' },
  { id: 'post', label: '16:30 · 4 h after', pr: 0.23, lbbb: true, note: 'New LBBB: QRS 152 ms. PR 230 ms.' },
  { id: 'day1', label: 'Day 1 · 08:00', pr: 0.26, lbbb: true, note: 'QRS 158 ms. PR 260 ms — both lengthening.' },
];

function Recovery() {
  const { answers } = useCase();
  const [ecg, setEcg] = useState('post');
  const E = SERIAL.find(x => x.id === ecg);
  const deep = answers['s7-deploy'] && (answers['s7-deploy'].depth > 20 || answers['s7-deploy'].migrated);
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">16:30</span>Bed 1, Valvular & Structural Heart Unit. Sitting up, eating, the groin dry. “I can breathe already.” The table ECG was unchanged, so the temporary wire came out. Then the four-hour ECG arrives{deep ? ' — and the deep implant has left its mark' : ''}.</p>
      </div>
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {SERIAL.map(s => <button key={s.id} className={'cs-chip' + (ecg === s.id ? ' on' : '')} onClick={() => setEcg(s.id)}>{s.label}</button>)}
      </div>
      <ECG12 rate={E.id === 'base' ? 72 : 76} pr={E.pr} lbbb={E.lbbb} shape={LVH.shape} st={E.lbbb ? {} : LVH.st} tInv={E.lbbb ? {} : LVH.tInv} caption={E.note} />
      <Decision id="s8-lbbb" question="Compare the three ECGs. New LBBB after TAVI, and by the next morning the QRS is 158 ms and the PR 260 ms. What now?"
        options={[
          { id: 'progress', label: 'Progressive conduction disease: keep him on telemetry, no rate-slowing drugs, and plan an EP study or pacemaker before discharge — or at least ambulatory monitoring', verdict: 'best', points: 10,
            why: 'Expert consensus: new LBBB with QRS > 150 ms or PR > 240 ms, or any further lengthening, is high risk for delayed high-degree block. Do not send him home blind.' },
          { id: 'home', label: 'Discharge today as planned — LBBB is common after TAVI', verdict: 'wrong', points: 0, why: 'Common is not the same as safe. See the war stories.' },
          { id: 'ppmnow', label: 'Implant a pacemaker immediately, today', verdict: 'ok', points: 4, why: 'Not unreasonable with progression this clear — but an EP study (HV interval) can separate who needs one. Many centres would monitor another 24 hours first.' },
        ]} />
      <Contrast title="what the new LBBB is — and what it isn’t"
        is={{ h: 'Mechanical conduction injury', points: ['The frame pressing on the left bundle under the membranous septum.', 'Can progress as oedema peaks over 24–72 hours.', 'A reason to monitor, not panic.'] }}
        isnt={{ h: 'An acute MI', points: ['Not an ischaemic STEMI equivalent here: no symptoms, no wall-motion change, a known cause.', 'Do not reflexly activate the cath lab.', 'But know Sgarbossa: concordant ST elevation would still mean ischaemia.'] }} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>Day 1 bloods</div>
        <Table head={['Test', 'Pre', 'Day 1']} rows={[
          ['Haemoglobin', N('128 g/L'), N('116 g/L')], ['Creatinine', N('112 µmol/L'), N('131 µmol/L', 'cs-hi')],
          ['Potassium', N('4.6'), N('4.9')], ['hs-Troponin T', N('28'), N('210 ng/L', 'cs-hi')],
        ]} />
      </div>
      <Decision id="s8-bloods" question="Interpret the day-1 bloods."
        options={[
          { id: 'expected', label: 'Expected changes: a modest haemoglobin fall, a small creatinine rise to watch, and a procedural troponin rise — fluids, a repeat in 24 h, no nephrotoxins', verdict: 'best', points: 8,
            why: 'Rapid pacing and valve expansion release troponin without an MI. A 12 g/L haemoglobin drop is typical; a bigger fall means hunting for a bleed (groin, retroperitoneum). Creatinine +19 is below the AKI threshold (≥ 26.5).' },
          { id: 'mi', label: 'A procedural MI — urgent angiography', verdict: 'wrong', points: 0, why: 'No symptoms, no ECG ischaemia beyond the expected LBBB, no new wall-motion abnormality.' },
          { id: 'bleed', label: 'A major bleed — transfuse', verdict: 'wrong', points: 0, why: 'Not at 116 with a dry groin and stable observations.' },
        ]} />
      <MultiSelect id="s8-checks" question="What else do you check on his first evening?"
        items={[
          { id: 'groin', label: 'Groin and distal pulses', correct: true, why: 'Vascular complications are the commonest major complication of transfemoral TAVI.' },
          { id: 'neuro', label: 'A neurological check', correct: true, why: 'Stroke risk peaks in the first days.' },
          { id: 'mob', label: 'Mobilise early', correct: true, why: 'Less delirium, less deconditioning.' },
          { id: 'delir', label: 'Screen for delirium', correct: true, why: 'Common in the elderly after any procedure; worsens outcomes.' },
          { id: 'bed', label: 'Strict bed rest for 48 hours', correct: false, why: 'Not needed after a closed femoral access.' },
          { id: 'amlo', label: 'Restart full-dose amlodipine tonight', correct: false, why: 'His afterload just fell; restart blood-pressure drugs cautiously against his readings.' },
        ]} />
    </>
  );
}

/* ============================================================
   9 · THE NIGHT: COMPLETE HEART BLOCK
   ============================================================ */

function HeartBlock() {
  const { answers, answer, setVitals, advanceClock } = useCase();
  const pace = answers['s9-pace'];
  const paced = !!pace && pace.captured;
  const ppm = answers['s9-ppm'];
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>03:10</span>
          Night two. The telemetry alarms. The nurse finds him grey, “dizzy… far away”. He answers slowly. His wife went home at ten.
        </p>
      </div>
      <BedsideMonitor />
      <ECG12 rate={paced ? 70 : 34} rhythm={paced ? 'paced' : 'chb'} atrialRate={84}
        caption={paced ? 'Paced at 70: a spike before every broad complex, each followed by a pulse.' : 'P waves march through at 84; broad escape complexes at 34; no relationship between them — complete heart block with a ventricular escape.'} />

      <Decision id="s9-rhythm" question="What is the rhythm?"
        options={[
          { id: 'chb', label: 'Complete (third-degree) heart block with a broad-complex ventricular escape', verdict: 'best', points: 10, why: 'Regular P waves and regular QRS complexes, each marching to its own rate, and no fixed PR interval.' },
          { id: 'mob1', label: 'Mobitz I (Wenckebach)', verdict: 'wrong', points: 0, why: 'Wenckebach lengthens the PR until one P drops; there is still a relationship.' },
          { id: 'sb', label: 'Sinus bradycardia', verdict: 'wrong', points: 0, why: 'The atria are going at 84.' },
          { id: 'af', label: 'Slow AF', verdict: 'wrong', points: 0, why: 'There are clear P waves.' },
        ]} />
      <Decision id="s9-level" question="Where is the block, and what does that predict about atropine?"
        options={[
          { id: 'infra', label: 'Below the AV node — in the His–Purkinje system, where the frame pressed. Atropine will probably not help', verdict: 'best', points: 10,
            why: 'Atropine speeds the sinus node and AV-node conduction by blocking the vagus. The His bundle and bundle branches have little vagal supply. The escape is broad and slow — infranodal.' },
          { id: 'nodal', label: 'In the AV node — atropine will fix it', verdict: 'wrong', points: 0, why: 'Nodal block gives a narrow junctional escape at 40–60 and often responds to atropine. This is neither.' },
        ]} />
      <Contrast title="nodal vs infranodal block"
        is={{ h: 'Block in the AV node', points: ['Narrow escape (junctional), 40–60 /min, fairly stable.', 'Vagal, ischaemic (inferior MI) or drug-induced.', 'Often responds to atropine; often recovers.'] }}
        isnt={{ h: 'Block below the node (His–Purkinje)', points: ['Broad escape, 20–40 /min, unreliable — it can stop.', 'Structural: TAVI, anterior MI, fibrosis.', 'Atropine rarely helps; pace.'] }} />

      <MultiSelect id="s9-now" question="In the next five minutes?"
        items={[
          { id: 'pads', label: 'Pads on; transcutaneous pacing ready to go', correct: true, why: 'The fastest way to a reliable rate.' },
          { id: 'iso', label: 'Isoprenaline (or adrenaline) infusion as a bridge', correct: true, why: 'Beta-agonists can speed an infranodal escape where atropine cannot.' },
          { id: 'tvp', label: 'Call for urgent temporary transvenous pacing', correct: true, why: 'Transcutaneous pacing is a bridge, not a destination.' },
          { id: 'drugs', label: 'Stop any rate-slowing drugs; check potassium', correct: true, why: 'Remove the reversible.' },
          { id: 'senior', label: 'Senior help; resus team aware', correct: true, why: 'A broad escape at 34 can become asystole.' },
          { id: 'wait', label: 'Atropine and observe — it often settles', correct: false, why: 'The level of the block says otherwise.' },
          { id: 'fluid', label: 'Fluids and repeat obs in an hour', correct: false, why: 'The problem is rate, not volume.' },
        ]} />

      <div className="cs-h2">Transcutaneous pacing — find capture</div>
      <p className="cs-p">Pads are on: anterior–posterior. Fentanyl 25 µg and midazolam 1 mg for the pain. Choose a rate, start pacing, and raise the output until you see capture — then prove it.</p>
      <Pacer done={pace} onConfirm={(r) => {
        answer('s9-pace', r);
        if (r.captured) { setVitals({ hr: r.rate, sys: 112, dia: 64, rhythm: 'paced' }); advanceClock(8); }
      }} />
      {pace && (
        <div className={'cs-fb ' + (!pace.captured ? 'wrong' : pace.mA <= pace.threshold + 20 ? 'best' : 'ok')}>
          {!pace.captured
            ? `At ${pace.mA} mA there is a spike and a big artefact, but no broad complex and no pulse at the pacing rate — this is not capture. Electrical capture starts at ${pace.threshold} mA in him. In a real emergency, this mistake leaves the patient barely perfused while the monitor looks “paced”.`
            : pace.mA <= pace.threshold + 20 ? `Capture at ${pace.mA} mA — just above threshold (${pace.threshold} mA), with a femoral pulse at ${pace.rate}. Set the output ~10% above threshold.`
            : `Captured — but at ${pace.mA} mA, far above the ${pace.threshold} mA threshold. It works and it hurts: find the threshold, then add a 10% margin.`}
        </div>
      )}
      <ScoreOnce id="s9-pacing" pts={pace == null ? null : !pace.captured ? 0 : pace.mA <= pace.threshold + 20 ? 15 : 8} max={15} />
      {pace && !pace.captured && (
        <button className="cs-btn danger" onClick={() => { answer('s9-pace', { ...pace, mA: pace.threshold + 6, captured: true, rescued: true }); setVitals({ hr: pace.rate, sys: 112, dia: 64, rhythm: 'paced' }); advanceClock(8); }}>Your registrar turns it up to {pace.threshold + 6} mA</button>
      )}
      <Contrast title="electrical capture vs mechanical capture"
        is={{ h: 'Electrical capture', points: ['A broad QRS and T after every spike.', 'Confirms the current depolarises the ventricle.', 'Necessary — not sufficient.'] }}
        isnt={{ h: 'Mechanical capture', points: ['A pulse (femoral — not carotid, where muscle twitch fools you) or a pleth wave after every spike.', 'Confirms the depolarisation produces a beat.', 'The only proof the patient is perfused.'] }} />

      {paced && (
        <>
          <Decision id="s9-next" question="By morning he is still in complete heart block on a temporary transvenous wire. Next?"
            options={[
              { id: 'ppm', label: 'Permanent pacemaker before discharge', verdict: 'best', points: 10, why: 'Persistent high-degree AV block after TAVI is a clear indication. Waiting days for recovery keeps him in bed with a wire in his heart.' },
              { id: 'wait', label: 'Wait two weeks to see if it recovers', verdict: 'wrong', points: 1, why: 'Prolonged temporary pacing carries infection, displacement and immobility.' },
              { id: 'remove', label: 'Remove the wire and monitor', verdict: 'wrong', points: 0, why: 'A broad escape at 34 is not a safety net.' },
            ]} />
          <Decision id="s9-type" question="Which pacing system?"
            options={[
              { id: 'csp', label: 'Dual-chamber, ideally with conduction-system (left bundle branch area) pacing for the ventricular lead', verdict: 'best', points: 8,
                why: 'He will be paced most of the time. Pacing the RV apex for years can weaken the LV (pacing-induced cardiomyopathy); pacing the conduction system keeps the ventricles activating normally. The atrial lead keeps AV synchrony — his stiff LV needs the atrial kick.' },
              { id: 'rv', label: 'Dual-chamber with a standard RV apical lead', verdict: 'ok', points: 5, why: 'Reliable and widely used; watch the LV function over time.' },
              { id: 'vvi', label: 'A single-chamber ventricular pacemaker', verdict: 'wrong', points: 1, why: 'Loses AV synchrony: a hypertrophied LV depends on the atrial contribution.' },
            ]} />
          {!ppm ? (
            <button className="cs-btn primary" onClick={() => { answer('s9-ppm', true); setVitals({ hr: 70, sys: 124, dia: 68, rhythm: 'paced' }); advanceClock(min(9, 0)); }}>Implant the permanent pacemaker</button>
          ) : (
            <div className="cs-fb best">Dual-chamber pacemaker implanted via the left cephalic vein, ventricular lead in the left bundle branch area. Paced QRS 118 ms. Walking the corridor by the evening.</div>
          )}
        </>
      )}
      <Why title="Why atropine fails him"
        chain={[
          { k: 'ATROPINE', t: 'Blocks acetylcholine at the vagus’s muscarinic receptors.' },
          { k: 'WHERE THE VAGUS IS', t: 'Richly in the sinus node and the AV node.' },
          { k: 'WHERE IT ISN’T', t: 'Sparsely in the His bundle and bundle branches.' },
          { k: 'HIS BLOCK', t: 'Is mechanical injury of the His–Purkinje system by the frame. Removing vagal tone changes nothing there.' },
        ]}>
        Worse: atropine speeds the atria, and in infranodal block more atrial impulses can mean fewer conducted beats. Know the level of the block before reaching for the drug.
      </Why>
    </>
  );
}

/* ============================================================
   THE VICIOUS CYCLE
   ============================================================ */

function Cycles() {
  return (
    <>
      <p className="cs-p">Tap each step. The green scissors mark where treatment cuts in.</p>
      <ViciousCycle id="cyc-as" title="The aortic stenosis spiral — why hypotension kills these patients"
        nodes={[
          { short: 'Fixed valve', t: 'A fixed obstruction raises LV systolic pressure', d: 'The LV must generate 190 mmHg to put 118 into the aorta.' },
          { short: 'Thick LV', t: 'The LV thickens to cope', d: 'Concentric hypertrophy normalises wall stress — at a price.' },
          { short: 'Starved wall', t: 'The thick wall outgrows its blood supply', d: 'More muscle, same capillaries, high diastolic pressure squeezing the subendocardium: angina with normal coronaries.' },
          { short: 'Hypotension', t: 'Any fall in blood pressure', d: 'A vasodilator, a spinal, bleeding, AF, sepsis — and output cannot rise to compensate.' },
          { short: 'Less perfusion', t: 'Coronary perfusion pressure falls', d: 'Aortic diastolic pressure minus LV diastolic pressure: one falls, the other is already high.' },
          { short: 'Weaker LV', t: 'The ischaemic LV pumps less', d: 'Output falls further; pressure falls further. The spiral ends in arrest that CPR cannot reverse — chest compressions cannot push blood through the valve.' },
        ]}
        breaks={[
          { at: 0, t: 'Replace the valve — the definitive cut.' },
          { at: 3, t: 'Avoid vasodilators: nitrates, carelessly titrated vasodilators, spinal anaesthesia.' },
          { at: 3, t: 'Treat hypotension with an alpha-agonist (phenylephrine/metaraminol): it raises aortic diastolic pressure without speeding the heart.' },
          { at: 2, t: 'Keep the rate slow-normal: diastole is when the thick wall is perfused.' },
          { at: 5, t: 'Restore sinus rhythm in new AF: the stiff LV depends on the atrial kick for up to 40% of its filling.' },
        ]} />
      <Decision id="cyc-pe" question="During an emergency operation he drops to 70/40. Why phenylephrine rather than ephedrine or dobutamine?"
        options={[
          { id: 'alpha', label: 'Pure vasoconstriction raises diastolic and coronary perfusion pressure without tachycardia', verdict: 'best', points: 10, why: 'Tachycardia shortens diastole and raises demand in a starving, thick LV. You want pressure, not rate.' },
          { id: 'ino', label: 'Inotropes are dangerous in all valve disease', verdict: 'wrong', points: 0, why: 'Not true — they have a role when the LV has failed. The reasoning here is about rate and perfusion pressure.' },
          { id: 'none', label: 'It makes no difference', verdict: 'wrong', points: 0, why: 'It makes all the difference.' },
        ]} />

      <ViciousCycle id="cyc-af" title="The AF spiral — when the atrial kick is lost"
        nodes={[
          { short: 'AF starts', t: 'New atrial fibrillation', d: 'The atria quiver instead of contracting.' },
          { short: 'Kick lost', t: 'The stiff LV loses its last-second top-up', d: 'A thick ventricle gets up to 40% of its filling from atrial contraction.' },
          { short: 'Fast & short', t: 'A fast ventricular rate shortens diastole', d: 'Less filling time, less coronary perfusion time.' },
          { short: 'Output falls', t: 'Stroke volume and pressure fall', d: 'Through a fixed valve, nothing compensates.' },
          { short: 'Ischaemia', t: 'The starving LV stiffens further; LA pressure climbs', d: 'Pulmonary oedema — and a stretched atrium that keeps the AF going.' },
        ]}
        breaks={[
          { at: 0, t: 'Unstable: synchronised cardioversion — restore the kick.' },
          { at: 2, t: 'Rate control carefully (avoid big doses of vasodilating calcium blockers).' },
          { at: 3, t: 'Treat hypotension with an alpha-agonist, not a vasodilator.' },
          { at: 1, t: 'Long term: replace the valve, anticoagulate the AF.' },
        ]} />

      <ViciousCycle id="cyc-block" title="The heart-block spiral — 03:10"
        nodes={[
          { short: 'Frame pressure', t: 'The frame bruises the His bundle', d: 'Oedema peaks over days.' },
          { short: 'Escape at 34', t: 'Block: a slow, broad ventricular escape', d: 'Output = stroke volume × rate. The rate has halved.' },
          { short: 'Low output', t: 'Pressure and cerebral flow fall', d: 'Dizzy, grey, slow to answer.' },
          { short: 'Ischaemic tissue', t: 'Hypotension starves the conduction tissue and the LV', d: 'Escape pacemakers become less reliable.' },
          { short: 'Asystole', t: 'The escape slows or stops', d: 'The end of the loop — sudden death in a patient who was “doing well”.' },
        ]}
        breaks={[
          { at: 1, t: 'Pace: transcutaneous now, transvenous next, permanent before discharge.' },
          { at: 1, t: 'Isoprenaline speeds the escape as a bridge.' },
          { at: 0, t: 'Prevent it: aim high in a short membranous septum, avoid post-dilation without need.' },
          { at: 2, t: 'Telemetry long enough to catch it.' },
        ]} />
      <Decision id="cyc-cpr" question="Why does cardiac arrest in severe aortic stenosis so often fail to respond to CPR?"
        options={[
          { id: 'valve', label: 'Chest compressions must push blood through the same tiny valve — and the thick LV gets almost no coronary flow', verdict: 'best', points: 10, why: 'Compressions generate little forward flow across a fixed obstruction, and coronary perfusion during CPR is poor in a hypertrophied ventricle. Prevention is everything.' },
          { id: 'ribs', label: 'Elderly patients have brittle ribs', verdict: 'wrong', points: 0, why: 'Not the mechanism.' },
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

      <WarStory title="The spray for angina"
        mistake="Giving sublingual GTN to a patient with chest pain and an unrecognised severe aortic stenosis."
        burn="Chest pain plus an ejection murmur: think fixed output before you think nitrate.">
        <p className="cs-p">An 83-year-old with chest tightness in the emergency department. Two puffs of GTN. Ninety seconds later: pressure 60/30, unresponsive, then PEA. Compressions, adrenaline — the output never came back. The murmur was in the triage note.</p>
      </WarStory>
      <Decision id="mm-gtn" question="What should have happened?"
        options={[
          { id: 'listen', label: 'Examine first: with an AS murmur, avoid nitrates; treat pain with analgesia and assess for ischaemia', verdict: 'best', points: 10, why: 'Thirty seconds with a stethoscope.' },
          { id: 'half', label: 'A smaller dose of GTN', verdict: 'wrong', points: 0, why: 'The mechanism does not care about the dose.' },
        ]} />

      <WarStory title="The hip and the spinal"
        mistake="A spinal anaesthetic for a fractured hip in a patient whose murmur was never investigated."
        burn="A murmur plus a fall or a faint: echo before neuraxial anaesthesia. If surgery cannot wait, a careful general anaesthetic with an arterial line and vasopressor ready.">
        <p className="cs-p">An 86-year-old fell at home — a faint, though nobody asked. Fractured neck of femur. A spinal: within five minutes, pressure 55 systolic, refractory to fluids and boluses. Cardiac arrest on the table. Post-mortem: critical calcific aortic stenosis.</p>
      </WarStory>

      <WarStory title="The gradient that lied"
        mistake="Labelling low-flow, low-gradient aortic stenosis as “moderate” from the mean gradient alone."
        burn="Low gradient + small valve + low flow = ask why. Dobutamine echo or CT calcium score before you call it moderate.">
        <p className="cs-p">A 74-year-old with breathlessness, EF 35%, AVA 0.8 cm², mean gradient 28 mmHg. “Moderate AS, heart failure from his old MI.” Diuretics, clinic in a year. He died at home in seven months. A dobutamine study would have shown the gradient climbing to 46 through a valve that stayed shut.</p>
      </WarStory>
      <Decision id="mm-lflg" question="EF 35%, AVA 0.8 cm², mean gradient 28 mmHg. Next test?"
        options={[
          { id: 'dse', label: 'Low-dose dobutamine stress echo', verdict: 'best', points: 10, why: 'If the flow rises and the AVA stays ≤ 1.0 with the gradient ≥ 40: true severe. If the valve opens: pseudo-severe.' },
          { id: 'repeat', label: 'Repeat the echo in a year', verdict: 'wrong', points: 0, why: 'The story’s mistake.' },
          { id: 'cath', label: 'Coronary angiography only', verdict: 'ok', points: 2, why: 'May be needed — but it does not answer the valve question.' },
        ]} />

      <WarStory title="The leaflet over the ostium"
        mistake="Not measuring the coronary heights on the planning CT."
        burn="Low coronary + narrow sinus + bulky leaflet = obstruction. Read the CT; protect the coronary before you deploy.">
        <p className="cs-p">A smooth deployment in an 81-year-old woman with a small aortic root. Twenty seconds later: pressure 60, ST elevation in I and aVL, a new akinetic anterior wall. The native leaflet had swung up and sealed the left main, 7 mm above the annulus. No wire was in the coronary; re-wiring past a stent frame took twenty minutes. She survived with a large infarct.</p>
      </WarStory>

      <WarStory title="Home with a new LBBB"
        mistake="Next-day discharge after TAVI with a new LBBB and a lengthening PR, without monitoring."
        burn="New conduction disease after TAVI is the warning shot. Monitor long enough to catch the next one.">
        <p className="cs-p">A smooth TAVI, home the next morning — “LBBB is common”. Day four: a fall in the kitchen, a fractured wrist and a head injury. In the emergency department: complete heart block at 28.</p>
      </WarStory>

      <WarStory title="The paced rhythm with no pulse"
        mistake="Accepting pacing spikes on the monitor as capture without feeling for a pulse."
        burn="Electrical capture is not a heartbeat. Feel a femoral pulse with every spike.">
        <p className="cs-p">Transcutaneous pacing for complete heart block. The monitor showed a spike and a broad hump after each one: “paced at 70”. Fifteen minutes later he was unresponsive. The humps were artefact; there had been no capture and no pulse at the pacing rate. The output was below threshold all along.</p>
      </WarStory>

      <WarStory title="Bigger seals better"
        mistake="Oversizing a balloon-expandable valve into a heavily calcified outflow tract, then post-dilating for a trace leak."
        burn="Size to the CT, respect the calcium, and leave a trace leak alone.">
        <p className="cs-p">The annulus measured at the top of the 26 mm range; a 29 mm was chosen “to be safe against leak”. Then a post-dilation for a trace jet. The pressure fell, the echo filled with blood: annular rupture into the pericardium. Emergency sternotomy; he did not leave intensive care.</p>
      </WarStory>
    </>
  );
}

/* ============================================================
   DISCHARGE, FOLLOW-UP & DEBRIEF
   ============================================================ */

function Debrief() {
  const { totals, def } = useCase();
  const pct = totals.max ? Math.round(totals.got / totals.max * 100) : 0;
  const band = pct >= 85 ? 'Distinction' : pct >= 70 ? 'Pass with merit' : pct >= 55 ? 'Pass' : 'Needs another run';
  return (
    <>
      <Decision id="s12-att" question="Antithrombotic therapy after TAVI — he has no other indication for anticoagulation."
        options={[
          { id: 'sapt', label: 'A single antiplatelet (aspirin or clopidogrel), lifelong', verdict: 'best', points: 10, why: 'Single antiplatelet therapy bleeds less than dual, with no more thrombosis (POPular TAVI).' },
          { id: 'dapt', label: 'Aspirin + clopidogrel for 6 months', verdict: 'ok', points: 3, why: 'The old routine — more bleeding, no benefit, unless he has had recent PCI.' },
          { id: 'oac', label: 'A direct oral anticoagulant', verdict: 'wrong', points: 0, why: 'Without AF or another indication, routine anticoagulation after TAVI did worse (GALILEO).' },
        ]} />
      <MultiSelect id="s12-home" question="What goes in his discharge plan?"
        items={[
          { id: 'echo', label: 'Echo at about 30 days as his new baseline', correct: true, why: 'Gradients and leak to compare against for life.' },
          { id: 'endo', label: 'Endocarditis prevention: dental hygiene, antibiotic prophylaxis for dental procedures, a valve card', correct: true, why: 'He now has a prosthetic valve.' },
          { id: 'pace', label: 'Pacemaker check in 4–6 weeks', correct: true, why: 'And see how often he is really paced — some recover conduction.' },
          { id: 'bp', label: 'Re-titrate blood pressure drugs', correct: true, why: 'His afterload has changed; his BP often rises now the valve is open.' },
          { id: 'drive', label: 'Driving advice after a pacemaker', correct: true, why: 'Usually a short period off driving after a pacemaker for block (check local rules).' },
          { id: 'warf', label: 'Lifelong warfarin for the valve', correct: false, why: 'Not for a tissue valve without another indication.' },
        ]} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>Fourteen months later</div>
        <p className="cs-p">He is gardening. Routine echo: mean gradient 21 mmHg (it was 7 at 30 days). CT: a thin layer of thrombus on two leaflets with reduced leaflet motion.</p>
      </div>
      <Decision id="s12-halt" question="What is it, and what do you do?"
        options={[
          { id: 'thromb', label: 'Subclinical leaflet thrombosis (HALT) causing a rising gradient — anticoagulate for about 3 months and re-image', verdict: 'best', points: 8,
            why: 'Thrombus on the leaflets thickens them and raises the gradient; anticoagulation usually dissolves it and the gradient falls back. A rising gradient is never just “wear”.' },
          { id: 'svd', label: 'Structural valve degeneration — plan a valve-in-valve now', verdict: 'wrong', points: 0, why: 'Far too early for wear, and the CT shows thrombus. Treat the reversible first.' },
          { id: 'ignore', label: 'Leave it — he is well', verdict: 'ok', points: 2, why: 'Many centres would not treat HALT without a gradient rise. His gradient has tripled: treat.' },
        ]} />

      <div className="cs-h2">Case quiz</div>
      <Quiz id="s12-quiz" items={[
        { q: 'Which sign suggests severe rather than mild aortic stenosis?', options: ['A loud murmur', 'An early-peaking murmur with an ejection click', 'A late-peaking murmur with a soft A2', 'Radiation to the carotids'], answer: 2, why: 'Late peak and soft A2: rigid leaflets, slow ejection.' },
        { q: 'Squatting makes the murmur of HOCM…', options: ['Louder', 'Softer', 'Unchanged', 'Diastolic'], answer: 1, why: 'A fuller LV holds the walls apart.' },
        { q: 'Vmax 4.6 m/s gives a peak gradient of about…', options: ['18 mmHg', '46 mmHg', '85 mmHg', '120 mmHg'], answer: 2, why: '4 × 4.6² ≈ 85 mmHg.' },
        { q: 'Dobutamine raises stroke volume 40%; AVA rises from 0.8 to 1.3 cm²; gradient stays 26. This is…', options: ['True severe AS', 'Pseudo-severe AS', 'No contractile reserve', 'Paradoxical low-flow AS'], answer: 1, why: 'The valve opened with more flow.' },
        { q: 'A rule of thumb that predicts a pacemaker after TAVI:', options: ['Implant depth greater than the membranous septum length', 'Annulus area above 500 mm²', 'A female patient', 'Mean gradient above 50 mmHg'], answer: 0, why: 'The frame reaches the conduction system.' },
        { q: 'Aortic regurgitation index after TAVI: Ao 120/50, LVEDP 25. The index is…', options: ['≈ 21 — significant regurgitation', '≈ 36 — no significant regurgitation', '≈ 62', 'Cannot be calculated'], answer: 0, why: '(50 − 25) ÷ 120 × 100 ≈ 21: below 25.' },
        { q: 'Hypotension under anaesthesia in severe AS is best treated with…', options: ['Nitrate', 'Phenylephrine', 'Isoprenaline', 'Ephedrine boluses'], answer: 1, why: 'Pressure without tachycardia.' },
        { q: 'Complete heart block after TAVI with a broad escape: atropine…', options: ['Is curative', 'Is usually ineffective — the block is infranodal', 'Is contraindicated in all bradycardia', 'Should be given every 5 minutes until it works'], answer: 1, why: 'Pace.' },
        { q: 'Transcutaneous pacing is confirmed by…', options: ['A spike on the monitor', 'A broad complex after each spike', 'A femoral pulse matching the pacing rate', 'The patient’s chest muscle twitching'], answer: 2, why: 'Mechanical capture is the only proof of perfusion.' },
        { q: 'A gradient rising from 7 to 21 mmHg one year after TAVI, with leaflet thickening on CT:', options: ['Valve-in-valve now', 'Anticoagulate and re-image', 'Ignore', 'Endocarditis — start antibiotics'], answer: 1, why: 'Leaflet thrombosis is reversible.' },
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
          <li className="cs-li">Exertional syncope with an ejection murmur is severe aortic stenosis until proven otherwise. Admit.</li>
          <li className="cs-li">Severity is in the timing, the A2 and the pulse — not the loudness.</li>
          <li className="cs-li">Measure the highest velocity from every window; the LVOT diameter is squared, so trust the dimensionless index.</li>
          <li className="cs-li">The gradient depends on flow. Low gradient + small valve: ask about the flow — dobutamine for a weak LV, calcium score for a small one.</li>
          <li className="cs-li">Fixed output means vasodilators, spinals and tachycardia are dangerous. Treat hypotension with an alpha-agonist.</li>
          <li className="cs-li">Symptomatic severe AS needs a new valve; choose it with the next one in mind.</li>
          <li className="cs-li">Read the CT: annulus, coronary heights, the route — and the membranous septum. Aim high; rapid pace to deploy.</li>
          <li className="cs-li">New LBBB after TAVI that lengthens is the warning shot. Infranodal block: atropine fails — pace, and prove capture with a pulse.</li>
          <li className="cs-li">A rising gradient after TAVI is thrombus until proven otherwise.</li>
        </ol>
      </div>
      <Video id="GGiQIoZMQ_k" title="Aortic stenosis — murmur sound and animation" />
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const VALVE_01 = {
  title: 'Severe aortic stenosis · Exertional syncope · TAVI and complete heart block',
  short: 'Structural Heart · Case 01',
  patient: {
    name: 'Mr Elias Mansour',
    meta: '79 M · MRN 3307-6614 · 78 kg',
    flags: [
      { text: 'Avoid vasodilators — severe AS', tone: 'red' },
      { text: 'Exertional syncope', tone: 'amber' },
      { text: 'eGFR 58', tone: 'amber' },
      { text: 'PR 210 ms', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 100, limit: 215, basis: 'volume/eGFR ≤ 3.7' },
  clock0: min(10, 20),
  vitals0: { hr: 72, sys: 118, dia: 80, spo2: 95, rr: 16, st: -1 },
  brand: { icon: '🫀', line: 'Structural Heart · Case 01' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / IM', tone: 'cyan' },
      { text: 'Structural · high-stakes', tone: 'red' },
      { text: 'ESC/EACTS 2025 VHD-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'The fixed', style: 'outline' },
      { text: 'obstruction', style: 'grad' },
      { text: '& the falling beat', style: 'cyan' },
    ],
    hook: (
      <>
        A retired engineer goes grey among his tomatoes. His heart is pushing every beat through a door <b>0.8 cm² wide</b>.
        One <span className="r">puff of nitrate</span> could kill him. One millimetre too deep with the new valve could <span className="r">stop his heart two nights later</span>.
        Learn to hear severity, to measure it, to replace it — and to recognise <span className="y">the block atropine cannot fix</span>.
      </>
    ),
    image: null,
    sims: 's2',
    crisis: 's9',
    cards: [
      { k: 'The patient', t: 'Mr Elias Mansour, 79 — exertional syncope, angina and breathlessness; a harsh murmur “probably sclerosis”.' },
      { k: 'Your role', t: 'From the emergency department to the heart team, the hybrid lab and the night shift on the unit — and a year later.' },
      { k: 'In your hands', t: 'Heart sounds and manoeuvres, Doppler, dobutamine echo, CT sizing, LV/Ao pressures, TAVI on rapid pacing, serial ECGs, transcutaneous pacing.' },
      { k: 'How it teaches', t: 'Every symptom is one mechanism — a fixed output. Every treatment is a cut in a loop.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'Clinical presentation & triage', Component: Presentation,
      pill: '🫥 The faint on the garden path',
      lede: 'Listen, feel the pulse, read the ECG and the bloods — and decide whether he goes home.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 72, sys: 118, dia: 80, spo2: 95, st: -1, rhythm: 'sinus' }); atLeastClock(min(10, 20)); } },
    { id: 's2', icon: '📏', nav: 'Echo & Doppler', title: 'Measuring it — echo & Doppler', Component: Echo,
      pill: '🔊 Measure the velocity yourself',
      lede: 'CW and PW Doppler, the continuity equation, discordant grading and a dobutamine stress echo.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 70, sys: 122, dia: 80 }); atLeastClock(min(13, 0)); } },
    { id: 's3', icon: '👥', nav: 'Heart Team', title: 'The heart team decision', Component: HeartTeam,
      pill: '🧭 Day 3 — whether, and how',
      lede: 'Treat or watch, TAVI or surgery, the conversation — and the valve after this one.',
      enter: ({ atLeastClock }) => atLeastClock(min(62, 0)) },
    { id: 's4', icon: '🧮', nav: 'CT Planning', title: 'CT planning', Component: Planning,
      pill: '📐 Size it, route it, read the septum',
      lede: 'Annulus sizing, coronary heights, the femoral route — and the membranous septum.',
      enter: ({ atLeastClock }) => atLeastClock(min(63, 0)) },
    { id: 's5', icon: '🩸', nav: 'Access & Setup', title: 'Access & set-up in the hybrid lab', Component: Setup,
      pill: '🧷 Day 5 — pre-close before you open',
      lede: 'Checklist, sedation, access, a pacing test, the stiff wire — and the gradient measured directly.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 74, sys: 124, dia: 78 }); atLeastClock(min(104, 30)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy & decision point', Component: Strategy,
      pill: '🎯 Where the frame will sit',
      lede: 'Predilate or not; the implant target; embolic protection; why the heart must stop for a moment.',
      enter: ({ atLeastClock }) => atLeastClock(min(105, 0)) },
    { id: 's7', icon: '⚡', nav: 'Valve Deployment', title: 'Valve deployment on rapid pacing', Component: Deploy,
      pill: '⏱ Ten seconds at 180 bpm',
      lede: 'Aortogram, position, pace, inflate — then judge the result by pressure and echo.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 74, sys: 122, dia: 70 }); atLeastClock(min(105, 20)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit', Component: Recovery,
      pill: '📟 A warning shot on the ECG',
      lede: 'Bed 1: breathing easier — serial ECGs, day-1 bloods, and a bundle branch block that keeps growing.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 76, sys: 132, dia: 70, rhythm: 'sinus' }); atLeastClock(min(112, 30)); } },
    { id: 's9', icon: '🚨', nav: 'Night Crisis', title: 'Night two: complete heart block', Component: HeartBlock,
      pill: '🌙 03:10 — the beat falls away',
      lede: 'Name the rhythm, find the level, pace — and prove it with a pulse.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 34, sys: 78, dia: 46, rhythm: 'chb' }); atLeastClock(min(147, 10)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'One fixed door explains every symptom — and every danger.',
      enter: ({ setVitals }) => setVitals({ hr: 70, sys: 124, dia: 68, rhythm: 'paced' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Seven patients who taught these rules the hard way.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, follow-up & assessment', Component: Debrief,
      pill: '🎓 A year later — score & take-home',
      lede: 'Antithrombotics, follow-up, a rising gradient — then your score.',
      enter: ({ setVitals }) => setVitals({ hr: 70, sys: 128, dia: 70, rhythm: 'paced' }) },
  ],
};

export default function Valve01({ onClose }) {
  return <CaseShell def={VALVE_01} onClose={onClose} />;
}
