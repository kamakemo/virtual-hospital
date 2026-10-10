import React from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import {
  TRMurmur, CultureIncubator, DukeBuilder, DUKE_FINDINGS, VegetationTOE, ChestCT, AntibioticPlanner,
  CultureCourse, RAPressure, VegAspiration, LungUltrasound,
} from './sims.jsx';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 07
   Right-sided (tricuspid) infective endocarditis in a 24-year-
   old woman who injects drugs: fever, cough, pleuritic pain and
   cavitating septic pulmonary emboli from a Staphylococcus
   aureus (MSSA) vegetation on the tricuspid valve.

   Blood cultures done right; Duke-ISCID 2023 / ESC 2023
   criteria; TTE vs TOE and measuring a mobile vegetation;
   β-lactam therapy, duration and partial oral step-down (POET)
   and its limits; persistent bacteraemia with a > 20 mm
   vegetation after recurrent emboli → percutaneous aspiration
   (debulking); and, on day 9, a tension pyopneumothorax from a
   ruptured septic infarct. Threaded through all of it:
   addiction medicine, harm reduction and stigma — treating the
   person, not just the valve.

   Clinical content follows the 2023 ESC guidelines for the
   management of endocarditis (with the 2023 Duke-ISCID
   criteria), the POET trial, ATLS 10th edition for tension
   pneumothorax and BTS pleural guidance, simplified for
   teaching. Where evidence is thin (debulking devices, oral
   therapy in people who inject drugs) the text says so.
   ============================================================ */

const min = (h, m) => h * 60 + m;

/* Recommended structural channels, searched for endocarditis (channel
   handles as in ../valveMedia.js). */
const ENDO_SEARCHES = [
  { name: 'CCC Live Cases — endocarditis', url: 'https://www.youtube.com/@CCCLiveCases/search?query=endocarditis', note: 'Endocarditis cases' },
  { name: 'Gulf Intervention Society — endocarditis', url: 'https://www.youtube.com/@gulfinterventionsociety/search?query=endocarditis', note: 'Endocarditis talks and cases' },
  { name: 'Interventional Cardiology — tricuspid', url: 'https://www.youtube.com/@interventionalcardiologyis3814/search?query=tricuspid', note: 'Tricuspid valve cases' },
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
   1 · PRESENTATION — FEVER, COUGH AND HOLES IN THE LUNGS
   ============================================================ */

function Presentation() {
  const { answers, setVitals } = useCase();
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🚑 01:40</span>A friend calls an ambulance for Jade Morrison, 24. Five days of fevers and shaking rigors, a cough, and a stabbing pain under the right ribs every time she breathes in. The crew find her on a mattress, hot, grey, breathing 30 a minute. SpO₂ 88% on air; 15 L by mask brings it to 93%.</p>
        <p className="cs-p"><span className="cs-time">history</span>Injects heroin, and lately cocaine, for three years; her arm veins are “gone”, so for six months she has injected into her right groin. Sometimes shares filters and spoons. Hepatitis C antibody positive last year, never treated. Not on opioid agonist treatment — she was discharged from a methadone programme after missing doses. Her four-year-old son lives with her mother. 52 kg.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🏥 02:15</span>Resus bay. She is shivering, guarded, and the first thing she says is: “Are you going to call the police?”</p>
      </div>

      <BedsideMonitor />

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>📊 Observations · 02:15</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('124 /min, sinus', 'cs-hi')], ['Blood pressure', N('96/58 mmHg', 'cs-hi')], ['SpO₂', N('91% on 15 L', 'cs-hi')],
            ['Resp. rate', N('28 /min', 'cs-hi')], ['Temperature', N('39.6 °C', 'cs-hi')], ['GCS', N('15')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🩺 Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Right groin: an indurated, tender injection site with a small sinus — no pulsatile mass.</li>
            <li className="cs-li">JVP raised 5 cm with a big systolic wave; the earlobes bob with each beat.</li>
            <li className="cs-li">A soft holosystolic murmur at the left lower sternal edge.</li>
            <li className="cs-li">Pleural rub at the right base. Liver edge tender.</li>
            <li className="cs-li">No splinters, Janeway lesions or Osler nodes. Fundi clear. No focal neurology.</li>
          </ul>
        </div>
      </div>

      <div className="cs-h2">👂 Listen — and watch her neck</div>
      <p className="cs-p">Her murmur first. Watch the phonocardiogram as she breathes in, then switch to mitral regurgitation for comparison: same shape, different response to breathing.</p>
      <TRMurmur />

      <ECG12 rate={124} rhythm="sinus" pr={0.15}
        caption="Sinus tachycardia 124/min. PR 150 ms — normal. No AV block. (A lengthening PR in endocarditis means a perivalvular abscess until proven otherwise — more typical of aortic-root disease, but check it daily.)" />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧪 Bloods & 🩻 chest X-ray</div>
        <Table head={['', 'Result']} rows={[
          ['WCC / neutrophils', N('18.4 / 16.1 × 10⁹/L', 'cs-hi')], ['CRP', N('240 mg/L', 'cs-hi')], ['Lactate', N('3.1 mmol/L', 'cs-hi')],
          ['Platelets', N('98 × 10⁹/L', 'cs-hi')], ['Creatinine', N('118 µmol/L', 'cs-hi')], ['Bilirubin / ALT', N('34 µmol/L / 61 U/L', 'cs-hi')],
          ['Urine dip', N('blood 2+, protein 1+', 'cs-hi')], ['Pregnancy test', N('negative')],
          ['Chest X-ray', 'Multiple round opacities in both lower zones, 1–3 cm, peripheral; two have air in the centre. Small right effusion.'],
        ]} />
      </div>

      <Decision id="s1-dx" question="What is the unifying diagnosis?"
        options={[
          { id: 'rie', label: 'Right-sided (tricuspid) infective endocarditis with septic pulmonary emboli', verdict: 'best', points: 10,
            why: 'Injecting drug use + fever + a murmur louder on inspiration + giant cv-waves + multiple peripheral cavitating lung lesions. The lungs are where right-heart vegetations embolise.' },
          { id: 'cap', label: 'Severe community-acquired pneumonia', verdict: 'wrong', points: 0,
            why: 'Pneumonia does not make a dozen round, peripheral, cavitating lesions in both lungs at once — that is a pattern of blood-borne seeding.' },
          { id: 'tb', label: 'Cavitating pulmonary tuberculosis', verdict: 'wrong', points: 2,
            why: 'TB cavitates in the upper zones, over weeks, without rigors and a new murmur. Keep it in mind in PWID, but this is acute and haematogenous.' },
          { id: 'pe', label: 'Bland pulmonary embolism from a femoral DVT', verdict: 'wrong', points: 2,
            why: 'Her groin injecting raises DVT risk, and septic thrombophlebitis can embolise too — but rigors, a regurgitant murmur and cavitation point to an infected source: a vegetation.' },
        ]} />

      <Why title="🦠 Why a valve grows a vegetation"
        chain={[
          { k: 'INJURY', t: 'Particles injected with each hit (talc, fillers, undissolved tablets) and turbulent flow scuff the tricuspid endothelium.' },
          { k: 'NIDUS', t: 'Platelets and fibrin stick to the bare collagen: a sterile micro-clot.' },
          { k: 'SEED', t: 'Skin S. aureus enters the blood with the needle and grips the fibrin with its adhesins (clumping factor, fibronectin-binding proteins).' },
          { k: 'FORTRESS', t: 'More fibrin layers over the bacteria. No blood vessels, few white cells get in — bacteria multiply to 10⁹–10¹⁰ per gram.' },
          { k: 'SHOWER', t: 'Every beat flicks pieces into the pulmonary artery: fever, rigors, holes in the lungs.' },
        ]}>
        A vegetation is not a lump of pus. It is a clot that bacteria have moved into — avascular, so antibiotics must diffuse into it from the blood. That is why the doses are high and the courses are long.
      </Why>
      <Why title="🫁 Why the right heart, and why the lungs"
        chain={[
          { k: 'THE ROUTE', t: 'Everything injected into a vein reaches the tricuspid valve first.' },
          { k: 'THE FILTER', t: 'Right-heart vegetations embolise into the pulmonary arteries — the lung is the filter.' },
          { k: 'SEPTIC INFARCTS', t: 'Each infected fragment blocks a small artery: a wedge of dead, infected lung at the periphery.' },
          { k: 'CAVITATION', t: 'Neutrophils liquefy the infarct; it drains into a bronchus — an air-filled cavity.' },
          { k: 'PLEURA', t: 'Peripheral infarcts touch the pleura: pleuritic pain, effusion, empyema — and, if one ruptures, pneumothorax.' },
        ]} />

      <Contrast title="right-sided vs left-sided endocarditis"
        is={{ h: '🫁 Right-sided (hers)', points: ['Tricuspid (rarely pulmonary) valve; PWID, lines, pacing leads.', 'Lungs: cough, pleuritic pain, cavitating septic emboli.', 'Few peripheral stigmata — the emboli stop in the lungs.', 'Lower mortality; most do well with antibiotics alone.'] }}
        isnt={{ h: '🧠 Left-sided', points: ['Mitral and aortic valves.', 'Emboli to brain, spleen, kidneys, limbs, coronaries.', 'Janeway lesions, splinters, Roth spots; heart failure from regurgitation.', 'Higher mortality; surgery far more often.'] }} />

      <MultiSelect id="s1-now" question="The first hour. Which of these do you do?"
        items={[
          { id: 'cult', label: 'Three sets of blood cultures from separate venepunctures BEFORE antibiotics — quickly, because she is septic', correct: true, why: 'In sepsis, draw them in minutes (not 30-minute intervals) — but before the first dose. One dose of flucloxacillin can sterilise the next sets for days.' },
          { id: 'abx', label: 'Empirical IV antibiotics within the hour, covering S. aureus', correct: true, why: 'Septic, hypotensive, hypoxic. Do not wait for the echo.' },
          { id: 'fluid', label: 'Fluid in 250–500 mL boluses with reassessment (JVP, lungs, lactate)', correct: true, why: 'She is vasodilated and dry from days of fever — but her right heart is volume-loaded by TR. Give, then look again.' },
          { id: 'o2', label: 'Oxygen to SpO₂ 94–98%', correct: true, why: 'Septic emboli are shunting blood through dead lung.' },
          { id: 'groin', label: 'Ultrasound the groin: abscess, septic thrombophlebitis, femoral pseudoaneurysm', correct: true, why: 'A source that needs draining — and a pseudoaneurysm that must not be incised.' },
          { id: 'ost', label: 'Assess for opioid withdrawal and treat it now', correct: true, why: 'Untreated withdrawal is the commonest reason people with endocarditis leave hospital. Treating it is treating the endocarditis.' },
          { id: 'wait', label: 'Hold antibiotics until the echo has been done, to “keep the cultures clean”', correct: false, why: 'Cultures first, then antibiotics — the echo can wait until morning. Sepsis cannot.' },
          { id: 'one', label: 'One set of cultures is enough when the patient is this unwell', correct: false, why: 'One set cannot tell a contaminant from a bacteraemia, and the Duke criteria need ≥ 2 separate sets.' },
        ]} />

      <Decision id="s1-empiric" question="Empirical antibiotics, before the organism is known?"
        onAnswer={() => setVitals({ hr: 112, sys: 104, dia: 62, spo2: 94 })}
        options={[
          { id: 'flucvanc', label: 'High-dose flucloxacillin (2 g IV 4-hourly) plus vancomycin, until the culture tells you whether it is MSSA or MRSA', verdict: 'best', points: 10,
            why: 'In PWID, S. aureus causes most right-sided IE. Flucloxacillin kills MSSA fastest; vancomycin covers MRSA where it is common or she has carried it before. ESC 2023 tailors empirical choice to local MRSA rates — narrow as soon as the organism is known.' },
          { id: 'vanc', label: 'Vancomycin alone', verdict: 'ok', points: 4,
            why: 'Covers both — but if it turns out to be MSSA, every day of vancomycin alone is a day of slower killing. If you start it, add the β-lactam.' },
          { id: 'coamox', label: 'Co-amoxiclav and clarithromycin for pneumonia', verdict: 'wrong', points: 0, why: 'Treats the lungs she seems to have, not the valve she has. Underdosed for staphylococcal endocarditis.' },
          { id: 'gent', label: 'Flucloxacillin plus gentamicin for synergy', verdict: 'wrong', points: 2, why: 'Gentamicin adds kidney injury and no survival benefit in staphylococcal native-valve IE; it has gone from the guidelines.' },
        ]} />
      {answers['s1-empiric'] && <Note kind="pearl" title="03:30">Cultures × 3 drawn (02:30, 02:45, 03:05 — three separate venepunctures, 10 mL per bottle). Flucloxacillin and vancomycin running. 1 L of balanced crystalloid in two boluses; lactate 2.2. Her withdrawal score is 14 — sweating, yawning, gooseflesh, aching.</Note>}

      <Decision id="s1-ows" question="She is in moderate opioid withdrawal and says she will leave “to sort herself out”. You…"
        options={[
          { id: 'oat', label: 'Acknowledge it, treat it now — start opioid agonist treatment (methadone or buprenorphine) with the addiction team — and give proper analgesia for her pleuritic pain', verdict: 'best', points: 10,
            why: 'Starting OAT in hospital halves self-discharge and improves completion of antibiotics. Pain in an opioid-tolerant person needs MORE opioid, not less. Buprenorphine can be started once withdrawal is established; methadone is titrated cautiously.' },
          { id: 'para', label: 'Paracetamol only — no opioids for someone who uses heroin', verdict: 'wrong', points: 0, why: 'Untreated pain and withdrawal are why people walk out with a line in — and come back dying.' },
          { id: 'sec', label: 'Call security to stop her leaving', verdict: 'wrong', points: 0, why: 'She has capacity. Coercion breaks trust; treating the withdrawal keeps her.' },
        ]} />

      <Contrast title="septic pulmonary emboli vs bland pulmonary embolism"
        is={{ h: '🦠 Septic emboli', points: ['Many, peripheral, different sizes (repeated showers).', 'Cavitate within days; feeding-vessel sign.', 'Fever, rigors, a source (valve, line, thrombophlebitis).', 'Treated with antibiotics and source control — not anticoagulation alone.'] }}
        isnt={{ h: '🩸 Bland PE', points: ['Clot from the legs; filling defects in the pulmonary arteries.', 'Wedge infarcts sometimes, cavitation rare.', 'Low-grade fever at most.', 'Treated with anticoagulation.'] }} />

      <Video id="SCwm5k8ULGk" title="Infective Endocarditis, Animation" channel="Alila Medical Media" />
    </>
  );
}

