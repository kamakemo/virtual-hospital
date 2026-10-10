import React from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Figure, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import { ValveClicks, ProstheticDoppler, CineFluoro, PvtPathway, LysisRun, InrChart } from './sims.jsx';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 09
   Prosthetic valve dysfunction: obstructive thrombosis of a
   bileaflet mechanical mitral valve in a 57-year-old whose
   warfarin was switched to rivaroxaban seven weeks earlier.
   The clicks go quiet; prosthetic Doppler (gradient, PHT, DVI,
   EOA) and cinefluoroscopy of the leaflet angles; thrombus vs
   pannus vs mismatch vs endocarditis; the heart team chooses
   slow-infusion low-dose alteplase over a third sternotomy;
   the INR rebuilt to the right target — and, on day 4, an
   embolic stroke.

   Clinical content follows the 2025 ESC/EACTS guideline on
   valvular heart disease (prosthetic valve thrombosis, INR
   targets by prosthesis thrombogenicity and patient risk
   factors, peri-procedural bridging, DOACs contraindicated
   with mechanical valves), the 2020 ACC/AHA valve guideline
   where it differs (slow-infusion low-dose fibrinolysis as a
   first-line option), the 2024 ASE/SCMR/SCCT prosthetic valve
   imaging guideline, the 2023 ESC endocarditis guideline and
   the 2018 ESC guideline on cardiovascular disease in
   pregnancy (anti-Xa targets). Simplified for teaching.
   ============================================================ */

const WIKI = f => `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=960`;
const WIKIPAGE = f => `https://commons.wikimedia.org/wiki/File:${f}`;
const min = (h, m) => h * 60 + m;

const PVT_SEARCHES = [
  { name: 'CCC Live Cases — prosthetic valve', url: 'https://www.youtube.com/@CCCLiveCases/search?query=prosthetic%20valve', note: 'Prosthetic valve cases' },
  { name: 'Gulf Intervention Society — valve thrombosis', url: 'https://www.youtube.com/@gulfinterventionsociety/search?query=valve%20thrombosis', note: 'Valve thrombosis talks and cases' },
  { name: 'Interventional Cardiology — prosthetic valve', url: 'https://www.youtube.com/@interventionalcardiologyis3814/search?query=prosthetic%20valve', note: 'Prosthetic valve cases' },
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
   1 · PRESENTATION — "MY VALVE HAS GONE QUIET"
   ============================================================ */

function Presentation() {
  const { answers } = useCase();
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">📜 history</span>Mrs Amal Farouk, 57, a seamstress. Rheumatic mitral stenosis; a 27 mm bileaflet mechanical mitral valve (St Jude type) at 32, in 2001. A second sternotomy in 2014 for tricuspid annuloplasty, complicated by mediastinitis and a pectoralis flap. Permanent AF. CKD 3a. BMI 33. Warfarin for 24 years — “the INR was always up and down”.</p>
        <p className="cs-p"><span className="cs-time">💊 7 weeks ago</span>At a private clinic: “These blood tests are a burden — you have AF, the new tablets are better for AF.” Warfarin stopped; rivaroxaban 20 mg once daily started. No INR checks since.</p>
        <p className="cs-p"><span className="cs-time">📆 10 days</span>Breathless on the stairs. Three nights sleeping upright in a chair.</p>
        <p className="cs-p"><span className="cs-time">🌙 05:20</span>Wakes drowning. Her husband: “For twenty years I fell asleep to that ticking. Last night I couldn’t hear it.” She says: <b>“My valve has gone quiet.”</b> Last rivaroxaban: last night at 20:00.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🚑 06:10</span>Paramedics: SpO₂ 84% on air, frothy sputum. CPAP started in the ambulance. Pre-alert: “Mechanical valve, on a new blood thinner, I can’t hear the click.”</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>📟 Observations · 06:10</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('124 /min, irregularly irregular', 'cs-hi')], ['Blood pressure', N('96/62 mmHg', 'cs-hi')], ['SpO₂', N('89% on CPAP, FiO₂ 0.4', 'cs-hi')],
            ['Resp. rate', N('30 /min', 'cs-hi')], ['Temperature', N('36.8 °C')], ['Lactate', N('2.9 mmol/L', 'cs-hi')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🩺 Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Crackles to the mid-zones. JVP up 6 cm. Ankle oedema.</li>
            <li className="cs-li">The closing click is soft and dull; <b>no opening click</b>. A low diastolic rumble at the apex.</li>
            <li className="cs-li">Cool peripheries, capillary refill 3 s.</li>
            <li className="cs-li">No fever, no splinter haemorrhages, no new neurological deficit.</li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">🔊 Listen — the sound of a metal valve</div>
      <p className="cs-p">A working mechanical valve is LOUD. Start with a working mitral prosthesis, then hers, then an aortic one for contrast: which click is loud depends on which valve it is.</p>
      <ValveClicks />
      <Why title="🔇 Why a stuck valve goes quiet"
        chain={[
          { k: 'THE CLICK', t: 'The click is a carbon leaflet slamming against its metal housing.' },
          { k: 'THROMBUS', t: 'Fibrin and platelets grow in the hinge recess where flow is slowest.' },
          { k: 'LESS TRAVEL', t: 'A leaflet glued near the closed position travels a few degrees instead of fifty-five.' },
          { k: 'NO IMPACT', t: 'Little travel, little speed — the opening click vanishes and the closing click is dull.' },
          { k: 'A SIGN', t: 'Patients and families notice first. “It’s gone quiet” is an emergency.' },
        ]}>
        The muffled click is the bedside window onto leaflet motion. Ask every patient with a mechanical valve: “Does it sound the same as usual?”
      </Why>

      <ECG12 rate={124} rhythm="af" caption="AF with a fast ventricular response, ~124/min. No ischaemic ST change." />
      <BedsideMonitor />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧪 Chest X-ray and bloods</div>
        <Table head={['', 'Result']} rows={[
          ['Chest X-ray', 'Alveolar oedema, upper-lobe diversion; two generations of sternal wires; the prosthetic mitral ring'],
          ['INR', N('1.2 — meaningless on rivaroxaban, and proof she is not on warfarin', 'cs-hi')],
          ['Anti-Xa (rivaroxaban-calibrated)', N('96 ng/mL, 10 h after her last dose')],
          ['Haemoglobin / platelets', N('128 g/L · 210 ×10⁹/L')], ['LDH', N('410 U/L — mild haemolysis', 'cs-hi')],
          ['Creatinine / eGFR', N('112 µmol/L · 48')], ['NT-proBNP', N('6,200 ng/L', 'cs-hi')],
          ['hs-Troponin T', N('38 → 41 ng/L — flat')], ['CRP / WCC', N('6 mg/L · 8.1 ×10⁹/L')],
          ['Blood cultures', '3 sets taken before anything else'],
        ]} />
      </div>

      <Decision id="s1-dx" question="What is the working diagnosis?"
        options={[
          { id: 'pvt', label: 'Obstructive thrombosis of the mechanical mitral valve — anticoagulation failure after switching to a DOAC', verdict: 'best', points: 10,
            why: 'Weeks of progressive breathlessness after an anticoagulation lapse, a lost opening click, a muffled closing click and a new diastolic rumble: a leaflet that does not open.' },
          { id: 'pannus', label: 'Pannus ingrowth', verdict: 'wrong', points: 2, why: 'Pannus grows over years, usually with a therapeutic INR. Ten days of symptoms seven weeks after the anticoagulant changed is thrombus until proven otherwise.' },
          { id: 'pve', label: 'Prosthetic valve endocarditis', verdict: 'wrong', points: 2, why: 'Always considered — hence the cultures — but she is afebrile with a normal CRP.' },
          { id: 'af', label: 'Heart failure decompensated by fast AF', verdict: 'wrong', points: 0, why: 'Her AF is permanent and not new. The valve sounds have changed — that is the story.' },
        ]} />
      <Contrast title="🎧 an obstructed mechanical mitral vs native mitral stenosis"
        is={{ h: 'Obstructed mechanical mitral (hers)', points: ['Weeks: a lapse in anticoagulation, then breathlessness.', 'The closing click muffled; the opening click GONE.', 'Treated by dissolving or removing thrombus.'] }}
        isnt={{ h: 'Native rheumatic mitral stenosis', points: ['Decades of slow narrowing.', 'A loud S1 and an opening snap — the stiff leaflets still snap.', 'Treated by balloon or surgery on the valve itself.'] }} />

      <MultiSelect id="s1-tx" question="⏱️ The first hour. What do you do?"
        items={[
          { id: 'cpap', label: 'Continue CPAP; sit her up', correct: true, why: 'Recruits flooded alveoli, buys time.' },
          { id: 'diur', label: 'IV furosemide', correct: true, why: 'Offloads the lungs while the obstruction is fixed.' },
          { id: 'cult', label: 'Three sets of blood cultures before any antibiotic', correct: true, why: 'A dysfunctional prosthesis is endocarditis until excluded. One dose of antibiotic can sterilise the cultures for good.' },
          { id: 'echo', label: 'Urgent TTE; plan TOE and cinefluoroscopy', correct: true, why: 'Doppler tells you the valve is obstructed; fluoroscopy and TOE tell you why.' },
          { id: 'hist', label: 'Exact time of her last rivaroxaban dose; an anti-Xa level', correct: true, why: 'Decides when heparin can start and whether lysis or surgery is safe today.' },
          { id: 'andex', label: 'Andexanet alfa to reverse the rivaroxaban', correct: false, why: 'She is not bleeding — she is clotting. Reversal agents are prothrombotic.' },
          { id: 'vitk', label: 'IV vitamin K', correct: false, why: 'Vitamin K has nothing to reverse, and would make re-warfarinisation harder for a week.' },
          { id: 'bb', label: 'IV metoprolol boluses to bring the rate below 80 now', correct: false, why: 'Rate matters here (see below) — but boluses into a low-output, borderline-pressure patient can tip her into shock.' },
        ]} />

      <Decision id="s1-hep" question="Which anticoagulant bridges her to a definitive treatment?"
        options={[
          { id: 'ufh', label: 'IV unfractionated heparin, without a bolus, started when the next rivaroxaban dose would have been due (~20:00), titrated to aPTT/anti-Xa', verdict: 'best', points: 10,
            why: 'UFH is short-acting, titratable, cleared independently of the kidney and reversible with protamine — so it can be switched off within hours for lysis or surgery. Starting before the rivaroxaban wears off stacks two anticoagulants.' },
          { id: 'lmwh', label: 'Therapeutic enoxaparin twice daily', verdict: 'ok', points: 4, why: 'Effective, but 12-hourly and only partly reversible: it gets in the way if she goes to theatre or lysis tomorrow.' },
          { id: 'riva', label: 'Continue rivaroxaban — the level is therapeutic', verdict: 'wrong', points: 0, why: 'The rivaroxaban IS the failure. A “therapeutic” DOAC level does not protect a mechanical valve.' },
        ]} />

      <Decision id="s1-rate" question="AF at 124. How do you handle the rate?"
        options={[
          { id: 'slow', label: 'Cautious rate control once offloaded — IV digoxin or amiodarone, then low-dose beta-blocker as the pressure allows; aim < 100', verdict: 'best', points: 10,
            why: 'Flow across an obstructed mitral valve happens only in diastole. Tachycardia steals diastole, so the same cardiac output needs a higher flow rate — and the gradient rises with the square of it. Slowing the rate lowers the LA pressure.' },
          { id: 'none', label: 'Leave it — it is compensatory', verdict: 'ok', points: 3, why: 'True in acute MR (Case 02), where the rate props up output. In mitral obstruction the rate is part of the problem.' },
          { id: 'dccv', label: 'Synchronised DC cardioversion now', verdict: 'wrong', points: 0, why: 'Permanent AF in a huge atrium, seven weeks without effective anticoagulation and a thrombus on the valve: a cardioversion invites the clot to the brain.' },
        ]} />
      <Contrast title="⏳ heart rate in mitral obstruction vs acute MR"
        is={{ h: 'Mitral obstruction (stuck prosthesis, MS)', points: ['Filling happens only in diastole, through a narrow hole.', 'Fast rate = short diastole = higher gradient and LA pressure.', 'Slow the rate (carefully) — it lowers pressure in the lungs.'] }}
        isnt={{ h: 'Acute mitral regurgitation (Case 02)', points: ['Stroke volume is crippled by the leak.', 'The rate props up the cardiac output.', 'Slowing it can precipitate shock.'] }} />
      {answers['s1-rate'] && <Note kind="pearl" title="🕖 08:00">Digoxin 500 µg IV and furosemide 80 mg IV. Rate 104, SpO₂ 93% on CPAP, BP 104/64, urine flowing.</Note>}

      <div className="cs-media-row">
        <Figure src={WIKI('Aortic_Karboniks-1_bileafter_prosthetic_heart_valve.jpg')} href={WIKIPAGE('Aortic_Karboniks-1_bileafter_prosthetic_heart_valve.jpg')}
          alt="A bileaflet mechanical heart valve" caption="A bileaflet mechanical valve: two carbon half-discs pivoting in a ring. Each leaflet opens and closes independently — one can stick while the other works."
          credit="Stif Komar, public domain, Wikimedia Commons" />
        <Video id="rbfAzdO5tX4" title="Echo pearls: introducing prosthetic heart valves" />
      </div>
    </>
  );
}

