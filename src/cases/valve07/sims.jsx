import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../kit/Monitor.jsx';

/* ============================================================
   RIGHT-SIDED ENDOCARDITIS SIMULATORS
   Built for Valvular & Structural Heart Unit case 07, in the
   kit's style (canvas via useCanvas, cs-* classes, the dark
   palette) so they can be promoted to the kit later.

   TRMurmur         tricuspid regurgitation: phono, JVP, breathing
   CultureIncubator blood-culture bottles flipping positive (TTP)
   DukeBuilder      Duke-ISCID 2023 / ESC 2023 criteria, finding by finding
   VegetationTOE    measure a mobile tricuspid vegetation on TOE
   ChestCT          scroll the CT: cavitating septic pulmonary emboli
   AntibioticPlanner drug, add-on, duration and oral step-down
   CultureCourse    surveillance cultures and the day the clock starts
   RAPressure       right atrial pressure: the ventricularised cv-wave
   VegAspiration    percutaneous aspiration (debulking) under TOE
   LungUltrasound   sliding, seashore, barcode
   ============================================================ */

const MONO = '"JetBrains Mono", ui-monospace, monospace';

/* ---------- tricuspid regurgitation at the bedside ---------- */

const MURMURS = {
  tr: {
    name: 'Her murmur — tricuspid regurgitation',
    site: 'Left lower sternal edge; little radiation; liver may pulsate',
    insp: 0.75, jvp: 'cv',
    notes: [
      'Holosystolic, soft, blowing — LOUDER on inspiration (Carvallo’s sign)',
      'JVP: the x-descent is gone; a giant cv-wave rises in systole, then a sharp y-descent',
      'Inspiration sucks more blood into the right heart: more to leak back',
    ],
  },
  mr: {
    name: 'Compare — mitral regurgitation',
    site: 'Apex → axilla',
    insp: 0, jvp: 'normal',
    notes: [
      'Holosystolic, but NO louder on inspiration — the left heart fills from the lungs, not the veins',
      'JVP normal: a, c, x, v, y',
      'Same murmur shape, different chamber — breathing tells them apart',
    ],
  },
};

export function TRMurmur() {
  const [key, setKey] = useState('tr');
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  const audio = useRef(null);
  const L = MURMURS[key];
  const S = useRef({}); S.current = { L, key };
  const HRm = 104, beat = 60 / HRm, resp = 4.2;   // seconds

  useCanvas(ref, 260, (g, w, h, t) => {
    const { L: les } = S.current;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const span = 6, X = s => 40 + (s / span) * (w - 50);
    const rows = { resp: 34, pcg: 120, jvp: 214 };
    g.font = `600 10px ${MONO}`; g.fillStyle = '#6A7F9B';
    g.fillText('BREATH', 2, rows.resp - 18); g.fillText('PCG', 2, rows.pcg - 40); g.fillText('JVP', 2, rows.jvp - 34);
    const insp = s => Math.max(0, Math.sin(((s % resp) / resp) * Math.PI * 2));   // 0..1 in inspiration
    // respiration
    g.strokeStyle = '#22D3EE'; g.lineWidth = 1.5; g.beginPath();
    for (let px = 40; px < w - 10; px++) {
      const s = t - span + (px - 40) / (w - 50) * span;
      const y = rows.resp - Math.sin(((s % resp) / resp) * Math.PI * 2) * 14;
      px === 40 ? g.moveTo(px, y) : g.lineTo(px, y);
    }
    g.stroke();
    // phonocardiogram
    for (let px = 40; px < w - 10; px++) {
      const s = t - span + (px - 40) / (w - 50) * span;
      const x = ((s % beat) + beat) % beat / beat;          // 0..1 in the beat
      let a = 0;
      if (x < 0.05) a = 0.9;                                 // S1
      else if (x > 0.38 && x < 0.42) a = 0.7;                // S2
      else if (x >= 0.05 && x <= 0.38) a = 0.38 * (1 + les.insp * insp(s));   // holosystolic plateau
      if (a) {
        const amp = a * 34 * (0.55 + Math.random() * 0.45);
        g.fillStyle = x < 0.05 || x > 0.38 ? '#E9F2FC' : '#F5C451';
        g.fillRect(px, rows.pcg - amp, 1, amp * 2);
      }
    }
    // jugular venous pulse
    g.strokeStyle = '#A78BFA'; g.lineWidth = 2; g.beginPath();
    for (let px = 40; px < w - 10; px++) {
      const s = t - span + (px - 40) / (w - 50) * span;
      const x = ((s % beat) + beat) % beat / beat;
      let p;
      if (les.jvp === 'cv') {
        p = x < 0.08 ? 0.35 + 0.15 * Math.sin(x / 0.08 * Math.PI) : x < 0.42 ? 0.35 + 0.6 * Math.sin((x - 0.08) / 0.34 * Math.PI / 2) : x < 0.55 ? 0.95 - 0.85 * (x - 0.42) / 0.13 : 0.1 + (x - 0.55) * 0.55;
      } else {
        p = x < 0.08 ? 0.3 + 0.35 * Math.sin(x / 0.08 * Math.PI) : x < 0.13 ? 0.3 + 0.12 * Math.sin((x - 0.08) / 0.05 * Math.PI) : x < 0.3 ? 0.3 - 0.22 * Math.sin((x - 0.13) / 0.17 * Math.PI) : x < 0.45 ? 0.15 + 0.3 * (x - 0.3) / 0.15 : x < 0.6 ? 0.45 - 0.3 * (x - 0.45) / 0.15 : 0.15 + (x - 0.6) * 0.35;
      }
      const y = rows.jvp - p * 44 + insp(s) * (les.jvp === 'cv' ? 0 : 4);
      px === 40 ? g.moveTo(px, y) : g.lineTo(px, y);
    }
    g.stroke();
    g.fillStyle = '#A78BFA'; g.font = `700 11px ${MONO}`;
    g.fillText(les.jvp === 'cv' ? 'giant cv-wave · no x-descent' : 'a · c · x · v · y', w - 210, rows.jvp - 42);
    g.fillStyle = '#F5C451'; g.fillText(les.insp ? 'murmur ↑ with inspiration' : 'no respiratory change', w - 210, rows.pcg - 42);
  }, []);

  // a synthesised murmur: S1, a band of filtered noise through systole, S2
  useEffect(() => {
    if (!playing) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    audio.current = ctx;
    const len = ctx.sampleRate * 0.4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const thump = (at, f, v) => {
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.frequency.value = f; gn.gain.setValueAtTime(0, at); gn.gain.linearRampToValueAtTime(v, at + 0.01); gn.gain.exponentialRampToValueAtTime(0.001, at + 0.09);
      o.connect(gn).connect(ctx.destination); o.start(at); o.stop(at + 0.1);
    };
    let next = ctx.currentTime + 0.1;
    const t0 = performance.now() / 1000;
    const tick = () => {
      while (next < ctx.currentTime + 0.5) {
        const sec = (performance.now() / 1000 - t0) + (next - ctx.currentTime);
        const insp = Math.max(0, Math.sin(((sec % resp) / resp) * Math.PI * 2));
        const loud = 0.1 * (1 + MURMURS[S.current.key].insp * insp);
        thump(next, 55, 0.5);
        const src = ctx.createBufferSource(); src.buffer = buf;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 260; bp.Q.value = 1.4;
        const gn = ctx.createGain();
        gn.gain.setValueAtTime(0, next + 0.04); gn.gain.linearRampToValueAtTime(loud, next + 0.07);
        gn.gain.setValueAtTime(loud, next + beat * 0.36); gn.gain.linearRampToValueAtTime(0, next + beat * 0.38);
        src.connect(bp).connect(gn).connect(ctx.destination); src.start(next + 0.04); src.stop(next + beat * 0.4);
        thump(next + beat * 0.4, 75, 0.35);
        next += beat;
      }
    };
    tick();
    const id = setInterval(tick, 150);
    return () => { clearInterval(id); ctx.close(); audio.current = null; };
  }, [playing]); // eslint-disable-line

  return (
    <div className="cs-card tight">
      <div className="cs-ctrls" style={{ marginTop: 0, marginBottom: 10 }}>
        {Object.entries(MURMURS).map(([k, m]) => <button key={k} className={'cs-chip' + (key === k ? ' on' : '')} onClick={() => setKey(k)}>{m.name}</button>)}
        <button className="cs-btn" onClick={() => setPlaying(p => !p)} style={{ marginLeft: 'auto' }}>{playing ? '■ Stop' : '🔊 Listen'}</button>
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 260 }} aria-label="Phonocardiogram, respiration and jugular venous pulse" /></div>
      <p className="cs-pts" style={{ marginTop: 8 }}>{L.site}</p>
      <ul className="cs-ul" style={{ marginBottom: 0 }}>{L.notes.map(n => <li key={n} className="cs-li">{n}</li>)}</ul>
    </div>
  );
}

