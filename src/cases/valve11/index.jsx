import React from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Figure, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import {
  ARAuscultation, PulseWave, PeripheralSigns, ARDoppler, AortaFlow, VenaContracta,
  TriggerPlot, AortaRuler, AoLVPressure, CoronaryEngage, ImpulseControl,
} from './sims.jsx';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 11 (AR-58)
   Chronic severe aortic regurgitation in a 58-year-old with a
   bicuspid aortic valve and a dilated tubular ascending aorta.
   Why the pulse collapses and which eponyms are folklore; the
   learner quantifies the leak (pressure half-time, vena
   contracta, descending-aorta flow reversal, regurgitant
   volume), times surgery from serial LV measurements, measures
   the aorta, and engages a dilated root in the cath lab before
   surgery — then, at 03:10 on day 17, the aorta tears. A type A
   dissection makes the regurgitation ACUTE: the beta-blocker
   tension, why a balloon pump kills, and emergency surgery.

   Clinical content follows the 2025 ESC/EACTS guidelines for
   valvular heart disease, the 2024 ESC guidelines for
   peripheral arterial and aortic diseases, EACVI/ASE
   regurgitation quantification and the 2023 ESC endocarditis
   guidelines, simplified for teaching. Where thresholds differ
   between guidelines or evidence is thin, the rationale says so.
   ============================================================ */

const WIKI = f => `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=960`;
const WIKIPAGE = f => `https://commons.wikimedia.org/wiki/File:${f}`;
const min = (h, m) => h * 60 + m;

/* channel searches on the recommended structural channels */
const AR_SEARCHES = [
  { name: 'CCC Live Cases — aortic regurgitation', url: 'https://www.youtube.com/@CCCLiveCases/search?query=aortic%20regurgitation', note: 'Cases and talks on aortic regurgitation' },
  { name: 'Gulf Intervention Society — aortic regurgitation', url: 'https://www.youtube.com/@gulfinterventionsociety/search?query=aortic%20regurgitation', note: 'Aortic regurgitation cases and webinars' },
  { name: 'Interventional Cardiology — aortic regurgitation', url: 'https://www.youtube.com/@interventionalcardiologyis3814/search?query=aortic%20regurgitation', note: 'Aortic regurgitation cases' },
];
const DISSECTION_SEARCHES = [
  { name: 'CCC Live Cases — aortic dissection', url: 'https://www.youtube.com/@CCCLiveCases/search?query=aortic%20dissection', note: 'Aortic dissection cases' },
  { name: 'Gulf Intervention Society — aortic dissection', url: 'https://www.youtube.com/@gulfinterventionsociety/search?query=aortic%20dissection', note: 'Aortic dissection talks' },
];

// a volume-overloaded LV: tall left-sided voltages, preserved upright T waves
const LVH = { shape: { V1: { s: 24 }, V2: { s: 28 }, V3: { r: 10, s: 14 }, V5: { r: 30 }, V6: { r: 24 }, I: { r: 12 }, aVL: { r: 11 } } };

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
   1 · PRESENTATION — THE POUNDING IN HIS NECK
   ============================================================ */

function Presentation() {
  const { answers } = useCase();
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">📞 23:20</span>His wife calls the ambulance: Mr Idris Bello, 58, a secondary-school PE teacher and hill-walker, has woken “with my heart banging in my neck — I can see it in the mirror”. No chest pain. No breathlessness. Worse lying on his left side.</p>
        <p className="cs-p"><span className="cs-time">history</span>“A leaky valve” found at a sports medical in his forties: a <b>bicuspid aortic valve</b>. Three cardiology follow-ups, then he stopped going (“I felt fine and I was busy”). Hypertension on amlodipine 5 mg. Ex-smoker, 20 pack-years. His father died suddenly at 61 — “a burst artery in the chest”.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🚑 23:40</span>Crew on scene. He is pink, calm, a little embarrassed. The paramedic feels the radial pulse and frowns: it slaps her fingers, then vanishes.</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>📊 Observations · 23:40</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('70 /min, regular, with occasional dropped beats')], ['Blood pressure (R arm)', N('168/44 mmHg', 'cs-hi')], ['Blood pressure (L arm)', N('164/46 mmHg')],
            ['Pulse pressure', N('124 mmHg', 'cs-hi')], ['SpO₂', N('98% on air')], ['Resp. rate', N('16 /min')], ['Temperature', N('36.7 °C')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🩺 Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Visible carotid pulsation; the head nods slightly with each beat.</li>
            <li className="cs-li">Apex displaced to the 6th space, anterior axillary line: diffuse and thrusting.</li>
            <li className="cs-li">A soft, blowing diastolic murmur at the left sternal edge — much louder when he leans forward and breathes out. A short systolic murmur at the base. A low rumble at the apex.</li>
            <li className="cs-li">Chest clear. No oedema. Femoral pulses brisk; radial-femoral synchronous.</li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">🎧 Listen — then compare</div>
      <p className="cs-p">His murmur first, at the left sternal edge and then at the apex. Then the acute form of the same leak, and mitral stenosis — the rumble his apex murmur imitates. Try sitting forward, handgrip and amyl nitrite.</p>
      <ARAuscultation lesions={['ar-chronic', 'ar-acute', 'ms', 'normal']} />

      <div className="cs-h2">🫳 Feel the pulse</div>
      <PulseWave initial="collapsing" />
      <Why title="🧬 Why his pulse slaps — and then vanishes"
        chain={[
          { k: 'THE LEAK', t: 'In diastole a large share of the blood just ejected falls back through the valve into the LV.' },
          { k: 'BIG LV', t: 'Over years the LV dilates to hold its normal filling PLUS the regurgitant volume: end-diastolic volume ~250 mL.' },
          { k: 'HUGE STROKE', t: 'It ejects all of it — forward SV + regurgitant volume — into the aorta every beat: systolic pressure rises.' },
          { k: 'TWO RUN-OFFS', t: 'In diastole the aortic pressure drains backwards into the LV AND out into vasodilated peripheral beds.' },
          { k: 'WIDE PULSE PRESSURE', t: 'High systolic, low diastolic: 168/44. Every eponymous sign is a symptom of this one number.' },
        ]}>
        The pounding he feels lying on his left side is that stroke volume hitting the chest wall. It is a sign of the leak, not of failure — and not, by itself, a reason to operate.
      </Why>
      <PeripheralSigns />
      <MultiSelect id="s1-signs" question="Which of these bedside signs genuinely help you in aortic regurgitation?"
        items={[
          { id: 'pp', label: 'A pulse pressure > ~80 mmHg with a diastolic < 50–60 mmHg', correct: true, why: 'The physiological core of the signs; with a typical murmur it suggests at least moderate-to-severe chronic AR.' },
          { id: 'apex', label: 'A displaced, hyperdynamic apex', correct: true, why: 'Volume overload you can feel — the LV has dilated.' },
          { id: 'duroziez', label: 'Duroziez’s sign (properly performed)', correct: true, why: 'The diastolic component is real backward flow — the bedside version of descending-aorta flow reversal.' },
          { id: 'af', label: 'An Austin Flint rumble at the apex', correct: true, why: 'Implies a large regurgitant jet striking the anterior mitral leaflet.' },
          { id: 'hill', label: 'Hill’s sign (popliteal minus brachial systolic > 60 mmHg) to grade severity', correct: false, why: 'Largely a cuff artefact: direct intra-arterial pressures show little true difference. Folklore.' },
          { id: 'mur', label: 'A loud diastolic murmur = severe AR', correct: false, why: 'Loudness does not track severity; the most dangerous AR — acute — is often soft and short.' },
        ]} />
      <Contrast title="🫀 chronic vs acute aortic regurgitation"
        is={{ h: 'Chronic severe AR (him)', points: ['A big, compliant LV absorbs the leak: years without symptoms.', 'Wide pulse pressure, collapsing pulse, every eponym.', 'Long, blowing diastolic murmur; displaced apex.', 'The danger is SILENT LV damage — operate on numbers.'] }}
        isnt={{ h: 'Acute severe AR', points: ['A normal-sized LV cannot take the volume: LVEDP shoots up.', 'Normal or NARROW pulse pressure — no collapsing pulse, no eponyms.', 'Short, soft murmur, soft S1, pulmonary oedema, shock.', 'A surgical emergency — you will meet it at 03:10 on day 17.'] }} />
      <Contrast title="🎵 Austin Flint vs mitral stenosis"
        is={{ h: 'Austin Flint (functional)', points: ['The AR jet hits the anterior mitral leaflet and half-closes it.', 'Soft S1, NO opening snap.', 'Softer with amyl nitrite (less AR), louder with handgrip.', 'Normal mitral valve on echo.'] }}
        isnt={{ h: 'Rheumatic mitral stenosis', points: ['Fused commissures narrow the orifice.', 'LOUD S1 and an opening snap.', 'LOUDER with amyl nitrite (more flow, faster rate).', 'Thick, doming leaflets on echo.'] }} />

      <ECG12 rate={70} shape={LVH.shape}
        caption="Sinus rhythm, 70/min. Very tall left-sided voltages (R in V5 30 mm, S in V2 28 mm): LVH. Upright T waves — the classic ‘diastolic overload’ pattern of a volume-loaded LV, rather than the strain of pressure overload." />

      <Decision id="s1-dx" question="🧠 Putting it together: what is going on tonight?"
        options={[
          { id: 'ar', label: 'Chronic severe aortic regurgitation from his bicuspid valve; the pounding is awareness of a huge stroke volume (worse after a dropped beat and lying on the left)', verdict: 'best', points: 10,
            why: 'Wide pulse pressure, collapsing pulse, displaced apex, early diastolic murmur, LVH with upright T waves, no pain, no failure. The post-ectopic beat — a longer diastole, more regurgitation, a bigger next stroke — is what woke him.' },
          { id: 'diss', label: 'Acute aortic dissection', verdict: 'ok', points: 3,
            why: 'Right to think of — bicuspid valve, a father who died of a “burst artery”. But he has no pain, equal arm pressures and a long-standing murmur. It is not tonight’s diagnosis; it is his future risk.' },
          { id: 'thyro', label: 'Thyrotoxicosis', verdict: 'wrong', points: 1, why: 'Also widens pulse pressure, but not with a diastolic murmur and a displaced apex. Check TSH anyway.' },
          { id: 'panic', label: 'A panic attack', verdict: 'wrong', points: 0, why: 'A pulse pressure of 124 mmHg is not anxiety.' },
        ]} />
      <Decision id="s1-bp" question="💊 The ED doctor wants to “treat the hypertension” of 168/44 tonight. What do you advise?"
        options={[
          { id: 'none', label: 'Nothing intravenous tonight. In clinic, control systolic pressure with a vasodilator (ACE inhibitor/ARB or a dihydropyridine) — and avoid pushing the heart rate down', verdict: 'best', points: 10,
            why: 'His systolic is high because his stroke volume is huge; his diastolic is already 44. In AR with hypertension, vasodilators are preferred. A bradycardia lengthens diastole and gives the leak more time.' },
          { id: 'bb', label: 'IV labetalol now, then bisoprolol 10 mg', verdict: 'wrong', points: 0, why: 'Drops a diastolic of 44 lower and slows the heart: more regurgitation per beat, lower coronary perfusion pressure.' },
          { id: 'gtn', label: 'A GTN infusion', verdict: 'wrong', points: 1, why: 'No emergency to treat. Pain-free, no failure, no end-organ damage.' },
        ]} />
      <Why title="⏱️ Why a slow heart rate makes AR worse"
        chain={[
          { k: 'DIASTOLE', t: 'Regurgitation only happens in diastole.' },
          { k: 'SLOWER', t: 'At 50/min diastole is ~0.9 s per beat; at 80/min ~0.45 s.' },
          { k: 'MORE PER BEAT', t: 'A longer diastole = more blood back per beat, a bigger LV, a lower aortic diastolic pressure.' },
          { k: 'THE RULE', t: 'In AR, a relative tachycardia is protective. This becomes a matter of life and death when the leak is acute.' },
        ]} />
      <MultiSelect id="s1-plan" question="🚑 What should happen now?"
        items={[
          { id: 'admit', label: 'Admit to the valve unit for an expedited echo and work-up — he has been lost to follow-up for 18 months', correct: true, why: 'Not an emergency, but a patient with symptoms-equivalent awareness, a bicuspid aorta and no recent imaging should not wait months.' },
          { id: 'tsh', label: 'Bloods: FBC, U&E, TSH, NT-proBNP', correct: true, why: 'Exclude a high-output contributor; BNP is a baseline for the LV.' },
          { id: 'cx', label: 'Chest X-ray', correct: true, why: 'Cardiomegaly; a widened mediastinum if the ascending aorta is big.' },
          { id: 'ct', label: 'Emergency CT aortogram tonight', correct: false, why: 'Pain-free with equal arm pressures: not tonight. The aorta will be imaged properly in the work-up.' },
          { id: 'home', label: 'Discharge with GP follow-up', correct: false, why: 'He has already fallen through that net once.' },
        ]} />
      {answers['s1-plan']?.submitted && <Note kind="pearl" title="🛏️ 01:10">Admitted to bed 11, Valvular & Structural Heart Unit. NT-proBNP 410 ng/L, TSH normal, creatinine 82 µmol/L (eGFR 88). Chest X-ray: cardiothoracic ratio 0.58, a prominent ascending aortic shadow.</Note>}

      <div className="cs-media-row">
        <Video id="uZysrKXHJMM" title="Aortic Regurgitation — Heart Sounds" channel="MEDZCOOL" />
        <Video id="UhnEXEpJp8c" title="Aortic Regurgitation: A Common Heart Murmur, Explained" />
      </div>
    </>
  );
}

