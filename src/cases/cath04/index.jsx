import React from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Quiz, Video,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_CHANNELS } from '../valveMedia.js';
import {
  LabMap, AccessKit, FrenchSizer, CatheterGallery, EngageSim, TransducerSim, WireAnatomy, WireBench,
  BalloonStent, BalloonSim, BurrSizer, ImagingPhysiology, SupportDevices, ClosureDevices,
} from './sims.jsx';
import './tb.css';

/* ============================================================
   CATH LAB · CASE 04
   The toolbox: every wire, catheter and device in the cath lab
   — and why each one exists.

   A 71-year-old with refractory angina and a heavily calcified
   mid-LAD lesion, treated from the right radial artery with
   intravascular imaging, rotational atherectomy and a
   drug-eluting stent. Each tool is met at the moment the
   procedure needs it, drawn, and handled in a simulator that
   teaches the number that matters. The crisis — a distal wire
   perforation from a polymer-jacketed wire — is solved with the
   bail-out drawer.

   Device figures are typical published values for current
   devices; check each product's instructions for use.
   Clinical frame: ESC 2024 CCS; EAPCI consensus on calcified
   lesions and rotational atherectomy; SCAI/EAPCI radial access.
   ============================================================ */

const min = (h, m) => h * 60 + m;
const TEST = typeof window !== 'undefined' && !!window.__vhTest;
function D({ id, options, children, ...rest }) {
  const k = [...id].reduce((n, c) => n + c.charCodeAt(0), 0) % options.length;
  const rot = options.slice(k).concat(options.slice(0, k));
  const best = options.find(o => o.verdict === 'best');
  return <Decision id={id} options={rot} {...rest}>{children}{TEST && best && <span hidden data-best={best.label} />}</Decision>;
}
function MS({ items, ...rest }) {
  return <MultiSelect items={items} {...rest}>{TEST && <span hidden data-correct={JSON.stringify(items.filter(i => i.correct).map(i => i.label))} />}</MultiSelect>;
}
function Table({ head, rows }) {
  return (
    <div className="cs-scroll">
      <table className="cs-table">
        <thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/* ============================================================
   1 · THE ROOM
   ============================================================ */

function Room() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">📋 08:00</span>Mr Ibrahim Saad, 71, a retired engineer, has CCS class III angina despite three anti-anginal drugs. CT and angiography: a <b>heavily calcified 85% mid-LAD stenosis</b> (360° calcium on CT), LVEF 50%, eGFR 55. The heart team recommends PCI with intravascular imaging and calcium modification.</p>
        <p className="cs-p"><span className="cs-time">🧑‍⚕️ Today</span>You are the new fellow. The consultant says: “Before you touch anything, I want you to know what every tool in this room is for — and what it does when it goes wrong.”</p>
      </div>
      <h2 className="cs-h2">🗺️ The room</h2>
      <LabMap />
      <Why title="☢️ Why the lab is laid out around one point" chain={[
        { k: 'ISOCENTRE', t: 'The C-arm rotates around a fixed point placed on the heart' },
        { k: 'SCATTER', t: 'X-rays scatter off the patient, mostly on the tube side' },
        { k: 'INVERSE SQUARE', t: 'Dose falls with the square of the distance' },
        { k: 'LAYOUT', t: 'Shields between you and the patient; monitors where you look without turning' },
      ]} />
      <MS id="s1-check" question="✅ The pre-procedure time-out — what must be confirmed before the first needle?"
        items={[
          { id: 'a', label: 'Identity, consent, the procedure and the access site', correct: true },
          { id: 'b', label: 'Allergies (contrast, latex, heparin/HIT) and anticoagulant status', correct: true },
          { id: 'c', label: 'Kidney function and a contrast budget', correct: true },
          { id: 'd', label: 'Specialist kit available: rotablator console, IVUS, covered stents, coils, pericardiocentesis set', correct: true, why: 'In a perforation, the time is spent finding the kit.' },
          { id: 'e', label: 'Defibrillator pads on the patient for rotablation', correct: true },
          { id: 'f', label: 'That the consultant will stay in the control room', correct: false },
        ]} />
      <Contrast title="the scrub table vs the bail-out drawer"
        is={{ h: '🧰 On the table', points: ['Sheath, wires, diagnostic and guide catheters', 'Manifold, transducer, contrast, saline', 'Balloons, stents and the inflator for this lesion', 'Opened as needed'] }}
        isnt={{ h: '🚨 In the bail-out drawer', points: ['Covered stents, coils, embolisation material', 'Snares and retrieval baskets', 'Pericardiocentesis set, temporary pacing wire', 'Located BEFORE the case — never opened in panic'] }} />
    </>
  );
}

/* ============================================================
   2 · ACCESS
   ============================================================ */

