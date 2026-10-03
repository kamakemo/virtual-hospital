import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Monitor, { useCanvas, ecgBeat } from './Monitor.jsx';
import './case.css';

/* ============================================================
   CASE KIT
   The shell every simulated case runs inside, and the small
   interactive pieces cases are built from: decisions with scored
   feedback, select-all-that-apply, sequencing, step-by-step
   procedures, teaching notes, figures and videos, a quiz.

   One context carries the live state of the case: where the
   learner is, the score, the patient's vital signs, and the
   lab's running totals (contrast, fluoroscopy, dose, ACT).
   ============================================================ */

const Ctx = createContext(null);
export const useCase = () => useContext(Ctx);

const fmtClock = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;
const fmtSec = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

/* ---------- shell ---------- */

export function CaseShell({ def, onClose }) {
  const [stage, setStage] = useState(0);
  const [scores, setScores] = useState({});
  const [done, setDone] = useState({});
  const [answers, setAnswers] = useState({});
  const [vitals, setVitalsState] = useState(def.vitals0);
  const [metrics, setMetrics] = useState({ contrast: 0, fluoro: 0, kerma: 0, dap: 0, act: null, ...def.metrics0 });
  const [clock, setClock] = useState(def.clock0);
  const [cover, setCover] = useState(!!def.hero);
  const mainRef = useRef(null);

  const award = useCallback((stageId, key, got, max) => {
    setScores(s => (s[stageId]?.[key] ? s : { ...s, [stageId]: { ...(s[stageId] || {}), [key]: { got, max } } }));
  }, []);
  const bump = useCallback(d => setMetrics(m => {
    const n = { ...m };
    for (const k of Object.keys(d)) n[k] = k === 'act' ? d[k] : (n[k] || 0) + d[k];
    return n;
  }), []);
  const setVitals = useCallback(v => setVitalsState(old => ({ ...old, ...v })), []);
  const answer = useCallback((id, v) => setAnswers(a => ({ ...a, [id]: v })), []);
  const advanceClock = useCallback(min => setClock(c => c + min), []);
  const atLeastClock = useCallback(m => setClock(c => Math.max(c, m)), []);
  const complete = useCallback(id => setDone(d => (d[id] ? d : { ...d, [id]: true })), []);

  const go = useCallback(i => {
    setStage(Math.max(0, Math.min(def.stages.length - 1, i)));
    mainRef.current?.scrollTo({ top: 0 });
  }, [def.stages.length]);

  // each stage sets the scene it happens in: vitals, the time, the lab state
  const current = def.stages[stage];
  useEffect(() => { current.enter?.({ setVitals, atLeastClock, bump }); /* eslint-disable-next-line */ }, [stage]);

  // leaving a stage you have worked in counts it as covered, however you left
  const prevStage = useRef(stage);
  useEffect(() => {
    const prev = def.stages[prevStage.current];
    if (prevStage.current !== stage && scores[prev.id]) complete(prev.id);
    prevStage.current = stage;
    /* eslint-disable-next-line */
  }, [stage]);

  const totals = useMemo(() => {
    let got = 0, max = 0;
    const by = {};
    for (const st of def.stages) {
      const items = Object.values(scores[st.id] || {});
      const g = items.reduce((n, x) => n + x.got, 0), m = items.reduce((n, x) => n + x.max, 0);
      by[st.id] = { got: g, max: m };
      got += g; max += m;
    }
    return { got, max, by };
  }, [scores, def.stages]);

  const ctx = {
    def, stage, go, award, scores, totals, answers, answer, vitals, setVitals,
    metrics, bump, clock, advanceClock, atLeastClock, complete, done,
    stageId: current.id,
  };

  const Stage = current.Component;
  const budget = def.contrastBudget;
  const doneCount = def.stages.filter(st => done[st.id]).length;
  const level = [...LEVELS].reverse().find(l => totals.got >= l.xp);
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const jump = id => { setCover(false); go(Math.max(0, def.stages.findIndex(st => st.id === id))); };
  const contrastTone = metrics.contrast > budget.limit ? 'red alarm' : metrics.contrast > budget.aim ? 'gold' : 'violet';

  return (
    <Ctx.Provider value={ctx}>
      <div className="cs-root" role="dialog" aria-label={def.title}>
        {/* ---------- sidebar: brand, progress, stages, level ---------- */}
        <aside className="cs-side">
          <div className="cs-brand">
            <button className="cs-logo" onClick={() => setCover(true)} aria-label="Back to the case cover">{def.brand?.icon || '🫀'}</button>
            <div>
              <b>Virtual Teaching Hospital</b>
              <span>{def.brand?.line || def.short}</span>
            </div>
          </div>
          <button className="cs-exit" onClick={onClose}>← Leave the lab</button>
          <div className="cs-progress">
            <span>Learning progress</span>
            <b>{doneCount}/{def.stages.length} sections</b>
            <div className="cs-bar"><i style={{ width: `${doneCount / def.stages.length * 100}%` }} /></div>
          </div>
          <nav className="cs-nav" aria-label="Case stages">
            {def.stages.map((st, i) => {
              const sc = totals.by[st.id];
              const on = !cover && i === stage;
              return (
                <button key={st.id} className={'cs-nav-item' + (on ? ' is-on' : '') + (done[st.id] ? ' is-done' : '')}
                  onClick={() => { setCover(false); go(i); }} aria-current={on ? 'step' : undefined} title={st.title}>
                  <span className="cs-nav-n">{done[st.id] ? '✓' : i + 1}</span>
                  <span className="cs-nav-ic" aria-hidden="true">{st.icon}</span>
                  <span className="cs-nav-t">
                    {st.nav || st.title}
                    {sc?.max > 0 && <span className="cs-nav-xp" style={{ display: 'block' }}>{sc.got}/{sc.max} XP</span>}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="cs-level">
            <span><small>Level {LEVELS.indexOf(level)}</small>{level.name}</span>
            <span style={{ textAlign: 'right' }}><b className="cs-xp-total">{totals.got} XP</b>{nextLevel && <small>{nextLevel.xp - totals.got} to {nextLevel.name}</small>}</span>
          </div>
        </aside>

        {/* ---------- main column ---------- */}
        <main className="cs-main" ref={mainRef}>
          {cover ? (
            <>
              {def.hero.image && <div className="cs-hero-bg" style={{ backgroundImage: `url(${def.hero.image})` }} aria-hidden="true" />}
              <div className="cs-main-inner" style={{ position: 'relative' }}><Cover def={def} onStart={() => jump(def.stages[0].id)} onJump={jump} /></div>
            </>
          ) : (
            <>
              <VitalsStrip vitals={vitals} metrics={metrics} clock={clock} contrastTone={contrastTone} budget={budget} patient={def.patient} />
              <div className="cs-main-inner">
                <header className="cs-sec">
                  <div className="cs-sec-pill">{current.pill || `Stage ${stage + 1} of ${def.stages.length}`}</div>
                  <div className="cs-sec-row">
                    <span className="cs-sec-num" aria-hidden="true">{String(stage + 1).padStart(2, '0')}</span>
                    <div>
                      <h1 className="cs-sec-title">{current.icon} {current.title}</h1>
                      {current.lede && <p className="cs-sec-lede">{current.lede}</p>}
                    </div>
                  </div>
                </header>
                <Stage key={current.id} />
                <div className="cs-next">
                  <button className="cs-btn" onClick={() => go(stage - 1)} disabled={stage === 0}>← Previous</button>
                  {stage < def.stages.length - 1 ? (
                    <button className="cs-btn primary" onClick={() => { complete(current.id); go(stage + 1); }}>
                      Continue: {def.stages[stage + 1].icon} {def.stages[stage + 1].nav || def.stages[stage + 1].title} →
                    </button>
                  ) : (
                    <button className="cs-btn primary" onClick={() => { complete(current.id); onClose(); }}>Finish and leave the lab</button>
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        {/* ---------- floating chips: real time in the lab, XP ---------- */}
        <div className="cs-chips" aria-live="polite">
          <LabTimer />
          <div key={totals.got} className={'cs-chipf xp' + (totals.got ? ' pop' : '')}><span className="k">XP</span><b>{totals.got}</b></div>
        </div>
      </div>
    </Ctx.Provider>
  );
}

const LEVELS = [
  { xp: 0, name: 'Intern' }, { xp: 80, name: 'Resident' }, { xp: 170, name: 'Registrar' },
  { xp: 260, name: 'Fellow' }, { xp: 350, name: 'Attending' },
];

/** Wall-clock time since the learner walked in — separate from the case's own clock. */
function LabTimer() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const id = setInterval(() => setS(Math.floor((performance.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const p = n => String(n).padStart(2, '0');
  return <div className="cs-chipf lab"><span className="k">LAB</span><b>{p(Math.floor(s / 3600))}:{p(Math.floor(s / 60) % 60)}:{p(s % 60)}</b></div>;
}

/* ---------- the case cover ---------- */

function Cover({ def, onStart, onJump }) {
  const h = def.hero;
  return (
    <section className="cs-hero">
      <div className="cs-badges">
        {h.badges.map(b => <span key={b.text} className={'cs-badge ' + (b.tone || 'cyan')}>{b.text}</span>)}
      </div>
      <h1 className="cs-hero-title">
        {h.lines.map((l, i) => <span key={i} className={l.style === 'outline' ? 'cs-outline' : l.style === 'grad' ? 'cs-gradtext' : 'cs-solid-cyan'}>{l.text}</span>)}
      </h1>
      <p className="cs-hook">{h.hook}</p>
      <div className="cs-ctas">
        <button className="cs-cta primary" onClick={onStart}>🧤 Scrub in — start case</button>
        {h.sims && <button className="cs-cta" onClick={() => onJump(h.sims)}>🎛️ Jump to simulations</button>}
        {h.crisis && <button className="cs-cta danger" onClick={() => onJump(h.crisis)}>🚨 Skip to the crisis</button>}
      </div>
      {h.cards && (
        <div className="cs-hero-grid">
          {h.cards.map(c => <div key={c.k} className="cs-hero-card"><span>{c.k}</span><p>{c.t}</p></div>)}
        </div>
      )}
    </section>
  );
}

/* ---------- vitals strip: glowing numbers riding on a live trace ---------- */

function VitalsStrip({ vitals, metrics, clock, contrastTone, budget, patient }) {
  const ref = useRef(null);
  const live = useRef(vitals);
  live.current = vitals;
  useCanvas(ref, 70, (g, w, h, t) => {
    g.clearRect(0, 0, w, h);
    const hr = live.current.hr || 80, period = 60 / hr, speed = 120;  // px per second
    const grad = g.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, 'rgba(34,211,238,0)'); grad.addColorStop(0.2, 'rgba(34,211,238,0.55)');
    grad.addColorStop(0.7, 'rgba(52,227,154,0.5)'); grad.addColorStop(1, 'rgba(245,196,81,0.0)');
    g.strokeStyle = grad; g.lineWidth = 2; g.shadowColor = 'rgba(34,211,238,0.6)'; g.shadowBlur = 8;
    g.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const tt = (x / speed + t) / period;
      const y = h * 0.62 - ecgBeat(tt - Math.floor(tt), live.current.st || 0) * h * 0.5;
      x ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
  }, []);
  const low = vitals.sys < 90;
  return (
    <div className="cs-strip">
      <canvas ref={ref} className="cs-strip-trace" style={{ width: '100%', height: 70 }} aria-hidden="true" />
      <div className="cs-tiles">
        <Tile label="♥ HR" value={Math.round(vitals.hr)} unit="bpm" tone={vitals.hr > 100 ? 'red' : 'green'} />
        <Tile label="BP" value={`${Math.round(vitals.sys)}/${Math.round(vitals.dia)}`} tone={low ? 'red alarm' : 'green'} />
        <Tile label="SpO₂" value={vitals.spo2} unit="%" tone="cyan" />
        <Tile label="Contrast" value={Math.round(metrics.contrast)} unit={`/${budget.limit} mL`} tone={contrastTone} />
        <Tile label="Fluoro" value={fmtSec(metrics.fluoro)} unit="min" tone="gold" />
        <Tile label="ACT" value={metrics.act || '—'} unit={metrics.act ? 's' : ''} tone="cyan" />
      </div>
      <div className="cs-strip-cap">
        <span style={{ color: 'var(--ink2)' }}>{patient.name}</span> · {patient.meta} · case time <b className="cs-mono" style={{ color: 'var(--gold)' }}>{fmtClock(clock)}</b>
        {low && <b className="cs-alarm" style={{ marginLeft: 10 }}>ALARM · LOW BP</b>}
        <span className="cs-flags">{patient.flags.map(f => <span key={f.text} className={'cs-flag ' + f.tone}>{f.text}</span>)}</span>
      </div>
    </div>
  );
}

function Tile({ label, value, unit, tone }) {
  return <div className={'cs-tile ' + tone}><span>{label}</span><b>{value}{unit && <small>{unit}</small>}</b></div>;
}

/** The full bedside monitor (ECG, arterial line, pleth) for stages that need it in view. */
export function BedsideMonitor() {
  const { vitals } = useCase();
  return (
    <div className="cs-mon-screen">
      <div className="cs-mon-title">
        <span>BEDSIDE / LAB MONITOR</span>
        {vitals.sys < 90 && <span className="cs-alarm">ALARM · LOW BP</span>}
      </div>
      <Monitor vitals={vitals} />
    </div>
  );
}

/* ---------- the four teaching devices ---------- */

/** Anchor to the body: a mechanism, link by link, ending in the clinical consequence. */
export function Why({ title, chain, children }) {
  return (
    <section className="cs-why">
      <div className="cs-why-h"><span aria-hidden="true">🧬</span> Anchor to the body · the why</div>
      <h3>{title}</h3>
      <div className="cs-chain">
        {chain.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="cs-arrow" aria-hidden="true">→</span>}
            <div className="cs-link"><i>{c.k || `STEP ${i + 1}`}</i>{c.t}</div>
          </React.Fragment>
        ))}
      </div>
      {children && <p className="cs-p" style={{ margin: 0 }}>{children}</p>}
    </section>
  );
}

/** Contrast pair: what it IS beside what it ISN'T. */
export function Contrast({ title, is, isnt }) {
  return (
    <section className="cs-pair">
      {title && <div className="cs-pair-title">⚖️ Contrast pair · {title}</div>}
      <div className="cs-pair-is">
        <div className="cs-pair-k">✓ It is</div>
        <h4>{is.h}</h4>
        <ul>{is.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>
      <div className="cs-pair-isnt">
        <div className="cs-pair-k">✗ It isn’t</div>
        <h4>{isnt.h}</h4>
        <ul>{isnt.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>
    </section>
  );
}

/** A war story: what happened, the one mistake, and the lesson to burn in. */
export function WarStory({ title, tag = 'M&M · War story', children, mistake, burn }) {
  return (
    <article className="cs-war">
      <div className="cs-war-h"><span aria-hidden="true">💀</span><span>{tag}</span><b>{title}</b></div>
      <div className="cs-war-b">
        {children}
        {mistake && <div className="cs-war-mistake"><b>The mistake: </b>{mistake}</div>}
        {burn && <div className="cs-burn"><span>🔥 Burn this in</span><b>{burn}</b></div>}
      </div>
      <div className="cs-war-foot">Composite teaching case. Details changed; the mechanism and the outcome are the kind that happen.</div>
    </article>
  );
}

/**
 * The vicious cycle: a loop of cause and effect drawn as a ring.
 * nodes: [{ t, d }]; breaks: [{ at: node index, t }] — where treatment cuts the loop.
 */
export function ViciousCycle({ id, title, nodes, breaks = [] }) {
  const [sel, setSel] = useState(0);
  const { answers, answer } = useCase();
  const seen = answers[id] || [];
  const pick = i => { setSel(i); if (!seen.includes(i)) answer(id, [...seen, i]); };
  const n = nodes.length, R = 150, C = 200;
  const pos = i => { const a = -Math.PI / 2 + i / n * Math.PI * 2; return [C + Math.cos(a) * R, C + Math.sin(a) * R]; };
  const node = nodes[sel];
  return (
    <section className="cs-cycle">
      <div className="cs-why-h" style={{ color: 'var(--gold)' }}><span aria-hidden="true">🔁</span> The why behind the why · vicious cycle</div>
      <h3 style={{ font: '700 21px var(--f-display)', margin: '0 0 12px' }}>{title}</h3>
      <div className="cs-cycle-grid">
        <svg viewBox="-30 -36 460 472" role="group" aria-label={title}>
          <defs>
            <marker id={id + '-arr'} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="#FF4D6D" />
            </marker>
          </defs>
          <circle cx={C} cy={C} r={R} fill="none" stroke="#182841" strokeWidth="2" />
          <circle cx={C} cy={C} r={R} fill="none" stroke="#FF4D6D" strokeWidth="2.5" strokeDasharray="14 18" opacity="0.7">
            <animateTransform attributeName="transform" type="rotate" from={`0 ${C} ${C}`} to={`360 ${C} ${C}`} dur="18s" repeatCount="indefinite" />
          </circle>
          {nodes.map((_, i) => {
            const a0 = -Math.PI / 2 + (i + 0.5) / n * Math.PI * 2;
            const a1 = a0 + 0.12;
            const p0 = [C + Math.cos(a0 - 0.12) * R, C + Math.sin(a0 - 0.12) * R], p1 = [C + Math.cos(a1) * R, C + Math.sin(a1) * R];
            const br = breaks.filter(b => b.at === i).length;
            return (
              <g key={'a' + i}>
                <path d={`M${p0[0]} ${p0[1]} A${R} ${R} 0 0 1 ${p1[0]} ${p1[1]}`} fill="none" stroke="#FF4D6D" strokeWidth="2.5" markerEnd={`url(#${id}-arr)`} />
                {br > 0 && (
                  <g transform={`translate(${C + Math.cos(a0) * (R + 26)} ${C + Math.sin(a0) * (R + 26)})`}>
                    <circle r="12" fill="#052016" stroke="#34E39A" strokeWidth="1.5" />
                    <text textAnchor="middle" dy="4" fontSize="12" fill="#34E39A" fontFamily="JetBrains Mono, ui-monospace, monospace" fontWeight="700">✂</text>
                  </g>
                )}
              </g>
            );
          })}
          {nodes.map((nd, i) => {
            const [x, y] = pos(i);
            const on = i === sel;
            return (
              <g key={i} className="cs-cycle-node" transform={`translate(${x} ${y})`} onClick={() => pick(i)}
                role="button" tabIndex={0} aria-label={nd.t} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && pick(i)}>
                <circle r="34" fill={on ? '#22D3EE' : '#0F1C30'} stroke={on ? '#CFFFF8' : seen.includes(i) ? '#34E39A' : '#2B4366'} strokeWidth="2" />
                <text textAnchor="middle" dy="5" fontSize="15" fontFamily="JetBrains Mono, ui-monospace, monospace" fontWeight="700" fill={on ? '#04121A' : '#E9F2FC'}>{i + 1}</text>
                <text textAnchor="middle" y={y < C ? -44 : 52} fontSize="12.5" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fill="#C9D6E6">{nd.short || nd.t}</text>
              </g>
            );
          })}
          <text x={C} y={C - 6} textAnchor="middle" fontSize="12" fill="#6A7F9B" fontFamily="JetBrains Mono, ui-monospace, monospace" letterSpacing="2">TAP A STEP</text>
          <text x={C} y={C + 14} textAnchor="middle" fontSize="12" fill="#34E39A" fontFamily="JetBrains Mono, ui-monospace, monospace">✂ = treatment cuts here</text>
        </svg>
        <div className="cs-cycle-detail">
          <div className="k">Step {sel + 1} of {n}</div>
          <h4>{node.t}</h4>
          <p className="cs-p" style={{ fontSize: 15 }}>{node.d}</p>
          {breaks.filter(b => b.at === sel).map((b, i) => (
            <div key={i} className="cs-break"><i>✂</i><span><b style={{ color: 'var(--green)' }}>Break the cycle: </b>{b.t}</span></div>
          ))}
          <p className="cs-pts" style={{ marginTop: 10 }}>{seen.length}/{n} links explored</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- teaching ---------- */

export function Note({ kind = 'pearl', title, children }) {
  const label = title || (kind === 'pearl' ? 'Teaching point' : kind === 'warn' ? 'Pitfall' : 'Evidence');
  return <div className={'cs-note ' + kind}><b>{label}</b>{children}</div>;
}

/* ---------- scored single-best-answer ---------- */

/**
 * options: [{ id, label, verdict: 'best'|'ok'|'wrong', points, why }]
 * The first answer is the one scored. After answering, every option shows
 * its rationale so the learner sees why the others are wrong too.
 */
export function Decision({ id, question, options, max, onAnswer, children }) {
  const { answers, answer, award, stageId } = useCase();
  const chosen = answers[id];
  const top = max ?? Math.max(...options.map(o => o.points || 0));
  const pick = o => {
    if (chosen) return;
    answer(id, o.id);
    award(stageId, id, o.points || 0, top);
    onAnswer?.(o);
  };
  const sel = options.find(o => o.id === chosen);
  return (
    <div className="cs-card">
      <p className="cs-q">{question}</p>
      {children}
      <div className="cs-opts">
        {options.map((o, i) => {
          const cls = !chosen ? '' : o.id === chosen ? (o.verdict || 'wrong') : o.verdict === 'best' ? 'best dim' : 'dim';
          return (
            <button key={o.id} className={'cs-opt ' + cls} onClick={() => pick(o)} disabled={!!chosen}>
              <span className="cs-opt-k">{String.fromCharCode(65 + i)}</span>
              <span>
                {o.label}
                {chosen && <span className={'cs-verdict ' + (o.verdict || 'wrong')}>{o.verdict === 'best' ? 'Best' : o.verdict === 'ok' ? 'Acceptable' : 'Not this'}</span>}
                {chosen && o.why && <span className="cs-opt-why">{o.why}</span>}
              </span>
            </button>
          );
        })}
      </div>
      {sel && (
        <div className={'cs-fb ' + (sel.verdict || 'wrong')}>
          <span className="cs-pts">+{sel.points || 0} / {top} pts</span>
          {sel.feedback && <div style={{ marginTop: 4 }}>{sel.feedback}</div>}
        </div>
      )}
    </div>
  );
}

/* ---------- select all that apply ---------- */

/** items: [{ id, label, correct: bool, why }]. Points: +1 per right call, floor 0. */
export function MultiSelect({ id, question, items, onDone, children }) {
  const { answers, answer, award, stageId } = useCase();
  const saved = answers[id];
  const [sel, setSel] = useState(() => new Set(saved?.sel || []));
  const submitted = !!saved?.submitted;
  const toggle = k => { if (submitted) return; const n = new Set(sel); n.has(k) ? n.delete(k) : n.add(k); setSel(n); };
  const submit = () => {
    let got = 0;
    for (const it of items) if (sel.has(it.id) === !!it.correct) got++;
    answer(id, { sel: [...sel], submitted: true });
    award(stageId, id, got, items.length);
    onDone?.(got, items.length);
  };
  return (
    <div className="cs-card">
      <p className="cs-q">{question} <span className="cs-pts">(select all that apply)</span></p>
      {children}
      <div className="cs-opts">
        {items.map(it => {
          const on = sel.has(it.id);
          const cls = !submitted ? (on ? 'sel' : '') : it.correct ? (on ? 'best' : 'ok') : (on ? 'wrong' : 'dim');
          return (
            <button key={it.id} className={'cs-opt ' + cls} onClick={() => toggle(it.id)} disabled={submitted} aria-pressed={on}>
              <span className="cs-opt-k">{on ? '✓' : ''}</span>
              <span>
                {it.label}
                {submitted && <span className={'cs-verdict ' + (it.correct ? 'best' : 'wrong')}>{it.correct ? (on ? 'Correct' : 'Missed') : (on ? 'Should not be here' : 'Rightly left out')}</span>}
                {submitted && it.why && <span className="cs-opt-why">{it.why}</span>}
              </span>
            </button>
          );
        })}
      </div>
      {!submitted
        ? <div className="cs-row" style={{ marginTop: 12 }}><button className="cs-btn primary" onClick={submit} disabled={sel.size === 0}>Submit</button></div>
        : <div className="cs-fb best" style={{ background: 'transparent', border: '1px solid var(--line2)' }}>
            <span className="cs-pts">{items.filter(it => sel.has(it.id) === !!it.correct).length} / {items.length} correct calls</span>
          </div>}
    </div>
  );
}

/* ---------- put the steps in order ---------- */

export function Sequence({ id, question, steps, onDone }) {
  const { answers, answer, award, stageId } = useCase();
  const saved = answers[id];
  const shuffled = useMemo(() => {
    const a = steps.map((s, i) => ({ ...s, i }));
    for (let k = a.length - 1; k > 0; k--) { const j = (k * 7 + 3) % (k + 1); [a[k], a[j]] = [a[j], a[k]]; }
    return a;
  }, [steps]);
  const [order, setOrder] = useState(saved?.order || []);
  const submitted = !!saved?.submitted;
  const place = s => { if (!submitted && !order.includes(s.i)) setOrder([...order, s.i]); };
  const undo = () => !submitted && setOrder(order.slice(0, -1));
  const submit = () => {
    const got = order.filter((v, k) => v === k).length;
    answer(id, { order, submitted: true });
    award(stageId, id, got, steps.length);
    onDone?.(got, steps.length);
  };
  return (
    <div className="cs-card">
      <p className="cs-q">{question}</p>
      <div className="cs-grid2">
        <div>
          <div className="cs-pts" style={{ marginBottom: 6 }}>Tap in the order you would do them</div>
          <div className="cs-seq-pool">
            {shuffled.filter(s => !order.includes(s.i)).map(s => (
              <button key={s.i} className="cs-seq-item" onClick={() => place(s)} disabled={submitted}>{s.label}</button>
            ))}
            {order.length === steps.length && !submitted && <span className="cs-pts">All placed.</span>}
          </div>
        </div>
        <div>
          <div className="cs-pts" style={{ marginBottom: 6 }}>Your sequence</div>
          <div className="cs-seq-out">
            {order.map((v, k) => (
              <div key={v} className={'cs-seq-item placed' + (submitted ? (v === k ? ' right' : ' wrongpos') : '')}>
                <b className="cs-mono" style={{ color: 'var(--ink3)' }}>{k + 1}</b>
                <span>{steps[v].label}{submitted && v !== k && <span className="cs-opt-why">Belongs at step {v + 1}.</span>}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {!submitted ? (
        <div className="cs-row" style={{ marginTop: 12 }}>
          <button className="cs-btn" onClick={undo} disabled={!order.length}>Undo</button>
          <button className="cs-btn primary" onClick={submit} disabled={order.length !== steps.length}>Check sequence</button>
        </div>
      ) : (
        <div className="cs-fb ok" style={{ marginTop: 12 }}>
          <span className="cs-pts">{order.filter((v, k) => v === k).length} / {steps.length} in the right place</span>
          <ol className="cs-ul" style={{ marginTop: 6 }}>{steps.map((s, k) => <li key={k} className="cs-li">{s.label}{s.why && <span className="cs-opt-why">{s.why}</span>}</li>)}</ol>
        </div>
      )}
    </div>
  );
}

/* ---------- procedure steps that unlock one by one ---------- */

export function Steps({ id, children }) {
  const { answers, answer } = useCase();
  const reached = answers[id] ?? 0;
  const items = React.Children.toArray(children);
  return (
    <div className="cs-steps">
      {items.map((child, i) => React.cloneElement(child, {
        n: i + 1,
        locked: i > reached,
        current: i === reached,
        onDone: () => answer(id, Math.max(reached, i + 1)),
      }))}
    </div>
  );
}

export function Step({ n, title, locked, current, onDone, children, doneLabel = 'Done — next step' }) {
  const body = typeof children === 'function' ? children({ done: onDone }) : children;
  return (
    <section className={'cs-stepcard' + (locked ? ' locked' : '')} aria-disabled={locked}>
      <div className="cs-stepcard-h">
        <span className="cs-step-n">{n}</span>
        <b>{title}</b>
        {locked && <span className="cs-pts" style={{ marginLeft: 'auto' }}>locked</span>}
      </div>
      <div className="cs-stepcard-b">
        {body}
        {current && typeof children !== 'function' && (
          <div className="cs-row" style={{ marginTop: 12 }}><button className="cs-btn primary" onClick={onDone}>{doneLabel}</button></div>
        )}
      </div>
    </section>
  );
}

/* ---------- media ---------- */

/** A figure with credit; if the image cannot load, the caption still stands. */
export function Figure({ src, alt, caption, credit, href }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="cs-fig">
      {!failed
        ? <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
        : <div className="cs-fig-fallback">Image unavailable offline — <a href={href || src} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>open the original</a>.</div>}
      <figcaption>
        {caption}
        {credit && <> · <a href={href || src} target="_blank" rel="noopener noreferrer">{credit}</a></>}
      </figcaption>
    </figure>
  );
}

/** YouTube, loaded only when asked for, always with a direct link. */
export function Video({ id, title, channel }) {
  const [on, setOn] = useState(false);
  const url = `https://www.youtube.com/watch?v=${id}`;
  return (
    <div className="cs-video">
      <div className="cs-video-frame">
        {on ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button className="cs-video-poster" onClick={() => setOn(true)} aria-label={`Play video: ${title}`}>
            <span style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
              <span className="cs-video-play"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M5 3l10 6-10 6z" fill="#fff" /></svg></span>
              <span style={{ fontSize: 13, color: '#CFE0EC', maxWidth: '36ch', textAlign: 'center' }}>{title}</span>
            </span>
          </button>
        )}
      </div>
      <div className="cs-video-meta">
        <span>{channel || 'YouTube'}</span>
        <a href={url} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
      </div>
    </div>
  );
}

/* ---------- quiz ---------- */

export function Quiz({ id, items }) {
  return (
    <div>
      {items.map((q, i) => (
        <Decision
          key={i}
          id={`${id}-${i}`}
          question={`${i + 1}. ${q.q}`}
          options={q.options.map((o, k) => ({ id: String(k), label: o, verdict: k === q.answer ? 'best' : 'wrong', points: k === q.answer ? 2 : 0 }))}
          max={2}
        >
          {null}
        </Decision>
      )).map((el, i) => (
        <React.Fragment key={i}>
          {el}
          <QuizWhy id={`${id}-${i}`} why={items[i].why} />
        </React.Fragment>
      ))}
    </div>
  );
}
function QuizWhy({ id, why }) {
  const { answers } = useCase();
  if (answers[id] == null) return null;
  return <Note kind="pearl" title="Why">{why}</Note>;
}

export { fmtClock, fmtSec };
