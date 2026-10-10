import React from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Figure, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS, MITRACLIP_SEARCHES } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import { Auscultation, PulmonaryVein, LAPressure } from '../kit/Valve.jsx';
import { FunctionalPISA, ProportionPlot, GdmtBoard, TetheredClip, HyperKResus } from './sims.jsx';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 05 · BED 5
   Secondary (functional) mitral regurgitation in heart failure
   with reduced ejection fraction. A 67-year-old with an old
   inferior infarct, a dilated scarred ventricle, LBBB and a
   normal mitral valve pulled open by it. Admitted wet, slides
   into low-output shock (why noradrenaline alone worsens MR);
   the leak is measured by hand and set against the size of the
   ventricle (proportionate vs disproportionate — why COAPT and
   MITRA-FR disagreed); the four pillars are titrated visit by
   visit; CRT-D; the MR stays severe, so the heart team clips it
   — two clips for a wide functional jet. Four weeks later a
   stomach bug, all his tablets still taken: potassium 7.6 and
   a CRT-D that can no longer capture.

   The ventricle is the disease. The valve is where it shows.

   Clinical content follows the 2025 ESC/EACTS valvular heart
   disease guideline, the 2021 ESC heart failure guideline and
   its 2023 focused update, the 2021 ESC pacing/CRT guideline,
   the 2022 ESC ventricular arrhythmia guideline, ASE/EACVI
   quantification standards, and UK Kidney Association (2023)
   hyperkalaemia guidance, simplified for teaching. Where the
   evidence is contested (proportionality, antithrombotic
   therapy after TEER) the text says so.
   ============================================================ */

const WIKI = f => `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=960`;
const WIKIPAGE = f => `https://commons.wikimedia.org/wiki/File:${f}`;
const min = (h, m) => h * 60 + m;
const DAY = d => d * 24;

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

/* the patients the proportionality plot compares */
const PROPORTION_PRESETS = [
  { name: 'Mr Okafor · day 3', lvedv: 238, eroa: 0.42, ef: 28 },
  { name: 'COAPT average', lvedv: 192, eroa: 0.41, ef: 31 },
  { name: 'MITRA-FR average', lvedv: 252, eroa: 0.31, ef: 33 },
  { name: 'Mrs Lindqvist', lvedv: 310, eroa: 0.30, ef: 20 },
  { name: 'Mr Okafor · 3 months', lvedv: 196, eroa: 0.45, ef: 31 },
];

/* ============================================================
   1 · PRESENTATION — WARM AND WET, THEN COLD
   ============================================================ */

function Presentation() {
  const { answers, setVitals } = useCase();
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">📆 3 weeks</span>Mr Samuel Okafor, 67, a retired bus driver from Leeds, has been more breathless every week. Now he sleeps in his armchair, wakes gasping at 3 a.m., and his shoes no longer fit. He has gained 6 kg.</p>
        <p className="cs-p"><span className="cs-time">📋 history</span>Inferior myocardial infarction in 2019, treated late — the right coronary artery is still occluded. “Weak heart” since. Left bundle branch block. CKD 3a. On <b>ramipril 2.5 mg</b>, <b>bisoprolol 1.25 mg</b>, furosemide 40 mg, atorvastatin 80 mg and aspirin 75 mg — <b>the same low doses since 2019</b>. No one up-titrated. 84 kg.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🚑 21:10</span>Ambulance to the emergency department, sitting up, speaking in short sentences.</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>📈 Observations · 21:10</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('108 /min, regular', 'cs-hi')], ['Blood pressure', N('102/70 mmHg')], ['SpO₂', N('88% on air', 'cs-hi')],
            ['Resp. rate', N('28 /min', 'cs-hi')], ['Temperature', N('36.6 °C')], ['Lactate', N('2.1 mmol/L')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🩺 Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">JVP to the earlobes. Crackles to the mid-zones. Pitting oedema to the knees.</li>
            <li className="cs-li">Apex displaced to the 6th space, anterior axillary line — a big heart.</li>
            <li className="cs-li">A <b>soft, grade 2/6</b> pansystolic murmur at the apex, radiating to the axilla. A third heart sound.</li>
            <li className="cs-li">Warm hands, capillary refill 2 s. Alert. <b>Warm and wet.</b></li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">🎧 Listen — then compare</div>
      <p className="cs-p">His murmur is the chronic one. Then the acute flail of Case 02 and a prolapse. Notice that loudness is no guide here: a weak ventricle cannot drive a loud jet.</p>
      <Auscultation lesions={['mr-chronic', 'mr-acute', 'mvp', 'normal']} />

      <ECG12 rate={108} lbbb
        caption="Sinus tachycardia 108/min with left bundle branch block, QRS 162 ms: broad notched R in I, aVL, V5–V6, deep QS in V1–V2, discordant ST–T. Q waves are hidden by the LBBB." />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧪 Chest X-ray and bloods</div>
        <Table head={['', 'Result']} rows={[
          ['Chest X-ray', 'Cardiothoracic ratio 0.62, upper-lobe diversion, Kerley B lines, bilateral effusions'],
          ['hs-Troponin T', N('38 → 41 ng/L — flat')], ['NT-proBNP', N('7,850 ng/L', 'cs-hi')],
          ['Sodium / potassium', N('132 · 4.7 mmol/L')], ['Creatinine / eGFR', N('138 µmol/L · 46', 'cs-hi')],
          ['Haemoglobin', N('128 g/L')], ['Ferritin / TSAT', N('64 µg/L · 15%', 'cs-hi')],
        ]} />
      </div>

      <Decision id="s1-dx" question="What is going on?"
        options={[
          { id: 'fmr', label: 'Acute decompensation of chronic HFrEF (ischaemic cardiomyopathy) with secondary mitral regurgitation — a dilated, scarred ventricle pulling a normal valve open', verdict: 'best', points: 10,
            why: 'A big heart (displaced apex, CTR 0.62), LBBB, an old infarct, months of decline, a soft holosystolic murmur and an S3. The valve is the messenger; the ventricle is the disease.' },
          { id: 'flail', label: 'Acute severe primary MR from a ruptured chord', verdict: 'wrong', points: 0, why: 'That is Case 02: sudden onset, a normal-sized heart, a short early murmur. His heart is huge and his story is weeks long.' },
          { id: 'acs', label: 'An NSTEMI causing heart failure', verdict: 'wrong', points: 2, why: 'A flat, low troponin is myocardial strain, not a new infarct. Ischaemia is in the background — not tonight’s trigger.' },
          { id: 'pneu', label: 'Pneumonia with sepsis', verdict: 'wrong', points: 0, why: 'Afebrile, symmetrical oedema, raised JVP, an S3, NT-proBNP 7,850.' },
        ]} />

      <Why title="🧲 Why a normal valve leaks in a big ventricle"
        chain={[
          { k: 'SCAR', t: 'The 2019 infarct left the inferior and inferolateral wall thin and akinetic.' },
          { k: 'REMODEL', t: 'The ventricle dilates and turns spherical to keep its stroke volume up.' },
          { k: 'PULLED APART', t: 'The papillary muscles move down and outwards with the wall they sit on.' },
          { k: 'TETHERED', t: 'Through the chords they pull the leaflet tips down into the LV: the leaflets cannot reach each other.' },
          { k: 'WEAK CLOSURE', t: 'A slow, dyssynchronous (LBBB) contraction generates too little force to push them shut.' },
          { k: 'THE LEAK', t: 'Normal leaflets, normal chords — and a central gap every systole.' },
        ]}>
        Everything that makes the ventricle smaller and more synchronous will shrink this leak. That is the whole case in one line.
      </Why>
      <Contrast title="🔀 secondary vs primary mitral regurgitation"
        is={{ h: 'Secondary (functional) — his', points: ['The valve is normal; the ventricle (or the atrium) is not.', 'Carpentier IIIb: leaflets restricted in systole by tethering.', 'Treat the ventricle first: the four pillars and CRT.', 'Fix the leak only if it stays severe on optimal therapy.'] }}
        isnt={{ h: 'Primary (degenerative) — Case 02', points: ['The valve itself is broken: prolapse, flail, perforation.', 'Carpentier II: excessive motion.', 'Repair the valve and the disease is cured.', 'Drugs cannot reattach a chord.'] }} />
      <Contrast title="🔊 the soft murmur of a weak ventricle vs the loud murmur of a strong one"
        is={{ h: 'Severe secondary MR', points: ['Often soft (2/6) — the LV cannot generate much pressure.', 'Can be nearly silent when he is wettest.', 'Quantify it on echo; never grade it by ear.'] }}
        isnt={{ h: 'Severe primary MR in a healthy LV', points: ['Loud (often ≥ 3/6), holosystolic, to the axilla.', 'A strong ventricle drives a fast jet.', 'Loudness roughly tracks severity — here it does not.'] }} />

      <MultiSelect id="s1-tx" question="The first hour. He is warm and wet, systolic 102. What do you do?"
        items={[
          { id: 'up', label: 'Sit him up; oxygen to SpO₂ 94–98% — CPAP/NIV if he tires', correct: true, why: 'Oxygen only because he is hypoxaemic (88%). Positive pressure also lowers LV afterload.' },
          { id: 'diur', label: 'IV furosemide', correct: true, why: 'Venodilates in minutes; offloads salt and water over hours. A smaller LV is a less tethered valve.' },
          { id: 'bb', label: 'Continue bisoprolol 1.25 mg', correct: true, why: 'Decompensated but perfusing: stopping a beta-blocker raises in-hospital and post-discharge mortality. Hold it only in shock or bradycardia.' },
          { id: 'echo', label: 'Bedside echo tonight; formal echo tomorrow', correct: true, why: 'LV size and function, the MR, the RV, an effusion — and nothing mechanical that needs a surgeon tonight.' },
          { id: 'fluid', label: 'A fluid bolus — his systolic is only 102', correct: false, why: 'His lungs are full and his JVP is at his ears. 102 is his usual pressure.' },
          { id: 'gtn', label: 'An IV nitrate infusion', correct: false, why: 'Vasodilators are for systolic > 110 mmHg. At 102 he has no room — and you will need the pressure for the drugs that save his life.' },
          { id: 'arni', label: 'Switch ramipril to sacubitril/valsartan tonight', correct: false, why: 'Right drug, wrong night: start it once he is stable, 36 h after the last ramipril dose.' },
        ]} />
      <Decision id="s1-diur" question="He takes furosemide 40 mg orally every day. What IV dose now?"
        options={[
          { id: '80', label: '80 mg IV bolus (twice his oral dose); spot urine sodium at 2 h and urine output at 6 h; double the dose if the response is poor', verdict: 'best', points: 10,
            why: 'Chronic loop users need 1–2× their daily oral dose IV. Adequate response: urine Na⁺ > 50–70 mmol/L at 2 h or > 100–150 mL/h at 6 h (ESC 2021 HF algorithm).' },
          { id: '40', label: '40 mg IV once', verdict: 'ok', points: 5, why: 'Within the range, but at the bottom of it for a man on 40 mg daily with gut oedema. Check the response either way.' },
          { id: '20', label: '20 mg IV — gently, his creatinine is up', verdict: 'wrong', points: 0, why: 'Underdosing decongestion is the commoner harm. His kidneys are congested, not dry: venous pressure is part of the creatinine rise.' },
        ]} />

      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>🚨 23:40</span>
          Only 150 mL of urine. He is clammy and muddled. Pressure 84/58, heart rate 116, hands cold to the wrist, lactate 3.9. Bedside echo: a big, barely moving LV, the MR jet now filling the atrium, a small RV. <b>Cold and wet — SCAI stage C cardiogenic shock.</b>
        </p>
      </div>
      <BedsideMonitor />
      <Decision id="s1-shock" question="What now?"
        onAnswer={() => setVitals({ sys: 98, dia: 62, hr: 104, spo2: 95 })}
        options={[
          { id: 'dob', label: 'Hold bisoprolol; start dobutamine 2.5 µg/kg/min and titrate; call the shock team; if pressure stays low add noradrenaline — never alone — and consider an intra-aortic balloon pump or Impella', verdict: 'best', points: 10,
            why: 'Low output, not low tone, is the problem. Dobutamine adds contractility with mild vasodilation, and lower afterload lets more of each beat leave forwards instead of back through the leak. A balloon pump does the same mechanically.' },
          { id: 'nor', label: 'Noradrenaline alone to a MAP of 65', verdict: 'ok', points: 3,
            why: 'Sometimes needed to keep the brain and coronaries perfused — but pure vasoconstriction raises aortic resistance and pushes more blood back into the LA. Pair it with an inotrope or mechanical offloading.' },
          { id: 'fluid', label: '500 mL fluid bolus', verdict: 'wrong', points: 0, why: 'His LV is full to bursting; fluid stretches it further, widens the annulus, worsens the MR.' },
          { id: 'gtn', label: 'Nitrate infusion to offload him', verdict: 'wrong', points: 0, why: 'The right physiology in a patient with a pressure to spare. He has none.' },
        ]} />
      {answers['s1-shock'] && <Note kind="pearl" title="⏱️ 01:30">Dobutamine 5 µg/kg/min, bisoprolol held, furosemide infusion. Pressure 98/62, warm hands, lactate 2.2, 160 mL/h of urine. To the coronary care unit. Weaned off dobutamine on day 3.</Note>}
      <Why title="🚪 Why dobutamine and a balloon send blood forwards"
        chain={[
          { k: 'TWO EXITS', t: 'Each systole the LV empties into the aorta and, through the leak, into the low-pressure LA.' },
          { k: 'BLOOD CHOOSES', t: 'The share that goes each way depends on the resistance in front of it.' },
          { k: 'LOWER AFTERLOAD', t: 'Dobutamine (β₂ vasodilation) or a balloon deflating in systole makes the forward exit easier.' },
          { k: 'MORE FORWARD', t: 'Forward stroke volume rises, LA pressure and the v-wave fall — even before the valve is touched.' },
        ]}>
        Noradrenaline alone does the opposite: a better number on the monitor, more blood going backwards.
      </Why>
      <Contrast title="🫀 decompensated heart failure vs cardiogenic shock"
        is={{ h: 'Warm and wet (21:10)', points: ['Perfusing: warm hands, normal lactate, alert.', 'Diuretics, oxygen; CONTINUE the beta-blocker.', 'Vasodilators only if systolic > 110.'] }}
        isnt={{ h: 'Cold and wet (23:40)', points: ['Hypoperfusion: cold, confused, oliguric, lactate rising.', 'Hold the beta-blocker; inotrope; shock team.', 'Mechanical support if drugs fail — and look for a fixable cause.'] }} />

      <div className="cs-media-row">
        <Figure src={WIKI('Mitral_Valve_Regurgitation.png')} href={WIKIPAGE('Mitral_Valve_Regurgitation.png')} alt="Illustration of mitral valve regurgitation" caption="Mitral regurgitation: blood leaks back from the left ventricle to the left atrium in systole." credit="BruceBlaus · Wikimedia Commons · CC BY-SA 4.0" />
        <Video id="L_8pDi0pEmE" title="Mitral regurgitation pathophysiology" />
      </div>
    </>
  );
}

