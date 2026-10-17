import React from 'react';
import {
  CaseShell, useCase, Note, Decision as KitDecision, MultiSelect, Sequence, Figure, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import { Auscultation, PulmonaryVein } from '../kit/Valve.jsx';
import {
  ProlapseQuant, TwoExitVentricle, SurveillanceTrend, MitralMap, RingPlanner, RepairBench, SamCrisis, ringModel,
} from './sims.jsx';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 04
   Chronic primary (degenerative) mitral regurgitation: the
   patient who says he is fine. A 52-year-old airline captain
   with Barlow disease — bileaflet billowing and a flail P2 —
   found at a routine aviation medical. Chronic compensated MR
   and why an EF of 62% is already a damaged ventricle; PISA and
   vena contracta by hand; serial echoes against the 2025
   triggers and the cost of waiting; the arrhythmic-MVP thread
   (mitral annular disjunction, inferior T waves, papillary
   muscle scar); segment analysis on 3D TOE; the geometry of
   SAM; a neochord repair with a true-sized ring — and, that
   night on the ICU, systolic anterior motion with outflow
   obstruction, made worse by adrenaline.

   The mirror of Cases 02 and 05: acute primary MR treated with
   a clip (02), secondary MR where the ventricle is the disease
   (05) — here the valve is the disease, the cure is surgical
   repair, and the art is the timing.

   Clinical content follows the 2025 ESC/EACTS guidelines for
   valvular heart disease, ASE/EACVI quantification standards,
   the 2023 ESC endocarditis guideline, the 2024 ESC AF
   guideline and the 2022 EHRA consensus on arrhythmic mitral
   valve prolapse, simplified for teaching. Where guidelines
   differ or evidence is thin, the rationale says so.
   ============================================================ */

const WIKI = f => `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=960`;
const WIKIPAGE = f => `https://commons.wikimedia.org/wiki/File:${f}`;
const min = (h, m) => h * 60 + m;
const DAY = 24;

/* Channel searches for surgical mitral repair — the case's own shelf. */
const REPAIR_SEARCHES = [
  { name: 'CCC Live Cases — mitral repair', url: 'https://www.youtube.com/@CCCLiveCases/search?query=mitral%20repair', note: 'Mitral repair and structural cases' },
  { name: 'Gulf Intervention Society — mitral', url: 'https://www.youtube.com/@gulfinterventionsociety/search?query=mitral', note: 'Mitral case presentations and talks' },
  { name: 'Interventional Cardiology — mitral', url: 'https://www.youtube.com/@interventionalcardiologyis3814/search?query=mitral', note: 'Mitral cases' },
];

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

/* Options are written best-first for the reader of this file; on screen each
   question rotates them by a fixed amount, so the best answer is not always A. */
function Decision({ id, options, ...rest }) {
  const k = [...id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % options.length;
  return <KitDecision id={id} options={[...options.slice(k), ...options.slice(0, k)]} {...rest} />;
}

function ScoreOnce({ id, pts, max }) {
  const { award, stageId } = useCase();
  React.useEffect(() => { if (pts != null) award(stageId, id, pts, max); }, [pts]);  // eslint-disable-line
  return null;
}

/* The serial echoes: four real visits and two that have not happened yet. */
const VISITS = [
  { y: 2019, label: '2019', lvesd: 33, ef: 70, lavi: 38, spap: 28, af: false, tr: 'trace', severe: false,
    note: 'Murmur first heard at a medical. Echo: bileaflet prolapse, moderate MR. “Review in two years.”' },
  { y: 2021, label: '2021', lvesd: 35, ef: 68, lavi: 46, spap: 31, af: false, tr: 'mild', severe: false,
    note: 'Moderate-to-severe MR. Still running half-marathons.' },
  { y: 2023, label: '2023', lvesd: 37, ef: 65, lavi: 54, spap: 38, af: false, tr: 'mild', severe: true,
    note: 'Severe MR (EROA 0.42 cm²). No trigger met. Six-monthly review planned — he missed two because of his rota.' },
  { y: 2026, label: 'Today', lvesd: 39, ef: 62, lavi: 64, spap: 46, af: false, tr: 'mild', severe: true,
    note: 'Flail P2 on a ruptured chord. LVESD up 6 mm and EF down 8 points in seven years. One criterion met (LA). Exercise SPAP 62 mmHg.' },
  { y: 2027, label: '2027 (if we wait)', lvesd: 42, ef: 58, lavi: 72, spap: 54, af: 'paroxysmal AF', tr: 'moderate', severe: true, projected: true,
    note: 'Paroxysmal AF on a layover in Singapore. LVESD 42, EF 58: class I — but now for a ventricle that has started to fail.' },
  { y: 2028, label: '2028 (if we wait)', lvesd: 45, ef: 53, lavi: 81, spap: 58, af: 'persistent AF', tr: 'moderate', severe: true, projected: true,
    note: 'Breathless on stairs. Persistent AF. A repair now fixes the valve; the ventricle and atrium may never recover.' },
];
const NOW = 3;

/* What the 3D TOE shows: a Barlow valve with a flail P2. */
const SEG_TRUTH = { A1: 'normal', A2: 'billowing', A3: 'normal', P1: 'normal', P2: 'flail', P3: 'billowing' };

/* ============================================================
   1 · PRESENTATION — THE MURMUR AT THE MEDICAL
   ============================================================ */

function Presentation() {
  const { answers } = useCase();
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🛫 08:30</span>Captain Rafael Moreno, 52, long-haul pilot, at his routine aviation medical. Runs half-marathons. Non-smoker, no medicines. “Honestly, doc, I’ve never felt better.”</p>
        <p className="cs-p"><span className="cs-time">history</span>A murmur was noted at a medical in 2019 (“floppy valve, moderate leak, review in two years”). He has had three echoes since. Asked directly: he dropped the hill loop from his Sunday run last spring — “age” — and notices “skipped beats” lying on his left side at night in hotel rooms.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">family</span>His mother had “a floppy valve” and a pacemaker. No sudden deaths he knows of.</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>📋 Observations · 08:40</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('64 /min, regular — one dropped beat')], ['Blood pressure', N('128/74 mmHg')], ['SpO₂', N('99% on air')],
            ['Resp. rate', N('13 /min')], ['BMI · BSA', N('24.6 · 1.98 m²')], ['Temperature', N('36.6 °C')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🩺 Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Apex displaced to the 6th intercostal space, anterior axillary line; brisk, hyperdynamic.</li>
            <li className="cs-li">A mid-systolic click, then a loud pansystolic murmur at the apex radiating to the axilla — grade 3/6.</li>
            <li className="cs-li">A soft third heart sound.</li>
            <li className="cs-li">Chest clear. No oedema. Tall, long-limbed — but no other Marfan features.</li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">🎧 Listen — then compare</div>
      <p className="cs-p">Prolapse first, then chronic severe MR (his has become this), then HCM — because both prolapse and HCM murmurs get louder with Valsalva and standing. One manoeuvre separates them: try handgrip.</p>
      <Auscultation lesions={['mvp', 'mr-chronic', 'hcm', 'normal']} />
      <Decision id="s1-man" question="Prolapse murmurs and HCM murmurs both grow with Valsalva. Which bedside manoeuvre pulls them apart?"
        options={[
          { id: 'hg', label: 'Sustained handgrip: the MR murmur gets LOUDER, the HCM murmur gets softer', verdict: 'best', points: 10,
            why: 'Handgrip raises afterload. More resistance at the aortic exit sends more blood through the leaking mitral valve (louder) but widens the outflow tract in HCM and lessens the obstruction (softer).' },
          { id: 'squat', label: 'Squatting: both get louder', verdict: 'wrong', points: 0, why: 'Squatting makes the LV bigger: the prolapse click comes later and the murmur shortens; the HCM murmur softens. Both change, but not apart from each other as cleanly as with handgrip.' },
          { id: 'insp', label: 'Inspiration', verdict: 'wrong', points: 0, why: 'Inspiration accentuates right-sided murmurs (Carvallo). Neither of these.' },
        ]} />

      <ECG12 rate={64} tInv={{ II: true, III: true, aVF: true }}
        caption="Sinus rhythm 64/min. T-wave inversion in II, III and aVF — an inferior repolarisation change in a fit man with no coronary symptoms. The aviation printout also caught two ventricular ectopics with a right-bundle-branch, superior-axis shape: a papillary-muscle origin." />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧪 Chest X-ray and bloods</div>
        <Table head={['', 'Result']} rows={[
          ['Chest X-ray', 'Clear lungs. A double right heart border and a straightened left heart border: an enlarged left atrium'],
          ['NT-proBNP', N('240 ng/L — above the age-related normal', 'cs-hi')], ['hs-Troponin T', N('6 ng/L')],
          ['Haemoglobin', N('148 g/L')], ['Creatinine', N('84 µmol/L')], ['TSH', N('1.9 mU/L')],
        ]} />
      </div>

      <MultiSelect id="s1-flags" question="He says he is fine. Which findings say his heart is NOT fine?"
        items={[
          { id: 'hills', label: 'He quietly dropped the hills from his run', correct: true, why: 'Self-limitation is the commonest hidden symptom in chronic MR. Patients adapt their life to the valve and call it age.' },
          { id: 'apex', label: 'A displaced, hyperdynamic apex', correct: true, why: 'The LV has dilated to carry the regurgitant volume: chronic volume overload.' },
          { id: 's3', label: 'A third heart sound with a loud pansystolic murmur', correct: true, why: 'Not necessarily failure: a torrent of blood returns from the LA in early diastole. But it means the regurgitant volume is large.' },
          { id: 'ecg', label: 'Inferior T-wave inversion and papillary-muscle ectopy', correct: true, why: 'Markers of the arrhythmic prolapse phenotype — they change what you look for next.' },
          { id: 'la', label: 'A big left atrium on the X-ray and a raised NT-proBNP', correct: true, why: 'The atrium has been stretched for years; BNP comes from stretched heart muscle.' },
          { id: 'click', label: 'The mid-systolic click', correct: false, why: 'A click alone says prolapse — common and usually benign. The danger lies in what the leak has done, not in the click.' },
        ]} />

      <Why title="🫀 Why chronic severe MR can feel like nothing for years"
        chain={[
          { k: 'SLOW LEAK', t: 'The leak grows over years: a stretched chord, then a torn one.' },
          { k: 'COMPLIANT LA', t: 'The atrium dilates slowly and becomes a big, soft reservoir: its pressure barely rises.' },
          { k: 'BIG LV', t: 'The ventricle dilates and hypertrophies eccentrically, so its total stroke volume doubles and forward output stays normal.' },
          { k: 'NO SYMPTOMS', t: 'Normal LA pressure and normal forward output: no breathlessness, no fatigue.' },
          { k: 'SILENT COST', t: 'Meanwhile the muscle is stretched, the atrium remodels, and both pass a point of no return — silently.' },
        ]}>
        Compensation is not health. It is the heart spending its reserve to look normal.
      </Why>
      <Contrast title="🏃 asymptomatic vs adapted"
        is={{ h: 'Truly asymptomatic', points: ['Unchanged exercise — measured, not reported.', 'Normal exercise capacity on a treadmill or bike.', 'Stable LV and LA sizes year to year.'] }}
        isnt={{ h: 'Adapted (him)', points: ['“I just don’t do hills any more.”', 'Life quietly rearranged around the valve.', 'Unmasked by an exercise test — the commonest hidden symptom.'] }} />
      <Contrast title="🪶 benign prolapse vs degenerative disease"
        is={{ h: 'Benign prolapse', points: ['A click, perhaps a late systolic murmur.', 'Trivial or mild MR, normal LV and LA.', 'Reassure; echo every few years.'] }}
        isnt={{ h: 'Barlow disease with severe MR', points: ['Thick, redundant, billowing leaflets; elongated or torn chords.', 'Pansystolic murmur, displaced apex, big LA.', 'A surgical disease — the question is when, not whether.'] }} />

      <Decision id="s1-next" question="He needs his certificate renewed this week. What do you do?"
        options={[
          { id: 'echo', label: 'Defer the certificate; urgent echo and cardiology review — explain why', verdict: 'best', points: 10,
            why: 'Severe MR is suggested by the examination and the X-ray, and the ECG and ectopy raise arrhythmic questions. Fitness decisions follow the assessment, not the other way round; his aviation authority’s cardiology advisers will decide on certification with the results.' },
          { id: 'cert', label: 'Renew the certificate and book a routine echo', verdict: 'ok', points: 3, why: 'He is well today — but you have found a likely severe lesion with arrhythmic markers. Assess first.' },
          { id: 'innocent', label: 'Reassure: a click and a murmur in a fit man is benign prolapse', verdict: 'wrong', points: 0, why: 'A displaced apex, an S3 and a big atrium are not benign prolapse.' },
        ]} />
      {answers['s1-next'] && <Note kind="pearl" title="📅 Day 14">Transthoracic echo in the valve clinic, then a TOE, a cardiac MRI and a 7-day Holter.</Note>}

      <div className="cs-media-row">
        <Figure src={WIKI('Heart_mitral_valve_prolapse.svg')} href={WIKIPAGE('Heart_mitral_valve_prolapse.svg')} alt="Diagram of mitral valve prolapse" caption="Mitral valve prolapse: the leaflets bulge back into the left atrium in systole." credit="Patrick J. Lynch, medical illustrator · CC BY 2.5 · Wikimedia Commons" />
        <Video id="AJLrK8PUtzI" title="Mitral regurgitation murmur — causes, pathophysiology and signs" />
      </div>
    </>
  );
}

/* ============================================================
   2 · MEASURE THE LEAK — ECHO, TOE, CMR, HOLTER
   ============================================================ */

function Measure() {
  const { answers, answer } = useCase();
  const m = answers['s2-quant'];
  const pts = m == null ? null : m.closeR && m.closeVC ? 15 : m.closeR || m.closeVC ? 8 : 3;
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Transthoracic echo · day 14</div>
        <Table head={['', 'Finding']} rows={[
          ['Mitral valve', 'Thick, redundant leaflets; bileaflet billowing; flail P2 with a ruptured chord; anteriorly directed eccentric jet'],
          ['LV', N('LVEDD 60 mm · LVESD 39 mm (LVESDi 19.7 mm/m²) · EF 62%', 'cs-hi')],
          ['LA', N('LAVI 64 mL/m²', 'cs-hi')],
          ['PA systolic pressure', N('46 mmHg at rest')],
          ['TR', 'Mild; RV normal'],
          ['Annulus', N('Mitral annular disjunction 7 mm in end-systole (PLAX)', 'cs-hi')],
          ['Tissue Doppler', 'A sharp, high-velocity late-systolic spike at the lateral annulus (“Pickelhaube” sign)'],
        ]} />
      </div>
      <Why title="📏 Why the end-systolic diameter matters more than the EF"
        chain={[
          { k: 'EF IS LOAD-DEPENDENT', t: 'A low-resistance exit (the LA) lets the LV empty more — the EF is flattered.' },
          { k: 'ESD IS LESS SO', t: 'How small the ventricle can get at the end of systole reflects the muscle more directly.' },
          { k: 'CREEPING UP', t: 'An LVESD that grows year on year means the muscle is losing the fight, even if the EF is still “normal”.' },
          { k: 'THE LINES', t: 'LVESD ≥ 40 mm (or ≥ 20 mm/m²) and EF ≤ 60% mark dysfunction. He is at 39 mm and 62% — and moving.' },
        ]} />

      <div className="cs-h2">🎯 TOE · quantify it yourself</div>
      <p className="cs-p">Find the flow-convergence hemisphere on the LV side of the flail, set the colour baseline, measure its radius. Then measure the vena contracta: the narrowest neck of the jet as it leaves the orifice.</p>
      <ProlapseQuant onMeasure={r => answer('s2-quant', r)} />
      {m && (
        <div className={'cs-fb ' + (m.closeR && m.closeVC ? 'best' : 'ok')}>
          r {m.r.toFixed(2)} cm at {m.va} cm/s → EROA {m.eroa.toFixed(2)} cm², RVol {Math.round(m.rvol)} mL, RF {Math.round(m.rf * 100)}%; vena contracta {(m.vc * 10).toFixed(1)} mm.{' '}
          {m.closeR && m.closeVC ? 'Both on target: severe by every measure.'
            : !m.closeR ? 'The PISA radius is off the aliasing boundary — and because r is squared, small errors become large ones.'
            : 'The vena contracta is the neck, not the spray: measure where the jet is narrowest, just above the orifice.'}
        </div>
      )}
      <ScoreOnce id="s2-quant" pts={pts} max={15} />
      <PulmonaryVein reversal />

      <MultiSelect id="s2-sev" question="Which of his measurements are criteria for SEVERE primary MR?"
        items={[
          { id: 'eroa', label: 'EROA ≥ 0.40 cm²', correct: true, why: 'His is ~0.5.' },
          { id: 'rvol', label: 'Regurgitant volume ≥ 60 mL', correct: true, why: 'His is ~80 mL.' },
          { id: 'rf', label: 'Regurgitant fraction ≥ 50%', correct: true, why: 'Half of each beat goes backwards.' },
          { id: 'vc', label: 'Vena contracta ≥ 7 mm', correct: true, why: 'Measured in two planes.' },
          { id: 'pv', label: 'Systolic reversal in the pulmonary veins', correct: true, why: 'Specific, although AF and a high LA pressure can blunt the S wave without severe MR.' },
          { id: 'flail', label: 'A flail leaflet', correct: true, why: 'A flail almost always means severe MR.' },
          { id: 'loud', label: 'A grade 3/6 murmur', correct: false, why: 'Loudness does not grade severity — some severe jets are quiet.' },
        ]} />

      <Decision id="s2-late" question="⚠️ Edge case: in another Barlow patient the MR is LATE systolic only. The PISA EROA at mid-systole is 0.45 cm². Severe?"
        options={[
          { id: 'rvol', label: 'Not on that number alone: a late-systolic jet leaks for a third of systole, so EROA overstates it — check regurgitant volume (serial PISA, volumetric echo or CMR)', verdict: 'best', points: 10,
            why: 'PISA assumes the orifice is open all through systole. In late-systolic Barlow MR the EROA can look severe while the volume is moderate. Volume, not area, is what loads the ventricle.' },
          { id: 'yes', label: 'Yes — EROA ≥ 0.40 is severe', verdict: 'wrong', points: 0, why: 'A single-frame area misleads when the leak is short. This is how people get operated on for moderate MR.' },
          { id: 'no', label: 'No — late-systolic MR is always mild', verdict: 'wrong', points: 0, why: 'Long, late jets can still be severe. Measure the volume.' },
        ]} />
      <Contrast title="⏱️ holosystolic flail vs late-systolic Barlow MR"
        is={{ h: 'Holosystolic (his flail P2)', points: ['Open orifice from the first moment of systole.', 'PISA EROA and RVol agree.', 'Pansystolic murmur.'] }}
        isnt={{ h: 'Late systolic (billowing only)', points: ['The leak starts after mid-systole as the leaflets overshoot.', 'EROA overstates; RVol tells the truth.', 'Click, then a late murmur that lengthens with Valsalva.'] }} />

      <div className="cs-h2">🚪 The ventricle with a back door</div>
      <p className="cs-p">Play with it: start with “Severe MR, healthy muscle”, then “Him today”. Then find the EF a healthy ventricle would show with his leak.</p>
      <TwoExitVentricle />
      <Decision id="s2-ef" question="With half of each beat escaping into the atrium, what EF would a HEALTHY ventricle show — and what does his 62% mean?"
        options={[
          { id: '70', label: 'About 70% — so 62% means roughly an eighth of the pump strength is already gone', verdict: 'best', points: 10,
            why: 'Ejecting into a low-pressure chamber is easy. A normal muscle with severe MR over-performs; “normal” is therefore abnormal. That is why the threshold is EF ≤ 60%, not ≤ 50%.' },
          { id: '60', label: 'About 60% — so his 62% is perfectly normal', verdict: 'wrong', points: 0, why: 'This is the trap: the healthy EF in severe MR is higher than normal.' },
          { id: '50', label: 'About 50% — the leak lowers the EF', verdict: 'wrong', points: 0, why: 'The leak raises it, by offering an easy exit.' },
        ]} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🚴 Exercise echo, CMR and Holter</div>
        <Table head={['Test', 'Result']} rows={[
          ['Exercise echo', N('Stopped at 10.2 METs (expected ~12) — legs and breath. SPAP 46 → 62 mmHg. MR unchanged. LV contracts well.', 'cs-hi')],
          ['Cardiac MRI', 'RVol 81 mL, RF 49%. Late gadolinium enhancement in the POSTEROMEDIAL papillary muscle and the inferobasal wall. MAD 8 mm.'],
          ['7-day Holter', N('Ventricular ectopy 9% of beats, RBBB-superior-axis; couplets; one 5-beat run of non-sustained VT at 03:12', 'cs-hi')],
          ['Coronary CT', 'Calcium score 0; no stenosis'],
        ]} />
      </div>
      <Decision id="s2-ex" question="What did the exercise test add?"
        options={[
          { id: 'unmask', label: 'It measured what he could not report: a reduced capacity and a pulmonary pressure that climbs on exercise — the valve is already costing him', verdict: 'best', points: 10,
            why: 'Exercise testing unmasks hidden symptoms and adds prognosis. Note: in the 2025 ESC/EACTS guideline the pulmonary-pressure criterion is RESTING SPAP > 50 mmHg; exercise PH supports, rather than by itself triggers, surgery.' },
          { id: 'nothing', label: 'Nothing — he has no symptoms, so the result does not matter', verdict: 'wrong', points: 0, why: 'Measured capacity beats reported capacity, especially in fit people who adapt.' },
          { id: 'sx', label: 'It shows he is symptomatic, so surgery is now class I for symptoms', verdict: 'ok', points: 4, why: 'Some would argue it; most would call it reduced capacity rather than symptoms. Either way it strengthens the case for early repair.' },
        ]} />
      <Decision id="s2-arr" question="🫀⚡ Inferior T inversion, MAD, papillary-muscle scar, 9% papillary ectopy, a run of NSVT. How do you handle the arrhythmic side?"
        options={[
          { id: 'ampv', label: 'Name it — the arrhythmic MVP phenotype; refer to an electrophysiologist; beta-blocker; no competitive endurance racing until assessed; re-evaluate after repair; an ICD is an individual decision, not routine', verdict: 'best', points: 10,
            why: 'The 2022 EHRA consensus defines arrhythmic MVP and lists these risk markers. An ICD is clearly indicated after a VF arrest or sustained VT; for primary prevention it may be considered in selected high-risk patients. Repair can reduce ectopy but does not reliably remove the scar.' },
          { id: 'icd', label: 'Implant an ICD before surgery', verdict: 'ok', points: 4, why: 'Some high-risk patients will get one, but it is not automatic for NSVT and scar; the decision belongs with EP after the full picture.' },
          { id: 'ignore', label: 'Benign ectopy — common in prolapse', verdict: 'wrong', points: 0, why: 'Ectopy with this shape, scar and MAD is the pattern behind sudden deaths in young people with prolapse.' },
        ]} />
      <Contrast title="⚡ arrhythmic MVP vs ordinary prolapse ectopy"
        is={{ h: 'Arrhythmic MVP — red flags', points: ['Bileaflet prolapse, mitral annular disjunction.', 'Inferior T-wave inversion; ectopy from papillary muscles or fascicles.', 'LGE in papillary muscles / inferobasal wall; NSVT; often women, often young.'] }}
        isnt={{ h: 'Ordinary ectopy', points: ['Occasional, monomorphic, outflow-tract (LBBB-inferior) ectopics.', 'No scar, no MAD, normal T waves.', 'Reassure.'] }} />

      <div className="cs-media-row">
        <Figure src={WIKI('Mitralvalve_prolapse.gif')} href={WIKIPAGE('Mitralvalve_prolapse.gif')} alt="Normal mitral valve and mitral valve prolapse" caption="A normal mitral valve beside a prolapsing one." credit="National Heart, Lung, and Blood Institute (NIH) · public domain · Wikimedia Commons" />
        <Video id="7pUBljQ4joY" title="Mitral valve prolapse — echocardiography series (Dr Ankur K. Chaudhari)" />
      </div>
      <Video id="S7z5qpNmluY" title="Quantifying mitral regurgitation using the PISA method" />
    </>
  );
}

/* ============================================================
   3 · THE HEART TEAM — WHEN, WHERE, WHO
   ============================================================ */

function HeartTeam() {
  const { answers, answer } = useCase();
  const r = answers['s3-refer'];
  const pts = r == null ? null : r === NOW ? 12 : r === NOW + 1 ? 4 : 0;
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>👥 Heart team · day 28</div>
        <Table head={['', 'Finding']} rows={[
          ['Lesion', 'Severe primary MR, Carpentier II: flail P2, billowing A2 and P3 (Barlow)'],
          ['Ventricle', 'LVESD 39 mm (19.7 mm/m²), EF 62% — just inside the lines, and moving towards them'],
          ['Atrium · lungs', 'LAVI 64 mL/m²; SPAP 46 at rest, 62 on exercise; sinus rhythm'],
          ['Surgical risk', 'STS predicted mortality 0.4%; no coronary disease'],
          ['Repairability', 'Reference-centre surgeons: likelihood of durable repair > 95%'],
          ['His words', '“I feel fine. I want to fly until I’m 65 — and I want to keep running.”'],
        ]} />
      </div>
      <div className="cs-h2">📈 His echoes since 2019</div>
      <p className="cs-p">Step through each visit and read what the 2025 ESC/EACTS guideline says at that point. Then switch on “If we wait…” and see the next two years. Place the referral.</p>
      <SurveillanceTrend visits={VISITS} now={NOW} referred={r} onRefer={i => answer('s3-refer', i)} />
      {r != null && (
        <div className={'cs-fb ' + (r === NOW ? 'best' : r === NOW + 1 ? 'ok' : 'wrong')}>
          {r === NOW ? 'Today. One guideline criterion (the atrium), a ventricle drifting toward both lines, a pressure that climbs on exercise and a flail that will not heal — in a low-risk man with a repairable valve. Repair now restores a normal life expectancy.'
            : r === NOW + 1 ? 'In 2027 the indication is class I — because the ventricle has crossed into dysfunction and AF has begun. You waited for proof of damage.'
            : 'In 2028 he is symptomatic, in persistent AF, with an EF of 53%. The repair will fix the valve; much of the damage will stay.'}
        </div>
      )}
      <ScoreOnce id="s3-refer" pts={pts} max={12} />

      <Why title="⏳ Why “wait for symptoms” is the mistake"
        chain={[
          { k: 'SYMPTOMS ARE LATE', t: 'In chronic MR they appear when the LA pressure finally rises — after years of remodelling.' },
          { k: 'DAMAGE IS EARLY', t: 'Contractility starts to fall while the EF still reads normal.' },
          { k: 'PARTLY PERMANENT', t: 'After late surgery the EF often falls further and the LV may not shrink back; AF may persist.' },
          { k: 'SURVIVAL', t: 'Repair before these markers — in a centre that repairs reliably — gives a life expectancy like the general population’s. After them, it does not.' },
        ]}>
        You are not operating on his symptoms. You are operating on his next twenty years.
      </Why>

      <Decision id="s3-plan" question="The recommendation to him?"
        options={[
          { id: 'early', label: 'Early surgical repair now, in a Heart Valve Centre with a high repair rate', verdict: 'best', points: 10,
            why: 'Class IIa in the 2025 ESC/EACTS guideline for low-risk asymptomatic patients with a likely durable repair and an additional criterion (his LA ≥ 60 mL/m²). His trajectory, exercise data and flail make the case stronger still. ACC/AHA also support early repair at a comprehensive valve centre when the repair likelihood is > 95% and mortality < 1%.' },
          { id: 'watch', label: 'Six-monthly echo; operate when LVESD reaches 40 mm or EF 60%', verdict: 'ok', points: 3,
            why: 'Defensible on paper, and some teams do it — but he is one millimetre and two points away, his visits have slipped before, and the flail will not improve.' },
          { id: 'sx', label: 'Wait for symptoms', verdict: 'wrong', points: 0, why: 'The commonest way to turn a curable valve into a damaged heart.' },
          { id: 'teer', label: 'TEER (MitraClip) — avoid surgery', verdict: 'wrong', points: 0,
            why: 'TEER is for patients at high or prohibitive surgical risk. In a low-risk 52-year-old, surgical repair is more complete and more durable.' },
        ]} />
      <Decision id="s3-where" question="Where should he have it?"
        options={[
          { id: 'centre', label: 'A reference centre with high mitral repair volume and published repair rates > 95% for degenerative MR', verdict: 'best', points: 10,
            why: 'Repair rates and durability rise with surgeon and centre volume. In low-volume units, repairable valves are more often replaced. For an early operation on an asymptomatic patient, the expected repair rate is the whole point.' },
          { id: 'local', label: 'The nearest cardiac unit, to keep it simple', verdict: 'wrong', points: 2, why: 'The nearest unit may replace a valve that could have been repaired — a war story below.' },
          { id: 'any', label: 'Wherever has the shortest waiting list', verdict: 'wrong', points: 0, why: 'Speed matters less than the repair rate for this patient.' },
        ]} />
      <Contrast title="🔧 repair vs replacement in degenerative MR"
        is={{ h: 'Repair', points: ['Keeps his own leaflets and the chords that hold the LV in shape.', 'No long-term anticoagulation.', 'Durable for decades; lower operative mortality; near-normal survival.'] }}
        isnt={{ h: 'Replacement', points: ['Mechanical: lifelong warfarin — and for a pilot, an anticoagulant changes everything.', 'Biological: degenerates, especially in the young.', 'Loss of the subvalvular apparatus if not preserved: worse LV function.'] }} />
      <Contrast title="🗜️ surgical repair vs TEER for primary MR"
        is={{ h: 'Surgical repair (him)', points: ['Low and intermediate surgical risk.', 'Complete correction: neochords, resection, a ring.', 'The standard for durability.'] }}
        isnt={{ h: 'TEER', points: ['High or prohibitive surgical risk, suitable anatomy.', 'Some residual MR is common; no ring.', 'Case 02: an 82-year-old with a redo sternotomy.'] }} />

      <Decision id="s3-talk" question="He asks: “Why would I let you open my chest when I feel fine?”"
        options={[
          { id: 'honest', label: '“Because your heart is compensating, not healthy. The tests show it starting to strain. Repaired now, in expert hands, the chance of fixing your own valve is over 95% and your outlook becomes that of any 52-year-old. If we wait for symptoms, some of the damage stays.”', verdict: 'best', points: 10,
            why: 'Answers his real question with his own data, gives the benefit and the alternative, and is honest about the trade. Then cover the risks, and that the aviation authority will decide on his return to flying after recovery.' },
          { id: 'scare', label: '“You could die suddenly any day if you don’t.”', verdict: 'wrong', points: 0, why: 'Untrue for the valve and coercive; the arrhythmic risk is real but separate, and is being handled.' },
          { id: 'up', label: '“It’s up to you — we can just watch.”', verdict: 'ok', points: 3, why: 'Respects autonomy but withholds your recommendation. Shared decisions need a recommendation to share.' },
        ]} />
      <Video id="L_8pDi0pEmE" title="Mitral regurgitation pathophysiology" />
    </>
  );
}

