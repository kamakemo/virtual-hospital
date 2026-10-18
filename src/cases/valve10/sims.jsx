import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../kit/Monitor.jsx';
import { useCase } from '../kit/CaseKit.jsx';

/* ============================================================
   PULMONARY STENOSIS SIMULATORS — local to Case 10, written in
   the kit's style (canvas via useCanvas, cs-* classes, the dark
   palette) so they can be promoted to the kit later.

   PSAuscultation    ejection click, split S2, the JVP a-wave —
                     with an inspiration / expiration toggle
   PSDoppler         CW Doppler: PS jet, TR jet, the dagger-shaped
                     infundibular jet; IVC → RAP; RVSP and PASP
   BalloonSizer      lateral RV angiogram: measure the annulus at
                     the hinge points, choose the balloon (BAR)
   Valvuloplasty     fluoroscopy: position, inflate, watch the
                     waist appear and vanish; the price of time
   PullbackTrace     PA → RV pull-back before and after
   SuicideRV         dynamic infundibular obstruction after relief:
                     a resuscitation board where inotropes kill
   ============================================================ */

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ============================================================
   AUSCULTATION
   ============================================================ */

export const PS_LESIONS = {
  'ps-dome': {
    name: 'Her heart — doming valvular PS', hr: 76, s1: 0.8, a2: 0.9, p2: 0.28, aWave: 2.3,
    click: { exp: 1, insp: 0.2, at: 0.075 }, split: { exp: 0.065, insp: 0.095 },
    mur: { loud: 0.85, pk: 0.62, end: 'p2', insp: 1.3, site: { pulm: 1, aortic: 0.45 } },
    notes: {
      pulm: ['A sharp EJECTION CLICK just after S1 — loud in expiration, almost gone in inspiration', 'A harsh crescendo–decrescendo murmur that peaks LATE and runs right through A2 to a soft, late P2', 'S2 widely split; the split still widens on inspiration (it is not fixed)'],
      aortic: ['Fainter here: the murmur is transmitted, the click barely heard', 'A2 is crisp and normal', 'Move back to the second left interspace'],
    },
  },
  'ps-mild': {
    name: 'Mild valvular PS', hr: 72, s1: 0.8, a2: 0.9, p2: 0.6, aWave: 1.2,
    click: { exp: 0.95, insp: 0.35, at: 0.115 }, split: { exp: 0.035, insp: 0.06 },
    mur: { loud: 0.5, pk: 0.36, end: 'pre', insp: 1.25, site: { pulm: 1, aortic: 0.4 } },
    notes: {
      pulm: ['The click sits well AWAY from S1: the RV takes longer to reach the pressure that snaps the dome open', 'A short murmur that peaks early and ends well before A2', 'P2 normal in loudness'],
      aortic: ['Barely audible at the aortic area'],
    },
  },
  'ps-dysplastic': {
    name: 'Dysplastic valve (Noonan)', hr: 80, s1: 0.8, a2: 0.9, p2: 0.22, aWave: 2,
    click: null, split: { exp: 0.07, insp: 0.1 },
    mur: { loud: 0.8, pk: 0.58, end: 'p2', insp: 1.3, site: { pulm: 1, aortic: 0.45 } },
    notes: {
      pulm: ['NO click: thick, rigid, myxomatous leaflets cannot dome and snap — so they cannot click', 'A long, late-peaking murmur — just as severe as hers', 'Look at the patient: short stature, wide-set eyes, low-set ears, a webbed neck'],
      aortic: ['Transmitted murmur only'],
    },
  },
  'as-bicuspid': {
    name: 'Bicuspid aortic valve (the mimic)', hr: 72, s1: 0.8, a2: 0.95, p2: 0.6, aWave: 1,
    click: { exp: 0.8, insp: 0.8, at: 0.065 }, split: { exp: 0.015, insp: 0.045 },
    mur: { loud: 0.55, pk: 0.4, end: 'pre', insp: 1, site: { pulm: 0.55, aortic: 1 } },
    notes: {
      pulm: ['A click — but louder at the apex and the aortic area', 'Breathing does NOT change it: aortic clicks ignore respiration', 'S2 splits normally'],
      aortic: ['Click and ejection murmur best here, radiating to the carotids', 'The left heart does not care which phase of breathing you are in'],
    },
  },
  asd: {
    name: 'Atrial septal defect (the other mimic)', hr: 74, s1: 0.85, a2: 0.9, p2: 0.85, aWave: 1,
    click: null, split: { exp: 0.06, insp: 0.06 },
    mur: { loud: 0.38, pk: 0.4, end: 'pre', insp: 1.15, site: { pulm: 1, aortic: 0.3 } },
    notes: {
      pulm: ['A soft flow murmur — too much blood through a normal pulmonary valve', 'S2 widely split and FIXED: the same in inspiration and expiration', 'No click, a normal-volume P2'],
      aortic: ['Little to hear'],
    },
  },
  normal: {
    name: 'Normal', hr: 70, s1: 0.8, a2: 0.9, p2: 0.65, aWave: 1,
    click: null, split: { exp: 0.015, insp: 0.045 }, mur: null,
    notes: { pulm: ['S2 single in expiration, split ~40 ms in inspiration — physiological splitting'], aortic: ['S1, S2, silence'] },
  },
};

const sysLen = hr => Math.max(0.24, 0.42 - 0.0015 * hr);

function psTimes(L, insp) {
  const SYS = sysLen(L.hr);
  const a2 = SYS + 0.03;
  const split = insp ? L.split.insp : L.split.exp;
  const p2 = a2 + split;
  const ck = L.click ? { at: L.click.at - (insp ? 0.012 : 0), amp: insp ? L.click.insp : L.click.exp } : null;
  let mur = null;
  if (L.mur) {
    const start = ck ? ck.at + 0.012 : 0.05;
    const end = L.mur.end === 'p2' ? p2 - 0.006 : L.mur.end === 'a2' ? a2 - 0.008 : a2 - 0.06;
    mur = { start, end, gain: L.mur.loud * (insp ? L.mur.insp : 1) };
  }
  return { SYS, a2, p2, split, ck, mur };
}
const murEnv = (pk, k) => (k < pk ? k / pk : (1 - k) / (1 - pk));

function jvpWave(x, a) {          // x seconds from S1 within one beat (can be negative = late diastole)
  const g = (c, w) => Math.exp(-(((x - c) / w) ** 2));
  return 0.35 + a * 0.32 * g(-0.07, 0.045) + 0.18 * g(0.03, 0.02) - 0.25 * g(0.17, 0.06) + 0.32 * g(0.33, 0.06) - 0.18 * g(0.46, 0.06);
}

