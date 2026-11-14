import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp, Hero } from '../App.jsx';
import { SECTIONS, UNIT_BY_ID, ITEM_BY_ID, itemWord } from '../data/catalog.js';
import { signIn, signUp, resetPassword, signInWithGoogle, signOut, saveContent, removeContent, loadHtml } from '../supabaseClient.js';
import HtmlFrame from '../components/HtmlFrame.jsx';

export default function AccountPage() {
  const { session, admin, demo } = useApp();
  return (
    <>
      <Hero id="account-hero" color="var(--lime)" icon={admin ? '⚙️' : '👤'} small crumbs={[['My account']]} title="My account"
        sub={session ? session.user.email : demo ? 'Demo mode — no sign-in needed on this preview' : 'Sign in to open published cases'} />
      <section className="wrap sec">
        {demo && <div className="note">🧪 <b>Demo mode.</b> This copy of the site is not connected to the database, so the admin panel saves uploads in this browser only. On the live site, uploads are stored in Supabase and visible to everyone.</div>}
        {!session && !demo && <SignIn />}
        {session && <Profile />}
        {admin && <AdminPanel />}
        {session && !admin && !demo && <p className="muted">Your account is not an admin. Ask an administrator to add your email to the <code>admins</code> table to upload content.</p>}
      </section>
    </>
  );
}

/* ---------- sign in / sign up ---------- */

function SignIn() {
  const [mode, setMode] = useState('in');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = mode === 'in' ? await signIn(email, pw) : mode === 'up' ? await signUp(email, pw) : await resetPassword(email);
    setBusy(false);
    if (r.error) setMsg({ bad: true, t: r.error.message });
    else if (mode === 'up') setMsg({ t: 'Account created. Check your email to confirm it, then sign in.' });
    else if (mode === 'reset') setMsg({ t: 'Password-reset email sent.' });
  };
  return (
    <form className="card auth" onSubmit={submit}>
      <div className="tabs">
        {[['in', 'Sign in'], ['up', 'Create account'], ['reset', 'Forgot password']].map(([k, l]) => <button type="button" key={k} className={mode === k ? 'on' : ''} onClick={() => setMode(k)}>{l}</button>)}
      </div>
      <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
      {mode !== 'reset' && <label>Password<input type="password" required minLength={6} value={pw} onChange={e => setPw(e.target.value)} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} /></label>}
      <button className="btn" disabled={busy}>{busy ? '…' : mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create account' : 'Send reset email'}</button>
      <button type="button" className="btn btn-line" onClick={() => signInWithGoogle()}>Continue with Google</button>
      {msg && <p className={msg.bad ? 'err' : 'ok'}>{msg.t}</p>}
    </form>
  );
}

function Profile() {
  const { session, admin } = useApp();
  return (
    <div className="card profile">
      <div><b>{session.user.email}</b><span>{admin ? 'Administrator' : 'Learner'}</span></div>
      <button className="btn btn-line" onClick={() => signOut()}>Sign out</button>
    </div>
  );
}

/* ---------- admin panel ---------- */

function AdminPanel() {
  const { content } = useApp();
  const [sec, setSec] = useState(SECTIONS[0].id);
  const [unitId, setUnitId] = useState(SECTIONS[0].units[0].id);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  // arriving from an item's "Upload" button opens that item
  useEffect(() => {
    const id = sessionStorage.getItem('vh-admin-item');
    if (id && ITEM_BY_ID[id]) {
      sessionStorage.removeItem('vh-admin-item');
      const it = ITEM_BY_ID[id];
      setSec(it.section); setUnitId(it.unit); setOpen(id);
      setTimeout(() => document.getElementById('row-' + id)?.scrollIntoView({ block: 'center' }), 50);
    }
  }, []);

  const section = SECTIONS.find(s => s.id === sec);
  const unit = UNIT_BY_ID[unitId];
  const search = q.trim().toLowerCase();
  const rows = useMemo(() => search.length >= 2
    ? Object.values(ITEM_BY_ID).filter(it => it.title.toLowerCase().includes(search) || it.id.includes(search))
    : unit.items, [search, unit]);

  const total = Object.values(ITEM_BY_ID).length, done = Object.keys(content).filter(k => ITEM_BY_ID[k]).length;

  return (
    <div className="admin">
      <div className="admin-h">
        <h2>⚙️ Admin panel — HTML content</h2>
        <span className="pill pill-on">{done} / {total} published</span>
      </div>
      <p className="muted">Pick a hospital or centre, then a unit, and upload one HTML file per case. The file is published immediately and opens on the case page.</p>
      <div className="admin-tabs">
        {SECTIONS.map(s => {
          const n = s.units.reduce((k, u) => k + u.items.filter(it => content[it.id]).length, 0);
          return <button key={s.id} className={sec === s.id ? 'on' : ''} style={{ '--c': s.color }} onClick={() => { setSec(s.id); setUnitId(s.units[0].id); setQ(''); }}>{s.icon} {s.name} <small>{n}/{s.units.length * 12}</small></button>;
        })}
      </div>
      <input className="admin-search" type="search" placeholder="Search every title or id…" value={q} onChange={e => setQ(e.target.value)} />
      <div className="admin-body">
        {!search && (
          <ul className="admin-units">
            {section.units.map(u => {
              const n = u.items.filter(it => content[it.id]).length;
              return <li key={u.id}><button className={u.id === unitId ? 'on' : ''} onClick={() => { setUnitId(u.id); setOpen(null); }}><span>{u.icon} {u.name}</span><small>{n}/12</small></button></li>;
            })}
          </ul>
        )}
        <div className="admin-rows">
          {!search && <h3>{unit.icon} {unit.name}</h3>}
          {search && <h3>🔎 {rows.length} result{rows.length === 1 ? '' : 's'}</h3>}
          {rows.map(it => <AdminRow key={it.id} item={it} open={open === it.id} onToggle={() => setOpen(o => (o === it.id ? null : it.id))} showUnit={!!search} />)}
        </div>
      </div>
    </div>
  );
}

