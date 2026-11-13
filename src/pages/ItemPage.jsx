import React, { useEffect, useState } from 'react';
import { useApp, Hero } from '../App.jsx';
import { SECTION_BY_ID, UNIT_BY_ID, itemWord } from '../data/catalog.js';
import { loadHtml } from '../supabaseClient.js';
import HtmlFrame from '../components/HtmlFrame.jsx';

export default function ItemPage({ item }) {
  const { content, loaded, session, admin, demo } = useApp();
  const section = SECTION_BY_ID[item.section], unit = UNIT_BY_ID[item.unit];
  const entry = content[item.id];
  const [html, setHtml] = useState(null);
  const [err, setErr] = useState(null);
  const title = entry?.title || item.title;

  useEffect(() => {
    setHtml(null); setErr(null);
    if (entry) loadHtml(entry).then(setHtml).catch(e => setErr(e.message));
  }, [entry]);

  const i = unit.items.indexOf(item);
  const prev = unit.items[i - 1], next = unit.items[i + 1];

  return (
    <>
      <Hero id={item.id + '-hero'} color={section.color} icon={unit.icon} current={section.id} small
        crumbs={[[section.name, `#/s/${section.id}`], [unit.name, `#/s/${section.id}/${unit.id}`], [`${itemWord(section.id)} ${item.n}`]]}
        title={title} sub={`${unit.name} · ${itemWord(section.id)} ${item.n} of 12`} />
      <section className="wrap panel">
        {!loaded && <p className="muted">Loading…</p>}
        {loaded && !entry && (
          <div className="empty">
            <span>🛠️</span>
            <h2>Coming soon</h2>
            <p>This {itemWord(section.id).toLowerCase()} has its title but no content yet.</p>
            {!session && !demo && <p className="muted">Published content may need you to <a href="#/account">sign in</a> first.</p>}
            {admin && <a className="btn" href="#/account" onClick={() => sessionStorage.setItem('vh-admin-item', item.id)}>⬆️ Upload the HTML for this {itemWord(section.id).toLowerCase()}</a>}
          </div>
        )}
        {entry && err && <div className="empty"><span>⚠️</span><h2>Could not open this file</h2><p>{err}</p></div>}
        {entry && !err && html == null && <p className="muted">Opening…</p>}
        {entry && html != null && <HtmlFrame html={html} title={title} />}
        <div className="pager">
          {prev ? <a className="pill-btn" href={`#/item/${prev.id}`}>← {prev.title}</a> : <a className="pill-btn" href={`#/s/${section.id}/${unit.id}`}>← {unit.name}</a>}
          {next ? <a className="pill-btn" href={`#/item/${next.id}`}>{next.title} →</a> : <a className="pill-btn" href={`#/s/${section.id}/${unit.id}`}>{unit.name} →</a>}
        </div>
      </section>
    </>
  );
}
