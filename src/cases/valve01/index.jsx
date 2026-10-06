import React, { useState } from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Figure, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor,
} from '../kit/CaseKit.jsx';
import ECG12 from '../kit/ECG12.jsx';
import { Auscultation, Doppler, Hemodynamics, TaviDeploy } from '../kit/Valve.jsx';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 01
   Severe, symptomatic, high-gradient calcific aortic stenosis in
   a 79-year-old: exertional syncope, angina and breathlessness.
   Bedside diagnosis, Doppler measurement and the continuity
   equation; the heart team; CT planning; transfemoral TAVI on
   rapid pacing — and, two nights later on the unit, complete
   heart block from the valve frame pressing on the conduction
   system beneath the membranous septum.

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
        <div><span>Aortic valve area</span><b style={{ color: ava <= 1.0 ? 'var(--red)' : 'var(--amber)' }}>{ava.toFixed(2)} cm²</b></div>
        <div><span>Indexed (BSA 1.9)</span><b>{(ava / 1.9).toFixed(2)} cm²/m²</b></div>
        <div><span>Dimensionless index</span><b style={{ color: 'var(--red)' }}>{dvi.toFixed(2)}</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 10 }}>A 1 mm error in the LVOT diameter — the width of a calliper mark — moves the AVA by ~10%, because the diameter is <b>squared</b>. The dimensionless index (LVOT VTI ÷ AV VTI) never touches the diameter: below 0.25 is severe whatever the ruler says.</p>
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
        <p className="cs-p"><span className="cs-time">09:40</span>Mr Elias Mansour, 79, a retired civil engineer, was carrying two watering cans up the garden path when the world “went grey from the edges in”. His wife found him on the path, conscious again within a minute, grazed, not confused, not incontinent.</p>
        <p className="cs-p"><span className="cs-time">history</span>Six months of breathlessness after one flight of stairs, and a tight chest when he hurries — which he put down to age. One similar near-faint in the summer, also on exertion. Hypertension, mild COPD (ex-smoker), eGFR 58. Amlodipine 10 mg, ramipril 5 mg, atorvastatin 20 mg.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">10:20</span>Emergency department. Now well. A junior colleague has heard “a murmur, probably sclerosis — he’s 79”.</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Observations · 10:20</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('72 /min, regular')], ['Blood pressure', N('118/80 mmHg — pulse pressure 38', 'cs-hi')], ['SpO₂', N('95% on air')],
            ['Resp. rate', N('16 /min')], ['Temperature', N('36.6 °C')], ['Glucose', N('6.4 mmol/L')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Carotid pulse: small, slow-rising, a shudder under the finger.</li>
            <li className="cs-li">Apex: undisplaced but sustained, heaving.</li>
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

      <ECG12 rate={72} shape={LVH.shape} st={LVH.st} tInv={LVH.tInv}
        caption="Sinus rhythm, PR 210 ms (first-degree AV block). Left ventricular hypertrophy by voltage (S V2 + R V5 ≈ 55 mm), with lateral ST depression and T inversion — the “strain” pattern of a pressure-loaded LV." />

      <Decision id="s1-syncope" question="What do you make of the faint?"
        options={[
          { id: 'as', label: 'Exertional syncope from severe aortic stenosis until proven otherwise — admit for urgent assessment', verdict: 'best', points: 10,
            why: 'Syncope on exertion with this murmur is a cardinal symptom of severe AS and marks a patient at risk of sudden death. He does not go home today.' },
          { id: 'vaso', label: 'Probably vasovagal; discharge with outpatient echo', verdict: 'wrong', points: 0, why: 'Vasovagal syncope is not triggered by carrying water uphill. Exertional syncope is cardiac until proven otherwise.' },
          { id: 'ortho', label: 'Orthostatic hypotension from his amlodipine', verdict: 'ok', points: 2, why: 'Worth checking, and his vasodilator may have contributed — but it does not explain the murmur or the exertional trigger.' },
          { id: 'tia', label: 'A TIA — CT head and stroke clinic', verdict: 'wrong', points: 0, why: 'Global loss of consciousness with rapid recovery is not a TIA.' },
        ]} />

      <Why title="Why he fainted carrying water uphill"
        chain={[
          { k: 'FIXED DOOR', t: 'A calcified valve caps how much blood the LV can push out each beat.' },
          { k: 'EXERCISE', t: 'Working leg muscles dilate their arterioles: total resistance falls.' },
          { k: 'NO RESERVE', t: 'A normal heart raises its output to match. His cannot — the door is fixed.' },
          { k: 'PRESSURE FALLS', t: 'Blood pressure = output × resistance. Output fixed, resistance falling: pressure falls.' },
          { k: 'GREY-OUT', t: 'The brain is first to notice — and a stretched, ischaemic LV can trigger a reflex vasodilatation that deepens the drop.' },
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
  return (
    <>
      <p className="cs-p">Transthoracic echo, 13:00. Heavily calcified trileaflet aortic valve with restricted opening. LV wall 14 mm, concentric hypertrophy, EF 58%. Stroke volume index 41 mL/m² — normal flow. Now measure.</p>
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

      <div className="cs-h2">B · Pulsed-wave Doppler in the outflow tract</div>
      <Doppler kind="pw-lvot" vmax={1.1} title="PW sample volume 5 mm below the valve" />
      <Continuity />

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
        is={{ h: 'High-gradient (his)', points: [
          'Mean ≥ 40 mmHg, Vmax ≥ 4 m/s, AVA ≤ 1.0 cm².',
          'Normal flow; the numbers agree.',
          'Diagnosis made — move on to the decision.',
        ] }}
        isnt={{ h: 'Low-flow, low-gradient', points: [
          'AVA ≤ 1.0 cm² but mean < 40 mmHg, SVi < 35 mL/m².',
          'Reduced EF: low-dose dobutamine echo — does the valve open with more flow (pseudo-severe) or does the gradient rise (true severe)?',
          'Preserved EF (small, thick LV): CT calcium score of the valve settles it.',
        ] }} />

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
          ['Echo', 'Severe high-gradient AS, EF 58%, no other significant valve disease'],
          ['Coronaries (CT)', 'Moderate non-obstructive disease; no proximal stenosis > 70%'],
          ['STS-PROM', N('3.8%')], ['Frailty', 'Mild: 5-metre walk 6.8 s, independent, lives with wife'],
          ['Lungs', 'Mild COPD, FEV₁ 68%'], ['Kidneys', 'eGFR 58'], ['His wish', '“I want to be safe to look after my wife — and my garden.”'],
        ]} />
      </div>

      <Decision id="s3-treat" question="Symptomatic severe aortic stenosis. Treat?"
        options={[
          { id: 'avr', label: 'Yes — aortic valve replacement, without delay', verdict: 'best', points: 10,
            why: 'Symptomatic severe AS is a class I indication. Untreated, mortality after the onset of syncope or heart failure is measured in a few years — and sudden death is real while he waits.' },
          { id: 'watch', label: 'Medical therapy and surveillance', verdict: 'wrong', points: 0, why: 'No drug opens a calcified valve. Medical therapy only manages blood pressure and fluid.' },
          { id: 'bav', label: 'Balloon valvuloplasty alone', verdict: 'ok', points: 2, why: 'A bridge in the unstable or as a diagnostic test — restenosis within months.' },
        ]} />
      <Decision id="s3-how" question="Which procedure does the heart team recommend?"
        options={[
          { id: 'tavi', label: 'Transfemoral TAVI', verdict: 'best', points: 10,
            why: 'Older patients (≥ 70 years in the 2025 ESC/EACTS guideline) with suitable transfemoral anatomy and tricuspid valves are generally offered TAVI: faster recovery, no sternotomy, outcomes at least as good at intermediate and low risk.' },
          { id: 'savr', label: 'Surgical AVR', verdict: 'ok', points: 5, why: 'Excellent durability and the choice for younger patients, bicuspid valves with difficult anatomy, or concomitant surgery — not his profile.' },
          { id: 'ta', label: 'Transapical TAVI', verdict: 'wrong', points: 1, why: 'For when the femoral route is impossible; more invasive and worse outcomes.' },
        ]} />
      <Contrast title="TAVI vs surgical AVR"
        is={{ h: 'TAVI', points: [
          'Through the femoral artery, under sedation, home in 1–3 days.',
          'Native leaflets pushed aside, not removed.',
          'More pacemakers and paravalvular leaks; long-term durability still being written.',
        ] }}
        isnt={{ h: 'Surgical AVR', points: [
          'Sternotomy and bypass; the calcified valve cut out and the annulus debrided.',
          'Fewer pacemakers, less leak, decades of durability data.',
          'Longer recovery; more bleeding, AF and kidney injury early.',
        ] }} />

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
          ['Annulus area', N('468 mm²'), 'The number valves are sized to'],
          ['Annulus perimeter', N('78 mm'), 'Cross-check'],
          ['Left main height', N('12.5 mm'), '> 10–12 mm: low obstruction risk'],
          ['RCA height', N('16 mm'), 'Low risk'],
          ['Sinus of Valsalva width', N('31 mm'), 'Room for displaced leaflets'],
          ['LVOT calcium', N('moderate, under the non-coronary cusp', 'cs-hi'), 'Annular rupture and leak risk'],
          ['Membranous septum length', N('4 mm — short', 'cs-hi'), 'Conduction system close to the frame'],
          ['Right common femoral, min. Ø', N('6.6 mm'), 'Accepts a 14F expandable sheath'],
        ]} />
      </div>
      <Decision id="s4-size" question="Balloon-expandable valve sizes: 23 mm (338–430 mm²), 26 mm (430–546 mm²), 29 mm (540–683 mm²). Which for an annulus of 468 mm²?"
        options={[
          { id: '26', label: '26 mm', verdict: 'best', points: 10, why: '468 mm² sits in the 26 mm range, with modest oversizing for a seal.' },
          { id: '23', label: '23 mm — smaller is safer', verdict: 'wrong', points: 0, why: 'Undersized: paravalvular leak, and the valve can migrate.' },
          { id: '29', label: '29 mm — bigger seals better', verdict: 'wrong', points: 0, why: 'Oversizing into calcified LVOT is how annular rupture happens.' },
        ]} />
      <Decision id="s4-access" question="Access route?"
        options={[
          { id: 'rcf', label: 'Right common femoral artery, ultrasound-guided, with pre-closure sutures', verdict: 'best', points: 10, why: 'Adequate size, little calcium, no tortuosity. Plan closure before you open.' },
          { id: 'sub', label: 'Subclavian', verdict: 'ok', points: 3, why: 'An alternative when the femoral route fails.' },
          { id: 'ta', label: 'Transapical', verdict: 'wrong', points: 0, why: 'Unnecessary with good femoral access.' },
        ]} />
      <Why title="Why a short membranous septum and a deep valve stop the heart"
        chain={[
          { k: 'ANATOMY', t: 'The His bundle emerges beneath the membranous septum, just under the commissure between the non- and right coronary cusps.' },
          { k: 'SHORT SEPTUM', t: 'A short membranous septum puts the His bundle millimetres from the annulus.' },
          { k: 'THE FRAME', t: 'The valve frame presses outward on the LVOT. The deeper it sits, the more of it pushes on the conducting tissue.' },
          { k: 'OEDEMA', t: 'Pressure, bruising and swelling over 24–72 hours: new LBBB, then sometimes complete heart block — late, on the ward.' },
        ]}>
        His short septum is written in the CT report. Write it into the procedure plan: aim high.
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
      <div className="cs-h2">Simultaneous pressures before the valve goes in</div>
      <Hemodynamics mode="as" />
      <Decision id="s5-hemo" question="LV 192/16, aorta 118/64, mean gradient 50 mmHg — and the aortic upstroke is slow. What does that confirm?"
        options={[
          { id: 'sev', label: 'Invasive confirmation of severe AS, consistent with the echo', verdict: 'best', points: 10, why: 'The shaded area between the LV and aortic traces in systole is the gradient. The slow aortic rise is the tardus of his carotid.' },
          { id: 'hcm', label: 'A dynamic subvalvular obstruction', verdict: 'wrong', points: 0, why: 'That would show a late-peaking, dagger-shaped intracavity gradient and a spike-and-dome aorta.' },
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
  const verdict = !res ? null : res.migrated ? 'wrong' : res.depth >= 5 && res.depth <= 20 ? 'best' : res.depth > 20 && res.depth <= 30 ? 'ok' : 'wrong';
  return (
    <>
      <p className="cs-p">The 26 mm valve is crimped on its balloon and across the native valve on the stiff wire. Position it against the pigtail’s annulus line, start rapid pacing, then inflate.</p>
      <TaviDeploy done={res} onResult={(r) => {
        answer('s7-deploy', r);
        bump({ contrast: 40, fluoro: 420, kerma: 260 });
        if (r.migrated) setVitals({ sys: 92, dia: 50, hr: 96 }); else setVitals({ sys: 128, dia: 62, hr: 78 });
      }} />
      {res && (
        <div className={'cs-fb ' + verdict}>
          {res.migrated
            ? 'Inflated without rapid pacing: the ejecting ventricle shoved the expanding valve up toward the aorta. In real life — a leaking, malpositioned or embolised valve, and a second valve or surgery.'
            : res.depth < 5 ? 'Too high: barely in the annulus. Risk of embolisation into the aorta and of a paravalvular leak.'
            : res.depth <= 20 ? 'On target. Sealed in the annulus, frame kept off the conduction system as far as it can be.'
            : res.depth <= 30 ? 'Acceptable seal, but deeper than planned for a short septum: expect conduction changes.'
            : 'Deep: the frame is pressing into the LVOT below the membranous septum. Heart block is likely.'}
        </div>
      )}
      <ScoreOnce id="s7-dep" pts={verdict == null ? null : verdict === 'best' ? 20 : verdict === 'ok' ? 10 : 0} max={20} />
      {res && (
        <>
          <div className="cs-h2">After deployment</div>
          <Hemodynamics mode="post" />
          <Doppler kind="cw-as" vmax={2.1} title="Transthoracic echo on the table: CW through the new valve" />
          <Decision id="s7-pvl" question="Echo shows a trace paravalvular jet at the non-coronary cusp, mean gradient 7 mmHg, no effusion, no new wall-motion abnormality. Next?"
            options={[
              { id: 'accept', label: 'Accept: excellent result. Close the access, check the femoral artery, transfer to the unit', verdict: 'best', points: 10, why: 'Trace or mild paravalvular leak is common and benign. Moderate or worse would need post-dilation.' },
              { id: 'post', label: 'Post-dilate to abolish the trace leak', verdict: 'wrong', points: 2, why: 'Extra expansion in a calcified LVOT for a benign finding: annular rupture risk, and more pressure on the conduction system.' },
              { id: 'second', label: 'A second valve inside the first', verdict: 'wrong', points: 0, why: 'For a malpositioned valve or severe leak only.' },
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

function Recovery() {
  const { answers } = useCase();
  const deep = answers['s7-deploy'] && (answers['s7-deploy'].depth > 20 || answers['s7-deploy'].migrated);
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">16:30</span>Bed 1, Valvular & Structural Heart Unit. Sitting up, eating, the groin dry. “I can breathe already.” The temporary pacing wire was removed at the end of the case. Then the post-procedure ECG arrives{deep ? ' — the deep implant has left its mark' : ''}:</p>
      </div>
      <ECG12 rate={76} lbbb shape={LVH.shape}
        caption="New left bundle branch block: QRS 152 ms, broad notched R in I, aVL, V5–V6, deep QS in V1–V3, discordant ST–T. PR 230 ms — longer than before." />
      <Decision id="s8-lbbb" question="New LBBB with a longer PR after TAVI. What now?"
        options={[
          { id: 'tele', label: 'Continuous telemetry for at least 48 hours, daily ECGs, no rate-slowing drugs; plan a pacemaker or EP study if the PR or QRS lengthens further or block appears', verdict: 'best', points: 10,
            why: 'New LBBB is the warning shot: conduction injury from the frame. Most high-degree block declares within 48–72 hours — so the monitoring must outlast it.' },
          { id: 'home', label: 'Discharge tomorrow morning as planned — LBBB is common after TAVI', verdict: 'wrong', points: 0, why: 'Common is not the same as safe. See the war stories.' },
          { id: 'ppm', label: 'Implant a pacemaker now', verdict: 'ok', points: 3, why: 'Not for LBBB alone — many recover. Monitor and act on progression.' },
        ]} />
      <Contrast title="what the new LBBB is — and what it isn’t"
        is={{ h: 'Mechanical conduction injury', points: ['The frame pressing on the left bundle under the membranous septum.', 'Can progress as oedema peaks over 24–72 hours.', 'A reason to monitor, not panic.'] }}
        isnt={{ h: 'An acute MI', points: ['Not an ischaemic STEMI equivalent here: no symptoms, no wall-motion change, a known cause.', 'Do not reflexly activate the cath lab.', 'But know Sgarbossa: concordant ST elevation would still mean ischaemia.'] }} />
      <MultiSelect id="s8-checks" question="What else do you check on his first evening?"
        items={[
          { id: 'groin', label: 'Groin and distal pulses', correct: true, why: 'Vascular complications are the commonest major complication of transfemoral TAVI.' },
          { id: 'neuro', label: 'A neurological check', correct: true, why: 'Stroke risk peaks in the first days.' },
          { id: 'hb', label: 'Haemoglobin and creatinine', correct: true, why: 'Bleeding and contrast kidney injury.' },
          { id: 'mob', label: 'Mobilise early', correct: true, why: 'Less delirium, less deconditioning.' },
          { id: 'bed', label: 'Strict bed rest for 48 hours', correct: false, why: 'Not needed after a closed femoral access.' },
          { id: 'amlo', label: 'Restart full-dose amlodipine and ramipril tonight', correct: false, why: 'His afterload just fell; restart cautiously against his blood pressure.' },
        ]} />
    </>
  );
}

/* ============================================================
   9 · THE NIGHT: COMPLETE HEART BLOCK
   ============================================================ */

function HeartBlock() {
  const { answers, answer, setVitals, advanceClock } = useCase();
  const paced = answers['s9-pace'];
  const ppm = answers['s9-ppm'];
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>03:10</span>
          Night two. The telemetry alarms. The nurse finds him grey, “dizzy… far away”. He answers slowly.
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
      {!paced ? (
        <button className="cs-btn danger" onClick={() => { answer('s9-pace', true); setVitals({ hr: 70, sys: 112, dia: 64, rhythm: 'paced' }); advanceClock(8); }}>Transcutaneous pacing: rate 70, output up to capture (78 mA)</button>
      ) : (
        <div className="cs-fb best">Electrical and mechanical capture: a pulse with every spike. Pressure 112/64. Analgesia and sedation for the pacing — it hurts. A temporary transvenous wire follows within the hour.</div>
      )}
      {paced && (
        <>
          <Decision id="s9-next" question="By morning he is still in complete heart block on the temporary wire. Next?"
            options={[
              { id: 'ppm', label: 'Permanent pacemaker before discharge', verdict: 'best', points: 10, why: 'Persistent high-degree AV block after TAVI is a clear indication. Waiting days for recovery keeps him in bed with a wire in his heart.' },
              { id: 'wait', label: 'Wait two weeks to see if it recovers', verdict: 'wrong', points: 1, why: 'Prolonged temporary pacing carries infection, displacement and immobility.' },
              { id: 'remove', label: 'Remove the wire and monitor', verdict: 'wrong', points: 0, why: 'A broad escape at 34 is not a safety net.' },
            ]} />
          {!ppm ? (
            <button className="cs-btn primary" onClick={() => { answer('s9-ppm', true); setVitals({ hr: 70, sys: 124, dia: 68, rhythm: 'paced' }); advanceClock(min(9, 0)); }}>Implant the permanent pacemaker</button>
          ) : (
            <div className="cs-fb best">Dual-chamber pacemaker implanted via the left cephalic vein. Pacing check normal. Walking the corridor by the evening.</div>
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
        Worse: atropine can speed the atria and, in infranodal block, sometimes worsens the ratio of conducted beats. Know the level of the block before reaching for the drug.
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
          { at: 3, t: 'Avoid vasodilators: nitrates, high-dose ACE inhibitors titrated carelessly, spinal anaesthesia.' },
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
        <p className="cs-p">A 74-year-old with breathlessness, EF 35%, AVA 0.8 cm², mean gradient 28 mmHg. “Moderate AS, heart failure from his old MI.” Diuretics, clinic in a year. He died at home in seven months. The dobutamine study, done for research after a similar case in the same unit, would have shown the gradient climbing to 46 with a fixed valve.</p>
      </WarStory>
      <Decision id="mm-lflg" question="EF 35%, AVA 0.8 cm², mean gradient 28 mmHg. Next test?"
        options={[
          { id: 'dse', label: 'Low-dose dobutamine stress echo', verdict: 'best', points: 10, why: 'If the flow rises and the AVA stays ≤ 1.0 with the gradient ≥ 40: true severe. If the valve opens: pseudo-severe.' },
          { id: 'repeat', label: 'Repeat the echo in a year', verdict: 'wrong', points: 0, why: 'The story’s mistake.' },
          { id: 'cath', label: 'Coronary angiography only', verdict: 'ok', points: 2, why: 'May be needed — but it does not answer the valve question.' },
        ]} />

      <WarStory title="Home with a new LBBB"
        mistake="Next-day discharge after TAVI with a new LBBB and a lengthening PR, without monitoring."
        burn="New conduction disease after TAVI is the warning shot. Monitor long enough to catch the next one.">
        <p className="cs-p">A smooth TAVI, home the next morning — “LBBB is common”. Day four: a fall in the kitchen, a fractured wrist and a head injury. In the emergency department: complete heart block at 28.</p>
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
   DEBRIEF
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
          { id: 'oac', label: 'A direct oral anticoagulant', verdict: 'wrong', points: 0, why: 'Without AF or another indication, anticoagulation after TAVI did worse (GALILEO).' },
        ]} />
      <MultiSelect id="s12-home" question="What goes in his discharge plan?"
        items={[
          { id: 'echo', label: 'Echo at about 30 days as his new baseline', correct: true, why: 'Gradients and leak to compare against for life.' },
          { id: 'endo', label: 'Endocarditis prevention: dental hygiene, antibiotic prophylaxis for dental procedures, a valve card', correct: true, why: 'He now has a prosthetic valve.' },
          { id: 'pace', label: 'Pacemaker check in 4–6 weeks', correct: true, why: 'And ask whether he still needs it pacing — some recover conduction.' },
          { id: 'bp', label: 'Re-titrate blood pressure drugs', correct: true, why: 'His afterload has changed; his BP may rise now the valve is open.' },
          { id: 'drive', label: 'Driving advice after a pacemaker', correct: true, why: 'Usually a short period off driving after a pacemaker implanted for block (check local rules).' },
          { id: 'warf', label: 'Lifelong warfarin for the valve', correct: false, why: 'Not for a tissue valve without another indication.' },
        ]} />

      <div className="cs-h2">Case quiz</div>
      <Quiz id="s12-quiz" items={[
        { q: 'Which sign suggests severe rather than mild aortic stenosis?', options: ['A loud murmur', 'An early-peaking murmur with an ejection click', 'A late-peaking murmur with a soft A2', 'Radiation to the carotids'], answer: 2, why: 'Late peak and soft A2: rigid leaflets, slow ejection.' },
        { q: 'Squatting makes the murmur of HOCM…', options: ['Louder', 'Softer', 'Unchanged', 'Diastolic'], answer: 1, why: 'A fuller LV holds the walls apart.' },
        { q: 'Vmax 4.6 m/s gives a peak gradient of about…', options: ['18 mmHg', '46 mmHg', '85 mmHg', '120 mmHg'], answer: 2, why: '4 × 4.6² ≈ 85 mmHg.' },
        { q: 'Low-flow, low-gradient AS with reduced EF is clarified by…', options: ['Exercise ECG', 'Low-dose dobutamine echo', 'Cardiac MRI only', 'Repeat echo in a year'], answer: 1, why: 'Raise the flow and see whether the valve opens.' },
        { q: 'Hypotension under anaesthesia in severe AS is best treated with…', options: ['Nitrate', 'Phenylephrine', 'Isoprenaline', 'Ephedrine boluses'], answer: 1, why: 'Pressure without tachycardia.' },
        { q: 'Complete heart block after TAVI with a broad escape: atropine…', options: ['Is curative', 'Is usually ineffective — the block is infranodal', 'Is contraindicated in all bradycardia', 'Should be given every 5 minutes until it works'], answer: 1, why: 'Pace.' },
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
          <li className="cs-li">The gradient depends on flow. Low gradient + small valve: ask about the flow.</li>
          <li className="cs-li">Fixed output means vasodilators, spinals and tachycardia are dangerous. Treat hypotension with an alpha-agonist.</li>
          <li className="cs-li">Symptomatic severe AS needs a new valve; older patients with good femoral access usually get TAVI.</li>
          <li className="cs-li">Read the CT for the membranous septum. Aim high; rapid pace to deploy.</li>
          <li className="cs-li">New LBBB after TAVI: monitor beyond 48 hours. Infranodal block: atropine fails — pace.</li>
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
      { k: 'Your role', t: 'From the emergency department to the heart team, the hybrid lab and the night shift on the unit.' },
      { k: 'In your hands', t: 'Synthesised heart sounds with manoeuvres, CW and PW Doppler, LV/Ao pressures, a TAVI deployment on rapid pacing, ECGs.' },
      { k: 'How it teaches', t: 'Every symptom is one mechanism — a fixed output. Every treatment is a cut in a loop.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'Clinical presentation & triage', Component: Presentation,
      pill: '🫥 The faint on the garden path',
      lede: 'Listen, feel the pulse, read the ECG — and decide whether he goes home.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 72, sys: 118, dia: 80, spo2: 95, st: -1, rhythm: 'sinus' }); atLeastClock(min(10, 20)); } },
    { id: 's2', icon: '📏', nav: 'Echo & Doppler', title: 'Measuring it — echo & Doppler', Component: Echo,
      pill: '🔊 Measure the velocity yourself',
      lede: 'CW Doppler, the outflow tract, the continuity equation — and the flow behind the gradient.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 70, sys: 122, dia: 80 }); atLeastClock(min(13, 0)); } },
    { id: 's3', icon: '👥', nav: 'Heart Team', title: 'The heart team decision', Component: HeartTeam,
      pill: '🧭 Day 3 — whether, and how',
      lede: 'Treat or watch, TAVI or surgery, and what must come first.',
      enter: ({ atLeastClock }) => atLeastClock(min(62, 0)) },
    { id: 's4', icon: '🧮', nav: 'CT Planning', title: 'CT planning', Component: Planning,
      pill: '📐 Size it, route it, read the septum',
      lede: 'Annulus, coronary heights, the femoral route — and the membranous septum.',
      enter: ({ atLeastClock }) => atLeastClock(min(63, 0)) },
    { id: 's5', icon: '🩸', nav: 'Access & Setup', title: 'Access & set-up in the hybrid lab', Component: Setup,
      pill: '🧷 Day 5 — pre-close before you open',
      lede: 'Sedation, access, pacing, the stiff wire — and the gradient measured directly.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 74, sys: 124, dia: 78 }); atLeastClock(min(104, 30)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy & decision point', Component: Strategy,
      pill: '🎯 Where the frame will sit',
      lede: 'Predilate or not; the implant target; why the heart must stop beating for a moment.',
      enter: ({ atLeastClock }) => atLeastClock(min(105, 0)) },
    { id: 's7', icon: '⚡', nav: 'Valve Deployment', title: 'Valve deployment on rapid pacing', Component: Deploy,
      pill: '⏱ Ten seconds at 180 bpm',
      lede: 'Position, pace, inflate — then judge the result.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 74, sys: 122, dia: 70 }); atLeastClock(min(105, 20)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit', Component: Recovery,
      pill: '📟 A warning shot on the ECG',
      lede: 'Bed 1: breathing easier — and a new bundle branch block.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 76, sys: 132, dia: 70, rhythm: 'sinus' }); atLeastClock(min(112, 30)); } },
    { id: 's9', icon: '🚨', nav: 'Night Crisis', title: 'Night two: complete heart block', Component: HeartBlock,
      pill: '🌙 03:10 — the beat falls away',
      lede: 'Name the rhythm, find the level, pace.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 34, sys: 78, dia: 46, rhythm: 'chb' }); atLeastClock(min(147, 10)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'One fixed door explains every symptom — and every danger.',
      enter: ({ setVitals }) => setVitals({ hr: 70, sys: 124, dia: 68, rhythm: 'paced' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Five patients who taught these rules the hard way.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'Antithrombotics, follow-up and prevention — then your score.',
      enter: ({ setVitals }) => setVitals({ hr: 70, sys: 128, dia: 70, rhythm: 'paced' }) },
  ],
};

export default function Valve01({ onClose }) {
  return <CaseShell def={VALVE_01} onClose={onClose} />;
}
