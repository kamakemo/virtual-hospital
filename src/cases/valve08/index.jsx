import React from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Figure, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import { Echo as SubcostalEcho } from '../kit/Physiology.jsx';
import {
  JVPViewer, TRDopplerLab, TRQuantify, RVPACoupling, RHCLab, TriScore, TricuspidClip, RVResusBoard, TherapyPlanner, TRI_ITEMS,
} from './sims.jsx';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 08
   Severe secondary ("functional") tricuspid regurgitation — the
   forgotten valve. A 74-year-old with twelve years of AF, HFpEF
   and a VVI pacemaker lead across the valve arrives with ascites,
   oedema, early satiety, a raised bilirubin and a referral
   letter that says "cryptogenic cirrhosis".

   The arc: the neck and the pulsatile liver; a TR jet whose LOW
   velocity hides a torrential leak (and a falsely reassuring
   PASP); vena contracta and PISA on the five-grade scale; RV–PA
   coupling; right heart catheterisation — Fick, not
   thermodilution — and the pre- vs post-capillary question that
   decides who benefits; TRI-SCORE; the heart team; T-TEER with a
   lead in the valve; and, the night after, the RV that has lost
   its pop-off valve: acute afterload mismatch, managed with RV
   physiology.

   Clinical content follows the 2025 ESC/EACTS valvular heart
   disease guideline, the 2022 ESC/ERS pulmonary hypertension
   guideline (haemodynamic definitions), the 2021 ESC HF
   guideline with its 2023 focused update (diuretics, SGLT2
   inhibitors in HFpEF), the 2024 ESC AF guideline, the ASE/EACVI
   right-heart and regurgitation standards with the proposed
   five-grade TR scale (Hahn & Zamorano), TRI-SCORE (Dreyfus,
   Eur Heart J 2022), TRILUMINATE Pivotal (NEJM 2023) and
   TRISCEND II (NEJM 2024/25), simplified for teaching.
   ============================================================ */

const WIKI = f => `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=960`;
const WIKIPAGE = f => `https://commons.wikimedia.org/wiki/File:${f}`;
const min = (h, m) => h * 60 + m;

const TRICUSPID_SEARCHES = [
  { name: 'CCC Live Cases — tricuspid', url: 'https://www.youtube.com/@CCCLiveCases/search?query=tricuspid', note: 'Live tricuspid TEER and replacement cases' },
  { name: 'Gulf Intervention Society — tricuspid', url: 'https://www.youtube.com/@gulfinterventionsociety/search?query=tricuspid', note: 'Tricuspid cases and talks' },
  { name: 'Interventional Cardiology — TriClip', url: 'https://www.youtube.com/@interventionalcardiologyis3814/search?query=TriClip', note: 'Tricuspid TEER cases' },
  { name: 'CCC Live Cases — EVOQUE', url: 'https://www.youtube.com/@CCCLiveCases/search?query=EVOQUE', note: 'Transcatheter tricuspid valve replacement' },
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

function ScoreOnce({ id, pts, max }) {
  const { award, stageId } = useCase();
  React.useEffect(() => { if (pts != null) award(stageId, id, pts, max); }, [pts]);  // eslint-disable-line
  return null;
}

/* ============================================================
   1 · PRESENTATION — "CIRRHOSIS" THAT PULSES
   ============================================================ */

function Presentation() {
  const { answers, answer, setVitals } = useCase();
  const jvp = answers['s1-jvp'];
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">📅 6 months</span>Mrs Elena Marchetti, 74, a retired seamstress, has watched her belly grow while her arms got thinner. She is full after three mouthfuls. Her ankles, then her thighs, swell by evening. Her GP found a bilirubin of 38 and a big liver; the hepatology letter says <i>“probable cryptogenic cirrhosis — for ultrasound-guided paracentesis and variceal screening.”</i></p>
        <p className="cs-p"><span className="cs-time">📋 history</span>Atrial fibrillation for twelve years, permanent. A VVI pacemaker since 2018 for slow AF with pauses — the lead crosses the tricuspid valve. Hypertension; “stiff heart” (HFpEF) on an echo in 2020. No alcohol — “a glass at Christmas”. Furosemide 80 mg twice daily, apixaban 5 mg twice daily, bisoprolol 2.5 mg, ramipril 2.5 mg. 58 kg (her dry weight was 54).</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🚑 19:20</span>Her daughter calls an ambulance: breathless lying flat, too bloated to eat for two days, and “a bit muddled”. The crew finds her sitting forward on the edge of the sofa.</p>
      </div>

      <Decision id="s1-crew" question="🚑 The crew reads: SpO₂ 95% on air, BP 104/66, AF 88, RR 20, a tense abdomen, chest clear, legs swollen to the knees. Their heart-failure protocol mentions GTN spray. What is the right pre-hospital care?"
        options={[
          { id: 'support', label: 'Sit her up, no GTN, oxygen only if SpO₂ falls below 94%, 12-lead ECG, blood glucose, pre-alert the hospital as right-sided heart failure', verdict: 'best', points: 10,
            why: 'Her lungs are dry: this is RIGHT-sided failure. The RV is preload-dependent and her pressure is soft — a nitrate venodilates, drops RV filling and can drop her pressure. Treat what is in front of you, not the protocol title.' },
          { id: 'gtn', label: 'GTN 400 µg sublingual and IV furosemide', verdict: 'wrong', points: 0,
            why: 'GTN is for LEFT-sided pulmonary oedema with a good blood pressure. In right-heart failure with a systolic of 104 it removes the preload the RV lives on.' },
          { id: 'fluid', label: 'A 250 mL fluid bolus — she is “dry” in the lungs and soft in pressure', verdict: 'wrong', points: 0,
            why: 'She has litres of extra fluid in her belly and legs. More volume stretches an already over-full RV.' },
          { id: 'cpap', label: 'CPAP for the breathlessness', verdict: 'ok', points: 2,
            why: 'CPAP helps LEFT-sided pulmonary oedema. Positive pressure raises RV afterload; her breathlessness is splinting from ascites, not wet lungs.' },
        ]} />

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>📟 Observations · 20:05</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('88 /min, irregularly irregular')], ['Blood pressure', N('104/66 mmHg', 'cs-lo')], ['SpO₂', N('95% on air')],
            ['Resp. rate', N('20 /min')], ['Temperature', N('36.4 °C')], ['Weight', N('58 kg (dry 54)', 'cs-hi')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🩺 Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Sitting at 45°: the JVP reaches the angle of the jaw — her <b>earlobes bob</b> with each beat.</li>
            <li className="cs-li">Liver 6 cm below the costal margin, tender, and it <b>pushes your hand outward</b> with each beat.</li>
            <li className="cs-li">Shifting dullness — tense ascites. Pitting oedema to the thighs, sacral oedema.</li>
            <li className="cs-li">A soft pansystolic murmur at the left lower sternal edge that gets LOUDER on inspiration. Chest clear.</li>
            <li className="cs-li">Mild jaundice. No spider naevi, no palmar erythema, no asterixis.</li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">👀 Look at the neck — then feel the liver</div>
      <p className="cs-p">Compare a normal neck, AF without TR, and hers. Then time her dominant wave against the carotid.</p>
      <JVPViewer done={jvp} onIdentify={id => answer('s1-jvp', id)} />
      {jvp && (
        <div className={'cs-fb ' + (jvp === 'sys' ? 'best' : 'wrong')}>
          {jvp === 'sys'
            ? 'Systolic. The regurgitant jet fills the RA while the RV contracts — the x descent is wiped out and one cv wave rises with the carotid. A systolic, expansile liver is the same wave one floor down.'
            : 'Look again: her big wave rises WITH the carotid upstroke. A presystolic wave is an a wave — and in AF there is no a wave at all.'}
        </div>
      )}
      <ScoreOnce id="s1-jvp" pts={jvp == null ? null : jvp === 'sys' ? 12 : 3} max={12} />

      <Why title="🫀 Why a leaking tricuspid valve makes the liver pulse"
        chain={[
          { k: 'NO VALVES', t: 'There are no valves between the RA, the venae cavae, the hepatic veins and the jugular veins.' },
          { k: 'SYSTOLIC JET', t: 'Each RV contraction squirts blood back into the RA, through the open “door” of a valve that cannot close.' },
          { k: 'PRESSURE WAVE', t: 'The RA pressure jumps in systole — the cv wave — and the jump travels up the neck and down into the liver.' },
          { k: 'EXPANSILE LIVER', t: 'The liver swells against your hand in systole; the hepatic veins run BACKWARDS on Doppler.' },
          { k: 'CONGESTION', t: 'Months of this: centrilobular congestion, cholestasis, a raised bilirubin — “cirrhosis” that is really the heart.' },
        ]}>
        The liver is not the disease. It is a pressure gauge for the right atrium.
      </Why>
      <Contrast title="the giant systolic cv wave vs the cannon a wave"
        is={{ h: 'cv wave of severe TR (hers)', points: ['Rises WITH the carotid and lasts all of systole.', 'Every beat, in AF too.', 'Steep y descent afterwards; expansile liver; earlobes bob.', 'Cause: the valve cannot close.'] }}
        isnt={{ h: 'Cannon a wave', points: ['A sharp, flicking wave when the atrium contracts against a CLOSED tricuspid valve.', 'Intermittent in complete heart block (AV dissociation); regular in junctional rhythm or VVI pacing with retrograde conduction.', 'Needs atrial contraction — impossible in AF.', 'Cause: timing, not a leak.'] }} />

      <ECG12 rate={88} rhythm="af"
        caption="Atrial fibrillation, ventricular rate ~88/min. No paced beats at this rate (VVI back-up at 50). Low-voltage limb leads; rightward axis. No acute ST change." />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧪 Bloods, ascitic tap and imaging</div>
        <Table head={['', 'Result']} rows={[
          ['Sodium · potassium', N('129 · 4.1 mmol/L', 'cs-hi')], ['Creatinine / eGFR', N('152 µmol/L · 30 (baseline 104 · 47)', 'cs-hi')],
          ['Bilirubin · ALP · GGT', N('38 µmol/L · 190 · 240 U/L', 'cs-hi')], ['ALT · albumin · INR', N('48 U/L · 31 g/L · 1.4 (on apixaban)')],
          ['NT-proBNP', N('2,450 ng/L', 'cs-hi')], ['Platelets', N('168 × 10⁹/L')],
          ['Ascitic fluid', 'SAAG 1.7 g/dL · total protein 34 g/L · WCC 120/mm³'],
          ['Liver stiffness (FibroScan, hepatology)', N('31 kPa — “compatible with cirrhosis”', 'cs-hi')],
          ['Abdominal ultrasound', 'Smooth liver edge, dilated hepatic veins and IVC 31 mm with no inspiratory collapse; no varices on recent OGD'],
          ['Chest X-ray', 'Huge right heart border, clear lung fields, pacing lead in the RV apex'],
        ]} />
      </div>

      <Decision id="s1-dx" question="🧭 What is the unifying diagnosis?"
        options={[
          { id: 'tr', label: 'Severe secondary tricuspid regurgitation with right-heart failure: congestive hepatopathy (“cardiac cirrhosis”), cardiac ascites and cardiorenal syndrome', verdict: 'best', points: 10,
            why: 'Pulsatile liver, giant cv waves, a murmur that grows with inspiration (Carvallo), a high-protein high-SAAG ascites, a plethoric IVC and a creatinine that rose with congestion. The liver stiffness is high because the liver is FULL, not scarred.' },
          { id: 'cirr', label: 'Cryptogenic cirrhosis with hepatorenal syndrome', verdict: 'wrong', points: 0,
            why: 'Cirrhotic ascites is low-protein (< 25 g/L); there are no stigmata of chronic liver disease, no varices, and the liver pulses. And hepatorenal syndrome does not raise the JVP to the earlobes.' },
          { id: 'const', label: 'Constrictive pericarditis', verdict: 'ok', points: 3,
            why: 'A fair thought: it also gives high-protein ascites and a raised JVP with a steep y descent. But constriction gives an x AND y descent (“W” or “M” pattern), Kussmaul’s sign, no loud regurgitant cv wave and no pulsatile liver. Echo will settle it.' },
          { id: 'budd', label: 'Budd–Chiari syndrome', verdict: 'wrong', points: 0,
            why: 'Hepatic vein OBSTRUCTION gives a big liver and ascites — but a normal JVP. Her hepatic veins are huge and open.' },
        ]} />
      <Contrast title="cardiac ascites vs cirrhotic ascites"
        is={{ h: 'Cardiac (hers)', points: ['SAAG ≥ 11 g/L (portal pressure is high — transmitted from the RA).', 'Total protein ≥ 25 g/L: the congested sinusoids are still leaky and the liver still makes albumin.', 'JVP up, IVC plethoric, hepatic veins dilated and pulsatile.', 'Treat the heart.'] }}
        isnt={{ h: 'Cirrhotic', points: ['SAAG ≥ 11 g/L too — portal hypertension from scarring.', 'Total protein < 25 g/L: capillarised sinusoids, low albumin.', 'JVP normal; spider naevi, varices, splenomegaly.', 'Treat the liver — and TIPS is an option there, never in severe TR.'] }} />

      <MultiSelect id="s1-tx" question="💧 Tonight on the ward. What do you start?"
        items={[
          { id: 'ivloop', label: 'IV furosemide 80 mg twice daily (≈ her total oral daily dose, given IV), sitting up', correct: true, why: 'Gut oedema slows and blunts oral absorption. ESC 2021: start IV at 1–2× the daily oral dose.' },
          { id: 'una', label: 'Spot urine sodium at 2 hours and hourly urine output for 6 hours', correct: true, why: 'Urine Na < 50–70 mmol/L or < 100–150 mL/h means the dose is too low: double it rather than wait a day.' },
          { id: 'wt', label: 'Daily weight, strict fluid balance, daily U&E and magnesium', correct: true, why: 'Aim for ~0.5–1 kg/day. Watch potassium, sodium and creatinine.' },
          { id: 'hold', label: 'Hold ramipril while the creatinine is climbing and the pressure is soft', correct: true, why: 'A temporary step while she decongests; review once the kidneys respond.' },
          { id: 'tap', label: 'Therapeutic paracentesis if the ascites is tense and limits breathing or eating', correct: true, why: 'Reasonable for symptom relief — it lowers intra-abdominal pressure and can improve renal perfusion. Albumin cover is a cirrhosis rule; in cardiac ascites it is not routinely needed.' },
          { id: 'fr', label: '1 L normal saline because the creatinine is up', correct: false, why: 'Her kidneys are failing from VENOUS congestion, not from being dry. Decongestion usually brings the creatinine DOWN.' },
          { id: 'tips', label: 'Refer for TIPS for refractory ascites', correct: false, why: 'A shunt from portal vein to hepatic vein dumps more volume into an RA that cannot cope — severe TR and PH are contraindications.' },
        ]} />

      <Decision id="s1-una" question="⏱️ At 2 hours: urine output 60 mL/h, spot urine sodium 38 mmol/L. Next?"
        onAnswer={() => setVitals({ hr: 84, sys: 102, dia: 64, spo2: 96, rr: 18 })}
        options={[
          { id: 'double', label: 'Double the IV loop dose now (furosemide 160 mg), recheck in 2–6 hours; add a second diuretic class if still poor', verdict: 'best', points: 10,
            why: 'A poor natriuretic response at 2 hours predicts failure. Escalate the loop first; then sequential nephron blockade (acetazolamide — ADVOR; or a thiazide — CLOROTIC) with close monitoring of Na, K and creatinine.' },
          { id: 'wait', label: 'Wait until tomorrow’s weight', verdict: 'wrong', points: 2, why: 'A lost day of congestion is a lost day of kidney function.' },
          { id: 'met', label: 'Add metolazone 5 mg daily straight away and leave the loop dose alone', verdict: 'ok', points: 3,
            why: 'Thiazide-type add-on works, but escalate the loop first — and metolazone causes the worst hypokalaemia and hyponatraemia (a war story below).' },
        ]} />
      {answers['s1-una'] && <Note kind="pearl" title="📈 Day 3">Furosemide 160 mg IV twice daily: 2.4 L/day out. Weight 55.8 kg. Creatinine 152 → 128 µmol/L. Bilirubin 38 → 31. She eats a whole breakfast.</Note>}

      <div className="cs-media-row">
        <Figure src={WIKI('JVP_waveform.png')} href={WIKIPAGE('JVP_waveform.png')} alt="Normal jugular venous pressure waveform with a, c and v waves and x and y descents" caption="The normal JVP: a, c, v waves and x, y descents. Severe TR erases the x descent and fuses c and v into one tall systolic wave." credit="Wikimedia Commons (see file page for licence)" />
        <Video id="JVfn0JEpuLE" title="NEJM — Giant CV waves of tricuspid regurgitation" />
      </div>
      <div className="cs-media-row">
        <Video id="QQ802snkXGg" title="Lancisi’s sign (CV fusion) of severe tricuspid regurgitation" />
        <Video id="EnNbKyOaHZI" title="Tricuspid regurgitation murmur — description, causes, pathophysiology" />
      </div>
    </>
  );
}

