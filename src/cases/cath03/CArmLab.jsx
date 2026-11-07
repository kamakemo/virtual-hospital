import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useCase } from '../kit/CaseKit.jsx';
import CArm3D from './CArm3D.jsx';
import { VIEWS, SEGMENTS, viewName, nearestView } from './anatomy.js';
import { drawAngio, drawDiagram, segmentMetrics, seenWell, VESSEL } from './projection.js';
import './carm.css';

/* ============================================================
   CATH LAB · CASE 03 — THE VIEW LAB
   Drive the C-arm (presets or sliders), watch it move in 3D,
   and see the image it makes on the lab monitor. Click the
   monitor — in the room or beside it — to open it wide with an
   illustrated diagram of the same projection: labelled vessels,
   foreshortened stretches flagged, overlaps circled, and where
   head, patient's left and anterior point on the image.
   ============================================================ */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Plain-language description of where the detector is. */
export function detectorWords(lao, cra) {
  const side = Math.abs(lao) < 3 ? 'straight above the chest' : lao > 0 ? `swung ${Math.abs(Math.round(lao))}° toward the patient’s LEFT` : `swung ${Math.abs(Math.round(lao))}° toward the patient’s RIGHT`;
  const tilt = Math.abs(cra) < 3 ? 'no head–foot tilt' : cra > 0 ? `tilted ${Math.abs(Math.round(cra))}° toward the HEAD` : `tilted ${Math.abs(Math.round(cra))}° toward the FEET`;
  return `Detector ${side}, ${tilt}.`;
}

/* ---------- the view map: every standard projection on one chart ---------- */

export function ViewMap({ lao, cra, system, onPick, big = false }) {
  const W = big ? 520 : 360, H = big ? 290 : 210, pad = 30;
  const X = l => pad + (l + 90) / 180 * (W - pad * 2);
  const Y = c => H - pad - (c + 45) / 90 * (H - pad * 2);
  const click = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const sx = (e.clientX - r.left) / r.width * W, sy = (e.clientY - r.top) / r.height * H;
    onPick?.({ lao: clamp(Math.round(((sx - pad) / (W - pad * 2)) * 180 - 90), -90, 90), cra: clamp(Math.round(((H - pad - sy) / (H - pad * 2)) * 90 - 45), -45, 45) });
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ca-map" onClick={click} role="img" aria-label="Map of standard angiographic views">
      <rect x={pad} y={pad} width={W - pad * 2} height={H - pad * 2} rx="10" className="ca-map-bg" />
      <rect x={X(-90)} y={pad} width={X(0) - X(-90)} height={H - pad * 2} className="ca-map-rao" />
      <line x1={X(0)} x2={X(0)} y1={pad} y2={H - pad} className="ca-map-axis" />
      <line y1={Y(0)} y2={Y(0)} x1={pad} x2={W - pad} className="ca-map-axis" />
      <text x={pad + 6} y={pad - 10} className="ca-map-t">◀ RAO</text>
      <text x={W - pad - 6} y={pad - 10} textAnchor="end" className="ca-map-t">LAO ▶</text>
      <text x={W / 2} y={pad - 10} textAnchor="middle" className="ca-map-t">CRANIAL ▲</text>
      <text x={W / 2} y={H - 8} textAnchor="middle" className="ca-map-t">CAUDAL ▼</text>
      {VIEWS.map(v => (
        <g key={v.id} onClick={e => { e.stopPropagation(); onPick?.({ lao: v.lao, cra: v.cra, system: v.system, id: v.id }); }} className={'ca-map-v ' + v.system + (v.system !== system ? ' dim' : '')}>
          <circle cx={X(v.lao)} cy={Y(v.cra)} r={big ? 9 : 7} />
          <text x={X(v.lao)} y={v.system === 'right' ? Y(v.cra) + (big ? 21 : 17) : Y(v.cra) - (big ? 13 : 10)} textAnchor="middle">{v.short.replace(' (RCA)', '').replace(' (spider)', ' 🕷️').replace(' (crux)', ' ✳️')}</text>
        </g>
      ))}
      <circle cx={X(lao)} cy={Y(cra)} r={big ? 7 : 6} className="ca-map-now" />
      <circle cx={X(lao)} cy={Y(cra)} r={big ? 15 : 12} className="ca-map-ring" />
    </svg>
  );
}

