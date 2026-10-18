import React from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Video, Quiz, Steps, Step,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_PLAYLIST, VALVE_PLAYLIST_START, VALVE_CHANNELS, TRANSSEPTAL_SEARCHES } from '../valveMedia.js';
import ECG12 from '../kit/ECG12.jsx';
import { Auscultation } from '../kit/Valve.jsx';
import { Echo as SubcostalEcho } from '../kit/Physiology.jsx';
import { LAAFlow, RiskBuilder, Morphology, TOEMeasure, SeptalPuncture, LAADeploy, PulsusLine, Pericardio } from './sims.jsx';
import { V, LAAO_SEARCHES } from './media.js';

/* ============================================================
   VALVULAR & STRUCTURAL HEART UNIT · CASE 12
   Percutaneous left atrial appendage occlusion.

   A 78-year-old retired railway engineer in permanent AF
   (CHA₂DS₂-VA 6) bleeds for the third time in a year from
   small-bowel angiodysplasia on apixaban. The modifiable bleeding
   factors have already been removed; he keeps bleeding. Why the
   appendage makes clots; why "non-valvular" matters; the honest
   evidence; TOE planning at four angles, device sizing and
   compression; an inferior–posterior transseptal puncture; PASS
   release criteria — and, four hours later on the ward, a
   pericardial effusion that everyone first calls a GI rebleed.

   Clinical content follows the 2024 ESC/EACTS guidelines for the
   management of atrial fibrillation (CHA₂DS₂-VA; percutaneous LAAO
   "may be considered" — class IIb, level C — in patients with
   contraindications to long-term anticoagulation), the 2020
   EHRA/EAPCI expert consensus update on catheter-based LAAO, and
   the published trials (PROTECT AF, PREVAIL, PRAGUE-17, Amulet IDE,
   OPTION 2024, CHAMPION-AF 2026, CLOSURE-AF 2026), simplified for
   teaching. Device numbers are for the Watchman FLX family; always
   check the current manufacturer's sizing tables.
   ============================================================ */

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
   1 · PRESENTATION — THE THIRD BLEED
   ============================================================ */

function Presentation() {
  const { answers, setVitals } = useCase();
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🌙 02:10</span>Mr Samuel Adeyemi, 78, a retired railway signal engineer, gets up to pass urine, feels the room tilt and sits down hard on the bathroom floor. His wife finds black, tarry stool in the toilet — “like the last two times”.</p>
        <p className="cs-p"><span className="cs-time">history</span>Permanent AF for nine years. Hypertension, type 2 diabetes, a small left-MCA stroke in 2021 with full recovery. CKD 3a (creatinine 138 µmol/L). 74 kg. Apixaban 5 mg twice daily.</p>
        <p className="cs-p"><span className="cs-time">the bleeds</span><b>11 months ago:</b> melaena on apixaban + aspirin 75 mg (“for his heart”, no indication) + ibuprofen for his knee. Two jejunal angiodysplasias burned with argon plasma coagulation; aspirin and ibuprofen stopped. <b>5 months ago:</b> melaena on apixaban alone — double-balloon enteroscopy, six more lesions treated, 3 units transfused.</p>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🚑 03:20</span>Resus bay. Pale, clammy, still passing melaena.</p>
      </div>

      <div className="cs-grid2">
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>📟 Observations · 03:20</div>
          <Table head={['', 'Value']} rows={[
            ['Heart rate', N('112 /min, irregularly irregular', 'cs-hi')], ['Blood pressure', N('92/54 mmHg (usually 140s)', 'cs-hi')], ['SpO₂', N('96% on air')],
            ['Resp. rate', N('22 /min')], ['Postural drop', N('Too dizzy to stand', 'cs-hi')], ['Last apixaban', N('20:00 — 7 h ago')],
          ]} />
        </div>
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🩺 Examination</div>
          <ul className="cs-ul">
            <li className="cs-li">Pale conjunctivae, cool hands, capillary refill 4 s. JVP not seen lying flat.</li>
            <li className="cs-li">Soft abdomen, no tenderness. Black, tarry stool on the glove.</li>
            <li className="cs-li">A soft 2/6 ejection murmur at the right upper sternal edge. A2 clearly heard.</li>
            <li className="cs-li">No stigmata of liver disease. No new neurology.</li>
          </ul>
        </div>
      </div>

      <ECG12 rate={112} rhythm="af"
        caption="Atrial fibrillation, ventricular rate ~110/min — faster than his usual 70s. No ST changes. The rate is compensating for blood loss." />

      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>🧪 Bloods · 03:40</div>
        <Table head={['', 'Result', 'His baseline']} rows={[
          ['Haemoglobin', N('62 g/L', 'cs-hi'), '128 g/L'], ['MCV', N('76 fL', 'cs-lo'), 'iron-deficient pattern'], ['Platelets', N('212 ×10⁹/L'), ''],
          ['Urea', N('19.4 mmol/L', 'cs-hi'), 'blood digested in the gut'], ['Creatinine', N('146 µmol/L', 'cs-hi'), '138'], ['Anti-Xa (apixaban level)', N('112 ng/mL'), 'on-treatment range'],
          ['hs-Troponin T', N('31 ng/L', 'cs-hi'), 'demand'], ['Lactate', N('3.1 mmol/L', 'cs-hi'), ''],
        ]} />
      </div>

      <Decision id="s1-dx" question="What is going on — and what is the real problem of this admission?"
        options={[
          { id: 'ad', label: 'A third upper-small-bowel angiodysplasia bleed on a DOAC, causing haemorrhagic shock — in a man whose stroke risk without anticoagulation is very high', verdict: 'best', points: 10,
            why: 'Tonight is resuscitation. But the question that will define his next ten years is the one behind it: how to protect his brain from his appendage when his gut will not tolerate an anticoagulant.' },
          { id: 'pud', label: 'A peptic ulcer; restart everything once it is clipped', verdict: 'wrong', points: 2, why: 'Possible — he will be scoped — but two previous enteroscopies found multiple angiodysplasias, and the bleeds keep recurring after treatment.' },
          { id: 'acs', label: 'An NSTEMI — the troponin is up', verdict: 'wrong', points: 0, why: 'A small demand rise in a tachycardic, anaemic man. Treating it as ACS with antiplatelets would be a disaster.' },
        ]} />

      <MultiSelect id="s1-resus" question="The first 30 minutes. What do you do?"
        items={[
          { id: 'iv', label: 'Two large-bore cannulae; cross-match 4 units', correct: true, why: 'Ongoing melaena with shock.' },
          { id: 'hold', label: 'Hold apixaban', correct: true, why: 'Obvious — and write it on the chart so no one gives the 08:00 dose.' },
          { id: 'tx', label: 'Transfuse red cells now', correct: true, why: 'Hb 62 with shock and ischaemic heart muscle: transfuse, then reassess.' },
          { id: 'gi', label: 'Gastroenterology: endoscopy within 24 hours once resuscitated', correct: true, why: 'Exclude an upper source; plan small-bowel therapy.' },
          { id: 'ppi', label: 'IV proton-pump inhibitor until the upper GI tract is seen', correct: true, why: 'Reasonable until an ulcer is excluded.' },
          { id: 'bb', label: 'IV metoprolol for the AF at 112', correct: false, why: 'The rate is holding up his cardiac output. Slow it and the pressure falls.' },
          { id: 'tranx', label: 'High-dose IV tranexamic acid', correct: false, why: 'HALT-IT: no mortality benefit in GI bleeding and more venous thrombosis.' },
        ]} />

      <Why title="🫀 Why his heart rate went from 72 to 112"
        chain={[
          { k: 'LOST VOLUME', t: 'A litre of blood in the gut: less venous return, less stroke volume.' },
          { k: 'BARORECEPTORS', t: 'The carotid sinus senses the falling pressure and fires the sympathetic system.' },
          { k: 'AV NODE', t: 'In AF the atria offer hundreds of impulses; adrenaline lets the AV node pass more of them.' },
          { k: 'COMPENSATION', t: 'Cardiac output = rate × stroke volume. The rate is the only lever he has left.' },
        ]}>
        Treat the cause — volume and blood — and the rate comes down by itself. A beta-blocker would cut the only lever.
      </Why>

      <Decision id="s1-rev" question="Last apixaban 7 hours ago; anti-Xa level 112 ng/mL. Reverse it?"
        options={[
          { id: 'no', label: 'No specific reversal now: stop it, resuscitate, let it wear off (half-life ~12 h); reserve andexanet alfa or 4-factor PCC for life-threatening bleeding that does not respond', verdict: 'best', points: 10,
            why: 'He is responding to blood. Reversal agents carry a real thrombotic risk — in a man with a CHA₂DS₂-VA of 6 that matters. They are for life-threatening bleeding or bleeding into a critical site.' },
          { id: 'andex', label: 'Andexanet alfa now, for everyone bleeding on a factor Xa inhibitor', verdict: 'wrong', points: 2, why: 'Not for a bleed that is responding to resuscitation; thrombotic events after andexanet are not rare.' },
          { id: 'vitk', label: 'IV vitamin K', verdict: 'wrong', points: 0, why: 'Vitamin K reverses warfarin. It does nothing to apixaban.' },
          { id: 'ffp', label: 'Four units of fresh frozen plasma', verdict: 'wrong', points: 0, why: 'FFP does not reverse a direct factor Xa inhibitor and adds a large volume load.' },
        ]} />

      <Decision id="s1-hb" question="He has had 2 units; Hb 74 g/L, pressure 112/64, melaena slowing. Transfusion target?"
        onAnswer={() => setVitals({ hr: 94, sys: 112, dia: 64 })}
        options={[
          { id: '80', label: 'Restrictive: aim around 80 g/L given his heart disease, then iron (IV) once the bleeding stops', verdict: 'best', points: 10,
            why: 'Restrictive strategies are safer in GI bleeding (TRIGGER, Villanueva). With cardiovascular disease and a troponin rise, most aim a little higher, ~80 g/L.' },
          { id: '100', label: 'Liberal: transfuse to 100 g/L', verdict: 'wrong', points: 2, why: 'In GI bleeding a liberal target raises portal and splanchnic pressures and has been associated with more rebleeding.' },
          { id: 'none', label: 'Stop transfusing; 74 is enough', verdict: 'ok', points: 5, why: 'Close to target — but with ischaemic muscle and ongoing bleeding one more unit is reasonable.' },
        ]} />
      {answers['s1-hb'] && <Note kind="pearl" title="07:30">3 units in. Hb 84, pressure 118/66, rate 92. Gastroscopy at 10:00: no ulcer. Capsule images from the last admission show diffuse jejunal angiodysplasias — too many to burn them all.</Note>}

      <div className="cs-h2">👂 That soft murmur — listen</div>
      <p className="cs-p">Angiodysplasia + an ejection murmur should make you think of <b>Heyde’s syndrome</b>: severe aortic stenosis shears von Willebrand factor and the gut vessels bleed — and a TAVI can stop the bleeding. Compare his murmur with severe AS.</p>
      <Auscultation lesions={['as-mild', 'as-severe', 'normal']} />
      <Decision id="s1-heyde" question="Soft 2/6 early-peaking murmur, A2 well heard, a normal pulse. Next echo shows aortic sclerosis, Vmax 1.9 m/s. Is this Heyde’s syndrome?"
        options={[
          { id: 'no', label: 'No — aortic sclerosis without stenosis does not shear von Willebrand multimers. His bleeding is from the angiodysplasias plus the anticoagulant', verdict: 'best', points: 10,
            why: 'Heyde’s needs severe AS (high shear across the valve). Here a valve operation would fix nothing.' },
          { id: 'tavi', label: 'Yes — refer for TAVI', verdict: 'wrong', points: 0, why: 'A valve procedure for a valve that is not narrow. Case 01 is the patient for whom this is true.' },
        ]} />
      <Contrast title="🩸 Heyde’s syndrome vs angiodysplasia on an anticoagulant"
        is={{ h: 'Heyde’s (severe AS)', points: ['Severe AS: Vmax ≥ 4 m/s, soft or absent A2, slow-rising pulse.', 'Shear stress unfolds and cleaves large von Willebrand multimers: acquired von Willebrand syndrome.', 'Fix the valve (TAVI/SAVR) and the bleeding often stops.'] }}
        isnt={{ h: 'His bleeding', points: ['Aortic sclerosis, Vmax 1.9 m/s — no shear problem.', 'Age-related angiodysplasias that ooze; any anticoagulant turns oozing into haemorrhage.', 'Fix: endoscopic therapy, iron — and an alternative to lifelong anticoagulation.'] }} />
    </>
  );
}

