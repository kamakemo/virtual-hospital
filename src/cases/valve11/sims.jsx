import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../kit/Monitor.jsx';

/* ============================================================
   AORTIC REGURGITATION SIMULATORS — local to Case 11, written in
   the kit's style so they can be promoted later.

   ARAuscultation   early diastolic decrescendo, Austin Flint,
                    acute AR, mitral stenosis — with manoeuvres
   PulseWave        collapsing, bisferiens, parvus et tardus,
                    the small fast pulse of acute AR
   PeripheralSigns  the eponyms: what each means, which are folklore
   ARDoppler        CW Doppler of the AR jet: pressure half-time
   AortaFlow        PW in the descending aorta: diastolic reversal
   VenaContracta    colour zoom of the jet neck
   TriggerPlot      LV size and EF over serial visits vs thresholds
   AortaRuler       aortic root and ascending aorta on CT
   AoLVPressure     simultaneous LV and aortic pressures
   CoronaryEngage   a Judkins left in a dilated root
   ImpulseControl   dissection + acute AR: the beta-blocker tension
   ============================================================ */

const MONO = '"JetBrains Mono", ui-monospace, monospace';

/* ---------- auscultation ---------- */

export const AR_LESIONS = {
  'ar-chronic': {
    name: 'Chronic severe AR', hr: 70, s1: 0.75, a2: 1, s3: false, os: false, carotid: 'collapsing',
    segs: [
      { ph: 'sys', a: 0.1, b: 0.8, shape: 'diamond', pk: 0.35, loud: 0.42, freq: 380, site: { lse: 0.9, apex: 0.5 }, man: { rest: 1, forward: 1.1, handgrip: 1.1, amyl: 1.15 }, label: 'flow' },
      { ph: 'dia', a: 0.0, b: 0.95, shape: 'decres', loud: 0.85, freq: 640, site: { lse: 1, apex: 0.35 }, man: { rest: 1, forward: 1.55, handgrip: 1.45, amyl: 0.55 }, label: 'AR' },
      { ph: 'dia', a: 0.45, b: 0.98, shape: 'rumble', loud: 0.6, freq: 85, site: { lse: 0.08, apex: 1 }, man: { rest: 1, forward: 0.9, handgrip: 1.35, amyl: 0.45 }, label: 'Austin Flint' },
    ],
    notes: {
      lse: ['High-pitched, blowing, EARLY DIASTOLIC DECRESCENDO starting right at A2 — loudest sitting forward in held expiration', 'A systolic ejection murmur too: not stenosis, just a huge stroke volume crossing a normal-sized orifice', 'Collapsing carotid: a sharp rise and a sudden fall'],
      apex: ['At the apex, with the bell: a low MID-DIASTOLIC RUMBLE — the Austin Flint murmur', 'No opening snap and a soft S1: this is not mitral stenosis', 'The AR jet hits the anterior mitral leaflet and holds it half-shut while the LA tries to empty'],
    },
  },
  'ar-acute': {
    name: 'Acute severe AR', hr: 112, s1: 0.22, a2: 0.9, s3: true, os: false, carotid: 'acute',
    segs: [
      { ph: 'sys', a: 0.1, b: 0.7, shape: 'diamond', pk: 0.35, loud: 0.3, freq: 380, site: { lse: 0.9, apex: 0.5 }, man: { rest: 1, forward: 1.05, handgrip: 1.05, amyl: 1.05 }, label: 'flow' },
      { ph: 'dia', a: 0.0, b: 0.42, shape: 'decres', loud: 0.6, freq: 560, site: { lse: 1, apex: 0.4 }, man: { rest: 1, forward: 1.3, handgrip: 1.2, amyl: 0.75 }, label: 'AR (short)' },
    ],
    notes: {
      lse: ['SHORT, soft, early diastolic murmur: aortic and LV pressures meet early in diastole, so the leak — and the sound — stops early', 'Tachycardia shortens diastole further: easy to miss', 'No collapsing pulse: the pulse pressure is NOT wide'],
      apex: ['S1 soft or absent: the LV pressure rises above the LA before systole and shuts the mitral valve early', 'An S3: a stiff, overfilled ventricle', 'Pulmonary crackles do the talking here'],
    },
  },
  ms: {
    name: 'Mitral stenosis (the mimic)', hr: 76, s1: 1.25, a2: 1, s3: false, os: true, carotid: 'normal',
    segs: [
      { ph: 'dia', a: 0.14, b: 0.62, shape: 'rumble', loud: 0.6, freq: 80, site: { lse: 0.15, apex: 1 }, man: { rest: 1, forward: 0.9, handgrip: 1.1, amyl: 1.4 }, label: 'rumble' },
      { ph: 'dia', a: 0.8, b: 1.0, shape: 'presys', loud: 0.6, freq: 90, site: { lse: 0.15, apex: 1 }, man: { rest: 1, forward: 0.9, handgrip: 1.1, amyl: 1.4 }, label: 'presystolic' },
    ],
    notes: {
      lse: ['Little to hear at the left sternal edge', 'Listen at the apex'],
      apex: ['LOUD S1, then an OPENING SNAP just after S2, then a low rumble with presystolic accentuation', 'Amyl nitrite makes it LOUDER (more flow, faster rate); it makes an Austin Flint SOFTER (less AR)', 'Same rumble, opposite physiology — the snap and the S1 give it away'],
    },
  },
  normal: {
    name: 'Normal', hr: 70, s1: 0.8, a2: 1, s3: false, os: false, carotid: 'normal', segs: [],
    notes: { lse: ['S1, S2 — silence in diastole'], apex: ['S1, S2 — silence in diastole'] },
  },
};

const AR_MAN = [
  { id: 'rest', label: 'At rest', why: '' },
  { id: 'forward', label: 'Sit forward, breath out', why: 'Brings the aortic root and LVOT against the chest wall: AR is loudest here.' },
  { id: 'handgrip', label: 'Handgrip', why: 'Sustained grip raises systemic resistance: more diastolic pressure behind the leak — AR and Austin Flint louder.' },
  { id: 'amyl', label: 'Amyl nitrite', why: 'A brief, powerful vasodilator: aortic diastolic pressure falls, less regurgitates — AR and Austin Flint SOFTER; mitral stenosis LOUDER.' },
];

const sysLen = hr => Math.max(0.22, 0.42 - 0.0015 * hr);

function segEnv(s, x) {           // x 0..1 through the phase
  if (x < s.a || x > s.b) return 0;
  const k = (x - s.a) / (s.b - s.a);
  if (s.shape === 'diamond') return k < s.pk ? k / s.pk : (1 - k) / (1 - s.pk);
  if (s.shape === 'decres') return k < 0.04 ? k / 0.04 : 1 - 0.85 * (k - 0.04) / 0.96;
  if (s.shape === 'rumble') return Math.min(1, k / 0.08) * (0.85 - 0.3 * k) * (0.8 + 0.2 * Math.sin(k * 40));
  if (s.shape === 'presys') return k;
  return 0;
}

