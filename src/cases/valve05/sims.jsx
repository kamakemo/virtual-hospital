import React, { useRef, useState } from 'react';
import { useCanvas } from '../kit/Monitor.jsx';
import { useCase } from '../kit/CaseKit.jsx';

/* ============================================================
   VALVE 05 · LOCAL SIMULATORS (written in the kit's style, so
   they can be promoted to the kit later)

   FunctionalPISA   — colour TTE of a TETHERED (functional) mitral
                      valve: central jet, tented leaflets, PISA by hand
   ProportionPlot   — EROA against LV end-diastolic volume: is this
                      MR proportionate to the ventricle? (Grayburn)
   GdmtBoard        — five clinic visits: titrate the four pillars
                      against BP, heart rate, K⁺ and creatinine
   TetheredClip     — TEER for a wide functional jet: place one or
                      more clips, watch residual MR and the gradient
   HyperKResus      — hyperkalaemia with loss of CRT capture: a live
                      rhythm strip that answers each treatment
   ============================================================ */

const MONO = '"JetBrains Mono", "IBM Plex Mono", monospace';

/* ---------- 1 · PISA on a tethered valve ---------- */

/**
 * Apical 4-chamber view, zoomed on a mitral valve whose leaflets are
 * normal but pulled down into the LV (tenting) by displaced papillary
 * muscles. The jet is central; the flow-convergence hemisphere sits on
 * the LV side. onMeasure({ r, va, eroa, rvol, rf, close })
 */
