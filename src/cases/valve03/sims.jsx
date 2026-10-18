import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../kit/Monitor.jsx';
import { useCase } from '../kit/CaseKit.jsx';

/* ============================================================
   CONSTRICTION SIMULATORS — local to Case 03, written in the
   kit's style so they can be promoted later.

   JVPViewer          the venous pulse with breathing: Kussmaul,
                      Friedreich's steep y, tamponade's lost y
   KnockPhono         pericardial knock vs S3 vs opening snap —
                      measure the A2-to-sound interval
   LVRVPressure       simultaneous LV + RV catheter pressures over
                      two breaths: dip-and-plateau, equalisation,
                      concordance vs discordance, systolic area index
   MitralInflow       PW mitral inflow with a respirometer trace —
                      measure the respiratory variation of E
   AnnulusDoppler     tissue Doppler e′ medial vs lateral (annulus
                      reversus / paradoxus), hepatic vein reversal,
                      septal bounce on M-mode
   ConstrictionBoard  sort the features: constriction, restriction,
                      or both
   ============================================================ */

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const BREATH = 4.2;               // seconds per breath
const INSP = 0.42;                // fraction of the breath spent breathing in

/** 0 → 1 → 0 over inspiration, 0 during expiration (smooth). */
function inspWeight(sec) {
  const ph = ((sec / BREATH) % 1 + 1) % 1;
  return ph < INSP ? Math.sin(ph / INSP * Math.PI) : 0;
}
/** Lung volume, for the respirometer trace: rises in inspiration, falls in expiration. */
function lungVol(sec) {
  const ph = ((sec / BREATH) % 1 + 1) % 1;
  return ph < INSP ? 0.5 - 0.5 * Math.cos(ph / INSP * Math.PI) : 0.5 + 0.5 * Math.cos((ph - INSP) / (1 - INSP) * Math.PI);
}
const gauss = (x, m, s) => Math.exp(-(((x - m) / s) ** 2));

function drawResp(g, x0, w, y, amp, span, t, label = true) {
  g.strokeStyle = '#7DD3FC'; g.lineWidth = 1.4; g.beginPath();
  for (let px = x0; px < w - 6; px += 2) {
    const sec = (px - x0) / (w - 6 - x0) * span + t;
    const v = lungVol(sec);
    px === x0 ? g.moveTo(px, y - v * amp) : g.lineTo(px, y - v * amp);
  }
  g.stroke();
  if (label) { g.fillStyle = '#7DD3FC'; g.font = `600 10px ${MONO}`; g.fillText('RESP ↑ insp', 4, y - amp - 2); }
}
function shadeInsp(g, x0, w, top, bottom, span, t) {
  g.fillStyle = 'rgba(125,211,252,0.07)';
  for (let px = x0; px < w - 6; px += 2) {
    const sec = (px - x0) / (w - 6 - x0) * span + t;
    if (inspWeight(sec) > 0.02) g.fillRect(px, top, 2, bottom - top);
  }
}

/* ---------- 1 · the jugular venous pulse ---------- */

const JVP = {
  normal: { name: 'Normal', exp: 3, insp: 1.5, A: 1, X: 0.8, V: 0.8, Y: 0.6, yw: 0.07, pp: 4,
    note: 'Two flickers per beat (a, v), x and y gentle. The column FALLS as she breathes in: inspiration sucks blood into the chest and a compliant right heart accepts it.' },
  constriction: { name: 'Constriction (her)', exp: 12, insp: 15, A: 0.7, X: 1.5, V: 0.8, Y: 2.2, yw: 0.032, pp: 6,
    note: 'High, with two deep, fast collapses per beat — x and a sharp y (Friedreich’s sign): an "M" or "W". It RISES as she breathes in (Kussmaul): the chest pulls blood in, but the shell will not let the right heart accept it.' },
  restriction: { name: 'Restrictive cardiomyopathy', exp: 11, insp: 12, A: 1.5, X: 0.9, V: 1.1, Y: 1.4, yw: 0.06, pp: 5,
    note: 'High with a prominent y and a big a wave. Kussmaul’s sign can be present too — it is a sign of a right heart that cannot accept volume, not of the pericardium alone.' },
  tamponade: { name: 'Tamponade', exp: 14, insp: 12.5, A: 0.9, X: 1.6, V: 0.7, Y: 0.05, yw: 0.08, pp: 22,
    note: 'High, with a deep x and NO y: in tamponade the heart is squeezed all through diastole, so there is no moment of rapid filling. Kussmaul is usually absent — but the pulse paradox is large.' },
};

function jvpWave(x, P) {
  // x: 0..1 through the cardiac cycle starting at the P wave
  return P.A * gauss(x, 0.08, 0.04) + 0.25 * gauss(x, 0.17, 0.02) - P.X * gauss(x, 0.31, 0.055)
    + P.V * gauss(x, 0.5, 0.05) - P.Y * gauss(x, 0.6, P.yw) + 0.15 * gauss(x, 0.85, 0.12);
}

