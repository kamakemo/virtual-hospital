import React, { useState } from 'react';

/* ============================================================
   RADIATION HEART — PLANNING, OPERATING, RESCUING
   Local to Case 03, in the kit's style.

   HeartTeamPlanner  one patient, five problems: choose a fix for
                     each and an order; the radiated chest answers
                     back with the hazard of every choice
   Pericardiectomy   the operation as a map of the pericardium:
                     which plate to free first, how close to go to
                     the phrenic nerves, what to do over the LAD
   RVRescue          the first night: low output with a dilated RV —
                     each lever moves the numbers, some the wrong way
   ============================================================ */

/* ---------- 1 · the heart-team planner ---------- */

const PLAN = {
  peri: { label: '🛡️ Constrictive pericarditis', opts: [
    { id: 'radical', label: 'Radical pericardiectomy (phrenic to phrenic + diaphragmatic), sternotomy, bypass on standby' },
    { id: 'partial', label: 'Anterior pericardiectomy through a left thoracotomy' },
    { id: 'none', label: 'Diuretics only' },
  ] },
  av: { label: '🫀 Severe calcific aortic stenosis (low-flow)', opts: [
    { id: 'tavi', label: 'Transfemoral TAVI' },
    { id: 'savr', label: 'Surgical AVR at the same sternotomy' },
    { id: 'none', label: 'Leave it' },
  ] },
  cor: { label: '🩸 Ostial left main stenosis 70–80%', opts: [
    { id: 'pci', label: 'IVUS-guided ostial left main PCI' },
    { id: 'cabg', label: 'CABG: LIMA to LAD + vein grafts from the aorta' },
    { id: 'none', label: 'Medical therapy' },
  ] },
  mv: { label: '🪨 Moderate mitral regurgitation, calcified aorto-mitral curtain', opts: [
    { id: 'leave', label: 'Leave it and re-assess once she is unconstricted' },
    { id: 'replace', label: 'Mitral valve replacement' },
  ] },
  order: { label: '🧭 The order', opts: [
    { id: 'cath', label: 'Catheter work first (PCI + TAVI), pericardiectomy ~6 weeks later on aspirin alone' },
    { id: 'peri', label: 'Pericardiectomy first, then the catheter work' },
    { id: 'one', label: 'Everything at one sitting' },
  ] },
};

function hazards(p) {
  const H = [];
  const add = (sev, t) => H.push({ sev, t });
  if (p.av === 'savr') add('high', 'Porcelain aorta: no safe place to cross-clamp or cut. Clamp it and calcium fractures off into the brain, or the aorta splits. A "no-touch" AVR needs deep hypothermic arrest — in a radiated chest.');
  if (p.cor === 'cabg') add('high', 'Vein grafts need a proximal anastomosis on that same porcelain aorta. Her LIMA lay in the mantle field: 1.4 mm, irregular on angiography. The grafts have nowhere good to start.');
  if (p.mv === 'replace') add('high', 'Replacing the mitral valve through a calcified aorto-mitral curtain risks AV-groove disruption and circumflex injury — for MR that is moderate and partly driven by the constriction itself.');
  if (p.peri === 'none') add('high', 'Constriction left in place: the ascites, the liver congestion and the diuretic spiral continue. Diuretics relieve congestion only by starving the ventricles of preload.');
  if (p.peri === 'partial') add('med', 'An anterior-only pericardiectomy leaves the diaphragmatic and inferior surfaces caged. Residual constriction, worse survival, and a redo in a scarred chest.');
  if (p.av === 'none') add('high', 'Severe AS left in place: once the shell is off the LV fills, the flow rises — and so does a gradient the constriction was hiding. A fixed valve also makes any anaesthetic dangerous.');
  if (p.cor === 'none') add('high', 'An untreated ostial left main under general anaesthesia, bleeding and a low-output night: the whole left ventricle hangs on one narrowed ostium.');
  if (p.order === 'peri' && (p.av !== 'none' || p.cor !== 'none')) add('high', 'Pericardiectomy first means a long anaesthetic, blood loss and a low-output risk with a fixed aortic valve and a tight left main still in place.');
  if (p.order === 'one') add('med', 'One sitting: a raw, oozing pericardial bed straight after a left main stent that needs dual antiplatelets, plus contrast and bypass on the kidneys at once.');
  if (p.order === 'cath' && p.cor === 'pci') add('low', 'Plan the antiplatelets: a modern drug-eluting stent with 1 month of dual therapy (high bleeding risk), then aspirin alone through the pericardiectomy.');
  if (p.av === 'tavi') add('low', 'TAVI in a radiated root: check coronary heights and the calcified curtain on CT; her baseline long PR raises the pacemaker risk.');
  if (p.peri === 'radical') add('low', 'Radiation constriction has the worst outcome of any cause after pericardiectomy, because the muscle under the shell is often fibrosed too. Expect a difficult first night.');
  return H;
}

