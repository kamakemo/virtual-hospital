import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from './Monitor.jsx';

/* ============================================================
   PHYSIOLOGY SIMULATORS
   Barbeau test (thumb plethysmography during radial
   compression), coronary pressure wire (Pa/Pd, resting ratio,
   adenosine hyperaemia, pullback), an inflation device with the
   balloon's compliance chart, and a subcostal echo of a
   pericardial effusion.
   ============================================================ */

/* ---------- Barbeau ---------- */

const BARBEAU = {
  A: 'Type A — no damping of the pleth when the radial is compressed',
  B: 'Type B — damped pleth that fully recovers within 2 minutes',
  C: 'Type C — loss of the pleth, which returns within 2 minutes',
  D: 'Type D — loss of the pleth with no recovery in 2 minutes',
};

export function Barbeau({ type = 'B' }) {
  const ref = useRef(null);
  const [phase, setPhase] = useState('baseline');   // baseline | radial | both
  const [t0, setT0] = useState(0);
  const state = useRef({ phase, t0 });
  state.current = { phase, t0 };

  // amplitude over (time-lapsed) seconds of radial compression, per Barbeau type
  const amp = (sec) => {
    const s = state.current.phase;
    if (s === 'baseline') return 1;
    if (s === 'both') return 0.02;
    const k = Math.min(1, sec / 90);
    if (type === 'A') return 1;
    if (type === 'B') return 0.45 + 0.55 * k;
    if (type === 'C') return sec < 25 ? 0.03 : Math.min(1, 0.03 + (sec - 25) / 60);
    return 0.03;
  };

  useCanvas(ref, 150, (g, w, h, t) => {
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#13212D'; g.lineWidth = 1;
    for (let y = 20; y < h; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    const elapsed = state.current.phase === 'radial' ? (performance.now() - state.current.t0) / 1000 * 6 : 0; // 6× time-lapse
    g.strokeStyle = '#3ED0F5'; g.lineWidth = 2; g.beginPath();
    for (let x = 0; x < w; x += 1.5) {
      const ago = (w - x) / 90;
      const sec = Math.max(0, elapsed - ago * 6);
      const a = amp(sec);
      const ph = ((t - ago) * 1.4) % 1;
      const v = ph < 0.22 ? Math.sin(ph / 0.22 * Math.PI / 2) : Math.max(0, 1 - (ph - 0.22) * 1.25);
      const y = h - 24 - v * a * 90;
      x ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
    g.fillStyle = '#9FB4C6'; g.font = '600 11px "IBM Plex Mono", monospace';
    const label = state.current.phase === 'baseline' ? 'BASELINE — thumb SpO₂ 98%'
      : state.current.phase === 'both' ? 'RADIAL + ULNAR COMPRESSED'
      : `RADIAL COMPRESSED · ${Math.min(120, Math.round(elapsed))} s (time-lapse)`;
    g.fillText(label, 10, 16);
  }, [type]);

  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 150 }} aria-label="Thumb plethysmograph" /></div>
      <div className="cs-ctrls">
        <button className="cs-btn" onClick={() => { setPhase('radial'); setT0(performance.now()); }}>Compress the radial artery</button>
        <button className="cs-btn" onClick={() => setPhase('both')}>Compress radial + ulnar</button>
        <button className="cs-btn" onClick={() => setPhase('baseline')}>Release</button>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Pulse oximeter on the right thumb. Compress for the full two minutes and watch what the ulnar collateral does to the waveform.</p>
    </div>
  );
}
export { BARBEAU };

/* ---------- pressure wire: FFR / resting ratio ---------- */

/**
 * stage: 'guide' (sensor at the guide tip, before equalising) → 'equal'
 * → 'distal' (resting) → 'hyper' (IV adenosine) → 'pullback'.
 * The lesion sets the pressure loss: resting Pd/Pa, iFR and FFR.
 */