export function JVPViewer({ modes = ['constriction', 'normal', 'restriction', 'tamponade'], initial }) {
  const [key, setKey] = useState(initial || modes[0]);
  const ref = useRef(null);
  const S = useRef({}); S.current = { P: JVP[key] };
  const HR = 96;
  useCanvas(ref, 250, (g, w, h, t) => {
    const { P } = S.current;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const span = 2 * BREATH, x0 = 34, gw = w - 120;
    shadeInsp(g, x0, x0 + gw + 6, 20, h - 10, span, t * 0);
    drawResp(g, x0, x0 + gw + 6, 44, 24, span, 0);
    // venous column height (cm above the sternal angle) on the cardiac waveform
    const Yc = cm => h - 30 - cm * 9.5;
    g.font = `10px ${MONO}`;
    for (const cm of [0, 5, 10, 15, 20]) { g.strokeStyle = cm === 0 ? '#3B4B5A' : '#101C28'; g.beginPath(); g.moveTo(x0, Yc(cm)); g.lineTo(x0 + gw, Yc(cm)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(cm, 6, Yc(cm) + 3); }
    g.fillStyle = '#6A7F9B'; g.fillText('cm above sternal angle', x0 + 4, Yc(0) + 14);
    const per = 60 / HR;
    const height = sec => { const iw = inspWeight(sec); return P.exp + (P.insp - P.exp) * iw; };
    g.strokeStyle = '#A78BFA'; g.lineWidth = 2; g.beginPath();
    for (let px = x0; px < x0 + gw; px += 1.5) {
      const sec = (px - x0) / gw * span;
      const v = height(sec) + jvpWave(((sec / per) % 1), P) * 1.6;
      px === x0 ? g.moveTo(px, Yc(v)) : g.lineTo(px, Yc(v));
    }
    g.stroke();
    // sweep cursor
    const now = (t % span), cx = x0 + now / span * gw;
    g.strokeStyle = 'rgba(233,242,252,0.35)'; g.beginPath(); g.moveTo(cx, 18); g.lineTo(cx, h - 24); g.stroke();
    // labels on the first beat after 0.2 s
    const b0 = Math.ceil(0.3 / per) * per;
    const lab = (ph, txt, dy) => { const sec = b0 + ph * per; const px = x0 + sec / span * gw; const v = height(sec) + jvpWave(ph, P) * 1.6; g.fillStyle = '#E9F2FC'; g.font = `700 11px ${MONO}`; g.fillText(txt, px - 3, Yc(v) + dy); };
    lab(0.08, 'a', -6); lab(0.31, 'x', 14); lab(0.5, 'v', -6); if (P.Y > 0.3) lab(0.6, 'y', 14);
    // the neck gauge: where the meniscus sits right now
    const gx = x0 + gw + 30, cur = height(now) + jvpWave(((now / per) % 1), P) * 1.6;
    g.fillStyle = '#0B1525'; g.fillRect(gx - 14, Yc(20), 28, Yc(0) - Yc(20));
    g.fillStyle = 'rgba(167,139,250,0.55)'; g.fillRect(gx - 14, Yc(Math.max(0, cur)), 28, Yc(0) - Yc(Math.max(0, cur)));
    g.strokeStyle = '#2B4366'; g.strokeRect(gx - 14, Yc(20), 28, Yc(0) - Yc(20));
    g.fillStyle = '#9FB4C6'; g.font = `600 10px ${MONO}`; g.fillText('neck', gx - 12, Yc(20) - 6);
    g.fillStyle = inspWeight(now) > 0.05 ? '#7DD3FC' : '#6A7F9B'; g.fillText(inspWeight(now) > 0.05 ? 'IN' : 'OUT', gx - 9, h - 8);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText(`${P.name.toUpperCase()} · JVP AT 45°`, x0 + 120, 14);
  }, []);
  const P = JVP[key];
  const kuss = P.insp > P.exp;
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {modes.map(k => <button key={k} className={'cs-chip' + (k === key ? ' on' : '')} onClick={() => setKey(k)}>{JVP[k].name}</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 250 }} aria-label={`Jugular venous pulse: ${P.name}`} /></div>
      <div className="cs-readout">
        <div><span>Height, expiration</span><b>{P.exp} cm</b></div>
        <div><span>Height, inspiration</span><b style={{ color: kuss ? 'var(--red)' : undefined }}>{P.insp} cm</b></div>
        <div><span>Kussmaul sign</span><b style={{ color: kuss ? 'var(--red)' : 'var(--green)' }}>{kuss ? 'present' : 'absent'}</b></div>
        <div><span>y descent</span><b>{P.Y > 1.8 ? 'steep, deep' : P.Y > 1 ? 'prominent' : P.Y < 0.2 ? 'absent' : 'normal'}</b></div>
        <div><span>Pulsus paradoxus</span><b style={{ color: P.pp > 10 ? 'var(--red)' : undefined }}>{P.pp} mmHg</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>{P.note}</p>
      <p className="cs-pts">Blue band = inspiration. The violet column on the right is what you would see in her neck right now. Patient at 45°, light across the neck, watch — don't feel — the internal jugular.</p>
    </div>
  );
}

/* ---------- 2 · the knock: measure the A2-to-sound interval ---------- */

export const EXTRA_SOUNDS = {
  knock: { name: 'Her heart', ms: 110, freq: 150, amp: 0.85, len: 0.03, label: 'K', hr: 96, murmur: 0.35,
    note: 'An early, sharp, high-pitched extra sound ~100–120 ms after A2 — the pericardial knock: the ventricle fills fast, then hits the shell and stops dead. A soft ejection murmur too (her thickened aortic valve).' },
  s3: { name: 'Dilated heart failure', ms: 160, freq: 38, amp: 0.45, len: 0.07, label: 'S3', hr: 92, murmur: 0,
    note: 'A low, dull thud ~140–180 ms after A2 — an S3: blood decelerating into a big, compliant-but-overfilled ventricle. Heard best with the bell at the apex.' },
  os: { name: 'Rheumatic mitral stenosis', ms: 70, freq: 120, amp: 0.55, len: 0.015, label: 'OS', hr: 84, murmur: 0, rumble: true,
    note: 'A crisp click only ~40–100 ms after A2, then a low rumble — the opening snap of a stiff mitral valve that is suddenly pulled open.' },
};