/* ============================================================
   2 · ECHO — MEASURE THE LEAK, THEN WEIGH IT AGAINST THE VENTRICLE
   ============================================================ */

function Echo() {
  const { answers, answer } = useCase();
  const m = answers['s2-pisa'];
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Transthoracic echo · CCU, day 3 (off dobutamine, 4 kg lighter)</div>
        <Table head={['', 'Finding']} rows={[
          ['LV', 'Dilated and spherical: LVEDV 238 mL (118 mL/m²), LVESV 171 mL, EF 28% (biplane); LVEDD 68 mm, LVESD 59 mm'],
          ['Walls', 'Inferior and inferolateral akinesis with thinning; septal flash from the LBBB'],
          ['Mitral valve', 'Thin, mobile leaflets. Both pulled into the LV: tenting height 11 mm, tenting area 2.4 cm²; posterior leaflet restricted. Central jet.'],
          ['Left atrium', N('LAVi 58 mL/m²', 'cs-hi')], ['PA systolic pressure', N('48 mmHg', 'cs-hi')],
          ['RV', 'TAPSE 17 mm — low-normal'], ['LVOT forward stroke volume', N('44 mL', 'cs-lo')],
        ]} />
      </div>

      <div className="cs-h2">📏 PISA — on a tethered valve</div>
      <p className="cs-p">The hemisphere forms below the coaptation point, which is pulled down into the LV. Set the baseline, put the caliper on the first aliasing boundary, and measure.</p>
      <FunctionalPISA onMeasure={r => answer('s2-pisa', r)} />
      {m && (
        <div className={'cs-fb ' + (m.close ? 'best' : 'ok')}>
          r {m.r.toFixed(2)} cm at {m.va} cm/s → EROA {m.eroa.toFixed(2)} cm², regurgitant volume {Math.round(m.rvol)} mL, regurgitant fraction {Math.round(m.rf * 100)}%. {m.close
            ? 'On the boundary. Severe secondary MR: EROA ≥ 0.40 cm² and RF ≥ 50% — even though the regurgitant volume is under 60 mL, because his total stroke volume is small.'
            : 'Off the boundary — r is squared, so a 2 mm error moves the EROA by a third. Measure from the coaptation point to the first red → blue change.'}
        </div>
      )}
      <ScoreOnce id="s2-pisa" pts={m == null ? null : m.close ? 12 : 4} max={12} />
      <Why title="📉 Why severe secondary MR can carry “only” 55 mL"
        chain={[
          { k: 'SMALL PUMP', t: 'An EF of 28% moves little blood each beat: total stroke volume ~ 100 mL.' },
          { k: 'LOW DRIVING PRESSURE', t: 'A weak LV generates a lower LV–LA gradient, so a given hole lets through less.' },
          { k: 'BIG SHARE', t: '55 mL of 100 is more than half his output — a regurgitant fraction of 55%.' },
          { k: 'THRESHOLDS', t: 'Severe: EROA ≥ 0.40 cm², RVol ≥ 60 mL, RF ≥ 50%. In low flow, EROA ≥ 0.30 cm² or RVol ≥ 45 mL may already be severe — integrate.' },
        ]} />
      <Why title="🌙 Why PISA underestimates a functional orifice"
        chain={[
          { k: 'CRESCENT', t: 'A tethered valve leaks along the whole coaptation line: a long, thin, crescent-shaped orifice.' },
          { k: 'HEMISPHERE ASSUMED', t: 'PISA assumes a round hole with a hemispherical shell of flow above it.' },
          { k: 'FLATTENED SHELL', t: 'Over a slit the shell is a half-cylinder, flatter in one view than the other.' },
          { k: 'UNDER-CALLED', t: 'Single-view PISA underestimates. Cross-check with RF, 3D vena contracta area, pulmonary veins.' },
        ]} />
      <PulmonaryVein reversal />
      <MultiSelect id="s2-sev" question="Which findings support SEVERE mitral regurgitation in him?"
        items={[
          { id: 'eroa', label: 'EROA 0.42 cm²', correct: true, why: '≥ 0.40 cm².' },
          { id: 'rf', label: 'Regurgitant fraction 55%', correct: true, why: '≥ 50%: most of what the LV ejects goes backwards.' },
          { id: 'pv', label: 'Systolic flow reversal in the pulmonary veins', correct: true, why: 'Specific for severe MR.' },
          { id: 'vc', label: 'Vena contracta 7 mm (biplane average)', correct: true, why: '≥ 7 mm — average two planes, because the orifice is a slit.' },
          { id: 'tent', label: 'Tenting height 11 mm', correct: false, why: 'Tells you the MECHANISM (tethering) and predicts a less durable repair — not the severity.' },
          { id: 'soft', label: 'A soft, 2/6 murmur', correct: false, why: 'Murmur loudness does not grade secondary MR.' },
        ]} />
      <Decision id="s2-carp" question="Carpentier class of his mitral lesion?"
        options={[
          { id: '3b', label: 'Type IIIb — leaflet motion restricted in systole by tethering', verdict: 'best', points: 8, why: 'Ischaemic secondary MR with a restricted posterior leaflet: the classic IIIb.' },
          { id: '1', label: 'Type I — normal motion, annular dilatation', verdict: 'ok', points: 3, why: 'Annular dilatation contributes, and it is the main mechanism in ATRIAL functional MR — but his leaflets are pulled down, not just apart.' },
          { id: '2', label: 'Type II — excessive motion', verdict: 'wrong', points: 0, why: 'Prolapse and flail: Case 02.' },
        ]} />

      <div className="cs-h2">⚖️ Is the leak in proportion to the ventricle?</div>
      <p className="cs-p">A large ventricle with a low EF makes some MR <i>expected</i>. The question for TEER is whether the leak adds a load the ventricle would not otherwise carry. Pick a patient — or drag the sliders — and watch where the dot sits against the curve.</p>
      <ProportionPlot presets={PROPORTION_PRESETS} />
      <Decision id="s2-trials" question="COAPT showed fewer deaths and admissions with TEER; MITRA-FR showed nothing. The most likely reason?"
        options={[
          { id: 'prop', label: 'COAPT patients had more MR for smaller ventricles (EROA 0.41 cm², LVEDV ~190 mL) — disproportionate — on stricter, maximally tolerated GDMT, with better procedural results; MITRA-FR patients had bigger ventricles and less MR (0.31 cm², ~250 mL) — the ventricle dominated', verdict: 'best', points: 10,
            why: 'Grayburn’s proportionality hypothesis. It explains much of the difference, but it is debated: later COAPT analyses did not find a clear interaction with LV volume. Use it as a way of thinking, not a rule.' },
          { id: 'device', label: 'Different devices were used', verdict: 'wrong', points: 0, why: 'Both used the MitraClip.' },
          { id: 'chance', label: 'Pure chance', verdict: 'wrong', points: 0, why: 'The populations were measurably different.' },
        ]} />
      <Decision id="s2-now" question="On today’s echo, should he be referred for TEER this week?"
        options={[
          { id: 'wait', label: 'No — decongest, start and up-titrate the four pillars, implant CRT, and re-measure the MR after about three months of optimal therapy', verdict: 'best', points: 10,
            why: 'This is a wet, under-treated, dyssynchronous ventricle. Secondary MR falls as the LV shrinks; in many patients it stops being severe. Guidelines and the COAPT entry criteria require MR that persists on optimised therapy.' },
          { id: 'yes', label: 'Yes — it is severe and disproportionate', verdict: 'wrong', points: 2, why: 'Severe today, in the worst version of his ventricle. You would be clipping a leak that drugs and a pacemaker might shrink.' },
        ]} />
      <Contrast title="🌊 measured wet vs measured on optimal therapy"
        is={{ h: 'Day 3, after shock', points: ['Big, wet, dyssynchronous LV.', 'Maximal tethering and annular stretch.', 'MR at its worst — a moving target.'] }}
        isnt={{ h: 'After 3 months of GDMT + CRT', points: ['Smaller, synchronous LV.', 'The papillary muscles move back in.', 'The MR that remains is the MR to treat.'] }} />
      <Contrast title="📊 disproportionate vs proportionate secondary MR"
        is={{ h: 'Disproportionate (COAPT-like)', points: ['More EROA than the LV size predicts.', 'The leak adds a load of its own.', 'Fixing it can help the ventricle.'] }}
        isnt={{ h: 'Proportionate (MITRA-FR-like)', points: ['The MR is what that ventricle would make anyway.', 'A clip removes a symptom of the disease, not the disease.', 'Think advanced heart failure therapies.'] }} />

      <div className="cs-media-row">
        <Video id="S7z5qpNmluY" title="Quantifying mitral regurgitation using the PISA method" />
        <Video id="dxwFlkNXscE" title="Disproportionate functional mitral regurgitation and heart failure — keynote (A. Hagendorff)" />
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
        <div className="cs-h2" style={{ marginTop: 0 }}>👥 Heart team · day 6 (euvolaemic, NYHA III)</div>
        <Table head={['', 'Finding']} rows={[
          ['Coronary angiography', 'Chronic total occlusion of the RCA with collaterals; mild LAD and circumflex disease'],
          ['Cardiac MRI', 'Transmural (> 75%) scar of the inferior and inferolateral walls — non-viable; no other scar'],
          ['ECG', 'Sinus rhythm, LBBB, QRS 162 ms'],
          ['Medication', 'Ramipril 2.5 mg, bisoprolol 1.25 mg — a quarter and an eighth of target; no MRA; no SGLT2 inhibitor'],
          ['Surgical risk', 'STS mortality for mitral surgery 6.8%'],
          ['His wish', '“My granddaughter graduates in June. I want to climb the stairs to the hall.”'],
        ]} />
      </div>
      <Decision id="s3-plan" question="The team’s plan for the MR?"
        options={[
          { id: 'gdmt', label: 'Treat the ventricle first: all four pillars, up-titrated fast; CRT-D for LBBB ≥ 150 ms; reassess the MR after about three months — TEER then if it is still severe', verdict: 'best', points: 10,
            why: 'Secondary MR: optimal medical therapy (including CRT when indicated) before any valve intervention (ESC/EACTS 2025 VHD; ESC 2021 HF). No revascularisation target, so there is no concomitant bypass surgery to add a mitral procedure to.' },
          { id: 'teer', label: 'TEER on this admission', verdict: 'wrong', points: 2, why: 'Before a single pillar is at dose and before resynchronisation, you cannot know how much of this MR will remain.' },
          { id: 'surg', label: 'Isolated surgical mitral repair or replacement', verdict: 'wrong', points: 0, why: 'Isolated surgery for secondary MR without a bypass target is a weak recommendation with no proven survival benefit — and repairs of tethered valves often recur.' },
          { id: 'none', label: 'Diuretics only — the MR is just a marker', verdict: 'wrong', points: 1, why: 'He is on almost none of the drugs that make HFrEF patients live longer.' },
        ]} />
      <Why title="🔧 Why fixing the ventricle can fix the valve"
        chain={[
          { k: 'GDMT', t: 'Beta-blocker, ARNI, MRA and SGLT2i lower wall stress and neurohormonal drive.' },
          { k: 'REVERSE REMODELLING', t: 'Over months the LV shrinks and becomes less spherical.' },
          { k: 'CRT', t: 'Resynchronises the papillary muscles and raises the force that closes the valve (LV dP/dt).' },
          { k: 'LESS TETHERING', t: 'The papillary muscles move back towards the annulus; the leaflets reach each other again.' },
          { k: 'LESS MR', t: 'In a third or more of patients, MR stops being severe.' },
        ]} />
      <MultiSelect id="s3-crt" question="Which of his features make CRT a class I indication?"
        items={[
          { id: 'lbbb', label: 'Left bundle branch block morphology', correct: true, why: 'The pattern that responds best — the LV free wall activates last.' },
          { id: 'qrs', label: 'QRS ≥ 150 ms', correct: true, why: 'His is 162 ms.' },
          { id: 'ef', label: 'LVEF ≤ 35%', correct: true, why: '28%.' },
          { id: 'symp', label: 'Symptomatic despite optimal medical therapy', correct: true, why: 'The device is added to the drugs, not instead of them.' },
          { id: 'mr', label: 'The MR must be fixed first', correct: false, why: 'The other way round: CRT may reduce the MR.' },
          { id: 'rbbb', label: 'Right bundle branch block would qualify equally', correct: false, why: 'Non-LBBB morphologies respond far less; they need QRS ≥ 150 ms and the indication is weaker.' },
        ]} />
      <Decision id="s3-dev" question="CRT-D or CRT-P?"
        options={[
          { id: 'd', label: 'CRT-D: ischaemic cardiomyopathy, EF ≤ 35% after optimal therapy, good functional status and expected survival > 1 year', verdict: 'best', points: 10,
            why: 'Scar is the substrate for ventricular tachycardia; the defibrillator component protects against sudden death. The decision is confirmed after ~3 months of optimal therapy (ESC 2022 VA, 2021 pacing).' },
          { id: 'p', label: 'CRT-P', verdict: 'ok', points: 5, why: 'Reasonable in older, frailer or non-ischaemic patients (DANISH) or when the patient does not want shocks — not first choice for him.' },
          { id: 'icd', label: 'ICD alone', verdict: 'wrong', points: 0, why: 'Leaves the LBBB dyssynchrony — and the MR it worsens — untreated.' },
        ]} />
      <Decision id="s3-talk" question="He asks: “Why not just fix the valve now, doctor?”"
        options={[
          { id: 'honest', label: '“Your valve is healthy — it’s being pulled open because your heart has stretched. Tablets and a special pacemaker can shrink the heart and often shrink the leak. If it’s still bad in three months, a clip through the vein in your leg is a real option.”', verdict: 'best', points: 8,
            why: 'Explains the mechanism in his words, the plan, and the next step — and leaves the clip on the table.' },
          { id: 'no', label: '“The valve doesn’t matter.”', verdict: 'wrong', points: 0, why: 'Untrue — and he will lose faith in a plan he does not understand.' },
          { id: 'stats', label: 'A summary of COAPT and MITRA-FR', verdict: 'ok', points: 3, why: 'Accurate, but answer his question first.' },
        ]} />
      <Contrast title="🧭 secondary MR: ventricle first vs primary MR: valve first"
        is={{ h: 'Secondary', points: ['GDMT and CRT first, months not days.', 'Re-measure, then intervene on what is left.', 'TEER for severe, persistent MR in selected patients.'] }}
        isnt={{ h: 'Primary', points: ['Intervene on symptoms or triggers (EF ≤ 60%, LVESD ≥ 40 mm).', 'Drugs do not change the lesion.', 'Repair is curative.'] }} />
      <Video id="h-FBjvfl1UA" title="Secondary mitral regurgitation: a new target in heart failure (A. Reshad Garan, MD)" />
    </>
  );
}

