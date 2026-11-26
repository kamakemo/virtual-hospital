import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { CATS, CATALOG, CAT_BY_ID } from './catalog.js';
import { initState, reducer, fmtT, check } from './engine.js';
import Monitor from './Monitor.jsx';
import './sim.css';

/* ============================================================
   THE SIMULATOR SCREEN
   Story on the left (scenes, dialogue, decisions, crises),
   the patient's chart on the right (history & exam, orders,
   results, drug chart, vitals, notes, timeline, debrief).
   ============================================================ */

const SAVE = id => `vth-sim-${id}`;
const VERDICT = ['Harmful / wrong', 'Partly right', 'Best answer'];

export default function SimCase({ def }) {
  const red = useMemo(() => reducer(def), [def]);
  const [s, dispatch] = useReducer(red, def, d => {
    try { const j = JSON.parse(localStorage.getItem(SAVE(d.id))); if (j && j.v && j.pos != null) return j; } catch { /* none */ }
    return initState(d);
  });
  const [tab, setTab] = useState('overview');
  const [pane, setPane] = useState('story');
  const [toasts, setToasts] = useState([]);
  const storyEnd = useRef(null);

  useEffect(() => { try { localStorage.setItem(SAVE(def.id), JSON.stringify(s)); } catch { /* private mode */ } }, [s, def.id]);
  useEffect(() => {
    if (!s.toasts.length) return;
    setToasts(t => [...t, ...s.toasts].slice(-4));
    const ids = s.toasts.map(x => x.id);
    const h = setTimeout(() => setToasts(t => t.filter(x => !ids.includes(x.id))), 5200);
    return () => clearTimeout(h);
  }, [s.toasts]);
  useEffect(() => { storyEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [s.pos, s.react.length]);
  // in a crisis the clock also runs in real time: one sim minute every 12 s
  useEffect(() => {
    if (!s.crisis) return;
    const h = setInterval(() => dispatch({ type: 'wait', min: 1 }), 12000);
    return () => clearInterval(h);
  }, [s.crisis?.id]);
  useEffect(() => { if (s.crisis) { setTab('orders'); } }, [s.crisis?.id]);
  useEffect(() => { if (s.done) setTab('debrief'); }, [s.done]);

  const restart = () => { if (confirm('Restart this case from the beginning?')) { try { localStorage.removeItem(SAVE(def.id)); } catch { /* */ } location.reload(); } };
  const pending = s.results.filter(r => r.status === 'pending');
  const nextDue = pending.length ? Math.min(...pending.map(r => r.due)) : null;
  const top = useRef(null);
  const show = p => { setPane(p); const y = top.current?.getBoundingClientRect().top; if (y != null && (y < 0 || y > innerHeight * 0.6)) scrollTo({ top: scrollY + y - 90 }); };
  const open = t => { setTab(t); if (innerWidth <= 980) show('chart'); };

  return (
    <div className={'sim' + (s.crisis ? ' in-crisis' : '')}>
      <div className="sim-top">
        <div className="sim-pt">
          <div className="sim-av">{def.patient.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
          <div>
            <b>{def.patient.name}</b>
            <span>{def.patient.age} {def.patient.sex} · MRN {def.patient.mrn} · {def.patient.weight} kg</span>
            <span className="sim-allergy">Allergies: {def.patient.allergies} · {def.patient.code}</span>
          </div>
        </div>
        <Monitor v={s.v} />
        <div className="sim-clock">
          <small>{s.scene?.icon} {s.scene?.title}</small>
          <b>{fmtT(s.t)}</b>
          <div className="sim-wait">
            <button onClick={() => dispatch({ type: 'wait', min: 5 })}>+5 m</button>
            <button onClick={() => dispatch({ type: 'wait', min: 30 })}>+30 m</button>
            <button disabled={nextDue == null} onClick={() => dispatch({ type: 'wait', min: Math.max(1, nextDue - s.t) })} title="Wait for the next result">⏭ result</button>
          </div>
          <span className="sim-score">Score <b>{s.pts}</b>/{s.max}</span>
        </div>
      </div>

      {s.crisis && <CrisisBar s={s} />}

      <div className="sim-switch" role="tablist">
        <button className={pane === 'story' ? 'on' : ''} onClick={() => show('story')}>🎬 Story</button>
        <button className={pane === 'chart' ? 'on' : ''} onClick={() => show('chart')}>📋 Chart{pending.length ? ` · ${pending.length} pending` : ''}</button>
      </div>

      <div className="sim-body" ref={top}>
        <section className={'sim-story' + (pane === 'story' ? ' show' : '')} aria-label="Story">
          <Story def={def} s={s} dispatch={dispatch} open={open} />
          <div ref={storyEnd} />
          {s.done && <div className="sim-end"><b>End of case.</b> <button className="btn btn-sm" onClick={() => open('debrief')}>Open the debrief</button> <button className="btn btn-sm btn-line" onClick={restart}>Play again</button></div>}
        </section>
        <section className={'sim-chart' + (pane === 'chart' ? ' show' : '')} aria-label="Patient chart">
          <Chart def={def} s={s} dispatch={dispatch} tab={tab} setTab={setTab} restart={restart} />
        </section>
      </div>

      <div className="sim-toasts" aria-live="polite">
        {toasts.map(t => <div key={t.id} className={'toast ' + t.kind}>{t.text}</div>)}
      </div>
    </div>
  );
}

function CrisisBar({ s }) {
  const left = s.crisis.deadline - s.t, used = s.t - s.crisis.start, all = s.crisis.deadline - s.crisis.start;
  return (
    <div className="sim-crisis" role="alert">
      <span className="pulse" />
      <b>{s.crisis.title}</b>
      <span>{s.crisis.ask}</span>
      <span className="left"><b>{left}</b> sim-min left</span>
      <i style={{ '--p': `${(used / all) * 100}%` }} />
    </div>
  );
}

/* ---------------- story ---------------- */

function Story({ def, s, dispatch, open }) {
  const out = [];
  const upto = Math.min(s.pos, def.beats.length - 1);
  for (let i = 0; i <= upto; i++) {
    if (s.skip?.[i]) continue;
    const b = def.beats[i];
    out.push(<Beat key={i} b={b} def={def} s={s} dispatch={dispatch} open={open} live={i === s.pos && !s.done} />);
    s.react.filter(r => r.pos === i).forEach((r, k) => out.push(<Say key={`r${i}-${k}`} who={r.who} def={def} text={r.text} tone={r.tone} t={r.t} />));
  }
  return out;
}

function Say({ who, def, text, tone, t }) {
  const c = def.cast[who] || [who, '', '#999', '?'];
  return (
    <div className={'say' + (who === 'you' ? ' me' : '') + (tone ? ' ' + tone : '')} style={{ '--c': c[2] }}>
      <span className="say-av">{c[3]}</span>
      <div><small>{c[0]} · {c[1]}{t != null && <> · {fmtT(t).slice(-5)}</>}</small><p dangerouslySetInnerHTML={{ __html: text }} /></div>
    </div>
  );
}

function condLabel(def, cond) {
  const [k, id] = cond.split(':');
  const name = CAT_BY_ID[id]?.name || id;
  if (k === 'o') return `Order: ${name}`;
  if (k === 's') return `Discontinue: ${name}`;
  if (k === 'x') return `Hold or stop: ${name}`;
  if (k === 'n') return `Not prescribed: ${name}`;
  if (k === 'h') return `Ask: ${def.history.find(h => h.id === id)?.q || id}`;
  if (k === 'e') return `Examine: ${def.exam.find(e => e.id === id)?.sys || id}`;
  return cond;
}
const condTab = c => ({ o: 'orders', s: 'mar', x: 'mar', n: 'mar', h: 'hx', e: 'hx' })[c[0]];

function Beat({ b, def, s, dispatch, open, live }) {
  if (b.k === 'scene') return <div className="scene"><span>{b.icon}</span><div><small className="mono">{fmtT(b.t ?? s.t)}</small><h3>{b.title}</h3></div></div>;
  if (b.k === 'act') return <p className="act">{b.text}</p>;
  if (b.k === 'say') return <Say who={b.who} def={def} text={b.text} />;
  if (b.k === 'card') return <div className={'tcard ' + (b.tone || '')}><h4>{b.title}</h4><div dangerouslySetInnerHTML={{ __html: b.html }} /></div>;
  if (b.k === 'event') {
    const bits = [];
    if (b.alarm) bits.push(<div key="a" className="ev alarm">🔔 {b.alarm}</div>);
    if (b.orders) bits.push(<div key="o" className="ev">✍️ {b.by || 'Team'} charted: {b.orders.map(o => CAT_BY_ID[o]?.name).join(', ')} <button className="lnk" onClick={() => open('mar')}>open drug chart</button></div>);
    if (b.note) bits.push(<div key="n" className="ev">📝 {b.note.by} wrote: <i>{b.note.title}</i> <button className="lnk" onClick={() => open('notes')}>read</button></div>);
    if (b.nursing) bits.push(<div key="u" className="ev">🩺 Nursing: {b.nursing.text}</div>);
    if (b.problem) bits.push(<div key="p" className="ev">📌 Problem list: {b.problem.title}</div>);
    return bits.length ? <>{bits}</> : null;
  }
  if (b.k === 'q') return <Question b={b} s={s} dispatch={dispatch} />;
  if (b.k === 'task') {
    const r = s.tasks[b.id];
    const tabs = [...new Set(b.need.map(condTab))];
    return (
      <div className={'gate task' + (r ? ' done' : '')}>
        <small className="mono">✅ Task · {b.pts} pts</small>
        <p className="ask">{b.ask}</p>
        {!r && <div className="row">
          {tabs.map(t => <button key={t} className="btn btn-sm btn-line" onClick={() => open(t)}>{TAB_NAME[t]}</button>)}
          <button className="btn btn-sm" disabled={!live} onClick={() => dispatch({ type: 'task', tid: b.id })}>Done — review my work</button>
        </div>}
        {r && <ul className="checks">{b.need.map(c => { const ok = check(s, c); return <li key={c} className={ok ? 'ok' : 'no'}>{ok ? '✓' : '✗'} {condLabel(def, c)}</li>; })}</ul>}
        {r && <p className="res">{r.met}/{r.of} · +{r.pts} pts{r.met < r.of && b.missedWhy ? ` — ${b.missedWhy}` : ''}</p>}
      </div>
    );
  }
  if (b.k === 'crisis') {
    const r = s.answers[b.id];
    return (
      <div className={'gate crisis' + (r ? ' done' : '')}>
        <small className="mono">⚡ Crisis · {b.pts} pts · {b.window} sim-min</small>
        <h4>{b.title}</h4>
        <p className="ask">{b.ask}</p>
        {!r && <button className="btn btn-sm" onClick={() => open('orders')}>⚡ Orders</button>}
        {r && <p className="res">{r.failed ? 'Not treated in time — 0 pts.' : `${CAT_BY_ID[r.id]?.name} at +${r.used} min · +${r.pts} pts`}<br /><span className="why">{b.why}</span></p>}
      </div>
    );
  }
  return null;
}

function Question({ b, s, dispatch }) {
  const a = s.answers[b.id];
  const [sel, setSel] = useState([]);
  if (b.multi) {
    return (
      <div className={'gate q' + (a ? ' done' : '')}>
        <small className="mono">☑️ Select all that apply · {b.opts.length} pts</small>
        <p className="ask">{b.ask}</p>
        <div className="opts">
          {b.opts.map((o, i) => {
            const on = a ? a.sel.includes(i) : sel.includes(i);
            const cls = a ? (!!o[1] === on ? ' right' : ' wrong') : '';
            return (
              <button key={i} className={'opt' + (on ? ' on' : '') + cls} disabled={!!a} onClick={() => setSel(x => (x.includes(i) ? x.filter(y => y !== i) : [...x, i]))}>
                <span className="box">{on ? '■' : '□'}</span><span>{o[0]}{a && <em className="why"> {o[1] ? '— belongs.' : '— does not.'} {o[2]}</em>}</span>
              </button>
            );
          })}
        </div>
        {!a && <button className="btn btn-sm" onClick={() => dispatch({ type: 'decide', qid: b.id, sel })}>Submit</button>}
        {a && <p className="res">{a.pts}/{b.opts.length} right calls</p>}
      </div>
    );
  }
  return (
    <div className={'gate q' + (a ? ' done' : '')}>
      <small className="mono">❓ Decision · 10 pts</small>
      <p className="ask">{b.ask}</p>
      <div className="opts">
        {b.opts.map((o, i) => {
          const picked = a?.i === i;
          const cls = a ? (picked ? ' pick v' + o[1] : o[1] === 2 ? ' best' : ' dim') : '';
          return (
            <button key={i} className={'opt' + cls} disabled={!!a} onClick={() => dispatch({ type: 'decide', qid: b.id, i })}>
              <span className="box">{String.fromCharCode(65 + i)}</span>
              <span>{o[0]}{a && (picked || o[1] === 2) && <em className="why"><b>{VERDICT[o[1]]}.</b> <span dangerouslySetInnerHTML={{ __html: o[2] }} /></em>}</span>
            </button>
          );
        })}
      </div>
      {a && <p className="res">+{a.pts} pts</p>}
    </div>
  );
}

/* ---------------- chart ---------------- */

const TAB_NAME = { overview: '🗂 Overview', hx: '🗣 History & exam', orders: '⚡ Orders', results: '🧪 Results', mar: '💊 Drug chart', vitals: '📈 Vitals', notes: '📝 Notes', timeline: '🕒 Timeline', debrief: '🎓 Debrief' };

function Chart({ def, s, dispatch, tab, setTab, restart }) {
  const done = s.results.filter(r => r.status === 'resulted').length;
  const [seen, setSeen] = useState(done);
  useEffect(() => { if (tab === 'results') setSeen(done); }, [tab, done]);
  const newRes = done - seen;
  return (
    <>
      <nav className="sim-tabs">
        {Object.entries(TAB_NAME).map(([k, n]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{n}{k === 'results' && newRes > 0 ? <i>{newRes}</i> : null}</button>)}
      </nav>
      <div className="sim-panel">
        {tab === 'overview' && <Overview def={def} s={s} restart={restart} />}
        {tab === 'hx' && <HxExam def={def} s={s} dispatch={dispatch} />}
        {tab === 'orders' && <Orders s={s} dispatch={dispatch} />}
        {tab === 'results' && <Results s={s} />}
        {tab === 'mar' && <Mar s={s} dispatch={dispatch} />}
        {tab === 'vitals' && <Vitals s={s} />}
        {tab === 'notes' && <Notes s={s} />}
        {tab === 'timeline' && <ul className="tl">{[...s.timeline].reverse().map((e, i) => <li key={i} className={e.cat}><time>{fmtT(e.t)}</time>{e.text}</li>)}</ul>}
        {tab === 'debrief' && <Debrief s={s} />}
      </div>
    </>
  );
}

function Overview({ def, s, restart }) {
  const active = s.orders.filter(o => o.cat === 'med' && o.status === 'active');
  return (
    <div className="ov">
      <p className="lead">{def.oneLiner}</p>
      <dl className="kv">
        <dt>Location</dt><dd>{s.scene?.title}</dd>
        <dt>Bed</dt><dd>{def.patient.bed}</dd>
        <dt>Now</dt><dd>HR {s.v.hr} {s.v.rhythm} · BP {s.v.sbp}/{s.v.dbp} · SpO₂ {s.v.spo2}% · RR {s.v.rr}</dd>
      </dl>
      <h5>Problem list</h5>
      {s.problems.length ? <ul className="probs">{s.problems.map(p => <li key={p.id} className={p.sev}><b>{p.title}</b>{p.plan && <span>{p.plan}</span>}</li>)}</ul> : <p className="muted">—</p>}
      <h5>Active medicines</h5>
      {active.length ? <ul className="plain">{active.map(o => <li key={o.oid}>{o.name} {o.dose} {o.route} {o.freq}</li>)}</ul> : <p className="muted">None</p>}
      <p className="mono muted" style={{ marginTop: 24 }}>Progress saves in this browser. <button className="lnk" onClick={restart}>Restart case</button></p>
    </div>
  );
}

function HxExam({ def, s, dispatch }) {
  return (
    <div className="hx">
      <h5>History — ask him</h5>
      {def.history.map(h => (
        <div key={h.id} className={'hxq' + (s.asked[h.id] ? ' on' : '')}>
          {s.asked[h.id] ? <><b>{h.q}</b><p>{h.a}</p></> : <button onClick={() => dispatch({ type: 'ask', id: h.id })}>🗣 {h.q}</button>}
        </div>
      ))}
      <h5>Examination</h5>
      <div className="exam">
        {def.exam.map(e => (
          <div key={e.id} className={'hxq' + (s.examined[e.id] ? ' on' : '')}>
            {s.examined[e.id] ? <><b>{e.sys}</b><p>{e.f}</p></> : <button onClick={() => dispatch({ type: 'exam', id: e.id })}>🩺 Examine: {e.sys}</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Orders({ s, dispatch }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const list = CATALOG.filter(c => (cat === 'all' || c.cat === cat) && (!q || (c.name + ' ' + (c.dose || '')).toLowerCase().includes(q.toLowerCase())));
  const state = c => {
    const mine = s.orders.filter(o => o.id === c.id);
    if (c.requires && !s.flags[c.requires]) return ['No pacing wire in place', true];
    if (!mine.length) return null;
    const last = mine[mine.length - 1];
    if (c.cat === 'med' || c.cat === 'nurse') return last.status === 'active' ? ['On the chart', true] : null;
    if (c.delay != null && !c.repeatable) return [last.status === 'sent' && s.results.find(r => r.id === c.id && r.status === 'pending') ? 'Sent — pending' : 'Done', true];
    return null;
  };
  return (
    <div className="ord">
      {s.crisis && <p className="ord-warn">⚡ Every order costs time during a crisis — choose deliberately.</p>}
      <input className="ord-q" placeholder="Search orders — e.g. echo, heparin, pacing" value={q} onChange={e => setQ(e.target.value)} aria-label="Search orders" />
      <div className="chips">
        <button className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>All</button>
        {CATS.map(([k, n]) => <button key={k} className={cat === k ? 'on' : ''} onClick={() => setCat(k)}>{n}</button>)}
      </div>
      <ul className="ord-list">
        {list.map(c => {
          const st = state(c);
          return (
            <li key={c.id} className={c.cat}>
              <div><b>{c.name}</b><span>{[c.dose, c.route, c.freq, c.delay ? `result ~${c.delay >= 60 ? Math.round(c.delay / 60) + ' h' : c.delay + ' min'}` : ''].filter(Boolean).join(' · ')}</span></div>
              <button className="btn btn-sm" disabled={!!st?.[1]} data-order={c.id} onClick={() => dispatch({ type: 'order', id: c.id })}>{st ? st[0] : c.stat ? 'Give now' : 'Order'}</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Results({ s }) {
  const [openId, setOpen] = useState(null);
  const list = [...s.results].reverse();
  if (!list.length) return <p className="muted">Nothing ordered yet. Use the Orders tab.</p>;
  return (
    <ul className="res-list">
      {list.map(r => r.status === 'pending'
        ? <li key={r.rid} className="pend"><b>{r.name}</b><span>Pending — due in {r.due - s.t} min</span></li>
        : (
          <li key={r.rid} className={openId === r.rid ? 'open' : ''}>
            <button onClick={() => setOpen(openId === r.rid ? null : r.rid)}><b>{r.name}</b><span>{fmtT(r.due)} · {r.summary}</span></button>
            {(openId === r.rid || list.length < 4) && (
              <div className="res-body">
                {r.rows && <table><tbody>{r.rows.map((row, i) => <tr key={i} className={'f' + row[4]}><td>{row[0]}</td><td><b>{row[1]}</b> {row[2]}</td><td>{row[3]}</td><td>{row[4] !== 'N' ? row[4] : ''}</td></tr>)}</tbody></table>}
                {!r.rows && <p>{r.summary}</p>}
                {r.interp && <p className="interp">💡 {r.interp}</p>}
              </div>
            )}
          </li>
        ))}
    </ul>
  );
}

function Mar({ s, dispatch }) {
  const meds = s.orders.filter(o => o.cat === 'med');
  const stat = s.orders.filter(o => o.cat === 'acute');
  const nurse = s.orders.filter(o => o.cat === 'nurse');
  const Line = ({ o }) => (
    <li className={o.status}>
      <div><b>{o.name}</b><span>{[o.dose, o.route, o.freq].filter(Boolean).join(' · ')}</span><small>{o.by} · {fmtT(o.at)} · <em>{o.status}</em></small></div>
      <div className="mar-act">
        {o.status === 'active' && o.cat === 'med' && <button onClick={() => dispatch({ type: 'mar', oid: o.oid, status: 'held' })}>Hold</button>}
        {o.status !== 'stopped' && <button className="stop" onClick={() => dispatch({ type: 'mar', oid: o.oid, status: 'stopped' })}>Stop</button>}
        {o.status !== 'active' && <button onClick={() => dispatch({ type: 'mar', oid: o.oid, status: 'active' })}>Restart</button>}
      </div>
    </li>
  );
  return (
    <div className="mar">
      <h5>Regular & PRN medicines</h5>
      {meds.length ? <ul>{meds.map(o => <Line key={o.oid} o={o} />)}</ul> : <p className="muted">None</p>}
      <h5>Nursing orders</h5>
      {nurse.length ? <ul>{nurse.map(o => <Line key={o.oid} o={o} />)}</ul> : <p className="muted">None</p>}
      <h5>Once-only / STAT given</h5>
      {stat.length ? <ul className="stat">{stat.map(o => <li key={o.oid} className="given"><div><b>{o.name}</b><span>{o.dose} · {o.route}</span><small>{fmtT(o.at)}</small></div></li>)}</ul> : <p className="muted">None</p>}
    </div>
  );
}

function Vitals({ s }) {
  const vh = s.vh.slice(-40);
  const t0 = vh[0]?.t ?? 0, t1 = Math.max(t0 + 1, vh[vh.length - 1]?.t ?? 1);
  const X = t => 10 + ((t - t0) / (t1 - t0)) * 580;
  const path = (k, lo, hi) => vh.map((p, i) => `${i ? 'L' : 'M'}${X(p.t).toFixed(1)},${(150 - ((p[k] - lo) / (hi - lo)) * 140).toFixed(1)}`).join('');
  return (
    <div className="vit">
      <svg viewBox="0 0 600 160" className="vit-svg" role="img" aria-label="Vital-sign trend">
        <path d={path('hr', 0, 180)} stroke="#35E08A" />
        <path d={path('sbp', 0, 180)} stroke="#FF6B6B" />
        <path d={path('spo2', 70, 100)} stroke="#5AC8FF" />
      </svg>
      <p className="mono"><span style={{ color: '#35E08A' }}>■ HR</span> · <span style={{ color: '#FF6B6B' }}>■ SBP</span> · <span style={{ color: '#5AC8FF' }}>■ SpO₂</span></p>
      <table className="vit-t"><thead><tr><th>Time</th><th>HR</th><th>Rhythm</th><th>BP</th><th>SpO₂</th><th>RR</th><th>Note</th></tr></thead>
        <tbody>{[...s.vh].reverse().map((p, i) => <tr key={i}><td>{fmtT(p.t)}</td><td>{p.hr}</td><td>{p.rhythm}</td><td>{p.sbp}/{p.dbp}</td><td>{p.spo2}</td><td>{p.rr}</td><td>{p.note}</td></tr>)}</tbody></table>
    </div>
  );
}

function Notes({ s }) {
  const all = [...s.notes.map(n => ({ ...n, kind: 'note' })), ...s.nursing.map(n => ({ ...n, kind: 'nursing', title: 'Nursing — ' + (n.cat || 'entry') }))].sort((a, b) => b.t - a.t);
  if (!all.length) return <p className="muted">No notes yet.</p>;
  return <ul className="notes">{all.map((n, i) => <li key={i} className={n.kind}><small className="mono">{fmtT(n.t)} · {n.by}{n.role ? ' · ' + n.role : ''}</small><b>{n.title}</b><p>{n.text}</p></li>)}</ul>;
}

function Debrief({ s }) {
  const pct = s.max ? Math.round((s.pts / s.max) * 100) : 0;
  const grade = pct >= 90 ? 'Consultant-ready' : pct >= 75 ? 'Safe senior resident' : pct >= 55 ? 'Needs supervision' : 'Unsafe — replay';
  return (
    <div className="deb">
      <div className="deb-score"><b>{pct}%</b><span>{s.pts} / {s.max} pts · {grade}{!s.done && ' · case in progress'}</span></div>
      <ul className="deb-log">{s.log.map((l, i) => <li key={i} className={'v' + l.verdict}><time>{fmtT(l.t)}</time><b>{l.what}</b><span>{['Harmful / wrong', 'Partly right', 'Right call'][l.verdict]}</span><p>{l.why}</p></li>)}</ul>
    </div>
  );
}
