import React, { useEffect, useRef, useState } from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Video, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import { VALVE_CHANNELS } from '../valveMedia.js';
import CArmLab, { ViewMap, SegmentTable } from './CArmLab.jsx';
import { SEGMENTS, VIEW_BY_ID, viewName } from './anatomy.js';
import { drawAngio, drawDiagram, coverage, lesionLook, VESSEL } from './projection.js';
import './carm.css';

/* ============================================================
   CATH LAB · CASE 03
   Angiographic views — driving the C-arm in 3D.

   A 58-year-old woman with an NSTEMI and an angiogram, six
   months ago, that was reported "normal". It had been taken in
   two cranial views. Today the learner drives the C-arm: learns
   to name a view by where the detector sits, to read the spine,
   the diaphragm and the catheter, to plan a complete series, to
   find working views that open a lesion without foreshortening
   or overlap — and finds the circumflex culprit and an ostial
   left main plaque that only a view from below can show.

   The 3D tree is projected through the C-arm geometry, so
   foreshortening, overlap and the spine's position are computed,
   not drawn. Clinical content: ESC 2023 ACS guideline;
   radiation protection per ICRP/EAPCI and NCRP 168 dose levels;
   standard angiographic projection teaching (SCAI, EAPCI).
   ============================================================ */

const min = (h, m) => h * 60 + m;

// Options are written best-first in this file; on screen each question is
// rotated by a fixed offset so the best answer is not always "A".
const TEST = typeof window !== 'undefined' && !!window.__vhTest;
function D({ id, options, children, ...rest }) {
  const k = [...id].reduce((n, c) => n + c.charCodeAt(0), 0) % options.length;
  const rot = options.slice(k).concat(options.slice(0, k));
  const best = options.find(o => o.verdict === 'best');
  return (
    <Decision id={id} options={rot} {...rest}>
      {children}
      {TEST && best && <span hidden data-best={best.label} />}
    </Decision>
  );
}
function MS({ items, ...rest }) {
  return <MultiSelect items={items} {...rest}>{TEST && <span hidden data-correct={JSON.stringify(items.filter(i => i.correct).map(i => i.label))} />}</MultiSelect>;
}

function ScoreOnce({ id, pts, max }) {
  const { award, stageId } = useCase();
  useEffect(() => { if (pts != null) award(stageId, id, pts, max); }, [pts]);  // eslint-disable-line
  return null;
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

/** A still frame of the angiogram in a given view, for "name that view". */
function ViewThumb({ lao, cra, system = 'left', diagram = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth, h = c.clientHeight;
      if (!w) return;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      diagram ? drawDiagram(g, w, h, { lao, cra, system, compact: true }) : drawAngio(g, w, h, { lao, cra, system, t: 0.2 });
    };
    draw();
    const ro = new ResizeObserver(draw); ro.observe(c);
    return () => ro.disconnect();
  }, [lao, cra, system, diagram]);
  return <canvas ref={ref} className="ca-thumb" aria-label="Angiogram still frame: which view is this?" />;
}

/* ============================================================
   1 · PRESENTATION — "BUT HER ANGIOGRAM WAS NORMAL"
   ============================================================ */

function Presentation() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🚑 06:40</span>Mrs Leila Mansour, 58, a primary-school head teacher, woke with a tight band across her chest and a heaviness down the left arm. It eased after 25 minutes; a second episode came in the ambulance.</p>
        <p className="cs-p"><span className="cs-time">📁 6 months ago</span>Same pain on exertion. Another hospital did an angiogram: <b>“Normal coronary arteries.”</b> The report lists two left-coronary images, both <b>cranial</b> (RAO 30 cranial 30, LAO 40 cranial 25), and one right-coronary image. She was told it was reflux.</p>
        <p className="cs-p"><span className="cs-time">🩺 07:15</span>Pain-free now. HR 84, BP 146/88, SpO₂ 97%. No murmur, clear chest.</p>
      </div>
      <BedsideMonitor />
      <h2 className="cs-h2">🧪 Bloods & ECG</h2>
      <Table head={['Test', 'Result', 'Meaning']} rows={[
        ['hs-troponin T 0 h', '48 ng/L', 'Above the 99th centile'],
        ['hs-troponin T 1 h', '112 ng/L', 'Δ 64 — rule-in (ESC 0/1 h algorithm)'],
        ['ECG', 'ST depression 1 mm V1–V3, tall R in V2', 'Posterior / lateral ischaemia — the circumflex’s territory, often “silent” on the standard 12 leads'],
        ['Creatinine / eGFR', '78 µmol/L / 74', 'Contrast budget ≈ 3.7 × eGFR ≈ 270 mL (aim far lower)'],
        ['Hb / platelets', '128 g/L / 240', 'Fine for radial access and DAPT'],
      ]} />
      <Why title="🫀 Why a “normal” angiogram and a heart attack can both be true" chain={[
        { k: 'THE TREE', t: 'Coronary arteries are a 3D tree wrapped around a beating ellipsoid' },
        { k: 'THE IMAGE', t: 'Each angiogram is a 2D shadow of that tree, cast in ONE direction' },
        { k: 'THE BLIND SPOT', t: 'A plaque seen end-on, or behind another vessel, casts no narrowing' },
        { k: 'THE RESULT', t: 'Two views from the same side can both miss the same lesion' },
      ]}>
        An angiogram is only as complete as the directions it was taken from. Two cranial views look at the heart from the same side — anything that shows only from below was never photographed.
      </Why>
      <D id="s1-normal" question="Her angiogram six months ago was reported normal. What does that change today?"
        options={[
          { id: 'a', label: 'Nothing about today: a rising troponin with ischaemic pain is an NSTEMI until proven otherwise — and the old study may have been incomplete', verdict: 'best', points: 10, why: 'Plaque progresses in months, and a two-view “normal” study may simply not have looked in the right direction.' },
          { id: 'b', label: 'It makes a type 1 MI unlikely; look for myocarditis first', verdict: 'ok', points: 3, why: 'Reasonable to keep in mind, but the pain, the ECG territory and the troponin kinetics point to an ACS; CMR comes if the arteries are truly normal.' },
          { id: 'c', label: 'Treat medically: her arteries were normal, so the troponin is demand', verdict: 'wrong', points: 0, why: 'Anchoring on an old report is how this patient gets sent home a second time.' },
        ]} />
      <D id="s1-timing" question="When should she go to the cath lab?"
        options={[
          { id: 'a', label: 'Within 24 hours — high-risk NSTE-ACS (rising troponin, dynamic ST change), pain now settled', verdict: 'best', points: 10, why: 'ESC 2023: early invasive (< 24 h) for high-risk NSTE-ACS; immediate (< 2 h) only if very high risk (ongoing pain, instability, arrhythmia, shock).' },
          { id: 'b', label: 'Immediately, as a STEMI', verdict: 'ok', points: 4, why: 'Posterior MI can be a STEMI equivalent — get posterior leads (V7–V9). With pain resolved and no posterior ST elevation, < 24 h is right.' },
          { id: 'c', label: 'An outpatient CT coronary angiogram', verdict: 'wrong', points: 0, why: 'CTCA is for low-to-intermediate likelihood without a troponin rise — not for a confirmed NSTEMI.' },
        ]} />
      <Contrast title="a normal angiogram"
        is={{ h: '✅ A complete normal study', points: ['Every segment seen in ≥ 2 roughly orthogonal views', 'Caudal AND cranial views of the left system', 'Ostia shown, catheter pressure undamped', 'Coverage you could defend at M&M'] }}
        isnt={{ h: '❌ “Normal” from two views', points: ['Two views from the same side of the heart', 'Left main never seen from below', 'Circumflex foreshortened or hidden', 'A report, not a proof'] }} />
    </>
  );
}