export function PressureWire({ lesion, onReading }) {
  const ref = useRef(null);
  const [stage, setStage] = useState('guide');
  const [startedHyper, setStartedHyper] = useState(0);
  const st = useRef({ stage, startedHyper });
  st.current = { stage, startedHyper };
  const [reads, setReads] = useState({});

  const ratio = () => {
    const s = st.current.stage;
    if (s === 'guide') return { pa: 96, pd: 93 };        // drift before equalisation
    if (s === 'equal') return { pa: 96, pd: 96 };
    if (s === 'distal') return { pa: 96, pd: 96 * lesion.rest };
    if (s === 'hyper' || s === 'pullback') {
      const k = Math.min(1, (performance.now() - st.current.startedHyper) / 9000);  // hyperaemia builds over ~60–90 s, compressed
      const pa = 96 - 8 * k;
      const r = lesion.rest + (lesion.ffr - lesion.rest) * k;
      return { pa, pd: pa * r, k };
    }
    return { pa: 96, pd: 96 };
  };

  useCanvas(ref, 190, (g, w, h, t) => {
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const y = mm => h - 16 - (mm - 30) / 110 * (h - 30);
    g.strokeStyle = '#13212D';
    for (const v of [40, 60, 80, 100, 120]) { g.beginPath(); g.moveTo(0, y(v)); g.lineTo(w, y(v)); g.stroke(); g.fillStyle = '#3B4B5A'; g.font = '10px "IBM Plex Mono"'; g.fillText(v, 4, y(v) - 2); }
    const r = ratio();
    const wave = (ph) => { const x = ph % 1; return x < 0.12 ? Math.sin(x / 0.12 * Math.PI / 2) : x < 0.3 ? 1 - (x - 0.12) * 1.3 : Math.max(0, 0.78 - (x - 0.3) * 1.15); };
    const draw = (mean, color, pulse) => {
      g.strokeStyle = color; g.lineWidth = 1.8; g.beginPath();
      for (let x = 30; x < w; x += 1.5) {
        const ph = (t - (w - x) / 120) * 1.3;
        const v = mean + (wave(ph) - 0.42) * pulse;
        const yy = y(v);
        x === 30 ? g.moveTo(x, yy) : g.lineTo(x, yy);
      }
      g.stroke();
    };
    draw(r.pa, '#FF5A52', 50);
    draw(r.pd, '#F2D24B', 50 * (r.pd / r.pa) * 0.9);
    g.font = '600 11px "IBM Plex Mono", monospace';
    g.fillStyle = '#FF5A52'; g.fillText(`Pa ${Math.round(r.pa)}`, w - 150, 16);
    g.fillStyle = '#F2D24B'; g.fillText(`Pd ${Math.round(r.pd)}`, w - 80, 16);
    g.fillStyle = '#CFE3F2'; g.font = '700 15px "IBM Plex Mono", monospace';
    g.fillText(`Pd/Pa ${(r.pd / r.pa).toFixed(2)}`, 40, 18);
  }, [lesion.rest, lesion.ffr]);

  const go = (s) => {
    setStage(s);
    if (s === 'hyper') {
      setStartedHyper(performance.now());
      setTimeout(() => { const v = { ...reads, ffr: lesion.ffr }; setReads(v); onReading?.(v); }, 9500);
    }
    if (s === 'distal') { const v = { ...reads, rest: lesion.rest, ifr: lesion.ifr }; setReads(v); onReading?.(v); }
  };

  return (
    <div className="cs-card tight">
      <div className="cs-viewer">
        <canvas ref={ref} className="cs-canvas" style={{ height: 190 }} aria-label="Aortic and distal coronary pressure" />
        <div className="cs-viewer-hud b">{{
          guide: 'Sensor at the guide tip — not yet equalised',
          equal: 'Equalised: Pd = Pa at the guide tip (introducer out, flushed, no ostial damping)',
          distal: 'Sensor 2–3 cm distal to the lesion, at rest',
          hyper: 'IV adenosine 140 µg/kg/min — steady-state hyperaemia',
          pullback: 'Slow pullback: the pressure step sits at the lesion',
        }[stage]}</div>
      </div>
      <div className="cs-ctrls">
        <button className="cs-btn" onClick={() => go('equal')} disabled={stage !== 'guide'}>1 · Equalise at the guide tip</button>
        <button className="cs-btn" onClick={() => go('distal')} disabled={stage !== 'equal'}>2 · Advance sensor distal · resting</button>
        <button className="cs-btn" onClick={() => go('hyper')} disabled={stage !== 'distal'}>3 · Start IV adenosine</button>
        <button className="cs-btn" onClick={() => go('pullback')} disabled={stage !== 'hyper' || reads.ffr == null}>4 · Pullback</button>
      </div>
      <div className="cs-readout">
        <div><span>Resting Pd/Pa</span><b>{reads.rest != null ? reads.rest.toFixed(2) : '—'}</b></div>
        <div><span>iFR</span><b style={{ color: reads.ifr != null ? (reads.ifr <= 0.89 ? 'var(--red)' : 'var(--green)') : undefined }}>{reads.ifr != null ? reads.ifr.toFixed(2) : '—'}</b></div>
        <div><span>FFR</span><b style={{ color: reads.ffr != null ? (reads.ffr <= 0.8 ? 'var(--red)' : 'var(--green)') : undefined }}>{reads.ffr != null ? reads.ffr.toFixed(2) : stage === 'hyper' ? '…' : '—'}</b></div>
        <div><span>Drift check</span><b>{stage === 'pullback' ? '0.99' : '—'}</b></div>
      </div>
      {stage === 'hyper' && <p className="cs-pts" style={{ marginTop: 8, color: 'var(--amber)' }}>Patient: “I feel flushed… a bit short of breath.” — expected with adenosine; transient AV block is possible.</p>}
    </div>
  );
}