export function KnockPhono({ sounds = ['knock', 's3', 'os'], onMeasure, done }) {
  const [key, setKey] = useState(sounds[0]);
  const [cal, setCal] = useState(60);
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  const audio = useRef(null);
  const S = useRef({}); S.current = { K: EXTRA_SOUNDS[key], cal };
  useCanvas(ref, 210, (g, w, h) => {
    const { K, cal: c } = S.current;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const BEAT = 60 / K.hr, SYS = 0.3, span = 1.6 * BEAT, x0 = 30;
    const X = s => x0 + s / span * (w - x0 - 10);
    const mid = 110;
    g.strokeStyle = '#1B2A40'; g.beginPath(); g.moveTo(x0, mid); g.lineTo(w - 10, mid); g.stroke();
    const burst = (at, amp, len, color) => {
      g.strokeStyle = color; g.lineWidth = 1.3; g.beginPath();
      for (let k = 0; k <= 40; k++) { const s = at + (k / 40) * len; const a = amp * Math.exp(-k / 13) * (k % 2 ? 1 : -1); k ? g.lineTo(X(s), mid - a * 46) : g.moveTo(X(s), mid); }
      g.stroke();
    };
    for (let b = 0; b < 2; b++) {
      const t0 = 0.04 + b * BEAT, a2 = t0 + SYS;
      burst(t0, 0.7, 0.05, '#E9F2FC');
      burst(a2, 0.9, 0.04, '#E9F2FC');
      if (K.murmur) {
        g.fillStyle = 'rgba(255,107,154,0.28)'; g.beginPath();
        for (let k = 0; k <= 40; k++) { const x = k / 40; const e = (x < 0.4 ? x / 0.4 : (1 - x) / 0.6) * K.murmur; g.lineTo(X(t0 + 0.06 + x * (SYS - 0.09)), mid - e * 30); }
        for (let k = 40; k >= 0; k--) { const x = k / 40; const e = (x < 0.4 ? x / 0.4 : (1 - x) / 0.6) * K.murmur; g.lineTo(X(t0 + 0.06 + x * (SYS - 0.09)), mid + e * 30); }
        g.fill();
      }
      burst(a2 + K.ms / 1000, K.amp, K.len, K.label === 'S3' ? '#5EEAD4' : '#F5C451');
      if (K.rumble) { g.fillStyle = 'rgba(167,139,250,0.3)'; g.fillRect(X(a2 + 0.09), mid - 10, X(a2 + 0.42) - X(a2 + 0.09), 20); }
      g.fillStyle = '#9FB4C6'; g.font = `600 10px ${MONO}`; g.fillText('S1', X(t0) - 4, mid + 62); g.fillText('A2', X(a2) - 4, mid + 62);
      g.fillStyle = K.label === 'S3' ? '#5EEAD4' : '#F5C451'; g.fillText(K.label, X(a2 + K.ms / 1000) - 3, mid + 76);
    }
    // the caliper: from A2 of the first beat
    const a2 = 0.04 + SYS;
    g.strokeStyle = '#22D3EE'; g.setLineDash([4, 3]); g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(X(a2), 20); g.lineTo(X(a2), h - 20); g.moveTo(X(a2 + c / 1000), 20); g.lineTo(X(a2 + c / 1000), h - 20); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#22D3EE'; g.font = `700 11px ${MONO}`; g.fillText(`A2 → ${c} ms`, X(a2) + 6, 30);
    g.fillStyle = '#6A7F9B'; g.font = `600 10px ${MONO}`; g.fillText(`PHONOCARDIOGRAM · ${K.hr} bpm · 100 ms = ${Math.round(X(0.1) - X(0))} px`, x0, 14);
  }, []);

  const start = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const thump = (at, amp, freq, len) => {
      const o = ctx.createOscillator(); o.frequency.value = freq;
      const gg = ctx.createGain(); gg.gain.setValueAtTime(0, at); gg.gain.linearRampToValueAtTime(amp, at + 0.006); gg.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(gg).connect(master); o.start(at); o.stop(at + len + 0.02);
    };
    const hiss = (at, len, amp, f, low) => {
      const n = ctx.createBufferSource(); n.buffer = noise; n.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = low ? 'lowpass' : 'bandpass'; bp.frequency.value = f; bp.Q.value = 0.9;
      const gg = ctx.createGain(); gg.gain.setValueAtTime(0, at); gg.gain.linearRampToValueAtTime(amp, at + len * 0.4); gg.gain.linearRampToValueAtTime(0, at + len);
      n.connect(bp).connect(gg).connect(master); n.start(at); n.stop(at + len + 0.02);
    };
    let next = ctx.currentTime + 0.1;
    const schedule = () => {
      const { K } = S.current;
      const BEAT = 60 / K.hr;
      while (next < ctx.currentTime + 0.6) {
        thump(next, 0.6, 55, 0.08);
        const a2 = next + 0.3;
        if (K.murmur) hiss(next + 0.06, 0.21, 0.12 * K.murmur * 3, 380);
        thump(a2, 0.6, 75, 0.06);
        thump(a2 + K.ms / 1000, K.amp * 0.8, K.freq, K.len + 0.03);
        if (K.rumble) hiss(a2 + 0.09, 0.33, 0.45, 140, true);
        next += BEAT;
      }
    };
    schedule();
    audio.current = { ctx, id: setInterval(schedule, 150) };
    setPlaying(true);
  };
  const stop = () => { if (audio.current) { clearInterval(audio.current.id); audio.current.ctx.close(); audio.current = null; } setPlaying(false); };
  useEffect(() => () => stop(), []);   // eslint-disable-line

  const K = EXTRA_SOUNDS[key];
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {sounds.map(k => <button key={k} className={'cs-chip' + (k === key ? ' on' : '')} onClick={() => setKey(k)}>{EXTRA_SOUNDS[k].name}</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 210 }} aria-label={`Phonocardiogram: ${K.name}`} /></div>
      <div className="cs-ctrls">
        {!playing ? <button className="cs-btn primary" onClick={start}>🔊 Listen</button> : <button className="cs-btn" onClick={stop}>■ Stop</button>}
        <label className="cs-slider" style={{ flex: 1 }}>A2 → extra sound
          <input type="range" min="20" max="220" step="5" value={cal} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="A2 to extra sound caliper, milliseconds" />{cal} ms</label>
        {onMeasure && <button className="cs-btn primary" disabled={!!done || key !== sounds[0]} onClick={() => onMeasure({ ms: cal, truth: K.ms, close: Math.abs(cal - K.ms) <= 15 })}>📏 Record her interval</button>}
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>{K.note}</p>
      <p className="cs-pts">Move the cyan caliper onto the extra sound after A2 and read the interval. {onMeasure ? 'Record it on her heart (the first tab).' : ''} Timing, pitch and site tell three different stories. Sounds are synthesised to teach timing.</p>
    </div>
  );
}