/* ============================================================
   2 · INVESTIGATION — CULTURES, DUKE, ECHO, TOE
   ============================================================ */

function Investigation() {
  const { answers, answer } = useCase();
  const duke = answers['s2-duke'];
  const veg = answers['s2-veg'];
  return (
    <>
      <div className="cs-h2" style={{ marginTop: 0 }}>🧫 The cultures</div>
      <p className="cs-p">Her three sets went into the incubator at 03:00. Scroll through the next two days and watch them flag.</p>
      <CultureIncubator onDone={() => answer('s2-incub', true)} />

      <Sequence id="s2-bc" question="Blood cultures done right. Put the steps in order."
        steps={[
          { label: 'Hand hygiene, gloves; choose a fresh peripheral venepuncture site — not an existing cannula or her injecting site', why: 'Lines and injection sites are colonised: contaminants and false positives.' },
          { label: 'Clean the skin with 2% chlorhexidine in 70% alcohol and let it dry (≥ 30 s)', why: 'The alcohol must evaporate to kill. Wet skin = contaminated bottles.' },
          { label: 'Flip the bottle caps and disinfect the rubber tops', why: 'The tops are clean, not sterile.' },
          { label: 'Draw and inoculate ~10 mL into each bottle (aerobic first with a butterfly set)', why: 'Volume is the biggest single factor in yield. The aerobic bottle takes the air in the tubing.' },
          { label: 'Label with site and exact time; repeat from separate venepunctures for sets 2 and 3', why: 'Separate sites and times prove a CONTINUOUS bacteraemia — the hallmark of an endovascular infection.' },
        ]} />

      <Contrast title="a true bacteraemia vs a contaminant"
        is={{ h: '✅ True (hers)', points: ['The same organism in several sets, from separate venepunctures.', 'Short time to positivity (here 11–15 h) — a heavy load.', 'A “typical” organism: S. aureus is never dismissed as a contaminant.'] }}
        isnt={{ h: '❌ Contaminant', points: ['One bottle of one set.', 'Long time to positivity (> 24–48 h).', 'Skin flora such as coagulase-negative staphylococci, diphtheroids, Bacillus.'] }} />

      <div className="cs-h2">🖥️ CT chest · day 1</div>
      <ChestCT />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🫀 Transthoracic echo · day 2, 11:00</div>
        <Table head={['', 'Finding']} rows={[
          ['Tricuspid valve', '21 mm mobile, echo-dense mass on the atrial side of the anterior leaflet, prolapsing into the RA in systole'],
          ['TR', N('severe — wide vena contracta, hepatic-vein systolic flow reversal', 'cs-hi')],
          ['RV', 'Dilated (basal 44 mm), TAPSE 24 mm — hyperdynamic, volume-loaded'],
          ['Left heart', 'Mitral and aortic valves look clean on TTE; LVEF 65%'],
          ['PASP', N('~30 mmHg — normal (torrential TR can under-read it)')],
        ]} />
      </div>

      <div className="cs-h2">🧩 Classify her — Duke-ISCID 2023 (as adopted by ESC 2023)</div>
      <DukeBuilder done={duke} onResult={r => answer('s2-duke', r)} />
      <ScoreOnce id="s2-duke" pts={duke == null ? null : duke.correct} max={DUKE_FINDINGS.length} />

      <Why title="🧬 Why endocarditis inflames the kidneys"
        chain={[
          { k: 'ANTIGEN', t: 'A vegetation releases bacterial antigen into the blood all day, every day.' },
          { k: 'ANTIBODY', t: 'Weeks of exposure: the immune system makes antibody, and the two form complexes.' },
          { k: 'DEPOSITS', t: 'Complexes lodge in glomeruli (and skin, retina: Osler nodes, Roth spots).' },
          { k: 'COMPLEMENT', t: 'Complement is consumed (low C3) and the glomeruli inflame: haematuria and proteinuria.' },
          { k: 'THE CURE', t: 'Kill the source and it settles — immunosuppression is rarely needed.' },
        ]} />

      <Decision id="s2-toe" question="The TTE is unequivocal. Does she still need a TOE?"
        options={[
          { id: 'yes', label: 'Yes — to measure the vegetation accurately, look for abscess and LEFT-sided involvement (S. aureus), and check the septum for a PFO before any intervention', verdict: 'best', points: 10,
            why: 'ESC 2023 allows TTE alone only for isolated right-sided native-valve IE with a good-quality, unequivocal TTE. Hers is S. aureus with a large vegetation that may need a procedure: a TOE changes management.' },
          { id: 'no', label: 'No — the guideline exempts isolated right-sided IE with a clear TTE', verdict: 'ok', points: 5,
            why: 'True as a rule — but the rule assumes nothing else will change. Missing a small mitral vegetation is how the short course becomes a stroke (see M&M).' },
          { id: 'ct', label: 'Cardiac CT instead', verdict: 'wrong', points: 2, why: 'Good for abscess and pseudoaneurysm, poor for small mobile vegetations and leaflet perforation.' },
        ]} />
      <Contrast title="TTE vs TOE in endocarditis"
        is={{ h: '📡 TOE', points: ['Probe behind the heart: high frequency, no ribs, no lung in the way.', 'Sensitivity for vegetations > 90%; sees abscesses, perforations, prosthetic valves.', 'Measures length and mobility accurately.', 'Needs sedation and a safe oesophagus.'] }}
        isnt={{ h: '📺 TTE', points: ['First test, at the bedside, repeatable.', 'Misses small vegetations (sensitivity ~70% native, worse prosthetic).', 'Right-heart vegetations are often well seen — the left side less so.', 'A normal TTE does NOT exclude IE when suspicion is high.'] }} />

      <div className="cs-h2">📏 TOE · day 3 — measure it yourself</div>
      <p className="cs-p">The vegetation flops between the RA and the RV. Freeze the loop, scroll the frames to where it is longest, run the caliper from its base to its tip, and measure.</p>
      <VegetationTOE done={veg} onMeasure={r => answer('s2-veg', r)} />
      {veg && (
        <div className={'cs-fb ' + (veg.good ? 'best' : 'ok')}>
          You measured {veg.len.toFixed(1)} mm{veg.frozen ? ` on frame ${Math.round(veg.frame * 100)}` : ' on a moving loop'}. {veg.good
            ? 'The longest frame, base to tip: 24 mm. Over 20 mm — remember this number when the cultures stay positive.'
            : !veg.frozen ? 'Measure on a frozen frame — a moving target is guesswork.'
            : veg.apparent < 22.5 ? `On that frame the vegetation is swinging out of plane and looks only ~${veg.apparent.toFixed(0)} mm. Foreshortening under-calls size: find the longest frame.`
            : 'Right frame, but run the caliper all the way from the base to the tip.'}
        </div>
      )}
      <ScoreOnce id="s2-veg" pts={veg == null ? null : veg.good ? 12 : 4} max={12} />
      {veg && <Note kind="pearl" title="The rest of the TOE">Vegetation 24 × 9 mm, highly mobile, on the anterior tricuspid leaflet. Severe TR. No abscess. <b>Mitral and aortic valves clean.</b> Agitated-saline study: no interatrial shunt at rest or with release of Valsalva.</Note>}

      <Contrast title="a vegetation vs the things that look like one"
        is={{ h: '🦠 Vegetation', points: ['Irregular, oscillating mass with motion independent of the valve.', 'On the UPSTREAM (low-pressure) side: atrial side of the AV valves.', 'With a story: fever, positive cultures, new regurgitation.'] }}
        isnt={{ h: '👻 Mimics', points: ['Eustachian valve or Chiari network: normal RA remnants, thin and filamentous, at the IVC.', 'Lambl’s excrescences: fine strands on the aortic valve in older people.', 'Libman–Sacks (lupus) or marantic vegetations: sterile, broad-based, little independent motion.', 'Thrombus on a line or pacing lead: may be infected — ask the cultures.'] }} />

      <Video id="nF13Y58p5_8" title="Echocardiogram in tricuspid valve endocarditis — vegetation, clearance and a flail septal leaflet" />
    </>
  );
}

