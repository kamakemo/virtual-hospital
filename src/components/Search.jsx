import React, { useEffect, useMemo, useState } from 'react';
import { ITEM_BY_ID, UNIT_BY_ID, SECTION_BY_ID } from '../data/catalog.js';

const ALL = Object.values(ITEM_BY_ID);

/** Site-wide search over every case, session and test title. */
export function Search({ compact = false }) {
  const [q, setQ] = useState('');
  useEffect(() => { const on = () => setQ(''); window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on); }, []);
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return ALL.filter(it => it.title.toLowerCase().includes(t) || UNIT_BY_ID[it.unit].name.toLowerCase().includes(t)).slice(0, 12);
  }, [q]);
  return (
    <div className={'search' + (compact ? ' compact' : '')} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setTimeout(() => setQ(''), 150); }}>
      {!compact && <label htmlFor="q">🔎 Search all cases, sessions and tests</label>}
      <input id={compact ? 'q-top' : 'q'} type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={compact ? 'Search cases, sessions, tests' : 'e.g. tamponade, DKA, aortic stenosis, MRCP…'} aria-label="Search" autoComplete="off" />
      {compact && <svg className="search-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}
      {hits.length > 0 && (
        <ul className="search-hits">
          {hits.map(it => (
            <li key={it.id}><a href={`#/item/${it.id}`}><b>{it.title}</b><span>{SECTION_BY_ID[it.section].name} · {UNIT_BY_ID[it.unit].name}</span></a></li>
          ))}
        </ul>
      )}
      {q.trim().length >= 2 && !hits.length && <p className="search-none">No match.</p>}
    </div>
  );
}
