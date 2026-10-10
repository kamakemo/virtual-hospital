import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../kit/Monitor.jsx';

/* ============================================================
   MITRAL STENOSIS SIMULATORS (Valvular & Structural Case 06)
   Built in the kit's style so they can be promoted later:
   - MSAuscultation      loud S1, opening snap, rumble, presystolic
                         accentuation (lost in AF) + "name that sound"
   - FillingGradient     LA–LV diastolic gradient vs heart rate,
                         pregnancy and rhythm
   - PHTDoppler          CW mitral inflow, pressure half-time by hand
   - Planimetry          PSAX orifice at the leaflet tips
   - WilkinsBuilder      the four-part echo score
   - InoueBalloon        cross, hook, stepwise inflation
   - Pericardiocentesis  subxiphoid needle, depth, aspirate, drain
   ============================================================ */

const MONO = '"JetBrains Mono", ui-monospace, monospace';
// a fixed, irregularly irregular RR sequence (s) so that AF looks the same on every run
const AF_RR = [0.62, 0.48, 0.83, 0.55, 0.71, 0.46, 0.92, 0.58, 0.66, 0.5, 0.77, 0.53];

/* ---------- 1 · auscultation ---------- */

const SOUNDS = {
  ms: { name: 'Her heart: mitral stenosis', site: 'Apex, left lateral position, bell — the rumble is low-pitched and very localised' },
  split: { name: 'Split S2 (A2–P2)', site: 'Pulmonary area (left upper sternal edge); widens on inspiration' },
  s3: { name: 'Third heart sound', site: 'Apex, bell; a low thud of rapid ventricular filling' },
  normal: { name: 'Normal heart sounds', site: '—' },
};
const SEVERITY = { mild: { os: 0.11, rumble: 0.45, label: 'Mild (MVA ~1.8 cm²)' }, moderate: { os: 0.08, rumble: 0.7, label: 'Moderate (MVA ~1.3 cm²)' }, severe: { os: 0.05, rumble: 1, label: 'Severe (MVA ~0.9 cm²)' } };
const SYS = 0.3;
// three hidden early-diastolic sounds for the learner to name
const MYSTERY = [
  { mode: 'ms', sev: 'severe', answer: 'os' },
  { mode: 'split', sev: 'severe', answer: 'split' },
  { mode: 's3', sev: 'severe', answer: 's3' },
];
const NAMES = { os: 'Opening snap', split: 'Split S2', s3: 'S3' };

function beatsFor(rhythm, span) {
  const out = []; let t = 0, k = 0;
  while (t < span + 1) { const rr = rhythm === 'af' ? AF_RR[k % AF_RR.length] : 60 / 76; out.push({ t, rr }); t += rr; k++; }
  return out;
}