/* ============================================================
   2 · THE GEOMETRY — NAME THE VIEW BY THE DETECTOR
   ============================================================ */

const NAME_TASKS = [
  { id: 'n1', lao: -30, cra: -25, answer: 'rao-cau', opts: ['rao-cau', 'lao-cra', 'ap-cra', 'spider'] },
  { id: 'n2', lao: 45, cra: -30, answer: 'spider', opts: ['rao-cra', 'spider', 'ap', 'lao-cra'] },
  { id: 'n3', lao: 45, cra: 30, answer: 'lao-cra', opts: ['rao-cau', 'ap-cau', 'lao-cra', 'rao-cra'] },
  { id: 'n4', lao: 30, cra: 0, answer: 'lao-r', system: 'right', opts: ['rao-r', 'lao-r', 'crux', 'lat'] },
];

function Geometry() {
  return (
    <>
      <p className="cs-p">The lab is yours. 🎮 Drive the C-arm with the preset buttons or the sliders, walk round the room (drag), and watch the image change on the monitor. <b>Click the monitor</b> — in the room or beside it — to open it wide with an illustrated diagram of the same projection.</p>
      <CArmLab start={{ lao: 0, cra: 0, system: 'left' }} cost={false} />
      <Note kind="pearl" title="📛 The one naming rule">
        A view is named by where the <b>detector</b> (the flat panel over the chest) sits. Detector swung to the patient’s left = <b>LAO</b>; to their right = <b>RAO</b>. Tilted toward the head = <b>cranial</b>; toward the feet = <b>caudal</b>. The X-ray tube is always on the opposite side, under the table.
      </Note>
      <Why title="📐 Why a vessel shrinks on the screen: foreshortening" chain={[
        { k: 'GEOMETRY', t: 'A segment of length L makes an angle θ with the screen' },
        { k: 'SHADOW', t: 'Its shadow is L × cos θ long' },
        { k: 'POINTING AT YOU', t: 'At 60° it looks half its length; end-on it is a dot' },
        { k: 'CONSEQUENCE', t: 'A long lesion looks short, a tight one looks mild — and stents are sized wrong' },
      ]}>
        The table under the enlarged screen gives each segment’s length as seen. Swing to LAO cranial and watch the left main fall to almost nothing — it is pointing straight at the detector.
      </Why>
      <Contrast title="LAO vs RAO — read the spine"
        is={{ h: '↗️ LAO (detector to the patient’s left)', points: ['Spine on the RIGHT of the image', 'LAD runs down the middle of the heart, “between” its branches', 'RCA as a C', 'Septals go left, diagonals go right'] }}
        isnt={{ h: '↖️ RAO (detector to the patient’s right)', points: ['Spine on the LEFT of the image (or off the field)', 'LAD along the right/front border, circumflex behind on the left', 'RCA as an L', 'Septals point down, diagonals up'] }} />
      <Contrast title="cranial vs caudal — read the diaphragm"
        is={{ h: '⬆️ Cranial (detector toward the head)', points: ['Diaphragm and liver rise into the lower field', 'LAD and diagonals open', 'Left main and circumflex foreshortened', 'You look DOWN on the heart from above'] }}
        isnt={{ h: '⬇️ Caudal (detector toward the feet)', points: ['No diaphragm in the field', 'Left main, bifurcation and circumflex open', 'Mid LAD foreshortened', 'You look UP at the heart from below — the spider'] }} />
      <h2 className="cs-h2">🔎 Name that view</h2>
      <p className="cs-p">Each still is one of the standard projections. Use the spine, the diaphragm and the shape of the tree.</p>
      <div className="cs-grid2">
        {NAME_TASKS.map((t, i) => (
          <D key={t.id} id={`s2-${t.id}`} question={`🖼️ Image ${i + 1}: which view is this?`}
            options={t.opts.map(o => ({
              id: o, label: VIEW_BY_ID[o].name,
              verdict: o === t.answer ? 'best' : 'wrong', points: o === t.answer ? 10 : 0,
              why: o === t.answer ? VIEW_BY_ID[o].tell : `${VIEW_BY_ID[o].name}: ${VIEW_BY_ID[o].tell}`,
            }))}>
            <ViewThumb lao={t.lao} cra={t.cra} system={t.system || 'left'} />
          </D>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   3 · THE PLAN & THE PATIENT
   ============================================================ */

function Plan() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🗣️ 10:20</span>Mrs Mansour is worried. “They already looked. Why would this time be different? And is all that X-ray safe?”</p>
      </div>
      <D id="s3-explain" question="What do you tell her?"
        options={[
          { id: 'a', label: '“The pictures are shadows from different angles. Last time only two angles of the left side were taken; today we will take a full set, using only what we need of X-ray and dye.”', verdict: 'best', points: 10, why: 'Honest about the reason, no blame on the other team, and a plain answer about dose.' },
          { id: 'b', label: '“The other hospital missed it.”', verdict: 'wrong', points: 0, why: 'You do not know that yet, and blame destroys trust in everyone who looks after her next.' },
          { id: 'c', label: '“There is no radiation risk.”', verdict: 'wrong', points: 0, why: 'False reassurance. The risk is small and deliberately kept small — say that.' },
        ]} />
      <Why title="☢️ Why angle changes dose" chain={[
        { k: 'PATH', t: 'Steeper angles send the beam through more chest' },
        { k: 'AUTOMATIC EXPOSURE', t: 'The system raises kV and mA to keep the image bright' },
        { k: 'ENTRANCE DOSE', t: 'Skin dose at the tube side climbs — LAO cranial and lateral views cost most' },
        { k: 'SCATTER', t: 'More dose in = more scatter to the operator’s side' },
      ]}>
        So every view must earn its place. The plan is the smallest set of views that shows every segment well twice.
      </Why>
      <MS id="s3-consent" question="✍️ Consent for diagnostic angiography ± PCI — what must she hear?"
        items={[
          { id: 'a', label: 'Bleeding / access-site injury (lower with the radial artery)', correct: true },
          { id: 'b', label: 'Stroke, MI, emergency surgery and death — each under 1 in 1,000 for a diagnostic study', correct: true, why: 'Quote numbers; patients understand frequencies better than adjectives.' },
          { id: 'c', label: 'Contrast reaction and kidney injury', correct: true },
          { id: 'd', label: 'Radiation: small, cumulative, and kept as low as possible; rarely skin redness after long procedures', correct: true },
          { id: 'e', label: 'That the doctor will decide alone whether to stent', correct: false, why: 'If a left main or multivessel disease is found, the heart team (with her) decides — that may mean stopping after the pictures.' },
        ]} />
    </>
  );
}

/* ============================================================
   4 · PLANNING — THE VIEW MAP
   ============================================================ */

function Planning() {
  const [p, setP] = useState({ lao: -30, cra: -25, system: 'left' });
  return (
    <>
      <p className="cs-p">Every standard view sits somewhere on this map. Left of centre is RAO, right is LAO; up is cranial, down is caudal. Click any point and the diagram shows what the C-arm would see from there.</p>
      <div className="cs-grid2">
        <div className="cs-card tight"><ViewMap lao={p.lao} cra={p.cra} system={p.system} onPick={v => setP(o => ({ ...o, ...v }))} big /></div>
        <div className="cs-card tight">
          <ViewThumb lao={p.lao} cra={p.cra} system={p.system} diagram />
          <p className="cs-pts" style={{ marginTop: 6 }}>{viewName(p.lao, p.cra)} · {p.system === 'left' ? 'left' : 'right'} coronary</p>
        </div>
      </div>
      <SegmentTable lao={p.lao} cra={p.cra} system={p.system} />
      <Contrast title="a working view vs a survey view"
        is={{ h: '🎯 A working view', points: ['Chosen for ONE segment', 'That segment long (not foreshortened) and clear (no overlap)', 'Side branch origin opened', 'Used for wiring, sizing, stenting'] }}
        isnt={{ h: '🗺️ A survey view', points: ['Chosen to cover as much as possible', 'Accepts some overlap', 'Part of the diagnostic set', 'Never trusted alone for length or severity'] }} />
      <MS id="s4-series" question="🗂️ Build the diagnostic series. Which views belong in a complete standard set?"
        items={[
          { id: 'raocau', label: 'RAO caudal (left)', correct: true, why: 'Circumflex, marginals, LM bifurcation.' },
          { id: 'raocra', label: 'RAO cranial or AP cranial (left)', correct: true, why: 'Mid–distal LAD, septals and diagonals separated.' },
          { id: 'laocra', label: 'LAO cranial (left)', correct: true, why: 'LAD down the groove; the diagonal bifurcations.' },
          { id: 'spider', label: 'LAO caudal — spider (left)', correct: true, why: 'Left main and the ostia of LAD and circumflex from below.' },
          { id: 'lao30', label: 'LAO 30 (right)', correct: true, why: 'RCA as a C, ostium to crux.' },
          { id: 'rao30', label: 'RAO 30 or AP cranial (right)', correct: true, why: 'Mid RCA, PDA and the crux.' },
          { id: 'lat', label: 'A left lateral for every patient', correct: false, why: 'Useful for LIMA–LAD and the distal LAD, but high dose; not routine.' },
          { id: 'ap', label: 'AP alone for the left system “to save contrast”', correct: false, why: 'Everything overlaps in AP; one view is never a diagnosis.' },
        ]} />
      <Sequence id="s4-order" question="🔢 A common order for the left system (each operator has one — what matters is that it is complete)."
        steps={[
          { label: '1 · AP caudal or RAO caudal — check the left main first', why: 'If the LM is diseased, deep engagement and further runs change.' },
          { label: '2 · RAO cranial — the mid–distal LAD', why: 'Swing up from caudal to cranial with little table movement.' },
          { label: '3 · LAO cranial — LAD and diagonal bifurcations', why: 'Same cranial tilt, swing across to LAO.' },
          { label: '4 · LAO caudal (spider) — LM and ostia from below', why: 'Tilt down; confirms the LM in a second view.' },
        ]} />
    </>
  );
}

/* ============================================================
   5 · SET-UP — RADIATION SAFETY
   ============================================================ */

function Setup() {
  return (
    <>
      <p className="cs-p">Right radial access, 6 Fr. Diagnostic JL 3.5 and JR 4. Before the first run, set the room.</p>
      <MS id="s5-dose" question="☢️ Which settings cut her dose — and yours?"
        items={[
          { id: 'a', label: 'Detector as close to the chest as possible', correct: true, why: 'Less magnification and less output needed; the image is sharper too.' },
          { id: 'b', label: 'Table as high as you can comfortably work', correct: true, why: 'Puts the patient further from the tube — lower skin dose (inverse square).' },
          { id: 'c', label: 'Collimate to the heart; use wedge filters over the lung', correct: true },
          { id: 'd', label: 'Fluoroscopy at 7.5 frames/s; cine only when you need a record', correct: true, why: 'Halving the frame rate roughly halves fluoroscopy dose.' },
          { id: 'e', label: 'Magnify (zoom) for every run', correct: false, why: 'Electronic magnification raises dose; use it only for small detail.' },
          { id: 'f', label: 'Stand on the tube side for a better view of the monitor', correct: false, why: 'Scatter is greatest on the tube side. In LAO the tube is on the patient’s right — your side: step back, use the shield.' },
          { id: 'g', label: 'Vary the angle over a long case so the same skin is not hit', correct: true, why: 'Skin dose is local; spreading the entrance field spreads the risk.' },
        ]} />
      <Sequence id="s5-engage" question="🧷 Engaging the left coronary — the safe order"
        steps={[
          { label: 'Flush and de-air the catheter, connect the manifold' },
          { label: 'Advance over the wire into the ascending aorta, remove the wire, aspirate and flush' },
          { label: 'Engage the left main gently in a caudal or AP view' },
          { label: 'Check the pressure waveform BEFORE injecting', why: 'A damped or ventricularised trace means the tip is wedged or a lesion sits at the ostium.' },
          { label: 'Test puff, then a full cine run' },
        ]} />
      <Why title="🩸 Why you look at the pressure before every injection" chain={[
        { k: 'TIP', t: 'Catheter tip wedged against plaque or an ostial lesion' },
        { k: 'TRACE', t: 'Pressure damps (falls) or ventricularises (diastolic dip)' },
        { k: 'INJECTION', t: 'Contrast forced into a blocked or dissected ostium' },
        { k: 'HARM', t: 'Dissection, VF, ischaemia — sometimes all three' },
      ]} />
    </>
  );
}

/* ============================================================
   6 · ACQUIRE THE SERIES — COVERAGE
   ============================================================ */

function Series() {
  const { answers, answer } = useCase();
  const runs = answers['s6-runs'] || [];
  const add = v => answer('s6-runs', [...runs, { lao: Math.round(v.lao), cra: Math.round(v.cra), system: v.system }]);
  const covL = coverage(runs, 'left'), covR = coverage(runs, 'right');
  const need = s => (VESSEL[s.vessel].system === 'left' ? 2 : 1);
  const got = SEGMENTS.filter(s => ((VESSEL[s.vessel].system === 'left' ? covL : covR)[s.id] || 0) >= need(s)).length;
  const done = answers['s6-done'];
  const pts = done ? Math.round(20 * got / SEGMENTS.length) + (runs.length <= 9 ? 5 : runs.length <= 12 ? 2 : 0) : null;
  return (
    <>
      <p className="cs-p">Take the diagnostic series. Each <b>💉 Inject · cine</b> records a run in the current view and costs contrast and dose. Goal: every <b>left</b> segment seen well (≥ 72% of its length, little overlap) in <b>two</b> views, every <b>right</b> segment in one — in as few runs as you can.</p>
      <CArmLab start={{ lao: -30, cra: -25, system: 'left' }} onInject={add} />
      <div className="cs-card tight">
        <p className="cs-q">📋 Coverage — {got}/{SEGMENTS.length} segments complete · {runs.length} runs</p>
        <div className="ca-segs">
          {SEGMENTS.map(s => {
            const sys = VESSEL[s.vessel].system;
            const n = (sys === 'left' ? covL : covR)[s.id] || 0;
            return <div key={s.id} className={'ca-seg' + (n >= need(s) ? ' ok' : n ? ' meh' : ' bad')}><b>{s.short}</b><small>{n} good view{n === 1 ? '' : 's'} / {need(s)} needed</small></div>;
          })}
        </div>
        {runs.length > 0 && <p className="cs-pts" style={{ marginTop: 8 }}>Runs: {runs.map(r => `${r.system === 'left' ? 'L' : 'R'} ${viewName(r.lao, r.cra)}`).join(' · ')}</p>}
        <div className="cs-row" style={{ marginTop: 10 }}>
          <button className="cs-btn primary" onClick={() => answer('s6-done', true)} disabled={!!done || runs.length < 3}>✅ Series complete — score it</button>
          {done && <span className="ca-score">+{pts} / 25 · {got === SEGMENTS.length ? 'every segment covered' : `${SEGMENTS.length - got} segment(s) short`}</span>}
        </div>
        <ScoreOnce id="s6-coverage" pts={pts} max={25} />
      </div>
      <D id="s6-culprit" question="🔍 Look at your runs (open the screen wide for the diagram). Where is the culprit?"
        options={[
          { id: 'lcx', label: 'Mid circumflex, just after OM1 — a tight, hazy stenosis', verdict: 'best', points: 10, why: 'Lateral/posterior ECG changes, rising troponin, and the only tight lesion. Best opened in RAO caudal and the spider view.' },
          { id: 'lad', label: 'The mid-LAD plaque', verdict: 'ok', points: 2, why: 'Moderate and smooth; a bystander to assess with physiology later, not the culprit.' },
          { id: 'rca', label: 'The RCA', verdict: 'wrong', points: 0, why: 'Mild irregularity only.' },
        ]} />
      <Note kind="warn" title="🕵️ Did you see the left main?">
        Open a caudal view wide and look at the very first centimetre of the left main. Then look at it again in RAO cranial. Same plaque — the diagram’s percentage tells you how much each view admits.
      </Note>
      <D id="s6-lm" question="In the AP caudal and spider views the left main ostium looks ~45% narrowed; in RAO cranial it looks almost normal. What is the truth?"
        options={[
          { id: 'a', label: 'The worst unforeshortened view is closest to the truth: an eccentric ostial LM plaque, seen in profile from below — confirm with IVUS', verdict: 'best', points: 10, why: 'Eccentric plaque disappears when viewed en face. Severity = the worst clear view, then intravascular imaging or physiology for the LM.' },
          { id: 'b', label: 'Average the views: about 25%', verdict: 'wrong', points: 0, why: 'Angiographic severity is not an average — the en face view simply cannot see it.' },
          { id: 'c', label: 'The cranial view is right; the caudal narrowing is the catheter tip', verdict: 'ok', points: 3, why: 'Catheter-induced spasm or a tip artefact is worth excluding (nitrate, withdraw the tip) — but it is the reproducible finding in two caudal views.' },
        ]} />
    </>
  );
}

/* ============================================================
   7 · THE WORKING VIEWS
   ============================================================ */

const CHALLENGES = [
  { id: 'c1', seg: 'mlcx', prompt: 'Working view for the mid-circumflex culprit: long and clear', start: { lao: 0, cra: 0, system: 'left' } },
  { id: 'c2', seg: 'lm', prompt: 'A view that lays out the left main for guide engagement and the LM–LCx junction', start: { lao: 40, cra: 25, system: 'left' } },
  { id: 'c3', seg: 'mlad', prompt: 'A view that opens the mid LAD plaque for the pressure wire', start: { lao: -30, cra: -25, system: 'left' } },
];

function Challenge({ c }) {
  const { answers, answer } = useCase();
  const res = answers[`s7-${c.id}`];
  const pts = res ? (res.fs >= 0.72 && res.overlap <= 0.3 ? 10 : res.fs >= 0.6 ? 4 : 0) : null;
  return (
    <>
      <CArmLab start={c.start} systems={['left']} task={{ seg: c.seg, prompt: c.prompt }} cost={false} height={360}
        onLock={({ lao, cra, m }) => !res && answer(`s7-${c.id}`, { lao, cra, fs: m.fs, overlap: m.overlap })} />
      {res && <p className="ca-score">🔒 Locked {viewName(res.lao, res.cra)} · length {Math.round(res.fs * 100)}% · overlap {Math.round(res.overlap * 100)}% → +{pts} / 10</p>}
      <ScoreOnce id={`s7-${c.id}`} pts={pts} max={10} />
    </>
  );
}

function WorkingViews() {
  return (
    <>
      <p className="cs-p">The heart team (and Mrs Mansour, on the table, awake) agree: treat the circumflex culprit now, and the left main with IVUS before anything goes near it. Find three working views. The box under each lab measures your choice live — lock it when the target is long and clear.</p>
      {CHALLENGES.map((c, i) => (
        <div key={c.id}>
          <h2 className="cs-h2">🎯 Challenge {i + 1} of 3</h2>
          <Challenge c={c} />
        </div>
      ))}
      <Why title="📏 Why a foreshortened working view causes a geographic miss" chain={[
        { k: 'VIEW', t: 'Lesion 20 mm long, viewed at 55° to the screen' },
        { k: 'SHADOW', t: 'Looks ~11 mm' },
        { k: 'STENT', t: 'A 12 mm stent is chosen' },
        { k: 'MISS', t: 'Plaque left at both edges → edge dissection, restenosis, thrombosis' },
      ]} />
      <D id="s7-measure" question="Your stent length estimate in RAO caudal is 12 mm; the same lesion measures 18 mm in the spider view. Which do you trust?"
        options={[
          { id: 'a', label: 'The longer one — foreshortening only shortens; confirm with IVUS or the marker-wire', verdict: 'best', points: 10, why: 'Projection can make a segment look shorter, never longer. The longest clear view is the floor for the true length.' },
          { id: 'b', label: 'The shorter one — less stent, less restenosis', verdict: 'wrong', points: 0, why: 'Leaving plaque at the edges is the commonest cause of edge failure.' },
          { id: 'c', label: 'The average, 15 mm', verdict: 'wrong', points: 0 },
        ]} />
    </>
  );
}

/* ============================================================
   8 · BACK ON THE UNIT — THE DOSE REPORT
   ============================================================ */

function Unit() {
  const { metrics } = useCase();
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🛏️ 14:10</span>Circumflex stented (3.0 × 18 mm, IVUS-optimised). The LM plaque is 45% by angiography, minimal lumen area 7.8 mm² by IVUS — not significant; medical therapy and follow-up. Radial band on, pain-free.</p>
      </div>
      <Table head={['Dose report', 'Value', 'Meaning']} rows={[
        ['Reference air kerma (Ka,r)', `${(1.1 + (metrics.kerma || 0) / 1000).toFixed(2)} Gy`, 'Below 2 Gy: no skin effect expected'],
        ['Dose–area product', `${(48 + (metrics.dap || 0)).toFixed(0)} Gy·cm²`, 'Stochastic (cancer) risk index'],
        ['Fluoroscopy time', '11 min', 'Not a dose measure on its own'],
        ['Contrast', `${(95 + (metrics.contrast || 0)).toFixed(0)} mL`, 'Under the budget for eGFR 74'],
      ]} />
      <D id="s8-dose" question="When does a patient need skin follow-up after a procedure?"
        options={[
          { id: 'a', label: 'Reference air kerma ≥ 5 Gy (or peak skin dose ≥ 3 Gy): tell the patient, document, review the skin at 2–4 weeks', verdict: 'best', points: 10, why: 'NCRP 168 / SIR “substantial radiation dose level”. Erythema appears days to weeks later — on the back, where the patient cannot see it.' },
          { id: 'b', label: 'Only if fluoroscopy time exceeds 60 minutes', verdict: 'wrong', points: 0, why: 'Fluoroscopy time ignores cine, angulation and body size; use air kerma or peak skin dose.' },
          { id: 'c', label: 'Never after diagnostic cases', verdict: 'ok', points: 2, why: 'Usually true, but repeated or long procedures add up at the same skin site.' },
        ]} />
      <D id="s8-drugs" question="Her antithrombotic plan after PCI for NSTEMI?"
        options={[
          { id: 'a', label: 'Aspirin + prasugrel (or ticagrelor) for 12 months, then single antiplatelet; PPI', verdict: 'best', points: 10, why: 'ESC 2023 default DAPT duration after ACS; no high bleeding risk here.' },
          { id: 'b', label: 'Aspirin alone — the stent is IVUS-optimised', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'Clopidogrel + aspirin for 1 month', verdict: 'ok', points: 3, why: 'Short DAPT is for high bleeding risk; she has none.' },
        ]} />
      <Contrast title="dose measures"
        is={{ h: '📊 Air kerma / peak skin dose', points: ['Predicts skin injury (deterministic)', 'Threshold-based: 2, 5, 10, 15 Gy', 'Depends on angle, body size, cine', 'Triggers follow-up'] }}
        isnt={{ h: '⏱️ Fluoroscopy time', points: ['Ignores cine (the biggest dose)', 'Ignores steep angles and obesity', 'A habit, not a dose', 'Never reassure on time alone'] }} />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — THE DAMPED LEFT MAIN
   ============================================================ */

function Crisis() {
  const { setVitals, answers, answer } = useCase();
  const st = answers['s9-act'];
  const lm = answers['s9-lmview'];
  const look = lm ? lesionLook(lm.lao, lm.cra, 'LM') : 0;
  const lmPts = lm ? (look >= 0.38 && lm.fs >= 0.72 ? 15 : look >= 0.25 ? 6 : 0) : null;
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🚨 11:32</span>Back to the start of the PCI. The 6 Fr EBU guide is advanced to engage the left main for the circumflex. The aortic trace on the guide flattens: <b>systolic 92, diastolic 30</b>, with a slow rise. She says the pain is back. ST depression deepens across the anterior leads.</p>
      </div>
      <BedsideMonitor />
      <D id="s9-act" question="⏱️ What now?"
        onAnswer={o => setVitals(o.id === 'a' ? { hr: 92, sys: 128, dia: 74, st: -1 } : { hr: 118, sys: 78, dia: 42, st: -3.5 })}
        options={[
          { id: 'a', label: 'Do not inject. Pull the guide back out of the ostium at once, watch the pressure recover, give IC nitrate once it is out', verdict: 'best', points: 10, why: 'A damped or ventricularised trace means the catheter is occluding the ostium. Every second wedged is global left-ventricular ischaemia; an injection now can dissect the left main.' },
          { id: 'b', label: 'Inject to see what is happening', verdict: 'wrong', points: 0, why: 'This is how a left main dissection — or VF — is caused. The pressure trace already told you.' },
          { id: 'c', label: 'Start noradrenaline for the hypotension and continue', verdict: 'wrong', points: 0, why: 'The hypotension is the catheter. Remove the cause first.' },
        ]} />
      {st && (
        <>
          <Note kind={st === 'a' ? 'pearl' : 'warn'} title={st === 'a' ? '✅ Pressure back to 128/74, pain easing' : '⚠️ BP 78/42 — pull the guide back now'}>
            The guide is disengaged and sitting in the left sinus. The left main ostium needs to be seen — <b>without</b> deep engagement. That means a view from below, where this plaque shows in profile.
          </Note>
          <CArmLab start={{ lao: 30, cra: 30, system: 'left' }} systems={['left']} task={{ seg: 'lm', prompt: 'Show the LM ostium in profile (gentle, non-selective injection)' }} height={360}
            onLock={({ lao, cra, m }) => !lm && answer('s9-lmview', { lao, cra, fs: m.fs })} />
          {lm && <p className="ca-score">🔒 {viewName(lm.lao, lm.cra)} · LM plaque looks {Math.round(look * 100)}% · LM length {Math.round(lm.fs * 100)}% → +{lmPts} / 15{look < 0.38 ? ' — from this side the plaque is almost invisible; try a caudal view' : ''}</p>}
          <ScoreOnce id="s9-lmview" pts={lmPts} max={15} />
        </>
      )}
      <Why title="🫀 Why a damped left main kills faster than any other vessel" chain={[
        { k: 'TERRITORY', t: 'The left main feeds ~75% of the left ventricle' },
        { k: 'WEDGED CATHETER', t: 'Flow through it stops while the guide sits in the ostium' },
        { k: 'GLOBAL ISCHAEMIA', t: 'LV contractility falls within seconds → BP falls' },
        { k: 'SPIRAL', t: 'Lower aortic pressure → less coronary perfusion → more ischaemia' },
      ]} />
      <D id="s9-next" question="🧭 How do you finish the circumflex PCI safely?"
        options={[
          { id: 'a', label: 'IVUS the left main first; if not significant, re-engage coaxially with a side-hole guide or a smaller curve, watching the pressure on every injection', verdict: 'best', points: 10, why: 'Define the LM before you work through it. Side holes keep some flow if the tip occludes; coaxial, gentle engagement avoids the plaque.' },
          { id: 'b', label: 'Deep-seat the guide for support — the circumflex is tortuous', verdict: 'wrong', points: 0, why: 'Deep-seating into a diseased LM ostium is the classic route to LM dissection.' },
          { id: 'c', label: 'Abandon PCI; send to surgery for the LM', verdict: 'ok', points: 4, why: 'Right if the LM proves significant with multivessel disease (heart team) — but first measure it.' },
        ]} />
      <Contrast title="damped vs ventricularised"
        is={{ h: '📉 Damped trace', points: ['Systolic and diastolic both fall, upstroke slow', 'Tip against a wall, kinked catheter or small vessel', 'Pull back, rotate, flush', 'Do not inject'] }}
        isnt={{ h: '🔻 Ventricularised trace', points: ['Systolic preserved, diastolic drops toward zero', 'Tip occluding a vessel with downstream run-off', 'Strongly suggests ostial stenosis', 'Do not inject — disengage'] }} />
    </>
  );
}

/* ============================================================
   10 · THE VICIOUS CYCLE
   ============================================================ */

function Cycles() {
  return (
    <>
      <ViciousCycle id="cyc-missed" title="🔁 The incomplete angiogram"
        nodes={[
          { t: 'Two views from one side', short: 'Two views', d: 'Both cranial: the left main and circumflex are foreshortened or seen en face.' },
          { t: 'The lesion casts no narrowing', short: 'Invisible', d: 'Eccentric ostial plaque viewed from above shows as a normal-width column of contrast.' },
          { t: '“Normal coronaries”', short: '“Normal”', d: 'The report is filed; the next team anchors on it.' },
          { t: 'Symptoms re-labelled', short: 'Reflux', d: 'Angina becomes reflux or anxiety; no antiplatelet, no statin.' },
          { t: 'Plaque progresses and ruptures', short: 'MI', d: 'Six months later: an NSTEMI — or sudden death.' },
        ]}
        breaks={[
          { at: 0, t: 'Every segment in two roughly orthogonal views, caudal AND cranial.' },
          { at: 1, t: 'Judge each lesion by its worst unforeshortened view; IVUS when in doubt.' },
          { at: 2, t: 'Report the views taken and which segments were not seen.' },
        ]} />
      <ViciousCycle id="cyc-lm" title="🔁 The damped left main"
        nodes={[
          { t: 'Guide wedged in a diseased LM ostium', short: 'Wedged', d: 'Pressure damps or ventricularises.' },
          { t: 'Global LV ischaemia', short: 'Ischaemia', d: 'Most of the left ventricle is without flow.' },
          { t: 'Contractility and BP fall', short: 'BP falls', d: 'Aortic diastolic pressure drops.' },
          { t: 'Less coronary perfusion pressure', short: 'Less flow', d: 'Coronary flow depends on diastolic pressure.' },
          { t: 'More ischaemia, arrhythmia, arrest', short: 'Arrest', d: 'VF or electromechanical collapse within a minute or two.' },
        ]}
        breaks={[
          { at: 0, t: 'Watch the pressure on every engagement; disengage at the first damping.' },
          { at: 1, t: 'Never inject into a damped catheter.' },
          { at: 2, t: 'Support the pressure (vasopressor) only after the cause is removed.' },
        ]} />
      <D id="cyc-q1" question="In the incomplete-angiogram cycle, which single habit cuts the loop earliest?"
        options={[
          { id: 'a', label: 'Two roughly orthogonal views of every segment, including caudal views of the left main', verdict: 'best', points: 10 },
          { id: 'b', label: 'Faster injections', verdict: 'wrong', points: 0, why: 'A better-filled wrong view is still a wrong view.' },
          { id: 'c', label: 'A second opinion on the report', verdict: 'ok', points: 3, why: 'Helps only if the missing view exists to be reviewed.' },
        ]} />
      <D id="cyc-q2" question="BP falls as the guide engages the left main. Where do you break the cycle first?"
        options={[
          { id: 'a', label: 'Remove the catheter from the ostium', verdict: 'best', points: 10 },
          { id: 'b', label: 'Vasopressor bolus', verdict: 'ok', points: 3, why: 'May be needed — after the cause is gone.' },
          { id: 'c', label: 'Inject to look', verdict: 'wrong', points: 0 },
        ]} />
    </>
  );
}

/* ============================================================
   11 · M&M WAR STORIES
   ============================================================ */

function WarStories() {
  return (
    <>
      <WarStory title="⚰️ The normal angiogram that wasn’t"
        mistake="A left coronary study of two cranial views only; the left main was never seen from below."
        burn="Caudal views for the left main, every time. A segment seen once is a segment not seen.">
        <p className="cs-p">A 61-year-old man with exertional chest pain had “normal coronaries” on two LAO/RAO cranial views. Three months later he collapsed on a treadmill during a stress echo ordered for persistent symptoms. Post-mortem: a 75% eccentric ostial left main plaque with fresh thrombus. The plaque sat on the roof of the left main — invisible from above, obvious from below.</p>
      </WarStory>
      <D id="mm-1" question="Which view would most likely have shown his lesion?"
        options={[
          { id: 'a', label: 'AP caudal or LAO caudal (spider)', verdict: 'best', points: 10 },
          { id: 'b', label: 'LAO cranial', verdict: 'wrong', points: 0, why: 'The LM points at the detector: a dot.' },
          { id: 'c', label: 'A second RAO cranial', verdict: 'wrong', points: 0 },
        ]} />
      <WarStory title="⚡ The stent that was too short"
        mistake="Lesion length measured in RAO caudal, where the LAD is foreshortened."
        burn="Measure in the longest clear view. Foreshortening only ever makes things shorter.">
        <p className="cs-p">A 15 mm stent was placed in a mid-LAD lesion sized in RAO caudal. Next morning: anterior STEMI. The new angiogram, in RAO cranial, showed the lesion was 26 mm long — a dissection had started from the uncovered plaque at the distal edge. She survived after emergency PCI and a week of cardiogenic shock on mechanical support.</p>
      </WarStory>
      <WarStory title="🫥 The circumflex that was never there"
        mistake="Nobody counted the branches: a flush ostial occlusion of the circumflex left no stump, and the LAD's overlap hid the gap."
        burn="Count the vessels. A missing branch is a finding — look for collaterals and late filling.">
        <p className="cs-p">A 66-year-old woman with a lateral MI had an angiogram reported as “LAD mild disease, no culprit”. Only two left views were taken; the absent circumflex was not noticed. She re-infarcted two days later and arrived in cardiogenic shock; a long late-filling run then showed the circumflex territory filling backwards from LAD collaterals. She survived with an ejection fraction of 25%.</p>
      </WarStory>
      <D id="mm-3" question="What would have revealed the missing circumflex?"
        options={[
          { id: 'a', label: 'RAO caudal with a long run (to catch late collateral filling) and counting the branches', verdict: 'best', points: 10 },
          { id: 'b', label: 'More contrast in the same views', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'A ventriculogram', verdict: 'ok', points: 3, why: 'Shows a lateral wall motion abnormality — a clue, not the anatomy.' },
        ]} />
      <WarStory title="💥 The damped RCA"
        mistake="Injecting into a damped right coronary catheter sitting in the conus branch."
        burn="Look at the pressure before every injection. Damped = do not inject.">
        <p className="cs-p">During a right coronary run the JR4 tip slipped into the conus branch. The trace damped; the operator injected anyway. VF within three seconds. She was shocked twice, survived, and had a dissected conus branch that needed no treatment — this time.</p>
      </WarStory>
      <D id="mm-4" question="Why does a small conus injection cause VF?"
        options={[
          { id: 'a', label: 'Contrast under pressure into a small branch supplying the RV outflow and conduction tissue causes intense local ischaemia and repolarisation dispersion', verdict: 'best', points: 10 },
          { id: 'b', label: 'Contrast allergy', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'Air embolism is the only cause', verdict: 'ok', points: 2, why: 'Air can do it too — another reason to de-air and look at the trace.' },
        ]} />
      <WarStory title="🔥 The burn on her back"
        mistake="A two-hour chronic total occlusion PCI in one steep LAO cranial angle, frame rate 15/s, table low, no dose monitoring."
        burn="Steep angles cost dose. Watch the air kerma, vary the angle, lower the frame rate, raise the table.">
        <p className="cs-p">Reference air kerma reached 11 Gy at one skin site. Three weeks later a painful red patch on her right back; at three months a non-healing ulcer that became infected and septic, and later needed debridement and a skin graft. Nobody had told her to look, and nobody had arranged follow-up.</p>
      </WarStory>
      <WarStory title="🪤 The wrong branch"
        mistake="In a single RAO view a large septal was taken for the diagonal and wired, ballooned and stented."
        burn="Septals run straight down into the septum (no motion with the free wall); diagonals run out over the free wall. Check in LAO cranial before you balloon.">
        <p className="cs-p">The “diagonal” lesion was in a septal branch; the culprit diagonal stayed occluded. Septal haematoma, then ventricular tachycardia storm, then re-intervention. He survived after two shocks and a week in the CCU.</p>
      </WarStory>
      <D id="mm-6" question="Which view separates septals from diagonals best?"
        options={[
          { id: 'a', label: 'LAO cranial: septals go left toward the spine-side, diagonals go right over the free wall', verdict: 'best', points: 10 },
          { id: 'b', label: 'RAO caudal', verdict: 'wrong', points: 0, why: 'Both families overlap the LAD there.' },
          { id: 'c', label: 'AP', verdict: 'wrong', points: 0 },
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
      <MS id="s10-dc" question="🏠 Discharge plan for Mrs Mansour"
        items={[
          { id: 'a', label: 'DAPT for 12 months, high-intensity statin (LDL < 1.4 mmol/L), beta-blocker if LV impaired, ACE inhibitor if indicated', correct: true },
          { id: 'b', label: 'Cardiac rehabilitation referral', correct: true },
          { id: 'c', label: 'Left main plaque: risk factor control and clinical follow-up; re-image if symptoms recur', correct: true },
          { id: 'd', label: 'Copy of her angiogram views and report to her GP and to her', correct: true, why: 'The next team should know which views were taken and what they showed.' },
          { id: 'e', label: 'Skin check for radiation', correct: false, why: 'Her air kerma was low — no follow-up needed; say so.' },
        ]} />
      <h2 className="cs-h2">📝 Ten questions</h2>
      <Quiz id="s10-quiz" items={[
        { q: 'A view is named by the position of…', options: ['The X-ray tube', 'The detector', 'The operator', 'The table'], answer: 1, why: 'Detector to the patient’s left = LAO, toward the head = cranial.' },
        { q: 'On an LAO image the spine lies…', options: ['On the left of the screen', 'In the centre', 'On the right of the screen', 'It is never visible'], answer: 2, why: 'Swing the detector to the patient’s left and posterior structures slide to the right of the image.' },
        { q: 'The view for the left main and its bifurcation from below is…', options: ['LAO cranial', 'LAO caudal (spider)', 'RAO cranial', 'Left lateral'], answer: 1, why: 'Caudal views look up at the left main; the LAD and circumflex spread like legs.' },
        { q: 'In LAO cranial the left main is…', options: ['Seen in full', 'Foreshortened — it points at the detector', 'Hidden by the spine', 'Overlapped by the RCA'], answer: 1, why: 'Hence never use LAO cranial to judge the left main.' },
        { q: 'The best single view of the circumflex and marginals is usually…', options: ['RAO caudal', 'AP cranial', 'LAO cranial', 'RAO cranial'], answer: 0, why: 'RAO caudal lays the circumflex along the lower border with the marginals hanging down.' },
        { q: 'The RCA looks like a “C” in…', options: ['RAO 30', 'LAO 30', 'AP caudal', 'Left lateral'], answer: 1, why: 'LAO 30: ostium to crux in one curve. In RAO 30 it is an “L”.' },
        { q: 'A lesion measures 10 mm in one view and 16 mm in another. Its length is at least…', options: ['10 mm', '13 mm', '16 mm', 'Unknown'], answer: 2, why: 'Projection only shortens; the longer clear measurement is the floor.' },
        { q: 'Which change LOWERS patient skin dose?', options: ['Lowering the table', 'Moving the detector away from the chest', 'Raising the table and bringing the detector down to the chest', 'Steeper angulation'], answer: 2, why: 'More distance from the tube, less air gap to the detector.' },
        { q: 'A ventricularised pressure trace on engagement means…', options: ['Inject quickly', 'The catheter is occluding a vessel — disengage', 'Normal for the RCA', 'Contrast allergy'], answer: 1, why: 'Diastolic pressure falls toward zero as the tip occludes the ostium.' },
        { q: 'Skin follow-up is recommended when reference air kerma exceeds about…', options: ['0.5 Gy', '1 Gy', '5 Gy', '50 Gy'], answer: 2, why: 'NCRP 168 substantial radiation dose level.' },
      ]} />
      <div className="cs-card">
        <h2 className="cs-h2" style={{ marginTop: 0 }}>🏆 Your score</h2>
        <p className="cs-p" style={{ fontSize: 20 }}><b className="cs-mono">{totals.got} / {totals.max}</b> · {pct}%</p>
        <Table head={['Stage', 'Points']} rows={def.stages.map(st => [st.title, `${totals.by[st.id]?.got || 0} / ${totals.by[st.id]?.max || 0}`])} />
      </div>
      <div className="cs-card">
        <h2 className="cs-h2" style={{ marginTop: 0 }}>🔥 Take home</h2>
        <ol className="cs-ul">
          <li className="cs-li">📛 Name the view by the detector: left = LAO, right = RAO, head = cranial, feet = caudal.</li>
          <li className="cs-li">🦴 Spine on the right → LAO; spine on the left → RAO. Diaphragm in the field → cranial.</li>
          <li className="cs-li">🕷️ Left main and circumflex open from below (caudal); LAD and diagonals open from above (cranial).</li>
          <li className="cs-li">📐 Foreshortening only shortens — measure length in the longest clear view.</li>
          <li className="cs-li">👀 Every segment in two roughly orthogonal views; severity is the worst unforeshortened view.</li>
          <li className="cs-li">🧮 Count the branches: a missing vessel is a finding.</li>
          <li className="cs-li">🩸 Look at the pressure before every injection; damped or ventricularised = disengage, never inject.</li>
          <li className="cs-li">☢️ Table up, detector down, collimate, 7.5 f/s, vary the angle; ≥ 5 Gy air kerma = skin follow-up.</li>
          <li className="cs-li">📋 Report which views were taken — so the next team knows what was never seen.</li>
        </ol>
      </div>
      <h2 className="cs-h2">🎬 Watch the views on real runs</h2>
      <div className="cs-media-row">
        <Video id="snXIsggQP1k" title="Coronary views, including AP cranial and AP caudal" />
        <Video id="Vhf-gob-miA" title="Coronary angiogram: LAO caudal (spider) view" />
        <Video id="qaB2CiJf1Gg" title="Coronary angiogram: RAO cranial view" />
      </div>
      <CaseLibrary title="📚 Cath lab case library" channels={[
        { name: 'CCC Live Cases', url: 'https://www.youtube.com/@CCCLiveCases', note: 'Live coronary cases — watch which view each step is done in' },
        ...VALVE_CHANNELS.filter(c => !c.url.includes('playlist')),
      ]} />
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const CASE_03 = {
  title: 'Angiographic views · Driving the C-arm in 3D · The lesion only one view could see',
  short: 'Cath Lab · Case 03',
  patient: {
    name: 'Mrs Leila Mansour',
    meta: '58 F · MRN 5520-1187 · 71 kg',
    flags: [
      { text: 'NSTEMI · hs-TnT 48 → 112', tone: 'red' },
      { text: '“Normal” angiogram 6 months ago', tone: 'amber' },
      { text: 'eGFR 74', tone: 'blue' },
      { text: 'Right radial', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 120, limit: 220, basis: 'volume/eGFR ≤ 3' },
  clock0: min(6, 40),
  vitals0: { hr: 84, sys: 146, dia: 88, spo2: 97, rr: 16, st: -1 },
  brand: { icon: '🎥', line: 'Cath Lab · Case 03' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / IM', tone: 'cyan' },
      { text: '3D C-arm simulator', tone: 'red' },
      { text: 'ESC 2023 ACS · radiation safety', tone: 'plain' },
    ],
    lines: [
      { text: 'Drive the', style: 'outline' },
      { text: 'C-arm', style: 'grad' },
      { text: '& see what it sees', style: 'cyan' },
    ],
    hook: (
      <>
        A head teacher with a heart attack — and an angiogram, six months ago, reported <span className="g">normal</span>.
        It was taken from <span className="y">two angles</span>. Today you drive the C-arm in 3D, watch every projection form on the screen,
        and find the lesion that only a view from <span className="r">below</span> could ever show.
      </>
    ),
    image: '/images/cath-lab.webp',
    sims: 's2',
    crisis: 's9',
    cards: [
      { k: '🧑‍🏫 The patient', t: 'Mrs Leila Mansour, 58 — NSTEMI, posterior-lateral ECG changes, “normal coronaries” six months ago.' },
      { k: '🎮 Your role', t: 'You drive the C-arm: name the views, plan the series, find the working views.' },
      { k: '🖥️ In your hands', t: 'A 3D cath lab, a live angiogram, and a wide screen with an illustrated diagram of every projection.' },
      { k: '🧠 How it teaches', t: 'Geometry, not memory: why a view opens one vessel and hides another — and who was hurt when it did.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'Presentation — “but her angiogram was normal”', Component: Presentation,
      pill: '🚑 A normal angiogram and a rising troponin', lede: 'Why both can be true, and when she goes to the lab.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 84, sys: 146, dia: 88, st: -1 }); atLeastClock(min(7, 15)); } },
    { id: 's2', icon: '📐', nav: 'The Geometry of Views', title: 'The geometry — name the view by the detector', Component: Geometry,
      pill: '🎮 You drive the C-arm', lede: 'Move the C-arm in 3D, watch the image form, and learn to read any view.',
      enter: ({ atLeastClock }) => atLeastClock(min(9, 30)) },
    { id: 's3', icon: '👥', nav: 'The Plan & the Patient', title: 'The plan and the patient', Component: Plan,
      pill: '🗣️ Why this time is different', lede: 'Explaining views and dose, and consent.',
      enter: ({ atLeastClock }) => atLeastClock(min(10, 20)) },
    { id: 's4', icon: '🧮', nav: 'The View Map', title: 'Planning — the view map', Component: Planning,
      pill: '🗺️ Every view on one chart', lede: 'Survey views vs working views, and the series to take.',
      enter: ({ atLeastClock }) => atLeastClock(min(10, 40)) },
    { id: 's5', icon: '🩸', nav: 'Set-up & Radiation', title: 'Set-up — radiation safety and engagement', Component: Setup,
      pill: '☢️ Table up, detector down', lede: 'Set the room before the first run.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 80, sys: 138, dia: 82 }); atLeastClock(min(11, 0)); } },
    { id: 's6', icon: '🎬', nav: 'Acquire the Series', title: 'Acquire the diagnostic series', Component: Series,
      pill: '📸 Every segment, twice', lede: 'Take the runs, cover the tree, find the culprit — and the plaque nobody saw.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 78, sys: 134, dia: 80 }); atLeastClock(min(11, 10)); } },
    { id: 's7', icon: '🛠️', nav: 'Working Views', title: 'The working views', Component: WorkingViews,
      pill: '🎯 Long and clear', lede: 'Three targets, measured live: length seen and overlap.',
      enter: ({ atLeastClock }) => atLeastClock(min(11, 25)) },
    { id: 's8', icon: '🛏️', nav: 'Back on the Unit', title: 'Back on the unit — the dose report', Component: Unit,
      pill: '📊 Air kerma, not minutes', lede: 'What the numbers mean and who needs follow-up.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 72, sys: 128, dia: 76, st: 0 }); atLeastClock(min(14, 10)); } },
    { id: 's9', icon: '🚨', nav: 'The Crisis', title: 'Crisis — the damped left main', Component: Crisis,
      pill: '🚨 11:32 — the trace goes flat', lede: 'Recognise it from the pressure, act, then see the ostium from the right side.',
      enter: ({ setVitals }) => setVitals({ hr: 104, sys: 92, dia: 30, st: -2.5 }) },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why', lede: 'The incomplete angiogram, and the damped left main.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 74, sys: 126, dia: 74, st: 0 }); atLeastClock(min(15, 0)); } },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for', lede: 'Six patients hurt by a view not taken or a view misread.',
      enter: ({ atLeastClock }) => atLeastClock(min(15, 30)) },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home', lede: 'The plan home, ten questions and your score.',
      enter: ({ atLeastClock }) => atLeastClock(min(24 + 9, 0)) },
  ],
};

export default function Case03({ onClose }) {
  return <CaseShell def={CASE_03} onClose={onClose} />;
}
