import React from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Figure, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import { Auscultation, ColorMR, PulmonaryVein, LAPressure, TransseptalPuncture, ClipGrasp } from '../kit/Valve.jsx';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 02
   Acute-on-chronic severe primary mitral regurgitation: a flail
   P2 from a ruptured chord in an 82-year-old with long-standing
   prolapse, prior CABG and CKD. Flash pulmonary oedema and new
   AF; afterload reduction; TTE and TOE with PISA; the heart
   team chooses transcatheter edge-to-edge repair; transseptal
   puncture and clip grasping on TOE — and, the next night on
   the unit, single-leaflet device attachment.

   The mirror image of Case 01: in aortic stenosis lowering
   afterload kills; in mitral regurgitation it sends blood
   forward.

   Clinical content follows the 2025 ESC/EACTS valvular heart
   disease guideline, ASE/EACVI quantification standards and
   published TEER practice, simplified for teaching.
   ============================================================ */

const WIKI = f => `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=960`;
const WIKIPAGE = f => `https://commons.wikimedia.org/wiki/File:${f}`;
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

/* ============================================================
   1 · PRESENTATION — FLASH PULMONARY OEDEMA
   ============================================================ */

function Presentation() {
  const { answers, setVitals } = useCase();
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">3 days ago</span>Mrs Nadia Haddad, 82, a retired pharmacist, lifted a box of books onto a shelf and “felt something give” in her chest. Since then: breathless walking to the kitchen, then sleeping propped on three pillows.</p>
        <p className="cs-p"><span className="cs-time">history</span>“A floppy valve” and a murmur known for twenty years; her last echo, three years ago, said mild-to-moderate mitral regurgitation. CABG in 2011 (LIMA to LAD, vein to OM). CKD 3b (eGFR 38). 61 kg. Bisoprolol 2.5 mg, atorvastatin 40 mg, aspirin 75 mg.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">21:40</span>Brought in by ambulance, sitting bolt upright, frothy sputum, unable to finish a sentence.</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Observations · 21:40</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('132 /min, irregularly irregular', 'cs-hi')], ['Blood pressure', N('104/68 mmHg')], ['SpO₂', N('86% on air', 'cs-hi')],
            ['Resp. rate', N('32 /min', 'cs-hi')], ['Temperature', N('36.9 °C')], ['Lactate', N('2.4 mmol/L', 'cs-hi')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Crackles to the mid-zones bilaterally. JVP up 4 cm.</li>
            <li className="cs-li">Apex not displaced. A short, early systolic murmur at the apex — oddly, also heard at the upper right sternal edge.</li>
            <li className="cs-li">A third heart sound.</li>
            <li className="cs-li">Cool peripheries; capillary refill 3 s.</li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">Listen — then compare</div>
      <p className="cs-p">Her murmur first. Then chronic MR, prolapse and — because her murmur reaches the base — aortic stenosis. Run the manoeuvres: handgrip is the one that separates them.</p>
      <Auscultation lesions={['mr-acute', 'mr-chronic', 'mvp', 'as-severe']} />

      <ECG12 rate={132} rhythm="af"
        caption="Atrial fibrillation with a fast, irregularly irregular ventricular response, ~130/min. No P waves; a fibrillating baseline. No acute ST elevation." />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>Chest X-ray and bloods</div>
        <Table head={['', 'Result']} rows={[
          ['Chest X-ray', 'Bilateral alveolar oedema, upper-lobe diversion, small effusions — and a NORMAL heart size'],
          ['hs-Troponin T', N('46 → 52 ng/L — flat', 'cs-hi')], ['NT-proBNP', N('9,800 ng/L', 'cs-hi')],
          ['Creatinine / eGFR', N('128 µmol/L · 38', 'cs-hi')], ['Potassium', N('4.2 mmol/L')], ['Haemoglobin', N('124 g/L')],
        ]} />
      </div>

      <Decision id="s1-dx" question="What has happened?"
        options={[
          { id: 'flail', label: 'Acute severe mitral regurgitation from a ruptured chord — a flail leaflet on long-standing prolapse — with new AF', verdict: 'best', points: 10,
            why: 'A “give” on exertion, sudden pulmonary oedema with a normal-sized heart, a short early murmur and an S3: the classic story of chordal rupture.' },
          { id: 'acs', label: 'An NSTEMI causing heart failure', verdict: 'wrong', points: 2, why: 'A flat, modest troponin rise from demand. With her CABG, ischaemia must be considered — but the history and murmur point to the valve.' },
          { id: 'as', label: 'Aortic stenosis — the murmur reaches the base', verdict: 'wrong', points: 0,
            why: 'A posterior-leaflet flail throws the jet forward against the atrial septum and aortic root; it can radiate to the base and neck and mimic AS.' },
          { id: 'pneu', label: 'Pneumonia with AF', verdict: 'wrong', points: 0, why: 'Afebrile, bilateral oedema, S3, raised JVP.' },
        ]} />
      <MultiSelect id="s1-acute" question="Which of her findings say this regurgitation is ACUTE rather than chronic?"
        items={[
          { id: 'cxr', label: 'A normal heart size with florid pulmonary oedema', correct: true, why: 'There has been no time for the LA and LV to dilate.' },
          { id: 'short', label: 'A short, early, decrescendo murmur', correct: true, why: 'A small, stiff LA fills fast; its pressure meets the LV’s before systole ends.' },
          { id: 'apex', label: 'An undisplaced apex', correct: true, why: 'Chronic volume overload displaces it.' },
          { id: 'low', label: 'Tachycardia, low-normal pressure, cool peripheries', correct: true, why: 'Forward output has fallen abruptly.' },
          { id: 'la', label: 'A hugely dilated left atrium', correct: false, why: 'A chronic finding — hers is not yet large.' },
        ]} />

      <Why title="Why a torn chord floods the lungs in days"
        chain={[
          { k: 'THE LEAK', t: 'A flail leaflet opens a large hole to the left atrium every systole.' },
          { k: 'SMALL LA', t: 'Her atrium has never had to hold this volume; it is small and stiff.' },
          { k: 'GIANT V-WAVE', t: 'Each systole the LA pressure spikes — 60 mmHg instead of 12.' },
          { k: 'BACKWARDS', t: 'The pulmonary veins carry it straight to the capillaries: oedema.' },
          { k: 'FORWARDS', t: 'And the blood that leaks back is blood not sent to the aorta: output and pressure fall.' },
        ]}>
        The LV is not failing — it is pumping hard into the path of least resistance. Treatment therefore aims at the resistance.
      </Why>
      <Contrast title="acute vs chronic mitral regurgitation"
        is={{ h: 'Acute (hers)', points: ['Normal LA and LV size.', 'Giant v-waves, flash pulmonary oedema, low output.', 'Short, early murmur that can sound mild.', 'An emergency.'] }}
        isnt={{ h: 'Chronic', points: ['Dilated, compliant LA absorbs the volume; LV dilates and hypertrophies eccentrically.', 'Low LA pressure for years — few symptoms.', 'Loud holosystolic murmur to the axilla.', 'The danger is silent LV damage before symptoms.'] }} />

      <MultiSelect id="s1-tx" question="The first thirty minutes. What do you do?"
        items={[
          { id: 'niv', label: 'Sit her up; CPAP or non-invasive ventilation', correct: true, why: 'Recruits flooded alveoli and lowers LV afterload by raising intrathoracic pressure.' },
          { id: 'diur', label: 'IV furosemide', correct: true, why: 'Venodilates within minutes, then offloads salt and water.' },
          { id: 'gtn', label: 'IV nitrate infusion, titrated to keep systolic ≥ 90–100 mmHg', correct: true, why: 'Lowers preload and afterload: less blood goes backwards, more forwards.' },
          { id: 'hep', label: 'Anticoagulation for the AF (heparin)', correct: true, why: 'New AF, CHA₂DS₂-VA high.' },
          { id: 'echo', label: 'Urgent bedside echo', correct: true, why: 'Confirms the flail and excludes the alternatives.' },
          { id: 'bb', label: 'IV metoprolol boluses to slow the AF', correct: false, why: 'Her stroke volume is crippled; the rate is propping up her output. Blocking it can tip her into shock.' },
          { id: 'fluid', label: 'IV fluid for the low-normal pressure', correct: false, why: 'Her lungs are full.' },
        ]} />
      <Contrast title="afterload in aortic stenosis vs mitral regurgitation"
        is={{ h: 'Mitral regurgitation — afterload reduction HELPS', points: ['Two exits: the aorta and the leak back to the LA.', 'Lower aortic resistance and more blood takes the forward exit.', 'Nitrates, nitroprusside, an intra-aortic balloon pump: allies.'] }}
        isnt={{ h: 'Aortic stenosis — afterload reduction KILLS', points: ['One exit, fixed by the valve.', 'Lower resistance cannot raise output: pressure falls, coronary perfusion falls.', 'Nitrates and spinals: enemies (Case 01).'] }} />

      <Decision id="s1-rate" question="The AF is 130. How do you handle the rate tonight?"
        options={[
          { id: 'gentle', label: 'Treat the cause first (oxygen, offloading), then cautious IV amiodarone or digoxin if the rate stays high — no big beta-blocker or calcium-blocker boluses', verdict: 'best', points: 10,
            why: 'Much of the tachycardia is compensation and LA stretch. Rate drugs that also depress contractility or drop pressure can precipitate shock. Amiodarone and digoxin slow AV conduction with less negative inotropy.' },
          { id: 'dccv', label: 'Immediate synchronised cardioversion', verdict: 'ok', points: 4, why: 'Right if she becomes shocked — but with an acutely stretched atrium it often fails or recurs within hours.' },
          { id: 'dilt', label: 'IV diltiazem', verdict: 'wrong', points: 0, why: 'Negative inotrope and vasodilator in a patient with a stroke volume problem.' },
        ]} />

      <Decision id="s1-shock" question="At 23:10 her pressure falls to 84/52 on the nitrate, lactate 3.8. What now?"
        onAnswer={() => setVitals({ sys: 98, dia: 60, hr: 118 })}
        options={[
          { id: 'iabp', label: 'Stop the nitrate; start dobutamine and call for an intra-aortic balloon pump; urgent heart team', verdict: 'best', points: 10,
            why: 'Dobutamine adds contractility with mild vasodilation. The balloon deflates in systole — lowering the afterload so more blood goes forward — and inflates in diastole, holding up coronary perfusion. Both are bridges to fixing the valve.' },
          { id: 'nor', label: 'Noradrenaline alone to bring the pressure up', verdict: 'ok', points: 3,
            why: 'Sometimes needed to survive the next minutes — but pure vasoconstriction raises afterload and pushes more blood backwards. Pair it with something that offloads.' },
          { id: 'fluid', label: 'A 500 mL fluid bolus', verdict: 'wrong', points: 0, why: 'More volume into a flooded circulation.' },
        ]} />
      {answers['s1-shock'] && <Note kind="pearl" title="00:30">Dobutamine at 5 µg/kg/min and a 40 mL balloon pump via the left femoral artery. Pressure 98/60, SpO₂ 95% on CPAP, urine flowing. She is moved to the coronary care unit.</Note>}

      <div className="cs-media-row">
        <Figure src={WIKI('Mitral_Regurgitation_scheme1.png')} href={WIKIPAGE('Mitral_Regurgitation_scheme1.png')} alt="Diagram of mitral regurgitation" caption="Mitral regurgitation: in systole blood leaks back from the left ventricle into the left atrium." credit="Wikimedia Commons (see file page for licence)" />
        <Video id="L_8pDi0pEmE" title="Mitral regurgitation pathophysiology" />
      </div>
    </>
  );
}