/* ---------- 3 · simultaneous LV and RV pressures ---------- */

const HEMO = {
  constriction: {
    name: 'Her — simultaneous LV + RV', hr: 96,
    lv: { s: 112, ds: -16, edp: 24, dip: 3 }, rv: { s: 40, ds: 9, edp: 22, dip: 2 },
    note: 'Both diastolic traces dip to near zero, then shoot up to a plateau (the square-root sign) — and the two plateaus lie on top of each other. Now watch the peaks with each breath.',
  },
  restriction: {
    name: 'Comparison — cardiac amyloid', hr: 88,
    lv: { s: 122, ds: -9, edp: 29, dip: 6 }, rv: { s: 56, ds: -6, edp: 17, dip: 4 },
    note: 'A dip-and-plateau too — the square-root sign is a sign of a ventricle that fills early and then stops, whatever stops it. But the plateaus are apart, the RV pressure is higher, and the peaks behave differently.',
  },
};
function ventP(x, V, iw) {
  // x 0..1 through one beat: systole to ~0.38, then the dip, then the plateau
  const S = V.s + V.ds * iw, E = V.edp, D = V.dip;
  if (x < 0.07) return E + (S - E) * Math.sin(x / 0.07 * Math.PI / 2) * 0.92;
  if (x < 0.3) return S * (0.92 + 0.08 * Math.sin((x - 0.07) / 0.23 * Math.PI));
  if (x < 0.4) return S * 0.92 - (S * 0.92 - D) * Math.sin((x - 0.3) / 0.1 * Math.PI / 2);
  if (x < 0.47) return D + (E - D) * (1 - Math.exp(-(x - 0.4) / 0.018));
  return E + (x > 0.93 ? (x - 0.93) * 20 : 0);
}
export function hemoSample(mode, sec) {
  const H = HEMO[mode], per = 60 / H.hr;
  const beatStart = Math.floor(sec / per) * per;
  const iw = inspWeight(beatStart + per * 0.2);
  const x = (sec - beatStart) / per;
  return { lv: ventP(x, H.lv, iw), rv: ventP(x, H.rv, iw), iw };
}
function systolicAreaIndex(mode) {
  // RV/LV systolic area in the most inspiratory beat ÷ the same in the most expiratory beat
  const H = HEMO[mode];
  const area = (V, iw) => { let a = 0; for (let k = 0; k < 40; k++) a += ventP(k / 100, V, iw); return a; };
  return (area(H.rv, 1) / area(H.lv, 1)) / (area(H.rv, 0) / area(H.lv, 0));
}