function Access() {
  return (
    <>
      <AccessKit />
      <Table head={['Unit', 'Means', 'Remember']} rows={[
        ['French (Fr)', 'Outer diameter in thirds of a millimetre', '6 Fr catheter = 2.0 mm across'],
        ['Gauge (G)', 'Needle size — the higher the number, the thinner', '21 G ≈ 0.8 mm · 18 G ≈ 1.3 mm'],
        ['Inches (")', 'Wire and lumen diameters', '0.014" coronary · 0.035" access · 0.070" = 6 Fr guide lumen'],
        ['Sheath size', 'The largest catheter it accepts (inner lumen)', 'Its outer wall is ~0.5–0.6 mm bigger'],
      ]} />
      <h2 className="cs-h2">📐 Sheath vs artery</h2>
      <FrenchSizer id="s2-sheath" artery={2.3} need={6} />
      <Why title="🩸 Why a too-big sheath occludes the radial artery" chain={[
        { k: 'STRETCH', t: 'A sheath wider than the artery stretches and injures the wall' },
        { k: 'SPASM', t: 'Smooth muscle grips the sheath — pain, catecholamines, more spasm' },
        { k: 'STASIS', t: 'Flow around it stops; the damaged wall is thrombogenic' },
        { k: 'OCCLUSION', t: 'Radial artery occlusion — usually silent, but the route is lost' },
      ]}>Prevention: the smallest outer diameter that does the job, heparin, a vasodilator cocktail, and patent haemostasis at the end.</Why>
      <Contrast title="radial vs femoral access"
        is={{ h: '✋ Radial', points: ['Lower bleeding and vascular complications', 'Lower mortality in ACS (MATRIX, RIVAL)', 'Spasm, loops and tortuosity limit size and support', 'Default for most coronary procedures'] }}
        isnt={{ h: '🦵 Femoral', points: ['Large bore: 8 Fr guides, Impella, TAVI', 'Puncture over the femoral head — below the inferior epigastric, above the bifurcation', 'Retroperitoneal bleeding when punctured high', 'Ultrasound and fluoroscopic guidance + micropuncture'] }} />
      <D id="s2-fem" question="If you needed femoral access, where should the needle enter the artery?"
        options={[
          { id: 'a', label: 'Common femoral artery over the middle of the femoral head (fluoroscopy), with ultrasound and a micropuncture needle', verdict: 'best', points: 10, why: 'Over the head the artery can be compressed against bone; above the inguinal ligament bleeds into the retroperitoneum; below the bifurcation risks pseudoaneurysm and AV fistula.' },
          { id: 'b', label: 'At the skin crease', verdict: 'wrong', points: 0, why: 'The skin crease is often below the bifurcation — especially in obese patients.' },
          { id: 'c', label: 'As high as possible to avoid the bifurcation', verdict: 'wrong', points: 0, why: 'Above the inguinal ligament = retroperitoneal haemorrhage.' },
        ]} />
    </>
  );
}

/* ============================================================
   3 · STRATEGY
   ============================================================ */

function Strategy() {
  return (
    <>
      <D id="s3-why-rota" question="360° calcium on CT. Why not just put a stent in?"
        options={[
          { id: 'a', label: 'A ring of calcium will not let a balloon or stent expand — an underexpanded stent thromboses and restenoses; modify the calcium first', verdict: 'best', points: 10, why: 'Stent underexpansion is the strongest predictor of stent failure, and it cannot be fixed afterwards.' },
          { id: 'b', label: 'Calcium makes stents shorter', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'Stenting is fine if you use a high-pressure deployment', verdict: 'ok', points: 2, why: 'High pressure against an intact ring risks rupture and still underexpands.' },
        ]} />
      <Table head={['Calcium tool', 'How it works', 'Best for']} rows={[
        ['Non-compliant / OPN balloon', 'Very high pressure, minimal growth', 'Moderate calcium after a balloon crosses'],
        ['Cutting / scoring balloon', 'Blades or wires focus force into cracks', 'Fibrocalcific rings, in-stent restenosis'],
        ['Intravascular lithotripsy (IVL)', 'Sonic pressure waves crack deep and superficial calcium', 'Deep or eccentric calcium; underexpanded stents'],
        ['Rotational atherectomy', 'Diamond burr ablates superficial calcium at 140–180k rpm', 'Lesions a balloon cannot cross or dilate'],
        ['Orbital atherectomy / laser', 'Eccentric crown sanding / photoablation', 'Selected calcium; laser for stent underexpansion'],
      ]} />
      <D id="s3-guide" question="Which guide for a calcified mid-LAD from the right radial with a 6 Fr sheath?"
        options={[
          { id: 'a', label: '6 Fr EBU / XB 3.5 — passive support from the opposite aortic wall, lumen big enough for a 1.5 mm burr', verdict: 'best', points: 10 },
          { id: 'b', label: '6 Fr JR 4', verdict: 'wrong', points: 0, why: 'A right coronary shape.' },
          { id: 'c', label: '5 Fr diagnostic JL 3.5', verdict: 'wrong', points: 0, why: 'Diagnostic catheters have thick walls and small lumens — no room or support for devices.' },
        ]} />
      <Sequence id="s3-order" question="🗂️ Put the procedure in order"
        steps={[
          { label: 'Radial access, heparin, guide engaged in the left main' },
          { label: 'Workhorse wire to the distal LAD, IVUS run' },
          { label: 'Microcatheter → exchange for the RotaWire → rotational atherectomy' },
          { label: 'Balloon pre-dilatation, then the drug-eluting stent' },
          { label: 'Non-compliant post-dilatation, final IVUS, closure' },
        ]} />
    </>
  );
}

