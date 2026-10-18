import React from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import { Auscultation, Doppler } from '../kit/Valve.jsx';
import {
  JVPViewer, MitralInflowResp, LVRVCath, CPRCMBoard, SternotomyPlanner,
  Pericardiectomy, RVEcho, LowOutputResus, MITRAL_TRUE,
} from './sims.jsx';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 03 · GRAND ROUNDS
   Radiation-associated heart disease. A 54-year-old Hodgkin
   lymphoma survivor, mantle-field radiotherapy and doxorubicin
   24 years ago, arrives labelled "cirrhosis" with ascites and
   oedema. Everything the beam touched is diseased: a calcified
   constricting pericardium, a calcified aortic valve and
   aorto-mitral curtain, ostial coronary disease, a porcelain
   aorta, conduction disease, fibrotic lungs, a failed thyroid.

   The core teaching: CONSTRICTION vs RESTRICTION vs VALVE as
   the cause of the failure — JVP and Kussmaul, the knock,
   respiratory variation of mitral inflow, annulus reversus and
   paradoxus, hepatic veins, and simultaneous LV–RV pressures
   (discordance). Then the hostile irradiated chest: a staged
   plan (ostial PCI → transfemoral TAVI → radical pericardiectomy
   with a no-touch aorta), the operation itself, and the night
   the freed right ventricle fails, in complete heart block.

   Clinical content follows the 2025 ESC/EACTS valvular heart
   disease guideline, the 2025 ESC guidelines for myocarditis and
   pericarditis, the 2022 ESC cardio-oncology guideline, the
   2013 EACVI/ASE expert consensus on imaging after chest
   radiotherapy, the 2024 ESC chronic coronary syndromes
   guideline and the Mayo Clinic echocardiographic criteria for
   constriction (Welch 2014), simplified for teaching.
   ============================================================ */

const min = (h, m) => h * 60 + m;
const day = (d, h, m) => (d - 1) * 24 * 60 + min(h, m);

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

/** A branching decision: after the answer, the consequence of the path chosen plays out. */
function Path({ id, paths }) {
  const { answers } = useCase();
  const p = paths[answers[id]];
  return p ? <Note kind={p.kind || 'pearl'} title={p.title}>{p.text}</Note> : null;
}

/* Searches on the recommended channels (search pages, not single videos). */
const RADIATION_SEARCHES = [
  { name: 'CCC Live Cases — pericardiectomy', url: 'https://www.youtube.com/@CCCLiveCases/search?query=pericardiectomy', note: 'Search the channel' },
  { name: 'Gulf Intervention Society — constrictive pericarditis', url: 'https://www.youtube.com/@gulfinterventionsociety/search?query=constrictive%20pericarditis', note: 'Search the channel' },
  { name: 'Interventional Cardiology — porcelain aorta TAVI', url: 'https://www.youtube.com/@interventionalcardiologyis3814/search?query=porcelain%20aorta', note: 'Search the channel' },
];
const UNVERIFIED = 'YouTube — channel not verified (see REPORT.md)';

/* ============================================================
   1 · PRESENTATION — "CIRRHOSIS"
   ============================================================ */

function Presentation() {
  const { answers } = useCase();
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">📅 6 months</span>Mrs Siobhan Kearney, 54, a primary-school head teacher, gets breathless climbing to her classroom. Then her ankles swell, then her thighs, then her belly. Her GP doubles the furosemide, then doubles it again: 120 mg a day. She is still gaining weight.</p>
        <p className="cs-p"><span className="cs-time">🩻 3 weeks ago</span>An abdominal ultrasound: ascites, a big liver “with a nodular contour”, raised liver stiffness on elastography. Referred to hepatology as <b>cryptogenic cirrhosis</b>; a liver biopsy is booked. She drinks two glasses of wine a month.</p>
        <p className="cs-p"><span className="cs-time">📜 history</span>Hodgkin lymphoma at 30 (2002): four cycles of ABVD (doxorubicin 200 mg/m² in total) and <b>mantle-field radiotherapy, 36 Gy</b>. “Cured.” Discharged from oncology follow-up at 10 years. Tired and cold for a year. Never smoked.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🚑 10:20</span>The hepatologist looks at her neck, stops, and sends her straight to the emergency department: “The veins in her neck reach her ears.”</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>📊 Observations · 10:20</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('96 /min, regular')], ['Blood pressure', N('102/78 mmHg — pulse pressure 24', 'cs-hi')], ['SpO₂', N('94% on air')],
            ['Resp. rate', N('22 /min', 'cs-hi')], ['Temperature', N('36.4 °C')], ['Weight', N('71 kg (63 kg a year ago)', 'cs-hi')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🩺 Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">JVP to the angle of the jaw, with a sharp collapse after each beat — and it <b>rises</b> when she breathes in.</li>
            <li className="cs-li">A sharp early-diastolic sound at the left sternal edge. An ejection systolic murmur 3/6 at the upper right sternal edge; A2 soft.</li>
            <li className="cs-li">Tense ascites; liver 4 cm, smooth; pitting oedema to the thighs; dull right base.</li>
            <li className="cs-li">Small blue radiotherapy tattoo dots on the sternum and both sides of the neck; thin, shiny skin over the upper chest; a firm, “woody” neck.</li>
            <li className="cs-li">No spider naevi, no palmar erythema, no splenomegaly, no asterixis.</li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">🫀 Look at the neck — then compare</div>
      <p className="cs-p">Her neck first, with the breathing trace and her heart sounds. Then tamponade, a stiff muscle, and normal. Watch three things: the y-descent, what inspiration does, and the extra sound.</p>
      <JVPViewer />
      <Why title="🧱 Why her JVP rises when she breathes in"
        chain={[
          { k: 'THE BOX', t: 'Scarred, calcified pericardium: a rigid shell with a FIXED total volume for both ventricles.' },
          { k: 'INSPIRATION', t: 'The chest pressure falls and pulls more blood from the abdomen and limbs toward the right heart.' },
          { k: 'NO ROOM', t: 'The right ventricle cannot expand outward — the shell is in the way. And the shell blocks the fall in chest pressure from reaching the heart.' },
          { k: 'BACK-UP', t: 'Venous return has nowhere to go: right atrial pressure RISES instead of falling.' },
          { k: 'KUSSMAUL', t: 'A JVP that climbs on inspiration — the neck telling you the heart is in a box (or the right side is badly stiff).' },
        ]}>
        Normal veins fall on inspiration because the chest sucks the blood in. Hers rise because the heart cannot take the gift.
      </Why>
      <Contrast title="🥚 a solid shell vs a liquid squeeze"
        is={{ h: 'Constriction (hers)', points: ['Steep y-descent: early filling is fast and free — until the shell stops it dead.', 'Kussmaul sign; pericardial knock at the moment filling stops.', 'Little pulsus paradoxus: the shell shields the heart from chest-pressure swings.', 'Slow: months of oedema, ascites, “liver disease”.'] }}
        isnt={{ h: 'Tamponade', points: ['NO y-descent: fluid squeezes all through diastole, so there is never free filling.', 'The JVP still falls on inspiration.', 'Pulsus paradoxus > 10 mmHg; shock in hours.', 'Echo: an effusion with chamber collapse — drain it.'] }} />

      <div className="cs-h2">🎧 The murmur</div>
      <p className="cs-p">An ejection murmur at the base with a soft second sound. Compare it with a normal heart. The pericardial knock is on the neck viewer above; the kit sounds below are for the valve.</p>
      <Auscultation lesions={['as-severe', 'normal']} />

      <ECG12 rate={96} pr={0.24}
        shape={{ I: { r: 3.5, s: 0.5 }, II: { r: 4.5, s: 0.8 }, III: { r: 2.5, s: 1 }, aVL: { r: 2, s: 0.5 }, aVF: { r: 3.5, s: 0.8 }, V1: { r: 1, s: 5 }, V2: { r: 2, s: 6 }, V3: { r: 4, s: 4 }, V4: { r: 6, s: 2 }, V5: { r: 5.5, s: 1 }, V6: { r: 4.5, s: 0.5 } }}
        tInv={{ V4: true, V5: true, V6: true, I: true, aVL: true }}
        caption="Sinus rhythm 96/min. PR 240 ms — first-degree AV block. Low QRS voltages in the limb leads (< 5 mm). Flat-to-inverted T waves laterally. No Q waves." />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧪 Chest X-ray, bloods and the ascitic tap</div>
        <Table head={['', 'Result']} rows={[
          ['Chest X-ray', 'Normal heart size. A thin rim of calcium along the inferior and anterior heart border on the lateral film. Upper-zone fibrosis with hilar retraction. Right pleural effusion. Calcified aortic knuckle.'],
          ['NT-proBNP', N('610 ng/L — modest for this much fluid', 'cs-lo')],
          ['Creatinine / eGFR', N('148 µmol/L · 35 (eGFR 78 a year ago)', 'cs-hi')],
          ['Sodium / potassium', N('131 · 3.3 mmol/L', 'cs-hi')],
          ['Bilirubin · ALT · ALP · albumin', N('34 µmol/L · 64 U/L · 160 U/L · 34 g/L')],
          ['INR · platelets', N('1.3 · 214 × 10⁹/L — platelets normal')],
          ['TSH · free T4', N('18 mU/L · 7 pmol/L', 'cs-hi')],
          ['Ascitic fluid', N('SAAG 17 g/L (≥ 11) · total protein 36 g/L (≥ 25) · WCC 90', 'cs-hi')],
        ]} />
      </div>

      <Decision id="s1-dx" question="What is the most likely cause of her failure?"
        options={[
          { id: 'cp', label: 'Radiation heart disease with constrictive pericarditis, plus aortic valve disease — the liver is a victim of venous congestion', verdict: 'best', points: 10,
            why: 'Kussmaul sign, a steep y-descent, a knock, pericardial calcium, a mantle field 24 years ago — and ascites with a high SAAG AND high protein, which is the signature of a congested liver, not a cirrhotic one.' },
          { id: 'rcm', label: 'Restrictive cardiomyopathy', verdict: 'ok', points: 4, why: 'Radiation can stiffen the myocardium too, and the bedside cannot always tell them apart — but the knock and the calcified pericardium point to the shell. Stage 2 decides.' },
          { id: 'hfpef', label: 'HFpEF with diuretic resistance — add metolazone', verdict: 'wrong', points: 2, why: 'A label, not a diagnosis. And a mechanism you can cure is hiding under it.' },
          { id: 'cirr', label: 'Cryptogenic cirrhosis with hepatorenal physiology', verdict: 'wrong', points: 0, why: 'A cirrhotic liver does not raise the JVP. Normal platelets and no spleen argue against portal hypertension from the liver itself.' },
        ]} />

      <MultiSelect id="s1-liver" question="Which findings say the liver is the VICTIM (congestion) rather than the cause?"
        items={[
          { id: 'jvp', label: 'A JVP at the angle of the jaw', correct: true, why: 'The single bedside sign that separates cardiac from hepatic ascites. Look at the neck before the liver.' },
          { id: 'prot', label: 'Ascitic protein ≥ 25 g/L with SAAG ≥ 11 g/L', correct: true, why: 'High SAAG = raised sinusoidal pressure. High protein = the sinusoids are healthy and leaky (post-sinusoidal back-pressure). Cirrhosis gives a high SAAG with LOW protein.' },
          { id: 'plt', label: 'Normal platelets, no splenomegaly', correct: true, why: 'Long-standing cirrhotic portal hypertension enlarges the spleen and consumes platelets.' },
          { id: 'elast', label: 'High liver stiffness on elastography', correct: false, why: 'A trap: a liver swollen with venous blood is stiff. Elastography cannot tell congestion from fibrosis.' },
          { id: 'nod', label: '“Nodular contour” on ultrasound', correct: false, why: 'Long congestion can remodel the liver (cardiac cirrhosis) — it does not tell you the heart is innocent.' },
        ]} />
      <Contrast title="🫃 cardiac ascites vs cirrhotic ascites"
        is={{ h: 'Cardiac (constriction, right heart failure)', points: ['JVP high; hepatic veins dilated.', 'SAAG ≥ 11 g/L AND protein ≥ 25 g/L.', 'Platelets and spleen normal.', 'Cure the heart and the ascites goes.'] }}
        isnt={{ h: 'Cirrhotic', points: ['JVP normal or low.', 'SAAG ≥ 11 g/L but protein < 25 g/L.', 'Splenomegaly, low platelets, varices, spider naevi.', 'Treat the liver; transplant if it fails.'] }} />

      <MultiSelect id="s1-beam" question="A mantle field covered the neck, axillae and mediastinum. Which of her problems could the beam have caused?"
        items={[
          { id: 'peri', label: 'Pericardial thickening and calcification', correct: true, why: 'The pericardium lies directly in the field: acute pericarditis early, constriction years later.' },
          { id: 'valve', label: 'Calcified aortic and mitral valves and the curtain between them', correct: true, why: 'The left-sided valves and the aorto-mitral curtain lie in the beam. Fibrosis and calcium usually appear 10–20 years later.' },
          { id: 'cor', label: 'Ostial coronary stenoses', correct: true, why: 'The coronary ostia and proximal vessels sit in the anterior field: ostial and proximal disease, often in young people without risk factors.' },
          { id: 'cond', label: 'First-degree AV block', correct: true, why: 'Fibrosis of the conduction tissue — and it may progress.' },
          { id: 'thy', label: 'Hypothyroidism', correct: true, why: 'The thyroid was in the neck field. Radiation hypothyroidism is common after mantle RT.' },
          { id: 'lung', label: 'Upper-zone lung fibrosis', correct: true, why: 'Radiation pneumonitis heals as fibrosis at the apices and hila.' },
          { id: 'liver', label: 'The liver disease', correct: false, why: 'The liver was not in the field. It is congested by the heart.' },
        ]} />

      <Decision id="s1-diur" question="She is on furosemide 120 mg a day, the creatinine has doubled and her pulse pressure is 24. Your plan for today?"
        options={[
          { id: 'gentle', label: 'Hold the escalation: modest IV diuresis aiming for 0.5–1 kg a day, daily weights and creatinine, correct the potassium — and an urgent echo', verdict: 'best', points: 10,
            why: 'A constricted heart has a fixed stroke volume and depends on high filling pressure. Diuretics ease the congestion, but every millilitre too far comes straight off the cardiac output and the kidneys. The fix is mechanical.' },
          { id: 'meto', label: 'Double the furosemide and add metolazone to overcome resistance', verdict: 'wrong', points: 0,
            why: 'Sequential nephron blockade in a preload-dependent heart: hyponatraemia, hypokalaemia, hypotension, renal failure. The war stories begin here.' },
          { id: 'fluid', label: 'Stop diuretics and give IV fluid for the kidney injury', verdict: 'wrong', points: 2,
            why: 'Her kidneys are congested as much as underperfused; fluid worsens the ascites and the oedema.' },
          { id: 'tap', label: 'Drain all the ascites today to make her comfortable', verdict: 'ok', points: 4,
            why: 'A therapeutic tap relieves the belly and the diaphragm — but a big-volume drain in a preload-dependent heart can drop her pressure. Drain to comfort, not to dry.' },
        ]} />
      {answers['s1-diur'] && <Note kind="pearl" title="🛏️ 14:00">Admitted to the Valvular & Structural Heart Unit, bed 3. Furosemide 80 mg IV twice daily, potassium replaced, 2 L of ascites drained for comfort. TTE booked for the morning.</Note>}
      <Video id="boqyJ8L63fw" title="Constrictive Pericarditis" channel={UNVERIFIED} />
    </>
  );
}