/* ============================================================
   4 · PLANNING — THE FOUR PILLARS, VISIT BY VISIT
   ============================================================ */

const GDMT_START = {
  meds: { bb: ['Bisoprolol 1.25 mg od', 0.125], ras: ['Ramipril 2.5 mg od', 0.25], mra: ['—', 0], sglt: ['—', 0] },
  loop: 'Furosemide 40 mg bd', cr: 128,
};
const M = (bb, bbf, ras, rasf, mra, mraf, sg) => ({ bb: [bb, bbf], ras: [ras, rasf], mra: [mra, mraf], sglt: sg ? ['Dapagliflozin 10 mg od', 1] : ['—', 0] });
const GDMT_VISITS = [
  { when: 'Day 5 · ward', obs: { sbp: 106, dbp: 68, hr: 88, k: 4.6, cr: 128, wt: 82 },
    story: 'Euvolaemic, walking the ward. Ramipril 2.5 mg, bisoprolol 1.25 mg, furosemide 40 mg twice daily. Home in two days.',
    options: [
      { id: 'four', verdict: 'best', points: 4, label: 'Before he goes home: add dapagliflozin 10 mg and spironolactone 25 mg; stop ramipril and start sacubitril/valsartan 24/26 mg bd 36 h later; keep bisoprolol 1.25 mg',
        meds: M('Bisoprolol 1.25 mg od', 0.125, 'Sac/val 24/26 mg bd', 0.25, 'Spironolactone 25 mg od', 0.5, true), loop: 'Furosemide 40 mg bd',
        why: 'All four pillars started at low dose, in hospital. SGLT2 inhibitors and MRAs barely lower blood pressure, and their benefit starts within weeks. The 36-hour ACE-inhibitor washout prevents angioedema.' },
      { id: 'seq', verdict: 'ok', points: 2, label: 'Up-titrate bisoprolol; add the other drugs one at a time, a month apart',
        meds: M('Bisoprolol 2.5 mg od', 0.25, 'Ramipril 2.5 mg od', 0.25, '—', 0, false), loop: 'Furosemide 40 mg bd',
        why: 'The old “one drug at a time” sequence takes six months to reach four drugs — and the first months after a heart failure admission are the most dangerous.' },
      { id: 'both', verdict: 'wrong', points: 0, label: 'Start sacubitril/valsartan today alongside the ramipril',
        meds: M('Bisoprolol 1.25 mg od', 0.125, 'Ramipril + sac/val (!)', 0.5, '—', 0, false), loop: 'Furosemide 40 mg bd',
        why: 'ACE inhibitor plus neprilysin inhibitor: bradykinin accumulates — angioedema. Never together; 36 h apart.' },
      { id: 'stopbb', verdict: 'wrong', points: 0, label: 'Stop bisoprolol — his EF is 28% and he has just decompensated',
        meds: M('—', 0, 'Ramipril 2.5 mg od', 0.25, '—', 0, false), loop: 'Furosemide 40 mg bd',
        why: 'He is no longer shocked. Withdrawing a beta-blocker at discharge raises mortality; restart and keep it.' },
    ] },
  { when: 'Week 2 · HF clinic', obs: { sbp: 102, dbp: 64, hr: 84, k: 5.1, cr: 146, wt: 80 },
    story: 'Feels better. No oedema, chest clear, JVP not seen. Creatinine 128 → 146 µmol/L (+14%). K⁺ 5.1.',
    options: [
      { id: 'up', verdict: 'best', points: 4, label: 'Bisoprolol to 2.5 mg; furosemide down to 40 mg once daily (he is dry); keep everything else; bloods in 1–2 weeks',
        meds: M('Bisoprolol 2.5 mg od', 0.25, 'Sac/val 24/26 mg bd', 0.25, 'Spironolactone 25 mg od', 0.5, true), loop: 'Furosemide 40 mg od',
        why: 'A creatinine rise of up to ~30% after starting RAS inhibitors, MRAs or SGLT2 inhibitors is haemodynamic and expected. K⁺ ≤ 5.5: carry on. Cutting the diuretic in a dry patient makes room for the drugs that matter.' },
      { id: 'sglt', verdict: 'wrong', points: 0, label: 'Stop dapagliflozin — the creatinine is rising',
        meds: M('Bisoprolol 1.25 mg od', 0.125, 'Sac/val 24/26 mg bd', 0.25, 'Spironolactone 25 mg od', 0.5, false), loop: 'Furosemide 40 mg bd',
        why: 'The early eGFR dip on an SGLT2 inhibitor is the kidney being protected (lower glomerular pressure). Long-term, the eGFR falls more slowly.' },
      { id: 'mra', verdict: 'wrong', points: 0, label: 'Stop spironolactone — K⁺ is 5.1',
        meds: M('Bisoprolol 1.25 mg od', 0.125, 'Sac/val 24/26 mg bd', 0.25, '—', 0, true), loop: 'Furosemide 40 mg bd',
        why: 'ESC: continue the MRA if K⁺ ≤ 5.5; halve it at 5.5–6.0; stop it above 6.0.' },
      { id: 'wait', verdict: 'ok', points: 2, label: 'Change nothing for a month',
        meds: M('Bisoprolol 1.25 mg od', 0.125, 'Sac/val 24/26 mg bd', 0.25, 'Spironolactone 25 mg od', 0.5, true), loop: 'Furosemide 40 mg bd',
        why: 'Safe, but STRONG-HF showed that rapid up-titration with visits every 1–2 weeks cut death and readmission at 6 months.' },
    ] },
  { when: 'Week 4', obs: { sbp: 112, dbp: 70, hr: 76, k: 4.8, cr: 140, wt: 79.5 },
    story: 'Walking to the shops. Sinus 76. Pressure 112/70. Nothing hurts, nothing swells.',
    options: [
      { id: 'two', verdict: 'best', points: 4, label: 'Sacubitril/valsartan to 49/51 mg bd and bisoprolol to 5 mg',
        meds: M('Bisoprolol 5 mg od', 0.5, 'Sac/val 49/51 mg bd', 0.5, 'Spironolactone 25 mg od', 0.5, true), loop: 'Furosemide 40 mg od',
        why: 'Stable pressure, heart rate and potassium: two steps at once is safe and gets him to target sooner.' },
      { id: 'one', verdict: 'ok', points: 2, label: 'Up-titrate one drug only',
        meds: M('Bisoprolol 5 mg od', 0.5, 'Sac/val 24/26 mg bd', 0.25, 'Spironolactone 25 mg od', 0.5, true), loop: 'Furosemide 40 mg od',
        why: 'Fine, but slower than he can tolerate.' },
      { id: 'iva', verdict: 'wrong', points: 0, label: 'Add ivabradine instead of up-titrating bisoprolol',
        meds: M('Bisoprolol 2.5 mg od + ivabradine', 0.25, 'Sac/val 24/26 mg bd', 0.25, 'Spironolactone 25 mg od', 0.5, true), loop: 'Furosemide 40 mg od',
        why: 'Ivabradine is for sinus rates ≥ 70 DESPITE the maximum tolerated beta-blocker — not a substitute for one.' },
    ] },
  { when: 'Week 6', obs: { sbp: 92, dbp: 58, hr: 64, k: 5.0, cr: 142, wt: 78.5 },
    story: 'Dizzy on standing; standing pressure 84/52. Ten days ago his GP started tamsulosin 400 µg for prostatism. Dry tongue; weight still falling.',
    options: [
      { id: 'room', verdict: 'best', points: 4, label: 'Stop the tamsulosin (ask urology/GP for an alternative) and cut furosemide to 20 mg; keep every pillar at its current dose',
        meds: M('Bisoprolol 5 mg od', 0.5, 'Sac/val 49/51 mg bd', 0.5, 'Spironolactone 25 mg od', 0.5, true), loop: 'Furosemide 20 mg od',
        why: 'Make room for the prognostic drugs: remove blood-pressure-lowering drugs that do not save lives (an alpha-blocker) and excess diuretic in a dry patient first.' },
      { id: 'arni', verdict: 'wrong', points: 0, label: 'Stop sacubitril/valsartan',
        meds: M('Bisoprolol 5 mg od', 0.5, '—', 0, 'Spironolactone 25 mg od', 0.5, true), loop: 'Furosemide 40 mg od',
        why: 'Removes a life-saving drug and leaves the two culprits in place.' },
      { id: 'half', verdict: 'ok', points: 1, label: 'Halve bisoprolol',
        meds: M('Bisoprolol 2.5 mg od', 0.25, 'Sac/val 49/51 mg bd', 0.5, 'Spironolactone 25 mg od', 0.5, true), loop: 'Furosemide 40 mg od',
        why: 'Beta-blockers cause little postural hypotension; the tamsulosin and the diuretic do.' },
    ] },
  { when: 'Week 8', obs: { sbp: 106, dbp: 66, hr: 66, k: 5.8, cr: 168, wt: 79 },
    story: 'K⁺ 5.8, creatinine 168. On questioning: ibuprofen 400 mg three times a day for a painful knee, and a “low-sodium” salt substitute his daughter bought him.',
    options: [
      { id: 'cause', verdict: 'best', points: 4, label: 'Stop the ibuprofen and the salt substitute; halve spironolactone (25 mg alternate days); repeat K⁺ in 72 h; a potassium binder if it stays high, to keep the RAAS drugs',
        meds: M('Bisoprolol 5 mg od', 0.5, 'Sac/val 49/51 mg bd', 0.5, 'Spironolactone 25 mg alt days', 0.25, true), loop: 'Furosemide 20 mg od',
        why: 'NSAIDs cut renal blood flow and potassium excretion; salt substitutes are potassium chloride. K⁺ 5.5–6.0 on an MRA: halve it. Binders (patiromer, sodium zirconium cyclosilicate) let patients stay on RAAS inhibitors.' },
      { id: 'stopall', verdict: 'wrong', points: 0, label: 'Stop sacubitril/valsartan and spironolactone for good',
        meds: M('Bisoprolol 5 mg od', 0.5, '—', 0, '—', 0, true), loop: 'Furosemide 20 mg od',
        why: 'The commonest way patients lose their life-saving drugs — and the cause (the NSAID) is still there.' },
      { id: 'cont', verdict: 'wrong', points: 0, label: 'Carry on; recheck in a month',
        meds: M('Bisoprolol 5 mg od', 0.5, 'Sac/val 49/51 mg bd', 0.5, 'Spironolactone 25 mg od', 0.5, true), loop: 'Furosemide 20 mg od',
        why: 'K⁺ 5.8 with a rising creatinine and an NSAID on board will not wait a month.' },
      { id: 'mraonly', verdict: 'ok', points: 2, label: 'Stop spironolactone, keep the rest; recheck in a week',
        meds: M('Bisoprolol 5 mg od', 0.5, 'Sac/val 49/51 mg bd', 0.5, '—', 0, true), loop: 'Furosemide 20 mg od',
        why: 'Too much: ESC says halve at 5.5–6.0. And you have not removed the ibuprofen.' },
    ] },
];

