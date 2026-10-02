import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TopBar, Footer, Page } from './ui/Chrome.jsx';
import { useRouter, Loading, EmptyState, Button, Divider } from './ui/kit.jsx';
import Home from './views/Home.jsx';
import Department from './views/Department.jsx';
import Unit from './views/Unit.jsx';
import CaseReader from './views/CaseReader.jsx';
import LibraryItemView from './views/LibraryItem.jsx';
import Auth from './views/Auth.jsx';
import { ConferencesList, ConferenceView, SessionView } from './views/Conferences.jsx';
import { DEPARTMENTS, isVisible } from './data/curriculum.js';
import {
  supabase, isSupabaseConfigured, signOut,
  fetchAllCases, fetchLibraryItems, fetchAllConferences,
  fetchProgress, saveProgress,
} from './supabaseClient.js';

const EMPTY_PROGRESS = {
  xp: 0,
  completedStages: {},
  mcqScores: {},
  badges: [],
  conferenceProgress: {},
};

/* A thrown render error used to blank the page entirely. Now it shows what
   broke, with a way back into the app. */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('[VTH]', error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Page>
        <div className="max-w-read">
          <h1 className="display text-[28px] text-crit mb-3">This page failed to load</h1>
          <p className="text-[14px] text-ink-2 mb-5">
            Something in the hospital threw an error. The detail below is what went wrong.
          </p>
          <pre className="text-[12px] bg-sunk border border-line rounded-panel p-4 overflow-x-auto whitespace-pre-wrap text-ink-2">
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => { this.setState({ error: null }); window.history.replaceState({ route: { name: 'home' } }, ''); window.location.reload(); }}>
              Back to the hospital
            </Button>
          </div>
        </div>
      </Page>
    );
  }
}

export default function App() {
  const [route, navigate] = useRouter({ name: 'home' });
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [cases, setCases] = useState([]);
  const [library, setLibrary] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [dataReady, setDataReady] = useState(false);

  const [progress, setProgress] = useState(EMPTY_PROGRESS);
  const saveTimer = useRef(null);
  const progressLoaded = useRef(false);

  /* ---------- auth ---------- */
  useEffect(() => {
    if (!isSupabaseConfigured()) { setAuthReady(true); return; }
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data?.session || null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s || null);
      setAuthReady(true);
    });
    return () => { cancelled = true; sub?.subscription?.unsubscribe(); };
  }, []);

  /* ---------- content ---------- */
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const [c, l, f] = await Promise.all([
        fetchAllCases(), fetchLibraryItems(), fetchAllConferences(),
      ]);
      if (cancelled) return;
      // Retired departments (the prehospital field) still have rows in the
      // database; they are simply never surfaced.
      setCases((c || []).filter(isVisible));
      setLibrary((l || []).filter(isVisible));
      setConferences(f || []);
      setDataReady(true);
    })();
    return () => { cancelled = true; };
  }, [session]);

  /* ---------- progress ---------- */
  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    (async () => {
      const p = await fetchProgress(session.user.id);
      if (!cancelled) {
        setProgress({ ...EMPTY_PROGRESS, ...(p || {}) });
        progressLoaded.current = true;
      }
    })();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id || !progressLoaded.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProgress(session.user.id, progress);
    }, 900);
    return () => clearTimeout(saveTimer.current);
  }, [progress, session?.user?.id]);

  const onSignOut = useCallback(async () => {
    await signOut();
    progressLoaded.current = false;
    setProgress(EMPTY_PROGRESS);
    setCases([]); setLibrary([]); setConferences([]);
    setDataReady(false);
    navigate({ name: 'home' }, { replace: true });
  }, [navigate]);

  const caseById = useMemo(() => {
    const m = {};
    for (const c of cases) m[c.id] = c;
    return m;
  }, [cases]);

  const libraryById = useMemo(() => {
    const m = {};
    for (const l of library) m[l.id] = l;
    return m;
  }, [library]);

  const counts = useMemo(() => ({
    cases: cases.length,
    units: DEPARTMENTS.reduce((n, d) => n + d.units.length, 0),
    library: library.length,
    conferences: conferences.length,
  }), [cases, library, conferences]);

  /* ---------- gates ---------- */
  if (!isSupabaseConfigured()) {
    return (
      <Page>
        <EmptyState
          title="Supabase is not configured"
          body="Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the environment, then reload."
        />
      </Page>
    );
  }

  if (!authReady) return <div className="loading-bar" />;
  if (!session) return <Auth />;

  const shared = { cases, library, conferences, progress, setProgress, navigate };

  let screen;
  switch (route.name) {
    case 'department':
      screen = <Department deptId={route.deptId} {...shared} />;
      break;
    case 'unit':
      screen = <Unit deptId={route.deptId} unitId={route.unitId} {...shared} />;
      break;
    case 'case':
      screen = (
        <CaseReader
          caseData={caseById[route.caseId]}
          deptId={route.deptId}
          unitId={route.unitId}
          progress={progress}
          setProgress={setProgress}
          navigate={navigate}
        />
      );
      break;
    case 'libraryItem':
      screen = (
        <LibraryItemView
          item={libraryById[route.itemId]}
          deptId={route.deptId}
          unitId={route.unitId}
          navigate={navigate}
        />
      );
      break;
    case 'conferences':
      screen = <ConferencesList conferences={conferences} progress={progress} navigate={navigate} />;
      break;
    case 'conference':
      screen = <ConferenceView conferenceId={route.conferenceId} progress={progress} navigate={navigate} />;
      break;
    case 'session':
      screen = (
        <SessionView
          conferenceId={route.conferenceId}
          sessionId={route.sessionId}
          progress={progress}
          setProgress={setProgress}
          navigate={navigate}
        />
      );
      break;
    case 'home':
    default:
      screen = dataReady
        ? <Home {...shared} />
        : <Page><Loading label="Opening the hospital…" /></Page>;
  }

  // The case and library readers bring their own full-width chrome.
  const bare = route.name === 'case' || route.name === 'libraryItem';

  return (
    <div className="min-h-full flex flex-col">
      <TopBar route={route} navigate={navigate} session={session} onSignOut={onSignOut} />
      <div key={`${route.name}:${route.deptId || ''}:${route.unitId || route.caseId || route.itemId || route.conferenceId || ''}:${route.sessionId || ''}`}
        className="flex-1">
        <ErrorBoundary>{screen}</ErrorBoundary>
      </div>
      {!bare && <Footer navigate={navigate} counts={counts} />}
    </div>
  );
}