/* ============================================================
   4 · PLANNING — THE MAP AND THE RING
   ============================================================ */

function Planning() {
  const { answers, answer } = useCase();
  const map = answers['s4-map'];
  const ring = answers['s4-ring'];
  const mapPts = map == null ? null : Math.round(map.correct / 6 * 8) + (map.flailRight ? 4 : 0);
  const ringPts = ring == null ? null : ring.good ? 15 : ring.sam === 'high' ? 3 : 8;
  return (
    <>
      <div className="cs-h2">🗺️ Name the segments — 3D TOE</div>
      <p className="cs-p">The 3D machine hands you the valve in whatever orientation it likes. Rotate it into the surgeon’s view — aortic valve at 12 o’clock, left atrial appendage at 9 — then mark each segment on the blank map: normal, billowing or flail.</p>
      <MitralMap truth={SEG_TRUTH} done={map} onSubmit={r => answer('s4-map', r)} />
      {map && (
        <div className={'cs-fb ' + (map.correct === 6 ? 'best' : 'ok')}>
          {map.correct === 6 ? 'Exact: flail P2 on torn chords, billowing A2 and P3 — classic Barlow, with one scallop torn.'
            : map.flailRight ? 'The flail is right; one or more billowing segments missed or over-called. Billowing is the body of the leaflet bulging — the edges still meet.'
            : 'Re-orient: P1 sits next to the appendage, P3 next to the medial commissure, and A2 faces P2 across the middle.'}
        </div>
      )}
      <ScoreOnce id="s4-map" pts={mapPts} max={12} />
      <Contrast title="🎈 billowing vs flail"
        is={{ h: 'Billowing / prolapse', points: ['The body of the leaflet bulges above the annulus.', 'The free edges still meet (billowing) or slip slightly past each other (prolapse).', 'Often leave alone, or support with chords.'] }}
        isnt={{ h: 'Flail', points: ['A torn chord: the free edge points INTO the atrium.', 'No coaptation at that scallop: severe MR.', 'Must be fixed — neochords or resection.'] }} />
      <Decision id="s4-carp" question="Carpentier classification of his valve?"
        options={[
          { id: 'ii', label: 'Type II — excessive leaflet motion', verdict: 'best', points: 8, why: 'Billowing and flail: the edges overshoot the annular plane.' },
          { id: 'i', label: 'Type I — normal motion (annular dilatation, perforation)', verdict: 'wrong', points: 0, why: 'His annulus is large, but the lesion is leaflet motion.' },
          { id: 'iiib', label: 'Type IIIb — systolic restriction (tethering)', verdict: 'wrong', points: 0, why: 'That is secondary MR from a remodelled LV — Case 05.' },
        ]} />

      <div className="cs-h2">🧮 The ring and the geometry of SAM</div>
      <Why title="🌀 Why a repaired valve can obstruct its own outflow"
        chain={[
          { k: 'TOO MUCH TISSUE', t: 'Barlow leaflets are tall. A tall posterior leaflet pushes the coaptation point forward.' },
          { k: 'SMALL RING', t: 'A small ring pulls the posterior annulus toward the anterior: the coaptation point moves toward the septum.' },
          { k: 'SLACK TIP', t: 'The spare anterior leaflet beyond the coaptation point now lies in the outflow stream.' },
          { k: 'DRAG', t: 'In systole the flow catches the slack tip and pushes it into the septum: systolic anterior motion.' },
          { k: 'OBSTRUCTION + MR', t: 'The outflow tract narrows, and the leaflet pulled away leaves a posteriorly directed jet.' },
        ]} />
      <MultiSelect id="s4-risk" question="Which of his pre-repair features raise the risk of SAM?"
        items={[
          { id: 'pl', label: 'A tall posterior leaflet (24 mm)', correct: true, why: 'Pushes coaptation anteriorly.' },
          { id: 'ratio', label: 'AL/PL height ratio 1.33 (anterior 32 mm)', correct: true, why: 'Below ~1.3–1.5 the risk climbs.' },
          { id: 'csept', label: 'Coaptation-to-septum distance 24 mm', correct: true, why: 'Under ~25 mm is a classic marker.' },
          { id: 'sept', label: 'A basal septal bulge (13 mm)', correct: true, why: 'Narrows the outflow tract to begin with.' },
          { id: 'angle', label: 'A narrow aorto-mitral angle', correct: true, why: 'Points the outflow stream at the anterior leaflet.' },
          { id: 'biglv', label: 'His dilated LV (LVEDD 60 mm)', correct: false, why: 'Protective: a big ventricle leaves more room. A small, hyperdynamic LV is the risk.' },
        ]} />
      <p className="cs-p">Now plan it. Choose a ring size and how tall the posterior leaflet will be left after repair (by neochords that set the coaptation point deep, or by resection and sliding plasty). Aim for low SAM risk, coaptation ≥ 8 mm and a mean gradient &lt; 5 mmHg.</p>
      <RingPlanner done={ring} onLock={mm => answer('s4-ring', mm)} />
      {ring && (
        <div className={'cs-fb ' + (ring.good ? 'best' : ring.sam === 'high' ? 'wrong' : 'ok')}>
          Ring {ring.ring} mm, posterior leaflet {ring.plh} mm: C-sept {ring.csept.toFixed(0)} mm, AL/PL {ring.ratio.toFixed(2)}, coaptation {ring.coapt.toFixed(0)} mm, gradient {ring.grad.toFixed(1)} mmHg — SAM risk {ring.sam}.{' '}
          {ring.good ? 'A large, true-sized ring and a short posterior leaflet: the coaptation point sits deep and back.'
            : ring.sam === 'high' ? 'A small ring and a tall posterior leaflet: the set-up for SAM. Barlow valves need a big ring.'
            : ring.coapt < 8 ? 'Too little coaptation: residual MR.' : ring.grad >= 5 ? 'Too small: you have traded MR for stenosis.' : 'Borderline: move the coaptation point further from the septum.'}
        </div>
      )}
      <ScoreOnce id="s4-ring" pts={ringPts} max={15} />
      <Decision id="s4-tech" question="Which repair strategy for his valve?"
        options={[
          { id: 'respect', label: 'Respect rather than resect: neochords (PTFE loops) to P2, leave the billowing A2 and P3 alone unless they leak, a complete true-sized (large) ring', verdict: 'best', points: 10,
            why: 'Neochords restore the flail edge to the right height without removing tissue; the coaptation point is set deep. In Barlow disease the ring is sized to the anterior leaflet and is large — never downsized.' },
          { id: 'resect', label: 'Triangular or quadrangular resection of P2 with sliding plasty, then a large ring', verdict: 'ok', points: 6,
            why: 'A proven technique with excellent long-term results, and sliding plasty lowers the posterior leaflet height — but more steps and less tissue to spare.' },
          { id: 'down', label: 'Downsize the ring by two sizes to guarantee coaptation', verdict: 'wrong', points: 0,
            why: 'Downsizing is for secondary (functional) MR. In Barlow it pushes the coaptation point anteriorly — SAM.' },
          { id: 'mvr', label: 'Replace the valve — Barlow is too complex', verdict: 'wrong', points: 0, why: 'In a reference centre, Barlow valves are repaired with high success.' },
        ]} />
      <Contrast title="💍 ring sizing: degenerative vs functional MR"
        is={{ h: 'Degenerative (Barlow) — true-size, large', points: ['Measure the anterior leaflet height and intertrigonal distance.', 'Too much tissue is the problem — a big ring keeps coaptation away from the septum.', 'Undersizing invites SAM.'] }}
        isnt={{ h: 'Functional (ischaemic) — restrictive, small', points: ['Leaflets normal but tethered; annulus dilated.', 'Undersizing brings the edges together.', 'Recurrence comes from the ventricle, not the ring.'] }} />
      <div className="cs-media-row">
        <Figure src={WIKI('Mitral_Valve_Prolapse.png')} href={WIKIPAGE('Mitral_Valve_Prolapse.png')} alt="Illustration of mitral valve prolapse" caption="Prolapse: a leaflet segment bulging into the left atrium." credit="BruceBlaus · CC BY-SA 4.0 · Wikimedia Commons" />
        <Video id="NUUllKPvqQ4" title="Echocardiography: LVOT obstruction & SAM" />
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🌅 07:30 · day 56</span>Theatre 2. Right mini-thoracotomy planned. His rota is cleared for three months.</p>
      </div>
      <MultiSelect id="s5-check" question="Before knife to skin — what must be done?"
        items={[
          { id: 'dent', label: 'Dental review and treatment of any sepsis weeks before', correct: true, why: 'He is about to receive prosthetic material in his bloodstream for life. Mouths seed rings.' },
          { id: 'cor', label: 'Coronary assessment (here, a CT coronary angiogram)', correct: true, why: 'Recommended before valve surgery in men > 40 or with risk factors; his calcium score is 0.' },
          { id: 'ct', label: 'CT of the aorta and iliac arteries for femoral cannulation', correct: true, why: 'Minimally invasive bypass runs retrograde through the femoral artery: calcified or tortuous iliacs mean a different route.' },
          { id: 'dlt', label: 'Double-lumen tube or bronchial blocker for right-lung isolation', correct: true, why: 'The right lung must be down to see through a small incision.' },
          { id: 'pads', label: 'External defibrillator pads before draping', correct: true, why: 'Internal paddles do not fit through a mini-thoracotomy — and he has an arrhythmic substrate.' },
          { id: 'toe', label: 'Intraoperative TOE, with the segment map and planned ring size on the screen', correct: true, why: 'The echocardiographer guides the surgeon before and after bypass.' },
          { id: 'consent', label: 'Consent includes conversion to sternotomy and the possibility of replacement', correct: true, why: 'Unlikely, but he must have agreed in advance.' },
          { id: 'iabp', label: 'A prophylactic intra-aortic balloon pump', correct: false, why: 'No indication in a low-risk patient with a good ventricle — and it would make SAM worse.' },
        ]} />
      <Sequence id="s5-seq" question="Put the operation in order."
        steps={[
          { label: 'Femoral cannulation; start cardiopulmonary bypass; vent the heart', why: 'Bypass first: the heart must be still and empty.' },
          { label: 'Cross-clamp the aorta; give cardioplegia', why: 'Arrest and protect the myocardium.' },
          { label: 'Left atriotomy through Sondergaard’s groove; analyse the valve segment by segment', why: 'Confirm the TOE map with a nerve hook.' },
          { label: 'Neochord loops from the papillary heads to the flail P2; set their length', why: 'Fix the lesion first.' },
          { label: 'Saline test: fill the LV, read the coaptation line', why: 'Adjust before committing to the ring.' },
          { label: 'Size and implant the annuloplasty ring', why: 'Stabilise the repair and remodel the annulus.' },
          { label: 'Close the atrium, de-air, remove the clamp, wean from bypass; TOE assessment', why: 'The proof is the post-bypass TOE.' },
        ]} />
      <Why title="🫧 Why de-airing matters so much in mitral surgery"
        chain={[
          { k: 'OPEN LEFT HEART', t: 'The left atrium was opened; air sits in the pulmonary veins, LA and LV apex.' },
          { k: 'EJECTION', t: 'When the heart beats again, air leaves through the aorta.' },
          { k: 'ANTERIOR CORONARY', t: 'The right coronary ostium faces upward in a supine patient: bubbles float into it.' },
          { k: 'RV STUNNING', t: 'Inferior ST elevation and a failing RV at weaning — or air in the brain.' },
        ]}>
        So: CO₂ in the field, venting, TOE watching for bubbles, and patience before coming off bypass.
      </Why>
      <Contrast title="🔬 minimally invasive/robotic vs sternotomy"
        is={{ h: 'Right mini-thoracotomy / robotic', points: ['Smaller incision, less bleeding, faster return to work.', 'Peripheral cannulation, lung isolation, longer clamp times early in a programme.', 'Best results in experienced, high-volume hands.'] }}
        isnt={{ h: 'Sternotomy', points: ['Universal access; the safest choice for complex or combined surgery.', 'Longer recovery; sternal precautions for weeks.', 'Repair quality must be identical — the incision is secondary.'] }} />
      <div className="cs-media-row">
        <Video id="GYAmSH2zwic" title="Robot-assisted minimally invasive mitral valve repair at Mayo Clinic" />
        <Video id="VrIxRfWDOm8" title="Robotic mitral valve repair surgery — animation" />
      </div>
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
      <Decision id="s6-a2" question="Pre-bypass TOE: A2 billows above the annulus but its edge meets P2’s neighbours. The fellow suggests resecting part of the anterior leaflet. You…"
        options={[
          { id: 'leave', label: 'Leave A2 alone: billowing with preserved coaptation does not need surgery — and anterior resection is hazardous', verdict: 'best', points: 10,
            why: 'Fix what leaks. The anterior leaflet is the main sealing surface; cutting it risks a valve that cannot close. Once the ring and P2 chords are in, the A2 billow usually stops mattering.' },
          { id: 'resect', label: 'Resect a triangle of A2', verdict: 'wrong', points: 0, why: 'Removing anterior tissue that is not leaking is a classic way to turn a repair into a replacement.' },
          { id: 'chords', label: 'Add a neochord to A2 just in case', verdict: 'ok', points: 4, why: 'Reasonable if the saline test shows A2 leaking — not before.' },
        ]} />
      {answers['s6-a2'] && <Note kind="pearl" title="🔀 Consequence">The P2 chords are in, first saline test: competent, but a small leak at the P2–P3 junction where P3 billows.</Note>}
      <Decision id="s6-p3" question="A small leak at the P2–P3 indentation on the saline test. Next move?"
        options={[
          { id: 'loop', label: 'Add one neochord loop to the P3 edge beside the cleft, retest', verdict: 'best', points: 10,
            why: 'Indentation leaks are common in Barlow. One more loop, or closing a deep cleft, usually seals it. Retest before the ring.' },
          { id: 'ring', label: 'Ignore it — the ring will fix it', verdict: 'ok', points: 3, why: 'Sometimes true, but a leak you can see on the bench usually stays after bypass.' },
          { id: 'mvr', label: 'Convert to replacement', verdict: 'wrong', points: 0, why: 'A tiny, fixable leak is no reason to give up the repair.' },
        ]} />
      {answers['s6-p3'] && <Note kind="pearl" title="🔀 Consequence">One more loop; the indentation is sealed on retest. Now the P2 loops need their final length — your job in the next stage.</Note>}
      <Decision id="s6-accept" question="Hypothetically: after bypass, the TOE showed MODERATE residual MR. What is the rule?"
        options={[
          { id: 'back', label: 'Go back on bypass and re-repair (or replace): do not leave theatre with more than mild MR', verdict: 'best', points: 10,
            why: 'Residual moderate MR after repair predicts failure and reoperation. The second run costs half an hour; the reoperation costs far more.' },
          { id: 'accept', label: 'Accept it; it may improve as the heart recovers', verdict: 'wrong', points: 0, why: 'Residual MR after repair tends to get worse, not better.' },
        ]} />
      <Why title="🧵 Why repair beats replacement for the ventricle"
        chain={[
          { k: 'CHORDS ARE STRUTS', t: 'The chords tie the annulus to the papillary muscles and the LV wall.' },
          { k: 'GEOMETRY', t: 'They keep the ventricle elliptical and help it contract efficiently.' },
          { k: 'CUT THEM', t: 'A replacement that removes the apparatus lets the LV become spherical: EF falls.' },
          { k: 'KEEP THEM', t: 'Repair preserves them — one reason why survival after repair is better.' },
        ]} />
      <Contrast title="🧪 the saline test vs the post-bypass TOE"
        is={{ h: 'Saline test (arrested heart)', points: ['A pressurised, still LV: shows prolapse and gross leaks.', 'Quick and repeatable on the clamp.', 'Cannot show SAM or the gradient.'] }}
        isnt={{ h: 'Post-bypass TOE (beating heart)', points: ['Real loading: residual MR, gradient, SAM, LV function.', 'The final verdict on the repair.', 'Must be read with normal filling and no excess inotropes.'] }} />
    </>
  );
}