export function LVRVPressure({ mode = 'constriction', onMeasure, done }) {
  const ref = useRef(null);
  const H = HEMO[mode];
  const [lv, setLv] = useState(10);
  const [rv, setRv] = useState(10);
  const [call, setCall] = useState(null);
  const S = useRef({}); S.current = { lv, rv };
  const span = 2 * BREATH;
  useCanvas(ref, 290, (g, w, h, t) => {
    const { lv: cl, rv: cr } = S.current;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const x0 = 34, Y = p => h - 22 - p / 140 * (h - 76);
    shadeInsp(g, x0, w, 50, h - 20, span, 0);
    drawResp(g, x0, w, 44, 22, span, 0);
    g.font = `10px ${MONO}`;
    for (const p of [0, 20, 40, 60, 80, 100, 120, 140]) { g.strokeStyle = '#101C28'; g.beginPath(); g.moveTo(x0, Y(p)); g.lineTo(w, Y(p)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(p, 4, Y(p) + 3); }
    const trace = (k, col) => {
      g.strokeStyle = col; g.lineWidth = 1.8; g.beginPath();
      for (let px = x0; px < w - 6; px += 1) { const sec = (px - x0) / (w - 6 - x0) * span; const v = hemoSample(mode, sec)[k]; px === x0 ? g.moveTo(px, Y(v)) : g.lineTo(px, Y(v)); }
      g.stroke();
    };
    trace('rv', '#22D3EE'); trace('lv', '#F2D24B');
    for (const [v, col, lab, dx] of [[cl, '#F2D24B', 'LVEDP', 40], [cr, '#22D3EE', 'RVEDP', 140]]) {
      g.strokeStyle = col; g.setLineDash([5, 4]); g.lineWidth = 1.1; g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.setLineDash([]);
      g.fillStyle = col; g.font = `700 11px ${MONO}`; g.fillText(`${lab} ${v}`, dx, Y(v) - 4);
    }
    const cx = x0 + ((t % span) / span) * (w - 6 - x0);
    g.strokeStyle = 'rgba(233,242,252,0.25)'; g.beginPath(); g.moveTo(cx, 52); g.lineTo(cx, h - 20); g.stroke();
    g.fillStyle = '#F2D24B'; g.font = `700 12px ${MONO}`; g.fillText('LV', w - 70, 64);
    g.fillStyle = '#22D3EE'; g.fillText('RV', w - 40, 64);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText(H.name.toUpperCase(), x0 + 110, 14);
  }, [mode]);
  const sai = systolicAreaIndex(mode);
  const close = Math.abs(lv - H.lv.edp) <= 3 && Math.abs(rv - H.rv.edp) <= 3;
  const truth = (H.lv.ds < 0) !== (H.rv.ds < 0) ? 'discordant' : 'concordant';
  const res = done;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 290 }} aria-label={`Simultaneous LV and RV pressures: ${H.name}`} /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>LVEDP caliper
          <input type="range" min="0" max="40" step="1" value={lv} disabled={!!res} onChange={e => setLv(+e.target.value)} style={{ width: '100%' }} aria-label="LV end-diastolic pressure caliper" />{lv}</label>
        <label className="cs-slider" style={{ flex: 1 }}>RVEDP caliper
          <input type="range" min="0" max="40" step="1" value={rv} disabled={!!res} onChange={e => setRv(+e.target.value)} style={{ width: '100%' }} aria-label="RV end-diastolic pressure caliper" />{rv}</label>
      </div>
      <div className="cs-ctrls">
        <span className="cs-pts">As she breathes IN, the systolic peaks…</span>
        <button className={'cs-chip' + (call === 'concordant' ? ' on' : '')} disabled={!!res} onClick={() => setCall('concordant')}>⇊ both fall (concordant)</button>
        <button className={'cs-chip' + (call === 'discordant' ? ' on' : '')} disabled={!!res} onClick={() => setCall('discordant')}>⇅ LV falls, RV rises (discordant)</button>
        {onMeasure && <button className="cs-btn primary" disabled={!!res || !call} onClick={() => onMeasure({ lv, rv, call, close, right: call === truth, truth })}>📏 Record</button>}
      </div>
      <div className="cs-readout">
        <div><span>LVEDP − RVEDP</span><b style={{ color: Math.abs(lv - rv) <= 5 ? 'var(--amber)' : undefined }}>{lv - rv} mmHg</b></div>
        <div><span>RV systolic (exp / insp)</span><b>{H.rv.s} / {H.rv.s + H.rv.ds}</b></div>
        <div><span>RVEDP ÷ RVSP</span><b>{(rv / H.rv.s).toFixed(2)}</b></div>
        {res && <div><span>Systolic area index</span><b style={{ color: sai > 1.1 ? 'var(--red)' : 'var(--green)' }}>{sai.toFixed(2)}</b></div>}
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>{H.note} Set each caliper on the diastolic plateau just before the upstroke. Blue bands = inspiration.</p>
    </div>
  );
}

/* ---------- 4 · mitral inflow with respiration ---------- */

const INFLOW = {
  constriction: { name: 'Her — mitral inflow, PW at the leaflet tips', hr: 96, eExp: 0.96, eInsp: 0.62, a: 0.38, dt: 140, note: 'Tall E, small A, a short deceleration time: a restrictive filling pattern. Now look at what breathing does to E.' },
  restriction: { name: 'Comparison — cardiac amyloid', hr: 88, eExp: 1.02, eInsp: 0.96, a: 0.3, dt: 130, note: 'The same restrictive pattern at rest — but E barely moves with breathing: the problem is in the muscle, and the muscle does not care about the chest.' },
};
function inflowV(sec, M) {
  const per = 60 / M.hr, b = Math.floor(sec / per) * per, x = (sec - b) / per;
  const iw = inspWeight(b + per * 0.5);
  const E = M.eExp + (M.eInsp - M.eExp) * iw;
  const ePk = 0.47, eDec = M.dt / 1000 / per;
  let v = 0;
  if (x > 0.42 && x < ePk) v = E * (x - 0.42) / (ePk - 0.42);
  else if (x >= ePk && x < ePk + eDec) v = E * (1 - (x - ePk) / eDec);
  if (x > 0.84 && x < 0.98) v = Math.max(v, M.a * Math.sin((x - 0.84) / 0.14 * Math.PI));
  return { v, iw, E };
}

