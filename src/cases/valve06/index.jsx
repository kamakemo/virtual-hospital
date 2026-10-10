import React from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Video, Quiz, Steps, Step,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS, TRANSSEPTAL_SEARCHES } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import { TransseptalPuncture } from '../kit/Valve.jsx';
import { Echo as EchoView } from '../kit/Physiology.jsx';
import { MSAuscultation, FillingGradient, PHTDoppler, Planimetry, WilkinsBuilder, InoueBalloon, Pericardiocentesis, inoueReference } from './sims.jsx';
import { V, PMC_SEARCHES } from './media.js';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 06
   Rheumatic mitral stenosis with atrial fibrillation, unmasked by
   pregnancy. A 27-year-old from an endemic region, 24 weeks
   pregnant, in pulmonary oedema with fast AF. Why heart rate is
   everything in MS; beta-blockade; "valvular AF" — heparin and
   warfarin, never a DOAC (INVICTUS); echo by the learner (PHT,
   planimetry, Wilkins); percutaneous mitral commissurotomy with
   an Inoue balloon in the second trimester — and, that afternoon,
   tamponade. Then labour, the postpartum autotransfusion, and
   rheumatic fever secondary prophylaxis.

   The mirror of Case 02: in acute MR the heart rate props up the
   output and a beta-blocker can kill; in MS the heart rate IS
   the disease and the beta-blocker is the treatment.

   Clinical content follows the 2025 ESC/EACTS valvular heart
   disease guideline, the 2018 ESC guideline on cardiovascular
   disease in pregnancy, the 2024 ESC AF guideline, INVICTUS
   (NEJM 2022), ASE/EACVI recommendations for valve stenosis and
   AHA/WHF guidance on rheumatic fever prophylaxis, simplified for
   teaching.
   ============================================================ */

const min = (h, m) => h * 60 + m;
const HEIGHT = 162;

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
   1 · PRESENTATION — PULMONARY OEDEMA AT 24 WEEKS
   ============================================================ */

function Presentation() {
  const { answers, answer, setVitals } = useCase();
  const id = answers['s1-id'];
  const fg = answers['s1-hr'];
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🏠 3 weeks</span>Mrs Hodan Warsame, 27, moved from Somalia four years ago. Second pregnancy, now 24 weeks. Increasing breathlessness climbing stairs, then lying flat. Her midwife wrote “normal breathlessness of pregnancy”.</p>
        <p className="cs-p"><span className="cs-time">📜 history</span>“Joint pains and a fever” at 11, treated at home; a cough with flecks of blood last month. Her first pregnancy, at 22, was easy. No medicines except iron and folic acid. 68 kg, 162 cm.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🚑 01:40</span>Woken by her heart “racing like a drum” and unable to breathe. The paramedics find her bolt upright at the window: SpO₂ 86%, heart rate 150 and irregular. They keep her sitting up, tilted to the left, start CPAP and bring her in — no fluid bolus.</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>📊 Observations · 02:10</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('148 /min, irregularly irregular', 'cs-hi')], ['Blood pressure', N('112/70 mmHg')], ['SpO₂', N('88% on CPAP, FiO₂ 0.4', 'cs-hi')],
            ['Resp. rate', N('30 /min', 'cs-hi')], ['Temperature', N('37.1 °C')], ['Fetal heart', N('152 /min')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🩺 Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Pink frothy sputum; crackles to the mid-zones. JVP up 5 cm.</li>
            <li className="cs-li">Flushed, slightly purple cheeks. A tapping, undisplaced apex beat.</li>
            <li className="cs-li">A loud first heart sound. Something just after S2. A low rumble at the apex — only with the bell, only in the left lateral position.</li>
            <li className="cs-li">Uterus at the umbilicus. Mild ankle oedema.</li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">🔊 Listen — her valve, then its look-alikes</div>
      <p className="cs-p">Turn her onto her left side and listen at the apex with the bell. Then switch her into sinus rhythm and listen for what AF has taken away.</p>
      <MSAuscultation done={id} onIdentify={r => answer('s1-id', r)} />
      <ScoreOnce id="s1-id" pts={id == null ? null : id.correct === 3 ? 10 : id.correct === 2 ? 5 : 0} max={10} />
      <Why title="🔬 Why S1 is LOUD and the snap comes EARLY"
        chain={[
          { k: 'HIGH LA', t: 'The stenosis keeps the LA pressure high right up to the end of diastole.' },
          { k: 'WIDE OPEN AT S1', t: 'So the leaflets are still held wide open when the LV starts to contract — they slam shut from far away: a LOUD S1.' },
          { k: 'EARLY SNAP', t: 'After S2 the LV pressure falls; the higher the LA pressure, the sooner it crosses below it and the domed leaflets snap open.' },
          { k: 'THE RULE', t: 'Tighter valve → higher LA → shorter S2–OS interval and a longer rumble. A late snap and a short rumble mean a milder valve.' },
        ]}>
        When the leaflets finally calcify and stop moving, the loud S1 and the snap disappear — a soft S1 in MS is a stiff, calcified valve, not a mild one.
      </Why>
      <Contrast title="🎧 three sounds just after S2"
        is={{ h: 'Opening snap (hers)', points: ['40–110 ms after A2, high-pitched, sharp.', 'Best between the apex and the left sternal edge.', 'Followed by a low rumble — the stenosis.'] }}
        isnt={{ h: 'Split S2 · S3', points: ['Split S2: ~30–50 ms, the same pitch as S2, at the BASE, widens on inspiration.', 'S3: 120–180 ms, LOW-pitched thud of rapid filling — impossible through a tight mitral valve.', 'Neither is followed by a rumble.'] }} />

      <ECG12 rate={148} rhythm="af"
        caption="Atrial fibrillation with a fast ventricular response, ~150/min. Coarse fibrillatory waves in V1 (a big, stretched left atrium). Right-axis tendency. No ST elevation." />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🩻 Chest X-ray (shielded) and bloods</div>
        <Table head={['', 'Result']} rows={[
          ['Chest X-ray', 'Alveolar oedema, Kerley B lines, upper-lobe diversion; a straight left heart border, a “double density” behind the right heart, a splayed carina — a big LA. Heart not enlarged.'],
          ['hs-Troponin T', N('11 ng/L — normal')], ['NT-proBNP', N('2,900 ng/L', 'cs-hi')],
          ['Haemoglobin', N('104 g/L — dilutional anaemia of pregnancy', 'cs-lo')], ['TSH', N('normal')], ['Potassium · creatinine', N('3.9 mmol/L · 48 µmol/L')],
          ['D-dimer', N('raised — uninterpretable in pregnancy')],
        ]} />
      </div>

      <Decision id="s1-dx" question="🧩 What is happening?"
        options={[
          { id: 'ms', label: 'Rheumatic mitral stenosis, silent until the volume and heart rate of pregnancy — now pulmonary oedema with new fast AF', verdict: 'best', points: 10,
            why: 'Childhood fever and arthritis in an endemic region, haemoptysis, a loud S1, an opening snap and a rumble, a big LA on the film with a normal-sized heart, and decompensation at 24 weeks — when the blood volume nears its peak.' },
          { id: 'ppcm', label: 'Peripartum cardiomyopathy', verdict: 'wrong', points: 2, why: 'Usually the last month of pregnancy or the months after delivery, with a dilated, poorly contracting LV and an S3 — not a snap and a rumble.' },
          { id: 'pe', label: 'Pulmonary embolism', verdict: 'wrong', points: 0, why: 'Pregnancy raises the risk, but frothy sputum, crackles and an opening snap point elsewhere. The D-dimer is meaningless here.' },
          { id: 'asthma', label: 'Asthma with a chest infection', verdict: 'wrong', points: 0, why: '“Cardiac asthma” wheeze is oedema. A salbutamol nebuliser would push her heart rate higher — the worst thing for this valve (war story).' },
        ]} />

      <Why title="🤰 Why pregnancy unmasks a tight mitral valve"
        chain={[
          { k: 'VOLUME', t: 'Plasma volume rises ~40–50% by 24–32 weeks; cardiac output rises 30–50%.' },
          { k: 'HEART RATE', t: 'The resting heart rate climbs 10–20 beats — and every beat shortens diastole.' },
          { k: 'FIXED HOLE', t: 'More flow through the same 0.9 cm² in less time: the gradient rises with the SQUARE of the flow rate.' },
          { k: 'LA → LUNGS', t: 'LA pressure goes up with the gradient; the lower oncotic pressure of pregnancy floods the alveoli sooner.' },
          { k: 'AF', t: 'The stretched LA fibrillates: the atrial kick is lost and the rate jumps — and she falls off the cliff.' },
        ]} />

      <div className="cs-h2">⏱️ Why heart rate is everything</div>
      <p className="cs-p">The blood can only cross a stenotic mitral valve in diastole. Change her heart rate, her pregnancy and her rhythm and watch the left atrial pressure. Then find her ceiling.</p>
      <FillingGradient done={fg} onFind={r => answer('s1-hr', r)} />
      <ScoreOnce id="s1-hr" pts={fg == null ? null : fg.close ? 10 : 4} max={10} />
      <Contrast title="💓 the heart rate in mitral stenosis vs acute mitral regurgitation"
        is={{ h: 'Mitral stenosis — SLOW it (hers)', points: ['The obstacle is in diastole; diastole shrinks as the rate rises.', 'A beta-blocker lengthens diastole, lowers the gradient and dries the lungs.', 'The rate is the disease.'] }}
        isnt={{ h: 'Acute MR (Case 02) — leave it', points: ['A tiny forward stroke volume; the rate is holding up the output.', 'IV beta-blocker boluses can tip the patient into shock.', 'The rate is the compensation.'] }} />

      <MultiSelect id="s1-tx" question="🚨 The first hour. What do you do?"
        items={[
          { id: 'up', label: 'Sit her up, left lateral tilt, CPAP; target SpO₂ ≥ 95%', correct: true, why: 'Upright to pool blood in the legs; tilt off the vena cava; a pregnant woman and her fetus need a higher saturation target.' },
          { id: 'bb', label: 'IV metoprolol 2.5–5 mg slowly, repeated every 5 min (max 15 mg), then oral', correct: true, why: 'The treatment of the mechanism: slow the rate, lengthen diastole, drop the gradient. Metoprolol is a preferred beta-blocker in pregnancy.' },
          { id: 'furo', label: 'IV furosemide 20–40 mg', correct: true, why: 'Relieves the oedema. In pregnancy use the lowest effective dose — over-diuresis reduces placental blood flow.' },
          { id: 'hep', label: 'Therapeutic heparin now (LMWH, or UFH if a procedure may follow)', correct: true, why: 'AF with mitral stenosis has the highest embolic risk of all AF — and pregnancy is prothrombotic.' },
          { id: 'obs', label: 'Obstetric and obstetric-anaesthetic teams, fetal heart monitoring', correct: true, why: 'Two patients; the plan includes delivery from day one.' },
          { id: 'fluid', label: 'A 500 mL fluid bolus because she is pregnant and tachycardic', correct: false, why: 'Volume through a fixed orifice goes straight to the lungs.' },
          { id: 'salb', label: 'Salbutamol nebuliser for the wheeze', correct: false, why: 'A beta-agonist: more tachycardia, shorter diastole, more oedema.' },
          { id: 'amio', label: 'IV amiodarone loading as first-line rate control', correct: false, why: 'Avoided in pregnancy when alternatives work (fetal thyroid toxicity); reserve it for haemodynamic emergencies.' },
        ]} />

      <Decision id="s1-rate" question="⚡ 02:40 — still 140, pressure 108/66, SpO₂ 90%. Which rate strategy?"
        onAnswer={o => o.id === 'bb' && setVitals({ hr: 96, sys: 116, dia: 68, spo2: 95, rr: 22 })}
        options={[
          { id: 'bb', label: 'Continue IV metoprolol to a resting rate around 80, then oral metoprolol; digoxin as an add-on if needed', verdict: 'best', points: 10,
            why: 'Beta-blockers are the first choice in MS (class I in pregnancy). Digoxin slows AV conduction without negative inotropy and can be added. If she became haemodynamically unstable, synchronised cardioversion is safe in all trimesters.' },
          { id: 'dccv', label: 'Immediate synchronised cardioversion', verdict: 'ok', points: 4, why: 'Safe in pregnancy and right for instability — but she is not shocked, has not been anticoagulated and has a huge LA: it will probably recur, and a clot may already sit in the appendage.' },
          { id: 'dilt', label: 'IV diltiazem', verdict: 'ok', points: 3, why: 'Works for the rate, but less data in pregnancy and it drops the blood pressure; a beta-blocker is preferred.' },
          { id: 'none', label: 'Leave the rate — it is compensating', verdict: 'wrong', points: 0, why: 'That is acute MR. In MS the rate is the problem.' },
        ]} />
      {answers['s1-rate'] === 'bb' && <Note kind="pearl" title="🕒 04:30">Metoprolol 12.5 mg IV in total, then 25 mg orally; furosemide 40 mg. Rate 96, SpO₂ 95% on 4 L. The crackles recede to the bases. Enoxaparin 70 mg (1 mg/kg) subcutaneously. Fetal heart 148, reactive.</Note>}

      <div className="cs-media-row">
        <Video {...V.msMurmur} />
        <Video {...V.arf} />
      </div>
    </>
  );
}