/* ============================================================
   2 · THE MEASUREMENTS — SHELL, MUSCLE OR VALVE?
   ============================================================ */

function Measure() {
  const { answers, answer } = useCase();
  const mi = answers['s2-mitral'], cath = answers['s2-cath'], board = answers['s2-board'], dop = answers['s2-as'];
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Transthoracic echo · day 2</div>
        <Table head={['', 'Finding']} rows={[
          ['LV', 'Normal size, EF 58%, walls 10 mm. Septum jerks toward the LV in early diastole and with inspiration — a septal bounce'],
          ['Atria', 'Both enlarged; IVC 26 mm, not collapsing on sniff'],
          ['Pericardium', 'Bright, thickened, no effusion'],
          ['Aortic valve', 'Thickened, calcified, restricted; Vmax to measure; LVOT 20 mm, LVOT VTI 15 cm'],
          ['Mitral valve', 'Calcium spreading from the aortic root down the anterior mitral leaflet (aorto-mitral curtain); mild MR, mean gradient 4 mmHg'],
          ['RV / PA', 'RV normal size; estimated PA systolic 38 mmHg'],
        ]} />
      </div>

      <div className="cs-h2">📏 Measure the respiratory variation</div>
      <p className="cs-p">Pulsed-wave Doppler at the mitral leaflet tips with a respiratory trace. Find the beat at peak inspiration and the beat at peak expiration, put the caliper on each E-wave peak and mark it. Then look at the tissue Doppler and the hepatic veins.</p>
      <MitralInflowResp done={mi} onMeasure={r => answer('s2-mitral', r)} />
      <ScoreOnce id="s2-mitral" pts={mi == null ? null : mi.good ? 12 : 4} max={12} />
      {mi && <div className={'cs-fb ' + (mi.good ? 'best' : 'ok')}>{mi.good ? `About ${MITRAL_TRUE}%: well above the 25% that favours constriction.` : 'Off the extremes — choose the beat under the peak of the inspiratory trace (beat 2 or 6) and one at end-expiration, and set the caliper on the dense edge of each E-wave.'}</div>}

      <Why title="🔀 Why inspiration starves the left heart in a box"
        chain={[
          { k: 'LUNGS INSIDE', t: 'Inspiration lowers chest pressure. The pulmonary veins sit in the chest and feel it; the heart, inside its shell, does not.' },
          { k: 'GRADIENT FALLS', t: 'Pulmonary vein pressure falls, LV diastolic pressure does not: the push from lungs to LV drops. Mitral E falls.' },
          { k: 'RV FILLS', t: 'Meanwhile the abdomen pushes blood into the right heart. In a fixed box the RV can only grow by pushing the septum left.' },
          { k: 'SEESAW', t: 'Inspiration: RV big, LV small. Expiration: the reverse — and the RV, squeezed, sends blood back up the hepatic veins.' },
          { k: 'THE SIGNS', t: 'E variation ≥ 25%, septal bounce, expiratory hepatic vein reversal, discordant LV and RV pressures. All one mechanism: interdependence.' },
        ]} />

      <div className="cs-h2">🎯 And the valve — how tight is it?</div>
      <p className="cs-p">Continuous-wave Doppler through the aortic valve. Measure the peak velocity, then think about the flow behind it.</p>
      <Doppler vmax={3.6} kind="cw-as" title="CW · aortic valve · apical 5-chamber" onMeasure={r => answer('s2-as', r)} />
      <ScoreOnce id="s2-as" pts={dop == null ? null : dop.close ? 8 : 3} max={8} />
      {dop && <div className={'cs-fb ' + (dop.close ? 'best' : 'ok')}>{dop.close
        ? 'Vmax 3.6 m/s, mean ~29 mmHg — “moderate” by gradient. But stroke volume = 3.14 × 1² × 15 = 47 mL (SVi 27 mL/m²): LOW flow. AVA = 47 ÷ VTI ~60 ≈ 0.8 cm². CT calcium score 2,150 AU (≥ 1,600 in a woman: highly likely severe). Severe low-flow, low-gradient AS with a preserved EF.'
        : 'Off the envelope edge. Drag the caliper to the dense outer edge (~3.6 m/s).'}</div>}
      <Decision id="s2-lflg" question="Why might her aortic gradient UNDER-call the valve?"
        options={[
          { id: 'flow', label: 'The constricted heart cannot fill, so the stroke volume is low; a low flow across a tight valve makes a low gradient', verdict: 'best', points: 10,
            why: 'Gradient depends on flow. Severity is AVA, SVi and calcium — and here the pericardium itself is throttling the flow. Relieve the constriction and the gradient across this valve will climb.' },
          { id: 'angle', label: 'Doppler angle error alone', verdict: 'ok', points: 3, why: 'Always check other windows (right parasternal) — but it does not explain the low SVi.' },
          { id: 'mild', label: 'It does not: 29 mmHg is moderate AS', verdict: 'wrong', points: 0, why: 'A gradient read without the flow behind it is half a measurement.' },
        ]} />

      <div className="cs-h2">📈 The catheter · day 4 — both ventricles at once</div>
      <p className="cs-p">High-fidelity simultaneous LV and RV pressures with a respirometer, no sedation, normal breathing. A patient with cardiac amyloid is on the next table for comparison. Classify both, then measure her end-diastolic pressures.</p>
      <LVRVCath done={cath} onResult={r => answer('s2-cath', r)} />
      <ScoreOnce id="s2-cath" pts={cath == null ? null : (cath.okCalls ? 9 : 0) + (cath.okMeas ? 6 : 0)} max={15} />
      <Contrast title="🔁 discordance vs concordance"
        is={{ h: 'Discordant — the shell', points: ['Inspiration: RV systolic peak RISES, LV peak FALLS.', 'The two ventricles share one fixed volume: one grows only at the other’s cost.', 'Systolic area index > 1.1 — the most accurate catheter sign.'] }}
        isnt={{ h: 'Concordant — the muscle', points: ['Both peaks fall together on inspiration, as in any normal heart.', 'Each ventricle is stiff on its own; the pericardium is not linking them.', 'LVEDP usually > RVEDP by > 5 mmHg; PA systolic often > 55.'] }} />

      <div className="cs-h2">🧩 The contrast board</div>
      <CPRCMBoard done={board} onResult={r => answer('s2-board', r)} />
      <ScoreOnce id="s2-board" pts={board == null ? null : board.correct} max={12} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧲 CT and CMR · day 3</div>
        <Table head={['', 'Finding']} rows={[
          ['Pericardium', N('7 mm, calcified anteriorly and over the diaphragmatic surface; LGE positive; septal bounce on real-time cine', 'cs-hi')],
          ['Myocardium', 'Patchy subepicardial LGE in the anterior wall; native T1 mildly raised; no amyloid pattern'],
          ['Ascending aorta', N('Circumferential calcification — “porcelain”', 'cs-hi')],
          ['Coronaries (CT, then angiography)', N('Ostial RCA 80%; ostial left main 40%; no distal disease', 'cs-hi')],
          ['Lungs', 'Paramediastinal and apical radiation fibrosis; DLCO 46%'],
        ]} />
      </div>
      <Decision id="s2-mixed" question="Her shell is clearly constricting. What does the patchy myocardial LGE add?"
        options={[
          { id: 'mixed', label: 'The beam also scarred the muscle: some restrictive physiology may remain after the pericardium is removed — and it predicts a worse outcome', verdict: 'best', points: 10,
            why: 'Radiation is the classic cause of MIXED constrictive–restrictive disease. It is why radiation pericardiectomy has the worst long-term results of any cause, and why her expectations must be set honestly.' },
          { id: 'none', label: 'Nothing — constriction is proven, the myocardium is irrelevant', verdict: 'wrong', points: 0, why: 'The muscle decides how much she gains from losing the shell.' },
          { id: 'cancel', label: 'It means restriction; pericardiectomy would be pointless', verdict: 'wrong', points: 2, why: 'Her haemodynamics are dominated by the shell: discordance, equalised pressures, high e′. She stands to gain.' },
        ]} />
      <Note kind="evid" title="📚 The Mayo echo criteria">Septal shift (bounce) plus EITHER medial e′ ≥ 9 cm/s OR a hepatic vein expiratory diastolic reversal ratio ≥ 0.79: sensitivity 87%, specificity 91% (Welch et al., 2014). She has all three.</Note>
      <div className="cs-media-row">
        <Video id="jZfGxhb9A6U" title="Pericardial Diseases II: Constrictive Pericarditis" channel={UNVERIFIED} />
        <Video id="Ty0ucFCRiHs" title="Hemodynamics: Constrictive pericarditis cases, mechanisms, technical tips — Elias Hanna, Univ of Iowa" channel={UNVERIFIED} />
      </div>
    </>
  );
}