/* ============================================================
   2 · ECHO — QUANTIFY THE LEAK YOURSELF
   ============================================================ */

function Echo() {
  const { answers, answer } = useCase();
  const ph = answers['s2-pht'], ao = answers['s2-ao'], vc = answers['s2-vc'];
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Transthoracic echo · day 1, 09:30</div>
        <Table head={['', 'Finding']} rows={[
          ['Aortic valve', 'Bicuspid, fusion of the right and left coronary cusps with a raphe (Sievers type 1, L–R). The fused cusp prolapses. No significant calcium; peak velocity 2.4 m/s'],
          ['LV', N('LVEDD 70 mm · LVESD 52 mm · EF 52% (biplane)', 'cs-hi')],
          ['Aorta', N('Sinuses 43 mm · sinotubular junction 38 mm · tubular ascending ~51 mm', 'cs-hi')],
          ['AR jet', 'Eccentric, directed toward the anterior mitral leaflet'],
          ['BSA', '2.02 m² (180 cm, 84 kg)'],
        ]} />
      </div>

      <div className="cs-h2">📏 A · Pressure half-time (CW, apical 5-chamber)</div>
      <ARDoppler pht={190} v0={4.4} done={ph} onMeasure={r => answer('s2-pht', r)} />
      {ph && <div className={'cs-fb ' + (ph.close ? 'best' : 'ok')}>PHT {ph.pht} ms. {ph.close ? 'On the envelope: < 200 ms, in the severe range.' : 'Off the envelope — the true half-time is about 190 ms. Lay the line along the dense edge, not the faint feathering.'}</div>}
      <ScoreOnce id="s2-pht" pts={ph == null ? null : ph.close ? 10 : 3} max={10} />
      <Why title="🧪 Why the pressure half-time can lie"
        chain={[
          { k: 'WHAT IT MEASURES', t: 'How fast the aortic–LV pressure difference collapses in diastole.' },
          { k: 'BIG LEAK', t: 'A large orifice empties the aorta fast: steep slope, short half-time.' },
          { k: 'BUT ALSO', t: 'A stiff LV whose pressure rises fast — or a vasodilated aorta whose pressure falls fast — shortens it too.' },
          { k: 'AND CHRONIC', t: 'A very compliant, dilated LV can keep the half-time long despite a big leak.' },
          { k: 'SO', t: 'PHT is supportive. Never grade AR on it alone.' },
        ]} />

      <div className="cs-h2">🌊 B · Flow in the descending aorta</div>
      <p className="cs-p">Compare the normal and moderate patterns, then measure on the patient: the reverse velocity at end-diastole.</p>
      <AortaFlow done={ao} onMeasure={r => answer('s2-ao', r)} />
      {ao && <div className={'cs-fb ' + (ao.close ? 'best' : 'ok')}>{ao.site === 'abd' ? 'Abdominal aorta — very specific when holodiastolic, but measure the threshold in the proximal descending aorta. ' : ''}End-diastolic reverse velocity {ao.edv} cm/s. {ao.close ? 'Holodiastolic reversal > 20 cm/s: severe.' : 'The patient’s value is ~28 cm/s at the green end-diastole line, measured in the proximal descending aorta.'}</div>}
      <ScoreOnce id="s2-ao" pts={ao == null ? null : ao.close ? 10 : 3} max={10} />

      <div className="cs-h2">🎯 C · Vena contracta (parasternal long axis, zoom)</div>
      <VenaContracta vc={7.5} done={vc} onMeasure={r => answer('s2-vc', r)} />
      {vc && <div className={'cs-fb ' + (vc.close ? 'best' : 'ok')}>{vc.lvl !== 'neck' ? 'Wrong level — the vena contracta is the narrowest neck, just below the cusps. ' : ''}{vc.lvl === 'neck' ? `VC ${vc.width.toFixed(1)} mm. ` : ''}{vc.close ? '> 6 mm: severe.' : 'The neck measures ~7.5 mm.'}</div>}
      <ScoreOnce id="s2-vc" pts={vc == null ? null : vc.close ? 10 : 3} max={10} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧮 D · Volumetric: what goes forward vs what comes back</div>
        <Table head={['Measurement', 'Value']} rows={[
          ['LVOT diameter', '2.6 cm → area π × 1.3² = 5.3 cm²'], ['LVOT VTI', '31 cm'], ['Total LV stroke volume (LVOT)', N('5.3 × 31 ≈ 165 mL')],
          ['Mitral inflow stroke volume (forward)', N('72 mL')], ['AR jet VTI', '230 cm'],
        ]} />
      </div>
      <Decision id="s2-rv" question="Regurgitant volume, fraction and EROA?"
        options={[
          { id: 'ok', label: 'RVol ≈ 93 mL · RF ≈ 56% · EROA ≈ 0.40 cm² — all severe', verdict: 'best', points: 10,
            why: '165 − 72 = 93 mL; 93/165 = 56%; 93/230 = 0.40 cm². Severe AR: RVol ≥ 60 mL, RF ≥ 50%, EROA ≥ 0.30 cm².' },
          { id: 'half', label: 'RVol ≈ 72 mL · RF ≈ 44% · moderate', verdict: 'wrong', points: 0, why: 'That uses the forward volume as the leak.' },
          { id: 'big', label: 'RVol ≈ 165 mL · RF 100%', verdict: 'wrong', points: 0, why: 'That is the total stroke volume.' },
        ]} />
      <MultiSelect id="s2-sev" question="Which of his findings are specific criteria for SEVERE aortic regurgitation?"
        items={[
          { id: 'vc', label: 'Vena contracta > 6 mm', correct: true, why: 'His is ~7.5 mm.' },
          { id: 'rev', label: 'Holodiastolic flow reversal in the descending aorta, end-diastolic velocity > 20 cm/s', correct: true, why: 'Specific and hard to fake.' },
          { id: 'rvol', label: 'Regurgitant volume ≥ 60 mL, fraction ≥ 50%', correct: true, why: '~93 mL, 56%.' },
          { id: 'eroa', label: 'EROA ≥ 0.30 cm²', correct: true, why: '~0.40 cm².' },
          { id: 'lv', label: 'A dilated LV (supportive in chronic AR)', correct: true, why: 'Severe chronic AR without LV dilatation should make you doubt the grade.' },
          { id: 'jet', label: 'A long colour jet reaching the apex', correct: false, why: 'Jet length depends on gain and driving pressure; not a severity criterion.' },
          { id: 'vmax', label: 'Peak AR velocity 4.4 m/s', correct: false, why: 'Velocity reflects the pressure difference, not the size of the hole.' },
        ]} />
      <Contrast title="📉 a short pressure half-time: chronic vs acute"
        is={{ h: 'Acute severe AR', points: ['PHT often < 150 ms: the stiff LV’s pressure rises to meet the aorta’s.', 'Mitral inflow: restrictive; early mitral closure on M-mode.', 'A short half-time here is a sign of crisis.'] }}
        isnt={{ h: 'Chronic severe AR', points: ['PHT around or just below 200 ms — the compliant LV absorbs the volume.', 'Can sit in the “intermediate” range despite a severe leak.', 'Integrate: VC, reversal, volumes, LV size.'] }} />

      <div className="cs-h2">🧩 E · Not every patient is him — grade these</div>
      <Decision id="s2-edge1" question="A 66-year-old on two vasodilators: PHT 180 ms, VC 3 mm, brief early-diastolic aortic reversal only, LV normal size."
        options={[
          { id: 'mild', label: 'Mild-to-moderate: the short PHT reflects the vasodilated aorta, not the leak', verdict: 'best', points: 6, why: 'Everything else says small. Vasodilators steepen the slope by lowering aortic diastolic pressure.' },
          { id: 'sev', label: 'Severe — PHT < 200 ms', verdict: 'wrong', points: 0, why: 'The single parameter that can be fooled is the one you trusted.' },
        ]} />
      <Decision id="s2-edge2" question="A 44-year-old with an eccentric jet that hugs the anterior mitral leaflet: the colour jet looks small, but holodiastolic abdominal-aortic reversal and an LVESD of 49 mm."
        options={[
          { id: 'cmr', label: 'Probably severe and under-called by colour; quantify with cardiac MRI (regurgitant fraction and LV volumes)', verdict: 'best', points: 6,
            why: 'Eccentric jets — common in bicuspid valves — are underestimated by colour. CMR measures the regurgitant volume directly in the aorta and gives reproducible LV volumes for timing surgery.' },
          { id: 'mod', label: 'Moderate — the jet is small', verdict: 'wrong', points: 0, why: 'Abdominal holodiastolic reversal does not happen with a moderate leak.' },
        ]} />
      <Decision id="s2-mech" question="🔧 Mechanism of his regurgitation (repair-oriented, El Khoury classification)?"
        options={[
          { id: 'ii', label: 'Mainly type II — prolapse of the fused cusp — with a contribution from the dilated ascending aorta / sinotubular junction (type Ia)', verdict: 'best', points: 8,
            why: 'In bicuspid AR the fused cusp’s free edge is often too long and prolapses; a dilated STJ pulls the commissures apart. Both can be repaired: cusp plication plus aortic replacement / annuloplasty.' },
          { id: 'iii', label: 'Type III — restricted, calcified cusps', verdict: 'wrong', points: 0, why: 'His cusps are thin and mobile; calcified, restricted cusps are rarely repairable.' },
          { id: 'id', label: 'Type Id — cusp perforation', verdict: 'wrong', points: 0, why: 'Perforation suggests endocarditis — not his story (yet).' },
        ]} />
      <div className="cs-media-row">
        <Video id="29huxwG28gs" title="The Aortic Regurgitation Illusion: From Mild-Moderate to Truly Severe" />
        <Video id="lylBnldFLmk" title="Types of aortic regurgitation based on mechanism" />
      </div>
    </>
  );
}