/* ---------- blood-culture bottles incubating ---------- */

const BOTTLES = [
  { set: 'Set 1 · L antecubital', time: '02:30', ttp: { aer: 11, ana: 13 } },
  { set: 'Set 2 · R antecubital', time: '02:45', ttp: { aer: 12, ana: 14 } },
  { set: 'Set 3 · R hand', time: '03:05', ttp: { aer: 11, ana: 15 } },
];

export function CultureIncubator({ onDone }) {
  const [hrs, setHrs] = useState(0);
  const pos = BOTTLES.flatMap(b => [b.ttp.aer, b.ttp.ana]).filter(x => x <= hrs).length;
  const all = pos === 6;
  useEffect(() => { if (all) onDone?.(); }, [all]); // eslint-disable-line
  return (
    <div className="cs-card tight">
      <div className="cs-pts" style={{ marginBottom: 8 }}>🧫 Automated incubator · scrub through the first 48 hours</div>
      <div className="cs-grid3">
        {BOTTLES.map(b => (
          <div key={b.set} className="cs-card tight" style={{ marginBottom: 0 }}>
            <b style={{ fontSize: 14 }}>{b.set}</b>
            <div className="cs-pts">drawn {b.time} · 10 mL per bottle</div>
            <div className="cs-row" style={{ marginTop: 10, justifyContent: 'center', gap: 18 }}>
              {['aer', 'ana'].map(k => {
                const on = b.ttp[k] <= hrs;
                return (
                  <svg key={k} width="44" height="86" viewBox="0 0 44 86" role="img" aria-label={`${k === 'aer' ? 'Aerobic' : 'Anaerobic'} bottle ${on ? 'positive' : 'no growth'}`}>
                    <rect x="14" y="2" width="16" height="10" rx="3" fill={k === 'aer' ? '#3B82F6' : '#A855F7'} />
                    <rect x="6" y="12" width="32" height="70" rx="9" fill="#0B1525" stroke="#2B4366" strokeWidth="2" />
                    <rect x="9" y="40" width="26" height="39" rx="6" fill={on ? '#F5C451' : '#5C3A1A'} opacity={on ? 0.95 : 0.7} />
                    <circle cx="22" cy="73" r="4" fill={on ? '#FF4D6D' : '#34E39A'} />
                    <text x="22" y="30" textAnchor="middle" fontSize="9" fill="#C9D6E6" fontFamily="JetBrains Mono, monospace">{k === 'aer' ? 'AER' : 'ANA'}</text>
                  </svg>
                );
              })}
            </div>
            <div className="cs-pts" style={{ textAlign: 'center', marginTop: 4 }}>
              {b.ttp.aer <= hrs ? `flagged at ${b.ttp.aer} h` : 'no growth yet'}
            </div>
          </div>
        ))}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Hours in the incubator
          <input type="range" min="0" max="48" step="1" value={hrs} onChange={e => setHrs(+e.target.value)} style={{ width: '100%' }} aria-label="Hours of incubation" />
        </label>
        <b className="cs-mono" style={{ color: 'var(--gold)' }}>{hrs} h</b>
      </div>
      <div className="cs-readout">
        <div><span>Bottles positive</span><b style={{ color: pos ? 'var(--red)' : undefined }}>{pos} / 6</b></div>
        <div><span>Shortest TTP</span><b>{hrs >= 11 ? '11 h' : '—'}</b></div>
        <div><span>Gram stain</span><b style={{ fontSize: 14 }}>{hrs >= 11 ? 'Gram + cocci in clusters' : 'pending'}</b></div>
        <div><span>Identification</span><b style={{ fontSize: 14 }}>{hrs >= 18 ? 'S. aureus · mecA PCR negative (MSSA)' : 'pending'}</b></div>
      </div>
      {all && <p className="cs-pts" style={{ marginTop: 8, color: 'var(--red)' }}>Six of six bottles, three separate venepunctures, all positive within 15 hours: continuous, high-grade bacteraemia. A single contaminated bottle never looks like this.</p>}
    </div>
  );
}

/* ---------- Duke-ISCID 2023 / ESC 2023 builder ---------- */

export const DUKE_FINDINGS = [
  { id: 'bc', label: 'S. aureus in 3 of 3 separate blood-culture sets', truth: 'major', cat: 'Microbiology', why: 'A typical organism in ≥ 2 separate sets: MAJOR microbiological criterion.' },
  { id: 'veg', label: 'Echo: 21 mm mobile mass on the tricuspid valve', truth: 'major', cat: 'Imaging', why: 'A vegetation on echo (or cardiac CT): MAJOR imaging criterion.' },
  { id: 'pwid', label: 'Injects drugs', truth: 'minor', cat: 'Predisposition', why: 'Injection drug use is a predisposition — MINOR.' },
  { id: 'fever', label: 'Temperature 39.6 °C', truth: 'minor', cat: 'Fever', why: 'Fever > 38.0 °C — MINOR.' },
  { id: 'spe', label: 'Cavitating septic pulmonary infarcts on CT', truth: 'minor', cat: 'Vascular', why: 'Septic pulmonary infarcts are vascular phenomena — MINOR. Imaging-detected emboli count, even if silent.' },
  { id: 'gn', label: 'Haematuria, proteinuria and a low C3', truth: 'minor', cat: 'Immunological', why: 'Immune-complex glomerulonephritis — MINOR (immunological).' },
  { id: 'rf', label: 'Rheumatoid factor positive', truth: 'minor', cat: 'Immunological', why: 'Also immunological — but the SAME category as the glomerulonephritis: a category counts once.' },
  { id: 'crp', label: 'CRP 240 mg/L, WCC 18', truth: 'none', cat: null, why: 'Inflammation is not a Duke criterion — every sepsis has it.' },
  { id: 'plt', label: 'Platelets 98 × 10⁹/L', truth: 'none', cat: null, why: 'Not a criterion.' },
  { id: 'murm', label: 'A new murmur louder on inspiration', truth: 'none', cat: null, why: 'Auscultated new regurgitation counts (minor, 2023) only when echo is NOT available. Echo has answered the question.' },
];