/* ============================================================
   2 · ECHO — MEASURE THE VALVE YOURSELF
   ============================================================ */

function EchoStage() {
  const { answers, answer } = useCase();
  const p = answers['s2-pht'];
  const pl = answers['s2-plan'];
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Transthoracic echo · 09:30, rate 96 (AF)</div>
        <Table head={['', 'Finding']} rows={[
          ['Mitral valve', 'Thickened tips, “hockey-stick” anterior leaflet, both commissures fused, no commissural calcium, chordae thickened in their upper third'],
          ['Mean transmitral gradient', N('16 mmHg at a rate of 96', 'cs-hi')],
          ['Left atrium', N('Volume 82 mL/m² — severely dilated', 'cs-hi')], ['LV', 'Small, EF 64%'],
          ['Mitral regurgitation', 'Trace'], ['PA systolic pressure', N('62 mmHg', 'cs-hi')],
          ['Aortic and tricuspid valves', 'Mild rheumatic aortic thickening, no stenosis; mild TR'],
        ]} />
      </div>

      <div className="cs-h2">📏 Pressure half-time — by hand</div>
      <p className="cs-p">The tighter the valve, the longer the LA–LV gradient persists, and the slower the inflow velocity decays. Lay your line along the slope.</p>
      <PHTDoppler done={p} onMeasure={r => answer('s2-pht', r)} />
      {p && <div className={'cs-fb ' + (p.close ? 'best' : 'ok')}>PHT {Math.round(p.pht)} ms → MVA {p.mva.toFixed(2)} cm². {p.close ? 'Severe mitral stenosis.' : 'Off the slope — a steep early segment gives a falsely short PHT and a falsely LARGE valve area.'}</div>}
      <ScoreOnce id="s2-pht" pts={p == null ? null : p.close ? 12 : 4} max={12} />

      <div className="cs-h2">✏️ Planimetry — the reference measurement</div>
      <p className="cs-p">The only method that does not depend on flow, rate or chamber compliance: you look at the hole and measure it.</p>
      <Planimetry done={pl} onMeasure={r => answer('s2-plan', r)} />
      {pl && <div className={'cs-fb ' + (pl.close ? 'best' : 'ok')}>Traced {pl.area.toFixed(2)} cm²{pl.close ? ' at the leaflet tips with the right gain: 0.9 cm², concordant with the PHT. Severe.' : pl.level < 0.88 ? ' — but above the tips: the funnel is wider there, so you OVERestimate the valve.' : pl.gain !== 'normal' ? (pl.gain === 'high' ? ' — high gain blooms the leaflets and UNDERestimates the orifice.' : ' — low gain drops out the rim and OVERestimates it.') : ' — at the right level, but trace the inner edge more closely.'}</div>}
      <ScoreOnce id="s2-plan" pts={pl == null ? null : pl.close ? 12 : pl.fit ? 4 : 2} max={12} />

      <Why title="🔬 Why the gradient lies in pregnancy — and the valve area does not"
        chain={[
          { k: 'GRADIENT', t: 'The pressure drop depends on the flow rate squared — and on how long diastole lasts.' },
          { k: 'PREGNANCY', t: 'More cardiac output and a faster rate: the same valve shows a far higher gradient.' },
          { k: 'AFTER BETA-BLOCKADE', t: 'The same valve at a rate of 70 shows a lower gradient — the valve has not changed.' },
          { k: 'GRADE BY AREA', t: 'So severity is the valve AREA (planimetry first); the gradient is reported with the heart rate beside it.' },
        ]} />
      <Contrast title="📐 planimetry vs pressure half-time"
        is={{ h: 'Planimetry', points: ['Direct; independent of flow, rate and LA compliance.', 'Needs the right plane (tips), the right gain, a good window — 3D helps.', 'The reference method when images are good.'] }}
        isnt={{ h: 'Pressure half-time (220 / PHT)', points: ['Quick and flow-independent — but NOT compliance-independent.', 'Unreliable for ~72 h after a balloon commissurotomy, with significant aortic regurgitation or a stiff LV.', 'In AF, average several beats and avoid short cycles.'] }} />

      <Decision id="s2-sev" question="📊 MVA 0.9 cm² by planimetry and PHT; mean gradient 16 mmHg at 96/min. How do you grade it?"
        options={[
          { id: 'sev', label: 'Severe, clinically significant MS (MVA ≤ 1.0 cm²) — the gradient is inflated by rate and pregnancy but the area is the verdict', verdict: 'best', points: 10,
            why: 'Clinically significant MS is MVA ≤ 1.5 cm²; ≤ 1.0 cm² is severe, and in pregnancy it is the highest-risk group (modified WHO class IV).' },
          { id: 'grad', label: 'Very severe — the gradient is over 15 mmHg', verdict: 'ok', points: 4, why: 'The conclusion is right, the reasoning is not: the gradient will fall to ~11 at a rate of 70 with the same valve.' },
          { id: 'mod', label: 'Moderate — she was fine in her first pregnancy', verdict: 'wrong', points: 0, why: 'Rheumatic MS progresses; four years later her valve is half the size.' },
        ]} />
      <MultiSelect id="s2-ms" question="🔍 Which findings make this a RHEUMATIC mitral valve?"
        items={[
          { id: 'comm', label: 'Commissural fusion', correct: true, why: 'The hallmark: the leaflets are welded together at their edges.' },
          { id: 'hockey', label: 'Diastolic doming — the “hockey-stick” anterior leaflet', correct: true, why: 'The body is mobile, the tip is tethered.' },
          { id: 'sub', label: 'Thickened, fused chordae', correct: true, why: 'Rheumatic inflammation scars the subvalvular apparatus too.' },
          { id: 'aortic', label: 'Thickening of the aortic valve too', correct: true, why: 'Rheumatic disease is often multivalvular.' },
          { id: 'mac', label: 'Heavy annular calcification with leaflet tips spared', correct: false, why: 'That is degenerative (calcific) MS of the elderly — no commissural fusion, and a balloon cannot help it.' },
        ]} />
      <Contrast title="🦠 rheumatic vs degenerative (calcific) mitral stenosis"
        is={{ h: 'Rheumatic (hers)', points: ['Young, endemic regions, women more than men.', 'Commissural fusion, doming, thick chordae.', 'A balloon can split the fused commissures.'] }}
        isnt={{ h: 'Degenerative calcific', points: ['Elderly, renal failure, radiation.', 'Annular calcium creeping into the leaflet base; commissures open.', 'Nothing to split — no role for a balloon.'] }} />
      <Note kind="evid" title="🧪 TOE before any balloon">With AF and an LA of 82 mL/m², the left atrial appendage must be imaged by TOE before commissurotomy. A thrombus there is a contraindication: the wires and balloon in the LA can dislodge it.</Note>
      <Video {...V.pht} />
    </>
  );
}

