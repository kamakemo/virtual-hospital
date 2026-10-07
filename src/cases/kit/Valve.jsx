import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from './Monitor.jsx';

/* ============================================================
   VALVE SIMULATORS
   Auscultation with synthesised heart sounds and bedside
   manoeuvres; continuous-wave Doppler you measure yourself;
   simultaneous LV and aortic pressures; and a transcatheter
   valve deployment on rapid pacing.
   ============================================================ */

/* ---------- auscultation ---------- */

const LESIONS = {
  'as-severe': {
    name: 'Severe aortic stenosis',
    site: 'Right upper sternal edge → radiates to both carotids',
    murmur: { start: 0.07, peak: 0.68, end: 0.96, loud: 1, freq: 420 },
    a2: 0.15, s4: true, click: false,
    carotid: 'parvus',
    notes: ['Harsh ejection murmur that peaks LATE', 'A2 soft or absent: a single, quiet S2', 'S4: a stiff, hypertrophied LV', 'Slow-rising, low-volume carotid (parvus et tardus)'],
    man: { rest: 1, valsalva: 0.6, squat: 1.25, stand: 0.7, handgrip: 0.8 },
  },
  'as-mild': {
    name: 'Mild aortic stenosis / sclerosis',
    site: 'Right upper sternal edge, little radiation',
    murmur: { start: 0.12, peak: 0.32, end: 0.7, loud: 0.5, freq: 480 },
    a2: 1, s4: false, click: true,
    carotid: 'normal',
    notes: ['Ejection click, then an EARLY-peaking murmur', 'A2 normal — the leaflets still move', 'Normal carotid upstroke'],
    man: { rest: 1, valsalva: 0.6, squat: 1.25, stand: 0.7, handgrip: 0.8 },
  },
  hcm: {
    name: 'Hypertrophic obstructive cardiomyopathy',
    site: 'Left lower sternal edge / apex — does NOT radiate to the carotids',
    murmur: { start: 0.18, peak: 0.55, end: 0.9, loud: 0.8, freq: 360 },
    a2: 1, s4: true, click: false,
    carotid: 'bisferiens',
    notes: ['Murmur LOUDER with Valsalva and standing, softer with squatting', 'Normal A2', 'Brisk, double-peaked (spike-and-dome) carotid'],
    man: { rest: 1, valsalva: 1.7, squat: 0.5, stand: 1.6, handgrip: 0.6 },
  },
  'mr-acute': {
    name: 'Acute severe MR (flail leaflet)',
    site: 'Apex — a posterior-flail jet hugs the atrial septum and can radiate to the base and neck',
    murmur: { start: 0.02, peak: 0.12, end: 0.78, loud: 0.75, freq: 300, shape: 'decrescendo' },
    a2: 1, s3: true, s4: true, click: false, carotid: 'normal',
    notes: ['Early, DECRESCENDO murmur: the small, stiff LA fills fast and the pressures equalise before S2', 'S3 and S4', 'Can be short and unimpressive — severe acute MR may sound mild', 'Pulmonary oedema with a normal-sized heart'],
    man: { rest: 1, valsalva: 0.6, squat: 1.2, stand: 0.7, handgrip: 1.35 },
  },
  'mr-chronic': {
    name: 'Chronic severe MR',
    site: 'Apex → axilla',
    murmur: { start: 0.0, peak: 0.5, end: 1.0, loud: 0.85, freq: 320, shape: 'plateau' },
    a2: 0.5, s3: true, s4: false, click: false, carotid: 'normal',
    notes: ['HOLOSYSTOLIC: from S1 into S2, flat in intensity', 'Soft S1; an S3 from torrential early-diastolic filling, not necessarily failure', 'Displaced, hyperdynamic apex'],
    man: { rest: 1, valsalva: 0.6, squat: 1.2, stand: 0.7, handgrip: 1.35 },
  },
  mvp: {
    name: 'Mitral valve prolapse',
    site: 'Apex',
    murmur: { start: 0.5, peak: 0.75, end: 1.0, loud: 0.5, freq: 380 },
    a2: 1, s4: false, click: true, clickAt: 0.16, carotid: 'normal',
    shift: { rest: 0, valsalva: -0.07, squat: 0.05, stand: -0.07, handgrip: 0.03 },
    notes: ['Mid-systolic CLICK, then a LATE systolic murmur', 'Valsalva / standing: smaller LV → prolapse sooner → click EARLIER, murmur LONGER', 'Squatting: bigger LV → click LATER, murmur shorter'],
    man: { rest: 1, valsalva: 1.15, squat: 0.8, stand: 1.15, handgrip: 1.2 },
  },
  normal: {
    name: 'Normal heart sounds', site: '—', murmur: null, a2: 1, s4: false, click: false, carotid: 'normal',
    notes: ['S1, S2, nothing between'], man: { rest: 1, valsalva: 1, squat: 1, stand: 1, handgrip: 1 },
  },
};
const MANOEUVRES = [
  { id: 'rest', label: 'At rest', why: '' },
  { id: 'valsalva', label: 'Valsalva', why: 'Strain lowers venous return: the LV gets smaller.' },
  { id: 'squat', label: 'Squat', why: 'Squatting raises venous return and afterload: the LV gets bigger.' },
  { id: 'stand', label: 'Squat → stand', why: 'Standing suddenly drops venous return: the LV gets smaller.' },
  { id: 'handgrip', label: 'Handgrip', why: 'Sustained grip raises afterload.' },
];

const HR = 68, BEAT = 60 / HR, SYS = 0.33;   // seconds

/** murmur envelope at time x (s) within the beat, 0..1 */
function murmurEnv(m, x) {
  if (!m) return 0;
  const a = m.start * SYS, b = m.end * SYS, pk = a + (b - a) * m.peak;
  if (x < a || x > b) return 0;
  if (m.shape === 'plateau') return Math.min(1, (x - a) / 0.03, (b - x) / 0.03) * 0.8;
  if (m.shape === 'decrescendo') return x < a + 0.03 ? (x - a) / 0.03 : 1 - 0.85 * (x - a - 0.03) / (b - a - 0.03);
  return x < pk ? (x - a) / (pk - a) : (b - x) / (b - pk);
}

/** The click moves with the manoeuvre in prolapse; the murmur follows it. */
function effective(les, man) {
  if (!les.shift) return { murmur: les.murmur, clickAt: les.clickAt ?? 0.06 };
  const clickAt = les.clickAt + (les.shift[man] || 0);
  return { murmur: { ...les.murmur, start: Math.min(0.9, (clickAt + 0.01) / SYS) }, clickAt };
}

