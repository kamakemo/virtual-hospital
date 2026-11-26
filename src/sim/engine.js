import { CAT_BY_ID } from './catalog.js';

/* ============================================================
   SIMULATION ENGINE
   One pure reducer drives a whole hospital episode:
   - a clock in minutes (Day 0 00:00 = 0),
   - vitals and rhythm, with a history for trends,
   - orders → results that arrive after a delay,
   - a drug chart (MAR) whose lines can be held or stopped,
   - a story: scenes and beats, some of which are gates
     (a decision, a task of orders, or a crisis against the clock),
   - case rules: what each order does to this patient,
   - a score and a decision log for the debrief.
   ============================================================ */

export const fmtT = t => { const d = Math.floor(t / 1440), m = ((t % 1440) + 1440) % 1440; return `Day ${d} · ${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
const uid = (() => { let n = 0; return p => `${p}${++n}`; })();
const GATES = new Set(['q', 'task', 'crisis']);

const beatValue = b => (b.k === 'q' ? (b.multi ? b.opts.length : 10) : b.k === 'task' || b.k === 'crisis' ? b.pts : 0);
export function maxScore(def) { return def.beats.reduce((n, b) => n + beatValue(b), 0); }

export function initState(def) {
  const s = {
    t: def.start, v: { ...def.vitals }, vh: [], orders: [], results: [], notes: [], nursing: [], problems: [...(def.problems || [])],
    timeline: [], toasts: [], react: [], log: [], answers: {}, tasks: {}, crisis: null, flags: {}, asked: {}, examined: {},
    pts: 0, max: maxScore(def), pos: 0, done: false, ordCount: {},
  };
  snap(s, 'Admission');
  for (const o of def.preOrders || []) addOrder(s, def, o.id, { by: o.by || 'Dr O. Fathy (night)', silent: true, note: o.note });
  return reveal(s, def);
}

/* ---------- helpers that mutate a draft state ---------- */

function snap(s, note) { s.vh.push({ t: s.t, ...s.v, note }); }
function toast(s, kind, text) { s.toasts = [...s.toasts.slice(-3), { id: uid('t'), kind, text, t: s.t }]; }
function line(s, cat, text) { s.timeline.push({ t: s.t, cat, text }); }

function applyVitals(s, fx, note) {
  if (!fx) return;
  if (fx.set) Object.assign(s.v, fx.set);
  if (fx.d) for (const [k, dv] of Object.entries(fx.d)) s.v[k] = Math.round((s.v[k] || 0) + dv);
  if (fx.set || fx.d) snap(s, note);
}

function advance(s, def, min) {
  const end = s.t + min;
  s.t = end;
  // results that have come back
  for (const r of s.results) if (r.status === 'pending' && r.due <= end) {
    r.status = 'resulted';
    toast(s, 'result', `Result: ${r.name}`);
    line(s, 'result', `${r.name} resulted`);
  }
  // delayed effects of orders
  for (const o of s.orders) if (o.pendingFx && o.fxAt <= end) {
    applyVitals(s, o.pendingFx, o.name);
    if (o.pendingSay) toast(s, 'clinical', o.pendingSay);
    o.pendingFx = null;
  }
  // a crisis that has run out of time
  if (s.crisis && end >= s.crisis.deadline) failCrisis(s, def);
}

function ruleFor(def, s, id) {
  return (def.rules?.[id] || []).find(r => !r.when || r.when(s));
}

function addOrder(s, def, id, { by = 'You', silent = false, note } = {}) {
  const c = CAT_BY_ID[id];
  if (!c) return;
  const n = (s.ordCount[id] = (s.ordCount[id] || 0) + 1);
  const o = { oid: uid('o'), id, name: c.name, cat: c.cat, dose: c.dose, route: c.route, freq: c.freq, at: s.t, by, status: c.cat === 'med' || c.cat === 'nurse' ? 'active' : c.stat ? 'given' : 'ordered', note };
  s.orders.push(o);
  if (c.delay != null) {
    const spec = def.results?.[id];
    const res = typeof spec === 'function' ? spec(s, n) : Array.isArray(spec) ? spec[Math.min(n, spec.length) - 1] : spec;
    s.results.push({ rid: uid('r'), id, name: c.name, at: s.t, due: s.t + c.delay, status: 'pending', ...(res || { summary: 'No significant abnormality.' }) });
    o.status = 'sent';
  }
  if (silent) return o;
  line(s, 'order', `${by === 'You' ? 'Ordered' : by + ':'} ${c.name}${c.dose ? ' ' + c.dose : ''}`);
  // what this order does to this patient
  const r = ruleFor(def, s, id);
  if (r) {
    if (r.delay) { o.pendingFx = r.fx; o.fxAt = s.t + r.delay; o.pendingSay = r.say?.[1]; }
    else applyVitals(s, r.fx, c.name);
    if (r.say && !r.delay) s.react.push({ pos: s.pos, who: r.say[0], text: r.say[1], t: s.t, tone: r.harm ? 'harm' : 'good' });
    if (r.flag) Object.assign(s.flags, r.flag);
    if (r.harm) {
      s.pts = Math.max(0, s.pts - (r.harm || 5));
      s.log.push({ t: s.t, what: `Ordered ${c.name}`, verdict: 0, why: r.why || r.say?.[1] || '' });
      toast(s, 'harm', `⚠ ${c.name}: ${r.short || 'harmful in this patient'}`);
    } else if (r.good) {
      s.log.push({ t: s.t, what: `Ordered ${c.name}`, verdict: 2, why: r.why || '' });
    }
  }
  // crisis resolution — and every action costs time while the crisis runs
  const cr = s.crisis;
  if (cr && cr.resolve.includes(id)) resolveCrisis(s, def, id);
  else if (cr) advance(s, def, c.stat ? 2 : 1);
  return o;
}

function setMar(s, oid, status, reason) {
  const o = s.orders.find(x => x.oid === oid);
  if (!o) return;
  o.status = status; o.reason = reason;
  line(s, 'med', `${status === 'stopped' ? 'Discontinued' : status === 'held' ? 'Held' : 'Restarted'}: ${o.name}`);
}

/* ---------- conditions used by tasks ---------- */

export function check(s, cond) {
  const [k, id] = cond.split(':');
  const ords = s.orders.filter(o => o.id === id);
  if (k === 'o') return ords.some(o => o.by === 'You');                                 // you ordered it
  if (k === 'x') return ords.every(o => o.status === 'stopped' || o.status === 'held');  // not active
  if (k === 's') return ords.length > 0 && ords.every(o => o.status === 'stopped');       // discontinued
  if (k === 'h') return !!s.asked[id];
  if (k === 'e') return !!s.examined[id];
  if (k === 'n') return !ords.some(o => o.by === 'You' && o.status !== 'stopped');       // must NOT be on
  return false;
}

/* ---------- the story ---------- */

function enterBeat(s, def, b) {
  if (b.k === 'scene') {
    if (b.t != null && b.t > s.t) advance(s, def, b.t - s.t);
    s.scene = { title: b.title, icon: b.icon, t: s.t }; line(s, 'location', b.title);
  }
  if (b.k === 'event') {
    if (b.t != null && b.t > s.t) advance(s, def, b.t - s.t);
    applyVitals(s, b.fx, b.alarm || 'event');
    if (b.alarm) { toast(s, 'alarm', b.alarm); line(s, 'alarm', b.alarm); }
    if (b.nursing) s.nursing.push({ t: s.t, ...b.nursing });
    if (b.note) s.notes.push({ t: s.t, ...b.note });
    if (b.problem) s.problems = [...s.problems.filter(p => p.id !== b.problem.id), b.problem];
    for (const o of b.orders || []) addOrder(s, def, o, { by: b.by || 'Team', silent: true });
    if (b.flag) Object.assign(s.flags, b.flag);
  }
  if (b.k === 'crisis') {
    s.crisis = { id: b.id, start: s.t, deadline: s.t + b.window, resolve: b.resolve, best: typeof b.best === 'function' ? b.best(s) : b.best || b.resolve, bi: s.pos, title: b.title, ask: b.ask };
    toast(s, 'alarm', b.alarm || b.ask);
  }
}

function resolved(s, b) {
  if (b.k === 'q') return !!s.answers[b.id];
  if (b.k === 'task') return !!s.tasks[b.id];
  if (b.k === 'crisis') return !!s.answers[b.id];
  return true;
}

function reveal(s, def) {
  while (s.pos < def.beats.length) {
    const b = def.beats[s.pos];
    if (b.if && !s['in' + s.pos] && !b.if(s)) { s.max -= beatValue(b); s['in' + s.pos] = true; s.skip = { ...(s.skip || {}), [s.pos]: true }; s.pos++; continue; }
    if (!s['in' + s.pos]) { s['in' + s.pos] = true; enterBeat(s, def, b); }
    if (GATES.has(b.k) && !resolved(s, b)) return s;
    s.pos++;
  }
  s.done = true;
  return s;
}

function resolveCrisis(s, def, id) {
  const cr = s.crisis, b = def.beats[cr.bi], used = s.t - cr.start;
  const best = cr.best.includes(id);
  const pts = best ? Math.max(Math.round(b.pts * 0.6), b.pts - Math.max(0, used - (b.par || 2)) * 2) : Math.round(b.pts / 2);
  s.pts += pts;
  s.answers[b.id] = { id, pts, used };
  s.log.push({ t: s.t, what: `${b.title}: ${CAT_BY_ID[id].name} at +${used} min`, verdict: best ? 2 : 1, why: b.why });
  applyVitals(s, (b.outcomes?.[id]) || b.success, b.title + ' treated');
  if (b.successSay) s.react.push({ pos: s.pos, who: b.successSay[0], text: b.successSay[1], t: s.t, tone: 'good' });
  s.crisis = null;
  reveal(s, def);
}

function failCrisis(s, def) {
  const b = def.beats[s.crisis.bi];
  s.answers[b.id] = { failed: true, pts: 0 };
  s.log.push({ t: s.t, what: `${b.title}: not treated in time`, verdict: 0, why: b.why });
  applyVitals(s, b.fail, b.title + ' — senior took over');
  if (b.failSay) s.react.push({ pos: s.pos, who: b.failSay[0], text: b.failSay[1], t: s.t, tone: 'harm' });
  applyVitals(s, b.success, b.title + ' treated by senior');
  s.crisis = null;
  reveal(s, def);
}

/* ---------- the reducer ---------- */

export function reducer(def) {
  return (prev, a) => {
    const s = structuredClone(prev);
    s.toasts = [];
    switch (a.type) {
      case 'order': addOrder(s, def, a.id); break;
      case 'mar': setMar(s, a.oid, a.status, a.reason); break;
      case 'wait': advance(s, def, a.min); break;
      case 'ask': if (!s.asked[a.id]) { s.asked[a.id] = true; if (!s.crisis) advance(s, def, 1); } break;
      case 'exam': if (!s.examined[a.id]) { s.examined[a.id] = true; if (!s.crisis) advance(s, def, 1); } break;
      case 'decide': {
        const b = def.beats.find(x => x.id === a.qid);
        if (!b || s.answers[b.id]) break;
        if (b.multi) {
          const got = b.opts.filter((o, i) => !!o[1] === a.sel.includes(i)).length;
          s.answers[b.id] = { sel: a.sel, pts: got };
          s.pts += got;
          s.log.push({ t: s.t, what: b.short || b.ask, verdict: got === b.opts.length ? 2 : got >= b.opts.length - 1 ? 1 : 0, why: `${got}/${b.opts.length} right calls` });
        } else {
          const o = b.opts[a.i];
          const pts = [0, 5, 10][o[1]];
          s.answers[b.id] = { i: a.i, pts };
          s.pts += pts;
          s.log.push({ t: s.t, what: b.short || b.ask, verdict: o[1], why: o[2].replace(/<[^>]+>/g, '') });
          if (o[3]) applyVitals(s, o[3], 'consequence');
          if (o[4]) Object.assign(s.flags, o[4]);
        }
        reveal(s, def);
        break;
      }
      case 'task': {
        const b = def.beats.find(x => x.id === a.tid);
        if (!b || s.tasks[b.id]) break;
        const met = b.need.filter(c => check(s, c)).length;
        const pts = Math.round(b.pts * met / b.need.length);
        s.tasks[b.id] = { met, of: b.need.length, pts };
        s.pts += pts;
        s.log.push({ t: s.t, what: b.short || b.ask, verdict: met === b.need.length ? 2 : met >= b.need.length / 2 ? 1 : 0, why: `${met}/${b.need.length} essential actions` + (b.missedWhy && met < b.need.length ? ' — ' + b.missedWhy : '') });
        reveal(s, def);
        break;
      }
      default: break;
    }
    return s;
  };
}