export function ARAuscultation({ lesions = ['ar-chronic', 'ar-acute', 'ms', 'normal'], initial }) {
  const [key, setKey] = useState(initial || lesions[0]);
  const [site, setSite] = useState('lse');
  const [man, setMan] = useState('rest');
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  const audio = useRef(null);
  const L = AR_LESIONS[key];
  const S = useRef({}); S.current = { L, site, man };

  useCanvas(ref, 230, (g, w, h, t) => {
    const { L: les, site: st, man: mn } = S.current;
    const BEAT = 60 / les.hr, SYS = sysLen(les.hr);
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const span = 2.2 * BEAT;
    const X = sec => 34 + (sec / span) * (w - 44);
    const rows = { ecg: 34, phono: 116, car: 196 };
    g.font = `600 10px ${MONO}`; g.fillStyle = '#6A7F9B';
    g.fillText('ECG', 2, rows.ecg - 14); g.fillText('PCG', 2, rows.phono - 32); g.fillText('PULSE', 2, rows.car - 24);
    // ECG
    g.strokeStyle = '#38E07A'; g.lineWidth = 1.4; g.beginPath();
    for (let px = 34; px < w - 10; px++) {
      const sec = (px - 34) / (w - 44) * span; const x = (sec + 0.12) % BEAT - 0.12;
      const v = x > -0.11 && x < -0.03 ? Math.sin((x + 0.11) / 0.08 * Math.PI) * 0.15 : x > -0.01 && x < 0.02 ? 1 : x >= 0.02 && x < 0.04 ? -0.25 : x > 0.14 && x < 0.3 ? Math.sin((x - 0.14) / 0.16 * Math.PI) * 0.25 : 0;
      px === 34 ? g.moveTo(px, rows.ecg - v * 18) : g.lineTo(px, rows.ecg - v * 18);
    }
    g.stroke();
    // PCG
    const burst = (at, amp, len = 0.035, color = '#E9F2FC') => {
      if (at > span || at < 0) return;
      g.strokeStyle = color; g.lineWidth = 1.2; g.beginPath();
      for (let k = 0; k <= 40; k++) { const s = at + (k / 40) * len; const a = amp * Math.exp(-k / 14) * (k % 2 ? 1 : -1); k ? g.lineTo(X(s), rows.phono - a * 30) : g.moveTo(X(s), rows.phono); }
      g.stroke();
    };
    for (let b = 0; b < 3; b++) {
      const t0 = b * BEAT;
      const a2 = t0 + SYS + 0.03, dia = BEAT - SYS - 0.03;
      burst(t0 + 0.02, Math.min(1.2, les.s1));
      burst(a2, les.a2 * 0.85);
      if (les.os) burst(a2 + 0.07, 0.5, 0.015, '#F5C451');
      if (les.s3) burst(a2 + 0.14, 0.3, 0.04, '#5EEAD4');
      for (const sg of les.segs) {
        const gain = sg.man[mn] * sg.site[st];
        if (gain < 0.02) continue;
        const startT = sg.ph === 'sys' ? t0 + 0.02 : a2 + 0.01, len = sg.ph === 'sys' ? SYS : dia - 0.01;
        const col = sg.ph === 'sys' ? '255,107,154' : sg.freq < 200 ? '167,139,250' : '34,211,238';
        g.fillStyle = `rgba(${col},${0.16 + 0.22 * Math.min(1.6, gain)})`; g.strokeStyle = `rgb(${col})`; g.lineWidth = 1;
        g.beginPath();
        for (let k = 0; k <= 70; k++) {
          const x = k / 70; const e = segEnv(sg, x) * sg.loud * gain;
          const jit = sg.freq < 200 ? 0.7 + 0.3 * Math.sin(k * 3.1 + t * 20) : 0.75 + 0.25 * Math.sin(k * 12.9 + t * 30);
          const px = X(startT + x * len);
          k ? g.lineTo(px, rows.phono - e * 26 * jit) : g.moveTo(px, rows.phono);
        }
        for (let k = 70; k >= 0; k--) { const x = k / 70; const e = segEnv(sg, x) * sg.loud * gain; g.lineTo(X(startT + x * len), rows.phono + e * 26); }
        g.closePath(); g.fill(); g.stroke();
      }
    }
    g.strokeStyle = '#1B2A40'; g.beginPath(); g.moveTo(34, rows.phono); g.lineTo(w - 10, rows.phono); g.stroke();
    // pulse
    g.strokeStyle = '#3ED0F5'; g.lineWidth = 1.6; g.beginPath();
    for (let px = 34; px < w - 10; px++) {
      const sec = (px - 34) / (w - 44) * span; const x = (sec % BEAT) / BEAT;
      const v = pulseShape(les.carotid, x);
      px === 34 ? g.moveTo(px, rows.car - v * 30) : g.lineTo(px, rows.car - v * 30);
    }
    g.stroke();
    g.fillStyle = '#9FB4C6'; g.font = `600 10px ${MONO}`;
    g.fillText('S1', X(0.02) - 4, rows.phono + 46); g.fillText('S2', X(SYS + 0.03) - 4, rows.phono + 46);
    if (les.os) { g.fillStyle = '#F5C451'; g.fillText('OS', X(SYS + 0.1) - 2, rows.phono + 46); }
    if (les.s3) { g.fillStyle = '#5EEAD4'; g.fillText('S3', X(SYS + 0.17) + 6, rows.phono + 46); }
    g.fillStyle = '#6A7F9B'; g.fillText(`${les.hr} bpm · ${st === 'lse' ? 'left sternal edge' : 'apex, bell'}`, w - 210, 14);
  }, []);

  const start = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const thump = (at, amp, freq = 55, len = 0.07) => {
      if (amp <= 0.01) return;
      const o = ctx.createOscillator(); o.frequency.value = freq;
      const gg = ctx.createGain(); gg.gain.setValueAtTime(0, at); gg.gain.linearRampToValueAtTime(amp, at + 0.008); gg.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(gg).connect(master); o.start(at); o.stop(at + len + 0.02);
    };
    const murmur = (at, len, sg, g0) => {
      const n = ctx.createBufferSource(); n.buffer = noise; n.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = sg.freq < 200 ? 'lowpass' : 'bandpass'; bp.frequency.value = sg.freq < 200 ? 140 : sg.freq; bp.Q.value = 0.9;
      const gg = ctx.createGain(); const top = (sg.freq < 200 ? 0.6 : 0.3) * sg.loud * g0;
      gg.gain.setValueAtTime(0, at);
      for (let k = 1; k <= 12; k++) gg.gain.linearRampToValueAtTime(top * segEnv(sg, k / 12 * 0.999), at + len * k / 12);
      gg.gain.linearRampToValueAtTime(0, at + len + 0.01);
      n.connect(bp).connect(gg).connect(master); n.start(at); n.stop(at + len + 0.03);
    };
    let next = ctx.currentTime + 0.1;
    const schedule = () => {
      const { L: les, site: st, man: mn } = S.current;
      const BEAT = 60 / les.hr, SYS = sysLen(les.hr), dia = BEAT - SYS - 0.03;
      while (next < ctx.currentTime + 0.6) {
        thump(next + 0.02, 0.7 * Math.min(1.3, les.s1), 55, 0.08);
        const a2 = next + SYS + 0.03;
        thump(a2, 0.7 * les.a2, 75, 0.06);
        if (les.os) thump(a2 + 0.07, 0.35, 110, 0.02);
        if (les.s3) thump(a2 + 0.14, 0.3, 40, 0.06);
        for (const sg of les.segs) {
          const gain = sg.man[mn] * sg.site[st];
          if (gain < 0.02) continue;
          const s0 = sg.ph === 'sys' ? next + 0.02 : a2 + 0.01, len = sg.ph === 'sys' ? SYS : dia - 0.01;
          murmur(s0 + sg.a * len, (sg.b - sg.a) * len, { ...sg, a: 0, b: 1 }, gain);
        }
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

  const m = AR_MAN.find(x => x.id === man);
  const loudest = L.segs.length ? Math.max(...L.segs.filter(s => s.ph === 'dia').map(s => s.man[man] * s.site[site]), 0) : 0;
  return (
    <div className="cs-card tight">
      {lesions.length > 1 && (
        <div className="cs-row" style={{ marginBottom: 8 }}>
          {lesions.map(k => <button key={k} className={'cs-chip' + (k === key ? ' on' : '')} onClick={() => setKey(k)}>{AR_LESIONS[k].name}</button>)}
        </div>
      )}
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 230 }} aria-label={`Phonocardiogram: ${L.name}`} /></div>
      <div className="cs-ctrls">
        {!playing ? <button className="cs-btn primary" onClick={start}>🔊 Listen</button> : <button className="cs-btn" onClick={stop}>■ Stop</button>}
        <button className={'cs-chip' + (site === 'lse' ? ' on' : '')} onClick={() => setSite('lse')}>🩺 Left sternal edge</button>
        <button className={'cs-chip' + (site === 'apex' ? ' on' : '')} onClick={() => setSite('apex')}>🩺 Apex (bell)</button>
      </div>
      <div className="cs-ctrls">
        {AR_MAN.map(x => <button key={x.id} className={'cs-chip' + (man === x.id ? ' on' : '')} onClick={() => setMan(x.id)}>{x.label}</button>)}
      </div>
      <div className="cs-readout">
        <div><span>Diastolic murmur</span><b style={{ color: loudest > 1.1 ? 'var(--red)' : loudest < 0.9 && loudest > 0 ? 'var(--cyan)' : undefined }}>{!loudest ? '—' : loudest > 1.1 ? '▲ louder' : loudest < 0.9 ? '▼ softer' : 'baseline'}</b></div>
        <div><span>S1</span><b>{L.s1 > 1 ? 'loud' : L.s1 < 0.4 ? 'soft / absent' : L.s1 < 0.8 ? 'soft' : 'normal'}</b></div>
        <div><span>Heart rate</span><b>{L.hr}</b></div>
      </div>
      <ul className="cs-ul" style={{ marginTop: 10, fontSize: 14 }}>{L.notes[site].map(n => <li key={n} className="cs-li">{n}</li>)}</ul>
      {m.why && <p className="cs-pts">{m.label}: {m.why}</p>}
      <p className="cs-pts">Colours: pink systolic · cyan high-pitched diastolic · violet low rumble. Use headphones; the sounds are synthesised to teach timing and shape.</p>
    </div>
  );
}

/* ---------- arterial pulse waveforms ---------- */

function pulseShape(kind, x) {
  switch (kind) {
    case 'collapsing': return x < 0.09 ? Math.sin(x / 0.09 * Math.PI / 2) * 1.15 : x < 0.2 ? 1.15 - (x - 0.09) * 6.5 : Math.max(-0.05, 0.43 - (x - 0.2) * 0.62);
    case 'bisferiens': return x < 0.07 ? Math.sin(x / 0.07 * Math.PI / 2) * 1.05 : x < 0.14 ? 1.05 - (x - 0.07) * 4.2 : x < 0.26 ? 0.76 + Math.sin((x - 0.14) / 0.12 * Math.PI) * 0.26 : Math.max(0, 0.76 - (x - 0.26) * 1.2);
    case 'parvus': return x < 0.42 ? Math.sin(x / 0.42 * Math.PI / 2) * 0.5 : Math.max(0, 0.5 - (x - 0.42) * 0.85);
    case 'acute': return x < 0.12 ? Math.sin(x / 0.12 * Math.PI / 2) * 0.48 : Math.max(0.12, 0.48 - (x - 0.12) * 0.9);
    default: return x < 0.12 ? Math.sin(x / 0.12 * Math.PI / 2) * 0.8 : x < 0.3 ? 0.8 - (x - 0.12) * 1.1 : x < 0.33 ? 0.6 + (x - 0.3) * 1.6 : Math.max(0, 0.65 - (x - 0.33) * 0.95);
  }
}

