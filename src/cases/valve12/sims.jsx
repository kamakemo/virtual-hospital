import React, { useRef, useState } from 'react';
import { useCanvas } from '../kit/Monitor.jsx';

/* ============================================================
   LEFT ATRIAL APPENDAGE SIMULATORS — local to Case 12, written
   in the kit's style so they can be promoted later.

   LAAFlow          PW Doppler at the appendage mouth: emptying
                    velocity in sinus rhythm vs AF, with smoke
   RiskBuilder      CHA₂DS₂-VA and HAS-BLED built from the chart,
                    then the modifiable bleeding factors
   Morphology       chicken wing, windsock, cactus, cauliflower —
                    then name his appendage from the CT
   TOEMeasure       0°, 45°, 90°, 135°: landing zone and depth,
                    then device size and predicted compression
   SeptalPuncture   inferior–posterior for the appendage: fossa
                    position and the sheath's path to the LAA
   LAADeploy        position, deploy, then PASS: Position, Anchor
                    (tug test), Size (compression), Seal
   PulsusLine       arterial line with breathing: measure the
                    pulsus paradoxus
   Pericardio       subxiphoid, echo-guided pericardiocentesis
   ============================================================ */

const MONO = '"JetBrains Mono", ui-monospace, monospace';

/* ---------- PW Doppler of the appendage ---------- */

const FLOW_MODES = {
  sinus: { name: 'Sinus rhythm (a healthy appendage)', peak: 58, smoke: 0, note: 'Each P wave squeezes the appendage: a clean, tall emptying wave (> 40 cm/s) after every atrial contraction, then a smaller filling wave below the line.' },
  af: { name: 'His appendage — AF', peak: 18, smoke: 1, note: 'No organised atrial contraction: only small, irregular fibrillatory flutters of flow in and out. Below 20 cm/s blood barely leaves the cul-de-sac — smoke, sludge, thrombus.' },
};

function afVel(t) {   // irregular fibrillatory flow, peaks capped near 18 cm/s
  const f = Math.sin(t * 2 * Math.PI * 6.3) * (0.62 + 0.38 * Math.sin(t * 1.9) * Math.sin(t * 0.7 + 1));
  return f * 18;
}
function sinusVel(t) { // 75/min: emptying (A) above, filling below
  const p = (t % 0.8) / 0.8;
  if (p < 0.14) return Math.sin(p / 0.14 * Math.PI) * 58;
  if (p < 0.3) return -Math.sin((p - 0.14) / 0.16 * Math.PI) * 30;
  if (p > 0.55 && p < 0.68) return Math.sin((p - 0.55) / 0.13 * Math.PI) * 14;
  return 0;
}