/* ============================================================
   4 · CATHETERS
   ============================================================ */

function Catheters() {
  return (
    <>
      <p className="cs-p">Every catheter shape solves one geometry problem: reaching an ostium from where the catheter enters the aorta. Tap each curve.</p>
      <CatheterGallery />
      <EngageSim id="s4-engage" />
      <Why title="🏗️ Why some guides give more support" chain={[
        { k: 'FORCE', t: 'Pushing a device forward pushes the guide backward' },
        { k: 'BRACE', t: 'A guide resting on the opposite aortic wall (EBU, AL) braces against that force' },
        { k: 'COAXIAL', t: 'Coaxial alignment transmits the push down the vessel, not into the wall' },
        { k: 'RESULT', t: 'Device crosses — or the guide backs out of the ostium' },
      ]} />
      <Contrast title="passive vs active support"
        is={{ h: '🪑 Passive support', points: ['From the catheter’s shape and stiffness', 'EBU/XB, AL, bigger French', 'Safe, nothing deep in the artery', 'First choice'] }}
        isnt={{ h: '💪 Active support', points: ['Deep-seating the guide, buddy wires, anchoring balloons', 'Guide extensions (mother-in-child)', 'Powerful but can dissect the ostium', 'Used when passive support fails'] }} />
      <D id="s4-gx" question="The stent will not pass a calcified bend even after rotablation. Next tool?"
        options={[
          { id: 'a', label: 'A guide extension (GuideLiner/Telescope) advanced over the wire beyond the bend, or a buddy wire', verdict: 'best', points: 10, why: 'Extends the guide’s lumen deeper and straightens the path for the stent.' },
          { id: 'b', label: 'Push harder', verdict: 'wrong', points: 0, why: 'The stent can be stripped off the balloon — a lost stent.' },
          { id: 'c', label: 'Change to a longer stent', verdict: 'wrong', points: 0 },
        ]} />
    </>
  );
}

/* ============================================================
   5 · SET-UP: HAEMODYNAMICS & ANTICOAGULATION
   ============================================================ */

function Setup() {
  return (
    <>
      <p className="cs-p">The guide is in the left main. Before any injection the pressure trace must be true.</p>
      <TransducerSim id="s5-transducer" />
      <Sequence id="s5-manifold" question="💧 Preparing the manifold — the safe order"
        steps={[
          { label: 'Connect pressure, contrast and flush lines; all taps closed to the patient' },
          { label: 'Flush every port with saline, tapping out bubbles' },
          { label: 'Zero the transducer to air at the phlebostatic axis' },
          { label: 'Connect to the catheter: aspirate back-bleed, then flush' },
          { label: 'Check the waveform before the first injection, syringe tilted handle-up' },
        ]} />
      <D id="s5-hep" question="Heparin for PCI with no other anticoagulant on board?"
        options={[
          { id: 'a', label: 'Unfractionated heparin 70–100 IU/kg, then check the ACT (about 250–300 s, device-dependent) and re-dose in long cases', verdict: 'best', points: 10 },
          { id: 'b', label: '5,000 IU whatever the weight, no ACT', verdict: 'ok', points: 3, why: 'Common for diagnostic radial cases; for long rotablation PCI, measure.' },
          { id: 'c', label: 'No heparin — calcium is not thrombotic', verdict: 'wrong', points: 0, why: 'Guides, wires and burrs are foreign surfaces: they clot without heparin.' },
        ]} />
      <Note kind="warn" title="🫧 Air">
        A few millilitres of air in the left main can cause ST elevation, hypotension and VF. Aspirate after every connection, keep the syringe handle-up, and never inject a damped catheter.
      </Note>
    </>
  );
}

/* ============================================================
   6 · WIRES
   ============================================================ */

function Wires() {
  return (
    <>
      <WireAnatomy />
      <Why title="🔩 Why tip load decides what a wire does" chain={[
        { k: 'FORCE', t: 'Tip load = force (g) needed to bend the tip' },
        { k: 'AREA', t: 'Tapered tips (0.009–0.011") concentrate that force' },
        { k: 'PRESSURE', t: 'Penetration force ∝ tip load ÷ tip area' },
        { k: 'BEHAVIOUR', t: 'Low: follows the lumen, deflects off walls · High: punctures caps — and vessel walls' },
      ]} />
      <WireBench id="s6-bench" />
      <Contrast title="hydrophilic vs hydrophobic coating"
        is={{ h: '💧 Hydrophilic / polymer jacket', points: ['Slippery when wet, low friction', 'Crosses tortuosity and microchannels', 'Less tactile feedback', 'Finds subintimal planes and small branches — perforation risk distally'] }}
        isnt={{ h: '🧲 Hydrophobic (silicone/PTFE)', points: ['More friction, more “feel”', 'Better control and tip shaping', 'Less likely to dive into side branches', 'Often the workhorse coil-tip wires'] }} />
      <D id="s6-park" question="You crossed the lesion with a polymer-jacketed wire. Before running devices, what do you do with it?"
        options={[
          { id: 'a', label: 'Exchange it through a microcatheter for a workhorse wire, and watch the distal tip on every device run', verdict: 'best', points: 10, why: 'Slippery jacketed wires migrate distally into small branches as devices are pushed — the classic distal perforation.' },
          { id: 'b', label: 'Leave it — it crossed, so it is the best wire', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'Pull it back into the proximal vessel', verdict: 'wrong', points: 0, why: 'You lose wire position across the lesion.' },
        ]} />
    </>
  );
}

