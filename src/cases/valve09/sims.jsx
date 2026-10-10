import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../kit/Monitor.jsx';

/* ============================================================
   PROSTHETIC VALVE SIMULATORS (Valvular & Structural Heart Unit, case 09)
   Written in the kit's style so they can be promoted later:
   - ValveClicks       mechanical valve sounds: crisp vs muffled clicks
   - ProstheticDoppler CW inflow through a mitral prosthesis: peak E,
                       pressure half-time, VTI → mean gradient, DVI, EOA
   - CineFluoro        cinefluoroscopy of a bileaflet valve: find the
                       edge-on view, freeze in diastole, measure angles
   - PvtPathway        obstructive prosthetic thrombosis: the decision map
   - LysisRun          slow-infusion low-dose alteplase, hour by hour
   - InrChart          the INR log against its target band
   ============================================================ */

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const rad = d => d * Math.PI / 180;

/* ---------- 1 · mechanical valve sounds ---------- */

const CLICK_MODES = {
  'mmv-normal': {
    name: 'Mechanical mitral — working', rr: 0.75, irregular: false,
    events: [
      { at: 0.02, kind: 'click', amp: 1, label: 'MCC' },        // mitral closing click = her S1
      { at: 0.33, kind: 'thud', amp: 0.6, label: 'A2' },        // native aortic closure
      { at: 0.41, kind: 'click', amp: 0.6, label: 'MOC' },      // mitral opening click
    ],
    notes: ['A loud, crisp, metallic closing click in place of S1 — patients and families hear it across a room.',
      'A softer opening click ~70–100 ms after A2, like an opening snap.',
      'No diastolic murmur. A soft systolic flow murmur is common and harmless.'],
  },
  'mmv-stuck': {
    name: 'Her valve tonight', rr: 0.56, irregular: true,
    events: [
      { at: 0.02, kind: 'click', amp: 0.28, muffled: true, label: 'MCC' },
      { at: 0.29, kind: 'thud', amp: 0.6, label: 'A2' },
    ],
    rumble: { from: 0.36, to: 0.95 },
    notes: ['The closing click is soft and muffled — one leaflet barely moves, so less metal meets the housing.',
      'The opening click has GONE: a leaflet that does not open cannot click open.',
      'A low diastolic rumble across the narrowed orifice, in fast irregular AF.'],
  },
  'amv-normal': {
    name: 'Mechanical aortic — working (contrast)', rr: 0.8, irregular: false,
    events: [
      { at: 0.02, kind: 'thud', amp: 0.7, label: 'S1' },
      { at: 0.08, kind: 'click', amp: 0.5, label: 'AOC' },
      { at: 0.34, kind: 'click', amp: 1, label: 'ACC' },
    ],
    ejection: { from: 0.09, to: 0.3 },
    notes: ['Here the LOUD click is the aortic closing click at S2; the opening click follows S1.',
      'A short, soft ejection murmur is normal across any aortic prosthesis.',
      'A diastolic murmur after an aortic prosthesis is never normal — think paravalvular leak or endocarditis.'],
  },
};