/* ============================================================
   2 · ECHO — THE LOW VELOCITY THAT LIES
   ============================================================ */

function EchoStage() {
  const { answers, answer } = useCase();
  const dop = answers['s2-dop'];
  const q = answers['s2-quant'];
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Transthoracic echo · day 1</div>
        <Table head={['', 'Finding']} rows={[
          ['LV', 'Small cavity, EF 62%, concentric remodelling, E/e′ 16 — HFpEF physiology'],
          ['Left atrium', N('LAVI 64 mL/m² — severely dilated', 'cs-hi')],
          ['Right atrium', N('RA area 38 cm² — huge', 'cs-hi')],
          ['RV', N('Basal diameter 51 mm, mid 40 mm; TAPSE 14 mm; S′ 8.5 cm/s; FAC 31%', 'cs-hi')],
          ['Tricuspid valve', 'Annulus 48 mm (28 mm/m²), flat; leaflets thin; tenting height 7 mm; coaptation gap 6–10 mm; pacing lead through the postero-septal commissure, not impinging'],
          ['IVC · hepatic veins', 'IVC 31 mm, no collapse; hepatic veins: systolic flow REVERSAL'],
          ['Septum', 'Flattened in DIASTOLE (volume overload), round in systole'],
        ]} />
      </div>

      <div className="cs-h2">📉 The velocity paradox — measure her jet</div>
      <p className="cs-p">First slide the leak from small to torrential and watch what happens to the jet. Then go back to her valve and put the caliper on the edge of the envelope.</p>
      <TRDopplerLab done={dop} onMeasure={r => answer('s2-dop', r)} />
      {dop && (
        <div className={'cs-fb ' + (dop.close ? 'best' : 'ok')}>
          TR Vmax {dop.v.toFixed(2)} m/s → echo PASP ≈ {Math.round(dop.pasp)} mmHg. {dop.close
            ? 'Correct reading — and a dangerously reassuring number. Her RV is generating 52 mmHg; the jet only “sees” the small gap left between an RV and an RA whose pressures have almost equalised.'
            : 'Off the dense edge of the envelope. Her jet peaks at about 2.2 m/s.'}
        </div>
      )}
      <ScoreOnce id="s2-dop" pts={dop == null ? null : dop.close ? 10 : 3} max={10} />
      <Why title="⚠️ Why torrential TR can show a LOW jet velocity"
        chain={[
          { k: 'BERNOULLI', t: 'The Doppler velocity reflects the pressure DIFFERENCE between RV and RA: ΔP = 4v².' },
          { k: 'HUGE HOLE', t: 'Through a huge orifice, the RA fills so fast in systole that its pressure soars (v-wave 30+ mmHg).' },
          { k: 'EQUALISED', t: 'RV and RA pressures nearly meet: the gradient — and the velocity — fall.' },
          { k: 'LAMINAR', t: 'The jet becomes a low-velocity, dense, early-peaking triangle — sometimes barely 2 m/s.' },
          { k: 'THE TRAP', t: 'PASP = 4v² + RAP UNDER-estimates the true PA pressure. Severe pre-capillary PH can hide here.' },
        ]}>
        A low TR velocity is reassuring only when the leak is small. In torrential TR, the number you need comes from a catheter.
      </Why>
      <Contrast title="a low TR velocity that is truth vs a low velocity that is a lie"
        is={{ h: 'Truth: the PA pressure really is low', points: ['Mild or moderate TR; a parabolic, rounded envelope.', 'RA pressure normal; IVC small and collapsing.', 'RV not dilated, septum normal.', '4v² + RAP is a fair estimate.'] }}
        isnt={{ h: 'Lie: torrential TR with equalised pressures', points: ['Dense, triangular, early-peaking “dagger” envelope.', 'RA v-wave 30+ mmHg; IVC plethoric; hepatic veins reversed.', 'Huge RA, dilated RV, flattened septum.', 'The estimate can be 20–30 mmHg too low: catheterise before deciding.'] }} />

      <div className="cs-h2">📏 Quantify the leak yourself</div>
      <p className="cs-p">RV-focused apical view, colour zoom, the baseline shifted to 28 cm/s. Measure the narrowest neck of the jet (vena contracta) and the PISA radius on the RV side of the orifice.</p>
      <TRQuantify done={q} onMeasure={r => answer('s2-quant', r)} />
      {q && (
        <div className={'cs-fb ' + (q.close ? 'best' : 'ok')}>
          VC {q.vc.toFixed(1)} mm · PISA r {q.r.toFixed(2)} cm → EROA {Math.round(q.eroa * 100)} mm². {q.close
            ? 'VC says massive, PISA EROA says torrential — and PISA under-reads in a large, non-circular orifice. 3D vena contracta area 1.6 cm² confirms torrential.'
            : 'Off the mark: her vena contracta is ~15 mm and the first aliasing boundary sits ~1.05 cm from the orifice. A squared radius magnifies every millimetre.'}
        </div>
      )}
      <ScoreOnce id="s2-quant" pts={q == null ? null : q.close ? 12 : 4} max={12} />

      <MultiSelect id="s2-sev" question="📋 Which of her findings support SEVERE (or worse) tricuspid regurgitation?"
        items={[
          { id: 'vc', label: 'Vena contracta ≥ 7 mm', correct: true, why: 'Hers is 15 mm: massive on the five-grade scale.' },
          { id: 'eroa', label: 'PISA EROA ≥ 40 mm²', correct: true, why: 'Hers is ~90 mm²: torrential.' },
          { id: 'hv', label: 'Systolic flow reversal in the hepatic veins', correct: true, why: 'Specific for severe TR (but blunted by AF too — integrate).' },
          { id: 'dense', label: 'A dense, triangular, early-peaking CW envelope', correct: true, why: 'Equalisation of RV and RA pressures.' },
          { id: 'ra', label: 'A dilated RA and IVC', correct: true, why: 'Supportive — chronic volume load.' },
          { id: 'vel', label: 'A TR velocity above 2.8 m/s', correct: false, why: 'Velocity measures pressure difference, not leak size — and hers is LOW precisely because the leak is torrential.' },
        ]} />
      <Decision id="s2-mech" question="🧩 What is the mechanism of her TR?"
        options={[
          { id: 'atrial', label: 'Mainly ATRIAL functional TR: long-standing AF and a huge RA have stretched and flattened the annulus; leaflet tethering is modest', verdict: 'best', points: 10,
            why: 'Twelve years of AF, RA area 38 cm², annulus 48 mm, tenting only 7 mm, RV dilated mainly at the base (conical shape). The lead passes through a commissure without restricting a leaflet: lead-ASSOCIATED, not lead-INDUCED.' },
          { id: 'vent', label: 'Ventricular functional TR from severe pre-capillary PH', verdict: 'ok', points: 3,
            why: 'That gives a spherical, pressure-loaded RV with deep tethering (tenting > 9 mm) and systolic septal flattening. Hers is volume-pattern — but only a catheter can prove the PA pressure.' },
          { id: 'lead', label: 'Lead-induced TR: the lead pins the septal leaflet', verdict: 'wrong', points: 0, why: '3D imaging shows the lead in the postero-septal commissure; all three leaflets move freely.' },
          { id: 'prim', label: 'Primary TR from a flail leaflet', verdict: 'wrong', points: 0, why: 'Thin, normal leaflets that simply cannot reach each other.' },
        ]} />
      <Contrast title="atrial functional TR vs ventricular functional TR"
        is={{ h: 'Atrial (hers)', points: ['AF, HFpEF, older women; huge RA, big flat annulus.', 'RV dilated at the BASE (conical); tenting small.', 'PA pressure often only mildly raised.', 'Rhythm control early can shrink the annulus; better results after intervention.'] }}
        isnt={{ h: 'Ventricular', points: ['Left-heart disease or lung/pulmonary vascular disease raising PA pressure.', 'Spherical RV, papillary muscles displaced: deep tethering (tenting area/height large).', 'Septum flattened in SYSTOLE (pressure overload).', 'Fixing the valve does not fix the afterload — outcome tied to PVR and RV function.'] }} />

      <div className="cs-h2">⚙️ Is the RV keeping up with its load?</div>
      <p className="cs-p">TAPSE is what the RV can do; PASP is what it is asked to do. Plot her with the echo PASP — then with the catheter number you will measure in a moment.</p>
      <RVPACoupling />
      <Why title="🔗 Why the RV is built for volume, not pressure"
        chain={[
          { k: 'THIN WALL', t: 'The RV wall is a third as thick as the LV: built to pump into a low-resistance lung bed.' },
          { k: 'VOLUME: FINE', t: 'Extra volume is handled by stretching — for years.' },
          { k: 'PRESSURE: NOT', t: 'A rise in afterload halves its stroke volume where the LV would barely notice.' },
          { k: 'UNCOUPLING', t: 'When contractility can no longer match afterload (TAPSE/PASP falls), the RV dilates and fails.' },
        ]} />
      <Figure src={WIKI('Diagram_of_the_human_heart_(cropped).svg')} href={WIKIPAGE('Diagram_of_the_human_heart_(cropped).svg')} alt="Diagram of the human heart showing the right atrium, tricuspid valve and right ventricle" caption="The right heart: RA, tricuspid valve, RV and the pulmonary valve. No valve guards the venae cavae — so every TR jet reaches the neck and the liver." credit="Wikimedia Commons (see file page for licence)" />
    </>
  );
}