/* ============================================================
   2 · ECHO & TOE — HOW SEVERE, AND WHY
   ============================================================ */

function Echo() {
  const { answers, answer } = useCase();
  const m = answers['s2-pisa'];
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>Transthoracic echo · CCU, day 2</div>
        <Table head={['', 'Finding']} rows={[
          ['LV', 'Hyperdynamic, EF 68%, LVEDD 52 mm, LVESD 33 mm — not dilated'],
          ['LA', '40 mm — barely enlarged'],
          ['Mitral valve', 'Myxomatous leaflets; flail P2 with a ruptured chord; eccentric jet sweeping anteriorly along the LA wall'],
          ['Colour jet area', N('“moderate” — 25% of the LA', 'cs-lo')],
          ['PA systolic pressure', N('58 mmHg', 'cs-hi')],
          ['RV', 'Normal size and function'],
        ]} />
      </div>
      <Why title="Why the colour jet area lies in her"
        chain={[
          { k: 'ECCENTRIC', t: 'A flail posterior leaflet points the jet forward, at a wall.' },
          { k: 'COANDA', t: 'A jet that meets a wall clings to it and spreads thinly along it.' },
          { k: 'SMALL ON SCREEN', t: 'A wall-hugging jet shows a fraction of the colour area of a free central jet of the same volume.' },
          { k: 'UNDER-CALLED', t: 'Severe MR read as “moderate” — unless you measure it properly.' },
        ]} />

      <div className="cs-h2">TOE · quantify it</div>
      <p className="cs-p">Day 2, under light sedation. Find the flow-convergence hemisphere on the LV side of the valve, set the colour baseline, measure the radius to the first aliasing boundary.</p>
      <ColorMR title="Mid-oesophageal 4-chamber, colour zoomed on the valve" onMeasure={r => answer('s2-pisa', r)} />
      {m && (
        <div className={'cs-fb ' + (m.close ? 'best' : 'ok')}>
          r {m.r.toFixed(2)} cm at {m.va} cm/s → EROA {m.eroa.toFixed(2)} cm², regurgitant volume {Math.round(m.rvol)} mL. {m.close
            ? 'On the aliasing boundary: severe by any standard.'
            : 'Off the boundary — and because r is squared, small errors become big ones. Measure to the first red-to-blue change.'}
        </div>
      )}
      <ScoreOnce id="s2-pisa" pts={m == null ? null : m.close ? 12 : 4} max={12} />
      <PulmonaryVein reversal />
      <div className="cs-h2">Pressure from the PA catheter</div>
      <LAPressure mode="acute" />

      <MultiSelect id="s2-sev" question="Which of her findings are specific criteria for SEVERE mitral regurgitation?"
        items={[
          { id: 'eroa', label: 'EROA ≥ 0.40 cm²', correct: true, why: 'Hers is ~0.6.' },
          { id: 'rvol', label: 'Regurgitant volume ≥ 60 mL', correct: true, why: 'Hers is ~90 mL.' },
          { id: 'vc', label: 'Vena contracta 8 mm (≥ 7 mm)', correct: true, why: 'The narrowest neck of the jet, measured in two planes.' },
          { id: 'pv', label: 'Systolic flow reversal in the pulmonary veins', correct: true, why: 'Specific; a giant v-wave drives blood back up the veins.' },
          { id: 'flail', label: 'A flail leaflet', correct: true, why: 'A flail almost always means severe MR.' },
          { id: 'area', label: 'Colour jet area < 30% of the LA', correct: false, why: 'Misleading in an eccentric, wall-hugging jet.' },
        ]} />
      <Decision id="s2-carp" question="Carpentier classification of her mitral lesion?"
        options={[
          { id: '2', label: 'Type II — excessive leaflet motion (prolapse / flail)', verdict: 'best', points: 8, why: 'The leaflet edge overshoots the annular plane into the LA.' },
          { id: '1', label: 'Type I — normal motion, annular dilatation or perforation', verdict: 'wrong', points: 0, why: 'That is functional MR from a big annulus, or a hole in a leaflet.' },
          { id: '3a', label: 'Type IIIa — restricted in systole and diastole (rheumatic)', verdict: 'wrong', points: 0, why: 'Thick, restricted leaflets — not hers.' },
          { id: '3b', label: 'Type IIIb — restricted in systole (ischaemic, tethered)', verdict: 'wrong', points: 0, why: 'Secondary MR from a remodelled ventricle.' },
        ]} />
      <Contrast title="primary vs secondary mitral regurgitation"
        is={{ h: 'Primary (degenerative) — hers', points: ['The valve itself is broken: prolapse, flail, perforation.', 'Fix the valve and the disease is cured.', 'Repair is the gold standard.'] }}
        isnt={{ h: 'Secondary (functional)', points: ['A normal valve pulled apart by a dilated, failing ventricle.', 'The ventricle is the disease: guideline heart-failure therapy first.', 'Intervene only if MR stays severe on optimal therapy — and the LV is not too far gone.'] }} />
      <Why title="Why an EF of 68% in severe MR is not reassuring"
        chain={[
          { k: 'TWO EXITS', t: 'In MR the LV ejects into the aorta AND into the low-pressure LA.' },
          { k: 'EASY EMPTYING', t: 'Emptying into the LA meets almost no resistance, so the ventricle empties further than normal.' },
          { k: 'INFLATED EF', t: 'A healthy LV in severe MR should have an EF well above 60%.' },
          { k: 'THE THRESHOLD', t: 'So an EF ≤ 60% — or an end-systolic diameter ≥ 40 mm — already means damage. Operate before that.' },
        ]} />

      <div className="cs-media-row">
        <Figure src={WIKI('Mitral_regurgitation.jpg')} href={WIKIPAGE('Mitral_regurgitation.jpg')} alt="Echocardiogram of mitral regurgitation" caption="A real colour-Doppler image of mitral regurgitation." credit="Wikimedia Commons (see file page for licence)" />
        <Video id="S7z5qpNmluY" title="Quantifying mitral regurgitation using the PISA method" />
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
        <div className="cs-h2" style={{ marginTop: 0 }}>Heart team · day 3 (off the balloon pump, on oral diuretics)</div>
        <Table head={['', 'Finding']} rows={[
          ['Lesion', 'Severe primary MR: isolated flail P2, flail gap 6 mm, flail width 12 mm'],
          ['Valve', 'MVA 4.6 cm², mean gradient 2 mmHg, posterior leaflet 12 mm, no calcium in the grasping zone'],
          ['Surgical risk', 'STS for MV repair 8.9%; redo sternotomy with a patent LIMA crossing behind the sternum'],
          ['Other', 'CKD 3b, Clinical Frailty Scale 5, mild COPD'],
          ['Her wish', '“I don’t want my chest opened again. I want to read in my garden.”'],
        ]} />
      </div>
      <Decision id="s3-treat" question="Severe, symptomatic primary MR. Intervene?"
        options={[
          { id: 'yes', label: 'Yes — on this admission', verdict: 'best', points: 10, why: 'Symptomatic severe primary MR is a class I indication; after an episode of pulmonary oedema and shock she will not stay well on drugs.' },
          { id: 'med', label: 'Medical therapy; review in clinic', verdict: 'wrong', points: 0, why: 'Drugs cannot reattach a chord.' },
        ]} />
      <Decision id="s3-how" question="Which intervention?"
        options={[
          { id: 'teer', label: 'Transcatheter edge-to-edge repair (TEER)', verdict: 'best', points: 10,
            why: 'High surgical risk (age, frailty, redo sternotomy with a patent LIMA) and anatomy ideal for a clip: an isolated central flail with a modest gap and width, a large valve area and no calcium.' },
          { id: 'surg', label: 'Surgical mitral repair', verdict: 'ok', points: 4, why: 'The gold standard for primary MR in operable patients — near-certain durable repair. Her risks and wishes make it second choice.' },
          { id: 'tmvr', label: 'Transcatheter mitral valve replacement', verdict: 'wrong', points: 2, why: 'For anatomy unsuitable for repair; her valve is ideal for a clip.' },
        ]} />
      <MultiSelect id="s3-anat" question="Which of her features make the anatomy favourable for TEER?"
        items={[
          { id: 'central', label: 'An isolated, central (A2/P2) lesion', correct: true, why: 'The easiest place to align and grasp.' },
          { id: 'gap', label: 'Flail gap < 10 mm', correct: true, why: 'Hers is 6 mm: the arms can reach both leaflets.' },
          { id: 'width', label: 'Flail width < 15 mm', correct: true, why: 'Hers is 12 mm: one or two clips can cover it.' },
          { id: 'mva', label: 'Mitral valve area > 4 cm² with a low gradient', correct: true, why: 'A clip halves the orifice; you need room to spare.' },
          { id: 'ca', label: 'No calcium in the grasping zone', correct: true, why: 'Calcium stops the arms from closing on the leaflets.' },
          { id: 'mac', label: 'Severe mitral annular calcification', correct: false, why: 'Unfavourable — and she does not have it.' },
        ]} />
      <Why title="Why clipping two leaflets together stops the leak"
        chain={[
          { k: 'THE GAP', t: 'The flail P2 no longer meets A2: a large central hole in systole.' },
          { k: 'EDGE TO EDGE', t: 'The clip holds the edge of P2 to the edge of A2 — the surgical Alfieri stitch, through a vein.' },
          { k: 'DOUBLE ORIFICE', t: 'In diastole the valve opens as two smaller holes either side of the clip.' },
          { k: 'THE TRADE', t: 'Less leak, but less opening: every clip raises the diastolic gradient. That is why valve area matters before you start.' },
        ]} />
      <Contrast title="surgical repair vs TEER"
        is={{ h: 'Surgical repair', points: ['Resect or replace chords, reshape the leaflet, add an annuloplasty ring.', 'Durable for decades; residual MR rare.', 'Sternotomy and bypass; longer recovery.'] }}
        isnt={{ h: 'TEER', points: ['A clip through the femoral vein and the atrial septum, on a beating heart, under TOE.', 'No ring; some residual MR is common.', 'Days, not weeks, in hospital — for those surgery would hurt most.'] }} />
      <Decision id="s3-talk" question="She asks: “Will the clip fix it completely?”"
        options={[
          { id: 'honest', label: '“The goal is to make the leak mild — usually achieved. A trace often remains. There is a small chance of the clip loosening or the valve narrowing, and we’d know early.”', verdict: 'best', points: 8,
            why: 'Honest about the goal (mild or less), the common outcome and the specific risks — including the one she is about to meet.' },
          { id: 'yes', label: '“Yes, completely.”', verdict: 'wrong', points: 0, why: 'Promises surgery-level results from a different procedure.' },
          { id: 'stats', label: 'A list of trial results', verdict: 'ok', points: 3, why: 'Accurate, but answer her question first.' },
        ]} />
      <Video id="6_-JZqR-CuM" title="Transcatheter edge-to-edge repair" />
    </>
  );
}