/* ============================================================
   2 · MEASURE IT — PROSTHETIC DOPPLER & CINEFLUOROSCOPY
   ============================================================ */

function Investigation() {
  const { answers, answer, bump } = useCase();
  const d = answers['s2-dop'];
  const f = answers['s2-fluoro'];
  const dvi = d ? d.vti / d.lvotVti : null;
  const eoa = d ? d.lvotArea * d.lvotVti / d.vti : null;
  const fScore = f ? (f.aligned ? 5 : 0) + (Math.abs(f.A - 85) <= 5 ? 5 : 0) + (Math.abs(f.B - 35) <= 5 ? 5 : 0) : null;
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🗂️ Her valve’s fingerprint — the post-operative baseline</div>
        <Table head={['', '2016 baseline (well, INR in range)', 'Today']} rows={[
          ['Heart rate', N('72'), N('~96 (after digoxin)', 'cs-hi')],
          ['Peak E velocity', N('1.6 m/s'), N('measure it ↓')],
          ['Mean gradient', N('4 mmHg'), N('measure it ↓')],
          ['Pressure half-time', N('90 ms'), N('measure it ↓')],
          ['Leaflet motion', 'Both leaflets open fully', 'TTE: shadowed by the metal'],
          ['PASP', N('38 mmHg'), N('72 mmHg', 'cs-hi')],
        ]} />
      </div>
      <Why title="🧾 Why you always compare with the baseline"
        chain={[
          { k: 'EVERY VALVE DIFFERS', t: 'Normal gradients depend on the model, the size and the patient — a 25 mm mitral valve is not a 31.' },
          { k: 'THE FINGERPRINT', t: 'The first echo after surgery records that valve’s own normal.' },
          { k: 'CHANGE', t: 'A rising gradient against its own baseline means something has changed inside the valve.' },
          { k: 'NO BASELINE?', t: 'Then rely on flow-independent numbers (DVI, PHT, EOA) and look at the leaflets directly.' },
        ]} />

      <div className="cs-h2">📏 Measure the prosthesis yourself</div>
      <p className="cs-p">CW Doppler through the mitral prosthesis from the apex. Put the caliper on the peak E velocity, lay the slope along the deceleration, then trace. The LVOT PW VTI is 16 cm; LVOT diameter 2.0 cm.</p>
      <ProstheticDoppler done={d} onMeasure={r => answer('s2-dop', r)} />
      {d && (
        <div className={'cs-fb ' + (d.close && d.phtClose ? 'best' : 'ok')}>
          Peak E {d.vp.toFixed(2)} m/s · PHT {Math.round(d.pht)} ms · VTI {Math.round(d.vti)} cm · mean gradient {Math.round(d.mean)} mmHg (at HR ~96).
          {d.close && d.phtClose ? ' Clean measurements.' : !d.close ? ' The caliper is off the dense edge of the peak.' : ' The slope does not follow the deceleration: extend it to the baseline.'}
        </div>
      )}
      <ScoreOnce id="s2-dop" pts={d == null ? null : (d.close ? 6 : 2) + (d.phtClose ? 6 : 2)} max={12} />
      {d && (
        <>
          <Decision id="s2-dvi" question={`Doppler velocity index = VTI prosthesis ÷ VTI LVOT = ${Math.round(d.vti)} ÷ 16 ≈ ?`}
            options={[
              { id: '53', label: `≈ ${dvi.toFixed(1)} — far above 2.5: significant obstruction`, verdict: 'best', points: 8, why: 'A normal mitral prosthesis has a DVI < 2.2. Because it is a ratio of two flows through the same heart beat, DVI barely changes with cardiac output.' },
              { id: '19', label: '≈ 1.9 — normal', verdict: 'wrong', points: 0, why: 'That was her 2016 value.' },
              { id: '02', label: `≈ ${(1 / dvi).toFixed(2)} — severe obstruction`, verdict: 'wrong', points: 0, why: 'Upside down: for the AORTIC prosthesis DVI is LVOT ÷ valve (low = bad). For the MITRAL prosthesis it is valve ÷ LVOT (high = bad).' },
            ]} />
          <Decision id="s2-eoa" question={`Effective orifice area by continuity = LVOT area (π × 1.0²) × 16 ÷ ${Math.round(d.vti)} ≈ ?`}
            options={[
              { id: 'small', label: `≈ ${eoa.toFixed(2)} cm² — less than 1 cm²`, verdict: 'best', points: 8, why: 'Significant obstruction is < 1 cm². Caveat: the continuity EOA is invalid if there is significant mitral or aortic regurgitation — she has neither.' },
              { id: 'norm', label: '≈ 2.4 cm²', verdict: 'wrong', points: 0, why: 'A normal 27 mm bileaflet mitral valve would be about there.' },
              { id: 'pht', label: 'Use 220 ÷ PHT, as for native mitral stenosis', verdict: 'wrong', points: 1, why: '220/PHT was validated for native MS — not for prostheses. In a prosthesis use PHT as a sign, not to calculate the area.' },
            ]} />
        </>
      )}

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>📋 Mitral prosthesis — is it obstructed? (ASE/EACVI criteria)</div>
        <Table head={['', 'Normal', 'Possible obstruction', 'Significant obstruction']} rows={[
          ['Peak E velocity', N('< 1.9 m/s'), N('1.9–2.5'), N('≥ 2.5', 'cs-hi')],
          ['Mean gradient', N('≤ 5 mmHg'), N('6–10'), N('> 10', 'cs-hi')],
          ['DVI (VTI valve / VTI LVOT)', N('< 2.2'), N('2.2–2.5'), N('> 2.5', 'cs-hi')],
          ['EOA', N('≥ 2.0 cm²'), N('1–2'), N('< 1', 'cs-hi')],
          ['Pressure half-time', N('< 130 ms'), N('130–200'), N('> 200', 'cs-hi')],
        ]} />
        <p className="cs-pts">Gradients rise with heart rate and flow. DVI and PHT are the flow-resistant ones.</p>
      </div>
      <Contrast title="📈 a high gradient: obstruction vs high flow vs mismatch"
        is={{ h: 'Obstruction (hers)', points: ['Gradient up from its own baseline.', 'DVI > 2.5, PHT > 200 ms, EOA < 1 cm².', 'Abnormal leaflet motion on fluoroscopy or TOE.'] }}
        isnt={{ h: 'High flow or patient–prosthesis mismatch', points: ['High flow (anaemia, fever, sepsis, pregnancy): gradient up but DVI and PHT normal; it falls when the flow does.', 'Mismatch: a valve too small for the body — a high gradient from DAY ONE, unchanged over years, leaflets moving normally; mitral EOA indexed ≤ 1.2 cm²/m² (moderate), ≤ 0.9 (severe).', 'Neither is fixed by lysis.'] }} />
      <Decision id="s2-edge" question="Two other patients. A: mitral prosthesis, mean gradient 9 mmHg, PHT 85 ms, DVI 1.9, Hb 68 g/L after a GI bleed. B: aortic 19 mm prosthesis in a 110 kg man, mean gradient 28 mmHg — identical on every echo since surgery, DVI 0.32, leaflets moving normally. Which is which?"
        options={[
          { id: 'right', label: 'A is high flow from anaemia; B is patient–prosthesis mismatch', verdict: 'best', points: 8, why: 'A: high gradient with a normal DVI and PHT — the valve is fine, the flow is high. B: high from day one, normal DVI and leaflet motion: a small valve for a big body, not an obstruction.' },
          { id: 'both', label: 'Both are early valve thrombosis', verdict: 'wrong', points: 0, why: 'Lysis in either would be pure harm.' },
          { id: 'swap', label: 'A is mismatch; B is thrombosis', verdict: 'wrong', points: 0, why: 'A stable gradient for years with normal leaflets is not thrombosis.' },
        ]} />

      <div className="cs-h2">🎞️ Cinefluoroscopy — look at the leaflets</div>
      <p className="cs-p">Two minutes in the cath lab, no contrast. Steer the C-arm until the ring is edge-on and both leaflets are crisp lines in profile. A mitral prosthesis opens in DIASTOLE — freeze there. Measure each leaflet’s angle to the ring plane. This model opens to ~85° and closes at ~30°.</p>
      <CineFluoro done={f} onResult={r => { answer('s2-fluoro', r); bump({ fluoro: 95 }); }} />
      {f && (
        <div className={'cs-fb ' + (fScore >= 15 ? 'best' : 'ok')}>
          Leaflet A {f.A}°, leaflet B {f.B}°{f.aligned ? ', ring edge-on.' : ' — but measured in an oblique view, where angles lie.'} {Math.abs(f.A - 85) <= 5 && Math.abs(f.B - 35) <= 5
            ? 'Leaflet A opens normally; leaflet B barely leaves the closed position — an excursion of ~5° instead of ~55°. One stuck leaflet.'
            : f.phase && (f.phase.A === 'systole' || f.phase.B === 'systole') ? 'You measured in systole, when a mitral valve is meant to be closed. Freeze in diastole.' : 'Lay the protractor exactly along each leaflet in the open frame.'}
        </div>
      )}
      <ScoreOnce id="s2-fluoro" pts={fScore} max={15} />
      <Why title="🩻 Why fluoroscopy sees what echo misses"
        chain={[
          { k: 'METAL', t: 'Carbon leaflets and a metal ring reflect almost all ultrasound.' },
          { k: 'SHADOW', t: 'From the apex, everything behind the valve — the leaflets’ atrial side — sits in an acoustic shadow.' },
          { k: 'X-RAYS DON’T BOUNCE', t: 'Fluoroscopy shows the radiopaque leaflets directly, in seconds, without contrast.' },
          { k: 'ANGLES', t: 'Opening and closing angles prove which leaflet is stuck — and later prove that lysis worked.' },
        ]} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🔭 TOE · 11:00</div>
        <Table head={['', 'Finding']} rows={[
          ['Mass', 'Soft, homogeneous, mildly mobile, on the ATRIAL side at the hinge of leaflet B'],
          ['Size', N('9 × 7 mm, area 0.6 cm²')],
          ['Leaflet B', 'Almost immobile; leaflet A opens normally'],
          ['Left atrium', '62 mm, dense spontaneous contrast (“smoke”); no appendage thrombus seen'],
          ['Vegetation / abscess / paravalvular leak', 'None'],
        ]} />
      </div>
      <Decision id="s2-mass" question="What is the mass?"
        options={[
          { id: 'thr', label: 'Thrombus', verdict: 'best', points: 10, why: 'Soft, mobile, atrial-side, at the hinge, after an anticoagulation lapse, with weeks of symptoms. Exactly what lysis can dissolve.' },
          { id: 'pan', label: 'Pannus', verdict: 'wrong', points: 0, why: 'Pannus is dense, echo-bright, fixed, grows from the sewing ring over years — often on the ventricular side — and appears with a therapeutic INR.' },
          { id: 'veg', label: 'A vegetation', verdict: 'wrong', points: 2, why: 'Possible in theory; but no fever, normal CRP, no regurgitation, cultures pending. Watch the cultures.' },
        ]} />
      <Contrast title="🧱 thrombus vs pannus"
        is={{ h: 'Thrombus', points: ['Days to weeks; an INR lapse.', 'Soft, mobile, larger; atrial side of a mitral valve.', 'CT: low attenuation.', 'Dissolves with lysis or heparin.'] }}
        isnt={{ h: 'Pannus', points: ['Months to years; INR often in range.', 'Small, dense, fixed fibrous tissue from the sewing ring.', 'CT: higher attenuation (cut-offs vary between studies).', 'Lysis cannot dissolve collagen: surgery.'] }} />
      <Contrast title="🦠 prosthetic thrombosis vs prosthetic endocarditis"
        is={{ h: 'Thrombosis', points: ['Afebrile; inflammatory markers normal.', 'Obstruction more than leak.', 'Lysis is an option.'] }}
        isnt={{ h: 'Endocarditis', points: ['Fever, raised CRP, positive cultures — or none of these early.', 'Vegetations, abscess, a NEW paravalvular leak or dehiscence.', 'Lysis is CONTRAINDICATED: septic emboli and intracranial haemorrhage. Antibiotics ± surgery.'] }} />
      <Note kind="evid" title="📚 When CT helps">Gated CT shows leaflet angles too, and separates thrombus (low attenuation) from pannus (higher attenuation). Use it when TOE and fluoroscopy disagree, or before redo surgery.</Note>

      <div className="cs-media-row">
        <Video id="YfIVj1WcM8w" title="Echocardiographic assessment of prosthetic valves" />
        <Video id="T1IqM9CwGFc" title="Assessing velocities and gradients of prosthetic valves using echo" />
      </div>
      <Video id="_nIIxhS6fHc" title="Diagnosing prosthetic valve endocarditis with echocardiography" />
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
        <div className="cs-h2" style={{ marginTop: 0 }}>👥 Heart team · 15:00</div>
        <Table head={['', 'Finding']} rows={[
          ['Lesion', 'Obstructive thrombosis, mechanical mitral valve: leaflet B stuck, mean gradient ~15 mmHg, DVI > 5'],
          ['Thrombus', 'TOE area 0.6 cm² (< 0.8), no prior stroke or TIA'],
          ['Now', 'NYHA III–IV, stabilised: off CPAP, SpO₂ 94% on 2 L, BP 108/66'],
          ['Surgery', 'A THIRD sternotomy; previous mediastinitis with a pectoralis flap; PASP 72 mmHg; RV impaired (TAPSE 14); EuroSCORE II ~16%'],
          ['Surgeon', '“Very high risk. I will do it if lysis fails or is impossible.”'],
          ['Her wish', '“My mother died after her third heart operation. If there is another way, I want it.”'],
        ]} />
      </div>
      <Decision id="s3-route" question="Which treatment?"
        options={[
          { id: 'lysis', label: 'Slow-infusion, low-dose fibrinolysis under imaging control, with surgery as the bailout', verdict: 'best', points: 10,
            why: 'Obstructive left-sided thrombosis with very high surgical risk, a small thrombus, no prior stroke and no contraindication: the profile in which ESC/EACTS supports fibrinolysis, and the low-dose slow regimens have the safest published results.' },
          { id: 'surg', label: 'Emergency redo valve replacement', verdict: 'ok', points: 5, why: 'Class I in ESC/EACTS for critically ill patients WITHOUT serious comorbidity. Hers is a third sternotomy after mediastinitis: very high risk.' },
          { id: 'hep', label: 'Heparin alone and see', verdict: 'wrong', points: 2, why: 'Heparin alone suits a small NON-obstructive thrombus. An obstructive one rarely resolves on heparin — and she is in NYHA III–IV.' },
          { id: 'doac', label: 'Switch to apixaban instead of rivaroxaban', verdict: 'wrong', points: 0, why: 'No DOAC protects a mechanical valve (RE-ALIGN; PROACT Xa). Swapping one for another repeats the mistake.' },
        ]} />
      <Contrast title="🔪 surgery vs fibrinolysis for obstructive thrombosis"
        is={{ h: 'Urgent redo surgery', points: ['Removes thrombus AND pannus; replaces a damaged valve.', 'ESC/EACTS first choice when surgical risk is acceptable.', 'Mortality climbs with NYHA class and each redo.'] }}
        isnt={{ h: 'Fibrinolysis', points: ['No incision; works only on fresh thrombus.', 'For very high surgical risk, no surgery available, right-sided valves — and (AHA/ACC) as a first-line alternative.', 'Risks: embolism, stroke, bleeding; may fail (think pannus).'] }} />
      <Why title="🧵 Why lysis works on her valve but would fail on pannus"
        chain={[
          { k: 'FIBRIN', t: 'Fresh thrombus is a fibrin mesh holding platelets and red cells.' },
          { k: 'PLASMIN', t: 'Alteplase turns plasminogen bound in that mesh into plasmin, which cuts fibrin.' },
          { k: 'THE LEAFLET FREES', t: 'As the mesh dissolves from the hinge, the leaflet regains its swing.' },
          { k: 'COLLAGEN', t: 'Pannus is scar — collagen and fibroblasts. Plasmin does not cut it: no response to lysis is a clue.' },
        ]} />

      <Decision id="s3-consent" question="She asks: “Is the clot-buster safe?”"
        options={[
          { id: 'honest', label: '“In published series of this slow, low-dose method, roughly 8–9 in 10 valves reopen. About 1 in 10 have a complication — a stroke from a piece of clot, or bleeding — and a small number die. Surgery is the alternative, with its own higher risk for you. We will watch you hourly and stop if anything changes.”', verdict: 'best', points: 10,
            why: 'Honest ranges (they vary by series), the alternative, the safety net, and what you will do. She can weigh it against her own fear of surgery.' },
          { id: 'safe', label: '“It’s very safe, don’t worry.”', verdict: 'wrong', points: 0, why: 'A stroke is a real possibility — she is about to meet it. Consent without the risk is not consent.' },
          { id: 'paper', label: 'Give her the trial papers to read', verdict: 'ok', points: 3, why: 'Accurate, not an answer. Talk first.' },
        ]} />
      <MultiSelect id="s3-ci" question="⛔ Which would CONTRAINDICATE lysis for her?"
        items={[
          { id: 'ich', label: 'Any previous intracranial haemorrhage', correct: true, why: 'Absolute.' },
          { id: 'isch', label: 'Ischaemic stroke in the last 3 months', correct: true, why: 'Haemorrhagic transformation risk.' },
          { id: 'bleed', label: 'Active internal bleeding', correct: true, why: 'Absolute.' },
          { id: 'pve', label: 'Suspected endocarditis', correct: true, why: 'Septic emboli and mycotic aneurysms bleed.' },
          { id: 'surg', label: 'Major surgery or trauma in the last 3 weeks', correct: true, why: 'Fresh wounds bleed.' },
          { id: 'bp', label: 'Severe uncontrolled hypertension (> 180/110)', correct: true, why: 'Treat it first.' },
          { id: 'sternum', label: 'Sternotomies in 2001 and 2014', correct: false, why: 'Healed years ago.' },
          { id: 'riva', label: 'Rivaroxaban last taken 36 h ago, anti-Xa now < 30 ng/mL', correct: false, why: 'Washed out. Check the level — then proceed.' },
        ]} />
      <Video id="e0ERw33Irdg" title="Prosthetic valve assessment (William A. Zoghbi, MD), April 29, 2016" />
    </>
  );
}

