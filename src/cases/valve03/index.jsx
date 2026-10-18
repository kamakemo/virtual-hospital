import React from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import { Doppler } from '../kit/Valve.jsx';
import { Echo as SubcostalEcho } from '../kit/Physiology.jsx';
import { JVPViewer, KnockPhono, LVRVPressure, MitralInflow, AnnulusDoppler, ConstrictionBoard } from './sims.jsx';
import { HeartTeamPlanner, Pericardiectomy, RVRescue } from './procedures.jsx';
import { MEDIA, CONSTRICTION_SEARCHES, HEMO_SEARCHES, PORCELAIN_SEARCHES, LM_SEARCHES } from './media.js';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 03 · BED 3
   GRAND ROUNDS — RADIATION-ASSOCIATED HEART DISEASE

   Mrs Helen Marchetti, 53, a chemistry teacher, treated for
   Hodgkin lymphoma at 27 with ABVD and mantle-field radiotherapy
   (36 Gy, 1999). Eight months of breathlessness, oedema and
   ascites: called HFpEF (more furosemide), then cirrhosis (a
   liver clinic). Everything the beam touched is diseased — the
   pericardium (calcific constriction), the aortic and mitral
   valves and the aorto-mitral curtain, the coronary ostia, the
   conduction system, the ascending aorta (porcelain), the lungs,
   the thyroid.

   1  the neck veins, the knock, the ECG, the ascitic tap
   2  the learner measures constriction: mitral E variation,
      annular e′, hepatic veins, simultaneous LV/RV pressures —
      and an amyloid heart for contrast; low-flow AS hidden by
      the shell
   3  the heart team: why a radiated chest is hostile
   4  the sternotomy-risk planner: what to fix, and in what order
   5  part one done (PCI + TAVI); set-up for the pericardiectomy
   6  strategy: approach, bypass, which ventricle first, extent
   7  the radical pericardiectomy, plate by plate
   8  the first evening in intensive care
   9  02:40 — low output with a dilated RV
   10 vicious cycles  11 M&M  12 survivorship, debrief

   Clinical content follows the 2015 ESC pericardial diseases
   guideline (and the 2025 ESC myocarditis–pericarditis update
   where it applies), ASE/EACVI 2013 multimodality pericardial
   imaging recommendations and the Mayo echo criteria (Welch
   2014), cath criteria for constriction (Talreja 2008), the 2025
   ESC/EACTS valvular heart disease guideline, the 2024 ESC
   chronic coronary syndromes guideline, the 2022 ESC cardio-
   oncology guideline and the 2023 ESC/EACTS SCAI/EAPCI position
   on radiation-associated heart disease where it applies,
   simplified for teaching. Where the evidence is thin (which
   ventricle to free first, sequencing in a hostile chest) the
   text says so.
   ============================================================ */

const min = (h, m) => h * 60 + m;

/* low-voltage limb leads, left anterior fascicular block */
const RAD_ECG = {
  shape: {
    I: { r: 3.5, s: 0.4 }, aVL: { r: 3.6, s: 0.3 }, II: { r: 1.5, s: 3 }, III: { r: 1, s: 3.8 }, aVF: { r: 1.2, s: 3.3 }, aVR: { r: 0.8, s: 3, inv: true },
    V1: { r: 1.5, s: 6 }, V2: { r: 2.5, s: 8 }, V3: { r: 4, s: 5 }, V4: { r: 6, s: 3 }, V5: { r: 6, s: 2 }, V6: { r: 5, s: 1 },
  },
  tInv: { V4: true, V5: true, V6: true },
};

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

/** Channel searches the learner can open — used where no video could be verified. */
function SearchLinks({ title, links }) {
  return (
    <div className="cs-card">
      <div className="cs-h2" style={{ marginTop: 0 }}>{title}</div>
      <div className="cs-row">{links.map(l => <a key={l.url} className="cs-btn" href={l.url} target="_blank" rel="noopener noreferrer" title={l.note}>▶ {l.name} ↗</a>)}</div>
    </div>
  );
}

function ScoreOnce({ id, pts, max }) {
  const { award, stageId } = useCase();
  React.useEffect(() => { if (pts != null) award(stageId, id, pts, max); }, [pts]);  // eslint-disable-line
  return null;
}

/** The radiation field, drawn on her chest: what it crossed, and what it left. */
function MantleField() {
  const parts = [
    { y: 64, t: '🦋 Thyroid', d: 'Hypothyroid since 2004 — on levothyroxine' },
    { y: 96, t: '🧠 Carotids', d: 'Not yet imaged' },
    { y: 128, t: '🫁 Lung apices', d: 'Fibrotic strands; DLCO 48%' },
    { y: 160, t: '🏺 Ascending aorta', d: 'Circumferential calcium — porcelain' },
    { y: 192, t: '🫀 Pericardium · valves · ostia · conduction', d: 'Her symptoms live here' },
    { y: 224, t: '🎗️ Breasts', d: 'Annual MRI was due from age 35 — never started' },
  ];
  return (
    <div className="cs-card">
      <div className="cs-h2" style={{ marginTop: 0 }}>☢️ The mantle field, 1999 — 36 Gy in 20 fractions</div>
      <div className="cs-grid2" style={{ alignItems: 'center' }}>
        <div className="cs-viewer" style={{ background: '#05070A', maxWidth: 320 }}>
          <svg viewBox="0 0 220 260" style={{ width: '100%', display: 'block' }} role="img" aria-label="Mantle radiotherapy field over the neck and chest">
            <path d="M80 20 C80 50 70 60 40 70 C20 76 14 100 14 140 L14 250 L206 250 L206 140 C206 100 200 76 180 70 C150 60 140 50 140 20 Z" fill="#14243B" stroke="#2B4366" />
            <path d="M88 40 L132 40 L150 80 L180 90 L184 210 L150 214 L150 150 C130 140 90 140 70 150 L70 214 L36 210 L40 90 L70 80 Z" fill="rgba(255,77,109,0.22)" stroke="#FF4D6D" strokeDasharray="5 4" />
            <ellipse cx="96" cy="176" rx="20" ry="30" fill="rgba(5,11,22,0.9)" stroke="#6A7F9B" strokeDasharray="3 3" />
            <ellipse cx="124" cy="176" rx="20" ry="30" fill="rgba(5,11,22,0.9)" stroke="#6A7F9B" strokeDasharray="3 3" />
            <path d="M98 160 C104 150 124 150 130 166 C136 186 118 206 110 210 C98 200 88 182 98 160 Z" fill="rgba(255,90,82,0.75)" />
            <text x="110" y="246" textAnchor="middle" fill="#9FB4C6" fontSize="9" fontFamily="JetBrains Mono, monospace">lungs shielded · heart in the field</text>
            {parts.map(p => <circle key={p.y} cx="200" cy={p.y * 0.95} r="3" fill="#F5C451" />)}
          </svg>
        </div>
        <ul className="cs-ul">
          {parts.map(p => <li key={p.t} className="cs-li"><b>{p.t}</b> — {p.d}</li>)}
        </ul>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>A mantle field covered the neck, the axillae and the mediastinum, with lung blocks — and the heart sat in the middle of it. Modern involved-site radiotherapy gives a fraction of that heart dose. Her generation is the one presenting now, 20–30 years later.</p>
    </div>
  );
}