export function ValveClicks({ modes = ['mmv-normal', 'mmv-stuck', 'amv-normal'] }) {
  const [key, setKey] = useState(modes[0]);
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  const audio = useRef(null);
  const M = CLICK_MODES[key];
  const S = useRef(M); S.current = M;

  useCanvas(ref, 200, (g, w, h) => {
    const m = S.current;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const span = 2.4, X = s => 34 + s / span * (w - 44), base = 112;
    g.font = `600 10px ${MONO}`; g.fillStyle = '#6A7F9B';
    g.fillText('ECG', 2, 30); g.fillText('PCG', 2, base - 36);
    g.strokeStyle = '#1B2A40'; g.beginPath(); g.moveTo(34, base); g.lineTo(w - 10, base); g.stroke();
    let t0 = 0, b = 0;
    while (t0 < span) {
      const rr = m.rr * (m.irregular ? [1, 0.82, 1.24, 0.9, 1.1][b % 5] : 1);
      // ECG spike at each beat for timing
      g.strokeStyle = '#38E07A'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(X(t0) - 4, 40); g.lineTo(X(t0), 40); g.lineTo(X(t0) + 2, 18); g.lineTo(X(t0) + 4, 46); g.lineTo(X(t0) + 7, 40); g.lineTo(Math.min(w - 10, X(t0 + rr) - 4), 40); g.stroke();
      for (const e of m.events) {
        const at = t0 + e.at; if (at > span) continue;
        const n = e.kind === 'click' ? 18 : 28, len = e.kind === 'click' ? 0.014 : 0.045;
        g.strokeStyle = e.kind === 'click' ? (e.muffled ? '#8A7A4A' : '#F5C451') : '#E9F2FC'; g.lineWidth = 1.3; g.beginPath();
        for (let k = 0; k <= n; k++) { const s = at + k / n * len; const a = e.amp * Math.exp(-k / (e.kind === 'click' ? 4 : 9)) * (k % 2 ? 1 : -1); k ? g.lineTo(X(s), base - a * 40) : g.moveTo(X(s), base); }
        g.stroke();
        g.fillStyle = e.kind === 'click' ? '#F5C451' : '#9FB4C6'; g.fillText(e.label, X(at) - 8, base + 52);
      }
      const band = (bd, color) => {
        if (!bd) return;
        g.fillStyle = color;
        for (let s = t0 + bd.from * rr; s < Math.min(span, t0 + bd.to * rr); s += 0.006) { const a = 4 + Math.random() * 7; g.fillRect(X(s), base - a, 1.6, a * 2); }
      };
      band(m.rumble, 'rgba(255,107,154,0.55)');
      band(m.ejection, 'rgba(94,234,212,0.45)');
      t0 += rr; b++;
    }
  }, []);

  const start = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
    const click = (at, amp, muffled) => {
      const n = ctx.createBufferSource(); n.buffer = noise;
      const f = ctx.createBiquadFilter(); f.type = muffled ? 'lowpass' : 'highpass'; f.frequency.value = muffled ? 500 : 1800;
      const gg = ctx.createGain(); gg.gain.setValueAtTime(amp, at); gg.gain.exponentialRampToValueAtTime(0.0001, at + (muffled ? 0.03 : 0.012));
      n.connect(f).connect(gg).connect(master); n.start(at); n.stop(at + 0.05);
      const o = ctx.createOscillator(); o.frequency.value = muffled ? 300 : 2600;
      const og = ctx.createGain(); og.gain.setValueAtTime(amp * 0.4, at); og.gain.exponentialRampToValueAtTime(0.0001, at + 0.02);
      o.connect(og).connect(master); o.start(at); o.stop(at + 0.03);
    };
    const thud = (at, amp) => {
      const o = ctx.createOscillator(); o.frequency.value = 70;
      const gg = ctx.createGain(); gg.gain.setValueAtTime(0, at); gg.gain.linearRampToValueAtTime(amp, at + 0.008); gg.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
      o.connect(gg).connect(master); o.start(at); o.stop(at + 0.09);
    };
    const band = (a, b, freq, amp) => {
      const n = ctx.createBufferSource(); n.buffer = noise; n.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 1;
      const gg = ctx.createGain(); gg.gain.setValueAtTime(0, a); gg.gain.linearRampToValueAtTime(amp, a + 0.04); gg.gain.linearRampToValueAtTime(0, b);
      n.connect(bp).connect(gg).connect(master); n.start(a); n.stop(b + 0.02);
    };
    let next = ctx.currentTime + 0.1, b = 0;
    const schedule = () => {
      const m = S.current;
      while (next < ctx.currentTime + 0.6) {
        const rr = m.rr * (m.irregular ? [1, 0.82, 1.24, 0.9, 1.1][b % 5] : 1);
        for (const e of m.events) e.kind === 'click' ? click(next + e.at, e.amp * 0.9, e.muffled) : thud(next + e.at, e.amp);
        if (m.rumble) band(next + m.rumble.from * rr, next + m.rumble.to * rr, 110, 0.35);
        if (m.ejection) band(next + m.ejection.from * rr, next + m.ejection.to * rr, 260, 0.12);
        next += rr; b++;
      }
    };
    schedule();
    const id = setInterval(schedule, 150);
    audio.current = { ctx, id };
    setPlaying(true);
  };
  const stop = () => { if (audio.current) { clearInterval(audio.current.id); audio.current.ctx.close(); audio.current = null; } setPlaying(false); };
  useEffect(() => () => stop(), []);   // eslint-disable-line

  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {modes.map(k => <button key={k} className={'cs-chip' + (k === key ? ' on' : '')} onClick={() => setKey(k)}>{CLICK_MODES[k].name}</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 200 }} aria-label={`Phonocardiogram: ${M.name}`} /></div>
      <div className="cs-ctrls">
        {!playing ? <button className="cs-btn primary" onClick={start}>🔊 Listen</button> : <button className="cs-btn" onClick={stop}>■ Stop</button>}
        <span className="cs-pts">Gold = metallic clicks · pink = diastolic rumble · teal = ejection flow</span>
      </div>
      <ul className="cs-ul" style={{ marginTop: 10, fontSize: 14 }}>{M.notes.map(n => <li key={n} className="cs-li">{n}</li>)}</ul>
      <p className="cs-pts">Synthesised to teach timing and quality, not recorded from a patient. Use headphones.</p>
    </div>
  );
}

/* ---------- 2 · prosthetic mitral Doppler ---------- */

