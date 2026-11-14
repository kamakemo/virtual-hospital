import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HOSPITALS, CENTRES, SECTION_BY_ID, UNIT_BY_ID, ITEM_BY_ID } from './data/catalog.js';
import { getSession, onAuthChange, isUserAdmin, fetchContent, isSupabaseConfigured } from './supabaseClient.js';
import Home from './pages/Home.jsx';
import SectionPage from './pages/SectionPage.jsx';
import UnitPage from './pages/UnitPage.jsx';
import ItemPage from './pages/ItemPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import NotFound from './pages/NotFound.jsx';
import Glyph from './components/Art.jsx';
import Palette from './components/Palette.jsx';
import { BUILTIN } from './data/builtin.js';

/* ============================================================
   VIRTUAL TEACHING HOSPITAL
   Hash routes:
     #/                         home
     #/s/<section>              a hospital or a centre
     #/s/<section>/<unit>       a unit and its 12 items
     #/item/<id>                one case / session / test
     #/account                  sign in, profile, admin panel
   ============================================================ */

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

function parse() {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [a, b, c] = h.split('/').filter(Boolean).map(decodeURIComponent);
  return { a: a || '', b, c };
}
export const go = path => { window.location.hash = path; };

export default function App() {
  const [route, setRoute] = useState(parse);
  const [session, setSession] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [content, setContent] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const refresh = useCallback(async () => { setContent({ ...BUILTIN, ...(await fetchContent()) }); setLoaded(true); }, []);

  useEffect(() => {
    getSession().then(setSession);
    return onAuthChange(setSession);
  }, []);
  useEffect(() => {
    isUserAdmin(session?.user?.email).then(setAdmin);
    refresh();
  }, [session, refresh]);

  const ctx = useMemo(() => ({ session, admin, content, loaded, refresh, setContent, demo: !isSupabaseConfigured() }), [session, admin, content, loaded, refresh]);

  let page;
  const { a, b, c } = route;
  if (!a) page = <Home />;
  else if (a === 's' && SECTION_BY_ID[b] && !c) page = <SectionPage section={SECTION_BY_ID[b]} />;
  else if (a === 's' && SECTION_BY_ID[b] && UNIT_BY_ID[c]?.section === b) page = <UnitPage section={SECTION_BY_ID[b]} unit={UNIT_BY_ID[c]} />;
  else if (a === 'item' && ITEM_BY_ID[b]) page = <ItemPage item={ITEM_BY_ID[b]} />;
  else if (a === 'account') page = <AccountPage />;
  else page = <NotFound />;

  const [palette, setPalette] = useState(false);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('vth-theme') || 'dark'; } catch { return 'dark'; } });
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('vth-theme', theme); } catch { /* private mode */ } }, [theme]);
  useEffect(() => {
    const key = e => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName))) { e.preventDefault(); setPalette(true); }
    };
    // cards with .spot follow the pointer with a soft light
    const move = e => { const el = e.target.closest?.('.spot'); if (!el) return; const r = el.getBoundingClientRect(); el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`); };
    window.addEventListener('keydown', key); window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('pointermove', move); };
  }, []);
  useEffect(() => setPalette(false), [route]);

  return (
    <Ctx.Provider value={ctx}>
      <Header route={route} onSearch={() => setPalette(true)} theme={theme} onTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))} />
      <main id="main" key={route.a + route.b + route.c}>{page}</main>
      <Footer />
      {palette && <Palette onClose={() => setPalette(false)} />}
    </Ctx.Provider>
  );
}

/* ---------- brand ---------- */

/** The mark: a V whose stroke runs on into a heartbeat. */
export function Mark({ size = 34 }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="var(--lime)" />
      <path d="M7 11l7 18 5-13 3 7 2.5-5 2 4H34" fill="none" stroke="#07090F" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Header({ route, onSearch, theme, onTheme }) {
  const { session, admin } = useApp();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [route]);
  const tab = route.a === 's' ? route.b : route.a === 'item' ? ITEM_BY_ID[route.b]?.section : route.a || 'home';
  return (
    <header className="hdr">
      <div className="hdr-bar">
        <a href="#/" className="logo" aria-label="Virtual Teaching Hospital — home">
          <Mark />
          <span><b>VTH</b><i>virtual teaching hospital</i></span>
        </a>
        <nav className={'hdr-nav' + (open ? ' open' : '')} aria-label="Main">
          {[...HOSPITALS, ...CENTRES].map(s => <a key={s.id} href={`#/s/${s.id}`} className={tab === s.id ? 'on' : ''} style={{ '--c': s.color }}><i />{s.short}</a>)}
        </nav>
        <button className="hdr-search" onClick={onSearch} aria-label="Search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg><span>Search</span><kbd>⌘K</kbd></button>
        <button className="hdr-ic" onClick={onTheme} aria-label="Switch theme">{theme === 'dark' ? '☀' : '☾'}</button>
        <a href="#/account" className="btn btn-sm">{session ? (admin ? 'Admin' : 'Account') : 'Sign in'}</a>
        <button className="hdr-ic hdr-burger" onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open}>≡</button>
      </div>
    </header>
  );
}

/** Page head for every inner page: breadcrumb, oversized title, the section's aura. */
export function Hero({ id, color = 'var(--lime)', icon, crumbs, title, light, sub, children }) {
  return (
    <section className="phead" style={{ '--c': color }}>
      <div className="aura" />
      <div className="wrap phead-in">
        {crumbs && <Crumbs items={crumbs} />}
        <div className="phead-row">
          <h1 className="rise">{title}</h1>
          {icon && <span className="phead-ic rise" style={{ '--i': 1 }}>{icon}</span>}
        </div>
        {light && <p className="phead-lede rise" style={{ '--i': 1 }}>{light}</p>}
        {sub && <p className="mono rise" style={{ '--i': 2 }}>{sub}</p>}
        {children}
      </div>
      <Glyph id={id} color={color} className="phead-glyph" />
    </section>
  );
}

export function Crumbs({ items }) {
  return (
    <nav className="crumbs mono" aria-label="Breadcrumb">
      <a href="#/">Home</a>
      {items.map(([label, href], i) => <React.Fragment key={i}><span>/</span>{href ? <a href={href}>{label}</a> : <b>{label}</b>}</React.Fragment>)}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-big"><Mark size={56} /><span>Learn medicine<br />where it <em>happens</em>.</span></div>
        <div className="ftr-cols">
          {[...HOSPITALS, ...CENTRES].map(s => (
            <div key={s.id} style={{ '--c': s.color }}>
              <h4><i />{s.name}</h4>
              <ul>{s.units.slice(0, 6).map(u => <li key={u.id}><a href={`#/s/${s.id}/${u.id}`}>{u.name}</a></li>)}
                {s.units.length > 6 && <li><a href={`#/s/${s.id}`}>All {s.units.length} units →</a></li>}
              </ul>
            </div>
          ))}
        </div>
        <div className="ftr-base mono">
          <span>© {new Date().getFullYear()} Virtual Teaching Hospital · for medical education only · composite teaching cases, not medical advice</span>
          <a href="#/account">My account</a>
        </div>
      </div>
    </footer>
  );
}