export function Auscultation({ lesions = ['as-severe'], initial }) {
  const [key, setKey] = useState(initial || lesions[0]);
  const [man, setMan] = useState('rest');
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  const audio = useRef(null);
  const L = LESIONS[key];
  const gain = L.man[man];
  const S = useRef({}); S.current = { L, gain, man };

  useCanvas(ref, 220, (g, w, h, t) => {
    const { L: les, gain: gn, man: mn } = S.current;
    const eff = effective(les, mn);
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const span = BEAT * 2.2;
    const X = sec => 30 + (sec / span) * (w - 40);
    const rows = { ecg: 34, phono: 110, car: 186 };
    g.font = '600 10px "JetBrains Mono", monospace'; g.fillStyle = '#6A7F9B';
    g.fillText('ECG', 2, rows.ecg - 14); g.fillText('PCG', 2, rows.phono - 30); g.fillText('CAROTID', 2, rows.car - 22);
    // ECG for timing
    g.strokeStyle = '#38E07A'; g.lineWidth = 1.4; g.beginPath();
    for (let px = 30; px < w - 10; px += 1) {
      const sec = (px - 30) / (w - 40) * span; const x = (sec + 0.12) % BEAT - 0.12;
      const v = x > -0.11 && x < -0.03 ? Math.sin((x + 0.11) / 0.08 * Math.PI) * 0.15 : x > -0.01 && x < 0.02 ? 1 : x >= 0.02 && x < 0.04 ? -0.25 : x > 0.14 && x < 0.3 ? Math.sin((x - 0.14) / 0.16 * Math.PI) * 0.25 : 0;
      px === 30 ? g.moveTo(px, rows.ecg - v * 18) : g.lineTo(px, rows.ecg - v * 18);
    }
    g.stroke();
    // phonocardiogram: sound bursts and the murmur's shape
    for (let b = 0; b < 3; b++) {
      const t0 = b * BEAT;
      const burst = (at, amp, len = 0.035, color = '#E9F2FC') => {
        if (at > span) return;
        g.strokeStyle = color; g.lineWidth = 1.2; g.beginPath();
        for (let k = 0; k <= 40; k++) { const s = at + (k / 40) * len; const a = amp * Math.exp(-k / 14) * (k % 2 ? 1 : -1); k ? g.lineTo(X(s), rows.phono - a * 30) : g.moveTo(X(s), rows.phono); }
        g.stroke();
      };
      burst(t0 + 0.02, 0.9);                                           // S1
      if (les.click) burst(t0 + eff.clickAt, 0.45, 0.015, '#F5C451');   // click: ejection, or the mid-systolic click of prolapse
      if (les.s3) burst(t0 + SYS + 0.17, 0.3, 0.04, '#5EEAD4');          // S3: rapid early-diastolic filling
      burst(t0 + SYS + 0.03, Math.max(0.12, les.a2) * 0.85);             // S2 (A2)
      if (les.s4) burst(t0 - 0.1 + BEAT, 0.35, 0.04, '#A78BFA');         // S4, before the next S1
      if (eff.murmur) {
        g.fillStyle = `rgba(255,107,154,${0.18 + 0.25 * Math.min(1.6, gn)})`; g.strokeStyle = '#FF6B9A'; g.lineWidth = 1;
        g.beginPath();
        for (let k = 0; k <= 60; k++) {
          const x = (k / 60) * SYS; const e = murmurEnv(eff.murmur, x) * eff.murmur.loud * gn;
          const px = X(t0 + x); const jitter = (Math.sin(k * 12.9 + t * 30) * 0.5 + 0.5) * 0.35 + 0.65;
          k ? g.lineTo(px, rows.phono - e * 26 * jitter) : g.moveTo(px, rows.phono);
        }
        for (let k = 60; k >= 0; k--) { const x = (k / 60) * SYS; const e = murmurEnv(eff.murmur, x) * eff.murmur.loud * gn; g.lineTo(X(t0 + x), rows.phono + e * 26); }
        g.closePath(); g.fill(); g.stroke();
      }
    }
    g.strokeStyle = '#1B2A40'; g.beginPath(); g.moveTo(30, rows.phono); g.lineTo(w - 10, rows.phono); g.stroke();
    // carotid pulse
    g.strokeStyle = '#3ED0F5'; g.lineWidth = 1.6; g.beginPath();
    for (let px = 30; px < w - 10; px += 1) {
      const sec = (px - 30) / (w - 40) * span; const x = (sec % BEAT) / BEAT;
      let v;
      if (les.carotid === 'parvus') v = x < 0.42 ? Math.sin(x / 0.42 * Math.PI / 2) * 0.55 : Math.max(0, 0.55 - (x - 0.42) * 0.95);
      else if (les.carotid === 'bisferiens') v = x < 0.08 ? Math.sin(x / 0.08 * Math.PI / 2) : x < 0.16 ? 1 - (x - 0.08) * 4 : x < 0.3 ? 0.68 + Math.sin((x - 0.16) / 0.14 * Math.PI) * 0.18 : Math.max(0, 0.68 - (x - 0.3) * 1.1);
      else v = x < 0.12 ? Math.sin(x / 0.12 * Math.PI / 2) : Math.max(0, 1 - (x - 0.12) * 1.25);
      px === 30 ? g.moveTo(px, rows.car - v * 28) : g.lineTo(px, rows.car - v * 28);
    }
    g.stroke();
    g.fillStyle = '#9FB4C6'; g.font = '600 10px "JetBrains Mono", monospace';
    g.fillText('S1', X(0.02) - 4, rows.phono + 44); g.fillText('S2', X(SYS + 0.03) - 4, rows.phono + 44);
    if (les.s4) { g.fillStyle = '#A78BFA'; g.fillText('S4', X(BEAT - 0.1) - 4, rows.phono + 44); }
    if (les.s3) { g.fillStyle = '#5EEAD4'; g.fillText('S3', X(SYS + 0.17) - 4, rows.phono + 44); }
    if (les.shift) { g.fillStyle = '#F5C451'; g.fillText('C', X(eff.clickAt) - 3, rows.phono + 44); }
  }, []);

  // sound: S1, S2, S4, click and murmur synthesised from filtered noise
  const start = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const noise = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const thump = (at, amp, freq = 55, len = 0.07) => {
      const o = ctx.createOscillator(); o.frequency.value = freq;
      const gg = ctx.createGain(); gg.gain.setValueAtTime(0, at); gg.gain.linearRampToValueAtTime(amp, at + 0.008); gg.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(gg).connect(master); o.start(at); o.stop(at + len + 0.02);
      const n = ctx.createBufferSource(); n.buffer = noise;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 160;
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0, at); ng.gain.linearRampToValueAtTime(amp * 0.8, at + 0.005); ng.gain.exponentialRampToValueAtTime(0.0001, at + len * 0.8);
      n.connect(lp).connect(ng).connect(master); n.start(at); n.stop(at + len);
    };
    const murmur = (at, m, g0) => {
      const a = at + m.start * SYS, b = at + m.end * SYS, pk = a + (b - a) * m.peak;
      const n = ctx.createBufferSource(); n.buffer = noise; n.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = m.freq; bp.Q.value = 0.9;
      const gg = ctx.createGain(); const top = 0.35 * m.loud * g0;
      gg.gain.setValueAtTime(0, a);
      if (m.shape === 'plateau') { gg.gain.linearRampToValueAtTime(top * 0.8, a + 0.03); gg.gain.setValueAtTime(top * 0.8, b - 0.03); gg.gain.linearRampToValueAtTime(0, b); }
      else if (m.shape === 'decrescendo') { gg.gain.linearRampToValueAtTime(top, a + 0.03); gg.gain.linearRampToValueAtTime(top * 0.15, b); gg.gain.linearRampToValueAtTime(0, b + 0.01); }
      else { gg.gain.linearRampToValueAtTime(top, pk); gg.gain.linearRampToValueAtTime(0, b); }
      n.connect(bp).connect(gg).connect(master); n.start(a); n.stop(b + 0.02);
    };
    let next = ctx.currentTime + 0.1;
    const schedule = () => {
      const { L: les, gain: gn, man: mn } = S.current;
      const eff = effective(les, mn);
      while (next < ctx.currentTime + 0.6) {
        if (les.s4) thump(next - 0.1, 0.25, 35, 0.05);
        thump(next + 0.02, 0.8, 55, 0.08);
        if (les.click) thump(next + eff.clickAt, 0.35, 90, 0.025);
        if (eff.murmur) murmur(next, eff.murmur, gn);
        if (les.s3) thump(next + SYS + 0.17, 0.3, 40, 0.06);
        thump(next + SYS + 0.03, 0.75 * Math.max(0.1, les.a2), 75, 0.06);
        next += BEAT;
      }
    };
    schedule();
    const id = setInterval(schedule, 150);
    audio.current = { ctx, id };
    setPlaying(true);
  };
  const stop = () => { if (audio.current) { clearInterval(audio.current.id); audio.current.ctx.close(); audio.current = null; } setPlaying(false); };
  useEffect(() => () => stop(), []);   // eslint-disable-line

  const m = MANOEUVRES.find(x => x.id === man);
  return (
    <div className="cs-card tight">
      {lesions.length > 1 && (
        <div className="cs-row" style={{ marginBottom: 8 }}>
          {lesions.map(k => <button key={k} className={'cs-chip' + (k === key ? ' on' : '')} onClick={() => setKey(k)}>{LESIONS[k].name}</button>)}
        </div>
      )}
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 220 }} aria-label={`Phonocardiogram: ${L.name}`} /></div>
      <div className="cs-ctrls">
        {!playing ? <button className="cs-btn primary" onClick={start}>🔊 Listen</button> : <button className="cs-btn" onClick={stop}>■ Stop</button>}
        {MANOEUVRES.map(x => <button key={x.id} className={'cs-chip' + (man === x.id ? ' on' : '')} onClick={() => setMan(x.id)}>{x.label}</button>)}
      </div>
      <div className="cs-readout">
        <div><span>Site</span><b style={{ fontSize: 13, fontFamily: 'var(--f-body)' }}>{L.site}</b></div>
        <div><span>Murmur intensity</span><b style={{ color: gain > 1.1 ? 'var(--red)' : gain < 0.9 ? 'var(--cyan)' : undefined }}>{L.murmur ? `${gain > 1.1 ? '▲ louder' : gain < 0.9 ? '▼ softer' : 'baseline'}` : '—'}</b></div>
      </div>
      <ul className="cs-ul" style={{ marginTop: 10, fontSize: 14 }}>{L.notes.map(n => <li key={n} className="cs-li">{n}</li>)}</ul>
      {m.why && <p className="cs-pts">{m.label}: {m.why}</p>}
      <p className="cs-pts">Use headphones. The sounds are synthesised to teach timing and shape, not recorded from a patient.</p>
    </div>
  );
}