/* ============================================================
   3 · GRAND ROUNDS — THE HEART TEAM
   ============================================================ */

function HeartTeam() {
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>👥 Grand rounds · day 6</div>
        <Table head={['', 'Finding']} rows={[
          ['Pericardium', 'Calcific constrictive pericarditis, haemodynamically proven; mixed myocardial component'],
          ['Aortic valve', 'Severe low-flow, low-gradient AS, EF 58% (AVA 0.8 cm², SVi 27, calcium 2,150 AU)'],
          ['Coronaries', 'Ostial RCA 80%, ostial left main 40%'],
          ['Hostile chest', 'Porcelain aorta, mediastinal fibrosis, irradiated skin, lung fibrosis (DLCO 46%)'],
          ['Other', 'eGFR 35 (improving), TSH 18, PR 240 ms, Clinical Frailty Scale 3'],
          ['Risk scores', 'STS 3.9%, EuroSCORE II 4.6% — neither includes chest radiation, porcelain aorta or a fibrotic mediastinum'],
          ['Her wish', '“My daughter is getting married in May. I want to walk her down the aisle — on my own legs.”'],
        ]} />
      </div>
      <Why title="☢️ Why the damage keeps growing, decades after the last dose"
        chain={[
          { k: 'THE DOSE', t: 'Radiation kills the endothelium of the small vessels in every tissue in the field.' },
          { k: 'ISCHAEMIA', t: 'Fewer capillaries: the pericardium, valves and muscle become chronically, mildly ischaemic.' },
          { k: 'FIBROSIS', t: 'Fibroblasts are switched on and stay on: collagen, then calcium. It does not stop when the treatment stops.' },
          { k: 'LATE', t: 'Pericardium at 10–20 years, valves and coronaries at 10–25 years — each year adds risk.' },
          { k: 'THE SURGEON', t: 'The same scarring makes tissues stick, bleed and fail to heal: the chest that needs surgery most is the worst chest to operate on.' },
        ]} />

      <Decision id="s3-plan" question="The heart team’s plan?"
        options={[
          { id: 'staged', label: 'Staged: PCI to the RCA ostium → transfemoral TAVI → radical pericardiectomy off-pump, with a no-touch aorta and femoral bypass on standby', verdict: 'best', points: 10,
            why: 'Each lesion gets the least hostile route. No clamp or cannula ever touches the porcelain aorta; no graft depends on an irradiated mammary or on an aortic anastomosis; and only the pericardium — which has no transcatheter cure — needs the sternum.' },
          { id: 'combo', label: 'One operation: surgical AVR + CABG + pericardiectomy on bypass', verdict: 'ok', points: 4,
            why: 'The textbook “do it all once” — and a reasonable choice in a soft aorta. Here it needs a clamp on a porcelain aorta, a long bypass run with fibrotic lungs, and grafts with nowhere safe to sew. Some centres would still do it, with deep hypothermic arrest; the risk is high.' },
          { id: 'peri', label: 'Pericardiectomy alone; leave the valve', verdict: 'wrong', points: 2,
            why: 'Free the LV and it fills more — straight into a severe AS. The valve becomes the new limit, on a heart that has just been operated on.' },
          { id: 'med', label: 'Diuretics; she is too high-risk for anything', verdict: 'wrong', points: 0, why: 'Constriction only progresses, and the diuretics are already costing her kidneys. Her risk is real but her prospects with no treatment are worse.' },
        ]} />
      <Decision id="s3-order" question="Why the valve BEFORE the pericardium?"
        options={[
          { id: 'both', label: 'Inducing anaesthesia and opening the chest with an untreated severe AS on a fixed-output heart is the most dangerous moment of the plan — and once the LV is freed, the AS would become the limit', verdict: 'best', points: 10,
            why: 'Severe AS hates vasodilation and tachycardia; constriction hates low preload. General anaesthesia gives all three. TAVI under sedation removes one of the two fixed obstructions first. Evidence for the order is thin (case series); the logic is haemodynamic.' },
          { id: 'easy', label: 'TAVI is the easier procedure', verdict: 'wrong', points: 0, why: 'Easier is not a reason. Physiology is.' },
          { id: 'any', label: 'The order does not matter', verdict: 'wrong', points: 0, why: 'Every procedure changes the loading for the next.' },
        ]} />
      <MultiSelect id="s3-risk" question="Why will STS and EuroSCORE under-call her risk?"
        items={[
          { id: 'rt', label: 'Neither includes prior chest radiation', correct: true, why: 'In matched studies, irradiated patients have roughly double the long-term mortality after cardiac surgery of comparable patients — invisible to the score.' },
          { id: 'por', label: 'Porcelain aorta is not a variable', correct: true, why: 'It changes the whole operation, not just a percentage.' },
          { id: 'fib', label: 'Mediastinal fibrosis, poor wound healing and lung fibrosis are not counted', correct: true, why: 'They drive bleeding, re-entry injury, wound breakdown and long ventilation.' },
          { id: 'myo', label: 'The scarred myocardium and the progressive nature of radiation damage are not counted', correct: true, why: 'They decide the 5-year result, which a 30-day score cannot see.' },
          { id: 'age', label: 'Scores over-weight youth: at 54 she is “low risk”', correct: false, why: 'Age is in the score correctly; the problem is what is left out.' },
        ]} />
      <Contrast title="🧪 the chest the surgeon expects vs the chest after a mantle field"
        is={{ h: 'Irradiated chest', points: ['Tissues fused; the RV may be stuck to the sternum.', 'Porcelain aorta: no clamp, no cannula.', 'Mammary arteries may be fibrosed; skin and sternum heal poorly.', 'Worse long-term survival after any cardiac surgery.'] }}
        isnt={{ h: 'Ordinary first-time chest', points: ['A clean plane behind the sternum.', 'A soft aorta to clamp and cannulate.', 'A healthy mammary for the LAD.', 'The risk score means what it says.'] }} />

      <Decision id="s3-talk" question="She asks: “Will the operation cure me?”"
        options={[
          { id: 'honest', label: '“It should free your heart and take away most of the fluid. But the radiation also scarred the muscle, so you may not get all the way back, and operations on radiated chests carry more risk — about one in ten here. We will do the safest parts first.”', verdict: 'best', points: 10,
            why: 'The aim, the likely gain, the specific reason her outcome is less certain, a number, and the plan. Published early mortality after radiation pericardiectomy ranges widely (often 10–20% in older series); give your own centre’s figure.' },
          { id: 'yes', label: '“Yes — constriction is curable.”', verdict: 'wrong', points: 0, why: 'True for many idiopathic constrictions. For a mixed radiation heart it is a promise you cannot keep.' },
          { id: 'stats', label: '“Seven-year survival after radiation pericardiectomy is about 27%.”', verdict: 'ok', points: 3, why: 'A figure from one older series, dropped without context. Answer her question first, then the numbers, framed for her.' },
        ]} />
      <Decision id="s3-why" question="Then: “Why did no one warn me this could happen?”"
        options={[
          { id: 'ack', label: 'Acknowledge it; explain that in 2002 mantle RT was the standard that cured her, that late heart effects became clear later, and that survivors should now have regular heart checks — which you will arrange for her and could mention to her oncology team', verdict: 'best', points: 8,
            why: 'Honest, no blame, and turns the anger into action. Current cardio-oncology guidance recommends structured surveillance for survivors of high-dose chest radiotherapy.' },
          { id: 'def', label: '“That was the right treatment at the time.” — and move on', verdict: 'ok', points: 3, why: 'True, but it closes the conversation she needs to have.' },
          { id: 'blame', label: '“Your oncologists should have screened you.”', verdict: 'wrong', points: 0, why: 'Blame helps no one and may not be fair; the surveillance system, not one doctor, failed her.' },
        ]} />
    </>
  );
}