/* ============================================================
   2 · THE APPENDAGE AND THE RISK — MEASURE BOTH
   ============================================================ */

function Investigation() {
  const { answers, answer } = useCase();
  const f = answers['s2-flow'];
  const r = answers['s2-risk'];
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">📅 Day 2</span>The bleeding has stopped. The gastroenterologist writes: “Diffuse jejunal angiodysplasia; further bleeding on ANY anticoagulant is likely. Octreotide may reduce, not abolish, it.” His apixaban is on hold. Every day off it his appendage is unguarded.</p>
      </div>

      <Why title="🧬 Why AF clots form in the appendage — 90% of them"
        chain={[
          { k: 'A CUL-DE-SAC', t: 'The appendage is an embryonic remnant of the left atrium: a blind-ended finger with a narrow mouth.' },
          { k: 'TRABECULAE', t: 'Its wall is lined with pectinate muscles — ridges and crypts where blood eddies and sits.' },
          { k: 'NO KICK', t: 'In sinus rhythm it contracts and empties briskly. In AF it only quivers; emptying velocity falls below 20 cm/s.' },
          { k: 'STASIS', t: 'Slow blood + rough endothelium + a hypercoagulable AF atrium: Virchow’s triad in a cul-de-sac.' },
          { k: 'EMBOLUS', t: 'The clot breaks off and goes where cardiac output goes — a quarter of it to the head.' },
        ]}>
        That is why closing one small finger of the atrium can stand in for anticoagulating the whole blood.
      </Why>

      <div className="cs-h2">📏 TOE · measure his appendage emptying velocity</div>
      <p className="cs-p">Pulsed-wave Doppler 1 cm inside the appendage mouth. Look at a healthy appendage in sinus rhythm first, then his. Set the cursor on the tallest emptying peak of HIS trace.</p>
      <LAAFlow done={f} onMeasure={res => answer('s2-flow', res)} />
      {f && (
        <div className={'cs-fb ' + (f.close ? 'best' : 'ok')}>
          You measured {f.v} cm/s. {f.close ? 'Right: ~18 cm/s. Below 20 cm/s, smoke, sludge and thrombus become common — the appendage is a stagnant pond.' : 'His true peak is ~18 cm/s — set the cursor on the tallest of the small fibrillatory waves, not the average.'}
        </div>
      )}
      <ScoreOnce id="s2-flow" pts={f == null ? null : f.close ? 10 : 4} max={10} />

      <Contrast title="🌊 smoke vs sludge vs thrombus"
        is={{ h: 'Thrombus', points: ['A discrete echodense mass, distinct from the wall, seen in more than one plane.', 'Often at the tip of a lobe; may move independently.', 'Any device plan is OFF until it resolves.'] }}
        isnt={{ h: 'Smoke, sludge and pectinate muscles', points: ['Smoke: swirling, low-velocity spontaneous echo contrast — a warning, not a contraindication.', 'Sludge: dense, gelatinous, not yet a clot — treat it as high risk.', 'Pectinate muscles: ridges continuous with the wall that move WITH it, seen best at 0–135°. Mistaking them for thrombus cancels procedures; mistaking thrombus for them causes strokes.'] }} />

      <MultiSelect id="s2-toe" question="Today’s TOE. Which findings must you actively look for before anyone mentions a device?"
        items={[
          { id: 'thr', label: 'Thrombus in the appendage — swept at 0°, 45°, 90° and 135°', correct: true, why: 'A thrombus is an absolute contraindication to putting a device into it.' },
          { id: 'ms', label: 'Mitral stenosis', correct: true, why: 'Moderate–severe MS makes this “valvular” AF: anticoagulation is not optional and the clot can form in the atrial body, not just the appendage.' },
          { id: 'pfo', label: 'The interatrial septum: PFO, ASD, aneurysm, prior closure device', correct: true, why: 'It decides where and whether you can cross.' },
          { id: 'eff', label: 'Baseline pericardial effusion', correct: true, why: 'You need a baseline to judge any effusion after the procedure.' },
          { id: 'plaque', label: 'Complex aortic arch plaque', correct: true, why: 'Another embolic source the device will not touch — and it scores V in CHA₂DS₂-VA.' },
          { id: 'lvef', label: 'A normal ejection fraction proves he does not need a device', correct: false, why: 'EF is irrelevant to the appendage’s clotting.' },
        ]} />

      <div className="cs-h2">🧮 Stroke risk vs bleeding risk — build both scores</div>
      <RiskBuilder done={r} onResult={res => answer('s2-risk', res)} />
      {r && (
        <div className={'cs-fb ' + (r.vaRight && r.hbRight && r.modRight ? 'best' : 'ok')}>
          You scored CHA₂DS₂-VA {r.va} and HAS-BLED {r.hb}{r.modRight ? ', and found the modifiable factor.' : '.'} {r.vaRight && r.hbRight ? '' : 'His are CHA₂DS₂-VA 6 and HAS-BLED 4. '}
          Untreated, a CHA₂DS₂-VA of 6 carried a stroke risk of very roughly 8–10% a year in the older cohorts — one stroke in every ten to twelve years-of-life. A HAS-BLED of 4 flags a high bleeding risk; his own history (three bleeds in a year, two on a DOAC alone) says it more loudly than any score.
        </div>
      )}
      <ScoreOnce id="s2-risk" pts={r == null ? null : (r.vaRight ? 5 : 0) + (r.hbRight ? 5 : 0) + (r.modRight ? 2 : 0)} max={12} />

      <Contrast title="⚖️ what HAS-BLED is vs what it isn’t"
        is={{ h: 'A to-do list', points: ['It flags modifiable risks: blood pressure, antiplatelets, NSAIDs, alcohol, labile INR.', 'It tells you who needs closer follow-up.', 'His first bleed came with aspirin AND ibuprofen on top of apixaban — that was the to-do list.'] }}
        isnt={{ h: 'A reason to withhold anticoagulation', points: ['A high HAS-BLED alone is NOT a contraindication: stroke risk rises with the same factors.', 'Most high-HAS-BLED patients still gain more than they lose from a DOAC.', 'His contraindication is not a score — it is repeated major bleeding from a lesion that cannot be fixed, despite every modifiable factor removed.'] }} />

      <Decision id="s2-va" question="Why did the 2024 ESC guideline drop the ‘Sc’ (female sex) from CHA₂DS₂-VASc?"
        options={[
          { id: 'mod', label: 'Female sex is a risk modifier rather than a risk factor: it adds risk only when other factors are present, and dropping it simplifies decisions without leaving women under-treated', verdict: 'best', points: 8,
            why: 'A woman with no other risk factors is low risk; a woman with risk factors is caught by them. The decision thresholds became the same for everyone: CHA₂DS₂-VA ≥ 2 recommend, = 1 consider.' },
          { id: 'eq', label: 'Because women have fewer strokes than men', verdict: 'wrong', points: 0, why: 'Not true in older AF populations — women often have more, and worse.' },
        ]} />
      <Decision id="s2-ms" question="Same bleeding history — but in a 64-year-old woman with moderate rheumatic mitral stenosis (MVA 1.3 cm²) and AF. Is she a candidate for LAAO?"
        options={[
          { id: 'no', label: 'No — this is “valvular” AF: anticoagulation with a VKA is indicated regardless of any score, clots form in the whole dilated atrium, and LAAO trials excluded her', verdict: 'best', points: 10,
            why: 'In MS the whole atrium is stagnant behind a narrow valve. Closing the appendage leaves the main pond open. Her problem needs the valve treated (PMC, Case 06) and a VKA.' },
          { id: 'yes', label: 'Yes — her CHA₂DS₂-VA is only 1, so the risk is low anyway', verdict: 'wrong', points: 0, why: 'Scores do not apply to moderate–severe MS or mechanical valves; their stroke risk is high regardless.' },
        ]} />
      <Contrast title="🫀 non-valvular AF vs “valvular” AF"
        is={{ h: 'Where LAAO can stand in for anticoagulation', points: ['AF without moderate–severe mitral stenosis or a mechanical valve — even with MR, AS or a bioprosthesis.', 'The appendage is the main factory (≈ 90% of thrombi).', 'DOACs preferred; LAAO for those who truly cannot take them.'] }}
        isnt={{ h: 'Where it cannot', points: ['Moderate–severe (usually rheumatic) mitral stenosis: the whole atrium stagnates.', 'A mechanical valve: the valve itself makes clot — it needs warfarin anyway.', 'Other strong indications for anticoagulation (VTE, LV thrombus): closing the appendage does not treat them.'] }} />
    </>
  );
}

/* ============================================================
   3 · THE HEART TEAM — CAN HE BE ANTICOAGULATED?
   ============================================================ */