export function PSAuscultation({ lesions = ['ps-dome', 'ps-mild', 'ps-dysplastic', 'as-bicuspid', 'asd', 'normal'], initial }) {
  const [key, setKey] = useState(initial || lesions[0]);
  const [site, setSite] = useState('pulm');
  const [insp, setInsp] = useState(false);
  const [auto, setAuto] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  const audio = useRef(null);
  const L = PS_LESIONS[key];
  const S = useRef({}); S.current = { L, site, insp };

  useEffect(() => {
    if (!auto) return undefined;
    const id = setInterval(() => setInsp(v => !v), 2600);
    return () => clearInterval(id);
  }, [auto]);

  useCanvas(ref, 250, (g, w, h, t) => {
    const { L: les, site: st, insp: ins } = S.current;
    const BEAT = 60 / les.hr;
    const T = psTimes(les, ins);
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const span = 2.2 * BEAT;
    const X = sec => 40 + (sec / span) * (w - 50);
    const rows = { ecg: 34, phono: 120, jvp: 212 };
    g.font = `600 10px ${MONO}`; g.fillStyle = '#6A7F9B';
    g.fillText('ECG', 2, rows.ecg - 14); g.fillText('PCG', 2, rows.phono - 34); g.fillText('JVP', 2, rows.jvp - 26);
    g.fillStyle = ins ? '#5EEAD4' : '#F5C451';
    g.fillText(ins ? '⬆ INSPIRATION' : '⬇ EXPIRATION', w - 120, 14);
    // ECG
    g.strokeStyle = '#38E07A'; g.lineWidth = 1.4; g.beginPath();
    for (let px = 40; px < w - 10; px++) {
      const sec = (px - 40) / (w - 50) * span; const x = (sec + 0.12) % BEAT - 0.12;
      const v = x > -0.11 && x < -0.03 ? Math.sin((x + 0.11) / 0.08 * Math.PI) * 0.2 : x > -0.01 && x < 0.02 ? 1 - Math.abs(x - 0.005) / 0.015 : x >= 0.02 && x < 0.04 ? -0.25 * Math.sin((x - 0.02) / 0.02 * Math.PI) : x > 0.14 && x < 0.3 ? Math.sin((x - 0.14) / 0.16 * Math.PI) * 0.25 : 0;
      px === 40 ? g.moveTo(px, rows.ecg - v * 18) : g.lineTo(px, rows.ecg - v * 18);
    }
    g.stroke();
    // PCG
    const burst = (at, amp, len = 0.035, color = '#E9F2FC') => {
      if (at > span || at < 0 || amp < 0.03) return;
      g.strokeStyle = color; g.lineWidth = 1.3; g.beginPath();
      for (let k = 0; k <= 40; k++) { const s = at + (k / 40) * len; const a = amp * Math.exp(-k / 12) * (k % 2 ? 1 : -1); k ? g.lineTo(X(s), rows.phono - a * 32) : g.moveTo(X(s), rows.phono); }
      g.stroke();
    };
    const siteGain = les.mur ? les.mur.site[st] : 1;
    for (let b = 0; b < 3; b++) {
      const t0 = b * BEAT;
      burst(t0 + 0.02, les.s1);
      if (T.ck) burst(t0 + T.ck.at, T.ck.amp * (st === 'pulm' || key === 'as-bicuspid' ? 1 : 0.4), 0.014, '#F5C451');
      burst(t0 + T.a2, les.a2 * 0.85);
      if (T.split > 0.022) burst(t0 + T.p2, les.p2 * 0.85 * (st === 'pulm' ? 1 : 0.5), 0.03, '#A78BFA');
      if (T.mur) {
        const len = T.mur.end - T.mur.start, gain = T.mur.gain * siteGain;
        g.fillStyle = `rgba(255,107,154,${0.15 + 0.22 * Math.min(1.5, gain)})`; g.strokeStyle = '#FF6B9A'; g.lineWidth = 1;
        g.beginPath();
        for (let k = 0; k <= 70; k++) {
          const x = k / 70; const e = murEnv(les.mur.pk, x) * gain * (0.75 + 0.25 * Math.sin(k * 12.9 + t * 30));
          const px = X(t0 + T.mur.start + x * len);
          k ? g.lineTo(px, rows.phono - e * 28) : g.moveTo(px, rows.phono);
        }
        for (let k = 70; k >= 0; k--) { const x = k / 70; g.lineTo(X(t0 + T.mur.start + x * len), rows.phono + murEnv(les.mur.pk, x) * gain * 28); }
        g.closePath(); g.fill(); g.stroke();
      }
    }
    g.strokeStyle = '#1B2A40'; g.beginPath(); g.moveTo(40, rows.phono); g.lineTo(w - 10, rows.phono); g.stroke();
    g.font = `600 10px ${MONO}`;
    g.fillStyle = '#9FB4C6'; g.fillText('S1', X(0.02) - 4, rows.phono + 48);
    if (T.ck && T.ck.amp > 0.05) { g.fillStyle = '#F5C451'; g.fillText('EC', X(T.ck.at) + 2, rows.phono - 40); }
    g.fillStyle = '#9FB4C6'; g.fillText('A2', X(T.a2) - 6, rows.phono + 48);
    if (T.split > 0.022) { g.fillStyle = '#A78BFA'; g.fillText('P2', X(T.p2) + 2, rows.phono + 48); }
    // JVP
    g.strokeStyle = '#3ED0F5'; g.lineWidth = 1.6; g.beginPath();
    for (let px = 40; px < w - 10; px++) {
      const sec = (px - 40) / (w - 50) * span; let x = sec % BEAT; if (x > BEAT - 0.15) x -= BEAT;
      const v = jvpWave(x, les.aWave);
      px === 40 ? g.moveTo(px, rows.jvp + 12 - v * 40) : g.lineTo(px, rows.jvp + 12 - v * 40);
    }
    g.stroke();
    g.fillStyle = les.aWave > 1.8 ? '#FF8A80' : '#6A7F9B'; g.fillText('a', X(BEAT - 0.07) - 3, rows.jvp + 12 - (0.35 + les.aWave * 0.32) * 40 - 4);
    g.fillStyle = '#6A7F9B'; g.fillText(`${les.hr} bpm · ${st === 'pulm' ? '2nd left interspace' : '2nd right interspace'}`, w - 260, h - 6);
  }, [key]);

  const start = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const thump = (at, amp, freq = 55, len = 0.07) => {
      if (amp <= 0.02) return;
      const o = ctx.createOscillator(); o.frequency.value = freq;
      const gg = ctx.createGain(); gg.gain.setValueAtTime(0, at); gg.gain.linearRampToValueAtTime(amp, at + 0.005); gg.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(gg).connect(master); o.start(at); o.stop(at + len + 0.02);
    };
    const murmur = (at, len, pk, top) => {
      const n = ctx.createBufferSource(); n.buffer = noise; n.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 260; bp.Q.value = 0.8;
      const gg = ctx.createGain(); gg.gain.setValueAtTime(0, at);
      for (let k = 1; k <= 12; k++) gg.gain.linearRampToValueAtTime(top * murEnv(pk, k / 12 * 0.999), at + len * k / 12);
      gg.gain.linearRampToValueAtTime(0, at + len + 0.01);
      n.connect(bp).connect(gg).connect(master); n.start(at); n.stop(at + len + 0.03);
    };
    let next = ctx.currentTime + 0.1;
    const schedule = () => {
      const { L: les, site: st, insp: ins } = S.current;
      const BEAT = 60 / les.hr, T = psTimes(les, ins);
      while (next < ctx.currentTime + 0.6) {
        thump(next + 0.02, 0.7 * les.s1, 55, 0.08);
        if (T.ck) thump(next + T.ck.at, 0.55 * T.ck.amp * (st === 'pulm' ? 1 : 0.4), 160, 0.02);
        thump(next + T.a2, 0.65 * les.a2, 80, 0.05);
        if (T.split > 0.022) thump(next + T.p2, 0.65 * les.p2 * (st === 'pulm' ? 1 : 0.5), 70, 0.05);
        if (T.mur) murmur(next + T.mur.start, T.mur.end - T.mur.start, les.mur.pk, 0.3 * T.mur.gain * les.mur.site[st]);
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

  const T = psTimes(L, insp);
  const ckWord = !T.ck ? 'absent' : T.ck.amp > 0.6 ? 'loud' : T.ck.amp > 0.3 ? 'soft' : 'faint — almost gone';
  return (
    <div className="cs-card tight">
      {lesions.length > 1 && (
        <div className="cs-row" style={{ marginBottom: 8 }}>
          {lesions.map(k => <button key={k} className={'cs-chip' + (k === key ? ' on' : '')} onClick={() => setKey(k)}>{PS_LESIONS[k].name}</button>)}
        </div>
      )}
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 250 }} aria-label={`Phonocardiogram and JVP: ${L.name}`} /></div>
      <div className="cs-ctrls">
        {!playing ? <button className="cs-btn primary" onClick={start}>🔊 Listen</button> : <button className="cs-btn" onClick={stop}>■ Stop</button>}
        <button className={'cs-chip' + (!insp ? ' on' : '')} onClick={() => { setAuto(false); setInsp(false); }}>⬇ Expiration</button>
        <button className={'cs-chip' + (insp ? ' on' : '')} onClick={() => { setAuto(false); setInsp(true); }}>⬆ Inspiration</button>
        <button className={'cs-chip' + (auto ? ' on' : '')} onClick={() => setAuto(a => !a)}>🫁 Breathe automatically</button>
      </div>
      <div className="cs-ctrls">
        <button className={'cs-chip' + (site === 'pulm' ? ' on' : '')} onClick={() => setSite('pulm')}>🩺 2nd left interspace (pulmonary)</button>
        <button className={'cs-chip' + (site === 'aortic' ? ' on' : '')} onClick={() => setSite('aortic')}>🩺 2nd right interspace (aortic)</button>
      </div>
      <div className="cs-readout">
        <div><span>Ejection click</span><b style={{ color: ckWord === 'loud' ? 'var(--gold)' : undefined }}>{ckWord}</b></div>
        <div><span>S2 split</span><b>{T.split > 0.022 ? `${Math.round(T.split * 1000)} ms` : 'single'}</b></div>
        <div><span>Murmur ends</span><b>{!T.mur ? '—' : L.mur.end === 'p2' ? 'through A2' : 'before A2'}</b></div>
        <div><span>JVP a-wave</span><b style={{ color: L.aWave > 1.8 ? 'var(--red)' : undefined }}>{L.aWave > 1.8 ? 'giant' : L.aWave > 1.1 ? 'prominent' : 'normal'}</b></div>
      </div>
      <ul className="cs-ul" style={{ marginTop: 10, fontSize: 14 }}>{L.notes[site].map(n => <li key={n} className="cs-li">{n}</li>)}</ul>
      <p className="cs-pts">Colours: gold = ejection click (EC) · pink = systolic murmur · violet = P2 · cyan = jugular venous pulse. Sounds are synthesised to teach timing; use headphones.</p>
    </div>
  );
}