function AdminRow({ item, open, onToggle, showUnit }) {
  const { content, setContent } = useApp();
  const entry = content[item.id];
  const [file, setFile] = useState(null);       // { name, html }
  const [title, setTitle] = useState(entry?.title || item.title);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);
  useEffect(() => { setTitle(entry?.title || item.title); }, [entry, item.title]);

  const read = async f => {
    if (!f) return;
    if (!/\.html?$/i.test(f.name) && f.type !== 'text/html') { setMsg({ bad: true, t: 'Choose an .html file.' }); return; }
    const html = await f.text();
    setFile({ name: f.name, html }); setPreview(html); setMsg(null);
  };
  const publish = async () => {
    if (!file) return;
    setBusy(true); setMsg(null);
    const r = await saveContent(item, { html: file.html, fileName: file.name, title: title.trim() || item.title });
    setBusy(false);
    if (r.error) { setMsg({ bad: true, t: r.error.message || 'Upload failed.' }); return; }
    setContent(c => ({ ...c, [item.id]: r.data }));
    setFile(null);
    setMsg({ t: '✅ Published.' });
  };
  const remove = async () => {
    if (!window.confirm(`Remove the HTML for “${item.title}”? The case goes back to “Coming soon”.`)) return;
    setBusy(true);
    const r = await removeContent(item, entry);
    setBusy(false);
    if (r.error) { setMsg({ bad: true, t: r.error.message }); return; }
    setContent(c => { const n = { ...c }; delete n[item.id]; return n; });
    setPreview(null); setMsg({ t: 'Removed.' });
  };
  const showCurrent = async () => {
    try { setPreview(await loadHtml(entry)); } catch (e) { setMsg({ bad: true, t: e.message }); }
  };

  return (
    <div id={'row-' + item.id} className={'arow' + (open ? ' open' : '') + (entry ? ' ready' : '')}>
      <button className="arow-h" onClick={onToggle} aria-expanded={open}>
        <span className="case-n">{String(item.n).padStart(2, '0')}</span>
        <span className="arow-t">{entry?.title || item.title}{showUnit && <small>{UNIT_BY_ID[item.unit].name}</small>}</span>
        <span className={'pill' + (entry ? ' pill-on' : '')}>{entry ? '● Published' : 'Empty'}</span>
      </button>
      {open && (
        <div className="arow-b">
          <div className={'drop' + (drag ? ' over' : '')}
            onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); read(e.dataTransfer.files[0]); }}
            onClick={() => input.current?.click()} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && input.current?.click()}>
            <input ref={input} type="file" accept=".html,.htm,text/html" hidden onChange={e => read(e.target.files[0])} />
            {file ? <><b>📄 {file.name}</b><span>{(file.html.length / 1024).toFixed(0)} KB — ready to publish</span></>
              : <><b>⬆️ Drop an HTML file here or click to choose</b><span>{entry ? `Current file: ${entry.fileName || 'uploaded'} — a new file replaces it` : 'One self-contained .html file for this ' + itemWord(item.section).toLowerCase()}</span></>}
          </div>
          <label className="arow-title">Title shown on the site<input value={title} onChange={e => setTitle(e.target.value)} /></label>
          <div className="arow-actions">
            <button className="btn" disabled={!file || busy} onClick={publish}>{busy ? 'Working…' : entry ? '⬆️ Replace & publish' : '⬆️ Publish'}</button>
            {entry && !file && <button className="btn btn-line" onClick={showCurrent}>👁️ Preview current</button>}
            {entry && <a className="btn btn-line" href={`#/item/${item.id}`}>Open the page →</a>}
            {entry && <button className="btn btn-danger" disabled={busy} onClick={remove}>🗑️ Remove</button>}
            {msg && <span className={msg.bad ? 'err' : 'ok'}>{msg.t}</span>}
          </div>
          {preview != null && <HtmlFrame html={preview} title={`Preview — ${title}`} tall={false} />}
        </div>
      )}
    </div>
  );
}