function HeartTeam() {
  return (
    <>
      <div className="cs-card">
        <div className="cs-h2" style={{ marginTop: 0 }}>👥 AF heart team · day 4 (cardiology, gastroenterology, haematology, the patient and his wife)</div>
        <Table head={['', 'Finding']} rows={[
          ['Stroke risk', 'CHA₂DS₂-VA 6; prior stroke; LAA emptying velocity 18 cm/s with smoke'],
          ['Bleeding', 'Three transfusion-requiring GI bleeds in 11 months; two on apixaban alone after aspirin/NSAID stopped and lesions treated'],
          ['Gastroenterology', 'Diffuse jejunal angiodysplasia; recurrence on any anticoagulant likely'],
          ['TOE', 'No thrombus; no MS; intact septum; no effusion; chicken-wing appendage'],
          ['Other', 'Lives independently, drives to church, looks after grandchildren; CFS 3'],
          ['His words', '“My father had a stroke and lay in bed for four years. I would rather bleed than be him. But I cannot keep coming here for blood.”'],
        ]} />
      </div>

      <Decision id="s3-oac" question="First question: what about anticoagulation from here?"
        options={[
          { id: 'contra', label: 'Long-term anticoagulation is now contraindicated in practice: recurrent major bleeding from an untreatable source despite correcting every modifiable factor', verdict: 'best', points: 10,
            why: 'This is the population the guideline means: not “high HAS-BLED”, not “frail”, not “fell once” — but repeated, serious, unfixable bleeding.' },
          { id: 'low', label: 'Apixaban 2.5 mg twice daily as a compromise', verdict: 'wrong', points: 0, why: 'He meets no dose-reduction criteria (age < 80, weight > 60 kg, creatinine 138 — one of three at most). Off-label underdosing gives the bleeding without full stroke protection.' },
          { id: 'asp', label: 'Aspirin instead — it is safer', verdict: 'wrong', points: 0, why: 'Aspirin barely prevents AF strokes (AVERROES: apixaban far better, similar major bleeding). It is not a safer alternative; it is a weaker one.' },
          { id: 'none', label: 'No antithrombotic at all, ever', verdict: 'ok', points: 3, why: 'A legitimate choice for some — but with CHA₂DS₂-VA 6 and smoke, it leaves a very high stroke risk untouched. Discuss the alternative first.' },
        ]} />

      <Contrast title="🚫 a contraindication vs a worry"
        is={{ h: 'Real contraindications to long-term OAC', points: ['Recurrent major bleeding from an untreatable source (his).', 'Intracranial haemorrhage with high recurrence risk (e.g. cerebral amyloid angiopathy).', 'Severe bleeding diathesis.'] }}
        isnt={{ h: 'Worries that are not', points: ['Old age alone.', 'Falls — you would need to fall ~300 times a year for the bleeding risk to outweigh the stroke benefit (classic decision analysis).', 'A high HAS-BLED score without a bleed.', 'A minor bleed with a fixable cause.'] }} />

      <Why title="⚖️ Why a device can replace a drug — and why it is not quite as good"
        chain={[
          { k: 'THE DRUG', t: 'A DOAC thins ALL the blood: it protects the appendage, the atrial body and the brain — and makes every angiodysplasia bleed.' },
          { k: 'THE DEVICE', t: 'A plug seals only the appendage: ~90% of the clot factory, none of the gut.' },
          { k: 'WHAT IS LEFT', t: 'The atrial body, leaks around the device, thrombus on the device itself, and strokes from other sources.' },
          { k: 'THE TRADE', t: 'A little less ischaemic protection for much less lifelong bleeding — worth it only when bleeding is the bigger threat.' },
        ]} />

      <Note kind="evid" title="📚 The evidence — honestly">
        <b>PROTECT AF</b> and <b>PREVAIL</b> (Watchman vs warfarin): pooled 5-year data showed similar overall stroke/systemic embolism/CV death, fewer haemorrhagic and disabling strokes and less non-procedural bleeding — but numerically MORE ischaemic strokes with the device. <b>PRAGUE-17</b> (Watchman/Amulet vs mostly apixaban, high-risk patients): non-inferior for a combined endpoint that included bleeding. <b>Amulet IDE</b>: Amulet vs Watchman 2.5 — non-inferior, better closure, more early complications. <b>OPTION</b> (NEJM 2024, after ablation): less bleeding, non-inferior efficacy. <b>CHAMPION-AF</b> (NEJM 2026, Watchman FLX vs DOAC): non-inferior composite and less bleeding at 3 years, but ischaemic stroke numerically higher with the device (≈ 3.2% vs 2.0%). <b>CLOSURE-AF</b> (NEJM 2026, 912 older patients with high stroke AND bleeding risk, vs physician-directed best medical care): LAAO was <b>NOT</b> non-inferior. <br /><br />
        The catch: almost every randomised patient COULD take anticoagulation. The patients the guideline recommends LAAO for — those who cannot — were largely excluded. Hence the 2024 ESC class <b>IIb, level C</b>: “may be considered in patients with contraindications to long-term anticoagulation”.
      </Note>

      <Decision id="s3-lao" question="What does the heart team recommend?"
        options={[
          { id: 'laao', label: 'Percutaneous LAAO with a short post-procedure antiplatelet regimen — after shared decision-making with him', verdict: 'best', points: 10,
            why: 'High stroke risk, a genuine contraindication to long-term OAC, no MS, no thrombus, suitable anatomy, and a patient who values stroke prevention. This is where the IIb recommendation lives.' },
          { id: 'surg', label: 'Thoracoscopic surgical appendage clipping', verdict: 'ok', points: 4, why: 'An option at experienced centres when no antithrombotic at all is possible — but a surgical procedure in a 78-year-old; percutaneous is first line here.' },
          { id: 'doac', label: 'Restart full-dose apixaban and transfuse when he bleeds', verdict: 'wrong', points: 2, why: 'Some patients choose this — but three transfusion-requiring bleeds in a year is not a strategy he can sustain, and he has said so.' },
        ]} />

      <MultiSelect id="s3-sdm" question="Shared decision-making. What must he hear before he signs?"
        items={[
          { id: 'why', label: 'Why: stroke prevention without lifelong anticoagulation — not better stroke prevention than a DOAC', correct: true, why: 'The device trades a small amount of ischaemic protection for much less bleeding.' },
          { id: 'risk', label: 'Procedural risks: pericardial effusion/tamponade (~1–2% with current devices), device embolisation, stroke, vascular injury', correct: true, why: 'He will meet one of these tonight.' },
          { id: 'drugs', label: 'He will still need antiplatelet tablets for weeks to months — and they can make him bleed too', correct: true, why: 'Not “no more blood thinners” — fewer, for less time.' },
          { id: 'fu', label: 'Follow-up imaging (TOE or CT) to look for device thrombus and leaks', correct: true, why: 'Device-related thrombus is the device’s own stroke risk.' },
          { id: 'cure', label: 'That the device cures his AF', correct: false, why: 'It does nothing to the rhythm. He stays in AF.' },
          { id: 'zero', label: 'That his stroke risk becomes zero', correct: false, why: '10% of AF thrombi form elsewhere; strokes have other causes; leaks and device thrombus occur.' },
        ]} />

      <Decision id="s3-talk" question="He asks: “Doctor — is this plug better than the blood thinner?”"
        options={[
          { id: 'honest', label: '“Not better at preventing strokes — about as good overall in trials, perhaps a little less protective against clot strokes. Its advantage is that after a few months you need far fewer blood thinners, and you bleed much less. For you, that is the point.”', verdict: 'best', points: 10,
            why: 'Honest about the trade, in his terms, tied to his own goal.' },
          { id: 'better', label: '“Yes — it removes the source of strokes.”', verdict: 'wrong', points: 0, why: 'Overselling. The evidence does not show superiority for stroke prevention, and CLOSURE-AF reminds us it is not equivalent in every population.' },
          { id: 'trials', label: 'Recite the hazard ratios from five trials', verdict: 'ok', points: 3, why: 'Accurate, but he asked a simple question. Answer it first.' },
        ]} />
      <Video id={V.laaoDevice.id} title={V.laaoDevice.title} />
    </>
  );
}

/* ============================================================
   4 · PLANNING — MORPHOLOGY, FOUR ANGLES, ONE DEVICE
   ============================================================ */

function Planning() {
  const { answers, answer } = useCase();
  const mo = answers['s4-morph'];
  const t = answers['s4-toe'];
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">📅 Day 5</span>Cardiac CT and a planning TOE. The structural team sits down with the images: what shape is the appendage, how wide is its mouth, how deep can a device go?</p>
      </div>
      <div className="cs-h2">🦴 Appendage morphology — learn the four, then name his</div>
      <Morphology done={mo} onResult={r => answer('s4-morph', r)} />
      {mo && <div className={'cs-fb ' + (mo.right ? 'best' : 'wrong')}>{mo.right ? 'Chicken wing: a dominant lobe that folds back early. The bend limits how deep the device can sit.' : 'Look again: one dominant lobe bending sharply back on itself — a chicken wing.'}</div>}
      <ScoreOnce id="s4-morph" pts={mo == null ? null : mo.right ? 10 : 0} max={10} />

      <Why title="🦴 Why the shape matters to the device"
        chain={[
          { k: 'A PLUG NEEDS DEPTH', t: 'A plug device (Watchman FLX) sits inside the neck and needs enough length before the first bend or branch.' },
          { k: 'THE BEND', t: 'In a chicken wing the lobe turns back on itself; the usable depth is the distance to the bend, not to the tip.' },
          { k: 'THE LOBES', t: 'A secondary lobe arising close to the mouth (cactus, cauliflower) can lie outside the device: a leak.' },
          { k: 'THE CHOICE', t: 'Deep, single-lobed: plug. Short, multilobed or early bend: disc-and-lobe (Amulet), or a shallow plug deployment.' },
        ]} />

      <div className="cs-h2">📐 TOE at four angles — landing zone and depth</div>
      <p className="cs-p">The appendage mouth is oval, not round: its width depends on the angle you cut it. Measure the landing zone and the usable depth at 0°, 45°, 90° and 135°; size the device to the <b>largest</b> diameter.</p>
      <TOEMeasure done={t} onResult={r => answer('s4-toe', r)} />
      {t && (
        <div className={'cs-fb ' + (t.close && t.size === 27 ? 'best' : 'ok')}>
          Max landing zone {t.maxW.toFixed(1)} mm (true 22.0 mm at 135°). You chose a {t.size} mm FLX: predicted compression {t.compression.toFixed(0)}%.{' '}
          {!t.close ? 'Some of your diameters are off by > 1.2 mm — a mis-sized device leaks or embolises. ' : ''}
          {t.size === 27 ? 'A 27 mm device gives ~18% at the widest diameter — squarely within 10–30%.' : t.size < 27 ? 'Too small: under 10% compression at the widest diameter will not anchor or seal.' : 'Too big for his shallow, bending lobe: over-compression puckers the device and it may not fit before the bend.'}
        </div>
      )}
      <ScoreOnce id="s4-toe-m" pts={t == null ? null : (t.close ? 10 : 4)} max={10} />
      <ScoreOnce id="s4-toe-s" pts={t == null ? null : t.size === 27 ? 10 : t.size === 31 ? 4 : 0} max={10} />

      <Decision id="s4-la" question="On the day, before you measure, the anaesthetist says his LA pressure is 6 mmHg after an overnight fast. What do you do?"
        options={[
          { id: 'load', label: 'Give fluid until the mean LA pressure is above ~10–12 mmHg, then measure', verdict: 'best', points: 10,
            why: 'A dry atrium shrinks the appendage. Measure it empty and you choose a device too small; it under-compresses, leaks or embolises when he is rehydrated.' },
          { id: 'go', label: 'Measure now — the anatomy is the anatomy', verdict: 'wrong', points: 0, why: 'The appendage is a compliant pouch whose size follows its filling pressure.' },
          { id: 'upsize', label: 'Measure now and simply upsize by one', verdict: 'ok', points: 3, why: 'A guess on top of a wrong measurement.' },
        ]} />
      <Contrast title="📏 sizing a plug vs sizing a disc-and-lobe"
        is={{ h: 'Watchman FLX (plug)', points: ['Sized to the maximum landing-zone diameter across all angles.', 'Target compression ~10–30% (older Watchman 2.5: ~8–20%).', 'Needs a coaxial approach and enough depth before the bend.'] }}
        isnt={{ h: 'Amulet (disc + lobe)', points: ['The lobe is sized to the landing zone ~10–12 mm inside the mouth; the disc covers the ostium from the atrial side.', 'Less depth needed — friendly to short or early-bending appendages.', 'The disc must sit flat and close to the mouth; the lobe should look like a “tyre”, compressed.'] }} />
      <Note kind="pearl" title="🧭 CT or TOE?">CT gives a true 3D landing zone, depth and the best transseptal plan, and avoids an extra sedated TOE; TOE excludes thrombus with more confidence (or delayed-phase CT can). Many centres use CT to plan and TOE or intracardiac echo (ICE) to guide. The geometry you just measured is the same either way.</Note>
    </>
  );
}

