import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HOSPITALS, CENTRES, SECTION_BY_ID, UNIT_BY_ID, ITEM_BY_ID } from './data/catalog.js';
import { getSession, onAuthChange, isUserAdmin, fetchContent, isSupabaseConfigured } from './supabaseClient.js';
import Home from './pages/Home.jsx';
import SectionPage from './pages/SectionPage.jsx';
import UnitPage from './pages/UnitPage.jsx';
import ItemPage from './pages/ItemPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import NotFound from './pages/NotFound.jsx';
import Art from './components/Art.jsx';
import { Search } from './components/Search.jsx';

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

  const refresh = useCallback(async () => { setContent(await fetchContent()); setLoaded(true); }, []);

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

  return (
    <Ctx.Provider value={ctx}>
      <Header route={route} />
      <main id="main">{page}</main>
      <Footer />
    </Ctx.Provider>
  );
}

/* ---------- header: logo, tabs, search, pill buttons ---------- */

function Header({ route }) {
  const { session, admin } = useApp();
  const tab = route.a === 's' ? route.b : route.a === 'item' ? ITEM_BY_ID[route.b]?.section : route.a || 'home';
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <a href="#/" className="logo" aria-label="Virtual Teaching Hospital — home">
          <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 35C8 26 3 19 3 12.5 3 7.5 7 4 11.5 4c3.4 0 6.4 2 8.5 5 2.1-3 5.1-5 8.5-5C33 4 37 7.5 37 12.5 37 19 32 26 20 35z" fill="#C4122F" /><path d="M8 19h6l2.4-5 4 9 3-6 1.6 2H32" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span><b>VTH</b><i>Virtual Teaching<br />Hospital</i></span>
        </a>
        <nav className="hdr-tabs" aria-label="Main">
          <a href="#/" className={tab === 'home' ? 'on' : ''}>Home</a>
          <a href="#/s/cardiology" className={tab === 'cardiology' ? 'on' : ''}>Cardiology</a>
          <a href="#/s/internal" className={tab === 'internal' ? 'on' : ''}>Internal Medicine</a>
        </nav>
        <div className="hdr-search"><Search compact /></div>
        <div className="hdr-pills">
          <a href="#/s/conference" className={'pill-btn' + (tab === 'conference' ? ' on' : '')}>Conferences</a>
          <a href="#/s/tests" className={'pill-btn' + (tab === 'tests' ? ' on' : '')}>Tests</a>
          <a href="#/account" className={'pill-btn' + (tab === 'account' ? ' on' : '')}>{session ? (admin ? 'Admin' : 'My account') : 'Sign in'}</a>
        </div>
      </div>
    </header>
  );
}

/** The floating white pill menu that sits on every hero and sticks on scroll. */
export function PillNav({ current }) {
  const [open, setOpen] = useState(null);
  const items = [...HOSPITALS, ...CENTRES];
  return (
    <nav className="pillnav" aria-label="Sections" onMouseLeave={() => setOpen(null)}>
      <a href="#/" className="pillnav-home" aria-label="Home"><svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg></a>
      {items.map(s => (
        <div key={s.id} className="pillnav-item" onMouseEnter={() => setOpen(s.id)}>
          <a href={`#/s/${s.id}`} className={current === s.id ? 'on' : ''}>{s.name.replace(' Hospital', '')}</a>
          {open === s.id && (
            <div className="pillnav-drop">
              <a className="pillnav-all" href={`#/s/${s.id}`}>{s.icon} All of the {s.name} →</a>
              <div className="pillnav-grid">{s.units.map(u => <a key={u.id} href={`#/s/${s.id}/${u.id}`}><span>{u.icon}</span>{u.name}</a>)}</div>
            </div>
          )}
        </div>
      ))}
      <a href="#/account" className="pillnav-acc">My account</a>
    </nav>
  );
}

/** Big rounded hero card with drawn cover art, the pill menu and a slab headline. */
export function Hero({ id, color, icon, current, crumbs, kicker, title, light, sub, small, children }) {
  return (
    <section className={'wrap hero-card' + (small ? ' small' : '')}>
      <Art id={id} color={color} icon={icon} dark />
      <div className="hero-shade" />
      <PillNav current={current} />
      <div className="hero-copy">
        {crumbs && <Crumbs items={crumbs} />}
        {kicker && <span className="kicker">{kicker}</span>}
        <h1><b>{title}</b>{light && <span>{light}</span>}</h1>
        {sub && <p>{sub}</p>}
        {children}
      </div>
      <i className="dot d1" /><i className="dot d2" /><i className="dot d3" />
    </section>
  );
}

export function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <a href="#/">Home</a>
      {items.map(([label, href], i) => <React.Fragment key={i}><span>›</span>{href ? <a href={href}>{label}</a> : <b>{label}</b>}</React.Fragment>)}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr-cols">
        {[...HOSPITALS, ...CENTRES].map(s => (
          <div key={s.id}>
            <h4>{s.icon} {s.name}</h4>
            <ul>{s.units.slice(0, 6).map(u => <li key={u.id}><a href={`#/s/${s.id}/${u.id}`}>{u.name}</a></li>)}
              {s.units.length > 6 && <li><a href={`#/s/${s.id}`}>All {s.units.length} units →</a></li>}
            </ul>
          </div>
        ))}
      </div>
      <div className="wrap ftr-base">
        <span>© {new Date().getFullYear()} Virtual Teaching Hospital — for medical education only. Composite teaching cases; not medical advice.</span>
        <a href="#/account">My account</a>
      </div>
    </footer>
  );
}