/* ---------- continuous-wave Doppler ---------- */

/**
 * A spectral Doppler display. The learner drags the caliper to the edge of
 * the envelope; peak and mean gradients follow from the simplified Bernoulli
 * equation (ΔP = 4v²). kind: 'cw-as' | 'pw-lvot'.
 */
export function Doppler({ vmax = 4.6, kind = 'cw-as', title, onMeasure }) {
  const ref = useRef(null);
  const [cal, setCal] = useState(kind === 'pw-lvot' ? 0.6 : 2.5);
  const scaleMax = kind === 'pw-lvot' ? 2 : 6;
  const late = kind === 'cw-as' && vmax > 4;
  const env = x => {                        // x 0..1 through ejection
    if (x <= 0 || x >= 1) return 0;
    const pk = kind === 'pw-lvot' ? 0.3 : late ? 0.5 : 0.35;
    return x < pk ? Math.sin(x / pk * Math.PI / 2) : Math.cos((x - pk) / (1 - pk) * Math.PI / 2);
  };
  const S = useRef({}); S.current = { cal };
  useCanvas(ref, 230, (g, w, h, t) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const base = 24, Y = v => base + v / scaleMax * (h - base - 14);
    g.strokeStyle = '#2B3B4E'; g.fillStyle = '#6A7F9B'; g.font = '10px "JetBrains Mono", monospace';
    for (let v = 0; v <= scaleMax; v += kind === 'pw-lvot' ? 0.5 : 1) { g.beginPath(); g.moveTo(40, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.fillText(`-${v}`, 4, Y(v) + 3); }
    g.fillText('m/s', 4, 12);
    const beatW = (w - 60) / 3, ej = beatW * 0.42;
    const sweep = (t * 90) % (w - 40);
    for (let b = 0; b < 3; b++) {
      const x0 = 50 + b * beatW + beatW * 0.15;
      for (let px = 0; px < ej; px += 1.5) {
        const v = env(px / ej) * vmax;
        if (kind === 'pw-lvot') {
          g.fillStyle = 'rgba(230,230,230,0.9)'; g.fillRect(x0 + px, Y(v * 0.85), 1.5, Math.max(1, Y(v) - Y(v * 0.85)));
        } else {
          for (let k = 0; k < 10; k++) { const vv = v * Math.random(); g.fillStyle = `rgba(230,230,230,${0.25 + Math.random() * 0.5})`; g.fillRect(x0 + px, Y(vv), 1.5, 2); }
          g.fillStyle = 'rgba(245,245,245,0.95)'; g.fillRect(x0 + px, Y(v) - 1, 1.5, 2);
        }
      }
    }
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(40 + sweep, 0, 8, h);
    // caliper
    const y = Y(S.current.cal);
    g.strokeStyle = '#F5C451'; g.setLineDash([6, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(40, y); g.lineTo(w, y); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#F5C451'; g.font = '700 12px "JetBrains Mono", monospace'; g.fillText(`${S.current.cal.toFixed(2)} m/s`, w - 90, y - 6);
    g.fillStyle = '#9FB4C6'; g.font = '600 11px "JetBrains Mono", monospace';
    g.fillText(kind === 'pw-lvot' ? 'PW · LVOT · APICAL 5C' : 'CW · AORTIC VALVE · APICAL 5C', 50, 16);
  }, [vmax, kind]);
  const v = cal;
  const peak = 4 * v * v;
  const mean = peak * (late ? 0.6 : 0.56);
  const vti = (kind === 'pw-lvot' ? 22 : 104) * (v / (kind === 'pw-lvot' ? 1.1 : 4.6));
  const close = Math.abs(v - vmax) < (kind === 'pw-lvot' ? 0.08 : 0.15);
  return (
    <div className="cs-card tight">
      {title && <div className="cs-pts" style={{ marginBottom: 8 }}>{title}</div>}
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 230 }} aria-label="Spectral Doppler" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Caliper
          <input type="range" min="0" max={scaleMax} step="0.02" value={cal} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="Velocity caliper" />
        </label>
        <button className="cs-btn primary" onClick={() => onMeasure?.({ v, peak, mean, vti, close })}>Measure</button>
      </div>
      <div className="cs-readout">
        <div><span>Velocity</span><b>{v.toFixed(2)} m/s</b></div>
        {kind === 'cw-as' && <div><span>Peak gradient 4v²</span><b>{Math.round(peak)} mmHg</b></div>}
        {kind === 'cw-as' && <div><span>Mean gradient (traced)</span><b>{Math.round(mean)} mmHg</b></div>}
        <div><span>VTI</span><b>{vti.toFixed(0)} cm</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Drag the caliper to the dense outer edge of the envelope — not to the faint feathering beyond it.</p>
    </div>
  );
}

/* ---------- simultaneous LV and aortic pressures ---------- */

/** mode 'as': LV 190/18 against Ao 118/64, slow aortic upstroke; 'post': gradient gone. */
export function Hemodynamics({ mode = 'as' }) {
  const ref = useRef(null);
  const S = useRef(mode); S.current = mode;
  useCanvas(ref, 210, (g, w, h, t) => {
    const as = S.current === 'as';
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const Y = p => h - 18 - p / 210 * (h - 30);
    g.strokeStyle = '#13212D'; g.font = '10px "JetBrains Mono", monospace';
    for (const p of [0, 50, 100, 150, 200]) { g.beginPath(); g.moveTo(34, Y(p)); g.lineTo(w, Y(p)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(p, 4, Y(p) + 3); }
    const lvSys = as ? 192 : 130, aoSys = as ? 118 : 128, aoDia = as ? 64 : 62;
    const lv = x => x < 0.05 ? 16 : x < 0.12 ? 16 + (lvSys - 16) * Math.sin((x - 0.05) / 0.07 * Math.PI / 2) : x < 0.36 ? lvSys - (lvSys - lvSys * 0.92) * ((x - 0.12) / 0.24) : x < 0.44 ? lvSys * 0.92 * (1 - (x - 0.36) / 0.08) + 6 * ((x - 0.36) / 0.08) : 6 + (x - 0.44) * 18;
    const ao = x => {
      const up = as ? 0.32 : 0.14;
      if (x < 0.08) return aoDia + (x * 30);
      if (x < 0.08 + up) return aoDia + 2 + (aoSys - aoDia - 2) * Math.sin((x - 0.08) / up * Math.PI / 2);
      if (x < 0.42) return aoSys - (x - 0.08 - up) * 40;
      if (x < 0.45) return aoSys - (0.42 - 0.08 - up) * 40 - 8 + (x - 0.42) * 120;
      return Math.max(aoDia + 2, aoSys - (0.42 - 0.08 - up) * 40 - 4 - (x - 0.45) * (as ? 70 : 90));
    };
    const draw = (fn, color, fill) => {
      g.strokeStyle = color; g.lineWidth = 2; g.beginPath();
      for (let px = 34; px < w; px += 1.5) { const x = (((t - (w - px) / 140) * 1.15) % 1 + 1) % 1; const y = Y(fn(x)); px === 34 ? g.moveTo(px, y) : g.lineTo(px, y); }
      g.stroke();
    };
    if (as) {
      g.fillStyle = 'rgba(255,77,109,0.18)';
      for (let px = 34; px < w; px += 1.5) { const x = (((t - (w - px) / 140) * 1.15) % 1 + 1) % 1; const a = lv(x), b = ao(x); if (a > b) g.fillRect(px, Y(a), 1.5, Y(b) - Y(a)); }
    }
    draw(ao, '#FF5A52'); draw(lv, '#F2D24B');
    g.font = '700 12px "JetBrains Mono", monospace';
    g.fillStyle = '#F2D24B'; g.fillText(`LV ${lvSys}/16`, w - 230, 16);
    g.fillStyle = '#FF5A52'; g.fillText(`Ao ${aoSys}/${aoDia}`, w - 120, 16);
  }, []);
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 210 }} aria-label="Simultaneous LV and aortic pressure" /></div>
      <div className="cs-readout">
        <div><span>Peak-to-peak</span><b>{mode === 'as' ? '74' : '2'} mmHg</b></div>
        <div><span>Mean gradient</span><b style={{ color: mode === 'as' ? 'var(--red)' : 'var(--green)' }}>{mode === 'as' ? '50' : '4'} mmHg</b></div>
        <div><span>Aortic upstroke</span><b>{mode === 'as' ? 'slow (tardus)' : 'brisk'}</b></div>
      </div>
    </div>
  );
}

