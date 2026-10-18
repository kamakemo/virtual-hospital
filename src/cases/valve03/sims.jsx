import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../kit/Monitor.jsx';

/* ============================================================
   RADIATION HEART DISEASE SIMULATORS
   Built for Valvular & Structural Heart Unit case 03, in the
   kit's style (canvas via useCanvas, cs-* classes, the dark
   palette) so they can be promoted to the kit later.

   JVPViewer         JVP, breathing, arterial line and heart sounds:
                     Kussmaul, steep y, knock vs S3, pulsus paradoxus
   MitralInflowResp  PW mitral inflow with respiration (measure the
                     variation), tissue Doppler e′, hepatic veins
   LVRVCath          simultaneous LV + RV pressures with breathing:
                     concordance vs discordance, measure the EDPs
   CPRCMBoard        sort findings: constriction / restriction / both
   SternotomyPlanner the hostile irradiated chest, hazard by hazard
   Pericardiectomy   free the heart region by region, live pressures
   RVEcho            parasternal short axis: round vs D-shaped LV
   LowOutputResus    post-pericardiectomy low output: act, watch
   ============================================================ */

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const RESP = 4.4;                                         // seconds per breath
const inspAt = s => Math.max(0, Math.sin(((s % RESP) + RESP) % RESP / RESP * Math.PI * 2));  // 0..1 in inspiration
const sweepPx = (t, span, x0, w) => px => t - span + (px - x0) / (w - x0 - 10) * span;

/* ---------- the neck, the pulse and the sounds ---------- */

const JVP_MODES = {
  constriction: {
    name: 'Her — constrictive pericarditis',
    mean: 13, kuss: 3, pp: 4, extra: 'knock',
    readout: { y: 'Steep, deep (Friedreich)', insp: 'RISES (Kussmaul)', extra: 'Pericardial knock', pp: '~4 mmHg' },
    notes: [
      'An M/W-shaped JVP: a sharp x-descent and an even sharper y-descent — the ventricle fills violently, then hits the shell',
      'The JVP RISES on inspiration (Kussmaul): the extra venous return has nowhere to go in a closed box',
      'A pericardial KNOCK — earlier and higher-pitched than an S3 — at the very bottom of the y-descent, the moment filling stops',
      'Little or no pulsus paradoxus: the rigid shell isolates the heart from the swings in chest pressure',
    ],
  },
  tamponade: {
    name: 'Compare — tamponade',
    mean: 15, kuss: -1, pp: 22, extra: null,
    readout: { y: 'ABSENT', insp: 'Falls (usually)', extra: 'None — quiet heart', pp: '~22 mmHg' },
    notes: [
      'The y-descent is GONE: the fluid already squeezes the heart all through diastole; there is no early free filling',
      'The JVP still falls on inspiration — the fluid transmits the chest pressure to the heart',
      'Pulsus paradoxus > 10 mmHg: inspiration fills the RV, the septum bows left, the LV stroke volume falls',
      'Same raised JVP, opposite physiology: a liquid squeeze versus a solid shell',
    ],
  },
  restriction: {
    name: 'Compare — restrictive cardiomyopathy',
    mean: 12, kuss: 1.5, pp: 3, extra: 's3',
    readout: { y: 'Steep', insp: 'May rise slightly', extra: 'S3 (low-pitched, later)', pp: '~3 mmHg' },
    notes: [
      'Also a steep y-descent and high venous pressure — the muscle itself is stiff',
      'Kussmaul can occur here too: it is a sign of a high, fixed right-sided pressure, not of the pericardium alone',
      'An S3, low-pitched, a little later than a knock',
      'The bedside cannot always separate them. The echo and the catheter can — stage 2',
    ],
  },
  normal: {
    name: 'Compare — normal',
    mean: 3, kuss: -1.5, pp: 4, extra: null,
    readout: { y: 'Gentle', insp: 'Falls', extra: 'None', pp: '~4 mmHg' },
    notes: ['a · c · x · v · y, 3 cm above the sternal angle', 'Falls on inspiration as the chest sucks blood into the right heart', 'No extra sounds'],
  },
};

function jvpWave(x, m) {
  if (m === 'tamponade') {
    if (x < 0.08) return 0.55 + 0.35 * Math.sin(x / 0.08 * Math.PI);
    if (x < 0.30) return 0.55 - 0.45 * Math.sin((x - 0.08) / 0.22 * Math.PI / 2);
    if (x < 0.42) return 0.10 + 0.6 * (x - 0.30) / 0.12;
    return 0.70 - 0.15 * (x - 0.42) / 0.58;                                      // no y-descent
  }
  if (m === 'normal') {
    if (x < 0.08) return 0.3 + 0.3 * Math.sin(x / 0.08 * Math.PI);
    if (x < 0.30) return 0.3 - 0.2 * Math.sin((x - 0.08) / 0.22 * Math.PI / 2);
    if (x < 0.42) return 0.1 + 0.3 * (x - 0.30) / 0.12;
    if (x < 0.55) return 0.4 - 0.25 * Math.sin((x - 0.42) / 0.13 * Math.PI / 2);
    return 0.15 + 0.15 * (x - 0.55) / 0.45;
  }
  const xd = m === 'restriction' ? 0.3 : 0.5;
  if (x < 0.08) return 0.6 + 0.35 * Math.sin(x / 0.08 * Math.PI);
  if (x < 0.30) return 0.6 - xd * Math.sin((x - 0.08) / 0.22 * Math.PI / 2);
  if (x < 0.42) return 0.6 - xd + (0.1 + xd) * (x - 0.30) / 0.12;
  if (x < 0.50) return 0.7 - 0.65 * Math.sin((x - 0.42) / 0.08 * Math.PI / 2);   // steep y
  if (x < 0.57) return 0.05 + 0.55 * Math.sin((x - 0.50) / 0.07 * Math.PI / 2);  // abrupt halt
  return 0.6;
}