export function MSAuscultation({ onIdentify, done }) {
  const [mode, setMode] = useState('ms');
  const [sev, setSev] = useState('severe');
  const [rhythm, setRhythm] = useState('af');
  const [mystery, setMystery] = useState(null);
  const [guess, setGuess] = useState({});
  const [checked, setChecked] = useState(done || null);
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  const audio = useRef(null);
  const live = mystery != null ? MYSTERY[mystery] : { mode, sev };
  const S = useRef({}); S.current = { ...live, rhythm };

  useCanvas(ref, 200, (g, w, h, t) => {
    const st = S.current, sv = SEVERITY[st.sev];
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const span = 2.4, X = s => 30 + (s / span) * (w - 40);
    const ecgY = 34, pY = 120;
    g.font = `600 10px ${MONO}`; g.fillStyle = '#6A7F9B'; g.fillText('ECG', 2, ecgY - 14); g.fillText('PCG', 2, pY - 34);
    const beats = beatsFor(st.rhythm, span);
    // ECG: in AF no P waves and a fibrillating baseline; in sinus a broad, notched P (P mitrale)
    g.strokeStyle = '#38E07A'; g.lineWidth = 1.4; g.beginPath();
    for (let px = 30; px < w - 10; px++) {
      const s = (px - 30) / (w - 40) * span;
      const b = [...beats].reverse().find(bb => bb.t <= s + 0.12) || beats[0];
      const x = s - b.t;
      let v = st.rhythm === 'af' ? 0.05 * Math.sin(s * 47) + 0.03 * Math.sin(s * 71 + 1) : 0;
      if (st.rhythm !== 'af' && x > -0.13 && x < -0.03) { const p = (x + 0.13) / 0.1; v += 0.12 * (Math.sin(p * Math.PI) + 0.35 * Math.sin(p * 2 * Math.PI) * (p > 0.5 ? 1 : 0)); }
      if (x > -0.01 && x < 0.02) v += 1; else if (x >= 0.02 && x < 0.04) v -= 0.25; else if (x > 0.14 && x < 0.28) v += Math.sin((x - 0.14) / 0.14 * Math.PI) * 0.2;
      px === 30 ? g.moveTo(px, ecgY - v * 18) : g.lineTo(px, ecgY - v * 18);
    }
    g.stroke();
    g.strokeStyle = '#1B2A40'; g.beginPath(); g.moveTo(30, pY); g.lineTo(w - 10, pY); g.stroke();
    const burst = (at, amp, len, color) => {
      if (at > span || at < 0) return;
      g.strokeStyle = color; g.lineWidth = 1.2; g.beginPath();
      for (let k = 0; k <= 40; k++) { const s = at + (k / 40) * len; const a = amp * Math.exp(-k / 14) * (k % 2 ? 1 : -1); k ? g.lineTo(X(s), pY - a * 34) : g.moveTo(X(s), pY); }
      g.stroke();
    };
    const label = (txt, at, color) => { if (at > 0 && at < span) { g.fillStyle = color; g.font = `700 10px ${MONO}`; g.fillText(txt, X(at) - 6, pY + 50); } };
    for (let i = 0; i < beats.length - 1; i++) {
      const { t: t0, rr } = beats[i];
      const isMS = st.mode === 'ms';
      burst(t0 + 0.02, isMS ? 1.15 : 0.8, 0.035, '#E9F2FC'); label('S1', t0 + 0.02, isMS ? '#FF6B9A' : '#9FB4C6');
      const s2 = t0 + SYS + 0.03;
      burst(s2, 0.7, 0.03, '#E9F2FC'); label('S2', s2, '#9FB4C6');
      if (st.mode === 'split') burst(s2 + 0.04, 0.55, 0.03, '#F5C451');
      if (st.mode === 's3') burst(s2 + 0.15, 0.32, 0.05, '#5EEAD4');
      if (isMS) {
        const os = s2 + sv.os;
        burst(os, 0.62, 0.014, '#F5C451'); label('OS', os, '#F5C451');
        // the rumble: low-pitched, from just after the snap; longer the tighter the valve
        const end = t0 + rr + 0.01, a = os + 0.03, dur = (end - a) * sv.rumble;
        g.fillStyle = 'rgba(167,139,250,0.35)'; g.strokeStyle = '#A78BFA'; g.lineWidth = 1;
        g.beginPath();
        const env = x => {          // x: seconds after the start of the rumble
          const base = x < 0.04 ? x / 0.04 : Math.max(0.25, 1 - (x - 0.04) / Math.max(0.2, dur) * 0.7);
          const pre = st.rhythm === 'sinus' ? Math.max(0, 1 - (end - (a + x)) / 0.12) * 1.1 : 0;   // atrial kick: crescendo into S1
          return x > dur && pre === 0 ? 0 : Math.max(x > dur ? 0 : base, pre);
        };
        const N = 50, L = end - a;
        for (let k = 0; k <= N; k++) { const x = k / N * L; const e = env(x) * 0.55 * (0.75 + 0.25 * Math.sin(k * 9.7 + t * 25)); k ? g.lineTo(X(a + x), pY - e * 26) : g.moveTo(X(a), pY); }
        for (let k = N; k >= 0; k--) { const x = k / N * L; g.lineTo(X(a + x), pY + env(x) * 0.55 * 26); }
        g.closePath(); g.fill(); g.stroke();
      }
    }
    g.fillStyle = '#6A7F9B'; g.font = `600 10px ${MONO}`;
    g.fillText(st.rhythm === 'af' ? 'AF · no atrial kick → no presystolic accentuation' : 'Sinus · atrial kick → presystolic crescendo into S1', 30, h - 8);
  }, []);

  // sound
  const start = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const thump = (at, amp, freq, len) => {
      const o = ctx.createOscillator(); o.frequency.value = freq;
      const gg = ctx.createGain(); gg.gain.setValueAtTime(0, at); gg.gain.linearRampToValueAtTime(amp, at + 0.006); gg.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(gg).connect(master); o.start(at); o.stop(at + len + 0.02);
    };
    const rumble = (a, b, amp, pre) => {
      const n = ctx.createBufferSource(); n.buffer = noise; n.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'bandpass'; lp.frequency.value = 90; lp.Q.value = 1.2;
      const gg = ctx.createGain();
      gg.gain.setValueAtTime(0, a); gg.gain.linearRampToValueAtTime(amp, a + 0.04); gg.gain.linearRampToValueAtTime(amp * 0.35, Math.max(a + 0.05, b - 0.13));
      gg.gain.linearRampToValueAtTime(pre ? amp * 1.2 : amp * 0.3, b - 0.01); gg.gain.linearRampToValueAtTime(0, b);
      n.connect(lp).connect(gg).connect(master); n.start(a); n.stop(b + 0.02);
    };
    let next = ctx.currentTime + 0.1, k = 0;
    const schedule = () => {
      const st = S.current, sv = SEVERITY[st.sev];
      while (next < ctx.currentTime + 0.7) {
        const rr = st.rhythm === 'af' ? AF_RR[k % AF_RR.length] : 60 / 76;
        const isMS = st.mode === 'ms';
        thump(next + 0.02, isMS ? 1 : 0.7, isMS ? 75 : 55, 0.07);
        const s2 = next + SYS + 0.03;
        thump(s2, 0.6, 80, 0.05);
        if (st.mode === 'split') thump(s2 + 0.04, 0.5, 70, 0.05);
        if (st.mode === 's3') thump(s2 + 0.15, 0.4, 32, 0.07);
        if (isMS) {
          thump(s2 + sv.os, 0.45, 160, 0.02);
          const a = s2 + sv.os + 0.03, b = next + rr + 0.01;
          rumble(a, a + (b - a) * sv.rumble, 0.5, st.rhythm === 'sinus' && sv.rumble >= 0.99);
          if (st.rhythm === 'sinus' && sv.rumble < 0.99) rumble(b - 0.12, b, 0.5, true);
        }
        next += rr; k++;
      }
    };
    schedule();
    const id = setInterval(schedule, 150);
    audio.current = { ctx, id };
    setPlaying(true);
  };
  const stop = () => { if (audio.current) { clearInterval(audio.current.id); audio.current.ctx.close(); audio.current = null; } setPlaying(false); };
  useEffect(() => () => stop(), []);   // eslint-disable-line

  const check = () => {
    const correct = MYSTERY.filter((m, i) => guess[i] === m.answer).length;
    const res = { correct, of: MYSTERY.length };
    setChecked(res); onIdentify?.(res);
  };
  const sv = SEVERITY[live.sev];
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {Object.entries(SOUNDS).map(([k, v]) => <button key={k} className={'cs-chip' + (mystery == null && mode === k ? ' on' : '')} onClick={() => { setMystery(null); setMode(k); }}>{v.name}</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 200 }} aria-label="Phonocardiogram of mitral stenosis" /></div>
      <div className="cs-ctrls">
        {!playing ? <button className="cs-btn primary" onClick={start}>🔊 Listen</button> : <button className="cs-btn" onClick={stop}>■ Stop</button>}
        <button className={'cs-chip' + (rhythm === 'af' ? ' on' : '')} onClick={() => setRhythm('af')}>AF (hers)</button>
        <button className={'cs-chip' + (rhythm === 'sinus' ? ' on' : '')} onClick={() => setRhythm('sinus')}>Sinus rhythm</button>
      </div>
      {mystery == null && mode === 'ms' && (
        <div className="cs-ctrls">
          <span className="cs-pts">Severity:</span>
          {Object.entries(SEVERITY).map(([k, v]) => <button key={k} className={'cs-chip' + (sev === k ? ' on' : '')} onClick={() => setSev(k)}>{v.label}</button>)}
        </div>
      )}
      <div className="cs-readout">
        <div><span>Listening</span><b style={{ fontSize: 13, fontFamily: 'var(--f-body)' }}>{mystery != null ? `Mystery sound ${'ABC'[mystery]}` : SOUNDS[mode].name}</b></div>
        <div><span>Extra sound after S2</span><b>{live.mode === 'ms' ? `${Math.round(sv.os * 1000)} ms · high-pitched` : live.mode === 'split' ? '40 ms · same pitch as S2' : live.mode === 's3' ? '150 ms · low-pitched' : '—'}</b></div>
        <div><span>Diastolic rumble</span><b>{live.mode === 'ms' ? (sv.rumble >= 0.99 ? 'holodiastolic' : sv.rumble > 0.6 ? 'long' : 'short') : 'none'}</b></div>
      </div>
      {mystery == null && <p className="cs-pts" style={{ marginTop: 8 }}>{SOUNDS[mode].site}. The tighter the valve, the higher the LA pressure — so the leaflets snap open EARLIER after S2 (shorter S2–OS) and the rumble lasts LONGER.</p>}

      <div className="cs-h2" style={{ marginTop: 16 }}>🎯 Name that early-diastolic sound</div>
      <p className="cs-p" style={{ fontSize: 14 }}>Three sounds just after S2. Select each, listen and read the timing and pitch, then name it.</p>
      <div className="cs-grid3">
        {MYSTERY.map((m, i) => (
          <div key={i} className="cs-card tight" style={{ margin: 0, borderColor: mystery === i ? 'var(--cyan)' : undefined }}>
            <button className={'cs-btn' + (mystery === i ? ' primary' : '')} onClick={() => setMystery(i)} style={{ width: '100%' }}>▶ Sound {'ABC'[i]}</button>
            <div className="cs-row" style={{ marginTop: 8 }}>
              {Object.entries(NAMES).map(([k, n]) => (
                <button key={k} className={'cs-chip' + (guess[i] === k ? ' on' : '')} disabled={!!checked} onClick={() => setGuess(gs => ({ ...gs, [i]: k }))}
                  data-mystery={i} data-name={k}>{n}</button>
              ))}
            </div>
            {checked && <p className="cs-pts" style={{ color: guess[i] === m.answer ? 'var(--green)' : 'var(--red)', marginTop: 6 }}>{guess[i] === m.answer ? '✓' : '✗'} {NAMES[m.answer]}</p>}
          </div>
        ))}
      </div>
      {!checked
        ? <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" disabled={Object.keys(guess).length < 3} onClick={check}>Check my answers</button></div>
        : <p className="cs-pts" style={{ marginTop: 8 }}>{checked.correct}/3. Snap: 40–110 ms after S2, HIGH-pitched, followed by a rumble. Split S2: ~30–50 ms, the same pitch as S2, at the base, moves with breathing. S3: 120–180 ms, LOW-pitched thud, no rumble after it.</p>}
      <p className="cs-pts">Use headphones. The sounds are synthesised to teach timing and shape, not recorded from a patient.</p>
    </div>
  );
}

