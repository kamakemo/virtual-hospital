import React, { useRef, useState } from 'react';
import { useCanvas } from '../kit/Monitor.jsx';

/* ============================================================
   VALVE 08 · LOCAL SIMULATORS (kit style, so they can be
   promoted to the kit later)

   JVPViewer        — the neck and the liver: normal, AF, and the
                      giant systolic cv wave of severe TR
   TRDopplerLab     — CW Doppler of TR: why the velocity FALLS as
                      the leak grows, and the PASP trap
   TRQuantify       — vena contracta and PISA on a torrential jet,
                      graded on the five-grade scale
   RVPACoupling     — TAPSE against PASP: is the RV keeping up?
   RHCLab           — right heart catheter pull-back, Fick vs
                      thermodilution, PVR and the PH class
   TriScore         — TRI-SCORE for isolated tricuspid surgery
   TricuspidClip    — T-TEER en-face: where to clip, the lead,
                      the residual TR and the gradient
   RVResusBoard     — the failing RV after the leak is closed:
                      every drug moves the numbers
   ============================================================ */

const MONO = '"JetBrains Mono", "IBM Plex Mono", monospace';
const G = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- 1 · the neck and the liver ---------- */

const RR_AF = [0.74, 0.62, 0.9, 0.7, 0.58, 0.82, 0.66, 0.95, 0.6, 0.78];
const RR_SR = [0.8];

const JVP_MODES = {
  normal: {
    label: 'Normal, sinus rhythm', af: false, base: 4,
    // a (atrial kick) · c · x descent · v · y descent
    p: x => 4 + 3.4 * G(x, 0.07, 0.03) + 1.2 * G(x, 0.16, 0.015) - 2.6 * G(x, 0.3, 0.07) + 3 * G(x, 0.47, 0.05) - 2.4 * G(x, 0.6, 0.05),
    tags: [['a', 0.07], ['c', 0.16], ['x', 0.3], ['v', 0.47], ['y', 0.6]],
    liver: 0, note: 'Two flickers per beat, both mostly INWARD movements (x and y descents). The a wave comes just BEFORE the carotid.',
  },
  af: {
    label: 'AF, no significant TR', af: true, base: 7,
    p: x => 7 + 0.8 * G(x, 0.16, 0.015) - 2 * G(x, 0.3, 0.07) + 3.2 * G(x, 0.47, 0.05) - 2.6 * G(x, 0.6, 0.05),
    tags: [['x', 0.3], ['v', 0.47], ['y', 0.6]],
    liver: 0, note: 'No atria contracting, so no a wave and a shallower x descent. The v wave stays modest — the valve still closes.',
  },
  tr: {
    label: 'Her neck: AF + severe TR', af: true, base: 16,
    // the x descent is filled in by the regurgitant jet: one tall systolic cv wave, then a sharp y collapse
    p: x => {
      const rise = clamp((x - 0.11) / 0.09, 0, 1), fall = clamp((x - 0.47) / 0.1, 0, 1);
      return 15 + 16 * rise * (1 - fall) * (0.92 + 0.08 * Math.sin((x - 0.11) * 9)) - 4.5 * G(x, 0.6, 0.04) * fall;
    },
    tags: [['cv', 0.3], ['y', 0.6]],
    liver: 1, note: 'ONE big OUTWARD wave that rises WITH the carotid and fills the whole of systole (the "ventricularised" cv wave), then a steep y descent. The earlobes bob; the liver swells under your hand with every beat.',
  },
};

/**
 * Lateral neck and the right upper quadrant. The learner times the
 * dominant venous wave against the carotid. onIdentify(choiceId)
 */