export function FunctionalPISA({ eroa = 0.42, vmax = 480, vti = 130, forwardSV = 44, onMeasure }) {
  const ref = useRef(null);
  const [va, setVa] = useState(40);
  const [cal, setCal] = useState(0.5);
  const rTrue = Math.sqrt(eroa * vmax / (2 * Math.PI * va));
  const S = useRef({}); S.current = { va, cal, rTrue };
  useCanvas(ref, 320, (g, w, h, t) => {
    const { cal: c, rTrue: r, va: v } = S.current;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = 6, R = h * 1.08;
    g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, Math.PI * 0.5 - 0.7, Math.PI * 0.5 + 0.7); g.closePath(); g.clip();
    for (let i = 0; i < 2200; i++) { const a = Math.PI / 2 + (Math.random() - 0.5) * 1.4, rr = Math.random() * R; g.fillStyle = `rgba(190,190,190,${Math.random() * 0.09})`; g.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2, 2); }
    const cm = h / 9;
    const vy = h * 0.46;                       // annular plane
    const ty = vy + 1.1 * cm;                  // coaptation point, pulled down: TENTING
    const sys = ((t * 1.1) % 1) < 0.42;
    // LA (top, large) and a big spherical LV (bottom)
    g.strokeStyle = 'rgba(200,200,200,0.5)'; g.lineWidth = 6;
    g.beginPath(); g.ellipse(cx, vy - 2.2 * cm, 3.2 * cm, 2.1 * cm, 0, Math.PI * 0.06, Math.PI * 0.94, true); g.stroke();
    g.beginPath(); g.ellipse(cx, vy + 3.0 * cm, 3.8 * cm, 3.2 * cm, 0, Math.PI * 1.04, Math.PI * 1.96, true); g.stroke();
    // papillary muscles displaced outward and down, chords pulling the leaflets
    g.fillStyle = 'rgba(170,170,170,0.55)';
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 2.3 * cm, vy + 3.6 * cm, 0.35 * cm, 0.7 * cm, s * 0.3, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = 'rgba(210,210,210,0.35)'; g.lineWidth = 1;
    for (const s of [-1, 1]) for (const k of [0.3, 0.7]) { g.beginPath(); g.moveTo(cx + s * 2.2 * cm, vy + 3.0 * cm); g.lineTo(cx + s * (2.4 - k * 2) * cm * 0.6, ty - (sys ? 0.05 : -1) * cm * k); g.stroke(); }
    // leaflets: hinge at the annulus, tips held below it — they cannot reach each other
    g.strokeStyle = 'rgba(235,235,235,0.92)'; g.lineWidth = 4;
    const gap = sys ? 0.18 * cm : 1.6 * cm;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 2.6 * cm, vy); g.quadraticCurveTo(cx + s * 1.2 * cm, vy + 0.35 * cm, cx + s * gap / 2, sys ? ty : vy + 2.0 * cm); g.stroke(); }
    if (sys) {
      // tenting height marker
      g.setLineDash([3, 3]); g.strokeStyle = 'rgba(167,139,250,0.8)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(cx - 2.6 * cm, vy); g.lineTo(cx + 2.6 * cm, vy); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#C4B5FD'; g.font = `600 10px ${MONO}`; g.fillText('tenting 11 mm', cx + 0.5 * cm, vy + 0.7 * cm);
      // PISA shells on the LV side of the orifice
      for (let k = 4; k >= 1; k--) {
        const rk = r * cm * (k === 1 ? 1 : 1 + (k - 1) * 0.5);
        g.fillStyle = k === 1 ? 'rgba(60,140,255,0.85)' : k % 2 ? 'rgba(255,190,40,0.5)' : 'rgba(220,40,40,0.55)';
        g.beginPath(); g.arc(cx, ty, rk, 0, Math.PI); g.fill();
      }
      // a CENTRAL jet straight up into the LA — the opposite of a flail's wall-hugger
      const grd = g.createLinearGradient(cx, ty, cx, vy - 3.6 * cm);
      grd.addColorStop(0, 'rgba(80,255,120,0.9)'); grd.addColorStop(0.45, 'rgba(255,230,60,0.75)'); grd.addColorStop(1, 'rgba(60,120,255,0.3)');
      g.fillStyle = grd;
      g.beginPath(); g.moveTo(cx - 0.12 * cm, ty); g.quadraticCurveTo(cx - 1.5 * cm, vy - 1.5 * cm, cx - 0.9 * cm, vy - 3.4 * cm);
      g.quadraticCurveTo(cx, vy - 3.9 * cm, cx + 0.9 * cm, vy - 3.4 * cm); g.quadraticCurveTo(cx + 1.5 * cm, vy - 1.5 * cm, cx + 0.12 * cm, ty); g.fill();
    }
    g.restore();
    // caliper
    g.strokeStyle = '#F5C451'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, ty); g.lineTo(cx, ty + c * cm); g.stroke();
    g.beginPath(); g.moveTo(cx - 6, ty + c * cm); g.lineTo(cx + 6, ty + c * cm); g.stroke();
    g.fillStyle = '#F5C451'; g.font = `700 12px ${MONO}`; g.fillText(`r ${c.toFixed(2)} cm`, cx + 10, ty + c * cm + 4);
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`;
    g.fillText('TTE · apical 4-chamber · colour zoom', 10, 16);
    g.fillText('LA', cx - 0.2 * cm, vy - 3.0 * cm); g.fillText('LV', cx - 0.2 * cm, vy + 5.2 * cm);
    g.fillStyle = '#C0392B'; g.fillRect(w - 26, 40, 12, 50); g.fillStyle = '#2E6BE6'; g.fillRect(w - 26, 90, 12, 50);
    g.fillStyle = '#E9F2FC'; g.font = `600 10px ${MONO}`; g.fillText(`±${v}`, w - 54, 36); g.fillText('cm/s', w - 50, 152);
  }, []);
  const eroaM = 2 * Math.PI * cal * cal * va / vmax;
  const rvol = eroaM * vti;
  const rf = rvol / (rvol + forwardSV);
  const close = Math.abs(cal - rTrue) < 0.08;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 320 }} aria-label="Colour Doppler of functional mitral regurgitation with tented leaflets" /></div>
      <div className="cs-ctrls">
        <span className="cs-pts">Colour baseline (aliasing velocity):</span>
        {[30, 40, 50].map(v => <button key={v} className={'cs-chip' + (va === v ? ' on' : '')} onClick={() => setVa(v)}>{v} cm/s</button>)}
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>PISA radius
          <input type="range" min="0.3" max="1.6" step="0.01" value={cal} onChange={e => setCal(+e.target.value)} style={{ width: '100%' }} aria-label="PISA radius caliper" />
        </label>
        <button className="cs-btn primary" onClick={() => onMeasure?.({ r: cal, va, eroa: eroaM, rvol, rf, close })}>Measure</button>
      </div>
      <div className="cs-readout">
        <div><span>EROA = 2πr²·Va / Vmax</span><b style={{ color: eroaM >= 0.4 ? 'var(--red)' : eroaM >= 0.3 ? 'var(--amber)' : undefined }}>{eroaM.toFixed(2)} cm²</b></div>
        <div><span>Regurgitant volume</span><b style={{ color: rvol >= 60 ? 'var(--red)' : rvol >= 45 ? 'var(--amber)' : undefined }}>{Math.round(rvol)} mL</b></div>
        <div><span>Regurgitant fraction</span><b style={{ color: rf >= 0.5 ? 'var(--red)' : undefined }}>{Math.round(rf * 100)}%</b></div>
        <div><span>MR Vmax · VTI</span><b>{(vmax / 100).toFixed(1)} m/s · {vti} cm</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Mid-systole. Measure from the coaptation point — down in the LV, not at the annulus — to the first red → blue change. Forward stroke volume (LVOT) is {forwardSV} mL, so RF = RVol ÷ (RVol + forward SV).</p>
    </div>
  );
}

/* ---------- 2 · Proportionality: EROA vs LVEDV ---------- */

const MITRAL_VTI = 150;                         // cm, the assumption behind Grayburn's curves
const expectedEroa = (lvedv, ef, rf = 0.5) => rf * ef * lvedv / MITRAL_VTI;

/**
 * Where does this MR sit against the ventricle it lives in? The curve is
 * the EROA you would EXPECT for a regurgitant fraction of 50% given this
 * LVEDV and EF. Well above it: disproportionate — the valve adds its own
 * load (COAPT). On or below it: proportionate — the ventricle is the
 * whole story (MITRA-FR).
 */
export function ProportionPlot({ presets, initial = 0 }) {
  const [p, setP] = useState({ ...presets[initial] });
  const [sel, setSel] = useState(initial);
  const W = 560, H = 330, L = 56, B = 44, T = 18, Rm = 18;
  const X = v => L + (v - 100) / 250 * (W - L - Rm);
  const Y = e => H - B - e / 0.7 * (H - B - T);
  const exp = expectedEroa(p.lvedv, p.ef / 100);
  const ratio = p.eroa * 100 / p.lvedv;      // mm² per mL
  const disp = ratio >= 0.15;
  const curve = ef => Array.from({ length: 51 }, (_, i) => { const v = 100 + i * 5; return `${i ? 'L' : 'M'}${X(v).toFixed(1)} ${Y(Math.min(0.7, expectedEroa(v, ef))).toFixed(1)}`; }).join(' ');
  const ratioLine = Array.from({ length: 51 }, (_, i) => { const v = 100 + i * 5; return `${i ? 'L' : 'M'}${X(v).toFixed(1)} ${Y(Math.min(0.7, 0.15 * v / 100)).toFixed(1)}`; }).join(' ');
  const pick = i => { setSel(i); setP({ ...presets[i] }); };
  return (
    <div className="cs-card tight">
      <div className="cs-ctrls" style={{ marginTop: 0 }}>
        {presets.map((q, i) => <button key={q.name} className={'cs-chip' + (sel === i ? ' on' : '')} onClick={() => pick(i)}>{q.name}</button>)}
      </div>
      <div className="cs-viewer" style={{ marginTop: 10, background: '#03070B' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="EROA against LV end-diastolic volume">
          <rect x={L} y={T} width={W - L - Rm} height={H - B - T} fill="#050B16" stroke="#182841" />
          {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map(e => <g key={e}><line x1={L} x2={W - Rm} y1={Y(e)} y2={Y(e)} stroke="#13212D" /><text x={L - 8} y={Y(e) + 4} textAnchor="end" fontSize="11" fill="#6A7F9B" fontFamily={MONO}>{e.toFixed(1)}</text></g>)}
          {[100, 150, 200, 250, 300, 350].map(v => <g key={v}><line y1={T} y2={H - B} x1={X(v)} x2={X(v)} stroke="#13212D" /><text x={X(v)} y={H - B + 16} textAnchor="middle" fontSize="11" fill="#6A7F9B" fontFamily={MONO}>{v}</text></g>)}
          <text x={(L + W) / 2} y={H - 6} textAnchor="middle" fontSize="11.5" fill="#A9BBD2" fontFamily={MONO}>LV end-diastolic volume (mL)</text>
          <text x={14} y={(T + H - B) / 2} textAnchor="middle" fontSize="11.5" fill="#A9BBD2" fontFamily={MONO} transform={`rotate(-90 14 ${(T + H - B) / 2})`}>EROA (cm²)</text>
          <path d={ratioLine} fill="none" stroke="#F5C451" strokeDasharray="6 5" strokeWidth="1.5" opacity="0.8" />
          <path d={curve(p.ef / 100)} fill="none" stroke="#22D3EE" strokeWidth="2.5" />
          <text x={X(330)} y={Y(Math.min(0.66, expectedEroa(330, p.ef / 100))) - 8} textAnchor="end" fontSize="11" fill="#22D3EE" fontFamily={MONO}>expected · RF 50% · EF {p.ef}%</text>
          <text x={X(335)} y={Y(0.15 * 3.35) - 8} textAnchor="end" fontSize="11" fill="#F5C451" fontFamily={MONO}>ratio 0.15 mm²/mL</text>
          <line x1={X(p.lvedv)} x2={X(p.lvedv)} y1={Y(exp)} y2={Y(p.eroa)} stroke={disp ? '#FF4D6D' : '#34E39A'} strokeDasharray="3 3" />
          <circle cx={X(p.lvedv)} cy={Y(Math.min(0.7, p.eroa))} r="9" fill={disp ? '#FF4D6D' : '#34E39A'} stroke="#fff" strokeWidth="2" />
          <text x={X(p.lvedv) + 13} y={Y(Math.min(0.7, p.eroa)) + 4} fontSize="12" fontWeight="700" fill="#E9F2FC" fontFamily={MONO}>{p.name}</text>
        </svg>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: '1 1 220px' }}>LVEDV<input type="range" min="100" max="350" step="1" value={p.lvedv} onChange={e => setP({ ...p, lvedv: +e.target.value })} style={{ width: '100%' }} aria-label="LV end-diastolic volume" />{p.lvedv} mL</label>
        <label className="cs-slider" style={{ flex: '1 1 220px' }}>EROA<input type="range" min="0.1" max="0.7" step="0.01" value={p.eroa} onChange={e => setP({ ...p, eroa: +e.target.value })} style={{ width: '100%' }} aria-label="Effective regurgitant orifice area" />{p.eroa.toFixed(2)} cm²</label>
        <label className="cs-slider" style={{ flex: '1 1 220px' }}>EF<input type="range" min="15" max="45" step="1" value={p.ef} onChange={e => setP({ ...p, ef: +e.target.value })} style={{ width: '100%' }} aria-label="Ejection fraction" />{p.ef}%</label>
      </div>
      <div className="cs-readout">
        <div><span>Expected EROA</span><b>{exp.toFixed(2)} cm²</b></div>
        <div><span>Measured ÷ expected</span><b style={{ color: p.eroa / exp > 1.4 ? 'var(--red)' : 'var(--green)' }}>{(p.eroa / exp).toFixed(1)}×</b></div>
        <div><span>EROA/LVEDV</span><b style={{ color: disp ? 'var(--red)' : 'var(--green)' }}>{ratio.toFixed(2)} mm²/mL</b></div>
        <div><span>Verdict</span><b style={{ color: disp ? 'var(--red)' : 'var(--green)', fontSize: 16 }}>{disp ? 'Disproportionate' : 'Proportionate'}</b></div>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Expected EROA = 0.5 × EF × LVEDV ÷ mitral VTI (150 cm). The 0.15 mm²/mL ratio is a teaching heuristic, not a guideline cut-off — and the concept is still debated.</p>
    </div>
  );
}

/* ---------- 3 · The GDMT titration board ---------- */

const PILLARS = [
  { k: 'bb', name: 'β-blocker', drug: 'Bisoprolol', target: '10 mg od' },
  { k: 'ras', name: 'ARNI / ACEi', drug: 'Sacubitril/valsartan', target: '97/103 mg bd' },
  { k: 'mra', name: 'MRA', drug: 'Spironolactone', target: '25–50 mg od' },
  { k: 'sglt', name: 'SGLT2i', drug: 'Dapagliflozin', target: '10 mg od' },
];

/**
 * visits: [{ when, story, obs: {bp, hr, k, cr, wt}, options: [{ id, label, verdict, points, why, meds, loop }] }]
 * meds: { bb: [label, fraction of target], ras, mra, sglt }, loop: label.
 * One choice per visit; the board shows what that choice leaves him on.
 * onDone({ got, max, picks }) once every visit is answered.
 */
export function GdmtBoard({ visits, start, onDone, done }) {
  const [picks, setPicks] = useState(done?.picks || []);
  const i = Math.min(picks.length, visits.length - 1);
  const finished = picks.length === visits.length;
  const last = picks.length ? visits[picks.length - 1].options.find(o => o.id === picks[picks.length - 1]) : null;
  const meds = last?.meds || start.meds;
  const loop = last?.loop || start.loop;
  const v = visits[i];
  const choose = o => {
    if (finished || done) return;
    const np = [...picks, o.id];
    setPicks(np);
    if (np.length === visits.length) {
      const got = np.reduce((n, id, k) => n + (visits[k].options.find(o2 => o2.id === id)?.points || 0), 0);
      const max = visits.reduce((n, vv) => n + Math.max(...vv.options.map(o2 => o2.points)), 0);
      onDone?.({ got, max, picks: np });
    }
  };
  const tone = (val, lo, hi) => val > hi ? 'var(--red)' : val < lo ? 'var(--amber)' : 'var(--green)';
  return (
    <div className="cs-card tight">
      <div className="cs-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="cs-h2" style={{ margin: 0 }}>💊 Titration board</div>
        <span className="cs-pts">{finished ? 'All visits done' : `Visit ${i + 1} of ${visits.length}`}</span>
      </div>
      <div className="cs-ctrls" style={{ marginTop: 6 }}>
        {visits.map((vv, k) => {
          const o = picks[k] && vv.options.find(x => x.id === picks[k]);
          return <span key={k} className={'cs-chip' + (k === i && !finished ? ' on' : o ? ' done' : '')} style={o && o.verdict !== 'best' ? { color: o.verdict === 'ok' ? 'var(--amber)' : 'var(--red)', borderColor: 'currentColor' } : undefined}>{vv.when}</span>;
        })}
      </div>
      <div className="cs-grid2" style={{ marginTop: 12 }}>
        <div>
          {PILLARS.map(p => {
            const [label, frac] = meds[p.k] || ['—', 0];
            return (
              <div key={p.k} style={{ marginBottom: 10 }}>
                <div className="cs-row" style={{ justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ font: '600 13px var(--f-display)' }}>{p.name} · <span style={{ color: 'var(--ink2)' }}>{label}</span></span>
                  <span className="cs-pts">target {p.target}</span>
                </div>
                <div className="cs-scorebar" style={{ height: 8, marginTop: 4 }}><i style={{ width: `${Math.round(frac * 100)}%`, background: frac >= 1 ? 'var(--green)' : frac > 0 ? 'var(--grad)' : 'transparent' }} /></div>
              </div>
            );
          })}
          <p className="cs-pts" style={{ margin: 0 }}>Loop diuretic: <b style={{ color: 'var(--ink)' }}>{loop}</b> — for congestion, not for prognosis.</p>
        </div>
        <div className="cs-readout" style={{ marginTop: 0, alignContent: 'start' }}>
          <div><span>BP</span><b style={{ color: tone(v.obs.sbp, 95, 160) }}>{v.obs.sbp}/{v.obs.dbp}</b></div>
          <div><span>HR</span><b>{v.obs.hr}</b></div>
          <div><span>K⁺ mmol/L</span><b style={{ color: tone(v.obs.k, 3.5, 5.5) }}>{v.obs.k.toFixed(1)}</b></div>
          <div><span>Creatinine</span><b style={{ color: v.obs.cr > 1.3 * start.cr ? 'var(--red)' : v.obs.cr > start.cr ? 'var(--amber)' : undefined }}>{v.obs.cr}</b></div>
          <div><span>Weight</span><b>{v.obs.wt} kg</b></div>
        </div>
      </div>
      {!finished && (
        <>
          <div className="cs-vignette" style={{ marginTop: 12, padding: '10px 14px', borderLeft: '3px solid var(--cyan)', background: 'rgba(5,11,22,0.5)', borderRadius: 10 }}>
            <p className="cs-p" style={{ margin: 0 }}><span className="cs-time">{v.when}</span>{v.story}</p>
          </div>
          <p className="cs-q" style={{ marginTop: 12 }}>What do you change today?</p>
          <div className="cs-opts">
            {v.options.map((o, k) => (
              <button key={o.id} className="cs-opt" onClick={() => choose(o)}>
                <span className="cs-opt-k">{String.fromCharCode(65 + k)}</span><span>{o.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {picks.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {picks.map((id, k) => {
            const o = visits[k].options.find(x => x.id === id);
            const best = visits[k].options.find(x => x.verdict === 'best');
            return (
              <div key={k} className={'cs-fb ' + o.verdict} style={{ marginTop: 6 }}>
                <b>{visits[k].when}:</b> {o.why}{o.verdict !== 'best' && <> <i>Better: </i>{best.label}</>}
                <span className="cs-pts" style={{ display: 'block' }}>+{o.points} / {best.points}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- 4 · TEER for a wide functional jet ---------- */

const JET = [-0.25, 0.55];                      // the jet along the coaptation line (−1 lateral … +1 medial)
const COVER = 0.25;                             // each well-seated clip closes ±this much of the line
const MVA0 = 4.6;

function residual(clips) {
  // how much of the jet's length is still open between and beside the clips
  const len = JET[1] - JET[0];
  let open = 0;
  for (let x = JET[0]; x < JET[1]; x += 0.005) {
    const shut = clips.some(c => Math.abs(x - c.x) <= COVER * c.q);
    if (!shut) open += 0.005;
  }
  const f = open / len;
  return f <= 0.04 ? 'trace' : f <= 0.22 ? 'mild' : f <= 0.5 ? 'moderate' : 'severe';
}
function gradientOf(clips) {
  if (!clips.length) return 1.4;
  let g = 1.4 + 1.25 * clips.length;
  for (let a = 0; a < clips.length; a++) for (let b = a + 1; b < clips.length; b++) if (Math.abs(clips[a].x - clips[b].x) < 0.3) g += 0.9;
  return Math.round(g * 10) / 10;
}
const VWAVE = { severe: 46, moderate: 32, mild: 23, trace: 19 };

/**
 * 3D TOE surgical view: aorta at 12 o'clock, the LA appendage (lateral, A1/P1)
 * at 9, medial (A3/P3) at 3. The jet runs the length of A2/P2 into A3/P3 —
 * tethered leaflets meet nowhere along it. Place a clip, rotate it
 * perpendicular to the coaptation line, grasp, judge the insertion, release;
 * then decide whether another clip is needed — by the residual jet and the
 * gradient. onResult({ clips, mr, gradient, minIns, vwave })
 */
export function TetheredClip({ onResult, done }) {
  const ref = useRef(null);
  const [x, setX] = useState(-0.7);
  const [ang, setAng] = useState(30);
  const [clips, setClips] = useState(done?.clipList || []);
  const [grasp, setGrasp] = useState(null);
  const S = useRef({}); S.current = { x, ang, clips, grasp };
  useCanvas(ref, 300, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#0B0703'; g.fillRect(0, 0, w, h);
    const narrow = w < 560;                      // phones: valve on top, readout underneath
    const cx = narrow ? w * 0.5 : w * 0.36, cy = narrow ? 132 : h * 0.52, Rx = narrow ? w * 0.4 : Math.min(w * 0.3, 170), Ry = narrow ? 82 : 100;
    const sys = ((t * 1.2) % 1) < 0.45;
    g.fillStyle = '#5A3A1A'; g.beginPath(); g.ellipse(cx, cy, Rx * 1.04, Ry * 1.04, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#C08A4A'; g.beginPath(); g.ellipse(cx, cy - 14, Rx * 0.92, Ry * 0.6, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#A97436'; g.beginPath(); g.ellipse(cx, cy + 6, Rx * 0.95, Ry * 0.74, 0, 0, Math.PI); g.fill();
    // coaptation line, and the tethered gap along it in systole
    g.strokeStyle = '#2A1A0A'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx - Rx * 0.9, cy - 8); g.quadraticCurveTo(cx, cy + 14, cx + Rx * 0.9, cy - 8); g.stroke();
    for (const k of [-0.33, 0.33]) { g.beginPath(); g.moveTo(cx + k * Rx, cy + 6); g.lineTo(cx + k * Rx * 1.1, cy + Ry * 0.74); g.stroke(); }
    g.fillStyle = '#F2D6A8'; g.font = `700 12px ${MONO}`;
    g.fillText('A1', cx - Rx * 0.62, cy - Ry * 0.3); g.fillText('A2', cx - 8, cy - Ry * 0.35); g.fillText('A3', cx + Rx * 0.5, cy - Ry * 0.3);
    g.fillText('P1', cx - Rx * 0.62, cy + Ry * 0.5); g.fillText('P2', cx - 8, cy + Ry * 0.55); g.fillText('P3', cx + Rx * 0.52, cy + Ry * 0.5);
    g.fillText('AORTA ↑', cx - 30, cy - Ry - 10);
    g.fillStyle = '#9FB4C6'; g.font = `600 10px ${MONO}`; g.fillText('LAA ←', 8, cy + 4);
    // the jet: open wherever no clip holds the leaflets together
    const yLine = xx => cy - 8 + 22 * (1 - (xx * xx));
    if (sys) {
      for (let xx = JET[0]; xx < JET[1]; xx += 0.01) {
        const shut = st.clips.some(c => Math.abs(xx - c.x) <= COVER * c.q);
        if (shut) continue;
        const px = cx + xx * Rx * 0.9;
        g.fillStyle = 'rgba(80,255,140,0.35)'; g.beginPath(); g.ellipse(px, yLine(xx) - 4, 6, 12, 0, 0, Math.PI * 2); g.fill();
      }
    }
    // released clips
    const drawClip = (cxp, a, col) => { g.save(); g.translate(cxp, cy + 2); g.rotate(a * Math.PI / 180); g.fillStyle = col; g.fillRect(-4, -40, 8, 80); g.fillStyle = '#7C8A99'; g.beginPath(); g.arc(0, 0, 8, 0, Math.PI * 2); g.fill(); g.restore(); };
    st.clips.forEach(c => drawClip(cx + c.x * Rx * 0.9, c.ang, '#C9D1D9'));
    if (st.clips.length < 3) drawClip(cx + st.x * Rx * 0.9, st.ang, st.grasp ? '#FDE68A' : '#E9F2FC');
    // readouts
    const mr = residual(st.clips), gr = gradientOf(st.clips);
    const lines = [
      ['#9FB4C6', '3D TOE · surgical view'],
      [Math.abs(st.ang) < 12 ? '#34E39A' : '#F5C451', `Arms vs line: ${Math.round(90 - Math.abs(st.ang))}°`],
      ['#E9F2FC', `Clips released: ${st.clips.length}`],
      [mr === 'mild' || mr === 'trace' ? '#34E39A' : mr === 'moderate' ? '#F5C451' : '#FF4D6D', `Residual MR: ${mr}`],
      [gr >= 5 ? '#FF4D6D' : '#34E39A', `Mean gradient: ${gr} mmHg`],
      ...(st.grasp ? [[st.grasp.post >= 6 ? '#34E39A' : '#FF4D6D', `Insertion A ${st.grasp.ant} · P ${st.grasp.post} mm`]] : []),
    ];
    g.font = `600 11px ${MONO}`;
    if (narrow) {
      g.fillStyle = 'rgba(4,18,26,0.92)'; g.fillRect(6, h - 72, w - 12, 66);
      lines.forEach(([c, txt], i) => { g.fillStyle = c; g.fillText(txt, 12 + (i % 2) * (w / 2 - 6), h - 54 + Math.floor(i / 2) * 20); });
    } else {
      g.fillStyle = 'rgba(4,18,26,0.92)'; g.fillRect(w * 0.7, 10, w * 0.29, 150);
      lines.forEach(([c, txt], i) => { g.fillStyle = c; g.fillText(txt, w * 0.71, 28 + i * 21); });
    }
  }, []);
  const doGrasp = () => {
    const e = Math.min(1, Math.abs(ang) / 40);
    const maxPost = x >= 0.45 ? 6.5 : x >= 0.25 ? 7.5 : 8;     // P3 is the most tethered: less leaflet to catch
    const post = Math.round(Math.max(2, maxPost - 5 * e) * 10) / 10;
    const ant = Math.round(Math.max(4, 10 - 4 * e) * 10) / 10;
    setGrasp({ post, ant, q: post >= 6 ? 1 : 0.5 });
  };
  const release = () => { setClips(c => [...c, { x, ang, post: grasp.post, ant: grasp.ant, q: grasp.q }]); setGrasp(null); setX(xv => Math.min(0.9, xv + 0.35)); };
  const finish = () => {
    const mr = residual(clips), gradient = gradientOf(clips);
    onResult?.({ clips: clips.length, mr, gradient, minIns: Math.min(...clips.map(c => c.post)), vwave: VWAVE[mr], mva: Math.round((MVA0 - 1.0 * clips.length) * 10) / 10, clipList: clips });
  };
  const locked = !!done;
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 300 }} aria-label="3D TOE view of a tethered mitral valve with clips" /></div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Lateral (A1/P1)<input type="range" min="-1" max="1" step="0.01" value={x} disabled={!!grasp || locked || clips.length >= 3} onChange={e => setX(+e.target.value)} style={{ width: '100%' }} aria-label="Clip position along the coaptation line" />Medial (A3/P3)</label>
      </div>
      <div className="cs-ctrls">
        <label className="cs-slider" style={{ flex: 1 }}>Rotate<input type="range" min="-60" max="60" step="1" value={ang} disabled={!!grasp || locked || clips.length >= 3} onChange={e => setAng(+e.target.value)} style={{ width: '100%' }} aria-label="Clip arm rotation" />{90 - Math.abs(ang)}°</label>
      </div>
      <div className="cs-ctrls">
        {!grasp && clips.length < 3 && <button className="cs-btn primary" disabled={locked} onClick={doGrasp}>Grasp clip {clips.length + 1}</button>}
        {grasp && <button className="cs-btn" disabled={locked} onClick={() => setGrasp(null)}>Re-grasp</button>}
        {grasp && <button className="cs-btn primary" disabled={locked} onClick={release}>Close and release clip {clips.length + 1}</button>}
        <button className="cs-btn" disabled={locked || !!grasp || !clips.length} onClick={finish}>Finish — accept this result</button>
      </div>
      <p className="cs-pts" style={{ marginTop: 8 }}>Arms perpendicular to the coaptation line, over the jet. Judge the grasp before release (posterior insertion ≥ 6 mm). After each clip: is the jet gone? is the gradient still under 5 mmHg? Up to three clips.</p>
    </div>
  );
}

/* ---------- 5 · Hyperkalaemia with loss of capture ---------- */

/** One beat of lead II as potassium rises: peaked T, flat P, long PR, wide QRS. */
function hkBeat(x, K, paced) {
  const hk = Math.max(0, K - 5);
  const wide = 0.09 + Math.max(0, K - 6.5) * 0.05 + (paced ? 0.06 : 0);
  const pAmp = paced ? 0 : Math.max(0, 0.13 - Math.max(0, K - 6) * 0.07);
  const pr = 0.16 + Math.max(0, K - 6) * 0.03;
  let v = 0;
  if (!paced && x < 0.08) v += Math.sin(x / 0.08 * Math.PI) * pAmp;
  const q0 = paced ? 0.06 : pr * 0.5;
  if (paced && x > 0.045 && x < 0.062) v += 1.4;                       // pacing spike
  if (x >= q0 && x < q0 + wide) { const k = (x - q0) / wide; v += Math.sin(k * Math.PI) * (paced ? -0.75 : 0.9) + (k > 0.6 ? -0.2 * Math.sin((k - 0.6) / 0.4 * Math.PI) : 0); }
  const t0 = q0 + wide + 0.06, tw = 0.16 - hk * 0.012;
  if (x >= t0 && x < t0 + tw) v += Math.sin((x - t0) / tw * Math.PI) * (0.2 + hk * 0.17) * (paced ? 0.8 : 1);
  return v;
}

const HK_ACTIONS = [
  { id: 'ca', label: 'Calcium gluconate 10%, 30 mL IV over 5–10 min (repeat if the ECG does not improve)', good: true },
  { id: 'ins', label: 'Insulin 10 units soluble IV with 25 g glucose (50 mL of 50%), then hourly glucose', good: true },
  { id: 'salb', label: 'Salbutamol 10–20 mg nebulised', good: true },
  { id: 'stop', label: 'Stop sacubitril/valsartan, spironolactone and dapagliflozin; hold furosemide', good: true },
  { id: 'fluid', label: '0.9% saline 500 mL over 30 min, then reassess (he is dry from diarrhoea)', good: true },
  { id: 'szc', label: 'Sodium zirconium cyclosilicate 10 g orally', good: true },
  { id: 'nora', label: 'Noradrenaline to a MAP of 65 before anything else', good: false },
  { id: 'magnet', label: 'Put a magnet over the CRT-D to restore pacing', good: false },
  { id: 'bicarb', label: 'Sodium bicarbonate 8.4% as the first drug', good: false },
];

/**
 * A live lead II strip that answers each treatment. Potassium starts at
 * 7.6 mmol/L: biventricular pacing spikes fail to capture, a slow wide
 * escape rhythm keeps him barely alive. onDone({ pts, max, order })
 */
export function HyperKResus({ onDone, done }) {
  const { setVitals } = useCase();
  const ref = useRef(null);
  const [order, setOrder] = useState(done?.order || []);
  const has = id => order.includes(id);
  const K = Math.round((7.6 - (has('ins') ? 0.8 : 0) - (has('salb') ? 0.5 : 0) - (has('szc') ? 0.2 : 0) - (has('fluid') && has('stop') ? 0.3 : 0)) * 10) / 10;
  const capture = has('ca') || K < 7;
  const S = useRef({}); S.current = { K, capture };
  useCanvas(ref, 170, (g, w, h, t) => {
    const st = S.current;
    g.fillStyle = '#03070B'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,90,82,0.08)';
    for (let x = 0; x < w; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    const speed = 110, base = h * 0.6, amp = h * 0.32;
    const sweep = (t * speed) % w;
    g.strokeStyle = '#38E07A'; g.lineWidth = 1.8; g.beginPath();
    let pen = false;
    for (let x = 0; x < w; x += 1.5) {
      if (Math.abs(x - sweep) < 8) { pen = false; continue; }
      const age = x <= sweep ? sweep - x : sweep + w - x;
      const T0 = t - age / speed;
      if (T0 < 0) { pen = false; continue; }
      let v;
      if (st.capture) { const ph = (T0 * 70 / 60) % 1; v = hkBeat(ph, st.K, true); }
      else {
        // pacing spikes at 70/min that capture nothing; a wide escape at ~36/min underneath
        const sp = (T0 * 70 / 60) % 1, es = (T0 * 36 / 60) % 1;
        v = (sp > 0.015 && sp < 0.032 ? 1.3 : 0) + hkBeat(es * 0.6, st.K + 0.4, false);
      }
      const y = base - v * amp;
      if (!pen) { g.moveTo(x, y); pen = true; } else g.lineTo(x, y);
    }
    g.stroke();
    g.fillStyle = '#9FB4C6'; g.font = `600 11px ${MONO}`; g.fillText('II · 25 mm/s', 8, 16);
    g.fillStyle = st.K >= 6.5 ? '#FF4D6D' : st.K >= 5.5 ? '#F5C451' : '#34E39A'; g.font = `700 14px ${MONO}`; g.fillText(`K⁺ ${st.K.toFixed(1)}`, w - 86, 20);
    g.fillStyle = st.capture ? '#34E39A' : '#FF4D6D'; g.font = `700 11px ${MONO}`; g.fillText(st.capture ? 'BiV CAPTURE' : 'LOSS OF CAPTURE', w - 130, 38);
  }, []);
  const act = id => {
    if (done || has(id)) return;
    const n = [...order, id];
    setOrder(n);
    const h2 = x => n.includes(x);
    const k2 = 7.6 - (h2('ins') ? 0.8 : 0) - (h2('salb') ? 0.5 : 0) - (h2('szc') ? 0.2 : 0) - (h2('fluid') && h2('stop') ? 0.3 : 0);
    const cap = h2('ca') || k2 < 7;
    setVitals({ hr: cap ? 70 : 36, sys: cap ? (h2('fluid') ? 104 : 88) : (h2('fluid') ? 82 : 74), dia: cap ? (h2('fluid') ? 62 : 52) : 42, rhythm: cap ? 'paced' : 'chb', spo2: 95, rr: 22 });
    const need = ['ca', 'ins', 'stop', 'fluid'];
    if (need.every(h2)) {
      const drugs = n.filter(x => x !== 'stop');
      let pts = 0;
      if (drugs[0] === 'ca') pts += 6;
      pts += 4 + 4 + 3;                     // insulin–glucose, stopping the cause, fluids for a dry patient
      if (!n.some(x => !HK_ACTIONS.find(a => a.id === x).good)) pts += 3;
      onDone?.({ pts, max: 20, order: n, K: Math.round(k2 * 10) / 10 });
    }
  };
  return (
    <div className="cs-card tight">
      <div className="cs-viewer"><canvas ref={ref} className="cs-canvas" style={{ height: 170 }} aria-label={`Rhythm strip, potassium ${K}`} /></div>
      <div className="cs-readout">
        <div><span>K⁺ (est.)</span><b style={{ color: K >= 6.5 ? 'var(--red)' : K >= 5.5 ? 'var(--amber)' : 'var(--green)' }}>{K.toFixed(1)}</b></div>
        <div><span>Capture</span><b style={{ color: capture ? 'var(--green)' : 'var(--red)', fontSize: 16 }}>{capture ? 'Biventricular' : 'Lost'}</b></div>
        <div><span>Membrane</span><b style={{ fontSize: 16, color: has('ca') ? 'var(--green)' : 'var(--red)' }}>{has('ca') ? 'Stabilised' : 'Unprotected'}</b></div>
      </div>
      <p className="cs-q" style={{ marginTop: 12 }}>Give treatments in the order you would. Each one changes the strip.</p>
      <div className="cs-opts">
        {HK_ACTIONS.map(a => {
          const i = order.indexOf(a.id);
          const cls = i < 0 ? '' : a.good ? 'best' : 'wrong';
          return (
            <button key={a.id} className={'cs-opt ' + cls} onClick={() => act(a.id)} disabled={!!done || i >= 0}>
              <span className="cs-opt-k">{i >= 0 ? i + 1 : ''}</span>
              <span>{a.label}{i >= 0 && <span className="cs-opt-why">{HK_WHY[a.id]}</span>}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const HK_WHY = {
  ca: 'Calcium raises the threshold potential back away from the resting potential: the membrane can fire normally again and the pacing spikes capture. It does NOT lower potassium; it buys 30–60 minutes.',
  ins: 'Insulin drives Na⁺/K⁺-ATPase: K⁺ moves into cells, falling ~0.6–1.0 mmol/L within 30–60 min. Glucose prevents hypoglycaemia — check it hourly for 6 hours.',
  salb: 'β₂-agonism also drives K⁺ into cells (~0.5 mmol/L). An adjunct to insulin, not a replacement; it causes tachycardia.',
  stop: 'Remove the cause: the drugs that hold potassium in the body. Sick-day rules — restart them when he is eating, drinking and his creatinine is back.',
  fluid: 'He is dry from four days of diarrhoea: low pressure from low preload. Here fluid restores renal perfusion and K⁺ excretion — the opposite of his admission night.',
  szc: 'A binder removes K⁺ through the gut over hours — useful, but slow; it is not emergency membrane protection.',
  nora: 'The problem is not vascular tone: the ventricle is not capturing. Squeezing the arteries of a heart beating 36 times a minute raises afterload and worsens his MR. Fix the potassium.',
  magnet: 'A magnet over an ICD or CRT-D suspends shocks; it does NOT switch on asynchronous pacing. Capture is lost because of the potassium, not the programming.',
  bicarb: 'Little effect on potassium unless there is significant metabolic acidosis — and it is not membrane protection. Not the first drug.',
};
