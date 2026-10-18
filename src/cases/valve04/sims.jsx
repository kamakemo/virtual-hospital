import React, { useRef, useState } from 'react';
import { useCanvas } from '../kit/Monitor.jsx';
import { useCase } from '../kit/CaseKit.jsx';

/* ============================================================
   VALVE 04 · LOCAL SIMULATORS (written in the kit's style, so
   they can be promoted to the kit later)

   ProlapseQuant     — TOE of a Barlow valve with a flail P2: PISA
                       radius AND vena contracta, measured by hand
   TwoExitVentricle  — why an EF of 60% in severe MR is already a
                       damaged ventricle: contractility vs the EF
                       you see when the LV has a back door
   SurveillanceTrend — serial echoes plotted against the 2025
                       ESC/EACTS triggers, with the cost of waiting
   MitralMap         — 3D TOE en-face view (rotatable) beside a
                       blank Carpentier map: name the segments
   RingPlanner       — posterior leaflet height and ring size →
                       AL/PL ratio, C-sept distance, coaptation,
                       gradient: the geometry of SAM
   RepairBench       — neochords on P2: number of loops, papillary
                       heads, length; saline test; ring; wean
   SamCrisis         — post-repair SAM with LVOT obstruction: a
                       live LVOT gradient that answers each drug
   ============================================================ */

const MONO = '"JetBrains Mono", "IBM Plex Mono", monospace';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- 1 · PISA and vena contracta on a flail P2 ---------- */

/**
 * Mid-oesophageal long-axis TOE, colour zoomed on a Barlow valve: both
 * leaflets thick and billowing, the P2 scallop flail on a ruptured chord.
 * A posterior flail throws the jet ANTERIORLY, along the wall. Measure
 * the flow-convergence radius on the LV side and the narrowest neck of
 * the jet (vena contracta) just above the orifice.
 * onMeasure({ r, va, eroa, rvol, rf, vc, closeR, closeVC })
 */