export function DukeBuilder({ onResult, done }) {
  const [calls, setCalls] = useState(done?.calls || {});
  const submitted = !!done;
  const set = (id, v) => !submitted && setCalls(c => ({ ...c, [id]: v }));
  const all = DUKE_FINDINGS.every(f => calls[f.id]);
  const majors = new Set(DUKE_FINDINGS.filter(f => calls[f.id] === 'major').map(f => f.id));
  const minorCats = new Set(DUKE_FINDINGS.filter(f => calls[f.id] === 'minor').map(f => f.cat || f.id));
  const M = majors.size, m = minorCats.size;
  const verdict = (M >= 2 || (M === 1 && m >= 3) || m >= 5) ? 'DEFINITE IE' : ((M === 1 && m >= 1) || m >= 3) ? 'POSSIBLE IE' : 'REJECTED / not met';
  const correct = DUKE_FINDINGS.filter(f => calls[f.id] === f.truth).length;
  const submit = () => onResult?.({ calls, correct, verdict });
  return (
    <div className="cs-card tight">
      <div className="cs-pts" style={{ marginBottom: 8 }}>🧩 Call each finding: MAJOR, MINOR, or not a criterion. The tally builds as you go.</div>
      <div className="cs-opts">
        {DUKE_FINDINGS.map(f => {
          const c = calls[f.id];
          const ok = submitted && c === f.truth;
          return (
            <div key={f.id} className={'cs-opt' + (submitted ? (ok ? ' best' : ' wrong') : '')} style={{ flexWrap: 'wrap' }}>
              <span style={{ flex: '1 1 260px' }}>{f.label}
                {submitted && <span className="cs-opt-why">{ok ? '✓ ' : `✗ It is ${f.truth === 'none' ? 'not a criterion' : f.truth.toUpperCase()}. `}{f.why}</span>}
              </span>
              <span className="cs-row" style={{ gap: 6 }}>
                {['major', 'minor', 'none'].map(v => (
                  <button key={v} className={'cs-chip' + (c === v ? ' on' : '')} onClick={() => set(f.id, v)} disabled={submitted} data-duke={`${f.id}-${v}`}>
                    {v === 'none' ? 'not a criterion' : v}
                  </button>
                ))}
              </span>
            </div>
          );
        })}
      </div>
      <div className="cs-readout">
        <div><span>Major criteria</span><b>{M}</b></div>
        <div><span>Minor categories</span><b>{m}</b></div>
        <div><span>Classification</span><b style={{ fontSize: 15, color: verdict.startsWith('DEF') ? 'var(--red)' : 'var(--gold)' }}>{verdict}</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Definite: 2 major · 1 major + 3 minor · 5 minor. Possible: 1 major + 1 minor · 3 minor. Minor criteria count by CATEGORY.</p>
      {!submitted
        ? <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" onClick={submit} disabled={!all}>Classify her</button></div>
        : <div className="cs-fb best" style={{ marginTop: 10 }}>{correct} / {DUKE_FINDINGS.length} findings called correctly. With both majors she is DEFINITE on day 1 — the minors are not needed, but they describe the disease she has.</div>}
    </div>
  );
}

/* ---------- TOE: measure the vegetation ---------- */

export const VEG_TRUE = 24;
export const vegApparent = p => VEG_TRUE * (0.6 + 0.4 * Math.pow(Math.sin(Math.PI * p), 2));

/**
 * Mid-oesophageal RV inflow view. The vegetation flops on the atrial side
 * of the anterior tricuspid leaflet; its apparent length changes through
 * the cycle as it swings in and out of the plane. Freeze a frame, run
 * the caliper, measure. onMeasure({ len, frame, apparent, good })
 */