/* ============================================================
   4 · PLANNING — THE PATHWAY AND THE REGIMEN
   ============================================================ */

const HER_PROFILE = { obs: 'obs', side: 'left', state: 'sev', surg: 'high', size: 'small', ci: 'none' };

function Planning() {
  const { answers, answer } = useCase();
  const p = answers['s4-path'];
  return (
    <>
      <div className="cs-h2">🗺️ The decision map — set it to her</div>
      <p className="cs-p">Set each feature to match Mrs Farouk and watch the recommended path change. Then lock it in. Try the other settings too: right-sided, critically ill, acceptable surgical risk.</p>
      <PvtPathway truth={HER_PROFILE} done={p} onResult={r => answer('s4-path', r)} />
      <ScoreOnce id="s4-path" pts={p == null ? null : p.hits === p.of ? 12 : p.hits * 1.5} max={12} />
      <Why title="📐 Why thrombus size changes the risk of lysis"
        chain={[
          { k: 'BIG CLOT', t: 'A larger thrombus has more material to break off as it dissolves.' },
          { k: 'LEFT-SIDED', t: 'Fragments from a mitral valve go to the aorta — and a fifth of cardiac output goes to the brain.' },
          { k: 'THE NUMBER', t: 'TOE thrombus area ≥ 0.8 cm² (and a prior stroke) predicted embolism and death with lysis.' },
          { k: 'HERS', t: '0.6 cm², no prior stroke: the lower-risk group.' },
        ]} />
      <Decision id="s4-regimen" question="Which fibrinolytic regimen?"
        options={[
          { id: 'low', label: 'Alteplase 25 mg over 6 hours, no bolus; repeat if needed, imaging after each dose', verdict: 'best', points: 10,
            why: 'The low-dose slow-infusion regimen: in observational series and the TROIA/PROMETEE programme it had high success with lower embolism and bleeding than older fast regimens. Repeated up to a cumulative ~150 mg.' },
          { id: 'ultra', label: 'Alteplase 25 mg over 25 hours (ultraslow), repeated', verdict: 'ok', points: 6, why: 'Also published, with the fewest complications — but slower. In NYHA III–IV obstruction the team prefers the 6-hour infusion.' },
          { id: 'sk', label: 'Streptokinase 1.5 million units over 60 minutes', verdict: 'ok', points: 3, why: 'In the ESC list and cheap where alteplase is unavailable — but faster, and allergic reactions; repeated courses can be blocked by antibodies.' },
          { id: 'full', label: 'Alteplase 10 mg bolus + 90 mg over 90 minutes', verdict: 'wrong', points: 2, why: 'The older full-dose regimen (with UFH): faster, but higher rates of embolism and major bleeding. Reserved for the crashing patient who cannot have surgery.' },
        ]} />
      <Contrast title="🐢 slow low-dose vs fast full-dose lysis"
        is={{ h: 'Slow, low-dose (hers)', points: ['25 mg over 6 h (or 25 h); repeated.', 'Dissolves the clot gradually, from its surface.', 'Fewer large fragments; less systemic fibrinogen loss.'] }}
        isnt={{ h: 'Fast, full-dose', points: ['100 mg in 90 min.', 'Large pieces break free; systemic lytic state.', 'For haemodynamic collapse when surgery is impossible.'] }} />
      <Decision id="s4-hep" question="Heparin and the rivaroxaban: when does the UFH start?"
        options={[
          { id: 'due', label: 'At 20:00 — when the next rivaroxaban dose would have been due — no bolus, checked against an anti-Xa level', verdict: 'best', points: 8, why: 'Avoids stacking two anticoagulants while giving her no gap. In the published low-dose protocols UFH is paused during each alteplase infusion and restarted between doses — follow your local protocol.' },
          { id: 'now', label: 'Now, with a 5,000 unit bolus', verdict: 'wrong', points: 0, why: 'On top of a rivaroxaban level of ~96 ng/mL: double anticoagulation before lysis.' },
          { id: 'wait', label: 'Wait 48 hours for the rivaroxaban to clear completely', verdict: 'ok', points: 2, why: 'Too long without effective anticoagulation on a thrombosing valve.' },
        ]} />
      <Note kind="warn" title="⚖️ Where the guidelines differ">ESC/EACTS reserve fibrinolysis for patients at very high surgical risk, with no surgery available, or with right-sided prostheses; urgent surgery is first choice when the risk is acceptable. ACC/AHA 2020 treat slow-infusion low-dose fibrinolysis and emergency surgery as equal first-line options, chosen case by case. No randomised trial has compared them head to head.</Note>
    </>
  );
}

