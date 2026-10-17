import React, { useState } from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import { PSAuscultation, PSDoppler, BalloonSizer, Valvuloplasty, PullbackTrace, SuicideRV } from './sims.jsx';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 10
   Severe valvular pulmonary stenosis in a 24-year-old woman with
   Noonan features, exertional presyncope and plans for pregnancy.
   The ejection click that disappears on inspiration; RV pressure
   from the TR jet that is NOT pulmonary hypertension; balloon
   sizing and valvuloplasty for a doming valve; and, on the unit,
   the "suicide right ventricle" — dynamic infundibular obstruction
   after relief, where inotropes kill and volume and beta-blockade
   save.

   Clinical content follows the 2020 ESC guidelines for the
   management of adult congenital heart disease (with the 2018
   AHA/ACC ACHD guideline where they differ), the EAE/ASE
   recommendations on valve stenosis echo, the 2018 ESC guideline
   on cardiovascular disease in pregnancy and the 2023 ESC
   endocarditis guideline, simplified for teaching.
   ============================================================ */

const min = (h, m) => h * 60 + m;

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

/* Channel searches for this case (no video IDs — the learner opens the search). */
const PS_SEARCHES = [
  { name: 'CCC Live Cases — pulmonary valvuloplasty', url: 'https://www.youtube.com/@CCCLiveCases/search?query=pulmonary%20valvuloplasty', note: 'Live structural cases' },
  { name: 'Gulf Intervention Society — pulmonary valvuloplasty', url: 'https://www.youtube.com/@gulfinterventionsociety/search?query=pulmonary%20valvuloplasty', note: 'Case presentations' },
  { name: 'Interventional Cardiology — pulmonary stenosis', url: 'https://www.youtube.com/@interventionalcardiologyis3814/search?query=pulmonary%20stenosis', note: 'Structural cases' },
];

/* Right ventricular hypertrophy with right-axis deviation and RV strain. */
const RVH = {
  shape: {
    I: { r: 2, s: 7 }, II: { r: 9, s: 2 }, III: { r: 12, s: 1 }, aVR: { r: 4, s: 3 }, aVL: { r: 1, s: 7 }, aVF: { r: 11, s: 1 },
    V1: { r: 14, s: 1 }, V2: { r: 12, s: 5 }, V3: { r: 9, s: 8 }, V4: { r: 7, s: 9 }, V5: { r: 5, s: 10 }, V6: { r: 4, s: 8 },
  },
  st: { V1: -1, V2: -1, V3: -0.5 },
  tInv: { V1: true, V2: true, V3: true },
};

/* ============================================================
   1 · PRESENTATION — THE PE TEACHER WHO GREYED OUT
   ============================================================ */

function Presentation() {
  const { answers } = useCase();
  const [ecg, setEcg] = useState('hers');
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🏃 15:40</span>Ms Yasmin Darwish, 24, a primary-school PE teacher, was racing her Year 5 class across the playground when her vision “went grey from the edges”. She sat down on the grass before she fell. Thirty seconds later she was “fine, just embarrassed”.</p>
        <p className="cs-p"><span className="cs-time">history</span>Two years of breathlessness on hills she “put down to being unfit”. Twice before she has felt light-headed at the top of the stairs. A murmur was mentioned at a school medical and “never followed up”. Her older brother “had a heart operation as a baby”. Married last year; they want to start a family this summer. No medications.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🚑 16:30</span>Brought to the emergency department by the school nurse, who insisted. Walking, talking, a little pale.</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>📊 Observations · 16:30</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('104 /min, regular', 'cs-hi')], ['Blood pressure', N('106/70 mmHg')], ['SpO₂', N('98% on air')],
            ['Resp. rate', N('20 /min')], ['Temperature', N('36.8 °C')], ['Height / weight', N('151 cm · 52 kg')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🩺 Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Wide-set, down-slanting eyes; low-set ears; a low posterior hairline; a broad, slightly webbed neck; mild pectus.</li>
            <li className="cs-li">JVP not raised, but a <b>prominent a-wave</b> flicks up just before each carotid pulse.</li>
            <li className="cs-li">A <b>left parasternal heave</b>. A <b>thrill</b> in the second left interspace.</li>
            <li className="cs-li">Pink, warm, no clubbing, no oedema. Clear chest.</li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">🎧 Listen — then make it breathe</div>
      <p className="cs-p">Start with her, in expiration. Then switch to inspiration and watch the gold click. Then compare: a bicuspid aortic valve also clicks, an ASD also splits S2 widely — breathing tells them apart.</p>
      <PSAuscultation />

      <Why title="🫁 Why her click vanishes when she breathes in"
        chain={[
          { k: 'INSPIRATION', t: 'Negative intrathoracic pressure pulls extra blood into the right atrium.' },
          { k: 'BIG ATRIAL KICK', t: 'The atrium contracts hard into a stiff, hypertrophied RV — the giant a-wave you saw in her neck.' },
          { k: 'PRE-OPENING', t: 'That kick lifts RV diastolic pressure above the low PA diastolic pressure: the doming valve is pushed half-open BEFORE systole starts.' },
          { k: 'NO SNAP', t: 'When the RV contracts, the dome is already up — there is no sudden tensing of the leaflets, so no click.' },
          { k: 'EXPIRATION', t: 'Less atrial filling, the valve starts fully shut, the dome snaps open: a loud click.' },
        ]}>
        Every other right-sided sound gets LOUDER with inspiration (more blood, more noise). The pulmonary ejection click is the one that gets softer — because inspiration opens the valve early. And a dysplastic valve does not dome, so it does not click at all.
      </Why>

      <Contrast title="🔔 the pulmonary click vs the aortic click"
        is={{ h: 'Pulmonary ejection click (hers)', points: ['Second left interspace.', 'SOFTER — or gone — in inspiration.', 'Moves closer to S1 as stenosis worsens (the RV reaches opening pressure sooner).', 'Means a mobile, doming valve — good news for a balloon.'] }}
        isnt={{ h: 'Aortic ejection click (bicuspid valve)', points: ['Apex and aortic area.', 'Ignores breathing completely.', 'Constant timing after S1.', 'The left heart does not feel the respiratory swing in filling.'] }} />
      <Contrast title="🪓 a wide split that moves vs a wide split that is fixed"
        is={{ h: 'Pulmonary stenosis', points: ['P2 is late because the RV takes longer to empty through a narrow valve.', 'P2 is SOFT: low PA pressure, rigid leaflets.', 'The split still widens on inspiration.'] }}
        isnt={{ h: 'Atrial septal defect', points: ['P2 is late because the RV carries extra shunted volume.', 'P2 normal or loud.', 'FIXED: the shunt evens out the respiratory swing in RV filling.'] }} />

      <MultiSelect id="s1-exam" question="Which of her findings point to SEVERE valvular pulmonary stenosis?"
        items={[
          { id: 'click', label: 'An ejection click that softens on inspiration', correct: true, why: 'A mobile, doming valve — and the giant a-wave that pre-opens it on inspiration.' },
          { id: 'long', label: 'A long, late-peaking murmur that runs through A2', correct: true, why: 'The longer and later the murmur, the worse the stenosis: the RV needs longer to eject through the hole.' },
          { id: 'p2', label: 'A widely split S2 with a soft, late P2', correct: true, why: 'Prolonged RV ejection, low PA pressure.' },
          { id: 'a', label: 'A prominent jugular a-wave', correct: true, why: 'The atrium is pushing into a stiff, hypertrophied RV.' },
          { id: 'heave', label: 'Left parasternal heave and a thrill in the second left interspace', correct: true, why: 'RV hypertrophy; a high-velocity jet you can feel.' },
          { id: 'fixed', label: 'A split S2 that does not change with breathing', correct: false, why: 'Fixed splitting is the ASD sign. Hers widens on inspiration.' },
          { id: 'loudp2', label: 'A loud P2', correct: false, why: 'A loud P2 means pulmonary hypertension. Hers is soft — the PA pressure beyond the valve is low.' },
        ]} />

      <div className="cs-h2">📈 Her ECG</div>
      <div className="cs-row" style={{ marginBottom: 8 }}>
        <button className={'cs-chip' + (ecg === 'hers' ? ' on' : '')} onClick={() => setEcg('hers')}>Hers</button>
        <button className={'cs-chip' + (ecg === 'norm' ? ' on' : '')} onClick={() => setEcg('norm')}>A normal 24-year-old</button>
      </div>
      {ecg === 'hers'
        ? <ECG12 rate={104} shape={RVH.shape} st={RVH.st} tInv={RVH.tInv} caption="Sinus tachycardia 104/min. Right-axis deviation (negative in I, tall R in III and aVF). Dominant R in V1 (R > S, ~14 mm) with deep S waves out to V6. ST depression and T inversion V1–V3: RV hypertrophy with strain." />
        : <ECG12 rate={72} caption="Normal: positive QRS in I and aVF, small r and deep S in V1, R-wave progression across the chest." />}

      <Decision id="s1-ecg" question="What does her ECG say about her right ventricle?"
        options={[
          { id: 'rvh', label: 'RV hypertrophy with strain: the RV is generating near-systemic pressure', verdict: 'best', points: 10,
            why: 'A dominant R in V1 with right-axis deviation and right precordial strain in a young adult means pressure overload of the RV. In PS the height of R in V1 roughly tracks RV pressure.' },
          { id: 'rbbb', label: 'Right bundle branch block — a normal variant', verdict: 'wrong', points: 0, why: 'The QRS is narrow: no rSR′, no broad S in I and V6.' },
          { id: 'pe', label: 'Acute pulmonary embolism (S1Q3T3)', verdict: 'wrong', points: 2, why: 'Right-heart strain patterns overlap — but her story is two years of exertional symptoms, a murmur and a thrill.' },
          { id: 'ath', label: 'Athlete’s heart in a PE teacher', verdict: 'wrong', points: 0, why: 'Athletic remodelling does not cause right-axis deviation, a dominant R in V1 and strain. This label has killed people (M&M).' },
        ]} />
      <Why title="⚡ Why the ECG shows the RV — when it usually hides"
        chain={[
          { k: 'NORMALLY', t: 'The thick LV dominates the QRS vector: leftward and posterior.' },
          { k: 'PRESSURE LOAD', t: 'Years of pumping against a narrow valve thicken the RV wall until it rivals the LV.' },
          { k: 'VECTOR SWINGS', t: 'The QRS axis swings right and anterior: tall R in V1, right-axis deviation.' },
          { k: 'STRAIN', t: 'Subendocardial RV ischaemia under that pressure: ST depression and T inversion V1–V3.' },
        ]} />

      <MultiSelect id="s1-noonan" question="Look at her again. Which features make you think of Noonan syndrome — and why does it matter now?"
        items={[
          { id: 'face', label: 'Wide-set, down-slanting eyes and low-set ears', correct: true, why: 'The typical facial gestalt; it softens with age, so adults are often missed.' },
          { id: 'neck', label: 'Short stature, a webbed neck and a low posterior hairline', correct: true, why: 'Like Turner syndrome — but Noonan affects both sexes with a normal karyotype.' },
          { id: 'chest', label: 'Pectus deformity', correct: true, why: 'Common in Noonan.' },
          { id: 'fam', label: 'A brother who had heart surgery as a baby', correct: true, why: 'Autosomal dominant (PTPN11 in about half): a 50% chance of passing it on — relevant to her pregnancy plans.' },
          { id: 'ps', label: 'Pulmonary stenosis itself', correct: true, why: 'The commonest heart lesion in Noonan — often a thick, DYSPLASTIC valve that balloons poorly. And up to ~1 in 5 have hypertrophic cardiomyopathy.' },
          { id: 'marfan', label: 'Long fingers and a high arched palate', correct: false, why: 'Marfanoid features — a different gene, a different heart (aortic root).' },
        ]} />

      <Decision id="s1-triage" question="She feels fine now. The ED registrar wants to discharge her: “vasovagal, she was running in the heat.” You…"
        options={[
          { id: 'admit', label: 'Keep her: exertional presyncope with a murmur, a thrill and RVH is cardiac until proven otherwise — telemetry and an echo before she goes anywhere', verdict: 'best', points: 10,
            why: 'Vasovagal syncope happens AFTER exertion or on standing, not DURING it. Syncope during exercise means the heart could not raise its output — a fixed obstruction or an arrhythmia. Both can kill the next time.' },
          { id: 'opd', label: 'Discharge with an outpatient echo in six weeks', verdict: 'wrong', points: 0, why: 'Six weeks of PE lessons with a severe fixed obstruction. See the M&M story “Vasovagal”.' },
          { id: 'tilt', label: 'Arrange a tilt-table test', verdict: 'wrong', points: 0, why: 'A tilt test investigates reflex syncope — not syncope during exertion with a structural murmur.' },
        ]} />
      <Why title="🏃 Why she greys out DURING exercise"
        chain={[
          { k: 'EXERCISE', t: 'Muscle arterioles dilate: systemic resistance falls.' },
          { k: 'FIXED OUTLET', t: 'A normal heart answers with a bigger output. Hers cannot push more blood through a pinhole valve.' },
          { k: 'PRESSURE FALLS', t: 'Output fixed + resistance falling = blood pressure falling.' },
          { k: 'BRAIN & RV', t: 'The brain greys out; the RV — working at near-systemic pressure — loses its own coronary perfusion and becomes ischaemic and irritable.' },
          { k: 'SUDDEN DEATH', t: 'Ventricular arrhythmia is the end of this road.' },
        ]} />

      <MultiSelect id="s1-tx" question="Tonight, while she waits for the echo, what do you do?"
        items={[
          { id: 'tele', label: 'Cardiac monitoring on the ward', correct: true, why: 'Exertional symptoms with RV strain: arrhythmia risk.' },
          { id: 'hyd', label: 'Keep her well filled — drink freely; IV fluid if she is vomiting or fasting', correct: true, why: 'A hypertrophied RV needs preload to fill. Dehydration narrows the cavity.' },
          { id: 'rest', label: 'No exertion until the obstruction is understood', correct: true, why: 'Exercise is what dropped her pressure.' },
          { id: 'bloods', label: 'Bloods: FBC, U&E, coagulation screen, troponin, BNP', correct: true, why: 'Including a coagulation screen: Noonan carries bleeding diatheses (factor XI deficiency, platelet dysfunction) — it matters before any femoral access.' },
          { id: 'gtn', label: 'GTN spray for the chest tightness she described', correct: false, why: 'A venodilator drops preload to a stiff RV and pressure behind a fixed obstruction — the opposite of what she needs.' },
          { id: 'furo', label: 'Furosemide for the “heart strain”', correct: false, why: 'She is not congested. Diuresis empties a ventricle that needs to be full.' },
        ]} />
      {answers['s1-tx'] && <Note kind="pearl" title="🌙 22:00">Bloods normal: Hb 132 g/L, platelets 210, PT and APTT normal, troponin 9 ng/L, NT-proBNP 410 ng/L. A quiet night on telemetry, sinus rhythm.</Note>}

      <div className="cs-media-row">
        <Video id="Hc7srdrxyw8" title="Pulmonary Stenosis — what it is (animation)" />
        <Video id="VE_oh1aiLBU" title="Pulmonic Stenosis (PS) — valvular heart disease, cardiology" />
      </div>
    </>
  );
}