/* ============================================================
   1 · PRESENTATION & TRIAGE
   ============================================================ */

function Presentation() {
  const { answers, answer } = useCase();
  const k = answers['s1-knock'];
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🚑 08:15</span>Mrs Helen Marchetti, 53, a secondary-school chemistry teacher, rings 999: so breathless she cannot finish the school stairs, light-headed since her water tablet was doubled again on Monday. The crew find a tense, swollen abdomen, legs swollen to the thighs, BP 94/70, HR 108 regular.</p>
        <p className="cs-p"><span className="cs-time">📜 the story</span>Eight months of breathlessness. Her GP heard “heart failure with a normal pump” on an echo report (“EF 62%, diastolic dysfunction”) and stepped furosemide up from 40 to 120 mg a day. Her creatinine climbed; she got thirstier and dizzier. Three weeks ago a hepatology clinic: ascites, “probable cryptogenic cirrhosis”, liver stiffness 21 kPa — gastroscopy booked. Hodgkin lymphoma at 27 (1999): ABVD chemotherapy and mantle-field radiotherapy. “Cured”, discharged from oncology follow-up in 2009. Hypothyroid since 2004. Never smoked, no alcohol.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🏥 09:10</span>Emergency department, resus bay 2. You are the cardiology registrar on call.</p>
      </div>
      <Note kind="pearl" title="Grand rounds question">Three doctors have looked at this woman: “HFpEF”, “cirrhosis”, “dehydrated from diuretics”. Each was right about one organ and wrong about the cause. By the end you should be able to say in one sentence why every one of her symptoms comes from a beam of X-rays in 1999.</Note>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>📊 Observations · 09:10</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('104 /min, sinus', 'cs-hi')], ['Blood pressure', N('98/76 mmHg — pulse pressure 22', 'cs-hi')],
            ['Pulsus paradoxus', N('6 mmHg')], ['SpO₂', N('94% on air')], ['Resp. rate', N('22 /min')],
            ['Temperature', N('36.6 °C')], ['Weight', N('68 kg (61 kg a year ago)')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🩺 Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Skin over the upper chest and neck: thin, shiny, telangiectatic; woody subcutaneous tissue in the neck.</li>
            <li className="cs-li">JVP to the angle of the jaw at 45° — watch it with breathing below.</li>
            <li className="cs-li">Quiet precordium, impalpable apex. An early diastolic extra sound; a soft ejection murmur at the right upper sternal edge.</li>
            <li className="cs-li">Tense ascites, a smooth enlarged liver; pitting oedema to the thighs. Chest: dull at both bases, few crackles.</li>
            <li className="cs-li">No palmar erythema, no spider naevi, no asterixis.</li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">🫗 The neck veins — and three other necks</div>
      <p className="cs-p">Watch her internal jugular through two breaths, then switch to the other patterns. What does the column do when she breathes in, and how fast does it fall after the v wave?</p>
      <JVPViewer />
      <Decision id="s1-kuss" question="Her JVP rises from 12 to 15 cm as she breathes in, with a steep y descent. What does this tell you — and what doesn’t it?"
        options={[
          { id: 'rv', label: 'Kussmaul’s sign: her right heart cannot accept the extra venous return of inspiration. It fits constriction, but restriction, RV infarction and severe TR can do it too — it is not a diagnosis on its own', verdict: 'best', points: 10,
            why: 'Kussmaul’s sign is a property of a right heart that is full and fixed, whatever fixes it. The steep y (Friedreich’s) adds weight: the heart fills violently fast in early diastole and then stops. Together they point at the pericardium; they do not prove it.' },
          { id: 'tamp', label: 'Tamponade — get the pericardiocentesis kit', verdict: 'wrong', points: 0,
            why: 'Tamponade blunts the y descent (no moment of free filling) and rarely gives Kussmaul. Her pulsus paradoxus is only 6 mmHg. The commonest reflex mistake in a woman with a high JVP and a pericardial history.' },
          { id: 'fluid', label: 'Fluid overload from heart failure — more diuretic', verdict: 'wrong', points: 0,
            why: 'A simply overloaded right heart still accepts inspiration: the JVP falls. A JVP that rises on inspiration says the problem is the container, not the volume.' },
          { id: 'cirr', label: 'It supports cirrhosis with portal hypertension', verdict: 'wrong', points: 0, why: 'Cirrhosis does not raise the JVP. A high JVP with ascites is the heart until proven otherwise.' },
        ]} />
      <Contrast title="the neck in constriction vs the neck in tamponade"
        is={{ h: 'Constriction — a rigid SHELL', points: ['Steep x AND steep y: an “M” or “W”.', 'Kussmaul: rises in inspiration.', 'Pulsus paradoxus small or absent.', 'Pericardial knock; quiet precordium.'] }}
        isnt={{ h: 'Tamponade — a FLUID squeeze', points: ['Deep x, ABSENT y: no free filling at any point in diastole.', 'Falls (a little) in inspiration.', 'Pulsus paradoxus large (> 10 mmHg).', 'Muffled sounds, no knock.'] }} />

      <div className="cs-h2">🔊 The extra sound — measure it</div>
      <p className="cs-p">There is a sound early in diastole. Timing it is the bedside test that separates the knock from an S3 and an opening snap.</p>
      <KnockPhono done={k} onMeasure={r => answer('s1-knock', r)} />
      {k && <div className={'cs-fb ' + (k.close ? 'best' : 'ok')}>You measured A2 → {k.ms} ms (true {k.truth} ms). {k.close ? 'A sharp sound ~110 ms after A2: earlier and higher-pitched than an S3, later than an opening snap — the pericardial knock.' : 'Off the mark — re-time it. At ~110 ms it is a knock; ~160 ms an S3; ~70 ms an opening snap.'}</div>}
      <ScoreOnce id="s1-knock" pts={k == null ? null : k.close ? 8 : 3} max={8} />
      <Why title="🔨 Why the knock comes earlier than an S3"
        chain={[
          { k: 'HIGH ATRIA', t: 'Atrial pressures of 20+ mmHg push blood in the instant the AV valves open.' },
          { k: 'FAST FILL', t: 'A healthy, briskly relaxing ventricle sucks it in — most of diastolic filling in the first third of diastole.' },
          { k: 'THE WALL', t: 'The ventricle hits the rigid shell. Filling stops dead, early.' },
          { k: 'THE SOUND', t: 'That abrupt stop vibrates the walls: an early, sharp knock — where an S3 is a later, softer deceleration in a big floppy ventricle.' },
        ]}>
        The same physics draws the steep y in her neck and the dip-and-plateau on the catheter trace: one event, seen three ways.
      </Why>

      <MantleField />
      <MultiSelect id="s1-field" question="☢️ Mantle radiotherapy at 27. Which of these can it cause 25 years later?"
        items={[
          { id: 'peri', label: 'Constrictive pericarditis', correct: true, why: 'The pericardium fibroses and calcifies — the commonest late cardiac effect after the early pericarditis years.' },
          { id: 'valve', label: 'Thickened, calcified aortic and mitral valves (and the aorto-mitral curtain)', correct: true, why: 'Left-sided valves, which face high pressures, are hit hardest; regurgitation first, stenosis later.' },
          { id: 'cad', label: 'Ostial and proximal coronary stenoses', correct: true, why: 'The ostia and proximal arteries sit in the beam — often the left main and RCA ostia.' },
          { id: 'cond', label: 'Conduction disease: AV block, fascicular and bundle branch block', correct: true, why: 'Fibrosis of the conduction system.' },
          { id: 'myo', label: 'Myocardial fibrosis — a restrictive element', correct: true, why: 'Microvascular injury fibroses the muscle too; her anthracycline adds its own myocardial dose.' },
          { id: 'aorta', label: 'A porcelain ascending aorta', correct: true, why: 'Circumferential calcification — the surgeon’s nightmare.' },
          { id: 'lung', label: 'Lung fibrosis and a low DLCO', correct: true, why: 'Lung tissue at the field edges scars.' },
          { id: 'tv', label: 'Tricuspid stenosis as the usual valve lesion', correct: false, why: 'Right-sided valves see low pressures and are much less often affected.' },
          { id: 'kid', label: 'Radiation nephritis', correct: false, why: 'The kidneys were outside a mantle field. Her creatinine rise is the diuretic plus a low output.' },
        ]} />
      <Why title="☢️ Why the damage arrives twenty years after the treatment"
        chain={[
          { k: 'ENDOTHELIUM', t: 'Radiation kills the endothelial cells of the small vessels first.' },
          { k: 'MICRO-ISCHAEMIA', t: 'Capillaries drop out; the tissue they fed becomes chronically, mildly ischaemic.' },
          { k: 'FIBROSIS', t: 'Ischaemia and TGF-β drive fibroblasts to lay down collagen — slowly, year after year, without stopping.' },
          { k: 'CALCIUM', t: 'Fibrosed pericardium, valves and aortic wall calcify; arteries develop an accelerated, fibrous atherosclerosis.' },
          { k: 'DECADES', t: 'The clinical disease appears 10–30 years later, when the process crosses a threshold — long after oncology follow-up has stopped.' },
        ]} />

      <ECG12 rate={104} pr={0.22} shape={RAD_ECG.shape} tInv={RAD_ECG.tInv}
        caption="Sinus tachycardia 104, PR 220 ms (first-degree AV block). Left axis with small r and deep S in II, III and aVF: left anterior fascicular block. Low-voltage limb leads (every limb QRS < 5 mm). T-wave inversion V4–V6. No Q waves." />
      <Decision id="s1-ecg" question="What does the ECG add?"
        options={[
          { id: 'all', label: 'Three clues in one: low voltage and T inversion (a thick shell or effusion around the heart), conduction disease (radiation fibrosis), and a sinus tachycardia she needs', verdict: 'best', points: 8,
            why: 'Low voltage occurs in about a third of constriction. The PR and the fascicular block are the conduction system telling you it was in the field too — remember them before any TAVI. And the tachycardia is not a target: with a fixed stroke volume it is her output.' },
          { id: 'ami', label: 'Lateral ischaemia — treat as NSTEMI', verdict: 'wrong', points: 0, why: 'Widespread T changes without symptoms of ACS or a troponin rise are common in constriction.' },
          { id: 'rate', label: 'Sinus tachycardia — start a beta-blocker for rate control', verdict: 'wrong', points: 0, why: 'In constriction the ventricle cannot fill more per beat; rate is the only lever left. The war stories have the patient this killed.' },
        ]} />

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🧪 Bloods</div>
          <Table head={['Test', 'Result']} rows={[
            ['NT-proBNP', N('410 ng/L', 'cs-hi')], ['hs-Troponin T', N('14 ng/L')],
            ['Creatinine / eGFR', N('168 µmol/L · 32 (92 in spring)', 'cs-hi')], ['Sodium / potassium', N('129 / 3.4 mmol/L', 'cs-hi')],
            ['Albumin', N('30 g/L', 'cs-hi')], ['Bilirubin / ALP / ALT', N('28 µmol/L / 190 U/L / 41 U/L', 'cs-hi')],
            ['INR / platelets', N('1.3 / 210 ×10⁹/L')], ['TSH', N('3.1 mU/L (on levothyroxine)')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>💧 Diagnostic ascitic tap</div>
          <Table head={['Ascites', 'Result']} rows={[
            ['Serum–ascites albumin gradient (SAAG)', N('17 g/L (≥ 11)', 'cs-hi')], ['Ascitic total protein', N('34 g/L (≥ 25)', 'cs-hi')],
            ['White cells', N('180 /mm³, no neutrophilia')], ['Cytology', N('no malignant cells')],
          ]} />
          <div className="cs-h2">🩻 Chest X-ray</div>
          <p className="cs-p">Normal-sized heart. On the lateral film, a thin curved line of calcium along the inferior and anterior heart border. Strand-like fibrosis at both apices, paramediastinal straightening, small bilateral effusions.</p>
        </div>
      </div>
      <Decision id="s1-tap" question="High SAAG (≥ 11 g/L) AND high ascitic protein (≥ 25 g/L). What does the fluid say?"
        options={[
          { id: 'post', label: 'Post-sinusoidal portal hypertension: the liver is congested from above — the heart (or hepatic veins), not cirrhosis', verdict: 'best', points: 10,
            why: 'The high gradient says the pressure in the liver’s sinusoids is high. The high protein says the sinusoids themselves are still healthy and leaky — cirrhotic sinusoids are scarred (“capillarised”) and leak low-protein fluid. Congestion from a high right atrial pressure gives exactly this.' },
          { id: 'cirr', label: 'Cirrhosis — the SAAG is high', verdict: 'wrong', points: 0, why: 'Cirrhosis gives a high SAAG with a LOW protein (< 25 g/L). Half the picture is not the picture.' },
          { id: 'mal', label: 'Peritoneal malignancy after lymphoma', verdict: 'wrong', points: 0, why: 'Malignant ascites has a LOW SAAG (< 11) — the protein comes from the peritoneum, not portal pressure. And cytology is clear.' },
        ]} />
      <Contrast title="cardiac ascites vs cirrhotic ascites"
        is={{ h: 'Cardiac / post-sinusoidal', points: ['SAAG ≥ 11 AND protein ≥ 25 g/L.', 'High JVP — always look at the neck.', 'Liver stiffness high from congestion, not fibrosis (it falls when the pressure falls).', 'Few stigmata of chronic liver disease.'] }}
        isnt={{ h: 'Cirrhotic / sinusoidal', points: ['SAAG ≥ 11 with protein < 25 g/L.', 'JVP normal or low.', 'Spider naevi, palmar erythema, splenomegaly, low platelets.', 'Stiffness reflects scar.'] }} />

      <Decision id="s1-bnp" question="An NT-proBNP of 410 in a woman this congested, with an eGFR of 32. What do you make of it?"
        options={[
          { id: 'shell', label: 'Surprisingly low — a clue for constriction: the shell stops the myocardium from stretching, so it releases little BNP', verdict: 'best', points: 8,
            why: 'BNP is released by stretched myocytes. A rigid pericardium limits the stretch, so values are often only modestly raised in constriction — and much higher in a restrictive cardiomyopathy with the same filling pressures. Kidney failure pushes NT-proBNP UP, which makes 410 even more striking.' },
          { id: 'nohf', label: 'Too low for heart failure — look elsewhere for the cause of the oedema', verdict: 'wrong', points: 0, why: 'This is the trap: a “normal-ish” BNP has sent many constriction patients to hepatology.' },
          { id: 'renal', label: 'Uninterpretable with this kidney function', verdict: 'ok', points: 2, why: 'Renal failure raises it — so a modest value is still informative.' },
        ]} />

      <Decision id="s1-diur" question="She is light-headed, BP 98/76, creatinine doubled, sodium 129 — on furosemide 120 mg a day. What now?"
        options={[
          { id: 'hold', label: 'Pause the oral loop diuretic today; small IV doses later, titrated to weight and kidneys, aiming for gentle decongestion — not a dry patient. Fluid restriction, potassium replaced, admit to the cardiology bed', verdict: 'best', points: 10,
            why: 'In constriction the ventricles fill only as far as the shell allows, so filling pressure must stay HIGH to fill them at all. Each extra diuretic lowers that pressure and the stroke volume falls with it: dizziness, low BP, kidney injury. Diuretics relieve congestion here only by starving the heart. The cure is the shell.' },
          { id: 'more', label: 'Switch to IV furosemide 80 mg twice daily — she is fluid-overloaded', verdict: 'wrong', points: 0, why: 'She is overloaded AND underfilled at the same time. Driving harder is how the first war story died.' },
          { id: 'fluid', label: 'IV fluid bolus for the AKI and low pressure', verdict: 'ok', points: 3, why: 'A small, careful volume can lift a constricted, over-diuresed patient. But a litre on top of tense ascites and pleural effusions will not fix the cause.' },
        ]} />
      <Why title="🫗 Why her veins are full but her arteries are empty"
        chain={[
          { k: 'THE SHELL', t: 'A rigid pericardium sets a hard limit on total heart volume.' },
          { k: 'SMALL FILL', t: 'Each ventricle fills briskly, then stops: a small, fixed stroke volume.' },
          { k: 'BACK-UP', t: 'Blood that cannot get in waits in the veins: JVP 12 cm, liver, ascites, legs.' },
          { k: 'LOW OUTPUT', t: 'Small fixed stroke volume × the heart rate = all the output she has: narrow pulse pressure, tachycardia, low BP.' },
          { k: 'KIDNEYS', t: 'High venous pressure behind and low flow in front: the kidney is squeezed from both sides — and fluid-retaining hormones keep the cycle going.' },
        ]} />
      <Contrast title="constrictive pericarditis vs “HFpEF”"
        is={{ h: 'Constriction — the box is the problem', points: ['Normal-sized heart, healthy muscle that relaxes briskly (good e′).', 'Right-sided signs dominate: JVP, liver, ascites.', 'Modest BNP.', 'Curable by surgery.'] }}
        isnt={{ h: 'HFpEF — the muscle is the problem', points: ['Stiff hypertrophied muscle, slow relaxation (low e′), big left atrium.', 'Left-sided signs first: orthopnoea, pulmonary oedema.', 'High BNP.', 'Treated with diuretics, SGLT2 inhibitors, risk factors.'] }} />
    </>
  );
}

/* ============================================================
   2 · MEASURING IT — ECHO & THE CATHETER
   ============================================================ */

function Measure() {
  const { answers, answer } = useCase();
  const av = answers['s2-av'];
  const mi = answers['s2-mi'];
  const ad = answers['s2-ead'];
  const hc = answers['s2-cath'];
  const hr = answers['s2-cath-amy'];
  return (
    <>
      <p className="cs-p">Day 2. Transthoracic echo, with a respirometer trace on screen — constriction lives in the breathing. EF 60%, normal-sized ventricles, bright thickened pericardium, IVC 26 mm that barely moves. Thick, calcified aortic leaflets; a calcified bar running from the aortic root into the anterior mitral leaflet.</p>

      <div className="cs-h2">🎛️ A · Mitral inflow with breathing</div>
      <MitralInflow done={mi} onMeasure={r => answer('s2-mi', r)} />
      {mi && <div className={'cs-fb ' + (mi.close ? 'best' : 'ok')}>Your calipers: E {mi.ex.toFixed(2)} → {mi.ins.toFixed(2)} m/s, a {mi.variation.toFixed(0)}% fall in inspiration (true ≈ {mi.trueVar.toFixed(0)}%). {mi.close ? 'Well above 25%: respiratory variation of the kind constriction produces.' : 'Re-measure: tallest E of expiration, smallest E of inspiration.'}</div>}
      <ScoreOnce id="s2-mi" pts={mi == null ? null : mi.close ? 10 : 4} max={10} />
      <Why title="🫁 Why breathing moves the mitral E wave in constriction"
        chain={[
          { k: 'INSPIRATION', t: 'Pressure in the chest falls by a few mmHg — the pulmonary veins, inside the chest, fall with it.' },
          { k: 'SEALED OFF', t: 'The heart is inside a rigid shell that does NOT feel that fall. LV pressure stays put.' },
          { k: 'LESS GRADIENT', t: 'The driving pressure from pulmonary veins to LV drops: less left-sided filling, a smaller mitral E.' },
          { k: 'INTERDEPENDENCE', t: 'Total volume in the shell is fixed, so as the LV fills less the RV fills more — the septum swings left.' },
          { k: 'EXPIRATION', t: 'Everything reverses: E tall, tricuspid flow small, septum swings right.' },
        ]}>
        The mirror image of this see-saw — on the catheter — is the test for which every other sign is a proxy.
      </Why>
      <MitralInflow mode="restriction" />
      <Contrast title="a restrictive filling pattern in constriction vs in restriction"
        is={{ h: 'Constriction', points: ['E ≫ A, short deceleration time — at rest the two look the same.', 'E varies ≥ 25% with breathing.', 'Tricuspid inflow does the opposite.', 'The muscle relaxes normally.'] }}
        isnt={{ h: 'Restrictive cardiomyopathy', points: ['E ≫ A, short deceleration time.', 'E varies < 10–15%.', 'The heart is not sealed from the chest.', 'The muscle relaxes slowly: low e′.'] }} />

      <div className="cs-h2">🎯 B · The annulus, the hepatic veins, the septum</div>
      <AnnulusDoppler done={ad} onMeasure={r => answer('s2-ead', r)} />
      {ad && <div className={'cs-fb ' + (ad.close ? 'best' : 'ok')}>medial e′ {ad.m}, lateral e′ {ad.l} cm/s. {ad.close ? 'Medial 13, lateral 9: a brisk septum and a lateral wall tethered by the shell — annulus reversus.' : 'Re-check: the true values are medial 13 and lateral 9 cm/s.'}</div>}
      <ScoreOnce id="s2-ead" pts={ad == null ? null : ad.close ? 8 : 3} max={8} />
      <Decision id="s2-rev" question="Medial e′ 13 cm/s, lateral e′ 9 cm/s. Why is the order reversed?"
        options={[
          { id: 'tether', label: 'The lateral annulus is tethered to the scarred pericardium beside it; the septum, inside the heart, moves freely — and makes up for it', verdict: 'best', points: 8,
            why: 'Annulus reversus: normally lateral e′ > medial. In constriction the lateral wall is stuck; longitudinal motion shifts to the septum. A brisk medial e′ (≥ 9 cm/s) also says the muscle itself is healthy — the strongest echo argument against restriction. A side effect: E/e′ falls as filling pressure rises (annulus paradoxus), so E/e′ lies here.' },
          { id: 'mi', label: 'A lateral infarct', verdict: 'wrong', points: 0, why: 'No Q waves, normal lateral wall thickening.' },
          { id: 'err', label: 'Measurement error — repeat it', verdict: 'wrong', points: 0, why: 'It is real, reproducible and diagnostic.' },
        ]} />
      <Decision id="s2-hv" question="On the hepatic vein tab: in which half of the breath is the end-diastolic flow reversal biggest, and what does it mean?"
        options={[
          { id: 'exp', label: 'Expiration — constriction: as the septum swings right in expiration the RV fills less, and blood backs up into the liver', verdict: 'best', points: 8,
            why: 'Expiratory diastolic reversal (Mayo: expiratory reversal ratio ≥ 0.79) is part of the see-saw. In restriction the reversal is INSPIRATORY — a stiff RV cannot take the inspiratory surge.' },
          { id: 'insp', label: 'Inspiration — constriction', verdict: 'wrong', points: 0, why: 'Inspiratory reversal is the restrictive pattern.' },
          { id: 'none', label: 'There is no reversal', verdict: 'wrong', points: 0, why: 'Look at the red bars above the line, end-diastole, expiration.' },
        ]} />
      <Note kind="evid" title="The Mayo echo criteria (Welch 2014)">Three findings: (1) respiration-related ventricular septal shift (the bounce), (2) medial e′ ≥ 9 cm/s, (3) hepatic vein expiratory diastolic reversal ratio ≥ 0.79. Septal shift plus either of the others: sensitivity 87%, specificity 91% for surgically proven constriction. She has all three.</Note>

      <div className="cs-h2">🫀 C · The aortic valve — inside a heart that cannot fill</div>
      <Doppler kind="cw-as" vmax={3.5} title="CW Doppler, right parasternal window — the highest velocity" onMeasure={r => answer('s2-av', r)} />
      {av && <div className={'cs-fb ' + (av.close ? 'best' : 'ok')}>You measured {av.v.toFixed(2)} m/s → mean ≈ {Math.round(av.mean)} mmHg. {av.close ? 'Vmax 3.5 m/s: “moderate” by velocity. Hold that thought.' : 'Find the edge of the envelope: 3.5 m/s.'}</div>}
      <ScoreOnce id="s2-av" pts={av == null ? null : av.close ? 6 : 2} max={6} />
      <div className="cs-card">
        <Table head={['Measure', 'Value', 'Meaning']} rows={[
          ['Vmax / mean gradient', N('3.5 m/s / 30 mmHg'), '“Moderate” by gradient'],
          ['AVA (continuity)', N('0.8 cm² (0.45 cm²/m²)', 'cs-hi'), 'Severe by area'],
          ['Stroke volume index', N('28 mL/m²', 'cs-hi'), 'LOW flow (< 35) — with an EF of 60%'],
          ['Dimensionless index', N('0.23', 'cs-hi'), 'Severe'],
          ['CT aortic valve calcium score', N('2,350 AU', 'cs-hi'), 'Woman: ≥ 1,200 AU makes severe likely'],
          ['Mitral', N('moderate MR, mean gradient 4 mmHg'), 'Calcified curtain; leaflets restricted'],
        ]} />
      </div>
      <Decision id="s2-lflg" question="EF 60%, SVi 28, AVA 0.8 cm², mean gradient 30, calcium score 2,350 AU. Grade the aortic stenosis — and why does the gradient lie?"
        options={[
          { id: 'sev', label: 'Severe, low-flow, low-gradient AS with preserved EF: the constriction underfills the LV, so too little flow crosses the valve to build a severe gradient', verdict: 'best', points: 10,
            why: 'Gradient ∝ flow². A small, underfilled LV pushing 28 mL/m² cannot generate 40 mmHg through even a tight valve. The calcium score confirms it anatomically. Once the shell comes off and the LV fills, the gradient will climb — the valve has to be dealt with.' },
          { id: 'mod', label: 'Moderate AS — the gradient is 30', verdict: 'wrong', points: 0, why: 'A gradient is a measure of flow as much as of the valve. Treat the gradient alone and the valve will declare itself on the night after the pericardiectomy.' },
          { id: 'dse', label: 'Indeterminate — dobutamine stress echo first', verdict: 'ok', points: 3, why: 'Dobutamine is the test for low flow from a WEAK ventricle (low EF). Her LV is strong but caged — it cannot fill more however hard it is driven. Calcium scoring is the right tool here.' },
        ]} />

      <div className="cs-h2">📈 D · The definitive test — simultaneous LV and RV pressures</div>
      <p className="cs-p">Day 3, the cath lab. A pigtail in the LV (radial), a catheter in the RV (femoral vein), both on one screen at 50 mm/s, with a respirometer. She breathes quietly and normally — no Valsalva. Set the calipers on each diastolic plateau, then watch the peaks through two breaths and call it.</p>
      <LVRVPressure done={hc} onMeasure={r => answer('s2-cath', r)} />
      {hc && <div className={'cs-fb ' + (hc.close && hc.right ? 'best' : 'ok')}>LVEDP {hc.lv}, RVEDP {hc.rv} → difference {hc.lv - hc.rv} mmHg. You called it <b>{hc.call}</b>{hc.right ? ' — right' : ` — it is ${hc.truth}`}. {hc.right ? 'In inspiration the RV peak rises while the LV peak falls: the two ventricles are competing for room in a fixed box. Systolic area index > 1.1 — constriction.' : 'Look again: LV peaks fall in the blue bands while RV peaks rise.'}</div>}
      <ScoreOnce id="s2-cath" pts={hc == null ? null : (hc.close ? 6 : 2) + (hc.right ? 8 : 0)} max={14} />
      <Why title="⚖️ Why discordance is the signature of a fixed box"
        chain={[
          { k: 'ONE VOLUME', t: 'Inside a rigid pericardium, LV volume + RV volume is fixed.' },
          { k: 'INSPIRATION', t: 'More venous return to the right; less pulmonary-vein-to-LV gradient on the left.' },
          { k: 'THE SEPTUM', t: 'The septum bows left: the RV gains what the LV loses.' },
          { k: 'DISCORDANT', t: 'RV stroke volume and peak pressure RISE as LV stroke volume and peak pressure FALL.' },
          { k: 'NOT IN MUSCLE', t: 'Stiff muscle in an open pericardium has no such coupling: both peaks fall together with the dip in chest pressure — concordance.' },
        ]} />
      <div className="cs-h2">🔬 For contrast — a man with cardiac amyloid</div>
      <LVRVPressure mode="restriction" done={hr} onMeasure={r => answer('s2-cath-amy', r)} />
      {hr && <div className={'cs-fb ' + (hr.close && hr.right ? 'best' : 'ok')}>LVEDP {hr.lv}, RVEDP {hr.rv}: apart by {hr.lv - hr.rv}. You called it <b>{hr.call}</b>{hr.right ? ' — right: both peaks fall together. Restriction.' : ` — it is ${hr.truth}.`} RV systolic 56 (high), RVEDP ÷ RVSP below ⅓.</div>}
      <ScoreOnce id="s2-cath-amy" pts={hr == null ? null : (hr.close ? 3 : 1) + (hr.right ? 5 : 0)} max={8} />
      <Contrast title="the catheter in constriction vs restriction"
        is={{ h: 'Constriction', points: ['LVEDP − RVEDP ≤ 5 mmHg (equalised plateaus).', 'RV systolic < 50–55; RVEDP ÷ RVSP > ⅓.', 'Inspiration: RV peak ↑, LV peak ↓ — discordant.', 'Systolic area index > 1.1 (the most accurate single criterion).'] }}
        isnt={{ h: 'Restriction', points: ['LVEDP usually > RVEDP by > 5.', 'Pulmonary hypertension common; RVEDP ÷ RVSP < ⅓.', 'Inspiration: both peaks ↓ — concordant.', 'Systolic area index < 1.1.'] }} />
      <Note kind="warn" title="Dip-and-plateau does not choose between them">Both traces dip and plateau — any ventricle that fills early and then hits a wall does. The square-root sign says “something stops filling”; only the respiratory behaviour says what.</Note>

      <ConstrictionBoard id="s2-board" />
      <Decision id="s2-mixed" question="Her LV plateau sits at 24 and RV at 22, discordant, SAI 1.4 — yet her medial e′ is 13 and her LV muscle on CMR shows patchy mid-wall fibrosis. How do you frame it?"
        options={[
          { id: 'mixed', label: 'Predominantly constrictive physiology, with a radiation (and anthracycline) myocardial component — mixed. Pericardiectomy should help, but less completely than in idiopathic constriction', verdict: 'best', points: 8,
            why: 'Radiation rarely spares the muscle beneath the shell. The catheter shows the pericardium is the dominant problem; the fibrosis predicts a slower, less complete recovery and a riskier first night — and it belongs in the consent.' },
          { id: 'pure', label: 'Pure constriction — she will be cured', verdict: 'ok', points: 2, why: 'The haemodynamics say constriction dominates, but promising a cure ignores the muscle.' },
          { id: 'rcm', label: 'Restrictive cardiomyopathy — surgery is futile', verdict: 'wrong', points: 0, why: 'Discordance, equalisation and a brisk e′ argue firmly against pure restriction.' },
        ]} />
      <SearchLinks title="🎬 Watch real LV/RV tracings" links={HEMO_SEARCHES} />
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
        <div className="cs-h2" style={{ marginTop: 0 }}>👥 Grand-round heart team · day 4</div>
        <Table head={['', 'Finding']} rows={[
          ['Symptoms', 'NYHA III–IV, ascites, oedema; diuretic-dependent with a falling eGFR'],
          ['Pericardium (CT)', N('5–7 mm, calcified plates over the RV, diaphragmatic LV and AV groove', 'cs-hi')],
          ['Pericardium (CMR)', 'No pericardial oedema or late enhancement; real-time septal flattening on inspiration'],
          ['Myocardium (CMR)', 'Patchy mid-wall late enhancement; normal EF'],
          ['Aortic valve', 'Severe low-flow, low-gradient AS (calcium 2,350 AU)'],
          ['Mitral', 'Moderate MR; calcified aorto-mitral curtain'],
          ['Coronaries', N('Ostial left main 70–80% (IVUS MLA 4.1 mm²); ostial RCA 50%', 'cs-hi')],
          ['Ascending aorta', N('Circumferential calcium — porcelain', 'cs-hi')],
          ['Lungs', 'Apical fibrosis; FEV₁ 78%, DLCO 48%'],
          ['STS-PROM (as if for AVR)', N('3.2% — “intermediate”')],
          ['Her wish', '“I want to see my son graduate in two years — and to stop being drained like a sink.”'],
        ]} />
      </div>
      <Decision id="s3-inflam" question="Before surgery: is there any chance this constriction is transient and will melt with anti-inflammatory therapy?"
        options={[
          { id: 'no', label: 'Very unlikely: chronic, calcified, and CMR shows no pericardial oedema or enhancement — there is no active inflammation to treat', verdict: 'best', points: 8,
            why: 'Transient constriction (often after recent pericarditis or surgery) shows an inflamed, enhancing pericardium and raised CRP, and can resolve on NSAIDs, colchicine and sometimes steroids. Burnt-out, calcified radiation constriction does not. Weeks of a trial just let her liver and kidneys worsen.' },
          { id: 'trial', label: 'Yes — three months of colchicine and steroids first', verdict: 'wrong', points: 0, why: 'For inflammation that is not there.' },
          { id: 'tap', label: 'Pericardiocentesis to see if she improves', verdict: 'wrong', points: 0, why: 'There is no effusion to drain. A needle into a thick, adherent, calcified pericardium finds the RV.' },
        ]} />
      <Contrast title="transient (inflammatory) constriction vs chronic calcific constriction"
        is={{ h: 'Transient', points: ['Weeks to months after pericarditis or cardiac surgery.', 'High CRP; pericardial oedema and late gadolinium enhancement on CMR.', 'Often resolves with anti-inflammatories.', 'Try medical therapy first.'] }}
        isnt={{ h: 'Chronic calcific (hers)', points: ['Years after the insult.', 'No enhancement; calcium plates.', 'Will not resolve.', 'Pericardiectomy is the only cure.'] }} />

      <Decision id="s3-surgery" question="Does she need a pericardiectomy?"
        options={[
          { id: 'yes', label: 'Yes — symptomatic, diuretic-refractory chronic constriction (NYHA III–IV) is the indication. Plan it with the valve and coronaries in mind', verdict: 'best', points: 10,
            why: 'Pericardiectomy is the only definitive treatment of chronic permanent constriction. Waiting turns congestion into cardiac cirrhosis, muscle wasting and myocardial atrophy, each of which raises operative mortality.' },
          { id: 'med', label: 'No — diuretics and fluid restriction long-term', verdict: 'wrong', points: 0, why: 'Palliation that is already failing.' },
          { id: 'late', label: 'Only when she reaches NYHA IV', verdict: 'ok', points: 2, why: 'Very advanced (class IV) patients have the highest surgical mortality — and she is nearly there.' },
        ]} />
      <Why title="🧱 Why a radiated chest is a hostile operating field"
        chain={[
          { k: 'SKIN & BONE', t: 'Radiated skin and sternum heal badly: wound breakdown and sternal infection.' },
          { k: 'MEDIASTINUM', t: 'Fibrosis glues every structure together: no planes, more bleeding, more injury to RV, coronaries and nerves.' },
          { k: 'AORTA', t: 'A porcelain aorta: no safe place to clamp, cannulate or sew.' },
          { k: 'GRAFTS', t: 'The internal mammary artery lay in the beam — it may be fibrosed and unusable.' },
          { k: 'LUNGS & MUSCLE', t: 'Fibrotic lungs wean slowly; fibrosed myocardium recovers less after the shell is removed.' },
        ]}>
        That is why the STS score (3.2%) flatters her: risk models were not built for radiated chests and miss most of this.
      </Why>
      <Note kind="evid" title="What the numbers say">After pericardiectomy, long-term survival is worst when the cause is radiation: in the Cleveland Clinic series (Bertog 2004), 7-year survival was ~88% for idiopathic, ~66% for post-surgical and ~27% for post-radiation constriction. Radiation patients die of the muscle, the valves, the coronaries and the lungs — and of the cancers the beam left behind. Patients undergoing cardiac surgery after chest radiation also have higher late mortality than matched controls.</Note>

      <div className="cs-h2">💬 The conversation</div>
      <p className="cs-p">Helen asks: “Everyone said the radiotherapy saved my life. Are you telling me it’s killing me now?”</p>
      <Decision id="s3-talk" question="How do you answer?"
        options={[
          { id: 'both', label: '“It did save your life — and 25 years later it has left scarring around your heart and in your valves. Both are true. The scarring is why you feel this way, and much of it can be treated. Can I explain what we’d suggest and what it would mean for you?”', verdict: 'best', points: 8,
            why: 'Honour the past decision, name the cause plainly, move to what can be done, and ask permission before the detail. She needs neither blame nor false comfort.' },
          { id: 'blame', label: '“Mantle radiotherapy was a very high dose by today’s standards; we’d never do that now.”', verdict: 'wrong', points: 0, why: 'True, and useless to her: it invites regret about a decision that cured her cancer.' },
          { id: 'reass', label: '“Don’t worry, it’s just some fluid we can drain.”', verdict: 'wrong', points: 0, why: 'False reassurance before a high-risk operation is not consent.' },
        ]} />
      <Decision id="s3-risk" question="What must she hear before agreeing to the plan?"
        options={[
          { id: 'full', label: 'That the operation is the only cure; that radiation patients have higher operative risk (death several percent or more, bleeding, a difficult night with low output, phrenic nerve injury, prolonged ventilation) and less complete recovery because the muscle is scarred too; that the valve and coronary work carries its own risks (stroke, pacemaker); and what happens without surgery', verdict: 'best', points: 8,
            why: 'Specific, honest and set against the alternative. Her goal — two good years and more — is achievable, but it is not guaranteed.' },
          { id: 'cure', label: 'That surgery will cure her heart failure', verdict: 'wrong', points: 0, why: 'Not with a fibrosed myocardium underneath.' },
          { id: 'numbers', label: 'The STS score: about 3% risk of death', verdict: 'ok', points: 2, why: 'A real number, but the wrong one for a radiated chest.' },
        ]} />
      <Video {...MEDIA.overview} />
    </>
  );
}

/* ============================================================
   4 · PLANNING — WHAT TO FIX, AND IN WHAT ORDER
   ============================================================ */

function Planning() {
  const { answers, answer } = useCase();
  const plan = answers['s4-plan'];
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🩻 Planning CT · ECG-gated, chest to groins</div>
        <Table head={['Measure', 'Value', 'Meaning']} rows={[
          ['Ascending aorta', N('34 mm, circumferential calcium from sinotubular junction to arch', 'cs-hi'), 'Porcelain: no clamp, no aortotomy'],
          ['Aortic annulus', N('area 412 mm², perimeter 73 mm'), 'A small-to-medium TAVI size'],
          ['Left main height / RCA height', N('11 mm / 13 mm'), 'Acceptable; calcified curtain noted'],
          ['Ostial left main', N('calcified, 70–80%'), 'Treat before TAVI'],
          ['LIMA', N('1.4 mm, irregular, in the old field', 'cs-hi'), 'Poor conduit'],
          ['Sternum to RV distance', N('3 mm, adherent', 'cs-hi'), 'Careful sternotomy'],
          ['Pericardial calcium', N('RV free wall, diaphragmatic LV, AV groove / LAD', 'cs-hi'), 'Where the plates are'],
          ['Iliofemoral arteries', N('7.2 mm right, little calcium'), 'Transfemoral route fine'],
        ]} />
      </div>
      <HeartTeamPlanner done={plan} onResult={r => answer('s4-plan', r)} />
      {plan && <div className={'cs-fb ' + (plan.score >= 14 ? 'best' : plan.score >= 9 ? 'ok' : 'wrong')}>
        Plan score {plan.score}/15 · {plan.highs} high-risk hazard{plan.highs === 1 ? '' : 's'} left. {plan.score >= 14
          ? 'The heart team’s plan: IVUS-guided left main PCI and transfemoral TAVI first — no aorta touched, no sternotomy. One month of dual antiplatelets, then aspirin alone; radical pericardiectomy at ~6 weeks, off-pump with bypass on standby. The mitral valve is re-assessed once she is unconstricted.'
          : 'Look at what is still red. The aim is to fix everything that can be fixed without touching the porcelain aorta — and to take the fixed obstruction and the tight ostium out of the way before the big operation.'}
      </div>}
      <ScoreOnce id="s4-plan" pts={plan == null ? null : plan.score} max={15} />
      <Decision id="s4-age" question="She is 53. The guideline says TAVI is generally for older patients and surgical AVR for younger ones. Why TAVI here?"
        options={[
          { id: 'hostile', label: 'Porcelain aorta and a radiated chest are exactly the anatomical and clinical factors that move the heart team towards TAVI whatever the age — accepting that at 53 she will probably need a second valve inside this one later', verdict: 'best', points: 10,
            why: 'Age thresholds are a default for a typical chest. Porcelain aorta, previous chest radiation and frailty are listed among the factors favouring transcatheter treatment. The cost is durability: choose the valve and size with a future valve-in-valve in mind.' },
          { id: 'age', label: 'It isn’t — at 53 she should have surgical AVR', verdict: 'wrong', points: 0, why: 'Then someone has to clamp an eggshell. See the war stories.' },
          { id: 'cheap', label: 'Because TAVI is always lower risk', verdict: 'wrong', points: 0, why: 'Not always — but here the surgical alternative is uniquely dangerous.' },
        ]} />
      <Decision id="s4-dapt" question="A drug-eluting stent in her left main, then a major operation in six weeks. Antiplatelets?"
        options={[
          { id: 'hbr', label: 'Treat her as high bleeding risk: aspirin plus clopidogrel for 1 month, then aspirin alone — continued through the pericardiectomy', verdict: 'best', points: 8,
            why: 'Modern drug-eluting stents are safe with one month of dual therapy in high-bleeding-risk patients. Operating on aspirin alone is routine; stopping all antiplatelets six weeks after a left main stent risks stent thrombosis — the whole left ventricle.' },
          { id: 'twelve', label: 'Dual antiplatelets for 12 months, delay the pericardiectomy until then', verdict: 'wrong', points: 0, why: 'A year of untreated constriction: cardiac cirrhosis and myocardial atrophy.' },
          { id: 'stop', label: 'Stop everything 7 days before surgery', verdict: 'wrong', points: 0, why: 'Aspirin should stay on through cardiac surgery here.' },
        ]} />
      <Why title="🏺 Why the porcelain aorta decides the whole plan"
        chain={[
          { k: 'EGGSHELL', t: 'A circumferential rim of calcium — rigid, brittle, and in contact with the blood.' },
          { k: 'THE CLAMP', t: 'Conventional valve surgery and vein grafts need the aorta clamped, cut and sewn.' },
          { k: 'FRACTURE', t: 'Clamping cracks the calcium: debris into the brain (stroke), or a tear and dissection.' },
          { k: 'WORKAROUNDS', t: 'Deep hypothermic arrest and aortic replacement — each a major risk in a radiated chest.' },
          { k: 'THE ANSWER', t: 'Choose treatments that never touch it: PCI instead of vein grafts, TAVI instead of AVR, an operation on the pericardium that needs no clamp.' },
        ]} />
      <Contrast title="porcelain aorta vs ordinary aortic calcification"
        is={{ h: 'Porcelain', points: ['Circumferential (or near-circumferential) calcium of the ascending aorta.', 'No safe clamp or cannulation site.', 'Changes the operation — or rules it out.'] }}
        isnt={{ h: 'Patchy atheroma', points: ['Scattered plaques with soft segments between.', 'Epiaortic ultrasound finds a clean spot to clamp.', 'Surgery goes ahead with care.'] }} />
      <Contrast title="radiation coronary disease vs ordinary atherosclerosis"
        is={{ h: 'Radiation', points: ['Ostial and proximal (left main, RCA ostium) — where the beam crossed.', 'Fibrous, calcified, long, often in younger patients.', 'Arteries and grafts in the field are damaged too.'] }}
        isnt={{ h: 'Ordinary', points: ['Bifurcations and proximal-to-mid segments.', 'Risk-factor driven, older patients.', 'The LIMA is the best graft there is.'] }} />
      <MultiSelect id="s4-tavi" question="Planning her TAVI and left main PCI — what is specific to a radiated heart?"
        items={[
          { id: 'cond', label: 'Her long PR and fascicular block: a high pacemaker risk — aim for a high implant and plan monitoring', correct: true, why: 'Radiation-fibrosed conduction has little reserve.' },
          { id: 'curt', label: 'The calcified aorto-mitral curtain: watch for anterior mitral leaflet interaction with the frame', correct: true, why: 'Avoid a deep implant.' },
          { id: 'ivus', label: 'IVUS for the ostial left main: plaque, calcium, stent expansion and ostial coverage', correct: true, why: 'Ostial lesions are where angiography is least reliable.' },
          { id: 'order', label: 'PCI before TAVI, so the ostium is still accessible', correct: true, why: 'Re-engaging an ostium through a TAVI frame is harder.' },
          { id: 'small', label: 'Choose the valve with a future valve-in-valve in mind (she is 53)', correct: true, why: 'Lifetime management.' },
          { id: 'ga', label: 'General anaesthesia is mandatory because of the constriction', correct: false, why: 'Light sedation avoids the vasodilatation and positive-pressure ventilation that drop her filling — an argument for sedation, not against it.' },
        ]} />
      <SearchLinks title="🎬 Porcelain aorta and ostial left main cases" links={[...PORCELAIN_SEARCHES, ...LM_SEARCHES]} />
    </>
  );
}

/* ============================================================
   placeholder stages (written next)
   ============================================================ */

function Todo() { return <p className="cs-p">Coming next.</p>; }

/* ============================================================
   THE CASE
   ============================================================ */

export const VALVE_03 = {
  title: 'Radiation heart disease · Constriction, a hidden aortic stenosis, a porcelain aorta',
  short: 'Structural Heart · Case 03',
  patient: {
    name: 'Mrs Helen Marchetti',
    meta: '53 F · MRN 4419-2031 · 68 kg',
    flags: [
      { text: 'Preload-dependent — no diuretic escalation', tone: 'red' },
      { text: 'Porcelain aorta', tone: 'red' },
      { text: 'Mantle RT 36 Gy, 1999', tone: 'amber' },
      { text: 'eGFR 32', tone: 'amber' },
      { text: 'PR 220 ms · LAFB', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 60, limit: 120, basis: 'volume/eGFR ≤ 3.7' },
  clock0: min(9, 10),
  vitals0: { hr: 104, sys: 98, dia: 76, spo2: 94, rr: 22, st: 0, rhythm: 'sinus' },
  brand: { icon: '☢️', line: 'Structural Heart · Case 03' },
  hero: {
    badges: [
      { text: 'Grand rounds · Valvular & pericardial', tone: 'cyan' },
      { text: 'Hostile chest · high-stakes', tone: 'red' },
      { text: 'ESC pericardial / VHD 2025-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'Everything', style: 'outline' },
      { text: 'the beam touched', style: 'grad' },
      { text: 'twenty-five years later', style: 'cyan' },
    ],
    hook: (
      <>
        A teacher cured of Hodgkin lymphoma at 27 is drowning at 53 — <b>“HFpEF”</b>, said one doctor; <b>“cirrhosis”</b>, said another.
        Her neck veins <span className="y">rise when she breathes in</span>. Her heart is caged in calcium, her aortic valve is tighter than its gradient admits, and her aorta is <span className="r">an eggshell no surgeon can clamp</span>.
        Measure the see-saw, plan around the porcelain, peel the shell — and keep her alive on the night the <span className="r">right ventricle gives way</span>.
      </>
    ),
    image: null,
    sims: 's2',
    crisis: 's9',
    cards: [
      { k: '🧑‍🏫 The patient', t: 'Mrs Helen Marchetti, 53 — breathless, swollen, ascitic; mantle radiotherapy 25 years ago.' },
      { k: '🩺 Your role', t: 'From the ED to the cath lab, the heart team, theatre and the first night in intensive care.' },
      { k: '🎛️ In your hands', t: 'JVP & Kussmaul, the knock, mitral E variation, e′ and hepatic veins, simultaneous LV/RV pressures, a sternotomy-risk planner, a pericardiectomy, an RV rescue.' },
      { k: '🧠 How it teaches', t: 'One box, one volume: every sign is the see-saw between two ventricles in a shell that will not stretch.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'Clinical presentation & triage', Component: Presentation,
      pill: '🫗 Neck veins that rise when she breathes in',
      lede: 'Watch the JVP, time the knock, read the ECG and the ascitic fluid — and stop the diuretic spiral.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 104, sys: 98, dia: 76, spo2: 94, rr: 22, st: 0, rhythm: 'sinus' }); atLeastClock(min(9, 10)); } },
    { id: 's2', icon: '📏', nav: 'Echo & the Catheter', title: 'Measuring it — echo and simultaneous pressures', Component: Measure,
      pill: '⚖️ Measure the see-saw yourself',
      lede: 'Mitral E variation, annular e′, hepatic veins, a hidden aortic stenosis — then LV and RV pressures on one screen, beside an amyloid heart.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 98, sys: 100, dia: 76 }); atLeastClock(min(24 + 10, 30)); } },
    { id: 's3', icon: '👥', nav: 'Heart Team', title: 'Grand-round heart team', Component: HeartTeam,
      pill: '🧱 The hostile chest',
      lede: 'Transient or permanent, operate or not, what radiation does to an operation — and the conversation.',
      enter: ({ atLeastClock }) => atLeastClock(min(72 + 13, 0)) },
    { id: 's4', icon: '🧮', nav: 'Sternotomy-Risk Planner', title: 'Planning: what to fix, and in what order', Component: Planning,
      pill: '🏺 Plan around the porcelain',
      lede: 'The planning CT, a sternotomy-risk planner, TAVI at 53, antiplatelets before a major operation.',
      enter: ({ atLeastClock }) => atLeastClock(min(96 + 9, 0)) },
    { id: 's5', icon: '🩸', nav: 'Set-up', title: 'Part one done — set-up for the pericardiectomy', Component: Todo },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy & decision points', Component: Todo },
    { id: 's7', icon: '🛠️', nav: 'Pericardiectomy', title: 'The radical pericardiectomy', Component: Todo },
    { id: 's8', icon: '🛏️', nav: 'Intensive Care', title: 'The first evening in intensive care', Component: Todo },
    { id: 's9', icon: '🚨', nav: 'Night Crisis', title: '02:40 — low output with a dilated RV', Component: Todo },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Todo },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: Todo },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Survivorship, debrief & assessment', Component: Todo },
  ],
};

export default function Valve03({ onClose }) {
  return <CaseShell def={VALVE_03} onClose={onClose} />;
}