/* ---------- transcatheter valve deployment ---------- */

/**
 * The aortic root on fluoroscopy, coplanar view: pigtail in the non-coronary
 * cusp marks the annulus. Position the crimped balloon-expandable valve,
 * rapid-pace, then deploy. Depth is reported as % of the frame below the
 * annulus (ventricular). onResult({ depth, paced, migrated }).
 */
export function TaviDeploy({ onResult, done }) {
  const ref = useRef(null);
  const [depth, setDepth] = useState(35);
  const [pacing, setPacing] = useState(false);
  const [state, setState] = useState(done ? 'deployed' : 'crimped');   // crimped | expanding | deployed
  const [final, setFinal] = useState(done || null);
  const S = useRef({}); S.current = { depth, pacing, state, final, t0: S.current.t0 };

  useCanvas(ref, 330, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#9C9C99'; g.fillRect(0, 0, w, h);
    const grd = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7); grd.addColorStop(0, 'rgba(255,255,255,0.25)'); grd.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const cx = w / 2, ya = h * 0.55, mm = h / 70;               // annulus plane
    const beat = st.pacing ? Math.sin(t * 18) * 0.6 : Math.sin(t * 7.2) * 2.2;   // the heart's motion: pacing stills it
    // aortic root and LVOT silhouette (faint: no contrast)
    g.strokeStyle = 'rgba(60,60,60,0.35)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx - 12 * mm, ya + 16 * mm); g.lineTo(cx - 11 * mm, ya); g.quadraticCurveTo(cx - 17 * mm, ya - 10 * mm, cx - 13 * mm, ya - 20 * mm); g.lineTo(cx - 14 * mm, ya - 32 * mm); g.stroke();
    g.beginPath(); g.moveTo(cx + 12 * mm, ya + 16 * mm); g.lineTo(cx + 11 * mm, ya); g.quadraticCurveTo(cx + 17 * mm, ya - 10 * mm, cx + 13 * mm, ya - 20 * mm); g.lineTo(cx + 14 * mm, ya - 32 * mm); g.stroke();
    // calcified native leaflets
    g.strokeStyle = 'rgba(20,20,20,0.8)'; g.lineWidth = 3;
    const open = st.state === 'deployed' ? 1 : 0;   // a deployed frame pins the native leaflets against the aortic wall
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 11 * mm, ya + beat * 0.3); g.quadraticCurveTo(cx + s * (7 + 6 * open) * mm, ya - 6 * mm, cx + s * (3 + 10 * open) * mm, ya - 11 * mm + beat * (1 - open)); g.stroke(); }
    // the conduction system: membranous septum just below the annulus
    g.fillStyle = 'rgba(255,77,109,0.25)'; g.fillRect(cx - 12.5 * mm, ya + 3 * mm, 2.4 * mm, 7 * mm);
    g.fillStyle = 'rgba(120,20,40,0.9)'; g.font = '600 10px "JetBrains Mono", monospace'; g.fillText('membranous septum / His', cx - 30 * mm, ya + 12 * mm);
    // pigtail in the non-coronary cusp marks the annulus
    g.strokeStyle = 'rgba(15,15,15,0.9)'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(cx + 25 * mm, 0); g.quadraticCurveTo(cx + 13 * mm, ya - 25 * mm, cx + 9 * mm, ya - 2 * mm); g.stroke();
    g.beginPath(); g.arc(cx + 8 * mm, ya - 1 * mm + beat * 0.3, 1.8 * mm, 0, Math.PI * 1.8); g.stroke();
    g.strokeStyle = 'rgba(245,196,81,0.9)'; g.setLineDash([6, 5]); g.lineWidth = 1.3; g.beginPath(); g.moveTo(cx - 22 * mm, ya); g.lineTo(cx + 22 * mm, ya); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#4A3A00'; g.fillText('annulus (pigtail at the cusp floor)', cx + 14 * mm, ya - 3 * mm);
    // left main ostium
    g.fillStyle = 'rgba(20,20,20,0.6)'; g.beginPath(); g.ellipse(cx - 14 * mm, ya - 13 * mm, 1.6 * mm, 1 * mm, 0, 0, Math.PI * 2); g.fill();
    g.fillText('LM', cx - 20 * mm, ya - 15 * mm);
    // the valve: 26 mm balloon-expandable frame, 18 mm tall
    const H = 18 * mm;
    const f = st.final;
    let d = f ? f.depth : st.depth;
    if (f && f.migrated) d = f.depth;
    const top = ya - H * (1 - d / 100) + (st.state === 'deployed' ? 0 : beat), bottom = top + H;
    let half = 4 * mm;
    if (st.state === 'expanding') half = 4 * mm + Math.min(1, (performance.now() - S.current.t0) / 2200) * 9 * mm;
    if (st.state === 'deployed') half = 13 * mm;
    g.strokeStyle = 'rgba(10,10,10,0.95)'; g.lineWidth = 2;
    g.strokeRect(cx - half, top, half * 2, bottom - top);
    for (let k = 1; k < 6; k++) { const yy = top + (bottom - top) * k / 6; g.beginPath(); for (let j = 0; j <= 12; j++) { const xx = cx - half + half * 2 * j / 12; const yy2 = yy + (j % 2 ? 3 : -3); j ? g.lineTo(xx, yy2) : g.moveTo(xx, yy2); } g.stroke(); }
    if (st.state !== 'deployed') { g.fillStyle = 'rgba(10,10,10,0.9)'; g.fillRect(cx - 1, top - 30 * mm, 2, 30 * mm); for (const yy of [top - 2 * mm, bottom + 2 * mm]) g.fillRect(cx - 2 * mm, yy, 4 * mm, 2); }
    // depth readout
    g.fillStyle = '#04121A'; g.fillRect(8, 8, 200, 44);
    g.fillStyle = '#F5C451'; g.font = '700 13px "JetBrains Mono", monospace';
    g.fillText(`Aortic ${100 - Math.round(d)} : ${Math.round(d)} ventricular`, 16, 26);
    g.fillStyle = st.pacing ? '#FF4D6D' : '#9FB4C6'; g.fillText(st.pacing ? 'RAPID PACING 180' : 'sinus 72', 16, 44);
  }, []);

  const deploy = () => {
    S.current.t0 = performance.now();
    setState('expanding');
    const paced = pacing;
    const migrated = !paced;
    const end = migrated ? Math.max(-15, depth - 22) : depth;     // unpaced, the ejecting heart squeezes the valve up toward the aorta
    setTimeout(() => {
      const res = { depth: end, paced, migrated };
      setFinal(res); setState('deployed'); setPacing(false);
      onResult?.(res);
    }, 2300);
  };
  const deployed = state === 'deployed';
  return (
    <div className="cs-card tight">
      <div className="cs-viewer">
        <canvas ref={ref} className="cs-canvas" style={{ height: 330 }} aria-label="Fluoroscopy of the aortic root during valve deployment" />
        <div className="cs-viewer-hud r">coplanar view · cusps aligned</div>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Aortic
          <input type="range" min="-10" max="60" value={depth} disabled={state !== 'crimped'} onChange={e => setDepth(+e.target.value)} style={{ width: '100%' }} aria-label="Valve depth" />
        Ventricular</label>
      </div>
      <div className="cs-ctrls">
        <button className={'cs-btn' + (pacing ? ' danger' : '')} disabled={state !== 'crimped'} onClick={() => setPacing(p => !p)}>{pacing ? '■ Stop rapid pacing' : '⚡ Rapid pace at 180'}</button>
        <button className="cs-btn primary" disabled={state !== 'crimped'} onClick={deploy}>Inflate the balloon — deploy</button>
      </div>
      {pacing && !deployed && <p className="cs-pts" style={{ color: 'var(--amber)', marginTop: 8 }}>Arterial pressure 48 mmHg, pulse pressure gone: the LV is no longer ejecting. Deploy now — every second of rapid pacing is ischaemic.</p>}
      {deployed && final && <p className="cs-pts" style={{ marginTop: 8 }}>Final position: aortic {100 - Math.round(final.depth)} : {Math.round(final.depth)} ventricular{final.migrated ? ' — the valve jumped upward during inflation.' : '.'}</p>}
    </div>
  );
}