/* ============================================================
   3 · THE HEART TEAM — OPERATE ON THE NUMBERS
   ============================================================ */

const VISITS = [
  { when: 'Mar 2023', lvesd: 42, lvesdi: 20.8, lvesvi: 36, ef: 61, note: 'Moderate-to-severe AR. Ascending aorta 46 mm. Review in 12 months.' },
  { when: 'Mar 2024', lvesd: 44, lvesdi: 21.8, lvesvi: 41, ef: 59, note: 'Severe AR. Asymptomatic. Aorta 47 mm. Review in 12 months — he did not attend the next appointment.' },
  { when: 'Apr 2025', lvesd: 47, lvesdi: 23.3, lvesvi: 46, ef: 56, note: 'Seen once in a different hospital for a sports medical echo: severe AR, aorta 49 mm. The letter never reached cardiology.' },
  { when: 'Oct 2026', lvesd: 52, lvesdi: 25.7, lvesvi: 54, ef: 52, note: 'Now. Still says he is asymptomatic.' },
];

function HeartTeam() {
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>👥 Heart team · day 2</div>
        <Table head={['', 'Finding']} rows={[
          ['Symptoms', 'None he admits to. Exercise ECG: 12 minutes of Bruce, 13 METs, no symptoms, normal BP response'],
          ['Cardiac MRI', 'AR regurgitant fraction 52%; LVEDVi 142 mL/m², LVESVi 54 mL/m²; no late gadolinium enhancement'],
          ['Aorta (CT)', 'Bicuspid aortopathy, “ascending” phenotype: sinuses 43, tubular ascending ~51 mm (see stage 4)'],
          ['Risk', 'EuroSCORE II 1.1% — low surgical risk'],
          ['His words', '“I’m 58, I walk the hills every weekend, and I don’t want to be on warfarin if I can avoid it. But I want this done once.”'],
        ]} />
      </div>
      <div className="cs-h2">📈 His ventricle over three and a half years</div>
      <TriggerPlot visits={VISITS} />
      <Decision id="s3-first" question="At which visit did he FIRST meet a guideline trigger for surgery (any class)?"
        options={[
          { id: '2025', label: 'April 2025 — LVESDi 23.3 mm/m² (> 22) and LVESVi 46 mL/m² (> 45), at low surgical risk: class IIb', verdict: 'best', points: 10,
            why: 'The 2025 ESC/EACTS guideline keeps the class I thresholds and adds an earlier tier that may be considered in low-risk patients (LVESDi > 22 mm/m², LVESVi > 45 mL/m² or LVEF ≤ 55%). The evidence for it is observational.' },
          { id: 'now', label: 'October 2026 — now', verdict: 'ok', points: 4, why: 'That is when he met a class I trigger. A lower-tier trigger was there 18 months earlier — in a letter nobody read.' },
          { id: '2024', label: 'March 2024 — the AR became severe', verdict: 'wrong', points: 0, why: 'Severity alone, with a normal-sized LV, normal EF and no symptoms, is a reason for closer surveillance, not surgery.' },
        ]} />
      <Decision id="s3-classI" question="And now? Which finding makes surgery a class I recommendation today?"
        options={[
          { id: 'lv', label: 'LVESD 52 mm (> 50 mm) and LVESDi 25.7 mm/m² (> 25 mm/m²)', verdict: 'best', points: 10,
            why: 'Class I in asymptomatic severe AR: LVEF ≤ 50%, LVESD > 50 mm or LVESDi > 25 mm/m². The indexed value matters most in small patients.' },
          { id: 'ef', label: 'LVEF 52%', verdict: 'wrong', points: 2, why: 'The class I EF threshold is ≤ 50%. His 52% is ≤ 55% — a lower-tier trigger only.' },
          { id: 'edd', label: 'LVEDD 70 mm', verdict: 'wrong', points: 2, why: 'End-DIASTOLIC size reflects the volume load; END-SYSTOLIC size reflects contractile reserve. The ESC triggers are end-systolic.' },
        ]} />
      <Why title="🧬 Why end-SYSTOLIC size, not end-diastolic"
        chain={[
          { k: 'DIASTOLE', t: 'A big end-diastolic volume is the price of the leak — it is how the LV keeps forward output.' },
          { k: 'SYSTOLE', t: 'A healthy LV, however big, still empties well: its end-systolic size stays modest.' },
          { k: 'AFTERLOAD MISMATCH', t: 'As wall stress (Laplace: pressure × radius / thickness) outruns hypertrophy, the LV stops emptying: end-systolic size creeps up.' },
          { k: 'FIBROSIS', t: 'Left too long, the myocardium scars — and an operation fixes the valve but not the muscle.' },
        ]}>
        His EF still reads 52% because a huge preload flatters it. The end-systolic diameter is the early-warning light.
      </Why>
      <Contrast title="⚖️ combined overload (AR) vs pure pressure overload (AS) vs pure volume overload (MR)"
        is={{ h: 'Aortic regurgitation', points: ['Volume overload: the leak fills the LV in diastole.', 'Pressure overload: the huge stroke volume is ejected into the high-pressure aorta.', 'Eccentric AND concentric hypertrophy — the largest hearts in cardiology (“cor bovinum”).'] }}
        isnt={{ h: 'Mitral regurgitation / aortic stenosis', points: ['MR: volume overload ejected partly into a LOW-pressure LA — less wall stress.', 'AS: pressure overload with a small cavity and thick walls.', 'Neither ejects a huge volume against systemic pressure.'] }} />
      <Decision id="s3-op" question="🛠️ What operation should the heart team offer?"
        options={[
          { id: 'repair', label: 'Bicuspid aortic valve repair with replacement of the ascending aorta, in a centre experienced in valve repair — consented for a valve replacement (Bentall) if the repair is not satisfactory on TOE', verdict: 'best', points: 10,
            why: 'Thin, pliable, non-calcified cusps with prolapse: a good repair candidate. ESC/EACTS 2025 upgraded aortic valve repair in selected patients at experienced centres (IIa). No prosthesis, no warfarin — his stated goals — with a pre-agreed plan B.' },
          { id: 'mech', label: 'Mechanical aortic valve replacement with ascending aortic replacement', verdict: 'ok', points: 5,
            why: 'Durable and reasonable at 58 — below ~60 a mechanical valve is usually favoured for durability — but lifelong warfarin is what he wants to avoid, and his valve may be repairable.' },
          { id: 'ross', label: 'Ross procedure (pulmonary autograft)', verdict: 'ok', points: 3,
            why: 'An excellent option for selected younger adults at expert centres — but a dilated aorta from bicuspid aortopathy is a relative contraindication: the autograft can dilate in the same fragile root. And it turns one-valve disease into two-valve surgery.' },
          { id: 'tavi', label: 'Transcatheter valve (TAVI) for AR', verdict: 'wrong', points: 0,
            why: 'For inoperable or very high-risk patients with pure AR, using a dedicated device in experienced centres. Not for a fit 58-year-old with a 51-mm aorta that needs replacing anyway.' },
        ]} />
      <Decision id="s3-consent" question="💬 He asks: “If the repair doesn’t work, which valve do I get?”"
        options={[
          { id: 'shared', label: 'Explain both — mechanical (durable, lifelong warfarin, clicks) and biological (no warfarin, will likely need another procedure in 10–15 years, possibly a valve-in-valve) — and record his informed preference in the consent', verdict: 'best', points: 10,
            why: 'At 58 both are defensible. A decision made calmly in clinic is the one the surgeon will follow if things go wrong. Remember this conversation.' },
          { id: 'surgeon', label: '“The surgeon will decide on the day.”', verdict: 'wrong', points: 0, why: 'A choice about warfarin for life belongs to him — made before, not under anaesthesia.' },
          { id: 'mech', label: '“Mechanical — you’re too young for a tissue valve.”', verdict: 'ok', points: 3, why: 'A legitimate recommendation, but not the whole truth, and not his choice yet.' },
        ]} />
      <div className="cs-media-row">
        <Video id="ZzWwl2iobnw" title="Research Alert: Ross Procedure Leads to Improved Survival Benefit for Aortic Valve Patients" />
        <Video id="AUm3_onW_k4" title="Valve Sparing Aortic Root Replacement w/ David V Procedure" />
      </div>
    </>
  );
}

/* ============================================================
   4 · PLANNING — MEASURE THE AORTA
   ============================================================ */