export function planScore(p) {
  let s = 0;
  if (p.peri === 'radical') s += 3; else if (p.peri === 'partial') s += 1;
  if (p.av === 'tavi') s += 3;
  if (p.cor === 'pci') s += 3;
  if (p.mv === 'leave') s += 2;
  if (p.order === 'cath') s += 4; else if (p.order === 'one') s += 1;
  return s;   // max 15
}

export function HeartTeamPlanner({ onResult, done }) {
  const [p, setP] = useState(done?.plan || {});
  const keys = Object.keys(PLAN);
  const full = keys.every(k => p[k]);
  const H = hazards(p);
  const tone = { high: 'var(--red)', med: 'var(--amber)', low: 'var(--green)' };
  return (
    <div className="cs-card">
      <div className="cs-h2" style={{ marginTop: 0 }}>🧭 The sternotomy-risk planner</div>
      <p className="cs-p">Pick a fix for every problem and an order. The radiated chest answers each choice in the hazard list on the right — read it before you commit.</p>
      <div className="cs-grid2" style={{ alignItems: 'start' }}>
        <div>
          {keys.map(k => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div className="cs-pts" style={{ marginBottom: 6, color: 'var(--ink)' }}>{PLAN[k].label}</div>
              <div className="cs-row" style={{ gap: 6 }}>
                {PLAN[k].opts.map(o => (
                  <button key={o.id} className={'cs-chip' + (p[k] === o.id ? ' on' : '')} disabled={!!done} onClick={() => setP({ ...p, [k]: o.id })} style={{ textAlign: 'left', whiteSpace: 'normal' }}>{o.label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="cs-pts" style={{ marginBottom: 6, color: 'var(--ink)' }}>⚠️ What the radiated chest says</div>
          {!H.length && <p className="cs-pts">Choose something.</p>}
          <ul className="cs-ul">
            {H.map((h, i) => <li key={i} className="cs-li" style={{ borderLeft: `3px solid ${tone[h.sev]}`, paddingLeft: 10 }}><b style={{ color: tone[h.sev], fontFamily: 'var(--f-mono)', fontSize: 12 }}>{h.sev.toUpperCase()} · </b>{h.t}</li>)}
          </ul>
        </div>
      </div>
      <div className="cs-row" style={{ marginTop: 10 }}>
        <button className="cs-btn primary" disabled={!full || !!done} onClick={() => onResult?.({ plan: p, score: planScore(p), highs: H.filter(h => h.sev === 'high').length })}>✅ Take this plan to the heart team</button>
        {!full && <span className="cs-pts">{keys.filter(k => p[k]).length}/{keys.length} chosen</span>}
      </div>
    </div>
  );
}

/* ---------- 2 · the pericardiectomy ---------- */

const PATCHES = [
  { id: 'lvAnt', name: 'LV anterolateral wall, to the left phrenic nerve', side: 'lv',
    d: 'M222 104 C262 96 300 120 318 160 C330 196 322 236 300 262 L250 250 C246 214 238 160 222 104 Z',
    opts: [
      { id: 'safe', label: 'Peel to within ~1 cm of the left phrenic nerve, then stop', good: true, msg: 'The LV anterolateral wall is free. The nerve and its pedicle are intact — she will breathe with both hemidiaphragms.' },
      { id: 'nerve', label: 'Diathermy right back to the nerve to get every millimetre', good: false, phrenic: true, msg: 'Free — but the nerve was skeletonised with diathermy. A paralysed left hemidiaphragm in a woman with radiation-fibrosed lungs.' },
    ] },
  { id: 'lvDia', name: 'LV diaphragmatic surface and apex', side: 'lv',
    d: 'M300 262 C282 292 248 306 214 304 L206 268 L250 250 Z',
    opts: [
      { id: 'lift', label: 'Lift the apex gently, free the diaphragmatic surface under direct vision', good: true, msg: 'The inferior LV is free — the surface an anterior-only operation leaves caged.' },
      { id: 'skip', label: 'Leave it — the anterior release is enough', good: false, skip: true, msg: 'Left caged. The LV still cannot fill from below: residual constriction.' },
    ] },
  { id: 'lad', name: 'Calcified plate over the LAD / AV groove', side: 'lv', hazard: true,
    d: 'M200 100 L222 104 C238 160 246 214 250 250 L232 256 C222 210 214 160 200 100 Z',
    opts: [
      { id: 'island', label: 'Leave an island of calcium on the vessel; free the edges around it', good: true, msg: 'The LAD is untouched. An island of calcium constricts nothing once its edges are free.' },
      { id: 'chisel', label: 'Chisel the whole plate off the vessel', good: false, lad: true, msg: 'The plate came off with a piece of the LAD’s wall. Bleeding, a stitch on a beating radiated artery, and an anterior wall that never quite recovers.' },
    ] },
  { id: 'rvAnt', name: 'RV anterior wall and outflow tract', side: 'rv',
    d: 'M120 120 C150 96 186 94 200 100 C214 160 222 210 232 256 L150 262 C126 230 112 170 120 120 Z',
    opts: [
      { id: 'sharp', label: 'Sharp dissection in the plane; leave small islands where the RV wall is paper-thin', good: true, msg: 'The RV is free. Two coin-sized islands left over thin muscle.' },
      { id: 'blunt', label: 'Strip the whole plate with a finger', good: false, tear: true, msg: 'The thin, radiated RV wall tore with the plate — torrential bleeding, bypass on in a hurry, and a stitched RV.' },
    ] },
  { id: 'rvDia', name: 'RV diaphragmatic surface', side: 'rv',
    d: 'M150 262 L232 256 L206 268 L214 304 C186 304 160 290 150 262 Z',
    opts: [
      { id: 'free', label: 'Free it along the diaphragm', good: true, msg: 'The inferior RV is free.' },
      { id: 'skip', label: 'Leave it', good: false, skip: true, msg: 'Left caged.' },
    ] },
  { id: 'cava', name: 'Right atrium, cavo-atrial junctions and the IVC band', side: 'ra',
    d: 'M78 120 C96 108 112 112 120 120 C112 170 126 230 150 262 L120 300 L96 300 C82 250 70 180 78 120 Z',
    opts: [
      { id: 'band', label: 'Divide the constricting band at the IVC and SVC; stay ~1 cm in front of the right phrenic nerve', good: true, msg: 'The IVC band is divided — often the tightest point, and the reason the liver was congested.' },
      { id: 'skip', label: 'Leave the atrium and cavae alone — too thin', good: false, skip: true, msg: 'The IVC band stays: the liver and the ascites will not improve as they should.' },
    ] },
];
const SHELL = 'M70 118 C100 92 170 86 222 100 C280 92 330 130 334 190 C338 250 300 300 230 312 C180 318 120 312 96 302 C72 250 62 170 70 118 Z';

export function scorePeri(log) {
  const ids = log.map(x => x.id);
  const firstRv = ids.findIndex(i => PATCHES.find(p => p.id === i).side === 'rv');
  const lvBefore = ['lvAnt', 'lvDia'].every(i => { const k = ids.indexOf(i); return k >= 0 && (firstRv < 0 || k < firstRv); });
  const chosen = id => log.find(x => x.id === id);
  const complete = PATCHES.every(p => chosen(p.id) && !chosen(p.id).opt.skip);
  const phrenic = !log.some(x => x.opt.phrenic);
  const lad = chosen('lad')?.opt.id === 'island';
  const tear = log.some(x => x.opt.tear);
  return { lvBefore, complete, phrenic, lad, tear,
    score: (lvBefore ? 5 : 0) + (complete ? 5 : 0) + (phrenic ? 4 : 0) + (lad ? 3 : 0) + (tear ? 0 : 3) };   // max 20
}

export function Pericardiectomy({ onResult, done }) {
  const [log, setLog] = useState(done?.log || []);
  const [sel, setSel] = useState(null);
  const freed = id => log.find(x => x.id === id && !x.opt.skip);
  const handled = id => log.find(x => x.id === id);
  const lvFree = freed('lvAnt') && freed('lvDia');
  const rvFreedEarly = log.some((x, k) => PATCHES.find(p => p.id === x.id).side === 'rv' && !x.opt.skip && !(log.slice(0, k).some(y => y.id === 'lvAnt' && !y.opt.skip) && log.slice(0, k).some(y => y.id === 'lvDia' && !y.opt.skip)));
  const nFree = ['lvAnt', 'lvDia', 'rvAnt', 'rvDia', 'cava', 'lad'].filter(freed).length;
  const cvp = Math.max(9, 23 - nFree * 2.3);
  const pa = rvFreedEarly && !lvFree ? 52 : 34 - nFree * 1.5;
  const P = PATCHES.find(p => p.id === sel);
  const choose = o => { setLog([...log, { id: P.id, opt: o }]); setSel(null); };
  const last = log[log.length - 1];
  const res = done;
  return (
    <div className="cs-card tight">
      <div className="cs-grid2" style={{ alignItems: 'start' }}>
        <div className="cs-viewer" style={{ background: '#080406' }}>
          <svg viewBox="40 70 320 260" style={{ width: '100%', display: 'block' }} role="group" aria-label="The pericardium seen through a sternotomy">
            <defs>
              <pattern id="pc-calc" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#B9A98A" /><circle cx="2" cy="2" r="1.4" fill="#E9E1CC" /><circle cx="6" cy="6" r="1" fill="#8F826A" /></pattern>
            </defs>
            <path d={SHELL} fill="#7A2E3A" stroke="#3B0F18" strokeWidth="2" />
            {PATCHES.map(p => {
              const h = handled(p.id), f = freed(p.id);
              return (
                <path key={p.id} d={p.d} fill={f ? (p.hazard && h.opt.id === 'island' ? 'url(#pc-calc)' : '#C0465A') : 'url(#pc-calc)'}
                  opacity={f ? (p.hazard && h.opt.id === 'island' ? 0.55 : 0.95) : 0.92}
                  stroke={sel === p.id ? '#22D3EE' : h && !f ? '#FF4D6D' : '#3B2E22'} strokeWidth={sel === p.id ? 3 : 1.4}
                  style={{ cursor: h || res ? 'default' : 'pointer' }}
                  onClick={() => { if (!h && !res) setSel(p.id); }}>
                  <title>{p.name}</title>
                </path>
              );
            })}
            {/* the LAD, the phrenic nerves */}
            <path d="M206 100 C220 160 230 210 242 254" stroke="#FF6B6B" strokeWidth="2.5" fill="none" strokeDasharray={handled('lad') ? '' : '4 4'} opacity="0.9" />
            <path d="M330 120 C346 180 340 250 310 298" stroke={log.some(x => x.opt.phrenic) ? '#FF4D6D' : '#F5C451'} strokeWidth="2.5" fill="none" />
            <path d="M68 110 C56 180 62 250 92 306" stroke="#F5C451" strokeWidth="2.5" fill="none" />
            <text x="336" y="114" fill="#F5C451" fontSize="10" fontFamily="JetBrains Mono, monospace">L phrenic</text>
            <text x="44" y="104" fill="#F5C451" fontSize="10" fontFamily="JetBrains Mono, monospace">R phrenic</text>
            <text x="196" y="94" fill="#FF6B6B" fontSize="10" fontFamily="JetBrains Mono, monospace">LAD</text>
            <text x="270" y="190" fill="#04121A" fontSize="13" fontWeight="700" fontFamily="JetBrains Mono, monospace">LV</text>
            <text x="150" y="190" fill="#04121A" fontSize="13" fontWeight="700" fontFamily="JetBrains Mono, monospace">RV</text>
            <text x="84" y="214" fill="#04121A" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono, monospace">RA</text>
          </svg>
        </div>
        <div>
          <div className="cs-readout" style={{ marginTop: 0 }}>
            <div><span>CVP</span><b style={{ color: cvp > 16 ? 'var(--red)' : 'var(--green)' }}>{Math.round(cvp)} mmHg</b></div>
            <div><span>PA systolic</span><b style={{ color: pa > 45 ? 'var(--red)' : undefined }}>{Math.round(pa)} mmHg</b></div>
            <div><span>Surfaces freed</span><b>{nFree}/6</b></div>
          </div>
          {rvFreedEarly && !lvFree && <div className="cs-fb wrong" style={{ marginTop: 10 }}>⚠️ The RV is free and pumping harder into a left ventricle that is still caged. The PA pressure is climbing and the lungs are getting wet — free the LV.</div>}
          {!P && !res && <p className="cs-pts" style={{ marginTop: 10 }}>Tap a calcified plate on the heart to work on it. Order matters. The yellow lines are the phrenic nerves; the red line is the LAD.</p>}
          {P && (
            <div className="cs-card" style={{ marginTop: 10 }}>
              <p className="cs-q">✂️ {P.name}</p>
              <div className="cs-opts">
                {P.opts.map((o, i) => (
                  <button key={o.id} className="cs-opt" onClick={() => choose(o)}><span className="cs-opt-k">{String.fromCharCode(65 + i)}</span><span>{o.label}</span></button>
                ))}
              </div>
              <button className="cs-btn" style={{ marginTop: 8 }} onClick={() => setSel(null)}>Back</button>
            </div>
          )}
          {last && <div className={'cs-fb ' + (last.opt.good ? 'best' : 'wrong')} style={{ marginTop: 10 }}>{last.opt.msg}</div>}
          {!res && (
            <div className="cs-row" style={{ marginTop: 10 }}>
              <button className="cs-btn primary" disabled={!log.length} onClick={() => onResult?.({ log, ...scorePeri(log) })}>🧵 Finish — check haemostasis and close</button>
              <span className="cs-pts">{log.length}/{PATCHES.length} areas dealt with</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 3 · the first night: low output with a dilated RV ---------- */

export const RESCUE_LEVERS = [
  { id: 'echo', label: '🫀 Bedside echo before touching anything', d: { }, pts: 3, msg: 'TTE: no collection anywhere. The RV is big and hypokinetic, the septum flattened into a D, the LV small, underfilled and squeezing hard. This is RV failure — not tamponade, not hypovolaemia.' },
  { id: 'fluid', label: '💧 500 mL crystalloid bolus — “she’s dry, the CVP lied before”', d: { map: -4, cvp: 4, ci: -0.15, rvlv: 0.15 }, pts: -4, msg: 'The CVP climbed to the 20s, the RV stretched further and pushed the septum into the LV. MAP fell. A dilated RV on a Starling curve’s far side gives nothing back for volume.' },
  { id: 'norad', label: '🩸 Noradrenaline to MAP ≥ 65 (start 0.05–0.1 µg/kg/min)', d: { map: 12, ci: 0.1 }, pts: 3, msg: 'MAP 70s. The RV is perfused through the whole cardiac cycle; when aortic pressure falls below RV pressure the RV starves. Pressure first.' },
  { id: 'ino', label: '💪 Dobutamine 5 µg/kg/min (or milrinone 0.25–0.375 µg/kg/min, no bolus)', d: { ci: 0.35, map: -3 }, pts: 3, msg: 'Cardiac index up. An inodilator strengthens the atrophic RV and lowers its afterload — paired with the noradrenaline so the pressure holds.' },
  { id: 'ino_no', label: '🌬️ Inhaled nitric oxide 20 ppm', d: { rvlv: -0.2, ci: 0.2, cvp: -2 }, pts: 2, msg: 'PVR down, the RV empties better, the septum swings back. Inhaled, so it dilates only the lung vessels that ventilate — no systemic hypotension.' },
  { id: 'pace', label: '⚡ Atrial pacing at 100 via the epicardial wires (she is junctional at 76)', d: { ci: 0.35, map: 4, hr: 100 }, pts: 3, msg: 'Atrial kick restored and the rate up. After years in a shell her stroke volume is small and fixed: output now comes from rate and synchrony.' },
  { id: 'vent', label: '🫁 PEEP 10 → 5, tidal volume 6 mL/kg, correct the CO₂ and pH', d: { rvlv: -0.1, ci: 0.1, cvp: -1 }, pts: 2, msg: 'High PEEP and hypercapnic acidosis both raise pulmonary vascular resistance — the RV’s afterload.' },
  { id: 'diur', label: '🚰 Once MAP ≥ 65: furosemide infusion (or CRRT) for a slow negative balance', d: { cvp: -4, rvlv: -0.15, ci: 0.15 }, pts: 2, needMap: 65, msg: 'Off-loading the distended RV lets the septum return and the LV fill. Done with a pressure that can stand it.' },
  { id: 'ecmo', label: '📞 Tell the ECMO team now, in case she does not turn', d: {}, pts: 2, msg: 'Early warning, not yet cannulation. If the levers fail, VA-ECMO (or an RV assist device) is the bridge — called early, it is a plan; called late, it is a salvage.' },
  { id: 'bb', label: '🛑 Metoprolol 2.5 mg IV for the “tachycardia”', d: { ci: -0.5, map: -15, hr: -14 }, pts: -6, msg: 'Her output was rate-dependent. Slowing it took away the only reserve she had: MAP in the 40s, a near-arrest.' },
  { id: 'iabp', label: '🎈 Intra-aortic balloon pump', d: { ci: 0.05 }, pts: -2, msg: 'A balloon pump helps a failing LV ejecting into the aorta. Her problem is the RV. It barely moved.' },
  { id: 'reopen', label: '🔪 Back to theatre — re-open for tamponade', d: {}, pts: -3, needNoEcho: true, msg: 'The echo shows no collection and the drains are quiet. Re-opening adds bleeding, a second anaesthetic and an infection risk — for a diagnosis she does not have.' },
];
export const RESCUE0 = { map: 58, cvp: 19, ci: 1.6, rvlv: 1.35, hr: 76, lact: 4.8 };

export function rescueState(used) {
  const s = { ...RESCUE0 };
  for (const id of used) {
    const L = RESCUE_LEVERS.find(x => x.id === id);
    let d = L.d;
    if (L.needMap && s.map < L.needMap) d = { map: -6, cvp: -2 };
    for (const k of Object.keys(d)) s[k] += d[k];
  }
  s.lact = Math.max(1.4, RESCUE0.lact - (s.ci - RESCUE0.ci) * 3.2 - (s.map - RESCUE0.map) * 0.03);
  return s;
}
export function rescueScore(used) {
  let pts = 0;
  let mapNow = RESCUE0.map;
  const ordered = [];
  for (const id of used) {
    const L = RESCUE_LEVERS.find(x => x.id === id);
    let p = L.pts;
    if (id === 'echo' && ordered.some(o => o !== 'echo')) p = 1;
    if (L.needMap && mapNow < L.needMap) p = 0;
    pts += p;
    mapNow = rescueState([...ordered, id]).map;
    ordered.push(id);
  }
  return Math.max(0, Math.min(20, pts));
}

export function RVRescue({ onVitals, onResult, done }) {
  const [used, setUsed] = useState(done?.used || []);
  const s = rescueState(used);
  const ok = s.map >= 65 && s.cvp <= 15 && s.ci >= 2.2;
  const pull = id => {
    if (used.includes(id) || done) return;
    const n = [...used, id];
    setUsed(n);
    const ns = rescueState(n);
    onVitals?.({ sys: Math.round(ns.map * 1.35), dia: Math.round(ns.map * 0.82), hr: Math.round(ns.hr) });
  };
  const last = RESCUE_LEVERS.find(x => x.id === used[used.length - 1]);
  const lastMsg = last && last.needMap && rescueState(used.slice(0, -1)).map < last.needMap
    ? 'Diuresis with a MAP in the 50s: the pressure fell further and the kidneys lost what little perfusion they had. Pressure first, then off-load.' : last?.msg;
  return (
    <div className="cs-card tight">
      <div className="cs-readout" style={{ marginTop: 0 }}>
        <div><span>MAP</span><b style={{ color: s.map < 65 ? 'var(--red)' : 'var(--green)' }}>{Math.round(s.map)} mmHg</b></div>
        <div><span>CVP</span><b style={{ color: s.cvp > 15 ? 'var(--red)' : 'var(--green)' }}>{Math.round(s.cvp)} mmHg</b></div>
        <div><span>Cardiac index</span><b style={{ color: s.ci < 2.2 ? 'var(--red)' : 'var(--green)' }}>{s.ci.toFixed(1)} L/min/m²</b></div>
        <div><span>RV : LV ratio</span><b style={{ color: s.rvlv > 1 ? 'var(--red)' : 'var(--green)' }}>{s.rvlv.toFixed(2)}</b></div>
        <div><span>Lactate</span><b style={{ color: s.lact > 2 ? 'var(--amber)' : 'var(--green)' }}>{s.lact.toFixed(1)} mmol/L</b></div>
        <div><span>Heart rate</span><b>{Math.round(s.hr)}</b></div>
      </div>
      <div className="cs-opts" style={{ marginTop: 12 }}>
        {RESCUE_LEVERS.map(L => {
          const on = used.includes(L.id);
          return (
            <button key={L.id} className={'cs-opt' + (on ? (L.pts > 0 ? ' best' : ' wrong') : '')} disabled={on || !!done} onClick={() => pull(L.id)}>
              <span className="cs-opt-k">{on ? used.indexOf(L.id) + 1 : ''}</span><span>{L.label}</span>
            </button>
          );
        })}
      </div>
      {lastMsg && <div className={'cs-fb ' + (last.pts > 0 && lastMsg === last.msg ? 'best' : 'wrong')}>{lastMsg}</div>}
      {ok && <div className="cs-fb best">🎯 Targets met: MAP ≥ 65, CVP ≤ 15, cardiac index ≥ 2.2 — and the lactate is turning.</div>}
      {!done && (
        <div className="cs-row" style={{ marginTop: 10 }}>
          <button className="cs-btn primary" disabled={!used.length} onClick={() => onResult?.({ used, ok, score: rescueScore(used), state: s })}>📋 Hand over the plan</button>
          <span className="cs-pts">Each lever can be pulled once, in the order you choose. The numbers are a teaching model, not a calculator.</span>
        </div>
      )}
    </div>
  );
}