/* ============================================================
   2 · ECHO — MEASURE IT YOURSELF
   ============================================================ */

function Echo() {
  const { answers, answer } = useCase();
  const m = answers['s2-dop'];
  const good = m && Math.abs(m.ps - 4.4) <= 0.2 && Math.abs(m.tr - 4.9) <= 0.2 && m.rap === 3;
  const part = m && !good && (Math.abs(m.ps - 4.4) <= 0.3 || Math.abs(m.tr - 4.9) <= 0.3);
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Transthoracic echo · 09:00, day 2</div>
        <Table head={['', 'Finding']} rows={[
          ['Pulmonary valve', 'Thin, mobile leaflets with fused commissures. In systole they DOME into the PA like a tent with a hole in its roof.'],
          ['Annulus', N('20 mm (parasternal short axis)')],
          ['Main PA', N('34 mm — dilated; jet aimed at the left PA', 'cs-hi')],
          ['RV', 'Concentric hypertrophy, free wall 9 mm; small cavity; good function (TAPSE 21 mm)'],
          ['RV outflow (infundibulum)', 'Thick muscle, narrows a little in late systole'],
          ['LV', 'Normal size, EF 64%; septum 8 mm — no hypertrophic cardiomyopathy'],
          ['Atrial septum', 'Intact; no shunt on colour or bubble'],
        ]} />
      </div>

      <div className="cs-h2">📏 CW Doppler — your measurements</div>
      <p className="cs-p">Measure the peak velocity across the pulmonary valve, then the tricuspid regurgitant jet. Estimate the right atrial pressure from the IVC. The machine calculates; you decide what the numbers mean.</p>
      <PSDoppler done={!!m} onMeasure={r => answer('s2-dop', r)} />
      {m && (
        <div className={'cs-fb ' + (good ? 'best' : part ? 'ok' : 'wrong')}>
          PS {m.ps.toFixed(2)} m/s → peak {Math.round(m.pg)} / mean {Math.round(m.mg)} mmHg. TR {m.tr.toFixed(2)} m/s + RAP {m.rap} → RVSP {Math.round(m.rvsp)} mmHg. PA systolic ≈ {Math.round(m.pasp)} mmHg.{' '}
          {good ? 'On the dense edge of both envelopes, and the right RAP: severe PS with a normal PA pressure beyond it.'
            : 'Off the envelope edge (true: PS 4.4 m/s, TR 4.9 m/s, RAP 3). Because velocity is squared, 0.3 m/s at 4.4 is ~12 mmHg of gradient.'}
        </div>
      )}
      <ScoreOnce id="s2-dop" pts={m == null ? null : good ? 15 : part ? 6 : 2} max={15} />

      <Decision id="s2-ph" question="The report from the night sonographer says: “RVSP ~100 mmHg — severe pulmonary hypertension.” Is it?"
        options={[
          { id: 'no', label: 'No. The TR jet measures RV pressure. With PS, RV pressure = PA pressure + the valve gradient: ~99 − 77 ≈ 22 mmHg in the PA — normal', verdict: 'best', points: 10,
            why: 'Bernoulli across the tricuspid valve gives RV minus RA pressure. It only equals PA pressure when there is nothing between the RV and the PA.' },
          { id: 'yes', label: 'Yes — refer to the pulmonary hypertension service', verdict: 'wrong', points: 0, why: 'And she would be started on pulmonary vasodilators for a valve problem. See the M&M story.' },
          { id: 'both', label: 'Both PS and pulmonary hypertension', verdict: 'wrong', points: 2, why: 'Her P2 is soft and the PA systolic pressure works out at ~22 mmHg.' },
        ]} />
      <Why title="🧮 Why the TR jet lies about the PA in pulmonary stenosis"
        chain={[
          { k: 'BERNOULLI', t: 'ΔP = 4V². The TR jet measures the drop from RV to RA in systole.' },
          { k: 'ADD RAP', t: 'RV systolic pressure = 4 × 4.9² + 3 ≈ 99 mmHg.' },
          { k: 'THE ASSUMPTION', t: 'We usually say RV systolic = PA systolic — true only if the pulmonary valve is open.' },
          { k: 'HER VALVE', t: 'Between her RV and PA stands a 77 mmHg gradient.' },
          { k: 'THE ANSWER', t: 'PA systolic ≈ 99 − 77 ≈ 22 mmHg. Always look at the RVOT before you write “pulmonary hypertension”.' },
        ]} />

      <Decision id="s2-grade" question="Grade her stenosis."
        options={[
          { id: 'sev', label: 'Severe: peak velocity > 4 m/s, peak gradient > 64 mmHg', verdict: 'best', points: 10,
            why: 'Mild < 3 m/s (< 36 mmHg); moderate 3–4 m/s (36–64 mmHg); severe > 4 m/s (> 64 mmHg). A mean gradient > ~35–40 mmHg supports severe and correlates better with the catheter peak-to-peak gradient.' },
          { id: 'mod', label: 'Moderate — the mean gradient is under 50', verdict: 'wrong', points: 2, why: 'PS is graded on the PEAK Doppler gradient; mean gradient is supporting evidence.' },
          { id: 'mild', label: 'Mild — her RV function is normal', verdict: 'wrong', points: 0, why: 'A hypertrophied RV keeps its function for years. Function is not severity.' },
        ]} />

      <MultiSelect id="s2-level" question="Where is the obstruction? Which findings say VALVULAR?"
        items={[
          { id: 'dome', label: 'Systolic doming of thin, mobile leaflets', correct: true, why: 'Fused commissures: the leaflets bow up but cannot separate.' },
          { id: 'psd', label: 'Post-stenotic dilation of the main and left PA', correct: true, why: 'The high-velocity jet hammers the PA wall — the left PA, which lies in line with it, dilates too. Typical of doming valvular PS, rare with dysplastic valves.' },
          { id: 'origin', label: 'The colour aliasing starts at the leaflet tips', correct: true, why: 'Flow accelerates up to the orifice of the dome.' },
          { id: 'round', label: 'A symmetric, rounded CW envelope peaking in mid-systole', correct: true, why: 'A fixed orifice. A dynamic muscular narrowing gives a late-peaking “dagger”.' },
          { id: 'dagger', label: 'A concave, late-peaking “dagger” Doppler envelope', correct: false, why: 'That is the signature of DYNAMIC infundibular obstruction — keep that shape in mind for later today…' },
        ]} />

      <Contrast title="🧱 valvular vs infundibular (dynamic) obstruction"
        is={{ h: 'Valvular (fixed)', points: ['A doming valve with a fixed hole.', 'Rounded, mid-systolic Doppler envelope.', 'The same gradient whatever the contractility.', 'Treated with a balloon.'] }}
        isnt={{ h: 'Infundibular (dynamic)', points: ['Hypertrophied muscle below the valve squeezes the outlet shut in late systole.', 'Late-peaking “dagger” envelope — like HOCM, on the right.', 'WORSE with inotropes, tachycardia and low filling; better with volume and beta-blockers.', 'A balloon cannot fix muscle.'] }} />
      <Contrast title="📍 valvular vs supravalvular and branch PA stenosis"
        is={{ h: 'Valvular PS (hers)', points: ['Obstruction at the leaflets; post-stenotic dilation.', 'Ejection click.', 'Usually isolated.'] }}
        isnt={{ h: 'Supravalvular / branch PA stenosis', points: ['Narrowing above the valve or in the branches — no dilation beyond the valve, no click.', 'Murmur radiates to the back and axillae; may be continuous.', 'Think syndromes: Williams (with supravalvular AS), Alagille, congenital rubella; also Noonan.', 'Treated with balloon angioplasty and stents, not valvuloplasty.'] }} />
      <Contrast title="🎈 post-stenotic PA dilation vs the dilated PA of pulmonary hypertension"
        is={{ h: 'Post-stenotic (hers)', points: ['Main and LEFT PA dilated — where the jet hits.', 'Soft P2, normal PA pressure.', 'Size does not track severity.'] }}
        isnt={{ h: 'Pulmonary hypertension', points: ['Main and both branches dilated, pruned peripheries.', 'Loud P2, high PA pressure.', 'A disease of the lungs or vessels, not the valve.'] }} />

      <Decision id="s2-over" question="Discordant patient: a 30-year-old at 28 weeks of pregnancy, with an unrepaired ASD, has a PS peak velocity of 4.1 m/s (67 mmHg). The valve opens reasonably. What is happening?"
        options={[
          { id: 'flow', label: 'The gradient is flow-dependent: pregnancy (+40–50% output) and the shunt (extra RV volume) inflate it — the valve may be only moderately stenotic', verdict: 'best', points: 10,
            why: 'A gradient is pressure across a hole, and pressure rises with the square of flow. High-flow states (pregnancy, anaemia, fever, left-to-right shunts) overcall; look at the valve, the RV and the mean gradient, and re-measure after delivery.' },
          { id: 'sev', label: 'Severe PS — intervene during pregnancy', verdict: 'wrong', points: 2, why: 'Only if she is symptomatic or the RV is failing — the number alone is inflated.' },
          { id: 'err', label: 'A measurement error — Doppler always underestimates', verdict: 'wrong', points: 0, why: 'Misalignment underestimates; flow and tandem lesions OVERestimate.' },
        ]} />
      <Why title="📐 Why the Doppler gradient is higher than the catheter gradient"
        chain={[
          { k: 'DOPPLER', t: 'Peak INSTANTANEOUS gradient — the biggest pressure drop at any single moment.' },
          { k: 'CATHETER', t: 'Peak-to-peak: RV peak minus PA peak, which do not happen at the same moment — always smaller.' },
          { k: 'PRESSURE RECOVERY', t: 'Beyond a narrow orifice some pressure is regained; Doppler sees the lowest point (the vena contracta).' },
          { k: 'TANDEM LESIONS', t: 'Infundibular + valvular narrowing in series: CW Doppler samples the whole line and cannot add them correctly.' },
          { k: 'SO', t: 'Doppler peak > catheter peak-to-peak; the Doppler MEAN gradient tracks the catheter number better. Low flow (a failing RV, severe TR) does the opposite — it underestimates.' },
        ]} />

      <div className="cs-media-row">
        <Video id="wpXHupCtaIk" title="Infundibular and subvalvular stenosis — types of pulmonary stenosis" />
        <Video id="pnYoVUdnBU0" title="Supravalvular pulmonary stenosis (echo)" />
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
        <div className="cs-h2" style={{ marginTop: 0 }}>👥 ACHD heart team · day 3</div>
        <Table head={['', 'Finding']} rows={[
          ['Lesion', 'Isolated severe valvular PS: peak 77 mmHg (4.4 m/s), mean 39 mmHg; doming, mobile leaflets; annulus 20 mm'],
          ['Symptoms', 'Exertional breathlessness (NYHA II) and exertional presyncope'],
          ['RV', 'Hypertrophied, good function; RVSP ~99 mmHg (≈ 90% of systemic)'],
          ['Exercise test', N('Peak VO₂ 61% predicted; BP flat 106 → 110 mmHg at peak', 'cs-hi')],
          ['LV', 'Normal, no hypertrophic cardiomyopathy'],
          ['Genetics', 'Noonan panel sent; result in 6 weeks'],
          ['Her wish', '“We want a baby this year. Can I just get pregnant first and sort my heart out after?”'],
        ]} />
      </div>

      <Decision id="s3-ind" question="Does she meet criteria for intervention?"
        options={[
          { id: 'yes', label: 'Yes — clearly: a peak Doppler gradient > 64 mmHg, AND she is symptomatic with a flat BP response to exercise', verdict: 'best', points: 10,
            why: 'ESC 2020 ACHD: intervention is recommended (class I) when the peak Doppler gradient is > 64 mmHg — regardless of symptoms, provided no valve replacement is needed. Below 64 mmHg it should be considered for symptoms, falling RV function, arrhythmia or right-to-left shunting. AHA/ACC 2018: balloon valvotomy for moderate or severe valvular PS with symptoms or unexplained RV dysfunction, and for asymptomatic severe PS.' },
          { id: 'watch', label: 'Not yet — her RV function is still normal', verdict: 'wrong', points: 0, why: 'RV function falls late. The gradient and her symptoms already meet the bar.' },
          { id: 'only', label: 'Only if she becomes NYHA III', verdict: 'wrong', points: 0, why: 'She has already greyed out while exercising.' },
        ]} />

      <Decision id="s3-how" question="How should the obstruction be relieved?"
        options={[
          { id: 'bpv', label: 'Balloon pulmonary valvuloplasty', verdict: 'best', points: 10,
            why: 'For a doming, non-dysplastic valve, the balloon is the treatment of choice (class I in both ESC and AHA/ACC): it tears the fused commissures along their seams. Excellent long-term results; no sternotomy, no prosthesis.' },
          { id: 'surg', label: 'Surgical valvotomy', verdict: 'ok', points: 3, why: 'For dysplastic valves, a small annulus, associated lesions needing surgery, or a failed balloon.' },
          { id: 'tpvr', label: 'Transcatheter pulmonary valve implantation', verdict: 'wrong', points: 0, why: 'For dysfunctional conduits or severe PR later in life — not for a native doming valve in a 24-year-old.' },
        ]} />
      <Contrast title="🎪 a doming valve vs a dysplastic valve"
        is={{ h: 'Doming (typical) — hers', points: ['Thin leaflets fused at the commissures.', 'Ejection click; post-stenotic PA dilation.', 'The balloon splits the fusion: excellent results.'] }}
        isnt={{ h: 'Dysplastic (classically Noonan)', points: ['Thick, lumpy, myxomatous leaflets; little or no commissural fusion; often a small annulus.', 'No click, little PA dilation.', 'A balloon stretches but cannot split what is not fused: frequent failure — surgery more often.'] }} />
      <Why title="🎈 Why a balloon cures a doming valve and fails a dysplastic one"
        chain={[
          { k: 'THE LESION', t: 'In a doming valve the leaflets are normal tissue glued together along their edges.' },
          { k: 'THE BALLOON', t: 'Inflating a balloon larger than the annulus puts the glued seams under tension.' },
          { k: 'THE WAIST POPS', t: 'The commissures tear along their lines of fusion — the waist on the balloon vanishes.' },
          { k: 'DYSPLASTIC', t: 'There are no seams to split: the thick leaflets themselves are the obstruction. Stretch them and they recoil.' },
        ]} />

      <MultiSelect id="s3-noonan" question="Because Noonan syndrome is likely, what must the work-up include before the lab?"
        items={[
          { id: 'hcm', label: 'A full look at the LV for hypertrophic cardiomyopathy', correct: true, why: 'Done — normal. Missed Noonan HCM turns an anaesthetic into an arrest (M&M).' },
          { id: 'coag', label: 'A coagulation screen, and a bleeding history', correct: true, why: 'Factor XI deficiency, von Willebrand disease and platelet dysfunction are all described. Hers is normal.' },
          { id: 'gene', label: 'Genetic testing and counselling — before pregnancy', correct: true, why: 'Autosomal dominant: a 50% risk to each child, and fetal echo in any pregnancy.' },
          { id: 'branch', label: 'Check the branch PAs for additional stenoses', correct: true, why: 'Peripheral PA stenoses occur in Noonan — a balloon on the valve will not touch them.' },
          { id: 'kary', label: 'A karyotype to diagnose Noonan', correct: false, why: 'The karyotype is normal in Noonan. That test is for Turner syndrome, its look-alike.' },
        ]} />

      <Contrast title="🧩 PS with an intact septum vs tetralogy physiology"
        is={{ h: 'Isolated PS (hers)', points: ['Closed septum: the RV has no escape valve.', 'RV pressure can climb ABOVE systemic: hypertrophy, ischaemia, failure.', 'Pink — unless a PFO opens and shunts right-to-left.'] }}
        isnt={{ h: 'Tetralogy of Fallot', points: ['A large VSD caps RV pressure at systemic: the RV never exceeds the LV.', 'The obstruction diverts blue blood across the VSD into the aorta: cyanosis.', 'Spells: more infundibular squeeze → more right-to-left shunt.', 'Same family trick in a spell: volume, beta-block, raise systemic resistance.'] }} />

      <Decision id="s3-preg" question="“Can I get pregnant first and sort my heart out after?”"
        options={[
          { id: 'before', label: '“Let’s fix the valve first — it’s a day-case-style procedure. Pregnancy raises your output by almost half; with the valve as it is, your right ventricle may not cope. We’ll also talk through the genetics.”', verdict: 'best', points: 10,
            why: 'ESC pregnancy guidance: mild–moderate PS is well tolerated; severe PS should be relieved BEFORE pregnancy, usually by balloon. Balloon valvuloplasty in pregnancy is possible but carries radiation and maternal risk — a rescue, not a plan.' },
          { id: 'fine', label: '“Pregnancy is fine with pulmonary stenosis — go ahead.”', verdict: 'wrong', points: 0, why: 'True for mild PS. Not for a symptomatic severe stenosis with flat BP on exercise.' },
          { id: 'never', label: '“You should not get pregnant.”', verdict: 'wrong', points: 0, why: 'After successful relief, her pregnancy risk is low.' },
        ]} />
      <Contrast title="🤰 pulmonary stenosis vs mitral stenosis in pregnancy"
        is={{ h: 'Pulmonary stenosis', points: ['The RV is a muscular, hypertrophied pump that copes with extra flow.', 'Mild–moderate: well tolerated.', 'Severe: relieve before conception.'] }}
        isnt={{ h: 'Mitral stenosis', points: ['Extra flow and a faster rate through a fixed mitral orifice → LA pressure soars → pulmonary oedema, often in the second trimester.', 'Poorly tolerated even when moderate.', 'Case 06 on this unit.'] }} />

      <Decision id="s3-consent" question="She asks: “What can go wrong?”"
        options={[
          { id: 'honest', label: '“Usually it works first time and lasts. Small risks: bleeding at the groin, rhythm upsets, rarely a tear. Your heart muscle is thick, so for a few hours or days it can squeeze too hard — we treat that with fluids and a beta-blocker. Some leak in the valve is common and is watched for years.”', verdict: 'best', points: 10,
            why: 'Names the common outcome, the rare catastrophes, the specific early hazard (dynamic infundibular obstruction) and the long-term one (pulmonary regurgitation).' },
          { id: 'none', label: '“It’s completely safe.”', verdict: 'wrong', points: 0, why: 'Nothing is. And if the suicide RV appears tonight, she will remember you said this.' },
          { id: 'list', label: 'Read her the full list of published complication rates', verdict: 'ok', points: 3, why: 'Accurate, but answer the question she asked.' },
        ]} />
      <Video id="E5tDGYVga9I" title="Pulmonary stenosis: surgical correction" channel="Texas Children's Heart Center (per search index)" />
    </>
  );
}