/* ============================================================
   3 · THE ENDOCARDITIS TEAM — DAY 6
   ============================================================ */

function Team() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">📅 Day 6</span>MSSA confirmed on day 2 — vancomycin stopped, flucloxacillin 2 g 4-hourly continued. On methadone 40 mg, settled, eating. But: fevers to 39 °C every evening; blood cultures from days 3 and 5 still grow S. aureus; a repeat CT shows six NEW cavitating nodules and a growing right effusion; she needs 4 L of oxygen. TOE: vegetation still 24 mm, TR severe, RV dilating; ankles swelling despite furosemide.</p>
      </div>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>👥 Endocarditis team · day 6, 10:00</div>
        <Table head={['', 'Finding']} rows={[
          ['Bacteraemia', N('positive on day 5 — five days of the right drug at the right dose', 'cs-hi')],
          ['Vegetation', N('24 mm, mobile, after recurrent septic emboli', 'cs-hi')],
          ['Other foci', 'Groin: no collection, no pseudoaneurysm. Spine MRI and abdominal US: no abscess'],
          ['RV / TR', 'Severe TR, RV dilating, oedema responding partly to diuretics'],
          ['Surgical view', 'Tricuspid repair or vegetectomy is possible, but she is septic with cavitating lungs, a pleural collection and platelets of 82; a prosthetic tricuspid valve in someone still at risk of injecting reinfects in a third'],
          ['Her goal', '“I don’t want to be cut open. I want to be well enough to see my son.”'],
        ]} />
      </div>

      <MultiSelect id="s3-ind" question="Which of her findings are ESC 2023 reasons to intervene on a right-sided vegetation?"
        items={[
          { id: 'size', label: 'A residual tricuspid vegetation > 20 mm after recurrent septic pulmonary emboli', correct: true, why: 'Class IIa in ESC 2023. Hers is 24 mm and still showering.' },
          { id: 'bact', label: 'Bacteraemia persisting despite appropriate antibiotics (S. aureus, ≥ 7 days is the guideline threshold; she is at 5 and counting)', correct: true, why: 'Persistent S. aureus bacteraemia means a source the antibiotics cannot reach. Day 5 is a warning; day 7 an indication.' },
          { id: 'rv', label: 'RV failure from severe TR that responds poorly to diuretics', correct: true, why: 'An indication when diuretics fail; hers is heading that way.' },
          { id: 'left', label: 'Involvement of left-heart valves', correct: true, why: 'Would turn this into left-sided IE with its own indications — her TOE shows clean left valves, so this one is NOT met, but it belongs on the list.' },
          { id: 'drug', label: 'Injection drug use', correct: false, why: 'Not an indication — and never a reason to refuse surgery. Same indications, same standard of care.' },
          { id: 'crp', label: 'A CRP that has not normalised', correct: false, why: 'CRP falls slowly in IE. Trend matters; a number is not an indication.' },
        ]} />

      <Why title="🏰 Why the bacteraemia does not clear"
        chain={[
          { k: 'BIOFILM', t: 'Deep in the vegetation, S. aureus sits in a fibrin–polysaccharide matrix, dividing slowly.' },
          { k: 'TOLERANCE', t: 'β-lactams kill dividing bacteria. Dormant ones survive even at high concentration.' },
          { k: 'POOR ACCESS', t: 'No blood supply: the drug only diffuses in from the surface.' },
          { k: 'SHEDDING', t: 'The surface keeps sloughing live bacteria into the blood — positive cultures, new emboli.' },
          { k: 'SOURCE CONTROL', t: 'Reduce the mass and you reduce the reservoir. That is what surgery — or aspiration — buys.' },
        ]} />

      <Decision id="s3-plan" question="What does the team recommend?"
        options={[
          { id: 'asp', label: 'Percutaneous aspiration (debulking) of the vegetation, under TOE, with cardiac surgery as backup — and continue full antibiotics', verdict: 'best', points: 10,
            why: 'She has an indication for source control and a high surgical risk, and she declines sternotomy. ESC 2023 says aspiration may be considered (IIb) in high-risk patients: it lowers the bacterial load and embolic burden and spares the valve. Evidence is from registries and case series — say so.' },
          { id: 'surg', label: 'Tricuspid valve surgery this week — repair if possible', verdict: 'ok', points: 6,
            why: 'The established source-control option and the right one if aspiration fails, the TR destroys the RV, or the vegetation is fixed. Repair beats a prosthesis in PWID. But she declines, and her risk is high now.' },
          { id: 'wait', label: 'Continue antibiotics and wait two more weeks', verdict: 'wrong', points: 0,
            why: '“Give the antibiotics more time” is how people with persistent S. aureus bacteraemia die (M&M).' },
          { id: 'none', label: 'Decline intervention because she injects drugs and will reinfect', verdict: 'wrong', points: 0,
            why: 'Not a medical reason. Reinfection risk is reduced by treating the addiction, not by withholding care.' },
        ]} />

      <Contrast title="treating the person vs treating the valve"
        is={{ h: '🤝 Person-first, harm-reduction care', points: ['“A person who injects drugs”, not “an IVDU” or “a user”.', 'Opioid agonist treatment from day 1; adequate pain relief.', 'Addiction medicine in the endocarditis team.', 'Shared, realistic goals; options that fit her life.'] }}
        isnt={{ h: '🚫 Punitive care', points: ['“Non-compliant”, “drug-seeking”, “she did this to herself”.', 'Withdrawal untreated, room searches, threats of discharge.', 'No PICC, no oral option, no follow-up.', 'Self-discharge, relapse, readmission — or a coroner’s report.'] }} />

      <Decision id="s3-consent" question="Consent for aspiration. She asks, “Will this fix my heart?”"
        options={[
          { id: 'honest', label: '“It should remove most of the infected lump, so the antibiotics can finish the job and fewer pieces fly to your lungs. It doesn’t repair the leaky valve. Risks: bleeding, a piece breaking off, damage to the valve — and we may still need surgery.”', verdict: 'best', points: 10,
            why: 'Honest about the goal (debulking, not cure), the leak that remains, the specific risks and the backup.' },
          { id: 'yes', label: '“Yes — it’s a quick suction, you’ll be cured.”', verdict: 'wrong', points: 0, why: 'False reassurance. The valve stays leaky; antibiotics still take weeks.' },
          { id: 'cap', label: '“We need your mother’s consent as well.”', verdict: 'wrong', points: 0, why: 'She is an adult with capacity. Drug use does not remove it.' },
        ]} />
    </>
  );
}

/* ============================================================
   4 · PLANNING — ANTIBIOTICS, ACCESS, THE RIGHT HEART
   ============================================================ */