/* ---------- transcutaneous pacing ---------- */

/**
 * External pacing over a complete heart block with a slow escape. Below the
 * capture threshold every spike is followed only by a big, decaying artefact
 * — which can look like a QRS on the monitor. Real capture shows a broad
 * complex AND a pulse (pleth) after every spike.
 * onConfirm({ rate, mA, captured, threshold })
 */
export function Pacer({ escape = 34, atrial = 84, threshold = 78, onConfirm, done }) {
  const ref = useRef(null);
  const [rate, setRate] = useState(70);
  const [mA, setMA] = useState(0);
  const [on, setOn] = useState(false);
  const [pulse, setPulse] = useState(null);
  const S = useRef({}); S.current = { rate, mA, on };
  useCanvas(ref, 230, (g, w, h, t) => {
    const { rate: r, mA: m, on: o } = S.current;
    const cap = o && m >= threshold;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const span = 6, X = s => 30 + s / span * (w - 40);
    const ecgY = 80, plY = 190;
    g.font = '600 10px "JetBrains Mono", monospace'; g.fillStyle = '#6A7F9B';
    g.fillText('II', 4, ecgY - 40); g.fillText('PLETH', 2, plY - 40);
    const now = t;
    const sample = (sec) => {          // sec: time before now (0 = newest)
      const T = now - sec;
      let v = 0, pl = 0;
      const pp = 60 / atrial; const pa = ((T % pp) + pp) % pp;
      if (pa < 0.09) v += Math.sin(pa / 0.09 * Math.PI) * 0.12;
      const wide = x => x < 0 || x > 0.55 ? 0 : x < 0.16 ? Math.sin(x / 0.16 * Math.PI) * 0.9 : x < 0.22 ? -0.06 : -Math.sin((x - 0.22) / 0.33 * Math.PI) * 0.32;
      const pul = x => x < 0.05 || x > 0.75 ? 0 : x < 0.25 ? Math.sin((x - 0.05) / 0.2 * Math.PI / 2) : Math.max(0, 1 - (x - 0.25) * 2);
      if (o) {
        const pr = 60 / r; const px = ((T % pr) + pr) % pr;
        if (px < 0.012) v += 1.6;                                            // the spike
        if (cap) { v += wide(px - 0.02); pl = pul(px); }
        else { v += px < 0.25 ? Math.exp(-px / 0.05) * (m / 140) * 1.1 * (px < 0.03 ? 1 : 0.8) : 0;    // artefact, no capture
          const er = 60 / escape; const ex = ((T % er) + er) % er; v += wide(ex); pl = pul(ex); }
      } else {
        const er = 60 / escape; const ex = ((T % er) + er) % er; v += wide(ex); pl = pul(ex);
      }
      return { v, pl };
    };
    g.lineWidth = 1.6;
    g.strokeStyle = '#38E07A'; g.beginPath();
    for (let px = 30; px < w - 10; px += 1) { const sec = span - (px - 30) / (w - 40) * span; const { v } = sample(sec); px === 30 ? g.moveTo(px, ecgY - v * 34) : g.lineTo(px, ecgY - v * 34); }
    g.stroke();
    g.strokeStyle = '#3ED0F5'; g.beginPath();
    for (let px = 30; px < w - 10; px += 1) { const sec = span - (px - 30) / (w - 40) * span; const { pl } = sample(sec); px === 30 ? g.moveTo(px, plY - pl * 30) : g.lineTo(px, plY - pl * 30); }
    g.stroke();
    g.fillStyle = o ? '#FF4D6D' : '#9FB4C6'; g.font = '700 12px "JetBrains Mono", monospace';
    g.fillText(o ? `PACING · ${r} ppm · ${m} mA` : 'PACER OFF', w - 220, 18);
  }, []);
  const check = () => setPulse(on && mA >= threshold ? rate : escape);
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 230 }} aria-label="Defibrillator monitor during transcutaneous pacing" /></div>
      <div className="cs-ctrls">
        <button className={'cs-btn' + (on ? ' danger' : ' primary')} disabled={!!done} onClick={() => setOn(o => !o)}>{on ? '■ Pause pacing' : '⚡ Start pacing'}</button>
        {[60, 70, 80].map(r => <button key={r} className={'cs-chip' + (rate === r ? ' on' : '')} disabled={!!done} onClick={() => setRate(r)}>{r} ppm</button>)}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Output
          <input type="range" min="0" max="140" step="2" value={mA} disabled={!!done} onChange={e => setMA(+e.target.value)} style={{ width: '100%' }} aria-label="Pacing output in milliamps" />
        {mA} mA</label>
      </div>
      <div className="cs-ctrls">
        <button className="cs-btn" onClick={check}>✋ Feel the femoral pulse</button>
        <button className="cs-btn primary" disabled={!on || !!done} onClick={() => onConfirm?.({ rate, mA, captured: mA >= threshold, threshold })}>Confirm capture</button>
        {pulse != null && <span className="cs-mono" style={{ color: pulse === escape ? 'var(--red)' : 'var(--green)' }}>Femoral pulse: {pulse} /min</span>}
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Turn the output up in steps. Watch for a broad complex after every spike — then prove it with a pulse. A spike followed by a tall, smooth hump is artefact, not capture.</p>
    </div>
  );
}

/* ---------- colour Doppler of mitral regurgitation, with PISA ---------- */

/**
 * Mid-oesophageal TOE view: LA at the top of the sector, the mitral valve
 * across the middle, LV below. A flail posterior leaflet throws an eccentric
 * jet that hugs the LA wall (Coanda). On the LV side, flow converges into a
 * hemisphere: its first aliasing boundary has radius r. Move the colour
 * baseline (aliasing velocity), measure r, and the PISA method gives
 * EROA = 2πr²·Va / Vmax and regurgitant volume = EROA × VTI.
 */