function Planning() {
  const { answers, answer } = useCase();
  const r = answers['s4-ruler'];
  return (
    <>
      <p className="cs-p">ECG-gated CT angiogram of the thoracic aorta. Measure the aorta the way a surgeon’s decision depends on it: at its widest, inner edge to inner edge, perpendicular to the flow.</p>
      <AortaRuler done={r} onMeasure={res => answer('s4-ruler', res)} />
      {r && (
        <div className={'cs-fb ' + (r.max ? 'best' : 'ok')}>
          Recorded {r.read} mm at the {r.level} ({r.plane === 'perp' ? 'perpendicular plane' : 'plain axial slice'}). {r.max ? 'The true maximum: ~51 mm in the tubular ascending aorta.'
            : r.plane === 'axial' ? 'The axial slice cuts the curving ascending aorta obliquely — it overestimates (here ~57 mm, falsely past the 55-mm line). The true maximum is ~51 mm.'
              : 'Not the widest point. His sinuses are 43 mm; the tubular ascending aorta reaches ~51 mm about 5 cm above the annulus.'}
        </div>
      )}
      <ScoreOnce id="s4-ruler" pts={r == null ? null : r.max ? 12 : 4} max={12} />
      <Decision id="s4-asc" question="🧮 The ascending aorta is 51 mm. What do you do with it?"
        options={[
          { id: 'replace', label: 'Replace it at the same operation: he is having aortic valve surgery, and the aorta is ≥ 45 mm with low surgical risk', verdict: 'best', points: 10,
            why: 'When the aortic valve is operated on, concomitant replacement of the ascending aorta should be considered at ≥ 45 mm in low-risk patients. Leaving a 51-mm bicuspid aorta behind invites a dissection later.' },
          { id: 'watch', label: 'Leave it: it is below the 55-mm threshold', verdict: 'wrong', points: 0,
            why: '55 mm is the threshold for operating on the aorta ALONE. When the chest is open for the valve, the bar is lower.' },
          { id: 'tevar', label: 'Plan an endovascular stent-graft later', verdict: 'wrong', points: 0, why: 'Ascending aortic stent-grafts are not standard therapy for a fit patient with aneurysmal disease.' },
        ]} />
      <Contrast title="📐 the thresholds people mix up"
        is={{ h: 'Aorta ALONE (no valve surgery)', points: ['≥ 55 mm: surgery recommended for tricuspid and bicuspid valves.', 'Bicuspid ROOT phenotype: ≥ 50 mm.', 'Lower (≥ 50–52 mm) with risk factors — family history of dissection, rapid growth (≥ 3 mm/yr), coarctation, uncontrolled hypertension — or very low surgical risk.'] }}
        isnt={{ h: 'Aorta at the time of VALVE surgery', points: ['≥ 45 mm: concomitant replacement should be considered (low risk).', 'Because a second sternotomy later costs more than a few more minutes now.', 'His 51 mm: replace.'] }} />
      <Note kind="evid" title="📚 Which guideline?">Aortic diameters come from the 2024 ESC guidelines on peripheral arterial and aortic diseases; the concomitant-replacement rule and LV triggers from the 2025 ESC/EACTS valvular guidelines. Exact thresholds and classes differ slightly between the European and American documents — check the current tables before you quote one in a meeting.</Note>
      <Why title="🧬 Why a bigger aorta tears more easily (Laplace)"
        chain={[
          { k: 'LAPLACE', t: 'Wall tension = pressure × radius / wall thickness.' },
          { k: 'BIGGER', t: 'At 51 mm the wall carries ~20% more tension than at 42 mm at the same pressure.' },
          { k: 'BICUSPID WALL', t: 'Bicuspid aortopathy has a weaker media (fragmented elastin, smooth-muscle loss) — and his eccentric jet hits the convexity every beat.' },
          { k: 'AR ADDS', t: 'His huge stroke volume and steep pressure upstroke (high dP/dt) add pulsatile stress.' },
          { k: 'SO', t: 'BP control (systolic < 130), no heavy straining, and replace the aorta at the right size.' },
        ]} />
      <MultiSelect id="s4-workup" question="🧾 Before an elective aortic valve and ascending aortic operation, he also needs…"
        items={[
          { id: 'cor', label: 'Coronary assessment (man > 40, ex-smoker, hypertensive)', correct: true, why: 'Coronary angiography — invasive or CT — before valve surgery. His CT coronary images were non-diagnostic: heavy LAD calcium (Agatston 640). Invasive angiography is booked.' },
          { id: 'dent', label: 'A dental review, with any treatment done before surgery', correct: true, why: 'Removes a source of prosthetic or repair endocarditis.' },
          { id: 'fam', label: 'Echo screening of his first-degree relatives', correct: true, why: 'Bicuspid valves and aortopathy cluster in families — and his father died of a “burst artery”.' },
          { id: 'bp', label: 'Blood pressure control to < 130/80 with a vasodilator while he waits', correct: true, why: 'Lower wall stress; ACE inhibitor/ARB or dihydropyridine.' },
          { id: 'fq', label: 'Avoid fluoroquinolone antibiotics', correct: true, why: 'Associated with aneurysm progression and dissection; avoided in patients with aortic aneurysm when alternatives exist.' },
          { id: 'warf', label: 'Start warfarin now in case he gets a mechanical valve', correct: false, why: 'No indication before surgery.' },
        ]} />
    </>
  );
}

/* ============================================================
   5 · SET-UP — PRE-OPERATIVE CORONARY ANGIOGRAPHY
   ============================================================ */

function Setup() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🗓️ Day 5 · 08:00</span>Cath lab 2. Invasive coronary angiography before his aortic surgery, booked for day 26. Right radial access planned.</p>
      </div>
      <MultiSelect id="s5-check" question="✅ Before you start: what must be in place?"
        items={[
          { id: 'ct', label: 'The CT aortogram open on the screen: root and ascending dimensions', correct: true, why: 'You are about to put a catheter into a 51-mm bicuspid aorta. Know its shape.' },
          { id: 'curve', label: 'Larger Judkins left curves on the trolley (JL 5, JL 6)', correct: true, why: 'A dilated ascending aorta needs a longer primary curve to reach the left main.' },
          { id: 'bp', label: 'Blood pressure checked and controlled', correct: true, why: 'No catheter manipulation in an unstable, hypertensive aorta.' },
          { id: 'access', label: 'Barbeau test / radial assessment; femoral as a back-up', correct: true, why: 'Radial first: fewer bleeding complications.' },
          { id: 'pigtail', label: 'A plan for a root aortogram to grade the AR', correct: false, why: 'Echo and MRI already graded it. Aortography adds contrast, radiation and a pigtail in a fragile root — for nothing.' },
        ]} />
      <Sequence id="s5-seq" question="🔢 Put the procedure in order."
        steps={[
          { label: 'Right radial access under local anaesthetic; spasmolytic cocktail; 5,000 units heparin', why: 'Prevents radial artery occlusion.' },
          { label: 'Wire up the subclavian into the ascending aorta under fluoroscopy, soft J-tip leading', why: 'Never push against resistance in a dilated aorta.' },
          { label: 'Engage the left main with a JL 5, watching the tip pressure', why: 'A damped trace means stop.' },
          { label: 'Left coronary views; then the right coronary', why: 'Standard projections.' },
          { label: 'Cross into the LV with a pigtail or the diagnostic catheter; record LV and aortic pressures', why: 'LVEDP tells you how well the LV is coping.' },
        ]} />
      <Why title="🧬 Why the left main is hard to reach in his aorta"
        chain={[
          { k: 'GEOMETRY', t: 'A Judkins left is shaped to bridge a normal ascending aorta (~30–35 mm) from its right wall to the left coronary ostium.' },
          { k: 'WIDER', t: 'His aorta is 51 mm: the standard curve falls short — the tip points upward into the sinus.' },
          { k: 'FORCE IT?', t: 'Pushing and torquing a short curve risks the catheter flicking deep into the left main, or scraping a fragile wall.' },
          { k: 'UPSIZE', t: 'A longer curve (JL 5 or 6) sits naturally at the ostium without force.' },
        ]} />
      <Contrast title="🩸 his aorta vs a normal aorta in the cath lab"
        is={{ h: 'Dilated bicuspid aorta', points: ['Longer curves; gentle movements.', 'No unnecessary root injections or pigtail loops in the sinus.', 'BP controlled before you start.'] }}
        isnt={{ h: 'Normal aorta', points: ['JL 4 / JR 4 usually engage.', 'Routine catheter exchanges carry negligible aortic risk.', 'Aortography rarely needed either way.'] }} />
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
      <Decision id="s6-curve" question="🧭 The JL 4 is in the root. Its tip points upward and will not reach the left main. You…"
        options={[
          { id: 'up', label: 'Exchange over a wire for a JL 5', verdict: 'best', points: 10, why: 'Match the curve to the aorta, not the aorta to the curve.' },
          { id: 'push', label: 'Push and twist the JL 4 until it drops in', verdict: 'wrong', points: 0, why: 'Stored torque releases suddenly: the tip can jump deep into the left main and dissect it.' },
          { id: 'amp', label: 'Switch to an Amplatz left 2 straight away', verdict: 'ok', points: 4, why: 'Will engage, but sits deep and is more traumatic; a step after a longer Judkins fails.' },
        ]} />
      <Why title="🧬 Why injecting into a damped catheter tears the artery"
        chain={[
          { k: 'WEDGED', t: 'The tip sits against the wall or inside an ostial narrowing: no blood can flow past it.' },
          { k: 'NO RUN-OFF', t: 'Contrast injected now has nowhere to go but into the vessel wall.' },
          { k: 'HYDRAULIC JET', t: 'A few mL under hand pressure lifts the intima: a dissection flap.' },
          { k: 'OR NO FLOW', t: 'Or the artery is occluded by the catheter while it fills with contrast: ischaemia, VF.' },
        ]} />
      {answers['s6-curve'] === 'push' && <Note kind="warn" title="💥 Consequence">The catheter flicks into the left main, the pressure ventricularises, and a test puff hangs in the vessel wall. You have just created a left main dissection in a man booked for valve surgery. (In this run, it settles — the lesson does not.)</Note>}
      <Decision id="s6-damp" question="📉 After engaging, the tip pressure loses its dicrotic notch and falls to 80/40 with a flat diastolic slope. You…"
        options={[
          { id: 'pull', label: 'Pull back until the pressure is normal before any injection', verdict: 'best', points: 10, why: 'Damping = the catheter is wedged against the wall or in an ostial lesion. Injecting into it can dissect the vessel or cause VF.' },
          { id: 'inject', label: 'Inject — the pictures will tell you', verdict: 'wrong', points: 0, why: 'A forceful injection into a wedged catheter is a classic cause of iatrogenic dissection and ventricular fibrillation.' },
        ]} />
      <Decision id="s6-lv" question="🔁 Cross into the LV to measure LVEDP?"
        options={[
          { id: 'yes', label: 'Yes — crossing a regurgitant (not stenotic) valve is easy and the LVEDP adds information', verdict: 'best', points: 6,
            why: 'In chronic AR, a raised LVEDP is a sign the ventricle is losing compliance. It costs seconds and no contrast.' },
          { id: 'ventric', label: 'Yes, and do a 30-mL left ventriculogram', verdict: 'ok', points: 2, why: 'His EF and volumes come from MRI. Extra contrast for no new answer.' },
          { id: 'no', label: 'Never cross the aortic valve', verdict: 'wrong', points: 1, why: 'That rule is for heavily calcified aortic stenosis, where crossing carries a stroke risk.' },
        ]} />
      <Decision id="s6-aorto" question="🎨 The registrar suggests a root aortogram “to see the leak for ourselves”."
        options={[
          { id: 'no', label: 'Decline: echo and MRI agree it is severe; aortography is for when non-invasive imaging is inconclusive', verdict: 'best', points: 8,
            why: 'Invasive grading (Sellers 1+ to 4+) is semi-quantitative, operator-dependent, adds 30–40 mL of contrast and a power injection into a fragile root.' },
          { id: 'yes', label: 'Do it — it is the gold standard', verdict: 'wrong', points: 0, why: 'It was the gold standard in 1964. CMR is the reference today.' },
        ]} />
    </>
  );
}