/**
 * CW Doppler through a mitral prosthesis (apical 4-chamber, flow toward the
 * probe). The learner sets a caliper on the peak E velocity and lays a
 * slope along the deceleration to get the pressure half-time; the trace
 * gives the VTI. LVOT VTI and diameter come from the PW measurement.
 * onMeasure({ vp, dt, pht, vti, mean, close, phtClose })
 */
export function ProstheticDoppler({ vp = 2.6, dt = 790, dia = 0.42, lvotVti = 16, lvotD = 2.0, onMeasure, done }) {
  const ref = useRef(null);
  const [cal, setCal] = useState(1.4);
  const [slope, setSlope] = useState(400);
  const env = s => {                                    // velocity at s seconds into diastole
    if (s < 0 || s > dia + 0.04) return 0;
    if (s < 0.06) return vp * Math.sin(s / 0.06 * Math.PI / 2);
    if (s <= dia) return Math.max(0, vp * (1 - (s - 0.06) / (dt / 1000)));
    return vp * (1 - (dia - 0.06) / (dt / 1000)) * (1 - (s - dia) / 0.04);
  };
  // the trace: VTI and mean gradient from the true envelope
  let vti = 0, g2 = 0; const N = 400;
  for (let k = 0; k < N; k++) { const s = k / N * (dia + 0.04); const v = env(s); vti += v * (dia + 0.04) / N; g2 += 4 * v * v / N; }
  const S = useRef({}); S.current = { cal, slope };
  useCanvas(ref, 240, (g, w, h, t) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const base = h - 22, top = 26, vmax = 3.5, Y = v => base - v / vmax * (base - top);
    g.strokeStyle = '#2B3B4E'; g.fillStyle = '#6A7F9B'; g.font = `10px ${MONO}`;
    for (let v = 0; v <= 3; v += 1) { g.beginPath(); g.moveTo(40, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.fillText(`${v}`, 8, Y(v) + 3); }
    g.fillText('m/s', 6, 14);
    const rr = 0.68, pxs = (w - 50) / (rr * 2.6), X = s => 46 + s * pxs;
    for (let b = 0; b < 3; b++) {
      const t0 = b * rr + 0.28;                           // diastole starts after systole
      for (let s = 0; s < dia + 0.04; s += 1 / pxs * 1.5) {
        const v = env(s), x = X(t0 + s); if (x > w) break;
        for (let k = 0; k < 8; k++) { const vv = v * Math.random(); g.fillStyle = `rgba(230,230,230,${0.2 + Math.random() * 0.45})`; g.fillRect(x, Y(vv), 1.5, 2); }
        g.fillStyle = 'rgba(245,245,245,0.95)'; g.fillRect(x, Y(v) - 1, 1.5, 2);
      }
    }
    // slope tool on the second beat
    const { cal: c, slope: sl } = S.current;
    const t1 = rr + 0.28 + 0.06;
    g.strokeStyle = '#5EEAD4'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(X(t1), Y(c)); g.lineTo(X(t1 + sl / 1000), Y(0)); g.stroke();
    g.fillStyle = '#5EEAD4'; g.font = `700 11px ${MONO}`; g.fillText(`DT ${Math.round(sl)} ms`, Math.min(w - 100, X(t1 + sl / 1000) - 40), Y(0) - 6);
    // caliper
    const y = Y(c);
    g.strokeStyle = '#F5C451'; g.setLineDash([6, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(40, y); g.lineTo(w, y); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`; g.fillText(`${c.toFixed(2)} m/s`, w - 90, y - 6);
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(40 + (t * 90) % (w - 40), 0, 8, h);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText('CW · MITRAL PROSTHESIS · APICAL 4C', 50, 16);
  }, [vp, dt]);
  const pht = 0.29 * slope;
  const close = Math.abs(cal - vp) <= 0.12;
  const phtClose = Math.abs(slope - dt) <= dt * 0.12;
  const lvotArea = Math.PI * (lvotD / 2) ** 2;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 240 }} aria-label="Continuous-wave Doppler through the mitral prosthesis" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Peak E caliper
          <input type="range" min="0" max="3.5" step="0.02" value={cal} disabled={!!done} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="Peak velocity caliper" />
        </label>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Deceleration slope
          <input type="range" min="150" max="1400" step="10" value={slope} disabled={!!done} onChange={e => setSlope(+e.target.value)} style={{ width: '100%' }} aria-label="Deceleration time slope" />
        </label>
        <button className="cs-btn primary" disabled={!!done} onClick={() => onMeasure?.({ vp: cal, dt: slope, pht, vti: vti * 100, mean: g2, close, phtClose, lvotVti, lvotArea })}>Measure & trace</button>
      </div>
      <div className="cs-readout">
        <div><span>Peak E</span><b>{cal.toFixed(2)} m/s</b></div>
        <div><span>Peak gradient 4v²</span><b>{Math.round(4 * cal * cal)} mmHg</b></div>
        <div><span>PHT = 0.29 × DT</span><b>{Math.round(pht)} ms</b></div>
        {done && <div><span>VTI (traced)</span><b>{Math.round(vti * 100)} cm</b></div>}
        {done && <div><span>Mean gradient</span><b>{Math.round(g2)} mmHg</b></div>}
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Caliper on the dense edge of the peak. Lay the slope along the deceleration and extend it to the baseline even when the next beat cuts the envelope short. In AF, average 5–10 beats.</p>
    </div>
  );
}

/* ---------- 3 · cinefluoroscopy of a bileaflet valve ---------- */

/**
 * The prosthesis on fluoroscopy. Steer the C-arm until the ring is seen
 * edge-on (a straight line) and the leaflets in profile (crisp lines).
 * Freeze in diastole (mitral leaflets OPEN in diastole) and measure each
 * leaflet's angle to the ring plane with the protractor.
 * aOpen/bOpen: true opening angles; closing ~ 30° both.
 * onResult({ aligned, A, B, phase })
 */
const VIEW = { lao: 18, cran: -14 };   // the edge-on view for this patient's valve
export function CineFluoro({ aOpen = 85, bOpen = 35, closed = 30, fixed = false, measure = true, onResult, done, label }) {
  const ref = useRef(null);
  const [lao, setLao] = useState(fixed ? VIEW.lao : -10);
  const [cran, setCran] = useState(fixed ? VIEW.cran : 10);
  const [phase, setPhase] = useState('live');
  const [leaf, setLeaf] = useState('A');
  const [prot, setProt] = useState(45);
  const [rec, setRec] = useState({});
  const S = useRef({}); S.current = { lao, cran, phase, leaf, prot, aOpen, bOpen, closed, measure };
  useCanvas(ref, 300, (g, w, h, t) => {
    const s = S.current;
    // fluoroscopy: light-grey field, radiopaque structures dark, a little noise
    const grd = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h) * 0.7);
    grd.addColorStop(0, '#B9C0C4'); grd.addColorStop(1, '#4A5258');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '0,0,0'},0.06)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    // sternal wires, a reminder of her two sternotomies
    g.strokeStyle = 'rgba(30,34,38,0.55)'; g.lineWidth = 3;
    for (let k = 0; k < 4; k++) { const y = 40 + k * 62; g.beginPath(); g.ellipse(w * 0.16, y, 16, 7, 0.2, 0, Math.PI * 2); g.stroke(); }
    const eA = s.lao - VIEW.lao, eB = s.cran - VIEW.cran;
    const cx = w * 0.56, cy = h * 0.52, R = Math.min(w * 0.3, 120);
    // cardiac phase: mitral leaflets open in diastole
    const cyc = (t * 1.2) % 1;
    const open = s.phase === 'diastole' ? 1 : s.phase === 'systole' ? 0 : cyc < 0.35 ? 0 : cyc < 0.42 ? (cyc - 0.35) / 0.07 : cyc < 0.92 ? 1 : 1 - (cyc - 0.92) / 0.08;
    const swing = Math.sin(t * 7.5) * (s.phase === 'live' ? 3 : 0);       // cardiac motion
    g.save(); g.translate(cx, cy + swing); g.rotate(rad(-8));
    // ring: an ellipse that collapses to a line when edge-on
    const minor = Math.max(3, R * Math.abs(Math.sin(rad(eA))));
    g.strokeStyle = '#1A1E22'; g.lineWidth = 7; g.beginPath(); g.ellipse(0, 0, R, minor, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(26,30,34,0.35)'; g.lineWidth = 16; g.beginPath(); g.ellipse(0, 0, R + 9, minor + 4, 0, 0, Math.PI * 2); g.stroke();
    // leaflets: crisp lines in profile; broad, faint plates when off-axis
    const blur = Math.abs(Math.sin(rad(eB))) * R * 0.9 + Math.abs(Math.sin(rad(eA))) * R * 0.25;
    const drawLeaf = (side, theta) => {
      const L = R * 0.92, px = side * R * 0.48, phi = side < 0 ? rad(theta) : Math.PI - rad(theta);
      const ax = Math.cos(phi) * L / 2, ay = -Math.sin(phi) * L / 2 * Math.cos(rad(eA));
      g.fillStyle = `rgba(20,24,28,${Math.max(0.25, 0.8 - blur / R)})`;
      g.beginPath(); g.moveTo(px - ax - blur / 2, -ay); g.lineTo(px + ax - blur / 2, ay); g.lineTo(px + ax + blur / 2, ay); g.lineTo(px - ax + blur / 2, -ay); g.closePath(); g.fill();
      g.strokeStyle = `rgba(10,12,14,${Math.max(0.3, 1 - blur / R)})`; g.lineWidth = 4; g.beginPath(); g.moveTo(px - ax, -ay); g.lineTo(px + ax, ay); g.stroke();
      return { px, phi };
    };
    const thA = s.closed + (s.aOpen - s.closed) * open, thB = s.closed + (s.bOpen - s.closed) * open;
    const la = drawLeaf(-1, thA), lb = drawLeaf(1, thB);
    if (s.measure) {
      const at = s.leaf === 'A' ? la : lb;
      const phi = s.leaf === 'A' ? rad(s.prot) : Math.PI - rad(s.prot);
      g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.setLineDash([7, 5]);
      g.beginPath(); g.moveTo(at.px - Math.cos(phi) * R * 0.7, Math.sin(phi) * R * 0.7); g.lineTo(at.px + Math.cos(phi) * R * 0.7, -Math.sin(phi) * R * 0.7); g.stroke();
      g.beginPath(); g.moveTo(at.px - R * 0.45, 0); g.lineTo(at.px + R * 0.45, 0); g.stroke(); g.setLineDash([]);
      g.beginPath(); g.arc(at.px, 0, 26, s.leaf === 'A' ? -rad(s.prot) : Math.PI, s.leaf === 'A' ? 0 : Math.PI + rad(s.prot)); g.stroke();
    }
    g.restore();
    g.fillStyle = '#111'; g.font = `700 12px ${MONO}`;
    g.fillText('A', cx - R * 0.6, cy + 46); g.fillText('B', cx + R * 0.48, cy + 46);
  }, []);
  const aligned = Math.abs(lao - VIEW.lao) <= 5 && Math.abs(cran - VIEW.cran) <= 5;
  const record = () => {
    const n = { ...rec, [leaf]: prot, alignedAt: { ...(rec.alignedAt || {}), [leaf]: aligned }, phaseAt: { ...(rec.phaseAt || {}), [leaf]: phase } };
    setRec(n);
  };
  const ready = rec.A != null && rec.B != null;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer">
        <canvas ref={ref} className="cs-canvas" style={{ height: 300 }} aria-label="Cinefluoroscopy of a bileaflet mechanical valve" />
        <div className="cs-viewer-hud">{label || 'CINE · 15 fps'}</div>
        <div className="cs-viewer-hud r">{lao >= 0 ? `LAO ${lao}°` : `RAO ${-lao}°`} · {cran >= 0 ? `CRA ${cran}°` : `CAU ${-cran}°`}</div>
        <div className="cs-viewer-hud b">{phase === 'live' ? 'live' : `frozen · ${phase}`}{aligned ? ' · ring edge-on ✓' : ''}</div>
      </div>
      {!fixed && (
        <>
          <div className="cs-ctrls">
            <label className="cs-slider" style={{ flex: 1 }}>RAO<input type="range" min="-40" max="40" step="1" value={lao} disabled={!!done} onChange={e => setLao(+e.target.value)} style={{ width: '100%' }} aria-label="RAO–LAO angulation" />LAO</label>
          </div>
          <div className="cs-ctrls">
            <label className="cs-slider" style={{ flex: 1 }}>CAU<input type="range" min="-40" max="40" step="1" value={cran} disabled={!!done} onChange={e => setCran(+e.target.value)} style={{ width: '100%' }} aria-label="Caudal–cranial angulation" />CRA</label>
          </div>
        </>
      )}
      <div className="cs-ctrls">
        {['live', 'diastole', 'systole'].map(p => <button key={p} className={'cs-chip' + (phase === p ? ' on' : '')} onClick={() => setPhase(p)}>{p === 'live' ? '▶ Live' : `❚❚ Freeze in ${p}`}</button>)}
      </div>
      {measure && (
        <>
          <div className="cs-ctrls">
            {['A', 'B'].map(k => <button key={k} className={'cs-chip' + (leaf === k ? ' on' : '')} disabled={!!done} onClick={() => setLeaf(k)}>Leaflet {k}</button>)}
            <label className="cs-slider" style={{ flex: 1 }}>Protractor
              <input type="range" min="0" max="90" step="1" value={prot} disabled={!!done} onChange={e => setProt(+e.target.value)} style={{ width: '100%' }} aria-label="Protractor angle" />
            </label>
            <span className="cs-mono" style={{ color: 'var(--gold)' }}>{prot}°</span>
          </div>
          <div className="cs-ctrls">
            <button className="cs-btn" disabled={!!done} onClick={record}>📐 Record leaflet {leaf}</button>
            <button className="cs-btn primary" disabled={!!done || !ready} onClick={() => onResult?.({ A: rec.A, B: rec.B, aligned: !!(rec.alignedAt?.A && rec.alignedAt?.B), phase: rec.phaseAt })}>Report the angles</button>
          </div>
          <div className="cs-readout">
            <div><span>Leaflet A</span><b>{rec.A != null ? `${rec.A}°` : '—'}</b></div>
            <div><span>Leaflet B</span><b>{rec.B != null ? `${rec.B}°` : '—'}</b></div>
            <div><span>View</span><b style={{ color: aligned ? 'var(--green)' : 'var(--amber)' }}>{aligned ? 'edge-on' : 'oblique'}</b></div>
          </div>
          <p className="cs-pts" style={{ marginTop: 8 }}>Steer until the ring is a straight line and both leaflets are crisp lines — only then are the angles true. Freeze the frame in which a mitral valve is OPEN, then lay the protractor along each leaflet and record it.</p>
        </>
      )}
    </div>
  );
}

/* ---------- 4 · obstructive prosthetic valve thrombosis: the pathway ---------- */

const PVT_FIELDS = [
  { id: 'obs', label: 'Obstruction', opts: [['obs', 'Obstructive'], ['non', 'Non-obstructive']] },
  { id: 'side', label: 'Side', opts: [['left', 'Left-sided'], ['right', 'Right-sided']] },
  { id: 'state', label: 'Clinical state', opts: [['crit', 'Critically ill / shock'], ['sev', 'NYHA III–IV, stabilised'], ['mild', 'NYHA I–II']] },
  { id: 'surg', label: 'Surgery', opts: [['ok', 'Available, acceptable risk'], ['high', 'Very high risk or unavailable']] },
  { id: 'size', label: 'Thrombus area (TOE)', opts: [['small', '< 0.8 cm²'], ['large', '≥ 0.8 cm²']] },
  { id: 'ci', label: 'Lysis contraindication', opts: [['none', 'None'], ['yes', 'Present']] },
];
export function PvtPathway({ truth, onResult, done }) {
  const [v, setV] = useState({ obs: 'obs', side: 'left', state: 'crit', surg: 'ok', size: 'large', ci: 'none' });
  let rec, tone = 'ok';
  if (v.obs === 'non') rec = 'Non-obstructive: optimise anticoagulation (IV unfractionated heparin; VKA to target) and repeat TOE. Surgery if a large (≥ 10 mm) thrombus embolises or persists despite optimal anticoagulation.';
  else if (v.side === 'right') rec = 'Right-sided obstructive thrombosis: fibrinolysis is the first choice — an embolus goes to the lung, not the brain.';
  else if (v.ci === 'yes') { rec = 'Lysis contraindicated: surgery, even at high risk — or palliation if surgery is truly prohibitive.'; tone = 'wrong'; }
  else if (v.surg === 'ok') rec = 'Urgent or emergency redo valve surgery (ESC/EACTS: class I when surgical risk is acceptable). AHA/ACC 2020 also accepts slow-infusion low-dose fibrinolysis as first-line in selected patients — a heart-team call.';
  else { rec = `Fibrinolysis — a slow-infusion, low-dose alteplase regimen under TOE/fluoroscopic control. ${v.size === 'large' ? 'A thrombus ≥ 0.8 cm² carries a higher embolic and death risk with lysis: weigh it with the team.' : 'A small thrombus (< 0.8 cm²) without prior stroke is the profile in which lysis is safest.'}${v.state === 'crit' ? ' In shock, a faster regimen may be needed if surgery is impossible.' : ''}`; tone = 'best'; }
  const hits = truth ? PVT_FIELDS.filter(f => v[f.id] === truth[f.id]).length : 0;
  return (
    <div className="cs-card tight">
      {PVT_FIELDS.map(f => (
        <div key={f.id} className="cs-ctrls" style={{ alignItems: 'center' }}>
          <span className="cs-pts" style={{ minWidth: 150 }}>{f.label}</span>
          {f.opts.map(([k, l]) => <button key={k} className={'cs-chip' + (v[f.id] === k ? ' on' : '')} disabled={!!done} onClick={() => setV({ ...v, [f.id]: k })}>{l}</button>)}
        </div>
      ))}
      <div className={'cs-fb ' + tone} style={{ marginTop: 10 }}><b>Pathway → </b>{rec}</div>
      {truth && <div className="cs-row" style={{ marginTop: 10 }}>
        <button className="cs-btn primary" disabled={!!done} onClick={() => onResult?.({ hits, of: PVT_FIELDS.length, v })}>Lock in her profile</button>
        {done && <span className="cs-pts">{done.hits}/{done.of} features set correctly</span>}
      </div>}
    </div>
  );
}

/* ---------- 5 · slow-infusion low-dose alteplase, hour by hour ---------- */

const RATES = [
  { id: 'r42', label: '4.2 mL/h', ok: true, why: '25 mg in 25 mL (1 mg/mL) over 6 h = 4.2 mL/h. No bolus.' },
  { id: 'r1', label: '1.0 mL/h', ok: false, why: 'That is the ultraslow 25-hour regimen — not the plan the team agreed.' },
  { id: 'r42b', label: '42 mL/h', ok: false, why: 'Ten times the rate: 25 mg in 36 minutes. A decimal-point error is how lysis kills.' },
  { id: 'bolus', label: '10 mL bolus, then 90 mL/h', ok: false, why: 'The old full-dose regimen (10 mg bolus + 90 mg over 90 min) — higher stroke and bleeding rates.' },
];
/** onResult({ rateOk, missed, oozeOk, next, b }) — b is the final leaflet B opening angle. */
export function LysisRun({ onResult, onProgress, done }) {
  const [rate, setRate] = useState(null);
  const [hour, setHour] = useState(0);
  const [checked, setChecked] = useState(false);
  const [missed, setMissed] = useState(0);
  const [ooze, setOoze] = useState(null);
  const [next, setNext] = useState(null);
  const [dose2, setDose2] = useState(false);
  const rateOk = RATES.find(r => r.id === rate)?.ok;
  const bAngle = dose2 ? 83 : 35 + (52 - 35) * Math.min(1, hour / 6);
  const grad = dose2 ? 5 : Math.round(16 - (16 - 11) * Math.min(1, hour / 6));
  useEffect(() => { onProgress?.({ hour, dose2, bAngle, grad }); }, [hour, dose2]);  // eslint-disable-line
  const advance = () => {
    if (!checked) setMissed(m => m + 1);
    setChecked(false);
    setHour(hh => hh + 1);
  };
  const atOoze = hour === 3 && ooze == null;
  const finished = hour >= 6;
  const log = [];
  for (let k = 1; k <= Math.min(hour, 6); k++) log.push(k);
  return (
    <div className="cs-card tight">
      <CineFluoro fixed measure={false} bOpen={bAngle} label={dose2 ? 'AFTER DOSE 2' : `DOSE 1 · HOUR ${Math.min(hour, 6)}`} />
      <div className="cs-readout">
        <div><span>Alteplase given</span><b>{dose2 ? 50 : Math.round(25 * Math.min(1, hour / 6))} mg</b></div>
        <div><span>Mean gradient</span><b style={{ color: grad > 10 ? 'var(--red)' : 'var(--green)' }}>{grad} mmHg</b></div>
        <div><span>Leaflet B opens</span><b>{Math.round(bAngle)}°</b></div>
        <div><span>Missed checks</span><b style={{ color: missed ? 'var(--amber)' : 'var(--green)' }}>{missed}</b></div>
      </div>
      {!rate && (
        <>
          <p className="cs-q" style={{ marginTop: 12 }}>💉 Alteplase 25 mg made up to 25 mL (1 mg/mL). Set the pump for 25 mg over 6 hours.</p>
          <div className="cs-row">{RATES.map(r => <button key={r.id} className="cs-chip" disabled={!!done} onClick={() => setRate(r.id)}>{r.label}</button>)}</div>
        </>
      )}
      {rate && <div className={'cs-fb ' + (rateOk ? 'best' : 'wrong')} style={{ marginTop: 10 }}>{RATES.find(r => r.id === rate).why}{!rateOk && ' The pharmacist catches it at the double-check: the pump is reset to 4.2 mL/h before the infusion starts.'}</div>}
      {rate && !finished && !atOoze && (
        <div className="cs-ctrls" style={{ marginTop: 10 }}>
          <button className={'cs-btn' + (checked ? '' : ' primary')} disabled={checked || !!done} onClick={() => setChecked(true)}>🧠 Hourly checks: GCS & pupils, limbs, speech · BP · bleeding sites</button>
          <button className={'cs-btn' + (checked ? ' primary' : '')} disabled={!!done} onClick={advance}>⏩ Advance 1 hour</button>
        </div>
      )}
      {atOoze && (
        <div className="cs-card" style={{ marginTop: 10, borderColor: 'var(--amber)' }}>
          <p className="cs-q">Hour 3: the cannula site in her left forearm is oozing; GCS 15, BP 118/70, no headache. You…</p>
          <div className="cs-row">
            <button className="cs-btn" onClick={() => setOoze('press')}>Firm pressure and a dressing; continue the infusion; recheck in 15 minutes</button>
            <button className="cs-btn" onClick={() => setOoze('stop')}>Stop the alteplase</button>
          </div>
        </div>
      )}
      {ooze && <div className={'cs-fb ' + (ooze === 'press' ? 'best' : 'wrong')} style={{ marginTop: 8 }}>{ooze === 'press' ? 'Right: minor, compressible bleeding is expected. Stop for major bleeding, neurological change or anaphylaxis.' : 'Too much for a compressible ooze — it would leave her valve stuck. Pressure, dressing, continue; it is restarted after the senior review.'}</div>}
      {log.length > 0 && <p className="cs-pts" style={{ marginTop: 8 }}>Hours run: {log.join(' · ')}{finished ? ' — dose 1 complete.' : ''}</p>}
      {finished && next == null && (
        <div className="cs-card" style={{ marginTop: 10 }}>
          <p className="cs-q">End of dose 1: leaflet B now opens to ~52° (normal 85°), mean gradient 11 mmHg, thrombus smaller on TOE, no neurological change. Next?</p>
          <div className="cs-row">
            <button className="cs-btn" onClick={() => setNext('repeat')}>Restart heparin, then a second 25 mg / 6 h dose; re-image after it</button>
            <button className="cs-btn" onClick={() => setNext('stop')}>Stop — it has improved enough</button>
            <button className="cs-btn" onClick={() => setNext('full')}>Give 100 mg full-dose now to finish it</button>
            <button className="cs-btn" onClick={() => setNext('surg')}>Abandon lysis — refer for surgery</button>
          </div>
        </div>
      )}
      {next && (
        <div className={'cs-fb ' + (next === 'repeat' ? 'best' : next === 'surg' ? 'ok' : 'wrong')} style={{ marginTop: 8 }}>
          {next === 'repeat' && 'Right: partial response is the commonest result of a single low-dose infusion; the protocols repeat it (up to ~6–8 doses, cumulative ≤ 150 mg), imaging after each.'}
          {next === 'stop' && 'A half-open leaflet and a gradient of 11 is residual obstruction — and residual thrombus that re-grows. The team gives the second dose.'}
          {next === 'full' && 'Switching to full dose after a partial response throws away the safety the slow regimen bought. The team gives the second low-dose infusion.'}
          {next === 'surg' && 'Reasonable if lysis were failing — but it is working, and her surgical risk has not changed. The team gives the second dose.'}
        </div>
      )}
      {next && !dose2 && (
        <div className="cs-row" style={{ marginTop: 10 }}>
          <button className="cs-btn primary" disabled={!!done} onClick={() => { setDose2(true); onResult?.({ rateOk, missed, oozeOk: ooze === 'press', next, b: 83 }); }}>▶ Run dose 2 (25 mg over 6 h, hourly checks) and re-image</button>
        </div>
      )}
      {dose2 && <div className="cs-fb best" style={{ marginTop: 8 }}>After dose 2: leaflet B opens to 83°, both opening clicks are back, mean gradient 5 mmHg, PHT 95 ms. TOE: a 2 mm residual strand only.</div>}
    </div>
  );
}

/* ---------- 6 · the INR log ---------- */

/** points: [{ label, inr }], band [lo, hi], aim. */
export function InrChart({ points, band = [2.5, 3.5], aim = 3 }) {
  const W = 560, H = 200, x0 = 40, y = v => H - 24 - v / 6 * (H - 40), x = i => x0 + (i + 0.5) * ((W - x0 - 10) / Math.max(points.length, 6));
  return (
    <div className="cs-card tight">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="INR log against the target range">
        <rect x={x0} y={y(band[1])} width={W - x0 - 10} height={y(band[0]) - y(band[1])} fill="rgba(52,227,154,0.14)" stroke="rgba(52,227,154,0.4)" />
        {[0, 1, 2, 3, 4, 5, 6].map(v => <g key={v}><line x1={x0} x2={W - 10} y1={y(v)} y2={y(v)} stroke="#182841" /><text x={8} y={y(v) + 4} fill="#6A7F9B" fontSize="11" fontFamily={MONO}>{v}</text></g>)}
        <line x1={x0} x2={W - 10} y1={y(aim)} y2={y(aim)} stroke="#34E39A" strokeDasharray="5 4" />
        <text x={W - 120} y={y(band[1]) - 6} fill="#34E39A" fontSize="11" fontFamily={MONO}>target {band[0]}–{band[1]}</text>
        <polyline fill="none" stroke="#22D3EE" strokeWidth="2" points={points.map((p, i) => `${x(i)},${y(p.inr)}`).join(' ')} />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.inr)} r="5" fill={p.inr < band[0] ? '#F5C451' : p.inr > band[1] ? '#FF4D6D' : '#34E39A'} />
            <text x={x(i)} y={y(p.inr) - 10} textAnchor="middle" fill="#E9F2FC" fontSize="11" fontFamily={MONO}>{p.inr.toFixed(1)}</text>
            <text x={x(i)} y={H - 6} textAnchor="middle" fill="#9FB4C6" fontSize="10" fontFamily={MONO}>{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
