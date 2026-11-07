import React, { useEffect, useRef, useState } from 'react';
import {
  CaseShell, useCase, Note, Decision, MultiSelect, Sequence, Quiz,
  Why, Contrast, WarStory, ViciousCycle, BedsideMonitor, CaseLibrary,
} from '../kit/CaseKit.jsx';
import EchoLab from './EchoLab.jsx';
import { MOTION, EDV, ESV, EF } from './heart.js';
import { VIEW_BY_ID, viewBasis, FORESHORTENED } from './views.js';
import { drawEcho } from './render.js';
import './echo.css';

/* ============================================================
   CARDIAC IMAGING & DIAGNOSTICS · ECHO CASE 01
   The systematic transthoracic echo after an anterior MI —
   and the thrombus a foreshortened view missed.

   A 52-year-old man who sat out an anterior STEMI at home and
   presented on day 3: LAD-territory akinesis, a thin apical
   aneurysm, an ejection fraction about one third, and a
   laminated apical thrombus. The night-time bedside echo,
   taken one interspace too high, said "no thrombus".

   The learner scans a 3D heart: every image is the beam's plane
   cutting the model, so foreshortening, oblique short axes and
   missed apices happen exactly as they do at the bedside.

   Clinical content: ASE/EACVI chamber quantification (2015) and
   standard TTE protocol (ASE 2019); ESC 2023 ACS guideline; AHA
   2022 scientific statement on LV thrombus; ESC 2021/2023 HF.
   ============================================================ */

const min = (h, m) => h * 60 + m;
const TEST = typeof window !== 'undefined' && !!window.__vhTest;

function ScoreOnce({ id, pts, max }) {
  const { award, stageId } = useCase();
  useEffect(() => { if (pts != null) award(stageId, id, pts, max); }, [pts]);  // eslint-disable-line
  return null;
}
// Options are written best-first; each question is rotated on screen by a fixed offset.
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

/** A still echo frame of a standard view at end-diastole. */
function ViewThumb({ view, pose }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    c.width = 560; c.height = 440;
    const v = VIEW_BY_ID[view];
    drawEcho(c.getContext('2d'), 560, 440, { pose: pose || viewBasis(v), depth: v.depth, phase: 0.02, rw: 200, title: '?' });
  }, [view, pose]);
  return <canvas ref={ref} className="ec-thumb" aria-label="Echo still: which view is this?" />;
}

/* ---------- the 17-segment bullseye ---------- */

const TERRITORY = ['LAD', 'LAD', 'RCA', 'RCA', 'LCx', 'LCx', 'LAD', 'LAD', 'RCA', 'RCA', 'LCx', 'LCx', 'LAD', 'LAD', 'RCA', 'LCx', 'LAD'];
const TCOL = { LAD: '#22D3EE', RCA: '#F472B6', LCx: '#FBBF24' };
const MCOL = ['#34E39A', '#F5C451', '#FB7185', '#C084FC'];

function arcPath(cx, cy, r0, r1, a0, a1) {
  const P = (r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const [x0, y0] = P(r1, a0), [x1, y1] = P(r1, a1), [x2, y2] = P(r0, a1), [x3, y3] = P(r0, a0);
  const big = a1 - a0 > Math.PI ? 1 : 0;
  return `M${x0} ${y0} A${r1} ${r1} 0 ${big} 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 ${big} 0 ${x3} ${y3} Z`;
}
/** Bullseye: anterior at the top, septum on the left, lateral on the right, inferior at the bottom. */
function Bullseye({ fill, onPick, label = i => i + 1 }) {
  const C = 160, rings = [[108, 150], [66, 108], [28, 66]];
  const cells = [];
  const R = d => d * Math.PI / 180;
  // angles clockwise from the top; segment 1/7 at the top, numbering runs toward the septum (screen left)
  for (let i = 0; i < 6; i++) {
    const c = -60 * i;
    cells.push({ seg: i, d: arcPath(C, C, ...rings[0], R(c - 30), R(c + 30)) });
    cells.push({ seg: i + 6, d: arcPath(C, C, ...rings[1], R(c - 30), R(c + 30)) });
  }
  for (let i = 0; i < 4; i++) { const c = -90 * i; cells.push({ seg: 12 + i, d: arcPath(C, C, ...rings[2], R(c - 45), R(c + 45)) }); }
  const mid = s => {
    if (s === 16) return [C, C];
    const ring = s < 6 ? 129 : s < 12 ? 87 : 47;
    const c = R(s < 12 ? -60 * (s % 6) : -90 * (s - 12));
    return [C + ring * Math.sin(c), C - ring * Math.cos(c)];
  };
  return (
    <svg viewBox="0 0 320 320" className="ec-bull" role="group" aria-label="17-segment bullseye">
      {cells.map(c => <path key={c.seg} d={c.d} fill={fill(c.seg)} data-seg={c.seg} onClick={() => onPick?.(c.seg)} />)}
      <circle cx={C} cy={C} r={28} fill={fill(16)} stroke="#071120" strokeWidth="2" data-seg={16} onClick={() => onPick?.(16)} style={{ cursor: 'pointer' }} />
      {Array.from({ length: 17 }, (_, s) => { const [x, y] = mid(s); return <text key={s} x={x} y={y + 4} textAnchor="middle">{label(s)}</text>; })}
      <text x={C} y={12} textAnchor="middle" style={{ fill: '#A9BBD2' }}>ANTERIOR</text>
      <text x={C} y={316} textAnchor="middle" style={{ fill: '#A9BBD2' }}>INFERIOR</text>
      <text x={4} y={C} style={{ fill: '#A9BBD2' }}>SEPT</text>
      <text x={316} y={C} textAnchor="end" style={{ fill: '#A9BBD2' }}>LAT</text>
    </svg>
  );
}

/* ============================================================
   1 · PRESENTATION
   ============================================================ */

function Presentation() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">📅 3 weeks ago</span>Mr Tarek Nassar, 52, a lorry driver who smokes and has type 2 diabetes, had two days of “indigestion” at home. On day 3 he came in: anterior Q waves, troponin already falling. Too late for primary PCI; treated medically and discharged on aspirin, clopidogrel, atorvastatin and bisoprolol.</p>
        <p className="cs-p"><span className="cs-time">🚑 Last night</span>Breathless on the stairs, then at night. Admitted. HR 96, BP 112/70, SpO₂ 95%, crackles at both bases, a soft apical pansystolic murmur.</p>
        <p className="cs-p"><span className="cs-time">🌙 02:10</span>The on-call registrar did a bedside echo: <b>“LV impaired, EF ~35%, no thrombus seen.”</b> The images were apical views from high on the chest.</p>
      </div>
      <BedsideMonitor />
      <h2 className="cs-h2">🧪 ECG & bloods</h2>
      <Table head={['Test', 'Result', 'Meaning']} rows={[
        ['ECG', 'Q waves V1–V4, ST elevation still 2 mm, T inversion', 'Persistent ST elevation weeks after an anterior MI: think LV aneurysm'],
        ['NT-proBNP', '4,800 ng/L', 'Heart failure'],
        ['hs-TnT', '84 ng/L, flat', 'The tail of the old infarct, not a new one'],
        ['Creatinine / eGFR', '96 µmol/L / 78', 'Fine for anticoagulants and GDMT'],
      ]} />
      <Why title="🫀 Why an anterior infarct grows a clot at the apex" chain={[
        { k: 'INFARCT', t: 'Transmural LAD infarct: the apex and anterior wall die' },
        { k: 'SCAR', t: 'Thin scar balloons outward in systole (dyskinesia) → aneurysm' },
        { k: 'STASIS', t: 'Blood swirls and stagnates in the akinetic apical pouch' },
        { k: 'ENDOTHELIUM', t: 'Damaged endocardium + post-MI hypercoagulability' },
        { k: 'THROMBUS', t: 'Virchow’s triad complete: a laminated apical thrombus' },
      ]}>
        Large anterior infarcts that were not reperfused carry the highest risk — exactly this patient.
      </Why>
      <MS id="s1-qs" question="🎯 What must today’s echo answer?"
        items={[
          { id: 'a', label: 'LV size and ejection fraction (biplane Simpson’s)', correct: true },
          { id: 'b', label: 'Regional wall motion: which territory, how much', correct: true },
          { id: 'c', label: 'LV thrombus — with the true apex in view, contrast if in doubt', correct: true },
          { id: 'd', label: 'Mechanical complications: VSD, papillary muscle rupture, pseudoaneurysm, effusion', correct: true, why: 'New murmur after MI = rule out VSD and papillary muscle rupture.' },
          { id: 'e', label: 'Mitral regurgitation mechanism and severity', correct: true },
          { id: 'f', label: 'Coronary anatomy', correct: false, why: 'Echo infers the territory from wall motion; the arteries need angiography or CT.' },
        ]} />
      <D id="s1-night" question="The night echo said “no thrombus”. How much does that reassure you?"
        options={[
          { id: 'a', label: 'Very little until I know the apical views showed the true apex — foreshortened views routinely miss apical thrombus', verdict: 'best', points: 10, why: 'Sensitivity of non-contrast TTE for LV thrombus is modest even in good hands; in a foreshortened view the apex is simply not in the picture.' },
          { id: 'b', label: 'Enough — a registrar looked', verdict: 'wrong', points: 0, why: 'A negative study is only as good as the views it contains.' },
          { id: 'c', label: 'Skip echo and go straight to CMR', verdict: 'ok', points: 4, why: 'CMR with late gadolinium is the most sensitive test — but a proper echo today, with contrast, answers most of the questions now.' },
        ]} />
      <Contrast title="a true aneurysm vs a pseudoaneurysm"
        is={{ h: '🫧 True aneurysm', points: ['Wide neck — mouth as wide as the sac', 'Wall = thinned scarred myocardium', 'Usually apical / anterior (LAD)', 'Rupture rare; thrombus and VT common'] }}
        isnt={{ h: '💣 Pseudoaneurysm', points: ['Narrow neck (< half the sac diameter)', 'Wall = pericardium and clot — a contained rupture', 'Often inferior / posterolateral', 'Can rupture any minute: urgent surgery'] }} />
    </>
  );
}

