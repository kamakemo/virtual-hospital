import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HOSPITALS, CENTRES, SECTION_BY_ID, UNIT_BY_ID, ITEM_BY_ID } from './data/catalog.js';
import { getSession, onAuthChange, isUserAdmin, fetchContent, isSupabaseConfigured } from './supabaseClient.js';
import Home from './pages/Home.jsx';
import SectionPage from './pages/SectionPage.jsx';
import UnitPage from './pages/UnitPage.jsx';
import ItemPage from './pages/ItemPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import NotFound from './pages/NotFound.jsx';

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

/* ---------- header with mega menu ---------- */

function Header({ route }) {
  const { session, admin } = useApp();
  const [open, setOpen] = useState(null);
  const [mobile, setMobile] = useState(false);
  useEffect(() => { setOpen(null); setMobile(false); }, [route]);
  const active = id => route.a === 's' && route.b === id;
  return (
    <header className="hdr">
      <div className="hdr-util">
        <div className="wrap hdr-util-in">
          <span>Virtual Teaching Hospital · Cardiology & Internal Medicine</span>
          <nav>
            <a href="#/s/conference">Conference Centre</a>
            <a href="#/s/tests">Test Centre</a>
            <a href="#/account" className="hdr-acc">{session ? (admin ? '⚙️ My account · Admin' : '👤 My account') : '🔐 Sign in'}</a>
          </nav>
        </div>
      </div>
      <div className="hdr-main">
        <div className="wrap hdr-main-in">
          <a href="#/" className="logo" aria-label="Home">
            <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#0A2A5E" /><path d="M8 26h8l3-8 5 16 4-12 3 4h9" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span><b>Virtual Teaching</b><i>Hospital</i></span>
          </a>
          <button className="hdr-burger" aria-label="Menu" aria-expanded={mobile} onClick={() => setMobile(m => !m)}>☰</button>
          <nav className={'hdr-nav' + (mobile ? ' open' : '')} onMouseLeave={() => setOpen(null)}>
            {[...HOSPITALS, ...CENTRES].map(s => (
              <div key={s.id} className={'hdr-item' + (active(s.id) ? ' on' : '')} onMouseEnter={() => setOpen(s.id)}>
                <a href={`#/s/${s.id}`} onFocus={() => setOpen(s.id)}>{s.name}</a>
                {open === s.id && (
                  <div className="mega" style={{ '--c': s.color }}>
                    <div className="wrap mega-in">
                      <div className="mega-lead">
                        <span className="mega-ic">{s.icon}</span>
                        <h3>{s.name}</h3>
                        <p>{s.tagline}</p>
                        <a className="btn" href={`#/s/${s.id}`}>Enter the {s.short === 'Tests' ? 'Test Centre' : s.short === 'Conferences' ? 'Conference Centre' : 'hospital'} →</a>
                      </div>
                      <ul className="mega-list">
                        {s.units.map(u => <li key={u.id}><a href={`#/s/${s.id}/${u.id}`}><span>{u.icon}</span>{u.name}</a></li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="hdr-item hdr-item-acc"><a href="#/account">{session ? 'My account' : 'Sign in'}</a></div>
          </nav>
        </div>
      </div>
    </header>
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
              {s.units.length > 6 && <li><a href={`#/s/${s.id}`}>All {s.units.length} {s.id === 'tests' ? 'tracks' : s.id === 'conference' ? 'halls' : 'units'} →</a></li>}
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