/* ============================================================
   3 · RIGHT HEART CATHETER, RISK AND THE HEART TEAM
   ============================================================ */

function HeartTeam() {
  const { answers, answer } = useCase();
  const rhc = answers['s3-rhc'];
  const tri = answers['s3-tri'];
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🩻 Day 4</span>Right heart catheter via the right internal jugular vein, on her diuretics. Read every trace yourself.</p>
      </div>
      <RHCLab done={rhc} onResult={r => answer('s3-rhc', r)} />
      {rhc && (
        <div className={'cs-fb ' + (rhc.correct ? 'best' : 'ok')}>
          mPAP {rhc.mpap}, PAWP {rhc.pawp}, CO {rhc.co} L/min ({rhc.coSrc === 'fick' ? 'Fick' : 'thermodilution'}) → PVR {rhc.pvr.toFixed(1)} WU: {rhc.cls}. {rhc.correct
            ? 'Right: isolated POST-capillary PH from her stiff left heart. The lung vessels are not the problem — the leak and the LA are.'
            : rhc.coSrc !== 'fick' ? 'Thermodilution is unreliable in severe TR: the cold bolus sloshes back and forth across the leaking valve. Here it under-read the output and turned a PVR of 1.9 into 2.7 — a different class.' : 'Re-read the traces: the PA mean is 31, the wedge mean (end-expiration) 23.'}
        </div>
      )}
      <ScoreOnce id="s3-rhc" pts={rhc == null ? null : rhc.correct ? 14 : 5} max={14} />
      <Why title="🔬 Why pre- vs post-capillary PH decides who benefits"
        chain={[
          { k: 'THE LEAK VENTS', t: 'Severe TR is a pop-off valve: part of every RV beat escapes backwards into the low-pressure RA.' },
          { k: 'CLOSE IT', t: 'After repair the RV must send its WHOLE stroke volume through the lungs.' },
          { k: 'LOW PVR', t: 'If the lung vessels are healthy (post-capillary PH, PVR ≤ 2), forward flow rises and the RV unloads.' },
          { k: 'HIGH PVR', t: 'If the arterioles are diseased (pre-capillary PH, high PVR), the RV meets a wall it cannot push through: acute RV failure.' },
        ]}>
        That is why we catheterise before fixing TR — and why severe pre-capillary PH is a reason NOT to.
      </Why>
      <Contrast title="post-capillary vs severe pre-capillary pulmonary hypertension in TR"
        is={{ h: 'Post-capillary (hers)', points: ['PAWP > 15: the pressure starts in the left atrium (HFpEF, AF, mitral disease).', 'PVR ≤ 2 WU (isolated) or modestly raised (combined).', 'The RV usually tolerates losing its leak.', 'Candidate for intervention.'] }}
        isnt={{ h: 'Severe pre-capillary', points: ['PAWP ≤ 15 with PVR high (often > 5 WU): PAH, CTEPH, lung disease.', 'The TR is the RV’s safety valve.', 'Closing it can precipitate RV failure and death.', 'Treat the pulmonary vascular disease; the valve is a bystander.'] }} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>👥 Heart team · day 11 (decongested, on oral torasemide)</div>
        <Table head={['', 'Finding']} rows={[
          ['Symptoms', 'NYHA III; still oedema to mid-shin; ascites smaller; early satiety better'],
          ['Diuretic', 'Torasemide 40 mg daily (≈ furosemide 120 mg)'],
          ['Kidneys · liver', 'eGFR 41; bilirubin 26 µmol/L (ULN 21)'],
          ['Echo', 'Torrential TR persists; LVEF 62%; TAPSE 14 mm, S′ 8.5 cm/s — moderate RV dysfunction'],
          ['Anatomy (TOE)', 'Good transgastric views; coaptation gap 6 mm antero-septal, 10 mm antero-posterior; lead in the postero-septal commissure'],
          ['Her wish', '“I want to sit in the garden without my legs bursting — and not be cut open.”'],
        ]} />
      </div>
      <div className="cs-h2">🧮 TRI-SCORE — her risk with isolated tricuspid surgery</div>
      <TriScore truth={['age', 'nyha', 'rhf', 'bili', 'rv']} done={tri} onResult={r => answer('s3-tri', r)} />
      {tri && <div className={'cs-fb ' + (tri.right === tri.of ? 'best' : 'ok')}>{tri.right}/{tri.of} items right. Her TRI-SCORE is 7 — well into the high-risk band, where in-hospital mortality after isolated tricuspid surgery climbs steeply (towards ~60% at ≥ 9 in the derivation cohort).</div>}
      <ScoreOnce id="s3-tri" pts={tri == null ? null : tri.right} max={TRI_ITEMS.length} />

      <Decision id="s3-how" question="🛠️ Torrential atrial-functional TR, post-capillary PH, TRI-SCORE 7, moderate RV dysfunction, still symptomatic on diuretics. What does the heart team offer?"
        options={[
          { id: 'teer', label: 'Transcatheter edge-to-edge repair (T-TEER) — favourable anatomy: antero-septal gap 6 mm, good TOE windows, lead in a commissure', verdict: 'best', points: 10,
            why: 'ESC/EACTS 2025 supports transcatheter treatment of symptomatic severe secondary TR in patients unsuitable for surgery, at a heart valve centre, when it is expected to improve symptoms or quality of life. TRILUMINATE: TR ≤ moderate in ~87% at 1 year, better quality of life; no difference yet in death or HF hospitalisation.' },
          { id: 'ttvr', label: 'Transcatheter tricuspid valve replacement (EVOQUE)', verdict: 'ok', points: 6,
            why: 'A real option — TRISCEND II: near-complete TR elimination and better quality of life. But it jails her pacing lead for good and needs anticoagulation she already takes; with a reachable 6 mm gap, repair first is reasonable. Many teams would choose replacement for a 10 mm gap or a lead-pinned leaflet.' },
          { id: 'surg', label: 'Isolated tricuspid surgery', verdict: 'wrong', points: 2, why: 'TRI-SCORE 7: high in-hospital mortality. Surgery is best done EARLIER — before liver, kidney and RV damage — or with left-sided surgery.' },
          { id: 'med', label: 'Diuretics alone, indefinitely', verdict: 'ok', points: 3, why: 'Defensible if she declined. But she is symptomatic despite optimised diuretics with an RV that can still respond — the window is closing.' },
        ]} />
      <Contrast title="T-TEER vs transcatheter replacement (TTVR)"
        is={{ h: 'T-TEER (TriClip, PASCAL)', points: ['Clips the leaflets together: TR reduced, rarely abolished.', 'Needs reachable gaps (≲ 7–8 mm), good leaflets and good TOE views.', 'Leaves the lead free; no new conduction risk.', 'TRILUMINATE: better quality of life; outcomes data maturing.'] }}
        isnt={{ h: 'TTVR (EVOQUE)', points: ['Replaces the valve: TR usually ≤ mild.', 'Works for big gaps and lead-pinned leaflets — if the annulus fits.', 'New pacemaker in ~1 in 6 to 1 in 4; bleeding; jailed leads; anticoagulation.', 'TRISCEND II: better symptoms and quality of life than medical therapy.'] }} />

      <Decision id="s3-talk" question="🗣️ She asks: “Will it make me live longer?”"
        options={[
          { id: 'honest', label: '“It should make you feel better — less swelling, more energy, fewer water tablets. The trials have not yet shown it makes people live longer. There is a small risk of the right heart struggling after the leak is closed; we will watch for that closely.”', verdict: 'best', points: 10,
            why: 'True to the evidence (quality of life, not yet survival), honest about the specific risk she is about to meet, and framed around her own goal.' },
          { id: 'yes', label: '“Yes — fixing the valve will add years.”', verdict: 'wrong', points: 0, why: 'Not shown yet in randomised trials.' },
          { id: 'no', label: '“No, so there is little point.”', verdict: 'wrong', points: 0, why: 'Her goal is symptoms — and that is exactly what the evidence supports.' },
        ]} />
    </>
  );
}