/* ---------- 2 · diastolic filling, gradient and heart rate ---------- */

/** Systole shortens a little as the rate rises; diastole shortens a lot. */
export const systoleAt = hr => 0.4 - 0.001 * hr;
export function msModel({ hr, pregnant = true, af = true, mva = 0.9 }) {
  const dfpBeat = 60 / hr - systoleAt(hr);                 // s of diastole per beat
  const dfpMin = dfpBeat * hr;                              // s of diastole per minute
  const co = (pregnant ? 6.5 : 4.8) * (af ? 0.95 : 1);       // L/min; AF loses the atrial contribution
  const q = co * 1000 / dfpMin;                             // mL/s of diastolic flow across the valve
  const grad = 8 * (q / 153) ** 2 * (0.9 / mva) ** 2 * (af ? 1.2 : 1);   // short AF cycles weigh most
  const la = 8 + grad;                                      // LVEDP ~8 + the gradient
  return { dfpBeat, dfpMin, co, q, grad, la };
}
export const LA_OEDEMA = 22;    // mmHg — the pregnant woman's lower plasma oncotic pressure floods the lungs earlier
export function maxSafeHr(opts) {
  let best = 40;
  for (let hr = 40; hr <= 180; hr++) if (msModel({ ...opts, hr }).la <= LA_OEDEMA) best = hr;
  return best;
}

export function FillingGradient({ onFind, done }) {
  const [hr, setHr] = useState(148);
  const [pregnant, setPregnant] = useState(true);
  const [af, setAf] = useState(true);
  const [mva, setMva] = useState(0.9);
  const [res, setRes] = useState(done || null);
  const ref = useRef(null);
  const m = msModel({ hr, pregnant, af, mva });
  const S = useRef({}); S.current = { hr, af, m };
  useCanvas(ref, 230, (g, w, h, t) => {
    const { hr: r, af: isAf, m: mm } = S.current;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const top = 50, Y = p => h - 22 - Math.min(p, top) / top * (h - 44);
    g.font = `10px ${MONO}`;
    for (const p of [0, 10, 20, 30, 40, 50]) { g.strokeStyle = '#13212D'; g.beginPath(); g.moveTo(34, Y(p)); g.lineTo(w, Y(p)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(p, 6, Y(p) + 3); }
    // oedema line
    g.strokeStyle = 'rgba(255,77,109,0.6)'; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(34, Y(LA_OEDEMA)); g.lineTo(w, Y(LA_OEDEMA)); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#FF8A9B'; g.fillText(`pulmonary oedema > ${LA_OEDEMA} mmHg`, w - 200, Y(LA_OEDEMA) - 4);
    const span = 2.4, X = s => 34 + s / span * (w - 44);
    let s0 = 0, k = 0;
    const sys = systoleAt(r);
    while (s0 < span) {
      const rr = isAf ? AF_RR[k % AF_RR.length] * (90 / r) : 60 / r;
      const dia = Math.max(0.05, rr - sys);
      // systole: dark band, LV off the top of the scale
      g.fillStyle = 'rgba(242,210,75,0.08)'; g.fillRect(X(s0), 18, X(s0 + sys) - X(s0), h - 40);
      // diastole: this beat's gradient — short cycles leave no time for the LA to empty
      const gBeat = mm.grad * Math.min(2.2, (60 / r - sys) / dia) ** 1.0;
      const laStart = 8 + gBeat * 1.15, laEnd = 8 + gBeat * 0.75;
      const lv = x => 3 + x * 6;
      const la = x => laStart + (laEnd - laStart) * Math.sqrt(x) + (!isAf && x > 0.82 ? (x - 0.82) / 0.18 * 6 : 0);
      g.fillStyle = 'rgba(255,107,154,0.25)';
      for (let px = X(s0 + sys); px < X(s0 + sys + dia) && px < w; px += 1.5) { const x = (px - X(s0 + sys)) / (X(s0 + sys + dia) - X(s0 + sys)); g.fillRect(px, Y(la(x)), 1.5, Y(lv(x)) - Y(la(x))); }
      g.strokeStyle = '#A78BFA'; g.lineWidth = 2; g.beginPath();
      for (let px = X(s0 + sys); px < X(s0 + sys + dia) && px < w; px += 1.5) { const x = (px - X(s0 + sys)) / (X(s0 + sys + dia) - X(s0 + sys)); px === X(s0 + sys) ? g.moveTo(px, Y(la(x))) : g.lineTo(px, Y(la(x))); }
      g.stroke();
      g.strokeStyle = '#F2D24B'; g.beginPath(); g.moveTo(X(s0), Y(lv(1))); g.lineTo(X(s0) + 3, Y(top)); g.moveTo(X(s0 + sys) - 3, Y(top)); g.lineTo(X(s0 + sys), Y(3));
      for (let px = X(s0 + sys); px < X(s0 + sys + dia) && px < w; px += 2) { const x = (px - X(s0 + sys)) / (X(s0 + sys + dia) - X(s0 + sys)); g.lineTo(px, Y(lv(x))); }
      g.stroke();
      s0 += rr; k++;
    }
    g.fillStyle = '#A78BFA'; g.font = `700 12px ${MONO}`; g.fillText(`LA mean ${Math.round(mm.la)} mmHg`, 40, 14);
    g.fillStyle = '#F2D24B'; g.fillText('LV', 210, 14);
    g.fillStyle = '#FF6B9A'; g.fillText(`gradient ${Math.round(mm.grad)}`, 250, 14);
    g.fillStyle = '#6A7F9B'; g.font = `600 10px ${MONO}`; g.fillText('yellow bands = systole · pink = the diastolic gradient', w - 330, h - 6);
  }, []);
  const wet = m.la > LA_OEDEMA;
  const target = maxSafeHr({ pregnant: true, af: true, mva: 0.9 });
  const lock = () => {
    if (!(pregnant && af && mva === 0.9)) return;
    const r = { hr, target, close: Math.abs(hr - target) <= 8 };
    setRes(r); onFind?.(r);
  };
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 230 }} aria-label="Left atrial and left ventricular pressures in diastole" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Heart rate
          <input type="range" min="50" max="160" step="1" value={hr} onChange={e => setHr(+e.target.value)} style={{ width: '100%' }} aria-label="Heart rate" />
        {hr}/min</label>
      </div>
      <div className="cs-ctrls">
        <button className={'cs-chip' + (pregnant ? ' on' : '')} onClick={() => setPregnant(p => !p)}>{pregnant ? '🤰 Pregnant: CO 6.5 L/min' : 'Not pregnant: CO 4.8 L/min'}</button>
        <button className={'cs-chip' + (af ? ' on' : '')} onClick={() => setAf(a => !a)}>{af ? 'AF' : 'Sinus'}</button>
        {[0.9, 1.8].map(v => <button key={v} className={'cs-chip' + (mva === v ? ' on' : '')} onClick={() => setMva(v)}>MVA {v} cm²{v === 0.9 ? ' (hers)' : ' (after balloon)'}</button>)}
      </div>
      <div className="cs-readout">
        <div><span>Diastole per beat</span><b>{Math.round(m.dfpBeat * 1000)} ms</b></div>
        <div><span>Diastole per minute</span><b>{m.dfpMin.toFixed(0)} s</b></div>
        <div><span>Mean gradient</span><b style={{ color: m.grad > 10 ? 'var(--red)' : undefined }}>{Math.round(m.grad)} mmHg</b></div>
        <div><span>Lungs</span><b style={{ color: wet ? 'var(--red)' : 'var(--green)' }}>{wet ? '🌊 wet' : 'dry'}</b></div>
      </div>
      <div className="cs-ctrls">
        <button className="cs-btn primary" disabled={!!res || !(pregnant && af && mva === 0.9)} onClick={lock}>🎯 Lock this as her heart-rate ceiling</button>
        {!(pregnant && af && mva === 0.9) && !res && <span className="cs-pts">Set her conditions (pregnant · AF · 0.9 cm²) to lock a target.</span>}
      </div>
      {res && <p className="cs-pts" style={{ marginTop: 6, color: res.close ? 'var(--green)' : 'var(--amber)' }}>You chose {res.hr}/min. In this model her LA stays dry up to about {res.target}/min — the ceiling the beta-blocker has to get her under.</p>}
      <p className="cs-pts" style={{ marginTop: 6 }}>Task: pregnant, in AF, valve 0.9 cm² — find the HIGHEST heart rate at which her LA pressure stays at or below {LA_OEDEMA} mmHg. Then try sinus rhythm, and the valve after a balloon.</p>
    </div>
  );
}

