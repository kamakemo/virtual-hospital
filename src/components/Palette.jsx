import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ITEM_BY_ID, UNIT_BY_ID, SECTION_BY_ID, SECTIONS } from '../data/catalog.js';

/* ⌘K — one box that reaches every hospital, unit, case, session and test. */

const UNITS = Object.values(UNIT_BY_ID).map(u => ({ kind: 'Unit', title: u.name, sub: SECTION_BY_ID[u.section].name, href: `#/s/${u.section}/${u.id}`, color: SECTION_BY_ID[u.section].color, icon: u.icon }));
const ITEMS = Object.values(ITEM_BY_ID).map(it => ({ kind: it.section === 'tests' ? 'Test' : it.section === 'conference' ? 'Session' : 'Case', title: it.title, sub: UNIT_BY_ID[it.unit].name, href: `#/item/${it.id}`, color: SECTION_BY_ID[it.section].color, icon: UNIT_BY_ID[it.unit].icon }));
const START = SECTIONS.map(s => ({ kind: 'Go to', title: s.name, sub: s.tagline, href: `#/s/${s.id}`, color: s.color, icon: s.icon }));

export default function Palette({ onClose }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef(null), list = useRef(null);
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return START;
    const words = t.split(/\s+/);
    const ok = x => words.every(w => (x.title + ' ' + x.sub).toLowerCase().includes(w));
    return [...UNITS.filter(ok), ...ITEMS.filter(ok)].slice(0, 30);
  }, [q]);
  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => setSel(0), [q]);
  useEffect(() => { list.current?.children[sel]?.scrollIntoView({ block: 'nearest' }); }, [sel]);
  const key = e => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(hits.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
    else if (e.key === 'Enter' && hits[sel]) { window.location.hash = hits[sel].href; onClose(); }
  };
  return (
    <div className="pal-back" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="pal" role="dialog" aria-label="Search">
        <div className="pal-in">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <input ref={input} id="pal-q" value={q} onChange={e => setQ(e.target.value)} onKeyDown={key} placeholder="Search 468 cases, sessions and tests…" autoComplete="off" aria-label="Search" />
          <kbd>esc</kbd>
        </div>
        <ul ref={list} className="pal-list">
          {hits.map((x, i) => (
            <li key={x.href}><a href={x.href} className={i === sel ? 'on' : ''} style={{ '--c': x.color }} onMouseEnter={() => setSel(i)} onClick={onClose}>
              <span className="pal-ic">{x.icon}</span><span className="pal-t"><b>{x.title}</b><small>{x.sub}</small></span><span className="mono pal-k">{x.kind}</span>
            </a></li>
          ))}
          {!hits.length && <li className="pal-none">Nothing matches “{q}”.</li>}
        </ul>
        <div className="pal-foot mono"><span>↑↓ move</span><span>↵ open</span><span>{hits.length} result{hits.length === 1 ? '' : 's'}</span></div>
      </div>
    </div>
  );
}