/* ============================================================
   5 · SET-UP
   ============================================================ */

function Setup() {
  return (
    <>
      <MultiSelect id="s5-check" question="Day 8, structural lab. Before the first needle — what must be in place?"
        items={[
          { id: 'thr', label: 'A same-day (or within 48 h) image excluding appendage thrombus', correct: true, why: 'He has been off anticoagulation for a week with smoke in the appendage. Clots form fast.' },
          { id: 'hb', label: 'Hb stable (> 90 g/L) and blood cross-matched', correct: true, why: 'He will get heparin; he may need blood.' },
          { id: 'peri', label: 'Pericardiocentesis kit and an echo machine in the room; surgeon aware', correct: true, why: 'Tamponade is the commonest serious complication — it must be minutes, not an hour, from treatment.' },
          { id: 'ga', label: 'General anaesthesia or deep sedation for TOE guidance — or ICE under light sedation', correct: true, why: 'Imaging guides every step.' },
          { id: 'snare', label: 'Snares and a large sheath available for device retrieval', correct: true, why: 'Embolisation is rare; when it happens you have minutes to decide.' },
          { id: 'doac', label: 'A loading dose of apixaban this morning', correct: false, why: 'No. Heparin in the lab only, once the septum is crossed.' },
        ]} />
      <Sequence id="s5-seq" question="Put the procedure in order."
        steps={[
          { label: 'Ultrasound-guided right femoral vein access', why: 'Plan for a large-bore venous sheath and closure.' },
          { label: 'Transseptal puncture — inferior and posterior in the fossa', why: 'The appendage lies anterior and superior: room below it to curve up into its axis.' },
          { label: 'Heparin to an ACT of 250–350 s', why: 'Equipment in the left atrium; given once the septum is crossed (or just before).' },
          { label: 'LA pressure > 10–12 mmHg, then measure the appendage at 0°, 45°, 90°, 135° and on angiography', why: 'A full atrium, a true size.' },
          { label: 'Advance the access sheath coaxially into the appendage over a pigtail', why: 'The pigtail protects the thin wall; the sheath is never pushed blind.' },
          { label: 'Deploy, then check PASS: Position, Anchor (tug), Size (compression), Seal', why: 'Release only when all four are met.' },
          { label: 'Release; final colour check; echo for effusion before leaving the lab', why: 'A baseline for the ward.' },
        ]} />
      <Why title="🩸 Why the appendage wall tears so easily"
        chain={[
          { k: 'PAPER-THIN', t: 'Between the pectinate ridges the appendage wall can be about a millimetre thick.' },
          { k: 'A STIFF SHEATH', t: 'A 14F access sheath and a stiff wire push against that wall at an angle if the approach is not coaxial.' },
          { k: 'THE PUNCTURE', t: 'Tip, wire or device anchors breach the wall; blood leaks into the pericardium with every atrial beat.' },
          { k: 'HEPARIN', t: 'An ACT of 300 keeps the hole open — a trickle becomes tamponade, sometimes hours later.' },
        ]} />
      <Video id={V.tsp.id} title={V.tsp.title} />
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
      <p className="cs-p">Before you scrub: four forks in the road. Each choice has a consequence.</p>
      <Why title="🧲 Why compression holds the device in place"
        chain={[
          { k: 'NITINOL', t: 'The frame is shape-memory metal that wants to spring back to its nominal size.' },
          { k: 'RADIAL FORCE', t: 'Squeezed 10–30% by the appendage neck, it pushes outward on the wall.' },
          { k: 'ANCHORS', t: 'That force drives the small anchors into the trabeculated wall.' },
          { k: 'TOO LITTLE', t: 'Under ~10%: no grip — it moves on a tug, leaks around its edge, and can embolise.' },
          { k: 'TOO MUCH', t: 'Over ~30%: the frame puckers, the face folds, it protrudes and seals badly.' },
        ]} />
      <Decision id="s6-dev" question="Chicken wing, max landing zone 22 mm, usable depth only ~19 mm at 135° before the bend. Which device strategy?"
        options={[
          { id: 'flx', label: 'Watchman FLX 27 mm, deployed with its shoulder at the ostium — the closed, rounded FLX tolerates a shallower landing zone', verdict: 'best', points: 10,
            why: 'FLX works in shorter appendages than the old Watchman 2.5 needed. Amulet would be an equally reasonable plan; the decision is the operator’s experience and the anatomy at 135°.' },
          { id: 'amu', label: 'Amulet: lobe in the neck, disc over the mouth', verdict: 'ok', points: 7, why: 'A good choice for an early bend. Neither device has shown superiority for stroke prevention.' },
          { id: 'deep', label: 'Push a plug deep past the bend into the distal lobe', verdict: 'wrong', points: 0, why: 'The proximal appendage and the ostium stay open (leak); and forcing round a bend tears the wall.' },
        ]} />
      {answers['s6-dev'] === 'deep' && <Note kind="warn" title="Consequence">The sheath kinks at the bend; you push. A contrast puff stains the pericardium. See the war stories.</Note>}

      <Decision id="s6-sheath" question="The access sheath tip points at the roof of the appendage, not down its axis. What now?"
        options={[
          { id: 'reshape', label: 'Pull back to the ostium, change the sheath curve (double vs single curve) or the puncture site if needed — never push a non-coaxial sheath', verdict: 'best', points: 10,
            why: 'Coaxial is safe; angled is how walls are perforated. Most non-coaxiality is decided at the septum.' },
          { id: 'push', label: 'Advance over the stiff wire anyway', verdict: 'wrong', points: 0, why: 'A stiff sheath against a 1 mm wall.' },
        ]} />

      <Decision id="s6-tug" question="Your device is deployed; the tug test shows it sliding back toward the LA. Next?"
        options={[
          { id: 'recap', label: 'Recapture fully and redeploy, deeper or one size up — the device is under-compressed', verdict: 'best', points: 10,
            why: 'A device that moves on a gentle tug will move on the ward — into the LV or the aorta.' },
          { id: 'rel', label: 'Release it — the fabric will endothelialise and fix it', verdict: 'wrong', points: 0, why: 'Endothelialisation takes weeks. Embolisation happens in hours.' },
          { id: 'tug2', label: 'Tug harder to seat it', verdict: 'wrong', points: 0, why: 'You tug to TEST the anchor, gently. Hard pulling tears the appendage.' },
        ]} />

      <Decision id="s6-leak" question="All PASS criteria met but a 4 mm peri-device jet persists at 45°. What do you do?"
        options={[
          { id: 'judge', label: 'Try one repositioning to cover the missing edge; if it persists, accept ≤ 5 mm, release and plan follow-up imaging', verdict: 'best', points: 8,
            why: 'Most leaks ≤ 5 mm were historically accepted; newer data link even small leaks to more events, so aim for none — but do not trade a safe device for a perfect jet.' },
          { id: 'ignore', label: 'Release; leaks do not matter', verdict: 'wrong', points: 0, why: 'Larger leaks are associated with thromboembolism.' },
          { id: 'up', label: 'Upsize twice until it disappears', verdict: 'ok', points: 2, why: 'Over-compression brings its own problems: puckering, protrusion, wall injury.' },
        ]} />
      <Contrast title="🪡 transseptal puncture for the appendage vs for MitraClip"
        is={{ h: 'LAAO — INFERIOR and POSTERIOR', points: ['The appendage is anterior, superior and leftward.', 'A low, posterior crossing leaves room for the sheath to curve UP and FORWARD into its axis.', 'A high puncture points the sheath at the LA roof and left upper pulmonary vein.'] }}
        isnt={{ h: 'TEER — SUPERIOR and POSTERIOR (Case 02)', points: ['The mitral valve is BELOW and in front.', 'Height (~4 cm above the coaptation) gives room to steer down.', 'A low puncture leaves no room to align with the leaflets.'] }} />
    </>
  );
}

/* ============================================================
   7 · THE PROCEDURE
   ============================================================ */