/* ============================================================
   7 · THE PROCEDURE — ENGAGE, THEN MEASURE
   ============================================================ */

function Procedure() {
  const { answers, answer, bump } = useCase();
  const e = answers['s7-engage'], p = answers['s7-press'];
  const eGrade = !e ? null : e.curve === e.ideal && !e.deep && e.shots <= 3 ? 'best' : e.curve >= e.ideal && !e.deep ? 'ok' : 'wrong';
  return (
    <>
      <p className="cs-p">🎥 LAO 40°. Pick a curve, advance it gently, puff to see where you are, and record the left coronary run only when the tip is coaxial and the pressure is clean.</p>
      <CoronaryEngage rootMm={46} done={e} onResult={res => { answer('s7-engage', res); bump({ contrast: res.shots * 4 + 42, fluoro: 260 + res.shots * 15, act: 220 }); }} />
      {e && (
        <div className={'cs-fb ' + eGrade}>
          JL {e.curve}, {e.shots} test puff{e.shots === 1 ? '' : 's'}{e.deep ? ', recorded with a damped trace' : ''}. {eGrade === 'best' ? 'Coaxial, no damping, minimal contrast: textbook.'
            : e.deep ? 'You injected into a wedged catheter — the trace was damped. That is how left main dissections happen.' : 'Engaged — but with more puffs than needed.'}
        </div>
      )}
      <ScoreOnce id="s7-engage" pts={e == null ? null : eGrade === 'best' ? 15 : eGrade === 'ok' ? 8 : 2} max={15} />
      {e && (
        <>
          <Note kind="pearl" title="🖼️ The coronaries">Left dominant system? No — right dominant. Heavily calcified mid-LAD with a 50% stenosis; circumflex and RCA smooth. iFR of the LAD: 0.94.</Note>
          <Decision id="s7-lad" question="Mid-LAD 50%, iFR 0.94. At his aortic operation:"
            options={[
              { id: 'no', label: 'No graft: the lesion is not haemodynamically significant (iFR > 0.89); treat with statin and risk-factor control', verdict: 'best', points: 8,
                why: 'Grafting a non-significant lesion invites competitive flow and graft failure. His atherosclerosis still needs high-intensity statin therapy.' },
              { id: 'graft', label: 'A LIMA to the LAD “while the chest is open”', verdict: 'wrong', points: 2, why: 'Competitive flow from a native vessel that is not limiting tends to close the graft.' },
            ]} />
          <div className="cs-h2">📈 Now cross into the LV — read the pressures</div>
          <AoLVPressure mode="chronic" done={p} onMeasure={res => answer('s7-press', res)} />
          {p && <div className={'cs-fb ' + (p.close ? 'best' : 'ok')}>LVEDP {p.lvedp}, aortic diastolic {p.aod} mmHg. {p.close ? 'Correct: LVEDP ~18, aortic diastolic ~46 — a compensated, compliant ventricle, a gap of ~28 mmHg still perfusing the coronaries.' : 'Read at end-diastole, just before the LV upstroke: LVEDP ~18, aortic ~46.'}</div>}
          <ScoreOnce id="s7-press" pts={p == null ? null : p.close ? 10 : 3} max={10} />
          <Why title="🧬 Why his coronaries are at risk even with clean arteries"
            chain={[
              { k: 'DIASTOLIC FLOW', t: 'Left coronary flow happens mostly in diastole.' },
              { k: 'DRIVING PRESSURE', t: 'Coronary perfusion pressure ≈ aortic diastolic − LVEDP.' },
              { k: 'AR LOWERS ONE', t: 'His aortic diastolic is 46, not 75.' },
              { k: 'AND RAISES DEMAND', t: 'A thick, dilated LV with high wall stress needs more oxygen.' },
              { k: 'SO', t: 'Angina without coronary disease is possible in severe AR — and if LVEDP rises (acute AR), the gap closes.' },
            ]} />
        </>
      )}
      <CaseLibrary title="🎬 Aortic regurgitation in real cases" channels={AR_SEARCHES}>
        Searches on the recommended structural channels for aortic regurgitation cases and talks.
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🛏️ 15:00</span>Bed 11. Radial band off, hand pink, pulse present. BP 148/52 on amlodipine. Surgery booked for day 26. He wants to go home and “get the garden sorted before the op”.</p>
      </div>
      <Decision id="s8-bp" question="💊 His BP regimen while he waits three weeks?"
        options={[
          { id: 'acei', label: 'Add ramipril, titrate to a systolic < 130 mmHg; keep amlodipine', verdict: 'best', points: 10,
            why: 'Vasodilators lower systolic pressure and aortic wall stress without slowing the heart. They do not replace or delay surgery.' },
          { id: 'bb', label: 'Bisoprolol 10 mg to protect the aorta', verdict: 'ok', points: 4,
            why: 'Beta-blockers protect the aorta in Marfan syndrome and after dissection. In severe AR a high dose slows the heart and lengthens diastole — if used, use modestly and watch the LV.' },
          { id: 'none', label: 'No change — surgery is coming anyway', verdict: 'wrong', points: 0, why: 'Three weeks of 160 mmHg on a 51-mm bicuspid aorta is three weeks of avoidable risk.' },
        ]} />
      <MultiSelect id="s8-safety" question="🏠 What does he take home besides his tablets?"
        items={[
          { id: 'card', label: 'Written red flags: sudden severe chest, back or abdominal pain, fainting, breathlessness → call an ambulance and say “I have an aortic aneurysm”', correct: true, why: 'He and his wife — and the crew — must know what this pain might be.' },
          { id: 'lift', label: 'Avoid heavy lifting and straining (no heavy isometric exercise) until surgery', correct: true, why: 'A heavy lift can drive systolic pressure above 250 mmHg.' },
          { id: 'abx', label: 'No fluoroquinolones; tell any prescriber about the aneurysm', correct: true, why: 'Aneurysm progression and dissection signal.' },
          { id: 'dent', label: 'The dental check — done (two fillings, no extraction needed)', correct: true, why: 'Before any prosthetic material goes in.' },
          { id: 'hike', label: 'Encouragement to keep up hill-walking at full pace', correct: false, why: 'Gentle walking yes; hard climbing with packs, no, until the aorta is replaced.' },
        ]} />
      <Why title="🏋️ Why a heavy lift is dangerous for his aorta"
        chain={[
          { k: 'VALSALVA', t: 'Lifting with a held breath raises intrathoracic pressure.' },
          { k: 'PRESSOR SURGE', t: 'Isometric effort and the strain drive the systolic pressure up — briefly above 250 mmHg in heavy lifts.' },
          { k: 'LAPLACE', t: 'Wall tension rises with pressure × radius: his 51-mm aorta takes the full spike.' },
          { k: 'TEAR', t: 'Many acute dissections begin during, or hours after, a heavy exertion.' },
        ]} />
      <Contrast title="🫀 vasodilators in AR: what they do vs what they don’t"
        is={{ h: 'They DO', points: ['Treat hypertension and lower systolic wall stress.', 'Relieve symptoms in patients who cannot have surgery.', 'Reduce the regurgitant volume a little.'] }}
        isnt={{ h: 'They DON’T', points: ['Delay the need for surgery in asymptomatic severe AR (trials conflict).', 'Replace surgery once a trigger is met.', 'Help in ACUTE AR as a definitive measure — that needs a surgeon.'] }} />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — THE AORTA TEARS
   ============================================================ */

function Crisis() {
  const { answers, answer, setVitals } = useCase();
  const ic = answers['s9-ic'], ap = answers['s9-press'], ph = answers['s9-pht'], fixed = answers['s9-op'];
  const icPts = ic == null ? null : ic.danger ? 0 : ic.inBox && !ic.meto ? 15 : ic.inBox ? 8 : 5;
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p"><span className="cs-time" style={{ color: 'var(--red)' }}>🌙 03:10 · day 17</span>Straining to lift a full compost bag earlier that evening, he went to bed with an ache. At 03:00 he woke with “a knife going through my chest into my back”. His wife reads the card on the fridge and calls 999: “He has an aortic aneurysm.”</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>🚑 03:24</span>Crew on scene. Grey, sweating, breathless. R arm 176/62, L arm 142/58. HR 114. SpO₂ 92%. Crackles at both bases. The diastolic murmur is now short and soft — and the collapsing pulse is gone.</p>
      </div>
      <BedsideMonitor />
      <MultiSelect id="s9-pre" question="🚑 Pre-hospital: what does the crew do?"
        items={[
          { id: 'alert', label: 'Pre-alert the receiving cardiac-surgical centre: “suspected aortic dissection, known 51-mm aorta, bicuspid valve”', correct: true, why: 'Bypass the hospital that cannot operate if your system allows it; time is the treatment.' },
          { id: 'bp2', label: 'Blood pressure in both arms; 12-lead ECG', correct: true, why: 'A 34-mmHg arm difference; the ECG excludes STEMI and may show ischaemia.' },
          { id: 'ana', label: 'IV access and titrated IV opioid analgesia', correct: true, why: 'Pain drives the sympathetic surge that drives the tear.' },
          { id: 'o2', label: 'Oxygen to SpO₂ 94–98%', correct: true, why: 'He is hypoxic from pulmonary oedema.' },
          { id: 'asp', label: 'Aspirin 300 mg for chest pain', correct: false, why: 'Not when dissection is the leading diagnosis: it worsens bleeding into the pericardium and at surgery.' },
          { id: 'gtn', label: 'Sublingual GTN for the pain', correct: false, why: 'Vasodilator before rate control raises dP/dt (reflex tachycardia); and pressure may crash with tamponade.' },
        ]} />
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🏥 Resus · 04:02 — bedside echo and CT</div>
        <Table head={['', 'Finding']} rows={[
          ['POCUS', 'Ascending aorta 56 mm with a mobile flap; small pericardial effusion, no RV collapse; LV hyperdynamic'],
          ['CT aortogram', 'Stanford type A dissection from the root to the proximal arch; flap prolapsing through the aortic valve in diastole; coronaries perfused'],
          ['AR', 'Now torrential: flail flap holding the commissures apart'],
          ['ECG', 'Sinus tachycardia 114; 1 mm ST depression V4–V6'],
          ['Troponin / lactate', N('hs-TnT 48 ng/L · lactate 3.1', 'cs-hi')],
        ]} />
      </div>
      <Decision id="s9-dx" question="🧠 What has happened to his regurgitation?"
        options={[
          { id: 'acute', label: 'Acute-on-chronic severe AR: the dissection has torn the commissural support and the flap prolapses through the valve', verdict: 'best', points: 10,
            why: 'Type A dissection causes AR by commissural detachment, root dilatation or flap prolapse. His LV, already full and stiffening, is suddenly given far more than it can take.' },
          { id: 'mi', label: 'An anterior NSTEMI with heart failure', verdict: 'wrong', points: 0, why: 'ST depression from a collapsed coronary perfusion gradient — not a plaque event. Treat it as ACS and you will kill him.' },
          { id: 'tamp', label: 'Tamponade', verdict: 'ok', points: 2, why: 'The effusion is small and there is no RV collapse — yet. It can become tamponade in minutes.' },
        ]} />

      <div className="cs-h2">🎧 His murmur now</div>
      <ARAuscultation lesions={['ar-acute', 'ar-chronic']} />
      <PulseWave initial="acute" modes={['acute', 'collapsing', 'normal']} />
      <Contrast title="🔍 why his signs disappeared"
        is={{ h: 'Now — acute on chronic', points: ['The LV is overfilled: LVEDP rises to meet the aortic diastolic pressure.', 'The leak stops early in diastole: short, soft murmur; pulse pressure narrows.', 'S1 soft: the mitral valve is shut early by the LV pressure.'] }}
        isnt={{ h: 'Day 1 — chronic', points: ['A compliant LV, a long diastolic gradient.', 'Long murmur, collapsing pulse, 124 mmHg pulse pressure.', 'Signs that reassure nobody now.'] }} />

      <div className="cs-h2">📏 The Doppler tells the same story</div>
      <ARDoppler pht={110} v0={3.8} done={ph} onMeasure={r => answer('s9-pht', r)} title="CW across the aortic valve, resus bay" />
      {ph && <div className={'cs-fb ' + (ph.close ? 'best' : 'ok')}>PHT {ph.pht} ms (true ~110). A half-time this short means the LV pressure is racing up to the aortic pressure: the hallmark of acute AR.</div>}
      <ScoreOnce id="s9-pht" pts={ph == null ? null : ph.close ? 6 : 2} max={6} />
      <AoLVPressure mode="acute" done={ap} onMeasure={r => answer('s9-press', r)} />
      {ap && <div className={'cs-fb ' + (ap.close ? 'best' : 'ok')}>LVEDP {ap.lvedp}, aortic diastolic {ap.aod}: a gap of {ap.gap} mmHg. {ap.close ? 'Diastasis — near-equal pressures: the leak stops early, the mitral valve closes before systole, the coronaries starve.' : 'In acute AR they nearly meet: ~50 vs ~54.'}</div>}
      <ScoreOnce id="s9-press" pts={ap == null ? null : ap.close ? 8 : 3} max={8} />
      <Why title="🧬 Why acute AR kills when chronic AR is tolerated for years"
        chain={[
          { k: 'NO TIME', t: 'The LV has not dilated to match the new leak: its compliance curve is steep.' },
          { k: 'LVEDP ↑↑', t: 'Each extra millilitre in diastole drives the pressure up: 15 → 50 mmHg.' },
          { k: 'EARLY MITRAL CLOSURE', t: 'LV pressure overtakes LA pressure before systole: the mitral valve shuts early. It protects the lungs a little — but the LA pressure still climbs: pulmonary oedema.' },
          { k: 'FORWARD FLOW ↓', t: 'Effective stroke volume falls; tachycardia is the only compensation.' },
          { k: 'CORONARIES', t: 'Aortic diastolic ≈ LVEDP: perfusion pressure ~0 → ischaemia → a weaker LV → higher LVEDP. Death in hours without surgery.' },
        ]} />

      <div className="cs-h2">⚖️ The tension: impulse control vs the leak</div>
      <p className="cs-p">The dissection wants a slow heart and low pressure (less shear on the false lumen). The acute AR wants a fast heart (less time to leak). Titrate.</p>
      <ImpulseControl done={ic} onResult={res => { answer('s9-ic', res); setVitals({ hr: res.hr, sys: res.sys, dia: res.dia, spo2: res.spo2 }); }} />
      {ic && <div className={'cs-fb ' + (icPts >= 15 ? 'best' : icPts >= 5 ? 'ok' : 'wrong')}>HR {ic.hr}, BP {ic.sys}/{ic.dia}, LVEDP {ic.lvedp}. {icPts >= 15 ? 'Analgesia, short-acting beta-blockade titrated to a rate the leak tolerates, a vasodilator only after the rate was controlled.' : ic.meto ? 'Bolused metoprolol cannot be taken back — if the rate falls further in theatre, no one can turn it off.' : ic.danger ? 'Too slow, too low: the leak has won. In acute AR, bradycardia is lethal.' : 'Shear not yet controlled.'}</div>}
      <ScoreOnce id="s9-ic" pts={icPts} max={15} />

      <Decision id="s9-iabp" question="🎈 The ED registrar suggests an intra-aortic balloon pump “to support the pressure until theatre”."
        options={[
          { id: 'no', label: 'Absolutely not: moderate-to-severe AR is a contraindication — and in a dissected aorta the balloon could go into the false lumen', verdict: 'best', points: 10,
            why: 'The balloon inflates in diastole — exactly when the valve is leaking. It pushes more blood backwards into the LV, raising LVEDP. And a wire and balloon in a dissected aorta can perforate or enter the false lumen.' },
          { id: 'yes', label: 'Yes — it improves coronary perfusion', verdict: 'wrong', points: 0, why: 'Diastolic augmentation with an incompetent valve augments the leak.' },
        ]} />
      <Decision id="s9-pc" question="💧 The effusion is now 12 mm and his pressure dips to 98/60. Pericardiocentesis?"
        options={[
          { id: 'theatre', label: 'No — go to theatre now; needle drainage only for pulseless arrest, and then small, controlled aliquots', verdict: 'best', points: 10,
            why: 'Draining a haemopericardium in dissection removes the tamponade that is holding the rupture shut: pressure surges, bleeding restarts, death.' },
          { id: 'drain', label: 'Drain it in the ED — tamponade is reversible', verdict: 'wrong', points: 0, why: 'In type A dissection, the bleeding source is the aorta. The fix is the surgeon.' },
        ]} />
      <Decision id="s9-op" question="🏥 The definitive fix?"
        onAnswer={() => setVitals({ hr: 88, sys: 118, dia: 64, spo2: 97, rr: 16 })}
        options={[
          { id: 'bentall', label: 'Emergency surgery: replacement of the root and ascending aorta with a composite valve graft (Bentall) and hemiarch — a biological valve, as he chose in clinic', verdict: 'best', points: 10,
            why: 'A bicuspid valve inside a dissected root is not a repair candidate at 04:30. His recorded, informed preference decides the valve — the consent conversation from day 2, paying off.' },
          { id: 'resus', label: 'Resuspend the commissures and replace the tubular ascending aorta only', verdict: 'ok', points: 4, why: 'Works for many tricuspid valves in dissection; with a bicuspid, regurgitant valve and a dissected root, durability is poor.' },
          { id: 'tevar', label: 'Endovascular stent-graft', verdict: 'wrong', points: 0, why: 'Not for type A dissection with valve involvement.' },
          { id: 'med', label: 'Medical management in ICU', verdict: 'wrong', points: 0, why: 'Untreated type A dissection kills about 1–2% per hour in the first day.' },
        ]} />
      {answers['s9-op'] && !fixed && <button className="cs-btn primary" onClick={() => answer('s9-op-done', true)}>🔪 Off to theatre</button>}
      {answers['s9-op-done'] && <div className="cs-fb best">05:10 knife to skin. Bentall with a 27-mm biological composite graft and hemiarch replacement under brief circulatory arrest. Off bypass at 09:40; TOE: no AR, good LV. By evening he is extubated, asking about his garden.</div>}

      <div className="cs-media-row" style={{ marginTop: 12 }}>
        <Video id="mbUt5vcDpGI" title="Aortic Dissection — Stanford Type A vs Stanford Type B — Cardiology Series" />
        <Video id="fUaSAx0elMM" title="Aortic Dissection — Thoracic & Abdominal — Animation" channel="Cal Shipley, M.D." />
      </div>
      <div className="cs-media-row">
        <Video id="jeIzJwrDfYQ" title="Acute Aortic Dissection, Stanford Type A, POCUS" />
        <Figure src={WIKI('Pericardial_effusion_with_tamponade_(cropped).gif')} href={WIKIPAGE('Pericardial_effusion_with_tamponade_(cropped).gif')} alt="Echocardiogram of a pericardial effusion with tamponade" caption="Where his small effusion was heading: a haemopericardium with tamponade physiology." credit="Wikimedia Commons (see file page for licence)" />
      </div>
      <CaseLibrary title="🎬 Aortic dissection on the recommended channels" channels={DISSECTION_SEARCHES} />
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
      <ViciousCycle id="cyc-acute" title="🌀 The acute AR spiral — 04:00"
        nodes={[
          { short: 'Torrential leak', t: 'A sudden large regurgitant volume', d: 'Into a ventricle that has never had to hold it.' },
          { short: 'LVEDP ↑↑', t: 'LV end-diastolic pressure soars', d: 'A steep compliance curve: small volumes, big pressures.' },
          { short: 'Wet lungs', t: 'LA pressure rises: pulmonary oedema', d: 'Despite early mitral closure.' },
          { short: 'Low output', t: 'Forward stroke volume falls', d: 'Hypotension; tachycardia is the only compensation.' },
          { short: 'Coronaries', t: 'Aortic diastolic − LVEDP → zero', d: 'Subendocardial ischaemia: ST depression.' },
          { short: 'Weaker LV', t: 'Contractility falls', d: 'The LV empties less: more volume, higher pressure — the spiral tightens.' },
        ]}
        breaks={[
          { at: 0, t: 'Surgery: the only definitive cut.' },
          { at: 3, t: 'Keep the heart rate up: avoid bradycardia; temporary pacing at ~90–110 in extremis.' },
          { at: 5, t: 'Dobutamine for contractility; nitroprusside cautiously to lower afterload if the pressure allows.' },
          { at: 2, t: 'Oxygen, CPAP, diuretic as a bridge.' },
          { at: 4, t: 'NEVER an intra-aortic balloon pump: it inflates into the leak.' },
        ]} />
      <Decision id="cyc-hr" question="🫀 In acute severe AR without dissection (say, endocarditis), the heart rate falls to 50 after a vagal episode. What do you do?"
        options={[
          { id: 'pace', label: 'Treat it as an emergency: atropine/isoprenaline, or temporary pacing at a higher rate, while surgery is arranged', verdict: 'best', points: 10,
            why: 'Shorter diastole, less regurgitation per beat. Tachycardia is life support in acute AR.' },
          { id: 'wait', label: 'Observe — a slower rate means more filling time', verdict: 'wrong', points: 0, why: 'More filling time is more LEAKING time.' },
        ]} />
      <ViciousCycle id="cyc-chronic" title="🕰️ The silent spiral — chronic AR"
        nodes={[
          { short: 'Double load', t: 'Volume AND pressure overload', d: 'A huge stroke volume ejected against systemic pressure.' },
          { short: 'Dilatation', t: 'The LV dilates and hypertrophies', d: 'Eccentric plus concentric remodelling.' },
          { short: 'Wall stress', t: 'Laplace: radius ↑ → wall stress ↑', d: 'Hypertrophy can no longer keep up.' },
          { short: 'Afterload mismatch', t: 'End-systolic size creeps up; EF drifts down', d: 'Still “normal-looking” for a while.' },
          { short: 'Fibrosis', t: 'Irreversible myocardial damage', d: 'Surgery now fixes the valve, not the muscle.' },
        ]}
        breaks={[
          { at: 3, t: 'Operate on the numbers: LVESD > 50 mm, LVESDi > 25 mm/m², EF ≤ 50% (lower tier in low-risk patients).' },
          { at: 2, t: 'Control systolic pressure with vasodilators.' },
          { at: 0, t: 'Serial echo or CMR at intervals matched to severity — and chase the missed appointments.' },
        ]} />
      <ViciousCycle id="cyc-aorta" title="🧨 The aortic spiral — bicuspid aortopathy"
        nodes={[
          { short: 'Weak media', t: 'Bicuspid aortopathy: fragile media', d: 'Genetic and haemodynamic (the eccentric jet).' },
          { short: 'Dilatation', t: 'The ascending aorta widens', d: 'Slowly — 0.5–1 mm per year.' },
          { short: 'Tension', t: 'Laplace: more radius, more wall tension', d: 'At the same pressure.' },
          { short: 'Faster growth', t: 'More tension, faster growth', d: 'And a straining lift spikes the pressure.' },
          { short: 'Tear', t: 'Intimal tear: dissection', d: 'Often below the “threshold” diameter.' },
        ]}
        breaks={[
          { at: 2, t: 'BP control < 130/80; avoid heavy isometric straining.' },
          { at: 1, t: 'Imaging surveillance; replace at ≥ 55 mm (≥ 50 mm root phenotype or risk factors), or ≥ 45 mm at valve surgery.' },
          { at: 4, t: 'Teach the red flags; pre-alert pathways for paramedics.' },
        ]} />
      <Decision id="cyc-why" question="🧠 Why did he dissect at 56 mm when his elective scan said 51?"
        options={[
          { id: 'acute', label: 'The aorta expands at the moment of dissection; the pre-dissection diameter was 51 — many dissections happen below the 55-mm threshold', verdict: 'best', points: 10,
            why: 'Thresholds are population averages. Risk factors (family history, bicuspid valve, hypertension, straining) lower the personal threshold — which is why his surgery was planned, and why waiting carries risk.' },
          { id: 'err', label: 'The elective CT was wrong', verdict: 'wrong', points: 0, why: 'Measured correctly, perpendicular to the flow. The tear made it bigger.' },
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
      <WarStory title="🎈 The balloon that pushed the wrong way"
        mistake="An intra-aortic balloon pump for cardiogenic shock in acute AR from endocarditis."
        burn="Moderate-to-severe AR is a contraindication to a balloon pump. It inflates into the leak.">
        <p className="cs-p">A 34-year-old who injected drugs, febrile, hypotensive, in pulmonary oedema. “Cardiogenic shock — balloon pump.” With each diastolic inflation the LVEDP climbed; within 20 minutes, PEA arrest. The TOE afterward showed a perforated aortic cusp and torrential AR.</p>
      </WarStory>
      <Decision id="mm-iabp" question="What should have been the bridge to surgery?"
        options={[
          { id: 'ino', label: 'Dobutamine ± cautious nitroprusside, a high heart rate preserved, and emergency surgery', verdict: 'best', points: 10, why: 'Contractility and afterload reduction, keep diastole short, operate.' },
          { id: 'nor', label: 'Noradrenaline to MAP 80', verdict: 'wrong', points: 0, why: 'Raising diastolic pressure behind the leak increases regurgitation — sometimes unavoidable in extremis, never the plan.' },
        ]} />
      <WarStory title="💊 The beta-blocker by the book"
        mistake="Metoprolol boluses to a heart rate of 55 in type A dissection with torrential acute AR."
        burn="Dissection wants a slow heart; acute AR wants a fast one. Use esmolol, titrate, accept a higher rate — and get to theatre.">
        <p className="cs-p">“Target HR under 60.” Three boluses of metoprolol: rate 54, pressure 74/38, SpO₂ 81%, then VF on the transfer trolley. He reached theatre on bypass — and did not leave intensive care.</p>
      </WarStory>
      <Decision id="mm-bb" question="Which beta-blocker belongs in this situation, if any?"
        options={[
          { id: 'esm', label: 'IV esmolol, titrated, with a rate floor you accept because of the AR', verdict: 'best', points: 10, why: 'Off in minutes if the leak starts to win.' },
          { id: 'meto', label: 'Metoprolol boluses until HR < 60', verdict: 'wrong', points: 0, why: 'Long-acting and impossible to reverse quickly.' },
          { id: 'none', label: 'None at all, ever', verdict: 'ok', points: 4, why: 'With hypotension or tamponade, correct — no beta-blocker. With hypertension and dissection, cautious short-acting blockade still has a role.' },
        ]} />
      <WarStory title="🩸 The ACS that wasn’t"
        mistake="Aspirin, ticagrelor and heparin for chest pain with ST depression in a patient with a known 52-mm aorta."
        burn="Before antithrombotics for chest pain: think of the aorta. Bilateral arm pressures, the history, a bedside echo.">
        <p className="cs-p">ST depression, troponin 60: “NSTEMI — load and cath.” The angiogram catheter would not engage; a root injection showed a flap. At surgery he bled from every suture line. He died on the second post-operative day.</p>
      </WarStory>
      <Decision id="mm-acs" question="Which single bedside step would most likely have changed the course?"
        options={[
          { id: 'echo', label: 'A focused echo (aortic root, flap, AR, effusion) and both-arm pressures before antithrombotics', verdict: 'best', points: 10, why: 'Minutes, at the bedside, with a known aneurysm in the notes.' },
          { id: 'trop', label: 'A repeat troponin at 3 hours', verdict: 'wrong', points: 0, why: 'Troponin rises in both.' },
        ]} />
      <WarStory title="📭 The letter nobody read"
        mistake="Asymptomatic severe AR followed until symptoms, with an echo report filed and never acted on."
        burn="Operate on the numbers. And chase the patient who does not come back.">
        <p className="cs-p">A 49-year-old with a bicuspid valve, severe AR and an LVESD that crept from 46 to 58 mm over four years of missed visits. When breathlessness finally brought him in, the EF was 38%. After his valve replacement the ventricle never recovered; he received a defibrillator after an episode of VT, and was listed for transplant at 53.</p>
      </WarStory>
      <WarStory title="💧 The tap that opened the dam"
        mistake="Draining a haemopericardium in type A dissection in the ED."
        burn="In dissection, tamponade is the lid on the rupture. The treatment is the surgeon, not the needle.">
        <p className="cs-p">Pressure 80/50 with a 15-mm effusion: “tamponade — tap it.” 300 mL out, the pressure leapt to 170/90 — and then fell to nothing. The pericardium refilled faster than it could be drained.</p>
      </WarStory>
      <WarStory title="🌫️ The quiet murmur"
        mistake="Calling acute AR “sepsis with pneumonia” because there was no collapsing pulse."
        burn="Acute severe AR is quiet: no wide pulse pressure, a short soft murmur, a soft S1. Echo the febrile patient in pulmonary oedema.">
        <p className="cs-p">A 61-year-old with fever and crackles, BP 104/66, “a soft murmur”. Two litres of fluid for sepsis. By morning: intubated, a vegetation on the aortic valve and a flail cusp. She survived emergency surgery — after 9 days on ECMO.</p>
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🏡 Day 26</span>Home on the day his elective operation was meant to happen. Sinus rhythm, BP 124/72, a well-seated biological valve with a mean gradient of 9 mmHg.</p>
      </div>
      <MultiSelect id="s12-home" question="🧾 His discharge plan?"
        items={[
          { id: 'asp', label: 'Low-dose aspirin (an oral anticoagulant is an alternative for the first 3 months after a surgical bioprosthesis)', correct: true, why: 'Early antithrombotic choice after a surgical bioprosthesis is a guideline option, not one fixed answer; no lifelong warfarin — his goal.' },
          { id: 'bb', label: 'A beta-blocker and an ACE inhibitor/ARB, BP < 130/80', correct: true, why: 'After dissection, lifelong impulse control protects the remaining arch and descending aorta. The leak that argued against a beta-blocker is gone.' },
          { id: 'ct', label: 'CT or MRI of the whole aorta at about 1, 6 and 12 months, then yearly', correct: true, why: 'The residual dissected arch and descending aorta can dilate.' },
          { id: 'ie', label: 'Endocarditis prophylaxis for dental procedures, and a prosthetic-valve card', correct: true, why: 'Prosthetic valve = highest risk (ESC 2023).' },
          { id: 'fam', label: 'Echo screening for his children and siblings', correct: true, why: 'Bicuspid valve and aortopathy run in families.' },
          { id: 'statin', label: 'High-intensity statin', correct: true, why: 'His calcified LAD.' },
          { id: 'gym', label: 'Back to heavy weight training in 6 weeks', correct: false, why: 'Avoid heavy isometric lifting for life with a residual dissected aorta; aerobic exercise is encouraged.' },
        ]} />

      <div className="cs-h2">📝 Case quiz</div>
      <Quiz id="s12-quiz" items={[
        { q: 'The wide pulse pressure of chronic AR is mainly due to…', options: ['Aortic stiffness', 'A huge stroke volume plus rapid diastolic run-off backwards and to the periphery', 'Tachycardia', 'Anaemia'], answer: 1, why: 'High systolic from the stroke volume; low diastolic from the two run-offs.' },
        { q: 'An Austin Flint murmur is best told from mitral stenosis by…', options: ['Its location', 'Absent opening snap, soft S1, and softening with amyl nitrite', 'Its loudness', 'Radiation to the axilla'], answer: 1, why: 'MS has a loud S1, an opening snap and gets louder with amyl nitrite.' },
        { q: 'Which eponymous sign is largely a measurement artefact?', options: ['Duroziez', 'Corrigan', 'Hill’s sign', 'Austin Flint'], answer: 2, why: 'Intra-arterial pressures show little true popliteal–brachial difference.' },
        { q: 'Which is NOT a criterion for severe AR?', options: ['Vena contracta > 6 mm', 'Holodiastolic descending-aorta reversal > 20 cm/s at end-diastole', 'Peak AR velocity > 4 m/s', 'Regurgitant fraction ≥ 50%'], answer: 2, why: 'AR velocity reflects the pressure difference, not the orifice size.' },
        { q: 'LVOT stroke volume 150 mL, mitral (forward) stroke volume 70 mL. Regurgitant fraction?', options: ['33%', '47%', '53%', '70%'], answer: 2, why: '(150 − 70)/150 = 53%.' },
        { q: 'Class I surgical trigger in asymptomatic severe AR (ESC/EACTS 2025)?', options: ['LVEDD > 65 mm', 'LVESD > 50 mm or LVESDi > 25 mm/m², or LVEF ≤ 50%', 'LVEF ≤ 60%', 'Pulse pressure > 100 mmHg'], answer: 1, why: 'End-systolic size and EF; a lower tier may be considered at low risk.' },
        { q: 'During aortic valve surgery, concomitant ascending aortic replacement should be considered from…', options: ['40 mm', '45 mm', '55 mm', '60 mm'], answer: 1, why: '≥ 45 mm in low-risk patients.' },
        { q: 'In acute severe AR, the pressure half-time is typically…', options: ['Long (> 500 ms)', 'Short (< 150–200 ms) because LVEDP rises to meet aortic pressure', 'Normal', 'Unmeasurable'], answer: 1, why: 'Rapid equalisation of pressures.' },
        { q: 'An intra-aortic balloon pump in acute severe AR…', options: ['Is first-line support', 'Is contraindicated: diastolic inflation drives more blood back into the LV', 'Helps only if the HR is slow', 'Is safe if the AR is from dissection'], answer: 1, why: 'And a dissected aorta adds its own contraindication.' },
        { q: 'Type A dissection with torrential acute AR, BP 176/62, HR 114. Best initial approach?', options: ['Metoprolol boluses to HR < 60', 'Analgesia, titrated esmolol accepting a higher rate, then a vasodilator if needed — and emergency surgery', 'GTN first', 'IABP'], answer: 1, why: 'Short-acting, titrated, rate floor respected — the bridge is short.' },
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
          <li className="cs-li">🫀 Chronic AR = volume AND pressure overload: the biggest hearts in cardiology, silent for years.</li>
          <li className="cs-li">📉 Every peripheral sign is a pulse-pressure sign. Duroziez and Austin Flint help; Hill’s sign is folklore.</li>
          <li className="cs-li">🎯 Grade AR by integrating vena contracta, descending-aorta reversal and volumes — never by PHT or jet length alone.</li>
          <li className="cs-li">📏 Operate on end-SYSTOLIC numbers: LVESD &gt; 50 mm, LVESDi &gt; 25 mm/m², EF ≤ 50% — earlier tier at low risk.</li>
          <li className="cs-li">📐 Measure the aorta perpendicular to the flow; replace it at ≥ 45 mm when the valve is being operated on.</li>
          <li className="cs-li">⏱️ In AR, a slow heart rate is the enemy: more diastole, more leak.</li>
          <li className="cs-li">🌫️ Acute AR is quiet: no wide pulse pressure, a short soft murmur, a soft S1 — and pulmonary oedema.</li>
          <li className="cs-li">🎈 Never put a balloon pump into moderate-to-severe AR.</li>
          <li className="cs-li">⚖️ Dissection + acute AR: analgesia, titrated esmolol with a rate floor, then a vasodilator — and the surgeon now.</li>
          <li className="cs-li">💬 Settle the valve choice calmly in clinic: it may be needed at 3 a.m.</li>
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

export const VALVE_11 = {
  title: 'Severe aortic regurgitation · Bicuspid aortopathy · Timing surgery — and the night the aorta tore',
  short: 'Valvular & Structural · Case AR-58',
  patient: {
    name: 'Mr Idris Bello',
    meta: '58 M · MRN 5531-0927 · 84 kg · BSA 2.02 m²',
    flags: [
      { text: 'Bicuspid valve', tone: 'amber' },
      { text: 'Ascending aorta 51 mm', tone: 'red' },
      { text: 'FHx sudden death 61', tone: 'amber' },
      { text: 'Amlodipine', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 60, limit: 300, basis: 'volume/eGFR ≤ 3.7' },
  clock0: min(23, 20),
  vitals0: { hr: 70, sys: 168, dia: 44, spo2: 98, rr: 16, st: 0, rhythm: 'sinus' },
  brand: { icon: '🫀', line: 'Valvular & Structural · Case AR-58' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / EM / IM', tone: 'cyan' },
      { text: 'Valve · aorta · emergency', tone: 'red' },
      { text: 'ESC/EACTS 2025 VHD · ESC 2024 aorta', tone: 'plain' },
    ],
    lines: [
      { text: 'The pulse', style: 'outline' },
      { text: 'that collapses', style: 'grad' },
      { text: '& the night it didn’t', style: 'cyan' },
    ],
    hook: (
      <>
        A PE teacher wakes with his heart <b>banging in his neck</b>. The paramedic feels a pulse that slaps her fingers and vanishes: 168/44.
        You will hear the leak, feel it, measure it, and decide — from four echoes and a letter nobody read — when a man who feels fine needs his chest opened.
        Then, at <span className="r">03:10 on day 17</span>, the aorta tears, the regurgitation turns <span className="r">acute</span>, every reassuring sign disappears — and the drug the textbook tells you to give can kill him.
      </>
    ),
    image: null,
    sims: 's2',
    crisis: 's9',
    cards: [
      { k: '🧑 The patient', t: 'Mr Idris Bello, 58 — bicuspid valve, a 51-mm ascending aorta, lost to follow-up, father died of a “burst artery”.' },
      { k: '🩺 Your role', t: 'From the ambulance to the valve unit, the heart team, the cath lab — and resus at 4 a.m.' },
      { k: '🎛️ In your hands', t: 'AR murmurs and Austin Flint, pulse waveforms, pressure half-time, aortic flow reversal, vena contracta, LV triggers, the aorta on CT, a Judkins in a dilated root, LV/aortic pressures, the beta-blocker titration.' },
      { k: '🧠 How it teaches', t: 'Chronic vs acute: the same leak, opposite bedside — and why the rate that saves one kills the other.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'The pounding in his neck', Component: Presentation,
      pill: '💥 23:40 — 168/44 and a collapsing pulse',
      lede: 'Hear the leak, feel the pulse, sort the eponyms from the folklore — and decide what tonight needs.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 70, sys: 168, dia: 44, spo2: 98, rr: 16, rhythm: 'sinus' }); atLeastClock(min(23, 40)); } },
    { id: 's2', icon: '📏', nav: 'Echo & Quantification', title: 'How severe — quantify it yourself', Component: Echo,
      pill: '🎯 PHT, flow reversal, vena contracta, volumes',
      lede: 'Measure every parameter by hand, then grade patients who are not him.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 72, sys: 158, dia: 46, spo2: 98, rr: 14, rhythm: 'sinus' }); atLeastClock(min(24 + 9, 30)); } },
    { id: 's3', icon: '👥', nav: 'Heart Team', title: 'Operate on the numbers', Component: HeartTeam,
      pill: '📈 Four echoes, one trigger, his choice',
      lede: 'When does an asymptomatic man need surgery — and which operation?',
      enter: ({ atLeastClock }) => atLeastClock(min(48 + 14, 0)) },
    { id: 's4', icon: '🧮', nav: 'Planning the Aorta', title: 'Planning: measure the aorta', Component: Planning,
      pill: '📐 Perpendicular, inner edge, at its widest',
      lede: 'The diameter that decides — and the thresholds people mix up.',
      enter: ({ atLeastClock }) => atLeastClock(min(72 + 10, 0)) },
    { id: 's5', icon: '🩸', nav: 'Set-up', title: 'Set-up: angiography before surgery', Component: Setup,
      pill: '🧷 Day 5 — a catheter in a 51-mm aorta',
      lede: 'Checklist, sequence, and why the usual catheter will not reach.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 72, sys: 142, dia: 50, spo2: 98, rr: 14, rhythm: 'sinus' }); atLeastClock(min(120 + 8, 0)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy: curves, damping and what not to do', Component: Strategy,
      pill: '🧭 Branches with consequences',
      lede: 'Every choice here has a version that ends in a left main dissection.',
      enter: ({ atLeastClock }) => atLeastClock(min(120 + 8, 30)) },
    { id: 's7', icon: '🛠️', nav: 'The Procedure', title: 'Engage the left main, then read the pressures', Component: Procedure,
      pill: '🎥 JL in a dilated root · LV and aorta',
      lede: 'Hands on: engage cleanly, then measure the diastolic gap that feeds his coronaries.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 70, sys: 140, dia: 48, spo2: 99, rr: 14, rhythm: 'sinus' }); atLeastClock(min(120 + 9, 0)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit: three weeks to wait', Component: Recovery,
      pill: '🏠 Pressure, red flags, a card on the fridge',
      lede: 'What protects his aorta while he waits — and what he must know.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 74, sys: 148, dia: 52, spo2: 98, rr: 14, rhythm: 'sinus' }); atLeastClock(min(120 + 15, 0)); } },
    { id: 's9', icon: '🚨', nav: 'The Crisis', title: 'The night the aorta tore', Component: Crisis,
      pill: '🌙 03:10, day 17 — the leak turns acute',
      lede: 'Recognise acute AR in a dissection, walk the beta-blocker tightrope, refuse the balloon, get to theatre.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 114, sys: 176, dia: 62, spo2: 92, rr: 28, rhythm: 'sinus', st: -1 }); atLeastClock(min(16 * 24 + 3, 10)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'The acute spiral, the silent spiral, and the aortic one.',
      enter: ({ setVitals }) => setVitals({ hr: 84, sys: 122, dia: 66, spo2: 97, rr: 16, rhythm: 'sinus', st: 0 }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Six patients who taught these rules.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'His plan, the quiz — then your score.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 72, sys: 124, dia: 72, spo2: 98, rr: 14, rhythm: 'sinus', st: 0 }); atLeastClock(min(25 * 24 + 11, 0)); } },
  ],
};

export default function Valve11({ onClose }) {
  return <CaseShell def={VALVE_11} onClose={onClose} />;
}