export function MitralInflow({ mode = 'constriction', onMeasure, done }) {
  const M = INFLOW[mode];
  const ref = useRef(null);
  const [ex, setEx] = useState(0.8);
  const [ins, setIns] = useState(0.8);
  const S = useRef({}); S.current = { ex, ins };
  const span = 2 * BREATH;
  useCanvas(ref, 260, (g, w, h) => {
    const { ex: ce, ins: ci } = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const x0 = 40, base = 78, Y = v => base + v * 150;
    shadeInsp(g, x0, w, 54, h - 8, span, 0);
    drawResp(g, x0, w, 44, 20, span, 0);
    g.font = `10px ${MONO}`;
    for (const v of [0, 0.25, 0.5, 0.75, 1.0]) { g.strokeStyle = '#111A24'; g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(v.toFixed(2), 2, Y(v) + 3); }
    g.strokeStyle = '#2B3A4A'; g.beginPath(); g.moveTo(x0, base); g.lineTo(w, base); g.stroke();
    // spectral envelope, filled like a PW Doppler (flow toward the probe is shown below the line here: apical view, inflow away from the transducer is drawn downward)
    for (let px = x0; px < w - 6; px += 1) {
      const sec = (px - x0) / (w - 6 - x0) * span;
      const { v } = inflowV(sec, M);
      if (v <= 0.01) continue;
      const grd = g.createLinearGradient(0, base, 0, Y(v));
      grd.addColorStop(0, 'rgba(255,255,255,0.15)'); grd.addColorStop(1, 'rgba(255,255,255,0.85)');
      g.fillStyle = grd; g.fillRect(px, base, 1, Y(v) - base);
    }
    for (const [v, col, lab] of [[ce, '#F5C451', 'E exp'], [ci, '#22D3EE', 'E insp']]) {
      g.strokeStyle = col; g.setLineDash([5, 4]); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.setLineDash([]);
      g.fillStyle = col; g.font = `700 11px ${MONO}`; g.fillText(`${lab} ${v.toFixed(2)} m/s`, lab === 'E exp' ? w - 150 : w - 300, Y(v) + 13);
    }
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText(M.name.toUpperCase(), x0 + 100, 14);
  }, [mode]);
  const variation = ex > 0 ? (ex - ins) / ex * 100 : 0;
  const trueVar = (M.eExp - M.eInsp) / M.eExp * 100;
  const close = Math.abs(ex - M.eExp) <= 0.06 && Math.abs(ins - M.eInsp) <= 0.06;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 260 }} aria-label={`Mitral inflow pulsed-wave Doppler: ${M.name}`} /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Highest E (expiration)
          <input type="range" min="0.3" max="1.2" step="0.01" value={ex} disabled={!!done} onChange={e => setEx(+e.target.value)} style={{ width: '100%' }} aria-label="Expiratory E velocity caliper" />{ex.toFixed(2)}</label>
        <label className="cs-slider" style={{ flex: 1 }}>Lowest E (inspiration)
          <input type="range" min="0.3" max="1.2" step="0.01" value={ins} disabled={!!done} onChange={e => setIns(+e.target.value)} style={{ width: '100%' }} aria-label="Inspiratory E velocity caliper" />{ins.toFixed(2)}</label>
        {onMeasure && <button className="cs-btn primary" disabled={!!done} onClick={() => onMeasure({ ex, ins, variation, trueVar, close })}>📏 Record E variation</button>}
      </div>
      <div className="cs-readout">
        <div><span>(E exp − E insp) ÷ E exp</span><b style={{ color: variation >= 25 ? 'var(--red)' : undefined }}>{variation.toFixed(0)}%</b></div>
        <div><span>E/A (expiration)</span><b>{(M.eExp / M.a).toFixed(1)}</b></div>
        <div><span>Deceleration time</span><b>{M.dt} ms</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>{M.note} Put the yellow caliper on the tallest E (breathing out) and the cyan one on the smallest E (breathing in, blue band). Constriction: ≥ 25% variation; the tricuspid inflow does the opposite (≥ 40% rise in inspiration).</p>
    </div>
  );
}

/* ---------- 5 · the annulus, the hepatic veins, the septum ---------- */

const ANNULUS = {
  constriction: { med: 13, lat: 9, hv: 'exp', sb: true, ivc: '26 mm, < 20% collapse' },
  restriction: { med: 4, lat: 5, hv: 'insp', sb: false, ivc: '24 mm, < 20% collapse' },
};