/* ============================================================
   4 · PLANNING — SIZE THE BALLOON
   ============================================================ */

function Planning() {
  const { answers, answer, bump } = useCase();
  const r = answers['s4-size'];
  const good = r && r.level === 'hinge' && Math.abs(r.measured - 20) <= 1 && r.bar >= 1.2 && r.bar <= 1.4;
  const ok = r && !good && r.bar >= 1.15 && r.bar <= 1.45;
  return (
    <>
      <Decision id="s4-where" question="Where do you measure the pulmonary annulus for balloon sizing?"
        options={[
          { id: 'hinge', label: 'At the hinge points of the leaflets, in the lateral RV angiogram (and checked against echo)', verdict: 'best', points: 10,
            why: 'The annulus is where the leaflets attach. The balloon size is a ratio to THIS number.' },
          { id: 'sinus', label: 'At the widest part of the PA above the valve', verdict: 'wrong', points: 0, why: 'Post-stenotic dilation: a 27-mm PA would buy a 35-mm balloon — and a torn annulus.' },
          { id: 'orifice', label: 'At the orifice in the tip of the dome', verdict: 'wrong', points: 0, why: 'That is the hole you are trying to enlarge.' },
        ]} />
      <Why title="📏 Why the balloon is 1.2–1.4 × the annulus"
        chain={[
          { k: 'TOO SMALL', t: 'A balloon ≤ the annulus stretches the dome without loading the commissures: the gradient comes back.' },
          { k: 'JUST RIGHT', t: '1.2–1.4 × the annulus tears the fused seams reliably (pediatric statements favour ~1.2–1.25; adult series use up to ~1.4).' },
          { k: 'TOO BIG', t: '> 1.5 × tears the annulus or RV outflow, and leaves severe pulmonary regurgitation for life.' },
          { k: 'BIG ADULTS', t: 'When one balloon cannot reach 1.2 ×, two balloons side by side (or an Inoue balloon) do it.' },
        ]} />

      <div className="cs-h2">🧮 Measure and choose</div>
      <p className="cs-p">The lateral RV angiogram in end-systole. Choose the level, place the calipers, then pick a single balloon. The marker catheter calibrates the image.</p>
      <BalloonSizer done={!!r} onResult={res => { answer('s4-size', res); bump({ contrast: 35, fluoro: 60 }); }} />
      {r && (
        <div className={'cs-fb ' + (good ? 'best' : ok ? 'ok' : 'wrong')}>
          Measured {r.measured.toFixed(1)} mm at the {r.level === 'hinge' ? 'hinge points' : r.level === 'sinus' ? 'sinus' : 'dome tip'}; {r.balloon}-mm balloon → true balloon : annulus {r.bar.toFixed(2)}.{' '}
          {good ? 'Right level, right size.' : r.bar > 1.45 ? 'Oversized: this is how annuli tear (M&M).' : r.bar < 1.15 ? 'Undersized: the commissures will hold.' : r.level !== 'hinge' ? 'A sensible balloon — but measure at the hinge points.' : 'Close — re-check the calipers on the hinge points.'}
        </div>
      )}
      <ScoreOnce id="s4-size" pts={r == null ? null : good ? 15 : ok ? 6 : 1} max={15} />

      <Decision id="s4-wire" question="Where does the wire go, and which one?"
        options={[
          { id: 'lpa', label: 'An extra-stiff exchange wire parked deep in the LEFT pulmonary artery (or a lower-lobe branch)', verdict: 'best', points: 10,
            why: 'The left PA continues in line with the RVOT: the balloon tracks straight and stays put. A stiff rail resists the “squirt”.' },
          { id: 'rpa', label: 'A soft wire in the right PA', verdict: 'ok', points: 3, why: 'Usable, but the right PA turns sharply; a soft wire lets the balloon buck.' },
          { id: 'ra', label: 'Any wire across the valve — position does not matter', verdict: 'wrong', points: 0, why: 'A wire that backs out mid-inflation leaves an inflated balloon loose in the RVOT.' },
        ]} />
      <Decision id="s4-big" question="A different patient: a 1.85-m man with an annulus of 27 mm. The largest single balloon in stock is 30 mm. Plan?"
        options={[
          { id: 'double', label: 'Two balloons side by side through both femoral veins (effective diameter ≈ 0.8 × the sum of the two), or an Inoue balloon', verdict: 'best', points: 10,
            why: '30/27 = 1.11 — too small. Two 18-mm balloons give an effective diameter of ~29–30 mm along the commissures, and leave gaps for some forward flow during inflation.' },
          { id: 'single', label: 'Use the 30 mm — close enough', verdict: 'ok', points: 3, why: 'May relieve some gradient; often under-dilates.' },
          { id: 'surg', label: 'Send him for surgery', verdict: 'wrong', points: 0, why: 'A doming valve in a big annulus is still a balloon lesion.' },
        ]} />
      <div className="cs-media-row">
        <Video id="iA3M-lkjf7Q" title="Percutaneous transluminal balloon pulmonary valvuloplasty (PBPV)" channel="AIIMS Bhubaneswar (per search index)" />
        <Video id="btGBgIJEH2U" title="Sequential balloon valvuloplasty in a near-atretic pulmonary stenosis" />
      </div>
    </>
  );
}