/* ---------- 3 · pressure half-time ---------- */

/**
 * CW Doppler of mitral inflow from the apex: diastolic envelopes above the
 * baseline. After a brief early drop, the E-wave decelerates slowly along a
 * straight slope. The learner lays a line along the MID-diastolic slope; the
 * deceleration time follows, PHT = 0.29 × DT, MVA = 220 / PHT.
 */
export function PHTDoppler({ pht = 240, onMeasure, done }) {
  const ref = useRef(null);
  const v0 = 2.0;                                  // m/s at the knee, where the long slope starts
  const dtTrue = pht / 0.293 / 1000;                // s
  const slopeTrue = v0 / dtTrue;                    // m/s per s
  const [slope, setSlope] = useState(5.5);
  const S = useRef({}); S.current = { slope };
  useCanvas(ref, 240, (g, w, h, t) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const base = h - 26, top = 22, vmaxScale = 3, Y = v => base - v / vmaxScale * (base - top);
    g.strokeStyle = '#2B3B4E'; g.fillStyle = '#6A7F9B'; g.font = `10px ${MONO}`;
    for (let v = 0; v <= 3; v++) { g.beginPath(); g.moveTo(40, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.fillText(`${v}`, 6, Y(v) + 3); }
    g.fillText('m/s', 6, 14);
    const span = 2.4, X = s => 44 + s / span * (w - 54);
    let s0 = 0.05, k = 0;
    const firstDia = [];
    while (s0 < span) {
      const rr = AF_RR[(k + 3) % AF_RR.length] * 0.95, sys = 0.28, dia = rr - sys;
      const a = s0 + sys;
      for (let px = X(a); px < X(a + dia) && px < w; px += 1.5) {
        const x = (px - X(a)) / (X(a + dia) - X(a)) * dia;
        let v = x < 0.03 ? x / 0.03 * 2.3 : x < 0.07 ? 2.3 - (x - 0.03) / 0.04 * 0.3 : Math.max(0, v0 - slopeTrue * (x - 0.07));
        for (let j = 0; j < 7; j++) { const vv = v * Math.random(); g.fillStyle = `rgba(230,230,230,${0.25 + Math.random() * 0.45})`; g.fillRect(px, Y(vv), 1.5, 2); }
        g.fillStyle = 'rgba(245,245,245,0.95)'; g.fillRect(px, Y(v) - 1, 1.5, 2);
      }
      if (k === 1) firstDia.push(a, dia);
      s0 += rr; k++;
    }
    // the learner's slope, laid from the knee of the second beat
    const [a, dia] = firstDia.length ? firstDia : [0.9, 0.5];
    const kx = a + 0.07, sl = S.current.slope;
    const tEnd = Math.min(kx + v0 / sl, kx + 0.9);
    g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(kx), Y(v0)); g.lineTo(X(tEnd), Y(Math.max(0, v0 - sl * (tEnd - kx)))); g.stroke();
    g.fillStyle = '#F5C451'; g.beginPath(); g.arc(X(kx), Y(v0), 4, 0, Math.PI * 2); g.fill();
    // half-time marker: v0/√2
    const tHalf = kx + (v0 - v0 / Math.SQRT2) / sl;
    g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(tHalf), Y(v0 / Math.SQRT2)); g.lineTo(X(tHalf), base); g.stroke(); g.setLineDash([]);
    g.font = `700 11px ${MONO}`; g.fillText('PHT', X((kx + tHalf) / 2) - 10, base + 14);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText('CW · MITRAL INFLOW · APICAL 4C · AF', 50, 14);
  }, []);
  const dt = v0 / slope * 1000, phtM = 0.293 * dt, mva = 220 / phtM;
  const close = Math.abs(phtM - pht) <= 25;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 240 }} aria-label="Continuous-wave Doppler of mitral inflow" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Flat
          <input type="range" min="1" max="12" step="0.05" value={slope} disabled={!!done} onChange={e => setSlope(+e.target.value)} style={{ width: '100%' }} aria-label="Deceleration slope" />
        Steep</label>
      </div>
      <div className="cs-readout">
        <div><span>Deceleration time</span><b>{Math.round(dt)} ms</b></div>
        <div><span>PHT = 0.29 × DT</span><b>{Math.round(phtM)} ms</b></div>
        <div><span>MVA = 220 / PHT</span><b style={{ color: mva <= 1 ? 'var(--red)' : mva <= 1.5 ? 'var(--amber)' : 'var(--green)' }}>{mva.toFixed(2)} cm²</b></div>
      </div>
      <div className="cs-ctrls"><button className="cs-btn primary" disabled={!!done} onClick={() => onMeasure?.({ pht: phtM, mva, close })}>📏 Measure</button></div>
      <p className="cs-pts" style={{ marginTop: 6 }}>Lay the yellow line along the long, straight MID-diastolic slope of the envelope — not the brief steep drop just after the peak. In AF, average several beats and avoid the shortest cycles.</p>
    </div>
  );
}