export function ProlapseQuant({ eroa = 0.52, vmax = 540, vti = 160, vcTrue = 0.75, forwardSV = 82, onMeasure }) {
  const ref = useRef(null);
  const [va, setVa] = useState(40);
  const [cal, setCal] = useState(0.55);
  const [vc, setVc] = useState(0.35);
  const rTrue = Math.sqrt(eroa * vmax / (2 * Math.PI * va));
  const S = useRef({}); S.current = { va, cal, rTrue, vc };
  useCanvas(ref, 330, (g, w, h, t) => {
    const { cal: c, rTrue: r, va: v, vc: vcw } = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = 6, R = h * 1.08;
    g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, Math.PI * 0.5 - 0.72, Math.PI * 0.5 + 0.72); g.closePath(); g.clip();
    for (let i = 0; i < 2400; i++) { const a = Math.PI / 2 + (Math.random() - 0.5) * 1.44, rr = Math.random() * R; g.fillStyle = `rgba(190,190,190,${Math.random() * 0.09})`; g.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2, 2); }
    const cm = h / 9.2;
    const vy = h * 0.5, ox = cx + 0.35 * cm;
    const ph = (t * 1.2) % 1, sys = ph < 0.42;
    // a big LA above, a dilated LV below
    g.strokeStyle = 'rgba(200,200,200,0.5)'; g.lineWidth = 6;
    g.beginPath(); g.ellipse(cx, vy - 2.3 * cm, 3.4 * cm, 2.2 * cm, 0, Math.PI * 0.05, Math.PI * 0.95, true); g.stroke();
    g.beginPath(); g.ellipse(cx, vy + 2.8 * cm, 3.3 * cm, 2.9 * cm, 0, Math.PI * 1.05, Math.PI * 1.95, true); g.stroke();
    // thick, redundant leaflets: both billow above the annular plane in systole
    g.strokeStyle = 'rgba(235,235,235,0.9)'; g.lineWidth = 7; g.lineCap = 'round';
    const bil = sys ? 0.75 : -0.9;
    g.beginPath(); g.moveTo(cx - 2.8 * cm, vy); g.bezierCurveTo(cx - 2.0 * cm, vy - bil * cm, cx - 0.6 * cm, vy - bil * 1.1 * cm, ox - 0.15 * cm, vy + (sys ? -0.1 : 1.8) * cm); g.stroke();
    // the flail P2: its tip whips back into the LA, trailing a torn chord
    const tip = sys ? -1.6 : 1.5;
    g.beginPath(); g.moveTo(cx + 2.8 * cm, vy); g.bezierCurveTo(cx + 2.0 * cm, vy - bil * 1.2 * cm, cx + 1.0 * cm, vy - bil * 0.8 * cm, ox + 0.45 * cm, vy + tip * cm); g.stroke();
    g.lineWidth = 1.5; g.beginPath(); g.moveTo(ox + 0.45 * cm, vy + tip * cm); g.lineTo(ox + 0.9 * cm, vy + (tip - (sys ? 0.5 : -0.5)) * cm); g.stroke();
    g.lineCap = 'butt';
    // annular plane
    g.setLineDash([4, 4]); g.strokeStyle = 'rgba(167,139,250,0.7)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(cx - 3 * cm, vy); g.lineTo(cx + 3 * cm, vy); g.stroke(); g.setLineDash([]);
    if (sys) {
      for (let k = 4; k >= 1; k--) {
        const rk = r * cm * (k === 1 ? 1 : 1 + (k - 1) * 0.5);
        g.fillStyle = k === 1 ? 'rgba(60,140,255,0.85)' : k % 2 ? 'rgba(255,190,40,0.5)' : 'rgba(220,40,40,0.55)';
        g.beginPath(); g.arc(ox, vy, rk, 0, Math.PI); g.fill();
      }
      // jet neck (vena contracta) and the anteriorly directed, wall-hugging jet
      const half = vcTrue * cm / 2;
      const grd = g.createLinearGradient(ox, vy, cx - 3 * cm, vy - 3.6 * cm);
      grd.addColorStop(0, 'rgba(80,255,120,0.92)'); grd.addColorStop(0.45, 'rgba(255,230,60,0.8)'); grd.addColorStop(1, 'rgba(60,120,255,0.35)');
      g.fillStyle = grd;
      g.beginPath(); g.moveTo(ox - half, vy); g.lineTo(ox - half, vy - 0.35 * cm);
      g.quadraticCurveTo(cx - 1.8 * cm, vy - 1.0 * cm, cx - 2.9 * cm, vy - 1.9 * cm);
      g.quadraticCurveTo(cx - 3.1 * cm, vy - 3.6 * cm, cx - 0.8 * cm, vy - 4.1 * cm); g.lineTo(cx - 1.0 * cm, vy - 3.5 * cm);
      g.quadraticCurveTo(cx - 2.4 * cm, vy - 3.1 * cm, cx - 2.2 * cm, vy - 2.0 * cm);
      g.quadraticCurveTo(cx - 1.0 * cm, vy - 0.9 * cm, ox + half, vy - 0.35 * cm); g.lineTo(ox + half, vy); g.fill();
    }
    g.restore();
    // PISA caliper (down from the orifice) and vena contracta caliper (across the neck)
    g.strokeStyle = '#F5C451'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(ox, vy); g.lineTo(ox, vy + c * cm); g.stroke();
    g.beginPath(); g.moveTo(ox - 6, vy + c * cm); g.lineTo(ox + 6, vy + c * cm); g.stroke();
    g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`; g.fillText(`r ${c.toFixed(2)} cm`, ox + 10, vy + c * cm + 4);
    const vyv = vy - 0.22 * cm, hv = vcw * cm / 2;
    g.strokeStyle = '#5EEAD4'; g.beginPath(); g.moveTo(ox - hv, vyv - 6); g.lineTo(ox - hv, vyv + 6); g.moveTo(ox - hv, vyv); g.lineTo(ox + hv, vyv); g.moveTo(ox + hv, vyv - 6); g.lineTo(ox + hv, vyv + 6); g.stroke();
    g.fillStyle = '#5EEAD4'; g.fillText(`VC ${(vcw * 10).toFixed(1)} mm`, ox + hv + 8, vyv - 6);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText('TOE · ME long-axis · colour zoom', 10, 16);
    g.fillText('LA', cx - 0.2 * cm, vy - 3.0 * cm); g.fillText('LV', cx - 0.2 * cm, vy + 4.6 * cm);
    g.fillText('ANT', 10, vy - 0.2 * cm); g.fillText('POST', w - 46, vy - 0.2 * cm);
    g.fillStyle = '#C0392B'; g.fillRect(w - 26, 40, 12, 50); g.fillStyle = '#2E6BE6'; g.fillRect(w - 26, 90, 12, 50);
    g.fillStyle = '#E9F2FC'; g.font = `600 10px ${MONO}`; g.fillText(`±${v}`, w - 54, 36); g.fillText('cm/s', w - 50, 152);
  }, []);
  const eroaM = 2 * Math.PI * cal * cal * va / vmax;
  const rvol = eroaM * vti;
  const rf = rvol / (rvol + forwardSV);
  const closeR = Math.abs(cal - rTrue) < 0.08;
  const closeVC = Math.abs(vc - vcTrue) < 0.08;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 330 }} aria-label="Colour TOE of a flail posterior leaflet with an anteriorly directed jet" /></div>
      <div className="cs-ctrls">
        <span className="cs-pts">Colour baseline (aliasing velocity):</span>
        {[30, 40, 50].map(v => <button key={v} className={'cs-chip' + (va === v ? ' on' : '')} onClick={() => setVa(v)}>{v} cm/s</button>)}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1, minWidth: 200 }}>PISA radius
          <input type="range" min="0.3" max="1.6" step="0.01" value={cal} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="PISA radius caliper" />
        </label>
        <label className="cs-slider" style={{ flex: 1, minWidth: 200 }}>Vena contracta
          <input type="range" min="0.2" max="1.2" step="0.01" value={vc} onChange={e => setVc(+e.target.value)} style={{ width: '100%' }} aria-label="Vena contracta caliper" />
        </label>
        <button className="cs-btn primary" onClick={() => onMeasure?.({ r: cal, va, eroa: eroaM, rvol, rf, vc, closeR, closeVC })}>Measure</button>
      </div>
      <div className="cs-readout">
        <div><span>EROA = 2πr²·Va / Vmax</span><b style={{ color: eroaM >= 0.4 ? 'var(--red)' : undefined }}>{eroaM.toFixed(2)} cm²</b></div>
        <div><span>Regurgitant volume</span><b style={{ color: rvol >= 60 ? 'var(--red)' : undefined }}>{Math.round(rvol)} mL</b></div>
        <div><span>Regurgitant fraction</span><b style={{ color: rf >= 0.5 ? 'var(--red)' : undefined }}>{Math.round(rf * 100)}%</b></div>
        <div><span>Vena contracta</span><b style={{ color: vc >= 0.7 ? 'var(--red)' : undefined }}>{(vc * 10).toFixed(1)} mm</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Mid-systole. PISA: orifice to the first red → blue boundary. Vena contracta: the narrowest neck of the jet, just above the orifice — not the spray in the atrium. MR Vmax {(vmax / 100).toFixed(1)} m/s, VTI {vti} cm, forward stroke volume {forwardSV} mL.</p>
    </div>
  );
}

/* ---------- 2 · The ventricle with a back door ---------- */

/** Teichholz, inverted numerically: the end-systolic diameter (mm) for a volume (mL). */
function diameterFor(vol) {
  let lo = 1, hi = 9;
  for (let i = 0; i < 40; i++) { const d = (lo + hi) / 2; (7 * d ** 3 / (2.4 + d) > vol ? hi = d : lo = d); }
  return (lo + hi) / 2 * 10;
}
export function twoExit(rf, c, forward = 57) {
  const ef = clamp(c * (0.62 + 0.18 * rf), 0.15, 0.85);   // emptying into the low-pressure LA flatters the EF
  const total = forward / (1 - rf);
  const edv = total / ef, esv = edv - total;
  return { ef, total, edv, esv, esd: diameterFor(esv), regurg: total - forward, forward };
}

/**
 * Two exits from one ventricle. The slider "true contractility" is what
 * the muscle can do; the EF is what the echo shows. With a big leak to a
 * low-pressure chamber the EF over-reads the muscle.
 */
export function TwoExitVentricle() {
  const [rf, setRf] = useState(0.5);
  const [c, setC] = useState(0.87);
  const m = twoExit(rf, c);
  const presets = [
    { k: 'Normal heart', rf: 0, c: 1 }, { k: 'Severe MR, healthy muscle', rf: 0.5, c: 1 },
    { k: 'Him today', rf: 0.5, c: 0.87 }, { k: 'Him in 2028 if we wait', rf: 0.52, c: 0.72 },
  ];
  const W = 560, H = 250, lvR = clamp(Math.sqrt(m.edv) * 6.5, 50, 118);
  const exitW = v => clamp(v / 6, 3, 26);
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {presets.map(p => <button key={p.k} className={'cs-chip' + (p.rf === rf && p.c === c ? ' on' : '')} onClick={() => { setRf(p.rf); setC(p.c); }}>{p.k}</button>)}
      </div>
      <div className="cs-viewer" style={{ background: '#03070B' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="Left ventricle with two exits">
          <ellipse cx="170" cy="140" rx={lvR * 0.8} ry={lvR} fill="#14243B" stroke="#FF6B9A" strokeWidth="3" />
          <ellipse cx="170" cy="140" rx={lvR * 0.8 * Math.sqrt(m.esv / m.edv)} ry={lvR * Math.sqrt(m.esv / m.edv)} fill="#2B1020" stroke="#FF4D6D" strokeDasharray="5 4" />
          <text x="170" y="144" textAnchor="middle" fill="#E9F2FC" fontFamily={MONO} fontSize="12">LV</text>
          {/* forward: to the aorta, against ~120 mmHg */}
          <path d={`M${170 + lvR * 0.5} ${140 - lvR * 0.7} C 330 40, 380 40, 440 50`} stroke="#34E39A" strokeWidth={exitW(m.forward)} fill="none" strokeLinecap="round" />
          <text x="452" y="46" fill="#34E39A" fontFamily={MONO} fontSize="12">AORTA</text>
          <text x="452" y="62" fill="#A9BBD2" fontFamily={MONO} fontSize="11">{Math.round(m.forward)} mL · ~120 mmHg</text>
          {/* backwards: to the LA, against ~15 mmHg */}
          <path d={`M${170 + lvR * 0.6} ${140 + lvR * 0.2} C 330 170, 380 190, 440 196`} stroke="#FF4D6D" strokeWidth={exitW(m.regurg)} fill="none" strokeLinecap="round" opacity={rf > 0 ? 1 : 0.15} />
          <text x="452" y="192" fill="#FF4D6D" fontFamily={MONO} fontSize="12">LEFT ATRIUM</text>
          <text x="452" y="208" fill="#A9BBD2" fontFamily={MONO} fontSize="11">{Math.round(m.regurg)} mL · ~15 mmHg</text>
          <text x="14" y="22" fill="#6A7F9B" fontFamily={MONO} fontSize="11">solid = end-diastole · dashed = end-systole</text>
        </svg>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1, minWidth: 200 }}>Regurgitant fraction {Math.round(rf * 100)}%
          <input type="range" min="0" max="0.6" step="0.01" value={rf} onChange={e => setRf(+e.target.value)} style={{ width: '100%' }} aria-label="Regurgitant fraction" />
        </label>
        <label className="cs-slider" style={{ flex: 1, minWidth: 200 }}>True contractility {Math.round(c * 100)}%
          <input type="range" min="0.6" max="1.1" step="0.01" value={c} onChange={e => setC(+e.target.value)} style={{ width: '100%' }} aria-label="True contractility" />
        </label>
      </div>
      <div className="cs-readout">
        <div><span>EF the echo shows</span><b style={{ color: m.ef <= 0.6 && rf >= 0.4 ? 'var(--red)' : 'var(--green)' }}>{Math.round(m.ef * 100)}%</b></div>
        <div><span>LVEDV · LVESV</span><b>{Math.round(m.edv)} · {Math.round(m.esv)} mL</b></div>
        <div><span>LVESD (est.)</span><b style={{ color: m.esd >= 40 ? 'var(--red)' : undefined }}>{Math.round(m.esd)} mm</b></div>
        <div><span>Total stroke volume</span><b>{Math.round(m.total)} mL</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>A teaching model: forward output held at {m.forward} mL; the LV dilates to deliver it. Watch what a 13% loss of muscle strength does to the EF when half of each beat escapes to the atrium — almost nothing.</p>
    </div>
  );
}

/* ---------- 3 · Serial echoes against the triggers ---------- */

const TR_RANK = { trace: 0, mild: 1, moderate: 2, severe: 3 };
/** The 2025 ESC/EACTS logic for asymptomatic severe primary MR, simplified for teaching. */
export function evaluate2025(v, bsa = 1.98) {
  const lvesdi = v.lvesd / bsa;
  const lvDys = v.lvesd >= 40 || lvesdi >= 20 || v.ef <= 60;
  const crit = [
    { k: 'AF', on: !!v.af }, { k: 'SPAP > 50 mmHg at rest', on: v.spap > 50 },
    { k: 'LAVI ≥ 60 mL/m² (or LA ≥ 55 mm)', on: v.lavi >= 60 }, { k: 'TR ≥ moderate', on: TR_RANK[v.tr] >= 2 },
  ];
  const n = crit.filter(c => c.on).length;
  let rec, tone;
  if (!v.severe) { rec = 'MR not yet severe: surveillance.'; tone = 'var(--green)'; }
  else if (lvDys) { rec = 'Class I — surgery: LV dysfunction (LVEF ≤ 60%, LVESD ≥ 40 mm or LVESDi ≥ 20 mm/m²). Already late.'; tone = 'var(--red)'; }
  else if (n >= 3) { rec = 'Class I — repair (≥ 3 additional criteria), if low risk and durable repair likely.'; tone = 'var(--red)'; }
  else if (n >= 1) { rec = `Class IIa — repair in a Heart Valve Centre if low risk and a durable repair is likely (${n} criterion${n > 1 ? 'a' : ''}).`; tone = 'var(--amber)'; }
  else { rec = 'No trigger yet: echo every 6 months, exercise testing, act on the trajectory.'; tone = 'var(--cyan)'; }
  return { lvesdi, lvDys, crit, n, rec, tone };
}

const METRICS = [
  { k: 'lvesd', label: 'LVESD', unit: 'mm', lo: 28, hi: 48, line: 40, bad: v => v >= 40 },
  { k: 'ef', label: 'LVEF', unit: '%', lo: 48, hi: 74, line: 60, bad: v => v <= 60 },
  { k: 'lavi', label: 'LAVI', unit: 'mL/m²', lo: 30, hi: 85, line: 60, bad: v => v >= 60 },
  { k: 'spap', label: 'SPAP', unit: 'mmHg', lo: 20, hi: 62, line: 50, bad: v => v > 50 },
];

/**
 * visits: [{ y, label, lvesd, ef, lavi, spap, af, tr, severe, note, projected }]
 * now: index of today's visit. Past visits can be studied; referral can be
 * placed today or at a projected (future) visit. onRefer(index)
 */
export function SurveillanceTrend({ visits, now, onRefer, referred }) {
  const [metric, setMetric] = useState('lvesd');
  const [sel, setSel] = useState(now);
  const [showFuture, setShowFuture] = useState(false);
  const M = METRICS.find(x => x.k === metric);
  const shown = visits.filter((v, i) => i <= now || showFuture || referred != null);
  const W = 560, H = 260, L = 46, Rm = 16, T = 16, B = 34;
  const y0 = visits[0].y, y1 = visits[visits.length - 1].y;
  const X = y => L + (y - y0) / (y1 - y0) * (W - L - Rm);
  const Y = v => H - B - (v - M.lo) / (M.hi - M.lo) * (H - B - T);
  const v = visits[sel];
  const ev = evaluate2025(v);
  const path = shown.map((p, i) => `${i ? 'L' : 'M'}${X(p.y).toFixed(1)} ${Y(p[metric]).toFixed(1)}`).join(' ');
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {METRICS.map(x => <button key={x.k} className={'cs-chip' + (metric === x.k ? ' on' : '')} onClick={() => setMetric(x.k)}>{x.label}</button>)}
        <button className={'cs-chip' + (showFuture ? ' on' : '')} onClick={() => setShowFuture(s => !s)}>🔮 If we wait…</button>
      </div>
      <div className="cs-viewer" style={{ background: '#03070B' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label={`${M.label} over time`}>
          {[0, 0.25, 0.5, 0.75, 1].map(f => { const val = M.lo + f * (M.hi - M.lo); return <g key={f}><line x1={L} x2={W - Rm} y1={Y(val)} y2={Y(val)} stroke="#13212D" /><text x={6} y={Y(val) + 4} fill="#3B4B5A" fontFamily={MONO} fontSize="12">{Math.round(val)}</text></g>; })}
          <line x1={L} x2={W - Rm} y1={Y(M.line)} y2={Y(M.line)} stroke="#FF4D6D" strokeDasharray="6 4" strokeWidth="1.5" />
          <text x={L + 6} y={Y(M.line) - 6} fill="#FF4D6D" fontFamily={MONO} fontSize="13">trigger {M.line} {M.unit}</text>
          <path d={path} fill="none" stroke="#22D3EE" strokeWidth="2" />
          {shown.map(p => {
            const i = visits.indexOf(p);
            return (
              <g key={p.y} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
                <circle cx={X(p.y)} cy={Y(p[metric])} r={i === sel ? 9 : 6} fill={p.projected ? '#03070B' : M.bad(p[metric]) ? '#FF4D6D' : '#22D3EE'} stroke={p.projected ? '#F5C451' : '#CFFFF8'} strokeWidth="2" strokeDasharray={p.projected ? '3 2' : undefined} />
                <text x={X(p.y)} y={Y(p[metric]) - 14} textAnchor="middle" fill="#E9F2FC" fontFamily={MONO} fontSize="13">{p[metric]}</text>
                <text x={X(p.y)} y={H - 12} textAnchor="middle" fill={i === now ? '#F5C451' : '#6A7F9B'} fontFamily={MONO} fontSize="13">{i === now ? 'NOW' : p.y}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="cs-row" style={{ marginTop: 8 }}>
        {shown.map(p => { const i = visits.indexOf(p); return <button key={p.y} className={'cs-chip' + (sel === i ? ' on' : '')} onClick={() => setSel(i)}>{p.label}</button>; })}
      </div>
      <div className="cs-readout">
        <div><span>LVESD · LVESDi</span><b style={{ color: ev.lvesdi >= 20 || v.lvesd >= 40 ? 'var(--red)' : undefined }}>{v.lvesd} mm · {ev.lvesdi.toFixed(1)}</b></div>
        <div><span>LVEF</span><b style={{ color: v.ef <= 60 ? 'var(--red)' : undefined }}>{v.ef}%</b></div>
        <div><span>LAVI · SPAP</span><b>{v.lavi} · {v.spap}</b></div>
        <div><span>Rhythm · TR</span><b>{v.af ? v.af : 'sinus'} · {v.tr}</b></div>
      </div>
      <p className="cs-p" style={{ fontSize: 14, margin: '10px 0 4px' }}>{v.projected && <b style={{ color: 'var(--gold)' }}>Projected if we wait. </b>}{v.note}</p>
      <div className="cs-row" style={{ gap: 6 }}>
        {ev.crit.map(c => <span key={c.k} className={'cs-flag ' + (c.on ? 'red' : 'blue')}>{c.on ? '✓' : '·'} {c.k}</span>)}
      </div>
      <div className="cs-fb" style={{ borderColor: ev.tone, marginTop: 8 }}><b style={{ color: ev.tone }}>2025 ESC/EACTS: </b>{ev.rec}</div>
      {referred == null ? (
        <div className="cs-row" style={{ marginTop: 10 }}>
          <button className="cs-btn primary" disabled={sel < now} onClick={() => onRefer?.(sel)}>📨 Refer for surgery at this visit</button>
          {sel < now && <span className="cs-pts">That visit is in the past — study it, then decide from today onwards.</span>}
        </div>
      ) : <p className="cs-pts" style={{ marginTop: 8 }}>Referral placed at: {visits[referred].label}.</p>}
    </div>
  );
}

/* ---------- 4 · The Carpentier map ---------- */

const SEGS = ['A1', 'A2', 'A3', 'P1', 'P2', 'P3'];
const STATES = ['normal', 'billowing', 'flail'];
const STATE_COL = { normal: '#1B2C45', billowing: '#8A6A12', flail: '#8C1D33' };

/** Segment polygons of a valve seen en face, surgeon's view (aorta 12 o'clock, LAA 9 o'clock). */
function segPolys(cx, cy, rx, ry, dip) {
  const yT = x => cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  const yB = x => cy + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  const yC = x => cy + dip * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  const xs = [cx - rx, cx - rx / 3, cx + rx / 3, cx + rx];
  const poly = (a, b, top, bot) => {
    const pts = [];
    for (let k = 0; k <= 16; k++) { const x = a + (b - a) * k / 16; pts.push([x, top(x)]); }
    for (let k = 16; k >= 0; k--) { const x = a + (b - a) * k / 16; pts.push([x, bot(x)]); }
    return pts;
  };
  const out = {};
  for (let i = 0; i < 3; i++) {
    out['A' + (i + 1)] = poly(xs[i], xs[i + 1], yT, yC);
    out['P' + (i + 1)] = poly(xs[i], xs[i + 1], yC, yB);
  }
  return out;
}
const ptsStr = pts => pts.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
const centroid = pts => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];

/**
 * Left: the 3D TOE en-face rendering, which the machine hands you in an
 * arbitrary orientation — rotate it until the aorta is at 12 o'clock and the
 * LAA at 9 (the surgeon's view). Right: a blank Carpentier map; tap each
 * segment to cycle normal → billowing → flail. onSubmit({ marks, correct, got })
 */
export function MitralMap({ truth, onSubmit, done }) {
  const [rot, setRot] = useState(180);
  const [marks, setMarks] = useState(() => Object.fromEntries(SEGS.map(s => [s, 'normal'])));
  const [submitted, setSubmitted] = useState(!!done);
  const polys = segPolys(150, 150, 118, 84, 22);
  const cyc = s => !submitted && setMarks(m => ({ ...m, [s]: STATES[(STATES.indexOf(m[s]) + 1) % 3] }));
  const view = done ? done.marks : marks;
  const correct = SEGS.filter(s => view[s] === truth[s]).length;
  return (
    <div className="cs-card tight">
      <div className="cs-grid2">
        <div>
          <div className="cs-pts" style={{ marginBottom: 6 }}>3D TOE · en-face from the left atrium · rotation {rot}°</div>
          <div className="cs-viewer" style={{ background: '#000' }}>
            <svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block' }} role="img" aria-label="3D en-face view of the mitral valve">
              <defs>
                <radialGradient id="mm-bill" cx="50%" cy="45%" r="60%"><stop offset="0%" stopColor="#F7E2B0" /><stop offset="100%" stopColor="#9A6B3A" /></radialGradient>
                <radialGradient id="mm-flat" cx="50%" cy="50%" r="70%"><stop offset="0%" stopColor="#C98A6A" /><stop offset="100%" stopColor="#6B3324" /></radialGradient>
              </defs>
              <g transform={`rotate(${rot} 150 150)`}>
                <circle cx="150" cy="30" r="24" fill="#4B2A20" stroke="#B9826A" strokeWidth="2" />
                <path d="M150 30 L150 8 M150 30 L131 42 M150 30 L169 42" stroke="#B9826A" strokeWidth="2" />
                <path d="M30 120 q-26 6 -22 30 q6 14 26 6" fill="#3B1E17" stroke="#B9826A" strokeWidth="2" />
                <ellipse cx="150" cy="150" rx="124" ry="90" fill="none" stroke="#D8A88C" strokeWidth="5" />
                {SEGS.map(s => {
                  const st = truth[s];
                  return <polygon key={s} points={ptsStr(polys[s])} fill={st === 'normal' ? 'url(#mm-flat)' : 'url(#mm-bill)'} stroke="#2A140E" strokeWidth="1.2" opacity={st === 'normal' ? 0.85 : 1} />;
                })}
                {SEGS.filter(s => truth[s] === 'flail').map(s => {
                  const [x, y] = centroid(polys[s]);
                  return (
                    <g key={s}>
                      <ellipse cx={x} cy={y - 4} rx="26" ry="16" fill="#FFF2D6" opacity="0.9" />
                      {[-12, -2, 9].map(dx => <path key={dx} d={`M${x + dx} ${y - 6} q ${dx / 2} -22 ${dx} -34`} stroke="#FFFFFF" strokeWidth="1.6" fill="none" />)}
                    </g>
                  );
                })}
              </g>
              <text x="8" y="292" fill="#9FB4C6" fontFamily={MONO} fontSize="10">bright = above annulus · threads = torn chords</text>
            </svg>
          </div>
          <div className="cs-ctrls">
            <button className="cs-btn" onClick={() => setRot(r => (r + 270) % 360)}>⟲ 90°</button>
            <button className="cs-btn" onClick={() => setRot(r => (r + 90) % 360)}>⟳ 90°</button>
            {rot === 0 ? <span className="cs-pts" style={{ color: 'var(--green)' }}>Surgeon’s view: aorta at 12, LAA at 9.</span> : <span className="cs-pts">Find the aortic valve and the appendage.</span>}
          </div>
        </div>
        <div>
          <div className="cs-pts" style={{ marginBottom: 6 }}>Your map · surgeon’s view · tap to cycle</div>
          <div className="cs-viewer" style={{ background: '#03070B' }}>
            <svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block' }} role="group" aria-label="Carpentier segment map">
              <text x="150" y="40" textAnchor="middle" fill="#6A7F9B" fontFamily={MONO} fontSize="11">AORTIC VALVE</text>
              <text x="10" y="154" fill="#6A7F9B" fontFamily={MONO} fontSize="11">LAA</text>
              {SEGS.map(s => {
                const [x, y] = centroid(polys[s]);
                const ok = submitted && view[s] === truth[s];
                return (
                  <g key={s} onClick={() => cyc(s)} style={{ cursor: submitted ? 'default' : 'pointer' }} role="button" tabIndex={0} aria-label={`${s}: ${view[s]}`}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && cyc(s)}>
                    <polygon points={ptsStr(polys[s])} fill={STATE_COL[view[s]]} stroke={submitted ? (ok ? '#34E39A' : '#FF4D6D') : '#4B6A92'} strokeWidth={submitted ? 2.5 : 1.5} />
                    <text x={x} y={y + 1} textAnchor="middle" fill="#E9F2FC" fontFamily={MONO} fontSize="14" fontWeight="700">{s}</text>
                    <text x={x} y={y + 16} textAnchor="middle" fill="#C9D6E6" fontFamily={MONO} fontSize="9">{view[s]}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          {!submitted ? (
            <div className="cs-ctrls">
              <button className="cs-btn primary" onClick={() => {
                const got = SEGS.filter(s => marks[s] === truth[s]).length;
                setSubmitted(true);
                onSubmit?.({ marks: { ...marks }, correct: got, flailRight: marks.P2 === truth.P2 && SEGS.every(s => (marks[s] === 'flail') === (truth[s] === 'flail')) });
              }}>Submit the map</button>
              <span className="cs-pts">Normal → billowing → flail</span>
            </div>
          ) : <p className="cs-pts" style={{ marginTop: 8 }}>{correct}/6 segments right. Truth: {SEGS.filter(s => truth[s] !== 'normal').map(s => `${s} ${truth[s]}`).join(', ')}; the rest normal.</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------- 5 · Ring and leaflet height: the geometry of SAM ---------- */

const AML = 32;   // mm: a long Barlow anterior leaflet
export function ringModel(ring, plh) {
  const ratio = AML / plh;
  const csept = 18 + (ring - 28) * 0.9 + (24 - plh) * 0.55;
  const coapt = 3 + (40 - ring) * 0.8 + Math.min(plh, 18) * 0.3;
  const grad = 1.4 + Math.max(0, 34 - ring) * 0.9;
  const sam = csept < 25 || ratio < 1.3 ? 'high' : csept < 28 || ratio < 1.6 ? 'borderline' : 'low';
  const residual = coapt < 8 ? 'moderate' : 'none';
  const good = sam === 'low' && coapt >= 8 && grad < 5;
  return { ratio, csept, coapt, grad, sam, residual, good, ring, plh };
}

/**
 * A side view through A2–P2. Choose the ring size and how tall the posterior
 * leaflet is left after repair; the coaptation point moves, and with it the
 * distance from the coaptation point to the septum. onLock(model)
 */
export function RingPlanner({ onLock, done }) {
  const [ring, setRing] = useState(done?.ring ?? 30);
  const [plh, setPlh] = useState(done?.plh ?? 24);
  const m = ringModel(ring, plh);
  const locked = !!done;
  const W = 560, H = 270, ay = 120, mm = 4.2;
  const sx = 90;                                             // septal surface
  const cpX = sx + m.csept * mm * 1.2, cpY = ay + 46;        // the coaptation point, placed by its distance from the septum
  const samCol = m.sam === 'high' ? '#FF4D6D' : m.sam === 'borderline' ? '#F5C451' : '#34E39A';
  return (
    <div className="cs-card tight">
      <div className="cs-viewer" style={{ background: '#03070B' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="Side view of the repaired mitral valve and the outflow tract">
          {/* basal septum with its bulge */}
          <path d={`M40 10 L${sx - 10} 10 Q ${sx + 18} 120 ${sx - 6} 260 L40 260 Z`} fill="#3A2230" stroke="#FF6B9A" />
          <text x="48" y="140" fill="#FF6B9A" fontFamily={MONO} fontSize="15" transform="rotate(-90 52 140)">SEPTUM</text>
          {/* aortic root / LVOT up top-left */}
          <text x={sx + 20} y="26" fill="#6A7F9B" fontFamily={MONO} fontSize="15">LVOT → AORTA</text>
          {/* annular plane, ring */}
          <line x1={sx + 60} x2={W - 40} y1={ay} y2={ay} stroke="#A78BFA" strokeDasharray="4 4" />
          <circle cx={sx + 70 + (40 - ring) * 2} cy={ay} r="7" fill="#F5C451" />
          <circle cx={W - 50} cy={ay} r="7" fill="#F5C451" />
          <text x={W - 150} y={ay - 12} fill="#F5C451" fontFamily={MONO} fontSize="15">ring {ring} mm</text>
          {/* anterior leaflet from the aorto-mitral curtain down to the coaptation point */}
          <path d={`M${sx + 70 + (40 - ring) * 2} ${ay} Q ${(sx + 70 + cpX) / 2 - 10} ${ay + 30} ${cpX} ${cpY}`} stroke="#E9F2FC" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* the residual anterior leaflet tip beyond coaptation: the part SAM drags */}
          <path d={`M${cpX} ${cpY} q -10 ${8 + m.coapt * 0.8} ${-18 - Math.max(0, 28 - m.csept) * 2.5} ${12 + m.coapt}`} stroke={samCol} strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* posterior leaflet: height = plh */}
          <path d={`M${W - 50} ${ay} Q ${W - 90} ${ay + plh * 1.6} ${cpX + 6} ${cpY}`} stroke="#E9F2FC" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* C-sept distance */}
          <line x1={sx + 4} x2={cpX} y1={cpY} y2={cpY} stroke={samCol} strokeDasharray="3 3" />
          <text x={(sx + cpX) / 2 - 30} y={cpY - 8} fill={samCol} fontFamily={MONO} fontSize="16">C-sept {m.csept.toFixed(0)} mm</text>
          <text x={W - 180} y={H - 16} fill="#6A7F9B" fontFamily={MONO} fontSize="15">LV · A2–P2 long-axis</text>
        </svg>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1, minWidth: 200 }}>Ring size {ring} mm
          <input type="range" min="28" max="40" step="2" value={ring} disabled={locked} onChange={e => setRing(+e.target.value)} style={{ width: '100%' }} aria-label="Annuloplasty ring size" />
        </label>
        <label className="cs-slider" style={{ flex: 1, minWidth: 200 }}>Posterior leaflet height after repair {plh} mm
          <input type="range" min="10" max="26" step="1" value={plh} disabled={locked} onChange={e => setPlh(+e.target.value)} style={{ width: '100%' }} aria-label="Posterior leaflet height" />
        </label>
      </div>
      <div className="cs-readout">
        <div><span>AL / PL height ratio</span><b style={{ color: m.ratio < 1.3 ? 'var(--red)' : undefined }}>{m.ratio.toFixed(2)}</b></div>
        <div><span>C-sept distance</span><b style={{ color: samCol }}>{m.csept.toFixed(0)} mm</b></div>
        <div><span>Coaptation length</span><b style={{ color: m.coapt < 8 ? 'var(--red)' : undefined }}>{m.coapt.toFixed(0)} mm</b></div>
        <div><span>Mean gradient</span><b style={{ color: m.grad >= 5 ? 'var(--red)' : undefined }}>{m.grad.toFixed(1)} mmHg</b></div>
        <div><span>SAM risk</span><b style={{ color: samCol }}>{m.sam}</b></div>
      </div>
      {!locked
        ? <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" onClick={() => onLock?.(m)}>🔒 Lock the repair plan</button></div>
        : <p className="cs-pts" style={{ marginTop: 8 }}>Plan locked: ring {done.ring} mm, posterior leaflet {done.plh} mm.</p>}
      <p className="cs-pts" style={{ marginTop: 8 }}>A teaching model of real risk markers: AL/PL &lt; 1.3, C-sept &lt; 25 mm, a long posterior leaflet, a small ring, a basal septal bulge, a small hyperdynamic LV. The anterior leaflet length here is {AML} mm.</p>
    </div>
  );
}

/* ---------- 6 · The repair bench ---------- */

/**
 * The cross-clamp is on. Neochords for the flail P2: how many loops,
 * which papillary heads, what length. Test with saline as often as you like
 * (each test costs clamp time), then put in the ring and come off bypass.
 * onResult({ loops, split, len, edge, residual, csept, grad, sam, clamp })
 */
export function RepairBench({ ring, onResult, done }) {
  const ref = useRef(null);
  const [loops, setLoops] = useState(done?.loops ?? 1);
  const [split, setSplit] = useState(done?.split ?? 'one');
  const [len, setLen] = useState(done?.len ?? 28);
  const [tests, setTests] = useState([]);
  const [clampMin, setClampMin] = useState(done?.clamp ?? 34);
  const edge = (len - 27) * 1.3;                    // mm: + above the annulus (prolapse), − below it
  const S = useRef({}); S.current = { edge, loops };
  const pm = ring || ringModel(36, 15);
  useCanvas(ref, 240, (g, w, h, t) => {
    const { edge: e, loops: n } = S.current;
    g.fillStyle = '#05090F'; g.fillRect(0, 0, w, h);
    const ay = h * 0.42, s = 5.2, cx = w * 0.5;
    g.setLineDash([5, 5]); g.strokeStyle = 'rgba(167,139,250,0.8)'; g.beginPath(); g.moveTo(30, ay); g.lineTo(w - 30, ay); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#A78BFA'; g.font = `600 10px ${MONO}`; g.fillText('annular plane', 34, ay - 6);
    // papillary muscles
    g.fillStyle = '#5A2A36';
    g.beginPath(); g.ellipse(cx - 70, h - 34, 18, 30, 0.2, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx + 70, h - 34, 18, 30, -0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#C9D6E6'; g.fillText('AL head', cx - 100, h - 4); g.fillText('PM head', cx + 48, h - 4);
    // anterior leaflet coapting from the left
    g.strokeStyle = '#E9F2FC'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx - 150, ay); g.quadraticCurveTo(cx - 60, ay + 14, cx - 6, ay + 34); g.stroke();
    // posterior leaflet edge: where the chords put it
    const wob = Math.sin(t * 7) * (e > -2 ? 3 : 0.6);
    const ey = ay - e * s + wob;
    g.beginPath(); g.moveTo(cx + 150, ay); g.quadraticCurveTo(cx + 60, ay + (e > 0 ? -e * s * 0.6 : 18), cx + 4, ey); g.stroke();
    g.lineCap = 'butt';
    // neochord loops
    g.strokeStyle = '#7CE8FF'; g.lineWidth = 1.4;
    for (let k = 0; k < n; k++) {
      const head = split === 'both' ? (k % 2 ? 70 : -70) : -70;
      g.beginPath(); g.moveTo(cx + head + (k - n / 2) * 4, h - 60); g.lineTo(cx + 4 + (k - n / 2) * 5, ey); g.stroke();
    }
    // the free-edge marker
    g.fillStyle = e > -2 ? '#FF4D6D' : e < -9 ? '#F5C451' : '#34E39A';
    g.beginPath(); g.arc(cx + 4, ey, 5, 0, Math.PI * 2); g.fill();
    g.font = `700 12px ${MONO}`; g.textAlign = 'center';
    g.fillText(`P2 free edge ${e >= 0 ? '+' : ''}${e.toFixed(1)} mm`, cx, ey + (e > 0 ? -14 : 24)); g.textAlign = 'left';
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText('Through P2 · neochords in cyan', 10, 16);
    g.fillText('LA', w - 46, ay - 30); g.fillText('LV', w - 46, ay + 40);
  }, [split]);
  const saline = () => {
    setClampMin(m => m + 4);
    const msg = loops === 1 ? 'The ink line bows: the medial and lateral thirds of P2 still billow above the others.'
      : edge > -2 ? 'P2 rises above the line of the other scallops — residual prolapse. Shorten the loops.'
      : edge < -9 ? 'P2 is pulled down out of sight, the leaflet tented: restricted. Lengthen the loops.'
      : split === 'one' ? 'Competent — but the coaptation line skews toward the commissure on one side.'
      : 'Symmetrical ink line parallel to the posterior annulus; the posterior leaflet shows a 5–8 mm band of coaptation. Competent.';
    setTests(ts => [...ts, { len, loops, split, msg, ok: loops >= 2 && edge <= -2 && edge >= -9 }]);
  };
  const finish = () => {
    const residual = loops === 1 || edge > -2 || edge < -9 || pm.coapt < 8 ? 'moderate'
      : loops === 2 || split === 'one' ? 'mild' : 'none / trace';
    onResult?.({ loops, split, len, edge, residual, csept: pm.csept, grad: pm.grad, sam: pm.sam, clamp: clampMin + 26 });
  };
  const locked = !!done;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 240 }} aria-label="Neochord repair of the posterior leaflet" /></div>
      <div className="cs-ctrls">
        <span className="cs-pts">Neochord loops:</span>
        {[1, 2, 3, 4].map(n => <button key={n} className={'cs-chip' + (loops === n ? ' on' : '')} disabled={locked} onClick={() => setLoops(n)}>{n}</button>)}
        <span className="cs-pts" style={{ marginLeft: 8 }}>Anchors:</span>
        <button className={'cs-chip' + (split === 'one' ? ' on' : '')} disabled={locked} onClick={() => setSplit('one')}>All to one papillary head</button>
        <button className={'cs-chip' + (split === 'both' ? ' on' : '')} disabled={locked} onClick={() => setSplit('both')}>Lateral half → AL, medial half → PM</button>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1, minWidth: 220 }}>Loop length {len} mm
          <input type="range" min="16" max="30" step="1" value={len} disabled={locked} onChange={e => setLen(+e.target.value)} style={{ width: '100%' }} aria-label="Neochord loop length" />
        </label>
        <button className="cs-btn" disabled={locked} onClick={saline}>💧 Saline test</button>
        <button className="cs-btn primary" disabled={locked || !tests.length} onClick={finish}>💍 Ring in, off bypass</button>
      </div>
      <div className="cs-readout">
        <div><span>Cross-clamp</span><b style={{ color: clampMin > 70 ? 'var(--amber)' : undefined }}>{clampMin} min</b></div>
        <div><span>Planned ring</span><b>{pm.ring} mm</b></div>
        <div><span>Saline tests</span><b>{tests.length}</b></div>
      </div>
      {tests.length > 0 && (
        <ul className="cs-ul" style={{ fontSize: 14, marginTop: 8 }}>
          {tests.slice(-3).map((x, i) => <li key={i} className="cs-li"><b style={{ color: x.ok ? 'var(--green)' : 'var(--amber)' }}>{x.loops} loop{x.loops > 1 ? 's' : ''}, {x.len} mm: </b>{x.msg}</li>)}
        </ul>
      )}
      <p className="cs-pts" style={{ marginTop: 8 }}>Aim for the P2 free edge 4–8 mm below the annular plane, so the leaflets meet deep in the ventricle. The flail segment is 15 mm wide.</p>
    </div>
  );
}

/* ---------- 7 · SAM: the paradox ---------- */

const SAM_ACTIONS = [
  { id: 'stopadr', label: 'Stop the adrenaline', good: true, apply: s => ({ ...s, adr: 0 }), once: true },
  { id: 'fluid', label: 'Fluid bolus 250 mL', good: true, apply: s => ({ ...s, vol: s.vol + 1 }) },
  { id: 'legs', label: 'Legs up / head down', good: true, apply: s => ({ ...s, legs: 1 }), once: true },
  { id: 'phe', label: 'Phenylephrine 100 µg', good: true, apply: s => ({ ...s, phe: s.phe + 1 }) },
  { id: 'bb', label: 'Esmolol 0.5 mg/kg, then infusion', good: true, apply: s => ({ ...s, bb: s.bb + 1 }) },
  { id: 'moreadr', label: 'Double the adrenaline', good: false, apply: s => ({ ...s, ino: s.ino + 1 }) },
  { id: 'dobut', label: 'Add dobutamine', good: false, apply: s => ({ ...s, ino: s.ino + 1 }) },
  { id: 'gtn', label: 'GTN for the high PA pressure', good: false, apply: s => ({ ...s, vd: s.vd + 1 }) },
  { id: 'furo', label: 'Furosemide 40 mg for the “wet” lungs', good: false, apply: s => ({ ...s, vol: s.vol - 1 }) },
  { id: 'iabp', label: 'Intra-aortic balloon pump', good: false, apply: s => ({ ...s, vd: s.vd + 1 }) },
];
export function samModel(s) {
  const vol = clamp(s.vol + (s.legs ? 1 : 0), -2, 5);
  const grad = clamp(55 + 30 * s.adr + 18 * s.ino + 15 * s.vd - 9 * Math.min(vol, 4) - 11 * Math.min(s.phe, 2) - 12 * Math.min(s.bb, 2), 6, 120);
  const hr = Math.round(clamp(126 + 8 * s.ino + 6 * s.vd - 3 * Math.min(vol, 4) - 17 * Math.min(s.bb, 2) - 6 * s.phe + (s.adr ? 0 : -6), 62, 150));
  const sys = Math.round(clamp(122 - 0.72 * grad + 6 * Math.min(s.phe, 2) - 6 * s.vd, 42, 132));
  const dia = Math.round(clamp(sys * 0.58 + (s.phe ? 4 : 0), 26, 78));
  const mr = grad > 50 ? 'severe' : grad > 30 ? 'moderate' : 'trace';
  const spo2 = grad > 50 ? 90 : grad > 30 ? 94 : 98;
  return { grad: Math.round(grad), hr, sys, dia, mr, spo2, fixed: grad < 30 && sys >= 90 };
}

/**
 * Parasternal long-axis at the bedside, a CW Doppler through the LVOT and
 * the live numbers. The anterior leaflet is sucked into the outflow tract in
 * systole; the gradient answers every drug. onResult({ wrong, steps, fixed })
 */
export function SamCrisis({ onResult, done }) {
  const { setVitals } = useCase();
  const ref = useRef(null);
  const [st, setSt] = useState({ adr: 1, ino: 0, vd: 0, vol: 0, phe: 0, bb: 0, legs: 0 });
  const [log, setLog] = useState([]);
  const [wrong, setWrong] = useState(0);
  const [used, setUsed] = useState({});
  const m = samModel(st);
  const S = useRef({}); S.current = m;
  useCanvas(ref, 250, (g, w, h, t) => {
    const mm = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const hw = w < 520 ? w : w * 0.55;
    // --- parasternal long-axis schematic: septum above, posterior wall below, aorta and LA to the right ---
    const ph = (t * (mm.hr / 60)) % 1, sys = ph < 0.38;
    const sev = clamp((mm.grad - 10) / 90, 0, 1);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(190,190,190,${Math.random() * 0.07})`; g.fillRect(Math.random() * hw, 24 + Math.random() * (h - 24), 2, 2); }
    const tissue = '#4A2A36';
    // septum with its basal bulge, continuing as the anterior aortic wall
    g.fillStyle = tissue; g.beginPath(); g.moveTo(0, 42); g.lineTo(hw * 0.62, 42); g.lineTo(hw * 0.62, 64);
    g.quadraticCurveTo(hw * 0.5, 98, hw * 0.38, 74); g.lineTo(0, 70); g.closePath(); g.fill();
    g.fillRect(hw * 0.62, 42, hw * 0.38, 14);
    // posterior aortic wall → aorto-mitral curtain
    g.fillRect(hw * 0.66, 116, hw * 0.34, 10);
    // posterior LV wall, rising to the posterior mitral annulus
    g.beginPath(); g.moveTo(0, 212); g.lineTo(hw * 0.6, 212); g.quadraticCurveTo(hw * 0.7, 210, hw * 0.72, 186); g.lineTo(hw * 0.75, 190); g.quadraticCurveTo(hw * 0.72, 236, hw * 0.6, 236); g.lineTo(0, 236); g.closePath(); g.fill();
    // left atrium
    g.strokeStyle = tissue; g.lineWidth = 8; g.beginPath(); g.ellipse(hw * 0.87, 182, hw * 0.12, 44, 0, Math.PI * 0.55, Math.PI * 2.45); g.stroke();
    // MR jet into the LA, and turbulence in the LVOT, in systole
    if (sys && sev > 0.2) {
      g.fillStyle = `rgba(255,214,60,${0.3 + sev * 0.5})`; g.beginPath(); g.ellipse(hw * 0.56, 100, 24 + sev * 34, 9 + sev * 8, -0.15, 0, Math.PI * 2); g.fill();
      g.fillStyle = `rgba(60,170,255,${0.25 + sev * 0.45})`; g.beginPath(); g.ellipse(hw * 0.84, 196, 14 + sev * 26, 9 + sev * 6, 0.5, 0, Math.PI * 2); g.fill();
    }
    // leaflets: anterior hinged at the aorto-mitral curtain, posterior at the posterior annulus
    const cpx = hw * 0.62, cpy = 162;
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(hw * 0.67, 124);
    if (sys) {
      g.quadraticCurveTo(hw * 0.6, 140, cpx, cpy);
      // the slack tip beyond the coaptation point: dragged toward the septal bulge by the outflow jet
      g.moveTo(cpx, cpy); g.quadraticCurveTo(hw * (0.58 - sev * 0.04), cpy - 6 - sev * 30, hw * (0.54 - sev * 0.04), cpy - 4 - sev * 62);
    } else g.quadraticCurveTo(hw * 0.55, 150, hw * 0.44, 186);
    g.stroke();
    g.beginPath(); g.moveTo(hw * 0.72, 188); g.quadraticCurveTo(hw * 0.68, 176, sys ? cpx + 2 : hw * 0.6, sys ? cpy + 2 : 204); g.stroke();
    g.lineCap = 'butt';
    g.fillStyle = '#9FB4C6'; g.font = `600 10px ${MONO}`;
    g.fillText('Bedside TTE · parasternal long axis', 8, 16);
    g.fillText('SEPTUM', 10, 60); g.fillText('LV', hw * 0.22, 150); g.fillText('AORTA', hw * 0.8, 92); g.fillText('LA', hw * 0.86, 186);
    if (sys && sev > 0.2) { g.fillStyle = '#F5C451'; g.fillText('SAM', hw * 0.44, 124); }
    // --- CW Doppler through the LVOT: the late-peaking dagger ---
    const x0 = w < 520 ? 0 : hw + 10, dw = w - x0 - 8, top = w < 520 ? 0 : 24;
    if (w >= 520) {
      g.fillStyle = '#03070B'; g.fillRect(x0, 0, dw + 8, h);
      const base = top + 6, scale = (h - base - 14) / 5.5;
      g.strokeStyle = '#1B2A40'; g.fillStyle = '#6A7F9B'; g.font = `10px ${MONO}`;
      for (let v = 0; v <= 5; v++) { g.beginPath(); g.moveTo(x0 + 26, base + v * scale); g.lineTo(x0 + dw, base + v * scale); g.stroke(); g.fillText(`-${v}`, x0 + 4, base + v * scale + 3); }
      const vpk = Math.sqrt(mm.grad / 4);
      const bw = (dw - 30) / 2.4;
      for (let b = 0; b < 2; b++) {
        const bx = x0 + 34 + b * bw * 1.2;
        for (let px = 0; px < bw * 0.6; px += 1.5) {
          const k = px / (bw * 0.6);
          const env = mm.grad > 30 ? Math.pow(k, 2.2) * (k < 0.82 ? 1 : (1 - k) / 0.18) : Math.sin(k * Math.PI);   // late-peaking dagger vs symmetric
          const v = env * vpk;
          for (let q = 0; q < 5; q++) { g.fillStyle = `rgba(230,230,230,${0.25 + Math.random() * 0.5})`; g.fillRect(bx + px, base + v * Math.random() * scale, 1.5, 2); }
          g.fillStyle = 'rgba(245,245,245,0.95)'; g.fillRect(bx + px, base + v * scale - 1, 1.5, 2);
        }
      }
      g.fillStyle = '#9FB4C6'; g.font = `600 10px ${MONO}`; g.fillText('CW · LVOT · apical 5C', x0 + 30, base + 5.4 * scale);
      g.fillStyle = mm.grad > 50 ? '#FF4D6D' : mm.grad > 30 ? '#F5C451' : '#34E39A'; g.font = `700 12px ${MONO}`;
      g.fillText(`${vpk.toFixed(1)} m/s · ${mm.grad} mmHg`, x0 + dw - 150, base + 14);
    }
  }, []);
  const act = a => {
    if (done || (a.once && used[a.id])) return;
    const ns = a.apply(st);
    const nm = samModel(ns);
    setSt(ns);
    setUsed(u => ({ ...u, [a.id]: (u[a.id] || 0) + 1 }));
    if (!a.good) setWrong(n => n + 1);
    setVitals({ hr: nm.hr, sys: nm.sys, dia: nm.dia, spo2: nm.spo2 });
    setLog(l => [...l, { label: a.label, good: a.good, grad: nm.grad, sys: nm.sys }]);
  };
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 250 }} aria-label="Systolic anterior motion of the mitral valve with LVOT obstruction" /></div>
      <div className="cs-readout">
        <div><span>LVOT peak gradient</span><b style={{ color: m.grad > 50 ? 'var(--red)' : m.grad > 30 ? 'var(--amber)' : 'var(--green)' }}>{m.grad} mmHg</b></div>
        <div><span>Arterial pressure</span><b style={{ color: m.sys < 90 ? 'var(--red)' : undefined }}>{m.sys}/{m.dia}</b></div>
        <div><span>Heart rate</span><b>{m.hr}</b></div>
        <div><span>MR (SAM-related)</span><b style={{ color: m.mr === 'severe' ? 'var(--red)' : undefined }}>{m.mr}</b></div>
      </div>
      <div className="cs-row" style={{ marginTop: 10 }}>
        {SAM_ACTIONS.map(a => (
          <button key={a.id} className="cs-btn" disabled={!!done || (a.once && !!used[a.id])} onClick={() => act(a)}>{a.label}</button>
        ))}
      </div>
      {log.length > 0 && (
        <ol className="cs-ul" style={{ fontSize: 14, marginTop: 8 }}>
          {log.map((x, i) => <li key={i} className="cs-li"><b style={{ color: x.good ? 'var(--green)' : 'var(--red)' }}>{x.label}</b> → gradient {x.grad} mmHg, pressure {x.sys} systolic</li>)}
        </ol>
      )}
      {!done && (
        <div className="cs-row" style={{ marginTop: 10 }}>
          <button className="cs-btn primary" disabled={!log.length} onClick={() => onResult?.({ wrong, steps: log.length, fixed: m.fixed, grad: m.grad, sys: m.sys })}>✅ Re-image and hand over</button>
          <span className="cs-pts">{m.fixed ? 'Gradient under 30, pressure over 90.' : 'Still obstructed.'}</span>
        </div>
      )}
      <p className="cs-pts" style={{ marginTop: 8 }}>Schematic, not diagnostic. The LVOT envelope in SAM is late-peaking — a dagger — because the obstruction builds as the ventricle empties.</p>
    </div>
  );
}