/* ============================================================
   4 · PLANNING — THE LEAD, THE GAPS, THE GRASP
   ============================================================ */

function Planning() {
  const { answers, answer } = useCase();
  const plan = answers['s4-plan'];
  return (
    <>
      <div className="cs-h2" style={{ marginTop: 0 }}>🧭 Repair or replace? Try three valves</div>
      <p className="cs-p">Her valve first, then two others. Move the sliders and watch which features break each route.</p>
      <TherapyPlanner done={plan} onPick={o => answer('s4-plan', o)} />
      {plan && (
        <div className={'cs-fb ' + (plan === 'TTVR' ? 'best' : 'wrong')}>
          {plan === 'TTVR' ? 'Right: a 9 mm gap, a short septal leaflet and a lead pinning it — a clip will not hold. Replacement (with a plan for the jailed lead, or extraction first) is the route.'
            : 'For Mr K the lead pins a short septal leaflet across a 9 mm gap: a clip cannot get both leaflets. Replacement is favoured.'}
        </div>
      )}
      <ScoreOnce id="s4-plan" pts={plan == null ? null : plan === 'TTVR' ? 10 : 2} max={10} />
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧊 3D TOE planning · day 12</div>
        <Table head={['Segment', 'Coaptation gap', 'Leaflet length', 'Comment']} rows={[
          ['Antero-septal (A–S), central', N('6 mm'), 'A 24 mm · S 14 mm', 'Main jet origin'],
          ['A–S toward the commissure', N('5 mm'), 'A 22 mm · S 12 mm', 'Near the aortic root'],
          ['Postero-septal (P–S)', N('7 mm'), 'P 16 mm · S 11 mm', 'Pacing lead lies here'],
          ['Antero-posterior (A–P)', N('10 mm', 'cs-hi'), 'A 23 mm · P 15 mm', 'Wide gap'],
          ['Transgastric short-axis', 'Clear', '—', 'Essential to see leaflet insertion'],
        ]} />
      </div>
      <Decision id="s4-first" question="🎯 Where does the first clip go?"
        options={[
          { id: 'as', label: 'Antero-septal coaptation line, central — then “zip” toward the commissure', verdict: 'best', points: 10,
            why: 'In functional TR most of the jet comes from the A–S line. Bridging anterior to septal there reduces the orifice most, and later clips extend the bridge.' },
          { id: 'ap', label: 'Antero-posterior line, where the gap is widest', verdict: 'wrong', points: 0, why: 'A 10 mm gap is beyond a reliable grasp; start where you will succeed.' },
          { id: 'ps', label: 'Postero-septal, next to the lead', verdict: 'wrong', points: 2, why: 'The lead can be caught between the arms or block septal insertion. Avoid the lead’s commissure unless there is no choice.' },
        ]} />
      <Why title="📐 Why the gap decides the grasp"
        chain={[
          { k: 'TWO ARMS', t: 'The clip arms open below the leaflets, then the grippers drop to pin each leaflet.' },
          { k: 'REACH', t: 'Each leaflet must lie on its arm for several millimetres — insertion.' },
          { k: 'WIDE GAP', t: 'If the leaflets are far apart in systole, one is caught and the other slips: single-leaflet attachment.' },
          { k: 'SHORT SEPTAL', t: 'The septal leaflet is short and tethered — the usual weak point. Check its insertion in the transgastric view.' },
        ]} />
      <Contrast title="lead-induced TR vs lead-associated TR"
        is={{ h: 'Lead-INDUCED', points: ['The lead pins, perforates or tethers a leaflet (often the septal or posterior).', 'TR appears or worsens soon after the implant.', 'Fixing it may mean extraction (before TEER/TTVR) and a lead that avoids the valve (coronary sinus, leadless or conduction-system pacing).', 'Easy to miss on 2D — needs 3D.'] }}
        isnt={{ h: 'Lead-ASSOCIATED (hers)', points: ['The lead lies in a commissure; the leaflets move freely.', 'The TR is atrial/ventricular functional — the lead is a bystander.', 'T-TEER can work around it.', 'Keep the lead free of the clip.'] }} />
      <MultiSelect id="s4-lead" question="🔌 Her pacemaker before the procedure. What do you do?"
        items={[
          { id: 'check', label: 'Device check: underlying rhythm, pacing dependence, thresholds, impedance — repeated after the procedure', correct: true, why: 'Lead dislodgement or damage during T-TEER is rare but real.' },
          { id: 'dep', label: 'Confirm she is NOT pacing-dependent (AF 80s, VVI back-up at 50)', correct: true, why: 'If she were dependent, a temporary pacing plan would be needed.' },
          { id: 'mri', label: 'Program asynchronous (VOO) mode for diathermy', correct: false, why: 'No surgical diathermy in a transcatheter procedure; and she is not dependent.' },
          { id: 'ext', label: 'Extract the lead first “just in case”', correct: false, why: 'The lead is not causing her TR; extraction has its own mortality risk.' },
        ]} />
      <Video id="6WoDSfIpGCE" title="EVOQUE tricuspid valve replacement system" />
    </>
  );
}

/* ============================================================
   5 · SET-UP
   ============================================================ */

function Setup() {
  return (
    <>
      <MultiSelect id="s5-check" question="✅ Before you start: what must be in place?"
        items={[
          { id: 'ga', label: 'General anaesthesia with an anaesthetist who knows RV physiology', correct: true, why: 'Induction and positive-pressure ventilation are when a fragile RV falls over.' },
          { id: 'toe', label: 'TOE with good transgastric views (confirmed beforehand), ± intracardiac echo', correct: true, why: 'Tricuspid TEER is impossible without seeing the leaflets.' },
          { id: 'art', label: 'Arterial line; noradrenaline drawn up and running before induction if the pressure is soft', correct: true, why: 'Protect RV perfusion pressure from the first minute.' },
          { id: 'vent', label: 'Ventilation with modest PEEP, normocapnia, FiO₂ to avoid hypoxia', correct: true, why: 'Hypoxia, hypercapnia, acidosis and high airway pressures all raise PVR.' },
          { id: 'diur', label: 'Diuretics held on the morning — she must be euvolaemic, not dry', correct: true, why: 'Over-diuresed patients collapse on induction.' },
          { id: 'contrast', label: 'A contrast load for angiographic guidance', correct: false, why: 'T-TEER is guided by echo; contrast is not needed.' },
        ]} />
      <Sequence id="s5-seq" question="🧷 Put the procedure in order."
        steps={[
          { label: 'Ultrasound-guided right femoral vein access; pre-closure suture', why: 'Large-bore venous access (~25F guide).' },
          { label: 'Heparin to ACT ≥ 250 s', why: 'Equipment in the right heart.' },
          { label: 'Advance the steerable guide into the RA; steer the clip system toward the tricuspid valve (no transseptal puncture)', why: 'A right-sided procedure: down the IVC into the RA.' },
          { label: 'Align over the antero-septal line in the en-face view; arms perpendicular to the coaptation line', why: 'The same alignment logic as mitral TEER.' },
          { label: 'Advance into the RV, grasp, check insertion in the transgastric view, assess TR and gradient, release', why: 'Then decide on the next clip.' },
        ]} />
      <Why title="🫁 Why anaesthesia is the first danger"
        chain={[
          { k: 'INDUCTION', t: 'Propofol and volatile agents vasodilate: aortic pressure falls.' },
          { k: 'RIGHT CORONARY', t: 'The RV is perfused in systole AND diastole by the aortic–RV pressure difference; as aortic pressure falls, RV perfusion falls.' },
          { k: 'POSITIVE PRESSURE', t: 'Ventilation squeezes the pulmonary capillaries: RV afterload rises, venous return falls.' },
          { k: 'COLLAPSE', t: 'An ischaemic RV with more afterload dilates, shifts the septum, starves the LV: cardiac arrest on induction.' },
        ]} />
      <Contrast title="anaesthesia for an RV patient vs for an LV patient"
        is={{ h: 'Failing RV', points: ['Vasopressor running BEFORE induction; etomidate/ketamine-type stability.', 'Avoid hypoxia, hypercapnia, acidosis, high PEEP.', 'Keep sinus/AF rate and AV timing — the RV dislikes bradycardia.', 'Fluids: cautious — the RV may already be over-full.'] }}
        isnt={{ h: 'Failing LV', points: ['Positive pressure HELPS: lowers LV afterload and preload.', 'Vasodilators often welcome.', 'High PEEP tolerated and useful in pulmonary oedema.', 'A fluid challenge is less likely to harm.'] }} />
    </>
  );
}

/* ============================================================
   6 · STRATEGY — HOW MUCH IS ENOUGH?
   ============================================================ */