function Procedure() {
  const { answers, answer, setVitals, bump } = useCase();
  const tsp = answers['s7-tsp'];
  const tspGood = tsp && tsp.sup <= 0.35 && tsp.ant <= 0.5;
  const dep = answers['s7-dep'];
  const size0 = answers['s4-toe']?.size || 27;
  return (
    <>
      <p className="cs-p">General anaesthesia, TOE in place, right femoral vein. No thrombus at any angle. LA pressure 13 mmHg after 500 mL of saline.</p>
      <Why title="🪡 Why a low, posterior puncture makes the rest safe"
        chain={[
          { k: 'GEOMETRY', t: 'The appendage mouth sits anterior and superior in the LA, just below the left upper pulmonary vein.' },
          { k: 'LOW CROSSING', t: 'From the inferior fossa the sheath has room to bend upward and forward.' },
          { k: 'COAXIAL', t: 'Its tip arrives pointing DOWN the appendage axis, not into its wall.' },
          { k: 'NO FORCE', t: 'A coaxial sheath slides; an angled one has to be pushed — and pushing is how a 1 mm wall tears.' },
        ]} />
      <Steps id="s7-steps">
        <Step title="🪡 Transseptal puncture — inferior and posterior">
          {({ done }) => (
            <>
              <SeptalPuncture done={tsp} onResult={r => { answer('s7-tsp', r); bump({ fluoro: 45, act: 284 }); }} />
              {tsp && <div className={'cs-fb ' + (tspGood ? 'best' : 'ok')}>Crossed {tsp.sup <= 0.35 ? 'low' : tsp.sup <= 0.6 ? 'mid-fossa' : 'high'} and {tsp.ant <= 0.5 ? 'posterior' : 'anterior'}: the sheath is {tsp.mis}° off the appendage axis. {tspGood ? 'Coaxial: the sheath will slide into the neck with no force. Heparin given; ACT 284 s.' : tsp.sup > 0.35 ? 'Too high: the sheath points at the roof and the left upper pulmonary vein — you will need torque and force to reach the appendage.' : 'Anterior: too close to the aorta and to the appendage itself — no room to curve.'}</div>}
              <ScoreOnce id="s7-tsp" pts={tsp == null ? null : tspGood ? 12 : 4} max={12} />
              {tsp && answers['s7-steps'] == null && <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" onClick={done}>Done — next step</button></div>}
            </>
          )}
        </Step>
        <Step title="🛟 Deploy, then PASS — Position, Anchor, Size, Seal">
          {({ done }) => (
            <>
              <p className="cs-p">The access sheath is in the neck over a pigtail. Choose the device, set where it will open relative to the ostium (dashed line), unsheath, then check all four PASS criteria before you release. You may recapture.</p>
              <LAADeploy size0={size0} done={dep} onResult={r => { answer('s7-dep', r); bump({ fluoro: 120, contrast: 40 }); setVitals({ hr: 76, sys: 118, dia: 64, spo2: 99 }); }} />
              {dep && (
                <div className={'cs-fb ' + (dep.all ? 'best' : 'wrong')}>
                  Released a {dep.size} mm FLX {dep.d > 0 ? `${dep.d} mm inside` : dep.d < 0 ? `${-dep.d} mm proud of` : 'flush with'} the ostium: compression {dep.cMin.toFixed(0)}–{dep.cMax.toFixed(0)}%, leak {dep.leak ? `${dep.leak} mm` : 'none'}, {dep.recaps} recapture{dep.recaps === 1 ? '' : 's'}.
                  {dep.all ? ' All four PASS criteria met: a textbook release.' : !dep.anchorOk ? ' Released without a secure anchor: this device is at high risk of embolising.' : ' Released with a PASS criterion unmet — you will meet the consequence in the war stories.'}
                </div>
              )}
              <ScoreOnce id="s7-dep" pts={dep == null ? null : dep.all ? 20 : dep.anchorOk ? 6 : 0} max={20} />
              {dep && answers['s7-steps'] === 1 && <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" onClick={done}>Done — next step</button></div>}
            </>
          )}
        </Step>
        <Step title="🔎 Before he leaves the lab">
          {() => (
            <>
              <Decision id="s7-eff" question="Final TOE: device stable, no leak. What is the LAST image you take?"
                options={[
                  { id: 'peri', label: 'A sweep for pericardial effusion — transgastric and 4-chamber — compared with the start', verdict: 'best', points: 10,
                    why: 'A new rim of fluid in the lab is a warning to stay, reverse, watch. No fluid gives the ward a baseline.' },
                  { id: 'none', label: 'Nothing more — the device is perfect', verdict: 'wrong', points: 0, why: 'The device is not the only thing that can go wrong.' },
                ]} />
              <Decision id="s7-asd" question="A 4 mm left-to-right jet across the septum where the sheath crossed. Close it?"
                options={[
                  { id: 'leave', label: 'Leave it: small iatrogenic ASDs mostly close, and you may need this route again', verdict: 'best', points: 6, why: 'Closure only for large shunts, right-to-left flow with hypoxaemia, or RV overload.' },
                  { id: 'close', label: 'Close it with a septal occluder', verdict: 'wrong', points: 0, why: 'Unnecessary — and it would block future transseptal access.' },
                ]} />
              <Decision id="s7-prot" question="ACT 268 s at the end. Protamine?"
                options={[
                  { id: 'yes', label: 'Yes — partial reversal is reasonable: he has no stent or new graft that needs heparin, and he is a bleeder', verdict: 'best', points: 6,
                    why: 'Practice varies; many LAAO operators reverse heparin at the end, especially in high bleeding risk, and always if an effusion appears. Watch for protamine reactions (hypotension, pulmonary hypertension).' },
                  { id: 'no', label: 'Never — protamine causes thrombus on the device', verdict: 'ok', points: 3, why: 'A concern that has not been borne out; leaving the ACT high has its own cost.' },
                ]} />
            </>
          )}
        </Step>
      </Steps>
      <div className="cs-media-row" style={{ marginTop: 12 }}>
        <Video id={V.watchmanProc.id} title={V.watchmanProc.title} />
        <Video id={V.watchman.id} title={V.watchman.title} />
      </div>
      <CaseLibrary title="Appendage closure in real cases" channels={LAAO_SEARCHES}>
        Watch for the low, posterior tent; the pigtail and the sheath going coaxially into the neck; the four TOE angles; the tug; and the last look for fluid.
      </CaseLibrary>
      <CaseLibrary title="Transseptal punctures in real cases" channels={TRANSSEPTAL_SEARCHES}>
        Compare: where the tent sits for an appendage, for a mitral clip and for a balloon valvotomy.
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🛏️ 13:30</span>Bed 12, Valvular & Structural Heart Unit. Extubated, chatting, asking for tea. Femoral figure-of-eight stitch dry. AF at 76. Pressure 124/70.</p>
      </div>
      <BedsideMonitor />
      <Decision id="s8-at" question="Antithrombotic plan after the device — in a man who bleeds on anticoagulants?"
        options={[
          { id: 'dapt', label: 'Aspirin 75 mg + clopidogrel 75 mg until the 6–12-week imaging, then a single antiplatelet; PPI cover; a written plan', verdict: 'best', points: 10,
            why: 'The device fabric is bare and thrombogenic until it endothelialises. Short DAPT then SAPT is the common regimen for patients who cannot take OAC (EHRA/EAPCI 2020 consensus; regimens vary and are poorly tested).' },
          { id: 'sapt', label: 'A single antiplatelet only, from day one', verdict: 'ok', points: 6, why: 'Defensible in extreme bleeding risk and used in some centres; observational data are reassuring but device thrombus may be more frequent. Document the trade.' },
          { id: 'warf', label: 'Warfarin + aspirin for 45 days, then DAPT (the PROTECT AF regimen)', verdict: 'wrong', points: 0, why: 'That regimen was for patients who COULD take anticoagulation. He has just bled three times on one.' },
          { id: 'none', label: 'Nothing — the device is the treatment', verdict: 'wrong', points: 0, why: 'A bare device in a slow-flow atrium: device-related thrombus, and the stroke you were trying to prevent.' },
        ]} />
      <Why title="🧲 Why the device needs antiplatelets until it is covered"
        chain={[
          { k: 'BARE FABRIC', t: 'PET fabric and a nitinol hub face the left atrial blood.' },
          { k: 'PLATELETS STICK', t: 'Foreign surfaces bind proteins and platelets within minutes.' },
          { k: 'SLOW FLOW', t: 'AF continues: the atrium still stagnates around the device face.' },
          { k: 'COVERAGE', t: 'Over weeks to months a neo-endothelium grows over the fabric — then the surface behaves like the atrial wall.' },
          { k: 'THE GAP', t: 'Stop antiplatelets before that, or leave the hub uncovered (a deep device), and thrombus forms on the device.' },
        ]} />
      <MultiSelect id="s8-mon" question="The first evening. What do you watch — and why?"
        items={[
          { id: 'vit', label: 'Pressure and heart rate hourly for the first 4–6 hours', correct: true, why: 'Delayed tamponade usually declares in the first hours.' },
          { id: 'echo', label: 'An echo before discharge (or at once if anything changes): effusion, device position', correct: true, why: 'Effusion and early embolisation are both seen on echo.' },
          { id: 'groin', label: 'The groin', correct: true, why: 'A large-bore venous sheath.' },
          { id: 'hb', label: 'Haemoglobin and stools', correct: true, why: 'He is a bleeder — now on two antiplatelets.' },
          { id: 'neuro', label: 'Neurological observations', correct: true, why: 'Air or thrombus embolism in the lab can present on the ward.' },
          { id: 'ecg', label: 'Daily 12-lead ECG to check the device', correct: false, why: 'The ECG cannot see the device.' },
        ]} />
      <Decision id="s8-img" question="When and how do you look at the device after discharge?"
        options={[
          { id: 'img', label: 'TOE or cardiac CT at ~6–12 weeks (and often again at 6–12 months): device position, peri-device leak, device-related thrombus — then decide on the antiplatelet step-down', verdict: 'best', points: 10,
            why: 'The step-down from DAPT should follow the image, not the calendar alone. CT is more sensitive for small leaks; TOE for thin layers of thrombus on the hub.' },
          { id: 'none', label: 'No imaging if he is well', verdict: 'wrong', points: 0, why: 'Device thrombus and leaks are silent until the stroke.' },
          { id: 'ecg', label: 'A chest X-ray to check the device has not moved', verdict: 'ok', points: 2, why: 'It shows gross embolisation — nothing about leaks or thrombus.' },
        ]} />
      <Contrast title="🧫 device-related thrombus vs peri-device leak"
        is={{ h: 'Device-related thrombus (DRT)', points: ['Thrombus on the atrial face of the device, often at the hub.', 'Risk: early antithrombotic withdrawal, deep implantation leaving the pulmonary ridge uncovered, low LAA flow, hypercoagulability.', 'Linked to a several-fold increase in stroke. Treat with anticoagulation (or intensified therapy) and re-image.'] }}
        isnt={{ h: 'Peri-device leak (PDL)', points: ['Flow AROUND the device into the appendage: under-sizing, oval ostium, missed lobe.', '> 5 mm was historically “significant”; smaller leaks may also matter.', 'Options: accept and follow, or plug it (coil, a second device, ablation-based closure) at an expert centre.'] }} />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — 17:50, "HE'S BLEEDING AGAIN"
   ============================================================ */

function Crisis() {
  const { answers, answer, setVitals } = useCase();
  const p = answers['s9-pulsus'];
  const pc = answers['s9-peri'] || {};
  const drained = pc.drained || 0;
  const peri = answers['s9-peri-score'];
  return (
    <>
      <div className="cs-card cs-vignette" style={{ borderLeftColor: 'var(--red)' }}>
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time" style={{ color: 'var(--red)' }}>🚨 17:50</span>
          The nurse calls: “Bed 12 feels faint and sweaty. 88/58, rate 124. He’s a GI bleeder and he’s on two antiplatelets now — I think he’s bleeding again. I’ve put up a litre of saline and sent a cross-match.” He is sitting forward, restless, and says he can’t get comfortable lying back.
        </p>
      </div>
      <BedsideMonitor />
      <Decision id="s9-dx" question="What do you check FIRST, at the bedside, in the next 60 seconds?"
        options={[
          { id: 'jvp', label: 'His neck veins, his stool and a bedside echo — four hours after an appendage procedure, hypotension is tamponade until proven otherwise', verdict: 'best', points: 10,
            why: 'Hypovolaemia empties the neck veins; tamponade fills them. That single look splits the two diagnoses. Echo confirms in a minute.' },
          { id: 'gi', label: 'Rectal exam and an urgent Hb — the GI bleed is back', verdict: 'ok', points: 3, why: 'It must be excluded — but anchoring on the familiar diagnosis is how this complication kills on the ward.' },
          { id: 'vaso', label: 'Lie him flat and raise the legs: a vasovagal faint', verdict: 'wrong', points: 0, why: 'A vasovagal faint is slow, not 124. And lying flat makes a tamponade patient worse.' },
        ]} />
      {answers['s9-dx'] && (
        <div className="cs-card">
          <div className="cs-h2" style={{ marginTop: 0 }}>🔍 18:00 — what you find</div>
          <ul className="cs-ul">
            <li className="cs-li">JVP to the angle of the jaw, rising on inspiration (Kussmaul). Quiet heart sounds.</li>
            <li className="cs-li">No melaena since yesterday. Venous gas Hb 94 g/L (was 98).</li>
            <li className="cs-li">Radial arterial line placed: the pressure falls with every breath in.</li>
          </ul>
        </div>
      )}
      <div className="cs-h2">📈 Measure the pulsus paradoxus</div>
      <PulsusLine done={p} onMeasure={r => { answer('s9-pulsus', r); setVitals({ sys: 84, dia: 56, hr: 128 }); }} />
      {p && <div className={'cs-fb ' + (p.close ? 'best' : 'ok')}>You measured {p.pp} mmHg. {p.close ? 'About 24 mmHg — far beyond 10. ' : 'The true drop is ~24 mmHg (92 → 68): measure the peaks, not the troughs. '}Pulsus paradoxus: the heart cannot fill both ventricles at once inside a tight sac.</div>}
      <ScoreOnce id="s9-pulsus" pts={p == null ? null : p.close ? 10 : 4} max={10} />
      <Why title="🫁 Why the pressure falls when he breathes in"
        chain={[
          { k: 'A FIXED BOX', t: 'Blood in the pericardium: the four chambers now share a space that cannot grow.' },
          { k: 'INSPIRATION', t: 'Negative chest pressure pulls more blood into the right heart.' },
          { k: 'SEPTUM SHIFTS', t: 'The RV can only expand by pushing the septum into the LV.' },
          { k: 'LV STARVED', t: 'Less LV filling, less stroke volume — and the systolic pressure drops > 10 mmHg with each breath in.' },
        ]} />
      <SubcostalEcho effusion={18} tamponade label="Bedside subcostal echo, 18:03: a new 18 mm circumferential effusion with RV diastolic collapse and a plethoric, non-collapsing IVC." />
      <Contrast title="🩸 hypovolaemia vs tamponade — the same pressure, opposite neck"
        is={{ h: 'Tamponade', points: ['JVP HIGH, rising on inspiration.', 'Pulsus paradoxus > 10 mmHg; quiet heart.', 'Echo: effusion, RA/RV diastolic collapse, plethoric IVC.', 'Fix: get the fluid OUT.'] }}
        isnt={{ h: 'Hypovolaemia (GI rebleed)', points: ['JVP FLAT, empty neck veins.', 'Melaena, falling Hb, rising urea.', 'Echo: small, hyperdynamic, kissing ventricles; collapsing IVC.', 'Fix: put volume and blood IN.'] }} />

      <MultiSelect id="s9-now" question="18:05. What do you do now?"
        items={[
          { id: 'help', label: 'Call the structural/interventional team and cardiac surgery; prepare for pericardiocentesis at the bedside or in the lab', correct: true, why: 'The definitive treatment is drainage; the source may need surgery.' },
          { id: 'fluid', label: 'Let the saline run as a bridge', correct: true, why: 'In tamponade, higher filling pressures briefly hold up RV filling and output. A bridge, not a fix.' },
          { id: 'stop', label: 'Hold the evening clopidogrel', correct: true, why: 'Until the bleeding source is controlled.' },
          { id: 'prot', label: 'Check ACT/APTT; protamine if residual heparin', correct: true, why: 'Little heparin is left four hours later, but if it is, reverse it.' },
          { id: 'gtn', label: 'GTN for the chest discomfort', correct: false, why: 'A venodilator drops the preload he depends on.' },
          { id: 'bb', label: 'Metoprolol for the tachycardia', correct: false, why: 'The rate is his only way to keep output up from a tiny stroke volume.' },
          { id: 'tube', label: 'Intubate and ventilate first', correct: false, why: 'Positive pressure ventilation plus induction agents can cause cardiac arrest in tamponade. Drain first, under local anaesthetic, sitting up.' },
        ]} />

      <div className="cs-h2">🪡 Echo-guided pericardiocentesis</div>
      <Pericardio done={peri != null} onStep={s => {
        const cur = answers['s9-peri'] || {};
        const nx = { ...cur, ...s, wrong: cur.wrong || !!s.wrongApproach };
        answer('s9-peri', nx);
        if (s.drained) {
          const k = Math.min(1, s.drained / 300);
          setVitals({ sys: Math.round(84 + k * 34), dia: Math.round(56 + k * 12), hr: Math.round(128 - k * 36), spo2: 97 });
          if (s.drained >= 300) answer('s9-peri-score', nx.wrong ? 6 : 12);
        }
      }} />
      {drained >= 300 && <div className={'cs-fb ' + (pc.wrong ? 'ok' : 'best')}>300 mL of blood out. Pressure 118/68, rate 92, the pulsus gone. {pc.wrong ? 'Your first choice of route risked the internal mammary artery — the route matters as much as the needle.' : 'Subxiphoid, echo-guided, confirmed with bubbles: safe and fast.'}</div>}
      <ScoreOnce id="s9-peri" pts={peri ?? null} max={12} />

      <Decision id="s9-next" question="19:30. The drain gave 40 mL in the last hour, slowing. Echo: device in place, no effusion re-accumulating. What next?"
        options={[
          { id: 'watch', label: 'Leave the drain, hourly output, repeat echo in the morning; remove once < ~25–50 mL/day with no re-accumulation; restart clopidogrel when dry', verdict: 'best', points: 10,
            why: 'Most LAAO effusions come from a small wall injury that seals once the pressure is off. Persistent bleeding — or re-accumulation — means the lab or the surgeon.' },
          { id: 'surg', label: 'Emergency surgery now to repair the appendage', verdict: 'ok', points: 3, why: 'Needed if the drain keeps producing fresh blood (e.g. > 100–200 mL/h) — not for a slowing drain.' },
          { id: 'out', label: 'Remove the drain now — he is better', verdict: 'wrong', points: 0, why: 'A sealed hole can reopen; the drain is your monitor for 12–24 h.' },
        ]} />
      <Decision id="s9-lab" question="Had this happened ON THE TABLE, with the femoral venous sheath still in, the best extra step would be…"
        options={[
          { id: 'auto', label: 'Drain through a pericardial pigtail and AUTOTRANSFUSE the aspirated blood straight back through the femoral venous sheath, reverse heparin, and keep the surgeon in the room', verdict: 'best', points: 10,
            why: 'Aspirated pericardial blood can be given back: it buys time and blood while the leak seals or the surgeon arrives.' },
          { id: 'ffp', label: 'Order FFP and wait for it before draining', verdict: 'wrong', points: 0, why: 'Drain first. Every minute of tamponade costs pressure.' },
        ]} />
      <Note kind="warn" title="🧲 The other lab crisis: device embolisation">If a device lets go, it goes with the blood — through the mitral valve into the LV, or on into the aorta. Signs: new ectopy or VT, a new murmur, the device missing from the appendage on echo. Retrieve with a snare (and a large sheath) from the aorta or LA if it can be done safely; from the LV, between the chords, it often needs surgery. Prevention is the tug test and correct compression.</Note>
      <div className="cs-media-row">
        <Video id={V.pulsus.id} title={V.pulsus.title} />
        <Video id={V.pericardio.id} title={V.pericardio.title} />
      </div>
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
      <ViciousCycle id="cyc-laa" title="AF begets stasis begets stroke begets AF"
        nodes={[
          { short: 'AF', t: 'Atrial fibrillation', d: 'No organised contraction: the appendage only quivers.' },
          { short: 'Stasis', t: 'Emptying velocity < 20 cm/s; smoke', d: 'Blood pools in the trabeculated cul-de-sac.' },
          { short: 'Thrombus', t: 'Clot forms in the appendage', d: 'Virchow’s triad: stasis, rough endothelium, an inflamed hypercoagulable atrium.' },
          { short: 'Stroke', t: 'Embolic stroke', d: 'Large-vessel, disabling, often fatal.' },
          { short: 'Remodelling', t: 'Atrial stretch, fibrosis, enlargement', d: 'The bigger, scarred atrium sustains AF more and the appendage dilates — the loop tightens.' },
        ]}
        breaks={[
          { at: 2, t: 'Anticoagulation (DOAC first line): stop the clot forming.' },
          { at: 1, t: 'LAAO: close the cul-de-sac — when anticoagulation is not possible.' },
          { at: 0, t: 'Rhythm control where it makes sense (early rhythm control, ablation) — it does not replace anticoagulation.' },
          { at: 4, t: 'Treat hypertension, obesity, sleep apnoea, alcohol: the drivers of remodelling.' },
        ]} />
      <Decision id="cyc-rhythm" question="After a successful ablation he is in sinus rhythm. Can anticoagulation stop?"
        options={[
          { id: 'no', label: 'No — decide by stroke risk, not by rhythm: silent AF recurs and atrial disease persists', verdict: 'best', points: 10, why: 'The 2024 ESC guideline keeps anticoagulation by risk profile after rhythm control. Sinus rhythm on an ECG is not an empty appendage.' },
          { id: 'yes', label: 'Yes — no AF, no stroke risk', verdict: 'wrong', points: 0, why: 'A common and dangerous belief.' },
        ]} />
      <ViciousCycle id="cyc-tamp" title="The tamponade spiral — 17:50"
        nodes={[
          { short: 'Bleed', t: 'Blood leaks from the appendage into the pericardium', d: 'Each atrial beat pushes a little more.' },
          { short: 'Pressure', t: 'Pericardial pressure rises', d: 'A stiff sac: the last 100 mL raise the pressure far more than the first.' },
          { short: 'No filling', t: 'RA and RV collapse in diastole', d: 'Venous return cannot get in.' },
          { short: 'Low output', t: 'Stroke volume and pressure fall', d: 'The sympathetic system drives the rate up.' },
          { short: 'Short diastole', t: 'Tachycardia shortens filling time', d: 'And coronary perfusion falls with the aortic pressure — ischaemia, then arrest.' },
        ]}
        breaks={[
          { at: 1, t: 'Pericardiocentesis: removing even 50–100 mL drops the pressure steeply — the same curve, run backwards.' },
          { at: 0, t: 'Reverse anticoagulation (protamine); surgery for an unsealed tear.' },
          { at: 2, t: 'Fluids as a bridge to drainage.' },
          { at: 3, t: 'Avoid vasodilators, beta-blockers and positive-pressure ventilation before drainage.' },
        ]} />
      <Decision id="cyc-curve" question="Why does draining just 100 mL rescue a patient in tamponade?"
        options={[
          { id: 'curve', label: 'The pericardial pressure–volume curve is steep at the top: the last volume in did most of the damage, so the first volume out undoes most of it', verdict: 'best', points: 10, why: 'An acute effusion of 200–300 mL can tamponade; a slow one of a litre may not. Speed matters more than size.' },
          { id: 'vol', label: 'Because 100 mL is a large share of his blood volume', verdict: 'wrong', points: 0, why: 'It is a tiny share of his blood volume — it is about pressure in a stiff sac.' },
        ]} />
      <ViciousCycle id="cyc-bleed" title="The bleeder’s spiral — anticoagulant, anaemia, AF"
        nodes={[
          { short: 'Anticoagulant', t: 'Apixaban on fragile angiodysplasias', d: 'Oozing becomes haemorrhage.' },
          { short: 'Anaemia', t: 'Blood loss, iron deficiency', d: 'Less oxygen to the tissues.' },
          { short: 'Tachycardia', t: 'Faster AF, demand ischaemia', d: 'Troponin rises; breathlessness.' },
          { short: 'Stop–start', t: 'Anticoagulation stopped, restarted, stopped', d: 'Weeks unprotected after each bleed, then bleeding again when restarted.' },
          { short: 'Stroke window', t: 'Stroke risk peaks in the gaps', d: 'The patient gets both harms — bleeding AND stroke.' },
        ]}
        breaks={[
          { at: 0, t: 'Remove the modifiable factors first: aspirin, NSAIDs, blood pressure.' },
          { at: 1, t: 'Endoscopic therapy, IV iron.' },
          { at: 3, t: 'LAAO: replace the stop–start anticoagulant with a device and a short antiplatelet course.' },
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
      <WarStory title="“He’s a GI bleeder — it’s his gut again”"
        mistake="Hypotension four hours after LAAO treated as a GI rebleed: fluids, cross-match, a gastroenterology call — and no look at the neck or the pericardium."
        burn="After any transseptal or appendage procedure, hypotension is tamponade until an echo says otherwise. Look at the JVP.">
        <p className="cs-p">An 81-year-old, uneventful LAAO, back on the ward at 14:00. At 19:00 pressure 82/50: “bleeding again”. Two units of blood, an endoscopy booked for the morning. At 23:40 he became bradycardic and arrested — pulseless electrical activity. The first echo of the night was during CPR: a large effusion. Pericardiocentesis during CPR restored a pulse, but he had a hypoxic brain injury and died nine days later.</p>
      </WarStory>
      <Decision id="mm-tamp" question="Which single bedside sign would have separated the two diagnoses at 19:00?"
        options={[
          { id: 'jvp', label: 'The jugular venous pressure — high in tamponade, flat in hypovolaemia', verdict: 'best', points: 10, why: 'Thirty seconds, no equipment. Then echo.' },
          { id: 'hr', label: 'The heart rate', verdict: 'wrong', points: 0, why: 'Both make him tachycardic.' },
          { id: 'hb', label: 'The haemoglobin', verdict: 'wrong', points: 0, why: 'Haemopericardium drops the Hb too — and a lab result takes too long.' },
        ]} />
      <WarStory title="The device in the left ventricle"
        mistake="Measuring the appendage with a dry atrium (LA pressure 5) and releasing without a tug test."
        burn="Fill the atrium before you measure. Tug before you release. Under-compression embolises.">
        <p className="cs-p">A 21 mm device for an appendage that measured 18 mm at an LA pressure of 5. Compression 8%. No tug test — “it looked stable”. The next morning: new runs of VT and a loud murmur. Echo: the appendage empty, the device caught in the mitral subvalvular apparatus. Snaring from the LV failed; emergency surgery with the device tangled in the chords. He survived after a week of ventilation and a mitral valve replacement.</p>
      </WarStory>
      <Decision id="mm-emb" question="What compression range should have warned the team?"
        options={[
          { id: 'c', label: 'Under ~10% for a Watchman FLX: too little radial force to anchor', verdict: 'best', points: 10, why: 'Target ~10–30%; then tug to prove it.' },
          { id: 'c2', label: 'Over 30%', verdict: 'wrong', points: 0, why: 'That is over-compression — puckering and protrusion, not embolisation.' },
        ]} />
      <WarStory title="The tablets stopped at two weeks"
        mistake="Stopping both antiplatelets at two weeks because of bruising, with no imaging planned."
        burn="Device thrombus is the device’s own stroke. No stop without an image; no image, no stop.">
        <p className="cs-p">“The bruises frighten me.” Aspirin and clopidogrel stopped at 14 days; the 45-day TOE was cancelled during a bed crisis. At three months, a dense right hemiplegia. TOE: a 12 mm thrombus on the device hub; the device sat deep, leaving the ridge near the pulmonary vein uncovered. He never walked again.</p>
      </WarStory>
      <Decision id="mm-drt" question="Device-related thrombus is found on routine 6-week TOE in a patient who cannot take long-term OAC. What do you do?"
        options={[
          { id: 'oac', label: 'A time-limited course of anticoagulation (e.g. LMWH or a DOAC for 6–8 weeks), with close bleeding surveillance, then re-image', verdict: 'best', points: 10,
            why: 'Even patients who “cannot” anticoagulate can often tolerate a short, supervised course for a specific, high-risk target. Re-image to confirm resolution.' },
          { id: 'none', label: 'Nothing — he cannot be anticoagulated', verdict: 'wrong', points: 0, why: 'DRT carries a several-fold stroke risk. Weigh weeks of anticoagulation against a lifetime of disability.' },
          { id: 'surg', label: 'Surgical device removal at once', verdict: 'wrong', points: 2, why: 'Reserved for mobile, enlarging thrombus that fails medical therapy.' },
        ]} />
      <WarStory title="“Non-valvular AF” on a narrow mitral valve"
        mistake="Labelling AF as ‘non-valvular’ without looking at the mitral valve; DOAC, then an LAAO referral."
        burn="Look at the mitral valve before you use the word ‘non-valvular’. Moderate–severe MS means warfarin — and the clot can form anywhere in the atrium.">
        <p className="cs-p">A 59-year-old woman, born in a country with endemic rheumatic fever, “AF, CHA₂DS₂-VA 2, intolerant of apixaban after a nosebleed”. Referred for LAAO. The planning TOE found a mitral valve area of 1.1 cm² — and a thrombus in the body of the LA, not the appendage. Two weeks earlier, before anyone had looked, she had an embolus to her superior mesenteric artery and lost a metre of small bowel.</p>
      </WarStory>
      <WarStory title="The pectinate muscle that wasn’t"
        mistake="Calling a mass at the tip of the appendage a ‘pectinate muscle’ after imaging it in one plane."
        burn="Every angle, every lobe, every time. If you cannot call it a muscle in two planes, it is a thrombus.">
        <p className="cs-p">A quick pre-procedure TOE at 0° only. “Prominent pectinates.” As the access sheath entered the appendage, the patient’s pupils became unequal on the table. The thrombus had been pushed out by the sheath; a basilar artery occlusion. Thrombectomy saved his life, not his swallowing.</p>
      </WarStory>
      <Decision id="mm-thr" question="Which view is the classic one that is skipped and hides a thrombus in the lobe tip?"
        options={[
          { id: 'all', label: 'Any of them — you need 0°, 45°, 90° and 135° (and often 3D or a delayed-phase CT); lobes and tips hide in single planes', verdict: 'best', points: 8, why: 'The appendage is a 3D structure with lobes in different planes.' },
          { id: 'one', label: 'Only 90° matters', verdict: 'wrong', points: 0, why: 'A single plane misses lobes that lie in another.' },
        ]} />
      <WarStory title="The high puncture"
        mistake="Crossing the septum high and anterior, then forcing a stiff sheath to reach the appendage."
        burn="For the appendage: low and posterior. If the sheath is not coaxial, change the curve or the puncture — never the force.">
        <p className="cs-p">A high puncture, “because that is where we cross for the MitraClip”. The sheath pointed at the left upper pulmonary vein. With torque and a firm push it reached the appendage — and went through it. Tamponade within minutes, autotransfused 1.2 litres, sternotomy to oversew the appendage. Survived.</p>
      </WarStory>
      <WarStory title="HAS-BLED 4 — so nothing"
        mistake="Reading a high HAS-BLED score as a reason to stop anticoagulation, without fixing the modifiable factors."
        burn="HAS-BLED is a to-do list. Stop the aspirin and the NSAID; control the pressure. Don’t stop the stroke prevention.">
        <p className="cs-p">A 76-year-old with AF, uncontrolled blood pressure, aspirin and naproxen. HAS-BLED 4: “too risky for a DOAC”. Nothing changed: the aspirin and naproxen continued, the pressure stayed at 170. Seven months later, a left MCA stroke from his appendage; aphasic in a nursing home. The things that made his bleeding risk high were the things nobody fixed.</p>
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
        <p className="cs-p" style={{ marginBottom: 0 }}><span className="cs-time">🏠 Day 11</span>Drain out on day 9, no re-accumulation. Hb 98 after IV iron. Clopidogrel restarted. He walks the corridor twice and asks when he can drive to church.</p>
      </div>
      <MultiSelect id="s12-home" question="His discharge plan?"
        items={[
          { id: 'dapt', label: 'Aspirin 75 mg + clopidogrel 75 mg with a PPI until the 6–12-week TOE or CT; then single antiplatelet', correct: true, why: 'Written down, with the date of the scan, so no one stops it early.' },
          { id: 'img', label: 'TOE or CT booked: device thrombus, leak, position', correct: true, why: 'The step-down follows the image.' },
          { id: 'iron', label: 'IV iron; Hb check in 2 weeks; GI follow-up', correct: true, why: 'He still has angiodysplasias.' },
          { id: 'card', label: 'A device card; the letter states “LAAO device in situ — no anticoagulation unless a specific indication”', correct: true, why: 'So the next doctor neither starts apixaban by reflex nor stops his antiplatelets.' },
          { id: 'echo', label: 'Echo before discharge: no effusion', correct: true, why: 'After a tamponade, a clean echo before he goes.' },
          { id: 'doac', label: 'Restart apixaban “for the AF”', correct: false, why: 'The whole point was to avoid it.' },
          { id: 'cure', label: 'Tell him the AF is cured', correct: false, why: 'He is still in AF; rate control continues.' },
        ]} />

      <div className="cs-h2">📝 Case quiz</div>
      <Quiz id="s12-quiz" items={[
        { q: 'About what proportion of thrombi in non-valvular AF form in the left atrial appendage?', options: ['10%', '50%', '90%', '100%'], answer: 2, why: 'The rest form in the atrial body — hence LAAO is not zero-risk.' },
        { q: 'A low LAA emptying velocity associated with smoke and thrombus is below about…', options: ['80 cm/s', '60 cm/s', '40 cm/s', '20 cm/s'], answer: 3, why: '< 20 cm/s.' },
        { q: 'His CHA₂DS₂-VA (hypertension, age 78, diabetes, prior stroke) is…', options: ['4', '5', '6', '7'], answer: 2, why: 'H1 + A₂ 2 + D1 + S₂ 2 = 6.' },
        { q: 'A high HAS-BLED score should primarily prompt…', options: ['Stopping anticoagulation', 'Correcting modifiable bleeding risk factors', 'Switching to aspirin', 'LAAO for everyone'], answer: 1, why: 'A to-do list, not a veto.' },
        { q: 'Which patient is NOT a candidate for LAAO as a substitute for anticoagulation?', options: ['AF with severe MR', 'AF with a TAVI', 'AF with moderate rheumatic mitral stenosis', 'AF with recurrent angiodysplasia bleeding'], answer: 2, why: '“Valvular” AF needs a VKA; the atrial body clots too.' },
        { q: 'The 2024 ESC class for percutaneous LAAO in AF with contraindications to long-term OAC is…', options: ['I', 'IIa', 'IIb', 'III'], answer: 2, why: 'IIb, level C — “may be considered”.' },
        { q: 'For an appendage, the transseptal puncture should be…', options: ['Superior and posterior', 'Inferior and posterior', 'Superior and anterior', 'Anywhere in the fossa'], answer: 1, why: 'Room to curve up into an anterior–superior appendage.' },
        { q: 'Max landing zone 22 mm. Predicted compression of a 27 mm Watchman FLX ≈', options: ['5%', '10%', '18%', '35%'], answer: 2, why: '1 − 22/27 ≈ 18.5% — within 10–30%.' },
        { q: 'PASS stands for…', options: ['Pressure, Angle, Size, Septum', 'Position, Anchor, Size, Seal', 'Puncture, Access, Sheath, Seal', 'Position, Angio, Shunt, Score'], answer: 1, why: 'Release only when all four are met.' },
        { q: 'Hypotension 4 hours after LAAO with a raised JVP and pulsus paradoxus 24 mmHg. First definitive treatment?', options: ['IV fluids alone', 'Pericardiocentesis', 'Noradrenaline', 'Intubation'], answer: 1, why: 'Drain it; fluids only bridge, and intubation before drainage can be fatal.' },
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
          <li className="cs-li">🫀 The appendage is a trabeculated cul-de-sac; in AF it quivers, flow falls below 20 cm/s and ~90% of AF clots form there.</li>
          <li className="cs-li">🧮 CHA₂DS₂-VA ≥ 2: anticoagulate (DOAC first). HAS-BLED is a to-do list of modifiable risks, not a veto.</li>
          <li className="cs-li">🚫 LAAO is for those who truly CANNOT take long-term anticoagulation — recurrent, serious, unfixable bleeding — not for “frail” or “high score”.</li>
          <li className="cs-li">🫁 “Non-valvular” means no moderate–severe mitral stenosis and no mechanical valve. Look at the mitral valve before you say it.</li>
          <li className="cs-li">📚 The evidence is honest but limited: non-inferior overall in trials of patients who could take OAC, less bleeding, perhaps a little less ischaemic protection; CLOSURE-AF was not non-inferior. ESC 2024: IIb, C.</li>
          <li className="cs-li">📐 Fill the atrium, measure at 0°, 45°, 90°, 135°; size to the largest diameter; FLX compression ~10–30%.</li>
          <li className="cs-li">🪡 Appendage puncture: inferior and posterior. MitraClip: superior and posterior.</li>
          <li className="cs-li">✅ PASS before release: Position, Anchor (tug), Size (compression), Seal.</li>
          <li className="cs-li">🚨 Hypotension after LAAO is tamponade until echo says otherwise: look at the neck, measure the pulsus, drain it.</li>
          <li className="cs-li">🧲 Antiplatelets until the image says the device is covered; device thrombus is the device’s own stroke.</li>
        </ol>
      </div>
      <Video id={V.amuletIde.id} title={V.amuletIde.title} />
      <CaseLibrary playlist={VALVE_PLAYLIST} start={VALVE_PLAYLIST_START} channels={VALVE_CHANNELS}>
        Keep going: more structural and valvular cases from the same teams.
      </CaseLibrary>
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const VALVE_12 = {
  title: 'Left atrial appendage occlusion · the bleeder who could not be anticoagulated · tamponade on the ward',
  short: 'Structural Heart · Case 12',
  patient: {
    name: 'Mr Samuel Adeyemi',
    meta: '78 M · MRN 5512-0912 · 74 kg',
    flags: [
      { text: 'Permanent AF · CHA₂DS₂-VA 6', tone: 'red' },
      { text: '3 GI bleeds / 11 months', tone: 'red' },
      { text: 'Prior stroke', tone: 'amber' },
      { text: 'Apixaban on hold', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 60, limit: 160, basis: 'volume/eGFR ≤ 3.7' },
  clock0: min(3, 20),
  vitals0: { hr: 112, sys: 92, dia: 54, spo2: 96, rr: 22, st: 0, rhythm: 'af' },
  brand: { icon: '🫀', line: 'Structural Heart · Case 12' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / IM', tone: 'cyan' },
      { text: 'Structural · LAAO', tone: 'red' },
      { text: 'ESC 2024 AF-aligned', tone: 'plain' },
    ],
    lines: [
      { text: 'Close the', style: 'outline' },
      { text: 'cul-de-sac', style: 'grad' },
      { text: '& the quiet effusion', style: 'cyan' },
    ],
    hook: (
      <>
        A retired railway engineer with a stroke behind him and a CHA₂DS₂-VA of 6 bleeds for the <b>third time</b> in a year — on a DOAC that he cannot live without, and cannot live with.
        You will measure why his appendage makes clots, weigh stroke against bleeding with the evidence <span className="g">as it really is</span>, size a device at four angles, cross the septum low and posterior, and release only when it PASSes —
        then meet the hypotension at <span className="r">17:50</span> that everyone calls a GI bleed.
      </>
    ),
    image: null,
    sims: 's4',
    crisis: 's9',
    cards: [
      { k: 'The patient', t: 'Mr Samuel Adeyemi, 78 — permanent AF, prior stroke, diffuse small-bowel angiodysplasia.' },
      { k: 'Your role', t: 'Resus bay, the AF heart team, the structural lab and the ward that evening.' },
      { k: 'In your hands', t: 'LAA Doppler, risk scores, morphology, 4-angle TOE sizing, the septal needle, PASS with a tug test, the arterial line and a pericardial needle.' },
      { k: 'How it teaches', t: 'Every rule anchored to the body, every device choice to a contrast — and seven patients who paid for the rules.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'The third bleed', Component: Presentation,
      pill: '🩸 03:20 — melaena on apixaban, again',
      lede: 'Resuscitate the bleed — then see the problem behind it.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 112, sys: 92, dia: 54, spo2: 96, rr: 22, rhythm: 'af' }); atLeastClock(min(3, 20)); } },
    { id: 's2', icon: '📏', nav: 'The Appendage & the Risk', title: 'Why the appendage clots — and how much risk', Component: Investigation,
      pill: '🎯 Measure the flow, build the scores',
      lede: 'LAA emptying velocity on TOE, CHA₂DS₂-VA and HAS-BLED by hand, and what “non-valvular” really means.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 84, sys: 124, dia: 70, spo2: 97, rr: 16, rhythm: 'af' }); atLeastClock(min(34, 0)); } },
    { id: 's3', icon: '👥', nav: 'Heart Team', title: 'Can he be anticoagulated?', Component: HeartTeam,
      pill: '⚖️ Day 4 — stroke vs bleeding, honestly',
      lede: 'A contraindication vs a worry, the trials as they are, and the question he asks.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 78, sys: 132, dia: 74, spo2: 97, rhythm: 'af' }); atLeastClock(min(83, 0)); } },
    { id: 's4', icon: '🧮', nav: 'Planning & Sizing', title: 'Morphology, four angles, one device', Component: Planning,
      pill: '📐 Chicken wing, 22 mm, 27 mm device',
      lede: 'Name the shape, measure the mouth at four angles, size to the largest, fill the atrium first.',
      enter: ({ atLeastClock }) => atLeastClock(min(105, 0)) },
    { id: 's5', icon: '🩸', nav: 'Set-up', title: 'Set-up in the structural lab', Component: Setup,
      pill: '🧷 Day 8 — the kit for the worst case in the room',
      lede: 'Checklist, sequence — and why the appendage wall tears.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 76, sys: 128, dia: 72, spo2: 98, rhythm: 'af' }); atLeastClock(min(199, 30)); } },
    { id: 's6', icon: '🎬', nav: 'Choose Your Path', title: 'Strategy: device, sheath, tug and leak', Component: Strategy,
      pill: '🔀 Four forks in the road',
      lede: 'What you will do when the anatomy, the sheath or the device does not behave.',
      enter: ({ atLeastClock }) => atLeastClock(min(200, 0)) },
    { id: 's7', icon: '🛠️', nav: 'The Procedure', title: 'Cross, deploy, PASS, release', Component: Procedure,
      pill: '🛟 Low and posterior · then PASS',
      lede: 'The septum, the device, the four criteria — and the last look for fluid.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 74, sys: 112, dia: 62, spo2: 99, rhythm: 'af' }); atLeastClock(min(200, 45)); } },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit', Component: Recovery,
      pill: '💊 Antiplatelets until it is covered',
      lede: 'Bed 12: the regimen, the watch list and the scan that decides the step-down.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 76, sys: 124, dia: 70, spo2: 97, rr: 16, rhythm: 'af' }); atLeastClock(min(205, 30)); } },
    { id: 's9', icon: '🚨', nav: 'The Crisis', title: '17:50 — “he’s bleeding again”', Component: Crisis,
      pill: '🌀 Hypotension, a high JVP, a falling pressure on every breath',
      lede: 'Tell tamponade from a GI rebleed, measure the pulsus, drain the pericardium.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 124, sys: 88, dia: 58, spo2: 94, rr: 24, rhythm: 'af' }); atLeastClock(min(209, 50)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why',
      lede: 'The appendage spiral, the tamponade spiral and the bleeder’s spiral.',
      enter: ({ setVitals }) => setVitals({ hr: 86, sys: 120, dia: 68, spo2: 97, rr: 16, rhythm: 'af' }) },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for',
      lede: 'Seven patients who taught these rules.' },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home',
      lede: 'His plan, the quiz — then your score.' },
  ],
};

export default function Valve12({ onClose }) {
  return <CaseShell def={VALVE_12} onClose={onClose} />;
}