export function JVPViewer({ initial = 'constriction' }) {
  const [key, setKey] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  const S = useRef({}); S.current = { key };
  const beat = 60 / 96;
  const M = JVP_MODES[key];

  useCanvas(ref, 330, (g, w, h, t) => {
    const m = JVP_MODES[S.current.key], mode = S.current.key;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const x0 = 48, span = w < 520 ? 3.6 : 6.5, at = sweepPx(t, span, x0, w), lx = Math.max(x0 + 40, w - 250);
    const rows = { resp: 30, jvp: 150, art: 236, pcg: 296 };
    g.font = `600 10px ${MONO}`; g.fillStyle = '#6A7F9B';
    g.fillText('BREATH', 2, 14); g.fillText('JVP', 2, 64); g.fillText('cm', 2, 76); g.fillText('ART', 2, rows.art - 34); g.fillText('PCG', 2, rows.pcg - 20);
    // respiration with inspiration shaded
    for (let px = x0; px < w - 10; px += 2) { if (inspAt(at(px)) > 0.05) { g.fillStyle = 'rgba(34,211,238,0.05)'; g.fillRect(px, 0, 2, h); } }
    g.strokeStyle = '#22D3EE'; g.lineWidth = 1.5; g.beginPath();
    for (let px = x0; px < w - 10; px++) { const y = rows.resp - Math.sin(((at(px) % RESP) + RESP) % RESP / RESP * Math.PI * 2) * 12; px === x0 ? g.moveTo(px, y) : g.lineTo(px, y); }
    g.stroke();
    // JVP scale: cm above the sternal angle
    const Yj = cm => rows.jvp + 10 - cm * 5.2;
    g.strokeStyle = '#13212D'; g.fillStyle = '#3B4B5A';
    for (const cm of [0, 5, 10, 15, 20]) { g.beginPath(); g.moveTo(x0, Yj(cm)); g.lineTo(w, Yj(cm)); g.stroke(); g.fillText(cm, 30, Yj(cm) + 3); }
    g.fillStyle = '#6A7F9B'; g.fillText('sternal angle', x0 + 4, Yj(0) - 3);
    g.strokeStyle = '#A78BFA'; g.lineWidth = 2; g.beginPath();
    for (let px = x0; px < w - 10; px++) {
      const s = at(px), x = ((s % beat) + beat) % beat / beat;
      const cm = m.mean + m.kuss * inspAt(s) + (jvpWave(x, mode) - 0.4) * (mode === 'normal' ? 4 : 7);
      px === x0 ? g.moveTo(px, Yj(cm)) : g.lineTo(px, Yj(cm));
    }
    g.stroke();
    // arterial line
    const Ya = mm => rows.art + 22 - (mm - 50) * 0.55;
    g.strokeStyle = '#FF5A52'; g.lineWidth = 1.8; g.beginPath();
    for (let px = x0; px < w - 10; px++) {
      const s = at(px), x = ((s % beat) + beat) % beat / beat;
      const sys = 106 - m.pp * inspAt(s), dia = 74 - m.pp * 0.3 * inspAt(s);
      const sh = x < 0.12 ? Math.sin(x / 0.12 * Math.PI / 2) : x < 0.3 ? 1 - (x - 0.12) * 1.3 : x < 0.33 ? 0.74 + (x - 0.3) * 1.6 : Math.max(0, 0.79 - (x - 0.33) * 1.2);
      const v = dia + (sys - dia) * sh;
      px === x0 ? g.moveTo(px, Ya(v)) : g.lineTo(px, Ya(v));
    }
    g.stroke();
    // phonocardiogram: S1, S2 and the extra sound
    for (let px = x0; px < w - 10; px++) {
      const s = at(px), x = ((s % beat) + beat) % beat / beat;
      let a = 0, col = '#E9F2FC';
      if (x < 0.04) a = 0.9;
      else if (x > 0.38 && x < 0.41) a = 0.7;
      else if (m.extra === 'knock' && x > 0.495 && x < 0.52) { a = 0.85; col = '#F5C451'; }
      else if (m.extra === 's3' && x > 0.56 && x < 0.6) { a = 0.45; col = '#34E39A'; }
      if (a) { const amp = a * 18 * (0.6 + Math.random() * 0.4); g.fillStyle = col; g.fillRect(px, rows.pcg - amp, 1, amp * 2); }
    }
    g.font = `700 11px ${MONO}`;
    g.fillStyle = '#A78BFA'; g.fillText(m.kuss > 0 ? 'JVP ↑ on inspiration — Kussmaul' : 'JVP ↓ on inspiration', lx, 60);
    g.fillStyle = '#FF8A80'; g.fillText(m.pp > 10 ? `pulsus paradoxus ${m.pp} mmHg` : 'no pulsus paradoxus', lx, rows.art - 34);
    if (m.extra) { g.fillStyle = m.extra === 'knock' ? '#F5C451' : '#34E39A'; g.fillText(m.extra === 'knock' ? 'KNOCK — ~0.1 s after S2' : 'S3 — ~0.15 s after S2', lx, rows.pcg - 20); }
  }, []);

  // synthesised sounds: S1, S2 and a knock (sharp, higher) or an S3 (dull, low)
  useEffect(() => {
    if (!playing) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const thump = (at, f, v, dur = 0.09) => {
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.frequency.value = f; gn.gain.setValueAtTime(0, at); gn.gain.linearRampToValueAtTime(v, at + 0.008); gn.gain.exponentialRampToValueAtTime(0.001, at + dur);
      o.connect(gn).connect(ctx.destination); o.start(at); o.stop(at + dur + 0.02);
    };
    let next = ctx.currentTime + 0.1;
    const tick = () => {
      while (next < ctx.currentTime + 0.5) {
        const ex = JVP_MODES[S.current.key].extra;
        thump(next, 55, 0.5);
        thump(next + beat * 0.39, 80, 0.35);
        if (ex === 'knock') thump(next + beat * 0.39 + 0.1, 140, 0.45, 0.05);
        if (ex === 's3') thump(next + beat * 0.39 + 0.15, 38, 0.3, 0.12);
        next += beat;
      }
    };
    tick();
    const id = setInterval(tick, 150);
    return () => { clearInterval(id); ctx.close(); };
  }, [playing]); // eslint-disable-line

  return (
    <div className="cs-card tight">
      <div className="cs-ctrls" style={{ marginTop: 0, marginBottom: 10 }}>
        {Object.entries(JVP_MODES).map(([k, m]) => <button key={k} className={'cs-chip' + (key === k ? ' on' : '')} onClick={() => setKey(k)} data-jvp={k}>{m.name}</button>)}
        <button className="cs-btn" onClick={() => setPlaying(p => !p)} style={{ marginLeft: 'auto' }}>{playing ? '■ Stop' : '🔊 Listen'}</button>
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 330 }} aria-label="Breathing, jugular venous pulse, arterial pressure and phonocardiogram" /></div>
      <div className="cs-readout">
        <div><span>JVP (expiration)</span><b>{M.mean} cm</b></div>
        <div><span>On inspiration</span><b style={{ fontSize: 15 }}>{M.readout.insp}</b></div>
        <div><span>y-descent</span><b style={{ fontSize: 15 }}>{M.readout.y}</b></div>
        <div><span>Extra sound</span><b style={{ fontSize: 15 }}>{M.readout.extra}</b></div>
        <div><span>Pulsus paradoxus</span><b style={{ fontSize: 15 }}>{M.readout.pp}</b></div>
      </div>
      <ul className="cs-ul" style={{ marginBottom: 0, marginTop: 8 }}>{M.notes.map(n => <li key={n} className="cs-li">{n}</li>)}</ul>
      <p className="cs-pts">Shaded bands = inspiration. Sounds are synthesised to teach timing and pitch, not recorded from a patient. Use headphones.</p>
    </div>
  );
}

/* ---------- echo: mitral inflow with breathing, tissue Doppler, hepatic veins ---------- */

const E_EXP = 1.04, E_INSP = 0.70;             // m/s — her mitral E in expiration and inspiration
export const MITRAL_TRUE = Math.round((E_EXP - E_INSP) / E_EXP * 100);   // ≈ 33%
const BEATS = 8;
// where each beat falls in the breath (beat 2 and 6 at peak inspiration, 4 and 8 at peak expiration)
const beatInsp = b => Math.max(0, Math.sin((b - 1) / 4 * Math.PI * 2 + 0.0001));
const beatE = b => +(E_EXP - (E_EXP - E_INSP) * beatInsp(b)).toFixed(2);