export function AnnulusDoppler({ mode = 'constriction', onMeasure, done }) {
  const A = ANNULUS[mode];
  const [tab, setTab] = useState('tdi');
  const [site, setSite] = useState('med');
  const [m, setM] = useState(8);
  const [l, setL] = useState(8);
  const ref = useRef(null);
  const S = useRef({}); S.current = { tab, site, m, l };
  const span = 2 * BREATH;
  useCanvas(ref, 240, (g, w, h, t) => {
    const { tab: tb, site: st, m: cm, l: cl } = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const x0 = 40;
    g.font = `10px ${MONO}`;
    if (tb === 'tdi') {
      const per = 60 / 96, base = 70, Y = v => base + v * 8;
      const e = st === 'med' ? A.med : A.lat;
      for (const v of [0, 5, 10, 15]) { g.strokeStyle = '#111A24'; g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(`${v}`, 8, Y(v) + 3); }
      g.fillStyle = '#3B4B5A'; g.fillText('cm/s', 4, Y(17) + 4);
      g.strokeStyle = '#E9F2FC'; g.lineWidth = 1.6; g.beginPath();
      for (let px = x0; px < w - 6; px++) {
        const sec = (px - x0) / (w - 6 - x0) * 3 * per, x = (sec % per) / per;
        let v = 0;
        if (x < 0.3) v = -7 * Math.sin(x / 0.3 * Math.PI);                     // s′ (toward the apex)
        else if (x > 0.42 && x < 0.6) v = e * Math.sin((x - 0.42) / 0.18 * Math.PI); // e′
        else if (x > 0.84 && x < 0.97) v = 4 * Math.sin((x - 0.84) / 0.13 * Math.PI); // a′
        px === x0 ? g.moveTo(px, Y(v)) : g.lineTo(px, Y(v));
      }
      g.stroke();
      const cal = st === 'med' ? cm : cl;
      g.strokeStyle = st === 'med' ? '#F5C451' : '#22D3EE'; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(x0, Y(cal)); g.lineTo(w, Y(cal)); g.stroke(); g.setLineDash([]);
      g.fillStyle = g.strokeStyle; g.font = `700 11px ${MONO}`; g.fillText(`e′ caliper ${cal} cm/s`, w - 170, Y(cal) + 14);
      g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText(`TISSUE DOPPLER · ${st === 'med' ? 'MEDIAL (SEPTAL)' : 'LATERAL'} MITRAL ANNULUS`, x0, 16);
      g.fillStyle = '#6A7F9B'; g.font = `600 10px ${MONO}`; g.fillText("s′ above · e′ and a′ below", x0, 32);
    } else if (tb === 'hv') {
      shadeInsp(g, x0, w, 50, h - 8, span, 0);
      drawResp(g, x0, w, 44, 20, span, 0);
      const base = 140, per = 60 / 96;
      g.strokeStyle = '#2B3A4A'; g.beginPath(); g.moveTo(x0, base); g.lineTo(w, base); g.stroke();
      g.fillStyle = '#6A7F9B'; g.fillText('toward liver ↑ (reversal)', x0 + 4, 62); g.fillText('toward heart ↓ (forward S, D)', x0 + 4, h - 10);
      for (let px = x0; px < w - 6; px++) {
        const sec = (px - x0) / (w - 6 - x0) * span, b = Math.floor(sec / per) * per, x = (sec - b) / per;
        const iw = inspWeight(b + per * 0.5), expn = 1 - Math.min(1, iw * 3);
        let v = 0;
        if (x < 0.32) v = -30 * Math.sin(x / 0.32 * Math.PI);
        else if (x > 0.42 && x < 0.62) v = -38 * Math.sin((x - 0.42) / 0.2 * Math.PI);
        else if (x > 0.66 && x < 0.86) { const rev = A.hv === 'exp' ? expn : iw; v = 34 * rev * Math.sin((x - 0.66) / 0.2 * Math.PI); }
        else if (x > 0.88) v = 10 * Math.sin((x - 0.88) / 0.12 * Math.PI);
        if (Math.abs(v) < 0.5) continue;
        g.fillStyle = v > 0 ? 'rgba(255,90,82,0.85)' : 'rgba(100,170,255,0.85)';
        g.fillRect(px, Math.min(base, base - v), 1, Math.abs(v));
      }
      g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText('HEPATIC VEIN · PW, SUBCOSTAL', x0 + 120, 14);
    } else {
      // M-mode through the septum: the bounce
      const per = 60 / 96;
      g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText('M-MODE · PARASTERNAL, THROUGH THE SEPTUM', x0, 16);
      for (let px = x0; px < w - 6; px++) {
        const sec = (px - x0) / (w - 6 - x0) * span, b = Math.floor(sec / per) * per, x = (sec - b) / per;
        const iw = inspWeight(b + per * 0.5);
        const bounce = A.sb && x > 0.42 && x < 0.55 ? Math.sin((x - 0.42) / 0.13 * Math.PI) * (6 + 10 * iw) : 0;
        const sys = x < 0.38 ? Math.sin(x / 0.38 * Math.PI) * 10 : 0;
        const rows = [
          [38, 46, 'rgba(255,255,255,0.75)'],                               // thick bright pericardium
          [52, 58 + sys * 0.2, 'rgba(180,180,180,0.5)'],                    // RV free wall
          [100 + sys + bounce, 116 + sys + bounce, 'rgba(210,210,210,0.75)'], // septum
          [190 - sys, 204 - sys, 'rgba(190,190,190,0.6)'],                  // LV posterior wall
          [208 - sys * 0.3, 216 - sys * 0.3, 'rgba(255,255,255,0.8)'],      // posterior pericardium
        ];
        for (const [a, bb, col] of rows) { g.fillStyle = col; g.fillRect(px, a, 1, bb - a); }
        if (Math.random() < 0.06) { g.fillStyle = 'rgba(200,200,200,0.12)'; g.fillRect(px, 60 + Math.random() * 130, 1, 2); }
      }
      g.fillStyle = '#6A7F9B'; g.font = `600 10px ${MONO}`; g.fillText('RV', 8, 80); g.fillText('septum', 2, 110); g.fillText('LV', 8, 160);
      if (A.sb) { g.fillStyle = '#F5C451'; g.fillText('early-diastolic notch — bigger in inspiration', w - 300, h - 10); }
    }
  }, [mode]);
  const reversus = m > l;
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        <button className={'cs-chip' + (tab === 'tdi' ? ' on' : '')} onClick={() => setTab('tdi')}>🎯 Tissue Doppler e′</button>
        <button className={'cs-chip' + (tab === 'hv' ? ' on' : '')} onClick={() => setTab('hv')}>🫁 Hepatic vein</button>
        <button className={'cs-chip' + (tab === 'mm' ? ' on' : '')} onClick={() => setTab('mm')}>〰️ Septal M-mode</button>
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 240 }} aria-label="Annular tissue Doppler, hepatic vein Doppler and septal M-mode" /></div>
      {tab === 'tdi' && (
        <>
          <div className="cs-ctrls">
            <button className={'cs-chip' + (site === 'med' ? ' on' : '')} onClick={() => setSite('med')}>Medial (septal) annulus</button>
            <button className={'cs-chip' + (site === 'lat' ? ' on' : '')} onClick={() => setSite('lat')}>Lateral annulus</button>
          </div>
          <div className="cs-ctrls">
            <label className="cs-slider" style={{ flex: 1 }}>medial e′
              <input type="range" min="2" max="18" step="1" value={m} disabled={!!done} onChange={e => { setM(+e.target.value); setSite('med'); }} style={{ width: '100%' }} aria-label="Medial e prime caliper" />{m}</label>
            <label className="cs-slider" style={{ flex: 1 }}>lateral e′
              <input type="range" min="2" max="18" step="1" value={l} disabled={!!done} onChange={e => { setL(+e.target.value); setSite('lat'); }} style={{ width: '100%' }} aria-label="Lateral e prime caliper" />{l}</label>
            {onMeasure && <button className="cs-btn primary" disabled={!!done} onClick={() => onMeasure({ m, l, close: Math.abs(m - A.med) <= 1 && Math.abs(l - A.lat) <= 1 })}>📏 Record e′</button>}
          </div>
          <div className="cs-readout">
            <div><span>medial e′</span><b style={{ color: m >= 9 ? 'var(--green)' : 'var(--red)' }}>{m} cm/s</b></div>
            <div><span>lateral e′</span><b>{l} cm/s</b></div>
            <div><span>Pattern</span><b style={{ color: reversus ? 'var(--amber)' : undefined }}>{reversus ? 'annulus reversus (medial > lateral)' : 'normal order (lateral ≥ medial)'}</b></div>
          </div>
        </>
      )}
      {tab === 'hv' && <p className="cs-pts" style={{ marginTop: 8 }}>Red bars above the line are flow running BACK into the liver at end-diastole. Find which half of the breath they belong to. IVC: {A.ivc}.</p>}
      {tab === 'mm' && <p className="cs-pts" style={{ marginTop: 8 }}>{A.sb ? 'Watch the septum just after systole ends: a quick notch toward the LV, bigger with each inspiration — the septal bounce. The bright, thick lines at top and bottom are the pericardium.' : 'The septum moves normally; the walls themselves are thick and sparkly.'}</p>}
      {tab === 'tdi' && <p className="cs-pts" style={{ marginTop: 8 }}>Measure e′ (the first wave below the line after s′) at each side of the mitral annulus. Normally the lateral wall moves faster than the septum.</p>}
    </div>
  );
}