/* ============================================================
   CW DOPPLER — PS JET, TR JET, AND THE DAGGER
   ============================================================ */

export const JETS = {
  ps: { name: 'PS jet · parasternal short axis, RVOT', vmax: 4.4, shape: 'round', start: 0.07, dur: 0.31, measured: true },
  tr: { name: 'TR jet · RV-focused apical 4-chamber', vmax: 4.9, shape: 'holo', start: 0.03, dur: 0.37, measured: true },
  inf: { name: 'Compare: dynamic infundibular jet', vmax: 3.6, shape: 'dagger', start: 0.08, dur: 0.29, measured: false },
};
function envAt(shape, k) {
  if (k <= 0 || k >= 1) return 0;
  if (shape === 'round') return k < 0.45 ? Math.sin(k / 0.45 * Math.PI / 2) : Math.cos((k - 0.45) / 0.55 * Math.PI / 2);
  if (shape === 'holo') return k < 0.1 ? k / 0.1 : k < 0.88 ? 1 - 0.06 * Math.abs(k - 0.45) : (1 - k) / 0.12 * 0.94;
  return k < 0.82 ? (k / 0.82) ** 2.4 : (1 - k) / 0.18;      // dagger: concave, late-peaking
}
/** Mean gradient by integrating 4v² over the ejection envelope. */
export function meanGradient(shape, vmax) {
  let s = 0; const n = 200;
  for (let i = 1; i < n; i++) { const v = vmax * envAt(shape, i / n); s += 4 * v * v; }
  return s / (n - 1);
}

