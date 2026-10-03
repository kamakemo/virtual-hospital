import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { World } from './hospital/three/World.js';
import ElevatorPanel from './hospital/ui/ElevatorPanel.jsx';
import ElevatorDoors from './hospital/ui/ElevatorDoors.jsx';
import { WINGS, WING_BY_ID, HOSPITAL_NAME, BEDS_PER_FLOOR, floorOf, pad2 } from './hospital/data.js';
import { CASES, caseKey } from './cases/registry.js';

// each written case is its own chunk, fetched the first time it is opened
const lazyCases = {};
const caseComponent = key => (lazyCases[key] ||= React.lazy(CASES[key]));

/* the catheter lab's day list: start times for its twelve slots */
const LIST_TIMES = ['08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15', '14:00', '14:45', '15:30', '16:15'];

/* ============================================================
   VIRTUAL HOSPITAL
   building → floor → department → patient bed.
   The 3D world does the drawing; this component owns where the
   visitor is, the history stack, and the few controls laid over
   the scene.
   ============================================================ */

const sleep = ms => new Promise(r => setTimeout(r, ms));

const HINTS = {
  building: 'Drag to walk around the building · choose a floor',
  floor: 'Drag to look around · choose a bed',
  lab: 'Drag to look around · choose a case from today’s list',
  bed: 'Drag to look · Esc to step back',
};

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 8.5v15M8.5 16h15" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  const canvasRef = useRef(null);
  const labelsRef = useRef(null);
  const world = useRef(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState('');
  const [view, setView] = useState({ level: 'building' });
  const [doors, setDoors] = useState({ state: 'open' });
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(null);
  const [hintSeen, setHintSeen] = useState({});
  const [openCase, setOpenCase] = useState(null);
  const openCaseRef = useRef(null);
  openCaseRef.current = openCase;

  // the 3D world stops drawing while a case is open — the GPU is the case's
  useEffect(() => { world.current?.setPaused?.(!!openCase); }, [openCase]);

  // a shareable deep link straight into a case: /#case=cv-cath:1
  useEffect(() => {
    const m = /#case=([\w-]+:\d+)/.exec(window.location.hash);
    if (m && CASES[m[1]]) setOpenCase(m[1]);
  }, []);

  const viewRef = useRef(view);
  const busyRef = useRef(false);
  viewRef.current = view;

  const lock = v => { busyRef.current = v; setBusy(v); };

  /* ---------- navigation ---------- */

  const record = (v, push) => {
    if (push) window.history.pushState({ v }, '');
    else window.history.replaceState({ v }, '');
  };

  const goFloor = useCallback(async (wingId, number, { push = true } = {}) => {
    const floor = floorOf(wingId, number);
    const W = world.current;
    if (!floor || !W || busyRef.current) return;
    const cur = viewRef.current;
    if (cur.level === 'floor' && cur.wingId === wingId && cur.number === number) return;
    if (cur.level === 'bed' && cur.wingId === wingId && cur.number === number) {
      lock(true);
      await W.leaveBed();
      const v = { level: 'floor', wingId, number };
      setView(v); record(v, push);
      lock(false);
      return;
    }
    lock(true);
    setHover(null);
    if (cur.level === 'building') await W.flyToFloor(wingId, number);
    setDoors({ state: 'closing', from: cur.number || 0, to: number, label: floor.name });
    await sleep(720);
    setDoors(d => ({ ...d, state: 'closed' }));
    await Promise.race([W.assetsReady, sleep(6000)]);   // patients need the head scan
    W.enterFloor(floor);               // the ward is built behind closed doors
    const v = { level: 'floor', wingId, number };
    setView(v); record(v, push);
    await sleep(420);
    setDoors(d => ({ ...d, state: 'opening' }));
    await sleep(760);
    setDoors({ state: 'open' });
    lock(false);
  }, []);

  const goBuilding = useCallback(async ({ push = true } = {}) => {
    const W = world.current;
    const cur = viewRef.current;
    if (!W || busyRef.current || cur.level === 'building') return;
    lock(true);
    setHover(null);
    setDoors({ state: 'closing', from: cur.number || 0, to: 0, label: 'Ground · Main entrance' });
    await sleep(720);
    setDoors(d => ({ ...d, state: 'closed' }));
    await sleep(40);
    W.showBuilding();
    const v = { level: 'building' };
    setView(v); record(v, push);
    await sleep(380);
    setDoors(d => ({ ...d, state: 'opening' }));
    await sleep(760);
    setDoors({ state: 'open' });
    lock(false);
  }, []);

  const goBed = useCallback(async (index, { push = true } = {}) => {
    const W = world.current;
    const cur = viewRef.current;
    if (!W || busyRef.current || cur.level === 'building') return;
    if (index < 0 || index >= BEDS_PER_FLOOR) return;
    lock(true);
    setHover(null);
    const v = { level: 'bed', wingId: cur.wingId, number: cur.number, bed: index };
    setView(v); record(v, push);
    await W.focusBed(index);
    lock(false);
  }, []);

  const stepBack = useCallback(() => {
    const cur = viewRef.current;
    if (cur.level === 'bed') goFloor(cur.wingId, cur.number);
    else if (cur.level === 'floor') goBuilding();
  }, [goFloor, goBuilding]);

  // Browser back/forward walks the same path.
  useEffect(() => {
    record(viewRef.current, false);
    const onPop = async e => {
      const t = e.state?.v || { level: 'building' };
      const cur = viewRef.current;
      if (t.level === 'building') return goBuilding({ push: false });
      if (t.level === 'floor') return goFloor(t.wingId, t.number, { push: false });
      if (t.level === 'bed') {
        if (cur.wingId !== t.wingId || cur.number !== t.number || cur.level === 'building') {
          await goFloor(t.wingId, t.number, { push: false });
        }
        return goBed(t.bed, { push: false });
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [goFloor, goBuilding, goBed]);

  /* ---------- the 3D world ---------- */

  const handlers = useRef({});
  handlers.current = {
    selectFloor: (w, n) => goFloor(w, n),
    selectBed: i => goBed(i),
  };

  useEffect(() => {
    let w;
    try {
      w = new World({
        canvas: canvasRef.current,
        labels: labelsRef.current,
        wings: WINGS,
        on: {
          ready: () => setTimeout(() => setReady(true), 250),
          hover: h => setHover(h),
          selectFloor: (a, b) => handlers.current.selectFloor(a, b),
          selectBed: i => handlers.current.selectBed(i),
        },
      });
      world.current = w;
    } catch (e) {
      console.error(e);
      setFailed('This device could not start the 3D view. Try a recent version of Chrome, Edge, Safari or Firefox with hardware acceleration turned on.');
    }
    return () => { w?.dispose(); world.current = null; };
  }, []);

  /* ---------- keyboard ---------- */

  useEffect(() => {
    const onKey = e => {
      if (e.target.closest?.('input, textarea')) return;
      const cur = viewRef.current;
      if (openCaseRef.current) { if (e.key === 'Escape') setOpenCase(null); return; }
      if (e.key === 'Escape') stepBack();
      if (cur.level === 'bed' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const next = (cur.bed + (e.key === 'ArrowRight' ? 1 : BEDS_PER_FLOOR - 1)) % BEDS_PER_FLOOR;
        goBed(next, { push: false });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepBack, goBed]);

  /* ---------- derived ---------- */

  const wing = view.wingId ? WING_BY_ID[view.wingId] : null;
  const floor = view.wingId ? floorOf(view.wingId, view.number) : null;
  const bedHeader = view.level === 'bed' && floor ? floor.beds[view.bed] : null;
  const isLab = floor?.id === 'cv-cath';
  const slotWord = isLab ? 'Case' : 'Bed';
  const bedCaseKey = view.level === 'bed' && floor ? caseKey(floor.id, view.bed + 1) : null;
  const bedHasCase = !!(bedCaseKey && CASES[bedCaseKey]);
  const CaseComp = openCase ? caseComponent(openCase) : null;
  const hint = !hintSeen[view.level] && ready ? (view.level === 'floor' && floor?.id === 'cv-cath' ? HINTS.lab : HINTS[view.level]) : null;

  const dismissHint = () => setHintSeen(s => (s[view.level] ? s : { ...s, [view.level]: true }));

  return (
    <div className="stage" onPointerDown={dismissHint}>
      <canvas ref={canvasRef} className="scene" />
      <div ref={labelsRef} className="bed-tags" />

      {/* ---------- where you are ---------- */}
      <header className="plate">
        {view.level !== 'building' && (
          <button type="button" className="plate-back" onClick={stepBack} aria-label="Step back" disabled={busy}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
        <nav className="plate-trail" aria-label="Location">
          <button type="button" className="plate-home" onClick={() => goBuilding()} disabled={busy || view.level === 'building'}>
            <Mark /> <span>{HOSPITAL_NAME}</span>
          </button>
          {wing && floor && (
            <>
              <span className="plate-sep" aria-hidden="true">/</span>
              <button type="button" className="plate-crumb" onClick={() => goFloor(wing.id, floor.number)} disabled={busy || view.level === 'floor'}>
                <span className="plate-floor" style={{ '--hue': floor.hue }}>{pad2(floor.number)}</span>
                <span className="plate-name">{floor.name}</span>
                <span className="plate-wing">{wing.name}</span>
              </button>
            </>
          )}
          {view.level === 'bed' && (
            <>
              <span className="plate-sep" aria-hidden="true">/</span>
              <span className="plate-crumb is-current">{floor?.id === 'cv-cath' ? 'Case' : 'Bed'} {pad2(view.bed + 1)}</span>
            </>
          )}
        </nav>
      </header>

      {/* ---------- floor selector ---------- */}
      <ElevatorPanel
        current={view.level === 'building' ? null : { wingId: view.wingId, number: view.number }}
        onSelect={(w, n) => goFloor(w, n)}
        onLobby={() => goBuilding()}
        onPreview={p => world.current?.previewFloor(p?.wingId, p?.number)}
        busy={busy}
      />

      {/* ---------- hover readouts ---------- */}
      {hover?.type === 'floor' && view.level === 'building' && !busy && (
        <div className="tip" style={{ left: hover.x, top: hover.y }}>
          <span className="tip-floor" style={{ '--hue': hover.hue }}>Floor {pad2(hover.number)}</span>
          <span className="tip-name">{hover.name}</span>
          <span className="tip-wing">{WING_BY_ID[hover.wingId]?.name}</span>
        </div>
      )}
      {hover?.type === 'bed' && view.level === 'floor' && !busy && (
        <div className="caption">
          <span className="caption-bed">Bed {pad2(hover.number)}</span>
          <span className="caption-text">{hover.header || 'Case to be assigned'}</span>
        </div>
      )}

      {/* ---------- the catheter lab's list ---------- */}
      {isLab && view.level === 'floor' && !busy && (
        <aside className="cathlist" aria-label="Today's list in Cath Lab 1">
          <div className="cathlist-h">
            <span className="cathlist-dot" />
            <b>Cath Lab 1 · today’s list</b>
          </div>
          <ol>
            {floor.beds.map((h, i) => {
              const ready = !!CASES[caseKey(floor.id, i + 1)];
              return (
                <li key={i}>
                  <button type="button" onClick={() => goBed(i)} className={ready ? 'is-ready' : ''}>
                    <span className="cathlist-time">{LIST_TIMES[i]}</span>
                    <span className="cathlist-text">{h || 'Slot available'}</span>
                    {ready && <span className="cathlist-tag">Simulation</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      )}

      {/* ---------- bedside ---------- */}
      {view.level === 'bed' && floor && (
        <div className="bedbar">
          <button type="button" className="bedbar-step" disabled={busy} onClick={() => goBed((view.bed + BEDS_PER_FLOOR - 1) % BEDS_PER_FLOOR, { push: false })} aria-label="Previous bed">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="bedbar-id">
            <span className="bedbar-num" style={{ '--hue': floor.hue }}>{slotWord} {pad2(view.bed + 1)}</span>
            <span className="bedbar-text">{bedHeader || 'Case to be assigned'}</span>
          </div>
          {bedHasCase && (
            <button type="button" className="bedbar-open" disabled={busy} onClick={() => setOpenCase(bedCaseKey)}>
              Open case
            </button>
          )}
          <button type="button" className="bedbar-step" disabled={busy} onClick={() => goBed((view.bed + 1) % BEDS_PER_FLOOR, { push: false })} aria-label="Next bed">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}

      {hint && <p className="hint">{hint}</p>}
      {view.level === 'bed' && !hint && (
        <p className="credit">
          Head scan: Lee Perry-Smith, <a href="https://ir-ltd.net/" target="_blank" rel="noopener noreferrer">Infinite-Realities</a>, <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a>
        </p>
      )}

      <ElevatorDoors state={doors.state} from={doors.from} to={doors.to} label={doors.label} />

      {CaseComp && (
        <Suspense fallback={<div className="case-loading"><div className="splash-bar"><span /></div><p>Preparing the case…</p></div>}>
          <CaseComp onClose={() => { setOpenCase(null); if (window.location.hash.startsWith('#case=')) window.history.replaceState(window.history.state, '', window.location.pathname); }} />
        </Suspense>
      )}

      {/* ---------- arrival ---------- */}
      <div className={'splash' + (ready || failed ? ' is-gone' : '')} aria-hidden={ready}>
        <div className="splash-mark"><Mark /></div>
        <div className="splash-name">{HOSPITAL_NAME}</div>
        <div className="splash-bar"><span /></div>
      </div>
      {failed && (
        <div className="failed" role="alert">
          <h1>{HOSPITAL_NAME}</h1>
          <p>{failed}</p>
        </div>
      )}
    </div>
  );
}