const PULSES = {
  normal: { name: 'Normal', bp: '124/78', pp: 46, hr: 72, feel: 'A smooth rise, a dicrotic notch, a gentle fall.', why: 'Normal stroke volume into a normally resistant arterial tree.' },
  collapsing: { name: 'Collapsing (chronic AR)', bp: '168/44', pp: 124, hr: 70, feel: 'A sharp slap against the fingers — then nothing. Lift his arm and it hits harder (water-hammer).', why: 'A huge stroke volume throws the systolic pressure up; in diastole blood runs back into the LV AND out to dilated peripheral beds, so the pressure falls away fast.' },
  bisferiens: { name: 'Bisferiens (severe AR ± AS)', bp: '156/52', pp: 104, hr: 72, feel: 'Two systolic peaks under the finger.', why: 'A huge, fast ejection: the percussion wave and the reflected tidal wave separate into two peaks. Also in HOCM (spike-and-dome).' },
  parvus: { name: 'Parvus et tardus (AS)', bp: '112/80', pp: 32, hr: 70, feel: 'Small, slow, late — the contrast to AR.', why: 'A fixed obstruction meters the ejection.' },
  acute: { name: 'Acute severe AR', bp: '96/56', pp: 40, hr: 112, feel: 'Small, fast, thready. NOT collapsing.', why: 'The stroke volume is not big — the LV has not had time to dilate. Diastolic pressure stays up because aortic and LV pressures meet early. No wide pulse pressure: the classic signs are absent.' },
};

export function PulseWave({ initial = 'collapsing', modes = Object.keys(PULSES) }) {
  const [k, setK] = useState(initial);
  const [arm, setArm] = useState(false);
  const ref = useRef(null);
  const S = useRef({}); S.current = { k, arm };
  useCanvas(ref, 190, (g, w, h, t) => {
    const { k: kind, arm: up } = S.current;
    const P = PULSES[kind];
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const base = h - 30, amp = (h - 60) * (up && kind === 'collapsing' ? 1.12 : 1);
    g.strokeStyle = '#13212D'; g.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(30, base - i * amp / 4); g.lineTo(w, base - i * amp / 4); g.stroke(); }
    const per = 60 / P.hr, spd = 120;
    // a ghost of the normal pulse for comparison
    for (const [kind2, col, lw] of [['normal', 'rgba(120,140,160,0.35)', 1.2], [kind, '#FF5A52', 2.2]]) {
      if (kind2 === 'normal' && kind === 'normal') continue;
      const per2 = kind2 === 'normal' ? 60 / 72 : per;
      g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
      for (let px = 30; px < w; px += 1.5) {
        const sec = t - (w - px) / spd; const x = ((sec / per2) % 1 + 1) % 1;
        const y = base - (pulseShape(kind2, x) * 0.85 + 0.05) * amp * (up && kind2 === 'collapsing' ? 1.1 : 1);
        px === 30 ? g.moveTo(px, y) : g.lineTo(px, y);
      }
      g.stroke();
    }
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText(`RADIAL / ARTERIAL LINE · ${P.name.toUpperCase()}`, 36, 16);
    g.fillStyle = 'rgba(120,140,160,0.7)'; g.fillText('grey = normal pulse', w - 170, 16);
  }, []);
  const P = PULSES[k];
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {modes.map(m => <button key={m} className={'cs-chip' + (m === k ? ' on' : '')} onClick={() => setK(m)}>{PULSES[m].name}</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 190 }} aria-label={`Pulse waveform: ${P.name}`} /></div>
      <div className="cs-ctrls">
        <button className={'cs-chip' + (arm ? ' on' : '')} onClick={() => setArm(a => !a)}>✋ {arm ? 'Arm raised' : 'Raise the arm, palm on the forearm'}</button>
      </div>
      <div className="cs-readout">
        <div><span>Blood pressure</span><b>{P.bp}</b></div>
        <div><span>Pulse pressure</span><b style={{ color: P.pp > 80 ? 'var(--red)' : P.pp < 35 ? 'var(--cyan)' : undefined }}>{P.pp} mmHg</b></div>
        <div><span>Rate</span><b>{P.hr}</b></div>
      </div>
      <p className="cs-p" style={{ marginTop: 10, marginBottom: 4 }}><b>👆 You feel:</b> {P.feel}{arm && k === 'collapsing' ? ' Raised above the heart, the arterial column empties faster in diastole — the next beat lands harder.' : ''}</p>
      <p className="cs-pts">🧬 Why: {P.why}</p>
    </div>
  );
}

/* ---------- peripheral signs ---------- */

const SIGNS = [
  { id: 'corrigan', n: 'Corrigan’s pulse', what: 'Visible, forceful carotid pulsation that collapses.', mech: 'Wide pulse pressure: huge systolic ejection, rapid diastolic run-off.', rate: 'useful', note: 'Tells you pulse pressure is wide — no more.' },
  { id: 'water', n: 'Water-hammer pulse', what: 'Palm on the raised forearm: a slapping, then vanishing, pulse.', mech: 'Raising the arm lowers the local diastolic pressure; the collapse becomes palpable.', rate: 'useful', note: 'A good bedside screen for a wide pulse pressure.' },
  { id: 'demusset', n: 'de Musset’s sign', what: 'The head bobs with every heartbeat.', mech: 'Each huge stroke volume recoils the head.', rate: 'weak', note: 'Dramatic, rare, late; insensitive.' },
  { id: 'quincke', n: 'Quincke’s sign', what: 'Capillary pulsation in the nail bed on light pressure.', mech: 'Pulsatile flow reaches the capillaries.', rate: 'weak', note: 'Seen in other high-output states and in normal people; non-specific.' },
  { id: 'traube', n: 'Traube’s sign', what: '“Pistol-shot” sound over the femoral artery.', mech: 'The sudden distension of the artery wall with each beat.', rate: 'weak', note: 'Supportive at best.' },
  { id: 'duroziez', n: 'Duroziez’s sign', what: 'Compress the femoral artery with the stethoscope: a systolic murmur, then a diastolic one as you press harder.', mech: 'The diastolic component is BACKWARD flow toward the heart in diastole — the same reversal you will see in the descending aorta on Doppler.', rate: 'useful', note: 'The most specific of the eponyms when done properly; absent in mild AR.' },
  { id: 'muller', n: 'Müller’s sign', what: 'The uvula pulsates.', mech: 'Pulsatile flow in the soft palate.', rate: 'weak', note: 'A curiosity.' },
  { id: 'hill', n: 'Hill’s sign', what: 'Popliteal cuff systolic pressure > 60 mmHg above brachial.', mech: 'Claimed: amplification of the pulse wave toward the periphery.', rate: 'folklore', note: 'Intra-arterial measurement shows little real difference: much of it is a cuff artefact. Do not grade AR with it.' },
  { id: 'becker', n: 'Becker’s sign', what: 'Pulsating retinal arterioles.', mech: 'Pulsatile flow in the retina.', rate: 'folklore', note: 'Rarely sought, rarely seen, never needed.' },
  { id: 'austin', n: 'Austin Flint murmur', what: 'Apical mid-diastolic rumble.', mech: 'The AR jet strikes the anterior mitral leaflet and holds it partly closed — functional mitral stenosis.', rate: 'useful', note: 'Implies a large jet. Tells it from true MS: no opening snap, soft S1, softens with amyl nitrite.' },
];
const RATE = { useful: ['🟢', 'Useful', 'var(--green)'], weak: ['🟡', 'Weak', 'var(--amber)'], folklore: ['🔴', 'Folklore', 'var(--red)'] };

export function PeripheralSigns() {
  const [sel, setSel] = useState('corrigan');
  const s = SIGNS.find(x => x.id === sel);
  const r = RATE[s.rate];
  return (
    <div className="cs-card">
      <div className="cs-h2" style={{ marginTop: 0 }}>🔎 The eponyms — tap each one</div>
      <div className="cs-row" style={{ marginBottom: 10 }}>
        {SIGNS.map(x => <button key={x.id} className={'cs-chip' + (x.id === sel ? ' on' : '')} onClick={() => setSel(x.id)}>{RATE[x.rate][0]} {x.n}</button>)}
      </div>
      <div className="cs-grid2">
        <div>
          <p className="cs-q" style={{ marginBottom: 6 }}>{s.n}</p>
          <p className="cs-p" style={{ marginBottom: 6 }}><b>What you see/hear:</b> {s.what}</p>
          <p className="cs-p" style={{ marginBottom: 0 }}><b>🧬 Mechanism:</b> {s.mech}</p>
        </div>
        <div>
          <p className="cs-p" style={{ marginBottom: 6 }}><b style={{ color: r[2] }}>{r[0]} {r[1]}</b></p>
          <p className="cs-p" style={{ marginBottom: 0 }}>{s.note}</p>
        </div>
      </div>
      <p className="cs-pts" style={{ marginTop: 10 }}>Every one of them is a pulse-pressure sign. They tell you the run-off is fast — never the size of the leak, never the state of the ventricle. And in ACUTE AR they are all absent.</p>
    </div>
  );
}