/* ---------- 4 · planimetry ---------- */

/**
 * Parasternal short axis. A rheumatic valve is a funnel: the orifice is
 * narrowest at the leaflet TIPS. Sweep the scan plane, set the gain, then
 * size the trace to the inner edge of the fish-mouth orifice.
 */
export function Planimetry({ area = 0.9, onMeasure, done }) {
  const ref = useRef(null);
  const [level, setLevel] = useState(0.2);       // 0 = annulus/base … 1 = leaflet tips
  const [gain, setGain] = useState('low');
  const [size, setSize] = useState(1.6);          // trace width, cm
  const shown = lv => area * (1 + 1.8 * (1 - lv) ** 1.4);     // the funnel
  const gainF = { low: 1.25, normal: 1, high: 0.78 };
  const S = useRef({}); S.current = { level, gain, size };
  const ASPECT = 2.4;
  useCanvas(ref, 260, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.52, cm = 52;
    g.save(); g.beginPath(); g.moveTo(cx, 0); g.arc(cx, 0, h * 1.2, Math.PI / 2 - 0.75, Math.PI / 2 + 0.75); g.closePath(); g.clip();
    for (let i = 0; i < 2200; i++) { const a = Math.PI / 2 + (Math.random() - 0.5) * 1.5, rr = Math.random() * h * 1.2; g.fillStyle = `rgba(190,190,190,${Math.random() * (st.gain === 'high' ? 0.18 : st.gain === 'low' ? 0.05 : 0.1)})`; g.fillRect(cx + Math.cos(a) * rr, Math.sin(a) * rr, 2, 2); }
    // LV myocardium ring
    g.strokeStyle = `rgba(200,200,200,${st.gain === 'low' ? 0.35 : 0.6})`; g.lineWidth = 16; g.beginPath(); g.ellipse(cx, cy, 3.3 * cm, 2.6 * cm, 0, 0, Math.PI * 2); g.stroke();
    // orifice: apparent area at this level and gain; the open/close pulse is small (a stiff valve)
    const breathe = 0.94 + 0.06 * Math.sin(t * 6);
    const A = shown(st.level) * gainF[st.gain] * breathe;           // cm²
    const ow = Math.sqrt(A * 4 / Math.PI * ASPECT), oh = ow / ASPECT;   // cm
    // thickened leaflets: a thick bright rim; fused commissures brighter
    const thick = st.gain === 'high' ? 18 : st.gain === 'low' ? 7 : 12;
    g.strokeStyle = `rgba(235,235,235,${st.gain === 'low' ? 0.45 : 0.85})`; g.lineWidth = thick;
    g.beginPath(); g.ellipse(cx, cy, ow / 2 * cm + thick / 2, oh / 2 * cm + thick / 2, 0, 0, Math.PI * 2); g.stroke();
    if (st.gain === 'low') { g.fillStyle = '#000'; for (const a of [0.5, 2.1, 3.9, 5.2]) g.fillRect(cx + Math.cos(a) * ow / 2 * cm - 4, cy + Math.sin(a) * oh / 2 * cm - 6, 8, 12); }  // dropout
    g.fillStyle = 'rgba(255,255,255,0.9)';
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * (ow / 2 * cm + 10), cy, 12, 7, 0, 0, Math.PI * 2); g.fill(); }   // fused commissures
    g.restore();
    // the trace
    const tw = st.size, th = tw / ASPECT;
    g.strokeStyle = '#F5C451'; g.setLineDash([5, 4]); g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, tw / 2 * cm, th / 2 * cm, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText('PSAX · MITRAL VALVE', 10, 16);
    g.fillText(st.level > 0.85 ? 'level: LEAFLET TIPS' : st.level > 0.5 ? 'level: mid-leaflet' : 'level: near the annulus', 10, 32);
    g.fillText('A', cx - 4, cy - 2.0 * cm); g.fillText('P', cx - 4, cy + 2.1 * cm);
    g.fillStyle = '#E9F2FC'; g.fillText('commissures fused', cx + ow / 2 * cm + 22, cy + 4);
  }, []);
  const traced = Math.PI / 4 * size * (size / ASPECT);
  const apparent = shown(level) * gainF[gain];
  const fit = Math.abs(traced - apparent) <= 0.15;
  const close = level >= 0.88 && gain === 'normal' && fit;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 260 }} aria-label="Parasternal short-axis view of the mitral orifice" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Base<input type="range" min="0" max="1" step="0.01" value={level} disabled={!!done} onChange={e => setLevel(+e.target.value)} style={{ width: '100%' }} aria-label="Scan plane level" />Tips</label>
      </div>
      <div className="cs-ctrls">
        <span className="cs-pts">Gain:</span>
        {['low', 'normal', 'high'].map(k => <button key={k} className={'cs-chip' + (gain === k ? ' on' : '')} disabled={!!done} onClick={() => setGain(k)}>{k}</button>)}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Trace<input type="range" min="0.8" max="3.4" step="0.01" value={size} disabled={!!done} onChange={e => setSize(+e.target.value)} style={{ width: '100%' }} aria-label="Trace size" />{traced.toFixed(2)} cm²</label>
        <button className="cs-btn primary" disabled={!!done} onClick={() => onMeasure?.({ level, gain, area: traced, close, fit })}>📏 Measure</button>
      </div>
      <p className="cs-pts" style={{ marginTop: 6 }}>Sweep to the smallest orifice — the leaflet tips — with the gain set so the rim is crisp but not blooming. Then trace the INNER edge of the orifice in mid-diastole.</p>
    </div>
  );
}

/* ---------- 5 · Wilkins score ---------- */

export const WILKINS = [
  { k: 'mob', name: 'Leaflet mobility', grades: ['Highly mobile; only the tips restricted', 'Mid and basal leaflet mobility normal', 'Moves forward in diastole mainly from the base', 'No or minimal forward movement in diastole'] },
  { k: 'thick', name: 'Leaflet thickening', grades: ['Near normal (4–5 mm)', 'Mid-leaflets normal; margins thickened (5–8 mm)', 'Thickening through the whole leaflet (5–8 mm)', 'Marked thickening of all leaflet tissue (> 8–10 mm)'] },
  { k: 'calc', name: 'Calcification', grades: ['A single area of increased brightness', 'Scattered bright areas confined to the margins', 'Brightness extending into the mid-leaflets', 'Extensive brightness through most of the leaflet'] },
  { k: 'sub', name: 'Subvalvular thickening', grades: ['Minimal, just below the leaflets', 'Chordae thickened up to one-third of their length', 'Thickening extending to the distal third of the chordae', 'Extensive thickening and shortening of all chordae down to the papillary muscles'] },
];
export const HER_WILKINS = { mob: 2, thick: 2, calc: 1, sub: 2 };