/* ============================================================
   4 · PLANNING & THE TRANSSEPTAL PUNCTURE
   ============================================================ */

function Planning() {
  const { answers, answer } = useCase();
  const r = answers['s4-tsp'];
  const good = r && r.height >= 3.8 && r.height <= 4.6 && r.ant <= 0.45;
  return (
    <>
      <Decision id="s4-site" question="Where on the septum should the puncture be for a central P2 lesion?"
        options={[
          { id: 'sp', label: 'Superior and posterior in the fossa, about 4.0–4.5 cm above the mitral coaptation', verdict: 'best', points: 10,
            why: 'The guide needs room above the valve to steer down and align. Posterior keeps the system away from the aorta and gives a coaxial approach to the mitral orifice.' },
          { id: 'ia', label: 'Inferior and anterior, close to the valve', verdict: 'wrong', points: 0, why: 'Too low to manoeuvre; anterior points at the aortic root.' },
          { id: 'any', label: 'Anywhere in the fossa — it does not matter', verdict: 'wrong', points: 0, why: 'For TEER it matters more than for any other transseptal procedure.' },
        ]} />
      <Why title="Why the puncture height decides the whole procedure"
        chain={[
          { k: 'A STIFF SYSTEM', t: 'The clip delivery system bends down from the septum toward the valve.' },
          { k: 'TOO LOW', t: 'Too little room: the clip arrives at an angle and cannot be made perpendicular to the leaflets.' },
          { k: 'TOO HIGH', t: 'The system cannot reach far enough into the LV to grasp.' },
          { k: 'JUST RIGHT', t: '~4 cm above the coaptation for a central lesion; a little lower for medial ones.' },
        ]} />
      <div className="cs-h2">Do it — under TOE</div>
      <p className="cs-p">Bicaval view for superior–inferior, short-axis view for anterior–posterior, four-chamber view for height. Position, tent, then puncture.</p>
      <TransseptalPuncture done={r} onResult={res => answer('s4-tsp', res)} />
      {r && (
        <div className={'cs-fb ' + (good ? 'best' : 'ok')}>
          Crossed at {r.height.toFixed(1)} cm, {r.ant <= 0.45 ? 'posterior' : 'mid-fossa'}. {good ? 'Ideal: room to steer, a coaxial path to P2.'
            : r.height < 3.8 ? 'Low: the guide will struggle to align perpendicular to the coaptation line.'
            : r.height > 4.6 ? 'High: the clip may not reach deep enough into the LV.'
            : 'Too anterior for an easy, coaxial approach.'}
        </div>
      )}
      <ScoreOnce id="s4-tsp" pts={r == null ? null : good ? 15 : 6} max={15} />
      <Decision id="s4-clip" question="Which clip for a flail gap of 6 mm and width of 12 mm?"
        options={[
          { id: 'xt', label: 'The longer-arm clip (XT size)', verdict: 'best', points: 8, why: 'Longer arms reach across a flail gap and capture more leaflet — deeper insertion, more secure.' },
          { id: 'nt', label: 'The standard short-arm clip (NT size)', verdict: 'ok', points: 4, why: 'Fine for prolapse with short leaflets; a flail gap favours longer arms.' },
          { id: 'two', label: 'Plan two clips from the start', verdict: 'wrong', points: 1, why: 'Decide after the first — every clip raises the gradient.' },
        ]} />
      <Video id="OOarHfU8JiA" title="How to guide a transseptal puncture with echocardiography" />
    </>
  );
}