/* ============================================================
   3 · HEART TEAM — HER, HER BABY, HER VALVE
   ============================================================ */

function HeartTeam() {
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>👥 Pregnancy heart team · day 2</div>
        <Table head={['', 'Finding']} rows={[
          ['Status', 'On metoprolol 50 mg twice daily, furosemide 20 mg, enoxaparin 70 mg twice daily. Rate 82 at rest — 125 walking to the bathroom, breathless again (NYHA III).'],
          ['Valve', 'MVA 0.9 cm², PASP 55 mmHg at rest'],
          ['TOE', 'No thrombus in the LA or appendage; spontaneous echo contrast (“smoke”); trace MR; commissures fused, no commissural calcium'],
          ['Pregnancy', '25 weeks, a normally growing fetus'],
          ['Her words', '“I want this baby. And I want to see my son grow up.”'],
        ]} />
      </div>
      <Decision id="s3-what" question="🧭 Severe MS, NYHA III on full medical therapy, 25 weeks. What do you advise?"
        options={[
          { id: 'pmc', label: 'Percutaneous mitral commissurotomy now, in the second trimester, in an experienced centre', verdict: 'best', points: 10,
            why: 'In pregnant women with severe MS who remain symptomatic or have PASP > 50 mmHg despite medical therapy, PMC should be considered — preferably after 20 weeks. Her anatomy suits it. The labour and the postpartum fluid shift still lie ahead of her valve.' },
          { id: 'wait', label: 'Continue medical therapy to term, then deal with the valve', verdict: 'ok', points: 3,
            why: 'Reasonable if she were well controlled. She is not: symptoms on minimal effort at 25 weeks, with the volume load still rising and the delivery to come.' },
          { id: 'mvr', label: 'Surgical mitral valve replacement now', verdict: 'wrong', points: 0,
            why: 'Cardiopulmonary bypass in pregnancy carries a fetal loss rate of roughly 20–30%, and a mechanical valve commits her to warfarin in every future pregnancy.' },
          { id: 'top', label: 'Recommend ending the pregnancy', verdict: 'wrong', points: 0,
            why: 'Severe MS is mWHO class IV, and termination must be discussed honestly if she asks — but a safer, effective option exists and her wishes are clear.' },
        ]} />
      <Why title="🔬 Why a balloon can work on HER valve"
        chain={[
          { k: 'THE LESION', t: 'Rheumatic MS is mostly a WELD: the two leaflets fused along their commissures.' },
          { k: 'THE BALLOON', t: 'Inflated in the orifice, it pushes the leaflets apart and tears the weld along the old commissural lines.' },
          { k: 'THE RESULT', t: 'The area roughly doubles — 0.9 to ~1.8 cm² — without opening the chest or stopping the heart.' },
          { k: 'THE LIMIT', t: 'If the leaflets are rigid and calcified, or the chordae fused into a tube, the balloon tears the leaflet instead of the weld: severe MR.' },
        ]} />
      <Contrast title="🎈 percutaneous commissurotomy vs surgery in pregnancy"
        is={{ h: 'PMC (balloon)', points: ['Femoral vein, transseptal, light sedation.', 'Fetal radiation can be kept to a fraction of a milligray with echo guidance and short fluoroscopy.', 'Maternal and fetal outcomes excellent in experienced hands.'] }}
        isnt={{ h: 'Open surgery', points: ['Bypass: non-pulsatile flow, hypothermia, anticoagulation — the fetus pays.', 'Fetal loss ~20–30%.', 'Only if PMC is impossible or has failed and the mother’s life is at stake.'] }} />
      <MultiSelect id="s3-ci" question="⛔ Which would make balloon commissurotomy CONTRAINDICATED?"
        items={[
          { id: 'thr', label: 'Thrombus in the left atrium or appendage', correct: true, why: 'Equipment in the LA can embolise it.' },
          { id: 'mr', label: 'More than mild mitral regurgitation', correct: true, why: 'The balloon adds MR; moderate-to-severe MR before means severe after.' },
          { id: 'calc', label: 'Severe or bicommissural calcification', correct: true, why: 'Calcium will not split along the commissure — the leaflet tears.' },
          { id: 'nofusion', label: 'No commissural fusion', correct: true, why: 'Nothing to split (degenerative MS).' },
          { id: 'mva', label: 'MVA > 1.5 cm²', correct: true, why: 'Not significant enough to justify it.' },
          { id: 'af', label: 'Atrial fibrillation', correct: false, why: 'Common, and no contraindication — once the appendage is clear.' },
          { id: 'preg', label: 'Pregnancy', correct: false, why: 'PMC is the intervention OF choice for severe symptomatic MS in pregnancy.' },
        ]} />
      <Decision id="s3-talk" question="💬 She asks: “Will the X-rays hurt my baby?”"
        options={[
          { id: 'honest', label: '“We will use the ultrasound to guide almost everything and only seconds of X-ray, with your belly shielded. The dose to the baby will be far below the level known to cause harm. The bigger danger to your baby is your heart staying like this.”', verdict: 'best', points: 10,
            why: 'Honest, specific, and puts the radiation (a fetal dose well under the ~50 mGy threshold for harm) beside the real risk — maternal decompensation at delivery.' },
          { id: 'zero', label: '“There is no radiation at all.”', verdict: 'wrong', points: 0, why: 'Untrue; some fluoroscopy is almost always used.' },
          { id: 'defer', label: '“The cardiologist will explain on the day.”', verdict: 'wrong', points: 1, why: 'Consent is a conversation before the day, with time to ask questions.' },
        ]} />
    </>
  );
}

/* ============================================================
   4 · PLANNING — WILKINS AND THE BALLOON SIZE
   ============================================================ */

function Planning() {
  const { answers, answer } = useCase();
  const w = answers['s4-wk'];
  const R = inoueReference(HEIGHT);
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🔎 TOE report</span>The anterior leaflet domes freely in diastole; its middle and base move normally, only the tips are held. The tips are 6–7 mm thick, the bodies thin. One small bright spot near the lateral scallop — none at either commissure. The chordae are thickened over their upper third; the papillary muscles are clean.</p>
      </div>
      <div className="cs-h2">🧮 Build her Wilkins score</div>
      <WilkinsBuilder done={w} onScore={r => answer('s4-wk', r)} />
      {w && <div className={'cs-fb ' + (w.right === 4 ? 'best' : 'ok')}>{w.right}/4 components graded as the reviewers did. Her score: 2 + 2 + 1 + 2 = 7 — favourable, with no commissural calcium.</div>}
      <ScoreOnce id="s4-wk" pts={w == null ? null : w.right === 4 ? 10 : w.right * 2} max={10} />
      <Why title="🔬 Why calcium at the commissure matters more than the score"
        chain={[
          { k: 'THE PATH', t: 'The balloon tears the weakest line: normally the old fused commissure.' },
          { k: 'CALCIUM', t: 'A calcified commissure is stronger than the leaflet beside it.' },
          { k: 'WRONG TEAR', t: 'The leaflet itself splits instead — a tear through the body.' },
          { k: 'RESULT', t: 'Acute severe MR. So commissural calcium is a stop sign even when the total score looks acceptable.' },
        ]} />
      <Contrast title="📋 a favourable vs an unfavourable valve for the balloon"
        is={{ h: 'Favourable (hers)', points: ['Wilkins ≤ 8, pliable leaflets, no commissural calcium.', 'Young, sinus or AF, trace MR.', 'Expect MVA ~1.8–2 cm² and years of benefit.'] }}
        isnt={{ h: 'Unfavourable', points: ['Wilkins > 10, heavy or bicommissural calcium.', 'Fused, shortened chordae down to the papillary muscles.', 'Moderate MR already — surgery is usually better.'] }} />
      <Decision id="s4-size" question={`🎈 Inoue balloon: she is ${HEIGHT} cm tall. Which balloon, and how do you use it?`}
        options={[
          { id: 'step', label: `A ${R} mm-reference balloon (height/10 + 10 = ${R}); first inflation ~2 mm below the reference, then 1 mm steps with echo after each`, verdict: 'best', points: 10,
            why: 'The stepwise technique buys the area you need and stops at the first sign of trouble — new MR, a fully split commissure, or an adequate area.' },
          { id: 'max', label: `Go straight to the reference ${R} mm — one inflation is safer`, verdict: 'ok', points: 4, why: 'Fewer passes, but no chance to stop before you have torn something. Many operators start lower, especially in a pregnant woman.' },
          { id: 'big', label: 'The largest balloon available — the bigger the better', verdict: 'wrong', points: 0, why: 'Oversizing is the commonest cause of severe MR after commissurotomy.' },
        ]} />
      <Decision id="s4-site" question="🪡 Where on the septum should the puncture be for a mitral commissurotomy?"
        options={[
          { id: 'mid', label: 'Mid-to-inferior and posterior in the fossa — the giant LA has pushed the fossa down; a lower puncture points the balloon straight at the mitral orifice', verdict: 'best', points: 10,
            why: 'Unlike TEER (Case 02), height above the valve is not the target. A posterior, not-too-high puncture gives a coaxial path into the LV.' },
          { id: 'high', label: 'High and superior, ~4.5 cm above the valve as for a MitraClip', verdict: 'ok', points: 3, why: 'Workable but makes it harder to swing the balloon down into the orifice.' },
          { id: 'ant', label: 'Anterior, toward the aortic root', verdict: 'wrong', points: 0, why: 'Anterior is aorta.' },
        ]} />
      <Video {...V.wilkins} />
    </>
  );
}