/* ---------- CW Doppler of the AR jet: pressure half-time ---------- */

/**
 * The AR jet from the apex flows toward the probe: a diastolic envelope above
 * the baseline, peaking ~4–5 m/s just after valve closure and decaying as the
 * aortic and LV pressures approach each other. Match the slope; pressure
 * half-time is the time for the velocity to fall to v₀/√2.
 */
export function ARDoppler({ pht = 190, v0 = 4.4, onMeasure, done, title }) {
  const ref = useRef(null);
  const [slope, setSlope] = useState(3.0);   // m/s²
  const trueSlope = 0.293 * v0 / (pht / 1000);
  const S = useRef({}); S.current = { slope, trueSlope };
  useCanvas(ref, 240, (g, w, h, t) => {
    const { slope: sl, trueSlope: ts } = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const base = h - 30, vmax = 6, Y = v => base - v / vmax * (h - 50);
    g.strokeStyle = '#2B3B4E'; g.fillStyle = '#6A7F9B'; g.font = `10px ${MONO}`;
    for (let v = 0; v <= vmax; v++) { g.beginPath(); g.moveTo(40, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.fillText(`${v}`, 6, Y(v) + 3); }
    g.fillText('m/s', 6, 14);
    const pxs = 260;                                  // px per second
    const beat = 0.86, sys = 0.3, dia = beat - sys;
    const nb = Math.ceil((w - 40) / (beat * pxs)) + 1;
    for (let b = 0; b < nb; b++) {
      const x0 = 44 + b * beat * pxs;
      // systolic forward flow below the baseline (away from the probe)
      for (let px = 0; px < sys * pxs; px += 1.5) {
        const v = Math.sin(px / (sys * pxs) * Math.PI) * 1.6;
        g.fillStyle = 'rgba(200,200,200,0.55)'; g.fillRect(x0 + px, base, 1.5, Math.min(26, v * 14));
      }
      // diastolic AR envelope
      const d0 = x0 + sys * pxs;
      for (let px = 0; px < dia * pxs; px += 1.5) {
        const tt = px / pxs;
        const rise = Math.min(1, tt / 0.025);
        const v = Math.max(0.3, (v0 - ts * tt)) * rise;
        for (let k = 0; k < 7; k++) { const vv = v * (0.5 + Math.random() * 0.5); g.fillStyle = `rgba(230,230,230,${0.25 + Math.random() * 0.45})`; g.fillRect(d0 + px, Y(vv), 1.5, 2); }
        g.fillStyle = 'rgba(245,245,245,0.95)'; g.fillRect(d0 + px, Y(v) - 1, 1.5, 2);
      }
      // the learner's slope line
      if (b === 1) {
        g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.setLineDash([6, 4]); g.beginPath();
        g.moveTo(d0 + 0.025 * pxs, Y(v0 - sl * 0.025)); g.lineTo(d0 + dia * pxs, Y(Math.max(0, v0 - sl * dia))); g.stroke(); g.setLineDash([]);
        // half-time marker
        const tH = 0.293 * v0 / sl;
        if (tH < dia) {
          g.fillStyle = '#F5C451'; g.beginPath(); g.arc(d0 + tH * pxs, Y(v0 / Math.SQRT2), 4, 0, Math.PI * 2); g.fill();
          g.font = `700 11px ${MONO}`; g.fillText('v₀/√2', d0 + tH * pxs + 6, Y(v0 / Math.SQRT2) - 6);
        }
      }
    }
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(40 + (t * 90) % (w - 40), 0, 8, h);
    g.strokeStyle = '#6A7F9B'; g.beginPath(); g.moveTo(40, base); g.lineTo(w, base); g.stroke();
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText('CW · AORTIC REGURGITATION · APICAL 5C', 46, 16);
  }, [pht, v0]);
  const phtM = Math.round(0.293 * v0 / slope * 1000);
  const close = Math.abs(phtM - pht) <= 25;
  return (
    <div className="cs-card tight">
      {title && <div className="cs-pts" style={{ marginBottom: 8 }}>{title}</div>}
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 240 }} aria-label="Continuous-wave Doppler of aortic regurgitation" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Deceleration slope
          <input type="range" min="1.5" max="14" step="0.05" value={slope} disabled={!!done} onChange={e => setSlope(+e.target.value)} style={{ width: '100%' }} aria-label="Deceleration slope" />
          {slope.toFixed(1)} m/s²</label>
        <button className="cs-btn primary" disabled={!!done} onClick={() => onMeasure?.({ pht: phtM, slope, close })}>📏 Measure PHT</button>
      </div>
      <div className="cs-readout">
        <div><span>Pressure half-time</span><b style={{ color: phtM < 200 ? 'var(--red)' : phtM > 500 ? 'var(--green)' : undefined }}>{phtM} ms</b></div>
        <div><span>Grade by PHT</span><b style={{ fontSize: 15 }}>{phtM < 200 ? 'severe' : phtM > 500 ? 'mild' : 'intermediate'}</b></div>
        <div><span>Peak AR velocity</span><b>{v0.toFixed(1)} m/s</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Lay the yellow line along the dense edge of the diastolic envelope, from its peak to its end. A steep slope = a short half-time = pressures equalising fast.</p>
    </div>
  );
}

/* ---------- PW Doppler in the descending aorta ---------- */

const AO_PATTERNS = {
  normal: { name: 'Normal', rev: [0.12, 0.1, 0.0], edv: 0 },
  moderate: { name: 'Moderate AR', rev: [0.3, 0.45, 0.06], edv: 10 },
  severe: { name: 'Severe AR (patient)', rev: [0.45, 1.0, 0.28], edv: 28 },
};