function Strategy() {
  return (
    <>
      <Decision id="s6-goal" question="🎯 What is the procedural goal for her?"
        options={[
          { id: 'mod', label: 'Reduce TR to moderate or less with a mean tricuspid gradient below ~3–5 mmHg, without touching the lead — not chasing trace TR', verdict: 'best', points: 10,
            why: 'In TRILUMINATE, TR ≤ moderate tracked with symptom benefit. The tricuspid tolerates a gradient poorly (normal < 2 mmHg; ≥ 5 is significant stenosis). And in an uncoupled RV, abolishing every drop of TR removes its last pop-off.' },
          { id: 'zero', label: 'Abolish all TR — as many clips as it takes', verdict: 'wrong', points: 0, why: 'More clips: more gradient, more risk to the lead, more afterload mismatch.' },
          { id: 'one', label: 'One clip, whatever the result', verdict: 'ok', points: 3, why: 'One clip rarely tames torrential TR — most patients need two or more.' },
        ]} />
      <Why title="🫸 Why closing the leak raises the RV’s afterload"
        chain={[
          { k: 'BEFORE', t: 'The RV ejects into two places: forward into the PA and backward into a low-pressure RA.' },
          { k: 'EASY EXIT', t: 'The backward route takes a big share with almost no resistance — the RV looks “dysfunctional” but works little.' },
          { k: 'AFTER', t: 'With the leak closed, the RV must push everything into the PA at full PA pressure.' },
          { k: 'MISMATCH', t: 'A borderline RV (TAPSE/PASP 0.27) may not manage: afterload mismatch, falling output, rising CVP.' },
        ]} />
      <MultiSelect id="s6-grasp" question="🔍 After each grasp, before release, what must you see?"
        items={[
          { id: 'ins', label: 'Both leaflets in the arms with adequate insertion — checked in the transgastric short-axis view', correct: true, why: 'The septal leaflet is the one that slips.' },
          { id: 'tr', label: 'A clear reduction in the jet (VC, colour), the hepatic vein pattern improving', correct: true, why: 'Forward systolic flow in the hepatic veins returning is a good sign.' },
          { id: 'grad', label: 'Mean tricuspid gradient acceptable (< ~3–5 mmHg)', correct: true, why: 'Iatrogenic stenosis is easier to cause on the right.' },
          { id: 'lead', label: 'The lead moving freely, not in the clip', correct: true, why: 'And pacing parameters unchanged.' },
          { id: 'hemo', label: 'Stable systemic pressure and RA pressure falling', correct: true, why: 'The haemodynamic proof.' },
          { id: 'fluoro', label: 'The clip looks central on fluoroscopy', correct: false, why: 'Fluoroscopy shows metal, not leaflets.' },
        ]} />
      <Contrast title="a good tricuspid result vs an over-corrected one"
        is={{ h: 'Good', points: ['Torrential → moderate.', 'Gradient ~3 mmHg.', 'Hepatic veins: systolic reversal gone.', 'RA v-wave falls; output rises; lead free.'] }}
        isnt={{ h: 'Over-corrected', points: ['Trace TR, gradient 5–6 mmHg.', 'A third clip near the lead.', 'An RV suddenly facing its full afterload.', 'Looks beautiful on TOE; the patient crashes at night.'] }} />
    </>
  );
}

/* ============================================================
   7 · THE PROCEDURE — T-TEER
   ============================================================ */