/* ============================================================
   7 · THE PROCEDURE — devices
   ============================================================ */

function Devices() {
  return (
    <>
      <h2 className="cs-h2">🔬 First look inside</h2>
      <ImagingPhysiology />
      <p className="cs-p">IVUS: a 360° superficial calcium arc, 3.0 mm distal reference, the IVUS catheter itself barely crosses. Plan: rotational atherectomy.</p>
      <h2 className="cs-h2">⚙️ The burr</h2>
      <Note kind="pearl" title="🔁 Getting onto the RotaWire">The burr runs only on its own 0.009" RotaWire. A microcatheter (Corsair, Finecross) is advanced over the workhorse wire past the lesion, the workhorse is removed, and the RotaWire goes in through the microcatheter.</Note>
      <BurrSizer id="s7-burr" artery={3.0} guideFr={6} />
      <h2 className="cs-h2">🎈 Balloons & the stent</h2>
      <BalloonStent />
      <Contrast title="semi-compliant vs non-compliant balloons"
        is={{ h: '🎈 Semi-compliant', points: ['Grows ~0.4–0.5 mm from nominal to rated burst', 'Pre-dilatation, crossing', 'Conforms; dogbones at the edges at high pressure', 'Lower rated burst pressure'] }}
        isnt={{ h: '🧱 Non-compliant', points: ['Grows ~0.1 mm across its range', 'Post-dilatation inside stents', 'Delivers high pressure exactly where placed', 'Higher rated burst pressure (≈ 18–22 atm)'] }} />
      <p className="cs-p">The 3.0 × 28 mm DES is deployed. IVUS: underexpanded in the calcified segment; target lumen 3.55 mm.</p>
      <BalloonSim id="s7-nc" type="nc" target={3.55} prompt="Post-dilate the stent to 3.55 mm with the 3.5 mm non-compliant balloon — read the compliance chart, stay at or below rated burst pressure." />
      <D id="s7-final" question="Final IVUS: minimum stent area 90% of the distal reference lumen, no edge dissection. Next?"
        options={[
          { id: 'a', label: 'Accept — expansion criterion met; final angiogram in two views and remove the wire under screening', verdict: 'best', points: 10 },
          { id: 'b', label: 'Another inflation at 24 atm to be sure', verdict: 'wrong', points: 0, why: 'Above rated burst pressure, for no gain.' },
          { id: 'c', label: 'Add a second stent', verdict: 'wrong', points: 0 },
        ]} />
    </>
  );
}

/* ============================================================
   8 · CLOSURE & SUPPORT
   ============================================================ */