export function AortaFlow({ onMeasure, done }) {
  const ref = useRef(null);
  const [pat, setPat] = useState('severe');
  const [siteK, setSiteK] = useState('desc');
  const [cal, setCal] = useState(10);
  const S = useRef({}); S.current = { pat, siteK, cal };
  useCanvas(ref, 230, (g, w, h, t) => {
    const { pat: p, siteK: sk, cal: c } = S.current;
    const P = AO_PATTERNS[p];
    const scale = sk === 'abd' ? 0.8 : 1;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const base = h * 0.42, Yup = v => base - v / 60 * (base - 16), Ydn = v => base + v / 150 * (h - base - 14);
    g.strokeStyle = '#2B3B4E'; g.fillStyle = '#6A7F9B'; g.font = `10px ${MONO}`;
    for (const v of [20, 40, 60]) { g.beginPath(); g.moveTo(40, Yup(v)); g.lineTo(w, Yup(v)); g.stroke(); g.fillText(`+${v}`, 4, Yup(v) + 3); }
    for (const v of [50, 100]) { g.beginPath(); g.moveTo(40, Ydn(v)); g.lineTo(w, Ydn(v)); g.stroke(); g.fillText(`−${v}`, 4, Ydn(v) + 3); }
    g.fillText('cm/s', w - 40, 12);
    const pxs = 230, beat = 0.86, sys = 0.32;
    const nb = Math.ceil((w - 40) / (beat * pxs)) + 1;
    for (let b = 0; b < nb; b++) {
      const x0 = 44 + b * beat * pxs;
      for (let px = 0; px < beat * pxs; px += 1.5) {
        const tt = px / pxs;
        let fwd = 0, rev = 0;
        if (tt < sys) fwd = Math.sin(tt / sys * Math.PI) * 110 * scale;
        else {
          const k = (tt - sys) / (beat - sys);
          const early = P.rev[0] * 55 * Math.exp(-k * 9);
          const holo = (P.rev[2] * 100 + (P.rev[1] - P.rev[2]) * 40 * (1 - k)) * (k < 0.04 ? k / 0.04 : 1) * (p === 'normal' ? 0 : 1);
          rev = (early + holo) * scale;
        }
        g.fillStyle = 'rgba(225,225,225,0.85)';
        if (fwd > 0) g.fillRect(x0 + px, base, 1.5, Ydn(fwd) - base);
        if (rev > 0.5) g.fillRect(x0 + px, Yup(rev), 1.5, base - Yup(rev));
      }
      // end-diastole marker
      g.strokeStyle = 'rgba(56,224,122,0.5)'; g.beginPath(); g.moveTo(x0 + beat * pxs - 2, 14); g.lineTo(x0 + beat * pxs - 2, h - 8); g.stroke();
    }
    g.strokeStyle = '#6A7F9B'; g.beginPath(); g.moveTo(40, base); g.lineTo(w, base); g.stroke();
    // caliper on reversed velocity
    g.strokeStyle = '#F5C451'; g.setLineDash([6, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(40, Yup(c)); g.lineTo(w, Yup(c)); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`; g.fillText(`${c} cm/s`, w - 80, Yup(c) - 6);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText(sk === 'abd' ? 'PW · ABDOMINAL AORTA · SUBCOSTAL' : 'PW · PROXIMAL DESCENDING AORTA · SUPRASTERNAL', 46, h - 8);
    g.fillStyle = '#38E07A'; g.fillText('│ = end-diastole (R wave)', w - 210, h - 8);
  }, []);
  const P = AO_PATTERNS[pat];
  const edv = Math.round(P.edv * (siteK === 'abd' ? 0.8 : 1));
  const close = pat === 'severe' && siteK === 'desc' && Math.abs(cal - P.edv) <= 4;
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {Object.entries(AO_PATTERNS).map(([k, v]) => <button key={k} className={'cs-chip' + (k === pat ? ' on' : '')} onClick={() => setPat(k)}>{v.name}</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 230 }} aria-label="Pulsed-wave Doppler in the aorta" /></div>
      <div className="cs-ctrls">
        <button className={'cs-chip' + (siteK === 'desc' ? ' on' : '')} onClick={() => setSiteK('desc')}>📍 Proximal descending aorta</button>
        <button className={'cs-chip' + (siteK === 'abd' ? ' on' : '')} onClick={() => setSiteK('abd')}>📍 Abdominal aorta</button>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>End-diastolic reverse velocity
          <input type="range" min="0" max="60" step="1" value={cal} disabled={!!done} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="Reverse velocity caliper" />
        </label>
        <button className="cs-btn primary" disabled={!!done || pat !== 'severe'} onClick={() => onMeasure?.({ edv: cal, site: siteK, close })}>📏 Measure (patient)</button>
      </div>
      <div className="cs-readout">
        <div><span>Diastolic reversal</span><b style={{ fontSize: 15 }}>{pat === 'normal' ? 'brief, early only' : pat === 'moderate' ? 'longer, fades' : 'HOLODIASTOLIC'}</b></div>
        <div><span>Reverse velocity at end-diastole</span><b style={{ color: edv > 20 ? 'var(--red)' : undefined }}>{edv ? `~${edv} cm/s` : '0'}</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>A short early reversal is normal (elastic recoil of the arch). Reversal that lasts all of diastole, still &gt; 20 cm/s at end-diastole, means severe AR. In the abdominal aorta it is even more specific. Set the caliper on the patient’s trace at the green end-diastole line.</p>
    </div>
  );
}

/* ---------- vena contracta ---------- */

export function VenaContracta({ vc = 7.5, onMeasure, done }) {
  const ref = useRef(null);
  const [lvl, setLvl] = useState('lvot');
  const [width, setWidth] = useState(10);
  const S = useRef({}); S.current = { lvl, width };
  useCanvas(ref, 280, (g, w, h, t) => {
    const { lvl: L, width: wd } = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const mm = Math.min(w, 640) / 60, cx = w * 0.5, vy = h * 0.42;   // valve plane
    // aortic root walls (top) and LVOT (bottom) — parasternal long axis, zoomed
    g.strokeStyle = 'rgba(200,200,200,0.6)'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(cx - 24 * mm, vy - 13 * mm); g.quadraticCurveTo(cx - 16 * mm, vy - 18 * mm, cx - 13 * mm, vy - 2 * mm); g.stroke();
    g.beginPath(); g.moveTo(cx + 24 * mm, vy - 13 * mm); g.quadraticCurveTo(cx + 16 * mm, vy - 18 * mm, cx + 13 * mm, vy - 2 * mm); g.stroke();
    g.beginPath(); g.moveTo(cx - 13 * mm, vy + 2 * mm); g.lineTo(cx - 15 * mm, h); g.stroke();
    g.beginPath(); g.moveTo(cx + 13 * mm, vy + 2 * mm); g.lineTo(cx + 20 * mm, h); g.stroke();
    // cusps, closed with a central gap
    const gap = vc * mm;
    g.strokeStyle = 'rgba(240,240,240,0.95)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(cx - 13 * mm, vy - 1 * mm); g.quadraticCurveTo(cx - 8 * mm, vy + 3 * mm, cx - gap / 2, vy + 1 * mm); g.stroke();
    g.beginPath(); g.moveTo(cx + 13 * mm, vy - 1 * mm); g.quadraticCurveTo(cx + 8 * mm, vy + 3 * mm, cx + gap / 2, vy + 1 * mm); g.stroke();
    const diaPh = ((t * 1.15) % 1) > 0.35;
    if (diaPh) {
      // flow convergence above, narrow neck, then the jet fanning out into the LVOT
      g.fillStyle = 'rgba(60,120,255,0.5)'; g.beginPath(); g.arc(cx, vy, 8 * mm, Math.PI, 0); g.fill();
      g.fillStyle = 'rgba(255,190,40,0.6)'; g.beginPath(); g.arc(cx, vy, 4.5 * mm, Math.PI, 0); g.fill();
      const grd = g.createLinearGradient(cx, vy, cx, h); grd.addColorStop(0, 'rgba(255,240,90,0.95)'); grd.addColorStop(0.3, 'rgba(80,255,130,0.85)'); grd.addColorStop(1, 'rgba(60,120,255,0.35)');
      g.fillStyle = grd; g.beginPath(); g.moveTo(cx - gap / 2, vy + 1 * mm);
      g.quadraticCurveTo(cx - gap * 0.6, vy + 8 * mm, cx - 12 * mm, h); g.lineTo(cx + 15 * mm, h); g.quadraticCurveTo(cx + gap * 0.6, vy + 8 * mm, cx + gap / 2, vy + 1 * mm); g.closePath(); g.fill();
    }
    // caliper
    const y = L === 'neck' ? vy + 1.5 * mm : L === 'lvot' ? vy + 14 * mm : vy - 5 * mm;
    g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - wd * mm / 2, y); g.lineTo(cx + wd * mm / 2, y); g.stroke();
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * wd * mm / 2, y - 6); g.lineTo(cx + s * wd * mm / 2, y + 6); g.stroke(); }
    g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`; g.fillText(`${wd.toFixed(1)} mm`, cx + wd * mm / 2 + 10, y + 4);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText('PLAX · ZOOM · COLOUR · DIASTOLE', 10, 16);
    g.fillText('Ao', cx - 2, 26); g.fillText('LVOT', cx - 12, h - 10);
  }, [vc]);
  const close = lvl === 'neck' && Math.abs(width - vc) <= 0.8;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 280 }} aria-label="Colour Doppler zoom of the aortic regurgitant jet" /></div>
      <div className="cs-ctrls">
        <span className="cs-pts">Caliper level:</span>
        {[['above', 'Flow convergence (aortic side)'], ['neck', 'The neck — narrowest point'], ['lvot', 'The jet in the LVOT']].map(([k, l]) => (
          <button key={k} className={'cs-chip' + (lvl === k ? ' on' : '')} disabled={!!done} onClick={() => setLvl(k)}>{l}</button>
        ))}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Width
          <input type="range" min="2" max="20" step="0.1" value={width} disabled={!!done} onChange={e => setWidth(+e.target.value)} style={{ width: '100%' }} aria-label="Vena contracta caliper width" />
        </label>
        <button className="cs-btn primary" disabled={!!done} onClick={() => onMeasure?.({ width, lvl, close })}>📏 Measure VC</button>
      </div>
      <div className="cs-readout">
        <div><span>Vena contracta</span><b style={{ color: lvl === 'neck' && width > 6 ? 'var(--red)' : undefined }}>{lvl === 'neck' ? `${width.toFixed(1)} mm` : '—'}</b></div>
        <div><span>Severe if</span><b>&gt; 6 mm</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>The vena contracta is the narrowest neck of the jet, just below the cusps — not the flow converging above it, not the jet spreading in the LVOT (which depends on the colour gain and the LVOT size).</p>
    </div>
  );
}

/* ---------- serial LV measurements vs guideline triggers ---------- */

const METRICS = {
  lvesd: { label: 'LVESD (mm)', min: 35, max: 60, i: 50, iDir: '>', iib: null, unit: 'mm' },
  lvesdi: { label: 'LVESDi (mm/m²)', min: 16, max: 30, i: 25, iDir: '>', iib: 22, unit: 'mm/m²' },
  lvesvi: { label: 'LVESVi (mL/m²)', min: 25, max: 60, i: null, iDir: '>', iib: 45, unit: 'mL/m²' },
  ef: { label: 'LVEF (%)', min: 40, max: 70, i: 50, iDir: '≤', iib: 55, unit: '%' },
};