function Procedure() {
  const { answers, answer, setVitals } = useCase();
  const r = answers['s7-clip'];
  const good = r && !r.lead && (r.grade === 'moderate' || r.grade === 'mild') && r.grad < 5 && r.fails === 0;
  const okish = r && !good && (r.grade === 'moderate' || r.grade === 'mild');
  return (
    <>
      <p className="cs-p">Day 14, 09:10. She is asleep, on noradrenaline 0.04 µg/kg/min, BP 108/62. The clip system is in the RA above the valve. Choose each site on the en-face view, grasp, check the insertion, release — and stop when the result is good enough.</p>
      <TricuspidClip done={r} onResult={res => { answer('s7-clip', res); setVitals({ hr: 86, sys: 104, dia: 60, spo2: 98 }); }} />
      {r && (
        <div className={'cs-fb ' + (good ? 'best' : okish ? 'ok' : 'wrong')}>
          {r.clips.length} clip{r.clips.length > 1 ? 's' : ''} · residual TR {r.grade} · gradient {r.grad} mmHg{r.fails ? ` · ${r.fails} failed grasp${r.fails > 1 ? 's' : ''}` : ''}{r.lead ? ' · LEAD PINNED' : ''}.
          {good ? ' Two antero-septal clips: torrential to moderate, lead free, gradient low. Stop here.'
            : r.lead ? ' The lead is now trapped — future extraction is near-impossible, lead damage can follow, and the short septal insertion may let go.'
            : r.fails ? ' The antero-posterior gap was too wide to grasp: every failed attempt is leaflet trauma and time under anaesthesia.'
            : ' More TR left than ideal — a second antero-septal clip would zip the line further.'}
        </div>
      )}
      <ScoreOnce id="s7-clip" pts={r == null ? null : good ? 20 : okish ? 8 : 2} max={20} />
      <Why title="🩸 Why the RA pressure falls and the liver stops pulsing"
        chain={[
          { k: 'SMALLER HOLE', t: 'Clips bridge the A–S line: the orifice shrinks from ~90 to ~30 mm².' },
          { k: 'LESS BACKFLOW', t: 'Less blood is thrown into the RA in systole.' },
          { k: 'v-WAVE DOWN', t: 'RA v-wave 33 → ~20 mmHg; the cv wave in the neck shrinks.' },
          { k: 'VEINS FORWARD', t: 'Hepatic veins regain forward systolic flow — the start of liver and kidney recovery.' },
        ]} />
      {r && (
        <Decision id="s7-after" question="📊 After release: TR moderate, gradient 3 mmHg. The TOE fellow wants a third clip near the lead “to get it to mild”. You…"
          options={[
            { id: 'stop', label: 'Stop: moderate TR with a low gradient is the goal; a third clip risks the lead, the gradient and an RV that suddenly loses its pop-off', verdict: 'best', points: 10,
              why: 'Every clip trades regurgitation for gradient — and in an uncoupled RV, for afterload. The best result is the one the RV can live with.' },
            { id: 'more', label: 'Add the third clip', verdict: 'wrong', points: 0, why: 'See the over-corrected column above.' },
          ]} />
      )}
      <Video id="AcrqItAKFYs" title="TriClip G4 TEER: advanced tricuspid valve repair" />
      <CaseLibrary title="Tricuspid interventions in real cases" channels={TRICUSPID_SEARCHES}>
        Watch for the en-face alignment over the antero-septal line, the transgastric view of the grasp, and the hepatic-vein Doppler before and after.
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🛏️ 15:00</span>Bed 8, Valvular & Structural Heart Unit. Extubated, drowsy but comfortable, noradrenaline weaned off at 13:00. BP 106/62, AF 86, SpO₂ 95% on 2 L. Groin dry. Her neck: the earlobes no longer move.</p>
      </div>
      <ECG12 rate={86} rhythm="af" caption="AF ~86/min, no paced beats. Unchanged from admission." />
      <MultiSelect id="s8-checks" question="🔎 Her first evening: what do you check, and why?"
        items={[
          { id: 'device', label: 'Pacemaker check: R-wave sensing, threshold, impedance', correct: true, why: 'Confirms the lead was not damaged or displaced.' },
          { id: 'echo', label: 'Echo before discharge: clip position, residual TR, gradient, RV function, effusion', correct: true, why: 'Single-leaflet attachment usually declares early; so does an effusion.' },
          { id: 'cvp', label: 'Urine output, lactate and blood pressure trends overnight — with a low threshold to call', correct: true, why: 'Afterload mismatch usually shows within 24–48 hours.' },
          { id: 'diur', label: 'Restart diuretics at a LOWER dose tomorrow, guided by weight and urine output', correct: true, why: 'Forward flow improves; the kidneys and liver begin to recover.' },
          { id: 'cre', label: 'Creatinine, bilirubin, haemoglobin', correct: true, why: 'Venous access bleeding and the cardiorenal picture.' },
          { id: 'opi', label: 'Generous IV morphine for back pain from lying flat', correct: false, why: 'Opioid sedation → hypoventilation → hypercapnia → pulmonary vasoconstriction. Use paracetamol first, small doses, and watch the CO₂.' },
        ]} />
      <Decision id="s8-oac" question="💊 Antithrombotic therapy after T-TEER for her AF?"
        options={[
          { id: 'doac', label: 'Continue apixaban 5 mg twice daily; no added antiplatelet', verdict: 'best', points: 10,
            why: 'Her AF already needs a DOAC; tricuspid TR is not “valvular AF”. Dose: only one reduction criterion now (age < 80, weight 55 kg ≤ 60, creatinine 118 < 133) — so full dose. Adding aspirin adds bleeding without proven benefit.' },
          { id: 'warf', label: 'Switch to warfarin — she now has valve hardware', verdict: 'wrong', points: 0, why: 'Clips are not mechanical valves.' },
          { id: 'dapt', label: 'Apixaban plus clopidogrel for 3 months', verdict: 'wrong', points: 2, why: 'No evidence for adding antiplatelets to a DOAC after TEER; bleeding risk rises.' },
        ]} />
      <MultiSelect id="s8-hf" question="🫀 The long game: what else does her HFpEF and atrial disease need?"
        items={[
          { id: 'sglt', label: 'An SGLT2 inhibitor (empagliflozin or dapagliflozin 10 mg)', correct: true, why: 'Class I in HFpEF (ESC 2023 focused update): fewer HF hospitalisations.' },
          { id: 'mra', label: 'Consider an MRA (spironolactone) once potassium and creatinine allow', correct: true, why: 'Diuretic-sparing and helpful in hepatic congestion; evidence in HFpEF is weaker (TOPCAT) — individualise.' },
          { id: 'bp', label: 'Control blood pressure and weight; exercise as tolerated', correct: true, why: 'The drivers of the stiff LV and the big LA.' },
          { id: 'rhythm', label: 'Rhythm control to “reverse” her TR now', correct: false, why: 'After twelve years of permanent AF and an RA of 38 cm², sinus rhythm is very unlikely to hold. Early rhythm control matters in EARLY atrial functional TR — the cycle stage shows why.' },
        ]} />
      <Why title="🫘 Why the kidneys recover when the TR is fixed"
        chain={[
          { k: 'BACK-PRESSURE', t: 'Renal blood flow depends on the difference between arterial AND venous pressure.' },
          { k: 'CONGESTED', t: 'A venous pressure of 20 squeezes the encapsulated kidney: interstitial pressure up, glomerular filtration down, sodium held.' },
          { k: 'FIXED', t: 'Lower RA pressure: renal perfusion pressure rises without any change in BP.' },
          { k: 'DIURESIS', t: 'Natriuresis returns; diuretic doses can fall — creatinine improves.' },
        ]} />
      <Contrast title="loop diuretic alone vs sequential nephron blockade"
        is={{ h: 'Loop escalation first', points: ['Double the IV dose if natriuresis is poor at 2 h.', 'Predictable; fewer electrolyte storms.', 'Continuous infusion or bolus — similar (DOSE).'] }}
        isnt={{ h: 'Add a second class (thiazide, acetazolamide)', points: ['Blocks the distal sodium the loop leaves behind.', 'Powerful — and brutal on K⁺, Na⁺, Mg²⁺ and creatinine.', 'Daily bloods, short courses, stop when dry.', 'The war story below is about forgetting this.'] }} />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — THE RV LOSES ITS POP-OFF
   ============================================================ */

function Crisis() {
  const { answers, answer, setVitals } = useCase();
  const board = answers['s9-board'];
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>🌙 23:40</span>
          The night nurse calls: Mrs Marchetti is grey, cold to the knees, hard to rouse. She had morphine 10 mg IV at 20:00 for back pain. BP 74/42, AF 118, SpO₂ 86% on 2 L, urine 10 mL in two hours. Her neck veins are distended to the jaw — but they no longer pulse.
        </p>
      </div>
      <BedsideMonitor />
      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Bedside echo · 23:50</div>
          <ul className="cs-ul">
            <li className="cs-li">RV hugely dilated, TAPSE 8 mm; septum flattened in systole AND diastole — a D-shaped LV.</li>
            <li className="cs-li">LV small, under-filled, hyperdynamic.</li>
            <li className="cs-li">Both clips in place; TR moderate (not torrential); TR jet now 3.4 m/s.</li>
            <li className="cs-li">No pericardial effusion.</li>
          </ul>
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🧪 Gas and bloods · 23:55</div>
          <Table head={['', 'Result']} rows={[
            ['pH · PaCO₂', N('7.24 · 56 mmHg', 'cs-hi')], ['PaO₂', N('7.1 kPa (53 mmHg)', 'cs-hi')], ['Lactate', N('4.6 mmol/L', 'cs-hi')],
            ['Haemoglobin', N('112 g/L (pre 118)')], ['Potassium', N('4.4 mmol/L')], ['CVP (jugular line)', N('22 mmHg', 'cs-hi')],
          ]} />
        </div>
      </div>
      <SubcostalEcho effusion={0} label="Subcostal view: no effusion — this is not tamponade from an RV injury." />

      <Decision id="s9-dx" question="🚨 What is happening?"
        options={[
          { id: 'mismatch', label: 'Acute RV failure: afterload mismatch after closing the leak, tipped over by opioid hypoventilation (hypoxia, hypercapnia, acidosis → pulmonary vasoconstriction)', verdict: 'best', points: 10,
            why: 'The RV lost its pop-off and now faces the full PA pressure (TR jet 3.4 m/s — the true PASP is finally visible). Morphine added hypercapnia and hypoxia, which constrict the pulmonary arterioles. Dilated RV, D-shaped LV, high CVP, low output.' },
          { id: 'slda', label: 'A clip has detached — TR is back', verdict: 'wrong', points: 2, why: 'TR is moderate, not torrential, and the neck veins no longer pulse.' },
          { id: 'tamp', label: 'Tamponade from an RV injury', verdict: 'wrong', points: 0, why: 'No effusion on two views.' },
          { id: 'bleed', label: 'Retroperitoneal bleed from the femoral access', verdict: 'ok', points: 3, why: 'Always worth excluding — Hb fell only 6 g/L and the CVP is 22, not low.' },
        ]} />
      <Why title="💥 Why the failing RV spirals"
        chain={[
          { k: 'AFTERLOAD UP', t: 'Closed leak + hypoxic, hypercapnic pulmonary vasoconstriction.' },
          { k: 'RV DILATES', t: 'Stroke volume falls; the RV balloons inside a fixed pericardium.' },
          { k: 'SEPTUM SHIFTS', t: 'The septum bows into the LV: LV filling and output fall — interdependence.' },
          { k: 'BP FALLS', t: 'Aortic pressure falls; RV wall tension is high — the RV becomes ischaemic.' },
          { k: 'SPIRAL', t: 'Ischaemia weakens the RV further: dilate, shift, fall — until it stops.' },
        ]} />

      <div className="cs-h2">🛟 Resuscitate the RV — every move changes the numbers</div>
      <RVResusBoard done={board}
        onChange={v => setVitals(v)}
        onDone={r => { answer('s9-board', r); setVitals({ hr: r.final.hr, sys: r.final.sys, dia: r.final.dia, spo2: r.final.spo2 }); }} />
      {board && (
        <div className={'cs-fb ' + (board.pts >= 18 ? 'best' : board.pts >= 10 ? 'ok' : 'wrong')}>
          {board.pts}/20. {board.pts >= 18
            ? 'Pressure first (noradrenaline), oxygen and CO₂ fixed, then contractility (dobutamine), with an inhaled pulmonary vasodilator if needed. No fluid, no vasodilators, no intubation in a crashing RV.'
            : 'Look at what each harmful step did to MAP and cardiac index — and the order: a vasopressor protects RV perfusion before an inodilator.'}
        </div>
      )}
      <ScoreOnce id="s9-board" pts={board == null ? null : board.pts} max={20} />

      <Contrast title="resuscitating the RV vs resuscitating the LV"
        is={{ h: 'Failing RV', points: ['Noradrenaline early: RV perfusion pressure.', 'Fluids usually HARM once CVP is high — remove volume once MAP is safe.', 'Oxygen, normocapnia, correct acidosis; inhaled NO/epoprostenol.', 'Avoid intubation if at all possible; if unavoidable — vasopressor running, ketamine/etomidate, low pressures.'] }}
        isnt={{ h: 'Failing LV', points: ['Vasodilators (nitrates) for pulmonary oedema.', 'A fluid bolus more often helps in under-filled shock.', 'CPAP/intubation lowers LV afterload — helpful.', 'Intra-aortic balloon pump unloads the LV.'] }} />
      <Decision id="s9-next" question="🌅 02:30: MAP 70 on noradrenaline 0.12 and dobutamine 5, SpO₂ 94% on high-flow, lactate 2.1, CVP still 19. Next?"
        options={[
          { id: 'decongest', label: 'Now that MAP is protected, start gentle decongestion (IV furosemide infusion) to shrink the RV and un-bow the septum; ICU; plan to wean over 48–72 h', verdict: 'best', points: 10,
            why: 'An over-distended RV works better smaller: removing volume restores septal geometry and LV filling. It is the opposite of the reflex “give fluid for low BP” — and only safe once perfusion pressure is secured.' },
          { id: 'fluid', label: '500 mL fluid for the soft pressure', verdict: 'wrong', points: 0, why: 'CVP 19 — the RV is already over-full.' },
          { id: 'remove', label: 'Back to the lab to remove a clip and re-open the leak', verdict: 'wrong', points: 2, why: 'Rarely needed — most afterload mismatch recovers over days with support as the RV adapts.' },
        ]} />
      {answers['s9-next'] && <Note kind="pearl" title="📈 Day 17">Off dobutamine on day 16, off noradrenaline on day 17. Weight 53.6 kg. Creatinine 108 µmol/L, bilirubin 19 µmol/L. TAPSE 13 mm. She walks to the window.</Note>}
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
      <ViciousCycle id="cyc-tr" title="🌀 TR begets TR"
        nodes={[
          { short: 'Leak', t: 'Tricuspid regurgitation', d: 'Part of every RV beat goes back to the RA.' },
          { short: 'RA & RV stretch', t: 'Volume load dilates the RA and the RV', d: 'The RV accepts volume by stretching — silently, for years.' },
          { short: 'Annulus widens', t: 'The annulus dilates and flattens; papillary muscles move apart', d: 'Annular dilation (atrial) and leaflet tethering (ventricular).' },
          { short: 'Gap grows', t: 'The leaflets no longer meet: a bigger coaptation gap', d: 'A bigger hole: more TR.' },
          { short: 'AF', t: 'A stretched RA fibrillates', d: 'AF itself dilates both atria and annuli further.' },
        ]}
        breaks={[
          { at: 3, t: 'Fix the valve EARLIER — before the RV, liver and kidneys are damaged (T-TEER, TTVR, or surgery with left-sided surgery).' },
          { at: 4, t: 'Early rhythm control in atrial functional TR can shrink the RA and annulus.' },
          { at: 1, t: 'Diuretics relieve the volume load (symptoms) — but cannot close the gap.' },
          { at: 0, t: 'Treat the cause of PH or the lead problem at its root.' },
        ]} />
      <Decision id="cyc-rhythm" question="🔁 A 66-year-old with paroxysmal AF for 2 years, a moderately dilated RA and moderate-to-severe atrial functional TR. Which step can cut the cycle earliest?"
        options={[
          { id: 'ablate', label: 'Rhythm control (ablation or antiarrhythmics) — restoring sinus rhythm can shrink the RA and annulus and reduce the TR', verdict: 'best', points: 10,
            why: 'In EARLY atrial functional TR, the annulus can remodel back. Twelve years later — like Mrs Marchetti — that window has closed.' },
          { id: 'diur', label: 'Increase the diuretic dose', verdict: 'ok', points: 3, why: 'Treats the congestion, not the mechanism.' },
          { id: 'wait', label: 'Watch until symptoms worsen', verdict: 'wrong', points: 0, why: 'The forgotten valve is usually treated too late.' },
        ]} />
      <ViciousCycle id="cyc-cr" title="🫘 The cardio-hepato-renal congestion spiral"
        nodes={[
          { short: 'High RAP', t: 'High right atrial pressure', d: 'Transmitted to the renal and hepatic veins.' },
          { short: 'Kidney squeezed', t: 'Renal venous congestion', d: 'Interstitial pressure rises; GFR falls.' },
          { short: 'Na⁺ held', t: 'Sodium and water retention; diuretic resistance', d: 'Gut oedema slows oral diuretics; RAAS fires.' },
          { short: 'More volume', t: 'Volume overload', d: 'More RV stretch, more annular dilation.' },
          { short: 'More TR', t: 'More regurgitation', d: 'Higher RA pressure — the loop closes.' },
        ]}
        breaks={[
          { at: 2, t: 'IV loop diuretics at an adequate dose, guided by 2-hour urine sodium; sequential nephron blockade with care.' },
          { at: 1, t: 'Accept a small creatinine rise during effective decongestion — do not stop at the first bump.' },
          { at: 4, t: 'Reduce the TR (intervention) when it is the engine of congestion.' },
          { at: 3, t: 'Salt restriction, daily weights, SGLT2 inhibitor.' },
        ]} />
      <ViciousCycle id="cyc-rv" title="⚠️ The RV ischaemia spiral"
        nodes={[
          { short: 'Afterload ↑', t: 'Afterload rises (closed leak, hypoxia, hypercapnia, PH)', d: 'The RV cannot eject its stroke volume.' },
          { short: 'RV dilates', t: 'RV dilates; wall tension rises', d: 'Higher oxygen demand.' },
          { short: 'Septal shift', t: 'The septum bows into the LV', d: 'LV under-filled.' },
          { short: 'BP falls', t: 'Systemic pressure falls', d: 'Aortic pressure is the RV’s perfusion pressure.' },
          { short: 'RV ischaemia', t: 'RV ischaemia', d: 'Contractility falls — the RV dilates further.' },
        ]}
        breaks={[
          { at: 3, t: 'Noradrenaline to restore MAP (RV perfusion pressure).' },
          { at: 0, t: 'Oxygen, normocapnia, correct acidosis; inhaled pulmonary vasodilators.' },
          { at: 4, t: 'Dobutamine (or milrinone) for contractility — once MAP is protected.' },
          { at: 1, t: 'Remove volume once perfusion pressure is safe; no fluid boluses into a full RV.' },
        ]} />
      <Decision id="cyc-why-nor" question="❓ Why does noradrenaline help a failing RV even though it constricts arteries?"
        options={[
          { id: 'perf', label: 'It raises aortic pressure above RV pressure, restoring right coronary perfusion; at moderate doses it barely raises pulmonary vascular resistance', verdict: 'best', points: 10,
            why: 'In a dilated, high-pressure RV, coronary flow depends on the gap between aortic and RV pressure. Close that gap and the RV starves.' },
          { id: 'ino', label: 'It is mainly a strong inotrope', verdict: 'wrong', points: 0, why: 'Its β₁ effect is modest; the key effect is systemic pressure.' },
          { id: 'pvr', label: 'It dilates the pulmonary arteries', verdict: 'wrong', points: 0, why: 'It does not.' },
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
      <WarStory title="☠️ The TIPS for “cryptogenic cirrhosis”"
        mistake="Labelling congestive hepatopathy as cirrhosis and placing a TIPS shunt for refractory ascites — nobody looked at the neck."
        burn="A pulsatile liver and a raised JVP mean the heart until proven otherwise. Severe TR is a contraindication to TIPS.">
        <p className="cs-p">A 69-year-old with AF and “refractory cirrhotic ascites”: four large-volume taps in two months, then a TIPS. Within hours the shunt poured portal blood into a right atrium already drowning in torrential TR. RV failure, pulmonary oedema, death on day 3. The ascitic protein had been 36 g/L all along.</p>
      </WarStory>
      <Decision id="mm-tips" question="Which single bedside finding should have stopped the TIPS?"
        options={[
          { id: 'jvp', label: 'A JVP to the earlobes with systolic cv waves and an expansile liver', verdict: 'best', points: 10, why: 'Cirrhosis does not raise the JVP; the RA does. Then echo, ascitic protein, hepatic vein Doppler.' },
          { id: 'albumin', label: 'A low albumin', verdict: 'wrong', points: 0, why: 'Low in both.' },
          { id: 'saag', label: 'A SAAG ≥ 11 g/L', verdict: 'wrong', points: 0, why: 'Both cardiac and cirrhotic ascites have a high SAAG — the PROTEIN separates them.' },
        ]} />
      <WarStory title="⚡ Metolazone, then the arrest"
        mistake="Adding daily metolazone to high-dose furosemide in a patient with TR and oedema, with no bloods for five days."
        burn="Sequential nephron blockade is powerful and brutal. Daily U&E and magnesium, short courses, a stop date.">
        <p className="cs-p">A 77-year-old with severe TR, legs “like tree trunks”. Furosemide 120 mg twice daily plus metolazone 5 mg daily, sent home. Day 5: K⁺ 2.4, Na⁺ 118, Mg²⁺ 0.4, creatinine 310. Torsades, then VF in the kitchen. Her daughter did CPR; she survived with a hypoxic brain injury.</p>
      </WarStory>
      <Decision id="mm-met" question="What should have accompanied the metolazone?"
        options={[
          { id: 'mon', label: 'Daily electrolytes and creatinine, potassium and magnesium replacement, a short fixed course with a stop rule', verdict: 'best', points: 10, why: 'And ideally started in hospital or with a heart-failure nurse visiting daily.' },
          { id: 'nothing', label: 'Nothing: it is an oral tablet', verdict: 'wrong', points: 0, why: 'Oral does not mean gentle.' },
        ]} />
      <WarStory title="🫁 The low TR velocity"
        mistake="Clipping torrential TR on the strength of an echo PASP of 38 mmHg — without a right heart catheter."
        burn="In torrential TR, a low velocity is not reassurance. Catheterise. Severe pre-capillary PH is a reason NOT to close the leak.">
        <p className="cs-p">A 63-year-old with COPD and torrential TR. “PA pressure only 38 on echo — perfect for a clip.” Three clips, trace TR. That night: BP 60/30, CVP 28, an RV like a balloon. The catheter finally done in ICU: PA 88/34, PVR 9 WU. She died on day 2 — the TR had been her RV’s only exit.</p>
      </WarStory>
      <Decision id="mm-rhc" question="Which test would have changed the decision?"
        options={[
          { id: 'rhc', label: 'Right heart catheterisation with Fick output and PVR', verdict: 'best', points: 10, why: 'PVR 9 WU, pre-capillary: treat the pulmonary vascular disease and leave the valve.' },
          { id: 'ct', label: 'A cardiac CT', verdict: 'wrong', points: 0, why: 'Anatomy, not pulmonary vascular resistance.' },
          { id: 'bnp', label: 'NT-proBNP', verdict: 'wrong', points: 0, why: 'High in both.' },
        ]} />
      <WarStory title="🍬 The GTN for the inferior STEMI"
        mistake="Sublingual GTN for chest pain in an inferior STEMI with right ventricular involvement."
        burn="Inferior STEMI: record V4R before nitrates. An infarcted RV lives on preload.">
        <p className="cs-p">A 58-year-old with inferior ST elevation, BP 108/70, clear lungs, raised JVP. The paramedic gave 800 µg of GTN for pain. Two minutes later: BP 58/30, bradycardic, grey. 1.5 L of fluid and atropine on the way in; cath-lab: proximal RCA occlusion with RV infarction. He survived — after a night on noradrenaline.</p>
      </WarStory>
      <Decision id="mm-v4r" question="🚑 Before giving nitrates in inferior STEMI, what should the paramedic do?"
        options={[
          { id: 'v4r', label: 'Check BP, look for clear lungs with a raised JVP, record right-sided leads (V4R): ST elevation ≥ 1 mm = RV infarct — no nitrates', verdict: 'best', points: 10, why: 'The RV infarct triad: hypotension, clear lungs, raised JVP. Treat with fluid and reperfusion, not venodilators.' },
          { id: 'half', label: 'Give a half dose of GTN', verdict: 'wrong', points: 0, why: 'Still a venodilator into a preload-dependent RV.' },
        ]} />
      <WarStory title="🔌 The lead nobody looked at"
        mistake="Attributing new, progressive TR after an ICD implant to “worsening heart failure” for four years without 3D imaging of the lead."
        burn="New or worsening TR after a device: image the lead. Lead-induced TR is treatable early — by extraction and a different pacing route.">
        <p className="cs-p">A 61-year-old with an ICD for dilated cardiomyopathy whose LV recovered. TR went from trivial to severe within six months; the notes said “HF progression”. Four years later: cardiac cirrhosis, varices, a haematemesis needing 9 units of blood and an ICU stay. A 3D echo then showed the lead pinning the septal leaflet. Extraction was by then a high-risk operation.</p>
      </WarStory>
      <WarStory title="💉 Propofol into the failing RV"
        mistake="A standard rapid-sequence intubation with propofol for a drowsy, hypercapnic patient in RV failure — no vasopressor running."
        burn="Intubating a failing RV is one of the most dangerous moments in medicine. Vasopressor first, haemodynamically stable induction, low airway pressures — or avoid it.">
        <p className="cs-p">A 70-year-old after tricuspid surgery, hypotensive and hypercapnic. Propofol 100 mg and positive pressure: MAP 30, PEA within two minutes. 40 minutes of CPR. Death.</p>
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
      <MultiSelect id="s12-home" question="🏠 Her discharge plan (day 21)?"
        items={[
          { id: 'diur', label: 'Torasemide 10 mg daily with a weight-based plan (+1 dose if weight up 1.5 kg in 2 days)', correct: true, why: 'Much lower than before the clip; self-adjusted.' },
          { id: 'sglt', label: 'Empagliflozin 10 mg daily', correct: true, why: 'HFpEF, class I.' },
          { id: 'doac', label: 'Apixaban 5 mg twice daily', correct: true, why: 'AF; full dose.' },
          { id: 'echo', label: 'Echo and device check at 1 month; heart failure nurse in 1 week; bloods in 1 week', correct: true, why: 'Clip stability, RV recovery, kidneys.' },
          { id: 'liver', label: 'Write to hepatology: congestive hepatopathy, not cirrhosis — cancel the variceal screening and paracentesis plan', correct: true, why: 'Correcting the label prevents the next harmful procedure.' },
          { id: 'endo', label: 'Endocarditis prevention advice and a device card', correct: true, why: 'Prosthetic material for valve repair counts as high risk.' },
          { id: 'tips', label: 'Keep the TIPS referral “in case”', correct: false, why: 'Never with this right heart.' },
        ]} />

      <div className="cs-h2">📝 Case quiz</div>
      <Quiz id="s12-quiz" items={[
        { q: 'A systolic wave in the JVP that rises with the carotid and an expansile liver mean…', options: ['Complete heart block', 'Severe tricuspid regurgitation', 'Constrictive pericarditis', 'Tricuspid stenosis'], answer: 1, why: 'The giant cv wave — Lancisi’s sign.' },
        { q: 'Ascitic fluid: SAAG 17 g/L, total protein 34 g/L. Most likely source?', options: ['Cirrhosis', 'Cardiac (right heart failure)', 'Peritoneal malignancy', 'Nephrotic syndrome'], answer: 1, why: 'High SAAG + high protein = cardiac.' },
        { q: 'In torrential TR, the TR peak velocity tends to be…', options: ['Very high', 'Low, because RV and RA pressures equalise', 'Unchanged', 'Unmeasurable'], answer: 1, why: 'ΔP = 4v² — a small difference, a low velocity.' },
        { q: 'On the five-grade scale, a TR vena contracta of 15 mm is…', options: ['Moderate', 'Severe', 'Massive', 'Torrential'], answer: 2, why: '14–20 mm = massive; ≥ 21 mm torrential.' },
        { q: 'Why is thermodilution unreliable in severe TR?', options: ['The catheter cannot reach the PA', 'The cold indicator recirculates across the leaking valve', 'AF stops it working', 'It overestimates PVR always'], answer: 1, why: 'Use the direct (or indirect) Fick method.' },
        { q: 'mPAP 31, PAWP 23, CO 4.2 L/min. Classification?', options: ['Pre-capillary PH', 'Isolated post-capillary PH', 'Combined post- and pre-capillary PH', 'No PH'], answer: 1, why: 'PVR = 8/4.2 ≈ 1.9 WU (≤ 2) with PAWP > 15.' },
        { q: 'Which haemodynamic profile most argues AGAINST closing a torrential TR?', options: ['PAWP 24, PVR 1.8', 'mPAP 22, PAWP 12, PVR 1.5', 'mPAP 52, PAWP 10, PVR 8', 'RA mean 18 with a cv wave'], answer: 2, why: 'Severe pre-capillary PH: the leak is the RV’s pop-off.' },
        { q: 'TRI-SCORE includes all EXCEPT…', options: ['Bilirubin', 'Daily furosemide ≥ 125 mg', 'NT-proBNP', 'LVEF < 60%'], answer: 2, why: 'Age, NYHA, RHF signs, furosemide, GFR, bilirubin, LVEF, RV dysfunction.' },
        { q: 'First drug for a hypotensive, failing RV with CVP 22?', options: ['1 L crystalloid', 'GTN infusion', 'Noradrenaline', 'IV metoprolol'], answer: 2, why: 'Restore RV perfusion pressure first.' },
        { q: 'Before nitrates in an inferior STEMI, record…', options: ['V7–V9 only', 'V4R', 'Lead aVL only', 'Nothing more'], answer: 1, why: 'ST elevation in V4R = RV infarction: no nitrates.' },
      ]} />

      <div className="cs-card" style={{ borderColor: 'var(--accent2)' }}>
        <div className="cs-h2" style={{ marginTop: 0 }}>🏆 Your score</div>
        <p className="cs-p" style={{ fontSize: 20 }}><b className="cs-mono">{totals.got} / {totals.max}</b> · {pct}% · <b style={{ color: pct >= 70 ? 'var(--good)' : 'var(--amber)' }}>{band}</b></p>
        <div className="cs-scorebar" style={{ marginBottom: 14 }}><i style={{ width: `${pct}%` }} /></div>
        <Table head={['Stage', 'Points']} rows={def.stages.map(st => [st.title, N(`${totals.by[st.id]?.got || 0} / ${totals.by[st.id]?.max || 0}`)])} />
      </div>

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🎯 Take-home points</div>
        <ol className="cs-ul">
          <li className="cs-li">👀 Look at the neck before the liver: a systolic cv wave and an expansile liver mean the right heart.</li>
          <li className="cs-li">🧪 Ascitic protein ≥ 25 g/L with a high SAAG is cardiac until proven otherwise — and TIPS is lethal in severe TR.</li>
          <li className="cs-li">📉 In torrential TR the jet velocity FALLS: the echo PASP lies low. Catheterise before deciding.</li>
          <li className="cs-li">📏 Grade TR on five levels — vena contracta, EROA, 3D VCA; PISA under-reads big crescent orifices.</li>
          <li className="cs-li">🔬 Fick, not thermodilution, in severe TR. Pre- vs post-capillary PH decides who benefits.</li>
          <li className="cs-li">🫀 Atrial functional TR (AF, HFpEF, big RA) has the best outlook — and rhythm control helps only early.</li>
          <li className="cs-li">🧮 TRI-SCORE: isolated tricuspid surgery is safest EARLY. Late patients go to transcatheter options or medical therapy.</li>
          <li className="cs-li">🗜️ T-TEER improves quality of life; aim for moderate or less, a low gradient and a free lead — not perfection.</li>
          <li className="cs-li">🛟 The failing RV: noradrenaline first, oxygen and CO₂, then dobutamine; no fluid boluses, no vasodilators, avoid intubation.</li>
          <li className="cs-li">💧 Decongest with adequate IV loop doses and a 2-hour urine sodium; sequential blockade only with daily bloods.</li>
        </ol>
      </div>
      <Video id="EnNbKyOaHZI" title="Tricuspid regurgitation murmur — description, causes, pathophysiology" />
      <CaseLibrary playlist={VALVE_PLAYLIST} start={VALVE_PLAYLIST_START} channels={VALVE_CHANNELS}>
        Keep going: more structural and valvular cases from the same teams.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const VALVE_08 = {
  title: 'Severe functional TR · Congestive hepatopathy · RHC, T-TEER and RV afterload mismatch',
  short: 'Structural Heart · Case 08',
  patient: {
    name: 'Mrs Elena Marchetti',
    meta: '74 F · MRN 5208-1147 · 58 kg',
    flags: [
      { text: 'Permanent AF · VVI lead', tone: 'amber' },
      { text: 'Bilirubin 38', tone: 'red' },
      { text: 'eGFR 30', tone: 'amber' },
      { text: 'Apixaban · furosemide', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 0, limit: 50, basis: 'echo-guided; no contrast needed' },
  clock0: min(19, 20),
  vitals0: { hr: 88, sys: 104, dia: 66, spo2: 95, rr: 20, st: 0, rhythm: 'af' },
  brand: { icon: '🫀', line: 'Structural Heart · Case 08' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / IM / EM', tone: 'cyan' },
      { text: 'Right heart · transcatheter', tone: 'red' },
      { text: 'ESC/EACTS 2025 VHD-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'The forgotten', style: 'outline' },
      { text: 'valve', style: 'grad' },
      { text: '& the RV’s exit', style: 'cyan' },
    ],
    hook: (
      <>
        A retired seamstress arrives with a hepatology letter that says <b>“cryptogenic cirrhosis”</b>. But her earlobes bob with every heartbeat and her liver pushes back against your hand.
        You will read her neck, measure a TR jet whose <span className="r">low velocity hides a torrential leak</span>, catheterise the right heart, score her risk, clip the valve beside her pacing lead —
        and meet the night when the RV, robbed of its <span className="g">pop-off valve</span>, starts to die.
      </>
    ),
    image: null,
    sims: 's2',
    crisis: 's9',
    cards: [
      { k: '👵 The patient', t: 'Mrs Elena Marchetti, 74 — twelve years of AF, a stiff LV, a pacing lead, and a liver letter that blames the wrong organ.' },
      { k: '🧑‍⚕️ Your role', t: 'From the ambulance and ED to the echo lab, the cath lab, the heart team, the structural lab and the night on the unit.' },
      { k: '🎛️ In your hands', t: 'A JVP and pulsatile liver, the TR Doppler paradox, vena contracta and PISA, RV–PA coupling, a right heart catheter, TRI-SCORE, a tricuspid clip and an RV resuscitation board.' },
      { k: '🧠 How it teaches', t: 'The RV is built for volume, not pressure — and every decision in this case follows from that.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'The liver that pulses', Component: Presentation,
      pill: '🌊 19:20 — “cirrhosis” with a JVP to the earlobes',
      lede: 'Read the neck, feel the liver, tap the ascites — and decongest properly.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 88, sys: 104, dia: 66, spo2: 95, rr: 20, rhythm: 'af' }); atLeastClock(min(19, 20)); } },
    { id: 's2', icon: '📏', nav: 'Echo & Quantification', title: 'Echo: the velocity that lies', Component: EchoStage,
      pill: '🎯 Measure the leak — and the trap',
      lede: 'The TR Doppler paradox, vena contracta and PISA on the five-grade scale, the mechanism and RV–PA coupling.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 84, sys: 102, dia: 64, spo2: 96, rr: 18, rhythm: 'af' }); atLeastClock(min(24 + 10, 0)); } },
    { id: 's3', icon: '👥', nav: 'RHC & Heart Team', title: 'Right heart catheter, risk and the heart team', Component: HeartTeam,
      pill: '🔬 Pre- or post-capillary? Who benefits?',
      lede: 'Read the traces, choose the right cardiac output, classify the PH, score TRI-SCORE, decide with her.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 82, sys: 106, dia: 64, spo2: 96, rr: 16, rhythm: 'af' }); atLeastClock(min(4 * 24 + 9, 0)); } },
    { id: 's4', icon: '🧮', nav: 'Planning', title: 'Planning: the gaps, the grasp and the lead', Component: Planning,
      pill: '🧊 3D TOE — where to clip, what to avoid',
      lede: 'Coaptation gaps, the septal leaflet, and a pacing lead in the commissure.',
      enter: ({ atLeastClock }) => atLeastClock(min(12 * 24 + 11, 0)) },
    { id: 's5', icon: '🩸', nav: 'Set-up', title: 'Set-up in the structural lab', Component: Setup,
      pill: '🧷 Day 14 — protect the RV from the first minute',
      lede: 'Checklist, sequence — and why induction is the first danger.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 82, sys: 108, dia: 62, spo2: 98, rr: 14, rhythm: 'af' }); atLeastClock(min(14 * 24 + 8, 15)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy: how much is enough?', Component: Strategy,
      pill: '⚖️ Moderate, low gradient, lead free',
      lede: 'Why closing the leak loads the RV — and what a good grasp looks like.',
      enter: ({ atLeastClock }) => atLeastClock(min(14 * 24 + 9, 0)) },
    { id: 's7', icon: '🛠️', nav: 'T-TEER', title: 'Tricuspid edge-to-edge repair', Component: Procedure,
      pill: '🗜️ Grasp, check, release — and stop',
      lede: 'Antero-septal first, avoid the lead and the wide gap, judge the result.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 84, sys: 108, dia: 62, spo2: 99, rr: 12, rhythm: 'af' }); atLeastClock(min(14 * 24 + 9, 10)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit', Component: Recovery,
      pill: '💊 Fewer diuretics, the right DOAC, the lead check',
      lede: 'Bed 8: what to check, what to restart — and the one drug to be careful with tonight.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 86, sys: 106, dia: 62, spo2: 95, rr: 16, rhythm: 'af' }); atLeastClock(min(14 * 24 + 15, 0)); } },
    { id: 's9', icon: '🚨', nav: 'Night Crisis', title: 'The night: the RV loses its pop-off', Component: Crisis,
      pill: '🌙 23:40 — grey, cold, CVP 22',
      lede: 'Recognise acute RV afterload mismatch and resuscitate it with RV physiology.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 118, sys: 74, dia: 42, spo2: 86, rr: 10, rhythm: 'af' }); atLeastClock(min(14 * 24 + 23, 40)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'TR begets TR, the congestion spiral, and the RV ischaemia spiral.',
      enter: ({ setVitals }) => setVitals({ hr: 84, sys: 108, dia: 64, spo2: 96, rr: 16, rhythm: 'af' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Six patients who taught these rules.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'Her plan, the quiz — then your score.' },
  ],
};

export default function Valve08({ onClose }) {
  return <CaseShell def={VALVE_08} onClose={onClose} />;
}