/* ============================================================
   5 · SET-UP
   ============================================================ */

function Setup() {
  return (
    <>
      <MultiSelect id="s5-check" question="✅ In the lab: what must be in place before you start?"
        items={[
          { id: 'toe', label: 'TOE within 24–48 h showing no left atrial or appendage thrombus', correct: true, why: 'Repeat if anticoagulation was interrupted or the last study is old.' },
          { id: 'hep', label: 'Last enoxaparin dose ≥ 24 h ago (therapeutic dose)', correct: true, why: 'Femoral access and a transseptal needle; UFH will be given in the lab and can be reversed.' },
          { id: 'tilt', label: 'A wedge under her right hip — left uterine displacement', correct: true, why: 'Supine at 25 weeks, the uterus compresses the IVC and aorta: preload and placental flow fall.' },
          { id: 'fetus', label: 'Obstetrician and fetal monitoring available; obstetric plan if she deteriorates', correct: true, why: 'A rescue caesarean at 25 weeks is a neonatal-unit decision too.' },
          { id: 'rad', label: 'Echo-led guidance, collimation, low-frame-rate fluoroscopy, abdominal shielding where it does not block the view', correct: true, why: 'Keep the fetal dose as low as reasonably achievable.' },
          { id: 'surg', label: 'Cardiac surgery and a pericardiocentesis set ready', correct: true, why: 'Tamponade and severe MR are the two complications that kill quickly.' },
          { id: 'ga', label: 'General anaesthesia as routine', correct: false, why: 'Light sedation and local anaesthetic are enough for most; GA adds hypotension and airway risk in pregnancy.' },
        ]} />
      <Sequence id="s5-seq" question="🔢 Put the procedure in order."
        steps={[
          { label: 'Right femoral vein access under ultrasound; right heart pressures; LA pressure baseline', why: 'Start with the numbers you will judge success by.' },
          { label: 'Transseptal puncture — posterior, mid-to-low fossa, echo-confirmed tent', why: 'The route to the left atrium.' },
          { label: 'Unfractionated heparin once across (≈ 50–70 IU/kg)', why: 'Equipment in the LA.' },
          { label: 'Coiled wire into the LA; dilate the septum and the groin with the 14F dilator', why: 'Make room for the balloon.' },
          { label: 'Inoue balloon to the LA; stylet steers it across the mitral valve toward the apex', why: 'Then inflate the distal half and pull it back onto the valve.' },
          { label: 'Stepwise full inflations; after each — gradient, LA pressure, echo for commissures and MR', why: 'Stop at the endpoint.' },
        ]} />
      <Why title="🔬 Why the left uterine tilt is a haemodynamic intervention"
        chain={[
          { k: 'SUPINE', t: 'From ~20 weeks the uterus lies on the IVC and aorta when she lies flat.' },
          { k: 'PRELOAD', t: 'Venous return falls — up to a quarter of cardiac output can disappear.' },
          { k: 'PRESSURE', t: 'Hypotension, reflex tachycardia — and in MS, tachycardia raises the gradient.' },
          { k: 'PLACENTA', t: 'Uterine blood flow is not autoregulated: the fetus feels every drop in maternal pressure. A wedge fixes it.' },
        ]} />
      <Contrast title="🤰 a pregnant patient in the cath lab vs anyone else"
        is={{ h: 'Pregnant at 25 weeks', points: ['Left tilt — never flat.', 'SpO₂ target ≥ 95%; avoid hypotension (no placental autoregulation).', 'Minimal radiation, shield where possible; fetal monitoring; obstetrician aware.'] }}
        isnt={{ h: 'Not pregnant', points: ['Supine is fine.', 'Usual sedation and oxygen targets.', 'Radiation dose is the operator’s and the patient’s concern only.'] }} />
    </>
  );
}

/* ============================================================
   6 · STRATEGY
   ============================================================ */

function Strategy() {
  const { answers } = useCase();
  return (
    <>
      <Decision id="s6-end" question="🎯 After each inflation, what tells you to STOP?"
        options={[
          { id: 'end', label: 'An adequate area (≥ 1.5 cm², or ~1 cm²/m²), complete opening of at least one commissure, or any increase in MR — whichever comes first', verdict: 'best', points: 10,
            why: 'Each extra millimetre buys less area and more risk. A good result is MVA ≥ 1.5 cm² with MR no worse than mild-to-moderate.' },
          { id: 'zero', label: 'When the gradient is zero', verdict: 'wrong', points: 0, why: 'A gradient of 4–6 mmHg after PMC is an excellent result; chasing zero tears leaflets.' },
          { id: 'max', label: 'When the reference size is reached, whatever the echo shows', verdict: 'ok', points: 3, why: 'The size is a ceiling, not a target.' },
        ]} />
      <Decision id="s6-mr" question="⚠️ After the second inflation the MR jumps from trace to moderate. You…"
        options={[
          { id: 'stop', label: 'Stop: accept the area you have, unless it is still very small and the mechanism is commissural', verdict: 'best', points: 10,
            why: 'A rise in MR is the valve telling you the next millimetre may tear a leaflet or a chord.' },
          { id: 'bigger', label: 'Go up 2 mm to finish the job', verdict: 'wrong', points: 0, why: 'The classic route to a flail leaflet and emergency surgery in a pregnant woman.' },
        ]} />
      <Decision id="s6-la" question="📈 Which measurement in the lab best shows the result is working for HER?"
        options={[
          { id: 'la', label: 'The mean LA pressure (and the transmitral gradient) falling — with the heart rate recorded beside it', verdict: 'best', points: 10,
            why: 'Her symptoms are LA pressure. A fall from ~28 to ~12 mmHg is the haemodynamic proof; the PHT is not valid for the first 72 hours.' },
          { id: 'pht', label: 'A pressure half-time on the table', verdict: 'wrong', points: 0, why: 'LA compliance and the gradient change abruptly after the split: PHT misleads immediately after PMC.' },
          { id: 'fluoro', label: 'The disappearance of the balloon waist', verdict: 'ok', points: 3, why: 'Tells you the balloon opened fully, not what the valve did.' },
        ]} />
      <Contrast title="✂️ a commissural split vs a leaflet tear"
        is={{ h: 'Commissural split (the goal)', points: ['Echo: the fused commissure separates; a wider, oval orifice.', 'MR stays trace or mild, often commissural.', 'LA pressure falls.'] }}
        isnt={{ h: 'Leaflet tear / chordal rupture', points: ['Echo: a flail segment, an eccentric broad jet.', 'v-waves rise, LA pressure climbs, she becomes breathless on the table.', 'Severe MR — often needs surgery.'] }} />
      <Why title="🔬 Why stepwise inflation is safer than one big one"
        chain={[
          { k: 'UNKNOWN STRENGTH', t: 'You cannot know in advance whether the commissure or the leaflet will give first.' },
          { k: 'SMALL STEP', t: 'A small increment splits a little more of the weakest line.' },
          { k: 'LOOK', t: 'Echo after each step shows which line is giving.' },
          { k: 'STOP EARLY', t: 'The first sign of a leaflet giving way comes BEFORE the catastrophe — if you look.' },
        ]} />
      {answers['s6-mr'] && <Note kind="pearl" title="🧷 Today’s plan">First inflation 24 mm, then 25, then 26 at most. Echo and LA pressure after each. Stop at MVA ≥ 1.5 cm² with both commissures open, or at any rise in MR.</Note>}
    </>
  );
}

/* ============================================================
   7 · THE PROCEDURE — TRANSSEPTAL AND THE INOUE BALLOON
   ============================================================ */