/* ============================================================
   5 · SET-UP
   ============================================================ */

function Setup() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🧷 08:30, day 7</span>Cath lab 2. Fasted from midnight — so a litre of crystalloid is already running. Local anaesthetic and light sedation; the anaesthetist is in the room.</p>
      </div>
      <MultiSelect id="s5-check" question="Before you start: what must be in place?"
        items={[
          { id: 'fluid', label: 'IV fluids running: she has fasted, and a hypertrophied RV needs to be full', correct: true, why: 'The commonest trigger for the suicide RV is a dry patient.' },
          { id: 'bb', label: 'IV esmolol or propranolol and phenylephrine drawn up and labelled', correct: true, why: 'The rescue drugs for dynamic infundibular obstruction. Know where they are before you need them.' },
          { id: 'coag', label: 'Coagulation results checked (Noonan) and the access site planned with ultrasound', correct: true, why: 'Femoral VEIN access; her screen is normal.' },
          { id: 'echo', label: 'Echo available in the room', correct: true, why: 'Effusion, TR, the RVOT after inflation.' },
          { id: 'surg', label: 'Cardiac surgery aware', correct: true, why: 'Annular tear or tamponade are rare — and need a surgeon fast.' },
          { id: 'dob', label: 'A dobutamine infusion primed “in case the RV struggles”', correct: false, why: 'Dobutamine is the drug most likely to kill her today.' },
        ]} />
      <Sequence id="s5-seq" question="Put the procedure in order."
        steps={[
          { label: 'Ultrasound-guided right femoral vein access; heparin ~100 U/kg (5,000 U)', why: 'Venous only; an arterial line if the team wants beat-to-beat pressure.' },
          { label: 'Right heart catheterisation: RV and PA pressures; pull-back across the valve', why: 'The baseline gradient — peak-to-peak.' },
          { label: 'Lateral (and AP) RV angiogram: measure the annulus at the hinge points', why: 'Sizing.' },
          { label: 'Cross the valve with an end-hole catheter; park an extra-stiff wire in the left PA', why: 'The rail for the balloon.' },
          { label: 'Centre the balloon on the valve; inflate until the waist disappears; deflate fast', why: 'Seconds, not tens of seconds.' },
          { label: 'Repeat pull-back: valvular and infundibular gradients; check for effusion', why: 'Separate what the balloon fixed from what the muscle is doing.' },
        ]} />
      <Why title="⏱️ Why every inflation must be short"
        chain={[
          { k: 'THE CORK', t: 'A fully inflated balloon fills the RV outflow — nothing gets to the lungs.' },
          { k: 'NO RETURN', t: 'No pulmonary flow means no left-heart filling a beat later.' },
          { k: 'CRASH', t: 'Within 5–10 s systemic pressure halves; vagal bradycardia follows.' },
          { k: 'SO', t: 'Inflate until the waist pops, deflate at once. Two balloons side by side leave channels for some flow.' },
        ]} />
      <Note kind="warn" title="⚠️ Pitfall">The fasting patient. Her RV is thick and her cavity small; eight hours without fluid shrinks it further. Fluids on before the first needle.</Note>
    </>
  );
}

/* ============================================================
   6 · STRATEGY — CHOOSE YOUR PATH
   ============================================================ */