export function ColorMR({ eroa = 0.6, vmax = 520, vti = 150, onMeasure, title }) {
  const ref = useRef(null);
  const [va, setVa] = useState(40);
  const [cal, setCal] = useState(0.6);
  const q = eroa * vmax;                                       // cm³/s at peak
  const rTrue = Math.sqrt(q / (2 * Math.PI * va));
  const S = useRef({}); S.current = { va, cal, rTrue };
  useCanvas(ref, 320, (g, w, h, t) => {
    const { cal: c, rTrue: r } = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = 6, R = h * 1.08;
    g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, Math.PI * 0.5 - 0.7, Math.PI * 0.5 + 0.7); g.closePath(); g.clip();
    for (let i = 0; i < 2600; i++) { const a = Math.PI / 2 + (Math.random() - 0.5) * 1.4, rr = Math.random() * R; g.fillStyle = `rgba(190,190,190,${Math.random() * 0.1})`; g.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2, 2); }
    const cm = h / 9;                                          // pixels per cm
    const vy = h * 0.52, ox = cx + 0.2 * cm;                   // valve plane and the orifice
    const sys = ((t * 1.25) % 1) < 0.4;
    // walls: LA above, LV below
    g.strokeStyle = 'rgba(200,200,200,0.55)'; g.lineWidth = 6;
    g.beginPath(); g.ellipse(cx, vy - 2.1 * cm, 3.0 * cm, 2.0 * cm, 0, Math.PI * 0.05, Math.PI * 0.95, true); g.stroke();
    g.beginPath(); g.ellipse(cx, vy + 2.6 * cm, 3.1 * cm, 2.7 * cm, 0, Math.PI * 1.05, Math.PI * 1.95, true); g.stroke();
    // leaflets: anterior (left) coapts; posterior (right) flail tip whips into the LA in systole
    g.strokeStyle = 'rgba(235,235,235,0.9)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(cx - 2.6 * cm, vy - 0.2 * cm); g.quadraticCurveTo(cx - 1.2 * cm, vy + (sys ? 0.1 : 1.2) * cm, ox - 0.1 * cm, vy + (sys ? 0 : 1.6) * cm); g.stroke();
    g.beginPath(); g.moveTo(cx + 2.6 * cm, vy - 0.2 * cm); g.quadraticCurveTo(cx + 1.4 * cm, vy - (sys ? 0.6 : -0.6) * cm, ox + 0.4 * cm, vy - (sys ? 1.4 : -1.4) * cm); g.stroke();
    g.lineWidth = 1.5; g.beginPath(); g.moveTo(ox + 0.4 * cm, vy - (sys ? 1.4 : -1.4) * cm); g.lineTo(ox + 0.8 * cm, vy - (sys ? 1.9 : -1.9) * cm); g.stroke();   // the ruptured chord
    if (sys) {
      // PISA: concentric aliasing shells on the LV side
      for (let k = 4; k >= 1; k--) {
        const rk = r * cm * (k === 1 ? 1 : 1 + (k - 1) * 0.55);
        g.fillStyle = k === 1 ? 'rgba(60,140,255,0.85)' : k % 2 ? 'rgba(255,190,40,0.55)' : 'rgba(220,40,40,0.55)';
        g.beginPath(); g.arc(ox, vy, rk, 0, Math.PI); g.fill();
      }
      // the eccentric jet: anteriorly directed, wrapping along the LA wall
      const grd = g.createLinearGradient(ox, vy, cx - 3 * cm, vy - 3.5 * cm);
      grd.addColorStop(0, 'rgba(80,255,120,0.9)'); grd.addColorStop(0.4, 'rgba(255,230,60,0.8)'); grd.addColorStop(1, 'rgba(60,120,255,0.4)');
      g.fillStyle = grd;
      g.beginPath(); g.moveTo(ox - 0.2 * cm, vy); g.quadraticCurveTo(cx - 1.5 * cm, vy - 0.8 * cm, cx - 2.7 * cm, vy - 1.6 * cm);
      g.quadraticCurveTo(cx - 3.0 * cm, vy - 3.4 * cm, cx - 1.0 * cm, vy - 3.9 * cm); g.lineTo(cx - 1.2 * cm, vy - 3.4 * cm);
      g.quadraticCurveTo(cx - 2.4 * cm, vy - 3.0 * cm, cx - 2.2 * cm, vy - 1.7 * cm); g.quadraticCurveTo(cx - 1.2 * cm, vy - 0.8 * cm, ox + 0.2 * cm, vy); g.fill();
    }
    g.restore();
    // caliper from the orifice downward
    g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.beginPath(); g.moveTo(ox, vy); g.lineTo(ox, vy + c * cm); g.stroke();
    g.beginPath(); g.moveTo(ox - 6, vy + c * cm); g.lineTo(ox + 6, vy + c * cm); g.stroke();
    g.fillStyle = '#F5C451'; g.font = '700 12px "JetBrains Mono", monospace'; g.fillText(`r ${c.toFixed(2)} cm`, ox + 10, vy + c * cm + 4);
    g.fillStyle = '#9FB4C6'; g.font = '600 11px "JetBrains Mono", monospace';
    g.fillText('TOE · ME 4-chamber · colour', 10, 16); g.fillText('LA', cx - 0.2 * cm, vy - 3.3 * cm); g.fillText('LV', cx - 0.2 * cm, vy + 4.4 * cm);
    // colour bar
    g.fillStyle = '#C0392B'; g.fillRect(w - 26, 40, 12, 50); g.fillStyle = '#2E6BE6'; g.fillRect(w - 26, 90, 12, 50);
    g.fillStyle = '#E9F2FC'; g.font = '600 10px "JetBrains Mono", monospace'; g.fillText(`±${S.current.va}`, w - 54, 36); g.fillText('cm/s', w - 50, 152);
  }, []);
  const eroaM = 2 * Math.PI * cal * cal * va / vmax;
  const rvol = eroaM * vti;
  const close = Math.abs(cal - rTrue) < 0.08;
  return (
    <div className="cs-card tight">
      {title && <div className="cs-pts" style={{ marginBottom: 8 }}>{title}</div>}
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 320 }} aria-label="Colour Doppler of mitral regurgitation" /></div>
      <div className="cs-ctrls">
        <span className="cs-pts">Colour baseline (aliasing velocity):</span>
        {[30, 40, 50, 60].map(v => <button key={v} className={'cs-chip' + (va === v ? ' on' : '')} onClick={() => setVa(v)}>{v} cm/s</button>)}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>PISA radius
          <input type="range" min="0.3" max="1.6" step="0.01" value={cal} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="PISA radius caliper" />
        </label>
        <button className="cs-btn primary" onClick={() => onMeasure?.({ r: cal, va, eroa: eroaM, rvol, close })}>Measure</button>
      </div>
      <div className="cs-readout">
        <div><span>EROA = 2πr²·Va / Vmax</span><b style={{ color: eroaM >= 0.4 ? 'var(--red)' : undefined }}>{eroaM.toFixed(2)} cm²</b></div>
        <div><span>Regurgitant volume</span><b style={{ color: rvol >= 60 ? 'var(--red)' : undefined }}>{Math.round(rvol)} mL</b></div>
        <div><span>MR Vmax · VTI</span><b>{(vmax / 100).toFixed(1)} m/s · {vti} cm</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Measure from the orifice to the first colour change (red → blue) in mid-systole. Shift the baseline and the hemisphere changes size — but the EROA should not.</p>
    </div>
  );
}

/* ---------- pulmonary vein flow ---------- */

export function PulmonaryVein({ reversal = true }) {
  const ref = useRef(null);
  useCanvas(ref, 170, (g, w, h, t) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const base = h * 0.52, Y = v => base - v * 70;
    g.strokeStyle = '#2B3B4E'; g.beginPath(); g.moveTo(30, base); g.lineTo(w, base); g.stroke();
    g.fillStyle = '#6A7F9B'; g.font = '10px "JetBrains Mono", monospace'; g.fillText('+0.6', 2, Y(0.6) + 3); g.fillText('−0.6', 2, Y(-0.6) + 3);
    const beatW = (w - 40) / 3;
    for (let b = 0; b < 3; b++) {
      const x0 = 36 + b * beatW;
      for (let px = 0; px < beatW; px += 1.5) {
        const x = px / beatW;
        let v = 0;
        if (x < 0.4) v = (reversal ? -0.55 : 0.5) * Math.sin(x / 0.4 * Math.PI);        // S wave
        else if (x < 0.75) v = 0.55 * Math.sin((x - 0.4) / 0.35 * Math.PI);              // D wave
        else if (x > 0.86 && x < 0.97) v = -0.2 * Math.sin((x - 0.86) / 0.11 * Math.PI); // atrial reversal
        g.fillStyle = 'rgba(230,230,230,0.85)';
        g.fillRect(x0 + px, Math.min(Y(v), base), 1.5, Math.max(1, Math.abs(Y(v) - base)));
      }
      g.fillStyle = '#F5C451'; g.font = '700 11px "JetBrains Mono", monospace';
      g.fillText('S', x0 + beatW * 0.18, reversal ? base + 50 : base - 44); g.fillText('D', x0 + beatW * 0.55, base - 44);
    }
    g.fillStyle = '#9FB4C6'; g.font = '600 11px "JetBrains Mono", monospace'; g.fillText('PW · right upper pulmonary vein', 36, 14);
  }, [reversal]);
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 170 }} aria-label="Pulmonary vein Doppler" /></div>
      <p className="cs-pts" style={{ marginTop: 8 }}>{reversal ? 'Systolic flow REVERSAL: in systole blood is driven backwards up the pulmonary veins. A specific sign of severe MR.' : 'Normal pattern: forward S and D waves.'}</p>
    </div>
  );
}