/* ============================================================
   4 · PLANNING — THE HOSTILE CHEST
   ============================================================ */

function Planning() {
  const { answers, answer } = useCase();
  const plan = answers['s4-plan'];
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🗓️ day 7–10</span>Radial angiography: a drug-eluting stent to the RCA ostium, protruding 1 mm into the aorta. Aspirin and clopidogrel. On day 10 she goes to the structural lab for her valve.</p>
      </div>
      <Decision id="s4-lm" question="The left main ostium is 40% on angiography. Treat it now?"
        options={[
          { id: 'phys', label: 'Measure it (iFR/FFR or IVUS); stent only if it is significant, and re-image it in follow-up', verdict: 'best', points: 8,
            why: 'Radiation ostial disease progresses, but a 40% stenosis should be judged by physiology or IVUS area, not by its address. If it later needs treatment, TAVI makes re-engagement harder — so decide before the valve.' },
          { id: 'stent', label: 'Stent it pre-emptively — it will progress', verdict: 'ok', points: 3, why: 'A left main stent has its own risks; treat what is significant.' },
          { id: 'ignore', label: 'Ignore it', verdict: 'wrong', points: 0, why: 'Radiation coronary disease is progressive; it must at least be measured and followed.' },
        ]} />
      <Note kind="pearl" title="📐 Result">iFR 0.95 — not significant. IVUS minimal lumen area 8.1 mm². Medical therapy and re-imaging at one year.</Note>

      <div className="cs-h2">🧮 TAVI in an irradiated root</div>
      <Why title="🦴 Why calcium on the aorto-mitral curtain changes the TAVI"
        chain={[
          { k: 'THE CURTAIN', t: 'The fibrous sheet joining the aortic and mitral valves lay in the beam: it is calcified, from the non-coronary cusp into the anterior mitral leaflet.' },
          { k: 'LVOT CALCIUM', t: 'Calcium below the annulus is rigid and sharp.' },
          { k: 'RUPTURE RISK', t: 'An aggressively oversized balloon-expandable valve, or post-dilation, can tear the annulus or the LVOT at that calcium.' },
          { k: 'THE FIX', t: 'Modest oversizing, avoid big post-dilation, consider a self-expanding valve — and protect the mitral leaflet from a low implant.' },
        ]} />
      <Decision id="s4-tavi" question="Her CT: annulus perimeter 72 mm, area 3.9 cm², bulky calcium extending into the LVOT under the non-coronary cusp, coronary heights 12 and 14 mm, femoral arteries 7 mm. Which plan?"
        options={[
          { id: 'se', label: 'Transfemoral, a self-expanding valve sized to the perimeter, no aggressive post-dilation, temporary pacing wire left in overnight', verdict: 'best', points: 10,
            why: 'Self-expanding frames apply gentler radial force to LVOT calcium. Her PR of 240 ms and scarred conduction tissue make block likely; keep the wire and the monitor. (A carefully sized balloon-expandable valve is a defensible alternative; the LVOT calcium and the pacing risk are the trade-off.)' },
          { id: 'be', label: 'A balloon-expandable valve oversized 20% by area to avoid a leak', verdict: 'wrong', points: 2, why: '20% oversizing against LVOT calcium is the recipe for annular rupture.' },
          { id: 'surg', label: 'Transapical, to keep away from the aorta', verdict: 'wrong', points: 0, why: 'Her femorals are fine, her chest is the problem — and an apical incision in a constricted, irradiated pericardium is hostile surgery too.' },
        ]} />
      <Note kind="pearl" title="🗓️ Day 10">Transfemoral TAVI under sedation. Mean gradient 6 mmHg, trace paravalvular leak. PR lengthens to 280 ms; no block. Pacing wire out at 24 h. Stroke volume rises a little — but the JVP is still at her jaw: the shell remains. Home on day 14 on furosemide, aspirin and clopidogrel, for the pericardium in six weeks.</Note>

      <div className="cs-h2">🪚 The sternotomy-risk planner</div>
      <p className="cs-p">Week 6. She is readmitted for the pericardiectomy. Go through every structure the beam touched and choose how the team protects her from it.</p>
      <SternotomyPlanner done={plan} onResult={r => answer('s4-plan', r)} />
      <ScoreOnce id="s4-plan" pts={plan == null ? null : plan.correct * 2} max={16} />
      <Contrast title="✂️ radical vs partial pericardiectomy"
        is={{ h: 'Radical (phrenic-to-phrenic) via sternotomy', points: ['All the pericardium between the phrenic nerves, plus the diaphragmatic surface and the cavo-atrial junctions.', 'Lower recurrence and better survival in the large series.', 'Needs a sternotomy — in her, a hostile one.'] }}
        isnt={{ h: 'Partial (anterior strip, or thoracotomy)', points: ['Leaves the diaphragmatic and right-sided pericardium.', 'Persistent or recurrent constriction is common.', 'A redo in an irradiated chest is worse than doing it properly once.'] }} />
    </>
  );
}

/* ============================================================
   5 · SET-UP — THE MORNING OF THE PERICARDIECTOMY
   ============================================================ */

function Setup() {
  return (
    <>
      <MultiSelect id="s5-check" question="07:30, the anaesthetic room. What must be in place?"
        items={[
          { id: 'pads', label: 'External defibrillator pads on before skin prep', correct: true, why: 'You cannot reach the heart with internal paddles until it is free — and VF can come at sternal re-entry.' },
          { id: 'fem', label: 'Femoral artery and vein exposed or wired for emergency bypass', correct: true, why: 'The only safe cannulation route with a porcelain aorta, ready before the saw.' },
          { id: 'line', label: 'Arterial line before induction; CVP and a PA catheter; TOE', correct: true, why: 'Beat-to-beat pressure through induction; PA and CVP to guide the RV after the shell is gone.' },
          { id: 'blood', label: 'Cross-matched blood and cell salvage in the room', correct: true, why: 'Peeling a vascular, fibrotic shell bleeds.' },
          { id: 'asp', label: 'Aspirin continued; clopidogrel stopped 5 days ago (stent now 6 weeks old)', correct: true, why: 'Interrupt the P2Y12 inhibitor for surgery after the first month; keep aspirin to protect the stent. Restart clopidogrel when the drains allow.' },
          { id: 'drugs', label: 'Noradrenaline running, milrinone and inhaled nitric oxide drawn up', correct: true, why: 'Pressure through induction; RV support after the shell is off.' },
          { id: 'dry', label: 'Nil by mouth from midnight AND furosemide given this morning to keep her dry', correct: false, why: 'A constricted heart lives on its filling pressure. Hold the morning diuretic; do not arrive in theatre underfilled.' },
        ]} />
      <Why title="🫗 Why induction is the most dangerous minute of the day"
        chain={[
          { k: 'FIXED VOLUME', t: 'The shell fixes how much the ventricles can hold. Her stroke volume cannot rise.' },
          { k: 'RATE IS OUTPUT', t: 'So cardiac output = a fixed stroke volume × heart rate. Slow her and you cut the output.' },
          { k: 'VENODILATION', t: 'Most induction agents dilate veins: venous return falls, filling falls, stroke volume falls further.' },
          { k: 'POSITIVE PRESSURE', t: 'Ventilation raises chest pressure and squeezes the venous return again.' },
          { k: 'COLLAPSE', t: 'Hypotension, coronary hypoperfusion, arrest — before the first incision. “Fast, full and tight.”' },
        ]} />
      <Contrast title="🫀 the fixed-output heart vs the ordinary heart at induction"
        is={{ h: 'Constriction ± severe AS (hers)', points: ['Stroke volume fixed: output follows heart rate.', 'Venodilation empties the only thing keeping her filled.', 'Vasopressor running first; titrate; keep the rate up.'] }}
        isnt={{ h: 'An ordinary heart', points: ['Stroke volume rises with preload and falls gracefully.', 'A dip in pressure at induction is corrected with a little fluid or vasopressor.', 'Standard induction is usually well tolerated.'] }} />
      <Decision id="s5-ind" question="Choose the induction."
        options={[
          { id: 'safe', label: 'Noradrenaline running; small titrated doses of etomidate or ketamine with an opioid; avoid bradycardia; gentle, low-pressure ventilation', verdict: 'best', points: 10,
            why: 'Keep the heart rate up, the veins full, the arteries tight and the chest pressure low. The surgeon is scrubbed and the femoral vessels are ready before you start.' },
          { id: 'prop', label: 'A standard propofol bolus, 2 mg/kg', verdict: 'wrong', points: 0, why: 'Vasodilation and myocardial depression in a fixed-output heart: one of the war stories.' },
          { id: 'beta', label: 'Esmolol first to blunt the response to intubation', verdict: 'wrong', points: 0, why: 'Her heart rate IS her cardiac output.' },
        ]} />
      <Sequence id="s5-seq" question="Put the opening of the irradiated chest in order."
        steps={[
          { label: 'Pads on, femoral vessels prepared, perfusionist primed and in the room', why: 'Bailout before the risk.' },
          { label: 'Titrated induction on noradrenaline; TOE and PA catheter readings', why: 'Fast, full, tight.' },
          { label: 'Careful sternotomy with an oscillating saw; lift each half of the sternum off the fused RV', why: 'Treat the never-opened irradiated chest like a redo.' },
          { label: 'Find both phrenic nerves and mark them before cutting any pericardium', why: 'The boundaries of a radical pericardiectomy.' },
          { label: 'Free the LV first, then the RV and the cavo-atrial junctions', why: 'Stage 6 explains why.' },
        ]} />
    </>
  );
}

/* ============================================================
   6 · STRATEGY — CHOOSE YOUR PATH
   ============================================================ */