/* ============================================================
   2 · THE PROBE AND THE PLANES
   ============================================================ */

const NAME = [
  { id: 'n1', view: 'plax', opts: ['plax', 'a3c', 'psax-av', 'sub4c'] },
  { id: 'n2', view: 'psax-pm', opts: ['psax-mv', 'psax-pm', 'psax-av', 'a2c'] },
  { id: 'n3', view: 'a4c', opts: ['a2c', 'sub4c', 'a4c', 'a5c'] },
  { id: 'n4', view: 'a2c', opts: ['a4c', 'a3c', 'psax-ap', 'a2c'] },
];

function Planes() {
  return (
    <>
      <p className="cs-p">🎮 This is the scanner. The probe sits on the chest; the cyan fan is the slice of the heart the beam is cutting — and the screen shows exactly that slice. Choose a window, then <b>slide, rotate, tilt and rock</b>. Click the screen to open it wide beside a labelled diagram of the same slice.</p>
      <EchoLab start="plax" />
      <Note kind="pearl" title="🟢 The index marker">
        Every probe has a marker on one side. Its side of the fan appears on the <b>right of the screen</b> (cardiology convention). PLAX: marker to the right shoulder. Short axis: rotate 90° clockwise, marker to the left shoulder. Apical four-chamber: marker to the patient’s left (3 o’clock).
      </Note>
      <Why title="🔊 Why blood is black and muscle is grey" chain={[
        { k: 'PULSE', t: 'The probe sends short sound pulses and listens' },
        { k: 'INTERFACES', t: 'Echoes come back where tissue properties change' },
        { k: 'BLOOD', t: 'Blood is acoustically uniform → almost no echoes → black' },
        { k: 'MUSCLE', t: 'Fibres scatter sound in all directions → grey speckle' },
        { k: 'SCAR & VALVES', t: 'Dense collagen reflects strongly → bright' },
      ]}>
        So a bright, thin apex is scar; a grey mass in a black cavity is something that should not be there.
      </Why>
      <Contrast title="PLAX vs apical three-chamber"
        is={{ h: '📏 PLAX (parasternal window)', points: ['Beam crosses the LV side-on', 'Best for wall thickness and LV diameter', 'Apex never seen', 'Doppler badly aligned with flow'] }}
        isnt={{ h: '📐 A3C (apical window)', points: ['Same plane, seen from the apex', 'Shows the apex and the anteroseptum to the tip', 'Lateral resolution worse at depth', 'Doppler aligned with LVOT and mitral flow'] }} />
      <h2 className="cs-h2">🔎 Name that view</h2>
      <div className="cs-grid2">
        {NAME.map((n, i) => (
          <D key={n.id} id={`s2-${n.id}`} question={`🖼️ Image ${i + 1}: which view is this?`}
            options={n.opts.map(o => ({ id: o, label: VIEW_BY_ID[o].name, verdict: o === n.view ? 'best' : 'wrong', points: o === n.view ? 10 : 0, why: VIEW_BY_ID[o].shows }))}>
            <ViewThumb view={n.view} />
          </D>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   3 · THE PATIENT ON THE COUCH
   ============================================================ */

function Couch() {
  return (
    <>
      <D id="s3-position" question="🛏️ How do you position him for the apical views?"
        options={[
          { id: 'a', label: 'Left lateral decubitus, left arm up behind the head; scan at end-expiration', verdict: 'best', points: 10, why: 'Rolling left brings the apex against the chest wall and moves lung out of the way; raising the arm opens the interspaces; expiration lifts the diaphragm and pulls lung back.' },
          { id: 'b', label: 'Flat on his back', verdict: 'ok', points: 3, why: 'Fine for subcostal views — but the apex falls away and lung gets in the way of apical views.' },
          { id: 'c', label: 'Sitting upright', verdict: 'wrong', points: 0, why: 'The heart drops away from the anterior chest wall.' },
        ]} />
      <D id="s3-ecg" question="Why attach the ECG leads before you scan?"
        options={[
          { id: 'a', label: 'To time the cardiac cycle: end-diastole at the QRS, end-systole at the end of the T wave — measurements are made at defined frames', verdict: 'best', points: 10 },
          { id: 'b', label: 'Only to record the heart rate', verdict: 'ok', points: 3 },
          { id: 'c', label: 'It is optional for a transthoracic echo', verdict: 'wrong', points: 0, why: 'Without it, volumes and diameters are measured at random frames.' },
        ]} />
      <Contrast title="end-diastole vs end-systole"
        is={{ h: '🔵 End-diastole', points: ['First frame after mitral valve closure / at the QRS', 'Largest LV cavity', 'LVIDd, EDV, wall thickness', 'Measured here: dilatation'] }}
        isnt={{ h: '🔴 End-systole', points: ['Frame before mitral opening / end of T wave', 'Smallest LV cavity', 'LVIDs, ESV', 'Measured here: contractility (ESV, EF)'] }} />
    </>
  );
}

/* ============================================================
   4 · THE 17 SEGMENTS
   ============================================================ */

function Segments() {
  return (
    <>
      <p className="cs-p">The left ventricle is described in 17 segments — six basal, six mid, four apical and the apical cap — laid out as a bullseye (anterior at the top, septum on the left). Each standard view cuts two opposite walls; together they show all 17. The colours are the usual coronary territories.</p>
      <div className="cs-grid2">
        <div className="cs-card tight" style={{ display: 'grid', placeItems: 'center' }}>
          <Bullseye fill={s => TCOL[TERRITORY[s]]} />
          <p className="cs-pts"><span style={{ color: TCOL.LAD }}>■ LAD</span> · <span style={{ color: TCOL.RCA }}>■ RCA</span> · <span style={{ color: TCOL.LCx }}>■ LCx</span> (apical segments vary with dominance and the LAD’s wrap)</p>
        </div>
        <Table head={['View', 'Walls it cuts']} rows={[
          ['PLAX / A3C', 'Anteroseptal (2, 8) ↔ inferolateral (5, 11)'],
          ['A4C', 'Inferoseptal (3, 9, 14) ↔ anterolateral (6, 12, 16)'],
          ['A2C', 'Inferior (4, 10, 15) ↔ anterior (1, 7, 13)'],
          ['PSAX (each level)', 'All six walls of that level at once'],
          ['Any apical view', 'The apical cap (17) — only if the true apex is in the plane'],
        ]} />
      </div>
      <MS id="s4-lad" question="🩸 Which segments does the LAD usually supply?"
        items={[
          { id: 'a', label: 'Basal and mid anterior (1, 7)', correct: true },
          { id: 'b', label: 'Basal and mid anteroseptal (2, 8)', correct: true },
          { id: 'c', label: 'Apical anterior and apical septal (13, 14) and the apex (17)', correct: true },
          { id: 'd', label: 'Basal and mid inferior (4, 10)', correct: false, why: 'RCA (or a dominant LCx).' },
          { id: 'e', label: 'Basal and mid inferolateral (5, 11)', correct: false, why: 'LCx.' },
        ]} />
      <Why title="📐 Why a short axis must be round" chain={[
        { k: 'GEOMETRY', t: 'The LV is roughly a cylinder ending in a cone' },
        { k: 'PERPENDICULAR CUT', t: 'A plane square to the long axis gives a circle' },
        { k: 'OBLIQUE CUT', t: 'A tilted plane gives an oval and slices walls at an angle' },
        { k: 'FALSE READING', t: 'Walls cut obliquely look thicker or “hypokinetic” when they are not' },
      ]} />
    </>
  );
}

/* ============================================================
   5 · MACHINE SET-UP
   ============================================================ */

function Setup() {
  return (
    <>
      <MS id="s5-knobs" question="🎛️ Which settings make a better study?"
        items={[
          { id: 'a', label: 'Depth just enough to include the structure of interest (LA in PLAX)', correct: true, why: 'Less depth = higher frame rate and a bigger image.' },
          { id: 'b', label: 'Gain so blood is black but the endocardium still visible', correct: true },
          { id: 'c', label: 'Narrow sector for wall motion and Doppler', correct: true, why: 'Fewer scan lines per frame → higher frame rate.' },
          { id: 'd', label: 'Harmonic imaging on', correct: true, why: 'Cleaner endocardial borders, less near-field clutter.' },
          { id: 'e', label: 'Maximum gain to “see everything”', correct: false, why: 'Fills the cavity with noise — the commonest way to call a false thrombus.' },
          { id: 'f', label: 'Focus at the top of the sector always', correct: false, why: 'Put the focus at the level of interest — the apex for thrombus.' },
        ]} />
      <Sequence id="s5-order" question="🗂️ The standard order of a transthoracic study"
        steps={[
          { label: 'Parasternal long axis (± RV inflow / outflow)' },
          { label: 'Parasternal short axis: aortic valve → mitral → papillary → apex' },
          { label: 'Apical four-, five-, two- and three-chamber views' },
          { label: 'Subcostal four-chamber and IVC' },
          { label: 'Suprasternal (aortic arch) if needed' },
        ]} />
      <Note kind="warn" title="🔁 Near-field clutter">
        The apex is the structure nearest the probe in apical views — exactly where reverberation and near-field noise live. Lower the depth, move the focus up, try harmonics and, if still unsure, give contrast.
      </Note>
    </>
  );
}

/* ============================================================
   6 · ACQUIRE THE STUDY
   ============================================================ */

const NEED = ['plax', 'psax-mv', 'psax-pm', 'a4c', 'a2c', 'a3c', 'sub4c'];

function Acquire() {
  const { answers, answer } = useCase();
  const clips = answers['s6-clips'] || {};
  const store = c => { if (!clips[c.view] || clips[c.view] < c.q) answer('s6-clips', { ...clips, [c.view]: c.q }); };
  const got = NEED.filter(v => (clips[v] || 0) >= 70).length;
  const done = answers['s6-done'];
  const pts = done ? Math.round(25 * got / NEED.length) : null;
  return (
    <>
      <p className="cs-p">Now scan him yourself — <b>no preset buttons</b>. Put the probe on a window and use the movements. When the quality meter is green, press <b>📸 Store clip</b>. Store the seven views below at ≥ 70% quality.</p>
      <Note kind="pearl" title="🧭 How the views connect">
        PLAX → rotate 90° → short axis at the valve → <b>tilt</b> toward the apex for mitral, papillary and apical levels. Apical four-chamber → rotate ~60° → two-chamber → rotate a further ~60° → three-chamber. Subcostal: probe flat under the ribs aiming at the left shoulder.
      </Note>
      <EchoLab start="plax" presets={false} onAcquire={store} />
      <div className="cs-card tight">
        <p className="cs-q">📼 Stored — {got}/{NEED.length} at ≥ 70%</p>
        <div className="ec-rows">
          <div className="ec-row">{NEED.map(v => <span key={v} className={'cs-chip' + ((clips[v] || 0) >= 70 ? ' on' : '')}>{(clips[v] || 0) >= 70 ? '✅' : '⬜'} {VIEW_BY_ID[v].short}{clips[v] != null ? ` ${clips[v]}%` : ''}</span>)}</div>
        </div>
        <div className="cs-row" style={{ marginTop: 10 }}>
          <button className="cs-btn primary" onClick={() => answer('s6-done', true)} disabled={!!done || got === 0}>✅ Study complete — score it</button>
          {done && <span className="ec-score">+{pts} / 25</span>}
        </div>
        <ScoreOnce id="s6-study" pts={pts} max={25} />
      </div>
      <D id="s6-psax" question="Your mid short axis looks oval and the septum looks “hypokinetic”. What first?"
        options={[
          { id: 'a', label: 'Fix the plane — rotate and tilt until the cavity is round, then re-judge the septum', verdict: 'best', points: 10, why: 'Oblique cuts create false wall-motion abnormalities.' },
          { id: 'b', label: 'Report septal hypokinesis', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'Increase the gain', verdict: 'wrong', points: 0 },
        ]} />
    </>
  );
}

/* ============================================================
   7 · MEASURE — LV SIZE, EF, WALL MOTION
   ============================================================ */

const TRUE_LVIDD = 6.0;

function WallMotion() {
  const { answers, answer } = useCase();
  const sel = answers['s7-wm-sel'] || [];
  const done = answers['s7-wm-done'];
  const truth = MOTION.map(m => m > 0);
  const got = done ? truth.filter((t, i) => t === sel.includes(i)).length : null;
  const toggle = s => !done && answer('s7-wm-sel', sel.includes(s) ? sel.filter(x => x !== s) : [...sel, s]);
  return (
    <div className="cs-card">
      <p className="cs-q">🎯 Mark every segment that does NOT move normally (tap to toggle), then check.</p>
      <div className="cs-grid2" style={{ alignItems: 'center' }}>
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <Bullseye fill={s => done ? MCOL[MOTION[s]] : sel.includes(s) ? '#FB7185' : '#1F3350'} onPick={toggle} />
          {TEST && <span hidden data-wm={JSON.stringify(truth.map((t, i) => t ? i : -1).filter(i => i >= 0))} />}
        </div>
        <div>
          {done ? (
            <>
              <p className="ec-score">{got} / 17 segments called right</p>
              <p className="cs-p" style={{ fontSize: 14 }}>🟢 normal · 🟡 hypokinetic · 🔴 akinetic · 🟣 dyskinetic/aneurysmal. The whole LAD territory from the mid level down is abnormal; the apex is a thin, bulging aneurysm. Basal segments outside the LAD territory move — that is why the EF is ~{Math.round(EF * 100)}% and not lower.</p>
            </>
          ) : <button className="cs-btn primary" onClick={() => answer('s7-wm-done', true)} disabled={!sel.length}>Check wall motion</button>}
        </div>
      </div>
      <ScoreOnce id="s7-wm" pts={got} max={17} />
    </div>
  );
}

function Measure() {
  const { answers, answer } = useCase();
  const m = answers['s7-lvidd'];
  const pts = m ? (m.ed && Math.abs(m.cm - TRUE_LVIDD) <= 0.4 ? 12 : Math.abs(m.cm - TRUE_LVIDD) <= 0.8 ? 6 : 2) : null;
  return (
    <>
      <p className="cs-p">📐 <b>LV internal diameter.</b> In PLAX: <b>❄ Freeze</b>, press <b>ED</b> (end-diastole), switch on <b>📐 Calipers</b> and click the septal endocardium, then the posterior wall endocardium, square to the long axis at the level of the mitral leaflet tips.</p>
      <EchoLab start="plax" onMeasure={(cm, { phase }) => !m && answer('s7-lvidd', { cm, ed: phase != null && (phase < 0.05 || phase > 0.95) })} />
      {m && <p className="ec-score">📏 LVIDd {m.cm.toFixed(1)} cm {m.ed ? '(at end-diastole ✅)' : '(not at end-diastole ⚠️)'} — the model’s true value is {TRUE_LVIDD.toFixed(1)} cm (normal ≤ 5.8 cm in men) → +{pts} / 12</p>}
      <ScoreOnce id="s7-lvidd" pts={pts} max={12} />
      <h2 className="cs-h2">🧮 Biplane Simpson’s</h2>
      <Table head={['', 'A4C + A2C traced', 'Normal (men)']} rows={[
        ['End-diastolic volume', `${Math.round(EDV)} mL`, '62–150 mL'],
        ['End-systolic volume', `${Math.round(ESV)} mL`, '21–61 mL'],
        ['Ejection fraction', `${Math.round(EF * 100)}%`, '≥ 52%'],
      ]} />
      <D id="s7-ef" question="How do you classify his LV function?"
        options={[
          { id: 'a', label: 'Severely reduced (EF ≤ 30%): HFrEF with a dilated LV', verdict: 'best', points: 10, why: `EF ${Math.round(EF * 100)}% with an EDV over 200 mL: severe dysfunction and adverse remodelling.` },
          { id: 'b', label: 'Mildly reduced (41–49%)', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'Moderately reduced (31–40%)', verdict: 'ok', points: 4, why: 'Close — the night echo’s ~35% was an eyeball from foreshortened views, which overestimate EF (the akinetic apex is cut off).' },
        ]} />
      <WallMotion />
      <Contrast title="foreshortened vs true apical view"
        is={{ h: '✅ True apex', points: ['LV long and bullet-shaped', 'Apex thin and still — it hardly moves', 'A4C and A2C lengths within ~10%', 'Apical thrombus and akinesis visible'] }}
        isnt={{ h: '❌ Foreshortened', points: ['LV short and rounded', 'The “apex” moves and thickens (it is mid-wall)', 'EF overestimated, volumes underestimated', 'Apical thrombus and aneurysm cut out of the picture'] }} />
    </>
  );
}

/* ============================================================
   8 · THE REPORT AND THE PLAN
   ============================================================ */

function Report() {
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">📝 08:20</span>Your report: <b>dilated LV (LVIDd 6.0 cm, EDV ~{Math.round(EDV)} mL), EF ~{Math.round(EF * 100)}% by biplane Simpson’s. Akinesis of the LAD territory with a thin dyskinetic apical aneurysm. A 2.0 × 1.5 cm laminated, mobile-edged apical thrombus. Moderate functional MR. No VSD, no effusion.</b></p>
      </div>
      <D id="s8-ac" question="💊 How do you treat the LV thrombus?"
        options={[
          { id: 'a', label: 'Oral anticoagulation (warfarin or a DOAC) for 3–6 months with repeat imaging; with no stent, OAC plus clopidogrel and stop aspirin', verdict: 'best', points: 10, why: 'ESC 2023 ACS / AHA 2022: anticoagulate LV thrombus for 3–6 months, guided by imaging. Avoid triple therapy without a stent to limit bleeding.' },
          { id: 'b', label: 'Continue dual antiplatelets only', verdict: 'wrong', points: 0, why: 'Antiplatelets do not prevent embolism from a ventricular thrombus.' },
          { id: 'c', label: 'Urgent surgical thrombectomy', verdict: 'wrong', points: 0, why: 'Reserved for exceptional cases (huge mobile thrombus with failed anticoagulation or another reason for surgery).' },
        ]} />
      <D id="s8-icd" question="⚡ His EF is 27%. When is an ICD considered?"
        options={[
          { id: 'a', label: 'Not now — reassess EF after ≥ 40 days post-MI (≥ 90 days after revascularisation) on optimal medical therapy', verdict: 'best', points: 10, why: 'Early ICD after MI did not improve survival (DINAMIT, IRIS); stunned myocardium can recover. A wearable defibrillator is an option for selected patients.' },
          { id: 'b', label: 'Implant this week', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'Never — EF will not improve', verdict: 'wrong', points: 0 },
        ]} />
      <MS id="s8-gdmt" question="🫀 Heart-failure therapy to start or optimise"
        items={[
          { id: 'a', label: 'ACE inhibitor/ARB or sacubitril–valsartan', correct: true },
          { id: 'b', label: 'Beta-blocker (titrate bisoprolol)', correct: true },
          { id: 'c', label: 'Mineralocorticoid receptor antagonist', correct: true },
          { id: 'd', label: 'SGLT2 inhibitor', correct: true },
          { id: 'e', label: 'Loop diuretic for congestion', correct: true },
          { id: 'f', label: 'Non-dihydropyridine calcium-channel blocker for rate', correct: false, why: 'Negatively inotropic — harmful in HFrEF.' },
        ]} />
    </>
  );
}

/* ============================================================
   9 · THE CRISIS — SHOW THEM THE THROMBUS
   ============================================================ */

function Crisis() {
  const { answers, answer, setVitals, bump } = useCase();
  const lock = answers['s9-view'];
  const pts = lock ? (lock.apexOff < 0.8 && lock.q >= 80 ? 15 : lock.q >= 60 ? 6 : 0) : null;
  return (
    <>
      <div className="cs-card cs-vignette">
        <p className="cs-p"><span className="cs-time">🚨 08:40</span>Before the first anticoagulant dose: the nurse calls — Mr Nassar cannot find his words and his right arm is weak. Onset 08:35. BP 168/94, glucose 7.2.</p>
      </div>
      <BedsideMonitor />
      <D id="s9-first" question="⏱️ First action?"
        onAnswer={o => setVitals(o.id === 'a' ? { hr: 98, sys: 160, dia: 90 } : { hr: 104, sys: 172, dia: 96 })}
        options={[
          { id: 'a', label: 'Stroke code now: time of onset, NIHSS, glucose, CT + CT angiography for a large-vessel occlusion', verdict: 'best', points: 10, why: 'Cardioembolic strokes are often large-vessel occlusions — thrombectomy is time-critical. Whether IV thrombolysis is safe three weeks after a large MI with a known LV thrombus is a stroke-team decision; it must not delay imaging or thrombectomy.' },
          { id: 'b', label: 'Give the first dose of anticoagulant now', verdict: 'wrong', points: 0, why: 'Not before haemorrhage is excluded and the infarct size is known.' },
          { id: 'c', label: 'Repeat the echo first', verdict: 'wrong', points: 0, why: 'Imaging the brain comes first; the heart can wait minutes.' },
        ]} />
      <p className="cs-p">CT angiography: left M2 occlusion; thrombectomy is arranged. The stroke consultant asks: <i>“Is there really a clot in the ventricle? The night echo said no.”</i> The probe is where the night scan left it — one space too high and too medial. <b>Fix the view and show the apex.</b></p>
      <EchoLab startPose={FORESHORTENED} task={{ view: 'a4c', prompt: 'A true apical four-chamber: the real apex in the plane', noWindows: true }} height={380}
        onLock={r => !lock && answer('s9-view', { q: r.q, apexOff: r.apexOff })} />
      {lock && <p className="ec-score">🔒 Quality {lock.q}% · true apex {lock.apexOff.toFixed(1)} cm from the plane → +{pts} / 15 {lock.apexOff >= 0.8 ? '— still foreshortened: slide down an interspace and lateral, then tilt' : '— the thrombus is in the picture'}</p>}
      <ScoreOnce id="s9-view" pts={pts} max={15} />
      <D id="s9-contrast" onAnswer={o => o.id === 'a' && bump({ contrast: 1.5 })} question="The apex is near-field and cluttered. How do you make the thrombus undeniable?"
        options={[
          { id: 'a', label: 'Ultrasound-enhancing agent (contrast): the cavity fills white and the thrombus is a black filling defect; CMR with late gadolinium if still unsure', verdict: 'best', points: 10, why: 'Contrast roughly doubles the detection of LV thrombus compared with plain TTE; CMR is the reference standard.' },
          { id: 'b', label: 'Turn the gain up', verdict: 'wrong', points: 0, why: 'More noise in the near field, not more thrombus.' },
          { id: 'c', label: 'Transoesophageal echo', verdict: 'ok', points: 3, why: 'TOE is good for the atria and appendage, but the LV apex is far from the oesophagus — often worse than TTE.' },
        ]} />
      <D id="s9-ac" question="After thrombectomy (small infarct on MRI), when does anticoagulation start?"
        options={[
          { id: 'a', label: 'Early, timed by the stroke team on infarct size and bleeding — small infarcts within days', verdict: 'best', points: 10, why: 'The risk of re-embolism from a known thrombus is balanced against haemorrhagic transformation; ELAN supports early DOAC start after small/moderate cardioembolic strokes (in AF).' },
          { id: 'b', label: 'Wait 3 months', verdict: 'wrong', points: 0, why: 'Leaves the clot free to embolise again.' },
          { id: 'c', label: 'Full-dose heparin tonight regardless of the scan', verdict: 'wrong', points: 0 },
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
      <ViciousCycle id="cyc-thrombus" title="🔁 The aneurysm that feeds the clot"
        nodes={[
          { t: 'Unreperfused anterior infarct', short: 'Infarct', d: 'Transmural necrosis of the LAD territory.' },
          { t: 'Thin scar bulges (dyskinesia)', short: 'Aneurysm', d: 'The apex balloons outward every systole.' },
          { t: 'Stasis in the apical pouch', short: 'Stasis', d: 'Blood swirls slowly where the wall does not squeeze.' },
          { t: 'Laminated thrombus', short: 'Thrombus', d: 'Virchow’s triad complete.' },
          { t: 'Embolism — brain, gut, limbs', short: 'Embolus', d: 'The mobile edge breaks off.' },
        ]}
        breaks={[
          { at: 0, t: 'Early reperfusion prevents the aneurysm in the first place.' },
          { at: 3, t: 'Find it (true apex, contrast) and anticoagulate for 3–6 months.' },
          { at: 2, t: 'GDMT reverses remodelling and reduces stasis over months.' },
        ]} />
      <ViciousCycle id="cyc-remodel" title="🔁 Remodelling: the bigger it gets, the bigger it gets"
        nodes={[
          { t: 'Loss of contracting muscle', short: 'Loss', d: 'Stroke volume falls.' },
          { t: 'Neurohormonal activation', short: 'RAAS', d: 'Renin–angiotensin–aldosterone and sympathetic drive retain salt and water.' },
          { t: 'LV dilates (preload ↑)', short: 'Dilation', d: 'Frank–Starling buys stroke volume for a while.' },
          { t: 'Wall stress ↑ (Laplace: T ∝ P·r / h)', short: 'Wall stress', d: 'A bigger radius with a thin wall means more tension and more oxygen demand.' },
          { t: 'Functional MR + more dilation', short: 'MR', d: 'The annulus stretches and leaflets tether — volume overload feeds the cycle.' },
        ]}
        breaks={[
          { at: 1, t: 'ACEi/ARNI, MRA, beta-blocker, SGLT2i: block the neurohormonal drive.' },
          { at: 3, t: 'Lower afterload and heart rate reduce wall stress.' },
          { at: 4, t: 'Treat significant functional MR when it persists on optimal therapy.' },
        ]} />
      <D id="cyc-q" question="Which step explains why an EF eyeballed from a foreshortened view is too HIGH?"
        options={[
          { id: 'a', label: 'The akinetic apex is cut out of the plane, so only the moving basal and mid walls are judged', verdict: 'best', points: 10 },
          { id: 'b', label: 'Foreshortening increases contractility', verdict: 'wrong', points: 0 },
          { id: 'c', label: 'Harmonic imaging exaggerates motion', verdict: 'wrong', points: 0 },
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
      <WarStory title="⚰️ “No thrombus seen”"
        mistake="Apical views from one interspace too high: a foreshortened ventricle, the apex never in the plane."
        burn="No true apex, no comment on thrombus. Check the LV length; give contrast when the apex is not crisp.">
        <p className="cs-p">A 61-year-old after a late anterior MI had a bedside echo reported as “no LV thrombus”. Anticoagulation was not started. Five days later: a basilar artery occlusion. He died in intensive care. The post-mortem showed a 3 cm laminated apical thrombus with a fresh broken edge.</p>
      </WarStory>
      <D id="mm-1" question="Which single check would most likely have saved him?"
        options={[
          { id: 'a', label: 'Confirming a non-foreshortened apex (long LV, still thin apex) — and contrast when unsure', verdict: 'best', points: 10 },
          { id: 'b', label: 'A second parasternal view', verdict: 'wrong', points: 0, why: 'The apex is never in PLAX.' },
          { id: 'c', label: 'A higher frame rate', verdict: 'wrong', points: 0 },
        ]} />
      <WarStory title="💣 The aneurysm that was not an aneurysm"
        mistake="A narrow-necked inferolateral outpouching after MI called a true aneurysm and booked for clinic review."
        burn="Measure the neck. Narrow neck, abrupt edge, pericardium for a wall = pseudoaneurysm = surgeon today.">
        <p className="cs-p">Three weeks later the contained rupture gave way at home. He arrived in PEA arrest with tamponade and could not be saved.</p>
      </WarStory>
      <WarStory title="🕳️ The murmur that was a hole"
        mistake="A new harsh pansystolic murmur after MI attributed to mitral regurgitation; colour Doppler never placed over the septum."
        burn="New murmur after MI: colour across the whole septum in PSAX, A4C and subcostal — look for a VSD.">
        <p className="cs-p">Day 4 after an inferior MI she became hypotensive. The echo commented only on the mitral valve. Twelve hours later: cardiogenic shock; a basal inferoseptal rupture with a 2:1 shunt. She survived emergency surgery after six days of mechanical support.</p>
      </WarStory>
      <D id="mm-3" question="Where does a post-infarct VSD usually sit after an INFERIOR MI?"
        options={[
          { id: 'a', label: 'Basal inferoseptum — best seen in PSAX basal and subcostal views', verdict: 'best', points: 10, why: 'Anterior MIs tear the apical septum; inferior MIs tear the basal inferior septum, often serpiginous and harder to see.' },
          { id: 'b', label: 'Apical septum', verdict: 'ok', points: 4, why: 'That is the anterior-MI pattern.' },
          { id: 'c', label: 'Membranous septum', verdict: 'wrong', points: 0 },
        ]} />
      <WarStory title="🩸 The effusion that was fat"
        mistake="An anterior echo-bright space taken for a pericardial effusion; a pericardiocentesis needle went in."
        burn="Effusion collects posteriorly first and is echo-free; anterior isolated brightness is usually epicardial fat. Use the descending aorta: pericardial fluid stops in front of it, pleural fluid goes behind.">
        <p className="cs-p">The needle entered the right ventricle. A haemopericardium developed and she needed an emergency sternotomy — a near-death caused by a procedure for a problem she never had.</p>
      </WarStory>
      <WarStory title="🫁 The ventilated patient with “no window”"
        mistake="Only parasternal attempts in a ventilated post-operative patient; subcostal view never tried; ‘images non-diagnostic’."
        burn="When the chest windows fail, go subcostal — the liver is your window. Never stop at ‘non-diagnostic’ in an unstable patient.">
        <p className="cs-p">Six hours after cardiac surgery his blood pressure sagged. The study was abandoned as non-diagnostic. A localised posterior clot was compressing the left atrium. He arrested; re-sternotomy in the ICU saved him.</p>
      </WarStory>
      <D id="mm-5" question="Why is the subcostal window so useful after cardiac surgery or in ventilated patients?"
        options={[
          { id: 'a', label: 'It avoids the dressings, drains and over-inflated lungs — the liver transmits sound to the heart', verdict: 'best', points: 10 },
          { id: 'b', label: 'It gives the best apical views', verdict: 'wrong', points: 0, why: 'Subcostal views foreshorten the LV.' },
          { id: 'c', label: 'It needs no gel', verdict: 'wrong', points: 0 },
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
      <MS id="s10-dc" question="🏠 Discharge and follow-up"
        items={[
          { id: 'a', label: 'Anticoagulant (after the stroke team’s timing) + clopidogrel; aspirin stopped', correct: true },
          { id: 'b', label: 'Repeat echo with contrast (or CMR) at about 3 months to confirm the thrombus has resolved', correct: true },
          { id: 'c', label: 'GDMT titration in the heart-failure clinic; EF reassessed before any ICD decision', correct: true },
          { id: 'd', label: 'Driving: no driving after stroke and ACS until cleared; lorry licence rules are stricter', correct: true },
          { id: 'e', label: 'Stop anticoagulation when he goes home', correct: false },
        ]} />
      <h2 className="cs-h2">📝 Ten questions</h2>
      <Quiz id="s10-quiz" items={[
        { q: 'On the screen, the index-marker side of the sector appears…', options: ['On the left', 'On the right', 'At the bottom', 'It varies by view'], answer: 1, why: 'Cardiology convention: marker side on the right of the display.' },
        { q: 'PLAX shows which pair of walls?', options: ['Anterior and inferior', 'Anteroseptal and inferolateral', 'Inferoseptal and anterolateral', 'Septal and lateral apex'], answer: 1, why: 'And A3C shows the same walls from the apex.' },
        { q: 'A4C shows which pair of walls?', options: ['Inferoseptal and anterolateral', 'Anterior and inferior', 'Anteroseptal and inferolateral', 'Only the apex'], answer: 0 },
        { q: 'From A4C to A2C you rotate the probe about…', options: ['30°', '60° anticlockwise', '180°', '90° clockwise'], answer: 1 },
        { q: 'Signs of a foreshortened apical view include…', options: ['A long, bullet-shaped LV', 'A short, rounded LV whose “apex” moves and thickens', 'The LVOT in view', 'The RV larger than the LV'], answer: 1 },
        { q: 'LVIDd is measured in PLAX at…', options: ['End-systole, at the apex', 'End-diastole, at the mitral leaflet tips, square to the long axis', 'Any frame', 'Mid-systole at the papillary muscles'], answer: 1 },
        { q: 'The normal biplane EF in adults is…', options: ['≥ 40%', '≥ 52% (men) / ≥ 54% (women)', '≥ 70%', '30–40%'], answer: 1, why: 'ASE/EACVI 2015.' },
        { q: 'An LV thrombus is best confirmed by…', options: ['Higher gain', 'Contrast echo or CMR with late gadolinium', 'TOE', 'A chest X-ray'], answer: 1 },
        { q: 'A pseudoaneurysm differs from a true aneurysm by…', options: ['A wide neck', 'A narrow neck and a wall of pericardium and clot', 'Apical location', 'No risk of rupture'], answer: 1 },
        { q: 'Pericardial vs pleural effusion in PLAX: pericardial fluid…', options: ['Goes behind the descending aorta', 'Stays in front of the descending aorta', 'Is always echogenic', 'Collects anteriorly first'], answer: 1 },
      ]} />
      <div className="cs-card">
        <h2 className="cs-h2" style={{ marginTop: 0 }}>🏆 Your score</h2>
        <p className="cs-p" style={{ fontSize: 20 }}><b className="cs-mono">{totals.got} / {totals.max}</b> · {pct}%</p>
        <Table head={['Stage', 'Points']} rows={def.stages.map(st => [st.title, `${totals.by[st.id]?.got || 0} / ${totals.by[st.id]?.max || 0}`])} />
      </div>
      <div className="cs-card">
        <h2 className="cs-h2" style={{ marginTop: 0 }}>🔥 Take home</h2>
        <ol className="cs-ul">
          <li className="cs-li">🔷 An echo image is one slice of a 3D heart — know where your slice is.</li>
          <li className="cs-li">🟢 Marker side on the screen’s right; PLAX marker to the right shoulder, rotate 90° for short axis.</li>
          <li className="cs-li">🧭 Slide to change window, rotate to change view, tilt to sweep levels, rock to centre.</li>
          <li className="cs-li">🍩 A short axis must be round; oval = oblique = false wall-motion abnormalities.</li>
          <li className="cs-li">🔻 No true apex, no comment on apical thrombus: long LV, thin still apex, contrast if unsure.</li>
          <li className="cs-li">📐 Measure at defined frames: LVIDd at end-diastole at the leaflet tips.</li>
          <li className="cs-li">🎯 Each view cuts two walls; together they map 17 segments onto three coronary territories.</li>
          <li className="cs-li">💊 LV thrombus: anticoagulate 3–6 months and re-image; avoid unnecessary triple therapy.</li>
          <li className="cs-li">🕳️ New murmur after MI: hunt for VSD and papillary muscle rupture with colour, in several views.</li>
          <li className="cs-li">🫁 Windows fail? Go subcostal.</li>
        </ol>
      </div>
      <CaseLibrary title="📚 Echo library" channels={[
        { name: 'American Society of Echocardiography', url: 'https://www.asecho.org', note: 'Guidelines and standards: chamber quantification, the standard TTE protocol' },
        { name: 'European Society of Cardiology', url: 'https://www.escardio.org', note: 'EACVI recommendations and the ESC clinical guidelines' },
      ]} />
    </>
  );
}

/* ============================================================
   THE CASE
   ============================================================ */

export const ECHO_01 = {
  title: 'Echo 01 · The systematic echo after an anterior MI · The thrombus a foreshortened view missed',
  short: 'Cardiac Imaging · Echo 01',
  patient: {
    name: 'Mr Tarek Nassar',
    meta: '52 M · MRN 6630-2214 · 88 kg',
    flags: [
      { text: 'Late anterior STEMI, 3 weeks', tone: 'red' },
      { text: 'Night echo: “no thrombus”', tone: 'amber' },
      { text: 'T2DM · smoker', tone: 'blue' },
      { text: 'Aspirin + clopidogrel', tone: 'blue' },
    ],
  },
  contrastBudget: { aim: 2, limit: 3, basis: 'ultrasound-enhancing agent (mL)' },
  clock0: min(7, 30),
  vitals0: { hr: 96, sys: 112, dia: 70, spo2: 95, rr: 20, st: 1.5 },
  brand: { icon: '🫀', line: 'Cardiac Imaging · Echo 01' },
  hero: {
    badges: [
      { text: 'Postgrad · Cardiology / EM / IM', tone: 'cyan' },
      { text: '3D echo scanning simulator', tone: 'red' },
      { text: 'ASE/EACVI · ESC 2023 ACS', tone: 'plain' },
    ],
    lines: [
      { text: 'One slice', style: 'outline' },
      { text: 'of a 3D heart', style: 'grad' },
      { text: '& the clot it missed', style: 'cyan' },
    ],
    hook: (
      <>
        A lorry driver who sat out his heart attack at home. A night-time echo that said <span className="g">no thrombus</span>.
        Today you hold the probe: slide, rotate, tilt and watch the beam cut a beating 3D heart — and find the <span className="r">apex</span> that one interspace too high could never show.
      </>
    ),
    image: '/images/cath-lab.webp',
    sims: 's2',
    crisis: 's9',
    cards: [
      { k: '🧔 The patient', t: 'Mr Tarek Nassar, 52 — late anterior STEMI, now in heart failure; night echo “no thrombus”.' },
      { k: '🎮 Your role', t: 'You scan: windows, views, measurements, wall motion, the report.' },
      { k: '🖥️ In your hands', t: 'A 3D probe and heart, a live echo machine, calipers, and a labelled diagram of every slice.' },
      { k: '🧠 How it teaches', t: 'Geometry, not memory: why a view shows one wall and hides another — and who was hurt when it did.' },
    ],
  },
  stages: [
    { id: 's1', icon: '🚑', nav: 'Presentation & Triage', title: 'Presentation — breathless three weeks after an MI', Component: Presentation,
      pill: '🌙 “No thrombus seen”', lede: 'What the echo must answer, and how much a negative study is worth.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 96, sys: 112, dia: 70, spo2: 95, st: 1.5 }); atLeastClock(min(7, 30)); } },
    { id: 's2', icon: '🔊', nav: 'The Probe & the Planes', title: 'The probe and the planes', Component: Planes,
      pill: '🎮 You hold the probe', lede: 'Windows, movements, the index marker — and naming the views.',
      enter: ({ atLeastClock }) => atLeastClock(min(7, 45)) },
    { id: 's3', icon: '🛏️', nav: 'The Patient on the Couch', title: 'The patient on the couch', Component: Couch,
      pill: '↪️ Roll him to the left', lede: 'Position, breathing and the ECG trace.',
      enter: ({ atLeastClock }) => atLeastClock(min(7, 50)) },
    { id: 's4', icon: '🎯', nav: 'The 17 Segments', title: 'Planning — the 17 segments', Component: Segments,
      pill: '🎯 Every view cuts two walls', lede: 'The bullseye, the coronary territories and which view shows which wall.',
      enter: ({ atLeastClock }) => atLeastClock(min(7, 55)) },
    { id: 's5', icon: '🎛️', nav: 'Set-up', title: 'Set-up — the machine and the protocol', Component: Setup,
      pill: '🎛️ Depth, gain, sector, focus', lede: 'Settings that make or break a study, and the standard order.',
      enter: ({ atLeastClock }) => atLeastClock(min(8, 0)) },
    { id: 's6', icon: '🎬', nav: 'Acquire the Study', title: 'Acquire the study — no presets', Component: Acquire,
      pill: '📼 Seven views, by hand', lede: 'Find every standard view with the probe movements and store the clips.',
      enter: ({ atLeastClock }) => atLeastClock(min(8, 5)) },
    { id: 's7', icon: '📐', nav: 'Measure', title: 'Measure — size, function, wall motion', Component: Measure,
      pill: '📐 Calipers at end-diastole', lede: 'LV diameter, biplane EF and the 17-segment wall-motion map.',
      enter: ({ atLeastClock }) => atLeastClock(min(8, 12)) },
    { id: 's8', icon: '📝', nav: 'Report & Plan', title: 'The report and the plan', Component: Report,
      pill: '💊 Anticoagulate, protect, wait', lede: 'LV thrombus, ICD timing and heart-failure therapy.',
      enter: ({ atLeastClock }) => atLeastClock(min(8, 20)) },
    { id: 's9', icon: '🚨', nav: 'The Crisis', title: 'Crisis — the words stop coming', Component: Crisis,
      pill: '🚨 08:40 — aphasia', lede: 'Stroke code, then fix the foreshortened view and show the clot.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 104, sys: 168, dia: 94 }); atLeastClock(min(8, 40)); } },
    { id: 'cyc', icon: '🧠', nav: 'The Vicious Cycle', title: 'The vicious cycle', Component: Cycles,
      pill: '🔁 The why behind the why', lede: 'The aneurysm that feeds the clot; remodelling that feeds itself.',
      enter: ({ setVitals, atLeastClock }) => { setVitals({ hr: 88, sys: 132, dia: 80 }); atLeastClock(min(12, 0)); } },
    { id: 'mm', icon: '💀', nav: 'M&M War Stories', title: 'Morbidity & mortality: war stories', Component: WarStories,
      pill: '⚰️ Every rule was paid for', lede: 'Five patients hurt by a view not taken or misread.',
      enter: ({ atLeastClock }) => atLeastClock(min(12, 30)) },
    { id: 's10', icon: '🏁', nav: 'Debrief & Assessment', title: 'Discharge, debrief & assessment', Component: Debrief,
      pill: '🎓 Score & take-home', lede: 'The plan home, ten questions and your score.',
      enter: ({ atLeastClock }) => atLeastClock(min(24 * 5 + 10, 0)) },
  ],
};

export default function Echo01({ onClose }) {
  return <CaseShell def={ECHO_01} onClose={onClose} />;
}