function Strategy() {
  const { answers } = useCase();
  return (
    <>
      <p className="cs-p">Four branch points you may meet in the next hour. Choose; see where each path leads.</p>
      <Decision id="s6-waist" question="First inflation with a 25-mm balloon to nominal pressure: the waist does not disappear. Next?"
        options={[
          { id: 'up', label: 'Re-check the position, then repeat — and if it still holds, step up one balloon size, staying within 1.4 × the annulus', verdict: 'best', points: 10,
            why: 'A persistent waist means the commissures have not split. Step up — but the ceiling is the annulus, not the waist.' },
          { id: 'rbp', label: 'Keep inflating past rated burst pressure', verdict: 'wrong', points: 0, why: 'A balloon that ruptures inside an RV outflow can tear it — and leave fragments.' },
          { id: 'big', label: 'Jump to a 33-mm balloon', verdict: 'wrong', points: 0, why: '33/20 = 1.65 — the annulus tear in the M&M.' },
        ]} />
      {answers['s6-waist'] && <Note kind="pearl" title="📎 Where this path leads">Most doming valves split on the first or second inflation at a 1.2–1.3 ratio. A waist that resists 1.4 × should make you ask whether this valve is really dysplastic.</Note>}
      <Decision id="s6-squirt" question="As you inflate, the balloon shoots forward into the PA."
        options={[
          { id: 'reposition', label: 'Deflate, pull back so the valve sits in the MIDDLE of the balloon; consider a longer balloon and a stiffer wire', verdict: 'best', points: 10,
            why: 'A balloon “melon-seeds” away from a waist that is off-centre. Centre the waist; a longer balloon gives more purchase.' },
          { id: 'hold', label: 'Keep inflating — it will settle', verdict: 'wrong', points: 0, why: 'An inflated balloon in the PA dilates the wrong thing.' },
        ]} />
      <Decision id="s6-brady" question="During the second inflation: heart rate 38, BP 58/30, she says she is going to faint."
        options={[
          { id: 'deflate', label: 'Deflate immediately; the pressure and rate recover within seconds. Atropine only if they do not', verdict: 'best', points: 10,
            why: 'The balloon is the cause. Remove the cause.' },
          { id: 'adr', label: 'Give adrenaline with the balloon still up', verdict: 'wrong', points: 0, why: 'You are whipping a heart whose outlet is corked.' },
        ]} />
      <Decision id="s6-after" question="After the waist pops: RV 64 mmHg, PA 27 mmHg. The pull-back shows half the remaining gradient is BELOW the valve. You…"
        options={[
          { id: 'stop', label: 'Stop. The valve is open; the rest is infundibular muscle that will regress over months. Keep her full; consider a beta-blocker', verdict: 'best', points: 10,
            why: 'A residual infundibular gradient after valvuloplasty is expected in severe PS. Further dilation cannot fix muscle; it can only tear the annulus.' },
          { id: 'again', label: 'Re-dilate with a bigger balloon to abolish the gradient', verdict: 'wrong', points: 0, why: 'Treating muscle with a balloon.' },
          { id: 'dob', label: 'Start dobutamine to help the RV push through', verdict: 'wrong', points: 0, why: 'The single most dangerous idea in this case.' },
        ]} />
      <Contrast title="📉 the residual gradient you leave vs the one you chase"
        is={{ h: 'Leave it', points: ['Below the valve, dynamic, late-peaking.', 'Falls with volume and beta-blockade.', 'Regresses as the RV hypertrophy melts away over months.'] }}
        isnt={{ h: 'Chase it', points: ['At the valve, a persistent waist, a balloon : annulus still < 1.2.', 'A fixed, rounded Doppler envelope the next day.', 'Re-dilate — within 1.4 ×.'] }} />
      <Why title="🔪 Why relief can make the infundibulum angrier"
        chain={[
          { k: 'YEARS', t: 'The RV built thick muscle to push against the valve.' },
          { k: 'SUDDEN RELIEF', t: 'The valve opens: afterload drops in seconds.' },
          { k: 'OVERSHOOT', t: 'The same muscle now empties a smaller cavity faster and further.' },
          { k: 'OUTLET CLOSES', t: 'In late systole the infundibular walls meet: a new, dynamic obstruction BELOW the valve you just opened.' },
        ]} />
    </>
  );
}

/* ============================================================
   7 · THE VALVULOPLASTY
   ============================================================ */