/* ---------- a canvas that redraws every frame ---------- */

function LiveCanvas({ draw, height, className, label, onClick }) {
  const ref = useRef(null);
  const fn = useRef(draw); fn.current = draw;
  useEffect(() => {
    const c = ref.current; let raf;
    const loop = now => {
      raf = requestAnimationFrame(loop);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth, h = c.clientHeight || height;
      if (!w) return;
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      const g = c.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      fn.current(g, w, h, now / 1000);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [height]);
  return <canvas ref={ref} className={className} style={height ? { height } : undefined} aria-label={label} onClick={onClick} />;
}

/* ---------- segment table for the current view ---------- */

export function SegmentTable({ lao, cra, system, highlight }) {
  const rows = SEGMENTS.filter(s => VESSEL[s.vessel].system === system).map(s => ({ s, m: segmentMetrics(lao, cra, s) }));
  return (
    <div className="ca-segs">
      {rows.map(({ s, m }) => {
        const ok = seenWell(m);
        return (
          <div key={s.id} className={'ca-seg' + (ok ? ' ok' : m.fs < 0.6 ? ' bad' : ' meh') + (highlight === s.id ? ' hl' : '')} title={s.name}>
            <b>{s.short}</b>
            <span className="ca-bar"><i style={{ width: `${Math.round(clamp(m.fs, 0, 1) * 100)}%` }} /></span>
            <small>{Math.round(m.fs * 100)}% length{m.overlap > 0.3 ? ' · overlapped' : ''}</small>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- the lab ---------- */

/**
 * start {lao, cra, system}; systems: which injections are allowed;
 * task {seg, prompt}: a working-view challenge with a Lock button → onLock({lao, cra, m});
 * onInject(view): called for each cine run (a view "acquired").
 */
export default function CArmLab({ start = { lao: 0, cra: 0, system: 'left' }, systems = ['left', 'right'], task = null, onLock, onInject, height = 440, cost = true }) {
  const kase = useCase();
  const [lao, setLao] = useState(start.lao);
  const [cra, setCra] = useState(start.cra);
  const [system, setSystem] = useState(start.system);
  const [labels, setLabels] = useState(false);
  const [big, setBig] = useState(false);
  const [cineAt, setCineAt] = useState(-1e9);
  const [tab, setTab] = useState('both');
  const S = useRef({}); S.current = { lao, cra, system, labels, cineAt };

  // one offscreen canvas feeds the monitor in the 3D room
  const screen = useMemo(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 420; return c; }, []);
  useEffect(() => {
    let raf, f = 0;
    const g = screen.getContext('2d');
    const loop = now => {
      raf = requestAnimationFrame(loop);
      if (f++ % 2) return;
      const st = S.current;
      const cine = cineState(now / 1000, st.cineAt);
      drawAngio(g, screen.width, screen.height, { ...st, t: now / 1000, ...cine });
      hud(g, screen.width, screen.height, st, 1.25);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [screen]);

  const pick = useCallback(v => {
    if (v.lao != null) setLao(v.lao);
    if (v.cra != null) setCra(v.cra);
    if (v.system && systems.includes(v.system)) setSystem(v.system);
    if (cost) kase?.bump?.({ fluoro: 0.2, kerma: 0.6 });
  }, [systems, cost, kase]);

  const inject = () => {
    setCineAt(performance.now() / 1000);
    if (cost) kase?.bump?.({ contrast: system === 'left' ? 7 : 5, kerma: 12, dap: 2.6, fluoro: 0.4 });
    onInject?.({ lao, cra, system });
  };

  const near = nearestView(lao, cra, system);
  const nearTag = near && near.short !== viewName(lao, cra) ? near.short : null;
  const seg = task && SEGMENTS.find(s => s.id === task.seg);
  const m = seg ? segmentMetrics(lao, cra, seg) : null;

  const angio = (g, w, h, t) => {
    const st = S.current;
    drawAngio(g, w, h, { ...st, t, ...cineState(t, st.cineAt) });
    hud(g, w, h, st, 1);
  };
  const diagram = (g, w, h) => {
    const st = S.current;
    drawDiagram(g, w, h, { lao: st.lao, cra: st.cra, system: st.system, highlight: task?.seg });
    g.font = '800 15px Archivo, sans-serif'; g.fillStyle = '#E9F2FC'; g.textAlign = 'left';
    g.fillText(`🖼️ ${viewName(st.lao, st.cra)} — illustrated`, 14, 24);
  };

  const controls = (
    <>
      <div className="ca-presets">
        {systems.map(sy => (
          <div key={sy} className="ca-preset-row">
            <span className="ca-preset-k">{sy === 'left' ? '🫀 Left coronary' : '❤️ Right coronary'}</span>
            {VIEWS.filter(v => v.system === sy).map(v => (
              <button key={v.id} className={'cs-chip' + (near?.id === v.id && system === sy ? ' on' : '')} onClick={() => pick(v)}>{v.emoji} {v.short}</button>
            ))}
          </div>
        ))}
      </div>
      <div className="ca-sliders">
        <label className="ca-slider">
          <span>RAO ◀</span>
          <input type="range" min="-90" max="90" value={lao} onChange={e => setLao(+e.target.value)} aria-label="RAO to LAO angle" />
          <span>▶ LAO</span>
          <b>{lao === 0 ? 'AP' : `${lao > 0 ? 'LAO' : 'RAO'} ${Math.abs(lao)}°`}</b>
        </label>
        <label className="ca-slider">
          <span>CAU ◀</span>
          <input type="range" min="-45" max="45" value={cra} onChange={e => setCra(+e.target.value)} aria-label="Caudal to cranial angle" />
          <span>▶ CRA</span>
          <b>{cra === 0 ? '0°' : `${cra > 0 ? 'CRA' : 'CAU'} ${Math.abs(cra)}°`}</b>
        </label>
      </div>
      <div className="ca-actions">
        {systems.length > 1 && systems.map(sy => (
          <button key={sy} className={'cs-chip' + (system === sy ? ' on' : '')} onClick={() => setSystem(sy)}>{sy === 'left' ? 'Engage left (JL)' : 'Engage right (JR)'}</button>
        ))}
        <button className="cs-btn primary" onClick={inject}>💉 Inject · cine</button>
        <button className={'cs-chip' + (labels ? ' on' : '')} onClick={() => setLabels(l => !l)}>🏷️ Labels</button>
        <button className="cs-btn" onClick={() => setBig(true)}>⤢ Open the screen wide</button>
      </div>
    </>
  );

  const viewCard = near && (
    <div className="ca-viewcard">
      <h4>{near.emoji} {near.name}</h4>
      <p><b>✅ Best for:</b> {near.best}</p>
      <p><b>⚠️ Watch out:</b> {near.watch}</p>
      <p><b>🔎 How you recognise it:</b> {near.tell}</p>
    </div>
  );

  return (
    <div className="cs-card tight ca-lab">
      <div className="ca-top">
        <div className="ca-room">
          <CArm3D lao={lao} cra={cra} system={system} screen={screen} height={height} onScreenClick={() => setBig(true)} injecting={performance.now() / 1000 - cineAt < 3.5} />
          <div className="ca-room-hud">🎥 {viewName(lao, cra)}{nearTag ? ` · ${nearTag}` : ''}</div>
          <div className="ca-room-hint">🖱️ Drag to walk round · scroll to zoom · click the monitor</div>
        </div>
        <div className="ca-side">
          <button className="ca-screen" onClick={() => setBig(true)} aria-label="Open the angiogram wide with an illustrated diagram">
            <LiveCanvas draw={angio} className="ca-screen-c" label={`Angiogram, ${viewName(lao, cra)}`} />
            <span className="ca-screen-tag">⤢ Click to open wide + diagram</span>
          </button>
          <p className="ca-words">📡 {detectorWords(lao, cra)}</p>
          <ViewMap lao={lao} cra={cra} system={system} onPick={pick} />
        </div>
      </div>
      {controls}
      {task && seg && (
        <div className={'ca-task' + (seenWell(m) ? ' ok' : '')}>
          <div>
            <b>🎯 {task.prompt || `Find a working view for the ${seg.name}`}</b>
            <span>Length seen: <i className={m.fs >= 0.72 ? 'g' : 'r'}>{Math.round(m.fs * 100)}%</i> · Overlap: <i className={m.overlap <= 0.3 ? 'g' : 'r'}>{Math.round(m.overlap * 100)}%</i> {seenWell(m) ? '— ✅ long and clear' : '— keep looking'}</span>
          </div>
          <button className="cs-btn primary" onClick={() => onLock?.({ lao, cra, system, m })}>🔒 Lock this view</button>
        </div>
      )}
      {viewCard}

      {big && (
        <div className="ca-modal" role="dialog" aria-label="Angiography screen, enlarged" onClick={e => { if (e.target === e.currentTarget) setBig(false); }}>
          <div className="ca-modal-in">
            <div className="ca-modal-head">
              <b>🖥️ {viewName(lao, cra)}{nearTag ? ` — ${nearTag}` : ''}</b>
              <div className="ca-tabs">
                {[['both', 'Side by side'], ['angio', 'Angiogram'], ['diagram', 'Illustrated']].map(([k, l]) => (
                  <button key={k} className={'cs-chip' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>
                ))}
              </div>
              <button className="cs-btn" onClick={() => setBig(false)} aria-label="Close the enlarged screen">✕ Close</button>
            </div>
            <div className={'ca-modal-screens ' + tab}>
              {tab !== 'diagram' && <LiveCanvas draw={angio} className="ca-big-c" label="Angiogram, enlarged" />}
              {tab !== 'angio' && <LiveCanvas draw={diagram} className="ca-big-c" label="Illustrated diagram of this projection" />}
            </div>
            <div className="ca-modal-low">
              <div>
                {controls}
                <p className="ca-words">📡 {detectorWords(lao, cra)}</p>
                <div className="ca-legend">
                  <span><i style={{ background: '#22D3EE' }} />LAD</span><span><i style={{ background: '#7DD3FC' }} />Diagonals</span>
                  <span><i style={{ background: '#A78BFA' }} />Septals</span><span><i style={{ background: '#FBBF24' }} />Circumflex</span>
                  <span><i style={{ background: '#FB923C' }} />Marginals</span><span><i style={{ background: '#F472B6' }} />RCA</span>
                  <span>⭕ vessels crossing</span><span>⚠️ foreshortened</span><span>🔴 lesion as it looks here</span>
                  <span><b style={{ color: '#34E39A' }}>H</b> head · <b style={{ color: '#22D3EE' }}>L</b> patient's left · <b style={{ color: '#F5C451' }}>A</b> anterior</span>
                </div>
              </div>
              <div>
                {viewCard || <div className="ca-viewcard"><h4>🧭 Off the standard views</h4><p>No textbook name for this angle — which is fine. Ask what it opens and what it hides: the table below shows each segment's length as seen and whether something lies over it.</p></div>}
                <h4 className="ca-h4">📏 Each segment in this view</h4>
                <SegmentTable lao={lao} cra={cra} system={system} highlight={task?.seg} />
                <ViewMap lao={lao} cra={cra} system={system} onPick={pick} big />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Contrast front and washout for a cine run started at c0 (s). Without a run, the tree stays filled. */
function cineState(t, c0) {
  const since = t - c0;
  if (since < 0 || since > 4.5) return { fill: 1, fade: 1 };
  if (since < 0.3) return { fill: 0, fade: 1 };
  return { fill: Math.min(1, (since - 0.3) / 1.4), fade: since < 3.2 ? 1 : Math.max(0.15, 1 - (since - 3.2) / 1.3) };
}

function hud(g, w, h, st, k) {
  g.font = `700 ${Math.round(12 * k)}px "JetBrains Mono", monospace`; g.fillStyle = '#F5C451'; g.textAlign = 'left';
  g.shadowColor = '#000'; g.shadowBlur = 3;
  g.fillText(viewName(st.lao, st.cra), 10 * k, 18 * k);
  g.textAlign = 'right'; g.fillStyle = '#CFE3F2';
  g.fillText(st.system === 'left' ? 'LCA · 15 f/s' : 'RCA · 15 f/s', w - 10 * k, 18 * k);
  g.shadowBlur = 0; g.textAlign = 'left';
}