/* ============================================================
   5 · SET-UP
   ============================================================ */

function Setup() {
  return (
    <>
      <MultiSelect id="s5-check" question="Before you start: what must be in place?"
        items={[
          { id: 'ga', label: 'General anaesthesia with continuous TOE', correct: true, why: 'TEER is guided by TOE from start to finish.' },
          { id: 'swallow', label: 'No oesophageal contraindication to a long TOE', correct: true, why: 'Strictures, varices or prior oesophageal surgery change the plan.' },
          { id: 'xm', label: 'Group and save', correct: true, why: 'Large-bore venous access; rare perforation.' },
          { id: 'surg', label: 'Cardiac surgery aware', correct: true, why: 'Bailout for clip embolisation or perforation.' },
          { id: 'contrast', label: 'A large contrast load', correct: false, why: 'TEER needs almost none — welcome in CKD 3b.' },
        ]} />
      <Sequence id="s5-seq" question="Put the set-up in order."
        steps={[
          { label: 'Ultrasound-guided right femoral vein access; a pre-closure suture or plan for a figure-of-eight stitch', why: 'Plan closure before you open.' },
          { label: 'Transseptal puncture, superior–posterior, height ~4 cm on TOE', why: 'The route to the mitral valve.' },
          { label: 'Heparin to an ACT ≥ 250 s once across the septum', why: 'Equipment in the left atrium.' },
          { label: 'Exchange for a stiff wire in the left upper pulmonary vein; dilate; advance the 24F steerable guide', why: 'The platform the clip rides in.' },
          { label: 'Advance the clip delivery system and steer it down toward the mitral valve', why: 'Then align, grasp, assess.' },
        ]} />
      <Why title="Why her left atrial pressure is the number to watch"
        chain={[
          { k: 'BEFORE', t: 'LA mean 28 mmHg with v-waves of 58 — the pressure that flooded her lungs.' },
          { k: 'DURING', t: 'Each grasp test shows what the clip does to it.' },
          { k: 'AFTER', t: 'A falling v-wave and mean pressure are the haemodynamic proof of success.' },
          { k: 'A RISING GRADIENT', t: 'If the mean LA pressure rises while the v-wave falls, the clip may be causing stenosis.' },
        ]} />
      <LAPressure mode="acute" />
    </>
  );
}

/* ============================================================
   6 · STRATEGY
   ============================================================ */

function Strategy() {
  return (
    <>
      <Decision id="s6-align" question="Before grasping, how must the clip sit?"
        options={[
          { id: 'perp', label: 'Centred over the flail P2, arms perpendicular to the line of coaptation, the system coaxial to the valve', verdict: 'best', points: 10,
            why: 'Perpendicular arms pick up both leaflets deeply; off-axis arms catch one leaflet well and the other by its edge — or not at all.' },
          { id: 'para', label: 'Arms parallel to the coaptation line', verdict: 'wrong', points: 0, why: 'They would slide along the gap without catching either leaflet.' },
          { id: 'any', label: 'Anywhere over the jet', verdict: 'wrong', points: 0, why: 'The jet is broad; the flail segment is the target.' },
        ]} />
      <MultiSelect id="s6-check" question="After a grasp, before you release, what confirms it is a good one?"
        items={[
          { id: 'ins', label: 'Both leaflets deep in the arms (≥ 6 mm insertion each) in two planes', correct: true, why: 'Shallow insertion is the set-up for single-leaflet detachment.' },
          { id: 'mr', label: 'MR reduced to mild or less', correct: true, why: 'The point of it.' },
          { id: 'grad', label: 'Mean mitral gradient < 5 mmHg', correct: true, why: 'Above that, you have traded regurgitation for stenosis.' },
          { id: 'la', label: 'LA v-wave and mean pressure fall', correct: true, why: 'Haemodynamic proof.' },
          { id: 'pv', label: 'Pulmonary vein systolic flow returns forward', correct: true, why: 'Another sign the leak is controlled.' },
          { id: 'look', label: 'It looks fine on fluoroscopy', correct: false, why: 'Fluoroscopy shows the clip, not the leaflets.' },
        ]} />
      <Contrast title="a secure grasp vs a fragile one"
        is={{ h: 'Secure', points: ['Deep insertion of both leaflets.', 'Tissue bridge visible in two planes.', 'Stable as the arms close.'] }}
        isnt={{ h: 'Fragile', points: ['One leaflet caught by its tip.', 'Myxomatous, thin tissue — it can tear.', 'Releases look fine, then detach hours later.'] }} />
    </>
  );
}

/* ============================================================
   7 · CLIP DEPLOYMENT
   ============================================================ */