function Planning() {
  const { answers, answer } = useCase();
  const r = answers['s4-gdmt'];
  return (
    <>
      <p className="cs-p">You run his heart-failure clinic for eight weeks. At each visit the board shows his drugs as bars towards their target doses, and the numbers that limit them. One decision per visit.</p>
      <GdmtBoard visits={GDMT_VISITS} start={GDMT_START} done={r} onDone={res => answer('s4-gdmt', res)} />
      <ScoreOnce id="s4-gdmt" pts={r == null ? null : r.got} max={20} />
      {r && <Note kind="pearl" title="🗓️ Week 12">K⁺ 4.9 after stopping the ibuprofen. Bisoprolol 10 mg, sacubitril/valsartan 97/103 mg twice daily, spironolactone 25 mg, dapagliflozin 10 mg — all four pillars at (or near) target. Sinus 64, pressure 108/66, creatinine 150.</Note>}
      <Why title="🏛️ Why four drugs at low dose beat one drug at full dose"
        chain={[
          { k: 'FOUR SYSTEMS', t: 'Sympathetic drive, angiotensin, aldosterone and the kidney’s sodium–glucose handling each push the LV to remodel.' },
          { k: 'ADDITIVE', t: 'Each drug blocks a different one; the benefits add up (≈ 60% lower mortality together vs none).' },
          { k: 'EARLY', t: 'SGLT2 inhibitors and MRAs cut events within 30 days — even at their starting dose.' },
          { k: 'THE VULNERABLE PHASE', t: 'The 90 days after discharge carry the most deaths and readmissions. Start everything; then titrate.' },
        ]} />
      <Contrast title="🚀 rapid, parallel start vs slow sequential titration"
        is={{ h: 'Rapid (STRONG-HF, ESC 2023)', points: ['All four classes started in hospital or within days.', 'Visits every 1–2 weeks: BP, HR, K⁺, creatinine, NT-proBNP.', 'Target doses within about 6 weeks.'] }}
        isnt={{ h: 'Sequential', points: ['One drug to target, then the next.', 'Six months to four drugs.', 'Many never get there.'] }} />
      <Note kind="evid" title="📚 STRONG-HF (2022)">After an acute HF admission, high-intensity care — half-target doses before discharge, full targets within two weeks, close follow-up — reduced death or HF readmission at 180 days (15.2% vs 23.3%).</Note>
      <Decision id="s4-iron" question="Ferritin 64 µg/L, transferrin saturation 15%, haemoglobin 128 g/L. What about the iron?"
        options={[
          { id: 'iv', label: 'Intravenous iron (ferric carboxymaltose or ferric derisomaltose)', verdict: 'best', points: 10,
            why: 'Iron deficiency in HF: ferritin < 100 µg/L, or 100–299 µg/L with TSAT < 20% — anaemia or not. IV iron improves symptoms and reduces HF hospitalisation (ESC 2023).' },
          { id: 'oral', label: 'Ferrous sulphate 200 mg daily', verdict: 'wrong', points: 2, why: 'Hepcidin and gut oedema stop it being absorbed; IRONOUT-HF showed no effect.' },
          { id: 'none', label: 'Nothing — he is not anaemic', verdict: 'wrong', points: 0, why: 'The muscles and myocardium need iron for oxidative metabolism, anaemia or not.' },
        ]} />
    </>
  );
}

/* ============================================================
   5 · SET-UP — CRT-D
   ============================================================ */

