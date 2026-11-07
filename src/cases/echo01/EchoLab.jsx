import React, { useEffect, useMemo, useRef, useState } from 'react';
import Echo3D from './Echo3D.jsx';
import { HR, ES } from './heart.js';
import { WINDOWS, VIEWS, VIEW_BY_ID, viewBasis, applyPose, viewQuality, apexOff } from './views.js';
import { drawEcho, drawDiagram, sectorGeom, MOTION_COL, MOTION_NAMES } from './render.js';
import './echo.css';

/* ============================================================
   ECHO CASE 01 — THE SCANNING LAB
   Put the probe on a window, then slide, rotate, tilt (fan) and
   rock it as a sonographer does; watch the fan cut the heart in
   3D and the image form on the machine. Freeze, scroll to end-
   diastole or end-systole, measure with calipers, and open the
   screen wide to see the same slice as a labelled diagram.
   ============================================================ */

const SW = 560, SH = 440;
const livePhase = now => (now / 1000 * HR / 60) % 1;
const ZERO = { dx: 0, dy: 0, rotDeg: 0, tilt: 0, rock: 0 };

/** Best-matching standard view for a pose. */
function match(pose) {
  // PLAX and A3C share a plane: prefer the view whose window the probe is actually on
  let best = null;
  for (const v of VIEWS) {
    const q = viewQuality(pose, v);
    const S = v.S || WINDOWS[v.win].S;
    const score = q.q - 3 * Math.hypot(pose.S[0] - S[0], pose.S[1] - S[1], pose.S[2] - S[2]);
    if (!best || score > best.score) best = { v, q, score };
  }
  return best;
}