/* ============================================================
   5 · SET-UP FOR LYSIS
   ============================================================ */

function Setup() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🌅 day 2 · 09:30</span>Coronary care, bed 9 of the Valvular & Structural Heart Unit later. Anti-Xa (rivaroxaban) &lt; 30 ng/mL. UFH running since 20:00, paused at 09:00 per protocol. Fibrinogen 3.4 g/L, platelets 204.</p>
      </div>
      <MultiSelect id="s5-check" question="✅ Before the alteplase starts, what must be in place?"
        items={[
          { id: 'lines', label: 'Two good peripheral cannulas placed BEFORE the infusion', correct: true, why: 'Every puncture during lysis is a bleeding site.' },
          { id: 'noart', label: 'No arterial punctures, no central lines at non-compressible sites, no IM injections', correct: true, why: 'A subclavian puncture during lysis can bleed into the chest with no way to compress it.' },
          { id: 'blood', label: 'Group and save; fibrinogen concentrate or cryoprecipitate and tranexamic acid available', correct: true, why: 'The bleeding kit, before you need it.' },
          { id: 'neuro', label: 'A documented baseline neurological examination', correct: true, why: 'You cannot detect a change without a baseline.' },
          { id: 'bp', label: 'BP below 180/110', correct: true, why: 'Hers is 112/68.' },
          { id: 'surg', label: 'Cardiac surgeon aware and a theatre plan if lysis fails or she deteriorates', correct: true, why: 'The bailout.' },
          { id: 'cvc', label: 'A subclavian central line “for access during lysis”', correct: false, why: 'Non-compressible: exactly what not to do.' },
          { id: 'cath', label: 'A urinary catheter — once the infusion is running', correct: false, why: 'If needed, place it BEFORE: urethral trauma bleeds on alteplase.' },
        ]} />
      <Sequence id="s5-seq" question="Put the lysis protocol in order."
        steps={[
          { label: 'Confirm obstructive thrombus and its size on TOE; document leaflet angles on fluoroscopy', why: 'The baseline you will compare with.' },
          { label: 'Pause the UFH; check fibrinogen, platelets, aPTT', why: 'Per the published low-dose protocols; follow your local protocol.' },
          { label: 'Alteplase 25 mg over 6 hours by pump — no bolus', why: 'Double-checked rate: 4.2 mL/h at 1 mg/mL.' },
          { label: 'Hourly neurological, BP and bleeding-site checks', why: 'A new deficit or headache means stop and scan.' },
          { label: 'At the end: TTE gradients, fluoroscopy angles (± TOE)', why: 'Success is a normal gradient AND normal leaflet motion.' },
          { label: 'Restart UFH; repeat the dose if the response is partial', why: 'Up to ~6–8 doses, cumulative ≤ ~150 mg; surgery if it fails.' },
        ]} />
      <Why title="🧯 Why lysis bleeds where you put needles"
        chain={[
          { k: 'EVERY PUNCTURE', t: 'Each needle hole is sealed by a small fibrin plug.' },
          { k: 'PLASMIN', t: 'Alteplase cannot tell the valve thrombus from the plug in your arterial puncture.' },
          { k: 'COMPRESSIBLE', t: 'An arm or a groin can be pressed; a subclavian artery or the retroperitoneum cannot.' },
          { k: 'SO', t: 'All access before you start, nothing non-compressible during, pressure for any ooze.' },
        ]} />
      <Contrast title="📍 a compressible ooze vs a non-compressible bleed"
        is={{ h: 'Compressible ooze', points: ['Cannula site, gums, a skin tear.', 'Pressure and a dressing; continue the infusion.'] }}
        isnt={{ h: 'Major or non-compressible bleeding', points: ['Haematemesis, melaena, a falling haemoglobin, retroperitoneal pain, any neurological change.', 'STOP the alteplase; fibrinogen replacement, tranexamic acid; scan.'] }} />
    </>
  );
}

/* ============================================================
   6 · CHOOSE YOUR PATH
   ============================================================ */

function Strategy() {
  const { answers } = useCase();
  const a = answers['s6-shock'], b = answers['s6-fail'];
  return (
    <>
      <p className="cs-p">Before the pump starts, rehearse the forks in the road. Each choice shows where it leads.</p>
      <MultiSelect id="s6-stop" question="🛑 Which would make you STOP the alteplase immediately?"
        items={[
          { id: 'neuro', label: 'New headache, vomiting, falling GCS or any focal deficit', correct: true, why: 'Intracranial haemorrhage or embolic stroke until a CT says otherwise.' },
          { id: 'major', label: 'Haematemesis, melaena, or a haemoglobin fall ≥ 20 g/L', correct: true, why: 'Major bleeding.' },
          { id: 'ana', label: 'Angioedema or anaphylaxis', correct: true, why: 'Rare with alteplase, commoner with ACE inhibitors.' },
          { id: 'ooze', label: 'Oozing at a cannula site', correct: false, why: 'Pressure and continue.' },
          { id: 'af', label: 'Ventricular ectopics', correct: false, why: 'Reperfusion of a valve does not cause them; watch the electrolytes.' },
        ]} />
      <Decision id="s6-shock" question="Branch A — hour 2, she suddenly becomes shocked: BP 72/40, SpO₂ 82%, the closing click gone entirely. Fluoroscopy: BOTH leaflets now immobile."
        options={[
          { id: 'or', label: 'Emergency surgery despite her risk — and, if theatre cannot take her at once, a rescue full-dose lysis', verdict: 'best', points: 10,
            why: 'A fully stuck mechanical mitral valve is cardiac arrest in minutes. In collapse, the slow regimen is too slow: either the surgeon now or the fastest lysis available.' },
          { id: 'cont', label: 'Continue the slow infusion; add noradrenaline', verdict: 'wrong', points: 0, why: 'Six hours she does not have.' },
          { id: 'cpr', label: 'Wait for arrest, then CPR', verdict: 'wrong', points: 0, why: 'Chest compressions cannot push blood through a closed valve.' },
        ]} />
      {a && <Note kind="pearl" title="🔀 Where that path leads">{a === 'or' ? 'In the rehearsal the surgeon opens the chest at 02:00; the valve is replaced. A third sternotomy is a terrible operation — but survivable. Today the real infusion goes better.' : 'In the rehearsal she arrests; compressions fail to produce a pulse with a closed valve. This is why the bailout is agreed before the infusion starts.'}</Note>}
      <Decision id="s6-fail" question="Branch B — after six 25 mg doses (150 mg) the leaflet has not moved and the gradient is unchanged. What is the likely reason, and the plan?"
        options={[
          { id: 'pannus', label: 'Pannus (± organised thrombus) that lysis cannot dissolve: stop lysis, CT if helpful, redo surgery', verdict: 'best', points: 10,
            why: 'Non-response is a diagnosis in itself. More alteplase only adds bleeding risk.' },
          { id: 'more', label: 'A seventh and eighth dose', verdict: 'wrong', points: 0, why: 'Beyond the protocol ceiling, with no response to show for it.' },
          { id: 'tnk', label: 'Switch to tenecteplase', verdict: 'wrong', points: 1, why: 'Another fibrinolytic does not dissolve collagen.' },
        ]} />
      {b && <Note kind="pearl" title="🔀 Where that path leads">{b === 'pannus' ? 'At surgery: a ring of white pannus under leaflet B with a small layer of organised thrombus. Lysis could never have freed it.' : 'More doses, no change — and an intracranial bleed on dose eight. Know when to stop.'}</Note>}
      <Why title="🧭 Why the bailout is agreed before you start"
        chain={[
          { k: 'FRAGILE', t: 'A half-stuck valve can become fully stuck as a fragment shifts.' },
          { k: 'MINUTES', t: 'A fully stuck mitral prosthesis gives no forward flow at all.' },
          { k: 'NO TIME TO DEBATE', t: 'Calling a surgeon who has not heard of the patient costs the minutes she does not have.' },
          { k: 'SO', t: 'Surgeon, theatre, perfusionist and the rescue-lysis dose written down before the first mL runs.' },
        ]} />
      <Contrast title="⚠️ a partial response vs no response"
        is={{ h: 'Partial response', points: ['The leaflet opens more, the gradient falls, the thrombus shrinks.', 'It is working: repeat the dose.'] }}
        isnt={{ h: 'No response', points: ['Nothing moves after several doses.', 'Think pannus or organised thrombus: surgery.'] }} />
    </>
  );
}

/* ============================================================
   7 · THE LYSIS
   ============================================================ */