/* ---------- 6 · the board: constriction, restriction, or both ---------- */

const BOARD = [
  { id: 'kuss', label: 'Kussmaul sign', a: 'both', why: 'Any right heart that cannot accept the inspiratory surge — constriction, restriction, RV infarction, severe TR.' },
  { id: 'sqrt', label: 'Dip-and-plateau (square-root sign)', a: 'both', why: 'Rapid early filling that stops abruptly — the shell, or stiff muscle. It does not tell you which.' },
  { id: 'disc', label: 'Discordant LV/RV systolic peaks with breathing', a: 'con', why: 'Ventricular interdependence in a fixed shell: the most specific catheter sign.' },
  { id: 'eq', label: 'LVEDP and RVEDP within 5 mmHg', a: 'con', why: 'One rigid box sets one pressure for both. In restriction the LV is usually stiffer: LVEDP higher.' },
  { id: 'pasp', label: 'PA systolic pressure > 50–55 mmHg', a: 'res', why: 'Restriction raises left pressures chronically; constriction rarely pushes PA systolic above ~50.' },
  { id: 'evar', label: 'Mitral E varies ≥ 25% with breathing', a: 'con', why: 'Dissociation of intrathoracic and intracardiac pressures.' },
  { id: 'eprime', label: 'Medial e′ ≥ 9 cm/s (often > lateral)', a: 'con', why: 'The muscle is healthy and relaxes briskly; only the outside is stuck (annulus reversus).' },
  { id: 'lowe', label: 'Medial e′ < 6 cm/s', a: 'res', why: 'Sick muscle relaxes slowly.' },
  { id: 'hvexp', label: 'Hepatic vein diastolic reversal in EXPIRATION', a: 'con', why: 'In expiration the septum swings right and the RV fills less: flow backs up into the liver.' },
  { id: 'hvinsp', label: 'Hepatic vein diastolic reversal in INSPIRATION', a: 'res', why: 'A stiff RV cannot take the inspiratory venous return.' },
  { id: 'bnp', label: 'NT-proBNP only mildly raised', a: 'con', why: 'The shell stops the myocardium stretching, so it releases little BNP. In restriction BNP is usually very high.' },
  { id: 'peri', label: 'Thick (> 4 mm), calcified pericardium on CT', a: 'con', why: 'But ~18% of proven constriction has normal thickness — and a thick pericardium is not proof of constriction.' },
  { id: 'lge', label: 'Diffuse myocardial late gadolinium enhancement', a: 'res', why: 'Infiltration or fibrosis of the muscle. Pericardial LGE instead suggests active pericardial inflammation.' },
  { id: 'rad', label: 'Previous mediastinal radiotherapy', a: 'both', why: 'Radiation can cause either — and often both at once. That is why her case is hard.' },
];
const BOARD_COLS = [['con', 'Constriction'], ['res', 'Restriction'], ['both', 'Both']];

export function ConstrictionBoard({ id }) {
  const { answers, answer, award, stageId } = useCase();
  const saved = answers[id];
  const [pick, setPick] = useState(saved?.pick || {});
  const submitted = !!saved?.submitted;
  const submit = () => {
    const got = BOARD.filter(b => pick[b.id] === b.a).length;
    answer(id, { pick, submitted: true });
    award(stageId, id, got, BOARD.length);
  };
  const n = Object.keys(pick).length;
  return (
    <div className="cs-card">
      <p className="cs-q">🧩 Sort every finding: constriction, restriction — or both? <span className="cs-pts">(one point per correct call)</span></p>
      <div className="cs-opts">
        {BOARD.map(b => {
          const p = pick[b.id];
          const right = submitted && p === b.a;
          return (
            <div key={b.id} className={'cs-opt' + (submitted ? (right ? ' best' : ' wrong') : '')} style={{ cursor: 'default', flexWrap: 'wrap' }}>
              <span style={{ flex: '1 1 240px' }}>
                {b.label}
                {submitted && <span className={'cs-verdict ' + (right ? 'best' : 'wrong')}>{right ? 'Correct' : `→ ${BOARD_COLS.find(c => c[0] === b.a)[1]}`}</span>}
                {submitted && <span className="cs-opt-why">{b.why}</span>}
              </span>
              <span className="cs-row" style={{ gap: 6 }}>
                {BOARD_COLS.map(([k, lab]) => (
                  <button key={k} className={'cs-chip' + (p === k ? ' on' : '')} disabled={submitted} onClick={() => setPick({ ...pick, [b.id]: k })}>{lab}</button>
                ))}
              </span>
            </div>
          );
        })}
      </div>
      {!submitted
        ? <div className="cs-row" style={{ marginTop: 12 }}><button className="cs-btn primary" onClick={submit} disabled={n < BOARD.length}>Submit the board ({n}/{BOARD.length})</button></div>
        : <div className="cs-fb ok"><span className="cs-pts">{BOARD.filter(b => pick[b.id] === b.a).length} / {BOARD.length} correct</span></div>}
    </div>
  );
}