function Procedure() {
  const { answers, answer, setVitals, bump } = useCase();
  const tsp = answers['s7-tsp'];
  const tspGood = tsp && tsp.ant <= 0.5 && tsp.height <= 4.2;
  const b = answers['s7-pmc'];
  return (
    <>
      <p className="cs-p">Light sedation, a wedge under her right hip, fetal heart 146. LA pressure 28 mmHg (v-wave 36), mean gradient 13 mmHg at a rate of 78.</p>
      <Steps id="s7-steps">
        <Step title="🪡 Transseptal puncture — posterior, not too high">
          {({ done }) => (
            <>
              <TransseptalPuncture done={tsp} onResult={r => { answer('s7-tsp', r); bump({ fluoro: 40 }); }} />
              {tsp && <div className={'cs-fb ' + (tspGood ? 'best' : 'ok')}>Crossed {tsp.height.toFixed(1)} cm above the valve, {tsp.ant <= 0.5 ? 'posterior' : 'mid-fossa'}. {tspGood ? 'A good line down to the mitral orifice.' : tsp.ant > 0.5 ? 'Anterior: the balloon will angle toward the outflow tract.' : 'High: the balloon has to swing a long way down to the valve.'}</div>}
              <ScoreOnce id="s7-tsp" pts={tsp == null ? null : tspGood ? 10 : 4} max={10} />
              {tsp && answers['s7-steps'] == null && <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" onClick={done}>Done — next step</button></div>}
            </>
          )}
        </Step>
        <Step title="🎈 Inoue balloon — cross, hook, inflate, assess">
          {({ done }) => (
            <>
              <InoueBalloon heightCm={HEIGHT} done={b} onResult={r => {
                answer('s7-pmc', r); bump({ fluoro: 150 });
                setVitals(r.mr >= 3 ? { sys: 92, dia: 58, hr: 112, spo2: 91 } : { sys: 118, dia: 70, hr: 76, spo2: 98 });
              }} />
              {b && <div className={'cs-fb ' + b.grade}>
                Inflations {b.sizes.join(' → ')} mm: MVA {b.mva.toFixed(2)} cm², mean gradient {b.gradient} mmHg, LA {b.la} mmHg, MR {['trace', 'mild', 'moderate', 'severe'][b.mr]}.
                {b.grade === 'best' ? ' Both commissures split, stepwise, stopped at the endpoint — a textbook result.'
                  : b.mr >= 3 ? ' Severe MR from overdilation: a torn leaflet. She needs urgent surgical review.'
                  : b.mva < 1.5 ? ' Safe, but the valve is still small; one more 1 mm step was justified.'
                  : ' A good area, but not without cost — larger steps or sizes than needed.'}
              </div>}
              <ScoreOnce id="s7-pmc" pts={b == null ? null : b.grade === 'best' ? 20 : b.grade === 'ok' ? 10 : 0} max={20} />
              {b && answers['s7-steps'] === 1 && <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" onClick={done}>Done — next step</button></div>}
            </>
          )}
        </Step>
        <Step title="🔎 Final assessment">
          {() => (
            <>
              <Decision id="s7-asd" question="Colour Doppler: a 5 mm left-to-right jet across the septum. What do you do?"
                options={[
                  { id: 'leave', label: 'Leave it — small iatrogenic ASDs after PMC usually close, and it decompresses the LA a little', verdict: 'best', points: 6, why: 'Closure only for a large shunt or right-to-left flow.' },
                  { id: 'close', label: 'Close it with an occluder now', verdict: 'wrong', points: 0, why: 'Unnecessary — and it would complicate any future transseptal access, which she may need in 10–15 years.' },
                ]} />
              <Decision id="s7-prot" question="The heparin given 40 minutes ago — anything before she leaves the lab?"
                options={[
                  { id: 'no', label: 'No routine protamine; restart enoxaparin tonight if the groin is dry and there is no effusion on the check echo', verdict: 'best', points: 6,
                    why: 'Protamine is for bleeding or tamponade. Her stroke risk from AF and a giant LA has not gone away.' },
                  { id: 'yes', label: 'Full protamine reversal and no anticoagulation for 48 hours', verdict: 'wrong', points: 0, why: 'Two days without anticoagulation in rheumatic AF, pregnant, with smoke in the LA.' },
                ]} />
            </>
          )}
        </Step>
      </Steps>
      <Why title="🔬 Why the LA pressure falls the moment the commissures split"
        chain={[
          { k: 'BEFORE', t: '0.9 cm²: the LA must sit 13–16 mmHg above the LV just to push her cardiac output through.' },
          { k: 'AFTER', t: '~1.8 cm²: the gradient falls with the square of the area — to about a quarter.' },
          { k: 'LUNGS', t: 'LA pressure drops below the oncotic threshold: the oedema stops forming.' },
          { k: 'PA', t: 'Pulmonary pressures fall over days to weeks; the RV unloads.' },
        ]} />
      <div className="cs-media-row" style={{ marginTop: 12 }}>
        <Video {...V.pmcSteps} />
        <Video {...V.pmcLive} />
      </div>
      <Video {...V.tsp} />
      <CaseLibrary title="Balloon mitral commissurotomy in real cases" channels={PMC_SEARCHES}>
        Watch for the stylet steering the balloon to the apex, the distal half inflating in the LV, the hourglass waist on the valve — and the echo after every inflation.
      </CaseLibrary>
      <CaseLibrary title="Transseptal punctures" channels={TRANSSEPTAL_SEARCHES} />
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🛏️ 11:30</span>Bed 6, Valvular & Structural Heart Unit, tilted left. “I can breathe lying down.” Rate 76 (AF), 118/70, SpO₂ 98% on air. Groin dry. Fetal heart 144.</p>
      </div>
      <ECG12 rate={76} rhythm="af" caption="Rate-controlled AF, ~76/min." />
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Check echo · 1 h after</div>
        <Table head={['', 'Result']} rows={[
          ['MVA by planimetry', N('1.75 cm²', 'cs-lo')], ['Mean gradient', N('4 mmHg at 76/min', 'cs-lo')],
          ['MR', 'Mild, commissural'], ['Pericardium', 'No effusion'], ['Septum', 'Small left-to-right iatrogenic ASD'],
        ]} />
      </div>
      <Decision id="s8-oac" question="💊 Long-term anticoagulation for her AF?"
        options={[
          { id: 'lmwh', label: 'Therapeutic LMWH (enoxaparin 1 mg/kg twice daily) with anti-Xa monitoring through pregnancy; warfarin (INR 2.0–3.0) after delivery — lifelong while the MS and AF remain', verdict: 'best', points: 10,
            why: 'This IS “valvular AF”: moderate-to-severe rheumatic MS. Even after a good balloon the valve is rheumatic and the LA huge. In pregnancy, LMWH does not cross the placenta; warfarin does (embryopathy at 6–12 weeks, fetal intracranial bleeding at delivery), although it can be used in the second and early third trimester in some settings.' },
          { id: 'doac', label: 'Apixaban — the valve is fixed now', verdict: 'wrong', points: 0,
            why: 'Wrong twice: DOACs are contraindicated in pregnancy, and in rheumatic MS with AF the INVICTUS trial found rivaroxaban inferior to VKA — more strokes and more deaths.' },
          { id: 'none', label: 'Stop anticoagulation — CHA₂DS₂-VA is 0', verdict: 'wrong', points: 0, why: 'The score does not apply to mitral stenosis: AF with MS is anticoagulated regardless.' },
        ]} />
      <Contrast title="⚖️ valvular AF (warfarin) vs non-valvular AF (DOAC)"
        is={{ h: 'Warfarin / VKA — hers', points: ['Moderate-to-severe MITRAL STENOSIS (usually rheumatic).', 'Mechanical heart valves.', 'DOACs inferior (INVICTUS) or harmful (RE-ALIGN).'] }}
        isnt={{ h: 'DOAC preferred', points: ['Mitral regurgitation (Case 02), aortic stenosis (Case 01).', 'Bioprosthetic valves after 3 months, TAVI, mitral clips.', 'Mild MS is debated — follow the guideline and the valve.'] }} />
      <Decision id="s8-bb" question="💓 Which beta-blocker should she go home on?"
        options={[
          { id: 'meto', label: 'Metoprolol (or bisoprolol), titrated to a resting rate below ~80, with fetal growth scans', verdict: 'best', points: 10,
            why: 'Beta-1-selective agents are preferred in pregnancy. All beta-blockers can slow fetal growth a little — hence the growth scans and neonatal glucose/heart-rate checks after birth.' },
          { id: 'aten', label: 'Atenolol 50 mg daily — once a day is easier', verdict: 'wrong', points: 0, why: 'Atenolol is associated with fetal growth restriction and is avoided in pregnancy.' },
          { id: 'stop', label: 'Stop it: the valve is open now', verdict: 'ok', points: 3, why: 'Her rate in AF still matters, and labour will push it up. Keep it and reassess.' },
        ]} />
      <MultiSelect id="s8-mon" question="👀 On the unit this afternoon, what do you watch — and why?"
        items={[
          { id: 'echo', label: 'Repeat echo if anything changes: pericardial effusion, new MR', correct: true, why: 'Tamponade and severe MR are the early killers after PMC.' },
          { id: 'bp', label: 'BP, heart rate, SpO₂ hourly; a low pressure with a rising rate is never “just the sedation”', correct: true, why: 'Tamponade can declare hours later.' },
          { id: 'fetal', label: 'Fetal heart rate', correct: true, why: 'Maternal hypotension shows in the fetus first.' },
          { id: 'groin', label: 'Groin, for haematoma and fistula', correct: true, why: 'A 14F venous puncture on heparin.' },
          { id: 'axa', label: 'Anti-Xa level 4–6 h after the third enoxaparin dose', correct: true, why: 'Pregnancy raises clearance and volume; dose by level.' },
          { id: 'pht', label: 'A PHT tomorrow to confirm the result', correct: false, why: 'Planimetry; the PHT is unreliable for the first 72 hours.' },
          { id: 'flat', label: 'Lie flat for 6 hours for the groin', correct: false, why: 'Tilted, not flat — the IVC.' },
        ]} />
      <Why title="🔬 Why the pressure half-time lies for three days after the balloon"
        chain={[
          { k: 'THE FORMULA', t: '220/PHT assumes the LA and LV compliance that a long-standing stenosis produces.' },
          { k: 'SUDDEN CHANGE', t: 'After the split the gradient collapses and LA compliance changes abruptly.' },
          { k: 'UNCOUPLED', t: 'The rate of pressure decay no longer reflects the orifice area.' },
          { k: 'USE PLANIMETRY', t: 'Measure the hole itself (or 3D) until the chambers re-equilibrate.' },
        ]} />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — 14:10, TAMPONADE
   ============================================================ */

function Crisis() {
  const { answers, answer, setVitals } = useCase();
  const pc = answers['s9-pc'];
  const drained = answers['s9-drained'] || 0;
  const clean = pc && pc.rvTouch === 0 && pc.liverHit === 0 && pc.confirmed;
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>🚨 14:10</span>
          The nurse calls: Mrs Warsame feels faint and “strange in the chest”. Pressure 82/60, rate 132 (AF), SpO₂ 93%, breathing 28. Her neck veins are full. No new murmur. The fetal heart has dropped to 108.
        </p>
      </div>
      <BedsideMonitor />
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Bedside echo · 14:14</div>
        <EchoView effusion={drained >= 240 ? 3 : 16} tamponade={drained < 240} label={drained >= 240 ? 'After drainage: a thin rim, the RV filling normally.' : 'Subcostal: a 16 mm circumferential effusion; the RV free wall buckles in early diastole.'} />
      </div>
      <Decision id="s9-dx" question="🧩 What has happened?"
        options={[
          { id: 'tamp', label: 'Cardiac tamponade — a perforation from the procedure (LV by the stylet/wire, or the atrial wall at the puncture), bleeding on heparin', verdict: 'best', points: 10,
            why: 'Hypotension, tachycardia, raised JVP, no new murmur, an effusion with RV diastolic collapse, hours after transseptal work and heparin.' },
          { id: 'mr', label: 'Severe MR from a leaflet tear', verdict: 'wrong', points: 2, why: 'That brings a loud new systolic murmur and pulmonary oedema with giant v-waves; the echo would show a jet, not an effusion.' },
          { id: 'cc', label: 'Aortocaval compression', verdict: 'wrong', points: 2, why: 'Always check the tilt — but it does not make the neck veins full or the RV collapse.' },
          { id: 'pe', label: 'Pulmonary embolism', verdict: 'wrong', points: 0, why: 'The echo shows fluid around the heart, not a dilated RV.' },
        ]} />
      <Contrast title="🩸 tamponade vs severe MR after a balloon"
        is={{ h: 'Tamponade', points: ['Hypotension, raised JVP, pulsus paradoxus, quiet heart sounds.', 'Lungs often CLEAR.', 'Echo: effusion, RV/RA diastolic collapse. Fix: needle.'] }}
        isnt={{ h: 'Severe MR (leaflet tear)', points: ['Loud new systolic murmur; pulmonary oedema.', 'Giant LA v-waves.', 'Echo: flail segment, broad jet. Fix: surgery (or bridge).'] }} />
      <MultiSelect id="s9-now" question="⏱️ The next five minutes?"
        items={[
          { id: 'tilt', label: 'Check the left tilt; call the structural team, anaesthetist and obstetrician', correct: true, why: 'Exclude the simple thing; summon everyone.' },
          { id: 'fluid', label: 'A cautious 250 mL fluid bolus as a bridge', correct: true, why: 'In tamponade, filling props up the RV — a small volume, as a bridge, even with her mitral valve, which is now open.' },
          { id: 'prot', label: 'Protamine to reverse the heparin', correct: true, why: 'She is bleeding into the pericardium; reverse it (and hold tonight’s enoxaparin).' },
          { id: 'drain', label: 'Echo-guided pericardiocentesis now', correct: true, why: 'The definitive bedside treatment.' },
          { id: 'fetal', label: 'Continuous fetal monitoring', correct: true, why: 'The fetus is already telling you how low the placental flow is.' },
          { id: 'diur', label: 'IV furosemide for the full neck veins', correct: false, why: 'Removing preload in tamponade can be fatal: the RV needs it to open against the fluid.' },
          { id: 'bb', label: 'IV metoprolol for the rate of 132', correct: false, why: 'The tachycardia is now the only thing keeping her output up — the opposite of this morning.' },
        ]} />
      <Why title="🔬 Why the same tachycardia is now friend, not foe"
        chain={[
          { k: 'THIS MORNING', t: 'A tight valve: fast rate → short diastole → high LA → oedema. Slow it.' },
          { k: 'NOW', t: 'The valve is open; the fluid squeezes the heart: each stroke volume is tiny.' },
          { k: 'RATE × SMALL SV', t: 'Output is being held up by rate alone.' },
          { k: 'SO', t: 'A beta-blocker now could stop the heart. Treat the cause — the fluid.' },
        ]} />

      <div className="cs-h2">💉 Pericardiocentesis</div>
      <p className="cs-p">Subxiphoid, with the echo probe beside you. Choose the aim and the angle, advance in millimetres, aspirate as you go.</p>
      <Pericardiocentesis done={pc}
        onDrain={ml => { answer('s9-drained', ml); setVitals({ sys: Math.min(116, 82 + ml * 0.14), dia: Math.min(70, 60 + ml * 0.04), hr: Math.max(92, 132 - ml * 0.16), spo2: Math.min(97, 93 + Math.round(ml / 60)) }); }}
        onResult={r => answer('s9-pc', r)} />
      {pc && <div className={'cs-fb ' + (clean ? 'best' : 'ok')}>{pc.drained} mL of blood-stained fluid out, {pc.attempts} aspiration{pc.attempts > 1 ? 's' : ''}. {clean ? 'Clean entry, confirmed with agitated saline. Pressure 116/70, fetal heart 140.' : pc.rvTouch ? 'You touched the RV — pulling back saved it this time. Echo guidance and small advances.' : pc.liverHit ? 'A liver puncture on heparin can bleed for hours: watch her haemoglobin.' : 'In — but confirm with agitated saline before you dilate.'}</div>}
      <ScoreOnce id="s9-pc" pts={pc == null ? null : clean ? 15 : 7} max={15} />
      {pc && (
        <Decision id="s9-def" question="🛠️ The pigtail drained 300 mL; the effusion is gone. Next?"
          options={[
            { id: 'drain', label: 'Leave the drain on free drainage; repeat echo at 1, 6 and 24 h; surgical review if it keeps bleeding (> ~100 mL/h or re-accumulation); restart LMWH only when the drain is dry', verdict: 'best', points: 10,
              why: 'Most transseptal and stylet perforations seal once heparin is reversed. Persistent bleeding means a hole that needs a surgeon.' },
            { id: 'pull', label: 'Pull the drain now and restart full-dose enoxaparin tonight', verdict: 'wrong', points: 0, why: 'Re-accumulation on full anticoagulation is how tamponade comes back at 3 a.m.' },
            { id: 'cs', label: 'Emergency caesarean section', verdict: 'wrong', points: 0, why: 'The mother is recovering and the fetal heart has normalised — the fetus is best inside a stable mother.' },
          ]} />
      )}
      <Note kind="warn" title="🫀 If she arrests (> 20 weeks)">High-quality CPR with manual uterine displacement to the left; IV access above the diaphragm; for PEA in tamponade, drain the pericardium. If there is no return of circulation by 4 minutes, resuscitative hysterotomy should be under way to deliver by ~5 minutes — it is done to save the MOTHER, by emptying the uterus off the vena cava.</Note>
      <Video {...V.pericardio} />
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
      <ViciousCycle id="cyc-rate" title="🔁 The tachycardia spiral — 02:10"
        nodes={[
          { short: 'Fast rate', t: 'AF at 150', d: 'Diastole — the only time blood crosses the valve — shrinks to under 200 ms per beat.' },
          { short: 'Gradient ↑', t: 'The gradient rises steeply', d: 'More flow per second of diastole through the same 0.9 cm²: gradient ∝ flow².' },
          { short: 'LA ↑', t: 'LA pressure climbs above 30 mmHg', d: 'Higher than the plasma oncotic pressure — lower than usual in pregnancy.' },
          { short: 'Wet lungs', t: 'Pulmonary oedema, hypoxia', d: 'Breathlessness, fear, work of breathing.' },
          { short: 'Adrenaline', t: 'Sympathetic surge', d: 'Faster AV conduction — the rate climbs again and the spiral tightens.' },
        ]}
        breaks={[
          { at: 0, t: 'Beta-blocker (metoprolol), ± digoxin; cardioversion if unstable.' },
          { at: 3, t: 'Upright, CPAP, low-dose furosemide.' },
          { at: 1, t: 'Open the valve: percutaneous commissurotomy.' },
          { at: 4, t: 'Oxygen, calm, no beta-agonists, no salbutamol.' },
        ]} />
      <Decision id="cyc-why" question="🤔 Why does slowing her from 150 to 80 help more than any diuretic?"
        options={[
          { id: 'dia', label: 'It roughly doubles the time per minute available for filling, so the same output crosses the valve at a much lower flow rate — and the gradient falls with the square of that', verdict: 'best', points: 10,
            why: 'Diuretics lower the pressure by draining the volume; the beta-blocker lowers it by giving the volume time to cross.' },
          { id: 'ino', label: 'Beta-blockers make the LV contract harder', verdict: 'wrong', points: 0, why: 'They are negative inotropes; the LV is not her problem.' },
        ]} />
      <ViciousCycle id="cyc-la" title="🔁 The atrial spiral — stasis, clot, stroke"
        nodes={[
          { short: 'High LA', t: 'Years of high LA pressure', d: 'The atrium stretches, scars and dilates.' },
          { short: 'AF', t: 'Atrial fibrillation', d: 'The stretched, fibrosed atrium fibrillates.' },
          { short: 'Stasis', t: 'No contraction, slow flow through a narrow valve', d: '“Smoke” in the appendage — red cells clumping in still blood.' },
          { short: 'Thrombus', t: 'Clot in the appendage', d: 'Mitral stenosis with AF carries the highest embolic risk of any AF.' },
          { short: 'Stroke', t: 'Embolic stroke', d: 'Often the first sign of rheumatic MS in young women.' },
        ]}
        breaks={[
          { at: 3, t: 'Anticoagulate: heparin in pregnancy, warfarin after — not a DOAC.' },
          { at: 0, t: 'Relieve the stenosis: lower LA pressure slows the dilation.' },
          { at: 1, t: 'Rate control; consider rhythm control when the LA is offloaded.' },
        ]} />
      <ViciousCycle id="cyc-rf" title="🔁 The rheumatic spiral — one sore throat at a time"
        nodes={[
          { short: 'Strep throat', t: 'Group A streptococcal pharyngitis', d: 'Crowded housing, poor access to care.' },
          { short: 'Mimicry', t: 'Antibodies against streptococcal M protein', d: 'Cross-react with cardiac myosin and valve tissue.' },
          { short: 'Carditis', t: 'Acute rheumatic fever — valvulitis', d: 'The mitral valve is inflamed; the commissures begin to fuse as they heal.' },
          { short: 'Scarring', t: 'Chronic rheumatic heart disease', d: 'Each recurrence adds scar; stenosis forms over 10–20 years.' },
          { short: 'Recurrence', t: 'The next strep infection', d: 'A damaged valve is hit again — worse each time.' },
        ]}
        breaks={[
          { at: 0, t: 'Primary prevention: treat strep sore throats with penicillin.' },
          { at: 4, t: 'Secondary prophylaxis: benzathine penicillin G 1.2 million units IM every 3–4 weeks.' },
          { at: 3, t: 'Find it early: echo screening in endemic communities and in pregnancy.' },
        ]} />
      <Decision id="cyc-pp" question="💉 How long should her secondary prophylaxis continue?"
        options={[
          { id: 'long', label: 'At least 10 years after the last episode or until age 40, whichever is longer — often lifelong with severe valve disease or after intervention', verdict: 'best', points: 10,
            why: 'She has severe rheumatic heart disease and has had a valve intervention; she is 27. Benzathine penicillin is safe in pregnancy and breastfeeding.' },
          { id: 'five', label: '5 years, then stop', verdict: 'wrong', points: 0, why: 'That is for ARF without carditis in some guidelines — not established valve disease.' },
          { id: 'stop', label: 'Not needed now that the valve is opened', verdict: 'wrong', points: 0, why: 'The balloon split a scar; a new attack will make a new one.' },
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
      <WarStory title="🌬️ The asthma that wasn’t"
        mistake="Treating wheeze and breathlessness in a pregnant woman as asthma — back-to-back salbutamol nebulisers — without listening for a diastolic murmur."
        burn="Wheeze in pregnancy can be pulmonary oedema. Beta-agonists in MS speed the rate, shorten diastole and flood the lungs. Listen in the left lateral position with the bell.">
        <p className="cs-p">A 24-year-old at 28 weeks, “asthma since this pregnancy”. Three nebulisers: rate 165, SpO₂ 78%. Intubated in the emergency department; the fetus was lost. The echo next day: MVA 0.8 cm².</p>
      </WarStory>
      <Decision id="mm-neb" question="What single bedside step would have changed her course?"
        options={[
          { id: 'listen', label: 'Auscultation at the apex with the bell in the left lateral position — and an echo for any new breathlessness in pregnancy with a murmur or AF', verdict: 'best', points: 10, why: 'The rumble is quiet and localised; you hear it only if you look for it.' },
          { id: 'peak', label: 'A peak-flow reading', verdict: 'wrong', points: 0, why: 'Reduced in oedema too.' },
        ]} />
      <WarStory title="💧 The litre in the ambulance"
        mistake="A 1 L fluid bolus for tachycardia and ‘dehydration’ in a pregnant woman with known rheumatic heart disease."
        burn="In MS, fluid goes straight to the lungs. Sit up, tilt left, CPAP — and bring her in.">
        <p className="cs-p">Found at home, rate 140, BP 100/60, “dry mouth”. The litre ran in on the way. At the door: frothy pink sputum, SpO₂ 70%, a cardiac arrest in the resus room — return of circulation after 6 minutes and a perimortem caesarean.</p>
      </WarStory>
      <WarStory title="💊 The convenient switch"
        mistake="Changing warfarin to rivaroxaban after delivery in a woman with rheumatic MS and AF, “because the INR clinic is hard to reach”."
        burn="Rheumatic MS + AF = warfarin. INVICTUS: rivaroxaban gave more strokes and more deaths. Solve the access problem, not the drug.">
        <p className="cs-p">A 31-year-old, eight weeks postpartum. Four months later: a left MCA stroke, aphasic at 31, a newborn at home. The appendage was full of clot.</p>
      </WarStory>
      <Decision id="mm-doac" question="If INR monitoring is genuinely hard for her, what is the right move?"
        options={[
          { id: 'vka', label: 'Stay on warfarin and fix the access: point-of-care INR, a nearby clinic, home testing, education', verdict: 'best', points: 10, why: 'The drug that works, made workable.' },
          { id: 'doac', label: 'A DOAC at full dose is acceptable', verdict: 'wrong', points: 0, why: 'Not in rheumatic MS — tested and found inferior.' },
          { id: 'asp', label: 'Aspirin', verdict: 'wrong', points: 0, why: 'Does not prevent AF strokes.' },
        ]} />
      <WarStory title="🍼 The bolus after the baby"
        mistake="A 10-unit IV bolus of oxytocin straight after delivery, and the patient sent to the postnatal ward an hour later."
        burn="Oxytocin by slow infusion in heart disease. The first 24–72 h after birth are the most dangerous: the contracted uterus pours ~500 mL back into her circulation.">
        <p className="cs-p">A 26-year-old with moderate MS and a smooth vaginal delivery. The bolus: pressure 70/40, rate 150. Two hours later on the ward, the autotransfusion arrived on top: pulmonary oedema, a peri-arrest call, five days in intensive care.</p>
      </WarStory>
      <Decision id="mm-post" question="Where should a woman with significant MS spend the first night after delivery?"
        options={[
          { id: 'hdu', label: 'A monitored bed (high-dependency or cardiac) for at least 24–48 h, with fluid balance and a low threshold for diuretic', verdict: 'best', points: 10, why: 'The highest-risk hours come after the baby, not before.' },
          { id: 'ward', label: 'The postnatal ward — the delivery is over', verdict: 'wrong', points: 0, why: 'The haemodynamic peak is still coming.' },
        ]} />
      <WarStory title="🧱 The balloon without the TOE"
        mistake="Proceeding to balloon commissurotomy in AF on a two-week-old transthoracic echo, without imaging the appendage."
        burn="AF + MS = TOE before the balloon, every time. A clot in the appendage is a contraindication.">
        <p className="cs-p">The wires and balloon moved through a large LA. Ten minutes after the second inflation: right-sided weakness and a gaze deviation. Thrombectomy recovered most of the function; a fragment had come from the appendage.</p>
      </WarStory>
      <WarStory title="💉 The injections that stopped"
        mistake="Stopping monthly benzathine penicillin at 16 because she “felt fine” and the injections hurt."
        burn="Secondary prophylaxis is the only thing that stops the next attack. Painful? Use lidocaine as the diluent, explain why — and keep going.">
        <p className="cs-p">A 17-year-old, a year after her last injection: a sore throat, then fever, flitting arthritis and a new pansystolic murmur — severe carditis with acute MR. She died in heart failure awaiting surgery.</p>
      </WarStory>
      <WarStory title="📏 The gradient that fell"
        mistake="Grading a valve as ‘moderate’ because its gradient fell from 18 to 9 mmHg after beta-blockade — and stopping the work-up."
        burn="The gradient follows the rate and the flow. The AREA is the valve. Grade by planimetry.">
        <p className="cs-p">At 22 weeks, “much better on bisoprolol, gradient now 9.” No one measured the area: 0.9 cm². In labour her rate climbed to 140 with each contraction. She went into pulmonary oedema in the second stage; emergency caesarean under general anaesthesia, and a week on a ventilator.</p>
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">👶 38 weeks</span>Planned induction. Enoxaparin switched to IV unfractionated heparin at 36 weeks, stopped 6 hours before the epidural. Vaginal delivery with an early epidural and an assisted second stage; oxytocin by slow infusion. A girl, 3.0 kg. 24 hours on the cardiac unit — 600 mL of diuresis, no oedema. Warfarin started on day 2 with heparin bridging.</p>
      </div>
      <MultiSelect id="s12-home" question="🏠 Her discharge plan?"
        items={[
          { id: 'warf', label: 'Warfarin, INR 2.0–3.0, with LMWH until the INR is in range; safe with breastfeeding', correct: true, why: 'Valvular AF; warfarin does not pass into breast milk in meaningful amounts.' },
          { id: 'bb', label: 'Metoprolol continued; rate target < ~80 at rest', correct: true, why: 'Even an opened valve depends on diastolic time.' },
          { id: 'bpg', label: 'Benzathine penicillin G 1.2 million units IM every 3–4 weeks', correct: true, why: 'Secondary prophylaxis — the injection that protects the valve she has.' },
          { id: 'echo', label: 'Echo at 3–6 months, then yearly: restenosis, MR, PA pressure', correct: true, why: 'Restenosis typically comes years later; a repeat balloon is possible if anatomy allows.' },
          { id: 'contra', label: 'Contraception advice and preconception counselling before any future pregnancy', correct: true, why: 'Plan the next pregnancy around the valve — and avoid warfarin in weeks 6–12.' },
          { id: 'ie', label: 'Antibiotic prophylaxis before every dental procedure for endocarditis', correct: false, why: 'Native rheumatic valves without prosthetic material or prior endocarditis are not in the ESC high-risk group. Good dental hygiene, yes; routine dental antibiotics, no. Do not confuse it with rheumatic secondary prophylaxis.' },
          { id: 'doac', label: 'Switch to apixaban at 6 weeks', correct: false, why: 'INVICTUS.' },
        ]} />
      <Contrast title="💉 rheumatic secondary prophylaxis vs endocarditis prophylaxis"
        is={{ h: 'Secondary prophylaxis (she needs it)', points: ['Prevents the NEXT attack of rheumatic fever.', 'Benzathine penicillin G 1.2 MU IM every 3–4 weeks, for years — often to age 40 or lifelong.', 'Continuous, whatever she is doing.'] }}
        isnt={{ h: 'Endocarditis prophylaxis (she does not)', points: ['A single dose before a high-risk dental procedure.', 'For prosthetic valves or material, previous endocarditis, some congenital disease.', 'Her native valve after a balloon is not in that group.'] }} />

      <div className="cs-h2">📝 Case quiz</div>
      <Quiz id="s12-quiz" items={[
        { q: 'In mitral stenosis, a SHORTER S2–opening snap interval means…', options: ['Milder stenosis', 'Higher LA pressure — more severe stenosis', 'Calcified leaflets', 'Aortic regurgitation'], answer: 1, why: 'The leaflets snap open sooner when LA pressure is higher.' },
        { q: 'Presystolic accentuation of the rumble disappears when the patient develops…', options: ['Pregnancy', 'Atrial fibrillation', 'Tachycardia in sinus rhythm', 'Mitral regurgitation'], answer: 1, why: 'No atrial contraction, no presystolic surge.' },
        { q: 'MVA by pressure half-time = 220 / PHT. A PHT of 220 ms gives…', options: ['0.5 cm²', '1.0 cm²', '1.5 cm²', '2.2 cm²'], answer: 1, why: '220/220 = 1.0 cm².' },
        { q: 'The pressure half-time is unreliable…', options: ['In sinus rhythm', 'For ~72 h after balloon commissurotomy', 'In young patients', 'In the second trimester'], answer: 1, why: 'Abrupt changes in LA compliance and gradient.' },
        { q: 'A Wilkins score favourable for balloon commissurotomy is…', options: ['≤ 8', '10–12', '≥ 12', 'Any score with AF'], answer: 0, why: '≤ 8, with no commissural calcium.' },
        { q: 'Inoue balloon reference size for a woman 170 cm tall?', options: ['22 mm', '25 mm', '27 mm', '30 mm'], answer: 2, why: 'Height/10 + 10 = 27 mm.' },
        { q: 'Which is “valvular AF” — warfarin, not a DOAC?', options: ['AF with severe MR', 'AF with moderate–severe rheumatic MS', 'AF after TAVI', 'AF with a bioprosthetic aortic valve at 1 year'], answer: 1, why: 'And mechanical valves. INVICTUS: VKA beat rivaroxaban in rheumatic AF.' },
        { q: 'First-line rate control for a pregnant woman with MS and fast AF?', options: ['Atenolol', 'Amiodarone', 'Metoprolol', 'Verapamil'], answer: 2, why: 'β1-selective; atenolol is avoided (fetal growth).' },
        { q: 'The most dangerous haemodynamic period for a woman with MS around delivery is…', options: ['The first trimester', 'Early labour only', 'The first 24–72 h after delivery', 'Six weeks postpartum'], answer: 2, why: 'Autotransfusion from the contracting uterus and the release of caval compression.' },
        { q: 'Hypotension, raised JVP and clear lungs three hours after balloon commissurotomy suggest…', options: ['Severe MR', 'Tamponade', 'Restenosis', 'Vasovagal reaction'], answer: 1, why: 'Echo for an effusion; prepare to drain it.' },
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
          <li className="cs-li">🤰 Breathlessness, haemoptysis or AF in pregnancy in a woman from an endemic region: listen for the snap and the rumble, and get an echo.</li>
          <li className="cs-li">⏱️ In mitral stenosis, heart rate is everything: blood crosses only in diastole. Slow it — metoprolol, not salbutamol.</li>
          <li className="cs-li">🪞 The mirror of acute MR: there the rate holds up the output; here the rate is the disease.</li>
          <li className="cs-li">💧 No fluid boluses in MS; sit up, tilt left, CPAP, gentle diuretic.</li>
          <li className="cs-li">📐 Grade by AREA (planimetry first), not by gradient — rate and pregnancy inflate the gradient.</li>
          <li className="cs-li">💊 Rheumatic MS + AF = valvular AF: heparin in pregnancy, warfarin after, never a DOAC (INVICTUS).</li>
          <li className="cs-li">🎈 Balloon commissurotomy: TOE first, Wilkins ≤ 8 and no commissural calcium, stepwise sizes, stop at the endpoint. In pregnancy, after 20 weeks.</li>
          <li className="cs-li">🩸 Low pressure, high JVP, clear lungs after a transseptal procedure: tamponade until proven otherwise — needle, protamine, and no beta-blocker.</li>
          <li className="cs-li">👶 The most dangerous hours are after the baby: slow oxytocin, a monitored bed, watch the fluid.</li>
          <li className="cs-li">💉 Secondary prophylaxis with benzathine penicillin, for years — the only thing that stops the next attack.</li>
        </ol>
      </div>
      <CaseLibrary playlist={VALVE_PLAYLIST} start={VALVE_PLAYLIST_START} channels={VALVE_CHANNELS}>
        Keep going: more structural and valvular cases from the same teams.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const VALVE_06 = {
  title: 'Rheumatic mitral stenosis · AF in pregnancy · balloon commissurotomy and tamponade',
  short: 'Structural Heart · Case 06',
  patient: {
    name: 'Mrs Hodan Warsame',
    meta: '27 F · 24/40 pregnant · MRN 6610-2297 · 68 kg',
    flags: [
      { text: 'Pregnant 24 weeks', tone: 'amber' },
      { text: 'New fast AF', tone: 'red' },
      { text: 'Rheumatic fever age 11', tone: 'amber' },
      { text: 'No known allergies', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 0, limit: 30, basis: 'echo-guided; contrast avoided in pregnancy' },
  clock0: min(2, 10),
  vitals0: { hr: 148, sys: 112, dia: 70, spo2: 88, rr: 30, st: 0, rhythm: 'af' },
  brand: { icon: '🫀', line: 'Structural Heart · Case 06' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / EM / Obstetric medicine', tone: 'cyan' },
      { text: 'Valve · pregnancy · balloon', tone: 'red' },
      { text: 'ESC/EACTS 2025 VHD · ESC pregnancy-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'Two hearts,', style: 'outline' },
      { text: 'one narrow valve', style: 'grad' },
      { text: '& the time to fill', style: 'cyan' },
    ],
    hook: (
      <>
        A 27-year-old, <b>24 weeks pregnant</b>, wakes drowning, her heart racing at 150. A fever at eleven left a scar she never knew about — and pregnancy has just found it.
        Here the rule from Case 02 turns inside out: in mitral stenosis the heart rate <span className="r">is</span> the disease, and slowing it <span className="g">dries the lungs</span>.
        You will hear the snap, measure the valve, split it with a balloon on a mother and her baby — and meet the <span className="r">bleed around the heart at 14:10</span>.
      </>
    ),
    image: null,
    sims: 's2',
    crisis: 's9',
    cards: [
      { k: '🧑‍🍼 The patient', t: 'Mrs Hodan Warsame, 27, from Somalia — second pregnancy, childhood rheumatic fever, new AF.' },
      { k: '🩺 Your role', t: 'From the ambulance bay to the echo room, the pregnancy heart team, the structural lab, the unit — and the delivery suite.' },
      { k: '🎛️ In your hands', t: 'The opening snap, a heart-rate/gradient model, pressure half-time, planimetry, the Wilkins score, transseptal puncture, an Inoue balloon and a pericardiocentesis needle.' },
      { k: '🧠 How it teaches', t: 'Diastolic time, flow squared, a fixed hole — and why the same tachycardia is the enemy at 02:10 and the lifeline at 14:10.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'Drowning at 24 weeks', Component: Presentation,
      pill: '🌊 02:10 — pulmonary oedema, AF at 150',
      lede: 'Hear the snap, find the rate that dries her lungs, and treat the mechanism.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 148, sys: 112, dia: 70, spo2: 88, rr: 30, rhythm: 'af' }); atLeastClock(min(2, 10)); } },
    { id: 's2', icon: '📏', nav: 'Echo & Measurement', title: 'Measure the valve — PHT and planimetry', Component: EchoStage,
      pill: '🎯 Measure it yourself',
      lede: 'Why the gradient lies in pregnancy, two ways to find the area — and what makes this valve rheumatic.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 96, sys: 116, dia: 68, spo2: 95, rr: 20, rhythm: 'af' }); atLeastClock(min(9, 30)); } },
    { id: 's3', icon: '👥', nav: 'Heart Team', title: 'The pregnancy heart team', Component: HeartTeam,
      pill: '🧭 Day 2 — balloon, surgery or wait?',
      lede: 'Two patients, one valve, and the conversation about X-rays.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 82, sys: 114, dia: 66, spo2: 97, rr: 18, rhythm: 'af' }); atLeastClock(min(58, 0)); } },
    { id: 's4', icon: '🧮', nav: 'Planning', title: 'Planning — Wilkins and the balloon', Component: Planning,
      pill: '📐 Score the valve, size the balloon',
      lede: 'Build the Wilkins score from the TOE, pick the balloon and the puncture site.',
      enter: ({ atLeastClock }) => atLeastClock(min(86, 0)) },
    { id: 's5', icon: '🩸', nav: 'Set-up', title: 'Set-up in the structural lab', Component: Setup,
      pill: '🧷 Day 5 — tilted, shielded, echo-led',
      lede: 'Checklist, sequence — and why a wedge under her hip is a drug.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 78, sys: 112, dia: 66, spo2: 98, rr: 16, rhythm: 'af' }); atLeastClock(min(128, 0)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy: when to stop inflating', Component: Strategy,
      pill: '🛑 The endpoint before you start',
      lede: 'Adequate area, a split commissure or a rise in MR — whichever comes first.',
      enter: ({ atLeastClock }) => atLeastClock(min(128, 20)) },
    { id: 's7', icon: '🎈', nav: 'Balloon Commissurotomy', title: 'Percutaneous mitral commissurotomy', Component: Procedure,
      pill: '🛠️ Cross the septum, split the valve',
      lede: 'Transseptal puncture, then the Inoue balloon — stepwise, with echo after every inflation.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 78, sys: 110, dia: 64, spo2: 98, rr: 16, rhythm: 'af' }); atLeastClock(min(128, 40)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit', Component: Recovery,
      pill: '💊 Valvular AF — the right drug in pregnancy',
      lede: 'Bed 6: anticoagulation for two, the right beta-blocker, and what to watch.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 76, sys: 118, dia: 70, spo2: 98, rr: 15, rhythm: 'af' }); atLeastClock(min(131, 30)); } },
    { id: 's9', icon: '🚨', nav: 'The Crisis', title: '14:10 — tamponade', Component: Crisis,
      pill: '🩸 Low pressure, full neck veins, clear lungs',
      lede: 'Recognise it, support her the right way, put the needle in the right place.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 132, sys: 82, dia: 60, spo2: 93, rr: 28, rhythm: 'af' }); atLeastClock(min(134, 10)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'The tachycardia spiral, the atrial spiral, and the rheumatic one.',
      enter: ({ setVitals }) => setVitals({ hr: 78, sys: 116, dia: 70, spo2: 98, rr: 15, rhythm: 'af' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Seven women who taught these rules.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Delivery, discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'Labour, the plan for life, the quiz — then your score.' },
  ],
};

export default function Valve06({ onClose }) {
  return <CaseShell def={VALVE_06} onClose={onClose} />;
}
