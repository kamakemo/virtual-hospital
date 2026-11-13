import React, { useMemo, useState } from 'react';
import { ITEM_BY_ID, UNIT_BY_ID, SECTION_BY_ID } from '../data/catalog.js';

const ALL = Object.values(ITEM_BY_ID);

/** Site-wide search over every case, session and test title. */
export function Search() {
  const [q, setQ] = useState('');
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return ALL.filter(it => it.title.toLowerCase().includes(t) || UNIT_BY_ID[it.unit].name.toLowerCase().includes(t)).slice(0, 12);
  }, [q]);
  return (
    <div className="search">
      <label htmlFor="q">🔎 Search all cases, sessions and tests</label>
      <input id="q" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. tamponade, DKA, aortic stenosis, MRCP…" autoComplete="off" />
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