export function PSDoppler({ onMeasure, done }) {
  const [jet, setJet] = useState('ps');
  const [cal, setCal] = useState(3);
  const [rec, setRec] = useState({});
  const [rap, setRap] = useState(null);
  const ref = useRef(null);
  const S = useRef({}); S.current = { jet, cal };
  const HR = 76, BEAT = 60 / HR;

  useCanvas(ref, 250, (g, w, h, t) => {
    const { jet: jk, cal: c } = S.current;
    const J = JETS[jk];
    g.fillStyle = '#020508'; g.fillRect(0, 0, w, h);
    const base = 22, bottom = h - 46;
    const Y = v => base + (v / 6) * (bottom - base);
    g.font = `600 10px ${MONO}`;
    for (let v = 0; v <= 6; v++) {
      g.strokeStyle = v === 0 ? '#3B5168' : '#0F1C2A'; g.beginPath(); g.moveTo(34, Y(v)); g.lineTo(w, Y(v)); g.stroke();
      g.fillStyle = '#4C6278'; g.fillText(`-${v}`, 4, Y(v) + 3);
    }
    g.fillText('m/s', 4, bottom + 14);
    const span = 2.4 * BEAT, sweep = (t % span);
    for (let px = 36; px < w - 4; px += 2) {
      const sec = (px - 36) / (w - 40) * span;
      if (sec > sweep && sec < sweep + 0.12) continue;      // erase bar of the sweep
      const x = sec % BEAT, k = (x - J.start) / J.dur;
      const env = J.vmax * envAt(J.shape, k);
      if (env <= 0.05) continue;
      const yTop = Y(0), yEnv = Y(env);
      for (let y = yTop; y < yEnv; y += 2) {
        const frac = (y - yTop) / (yEnv - yTop + 0.001);
        const noise = 0.4 + 0.6 * Math.abs(Math.sin(px * 12.7 + y * 3.3 + Math.floor(t * 20)));
        const lum = (0.25 + 0.75 * frac ** 2.2) * noise;
        g.fillStyle = `rgba(220,235,255,${lum.toFixed(2)})`;
        g.fillRect(px, y, 2, 2);
      }
      g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(px, yEnv - 1, 2, 2);
    }
    // caliper
    if (J.measured) {
      g.strokeStyle = '#F5C451'; g.setLineDash([6, 4]); g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(34, Y(c)); g.lineTo(w, Y(c)); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`; g.fillText(`${c.toFixed(2)} m/s`, w - 92, Y(c) - 5);
    }
    // ECG
    g.strokeStyle = '#38E07A'; g.lineWidth = 1.2; g.beginPath();
    for (let px = 36; px < w - 4; px++) {
      const sec = (px - 36) / (w - 40) * span; const x = (sec + 0.1) % BEAT - 0.1;
      const v = x > -0.01 && x < 0.02 ? 1 - Math.abs(x - 0.005) / 0.015 : x >= 0.02 && x < 0.04 ? -0.3 * Math.sin((x - 0.02) / 0.02 * Math.PI) : x > 0.14 && x < 0.3 ? Math.sin((x - 0.14) / 0.16 * Math.PI) * 0.25 : 0;
      px === 36 ? g.moveTo(px, h - 12 - v * 14) : g.lineTo(px, h - 12 - v * 14);
    }
    g.stroke();
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText(`CW · ${J.name.toUpperCase()}`, 40, 14);
  }, []);

  const record = () => setRec(r => ({ ...r, [jet]: cal }));
  const ps = rec.ps, tr = rec.tr;
  const pg = ps != null ? 4 * ps * ps : null;
  const mg = ps != null ? meanGradient('round', ps) : null;
  const rvsp = tr != null && rap != null ? 4 * tr * tr + rap : null;
  const ready = ps != null && tr != null && rap != null;
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {Object.entries(JETS).map(([k, J]) => <button key={k} className={'cs-chip' + (k === jet ? ' on' : '')} onClick={() => setJet(k)}>{J.name}</button>)}
      </div>
      <div className="cs-viewer">
        <canvas ref={ref} className="cs-canvas" style={{ height: 250 }} aria-label={`Continuous-wave Doppler: ${JETS[jet].name}`} />
      </div>
      <p className="cs-pts" style={{ margin: '6px 0 0' }}>{jet === 'inf' ? '🗡️ Late-peaking, concave “dagger”: the obstruction tightens as the muscle squeezes.' : '🎯 Place the caliper on the dense outer edge of the envelope — not on the feathery noise.'}</p>
      {JETS[jet].measured ? (
        <div className="cs-ctrls">
          <label className="cs-slider" style={{ flex: '1 1 260px' }}>Caliper
            <input type="range" min="0.5" max="6" step="0.05" value={cal} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="Velocity caliper" disabled={!!done} />
            {cal.toFixed(2)} m/s
          </label>
          <button className="cs-btn primary" onClick={record} disabled={!!done}>📌 Record {jet === 'ps' ? 'PS' : 'TR'} peak</button>
        </div>
      ) : <p className="cs-pts" style={{ margin: '8px 0' }}>For comparison only — nothing to measure. Note the shape, not just the height.</p>}
      <div className="cs-card" style={{ margin: '8px 0', padding: 10 }}>
        <p className="cs-p" style={{ margin: '0 0 6px', fontSize: 14 }}>🫁 Subcostal IVC: <b>1.6 cm</b>, collapses <b>&gt; 50%</b> with a sniff. Right atrial pressure estimate?</p>
        <div className="cs-row">
          {[3, 8, 15].map(v => <button key={v} className={'cs-chip' + (rap === v ? ' on' : '')} onClick={() => !done && setRap(v)}>RAP {v} mmHg</button>)}
        </div>
      </div>
      <div className="cs-readout">
        <div><span>PS peak velocity</span><b>{ps != null ? `${ps.toFixed(2)} m/s` : '—'}</b></div>
        <div><span>PS peak gradient</span><b style={{ color: pg > 64 ? 'var(--red)' : undefined }}>{pg != null ? `${Math.round(pg)} mmHg` : '—'}</b></div>
        <div><span>PS mean gradient</span><b>{mg != null ? `${Math.round(mg)} mmHg` : '—'}</b></div>
        <div><span>TR velocity</span><b>{tr != null ? `${tr.toFixed(2)} m/s` : '—'}</b></div>
        <div><span>RVSP = 4V² + RAP</span><b style={{ color: rvsp > 80 ? 'var(--red)' : undefined }}>{rvsp != null ? `${Math.round(rvsp)} mmHg` : '—'}</b></div>
        <div><span>PASP ≈ RVSP − PS gradient</span><b>{rvsp != null && pg != null ? `${Math.round(rvsp - pg)} mmHg` : '—'}</b></div>
      </div>
      {!done && <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" disabled={!ready} onClick={() => onMeasure?.({ ps, tr, rap, pg, mg, rvsp, pasp: rvsp - pg })}>✅ Report the study</button>{!ready && <span className="cs-pts">Record both peaks and pick the RAP.</span>}</div>}
    </div>
  );
}

/* ============================================================
   BALLOON SIZER — LATERAL RV ANGIOGRAM
   ============================================================ */

const LEVELS = {
  hinge: { label: 'Hinge points (the annulus)', y: 168, true: 20 },
  sinus: { label: 'Sinus / main PA', y: 110, true: 27 },
  dome: { label: 'Tip of the dome (the orifice)', y: 134, true: 8 },
};
const PXMM = 4;

export function BalloonSizer({ onResult, done }) {
  const [level, setLevel] = useState('hinge');
  const [l, setL] = useState(150);
  const [r, setR] = useState(250);
  const [balloon, setBalloon] = useState(null);
  const measured = (r - l) / PXMM;
  const bar = balloon ? balloon / measured : null;
  const lv = LEVELS[level];
  const cx = 200;
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {Object.entries(LEVELS).map(([k, v]) => <button key={k} className={'cs-chip' + (k === level ? ' on' : '')} onClick={() => !done && setLevel(k)}>📏 {v.label}</button>)}
      </div>
      <div className="cs-viewer" style={{ background: '#0b0f14' }}>
        <svg viewBox="0 0 400 300" width="100%" style={{ display: 'block', maxHeight: 340 }} aria-label="Lateral right ventricular angiogram with calipers">
          <defs>
            <radialGradient id="psz-bg" cx="50%" cy="50%" r="70%"><stop offset="0" stopColor="#3a4048" /><stop offset="1" stopColor="#15181c" /></radialGradient>
            <linearGradient id="psz-dye" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d0f12" /><stop offset="1" stopColor="#1d2126" /></linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#psz-bg)" />
          {/* contrast-filled RV body, infundibulum, valve dome and dilated PA (dark = contrast on a negative-style display) */}
          <path d="M120 300 C110 250 135 210 150 195 L160 170 L240 170 L250 195 C265 210 290 250 280 300 Z" fill="url(#psz-dye)" opacity="0.92" />
          <path d="M160 170 C168 150 178 138 184 134 L216 134 C222 138 232 150 240 170 Z" fill="#101317" />
          <path d="M184 134 C160 128 146 120 146 104 C144 70 150 40 175 22 C190 12 210 12 225 22 C250 40 256 70 254 104 C254 120 240 128 216 134 Z" fill="#14171b" opacity="0.92" />
          <path d="M200 134 C204 100 214 70 226 40" stroke="#0a0c0e" strokeWidth="7" opacity="0.5" fill="none" />
          <path d="M160 170 C168 150 178 138 184 134 M240 170 C232 150 222 138 216 134" stroke="#8792a0" strokeWidth="2" fill="none" />
          {/* catheter with 10-mm (40 px) markers for calibration */}
          <path d="M20 268 L140 268" stroke="#d6dde6" strokeWidth="3" fill="none" />
          {[0, 1, 2].map(i => <rect key={i} x={40 + i * 40 - 2} y={263} width="4" height="10" fill="#ffffff" />)}
          <text x="14" y="292" fill="#9FB4C6" fontSize="10" fontFamily={MONO}>marker catheter: bands 10 mm apart (40 px)</text>
          {/* calipers */}
          <line x1={l} x2={r} y1={lv.y} y2={lv.y} stroke="#F5C451" strokeWidth="1.5" strokeDasharray="5 3" />
          <line x1={l} x2={l} y1={lv.y - 9} y2={lv.y + 9} stroke="#F5C451" strokeWidth="2" />
          <line x1={r} x2={r} y1={lv.y - 9} y2={lv.y + 9} stroke="#F5C451" strokeWidth="2" />
          <text x={(l + r) / 2} y={lv.y - 12} textAnchor="middle" fill="#F5C451" fontSize="13" fontFamily={MONO} fontWeight="700">{measured.toFixed(1)} mm</text>
          <text x="330" y="40" fill="#9FB4C6" fontSize="10" fontFamily={MONO}>MPA</text>
          <text x="330" y="250" fill="#9FB4C6" fontSize="10" fontFamily={MONO}>RV</text>
          <text x={cx + 34} y="150" fill="#9FB4C6" fontSize="10" fontFamily={MONO}>dome</text>
        </svg>
        <div className="cs-viewer-hud">LATERAL RV ANGIOGRAM · END-SYSTOLE</div>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: '1 1 200px' }}>Left caliper<input type="range" min="100" max="199" step="1" value={l} onChange={e => !done && setL(+e.target.value)} style={{ width: '100%' }} aria-label="Left caliper" /></label>
        <label className="cs-slider" style={{ flex: '1 1 200px' }}>Right caliper<input type="range" min="201" max="300" step="1" value={r} onChange={e => !done && setR(+e.target.value)} style={{ width: '100%' }} aria-label="Right caliper" /></label>
      </div>
      <p className="cs-pts" style={{ margin: '4px 0 8px' }}>Tip: the hinge points are where the leaflets meet the wall — {level === 'hinge' ? `here at x ≈ ${cx - LEVELS.hinge.true * PXMM / 2} and ${cx + LEVELS.hinge.true * PXMM / 2}` : 'switch to the hinge-point level'}.</p>
      <div className="cs-pts" style={{ marginBottom: 6 }}>Single balloon diameter</div>
      <div className="cs-row">
        {[18, 20, 23, 25, 28, 30, 33].map(b => <button key={b} className={'cs-chip' + (balloon === b ? ' on' : '')} onClick={() => !done && setBalloon(b)}>{b} mm</button>)}
      </div>
      <div className="cs-readout">
        <div><span>Measured at</span><b>{lv.label.split(' (')[0]}</b></div>
        <div><span>Diameter</span><b>{measured.toFixed(1)} mm</b></div>
        <div><span>Balloon : annulus</span><b style={{ color: bar == null ? undefined : bar > 1.5 ? 'var(--red)' : bar >= 1.2 && bar <= 1.4 ? 'var(--green)' : 'var(--amber)' }}>{bar ? bar.toFixed(2) : '—'}</b></div>
      </div>
      {!done && <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" disabled={!balloon} onClick={() => onResult?.({ level, measured, balloon, bar: balloon / 20 })}>✅ Confirm the plan</button></div>}
    </div>
  );
}

/* ============================================================
   BALLOON PULMONARY VALVULOPLASTY — FLUOROSCOPY
   ============================================================ */

export function Valvuloplasty({ balloon = 25, onResult, done }) {
  const { setVitals } = useCase();
  const [offset, setOffset] = useState(9);
  const [p, setP] = useState(0);
  const [road, setRoad] = useState(false);
  const [log, setLog] = useState([]);
  const [split, setSplit] = useState(false);
  const [msg, setMsg] = useState('Balloon on an extra-stiff wire in the left pulmonary artery. Centre it on the annulus.');
  const st = useRef({ p: 0, offset: 9, split: false, t0: null, squirt: false, popped: false });
  const timer = useRef(null);
  const [secs, setSecs] = useState(0);
  const ref = useRef(null);
  st.current.offset = offset;

  const tick = () => {
    const s = st.current;
    s.p = Math.min(4, s.p + 0.12);
    const dur = (performance.now() - s.t0) / 1000;
    setP(s.p); setSecs(dur);
    // the RV outflow is occluded while inflated
    setVitals({ sys: Math.max(52, 112 - dur * 7), dia: Math.max(30, 68 - dur * 4), hr: dur > 10 ? 44 : 84 - dur });
    if (!s.squirt && !s.split && s.p > 1.5 && Math.abs(s.offset) > 4) {
      s.squirt = true;
      const to = s.offset > 0 ? 16 : -16;
      s.offset = to; setOffset(to);
      setMsg(s.offset > 0 ? 'The balloon squirted forward into the PA — “melon-seeding”. It was not centred on the waist.' : 'The balloon squirted back into the RV outflow. It was not centred on the waist.');
    }
    if (!s.squirt && !s.split && s.p >= 2.4 && Math.abs(s.offset) <= 4) {
      s.split = true; s.popped = true; setSplit(true);
      setMsg('The waist pops — the fused commissures have torn open. Deflate NOW.');
    }
  };
  const press = () => {
    if (done) return;
    clearInterval(timer.current);
    st.current.t0 = st.current.t0 || performance.now();
    timer.current = setInterval(tick, 100);
  };
  const release = () => clearInterval(timer.current);
  const deflate = () => {
    release();
    const s = st.current;
    if (!s.t0) return;
    const dur = (performance.now() - s.t0) / 1000;
    const entry = { n: log.length + 1, offset: Math.round(s.offset), peak: +s.p.toFixed(1), dur: +dur.toFixed(1), squirt: s.squirt, split: s.popped };
    setLog(L => [...L, entry]);
    s.p = 0; s.t0 = null; s.squirt = false; setP(0); setSecs(0);
    setVitals({ sys: s.split ? 112 : 108, dia: 66, hr: 84 });
    setMsg(entry.split ? `Deflated after ${entry.dur} s. No waist on a check inflation — time to measure the result.` : entry.squirt ? 'Deflated. Re-position: centre the balloon so the waist sits in its middle third.' : 'Deflated. The waist never broke — more pressure, or check the position.');
  };
  useEffect(() => () => clearInterval(timer.current), []);

  useCanvas(ref, 300, (g, w, h, t) => {
    const s = st.current;
    g.fillStyle = '#2a2f35'; g.fillRect(0, 0, w, h);
    // fluoroscopy grain
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${(Math.random() * 0.05).toFixed(3)})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    const cx = w / 2, annY = h * 0.5, mm = 5;
    // heart shadow + spine
    g.fillStyle = 'rgba(15,17,20,0.35)'; g.beginPath(); g.ellipse(cx + 20, h * 0.62, w * 0.32, h * 0.42, 0, 0, Math.PI * 2); g.fill();
    // wire: from RV (bottom-left) up through the valve to the LPA (top-right)
    g.strokeStyle = '#d7dde4'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx - 90, h); g.quadraticCurveTo(cx - 10, h * 0.75, cx, annY); g.quadraticCurveTo(cx + 10, h * 0.2, cx + 120, 18); g.stroke();
    if (road) {
      g.strokeStyle = 'rgba(94,234,212,0.6)'; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(cx - 60, annY); g.lineTo(cx + 60, annY); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(94,234,212,0.8)'; g.font = `600 10px ${MONO}`; g.fillText('annulus (reference frame)', cx + 64, annY + 3);
    }
    // balloon: 40 mm long, centred offset mm above (−) / below (+) the annulus
    const len = 40 * mm, cY = annY - s.offset * mm;
    const fill = clamp(s.p / 3, 0, 1);
    const R = (balloon / 2) * mm * (0.25 + 0.75 * fill);
    const waist = s.split || s.squirt ? 0 : clamp(s.p / 1.2, 0, 1) * (1 - clamp((s.p - 1.8) / 2, 0, 0.35));
    g.beginPath();
    const pts = [];
    for (let k = 0; k <= 60; k++) {
      const y = cY - len / 2 + (k / 60) * len;
      const u = (y - (cY - len / 2)) / len;
      const taper = Math.sin(u * Math.PI) ** 0.3;
      const dW = Math.exp(-(((y - annY) / (4 * mm)) ** 2));
      const rr = Math.max(2, R * taper * (1 - 0.6 * waist * dW));
      pts.push([y, rr]);
    }
    pts.forEach(([y, rr], i) => (i ? g.lineTo(cx + rr, y) : g.moveTo(cx + rr, y)));
    for (let i = pts.length - 1; i >= 0; i--) g.lineTo(cx - pts[i][1], pts[i][0]);
    g.closePath();
    g.fillStyle = s.p > 0.1 ? 'rgba(20,22,26,0.85)' : 'rgba(40,44,50,0.6)'; g.fill();
    g.strokeStyle = '#0c0d0f'; g.lineWidth = 1; g.stroke();
    // balloon markers
    g.fillStyle = '#f2f5f8';
    g.fillRect(cx - 4, cY - len / 2 + 6, 8, 3); g.fillRect(cx - 4, cY + len / 2 - 9, 8, 3);
    // HUD
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText(`LATERAL · ${balloon} mm × 40 mm balloon`, 10, 16);
    g.fillStyle = s.p > 0 ? '#F5C451' : '#6A7F9B'; g.fillText(`${s.p.toFixed(1)} atm`, w - 76, 16);
    if (s.t0) { const d = (performance.now() - s.t0) / 1000; g.fillStyle = d > 10 ? '#FF5A52' : '#E9F2FC'; g.font = `700 14px ${MONO}`; g.fillText(`⏱ ${d.toFixed(1)} s`, w - 90, 36); }
    if (waist > 0.2 && !s.split) { g.fillStyle = '#FF8A80'; g.font = `600 11px ${MONO}`; g.fillText('waist →', cx - R - 62, annY + 4); }
  }, [balloon, road]);

  const success = log.some(e => e.split);
  const maxDur = log.reduce((m, e) => Math.max(m, e.dur), 0);
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 300 }} aria-label="Fluoroscopy of balloon pulmonary valvuloplasty" /></div>
      <p className="cs-p" style={{ margin: '8px 0 0', fontSize: 14, color: split ? 'var(--green)' : 'var(--ink2)' }}>{msg}</p>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: '1 1 260px' }}>Balloon position
          <input type="range" min="-16" max="16" step="1" value={offset} onChange={e => !done && p === 0 && setOffset(+e.target.value)} style={{ width: '100%' }} aria-label="Balloon position relative to the annulus" disabled={!!done || p > 0} />
          {offset === 0 ? 'centred' : `${Math.abs(offset)} mm ${offset > 0 ? 'into the PA' : 'into the RV'}`}
        </label>
        <button className={'cs-chip' + (road ? ' on' : '')} onClick={() => setRoad(v => !v)}>🗺️ Reference frame</button>
      </div>
      <div className="cs-ctrls">
        <button className="cs-btn primary cs-hold" disabled={!!done}
          onPointerDown={e => { e.currentTarget.setPointerCapture?.(e.pointerId); press(); }}
          onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
          onContextMenu={e => e.preventDefault()}
          onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && press()} onKeyUp={release}>Hold to inflate</button>
        <button className="cs-btn" onClick={deflate} disabled={!!done || p === 0}>Deflate</button>
        {secs > 0 && <span className="cs-pts" style={{ color: secs > 10 ? 'var(--red)' : undefined }}>inflated {secs.toFixed(1)} s</span>}
      </div>
      {log.length > 0 && (
        <div className="cs-scroll"><table className="cs-table">
          <thead><tr><th>#</th><th>Position</th><th>Peak atm</th><th>Inflated</th><th>Result</th></tr></thead>
          <tbody>{log.map(e => <tr key={e.n}><td className="num">{e.n}</td><td className="num">{e.offset === 0 ? 'centred' : `${Math.abs(e.offset)} mm ${e.offset > 0 ? 'PA' : 'RV'}`}</td><td className="num">{e.peak}</td><td className="num" style={{ color: e.dur > 10 ? 'var(--red)' : undefined }}>{e.dur} s</td><td>{e.split ? '✅ waist abolished' : e.squirt ? '↗ squirted' : '— waist held'}</td></tr>)}</tbody>
        </table></div>
      )}
      {!done && (success || log.length >= 5) && (
        <div className="cs-row" style={{ marginTop: 10 }}>
          <button className="cs-btn primary" onClick={() => onResult?.({ success, inflations: log.length, maxDur, squirts: log.filter(e => e.squirt).length })}>📉 Pull back and measure</button>
        </div>
      )}
      <p className="cs-pts" style={{ marginTop: 8 }}>Watch the monitor while you inflate: the RV outflow is occluded, so systemic pressure falls within seconds. Aim for a waist that breaks in one short inflation.</p>
    </div>
  );
}

/* ============================================================
   PULL-BACK PRESSURE TRACE: PA → RV
   ============================================================ */

const PULLBACK = {
  pre: [
    { k: 'PA', sys: 24, dia: 10, type: 'art' },
    { k: 'RV', sys: 104, dia: 6, type: 'vent' },
  ],
  post: [
    { k: 'PA', sys: 27, dia: 11, type: 'art' },
    { k: 'Infundibulum', sys: 45, dia: 6, type: 'vent' },
    { k: 'RV body', sys: 64, dia: 6, type: 'vent' },
  ],
};
const artShape = x => (x < 0.12 ? Math.sin(x / 0.12 * Math.PI / 2) : x < 0.3 ? 1 - (x - 0.12) * 1.3 : x < 0.33 ? 0.77 + (x - 0.3) * 1.2 : Math.max(0, 0.8 - (x - 0.33) * 1.2));
const ventShape = x => (x < 0.1 ? Math.sin(x / 0.1 * Math.PI / 2) : x < 0.32 ? 1 - (x - 0.1) * 0.4 : x < 0.42 ? Math.max(0, 0.91 - (x - 0.32) * 9.1) : (x - 0.42) * 0.12);

export function PullbackTrace({ mode = 'pre', onDone }) {
  const [run, setRun] = useState(false);
  const prog = useRef(0);
  const t0 = useRef(null);
  const ref = useRef(null);
  const S = useRef({}); S.current = { mode, run };
  const segs = PULLBACK[mode];
  useEffect(() => { prog.current = 0; t0.current = null; setRun(false); }, [mode]);
  useCanvas(ref, 210, (g, w, h, t) => {
    const { mode: md, run: r } = S.current;
    const sg = PULLBACK[md];
    if (r && prog.current < 1) { if (t0.current == null) t0.current = t; prog.current = Math.min(1, (t - t0.current) / 3); if (prog.current >= 1) onDone?.(); }
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const y = mm => h - 16 - mm / 120 * (h - 56);
    g.font = `10px ${MONO}`;
    for (const v of [0, 30, 60, 90, 120]) { g.strokeStyle = '#13212D'; g.beginPath(); g.moveTo(30, y(v)); g.lineTo(w, y(v)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(v, 4, y(v) + 3); }
    const beats = 9, per = (w - 34) / beats, upto = 34 + prog.current * (w - 34);
    g.strokeStyle = '#FF5A52'; g.lineWidth = 2; g.beginPath();
    let first = true;
    for (let x = 34; x < upto; x += 1.5) {
      const b = (x - 34) / per, idx = Math.min(sg.length - 1, Math.floor(b / beats * sg.length)), s = sg[idx];
      const ph = b % 1, f = s.type === 'art' ? artShape(ph) : ventShape(ph);
      const v = s.dia + (s.sys - s.dia) * f;
      first ? g.moveTo(x, y(v)) : g.lineTo(x, y(v)); first = false;
    }
    g.stroke();
    sg.forEach((s, i) => {
      const x0 = 34 + i / sg.length * (w - 34);
      if (x0 > upto) return;
      g.strokeStyle = '#2B4366'; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(x0, 30); g.lineTo(x0, h - 14); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText(`${s.k} ${s.sys}/${s.dia}`, x0 + 6, 40);
    });
  }, []);
  const rv = segs[segs.length - 1], pa = segs[0], inf = segs.length > 2 ? segs[1] : null;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 210 }} aria-label={`Pull-back pressure trace ${mode}`} />
        <div className="cs-viewer-hud">PULL-BACK · {mode === 'pre' ? 'BEFORE' : 'AFTER'} VALVULOPLASTY · end-hole catheter</div></div>
      <div className="cs-ctrls"><button className="cs-btn primary" onClick={() => { prog.current = 0; t0.current = null; setRun(true); }}>▶ Pull back PA → RV</button></div>
      <div className="cs-readout">
        <div><span>RV systolic</span><b style={{ color: rv.sys > 80 ? 'var(--red)' : undefined }}>{rv.sys} mmHg</b></div>
        <div><span>PA systolic</span><b>{pa.sys} mmHg</b></div>
        <div><span>Peak-to-peak gradient</span><b>{rv.sys - pa.sys} mmHg</b></div>
        {inf && <div><span>Valve / infundibulum</span><b>{inf.sys - pa.sys} / {rv.sys - inf.sys} mmHg</b></div>}
        <div><span>RV : aortic systolic</span><b>{(rv.sys / 112).toFixed(2)}</b></div>
      </div>
    </div>
  );
}

/* ============================================================
   THE SUICIDE RIGHT VENTRICLE — RESUSCITATION BOARD
   ============================================================ */

const RX = [
  { id: 'fluid', label: '💧 500 mL crystalloid bolus', kind: 'good' },
  { id: 'legs', label: '🦵 Lay flat, raise the legs', kind: 'good' },
  { id: 'bb', label: '🛑 IV esmolol / propranolol', kind: 'good' },
  { id: 'phe', label: '🗜️ Phenylephrine 100 µg', kind: 'ok' },
  { id: 'dob', label: '🫀 Dobutamine 5 µg/kg/min', kind: 'harm' },
  { id: 'adr', label: '⚡ Adrenaline 50 µg IV', kind: 'harm' },
  { id: 'gtn', label: '💊 GTN for the chest tightness', kind: 'harm' },
  { id: 'furo', label: '🚽 Furosemide 40 mg (“RV failure”)', kind: 'harm' },
];

export function suicideModel(n) {
  const C = 1 + 0.45 * n.dob + 0.6 * n.adr - 0.32 * Math.min(2, n.bb);
  const hr = clamp(128 + 14 * n.dob + 22 * n.adr - 22 * Math.min(2, n.bb), 58, 175);
  const P = clamp(0.55 + 0.24 * n.fluid + 0.12 * n.legs - 0.22 * n.furo - 0.16 * n.gtn, 0.1, 1.35);
  const grad = clamp(18 + 72 * C * (1.32 - P) * (hr / 110), 8, 140);
  const sys = clamp(126 - 0.62 * grad + 9 * n.phe - 6 * n.gtn, 38, 132);
  return { hr: Math.round(hr), grad: Math.round(grad), sys: Math.round(sys), dia: Math.round(sys * 0.6), rv: Math.round(26 + grad) };
}

export function SuicideRV({ onResult, done }) {
  const { setVitals } = useCase();
  const zero = { fluid: 0, legs: 0, bb: 0, phe: 0, dob: 0, adr: 0, gtn: 0, furo: 0 };
  const [n, setN] = useState(zero);
  const [hist, setHist] = useState([]);
  const [arrest, setArrest] = useState(false);
  const [reported, setReported] = useState(false);
  const m = suicideModel(n);
  const stable = m.sys >= 100 && m.grad <= 40;
  const ref = useRef(null);
  const live = useRef(m); live.current = m;

  useEffect(() => { setVitals({ hr: m.hr, sys: m.sys, dia: m.dia, spo2: m.sys < 60 ? 88 : 96 }); }, [m.hr, m.sys]);   // eslint-disable-line
  useEffect(() => {
    if (stable && !reported && !done) {
      setReported(true);
      const harms = hist.filter(h => RX.find(r => r.id === h).kind === 'harm');
      onResult?.({ harms, steps: hist.length, arrest });
    }
  }, [stable]);   // eslint-disable-line

  const give = id => {
    if (stable || arrest) return;
    if (id === 'legs' && n.legs) return;
    const nn = { ...n, [id]: n[id] + 1 };
    const mm = suicideModel(nn);
    setN(nn); setHist(h => [...h, id]);
    if (mm.sys < 55) setArrest(true);
  };
  const rescue = () => {     // the team stops the harmful drugs, CPR, volume — return of circulation
    setArrest(false);
    setN(v => ({ ...v, dob: 0, adr: 0, gtn: 0, furo: 0 }));
  };

  useCanvas(ref, 240, (g, w, h, t) => {
    const M = live.current;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const beat = 60 / M.hr, ph = (t % beat) / beat, sq = ph < 0.35 ? Math.sin(ph / 0.35 * Math.PI) : 0;
    const narrow = clamp(M.grad / 120, 0, 1);
    const cx = Math.max(100, w * 0.3), base = h - 14;
    // RV body
    g.fillStyle = 'rgba(255,90,82,0.22)'; g.strokeStyle = '#FF5A52'; g.lineWidth = 2;
    const bw = 70 - 12 * sq;
    g.beginPath(); g.moveTo(cx - bw, base); g.quadraticCurveTo(cx - bw - 10, base - 70, cx - 24, base - 100);
    const gap = 22 * (1 - narrow * (0.45 + 0.55 * sq));
    g.lineTo(cx - gap / 2, base - 130); g.lineTo(cx - 14, base - 160); g.lineTo(cx + 14, base - 160); g.lineTo(cx + gap / 2, base - 130);
    g.lineTo(cx + 24, base - 100); g.quadraticCurveTo(cx + bw + 10, base - 70, cx + bw, base); g.closePath(); g.fill(); g.stroke();
    // hypertrophied infundibular muscle
    g.fillStyle = '#7a2b2e';
    g.beginPath(); g.ellipse(cx - 18 - gap / 4, base - 128, 10 + 6 * sq, 18, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx + 18 + gap / 4, base - 128, 10 + 6 * sq, 18, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#9FB4C6'; g.font = `600 10px ${MONO}`;
    g.fillText('PA', cx - 6, base - 166); g.fillText('infundibulum', cx + 34, base - 126); g.fillText('RV', cx - 6, base - 30);
    // gauges
    const bar = (x, label, val, max, bad) => {
      g.fillStyle = '#0F1C30'; g.fillRect(x, 26, 26, h - 52);
      const hh = (h - 52) * clamp(val / max, 0, 1);
      g.fillStyle = bad ? '#FF5A52' : '#34E39A'; g.fillRect(x, h - 26 - hh, 26, hh);
      g.fillStyle = '#9FB4C6'; g.fillText(label, x - 6, 18); g.fillStyle = '#E9F2FC'; g.font = `700 12px ${MONO}`; g.fillText(String(val), x + 1, h - 8); g.font = `600 10px ${MONO}`;
    };
    bar(w * 0.62, 'GRAD', M.grad, 140, M.grad > 40);
    bar(w * 0.74, 'SBP', M.sys, 140, M.sys < 100);
    bar(w * 0.86, 'HR', M.hr, 180, M.hr > 110);
  }, []);

  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 240 }} aria-label="Dynamic infundibular obstruction model" /></div>
      <p className="cs-p" style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 600, color: arrest ? 'var(--red)' : stable ? 'var(--green)' : 'var(--amber)' }}>
        {arrest ? '⚠️ PEA ARREST — the outflow has closed. CPR; stop the drug that caused it.' : stable ? '✅ Stabilised: the infundibulum is open again.' : `⚠️ Infundibular gradient ${m.grad} mmHg — the RV is squeezing its own outlet shut.`}
      </p>
      <div className="cs-row" style={{ marginTop: 8 }}>
        {RX.map(r => (
          <button key={r.id} className="cs-btn" onClick={() => give(r.id)} disabled={!!done || stable || arrest || (r.id === 'legs' && n.legs > 0)}>
            {r.label}{n[r.id] ? ` ×${n[r.id]}` : ''}
          </button>
        ))}
      </div>
      {arrest && <div className="cs-row" style={{ marginTop: 8 }}><button className="cs-btn primary" onClick={rescue}>🫸 CPR, stop inotropes/vasodilators, open the fluids</button></div>}
      <div className="cs-readout">
        <div><span>RV systolic</span><b>{m.rv} mmHg</b></div>
        <div><span>Infundibular gradient</span><b style={{ color: m.grad > 40 ? 'var(--red)' : 'var(--green)' }}>{m.grad} mmHg</b></div>
        <div><span>Systemic BP</span><b style={{ color: m.sys < 90 ? 'var(--red)' : undefined }}>{m.sys}/{m.dia}</b></div>
        <div><span>Heart rate</span><b>{m.hr}</b></div>
      </div>
      {hist.length > 0 && <p className="cs-pts" style={{ marginTop: 8 }}>Given: {hist.map(h => RX.find(r => r.id === h).label.replace(/^\S+\s/, '')).join(' → ')}</p>}
    </div>
  );
}