function Procedure() {
  const { answers, answer, bump, setVitals } = useCase();
  const plan = answers['s4-size'];
  const balloon = plan ? plan.balloon : 25;
  const r = answers['s7-bpv'];
  const best = r && r.success && r.maxDur <= 10 && r.inflations <= 3;
  const ok = r && r.success && !best;
  return (
    <>
      <div className="cs-h2">📈 Before — the baseline pull-back</div>
      <PullbackTrace mode="pre" />
      <p className="cs-pts">RV 104/6, PA 24/10: a peak-to-peak gradient of 80 mmHg. RV pressure is ~93% of her systemic pressure.</p>

      <div className="cs-h2">🛠️ The valvuloplasty</div>
      <p className="cs-p">Your {balloon}-mm balloon is on the stiff wire in the left PA. Turn on the reference frame, centre the balloon on the annulus, then hold to inflate. Watch the waist — and the clock.</p>
      <Valvuloplasty balloon={balloon} done={!!r} onResult={res => { answer('s7-bpv', res); bump({ fluoro: 420, contrast: 12 }); setVitals({ hr: 86, sys: 112, dia: 68 }); }} />
      {r && (
        <div className={'cs-fb ' + (best ? 'best' : ok ? 'ok' : 'wrong')}>
          {r.success ? `Waist abolished after ${r.inflations} inflation${r.inflations > 1 ? 's' : ''}; longest ${r.maxDur.toFixed(1)} s${r.squirts ? `; ${r.squirts} squirt${r.squirts > 1 ? 's' : ''}` : ''}.` : 'The waist never broke.'}{' '}
          {best ? 'Centred, decisive, short. That is how it is done.' : r.success ? (r.maxDur > 10 ? 'Too long inflated: she was bradycardic and grey.' : 'More inflations than needed — each one is a cork in the outflow.') : 'Centre the waist in the middle of the balloon and inflate to nominal pressure.'}
          {balloon / 20 > 1.45 && ' Your balloon was oversized for a 20-mm annulus: echo shows a new rim of pericardial fluid — watch it.'}
        </div>
      )}
      <ScoreOnce id="s7-bpv" pts={r == null ? null : best ? 20 : ok ? 10 : 2} max={20} />

      {r && (
        <>
          <div className="cs-h2">📉 After — pull back again</div>
          <PullbackTrace mode="post" />
          <Decision id="s7-read" question="Read the new pull-back."
            options={[
              { id: 'good', label: 'Valve gradient 18 mmHg — a successful valvuloplasty; a further 19 mmHg sits in the infundibulum (dynamic)', verdict: 'best', points: 10,
                why: 'Success is a residual peak-to-peak valve gradient below ~30–35 mmHg. The step-up from the RV body to the infundibulum is muscle, not valve.' },
              { id: 'fail', label: 'RV 64 mmHg — the procedure failed', verdict: 'wrong', points: 0, why: 'You must split the gradient into its levels before you call it.' },
              { id: 'ph', label: 'PA 27 mmHg — she has pulmonary hypertension now', verdict: 'wrong', points: 0, why: 'Normal: the PA is simply receiving the flow the valve used to block.' },
            ]} />
          <Contrast title="📏 Doppler peak vs catheter peak-to-peak"
            is={{ h: 'Catheter peak-to-peak (today)', points: ['RV peak minus PA peak, measured on pull-back.', 'Non-simultaneous; always the smaller number.', 'The number used in the lab to judge success.'] }}
            isnt={{ h: 'Doppler peak instantaneous (clinic)', points: ['The largest instantaneous gradient.', 'Higher than the catheter number — the echo mean tracks it better.', 'Compare like with like at follow-up.'] }} />
        </>
      )}
      <Why title="🧭 Why you pull back twice — and slowly"
        chain={[
          { k: 'ONE NUMBER LIES', t: 'RV minus PA mixes two obstructions in series: the valve and the muscle below it.' },
          { k: 'PULL SLOWLY', t: 'An end-hole catheter drawn back from the PA records a step at each level.' },
          { k: 'THE VALVE STEP', t: 'PA → infundibulum: what the balloon was meant to fix.' },
          { k: 'THE MUSCLE STEP', t: 'Infundibulum → RV body: dynamic, will fall with volume and beta-blockade — and must not be ballooned.' },
        ]} />
      <div className="cs-media-row" style={{ marginTop: 12 }}>
        <Video id="SwpoXbQI3Oo" title="Balloon pulmonary valvuloplasty — a case from Swagat Hospital" />
        <Video id="sCBucOkNssk" title="Pulmonary stenosis — clinical findings, investigation, treatment" />
      </div>
      <CaseLibrary title="Pulmonary valvuloplasty in real cases" channels={PS_SEARCHES}>
        Look for the waist on the balloon in the lateral view, how short the inflations are, and the pull-back afterwards.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   8 · BACK ON THE UNIT
   ============================================================ */

function Recovery() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🛏️ 11:00</span>Bed 10, Valvular & Structural Heart Unit. Comfortable, BP 112/68, HR 86. The groin is dry. She asks for toast. She feels nauseated after the sedation.</p>
      </div>
      <MultiSelect id="s8-checks" question="Her first afternoon. What matters?"
        items={[
          { id: 'fluids', label: 'Keep IV fluids running until she is drinking well — treat nausea early', correct: true, why: 'She has fasted for 12 hours and is about to vomit. An empty RV with a thick infundibulum is a closing door.' },
          { id: 'tele', label: 'Telemetry overnight', correct: true, why: 'Ectopy and the dynamic obstruction both show here first.' },
          { id: 'echo', label: 'Echo tomorrow: valve gradient, infundibular gradient (shape of the envelope), PR, effusion', correct: true, why: 'Separates the fixed result from the dynamic one.' },
          { id: 'groin', label: 'Groin check and early mobilisation once haemostasis is secure', correct: true, why: 'Venous access only.' },
          { id: 'bb', label: 'Consider oral propranolol if the infundibular gradient is significant', correct: true, why: 'Slows the heart, lets the RV fill, softens the squeeze. Stopped once the hypertrophy regresses.' },
          { id: 'furo', label: 'Furosemide to “take the strain off the RV”', correct: false, why: 'She needs the opposite: a full ventricle.' },
          { id: 'endo', label: 'Start endocarditis prophylaxis for dental work', correct: false, why: 'No prosthetic material: native valve after balloon valvuloplasty is not a high-risk group (ESC 2023). Good oral hygiene matters more.' },
        ]} />
      <Decision id="s8-antiemetic" question="She is retching. Which anti-emetic?"
        options={[
          { id: 'ond', label: 'Ondansetron 4 mg IV — and a fluid bolus', verdict: 'best', points: 10,
            why: 'Effective, no vasodilation, no tachycardia. Vomiting itself dries her out.' },
          { id: 'cyc', label: 'Cyclizine 50 mg IV', verdict: 'ok', points: 4, why: 'Works, but its anticholinergic tachycardia is unhelpful tonight.' },
          { id: 'none', label: 'Nothing — it will pass', verdict: 'wrong', points: 0, why: 'Vomiting + fasting = hypovolaemia = an obstructed infundibulum.' },
        ]} />
      <Why title="💧 Why dehydration is dangerous TODAY, not last week"
        chain={[
          { k: 'LAST WEEK', t: 'The narrow valve held the RV pressure high; the cavity stayed open against it.' },
          { k: 'TODAY', t: 'The valve is open: the hypertrophied RV empties fast and far.' },
          { k: 'LESS VOLUME', t: 'A smaller end-diastolic volume brings the thick infundibular walls closer before systole even starts.' },
          { k: 'CONTACT', t: 'Add tachycardia from vomiting or pain, and the walls meet in systole: the outlet closes.' },
        ]} />
      <Contrast title="💦 the early leak vs the late leak"
        is={{ h: 'Early pulmonary regurgitation (common, benign)', points: ['Mild PR after the commissures split.', 'A low-pressure circuit: the RV tolerates it for years.', 'Expected — tell her so.'] }}
        isnt={{ h: 'Late severe PR (decades later)', points: ['RV volume overload, dilation, exercise intolerance, arrhythmia.', 'Followed with echo and CMR volumes.', 'Treated with pulmonary valve replacement — surgical or transcatheter — before the RV is ruined.'] }} />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — THE SUICIDE RIGHT VENTRICLE
   ============================================================ */

function Crisis() {
  const { answers, answer } = useCase();
  const r = answers['s9-board'];
  const pts = r == null ? null : r.harms.length === 0 ? 20 : r.arrest ? 4 : 8;
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>🚨 13:40</span>
          She vomited twice, refused her drink, then got up to walk to the bathroom. The nurse finds her slumped on the bed: grey, sweaty, “my chest feels tight”. BP 76/48, HR 128. The FY2 is drawing up dobutamine: “Her RV must be failing after the procedure.”
        </p>
      </div>
      <BedsideMonitor />
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Bedside echo · 13:44</div>
        <p className="cs-p">A small, hyperdynamic RV that almost obliterates in systole. No effusion. The valve is wide open. CW through the RVOT: a <b>late-peaking, dagger-shaped</b> jet at 4.6 m/s — a dynamic gradient of ~85 mmHg below the valve. The LV is small and underfilled.</p>
      </div>

      <Decision id="s9-dx" question="What is happening?"
        options={[
          { id: 'suicide', label: 'Dynamic infundibular obstruction — the “suicide right ventricle” — triggered by hypovolaemia and tachycardia', verdict: 'best', points: 10,
            why: 'A hypertrophied infundibulum, an open valve, a small hyperdynamic RV, a dagger-shaped late-peaking jet and hypotension within hours of relief.' },
          { id: 'tamp', label: 'Tamponade from an RVOT tear', verdict: 'wrong', points: 2, why: 'Always look — but there is no effusion.' },
          { id: 'rvf', label: 'Acute RV failure', verdict: 'wrong', points: 0, why: 'The RV is not failing; it is too strong for its own outlet. Treat it as failure and you will kill her.' },
          { id: 'vv', label: 'Vasovagal after vomiting', verdict: 'wrong', points: 2, why: 'Vagal episodes are slow, not 128.' },
        ]} />
      <Decision id="s9-dob" question="The FY2 is about to connect the dobutamine. You say…"
        options={[
          { id: 'stop', label: '“Stop — don’t connect it. Fluids wide open, lie her flat with her legs up, and get me IV esmolol.”', verdict: 'best', points: 10,
            why: 'More contractility and more rate tighten the squeeze. Volume opens the cavity; a beta-blocker slows and softens the contraction. If pressure must be supported, a pure vasoconstrictor (phenylephrine) is the choice — not an inotrope.' },
          { id: 'half', label: '“Start it at a low dose and see.”', verdict: 'wrong', points: 0, why: 'Even a low dose raises rate and contractility. See the M&M story “The dobutamine drip”.' },
          { id: 'adr', label: '“Give adrenaline instead — she’s peri-arrest.”', verdict: 'wrong', points: 0, why: 'The worst drug for this patient.' },
        ]} />

      <div className="cs-h2">🎛️ Resuscitate her</div>
      <p className="cs-p">Each button is an order. Watch the infundibulum, the gradient and her blood pressure. Stabilise her: systolic ≥ 100 mmHg and an infundibular gradient ≤ 40 mmHg.</p>
      <SuicideRV done={!!r} onResult={res => answer('s9-board', res)} />
      {r && (
        <div className={'cs-fb ' + (pts === 20 ? 'best' : pts >= 8 ? 'ok' : 'wrong')}>
          Stabilised in {r.steps} order{r.steps > 1 ? 's' : ''}.{' '}
          {r.harms.length === 0 ? 'No inotrope, no vasodilator, no diuretic: you treated the mechanism.' : `You gave ${r.harms.length} harmful drug${r.harms.length > 1 ? 's' : ''}${r.arrest ? ' and she arrested' : ''}. Each one tightened the outlet.`}
        </div>
      )}
      <ScoreOnce id="s9-board" pts={pts} max={20} />

      <Why title="💀 Why inotropes kill this patient"
        chain={[
          { k: 'THE OBSTRUCTION', t: 'It is made of muscle — the harder it contracts, the tighter it closes.' },
          { k: 'INOTROPE', t: 'Dobutamine or adrenaline: stronger, faster contraction.' },
          { k: 'LESS FILLING', t: 'Tachycardia shortens diastole; the cavity starts smaller.' },
          { k: 'CLOSED', t: 'The infundibular walls meet earlier in systole: less flow to the lungs, less to the LV.' },
          { k: 'SPIRAL', t: 'The pressure falls further, the team gives more inotrope — and the outflow shuts completely.' },
        ]} />
      <Contrast title="🫀 the suicide RV vs the failing ventricle"
        is={{ h: 'Dynamic obstruction (hers)', points: ['Small, hyperdynamic, hypertrophied ventricle.', 'Late-peaking dagger gradient.', 'Volume, beta-blocker, phenylephrine. NO inotropes, NO vasodilators, NO diuretics.'] }}
        isnt={{ h: 'Failing, dilated ventricle (cardiogenic shock)', points: ['Big, poorly contracting ventricle.', 'Low gradients; high filling pressures.', 'Inotropes and offloading help.'] }} />

      <MultiSelect id="s9-next" question="She is stable at 104/66, HR 92. What next?"
        items={[
          { id: 'prop', label: 'Oral propranolol for the next weeks to months', correct: true, why: 'Until the infundibular hypertrophy regresses — echo will show the dagger shrinking.' },
          { id: 'fluid', label: 'Maintenance fluid until she is eating and drinking', correct: true, why: 'Preload is her friend.' },
          { id: 'echo', label: 'Repeat echo before discharge', correct: true, why: 'Infundibular gradient falling, valve gradient stable.' },
          { id: 'warn', label: 'A note on her chart and discharge letter: “dynamic RVOT obstruction — avoid inotropes”', correct: true, why: 'So the next team does not repeat the FY2’s instinct.' },
          { id: 'redo', label: 'Back to the lab for a bigger balloon', correct: false, why: 'The valve is open. The problem is muscle.' },
        ]} />
      <Video id="7l1IAEeYBr4" title="Pulmonary regurgitation & stenosis — valvular heart disease" />
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
      <ViciousCycle id="cyc-suicide" title="The suicide RV — 13:40"
        nodes={[
          { short: 'Relief', t: 'The valve is opened: afterload falls in seconds', d: 'The thick RV empties a smaller cavity, faster.' },
          { short: 'Dry & fast', t: 'Fasting, vomiting, pain: low preload, tachycardia', d: 'The cavity is small before systole begins.' },
          { short: 'Outlet shuts', t: 'Infundibular walls meet in late systole', d: 'A dynamic gradient appears below the open valve.' },
          { short: 'Low output', t: 'Less flow to the lungs and LV: hypotension', d: 'The LV is starved of preload.' },
          { short: 'Catecholamines', t: 'Adrenaline surge — or an inotrope from the team', d: 'Faster, stronger contraction: the outlet closes tighter. The spiral tightens.' },
        ]}
        breaks={[
          { at: 1, t: 'Volume: fluids, legs up. A full RV holds its outlet open.' },
          { at: 4, t: 'Beta-blockade (esmolol, propranolol): slower, softer contraction, longer filling. And NO inotropes.' },
          { at: 3, t: 'If pressure must be supported: phenylephrine — tone without inotropy or tachycardia.' },
          { at: 0, t: 'Prevention: fluids before and after the lab, anti-emetics, beta-blocker when a big infundibular gradient is seen.' },
        ]} />
      <Decision id="cyc-why" question="Why does phenylephrine help here when it would not help a failing ventricle?"
        options={[
          { id: 'tone', label: 'It raises systemic pressure and coronary perfusion without adding contractility or rate — and may slow the heart reflexly — so it does not tighten the outlet', verdict: 'best', points: 10,
            why: 'The same logic as HOCM and tetralogy spells: in dynamic outflow obstruction, squeeze is the enemy and tone is a friend.' },
          { id: 'ino', label: 'It is a strong inotrope', verdict: 'wrong', points: 0, why: 'Pure alpha-agonist: no inotropy — that is the point.' },
        ]} />
      <ViciousCycle id="cyc-ps" title="The pressure-loaded RV — why severe PS kills on exertion"
        nodes={[
          { short: 'Fixed outlet', t: 'A narrow valve caps the RV output', d: 'At rest, enough. On exercise, not.' },
          { short: 'Hypertrophy', t: 'The RV wall thickens and stiffens', d: 'High filling pressure; a giant a-wave.' },
          { short: 'Exercise', t: 'Muscle beds dilate, output cannot rise', d: 'Systemic pressure falls.' },
          { short: 'RV ischaemia', t: 'RV pressure near systemic; coronary pressure falling', d: 'The thick RV wall is under-perfused, exactly when it works hardest.' },
          { short: 'Arrhythmia', t: 'Ischaemic, irritable RV', d: 'Presyncope, syncope, sudden death — and a worse RV for next time.' },
        ]}
        breaks={[
          { at: 0, t: 'Relieve the obstruction: balloon valvuloplasty.' },
          { at: 2, t: 'No competitive or strenuous exertion until relieved.' },
          { at: 3, t: 'Avoid vasodilators and dehydration: they drop the pressure that perfuses the RV.' },
        ]} />
      <ViciousCycle id="cyc-pr" title="The slow spiral — pulmonary regurgitation decades later"
        nodes={[
          { short: 'PR', t: 'A leaky pulmonary valve after relief', d: 'Blood falls back into the RV every diastole.' },
          { short: 'Volume load', t: 'RV dilates', d: 'Quietly, over years.' },
          { short: 'TR', t: 'Tricuspid annulus stretches', d: 'Tricuspid regurgitation adds to the volume load.' },
          { short: 'Arrhythmia', t: 'Stretched RV: atrial and ventricular arrhythmias', d: 'And exercise capacity falls.' },
        ]}
        breaks={[
          { at: 1, t: 'Surveillance: echo, and CMR RV volumes when PR is significant.' },
          { at: 0, t: 'Pulmonary valve replacement (surgical or transcatheter) before the RV is irreversibly dilated.' },
          { at: 3, t: 'Treat arrhythmia; it is often the first sign.' },
        ]} />
      <Decision id="cyc-ex" question="Before her valvuloplasty, a colleague suggested a vasodilator “to lower her RV pressure”. Why would that have been dangerous?"
        options={[
          { id: 'fixed', label: 'The obstruction is in the valve, not the lungs: a vasodilator lowers systemic pressure behind a fixed outlet and steals RV coronary perfusion', verdict: 'best', points: 10,
            why: 'Her PA pressure is normal. Pulmonary or systemic vasodilators cannot open a fused valve — they only take pressure away from the brain and the RV.' },
          { id: 'ok', label: 'It would not — it lowers afterload on the RV', verdict: 'wrong', points: 0, why: 'Her RV afterload IS the valve.' },
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

      <WarStory title="The dobutamine drip"
        mistake="Treating hypotension after valvuloplasty as RV failure and starting dobutamine."
        burn="After relief of severe PS, a small, angry RV with a dagger-shaped jet is obstruction, not failure. Volume and beta-blockers. Never inotropes.">
        <p className="cs-p">A 16-year-old, two hours after a successful valvuloplasty, BP 80/50 and HR 130 after vomiting. “The RV is tired.” Dobutamine 5, then 10. Within twenty minutes: BP 50, then PEA. Twelve minutes of CPR. Return of circulation came only when the anaesthetist stopped the dobutamine, ran in two litres and gave esmolol. She lived; the registrar never forgot.</p>
      </WarStory>
      <Decision id="mm-dob" question="What single bedside finding should have stopped the dobutamine?"
        options={[
          { id: 'echo', label: 'A small, hyperdynamic RV with a late-peaking dagger gradient below an open valve', verdict: 'best', points: 10, why: 'That picture means dynamic obstruction. A failing RV is big and weak.' },
          { id: 'lact', label: 'The lactate', verdict: 'wrong', points: 0, why: 'High in both.' },
        ]} />

      <WarStory title="The 33-mm balloon"
        mistake="Sizing the balloon from the dilated main PA instead of the annulus."
        burn="Measure at the hinge points. Balloon 1.2–1.4 × the annulus. Never > 1.5 ×.">
        <p className="cs-p">“The PA is 27 mm — let’s use a big balloon to be sure.” A 33-mm balloon in a 20-mm annulus. The waist popped — and so did the RV outflow. Pericardial blood, BP 60, emergency pericardiocentesis, sternotomy. She survived, with free pulmonary regurgitation and an RV that dilated within ten years.</p>
      </WarStory>
      <Decision id="mm-bar" question="What was the balloon : annulus ratio, and what should it have been?"
        options={[
          { id: 'r', label: '1.65 — it should have been 1.2–1.4 (a 25–28-mm balloon)', verdict: 'best', points: 10, why: '33/20 = 1.65.' },
          { id: 'w', label: '1.22 — the size was fine; the tear was bad luck', verdict: 'wrong', points: 0, why: 'That ratio used the PA diameter — the wrong denominator.' },
        ]} />

      <WarStory title="The Noonan heart nobody scanned"
        mistake="Sending a young man with Noonan syndrome for surgical valvotomy without looking at his left ventricle."
        burn="Noonan = look at the LV. Hypertrophic cardiomyopathy, obstruction, coagulation — before any anaesthetic.">
        <p className="cs-p">A 19-year-old with a dysplastic valve, booked for surgical valvotomy. The echo report described only the pulmonary valve. At induction — propofol, a fasted patient — his pressure collapsed: a 20-mm septum and severe LV outflow obstruction nobody had measured. Arrest on the table; he survived after phenylephrine, fluid and an emergency bypass run.</p>
      </WarStory>
      <Decision id="mm-noonan" question="Which pre-operative checks would have changed his anaesthetic?"
        options={[
          { id: 'lv', label: 'A full echo of the LV (septum, LVOT gradient) and a coagulation screen', verdict: 'best', points: 10, why: 'HCM affects up to ~1 in 5 with Noonan, and bleeding diatheses are common.' },
          { id: 'kary', label: 'A karyotype', verdict: 'wrong', points: 0, why: 'Normal in Noonan, and irrelevant to the anaesthetic.' },
        ]} />

      <WarStory title="Vasovagal"
        mistake="Labelling exertional syncope as vasovagal and an RVH ECG as athlete’s heart."
        burn="Syncope DURING exercise is cardiac until proven otherwise. RVH with right-axis deviation is never athlete’s heart.">
        <p className="cs-p">A 17-year-old footballer fainted mid-sprint. ECG: right-axis deviation, a dominant R in V1. “Athlete’s heart, vasovagal, hydrate.” No auscultation was documented. Four months later he collapsed on the pitch in VF. Bystander CPR and a defibrillator by the clubhouse; he survived with a hypoxic brain injury. Post-mortem-grade findings in life: severe valvular PS, gradient 110 mmHg.</p>
      </WarStory>

      <WarStory title="Pulmonary hypertension"
        mistake="Reading an RVSP of 100 mmHg from the TR jet as pulmonary hypertension without looking at the RV outflow."
        burn="TR velocity gives RV pressure. Before writing “pulmonary hypertension”, prove there is no obstruction between the RV and the PA.">
        <p className="cs-p">A 32-year-old woman with breathlessness and TR at 4.8 m/s. “Severe pulmonary hypertension.” Referred to the PH clinic and started on sildenafil while she waited. Six weeks later she fainted on the stairs and broke her wrist — and her pressure was 70/40 in the ED. The PH team’s right heart catheter showed a PA pressure of 22/9 and an RV of 108: severe PS. A balloon fixed it in forty minutes.</p>
      </WarStory>
      <Decision id="mm-ph" question="What single echo measurement would have caught it at the first scan?"
        options={[
          { id: 'rvot', label: 'CW Doppler across the RVOT and pulmonary valve', verdict: 'best', points: 10, why: 'A 4.6 m/s jet there, and PA pressure = RVSP − gradient.' },
          { id: 'tapse', label: 'TAPSE', verdict: 'wrong', points: 0, why: 'RV function — not where the pressure goes.' },
        ]} />

      <WarStory title="The pregnancy that came first"
        mistake="Telling a woman with symptomatic severe PS that “pregnancy is fine with pulmonary stenosis” and deferring treatment."
        burn="Severe PS: relieve it before conception. Pregnancy adds ~40–50% to the output a fixed valve must pass.">
        <p className="cs-p">She was told PS was “a benign valve”. At 27 weeks: breathless at rest, ankles swollen, runs of RV tachycardia. A balloon valvuloplasty under abdominal shielding at 28 weeks, a fetal bradycardia during the inflations, and an emergency caesarean at 31 weeks. Mother and baby survived — narrowly.</p>
      </WarStory>
    </>
  );
}

/* ============================================================
   DEBRIEF
   ============================================================ */

function Debrief() {
  const { totals, def } = useCase();
  const pct = totals.max ? Math.round(totals.got / totals.max * 100) : 0;
  const band = pct >= 85 ? 'Distinction' : pct >= 70 ? 'Pass with merit' : pct >= 55 ? 'Pass' : 'Needs another run';
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🏠 day 9</span>Echo: the valve gradient is 28 mmHg (2.6 m/s); the dagger-shaped infundibular gradient below it is down to 30 mmHg on propranolol. Mild PR. No effusion. She walks the stairs twice without greying out and asks when she can go back to teaching.</p>
      </div>
      <MultiSelect id="s10-home" question="Her discharge plan?"
        items={[
          { id: 'prop', label: 'Propranolol, reviewed at 3 months as the infundibulum regresses', correct: true, why: 'Then stopped.' },
          { id: 'fu', label: 'ACHD clinic with echo at 3–6 months, then every few years — watching for restenosis and pulmonary regurgitation', correct: true, why: 'Lifelong follow-up: PR is the long-term issue.' },
          { id: 'gen', label: 'Genetics clinic for the Noonan result and preconception counselling; fetal echo in pregnancy', correct: true, why: '50% recurrence risk if confirmed.' },
          { id: 'preg', label: 'Pregnancy can be planned once the follow-up echo confirms a good result', correct: true, why: 'Mild residual PS is well tolerated.' },
          { id: 'work', label: 'Return to teaching and normal activity after the groin heals (about a week)', correct: true, why: 'With mild residual PS, all sports are allowed once the infundibular gradient has settled.' },
          { id: 'ie', label: 'Lifelong antibiotic prophylaxis before dental work', correct: false, why: 'Not for a native valve after balloon valvuloplasty (ESC 2023).' },
          { id: 'oac', label: 'Anticoagulation for 3 months', correct: false, why: 'No prosthesis, no AF.' },
        ]} />

      <div className="cs-h2">📝 Case quiz</div>
      <Quiz id="s10-quiz" items={[
        { q: 'Which heart sound gets SOFTER with inspiration?', options: ['Tricuspid regurgitation murmur', 'Pulmonary ejection click', 'Right-sided S3', 'Pulmonary stenosis murmur'], answer: 1, why: 'Inspiration pre-opens the doming valve via a bigger atrial kick: no snap, no click.' },
        { q: 'Widely split S2 that does NOT move with respiration suggests…', options: ['Pulmonary stenosis', 'Right bundle branch block', 'Atrial septal defect', 'Pulmonary hypertension'], answer: 2, why: 'Fixed splitting = ASD. In PS the split still widens on inspiration.' },
        { q: 'PS peak velocity 4.4 m/s. Peak gradient ≈', options: ['18 mmHg', '44 mmHg', '77 mmHg', '96 mmHg'], answer: 2, why: '4 × 4.4² = 77.' },
        { q: 'TR 4.9 m/s, RAP 3 mmHg, PS peak gradient 77 mmHg. PA systolic pressure ≈', options: ['99 mmHg', '77 mmHg', '22 mmHg', 'Cannot be estimated'], answer: 2, why: 'RVSP 99 − 77 = 22.' },
        { q: 'ESC 2020 ACHD: intervention is recommended regardless of symptoms in valvular PS when the peak Doppler gradient exceeds…', options: ['36 mmHg', '50 mmHg', '64 mmHg', '80 mmHg'], answer: 2, why: '> 64 mmHg (peak velocity > 4 m/s), provided no valve replacement is required.' },
        { q: 'The recommended balloon : annulus ratio for pulmonary valvuloplasty is about…', options: ['0.8–1.0', '1.2–1.4', '1.5–1.7', '2.0'], answer: 1, why: 'Above 1.5 risks annular tear and severe PR.' },
        { q: 'Which valve responds poorly to a balloon?', options: ['Doming valve with commissural fusion', 'Dysplastic valve (e.g. Noonan)', 'A valve with a loud ejection click', 'A valve with post-stenotic PA dilation'], answer: 1, why: 'No fused seams to split.' },
        { q: 'A late-peaking, dagger-shaped CW envelope in the RVOT after valvuloplasty indicates…', options: ['Restenosis', 'Dynamic infundibular obstruction', 'Pulmonary regurgitation', 'Pulmonary hypertension'], answer: 1, why: 'Muscle closing the outlet in late systole.' },
        { q: 'First-line treatment of the “suicide right ventricle” is…', options: ['Dobutamine', 'Adrenaline', 'Volume and beta-blockade', 'Furosemide and GTN'], answer: 2, why: 'Fill it and slow it; phenylephrine if pressure support is needed.' },
        { q: 'The commonest long-term problem after successful pulmonary valvuloplasty is…', options: ['Endocarditis', 'Pulmonary regurgitation', 'Aortic stenosis', 'Complete heart block'], answer: 1, why: 'Usually mild; followed for life.' },
      ]} />

      <div className="cs-card" style={{ borderColor: 'var(--accent2)' }}>
        <div className="cs-h2" style={{ marginTop: 0 }}>🏆 Your score</div>
        <p className="cs-p" style={{ fontSize: 20 }}><b className="cs-mono">{totals.got} / {totals.max}</b> · {pct}% · <b style={{ color: pct >= 70 ? 'var(--good)' : 'var(--amber)' }}>{band}</b></p>
        <div className="cs-scorebar" style={{ marginBottom: 14 }}><i style={{ width: `${pct}%` }} /></div>
        <Table head={['Stage', 'Points']} rows={def.stages.map(st => [st.title, N(`${totals.by[st.id]?.got || 0} / ${totals.by[st.id]?.max || 0}`)])} />
      </div>

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🔥 Take-home points</div>
        <ol className="cs-ul">
          <li className="cs-li">🫁 The pulmonary ejection click is the one right-sided sound that gets SOFTER on inspiration — the atrial kick opens the dome early.</li>
          <li className="cs-li">⏳ The longer and later the murmur, the soft late P2 and the giant a-wave: the worse the stenosis. No click? Think dysplastic valve.</li>
          <li className="cs-li">🏃 Syncope during exertion is cardiac until proven otherwise. RVH on an ECG is never “athlete’s heart”.</li>
          <li className="cs-li">🧮 The TR jet measures RV pressure. In PS, PA pressure = RVSP − the valve gradient. Look at the RVOT before you write “pulmonary hypertension”.</li>
          <li className="cs-li">📏 Severe PS: > 4 m/s, > 64 mmHg peak — the ESC 2020 threshold to intervene even without symptoms.</li>
          <li className="cs-li">🎈 Doming valve → balloon at 1.2–1.4 × the annulus, measured at the hinge points. Dysplastic valve → think surgery.</li>
          <li className="cs-li">🧬 Noonan features → look at the LV for HCM, check coagulation, offer genetics before pregnancy.</li>
          <li className="cs-li">💀 After relief, a small angry RV with a dagger jet is the suicide RV: volume, beta-blocker, phenylephrine. NEVER inotropes.</li>
          <li className="cs-li">🤰 Fix severe PS before pregnancy; high-flow states inflate the gradient.</li>
          <li className="cs-li">💦 Pulmonary regurgitation is the long-term price — follow her for life.</li>
        </ol>
      </div>
      <CaseLibrary playlist={VALVE_PLAYLIST} start={VALVE_PLAYLIST_START} channels={[...PS_SEARCHES, ...VALVE_CHANNELS]}>
        Keep going: pulmonary valvuloplasty searches on the recommended channels, and the unit’s structural playlist.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const VALVE_10 = {
  title: 'Severe valvular pulmonary stenosis · Balloon valvuloplasty · The suicide right ventricle',
  short: 'Structural Heart · Case 10',
  patient: {
    name: 'Ms Yasmin Darwish',
    meta: '24 F · MRN 5107-2294 · 52 kg',
    flags: [
      { text: 'Exertional presyncope', tone: 'red' },
      { text: 'Noonan features', tone: 'amber' },
      { text: 'Planning pregnancy', tone: 'blue' },
      { text: 'No medications', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 60, limit: 200, basis: 'normal renal function' },
  clock0: min(15, 40),
  vitals0: { hr: 104, sys: 106, dia: 70, spo2: 98, rr: 20, st: 0, rhythm: 'sinus' },
  brand: { icon: '🫀', line: 'Structural Heart · Case 10' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / EM / IM', tone: 'cyan' },
      { text: 'Adult congenital · structural', tone: 'red' },
      { text: 'ESC 2020 ACHD-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'The click', style: 'outline' },
      { text: 'that vanishes', style: 'grad' },
      { text: '& the suicide ventricle', style: 'cyan' },
    ],
    hook: (
      <>
        A PE teacher races her class across the playground and her world goes <b>grey</b>. She is 24, she wants a baby this year, and her heart has a sound that disappears every time she breathes in.
        You will hear why, measure a pressure that looks like pulmonary hypertension and <span className="g">isn’t</span>, size a balloon and split a valve —
        then meet the ventricle that, freed at last, <span className="r">tries to strangle itself</span>.
      </>
    ),
    image: null,
    sims: 's2',
    crisis: 's9',
    cards: [
      { k: '👩‍🏫 The patient', t: 'Ms Yasmin Darwish, 24 — exertional presyncope, a thrill, a family secret and pregnancy plans.' },
      { k: '🩺 Your role', t: 'From the ED to the echo lab, the ACHD heart team, the cath lab and bed 10.' },
      { k: '🎛️ In your hands', t: 'The click that breathes, CW Doppler and RVSP, balloon sizing, the valvuloplasty, pull-backs, and a resuscitation board.' },
      { k: '🧠 How it teaches', t: 'Fixed vs dynamic obstruction — and why the drug that saves a failing heart kills this one.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'She went grey on the playground', Component: Presentation,
      pill: '🏃 16:30 — syncope during exercise',
      lede: 'Listen while she breathes, read the RV on her ECG, see the syndrome — and do not send her home.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 104, sys: 106, dia: 70, spo2: 98, rr: 20, rhythm: 'sinus' }); atLeastClock(min(16, 30)); } },
    { id: 's2', icon: '📏', nav: 'Echo & Doppler', title: 'Measure it — Doppler, RVSP and the level', Component: Echo,
      pill: '🎯 The pressure that isn’t pulmonary hypertension',
      lede: 'Peak and mean gradients, the TR jet, the IVC — and where the obstruction really is.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 82, sys: 110, dia: 70, spo2: 98, rr: 16, rhythm: 'sinus' }); atLeastClock(min(24 + 9, 0)); } },
    { id: 's3', icon: '👥', nav: 'Heart Team', title: 'The ACHD heart team', Component: HeartTeam,
      pill: '🧭 Day 3 — balloon, surgery, or a baby first?',
      lede: 'Thresholds, doming vs dysplastic, Noonan, tetralogy, pregnancy — and her consent.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 80, sys: 112, dia: 70, spo2: 98, rhythm: 'sinus' }); atLeastClock(min(48 + 14, 0)); } },
    { id: 's4', icon: '🧮', nav: 'Balloon Sizing', title: 'Planning: size the balloon', Component: Planning,
      pill: '📐 1.2–1.4 × the annulus',
      lede: 'Measure at the hinge points, choose the balloon, place the wire.',
      enter: ({ atLeastClock }) => atLeastClock(min(48 + 15, 0)) },
    { id: 's5', icon: '🩸', nav: 'Set-up', title: 'Set-up in the cath lab', Component: Setup,
      pill: '🧷 Day 7 — fluids on before the first needle',
      lede: 'Checklist, sequence, and why every inflation is counted in seconds.',
      enter: ({ setVitals, atLeastClock, bump }) => { setVitals({ hr: 84, sys: 112, dia: 68, spo2: 98, rhythm: 'sinus' }); atLeastClock(min(144 + 8, 30)); bump({ act: 264 }); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy: the waist, the squirt, the residual gradient', Component: Strategy,
      pill: '🔀 Four branch points',
      lede: 'What to do when the balloon misbehaves — and the gradient you must leave alone.',
      enter: ({ atLeastClock }) => atLeastClock(min(144 + 9, 0)) },
    { id: 's7', icon: '🛠️', nav: 'Valvuloplasty', title: 'Balloon pulmonary valvuloplasty', Component: Procedure,
      pill: '🎈 Centre, inflate, pop, deflate',
      lede: 'Pull back, split the valve, pull back again — and read what is left.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 84, sys: 112, dia: 68, spo2: 98, rhythm: 'sinus' }); atLeastClock(min(144 + 9, 20)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit', Component: Recovery,
      pill: '💧 Keep her full',
      lede: 'Bed 10: fluids, anti-emetics, the right checks — and the leak to expect.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 88, sys: 112, dia: 68, spo2: 98, rr: 16, rhythm: 'sinus' }); atLeastClock(min(144 + 11, 0)); } },
    { id: 's9', icon: '🚨', nav: 'The Crisis', title: 'The suicide right ventricle', Component: Crisis,
      pill: '💀 13:40 — the FY2 is drawing up dobutamine',
      lede: 'Recognise dynamic infundibular obstruction, stop the wrong drug, resuscitate her the right way.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 128, sys: 76, dia: 48, spo2: 95, rr: 24, rhythm: 'sinus' }); atLeastClock(min(144 + 13, 40)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'The suicide spiral, the exertional spiral, and the slow leak decades later.',
      enter: ({ setVitals }) => setVitals({ hr: 80, sys: 110, dia: 68, spo2: 98, rhythm: 'sinus' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Six patients who taught these rules.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'Her plan, the quiz — then your score.',
      enter: ({ atLeastClock }) => atLeastClock(min(192 + 10, 0)) },
  ],
};

export default function Valve10({ onClose }) {
  return <CaseShell def={VALVE_10} onClose={onClose} />;
}