/* ---------- left atrial pressure ---------- */

/** mode 'acute' (giant v-waves), 'post' (after repair), 'slda' (v-waves back). */
export function LAPressure({ mode = 'acute' }) {
  const ref = useRef(null);
  const P = { acute: { a: 26, v: 58, base: 22 }, post: { a: 16, v: 22, base: 13 }, slda: { a: 28, v: 62, base: 24 } }[mode];
  useCanvas(ref, 170, (g, w, h, t) => {
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const Y = p => h - 14 - p / 70 * (h - 28);
    g.strokeStyle = '#13212D'; g.font = '10px "JetBrains Mono", monospace';
    for (const p of [0, 20, 40, 60]) { g.beginPath(); g.moveTo(30, Y(p)); g.lineTo(w, Y(p)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(p, 4, Y(p) + 3); }
    const f = x => x < 0.1 ? P.base + (P.a - P.base) * Math.sin(x / 0.1 * Math.PI) : x < 0.2 ? P.base - 2 : x < 0.55 ? P.base - 2 + (P.v - P.base + 2) * Math.sin((x - 0.2) / 0.35 * Math.PI / 2) : x < 0.7 ? P.v - (P.v - P.base + 3) * ((x - 0.55) / 0.15) : P.base - 3 + (x - 0.7) * 10;
    g.strokeStyle = '#A78BFA'; g.lineWidth = 2; g.beginPath();
    for (let px = 30; px < w; px += 1.5) { const x = ((((t - (w - px) / 140) * 1.3) % 1) + 1) % 1; px === 30 ? g.moveTo(px, Y(f(x))) : g.lineTo(px, Y(f(x))); }
    g.stroke();
    g.fillStyle = '#A78BFA'; g.font = '700 12px "JetBrains Mono", monospace'; g.fillText(`LA · v-wave ${P.v} · mean ${Math.round(P.base + 6)} mmHg`, w - 290, 16);
  }, [mode]);
  return <div className="cs-card tight"><div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 170 }} aria-label="Left atrial pressure" /></div></div>;
}

/* ---------- transseptal puncture ---------- */

/**
 * Three TOE views of the interatrial septum: bicaval (superior ↔ inferior),
 * short axis (anterior ↔ posterior, the aortic root anteriorly) and four-
 * chamber (height of the tent above the mitral valve). Move the needle,
 * tent, and puncture. onResult({ height, ant, sup })
 */
export function TransseptalPuncture({ onResult, done }) {
  const ref = useRef(null);
  const [sup, setSup] = useState(0.3);     // 0 inferior → 1 superior
  const [ant, setAnt] = useState(0.6);     // 0 posterior → 1 anterior
  const [tent, setTent] = useState(false);
  const [warn, setWarn] = useState('');
  const height = 2.8 + sup * 2.4;          // cm above the mitral coaptation in the 4-chamber view
  const S = useRef({}); S.current = { sup, ant, tent, done };
  useCanvas(ref, 230, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const pw = w / 3;
    const panel = (i, title) => { g.strokeStyle = '#1B2A40'; g.strokeRect(i * pw + 4, 4, pw - 8, h - 8); g.fillStyle = '#9FB4C6'; g.font = '600 10px "JetBrains Mono", monospace'; g.fillText(title, i * pw + 12, 18); };
    const bulge = st.tent || st.done ? 10 : 0;
    // 1. bicaval: SVC top, IVC bottom, the fossa between
    panel(0, 'BICAVAL — sup / inf');
    let x0 = pw * 0.5, ytop = 34, ybot = h - 22;
    g.strokeStyle = 'rgba(200,200,200,0.6)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x0, ytop); g.lineTo(x0, ybot); g.stroke();
    g.fillStyle = 'rgba(200,200,200,0.15)'; g.fillRect(x0 - 3, ytop + (ybot - ytop) * 0.3, 6, (ybot - ytop) * 0.4);
    g.fillStyle = '#6A7F9B'; g.fillText('SVC', x0 - 10, ytop - 4); g.fillText('IVC', x0 - 10, ybot + 14);
    const yb = ybot - (st.sup) * (ybot - ytop) * 0.8 - (ybot - ytop) * 0.1;
    g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 50, ybot); g.quadraticCurveTo(x0 - 30, yb, x0 - 3 + bulge * 0.2, yb); g.stroke();
    if (bulge) { g.strokeStyle = 'rgba(245,196,81,0.8)'; g.beginPath(); g.arc(x0 + 2, yb, bulge, -Math.PI / 2, Math.PI / 2); g.stroke(); }
    // 2. short axis: aorta anterior (top), posterior (bottom)
    panel(1, 'SHORT AXIS — ant / post');
    x0 = pw * 1.5;
    g.fillStyle = 'rgba(255,77,109,0.18)'; g.beginPath(); g.arc(x0 + 40, 58, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FF8A9B'; g.fillText('AORTA', x0 + 20, 62);
    g.strokeStyle = 'rgba(200,200,200,0.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 - 6, 50); g.lineTo(x0 - 6, h - 26); g.stroke();
    g.fillStyle = '#6A7F9B'; g.fillText('ant', x0 - 50, 46); g.fillText('post', x0 - 50, h - 22);
    const ya = (h - 26) - st.ant * (h - 26 - 50);
    g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 60, h - 26); g.quadraticCurveTo(x0 - 40, ya, x0 - 9, ya); g.stroke();
    if (bulge) { g.strokeStyle = 'rgba(245,196,81,0.8)'; g.beginPath(); g.arc(x0 - 4, ya, bulge, -Math.PI / 2, Math.PI / 2); g.stroke(); }
    if (st.ant > 0.7) { g.fillStyle = '#FF4D6D'; g.font = '700 10px "JetBrains Mono", monospace'; g.fillText('TOO CLOSE TO AORTA', x0 - 60, h - 10); }
    // 3. four-chamber: height above the mitral coaptation
    panel(2, '4-CHAMBER — height');
    x0 = pw * 2.5;
    const mv = h - 40, cm = 26;
    g.strokeStyle = 'rgba(200,200,200,0.6)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x0 - 50, mv); g.lineTo(x0 + 50, mv); g.stroke();
    g.fillStyle = '#6A7F9B'; g.font = '600 10px "JetBrains Mono", monospace'; g.fillText('mitral coaptation', x0 - 48, mv + 14);
    const hgt = 2.8 + st.sup * 2.4;
    const yt = mv - hgt * cm * 0.8;
    g.beginPath(); g.moveTo(x0 - 40, mv - 10); g.lineTo(x0 - 40, 30); g.stroke();
    g.strokeStyle = '#F5C451'; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(x0 - 36, yt); g.lineTo(x0 + 10, yt); g.moveTo(x0 + 10, yt); g.lineTo(x0 + 10, mv); g.stroke(); g.setLineDash([]);
    g.fillStyle = hgt >= 3.8 && hgt <= 4.6 ? '#34E39A' : '#F5C451'; g.font = '700 12px "JetBrains Mono", monospace'; g.fillText(`${hgt.toFixed(1)} cm`, x0 + 16, (yt + mv) / 2);
  }, []);
  const puncture = () => {
    if (ant > 0.7) { setWarn('Stop. The tent points at the aortic root in the short-axis view. Withdraw, rotate posteriorly, re-tent.'); return; }
    setWarn('');
    onResult?.({ height, ant, sup });
  };
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 230 }} aria-label="Transoesophageal views of the interatrial septum" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Inferior<input type="range" min="0" max="1" step="0.01" value={sup} disabled={!!done} onChange={e => setSup(+e.target.value)} style={{ width: '100%' }} aria-label="Superior–inferior position" />Superior</label>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Posterior<input type="range" min="0" max="1" step="0.01" value={ant} disabled={!!done} onChange={e => setAnt(+e.target.value)} style={{ width: '100%' }} aria-label="Anterior–posterior position" />Anterior</label>
      </div>
      <div className="cs-ctrls">
        <button className="cs-btn" disabled={!!done} onClick={() => setTent(x => !x)}>{tent ? 'Relax' : 'Tent the septum'}</button>
        <button className="cs-btn primary" disabled={!!done || !tent} onClick={puncture}>Advance the needle — puncture</button>
      </div>
      {warn && <p className="cs-pts" style={{ color: 'var(--red)', marginTop: 8 }}>{warn}</p>}
    </div>
  );
}