function CanvasCopy({ src, className, onPoint, calipers, depth, label }) {
  const ref = useRef(null);
  const cal = useRef(calipers); cal.current = calipers;
  useEffect(() => {
    const c = ref.current; let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth, h = c.clientHeight;
      if (!w) return;
      if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      const g = c.getContext('2d');
      g.setTransform(c.width / SW, 0, 0, c.height / SH, 0, 0);
      g.drawImage(src, 0, 0);
      const pts = cal.current || [];
      if (pts.length) {
        g.strokeStyle = '#F5C451'; g.fillStyle = '#F5C451'; g.lineWidth = 1.5;
        pts.forEach(p => { g.beginPath(); g.moveTo(p[0] - 5, p[1]); g.lineTo(p[0] + 5, p[1]); g.moveTo(p[0], p[1] - 5); g.lineTo(p[0], p[1] + 5); g.stroke(); });
        if (pts.length === 2) {
          g.setLineDash([4, 3]); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.lineTo(pts[1][0], pts[1][1]); g.stroke(); g.setLineDash([]);
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [src]);
  const click = e => {
    if (!onPoint) return;
    const r = e.currentTarget.getBoundingClientRect();
    onPoint([(e.clientX - r.left) / r.width * SW, (e.clientY - r.top) / r.height * SH]);
  };
  return <canvas ref={ref} className={className} onClick={click} aria-label={label} style={{ aspectRatio: `${SW} / ${SH}` }} />;
}

function DiagramCanvas({ state, className }) {
  const ref = useRef(null);
  const st = useRef(state); st.current = state;
  useEffect(() => {
    const c = ref.current; let raf, f = 0;
    const loop = now => {
      raf = requestAnimationFrame(loop);
      if (f++ % 2) return;
      const w = c.clientWidth, h = c.clientHeight;
      if (!w) return;
      if (c.width !== w) { c.width = w; c.height = h; }
      const s = st.current;
      drawDiagram(c.getContext('2d'), w, h, { ...s, phase: s.frozen ? s.phase : livePhase(now), rw: 160 });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className={className} aria-label="Illustrated diagram of this echo plane" />;
}

export function QualityPanel({ pose, view, depth }) {
  const q = viewQuality(pose, view, depth);
  const off = view.win === 'apical' ? apexOff(pose) : null;
  return (
    <div className={'ec-q' + (q.q >= 80 ? ' ok' : q.q >= 55 ? ' meh' : '')}>
      <div className="ec-q-h"><b>{view.emoji} {view.short}</b><span className="ec-q-bar"><i style={{ width: `${q.q}%` }} /></span><b>{q.q}%</b></div>
      <ul>{q.checks.map(c => <li key={c.name} className={c.ok ? 'ok' : 'no'}>{c.ok ? '✅' : '❌'} {c.name} <small>— {c.note}</small></li>)}</ul>
      <small>Plane angle off target: {q.ang}°{off != null ? ` · true apex ${off.toFixed(1)} cm from the plane${off > 0.8 ? ' — FORESHORTENED' : ''}` : ''}</small>
    </div>
  );
}

/**
 * start: view id (or { basis }); task: { view, prompt, need } → onLock({ q, pose, apexOff });
 * onMeasure(cm) when two caliper points are placed.
 */
export default function EchoLab({ start = 'plax', startPose = null, task = null, onLock, onMeasure, onAcquire, presets = true, height = 420 }) {
  const startView = VIEW_BY_ID[typeof start === 'string' ? start : 'plax'];
  const [base, setBase] = useState(() => startPose || viewBasis(startView));
  const [mv, setMv] = useState(ZERO);
  const [depth, setDepth] = useState(task ? VIEW_BY_ID[task.view].depth : startView.depth);
  const [gain, setGain] = useState(1);
  const [frozen, setFrozen] = useState(false);
  const [phase, setPhase] = useState(0);
  const [labels, setLabels] = useState(false);
  const [close, setClose] = useState(true);
  const [big, setBig] = useState(false);
  const [tab, setTab] = useState('both');
  const [calOn, setCalOn] = useState(false);
  const [cal, setCal] = useState([]);

  const pose = useMemo(() => applyPose(base, mv), [base, mv]);
  const m = match(pose);
  const tv = task ? VIEW_BY_ID[task.view] : null;
  const shownView = tv || (m.q.q >= 45 ? m.v : null);
  const S = useRef({}); S.current = { pose, depth, gain, frozen, phase, labels, title: m.q.q >= 70 ? m.v.short : 'Off-axis' };

  const screen = useMemo(() => { const c = document.createElement('canvas'); c.width = SW; c.height = SH; return c; }, []);
  useEffect(() => {
    let raf, f = 0;
    const g = screen.getContext('2d');
    const loop = now => {
      raf = requestAnimationFrame(loop);
      if (f++ % 2) return;
      const s = S.current;
      drawEcho(g, SW, SH, { ...s, phase: s.frozen ? s.phase : livePhase(now), rw: 190 });
      if (s.frozen) { g.fillStyle = '#22D3EE'; g.font = '700 12px "JetBrains Mono", monospace'; g.fillText(`❄ FROZEN · ${Math.abs(s.phase) < 0.03 ? 'end-diastole' : Math.abs(s.phase - ES) < 0.03 ? 'end-systole' : `phase ${s.phase.toFixed(2)}`}`, 10, SH - 40); }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [screen]);

  const G = sectorGeom(SW, SH, depth);
  const measured = cal.length === 2 ? Math.hypot(cal[0][0] - cal[1][0], cal[0][1] - cal[1][1]) / G.scale : null;
  const addPoint = p => {
    if (!calOn) { setBig(true); return; }
    const n = cal.length >= 2 ? [p] : [...cal, p];
    setCal(n);
    if (n.length === 2) onMeasure?.(Math.hypot(n[0][0] - n[1][0], n[0][1] - n[1][1]) / G.scale, { phase: frozen ? phase : null, pose });
  };
  const goView = v => { setBase(viewBasis(v)); setMv(ZERO); setDepth(v.depth); setCal([]); };
  const slider = (k, label, min, max, step = 1, unit = '°') => (
    <label className="ec-slider">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={mv[k]} onChange={e => setMv(o => ({ ...o, [k]: +e.target.value }))} aria-label={label} />
      <b>{mv[k] > 0 ? '+' : ''}{step < 1 ? mv[k].toFixed(1) : mv[k]}{unit}</b>
    </label>
  );

  const controls = (
    <>
      <div className="ec-rows">
        {!task?.noWindows && <div className="ec-row"><span className="ec-k">🪟 Window</span>
          {Object.values(WINDOWS).map(w => <button key={w.id} className="cs-chip" onClick={() => goView(VIEW_BY_ID[w.home])} title={w.where}>{w.emoji} {w.name}</button>)}
        </div>}
        {!task && presets && Object.values(WINDOWS).map(w => (
          <div key={w.id} className="ec-row"><span className="ec-k">{w.name}</span>
            {VIEWS.filter(v => v.win === w.id).map(v => <button key={v.id} className={'cs-chip' + (m.v.id === v.id && m.q.q >= 80 ? ' on' : '')} onClick={() => goView(v)}>{v.emoji} {v.short}</button>)}
          </div>
        ))}
      </div>
      <div className="ec-sliders">
        {slider('dy', '↕ Slide head ↔ feet', -4, 4, 0.1, ' cm')}
        {slider('dx', '↔ Slide medial ↔ lateral', -4, 4, 0.1, ' cm')}
        {slider('rotDeg', '🔄 Rotate', -90, 90)}
        {slider('tilt', '🪭 Tilt (fan)', -35, 35)}
        {slider('rock', '↔️ Rock (angle)', -35, 35)}
        <label className="ec-slider"><span>📏 Depth</span><input type="range" min="10" max="24" value={depth} onChange={e => setDepth(+e.target.value)} aria-label="Depth" /><b>{depth} cm</b></label>
        <label className="ec-slider"><span>☀️ Gain</span><input type="range" min="0.6" max="1.6" step="0.05" value={gain} onChange={e => setGain(+e.target.value)} aria-label="Gain" /><b>{Math.round(gain * 100)}%</b></label>
      </div>
      <div className="ec-actions">
        <button className={'cs-btn' + (frozen ? ' primary' : '')} onClick={() => setFrozen(f => !f)}>{frozen ? '▶ Live' : '❄ Freeze'}</button>
        {frozen && <>
          <button className="cs-chip" onClick={() => setPhase(0)}>ED</button>
          <button className="cs-chip" onClick={() => setPhase(ES)}>ES</button>
          <input className="ec-scrub" type="range" min="0" max="0.99" step="0.01" value={phase} onChange={e => setPhase(+e.target.value)} aria-label="Cine frame" />
        </>}
        <button className={'cs-chip' + (calOn ? ' on' : '')} onClick={() => { setCalOn(c => !c); setCal([]); }}>📐 Calipers</button>
        <button className={'cs-chip' + (labels ? ' on' : '')} onClick={() => setLabels(l => !l)}>🏷️ Labels</button>
        <button className={'cs-chip' + (close ? '' : ' on')} onClick={() => setClose(c => !c)}>{close ? '🏥 Room view' : '🔍 Heart close-up'}</button>
        {onAcquire && <button className="cs-btn primary" onClick={() => onAcquire({ view: m.v.id, q: m.q.q, apexOff: apexOff(pose) })}>📸 Store clip</button>}
        <button className="cs-btn" onClick={() => setBig(true)}>⤢ Open the screen wide</button>
        <button className="cs-chip" onClick={() => setMv(ZERO)}>↺ Reset moves</button>
      </div>
      {calOn && <p className="ec-words">📐 {measured != null ? <>Distance <b>{measured.toFixed(1)} cm</b> — click again to start a new measurement.</> : 'Click two points on the image (freeze first, at the right frame).'}</p>}
    </>
  );

  const card = shownView && (
    <div className="ec-card">
      <h4>{shownView.emoji} {shownView.name}</h4>
      <p><b>👀 You should see:</b> {shownView.shows}</p>
      <p><b>🖐️ How to get it:</b> {shownView.how}</p>
      <p><b>⚠️ Pitfall:</b> {shownView.pit}</p>
    </div>
  );

  return (
    <div className="cs-card tight ec-lab">
      <div className="ec-top">
        <div className="ec-room">
          <Echo3D pose={pose} depth={depth} screen={screen} height={height} close={close} frozen={frozen} phase={phase} onScreenClick={() => setBig(true)} />
          <div className="ec-hud">🔊 {m.q.q >= 70 ? `${m.v.short} (${m.q.q}%)` : 'Off-axis'} · {WINDOWS[m.v.win].name}</div>
          <div className="ec-hint">🖱️ Drag to turn · scroll to zoom · 🟢 index marker · 🔷 the beam’s slice{close ? '' : ' · click the machine screen'}</div>
        </div>
        <div className="ec-side">
          <div className="ec-screen" role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setBig(true)}>
            <CanvasCopy src={screen} className="ec-screen-c" onPoint={addPoint} calipers={calOn ? cal : []} depth={depth} label="Echo image — click to open wide" />
            {!calOn && <span className="ec-screen-tag" onClick={() => setBig(true)}>⤢ Click to open wide + diagram</span>}
          </div>
          {tv ? <QualityPanel pose={pose} view={tv} depth={depth} /> : m && <QualityPanel pose={pose} view={m.v} depth={depth} />}
        </div>
      </div>
      {controls}
      {task && (
        <div className="ec-task">
          <b>🎯 {task.prompt}</b>
          <button className="cs-btn primary" onClick={() => onLock?.({ q: viewQuality(pose, tv, depth).q, pose, apexOff: apexOff(pose) })}>🔒 Lock this view</button>
        </div>
      )}
      {card}

      {big && (
        <div className="ec-modal" role="dialog" aria-label="Echo screen, enlarged" onClick={e => { if (e.target === e.currentTarget) setBig(false); }}>
          <div className="ec-modal-in">
            <div className="ec-modal-head">
              <b>🖥️ {m.q.q >= 70 ? m.v.name : 'Off-axis plane'} · {WINDOWS[m.v.win].name} window</b>
              <div className="ec-tabs">{[['both', 'Side by side'], ['echo', 'Echo'], ['diagram', 'Illustrated']].map(([k, l]) => <button key={k} className={'cs-chip' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>)}</div>
              <button className="cs-btn" onClick={() => setBig(false)}>✕ Close</button>
            </div>
            <div className={'ec-modal-screens ' + tab}>
              {tab !== 'diagram' && <CanvasCopy src={screen} className="ec-big-c" onPoint={calOn ? addPoint : null} calipers={calOn ? cal : []} depth={depth} label="Echo image, enlarged" />}
              {tab !== 'echo' && <DiagramCanvas className="ec-big-c" state={{ pose, depth, frozen, phase, title: m.q.q >= 70 ? m.v.short : 'Off-axis' }} />}
            </div>
            <div className="ec-modal-low">
              <div>{controls}
                <div className="ec-legend">
                  {MOTION_NAMES.map((n, i) => <span key={n}><i style={{ background: `rgb(${MOTION_COL[i].join(',')})` }} />{n}</span>)}
                  <span><i style={{ background: '#A855F7' }} />thrombus</span><span>numbers = 17-segment model</span>
                </div>
              </div>
              <div>
                {tv ? <QualityPanel pose={pose} view={tv} depth={depth} /> : <QualityPanel pose={pose} view={m.v} depth={depth} />}
                {card}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