function Deploy() {
  const { answers, answer, setVitals } = useCase();
  const r = answers['s7-clip'];
  const grade = !r ? null : r.mr === 'mild' && r.post >= 6 ? 'best' : r.mr === 'mild' || r.mr === 'moderate' ? 'ok' : 'wrong';
  return (
    <>
      <p className="cs-p">The clip is in the LA above the valve. In the 3D view, centre it over the flail P2 and turn the arms perpendicular to the coaptation line. Then grasp, and judge the grasp before you release.</p>
      <ClipGrasp done={r} onResult={res => { answer('s7-clip', res); setVitals({ sys: 118, dia: 66, hr: 82, spo2: 98 }); }} />
      {r && (
        <div className={'cs-fb ' + grade}>
          Released after {r.grasps} grasp{r.grasps > 1 ? 's' : ''}: anterior insertion {r.ant.toFixed(0)} mm, posterior {r.post.toFixed(0)} mm, residual MR {r.mr}, mean gradient {r.gradient} mmHg.
          {grade === 'best' ? ' A secure grasp and a good result.'
            : r.post < 6 ? ' The posterior leaflet is held only by its edge. It may not hold — remember this.' : ' More MR left than ideal.'}
        </div>
      )}
      <ScoreOnce id="s7-clip" pts={r == null ? null : grade === 'best' ? 20 : grade === 'ok' ? 8 : 0} max={20} />
      {r && (
        <>
          <div className="cs-h2">After release</div>
          <LAPressure mode="post" />
          <PulmonaryVein reversal={r.mr !== 'mild' && r.mr !== 'moderate'} />
          <Decision id="s7-second" question="Residual mild MR, gradient 3 mmHg. A colleague suggests a second clip “to abolish the rest”. You…"
            options={[
              { id: 'no', label: 'Decline: mild MR with a 3 mmHg gradient is an excellent result; a second clip would likely push the gradient above 5', verdict: 'best', points: 10,
                why: 'Each clip splits the orifice again. Chasing trace MR in a valve of 4.6 cm² risks iatrogenic mitral stenosis — a war story below.' },
              { id: 'yes', label: 'Add a second clip next to the first', verdict: 'wrong', points: 0, why: 'Perfection is the enemy of a good gradient.' },
            ]} />
          <Decision id="s7-iasd" question="Colour shows a small left-to-right shunt across the septum where the guide was. Close it?"
            options={[
              { id: 'leave', label: 'Leave it — small iatrogenic ASDs usually close or stay harmless; it also offloads the LA a little', verdict: 'best', points: 6, why: 'Closure is for large defects, right-to-left shunting with hypoxaemia, or RV volume overload.' },
              { id: 'close', label: 'Close it with a septal occluder now', verdict: 'wrong', points: 0, why: 'Not for a small left-to-right shunt — and it would block future transseptal access.' },
            ]} />
        </>
      )}
      <div className="cs-media-row" style={{ marginTop: 12 }}>
        <Video id="ihEM97ApCqE" title="MitraClip transcatheter mitral valve repair — procedure animation" />
        <Video id="XiBNAEpbL8U" title="MitraClip G4 TEER teaching case: step by step" />
      </div>
      <CaseLibrary title="Watch real cases" playlist={VALVE_PLAYLIST} start={VALVE_PLAYLIST_START} channels={VALVE_CHANNELS}>
        Structural and valvular cases from interventional teams. As you watch, look for the moments you just practised: the septal tent, the clip coming down, the grasp, the gradient check.
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">15:00</span>Bed 2, Valvular & Structural Heart Unit. Extubated, comfortable, SpO₂ 97% on air. The groin is dry with its figure-of-eight stitch. Still in AF, rate 84.</p>
      </div>
      <ECG12 rate={84} rhythm="af" caption="Rate-controlled AF, ~84/min." />
      <Decision id="s8-oac" question="Anticoagulation for her AF after TEER?"
        options={[
          { id: 'doac', label: 'A direct oral anticoagulant — restart tomorrow once the venous access is secure', verdict: 'best', points: 10,
            why: 'Mitral regurgitation and a mitral clip are not “valvular AF”. DOACs are preferred; warfarin is reserved for moderate-to-severe rheumatic mitral stenosis and mechanical valves.' },
          { id: 'warf', label: 'Warfarin — she has valve disease', verdict: 'wrong', points: 0, why: 'A common misreading of “valvular AF”.' },
          { id: 'none', label: 'Aspirin only — the clip is fine', verdict: 'wrong', points: 0, why: 'Her stroke risk is from the AF; aspirin does not prevent AF strokes.' },
        ]} />
      <Contrast title="what “valvular AF” means — and what it doesn’t"
        is={{ h: 'Valvular AF (warfarin)', points: ['Moderate-to-severe mitral STENOSIS, usually rheumatic.', 'A MECHANICAL heart valve.', 'DOACs failed or were not tested here.'] }}
        isnt={{ h: 'Not valvular AF (DOAC preferred)', points: ['Mitral regurgitation, aortic stenosis, tricuspid regurgitation.', 'Bioprosthetic valves after the early period; TAVI; mitral clips.', 'Most patients with “valve disease”.'] }} />
      <Decision id="s8-dose" question="Apixaban dose? She is 82, 61 kg, creatinine 128 µmol/L."
        options={[
          { id: '5', label: '5 mg twice daily', verdict: 'best', points: 10,
            why: 'Reduce to 2.5 mg only with two of: age ≥ 80, weight ≤ 60 kg, creatinine ≥ 133 µmol/L. She has one (age). Underdosing is common — and causes strokes.' },
          { id: '25', label: '2.5 mg twice daily — she is old and frail', verdict: 'wrong', points: 0, why: 'One criterion is not two. Frailty is not a dose criterion.' },
        ]} />
      <MultiSelect id="s8-checks" question="On her first evening, what do you check?"
        items={[
          { id: 'echo', label: 'An echo before discharge (or the next morning): clip position, residual MR, gradient', correct: true, why: 'Single-leaflet detachment usually declares in the first days.' },
          { id: 'groin', label: 'Groin and the figure-of-eight stitch', correct: true, why: 'Removed after a few hours.' },
          { id: 'fluid', label: 'Fluid balance and diuretic step-down', correct: true, why: 'Her filling pressures have fallen; over-diuresis drops her pressure now.' },
          { id: 'cre', label: 'Creatinine', correct: true, why: 'CKD 3b after shock and diuresis.' },
          { id: 'bedrest', label: 'Bed rest for 48 hours', correct: false, why: 'Mobilise once the venous access is secure.' },
        ]} />
    </>
  );
}

/* ============================================================
   9 · THE NIGHT: SINGLE-LEAFLET DEVICE ATTACHMENT
   ============================================================ */