/* ---------- transcatheter edge-to-edge repair: align and grasp ---------- */

/**
 * The 3D TOE "surgical view" of the mitral valve from the atrium: anterior
 * leaflet above, posterior below (P1–P2–P3 left to right), the flail P2 in
 * red. Centre the clip over the flail, turn its arms perpendicular to the
 * coaptation line, then grasp. Insertion of each leaflet into the arms
 * follows from the alignment. onResult({ post, ant, mr, gradient, grasps })
 */
export function ClipGrasp({ onResult, done }) {
  const ref = useRef(null);
  const [x, setX] = useState(-0.45);
  const [ang, setAng] = useState(35);
  const [grasp, setGrasp] = useState(done || null);
  const [count, setCount] = useState(done?.grasps || 0);
  const S = useRef({}); S.current = { x, ang, grasp };
  useCanvas(ref, 300, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#0B0703'; g.fillRect(0, 0, w, h);
    const cx = w * 0.36, cy = h * 0.52, Rx = Math.min(w * 0.3, 170), Ry = 105;
    const sys = ((t * 1.2) % 1) < 0.45;
    // annulus and leaflets, warm 3D-echo palette
    g.fillStyle = '#5A3A1A'; g.beginPath(); g.ellipse(cx, cy, Rx, Ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#C08A4A'; g.beginPath(); g.ellipse(cx, cy - 16, Rx * 0.92, Ry * 0.62, 0, Math.PI, 0); g.fill();       // anterior
    g.fillStyle = '#B07A3A'; g.beginPath(); g.ellipse(cx, cy + 4, Rx * 0.95, Ry * 0.8, 0, 0, Math.PI); g.fill();          // posterior
    g.strokeStyle = '#2A1A0A'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx - Rx * 0.9, cy - 10); g.quadraticCurveTo(cx, cy + 14, cx + Rx * 0.9, cy - 10); g.stroke();  // coaptation line
    for (const k of [-0.33, 0.33]) { g.beginPath(); g.moveTo(cx + k * Rx, cy + 4); g.lineTo(cx + k * Rx * 1.1, cy + Ry * 0.78); g.stroke(); }
    g.fillStyle = '#F2D6A8'; g.font = '700 12px "JetBrains Mono", monospace';
    g.fillText('A2', cx - 8, cy - Ry * 0.35); g.fillText('P1', cx - Rx * 0.62, cy + Ry * 0.5); g.fillText('P2', cx - 8, cy + Ry * 0.55); g.fillText('P3', cx + Rx * 0.52, cy + Ry * 0.5);
    g.fillText('AORTA ↑', cx - 30, cy - Ry - 8);
    // flail P2 segment + jet
    g.fillStyle = sys ? 'rgba(230,60,60,0.85)' : 'rgba(200,80,60,0.6)'; g.beginPath(); g.ellipse(cx, cy + 6, Rx * 0.18, 16, 0, 0, Math.PI * 2); g.fill();
    if (!st.grasp || st.grasp.mr !== 'mild') { g.fillStyle = sys ? 'rgba(80,255,140,0.35)' : 'rgba(0,0,0,0)'; g.beginPath(); g.ellipse(cx, cy + 2, Rx * 0.22, 22, 0, 0, Math.PI * 2); g.fill(); }
    // the clip, seen from above: a bar (its arms) through the centre
    const px = cx + st.x * Rx * 0.8, py = cy + 2;
    const a = (st.ang * Math.PI) / 180;
    const L = 44;
    g.save(); g.translate(px, py); g.rotate(a);
    g.fillStyle = st.grasp ? '#C9D1D9' : '#E9F2FC'; g.fillRect(-4, -L, 8, L * 2);
    g.fillStyle = '#7C8A99'; g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); g.fill();
    g.restore();
    // readouts
    g.fillStyle = '#04121A'; g.fillRect(w * 0.72, 12, w * 0.26, 120);
    g.fillStyle = '#9FB4C6'; g.font = '600 11px "JetBrains Mono", monospace';
    g.fillText('3D TOE · surgical view', w * 0.73, 30);
    g.fillStyle = Math.abs(st.ang) < 12 ? '#34E39A' : '#F5C451'; g.fillText(`Arms vs coaptation: ${Math.round(90 - Math.abs(st.ang))}°`, w * 0.73, 54);
    g.fillStyle = Math.abs(st.x) < 0.12 ? '#34E39A' : '#F5C451'; g.fillText(`Offset from P2: ${(st.x * 15).toFixed(1)} mm`, w * 0.73, 76);
    if (st.grasp) {
      g.fillStyle = '#E9F2FC'; g.fillText(`Insertion A ${st.grasp.ant.toFixed(0)} mm · P ${st.grasp.post.toFixed(0)} mm`, w * 0.73, 100);
      g.fillStyle = st.grasp.mr === 'mild' ? '#34E39A' : '#FF4D6D'; g.fillText(`Residual MR: ${st.grasp.mr}`, w * 0.73, 122);
    }
  }, []);
  const doGrasp = () => {
    const angErr = Math.abs(ang), cErr = Math.abs(x);
    const post = Math.max(1, 10 - 6 * Math.min(1, angErr / 40) - 6 * Math.min(1, cErr / 0.5));
    const antI = Math.max(3, 10 - 3 * Math.min(1, angErr / 40));
    const mr = post >= 6 && cErr < 0.2 ? 'mild' : post >= 4 ? 'moderate' : 'moderate–severe';
    const res = { post, ant: antI, mr, gradient: mr === 'mild' ? 3 : 2, grasps: count + 1 };
    setCount(c => c + 1);
    setGrasp(res);
  };
  const released = !!done;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 300 }} aria-label="3D TOE view of the mitral valve and the clip" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Medial (P1)<input type="range" min="-1" max="1" step="0.01" value={x} disabled={!!grasp || released} onChange={e => setX(+e.target.value)} style={{ width: '100%' }} aria-label="Clip position along the coaptation line" />Lateral (P3)</label>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Rotate<input type="range" min="-60" max="60" step="1" value={ang} disabled={!!grasp || released} onChange={e => setAng(+e.target.value)} style={{ width: '100%' }} aria-label="Clip arm rotation" />{90 - Math.abs(ang)}°</label>
      </div>
      <div className="cs-ctrls">
        {!grasp && <button className="cs-btn primary" disabled={released} onClick={doGrasp}>Advance into the LV, open to 120°, pull back — grasp</button>}
        {grasp && !released && <button className="cs-btn" onClick={() => setGrasp(null)}>Open, invert, back to the LA — re-grasp</button>}
        {grasp && !released && <button className="cs-btn primary" onClick={() => onResult?.(grasp)}>Close and release the clip</button>}
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Centre the clip over the flail P2, arms perpendicular to the line of coaptation, before you grasp. Then judge the grasp: both leaflets deep in the arms, the jet gone, the gradient low — release. Otherwise re-grasp.</p>
    </div>
  );
}