/* ============================================================
   7 · THE REPAIR
   ============================================================ */

function Repair() {
  const { answers, answer, setVitals } = useCase();
  const plan = answers['s4-ring'] || ringModel(36, 15);
  const r = answers['s7-repair'];
  const grade = !r ? null : r.residual === 'none / trace' && r.sam !== 'high' && r.grad < 5 ? 'best' : r.residual === 'moderate' || r.sam === 'high' ? 'wrong' : 'ok';
  return (
    <>
      <p className="cs-p">The clamp is on; the pump holds a mean pressure of about 65 mmHg. Place the neochord loops on the flail P2, anchor them, set their length, test with saline as often as you need — each test costs clamp time — then put in your planned {plan.ring} mm ring and come off bypass.</p>
      <RepairBench ring={plan} done={r} onResult={res => { answer('s7-repair', res); setVitals({ hr: 88, sys: 108, dia: 62, spo2: 100 }); }} />
      {r && (
        <div className={'cs-fb ' + grade}>
          {r.loops} loop{r.loops > 1 ? 's' : ''}, {r.split === 'both' ? 'split between both papillary heads' : 'all to one head'}, {r.len} mm; cross-clamp {r.clamp} min.
          Post-bypass TOE: residual MR {r.residual}, mean gradient {r.grad.toFixed(1)} mmHg, C-sept {r.csept.toFixed(0)} mm, SAM risk {r.sam}.{' '}
          {grade === 'best' ? 'A competent, unobstructed valve with deep coaptation.'
            : r.residual === 'moderate' ? 'Moderate residual MR — remember the rule: back on bypass.'
            : r.sam === 'high' ? 'The geometry is set for SAM — and tonight it will be tested.' : 'A good repair with a little to spare.'}
        </div>
      )}
      <ScoreOnce id="s7-repair" pts={r == null ? null : grade === 'best' ? 20 : grade === 'ok' ? 10 : 3} max={20} />
      {r && (
        <>
          <div className="cs-card">
            <div className="cs-h2" style={{ marginTop: 0 }}>🩻 Post-bypass TOE · 11:52</div>
            <Table head={['', 'Finding']} rows={[
              ['Residual MR', r.residual], ['Mean gradient', N(`${r.grad.toFixed(1)} mmHg at HR 88`)],
              ['Coaptation length', N(`${plan.coapt.toFixed(0)} mm`)], ['LVOT', 'Laminar at normal filling, no inotropes'],
              ['LV', 'Small and hyperdynamic now the leak is gone — EF 55% (the back door is shut)'],
            ]} />
          </div>
          <Decision id="s7-inot" question="Weaning: pressure 92/55, the LV looks small and vigorous. The anaesthetic trainee reaches for adrenaline “to help the heart”. You say…"
            options={[
              { id: 'vol', label: '“Volume first — the ventricle is empty, not weak. No adrenaline; it could pull the anterior leaflet into the outflow.”', verdict: 'best', points: 10,
                why: 'A small, hyperdynamic LV after a Barlow repair is the substrate for SAM. Fill it, keep the rate down, support the pressure with a vasoconstrictor if needed.' },
              { id: 'adr', label: '“Fine, a little adrenaline.”', verdict: 'wrong', points: 0, why: 'Hold this thought for tonight.' },
              { id: 'dob', label: '“Dobutamine instead — it’s gentler.”', verdict: 'wrong', points: 2, why: 'Still an inotrope and a vasodilator: both feed SAM.' },
            ]} />
          <Why title="📉 Why the EF falls after a perfect repair"
            chain={[
              { k: 'BACK DOOR SHUT', t: 'The LV can no longer empty into the low-pressure atrium.' },
              { k: 'ALL FORWARD', t: 'Every millilitre must now go into the aorta, against full systemic pressure.' },
              { k: 'TRUE EF', t: 'The EF drops — 62% to ~55% — revealing the muscle’s true strength.' },
              { k: 'NOT FAILURE', t: 'Expected, usually recovers in months: proof that the pre-op 62% was flattered.' },
            ]} />
        </>
      )}
      <div className="cs-media-row" style={{ marginTop: 12 }}>
        <Video id="t9FpQ_wSVD4" title="Mitral valve repair surgery — cardiac animation" />
        <Figure src={WIKI('Mitral_Regurgitation_scheme1.png')} href={WIKIPAGE('Mitral_Regurgitation_scheme1.png')} alt="Diagram of mitral regurgitation" caption="What the repair abolishes: systolic flow back from the left ventricle into the left atrium." credit="Wikimedia Commons (see file page for licence)" />
      </div>
      <CaseLibrary title="Mitral repair in real cases" channels={REPAIR_SEARCHES}>
        Watch for the segment analysis, the neochord loops, the saline test and the ring — and the post-bypass TOE that decides whether the patient leaves theatre.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   8 · BACK ON THE UNIT — ICU
   ============================================================ */

function Recovery() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🛏️ 14:00</span>Cardiac ICU, bed 4. Ventilated, warm, on 0.04 µg/kg/min noradrenaline. Atrial and ventricular epicardial wires, two chest drains. Sinus 92 with occasional ventricular ectopics.</p>
      </div>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>📋 Arrival checks</div>
        <Table head={['', 'Value']} rows={[
          ['Drains', N('110 mL in the first hour')], ['ACT · platelets', N('128 s · 142 ×10⁹/L')], ['Haemoglobin', N('112 g/L')],
          ['Potassium · magnesium', N('3.7 mmol/L · 0.74 mmol/L', 'cs-hi')], ['Lactate', N('1.6 mmol/L')], ['Temperature', N('36.4 °C')],
        ]} />
      </div>
      <Decision id="s8-k" question="Ectopics on the monitor, K⁺ 3.7, Mg²⁺ 0.74, in a man with arrhythmic MVP. First move?"
        options={[
          { id: 'lytes', label: 'Replace potassium to ~4.5 mmol/L and magnesium (e.g. 2 g IV) through the central line; watch the telemetry', verdict: 'best', points: 10,
            why: 'Hypokalaemia and hypomagnesaemia after bypass and diuresis lower the threshold for ectopy and VT — doubly important on his substrate. Many units aim for K⁺ 4.5–5.0 after cardiac surgery.' },
          { id: 'amio', label: 'Start amiodarone straight away', verdict: 'ok', points: 3, why: 'Possibly later; correct the electrolytes first.' },
          { id: 'none', label: 'Nothing — ectopics are normal after surgery', verdict: 'wrong', points: 0, why: 'Common, yes; but correct what is correctable, especially in him.' },
        ]} />
      <Decision id="s8-at" question="Antithrombotic therapy after his ring repair (sinus rhythm)?"
        options={[
          { id: 'asp', label: 'Low-dose aspirin for the first 3 months; anticoagulate instead only if AF or another indication appears', verdict: 'best', points: 10,
            why: 'The ring is foreign material that endothelialises over about 3 months. Guidelines allow low-dose aspirin or a VKA for those months after mitral repair; evidence is limited and practice varies.' },
          { id: 'vka', label: 'Warfarin (INR 2.5) for 3 months', verdict: 'ok', points: 8, why: 'Also accepted by guidelines; more bleeding, more monitoring. Choose by bleeding risk and local practice.' },
          { id: 'dapt', label: 'Dual antiplatelet therapy for 12 months', verdict: 'wrong', points: 0, why: 'That is a coronary stent regimen.' },
          { id: 'life', label: 'Lifelong warfarin — he has a valve operation', verdict: 'wrong', points: 0, why: 'Only mechanical valves need lifelong anticoagulation; avoiding that is a reason we repair.' },
        ]} />
      <MultiSelect id="s8-watch" question="What will you watch through his first night — and why?"
        items={[
          { id: 'drain', label: 'Drain output hourly (> 200 mL/h is a warning)', correct: true, why: 'Bleeding after bypass: heparin, platelet dysfunction, cold — and hypovolaemia is the enemy of this repair.' },
          { id: 'fill', label: 'Filling: CVP trend, urine, the look of the LV on echo', correct: true, why: 'An under-filled, hyperdynamic LV is the set-up for SAM.' },
          { id: 'tele', label: 'Telemetry for NSVT', correct: true, why: 'His substrate did not leave with the leak.' },
          { id: 'af', label: 'Post-operative AF (peaks on days 2–3)', correct: true, why: 'A third of patients after valve surgery; restart his beta-blocker when stable.' },
          { id: 'pace', label: 'Epicardial pacing thresholds', correct: true, why: 'Mitral surgery sits near the AV node and circumflex artery.' },
          { id: 'cxr', label: 'A daily chest X-ray to grade the valve', correct: false, why: 'X-rays show lines and lungs, not valves. Echo does.' },
        ]} />
      <Why title="💧 Why hypovolaemia is more dangerous after THIS repair"
        chain={[
          { k: 'EMPTY LV', t: 'Bleeding and diuresis shrink the ventricle.' },
          { k: 'NARROW LVOT', t: 'A smaller cavity brings the septum and the anterior leaflet closer.' },
          { k: 'FAST FLOW', t: 'Tachycardia and catecholamines accelerate outflow.' },
          { k: 'SAM', t: 'The slack anterior leaflet is dragged into the outflow — obstruction, then hypotension.' },
        ]} />
      <Contrast title="📟 post-op AF vs arrhythmic-MVP ectopy"
        is={{ h: 'Post-operative AF', points: ['Days 2–3; inflammation, atrial stretch, catecholamines.', 'Rate or rhythm control; anticoagulate if it persists (> 48 h) per bleeding risk.', 'Often resolves within weeks.'] }}
        isnt={{ h: 'His ventricular ectopy / NSVT', points: ['From scarred papillary muscles — present before surgery.', 'Electrolytes, beta-blocker, EP follow-up; Holter and CMR after recovery.', 'May persist despite a perfect repair.'] }} />
    </>
  );
}