export function VegetationTOE({ onMeasure, done }) {
  const ref = useRef(null);
  const [frozen, setFrozen] = useState(false);
  const [frame, setFrame] = useState(0.15);
  const [cal, setCal] = useState(12);
  const S = useRef({}); S.current = { frozen, frame, cal };
  useCanvas(ref, 320, (g, w, h, t) => {
    const st = S.current;
    const p = st.frozen ? st.frame : (t * 0.8) % 1;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = 6, R = h * 1.08;
    g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, Math.PI * 0.5 - 0.68, Math.PI * 0.5 + 0.68); g.closePath(); g.clip();
    for (let i = 0; i < 2400; i++) { const a = Math.PI / 2 + (Math.random() - 0.5) * 1.36, rr = Math.random() * R; g.fillStyle = `rgba(190,190,190,${Math.random() * 0.1})`; g.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2, 2); }
    const mm = h / 120;                                    // pixels per mm
    const ay = h * 0.56, ax = cx - 18;                      // tricuspid annulus plane, attachment point
    // walls: RA above, RV below
    g.strokeStyle = 'rgba(200,200,200,0.55)'; g.lineWidth = 7;
    g.beginPath(); g.ellipse(cx, ay - 32 * mm, 40 * mm, 26 * mm, 0, Math.PI * 0.08, Math.PI * 0.92, true); g.stroke();
    g.beginPath(); g.ellipse(cx, ay + 34 * mm, 42 * mm, 33 * mm, 0, Math.PI * 1.08, Math.PI * 1.92, true); g.stroke();
    const sys = p < 0.4;
    // leaflets
    g.strokeStyle = 'rgba(235,235,235,0.9)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(cx - 34 * mm, ay - 2 * mm); g.quadraticCurveTo(cx - 20 * mm, ay + (sys ? 1 : 10) * mm, ax, ay + (sys ? 0 : 16) * mm); g.stroke();
    g.beginPath(); g.moveTo(cx + 34 * mm, ay - 2 * mm); g.quadraticCurveTo(cx + 18 * mm, ay + (sys ? 1 : 10) * mm, ax + 8 * mm, ay + (sys ? 0 : 16) * mm); g.stroke();
    // vegetation: attached at the leaflet tip, swinging RA (systole) ↔ RV (diastole)
    const base = { x: ax, y: ay + (sys ? 0 : 16) * mm };
    const ang = -Math.PI / 2 - 0.5 + Math.sin(Math.PI * p) * 0.9 + (sys ? 0 : Math.PI * 0.95);
    const L = vegApparent(p) * mm;
    g.save(); g.translate(base.x, base.y); g.rotate(ang);
    const grd = g.createLinearGradient(0, 0, L, 0); grd.addColorStop(0, 'rgba(230,230,230,0.95)'); grd.addColorStop(1, 'rgba(160,160,160,0.75)');
    g.fillStyle = grd; g.beginPath(); g.moveTo(0, -3 * mm);
    g.bezierCurveTo(L * 0.3, -6 * mm, L * 0.7, -4.5 * mm + Math.sin(t * 9) * mm, L, -1 * mm);
    g.bezierCurveTo(L * 1.03, 1 * mm, L * 0.75, 5 * mm, L * 0.35, 4 * mm); g.bezierCurveTo(L * 0.15, 3.5 * mm, 0, 3 * mm, 0, 3 * mm); g.fill();
    // caliper along the vegetation's axis
    g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(0, 0); g.lineTo(st.cal * mm, 0); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.moveTo(st.cal * mm, -6); g.lineTo(st.cal * mm, 6); g.moveTo(0, -6); g.lineTo(0, 6); g.stroke();
    g.restore();
    g.restore();
    g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`; g.fillText(`caliper ${st.cal.toFixed(1)} mm`, 12, h - 14);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText('TOE · ME RV inflow · 2D', 10, 16); g.fillText('RA', cx - 6, ay - 36 * mm); g.fillText('RV', cx - 6, ay + 40 * mm);
    g.fillText(st.frozen ? `FROZEN · frame ${Math.round(st.frame * 100)}` : 'LIVE', w - 140, 16);
    // 10 mm scale
    g.strokeStyle = '#E9F2FC'; g.lineWidth = 2; g.beginPath(); g.moveTo(w - 30, h - 20); g.lineTo(w - 30, h - 20 - 10 * mm); g.stroke();
    g.fillStyle = '#E9F2FC'; g.fillText('10 mm', w - 78, h - 22 - 5 * mm);
    // phase marker
    g.fillStyle = sys ? '#FF4D6D' : '#22D3EE'; g.fillText(sys ? 'SYSTOLE → into RA' : 'DIASTOLE → into RV', 12, 34);
  }, []);
  const apparent = vegApparent(frame);
  const good = frozen && Math.abs(cal - VEG_TRUE) <= 2 && apparent >= VEG_TRUE - 1.5;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 320 }} aria-label="Transoesophageal echo of a tricuspid vegetation" /></div>
      <div className="cs-ctrls">
        <button className={'cs-chip' + (!frozen ? ' on' : '')} onClick={() => setFrozen(false)}>▶ Live loop</button>
        <button className={'cs-chip' + (frozen ? ' on' : '')} onClick={() => setFrozen(true)}>⏸ Freeze</button>
        <label className="cs-slider" style={{ flex: 1 }}>Frame
          <input type="range" min="0" max="1" step="0.01" value={frame} onChange={e => { setFrozen(true); setFrame(+e.target.value); }} style={{ width: '100%' }} aria-label="Cine frame" />
        </label>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Caliper length
          <input type="range" min="4" max="36" step="0.5" value={cal} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="Caliper length in millimetres" />
        </label>
        <button className="cs-btn primary" disabled={!!done} onClick={() => onMeasure?.({ len: cal, frame, apparent, frozen, good })}>📏 Measure</button>
      </div>
      <div className="cs-readout">
        <div><span>Your length</span><b style={{ color: cal > 20 ? 'var(--red)' : cal > 10 ? 'var(--gold)' : undefined }}>{cal.toFixed(1)} mm</b></div>
        <div><span>&gt; 10 mm</span><b style={{ fontSize: 14 }}>higher embolic risk</b></div>
        <div><span>&gt; 20 mm</span><b style={{ fontSize: 14 }}>right-sided threshold with recurrent emboli</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>A vegetation swings in and out of the imaging plane. Scroll the frames, find where it is LONGEST, and measure base to tip along its axis.</p>
    </div>
  );
}

/* ---------- CT chest: septic emboli ---------- */

const NODULES = [
  // [slice, x (−1..1 across chest), y (0..1), r, cavitated]
  [1, -0.72, 0.38, 9, false], [1, 0.66, 0.52, 7, false],
  [2, -0.78, 0.55, 12, true], [2, 0.7, 0.3, 6, false], [2, 0.38, 0.72, 8, true],
  [3, -0.6, 0.72, 10, true], [3, 0.76, 0.6, 13, true], [3, -0.82, 0.3, 6, false],
  [4, 0.62, 0.78, 9, true], [4, -0.7, 0.45, 8, false], [4, -0.45, 0.82, 11, true],
  [5, 0.8, 0.5, 7, false], [5, -0.76, 0.66, 9, true],
];
const CT_SLICES = ['Apices', 'Aortic arch', 'Carina', 'Lower lobes', 'Bases'];

export function ChestCT() {
  const ref = useRef(null);
  const [slice, setSlice] = useState(3);
  const S = useRef({}); S.current = { slice };
  useCanvas(ref, 300, (g, w, h) => {
    const s = S.current.slice;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2 + 6, bw = Math.min(w * 0.46, 260), bh = 120;
    g.fillStyle = '#6B6B6B'; g.beginPath(); g.ellipse(cx, cy, bw, bh, 0, 0, Math.PI * 2); g.fill();            // soft tissue
    g.fillStyle = '#0E0E0E';
    g.beginPath(); g.ellipse(cx - bw * 0.48, cy - 4, bw * 0.4, bh * 0.78, 0, 0, Math.PI * 2); g.fill();        // right lung (patient's right = viewer's left)
    g.beginPath(); g.ellipse(cx + bw * 0.48, cy - 4, bw * 0.4, bh * 0.78, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8A8A8A'; g.beginPath(); g.ellipse(cx, cy - 6, bw * 0.16, bh * 0.5, 0, 0, Math.PI * 2); g.fill();   // mediastinum
    g.fillStyle = '#D8D8D8'; g.beginPath(); g.arc(cx, cy + bh * 0.72, 12, 0, Math.PI * 2); g.fill();          // vertebra
    // vessels
    g.strokeStyle = 'rgba(150,150,150,0.5)'; g.lineWidth = 1.2;
    for (let i = 0; i < 18; i++) { const sd = i < 9 ? -1 : 1, a = (i % 9) / 9; g.beginPath(); g.moveTo(cx + sd * bw * 0.18, cy - 4); g.lineTo(cx + sd * bw * (0.35 + a * 0.45), cy - bh * 0.6 + a * bh * 1.15); g.stroke(); }
    for (const [sl, x, y, r, cav] of NODULES) {
      if (sl !== s) continue;
      const nx = cx + x * bw, ny = cy - bh * 0.7 + y * bh * 1.35;
      g.strokeStyle = 'rgba(190,190,190,0.8)'; g.lineWidth = 1.4;                                                // feeding vessel
      g.beginPath(); g.moveTo(nx - Math.sign(x) * r * 3.2, ny - r * 0.5); g.lineTo(nx, ny); g.stroke();
      g.fillStyle = '#BEBEBE'; g.beginPath(); g.arc(nx, ny, r, 0, Math.PI * 2); g.fill();
      if (cav) { g.fillStyle = '#0A0A0A'; g.beginPath(); g.arc(nx + 1, ny - 1, r * 0.55, 0, Math.PI * 2); g.fill(); }
    }
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText(`CT chest · axial · lung window · ${CT_SLICES[s - 1]}`, 10, 16);
    g.fillText('R', 12, h / 2); g.fillText('L', w - 18, h / 2);
  }, []);
  const here = NODULES.filter(n => n[0] === slice);
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 300 }} aria-label="CT chest axial slice" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Scroll the slices
          <input type="range" min="1" max="5" step="1" value={slice} onChange={e => setSlice(+e.target.value)} style={{ width: '100%' }} aria-label="CT slice" />
        </label>
        <b className="cs-mono" style={{ color: 'var(--gold)' }}>{CT_SLICES[slice - 1]}</b>
      </div>
      <div className="cs-readout">
        <div><span>Nodules on this slice</span><b>{here.length}</b></div>
        <div><span>Cavitating</span><b style={{ color: 'var(--red)' }}>{here.filter(n => n[4]).length}</b></div>
        <div><span>Whole scan</span><b>{NODULES.length} · {NODULES.filter(n => n[4]).length} cavitating</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Peripheral, lower-zone predominant, different sizes (= different ages, = repeated showers), cavitating, each at the end of a vessel: the “feeding vessel sign”.</p>
    </div>
  );
}

/* ---------- antibiotic plan builder ---------- */

const ABX = {
  drug: {
    label: 'Backbone (MSSA)',
    opts: [
      { id: 'fluclox', t: 'Flucloxacillin 2 g IV 4-hourly (12 g/day)', ok: 'best', why: 'An anti-staphylococcal penicillin: the fastest killer of MSSA. ESC 2023 dose 12 g/day in 4–6 doses.' },
      { id: 'cefaz', t: 'Cefazolin 2 g IV 8-hourly (6 g/day)', ok: 'best', why: 'Equivalent for MSSA, three doses a day, fewer kidney and liver effects; the choice for non-severe penicillin allergy.' },
      { id: 'vanc', t: 'Vancomycin 15–20 mg/kg IV 12-hourly', ok: 'wrong', why: 'Slower killing and more failure in MSSA. Vancomycin is for MRSA or true severe β-lactam allergy.' },
      { id: 'cftx', t: 'Ceftriaxone 2 g IV daily', ok: 'wrong', why: 'Weaker against S. aureus and not a recommended regimen for staphylococcal IE.' },
    ],
  },
  add: {
    label: 'Add-on',
    opts: [
      { id: 'none', t: 'Nothing — β-lactam alone', ok: 'best', why: 'For native-valve S. aureus IE, neither gentamicin nor rifampicin is recommended routinely (ESC 2023).' },
      { id: 'gent', t: 'Gentamicin “for synergy”', ok: 'wrong', why: 'No survival benefit in staphylococcal native-valve IE; real kidney damage. Dropped from the guidelines.' },
      { id: 'rif', t: 'Rifampicin from day 1', ok: 'wrong', why: 'Reserved for prosthetic material. Started into a bacteraemia it breeds resistance — and it slashes methadone levels.' },
    ],
  },
  dur: {
    label: 'Duration',
    opts: [
      { id: '2', t: '2 weeks (short right-sided regimen)', ok: 'wrong', why: 'Only for UNCOMPLICATED right-sided MSSA IE: vegetation < 20 mm, no empyema or metastatic infection, rapid response. Hers is 24 mm with cavitating emboli and persistent bacteraemia.' },
      { id: '6', t: '4–6 weeks, counted from the first negative culture', ok: 'best', why: 'Native-valve S. aureus IE: 4–6 weeks; with her complications, aim for 6.' },
      { id: '12', t: '12 weeks to be safe', ok: 'wrong', why: 'No benefit; more line infection, more toxicity, more time away from her life.' },
    ],
  },
  oral: {
    label: 'Route after the first phase',
    opts: [
      { id: 'poet', t: 'Plan a partial oral switch after ≥ 10 days IV if she meets the POET criteria', ok: 'best', why: 'POET: stable, afebrile, cultures negative, CRP falling, no abscess on TOE → two well-absorbed oral drugs were non-inferior. Evidence is from left-sided IE with few PWID: an extrapolation, but far better than a patient who leaves with nothing.' },
      { id: 'iv', t: 'IV only, whatever happens — no oral option ever', ok: 'ok', why: 'Defensible while she is unstable; as a blanket rule it pushes people to leave against advice.' },
      { id: 'none', t: 'No PICC and no oral plan because she injects', ok: 'wrong', why: 'Punitive, not evidence-based — and it is how people end up with no treatment at all.' },
    ],
  },
};

export function AntibioticPlanner({ onResult, done }) {
  const [plan, setPlan] = useState(done?.plan || {});
  const submitted = !!done;
  const pick = (k, id) => !submitted && setPlan(p => ({ ...p, [k]: id }));
  const ready = Object.keys(ABX).every(k => plan[k]);
  const grade = k => ABX[k].opts.find(o => o.id === plan[k])?.ok;
  const pts = Object.keys(ABX).reduce((n, k) => n + (grade(k) === 'best' ? 4 : grade(k) === 'ok' ? 2 : 0), 0);
  return (
    <div className="cs-card tight">
      <div className="cs-pts" style={{ marginBottom: 8 }}>💊 Build her prescription — one choice per row</div>
      {Object.entries(ABX).map(([k, row]) => (
        <div key={k} style={{ marginBottom: 12 }}>
          <div className="cs-h2" style={{ margin: '6px 0 8px', fontSize: 11 }}>{row.label}</div>
          <div className="cs-opts">
            {row.opts.map(o => {
              const on = plan[k] === o.id;
              const cls = !submitted ? (on ? 'sel' : '') : on ? o.ok : o.ok === 'best' ? 'best dim' : 'dim';
              return (
                <button key={o.id} className={'cs-opt ' + cls} onClick={() => pick(k, o.id)} disabled={submitted} data-abx={`${k}-${o.id}`}>
                  <span className="cs-opt-k">{on ? '✓' : ''}</span>
                  <span>{o.t}{submitted && <span className="cs-opt-why">{o.why}</span>}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted
        ? <button className="cs-btn primary" disabled={!ready} onClick={() => onResult?.({ plan, pts })}>Sign the prescription</button>
        : <div className={'cs-fb ' + (done.pts === 16 ? 'best' : 'ok')}>{done.pts} / 16 · {done.pts === 16 ? 'A plan an endocarditis team would sign.' : 'Look at the rows in red and amber.'}</div>}
    </div>
  );
}

/* ---------- surveillance cultures ---------- */

// day 1 = admission. Positive until the debulking on day 7; negative from day 8.
const POSITIVE_UNTIL = 7;

export function CultureCourse({ onResult, done }) {
  const [drawn, setDrawn] = useState(done?.drawn || [1]);
  const [revealed, setRevealed] = useState(!!done);
  const [start, setStart] = useState(done?.start || null);
  const days = Array.from({ length: 12 }, (_, i) => i + 1);
  const toggle = d => !revealed && d > 1 && setDrawn(x => x.includes(d) ? x.filter(y => y !== d) : [...x, d].sort((a, b) => a - b));
  const sorted = [...drawn].sort((a, b) => a - b);
  const gaps = sorted.slice(1).map((d, i) => d - sorted[i]);
  const firstNeg = sorted.find(d => d > POSITIVE_UNTIL);
  const negAfter = sorted.filter(d => d > POSITIVE_UNTIL).length;
  // repeat within 48–72 h, never more than 72 h apart until clear, and a negative set soon after the debulking
  const untilClear = sorted.filter(d => !firstNeg || d <= firstNeg);
  const surveillanceOk = (sorted.includes(2) || sorted.includes(3)) && !!firstNeg && firstNeg <= 9 && negAfter >= 1
    && untilClear.every((d, i) => i === 0 || d - untilClear[i - 1] <= 3) && gaps.length > 0;
  const finish = () => onResult?.({ drawn: sorted, start, surveillanceOk, startOk: start === firstNeg });
  return (
    <div className="cs-card tight">
      <div className="cs-pts" style={{ marginBottom: 8 }}>🩸 Day 1 cultures were taken. Tap the days you would repeat a pair of sets — then reveal.</div>
      <div className="cs-row" style={{ gap: 6 }}>
        {days.map(d => {
          const on = sorted.includes(d);
          const res = revealed && on ? (d <= POSITIVE_UNTIL ? 'pos' : 'neg') : null;
          return (
            <button key={d} className={'cs-chip' + (on ? ' on' : '')} onClick={() => (revealed ? setStart(d) : toggle(d))} data-day={d}
              style={{ minWidth: 64, justifyContent: 'center', borderColor: res === 'pos' ? 'var(--red)' : res === 'neg' ? 'var(--green)' : start === d ? 'var(--gold)' : undefined }}>
              D{d}{res === 'pos' ? ' ✚' : res === 'neg' ? ' ○' : ''}{start === d ? ' ★' : ''}
            </button>
          );
        })}
      </div>
      <div className="cs-row" style={{ marginTop: 6 }}>
        <span className="cs-pts">D7 = aspiration debulking. ✚ = S. aureus grown · ○ = no growth at 5 days · ★ = day 1 of the antibiotic count</span>
      </div>
      {!revealed ? (
        <div className="cs-row" style={{ marginTop: 10 }}><button className="cs-btn primary" onClick={() => setRevealed(true)} disabled={sorted.length < 3}>🔬 Reveal the results</button></div>
      ) : (
        <>
          <p className="cs-p" style={{ marginTop: 10, fontSize: 15 }}>{firstNeg ? `First negative set: day ${firstNeg}.` : 'You never drew a set after the debulking — you cannot know she has cleared.'} Now tap the day that counts as <b>day 1 of her 6 weeks</b>.</p>
          {!done && <button className="cs-btn primary" onClick={finish} disabled={!start}>Confirm the count</button>}
          {done && <div className={'cs-fb ' + (done.surveillanceOk && done.startOk ? 'best' : 'ok')}>
            {done.surveillanceOk ? 'Cultures every 24–48 h until negative, then one to confirm: you documented clearance.' : 'Repeat cultures every 24–72 h until they are negative — a gap hides persistent bacteraemia, and no post-procedure set means no proof of clearance.'}{' '}
            {done.startOk ? 'And the clock starts at the first negative culture — right.' : `The clock starts at the first NEGATIVE culture (day ${firstNeg || 8}), not at admission.`}
          </div>}
        </>
      )}
    </div>
  );
}

/* ---------- right atrial pressure ---------- */

const RA_MODES = {
  normal: { label: 'Normal RA', a: 7, v: 6, mean: 4, cv: false, note: 'a > v, a clear x-descent: the atrium relaxes while the closed tricuspid valve is pulled down.' },
  tr: { label: 'Her RA · severe TR', a: 15, v: 28, mean: 17, cv: true, note: 'The x-descent is filled in by the leak; a giant cv-wave rises in systole — the RA is “ventricularised”. Torrential TR jets can be slow (low Vmax): wide-open orifice, pressures equalise.' },
  post: { label: 'After debulking', a: 11, v: 16, mean: 11, cv: true, note: 'Less volume, smaller cv-wave. The TR is now moderate: the leaflet survived the aspiration.' },
};

export function RAPressure({ initial = 'tr' }) {
  const [mode, setMode] = useState(initial);
  const ref = useRef(null);
  const S = useRef({}); S.current = { P: RA_MODES[mode] };
  useCanvas(ref, 180, (g, w, h, t) => {
    const { P } = S.current;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    const Y = p => h - 16 - p / 36 * (h - 34);
    g.font = `10px ${MONO}`;
    for (const p of [0, 10, 20, 30]) { g.strokeStyle = '#13212D'; g.beginPath(); g.moveTo(30, Y(p)); g.lineTo(w, Y(p)); g.stroke(); g.fillStyle = '#3B4B5A'; g.fillText(p, 6, Y(p) + 3); }
    const f = x => {
      const b = P.mean - 3;
      if (x < 0.1) return b + (P.a - b) * Math.sin(x / 0.1 * Math.PI);
      if (P.cv) {
        if (x < 0.5) return b + (P.v - b) * Math.sin((x - 0.1) / 0.4 * Math.PI / 2);
        if (x < 0.62) return P.v - (P.v - b + 4) * ((x - 0.5) / 0.12);
        return b - 4 + (x - 0.62) * 10;
      }
      if (x < 0.15) return b + 1;
      if (x < 0.32) return b - 3 * Math.sin((x - 0.15) / 0.17 * Math.PI);
      if (x < 0.5) return b + (P.v - b) * ((x - 0.32) / 0.18);
      if (x < 0.62) return P.v - (P.v - b + 2) * ((x - 0.5) / 0.12);
      return b - 2 + (x - 0.62) * 5;
    };
    g.strokeStyle = '#FB923C'; g.lineWidth = 2; g.beginPath();
    for (let px = 30; px < w; px += 1.5) { const x = ((((t - (w - px) / 150) * 1.6) % 1) + 1) % 1; px === 30 ? g.moveTo(px, Y(f(x))) : g.lineTo(px, Y(f(x))); }
    g.stroke();
    g.fillStyle = '#FB923C'; g.font = `700 12px ${MONO}`; g.fillText(`RA · ${P.cv ? 'cv' : 'v'} ${P.v} · mean ${P.mean} mmHg`, Math.max(34, w - 260), 16);
  }, []);
  return (
    <div className="cs-card tight">
      <div className="cs-ctrls" style={{ marginTop: 0, marginBottom: 10 }}>
        {Object.entries(RA_MODES).map(([k, m]) => <button key={k} className={'cs-chip' + (mode === k ? ' on' : '')} onClick={() => setMode(k)}>{m.label}</button>)}
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 180 }} aria-label="Right atrial pressure" /></div>
      <p className="cs-pts" style={{ marginTop: 8 }}>{RA_MODES[mode].note}</p>
    </div>
  );
}

/* ---------- percutaneous aspiration of the vegetation ---------- */

/**
 * A large-bore funnel cannula comes down from the SVC (right internal
 * jugular access) into the RA. The vegetation sits on the atrial side
 * of the anterior leaflet. Steer the funnel (advance, deflect), then
 * suction. Engage the vegetation: it shrinks. Half-engage it: a piece
 * breaks off and embolises. Touch the leaflet: you suck the leaflet in.
 * onResult({ residual, damage, emboli, bursts })
 */
export const VA = { vegX: 0.34, leafY: 0.68 };   // vegetation lateral position (deflect units), leaflet plane (fraction of height)

export function aspirationGeometry(depth, defl, size) {
  // all in "cm" in a 10 cm tall field
  const tipX = defl * 3.2, tipY = 1 + depth * 6.6;
  const leaf = VA.leafY * 10, vegX = VA.vegX * 3.2;
  const top = leaf - size / 10 * 1.0;                 // vegetation top surface (cm)
  const lat = Math.abs(tipX - vegX);
  const touchesLeaflet = tipY > leaf - 0.25;
  const dTop = tipY - top;                            // + = tip below the vegetation's top
  const engaged = !touchesLeaflet && lat <= 0.5 && dTop >= -0.5 && dTop <= 0.6;
  const partial = !touchesLeaflet && !engaged && lat <= 1.1 && dTop >= -1.2 && dTop <= 0.9;
  return { tipX, tipY, leaf, vegX, top, lat, dTop, touchesLeaflet, engaged, partial };
}

export function VegAspiration({ onResult, done }) {
  const ref = useRef(null);
  const [depth, setDepth] = useState(0.2);
  const [defl, setDefl] = useState(0);
  const [size, setSize] = useState(24);
  const [damage, setDamage] = useState(0);
  const [emboli, setEmboli] = useState(0);
  const [bursts, setBursts] = useState(0);
  const [log, setLog] = useState([]);
  const [flash, setFlash] = useState(0);
  const geo = aspirationGeometry(depth, defl, size);
  const S = useRef({}); S.current = { depth, defl, size, damage, flash, geo };
  useCanvas(ref, 330, (g, w, h, t) => {
    const st = S.current, G = st.geo;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const cm = h / 10, cx = w / 2;
    const X = x => cx + x * cm, Yc = y => y * cm;
    // speckle
    for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(190,190,190,${Math.random() * 0.08})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    // RA walls and SVC
    g.strokeStyle = 'rgba(200,200,200,0.5)'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(X(-1.2), 0); g.lineTo(X(-1.2), Yc(1.2)); g.quadraticCurveTo(X(-4.4), Yc(2.5), X(-4.6), Yc(G.leaf)); g.stroke();
    g.beginPath(); g.moveTo(X(1.2), 0); g.lineTo(X(1.2), Yc(1.2)); g.quadraticCurveTo(X(4.4), Yc(2.5), X(4.6), Yc(G.leaf)); g.stroke();
    // leaflets (anterior on the right side of the screen carries the vegetation)
    const beat = Math.sin(t * 2 * Math.PI * 1.4);
    const leafDamaged = st.damage > 0;
    g.strokeStyle = leafDamaged ? 'rgba(255,120,120,0.9)' : 'rgba(235,235,235,0.9)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(X(-4.6), Yc(G.leaf)); g.quadraticCurveTo(X(-2), Yc(G.leaf + 0.2 + beat * 0.15), X(-0.2), Yc(G.leaf + 0.1)); g.stroke();
    g.beginPath(); g.moveTo(X(4.6), Yc(G.leaf)); g.quadraticCurveTo(X(2.4), Yc(G.leaf + 0.2 + beat * 0.15), X(0.2), Yc(G.leaf + 0.1 + (leafDamaged ? 0.6 + beat * 0.3 : 0))); g.stroke();
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText('TOE · modified bicaval / RV inflow', 10, 16); g.fillText('RA', X(-3.2), Yc(3.4)); g.fillText('RV', X(-0.3), Yc(9.3)); g.fillText('SVC', X(1.4), Yc(0.6));
    // vegetation
    if (st.size > 0.5) {
      const hgt = st.size / 10 * cm, wob = Math.sin(t * 7) * 0.12 * cm;
      g.fillStyle = 'rgba(225,225,225,0.92)';
      g.beginPath(); g.ellipse(X(G.vegX) + wob, Yc(G.leaf) - hgt / 2, Math.max(4, hgt * 0.32), hgt / 2, 0.15, 0, Math.PI * 2); g.fill();
    }
    // cannula: shaft from the SVC, funnel tip
    g.strokeStyle = '#22D3EE'; g.lineWidth = 9; g.lineCap = 'round';
    g.beginPath(); g.moveTo(X(0), 0); g.quadraticCurveTo(X(0), Yc(G.tipY * 0.55), X(G.tipX), Yc(G.tipY - 0.5)); g.stroke();
    g.fillStyle = st.flash > 0 ? '#F5C451' : '#22D3EE';
    g.beginPath(); g.moveTo(X(G.tipX) - 0.6 * cm, Yc(G.tipY)); g.lineTo(X(G.tipX) + 0.6 * cm, Yc(G.tipY)); g.lineTo(X(G.tipX) + 0.18 * cm, Yc(G.tipY - 0.5)); g.lineTo(X(G.tipX) - 0.18 * cm, Yc(G.tipY - 0.5)); g.closePath(); g.fill();
    g.lineCap = 'butt';
    // engagement halo
    g.strokeStyle = G.touchesLeaflet ? '#FF4D6D' : G.engaged ? '#34E39A' : G.partial ? '#F5C451' : 'rgba(150,170,190,0.4)';
    g.setLineDash([4, 4]); g.lineWidth = 2; g.beginPath(); g.arc(X(G.tipX), Yc(G.tipY), 0.7 * cm, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.font = `700 12px ${MONO}`; g.fillStyle = G.touchesLeaflet ? '#FF4D6D' : G.engaged ? '#34E39A' : G.partial ? '#F5C451' : '#6A7F9B';
    g.fillText(G.touchesLeaflet ? 'ON THE LEAFLET' : G.engaged ? 'ENGAGED' : G.partial ? 'PARTIAL CONTACT' : 'free in the RA', 10, h - 14);
  }, []);
  useEffect(() => { if (!flash) return; const id = setTimeout(() => setFlash(0), 400); return () => clearTimeout(id); }, [flash]);

  const finished = !!done;
  const suction = () => {
    if (finished) return;
    setBursts(b => b + 1); setFlash(1);
    if (geo.touchesLeaflet) {
      setDamage(d => d + 1);
      setLog(l => [...l, '⚠ The funnel sucked in leaflet tissue — chordae strained, the TR jet widens.']);
    } else if (geo.engaged) {
      setSize(s => Math.max(0, s - 6));
      setLog(l => [...l, '✓ Engaged: a firm plug of vegetation in the filter.']);
    } else if (geo.partial) {
      setSize(s => Math.max(0, s - 3)); setEmboli(e => e + 1);
      setLog(l => [...l, '⚠ Half-engaged: a fragment tore off and flew to the pulmonary artery.']);
    } else {
      setLog(l => [...l, '… Aspirating blood only — circuit running, nothing captured.']);
    }
  };
  const result = { residual: size, damage, emboli, bursts };
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 330 }} aria-label="Transoesophageal view of the aspiration cannula and vegetation" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>⬇ Advance
          <input type="range" min="0" max="1" step="0.01" value={depth} onChange={e => setDepth(+e.target.value)} disabled={finished} style={{ width: '100%' }} aria-label="Advance the cannula" data-sim="depth" />
        </label>
        <label className="cs-slider" style={{ flex: 1 }}>↔ Deflect
          <input type="range" min="-1" max="1" step="0.01" value={defl} onChange={e => setDefl(+e.target.value)} disabled={finished} style={{ width: '100%' }} aria-label="Deflect the cannula" data-sim="defl" />
        </label>
      </div>
      <div className="cs-ctrls">
        <button className="cs-btn primary" onClick={suction} disabled={finished || size <= 0}>🌀 Suction burst</button>
        <button className="cs-btn" onClick={() => onResult?.(result)} disabled={finished}>✋ Stop — withdraw the cannula</button>
      </div>
      <div className="cs-readout">
        <div><span>Residual vegetation</span><b style={{ color: size > 10 ? 'var(--red)' : 'var(--green)' }}>{size} mm</b></div>
        <div><span>Fragments embolised</span><b style={{ color: emboli ? 'var(--gold)' : undefined }}>{emboli}</b></div>
        <div><span>Tricuspid leaflet</span><b style={{ color: damage ? 'var(--red)' : 'var(--green)', fontSize: 15 }}>{damage ? `injured ×${damage}` : 'intact'}</b></div>
        <div><span>Bursts · ACT</span><b>{bursts} · 286 s</b></div>
      </div>
      {log.length > 0 && <ul className="cs-ul" style={{ marginTop: 10, marginBottom: 0 }}>{log.slice(-4).map((l, i) => <li key={i} className="cs-li" style={{ fontSize: 14 }}>{l}</li>)}</ul>}
      <p className="cs-pts" style={{ marginTop: 8 }}>Green ring = engaged · gold = partial contact (fragments fly) · red = you are on the leaflet. As the vegetation shrinks its top drops toward the leaflet — every pass needs a little more depth and a little more care.</p>
    </div>
  );
}

/* ---------- lung ultrasound ---------- */

export function LungUltrasound({ onSeen }) {
  const [side, setSide] = useState('R');
  const [mode, setMode] = useState('B');
  const [seen, setSeen] = useState([]);
  const ref = useRef(null);
  const S = useRef({}); S.current = { side, mode };
  const key = side + mode;
  useEffect(() => {
    if (!seen.includes(key)) { const n = [...seen, key]; setSeen(n); if (n.length === 4) onSeen?.(); }
  }, [key]); // eslint-disable-line
  // a fixed random field so the pattern is stable
  const noise = useRef(Array.from({ length: 900 }, () => [Math.random(), Math.random(), Math.random()]));
  useCanvas(ref, 260, (g, w, h, t) => {
    const { side: sd, mode: md } = S.current;
    const sliding = sd === 'L';
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const pl = h * 0.36;
    if (md === 'B') {
      // soft tissue
      for (const [a, b, c] of noise.current) { g.fillStyle = `rgba(200,200,200,${c * 0.25})`; g.fillRect(a * w, b * pl, 3, 2); }
      // ribs with shadows
      for (const rx of [w * 0.16, w * 0.84]) {
        g.fillStyle = 'rgba(240,240,240,0.9)'; g.beginPath(); g.arc(rx, pl - 6, 22, Math.PI, 0); g.fill();
        g.fillStyle = '#000'; g.fillRect(rx - 22, pl - 6, 44, h);
      }
      // pleural line
      g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(w * 0.16 + 22, pl, w * 0.68 - 44, 3);
      // below the pleura: shimmer if sliding, A-lines either way
      const shift = sliding ? (t * 40) % 20 : 0;
      for (const [a, b, c] of noise.current) {
        const x = w * 0.16 + 22 + ((a * (w * 0.68 - 44) + shift) % (w * 0.68 - 44)), y = pl + 4 + b * 14;
        g.fillStyle = `rgba(230,230,230,${sliding ? c * 0.5 : c * 0.15})`; g.fillRect(x, y, 2, 1);
      }
      g.fillStyle = 'rgba(220,220,220,0.4)';
      for (const k of [2, 3]) g.fillRect(w * 0.16 + 22, pl * k * 0.9, w * 0.68 - 44, 2);
    } else {
      // M-mode: time runs left to right
      for (let x = 0; x < w; x += 2) {
        for (let y = 0; y < h; y += 2) {
          let v;
          if (y < pl) v = (Math.sin(y * 0.9) + 1) * 0.14 + 0.05;                                 // horizontal soft-tissue lines
          else if (Math.abs(y - pl) < 3) v = 0.95;
          else v = sliding ? Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1) * 0.45   // seashore: sand
            : (Math.sin(y * 0.9) + 1) * 0.14 + 0.05;                                           // barcode: lines all the way down
          g.fillStyle = `rgba(220,220,220,${v})`; g.fillRect(x, y, 2, 2);
        }
      }
    }
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText(`${sd === 'R' ? 'RIGHT' : 'LEFT'} anterior chest · ${md === 'B' ? 'B-mode' : 'M-mode'}`, 10, 16);
    g.fillStyle = sliding ? '#34E39A' : '#FF4D6D';
    g.fillText(md === 'B' ? (sliding ? 'lung sliding present' : 'NO lung sliding') : (sliding ? 'seashore sign' : 'BARCODE (stratosphere) sign'), 10, h - 12);
  }, []);
  return (
    <div className="cs-card tight">
      <div className="cs-ctrls" style={{ marginTop: 0, marginBottom: 10 }}>
        <button className={'cs-chip' + (side === 'R' ? ' on' : '')} onClick={() => setSide('R')}>Right chest</button>
        <button className={'cs-chip' + (side === 'L' ? ' on' : '')} onClick={() => setSide('L')}>Left chest</button>
        <span style={{ width: 12 }} />
        <button className={'cs-chip' + (mode === 'B' ? ' on' : '')} onClick={() => setMode('B')}>B-mode</button>
        <button className={'cs-chip' + (mode === 'M' ? ' on' : '')} onClick={() => setMode('M')}>M-mode</button>
        <span className="cs-pts" style={{ marginLeft: 'auto' }}>{seen.length}/4 views</span>
      </div>
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 260 }} aria-label="Lung ultrasound" /></div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Sliding = the two pleural layers touching and moving. Air between them abolishes it. Present sliding rules out pneumothorax under that probe; absent sliding alone does not prove one (look for the lung point) — but in a peri-arrest patient you do not wait for it.</p>
    </div>
  );
}