/* ---------- pressure at the catheter tip ---------- */

const CATH_MODES = {
  aortic: { sys: 128, dia: 72, label: 'Aortic pressure — sharp upstroke, dicrotic notch, diastolic held up by the aortic valve' },
  damped: { sys: 96, dia: 70, label: 'DAMPED — systolic falls, pulse pressure narrows, the notch blurs: the tip is against a wall or in an ostial stenosis' },
  ventricular: { sys: 122, dia: 12, label: 'VENTRICULARISED — diastolic falls toward zero and rises through diastole, like an LV trace: the tip is wedged, flow beyond it has stopped' },
};

/** What the pressure transducer on the guide shows, beat by beat; mode morphs smoothly. */
export function CatheterPressure({ mode = 'aortic', note }) {
  const ref = useRef(null);
  const live = useRef({ ...CATH_MODES.aortic, k: 0 });
  const target = useRef(mode);
  target.current = mode;
  useCanvas(ref, 170, (g, w, h, t) => {
    const T = CATH_MODES[target.current];
    const L = live.current;
    L.sys += (T.sys - L.sys) * 0.09; L.dia += (T.dia - L.dia) * 0.09;
    L.k += ((target.current === 'ventricular' ? 1 : 0) - L.k) * 0.09;
    const notch = target.current === 'aortic' ? 1 : target.current === 'damped' ? 0.3 : 0;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const y = mm => h - 14 - mm / 160 * (h - 28);
    g.strokeStyle = '#13212D'; g.font = '10px "JetBrains Mono", monospace';
    for (const v of [0, 40, 80, 120, 160]) { g.beginPath(); g.moveTo(30, y(v)); g.lineTo(w, y(v)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(v, 4, y(v) + 3); }
    const aort = x => x < 0.12 ? Math.sin(x / 0.12 * Math.PI / 2) : x < 0.3 ? 1 - (x - 0.12) * 1.3 : x < 0.33 ? 0.77 - notch * 0.1 + (x - 0.3) * 3 * notch : Math.max(0, 0.82 - (x - 0.33) * 1.2);
    const vent = x => x < 0.1 ? Math.sin(x / 0.1 * Math.PI / 2) : x < 0.32 ? 1 - (x - 0.1) * 0.6 : x < 0.42 ? Math.max(0, 0.87 - (x - 0.32) * 8.7) : (x - 0.42) * 0.14;
    g.strokeStyle = '#FF5A52'; g.lineWidth = 2; g.beginPath();
    for (let x = 30; x < w; x += 1.5) {
      const ph = ((t - (w - x) / 130) * 1.25) % 1;
      const p = ph < 0 ? ph + 1 : ph;
      const shape = aort(p) * (1 - L.k) + vent(p) * L.k;
      const v = L.dia + (L.sys - L.dia) * shape;
      x === 30 ? g.moveTo(x, y(v)) : g.lineTo(x, y(v));
    }
    g.stroke();
    g.fillStyle = '#FF5A52'; g.font = '700 16px "JetBrains Mono", monospace';
    g.fillText(`${Math.round(L.sys)}/${Math.round(L.dia)}`, w - 100, 22);
  }, []);
  return (
    <div className="cs-card tight">
      <div className="cs-viewer">
        <canvas ref={ref} className="cs-canvas" style={{ height: 170 }} aria-label="Pressure at the catheter tip" />
        <div className="cs-viewer-hud">P · CATHETER TIP</div>
        <div className="cs-viewer-hud b" style={{ color: mode === 'aortic' ? '#9FB4C6' : '#FF8A80' }}>{CATH_MODES[mode].label}</div>
      </div>
      {note && <p className="cs-pts" style={{ marginTop: 8 }}>{note}</p>}
    </div>
  );
}

/* ---------- inflation device ---------- */

/**
 * The indeflator: hold to inflate, release to hold pressure, deflate to
 * zero. Diameter comes from the device's compliance chart. Reports the
 * peak pressure reached on deflation.
 */
export function Inflator({ label, compliance, nominal, rbp, max = 26, onDeflate, disabled }) {
  const [p, setP] = useState(0);
  const [peak, setPeak] = useState(0);
  const timer = useRef(null);
  const press = () => {
    if (disabled) return;
    clearInterval(timer.current);
    timer.current = setInterval(() => setP(v => { const n = Math.min(max, v + 0.5); setPeak(k => Math.max(k, n)); return n; }), 180);
  };
  const release = () => clearInterval(timer.current);
  useEffect(() => () => clearInterval(timer.current), []);
  const dia = diameterAt(compliance, p);
  const angle = -120 + (p / 30) * 240;
  const over = p > rbp;
  return (
    <div className="cs-card tight">
      <div className="cs-grid2" style={{ alignItems: 'center' }}>
        <div style={{ display: 'grid', justifyItems: 'center' }}>
          <svg viewBox="0 0 200 150" width="100%" style={{ maxWidth: 260 }} aria-label={`Pressure ${p} atmospheres`}>
            <path d="M30 120 A75 75 0 1 1 170 120" fill="none" stroke="#22323F" strokeWidth="14" strokeLinecap="round" />
            <path d="M30 120 A75 75 0 1 1 170 120" fill="none" stroke={over ? '#FF5A52' : '#4FB8CC'} strokeWidth="14" strokeLinecap="round"
              strokeDasharray={`${(p / 30) * 392} 400`} />
            {[0, 5, 10, 15, 20, 25, 30].map(v => {
              const a = (-120 + v / 30 * 240 - 90) * Math.PI / 180;
              return <text key={v} x={100 + Math.cos(a) * 58} y={98 + Math.sin(a) * 58} fill="#6F8396" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">{v}</text>;
            })}
            <line x1="100" y1="96" x2={100 + Math.cos((angle - 90) * Math.PI / 180) * 62} y2={96 + Math.sin((angle - 90) * Math.PI / 180) * 62} stroke="#FFB020" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="96" r="6" fill="#FFB020" />
            <text x="100" y="140" textAnchor="middle" fill="#E6EEF5" fontSize="20" fontFamily="IBM Plex Mono" fontWeight="700">{p.toFixed(1)} atm</text>
          </svg>
          <div className="cs-row" style={{ justifyContent: 'center' }}>
            <button className="cs-btn primary cs-hold" disabled={disabled}
              onPointerDown={e => { e.currentTarget.setPointerCapture?.(e.pointerId); press(); }}
              onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
              onContextMenu={e => e.preventDefault()}
              onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && press()} onKeyUp={release}>
              Hold to inflate
            </button>
            <button className="cs-btn" disabled={disabled || p === 0} onClick={() => { release(); onDeflate?.(peak, diameterAt(compliance, peak)); setP(0); setPeak(0); }}>Deflate</button>
          </div>
        </div>
        <div>
          <div className="cs-pts" style={{ marginBottom: 6 }}>{label} — compliance chart</div>
          <table className="cs-table">
            <thead><tr><th>atm</th><th>Ø mm</th><th /></tr></thead>
            <tbody>
              {compliance.map(([a, d]) => (
                <tr key={a} style={{ background: Math.abs(a - p) < 1 ? 'rgba(79,184,204,0.12)' : undefined }}>
                  <td className="num">{a}</td><td className="num">{d.toFixed(2)}</td>
                  <td style={{ fontSize: 11, color: a === nominal ? 'var(--green)' : a === rbp ? 'var(--red)' : 'var(--ink3)' }}>{a === nominal ? 'nominal' : a === rbp ? 'RBP' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cs-readout"><div><span>Balloon Ø now</span><b>{dia.toFixed(2)} mm</b></div><div><span>Peak</span><b>{peak.toFixed(1)}</b></div></div>
          {over && <p className="cs-pts" style={{ color: 'var(--red)', marginTop: 6 }}>Above rated burst pressure.</p>}
        </div>
      </div>
    </div>
  );
}
export function diameterAt(chart, p) {
  if (p <= 0) return 0;
  if (p <= chart[0][0]) return chart[0][1] * (p / chart[0][0]) ** 0.35;
  for (let i = 1; i < chart.length; i++) {
    const [a0, d0] = chart[i - 1], [a1, d1] = chart[i];
    if (p <= a1) return d0 + (d1 - d0) * (p - a0) / (a1 - a0);
  }
  const [aL, dL] = chart[chart.length - 1];
  return dL + (p - aL) * 0.012;
}

/* ---------- echo: subcostal four-chamber with effusion ---------- */

export function Echo({ effusion = 0, tamponade = false, label }) {
  const ref = useRef(null);
  const P = useRef({ effusion, tamponade });
  P.current = { effusion, tamponade };
  useCanvas(ref, 240, (g, w, h, t) => {
    const { effusion: e, tamponade: tp } = P.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    // sector
    const cx = w / 2, cy = 4, R = h * 1.05;
    g.save();
    g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, Math.PI * 0.5 - 0.62, Math.PI * 0.5 + 0.62); g.closePath(); g.clip();
    for (let i = 0; i < 2600; i++) {
      const a = Math.PI / 2 + (Math.random() - 0.5) * 1.24, r = Math.random() * R;
      g.fillStyle = `rgba(200,200,200,${Math.random() * 0.12})`;
      g.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 2);
    }
    // liver near field
    g.fillStyle = 'rgba(150,150,150,0.35)';
    g.beginPath(); g.ellipse(cx - 20, 50, w * 0.45, 42, 0, 0, Math.PI * 2); g.fill();
    const beat = (Math.sin(t * 2 * Math.PI * 1.6) + 1) / 2;   // 0 systole → 1 diastole
    const heartY = 130 + e * 1.4;
    // effusion: echo-free space around the heart
    if (e > 0) {
      g.fillStyle = '#000';
      g.beginPath(); g.ellipse(cx, heartY, 118 + e * 2.2, 62 + e * 2, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(230,230,230,0.7)'; g.lineWidth = 3;
      g.beginPath(); g.ellipse(cx, heartY, 118 + e * 2.2, 62 + e * 2, 0, 0, Math.PI * 2); g.stroke();   // pericardium
    }
    // myocardium + chambers
    g.fillStyle = 'rgba(170,170,170,0.55)';
    g.beginPath(); g.ellipse(cx, heartY, 112, 58, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#050505';
    // RV free wall: in tamponade it buckles inward in early diastole
    const rvCollapse = tp ? Math.max(0, beat - 0.45) * 26 : 0;
    g.beginPath(); g.ellipse(cx - 46, heartY - 18 + rvCollapse * 0.4, 44, 22 - rvCollapse * 0.55, -0.15, 0, Math.PI * 2); g.fill();   // RV
    g.beginPath(); g.ellipse(cx + 44, heartY + 4, 40 - beat * 6, 30 - beat * 4, 0.2, 0, Math.PI * 2); g.fill();                   // LV
    g.beginPath(); g.ellipse(cx - 40, heartY + 34, 26, 16, 0, 0, Math.PI * 2); g.fill();                                            // RA
    g.beginPath(); g.ellipse(cx + 38, heartY + 40, 24, 15, 0, 0, Math.PI * 2); g.fill();                                            // LA
    g.restore();
    g.fillStyle = '#9FB4C6'; g.font = '600 11px "IBM Plex Mono", monospace';
    g.fillText('SUBCOSTAL 4C', 10, 16);
    g.fillText(e > 0 ? `Effusion ${e} mm` : 'No effusion', 10, h - 10);
    if (tp) { g.fillStyle = '#FF5A52'; g.fillText('RV diastolic collapse', w - 170, h - 10); }
    g.fillStyle = '#38E07A'; g.fillRect(w - 80, 12, 70, 2);
  });
  return (
    <figure className="cs-fig">
      <canvas ref={ref} style={{ display: 'block', width: '100%', height: 240, background: '#000' }} aria-label={label || 'Subcostal echocardiogram'} />
      {label && <figcaption>{label}</figcaption>}
    </figure>
  );
}