function Planning() {
  const { answers, answer } = useCase();
  const abx = answers['s4-abx'];
  return (
    <>
      <p className="cs-p">Two plans to make today: the antibiotic course that will follow her out of hospital, and the route to her tricuspid valve.</p>
      <AntibioticPlanner done={abx} onResult={r => answer('s4-abx', r)} />
      <ScoreOnce id="s4-abx" pts={abx == null ? null : abx.pts} max={16} />

      <Why title="⚔️ Why a β-lactam beats vancomycin for MSSA"
        chain={[
          { k: 'TARGET', t: 'Both block cell-wall building — but flucloxacillin binds the enzyme (PBP) directly and fast.' },
          { k: 'SIZE', t: 'Vancomycin is a huge molecule: slow to penetrate tissue — and a vegetation.' },
          { k: 'KILLING', t: 'Vancomycin kills MSSA more slowly; the bacteraemia lasts longer.' },
          { k: 'OUTCOME', t: 'Longer bacteraemia = more emboli, more relapse, more deaths. Switch to a β-lactam the moment MSSA is confirmed.' },
        ]} />

      <Contrast title="MSSA vs MRSA endocarditis"
        is={{ h: '🟢 MSSA (hers)', points: ['Flucloxacillin/cloxacillin 12 g/day IV in 4–6 doses, or cefazolin 6 g/day in 3 doses.', 'No routine gentamicin; no routine rifampicin for native valves.', 'Penicillin “allergy” label? Test it — most are not real; cefazolin is usually safe.'] }}
        isnt={{ h: '🔴 MRSA', points: ['Vancomycin (dose to AUC 400–600 or a trough of 15–20 mg/L) or daptomycin ≥ 10 mg/kg/day.', 'Combinations (e.g. with fosfomycin) considered for persistent bacteraemia.', 'Slower clearance, more complications, more surgery.'] }} />

      <Contrast title="who partial oral step-down (POET) fits — and who it doesn’t"
        is={{ h: '✅ Fits', points: ['≥ 10 days of IV therapy (≥ 7 days after any surgery).', 'Afebrile > 2 days; cultures negative; CRP falling (< 25% of peak); WCC < 15.', 'No abscess on TOE; a susceptible organism; can absorb and take tablets.', 'Two well-absorbed drugs (e.g. linezolid or moxifloxacin with rifampicin; dicloxacillin with fusidic acid).'] }}
        isnt={{ h: '❌ Doesn’t (yet)', points: ['Still bacteraemic or febrile — her today.', 'Undrained abscess, empyema, unresolved metastatic foci.', 'Cannot reliably take tablets or absorb them.', 'POET enrolled few PWID: oral therapy here is extrapolation — reasonable, shared, and monitored.'] }} />

      <Decision id="s4-rif" question="If she later steps down to linezolid plus rifampicin, what must happen to her methadone?"
        options={[
          { id: 'up', label: 'Expect withdrawal within days and increase the methadone dose, with the addiction team watching — then reduce it again when rifampicin stops', verdict: 'best', points: 10,
            why: 'Rifampicin induces CYP3A4 and 2B6 and can more than halve methadone levels. Withdrawal follows within days; people leave, use on top, and overdose when the rifampicin stops and the methadone level jumps back.' },
          { id: 'same', label: 'Nothing — they do not interact', verdict: 'wrong', points: 0, why: 'One of the most dangerous interactions in this patient group (M&M).' },
          { id: 'stop', label: 'Stop the methadone while she takes rifampicin', verdict: 'wrong', points: 0, why: 'Removing OAT drives her back to street drugs.' },
        ]} />

      <div className="cs-h2">🧭 The route to the valve</div>
      <Decision id="s4-access" question="Aspiration cannula (22F-class, funnel tip) and reinfusion cannula. Where do they go?"
        options={[
          { id: 'ij', label: 'Aspiration cannula via the right internal jugular vein (down the SVC, coaxial to the tricuspid valve); reinfusion via a femoral vein — avoiding her infected right groin', verdict: 'best', points: 10,
            why: 'From the jugular, the cannula points straight down at the tricuspid valve. The left femoral vein takes the return. Never cannulate through an infected injecting site.' },
          { id: 'rfem', label: 'Both cannulas through the right femoral vein', verdict: 'wrong', points: 0, why: 'Through an infected injecting site, with a possible pseudoaneurysm or septic thrombophlebitis.' },
          { id: 'lfem', label: 'Aspiration via the left femoral vein, reinfusion via the jugular', verdict: 'ok', points: 5, why: 'Possible — but from the IVC the cannula meets the valve at an angle; the jugular route is more coaxial for a tricuspid vegetation.' },
        ]} />

      <div className="cs-h2">📈 Her right atrium</div>
      <p className="cs-p">A pressure line in her RA shows what severe TR does to the atrium. Compare it with normal.</p>
      <RAPressure initial="tr" />
      <Why title="💧 Why the fluid she needed on day 1 now hurts her"
        chain={[
          { k: 'THE LEAK', t: 'Severe TR sends a large part of each RV beat back into the RA.' },
          { k: 'VOLUME', t: 'The RV dilates to keep its forward output; the tricuspid annulus stretches.' },
          { k: 'MORE LEAK', t: 'A bigger annulus pulls the leaflets apart: TR feeds itself.' },
          { k: 'CONGESTION', t: 'RA pressure 17 mmHg backs up into the liver, gut and kidneys — renal venous congestion lowers GFR.' },
          { k: 'THE TURN', t: 'Day 1: septic and dry — give fluid. Day 6: congested — diurese. Same patient, opposite drug.' },
        ]} />
    </>
  );
}

/* ============================================================
   5 · SET-UP — THE HYBRID LAB
   ============================================================ */

function Setup() {
  return (
    <>
      <MultiSelect id="s5-check" question="Before aspiration: what must be in place?"
        items={[
          { id: 'toe', label: 'General anaesthesia with continuous TOE', correct: true, why: 'You are steering a funnel onto a moving lump next to a valve you want to keep.' },
          { id: 'pfo', label: 'A documented TOE bubble study: no PFO or ASD', correct: true, why: 'Any right-to-left shunt lets a dislodged fragment reach the brain. Hers: none.' },
          { id: 'perf', label: 'A perfusionist and a primed veno-venous circuit with an inline filter', correct: true, why: 'The aspirated blood is filtered and returned; the vegetation stays in the filter — and goes to microbiology.' },
          { id: 'hep', label: 'Heparin to an ACT of 250–300 s', correct: true, why: 'Large cannulas and an extracorporeal circuit clot without it.' },
          { id: 'xm', label: 'Cross-matched blood; platelets available (hers are 82)', correct: true, why: 'Large-bore venous access and a circuit: bleeding happens.' },
          { id: 'surg', label: 'Cardiac surgery aware and available', correct: true, why: 'Bailout for leaflet tear, tamponade or a fixed vegetation.' },
          { id: 'stopabx', label: 'Stop the antibiotics the day before so the vegetation culture is positive', correct: false, why: 'Never. Her cultures already grew MSSA; the vegetation goes for culture and PCR anyway.' },
        ]} />

      <Sequence id="s5-seq" question="Put the procedure set-up in order."
        steps={[
          { label: 'Anaesthesia, TOE: re-measure the vegetation, confirm no shunt, map its attachment', why: 'The map you steer by.' },
          { label: 'Ultrasound-guided access: left femoral vein (reinfusion) and right internal jugular vein (aspiration)', why: 'Avoid the infected right groin.' },
          { label: 'Heparin to ACT 250–300 s', why: 'Before the big cannulas go in.' },
          { label: 'Serial dilation and insertion of the large-bore cannulas; connect the circuit and de-air it', why: 'Air in a veno-venous circuit embolises to the lungs — or across any shunt.' },
          { label: 'Advance the funnel into the RA under TOE and fluoroscopy, aim, and aspirate in short bursts', why: 'Then reassess after every pass.' },
        ]} />

      <Why title="🕳️ Why a hole in the septum changes everything"
        chain={[
          { k: 'PRESSURE', t: 'Severe TR raises RA pressure — sometimes above LA pressure.' },
          { k: 'THE DOOR', t: 'A PFO that is closed at rest can swing open with every cough, strain or rise in RA pressure.' },
          { k: 'THE CROSSING', t: 'A fragment shaken loose in the RA follows the blood through the door.' },
          { k: 'THE TARGET', t: 'Left heart → aorta → brain: a septic stroke during a “right-sided” procedure.' },
        ]}>
        That is why the bubble study comes before the funnel — and why some teams choose surgery when a shunt is present.
      </Why>
      <RAPressure initial="tr" />
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
      <Decision id="s6-goal" question="What is the target of aspiration?"
        options={[
          { id: 'debulk', label: 'Debulk: remove most of the mass (aim residual < 10 mm), keep the leaflet and its chords intact, stop', verdict: 'best', points: 10,
            why: 'The aim is to cut the bacterial reservoir and embolic risk. Chasing the last strands at the leaflet base is how leaflets get sucked in and torn.' },
          { id: 'all', label: 'Remove every visible fragment, whatever it takes', verdict: 'wrong', points: 0, why: 'A torn leaflet turns severe TR into torrential TR and a failing RV — the thing you were trying to prevent.' },
          { id: 'one', label: 'One pass and finish, whatever remains', verdict: 'ok', points: 3, why: 'Safe, but likely to leave most of the reservoir behind.' },
        ]} />
      <Decision id="s6-frag" question="A large fragment breaks off and you see it leave the RA. Her SpO₂ drops from 99% to 93%. You…"
        options={[
          { id: 'cont', label: 'Expect it: it has gone to the lungs (no shunt). Support oxygenation, tell the anaesthetist, and approach more carefully — fully engage before suction', verdict: 'best', points: 10,
            why: 'With no PFO, right-sided fragments go to the pulmonary arteries — where her disease already is. Small falls in saturation recover. A half-engaged funnel is what breaks pieces off.' },
          { id: 'abort', label: 'Abort and send her for emergency pulmonary embolectomy', verdict: 'wrong', points: 0, why: 'A septic fragment the size of the ones she has been showering for a week does not need embolectomy.' },
          { id: 'lysis', label: 'Give systemic thrombolysis', verdict: 'wrong', points: 0, why: 'Thrombolysis in endocarditis risks catastrophic bleeding (mycotic aneurysms, septic infarcts) and does nothing to vegetation.' },
        ]} />
      {answers['s6-frag'] && <Note kind="pearl" title="And if she had a PFO?">Then the same fragment could have gone to the brain. Options: surgery (which can close the PFO at the same time), or aspiration only with an explicit heart-team decision and shunt-reducing measures. A bubble study is not a box-tick.</Note>}
      <Contrast title="percutaneous aspiration vs surgery for a tricuspid vegetation"
        is={{ h: '🌀 Aspiration (debulking)', points: ['Through veins, under TOE; no sternotomy, no bypass.', 'Removes mass; does not repair the valve.', 'For high-surgical-risk patients (ESC 2023: may be considered, IIb).', 'Evidence: registries and case series.'] }}
        isnt={{ h: '🔪 Surgery', points: ['Vegetectomy and valve repair (preferred) or replacement.', 'Fixes the leak; removes infected tissue completely.', 'Sternotomy, bypass; prosthetic valves reinfect if injecting continues.', 'The definitive fix for RV failure from torrential TR.'] }} />
      <MultiSelect id="s6-stop" question="Which of these tell you to STOP aspirating?"
        items={[
          { id: 'res', label: 'Residual vegetation < 10 mm', correct: true, why: 'Target reached.' },
          { id: 'leaf', label: 'TOE shows the leaflet being drawn into the funnel', correct: true, why: 'Stop suction, back off — the leaflet comes before the last millimetres.' },
          { id: 'tr', label: 'A new, wider TR jet or a flail segment', correct: true, why: 'You are damaging the valve.' },
          { id: 'eff', label: 'A new pericardial effusion', correct: true, why: 'Perforation until proven otherwise.' },
          { id: 'trace', label: 'A thin residual strand still visible', correct: false, why: 'Expected. Antibiotics do the rest.' },
        ]} />
      <Why title="🧮 Why debulking works even though it is incomplete"
        chain={[
          { k: 'LOAD', t: 'A 24 mm vegetation holds billions of bacteria — most of the body’s infection.' },
          { k: 'REMOVE MOST', t: 'Taking 70–90% of the mass removes most of that load in minutes.' },
          { k: 'DIFFUSION', t: 'A thin residue is close to the blood: antibiotics reach its core.' },
          { k: 'CLEARANCE', t: 'Cultures typically turn negative within days; fevers settle; emboli stop.' },
        ]} />
    </>
  );
}