function Strategy() {
  return (
    <>
      <p className="cs-p">Three forks in the operation. Each choice plays out.</p>
      <Decision id="s6-pump" question="Fork 1 — Bypass?"
        options={[
          { id: 'off', label: 'Off-pump, with bypass primed and femoral access ready; go on only for bleeding or instability', verdict: 'best', points: 10,
            why: 'Bypass means heparin and more bleeding from a raw surface, and her lungs and kidneys tolerate it badly. Off-pump is usual for pericardiectomy unless something needs fixing inside the heart.' },
          { id: 'on', label: 'Routine full bypass for a still, empty heart', verdict: 'ok', points: 4, why: 'It makes the dissection easier and some surgeons prefer it — at the cost of more bleeding and a longer recovery.' },
          { id: 'aorta', label: 'Routine bypass, cannulating the ascending aorta', verdict: 'wrong', points: 0, why: 'A cannula through a porcelain aorta: dissection and stroke.' },
        ]} />
      <Path id="s6-pump" paths={{
        off: { title: '➡️ What happens', text: 'Pressure steady on noradrenaline. You dissect with the heart beating, and can see each wall bulge as it is freed.' },
        on: { title: '➡️ What happens', kind: 'warn', text: 'Femoral bypass. A dry field — then 2.5 L of blood loss from the raw epicardium once heparin is on board.' },
        aorta: { title: '➡️ What happens', kind: 'warn', text: 'The cannula cracks the calcium shell. A dissection flap on TOE. You convert to femoral cannulation and pray for her brain.' },
      }} />
      <Decision id="s6-order" question="Fork 2 — Which side first?"
        options={[
          { id: 'lv', label: 'The LV first — anterior, lateral to the left phrenic, then the diaphragmatic surface — and only then the RV and the atria', verdict: 'best', points: 10,
            why: 'Free the RV first and it suddenly pumps more blood into the lungs while the LV is still caged: the LA pressure jumps and the lungs flood. Let the left side open its doors before the right side pushes.' },
          { id: 'rv', label: 'The RV first — it is easier to reach', verdict: 'wrong', points: 0, why: 'Easy, and the classic route to acute pulmonary oedema on the table.' },
          { id: 'any', label: 'Whatever peels most easily', verdict: 'wrong', points: 2, why: 'Order is physiology.' },
        ]} />
      <Path id="s6-order" paths={{
        lv: { title: '➡️ What happens', text: 'As the LV comes free, the LA pressure falls on TOE; when the RV follows, its extra output has somewhere to go.' },
        rv: { title: '➡️ What happens', kind: 'warn', text: 'The RV balloons out, the PA pressure climbs to 50, pink froth fills the endotracheal tube. You hurry to the LV with the saturation at 86%.' },
        any: { title: '➡️ What happens', kind: 'warn', text: 'The RV peels first because it is easy. The lungs fill. See fork 2, option B.' },
      }} />
      <Decision id="s6-cal" question="Fork 3 — A calcium plate is welded onto the LAD. You…"
        options={[
          { id: 'island', label: 'Leave an island of calcium on the vessel; free everything around it so the wall can move', verdict: 'best', points: 10,
            why: 'A small fixed island barely restricts filling. A torn LAD in an irradiated heart can be fatal.' },
          { id: 'force', label: 'Remove it completely — any pericardium left is constriction left', verdict: 'wrong', points: 0, why: 'Completeness is not worth the LAD.' },
          { id: 'stop', label: 'Stop the operation here: the rest is too risky', verdict: 'wrong', points: 2, why: 'An anterior strip leaves her constricted.' },
        ]} />
      <Path id="s6-cal" paths={{
        island: { title: '➡️ What happens', text: 'A 3 × 2 cm island stays on the LAD; the muscle around it bulges freely.' },
        force: { title: '➡️ What happens', kind: 'warn', text: 'The plate comes away with a piece of the LAD wall. ST elevation, a vein patch on bypass, 40 minutes of ischaemia.' },
        stop: { title: '➡️ What happens', kind: 'warn', text: 'She leaves theatre with half a shell. Six months later the JVP is back at her jaw.' },
      }} />
      <Why title="🚪 Why the left side must open its doors first"
        chain={[
          { k: 'IN SERIES', t: 'The RV pumps into the lungs; the lungs drain into the LV. Two pumps in a line.' },
          { k: 'RV FREED', t: 'Free the RV first and its stroke volume jumps at once.' },
          { k: 'LV STILL CAGED', t: 'The LV, still in its shell, cannot accept the extra volume.' },
          { k: 'LUNGS FLOOD', t: 'Blood piles up in the pulmonary veins: the LA pressure jumps, the lungs fill — pulmonary oedema on the table.' },
          { k: 'THE RULE', t: 'Free the receiving chamber before the sending one: LV, then RV.' },
        ]} />
      <Contrast title="🧅 parietal vs visceral constriction"
        is={{ h: 'Parietal', points: ['The outer, fibrous sac: thick, often calcified.', 'Comes off as a sheet, between the phrenic nerves.', 'Once it is off, the ventricle bulges.'] }}
        isnt={{ h: 'Visceral (epicardial peel)', points: ['The heart’s own outer skin, thickened and fused to the muscle.', 'Cannot be peeled without tearing muscle and coronaries.', 'Scored in a criss-cross “waffle” until the muscle bulges through.'] }} />
    </>
  );
}

/* ============================================================
   7 · THE PERICARDIECTOMY
   ============================================================ */