function Closure() {
  return (
    <>
      <ClosureDevices />
      <D id="s8-tr" question="The radial band is on. How do you manage it?"
        options={[
          { id: 'a', label: 'Patent haemostasis: the minimum air volume that stops bleeding with a preserved distal pleth; deflate gradually over ~2 hours', verdict: 'best', points: 10, why: 'Occlusive compression doubles the risk of radial artery occlusion.' },
          { id: 'b', label: 'Maximum inflation for 6 hours', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'Remove it after 15 minutes', verdict: 'wrong', points: 0 },
        ]} />
      <h2 className="cs-h2">🫀 When the heart needs help</h2>
      <SupportDevices />
      <Table head={['Device', 'Support', 'Evidence in AMI shock', 'Main harms']} rows={[
        ['IABP', '~0.5 L/min, diastolic augmentation', 'IABP-SHOCK II: no mortality benefit', 'Limb ischaemia (small)'],
        ['Impella CP', '~3.5–4 L/min, LV unloading', 'DanGer Shock (2024): lower mortality in selected STEMI shock', 'Bleeding, limb ischaemia, haemolysis, renal replacement'],
        ['VA-ECMO', 'Full flow + oxygenation', 'ECLS-SHOCK (2023): no mortality benefit, more bleeding', 'Bleeding, limb ischaemia, LV distension'],
      ]} />
      <D id="s8-iabp" question="When does the IABP balloon inflate?"
        options={[
          { id: 'a', label: 'At the dicrotic notch (aortic valve closure), deflating just before the next systole', verdict: 'best', points: 10, why: 'Diastolic inflation raises coronary perfusion pressure; pre-systolic deflation lowers afterload.' },
          { id: 'b', label: 'During systole', verdict: 'wrong', points: 0, why: 'Inflating against ejection raises afterload — harmful.' },
          { id: 'c', label: 'Continuously', verdict: 'wrong', points: 0 },
        ]} />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — the wire went too far
   ============================================================ */

function Crisis() {
  const { answers, setVitals } = useCase();
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🚨 10:42</span>Final angiogram: a jet of contrast from a tiny distal LAD branch, staining and spreading — the polymer-jacketed wire used early on had been left in and migrated distally as the stent was pushed. <b>Ellis III distal wire perforation.</b> Two minutes later: BP 84/50, HR 118, he feels faint.</p>
      </div>
      <BedsideMonitor />
      <D id="s9-first" question="⏱️ First action?"
        onAnswer={o => setVitals(o.id === 'a' ? { hr: 108, sys: 96, dia: 58 } : { hr: 128, sys: 70, dia: 40 })}
        options={[
          { id: 'a', label: 'Inflate a balloon at low pressure proximal to the perforating branch to stop the leak; call for echo and the pericardiocentesis set', verdict: 'best', points: 10, why: 'Stop the bleeding mechanically first — everything else is done behind a closed balloon.' },
          { id: 'b', label: 'Give protamine and wait', verdict: 'wrong', points: 0, why: 'Reversal alone does not seal an Ellis III leak, and it risks thrombosis of the fresh stent.' },
          { id: 'c', label: 'Pull the wire out and inject again', verdict: 'wrong', points: 0, why: 'Never lose wire position in a perforation — you need it for every fix.' },
        ]} />
      {answers['s9-first'] && <BalloonSim id="s9-occlude" type="sc" target={2.9} prompt="Occlude the LAD just proximal to the branch: a 3.0 mm semi-compliant balloon matched to the 2.9 mm vessel — enough to stop flow, not enough to dissect." />}
      <MS id="s9-kit" question="🧰 From the bail-out drawer — what will you use for a distal small-branch perforation?"
        items={[
          { id: 'a', label: 'A microcatheter to the perforating branch', correct: true, why: 'The delivery route for everything below.' },
          { id: 'b', label: 'Coils, or autologous fat / thrombin / beads delivered through the microcatheter', correct: true, why: 'Embolise the tiny branch — sacrificing it saves the patient.' },
          { id: 'c', label: 'Echo and a pericardiocentesis set (drain the tamponade)', correct: true },
          { id: 'd', label: 'A covered stent in the distal branch', correct: false, why: 'Covered stents are for large-vessel perforations; a tiny distal branch is embolised.' },
          { id: 'e', label: 'A larger stent to “seal” the leak', correct: false },
        ]} />
      <D id="s9-prot" question="Heparin reversal?"
        options={[
          { id: 'a', label: 'Consider protamine only if bleeding continues after mechanical sealing, weighing the risk of acute stent thrombosis — never before the fix is in place', verdict: 'best', points: 10 },
          { id: 'b', label: 'Full protamine immediately, routinely', verdict: 'ok', points: 3, why: 'Some operators do — but the fresh stent may thrombose; mechanical sealing comes first.' },
          { id: 'c', label: 'More heparin to keep the stent open', verdict: 'wrong', points: 0 },
        ]} />
    </>
  );
}

/* ============================================================
   10 · THE VICIOUS CYCLE
   ============================================================ */

function Cycles() {
  return (
    <>
      <ViciousCycle id="cyc-tamponade" title="🔁 Tamponade from a wire perforation"
        nodes={[
          { t: 'Blood leaks into the pericardium', short: 'Leak', d: 'Arterial pressure drives blood out with every beat.' },
          { t: 'Pericardial pressure rises', short: 'Pressure', d: 'The stiff pericardium cannot stretch quickly.' },
          { t: 'RV and RA collapse in diastole', short: 'Filling ↓', d: 'Venous return cannot enter the heart.' },
          { t: 'Cardiac output and BP fall', short: 'BP ↓', d: 'Coronary perfusion pressure falls too.' },
          { t: 'Ischaemia, arrhythmia, PEA arrest', short: 'Arrest', d: 'Within minutes if undrained.' },
        ]}
        breaks={[
          { at: 0, t: 'Balloon occlusion, then coil/fat embolisation through a microcatheter.' },
          { at: 1, t: 'Pericardiocentesis — autotransfuse the blood if needed.' },
          { at: 3, t: 'Fluids and vasopressors buy minutes only.' },
        ]} />
      <ViciousCycle id="cyc-spasm" title="🔁 Radial spasm"
        nodes={[
          { t: 'Oversized sheath or catheter, many exchanges', short: 'Trauma', d: 'Wall stretch and friction.' },
          { t: 'Pain', short: 'Pain', d: 'An awake, anxious patient.' },
          { t: 'Catecholamine surge', short: 'Adrenaline', d: 'α-receptors on radial smooth muscle.' },
          { t: 'Spasm grips the catheter', short: 'Spasm', d: 'More friction, more pain.' },
          { t: 'Forced withdrawal → avulsion, occlusion', short: 'Injury', d: 'The worst outcome is pulling against spasm.' },
        ]}
        breaks={[
          { at: 0, t: 'Smallest outer diameter, hydrophilic sheath, fewer exchanges.' },
          { at: 1, t: 'Local anaesthetic and sedation.' },
          { at: 3, t: 'Intra-arterial verapamil/nitrate; wait — never pull against spasm.' },
        ]} />
      <D id="cyc-q" question="A catheter will not come out of a spasming radial artery. Correct move?"
        options={[
          { id: 'a', label: 'Stop pulling: more sedation and analgesia, intra-arterial vasodilators, warm the arm, wait — general anaesthesia or a nerve block if it persists', verdict: 'best', points: 10 },
          { id: 'b', label: 'A firm, steady pull', verdict: 'wrong', points: 0, why: 'This is how the radial artery is avulsed.' },
          { id: 'c', label: 'Cut the catheter at the skin', verdict: 'wrong', points: 0 },
        ]} />
    </>
  );
}

/* ============================================================
   11 · M&M
   ============================================================ */

function WarStories() {
  return (
    <>
      <WarStory title="⚰️ The wire nobody watched"
        mistake="A polymer-jacketed wire was left in after crossing and drifted distally while stents were pushed; the distal tip was off screen."
        burn="Keep the distal wire tip on the screen on every device run. Swap jacketed wires for a workhorse after crossing.">
        <p className="cs-p">A distal perforation was seen only on the final run, 40 minutes after it began. Tamponade, PEA arrest, a pericardiocentesis during CPR and emergency surgery. He died on day 3 of multi-organ failure.</p>
      </WarStory>
      <D id="mm-1" question="Which habit prevents this?"
        options={[
          { id: 'a', label: 'Distal wire tip on screen during every advance; workhorse wire for device delivery', verdict: 'best', points: 10 },
          { id: 'b', label: 'Using longer wires', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'Less contrast', verdict: 'wrong', points: 0 },
        ]} />
      <WarStory title="🫧 The manifold nobody flushed"
        mistake="A new contrast syringe was connected and injected without aspirating; a column of air went down the left main."
        burn="Every connection: aspirate, flush, syringe handle-up, look before you inject.">
        <p className="cs-p">ST elevation, hypotension, then VF. Two shocks, high-flow oxygen and repeated saline flushes; she survived — a near-death from a syringe.</p>
      </WarStory>
      <WarStory title="💥 The burr that would not come back"
        mistake="An oversized burr (ratio 0.75) pushed hard through a long calcified segment; decelerations ignored."
        burn="Start small (ratio 0.4–0.6), peck, never push, keep runs short and the rpm drop under ~5,000.">
        <p className="cs-p">The burr passed the lesion and was trapped behind it (“Kokeshi” entrapment). Attempts to pull it back dissected the vessel; the patient went to emergency surgery with an anterior STEMI and survived with an EF of 30%.</p>
      </WarStory>
      <D id="mm-3" question="Which ratio and technique avoid burr entrapment?"
        options={[
          { id: 'a', label: 'Burr:artery 0.4–0.6, pecking advance, short runs, avoid large decelerations', verdict: 'best', points: 10 },
          { id: 'b', label: 'Largest burr that fits the guide', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'Long continuous runs', verdict: 'wrong', points: 0 },
        ]} />
      <WarStory title="🪓 The Amplatz that went too deep"
        mistake="An AL guide was deep-seated into the RCA for support and torqued; nobody watched the ostium."
        burn="Amplatz and deep-seated guides dissect ostia. Disengage gently by advancing first, and watch the trace for damping.">
        <p className="cs-p">A spiral dissection from the RCA ostium into the aortic root. Complete heart block, shock, bail-out stenting and two days of pacing. She survived.</p>
      </WarStory>
      <WarStory title="🩸 The balloon above its rated burst"
        mistake="A semi-compliant balloon taken to 24 atm (RBP 16) “to crack the calcium”."
        burn="Rated burst pressure is a promise only up to that number. Above it, use the right tool — NC, OPN, IVL or rotablation.">
        <p className="cs-p">The balloon ruptured with a pinhole jet that dissected the LAD; a covered stent was needed for the perforation that followed. He lived — with a sacrificed diagonal and a peri-procedural MI.</p>
      </WarStory>
      <D id="mm-5" question="What does the rated burst pressure (RBP) mean?"
        options={[
          { id: 'a', label: 'At RBP, 99.9% of balloons survive (95% confidence) — above it, rupture risk climbs steeply', verdict: 'best', points: 10 },
          { id: 'b', label: 'The pressure at which the balloon always bursts', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'The ideal working pressure', verdict: 'wrong', points: 0, why: 'That is closer to nominal.' },
        ]} />
    </>
  );
}

/* ============================================================
   12 · DEBRIEF
   ============================================================ */

function Debrief() {
  const { totals, def } = useCase();
  const pct = totals.max ? Math.round(totals.got / totals.max * 100) : 0;
  return (
    <>
      <MS id="s10-dc" question="🏠 Mr Saad recovered (the branch was coiled, 120 mL drained). Before he goes home:"
        items={[
          { id: 'a', label: 'Echo before discharge to confirm no re-accumulation', correct: true },
          { id: 'b', label: 'DAPT (aspirin + clopidogrel) for 6 months after PCI for chronic coronary syndrome, then single antiplatelet', correct: true },
          { id: 'c', label: 'Radial pulse and hand check; band removed with patent haemostasis', correct: true },
          { id: 'd', label: 'An honest account of the complication, documented', correct: true },
          { id: 'e', label: 'Stop the statin now the stent is in', correct: false },
        ]} />
      <h2 className="cs-h2">📝 Ten questions</h2>
      <Quiz id="s10-quiz" items={[
        { q: 'A 6 Fr catheter is about how wide?', options: ['0.6 mm', '2 mm', '6 mm', '1 mm'], answer: 1, why: 'French ÷ 3 = millimetres.' },
        { q: 'A 6 Fr sheath…', options: ['Has a 6 Fr outer diameter', 'Accepts a 6 Fr catheter — its outer diameter is larger', 'Is 6 mm wide', 'Only takes 5 Fr catheters'], answer: 1 },
        { q: 'JL 3.5 vs JL 5: the number is…', options: ['The French size', 'The length (cm) of the secondary curve — larger for wider aortic roots', 'The tip angle', 'The length of the catheter'], answer: 1 },
        { q: 'Best passive-support guide for LAD PCI:', options: ['JR 4', 'EBU / XB', 'Pigtail', 'IMA'], answer: 1 },
        { q: 'A transducer 10 cm below the heart reads…', options: ['~7 mmHg too high', '~7 mmHg too low', 'Correctly', '~20 mmHg too low'], answer: 0, why: '0.74 mmHg per cm.' },
        { q: 'An over-damped arterial trace…', options: ['Overestimates systolic', 'Underestimates systolic and looks blunt', 'Shows ringing', 'Is normal'], answer: 1 },
        { q: 'Which wire is designed to penetrate a hard CTO cap?', options: ['Sion Blue', 'Confianza Pro 12', 'J-tipped 0.035"', 'RotaWire Floppy'], answer: 1 },
        { q: 'A rotablator burr runs on…', options: ['Any 0.014" wire', 'Its own 0.009" RotaWire', 'A 0.035" wire', 'No wire'], answer: 1 },
        { q: 'A non-compliant balloon…', options: ['Grows a lot with pressure', 'Grows very little — used inside stents at high pressure', 'Has a low RBP', 'Is for crossing CTOs'], answer: 1 },
        { q: 'A distal small-branch wire perforation is usually sealed with…', options: ['A covered stent', 'Balloon occlusion then coils/fat via a microcatheter', 'Protamine alone', 'A bigger stent'], answer: 1 },
      ]} />
      <div className="cs-card">
        <h2 className="cs-h2" style={{ marginTop: 0 }}>🏆 Your score</h2>
        <p className="cs-p" style={{ fontSize: 20 }}><b className="cs-mono">{totals.got} / {totals.max}</b> · {pct}%</p>
        <Table head={['Stage', 'Points']} rows={def.stages.map(st => [st.title, `${totals.by[st.id]?.got || 0} / ${totals.by[st.id]?.max || 0}`])} />
      </div>
      <div className="cs-card">
        <h2 className="cs-h2" style={{ marginTop: 0 }}>🔥 Take home</h2>
        <ol className="cs-ul">
          <li className="cs-li">📏 French ÷ 3 = mm. A sheath is named by what it accepts; its outer wall is bigger — match it to the artery.</li>
          <li className="cs-li">🪝 JL numbers follow the aortic root: 3.5 small, 4 normal, 5 dilated. EBU for LAD/LCx support, AL with care.</li>
          <li className="cs-li">🩺 Diagnostic catheters see; guides deliver (thin braided wall, big lumen, support).</li>
          <li className="cs-li">📈 Level and zero at the phlebostatic axis; 1.5–2 oscillations after a flush; check the trace before every injection.</li>
          <li className="cs-li">🧵 Start soft (workhorse), escalate tip load only when needed; jacketed wires cross — then swap them out.</li>
          <li className="cs-li">⚙️ Burr:artery 0.4–0.6 on the RotaWire; 1.5 mm fits 6 Fr, 1.75 needs 7 Fr.</li>
          <li className="cs-li">🎈 Read the compliance chart: SC grows, NC does not; never above rated burst pressure.</li>
          <li className="cs-li">🔬 Image calcium, left main and long lesions; physiology for intermediate ones.</li>
          <li className="cs-li">🚨 Perforation: balloon first, keep the wire, embolise small branches, cover big ones, drain the pericardium.</li>
          <li className="cs-li">🩹 Patent haemostasis after radial; pre-close large-bore femoral access.</li>
        </ol>
      </div>
      <h2 className="cs-h2">🎬 Devices in real cases</h2>
      <div className="cs-media-row">
        <Video id="snXIsggQP1k" title="Coronary views, including AP cranial and AP caudal" />
        <Video id="Vhf-gob-miA" title="Coronary angiogram: LAO caudal (spider) view" />
      </div>
      <CaseLibrary title="📚 Cath lab case library" channels={[
        { name: 'CCC Live Cases', url: 'https://www.youtube.com/@CCCLiveCases', note: 'Live PCI: watch which guide, wire and device each step uses' },
        ...VALVE_CHANNELS.filter(c => !c.url.includes('playlist')),
      ]} />
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const CASE_04 = {
  title: 'The cath lab toolbox · Every wire, catheter and device · The wire nobody watched',
  short: 'Cath Lab · Case 04',
  patient: {
    name: 'Mr Ibrahim Saad',
    meta: '71 M · MRN 7730-4415 · 79 kg',
    flags: [
      { text: 'CCS III angina, 3 drugs', tone: 'amber' },
      { text: '360° calcified mid-LAD', tone: 'red' },
      { text: 'eGFR 55', tone: 'blue' },
      { text: 'Right radial 2.3 mm', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 150, limit: 200, basis: 'volume/eGFR ≤ 3.7' },
  clock0: min(8, 0),
  vitals0: { hr: 72, sys: 138, dia: 78, spo2: 97, rr: 14, st: 0 },
  brand: { icon: '🧰', line: 'Cath Lab · Case 04' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / IM', tone: 'cyan' },
      { text: '9 simulators · illustrated', tone: 'red' },
      { text: 'ESC 2024 CCS · EAPCI', tone: 'plain' },
    ],
    lines: [
      { text: 'Know every', style: 'outline' },
      { text: 'tool', style: 'grad' },
      { text: '& what it breaks', style: 'cyan' },
    ],
    hook: (
      <>
        Sheaths, guides, wires, balloons, burrs, stents, imaging, pumps and the bail-out drawer — each drawn, each in your hands.
        A calcified LAD that needs almost all of them, and a <span className="r">wire nobody watched</span>.
      </>
    ),
    image: '/images/cath-lab.webp',
    sims: 's4',
    crisis: 's9',
    cards: [
      { k: '👴 The patient', t: 'Mr Ibrahim Saad, 71 — refractory angina, heavily calcified mid-LAD, small radial artery.' },
      { k: '🧑‍⚕️ Your role', t: 'The new fellow: learn each tool, choose it, use it — then handle the complication.' },
      { k: '🧰 In your hands', t: 'Room map, sheath sizer, curve fitter, transducer, wire bench, burr sizer, two inflators.' },
      { k: '🧠 How it teaches', t: 'Each tool tied to the one number that matters — and to the patient it once hurt.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🗺️', nav: 'The Room', title: 'The room — every station and why', Component: Room,
      pill: '🗺️ Know the room before the patient', lede: 'An illustrated tour, the time-out, and the bail-out drawer.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 72, sys: 138, dia: 78 }); atLeastClock(min(8, 0)); } },
    { id: 's2', icon: '🩸', nav: 'Access & Sheaths', title: 'Access — needles, sheaths and French sizes', Component: Access,
      pill: '📐 French ÷ 3 = mm', lede: 'Size the sheath to the artery; where to puncture the femoral.',
      enter: ({ atLeastClock }) => atLeastClock(min(8, 20)) },
    { id: 's3', icon: '👥', nav: 'Strategy', title: 'Strategy — calcium and the plan', Component: Strategy,
      pill: '🪨 Modify calcium before the stent', lede: 'The calcium toolbox, the guide and the order of the case.',
      enter: ({ atLeastClock }) => atLeastClock(min(8, 30)) },
    { id: 's4', icon: '🪝', nav: 'Catheters', title: 'Catheters — curves, guides and support', Component: Catheters,
      pill: '🪝 Twelve shapes, one geometry problem', lede: 'The curve gallery and fitting a Judkins to the aortic root.',
      enter: ({ atLeastClock }) => atLeastClock(min(8, 40)) },
    { id: 's5', icon: '📈', nav: 'Set-up & Pressures', title: 'Set-up — the manifold, the transducer, heparin', Component: Setup,
      pill: '📈 Make the trace true', lede: 'Level, zero, damp — and keep air out of the coronary.',
      enter: ({ atLeastClock }) => atLeastClock(min(8, 50)) },
    { id: 's6', icon: '🧵', nav: 'Wires', title: 'Wires — anatomy, tip load and the wire bench', Component: Wires,
      pill: '🧵 Soft first, escalate on purpose', lede: 'What is inside a wire, and which one for which job.',
      enter: ({ atLeastClock }) => atLeastClock(min(9, 5)) },
    { id: 's7', icon: '🛠️', nav: 'Devices', title: 'The procedure — imaging, burr, balloons, stent', Component: Devices,
      pill: '⚙️ Burr, balloon, stent', lede: 'Size the burr, read the compliance chart, finish with imaging.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 76, sys: 132, dia: 76 }); atLeastClock(min(9, 30)); } },
    { id: 's8', icon: '🩹', nav: 'Closure & Support', title: 'Closure and mechanical support', Component: Closure,
      pill: '🩹 Close the hole, support the heart', lede: 'Radial bands, femoral closure, IABP, Impella and ECMO.',
      enter: ({ atLeastClock }) => atLeastClock(min(10, 20)) },
    { id: 's9', icon: '🚨', nav: 'The Crisis', title: 'Crisis — the wire went too far', Component: Crisis,
      pill: '🚨 10:42 — contrast where it should not be', lede: 'Stop the leak, drain the pericardium, seal the branch.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 118, sys: 84, dia: 50 }); atLeastClock(min(10, 42)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why', lede: 'Tamponade, and radial spasm.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 86, sys: 118, dia: 70 }); atLeastClock(min(11, 30)); } },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every tool has hurt someone', lede: 'Five patients and the one habit each would have needed.',
      enter: ({ atLeastClock }) => atLeastClock(min(12, 0)) },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home', lede: 'Ten questions, your score and the toolbox in one page.',
      enter: ({ atLeastClock }) => atLeastClock(min(24 + 10, 0)) },
  ],
};

export default function Case04({ onClose }) {
  return <CaseShell def={CASE_04} onClose={onClose} />;
}