export function WilkinsBuilder({ onScore, done }) {
  const [sel, setSel] = useState(done?.sel || {});
  const total = WILKINS.reduce((n, c) => n + (sel[c.k] || 0), 0);
  const complete = WILKINS.every(c => sel[c.k]);
  const submit = () => {
    const right = WILKINS.filter(c => sel[c.k] === HER_WILKINS[c.k]).length;
    onScore?.({ sel, total, right });
  };
  return (
    <div className="cs-card tight">
      <div className="cs-grid2">
        {WILKINS.map(c => (
          <div key={c.k}>
            <div className="cs-pts" style={{ marginBottom: 6, color: 'var(--cyan)' }}>{c.name}</div>
            <div className="cs-opts">
              {c.grades.map((gr, i) => {
                const n = i + 1, on = sel[c.k] === n;
                const cls = done ? (HER_WILKINS[c.k] === n ? 'best' : on ? 'wrong' : 'dim') : on ? 'sel' : '';
                return (
                  <button key={n} className={'cs-opt ' + cls} disabled={!!done} onClick={() => setSel(s => ({ ...s, [c.k]: n }))} data-wk={c.k} data-grade={n}>
                    <span className="cs-opt-k">{n}</span><span style={{ fontSize: 14 }}>{gr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="cs-readout" style={{ marginTop: 12 }}>
        <div><span>Wilkins score</span><b style={{ color: complete ? (total <= 8 ? 'var(--green)' : 'var(--red)') : undefined }}>{complete ? total : '—'} / 16</b></div>
        <div><span>Verdict</span><b style={{ fontSize: 13, fontFamily: 'var(--f-body)' }}>{!complete ? 'grade all four' : total <= 8 ? 'Favourable for balloon commissurotomy' : total <= 10 ? 'Intermediate — commissural calcium and MR decide' : 'Unfavourable — surgery usually better'}</b></div>
      </div>
      {!done && <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" disabled={!complete} onClick={submit}>✅ Submit the score</button></div>}
    </div>
  );
}

/* ---------- 6 · Inoue balloon commissurotomy ---------- */

const MR_NAMES = ['trace', 'mild', 'moderate', 'severe'];
const MVA_AT = { 23: 1.05, 24: 1.15, 25: 1.3, 26: 1.75, 27: 1.95, 28: 2.15 };
export const inoueReference = heightCm => Math.round(heightCm / 10 + 10);

/**
 * RAO fluoroscopy. The balloon is already across the septum in the LA.
 * Aim the stylet at the LV apex and cross; inflate the distal balloon and
 * pull it back onto the valve; then inflate fully, size by size.
 * onResult({ sizes, mva, mr, gradient, commissures, crossErrors, grade })
 */
export function InoueBalloon({ heightCm = 162, onResult, done }) {
  const ref = useRef(null);
  const R = inoueReference(heightCm);
  const [aim, setAim] = useState(35);              // degrees: 0 = straight at the apex
  const [phase, setPhase] = useState(done ? 'done' : 'la');   // la | lv | hooked | inflating | assess | done
  const [size, setSize] = useState(R - 2);
  const [st, setSt] = useState(done || { sizes: [], mva: 0.9, mr: 0, gradient: 14, commissures: 0, crossErrors: 0, la: 28 });
  const [msg, setMsg] = useState('');
  const t0 = useRef(0);
  const S = useRef({}); S.current = { aim, phase, size, st };
  useCanvas(ref, 300, (g, w, h, t) => {
    const s = S.current;
    g.fillStyle = '#A3A3A0'; g.fillRect(0, 0, w, h);
    const grd = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7); grd.addColorStop(0, 'rgba(255,255,255,0.2)'); grd.addColorStop(1, 'rgba(0,0,0,0.5)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const sc = Math.min(w / 520, 1.2);
    const mvx = w * 0.5, mvy = h * 0.42;                 // mitral valve centre
    const apex = { x: mvx - 150 * sc, y: mvy + 150 * sc };
    const beat = Math.sin(t * 9) * 2;
    // LA (large, top right) and LV (bottom left) silhouettes
    g.strokeStyle = 'rgba(40,40,40,0.35)'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(mvx + 70 * sc, mvy - 70 * sc, 110 * sc, 80 * sc, 0.5, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(mvx - 75 * sc, mvy + 75 * sc, Math.max(1, 70 * sc + beat), Math.max(1, 125 * sc + beat), -0.78, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(30,30,30,0.6)'; g.font = `600 11px ${MONO}`;
    g.fillText('LA', mvx + 110 * sc, mvy - 90 * sc); g.fillText('LV', mvx - 120 * sc, mvy + 100 * sc); g.fillText('apex', apex.x - 30, apex.y + 24);
    // mitral plane (calcified rim faintly visible)
    g.strokeStyle = 'rgba(30,30,30,0.5)'; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(mvx - 40 * sc, mvy - 40 * sc); g.lineTo(mvx + 40 * sc, mvy + 40 * sc); g.stroke(); g.setLineDash([]);
    // septal crossing point and the catheter shaft
    const sx = mvx + 160 * sc, sy = mvy - 40 * sc;
    g.strokeStyle = 'rgba(15,15,15,0.9)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(w, sy + 60 * sc); g.quadraticCurveTo(sx + 30 * sc, sy + 20 * sc, sx, sy);
    // where is the balloon?
    const dir = (135 + s.aim) * Math.PI / 180;          // 135° points from the valve down to the apex on this view
    let bx, by, inside = false;
    if (s.phase === 'la') { bx = mvx + 40 * sc; by = mvy - 30 * sc; }
    else { bx = mvx - 25 * sc; by = mvy + 25 * sc; inside = true; }
    g.quadraticCurveTo(mvx + 90 * sc, mvy - 80 * sc, bx, by); g.stroke();
    // the balloon
    g.save(); g.translate(bx, by); g.rotate(s.phase === 'la' ? dir : Math.PI * 0.75);
    g.strokeStyle = 'rgba(10,10,10,0.95)'; g.lineWidth = 2; g.fillStyle = 'rgba(60,60,60,0.35)';
    const L = 46 * sc;
    if (s.phase === 'la' || s.phase === 'lv' || s.phase === 'assess' || s.phase === 'done') {
      g.beginPath(); g.ellipse(L * 0.5, 0, L * 0.55, 5 * sc, 0, 0, Math.PI * 2); g.fill(); g.stroke();    // slender, deflated
    } else if (s.phase === 'hooked') {
      g.beginPath(); g.ellipse(L * 0.85, 0, 16 * sc, 16 * sc, 0, 0, Math.PI * 2); g.fill(); g.stroke();   // distal part inflated in the LV
      g.beginPath(); g.ellipse(L * 0.25, 0, L * 0.3, 5 * sc, 0, 0, Math.PI * 2); g.stroke();
    } else if (s.phase === 'inflating') {
      const k = Math.min(1, (performance.now() - t0.current) / 1600);
      const r = (12 + 6 * k) * sc * (s.size / 26);
      const waist = k < 0.6 ? r * (0.35 + k * 0.4) : r * Math.min(1, 0.6 + (k - 0.6) * 2);     // the hourglass, then the waist gives
      g.beginPath(); g.ellipse(L * 0.85, 0, r, r, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(L * 0.15, 0, r, r, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = 'rgba(60,60,60,0.5)'; g.fillRect(L * 0.15, -waist, L * 0.7, waist * 2);
    }
    g.restore();
    // aim guide in the LA
    if (s.phase === 'la') {
      g.strokeStyle = Math.abs(s.aim) <= 12 ? 'rgba(20,120,60,0.9)' : 'rgba(150,30,30,0.8)'; g.setLineDash([6, 5]); g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + Math.cos(dir) * 230 * sc, by + Math.sin(dir) * 230 * sc); g.stroke(); g.setLineDash([]);
    }
    // HUD
    g.fillStyle = '#04121A'; g.fillRect(8, 8, 230, 66);
    g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`;
    g.fillText(`RAO 30° · Inoue ${s.size} mm`, 16, 26);
    g.fillStyle = '#E9F2FC'; g.fillText(`MVA ${s.st.mva.toFixed(2)} cm² · grad ${s.st.gradient}`, 16, 44);
    g.fillStyle = s.st.mr >= 2 ? '#FF4D6D' : '#34E39A'; g.fillText(`MR ${MR_NAMES[s.st.mr]} · LA ${s.st.la} mmHg`, 16, 62);
  }, []);

  const cross = () => {
    if (Math.abs(aim) <= 12) { setMsg('Across: the slender balloon slides through the orifice and points at the apex.'); setPhase('lv'); return; }
    setSt(x => ({ ...x, crossErrors: x.crossErrors + 1 }));
    setMsg(aim > 12 ? 'The tip dives posteriorly into the subvalvular apparatus — an inflation here could tear a chord or papillary muscle. Withdraw, rotate the stylet, re-aim at the apex.'
      : 'The tip points at the septum/outflow and keeps bouncing back into the LA. Re-aim toward the apex.');
  };
  const inflate = () => {
    t0.current = performance.now();
    setPhase('inflating');
    setTimeout(() => {
      setSt(x => {
        const prev = x.sizes[x.sizes.length - 1];
        const jump = prev ? size - prev : size - (R - 2);
        let mr = x.mr;
        if (size > R) mr = Math.min(3, mr + 2);
        else if (jump >= 2) mr = Math.min(3, mr + 1);
        else if (size === R) mr = Math.max(mr, 1);
        const mva = Math.max(x.mva, MVA_AT[size] || x.mva);
        const commissures = size >= 26 ? 2 : size >= 25 ? 1 : 0;
        const gradient = Math.round(12 * (0.9 / mva) ** 1.6);
        const la = 8 + gradient + (mr === 3 ? 18 : mr === 2 ? 7 : 0);
        return { ...x, sizes: [...x.sizes, size], mva, mr, commissures: Math.max(x.commissures, commissures), gradient, la };
      });
      setPhase('assess');
      setMsg('Balloon deflated and pulled back into the LA. Read the echo and the LA pressure before you decide on another inflation.');
    }, 1700);
  };
  const finish = () => {
    const x = st;
    const stepwise = x.sizes.every((s, i) => i === 0 ? s <= R - 1 : s - x.sizes[i - 1] <= 1);
    const grade = x.mr >= 3 ? 'wrong' : x.mva >= 1.5 && x.mr <= 1 && stepwise && x.sizes.every(s => s <= R) ? 'best' : 'ok';
    const res = { ...x, stepwise, grade, R };
    setPhase('done'); onResult?.(res);
  };
  const busy = phase === 'inflating';
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 300 }} aria-label="Fluoroscopy of an Inoue balloon mitral commissurotomy" /></div>
      {phase === 'la' && (
        <div className="cs-ctrls">
          <label className="cs-slider" style={{ flex: 1 }}>Septal<input type="range" min="-45" max="45" step="1" value={aim} onChange={e => setAim(+e.target.value)} style={{ width: '100%' }} aria-label="Stylet direction" />Posterior</label>
          <button className="cs-btn primary" onClick={cross}>➡️ Advance across the valve</button>
        </div>
      )}
      {phase === 'lv' && <div className="cs-ctrls"><button className="cs-btn primary" onClick={() => setPhase('hooked')}>🎈 Inflate the distal balloon and pull back onto the valve</button></div>}
      {(phase === 'hooked' || phase === 'assess') && (
        <>
          <div className="cs-ctrls">
            <span className="cs-pts">Inflate to:</span>
            {[23, 24, 25, 26, 27, 28].map(v => <button key={v} className={'cs-chip' + (size === v ? ' on' : '')} disabled={busy} onClick={() => setSize(v)} data-size={v}>{v} mm{v === R ? ' (ref)' : ''}</button>)}
          </div>
          <div className="cs-ctrls">
            {phase === 'hooked'
              ? <button className="cs-btn primary" onClick={inflate}>💥 Full inflation — {size} mm</button>
              : <button className="cs-btn primary" onClick={() => { setPhase('hooked'); setMsg('Re-crossed and hooked on the valve.'); }}>🔁 Re-cross for another inflation</button>}
            {phase === 'assess' && <button className="cs-btn" onClick={finish}>🛑 Stop here — end the procedure</button>}
          </div>
        </>
      )}
      {msg && <p className="cs-pts" style={{ marginTop: 6, color: msg.startsWith('The tip') ? 'var(--amber)' : undefined }}>{msg}</p>}
      {st.sizes.length > 0 && (
        <div className="cs-readout">
          <div><span>Inflations</span><b>{st.sizes.join(' → ')} mm</b></div>
          <div><span>Commissures split</span><b>{['none', 'one', 'both'][st.commissures]}</b></div>
          <div><span>MR on echo</span><b style={{ color: st.mr >= 2 ? 'var(--red)' : 'var(--green)' }}>{MR_NAMES[st.mr]}</b></div>
          <div><span>MVA · mean gradient</span><b>{st.mva.toFixed(2)} cm² · {st.gradient} mmHg</b></div>
        </div>
      )}
      <p className="cs-pts" style={{ marginTop: 6 }}>Reference size for {heightCm} cm: {R} mm (height/10 + 10). Start ~2 mm below it, go up 1 mm at a time, and check echo after every inflation. Stop at MVA ≥ 1.5 cm² with both commissures open — or at the first rise in MR.</p>
    </div>
  );
}

/* ---------- 7 · pericardiocentesis ---------- */

/**
 * Subxiphoid approach, sagittal sketch: the patient supine (head to the
 * right). Choose the aim and the angle to the skin, advance, aspirate.
 * onResult({ attempts, rvTouch, liverHit, confirmed, drained })
 */
export function Pericardiocentesis({ onDrain, onResult, done }) {
  const ref = useRef(null);
  const [ang, setAng] = useState(60);
  const [aimTo, setAimTo] = useState('right');
  const [depth, setDepth] = useState(0);
  const [log, setLog] = useState(done ? { ...done } : { attempts: 0, rvTouch: 0, liverHit: 0, confirmed: false, drained: 0, inFluid: false });
  const [msg, setMsg] = useState('');
  const S = useRef({}); S.current = { ang, depth, log, aimTo };
  const zone = (a, d, to) => {
    if (to === 'right') return d > 3.5 ? 'liver' : 'tissue';
    if (a > 55) return d > 3 ? 'liver' : 'tissue';
    if (a < 22) return d > 4.5 ? 'cartilage' : 'tissue';
    const start = 5 + Math.abs(a - 38) / 10, end = start + (to === 'left' ? 1.6 : 0.9);
    return d < start ? 'tissue' : d <= end ? 'fluid' : 'rv';
  };
  useCanvas(ref, 290, (g, w, h, t) => {
    const s = S.current;
    g.fillStyle = '#05070A'; g.fillRect(0, 0, w, h);
    const ex = w * 0.2, ey = 40, cm = Math.min(30, w / 14);
    // skin, xiphoid, liver, diaphragm, heart with its effusion
    g.fillStyle = '#3A2A22'; g.fillRect(0, 0, w, ey);
    g.fillStyle = '#E8D3C0'; g.font = `600 10px ${MONO}`; g.fillText('SKIN · subxiphoid', 8, 14); g.fillText('feet ←', 8, 30); g.fillText('→ head', w - 60, 30);
    g.fillStyle = 'rgba(230,230,230,0.5)'; g.fillRect(ex + 0.4 * cm, ey, 3.4 * cm, 0.5 * cm); g.fillStyle = '#9FB4C6'; g.fillText('xiphoid / costal margin', ex + 0.5 * cm, ey + 0.5 * cm + 12);
    g.fillStyle = 'rgba(120,50,40,0.6)'; g.beginPath(); g.ellipse(ex - 0.2 * cm, ey + 5 * cm, 3.6 * cm, 3 * cm, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#D9A79A'; g.fillText('LIVER', ex - 1.4 * cm, ey + 5 * cm);
    const hx = ex + 5.6 * cm, hy = ey + 5.2 * cm;
    const beat = 1 + 0.03 * Math.sin(t * 8.5);
    g.fillStyle = '#000'; g.strokeStyle = 'rgba(230,230,230,0.7)'; g.lineWidth = 3;
    g.beginPath(); g.ellipse(hx, hy, 3.0 * cm, 2.2 * cm, -0.35, 0, Math.PI * 2); g.fill(); g.stroke();    // pericardium + effusion
    g.fillStyle = 'rgba(170,170,170,0.6)'; g.beginPath(); g.ellipse(hx + 0.2 * cm, hy + 0.15 * cm, 2.3 * cm * beat, 1.55 * cm * beat, -0.35, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#9FB4C6'; g.fillText('effusion', hx - 2.8 * cm, hy - 1.6 * cm); g.fillText('RV', hx - 0.4 * cm, hy + 0.2 * cm);
    // the needle
    const a = s.ang * Math.PI / 180, d = s.depth;
    const nx = ex + Math.cos(a) * d * cm, ny = ey + Math.sin(a) * d * cm;
    const z = zone(s.ang, d, s.aimTo);
    g.strokeStyle = z === 'rv' ? '#FF4D6D' : z === 'fluid' ? '#34E39A' : '#F5C451'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(ex - Math.cos(a) * 1.4 * cm, ey - Math.sin(a) * 1.4 * cm); g.lineTo(nx, ny); g.stroke();
    g.fillStyle = g.strokeStyle; g.beginPath(); g.arc(nx, ny, 3, 0, Math.PI * 2); g.fill();
    // guide line
    g.strokeStyle = 'rgba(245,196,81,0.25)'; g.setLineDash([4, 5]); g.lineWidth = 1; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + Math.cos(a) * 10 * cm, ey + Math.sin(a) * 10 * cm); g.stroke(); g.setLineDash([]);
    // HUD
    g.fillStyle = '#04121A'; g.fillRect(w - 230, 46, 222, 62);
    g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`;
    g.fillText(`${s.ang}° to skin · aim ${s.aimTo === 'left' ? 'L shoulder' : s.aimTo === 'right' ? 'R shoulder' : 'sternal notch'}`, w - 222, 64);
    g.fillText(`depth ${d.toFixed(1)} cm`, w - 222, 82);
    g.fillStyle = z === 'rv' ? '#FF4D6D' : '#9FB4C6'; g.fillText(z === 'rv' ? 'ECG: ST ↑ — myocardial contact!' : s.log.drained ? `drained ${s.log.drained} mL` : '', w - 222, 100);
  }, []);
  const aspirate = () => {
    const z = zone(ang, depth, aimTo);
    setLog(l => {
      const n = { ...l, attempts: l.attempts + 1 };
      if (z === 'fluid') { n.inFluid = true; setMsg('Non-clotting, blood-stained fluid flows freely. Confirm before you dilate: agitated saline should light up the pericardial space, not a chamber.'); }
      else if (z === 'rv') { n.rvTouch++; setMsg('Bright, pulsatile blood and ST elevation from the needle tip touching myocardium. Pull back slowly until the fluid returns — never advance against the beating heart.'); }
      else if (z === 'liver') { n.liverHit++; setMsg('Dark blood, no flow, no pulsation: you are in the liver. Withdraw, flatten the angle and aim at the LEFT shoulder.'); }
      else if (z === 'cartilage') setMsg('The needle meets the costal cartilage and stays too shallow. Lift the hub: steepen the angle a little.');
      else setMsg('Nothing yet. Advance a few millimetres at a time, aspirating as you go.');
      return n;
    });
  };
  const confirm = () => { setLog(l => ({ ...l, confirmed: true })); setMsg('Bubbles swirl in the pericardial space around — not inside — the RV. You are in. Wire, dilate, place the pigtail.'); };
  const drain = () => {
    setLog(l => {
      const n = { ...l, drained: l.drained + 80 };
      onDrain?.(n.drained);
      if (n.drained >= 240) { setMsg(`${n.drained} mL out. The pressure is coming back with every syringe.`); onResult?.(n); }
      return n;
    });
  };
  const ready = log.inFluid && zone(ang, depth, aimTo) === 'fluid';
  const finished = log.drained >= 240;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 290 }} aria-label="Subxiphoid pericardiocentesis, sagittal sketch" /></div>
      <div className="cs-ctrls">
        <span className="cs-pts">Aim at:</span>
        {[['left', 'Left shoulder'], ['notch', 'Sternal notch'], ['right', 'Right shoulder']].map(([k, l]) => <button key={k} className={'cs-chip' + (aimTo === k ? ' on' : '')} disabled={log.inFluid} onClick={() => { setAimTo(k); setDepth(0); }}>{l}</button>)}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Angle to skin<input type="range" min="10" max="70" step="1" value={ang} disabled={log.inFluid} onChange={e => { setAng(+e.target.value); setDepth(0); }} style={{ width: '100%' }} aria-label="Needle angle to the skin" />{ang}°</label>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Depth<input type="range" min="0" max="9" step="0.1" value={depth} disabled={finished} onChange={e => setDepth(+e.target.value)} style={{ width: '100%' }} aria-label="Needle depth" />{depth.toFixed(1)} cm</label>
      </div>
      <div className="cs-ctrls">
        <button className="cs-btn" disabled={finished} onClick={aspirate}>💉 Aspirate</button>
        <button className="cs-btn" disabled={!ready || log.confirmed} onClick={confirm}>🫧 Agitated saline</button>
        <button className="cs-btn primary" disabled={!ready || !log.confirmed || finished} onClick={drain}>🩸 Drain 80 mL</button>
      </div>
      {msg && <p className="cs-pts" style={{ marginTop: 6, color: /ST elevation|liver/.test(msg) ? 'var(--red)' : undefined }}>{msg}</p>}
      <p className="cs-pts" style={{ marginTop: 6 }}>Echo-guided where possible. Subxiphoid: just below and left of the xiphoid, 30–45° to the skin, toward the LEFT shoulder, aspirating as you advance.</p>
    </div>
  );
}
