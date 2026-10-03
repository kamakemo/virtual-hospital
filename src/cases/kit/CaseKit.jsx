import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Monitor from './Monitor.jsx';
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

  return (
    <Ctx.Provider value={ctx}>
      <div className="cs-root" role="dialog" aria-label={def.title}>
        {/* patient identification band */}
        <header className="cs-band">
          <button className="cs-close" onClick={onClose} aria-label="Close the case">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <div className="cs-pt">
            <span className="cs-pt-name">{def.patient.name}</span>
            <span className="cs-pt-meta cs-mono">{def.patient.meta}</span>
          </div>
          <div className="cs-flags">
            {def.patient.flags.map(f => <span key={f.text} className={'cs-flag ' + f.tone}>{f.text}</span>)}
          </div>
          <div className="cs-clock">
            <div className="cs-clock-item hide-sm"><span>Case</span><b style={{ color: 'var(--ink)', fontFamily: 'Archivo', fontSize: 13 }}>{def.short}</b></div>
            <div className="cs-clock-item"><span>Time</span><b>{fmtClock(clock)}</b></div>
            <div className="cs-clock-item cs-score"><span>Score</span><b>{totals.got}<small style={{ color: 'var(--ink3)', fontSize: 12 }}>/{totals.max}</small></b></div>
          </div>
        </header>

        <div className="cs-mon-strip">
          <Metric label="HR" value={vitals.hr} />
          <Metric label="BP" value={`${vitals.sys}/${vitals.dia}`} tone={vitals.sys < 90 ? 'over' : ''} />
          <Metric label="SpO₂" value={`${vitals.spo2}%`} />
          <Metric label="Contrast" value={`${Math.round(metrics.contrast)} mL`} tone={metrics.contrast > budget.limit ? 'over' : metrics.contrast > budget.aim ? 'warn' : ''} />
          <Metric label="Fluoro" value={fmtSec(metrics.fluoro)} />
          <Metric label="ACT" value={metrics.act ? `${metrics.act} s` : '—'} />
        </div>

        <div className="cs-body">
          <nav className="cs-rail" aria-label="Case stages">
            <h2>{def.stages.length} stages</h2>
            {def.stages.map((st, i) => {
              const sc = totals.by[st.id];
              return (
                <button key={st.id} className={'cs-step' + (i === stage ? ' is-on' : '') + (done[st.id] ? ' is-done' : '')} onClick={() => go(i)}>
                  <span className="cs-step-n">{done[st.id] ? '✓' : i + 1}</span>
                  <span>
                    <span className="cs-step-t">{st.title}</span>
                    {sc?.max > 0 && <span className="cs-step-s">{sc.got}/{sc.max} pts</span>}
                  </span>
                </button>
              );
            })}
          </nav>

          <main className="cs-main" ref={mainRef}>
            <div className="cs-main-inner">
              <div className="cs-kicker">Stage {stage + 1} of {def.stages.length}</div>
              <h1 className="cs-h1">{current.title}</h1>
              {current.lede && <p className="cs-lede">{current.lede}</p>}
              <Stage key={current.id} />
              <div className="cs-next">
                <button className="cs-btn" onClick={() => go(stage - 1)} disabled={stage === 0}>← Previous</button>
                {stage < def.stages.length - 1 ? (
                  <button className="cs-btn primary" onClick={() => { complete(current.id); go(stage + 1); }}>
                    Continue to {def.stages[stage + 1].title} →
                  </button>
                ) : (
                  <button className="cs-btn primary" onClick={() => { complete(current.id); onClose(); }}>Finish and leave the lab</button>
                )}
              </div>
            </div>
          </main>

          <aside className="cs-mon" aria-label="Patient monitor and lab totals">
            <div className="cs-mon-screen">
              <div className="cs-mon-title">
                <span>BEDSIDE / LAB MONITOR</span>
                {vitals.sys < 90 && <span className="cs-alarm">ALARM · LOW BP</span>}
              </div>
              <Monitor vitals={vitals} />
            </div>
            <div className="cs-metrics">
              <Metric label="Contrast" value={`${Math.round(metrics.contrast)} mL`} bar={metrics.contrast / budget.limit}
                tone={metrics.contrast > budget.limit ? 'over' : metrics.contrast > budget.aim ? 'warn' : ''} />
              <Metric label="Fluoro time" value={fmtSec(metrics.fluoro)} />
              <Metric label="Air kerma" value={`${Math.round(metrics.kerma)} mGy`} bar={metrics.kerma / 5000} />
              <Metric label="ACT" value={metrics.act ? `${metrics.act} s` : '—'} tone={metrics.act && (metrics.act < 250 || metrics.act > 350) ? 'warn' : ''} />
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--ink3)', margin: '2px 2px 0', lineHeight: 1.45 }}>
              Contrast budget for this patient: aim ≤ {budget.aim} mL, ceiling {budget.limit} mL ({budget.basis}).
            </p>
          </aside>
        </div>
      </div>
    </Ctx.Provider>
  );
}

function Metric({ label, value, tone = '', bar }) {
  return (
    <div className={'cs-metric ' + tone}>
      <span>{label}</span>
      <b>{value}</b>
      {bar != null && <div className="cs-bar"><i style={{ width: `${Math.min(100, bar * 100)}%` }} /></div>}
    </div>
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