export function LAAFlow({ onMeasure, done }) {
  const ref = useRef(null);
  const [mode, setMode] = useState('af');
  const [cur, setCur] = useState(40);
  const S = useRef({}); S.current = { mode, cur };
  const dots = useRef(Array.from({ length: 70 }, (_, i) => ({ a: (i * 2.39) % (Math.PI * 2), r: (i * 7.3) % 1 })));
  useCanvas(ref, 240, (g, w, h, t) => {
    const { mode: m, cur: c } = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    // 2D panel: LA and appendage with swirling smoke
    const pw = Math.min(150, w * 0.32);
    g.strokeStyle = '#1B2A40'; g.strokeRect(2, 2, pw - 4, h - 4);
    g.fillStyle = '#9FB4C6'; g.font = `600 10px ${MONO}`; g.fillText('ME 2-chamber 90°', 8, 16);
    g.fillStyle = 'rgba(170,170,170,0.35)';
    g.beginPath(); g.ellipse(pw * 0.42, h * 0.55, pw * 0.36, h * 0.3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#060606';
    g.beginPath(); g.ellipse(pw * 0.42, h * 0.58, pw * 0.27, h * 0.22, 0, 0, Math.PI * 2); g.fill();
    // appendage finger
    g.beginPath(); g.moveTo(pw * 0.55, h * 0.4); g.quadraticCurveTo(pw * 0.8, h * 0.2, pw * 0.92, h * 0.28); g.quadraticCurveTo(pw * 0.86, h * 0.42, pw * 0.64, h * 0.52); g.closePath(); g.fill();
    if (FLOW_MODES[m].smoke) {
      for (const d of dots.current) {
        const a = d.a + t * 0.25, rr = 0.2 + d.r * 0.75;
        const x = pw * 0.42 + Math.cos(a) * pw * 0.24 * rr, y = h * 0.58 + Math.sin(a) * h * 0.19 * rr;
        g.fillStyle = `rgba(200,200,200,${0.18 + 0.15 * Math.sin(t + d.r * 9)})`; g.fillRect(x, y, 2, 2);
      }
      g.fillStyle = '#F5C451'; g.fillText('smoke', 8, h - 10);
    }
    g.strokeStyle = '#22D3EE'; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(pw * 0.72, 30); g.lineTo(pw * 0.72, h * 0.35); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#22D3EE'; g.fillRect(pw * 0.72 - 5, h * 0.35, 10, 2);
    // spectral display
    const x0 = pw + 30, x1 = w - 8, base = h * 0.6, scale = (h * 0.5) / 70;
    g.strokeStyle = '#1B2A40'; g.beginPath(); g.moveTo(x0, base); g.lineTo(x1, base); g.stroke();
    g.fillStyle = '#6A7F9B'; g.font = `600 9px ${MONO}`;
    for (const v of [20, 40, 60]) { g.fillText(String(v), x0 - 22, base - v * scale + 3); g.strokeStyle = '#0D1726'; g.beginPath(); g.moveTo(x0, base - v * scale); g.lineTo(x1, base - v * scale); g.stroke(); }
    g.fillText('-20', x0 - 24, base + 20 * scale + 3);
    g.fillText('cm/s', x0 - 26, 14);
    const span = 3.2, sweep = (t % span) / span;
    for (let px = x0; px < x1; px += 1) {
      const fr = (px - x0) / (x1 - x0);
      if (Math.abs(fr - sweep) < 0.012) continue;
      const tt = fr <= sweep ? t - (sweep - fr) * span : t - (sweep - fr + 1) * span;
      if (tt < 0) continue;
      const v = m === 'af' ? afVel(tt) : sinusVel(tt);
      const top = base - Math.max(0, v) * scale, bot = base - Math.min(0, v) * scale;
      const grd = g.createLinearGradient(0, top, 0, bot);
      grd.addColorStop(0, 'rgba(255,255,255,0.95)'); grd.addColorStop(1, 'rgba(160,160,160,0.25)');
      g.fillStyle = grd; g.fillRect(px, Math.min(top, base), 1, Math.abs(bot - top) || 1);
    }
    // cursor
    const yc = base - c * scale;
    g.strokeStyle = '#F5C451'; g.lineWidth = 1.5; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(x0, yc); g.lineTo(x1, yc); g.stroke(); g.setLineDash([]); g.lineWidth = 1;
    g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`; g.fillText(`${c} cm/s`, x1 - 70, yc - 6);
    g.fillStyle = '#9FB4C6'; g.font = `600 10px ${MONO}`; g.fillText('PW · LAA orifice', x0 + 4, 16);
  }, []);
  const measure = () => { if (mode !== 'af') return; onMeasure?.({ v: cur, close: Math.abs(cur - 18) <= 4 }); };
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {Object.entries(FLOW_MODES).map(([k, v]) => <button key={k} className={'cs-chip' + (k === mode ? ' on' : '')} onClick={() => setMode(k)}>{v.name}</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 240 }} aria-label={`Pulsed-wave Doppler of the appendage: ${FLOW_MODES[mode].name}`} /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Peak cursor<input type="range" min="0" max="70" step="1" value={cur} onChange={e => setCur(+e.target.value)} style={{ width: '100%' }} aria-label="Velocity cursor" />{cur} cm/s</label>
        <button className="cs-btn primary" disabled={!!done || mode !== 'af'} onClick={measure}>Record his peak emptying velocity</button>
      </div>
      <p className="cs-pts">{FLOW_MODES[mode].note}</p>
      {mode !== 'af' && !done && <p className="cs-pts" style={{ color: 'var(--gold)' }}>Switch back to his trace to record his velocity.</p>}
    </div>
  );
}

/* ---------- CHA₂DS₂-VA and HAS-BLED ---------- */

const VA_ITEMS = [
  { id: 'c', k: 'C', label: 'Chronic heart failure / LV dysfunction', pts: 1, his: false },
  { id: 'h', k: 'H', label: 'Hypertension', pts: 1, his: true },
  { id: 'a2', k: 'A₂', label: 'Age ≥ 75', pts: 2, his: true },
  { id: 'd', k: 'D', label: 'Diabetes', pts: 1, his: true },
  { id: 's2', k: 'S₂', label: 'Prior stroke / TIA / thromboembolism', pts: 2, his: true },
  { id: 'v', k: 'V', label: 'Vascular disease (MI, PAD, aortic plaque)', pts: 1, his: false },
  { id: 'a', k: 'A', label: 'Age 65–74', pts: 1, his: false },
];
const HB_ITEMS = [
  { id: 'h', k: 'H', label: 'Uncontrolled hypertension (SBP > 160)', pts: 1, his: false, mod: true },
  { id: 'ar', k: 'A', label: 'Abnormal renal function (dialysis, transplant, Cr > 200 µmol/L)', pts: 1, his: false },
  { id: 'al', k: 'A', label: 'Abnormal liver function', pts: 1, his: false },
  { id: 's', k: 'S', label: 'Stroke', pts: 1, his: true },
  { id: 'b', k: 'B', label: 'Bleeding history or predisposition', pts: 1, his: true },
  { id: 'l', k: 'L', label: 'Labile INR (warfarin only)', pts: 1, his: false, mod: true },
  { id: 'e', k: 'E', label: 'Elderly (> 65)', pts: 1, his: true },
  { id: 'dd', k: 'D', label: 'Drugs: antiplatelet or NSAID', pts: 1, his: true, mod: true },
  { id: 'da', k: 'D', label: 'Alcohol ≥ 8 units/week', pts: 1, his: false, mod: true },
];

export function RiskBuilder({ onResult, done }) {
  const [va, setVa] = useState(new Set());
  const [hb, setHb] = useState(new Set());
  const [mod, setMod] = useState(new Set());
  const tog = (set, fn, k) => { if (done) return; const n = new Set(set); n.has(k) ? n.delete(k) : n.add(k); fn(n); };
  const vaScore = VA_ITEMS.filter(i => va.has(i.id)).reduce((n, i) => n + i.pts, 0);
  const hbScore = HB_ITEMS.filter(i => hb.has(i.id)).reduce((n, i) => n + i.pts, 0);
  const submit = () => {
    const vaRight = VA_ITEMS.every(i => va.has(i.id) === i.his);
    const hbRight = HB_ITEMS.every(i => hb.has(i.id) === i.his);
    const modRight = mod.has('dd') && !mod.has('s') && !mod.has('e') && !mod.has('b');
    onResult?.({ va: vaScore, hb: hbScore, vaRight, hbRight, modRight });
  };
  const col = (title, items, set, fn, score, max) => (
    <div>
      <div className="cs-h2" style={{ marginTop: 0 }}>{title} <b className="cs-mono" style={{ color: 'var(--gold)', marginLeft: 6 }}>{score}</b><span className="cs-pts"> / {max}</span></div>
      <div className="cs-opts">
        {items.map(i => {
          const on = set.has(i.id);
          const cls = !done ? (on ? 'sel' : '') : i.his ? (on ? 'best' : 'ok') : (on ? 'wrong' : 'dim');
          return (
            <button key={i.id} className={'cs-opt ' + cls} onClick={() => tog(set, fn, i.id)} disabled={!!done} aria-pressed={on}>
              <span className="cs-opt-k">{i.k}</span>
              <span>{i.label} <span className="cs-pts">+{i.pts}</span></span>
            </button>
          );
        })}
      </div>
    </div>
  );
  return (
    <div className="cs-card">
      <p className="cs-q">Score him from the chart. Tap each item that applies to Mr Adeyemi.</p>
      <div className="cs-grid2">
        {col('🧠 CHA₂DS₂-VA', VA_ITEMS, va, setVa, vaScore, 8)}
        {col('🩸 HAS-BLED', HB_ITEMS, hb, setHb, hbScore, 9)}
      </div>
      <p className="cs-q" style={{ marginTop: 16 }}>Which of HIS bleeding risk factors can you change?</p>
      <div className="cs-row">
        {[['dd', 'The aspirin and the ibuprofen'], ['e', 'His age'], ['s', 'His old stroke'], ['b', 'His bleeding history']].map(([k, l]) => (
          <button key={k} className={'cs-chip' + (mod.has(k) ? ' on' : '')} onClick={() => tog(mod, setMod, k)} disabled={!!done}>{l}</button>
        ))}
      </div>
      {!done
        ? <div className="cs-row" style={{ marginTop: 12 }}><button className="cs-btn primary" onClick={submit} disabled={!va.size || !hb.size}>Submit both scores</button></div>
        : <p className="cs-pts" style={{ marginTop: 10 }}>His answer: CHA₂DS₂-VA 6 (H, A₂, D, S₂) · HAS-BLED 4 (S, B, E, D). Green = right, amber = missed, red = should not be there.</p>}
    </div>
  );
}

/* ---------- appendage morphology ---------- */

const MORPH = {
  chicken: { name: 'Chicken wing', freq: '~ 40–50%', path: 'M20 60 C70 50 120 40 160 52 C190 60 200 80 180 96 C160 110 120 108 104 96', lobes: [],
    pts: ['One dominant lobe that bends sharply back on itself near its root.', 'In the classic series it carried the LOWEST stroke association.', 'Plenty of length, little usable depth: the device must sit proximal to the bend — or a disc-and-lobe device (Amulet) or a shallow FLX deployment.'] },
  windsock: { name: 'Windsock', freq: '~ 20–30%', path: 'M20 60 C70 52 110 50 150 58 C185 66 215 74 238 86', lobes: [],
    pts: ['One long dominant lobe, like a sock on a pole.', 'The friendliest for a plug: deep and coaxial.', 'Secondary lobes vary — check every angle.'] },
  cactus: { name: 'Cactus', freq: '~ 20–30%', path: 'M20 60 C70 54 120 54 170 60 C200 63 220 66 236 68', lobes: ['M100 56 C104 36 112 22 124 14', 'M120 62 C126 82 134 98 146 110'],
    pts: ['A dominant central lobe with secondary lobes up and down.', 'A side lobe arising near the ostium can escape the device: a peri-device leak.', 'Cover the ostium — do not dive into the main lobe.'] },
  cauliflower: { name: 'Cauliflower', freq: '~ 3–20%', path: 'M20 60 C50 50 70 40 92 46', lobes: ['M80 46 C96 22 120 26 116 46', 'M88 50 C120 46 130 70 108 78', 'M80 62 C92 90 70 98 64 80', 'M70 44 C70 24 88 18 96 30'],
    pts: ['Short, no dominant lobe, many small lobes, an irregular oval mouth.', 'In the classic series it carried the HIGHEST stroke association — more trabeculae, slower flow.', 'The hardest to seal and the least depth: often an Amulet territory.'] },
};

function Appendage({ k, size = 260, highlight }) {
  const m = MORPH[k];
  return (
    <svg viewBox="0 0 260 130" width="100%" style={{ maxWidth: size, display: 'block' }} role="img" aria-label={`${m.name} appendage`}>
      <rect x="0" y="0" width="260" height="130" fill="#03070B" />
      <ellipse cx="6" cy="62" rx="30" ry="44" fill="#0E1A2C" stroke="#2B4366" />
      <text x="6" y="124" fontSize="9" fill="#6A7F9B" fontFamily={MONO}>LA</text>
      {[m.path, ...m.lobes].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={highlight ? '#22D3EE' : '#E9F2FC'} strokeWidth={i ? 14 : 22} strokeLinecap="round" opacity={0.85} />
      ))}
      {[m.path, ...m.lobes].map((d, i) => (
        <path key={'c' + i} d={d} fill="none" stroke="#03070B" strokeWidth={i ? 8 : 15} strokeLinecap="round" />
      ))}
      <line x1="26" y1="44" x2="26" y2="78" stroke="#F5C451" strokeWidth="2" strokeDasharray="3 2" />
      <text x="30" y="40" fontSize="9" fill="#F5C451" fontFamily={MONO}>ostium</text>
    </svg>
  );
}

export function Morphology({ onResult, done }) {
  const [k, setK] = useState('chicken');
  const [pick, setPick] = useState(null);
  const m = MORPH[k];
  return (
    <div className="cs-card">
      <div className="cs-row" style={{ marginBottom: 10 }}>
        {Object.entries(MORPH).map(([id, v]) => <button key={id} className={'cs-chip' + (id === k ? ' on' : '')} onClick={() => setK(id)}>{v.name}</button>)}
      </div>
      <div className="cs-grid2">
        <div className="cs-viewer" style={{ padding: 8 }}><Appendage k={k} size={520} /></div>
        <div>
          <p className="cs-q" style={{ marginTop: 0 }}>{m.name} <span className="cs-pts">· {m.freq} of appendages</span></p>
          <ul className="cs-ul">{m.pts.map(p => <li key={p} className="cs-li">{p}</li>)}</ul>
        </div>
      </div>
      <div className="cs-h2">🖥️ His CT, 3D volume rendering</div>
      <div className="cs-grid2">
        <div className="cs-viewer" style={{ padding: 8 }}>
          <svg viewBox="0 0 260 130" width="100%" style={{ display: 'block' }} role="img" aria-label="His appendage on CT">
            <rect width="260" height="130" fill="#0B0F14" />
            <ellipse cx="0" cy="66" rx="34" ry="50" fill="#5C4B3A" />
            <path d="M24 64 C80 50 132 38 172 54 C204 66 206 92 182 102 C156 112 120 104 108 90" fill="none" stroke="#C9A27A" strokeWidth="24" strokeLinecap="round" />
            <path d="M24 64 C80 50 132 38 172 54 C204 66 206 92 182 102 C156 112 120 104 108 90" fill="none" stroke="#E7C9A3" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
            <circle cx="40" cy="96" r="6" fill="#B23A48" /><text x="50" y="100" fontSize="8" fill="#FF8A9B" fontFamily={MONO}>circumflex</text>
            <text x="6" y="14" fontSize="9" fill="#9FB4C6" fontFamily={MONO}>CT · LAA · cranial view</text>
          </svg>
        </div>
        <div>
          <p className="cs-q" style={{ marginTop: 0 }}>Which morphology is his?</p>
          <div className="cs-row">
            {Object.entries(MORPH).map(([id, v]) => (
              <button key={id} className={'cs-chip' + (pick === id ? ' on' : '')} disabled={!!done} onClick={() => setPick(id)}>{v.name}</button>
            ))}
          </div>
          <div className="cs-row" style={{ marginTop: 10 }}>
            <button className="cs-btn primary" disabled={!!done || !pick} onClick={() => onResult?.({ pick, right: pick === 'chicken' })}>Call it</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A tube drawn along a centreline with a width at each point (filled polygon). */
function tube(g, pts, widths, fill) {
  const left = [], right = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const w = widths[i] / 2;
    left.push([pts[i][0] - ty * w, pts[i][1] + tx * w]); right.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
  }
  g.fillStyle = fill; g.beginPath();
  g.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < left.length; i++) { const p = left[i - 1], q = left[i]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  const last = pts[pts.length - 1], lw = widths[widths.length - 1] / 2;
  g.lineTo(left[left.length - 1][0], left[left.length - 1][1]);
  g.arc(last[0], last[1], lw, Math.atan2(left[left.length - 1][1] - last[1], left[left.length - 1][0] - last[0]), Math.atan2(right[right.length - 1][1] - last[1], right[right.length - 1][0] - last[0]), true);
  for (let i = right.length - 2; i >= 0; i--) { const p = right[i + 1], q = right[i]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  g.lineTo(right[0][0], right[0][1]);
  g.closePath(); g.fill();
}

/* ---------- multi-angle TOE: landing zone, depth, device size ---------- */

export const TOE_TRUE = { 0: { w: 18.6, d: 21 }, 45: { w: 19.8, d: 23 }, 90: { w: 20.4, d: 24 }, 135: { w: 22.0, d: 19 } };
export const FLX_SIZES = [20, 24, 27, 31, 35];
const ANG = [0, 45, 90, 135];

export function TOEMeasure({ onResult, done }) {
  const ref = useRef(null);
  const [ang, setAng] = useState(0);
  const [cal, setCal] = useState(14);
  const [dep, setDep] = useState(12);
  const [rec, setRec] = useState({});
  const [size, setSize] = useState(null);
  const S = useRef({}); S.current = { ang, cal, dep };
  useCanvas(ref, 260, (g, w, h, t) => {
    const { ang: a, cal: c, dep: dp } = S.current;
    const tr = TOE_TRUE[a];
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = 2, R = h * 1.05;
    g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, Math.PI / 2 - 0.7, Math.PI / 2 + 0.7); g.closePath(); g.clip();
    for (let i = 0; i < 1600; i++) {
      const aa = Math.PI / 2 + ((i * 0.618) % 1 - 0.5) * 1.4, r = ((i * 0.377) % 1) * R;
      g.fillStyle = `rgba(200,200,200,${((i * 0.71) % 1) * 0.1})`; g.fillRect(cx + Math.cos(aa) * r, cy + Math.sin(aa) * r, 2, 2);
    }
    const mm = h / 46;                               // px per mm
    const ox = cx - 46, oy = h * 0.36;               // ostium centre
    const ax = 0.32 + a / 900, dx = Math.cos(ax), dy = Math.sin(ax);
    const nx = -dy, ny = dx;
    const half = tr.w / 2 * mm;
    const wob = 1 + 0.025 * Math.sin(t * 2 * Math.PI * 1.3);
    // the appendage: a tapering finger, tissue band then lumen
    const L = tr.d * mm;
    const cl = [[0, 0], [L * 0.35, 0], [L * 0.7, L * 0.04], [L, L * 0.1]].map(([u, v]) => [ox + dx * u + nx * v, oy + dy * u + ny * v]);
    const wd = [tr.w * wob, tr.w * 0.92, tr.w * 0.7, tr.w * 0.34].map(x => x * mm);
    tube(g, cl, wd.map(x => x + 14), 'rgba(178,178,178,0.55)');
    // LA cavity opening into it
    g.fillStyle = 'rgba(178,178,178,0.55)'; g.beginPath(); g.ellipse(ox - dx * 62, oy - dy * 62 - 4, 74, 52, ax, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#050505'; g.beginPath(); g.ellipse(ox - dx * 62, oy - dy * 62 - 4, 66, 44, ax, 0, Math.PI * 2); g.fill();
    tube(g, cl, wd, '#050505');
    // pectinate ridges
    g.strokeStyle = 'rgba(200,200,200,0.4)'; g.lineWidth = 2;
    for (let k = 1; k < 4; k++) { const s = L * (0.4 + k * 0.14), hw = wd[1] / 2 * (1 - k * 0.15); g.beginPath(); g.moveTo(ox + dx * s + nx * hw, oy + dy * s + ny * hw); g.lineTo(ox + dx * s + nx * hw * 0.55, oy + dy * s + ny * hw * 0.55); g.stroke(); }
    // landmarks: circumflex on one side, the ridge (LUPV) on the other
    const cxp = [ox + nx * (half + 10), oy + ny * (half + 10)];
    g.fillStyle = 'rgba(255,90,82,0.9)'; g.beginPath(); g.arc(cxp[0], cxp[1], 4, 0, Math.PI * 2); g.fill();
    g.restore();
    g.fillStyle = '#FF8A9B'; g.font = `600 9px ${MONO}`; g.fillText('Cx', cxp[0] + 6, cxp[1] + 3);
    g.fillStyle = '#6A7F9B'; g.fillText('LA', ox - dx * 70, oy - dy * 70);
    g.fillText('LAA', ox + dx * L * 0.8 + nx * (half + 4), oy + dy * L * 0.8 + ny * (half + 4));
    // caliper across the landing zone
    const hc = c / 2 * mm;
    g.strokeStyle = '#F5C451'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(ox + nx * hc, oy + ny * hc); g.lineTo(ox - nx * hc, oy - ny * hc); g.stroke();
    for (const s of [1, -1]) { const px = ox + nx * hc * s, py = oy + ny * hc * s; g.beginPath(); g.moveTo(px - 4, py - 4); g.lineTo(px + 4, py + 4); g.moveTo(px + 4, py - 4); g.lineTo(px - 4, py + 4); g.stroke(); }
    // depth line
    g.strokeStyle = '#22D3EE'; g.setLineDash([4, 3]);
    g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + dx * dp * mm, oy + dy * dp * mm); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#22D3EE'; g.beginPath(); g.arc(ox + dx * dp * mm, oy + dy * dp * mm, 3, 0, Math.PI * 2); g.fill();
    g.lineWidth = 1;
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText(`ME ${a}°`, 10, 18);
    g.fillStyle = '#F5C451'; g.fillText(`LZ ${c.toFixed(1)} mm`, 10, h - 26);
    g.fillStyle = '#22D3EE'; g.fillText(`depth ${dp.toFixed(0)} mm`, 10, h - 10);
  }, []);
  const record = () => setRec(r => ({ ...r, [ang]: { w: cal, d: dep } }));
  const all = ANG.every(a => rec[a]);
  const maxW = all ? Math.max(...ANG.map(a => rec[a].w)) : null;
  const comp = s => (maxW ? (1 - maxW / s) * 100 : null);
  const finish = () => {
    const close = ANG.every(a => Math.abs(rec[a].w - TOE_TRUE[a].w) <= 1.2);
    const depthOk = ANG.every(a => Math.abs(rec[a].d - TOE_TRUE[a].d) <= 3);
    onResult?.({ rec, maxW, size, close, depthOk, compression: comp(size) });
  };
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {ANG.map(a => <button key={a} className={'cs-chip' + (a === ang ? ' on' : '') + (rec[a] ? ' done' : '')} onClick={() => setAng(a)}>{rec[a] ? '✓ ' : ''}{a}°</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 260 }} aria-label={`TOE mid-oesophageal ${ang} degree view of the appendage`} /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Landing zone<input type="range" min="10" max="30" step="0.2" value={cal} disabled={!!done} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="Landing zone caliper" />{cal.toFixed(1)} mm</label>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Depth<input type="range" min="8" max="34" step="1" value={dep} disabled={!!done} onChange={e => setDep(+e.target.value)} style={{ width: '100%' }} aria-label="Depth caliper" />{dep} mm</label>
        <button className="cs-btn" disabled={!!done} onClick={record}>📌 Record {ang}°</button>
      </div>
      <p className="cs-pts">Set the yellow caliper wall-to-wall across the mouth (from the circumflex artery, Cx, to the opposite wall) and the cyan line to the far end of the usable lobe. Record all four angles.</p>
      <div className="cs-readout">
        {ANG.map(a => <div key={a}><span>{a}°</span><b>{rec[a] ? `${rec[a].w.toFixed(1)} / ${rec[a].d}` : '—'}</b></div>)}
        <div><span>Max LZ</span><b style={{ color: 'var(--gold)' }}>{maxW ? maxW.toFixed(1) : '—'}</b></div>
      </div>
      {all && (
        <>
          <p className="cs-q" style={{ marginTop: 14 }}>Watchman FLX size? Predicted compression = 1 − (max landing zone ÷ device size). Target 10–30%.</p>
          <div className="cs-row">
            {FLX_SIZES.map(s => {
              const c = comp(s);
              return <button key={s} className={'cs-chip' + (size === s ? ' on' : '')} disabled={!!done} onClick={() => setSize(s)}>{s} mm · {c < 0 ? 'too small' : `${c.toFixed(0)}%`}</button>;
            })}
          </div>
          <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" disabled={!!done || !size} onClick={finish}>Confirm measurements and device</button></div>
        </>
      )}
    </div>
  );
}

/* ---------- transseptal puncture for the appendage ---------- */

export function SeptalPuncture({ onResult, done }) {
  const ref = useRef(null);
  const [sup, setSup] = useState(0.7);
  const [ant, setAnt] = useState(0.5);
  const [tent, setTent] = useState(false);
  const [warn, setWarn] = useState('');
  const mis = Math.round(6 + 58 * sup + 40 * Math.max(0, ant - 0.45) + 25 * Math.max(0, 0.1 - ant) * 4);
  const S = useRef({}); S.current = { sup, ant, tent, done, mis };
  useCanvas(ref, 240, (g, w, h) => {
    const st = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const pw = w / 3;
    const panel = (i, title) => { g.strokeStyle = '#1B2A40'; g.strokeRect(i * pw + 3, 3, pw - 6, h - 6); g.fillStyle = '#9FB4C6'; g.font = `600 10px ${MONO}`; g.fillText(title, i * pw + 9, 17); };
    const bulge = st.tent || st.done ? 9 : 0;
    // bicaval
    panel(0, 'BICAVAL ~100°');
    let x0 = pw * 0.55; const yt = 34, yb = h - 24;
    g.strokeStyle = 'rgba(200,200,200,0.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, yt); g.lineTo(x0, yb); g.stroke();
    g.fillStyle = 'rgba(200,200,200,0.15)'; g.fillRect(x0 - 3, yt + (yb - yt) * 0.3, 6, (yb - yt) * 0.45);
    g.fillStyle = '#6A7F9B'; g.font = `600 10px ${MONO}`; g.fillText('SVC', x0 - 12, yt - 4); g.fillText('IVC', x0 - 12, yb + 14);
    const y1 = yb - st.sup * (yb - yt) * 0.8 - (yb - yt) * 0.1;
    g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 46, yb); g.quadraticCurveTo(x0 - 28, y1, x0 - 3, y1); g.stroke();
    if (bulge) { g.beginPath(); g.arc(x0 + 2, y1, bulge, -Math.PI / 2, Math.PI / 2); g.stroke(); }
    // short axis
    panel(1, 'SHORT AXIS ~45°');
    x0 = pw * 1.55;
    g.fillStyle = 'rgba(255,77,109,0.18)'; g.beginPath(); g.arc(x0 + 30, 56, 22, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FF8A9B'; g.fillText('AORTA', x0 + 12, 60);
    g.strokeStyle = 'rgba(200,200,200,0.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 - 6, 46); g.lineTo(x0 - 6, h - 26); g.stroke();
    g.fillStyle = '#6A7F9B'; g.fillText('ant', x0 - 44, 46); g.fillText('post', x0 - 44, h - 14);
    const ya = (h - 26) - st.ant * (h - 72);
    g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 50, h - 26); g.quadraticCurveTo(x0 - 34, ya, x0 - 9, ya); g.stroke();
    if (bulge) { g.beginPath(); g.arc(x0 - 4, ya, bulge, -Math.PI / 2, Math.PI / 2); g.stroke(); }
    if (st.ant > 0.7) { g.fillStyle = '#FF4D6D'; g.font = `700 9px ${MONO}`; g.fillText('AORTA!', x0 - 50, h - 6); }
    // the path to the appendage (LA seen from the front-left)
    panel(2, 'PATH TO THE LAA');
    x0 = pw * 2;
    const sx = x0 + pw * 0.22, sy = 60 + (1 - st.sup) * (h - 110);
    const lx = x0 + pw * 0.82, ly = 56;                 // appendage mouth: anterior, superior, leftward
    g.strokeStyle = 'rgba(200,200,200,0.3)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x0 + pw * 0.5, h * 0.56, pw * 0.4, h * 0.34, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(34,211,238,0.25)'; g.beginPath(); g.ellipse(lx, ly, 12, 8, -0.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#22D3EE'; g.font = `600 9px ${MONO}`; g.fillText('LAA', lx - 12, ly - 12);
    g.fillStyle = '#6A7F9B'; g.fillText('LUPV', x0 + pw * 0.62, h * 0.32 + 6);
    g.fillText('septum', x0 + 8, h - 12);
    // sheath: from the puncture, curving toward where its stiffness points it
    const aim = st.sup * 1;                              // superior puncture aims the sheath at the roof / veins
    const ex = lx - aim * pw * 0.2, ey = ly + aim * 46;
    g.strokeStyle = st.mis <= 25 ? '#34E39A' : st.mis <= 40 ? '#F5C451' : '#FF4D6D'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + pw * 0.3, sy - 8 - (1 - aim) * 30, ex, ey); g.stroke();
    g.fillStyle = '#F5C451'; g.beginPath(); g.arc(sx, sy, 4, 0, Math.PI * 2); g.fill();
    g.lineWidth = 1;
    g.fillStyle = st.mis <= 25 ? '#34E39A' : '#F5C451'; g.font = `700 11px ${MONO}`; g.fillText(`off-axis ${st.mis}°`, x0 + 9, 32);
  }, []);
  const puncture = () => {
    if (ant > 0.7) { setWarn('Stop. In the short-axis view the tent points at the aortic root. Withdraw, rotate clockwise (posterior), re-tent.'); return; }
    setWarn('');
    onResult?.({ sup, ant, mis });
  };
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 240 }} aria-label="TOE views of the septum and the sheath's path to the appendage" /></div>
      <div className="cs-ctrls"><label className="cs-slider" style={{ flex: 1 }}>Inferior<input type="range" min="0" max="1" step="0.01" value={sup} disabled={!!done} onChange={e => setSup(+e.target.value)} style={{ width: '100%' }} aria-label="Superior–inferior position" />Superior</label></div>
      <div className="cs-ctrls"><label className="cs-slider" style={{ flex: 1 }}>Posterior<input type="range" min="0" max="1" step="0.01" value={ant} disabled={!!done} onChange={e => setAnt(+e.target.value)} style={{ width: '100%' }} aria-label="Anterior–posterior position" />Anterior</label></div>
      <div className="cs-ctrls">
        <button className="cs-btn" disabled={!!done} onClick={() => setTent(x => !x)}>{tent ? 'Relax' : 'Tent the septum'}</button>
        <button className="cs-btn primary" disabled={!!done || !tent} onClick={puncture}>Advance the needle — puncture</button>
      </div>
      {warn && <p className="cs-pts" style={{ color: 'var(--red)', marginTop: 8 }}>{warn}</p>}
      <p className="cs-pts">The third panel shows where the access sheath will naturally point once it crosses. The appendage sits anterior, superior and leftward: you want room below it to curve up into its axis.</p>
    </div>
  );
}

/* ---------- device deployment and PASS ---------- */

const LZ_ANG = [18.6, 19.8, 20.4, 22.0];
export function deployModel(size, d) {
  const lz = LZ_ANG.map(x => x - 0.3 * d);                      // the appendage narrows as you go deeper
  const dia = lz.map(x => Math.min(size, x + 0.15 * Math.max(0, size - x)));
  const comp = dia.map(x => (1 - x / size) * 100);
  const cMin = Math.min(...comp), cMax = Math.max(...comp);
  const posOk = d >= -1 && d <= 4;
  const anchorOk = cMin >= 10 && d >= -2;
  const sizeOk = cMin >= 10 && cMax <= 30;
  let leak = 0;
  if (cMin < 10) leak += 4.5;
  if (d > 4) leak += (d - 4) * 1.6;
  if (d < -1) leak += 1;
  leak = Math.round(leak * 10) / 10;
  const sealOk = leak <= 3;
  return { dia, comp, cMin, cMax, posOk, anchorOk, sizeOk, leak, sealOk, all: posOk && anchorOk && sizeOk && sealOk };
}

export function LAADeploy({ size0 = 27, onResult, done }) {
  const fl = useRef(null), toe = useRef(null);
  const [size, setSize] = useState(size0 || 27);
  const [d, setD] = useState(7);
  const [deployed, setDeployed] = useState(false);
  const [checks, setChecks] = useState({});
  const [tugAt, setTugAt] = useState(-10);
  const [recaps, setRecaps] = useState(0);
  const [log, setLog] = useState([]);
  const M = deployModel(size, d);
  const S = useRef({}); S.current = { size, d, deployed, checks, tugAt, M };
  const say = s => setLog(l => [s, ...l].slice(0, 6));

  // fluoroscopy: RAO caudal, the appendage filled with contrast (chicken wing)
  useCanvas(fl, 250, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#9C9C9C'; g.fillRect(0, 0, w, h);
    const vg = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    g.fillStyle = vg; g.fillRect(0, 0, w, h);
    const mm = Math.min(w / 58, h / 36);
    const ox = w * 0.36, oy = h * 0.36;
    const P = (u, v) => [ox + u * mm, oy + v * mm];
    const tp = t - st.tugAt;
    const tug = st.checks.tug && tp > 0 && tp < 1.6 ? Math.sin(tp / 1.6 * Math.PI) : 0;
    const slip = st.deployed && st.checks.tug && !st.M.anchorOk && tp > 0 ? Math.min(1, tp / 1.2) : 0;
    const shift = st.M.anchorOk ? -tug * 3 : 0;
    // the appendage with contrast, moving with the device when anchored
    g.save(); g.translate(shift * mm, 0);
    const cl = [P(0, 0), P(8, -1.5), P(16, 0), P(21, 6), P(20, 13), P(14, 17), P(8, 16)];
    tube(g, cl, [22, 21, 18, 14, 11, 9, 7].map(x => x * mm), 'rgba(28,28,28,0.82)');
    g.restore();
    // LA body (faint) and the circumflex
    g.fillStyle = 'rgba(40,40,40,0.25)'; g.beginPath(); g.ellipse(ox - 22 * mm, oy + 8 * mm, 20 * mm, 17 * mm, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(20,20,20,0.75)'; g.beginPath(); g.arc(ox - 1 * mm, oy + 13 * mm, 1.8 * mm, 0, Math.PI * 2); g.fill();
    // ostium line
    g.strokeStyle = '#F5C451'; g.lineWidth = 1.2; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(ox, oy - 13 * mm); g.lineTo(ox, oy + 13 * mm); g.stroke(); g.setLineDash([]);
    // access sheath from the septum
    const tipU = st.deployed ? -3 : st.d;
    const sx = (tipU + (st.deployed ? shift - slip * 6 : 0)) * mm + ox;
    g.strokeStyle = 'rgba(15,15,15,0.95)'; g.lineWidth = 3.6 * mm; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-10, h * 0.95); g.quadraticCurveTo(ox - 26 * mm, oy + 2 * mm, sx, oy); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = '#E8E8E8'; g.fillRect(sx - 0.6 * mm, oy - 1.8 * mm, 1.2 * mm, 3.6 * mm);   // radiopaque marker band
    if (st.deployed) {
      // FLX: a flat fabric face toward the LA, a rounded closed end into the appendage
      const D = st.M.dia[3], Lg = D * 0.85;
      const fx = ox + (st.d + shift - slip * 14) * mm, half = D / 2 * mm, len = Lg * mm;
      g.fillStyle = 'rgba(12,12,12,0.85)';
      g.beginPath(); g.moveTo(fx, oy - half); g.bezierCurveTo(fx + len * 0.75, oy - half, fx + len, oy - half * 0.55, fx + len, oy);
      g.bezierCurveTo(fx + len, oy + half * 0.55, fx + len * 0.75, oy + half, fx, oy + half); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(200,200,200,0.55)'; g.lineWidth = 1;
      for (let k = -4; k <= 4; k++) { const y = oy + k / 4 * half * 0.92; g.beginPath(); g.moveTo(fx, y); g.quadraticCurveTo(fx + len * 0.7, y * 0.85 + oy * 0.15, fx + len, oy); g.stroke(); }
      g.strokeStyle = '#EDEDED'; g.lineWidth = 2; g.beginPath(); g.moveTo(fx, oy - half); g.lineTo(fx, oy + half); g.stroke();
      g.fillStyle = '#EDEDED'; g.beginPath(); g.arc(fx, oy, 1.2 * mm, 0, Math.PI * 2); g.fill();
      // delivery cable still attached until release
      g.strokeStyle = 'rgba(15,15,15,0.95)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx, oy); g.lineTo(fx, oy); g.stroke();
    }
    g.fillStyle = '#05080C'; g.font = `700 11px ${MONO}`;
    g.fillText('RAO 30° / CAUDAL 20°', 8, 16);
    g.fillText(st.deployed ? `device ${st.d > 0 ? st.d + ' mm deep' : st.d < 0 ? -st.d + ' mm proud' : 'flush'}` : `sheath tip ${st.d} mm`, 8, h - 10);
    if (slip > 0.5) { g.fillStyle = '#B00020'; g.fillText('DEVICE MOVES — NOT ANCHORED', 8, 32); }
  }, []);

  // TOE 135°: the device in cross-section, colour around it
  useCanvas(toe, 250, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#9FB4C6'; g.font = `600 10px ${MONO}`; g.fillText('TOE ME 135° · colour', 8, 16);
    if (!st.deployed) { g.fillStyle = '#6A7F9B'; g.fillText('Deploy to image the device.', 8, h / 2); return; }
    const mm = Math.min(w / 46, h / 34), ox = w * 0.3, oy = h * 0.52;
    const P = (u, v) => [ox + u * mm, oy + v * mm];
    const cl = [P(0, 0), P(10, 0.5), P(20, 2), P(27, 4)];
    const lz = 22 - 0.3 * st.d;
    tube(g, cl, [lz + 6, lz + 4, 16, 9].map(x => x * mm), 'rgba(170,170,170,0.55)');
    tube(g, cl, [lz, lz - 2, 11, 5].map(x => x * mm), '#050505');
    g.fillStyle = 'rgba(170,170,170,0.55)'; g.beginPath(); g.ellipse(ox - 14 * mm, oy, 14 * mm, 16 * mm, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#050505'; g.beginPath(); g.ellipse(ox - 14 * mm, oy, 12 * mm, 14 * mm, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#6A7F9B'; g.fillText('LA', ox - 18 * mm, oy + 3);
    const D = st.M.dia[3], half = D / 2 * mm, len = D * 0.85 * mm, fx = ox + st.d * mm;
    g.strokeStyle = 'rgba(235,235,235,0.95)'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(fx, oy - half); g.bezierCurveTo(fx + len * 0.75, oy - half, fx + len, oy - half * 0.55, fx + len, oy);
    g.bezierCurveTo(fx + len, oy + half * 0.55, fx + len * 0.75, oy + half, fx, oy + half); g.stroke();
    g.lineWidth = 3.5; g.beginPath(); g.moveTo(fx, oy - half); g.lineTo(fx, oy + half); g.stroke();
    g.fillStyle = 'rgba(120,120,120,0.35)'; g.beginPath(); g.moveTo(fx + 3, oy - half + 3); g.bezierCurveTo(fx + len * 0.7, oy - half + 3, fx + len - 3, oy - half * 0.5, fx + len - 3, oy); g.bezierCurveTo(fx + len - 3, oy + half * 0.5, fx + len * 0.7, oy + half - 3, fx + 3, oy + half - 3); g.closePath(); g.fill();
    if (st.checks.seal && st.M.leak > 0) {
      const lw = Math.max(3, st.M.leak * mm), pulse = 0.6 + 0.4 * Math.sin(t * 8);
      const gr = g.createLinearGradient(fx - 8 * mm, 0, fx + len * 0.6, 0);
      gr.addColorStop(0, `rgba(255,${150 + 60 * pulse},40,0.95)`); gr.addColorStop(1, 'rgba(40,110,255,0.8)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(fx + len * 0.15, oy - half - lw * 0.15, len * 0.55, lw / 2, 0.05, 0, Math.PI * 2); g.fill();
    }
    if (st.checks.seal) {
      g.fillStyle = st.M.sealOk ? '#34E39A' : '#FF4D6D'; g.font = `700 11px ${MONO}`;
      g.fillText(st.M.leak ? `peri-device leak ${st.M.leak} mm` : 'no peri-device flow', 8, h - 10);
    }
    if (st.checks.size) {
      g.strokeStyle = '#F5C451'; g.lineWidth = 1.2; g.setLineDash([3, 2]); g.beginPath(); g.moveTo(fx - 6, oy - half); g.lineTo(fx - 6, oy + half); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#F5C451'; g.font = `700 11px ${MONO}`; g.fillText(`${D.toFixed(1)} mm`, 8, 32);
    }
  }, []);

  const deploy = () => { setDeployed(true); setChecks({}); say(`Unsheathed a ${size} mm Watchman FLX ${d > 0 ? d + ' mm inside' : d < 0 ? -d + ' mm proximal to' : 'at'} the ostium.`); };
  const check = k => {
    setChecks(c => ({ ...c, [k]: true }));
    if (k === 'pos') say(M.posOk ? 'Position: the shoulder sits at the ostium, covering all the trabeculated appendage.' : d < -1 ? 'Position: the device stands proud in the LA — too much shoulder outside the ostium.' : 'Position: too deep — the ostium and a ridge are left uncovered.');
    if (k === 'tug') { say(M.anchorOk ? 'Tug test: the device and the appendage move back together, then spring home. Anchored.' : 'Tug test: the device slides toward the LA — it is not gripping the wall.'); }
    if (k === 'size') say(`Size: diameters ${M.dia.map(x => x.toFixed(1)).join(' / ')} mm at 0/45/90/135° → compression ${M.cMin.toFixed(0)}–${M.cMax.toFixed(0)}%${M.sizeOk ? ' — within 10–30%.' : M.cMin < 10 ? ' — under-compressed.' : ' — over-compressed: puckering.'}`);
    if (k === 'seal') say(M.leak ? `Seal: ${M.leak} mm jet around the device${M.sealOk ? ' — acceptable but not ideal.' : ' — too much.'}` : 'Seal: no colour flow around the device at any angle.');
  };
  // the tug animation is timed from the canvas clock; reset it to "now" in canvas time
  const tugStart = useRef(performance.now());
  const doTug = () => { setTugAt((performance.now() - tugStart.current) / 1000); check('tug'); };
  const recapture = () => { setDeployed(false); setChecks({}); setTugAt(-10); setRecaps(r => r + 1); say('Device recaptured into the sheath. Reposition or change size.'); };
  const allChecked = checks.pos && checks.tug && checks.size && checks.seal;
  const release = () => onResult?.({ size, d, ...M, recaps });
  return (
    <div className="cs-card tight">
      <div className="cs-grid2">
        <div className="cs-viewer"><canvas ref={fl} className="cs-canvas" style={{ height: 250 }} aria-label="Fluoroscopy of the appendage and device" /></div>
        <div className="cs-viewer"><canvas ref={toe} className="cs-canvas" style={{ height: 250 }} aria-label="TOE colour view of the device" /></div>
      </div>
      <div className="cs-ctrls">
        <span className="cs-pts">Device</span>
        {FLX_SIZES.map(s => <button key={s} className={'cs-chip' + (size === s ? ' on' : '')} disabled={deployed || !!done} onClick={() => setSize(s)}>{s} mm</button>)}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Proud<input type="range" min="-5" max="9" step="1" value={d} disabled={deployed || !!done} onChange={e => setD(+e.target.value)} style={{ width: '100%' }} aria-label="Depth of the device relative to the ostium" />Deep</label>
        <b className="cs-mono" style={{ color: 'var(--gold)' }}>{d > 0 ? `${d} mm in` : d < 0 ? `${-d} mm out` : 'flush'}</b>
      </div>
      <div className="cs-ctrls">
        {!deployed
          ? <button className="cs-btn primary" disabled={!!done} onClick={deploy}>Unsheath — deploy</button>
          : <>
              <button className={'cs-chip' + (checks.pos ? ' done' : '')} disabled={!!done} onClick={() => check('pos')}>P · Position</button>
              <button className={'cs-chip' + (checks.tug ? ' done' : '')} disabled={!!done} onClick={doTug}>A · Anchor (tug)</button>
              <button className={'cs-chip' + (checks.size ? ' done' : '')} disabled={!!done} onClick={() => check('size')}>S · Size</button>
              <button className={'cs-chip' + (checks.seal ? ' done' : '')} disabled={!!done} onClick={() => check('seal')}>S · Seal</button>
            </>}
      </div>
      {deployed && (
        <div className="cs-ctrls">
          <button className="cs-btn" disabled={!!done} onClick={recapture}>↩ Recapture</button>
          <button className="cs-btn primary" disabled={!!done || !allChecked} onClick={release}>✂ Release the device</button>
          {!allChecked && <span className="cs-pts">Check all four PASS criteria before release.</span>}
        </div>
      )}
      <div className="cs-readout">
        <div><span>Recaptures</span><b>{recaps}</b></div>
        <div><span>Position</span><b style={{ color: checks.pos ? (M.posOk ? 'var(--green)' : 'var(--red)') : undefined }}>{checks.pos ? (M.posOk ? 'PASS' : 'FAIL') : '—'}</b></div>
        <div><span>Anchor</span><b style={{ color: checks.tug ? (M.anchorOk ? 'var(--green)' : 'var(--red)') : undefined }}>{checks.tug ? (M.anchorOk ? 'PASS' : 'FAIL') : '—'}</b></div>
        <div><span>Size</span><b style={{ color: checks.size ? (M.sizeOk ? 'var(--green)' : 'var(--red)') : undefined }}>{checks.size ? `${M.cMin.toFixed(0)}–${M.cMax.toFixed(0)}%` : '—'}</b></div>
        <div><span>Seal</span><b style={{ color: checks.seal ? (M.sealOk ? 'var(--green)' : 'var(--red)') : undefined }}>{checks.seal ? (M.leak ? `${M.leak} mm` : 'none') : '—'}</b></div>
      </div>
      {log.length > 0 && <ul className="cs-ul" style={{ marginTop: 10, fontSize: 14 }}>{log.map((l, i) => <li key={i} className="cs-li" style={{ opacity: i ? 0.6 : 1 }}>{l}</li>)}</ul>}
    </div>
  );
}

/* ---------- arterial line: pulsus paradoxus ---------- */

const PULSUS = {
  tamp: { name: 'Now (bed 12, 17:50)', top: 92, bot: 68, dia: 58, hr: 124, rr: 22 },
  norm: { name: 'This morning', top: 132, bot: 126, dia: 70, hr: 78, rr: 14 },
};

export function PulsusLine({ onMeasure, done }) {
  const ref = useRef(null);
  const [mode, setMode] = useState('tamp');
  const [hi, setHi] = useState(110);
  const [lo, setLo] = useState(80);
  const S = useRef({}); S.current = { mode, hi, lo };
  useCanvas(ref, 250, (g, w, h, t) => {
    const { mode: m, hi: H, lo: L } = S.current;
    const P = PULSUS[m];
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const x0 = 40, x1 = w - 8, top = 20, bot = h - 60;
    const Y = p => bot - (p - 40) / 100 * (bot - top);
    g.fillStyle = '#6A7F9B'; g.font = `600 9px ${MONO}`;
    for (const p of [60, 80, 100, 120, 140]) { g.fillText(String(p), 6, Y(p) + 3); g.strokeStyle = '#0D1726'; g.beginPath(); g.moveTo(x0, Y(p)); g.lineTo(x1, Y(p)); g.stroke(); }
    const span = 5.5;
    const beat = 60 / P.hr, br = 60 / P.rr;
    g.strokeStyle = '#FF5A52'; g.lineWidth = 1.6; g.beginPath();
    for (let px = x0; px < x1; px += 0.25) {
      const s = (px - x0) / (x1 - x0) * span + t * 0.6;
      const resp = (Math.sin(s / br * 2 * Math.PI) + 1) / 2;        // 1 = expiration, 0 = deep inspiration
      const sys = P.bot + (P.top - P.bot) * resp;
      const x = (s % beat) / beat;
      const wave = x < 0.12 ? Math.sin(x / 0.12 * Math.PI / 2) : x < 0.3 ? 1 - (x - 0.12) * 1.3 : x < 0.33 ? 0.74 + (x - 0.3) * 1.6 : Math.max(0, 0.79 - (x - 0.33) * 1.2);
      const p = P.dia + (sys - P.dia) * wave;
      px === x0 ? g.moveTo(px, Y(p)) : g.lineTo(px, Y(p));
    }
    g.stroke();
    // respiration
    g.strokeStyle = '#F2D24B'; g.lineWidth = 1.2; g.beginPath();
    for (let px = x0; px < x1; px++) {
      const s = (px - x0) / (x1 - x0) * span + t * 0.6;
      const v = Math.sin(s / br * 2 * Math.PI);
      px === x0 ? g.moveTo(px, h - 26 - v * 14) : g.lineTo(px, h - 26 - v * 14);
    }
    g.stroke();
    g.fillStyle = '#F2D24B'; g.fillText('RESP  (down = inspiration)', x0, h - 4);
    // the learner's two lines
    for (const [v, c, l] of [[H, '#34E39A', 'expiratory peak'], [L, '#22D3EE', 'inspiratory peak']]) {
      g.strokeStyle = c; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(x1, Y(v)); g.stroke(); g.setLineDash([]);
      g.fillStyle = c; g.font = `700 10px ${MONO}`; g.fillText(`${l} ${v}`, x1 - 150, Y(v) - 4);
    }
    g.fillStyle = '#FF5A52'; g.font = `600 10px ${MONO}`; g.fillText('ART mmHg', x0, 12);
  }, []);
  const measure = () => {
    const P = PULSUS.tamp;
    onMeasure?.({ hi, lo, pp: hi - lo, close: Math.abs(hi - P.top) <= 4 && Math.abs(lo - P.bot) <= 4 });
  };
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {Object.entries(PULSUS).map(([k, v]) => <button key={k} className={'cs-chip' + (k === mode ? ' on' : '')} onClick={() => setMode(k)}>{v.name}</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 250 }} aria-label="Radial arterial line with respiration" /></div>
      <div className="cs-ctrls"><label className="cs-slider" style={{ flex: 1 }}>Expiration<input type="range" min="50" max="140" step="1" value={hi} disabled={!!done} onChange={e => setHi(+e.target.value)} style={{ width: '100%' }} aria-label="Highest systolic peak" />{hi}</label></div>
      <div className="cs-ctrls"><label className="cs-slider" style={{ flex: 1 }}>Inspiration<input type="range" min="50" max="140" step="1" value={lo} disabled={!!done} onChange={e => setLo(+e.target.value)} style={{ width: '100%' }} aria-label="Lowest systolic peak" />{lo}</label></div>
      <div className="cs-ctrls">
        <button className="cs-btn primary" disabled={!!done || mode !== 'tamp'} onClick={measure}>Measure the paradox now</button>
        <b className="cs-mono" style={{ color: 'var(--gold)' }}>Δ {hi - lo} mmHg</b>
      </div>
      <p className="cs-pts">Put the green line on the tallest systolic peaks (expiration) and the cyan line on the smallest (inspiration). Normal fall with inspiration: under 10 mmHg.</p>
    </div>
  );
}

/* ---------- echo-guided subxiphoid pericardiocentesis ---------- */

const APPROACH = {
  sub: { label: 'Subxiphoid, 30–45° to the skin, aiming at the left shoulder — echo-guided', ok: true, why: 'The classic route: below the costal margin, through the diaphragm into the most dependent pericardium, away from the coronaries and pleura.' },
  apical: { label: 'Apical, where echo shows the most fluid', ok: true, why: 'Reasonable when echo shows the largest pocket at the apex — but the pleura is closer and the LV apex is right there.' },
  para: { label: 'Left parasternal, 4th intercostal space, close to the sternum', ok: false, why: 'The internal mammary artery runs about 1–2 cm from the sternal edge: a second bleed on top of the first.' },
};

export function Pericardio({ onStep, done }) {
  const ref = useRef(null);
  const [app, setApp] = useState(null);
  const [depth, setDepth] = useState(0);
  const [phase, setPhase] = useState('choose');   // choose → needle → confirm → drain → done
  const [drained, setDrained] = useState(0);
  const [msg, setMsg] = useState('');
  const S = useRef({}); S.current = { depth, phase, drained, app };
  useCanvas(ref, 230, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = 2, R = h * 1.05;
    g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, Math.PI / 2 - 0.62, Math.PI / 2 + 0.62); g.closePath(); g.clip();
    g.fillStyle = 'rgba(150,150,150,0.35)'; g.beginPath(); g.ellipse(cx - 20, 44, w * 0.42, 36, 0, 0, Math.PI * 2); g.fill();
    const eff = Math.max(4, 22 - st.drained / 30);
    const hy = 130 + eff * 0.8;
    g.fillStyle = '#000'; g.beginPath(); g.ellipse(cx, hy, 104 + eff * 2, 52 + eff * 1.8, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(230,230,230,0.7)'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, hy, 104 + eff * 2, 52 + eff * 1.8, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(170,170,170,0.55)'; g.beginPath(); g.ellipse(cx, hy, 100, 50, 0, 0, Math.PI * 2); g.fill();
    const beat = (Math.sin(t * 2 * Math.PI * 2) + 1) / 2;
    const col = eff > 12 ? Math.max(0, beat - 0.4) * 22 : 0;
    g.fillStyle = '#050505';
    g.beginPath(); g.ellipse(cx - 40, hy - 14 + col * 0.4, 40, Math.max(4, 19 - col * 0.6), -0.15, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx + 40, hy + 4, 36 - beat * 5, 27 - beat * 3, 0.2, 0, Math.PI * 2); g.fill();
    // bubbles after agitated saline
    if (st.phase === 'drain' || st.phase === 'done' || st.phase === 'confirm2') {
      for (let i = 0; i < 26; i++) { const a = i * 0.24 + t * 0.4; g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(cx + Math.cos(a) * (104 + eff * 1.6), hy + Math.sin(a) * (52 + eff * 1.5), 2, 2); }
    }
    g.restore();
    // needle from bottom-left (subxiphoid)
    if (st.app) {
      const nx = 30, ny = 30, ang = 0.62;
      const L = st.depth * 22;
      g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + Math.cos(ang) * L, ny + Math.sin(ang) * L); g.stroke();
      g.fillStyle = '#F5C451'; g.beginPath(); g.arc(nx + Math.cos(ang) * L, ny + Math.sin(ang) * L, 3, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText('SUBCOSTAL', 10, 16);
    g.fillText(`Effusion ${Math.round(eff)} mm · drained ${st.drained} mL`, 10, h - 10);
  }, []);
  const choose = k => {
    if (phase !== 'choose') return;
    setApp(k);
    if (!APPROACH[k].ok) { setMsg(APPROACH[k].why + ' Choose again.'); setApp(null); onStep?.({ wrongApproach: true }); return; }
    setMsg(APPROACH[k].why); setPhase('needle'); onStep?.({ approach: k });
  };
  const advance = () => {
    const nd = depth + 1;
    setDepth(nd);
    if (nd < 5) setMsg(`${nd * 1.5} cm: through skin, fascia and the diaphragm. Aspirating as you go — nothing yet.`);
    else if (nd === 5) { setMsg('6–7 cm: a free flash of dark blood into the syringe. Stop advancing.'); setPhase('confirm'); }
  };
  const confirm = () => { setPhase('drain'); setMsg('Agitated saline through the needle: bubbles in the pericardial space, NOT in the right ventricle. You are in the right place. Wire, dilator, 6F pigtail.'); onStep?.({ confirmed: true }); };
  const drain = () => {
    const n = drained + 60;
    setDrained(n); onStep?.({ drained: n });
    if (n >= 300) { setPhase('done'); setMsg('300 mL of blood out. The heart fills again.'); }
  };
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 230 }} aria-label="Subcostal echo during pericardiocentesis" /></div>
      {phase === 'choose' && (
        <div className="cs-opts" style={{ marginTop: 10 }}>
          {Object.entries(APPROACH).map(([k, v]) => <button key={k} className="cs-opt" disabled={!!done} onClick={() => choose(k)}><span className="cs-opt-k">↘</span><span>{v.label}</span></button>)}
        </div>
      )}
      <div className="cs-ctrls">
        {phase === 'needle' && <button className="cs-btn primary" disabled={!!done} onClick={advance}>Advance 1.5 cm, aspirating</button>}
        {phase === 'confirm' && <button className="cs-btn primary" disabled={!!done} onClick={confirm}>Confirm position: agitated saline</button>}
        {phase === 'drain' && <button className="cs-btn primary" disabled={!!done} onClick={drain}>Aspirate 60 mL</button>}
        {phase === 'done' && <span className="cs-pts" style={{ color: 'var(--green)' }}>Drain secured, on free drainage.</span>}
      </div>
      {msg && <p className="cs-pts" style={{ marginTop: 8 }}>{msg}</p>}
    </div>
  );
}