function Setup() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🗓️ Week 10</span>On all four pillars, near target. Still NYHA III, still LBBB 160 ms, EF 29%. Day-case CRT-D implant in the pacing lab.</p>
      </div>
      <MultiSelect id="s5-check" question="Before the incision: what must be in place?"
        items={[
          { id: 'abx', label: 'IV cefazolin within 60 minutes before the incision', correct: true, why: 'Device infection is the complication that kills; prophylaxis halves it.' },
          { id: 'k', label: 'K⁺ and creatinine today', correct: true, why: 'He is on an ARNI, MRA and SGLT2i — and contrast is coming for the venogram.' },
          { id: 'asp', label: 'Continue aspirin', correct: true, why: 'Single antiplatelet therapy can continue; stopping it buys little.' },
          { id: 'clip', label: 'Hair removed with clippers, not a razor; chlorhexidine–alcohol skin prep', correct: true, why: 'Razors leave micro-abrasions that infect.' },
          { id: 'bridge', label: 'Bridging heparin', correct: false, why: 'Bridging is the strongest risk factor for a pocket haematoma — which then infects.' },
          { id: 'stop', label: 'Stop the heart-failure drugs the night before', correct: false, why: 'No reason to; morning diuretic can be held for a lying-flat procedure.' },
        ]} />
      <Sequence id="s5-seq" question="Put the implant in order."
        steps={[
          { label: 'Axillary or cephalic venous access under fluoroscopy or ultrasound', why: 'Avoid subclavian crush.' },
          { label: 'RV defibrillator lead first', why: 'He has LBBB: a catheter bumping the right bundle during coronary sinus work gives complete heart block. An RV lead first is the safety net.' },
          { label: 'Cannulate the coronary sinus; occlusive venogram', why: 'Map the veins before choosing one.' },
          { label: 'LV lead to a lateral vein away from scar; test threshold and phrenic stimulation', why: 'Late-activated, viable myocardium; no diaphragm twitching.' },
          { label: 'Right atrial lead; connect, test, close the pocket', why: 'Atrial tracking keeps biventricular pacing at > 98%.' },
        ]} />
      <Decision id="s5-lv" question="The venogram shows a large posterolateral vein over his scarred inferolateral wall, and a good lateral vein higher up. Where does the LV lead go?"
        options={[
          { id: 'lat', label: 'The lateral vein: late-activated but VIABLE myocardium, away from the transmural scar, not apical', verdict: 'best', points: 10,
            why: 'Pacing scar captures nothing useful (or needs very high output). The target is the latest-activated viable segment, basal or mid, never apical.' },
          { id: 'pl', label: 'The posterolateral vein — it is the textbook target', verdict: 'wrong', points: 2, why: 'In him it sits on transmural scar on his MRI. Know the scar before you choose the vein.' },
          { id: 'apex', label: 'Wedge it at the apex for stability', verdict: 'wrong', points: 0, why: 'Apical LV pacing is linked to worse outcomes.' },
        ]} />
      <Why title="⚡ Why resynchronising the ventricle closes the valve"
        chain={[
          { k: 'LBBB', t: 'The septum contracts first, the lateral wall ~100 ms later.' },
          { k: 'PAPILLARY MISMATCH', t: 'The two papillary muscles pull at different moments; one leaflet tip is held down while the other moves.' },
          { k: 'SLOW PRESSURE RISE', t: 'A dyssynchronous LV builds pressure slowly: the closing force arrives late and weak.' },
          { k: 'CRT', t: 'Simultaneous septal and lateral activation: the leaflets are pushed shut together, harder, earlier.' },
          { k: 'ACUTE AND LATE', t: 'MR falls on day one (closing force) and again over months (reverse remodelling).' },
        ]} />
      <ECG12 rate={66} rhythm="paced" caption="After the implant: atrial-sensed, biventricular paced at 66/min. Pacing spikes before each QRS; the QRS is narrower than his native LBBB." />
      <Contrast title="🎯 a likely CRT responder vs a likely non-responder"
        is={{ h: 'Likely to respond', points: ['LBBB, QRS ≥ 150 ms.', 'Non-ischaemic, or scar away from the LV lead.', 'Sinus rhythm; biventricular pacing > 98%.'] }}
        isnt={{ h: 'Unlikely to respond', points: ['RBBB or QRS < 130 ms.', 'LV lead over transmural scar.', 'AF with fast conduction — pacing % falls.'] }} />
      <div className="cs-media-row">
        <Video id="FAGno7PZaQs" title="Cardiac resynchronization therapy — animation" />
        <Video id="Amq_s1YeDjI" title="HF4 — CRT therapy on–off–on animation" />
      </div>
    </>
  );
}

/* ============================================================
   6 · STRATEGY — THREE MONTHS LATER: CHOOSE YOUR PATH
   ============================================================ */

function Strategy() {
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🔁 Reassessment · 3 months after CRT</div>
        <Table head={['', 'Then (day 3)', 'Now']} rows={[
          ['Symptoms', 'NYHA IV', N('NYHA III — 150 m, then he stops', 'cs-hi')],
          ['Drugs', 'Ramipril 2.5, bisoprolol 1.25', 'Four pillars at target; furosemide 20 mg'],
          ['Biventricular pacing', '—', N('99%')],
          ['LVEDV · EF', '238 mL · 28%', N('196 mL · 31%')],
          ['LVESD', '59 mm', N('56 mm')],
          ['EROA · RVol · RF', '0.42 cm² · 55 mL · 55%', N('0.45 cm² · 58 mL · 54%', 'cs-hi')],
          ['PASP · TAPSE', '48 mmHg · 17 mm', N('46 mmHg · 18 mm')],
          ['Valve', '—', 'MVA 4.6 cm², mean gradient 1.5 mmHg, posterior leaflet 11 mm, no calcium; jet from A2/P2 into A3/P3'],
          ['NT-proBNP', '7,850', N('2,100 ng/L', 'cs-hi')],
        ]} />
      </div>
      <p className="cs-p">The ventricle shrank. The leak did not. Put his new numbers on the plot: <b>Mr Okafor · 3 months</b>.</p>
      <ProportionPlot presets={PROPORTION_PRESETS} initial={4} />
      <MultiSelect id="s6-sel" question="Which of his features match the patients who benefited from TEER in COAPT?"
        items={[
          { id: 'gdmt', label: 'Severe MR persisting on maximally tolerated GDMT and CRT', correct: true, why: 'The single most important entry criterion.' },
          { id: 'ef', label: 'LVEF 20–50%', correct: true, why: '31%.' },
          { id: 'lvesd', label: 'LVESD ≤ 70 mm', correct: true, why: '56 mm.' },
          { id: 'pasp', label: 'PASP ≤ 70 mmHg and no severe RV dysfunction', correct: true, why: 'A failing RV or fixed pulmonary hypertension predicts no benefit.' },
          { id: 'prop', label: 'MR disproportionate to LV size', correct: true, why: 'EROA/LVEDV 0.23 mm²/mL; 2.2× the expected EROA.' },
          { id: 'mva', label: 'Mitral valve area under 3.5 cm²', correct: false, why: 'Unfavourable: a small valve leaves no room for clips without stenosis. His is 4.6 cm².' },
        ]} />
      <Decision id="s6-path" question="The heart team’s path?"
        options={[
          { id: 'teer', label: 'Transcatheter edge-to-edge repair, continuing every heart-failure drug afterwards', verdict: 'best', points: 10,
            why: 'Severe, persistent, disproportionate secondary MR on optimal therapy, COAPT-like anatomy and ventricle: TEER reduces HF hospitalisation and, in COAPT, mortality (ESC/EACTS 2025: class I for such patients).',
            feedback: 'In COAPT, about 3 patients needed treatment over 2 years to prevent one HF hospitalisation.' },
          { id: 'surg', label: 'Isolated surgical mitral valve repair', verdict: 'wrong', points: 2, why: 'No bypass target, STS 6.8%, a tethered valve that recurs after annuloplasty. Surgery is weighed mainly when CABG is needed anyway.' },
          { id: 'lvad', label: 'Refer for LVAD or transplant work-up', verdict: 'ok', points: 3, why: 'Right for proportionate MR in an advanced ventricle (think Mrs Lindqvist) — he is not yet stage D.' },
          { id: 'meds', label: 'Continue medical therapy alone', verdict: 'wrong', points: 0, why: 'He has had optimal therapy and is still NYHA III with severe MR. Waiting is a choice with outcomes.' },
        ]} />
      <Decision id="s6-ga" question="On the procedural TOE under general anaesthesia the MR looks only moderate. You…"
        options={[
          { id: 'load', label: 'Restore his awake loading conditions (phenylephrine to his usual systolic pressure) and re-measure before deciding', verdict: 'best', points: 10,
            why: 'Anaesthesia lowers afterload and preload; a smaller, less loaded LV leaks less. Secondary MR is dynamic — measure it in the conditions he lives in.' },
          { id: 'cancel', label: 'Cancel — the MR is only moderate', verdict: 'wrong', points: 0, why: 'A war story below. His awake TTE and his symptoms have not changed.' },
          { id: 'go', label: 'Proceed on the strength of the awake TTE', verdict: 'ok', points: 5, why: 'Probably right — but confirm the target jet under loading you can trust.' },
        ]} />
      <Why title="😴 Why general anaesthesia hides functional MR"
        chain={[
          { k: 'VASODILATION', t: 'Anaesthetic agents drop systemic resistance and venous tone.' },
          { k: 'SMALLER LV', t: 'Less preload: the ventricle shrinks, the papillary muscles move in.' },
          { k: 'LOWER GRADIENT', t: 'Lower LV systolic pressure drives less blood through the same hole.' },
          { k: 'UNDER-CALLED', t: 'Severe awake becomes “moderate” asleep. Load him back up before you judge.' },
        ]} />
      <Decision id="s6-first" question="Where does the first clip go?"
        options={[
          { id: 'origin', label: 'At the jet origin over A2/P2, arms perpendicular to the coaptation line; then judge whether the medial (A3/P3) part needs a second clip', verdict: 'best', points: 10,
            why: 'Start where the regurgitant orifice is largest and the leaflets are longest. In a wide functional jet a second, adjacent clip is common.' },
          { id: 'med', label: 'At A3/P3 first — that is where the tethering is worst', verdict: 'ok', points: 4, why: 'The shortest, most tethered leaflet is the hardest place for the first grasp.' },
          { id: 'lat', label: 'At A1/P1, near the commissure', verdict: 'wrong', points: 0, why: 'There is no jet there.' },
        ]} />
      <Contrast title="🧷 what a clip does in secondary MR — and what it does not"
        is={{ h: 'Does', points: ['Removes the extra volume load the leak adds.', 'Lowers LA pressure and the v-wave.', 'Fewer HF admissions in the right patients.'] }}
        isnt={{ h: 'Does not', points: ['Treat the scar, the dilation or the LBBB.', 'Replace a single heart-failure drug.', 'Help a ventricle whose MR is only its symptom.'] }} />
    </>
  );
}

/* ============================================================
   7 · THE PROCEDURE — TEER FOR A WIDE FUNCTIONAL JET
   ============================================================ */