function Operation() {
  const { answers, answer, setVitals } = useCase();
  const r = answers['s7-peri'];
  const onEvent = e => {
    if (e.early) setVitals({ spo2: 88, sys: 86, dia: 52 });
    else if (!e.good) setVitals({ sys: 88, dia: 54, hr: 108 });
    else setVitals({ spo2: 97, sys: 104, dia: 62, hr: 92 });
  };
  return (
    <>
      <p className="cs-p">The sternum is open and the phrenic nerves are marked. Tap each region of the shell, read what you find, and choose how to free it. The RV pressure trace below shows what each step does. Finish when you have freed as much as is safe.</p>
      <BedsideMonitor />
      <Pericardiectomy done={r} onEvent={onEvent} onResult={res => { answer('s7-peri', res); setVitals({ hr: 94, sys: 100, dia: 60, spo2: 97, rhythm: 'sinus' }); }} />
      <ScoreOnce id="s7-peri" pts={r == null ? null : r.pts} max={20} />
      {r && (
        <>
          <div className="cs-card">
            <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Intra-operative TOE after the shell is off</div>
            <Table head={['', 'Before', 'After']} rows={[
              ['Mitral E variation', N('33%'), N('7%')],
              ['Septal motion', 'Bounce', 'Normal'],
              ['CVP · PA', N('20 · 38/22'), N(`${r.cvp} · 30/14`)],
              ['RV', 'Normal size, squeezed', N('Dilating, TAPSE 13 mm, moderate TR', 'cs-hi')],
            ]} />
          </div>
          <Decision id="s7-fill" question="The RV is dilating as it comes free and the CVP is falling. The perfusionist suggests a litre of fluid “to keep her where she was”. You…"
            options={[
              { id: 'no', label: 'Decline: accept the lower CVP, start milrinone 0.25–0.375 µg/kg/min with noradrenaline, and keep her rhythm AV-synchronous', verdict: 'best', points: 10,
                why: 'Her old CVP of 20 was the price of the shell, not a target. A thin RV that has been caged for years is weak; give it volume to the old pressure and it dilates, leaks and fails. That is tonight’s crisis.' },
              { id: 'yes', label: 'Give the litre — she is used to high filling pressures', verdict: 'wrong', points: 0, why: 'The pressures she was “used to” were the disease.' },
              { id: 'half', label: 'Give 250 mL and watch the RV on TOE', verdict: 'ok', points: 5, why: 'A cautious, monitored challenge is defensible if she is clearly underfilled — but her RV is already dilating.' },
            ]} />
          <Why title="🎈 Why the freed RV can fail"
            chain={[
              { k: 'YEARS IN A CAST', t: 'For years the shell supported the RV wall and limited how far it could stretch. The muscle thinned and wasted — like a leg in plaster.' },
              { k: 'CAST OFF', t: 'Freed, the RV can suddenly accept much more volume.' },
              { k: 'TOO MUCH', t: 'Venous return pours in, the RV dilates, the tricuspid annulus widens: TR.' },
              { k: 'INTERDEPENDENCE AGAIN', t: 'The dilated RV pushes the septum into the LV. The LV underfills; the output falls.' },
              { k: 'LOW OUTPUT', t: 'Hypotension, a falling coronary perfusion of the RV itself, more dilation. A spiral.' },
            ]} />
        </>
      )}
      <CaseLibrary title="🎬 Pericardiectomy, constriction and TAVI in a hostile aorta — channel searches" channels={RADIATION_SEARCHES}>
        These open searches on the recommended channels (not individual videos). Look for the phrenic nerves, the waffle incisions and the moment the ventricle bulges.
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🛏️ 15:00</span>Cardiac ICU. Ventilated, warming. Noradrenaline 0.06 µg/kg/min, milrinone 0.375 µg/kg/min. Sinus rhythm 88 with PR 280 ms. CVP 13, cardiac index 2.3. Two drains, 120 mL in the first hour. Atrial and ventricular epicardial wires are taped to her chest.</p>
      </div>
      <ECG12 rate={88} pr={0.28} caption="Sinus rhythm 88/min, PR 280 ms — longer than before TAVI. Voltages already higher now the shell is gone." />
      <MultiSelect id="s8-mon" question="What do you monitor tonight, and why?"
        items={[
          { id: 'rv', label: 'CVP trend, cardiac index, lactate, mixed venous saturation — and RV size on echo', correct: true, why: 'The freed RV is the organ at risk tonight.' },
          { id: 'drains', label: 'Drain output hourly, and drains that suddenly STOP', correct: true, why: 'A raw epicardium bleeds; a clotted drain hides a collection.' },
          { id: 'pace', label: 'Pacing thresholds on both atrial and ventricular wires; a pacing box connected', correct: true, why: 'Scarred conduction, a TAVI frame, and fresh surgery: complete block can come at any time.' },
          { id: 'phrenic', label: 'Diaphragm position on the morning X-ray and on ultrasound before extubation', correct: true, why: 'Phrenic injury in fibrotic lungs means a long wean.' },
          { id: 'renal', label: 'Urine output and creatinine', correct: true, why: 'Kidneys hurt by months of congestion and diuretics.' },
          { id: 'glu', label: 'Glucose 6–10 mmol/L and the wound', correct: true, why: 'Irradiated skin heals badly; hyperglycaemia makes it worse.' },
          { id: 'hb', label: 'A target haemoglobin above 130 g/L by routine transfusion', correct: false, why: 'Transfuse to a restrictive threshold (around 75–80 g/L) unless she is bleeding or ischaemic.' },
        ]} />
      <Decision id="s8-mil" question="Milrinone: which prescription?"
        options={[
          { id: 'inf', label: '0.25–0.5 µg/kg/min infusion, no loading bolus; reduce the dose for her eGFR', verdict: 'best', points: 10,
            why: 'The 50 µg/kg bolus causes abrupt vasodilation; most ICUs omit it. Milrinone is cleared by the kidney — with an eGFR of 35 it accumulates.' },
          { id: 'bolus', label: '50 µg/kg loading over 10 minutes, then 0.75 µg/kg/min', verdict: 'wrong', points: 2, why: 'The labelled regimen — and a hypotensive, arrhythmic one for an irradiated heart with poor kidneys.' },
          { id: 'dob', label: 'Swap to dobutamine 20 µg/kg/min', verdict: 'wrong', points: 0, why: 'A high dose: tachycardia and arrhythmia. Dobutamine at 2.5–5 µg/kg/min is an alternative, not this.' },
        ]} />
      <Decision id="s8-dapt" question="Her RCA stent is 6 weeks old. Clopidogrel was stopped 5 days before surgery. When does it restart?"
        options={[
          { id: 'soon', label: 'Once drain output has settled — usually within 24–48 h — then complete 6 months of dual antiplatelet therapy; aspirin lifelong', verdict: 'best', points: 10,
            why: 'ESC 2024: 6 months of DAPT after elective PCI by default (shorter if bleeding risk is high). A long gap after an early stent invites stent thrombosis — in the vessel feeding her RV.' },
          { id: 'never', label: 'Not until the sternum has healed at 6 weeks', verdict: 'wrong', points: 0, why: 'A month and a half without P2Y12 cover on a fresh ostial stent.' },
          { id: 'now', label: 'Tonight, in the ICU', verdict: 'wrong', points: 2, why: 'Not while the drains are still running.' },
        ]} />
      <Decision id="s8-thy" question="TSH 18 before surgery; levothyroxine 25 µg started 6 weeks ago. Now?"
        options={[
          { id: 'step', label: 'Continue, increase by 25 µg every 4–6 weeks to a normal TSH, watching for angina', verdict: 'best', points: 8,
            why: 'Low and slow in coronary disease. Untreated, hypothyroidism worsens effusions, fatigue and diuretic response.' },
          { id: 'full', label: 'Full replacement (1.6 µg/kg) now', verdict: 'wrong', points: 0, why: 'Too fast for a woman with coronary disease and a fresh operation.' },
          { id: 'stop', label: 'Stop it until she is home', verdict: 'wrong', points: 2, why: 'No reason to stop.' },
        ]} />
      <Why title="⏱️ Why a scarred ventricle needs its atrial kick"
        chain={[
          { k: 'STIFF LV', t: 'Radiation scar and years in a shell leave a ventricle that fills poorly in early diastole.' },
          { k: 'LATE FILLING', t: 'More of its filling depends on the atrium contracting at the end of diastole.' },
          { k: 'LOSE THE KICK', t: 'In complete heart block — or with ventricular-only pacing — the atrium contracts at random, often against a closed valve.' },
          { k: 'LESS OUTPUT', t: 'Stroke volume falls by a quarter or more, at the moment the RV is weakest.' },
          { k: 'THE PLAN', t: 'Atrial AND ventricular wires; pace AV-sequentially (DDD) when the PR stretches into block.' },
        ]} />
      <Contrast title="🎯 a CVP target vs a CVP memory"
        is={{ h: 'Tonight’s target', points: ['The lowest CVP that gives an adequate index and lactate.', 'Usually 10–14 mmHg now.', 'Read with the echo: RV size and TR.'] }}
        isnt={{ h: 'Yesterday’s number', points: ['Her CVP of 20 belonged to the shell.', 'Chasing it overfills a weak RV.', 'A high CVP after pericardiectomy is a warning, not reassurance.'] }} />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — 23:40
   ============================================================ */

function Crisis() {
  const { answers, answer, setVitals } = useCase();
  const r = answers['s9-resus'];
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>🌙 23:40</span>
          The ICU nurse calls: the pressure has fallen to 76/46 over twenty minutes and the heart rate to 44. The CVP has risen from 13 to 21. Urine 10 mL in the last hour. She gave a 250 mL bolus at 23:20 “for the low pressure” — it got worse.
        </p>
      </div>
      <BedsideMonitor />
      <ECG12 rate={44} rhythm="chb" atrialRate={92} caption="Complete heart block: P waves at 92/min marching through, a broad escape rhythm at 44/min." />

      <Decision id="s9-dx" question="What is happening?"
        options={[
          { id: 'rv', label: 'Acute RV failure after pericardiectomy, made worse by complete heart block (lost atrial kick, slow rate) and by the fluid', verdict: 'best', points: 10,
            why: 'A rising CVP with a falling pressure after a bolus says the right heart cannot take the volume. The block removes the atrial kick a stiff, scarred heart relies on.' },
          { id: 'tamp', label: 'Post-operative tamponade', verdict: 'ok', points: 4, why: 'The first thing to exclude: rising CVP and falling pressure fit. But the drains are draining and the echo will show no collection.' },
          { id: 'hypo', label: 'Hypovolaemia — she needs more fluid', verdict: 'wrong', points: 0, why: 'The CVP is 21 and rising.' },
          { id: 'vaso', label: 'Vasoplegia', verdict: 'wrong', points: 2, why: 'Vasoplegia gives a warm, low-resistance state with a LOW CVP.' },
        ]} />
      <div className="cs-h2">🔎 The echo</div>
      <RVEcho mode="crisis" />
      <Why title="🌊 Why the 23:20 bolus made her worse"
        chain={[
          { k: 'FAILING RV', t: 'A weak, dilated RV sits on the flat part of its Starling curve: more stretch, no more output.' },
          { k: 'MORE VOLUME', t: 'The bolus stretches it further and widens the tricuspid annulus: more TR.' },
          { k: 'SEPTUM', t: 'The bigger RV pushes the septum into the LV. The LV fills less.' },
          { k: 'PRESSURE FALLS', t: 'Less LV filling, less output, lower aortic pressure — and the aortic pressure perfuses the RV.' },
          { k: 'THE SIGN', t: 'A rising CVP with a falling pressure after fluid: stop the fluid.' },
        ]} />
      <Contrast title="🩸 tamponade vs RV failure after cardiac surgery"
        is={{ h: 'Tamponade', points: ['Drains that suddenly stop or a clot around the heart on echo.', 'Chambers compressed: small RV, collapsing RA.', 'Fix: re-open the chest, evacuate the clot.'] }}
        isnt={{ h: 'RV failure (hers)', points: ['Drains draining; no collection.', 'A big, poorly moving RV, severe TR, a D-shaped LV.', 'Fix: pacing, pressure, inotropy, pulmonary vasodilation, decongestion — and mechanical support if needed.'] }} />

      <div className="cs-h2">🚨 Act — and watch the numbers</div>
      <p className="cs-p">Choose what you do, one at a time. Each action changes her haemodynamics and the monitor above. Hand over when the plan is set.</p>
      <LowOutputResus done={r} onVitals={v => setVitals(v)} onResult={res => answer('s9-resus', res)} />
      <ScoreOnce id="s9-resus" pts={r == null ? null : r.pts} max={20} />
      {r && (
        <>
          <Decision id="s9-def" question="03:00. Index 2.4, lactate falling, paced at 90. By day 5 the PR has not come back and she is still dependent on the epicardial wires. Definitive plan?"
            options={[
              { id: 'csp', label: 'A permanent pacemaker with an atrial lead — dual-chamber, or conduction-system pacing to keep the ventricles synchronous', verdict: 'best', points: 10,
                why: 'Infranodal block after TAVI and surgery in a scarred conduction system rarely recovers. Keep the atrial kick, and avoid the dyssynchrony of long-term RV apical pacing in a heart already scarred.' },
              { id: 'vvi', label: 'A single-chamber ventricular pacemaker', verdict: 'wrong', points: 2, why: 'Loses AV synchrony — and her stiff ventricle depends on the atrial kick.' },
              { id: 'wait', label: 'Wait another three weeks on temporary wires', verdict: 'wrong', points: 0, why: 'Epicardial wire thresholds rise and wires fail; infection risk grows.' },
            ]} />
          <Note kind="pearl" title="🌅 Day 2">Paced at 90, noradrenaline weaned, milrinone halved, ultrafiltration off 2 L. RV smaller, TR moderate. Extubated on day 3; both hemidiaphragms move.</Note>
        </>
      )}
      <Video id="smxiajBSLI4" title="Cardiac tamponade vs constrictive pericarditis vs restrictive cardiomyopathy" channel={UNVERIFIED} />
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
      <ViciousCycle id="cyc-diur" title="💧 The diuretic trap — six months at home"
        nodes={[
          { short: 'Fixed SV', t: 'The shell fixes the stroke volume', d: 'Filling stops abruptly in early diastole; the output cannot rise.' },
          { short: 'Low output', t: 'The kidneys sense a low output', d: 'Renin, angiotensin, aldosterone, vasopressin: hold salt and water.' },
          { short: 'Congestion', t: 'Oedema and ascites accumulate', d: 'The body’s fix fills the veins, not the heart.' },
          { short: 'More diuretic', t: '“Diuretic resistance”: the dose is doubled, metolazone added', d: 'Plasma volume falls faster than the tissues can refill it.' },
          { short: 'Underfilled', t: 'Filling pressure falls below what the shell needs', d: 'Stroke volume falls further. Creatinine rises, sodium falls.' },
        ]}
        breaks={[
          { at: 0, t: 'Remove the shell: pericardiectomy is the only cure.' },
          { at: 3, t: 'Diagnose before you escalate: an echo in every “resistant” right-heart failure.' },
          { at: 4, t: 'Diurese to comfort, not to dryness; daily weights and creatinine.' },
          { at: 2, t: 'Therapeutic paracentesis for comfort while the definitive plan is made.' },
        ]} />
      <Decision id="cyc-q1" question="A patient with constriction on furosemide 120 mg is still oedematous and the creatinine is rising. The single most useful next step?"
        options={[
          { id: 'mech', label: 'Recognise that the limit is mechanical and refer for pericardiectomy — hold the escalation', verdict: 'best', points: 10, why: 'More diuretic cannot fix a shell; it only lowers the filling the shell needs.' },
          { id: 'meto', label: 'Add metolazone', verdict: 'wrong', points: 0, why: 'The trap.' },
        ]} />
      <ViciousCycle id="cyc-rv" title="🎈 The freed-RV spiral — 23:40"
        nodes={[
          { short: 'RV dilates', t: 'Freed, the weak RV dilates', d: 'Years in a cast have thinned it.' },
          { short: 'TR', t: 'The tricuspid annulus stretches: TR', d: 'More volume sloshes back and forth; less goes forward.' },
          { short: 'Septum shifts', t: 'The septum bows into the LV', d: 'Interdependence: a big RV makes a small LV.' },
          { short: 'Hypotension', t: 'LV output and aortic pressure fall', d: 'Worse with heart block: no atrial kick, a slow rate.' },
          { short: 'RV ischaemia', t: 'RV coronary perfusion falls', d: 'The RV is perfused through systole and diastole by aortic pressure; less pressure, weaker RV, more dilation.' },
        ]}
        breaks={[
          { at: 0, t: 'Do not chase the old CVP; decongest — diuretics or ultrafiltration.' },
          { at: 3, t: 'Noradrenaline for perfusion pressure; AV-sequential pacing for rate and kick.' },
          { at: 4, t: 'Milrinone (no bolus) and inhaled nitric oxide: help the RV contract and lower its afterload.' },
          { at: 2, t: 'If the index stays low: VA-ECMO or an RV assist device, early.' },
        ]} />
      <Decision id="cyc-q2" question="In RV failure, why does noradrenaline often come BEFORE more inotrope?"
        options={[
          { id: 'cpp', label: 'The aortic pressure is the RV’s own perfusion pressure; a hypotensive RV is an ischaemic RV', verdict: 'best', points: 10, why: 'Restore the pressure first, then improve contractility and afterload.' },
          { id: 'pvr', label: 'Noradrenaline lowers pulmonary vascular resistance', verdict: 'wrong', points: 0, why: 'It does not; at high doses it may raise it.' },
        ]} />
      <ViciousCycle id="cyc-beam" title="☢️ The slow burn — twenty years in the making"
        nodes={[
          { short: 'Microvessels', t: 'Radiation kills small-vessel endothelium', d: 'In pericardium, valves, coronaries, conduction tissue, lungs.' },
          { short: 'Ischaemia', t: 'Chronic low-grade tissue ischaemia', d: 'Too few capillaries for the tissue.' },
          { short: 'Fibrosis', t: 'Fibroblasts activated; collagen; calcium', d: 'Thick pericardium, stiff valves, ostial plaques.' },
          { short: 'Stiffness', t: 'Stiff, poorly perfused tissue', d: 'Fewer vessels still, and more ischaemia.' },
        ]}
        breaks={[
          { at: 0, t: 'Prevention: modern involved-site RT, lower doses, breath-hold, protons — far lower heart doses than a mantle field.' },
          { at: 2, t: 'Surveillance: echo and ischaemia testing in survivors, so the disease is found early.' },
          { at: 3, t: 'Control risk factors aggressively: statin, blood pressure, smoking — they add to the radiation damage.' },
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
      <WarStory title="🫃 The cirrhosis that was a heart"
        mistake="Ascites worked up as cryptogenic cirrhosis without anyone measuring the JVP."
        burn="Look at the neck before the liver. High SAAG + high protein ascites = the heart until proven otherwise.">
        <p className="cs-p">A 61-year-old with ascites and a “nodular liver”, treated for 18 months as cirrhosis: banding, spironolactone, a liver transplant assessment. He died of spontaneous bacterial peritonitis and renal failure. At autopsy, a calcified pericardium 8 mm thick and a congested, not cirrhotic, liver.</p>
      </WarStory>
      <Decision id="mm-neck" question="Which single bedside finding should have redirected his care?"
        options={[
          { id: 'jvp', label: 'A raised JVP that rises on inspiration', verdict: 'best', points: 10, why: 'Cirrhosis does not raise the JVP. Kussmaul points at the heart.' },
          { id: 'spider', label: 'The absence of spider naevi', verdict: 'wrong', points: 0, why: 'Helpful, but not decisive.' },
        ]} />
      <WarStory title="💧 The HFpEF that was dried out"
        mistake="Escalating diuretics and adding metolazone for “resistant HFpEF” without an echo looking for constriction."
        burn="Diuretic resistance in right-heart failure is a diagnosis to make, not a dose to increase.">
        <p className="cs-p">A lymphoma survivor, 48, with oedema: furosemide 160 mg, then metolazone daily. Sodium 118, potassium 2.6, creatinine 390. She arrested in VF on the ward. Resuscitated; an echo the next day showed a septal bounce and 40% mitral E variation. She died on day 9 of multi-organ failure, before a pericardiectomy could be done.</p>
      </WarStory>
      <WarStory title="✂️ The anterior strip"
        mistake="A partial pericardiectomy through a left thoracotomy, leaving the diaphragmatic and right-sided pericardium."
        burn="Pericardiectomy is radical — phrenic to phrenic, the diaphragmatic surface, the cavo-atrial junctions — or it is a delay.">
        <p className="cs-p">“A smaller operation for a radiated chest.” Better for four months; then the ascites returned. The redo sternotomy through a fused, irradiated mediastinum tore the RV on re-entry. She bled to death on the table.</p>
      </WarStory>
      <Decision id="mm-strip" question="What should the first operation have been?"
        options={[
          { id: 'rad', label: 'A radical pericardiectomy via sternotomy, including the diaphragmatic surface and the right-sided pericardium', verdict: 'best', points: 10, why: 'Lower recurrence; the first operation is the best chance.' },
          { id: 'thor', label: 'The same thoracotomy, more carefully', verdict: 'wrong', points: 0, why: 'A thoracotomy cannot reach the right heart and the IVC.' },
        ]} />
      <WarStory title="🦴 The clamp on the eggshell"
        mistake="Cross-clamping a porcelain aorta for a surgical AVR in an irradiated patient."
        burn="A porcelain aorta is a no-touch aorta: no clamp, no cannula. Choose TAVI, or a different strategy.">
        <p className="cs-p">A 66-year-old after breast and mediastinal radiotherapy, booked for AVR. The CT comment “aortic calcification” was not read as circumferential. The clamp cracked the shell. She woke with a dense left hemiplegia and aphasia, and was ventilated for three weeks.</p>
      </WarStory>
      <WarStory title="💉 The induction"
        mistake="A standard propofol induction in a patient with constriction and severe aortic stenosis."
        burn="Fixed output: fast, full, tight. Vasopressor running before induction; the surgeon scrubbed; femoral access ready.">
        <p className="cs-p">Propofol 2 mg/kg for a pericardiectomy. Pressure 50/30 within a minute, then bradycardia, then PEA. No access to the heart through a closed, fused sternum. Twelve minutes of CPR before emergency femoral bypass. She survived with a hypoxic brain injury.</p>
      </WarStory>
      <Decision id="mm-ind" question="What would have prevented that arrest?"
        options={[
          { id: 'fft', label: 'A titrated induction on a running vasopressor, keeping the heart rate up and the veins full, with femoral bypass ready before induction', verdict: 'best', points: 10, why: 'The haemodynamic goals of a fixed-output heart.' },
          { id: 'more', label: 'A slower propofol injection', verdict: 'wrong', points: 2, why: 'Still a vasodilator and a myocardial depressant; slower helps a little, not enough.' },
        ]} />
      <WarStory title="🏃 The young woman’s chest pain"
        mistake="Exertional chest tightness in a 38-year-old Hodgkin survivor labelled anxiety, with no ischaemia test."
        burn="In a survivor of chest radiation, cardiac symptoms are cardiac until proven otherwise — at any age.">
        <p className="cs-p">“You’re young, no risk factors.” Six weeks later she collapsed on a treadmill: VF. Ostial left main 90%. She died in the ED.</p>
      </WarStory>
      <Decision id="mm-screen" question="What surveillance do survivors of high-dose chest radiotherapy need?"
        options={[
          { id: 'surv', label: 'Regular heart checks: an echo from about 5–10 years after treatment and repeated (around every 5 years), with ischaemia testing in those at high risk — and a low threshold to investigate symptoms', verdict: 'best', points: 10,
            why: 'Recommended in the 2013 EACVI/ASE consensus and the 2022 ESC cardio-oncology guideline (the exact interval depends on dose and other risks). Plus aggressive risk-factor control.' },
          { id: 'sympt', label: 'Investigate only if symptoms develop', verdict: 'wrong', points: 0, why: 'Valve disease, constriction and coronary disease are often silent until late.' },
        ]} />
      <WarStory title="🎈 The litre for the freed RV"
        mistake="Treating low output after a pericardiectomy with repeated fluid boluses to restore the pre-operative CVP."
        burn="After pericardiectomy, a rising CVP with a falling pressure is RV failure. Stop the fluid; pace, press, support, decongest.">
        <p className="cs-p">Three litres overnight “to get the CVP back to 20”. By morning the RV filled the chest on echo, severe TR, lactate 11. ECMO was started too late; he died on day 4.</p>
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🏠 day 12 after surgery</span>Weight 62 kg, no ascites, JVP 4 cm and falling on inspiration. Dual-chamber pacemaker. Walking the ward corridor four times a day. Her daughter brings the seating plan for the wedding.</p>
      </div>
      <MultiSelect id="s12-home" question="Her discharge and survivorship plan?"
        items={[
          { id: 'dapt', label: 'Aspirin 75 mg lifelong; clopidogrel 75 mg to complete 6 months after the RCA stent', correct: true, why: 'DAPT for the stent; aspirin alone afterwards also covers the TAVI.' },
          { id: 'diur', label: 'The lowest effective furosemide dose, a weight diary, and a plan to reduce it', correct: true, why: 'Her congestion should melt away over weeks; over-diuresis is now the risk.' },
          { id: 'thy', label: 'Levothyroxine titrated every 4–6 weeks to a normal TSH', correct: true, why: 'Radiation hypothyroidism.' },
          { id: 'echo', label: 'Echo at 3 months (pericardial result, TAVI, RV) and then at least yearly', correct: true, why: 'Residual restriction, valve function, RV recovery.' },
          { id: 'ie', label: 'Endocarditis prophylaxis advice for dental procedures — she has a transcatheter valve', correct: true, why: 'A prosthetic valve, including TAVI, is high risk.' },
          { id: 'surv', label: 'Survivorship: carotid duplex (neck in the field), breast screening as a high-risk woman, lung and thyroid follow-up, re-imaging of the left main', correct: true, why: 'The beam touched more than her heart.' },
          { id: 'pace', label: 'Pacemaker clinic and remote monitoring', correct: true, why: 'She is pacing-dependent.' },
          { id: 'warf', label: 'Warfarin for the TAVI', correct: false, why: 'No oral anticoagulant after TAVI without another indication; single antiplatelet therapy is the default.' },
        ]} />

      <div className="cs-h2">📝 Case quiz</div>
      <Quiz id="s12-quiz" items={[
        { q: 'Kussmaul sign is…', options: ['A JVP that falls on inspiration', 'A JVP that rises on inspiration', 'A fall in systolic pressure > 10 mmHg on inspiration', 'A pulsatile liver'], answer: 1, why: 'The venous return cannot enter a heart in a fixed box (or a very stiff right heart).' },
        { q: 'Which JVP feature argues for constriction over tamponade?', options: ['Absent y-descent', 'Steep, deep y-descent', 'Giant v-waves', 'Cannon a-waves'], answer: 1, why: 'Free, fast early filling, then a sudden halt; in tamponade there is no free filling.' },
        { q: 'Ascitic fluid with SAAG ≥ 11 g/L and protein ≥ 25 g/L suggests…', options: ['Cirrhosis', 'Cardiac (post-sinusoidal) ascites', 'Peritoneal malignancy', 'Nephrotic syndrome'], answer: 1, why: 'High pressure, healthy leaky sinusoids.' },
        { q: 'Mitral E-wave respiratory variation that favours constriction is…', options: ['≥ 5%', '≥ 10%', '≥ 25%', '≥ 60%'], answer: 2, why: 'E falls on inspiration by ≥ 25%.' },
        { q: 'Annulus reversus means…', options: ['Lateral e′ > septal e′', 'Septal e′ > lateral e′', 'e′ < 5 cm/s', 'Reversed hepatic flow'], answer: 1, why: 'The lateral wall is tethered to the scarred pericardium.' },
        { q: 'The most specific catheter sign of constriction is…', options: ['Dip-and-plateau', 'Equal end-diastolic pressures', 'Discordant LV and RV systolic peaks with respiration', 'A high RA pressure'], answer: 2, why: 'Interdependence; dip-and-plateau occurs in restriction too.' },
        { q: 'Hepatic vein diastolic flow reversal in EXPIRATION favours…', options: ['Constriction', 'Restriction', 'Tamponade', 'Normal'], answer: 0, why: 'In restriction it is inspiratory.' },
        { q: 'Why is a porcelain aorta important in her plan?', options: ['It raises the AS gradient', 'It cannot be safely clamped or cannulated', 'It causes constriction', 'It changes the TAVI size'], answer: 1, why: 'A no-touch aorta: TAVI for the valve, femoral cannulation for bypass.' },
        { q: 'During pericardiectomy, which side is freed first?', options: ['The RV', 'The LV', 'The right atrium', 'It does not matter'], answer: 1, why: 'Free the RV first and it floods a still-caged LV and the lungs.' },
        { q: 'After pericardiectomy, a rising CVP with falling blood pressure after a fluid bolus suggests…', options: ['Hypovolaemia', 'Vasoplegia', 'RV failure (or tamponade — echo decides)', 'Over-sedation'], answer: 2, why: 'Stop the fluid; look with echo; support the RV.' },
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
          <li className="cs-li">☢️ A chest radiotherapy survivor with heart failure: think of everything the beam touched — pericardium, valves, coronary ostia, conduction, aorta, lungs, thyroid.</li>
          <li className="cs-li">👀 Look at the neck before the liver. A raised JVP and high-protein, high-SAAG ascites mean the heart.</li>
          <li className="cs-li">🧱 Constriction: steep y, Kussmaul, a knock, little pulsus paradoxus. Tamponade: no y, paradoxus.</li>
          <li className="cs-li">🔀 Interdependence is the signature of the shell: E variation ≥ 25%, septal bounce, expiratory hepatic reversal, discordant LV–RV peaks.</li>
          <li className="cs-li">🫀 The muscle tells you it is the muscle: low e′, high PA pressure, high BNP. High e′ with high pressures (annulus paradoxus) points to the shell.</li>
          <li className="cs-li">💧 You cannot diurese away a shell. Escalating diuretics in constriction kills kidneys, then patients.</li>
          <li className="cs-li">📉 Constriction lowers flow: an aortic gradient can under-call a severe valve. Use AVA, SVi and calcium.</li>
          <li className="cs-li">🦴 The irradiated chest is hostile: no-touch porcelain aorta, redo-style entry, spare the mammaries — and the risk scores cannot see any of it.</li>
          <li className="cs-li">✂️ Pericardiectomy is radical, phrenic to phrenic, LV before RV; leave calcium islands on coronaries; waffle a visceral peel.</li>
          <li className="cs-li">🎈 After the shell comes off, the weak RV can fail: do not chase the old CVP. Pace, press, support, decongest.</li>
        </ol>
      </div>
      <Video id="5_EkVuMeNRA" title="Pericardial Knock in Constrictive Pericarditis" channel={UNVERIFIED} />
      <CaseLibrary playlist={VALVE_PLAYLIST} start={VALVE_PLAYLIST_START} channels={VALVE_CHANNELS}>
        Keep going: more structural and valvular cases from the same teams.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const VALVE_03 = {
  title: 'Radiation heart disease · Constriction, valve or muscle? · The hostile chest',
  short: 'Structural Heart · Case 03',
  patient: {
    name: 'Mrs Siobhan Kearney',
    meta: '54 F · MRN 4126-0503 · 71 kg',
    flags: [
      { text: 'Mantle RT 36 Gy (2002)', tone: 'red' },
      { text: 'Doxorubicin 200 mg/m²', tone: 'amber' },
      { text: 'Labelled “cirrhosis”', tone: 'amber' },
      { text: 'Furosemide 120 mg', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 60, limit: 120, basis: 'volume/eGFR ≤ 3.7' },
  clock0: day(1, 10, 20),
  vitals0: { hr: 96, sys: 102, dia: 78, spo2: 94, rr: 22, st: 0, rhythm: 'sinus' },
  brand: { icon: '☢️', line: 'Structural Heart · Case 03 · Grand Rounds' },
  hero: {
    badges: [
      { text: 'Grand rounds · valves + pericardium', tone: 'cyan' },
      { text: 'Cardio-oncology survivorship', tone: 'red' },
      { text: 'ESC 2025 VHD & pericardial-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'Everything', style: 'outline' },
      { text: 'the beam', style: 'grad' },
      { text: 'touched', style: 'cyan' },
    ],
    hook: (
      <>
        Twenty-four years after the radiotherapy that cured her lymphoma, a head teacher arrives with a belly full of fluid and a referral for <b>cirrhosis</b>.
        Her liver is innocent. Her pericardium is a <span className="r">calcified shell</span>, her aortic valve is stone, her aorta is porcelain and her coronary ostia are narrowing.
        You will read her neck, measure the breath in her mitral inflow, pull apart two ventricles that move in <span className="g">opposite directions</span>,
        plan an operation in the most hostile chest in surgery — and meet the right ventricle that fails the night it is set free.
      </>
    ),
    image: null,
    sims: 's2',
    crisis: 's9',
    cards: [
      { k: '👩‍🏫 The patient', t: 'Mrs Siobhan Kearney, 54 — mantle RT and doxorubicin at 30; ascites, oedema, “cirrhosis”.' },
      { k: '🩺 Your role', t: 'From the ED to the echo lab, the catheter lab, grand rounds, theatre and the ICU at night.' },
      { k: '🎛️ In your hands', t: 'A JVP and knock viewer, mitral inflow with breathing, simultaneous LV–RV pressures, a contrast board, a hostile-chest planner, the pericardiectomy and an RV rescue.' },
      { k: '⚖️ How it teaches', t: 'Constriction vs restriction vs valve — the shell, the muscle, the door — always side by side.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'The cirrhosis that wasn’t', Component: Presentation,
      pill: '🫃 10:20 — ascites, and veins to her ears',
      lede: 'Read the neck, the tap and the beam’s footprint — and stop the diuretic spiral.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 96, sys: 102, dia: 78, spo2: 94, rr: 22, rhythm: 'sinus' }); atLeastClock(day(1, 10, 20)); } },
    { id: 's2', icon: '📏', nav: 'Echo & Catheter', title: 'Shell, muscle or valve? — echo and catheter', Component: Measure,
      pill: '🎯 Measure the breath in her heart',
      lede: 'Mitral inflow with respiration, e′, hepatic veins, the aortic valve, and both ventricles at once.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 92, sys: 104, dia: 76, spo2: 95, rr: 18, rhythm: 'sinus' }); atLeastClock(day(2, 9, 0)); } },
    { id: 's3', icon: '👥', nav: 'Grand Rounds', title: 'Grand rounds: the heart team', Component: HeartTeam,
      pill: '🧭 Day 6 — which lesion, which route, which order?',
      lede: 'The beam’s slow burn, the plan in stages, and two hard conversations.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 90, sys: 106, dia: 76, spo2: 96, rhythm: 'sinus' }); atLeastClock(day(6, 14, 0)); } },
    { id: 's4', icon: '🧮', nav: 'Planning', title: 'Planning: TAVI and the hostile chest', Component: Planning,
      pill: '🪚 Every hazard the beam left behind',
      lede: 'Ostial disease, a calcified curtain, a porcelain aorta — and the sternotomy-risk planner.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 88, sys: 108, dia: 74, spo2: 96, rhythm: 'sinus' }); atLeastClock(day(7, 9, 0)); } },
    { id: 's5', icon: '🩸', nav: 'Set-up', title: 'Set-up: the morning of the pericardiectomy', Component: Setup,
      pill: '🫗 Week 6 — fast, full and tight',
      lede: 'What must be ready before the saw, and why induction is the dangerous minute.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 90, sys: 108, dia: 76, spo2: 96, rr: 16, rhythm: 'sinus' }); atLeastClock(day(45, 7, 30)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy: three forks in the operation', Component: Strategy,
      pill: '🔱 Pump, order, calcium',
      lede: 'Every fork plays out — choose, and see what follows.',
      enter: ({ atLeastClock }) => atLeastClock(day(45, 8, 30)) },
    { id: 's7', icon: '🛠️', nav: 'Pericardiectomy', title: 'The pericardiectomy', Component: Operation,
      pill: '✂️ Free the heart, region by region',
      lede: 'Phrenic to phrenic, LV first, islands and waffles — watch the plateau melt.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 92, sys: 100, dia: 62, spo2: 98, rr: 12, rhythm: 'sinus' }); atLeastClock(day(45, 9, 0)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit: the first evening', Component: Recovery,
      pill: '💊 Milrinone, clopidogrel, thyroxine — at the right dose',
      lede: 'What to watch tonight, and why her old CVP is not a target.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 88, sys: 104, dia: 60, spo2: 97, rr: 14, rhythm: 'sinus' }); atLeastClock(day(45, 15, 0)); } },
    { id: 's9', icon: '🚨', nav: 'Night Crisis', title: '23:40 — the freed ventricle fails', Component: Crisis,
      pill: '🌙 Low output, heart block, a rising CVP',
      lede: 'Recognise RV failure, rule out tamponade, act — and watch her numbers move.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 44, sys: 76, dia: 46, spo2: 91, rr: 16, rhythm: 'chb' }); atLeastClock(day(45, 23, 40)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycles', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'The diuretic trap, the freed-RV spiral, and the slow burn of the beam.',
      enter: ({ setVitals }) => setVitals({ hr: 90, sys: 112, dia: 66, spo2: 97, rhythm: 'paced' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Seven patients who taught these rules.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'Her plan for the years ahead, the quiz — then your score.',
      enter: ({ atLeastClock }) => atLeastClock(day(57, 11, 0)) },
  ],
};

export default function Valve03({ onClose }) {
  return <CaseShell def={VALVE_03} onClose={onClose} />;
}