export function MitralInflowResp({ onMeasure, done }) {
  const ref = useRef(null);
  const [view, setView] = useState('mv');
  const [beat, setBeat] = useState(1);
  const [cal, setCal] = useState(0.5);
  const [marks, setMarks] = useState(done?.marks || {});
  const S = useRef({}); S.current = { view, beat, cal };

  useCanvas(ref, 280, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    g.font = `600 11px ${MONO}`; g.fillStyle = '#9FB4C6';
    if (st.view === 'mv') {
      const base = h - 30, Y = v => base - v / 1.4 * (base - 50);
      g.strokeStyle = '#2B3B4E'; g.fillStyle = '#6A7F9B'; g.font = `10px ${MONO}`;
      for (let v = 0; v <= 1.4; v += 0.2) { g.beginPath(); g.moveTo(40, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.fillText(v.toFixed(1), 6, Y(v) + 3); }
      g.fillText('m/s', 6, 44);
      const bw = (w - 60) / BEATS;
      // respirometer along the top
      g.strokeStyle = '#22D3EE'; g.lineWidth = 1.5; g.beginPath();
      for (let px = 50; px < w - 10; px++) { const b = (px - 50) / bw + 1; const y = 24 - Math.sin((b - 1) / 4 * Math.PI * 2) * 10; px === 50 ? g.moveTo(px, y) : g.lineTo(px, y); }
      g.stroke();
      g.fillStyle = '#22D3EE'; g.font = `600 10px ${MONO}`; g.fillText('INSP ▲', 50 + bw * 0.8, 10); g.fillText('INSP ▲', 50 + bw * 4.8, 10);
      for (let b = 1; b <= BEATS; b++) {
        const x0 = 50 + (b - 1) * bw + bw * 0.12, E = beatE(b), A = 0.36;
        const eW = bw * 0.34, aW = bw * 0.2, aX = x0 + bw * 0.52;
        const sel = b === st.beat;
        const env = (k, pk) => (k < 0.32 ? Math.sin(k / 0.32 * Math.PI / 2) : Math.cos((k - 0.32) / 0.68 * Math.PI / 2)) * pk;  // fast up, short deceleration
        for (const [xs, ww, pk] of [[x0, eW, E], [aX, aW, A]]) {
          for (let px = 0; px < ww; px += 1.5) {
            const v = env(px / ww, pk);
            for (let k = 0; k < 6; k++) { const vv = v * (0.55 + Math.random() * 0.45); g.fillStyle = `rgba(230,230,230,${0.3 + Math.random() * 0.5})`; g.fillRect(xs + px, Y(vv), 1.5, 2); }
            g.fillStyle = sel ? 'rgba(245,196,81,0.95)' : 'rgba(245,245,245,0.95)'; g.fillRect(xs + px, Y(v) - 1, 1.5, 2);
          }
        }
        g.fillStyle = sel ? '#F5C451' : '#6A7F9B'; g.font = `700 11px ${MONO}`; g.fillText(String(b), x0 + eW * 0.3, base + 16);
      }
      // caliper over the selected beat
      const bx = 50 + (st.beat - 1) * bw, y = Y(st.cal);
      g.strokeStyle = '#F5C451'; g.setLineDash([5, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(bx, y); g.lineTo(bx + bw, y); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`; g.fillText(`${st.cal.toFixed(2)} m/s`, Math.min(w - 90, bx + 4), y - 6);
      g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText(w < 520 ? 'PW · MITRAL INFLOW · A4C' : 'PW · MITRAL INFLOW · APICAL 4C · sweep 25 mm/s', Math.max(50, w - (w < 520 ? 190 : 330)), h - 6);
    } else if (st.view === 'tdi') {
      // septal and lateral annular velocities, side by side
      const panels = [{ name: 'SEPTAL (medial) annulus', e: 12, a: 6, s: 7 }, { name: 'LATERAL annulus', e: 8, a: 6, s: 8 }];
      const pw = w / 2;
      panels.forEach((p, i) => {
        const ox = i * pw, base = h * 0.42, Y = v => base + v * 6.4;
        g.strokeStyle = '#2B3B4E'; g.beginPath(); g.moveTo(ox + 30, base); g.lineTo(ox + pw - 10, base); g.stroke();
        g.fillStyle = '#9FB4C6'; g.font = `700 11px ${MONO}`; g.fillText(p.name, ox + 30, 18);
        for (let b = 0; b < 2; b++) {
          const x0 = ox + 40 + b * (pw - 60) / 2, bw = (pw - 60) / 2;
          const wave = (xs, ww, pk) => {
            g.fillStyle = 'rgba(255,170,90,0.9)';
            for (let px = 0; px < ww; px += 1.5) { const v = Math.sin(px / ww * Math.PI) * pk; g.fillRect(x0 + xs + px, Math.min(Y(v), base), 1.5, Math.abs(Y(v) - base)); }
          };
          wave(0, bw * 0.26, -p.s);                    // s′ (systolic, up toward transducer)
          wave(bw * 0.42, bw * 0.18, p.e);             // e′ (down)
          wave(bw * 0.72, bw * 0.14, p.a);             // a′
          g.fillStyle = '#F5C451'; g.font = `700 11px ${MONO}`;
          if (b === 0) { g.fillText(`e′ ${p.e} cm/s`, x0 + bw * 0.36, Y(p.e) + 16); g.fillStyle = '#6A7F9B'; g.fillText('s′', x0 + 6, Y(-p.s) - 6); g.fillText('a′', x0 + bw * 0.74, Y(p.a) + 14); }
        }
      });
      g.fillStyle = '#FF8A80'; g.font = `700 12px ${MONO}`;
      g.fillText(w < 520 ? 'septal 12 > lateral 8: REVERSUS' : 'septal e′ 12 > lateral e′ 8 → ANNULUS REVERSUS', 14, h - 40);
      g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
      g.fillText(w < 520 ? 'E/e′ ≈ 9, wedge 22: PARADOXUS' : 'E 1.04 m/s ÷ septal e′ 0.12 m/s → E/e′ ≈ 9, yet the wedge is 22 mmHg → ANNULUS PARADOXUS', 14, h - 18);
    } else {
      // hepatic vein: S and D away from the transducer (below), reversals above
      const base = h * 0.45, Y = v => base - v * 2.6;
      g.strokeStyle = '#2B3B4E'; g.beginPath(); g.moveTo(30, base); g.lineTo(w - 10, base); g.stroke();
      g.fillStyle = '#6A7F9B'; g.font = `10px ${MONO}`; g.fillText('toward liver ↑ (reversal)', 34, 16); g.fillText('forward to heart ↓', 34, h - 50);
      const bw = (w - 60) / BEATS;
      g.strokeStyle = '#22D3EE'; g.lineWidth = 1.5; g.beginPath();
      for (let px = 40; px < w - 10; px++) { const b = (px - 40) / bw + 1; const y = 36 - Math.sin((b - 1) / 4 * Math.PI * 2) * 8; px === 40 ? g.moveTo(px, y) : g.lineTo(px, y); }
      g.stroke();
      for (let b = 1; b <= BEATS; b++) {
        const ins = beatInsp(b), exp = 1 - ins;
        const x0 = 40 + (b - 1) * bw;
        const comps = [[0.05, 0.28, -(28 + 10 * ins)], [0.36, 0.2, 18 * exp + 4], [0.58, 0.2, -(30 + 12 * ins)], [0.82, 0.12, 22 * exp + 6]];   // S, diastolic reversal, D, a-reversal
        for (const [s, ww, pk] of comps) {
          g.fillStyle = pk < 0 ? 'rgba(120,170,255,0.9)' : 'rgba(255,110,110,0.95)';
          for (let px = 0; px < ww * bw; px += 1.5) { const v = Math.sin(px / (ww * bw) * Math.PI) * pk; g.fillRect(x0 + s * bw + px, Math.min(Y(v), base), 1.5, Math.abs(Y(v) - base)); }
        }
      }
      g.fillStyle = '#FF8A80'; g.font = `700 12px ${MONO}`; g.fillText(w < 520 ? 'EXPIRATORY reversals · ratio 0.86' : 'EXPIRATORY diastolic reversals — ratio 0.86 (≥ 0.79 favours constriction)', 14, h - 14);
    }
  }, []);

  const mark = which => setMarks(m => ({ ...m, [which]: { beat, v: +cal.toFixed(2) } }));
  const pct = marks.insp && marks.exp ? Math.round((marks.exp.v - marks.insp.v) / marks.exp.v * 100) : null;
  const good = marks.insp && marks.exp && Math.abs(marks.insp.v - E_INSP) <= 0.06 && Math.abs(marks.exp.v - E_EXP) <= 0.06;
  return (
    <div className="cs-card tight">
      <div className="cs-ctrls" style={{ marginTop: 0, marginBottom: 10 }}>
        {[['mv', 'Mitral inflow (PW)'], ['tdi', 'Tissue Doppler e′'], ['hv', 'Hepatic vein']].map(([k, l]) => <button key={k} className={'cs-chip' + (view === k ? ' on' : '')} onClick={() => setView(k)} data-view={k}>{l}</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 280 }} aria-label="Spectral Doppler" /></div>
      {view === 'mv' && (
        <>
          <div className="cs-ctrls">
            <span className="cs-pts">Beat</span>
            {Array.from({ length: BEATS }, (_, i) => i + 1).map(b => <button key={b} className={'cs-chip' + (beat === b ? ' on' : '')} onClick={() => setBeat(b)} data-beat={b}>{b}</button>)}
          </div>
          <div className="cs-ctrls">
            <label className="cs-slider" style={{ flex: 1 }}>Caliper on the E-wave peak
              <input type="range" min="0" max="1.4" step="0.01" value={cal} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="E-wave caliper" data-cal="mv" />
            </label>
            <button className="cs-btn" onClick={() => mark('insp')} disabled={!!done} data-mark="insp">Mark: inspiration E</button>
            <button className="cs-btn" onClick={() => mark('exp')} disabled={!!done} data-mark="exp">Mark: expiration E</button>
          </div>
          <div className="cs-readout">
            <div><span>Inspiration E</span><b>{marks.insp ? `${marks.insp.v.toFixed(2)} (beat ${marks.insp.beat})` : '—'}</b></div>
            <div><span>Expiration E</span><b>{marks.exp ? `${marks.exp.v.toFixed(2)} (beat ${marks.exp.beat})` : '—'}</b></div>
            <div><span>Respiratory variation</span><b style={{ color: pct >= 25 ? 'var(--red)' : undefined }}>{pct != null ? `${pct}%` : '—'}</b></div>
          </div>
          <p className="cs-pts" style={{ marginTop: 8 }}>(E expiration − E inspiration) ÷ E expiration. Pick the beats at the extremes of the breath. ≥ 25% favours constriction.</p>
          {!done
            ? <div className="cs-row"><button className="cs-btn primary" disabled={pct == null} onClick={() => onMeasure?.({ marks, pct, good })}>Report the variation</button></div>
            : <div className={'cs-fb ' + (done.good ? 'best' : 'ok')}>Reported {done.pct}% variation. True values: E {E_EXP.toFixed(2)} m/s in expiration, {E_INSP.toFixed(2)} m/s in inspiration — {MITRAL_TRUE}%.</div>}
        </>
      )}
      {view !== 'mv' && <p className="cs-pts" style={{ marginTop: 8 }}>{view === 'tdi'
        ? 'In constriction the lateral annulus is tethered to the scarred pericardium, so it moves LESS than the free septum; the myocardium itself relaxes normally, so e′ stays high even though filling pressures are high.'
        : 'Inspiration: the RV can fill only by pushing the septum into the LV. Expiration: the LV gets its turn, the septum swings back, the RV cannot take venous return — blood flows BACK up the hepatic veins.'}</p>}
    </div>
  );
}

/* ---------- simultaneous LV and RV pressures, with breathing ---------- */

const CATH = {
  her: { name: 'Mrs Kearney (her catheter)', lvs: [114, 100], rvs: [38, 46], lved: 22, rved: 21, dip: 4, concordant: false },
  rcm: { name: 'Comparison — cardiac amyloid', lvs: [112, 104], rvs: [58, 52], lved: 28, rved: 16, dip: 6, concordant: true },
};
export const CATH_TRUE = CATH;

function ventP(x, sys, edp, dip) {
  if (x < 0.06) return edp + (sys * 0.7 - edp) * (x / 0.06);
  if (x < 0.15) return sys * 0.7 + sys * 0.3 * Math.sin((x - 0.06) / 0.09 * Math.PI / 2);
  if (x < 0.33) return sys - sys * 0.08 * (x - 0.15) / 0.18;
  if (x < 0.42) return sys * 0.92 - (sys * 0.92 - dip) * Math.sin((x - 0.33) / 0.09 * Math.PI / 2);
  if (x < 0.47) return dip - 1.5 * Math.sin((x - 0.42) / 0.05 * Math.PI);                 // the dip
  if (x < 0.54) return dip + (edp - dip) * Math.sin((x - 0.47) / 0.07 * Math.PI / 2);      // the abrupt rise
  return edp;                                                                              // the plateau
}

export function LVRVCath({ onResult, done }) {
  const ref = useRef(null);
  const [pt, setPt] = useState('her');
  const [scale, setScale] = useState(120);
  const [calls, setCalls] = useState(done?.calls || {});
  const [lv, setLv] = useState(done?.lv ?? 10);
  const [rv, setRv] = useState(done?.rv ?? 10);
  const S = useRef({}); S.current = { pt, scale, lv, rv };
  const beat = 60 / 84;

  useCanvas(ref, 300, (g, w, h, t) => {
    const st = S.current, P = CATH[st.pt];
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const x0 = 44, top = 46, bot = h - 18;
    const Y = mm => bot - Math.min(mm, st.scale * 1.05) / st.scale * (bot - top);
    g.font = `10px ${MONO}`;
    for (let v = 0; v <= st.scale; v += st.scale / 4) { g.strokeStyle = '#13212D'; g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(v, 6, Y(v) + 3); }
    const span = (w < 520 ? 1 : 2) * RESP, at = s => (s / (w - x0 - 10)) * span;     // a frozen strip of two breaths
    // breathing
    for (let px = x0; px < w - 10; px++) if (inspAt(at(px - x0)) > 0.05) { g.fillStyle = 'rgba(34,211,238,0.05)'; g.fillRect(px, top - 6, 1, bot - top + 6); }
    g.strokeStyle = '#22D3EE'; g.lineWidth = 1.5; g.beginPath();
    for (let px = x0; px < w - 10; px++) { const s = at(px - x0); const y = 22 - Math.sin((s % RESP) / RESP * Math.PI * 2) * 10; px === x0 ? g.moveTo(px, y) : g.lineTo(px, y); }
    g.stroke();
    g.fillStyle = '#22D3EE'; g.font = `600 10px ${MONO}`; g.fillText('RESP', 6, 26);
    const draw = (col, sysArr, edp, phase) => {
      g.strokeStyle = col; g.lineWidth = 2; g.beginPath();
      for (let px = x0; px < w - 10; px++) {
        const s = at(px - x0) + phase, x = ((s % beat) + beat) % beat / beat;
        const bStart = s - x * beat, ins = inspAt(bStart);
        const sys = sysArr[0] + (sysArr[1] - sysArr[0]) * ins;
        const v = ventP(x, sys, edp + (st.pt === 'her' ? 0 : 0), P.dip);
        px === x0 ? g.moveTo(px, Y(v)) : g.lineTo(px, Y(v));
      }
      g.stroke();
    };
    draw('#22D3EE', P.rvs, P.rved, 0.01);
    draw('#FF5A52', P.lvs, P.lved, 0);
    if (st.scale === 40) {
      for (const [val, col, lab] of [[st.lv, '#FF8A80', 'LV cal'], [st.rv, '#7DE7F5', 'RV cal']]) {
        g.strokeStyle = col; g.setLineDash([6, 4]); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x0, Y(val)); g.lineTo(w, Y(val)); g.stroke(); g.setLineDash([]);
        g.fillStyle = col; g.font = `700 11px ${MONO}`; g.fillText(`${lab} ${val}`, w - 90, Y(val) + (lab.startsWith('RV') ? 13 : -4));
      }
    }
    g.font = `700 11px ${MONO}`; g.fillStyle = '#FF5A52'; g.fillText('LV', w - 150, 14); g.fillStyle = '#22D3EE'; g.fillText('RV', w - 124, 14);
    g.fillStyle = '#9FB4C6'; g.fillText(w < 520 ? `0–${st.scale} mmHg · one breath` : `scale 0–${st.scale} mmHg · frozen, two breaths`, Math.max(x0 + 60, w - (w < 520 ? 230 : 330)), 40);
  }, []);

  const call = (k, v) => !done && setCalls(c => ({ ...c, [k]: v }));
  const P = CATH.her;
  const diff = lv - rv;
  const okMeas = Math.abs(lv - P.lved) <= 2 && Math.abs(rv - P.rved) <= 2;
  const okCalls = calls.her === 'discordant' && calls.rcm === 'concordant';
  return (
    <div className="cs-card tight">
      <div className="cs-ctrls" style={{ marginTop: 0, marginBottom: 10 }}>
        {Object.entries(CATH).map(([k, p]) => <button key={k} className={'cs-chip' + (pt === k ? ' on' : '')} onClick={() => setPt(k)} data-pt={k}>{p.name}</button>)}
        <span style={{ marginLeft: 'auto' }} />
        {[120, 40].map(s => <button key={s} className={'cs-chip' + (scale === s ? ' on' : '')} onClick={() => setScale(s)} data-scale={s}>0–{s} mmHg</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 300 }} aria-label="Simultaneous left and right ventricular pressures with respiration" /></div>
      <div className="cs-grid2" style={{ marginTop: 10 }}>
        <div>
          <div className="cs-pts" style={{ marginBottom: 6 }}>① Systolic peaks with inspiration — on the 0–120 scale, for each patient</div>
          {Object.entries(CATH).map(([k, p]) => (
            <div key={k} className="cs-row" style={{ marginBottom: 6 }}>
              <span style={{ flex: '1 1 140px', fontSize: 13 }}>{p.name}</span>
              {['concordant', 'discordant'].map(v => (
                <button key={v} className={'cs-chip' + (calls[k] === v ? ' on' : '')} onClick={() => call(k, v)} disabled={!!done} data-call={`${k}-${v}`}>{v}</button>
              ))}
            </div>
          ))}
        </div>
        <div>
          <div className="cs-pts" style={{ marginBottom: 6 }}>② Her end-diastolic pressures — switch to the 0–40 scale and set the calipers on the plateau</div>
          <label className="cs-slider">LVEDP <input type="range" min="0" max="40" step="1" value={lv} onChange={e => !done && setLv(+e.target.value)} data-cal="lv" aria-label="LV end-diastolic caliper" /> <b className="cs-mono">{lv}</b></label>
          <label className="cs-slider">RVEDP <input type="range" min="0" max="40" step="1" value={rv} onChange={e => !done && setRv(+e.target.value)} data-cal="rv" aria-label="RV end-diastolic caliper" /> <b className="cs-mono">{rv}</b></label>
        </div>
      </div>
      <div className="cs-readout">
        <div><span>LVEDP − RVEDP</span><b>{diff} mmHg</b></div>
        <div><span>RVEDP ÷ RVSP</span><b>{(rv / 42).toFixed(2)}</b></div>
        <div><span>RV systolic (mean)</span><b>42 mmHg</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Constriction: EDPs within 5 mmHg, RVEDP/RVSP &gt; 1/3, RVSP &lt; 55 — and, most specific, DISCORDANT systolic peaks. Dip-and-plateau occurs in both.</p>
      {!done
        ? <div className="cs-row"><button className="cs-btn primary" disabled={!calls.her || !calls.rcm} onClick={() => onResult?.({ calls, lv, rv, good: okCalls && okMeas, okCalls, okMeas })}>Report the haemodynamics</button></div>
        : <div className={'cs-fb ' + (done.good ? 'best' : 'ok')}>
            {done.okCalls ? 'Both patterns called right.' : 'Look again: in her, inspiration RAISES the RV peak while the LV peak FALLS — discordance. In the amyloid heart both fall together.'}{' '}
            {done.okMeas ? `EDPs ${done.lv} and ${done.rv}: equalised.` : `Her EDPs are ${P.lved} and ${P.rved} — measure on the 0–40 scale, at the plateau just before the upstroke.`}
          </div>}
    </div>
  );
}

/* ---------- constriction vs restriction: sort the findings ---------- */

export const BOARD = [
  { id: 'evar', label: 'Mitral E falls ≥ 25% on inspiration', truth: 'C', why: 'The shell isolates the heart from chest pressure but not from the lungs: inspiration lowers the pulmonary vein pressure, the LA-LV gradient falls, and E falls.' },
  { id: 'rev', label: 'Septal e′ higher than lateral e′ (annulus reversus)', truth: 'C', why: 'The lateral wall is tethered to the scar; the septum moves freely.' },
  { id: 'lowe', label: 'Septal e′ 4 cm/s with E/e′ of 22', truth: 'R', why: 'The muscle cannot relax: a low e′ is the signature of myocardial disease.' },
  { id: 'dip', label: 'Dip-and-plateau (square-root) ventricular pressure', truth: 'B', why: 'Both stop filling abruptly in early diastole. Not discriminating.' },
  { id: 'disc', label: 'LV and RV systolic peaks move in OPPOSITE directions with breathing', truth: 'C', why: 'Interdependence in a fixed box: the most specific catheter sign (systolic area index > 1.1).' },
  { id: 'pasp', label: 'PA systolic pressure 60 mmHg', truth: 'R', why: 'A stiff LV raises LA and PA pressures; in constriction PASP is usually < 55 mmHg.' },
  { id: 'peri', label: 'Pericardium 7 mm, enhancing, with septal bounce on CMR', truth: 'C', why: 'Thickening plus the haemodynamics. A normal-thickness pericardium does NOT exclude constriction (about 1 in 5).' },
  { id: 'bnp', label: 'BNP 1,450 pg/mL', truth: 'R', why: 'Stretched, diseased myocardium secretes BNP; in constriction the shell stops the stretch, so BNP is often surprisingly modest.' },
  { id: 'atria', label: 'Big atria, normal-sized ventricles, normal EF', truth: 'B', why: 'Both are diastolic diseases with high filling pressures.' },
  { id: 'hv', label: 'Hepatic vein diastolic flow reversal in EXPIRATION', truth: 'C', why: 'In restriction the reversals come in INSPIRATION.' },
  { id: 'volt', label: 'Low ECG voltages with thick LV walls', truth: 'R', why: 'Voltage–mass mismatch: infiltration (amyloid), not muscle.' },
  { id: 'kuss', label: 'Raised JVP, steep y-descent, Kussmaul sign', truth: 'B', why: 'A high, fixed right-sided filling pressure — both can do it.' },
];
const LBL = { C: 'constriction', R: 'restriction', B: 'both' };

export function CPRCMBoard({ onResult, done }) {
  const [calls, setCalls] = useState(done?.calls || {});
  const submitted = !!done;
  const all = BOARD.every(f => calls[f.id]);
  const correct = BOARD.filter(f => calls[f.id] === f.truth).length;
  return (
    <div className="cs-card tight">
      <div className="cs-pts" style={{ marginBottom: 8 }}>🧩 The contrast board: call each finding — the shell, the muscle, or both.</div>
      <div className="cs-opts">
        {BOARD.map(f => {
          const c = calls[f.id], ok = submitted && c === f.truth;
          return (
            <div key={f.id} className={'cs-opt' + (submitted ? (ok ? ' best' : ' wrong') : '')} style={{ flexWrap: 'wrap' }}>
              <span style={{ flex: '1 1 240px' }}>{f.label}
                {submitted && <span className="cs-opt-why">{ok ? '✓ ' : `✗ ${LBL[f.truth].toUpperCase()}. `}{f.why}</span>}
              </span>
              <span className="cs-row" style={{ gap: 6 }}>
                {['C', 'R', 'B'].map(v => <button key={v} className={'cs-chip' + (c === v ? ' on' : '')} disabled={submitted} onClick={() => setCalls(x => ({ ...x, [f.id]: v }))} data-board={`${f.id}-${v}`}>{LBL[v]}</button>)}
              </span>
            </div>
          );
        })}
      </div>
      {!submitted
        ? <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" disabled={!all} onClick={() => onResult?.({ calls, correct })}>Check the board</button></div>
        : <div className="cs-fb best" style={{ marginTop: 10 }}>{done.correct} / {BOARD.length} called right. The shell gives interdependence and normal muscle; the muscle gives low e′, high PA pressure and BNP.</div>}
    </div>
  );
}

/* ---------- the irradiated chest: hazard by hazard ---------- */

export const HAZARDS = [
  { id: 'aorta', h: '🦴 Porcelain ascending aorta (circumferential calcium on CT)',
    opts: [['clamp', 'Cross-clamp it carefully and do a surgical AVR'], ['notouch', 'No-touch aorta: the valve by TAVI; if bypass is needed, cannulate the femoral (or axillary) artery'], ['low', 'Clamp lower, nearer the arch']],
    best: 'notouch', why: 'A clamp on an eggshell aorta cracks it and showers calcium into the brain. Nothing touches it.' },
  { id: 'rca', h: '🫀 Ostial RCA 80%, ostial left main 40% — classic radiation ostial disease',
    opts: [['cabg', 'CABG with the left internal mammary artery'], ['pci', 'PCI to the RCA ostium before the valve and pericardium; treat the left main medically and re-image'], ['ignore', 'Leave it; she has no angina']],
    best: 'pci', why: 'Her mammary arteries lay in the beam and may be fibrosed; a vein graft needs a proximal anastomosis on a porcelain aorta. Breathlessness may be her angina.' },
  { id: 'sternum', h: '🪚 Mediastinal fibrosis: heart and RV stuck to the back of the sternum',
    opts: [['saw', 'Standard sternotomy with the usual saw'], ['reentry', 'Redo-style entry: pads on before skin, femoral vessels exposed, oscillating saw, blood in the room'], ['thor', 'Left thoracotomy only']],
    best: 'reentry', why: 'Treat a never-opened irradiated chest like a redo: the RV may be fused to bone. A thoracotomy cannot reach the right heart and IVC.' },
  { id: 'lung', h: '🫁 Radiation lung fibrosis, DLCO 46%',
    opts: [['lung', 'Lung-protective ventilation, early extubation plan, pre-habilitation and physiotherapy'], ['ignore', 'Nothing special'], ['cancel', 'Too risky — no surgery ever']],
    best: 'lung', why: 'Fibrotic lungs fail after bypass and long ventilation; plan for them. They raise risk — they do not by themselves forbid surgery.' },
  { id: 'skin', h: '🩹 Irradiated, thin chest skin and poor healing',
    opts: [['bima', 'Harvest both mammary arteries'], ['protect', 'Spare the mammaries, meticulous closure, consider rigid sternal fixation, tight glucose control'], ['none', 'Nothing special']],
    best: 'protect', why: 'Radiation kills small vessels: the sternum heals poorly and mammary harvest robs it of its blood supply.' },
  { id: 'phrenic', h: '⚡ Both phrenic nerves run in thick, calcified pericardium',
    opts: [['beyond', 'Resect beyond the nerves for completeness'], ['p2p', 'Phrenic-to-phrenic: identify both nerves and keep a pedicle of pericardium with each'], ['strip', 'An anterior strip only, well away from the nerves']],
    best: 'p2p', why: 'Radical — but a paralysed diaphragm in fibrotic lungs means weeks on a ventilator. An anterior strip leaves her constricted.' },
  { id: 'cond', h: '💓 PR 240 ms; conduction tissue scarred; TAVI planned',
    opts: [['none', 'Nothing'], ['wires', 'Atrial AND ventricular epicardial wires, pads on, monitored bed; pace AV-sequentially if needed'], ['ppm', 'A permanent pacemaker now, before anything']],
    best: 'wires', why: 'Block may come after TAVI or after surgery. AV-sequential pacing keeps the atrial kick a stiff ventricle depends on.' },
  { id: 'thy', h: '🦋 TSH 18 mU/L — the neck was in the field too',
    opts: [['now', 'Operate without treating it'], ['gentle', 'Levothyroxine low and slow (25 µg), recheck; do not delay urgent surgery'], ['load', 'A full replacement dose straight away']],
    best: 'gentle', why: 'Hypothyroidism worsens effusions, slows drug clearance and delays weaning. A big dose in coronary disease can provoke ischaemia.' },
];

export function SternotomyPlanner({ onResult, done }) {
  const [pick, setPick] = useState(done?.pick || {});
  const submitted = !!done;
  const all = HAZARDS.every(z => pick[z.id]);
  const correct = HAZARDS.filter(z => pick[z.id] === z.best).length;
  const risk = HAZARDS.reduce((n, z) => n + (pick[z.id] ? (pick[z.id] === z.best ? 0 : 1) : 1), 0);
  return (
    <div className="cs-card tight">
      <div className="cs-pts" style={{ marginBottom: 8 }}>🧮 The hostile chest planner — for each thing the beam did, choose how the team protects her.</div>
      <div className="cs-opts">
        {HAZARDS.map(z => (
          <div key={z.id} className={'cs-opt' + (submitted ? (pick[z.id] === z.best ? ' best' : ' wrong') : '')} style={{ display: 'block' }}>
            <b style={{ display: 'block', marginBottom: 6 }}>{z.h}</b>
            <span className="cs-row" style={{ gap: 6 }}>
              {z.opts.map(([k, l]) => <button key={k} className={'cs-chip' + (pick[z.id] === k ? ' on' : '')} style={{ whiteSpace: 'normal', textAlign: 'left' }} disabled={submitted} onClick={() => setPick(p => ({ ...p, [z.id]: k }))} data-haz={`${z.id}-${k}`}>{l}</button>)}
            </span>
            {submitted && <span className="cs-opt-why">{pick[z.id] === z.best ? '✓ ' : `✗ Best: ${z.opts.find(o => o[0] === z.best)[1]}. `}{z.why}</span>}
          </div>
        ))}
      </div>
      <div className="cs-readout">
        <div><span>Hazards covered</span><b>{HAZARDS.length - risk} / {HAZARDS.length}</b></div>
        <div><span>Unmitigated</span><b style={{ color: risk ? 'var(--red)' : 'var(--green)' }}>{risk}</b></div>
      </div>
      {!submitted
        ? <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" disabled={!all} onClick={() => onResult?.({ pick, correct })}>Lock the plan</button></div>
        : <div className="cs-fb best" style={{ marginTop: 10 }}>{done.correct} / {HAZARDS.length} hazards handled the best way. The STS score sees none of these — it was never built for an irradiated chest.</div>}
    </div>
  );
}

/* ---------- pericardiectomy: free the heart ---------- */

export const REGIONS = [
  { id: 'lvant', name: 'Anterior LV, over the LAD', lv: true,
    finding: 'A plate of calcium 3 × 2 cm, welded to the epicardium right over the LAD. It does not lift.',
    opts: [['peel', 'Peel it off'], ['island', 'Leave an island of calcium on the LAD; free everything around it'], ['waffle', 'Waffle the plate']], best: 'island',
    bad: { peel: 'The plate tears the LAD wall. Bleeding, ST elevation; a vein patch on bypass — 40 minutes of ischaemia.', waffle: 'You cannot score calcium; the knife skids towards the LAD.' } },
  { id: 'lvlat', name: 'Lateral LV, to the left phrenic', lv: true,
    finding: 'Thick parietal pericardium to the left phrenic nerve, which runs inside it with its vessels.',
    opts: [['p2p', 'Free it to ~1 cm in front of the phrenic, keep the nerve on a pedicle'], ['beyond', 'Cut through to the back'], ['waffle', 'Waffle it']], best: 'p2p',
    bad: { beyond: 'The left phrenic is divided. A paralysed hemidiaphragm in fibrotic lungs.', waffle: 'This is parietal pericardium — it comes off; waffling is for an epicardial peel.' } },
  { id: 'diaph', name: 'Inferior (diaphragmatic) surface', lv: true,
    finding: 'The parietal layer comes off — but under it the epicardium is a thick white rind. The ventricle still does not bulge.',
    opts: [['peel', 'Peel the epicardium off the muscle'], ['island', 'Leave it'], ['waffle', 'Waffle: criss-cross incisions through the rind until the muscle bulges']], best: 'waffle',
    bad: { peel: 'The epicardium is the muscle’s own skin; peeling it tears the posterior descending branches. Bleeding.', island: 'Visceral constriction left behind: she will still be constricted.' } },
  { id: 'rv', name: 'Anterior RV', lv: false,
    finding: 'The RV free wall, thin and pale, under 6 mm of fibrous pericardium.',
    opts: [['peel', 'Peel it off, with care over the thin wall'], ['island', 'Leave it — the RV is thin'], ['waffle', 'Waffle it']], best: 'peel',
    bad: { island: 'An RV still caged: the constriction persists.', waffle: 'This layer comes off; waffling it only weakens a thin wall.' } },
  { id: 'ra', name: 'Right atrium and the IVC/SVC junctions', lv: false,
    finding: 'A tight fibrous band around the IVC as it enters the right atrium.',
    opts: [['peel', 'Divide the band and free the cavo-atrial junctions'], ['island', 'Leave the atria — they are thin'], ['waffle', 'Waffle the atrium']], best: 'peel',
    bad: { island: 'A band at the IVC is a constriction of its own: ascites and oedema stay.', waffle: 'The atrial wall is too thin for that.' } },
];

export function Pericardiectomy({ onResult, onEvent, done }) {
  const [freed, setFreed] = useState(done?.freed || {});      // id -> technique
  const [order, setOrder] = useState(done?.order || []);
  const [sel, setSel] = useState('lvant');
  const [log, setLog] = useState(done?.log || []);
  const ref = useRef(null);
  const submitted = !!done;

  const lvDone = REGIONS.filter(r => r.lv).every(r => freed[r.id]);
  const effective = id => freed[id] && (freed[id] === REGIONS.find(r => r.id === id).best);
  const nEff = REGIONS.filter(r => effective(r.id)).length;
  const cvp = Math.round(20 - nEff * 2.6);
  const ci = (1.9 + nEff * 0.14).toFixed(2);
  const S = useRef({}); S.current = { nEff };

  useCanvas(ref, 150, (g, w, h, t) => {
    const k = S.current.nEff / REGIONS.length;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const Y = mm => h - 14 - mm / 40 * (h - 30);
    g.font = `10px ${MONO}`;
    for (const v of [0, 10, 20, 30, 40]) { g.strokeStyle = '#13212D'; g.beginPath(); g.moveTo(34, Y(v)); g.lineTo(w, Y(v)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(v, 6, Y(v) + 3); }
    const beat = 0.75, edp = 21 - k * 13, dip = 3 + k * 1;
    g.strokeStyle = '#22D3EE'; g.lineWidth = 2; g.beginPath();
    for (let px = 34; px < w; px += 1.5) {
      const s = t - (w - px) / 120, x = ((s % beat) + beat) % beat / beat;
      // as the shell comes off, the plateau falls and the square root softens into a gentle slope
      let v = ventP(x, 40, edp, dip);
      if (x > 0.47) v = dip + (edp - dip) * (k > 0.6 ? Math.min(1, (x - 0.47) / 0.53) : Math.min(1, (x - 0.47) / (0.07 + k * 0.4)));
      px === 34 ? g.moveTo(px, Y(v)) : g.lineTo(px, Y(v));
    }
    g.stroke();
    g.fillStyle = '#22D3EE'; g.font = `700 11px ${MONO}`; g.fillText(k > 0.6 ? 'RV · plateau gone' : 'RV · dip-and-plateau', w - 190, 14);
  }, []);

  const act = (r, tech) => {
    if (submitted || freed[r.id]) return;
    const ev = [];
    if (!r.lv && !lvDone) ev.push(`⚠️ ${r.name} freed while the LV is still caged: the RV surges, pours blood into a ventricle that cannot take it — PA pressure 48, SpO₂ 89%, frothy secretions in the tube.`);
    if (tech === r.best) ev.push(`✅ ${r.name}: ${r.opts.find(o => o[0] === tech)[1]} — the wall bulges, the CVP falls.`);
    else ev.push(`❌ ${r.name}: ${r.bad[tech]}`);
    setFreed(f => ({ ...f, [r.id]: tech }));
    setOrder(o => [...o, r.id]);
    setLog(l => [...l, ...ev]);
    onEvent?.({ region: r.id, tech, good: tech === r.best, early: !r.lv && !lvDone });
    const next = REGIONS.find(x => !freed[x.id] && x.id !== r.id);
    if (next) setSel(next.id);
  };
  const finish = () => {
    const nTech = REGIONS.filter(r => freed[r.id] === r.best).length;
    const complete = REGIONS.every(r => freed[r.id]);
    const firstRV = order.findIndex(id => !REGIONS.find(r => r.id === id).lv);
    const lvFirst = firstRV === -1 ? complete : REGIONS.filter(r => r.lv).every(r => order.indexOf(r.id) > -1 && order.indexOf(r.id) < firstRV);
    const pts = nTech * 2 + (complete ? 6 : 0) + (lvFirst && complete ? 4 : 0);
    onResult?.({ freed, order, log, nTech, complete, lvFirst, pts, cvp, ci });
  };
  const R = REGIONS.find(r => r.id === sel);
  // a schematic anterior view of the heart in its shell
  const shapes = {
    lvant: 'M210 70 C250 72 282 110 284 160 L232 168 C226 130 218 100 210 70 Z',
    lvlat: 'M284 160 C290 205 270 245 236 266 L224 220 C232 205 234 186 232 168 Z',
    diaph: 'M236 266 C200 286 140 288 104 262 L130 226 C160 240 196 238 224 220 Z',
    rv: 'M130 226 C110 190 112 130 140 92 C164 76 190 70 210 70 C218 100 226 130 232 168 C234 186 232 205 224 220 C196 238 160 240 130 226 Z',
    ra: 'M140 92 C112 100 90 130 88 170 C88 210 96 240 104 262 L130 226 C110 190 112 130 140 92 Z',
  };
  const col = id => !freed[id] ? (id === sel ? '#F5C451' : '#5C4A2A') : effective(id) ? '#34E39A' : '#FF4D6D';
  return (
    <div className="cs-card tight">
      <div className="cs-grid2">
        <div>
          <svg viewBox="40 30 300 280" style={{ width: '100%', maxHeight: 320, background: '#03070B', borderRadius: 12 }} role="group" aria-label="The heart in its pericardium, anterior view">
            <path d="M160 40 C160 60 170 66 186 70" stroke="#C9A06A" strokeWidth="14" fill="none" opacity="0.7" />
            {Object.entries(shapes).map(([id, d]) => (
              <path key={id} d={d} fill={col(id)} fillOpacity={freed[id] ? 0.35 : 0.75} stroke={id === sel ? '#FFF3C4' : '#0F1C30'} strokeWidth="2.5"
                onClick={() => setSel(id)} style={{ cursor: 'pointer' }} data-region={id} />
            ))}
            {/* phrenic nerves */}
            <path d="M296 60 C300 140 296 220 252 286" stroke="#A78BFA" strokeWidth="3" fill="none" strokeDasharray="6 4" />
            <path d="M84 60 C76 140 80 220 96 280" stroke="#A78BFA" strokeWidth="3" fill="none" strokeDasharray="6 4" />
            <text x="300" y="56" fontSize="11" fill="#A78BFA" fontFamily={MONO}>L phrenic</text>
            <text x="44" y="56" fontSize="11" fill="#A78BFA" fontFamily={MONO}>R phrenic</text>
            <text x="244" y="130" fontSize="12" fill="#04121A" fontWeight="700" fontFamily={MONO}>LV</text>
            <text x="160" y="160" fontSize="12" fill="#04121A" fontWeight="700" fontFamily={MONO}>RV</text>
            <text x="98" y="176" fontSize="12" fill="#04121A" fontWeight="700" fontFamily={MONO}>RA</text>
            <text x="150" y="276" fontSize="11" fill="#E9F2FC" fontFamily={MONO}>diaphragmatic</text>
          </svg>
          <p className="cs-pts">Tap a region. Gold = selected, brown = still caged, green = freed well, red = a problem.</p>
        </div>
        <div>
          <div className="cs-h2" style={{ marginTop: 0 }}>{R.name}</div>
          <p className="cs-p" style={{ fontSize: 15 }}>{R.finding}</p>
          {!freed[R.id] && !submitted ? (
            <div className="cs-opts">
              {R.opts.map(([k, l]) => <button key={k} className="cs-opt" onClick={() => act(R, k)} data-tech={`${R.id}-${k}`}><span className="cs-opt-k">✂</span><span>{l}</span></button>)}
            </div>
          ) : <div className={'cs-fb ' + (effective(R.id) ? 'best' : 'wrong')}>Done: {R.opts.find(o => o[0] === freed[R.id])?.[1]}</div>}
          <div className="cs-readout">
            <div><span>CVP</span><b>{cvp} mmHg</b></div>
            <div><span>Cardiac index</span><b>{ci}</b></div>
            <div><span>Freed well</span><b>{nEff} / {REGIONS.length}</b></div>
          </div>
        </div>
      </div>
      <div className="cs-viewer" style={{ marginTop: 10 }}><canvas ref={ref} className="cs-canvas" style={{ height: 150 }} aria-label="Right ventricular pressure during the pericardiectomy" /></div>
      {log.length > 0 && <ul className="cs-ul" style={{ marginTop: 10 }}>{log.map((l, i) => <li key={i} className="cs-li">{l}</li>)}</ul>}
      {!submitted
        ? <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" onClick={finish} disabled={!order.length} data-finish="peri">Finish — close the chest</button>
            {order.length < REGIONS.length && <span className="cs-pts">{REGIONS.length - order.length} region(s) still caged</span>}</div>
        : <div className={'cs-fb ' + (done.pts >= 20 ? 'best' : 'ok')} style={{ marginTop: 10 }}>
            {done.complete ? 'Radical phrenic-to-phrenic pericardiectomy, diaphragmatic surface and cavo-atrial junctions included.' : 'Incomplete: part of the heart is still caged — the commonest reason constriction comes back.'}{' '}
            {done.lvFirst ? 'Left ventricle freed before the right.' : 'The right heart was freed before the left.'} {done.nTech}/{REGIONS.length} regions handled the best way. Closing CVP {done.cvp}, cardiac index {done.ci}.
          </div>}
    </div>
  );
}

/* ---------- parasternal short axis: round LV vs D-shaped LV ---------- */

export function RVEcho({ mode = 'crisis' }) {
  const ref = useRef(null);
  const live = useRef({ k: mode === 'crisis' ? 1 : 0 });
  const target = useRef(mode); target.current = mode;
  useCanvas(ref, 240, (g, w, h, t) => {
    const L = live.current; L.k += ((target.current === 'crisis' ? 1 : 0) - L.k) * 0.05;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = 4, R = h * 1.05;
    g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, Math.PI / 2 - 0.8, Math.PI / 2 + 0.8); g.closePath(); g.clip();
    for (let i = 0; i < 1800; i++) { const a = Math.PI / 2 + (Math.random() - 0.5) * 1.6, rr = Math.random() * R; g.fillStyle = `rgba(190,190,190,${Math.random() * 0.09})`; g.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2, 2); }
    const beat = 60 / (target.current === 'crisis' ? 90 : 80);
    const ph = (t % beat) / beat, sq = ph < 0.35 ? Math.sin(ph / 0.35 * Math.PI) : 0;   // systolic squeeze
    const k = L.k, lx = cx + 34, ly = h * 0.6;
    const r = 52 * (1 - 0.22 * sq) * (1 - 0.15 * k);
    const ts = -Math.PI * 0.8, ux = Math.cos(ts), uy = Math.sin(ts);                  // toward the RV: up and left
    const d = r * (1 - 0.5 * k);                                                      // where the septum sits
    // RV free wall: a thin crescent wrapped around the septal side, ballooning in the crisis
    const rr = r + 16 + 58 * k, span = 0.95 + 0.45 * k;
    g.strokeStyle = 'rgba(205,205,205,0.8)'; g.lineWidth = 6;
    g.beginPath(); g.arc(lx + ux * 6 * k, ly + uy * 6 * k, rr, ts - span, ts + span); g.stroke();
    // LV: round, or a "D" with the septum pressed flat
    g.fillStyle = '#000'; g.strokeStyle = 'rgba(240,240,240,0.95)'; g.lineWidth = 12;
    g.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.04) {
      let x = Math.cos(a) * r, y = Math.sin(a) * r;
      const p = x * ux + y * uy;
      if (p > d) { x -= (p - d) * ux; y -= (p - d) * uy; }
      a === 0 ? g.moveTo(lx + x, ly + y) : g.lineTo(lx + x, ly + y);
    }
    g.closePath(); g.fill(); g.stroke();
    // papillary muscles
    g.fillStyle = 'rgba(220,220,220,0.8)';
    g.beginPath(); g.arc(lx + r * 0.45, ly + r * 0.5, 7, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(lx - r * 0.1, ly + r * 0.7, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#6A7F9B'; g.font = `700 11px ${MONO}`;
    g.fillText('LV', lx - 6, ly + 4); g.fillText('RV', lx + ux * (d + (rr - d) / 2) - 8, ly + uy * (d + (rr - d) / 2) + 4);
    g.restore();
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText('PSAX · mid-papillary', 10, 16);
    g.fillStyle = L.k > 0.5 ? '#FF8A80' : '#34E39A'; g.font = `700 12px ${MONO}`;
    g.fillText(L.k > 0.5 ? 'RV huge · septum flat · LV a small "D"' : 'LV round · RV a crescent', 10, h - 12);
  }, []);
  return <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 240 }} aria-label="Parasternal short-axis echo" /></div>;
}

/* ---------- the crisis: low output after pericardiectomy ---------- */

export const RESUS = [
  { id: 'echo', label: '🔎 Bedside TOE through the open sedation window', good: true, fx: {}, msg: 'RV dilated and barely moving, severe TR, septum flat; LV small and underfilled; NO collection around the heart. The drains are not blocked.' },
  { id: 'pace', label: 'AV-sequential epicardial pacing, DDD at 90/min', good: true, fx: { hr: 90, rhythm: 'paced', sys: 10, ci: 0.3 }, msg: 'Atrium and ventricle in order again: the stiff LV gets its atrial kick back. Pressure up.' },
  { id: 'fluid', label: '500 mL crystalloid bolus — she is “underfilled”', good: false, fx: { sys: -8, cvp: 4, ci: -0.15 }, msg: 'The CVP climbs to 25, the TR jet widens, the septum bows further into the LV. Pressure falls.' },
  { id: 'nor', label: 'Noradrenaline 0.05–0.1 µg/kg/min', good: true, fx: { sys: 14, ci: 0.05 }, msg: 'Aortic pressure is the RV’s own coronary perfusion pressure. Restore it first.' },
  { id: 'mil', label: 'Milrinone 0.375 µg/kg/min, no bolus', good: true, fx: { sys: -3, ci: 0.4, cvp: -2 }, msg: 'Inotropy and pulmonary vasodilation for the RV; without a bolus the vasodilation is manageable on noradrenaline.' },
  { id: 'ino', label: 'Inhaled nitric oxide 20 ppm', good: true, fx: { ci: 0.25, cvp: -2, spo2: 3 }, msg: 'Selective pulmonary vasodilation: a lower afterload for a failing RV, without dropping the systemic pressure.' },
  { id: 'peep', label: 'Increase PEEP to 14 cmH₂O for the oxygen', good: false, fx: { sys: -6, cvp: 3, ci: -0.2 }, msg: 'High intrathoracic pressure raises RV afterload and squeezes the venous return: the CVP rises, the output falls.' },
  { id: 'reopen', label: 'Re-open the chest now for tamponade', good: false, fx: { sys: -10 }, msg: 'The TOE showed no collection. A trip back to theatre costs an hour of a failing RV under anaesthesia and solves nothing.' },
  { id: 'uf', label: 'Once the pressure is up: furosemide infusion, or ultrafiltration if the kidneys will not respond', good: true, fx: { cvp: -3, ci: 0.15 }, msg: 'Decongest the RV: a smaller RV has less TR and lets the septum return to the middle.' },
  { id: 'ecmo', label: 'Alert the ECMO / RVAD team: if the index stays < 2.0 despite this, mechanical support', good: true, fx: {}, msg: 'Escalation planned before you need it, not after the arrest.' },
];

export function LowOutputResus({ onVitals, onResult, done }) {
  const [taken, setTaken] = useState(done?.taken || []);
  const [st, setSt] = useState(done?.st || { hr: 44, sys: 76, dia: 46, spo2: 91, cvp: 21, ci: 1.45, rhythm: 'chb' });
  const submitted = !!done;
  const act = a => {
    if (submitted || taken.includes(a.id)) return;
    const f = a.fx, n = { ...st };
    if (f.hr) n.hr = f.hr;
    if (f.rhythm) n.rhythm = f.rhythm;
    n.sys = Math.max(52, Math.min(118, n.sys + (f.sys || 0)));
    n.dia = Math.round(n.sys * 0.6);
    n.cvp = Math.max(9, n.cvp + (f.cvp || 0));
    n.ci = Math.max(1.0, +(n.ci + (f.ci || 0)).toFixed(2));
    n.spo2 = Math.min(98, n.spo2 + (f.spo2 || 0));
    setSt(n); setTaken(x => [...x, a.id]);
    onVitals?.({ hr: n.hr, sys: n.sys, dia: n.dia, spo2: n.spo2, rhythm: n.rhythm });
  };
  const finish = () => {
    const goodTaken = RESUS.filter(a => a.good && taken.includes(a.id)).length;
    const badAvoided = RESUS.filter(a => !a.good && !taken.includes(a.id)).length;
    const nGood = RESUS.filter(a => a.good).length, nBad = RESUS.filter(a => !a.good).length;
    const pts = Math.round(goodTaken / nGood * 14 + badAvoided / nBad * 6);
    onResult?.({ taken, st, pts, goodTaken, badAvoided });
  };
  const lact = st.ci >= 2.2 ? '2.1 ↓' : st.ci >= 1.9 ? '3.6' : '5.2';
  return (
    <div className="cs-card tight">
      <div className="cs-readout" style={{ marginTop: 0 }}>
        <div><span>Rhythm</span><b style={{ fontSize: 15 }}>{st.rhythm === 'chb' ? 'Complete heart block' : st.rhythm === 'paced' ? 'AV paced' : 'Sinus'}</b></div>
        <div><span>BP</span><b style={{ color: st.sys < 90 ? 'var(--red)' : undefined }}>{st.sys}/{st.dia}</b></div>
        <div><span>CVP</span><b style={{ color: st.cvp > 16 ? 'var(--red)' : undefined }}>{st.cvp} mmHg</b></div>
        <div><span>Cardiac index</span><b style={{ color: st.ci < 2.2 ? 'var(--red)' : 'var(--green)' }}>{st.ci.toFixed(2)} L/min/m²</b></div>
        <div><span>Lactate</span><b>{lact} mmol/L</b></div>
        <div><span>Drains</span><b style={{ fontSize: 15 }}>40 mL/h, serous</b></div>
      </div>
      <div className="cs-opts" style={{ marginTop: 10 }}>
        {RESUS.map(a => {
          const on = taken.includes(a.id);
          const cls = !on ? '' : a.good ? 'best' : 'wrong';
          return (
            <button key={a.id} className={'cs-opt ' + cls} onClick={() => act(a)} disabled={submitted || on} data-resus={a.id}>
              <span className="cs-opt-k">{on ? (a.good ? '✓' : '✗') : '·'}</span>
              <span>{a.label}{(on || submitted) && <span className="cs-opt-why">{a.msg}</span>}</span>
            </button>
          );
        })}
      </div>
      {!submitted
        ? <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" onClick={finish} disabled={!taken.length} data-finish="resus">Hand over: the next hour’s plan is set</button></div>
        : <div className={'cs-fb ' + (done.pts >= 20 ? 'best' : 'ok')} style={{ marginTop: 10 }}>{done.goodTaken} of {RESUS.filter(a => a.good).length} right moves, {done.badAvoided} of {RESUS.filter(a => !a.good).length} traps avoided. Index {done.st.ci.toFixed(2)}, CVP {done.st.cvp}.</div>}
    </div>
  );
}