function Deploy() {
  const { answers, answer, setVitals } = useCase();
  const r = answers['s7-clip'];
  const grade = !r ? null : (r.mr === 'mild' || r.mr === 'trace') && r.gradient < 5 && r.minIns >= 6 ? 'best' : r.mr === 'severe' ? 'wrong' : 'ok';
  return (
    <>
      <p className="cs-p">Transseptal access done; the clip is above the valve. The jet runs from A2/P2 into A3/P3 — longer than one clip. Position, rotate, grasp, judge, release. Then decide: another clip, or stop?</p>
      <TetheredClip done={r} onResult={res => { answer('s7-clip', res); setVitals({ sys: 116, dia: 68, hr: 70, spo2: 99, rhythm: 'paced' }); }} />
      {r && (
        <div className={'cs-fb ' + grade}>
          {r.clips} clip{r.clips > 1 ? 's' : ''}: residual MR {r.mr}, mean gradient {r.gradient} mmHg, shallowest posterior insertion {r.minIns} mm, LA v-wave {r.vwave} mmHg.
          {grade === 'best' ? ' The jet is gone, the gradient is safe, the grasps are secure.'
            : r.gradient >= 5 ? ' You traded regurgitation for stenosis: the gradient is too high.'
            : r.minIns < 6 ? ' A shallow grasp on a tethered leaflet — a set-up for single-leaflet detachment.'
            : ' Too much of the jet is left uncovered.'}
        </div>
      )}
      <ScoreOnce id="s7-clip" pts={r == null ? null : grade === 'best' ? 20 : grade === 'ok' ? 8 : 0} max={20} />
      {r && (
        <>
          <div className="cs-h2">📉 After release</div>
          <LAPressure mode="post" />
          <PulmonaryVein reversal={r.mr === 'severe' || r.mr === 'moderate'} />
          <Decision id="s7-third" question="Two clips, trace MR, gradient 3.9 mmHg. A colleague suggests a third clip at A1/P1 “to be safe”. You…"
            options={[
              { id: 'no', label: 'Decline: there is no jet at A1/P1, and a third clip would push the gradient over 5 mmHg', verdict: 'best', points: 10,
                why: 'Every clip divides the orifice again. Stop at a good result; check the gradient after each clip.' },
              { id: 'yes', label: 'Add it', verdict: 'wrong', points: 0, why: 'Iatrogenic mitral stenosis in a ventricle that cannot overcome it.' },
            ]} />
        </>
      )}
      <Why title="✌️ Why two clips were right here and wrong in Case 02"
        chain={[
          { k: 'CASE 02', t: 'A focal flail P2: one clip closed it; the second would have added only gradient.' },
          { k: 'CASE 05', t: 'A tethered valve leaks along a line — a wide jet from A2/P2 to A3/P3.' },
          { k: 'BIG VALVE', t: 'His MVA is 4.6 cm²: room for two clips before the gradient bites.' },
          { k: 'THE RULE', t: 'Not “one clip” or “two clips” — the residual jet AND the gradient decide, after every clip.' },
        ]} />
      <Contrast title="🔢 a second clip that helps vs one clip too many"
        is={{ h: 'Helps', points: ['A residual jet beside the first clip.', 'Leaflet length to grasp there.', 'Gradient still well under 5 mmHg after it.'] }}
        isnt={{ h: 'Too many', points: ['Trace residual MR already.', 'A small valve (MVA < 4 cm²).', 'Gradient ≥ 5 mmHg — breathlessness from stenosis.'] }} />
      <div className="cs-media-row" style={{ marginTop: 12 }}>
        <Video id="ihEM97ApCqE" title="MitraClip transcatheter mitral valve repair — procedure animation" />
        <Video id="XiBNAEpbL8U" title="MitraClip G4 TEER teaching case: step by step" />
      </div>
      <Video id="6_-JZqR-CuM" title="Transcatheter edge-to-edge repair" />
      <CaseLibrary title="MitraClip in real cases" channels={MITRACLIP_SEARCHES}>
        Look for the wide functional jets: the first clip at the jet origin, the gradient check, and the decision about a second clip.
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🛏️ 16:00</span>Bed 5, Valvular & Structural Heart Unit. Extubated, comfortable, SpO₂ 97% on air. Groin dry. Paced at 70. Pressure 118/68 — higher than he has had in a year.</p>
      </div>
      <ECG12 rate={70} rhythm="paced" caption="Atrial-sensed biventricular pacing at 70/min." />
      <Decision id="s8-gdmt" question="His pressure is up and the leak is gone. His heart-failure drugs?"
        options={[
          { id: 'all', label: 'Continue all four pillars at full dose; restart tonight once he is drinking', verdict: 'best', points: 10,
            why: 'The clip treats the leak, not the scarred ventricle. Every COAPT patient stayed on maximal GDMT; the benefit was added to it, not instead of it.' },
          { id: 'reduce', label: 'Reduce the ARNI and MRA — the valve is fixed', verdict: 'wrong', points: 0, why: 'The commonest post-TEER mistake. The ventricle is still the disease.' },
        ]} />
      <Decision id="s8-anti" question="Sinus rhythm, CAD, aspirin 75 mg already. Antithrombotic therapy after TEER?"
        options={[
          { id: 'asp', label: 'Continue aspirin 75 mg alone', verdict: 'best', points: 10,
            why: 'He has coronary disease and no AF. There is no strong evidence for more after TEER; many centres add clopidogrel for 1–3 months — practice varies.' },
          { id: 'dapt', label: 'Add clopidogrel for a month', verdict: 'ok', points: 6, why: 'Common practice, little evidence; more bleeding.' },
          { id: 'doac', label: 'Start a DOAC for the clip', verdict: 'wrong', points: 0, why: 'No AF, no thrombus: a clip alone is not an indication for anticoagulation.' },
        ]} />
      <MultiSelect id="s8-sick" question="Before he goes home, his “sick-day rules”. If he has vomiting, diarrhoea or fever and cannot eat or drink normally, he should…"
        items={[
          { id: 'pause', label: 'Pause dapagliflozin, sacubitril/valsartan, spironolactone and furosemide', correct: true, why: 'The drugs that hold potassium, drop pressure or dehydrate him when he is already dry.' },
          { id: 'restart', label: 'Restart them 24–48 h after he is eating and drinking normally', correct: true, why: 'A pause, not a stop.' },
          { id: 'call', label: 'Call the HF nurse if it lasts more than a day — for bloods', correct: true, why: 'K⁺ and creatinine catch the problem before the ECG does.' },
          { id: 'nsaid', label: 'Never take ibuprofen or other NSAIDs, or salt substitutes', correct: true, why: 'He has already shown what they do.' },
          { id: 'double', label: 'Take an extra furosemide when he has diarrhoea', correct: false, why: 'He is losing water already.' },
          { id: 'bb', label: 'Stop bisoprolol for a week', correct: false, why: 'Not part of the pause unless he is shocked or bradycardic.' },
        ]} />
      <Why title="🧱 Why a fixed valve does not fix the ventricle"
        chain={[
          { k: 'THE SCAR STAYS', t: 'The inferior wall is still dead; the LV is still 196 mL.' },
          { k: 'THE DRIVE STAYS', t: 'Neurohormones keep pushing remodelling without the drugs that block them.' },
          { k: 'MR RETURNS', t: 'If the LV keeps dilating, the annulus grows and new jets appear beside the clips.' },
          { k: 'SO', t: 'TEER plus GDMT, for life — and device follow-up.' },
        ]} />
      <Contrast title="⏸️ a sick-day pause vs stopping for good"
        is={{ h: 'Pause', points: ['24–48 h while he is dry.', 'Restart, bloods, back to target.', 'Keeps the life-saving drugs.'] }}
        isnt={{ h: 'Stop', points: ['“Kidney injury — stop the RAAS drugs.”', 'No one restarts them.', 'The ventricle relapses within months.'] }} />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — POTASSIUM 7.6 AND A DEVICE THAT CANNOT CAPTURE
   ============================================================ */

function Crisis() {
  const { answers, answer } = useCase();
  const r = answers['s9-hk'];
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p"><span className="cs-time" style={{ color: 'var(--red)' }}>🤢 4 days</span>A stomach bug went round his grandchildren. Diarrhoea and vomiting — and, because “the doctors said never to miss them”, every tablet taken every morning.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>🚑 14:10</span>
          Collapsed in the bathroom. The paramedics find him grey and slow: heart rate 36, pressure 74/42. Their monitor shows pacing spikes — with nothing after many of them.
        </p>
      </div>
      <BedsideMonitor />
      <Decision id="s9-para" question="You are the paramedic. Heart rate 36 with pacing spikes not followed by QRS complexes, pressure 74/42, a CRT-D in his chest. On the way in?"
        options={[
          { id: 'pre', label: 'Pre-alert; 12-lead ECG; IV access; pads on (anterior–posterior, ≥ 8 cm from the device) ready for transcutaneous pacing; IV calcium per local protocol if hyperkalaemia is suspected', verdict: 'best', points: 10,
            why: 'Failure to capture in a man on ARNI, MRA and SGLT2i who has been vomiting for four days: think potassium first. Pads away from the generator protect it and work better.' },
          { id: 'atr', label: 'Atropine 600 µg repeatedly until the rate rises', verdict: 'ok', points: 3, why: 'Reasonable once, but atropine cannot make a ventricle capture a pacing spike when the potassium is 7.6.' },
          { id: 'mag', label: 'Tape a magnet over the device', verdict: 'wrong', points: 0, why: 'On an ICD or CRT-D a magnet suspends shocks — it does not restore pacing.' },
        ]} />
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧪 Emergency department · 14:40</div>
        <Table head={['', 'Result']} rows={[
          ['Potassium', N('7.6 mmol/L (no haemolysis)', 'cs-hi')], ['Creatinine', N('312 µmol/L (baseline 150)', 'cs-hi')],
          ['Sodium', N('129 mmol/L', 'cs-hi')], ['Venous pH / bicarbonate', N('7.28 · 17 mmol/L', 'cs-hi')],
          ['Glucose · ketones', N('6.2 mmol/L · 1.2 mmol/L')], ['Lactate', N('3.4 mmol/L', 'cs-hi')],
        ]} />
      </div>
      <Decision id="s9-dx" question="Why are the pacing spikes not capturing?"
        options={[
          { id: 'k', label: 'Hyperkalaemia has raised the myocardial capture threshold above the device’s output', verdict: 'best', points: 10,
            why: 'A device that worked last week and fails on the day the potassium is 7.6 is a potassium problem until proven otherwise.' },
          { id: 'lead', label: 'LV lead dislodgement', verdict: 'wrong', points: 2, why: 'That would lose LV capture only — the RV lead would still capture. Here nothing captures.' },
          { id: 'batt', label: 'Battery depletion', verdict: 'wrong', points: 0, why: 'A five-month-old generator — and the spikes are there.' },
        ]} />
      <Why title="🔋 Why potassium stops a pacemaker capturing"
        chain={[
          { k: 'LESS NEGATIVE', t: 'High extracellular K⁺ makes the resting membrane potential less negative.' },
          { k: 'Na⁺ CHANNELS SHUT', t: 'Partly depolarised cells inactivate their fast sodium channels.' },
          { k: 'SLOW, STUBBORN', t: 'Conduction slows (wide QRS); a bigger stimulus is needed to fire (higher threshold).' },
          { k: 'NO CAPTURE', t: 'The device’s spike no longer reaches threshold — and the slow escape rhythm is all that is left.' },
        ]}>
        Calcium does not lower the potassium. It raises the threshold potential, restoring the gap between rest and firing — the membrane works again.
      </Why>

      <div className="cs-h2">🚨 Treat him — the strip answers</div>
      <HyperKResus done={r} onDone={res => answer('s9-hk', res)} />
      <ScoreOnce id="s9-hk" pts={r == null ? null : r.pts} max={20} />
      {r && (
        <div className={'cs-fb ' + (r.pts >= 17 ? 'best' : 'ok')}>
          Order: {r.order.length} actions. K⁺ now ~{r.K} mmol/L, capture restored, pressure rising. {r.pts >= 17 ? 'Membrane first, then shift, then remove the cause, then the fluid he was missing.' : 'Calcium should come first: it is the only treatment that protects the heart in the next five minutes.'}
        </div>
      )}
      <Contrast title="💧 fluid on admission night vs fluid today"
        is={{ h: 'Today — give it', points: ['Four days of diarrhoea; dry tongue; JVP not seen.', 'Low pressure from low preload.', 'Fluid restores renal perfusion and K⁺ excretion.'] }}
        isnt={{ h: 'Admission night — withhold it', points: ['JVP at his ears, lungs full.', 'Low pressure from a failing pump.', 'Fluid stretches the LV and worsens the MR.'] }} />
      <Contrast title="🧪 calcium vs insulin"
        is={{ h: 'Calcium — protects', points: ['Works in 1–3 minutes, lasts 30–60.', 'Stabilises the membrane; K⁺ unchanged.', 'Repeat if the ECG does not improve.'] }}
        isnt={{ h: 'Insulin–glucose — shifts', points: ['K⁺ falls 0.6–1.0 mmol/L in 30–60 min.', 'Temporary: K⁺ comes back out of the cells.', 'Hypoglycaemia for up to 6 h: check glucose hourly.'] }} />
      <Decision id="s9-restart" question="Day 3: eating and drinking, creatinine 168, K⁺ 4.6. His heart-failure drugs?"
        options={[
          { id: 'step', label: 'Restart in steps: dapagliflozin and sacubitril/valsartan (lower dose) now, spironolactone last with a K⁺ check in 72 h; a potassium binder if needed; written sick-day rules again', verdict: 'best', points: 10,
            why: 'The drugs did not cause this alone — dehydration without a pause did. Restarting carefully keeps the ventricle (and the clip result) on his side.' },
          { id: 'never', label: 'Leave the ARNI and MRA off permanently — too dangerous', verdict: 'wrong', points: 0, why: 'The war story on the M&M page.' },
          { id: 'all', label: 'Restart everything at full dose today', verdict: 'ok', points: 3, why: 'Too fast after an AKI; step it.' },
        ]} />
      <Why title="⛓️ Why noradrenaline was the wrong first drug today"
        chain={[
          { k: 'THE PROBLEM', t: 'A ventricle beating 36 times a minute because it cannot be paced.' },
          { k: 'SQUEEZE', t: 'Noradrenaline raises afterload on a slow, weak, recently clipped LV.' },
          { k: 'BACKWARDS', t: 'Higher afterload widens the gaps beside the clips and lowers forward flow.' },
          { k: 'FIX THE CAUSE', t: 'Calcium restores capture: rate 70, pressure up — no vasopressor needed.' },
        ]} />
      <div className="cs-media-row">
        <Figure src={WIKI('Hyperkalemia_ECG.jpg')} href={WIKIPAGE('Hyperkalemia_ECG.jpg')} alt="ECG in hyperkalaemia with peaked T waves" caption="A real ECG at K⁺ 8.2 mmol/L in kidney disease: tall, peaked T waves." credit="Wikimedia Commons · CC BY 4.0" />
        <Video id="PxoRJN3SVZQ" title="Hyperkalaemia: ECG changes animated" />
      </div>
      <Video id="kfr19odmFEI" title="ECG changes in hyperkalemia — One Critical Minute" />
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
      <ViciousCycle id="cyc-fmr" title="🌀 The functional MR spiral — MR begets MR"
        nodes={[
          { short: 'Big LV', t: 'A scarred ventricle dilates', d: 'Remodelling keeps the stroke volume up at the price of size and sphericity.' },
          { short: 'Tethering', t: 'Papillary muscles pulled apart; annulus stretched', d: 'The leaflets are held down and apart.' },
          { short: 'The leak', t: 'Secondary MR', d: 'A central gap every systole.' },
          { short: 'Volume load', t: 'The regurgitant volume comes back every diastole', d: 'The LV must hold its forward volume plus the leak.' },
          { short: 'More stretch', t: 'Wall stress rises', d: 'The ventricle dilates further — and the spiral turns again.' },
        ]}
        breaks={[
          { at: 0, t: 'The four pillars: reverse remodelling.' },
          { at: 1, t: 'CRT: synchronise the papillary muscles; raise the closing force.' },
          { at: 2, t: 'TEER: close the leak when it stays severe on optimal therapy.' },
          { at: 3, t: 'Diuretics: a smaller LV today.' },
        ]} />
      <Decision id="cyc-crt" question="Within a day of CRT his MR jet is smaller. The main reason?"
        options={[
          { id: 'sync', label: 'Synchronous papillary muscle contraction and a faster pressure rise push the leaflets shut — remodelling comes later', verdict: 'best', points: 10, why: 'Acute: closing force and papillary timing. Chronic: a smaller LV.' },
          { id: 'rate', label: 'The heart rate is regular', verdict: 'wrong', points: 0, why: 'He was in sinus rhythm already.' },
        ]} />
      <ViciousCycle id="cyc-shock" title="🥶 The shock spiral with MR — 23:40"
        nodes={[
          { short: 'Low output', t: 'Forward stroke volume falls', d: 'A weak LV sending half its blood backwards.' },
          { short: 'Hypotension', t: 'Pressure and perfusion fall', d: 'Kidneys, brain, coronaries.' },
          { short: 'Squeeze', t: 'Sympathetic surge and angiotensin: vasoconstriction', d: 'The body defends its pressure by tightening the arteries.' },
          { short: 'Afterload', t: 'Higher aortic resistance', d: 'The forward exit gets harder.' },
          { short: 'More MR', t: 'More of each beat goes back to the LA', d: 'Less forward flow; wetter lungs — back to the start.' },
        ]}
        breaks={[
          { at: 0, t: 'Inotrope (dobutamine) — more contraction, mild vasodilation.' },
          { at: 3, t: 'Mechanical afterload reduction: intra-aortic balloon pump, Impella.' },
          { at: 2, t: 'Avoid pure vasoconstrictors; if needed, never alone.' },
          { at: 4, t: 'Definitive: reduce the leak (TEER) once he is stable on therapy.' },
        ]} />
      <Decision id="cyc-nor" question="MAP 58 on dobutamine in a patient with severe secondary MR. You must add noradrenaline. What goes with it?"
        options={[
          { id: 'mcs', label: 'Keep the inotrope; the lowest dose to a MAP of 65; mechanical support (balloon pump or Impella) and a PA catheter to watch the v-wave and output', verdict: 'best', points: 10,
            why: 'Vasopressors buy perfusion pressure at the cost of afterload. Offset it — and measure what it does to forward flow.' },
          { id: 'high', label: 'Titrate it to a MAP of 85 for the kidneys', verdict: 'wrong', points: 0, why: 'Every extra mmHg of afterload sends more blood backwards.' },
        ]} />
      <ViciousCycle id="cyc-k" title="🧯 The hyperkalaemia trap — how patients lose their drugs"
        nodes={[
          { short: 'K⁺ high', t: 'Potassium rises (an NSAID, a stomach bug, a salt substitute)', d: 'The trigger is usually something else.' },
          { short: 'Drugs stop', t: 'ARNI and MRA stopped “for safety”', d: 'And never restarted.' },
          { short: 'Remodel', t: 'The ventricle dilates again', d: 'MR and congestion return.' },
          { short: 'Admission', t: 'Heart-failure admission, diuretics, AKI', d: 'Kidneys under strain …' },
          { short: 'K⁺ again', t: '… potassium rises again', d: 'The loop closes, each turn with fewer drugs.' },
        ]}
        breaks={[
          { at: 0, t: 'Find the trigger: NSAIDs, salt substitutes, dehydration.' },
          { at: 1, t: 'Halve, do not stop (5.5–6.0); potassium binders; restart after AKI.' },
          { at: 3, t: 'Sick-day rules: pause and restart.' },
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
      <WarStory title="🧷 The clip for the wrong ventricle"
        mistake="TEER for proportionate MR in a huge ventricle — EROA 0.30 cm², LVEDV 320 mL, EF 18% — and no advanced heart-failure referral."
        burn="Weigh the leak against the ventricle. When the MR is the ventricle’s symptom, a clip cannot save it — refer for advanced therapies while there is time.">
        <p className="cs-p">A 58-year-old with dilated cardiomyopathy, “severe MR, let’s clip it”. A technically perfect two-clip result. No change in symptoms; three admissions in six months. By the time he was referred for a heart transplant he was too sick to list. He died eight months after the clip.</p>
      </WarStory>
      <Decision id="mm-prop" question="What single assessment should have redirected him?"
        options={[
          { id: 'prop', label: 'EROA against LVEDV (and EF): proportionate MR in a stage-D ventricle → advanced HF assessment first', verdict: 'best', points: 10, why: 'MITRA-FR, not COAPT.' },
          { id: 'murmur', label: 'A louder murmur', verdict: 'wrong', points: 0, why: 'Loudness does not grade secondary MR.' },
        ]} />
      <WarStory title="💉 Noradrenaline alone"
        mistake="Treating cold, wet shock with severe secondary MR with noradrenaline alone, titrated to a MAP of 80."
        burn="In MR shock, raise output and lower afterload. A vasopressor, if needed, is never alone.">
        <p className="cs-p">A 71-year-old with ischaemic cardiomyopathy, pressure 80/50. Noradrenaline up to 0.4 µg/kg/min: the MAP reached 80, the urine stopped, the lungs flooded and the PA catheter showed v-waves of 60. He arrested at 04:00; resuscitated, he needed an Impella and three weeks in intensive care.</p>
      </WarStory>
      <Decision id="mm-nor" question="What should have been started first?"
        options={[
          { id: 'ino', label: 'An inotrope (dobutamine), with mechanical afterload reduction if needed', verdict: 'best', points: 10, why: 'Forward flow, not pressure alone.' },
          { id: 'fluid', label: 'A litre of fluid', verdict: 'wrong', points: 0, why: 'A full ventricle, a bigger leak.' },
        ]} />
      <WarStory title="🚫 Spironolactone, stopped forever"
        mistake="Stopping spironolactone AND the ARNI permanently for a potassium of 5.7 caused by an NSAID — and never restarting them."
        burn="Halve at 5.5–6.0, stop above 6.0, find the trigger, use a binder — and restart.">
        <p className="cs-p">A 64-year-old doing well on four drugs. K⁺ 5.7 after a course of naproxen; the discharge letter said “RAAS drugs stopped — hyperkalaemia”. No one restarted them. Four months later: readmitted in cardiogenic shock with an EF of 15%. He died on day 9.</p>
      </WarStory>
      <Decision id="mm-k" question="K⁺ 5.7 on spironolactone 25 mg daily. The ESC response?"
        options={[
          { id: 'half', label: 'Halve the MRA dose, remove the trigger, recheck within a week; consider a binder', verdict: 'best', points: 10, why: 'Stop only above 6.0 mmol/L.' },
          { id: 'stop', label: 'Stop all RAAS inhibitors', verdict: 'wrong', points: 0, why: 'The trap.' },
        ]} />
      <WarStory title="😴 Measured under anaesthesia"
        mistake="Cancelling TEER because MR looked moderate on a TOE under general anaesthesia."
        burn="Functional MR changes with loading. Judge it in the conditions the patient lives in — or recreate them.">
        <p className="cs-p">A 69-year-old with severe secondary MR on an awake TTE, NYHA III on optimal therapy. On the table, with a systolic of 85, the jet looked moderate; the procedure was abandoned. Three admissions followed. He died at home of heart failure six months later, still on the waiting list for “re-assessment”.</p>
      </WarStory>
      <WarStory title="🤢 The sick-day rules nobody taught"
        mistake="Discharging a patient on an ARNI, MRA, SGLT2i and a loop diuretic without sick-day rules."
        burn="Every patient on the four pillars goes home knowing when to pause them — and when to restart.">
        <p className="cs-p">A 76-year-old with gastroenteritis kept taking everything for five days. K⁺ 8.4, creatinine 410. Asystolic arrest in the ambulance bay; ROSC after calcium chloride, insulin–glucose and 12 minutes of CPR. He survived with a long ICU stay.</p>
      </WarStory>
      <Decision id="mm-sick" question="Which instruction would most likely have prevented it?"
        options={[
          { id: 'pause', label: '“If you cannot eat or drink normally, pause these four tablets and call us; restart when you are well”', verdict: 'best', points: 10, why: 'Simple, written, rehearsed.' },
          { id: 'water', label: '“Drink plenty of water”', verdict: 'wrong', points: 0, why: 'Not when he is vomiting it back.' },
        ]} />
      <WarStory title="🧲 The magnet"
        mistake="Blaming the CRT-D for loss of capture, placing a magnet and waiting for the device technician — while the potassium was 8.0."
        burn="Loss of capture in a sick patient on RAAS drugs: check the potassium and give calcium. A magnet on an ICD stops shocks, not pacing problems.">
        <p className="cs-p">“The pacemaker has failed.” A magnet was taped on; the technician was 40 minutes away. The blood gas — K⁺ 8.0 — sat unread in the printer. VF arrest; with the magnet on, the device did not shock. External defibrillation, calcium, ROSC. He woke with a hypoxic brain injury.</p>
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
      <MultiSelect id="s12-home" question="His discharge plan?"
        items={[
          { id: 'four', label: 'All four pillars, restarted in steps, with bloods at 1 and 2 weeks', correct: true, why: 'The ventricle is still the disease.' },
          { id: 'sick', label: 'Written sick-day rules, rehearsed with him and his daughter', correct: true, why: 'Teach-back: he says them back to you.' },
          { id: 'echo', label: 'Echo at 30 days: clips, residual MR, gradient, LV size', correct: true, why: 'And yearly after.' },
          { id: 'dev', label: 'Device clinic: biventricular pacing %, thresholds, remote monitoring', correct: true, why: 'Thresholds rose with his potassium; confirm they came back down.' },
          { id: 'endo', label: 'Endocarditis advice and dental prophylaxis', correct: true, why: 'Transcatheter repair material counts as high risk.' },
          { id: 'rehab', label: 'Cardiac rehabilitation', correct: true, why: 'Exercise training improves symptoms and admissions in HFrEF.' },
          { id: 'nsaid', label: 'Ibuprofen is fine for the knee if he drinks enough', correct: false, why: 'No NSAIDs. Paracetamol, topical NSAID at most, physiotherapy.' },
        ]} />
      <Video id="AJLrK8PUtzI" title="Mitral regurgitation murmur — causes, pathophysiology and signs" />

      <div className="cs-h2">📝 Case quiz</div>
      <Quiz id="s12-quiz" items={[
        { q: 'Secondary (functional) mitral regurgitation is caused by…', options: ['A ruptured chord', 'A dilated, remodelled ventricle or atrium pulling a normal valve open', 'Rheumatic fusion', 'Endocarditis'], answer: 1, why: 'The valve is normal; the chamber is not.' },
        { q: 'Ischaemic secondary MR with posterior leaflet tethering is Carpentier type…', options: ['I', 'II', 'IIIa', 'IIIb'], answer: 3, why: 'Restricted in systole.' },
        { q: 'Before considering TEER for secondary MR, the patient should have…', options: ['A loud murmur', 'Optimised GDMT and CRT if indicated, with MR still severe', 'Failed surgery', 'An EF below 15%'], answer: 1, why: 'Treat the ventricle first.' },
        { q: 'COAPT vs MITRA-FR: the COAPT population had…', options: ['Larger ventricles and less MR', 'More MR for smaller ventricles', 'Primary MR', 'No GDMT'], answer: 1, why: 'Disproportionate MR — Grayburn’s hypothesis.' },
        { q: 'Severe MR by regurgitant fraction is…', options: ['≥ 20%', '≥ 30%', '≥ 50%', '≥ 80%'], answer: 2, why: 'With EROA ≥ 0.40 cm² and RVol ≥ 60 mL (lower values may be severe in low flow).' },
        { q: 'In cold, wet shock with severe MR, the first vasoactive drug is usually…', options: ['Noradrenaline alone', 'An inotrope such as dobutamine', 'Phenylephrine', 'Esmolol'], answer: 1, why: 'Forward flow, lower afterload.' },
        { q: 'When starting sacubitril/valsartan in a patient on ramipril…', options: ['Give both together', 'Stop ramipril and wait 36 h', 'Wait 7 days', 'Halve ramipril first'], answer: 1, why: 'Angioedema.' },
        { q: 'K⁺ 5.8 mmol/L on spironolactone 25 mg daily. ESC advice:', options: ['Continue', 'Halve the dose', 'Stop all RAAS inhibitors', 'Double the furosemide'], answer: 1, why: 'Stop above 6.0.' },
        { q: 'A CRT-D stops capturing at K⁺ 7.6. The first drug:', options: ['Insulin–glucose', 'IV calcium', 'Sodium bicarbonate', 'Atropine'], answer: 1, why: 'Membrane first.' },
        { q: 'A magnet placed over an ICD or CRT-D…', options: ['Starts asynchronous pacing', 'Suspends tachyarrhythmia therapies (shocks)', 'Resets the battery', 'Raises the pacing output'], answer: 1, why: 'Pacing is unchanged.' },
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
          <li className="cs-li">🫀 In secondary MR the valve is normal: the ventricle is the disease, the leak is where it shows.</li>
          <li className="cs-li">🔊 A soft murmur does not mean mild MR — a weak ventricle cannot shout.</li>
          <li className="cs-li">🌊 Never judge secondary MR wet, dyssynchronous, under-treated or asleep. Re-measure on optimal therapy, awake.</li>
          <li className="cs-li">🏛️ Four pillars, started early and together: beta-blocker, ARNI, MRA, SGLT2 inhibitor. Then titrate every 1–2 weeks.</li>
          <li className="cs-li">🧮 Make room for them: cut the diuretic in a dry patient, stop alpha-blockers and NSAIDs. A creatinine rise of up to 30% is expected.</li>
          <li className="cs-li">⚡ LBBB ≥ 150 ms, EF ≤ 35%: CRT — it can shrink the leak in a day and the ventricle in months.</li>
          <li className="cs-li">⚖️ Weigh the MR against the ventricle: disproportionate MR (COAPT) gains from TEER; proportionate (MITRA-FR) may not.</li>
          <li className="cs-li">✌️ Clips are counted by the residual jet and the gradient, not by habit.</li>
          <li className="cs-li">🥶 In MR shock: inotrope and afterload reduction; a vasopressor never alone.</li>
          <li className="cs-li">🔋 Loss of capture on RAAS drugs: potassium. Calcium first, then shift, then remove the cause — and restart the drugs later.</li>
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

export const VALVE_05 = {
  title: 'Secondary MR in HFrEF · the four pillars, CRT, TEER and a potassium of 7.6',
  short: 'Structural Heart · Case 05',
  patient: {
    name: 'Mr Samuel Okafor',
    meta: '67 M · MRN 5508-2174 · 84 kg',
    flags: [
      { text: 'EF 28% · LBBB', tone: 'red' },
      { text: 'Severe secondary MR', tone: 'red' },
      { text: 'eGFR 46', tone: 'amber' },
      { text: 'Old inferior MI', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 30, limit: 120, basis: 'volume/eGFR ≤ 3.7' },
  clock0: min(21, 10),
  vitals0: { hr: 108, sys: 102, dia: 70, spo2: 88, rr: 28, st: 0, rhythm: 'sinus' },
  brand: { icon: '🫀', line: 'Structural Heart · Case 05' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / IM / Paramedic', tone: 'cyan' },
      { text: 'Heart failure · structural', tone: 'red' },
      { text: 'ESC/EACTS 2025 VHD · ESC HF 2021/23', tone: 'plain' },
    ],
    lines: [
      { text: 'Pulled', style: 'outline' },
      { text: 'apart', style: 'grad' },
      { text: '— the ventricle is the disease', style: 'cyan' },
    ],
    hook: (
      <>
        A retired bus driver whose mitral valve is <b>perfectly normal</b> — and leaks half of every heartbeat, because the scarred ventricle around it has stretched the leaflets apart.
        You will measure the leak by hand and weigh it against the ventricle, titrate four drugs through five clinic visits, resynchronise the heart, and <span className="g">clip a jet too wide for one clip</span>.
        Then a stomach bug, every tablet still taken — and a defibrillator that <span className="r">can no longer make the heart beat</span>.
      </>
    ),
    image: null,
    sims: 's4',
    crisis: 's9',
    cards: [
      { k: '🧑‍🦳 The patient', t: 'Mr Samuel Okafor, 67 — old inferior MI, EF 28%, LBBB, on the same low doses since 2019.' },
      { k: '🩺 Your role', t: 'Resus, CCU, heart-failure clinic, pacing lab, structural lab — and the paramedic on the way in.' },
      { k: '🎛️ In your hands', t: 'PISA on a tethered valve, the proportionality plot, a GDMT titration board, a two-clip TEER and a live hyperkalaemia strip.' },
      { k: '🧠 How it teaches', t: 'Case 02 inside out: same murmur family, opposite disease — the ventricle, not the valve.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'Warm and wet, then cold', Component: Presentation,
      pill: '🌊 21:10 — a big heart, a soft murmur',
      lede: 'Recognise secondary MR, decongest at the right dose — and treat MR shock with physiology, not pressure.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 108, sys: 102, dia: 70, spo2: 88, rr: 28, rhythm: 'sinus' }); atLeastClock(min(21, 10)); } },
    { id: 's2', icon: '📏', nav: 'Echo & Proportion', title: 'Measure the leak — then weigh it', Component: Echo,
      pill: '🎯 PISA by hand, EROA vs LVEDV',
      lede: 'Quantify a functional jet, see why it under-reads, and ask whether it is proportionate to the ventricle.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 92, sys: 104, dia: 64, spo2: 95, rr: 20, rhythm: 'sinus' }); atLeastClock(min(DAY(2) + 10, 0)); } },
    { id: 's3', icon: '👥', nav: 'Heart Team', title: 'The heart team: ventricle first', Component: HeartTeam,
      pill: '🧭 Day 6 — clip now, or treat the ventricle?',
      lede: 'Coronaries, scar, CRT criteria, CRT-D or CRT-P — and how to explain it to him.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 86, sys: 106, dia: 66, spo2: 96, rr: 16, rhythm: 'sinus' }); atLeastClock(min(DAY(5) + 14, 0)); } },
    { id: 's4', icon: '🧮', nav: 'GDMT Titration', title: 'Planning: the four pillars, visit by visit', Component: Planning,
      pill: '💊 Five visits, four drugs, one potassium',
      lede: 'Start them together, titrate them fast, make room for them — and keep them.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 84, sys: 106, dia: 68, spo2: 97, rr: 16, rhythm: 'sinus' }); atLeastClock(min(DAY(6) + 11, 0)); } },
    { id: 's5', icon: '🩸', nav: 'CRT-D Set-up', title: 'Set-up: CRT-D', Component: Setup,
      pill: '⚡ Week 10 — resynchronise',
      lede: 'Checklist, implant sequence, where the LV lead goes — and why it shrinks the leak.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 64, sys: 108, dia: 66, spo2: 97, rr: 14, rhythm: 'sinus' }); atLeastClock(min(DAY(70) + 8, 30)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Three months later: choose your path', Component: Strategy,
      pill: '🔀 The ventricle shrank. The leak did not.',
      lede: 'Re-measure, re-plot, match him to the evidence — and do not let anaesthesia fool you.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 66, sys: 108, dia: 64, spo2: 97, rr: 16, rhythm: 'paced' }); atLeastClock(min(DAY(160) + 10, 0)); } },
    { id: 's7', icon: '🛠️', nav: 'TEER', title: 'TEER for a wide functional jet', Component: Deploy,
      pill: '🗜️ One clip, two clips — the gradient decides',
      lede: 'Grasp tethered leaflets, cover the jet, keep the gradient under 5.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 70, sys: 104, dia: 60, spo2: 99, rr: 12, rhythm: 'paced' }); atLeastClock(min(DAY(175) + 9, 0)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit', Component: Recovery,
      pill: '🛏️ Bed 5 — the clip is not the cure',
      lede: 'Keep the drugs, choose the antithrombotic, teach the sick-day rules.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 70, sys: 118, dia: 68, spo2: 97, rr: 14, rhythm: 'paced' }); atLeastClock(min(DAY(175) + 16, 0)); } },
    { id: 's9', icon: '🚨', nav: 'The Crisis', title: 'Potassium 7.6 and a device that cannot capture', Component: Crisis,
      pill: '🔋 14:10 — spikes, and nothing after them',
      lede: 'From the ambulance to the resus bay: recognise it, protect the membrane, shift, remove the cause.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 36, sys: 74, dia: 42, spo2: 94, rr: 24, rhythm: 'chb' }); atLeastClock(min(DAY(203) + 14, 10)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'MR begets MR, the shock spiral, and the trap that takes patients’ drugs away.',
      enter: ({ setVitals }) => setVitals({ hr: 70, sys: 112, dia: 66, spo2: 97, rr: 14, rhythm: 'paced' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Six patients who taught these rules.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'His plan, the quiz — then your score.' },
  ],
};

export default function Valve05({ onClose }) {
  return <CaseShell def={VALVE_05} onClose={onClose} />;
}