export function TriggerPlot({ visits }) {
  const [m, setM] = useState('lvesd');
  const [sel, setSel] = useState(visits.length - 1);
  const M = METRICS[m];
  const W = 560, H = 250, x0 = 54, x1 = W - 20, y0 = 20, y1 = H - 40;
  const X = i => x0 + (i / (visits.length - 1)) * (x1 - x0);
  const Y = v => y1 - (v - M.min) / (M.max - M.min) * (y1 - y0);
  const pts = visits.map((v, i) => [X(i), Y(v[m])]);
  const v = visits[sel];
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ marginBottom: 8 }}>
        {Object.entries(METRICS).map(([k, x]) => <button key={k} className={'cs-chip' + (k === m ? ' on' : '')} onClick={() => setM(k)}>{x.label}</button>)}
      </div>
      <div className="cs-viewer" style={{ background: '#03070B' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label={`${M.label} over serial visits`}>
          {[0, 0.25, 0.5, 0.75, 1].map(f => { const val = M.min + f * (M.max - M.min); return (
            <g key={f}><line x1={x0} x2={x1} y1={Y(val)} y2={Y(val)} stroke="#13212D" /><text x={8} y={Y(val) + 4} fontSize="15" fill="#6A7F9B" fontFamily={MONO}>{Math.round(val)}</text></g>
          ); })}
          {M.i != null && <g><line x1={x0} x2={x1} y1={Y(M.i)} y2={Y(M.i)} stroke="#FF4D6D" strokeDasharray="6 4" strokeWidth="1.8" /><text x={x1 - 4} y={Y(M.i) - 6} textAnchor="end" fontSize="15" fill="#FF4D6D" fontFamily={MONO}>Class I: {M.iDir} {M.i}</text></g>}
          {M.iib != null && <g><line x1={x0} x2={x1} y1={Y(M.iib)} y2={Y(M.iib)} stroke="#F5C451" strokeDasharray="3 4" strokeWidth="1.5" /><text x={x0 + 4} y={Y(M.iib) - 6} fontSize="15" fill="#F5C451" fontFamily={MONO}>IIb, low risk: {M.iDir} {M.iib}</text></g>}
          <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="#22D3EE" strokeWidth="2.4" />
          {pts.map((p, i) => (
            <g key={i} onClick={() => setSel(i)} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label={visits[i].when}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSel(i)}>
              <circle cx={p[0]} cy={p[1]} r={i === sel ? 11 : 8} fill={i === sel ? '#22D3EE' : '#0F1C30'} stroke="#CFFFF8" strokeWidth="2" />
              <text x={p[0]} y={H - 14} textAnchor="middle" fontSize="15" fill="#C9D6E6" fontFamily={MONO}>{visits[i].when}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="cs-readout">
        <div><span>Visit</span><b style={{ fontSize: 15 }}>{v.when}</b></div>
        <div><span>LVESD</span><b>{v.lvesd} mm</b></div>
        <div><span>LVESDi</span><b>{v.lvesdi}</b></div>
        <div><span>LVESVi</span><b>{v.lvesvi}</b></div>
        <div><span>LVEF</span><b>{v.ef}%</b></div>
      </div>
      {v.note && <p className="cs-pts" style={{ marginTop: 8 }}>🗒️ {v.note}</p>}
      <p className="cs-pts">Tap a visit. Red = ESC/EACTS 2025 class I trigger; amber = class IIb trigger for patients at low surgical risk.</p>
    </div>
  );
}

/* ---------- the aorta, measured ---------- */

/** diameter profile along the centreline: mm from the annulus → inner-to-inner diameter (mm) */
function aoDiam(d) {
  const pts = [[0, 27], [8, 37], [15, 43], [22, 42], [28, 38], [38, 45], [52, 51], [62, 50], [80, 44], [100, 37]];
  for (let i = 1; i < pts.length; i++) if (d <= pts[i][0]) { const [a, da] = pts[i - 1], [b, db] = pts[i]; const k = (d - a) / (b - a); return da + (db - da) * (0.5 - 0.5 * Math.cos(k * Math.PI)); }
  return 37;
}
const LEVEL = d => d < 4 ? 'annulus' : d < 22 ? 'sinuses of Valsalva' : d < 32 ? 'sinotubular junction' : d < 90 ? 'tubular ascending aorta' : 'proximal arch';

/** centreline in mm: straight up from the annulus, then curving right into the arch */
const CL = (() => {
  const pts = [[0, 0]]; let x = 0, y = 0;
  for (let d = 1; d <= 100; d++) { const th = Math.max(0, d - 30) / 70 * 1.25; x += Math.sin(th); y -= Math.cos(th); pts.push([x, y]); }
  return pts;
})();
const clTan = d => { const i = Math.round(Math.max(0, Math.min(100, d))); const a = CL[Math.max(0, i - 1)], b = CL[Math.min(100, i + 1)]; const n = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / n, (b[1] - a[1]) / n]; };

export function AortaRuler({ onMeasure, done }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(15);
  const [plane, setPlane] = useState('perp');
  const S = useRef({}); S.current = { pos, plane };
  useCanvas(ref, 330, (g, w, h) => {
    const { pos: p, plane: pl } = S.current;
    g.fillStyle = '#0B0D10'; g.fillRect(0, 0, w, h);
    const sc = Math.min(w / 130, 2.45);                // px per mm
    const ox = w * 0.36, oy = h - 52;
    const P = d => { const q = CL[Math.round(Math.max(0, Math.min(100, d)))]; return [ox + q[0] * sc, oy + q[1] * sc]; };
    // LV below the annulus
    g.fillStyle = 'rgba(160,160,160,0.22)'; g.beginPath(); g.ellipse(ox - 12 * sc, oy + 8 * sc, 30 * sc, 12 * sc, -0.25, 0, Math.PI * 2); g.fill();
    // contrast-filled lumen
    const L = [], R = [];
    for (let d = 0; d <= 100; d++) {
      const [x, y] = P(d), [tx, ty] = clTan(d), r = aoDiam(d) / 2 * sc;
      L.push([x + ty * r, y - tx * r]); R.push([x - ty * r, y + tx * r]);
    }
    g.fillStyle = 'rgba(225,225,225,0.85)'; g.beginPath(); L.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); [...R].reverse().forEach(q => g.lineTo(q[0], q[1])); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(150,150,150,0.6)'; g.lineWidth = 3; g.stroke();
    // centreline
    g.strokeStyle = 'rgba(34,211,238,0.7)'; g.setLineDash([4, 5]); g.lineWidth = 1.2; g.beginPath();
    for (let d = 0; d <= 100; d += 2) { const [x, y] = P(d); d ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.setLineDash([]);
    // the measurement plane
    const [x, y] = P(p), [tx, ty] = clTan(p);
    let nx = ty, ny = -tx, r = aoDiam(p) / 2 * sc;
    if (pl === 'axial') { nx = 1; ny = 0; r = r / Math.max(0.5, Math.abs(ty)); }
    g.strokeStyle = '#F5C451'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x - nx * r, y - ny * r); g.lineTo(x + nx * r, y + ny * r); g.stroke();
    g.fillStyle = '#F5C451';
    for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * nx * r, y + s * ny * r, 3.5, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText(pl === 'perp' ? 'CT ANGIO · DOUBLE-OBLIQUE ⟂ CENTRELINE' : 'CT ANGIO · PLAIN AXIAL SLICE', 10, 16);
    g.fillText('LV', ox - 22 * sc, oy + 9 * sc);
  }, []);
  const factor = plane === 'axial' ? 1 / Math.max(0.5, Math.abs(clTan(pos)[1])) : 1;
  const read = Math.round(aoDiam(pos) * factor);
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 330 }} aria-label="CT angiogram of the aortic root and ascending aorta" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Annulus
          <input type="range" min="0" max="100" step="1" value={pos} disabled={!!done} onChange={e => setPos(+e.target.value)} style={{ width: '100%' }} aria-label="Position along the aorta" />
        Arch</label>
      </div>
      <div className="cs-ctrls">
        <button className={'cs-chip' + (plane === 'perp' ? ' on' : '')} disabled={!!done} onClick={() => setPlane('perp')}>⟂ Perpendicular to the centreline</button>
        <button className={'cs-chip' + (plane === 'axial' ? ' on' : '')} disabled={!!done} onClick={() => setPlane('axial')}>▭ Plain axial slice</button>
      </div>
      <div className="cs-ctrls">
        <button className="cs-btn primary" disabled={!!done} onClick={() => onMeasure?.({ pos, plane, read, level: LEVEL(pos), max: plane === 'perp' && pos >= 46 && pos <= 64 })}>📏 Record maximum diameter</button>
      </div>
      <div className="cs-readout">
        <div><span>Level</span><b style={{ fontSize: 14 }}>{LEVEL(pos)}</b></div>
        <div><span>Diameter</span><b style={{ color: read >= 55 ? 'var(--red)' : read >= 50 ? 'var(--amber)' : undefined }}>{read} mm</b></div>
        <div><span>From annulus</span><b>{pos} mm</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Sweep from the annulus to the arch. Find the widest point and measure it in a plane perpendicular to the flow — an axial slice cuts a curving tube obliquely and makes it look wider than it is.</p>
    </div>
  );
}

/* ---------- simultaneous LV and aortic pressures ---------- */

const PRESS = {
  chronic: { ao: [164, 46], lv: [166, 18], hr: 70, note: 'Wide aortic pulse pressure; LV diastolic pressure rises through diastole but stays well below the aortic.' },
  acute: { ao: [98, 54], lv: [100, 50], hr: 112, note: 'Aortic diastolic and LV end-diastolic pressures almost MEET — diastasis. The LV pressure overtakes the LA before systole: the mitral valve closes early.' },
};