/* ============================================================
   7 · THE PROCEDURE — ASPIRATION UNDER TOE
   ============================================================ */

function Procedure() {
  const { answers, answer, setVitals } = useCase();
  const r = answers['s7-asp'];
  const grade = !r ? null : (r.residual <= 8 && r.damage === 0 && r.emboli === 0) ? 'best' : (r.residual <= 12 && r.damage === 0) ? 'ok' : 'wrong';
  return (
    <>
      <p className="cs-p">The funnel is in the RA. On TOE, steer it onto the vegetation: <b>advance</b> moves it toward the valve, <b>deflect</b> swings it across. Suction only when the ring turns green. Then stop — and withdraw.</p>
      <VegAspiration done={r} onResult={res => { answer('s7-asp', res); setVitals({ hr: 96, sys: 108, dia: 62, spo2: res.emboli ? 94 : 98 }); }} />
      {r && (
        <div className={'cs-fb ' + grade}>
          Withdrawn after {r.bursts} burst{r.bursts === 1 ? '' : 's'}: residual {r.residual} mm, {r.emboli} fragment{r.emboli === 1 ? '' : 's'} embolised, leaflet {r.damage ? 'injured' : 'intact'}.{' '}
          {grade === 'best' ? 'A clean debulk: the reservoir is gone and the valve is as you found it.'
            : r.damage ? 'The leaflet was sucked into the funnel — the TR will be worse. Engage the vegetation from above; stay off the leaflet.'
            : r.residual > 12 ? 'Most of the vegetation is still there.' : 'Fragments flew from half-engaged passes. Engage fully, then suction.'}
        </div>
      )}
      <ScoreOnce id="s7-asp" pts={r == null ? null : grade === 'best' ? 20 : grade === 'ok' ? 10 : 2} max={20} />
      {r && (
        <>
          <Decision id="s7-filter" question="The filter holds a grey, friable 2 cm mass. What happens to it?"
            options={[
              { id: 'micro', label: 'Send it for culture, Gram stain, 16S/PCR and histology', verdict: 'best', points: 8,
                why: 'Confirms the organism (and any second one — polymicrobial IE is common in PWID), and a positive vegetation culture after a week of therapy may change the length of the course.' },
              { id: 'bin', label: 'Discard it — the blood cultures already gave the answer', verdict: 'wrong', points: 0, why: 'You lose the only tissue you will get.' },
            ]} />
          <Decision id="s7-after" question="TOE after withdrawal: residual strand, TR still severe but no flail, RV unchanged. Next?"
            options={[
              { id: 'abx', label: 'Close, continue full-dose flucloxacillin, repeat blood cultures in 24–48 h, and keep surgery in reserve for RV failure', verdict: 'best', points: 10,
                why: 'Aspiration does not fix the leak. If her RV fails on diuretics, or cultures stay positive, the surgeons are still there.' },
              { id: 'stop', label: 'The source is gone: switch to oral antibiotics tomorrow', verdict: 'wrong', points: 0, why: 'Too early: she still needs ≥ 10 days of IV therapy and proof of clearance before any oral step-down.' },
            ]} />
        </>
      )}
      <Why title="🫀 Why her TR does not improve after the vegetation has gone"
        chain={[
          { k: 'EATEN LEAFLET', t: 'The infection destroyed part of the anterior leaflet’s edge.' },
          { k: 'BIG ANNULUS', t: 'A week of volume overload has stretched the annulus.' },
          { k: 'NO COAPTATION', t: 'The leaflets no longer meet — with or without the vegetation.' },
          { k: 'WATCH THE RV', t: 'Most people tolerate severe TR for years; surgery when the RV fails or symptoms demand it.' },
        ]} />
      <CaseLibrary title="Endocarditis on the recommended channels" channels={ENDO_SEARCHES}>
        Searches of the recommended structural channels for endocarditis and tricuspid cases — look for vegetation imaging, debulking devices and the surgical alternative.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   8 · BACK ON THE UNIT
   ============================================================ */

function Recovery() {
  const { answers, answer } = useCase();
  const cc = answers['s8-cult'];
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🛏️ 15:00</span>Bed 7, Valvular & Structural Heart Unit. Extubated, on 2 L of oxygen, comfortable. Methadone 50 mg given this morning. Temperature 37.8 °C. The jugular site is dry.</p>
      </div>
      <ECG12 rate={92} rhythm="sinus" pr={0.16} caption="Sinus rhythm 92/min. PR 160 ms — unchanged. Check it every day: a lengthening PR or new block means the infection has spread into the conduction tissue." />

      <div className="cs-h2">🩸 Surveillance cultures — plan the whole course</div>
      <p className="cs-p">Looking across her first twelve days: when should cultures have been repeated, and which day is day 1 of her 6 weeks?</p>
      <CultureCourse done={cc} onResult={r => answer('s8-cult', r)} />
      <ScoreOnce id="s8-cult" pts={cc == null ? null : (cc.surveillanceOk ? 6 : 2) + (cc.startOk ? 6 : 0)} max={12} />

      <Decision id="s8-dose" question="Her flucloxacillin dose and how it is given?"
        options={[
          { id: '2g4', label: '2 g IV every 4 hours (12 g/day) — or the same daily dose as a continuous infusion via a PICC once she is stable', verdict: 'best', points: 10,
            why: 'High, frequent dosing keeps levels above the MIC all day. A PICC is reasonable in PWID with OAT, support and clear agreements — a blanket ban is not evidence-based.' },
          { id: '1g6', label: '1 g IV every 6 hours', verdict: 'wrong', points: 0, why: 'A cellulitis dose. Endocarditis needs 12 g/day.' },
          { id: 'oral', label: 'Oral flucloxacillin 1 g four times daily', verdict: 'wrong', points: 0, why: 'Oral flucloxacillin is poorly absorbed; it is not a POET regimen.' },
        ]} />

      <MultiSelect id="s8-mon" question="What do you monitor on the unit, and why?"
        items={[
          { id: 'cul', label: 'Blood cultures every 24–48 h until negative', correct: true, why: 'Proves clearance and starts the clock.' },
          { id: 'lft', label: 'Liver tests weekly (flucloxacillin cholestasis — can appear weeks in, even after stopping)', correct: true, why: 'Worse with age and long courses; she also has hepatitis C.' },
          { id: 'fbc', label: 'Full blood count weekly (β-lactam neutropenia after ~2–3 weeks)', correct: true, why: 'Dose-dependent and reversible — if you look.' },
          { id: 'ue', label: 'Renal function and potassium', correct: true, why: 'Diuretics, congestion, and flucloxacillin’s sodium load and hypokalaemia.' },
          { id: 'neuro', label: 'Daily neurological check and a new-murmur check', correct: true, why: 'Any left-sided spread shows here first.' },
          { id: 'hcv', label: 'HIV, hepatitis B and C (RNA) testing; plan hepatitis C treatment', correct: true, why: 'Curable infections found while she is in hospital, with time to start.' },
          { id: 'crp0', label: 'Keep IV antibiotics until the CRP is normal', correct: false, why: 'CRP may stay mildly raised for weeks. Treat to a duration and the clinical picture, not a number.' },
        ]} />

      <Why title="💊 Why opioid agonist treatment is part of the antibiotic plan"
        chain={[
          { k: 'WITHDRAWAL', t: 'Every 24 h without opioid: sweating, cramps, diarrhoea, restlessness, craving.' },
          { k: 'ESCAPE', t: 'The quickest relief is outside the hospital — so people leave, with a line in or without one.' },
          { k: 'GAP', t: 'Half a course of antibiotics: relapse, resistant organisms, return in extremis.' },
          { k: 'STEADY STATE', t: 'Methadone or buprenorphine at a stable dose removes withdrawal and craving.' },
          { k: 'COMPLETION', t: 'People stay, complete therapy, and leave connected to care.' },
        ]} />

      <Decision id="s8-pain" question="Pleuritic pain 8/10 on methadone 50 mg. Analgesia?"
        options={[
          { id: 'more', label: 'Continue her methadone as her baseline; add regular paracetamol and short-acting opioid on top at higher-than-usual doses, reviewed daily', verdict: 'best', points: 10,
            why: 'Her methadone treats dependence, not new pain. Opioid-tolerant patients need more analgesia; undertreated pain drives self-discharge and street use.' },
          { id: 'none', label: 'No additional opioids — she is on methadone already', verdict: 'wrong', points: 0, why: 'A common, cruel and dangerous assumption.' },
          { id: 'nsaid', label: 'High-dose ibuprofen instead', verdict: 'wrong', points: 2, why: 'With platelets of 82, congested kidneys and diuretics: risky.' },
        ]} />
      <RAPressure initial="post" />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — DAY 9, 03:10
   ============================================================ */

function Crisis() {
  const { answers, answer, setVitals } = useCase();
  const decompressed = answers['s9-needle'];
  const drained = answers['s9-drain'];
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>🚨 03:10</span>
          Day 9. Jade presses her buzzer: a sudden, tearing pain on the right after a coughing fit, and she cannot get her breath. The nurse finds her upright and grey. SpO₂ 82% on 4 L, pressure 82/48, heart rate 138, RR 38. Her neck veins are distended; her trachea seems to sit left of the midline.
        </p>
      </div>
      <BedsideMonitor />
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🩺 At the bedside · 03:12</div>
        <ul className="cs-ul" style={{ marginBottom: 0 }}>
          <li className="cs-li">Right chest: hyper-resonant, no breath sounds, hardly moving.</li>
          <li className="cs-li">Left chest: breath sounds present.</li>
          <li className="cs-li">Heart sounds present; pulsus paradoxus is hard to judge at this rate.</li>
        </ul>
      </div>

      <div className="cs-h2">🔎 Point-of-care lung ultrasound</div>
      <LungUltrasound onSeen={() => answer('s9-lus', true)} />

      <Decision id="s9-dx" question="What has happened?"
        options={[
          { id: 'tpx', label: 'Tension pneumothorax — a subpleural septic infarct has ruptured into the pleura (pyopneumothorax)', verdict: 'best', points: 10,
            why: 'Sudden pleuritic pain after coughing, unilateral silent hyper-resonant chest, absent sliding, barcode sign, raised JVP, hypotension. Peripheral cavitating emboli sit right under the pleura.' },
          { id: 'pe', label: 'A massive septic pulmonary embolus', verdict: 'wrong', points: 2, why: 'Would cause hypoxia and shock — but not a silent, hyper-resonant hemithorax with absent sliding.' },
          { id: 'tamp', label: 'Tamponade from the jugular procedure', verdict: 'wrong', points: 0, why: 'Raised JVP and shock fit — the chest findings do not. Two days later, with a dry access site, unlikely.' },
          { id: 'rv', label: 'Acute RV failure from worsening TR', verdict: 'wrong', points: 0, why: 'Develops over days, with oedema — not in a minute after a cough with a silent lung.' },
        ]} />

      <Contrast title="tension pneumothorax vs massive pulmonary embolism"
        is={{ h: '💨 Tension pneumothorax', points: ['ONE side silent and hyper-resonant; may move less.', 'Absent lung sliding; barcode sign on M-mode.', 'Tracheal deviation is late and unreliable.', 'Needs air out NOW: decompress, then a drain.'] }}
        isnt={{ h: '🩸 Massive PE', points: ['Both lungs sound normal.', 'Lung sliding present; dilated RV on echo.', 'Hypoxia out of proportion to the chest examination.', 'Needs reperfusion (thrombolysis/embolectomy) — not a needle.'] }} />

      <Decision id="s9-now" question="Right now?"
        onAnswer={o => { if (o.id === 'needle') { answer('s9-needle', true); setVitals({ hr: 118, sys: 102, dia: 60, spo2: 91, rr: 28 }); } }}
        options={[
          { id: 'needle', label: 'High-flow oxygen and immediate decompression on the right: needle (or finger thoracostomy) in the 4th/5th intercostal space just anterior to the mid-axillary line', verdict: 'best', points: 10,
            why: 'A clinical diagnosis, treated before imaging. ATLS 10th edition moved the adult site to the 4th/5th space, anterior to the mid-axillary line: the chest wall is thinner there than at the 2nd space in the mid-clavicular line, so the needle reaches the pleura more often.' },
          { id: 'cxr', label: 'Urgent portable chest X-ray to confirm first', verdict: 'wrong', points: 0, why: 'The film can wait; she cannot. People arrest waiting for the X-ray (M&M).' },
          { id: 'fluid', label: 'A 1 L fluid bolus for the hypotension', verdict: 'wrong', points: 0, why: 'Her veins are full; the obstruction is in the chest.' },
          { id: 'nor', label: 'Start noradrenaline and call ICU', verdict: 'wrong', points: 2, why: 'Call ICU — but relieve the tension first. No vasopressor beats a kinked vena cava.' },
        ]} />
      {decompressed && (
        <Note kind="evid" title="03:16">A hiss of air. SpO₂ 91%, pressure 102/60, heart rate 118. The cannula is a temporary vent: it kinks, blocks and dislodges. She needs a chest drain now.</Note>
      )}

      {decompressed && (
        <>
          <Decision id="s9-drain-d" question="The chest drain goes in (5th intercostal space, safe triangle). It bubbles, then drains 400 mL of thick, foul-smelling pus. Next?"
            onAnswer={() => { answer('s9-drain', true); setVitals({ hr: 104, sys: 112, dia: 66, spo2: 95, rr: 22 }); }}
            options={[
              { id: 'emp', label: 'Empyema with a bronchopleural fistula: keep the drain (flush it), send the fluid for culture, and involve thoracic surgeons early if it fails to drain or the leak persists', verdict: 'best', points: 10,
                why: 'Pus in the pleura needs drainage — antibiotics cannot sterilise a closed collection. A persistent air leak from a ruptured cavity may need surgery (VATS) or a longer antibiotic course.' },
              { id: 'clamp', label: 'Clamp the drain to stop the bubbling', verdict: 'wrong', points: 0, why: 'A clamped bubbling drain re-creates the tension pneumothorax.' },
              { id: 'remove', label: 'Remove the drain once the lung is up on X-ray', verdict: 'wrong', points: 0, why: 'Pus and an air leak: the drain stays.' },
            ]} />
          {drained && <div className="cs-fb best">03:50 — lung re-expanded on the film, SpO₂ 95% on 2 L, pressure 112/66. Pleural fluid: pH 6.9, frank pus, Gram-positive cocci in clusters. Her antibiotic clock does not restart for the empyema — but its drainage now decides the length of her course.</div>}
        </>
      )}

      <Why title="💥 Why a septic embolus punctures the lung"
        chain={[
          { k: 'SUBPLEURAL', t: 'Emboli lodge at the periphery, right under the visceral pleura.' },
          { k: 'NECROSIS', t: 'The infarct liquefies; its wall is thin, dead lung.' },
          { k: 'PRESSURE', t: 'A cough spikes airway pressure — the cavity ruptures through the pleura.' },
          { k: 'ONE-WAY VALVE', t: 'Air enters the pleura with each breath and cannot leave: pressure rises.' },
          { k: 'OBSTRUCTED RETURN', t: 'The mediastinum shifts, the cavae kink, venous return falls: shock.' },
        ]} />
      <Why title="🧪 Why the pus needs a tube, not just more antibiotic"
        chain={[
          { k: 'A CLOSED SPACE', t: 'Pleural pus has no blood supply of its own.' },
          { k: 'ACIDIC, CROWDED', t: 'pH < 7.2, full of bacteria and dead neutrophils that inactivate drugs.' },
          { k: 'LOCULATION', t: 'Fibrin walls it off into pockets.' },
          { k: 'DRAINAGE', t: 'Remove the pus and the antibiotics can finish the job.' },
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
      <p className="cs-p">Tap each step. The green scissors mark where treatment cuts the loop.</p>
      <ViciousCycle id="cyc-seed" title="🔁 The seeding loop — the vegetation feeds the bacteraemia"
        nodes={[
          { short: 'Vegetation', t: 'Infected platelet–fibrin vegetation', d: 'Billions of bacteria, many dormant, in an avascular matrix.' },
          { short: 'Shedding', t: 'Continuous shedding into the blood', d: 'Every hour, live bacteria and fragments leave the surface.' },
          { short: 'Emboli', t: 'Septic emboli and metastatic foci', d: 'Lung infarcts, empyema; groin, spine, joints.' },
          { short: 'New sources', t: 'Each focus becomes a source', d: 'Pus that antibiotics cannot sterilise reseeds the blood.' },
          { short: 'Reseeding', t: 'The valve is reseeded', d: 'The vegetation grows: a self-feeding loop.' },
        ]}
        breaks={[
          { at: 0, t: 'Source control: aspiration debulking or surgery for large vegetations with persistent bacteraemia or recurrent emboli.' },
          { at: 1, t: 'High-dose bactericidal β-lactam for MSSA — never vancomycin alone.' },
          { at: 3, t: 'Drain every collection: empyema, abscesses, infected thrombophlebitis; remove infected lines.' },
          { at: 4, t: 'Sterile equipment and OAT so the valve is not seeded again.' },
        ]} />
      <Decision id="cyc-fever" question="Day 5: still febrile on the right drug at the right dose. What is the first explanation to hunt for?"
        options={[
          { id: 'source', label: 'An uncontrolled source: the vegetation itself, an abscess, empyema, an infected line or thrombophlebitis', verdict: 'best', points: 10,
            why: 'Persistent fever in IE is usually uncontrolled infection — look at the vegetation, the pleura, the spine, the groin, the lines. Drug fever and C. difficile come later on the list.' },
          { id: 'resist', label: 'The organism has become resistant to flucloxacillin', verdict: 'wrong', points: 2, why: 'MSSA rarely becomes MRSA on treatment. Re-check sensitivities, but look for the source.' },
          { id: 'switch', label: 'Add a second antibiotic empirically', verdict: 'wrong', points: 0, why: 'More drugs without a target — the problem is drainage, not the drug.' },
        ]} />
      <ViciousCycle id="cyc-rv" title="🔁 The tricuspid spiral — TR begets TR"
        nodes={[
          { short: 'Leaflet loss', t: 'Infection destroys leaflet tissue', d: 'The valve no longer seals.' },
          { short: 'TR', t: 'Severe tricuspid regurgitation', d: 'A volume load on the RV and RA.' },
          { short: 'RV dilates', t: 'RV and annulus dilate', d: 'The leaflets are pulled further apart.' },
          { short: 'Congestion', t: 'High RA pressure', d: 'Liver and kidney congestion, oedema, falling GFR.' },
          { short: 'RV failure', t: 'The RV fails', d: 'Forward output falls; more dilatation, more TR.' },
        ]}
        breaks={[
          { at: 0, t: 'Control the infection early — keep the leaflet you have.' },
          { at: 3, t: 'Diuretics to offload the congested RV (after the early sepsis phase).' },
          { at: 4, t: 'Surgery (repair, rarely replacement) for RV failure that does not respond to diuretics.' },
          { at: 1, t: 'Do not damage the leaflet during debulking — stop before the last strands.' },
        ]} />
      <Decision id="cyc-diur" question="Day 6: oedematous, RA pressure 17, creatinine rising from 90 to 125. The junior suggests a fluid challenge for the creatinine. You…"
        options={[
          { id: 'diur', label: 'Diurese: the kidneys are congested, not dry — renal venous pressure is the problem', verdict: 'best', points: 10,
            why: 'In right-heart congestion, high venous pressure lowers the gradient across the glomerulus. Offloading improves GFR.' },
          { id: 'fluid', label: 'Give 500 mL of fluid', verdict: 'wrong', points: 0, why: 'More volume into a failing, leaking RV: worse congestion, worse kidneys.' },
        ]} />
      <ViciousCycle id="cyc-stigma" title="🔁 The stigma spiral — how people are lost"
        nodes={[
          { short: 'Withdrawal', t: 'Untreated withdrawal and pain', d: 'Hours into admission she is sweating, cramping, craving.' },
          { short: 'Distrust', t: 'Staff suspicion, punitive rules', d: '“Drug-seeking.” Room searches. Threats of discharge.' },
          { short: 'Leaves', t: 'Self-discharge', d: 'Half-treated, perhaps with a line in.' },
          { short: 'Relapse', t: 'Relapse, reinfection, overdose', d: 'Lower tolerance after days without opioids makes overdose likelier.' },
          { short: 'Readmission', t: 'Back sicker — and labelled', d: '“She left last time.” The label grows heavier.' },
        ]}
        breaks={[
          { at: 0, t: 'Opioid agonist treatment from day 1 and real analgesia.' },
          { at: 1, t: 'Person-first language; addiction medicine on the team; clear, kind agreements.' },
          { at: 2, t: 'Offer options that fit her life: PICC with support, partial oral step-down, outpatient follow-up.' },
          { at: 3, t: 'Naloxone, harm-reduction supplies and a warm hand-over before she leaves.' },
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
      <WarStory title="🧠 The silent mitral valve"
        mistake="A two-week right-sided regimen for MSSA tricuspid IE on a TTE alone — nobody looked at the mitral valve with a TOE."
        burn="S. aureus is never “just right-sided” until a TOE has looked at the left heart.">
        <p className="cs-p">A 29-year-old man who injected drugs: a 12 mm tricuspid vegetation on TTE, MSSA, quick defervescence. Short course, home on day 14. On day 19 he collapsed with a dense left hemiplegia. CT: a large right MCA infarct with haemorrhagic transformation. TOE at last: an 8 mm vegetation on the posterior mitral leaflet. He died on day 23.</p>
      </WarStory>
      <Decision id="mm-short" question="Which finding makes the 2-week right-sided MSSA regimen inappropriate?"
        options={[
          { id: 'left', label: 'Any left-sided valve involvement (or vegetation ≥ 20 mm, empyema or metastatic infection, slow response, a prosthetic valve)', verdict: 'best', points: 10,
            why: 'The short regimen is only for uncomplicated, isolated right-sided native-valve MSSA IE that responds quickly.' },
          { id: 'pwid', label: 'Current injection drug use', verdict: 'wrong', points: 0, why: 'The short regimen was designed for exactly this group.' },
          { id: 'hcv', label: 'Hepatitis C', verdict: 'wrong', points: 0, why: 'Not a criterion; severe immunosuppression (CD4 < 200) is.' },
        ]} />

      <WarStory title="⏳ “Give the antibiotics more time”"
        mistake="Persistent S. aureus bacteraemia and a 28 mm tricuspid vegetation with recurrent emboli, managed by changing antibiotics instead of controlling the source."
        burn="If the blood is still positive after a week of the right drug, the problem is the source — not the drug.">
        <p className="cs-p">A 35-year-old woman: cultures positive on days 3, 5, 8 and 10. Vancomycin was swapped for daptomycin, then a third agent was added. Nobody re-referred to the endocarditis team. Day 12: ARDS from showers of emboli, a right empyema, septic shock. She died on day 15 before theatre could be arranged.</p>
      </WarStory>
      <Decision id="mm-source" question="At which point should she have gone back to the endocarditis team for source control?"
        options={[
          { id: 'early', label: 'When cultures were still positive around day 5–7 with a > 20 mm vegetation and new emboli', verdict: 'best', points: 10,
            why: 'ESC 2023: large residual right-sided vegetations after recurrent emboli, and bacteraemia for ≥ 7 days despite adequate therapy, are indications for intervention.' },
          { id: 'shock', label: 'When she developed septic shock', verdict: 'wrong', points: 0, why: 'By then the operation is a rescue with a much higher mortality.' },
          { id: 'never', label: 'Never — right-sided IE is a medical disease', verdict: 'wrong', points: 0, why: 'Most of it is. Not this.' },
        ]} />

      <WarStory title="🚪 Discharged without a plan"
        mistake="Untreated opioid withdrawal, a ward rule of “no PICC for drug users”, no oral alternative, and no follow-up booked when he self-discharged on day 6."
        burn="When someone may leave, the question is not “how do we stop them” but “what can they take with them”.">
        <p className="cs-p">A 31-year-old man with MSSA tricuspid IE was not started on OAT (“we don’t prescribe for addicts here”). On day 6 he left. No oral antibiotics, no naloxone, no appointment. Three weeks later the ambulance brought him back in cardiac arrest: relapsed endocarditis, torrential TR, a right empyema. He did not survive.</p>
      </WarStory>
      <Decision id="mm-ama" question="He insists on leaving on day 6, with capacity. The least-bad plan?"
        options={[
          { id: 'oral', label: 'Respect the decision; give a best-available oral regimen, OAT continuity, naloxone, harm-reduction supplies, and a booked follow-up — and an open door to come back', verdict: 'best', points: 10,
            why: 'Partial treatment beats none. Observational data support oral regimens when IV is not possible; the alternative is no treatment at all.' },
          { id: 'nothing', label: 'Discharge against advice with nothing — it is his choice', verdict: 'wrong', points: 0, why: 'A form signed, a life lost. Leaving against advice does not end the duty of care.' },
          { id: 'hold', label: 'Detain him under mental health law', verdict: 'wrong', points: 0, why: 'Addiction is not, by itself, a lack of capacity to refuse treatment.' },
        ]} />

      <WarStory title="💊 Rifampicin and the methadone"
        mistake="Rifampicin added at oral step-down without telling the addiction team or adjusting methadone."
        burn="Rifampicin can halve methadone levels within days. Adjust, warn, watch — and reverse when it stops.">
        <p className="cs-p">A 27-year-old woman, well enough for partial oral therapy: linezolid and rifampicin, methadone 60 mg unchanged. By day 4 she was sweating, cramping and craving; staff thought she was “using on the ward”. She left, used heroin on top of a methadone dose that was no longer holding, and was found dead two days later.</p>
      </WarStory>

      <WarStory title="🩻 The X-ray before the needle"
        mistake="A clinically obvious tension pneumothorax in a patient with cavitating septic emboli was sent for a portable chest X-ray before decompression."
        burn="Tension pneumothorax is a clinical diagnosis. Decompress first, image later.">
        <p className="cs-p">A 26-year-old man, day 8 of tricuspid IE, became acutely breathless after coughing: a silent right chest, SpO₂ 78%, pressure 70 systolic. While the radiographer was called he went into PEA arrest. Decompression during CPR gave ROSC within a minute — after nine minutes of low flow. He survived, with a hypoxic brain injury.</p>
      </WarStory>
      <Decision id="mm-ptx" question="In an adult, where does ATLS (10th edition) recommend needle decompression?"
        options={[
          { id: '45', label: '4th/5th intercostal space, just anterior to the mid-axillary line', verdict: 'best', points: 10,
            why: 'The chest wall is thinner there; at the 2nd space mid-clavicular line, standard needles fail to reach the pleura in a substantial share of adults. (The 2nd space mid-clavicular line remains the site for children.)' },
          { id: '2mcl', label: '2nd intercostal space, mid-clavicular line, in every adult', verdict: 'ok', points: 4, why: 'The traditional site, still used — but more needles fail there in adults, especially muscular or obese ones.' },
          { id: 'post', label: '7th intercostal space posteriorly', verdict: 'wrong', points: 0, why: 'Risk to the diaphragm, liver and spleen.' },
        ]} />

      <WarStory title="🧴 Vancomycin for MSSA"
        mistake="Empirical vancomycin continued for ten days after the laboratory reported MSSA, “because it covers everything”."
        burn="MSSA confirmed = switch to flucloxacillin or cefazolin the same day.">
        <p className="cs-p">A 40-year-old woman with tricuspid MSSA IE stayed bacteraemic for nine days on vancomycin. Septic emboli, then a splenic abscess through a PFO nobody had looked for. Switched to flucloxacillin on day 11; died of multi-organ failure on day 18.</p>
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🏁 Day 30</span>Cultures negative since day 8. The empyema drained; the drain came out on day 16. On day 18 — afebrile, CRP 22 from a peak of 260, no abscess on TOE — she switched to partial oral therapy with her methadone adjusted. Her TR is still severe; her RV is stable. She is going home to her mother’s, and her son.</p>
      </div>
      <MultiSelect id="s10-home" question="Her discharge plan?"
        items={[
          { id: 'oat', label: 'Methadone continued, with a named prescriber and pharmacy, and the dose re-adjusted when rifampicin stops', correct: true, why: 'The interaction reverses within one to two weeks of stopping rifampicin: overdose risk.' },
          { id: 'nalox', label: 'Take-home naloxone and training — for her and her mother', correct: true, why: 'Tolerance falls after weeks of supervised dosing.' },
          { id: 'hr', label: 'Harm reduction: sterile needles and equipment, no sharing, skin cleaning, no licking needles, avoid groin and neck sites, never use alone', correct: true, why: 'Each one cuts the route back to the valve.' },
          { id: 'hcv', label: 'Hepatitis C treatment started; hepatitis B vaccination', correct: true, why: 'Cure is 8–12 weeks of tablets.' },
          { id: 'fu', label: 'Endocarditis clinic and echo at the end of therapy; blood tests weekly while on antibiotics', correct: true, why: 'Relapse usually declares within weeks; TR and RV need follow-up.' },
          { id: 'proph', label: 'Antibiotic prophylaxis before invasive dental procedures, and a dental review', correct: true, why: 'Previous IE puts her in the highest-risk group.' },
          { id: 'symptoms', label: 'Teach her the warning signs: fever, rigors, breathlessness — come straight back', correct: true, why: 'Early return saves valves.' },
          { id: 'noopioid', label: 'No opioid prescriptions of any kind after discharge', correct: false, why: 'Stopping OAT is the single most dangerous thing you could do.' },
        ]} />

      <div className="cs-h2">📝 Case quiz</div>
      <Quiz id="s10-quiz" items={[
        { q: 'A murmur at the left lower sternal edge that gets louder on inspiration is…', options: ['Mitral regurgitation', 'Tricuspid regurgitation (Carvallo’s sign)', 'Aortic stenosis', 'HOCM'], answer: 1, why: 'Inspiration increases venous return to the right heart.' },
        { q: 'Multiple peripheral cavitating lung nodules with a feeding-vessel sign in a febrile person who injects drugs suggest…', options: ['Lung cancer', 'Septic pulmonary emboli from tricuspid IE', 'Sarcoidosis', 'Bland PE'], answer: 1, why: 'Right-heart vegetations embolise to the lungs.' },
        { q: 'Duke-ISCID 2023: S. aureus in 3/3 sets plus a vegetation on echo is…', options: ['Possible IE', 'Definite IE', 'Rejected', 'Needs 5 minor criteria'], answer: 1, why: 'Two major criteria.' },
        { q: 'Blood cultures before antibiotics in a septic patient should be…', options: ['One set, then antibiotics', 'Three sets, 30 min apart, delaying antibiotics 1 h', 'Two to three sets from separate venepunctures, drawn quickly, before the first dose', 'Taken from the existing cannula'], answer: 2, why: 'Fast, separate, before antibiotics.' },
        { q: 'MSSA endocarditis: the first-line antibiotic is…', options: ['Vancomycin', 'Flucloxacillin or cefazolin', 'Ceftriaxone', 'Gentamicin alone'], answer: 1, why: 'β-lactams kill MSSA faster than vancomycin.' },
        { q: 'For native-valve S. aureus IE, gentamicin is…', options: ['Recommended for 2 weeks', 'Not recommended — nephrotoxic without benefit', 'Recommended for MRSA only', 'Essential for synergy'], answer: 1, why: 'Dropped from ESC 2023.' },
        { q: 'The 2-week regimen for right-sided MSSA IE requires a vegetation…', options: ['< 20 mm, no empyema or left-sided involvement', '> 20 mm', 'Of any size', 'Absent on TOE'], answer: 0, why: 'Uncomplicated, isolated right-sided disease only.' },
        { q: 'POET partial oral step-down requires at least…', options: ['3 days IV', '10 days IV, stable, cultures negative, no abscess', '6 weeks IV', 'A normal CRP'], answer: 1, why: 'Plus falling CRP, afebrile, no abscess on TOE.' },
        { q: 'Rifampicin started in a patient on methadone…', options: ['Raises methadone levels', 'Lowers methadone levels — risk of withdrawal', 'Has no effect', 'Causes QT shortening only'], answer: 1, why: 'CYP induction; adjust the dose.' },
        { q: 'Adult needle decompression site in ATLS 10th edition…', options: ['2nd ICS mid-clavicular line only', '4th/5th ICS just anterior to the mid-axillary line', '7th ICS posterior', 'Subxiphoid'], answer: 1, why: 'Thinner chest wall.' },
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
          <li className="cs-li">🫁 Fever + injecting + holes in the lungs = tricuspid endocarditis until proven otherwise.</li>
          <li className="cs-li">🧫 Two to three sets of cultures from separate venepunctures, ~10 mL a bottle, BEFORE the first dose — fast when septic.</li>
          <li className="cs-li">🧩 Duke-ISCID 2023: two majors is definite; minors count by category; septic pulmonary infarcts are vascular phenomena.</li>
          <li className="cs-li">📡 S. aureus: get a TOE to look at the LEFT heart and the septum — a clean TTE is not enough when the plan depends on it.</li>
          <li className="cs-li">📏 Measure a mobile vegetation on its longest frame; &gt; 20 mm after recurrent emboli is a right-sided indication.</li>
          <li className="cs-li">⚔️ MSSA: flucloxacillin 12 g/day or cefazolin 6 g/day; no routine gentamicin or rifampicin; 4–6 weeks from the first negative culture.</li>
          <li className="cs-li">🏰 Persistent bacteraemia means an uncontrolled source: debulk, operate, drain — do not just add drugs.</li>
          <li className="cs-li">💊 POET-style oral step-down after ≥ 10 days IV when stable — and rifampicin halves methadone.</li>
          <li className="cs-li">💨 Tension pneumothorax is clinical: decompress at the 4th/5th space anterior to the mid-axillary line, then drain.</li>
          <li className="cs-li">🤝 OAT from day 1, real analgesia, naloxone and harm reduction: treat the person, not just the valve.</li>
        </ol>
      </div>
      <Video id="iaO8110iSzI" title="Infective Endocarditis" channel="Ninja Nerd" />
      <CaseLibrary playlist={VALVE_PLAYLIST} start={VALVE_PLAYLIST_START} channels={VALVE_CHANNELS}>
        Keep going: more structural and valvular cases from the recommended teams.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const VALVE_07 = {
  title: 'Right-sided infective endocarditis · MSSA tricuspid vegetation · aspiration and a tension pyopneumothorax',
  short: 'Structural Heart · Case 07',
  patient: {
    name: 'Ms Jade Morrison',
    meta: '24 F · MRN 7730-1158 · 52 kg',
    flags: [
      { text: 'Injects drugs — right groin', tone: 'amber' },
      { text: 'S. aureus bacteraemia', tone: 'red' },
      { text: 'HCV antibody +', tone: 'amber' },
      { text: 'Methadone (from day 1)', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 20, limit: 150, basis: 'TOE-guided; minimal contrast' },
  clock0: min(2, 15),
  vitals0: { hr: 124, sys: 96, dia: 58, spo2: 91, rr: 28, st: 0, rhythm: 'sinus' },
  brand: { icon: '🦠', line: 'Structural Heart · Case 07' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / IM / EM', tone: 'cyan' },
      { text: 'Endocarditis · structural', tone: 'red' },
      { text: 'ESC 2023 endocarditis-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'Holes in', style: 'outline' },
      { text: 'the lungs', style: 'grad' },
      { text: '& the person', style: 'cyan' },
    ],
    hook: (
      <>
        A 24-year-old woman who injects into her groin arrives with rigors, a cough and a chest X-ray full of <b>holes</b>. Her first question is whether you will call the police.
        You will grow her cultures, classify her with Duke-ISCID 2023, measure a vegetation that will not hold still, build her antibiotics — and suck a 24 mm vegetation off her tricuspid valve without tearing it.
        Then, at <span className="r">03:10 on day 9</span>, a septic infarct ruptures into her pleura. And all the way through, the hardest part: <span className="g">keeping her in hospital long enough to cure her</span>.
      </>
    ),
    image: null,
    sims: 's2',
    crisis: 's9',
    cards: [
      { k: '🧑 The patient', t: 'Jade Morrison, 24 — injects heroin and cocaine, hepatitis C, a four-year-old son; five days of fever and pleuritic pain.' },
      { k: '🩺 Your role', t: 'From the resus bay to the endocarditis team, the hybrid lab and the night on the unit.' },
      { k: '🎛️ In your hands', t: 'A TR murmur, culture bottles, the Duke-ISCID builder, TOE calipers, a CT scroll, a prescription, an aspiration cannula and lung ultrasound.' },
      { k: '🧠 How it teaches', t: 'Vegetation biology, the seeding loop, the TR spiral — and the stigma spiral that kills more people than the valve.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'Fever, cough and holes in the lungs', Component: Presentation,
      pill: '🚑 02:15 — rigors, pleurisy and a question about the police',
      lede: 'Listen to the right heart, read the lungs, take cultures properly — and keep her from leaving.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 124, sys: 96, dia: 58, spo2: 91, rr: 28, rhythm: 'sinus' }); atLeastClock(min(2, 15)); } },
    { id: 's2', icon: '📏', nav: 'Cultures, Duke & TOE', title: 'Cultures, Duke criteria and the vegetation', Component: Investigation,
      pill: '🧫 Day 1–3 — prove it, then measure it',
      lede: 'Watch the bottles flag, classify her with Duke-ISCID 2023, and measure a moving vegetation on TOE.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 108, sys: 106, dia: 62, spo2: 94, rr: 22, rhythm: 'sinus' }); atLeastClock(min(24 + 11, 0)); } },
    { id: 's3', icon: '👥', nav: 'Endocarditis Team', title: 'The endocarditis team: still positive on day 6', Component: Team,
      pill: '🧭 Day 6 — the source the drugs cannot reach',
      lede: 'Persistent bacteraemia, a 24 mm vegetation, new emboli — and a patient who has her own goals.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 104, sys: 108, dia: 64, spo2: 94, rr: 22, rhythm: 'sinus' }); atLeastClock(min(5 * 24 + 10, 0)); } },
    { id: 's4', icon: '🧮', nav: 'Planning', title: 'Planning: the prescription and the route', Component: Planning,
      pill: '💊 The right drug, the right dose, the right length',
      lede: 'Build her antibiotic plan, choose the access, read her right atrium.',
      enter: ({ atLeastClock }) => atLeastClock(min(5 * 24 + 15, 0)) },
    { id: 's5', icon: '🩸', nav: 'Set-up', title: 'Set-up in the hybrid lab', Component: Setup,
      pill: '🧷 Day 7 — bubble study first',
      lede: 'Checklist, sequence, and why a hole in the septum changes the plan.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 100, sys: 110, dia: 62, spo2: 98, rr: 14, rhythm: 'sinus' }); atLeastClock(min(6 * 24 + 8, 0)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy: how much to take, and when to stop', Component: Strategy,
      pill: '🎯 Debulk, don’t chase',
      lede: 'The target, the fragment that flies, and the signs that say stop.',
      enter: ({ atLeastClock }) => atLeastClock(min(6 * 24 + 8, 40)) },
    { id: 's7', icon: '🌀', nav: 'Aspiration', title: 'Percutaneous aspiration of the vegetation', Component: Procedure,
      pill: '🌀 Engage, suction, keep the leaflet',
      lede: 'Steer the funnel on TOE, take the mass, leave the valve.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 98, sys: 104, dia: 60, spo2: 99, rr: 14, rhythm: 'sinus' }); atLeastClock(min(6 * 24 + 9, 10)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit', Component: Recovery,
      pill: '🩸 Prove clearance · start the clock',
      lede: 'Bed 7: cultures, doses, monitoring — and analgesia for someone on methadone.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 92, sys: 112, dia: 64, spo2: 96, rr: 18, rhythm: 'sinus' }); atLeastClock(min(6 * 24 + 15, 0)); } },
    { id: 's9', icon: '🚨', nav: 'Night Crisis', title: 'Day 9, 03:10: the lung gives way', Component: Crisis,
      pill: '🌙 03:10 — a cough, a tearing pain, a silent chest',
      lede: 'Recognise a tension pyopneumothorax, decompress it, drain the pus.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 138, sys: 82, dia: 48, spo2: 82, rr: 38, rhythm: 'sinus' }); atLeastClock(min(8 * 24 + 3, 10)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycles', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'The seeding loop, the tricuspid spiral, and the stigma spiral.',
      enter: ({ setVitals }) => setVitals({ hr: 96, sys: 112, dia: 66, spo2: 95, rr: 18, rhythm: 'sinus' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Six patients who taught these rules.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'Her plan home, the quiz — then your score.' },
  ],
};

export default function Valve07({ onClose }) {
  return <CaseShell def={VALVE_07} onClose={onClose} />;
}