function Lysis() {
  const { answers, answer, setVitals } = useCase();
  const r = answers['s7-lysis'];
  const pts = r == null ? null : (r.rateOk ? 5 : 0) + Math.max(0, 5 - r.missed * 2) + (r.oozeOk ? 5 : 0) + (r.next === 'repeat' ? 5 : r.next === 'surg' ? 2 : 0);
  return (
    <>
      <p className="cs-p">10:00, coronary care. You own the pump. Set it, check her every hour, deal with what comes up, and decide at the end of the dose. The fluoroscopy frames are frozen in diastole, the ring edge-on.</p>
      <BedsideMonitor />
      <LysisRun done={r}
        onProgress={pr => {
          if (pr.dose2) setVitals({ hr: 80, sys: 122, dia: 74, spo2: 97, rr: 16 });
          else if (pr.hour > 0) setVitals({ hr: 92 - pr.hour * 1.5, sys: 112 + pr.hour, dia: 68, spo2: 95, rr: 18 });
        }}
        onResult={res => answer('s7-lysis', res)} />
      <ScoreOnce id="s7-lysis" pts={pts} max={20} />
      {r && (
        <>
          <Decision id="s7-success" question="What defines success?"
            options={[
              { id: 'both', label: 'Normal leaflet motion on fluoroscopy AND gradient/PHT back to her baseline, with the thrombus gone or minimal on TOE', verdict: 'best', points: 8,
              why: 'The clicks are a good sign but not the proof. Measure the angles and the Doppler again — and repeat in the coming days.' },
              { id: 'click', label: 'The opening click is audible again', verdict: 'ok', points: 3, why: 'Encouraging, not quantitative.' },
              { id: 'grad', label: 'A falling gradient alone', verdict: 'wrong', points: 1, why: 'A gradient can fall because the rate slowed or the output fell.' },
            ]} />
          <Why title="🔊 Why the clicks came back"
            chain={[
              { k: 'FIBRIN CUT', t: 'Plasmin dissolved the mesh binding leaflet B at its hinge.' },
              { k: 'FULL SWING', t: 'The leaflet travels 55° again, gaining speed as it goes.' },
              { k: 'IMPACT', t: 'It strikes the housing hard at both ends of its travel.' },
              { k: 'SOUND', t: 'Crisp closing click, opening click back — her husband will sleep tonight.' },
            ]} />
        </>
      )}
      <CaseLibrary title="Prosthetic valve cases on the recommended channels" channels={PVT_SEARCHES}>
        Channel searches for prosthetic valve and valve-thrombosis cases. Watch how fluoroscopy and TOE are used to judge leaflet motion.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   8 · BACK ON THE UNIT — THE RIGHT ANTICOAGULANT, THE RIGHT TARGET
   ============================================================ */

const INR_VISITS = [
  { id: 's8-inr1', label: 'Day 3', inr: 1.5, q: 'Day 3: warfarin 5 mg daily started on day 2; UFH running, aPTT ratio 2.0. INR 1.5.',
    options: [
      { id: 'keep', label: 'Same dose; continue UFH', verdict: 'best', points: 4, why: 'The early INR rise is mostly factor VII (half-life ~6 h). Factor II takes days to fall — the INR is not protection yet.' },
      { id: 'stop', label: 'Stop UFH — the INR is rising', verdict: 'wrong', points: 0, why: 'Early warfarin is not yet anticoagulant; stopping heparin now leaves the valve unprotected.' },
      { id: 'up', label: 'Double the dose to reach target faster', verdict: 'wrong', points: 1, why: 'Overshoot follows a few days later.' },
    ] },
  { id: 's8-inr2', label: 'Day 6', inr: 2.2, q: 'Day 6: INR 2.2 on 5 mg daily. Target 2.5–3.5.',
    options: [
      { id: 'up', label: 'Increase the weekly dose by ~10–15% (to ~40 mg/week); continue UFH', verdict: 'best', points: 4, why: 'Small steps, because each change takes 5–7 days to show fully.' },
      { id: 'stop', label: 'Stop UFH — 2.2 is close enough', verdict: 'wrong', points: 0, why: 'Bridge until the INR is in HER range on two consecutive days.' },
      { id: 'big', label: 'Increase to 10 mg daily', verdict: 'wrong', points: 1, why: 'A 100% increase — an INR of 6 next week.' },
    ] },
  { id: 's8-inr3', label: 'Day 10', inr: 2.9, q: 'Day 9 INR 2.8, day 10 INR 2.9 on ~40 mg/week.',
    options: [
      { id: 'stop', label: 'In range on two consecutive days: stop UFH; same warfarin dose; INR in 3–5 days', verdict: 'best', points: 4, why: 'The bridge ends when the INR is reliably therapeutic.' },
      { id: 'more', label: 'Keep UFH for another week', verdict: 'wrong', points: 1, why: 'Extra bleeding risk with no gain.' },
    ] },
  { id: 's8-inr4', label: 'Week 4', inr: 4.6, q: 'Week 4: INR 4.6. Her GP started clarithromycin 5 days ago for a chest infection. No bleeding.',
    options: [
      { id: 'hold', label: 'Omit one dose, then resume at a slightly lower dose while on the antibiotic; INR again in 3–5 days; no vitamin K', verdict: 'best', points: 4, why: 'Macrolides inhibit warfarin metabolism (CYP3A4) — expected. Without bleeding, an INR of 4.5–10 is managed by holding doses; vitamin K is reserved for higher values or bleeding.' },
      { id: 'vitk', label: 'Vitamin K 10 mg IV', verdict: 'wrong', points: 0, why: 'In a mechanical mitral valve that makes her warfarin-resistant for a week — the setting for re-thrombosis (see the M&M).' },
      { id: 'ignore', label: 'No change — the infection will settle', verdict: 'wrong', points: 1, why: 'The INR will keep rising while she takes clarithromycin.' },
    ] },
  { id: 's8-inr5', label: 'Week 7', inr: 1.9, q: 'Week 7: antibiotic finished 10 days ago; she stayed on the reduced dose. INR 1.9.',
    options: [
      { id: 'back', label: 'Back to the previous ~40 mg/week; recheck in 5–7 days; teach her why the antibiotic changed it', verdict: 'best', points: 4, why: 'The interaction has gone, so the dose that worked before works again.' },
      { id: 'lmwh', label: 'Same, plus therapeutic LMWH until the INR is in range', verdict: 'ok', points: 2, why: 'Some units bridge a mildly low INR in a mechanical mitral valve after recent thrombosis — a defensible choice, at the cost of bleeding risk.' },
      { id: 'doac', label: 'Switch to apixaban — the INR is too unstable', verdict: 'wrong', points: 0, why: 'That is how she got here.' },
    ] },
];

function InrPlanner() {
  const { answers } = useCase();
  let open = 0;
  while (open < INR_VISITS.length && answers[INR_VISITS[open].id]) open++;
  const pts = INR_VISITS.slice(0, open).map(v => ({ label: v.label, inr: v.inr }));
  if (open < INR_VISITS.length) pts.push({ label: INR_VISITS[open].label, inr: INR_VISITS[open].inr });
  return (
    <>
      <InrChart points={pts} />
      {INR_VISITS.slice(0, Math.min(open + 1, INR_VISITS.length)).map(v => <Decision key={v.id} id={v.id} question={`📒 ${v.q}`} options={v.options} />)}
    </>
  );
}

function Recovery() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🛏️ day 3 · 11:00</span>Bed 9, Valvular & Structural Heart Unit. Crisp clicks, both of them. Mean gradient 5 mmHg, PHT 95 ms. On 2 L of oxygen, then none. UFH running.</p>
      </div>
      <Decision id="s8-oac" question="Long-term anticoagulation for her mechanical mitral valve and AF?"
        options={[
          { id: 'vka', label: 'Warfarin (a VKA), overlapped with UFH until the INR is in range on two consecutive days', verdict: 'best', points: 10, why: 'VKAs are the only oral anticoagulants for mechanical valves. DOACs are contraindicated (class III).' },
          { id: 'riva', label: 'Restart rivaroxaban now the valve is open', verdict: 'wrong', points: 0, why: 'It failed once already.' },
          { id: 'dabi', label: 'Dabigatran', verdict: 'wrong', points: 0, why: 'RE-ALIGN: more strokes, more valve thrombosis, more bleeding than warfarin.' },
          { id: 'lmwh', label: 'Long-term LMWH injections', verdict: 'wrong', points: 1, why: 'Used in pregnancy with weekly anti-Xa monitoring — not as a long-term substitute outside it.' },
        ]} />
      <Why title="🧲 Why a DOAC protects an AF atrium but not a metal valve"
        chain={[
          { k: 'CONTACT', t: 'Blood touching an artificial surface activates factor XII — the contact (intrinsic) pathway — continuously.' },
          { k: 'THRUST', t: 'Plus shear and stasis in the hinges: a huge, constant thrombin drive at one spot.' },
          { k: 'ONE TARGET', t: 'A DOAC blocks one enzyme (Xa or thrombin), and its level falls between doses.' },
          { k: 'MANY FACTORS', t: 'Warfarin lowers II, VII, IX and X together, steadily — and the INR proves it.' },
          { k: 'THE TROUGH', t: 'At the DOAC trough, the valve’s thrombin generation escapes: RE-ALIGN and PROACT Xa were stopped early for clots.' },
        ]} />
      <Contrast title="💊 who can have a DOAC — and who can’t"
        is={{ h: 'DOAC acceptable', points: ['AF with mitral regurgitation, aortic stenosis or a mitral clip.', 'AF with a bioprosthetic valve (after the first 3 months) or a TAVI.', 'AF without valve disease.'] }}
        isnt={{ h: 'VKA only — never a DOAC', points: ['ANY mechanical valve, any position.', 'Moderate–severe rheumatic mitral stenosis with AF.', 'Mechanical valve in pregnancy: VKA or monitored LMWH, specialist care.'] }} />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🎯 INR targets — ESC/EACTS</div>
        <Table head={['Prosthesis thrombogenicity', 'No patient risk factor', '≥ 1 patient risk factor']} rows={[
          ['Low — e.g. most modern bileaflet valves (St Jude, Carbomedics, On-X, ATS), Medtronic Hall', N('2.5'), N('3.0')],
          ['Medium — other bileaflet valves with fewer data', N('3.0'), N('3.5')],
          ['High — older tilting-disc (Lillehei–Kaster, Omniscience, Björk–Shiley), ball-and-cage (Starr–Edwards)', N('3.5'), N('4.0')],
        ]} />
        <p className="cs-pts">Patient risk factors: mitral or tricuspid replacement · previous thromboembolism · AF · mitral stenosis of any degree · LVEF &lt; 35%. Aim for the number; accept ±0.5 around it.</p>
      </div>
      <Decision id="s8-target" question="Her INR target?"
        options={[
          { id: '3', label: '3.0 (range 2.5–3.5)', verdict: 'best', points: 10, why: 'A low-thrombogenicity bileaflet valve, plus patient risk factors (mitral position, AF): 3.0.' },
          { id: '25', label: '2.5 (2.0–3.0)', verdict: 'wrong', points: 2, why: 'That is for a low-thrombogenicity AORTIC valve with no risk factors.' },
          { id: '35', label: '3.5 (3.0–4.0)', verdict: 'ok', points: 3, why: 'For a medium-thrombogenicity valve with risk factors. More bleeding without benefit for her model.' },
          { id: '2', label: '2.0 — the AF target', verdict: 'wrong', points: 0, why: 'AF targets do not protect a mechanical mitral valve.' },
        ]} />
      <Decision id="s8-asa" question="Add aspirin 75 mg to her warfarin?"
        options={[
          { id: 'no', label: 'No — her thrombosis followed a lapse in anticoagulation, not a failure of a therapeutic INR; she has no atherosclerotic disease', verdict: 'best', points: 8,
            why: 'ESC/EACTS: low-dose aspirin may be added after thromboembolism DESPITE an adequate INR, or with concomitant atherosclerotic disease — at the price of more bleeding.' },
          { id: 'yes', label: 'Yes — all mechanical valves need aspirin too', verdict: 'wrong', points: 0, why: 'Older practice; routine addition increases bleeding.' },
        ]} />

      <div className="cs-h2">📒 The INR log — you are her anticoagulation clinic</div>
      <p className="cs-p">Target band 2.5–3.5, aiming for 3.0. Make each call; the next visit unlocks.</p>
      <InrPlanner />
      <MultiSelect id="s8-inter" question="💊 Which of these RAISE her INR?"
        items={[
          { id: 'amio', label: 'Amiodarone', correct: true, why: 'Inhibits CYP2C9 — often needs a 30–50% warfarin reduction, over weeks.' },
          { id: 'clar', label: 'Clarithromycin / erythromycin', correct: true, why: 'CYP3A4 inhibition.' },
          { id: 'metro', label: 'Metronidazole, fluconazole, co-trimoxazole', correct: true, why: 'CYP2C9 inhibition — big rises.' },
          { id: 'rif', label: 'Rifampicin', correct: false, why: 'LOWERS it — a powerful inducer; the INR can halve within a week.' },
          { id: 'carb', label: 'Carbamazepine', correct: false, why: 'Lowers it — an inducer.' },
          { id: 'greens', label: 'A sudden diet of spinach and kale', correct: false, why: 'Lowers it — vitamin K. Consistency matters more than avoidance.' },
        ]} />

      <div className="cs-h2">🦷 Bridging and procedures</div>
      <Decision id="s8-dental" question="In a month she needs two teeth extracted."
        options={[
          { id: 'cont', label: 'Continue warfarin; INR within 72 h (aim ≤ 3.5–4.0 per the dentist’s protocol); local haemostasis and tranexamic acid mouthwash', verdict: 'best', points: 8,
            why: 'Minor bleeding-risk procedures (dental, skin, cataract) are done without interruption. Stopping warfarin for a tooth risks the valve for nothing.' },
          { id: 'stop', label: 'Stop warfarin 5 days before', verdict: 'wrong', points: 0, why: 'A war story below.' },
          { id: 'switch', label: 'Switch to rivaroxaban for a week around it', verdict: 'wrong', points: 0, why: 'No.' },
        ]} />
      <Sequence id="s8-bridge" question="In three months: colonoscopy with polypectomy of a large polyp (high bleeding risk). Order the bridging plan."
        steps={[
          { label: 'Day −5: last warfarin dose', why: 'The INR takes ~4–5 days to fall below 1.5.' },
          { label: 'Day −3: start therapeutic LMWH (or IV UFH) once the INR is < 2.0', why: 'A mechanical MITRAL valve with AF: bridging is required.' },
          { label: 'Day −1: last LMWH dose ≥ 24 h before; INR checked (< 1.5)', why: 'UFH can run until 4–6 h before instead.' },
          { label: 'Day 0: procedure; warfarin restarted that evening at the usual dose', why: 'Warfarin takes days to work, so it can start early.' },
          { label: 'Day +1 to +2: LMWH restarted once haemostasis is secure; stop when the INR is in range', why: 'Delayed post-polypectomy bleeding peaks around day 5–7: keep watching.' },
        ]} />
      <Video id="UfHiYFIdnHs" title="Warfarin monitoring & INR explained" />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — DAY 4, 18:20
   ============================================================ */

function Crisis() {
  const { answers, answer, setVitals } = useCase();
  const done = answers['s9-ect'];
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>🚨 day 4 · 18:20</span>
          Her husband runs to the desk: she was telling him about the grandchildren and the words stopped coming. Right arm drooping, right face drooping. Last seen normal at 18:05. INR 2.0 on warfarin; UFH running, aPTT ratio 2.1.
        </p>
      </div>
      <BedsideMonitor />
      <MultiSelect id="s9-first" question="⏱️ The first ten minutes."
        items={[
          { id: 'lkw', label: 'Fix the time last known well: 18:05', correct: true, why: 'Every decision about reperfusion hangs on it.' },
          { id: 'gluc', label: 'Capillary glucose', correct: true, why: 'Hypoglycaemia mimics stroke.' },
          { id: 'code', label: 'Stroke call; CT and CT angiography now', correct: true, why: 'Bleed or clot? Large vessel or not?' },
          { id: 'stopufh', label: 'Pause the UFH until a haemorrhage is excluded', correct: true, why: 'Hours off heparin matter far less than heparin running into a bleed.' },
          { id: 'nbm', label: 'Nil by mouth until a swallow screen', correct: true, why: 'Aspiration.' },
          { id: 'tpa', label: 'IV alteplase/tenecteplase if the CT is clear', correct: false, why: 'Contraindicated: therapeutic heparin, INR 2.0, and 50 mg of alteplase in the last 3 days.' },
          { id: 'bpdrop', label: 'Lower her BP of 182/98 to 120 straight away', correct: false, why: 'A threatened brain needs perfusion pressure; no aggressive lowering unless she bleeds or is lysed.' },
        ]} />
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧠 CT · 18:41</div>
        <Table head={['', 'Finding']} rows={[
          ['Non-contrast CT', 'No haemorrhage; ASPECTS 9'],
          ['CT angiography', 'Occlusion of the LEFT middle cerebral artery, proximal M1'],
          ['CT perfusion', 'A small core with a large mismatch'],
        ]} />
      </div>
      <Decision id="s9-dx" question="What has happened?"
        options={[
          { id: 'emb', label: 'A cardio-embolic stroke: a fragment of valve thrombus (or new thrombus during the sub-therapeutic days) to the left MCA', verdict: 'best', points: 10,
            why: 'Embolism is the commonest serious complication of valve-thrombosis lysis, and the days before the INR is therapeutic are a vulnerable window.' },
          { id: 'ich', label: 'An intracranial haemorrhage', verdict: 'wrong', points: 0, why: 'The CT shows no blood. It was right to ask — the treatment is opposite.' },
          { id: 'tia', label: 'A TIA — wait and see', verdict: 'wrong', points: 0, why: 'A proximal M1 occlusion with a deficit is a stroke in evolution.' },
        ]} />
      <Decision id="s9-tx" question="Treatment?"
        options={[
          { id: 'mt', label: 'Mechanical thrombectomy now', verdict: 'best', points: 10,
            why: 'A large-vessel occlusion within hours, a small core: thrombectomy is effective and does not depend on her coagulation. Anticoagulated patients are thrombectomy candidates.' },
          { id: 'tnk', label: 'IV tenecteplase', verdict: 'wrong', points: 0, why: 'Anticoagulated and recently lysed: the bleeding risk is prohibitive.' },
          { id: 'hep', label: 'A heparin bolus to treat the clot', verdict: 'wrong', points: 0, why: 'Heparin does not reopen an occluded artery and raises the risk of haemorrhagic transformation.' },
          { id: 'asa', label: 'Aspirin 300 mg', verdict: 'wrong', points: 1, why: 'Not the treatment for an M1 occlusion — and on top of her anticoagulation.' },
        ]} />
      {!done ? (
        <button className="cs-btn primary" onClick={() => { answer('s9-ect', true); setVitals({ hr: 84, sys: 150, dia: 82, spo2: 97, rr: 16 }); }}>🧲 Send her for thrombectomy</button>
      ) : (
        <div className="cs-fb best">Groin puncture 19:12; one pass of a stent-retriever; TICI 3 at 19:40. By 22:00 she says “water” and “Hassan”. At 24 h: a small left striatocapsular infarct, no haemorrhage.</div>
      )}
      {done && (
        <Decision id="s9-ac" question="24 h later: a small infarct, no haemorrhagic transformation. Her mechanical mitral valve was obstructed four days ago. Anticoagulation?"
          options={[
            { id: 'resume', label: 'Resume UFH without a bolus now (aPTT at the low end of the range) and continue warfarin to her target; repeat imaging if she worsens', verdict: 'best', points: 10,
              why: 'With a small infarct and no bleed, the risk of re-thrombosing a mechanical mitral valve outweighs the risk of haemorrhagic transformation. For LARGE infarcts, teams usually wait longer (often 1–2 weeks). The evidence is observational — decide with stroke and cardiology together.' },
            { id: 'two', label: 'Stop all anticoagulation for 2 weeks', verdict: 'ok', points: 3, why: 'Reasonable for a large infarct or a haemorrhage — too long for her small one, with a valve that clotted days ago.' },
            { id: 'bolus', label: 'Restart UFH with a bolus, aPTT ratio 2.5–3', verdict: 'wrong', points: 0, why: 'Overshooting into a fresh infarct invites a bleed.' },
          ]} />
      )}
      <Decision id="s9-ich" question="Contrast case: if her CT had shown a 30 mL left intracerebral haemorrhage, what would you have done?"
        options={[
          { id: 'rev', label: 'Stop UFH and give protamine; reverse warfarin with 4-factor PCC and IV vitamin K; BP towards 140 systolic; neurosurgery — and plan when to restart anticoagulation with the valve team', verdict: 'best', points: 10,
            why: 'Life-threatening bleeding outranks the valve for now. Reverse completely, then discuss restarting (often after 1–2 weeks; earlier for the highest-risk valves).' },
          { id: 'cont', label: 'Continue anticoagulation — the valve is mechanical', verdict: 'wrong', points: 0, why: 'An expanding haematoma kills faster than a valve clots.' },
          { id: 'ffp', label: 'FFP only', verdict: 'wrong', points: 2, why: 'Slower and less complete than PCC; volume load in a heart with recent pulmonary oedema.' },
        ]} />
      <Contrast title="🧠 ischaemic vs haemorrhagic stroke in a patient on anticoagulation"
        is={{ h: 'Ischaemic (hers)', points: ['No blood on CT.', 'Thrombectomy for a large vessel; no IV lysis on therapeutic anticoagulation.', 'Resume anticoagulation early if the infarct is small.'] }}
        isnt={{ h: 'Haemorrhagic', points: ['Blood on CT.', 'Reverse everything: protamine, PCC, vitamin K; BP control.', 'Restart only after a team decision, usually after days to weeks.'] }} />
      <Why title="🎯 Why the left MCA"
        chain={[
          { k: 'LEFT HEART', t: 'A fragment leaving a mitral prosthesis enters the LV and is ejected into the aorta.' },
          { k: 'STRAIGHT UP', t: 'The carotids take ~20% of the output; the left common carotid comes almost straight off the arch.' },
          { k: 'THE BIGGEST BRANCH', t: 'The MCA carries most of the internal carotid’s flow — emboli follow flow.' },
          { k: 'LEFT HEMISPHERE', t: 'Language and the right arm and face: what her husband saw.' },
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
      <ViciousCycle id="cyc-obs" title="The obstructed-mitral spiral"
        nodes={[
          { short: 'Hinge clot', t: 'Thrombus grows in the hinge of leaflet B', d: 'The slowest-flowing spot in the valve.' },
          { short: 'Stuck leaflet', t: 'The leaflet opens less', d: 'Half the orifice is lost.' },
          { short: 'LA pressure', t: 'The gradient and LA pressure rise', d: 'Pulmonary oedema; the atrium stretches.' },
          { short: 'Fast AF', t: 'AF speeds up', d: 'Adrenaline, hypoxia, a stretched atrium.' },
          { short: 'Short diastole', t: 'Diastole shortens', d: 'Less time to fill through a smaller hole — the gradient climbs again.' },
          { short: 'Low flow', t: 'Output and flow through the valve fall', d: 'Slower flow at the hinge: more stasis, more clot.' },
        ]}
        breaks={[
          { at: 0, t: 'Remove the thrombus: lysis or surgery; then the right anticoagulant at the right target.' },
          { at: 3, t: 'Careful rate control — digoxin, amiodarone, then beta-blocker.' },
          { at: 2, t: 'Diuretics and CPAP to buy time.' },
          { at: 5, t: 'Heparin from the moment the diagnosis is suspected.' },
        ]} />
      <Decision id="cyc-rate" question="Why does slowing the heart help here, when it harmed the patient in Case 02?"
        options={[
          { id: 'dia', label: 'An obstructed mitral valve fills only in diastole: a slower rate gives more time to fill, so less pressure is needed. Acute MR depends on rate for output.', verdict: 'best', points: 10, why: 'Same drug, opposite physiology: always ask where the problem is in the cardiac cycle.' },
          { id: 'o2', label: 'Beta-blockers reduce myocardial oxygen use', verdict: 'wrong', points: 0, why: 'True, but not why it helps the stuck valve.' },
        ]} />
      <ViciousCycle id="cyc-stasis" title="Thrombus begets thrombus — the hinge"
        nodes={[
          { short: 'Low INR', t: 'Anticoagulation falls short', d: 'A missed dose, an interaction, a DOAC trough.' },
          { short: 'Fibrin', t: 'Fibrin and platelets settle in the hinge recess', d: 'Contact activation on the artificial surface.' },
          { short: 'Less washout', t: 'The leaflet moves less', d: 'The hinge is washed less with every beat.' },
          { short: 'More stasis', t: 'More stasis, more fibrin', d: 'Until the leaflet stops.' },
        ]}
        breaks={[
          { at: 0, t: 'A VKA at the target for the valve AND the patient; INR self-testing.' },
          { at: 1, t: 'Never a DOAC; no unbridged gaps; check interactions.' },
          { at: 3, t: 'Act on early signs: quieter clicks, rising gradient, more breathlessness.' },
        ]} />
      <ViciousCycle id="cyc-haem" title="The haemolysis spiral — a paravalvular leak"
        nodes={[
          { short: 'Leak jet', t: 'A small paravalvular leak', d: 'A high-velocity jet through a narrow gap beside the ring.' },
          { short: 'Shear', t: 'Red cells are torn by the shear', d: 'LDH up, haptoglobin down, schistocytes.' },
          { short: 'Anaemia', t: 'Anaemia', d: 'Less oxygen per mL of blood.' },
          { short: 'High output', t: 'The heart pumps faster and harder', d: 'A faster jet — more shear, more haemolysis.' },
        ]}
        breaks={[
          { at: 0, t: 'Close the leak: transcatheter plug or surgery.' },
          { at: 2, t: 'Iron, folate, transfusion when needed.' },
          { at: 3, t: 'Beta-blocker to slow the heart and the jet.' },
        ]} />
      <Decision id="cyc-why" question="Her LDH was 410 on admission. Why?"
        options={[
          { id: 'flow', label: 'Turbulent, high-velocity flow across the partly stuck valve damages red cells', verdict: 'best', points: 8, why: 'Haemolysis is a clue to prosthetic dysfunction — obstruction or paravalvular leak. It fell after lysis.' },
          { id: 'liver', label: 'Liver congestion alone', verdict: 'wrong', points: 0, why: 'Possible contributor; check haptoglobin and the film.' },
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
      <p className="cs-p">Composite morbidity-and-mortality cases. Every one is a specific anticoagulation decision.</p>
      <WarStory title="The new tablet for AF"
        mistake="Switching a mechanical mitral valve from warfarin to dabigatran because ‘DOACs are better for AF’."
        burn="Mechanical valve = VKA. No DOAC, at any dose, ever. RE-ALIGN and PROACT Xa were both stopped early for clots.">
        <p className="cs-p">A 49-year-old with a bileaflet mitral valve and AF, tired of INR clinics, was switched to dabigatran 150 mg twice daily — the regimen RE-ALIGN had tested and abandoned for excess strokes, valve thrombosis and bleeding. Four months later she arrived in cardiogenic shock with both leaflets stuck, and died on the table at her redo operation.</p>
      </WarStory>
      <Decision id="mm-doac" question="A patient with a mechanical AORTIC On-X valve asks if apixaban is safer than warfarin. Your answer?"
        options={[
          { id: 'no', label: 'No: PROACT Xa (apixaban vs warfarin in On-X aortic valves) was stopped early for excess thromboembolic events. Warfarin it is.', verdict: 'best', points: 10, why: 'Even the valve designed for lower INR targets is not safe on a DOAC.' },
          { id: 'yes', label: 'Yes, at 5 mg twice daily', verdict: 'wrong', points: 0, why: 'That is exactly what failed.' },
        ]} />
      <WarStory title="The tooth"
        mistake="Stopping warfarin for five days without bridging, for a simple dental extraction, in a patient with a mechanical mitral valve and AF."
        burn="Minor procedures: do not stop. Major ones in a mechanical mitral valve: bridge — and restart.">
        <p className="cs-p">A 62-year-old man stopped warfarin “as the dentist asked”, and nobody restarted it for a week. On day 12 he collapsed in the street: a stuck mitral valve, a cardiac arrest, two weeks in intensive care. He survived with a hypoxic brain injury.</p>
      </WarStory>
      <Decision id="mm-dent" question="Which part of that story should never have happened?"
        options={[
          { id: 'stop', label: 'Stopping warfarin at all for an extraction — it should have continued with local haemostasis', verdict: 'best', points: 10, why: 'And had a big procedure needed it, LMWH/UFH bridging and a restart date written in the plan.' },
          { id: 'inr', label: 'Not checking the INR the day before', verdict: 'wrong', points: 2, why: 'A detail; the error was the interruption.' },
        ]} />
      <WarStory title="Ten milligrams of vitamin K"
        mistake="IV vitamin K 10 mg for an INR of 6.2 without bleeding in a mechanical mitral valve."
        burn="High INR, no bleeding: hold doses (± low-dose ORAL vitamin K if very high). Big IV vitamin K is for life-threatening bleeding — with PCC.">
        <p className="cs-p">A 70-year-old woman on warfarin for a mechanical mitral valve: INR 6.2 after a course of metronidazole, no bleeding. She was given vitamin K 10 mg IV “to be safe”. For eight days her INR would not rise above 1.6 despite double doses, and nobody started heparin. On day 9: a stuck leaflet and pulmonary oedema; emergency surgery; she survived after three weeks in ICU.</p>
      </WarStory>
      <Decision id="mm-vitk" question="Same patient, INR 6.2, no bleeding. Best management?"
        options={[
          { id: 'hold', label: 'Omit 1–2 doses, find the cause (the metronidazole), restart at a lower dose; recheck in 1–2 days', verdict: 'best', points: 10, why: 'For INR > 10 without bleeding, low-dose oral vitamin K (1–2.5 mg) is reasonable. Not 10 mg IV.' },
          { id: 'ffp', label: 'FFP', verdict: 'wrong', points: 0, why: 'For bleeding only.' },
          { id: 'vk', label: 'IV vitamin K 10 mg', verdict: 'wrong', points: 0, why: 'The story you just read.' },
        ]} />
      <WarStory title="The pregnancy on unmonitored heparin"
        mistake="Changing a pregnant woman’s mechanical valve anticoagulation to fixed-dose LMWH with no anti-Xa monitoring."
        burn="Mechanical valve in pregnancy: the highest-risk anticoagulation in medicine. LMWH needs WEEKLY anti-Xa levels; dose rises as weight and kidney clearance rise.">
        <p className="cs-p">A 29-year-old with a mechanical mitral valve was switched to enoxaparin 1 mg/kg twice daily at 6 weeks — and never had a level checked. Her glomerular filtration rose with pregnancy, her weight rose, her anti-Xa fell. At 24 weeks: a stuck valve, shock, emergency surgery. She lived; her baby did not.</p>
      </WarStory>
      <Decision id="mm-preg" question="What should her LMWH monitoring have looked like?"
        options={[
          { id: 'axa', label: 'Weekly anti-Xa: peak 4–6 h after a dose, 1.0–1.2 IU/mL for a mitral valve (0.8–1.2 for aortic), with trough levels too; in a specialist pregnancy-heart team', verdict: 'best', points: 10, why: 'ESC 2018 pregnancy guideline. VKA in the 2nd–3rd trimester is an alternative (low-dose warfarin carries a lower embryopathy risk) — a shared decision.' },
          { id: 'none', label: 'Weight-based dosing is enough', verdict: 'wrong', points: 0, why: 'It is not — the story above.' },
        ]} />
      <WarStory title="Full-dose lysis for a big clot"
        mistake="Giving 100 mg of alteplase in 90 minutes to a stable patient with a 1.6 cm² left-sided thrombus and a prior stroke."
        burn="Size and stroke history change the risk of lysis. Big clot, prior stroke, stable patient: think surgery, or the slowest regimen.">
        <p className="cs-p">A 66-year-old man with an obstructed aortic prosthesis, NYHA II, thrombus 1.6 cm² on TOE, a stroke two years before. Full-dose alteplase “to be quick”. The valve opened at 60 minutes — and at 70 minutes he lost his speech and right side: a large embolus to the left MCA. He died nine days later.</p>
      </WarStory>
      <WarStory title="The rifampicin"
        mistake="Starting rifampicin for prosthetic valve endocarditis without anticipating its effect on warfarin."
        burn="Rifampicin can halve the INR within days and keep it down for weeks after stopping. Check the INR twice weekly — or bridge.">
        <p className="cs-p">A 55-year-old with a mechanical aortic valve and staphylococcal endocarditis started rifampicin. INR 2.8, then 1.6, then 1.2 over ten days; nobody looked. A large embolus to the superior mesenteric artery; a bowel resection; he survived, barely.</p>
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
      <MultiSelect id="s10-home" question="🏠 Her discharge plan (day 12)?"
        items={[
          { id: 'vka', label: 'Warfarin, target INR 3.0 (2.5–3.5), written on her card', correct: true, why: 'The number belongs to her valve and her risk factors.' },
          { id: 'self', label: 'INR self-testing with training, and a named anticoagulation clinic', correct: true, why: 'Self-monitoring improves time in range in trained patients (ESC/EACTS class I for selected patients).' },
          { id: 'card', label: 'A card: “Mechanical mitral valve — NEVER switch to a DOAC; never stop without a bridging plan”', correct: true, why: 'Aimed at the next well-meaning clinic.' },
          { id: 'click', label: 'Teach her and her husband: if the clicks change or go quiet, come in that day', correct: true, why: 'They noticed first. Make it official.' },
          { id: 'echo', label: 'TTE in 1–3 months against the new baseline', correct: true, why: 'A new fingerprint after lysis.' },
          { id: 'stroke', label: 'Stroke rehabilitation and follow-up; driving advice', correct: true, why: 'Speech is recovering; no driving for at least a month (local rules apply).' },
          { id: 'endo', label: 'Endocarditis prevention: dental hygiene, prophylaxis for dental procedures', correct: true, why: 'Prosthetic valve = highest risk.' },
          { id: 'asa', label: 'Add aspirin 75 mg', correct: false, why: 'Not for her: no atherosclerosis; the clot followed a lapse, not failure on a therapeutic INR.' },
        ]} />

      <div className="cs-h2">📝 Case quiz</div>
      <Quiz id="s10-quiz" items={[
        { q: 'A patient with a mechanical mitral valve says the click has become quiet. The most likely cause is…', options: ['Weight gain', 'Leaflet thrombosis', 'Normal ageing of the valve', 'Hearing loss'], answer: 1, why: 'Muffled or absent clicks = reduced leaflet motion until proven otherwise.' },
        { q: 'Which oral anticoagulant is appropriate for a mechanical valve?', options: ['Apixaban', 'Dabigatran', 'Warfarin', 'Rivaroxaban'], answer: 2, why: 'DOACs are contraindicated (RE-ALIGN, PROACT Xa).' },
        { q: 'INR target for a St Jude-type bileaflet MITRAL valve in a patient with AF:', options: ['2.0', '2.5', '3.0', '4.0'], answer: 2, why: 'Low thrombogenicity + risk factors (mitral position, AF) = 3.0.' },
        { q: 'For a mitral prosthesis, which DVI suggests significant obstruction?', options: ['1.5', '2.0', '> 2.5', '< 0.25'], answer: 2, why: 'VTI valve / VTI LVOT > 2.5. (< 0.25 is the threshold for an AORTIC prosthesis, where the ratio is inverted.)' },
        { q: 'A high mitral prosthetic gradient with a normal DVI and PHT in a patient with Hb 70 g/L suggests…', options: ['Thrombosis', 'High flow', 'Pannus', 'Mismatch'], answer: 1, why: 'Flow-dependent numbers up; flow-independent ones normal.' },
        { q: 'Fluoroscopy of a mitral bileaflet valve should be frozen in which phase to measure opening angles?', options: ['Systole', 'Diastole', 'Either', 'Isovolumic contraction'], answer: 1, why: 'Mitral valves open in diastole; aortic valves in systole.' },
        { q: 'Which favours pannus over thrombus?', options: ['Symptoms over days after a missed INR', 'A soft mobile mass on the atrial side', 'A small dense fixed mass, therapeutic INR, years after surgery', 'Response to lysis'], answer: 2, why: 'Pannus: slow, dense, fixed, collagen — lysis-resistant.' },
        { q: 'The low-dose slow alteplase regimen for prosthetic valve thrombosis is…', options: ['10 mg bolus + 90 mg over 90 min', '25 mg over 6 h without a bolus, repeated if needed', '0.9 mg/kg over 1 h', '50 mg bolus'], answer: 1, why: 'Or 25 mg over 25 h (ultraslow).' },
        { q: 'INR 6.2, no bleeding, mechanical mitral valve. Best:', options: ['IV vitamin K 10 mg', 'Hold 1–2 doses, find the cause, recheck', 'FFP', 'Stop warfarin for a week'], answer: 1, why: 'Big-dose vitamin K causes warfarin resistance and valve thrombosis.' },
        { q: 'Dental extraction in a patient with a mechanical valve:', options: ['Stop warfarin 5 days', 'Switch to a DOAC', 'Continue warfarin; local haemostasis', 'Stop warfarin and give LMWH'], answer: 2, why: 'Minor-risk procedures without interruption.' },
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
          <li className="cs-li">🔇 “My valve has gone quiet” is an emergency: muffled closing click, lost opening click.</li>
          <li className="cs-li">💊 Mechanical valve = VKA. Never a DOAC — RE-ALIGN and PROACT Xa were stopped early for clots.</li>
          <li className="cs-li">🎯 The INR target belongs to the valve AND the patient: low-thrombogenicity bileaflet 2.5, or 3.0 with a risk factor (mitral, AF, prior embolism, MS, EF &lt; 35%).</li>
          <li className="cs-li">🗂️ Compare with the valve’s own baseline; trust flow-independent numbers: DVI, PHT, EOA.</li>
          <li className="cs-li">🩻 Fluoroscopy shows the leaflets echo cannot: edge-on view, mitral frozen in diastole.</li>
          <li className="cs-li">🧱 Thrombus dissolves; pannus does not. No response to lysis is a diagnosis.</li>
          <li className="cs-li">⚖️ Obstructive left-sided thrombosis: surgery if the risk is acceptable; slow-infusion low-dose lysis if not (or as an AHA first-line alternative); heparin from the start.</li>
          <li className="cs-li">⏳ In mitral obstruction, slow the heart (carefully) — the opposite of acute MR.</li>
          <li className="cs-li">🧠 Stroke on anticoagulation: CT first; clot → thrombectomy (no IV lysis); bleed → reverse everything.</li>
          <li className="cs-li">🦷 Don’t stop warfarin for teeth; bridge a mechanical mitral valve for big procedures — and write the restart date.</li>
          <li className="cs-li">🧪 Interactions move the INR: macrolides, azoles, metronidazole and amiodarone up; rifampicin and carbamazepine down. Hold doses for a high INR — not 10 mg of vitamin K.</li>
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

export const VALVE_09 = {
  title: 'Prosthetic valve dysfunction · Stuck mechanical mitral leaflet · low-dose lysis and the INR',
  short: 'Structural Heart · Case 09',
  patient: {
    name: 'Mrs Amal Farouk',
    meta: '57 F · MRN 4126-0909 · 84 kg',
    flags: [
      { text: 'Mechanical mitral (2001)', tone: 'amber' },
      { text: 'Rivaroxaban × 7 weeks', tone: 'red' },
      { text: 'Two sternotomies', tone: 'amber' },
      { text: 'Permanent AF', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 30, limit: 100, basis: 'no contrast planned' },
  clock0: min(6, 10),
  vitals0: { hr: 124, sys: 96, dia: 62, spo2: 89, rr: 30, st: 0, rhythm: 'af' },
  brand: { icon: '⚙️', line: 'Structural Heart · Case 09' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / EM / IM', tone: 'cyan' },
      { text: 'Prosthetic valves · anticoagulation', tone: 'red' },
      { text: 'ESC/EACTS 2025 VHD-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'The valve', style: 'outline' },
      { text: 'that went', style: 'grad' },
      { text: 'quiet', style: 'cyan' },
    ],
    hook: (
      <>
        For twenty years her husband fell asleep to the <b>tick</b> of her mechanical mitral valve. Seven weeks after a clinic swapped her warfarin for a “better tablet for AF”, the ticking stops — and she is drowning.
        You will measure a prosthesis with Doppler, find the stuck leaflet on fluoroscopy, choose between a <span className="r">third sternotomy</span> and a slow drip of clot-buster, run the infusion hour by hour, rebuild her INR to the <span className="g">right number</span> — and face the stroke on day 4.
      </>
    ),
    image: null,
    sims: 's2',
    crisis: 's9',
    cards: [
      { k: '👩 The patient', t: 'Mrs Amal Farouk, 57 — rheumatic heart disease, a mechanical mitral valve since 32, two sternotomies, and the wrong anticoagulant.' },
      { k: '🧑‍⚕️ Your role', t: 'Resus, echo lab, cath lab fluoroscopy, heart team, coronary care, the anticoagulation clinic and the stroke call.' },
      { k: '🎛️ In your hands', t: 'Valve clicks, prosthetic Doppler (DVI, EOA, PHT), cinefluoroscopy angles, a decision map, the lysis pump, an INR log.' },
      { k: '🧠 How it teaches', t: 'Why metal valves need warfarin, why the clicks go quiet — and the deaths that wrote every rule.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: '“My valve has gone quiet”', Component: Presentation,
      pill: '🔇 06:10 — no opening click',
      lede: 'Listen to the valve, read the story of the anticoagulant, and start the right heparin at the right time.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 124, sys: 96, dia: 62, spo2: 89, rr: 30, rhythm: 'af' }); atLeastClock(min(6, 10)); } },
    { id: 's2', icon: '📏', nav: 'Doppler & Fluoroscopy', title: 'Measure the prosthesis — Doppler, fluoroscopy, TOE', Component: Investigation,
      pill: '🎯 Gradient, DVI, EOA, leaflet angles',
      lede: 'Measure it yourself, find the stuck leaflet — and tell thrombus from pannus, mismatch, high flow and endocarditis.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 96, sys: 104, dia: 64, spo2: 93, rr: 24, rhythm: 'af' }); atLeastClock(min(8, 30)); } },
    { id: 's3', icon: '👥', nav: 'Heart Team', title: 'The heart team: surgery or lysis?', Component: HeartTeam,
      pill: '🧭 A third sternotomy — or a drip?',
      lede: 'Her risk, her thrombus, her mother’s death — and the guidelines that do not quite agree.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 94, sys: 108, dia: 66, spo2: 94, rr: 20, rhythm: 'af' }); atLeastClock(min(15, 0)); } },
    { id: 's4', icon: '🧮', nav: 'Planning', title: 'Planning: the pathway and the regimen', Component: Planning,
      pill: '🗺️ Set the map to her',
      lede: 'Thrombus size, side, surgical risk, contraindications; the dose; when the heparin starts.',
      enter: ({ atLeastClock }) => atLeastClock(min(17, 0)) },
    { id: 's5', icon: '🩸', nav: 'Set-up', title: 'Set-up for lysis', Component: Setup,
      pill: '🧷 Day 2 — needles first, then the drug',
      lede: 'Access, bleeding kit, baseline neurology, and the protocol in order.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 92, sys: 112, dia: 68, spo2: 95, rr: 18, rhythm: 'af' }); atLeastClock(min(24 + 9, 30)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Choose your path: when to stop, when to cut', Component: Strategy,
      pill: '🔀 Rehearse the forks before the pump starts',
      lede: 'Collapse mid-infusion, no response after six doses — and where each choice leads.',
      enter: ({ atLeastClock }) => atLeastClock(min(24 + 9, 45)) },
    { id: 's7', icon: '💉', nav: 'The Lysis', title: 'Slow-infusion low-dose alteplase', Component: Lysis,
      pill: '⏳ 4.2 mL/h — hour by hour',
      lede: 'Set the pump, check her every hour, handle the ooze, decide at the end of the dose.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 92, sys: 112, dia: 68, spo2: 95, rr: 18, rhythm: 'af' }); atLeastClock(min(24 + 10, 0)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit: warfarin, the target, the log', Component: Recovery,
      pill: '🎯 INR 3.0 — and why never a DOAC',
      lede: 'Bed 9: the right anticoagulant, the right number, interactions, teeth and bridging.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 78, sys: 118, dia: 72, spo2: 97, rr: 16, rhythm: 'af' }); atLeastClock(min(48 + 11, 0)); } },
    { id: 's9', icon: '🚨', nav: 'The Crisis', title: 'Day 4: the words stop coming', Component: Crisis,
      pill: '🧠 18:20 — aphasia and a drooping arm',
      lede: 'Stroke on anticoagulation: bleed or clot, thrombectomy, and when to restart.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 94, sys: 182, dia: 98, spo2: 96, rr: 20, rhythm: 'af' }); atLeastClock(min(72 + 18, 20)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'The obstructed-mitral spiral, the hinge, and the haemolysis loop.',
      enter: ({ setVitals }) => setVitals({ hr: 78, sys: 124, dia: 74, spo2: 97, rr: 16, rhythm: 'af' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every INR rule was paid for',
      lede: 'Six patients and six anticoagulation decisions.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'Her plan, the quiz — then your score.' },
  ],
};

export default function Valve09({ onClose }) {
  return <CaseShell def={VALVE_09} onClose={onClose} />;
}