export function JVPViewer({ onIdentify, done, initial = 'tr' }) {
  const ref = useRef(null);
  const [mode, setMode] = useState(initial);
  const S = useRef(mode); S.current = mode;
  useCanvas(ref, 280, (g, w, h, t) => {
    const M = JVP_MODES[S.current];
    const rrs = M.af ? RR_AF : RR_SR;
    const total = rrs.reduce((a, b) => a + b, 0);
    const beatAt = tt => {
      let r = ((tt % total) + total) % total;
      for (const rr of rrs) { if (r < rr) return [r / rr, rr]; r -= rr; }
      return [0, rrs[0]];
    };
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const narrow = w < 560;
    const plotW = narrow ? w : w * 0.72, speed = narrow ? 95 : 130;
    // grid
    g.strokeStyle = '#0F1C2A'; g.lineWidth = 1;
    for (let x = 0; x < plotW; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    const ecgY = 42, jY = v => 230 - v * 5.2, carY = 262;
    // traces
    const trace = (fn, col, lw) => {
      g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
      for (let x = 0; x <= plotW; x += 1.5) {
        const tt = t - (plotW - x) / speed;
        const [ph] = beatAt(tt);
        const y = fn(ph, tt);
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    };
    trace((ph, tt) => {
      const qrs = ph > 0.09 && ph < 0.13 ? (ph < 0.105 ? -26 : ph < 0.115 ? 8 : 0) : 0;
      const pw = !M.af && ph < 0.06 ? -4 * Math.sin(ph / 0.06 * Math.PI) : 0;
      const fib = M.af ? Math.sin(tt * 47) * 1.6 + Math.sin(tt * 31) * 1.1 : 0;
      const tw = ph > 0.3 && ph < 0.45 ? -6 * Math.sin((ph - 0.3) / 0.15 * Math.PI) : 0;
      return ecgY + qrs + pw + fib + tw;
    }, '#34E39A', 1.6);
    trace(ph => jY(M.p(ph)), '#22D3EE', 2.4);
    trace(ph => carY - (ph > 0.14 && ph < 0.5 ? 12 * Math.sin((ph - 0.14) / 0.36 * Math.PI) ** 0.7 : 0), '#FF5A52', 1.6);
    // labels on the last complete beat
    g.font = `700 12px ${MONO}`;
    const [phNow, rrNow] = beatAt(t);
    M.tags.forEach(([k, at]) => {
      const back = (phNow - at) * rrNow;
      const x = plotW - (back < 0.02 ? back + rrNow : back) * speed;
      if (x < 10 || x > plotW - 10) return;
      g.fillStyle = k === 'cv' ? '#FF6B9A' : '#F5C451';
      g.fillText(k, x - 6, jY(M.p(at)) - 10);
    });
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText('ECG', 6, 18); g.fillText('JVP (mmHg)', 6, 92); g.fillText('carotid', 6, carY - 18);
    // the neck / liver panel
    if (!narrow) {
      const px = plotW + 14, pw = w - plotW - 22;
      const [ph] = beatAt(t);
      const swell = M.liver * (ph > 0.14 && ph < 0.52 ? Math.sin((ph - 0.14) / 0.38 * Math.PI) : 0);
      g.fillStyle = '#0B1525'; g.fillRect(px, 10, pw, h - 20);
      g.fillStyle = '#9FB4C6'; g.fillText('RIGHT UPPER QUADRANT', px + 8, 28);
      // ribs
      g.strokeStyle = '#2B4366'; g.lineWidth = 3;
      for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(px + pw * 0.5, 30 + k * 22, pw * 0.55, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
      // liver
      const ly = 120, lr = pw * 0.36 + swell * 9;
      g.fillStyle = `rgba(150,60,60,${0.55 + swell * 0.3})`;
      g.beginPath(); g.ellipse(px + pw * 0.5, ly, lr, 34 + swell * 6, -0.15, 0, Math.PI * 2); g.fill();
      // examining hand
      g.fillStyle = 'rgba(245,196,81,0.85)';
      g.fillRect(px + pw * 0.2, ly + 40 + swell * 7, pw * 0.6, 10);
      g.fillStyle = swell > 0.2 ? '#FF6B9A' : '#6A7F9B';
      g.fillText(M.liver ? 'Systolic hepatic pulsation' : 'Liver edge still', px + 8, h - 52);
      g.fillStyle = '#6A7F9B';
      g.fillText(M.liver ? 'expands WITH the carotid' : 'no expansile pulse', px + 8, h - 34);
    }
  }, []);
  const choose = id => { if (!done) onIdentify?.(id); };
  return (
    <div className="cs-card tight">
      <div className="cs-ctrls" style={{ marginTop: 0 }}>
        {Object.entries(JVP_MODES).map(([k, m]) => <button key={k} className={'cs-chip' + (mode === k ? ' on' : '')} onClick={() => setMode(k)}>{m.label}</button>)}
      </div>
      <div className="cs-viewer" style={{ marginTop: 10 }}><canvas ref={ref} className="cs-canvas" style={{ height: 280 }} aria-label="Jugular venous waveform with ECG and carotid pulse" /></div>
      <p className="cs-pts" style={{ marginTop: 8 }}>{JVP_MODES[mode].note}</p>
      <div className="cs-card" style={{ margin: '10px 0 0', background: 'var(--panel2)' }}>
        <p className="cs-q" style={{ marginTop: 0 }}>👆 On HER neck (third chip), the dominant venous wave rises…</p>
        <div className="cs-row">
          {[['sys', 'With the carotid — systolic'], ['pre', 'Just before the carotid — presystolic'], ['dia', 'After the carotid — diastolic']].map(([id, l]) => (
            <button key={id} className={'cs-btn' + (done === id ? ' primary' : '')} disabled={!!done} onClick={() => choose(id)}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 2 · TR Doppler: the velocity paradox ---------- */

const RV_SYS = 52;                                   // her true RV systolic pressure (catheter)
export const raV = eroa => 12 + 23 * eroa;           // RA v-wave rises as the leak grows
export const trVmax = eroa => Math.sqrt(Math.max(4, RV_SYS - raV(eroa)) / 4);

/**
 * CW Doppler through the tricuspid valve. Slide the leak from trivial to
 * torrential and watch the jet get DENSER, EARLIER-PEAKING and SLOWER.
 * Then measure hers. onMeasure({ v, pasp, close })
 */
export function TRDopplerLab({ herEroa = 0.9, rapEstimate = 15, onMeasure, done }) {
  const ref = useRef(null);
  const [eroa, setEroa] = useState(herEroa);
  const [cal, setCal] = useState(3.2);
  const S = useRef({}); S.current = { eroa, cal };
  useCanvas(ref, 240, (g, w, h, t) => {
    const { eroa: e, cal: c } = S.current;
    const vmax = trVmax(e), k = clamp(e / 1.1, 0, 1);
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const top = 22, scale = 4.5, Y = v => top + v / scale * (h - top - 16);
    g.strokeStyle = '#1E2B3A'; g.fillStyle = '#6A7F9B'; g.font = `10px ${MONO}`;
    for (let v = 0; v <= 4; v++) { g.beginPath(); g.moveTo(36, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.fillText(`-${v}`, 6, Y(v) + 3); }
    g.fillText('m/s', 6, 12);
    // shape: rounded and late-ish when mild; a triangular early-peaking "dagger" when torrential
    const env = x => {
      if (x <= 0 || x >= 1) return 0;
      const mild = Math.sin(x * Math.PI) ** 0.45;
      const tor = x < 0.22 ? x / 0.22 : 1 - (x - 0.22) / 0.78 * 0.85;
      return (mild * (1 - k) + tor * k) * (x > 0.94 ? (1 - x) / 0.06 : 1);
    };
    const beatW = (w - 50) / 3, ej = beatW * 0.55;
    for (let b = 0; b < 3; b++) {
      const x0 = 46 + b * beatW + beatW * 0.12;
      for (let px = 0; px < ej; px += 1.5) {
        const v = env(px / ej) * vmax;
        const dens = 0.18 + 0.7 * k;
        for (let q = 0; q < 9; q++) { const vv = v * (1 - Math.random() * (0.25 + 0.6 * (1 - k))); g.fillStyle = `rgba(235,235,235,${dens * Math.random()})`; g.fillRect(x0 + px, Y(vv), 1.5, 2); }
        g.fillStyle = `rgba(245,245,245,${0.35 + 0.6 * k})`; g.fillRect(x0 + px, Y(v) - 1, 1.5, 2);
      }
    }
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(36 + (t * 80) % (w - 36), 0, 8, h);
    const y = Y(c);
    g.strokeStyle = '#F5C451'; g.setLineDash([6, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(36, y); g.lineTo(w, y); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`; g.fillText(`${c.toFixed(2)} m/s`, w - 92, y - 6);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText('CW · TRICUSPID · RV-FOCUSED APICAL', 46, 14);
  }, []);
  const v = cal, grad = 4 * v * v, pasp = grad + rapEstimate;
  const isHer = Math.abs(eroa - herEroa) < 0.005;
  const close = isHer && Math.abs(v - trVmax(herEroa)) < 0.12;
  const sev = eroa < 0.2 ? 'mild' : eroa < 0.4 ? 'moderate' : eroa < 0.6 ? 'severe' : eroa < 0.8 ? 'massive' : 'torrential';
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 240 }} aria-label="Continuous-wave Doppler of tricuspid regurgitation" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: '1 1 240px' }}>Size of the leak (EROA)
          <input type="range" min="0.1" max="1.3" step="0.01" value={eroa} onChange={e => setEroa(+e.target.value)} style={{ width: '100%' }} aria-label="Effective regurgitant orifice area" />
          {(eroa * 100).toFixed(0)} mm² · {sev}
        </label>
        <button className={'cs-chip' + (isHer ? ' on' : '')} onClick={() => setEroa(herEroa)}>Her valve</button>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Caliper
          <input type="range" min="0.5" max="4.4" step="0.02" value={cal} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="Velocity caliper" />
        </label>
        <button className="cs-btn primary" disabled={!isHer || !!done} onClick={() => onMeasure?.({ v, pasp, close })}>{isHer ? 'Measure her TR jet' : 'Return to her valve to measure'}</button>
      </div>
      <div className="cs-readout">
        <div><span>TR Vmax</span><b>{v.toFixed(2)} m/s</b></div>
        <div><span>RV–RA gradient 4v²</span><b>{Math.round(grad)} mmHg</b></div>
        <div><span>Echo PASP (+ RAP {rapEstimate})</span><b>{Math.round(pasp)} mmHg</b></div>
        <div><span>RA v-wave at this EROA</span><b style={{ color: raV(eroa) > 28 ? 'var(--red)' : undefined }}>{Math.round(raV(eroa))} mmHg</b></div>
        <div><span>TRUE RV systolic (catheter)</span><b style={{ color: 'var(--violet)' }}>{RV_SYS} mmHg</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>The RV pushes the same {RV_SYS} mmHg at every setting. Only the PRESSURE IN THE RA changes — and the Doppler measures the DIFFERENCE. Put the caliper on the dense edge of the envelope.</p>
    </div>
  );
}

/* ---------- 3 · vena contracta and PISA ---------- */

const GRADE5 = [
  { k: 'mild', vc: [0, 3], eroa: [0, 20] }, { k: 'moderate', vc: [3, 7], eroa: [20, 40] },
  { k: 'severe', vc: [7, 14], eroa: [40, 60] }, { k: 'massive', vc: [14, 21], eroa: [60, 80] },
  { k: 'torrential', vc: [21, 99], eroa: [80, 9999] },
];
export const grade5 = (val, key) => GRADE5.find(gq => val >= gq[key][0] && val < gq[key][1])?.k || 'torrential';

/**
 * RV-focused apical view, colour zoomed on the tricuspid valve. Two
 * calipers: vena contracta width (mm) and PISA radius (cm), aliasing
 * velocity shifted down to 28 cm/s. onMeasure({ vc, r, eroa, close })
 */
export function TRQuantify({ vcTrue = 15, rTrue = 1.06, va = 28, vmax = 220, onMeasure, done }) {
  const ref = useRef(null);
  const [vc, setVc] = useState(8);
  const [r, setR] = useState(0.6);
  const S = useRef({}); S.current = { vc, r };
  useCanvas(ref, 330, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = 4, R = h * 1.06;
    g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, Math.PI * 0.5 - 0.72, Math.PI * 0.5 + 0.72); g.closePath(); g.clip();
    for (let i = 0; i < 2000; i++) { const a = Math.PI / 2 + (Math.random() - 0.5) * 1.44, rr = Math.random() * R; g.fillStyle = `rgba(190,190,190,${Math.random() * 0.08})`; g.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2, 2); }
    const mm = h / 100;                              // pixels per mm
    const vy = h * 0.5;                              // tricuspid annular plane
    const sys = ((t * 1.0) % 1) < 0.66;
    g.strokeStyle = 'rgba(200,200,200,0.5)'; g.lineWidth = 6;
    g.beginPath(); g.ellipse(cx, vy, 34 * mm, 44 * mm, 0, Math.PI, 0); g.stroke();                          // dilated RV, apex at the top
    g.beginPath(); g.ellipse(cx, vy, 36 * mm, 40 * mm, 0, 0, Math.PI); g.stroke();                          // huge RA below
    // pacing lead from the RA through the valve into the RV apex
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(cx + 24 * mm, vy + 40 * mm); g.quadraticCurveTo(cx + 22 * mm, vy + 8 * mm, cx + 15 * mm, vy - 2 * mm); g.quadraticCurveTo(cx + 8 * mm, vy - 26 * mm, cx + 2 * mm, vy - 42 * mm); g.stroke();
    // leaflets: a wide coaptation gap, they never meet
    const gap = vcTrue * mm * 0.9;
    g.strokeStyle = 'rgba(235,235,235,0.92)'; g.lineWidth = 4;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 30 * mm, vy); g.quadraticCurveTo(cx + s * 16 * mm, vy - (sys ? 3 : 12) * mm, cx + s * gap / 2, sys ? vy - 2 * mm : vy - 16 * mm); g.stroke(); }
    if (sys) {
      // PISA shells on the RV side (towards the apex)
      const rp = rTrue * 10 * mm;
      for (let k = 4; k >= 1; k--) {
        const rk = rp * (k === 1 ? 1 : 1 + (k - 1) * 0.45);
        g.fillStyle = k === 1 ? 'rgba(220,40,40,0.75)' : k % 2 ? 'rgba(60,140,255,0.45)' : 'rgba(255,190,40,0.45)';
        g.beginPath(); g.arc(cx, vy - 2 * mm, rk, Math.PI, 0); g.fill();
      }
      // the jet: wide-necked, laminar, filling the RA
      const grd = g.createLinearGradient(cx, vy, cx, vy + 36 * mm);
      grd.addColorStop(0, 'rgba(60,140,255,0.85)'); grd.addColorStop(0.6, 'rgba(80,120,255,0.6)'); grd.addColorStop(1, 'rgba(60,90,220,0.25)');
      g.fillStyle = grd;
      g.beginPath(); g.moveTo(cx - gap / 2, vy - 1 * mm); g.quadraticCurveTo(cx - 32 * mm, vy + 16 * mm, cx - 22 * mm, vy + 36 * mm);
      g.lineTo(cx + 20 * mm, vy + 36 * mm); g.quadraticCurveTo(cx + 30 * mm, vy + 16 * mm, cx + gap / 2, vy - 1 * mm); g.fill();
    }
    g.restore();
    // VC caliper: horizontal, just on the RA side of the orifice
    const vcy = vy + 3 * mm, half = st.vc * mm * 0.9 / 2;
    g.strokeStyle = '#A3E635'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx - half, vcy); g.lineTo(cx + half, vcy); g.stroke();
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * half, vcy - 6); g.lineTo(cx + s * half, vcy + 6); g.stroke(); }
    g.fillStyle = '#A3E635'; g.font = `700 12px ${MONO}`; g.fillText(`VC ${st.vc.toFixed(1)} mm`, cx + half + 8, vcy + 16);
    // PISA caliper: from the orifice towards the RV apex
    g.strokeStyle = '#F5C451'; g.beginPath(); g.moveTo(cx, vy - 2 * mm); g.lineTo(cx, vy - 2 * mm - st.r * 10 * mm); g.stroke();
    g.beginPath(); g.moveTo(cx - 6, vy - 2 * mm - st.r * 10 * mm); g.lineTo(cx + 6, vy - 2 * mm - st.r * 10 * mm); g.stroke();
    g.fillStyle = '#F5C451'; g.fillText(`r ${st.r.toFixed(2)} cm`, cx - 92, vy - 2 * mm - st.r * 10 * mm + 4);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText('RV-focused apical · colour zoom', 10, 16);
    g.fillText('RV', cx - 20 * mm, vy - 30 * mm); g.fillText('RA', cx - 30 * mm, vy + 30 * mm); g.fillText('lead', cx + 17 * mm, vy - 18 * mm);
    g.fillStyle = '#C0392B'; g.fillRect(w - 26, 40, 12, 50); g.fillStyle = '#2E6BE6'; g.fillRect(w - 26, 90, 12, 50);
    g.fillStyle = '#E9F2FC'; g.font = `600 10px ${MONO}`; g.fillText(`±${va}`, w - 52, 36); g.fillText('cm/s', w - 50, 152);
  }, []);
  const eroa = 2 * Math.PI * r * r * va / vmax;        // cm²
  const close = Math.abs(vc - vcTrue) <= 1.5 && Math.abs(r - rTrue) <= 0.1;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 330 }} aria-label="Colour Doppler of torrential tricuspid regurgitation with calipers" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: '1 1 220px' }}>Vena contracta (narrowest neck, RA side)
          <input type="range" min="2" max="26" step="0.5" value={vc} onChange={e => setVc(+e.target.value)} style={{ width: '100%' }} aria-label="Vena contracta caliper" />
        </label>
        <label className="cs-slider" style={{ flex: '1 1 220px' }}>PISA radius (to first red→blue)
          <input type="range" min="0.2" max="1.6" step="0.01" value={r} onChange={e => setR(+e.target.value)} style={{ width: '100%' }} aria-label="PISA radius caliper" />
        </label>
        <button className="cs-btn primary" disabled={!!done} onClick={() => onMeasure?.({ vc, r, eroa, close })}>Measure</button>
      </div>
      <div className="cs-readout">
        <div><span>VC → grade</span><b>{vc.toFixed(1)} mm · {grade5(vc, 'vc')}</b></div>
        <div><span>EROA = 2πr²·Va/Vmax</span><b>{Math.round(eroa * 100)} mm² · {grade5(eroa * 100, 'eroa')}</b></div>
        <div><span>Aliasing · TR Vmax</span><b>{va} cm/s · {(vmax / 100).toFixed(1)} m/s</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Five grades (Hahn & Zamorano): VC mild &lt; 3 · moderate 3–6.9 · severe 7–13 · massive 14–20 · torrential ≥ 21 mm. PISA EROA &lt; 20 · 20–39 · 40–59 · 60–79 · ≥ 80 mm². In a big, crescent-shaped orifice PISA UNDER-reads — 3D vena contracta area is better.</p>
    </div>
  );
}

/* ---------- 4 · RV–PA coupling ---------- */

/** TAPSE (mm) against PASP (mmHg). The slope through the origin is the coupling ratio. */
export function RVPACoupling({ tapse0 = 14, paspEcho = 34, paspCath = 52 }) {
  const [tapse, setTapse] = useState(tapse0);
  const [src, setSrc] = useState('echo');
  const pasp = src === 'echo' ? paspEcho : paspCath;
  const ratio = tapse / pasp;
  const W = 520, H = 280, L = 48, B = 40, T = 14, Rm = 14;
  const X = p => L + (p - 10) / 90 * (W - L - Rm);
  const Y = tp => H - B - (tp - 5) / 25 * (H - B - T);
  const line = k => `M${X(10)} ${Y(Math.max(5, 10 * k))} L${X(100)} ${Y(Math.min(30, 100 * k))}`;
  const tone = ratio >= 0.4 ? '#34E39A' : ratio >= 0.31 ? '#F5C451' : '#FF4D6D';
  return (
    <div className="cs-card tight">
      <div className="cs-viewer" style={{ background: '#03070B' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="TAPSE against PASP">
          <rect x={L} y={T} width={W - L - Rm} height={H - B - T} fill="#050B16" stroke="#182841" />
          {[10, 15, 20, 25, 30].map(v => <g key={v}><line x1={L} x2={W - Rm} y1={Y(v)} y2={Y(v)} stroke="#13212D" /><text x={L - 8} y={Y(v) + 4} textAnchor="end" fontSize="11" fill="#6A7F9B" fontFamily={MONO}>{v}</text></g>)}
          {[20, 40, 60, 80, 100].map(p => <g key={p}><line y1={T} y2={H - B} x1={X(p)} x2={X(p)} stroke="#13212D" /><text x={X(p)} y={H - B + 16} textAnchor="middle" fontSize="11" fill="#6A7F9B" fontFamily={MONO}>{p}</text></g>)}
          <text x={(L + W) / 2} y={H - 6} textAnchor="middle" fontSize="11.5" fill="#A9BBD2" fontFamily={MONO}>PASP (mmHg) — the load</text>
          <text x={14} y={(T + H - B) / 2} textAnchor="middle" fontSize="11.5" fill="#A9BBD2" fontFamily={MONO} transform={`rotate(-90 14 ${(T + H - B) / 2})`}>TAPSE (mm) — the pump</text>
          <path d={line(0.4)} stroke="#34E39A" strokeDasharray="6 5" fill="none" />
          <path d={line(0.31)} stroke="#FF4D6D" strokeDasharray="6 5" fill="none" />
          <text x={X(62)} y={Y(26.5)} fontSize="11" fill="#34E39A" fontFamily={MONO}>0.40</text>
          <text x={X(84)} y={Y(27.5)} fontSize="11" fill="#FF4D6D" fontFamily={MONO}>0.31 mm/mmHg</text>
          <circle cx={X(paspEcho)} cy={Y(tapse)} r="6" fill="none" stroke="#9FB4C6" strokeDasharray="3 2" />
          <circle cx={X(pasp)} cy={Y(tapse)} r="9" fill={tone} stroke="#fff" strokeWidth="2" />
          <text x={X(pasp) + 13} y={Y(tapse) + 4} fontSize="12" fontWeight="700" fill="#E9F2FC" fontFamily={MONO}>{src === 'echo' ? 'echo' : 'catheter'}</text>
        </svg>
      </div>
      <div className="cs-ctrls">
        <button className={'cs-chip' + (src === 'echo' ? ' on' : '')} onClick={() => setSrc('echo')}>PASP from the TR jet ({paspEcho})</button>
        <button className={'cs-chip' + (src === 'cath' ? ' on' : '')} onClick={() => setSrc('cath')}>PASP from the catheter ({paspCath})</button>
        <label className="cs-slider" style={{ flex: '1 1 200px' }}>TAPSE<input type="range" min="6" max="26" step="1" value={tapse} onChange={e => setTapse(+e.target.value)} style={{ width: '100%' }} aria-label="TAPSE" />{tapse} mm</label>
      </div>
      <div className="cs-readout">
        <div><span>TAPSE / PASP</span><b style={{ color: tone }}>{ratio.toFixed(2)} mm/mmHg</b></div>
        <div><span>Reading</span><b style={{ color: tone, fontSize: 15 }}>{ratio >= 0.4 ? 'Coupled' : ratio >= 0.31 ? 'Borderline' : 'Uncoupled'}</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>The thresholds (≈ 0.31 in pulmonary hypertension cohorts; ≈ 0.40 in some T-TEER series) are prognostic markers, not guideline cut-offs. Notice what a falsely low PASP does to the ratio: it FLATTERS the RV.</p>
    </div>
  );
}

/* ---------- 5 · right heart catheter ---------- */

const RHC = {
  ra: { label: 'RA', sys: 30, dia: 9, mean: 19, note: 'Ventricularised: no a wave (AF), a tall cv wave, a steep y descent. Mean 19 mmHg.' },
  rv: { label: 'RV', sys: 52, dia: 20, mean: null, note: 'RV 52 / end-diastolic 20 mmHg — high filling pressure in a stretched ventricle.' },
  pa: { label: 'PA', sys: 52, dia: 20, mean: 31, note: 'PA 52/20. A dicrotic notch; the mean is about a third of the way up from diastolic.' },
  pawp: { label: 'PAWP', sys: 34, dia: 17, mean: 23, note: 'Wedge: no a wave (AF), a v wave to 34 from a stiff LA (HFpEF). Read the mean at end-expiration: 23.' },
};
export const phClass = (mpap, pawp, pvr) => mpap <= 20 ? 'No PH' : pawp <= 15 ? (pvr > 2 ? 'Pre-capillary PH' : 'Unclassified PH (PVR ≤ 2)') : pvr > 2 ? 'Combined post- and pre-capillary PH' : 'Isolated post-capillary PH';

/**
 * Pull back through the chambers, read the numbers off the traces, pick a
 * cardiac output you trust, and calculate. onResult({ mpap, pawp, co, coSrc, pvr, cls, correct })
 */
export function RHCLab({ onResult, done }) {
  const ref = useRef(null);
  const [ch, setCh] = useState('pawp');
  const [mpap, setMpap] = useState(25);
  const [pawp, setPawp] = useState(15);
  const [coSrc, setCoSrc] = useState(null);
  const S = useRef(ch); S.current = ch;
  useCanvas(ref, 200, (g, w, h, t) => {
    const c = RHC[S.current];
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const Y = p => h - 16 - p / 60 * (h - 30);
    g.font = `10px ${MONO}`;
    for (const p of [0, 10, 20, 30, 40, 50, 60]) { g.strokeStyle = '#13212D'; g.beginPath(); g.moveTo(30, Y(p)); g.lineTo(w, Y(p)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(p, 4, Y(p) + 3); }
    const rrs = RR_AF, total = rrs.reduce((a, b) => a + b, 0);
    const beatAt = tt => { let r = ((tt % total) + total) % total; for (const rr of rrs) { if (r < rr) return r / rr; r -= rr; } return 0; };
    const shape = ph => {
      if (S.current === 'rv') return ph < 0.12 ? c.dia + (c.sys - c.dia) * Math.sin(ph / 0.12 * Math.PI / 2) : ph < 0.4 ? c.sys - (ph - 0.12) * 20 : ph < 0.48 ? Math.max(2, c.sys - 5.6 - (ph - 0.4) * 560) : 6 + (c.dia - 6) * clamp((ph - 0.48) / 0.4, 0, 1);
      if (S.current === 'pa') return ph < 0.14 ? c.dia + 2 + (c.sys - c.dia - 2) * Math.sin(ph / 0.14 * Math.PI / 2) : ph < 0.38 ? c.sys - (ph - 0.14) * 40 : ph < 0.41 ? c.sys - 9.6 - 3 + (ph - 0.38) * 80 : c.dia + (c.sys - 12 - c.dia) * Math.exp(-(ph - 0.41) * 4.2);
      if (S.current === 'ra') { const rise = clamp((ph - 0.12) / 0.1, 0, 1), fall = clamp((ph - 0.48) / 0.1, 0, 1); return 13 + (c.sys - 13) * rise * (1 - fall) - 4 * fall * G(ph, 0.62, 0.05) + fall * 0; }
      const vw = 13 * G(ph, 0.5, 0.06);
      return 19 + vw - 2 * G(ph, 0.3, 0.06) - 2 * G(ph, 0.66, 0.05);
    };
    g.strokeStyle = '#FFD166'; g.lineWidth = 2; g.beginPath();
    for (let x = 30; x < w; x += 1.5) {
      const tt = t - (w - x) / 120, resp = Math.sin(tt * 2 * Math.PI / 4) * 1.6;
      const v = shape(beatAt(tt)) + resp;
      x === 30 ? g.moveTo(x, Y(v)) : g.lineTo(x, Y(v));
    }
    g.stroke();
    if (c.mean != null) { g.setLineDash([4, 4]); g.strokeStyle = 'rgba(167,139,250,0.7)'; g.beginPath(); g.moveTo(30, Y(c.mean)); g.lineTo(w, Y(c.mean)); g.stroke(); g.setLineDash([]); }
    g.fillStyle = '#FFD166'; g.font = `700 15px ${MONO}`;
    g.fillText(`${c.label} ${c.sys}/${c.dia}${c.mean != null ? ` (${c.mean})` : ''}`, w - 190, 22);
  }, []);
  const co = coSrc === 'fick' ? 4.2 : coSrc === 'td' ? 3.0 : null;
  const pvr = co ? (mpap - pawp) / co : null;
  const cls = pvr == null ? '—' : phClass(mpap, pawp, pvr);
  const correct = Math.abs(mpap - 31) <= 2 && Math.abs(pawp - 23) <= 2 && coSrc === 'fick';
  return (
    <div className="cs-card tight">
      <div className="cs-ctrls" style={{ marginTop: 0 }}>
        <span className="cs-pts">Catheter tip in:</span>
        {['pawp', 'pa', 'rv', 'ra'].map(k => <button key={k} className={'cs-chip' + (ch === k ? ' on' : '')} onClick={() => setCh(k)}>{RHC[k].label}</button>)}
      </div>
      <div className="cs-viewer" style={{ marginTop: 10 }}>
        <canvas ref={ref} className="cs-canvas" style={{ height: 200 }} aria-label="Right heart catheter pressure trace" />
        <div className="cs-viewer-hud b">{RHC[ch].note}</div>
      </div>
      <div className="cs-grid2" style={{ marginTop: 12 }}>
        <div>
          <label className="cs-slider" style={{ display: 'block' }}>Mean PA pressure (read it)
            <input type="range" min="10" max="60" step="1" value={mpap} onChange={e => setMpap(+e.target.value)} style={{ width: '100%' }} aria-label="Mean PA pressure" /> {mpap} mmHg
          </label>
          <label className="cs-slider" style={{ display: 'block', marginTop: 8 }}>Mean PAWP (end-expiration)
            <input type="range" min="5" max="35" step="1" value={pawp} onChange={e => setPawp(+e.target.value)} style={{ width: '100%' }} aria-label="Mean pulmonary artery wedge pressure" /> {pawp} mmHg
          </label>
        </div>
        <div>
          <div className="cs-pts" style={{ marginBottom: 6 }}>Cardiac output — which do you trust?</div>
          <div className="cs-row">
            <button className={'cs-chip' + (coSrc === 'td' ? ' on' : '')} onClick={() => setCoSrc('td')}>Thermodilution 3.0 L/min</button>
            <button className={'cs-chip' + (coSrc === 'fick' ? ' on' : '')} onClick={() => setCoSrc('fick')}>Direct Fick 4.2 L/min</button>
          </div>
          <p className="cs-pts" style={{ marginTop: 6 }}>Fick: VO₂ 195 mL/min (measured), Hb 118 g/L, SaO₂ 95%, SvO₂ 66% (PA sample) → 195 ÷ (13.4 × 11.8 × 0.29) ≈ 4.2 L/min.</p>
        </div>
      </div>
      <div className="cs-readout">
        <div><span>TPG = mPAP − PAWP</span><b>{mpap - pawp} mmHg</b></div>
        <div><span>PVR = TPG ÷ CO</span><b>{pvr == null ? '—' : `${pvr.toFixed(1)} WU`}</b></div>
        <div><span>Output used</span><b>{co ? `${co} L/min` : '—'}</b></div>
        <div><span>Haemodynamic class</span><b style={{ fontSize: 14, color: 'var(--gold)' }}>{cls}</b></div>
      </div>
      <div className="cs-row" style={{ marginTop: 12 }}>
        <button className="cs-btn primary" disabled={!coSrc || !!done} onClick={() => onResult?.({ mpap, pawp, co, coSrc, pvr, cls, correct })}>Report the haemodynamics</button>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>ESC/ERS 2022: PH = mPAP &gt; 20 mmHg. Pre-capillary: PAWP ≤ 15 and PVR &gt; 2 WU. Isolated post-capillary: PAWP &gt; 15, PVR ≤ 2. Combined: PAWP &gt; 15, PVR &gt; 2.</p>
    </div>
  );
}

/* ---------- 6 · TRI-SCORE ---------- */

export const TRI_ITEMS = [
  { id: 'age', label: 'Age ≥ 70 years', pts: 1 },
  { id: 'nyha', label: 'NYHA class III–IV', pts: 1 },
  { id: 'rhf', label: 'Right-sided heart failure signs (oedema, ascites, raised JVP)', pts: 2 },
  { id: 'furo', label: 'Daily furosemide dose ≥ 125 mg', pts: 2 },
  { id: 'gfr', label: 'Glomerular filtration rate < 30 mL/min', pts: 2 },
  { id: 'bili', label: 'Elevated total bilirubin', pts: 2 },
  { id: 'lvef', label: 'LVEF < 60%', pts: 1 },
  { id: 'rv', label: 'Moderate or severe RV dysfunction', pts: 1 },
];

/** Tick what applies to her; truth is a set of ids. onResult({ score, right, of }) */
export function TriScore({ truth, onResult, done }) {
  const [sel, setSel] = useState(new Set(done?.sel || []));
  const score = TRI_ITEMS.filter(i => sel.has(i.id)).reduce((n, i) => n + i.pts, 0);
  const band = score <= 3 ? ['Low', 'var(--green)'] : score <= 5 ? ['Intermediate', 'var(--gold)'] : ['High', 'var(--red)'];
  const toggle = id => { if (done) return; const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n); };
  const submit = () => {
    const right = TRI_ITEMS.filter(i => sel.has(i.id) === truth.includes(i.id)).length;
    onResult?.({ score, right, of: TRI_ITEMS.length, sel: [...sel] });
  };
  return (
    <div className="cs-card tight">
      <div className="cs-opts">
        {TRI_ITEMS.map(it => {
          const on = sel.has(it.id);
          const cls = !done ? (on ? 'sel' : '') : truth.includes(it.id) ? (on ? 'best' : 'ok') : (on ? 'wrong' : 'dim');
          return (
            <button key={it.id} className={'cs-opt ' + cls} onClick={() => toggle(it.id)} aria-pressed={on} disabled={!!done}>
              <span className="cs-opt-k">{on ? '✓' : ''}</span>
              <span>{it.label} <b className="cs-mono" style={{ color: 'var(--gold)' }}>+{it.pts}</b>
                {done && <span className={'cs-verdict ' + (truth.includes(it.id) ? 'best' : 'wrong')}>{truth.includes(it.id) ? (on ? 'Applies' : 'Missed') : (on ? 'Does not apply' : 'Rightly left out')}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div className="cs-readout">
        <div><span>TRI-SCORE</span><b>{score} / 12</b></div>
        <div><span>Risk band</span><b style={{ color: band[1] }}>{band[0]}</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Derivation cohort (Dreyfus 2022, isolated TV surgery): observed in-hospital mortality rose from 0% at 0 points to about 60% at ≥ 9. Bands used here: ≤ 3 low, 4–5 intermediate, ≥ 6 high.</p>
      {!done && <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" onClick={submit}>Score her</button></div>}
    </div>
  );
}

/* ---------- 7 · T-TEER: the en-face view ---------- */

const SITES = {
  asc: { label: 'Antero-septal, central', x: 0.15, y: -0.24, rot: -56, gap: 6, cut: 0.34, why: 'The A–S line carries most of the jet in functional TR; central first.' },
  asm: { label: 'Antero-septal, toward the commissure', x: 0.34, y: -0.52, rot: -56, gap: 5, cut: 0.2, why: 'Zips the A–S line closed beside the first clip.' },
  ps: { label: 'Postero-septal (beside the lead)', x: 0.09, y: 0.44, rot: 78, gap: 7, cut: 0.22, lead: true, why: 'The pacing lead lies in this commissure.' },
  ap: { label: 'Antero-posterior', x: -0.46, y: -0.15, rot: 17, gap: 10, cut: 0, fail: true, why: 'A 10 mm gap: the arms cannot reach both leaflets.' },
};
export const trGrade = e => e < 0.2 ? 'mild' : e < 0.4 ? 'moderate' : e < 0.6 ? 'severe' : e < 0.8 ? 'massive' : 'torrential';

/**
 * Schematic en-face (atrial) view of the tricuspid valve. Choose a site,
 * grasp, check the insertion, release. onResult({ clips, eroa, grade, grad, lead, fails })
 */
export function TricuspidClip({ eroa0 = 0.9, onResult, done }) {
  const [clips, setClips] = useState(done?.clips || []);
  const [site, setSite] = useState('asc');
  const [grasp, setGrasp] = useState(null);
  const [fails, setFails] = useState(done?.fails || 0);
  const [msg, setMsg] = useState('Pick a site, then grasp.');
  const eroa = Math.max(0.08, clips.reduce((e, k) => e - SITES[k].cut * (k === 'asm' && clips.includes('asc') ? 1.1 : 1), eroa0));
  const grad = +(0.8 + clips.length * 1.1).toFixed(1);
  const lead = clips.includes('ps');
  const grade = trGrade(eroa);
  const hv = eroa >= 0.4 ? 'systolic reversal' : eroa >= 0.2 ? 'blunted systolic' : 'normal S > D';
  const doGrasp = () => {
    if (clips.includes(site)) { setMsg('A clip is already there.'); return; }
    const s = SITES[site];
    if (s.fail) { setFails(f => f + 1); setGrasp(null); setMsg('Transgastric view: only the anterior leaflet is in the arms — the posterior leaflet slipped out. Re-open, invert, withdraw.'); return; }
    setGrasp({ site, ins: s.lead ? [7, 4] : [8, 7] });
    setMsg(s.lead ? 'Grasped — but the lead now sits against the septal arm, and septal insertion is only 4 mm.' : 'Grasped. Check insertion in the transgastric view before release.');
  };
  const release = () => { if (!grasp) return; setClips(c => [...c, grasp.site]); setGrasp(null); setMsg('Released. Re-assess the jet, the gradient and the lead.'); };
  const finish = () => onResult?.({ clips, eroa, grade, grad, lead, fails });
  const cx = 200, cy = 175, R = 130;
  const P = (x, y) => [cx + x * R, cy + y * R];
  return (
    <div className="cs-card tight">
      <div className="cs-grid2">
        <div className="cs-viewer" style={{ background: '#0B0703', alignSelf: 'start' }}>
          <svg viewBox="0 0 400 350" style={{ width: '100%', display: 'block' }} role="img" aria-label="En-face view of the tricuspid valve with clip sites">
            <circle cx={cx} cy={cy} r={R + 8} fill="#5A3A1A" />
            {/* three leaflets meeting at the centre */}
            <path d={`M${cx} ${cy} L${P(-0.95, -0.3).join(' ')} A${R} ${R} 0 0 1 ${P(0.55, -0.83).join(' ')} Z`} fill="#C08A4A" />
            <path d={`M${cx} ${cy} L${P(0.55, -0.83).join(' ')} A${R} ${R} 0 0 1 ${P(0.2, 0.98).join(' ')} Z`} fill="#B07C40" />
            <path d={`M${cx} ${cy} L${P(0.2, 0.98).join(' ')} A${R} ${R} 0 0 1 ${P(-0.95, -0.3).join(' ')} Z`} fill="#A06C34" />
            {/* coaptation lines with the systolic gap */}
            <g stroke="#1A0E04" strokeWidth="6" strokeLinecap="round">
              <line x1={cx} y1={cy} x2={P(0.55, -0.83)[0]} y2={P(0.55, -0.83)[1]} />
              <line x1={cx} y1={cy} x2={P(0.2, 0.98)[0]} y2={P(0.2, 0.98)[1]} />
              <line x1={cx} y1={cy} x2={P(-0.95, -0.3)[0]} y2={P(-0.95, -0.3)[1]} />
            </g>
            {/* residual jet */}
            <circle cx={cx} cy={cy} r={8 + eroa * 34} fill="rgba(80,255,140,0.35)">
              <animate attributeName="opacity" values="0.15;0.85;0.15" dur="0.9s" repeatCount="indefinite" />
            </circle>
            <text x={P(-0.5, -0.55)[0]} y={P(-0.5, -0.55)[1]} fill="#F2D6A8" fontSize="14" fontWeight="700" fontFamily={MONO}>ANTERIOR</text>
            <text x={P(0.45, 0.12)[0] - 10} y={P(0.45, 0.12)[1]} fill="#F2D6A8" fontSize="14" fontWeight="700" fontFamily={MONO}>SEPTAL</text>
            <text x={P(-0.7, 0.32)[0]} y={P(-0.7, 0.32)[1]} fill="#F2D6A8" fontSize="14" fontWeight="700" fontFamily={MONO}>POSTERIOR</text>
            <text x={P(0.62, -1.02)[0] - 30} y={P(0.62, -1.02)[1] + 2} fill="#9FB4C6" fontSize="11" fontFamily={MONO}>aorta ↗</text>
            <text x={P(-0.2, 1.13)[0] - 40} y={P(-0.2, 1.13)[1] + 4} fill="#9FB4C6" fontSize="11" fontFamily={MONO}>coronary sinus</text>
            {/* the pacing lead at the postero-septal commissure */}
            <circle cx={P(0.15, 0.72)[0]} cy={P(0.15, 0.72)[1]} r="7" fill="#E9F2FC" stroke="#000" />
            <text x={P(0.15, 0.72)[0] + 10} y={P(0.15, 0.72)[1] + 4} fill="#E9F2FC" fontSize="11" fontFamily={MONO}>lead</text>
            {Object.entries(SITES).map(([k, s]) => {
              const [x, y] = P(s.x, s.y), placed = clips.includes(k);
              return (
                <g key={k} onClick={() => setSite(k)} style={{ cursor: 'pointer' }}>
                  {placed
                    ? <rect x={x - 5} y={y - 18} width="10" height="36" rx="3" fill="#C9D1D9" transform={`rotate(${s.rot} ${x} ${y})`} />
                    : <circle cx={x} cy={y} r={site === k ? 13 : 10} fill={site === k ? 'rgba(34,211,238,0.35)' : 'rgba(255,255,255,0.08)'} stroke={site === k ? '#22D3EE' : '#9FB4C6'} strokeDasharray="3 3" />}
                </g>
              );
            })}
          </svg>
        </div>
        <div>
          <div className="cs-pts" style={{ marginBottom: 6 }}>Schematic 3D TOE en-face view (atrial side). Target:</div>
          <div className="cs-opts">
            {Object.entries(SITES).map(([k, s]) => (
              <button key={k} className={'cs-opt' + (site === k ? ' sel' : '') + (clips.includes(k) ? ' best' : '')} onClick={() => setSite(k)} disabled={!!done}>
                <span className="cs-opt-k">{clips.includes(k) ? '✓' : ''}</span>
                <span>{s.label}<span className="cs-opt-why">Gap {s.gap} mm. {s.why}</span></span>
              </button>
            ))}
          </div>
          <div className="cs-row" style={{ marginTop: 10 }}>
            <button className="cs-btn" onClick={doGrasp} disabled={!!done || !!grasp || clips.length >= 3}>Grasp</button>
            <button className="cs-btn primary" onClick={release} disabled={!!done || !grasp}>Release clip</button>
            <button className="cs-btn" onClick={() => { setGrasp(null); setMsg('Arms opened, leaflets freed.'); }} disabled={!!done || !grasp}>Open & withdraw</button>
          </div>
          {grasp && <p className="cs-pts" style={{ marginTop: 8, color: grasp.ins[1] < 6 ? 'var(--red)' : 'var(--green)' }}>Insertion: anterior {grasp.ins[0]} mm · septal {grasp.ins[1]} mm</p>}
          <p className="cs-pts" style={{ marginTop: 8 }}>{msg}</p>
        </div>
      </div>
      <div className="cs-readout">
        <div><span>Residual TR</span><b style={{ color: grade === 'mild' || grade === 'moderate' ? 'var(--green)' : 'var(--red)' }}>{grade} · {Math.round(eroa * 100)} mm²</b></div>
        <div><span>Mean TV gradient</span><b style={{ color: grad >= 5 ? 'var(--red)' : undefined }}>{grad} mmHg</b></div>
        <div><span>RA mean / v</span><b>{Math.round(10 + eroa * 10)} / {Math.round(raV(eroa))} mmHg</b></div>
        <div><span>Hepatic veins</span><b style={{ fontSize: 14 }}>{hv}</b></div>
        <div><span>Lead</span><b style={{ color: lead ? 'var(--red)' : 'var(--green)', fontSize: 14 }}>{lead ? 'pinned by a clip' : 'free'}</b></div>
      </div>
      {!done && <div className="cs-row" style={{ marginTop: 12 }}><button className="cs-btn primary" onClick={finish} disabled={!clips.length || !!grasp}>Finish — remove the guide</button></div>}
    </div>
  );
}

/* ---------- 8 · RV resuscitation ---------- */

const RV_ACTIONS = [
  { id: 'nor', label: 'Noradrenaline 0.05 → 0.15 µg/kg/min (MAP ≥ 65)', good: true },
  { id: 'o2', label: 'High-flow nasal oxygen, SpO₂ ≥ 92%; stop the opioid; correct CO₂', good: true },
  { id: 'dob', label: 'Dobutamine 2.5 → 5 µg/kg/min', good: true },
  { id: 'ino', label: 'Inhaled nitric oxide 20 ppm (or inhaled epoprostenol)', good: true, opt: true },
  { id: 'fluid', label: '1 L crystalloid bolus "to fill the RV"', good: false },
  { id: 'gtn', label: 'GTN infusion for the high CVP', good: false },
  { id: 'rsi', label: 'Intubate now: propofol and rocuronium', good: false },
  { id: 'bb', label: 'IV metoprolol 5 mg for the AF at 118', good: false },
];

const RV_START = { map: 52, sys: 74, dia: 42, hr: 118, cvp: 22, ci: 1.6, spo2: 86, pco2: 56, lac: 4.6 };

function applyRv(s, id, log) {
  const n = { ...s };
  const before = log.map(l => l.id);
  if (id === 'nor') { n.map += 16; n.ci += 0.15; n.cvp -= 1; }
  if (id === 'o2') { n.spo2 = 94; n.pco2 = 46; n.cvp -= 2; n.ci += 0.15; n.map += 3; }
  if (id === 'dob') { if (before.includes('nor')) { n.ci += 0.45; n.map += 4; n.hr += 4; n.cvp -= 2; } else { n.ci += 0.3; n.map -= 7; n.hr += 10; } }
  if (id === 'ino') { n.ci += 0.25; n.cvp -= 2; n.spo2 = Math.min(97, n.spo2 + 2); }
  if (id === 'fluid') { n.cvp += 4; n.ci -= 0.25; n.map -= 6; }
  if (id === 'gtn') { n.map -= 14; n.ci -= 0.2; }
  if (id === 'rsi') { n.map = 34; n.ci = 1.0; n.hr = 54; }
  if (id === 'bb') { n.hr -= 22; n.map -= 10; n.ci -= 0.35; }
  n.map = clamp(n.map, 25, 90); n.ci = clamp(+n.ci.toFixed(2), 0.8, 3.2); n.cvp = clamp(n.cvp, 8, 30);
  n.sys = Math.round(n.map * 1.42); n.dia = Math.round(n.map * 0.79);
  const stable = n.map >= 65 && n.ci >= 2.1 && n.spo2 >= 92;
  n.lac = stable ? 2.1 : n.map < 45 ? 6.8 : s.lac;
  return n;
}

/**
 * The RV after its pop-off valve is closed. Each action is given once and
 * moves the numbers. onChange(vitals) mirrors to the case monitor;
 * onDone({ pts, max, log, final })
 */
export function RVResusBoard({ onChange, onDone, done }) {
  const [s, setS] = useState(done?.final || RV_START);
  const [log, setLog] = useState(done?.log || []);
  const [rescued, setRescued] = useState(false);
  const act = a => {
    if (done || log.some(l => l.id === a.id)) return;
    const n = applyRv(s, a.id, log);
    const entry = { id: a.id, label: a.label, good: a.good, note: rvNote(a.id, log) };
    let final = n;
    if (a.id === 'rsi') {
      // the peri-intubation arrest — someone has to rescue it
      final = { ...n, map: 58, sys: 82, dia: 46, ci: 1.7, hr: 108, lac: 7.2 };
      setRescued(true);
      entry.note = 'BP 50/28 then PEA for 90 seconds: CPR, adrenaline 100 µg boluses, ROSC. The RV could not survive positive pressure plus a vasodilating induction agent.';
    }
    setS(final); setLog(l => [...l, entry]);
    onChange?.({ hr: final.hr, sys: final.sys, dia: final.dia, spo2: final.spo2 });
  };
  const stable = s.map >= 65 && s.ci >= 2.1 && s.spo2 >= 92;
  const finish = () => {
    const ids = log.map(l => l.id);
    const harms = log.filter(l => !l.good).length;
    let pts = 20;
    if (!ids.includes('nor')) pts -= 6;
    if (!ids.includes('o2')) pts -= 4;
    if (!ids.includes('dob')) pts -= 3;
    if (ids.includes('dob') && ids.includes('nor') && ids.indexOf('dob') < ids.indexOf('nor')) pts -= 3;
    pts -= harms * 5;
    pts = clamp(pts, 0, 20);
    onDone?.({ pts, max: 20, log, final: s, stable });
  };
  const tile = (k, v, bad) => <div><span>{k}</span><b style={{ color: bad ? 'var(--red)' : 'var(--green)' }}>{v}</b></div>;
  return (
    <div className="cs-card tight">
      <div className="cs-readout" style={{ marginTop: 0 }}>
        {tile('MAP', `${s.map} mmHg`, s.map < 65)}
        {tile('CVP', `${s.cvp} mmHg`, s.cvp > 15)}
        {tile('Cardiac index', `${s.ci.toFixed(1)} L/min/m²`, s.ci < 2.1)}
        {tile('SpO₂ · PaCO₂', `${s.spo2}% · ${s.pco2}`, s.spo2 < 92 || s.pco2 > 48)}
        {tile('Lactate', `${s.lac} mmol/L`, s.lac > 2.2)}
      </div>
      <div className="cs-opts" style={{ marginTop: 12 }}>
        {RV_ACTIONS.map(a => {
          const used = log.find(l => l.id === a.id);
          return (
            <button key={a.id} className={'cs-opt ' + (used ? (a.good ? 'best' : 'wrong') : '')} onClick={() => act(a)} disabled={!!done || !!used}>
              <span className="cs-opt-k">{used ? '✓' : ''}</span>
              <span>{a.label}{used && <span className="cs-opt-why">{used.note}</span>}</span>
            </button>
          );
        })}
      </div>
      {rescued && <p className="cs-pts" style={{ color: 'var(--red)', marginTop: 8 }}>Peri-intubation arrest — resuscitated. Remember why.</p>}
      {!done && (
        <div className="cs-row" style={{ marginTop: 12 }}>
          <button className="cs-btn primary" onClick={finish} disabled={!log.length}>{stable ? 'She is stabilising — hand over to ICU' : 'Stop here and hand over'}</button>
        </div>
      )}
    </div>
  );
}

function rvNote(id, log) {
  const ids = log.map(l => l.id);
  return {
    nor: 'Aortic pressure is the RV’s coronary perfusion pressure. Restore it first — the right coronary only fills when aortic pressure exceeds RV pressure.',
    o2: 'Hypoxia and hypercapnia both constrict the pulmonary arterioles. Fixing them lowers the RV’s afterload for free.',
    dob: ids.includes('nor') ? 'Contractility on top of a protected perfusion pressure: the cardiac index climbs.' : 'Dobutamine without a vasopressor dilates the systemic bed: MAP falls and the RV becomes more ischaemic. Pressure first, then squeeze.',
    ino: 'Selective pulmonary vasodilation without a systemic fall. In post-capillary PH watch the wedge: unloading the RV can flood a stiff LA.',
    fluid: 'The RV was already over-full (CVP 22). More volume bowed the septum into the LV and output FELL.',
    gtn: 'Venodilation and systemic vasodilation: preload and coronary perfusion both fell.',
    rsi: '',
    bb: 'The tachycardia was compensating for a tiny stroke volume. Slowing it cut the output.',
  }[id];
}

/* ---------- 9 · repair or replace? the anatomy planner ---------- */

export const PLAN_PRESETS = [
  { name: 'Mrs Marchetti', gap: 6, septal: 14, tg: 'good', lead: 'commissure', annulus: 48, tapse: 14 },
  { name: 'Mr K — lead-pinned', gap: 9, septal: 9, tg: 'good', lead: 'pinning', annulus: 52, tapse: 15 },
  { name: 'Mrs A — poor windows', gap: 5, septal: 13, tg: 'poor', lead: 'none', annulus: 44, tapse: 17 },
];

/** Feature-by-feature suitability for T-TEER vs TTVR. Teaching heuristics, not a device IFU. */
export function TherapyPlanner({ onPick, done }) {
  const [p, setP] = useState({ ...PLAN_PRESETS[0] });
  const [sel, setSel] = useState(0);
  const teer = [
    [p.gap <= 7, `Coaptation gap ${p.gap} mm (≲ 7 mm favourable)`],
    [p.septal >= 10, `Septal leaflet ${p.septal} mm (short or tethered = hard to grasp)`],
    [p.tg === 'good', `Transgastric TOE views ${p.tg}`],
    [p.lead !== 'pinning', `Lead ${p.lead === 'pinning' ? 'pins a leaflet' : p.lead === 'commissure' ? 'in a commissure' : 'absent'}`],
  ];
  const ttvr = [
    [p.annulus <= 55, `Annulus ${p.annulus} mm within sizing range (schematic ≤ 55 mm)`],
    [p.tapse >= 10, `TAPSE ${p.tapse} mm (very poor RV = afterload mismatch risk)`],
    [true, p.lead === 'none' ? 'No lead to jail' : 'Lead would be jailed — acceptable only with a plan'],
    [true, 'Needs anticoagulation; new pacemaker risk if no device'],
  ];
  const score = arr => arr.filter(x => x[0]).length;
  const verdict = score(teer) === 4 ? 'T-TEER first' : score(ttvr) >= 3 ? 'TTVR favoured' : 'Neither ideal — heart team';
  const pick = i => { setSel(i); setP({ ...PLAN_PRESETS[i] }); };
  return (
    <div className="cs-card tight">
      <div className="cs-ctrls" style={{ marginTop: 0 }}>
        {PLAN_PRESETS.map((q, i) => <button key={q.name} className={'cs-chip' + (sel === i ? ' on' : '')} onClick={() => pick(i)}>{q.name}</button>)}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: '1 1 200px' }}>Coaptation gap<input type="range" min="2" max="14" step="1" value={p.gap} onChange={e => setP({ ...p, gap: +e.target.value })} style={{ width: '100%' }} aria-label="Coaptation gap" />{p.gap} mm</label>
        <label className="cs-slider" style={{ flex: '1 1 200px' }}>Septal leaflet<input type="range" min="6" max="20" step="1" value={p.septal} onChange={e => setP({ ...p, septal: +e.target.value })} style={{ width: '100%' }} aria-label="Septal leaflet length" />{p.septal} mm</label>
        <label className="cs-slider" style={{ flex: '1 1 200px' }}>Annulus<input type="range" min="36" max="64" step="1" value={p.annulus} onChange={e => setP({ ...p, annulus: +e.target.value })} style={{ width: '100%' }} aria-label="Tricuspid annulus diameter" />{p.annulus} mm</label>
      </div>
      <div className="cs-grid2" style={{ marginTop: 10 }}>
        {[['🗜️ T-TEER', teer], ['🔩 TTVR', ttvr]].map(([h, arr]) => (
          <div key={h} className="cs-card" style={{ margin: 0, background: 'var(--panel2)' }}>
            <b>{h} · {score(arr)}/4</b>
            <ul className="cs-ul" style={{ marginTop: 6 }}>{arr.map(([ok, t], i) => <li key={i} className="cs-li" style={{ color: ok ? 'var(--green)' : 'var(--red)' }}>{ok ? '✓' : '✗'} {t}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="cs-readout"><div><span>Planner leans to</span><b style={{ color: 'var(--gold)', fontSize: 16 }}>{verdict}</b></div></div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Schematic thresholds for teaching; real decisions use device-specific CT/3D-TOE screening and the heart team.</p>
      <div className="cs-row" style={{ marginTop: 10 }}>
        <span className="cs-pts">For each patient, which route? Record your plan for Mr K:</span>
        {['T-TEER', 'TTVR', 'Medical'].map(o => <button key={o} className={'cs-btn' + (done === o ? ' primary' : '')} disabled={!!done} onClick={() => onPick?.(o)}>{o}</button>)}
      </div>
    </div>
  );
}