/* ============================================================
   9 · THE NIGHT: SAM
   ============================================================ */

function Crisis() {
  const { answers, answer } = useCase();
  const plan = answers['s4-ring'];
  const r = answers['s9-sam'];
  const pts = r == null ? null : r.fixed ? Math.max(6, 20 - 6 * r.wrong) : 2;
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p"><span className="cs-time" style={{ color: 'var(--red)' }}>🚨 21:40</span>
          Extubated at 18:00. Drains 230 then 260 mL in the last two hours; urine brisk on furosemide given at 19:00. Pressure drifting down to 82/50. The night registrar started adrenaline at 0.08 µg/kg/min “for low output”.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>21:55</span>
          Worse: 64/38, heart rate 126, SpO₂ 91%, a new loud systolic murmur at the left sternal edge. The registrar is drawing up more adrenaline.</p>
      </div>
      <BedsideMonitor />
      <Decision id="s9-dx" question="Bedside echo: a small, hyperdynamic LV, the anterior leaflet touching the septum in systole, turbulence in the outflow tract, a posteriorly directed MR jet. What is this?"
        options={[
          { id: 'sam', label: 'Systolic anterior motion with dynamic LVOT obstruction — provoked by hypovolaemia and adrenaline', verdict: 'best', points: 10,
            why: plan?.sam === 'high' ? `Your plan left a C-sept distance of ${plan.csept.toFixed(0)} mm — the geometry for SAM; tonight's loading conditions set it off.` : 'Even a well-planned Barlow repair can show SAM when the ventricle is empty, fast and whipped by catecholamines.' },
          { id: 'tamp', label: 'Tamponade from bleeding', verdict: 'ok', points: 3, why: 'Must be excluded after cardiac surgery with high drain losses — but the echo shows no collection and explains everything else.' },
          { id: 'fail', label: 'Low output from LV failure', verdict: 'wrong', points: 0, why: 'The LV is small and vigorous. Treating “failure” with inotropes is what is killing him.' },
          { id: 'repair', label: 'The repair has failed — a chord has broken', verdict: 'wrong', points: 0, why: 'The MR is posteriorly directed and comes with an outflow gradient: SAM pulls the anterior leaflet away.' },
        ]} />
      <Why title="🔄 Why the drug you reached for makes him worse"
        chain={[
          { k: 'ADRENALINE', t: 'More contractility and a faster rate: the LV empties further, faster.' },
          { k: 'SMALLER CAVITY', t: 'The outflow tract narrows; outflow velocity rises.' },
          { k: 'MORE DRAG', t: 'The faster jet pushes the anterior leaflet harder into the septum.' },
          { k: 'LOWER BP', t: 'Obstruction worsens and pressure falls — which tempts more adrenaline.' },
        ]}>
        The fix is the opposite: fill the ventricle, slow it, and squeeze the arteries — not the heart.
      </Why>
      <div className="cs-h2">🎛️ Treat him — the gradient answers every move</div>
      <SamCrisis done={r} onResult={res => answer('s9-sam', res)} />
      {r && (
        <div className={'cs-fb ' + (r.fixed && r.wrong === 0 ? 'best' : r.fixed ? 'ok' : 'wrong')}>
          {r.steps} actions, {r.wrong} harmful. Final LVOT gradient {r.grad} mmHg, systolic {r.sys}.{' '}
          {r.fixed && r.wrong === 0 ? 'Textbook: stop the inotrope, fill, slow, constrict.'
            : r.fixed ? 'Fixed — after detours that cost him pressure. Every inotrope or dilator deepened the obstruction.'
            : 'Still obstructed. Stop the adrenaline, give volume, phenylephrine, a beta-blocker.'}
        </div>
      )}
      <ScoreOnce id="s9-sam" pts={pts} max={20} />
      <Contrast title="⚖️ SAM vs LV failure after mitral repair"
        is={{ h: 'SAM / LVOT obstruction', points: ['Small, hyperdynamic LV; anterior leaflet in the outflow; dagger-shaped LVOT Doppler.', 'Worse with inotropes, vasodilators, hypovolaemia, tachycardia.', 'Better with volume, phenylephrine, beta-blockade, a slower rate.'] }}
        isnt={{ h: 'LV failure / low output', points: ['Dilated, poorly contracting LV; no outflow gradient.', 'Better with inotropes and afterload reduction.', 'The same drugs, opposite effect: echo before you treat.'] }} />
      <Decision id="s9-bleed" question="SAM controlled: gradient 18, pressure 112/64. But the drains are still 240 mL/h. Now?"
        options={[
          { id: 'reex', label: 'Check clotting (ROTEM/ACT, platelets, fibrinogen) and correct it; call the surgeon — re-explore if bleeding stays > 200 mL/h', verdict: 'best', points: 10,
            why: 'The bleeding emptied the ventricle that started all this. Persistent losses after correction of coagulopathy mean surgical bleeding: return to theatre before tamponade or massive transfusion.' },
          { id: 'fluid', label: 'Keep giving fluid to match the losses overnight', verdict: 'ok', points: 3, why: 'Keeps him filled for now, but does not stop the leak — and dilutes his clotting.' },
          { id: 'tran', label: 'Tranexamic acid and wait until morning', verdict: 'wrong', points: 0, why: 'Hours of > 200 mL/h is a surgical problem until proven otherwise.' },
        ]} />
      <Decision id="s9-def" question="Day 1, after re-exploration for a bleeding atriotomy stitch: normal filling, no inotropes, TTE shows no SAM, gradient 3, C-sept 29 mm. The definitive plan?"
        options={[
          { id: 'medical', label: 'No reoperation for the valve: keep him filled, avoid inotropes, restart a beta-blocker; re-image before discharge. Back on bypass only if SAM persists at rest with normal loading.', verdict: 'best', points: 10,
            why: 'Most post-repair SAM is dynamic and settles with correct loading. Persistent SAM at rest is the indication to go back: reduce posterior leaflet height, a larger ring, an edge-to-edge (Alfieri) stitch — or replace.' },
          { id: 'redo', label: 'Re-repair now with a larger ring', verdict: 'wrong', points: 2, why: 'A second pump run for a problem that has gone with correct loading.' },
          { id: 'mvr', label: 'Replace the valve to prevent recurrence', verdict: 'wrong', points: 0, why: 'He would trade a good repair for a prosthesis.' },
        ]} />
    </>
  );
}