function Detachment() {
  const { answers, answer, setVitals } = useCase();
  const clip = answers['s7-clip'];
  const fixed = answers['s9-redo'];
  const shallow = clip && clip.post < 6;
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>02:40</span>
          The night nurse calls: Mrs Haddad woke breathless, sitting on the edge of the bed. SpO₂ 87%, pressure 92/58, AF at 118. There is a new, loud murmur at the apex.
        </p>
      </div>
      <BedsideMonitor />
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>Bedside echo · 02:55</div>
        <p className="cs-p">{fixed ? 'After the second clip: both leaflets captured, residual mild MR, gradient 4 mmHg.' : 'The clip moves with the anterior leaflet only. The posterior leaflet swings free beneath it, and a broad jet has returned — severe MR again.'}</p>
      </div>
      <LAPressure mode={fixed ? 'post' : 'slda'} />

      <Decision id="s9-dx" question="What has happened?"
        options={[
          { id: 'slda', label: 'Single-leaflet device attachment: the clip has let go of the posterior leaflet', verdict: 'best', points: 10,
            why: shallow ? `Her posterior leaflet was held by only ${clip.post.toFixed(0)} mm of tissue. Shallow insertion is the commonest set-up for detachment.` : 'Even with good insertion, thin myxomatous tissue can tear at the grasp — usually within the first days.' },
          { id: 'emb', label: 'Clip embolisation', verdict: 'wrong', points: 0, why: 'The clip is still on the anterior leaflet.' },
          { id: 'ms', label: 'Iatrogenic mitral stenosis', verdict: 'wrong', points: 2, why: 'That raises the gradient without a big new regurgitant jet.' },
          { id: 'tamp', label: 'Tamponade from the transseptal puncture', verdict: 'wrong', points: 0, why: 'No effusion — and a loud new murmur points at the valve.' },
        ]} />
      <MultiSelect id="s9-now" question="Right now?"
        items={[
          { id: 'niv', label: 'CPAP / non-invasive ventilation', correct: true, why: 'Oxygenation and afterload reduction.' },
          { id: 'diur', label: 'IV furosemide', correct: true, why: 'Offload the lungs.' },
          { id: 'ino', label: 'If the pressure falls: dobutamine, and the balloon pump again', correct: true, why: 'Support the forward flow; offload the afterload.' },
          { id: 'hold', label: 'Hold tomorrow’s DOAC start until the plan is clear', correct: true, why: 'She may be going back to the lab.' },
          { id: 'team', label: 'Urgent heart team review in the morning', correct: true, why: 'The fix is mechanical.' },
          { id: 'nor', label: 'Noradrenaline alone to get the pressure to 120', correct: false, why: 'More afterload, more regurgitation.' },
          { id: 'bb', label: 'IV beta-blocker for the AF', correct: false, why: 'The rate is compensating for a collapsed stroke volume.' },
        ]} />
      <Decision id="s9-def" question="Morning TOE: the posterior leaflet is intact, with enough tissue lateral to the first clip. The definitive plan?"
        options={[
          { id: 'redo', label: 'Repeat TEER: a second clip capturing the posterior leaflet beside the first', verdict: 'best', points: 10,
            why: 'When the free leaflet is intact and graspable, a second clip can restore coaptation. If it were torn, the options would be electrosurgical detachment of the clip and a transcatheter valve, or surgery.' },
          { id: 'surg', label: 'Emergency mitral valve replacement', verdict: 'ok', points: 4, why: 'The backup if the leaflet were destroyed — her surgical risk is unchanged.' },
          { id: 'med', label: 'Medical therapy now', verdict: 'wrong', points: 0, why: 'She has already shown what severe MR does to her.' },
        ]} />
      {!fixed ? (
        <button className="cs-btn primary" onClick={() => { answer('s9-redo', true); setVitals({ sys: 116, dia: 66, hr: 84, spo2: 97, rhythm: 'af' }); }}>Repeat TEER: second clip on the posterior leaflet</button>
      ) : (
        <div className="cs-fb best">Second clip deployed lateral to the first, both leaflets captured 8 mm deep. Residual mild MR, mean gradient 4 mmHg. The v-wave is down to 22. By evening she is reading in a chair.</div>
      )}
      <Contrast title="single-leaflet detachment vs iatrogenic mitral stenosis"
        is={{ h: 'SLDA', points: ['A sudden return of severe MR, often in the first days.', 'A new loud murmur, pulmonary oedema, giant v-waves.', 'Fix: recapture with a second clip, or replace.'] }}
        isnt={{ h: 'Iatrogenic stenosis', points: ['Gradually rising breathlessness after one clip too many.', 'Mean gradient > 5 mmHg, high mean LA pressure without big v-waves.', 'Prevented, not fixed: stop at a good result.'] }} />
      <Why title="Why a pure vasoconstrictor makes her worse"
        chain={[
          { k: 'TWO EXITS', t: 'With the clip off, the LV again has a wide-open back door.' },
          { k: 'SQUEEZE THE FRONT', t: 'Noradrenaline raises aortic resistance.' },
          { k: 'BLOOD CHOOSES', t: 'More of each beat goes the easy way — back to the LA.' },
          { k: 'WORSE', t: 'Higher v-waves, wetter lungs, less forward flow: a better number on the monitor, a worse patient.' },
        ]} />
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
      <ViciousCycle id="cyc-mr" title="The acute MR spiral — 21:40"
        nodes={[
          { short: 'Flail leak', t: 'A flail leaflet opens a hole to the LA', d: 'A large share of each beat goes backwards.' },
          { short: 'Giant v-wave', t: 'LA pressure spikes in systole', d: 'A small, stiff atrium cannot absorb it.' },
          { short: 'Wet lungs', t: 'Pulmonary oedema, hypoxia', d: 'And the work of breathing soars.' },
          { short: 'Sympathetic', t: 'Adrenaline surge: vasoconstriction and tachycardia', d: 'The body defends its pressure by tightening the arteries.' },
          { short: 'More afterload', t: 'Higher aortic resistance', d: 'Pushes more of each beat back through the leak — the spiral tightens.' },
        ]}
        breaks={[
          { at: 0, t: 'Fix the valve: the definitive cut (clip, repair, replace).' },
          { at: 4, t: 'Afterload reduction: nitrate or nitroprusside, an intra-aortic balloon pump.' },
          { at: 2, t: 'CPAP/NIV and diuretics.' },
          { at: 3, t: 'Avoid pure vasoconstrictors; if pressure must be supported, pair with dobutamine or a balloon pump.' },
        ]} />
      <Decision id="cyc-iabp" question="Why does an intra-aortic balloon pump help in acute MR but would not rescue a patient with critical aortic stenosis?"
        options={[
          { id: 'exit', label: 'In MR, deflation in systole lowers aortic resistance so more blood leaves forwards; in AS the valve, not the aorta, limits outflow', verdict: 'best', points: 10,
            why: 'Afterload reduction only helps when there is another exit competing for the blood. In AS the obstruction is upstream of the balloon.' },
          { id: 'cor', label: 'It only works by improving coronary flow', verdict: 'wrong', points: 0, why: 'That is part of it, but not why it helps MR so much.' },
        ]} />
      <ViciousCycle id="cyc-af" title="The atrial spiral — MR begets AF begets MR"
        nodes={[
          { short: 'Volume load', t: 'Regurgitant volume stretches the LA', d: 'Atrial myocytes stretch, scar and remodel.' },
          { short: 'AF', t: 'Atrial fibrillation', d: 'Electrical chaos in a stretched atrium.' },
          { short: 'Bigger annulus', t: 'The LA and mitral annulus dilate further', d: 'The leaflets are pulled apart: atrial functional MR adds to the leak.' },
          { short: 'More MR', t: 'More regurgitation', d: 'More stretch — the loop closes.' },
        ]}
        breaks={[
          { at: 3, t: 'Fix the leak early — before the atrium is ruined.' },
          { at: 1, t: 'Rate or rhythm control; anticoagulate.' },
          { at: 0, t: 'Refer asymptomatic severe MR when AF appears — it is a trigger for intervention.' },
        ]} />
      <ViciousCycle id="cyc-chronic" title="The silent spiral — chronic severe MR"
        nodes={[
          { short: 'Volume overload', t: 'Years of volume overload', d: 'The LV dilates to keep forward output up.' },
          { short: 'Bigger LV', t: 'Eccentric hypertrophy, a bigger annulus', d: 'Wall stress rises; the leak grows.' },
          { short: 'Hidden damage', t: 'Contractility falls while the EF still looks “normal”', d: 'The leak flatters the EF.' },
          { short: 'Irreversible', t: 'EF ≤ 60% or LVESD ≥ 40 mm', d: 'By the time symptoms come, some damage stays after repair.' },
        ]}
        breaks={[
          { at: 2, t: 'Operate on the numbers, not the symptoms: EF ≤ 60%, LVESD ≥ 40 mm, AF, PASP > 50 mmHg, a dilated LA.' },
          { at: 0, t: 'Early repair in a centre that repairs reliably.' },
        ]} />
      <Decision id="cyc-ef" question="An asymptomatic 58-year-old with a flail leaflet, severe MR, EF 61%, LVESD 41 mm. Next step?"
        options={[
          { id: 'refer', label: 'Refer for surgical repair now: LVESD ≥ 40 mm is a trigger even without symptoms', verdict: 'best', points: 10, why: 'Waiting for symptoms or a lower EF trades a cure for a damaged ventricle.' },
          { id: 'watch', label: 'Watch: she has no symptoms and a normal EF', verdict: 'wrong', points: 0, why: 'A “normal” EF in severe MR is already abnormal.' },
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
      <WarStory title="The murmur at the base"
        mistake="Calling a posterior-flail MR murmur “aortic sclerosis” because it radiated to the neck."
        burn="A murmur’s radiation follows the jet, not the valve. Echo every new or changed murmur with symptoms.">
        <p className="cs-p">A 70-year-old with new breathlessness and an ejection-sounding murmur at the base. “Sclerosis.” Six months later, admitted in pulmonary oedema: a flail P2 with an anteriorly directed jet.</p>
      </WarStory>
      <WarStory title="Watched until the EF fell"
        mistake="Following asymptomatic severe MR until the ejection fraction dropped to 50%."
        burn="In severe MR, an EF ≤ 60% is already dysfunction. Refer on the triggers, not on symptoms.">
        <p className="cs-p">A fit 62-year-old with a flail leaflet, followed yearly because he “felt fine”. When he finally had his repair, the EF was 50% and the LV 46 mm at end-systole. The repair was perfect; the ventricle never recovered.</p>
      </WarStory>
      <Decision id="mm-trig" question="Which finding alone should have triggered referral?"
        options={[
          { id: 'lvesd', label: 'LV end-systolic diameter ≥ 40 mm', verdict: 'best', points: 10, why: 'Along with EF ≤ 60%, new AF, PASP > 50 mmHg and a markedly dilated LA.' },
          { id: 'murmur', label: 'A louder murmur', verdict: 'wrong', points: 0, why: 'Loudness does not track ventricular damage.' },
        ]} />
      <WarStory title="The beta-blocker for the fast AF"
        mistake="IV metoprolol for AF at 140 in a patient with acute MR and pulmonary oedema."
        burn="In a low-stroke-volume state, the heart rate is holding up the output. Treat the cause before you slow it.">
        <p className="cs-p">Acute MR from a papillary muscle rupture, AF at 140. Two boluses of metoprolol: rate 95, pressure 70/40, lactate 7. Intubated in shock.</p>
      </WarStory>
      <WarStory title="The jet that looked moderate"
        mistake="Grading an eccentric MR jet by its colour area."
        burn="Wall-hugging jets hide their size. Quantify: vena contracta, PISA, pulmonary veins.">
        <p className="cs-p">“Moderate MR, eccentric.” Discharged on diuretics. Back in three weeks with pulmonary oedema. TOE: EROA 0.55 cm², systolic pulmonary-vein reversal.</p>
      </WarStory>
      <WarStory title="One clip too many"
        mistake="Adding a second clip to abolish trace MR in a small valve."
        burn="Stop at a good result. Every clip trades regurgitation for stenosis.">
        <p className="cs-p">A good first clip: mild MR, gradient 3. A second clip “to make it perfect”: trace MR, gradient 8 mmHg. Over the next month she was more breathless than before the procedure.</p>
      </WarStory>
      <Decision id="mm-clip" question="What number should have stopped the second clip?"
        options={[
          { id: 'grad', label: 'The predicted mean gradient: a valve area that would fall below ~1.5 cm² or a gradient above 5 mmHg', verdict: 'best', points: 10, why: 'Assess the gradient after each clip — and before deciding on the next.' },
          { id: 'mr', label: 'Any residual MR justifies another clip', verdict: 'wrong', points: 0, why: 'Mild residual MR is a good outcome.' },
        ]} />
      <WarStory title="The anterior puncture"
        mistake="Crossing the septum without checking the short-axis view."
        burn="Anterior is aorta. Confirm the tent in the short-axis view before every puncture.">
        <p className="cs-p">The tent looked fine in the bicaval view. In the short-axis view — not checked — it pointed at the aortic root. The needle entered the aorta; the dilator followed. Tamponade, emergency surgery.</p>
      </WarStory>
      <WarStory title="The cautious dose"
        mistake="Apixaban 2.5 mg twice daily for an 81-year-old who met only one dose-reduction criterion."
        burn="Two of three: age ≥ 80, weight ≤ 60 kg, creatinine ≥ 133. Frailty is not a criterion.">
        <p className="cs-p">“She’s frail — let’s be careful.” Six weeks later, a left MCA stroke from AF. Her dose had been halved without an indication.</p>
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
      <MultiSelect id="s12-home" question="Her discharge plan?"
        items={[
          { id: 'doac', label: 'Apixaban 5 mg twice daily', correct: true, why: 'AF; full dose.' },
          { id: 'endo', label: 'Endocarditis prophylaxis for dental procedures and a device card', correct: true, why: 'Prosthetic material used for valve repair, including transcatheter, counts as high risk.' },
          { id: 'echo', label: 'Echo at 30 days: clip stability, MR, gradient', correct: true, why: 'And annually after.' },
          { id: 'rate', label: 'Rate control; consider rhythm control once the atrium recovers', correct: true, why: 'Sinus rhythm is more likely now the LA is offloaded.' },
          { id: 'diur', label: 'Lowest effective diuretic, weight diary', correct: true, why: 'Her filling pressures are normal now.' },
          { id: 'aspirin', label: 'Add aspirin to the DOAC for the clip', correct: false, why: 'No benefit; more bleeding. Her CABG was 15 years ago and she has no recent PCI.' },
        ]} />

      <div className="cs-h2">Case quiz</div>
      <Quiz id="s12-quiz" items={[
        { q: 'Sudden pulmonary oedema with a normal heart size and a short early systolic murmur suggests…', options: ['Chronic severe MR', 'Acute severe MR', 'Aortic stenosis', 'Pericardial effusion'], answer: 1, why: 'No time to dilate.' },
        { q: 'In acute MR with low-normal pressure, the best first vasoactive strategy is…', options: ['Noradrenaline alone', 'Afterload reduction, with dobutamine or a balloon pump if needed', 'Phenylephrine', 'IV beta-blocker'], answer: 1, why: 'Send blood forward.' },
        { q: 'PISA radius 1.1 cm at an aliasing velocity of 40 cm/s, MR Vmax 5.2 m/s. EROA ≈', options: ['0.15 cm²', '0.35 cm²', '0.58 cm²', '1.2 cm²'], answer: 2, why: '2π × 1.21 × 40 / 520 ≈ 0.58.' },
        { q: 'An eccentric MR jet tends to make the colour jet area…', options: ['Overestimate severity', 'Underestimate severity', 'Accurate', 'Irrelevant'], answer: 1, why: 'Coanda effect.' },
        { q: 'Carpentier type II mitral regurgitation is…', options: ['Annular dilatation', 'Excessive leaflet motion', 'Rheumatic restriction', 'Ischaemic tethering'], answer: 1, why: 'Prolapse or flail.' },
        { q: 'In severe primary MR without symptoms, which triggers intervention?', options: ['EF 65%', 'LVESD 41 mm', 'A louder murmur', 'Age over 60'], answer: 1, why: 'LVESD ≥ 40 mm or EF ≤ 60%.' },
        { q: 'Transseptal puncture height for a central P2 TEER is about…', options: ['1–2 cm', '4–4.5 cm', '7 cm', 'Irrelevant'], answer: 1, why: 'Room to steer and align.' },
        { q: 'A good TEER result is mild or less MR with a mean gradient below…', options: ['2 mmHg', '5 mmHg', '10 mmHg', '15 mmHg'], answer: 1, why: 'Above ~5 mmHg: iatrogenic stenosis.' },
        { q: 'Which is “valvular AF” requiring warfarin?', options: ['AF with severe MR', 'AF after TEER', 'AF with moderate rheumatic mitral stenosis', 'AF after TAVI'], answer: 2, why: 'Moderate–severe MS or a mechanical valve.' },
        { q: 'Apixaban is reduced to 2.5 mg twice daily when…', options: ['Age ≥ 80 alone', 'Two of: age ≥ 80, weight ≤ 60 kg, creatinine ≥ 133 µmol/L', 'Any frailty', 'eGFR < 60'], answer: 1, why: 'Two of three.' },
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
          <li className="cs-li">Acute MR: pulmonary oedema with a normal-sized heart and a murmur that may sound mild.</li>
          <li className="cs-li">In MR, lower the afterload — nitrates, a balloon pump, dobutamine. The mirror image of aortic stenosis.</li>
          <li className="cs-li">The heart rate may be propping up the output: do not bolus beta-blockers into acute MR.</li>
          <li className="cs-li">Eccentric jets hide: quantify with PISA, vena contracta and pulmonary veins.</li>
          <li className="cs-li">A “normal” EF in severe MR is already abnormal. Operate on the triggers.</li>
          <li className="cs-li">TEER for high-risk patients with suitable anatomy: puncture ~4 cm high and posterior, arms perpendicular, both leaflets deep.</li>
          <li className="cs-li">Stop at a good result: mild MR and a gradient under 5 mmHg.</li>
          <li className="cs-li">A sudden return of severe MR after TEER is single-leaflet detachment until proven otherwise.</li>
          <li className="cs-li">MR is not “valvular AF”: DOAC, at the right dose.</li>
        </ol>
      </div>
      <Video id="AJLrK8PUtzI" title="Mitral regurgitation murmur — causes, pathophysiology and signs" />
      <CaseLibrary playlist={VALVE_PLAYLIST} start={VALVE_PLAYLIST_START} channels={VALVE_CHANNELS}>
        Keep going: more structural and valvular cases from the same teams.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const VALVE_02 = {
  title: 'Acute severe primary MR · Flail P2 · TEER and single-leaflet detachment',
  short: 'Structural Heart · Case 02',
  patient: {
    name: 'Mrs Nadia Haddad',
    meta: '82 F · MRN 4126-0381 · 61 kg',
    flags: [
      { text: 'Prior CABG — patent LIMA', tone: 'amber' },
      { text: 'New AF', tone: 'red' },
      { text: 'eGFR 38', tone: 'amber' },
      { text: 'Bisoprolol · aspirin', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 30, limit: 140, basis: 'volume/eGFR ≤ 3.7' },
  clock0: min(21, 40),
  vitals0: { hr: 132, sys: 104, dia: 68, spo2: 86, rr: 32, st: 0, rhythm: 'af' },
  brand: { icon: '🫀', line: 'Structural Heart · Case 02' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / IM', tone: 'cyan' },
      { text: 'Structural · transcatheter', tone: 'red' },
      { text: 'ESC/EACTS 2025 VHD-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'Backwards', style: 'outline' },
      { text: 'pressure', style: 'grad' },
      { text: '& the loose clip', style: 'cyan' },
    ],
    hook: (
      <>
        A retired pharmacist lifts a box of books and feels something <b>give</b>. Three days later she is drowning, in a heart that is not even enlarged.
        Here the rule from Case 01 turns inside out: in mitral regurgitation, every millimetre of mercury you take off the afterload sends blood <span className="g">forwards</span> instead of back.
        You will measure the leak, cross the septum, grasp a flail leaflet on a beating heart — and meet the clip that <span className="r">lets go at 02:40</span>.
      </>
    ),
    image: null,
    sims: 's4',
    crisis: 's9',
    cards: [
      { k: 'The patient', t: 'Mrs Nadia Haddad, 82 — prolapse for twenty years, prior CABG, CKD; a chord tears.' },
      { k: 'Your role', t: 'From the resus bay to the CCU, the heart team, the structural lab and the night on the unit.' },
      { k: 'In your hands', t: 'Heart sounds, AF on the ECG, PISA on colour TOE, pulmonary veins, LA pressure, the transseptal needle and the clip.' },
      { k: 'How it teaches', t: 'The mirror of Case 01: the same drugs, opposite physiology — and why.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'Flash pulmonary oedema', Component: Presentation,
      pill: '🌊 21:40 — drowning in a normal-sized heart',
      lede: 'Listen, read the AF, decide what tore — and send the blood forwards.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 132, sys: 104, dia: 68, spo2: 86, rr: 32, rhythm: 'af' }); atLeastClock(min(21, 40)); } },
    { id: 's2', icon: '📏', nav: 'Echo & TOE', title: 'How severe — echo, TOE and PISA', Component: Echo,
      pill: '🎯 Quantify the leak yourself',
      lede: 'Why the colour jet lies, PISA by hand, pulmonary veins, v-waves — and what kind of MR this is.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 96, sys: 108, dia: 62, spo2: 95, rr: 20, rhythm: 'af' }); atLeastClock(min(34, 0)); } },
    { id: 's3', icon: '👥', nav: 'Heart Team', title: 'The heart team decision', Component: HeartTeam,
      pill: '🧭 Day 3 — surgery, clip or valve?',
      lede: 'Her risk, her anatomy, her wishes — and the trade every clip makes.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 88, sys: 112, dia: 64, spo2: 96, rhythm: 'af' }); atLeastClock(min(61, 0)); } },
    { id: 's4', icon: '🪡', nav: 'Transseptal Puncture', title: 'Planning & the transseptal puncture', Component: Planning,
      pill: '📐 Superior, posterior, four centimetres',
      lede: 'Choose the spot on the septum that makes the rest possible — then cross it.',
      enter: ({ atLeastClock }) => atLeastClock(min(104, 0)) },
    { id: 's5', icon: '🩸', nav: 'Set-up', title: 'Set-up in the structural lab', Component: Setup,
      pill: '🧷 Day 5 — TOE from start to finish',
      lede: 'Checklist, sequence — and the pressure that tells you if it worked.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 86, sys: 110, dia: 62, spo2: 98, rhythm: 'af' }); atLeastClock(min(104, 30)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy: alignment and the grasp', Component: Strategy,
      pill: '🎯 Perpendicular, centred, deep',
      lede: 'What a good grasp looks like before you take one.',
      enter: ({ atLeastClock }) => atLeastClock(min(105, 0)) },
    { id: 's7', icon: '🗜️', nav: 'Clip Deployment', title: 'Clip deployment', Component: Deploy,
      pill: '🫀 Grasp a beating leaflet',
      lede: 'Align, grasp, judge, release — and know when to stop.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 86, sys: 108, dia: 60, spo2: 99, rhythm: 'af' }); atLeastClock(min(105, 30)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit', Component: Recovery,
      pill: '💊 The anticoagulant, at the right dose',
      lede: 'Bed 2: what “valvular AF” really means, and the checks that catch trouble.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 84, sys: 118, dia: 66, spo2: 97, rr: 16, rhythm: 'af' }); atLeastClock(min(111, 0)); } },
    { id: 's9', icon: '🚨', nav: 'Night Crisis', title: 'The night: the clip lets go', Component: Detachment,
      pill: '🌙 02:40 — a new loud murmur',
      lede: 'Recognise single-leaflet detachment, support the patient the right way, fix it.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 118, sys: 92, dia: 58, spo2: 87, rr: 28, rhythm: 'af' }); atLeastClock(min(122, 40)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'The acute spiral, the atrial spiral, and the silent one.',
      enter: ({ setVitals }) => setVitals({ hr: 80, sys: 118, dia: 66, spo2: 97, rhythm: 'af' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Seven patients who taught these rules.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'Her plan, the quiz — then your score.' },
  ],
};

export default function Valve02({ onClose }) {
  return <CaseShell def={VALVE_02} onClose={onClose} />;
}