export function AoLVPressure({ mode = 'chronic', onMeasure, done }) {
  const ref = useRef(null);
  const P = PRESS[mode];
  const [lvedp, setLvedp] = useState(30);
  const [aod, setAod] = useState(70);
  const S = useRef({}); S.current = { lvedp, aod, P };
  useCanvas(ref, 240, (g, w, h, t) => {
    const { lvedp: le, aod: ad, P: Q } = S.current;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const Y = p => h - 22 - p / 200 * (h - 36);
    g.strokeStyle = '#13212D'; g.font = `10px ${MONO}`;
    for (const p of [0, 50, 100, 150, 200]) { g.beginPath(); g.moveTo(34, Y(p)); g.lineTo(w, Y(p)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(p, 4, Y(p) + 3); }
    const [aS, aD] = Q.ao, [lS, lD] = Q.lv;
    const acute = mode === 'acute';
    const sysF = acute ? 0.42 : 0.36;
    const lv = x => {
      if (x < 0.06) return lD + (x / 0.06) * 4;
      if (x < 0.13) return lD + 4 + (lS - lD - 4) * Math.sin((x - 0.06) / 0.07 * Math.PI / 2);
      if (x < sysF) return lS - (lS * 0.1) * (x - 0.13) / (sysF - 0.13);
      if (x < sysF + 0.08) return lS * 0.9 * (1 - (x - sysF) / 0.08) + 4;
      const k = (x - sysF - 0.08) / (1 - sysF - 0.08);
      return acute ? 6 + (lD - 6) * Math.min(1, Math.pow(k, 0.45) * 1.02) : 6 + (lD - 6) * Math.pow(k, 1.4);
    };
    const ao = x => {
      if (x < 0.1) return aD + (x / 0.1) * 2 - (acute ? 0 : 0);
      if (x < 0.2) return aD + 2 + (aS - aD - 2) * Math.sin((x - 0.1) / 0.1 * Math.PI / 2);
      if (x < sysF) return aS - (aS - aD) * 0.28 * (x - 0.2) / (sysF - 0.2);
      const k = (x - sysF) / (1 - sysF);
      const top = aS - (aS - aD) * 0.28;
      return aD + (top - aD) * Math.exp(-k * (acute ? 3.2 : 2.2)) * (1 - k * 0.2);
    };
    const per = 60 / Q.hr;
    const draw = (fn, color) => {
      g.strokeStyle = color; g.lineWidth = 2; g.beginPath();
      for (let px = 34; px < w; px += 1.5) { const sec = t - (w - px) / 150; const x = ((sec / per) % 1 + 1) % 1; const y = Y(fn(x)); px === 34 ? g.moveTo(px, y) : g.lineTo(px, y); }
      g.stroke();
    };
    // the diastolic gap that drives the leak
    g.fillStyle = 'rgba(34,211,238,0.12)';
    for (let px = 34; px < w; px += 1.5) { const sec = t - (w - px) / 150; const x = ((sec / per) % 1 + 1) % 1; if (x > sysF + 0.05) { const a = ao(x), b = lv(x); if (a > b) g.fillRect(px, Y(a), 1.5, Y(b) - Y(a)); } }
    draw(ao, '#FF5A52'); draw(lv, '#F2D24B');
    for (const [v, col, lab] of [[le, '#F2D24B', 'LVEDP'], [ad, '#FF5A52', 'Ao dia']]) {
      g.strokeStyle = col; g.setLineDash([5, 4]); g.lineWidth = 1.2; g.beginPath(); g.moveTo(34, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.setLineDash([]);
      g.fillStyle = col; g.font = `700 11px ${MONO}`; g.fillText(`${lab} ${v}`, lab === 'LVEDP' ? 40 : 130, Y(v) - 4);
    }
    g.fillStyle = '#F2D24B'; g.font = `700 12px ${MONO}`; g.fillText('LV', w - 120, 16);
    g.fillStyle = '#FF5A52'; g.fillText('AORTA', w - 80, 16);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText(acute ? 'ACUTE AR · WHAT HIS LV IS DOING (MODEL)' : 'CHRONIC AR · CATHETER IN LV + RADIAL SHEATH', 40, 16);
  }, [mode]);
  const close = Math.abs(lvedp - P.lv[1]) <= 3 && Math.abs(aod - P.ao[1]) <= 3;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 240 }} aria-label="Simultaneous LV and aortic pressures" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>LVEDP
          <input type="range" min="0" max="90" step="1" value={lvedp} disabled={!!done} onChange={e => setLvedp(+e.target.value)} style={{ width: '100%' }} aria-label="LV end-diastolic pressure caliper" />{lvedp}</label>
        <label className="cs-slider" style={{ flex: 1 }}>Aortic diastolic
          <input type="range" min="20" max="100" step="1" value={aod} disabled={!!done} onChange={e => setAod(+e.target.value)} style={{ width: '100%' }} aria-label="Aortic diastolic pressure caliper" />{aod}</label>
      </div>
      <div className="cs-ctrls">
        <button className="cs-btn primary" disabled={!!done} onClick={() => onMeasure?.({ lvedp, aod, gap: aod - lvedp, close })}>📏 Record pressures</button>
      </div>
      <div className="cs-readout">
        <div><span>Diastolic gap (Ao − LVEDP)</span><b style={{ color: aod - lvedp < 15 ? 'var(--red)' : undefined }}>{aod - lvedp} mmHg</b></div>
        <div><span>Coronary perfusion pressure</span><b style={{ fontSize: 15 }}>{aod - lvedp < 15 ? '⚠ critically low' : aod - lvedp < 30 ? 'reduced' : 'adequate'}</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Set each caliper at end-diastole (just before the LV upstroke): the yellow at the LV trace, the red at the lowest aortic pressure. {P.note}</p>
    </div>
  );
}

/* ---------- a Judkins left in a dilated root ---------- */

const CURVES = [3.5, 4, 5, 6];