/* ============================================================
   THE VICIOUS CYCLES
   ============================================================ */

function Cycles() {
  return (
    <>
      <p className="cs-p">Tap each step. The green scissors mark where treatment cuts in.</p>
      <ViciousCycle id="cyc-sam" title="🌀 The SAM spiral — 21:55"
        nodes={[
          { short: 'Empty, fast LV', t: 'Bleeding, diuresis, tachycardia', d: 'The cavity shrinks; the septum and anterior leaflet close in.' },
          { short: 'Leaflet dragged', t: 'Outflow jet drags the slack anterior leaflet into the septum', d: 'Systolic anterior motion.' },
          { short: 'Obstruction', t: 'Dynamic LVOT gradient + posteriorly directed MR', d: 'Forward flow falls; the LA pressure rises.' },
          { short: 'Hypotension', t: 'Low pressure, low coronary perfusion', d: 'The monitor looks like “low output”.' },
          { short: 'Catecholamines', t: 'Endogenous surge — and adrenaline from the bedside', d: 'More contractility, faster rate: the LV empties further — and the spiral tightens.' },
        ]}
        breaks={[
          { at: 4, t: 'Stop the inotropes. Never add dobutamine or milrinone.' },
          { at: 0, t: 'Fill the ventricle: fluid, legs up; stop the diuretic; stop the bleeding.' },
          { at: 3, t: 'Squeeze the arteries, not the heart: phenylephrine (or noradrenaline).' },
          { at: 1, t: 'Slow the heart: esmolol or another short-acting beta-blocker; restore AV synchrony with atrial pacing if needed.' },
          { at: 2, t: 'If it persists at rest: back on bypass — lower the coaptation, bigger ring, Alfieri stitch, or replace.' },
        ]} />
      <Decision id="cyc-paradox" question="Why does phenylephrine help in SAM but would harm a patient in acute MR from a flail (Case 02)?"
        options={[
          { id: 'cav', label: 'In SAM, afterload widens the LV cavity and slows ejection, lifting the leaflet out of the outflow; in a flail, afterload drives more blood backwards through the leak', verdict: 'best', points: 10,
            why: 'Same drug, different obstacle. In SAM the problem is a dynamic obstruction that a fuller, slower, more pressurised ventricle relieves; in fixed regurgitation every mmHg of afterload chooses the back door.' },
          { id: 'cor', label: 'It only improves coronary perfusion', verdict: 'wrong', points: 0, why: 'Part of it, but not why it reverses SAM.' },
        ]} />
      <ViciousCycle id="cyc-mr" title="🔁 MR begets MR — the silent decade"
        nodes={[
          { short: 'Torn chord', t: 'The leak grows: a stretched, then torn chord', d: 'A larger regurgitant orifice.' },
          { short: 'LA stretch', t: 'The atrium dilates and remodels', d: 'Fibrosis, then AF — and AF makes the atrium bigger still.' },
          { short: 'Annulus widens', t: 'The annulus dilates with the LA and LV', d: 'The leaflets are pulled apart: the leak grows.' },
          { short: 'LV dilates', t: 'Eccentric remodelling', d: 'LVESD creeps up; contractility falls while the EF looks normal.' },
          { short: 'More MR', t: 'More volume load', d: 'The loop closes — without a single symptom.' },
        ]}
        breaks={[
          { at: 0, t: 'Repair the valve early, in a reference centre — the only cut that removes the cause.' },
          { at: 3, t: 'Act on the trajectory: LVESD and EF trends, not just thresholds.' },
          { at: 1, t: 'Refer when AF or LA ≥ 60 mL/m² appears.' },
        ]} />
      <ViciousCycle id="cyc-amvp" title="⚡ The arrhythmic prolapse loop"
        nodes={[
          { short: 'Prolapse + MAD', t: 'Billowing leaflets and annular disjunction', d: 'The annulus slides away from the LV wall in systole.' },
          { short: 'Tug', t: 'Each beat tugs the papillary muscles and inferobasal wall', d: 'Mechanical stretch, beat after beat, for decades.' },
          { short: 'Scar', t: 'Fibrosis in the papillary muscles (LGE on CMR)', d: 'A substrate for re-entry.' },
          { short: 'Ectopy', t: 'Papillary-muscle ectopics, NSVT', d: 'Triggers landing on a scar.' },
          { short: 'VF', t: 'Ventricular fibrillation', d: 'Sudden death — often young, often a woman, often at rest or night.' },
        ]}
        breaks={[
          { at: 3, t: 'Correct K⁺ and Mg²⁺; beta-blocker; ablate a dominant PVC focus.' },
          { at: 4, t: 'ICD after VF or sustained VT; considered in selected high-risk patients.' },
          { at: 0, t: 'Repair may reduce the tug — but rarely removes the scar.' },
        ]} />
      <Decision id="cyc-icd" question="Which feature alone mandates an ICD in arrhythmic MVP?"
        options={[
          { id: 'vf', label: 'Survived VF or sustained, haemodynamically unstable VT not due to a reversible cause', verdict: 'best', points: 10, why: 'Secondary prevention: class I. The rest are risk markers that inform an individual decision.' },
          { id: 'mad', label: 'Mitral annular disjunction', verdict: 'wrong', points: 0, why: 'Common, often benign; a marker, not an indication.' },
          { id: 'twi', label: 'Inferior T-wave inversion', verdict: 'wrong', points: 0, why: 'A marker, not an indication.' },
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
      <WarStory title="💀 “He felt fine”"
        mistake="Following asymptomatic severe MR with a flail leaflet yearly until symptoms appeared."
        burn="Operate on the numbers and the trajectory, not the symptoms. Symptoms are the last sign, not the first.">
        <p className="cs-p">A 55-year-old teacher with a flail P2, “asymptomatic”. LVESD 38, then 41, then 44 mm over four years; nobody acted because he felt well. Breathless at 59: EF 48%, persistent AF. A perfect repair. The EF never recovered; he died at 63 of heart failure and VT.</p>
      </WarStory>
      <Decision id="mm-trig" question="At which point should he have been referred, at the latest?"
        options={[
          { id: '40', label: 'When LVESD reached 40 mm (or ≥ 20 mm/m²) — and ideally earlier, while low-risk and repairable', verdict: 'best', points: 10, why: 'Class I at LVESD ≥ 40 mm or EF ≤ 60%; class IIa earlier with a likely durable repair and an additional criterion.' },
          { id: 'sx', label: 'When he became breathless', verdict: 'wrong', points: 0, why: 'That is when it was too late.' },
        ]} />
      <WarStory title="💀 Adrenaline for the low pressure"
        mistake="Escalating adrenaline for hypotension after a mitral repair without an echo."
        burn="Hypotension after mitral repair: echo before inotropes. If it is SAM, the inotrope is the poison.">
        <p className="cs-p">A 48-year-old after a Barlow repair, hypotensive on the ICU at 02:00. Adrenaline 0.1, then 0.2, then 0.3 µg/kg/min. Pressure kept falling; the murmur got louder. Cardiac arrest at 03:10. A TOE during CPR showed the anterior leaflet plastered against the septum. Volume and phenylephrine brought him back on ECMO; he survived with a hypoxic brain injury.</p>
      </WarStory>
      <Decision id="mm-sam" question="The first thing that should have happened at 02:00?"
        options={[
          { id: 'echo', label: 'A bedside echo — then stop the inotrope, fill, slow and constrict', verdict: 'best', points: 10, why: 'Echo turns a guess into a diagnosis; in SAM it reverses the treatment.' },
          { id: 'nor', label: 'Swap adrenaline for dobutamine', verdict: 'wrong', points: 0, why: 'Another inotrope, plus vasodilation: worse.' },
        ]} />
      <WarStory title="💀 The valve that could have been repaired"
        mistake="Replacing a repairable degenerative valve in a low-volume unit."
        burn="Degenerative MR in a young patient: send to a centre that repairs. A repair rate is a patient’s future.">
        <p className="cs-p">A 44-year-old with an isolated P2 flail had surgery in a unit doing a handful of mitral operations a year. “Too complex” — a mechanical valve. Labile INRs on the road for work. At 51, an intracranial haemorrhage with an INR of 4.6: three weeks in neuro-ICU and a permanent hemiparesis.</p>
      </WarStory>
      <Decision id="mm-repair" question="For an isolated P2 flail in a 44-year-old, what repair rate should a reference centre achieve?"
        options={[
          { id: '95', label: 'Above ~95%', verdict: 'best', points: 10, why: 'Isolated posterior-leaflet lesions are the most repairable of all. Lower rates mean the wrong centre.' },
          { id: '60', label: 'About 60% — replacement is just as good', verdict: 'wrong', points: 0, why: 'Replacement means anticoagulation or degeneration, and worse LV function and survival.' },
        ]} />
      <WarStory title="💀 The collapse at the finish line"
        mistake="Calling papillary-muscle ectopy “benign” in a young woman with bileaflet prolapse, MAD and inferior T inversion."
        burn="Prolapse + MAD + inferior T inversion + complex ectopy = arrhythmic MVP. Holter, CMR, EP — before the race.">
        <p className="cs-p">A 34-year-old nurse with palpitations; bileaflet prolapse with mild MR, MAD 9 mm, inferior T inversion, 12% ectopy with a right-bundle, superior-axis shape. “Prolapse ectopics are benign.” Eight months later: VF at the 9 km mark of a 10 km race. Bystander CPR and a public defibrillator saved her. CMR: papillary-muscle scar. She now has an ICD.</p>
      </WarStory>
      <Decision id="mm-amvp" question="What test would most have changed her management before the race?"
        options={[
          { id: 'cmr', label: 'Cardiac MRI with late gadolinium enhancement, plus a Holter — then EP review', verdict: 'best', points: 10, why: 'Scar in the papillary muscles or inferobasal wall plus complex ectopy marks the high-risk phenotype.' },
          { id: 'ett', label: 'Nothing — mild MR does not need follow-up', verdict: 'wrong', points: 0, why: 'The arrhythmic risk in MVP is independent of how much the valve leaks.' },
        ]} />
      <WarStory title="💀 The fever after the dentist"
        mistake="Two courses of oral antibiotics for fever, without blood cultures, three months after a ring repair."
        burn="Fever + prosthetic valve material = blood cultures ×3 BEFORE antibiotics, and an echo. And give dental prophylaxis after a ring.">
        <p className="cs-p">A 58-year-old, four months after mitral repair with a ring. A scale-and-polish without prophylaxis, then fevers. Amoxicillin from an urgent-care clinic, twice. Six weeks later: a left MCA stroke. TOE: vegetations on the ring and a posterior annular abscess. Emergency surgery — the repair could not be saved.</p>
      </WarStory>
      <WarStory title="💀 The AF that was only rate-controlled"
        mistake="Treating new AF in asymptomatic severe MR with a beta-blocker alone: no anticoagulation, no referral."
        burn="New AF in severe primary MR is two emergencies in slow motion: stroke risk now (anticoagulate) and a trigger for surgery (refer).">
        <p className="cs-p">A 61-year-old woman with known severe MR developed AF; she was started on bisoprolol and told to come back in a year. Ten months later, an embolic stroke with aphasia. Her MR had never been referred; the AF never left.</p>
      </WarStory>
      <Decision id="mm-af" question="What two things should new AF have triggered?"
        options={[
          { id: 'both', label: 'Anticoagulation by stroke risk (a DOAC is fine in MR) AND referral for surgery', verdict: 'best', points: 10, why: 'AF is one of the guideline criteria for repair in asymptomatic primary MR. MR is not “valvular AF”: DOACs are appropriate.' },
          { id: 'warf', label: 'Warfarin because it is valvular AF', verdict: 'wrong', points: 2, why: 'Anticoagulation yes — but MR is not valvular AF, and the surgical referral is still missing.' },
        ]} />
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🏠 day 61</span>Going home. Sinus rhythm, trivial MR, gradient 3 mmHg, no SAM. Holter on day 4: ectopy 3%, no runs. “When can I run? When can I fly?”</p>
      </div>
      <MultiSelect id="s10-home" question="His discharge plan?"
        items={[
          { id: 'asp', label: 'Aspirin 75 mg for 3 months', correct: true, why: 'While the ring endothelialises.' },
          { id: 'bb', label: 'Bisoprolol, for ectopy and post-op AF', correct: true, why: 'And for the arrhythmic substrate.' },
          { id: 'ie', label: 'Endocarditis prophylaxis before dental procedures, a card, and dental hygiene', correct: true, why: 'Prosthetic material used for valve repair puts him in the high-risk group (ESC 2023).' },
          { id: 'echo', label: 'Echo at 6–12 weeks as a new baseline, then periodically', correct: true, why: 'Confirms repair, LV recovery and no SAM.' },
          { id: 'ep', label: 'EP clinic with Holter and CMR in 3–6 months', correct: true, why: 'Decides on his arrhythmic risk — and informs the aviation authority.' },
          { id: 'rehab', label: 'Cardiac rehabilitation; a graded return to running; no driving for about 4 weeks (local rules vary)', correct: true, why: 'Structured recovery; sternal precautions are lighter after a mini-thoracotomy.' },
          { id: 'warf', label: 'Lifelong warfarin', correct: false, why: 'Not after a repair in sinus rhythm.' },
        ]} />

      <div className="cs-h2">📝 Case quiz</div>
      <Quiz id="s10-quiz" items={[
        { q: 'In chronic severe primary MR, an LVEF of 60% means…', options: ['Normal function', 'Early LV dysfunction', 'Excellent function', 'Nothing without symptoms'], answer: 1, why: 'The leak flatters the EF; ≤ 60% is dysfunction.' },
        { q: 'Which is a class I trigger for surgery in asymptomatic severe primary MR (ESC/EACTS 2025)?', options: ['LVESD 38 mm', 'LVESD ≥ 40 mm or LVESDi ≥ 20 mm/m²', 'A loud murmur', 'Age over 50'], answer: 1, why: 'Or LVEF ≤ 60%.' },
        { q: 'PISA radius 1.06 cm at 40 cm/s, MR Vmax 5.4 m/s. EROA ≈', options: ['0.18 cm²', '0.35 cm²', '0.52 cm²', '0.95 cm²'], answer: 2, why: '2π × 1.12 × 40 / 540 ≈ 0.52 cm².' },
        { q: 'In late-systolic MR (billowing without flail), the PISA EROA tends to…', options: ['Underestimate severity', 'Overestimate severity', 'Be exact', 'Be impossible to measure'], answer: 1, why: 'The orifice is open for only part of systole: use regurgitant volume.' },
        { q: 'Carpentier type II mitral disease is…', options: ['Annular dilatation', 'Excessive leaflet motion', 'Rheumatic restriction', 'Ischaemic tethering'], answer: 1, why: 'Prolapse, billowing, flail.' },
        { q: 'In the surgeon’s 3D en-face view, the left atrial appendage sits next to…', options: ['A3/P3', 'A1/P1', 'A2/P2', 'The aortic valve'], answer: 1, why: 'Aorta at 12, LAA at 9, next to the anterolateral commissure: A1/P1.' },
        { q: 'Which raises the risk of SAM after mitral repair?', options: ['A large dilated LV', 'A small ring and a tall posterior leaflet', 'A large ring', 'Bradycardia'], answer: 1, why: 'Coaptation moves toward the septum; C-sept < 25 mm, AL/PL < 1.3.' },
        { q: 'First-line treatment of post-repair SAM with hypotension:', options: ['Adrenaline', 'Dobutamine', 'Stop inotropes, give volume, phenylephrine, beta-blocker', 'GTN'], answer: 2, why: 'Fill, slow, constrict.' },
        { q: 'A red flag for arrhythmic MVP is…', options: ['An isolated mid-systolic click', 'Mitral annular disjunction with inferior T inversion and papillary-muscle ectopy', 'Mild MR', 'Sinus arrhythmia'], answer: 1, why: 'With bileaflet prolapse and LGE on CMR.' },
        { q: 'After a mitral repair with a ring, dental endocarditis prophylaxis is…', options: ['Not needed', 'Recommended (prosthetic material used for repair)', 'Only for 3 months', 'Only if AF'], answer: 1, why: 'ESC 2023: high-risk group.' },
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
          <li className="cs-li">🏃 “Asymptomatic” often means adapted. Measure exercise capacity; ask what they stopped doing.</li>
          <li className="cs-li">🚪 The leak flatters the EF: in severe MR, EF ≤ 60% or LVESD ≥ 40 mm (≥ 20 mm/m²) is already dysfunction.</li>
          <li className="cs-li">📈 Act on the trajectory, not only the lines: AF, LA ≥ 60 mL/m², SPAP &gt; 50 and TR ≥ moderate are triggers too.</li>
          <li className="cs-li">🎯 Quantify — PISA, vena contracta, RVol, pulmonary veins; in late-systolic MR trust the volume, not the area.</li>
          <li className="cs-li">🏥 Repair beats replacement; the centre’s repair rate is the patient’s future. TEER is for the high-risk.</li>
          <li className="cs-li">🗺️ Surgeon’s view: aorta at 12, LAA at 9, A1/P1 beside it. Name the segment before you fix it.</li>
          <li className="cs-li">💍 Barlow: respect, don’t resect; a big, true-sized ring; keep the coaptation point away from the septum.</li>
          <li className="cs-li">🌀 SAM: fill, slow, constrict. Inotropes and vasodilators feed it. Echo before you treat hypotension after mitral repair.</li>
          <li className="cs-li">⚡ Prolapse + MAD + inferior T inversion + papillary ectopy = arrhythmic MVP: Holter, CMR, EP.</li>
          <li className="cs-li">🦷 A ring is prosthetic material: dental prophylaxis, and blood cultures before antibiotics for any fever.</li>
        </ol>
      </div>
      <CaseLibrary playlist={VALVE_PLAYLIST} start={VALVE_PLAYLIST_START} channels={VALVE_CHANNELS}>
        Keep going: more structural and valvular cases from the recommended teams.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const VALVE_04 = {
  title: 'Chronic primary MR · Barlow disease with a flail P2 · early surgical repair and post-repair SAM',
  short: 'Structural Heart · Case 04',
  patient: {
    name: 'Capt. Rafael Moreno',
    meta: '52 M · MRN 7731-0452 · 79 kg',
    flags: [
      { text: '“I feel fine”', tone: 'blue' },
      { text: 'Flail P2 · Barlow', tone: 'red' },
      { text: 'MAD · NSVT', tone: 'amber' },
      { text: 'Airline pilot', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 80, limit: 200, basis: 'CT coronary angiogram only' },
  clock0: min(8, 30),
  vitals0: { hr: 64, sys: 128, dia: 74, spo2: 99, rr: 13, st: 0, rhythm: 'sinus' },
  brand: { icon: '🫀', line: 'Structural Heart · Case 04' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / Cardiac surgery', tone: 'cyan' },
      { text: 'Valve · surgical repair', tone: 'red' },
      { text: 'ESC/EACTS 2025 VHD-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'Feeling', style: 'outline' },
      { text: 'fine', style: 'grad' },
      { text: '& the blocked door', style: 'cyan' },
    ],
    hook: (
      <>
        A long-haul captain who runs half-marathons comes for his medical and says he has never felt better. His valve has been leaking for seven years — and his heart has been <b>hiding the bill</b>.
        Here you learn why an ejection fraction of 62% is already a damaged ventricle, why waiting for symptoms is the mistake, and why a repair beats a replacement.
        You will measure the leak, map the segments, plan the ring, tie the chords — and meet the night when the repaired valve <span className="r">blocks its own outflow</span>, and the drug in the registrar’s hand makes it <span className="g">worse</span>.
      </>
    ),
    image: null,
    sims: 's4',
    crisis: 's9',
    cards: [
      { k: '👨‍✈️ The patient', t: 'Capt. Rafael Moreno, 52 — Barlow disease, a flail P2, a murmur known since 2019, “never felt better”.' },
      { k: '🩺 Your role', t: 'From the aviation medical to the valve clinic, the heart team, theatre and a night on the cardiac ICU.' },
      { k: '🎛️ In your hands', t: 'Heart sounds and handgrip, PISA and vena contracta, a two-exit ventricle, serial echoes, a 3D segment map, the ring, the neochords, the SAM crisis.' },
      { k: '🧠 How it teaches', t: 'Compensation is not health; the same drug saves one mitral patient and harms another — and why.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'The murmur at the medical', Component: Presentation,
      pill: '🛫 08:30 — “never felt better”',
      lede: 'Listen, separate MR from HCM, read the ECG — and see through “asymptomatic”.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 64, sys: 128, dia: 74, spo2: 99, rr: 13, rhythm: 'sinus' }); atLeastClock(min(8, 30)); } },
    { id: 's2', icon: '📏', nav: 'Measure the Leak', title: 'Measure the leak — echo, TOE, CMR, Holter', Component: Measure,
      pill: '🎯 PISA and vena contracta, by hand',
      lede: 'Quantify it yourself, see why his EF is flattered, and find the arrhythmic thread.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 66, sys: 124, dia: 72, spo2: 99, rr: 14, rhythm: 'sinus' }); atLeastClock(min(14 * DAY + 10, 0)); } },
    { id: 's3', icon: '👥', nav: 'Heart Team', title: 'The heart team: when, where, who', Component: HeartTeam,
      pill: '📈 Seven years of echoes — and two more if we wait',
      lede: 'The 2025 triggers, his trajectory, the centre — and a conversation with a man who feels fine.',
      enter: ({ atLeastClock }) => atLeastClock(min(28 * DAY + 14, 0)) },
    { id: 's4', icon: '🧮', nav: 'Segments & Ring', title: 'Planning: the segment map and the ring', Component: Planning,
      pill: '🗺️ Aorta at 12, appendage at 9',
      lede: 'Name the segments on 3D TOE, then size a ring that will not cause SAM.',
      enter: ({ atLeastClock }) => atLeastClock(min(42 * DAY + 9, 0)) },
    { id: 's5', icon: '🩸', nav: 'Set-up', title: 'Set-up in theatre', Component: Setup,
      pill: '🧷 Day 56 — right mini-thoracotomy',
      lede: 'The checklist, the operation in order, and the air you cannot see.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 62, sys: 122, dia: 70, spo2: 100, rr: 12, rhythm: 'sinus' }); atLeastClock(min(56 * DAY + 7, 30)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy: what to fix, what to leave', Component: Strategy,
      pill: '🔀 Fix what leaks',
      lede: 'Branching choices on the arrested heart — and the rule about residual MR.',
      enter: ({ atLeastClock }) => atLeastClock(min(56 * DAY + 9, 0)) },
    { id: 's7', icon: '🛠️', nav: 'The Repair', title: 'The repair: neochords, saline, ring', Component: Repair,
      pill: '🧵 Tie the chords to the right length',
      lede: 'Loops, anchors, length, saline test — then off bypass and the verdict on TOE.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 58, sys: 92, dia: 62, spo2: 100, rr: 12, rhythm: 'sinus' }); atLeastClock(min(56 * DAY + 9, 40)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Cardiac ICU: the first hours', Component: Recovery,
      pill: '💧 Keep the ventricle full',
      lede: 'Electrolytes, antithrombotics, what to watch — and why an empty ventricle is dangerous tonight.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 92, sys: 108, dia: 60, spo2: 99, rr: 14, rhythm: 'sinus' }); atLeastClock(min(56 * DAY + 14, 0)); } },
    { id: 's9', icon: '🚨', nav: 'Night Crisis', title: 'The night: the leaflet blocks the door', Component: Crisis,
      pill: '🌙 21:55 — adrenaline makes it worse',
      lede: 'Recognise SAM, reverse the reflex — fill, slow, constrict — and stop the bleeding that started it.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 126, sys: 64, dia: 38, spo2: 91, rr: 26, rhythm: 'sinus' }); atLeastClock(min(56 * DAY + 21, 55)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycles', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'The SAM spiral, the silent decade of MR, and the arrhythmic prolapse loop.',
      enter: ({ setVitals }) => setVitals({ hr: 78, sys: 118, dia: 68, spo2: 98, rr: 14, rhythm: 'sinus' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Six patients who taught these rules.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'His plan, the quiz — then your score.' },
  ],
};

export default function Valve04({ onClose }) {
  return <CaseShell def={VALVE_04} onClose={onClose} />;
}