export function CoronaryEngage({ rootMm = 46, onResult, done }) {
  const ref = useRef(null);
  const [curve, setCurve] = useState(4);
  const [adv, setAdv] = useState(0);
  const [shots, setShots] = useState(0);
  const [inj, setInj] = useState(0);         // time of last injection
  const ideal = rootMm >= 44 ? 5 : 4;
  // where the tip sits: the right curve lands on the ostium; too short and it points up into the sinus wall, too long and it folds
  const tipOff = (ideal - curve) * 7;        // mm above(+)/below(−) the ostium when fully seated
  const engaged = Math.abs(tipOff) < 4 && adv >= 55 && adv <= 82;
  const deep = adv > 82 && Math.abs(tipOff) < 4;
  const S = useRef({}); S.current = { curve, adv, tipOff, engaged, deep, inj };
  useCanvas(ref, 300, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#9C9C99'; g.fillRect(0, 0, w, h);
    const grd = g.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, w * 0.7); grd.addColorStop(0, 'rgba(255,255,255,0.2)'); grd.addColorStop(1, 'rgba(0,0,0,0.5)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const mm = h / 90, cx = w * 0.46, base = h * 0.82;
    const R = rootMm / 2 * mm;
    // faint silhouette of the dilated root and ascending aorta
    g.strokeStyle = 'rgba(50,50,50,0.4)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx - R * 0.6, base); g.quadraticCurveTo(cx - R * 1.15, base - 22 * mm, cx - R * 0.95, base - 45 * mm); g.lineTo(cx - R * 1.05, base - 75 * mm); g.stroke();
    g.beginPath(); g.moveTo(cx + R * 0.6, base); g.quadraticCurveTo(cx + R * 1.15, base - 22 * mm, cx + R * 0.95, base - 45 * mm); g.lineTo(cx + R * 1.05, base - 75 * mm); g.stroke();
    // left main ostium on the left wall of the left sinus
    const ox = cx - R * 1.08, oy = base - 18 * mm;
    g.fillStyle = 'rgba(30,30,30,0.6)'; g.beginPath(); g.ellipse(ox, oy, 1.6 * mm, 2.4 * mm, 0, 0, Math.PI * 2); g.fill();
    // catheter: down the right side of the ascending aorta, then the primary curve toward the left wall
    const k = Math.min(1, st.adv / 60);
    const tipY = oy - st.tipOff * mm * k - (1 - k) * 30 * mm;
    const tipX = ox + (1 - k) * R * 0.9 + (st.deep ? -2 * mm : 0);
    const elbowX = cx + R * 0.15 + (st.curve - 4) * 2.5 * mm, elbowY = tipY + 6 * mm + st.curve * 2.2 * mm;
    g.strokeStyle = 'rgba(15,15,15,0.95)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(cx + R * 0.7, 0); g.quadraticCurveTo(cx + R * 0.85, elbowY - 25 * mm, elbowX, elbowY);
    g.quadraticCurveTo(tipX + 4 * mm, elbowY + 2 * mm, tipX, tipY); g.stroke();
    // contrast puff
    const age = (performance.now() - st.inj) / 1000;
    if (age < 1.6) {
      const a = Math.max(0, 1 - age / 1.6);
      if (st.engaged || st.deep) {
        g.strokeStyle = `rgba(20,20,20,${0.85 * a})`; g.lineWidth = 4;
        g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox - 10 * mm, oy - 6 * mm); g.quadraticCurveTo(ox - 22 * mm, oy - 4 * mm, ox - 30 * mm, oy + 20 * mm); g.stroke();   // LAD
        g.beginPath(); g.moveTo(ox - 10 * mm, oy - 6 * mm); g.quadraticCurveTo(ox - 16 * mm, oy + 4 * mm, ox - 14 * mm, oy + 22 * mm); g.stroke();                        // Cx
      } else {
        g.fillStyle = `rgba(20,20,20,${0.45 * a})`; g.beginPath(); g.ellipse(tipX, tipY, (6 + age * 10) * mm, (5 + age * 8) * mm, 0, 0, Math.PI * 2); g.fill();
      }
    }
    // pressure from the tip
    const pw = 180, ph = 54, px0 = w - pw - 10, py0 = 10;
    g.fillStyle = 'rgba(4,18,26,0.9)'; g.fillRect(px0, py0, pw, ph);
    g.strokeStyle = st.deep ? '#FF4D6D' : '#3ED0F5'; g.lineWidth = 1.6; g.beginPath();
    for (let i = 0; i < pw; i++) {
      const x = ((t - (pw - i) / 90) / 0.86 % 1 + 1) % 1;
      let v = pulseShape('collapsing', x);
      if (st.deep) v = 0.45 + 0.35 * Math.sin(x * Math.PI * 2) * (x < 0.4 ? 1 : 0.3) - (x > 0.4 ? 0.3 : 0);   // damped / ventricularised
      const y = py0 + ph - 6 - (v * 0.8 + 0.1) * (ph - 12);
      i ? g.lineTo(px0 + i, y) : g.moveTo(px0 + i, y);
    }
    g.stroke();
    g.fillStyle = st.deep ? '#FF4D6D' : '#9FB4C6'; g.font = `700 10px ${MONO}`; g.fillText(st.deep ? 'DAMPED — PULL BACK' : 'TIP PRESSURE', px0 + 4, py0 + 12);
    g.fillStyle = '#04121A'; g.fillRect(8, 8, 150, 26); g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`; g.fillText(`JL ${st.curve} · LAO 40°`, 14, 26);
  }, []);
  const shoot = () => { setShots(s => s + 1); setInj(performance.now()); };
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 300 }} aria-label="Fluoroscopy: engaging the left main" /></div>
      <div className="cs-ctrls">
        <span className="cs-pts">Judkins left curve:</span>
        {CURVES.map(c => <button key={c} className={'cs-chip' + (curve === c ? ' on' : '')} disabled={!!done} onClick={() => { setCurve(c); setAdv(0); }}>JL {c}</button>)}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Withdrawn
          <input type="range" min="0" max="100" step="1" value={adv} disabled={!!done} onChange={e => setAdv(+e.target.value)} style={{ width: '100%' }} aria-label="Advance the catheter" />
        Advanced</label>
      </div>
      <div className="cs-ctrls">
        <button className="cs-btn" disabled={!!done} onClick={shoot}>💉 Test puff (4 mL)</button>
        <button className="cs-btn primary" disabled={!!done || !(engaged || deep)} onClick={() => onResult?.({ curve, shots, deep, engaged, ideal })}>🎥 Record the left coronary run</button>
      </div>
      <div className="cs-readout">
        <div><span>Tip</span><b style={{ fontSize: 14 }}>{deep ? 'deep — damped' : engaged ? 'coaxial in the left main' : adv < 55 ? 'in the root' : tipOff > 0 ? 'curve too short — tip points up, misses' : 'curve too big — folds below the ostium'}</b></div>
        <div><span>Test puffs</span><b>{shots}</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Pick a curve, advance slowly, puff to see where you are. Watch the tip pressure: a dampened or ventricularised trace means you are wedged — pull back before you inject.</p>
    </div>
  );
}

/* ---------- impulse control in type A dissection with acute severe AR ---------- */

export function impulseModel({ esm, ntp, meto, opioid }) {
  const hr = Math.max(42, 114 - 0.12 * esm - 16 * meto - (opioid ? 8 : 0));
  const td = 60 / hr - 0.3;                                    // diastolic time, s
  const lvedp = 22 + 40 * Math.pow(Math.max(0, td - 0.226), 1.3);
  const sv = Math.max(25, 62 - 0.85 * (lvedp - 22));           // forward stroke volume, mL
  const co = hr * sv / 1000;
  const sys = Math.round(176 - (opioid ? 14 : 0) - 0.07 * esm - 9 * meto - 17 * ntp - Math.max(0, 6.9 - co) * 14);
  const dia = Math.round(Math.max(28, 62 - 3 * ntp - 0.02 * esm - Math.max(0, lvedp - 30) * 0.3));
  const spo2 = Math.round(Math.max(78, 95 - Math.max(0, lvedp - 26) * 0.9));
  const dpdt = Math.round(sys * hr / 100);
  return { hr: Math.round(hr), sys, dia, lvedp: Math.round(lvedp), co: +co.toFixed(1), spo2, dpdt };
}

export function ImpulseControl({ onResult, done }) {
  const [esm, setEsm] = useState(0);
  const [ntp, setNtp] = useState(0);
  const [meto, setMeto] = useState(0);
  const [opioid, setOpioid] = useState(false);
  const m = impulseModel({ esm, ntp, meto, opioid });
  const inBox = m.sys >= 100 && m.sys <= 125 && m.hr >= 65 && m.hr <= 90;
  const danger = m.hr < 60 || m.co < 3.2 || m.sys < 90;
  const tone = (bad, warn) => bad ? 'var(--red)' : warn ? 'var(--amber)' : 'var(--green)';
  return (
    <div className="cs-card tight">
      <div className="cs-grid2">
        <div>
          <div className="cs-ctrls" style={{ marginTop: 0 }}>
            <button className={'cs-chip' + (opioid ? ' on' : '')} disabled={!!done || opioid} onClick={() => setOpioid(true)}>💉 IV morphine 2.5 mg titrated</button>
          </div>
          <div className="cs-ctrls">
            <label className="cs-slider" style={{ flex: 1 }}>Esmolol
              <input type="range" min="0" max="300" step="10" value={esm} disabled={!!done} onChange={e => setEsm(+e.target.value)} style={{ width: '100%' }} aria-label="Esmolol infusion" />
            {esm} µg/kg/min</label>
          </div>
          <div className="cs-ctrls">
            <label className="cs-slider" style={{ flex: 1 }}>Nitroprusside
              <input type="range" min="0" max="3" step="0.1" value={ntp} disabled={!!done} onChange={e => setNtp(+e.target.value)} style={{ width: '100%' }} aria-label="Nitroprusside infusion" />
            {ntp.toFixed(1)} µg/kg/min</label>
          </div>
          <div className="cs-ctrls">
            <button className="cs-btn danger" disabled={!!done || meto >= 3} onClick={() => setMeto(n => n + 1)}>Metoprolol 5 mg IV bolus{meto ? ` (×${meto} — cannot be switched off)` : ''}</button>
          </div>
          <p className="cs-pts">Esmolol: half-life ~9 minutes — turn it down and it is gone. Metoprolol: hours.</p>
        </div>
        <div className="cs-readout" style={{ marginTop: 0, alignContent: 'start' }}>
          <div><span>Heart rate</span><b style={{ color: tone(m.hr < 60, m.hr > 90) }}>{m.hr}</b></div>
          <div><span>Blood pressure</span><b style={{ color: tone(m.sys < 90, m.sys > 125) }}>{m.sys}/{m.dia}</b></div>
          <div><span>LVEDP (TOE est.)</span><b style={{ color: tone(m.lvedp > 34, m.lvedp > 28) }}>{m.lvedp}</b></div>
          <div><span>Forward output</span><b style={{ color: tone(m.co < 3.2, m.co < 4) }}>{m.co} L/min</b></div>
          <div><span>SpO₂</span><b style={{ color: tone(m.spo2 < 88, m.spo2 < 92) }}>{m.spo2}%</b></div>
          <div><span>Shear (SBP×HR/100)</span><b style={{ color: tone(false, m.dpdt > 120) }}>{m.dpdt}</b></div>
        </div>
      </div>
      <div className={'cs-fb ' + (danger ? 'wrong' : inBox ? 'best' : 'ok')} style={{ marginTop: 10 }}>
        {danger ? '⚠ The leak is winning: with every beat slower, diastole lengthens, more blood pours back, the LV pressure climbs and forward flow collapses.'
          : inBox ? '✓ Shear down, rate held where the leak is tolerated. This is a bridge — the fix is in theatre.'
            : m.sys > 125 ? 'Pressure and shear still high: the false lumen is still being driven.' : 'Nearly there.'}
      </div>
      <div className="cs-ctrls">
        <button className="cs-btn primary" disabled={!!done} onClick={() => onResult?.({ ...m, esm, ntp, meto, opioid, inBox, danger })}>✅ Hold this and go to theatre</button>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Usual dissection target: systolic 100–120 mmHg and heart rate ≤ 60. With torrential acute AR, accept a higher rate (here ~70–90): slowing below that lengthens diastole and feeds the leak. Analgesia first, beta-blocker before vasodilator, short-acting drugs only.</p>
    </div>
  );
}
